package com.gc.back.rol.entity;

import java.util.EnumSet;
import java.util.Set;

/**
 * Roles que siempre existen. Se crean al arrancar con sus permisos iniciales; un permiso
 * nuevo del sistema se agrega a los roles base que lo traen aquí.
 * Después, ROL_GESTIONAR puede cambiar los permisos de VENDEDOR y CLIENTE;
 * ADMIN siempre conserva todos.
 */
public enum RolBase {

    ADMIN("Administra usuarios, roles y categorías", EnumSet.allOf(PermisoBase.class)),
    VENDEDOR("Publica sus muebles y modelos 3D y atiende sus pedidos", EnumSet.of(
            PermisoBase.MUEBLE_VER,
            PermisoBase.MUEBLE_CREAR,
            PermisoBase.MUEBLE_EDITAR,
            PermisoBase.MUEBLE_ELIMINAR,
            PermisoBase.PEDIDO_ATENDER,
            PermisoBase.PERFIL_VENDEDOR_EDITAR,
            PermisoBase.METRICA_VER,
            PermisoBase.TRANSPORTISTA_GESTIONAR)),
    CLIENTE("Explora el catálogo, usa el visor 3D y AR, guarda favoritos, pide y reseña muebles", EnumSet.of(
            PermisoBase.MUEBLE_VER,
            PermisoBase.FAVORITO_GESTIONAR,
            PermisoBase.PEDIDO_CREAR,
            PermisoBase.RESENA_CREAR)),
    TRANSPORTISTA("Lleva los envíos a domicilio que le asignan y confirma la entrega y el cobro", EnumSet.of(
            PermisoBase.ENTREGA_REALIZAR));

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
