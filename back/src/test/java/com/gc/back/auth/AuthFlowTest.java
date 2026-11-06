package com.gc.back.auth;

import com.gc.back.PruebaIntegracion;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Flujo de la API de autenticación contra MySQL (base de pruebas).
 * El correo está deshabilitado; los tokens se capturan espiando CorreoService.
 */
class AuthFlowTest extends PruebaIntegracion {

    @Test
    void clienteSeRegistraVerificaEntraYRenuevaSesion() throws Exception {
        String email = "cliente.flujo@prueba.com";

        registrar("Ana Cliente", email, PASSWORD)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.exito").value(true))
                .andExpect(jsonPath("$.datos.verificado").value(false))
                .andExpect(jsonPath("$.datos.roles[0]").value("CLIENTE"));

        login(email, PASSWORD)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.mensaje").value("Verifica tu correo antes de entrar"));

        String tokenVerificacion = tokenDeVerificacion(email);
        enviar("/api/auth/verificar", "{\"token\":\"%s\"}".formatted(tokenVerificacion))
                .andExpect(status().isOk());
        enviar("/api/auth/verificar", "{\"token\":\"%s\"}".formatted(tokenVerificacion))
                .andExpect(status().isBadRequest());

        String respuesta = login(email, PASSWORD)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.tipo").value("Bearer"))
                .andReturn().getResponse().getContentAsString();
        String access = JsonPath.read(respuesta, "$.datos.accessToken");
        String refresh = JsonPath.read(respuesta, "$.datos.refreshToken");

        mvc.perform(get("/api/auth/yo").header(HttpHeaders.AUTHORIZATION, "Bearer " + access))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.email").value(email))
                .andExpect(jsonPath("$.datos.permisos", hasItems("MUEBLE_VER", "FAVORITO_GESTIONAR")));

        mvc.perform(get("/api/usuarios").header(HttpHeaders.AUTHORIZATION, "Bearer " + access))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.exito").value(false));

        enviar("/api/auth/refresh", "{\"token\":\"%s\"}".formatted(refresh))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.accessToken").isNotEmpty());
        enviar("/api/auth/refresh", "{\"token\":\"%s\"}".formatted(access))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rutasProtegidasResponden401ConApiResponse() throws Exception {
        mvc.perform(get("/api/auth/yo"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").value("Necesitas iniciar sesión"));

        mvc.perform(get("/api/auth/yo").header(HttpHeaders.AUTHORIZATION, "Bearer no.es.un.jwt"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").value("El token no es válido"));
    }

    @Test
    void registroValidaDatosYRechazaCorreoRepetido() throws Exception {
        registrar("", "no-es-correo", "corta")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.nombre").exists())
                .andExpect(jsonPath("$.errores.email").value("El correo no es válido"))
                .andExpect(jsonPath("$.errores.password").exists());

        registrar("Luis", "repetido@prueba.com", PASSWORD).andExpect(status().isCreated());
        registrar("Luis", "REPETIDO@Prueba.com", PASSWORD)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensaje").value("Ya existe una cuenta con ese correo"));
    }

    @Test
    void recuperaContrasenaConEnlaceDeUnSoloUso() throws Exception {
        String email = "olvido@prueba.com";
        registrar("Eva", email, PASSWORD).andExpect(status().isCreated());

        enviar("/api/auth/olvide-password", "{\"email\":\"nadie@prueba.com\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Si el correo está registrado, te enviamos un enlace"));

        enviar("/api/auth/olvide-password", "{\"email\":\"%s\"}".formatted(email)).andExpect(status().isOk());
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(correoService).enviarRecuperacion(eq(email), anyString(), captor.capture());
        String cuerpo = "{\"token\":\"%s\",\"password\":\"Nueva2026x\"}".formatted(captor.getValue());

        enviar("/api/auth/restablecer-password", cuerpo).andExpect(status().isOk());
        enviar("/api/auth/restablecer-password", cuerpo).andExpect(status().isBadRequest());

        login(email, PASSWORD).andExpect(status().isUnauthorized());
        login(email, "Nueva2026x").andExpect(status().isOk());
    }

    @Test
    void adminGestionaUsuariosYRoles() throws Exception {
        String access = accessToken(ADMIN_EMAIL, ADMIN_PASSWORD);
        String bearer = "Bearer " + access;

        String creado = registrar("Vero Vendedora", "vendedora@prueba.com", PASSWORD)
                .andReturn().getResponse().getContentAsString();
        Integer idVendedora = JsonPath.read(creado, "$.datos.id");

        mvc.perform(put("/api/usuarios/{id}/roles", idVendedora)
                        .header(HttpHeaders.AUTHORIZATION, bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roles\":[\"cliente\",\"VENDEDOR\"]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.roles", hasItems("CLIENTE", "VENDEDOR")))
                .andExpect(jsonPath("$.datos.permisos", hasItems("MUEBLE_CREAR", "FAVORITO_GESTIONAR")))
                .andExpect(jsonPath("$.datos.permisosPorRol.VENDEDOR", hasItems("MUEBLE_CREAR")))
                .andExpect(jsonPath("$.datos.permisosPorRol.VENDEDOR", not(hasItems("FAVORITO_GESTIONAR"))))
                .andExpect(jsonPath("$.datos.permisosPorRol.CLIENTE", hasItems("FAVORITO_GESTIONAR")));

        mvc.perform(get("/api/usuarios").param("buscar", "vendedora").header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.contenido", hasSize(1)))
                .andExpect(jsonPath("$.datos.pagina").value(0));

        String yo = mvc.perform(get("/api/auth/yo").header(HttpHeaders.AUTHORIZATION, bearer))
                .andReturn().getResponse().getContentAsString();
        Integer idAdmin = JsonPath.read(yo, "$.datos.id");
        mvc.perform(put("/api/usuarios/{id}/roles", idAdmin)
                        .header(HttpHeaders.AUTHORIZATION, bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roles\":[\"CLIENTE\"]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("No puedes quitarte el rol ADMIN a ti mismo"));

        mvc.perform(get("/api/roles").header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos", hasSize(3)));
    }
}
