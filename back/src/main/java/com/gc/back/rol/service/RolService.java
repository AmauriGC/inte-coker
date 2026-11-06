package com.gc.back.rol.service;

import com.gc.back.common.exception.RecursoNoEncontradoException;
import com.gc.back.common.exception.ReglaNegocioException;
import com.gc.back.rol.dto.PermisoResponse;
import com.gc.back.rol.dto.RolPermisosRequest;
import com.gc.back.rol.dto.RolResponse;
import com.gc.back.rol.entity.Permiso;
import com.gc.back.rol.entity.PermisoBase;
import com.gc.back.rol.entity.Rol;
import com.gc.back.rol.entity.RolBase;
import com.gc.back.rol.repository.PermisoRepository;
import com.gc.back.rol.repository.RolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RolService {

    private final RolRepository rolRepository;
    private final PermisoRepository permisoRepository;

    /**
     * Crea los permisos y roles base que falten. Es idempotente: no pisa los permisos
     * que un administrador ya cambió, salvo ADMIN, que siempre queda con todos.
     */
    @Transactional
    public void asegurarRolesYPermisos() {
        Map<String, Permiso> permisos = new HashMap<>();
        for (PermisoBase base : PermisoBase.values()) {
            Permiso permiso = permisoRepository.findByNombre(base.name())
                    .orElseGet(() -> permisoRepository.save(new Permiso(base.name(), base.getDescripcion())));
            permisos.put(base.name(), permiso);
        }

        for (RolBase base : RolBase.values()) {
            Rol rol = rolRepository.findByNombre(base.name()).orElse(null);
            if (rol == null) {
                rol = new Rol(base.name(), base.getDescripcion());
                Set<Permiso> iniciales = new HashSet<>();
                base.getPermisos().forEach(p -> iniciales.add(permisos.get(p.name())));
                rol.setPermisos(iniciales);
                rolRepository.save(rol);
                log.info("Rol {} creado con {} permisos", base.name(), iniciales.size());
            } else if (base == RolBase.ADMIN) {
                rol.setPermisos(new HashSet<>(permisos.values()));
            }
        }
    }

    @Transactional(readOnly = true)
    public List<RolResponse> listar() {
        return rolRepository.findAllByOrderByNombreAsc().stream().map(RolResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public List<PermisoResponse> listarPermisos() {
        return permisoRepository.findAllByOrderByNombreAsc().stream().map(PermisoResponse::desde).toList();
    }

    @Transactional
    public RolResponse actualizarPermisos(Long id, RolPermisosRequest request) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("El rol no existe"));
        if (RolBase.ADMIN.name().equals(rol.getNombre())) {
            throw new ReglaNegocioException("El rol ADMIN siempre tiene todos los permisos y no se puede modificar");
        }
        Set<String> nombres = normalizar(request.permisos());
        List<Permiso> encontrados = permisoRepository.findByNombreIn(nombres);
        if (encontrados.size() != nombres.size()) {
            Set<String> faltantes = new TreeSet<>(nombres);
            encontrados.forEach(p -> faltantes.remove(p.getNombre()));
            throw new RecursoNoEncontradoException("Estos permisos no existen: " + String.join(", ", faltantes));
        }
        rol.setPermisos(new HashSet<>(encontrados));
        return RolResponse.desde(rol);
    }

    /**
     * Busca roles por nombre y falla si alguno no existe. Lo usan otros módulos
     * (usuario, auth) para asignar roles.
     */
    @Transactional(readOnly = true)
    public Set<Rol> buscarPorNombres(Collection<String> nombres) {
        Set<String> normalizados = normalizar(nombres);
        Map<String, Rol> encontrados = rolRepository.findByNombreIn(normalizados).stream()
                .collect(Collectors.toMap(Rol::getNombre, Function.identity()));
        if (encontrados.size() != normalizados.size()) {
            Set<String> faltantes = new TreeSet<>(normalizados);
            faltantes.removeAll(encontrados.keySet());
            throw new RecursoNoEncontradoException("Estos roles no existen: " + String.join(", ", faltantes));
        }
        return new HashSet<>(encontrados.values());
    }

    private Set<String> normalizar(Collection<String> nombres) {
        return nombres.stream()
                .map(n -> n.trim().toUpperCase(Locale.ROOT))
                .collect(Collectors.toCollection(TreeSet::new));
    }
}
