package com.gc.back.archivo.entity;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * Tipos de archivo que acepta la API. El formato se detecta por los primeros bytes
 * (firma), nunca por el nombre o la extensión que manda el cliente.
 */
public enum TipoArchivo {

    MODELO_3D(30L * 1024 * 1024,
            "El modelo 3D debe ser un archivo .glb",
            "El modelo 3D no puede pesar más de 30 MB"),
    IMAGEN(5L * 1024 * 1024,
            "La imagen debe ser PNG, JPG o WEBP",
            "La imagen no puede pesar más de 5 MB");

    private final long maxBytes;
    private final String mensajeFormato;
    private final String mensajeTamano;

    TipoArchivo(long maxBytes, String mensajeFormato, String mensajeTamano) {
        this.maxBytes = maxBytes;
        this.mensajeFormato = mensajeFormato;
        this.mensajeTamano = mensajeTamano;
    }

    public long getMaxBytes() {
        return maxBytes;
    }

    public String getMensajeFormato() {
        return mensajeFormato;
    }

    public String getMensajeTamano() {
        return mensajeTamano;
    }

    /** Extensión según la firma del contenido, o vacío si no es un formato aceptado. */
    public Optional<String> detectarExtension(byte[] b) {
        if (this == MODELO_3D) {
            return empiezaCon(b, 0, "glTF".getBytes(StandardCharsets.US_ASCII)) ? Optional.of("glb") : Optional.empty();
        }
        if (empiezaCon(b, 0, new byte[]{(byte) 0x89, 'P', 'N', 'G'})) {
            return Optional.of("png");
        }
        if (empiezaCon(b, 0, new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF})) {
            return Optional.of("jpg");
        }
        if (empiezaCon(b, 0, "RIFF".getBytes(StandardCharsets.US_ASCII))
                && empiezaCon(b, 8, "WEBP".getBytes(StandardCharsets.US_ASCII))) {
            return Optional.of("webp");
        }
        return Optional.empty();
    }

    private static boolean empiezaCon(byte[] datos, int desde, byte[] firma) {
        if (datos == null || datos.length < desde + firma.length) {
            return false;
        }
        for (int i = 0; i < firma.length; i++) {
            if (datos[desde + i] != firma[i]) {
                return false;
            }
        }
        return true;
    }
}
