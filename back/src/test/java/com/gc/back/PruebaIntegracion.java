package com.gc.back;

import com.gc.back.correo.service.CorreoService;
import com.jayway.jsonpath.JsonPath;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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


    /** Crea un mueble en "Mesas" con modelo e imagen, lo publica y devuelve su id. */
    protected Integer muebleListo(String nombre, int existencias, String vendedor) throws Exception {
        String categorias = mvc.perform(get("/api/categorias").param("buscar", "Mesas"))
                .andReturn().getResponse().getContentAsString();
        Integer categoriaId = JsonPath.read(categorias, "$.datos.contenido[0].id");
        String creado = mvc.perform(post("/api/muebles").header(HttpHeaders.AUTHORIZATION, vendedor)
                        .contentType(MediaType.APPLICATION_JSON).content("""
                                {"nombre":"%s","precio":999.00,"anchoCm":100,"fondoCm":40,"altoCm":45,
                                 "existencias":%d,"categoriaId":%d}
                                """.formatted(nombre, existencias, categoriaId)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Integer id = JsonPath.read(creado, "$.datos.id");
        subir(id, "modelo", "mueble.glb", firma("glTF"), vendedor);
        subir(id, "imagen", "mueble.png",
                new byte[]{(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n', 0, 0, 0, 0}, vendedor);
        publicarMueble(id, vendedor, true);
        return id;
    }

    protected void publicarMueble(Integer id, String token, boolean valor) throws Exception {
        mvc.perform(patch("/api/muebles/{id}/publicacion", id).header(HttpHeaders.AUTHORIZATION, token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"publicado\":" + valor + "}"))
                .andExpect(status().isOk());
    }

    private void subir(Integer id, String tipo, String nombre, byte[] contenido, String token) throws Exception {
        mvc.perform(multipart("/api/muebles/{id}/{tipo}", id, tipo)
                        .file(new MockMultipartFile("archivo", nombre, MediaType.APPLICATION_OCTET_STREAM_VALUE, contenido))
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk());
    }

    private static byte[] firma(String inicio) {
        byte[] datos = Arrays.copyOf(inicio.getBytes(StandardCharsets.US_ASCII), 64);
        datos[4] = 2;
        return datos;
    }

    protected ResultActions enviar(String ruta, String json) throws Exception {
        return mvc.perform(post(ruta).contentType(MediaType.APPLICATION_JSON).content(json));
    }
}
