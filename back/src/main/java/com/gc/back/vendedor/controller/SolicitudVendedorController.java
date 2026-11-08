package com.gc.back.vendedor.controller;

import com.gc.back.common.response.ApiResponse;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.vendedor.dto.RechazoRequest;
import com.gc.back.vendedor.dto.SolicitudVendedorRequest;
import com.gc.back.vendedor.dto.SolicitudVendedorResponse;
import com.gc.back.vendedor.entity.EstadoSolicitud;
import com.gc.back.vendedor.service.SolicitudVendedorService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Solicitudes para vender: el cliente la pide y un administrador la aprueba o la rechaza. */
@Tag(name = "Solicitudes para vender", description = "Cómo un cliente se vuelve vendedor")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SolicitudVendedorController {

    private final SolicitudVendedorService solicitudService;

    @Operation(summary = "Mi última solicitud para vender (null si nunca pedí)")
    @GetMapping("/solicitud-vendedor")
    public ResponseEntity<ApiResponse<SolicitudVendedorResponse>> mia(@AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Solicitud", solicitudService.mia(actual)));
    }

    @Operation(summary = "Pido vender en GC-Confort")
    @PostMapping("/solicitud-vendedor")
    public ResponseEntity<ApiResponse<SolicitudVendedorResponse>> crear(
            @Valid @RequestBody SolicitudVendedorRequest request, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Solicitud enviada", solicitudService.crear(request, actual)));
    }

    @Operation(summary = "Solicitudes para vender (todas o por estado)")
    @PreAuthorize("hasAuthority('USUARIO_GESTIONAR')")
    @GetMapping("/solicitudes-vendedor")
    public ResponseEntity<ApiResponse<PaginaResponse<SolicitudVendedorResponse>>> listar(
            @RequestParam(required = false) EstadoSolicitud estado,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Solicitudes", solicitudService.listar(estado, pageable)));
    }

    @Operation(summary = "Aprueba una solicitud: la cuenta suma el rol Vendedor")
    @PreAuthorize("hasAuthority('USUARIO_GESTIONAR')")
    @PostMapping("/solicitudes-vendedor/{id}/aprobar")
    public ResponseEntity<ApiResponse<SolicitudVendedorResponse>> aprobar(
            @PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Solicitud aprobada", solicitudService.aprobar(id, actual)));
    }

    @Operation(summary = "Rechaza una solicitud con un motivo")
    @PreAuthorize("hasAuthority('USUARIO_GESTIONAR')")
    @PostMapping("/solicitudes-vendedor/{id}/rechazar")
    public ResponseEntity<ApiResponse<SolicitudVendedorResponse>> rechazar(
            @PathVariable Long id, @Valid @RequestBody RechazoRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Solicitud rechazada", solicitudService.rechazar(id, request, actual)));
    }
}
