package com.gc.back.transportista.controller;

import com.gc.back.common.response.ApiResponse;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.transportista.dto.TransportistaRequest;
import com.gc.back.transportista.dto.TransportistaResponse;
import com.gc.back.transportista.service.TransportistaService;
import com.gc.back.usuario.dto.UsuarioEstadoRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Los transportistas de cada vendedor: los registra, los invita de nuevo y los da de baja. */
@Tag(name = "Transportistas", description = "Transportistas que registra cada vendedor")
@RestController
@RequestMapping("/api/transportistas")
@RequiredArgsConstructor
public class TransportistaController {

    private final TransportistaService transportistaService;

    @Operation(summary = "Mis transportistas, con su estado y las entregas que llevan")
    @PreAuthorize("hasAnyAuthority('TRANSPORTISTA_GESTIONAR', 'PEDIDO_ATENDER')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<TransportistaResponse>>> listar(@AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Transportistas", transportistaService.listar(actual)));
    }

    @Operation(summary = "Registra a un transportista y le manda la invitación por correo")
    @PreAuthorize("hasAuthority('TRANSPORTISTA_GESTIONAR')")
    @PostMapping
    public ResponseEntity<ApiResponse<TransportistaResponse>> crear(
            @Valid @RequestBody TransportistaRequest request, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Transportista registrado; le enviamos la invitación", transportistaService.crear(request, actual)));
    }

    @Operation(summary = "Vuelve a mandar la invitación")
    @PreAuthorize("hasAuthority('TRANSPORTISTA_GESTIONAR')")
    @PostMapping("/{id}/invitacion")
    public ResponseEntity<ApiResponse<TransportistaResponse>> reenviar(
            @PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Invitación enviada", transportistaService.reenviarInvitacion(id, actual)));
    }

    @Operation(summary = "Da de baja o de alta a un transportista")
    @PreAuthorize("hasAuthority('TRANSPORTISTA_GESTIONAR')")
    @PatchMapping("/{id}/activo")
    public ResponseEntity<ApiResponse<TransportistaResponse>> cambiarActivo(
            @PathVariable Long id, @Valid @RequestBody UsuarioEstadoRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok(request.activo() ? "Transportista dado de alta" : "Transportista dado de baja",
                transportistaService.cambiarActivo(id, request.activo(), actual)));
    }
}
