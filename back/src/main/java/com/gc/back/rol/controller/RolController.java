package com.gc.back.rol.controller;

import com.gc.back.common.response.ApiResponse;
import com.gc.back.rol.dto.PermisoResponse;
import com.gc.back.rol.dto.RolPermisosRequest;
import com.gc.back.rol.dto.RolResponse;
import com.gc.back.rol.service.RolService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Roles", description = "Roles y permisos del sistema")
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROL_GESTIONAR')")
public class RolController {

    private final RolService rolService;

    @Operation(summary = "Lista los roles con sus permisos")
    @GetMapping
    public ResponseEntity<ApiResponse<List<RolResponse>>> listar() {
        return ResponseEntity.ok(ApiResponse.ok("Roles", rolService.listar()));
    }

    @Operation(summary = "Lista todos los permisos")
    @GetMapping("/permisos")
    public ResponseEntity<ApiResponse<List<PermisoResponse>>> listarPermisos() {
        return ResponseEntity.ok(ApiResponse.ok("Permisos", rolService.listarPermisos()));
    }

    @Operation(summary = "Reemplaza los permisos de un rol (ADMIN no se puede modificar)")
    @PutMapping("/{id}/permisos")
    public ResponseEntity<ApiResponse<RolResponse>> actualizarPermisos(
            @PathVariable Long id,
            @Valid @RequestBody RolPermisosRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Permisos del rol actualizados",
                rolService.actualizarPermisos(id, request)));
    }
}
