package com.gc.back.categoria.service;

import com.gc.back.categoria.dto.CategoriaRequest;
import com.gc.back.categoria.dto.CategoriaResponse;
import com.gc.back.categoria.entity.Categoria;
import com.gc.back.categoria.repository.CategoriaRepository;
import com.gc.back.common.exception.RecursoDuplicadoException;
import com.gc.back.common.exception.RecursoNoEncontradoException;
import com.gc.back.common.exception.ReglaNegocioException;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.common.util.Slug;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public PaginaResponse<CategoriaResponse> listar(String buscar, Pageable pageable) {
        Page<Categoria> pagina = StringUtils.hasText(buscar)
                ? categoriaRepository.findByNombreContainingIgnoreCase(buscar.trim(), pageable)
                : categoriaRepository.findAll(pageable);
        return PaginaResponse.desde(pagina.map(CategoriaResponse::desde));
    }

    @Transactional(readOnly = true)
    public CategoriaResponse obtener(Long id) {
        return CategoriaResponse.desde(obtenerEntidad(id));
    }

    @Transactional
    public CategoriaResponse crear(CategoriaRequest request) {
        String nombre = request.nombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new RecursoDuplicadoException("Ya existe una categoría con ese nombre");
        }
        Categoria categoria = new Categoria();
        aplicar(categoria, request, null);
        return CategoriaResponse.desde(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaResponse actualizar(Long id, CategoriaRequest request) {
        Categoria categoria = obtenerEntidad(id);
        if (categoriaRepository.existsByNombreIgnoreCaseAndIdNot(request.nombre().trim(), id)) {
            throw new RecursoDuplicadoException("Ya existe una categoría con ese nombre");
        }
        aplicar(categoria, request, id);
        return CategoriaResponse.desde(categoria);
    }

    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = obtenerEntidad(id);
        long muebles = categoriaRepository.contarMuebles(id);
        if (muebles > 0) {
            throw new ReglaNegocioException(
                    "No se puede eliminar: la categoría tiene " + muebles + " mueble(s). Muévelos antes");
        }
        categoriaRepository.delete(categoria);
    }

    /** Para otros módulos (mueble). */
    @Transactional(readOnly = true)
    public Categoria obtenerEntidad(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("La categoría no existe"));
    }

    /** Devuelve la categoría con ese nombre o la crea. Lo usa la semilla del catálogo. */
    @Transactional
    public Categoria asegurar(String nombre, String descripcion) {
        return categoriaRepository.findByNombreIgnoreCase(nombre)
                .orElseGet(() -> {
                    Categoria categoria = new Categoria();
                    aplicar(categoria, new CategoriaRequest(nombre, descripcion), null);
                    return categoriaRepository.save(categoria);
                });
    }

    private void aplicar(Categoria categoria, CategoriaRequest request, Long idActual) {
        categoria.setNombre(request.nombre().trim());
        categoria.setDescripcion(StringUtils.hasText(request.descripcion()) ? request.descripcion().trim() : null);
        categoria.setSlug(slugUnico(categoria.getNombre(), idActual));
    }

    private String slugUnico(String nombre, Long idActual) {
        String base = Slug.de(nombre);
        String slug = base;
        int sufijo = 2;
        while (idActual == null
                ? categoriaRepository.existsBySlug(slug)
                : categoriaRepository.existsBySlugAndIdNot(slug, idActual)) {
            slug = base + "-" + sufijo++;
        }
        return slug;
    }
}
