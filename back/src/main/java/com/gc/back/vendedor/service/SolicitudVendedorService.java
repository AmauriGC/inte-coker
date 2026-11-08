package com.gc.back.vendedor.service;

import com.gc.back.common.exception.RecursoNoEncontradoException;
import com.gc.back.common.exception.ReglaNegocioException;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.correo.dto.AvisoCorreo;
import com.gc.back.rol.entity.PermisoBase;
import com.gc.back.rol.entity.RolBase;
import com.gc.back.rol.service.RolService;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.entity.Usuario;
import com.gc.back.usuario.repository.UsuarioRepository;
import com.gc.back.usuario.service.UsuarioService;
import com.gc.back.vendedor.dto.RechazoRequest;
import com.gc.back.vendedor.dto.SolicitudVendedorRequest;
import com.gc.back.vendedor.dto.SolicitudVendedorResponse;
import com.gc.back.vendedor.entity.EstadoSolicitud;
import com.gc.back.vendedor.entity.SolicitudVendedor;
import com.gc.back.vendedor.repository.SolicitudVendedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Cómo un cliente se vuelve vendedor: la pide desde su cuenta y un administrador la revisa.
 * - Una pendiente a la vez y nunca si ya vende.
 * - Al aprobar se suma el rol Vendedor (los demás roles se quedan) y, si no tenía, su ciudad.
 * - Los administradores se enteran al llegar una; quien la pidió, al revisarla.
 */
@Service
@RequiredArgsConstructor
public class SolicitudVendedorService {

    private final SolicitudVendedorRepository solicitudRepository;
    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final RolService rolService;
    private final ApplicationEventPublisher eventos;

    /** La última solicitud de la cuenta o null si nunca pidió. */
    @Transactional(readOnly = true)
    public SolicitudVendedorResponse mia(UsuarioPrincipal actual) {
        return solicitudRepository.findFirstByUsuarioIdOrderByIdDesc(actual.id())
                .map(SolicitudVendedorResponse::desde)
                .orElse(null);
    }

    @Transactional
    public SolicitudVendedorResponse crear(SolicitudVendedorRequest request, UsuarioPrincipal actual) {
        Usuario yo = usuarioService.obtenerEntidad(actual.id());
        if (tieneRol(yo, RolBase.VENDEDOR)) {
            throw new ReglaNegocioException("Tu cuenta ya puede vender");
        }
        if (solicitudRepository.existsByUsuarioIdAndEstado(yo.getId(), EstadoSolicitud.PENDIENTE)) {
            throw new ReglaNegocioException("Ya tienes una solicitud en revisión");
        }
        SolicitudVendedor s = new SolicitudVendedor();
        s.setUsuario(yo);
        s.setCiudad(request.ciudad().trim());
        s.setTelefono(request.telefono().trim());
        s.setMensaje(request.mensaje().trim());
        solicitudRepository.save(s);

        List<Usuario> admins = usuarioRepository.activosConPermiso(PermisoBase.USUARIO_GESTIONAR.name());
        for (Usuario admin : admins) {
            eventos.publishEvent(new AvisoCorreo(admin.getEmail(), admin.getNombre(),
                    "Nueva solicitud para vender", yo.getNombre() + " quiere vender",
                    "Desde %s: %s".formatted(s.getCiudad(), s.getMensaje()),
                    "Revisar la solicitud", "/panel/solicitudes", "info"));
        }
        return SolicitudVendedorResponse.desde(s);
    }

    @Transactional(readOnly = true)
    public PaginaResponse<SolicitudVendedorResponse> listar(EstadoSolicitud estado, Pageable pageable) {
        Page<SolicitudVendedor> pagina = estado == null
                ? solicitudRepository.findAllBy(pageable)
                : solicitudRepository.findByEstado(estado, pageable);
        return PaginaResponse.desde(pagina.map(SolicitudVendedorResponse::desde));
    }

    @Transactional
    public SolicitudVendedorResponse aprobar(Long id, UsuarioPrincipal actual) {
        SolicitudVendedor s = pendiente(id);
        Usuario u = s.getUsuario();
        u.getRoles().addAll(rolService.buscarPorNombres(List.of(RolBase.VENDEDOR.name())));
        if (u.getCiudad() == null || u.getCiudad().isBlank()) {
            u.setCiudad(s.getCiudad());
        }
        revisar(s, EstadoSolicitud.APROBADA, null, actual);
        eventos.publishEvent(new AvisoCorreo(u.getEmail(), u.getNombre(), "Ya puedes vender en GC-Confort",
                "Tu solicitud fue aprobada",
                "Ya puedes publicar tus muebles con 3D y atender tus pedidos. Empieza por tu perfil de vendedor.",
                "Ir a mi panel", "/panel/perfil", "exito"));
        return SolicitudVendedorResponse.desde(s);
    }

    @Transactional
    public SolicitudVendedorResponse rechazar(Long id, RechazoRequest request, UsuarioPrincipal actual) {
        SolicitudVendedor s = pendiente(id);
        Usuario u = s.getUsuario();
        revisar(s, EstadoSolicitud.RECHAZADA, request.motivo().trim(), actual);
        eventos.publishEvent(new AvisoCorreo(u.getEmail(), u.getNombre(), "Tu solicitud para vender",
                "Tu solicitud no fue aprobada", "Motivo: " + s.getMotivo() + " Puedes volver a pedirlo cuando quieras.",
                "Ver mi solicitud", "/cuenta/vender", "info"));
        return SolicitudVendedorResponse.desde(s);
    }

    private SolicitudVendedor pendiente(Long id) {
        SolicitudVendedor s = solicitudRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("La solicitud no existe"));
        if (s.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new ReglaNegocioException("Esa solicitud ya se revisó");
        }
        return s;
    }

    private void revisar(SolicitudVendedor s, EstadoSolicitud estado, String motivo, UsuarioPrincipal actual) {
        s.setEstado(estado);
        s.setMotivo(motivo);
        s.setRevisadoPor(usuarioService.obtenerEntidad(actual.id()));
        s.setRevisadoEn(Instant.now());
    }

    private static boolean tieneRol(Usuario u, RolBase rol) {
        return u.getRoles().stream().anyMatch(r -> rol.name().equals(r.getNombre()));
    }
}
