package com.gc.back.pedido;

import com.gc.back.PruebaIntegracion;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Transportista: asignación al enviar, entregas propias, cobro y "no se pudo entregar". */
class EntregaTest extends PruebaIntegracion {

    private static final String DOMICILIO = """
            "tipoEntrega":"DOMICILIO","nombreRecibe":"Ana Ruiz","telefono":"55 1234 5678",
            "direccion":"Calle Roble 12","ciudad":"Puebla","codigoPostal":"72000\"""";

    @Test
    void elTransportistaEntregaYCobra() throws Exception {
        String vendedor = usuarioConRoles("vende.entrega@prueba.com", "VENDEDOR");
        String cliente = usuarioConRoles("cliente.entrega@prueba.com", "CLIENTE");
        String chofer = transportistaDe(vendedor, "chofer.uno@prueba.com");
        String otro = transportistaDe(vendedor, "chofer.dos@prueba.com");
        Integer mueble = muebleListo("Mesa Entrega", 5, vendedor);
        Integer idChofer = idUsuario("chofer.uno@prueba.com");

        pedir(mueble, "", cliente).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.metodoPago").value("Elige cómo vas a pagar"));
        Integer pedido = id(pedir(mueble, "\"metodoPago\":\"TARJETA\",", cliente).andExpect(status().isCreated())
                .andExpect(jsonPath("$.datos.metodoPago").value("TARJETA")));

        mvc.perform(get("/api/transportistas").header(HttpHeaders.AUTHORIZATION, cliente)).andExpect(status().isForbidden());
        mvc.perform(get("/api/transportistas").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos[*].nombre", hasItem("Usuario chofer.uno@prueba.com")));

        estado(pedido, "{\"estado\":\"ACEPTADO\"}", vendedor).andExpect(status().isOk());
        Integer vendedorId = idUsuario("vende.entrega@prueba.com");
        estado(pedido, "{\"estado\":\"EN_CAMINO\",\"transportistaId\":%d}".formatted(vendedorId), vendedor)
                .andExpect(status().isBadRequest());
        estado(pedido, "{\"estado\":\"EN_CAMINO\",\"transportistaId\":%d}".formatted(idChofer), vendedor)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.transportista.id").value(idChofer));

        mvc.perform(get("/api/pedidos/{id}", pedido).header(HttpHeaders.AUTHORIZATION, chofer)).andExpect(status().isNotFound());
        mvc.perform(get("/api/entregas/{id}", pedido).header(HttpHeaders.AUTHORIZATION, otro)).andExpect(status().isNotFound());
        mvc.perform(get("/api/entregas").header(HttpHeaders.AUTHORIZATION, cliente)).andExpect(status().isForbidden());
        mvc.perform(get("/api/entregas").header(HttpHeaders.AUTHORIZATION, chofer))
                .andExpect(jsonPath("$.datos.contenido[0].id").value(pedido))
                .andExpect(jsonPath("$.datos.contenido[0].entrega.direccion").value("Calle Roble 12"))
                .andExpect(jsonPath("$.datos.contenido[0].porCobrar").value(1998.0));

        mvc.perform(post("/api/entregas/{id}/entregada", pedido).header(HttpHeaders.AUTHORIZATION, chofer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.estado").value("ENTREGADO"))
                .andExpect(jsonPath("$.datos.entrega").doesNotExist());
        mvc.perform(post("/api/entregas/{id}/entregada", pedido).header(HttpHeaders.AUTHORIZATION, chofer))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/pedidos/{id}", pedido).header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.estado").value("ENTREGADO"))
                .andExpect(jsonPath("$.datos.cobradoEn").isNotEmpty());
        mvc.perform(get("/api/entregas").param("pendientes", "false").header(HttpHeaders.AUTHORIZATION, chofer))
                .andExpect(jsonPath("$.datos.contenido[0].entrega").doesNotExist());
    }

    @Test
    void siNoSePuedeEntregarRegresaAlVendedor() throws Exception {
        String vendedor = usuarioConRoles("vende.falla@prueba.com", "VENDEDOR");
        String cliente = usuarioConRoles("cliente.falla@prueba.com", "CLIENTE");
        String chofer = transportistaDe(vendedor, "chofer.falla@prueba.com");
        Integer mueble = muebleListo("Mesa Falla", 5, vendedor);
        Integer idChofer = idUsuario("chofer.falla@prueba.com");

        Integer pedido = id(pedir(mueble, "\"metodoPago\":\"EFECTIVO\",", cliente));
        estado(pedido, "{\"estado\":\"ACEPTADO\"}", vendedor).andExpect(status().isOk());
        estado(pedido, "{\"estado\":\"EN_CAMINO\",\"transportistaId\":%d}".formatted(idChofer), vendedor)
                .andExpect(status().isOk());

        mvc.perform(post("/api/entregas/{id}/no-entregada", pedido).header(HttpHeaders.AUTHORIZATION, chofer)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/entregas/{id}/no-entregada", pedido).header(HttpHeaders.AUTHORIZATION, chofer)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"Nadie en casa\"}"))
                .andExpect(status().isOk());

        mvc.perform(get("/api/pedidos/{id}", pedido).header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos.estado").value("ACEPTADO"))
                .andExpect(jsonPath("$.datos.transportista").doesNotExist())
                .andExpect(jsonPath("$.datos.acciones", hasItem("EN_CAMINO")));
        mvc.perform(get("/api/pedidos/{id}/mensajes", pedido).header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos[*].texto", hasItem(startsWith("Usuario chofer.falla@prueba.com no pudo entregar"))));
        mvc.perform(get("/api/entregas/{id}", pedido).header(HttpHeaders.AUTHORIZATION, chofer))
                .andExpect(status().isNotFound());

        // Sin transportista lo entrega el vendedor, que confirma el cobro.
        estado(pedido, "{\"estado\":\"EN_CAMINO\"}", vendedor).andExpect(status().isOk());
        estado(pedido, "{\"estado\":\"ENTREGADO\"}", vendedor).andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.cobradoEn").isNotEmpty());
    }

    private ResultActions pedir(Integer mueble, String pago, String token) throws Exception {
        return mvc.perform(post("/api/pedidos").header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"muebleId\":%d,\"cantidad\":2,%s%s}".formatted(mueble, pago, DOMICILIO)));
    }

    private ResultActions estado(Integer pedido, String json, String token) throws Exception {
        return mvc.perform(patch("/api/pedidos/{id}/estado", pedido).header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private Integer idUsuario(String email) throws Exception {
        String admin = "Bearer " + accessToken(ADMIN_EMAIL, ADMIN_PASSWORD);
        String lista = mvc.perform(get("/api/usuarios").param("buscar", email).header(HttpHeaders.AUTHORIZATION, admin))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(lista, "$.datos.contenido[0].id");
    }

    private static Integer id(ResultActions resultado) throws Exception {
        return JsonPath.read(resultado.andReturn().getResponse().getContentAsString(), "$.datos.id");
    }
}
