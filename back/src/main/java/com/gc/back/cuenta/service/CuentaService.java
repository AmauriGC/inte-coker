package com.gc.back.cuenta.service;

import com.gc.back.archivo.entity.TipoArchivo;
import com.gc.back.archivo.service.AlmacenamientoService;
import com.gc.back.common.exception.RecursoNoEncontradoException;
import com.gc.back.common.exception.ReglaNegocioException;
import com.gc.back.cuenta.dto.DireccionRequest;
import com.gc.back.cuenta.dto.DireccionResponse;
import com.gc.back.cuenta.dto.PerfilRequest;
import com.gc.back.cuenta.entity.Direccion;
import com.gc.back.cuenta.repository.DireccionRepository;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.dto.UsuarioResponse;
import com.gc.back.usuario.entity.Usuario;
import com.gc.back.usuario.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * La cuenta de quien tiene la sesión: nombre, foto y direcciones guardadas. Cualquier rol
 * puede usarla; la foto es la misma que muestra el perfil público del vendedor.
 */
@Service
@RequiredArgsConstructor
public class CuentaService {

    private final UsuarioService usuarioService;
    private final DireccionRepository direccionRepository;
    private final AlmacenamientoService almacenamiento;

    @Transactional
    public UsuarioResponse actualizarPerfil(PerfilRequest request, UsuarioPrincipal actual) {
        Usuario yo = usuarioService.obtenerEntidad(actual.id());
        yo.setNombre(request.nombre().trim());
        return UsuarioResponse.desde(yo);
    }

    @Transactional
    public UsuarioResponse subirFoto(MultipartFile archivo, UsuarioPrincipal actual) {
        Usuario yo = usuarioService.obtenerEntidad(actual.id());
        String ruta = almacenamiento.guardar("usuarios/" + yo.getId(), "foto", archivo, TipoArchivo.IMAGEN);
        almacenamiento.eliminar(yo.getFotoRuta());
        yo.setFotoRuta(ruta);
        return UsuarioResponse.desde(yo);
    }

    @Transactional
    public UsuarioResponse quitarFoto(UsuarioPrincipal actual) {
        Usuario yo = usuarioService.obtenerEntidad(actual.id());
        almacenamiento.eliminar(yo.getFotoRuta());
        yo.setFotoRuta(null);
        return UsuarioResponse.desde(yo);
    }

    // ---------- Direcciones ----------

    @Transactional(readOnly = true)
    public List<DireccionResponse> direcciones(UsuarioPrincipal actual) {
        return lista(actual.id());
    }

    /** La primera dirección queda como predeterminada. */
    @Transactional
    public List<DireccionResponse> crearDireccion(DireccionRequest request, UsuarioPrincipal actual) {
        long total = direccionRepository.countByUsuarioId(actual.id());
        if (total >= Direccion.MAXIMO) {
            throw new ReglaNegocioException("Puedes guardar hasta " + Direccion.MAXIMO + " direcciones; borra una para agregar otra");
        }
        Direccion d = new Direccion();
        d.setUsuario(usuarioService.obtenerEntidad(actual.id()));
        aplicar(d, request);
        direccionRepository.save(d);
        if (total == 0 || Boolean.TRUE.equals(request.predeterminada())) {
            hacerPredeterminada(d, actual.id());
        }
        return lista(actual.id());
    }

    @Transactional
    public List<DireccionResponse> actualizarDireccion(Long id, DireccionRequest request, UsuarioPrincipal actual) {
        Direccion d = propia(id, actual);
        aplicar(d, request);
        if (Boolean.TRUE.equals(request.predeterminada())) {
            hacerPredeterminada(d, actual.id());
        }
        return lista(actual.id());
    }

    @Transactional
    public List<DireccionResponse> predeterminada(Long id, UsuarioPrincipal actual) {
        hacerPredeterminada(propia(id, actual), actual.id());
        return lista(actual.id());
    }

    /** Si se borra la predeterminada, la siguiente toma su lugar. */
    @Transactional
    public List<DireccionResponse> eliminarDireccion(Long id, UsuarioPrincipal actual) {
        Direccion d = propia(id, actual);
        boolean eraPredeterminada = d.isPredeterminada();
        direccionRepository.delete(d);
        direccionRepository.flush();
        if (eraPredeterminada) {
            direccionRepository.findByUsuarioIdOrderByPredeterminadaDescIdAsc(actual.id()).stream().findFirst()
                    .ifPresent(siguiente -> siguiente.setPredeterminada(true));
        }
        return lista(actual.id());
    }

    private void hacerPredeterminada(Direccion elegida, Long usuarioId) {
        direccionRepository.findByUsuarioIdOrderByPredeterminadaDescIdAsc(usuarioId)
                .forEach(d -> d.setPredeterminada(d.getId().equals(elegida.getId())));
    }

    private Direccion propia(Long id, UsuarioPrincipal actual) {
        return direccionRepository.findByIdAndUsuarioId(id, actual.id())
                .orElseThrow(() -> new RecursoNoEncontradoException("La dirección no existe"));
    }

    private List<DireccionResponse> lista(Long usuarioId) {
        direccionRepository.flush();
        return direccionRepository.findByUsuarioIdOrderByPredeterminadaDescIdAsc(usuarioId).stream()
                .map(DireccionResponse::desde).toList();
    }

    private static void aplicar(Direccion d, DireccionRequest r) {
        d.setAlias(r.alias().trim());
        d.setNombreRecibe(r.nombreRecibe().trim());
        d.setTelefono(r.telefono().trim());
        d.setDireccion(r.direccion().trim());
        d.setCiudad(r.ciudad().trim());
        d.setCodigoPostal(r.codigoPostal().trim());
    }
}
