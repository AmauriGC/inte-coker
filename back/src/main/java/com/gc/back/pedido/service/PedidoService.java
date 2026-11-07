package com.gc.back.pedido.service;

import com.gc.back.common.exception.RecursoNoEncontradoException;
import com.gc.back.common.exception.ReglaNegocioException;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.correo.dto.AvisoCorreo;
import com.gc.back.mueble.entity.Mueble;
import com.gc.back.mueble.entity.VarianteColor;
import com.gc.back.mueble.service.MuebleService;
import com.gc.back.pedido.dto.CambioEstadoRequest;
import com.gc.back.pedido.dto.ConfirmarApartadoRequest;
import com.gc.back.pedido.dto.ConsultaRequest;
import com.gc.back.pedido.dto.ConteoSinLeer;
import com.gc.back.pedido.dto.DatosSolicitud;
import com.gc.back.pedido.dto.MensajeRequest;
import com.gc.back.pedido.dto.MensajeResponse;
import com.gc.back.pedido.dto.PedidoRequest;
import com.gc.back.pedido.dto.PedidoResponse;
import com.gc.back.pedido.dto.PedidoResponse.Lado;
import com.gc.back.pedido.dto.ResumenPedidosResponse;
import com.gc.back.pedido.dto.SolicitudRequest;
import com.gc.back.pedido.entity.EstadoPedido;
import com.gc.back.pedido.entity.MensajePedido;
import com.gc.back.pedido.entity.Pedido;
import com.gc.back.pedido.entity.TipoEntrega;
import com.gc.back.pedido.exception.AccionPedidoNoPermitidaException;
import com.gc.back.pedido.repository.MensajePedidoRepository;
import com.gc.back.pedido.repository.PedidoRepository;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.entity.Usuario;
import com.gc.back.usuario.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static com.gc.back.pedido.entity.EstadoPedido.ACEPTADO;
import static com.gc.back.pedido.entity.EstadoPedido.APARTADO;
import static com.gc.back.pedido.entity.EstadoPedido.CANCELADO;
import static com.gc.back.pedido.entity.EstadoPedido.CONSULTA;
import static com.gc.back.pedido.entity.EstadoPedido.ENTREGADO;
import static com.gc.back.pedido.entity.EstadoPedido.EN_CAMINO;
import static com.gc.back.pedido.entity.EstadoPedido.RECHAZADO;
import static com.gc.back.pedido.entity.EstadoPedido.SOLICITADO;
import static com.gc.back.pedido.entity.EstadoPedido.VENCIDO;

/**
 * Pedidos y su conversación. Reglas:
 * - Solo muebles publicados y nunca el propio; una sola consulta abierta por cliente y mueble.
 * - Quien no participa (ni supervisa) recibe 404: no se revela que el pedido existe.
 * - Las existencias se revisan al pedir y se descuentan al aceptar; vuelven si se cancela
 *   un pedido aceptado.
 * - Cada cambio de estado deja un mensaje del sistema y avisa por correo al otro lado.
 */
@Service
@RequiredArgsConstructor
public class PedidoService {

    private static final String CREAR = "PEDIDO_CREAR";
    private static final String ATENDER = "PEDIDO_ATENDER";
    private static final String SUPERVISAR = "PEDIDO_SUPERVISAR";
    private static final Locale MX = Locale.forLanguageTag("es-MX");
    private static final int MAX_APARTADOS = 3;
    private static final ZoneId ZONA = ZoneId.of("America/Mexico_City");
    private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("d 'de' MMMM, h:mm a", MX);

    private final PedidoRepository pedidoRepository;
    private final MensajePedidoRepository mensajeRepository;
    private final MuebleService muebleService;
    private final UsuarioService usuarioService;
    private final ApplicationEventPublisher eventos;

    // ---------- Crear ----------

    /** "Preguntar": abre una consulta o agrega la pregunta a la que ya estaba abierta. */
    @Transactional
    public PedidoResponse preguntar(ConsultaRequest request, UsuarioPrincipal actual) {
        Mueble mueble = muebleParaPedir(request.muebleId(), actual);
        Pedido pedido = consultaAbierta(actual, mueble);
        boolean nueva = pedido == null;
        if (nueva) {
            pedido = pedidoRepository.save(nuevo(mueble, usuarioService.obtenerEntidad(actual.id())));
        }
        String pregunta = request.mensaje().trim();
        agregarMensaje(pedido, pedido.getCliente(), pregunta, actual);
        if (nueva) {
            avisar(pedido.getVendedor(), pedido, "Nueva pregunta sobre " + pedido.getMuebleNombre(),
                    pedido.getCliente().getNombre() + " preguntó por " + pedido.getMuebleNombre() + ".", pregunta);
        }
        return respuesta(pedido, actual);
    }

    /** "Comprar": crea el pedido o convierte la consulta abierta de ese mueble. */
    @Transactional
    public PedidoResponse pedir(PedidoRequest request, UsuarioPrincipal actual) {
        Mueble mueble = muebleParaPedir(request.muebleId(), actual);
        Pedido pedido = consultaAbierta(actual, mueble);
        if (pedido == null) {
            pedido = pedidoRepository.save(nuevo(mueble, usuarioService.obtenerEntidad(actual.id())));
        }
        solicitar(pedido, mueble, request, actual);
        return respuesta(pedido, actual);
    }

    /** Convierte una consulta en pedido, con cantidad y datos de entrega. */
    @Transactional
    public PedidoResponse solicitar(Long id, SolicitudRequest request, UsuarioPrincipal actual) {
        Pedido pedido = obtenerVisible(id, actual);
        if (!comoCliente(pedido, actual)) {
            throw new AccionPedidoNoPermitidaException("Solo quien hizo la consulta puede convertirla en pedido");
        }
        if (pedido.getEstado() != CONSULTA) {
            throw new ReglaNegocioException("Este pedido ya no es una consulta");
        }
        Mueble mueble = pedido.getMueble();
        if (mueble == null || !mueble.isPublicado()) {
            throw new ReglaNegocioException("El mueble ya no está disponible");
        }
        solicitar(pedido, mueble, request, actual);
        return respuesta(pedido, actual);
    }

    // ---------- Apartados ----------

    /** El vendedor confirma que recibió el anticipo: las piezas se reservan hasta la fecha límite. */
    @Transactional
    public PedidoResponse confirmarApartado(Long id, ConfirmarApartadoRequest request, UsuarioPrincipal actual) {
        Pedido pedido = obtenerVisible(id, actual);
        if (!acciones(pedido, actual).contains(APARTADO)) {
            throw pedido.isApartado() && pedido.getEstado() == SOLICITADO
                    ? new AccionPedidoNoPermitidaException(quienPuede(APARTADO))
                    : new ReglaNegocioException("Este pedido no espera un anticipo");
        }
        if (request.anticipo().compareTo(pedido.getTotal()) >= 0) {
            throw new ReglaNegocioException("El anticipo debe ser menor que el total (" + dinero(pedido.getTotal())
                    + "); si ya pagó todo, acepta el pedido");
        }
        if (pedido.getMueble() == null) {
            throw new ReglaNegocioException("El mueble ya no existe");
        }
        muebleService.descontarExistencias(pedido.getMueble(), idVariante(pedido), pedido.getVarianteNombre(),
                pedido.getCantidad());
        Instant ahora = Instant.now();
        pedido.setAnticipo(request.anticipo());
        pedido.setApartadoEn(ahora);
        pedido.setApartadoHasta(ahora.plus(Duration.ofDays(request.dias())));
        pedido.setEstado(APARTADO);
        String texto = "Apartado confirmado: anticipo de %s. Resta %s; liquida antes del %s.".formatted(
                dinero(request.anticipo()), dinero(pedido.getTotal().subtract(request.anticipo())),
                fecha(pedido.getApartadoHasta()));
        agregarMensaje(pedido, null, texto, actual);
        avisarCambio(pedido, texto, actual);
        return respuesta(pedido, actual);
    }

    /** Tarea programada: vence los apartados pasados de fecha y devuelve sus piezas. */
    @Transactional
    public int vencerApartados(Instant ahora) {
        List<Pedido> vencidos = pedidoRepository.findByEstadoAndApartadoHastaBefore(APARTADO, ahora);
        for (Pedido p : vencidos) {
            if (p.getMueble() != null) {
                muebleService.devolverExistencias(p.getMueble(), idVariante(p), p.getCantidad());
            }
            p.setEstado(VENCIDO);
            p.setCerradoEn(ahora);
            p.setMotivoCierre("No se liquidó antes de la fecha límite");
            String texto = "El apartado venció sin liquidarse; las piezas regresaron al inventario.";
            mensajeDelSistema(p, texto);
            String titulo = "Apartado " + p.getFolio() + " vencido";
            avisar(p.getCliente(), p, titulo, titulo, texto);
            avisar(p.getVendedor(), p, titulo, titulo, texto);
        }
        return vencidos.size();
    }

    /** Tarea programada: avisa una vez al cliente cuando le quedan menos de 24 horas. */
    @Transactional
    public int avisarApartadosPorVencer(Instant ahora) {
        List<Pedido> porVencer = pedidoRepository.findByEstadoAndAvisoVencimientoFalseAndApartadoHastaBefore(
                APARTADO, ahora.plus(Duration.ofHours(24)));
        for (Pedido p : porVencer) {
            p.setAvisoVencimiento(true);
            String texto = "Quedan menos de 24 horas para liquidar el apartado (vence el %s)."
                    .formatted(fecha(p.getApartadoHasta()));
            mensajeDelSistema(p, texto);
            String titulo = "Tu apartado " + p.getFolio() + " está por vencer";
            avisar(p.getCliente(), p, titulo, titulo, texto);
        }
        return porVencer.size();
    }

    private void mensajeDelSistema(Pedido pedido, String texto) {
        mensajeRepository.save(new MensajePedido(pedido, null, texto));
        pedido.setActividadEn(Instant.now());
    }

    private static String fecha(Instant instante) {
        return FECHA.format(instante.atZone(ZONA));
    }

    // ---------- Consultar ----------

    @Transactional(readOnly = true)
    public PaginaResponse<PedidoResponse> compras(EstadoPedido estado, Pageable pageable, UsuarioPrincipal actual) {
        return pagina(pedidoRepository.compras(actual.id(), estado, pageable), actual);
    }

    @Transactional(readOnly = true)
    public PaginaResponse<PedidoResponse> ventas(EstadoPedido estado, Pageable pageable, UsuarioPrincipal actual) {
        return pagina(pedidoRepository.ventas(actual.id(), estado, pageable), actual);
    }

    /** Administrador: todos los pedidos. buscar acepta el folio (GC-000123 o 123). */
    @Transactional(readOnly = true)
    public PaginaResponse<PedidoResponse> todos(EstadoPedido estado, String buscar, Pageable pageable,
                                                UsuarioPrincipal actual) {
        String texto = StringUtils.hasText(buscar) ? buscar.trim() : null;
        return pagina(pedidoRepository.todos(estado, texto, folio(texto), pageable), actual);
    }

    @Transactional(readOnly = true)
    public PedidoResponse obtener(Long id, UsuarioPrincipal actual) {
        return respuesta(obtenerVisible(id, actual), actual);
    }

    @Transactional(readOnly = true)
    public ResumenPedidosResponse resumen(UsuarioPrincipal actual) {
        return new ResumenPedidosResponse(
                pedidoRepository.comprasSinLeer(actual.id()),
                pedidoRepository.ventasSinLeer(actual.id()),
                pedidoRepository.countByVendedorIdAndEstado(actual.id(), SOLICITADO));
    }

    // ---------- Cambiar estado ----------

    @Transactional
    public PedidoResponse cambiarEstado(Long id, CambioEstadoRequest request, UsuarioPrincipal actual) {
        Pedido pedido = obtenerVisible(id, actual);
        EstadoPedido anterior = pedido.getEstado();
        EstadoPedido destino = request.estado();
        if (destino == SOLICITADO) {
            throw new ReglaNegocioException("Para convertir la consulta en pedido usa la opción Pedir");
        }
        if (destino == APARTADO) {
            throw new ReglaNegocioException("Para apartar confirma el anticipo y la fecha límite");
        }
        if (destino == VENCIDO) {
            throw new ReglaNegocioException("Los apartados vencen solos al pasar la fecha límite");
        }
        if (!anterior.siguientes().contains(destino)) {
            throw new ReglaNegocioException(anterior.abierto()
                    ? "Un pedido %s no puede pasar a %s".formatted(minus(anterior), minus(destino))
                    : "El pedido ya está %s y no se puede cambiar".formatted(minus(anterior)));
        }
        if (!acciones(pedido, actual).contains(destino)) {
            throw new AccionPedidoNoPermitidaException(quienPuede(destino));
        }
        boolean cliente = comoCliente(pedido, actual);
        String motivo = limpio(request.motivo());
        if (destino == RECHAZADO && motivo == null) {
            throw new ReglaNegocioException("Escribe el motivo del rechazo");
        }
        if (destino == CANCELADO && !cliente && motivo == null) {
            throw new ReglaNegocioException("Escribe el motivo de la cancelación");
        }

        Instant ahora = Instant.now();
        switch (destino) {
            case ACEPTADO -> {
                if (anterior == APARTADO) {
                    // Liquidado: las piezas ya se descontaron al confirmar el anticipo.
                    pedido.setAceptadoEn(ahora);
                    break;
                }
                if (pedido.getMueble() == null) {
                    throw new ReglaNegocioException("El mueble ya no existe");
                }
                muebleService.descontarExistencias(pedido.getMueble(), idVariante(pedido), pedido.getVarianteNombre(),
                        pedido.getCantidad());
                pedido.setAceptadoEn(ahora);
            }
            case EN_CAMINO -> pedido.setEnCaminoEn(ahora);
            case ENTREGADO -> pedido.setEntregadoEn(ahora);
            default -> {
                pedido.setCerradoEn(ahora);
                pedido.setMotivoCierre(motivo);
                if ((anterior == ACEPTADO || anterior == APARTADO) && pedido.getMueble() != null) {
                    muebleService.devolverExistencias(pedido.getMueble(), idVariante(pedido), pedido.getCantidad());
                }
            }
        }
        pedido.setEstado(destino);
        String texto = textoCambio(pedido, anterior, cliente, esVendedor(pedido, actual), motivo);
        agregarMensaje(pedido, null, texto, actual);
        avisarCambio(pedido, texto, actual);
        return respuesta(pedido, actual);
    }

    // ---------- Mensajes ----------

    /** Sin despuesDe: los últimos 200 en orden. Con despuesDe: solo los nuevos (consulta periódica). */
    @Transactional(readOnly = true)
    public List<MensajeResponse> mensajes(Long id, Long despuesDe, UsuarioPrincipal actual) {
        Pedido pedido = obtenerVisible(id, actual);
        List<MensajePedido> mensajes;
        if (despuesDe == null) {
            mensajes = new ArrayList<>(mensajeRepository.findTop200ByPedidoIdOrderByIdDesc(id));
            Collections.reverse(mensajes);
        } else {
            mensajes = mensajeRepository.findTop200ByPedidoIdAndIdGreaterThanOrderByIdAsc(id, despuesDe);
        }
        return mensajes.stream().map(m -> MensajeResponse.desde(m, pedido)).toList();
    }

    @Transactional
    public MensajeResponse escribir(Long id, MensajeRequest request, UsuarioPrincipal actual) {
        Pedido pedido = obtenerVisible(id, actual);
        if (!participa(pedido, actual)) {
            throw new AccionPedidoNoPermitidaException("Solo el cliente y el vendedor pueden escribir en el pedido");
        }
        if (!pedido.getEstado().abierto()) {
            throw new ReglaNegocioException("La conversación se cerró porque el pedido está " + minus(pedido.getEstado()));
        }
        Usuario autor = esCliente(pedido, actual) ? pedido.getCliente() : pedido.getVendedor();
        return MensajeResponse.desde(agregarMensaje(pedido, autor, request.texto().trim(), actual), pedido);
    }

    /** Marca como vistos todos los mensajes hasta ahora para el lado de quien llama. */
    @Transactional
    public void marcarLeido(Long id, UsuarioPrincipal actual) {
        Pedido pedido = obtenerVisible(id, actual);
        marcarLeidoHasta(pedido, actual, mensajeRepository.ultimoId(id).orElse(0L));
    }

    // ---------- Reglas internas ----------

    private Mueble muebleParaPedir(Long muebleId, UsuarioPrincipal actual) {
        Mueble mueble = muebleService.obtenerPublicado(muebleId);
        if (mueble.getVendedor().getId().equals(actual.id())) {
            throw new ReglaNegocioException("No puedes pedir un mueble que tú vendes");
        }
        return mueble;
    }

    private Pedido consultaAbierta(UsuarioPrincipal actual, Mueble mueble) {
        return pedidoRepository.findFirstByClienteIdAndMuebleIdAndEstado(actual.id(), mueble.getId(), CONSULTA)
                .orElse(null);
    }

    private static Pedido nuevo(Mueble mueble, Usuario cliente) {
        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setVendedor(mueble.getVendedor());
        pedido.setMueble(mueble);
        pedido.setMuebleNombre(mueble.getNombre());
        pedido.setPrecioUnitario(mueble.getPrecio());
        pedido.setCantidad(1);
        pedido.setTotal(mueble.getPrecio());
        pedido.setEstado(CONSULTA);
        pedido.setActividadEn(Instant.now());
        return pedido;
    }

    private void solicitar(Pedido pedido, Mueble mueble, DatosSolicitud datos, UsuarioPrincipal actual) {
        validarEntrega(datos);
        VarianteColor variante = null;
        if (mueble.tieneVariantes()) {
            if (datos.varianteId() == null) {
                throw new ReglaNegocioException("Elige el color");
            }
            variante = MuebleService.variante(mueble, datos.varianteId())
                    .orElseThrow(() -> new ReglaNegocioException("Ese color no es de este mueble"));
            if (variante.getExistencias() == 0) {
                throw new ReglaNegocioException("El color " + variante.getNombre() + " está agotado; elige otro o pregunta al vendedor");
            }
            if (datos.cantidad() > variante.getExistencias()) {
                throw new ReglaNegocioException("Solo quedan " + variante.getExistencias() + " piezas en " + variante.getNombre());
            }
        } else if (mueble.getExistencias() == 0) {
            throw new ReglaNegocioException("Este mueble está agotado; pregunta al vendedor cuándo vuelve a haber");
        } else if (datos.cantidad() > mueble.getExistencias()) {
            throw new ReglaNegocioException("Solo quedan " + mueble.getExistencias() + " piezas de este mueble");
        }
        boolean apartar = Boolean.TRUE.equals(datos.apartar());
        if (apartar && pedidoRepository.countByClienteIdAndApartadoTrueAndEstadoIn(
                pedido.getCliente().getId(), EnumSet.of(SOLICITADO, APARTADO)) >= MAX_APARTADOS) {
            throw new ReglaNegocioException("Ya tienes " + MAX_APARTADOS
                    + " apartados abiertos; liquida o cancela uno para apartar otro");
        }
        pedido.setApartado(apartar);
        pedido.setVariante(variante);
        pedido.setVarianteNombre(variante == null ? null : variante.getNombre());
        pedido.setVarianteHex(variante == null ? null : variante.getHex());
        pedido.setMuebleNombre(mueble.getNombre());
        pedido.setPrecioUnitario(mueble.getPrecio());
        pedido.setCantidad(datos.cantidad());
        pedido.setTotal(mueble.getPrecio().multiply(BigDecimal.valueOf(datos.cantidad())));
        pedido.setTipoEntrega(datos.tipoEntrega());
        boolean domicilio = datos.tipoEntrega() == TipoEntrega.DOMICILIO;
        pedido.setNombreRecibe(limpio(datos.nombreRecibe()));
        pedido.setTelefono(limpio(datos.telefono()));
        pedido.setDireccion(domicilio ? limpio(datos.direccion()) : null);
        pedido.setCiudad(domicilio ? limpio(datos.ciudad()) : null);
        pedido.setCodigoPostal(domicilio ? limpio(datos.codigoPostal()) : null);
        pedido.setEstado(SOLICITADO);
        pedido.setSolicitadoEn(Instant.now());

        String resumen = "%s: %d × %s, %s. Total: %s.".formatted(
                apartar ? "Apartado solicitado (con anticipo)" : "Pedido solicitado", pedido.getCantidad(),
                pedido.getMuebleNombre() + (variante == null ? "" : " (" + variante.getNombre() + ")"), pedido.getTipoEntrega().getDescripcion(), dinero(pedido.getTotal()));
        agregarMensaje(pedido, null, resumen, actual);
        if (StringUtils.hasText(datos.mensaje())) {
            agregarMensaje(pedido, pedido.getCliente(), datos.mensaje().trim(), actual);
        }
        avisar(pedido.getVendedor(), pedido, (apartar ? "Nuevo apartado " : "Nuevo pedido ") + pedido.getFolio(),
                pedido.getCliente().getNombre() + " quiere " + pedido.getMuebleNombre() + ".", resumen);
    }

    private static Long idVariante(Pedido pedido) {
        return pedido.getVariante() == null ? null : pedido.getVariante().getId();
    }

    private static void validarEntrega(DatosSolicitud datos) {
        if (datos.tipoEntrega() != TipoEntrega.DOMICILIO) {
            return;
        }
        List<String> faltan = new ArrayList<>();
        agregarSiFalta(faltan, datos.nombreRecibe(), "quién recibe");
        agregarSiFalta(faltan, datos.telefono(), "teléfono");
        agregarSiFalta(faltan, datos.direccion(), "dirección");
        agregarSiFalta(faltan, datos.ciudad(), "ciudad");
        agregarSiFalta(faltan, datos.codigoPostal(), "código postal");
        if (!faltan.isEmpty()) {
            throw new ReglaNegocioException("Para el envío a domicilio falta: " + String.join(", ", faltan));
        }
    }

    private static void agregarSiFalta(List<String> faltan, String valor, String nombre) {
        if (!StringUtils.hasText(valor)) {
            faltan.add(nombre);
        }
    }

    /** Guarda el mensaje, mueve la actividad y deja como leído lo que hizo quien actúa. */
    private MensajePedido agregarMensaje(Pedido pedido, Usuario autor, String texto, UsuarioPrincipal actual) {
        MensajePedido mensaje = mensajeRepository.save(new MensajePedido(pedido, autor, texto));
        pedido.setActividadEn(Instant.now());
        marcarLeidoHasta(pedido, actual, mensaje.getId());
        return mensaje;
    }

    private static void marcarLeidoHasta(Pedido pedido, UsuarioPrincipal actual, long ultimo) {
        if (esCliente(pedido, actual)) {
            pedido.setLeidoClienteHasta(Math.max(pedido.getLeidoClienteHasta(), ultimo));
        } else if (esVendedor(pedido, actual)) {
            pedido.setLeidoVendedorHasta(Math.max(pedido.getLeidoVendedorHasta(), ultimo));
        }
    }

    private Pedido obtenerVisible(Long id, UsuarioPrincipal actual) {
        return pedidoRepository.findDetalleById(id)
                .filter(p -> participa(p, actual) || actual.permisos().contains(SUPERVISAR))
                .orElseThrow(() -> new RecursoNoEncontradoException("El pedido no existe"));
    }

    /** Estados a los que esta persona puede pasar el pedido ahora. */
    private static Set<EstadoPedido> acciones(Pedido p, UsuarioPrincipal actual) {
        boolean cliente = comoCliente(p, actual);
        boolean vendedor = esVendedor(p, actual) && actual.permisos().contains(ATENDER);
        boolean supervisor = actual.permisos().contains(SUPERVISAR);
        Set<EstadoPedido> acciones = EnumSet.noneOf(EstadoPedido.class);
        switch (p.getEstado()) {
            case CONSULTA -> {
                if (cliente) acciones.add(SOLICITADO);
                if (vendedor) acciones.add(RECHAZADO);
                if (cliente || supervisor) acciones.add(CANCELADO);
            }
            case SOLICITADO -> {
                if (vendedor) acciones.addAll(EnumSet.of(ACEPTADO, RECHAZADO));
                if (vendedor && p.isApartado()) acciones.add(APARTADO);
                if (cliente || supervisor) acciones.add(CANCELADO);
            }
            case APARTADO -> {
                if (vendedor) acciones.add(ACEPTADO);
                if (cliente || vendedor || supervisor) acciones.add(CANCELADO);
            }
            case ACEPTADO -> {
                if (vendedor) acciones.add(EN_CAMINO);
                if (cliente || supervisor) acciones.add(CANCELADO);
            }
            case EN_CAMINO -> {
                if (vendedor || cliente) acciones.add(ENTREGADO);
            }
            default -> {
                // Cerrado: sin acciones.
            }
        }
        return acciones;
    }

    private static String quienPuede(EstadoPedido destino) {
        return switch (destino) {
            case ACEPTADO -> "Solo el vendedor puede aceptar el pedido";
            case RECHAZADO -> "Solo el vendedor puede rechazar el pedido";
            case EN_CAMINO -> "Solo el vendedor puede marcar el pedido en camino";
            case ENTREGADO -> "Solo el cliente o el vendedor pueden marcarlo como entregado";
            case CANCELADO -> "Solo el cliente o un administrador pueden cancelar el pedido";
            case APARTADO -> "Solo el vendedor puede confirmar el anticipo";
            default -> "No puedes hacer ese cambio";
        };
    }

    private static String textoCambio(Pedido p, EstadoPedido anterior, boolean cliente, boolean vendedor, String motivo) {
        String conMotivo = motivo == null ? "" : " Motivo: " + motivo;
        if (anterior == APARTADO && p.getEstado() == CANCELADO) {
            return (cliente ? "El cliente canceló el apartado." : vendedor ? "El vendedor canceló el apartado."
                    : "Un administrador canceló el apartado.") + " Las piezas regresaron al inventario." + conMotivo;
        }
        return switch (p.getEstado()) {
            case ACEPTADO -> anterior == APARTADO
                    ? "Apartado liquidado. Acuerden aquí la entrega."
                    : "Pedido aceptado. Acuerden aquí el pago y la entrega.";
            case RECHAZADO -> (anterior == CONSULTA ? "El vendedor cerró la consulta." : "Pedido rechazado.") + conMotivo;
            case EN_CAMINO -> p.getTipoEntrega() == TipoEntrega.RECOGER
                    ? "El pedido está listo para recoger." : "El pedido va en camino.";
            case ENTREGADO -> "Pedido entregado.";
            case CANCELADO -> (cliente
                    ? (anterior == CONSULTA ? "El cliente cerró la consulta." : "El cliente canceló el pedido.")
                    : "Un administrador canceló el pedido.") + conMotivo;
            default -> "Pedido " + minus(p.getEstado()) + ".";
        };
    }

    /** Avisa al lado que no hizo el cambio (a los dos si fue un administrador). */
    private void avisarCambio(Pedido p, String texto, UsuarioPrincipal actual) {
        String titulo = "Pedido " + p.getFolio() + ": " + minus(p.getEstado());
        String detalle = p.getCantidad() + " × " + p.getMuebleNombre() + ". " + texto;
        if (!esCliente(p, actual)) {
            avisar(p.getCliente(), p, titulo, titulo, detalle);
        }
        if (!esVendedor(p, actual)) {
            avisar(p.getVendedor(), p, titulo, titulo, detalle);
        }
    }

    private void avisar(Usuario destinatario, Pedido p, String asunto, String titulo, String texto) {
        String ruta = destinatario.getId().equals(p.getCliente().getId())
                ? "/pedidos/" + p.getId() : "/panel/pedidos/" + p.getId();
        eventos.publishEvent(new AvisoCorreo(destinatario.getEmail(), destinatario.getNombre(), asunto, titulo,
                texto, "Ver el pedido", ruta));
    }

    private PaginaResponse<PedidoResponse> pagina(Page<Pedido> pagina, UsuarioPrincipal actual) {
        List<Long> comoCliente = pagina.stream().filter(p -> esCliente(p, actual)).map(Pedido::getId).toList();
        List<Long> comoVendedor = pagina.stream().filter(p -> esVendedor(p, actual)).map(Pedido::getId).toList();
        Map<Long, Long> sinLeer = new HashMap<>();
        if (!comoCliente.isEmpty()) {
            sinLeer.putAll(conteos(mensajeRepository.sinLeerCliente(comoCliente)));
        }
        if (!comoVendedor.isEmpty()) {
            sinLeer.putAll(conteos(mensajeRepository.sinLeerVendedor(comoVendedor)));
        }
        return PaginaResponse.desde(pagina.map(p -> respuesta(p, actual, sinLeer.getOrDefault(p.getId(), 0L))));
    }

    private PedidoResponse respuesta(Pedido p, UsuarioPrincipal actual) {
        List<Long> ids = List.of(p.getId());
        long sinLeer = 0;
        if (esCliente(p, actual)) {
            sinLeer = total(mensajeRepository.sinLeerCliente(ids));
        } else if (esVendedor(p, actual)) {
            sinLeer = total(mensajeRepository.sinLeerVendedor(ids));
        }
        return respuesta(p, actual, sinLeer);
    }

    private static PedidoResponse respuesta(Pedido p, UsuarioPrincipal actual, long sinLeer) {
        Lado lado = esCliente(p, actual) ? Lado.CLIENTE : esVendedor(p, actual) ? Lado.VENDEDOR : Lado.SUPERVISOR;
        boolean puedeEscribir = participa(p, actual) && p.getEstado().abierto();
        return PedidoResponse.desde(p, lado, List.copyOf(acciones(p, actual)), puedeEscribir, sinLeer);
    }

    private static Map<Long, Long> conteos(List<ConteoSinLeer> filas) {
        return filas.stream().collect(Collectors.toMap(ConteoSinLeer::pedidoId, ConteoSinLeer::total));
    }

    private static long total(List<ConteoSinLeer> filas) {
        return filas.stream().mapToLong(ConteoSinLeer::total).sum();
    }

    private static boolean comoCliente(Pedido p, UsuarioPrincipal actual) {
        return esCliente(p, actual) && actual.permisos().contains(CREAR);
    }

    private static boolean esCliente(Pedido p, UsuarioPrincipal actual) {
        return p.getCliente().getId().equals(actual.id());
    }

    private static boolean esVendedor(Pedido p, UsuarioPrincipal actual) {
        return p.getVendedor().getId().equals(actual.id());
    }

    private static boolean participa(Pedido p, UsuarioPrincipal actual) {
        return esCliente(p, actual) || esVendedor(p, actual);
    }

    /** "GC-000123", "gc-123" o "123" -> 123; cualquier otro texto -> null. */
    private static Long folio(String texto) {
        if (texto == null) {
            return null;
        }
        String digitos = texto.toUpperCase(Locale.ROOT).replaceFirst("^GC-?", "");
        return digitos.matches("\\d{1,12}") ? Long.valueOf(digitos) : null;
    }

    private static String limpio(String valor) {
        return StringUtils.hasText(valor) ? valor.trim() : null;
    }

    private static String minus(EstadoPedido estado) {
        return estado.getEtiqueta().toLowerCase(MX);
    }

    private static String dinero(BigDecimal valor) {
        return String.format(MX, "$%,.2f", valor);
    }
}
