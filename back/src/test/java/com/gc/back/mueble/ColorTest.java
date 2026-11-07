package com.gc.back.mueble;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Colores en existencia: la suma del mueble, el color al pedir y el descuento por color. */
class ColorTest extends PruebaIntegracion {

    private static final String ENTREGA = """
            "tipoEntrega":"RECOGER","nombreRecibe":"Ana Ruiz","telefono":"55 1234 5678\"""";

    @Test
    void lasExistenciasSonLaSumaYSeValidanLosColores() throws Exception {
        String vendedor = usuarioConRoles("vende.color@prueba.com", "VENDEDOR");
        Integer mueble = muebleListo("Mesa Color", 3, vendedor);

        guardar(mueble, """
                [{"nombre":"Roble","hex":"#a0743c","existencias":2},{"nombre":"roble","hex":"#000000","existencias":1}]""", vendedor)
                .andExpect(status().isBadRequest());
        guardar(mueble, "[{\"nombre\":\"Roble\",\"hex\":\"rojo\",\"existencias\":2}]", vendedor)
                .andExpect(status().isBadRequest());
        guardar(mueble, "[" + "{\"nombre\":\"C%d\",\"hex\":\"#111111\",\"existencias\":1},".repeat(9)
                .formatted(1, 2, 3, 4, 5, 6, 7, 8, 9).replaceAll(",$", "") + "]", vendedor)
                .andExpect(status().isBadRequest());

        guardar(mueble, """
                [{"nombre":"Roble","hex":"#a0743c","existencias":2},{"nombre":"Nogal","hex":"#5B3A24","existencias":3}]""", vendedor)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.existencias").value(5))
                .andExpect(jsonPath("$.datos.variantes", hasSize(2)))
                .andExpect(jsonPath("$.datos.variantes[0].hex").value("#A0743C"))
                .andExpect(jsonPath("$.datos.variantes[1].nombre").value("Nogal"));

        Integer roble = variante(mueble, 0, vendedor);
        guardar(mueble, """
                [{"id":%d,"nombre":"Roble claro","hex":"#C09060","existencias":4}]""".formatted(roble), vendedor)
                .andExpect(jsonPath("$.datos.existencias").value(4))
                .andExpect(jsonPath("$.datos.variantes[0].id").value(roble))
                .andExpect(jsonPath("$.datos.variantes", hasSize(1)));

        guardar(mueble, "[]", vendedor)
                .andExpect(jsonPath("$.datos.variantes", hasSize(0)))
                .andExpect(jsonPath("$.datos.existencias").value(7));
    }

    @Test
    void elPedidoLlevaColorYDescuentaDeEse() throws Exception {
        String vendedor = usuarioConRoles("vende.pedidocolor@prueba.com", "VENDEDOR");
        String cliente = usuarioConRoles("cliente.color@prueba.com", "CLIENTE");
        Integer mueble = muebleListo("Mesa Pedido Color", 1, vendedor);
        Integer otro = muebleListo("Mesa Otro Color", 1, vendedor);
        guardar(mueble, """
                [{"nombre":"Arena","hex":"#D9C4A0","existencias":2},{"nombre":"Azul","hex":"#44506A","existencias":0}]""", vendedor)
                .andExpect(status().isOk());
        guardar(otro, "[{\"nombre\":\"Verde\",\"hex\":\"#8FA184\",\"existencias\":5}]", vendedor).andExpect(status().isOk());
        Integer arena = variante(mueble, 0, vendedor);
        Integer azul = variante(mueble, 1, vendedor);
        Integer verde = variante(otro, 0, vendedor);

        pedir(mueble, null, 1, cliente).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("Elige el color"));
        pedir(mueble, azul, 1, cliente).andExpect(status().isBadRequest());
        pedir(mueble, verde, 1, cliente).andExpect(status().isBadRequest());
        pedir(mueble, arena, 3, cliente).andExpect(status().isBadRequest());
        Integer pedido = JsonPath.read(pedir(mueble, arena, 2, cliente).andExpect(status().isCreated())
                .andExpect(jsonPath("$.datos.color.nombre").value("Arena"))
                .andExpect(jsonPath("$.datos.color.hex").value("#D9C4A0"))
                .andReturn().getResponse().getContentAsString(), "$.datos.id");

        estado(pedido, "{\"estado\":\"ACEPTADO\"}", vendedor).andExpect(status().isOk());
        mvc.perform(get("/api/muebles/gestion").param("buscar", "Mesa Pedido Color").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos.contenido[0].existencias").value(0))
                .andExpect(jsonPath("$.datos.contenido[0].variantes[0].existencias").value(0));

        estado(pedido, "{\"estado\":\"CANCELADO\",\"motivo\":\"Cambié de opinión\"}", cliente).andExpect(status().isOk());
        mvc.perform(get("/api/muebles/gestion").param("buscar", "Mesa Pedido Color").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos.contenido[0].existencias").value(2))
                .andExpect(jsonPath("$.datos.contenido[0].variantes[0].existencias").value(2));

        guardar(mueble, "[{\"id\":%d,\"nombre\":\"Azul\",\"hex\":\"#44506A\",\"existencias\":1}]".formatted(azul), vendedor)
                .andExpect(status().isOk());
        mvc.perform(get("/api/pedidos/{id}", pedido).header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.color.nombre").value("Arena"));
    }

    /** PUT del mueble con los datos de muebleListo y los colores indicados (JSON). */
    private ResultActions guardar(Integer mueble, String variantes, String token) throws Exception {
        String categorias = mvc.perform(get("/api/categorias").param("buscar", "Mesas"))
                .andReturn().getResponse().getContentAsString();
        Integer categoriaId = JsonPath.read(categorias, "$.datos.contenido[0].id");
        return mvc.perform(put("/api/muebles/{id}", mueble).header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON).content("""
                        {"nombre":"%s","precio":999.00,"anchoCm":100,"fondoCm":40,"altoCm":45,
                         "existencias":7,"categoriaId":%d,"variantes":%s}
                        """.formatted(nombre(mueble, token), categoriaId, variantes)));
    }

    private String nombre(Integer mueble, String token) throws Exception {
        String lista = mvc.perform(get("/api/muebles/gestion").param("size", "100").header(HttpHeaders.AUTHORIZATION, token))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.<java.util.List<String>>read(lista, "$.datos.contenido[?(@.id == %d)].nombre".formatted(mueble)).getFirst();
    }

    private Integer variante(Integer mueble, int indice, String token) throws Exception {
        String lista = mvc.perform(get("/api/muebles/gestion").param("size", "100").header(HttpHeaders.AUTHORIZATION, token))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.<java.util.List<Integer>>read(lista,
                "$.datos.contenido[?(@.id == %d)].variantes[%d].id".formatted(mueble, indice)).getFirst();
    }

    private ResultActions pedir(Integer mueble, Integer variante, int cantidad, String token) throws Exception {
        return mvc.perform(post("/api/pedidos").header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"muebleId\":%d,\"cantidad\":%d,\"varianteId\":%s,%s}".formatted(mueble, cantidad, variante, ENTREGA)));
    }

    private ResultActions estado(Integer pedido, String json, String token) throws Exception {
        return mvc.perform(patch("/api/pedidos/{id}/estado", pedido).header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON).content(json));
    }
}
