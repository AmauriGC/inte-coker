package com.gc.back.rol.entity;

import java.util.EnumSet;
import java.util.Set;

/**
 * Roles que siempre existen. Se crean al arrancar con sus permisos iniciales.
 * Después, ROL_GESTIONAR puede cambiar los permisos de VENDEDOR y CLIENTE;
 * ADMIN siempre conserva todos.
 */
public enum RolBase {

    ADMIN("Administra usuarios, roles y categorías", EnumSet.allOf(PermisoBase.class)),
    VENDEDOR("Publica y mantiene sus muebles y modelos 3D", EnumSet.of(
            PermisoBase.MUEBLE_VER,
            PermisoBase.MUEBLE_CREAR,
            PermisoBase.MUEBLE_EDITAR,
            PermisoBase.MUEBLE_ELIMINAR)),
    CLIENTE("Explora el catálogo, usa el visor 3D y AR y guarda favoritos", EnumSet.of(
            PermisoBase.MUEBLE_VER,
            PermisoBase.FAVORITO_GESTIONAR));

    private final String descripcion;
    private final Set<PermisoBase> permisos;

    RolBase(String descripcion, Set<PermisoBase> permisos) {
        this.descripcion = descripcion;
        this.permisos = permisos;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public Set<PermisoBase> getPermisos() {
        return permisos;
    }
}
