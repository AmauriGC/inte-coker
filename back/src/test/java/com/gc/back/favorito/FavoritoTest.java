package com.gc.back.favorito;

import com.gc.back.PruebaIntegracion;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.ResultActions;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Favoritos de la cuenta: guardar, listar, sincronizar, quitar, permisos y borrado en cascada. */
class FavoritoTest extends PruebaIntegracion {

    @Test
    void clienteGuardaSincronizaYQuitaFavoritos() throws Exception {
        String cliente = usuarioConRoles("cliente.favoritos@prueba.com", "CLIENTE");
        Integer duna = idMueble("sofa-duna");
        Integer nido = idMueble("lampara-nido");
        Integer faro = idMueble("lampara-faro");

        mvc.perform(get("/api/favoritos").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.contenido", empty()));

        guardar(duna, cliente)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Guardado en favoritos"))
                .andExpect(jsonPath("$.datos.slug").value("sofa-duna"));
        guardar(duna, cliente).andExpect(status().isOk());

        mvc.perform(post("/api/favoritos/sincronizar").header(HttpHeaders.AUTHORIZATION, cliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"muebleIds\":[%d,%d,%d,999999]}".formatted(nido, duna, faro)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos").value(2));

        mvc.perform(get("/api/favoritos").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.totalElementos").value(3))
                .andExpect(jsonPath("$.datos.contenido[*].slug").value(
                        containsInAnyOrder("lampara-faro", "lampara-nido", "sofa-duna")));

        mvc.perform(delete("/api/favoritos/{id}", nido).header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Quitado de favoritos"));
        mvc.perform(delete("/api/favoritos/{id}", nido).header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(status().isOk());

        mvc.perform(get("/api/favoritos").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.contenido", hasSize(2)));

        guardar(999999, cliente).andExpect(status().isNotFound());
        mvc.perform(post("/api/favoritos/sincronizar").header(HttpHeaders.AUTHORIZATION, cliente)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"muebleIds\":[-1]}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void sinSesionOSinPermisoNoHayFavoritos() throws Exception {
        String vendedor = usuarioConRoles("vende.favoritos@prueba.com", "VENDEDOR");

        mvc.perform(get("/api/favoritos")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/favoritos").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isForbidden());
        guardar(idMueble("sofa-nube"), vendedor).andExpect(status().isForbidden());
    }

    @Test
    void muebleOcultoNoSeListaYBorradoSeVaDeFavoritos() throws Exception {
        String vendedor = usuarioConRoles("vende.cascada@prueba.com", "VENDEDOR");
        String cliente = usuarioConRoles("cliente.cascada@prueba.com", "CLIENTE");
        Integer id = muebleListo("Banco Cascada", vendedor);

        guardar(id, cliente).andExpect(status().isOk());

        publicar(id, vendedor, false);
        mvc.perform(get("/api/favoritos").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.contenido", empty()));
        guardar(id, cliente).andExpect(status().isNotFound());

        publicar(id, vendedor, true);
        mvc.perform(get("/api/favoritos").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.contenido", hasSize(1)));

        mvc.perform(delete("/api/muebles/{id}", id).header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isOk());
        mvc.perform(get("/api/favoritos").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.contenido", empty()));
    }

    private ResultActions guardar(Integer muebleId, String token) throws Exception {
        return mvc.perform(put("/api/favoritos/{id}", muebleId).header(HttpHeaders.AUTHORIZATION, token));
    }

    private Integer idMueble(String slug) throws Exception {
        String respuesta = mvc.perform(get("/api/muebles/{slug}", slug)).andReturn().getResponse().getContentAsString();
        return JsonPath.read(respuesta, "$.datos.id");
    }

    /** Crea un mueble con modelo e imagen y lo publica. */
    private Integer muebleListo(String nombre, String vendedor) throws Exception {
        String categorias = mvc.perform(get("/api/categorias").param("buscar", "Mesas"))
                .andReturn().getResponse().getContentAsString();
        Integer categoriaId = JsonPath.read(categorias, "$.datos.contenido[0].id");
        String creado = mvc.perform(post("/api/muebles").header(HttpHeaders.AUTHORIZATION, vendedor)
                        .contentType(MediaType.APPLICATION_JSON).content("""
                                {"nombre":"%s","precio":999.00,"anchoCm":100,"fondoCm":40,"altoCm":45,"categoriaId":%d}
                                """.formatted(nombre, categoriaId)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Integer id = JsonPath.read(creado, "$.datos.id");
        subir(id, "modelo", "banco.glb", firma("glTF"), vendedor);
        subir(id, "imagen", "banco.png",
                new byte[]{(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n', 0, 0, 0, 0}, vendedor);
        publicar(id, vendedor, true);
        return id;
    }

    private void publicar(Integer id, String token, boolean valor) throws Exception {
        mvc.perform(patch("/api/muebles/{id}/publicacion", id).header(HttpHeaders.AUTHORIZATION, token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"publicado\":" + valor + "}"))
                .andExpect(status().isOk());
    }

    private void subir(Integer id, String tipo, String nombre, byte[] contenido, String token) throws Exception {
        mvc.perform(multipart("/api/muebles/{id}/{tipo}", id, tipo)
                        .file(new MockMultipartFile("archivo", nombre, MediaType.APPLICATION_OCTET_STREAM_VALUE, contenido))
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk());
    }

    private static byte[] firma(String inicio) {
        byte[] datos = Arrays.copyOf(inicio.getBytes(StandardCharsets.US_ASCII), 64);
        datos[4] = 2;
        return datos;
    }
}
