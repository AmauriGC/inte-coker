package com.gc.back.aviso.entity;

import com.gc.back.common.entity.EntidadBase;
import com.gc.back.mueble.entity.Mueble;
import com.gc.back.mueble.entity.VarianteColor;
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
 * "Avísame cuando haya": la persona espera piezas de un mueble (variante null) o de un color.
 * Se borra al avisar; también si se borra el mueble, el color o la cuenta.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "avisos_existencia", uniqueConstraints = @UniqueConstraint(
        name = "uk_aviso_usuario_mueble_variante", columnNames = {"usuario_id", "mueble_id", "variante_id"}))
public class AvisoExistencia extends EntidadBase {

    public static final int MAXIMO = 30;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mueble_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Mueble mueble;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variante_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private VarianteColor variante;
}
