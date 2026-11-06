package com.gc.back.mueble.entity;

import com.gc.back.categoria.entity.Categoria;
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
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;

/**
 * Mueble del catálogo. Las medidas van en centímetros enteros y deben coincidir con
 * el modelo 3D (que está en metros) para que la realidad aumentada mida bien.
 * Las rutas de archivos son relativas a UPLOADS_DIR. Las existencias bajan cuando el
 * vendedor acepta un pedido; los muebles que ya existían al agregar la columna quedan con 5.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "muebles")
public class Mueble extends EntidadBase {

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, unique = true, length = 140)
    private String slug;

    @Column(length = 2000)
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(name = "ancho_cm", nullable = false)
    private Integer anchoCm;

    @Column(name = "fondo_cm", nullable = false)
    private Integer fondoCm;

    @Column(name = "alto_cm", nullable = false)
    private Integer altoCm;

    @Column(length = 255)
    private String materiales;

    @ColumnDefault("5")
    @Column(nullable = false)
    private int existencias;

    @Column(nullable = false)
    private boolean publicado;

    @Column(name = "modelo_ruta", length = 255)
    private String modeloRuta;

    @Column(name = "imagen_ruta", length = 255)
    private String imagenRuta;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Usuario vendedor;

    public boolean listoParaPublicar() {
        return modeloRuta != null && imagenRuta != null;
    }
}
