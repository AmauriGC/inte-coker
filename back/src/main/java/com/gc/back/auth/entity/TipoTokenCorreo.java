package com.gc.back.auth.entity;

import java.time.Duration;

/** Para qué sirve el enlace del correo y cuánto dura. */
public enum TipoTokenCorreo {

    VERIFICACION(Duration.ofHours(24)),
    RECUPERACION(Duration.ofMinutes(30)),
    /** Un vendedor registró al transportista: con el enlace pone su contraseña. */
    INVITACION(Duration.ofHours(72));

    private final Duration vigencia;

    TipoTokenCorreo(Duration vigencia) {
        this.vigencia = vigencia;
    }

    public Duration getVigencia() {
        return vigencia;
    }
}
