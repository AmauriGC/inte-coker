package com.gc.back.notificacion.controller;

import com.gc.back.common.response.ApiResponse;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.notificacion.dto.NotificacionResponse;
import com.gc.back.notificacion.service.NotificacionService;
import com.gc.back.security.UsuarioPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Bandeja de avisos de quien tiene la sesión (cualquier rol). */
@Tag(name = "Avisos", description = "Bandeja de avisos de la cuenta")
@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @Operation(summary = "Mis avisos, del más nuevo al más viejo")
    @GetMapping
    public ResponseEntity<ApiResponse<PaginaResponse<NotificacionResponse>>> listar(
            @RequestParam(defaultValue = "false") boolean sinLeer,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Avisos", notificacionService.listar(sinLeer, pageable, actual)));
    }

    @Operation(summary = "Cuántos avisos sin leer tengo")
    @GetMapping("/sin-leer")
    public ResponseEntity<ApiResponse<Long>> sinLeer(@AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Avisos sin leer", notificacionService.sinLeer(actual)));
    }

    @Operation(summary = "Marca un aviso como leído")
    @PatchMapping("/{id}/leida")
    public ResponseEntity<ApiResponse<NotificacionResponse>> marcarLeida(
            @PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Aviso leído", notificacionService.marcarLeida(id, actual)));
    }

    @Operation(summary = "Marca todos mis avisos como leídos")
    @PostMapping("/leidas")
    public ResponseEntity<ApiResponse<Void>> marcarTodas(@AuthenticationPrincipal UsuarioPrincipal actual) {
        notificacionService.marcarTodas(actual);
        return ResponseEntity.ok(ApiResponse.ok("Avisos leídos"));
    }

    @Operation(summary = "Borra un aviso")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal actual) {
        notificacionService.eliminar(id, actual);
        return ResponseEntity.ok(ApiResponse.ok("Aviso borrado"));
    }

    @Operation(summary = "Borra todos mis avisos")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> vaciar(@AuthenticationPrincipal UsuarioPrincipal actual) {
        notificacionService.vaciar(actual);
        return ResponseEntity.ok(ApiResponse.ok("Avisos borrados"));
    }
}
