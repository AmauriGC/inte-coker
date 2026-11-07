package com.gc.back.resena;

import com.gc.back.PruebaIntegracion;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Me gusta, reseñas de compra verificada, respuesta del vendedor, moderación y orden del catálogo. */
class ResenaTest extends PruebaIntegracion {

    private static final String ENTREGA = """
            "metodoPago":"EFECTIVO","tipoEntrega":"DOMICILIO","nombreRecibe":"Ana Ruiz","telefono":"55 1234 5678",
            "direccion":"Calle Roble 12","ciudad":"CDMX","codigoPostal":"01000\"""";

    @Test
    void meGustaEsUnoPorCuentaYCuentaEnElMueble() throws Exception {
        String vendedor = usuarioConRoles("vende.gusta@prueba.com", "VENDEDOR");
        String cliente = usuarioConRoles("cliente.gusta@prueba.com", "CLIENTE");
        String otro = usuarioConRoles("otro.gusta@prueba.com", "VENDEDOR");
        Integer mueble = muebleListo("Mesa Gusta", 3, vendedor);

        mvc.perform(put("/api/muebles/{id}/me-gusta", mueble)).andExpect(status().isUnauthorized());
        meGusta(mueble, cliente, true).andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.meGusta").value(true))
                .andExpect(jsonPath("$.datos.total").value(1));
        meGusta(mueble, cliente, true).andExpect(jsonPath("$.datos.total").value(1));
        meGusta(mueble, otro, true).andExpect(jsonPath("$.datos.total").value(2));
        meGusta(mueble, cliente, false).andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.meGusta").value(false))
                .andExpect(jsonPath("$.datos.total").value(1));

        mvc.perform(get("/api/muebles/{id}/resenas/resumen", mueble).header(HttpHeaders.AUTHORIZATION, otro))
                .andExpect(jsonPath("$.datos.meGusta").value(true))
                .andExpect(jsonPath("$.datos.totalMeGusta").value(1))
                .andExpect(jsonPath("$.datos.puedeResenar").value(false));
        mvc.perform(get("/api/muebles/gestion").param("buscar", "Mesa Gusta").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos.contenido[0].totalMeGusta").value(1));
    }

    @Test
    void soloQuienRecibioElMuebleLoResenaYElPromedioSeRecalcula() throws Exception {
        String vendedor = usuarioConRoles("vende.resena@prueba.com", "VENDEDOR");
        String cliente = usuarioConRoles("cliente.resena@prueba.com", "CLIENTE");
        String curioso = usuarioConRoles("curioso.resena@prueba.com", "CLIENTE");
        String admin = "Bearer " + accessToken(ADMIN_EMAIL, ADMIN_PASSWORD);
        Integer mueble = muebleListo("Mesa Resena", 5, vendedor);

        mvc.perform(get("/api/muebles/{id}/resenas/resumen", mueble)).andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.total").value(0))
                .andExpect(jsonPath("$.datos.puedeResenar").value(false))
                .andExpect(jsonPath("$.datos.distribucion", hasSize(5)));
        resenar(mueble, 4, "Sin recibirlo", cliente).andExpect(status().isForbidden());

        Integer pedido = id(mvc.perform(post("/api/pedidos").header(HttpHeaders.AUTHORIZATION, cliente)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"muebleId\":%d,\"cantidad\":1,%s}".formatted(mueble, ENTREGA))));
        for (String estado : new String[]{"ACEPTADO", "EN_CAMINO", "ENTREGADO"}) {
            mvc.perform(patch("/api/pedidos/{id}/estado", pedido).header(HttpHeaders.AUTHORIZATION, vendedor)
                            .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"%s\"}".formatted(estado)))
                    .andExpect(status().isOk());
        }

        mvc.perform(get("/api/muebles/{id}/resenas/resumen", mueble).header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.puedeResenar").value(true));
        resenar(mueble, 6, "Demasiadas", cliente).andExpect(status().isBadRequest());
        resenar(mueble, 4, "Muy firme", cliente).andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.autor").value("Usuario C."))
                .andExpect(jsonPath("$.datos.editada").value(false));
        Integer resena = id(resenar(mueble, 5, "Muy firme, la recomiendo", cliente)
                .andExpect(jsonPath("$.datos.editada").value(true)));
        resenar(mueble, 5, "Otra cuenta", curioso).andExpect(status().isForbidden());

        mvc.perform(get("/api/muebles/{id}/resenas/resumen", mueble).header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.total").value(1))
                .andExpect(jsonPath("$.datos.promedio").value(5.0))
                .andExpect(jsonPath("$.datos.distribucion[0].total").value(1))
                .andExpect(jsonPath("$.datos.miResena.estrellas").value(5));
        mvc.perform(get("/api/muebles").param("sort", "calificacion,desc").param("size", "1"))
                .andExpect(jsonPath("$.datos.contenido[0].calificacion").value(5.0));

        mvc.perform(post("/api/resenas/{id}/respuesta", resena).header(HttpHeaders.AUTHORIZATION, curioso)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"texto\":\"No soy el vendedor\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/resenas/{id}/respuesta", resena).header(HttpHeaders.AUTHORIZATION, vendedor)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"texto\":\"Gracias por tu compra\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.respuesta").value("Gracias por tu compra"));
        mvc.perform(get("/api/muebles/{id}/resenas", mueble).param("orden", "mejores"))
                .andExpect(jsonPath("$.datos.contenido", hasSize(1)))
                .andExpect(jsonPath("$.datos.contenido[0].propia").value(false));

        mvc.perform(get("/api/resenas").header(HttpHeaders.AUTHORIZATION, cliente)).andExpect(status().isForbidden());
        mvc.perform(patch("/api/resenas/{id}/oculta", resena).header(HttpHeaders.AUTHORIZATION, admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"oculta\":true}"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/muebles/{id}/resenas/resumen", mueble))
                .andExpect(jsonPath("$.datos.total").value(0))
                .andExpect(jsonPath("$.datos.promedio").value(0.0));
        mvc.perform(get("/api/muebles/{id}/resenas", mueble)).andExpect(jsonPath("$.datos.contenido", hasSize(0)));
        mvc.perform(get("/api/resenas").param("oculta", "true").param("buscar", "Mesa Resena")
                        .header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(jsonPath("$.datos.contenido[0].mueble.nombre").value("Mesa Resena"));
    }

    private ResultActions meGusta(Integer mueble, String token, boolean dar) throws Exception {
        var peticion = dar ? put("/api/muebles/{id}/me-gusta", mueble) : delete("/api/muebles/{id}/me-gusta", mueble);
        return mvc.perform(peticion.header(HttpHeaders.AUTHORIZATION, token));
    }

    private ResultActions resenar(Integer mueble, int estrellas, String texto, String token) throws Exception {
        return mvc.perform(put("/api/muebles/{id}/resenas", mueble).header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"estrellas\":%d,\"texto\":\"%s\"}".formatted(estrellas, texto)));
    }

    private static Integer id(ResultActions resultado) throws Exception {
        return JsonPath.read(resultado.andReturn().getResponse().getContentAsString(), "$.datos.id");
    }
}
