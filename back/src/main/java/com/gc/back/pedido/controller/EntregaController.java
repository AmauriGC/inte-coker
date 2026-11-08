package com.gc.back.pedido.controller;

import com.gc.back.common.response.ApiResponse;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.pedido.dto.EntregaResponse;
import com.gc.back.pedido.dto.NoEntregadaRequest;
import com.gc.back.pedido.service.EntregaService;
import com.gc.back.security.UsuarioPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


/** Entregas a domicilio: el vendedor elige transportista y el transportista confirma la entrega y el cobro. */
@Tag(name = "Entregas", description = "Transportistas y entregas a domicilio")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EntregaController {

    private final EntregaService entregaService;

    @Operation(summary = "Mis entregas: pendientes (en camino) o ya cerradas")
    @PreAuthorize("hasAuthority('ENTREGA_REALIZAR')")
    @GetMapping("/entregas")
    public ResponseEntity<ApiResponse<PaginaResponse<EntregaResponse>>> listar(
            @RequestParam(defaultValue = "true") boolean pendientes,
            @PageableDefault(size = 20, sort = "asignadoEn", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Entregas", entregaService.listar(pendientes, pageable, actual)));
    }

    @Operation(summary = "Detalle de una entrega asignada")
    @PreAuthorize("hasAuthority('ENTREGA_REALIZAR')")
    @GetMapping("/entregas/{id}")
    public ResponseEntity<ApiResponse<EntregaResponse>> obtener(
            @PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Entrega", entregaService.obtener(id, actual)));
    }

    @Operation(summary = "Entregado y cobrado")
    @PreAuthorize("hasAuthority('ENTREGA_REALIZAR')")
    @PostMapping("/entregas/{id}/entregada")
    public ResponseEntity<ApiResponse<EntregaResponse>> entregar(
            @PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Entrega confirmada", entregaService.entregar(id, actual)));
    }

    @Operation(summary = "No se pudo entregar: el pedido regresa al vendedor")
    @PreAuthorize("hasAuthority('ENTREGA_REALIZAR')")
    @PostMapping("/entregas/{id}/no-entregada")
    public ResponseEntity<ApiResponse<EntregaResponse>> noEntregada(
            @PathVariable Long id, @Valid @RequestBody NoEntregadaRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Entrega reportada", entregaService.noEntregada(id, request, actual)));
    }
}
