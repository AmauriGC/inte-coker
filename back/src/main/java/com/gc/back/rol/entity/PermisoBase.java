package com.gc.back.rol.entity;

/**
 * Permisos del sistema. El nombre del enum es el texto que se usa en
 * {@code @PreAuthorize("hasAuthority('...')")}.
 */
public enum PermisoBase {

    MUEBLE_VER("Ver muebles, incluidos los no publicados propios"),
    MUEBLE_CREAR("Crear muebles y subir modelos 3D"),
    MUEBLE_EDITAR("Editar muebles"),
    MUEBLE_ELIMINAR("Eliminar muebles"),
    CATEGORIA_GESTIONAR("Crear, editar y eliminar categorías"),
    USUARIO_GESTIONAR("Ver usuarios, asignar roles y activar o desactivar cuentas"),
    ROL_GESTIONAR("Ver roles y cambiar sus permisos"),
    FAVORITO_GESTIONAR("Guardar y quitar muebles favoritos");

    private final String descripcion;

    PermisoBase(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
