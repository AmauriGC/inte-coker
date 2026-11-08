package com.gc.back.usuario.entity;

import com.gc.back.common.entity.EntidadBase;
import com.gc.back.rol.entity.Rol;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.HashSet;
import java.util.Set;

/**
 * Usuario multirol. verificado = confirmó su correo; activo = un admin no lo bloqueó.
 * Solo puede entrar si ambos son true.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "usuarios")
public class Usuario extends EntidadBase {

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(nullable = false)
    private boolean verificado;

    @Column(nullable = false)
    private boolean activo = true;

    /** Dirección pública del perfil de vendedor (/vendedor/{slug}). Única. */
    @Column(unique = true, length = 120)
    private String slug;

    @Column(length = 280)
    private String bio;

    @Column(length = 80)
    private String ciudad;

    @Column(name = "foto_ruta")
    private String fotoRuta;

    @Column(name = "portada_ruta")
    private String portadaRuta;

    @Column(length = 20)
    private String telefono;

    /** Vendedor que registró a este transportista; solo él se lo asigna a sus envíos. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empleador_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Usuario empleador;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "usuario_roles",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "rol_id")
    )
    private Set<Rol> roles = new HashSet<>();

    public boolean puedeEntrar() {
        return verificado && activo;
    }
}
