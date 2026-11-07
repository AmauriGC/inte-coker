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
    FAVORITO_GESTIONAR("Guardar y quitar muebles favoritos"),
    PEDIDO_CREAR("Preguntar por muebles, pedirlos y seguir mis compras"),
    PEDIDO_ATENDER("Ver y atender los pedidos de mis muebles"),
    PEDIDO_SUPERVISAR("Ver todos los pedidos y cancelarlos por moderación"),
    RESENA_CREAR("Calificar y reseñar los muebles que recibí"),
    RESENA_MODERAR("Ver todas las reseñas y ocultarlas"),
    PERFIL_VENDEDOR_EDITAR("Editar mi perfil público de vendedor y mi galería de trabajos"),
    ENTREGA_REALIZAR("Ver las entregas que me asignan y confirmar la entrega y el cobro");

    private final String descripcion;

    PermisoBase(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
