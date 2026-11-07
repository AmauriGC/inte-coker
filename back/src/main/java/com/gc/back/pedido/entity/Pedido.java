package com.gc.back.pedido.entity;

import com.gc.back.common.entity.EntidadBase;
import com.gc.back.mueble.entity.Mueble;
import com.gc.back.mueble.entity.VarianteColor;
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
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Pedido de un mueble y, a la vez, la conversación entre cliente y vendedor. Empieza como
 * CONSULTA (solo preguntar) o SOLICITADO (pedido con cantidad y entrega).
 * Guarda una copia del nombre y el precio al pedir: si el vendedor cambia el precio o borra
 * el mueble, el pedido conserva lo acordado (la base pone mueble_id en null al borrarlo).
 * Los no leídos se cuentan con el id del último mensaje que vio cada lado.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "pedidos", indexes = {
        @Index(name = "ix_pedido_cliente", columnList = "cliente_id, actividad_en"),
        @Index(name = "ix_pedido_vendedor", columnList = "vendedor_id, actividad_en")
})
public class Pedido extends EntidadBase {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Usuario vendedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mueble_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Mueble mueble;

    @Column(name = "mueble_nombre", nullable = false, length = 120)
    private String muebleNombre;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(nullable = false)
    private int cantidad;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPedido estado;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_entrega", length = 20)
    private TipoEntrega tipoEntrega;

    @Column(name = "nombre_recibe", length = 100)
    private String nombreRecibe;

    @Column(length = 20)
    private String telefono;

    @Column(length = 255)
    private String direccion;

    @Column(length = 80)
    private String ciudad;

    @Column(name = "codigo_postal", length = 10)
    private String codigoPostal;

    /** Color elegido. Si el vendedor lo borra, el pedido conserva el nombre y el hex. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variante_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private VarianteColor variante;

    @Column(name = "variante_nombre", length = 40)
    private String varianteNombre;

    @Column(name = "variante_hex", length = 7)
    private String varianteHex;

    @Column(name = "motivo_cierre", length = 300)
    private String motivoCierre;

    @Column(name = "solicitado_en")
    private Instant solicitadoEn;

    @Column(name = "aceptado_en")
    private Instant aceptadoEn;

    @Column(name = "en_camino_en")
    private Instant enCaminoEn;

    @Column(name = "entregado_en")
    private Instant entregadoEn;

    @Column(name = "cerrado_en")
    private Instant cerradoEn;

    /** Último mensaje o cambio de estado; ordena las listas por lo más reciente. */
    @Column(name = "actividad_en", nullable = false)
    private Instant actividadEn;

    @Column(name = "leido_cliente_hasta", nullable = false)
    private long leidoClienteHasta;

    @Column(name = "leido_vendedor_hasta", nullable = false)
    private long leidoVendedorHasta;

    /** Folio legible: GC-000123. */
    public String getFolio() {
        return getId() == null ? null : "GC-%06d".formatted(getId());
    }
}
