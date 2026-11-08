package com.gc.back.cuenta.service;

import com.gc.back.archivo.entity.TipoArchivo;
import com.gc.back.archivo.service.AlmacenamientoService;
import com.gc.back.common.exception.RecursoNoEncontradoException;
import com.gc.back.common.exception.ReglaNegocioException;
import com.gc.back.correo.dto.AvisoCorreo;
import com.gc.back.cuenta.dto.CambiarPasswordRequest;
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
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * La cuenta de quien tiene la sesión: nombre, foto, portada, contraseña y direcciones
 * guardadas. Cualquier rol puede usarla; la foto y la portada son las mismas que muestra el
 * perfil público del vendedor.
 */
@Service
@RequiredArgsConstructor
public class CuentaService {

    private final UsuarioService usuarioService;
    private final DireccionRepository direccionRepository;
    private final AlmacenamientoService almacenamiento;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventos;

    @Transactional
    public UsuarioResponse actualizarPerfil(PerfilRequest request, UsuarioPrincipal actual) {
        Usuario yo = usuarioService.obtenerEntidad(actual.id());
        yo.setNombre(request.nombre().trim());
        return UsuarioResponse.desde(yo);
    }

    /**
     * Cambia la contraseña con la sesión abierta. Pide la actual (por si alguien toma el
     * teléfono con la sesión abierta) y avisa por correo, por si no fue la persona.
     */
    @Transactional
    public void cambiarPassword(CambiarPasswordRequest request, UsuarioPrincipal actual) {
        Usuario yo = usuarioService.obtenerEntidad(actual.id());
        if (!passwordEncoder.matches(request.actual(), yo.getPassword())) {
            throw new ReglaNegocioException("Tu contraseña actual no es correcta");
        }
        if (!request.nueva().equals(request.confirmacion())) {
            throw new ReglaNegocioException("La confirmación no coincide con la nueva contraseña");
        }
        if (passwordEncoder.matches(request.nueva(), yo.getPassword())) {
            throw new ReglaNegocioException("La nueva contraseña debe ser distinta de la actual");
        }
        usuarioService.cambiarPassword(yo, request.nueva());
        eventos.publishEvent(new AvisoCorreo(yo.getEmail(), yo.getNombre(), "Cambiaste tu contraseña",
                "Tu contraseña cambió",
                "Si no fuiste tú, restablécela desde \"¿Olvidaste tu contraseña?\" al entrar.",
                "Ver mi perfil", "/cuenta/perfil", "info"));
    }

    /** Sube o reemplaza la foto (portada = false) o la portada (portada = true). */
    @Transactional
    public UsuarioResponse subirImagen(boolean portada, MultipartFile archivo, UsuarioPrincipal actual) {
        Usuario yo = usuarioService.obtenerEntidad(actual.id());
        String ruta = almacenamiento.guardar("usuarios/" + yo.getId(), portada ? "portada" : "foto", archivo, TipoArchivo.IMAGEN);
        almacenamiento.eliminar(portada ? yo.getPortadaRuta() : yo.getFotoRuta());
        if (portada) {
            yo.setPortadaRuta(ruta);
        } else {
            yo.setFotoRuta(ruta);
        }
        return UsuarioResponse.desde(yo);
    }

    @Transactional
    public UsuarioResponse quitarImagen(boolean portada, UsuarioPrincipal actual) {
        Usuario yo = usuarioService.obtenerEntidad(actual.id());
        almacenamiento.eliminar(portada ? yo.getPortadaRuta() : yo.getFotoRuta());
        if (portada) {
            yo.setPortadaRuta(null);
        } else {
            yo.setFotoRuta(null);
        }
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
