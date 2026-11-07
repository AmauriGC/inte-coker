package com.gc.back.resena.entity;

import com.gc.back.common.entity.EntidadBase;
import com.gc.back.mueble.entity.Mueble;
import com.gc.back.pedido.entity.Pedido;
import com.gc.back.usuario.entity.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

/**
 * Reseña de compra verificada: solo la deja quien tiene un pedido entregado del mueble.
 * Una por cliente y mueble (se edita). El vendedor puede responderla y el administrador
 * ocultarla; las ocultas no cuentan para el promedio.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "resenas",
        uniqueConstraints = @UniqueConstraint(name = "uk_resena_cliente_mueble", columnNames = {"cliente_id", "mueble_id"}),
        indexes = @Index(name = "ix_resena_mueble", columnList = "mueble_id, oculta, creado_en"))
public class Resena extends EntidadBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mueble_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Mueble mueble;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Usuario cliente;

    /** Pedido entregado que la respalda. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Pedido pedido;

    @Column(nullable = false)
    private int estrellas;

    @Column(length = 1000)
    private String texto;

    @Column(length = 1000)
    private String respuesta;

    @Column(name = "respondida_en")
    private Instant respondidaEn;

    @Column(name = "editada_en")
    private Instant editadaEn;

    @Column(nullable = false)
    private boolean oculta;
}
