package com.gc.back.resena.service;

import com.gc.back.common.exception.RecursoNoEncontradoException;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.correo.dto.AvisoCorreo;
import com.gc.back.mueble.entity.Mueble;
import com.gc.back.mueble.service.MuebleService;
import com.gc.back.pedido.entity.EstadoPedido;
import com.gc.back.pedido.entity.Pedido;
import com.gc.back.pedido.repository.PedidoRepository;
import com.gc.back.resena.dto.MeGustaResponse;
import com.gc.back.resena.dto.OcultarResenaRequest;
import com.gc.back.resena.dto.ResenaRequest;
import com.gc.back.resena.dto.ResenaResponse;
import com.gc.back.resena.dto.RespuestaRequest;
import com.gc.back.resena.dto.ResumenResenasResponse;
import com.gc.back.resena.entity.MeGusta;
import com.gc.back.resena.entity.Resena;
import com.gc.back.resena.exception.ResenaNoPermitidaException;
import com.gc.back.resena.repository.MeGustaRepository;
import com.gc.back.resena.repository.ResenaRepository;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.entity.Usuario;
import com.gc.back.usuario.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * "Me gusta" y reseñas. Los totales y el promedio se guardan en el mueble (para ordenar el
 * catálogo sin calcular en cada consulta) y se recalculan con un conteo cada vez que algo cambia.
 */
@Service
@RequiredArgsConstructor
public class ResenaService {

    private final ResenaRepository resenaRepository;
    private final MeGustaRepository meGustaRepository;
    private final PedidoRepository pedidoRepository;
    private final MuebleService muebleService;
    private final UsuarioService usuarioService;
    private final ApplicationEventPublisher eventos;

    // ------------------------------------------------------------------ me gusta

    @Transactional
    public MeGustaResponse darMeGusta(Long muebleId, UsuarioPrincipal actual) {
        Mueble mueble = muebleService.obtenerPublicado(muebleId);
        if (!meGustaRepository.existsByUsuarioIdAndMuebleId(actual.id(), muebleId)) {
            meGustaRepository.saveAndFlush(new MeGusta(usuarioService.obtenerEntidad(actual.id()), mueble));
        }
        return contarMeGusta(mueble, true);
    }

    @Transactional
    public MeGustaResponse quitarMeGusta(Long muebleId, UsuarioPrincipal actual) {
        Mueble mueble = muebleService.obtenerPublicado(muebleId);
        meGustaRepository.deleteByUsuarioIdAndMuebleId(actual.id(), muebleId);
        meGustaRepository.flush();
        return contarMeGusta(mueble, false);
    }

    private MeGustaResponse contarMeGusta(Mueble mueble, boolean meGusta) {
        mueble.setTotalMeGusta((int) meGustaRepository.countByMuebleId(mueble.getId()));
        return new MeGustaResponse(meGusta, mueble.getTotalMeGusta());
    }

    // ------------------------------------------------------------------ lectura pública

    /** orden: "recientes" (por defecto), "mejores" o "peores". */
    @Transactional(readOnly = true)
    public PaginaResponse<ResenaResponse> listar(Long muebleId, Integer estrellas, String orden, Pageable pageable,
                                                 UsuarioPrincipal actual) {
        muebleService.obtenerPublicado(muebleId);
        Sort sort = switch (orden == null ? "" : orden) {
            case "mejores" -> Sort.by(Sort.Order.desc("estrellas"), Sort.Order.desc("creadoEn"));
            case "peores" -> Sort.by(Sort.Order.asc("estrellas"), Sort.Order.desc("creadoEn"));
            default -> Sort.by(Sort.Order.desc("creadoEn"));
        };
        Pageable pagina = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        Long actualId = actual == null ? null : actual.id();
        return PaginaResponse.desde(resenaRepository.visibles(muebleId, estrellas, pagina)
                .map(r -> ResenaResponse.desde(r, actualId, false)));
    }

    @Transactional(readOnly = true)
    public ResumenResenasResponse resumen(Long muebleId, UsuarioPrincipal actual) {
        Mueble mueble = muebleService.obtenerPublicado(muebleId);
        Map<Integer, Long> conteo = resenaRepository.distribucion(muebleId).stream()
                .collect(Collectors.toMap(ResenaRepository.ConteoEstrellas::getEstrellas,
                        ResenaRepository.ConteoEstrellas::getTotal));
        List<ResumenResenasResponse.Barra> barras = new ArrayList<>();
        for (int e = 5; e >= 1; e--) {
            barras.add(new ResumenResenasResponse.Barra(e, conteo.getOrDefault(e, 0L)));
        }
        boolean meGusta = false;
        boolean puede = false;
        ResenaResponse mia = null;
        if (actual != null) {
            meGusta = meGustaRepository.existsByUsuarioIdAndMuebleId(actual.id(), muebleId);
            Optional<Resena> propia = resenaRepository.findByClienteIdAndMuebleId(actual.id(), muebleId);
            mia = propia.map(r -> ResenaResponse.desde(r, actual.id(), false)).orElse(null);
            puede = actual.permisos().contains("RESENA_CREAR") && entregado(actual.id(), muebleId).isPresent();
        }
        return new ResumenResenasResponse(mueble.getCalificacion(), mueble.getTotalResenas(), barras,
                mueble.getTotalMeGusta(), meGusta, puede, mia);
    }

    // ------------------------------------------------------------------ escribir

    /** Crea o edita la reseña propia. Solo con un pedido entregado de ese mueble. */
    @Transactional
    public ResenaResponse guardar(Long muebleId, ResenaRequest request, UsuarioPrincipal actual) {
        Mueble mueble = muebleService.obtenerPublicado(muebleId);
        Pedido pedido = entregado(actual.id(), muebleId).orElseThrow(() ->
                new ResenaNoPermitidaException("Solo puedes reseñar un mueble que ya recibiste"));
        Optional<Resena> existente = resenaRepository.findByClienteIdAndMuebleId(actual.id(), muebleId);
        Resena resena = existente.orElseGet(Resena::new);
        if (existente.isPresent()) {
            resena.setEditadaEn(Instant.now());
        } else {
            resena.setMueble(mueble);
            resena.setCliente(usuarioService.obtenerEntidad(actual.id()));
        }
        resena.setPedido(pedido);
        resena.setEstrellas(request.estrellas());
        resena.setTexto(limpio(request.texto()));
        resenaRepository.saveAndFlush(resena);
        recalcular(mueble);
        if (existente.isEmpty()) {
            avisarVendedor(mueble, resena);
        }
        return ResenaResponse.desde(resena, actual.id(), false);
    }

    /** El vendedor del mueble (o el administrador) responde; responder otra vez corrige la respuesta. */
    @Transactional
    public ResenaResponse responder(Long resenaId, RespuestaRequest request, UsuarioPrincipal actual) {
        Resena resena = obtener(resenaId);
        boolean esVendedor = resena.getMueble().getVendedor().getId().equals(actual.id());
        if (!esVendedor && !actual.esAdmin()) {
            throw new ResenaNoPermitidaException("Solo quien vende el mueble responde sus reseñas");
        }
        resena.setRespuesta(request.texto().trim());
        resena.setRespondidaEn(Instant.now());
        return ResenaResponse.desde(resena, actual.id(), true);
    }

    // ------------------------------------------------------------------ moderación

    @Transactional(readOnly = true)
    public PaginaResponse<ResenaResponse> moderacion(Boolean oculta, String buscar, Pageable pageable,
                                                     UsuarioPrincipal actual) {
        return PaginaResponse.desde(resenaRepository.moderacion(oculta, limpio(buscar), pageable)
                .map(r -> ResenaResponse.desde(r, actual.id(), true)));
    }

    @Transactional
    public ResenaResponse ocultar(Long resenaId, OcultarResenaRequest request, UsuarioPrincipal actual) {
        Resena resena = obtener(resenaId);
        resena.setOculta(request.oculta());
        resenaRepository.saveAndFlush(resena);
        recalcular(resena.getMueble());
        return ResenaResponse.desde(resena, actual.id(), true);
    }

    // ------------------------------------------------------------------ apoyo

    private Optional<Pedido> entregado(Long clienteId, Long muebleId) {
        return pedidoRepository.findFirstByClienteIdAndMuebleIdAndEstado(clienteId, muebleId, EstadoPedido.ENTREGADO);
    }

    private Resena obtener(Long id) {
        return resenaRepository.findDetalleById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("La reseña no existe"));
    }

    /** Total y promedio de las reseñas visibles, con un decimal. */
    private void recalcular(Mueble mueble) {
        long total = 0;
        long suma = 0;
        for (ResenaRepository.ConteoEstrellas c : resenaRepository.distribucion(mueble.getId())) {
            total += c.getTotal();
            suma += c.getTotal() * c.getEstrellas();
        }
        mueble.setTotalResenas((int) total);
        mueble.setCalificacion(total == 0 ? BigDecimal.ZERO.setScale(1)
                : BigDecimal.valueOf(suma).divide(BigDecimal.valueOf(total), 1, RoundingMode.HALF_UP));
    }

    private void avisarVendedor(Mueble mueble, Resena resena) {
        Usuario vendedor = mueble.getVendedor();
        String titulo = "Nueva reseña de " + mueble.getNombre();
        String texto = resena.getEstrellas() + " de 5 estrellas"
                + (resena.getTexto() == null ? "." : ": \"" + resena.getTexto() + "\"");
        eventos.publishEvent(new AvisoCorreo(vendedor.getEmail(), vendedor.getNombre(), titulo, titulo, texto,
                "Ver las reseñas", "/mueble/" + mueble.getSlug() + "/resenas"));
    }

    private static String limpio(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
