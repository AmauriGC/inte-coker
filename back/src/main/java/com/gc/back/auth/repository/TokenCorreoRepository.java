package com.gc.back.auth.repository;

import com.gc.back.auth.entity.TipoTokenCorreo;
import com.gc.back.auth.entity.TokenCorreo;
import com.gc.back.usuario.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface TokenCorreoRepository extends JpaRepository<TokenCorreo, Long> {

    Optional<TokenCorreo> findByTokenHashAndTipo(String tokenHash, TipoTokenCorreo tipo);

    /** Marca como usados los enlaces anteriores para que solo valga el más reciente. */
    @Modifying
    @Query("""
            update TokenCorreo t set t.usadoEn = :ahora
            where t.usuario = :usuario and t.tipo = :tipo and t.usadoEn is null
            """)
    int invalidarVigentes(@Param("usuario") Usuario usuario,
                          @Param("tipo") TipoTokenCorreo tipo,
                          @Param("ahora") Instant ahora);
}
