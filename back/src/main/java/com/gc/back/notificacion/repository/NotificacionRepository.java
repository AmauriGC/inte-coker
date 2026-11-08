package com.gc.back.notificacion.repository;

import com.gc.back.notificacion.entity.Notificacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    Page<Notificacion> findByUsuarioId(Long usuarioId, Pageable pageable);

    Page<Notificacion> findByUsuarioIdAndLeidaFalse(Long usuarioId, Pageable pageable);

    long countByUsuarioIdAndLeidaFalse(Long usuarioId);

    Optional<Notificacion> findByIdAndUsuarioId(Long id, Long usuarioId);

    @Modifying(clearAutomatically = true)
    @Query("update Notificacion n set n.leida = true where n.usuario.id = :usuarioId and n.leida = false")
    int marcarTodas(@Param("usuarioId") Long usuarioId);

    @Modifying(clearAutomatically = true)
    @Query("delete from Notificacion n where n.usuario.id = :usuarioId")
    int vaciar(@Param("usuarioId") Long usuarioId);

    /** Borra las que pasan del máximo, de la más vieja a la más nueva. */
    @Modifying
    @Query(value = """
            delete from notificaciones where usuario_id = :usuarioId and id not in (
              select id from (select id from notificaciones where usuario_id = :usuarioId
                              order by id desc limit :maximo) recientes)
            """, nativeQuery = true)
    int recortar(@Param("usuarioId") Long usuarioId, @Param("maximo") int maximo);
}
