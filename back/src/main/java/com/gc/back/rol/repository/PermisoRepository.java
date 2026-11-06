package com.gc.back.rol.repository;

import com.gc.back.rol.entity.Permiso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PermisoRepository extends JpaRepository<Permiso, Long> {

    Optional<Permiso> findByNombre(String nombre);

    List<Permiso> findByNombreIn(Collection<String> nombres);

    List<Permiso> findAllByOrderByNombreAsc();
}
