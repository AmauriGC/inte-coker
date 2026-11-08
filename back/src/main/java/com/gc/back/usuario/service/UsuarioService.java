package com.gc.back.usuario.service;

import com.gc.back.common.exception.RecursoDuplicadoException;
import com.gc.back.common.exception.RecursoNoEncontradoException;
import com.gc.back.common.exception.ReglaNegocioException;
import com.gc.back.common.response.PaginaResponse;
import com.gc.back.common.util.Slug;
import com.gc.back.rol.entity.Rol;
import com.gc.back.rol.entity.RolBase;
import com.gc.back.rol.service.RolService;
import com.gc.back.usuario.dto.UsuarioEstadoRequest;
import com.gc.back.usuario.dto.UsuarioResponse;
import com.gc.back.usuario.dto.UsuarioRolesRequest;
import com.gc.back.usuario.entity.Usuario;
import com.gc.back.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Collection;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolService rolService;
    private final PasswordEncoder passwordEncoder;

    /** Correo en minúsculas y sin espacios; así se guarda y así se busca. */
    public static String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    @Transactional
    public Usuario crear(String nombre, String email, String passwordPlano,
                         Collection<String> roles, boolean verificado) {
        String emailNormalizado = normalizarEmail(email);
        if (usuarioRepository.existsByEmail(emailNormalizado)) {
            throw new RecursoDuplicadoException("Ya existe una cuenta con ese correo");
        }
        Usuario usuario = new Usuario();
        usuario.setNombre(nombre.trim());
        usuario.setEmail(emailNormalizado);
        usuario.setPassword(passwordEncoder.encode(passwordPlano));
        usuario.setVerificado(verificado);
        usuario.setActivo(true);
        usuario.setRoles(rolService.buscarPorNombres(roles));
        usuario.setSlug(slugUnico(usuario.getNombre()));
        return usuarioRepository.save(usuario);
    }

    /** Da su dirección pública a las cuentas creadas antes de que existiera. Idempotente. */
    @Transactional
    public void asegurarSlugs() {
        var sinSlug = usuarioRepository.findBySlugIsNull();
        sinSlug.forEach(u -> {
            u.setSlug(slugUnico(u.getNombre()));
            usuarioRepository.saveAndFlush(u);
        });
        if (!sinSlug.isEmpty()) {
            log.info("{} cuentas recibieron su dirección pública", sinSlug.size());
        }
    }

    /** "Ana Ruiz" -> "ana-ruiz", y si ya existe "ana-ruiz-2", "ana-ruiz-3"... "yo" queda reservado. */
    private String slugUnico(String nombre) {
        String base = Slug.de(nombre);
        if (base.length() > 110) {
            base = base.substring(0, 110);
        }
        String slug = base;
        for (int i = 2; "yo".equals(slug) || usuarioRepository.existsBySlug(slug); i++) {
            slug = base + "-" + i;
        }
        return slug;
    }

    /** Crea el administrador inicial si no existe. Idempotente. */
    @Transactional
    public void asegurarAdmin(String email, String password) {
        if (usuarioRepository.existsByEmail(normalizarEmail(email))) {
            return;
        }
        crear("Administrador", email, password, Set.of(RolBase.ADMIN.name()), true);
        log.info("Administrador inicial creado: {}", normalizarEmail(email));
    }

    @Transactional(readOnly = true)
    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(normalizarEmail(email));
    }

    @Transactional(readOnly = true)
    public Usuario obtenerPorEmail(String email) {
        return buscarPorEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("El usuario no existe"));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtenerPerfil(String email) {
        return UsuarioResponse.desde(obtenerPorEmail(email));
    }

    @Transactional
    public void marcarVerificado(Usuario usuario) {
        usuario.setVerificado(true);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void cambiarPassword(Usuario usuario, String passwordPlano) {
        usuario.setPassword(passwordEncoder.encode(passwordPlano));
        usuarioRepository.save(usuario);
    }

    @Transactional(readOnly = true)
    public PaginaResponse<UsuarioResponse> listar(String buscar, Pageable pageable) {
        Page<Usuario> pagina = StringUtils.hasText(buscar)
                ? usuarioRepository.findByNombreContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        buscar.trim(), buscar.trim(), pageable)
                : usuarioRepository.findAll(pageable);
        return PaginaResponse.desde(pagina.map(UsuarioResponse::desde));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long id) {
        return UsuarioResponse.desde(buscarPorId(id));
    }

    @Transactional
    public UsuarioResponse actualizarRoles(Long id, UsuarioRolesRequest request, Long idActual) {
        Usuario usuario = buscarPorId(id);
        Set<Rol> roles = rolService.buscarPorNombres(request.roles());
        boolean quedaAdmin = roles.stream().anyMatch(r -> RolBase.ADMIN.name().equals(r.getNombre()));
        if (usuario.getId().equals(idActual) && !quedaAdmin) {
            throw new ReglaNegocioException("No puedes quitarte el rol ADMIN a ti mismo");
        }
        // Un transportista siempre pertenece a un vendedor: solo nace desde su panel. Quitarlo sí se puede.
        String transportista = RolBase.TRANSPORTISTA.name();
        boolean yaLoTenia = usuario.getRoles().stream().anyMatch(r -> transportista.equals(r.getNombre()));
        boolean loPide = roles.stream().anyMatch(r -> transportista.equals(r.getNombre()));
        if (loPide && !yaLoTenia) {
            throw new ReglaNegocioException("Los transportistas los registra cada vendedor desde su panel");
        }
        usuario.setRoles(roles);
        return UsuarioResponse.desde(usuario);
    }

    @Transactional
    public UsuarioResponse cambiarEstado(Long id, UsuarioEstadoRequest request, Long idActual) {
        Usuario usuario = buscarPorId(id);
        if (usuario.getId().equals(idActual) && !request.activo()) {
            throw new ReglaNegocioException("No puedes desactivar tu propia cuenta");
        }
        usuario.setActivo(request.activo());
        return UsuarioResponse.desde(usuario);
    }

    /** Para otros módulos (mueble). */
    @Transactional(readOnly = true)
    public Usuario obtenerEntidad(Long id) {
        return buscarPorId(id);
    }

    private Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("El usuario no existe"));
    }
}
