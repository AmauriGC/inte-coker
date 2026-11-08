package com.gc.back.notificacion.service;

import com.gc.back.common.exception.RecursoNoEncontradoException;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.correo.dto.AvisoCorreo;
import com.gc.back.notificacion.dto.NotificacionResponse;
import com.gc.back.notificacion.entity.Notificacion;
import com.gc.back.notificacion.repository.NotificacionRepository;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.entity.Usuario;
import com.gc.back.usuario.repository.UsuarioRepository;
import com.gc.back.usuario.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Bandeja de avisos de cada cuenta. Cada {@link AvisoCorreo} que publica un módulo también se
 * guarda aquí, en la misma transacción: si la operación se deshace, el aviso tampoco queda.
 */
@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    @EventListener
    @Transactional
    public void alAvisar(AvisoCorreo aviso) {
        usuarioRepository.findByEmail(UsuarioService.normalizarEmail(aviso.email()))
                .ifPresent(u -> crear(u, aviso.tipo() != null ? aviso.tipo() : tipoDe(aviso.ruta()),
                        aviso.titulo(), aviso.texto(), aviso.ruta()));
    }

    @Transactional
    public void crear(Usuario usuario, String tipo, String titulo, String texto, String ruta) {
        Notificacion n = new Notificacion();
        n.setUsuario(usuario);
        n.setTipo(tipo);
        n.setTitulo(recortar(titulo, 150));
        n.setTexto(recortar(texto, 500));
        n.setRuta(recortar(ruta, 200));
        notificacionRepository.saveAndFlush(n);
        notificacionRepository.recortar(usuario.getId(), Notificacion.MAXIMO);
    }

    @Transactional(readOnly = true)
    public PaginaResponse<NotificacionResponse> listar(boolean soloSinLeer, Pageable pageable, UsuarioPrincipal actual) {
        Page<Notificacion> pagina = soloSinLeer
                ? notificacionRepository.findByUsuarioIdAndLeidaFalse(actual.id(), pageable)
                : notificacionRepository.findByUsuarioId(actual.id(), pageable);
        return PaginaResponse.desde(pagina.map(NotificacionResponse::desde));
    }

    @Transactional(readOnly = true)
    public long sinLeer(UsuarioPrincipal actual) {
        return notificacionRepository.countByUsuarioIdAndLeidaFalse(actual.id());
    }

    @Transactional
    public NotificacionResponse marcarLeida(Long id, UsuarioPrincipal actual) {
        Notificacion n = propia(id, actual);
        n.setLeida(true);
        return NotificacionResponse.desde(n);
    }

    @Transactional
    public void marcarTodas(UsuarioPrincipal actual) {
        notificacionRepository.marcarTodas(actual.id());
    }

    @Transactional
    public void eliminar(Long id, UsuarioPrincipal actual) {
        notificacionRepository.delete(propia(id, actual));
    }

    @Transactional
    public void vaciar(UsuarioPrincipal actual) {
        notificacionRepository.vaciar(actual.id());
    }

    private Notificacion propia(Long id, UsuarioPrincipal actual) {
        return notificacionRepository.findByIdAndUsuarioId(id, actual.id())
                .orElseThrow(() -> new RecursoNoEncontradoException("El aviso no existe"));
    }

    /** Icono según a dónde lleva el aviso. */
    static String tipoDe(String ruta) {
        if (ruta == null) {
            return "info";
        }
        if (ruta.startsWith("/pedidos") || ruta.startsWith("/panel/pedidos") || ruta.startsWith("/entregas")) {
            return "pedido";
        }
        if (ruta.startsWith("/mueble/")) {
            return ruta.endsWith("/resenas") ? "novedad" : "mueble";
        }
        return "info";
    }

    private static String recortar(String texto, int maximo) {
        if (texto == null) {
            return null;
        }
        return texto.length() <= maximo ? texto : texto.substring(0, maximo - 1) + "…";
    }
}
