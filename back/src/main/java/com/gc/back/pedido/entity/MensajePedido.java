package com.gc.back.pedido.entity;

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

/** Mensaje de la conversación de un pedido. Sin autor es un mensaje del sistema (cambio de estado). */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "mensajes_pedido", indexes = @Index(name = "ix_mensaje_pedido", columnList = "pedido_id, id"))
public class MensajePedido extends EntidadBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id")
    private Usuario autor;

    @Column(nullable = false, length = 1000)
    private String texto;

    public MensajePedido(Pedido pedido, Usuario autor, String texto) {
        this.pedido = pedido;
        this.autor = autor;
        this.texto = texto;
    }
}
