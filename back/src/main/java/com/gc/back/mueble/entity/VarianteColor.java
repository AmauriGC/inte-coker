package com.gc.back.mueble.entity;

import com.gc.back.common.entity.EntidadBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/**
 * Color en existencia de un mueble (hasta {@link #MAXIMO}). Cuando un mueble tiene colores,
 * sus existencias son la suma de las de sus colores y cada pedido lleva uno.
 * hex es el color que el visor aplica al material GC_Color del modelo 3D.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "variantes_color")
public class VarianteColor extends EntidadBase {

    public static final int MAXIMO = 8;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mueble_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Mueble mueble;

    @Column(nullable = false, length = 40)
    private String nombre;

    @Column(nullable = false, length = 7)
    private String hex;

    @Column(nullable = false)
    private int existencias;

    @Column(nullable = false)
    private int orden;
}
