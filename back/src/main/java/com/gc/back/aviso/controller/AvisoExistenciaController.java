package com.gc.back.aviso.controller;

import com.gc.back.aviso.service.AvisoExistenciaService;
import com.gc.back.common.response.ApiResponse;
import com.gc.back.security.UsuarioPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * "Avísame cuando haya" (con sesión). Las respuestas son los colores que espero de ese
 * mueble: ids de variante, o null cuando el mueble no se vende por color.
 */
@Tag(name = "Avisos de existencias", description = "Avísame cuando vuelva a haber piezas")
@RestController
@RequestMapping("/api/muebles/{id}/avisame")
@RequiredArgsConstructor
public class AvisoExistenciaController {

    private final AvisoExistenciaService avisoService;

    @Operation(summary = "Mis avisos de este mueble")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Long>>> mios(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Avisos", avisoService.mios(id, actual)));
    }

    @Operation(summary = "Avísame cuando haya (varianteId si se vende por color)")
    @PostMapping
    public ResponseEntity<ApiResponse<List<Long>>> suscribir(
            @PathVariable Long id, @RequestParam(required = false) Long varianteId,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Te avisaremos por correo", avisoService.suscribir(id, varianteId, actual)));
    }

    @Operation(summary = "Ya no me avises")
    @DeleteMapping
    public ResponseEntity<ApiResponse<List<Long>>> quitar(
            @PathVariable Long id, @RequestParam(required = false) Long varianteId,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Aviso quitado", avisoService.quitar(id, varianteId, actual)));
    }
}
