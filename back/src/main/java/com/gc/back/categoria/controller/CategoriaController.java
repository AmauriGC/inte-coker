package com.gc.back.categoria.controller;

import com.gc.back.categoria.dto.CategoriaRequest;
import com.gc.back.categoria.dto.CategoriaResponse;
import com.gc.back.categoria.service.CategoriaService;
import com.gc.back.common.response.ApiResponse;
import com.gc.back.common.response.PaginaResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Categorías", description = "Categorías del catálogo")
@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @Operation(summary = "Lista categorías paginadas (público)")
    @GetMapping
    public ResponseEntity<ApiResponse<PaginaResponse<CategoriaResponse>>> listar(
            @RequestParam(required = false) String buscar,
            @PageableDefault(size = 50, sort = "nombre") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Categorías", categoriaService.listar(buscar, pageable)));
    }

    @Operation(summary = "Detalle de una categoría (público)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoriaResponse>> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Categoría", categoriaService.obtener(id)));
    }

    @Operation(summary = "Crea una categoría")
    @PreAuthorize("hasAuthority('CATEGORIA_GESTIONAR')")
    @PostMapping
    public ResponseEntity<ApiResponse<CategoriaResponse>> crear(@Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Categoría creada", categoriaService.crear(request)));
    }

    @Operation(summary = "Edita una categoría")
    @PreAuthorize("hasAuthority('CATEGORIA_GESTIONAR')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoriaResponse>> actualizar(
            @PathVariable Long id, @Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Categoría actualizada", categoriaService.actualizar(id, request)));
    }

    @Operation(summary = "Elimina una categoría sin muebles")
    @PreAuthorize("hasAuthority('CATEGORIA_GESTIONAR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        categoriaService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Categoría eliminada"));
    }
}
