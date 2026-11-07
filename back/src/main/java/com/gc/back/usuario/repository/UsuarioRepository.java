package com.gc.back.usuario.repository;

import com.gc.back.usuario.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsBySlug(String slug);

    Optional<Usuario> findBySlug(String slug);

    List<Usuario> findBySlugIsNull();

    /** Cuentas activas con un permiso (por alguno de sus roles), por nombre. */
    @Query("""
            select distinct u from Usuario u join u.roles r join r.permisos p
            where p.nombre = :permiso and u.activo = true order by u.nombre
            """)
    List<Usuario> activosConPermiso(@Param("permiso") String permiso);

    Page<Usuario> findByNombreContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String nombre, String email, Pageable pageable);
}
