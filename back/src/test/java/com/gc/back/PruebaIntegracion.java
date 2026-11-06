package com.gc.back;

import com.gc.back.correo.service.CorreoService;
import com.jayway.jsonpath.JsonPath;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Base de las pruebas de integración. Todas heredan la misma configuración para
 * compartir un solo contexto de Spring (y una sola base catalogo_muebles_test).
 */
@SpringBootTest
@AutoConfigureMockMvc
public abstract class PruebaIntegracion {

    protected static final String ADMIN_EMAIL = "admin@prueba.com";
    protected static final String ADMIN_PASSWORD = "Admin123*";
    protected static final String PASSWORD = "Mueble2026";

    @Autowired
    protected MockMvc mvc;

    @MockitoSpyBean
    protected CorreoService correoService;

    protected ResultActions registrar(String nombre, String email, String password) throws Exception {
        return enviar("/api/auth/registro",
                "{\"nombre\":\"%s\",\"email\":\"%s\",\"password\":\"%s\"}".formatted(nombre, email, password));
    }

    protected ResultActions login(String email, String password) throws Exception {
        return enviar("/api/auth/login", "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password));
    }

    protected String accessToken(String email, String password) throws Exception {
        String respuesta = login(email, password).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(respuesta, "$.datos.accessToken");
    }

    protected String tokenDeVerificacion(String email) {
        ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
        verify(correoService).enviarVerificacion(eq(email), anyString(), captor.capture());
        return captor.getValue();
    }

    /** Registra, verifica y asigna roles con el admin; devuelve el "Bearer ..." del usuario. */
    protected String usuarioConRoles(String email, String... roles) throws Exception {
        registrar("Usuario " + email, email, PASSWORD).andExpect(status().isCreated());
        enviar("/api/auth/verificar", "{\"token\":\"%s\"}".formatted(tokenDeVerificacion(email)))
                .andExpect(status().isOk());
        String admin = "Bearer " + accessToken(ADMIN_EMAIL, ADMIN_PASSWORD);
        String yo = mvc.perform(get("/api/usuarios").param("buscar", email).header(HttpHeaders.AUTHORIZATION, admin))
                .andReturn().getResponse().getContentAsString();
        Integer id = JsonPath.read(yo, "$.datos.contenido[0].id");
        String lista = String.join("\",\"", roles);
        mvc.perform(put("/api/usuarios/{id}/roles", id).header(HttpHeaders.AUTHORIZATION, admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"roles\":[\"%s\"]}".formatted(lista)))
                .andExpect(status().isOk());
        return "Bearer " + accessToken(email, PASSWORD);
    }

    protected ResultActions enviar(String ruta, String json) throws Exception {
        return mvc.perform(post(ruta).contentType(MediaType.APPLICATION_JSON).content(json));
    }
}
