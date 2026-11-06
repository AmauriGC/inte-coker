package com.gc.back.usuario.controller;

import com.gc.back.common.response.ApiResponse;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.dto.UsuarioEstadoRequest;
import com.gc.back.usuario.dto.UsuarioResponse;
import com.gc.back.usuario.dto.UsuarioRolesRequest;
import com.gc.back.usuario.service.UsuarioService;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Usuarios", description = "Gestión de usuarios (administrador)")
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('USUARIO_GESTIONAR')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @Operation(summary = "Lista usuarios paginados; 'buscar' filtra por nombre o correo")
    @GetMapping
    public ResponseEntity<ApiResponse<PaginaResponse<UsuarioResponse>>> listar(
            @RequestParam(required = false) String buscar,
            @PageableDefault(size = 20, sort = "creadoEn", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Usuarios", usuarioService.listar(buscar, pageable)));
    }

    @Operation(summary = "Detalle de un usuario")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioResponse>> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Usuario", usuarioService.obtener(id)));
    }

    @Operation(summary = "Reemplaza los roles de un usuario (multirol)")
    @PutMapping("/{id}/roles")
    public ResponseEntity<ApiResponse<UsuarioResponse>> actualizarRoles(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioRolesRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Roles actualizados",
                usuarioService.actualizarRoles(id, request, actual.id())));
    }

    @Operation(summary = "Activa o desactiva una cuenta")
    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<UsuarioResponse>> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioEstadoRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Estado de la cuenta actualizado",
                usuarioService.cambiarEstado(id, request, actual.id())));
    }
}
