package com.gc.back.cuenta;

import com.gc.back.PruebaIntegracion;
import com.gc.back.correo.dto.AvisoCorreo;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Mi cuenta: nombre y foto, direcciones guardadas y "avísame cuando haya". */
class CuentaTest extends PruebaIntegracion {

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n', 0, 0, 0, 0};

    @Test
    void editoMiNombreYMiFoto() throws Exception {
        String cliente = usuarioConRoles("cliente.cuenta@prueba.com", "CLIENTE");

        mvc.perform(put("/api/cuenta/perfil").header(HttpHeaders.AUTHORIZATION, cliente)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\" \"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(put("/api/cuenta/perfil").header(HttpHeaders.AUTHORIZATION, cliente)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"  Ana Nueva \"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.nombre").value("Ana Nueva"));

        mvc.perform(multipart("/api/cuenta/foto").file(new MockMultipartFile("archivo", "foto.png",
                        MediaType.APPLICATION_OCTET_STREAM_VALUE, PNG)).header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.fotoUrl").value(startsWith("/uploads/usuarios/")));
        mvc.perform(get("/api/auth/yo").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.nombre").value("Ana Nueva"))
                .andExpect(jsonPath("$.datos.fotoUrl").value(startsWith("/uploads/usuarios/")));
        mvc.perform(delete("/api/cuenta/foto").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.fotoUrl").value(nullValue()));
        mvc.perform(put("/api/cuenta/perfil").contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"Nadie\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void suboYQuitoMiPortada() throws Exception {
        String chofer = usuarioConRoles("portada.cuenta@prueba.com", "CLIENTE");
        mvc.perform(multipart("/api/cuenta/portada").file(new MockMultipartFile("archivo", "portada.png",
                        MediaType.APPLICATION_OCTET_STREAM_VALUE, PNG)).header(HttpHeaders.AUTHORIZATION, chofer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.portadaUrl").value(startsWith("/uploads/usuarios/")))
                .andExpect(jsonPath("$.datos.fotoUrl").value(nullValue()));
        mvc.perform(delete("/api/cuenta/portada").header(HttpHeaders.AUTHORIZATION, chofer))
                .andExpect(jsonPath("$.datos.portadaUrl").value(nullValue()));
    }

    @Test
    void cambioMiContrasenaConLaActual() throws Exception {
        String email = "password.cuenta@prueba.com";
        String yo = usuarioConRoles(email, "CLIENTE");

        cambiar(yo, "Otra2026x", "Nueva2026x", "Nueva2026x")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("Tu contraseña actual no es correcta"));
        cambiar(yo, PASSWORD, "Nueva2026x", "Distinta2026x")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("La confirmación no coincide con la nueva contraseña"));
        cambiar(yo, PASSWORD, PASSWORD, PASSWORD)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("La nueva contraseña debe ser distinta de la actual"));
        cambiar(yo, PASSWORD, "corta", "corta")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.nueva").exists());

        cambiar(yo, PASSWORD, "Nueva2026x", "Nueva2026x").andExpect(status().isOk());
        login(email, PASSWORD).andExpect(status().isUnauthorized());
        login(email, "Nueva2026x").andExpect(status().isOk());
        verify(correoService, timeout(5000)).enviarAviso(argThat((AvisoCorreo a) -> a.email().equals(email)
                && a.asunto().equals("Cambiaste tu contraseña")));
        cambiar(null, PASSWORD, "Nueva2026x", "Nueva2026x").andExpect(status().isUnauthorized());
    }

    private ResultActions cambiar(String token, String actual, String nueva, String confirmacion) throws Exception {
        var peticion = put("/api/cuenta/password").contentType(MediaType.APPLICATION_JSON)
                .content("{\"actual\":\"%s\",\"nueva\":\"%s\",\"confirmacion\":\"%s\"}".formatted(actual, nueva, confirmacion));
        return mvc.perform(token == null ? peticion : peticion.header(HttpHeaders.AUTHORIZATION, token));
    }

    @Test
    void guardoHastaCincoDireccionesConUnaPredeterminada() throws Exception {
        String ana = usuarioConRoles("cliente.direcciones@prueba.com", "CLIENTE");
        String beto = usuarioConRoles("otro.direcciones@prueba.com", "CLIENTE");

        String casa = guardar("Casa", false, ana).andExpect(status().isCreated())
                .andExpect(jsonPath("$.datos[0].predeterminada").value(true))
                .andReturn().getResponse().getContentAsString();
        Integer idCasa = JsonPath.read(casa, "$.datos[0].id");
        guardar("Oficina", true, ana)
                .andExpect(jsonPath("$.datos[0].alias").value("Oficina"))
                .andExpect(jsonPath("$.datos[1].predeterminada").value(false));
        mvc.perform(patch("/api/cuenta/direcciones/{id}/predeterminada", idCasa).header(HttpHeaders.AUTHORIZATION, ana))
                .andExpect(jsonPath("$.datos[0].alias").value("Casa"));
        mvc.perform(delete("/api/cuenta/direcciones/{id}", idCasa).header(HttpHeaders.AUTHORIZATION, beto))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/cuenta/direcciones/{id}", idCasa).header(HttpHeaders.AUTHORIZATION, ana))
                .andExpect(jsonPath("$.datos", hasSize(1)))
                .andExpect(jsonPath("$.datos[0].predeterminada").value(true));

        for (int i = 0; i < 4; i++) {
            guardar("Otra " + i, false, ana).andExpect(status().isCreated());
        }
        guardar("Sobra", false, ana).andExpect(status().isBadRequest());
        mvc.perform(post("/api/cuenta/direcciones").header(HttpHeaders.AUTHORIZATION, beto)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"alias\":\"Casa\",\"codigoPostal\":\"12\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.codigoPostal").value("El código postal tiene 5 dígitos"));
    }

    @Test
    void meAvisanCuandoVuelveAHaber() throws Exception {
        String vendedor = usuarioConRoles("vende.avisame@prueba.com", "VENDEDOR");
        String compra = usuarioConRoles("compra.avisame@prueba.com", "CLIENTE");
        String espera = usuarioConRoles("espera.avisame@prueba.com", "CLIENTE");
        Integer mueble = muebleListo("Mesa Avisame", 1, vendedor);

        avisame(mueble, espera, post("/api/muebles/{id}/avisame", mueble)).andExpect(status().isBadRequest());

        String creado = mvc.perform(post("/api/pedidos").header(HttpHeaders.AUTHORIZATION, compra)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"muebleId\":%d,\"cantidad\":1,\"metodoPago\":\"EFECTIVO\",\"tipoEntrega\":\"RECOGER\",\"nombreRecibe\":\"Ana\"}"
                                .formatted(mueble)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        Integer pedido = JsonPath.read(creado, "$.datos.id");
        estado(pedido, "ACEPTADO", vendedor);

        avisame(mueble, vendedor, post("/api/muebles/{id}/avisame", mueble)).andExpect(status().isBadRequest());
        avisame(mueble, espera, post("/api/muebles/{id}/avisame", mueble)).andExpect(status().isOk())
                .andExpect(jsonPath("$.datos", contains(nullValue())));
        avisame(mueble, espera, post("/api/muebles/{id}/avisame", mueble)).andExpect(jsonPath("$.datos", hasSize(1)));

        // El cliente cancela: la pieza regresa y se avisa a quien esperaba.
        estado(pedido, "CANCELADO", compra);
        verify(correoService, timeout(5000)).enviarAviso(argThat((AvisoCorreo a) ->
                a.email().equals("espera.avisame@prueba.com") && a.asunto().equals("Ya hay Mesa Avisame")));
        avisame(mueble, espera, get("/api/muebles/{id}/avisame", mueble)).andExpect(jsonPath("$.datos", empty()));
    }

    private ResultActions guardar(String alias, boolean predeterminada, String token) throws Exception {
        return mvc.perform(post("/api/cuenta/direcciones").header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"alias":"%s","nombreRecibe":"Ana Ruiz","telefono":"55 1234 5678","direccion":"Calle Roble 12",
                         "ciudad":"Puebla","codigoPostal":"72000","predeterminada":%s}""".formatted(alias, predeterminada)));
    }

    private ResultActions avisame(Integer mueble, String token,
                                  org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder peticion)
            throws Exception {
        return mvc.perform(peticion.header(HttpHeaders.AUTHORIZATION, token));
    }

    private void estado(Integer pedido, String estado, String token) throws Exception {
        mvc.perform(patch("/api/pedidos/{id}/estado", pedido).header(HttpHeaders.AUTHORIZATION, token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"%s\"}".formatted(estado)))
                .andExpect(status().isOk());
    }
}
