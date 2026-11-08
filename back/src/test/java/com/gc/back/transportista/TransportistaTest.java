package com.gc.back.transportista;

import com.gc.back.PruebaIntegracion;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Cada vendedor registra a sus transportistas; solo él los ve, los invita y los asigna. */
class TransportistaTest extends PruebaIntegracion {

    private static final String CHOFER = "chofer.propio@prueba.com";

    @Test
    void elVendedorRegistraASuTransportista() throws Exception {
        String vendedor = usuarioConRoles("vende.flota@prueba.com", "VENDEDOR");
        String otroVendedor = usuarioConRoles("vende.ajeno@prueba.com", "VENDEDOR");
        String cliente = usuarioConRoles("cliente.flota@prueba.com", "CLIENTE");

        registrar(cliente, "{\"nombre\":\"Leo\",\"email\":\"" + CHOFER + "\",\"telefono\":\"55 1111 2222\"}")
                .andExpect(status().isForbidden());
        registrar(vendedor, "{\"nombre\":\"Leo\",\"email\":\"no-es-correo\",\"telefono\":\"55 1111 2222\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.email").value("Escribe un correo válido"));
        Integer chofer = id(registrar(vendedor, "{\"nombre\":\"Leo Ruta\",\"email\":\"" + CHOFER + "\",\"telefono\":\"55 1111 2222\"}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.datos.invitacionPendiente").value(true))
                .andExpect(jsonPath("$.datos.activo").value(true)));
        registrar(vendedor, "{\"nombre\":\"Leo\",\"email\":\"" + CHOFER + "\",\"telefono\":\"55 1111 2222\"}")
                .andExpect(status().isConflict());

        // Sin activar no puede entrar.
        login(CHOFER, PASSWORD).andExpect(status().is4xxClientError());

        mvc.perform(get("/api/transportistas").header(HttpHeaders.AUTHORIZATION, otroVendedor))
                .andExpect(jsonPath("$.datos", hasSize(0)));
        mvc.perform(post("/api/transportistas/{id}/invitacion", chofer).header(HttpHeaders.AUTHORIZATION, otroVendedor))
                .andExpect(status().isNotFound());
        mvc.perform(post("/api/transportistas/{id}/invitacion", chofer).header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isOk());

        mvc.perform(post("/api/auth/activar").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"%s\",\"password\":\"corta\"}".formatted(tokenDeInvitacion(CHOFER))))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/auth/activar").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"%s\",\"password\":\"%s\"}".formatted(tokenDeInvitacion(CHOFER), PASSWORD)))
                .andExpect(status().isOk());
        String token = "Bearer " + accessToken(CHOFER, PASSWORD);
        mvc.perform(get("/api/entregas").header(HttpHeaders.AUTHORIZATION, token)).andExpect(status().isOk());

        mvc.perform(get("/api/transportistas").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos", hasSize(1)))
                .andExpect(jsonPath("$.datos[0].invitacionPendiente").value(false))
                .andExpect(jsonPath("$.datos[0].telefono").value("55 1111 2222"));
        mvc.perform(post("/api/transportistas/{id}/invitacion", chofer).header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isBadRequest());

        // Otro vendedor no puede mandar su pedido con este transportista.
        Integer mueble = muebleListo("Mesa Flota", 3, otroVendedor);
        Integer pedido = id(mvc.perform(post("/api/pedidos").header(HttpHeaders.AUTHORIZATION, cliente)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"muebleId":%d,"cantidad":1,"metodoPago":"EFECTIVO","tipoEntrega":"DOMICILIO",
                         "nombreRecibe":"Ana Ruiz","telefono":"55 1234 5678","direccion":"Calle Roble 12",
                         "ciudad":"Puebla","codigoPostal":"72000"}""".formatted(mueble))).andExpect(status().isCreated()));
        estado(pedido, "{\"estado\":\"ACEPTADO\"}", otroVendedor).andExpect(status().isOk());
        estado(pedido, "{\"estado\":\"EN_CAMINO\",\"transportistaId\":%d}".formatted(chofer), otroVendedor)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("Ese transportista no trabaja contigo"));

        mvc.perform(patch("/api/transportistas/{id}/activo", chofer).header(HttpHeaders.AUTHORIZATION, vendedor)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"activo\":false}"))
                .andExpect(jsonPath("$.datos.activo").value(false));
        login(CHOFER, PASSWORD).andExpect(status().is4xxClientError());
    }

    private ResultActions registrar(String token, String json) throws Exception {
        return mvc.perform(post("/api/transportistas").header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private ResultActions estado(Integer pedido, String json, String token) throws Exception {
        return mvc.perform(patch("/api/pedidos/{id}/estado", pedido).header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private static Integer id(ResultActions r) throws Exception {
        return JsonPath.read(r.andReturn().getResponse().getContentAsString(), "$.datos.id");
    }
}
