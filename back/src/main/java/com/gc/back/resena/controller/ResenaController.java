package com.gc.back.resena.controller;

import com.gc.back.common.response.ApiResponse;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.resena.dto.MeGustaResponse;
import com.gc.back.resena.dto.OcultarResenaRequest;
import com.gc.back.resena.dto.ResenaRequest;
import com.gc.back.resena.dto.ResenaResponse;
import com.gc.back.resena.dto.RespuestaRequest;
import com.gc.back.resena.dto.ResumenResenasResponse;
import com.gc.back.resena.service.ResenaService;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Reseñas", description = "Me gusta, reseñas de compra verificada y moderación")
@RestController
@RequiredArgsConstructor
public class ResenaController {

    private final ResenaService resenaService;

    @Operation(summary = "Me gusta a un mueble publicado (cualquier cuenta; repetir no cambia nada)")
    @PutMapping("/api/muebles/{muebleId}/me-gusta")
    public ResponseEntity<ApiResponse<MeGustaResponse>> darMeGusta(
            @PathVariable Long muebleId, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Te gusta este mueble", resenaService.darMeGusta(muebleId, actual)));
    }

    @Operation(summary = "Quita mi me gusta")
    @DeleteMapping("/api/muebles/{muebleId}/me-gusta")
    public ResponseEntity<ApiResponse<MeGustaResponse>> quitarMeGusta(
            @PathVariable Long muebleId, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Me gusta quitado", resenaService.quitarMeGusta(muebleId, actual)));
    }

    @Operation(summary = "Reseñas visibles de un mueble (público); orden recientes, mejores o peores")
    @GetMapping("/api/muebles/{muebleId}/resenas")
    public ResponseEntity<ApiResponse<PaginaResponse<ResenaResponse>>> listar(
            @PathVariable Long muebleId,
            @RequestParam(required = false) Integer estrellas,
            @RequestParam(defaultValue = "recientes") String orden,
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Reseñas",
                resenaService.listar(muebleId, estrellas, orden, pageable, actual)));
    }

    @Operation(summary = "Promedio, distribución y lo que la persona con sesión puede hacer (público)")
    @GetMapping("/api/muebles/{muebleId}/resenas/resumen")
    public ResponseEntity<ApiResponse<ResumenResenasResponse>> resumen(
            @PathVariable Long muebleId, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Resumen de reseñas", resenaService.resumen(muebleId, actual)));
    }

    @Operation(summary = "Crea o edita mi reseña (necesita un pedido entregado de ese mueble)")
    @PreAuthorize("hasAuthority('RESENA_CREAR')")
    @PutMapping("/api/muebles/{muebleId}/resenas")
    public ResponseEntity<ApiResponse<ResenaResponse>> guardar(
            @PathVariable Long muebleId, @Valid @RequestBody ResenaRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Reseña guardada", resenaService.guardar(muebleId, request, actual)));
    }

    @Operation(summary = "El vendedor del mueble responde una reseña")
    @PreAuthorize("hasAuthority('MUEBLE_CREAR')")
    @PostMapping("/api/resenas/{id}/respuesta")
    public ResponseEntity<ApiResponse<ResenaResponse>> responder(
            @PathVariable Long id, @Valid @RequestBody RespuestaRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Respuesta publicada", resenaService.responder(id, request, actual)));
    }

    @Operation(summary = "Moderación: todas las reseñas, con filtro de ocultas y búsqueda")
    @PreAuthorize("hasAuthority('RESENA_MODERAR')")
    @GetMapping("/api/resenas")
    public ResponseEntity<ApiResponse<PaginaResponse<ResenaResponse>>> moderacion(
            @RequestParam(required = false) Boolean oculta,
            @RequestParam(required = false) String buscar,
            @PageableDefault(size = 20, sort = "creadoEn", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Reseñas", resenaService.moderacion(oculta, buscar, pageable, actual)));
    }

    @Operation(summary = "Oculta o vuelve a mostrar una reseña")
    @PreAuthorize("hasAuthority('RESENA_MODERAR')")
    @PatchMapping("/api/resenas/{id}/oculta")
    public ResponseEntity<ApiResponse<ResenaResponse>> ocultar(
            @PathVariable Long id, @Valid @RequestBody OcultarResenaRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok(request.oculta() ? "Reseña oculta" : "Reseña visible",
                resenaService.ocultar(id, request, actual)));
    }
}
