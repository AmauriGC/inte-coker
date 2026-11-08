package com.gc.back.cuenta.controller;

import com.gc.back.common.response.ApiResponse;
import com.gc.back.cuenta.dto.CambiarPasswordRequest;
import com.gc.back.cuenta.dto.DireccionRequest;
import com.gc.back.cuenta.dto.DireccionResponse;
import com.gc.back.cuenta.dto.PerfilRequest;
import com.gc.back.cuenta.service.CuentaService;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.dto.UsuarioResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/** Mi cuenta (cualquier rol con sesión): nombre, foto, portada, contraseña y direcciones de entrega. */
@Tag(name = "Cuenta", description = "Perfil, foto, portada, contraseña y direcciones guardadas")
@RestController
@RequestMapping("/api/cuenta")
@RequiredArgsConstructor
public class CuentaController {

    private final CuentaService cuentaService;

    @Operation(summary = "Cambia mi nombre")
    @PutMapping("/perfil")
    public ResponseEntity<ApiResponse<UsuarioResponse>> perfil(
            @Valid @RequestBody PerfilRequest request, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Perfil actualizado", cuentaService.actualizarPerfil(request, actual)));
    }

    @Operation(summary = "Sube o reemplaza mi foto (PNG, JPG o WEBP, máximo 5 MB)")
    @PostMapping(value = "/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UsuarioResponse>> subirFoto(
            @RequestPart("archivo") MultipartFile archivo, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Foto actualizada", cuentaService.subirImagen(false, archivo, actual)));
    }

    @Operation(summary = "Quita mi foto")
    @DeleteMapping("/foto")
    public ResponseEntity<ApiResponse<UsuarioResponse>> quitarFoto(@AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Foto quitada", cuentaService.quitarImagen(false, actual)));
    }

    @Operation(summary = "Sube o reemplaza mi portada (PNG, JPG o WEBP, máximo 5 MB)")
    @PostMapping(value = "/portada", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UsuarioResponse>> subirPortada(
            @RequestPart("archivo") MultipartFile archivo, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Portada actualizada", cuentaService.subirImagen(true, archivo, actual)));
    }

    @Operation(summary = "Quita mi portada")
    @DeleteMapping("/portada")
    public ResponseEntity<ApiResponse<UsuarioResponse>> quitarPortada(@AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Portada quitada", cuentaService.quitarImagen(true, actual)));
    }

    @Operation(summary = "Cambia mi contraseña con la actual")
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> cambiarPassword(
            @Valid @RequestBody CambiarPasswordRequest request, @AuthenticationPrincipal UsuarioPrincipal actual) {
        cuentaService.cambiarPassword(request, actual);
        return ResponseEntity.ok(ApiResponse.ok("Contraseña actualizada"));
    }

    @Operation(summary = "Mis direcciones (la predeterminada primero)")
    @GetMapping("/direcciones")
    public ResponseEntity<ApiResponse<List<DireccionResponse>>> direcciones(@AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Direcciones", cuentaService.direcciones(actual)));
    }

    @Operation(summary = "Guarda una dirección (hasta 5)")
    @PostMapping("/direcciones")
    public ResponseEntity<ApiResponse<List<DireccionResponse>>> crear(
            @Valid @RequestBody DireccionRequest request, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Dirección guardada", cuentaService.crearDireccion(request, actual)));
    }

    @Operation(summary = "Edita una dirección")
    @PutMapping("/direcciones/{id}")
    public ResponseEntity<ApiResponse<List<DireccionResponse>>> actualizar(
            @PathVariable Long id, @Valid @RequestBody DireccionRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Dirección actualizada", cuentaService.actualizarDireccion(id, request, actual)));
    }

    @Operation(summary = "La vuelve mi dirección predeterminada")
    @PatchMapping("/direcciones/{id}/predeterminada")
    public ResponseEntity<ApiResponse<List<DireccionResponse>>> predeterminada(
            @PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Dirección predeterminada", cuentaService.predeterminada(id, actual)));
    }

    @Operation(summary = "Borra una dirección")
    @DeleteMapping("/direcciones/{id}")
    public ResponseEntity<ApiResponse<List<DireccionResponse>>> eliminar(
            @PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Dirección borrada", cuentaService.eliminarDireccion(id, actual)));
    }
}
