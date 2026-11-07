package com.gc.back.notificacion;

import com.gc.back.PruebaIntegracion;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Bandeja de avisos en la cuenta: bienvenida, avisos de pedidos y solo los propios. */
class NotificacionTest extends PruebaIntegracion {

    @Test
    void losAvisosQuedanEnMiCuenta() throws Exception {
        String vendedor = usuarioConRoles("vende.bandeja@prueba.com", "VENDEDOR");
        String cliente = usuarioConRoles("compra.bandeja@prueba.com", "CLIENTE");

        mvc.perform(get("/api/notificaciones").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.contenido", hasSize(1)))
                .andExpect(jsonPath("$.datos.contenido[0].titulo").value("Bienvenido a GC-Confort"))
                .andExpect(jsonPath("$.datos.contenido[0].leida").value(false));

        Integer mueble = muebleListo("Mesa Bandeja", 2, vendedor);
        mvc.perform(post("/api/pedidos").header(HttpHeaders.AUTHORIZATION, cliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"muebleId\":%d,\"cantidad\":1,\"metodoPago\":\"EFECTIVO\",\"tipoEntrega\":\"RECOGER\",\"nombreRecibe\":\"Ana\"}"
                                .formatted(mueble)))
                .andExpect(status().isCreated());

        // Al vendedor le llega el pedido nuevo además de su bienvenida.
        String bandeja = mvc.perform(get("/api/notificaciones").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos.contenido", hasSize(2)))
                .andExpect(jsonPath("$.datos.contenido[0].tipo").value("pedido"))
                .andReturn().getResponse().getContentAsString();
        Integer pedido = JsonPath.read(bandeja, "$.datos.contenido[0].id");
        mvc.perform(get("/api/notificaciones/sin-leer").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos").value(2));

        mvc.perform(patch("/api/notificaciones/{id}/leida", pedido).header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(status().isNotFound());
        mvc.perform(patch("/api/notificaciones/{id}/leida", pedido).header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos.leida").value(true));
        mvc.perform(get("/api/notificaciones").param("sinLeer", "true").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos.contenido", hasSize(1)));

        mvc.perform(post("/api/notificaciones/leidas").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isOk());
        mvc.perform(get("/api/notificaciones/sin-leer").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos").value(0));

        mvc.perform(delete("/api/notificaciones/{id}", pedido).header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isOk());
        mvc.perform(delete("/api/notificaciones").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isOk());
        mvc.perform(get("/api/notificaciones").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos.contenido", hasSize(0)));
        mvc.perform(get("/api/notificaciones").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.contenido", hasSize(1)));
        mvc.perform(get("/api/notificaciones")).andExpect(status().isUnauthorized());
    }
}
