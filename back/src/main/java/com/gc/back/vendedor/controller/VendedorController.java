package com.gc.back.vendedor.controller;

import com.gc.back.common.response.ApiResponse;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.mueble.dto.MuebleResponse;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.vendedor.dto.OrdenTrabajosRequest;
import com.gc.back.vendedor.dto.PerfilVendedorRequest;
import com.gc.back.vendedor.dto.PerfilVendedorResponse;
import com.gc.back.vendedor.dto.TrabajoRequest;
import com.gc.back.vendedor.dto.TrabajoResponse;
import com.gc.back.vendedor.service.VendedorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "Vendedores", description = "Perfil público de quien vende y su galería de trabajos")
@RestController
@RequestMapping("/api/vendedores")
@RequiredArgsConstructor
public class VendedorController {

    private final VendedorService vendedorService;

    @Operation(summary = "Mi perfil de vendedor (para editarlo)")
    @PreAuthorize("hasAuthority('PERFIL_VENDEDOR_EDITAR')")
    @GetMapping("/yo")
    public ResponseEntity<ApiResponse<PerfilVendedorResponse>> miPerfil(@AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Mi perfil", vendedorService.miPerfil(actual)));
    }

    @Operation(summary = "Edita la presentación y la ciudad de mi perfil")
    @PreAuthorize("hasAuthority('PERFIL_VENDEDOR_EDITAR')")
    @PutMapping("/yo")
    public ResponseEntity<ApiResponse<PerfilVendedorResponse>> actualizar(
            @Valid @RequestBody PerfilVendedorRequest request, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Perfil actualizado", vendedorService.actualizar(request, actual)));
    }

    @Operation(summary = "Sube o reemplaza mi foto (PNG, JPG o WEBP, máximo 5 MB)")
    @PreAuthorize("hasAuthority('PERFIL_VENDEDOR_EDITAR')")
    @PostMapping(value = "/yo/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PerfilVendedorResponse>> subirFoto(
            @RequestPart("archivo") MultipartFile archivo, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Foto guardada", vendedorService.subirImagen(false, archivo, actual)));
    }

    @Operation(summary = "Sube o reemplaza mi portada (PNG, JPG o WEBP, máximo 5 MB)")
    @PreAuthorize("hasAuthority('PERFIL_VENDEDOR_EDITAR')")
    @PostMapping(value = "/yo/portada", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PerfilVendedorResponse>> subirPortada(
            @RequestPart("archivo") MultipartFile archivo, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Portada guardada", vendedorService.subirImagen(true, archivo, actual)));
    }

    @Operation(summary = "Quita mi foto")
    @PreAuthorize("hasAuthority('PERFIL_VENDEDOR_EDITAR')")
    @DeleteMapping("/yo/foto")
    public ResponseEntity<ApiResponse<PerfilVendedorResponse>> quitarFoto(@AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Foto quitada", vendedorService.quitarImagen(false, actual)));
    }

    @Operation(summary = "Quita mi portada")
    @PreAuthorize("hasAuthority('PERFIL_VENDEDOR_EDITAR')")
    @DeleteMapping("/yo/portada")
    public ResponseEntity<ApiResponse<PerfilVendedorResponse>> quitarPortada(@AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Portada quitada", vendedorService.quitarImagen(true, actual)));
    }

    @Operation(summary = "Agrega un trabajo a mi galería (hasta 24)")
    @PreAuthorize("hasAuthority('PERFIL_VENDEDOR_EDITAR')")
    @PostMapping(value = "/yo/trabajos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<TrabajoResponse>> agregarTrabajo(
            @Valid @ModelAttribute TrabajoRequest request, @RequestPart("archivo") MultipartFile archivo,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Trabajo agregado", vendedorService.agregarTrabajo(request, archivo, actual)));
    }

    @Operation(summary = "Cambia el orden de mi galería")
    @PreAuthorize("hasAuthority('PERFIL_VENDEDOR_EDITAR')")
    @PutMapping("/yo/trabajos/orden")
    public ResponseEntity<ApiResponse<List<TrabajoResponse>>> ordenarTrabajos(
            @Valid @RequestBody OrdenTrabajosRequest request, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Orden guardado", vendedorService.ordenarTrabajos(request, actual)));
    }

    @Operation(summary = "Edita el título y la descripción de un trabajo")
    @PreAuthorize("hasAuthority('PERFIL_VENDEDOR_EDITAR')")
    @PutMapping("/yo/trabajos/{id}")
    public ResponseEntity<ApiResponse<TrabajoResponse>> editarTrabajo(
            @PathVariable Long id, @Valid @RequestBody TrabajoRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Trabajo actualizado", vendedorService.editarTrabajo(id, request, actual)));
    }

    @Operation(summary = "Borra un trabajo de mi galería")
    @PreAuthorize("hasAuthority('PERFIL_VENDEDOR_EDITAR')")
    @DeleteMapping("/yo/trabajos/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminarTrabajo(
            @PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal actual) {
        vendedorService.eliminarTrabajo(id, actual);
        return ResponseEntity.ok(ApiResponse.ok("Trabajo eliminado"));
    }

    @Operation(summary = "Perfil público: datos, calificación, ventas y año desde que vende")
    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<PerfilVendedorResponse>> perfil(
            @PathVariable String slug, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Vendedor", vendedorService.perfil(slug, actual)));
    }

    @Operation(summary = "Muebles publicados del vendedor")
    @GetMapping("/{slug}/muebles")
    public ResponseEntity<ApiResponse<PaginaResponse<MuebleResponse>>> muebles(
            @PathVariable String slug,
            @PageableDefault(size = 20, sort = "creadoEn", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Muebles del vendedor", vendedorService.muebles(slug, pageable)));
    }

    @Operation(summary = "Galería de trabajos del vendedor")
    @GetMapping("/{slug}/trabajos")
    public ResponseEntity<ApiResponse<List<TrabajoResponse>>> trabajos(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok("Trabajos del vendedor", vendedorService.trabajos(slug)));
    }
}
