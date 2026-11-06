package com.gc.back.auth.controller;

import com.gc.back.auth.dto.AuthResponse;
import com.gc.back.auth.dto.CorreoRequest;
import com.gc.back.auth.dto.LoginRequest;
import com.gc.back.auth.dto.RegistroRequest;
import com.gc.back.auth.dto.RestablecerPasswordRequest;
import com.gc.back.auth.dto.TokenRequest;
import com.gc.back.auth.service.AuthService;
import com.gc.back.common.response.ApiResponse;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.dto.UsuarioResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Autenticación", description = "Registro, verificación, login y recuperación de contraseña")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Crea una cuenta de cliente y envía el correo de verificación")
    @PostMapping("/registro")
    public ResponseEntity<ApiResponse<UsuarioResponse>> registrar(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                "Cuenta creada. Revisa tu correo para verificarla", authService.registrar(request)));
    }

    @Operation(summary = "Confirma el correo con el token del enlace")
    @PostMapping("/verificar")
    public ResponseEntity<ApiResponse<Void>> verificar(@Valid @RequestBody TokenRequest request) {
        authService.verificar(request);
        return ResponseEntity.ok(ApiResponse.ok("Cuenta verificada, ya puedes entrar"));
    }

    @Operation(summary = "Vuelve a enviar el correo de verificación")
    @PostMapping("/reenviar-verificacion")
    public ResponseEntity<ApiResponse<Void>> reenviarVerificacion(@Valid @RequestBody CorreoRequest request) {
        authService.reenviarVerificacion(request);
        return ResponseEntity.ok(ApiResponse.ok(
                "Si la cuenta existe y falta verificarla, te enviamos un correo"));
    }

    @Operation(summary = "Entra con correo y contraseña; devuelve access y refresh token")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Bienvenido", authService.login(request)));
    }

    @Operation(summary = "Cambia un refresh token vigente por un par nuevo")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refrescar(@Valid @RequestBody TokenRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Sesión renovada", authService.refrescar(request)));
    }

    @Operation(summary = "Envía el enlace para restablecer la contraseña")
    @PostMapping("/olvide-password")
    public ResponseEntity<ApiResponse<Void>> olvidePassword(@Valid @RequestBody CorreoRequest request) {
        authService.olvidePassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Si el correo está registrado, te enviamos un enlace"));
    }

    @Operation(summary = "Guarda la nueva contraseña usando el token del enlace")
    @PostMapping("/restablecer-password")
    public ResponseEntity<ApiResponse<Void>> restablecerPassword(
            @Valid @RequestBody RestablecerPasswordRequest request) {
        authService.restablecerPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Contraseña actualizada, ya puedes entrar"));
    }

    @Operation(summary = "Datos del usuario de la sesión actual")
    @GetMapping("/yo")
    public ResponseEntity<ApiResponse<UsuarioResponse>> yo(@AuthenticationPrincipal UsuarioPrincipal usuario) {
        return ResponseEntity.ok(ApiResponse.ok("Perfil", authService.perfil(usuario.email())));
    }
}
