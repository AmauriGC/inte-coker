package com.gc.back.categoria.entity;

import com.gc.back.common.entity.EntidadBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "categorias")
public class Categoria extends EntidadBase {

    @Column(nullable = false, unique = true, length = 60)
    private String nombre;

    @Column(nullable = false, unique = true, length = 70)
    private String slug;

    @Column(length = 255)
    private String descripcion;
}
