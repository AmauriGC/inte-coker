package com.gc.back.auth.dto;

/** Regla única de contraseña para registro y restablecimiento. */
public final class PoliticaPassword {

    public static final String REGEX = "^(?=.*[A-Za-zÁÉÍÓÚÑáéíóúñ])(?=.*\\d).+$";
    public static final String MENSAJE = "La contraseña necesita al menos una letra y un número";

    private PoliticaPassword() {
    }
}
