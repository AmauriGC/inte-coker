package com.gc.back.vendedor.entity;

import com.gc.back.common.entity.EntidadBase;
import com.gc.back.usuario.entity.Usuario;
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
 * Foto de un trabajo que el vendedor ya hizo (galería de su perfil). Hasta
 * {@link #MAXIMO} por vendedor; se muestran por orden y luego por antigüedad.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "trabajos_vendedor")
public class TrabajoVendedor extends EntidadBase {

    public static final int MAXIMO = 24;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendedor_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Usuario vendedor;

    @Column(nullable = false, length = 80)
    private String titulo;

    @Column(length = 280)
    private String descripcion;

    @Column(name = "imagen_ruta", nullable = false)
    private String imagenRuta;

    @Column(nullable = false)
    private int orden;
}
