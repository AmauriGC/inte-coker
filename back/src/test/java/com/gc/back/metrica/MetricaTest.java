package com.gc.back.metrica;

import com.gc.back.PruebaIntegracion;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Vistas y métricas: lo propio para el vendedor y toda la tienda para el administrador. */
class MetricaTest extends PruebaIntegracion {

    @Test
    void elVendedorVeSusVentasZonasYConversion() throws Exception {
        String vendedor = usuarioConRoles("vende.metrica@prueba.com", "VENDEDOR");
        String cliente = usuarioConRoles("cliente.metrica@prueba.com", "CLIENTE");
        Integer mueble = muebleListo("Mesa Metrica", 5, vendedor);

        mvc.perform(post("/api/muebles/{id}/vista", mueble)).andExpect(status().isOk());
        mvc.perform(post("/api/muebles/{id}/vista", mueble)).andExpect(status().isOk());
        mvc.perform(post("/api/muebles/{id}/vista", mueble).header(HttpHeaders.AUTHORIZATION, cliente)).andExpect(status().isOk());
        mvc.perform(post("/api/muebles/{id}/vista", mueble).header(HttpHeaders.AUTHORIZATION, vendedor)).andExpect(status().isOk());
        mvc.perform(post("/api/muebles/{id}/vista", 999999)).andExpect(status().isNotFound());

        String creado = mvc.perform(post("/api/pedidos").header(HttpHeaders.AUTHORIZATION, cliente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"muebleId":%d,"cantidad":2,"metodoPago":"EFECTIVO","tipoEntrega":"DOMICILIO",
                                 "nombreRecibe":"Ana Ruiz","telefono":"55 1234 5678","direccion":"Calle Roble 12",
                                 "ciudad":"Puebla","codigoPostal":"72000"}""".formatted(mueble)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        Integer pedido = JsonPath.read(creado, "$.datos.id");
        for (String estado : new String[]{"ACEPTADO", "EN_CAMINO", "ENTREGADO"}) {
            mvc.perform(patch("/api/pedidos/{id}/estado", pedido).header(HttpHeaders.AUTHORIZATION, vendedor)
                            .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"%s\"}".formatted(estado)))
                    .andExpect(status().isOk());
        }

        mvc.perform(get("/api/metricas").param("dias", "7").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.periodo.tienda").value(false))
                .andExpect(jsonPath("$.datos.periodo.agrupacion").value("DIA"))
                .andExpect(jsonPath("$.datos.serie", hasSize(7)))
                .andExpect(jsonPath("$.datos.resumen.ventas").value(1))
                .andExpect(jsonPath("$.datos.resumen.piezas").value(2))
                .andExpect(jsonPath("$.datos.resumen.ingresos").value(1998.0))
                .andExpect(jsonPath("$.datos.resumen.pedidos").value(1))
                .andExpect(jsonPath("$.datos.resumen.vistas").value(3))
                .andExpect(jsonPath("$.datos.resumen.conversion").value(33.3))
                .andExpect(jsonPath("$.datos.ciudades[0].nombre").value("Puebla"))
                .andExpect(jsonPath("$.datos.codigosPostales[0].nombre").value("72000"))
                .andExpect(jsonPath("$.datos.muebles[0].nombre").value("Mesa Metrica"))
                .andExpect(jsonPath("$.datos.muebles[0].vendidos").value(2))
                .andExpect(jsonPath("$.datos.pagos.EFECTIVO").value(1))
                .andExpect(jsonPath("$.datos.pagos.TARJETA").value(0));

        // Sin METRICA_GLOBAL, tienda=true se queda en lo propio.
        mvc.perform(get("/api/metricas").param("tienda", "true").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos.periodo.tienda").value(false));
        mvc.perform(get("/api/metricas").param("dias", "90").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos.periodo.agrupacion").value("SEMANA"));
        mvc.perform(get("/api/metricas").param("dias", "400").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/metricas").header(HttpHeaders.AUTHORIZATION, cliente)).andExpect(status().isForbidden());

        String admin = "Bearer " + accessToken(ADMIN_EMAIL, ADMIN_PASSWORD);
        mvc.perform(get("/api/metricas").param("tienda", "true").header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.periodo.tienda").value(true))
                .andExpect(jsonPath("$.datos.resumen.ventas", greaterThanOrEqualTo(1)));
    }
}
