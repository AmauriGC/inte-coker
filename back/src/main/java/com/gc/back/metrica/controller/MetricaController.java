package com.gc.back.metrica.controller;

import com.gc.back.common.response.ApiResponse;
import com.gc.back.metrica.dto.MetricasResponse;
import com.gc.back.metrica.service.MetricaService;
import com.gc.back.security.UsuarioPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Métricas del vendedor o de toda la tienda, y el contador de vistas de los muebles. */
@Tag(name = "Métricas", description = "Ventas, zonas, muebles y conversión")
@Validated
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MetricaController {

    private final MetricaService metricaService;

    @Operation(summary = "Métricas de los últimos días; tienda=true para toda la tienda (METRICA_GLOBAL)")
    @PreAuthorize("hasAnyAuthority('METRICA_VER', 'METRICA_GLOBAL')")
    @GetMapping("/metricas")
    public ResponseEntity<ApiResponse<MetricasResponse>> metricas(
            @RequestParam(defaultValue = "30") @Min(value = 1, message = "El periodo es de al menos un día")
            @Max(value = 365, message = "El periodo máximo es de 365 días") int dias,
            @RequestParam(defaultValue = "false") boolean tienda,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Métricas", metricaService.metricas(dias, tienda, actual)));
    }

    @Operation(summary = "Cuenta una vista del mueble (el front la manda una vez por sesión)")
    @PostMapping("/muebles/{id}/vista")
    public ResponseEntity<ApiResponse<Void>> vista(
            @PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal actual) {
        metricaService.registrarVista(id, actual);
        return ResponseEntity.ok(ApiResponse.ok("Vista registrada"));
    }
}
