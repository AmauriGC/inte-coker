package com.gc.back.pedido.service;

import com.gc.back.common.exception.RecursoNoEncontradoException;
import com.gc.back.common.exception.ReglaNegocioException;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.correo.dto.AvisoCorreo;
import com.gc.back.pedido.dto.EntregaResponse;
import com.gc.back.pedido.dto.NoEntregadaRequest;
import com.gc.back.pedido.dto.TransportistaResponse;
import com.gc.back.pedido.entity.MensajePedido;
import com.gc.back.pedido.entity.Pedido;
import com.gc.back.pedido.repository.MensajePedidoRepository;
import com.gc.back.pedido.repository.PedidoRepository;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.entity.Usuario;
import com.gc.back.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

import static com.gc.back.pedido.entity.EstadoPedido.ACEPTADO;
import static com.gc.back.pedido.entity.EstadoPedido.ENTREGADO;
import static com.gc.back.pedido.entity.EstadoPedido.EN_CAMINO;

/**
 * Entregas del transportista: solo ve los pedidos que le asignaron (404 a los demás).
 * "Entregado y cobrado" cierra el pedido; "No se pudo entregar" lo regresa a ACEPTADO y lo
 * libera para que el vendedor lo vuelva a enviar.
 */
@Service
@RequiredArgsConstructor
public class EntregaService {

    private final PedidoRepository pedidoRepository;
    private final MensajePedidoRepository mensajeRepository;
    private final UsuarioRepository usuarioRepository;
    private final ApplicationEventPublisher eventos;

    /** Para el vendedor: transportistas activos y cuántas entregas llevan ahora. */
    @Transactional(readOnly = true)
    public List<TransportistaResponse> transportistas() {
        return usuarioRepository.activosConPermiso(PedidoService.ENTREGAR).stream()
                .map(u -> new TransportistaResponse(u.getId(), u.getNombre(),
                        pedidoRepository.countByTransportistaIdAndEstado(u.getId(), EN_CAMINO)))
                .toList();
    }

    /** pendientes = las que van en camino; si no, las ya cerradas. */
    @Transactional(readOnly = true)
    public PaginaResponse<EntregaResponse> listar(boolean pendientes, Pageable pageable, UsuarioPrincipal actual) {
        Page<Pedido> pagina = pendientes
                ? pedidoRepository.findByTransportistaIdAndEstado(actual.id(), EN_CAMINO, pageable)
                : pedidoRepository.findByTransportistaIdAndEstadoNot(actual.id(), EN_CAMINO, pageable);
        return PaginaResponse.desde(pagina.map(EntregaResponse::desde));
    }

    @Transactional(readOnly = true)
    public EntregaResponse obtener(Long id, UsuarioPrincipal actual) {
        return EntregaResponse.desde(asignada(id, actual));
    }

    @Transactional
    public EntregaResponse entregar(Long id, UsuarioPrincipal actual) {
        Pedido p = enCamino(id, actual);
        Instant ahora = Instant.now();
        p.setEstado(ENTREGADO);
        p.setEntregadoEn(ahora);
        p.setCobradoEn(ahora);
        String texto = "%s entregó el pedido. Cobro: %s.".formatted(p.getTransportista().getNombre(), PedidoService.cobro(p));
        registrar(p, "Pedido " + p.getFolio() + ": entregado", texto);
        return EntregaResponse.desde(p);
    }

    @Transactional
    public EntregaResponse noEntregada(Long id, NoEntregadaRequest request, UsuarioPrincipal actual) {
        Pedido p = enCamino(id, actual);
        String texto = "%s no pudo entregar el pedido. Motivo: %s. El vendedor lo volverá a enviar."
                .formatted(p.getTransportista().getNombre(), request.motivo().trim());
        p.setEstado(ACEPTADO);
        p.setEnCaminoEn(null);
        p.setTransportista(null);
        p.setAsignadoEn(null);
        registrar(p, "Pedido " + p.getFolio() + ": no se pudo entregar", texto);
        // Ya no es suya: se responde sin datos de entrega.
        return EntregaResponse.desde(p);
    }

    private Pedido asignada(Long id, UsuarioPrincipal actual) {
        return pedidoRepository.findByIdAndTransportistaId(id, actual.id())
                .orElseThrow(() -> new RecursoNoEncontradoException("La entrega no existe"));
    }

    private Pedido enCamino(Long id, UsuarioPrincipal actual) {
        Pedido p = asignada(id, actual);
        if (p.getEstado() != EN_CAMINO) {
            throw new ReglaNegocioException("Esta entrega ya se cerró");
        }
        return p;
    }

    /** Mensaje del sistema en la conversación y aviso por correo al cliente y al vendedor. */
    private void registrar(Pedido p, String titulo, String texto) {
        mensajeRepository.save(new MensajePedido(p, null, texto));
        p.setActividadEn(Instant.now());
        avisar(p.getCliente(), titulo, texto, "/pedidos/" + p.getId());
        avisar(p.getVendedor(), titulo, texto, "/panel/pedidos/" + p.getId());
    }

    private void avisar(Usuario u, String titulo, String texto, String ruta) {
        eventos.publishEvent(new AvisoCorreo(u.getEmail(), u.getNombre(), titulo, titulo, texto, "Ver el pedido", ruta));
    }
}
