package com.gc.back.pedido;

import com.gc.back.PruebaIntegracion;
import com.gc.back.pedido.service.PedidoService;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import java.time.Duration;
import java.time.Instant;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Apartados con anticipo: confirmar, liquidar, cancelar, vencer y el tope por cliente. */
class ApartadoTest extends PruebaIntegracion {

    @Autowired
    private PedidoService pedidoService;

    @Test
    void elApartadoReservaPiezasYSeLiquida() throws Exception {
        String vendedor = usuarioConRoles("vende.aparta@prueba.com", "VENDEDOR");
        String cliente = usuarioConRoles("cliente.aparta@prueba.com", "CLIENTE");
        Integer mueble = muebleListo("Mesa Aparta", 5, vendedor);

        Integer pedido = id(apartar(mueble, 2, cliente).andExpect(status().isCreated())
                .andExpect(jsonPath("$.datos.estado").value("SOLICITADO"))
                .andExpect(jsonPath("$.datos.apartado.anticipo").value(nullValue())));
        mvc.perform(get("/api/pedidos/{id}", pedido).header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos.acciones", hasItem("APARTADO")));

        confirmar(pedido, "300.00", 7, cliente).andExpect(status().isForbidden());
        confirmar(pedido, "1998.00", 7, vendedor).andExpect(status().isBadRequest());
        confirmar(pedido, "300.00", 31, vendedor).andExpect(status().isBadRequest());
        confirmar(pedido, "300.00", 7, vendedor).andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.estado").value("APARTADO"))
                .andExpect(jsonPath("$.datos.apartado.anticipo").value(300.0))
                .andExpect(jsonPath("$.datos.apartado.resta").value(1698.0));
        existencias("Mesa Aparta", vendedor, 3);

        estado(pedido, "{\"estado\":\"VENCIDO\"}", vendedor).andExpect(status().isBadRequest());
        estado(pedido, "{\"estado\":\"ACEPTADO\"}", cliente).andExpect(status().isForbidden());
        estado(pedido, "{\"estado\":\"ACEPTADO\"}", vendedor).andExpect(status().isOk());
        existencias("Mesa Aparta", vendedor, 3);

        Integer otro = id(apartar(mueble, 1, cliente));
        confirmar(otro, "100.00", 3, vendedor).andExpect(status().isOk());
        existencias("Mesa Aparta", vendedor, 2);
        estado(otro, "{\"estado\":\"CANCELADO\"}", vendedor).andExpect(status().isBadRequest());
        estado(otro, "{\"estado\":\"CANCELADO\",\"motivo\":\"Sin respuesta\"}", vendedor).andExpect(status().isOk());
        existencias("Mesa Aparta", vendedor, 3);
    }

    @Test
    void elApartadoVenceSoloYHayTopePorCliente() throws Exception {
        String vendedor = usuarioConRoles("vende.vence@prueba.com", "VENDEDOR");
        String cliente = usuarioConRoles("cliente.vence@prueba.com", "CLIENTE");
        Integer mueble = muebleListo("Mesa Vence", 10, vendedor);

        Integer pedido = id(apartar(mueble, 1, cliente));
        confirmar(pedido, "200.00", 1, vendedor).andExpect(status().isOk());
        existencias("Mesa Vence", vendedor, 9);

        pedidoService.avisarApartadosPorVencer(Instant.now());
        mvc.perform(get("/api/pedidos/{id}/mensajes", pedido).header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos[*].texto", hasItem(org.hamcrest.Matchers.startsWith("Quedan menos de 24 horas"))));

        pedidoService.vencerApartados(Instant.now().plus(Duration.ofDays(2)));
        mvc.perform(get("/api/pedidos/{id}", pedido).header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.estado").value("VENCIDO"))
                .andExpect(jsonPath("$.datos.acciones").isEmpty());
        existencias("Mesa Vence", vendedor, 10);

        for (int i = 0; i < 3; i++) {
            apartar(mueble, 1, cliente).andExpect(status().isCreated());
        }
        apartar(mueble, 1, cliente).andExpect(status().isBadRequest());
    }

    private ResultActions apartar(Integer mueble, int cantidad, String token) throws Exception {
        return mvc.perform(post("/api/pedidos").header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"muebleId":%d,"cantidad":%d,"apartar":true,"tipoEntrega":"RECOGER",
                         "nombreRecibe":"Ana Ruiz","telefono":"55 1234 5678"}""".formatted(mueble, cantidad)));
    }

    private ResultActions confirmar(Integer pedido, String anticipo, int dias, String token) throws Exception {
        return mvc.perform(patch("/api/pedidos/{id}/apartado", pedido).header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"anticipo\":%s,\"dias\":%d}".formatted(anticipo, dias)));
    }

    private ResultActions estado(Integer pedido, String json, String token) throws Exception {
        return mvc.perform(patch("/api/pedidos/{id}/estado", pedido).header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private void existencias(String nombre, String token, int esperadas) throws Exception {
        mvc.perform(get("/api/muebles/gestion").param("buscar", nombre).header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(jsonPath("$.datos.contenido[0].existencias").value(esperadas));
    }

    private static Integer id(ResultActions resultado) throws Exception {
        return JsonPath.read(resultado.andReturn().getResponse().getContentAsString(), "$.datos.id");
    }
}
