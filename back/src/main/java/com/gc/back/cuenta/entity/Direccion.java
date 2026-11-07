package com.gc.back.cuenta.entity;

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

/** Dirección de entrega guardada en la cuenta (hasta 5). Una es la predeterminada. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "direcciones", indexes = @Index(name = "ix_direccion_usuario", columnList = "usuario_id"))
public class Direccion extends EntidadBase {

    public static final int MAXIMO = 5;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Usuario usuario;

    /** Nombre corto: "Casa", "Oficina". */
    @Column(nullable = false, length = 40)
    private String alias;

    @Column(name = "nombre_recibe", nullable = false, length = 100)
    private String nombreRecibe;

    @Column(nullable = false, length = 20)
    private String telefono;

    @Column(nullable = false, length = 255)
    private String direccion;

    @Column(nullable = false, length = 80)
    private String ciudad;

    @Column(name = "codigo_postal", nullable = false, length = 10)
    private String codigoPostal;

    @Column(nullable = false)
    private boolean predeterminada;
}
