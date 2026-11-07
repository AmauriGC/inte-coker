package com.gc.back.vendedor.service;

import com.gc.back.archivo.entity.TipoArchivo;
import com.gc.back.archivo.service.AlmacenamientoService;
import com.gc.back.common.exception.RecursoNoEncontradoException;
import com.gc.back.common.exception.ReglaNegocioException;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.config.RecursosEstaticosConfig;
import com.gc.back.mueble.dto.MuebleResponse;
import com.gc.back.mueble.repository.MuebleRepository;
import com.gc.back.pedido.entity.EstadoPedido;
import com.gc.back.pedido.repository.PedidoRepository;
import com.gc.back.resena.repository.ResenaRepository;
import com.gc.back.rol.entity.RolBase;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.entity.Usuario;
import com.gc.back.usuario.repository.UsuarioRepository;
import com.gc.back.vendedor.dto.OrdenTrabajosRequest;
import com.gc.back.vendedor.dto.PerfilVendedorRequest;
import com.gc.back.vendedor.dto.PerfilVendedorResponse;
import com.gc.back.vendedor.dto.TrabajoRequest;
import com.gc.back.vendedor.dto.TrabajoResponse;
import com.gc.back.vendedor.entity.TrabajoVendedor;
import com.gc.back.vendedor.repository.TrabajoVendedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Perfil público de quien vende y su galería de trabajos. Tiene perfil una cuenta activa
 * con rol VENDEDOR o con al menos un mueble publicado (por ejemplo, el administrador que
 * sembró el catálogo).
 */
@Service
@RequiredArgsConstructor
public class VendedorService {

    private final UsuarioRepository usuarioRepository;
    private final MuebleRepository muebleRepository;
    private final PedidoRepository pedidoRepository;
    private final ResenaRepository resenaRepository;
    private final TrabajoVendedorRepository trabajoRepository;
    private final AlmacenamientoService almacenamiento;

    @Transactional(readOnly = true)
    public PerfilVendedorResponse perfil(String slug, UsuarioPrincipal actual) {
        return respuesta(vendedor(slug), actual);
    }

    @Transactional(readOnly = true)
    public PaginaResponse<MuebleResponse> muebles(String slug, Pageable pageable) {
        Usuario vendedor = vendedor(slug);
        return PaginaResponse.desde(muebleRepository.findByVendedorIdAndPublicadoTrue(vendedor.getId(), pageable)
                .map(MuebleResponse::desde));
    }

    @Transactional(readOnly = true)
    public List<TrabajoResponse> trabajos(String slug) {
        return trabajosDe(vendedor(slug).getId());
    }

    @Transactional(readOnly = true)
    public PerfilVendedorResponse miPerfil(UsuarioPrincipal actual) {
        return respuesta(yo(actual), actual);
    }

    @Transactional
    public PerfilVendedorResponse actualizar(PerfilVendedorRequest request, UsuarioPrincipal actual) {
        Usuario yo = yo(actual);
        yo.setBio(limpio(request.bio()));
        yo.setCiudad(limpio(request.ciudad()));
        return respuesta(yo, actual);
    }

    /** Sube o reemplaza la foto (portada = false) o la portada (portada = true). */
    @Transactional
    public PerfilVendedorResponse subirImagen(boolean portada, MultipartFile archivo, UsuarioPrincipal actual) {
        Usuario yo = yo(actual);
        String ruta = almacenamiento.guardar(carpeta(yo), portada ? "portada" : "foto", archivo, TipoArchivo.IMAGEN);
        almacenamiento.eliminar(portada ? yo.getPortadaRuta() : yo.getFotoRuta());
        if (portada) {
            yo.setPortadaRuta(ruta);
        } else {
            yo.setFotoRuta(ruta);
        }
        return respuesta(yo, actual);
    }

    @Transactional
    public PerfilVendedorResponse quitarImagen(boolean portada, UsuarioPrincipal actual) {
        Usuario yo = yo(actual);
        almacenamiento.eliminar(portada ? yo.getPortadaRuta() : yo.getFotoRuta());
        if (portada) {
            yo.setPortadaRuta(null);
        } else {
            yo.setFotoRuta(null);
        }
        return respuesta(yo, actual);
    }

    @Transactional
    public TrabajoResponse agregarTrabajo(TrabajoRequest request, MultipartFile archivo, UsuarioPrincipal actual) {
        Usuario yo = yo(actual);
        long total = trabajoRepository.countByVendedorId(yo.getId());
        if (total >= TrabajoVendedor.MAXIMO) {
            throw new ReglaNegocioException("Tu galería ya tiene " + TrabajoVendedor.MAXIMO
                    + " trabajos; borra uno para subir otro");
        }
        TrabajoVendedor trabajo = new TrabajoVendedor();
        trabajo.setVendedor(yo);
        trabajo.setTitulo(request.titulo().trim());
        trabajo.setDescripcion(limpio(request.descripcion()));
        trabajo.setOrden((int) total);
        trabajo.setImagenRuta(almacenamiento.guardar(carpeta(yo) + "/trabajos", "trabajo", archivo, TipoArchivo.IMAGEN));
        return TrabajoResponse.desde(trabajoRepository.save(trabajo));
    }

    @Transactional
    public TrabajoResponse editarTrabajo(Long id, TrabajoRequest request, UsuarioPrincipal actual) {
        TrabajoVendedor trabajo = miTrabajo(id, actual);
        trabajo.setTitulo(request.titulo().trim());
        trabajo.setDescripcion(limpio(request.descripcion()));
        return TrabajoResponse.desde(trabajo);
    }

    @Transactional
    public void eliminarTrabajo(Long id, UsuarioPrincipal actual) {
        TrabajoVendedor trabajo = miTrabajo(id, actual);
        trabajoRepository.delete(trabajo);
        almacenamiento.eliminar(trabajo.getImagenRuta());
    }

    /** Recibe todos mis trabajos en el orden nuevo; los ids deben ser exactamente los míos. */
    @Transactional
    public List<TrabajoResponse> ordenarTrabajos(OrdenTrabajosRequest request, UsuarioPrincipal actual) {
        Map<Long, TrabajoVendedor> mios = trabajoRepository.findByVendedorIdOrderByOrdenAscIdAsc(actual.id()).stream()
                .collect(Collectors.toMap(TrabajoVendedor::getId, Function.identity()));
        if (mios.size() != request.ids().size() || !mios.keySet().equals(new HashSet<>(request.ids()))) {
            throw new ReglaNegocioException("El orden debe incluir cada uno de tus trabajos una sola vez");
        }
        for (int i = 0; i < request.ids().size(); i++) {
            mios.get(request.ids().get(i)).setOrden(i);
        }
        return request.ids().stream().map(mios::get).map(TrabajoResponse::desde).toList();
    }

    private PerfilVendedorResponse respuesta(Usuario u, UsuarioPrincipal actual) {
        ResenaRepository.ResumenVendedor resenas = resenaRepository.resumenDeVendedor(u.getId());
        long totalResenas = resenas == null || resenas.getTotal() == null ? 0 : resenas.getTotal();
        BigDecimal calificacion = totalResenas == 0 || resenas.getPromedio() == null
                ? BigDecimal.ZERO.setScale(1)
                : BigDecimal.valueOf(resenas.getPromedio()).setScale(1, RoundingMode.HALF_UP);
        return new PerfilVendedorResponse(
                u.getId(), u.getNombre(), u.getSlug(), u.getBio(), u.getCiudad(),
                url(u.getFotoRuta()), url(u.getPortadaRuta()),
                calificacion, totalResenas,
                muebleRepository.countByVendedorIdAndPublicadoTrue(u.getId()),
                pedidoRepository.countByVendedorIdAndEstado(u.getId(), EstadoPedido.ENTREGADO),
                trabajoRepository.countByVendedorId(u.getId()),
                u.getCreadoEn().atZone(ZoneOffset.UTC).getYear(),
                actual != null && actual.id().equals(u.getId()));
    }

    private List<TrabajoResponse> trabajosDe(Long vendedorId) {
        return trabajoRepository.findByVendedorIdOrderByOrdenAscIdAsc(vendedorId).stream()
                .map(TrabajoResponse::desde).toList();
    }

    private Usuario vendedor(String slug) {
        return usuarioRepository.findBySlug(slug)
                .filter(Usuario::isActivo)
                .filter(u -> u.getRoles().stream().anyMatch(r -> RolBase.VENDEDOR.name().equals(r.getNombre()))
                        || muebleRepository.countByVendedorIdAndPublicadoTrue(u.getId()) > 0)
                .orElseThrow(() -> new RecursoNoEncontradoException("Este vendedor no existe"));
    }

    private Usuario yo(UsuarioPrincipal actual) {
        return usuarioRepository.findById(actual.id())
                .orElseThrow(() -> new RecursoNoEncontradoException("La cuenta no existe"));
    }

    private TrabajoVendedor miTrabajo(Long id, UsuarioPrincipal actual) {
        return trabajoRepository.findByIdAndVendedorId(id, actual.id())
                .orElseThrow(() -> new RecursoNoEncontradoException("El trabajo no existe"));
    }

    private static String carpeta(Usuario u) {
        return "usuarios/" + u.getId();
    }

    private static String limpio(String texto) {
        return StringUtils.hasText(texto) ? texto.trim() : null;
    }

    private static String url(String ruta) {
        return ruta == null ? null : RecursosEstaticosConfig.RUTA_PUBLICA + ruta;
    }
}
