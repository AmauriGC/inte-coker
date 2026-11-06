package com.gc.back.pedido.dto;

import com.gc.back.pedido.entity.TipoEntrega;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** "Comprar" desde el detalle del mueble. Si ya había una consulta abierta, se convierte en pedido. */
public record PedidoRequest(
        @NotNull(message = "El mueble es obligatorio")
        Long muebleId,

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "Pide al menos una pieza")
        @Max(value = 10, message = "Puedes pedir hasta 10 piezas por pedido")
        Integer cantidad,

        @NotNull(message = "Elige cómo quieres recibirlo")
        TipoEntrega tipoEntrega,

        @Size(max = 100, message = "El nombre admite hasta 100 caracteres")
        String nombreRecibe,

        @Pattern(regexp = "^$|^[0-9 +()-]{7,20}$", message = "Escribe un teléfono válido")
        String telefono,

        @Size(max = 255, message = "La dirección admite hasta 255 caracteres")
        String direccion,

        @Size(max = 80, message = "La ciudad admite hasta 80 caracteres")
        String ciudad,

        @Pattern(regexp = "^$|^[0-9]{5}$", message = "El código postal tiene 5 dígitos")
        String codigoPostal,

        @Size(max = 1000, message = "El mensaje admite hasta 1000 caracteres")
        String mensaje
) implements DatosSolicitud {
}
