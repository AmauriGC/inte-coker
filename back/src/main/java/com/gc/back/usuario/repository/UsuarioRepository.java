package com.gc.back.usuario.repository;

import com.gc.back.usuario.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsBySlug(String slug);

    Optional<Usuario> findBySlug(String slug);

    List<Usuario> findBySlugIsNull();

    Page<Usuario> findByNombreContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String nombre, String email, Pageable pageable);
}
