package com.gc.back.favorito;

import com.gc.back.PruebaIntegracion;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
        Integer id = muebleListo("Banco Cascada", 3, vendedor);

        guardar(id, cliente).andExpect(status().isOk());

        publicarMueble(id, vendedor, false);
        mvc.perform(get("/api/favoritos").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.contenido", empty()));
        guardar(id, cliente).andExpect(status().isNotFound());

        publicarMueble(id, vendedor, true);
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
}
