package com.gc.back.vendedor;

import com.gc.back.PruebaIntegracion;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Perfil público del vendedor, edición de "Mi perfil" y galería de trabajos. */
class VendedorTest extends PruebaIntegracion {

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n', 0, 0, 0, 0};

    @Test
    void elPerfilEsPublicoYMuestraSusMueblesYDatos() throws Exception {
        String vendedor = usuarioConRoles("vende.perfil@prueba.com", "VENDEDOR");
        String cliente = usuarioConRoles("cliente.perfil@prueba.com", "CLIENTE");
        Integer mueble = muebleListo("Mesa Perfil", 2, vendedor);

        String slug = JsonPath.read(mvc.perform(get("/api/muebles").param("buscar", "Mesa Perfil"))
                .andReturn().getResponse().getContentAsString(), "$.datos.contenido[0].vendedor.slug");
        mvc.perform(get("/api/vendedores/{slug}", slug)).andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.nombre").value("Usuario vende.perfil@prueba.com"))
                .andExpect(jsonPath("$.datos.mueblesPublicados").value(1))
                .andExpect(jsonPath("$.datos.calificacion").value(0.0))
                .andExpect(jsonPath("$.datos.propio").value(false));
        mvc.perform(get("/api/vendedores/{slug}/muebles", slug))
                .andExpect(jsonPath("$.datos.contenido", hasSize(1)))
                .andExpect(jsonPath("$.datos.contenido[0].id").value(mueble));

        String slugPropio = JsonPath.read(mvc.perform(get("/api/vendedores/yo").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andReturn().getResponse().getContentAsString(), "$.datos.slug");
        mvc.perform(get("/api/vendedores/{slug}", "no-existe-nadie")).andExpect(status().isNotFound());
        mvc.perform(get("/api/vendedores/yo")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/vendedores/yo").header(HttpHeaders.AUTHORIZATION, cliente)).andExpect(status().isForbidden());
        mvc.perform(get("/api/vendedores/{slug}", slugPropio).header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos.propio").value(true));
        mvc.perform(get("/api/vendedores/{slug}", "usuario-cliente-perfil-prueba-com")).andExpect(status().isNotFound());
    }

    @Test
    void elVendedorEditaSuPerfilYSuGaleria() throws Exception {
        String vendedor = usuarioConRoles("vende.galeria@prueba.com", "VENDEDOR");
        String otro = usuarioConRoles("otro.galeria@prueba.com", "VENDEDOR");

        mvc.perform(put("/api/vendedores/yo").header(HttpHeaders.AUTHORIZATION, vendedor)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"bio\":\"%s\",\"ciudad\":\"Puebla\"}".formatted("x".repeat(281))))
                .andExpect(status().isBadRequest());
        mvc.perform(put("/api/vendedores/yo").header(HttpHeaders.AUTHORIZATION, vendedor)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"bio\":\" Carpintería fina \",\"ciudad\":\"Puebla\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.bio").value("Carpintería fina"));
        mvc.perform(multipart("/api/vendedores/yo/foto").file(archivo(PNG)).header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.fotoUrl").value(startsWith("/uploads/usuarios/")));
        mvc.perform(multipart("/api/vendedores/yo/portada").file(archivo("texto".getBytes())).header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isBadRequest());

        trabajo("", vendedor).andExpect(status().isBadRequest());
        Integer primero = id(trabajo("Cocina integral", vendedor).andExpect(status().isCreated()));
        Integer segundo = id(trabajo("Librero de nogal", vendedor).andExpect(status().isCreated()));

        mvc.perform(put("/api/vendedores/yo/trabajos/orden").header(HttpHeaders.AUTHORIZATION, vendedor)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"ids\":[%d]}".formatted(segundo)))
                .andExpect(status().isBadRequest());
        mvc.perform(put("/api/vendedores/yo/trabajos/orden").header(HttpHeaders.AUTHORIZATION, vendedor)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"ids\":[%d,%d]}".formatted(segundo, primero)))
                .andExpect(status().isOk());
        mvc.perform(put("/api/vendedores/yo/trabajos/{id}", primero).header(HttpHeaders.AUTHORIZATION, otro)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"titulo\":\"Ajeno\"}"))
                .andExpect(status().isNotFound());

        String slug = JsonPath.read(mvc.perform(get("/api/vendedores/yo").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos.trabajos").value(2))
                .andReturn().getResponse().getContentAsString(), "$.datos.slug");
        mvc.perform(get("/api/vendedores/{slug}/trabajos", slug))
                .andExpect(jsonPath("$.datos", hasSize(2)))
                .andExpect(jsonPath("$.datos[0].titulo").value("Librero de nogal"));

        mvc.perform(delete("/api/vendedores/yo/trabajos/{id}", segundo).header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isOk());
        mvc.perform(delete("/api/vendedores/yo/foto").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos.fotoUrl").value(nullValue()));
        mvc.perform(get("/api/vendedores/{slug}/trabajos", slug)).andExpect(jsonPath("$.datos", hasSize(1)));
    }

    private ResultActions trabajo(String titulo, String token) throws Exception {
        return mvc.perform(multipart("/api/vendedores/yo/trabajos").file(archivo(PNG))
                .param("titulo", titulo).param("descripcion", "Hecho a medida")
                .header(HttpHeaders.AUTHORIZATION, token));
    }

    private static MockMultipartFile archivo(byte[] contenido) {
        return new MockMultipartFile("archivo", "foto.png", MediaType.APPLICATION_OCTET_STREAM_VALUE, contenido);
    }

    private static Integer id(ResultActions resultado) throws Exception {
        return JsonPath.read(resultado.andReturn().getResponse().getContentAsString(), "$.datos.id");
    }
}
