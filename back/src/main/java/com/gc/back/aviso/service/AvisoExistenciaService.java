package com.gc.back.aviso.service;

import com.gc.back.aviso.entity.AvisoExistencia;
import com.gc.back.aviso.repository.AvisoExistenciaRepository;
import com.gc.back.common.exception.RecursoNoEncontradoException;
import com.gc.back.common.exception.ReglaNegocioException;
import com.gc.back.correo.dto.AvisoCorreo;
import com.gc.back.mueble.entity.Mueble;
import com.gc.back.mueble.entity.VarianteColor;
import com.gc.back.mueble.event.ExistenciasCambiadas;
import com.gc.back.mueble.repository.MuebleRepository;
import com.gc.back.mueble.service.MuebleService;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * "Avísame cuando haya". Solo se pide sobre algo agotado; cuando vuelve a haber piezas (el
 * vendedor edita existencias, se cancela un pedido o se publica el mueble) se manda un correo
 * y el aviso se borra.
 */
@Service
@RequiredArgsConstructor
public class AvisoExistenciaService {

    private final AvisoExistenciaRepository avisoRepository;
    private final MuebleRepository muebleRepository;
    private final UsuarioService usuarioService;
    private final ApplicationEventPublisher eventos;

    /** Los avisos que tengo de este mueble: ids de color (null = el mueble sin color). */
    @Transactional(readOnly = true)
    public List<Long> mios(Long muebleId, UsuarioPrincipal actual) {
        List<Long> ids = new ArrayList<>();
        avisoRepository.findByUsuarioIdAndMuebleId(actual.id(), muebleId)
                .forEach(a -> ids.add(a.getVariante() == null ? null : a.getVariante().getId()));
        return ids;
    }

    @Transactional
    public List<Long> suscribir(Long muebleId, Long varianteId, UsuarioPrincipal actual) {
        Mueble mueble = publicado(muebleId);
        if (mueble.getVendedor().getId().equals(actual.id())) {
            throw new ReglaNegocioException("Es tu mueble: tú decides cuándo vuelve a haber");
        }
        VarianteColor variante = null;
        if (mueble.tieneVariantes()) {
            if (varianteId == null) {
                throw new ReglaNegocioException("Elige el color que esperas");
            }
            variante = MuebleService.variante(mueble, varianteId)
                    .orElseThrow(() -> new ReglaNegocioException("Ese color no es de este mueble"));
            if (variante.getExistencias() > 0) {
                throw new ReglaNegocioException("Ya hay piezas en " + variante.getNombre() + "; puedes pedirlo ahora");
            }
        } else if (mueble.getExistencias() > 0) {
            throw new ReglaNegocioException("Ya hay piezas; puedes pedirlo ahora");
        }
        if (existente(actual.id(), muebleId, variante).isEmpty()) {
            if (avisoRepository.countByUsuarioId(actual.id()) >= AvisoExistencia.MAXIMO) {
                throw new ReglaNegocioException("Tienes " + AvisoExistencia.MAXIMO + " avisos pendientes; quita alguno para agregar otro");
            }
            AvisoExistencia aviso = new AvisoExistencia();
            aviso.setUsuario(usuarioService.obtenerEntidad(actual.id()));
            aviso.setMueble(mueble);
            aviso.setVariante(variante);
            avisoRepository.save(aviso);
        }
        return mios(muebleId, actual);
    }

    @Transactional
    public List<Long> quitar(Long muebleId, Long varianteId, UsuarioPrincipal actual) {
        (varianteId == null
                ? avisoRepository.findByUsuarioIdAndMuebleIdAndVarianteIsNull(actual.id(), muebleId)
                : avisoRepository.findByUsuarioIdAndMuebleIdAndVarianteId(actual.id(), muebleId, varianteId))
                .ifPresent(avisoRepository::delete);
        avisoRepository.flush();
        return mios(muebleId, actual);
    }

    /** Dentro de la transacción que cambió las existencias: avisa a quien ya puede pedir. */
    @EventListener
    public void alCambiarExistencias(ExistenciasCambiadas evento) {
        Mueble mueble = evento.mueble();
        if (!mueble.isPublicado()) {
            return;
        }
        for (AvisoExistencia aviso : avisoRepository.findByMuebleId(mueble.getId())) {
            VarianteColor v = aviso.getVariante();
            int hay = v == null ? mueble.getExistencias() : v.getExistencias();
            if (hay <= 0) {
                continue;
            }
            String que = mueble.getNombre() + (v == null ? "" : " en " + v.getNombre());
            String titulo = "Ya hay " + que;
            eventos.publishEvent(new AvisoCorreo(aviso.getUsuario().getEmail(), aviso.getUsuario().getNombre(), titulo,
                    titulo, "Volvió a haber piezas (%d disponibles). Pídelo antes de que se agoten.".formatted(hay),
                    "Ver el mueble", "/mueble/" + mueble.getSlug()));
            avisoRepository.delete(aviso);
        }
    }

    private Optional<AvisoExistencia> existente(Long usuarioId, Long muebleId, VarianteColor variante) {
        return variante == null
                ? avisoRepository.findByUsuarioIdAndMuebleIdAndVarianteIsNull(usuarioId, muebleId)
                : avisoRepository.findByUsuarioIdAndMuebleIdAndVarianteId(usuarioId, muebleId, variante.getId());
    }

    private Mueble publicado(Long id) {
        return muebleRepository.findWithRelacionesById(id).filter(Mueble::isPublicado)
                .orElseThrow(() -> new RecursoNoEncontradoException("El mueble no existe"));
    }
}
