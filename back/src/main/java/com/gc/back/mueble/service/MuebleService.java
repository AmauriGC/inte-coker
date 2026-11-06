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
import com.gc.back.mueble.entity.Mueble;
import com.gc.back.mueble.exception.MuebleAjenoException;
import com.gc.back.mueble.repository.MuebleRepository;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class MuebleService {

    private static final int LARGO_SLUG = 120;

    private final MuebleRepository muebleRepository;
    private final CategoriaService categoriaService;
    private final UsuarioService usuarioService;
    private final AlmacenamientoService almacenamientoService;

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
        String carpeta = carpeta(mueble);
        muebleRepository.delete(mueble);
        muebleRepository.flush();
        almacenamientoService.eliminarCarpeta(carpeta);
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
        mueble.setCategoria(categoriaService.obtenerEntidad(request.categoriaId()));
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
