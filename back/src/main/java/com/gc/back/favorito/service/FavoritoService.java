package com.gc.back.favorito.service;

import com.gc.back.common.response.PaginaResponse;
import com.gc.back.favorito.dto.SincronizarFavoritosRequest;
import com.gc.back.favorito.entity.Favorito;
import com.gc.back.favorito.repository.FavoritoRepository;
import com.gc.back.mueble.dto.MuebleResponse;
import com.gc.back.mueble.entity.Mueble;
import com.gc.back.mueble.service.MuebleService;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.entity.Usuario;
import com.gc.back.usuario.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;

/**
 * Favoritos de la cuenta. Solo se guardan muebles publicados; guardar dos veces o quitar
 * uno que no estaba no es error (las operaciones son idempotentes).
 */
@Service
@RequiredArgsConstructor
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final MuebleService muebleService;
    private final UsuarioService usuarioService;

    /** Del más reciente al más antiguo; omite los muebles que ya no están publicados. */
    @Transactional(readOnly = true)
    public PaginaResponse<MuebleResponse> listar(Pageable pageable, UsuarioPrincipal actual) {
        return PaginaResponse.desde(favoritoRepository.findByUsuarioIdAndMueblePublicadoTrue(actual.id(), pageable)
                .map(favorito -> MuebleResponse.desde(favorito.getMueble())));
    }

    @Transactional
    public MuebleResponse agregar(Long muebleId, UsuarioPrincipal actual) {
        Mueble mueble = muebleService.obtenerPublicado(muebleId);
        if (!favoritoRepository.existsByUsuarioIdAndMuebleId(actual.id(), muebleId)) {
            favoritoRepository.save(new Favorito(usuarioService.obtenerEntidad(actual.id()), mueble));
        }
        return MuebleResponse.desde(mueble);
    }

    @Transactional
    public void quitar(Long muebleId, UsuarioPrincipal actual) {
        favoritoRepository.deleteByUsuarioIdAndMuebleId(actual.id(), muebleId);
    }

    /**
     * Suma a la cuenta los favoritos que la persona guardó sin sesión. Ignora los ids que no
     * existen o ya no están publicados. Devuelve cuántos se agregaron.
     */
    @Transactional
    public int sincronizar(SincronizarFavoritosRequest request, UsuarioPrincipal actual) {
        List<Mueble> muebles = muebleService.obtenerPublicados(new LinkedHashSet<>(request.muebleIds()));
        Usuario usuario = usuarioService.obtenerEntidad(actual.id());
        int agregados = 0;
        for (Mueble mueble : muebles) {
            if (!favoritoRepository.existsByUsuarioIdAndMuebleId(actual.id(), mueble.getId())) {
                favoritoRepository.save(new Favorito(usuario, mueble));
                agregados++;
            }
        }
        return agregados;
    }
}
