package com.gc.back.mueble;

import com.gc.back.PruebaIntegracion;
import com.gc.back.mueble.service.SemillaCatalogoService;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Catálogo: semilla, filtros, archivos, publicación y permisos, contra MySQL. */
class CatalogoTest extends PruebaIntegracion {

    private static final byte[] GLB = firma("glTF");
    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n', 0, 0, 0, 0};

    @Autowired
    private SemillaCatalogoService semillaCatalogoService;

    @Test
    void catalogoPublicoTraeLosMueblesDeEjemploYSusArchivos() throws Exception {
        String lista = mvc.perform(get("/api/muebles").param("buscar", "nube"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.contenido", hasSize(1)))
                .andExpect(jsonPath("$.datos.contenido[0].slug").value("sofa-nube"))
                .andExpect(jsonPath("$.datos.contenido[0].anchoCm").value(210))
                .andExpect(jsonPath("$.datos.contenido[0].existencias").value(4))
                .andExpect(jsonPath("$.datos.contenido[0].categoria.nombre").value("Sofás"))
                .andExpect(jsonPath("$.datos.contenido[0].modeloUrl", startsWith("/uploads/muebles/")))
                .andReturn().getResponse().getContentAsString();

        String modeloUrl = JsonPath.read(lista, "$.datos.contenido[0].modeloUrl");
        mvc.perform(get(modeloUrl).header(HttpHeaders.ORIGIN, "http://localhost:5173"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, startsWith("model/gltf-binary")))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"))
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("max-age=2592000")));

        mvc.perform(get("/api/muebles"))
                .andExpect(jsonPath("$.datos.totalElementos", greaterThanOrEqualTo(8)));

        mvc.perform(get("/api/categorias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.contenido[*].nombre", hasItems("Sofás", "Sillones", "Mesas", "Iluminación")));
        mvc.perform(get("/api/muebles").param("categoriaId", String.valueOf(idCategoria("Iluminación"))))
                .andExpect(jsonPath("$.datos.contenido[*].categoria.nombre", everyItem(is("Iluminación"))));

        mvc.perform(get("/api/muebles").param("precioMin", "5000").param("precioMax", "100"))
                .andExpect(status().isBadRequest());

        mvc.perform(get("/api/muebles/lampara-faro"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.altoCm").value(160));
    }

    @Test
    void semillaAgregaSoloLosEjemplosQueFaltan() throws Exception {
        mvc.perform(get("/api/muebles/mesa-taller"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.anchoCm").value(180))
                .andExpect(jsonPath("$.datos.categoria.nombre").value("Mesas"))
                .andExpect(jsonPath("$.datos.modeloUrl", startsWith("/uploads/muebles/")));

        semillaCatalogoService.sembrarFaltantes(ADMIN_EMAIL);

        mvc.perform(get("/api/muebles").param("buscar", "duna"))
                .andExpect(jsonPath("$.datos.contenido", hasSize(1)))
                .andExpect(jsonPath("$.datos.contenido[0].slug").value("sofa-duna"));
    }

    @Test
    void vendedorCreaSubeArchivosPublicaYBorraSuMueble() throws Exception {
        String vendedor = usuarioConRoles("vende.catalogo@prueba.com", "VENDEDOR");
        String otroVendedor = usuarioConRoles("otro.vende@prueba.com", "VENDEDOR");
        String admin = "Bearer " + accessToken(ADMIN_EMAIL, ADMIN_PASSWORD);
        Integer idMesas = idCategoria("Mesas");

        String creado = mvc.perform(post("/api/muebles").header(HttpHeaders.AUTHORIZATION, vendedor)
                        .contentType(MediaType.APPLICATION_JSON).content(mueble("Mesa Taller Ñandú", idMesas)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.datos.publicado").value(false))
                .andExpect(jsonPath("$.datos.slug").value("mesa-taller-nandu"))
                .andReturn().getResponse().getContentAsString();
        Integer id = JsonPath.read(creado, "$.datos.id");

        mvc.perform(get("/api/muebles/mesa-taller-nandu")).andExpect(status().isNotFound());
        mvc.perform(get("/api/muebles/mesa-taller-nandu").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isOk());

        publicar(id, vendedor, true)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("Sube el modelo 3D y la imagen antes de publicar el mueble"));

        subir(id, "modelo", "falso.glb", "no soy un glb".getBytes(StandardCharsets.UTF_8), vendedor)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("El modelo 3D debe ser un archivo .glb"));
        subir(id, "modelo", "mesa.glb", GLB, vendedor)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.modeloUrl", startsWith("/uploads/muebles/" + id + "/modelo-")));
        subir(id, "imagen", "mesa.png", PNG, vendedor)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.imagenUrl", containsString(".png")));

        publicar(id, vendedor, true).andExpect(status().isOk()).andExpect(jsonPath("$.datos.publicado").value(true));
        mvc.perform(get("/api/muebles/mesa-taller-nandu")).andExpect(status().isOk());

        mvc.perform(get("/api/muebles/gestion").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.contenido", hasSize(1)));
        mvc.perform(get("/api/muebles/gestion").header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(jsonPath("$.datos.totalElementos", greaterThanOrEqualTo(5)));

        mvc.perform(put("/api/muebles/{id}", id).header(HttpHeaders.AUTHORIZATION, otroVendedor)
                        .contentType(MediaType.APPLICATION_JSON).content(mueble("Robada", idMesas)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.mensaje").value("Solo puedes modificar tus propios muebles"));
        publicar(id, admin, false).andExpect(status().isOk());

        mvc.perform(delete("/api/muebles/{id}", id).header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isOk());
        mvc.perform(get("/api/muebles/mesa-taller-nandu").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isNotFound());
    }

    @Test
    void validacionesYPermisosDelCatalogo() throws Exception {
        String admin = "Bearer " + accessToken(ADMIN_EMAIL, ADMIN_PASSWORD);
        String cliente = usuarioConRoles("cliente.catalogo@prueba.com", "CLIENTE");
        Integer idMesas = idCategoria("Mesas");

        mvc.perform(post("/api/muebles").contentType(MediaType.APPLICATION_JSON).content(mueble("X", idMesas)))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/muebles/gestion")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/muebles").header(HttpHeaders.AUTHORIZATION, cliente)
                        .contentType(MediaType.APPLICATION_JSON).content(mueble("X", idMesas)))
                .andExpect(status().isForbidden());

        mvc.perform(post("/api/muebles").header(HttpHeaders.AUTHORIZATION, admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Silla\",\"precio\":-5,\"anchoCm\":0,\"fondoCm\":40,\"altoCm\":80,\"existencias\":-1,\"categoriaId\":" + idMesas + "}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.precio").value("El precio debe ser mayor que cero"))
                .andExpect(jsonPath("$.errores.anchoCm").exists())
                .andExpect(jsonPath("$.errores.existencias").value("Las existencias no pueden ser negativas"));

        String creada = mvc.perform(post("/api/categorias").header(HttpHeaders.AUTHORIZATION, admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"Libreros\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.datos.slug").value("libreros"))
                .andReturn().getResponse().getContentAsString();
        Integer idLibreros = JsonPath.read(creada, "$.datos.id");
        mvc.perform(post("/api/categorias").header(HttpHeaders.AUTHORIZATION, admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"libreros\"}"))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/categorias").header(HttpHeaders.AUTHORIZATION, cliente)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"Camas\"}"))
                .andExpect(status().isForbidden());

        mvc.perform(delete("/api/categorias/{id}", idCategoria("Sofás")).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", startsWith("No se puede eliminar")));
        mvc.perform(delete("/api/categorias/{id}", idLibreros).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isOk());
    }

    private Integer idCategoria(String nombre) throws Exception {
        String respuesta = mvc.perform(get("/api/categorias").param("buscar", nombre))
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(respuesta, "$.datos.contenido[0].id");
    }

    private org.springframework.test.web.servlet.ResultActions publicar(Integer id, String token, boolean valor)
            throws Exception {
        return mvc.perform(patch("/api/muebles/{id}/publicacion", id).header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"publicado\":" + valor + "}"));
    }

    private org.springframework.test.web.servlet.ResultActions subir(Integer id, String tipo, String nombre,
                                                                     byte[] contenido, String token) throws Exception {
        return mvc.perform(multipart("/api/muebles/{id}/{tipo}", id, tipo)
                .file(new MockMultipartFile("archivo", nombre, MediaType.APPLICATION_OCTET_STREAM_VALUE, contenido))
                .header(HttpHeaders.AUTHORIZATION, token));
    }

    private static String mueble(String nombre, Integer categoriaId) {
        return """
                {"nombre":"%s","descripcion":"Prueba","precio":1999.90,"anchoCm":120,"fondoCm":60,
                 "altoCm":75,"materiales":"Pino","existencias":7,"categoriaId":%d}
                """.formatted(nombre, categoriaId);
    }

    private static byte[] firma(String inicio) {
        byte[] datos = Arrays.copyOf(inicio.getBytes(StandardCharsets.US_ASCII), 64);
        datos[4] = 2;
        return datos;
    }
}
