package com.gc.back.notificacion.entity;

import com.gc.back.common.entity.EntidadBase;
import com.gc.back.usuario.entity.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/** Aviso en la bandeja de una cuenta. Se guardan las {@link #MAXIMO} más recientes. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "notificaciones", indexes = @Index(name = "ix_notificacion_usuario", columnList = "usuario_id, leida"))
public class Notificacion extends EntidadBase {

    public static final int MAXIMO = 60;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Usuario usuario;

    /** Icono y color en el front: pedido, mueble, exito, novedad, info... */
    @Column(nullable = false, length = 20)
    private String tipo;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(length = 500)
    private String texto;

    /** Ruta del front a la que lleva al tocarlo. */
    @Column(length = 200)
    private String ruta;

    @Column(nullable = false)
    private boolean leida;
}
