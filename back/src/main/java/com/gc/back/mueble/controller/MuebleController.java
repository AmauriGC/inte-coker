package com.gc.back.mueble.controller;

import com.gc.back.archivo.entity.TipoArchivo;
import com.gc.back.common.response.ApiResponse;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.mueble.dto.FiltroCatalogoRequest;
import com.gc.back.mueble.dto.MueblePublicacionRequest;
import com.gc.back.mueble.dto.MuebleRequest;
import com.gc.back.mueble.dto.MuebleResponse;
import com.gc.back.mueble.service.MuebleService;
import com.gc.back.security.UsuarioPrincipal;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Muebles", description = "Catálogo público y gestión de muebles")
@RestController
@RequestMapping("/api/muebles")
@RequiredArgsConstructor
public class MuebleController {

    private final MuebleService muebleService;

    @Operation(summary = "Catálogo público: muebles publicados con filtros opcionales")
    @GetMapping
    public ResponseEntity<ApiResponse<PaginaResponse<MuebleResponse>>> listar(
            @Valid @ModelAttribute FiltroCatalogoRequest filtro,
            @PageableDefault(size = 20, sort = "creadoEn", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok("Catálogo", muebleService.listarPublicados(filtro, pageable)));
    }

    @Operation(summary = "Panel: el vendedor ve sus muebles (borradores incluidos); el admin ve todos")
    @PreAuthorize("hasAuthority('MUEBLE_CREAR')")
    @GetMapping("/gestion")
    public ResponseEntity<ApiResponse<PaginaResponse<MuebleResponse>>> listarGestion(
            @RequestParam(required = false) String buscar,
            @PageableDefault(size = 20, sort = "actualizadoEn", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Mis muebles", muebleService.listarGestion(buscar, pageable, actual)));
    }

    @Operation(summary = "Detalle por slug (público si está publicado)")
    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<MuebleResponse>> obtener(
            @PathVariable String slug, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Mueble", muebleService.obtenerPorSlug(slug, actual)));
    }

    @Operation(summary = "Crea un mueble como borrador")
    @PreAuthorize("hasAuthority('MUEBLE_CREAR')")
    @PostMapping
    public ResponseEntity<ApiResponse<MuebleResponse>> crear(
            @Valid @RequestBody MuebleRequest request, @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Mueble creado como borrador", muebleService.crear(request, actual)));
    }

    @Operation(summary = "Edita los datos de un mueble propio")
    @PreAuthorize("hasAuthority('MUEBLE_EDITAR')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MuebleResponse>> actualizar(
            @PathVariable Long id, @Valid @RequestBody MuebleRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Mueble actualizado", muebleService.actualizar(id, request, actual)));
    }

    @Operation(summary = "Publica u oculta un mueble (publicar pide modelo 3D e imagen)")
    @PreAuthorize("hasAuthority('MUEBLE_EDITAR')")
    @PatchMapping("/{id}/publicacion")
    public ResponseEntity<ApiResponse<MuebleResponse>> cambiarPublicacion(
            @PathVariable Long id, @Valid @RequestBody MueblePublicacionRequest request,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Publicación actualizada",
                muebleService.cambiarPublicacion(id, request, actual)));
    }

    @Operation(summary = "Sube o reemplaza el modelo 3D (.glb, máximo 30 MB)")
    @PreAuthorize("hasAuthority('MUEBLE_EDITAR')")
    @PostMapping(value = "/{id}/modelo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MuebleResponse>> subirModelo(
            @PathVariable Long id, @RequestPart("archivo") MultipartFile archivo,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Modelo 3D guardado",
                muebleService.subirArchivo(id, archivo, TipoArchivo.MODELO_3D, actual)));
    }

    @Operation(summary = "Sube o reemplaza la imagen (PNG, JPG o WEBP, máximo 5 MB)")
    @PreAuthorize("hasAuthority('MUEBLE_EDITAR')")
    @PostMapping(value = "/{id}/imagen", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MuebleResponse>> subirImagen(
            @PathVariable Long id, @RequestPart("archivo") MultipartFile archivo,
            @AuthenticationPrincipal UsuarioPrincipal actual) {
        return ResponseEntity.ok(ApiResponse.ok("Imagen guardada",
                muebleService.subirArchivo(id, archivo, TipoArchivo.IMAGEN, actual)));
    }

    @Operation(summary = "Elimina un mueble propio y sus archivos")
    @PreAuthorize("hasAuthority('MUEBLE_ELIMINAR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal actual) {
        muebleService.eliminar(id, actual);
        return ResponseEntity.ok(ApiResponse.ok("Mueble eliminado"));
    }
}
