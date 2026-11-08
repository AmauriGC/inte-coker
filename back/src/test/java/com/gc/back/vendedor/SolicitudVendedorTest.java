package com.gc.back.vendedor;

import com.gc.back.PruebaIntegracion;
import com.gc.back.correo.dto.AvisoCorreo;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.hasItem;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Un cliente pide vender; el administrador la rechaza, luego la aprueba y la cuenta ya vende. */
class SolicitudVendedorTest extends PruebaIntegracion {

    private static final String EMAIL = "quiere.vender@prueba.com";

    @Test
    void unClientePideVenderYElAdminLaRevisa() throws Exception {
        String cliente = usuarioConRoles(EMAIL, "CLIENTE");
        String admin = "Bearer " + accessToken(ADMIN_EMAIL, ADMIN_PASSWORD);

        mvc.perform(get("/api/solicitud-vendedor").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos").doesNotExist());
        pedir(cliente, "Muebles").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.mensaje").value("Cuéntanos entre 20 y 500 caracteres"));

        Integer primera = id(pedir(cliente, "Hago mesas y sillas de madera de pino en mi taller.")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.datos.estado").value("PENDIENTE")));
        pedir(cliente, "Hago mesas y sillas de madera de pino en mi taller.").andExpect(status().isBadRequest());
        verify(correoService, timeout(5000)).enviarAviso(argThat((AvisoCorreo a) ->
                a.email().equals(ADMIN_EMAIL) && a.asunto().equals("Nueva solicitud para vender")));

        mvc.perform(get("/api/solicitudes-vendedor").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/solicitudes-vendedor").param("estado", "PENDIENTE").header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(jsonPath("$.datos.contenido[*].id", hasItem(primera)));

        mvc.perform(post("/api/solicitudes-vendedor/{id}/rechazar", primera).header(HttpHeaders.AUTHORIZATION, admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/solicitudes-vendedor/{id}/rechazar", primera).header(HttpHeaders.AUTHORIZATION, admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"motivo\":\"Faltan fotos de tus trabajos.\"}"))
                .andExpect(jsonPath("$.datos.estado").value("RECHAZADA"));
        mvc.perform(get("/api/solicitud-vendedor").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.motivo").value("Faltan fotos de tus trabajos."));

        Integer segunda = id(pedir(cliente, "Hago mesas y sillas de pino; ya subí fotos a mi perfil.")
                .andExpect(status().isCreated()));
        mvc.perform(post("/api/solicitudes-vendedor/{id}/aprobar", segunda).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(jsonPath("$.datos.estado").value("APROBADA"))
                .andExpect(jsonPath("$.datos.revisadoPor").isNotEmpty());
        mvc.perform(post("/api/solicitudes-vendedor/{id}/aprobar", segunda).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isBadRequest());

        mvc.perform(get("/api/auth/yo").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.roles", hasItem("VENDEDOR")))
                .andExpect(jsonPath("$.datos.roles", hasItem("CLIENTE")));
        mvc.perform(get("/api/notificaciones").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.contenido[0].titulo").value("Tu solicitud fue aprobada"))
                .andExpect(jsonPath("$.datos.contenido[0].tipo").value("exito"));
        pedir(cliente, "Quiero vender otra vez lo mismo de siempre.").andExpect(status().isBadRequest());
    }

    private ResultActions pedir(String token, String mensaje) throws Exception {
        return mvc.perform(post("/api/solicitud-vendedor").header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"ciudad\":\"Cuernavaca\",\"telefono\":\"777 123 4567\",\"mensaje\":\"%s\"}".formatted(mensaje)));
    }

    private static Integer id(ResultActions r) throws Exception {
        return JsonPath.read(r.andReturn().getResponse().getContentAsString(), "$.datos.id");
    }
}
