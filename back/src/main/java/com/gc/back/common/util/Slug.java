package com.gc.back.common.util;

import java.text.Normalizer;
import java.util.Locale;

/** Convierte un nombre en un texto apto para URL: "Sofá Nube" -> "sofa-nube". */
public final class Slug {

    private Slug() {
    }

    public static String de(String texto) {
        String sinAcentos = Normalizer.normalize(texto == null ? "" : texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        String slug = sinAcentos.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");
        return slug.isEmpty() ? "item" : slug;
    }
}
