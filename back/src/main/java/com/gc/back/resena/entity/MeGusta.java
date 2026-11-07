package com.gc.back.resena.entity;

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
 * "Me gusta" público de una cuenta a un mueble (uno por cuenta y mueble). No es lo mismo que
 * favoritos: favoritos es la lista privada; esto cuenta para el ranking del catálogo.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "me_gusta", uniqueConstraints =
        @UniqueConstraint(name = "uk_me_gusta_usuario_mueble", columnNames = {"usuario_id", "mueble_id"}))
public class MeGusta extends EntidadBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mueble_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Mueble mueble;

    public MeGusta(Usuario usuario, Mueble mueble) {
        this.usuario = usuario;
        this.mueble = mueble;
    }
}
