package com.gc.back.auth.entity;

import com.gc.back.common.entity.EntidadBase;
import com.gc.back.usuario.entity.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Token de un solo uso enviado por correo. Se guarda solo el hash SHA-256:
 * si alguien lee la tabla no puede usar los enlaces.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "tokens_correo")
public class TokenCorreo extends EntidadBase {

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoTokenCorreo tipo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "expira_en", nullable = false)
    private Instant expiraEn;

    @Column(name = "usado_en")
    private Instant usadoEn;

    public boolean vigente(Instant ahora) {
        return usadoEn == null && ahora.isBefore(expiraEn);
    }
}
