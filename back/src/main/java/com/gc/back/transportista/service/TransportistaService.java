package com.gc.back.transportista.service;

import com.gc.back.auth.entity.TipoTokenCorreo;
import com.gc.back.auth.service.TokenCorreoService;
import com.gc.back.common.exception.RecursoNoEncontradoException;
import com.gc.back.common.exception.ReglaNegocioException;
import com.gc.back.correo.service.CorreoService;
import com.gc.back.pedido.entity.EstadoPedido;
import com.gc.back.pedido.repository.PedidoRepository;
import com.gc.back.rol.entity.RolBase;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.transportista.dto.TransportistaRequest;
import com.gc.back.transportista.dto.TransportistaResponse;
import com.gc.back.usuario.entity.Usuario;
import com.gc.back.usuario.repository.UsuarioRepository;
import com.gc.back.usuario.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Los transportistas los registra cada vendedor y solo trabajan para él:
 * - La cuenta nace con el rol Transportista y sin verificar; le llega un correo para poner
 *   su contraseña (72 h). Hasta entonces no puede entrar ni recibir entregas.
 * - El vendedor solo ve, invita de nuevo y da de baja a los suyos (404 a los demás).
 * - No se da de baja a quien lleva entregas en camino.
 */
@Service
@RequiredArgsConstructor
public class TransportistaService {

    public static final int MAXIMO = 20;

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final TokenCorreoService tokenCorreoService;
    private final CorreoService correoService;

    @Transactional(readOnly = true)
    public List<TransportistaResponse> listar(UsuarioPrincipal actual) {
        return usuarioRepository.findByEmpleadorIdOrderByNombre(actual.id()).stream()
                .map(this::respuesta)
                .toList();
    }

    @Transactional
    public TransportistaResponse crear(TransportistaRequest request, UsuarioPrincipal actual) {
        if (usuarioRepository.countByEmpleadorId(actual.id()) >= MAXIMO) {
            throw new ReglaNegocioException("Puedes registrar hasta " + MAXIMO + " transportistas");
        }
        Usuario vendedor = usuarioService.obtenerEntidad(actual.id());
        // Contraseña al azar que nadie conoce: la real la pone con el enlace de la invitación.
        Usuario t = usuarioService.crear(request.nombre(), request.email(), UUID.randomUUID() + "Aa1",
                Set.of(RolBase.TRANSPORTISTA.name()), false);
        t.setTelefono(request.telefono().trim());
        t.setEmpleador(vendedor);
        invitar(t, vendedor);
        return respuesta(t);
    }

    @Transactional
    public TransportistaResponse reenviarInvitacion(Long id, UsuarioPrincipal actual) {
        Usuario t = propio(id, actual);
        if (t.isVerificado()) {
            throw new ReglaNegocioException("Ya activó su cuenta");
        }
        invitar(t, usuarioService.obtenerEntidad(actual.id()));
        return respuesta(t);
    }

    @Transactional
    public TransportistaResponse cambiarActivo(Long id, boolean activo, UsuarioPrincipal actual) {
        Usuario t = propio(id, actual);
        if (!activo && enCamino(t) > 0) {
            throw new ReglaNegocioException("Lleva entregas en camino; espera a que las cierre");
        }
        t.setActivo(activo);
        return respuesta(t);
    }

    private void invitar(Usuario t, Usuario vendedor) {
        String token = tokenCorreoService.generar(t, TipoTokenCorreo.INVITACION);
        correoService.enviarInvitacion(t.getEmail(), t.getNombre(), vendedor.getNombre(), token);
    }

    private Usuario propio(Long id, UsuarioPrincipal actual) {
        return usuarioRepository.findByIdAndEmpleadorId(id, actual.id())
                .orElseThrow(() -> new RecursoNoEncontradoException("El transportista no existe"));
    }

    private long enCamino(Usuario t) {
        return pedidoRepository.countByTransportistaIdAndEstado(t.getId(), EstadoPedido.EN_CAMINO);
    }

    private TransportistaResponse respuesta(Usuario t) {
        return TransportistaResponse.desde(t, enCamino(t));
    }
}
