package com.gc.back.rol.repository;

import com.gc.back.rol.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol, Long> {

    Optional<Rol> findByNombre(String nombre);

    List<Rol> findByNombreIn(Collection<String> nombres);

    List<Rol> findAllByOrderByNombreAsc();
}
