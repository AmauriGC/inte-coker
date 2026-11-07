package com.gc.back.metrica.entity;

import com.gc.back.common.entity.EntidadBase;
import com.gc.back.mueble.entity.Mueble;
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
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

/**
 * Vistas de un mueble en un día (zona de México). Una fila por mueble y fecha; el front
 * manda una vista por sesión y mueble. Sirve para la conversión (vistas contra pedidos).
 */
@Getter
@NoArgsConstructor
@Entity
@Table(name = "vistas_mueble",
        uniqueConstraints = @UniqueConstraint(name = "uk_vista_mueble_fecha", columnNames = {"mueble_id", "fecha"}),
        indexes = @Index(name = "ix_vista_fecha", columnList = "fecha"))
public class VistaMueble extends EntidadBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mueble_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Mueble mueble;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private int vistas;
}
