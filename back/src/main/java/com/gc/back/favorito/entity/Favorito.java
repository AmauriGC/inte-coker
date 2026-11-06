package com.gc.back.favorito.entity;

import com.gc.back.common.entity.EntidadBase;
import com.gc.back.mueble.entity.Mueble;
import com.gc.back.usuario.entity.Usuario;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/**
 * Mueble guardado por un usuario. Un mueble se guarda una sola vez por usuario.
 * Si se borra el mueble o el usuario, la base borra sus favoritos (ON DELETE CASCADE).
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "favoritos", uniqueConstraints =
        @UniqueConstraint(name = "uk_favorito_usuario_mueble", columnNames = {"usuario_id", "mueble_id"}))
public class Favorito extends EntidadBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mueble_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Mueble mueble;

    public Favorito(Usuario usuario, Mueble mueble) {
        this.usuario = usuario;
        this.mueble = mueble;
    }
}
