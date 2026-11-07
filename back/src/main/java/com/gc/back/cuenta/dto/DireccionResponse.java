package com.gc.back.cuenta.dto;

import com.gc.back.cuenta.entity.Direccion;

public record DireccionResponse(Long id, String alias, String nombreRecibe, String telefono, String direccion,
                                String ciudad, String codigoPostal, boolean predeterminada) {

    public static DireccionResponse desde(Direccion d) {
        return new DireccionResponse(d.getId(), d.getAlias(), d.getNombreRecibe(), d.getTelefono(), d.getDireccion(),
                d.getCiudad(), d.getCodigoPostal(), d.isPredeterminada());
    }
}
