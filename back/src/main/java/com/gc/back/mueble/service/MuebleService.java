package com.gc.back.mueble.service;

import com.gc.back.archivo.entity.TipoArchivo;
import com.gc.back.archivo.service.AlmacenamientoService;
import com.gc.back.categoria.service.CategoriaService;
import com.gc.back.common.exception.RecursoNoEncontradoException;
import com.gc.back.common.exception.ReglaNegocioException;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.common.util.Slug;
import com.gc.back.mueble.dto.FiltroCatalogoRequest;
import com.gc.back.mueble.dto.MueblePublicacionRequest;
import com.gc.back.mueble.dto.MuebleRequest;
import com.gc.back.mueble.dto.MuebleResponse;
import com.gc.back.mueble.dto.VarianteRequest;
import com.gc.back.mueble.entity.Mueble;
import com.gc.back.mueble.entity.VarianteColor;
import com.gc.back.mueble.exception.MuebleAjenoException;
import com.gc.back.mueble.repository.MuebleRepository;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.service.UsuarioService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MuebleService {

    private static final int LARGO_SLUG = 120;
    private static final int MAX_EXISTENCIAS = 9999;

    private final MuebleRepository muebleRepository;
    private final CategoriaService categoriaService;
    private final UsuarioService usuarioService;
    private final AlmacenamientoService almacenamientoService;
    private final EntityManager entityManager;
    private final List<ReglaBorradoMueble> reglasBorrado;

    @Transactional(readOnly = true)
    public PaginaResponse<MuebleResponse> listarPublicados(FiltroCatalogoRequest filtro, Pageable pageable) {
        if (filtro.precioMin() != null && filtro.precioMax() != null
                && filtro.precioMin().compareTo(filtro.precioMax()) > 0) {
            throw new ReglaNegocioException("El precio mínimo no puede ser mayor que el máximo");
        }
        return PaginaResponse.desde(muebleRepository.buscarPublicados(
                filtro.categoriaId(), texto(filtro.buscar()), filtro.precioMin(), filtro.precioMax(), pageable)
                .map(MuebleResponse::desde));
    }

    /** Detalle por slug. Un borrador solo lo ven su vendedor y el administrador. */
    @Transactional(readOnly = true)
    public MuebleResponse obtenerPorSlug(String slug, UsuarioPrincipal actual) {
        Mueble mueble = muebleRepository.findBySlug(slug)
                .filter(m -> m.isPublicado() || puedeModificar(m, actual))
                .orElseThrow(() -> new RecursoNoEncontradoException("El mueble no existe"));
        return MuebleResponse.desde(mueble);
    }

    /** Panel: el vendedor ve los suyos; el administrador ve todos. */
    @Transactional(readOnly = true)
    public PaginaResponse<MuebleResponse> listarGestion(String buscar, Pageable pageable, UsuarioPrincipal actual) {
        Long vendedorId = actual.esAdmin() ? null : actual.id();
        return PaginaResponse.desde(muebleRepository.buscarGestion(vendedorId, texto(buscar), pageable)
                .map(MuebleResponse::desde));
    }

    /** Crea el mueble como borrador; se publica cuando tenga modelo 3D e imagen. */
    @Transactional
    public MuebleResponse crear(MuebleRequest request, UsuarioPrincipal actual) {
        Mueble mueble = new Mueble();
        mueble.setVendedor(usuarioService.obtenerEntidad(actual.id()));
        mueble.setPublicado(false);
        aplicar(mueble, request);
        return MuebleResponse.desde(muebleRepository.save(mueble));
    }

    @Transactional
    public MuebleResponse actualizar(Long id, MuebleRequest request, UsuarioPrincipal actual) {
        Mueble mueble = obtenerPropio(id, actual);
        aplicar(mueble, request);
        return MuebleResponse.desde(mueble);
    }

    @Transactional
    public MuebleResponse cambiarPublicacion(Long id, MueblePublicacionRequest request, UsuarioPrincipal actual) {
        Mueble mueble = obtenerPropio(id, actual);
        if (request.publicado() && !mueble.listoParaPublicar()) {
            throw new ReglaNegocioException("Sube el modelo 3D y la imagen antes de publicar el mueble");
        }
        mueble.setPublicado(request.publicado());
        return MuebleResponse.desde(mueble);
    }

    @Transactional
    public MuebleResponse subirArchivo(Long id, MultipartFile archivo, TipoArchivo tipo, UsuarioPrincipal actual) {
        Mueble mueble = obtenerPropio(id, actual);
        String ruta = almacenamientoService.guardar(carpeta(mueble), prefijo(tipo), archivo, tipo);
        reemplazarRuta(mueble, ruta, tipo);
        return MuebleResponse.desde(mueble);
    }

    @Transactional
    public void eliminar(Long id, UsuarioPrincipal actual) {
        Mueble mueble = obtenerPropio(id, actual);
        reglasBorrado.forEach(regla -> regla.validarBorrado(mueble));
        String carpeta = carpeta(mueble);
        muebleRepository.delete(mueble);
        muebleRepository.flush();
        almacenamientoService.eliminarCarpeta(carpeta);
    }

    /** Para otros módulos (favorito): el mueble publicado o 404. */
    @Transactional(readOnly = true)
    public Mueble obtenerPublicado(Long id) {
        return muebleRepository.findWithRelacionesById(id)
                .filter(Mueble::isPublicado)
                .orElseThrow(() -> new RecursoNoEncontradoException("El mueble no existe"));
    }

    /** Para otros módulos (favorito): los publicados de la lista; los demás ids se ignoran. */
    @Transactional(readOnly = true)
    public List<Mueble> obtenerPublicados(Collection<Long> ids) {
        return ids.isEmpty() ? List.of() : muebleRepository.findAllByIdInAndPublicadoTrue(ids);
    }

    /**
     * Para el módulo pedido: descuenta existencias al aceptar. Bloquea la fila hasta el commit
     * y la vuelve a leer, así dos aceptaciones a la vez no dejan existencias negativas.
     * Falla con 400 si ya no alcanzan (otro pedido se las llevó primero).
     */
    @Transactional
    public void descontarExistencias(Mueble mueble, Long varianteId, String varianteNombre, int cantidad) {
        entityManager.refresh(mueble, LockModeType.PESSIMISTIC_WRITE);
        if (!mueble.tieneVariantes()) {
            if (mueble.getExistencias() < cantidad) {
                throw new ReglaNegocioException("Ya no hay existencias suficientes: quedan " + mueble.getExistencias());
            }
            mueble.setExistencias(mueble.getExistencias() - cantidad);
            return;
        }
        VarianteColor variante = variante(mueble, varianteId).orElseThrow(() -> new ReglaNegocioException(
                varianteNombre == null
                        ? "Este mueble ahora se vende por color y el pedido no tiene uno; recházalo para que el cliente elija"
                        : "El color " + varianteNombre + " ya no está disponible"));
        if (variante.getExistencias() < cantidad) {
            throw new ReglaNegocioException("Ya no hay existencias suficientes en " + variante.getNombre()
                    + ": quedan " + variante.getExistencias());
        }
        variante.setExistencias(variante.getExistencias() - cantidad);
        mueble.recalcularExistencias();
    }

    /**
     * Para el módulo pedido: devuelve existencias al cancelar un pedido aceptado. Si el color
     * del pedido ya no existe y el mueble sigue vendiéndose por color, no hay a dónde devolverlas.
     */
    @Transactional
    public void devolverExistencias(Mueble mueble, Long varianteId, int cantidad) {
        entityManager.refresh(mueble, LockModeType.PESSIMISTIC_WRITE);
        if (!mueble.tieneVariantes()) {
            mueble.setExistencias(Math.min(mueble.getExistencias() + cantidad, MAX_EXISTENCIAS));
            return;
        }
        variante(mueble, varianteId).ifPresent(v -> {
            v.setExistencias(Math.min(v.getExistencias() + cantidad, MAX_EXISTENCIAS));
            mueble.recalcularExistencias();
        });
    }

    /** El color del mueble con ese id, si existe. */
    public static Optional<VarianteColor> variante(Mueble mueble, Long varianteId) {
        return varianteId == null ? Optional.empty()
                : mueble.getVariantes().stream().filter(v -> v.getId().equals(varianteId)).findFirst();
    }

    /** Reemplaza los colores de un mueble (lo usa la semilla del catálogo). */
    @Transactional
    void reemplazarColores(Mueble mueble, List<VarianteRequest> colores) {
        aplicarVariantes(mueble, colores);
    }

    /** Adjunta un archivo ya leído (lo usa la semilla del catálogo). */
    @Transactional
    void adjuntar(Mueble mueble, byte[] contenido, TipoArchivo tipo) {
        String ruta = almacenamientoService.guardar(carpeta(mueble), prefijo(tipo), contenido, tipo);
        reemplazarRuta(mueble, ruta, tipo);
    }

    private void reemplazarRuta(Mueble mueble, String rutaNueva, TipoArchivo tipo) {
        if (tipo == TipoArchivo.MODELO_3D) {
            almacenamientoService.eliminar(mueble.getModeloRuta());
            mueble.setModeloRuta(rutaNueva);
        } else {
            almacenamientoService.eliminar(mueble.getImagenRuta());
            mueble.setImagenRuta(rutaNueva);
        }
    }

    private Mueble obtenerPropio(Long id, UsuarioPrincipal actual) {
        Mueble mueble = muebleRepository.findWithRelacionesById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("El mueble no existe"));
        if (!puedeModificar(mueble, actual)) {
            throw new MuebleAjenoException();
        }
        return mueble;
    }

    private boolean puedeModificar(Mueble mueble, UsuarioPrincipal actual) {
        return actual != null && (actual.esAdmin() || mueble.getVendedor().getId().equals(actual.id()));
    }

    private void aplicar(Mueble mueble, MuebleRequest request) {
        mueble.setNombre(request.nombre().trim());
        mueble.setSlug(slugUnico(mueble.getNombre(), mueble.getId()));
        mueble.setDescripcion(StringUtils.hasText(request.descripcion()) ? request.descripcion().trim() : null);
        mueble.setPrecio(request.precio());
        mueble.setAnchoCm(request.anchoCm());
        mueble.setFondoCm(request.fondoCm());
        mueble.setAltoCm(request.altoCm());
        mueble.setMateriales(StringUtils.hasText(request.materiales()) ? request.materiales().trim() : null);
        mueble.setExistencias(request.existencias());
        mueble.setCategoria(categoriaService.obtenerEntidad(request.categoriaId()));
        aplicarVariantes(mueble, request.variantes() == null ? List.of() : request.variantes());
    }

    /**
     * Deja los colores del mueble como vienen en la petición: edita los que traen id,
     * crea los nuevos y quita los que faltan (los pedidos que los usaban conservan el nombre).
     */
    private void aplicarVariantes(Mueble mueble, List<VarianteRequest> pedidas) {
        Set<String> nombres = new HashSet<>();
        for (VarianteRequest v : pedidas) {
            if (!nombres.add(v.nombre().trim().toLowerCase(Locale.ROOT))) {
                throw new ReglaNegocioException("El color \"" + v.nombre().trim() + "\" está repetido");
            }
        }
        List<VarianteColor> nuevas = new ArrayList<>();
        for (int i = 0; i < pedidas.size(); i++) {
            VarianteRequest r = pedidas.get(i);
            VarianteColor v = variante(mueble, r.id()).orElseGet(() -> {
                VarianteColor nueva = new VarianteColor();
                nueva.setMueble(mueble);
                return nueva;
            });
            v.setNombre(r.nombre().trim());
            v.setHex(r.hex().toUpperCase(Locale.ROOT));
            v.setExistencias(r.existencias());
            v.setOrden(i);
            nuevas.add(v);
        }
        mueble.getVariantes().clear();
        mueble.getVariantes().addAll(nuevas);
        mueble.recalcularExistencias();
    }

    private String slugUnico(String nombre, Long idActual) {
        String base = Slug.de(nombre);
        if (base.length() > LARGO_SLUG) {
            base = base.substring(0, LARGO_SLUG);
        }
        String slug = base;
        int sufijo = 2;
        while (idActual == null
                ? muebleRepository.existsBySlug(slug)
                : muebleRepository.existsBySlugAndIdNot(slug, idActual)) {
            slug = base + "-" + sufijo++;
        }
        return slug;
    }

    private static String carpeta(Mueble mueble) {
        return "muebles/" + mueble.getId();
    }

    private static String prefijo(TipoArchivo tipo) {
        return tipo == TipoArchivo.MODELO_3D ? "modelo" : "imagen";
    }

    private static String texto(String valor) {
        return StringUtils.hasText(valor) ? valor.trim() : null;
    }
}
