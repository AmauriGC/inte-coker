package com.gc.back.favorito.controller;

import com.gc.back.common.response.ApiResponse;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.favorito.dto.SincronizarFavoritosRequest;
import com.gc.back.favorito.service.FavoritoService;
import com.gc.back.mueble.dto.MuebleResponse;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Favoritos", description = "Muebles guardados por la persona con sesión")
@RestController
@RequestMapping("/api/favoritos")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('FAVORITO_GESTIONAR')")
public class FavoritoController {

    private final FavoritoService favoritoService;

    @Operation(summary = "Mis favoritos (solo muebles publicados), del más reciente al más antiguo")
    @GetMapping
    public ResponseEntity<ApiResponse<PaginaResponse<MuebleResponse>>> listar(
            @PageableDefault(size = 20, sort = "creadoEn", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Favoritos", favoritoService.listar(pageable, actual)));
    }

    @Operation(summary = "Guarda un mueble publicado en favoritos (si ya estaba, no pasa nada)")
    @PutMapping("/{muebleId}")
    public ResponseEntity<ApiResponse<MuebleResponse>> agregar(
            @PathVariable Long muebleId, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Guardado en favoritos", favoritoService.agregar(muebleId, actual)));
    }

    @Operation(summary = "Quita un mueble de favoritos (si no estaba, no pasa nada)")
    @DeleteMapping("/{muebleId}")
    public ResponseEntity<ApiResponse<Void>> quitar(
            @PathVariable Long muebleId, @AuthenticationPrincipal UsuarioPrincipal actual) {
        favoritoService.quitar(muebleId, actual);
        return ResponseEntity.ok(ApiResponse.ok("Quitado de favoritos"));
    }

    @Operation(summary = "Suma los favoritos guardados en el dispositivo antes de entrar")
    @PostMapping("/sincronizar")
    public ResponseEntity<ApiResponse<Integer>> sincronizar(
            @Valid @RequestBody SincronizarFavoritosRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Favoritos sincronizados", favoritoService.sincronizar(request, actual)));
    }
}
