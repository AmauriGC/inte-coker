package com.gc.back.vendedor.entity;

import com.gc.back.common.entity.EntidadBase;
import com.gc.back.usuario.entity.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

/**
 * Un cliente pide vender en GC-Confort; un administrador la aprueba (suma el rol Vendedor)
 * o la rechaza con un motivo. Solo puede haber una pendiente por cuenta.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "solicitudes_vendedor", indexes = {
        @Index(name = "ix_solicitud_usuario", columnList = "usuario_id"),
        @Index(name = "ix_solicitud_estado", columnList = "estado")
})
public class SolicitudVendedor extends EntidadBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Usuario usuario;

    @Column(nullable = false, length = 80)
    private String ciudad;

    @Column(nullable = false, length = 20)
    private String telefono;

    /** Qué hace o qué quiere vender. */
    @Column(nullable = false, length = 500)
    private String mensaje;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 20)
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

    /** Por qué se rechazó. */
    @Column(length = 300)
    private String motivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revisado_por")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Usuario revisadoPor;

    @Column(name = "revisado_en")
    private Instant revisadoEn;
}
