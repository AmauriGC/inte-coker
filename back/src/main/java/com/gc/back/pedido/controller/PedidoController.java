package com.gc.back.pedido.controller;

import com.gc.back.common.response.ApiResponse;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.pedido.dto.CambioEstadoRequest;
import com.gc.back.pedido.dto.ConfirmarApartadoRequest;
import com.gc.back.pedido.dto.ConsultaRequest;
import com.gc.back.pedido.dto.MensajeRequest;
import com.gc.back.pedido.dto.MensajeResponse;
import com.gc.back.pedido.dto.PedidoRequest;
import com.gc.back.pedido.dto.PedidoResponse;
import com.gc.back.pedido.dto.ResumenPedidosResponse;
import com.gc.back.pedido.dto.SolicitudRequest;
import com.gc.back.pedido.entity.EstadoPedido;
import com.gc.back.pedido.service.PedidoService;
import com.gc.back.security.UsuarioPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Pedidos y conversación cliente-vendedor. El detalle, los mensajes y los cambios de estado
 * solo piden sesión: el service decide quién participa (404 a terceros) y qué puede hacer.
 */
@Tag(name = "Pedidos", description = "Comprar, preguntar y conversar con el vendedor")
@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @Operation(summary = "Pide un mueble (convierte la consulta abierta si la había)")
    @PreAuthorize("hasAuthority('PEDIDO_CREAR')")
    @PostMapping
    public ResponseEntity<ApiResponse<PedidoResponse>> pedir(
            @Valid @RequestBody PedidoRequest request, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Pedido enviado al vendedor", pedidoService.pedir(request, actual)));
    }

    @Operation(summary = "Pregunta por un mueble sin pedirlo (se agrega a la consulta abierta si la había)")
    @PreAuthorize("hasAuthority('PEDIDO_CREAR')")
    @PostMapping("/consultas")
    public ResponseEntity<ApiResponse<PedidoResponse>> preguntar(
            @Valid @RequestBody ConsultaRequest request, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Pregunta enviada al vendedor", pedidoService.preguntar(request, actual)));
    }

    @Operation(summary = "Mis compras y consultas, de la más reciente a la más antigua")
    @PreAuthorize("hasAuthority('PEDIDO_CREAR')")
    @GetMapping("/compras")
    public ResponseEntity<ApiResponse<PaginaResponse<PedidoResponse>>> compras(
            @RequestParam(required = false) EstadoPedido estado,
            @PageableDefault(size = 20, sort = "actividadEn", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Compras", pedidoService.compras(estado, pageable, actual)));
    }

    @Operation(summary = "Pedidos y consultas de mis muebles")
    @PreAuthorize("hasAuthority('PEDIDO_ATENDER')")
    @GetMapping("/ventas")
    public ResponseEntity<ApiResponse<PaginaResponse<PedidoResponse>>> ventas(
            @RequestParam(required = false) EstadoPedido estado,
            @PageableDefault(size = 20, sort = "actividadEn", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Ventas", pedidoService.ventas(estado, pageable, actual)));
    }

    @Operation(summary = "Todos los pedidos (administración); buscar por mueble, persona o folio")
    @PreAuthorize("hasAuthority('PEDIDO_SUPERVISAR')")
    @GetMapping
    public ResponseEntity<ApiResponse<PaginaResponse<PedidoResponse>>> todos(
            @RequestParam(required = false) EstadoPedido estado,
            @RequestParam(required = false) String buscar,
            @PageableDefault(size = 20, sort = "actividadEn", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Pedidos", pedidoService.todos(estado, buscar, pageable, actual)));
    }

    @Operation(summary = "Contadores para los avisos: no leídos y ventas por atender")
    @GetMapping("/resumen")
    public ResponseEntity<ApiResponse<ResumenPedidosResponse>> resumen(@AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Resumen de pedidos", pedidoService.resumen(actual)));
    }

    @Operation(summary = "Detalle del pedido (cliente, vendedor o administración)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PedidoResponse>> obtener(
            @PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Pedido", pedidoService.obtener(id, actual)));
    }

    @Operation(summary = "Cambia el estado: aceptar, rechazar, en camino, entregado o cancelar")
    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<PedidoResponse>> cambiarEstado(
            @PathVariable Long id, @Valid @RequestBody CambioEstadoRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Pedido actualizado", pedidoService.cambiarEstado(id, request, actual)));
    }

    @Operation(summary = "El vendedor confirma el anticipo de un apartado y el plazo para liquidarlo")
    @PreAuthorize("hasAuthority('PEDIDO_ATENDER')")
    @PatchMapping("/{id}/apartado")
    public ResponseEntity<ApiResponse<PedidoResponse>> confirmarApartado(
            @PathVariable Long id, @Valid @RequestBody ConfirmarApartadoRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Apartado confirmado", pedidoService.confirmarApartado(id, request, actual)));
    }

    @Operation(summary = "Convierte mi consulta en pedido")
    @PreAuthorize("hasAuthority('PEDIDO_CREAR')")
    @PatchMapping("/{id}/solicitar")
    public ResponseEntity<ApiResponse<PedidoResponse>> solicitar(
            @PathVariable Long id, @Valid @RequestBody SolicitudRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Pedido enviado al vendedor", pedidoService.solicitar(id, request, actual)));
    }

    @Operation(summary = "Mensajes del pedido; con despuesDe trae solo los nuevos")
    @GetMapping("/{id}/mensajes")
    public ResponseEntity<ApiResponse<List<MensajeResponse>>> mensajes(
            @PathVariable Long id, @RequestParam(required = false) Long despuesDe,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Mensajes", pedidoService.mensajes(id, despuesDe, actual)));
    }

    @Operation(summary = "Envía un mensaje (solo cliente y vendedor, con el pedido abierto)")
    @PostMapping("/{id}/mensajes")
    public ResponseEntity<ApiResponse<MensajeResponse>> escribir(
            @PathVariable Long id, @Valid @RequestBody MensajeRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Mensaje enviado", pedidoService.escribir(id, request, actual)));
    }

    @Operation(summary = "Marca la conversación como leída")
    @PostMapping("/{id}/leido")
    public ResponseEntity<ApiResponse<Void>> marcarLeido(
            @PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal actual) {
        pedidoService.marcarLeido(id, actual);
        return ResponseEntity.ok(ApiResponse.ok("Conversación leída"));
    }
}
