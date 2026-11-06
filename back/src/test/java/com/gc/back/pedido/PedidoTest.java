package com.gc.back.pedido;

import com.gc.back.PruebaIntegracion;
import com.gc.back.correo.dto.AvisoCorreo;
import com.gc.back.rol.entity.Permiso;
import com.gc.back.rol.repository.PermisoRepository;
import com.gc.back.rol.repository.RolRepository;
import com.gc.back.rol.service.RolService;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Pedidos: consulta, pedido, estados, existencias, mensajes, no leídos, privacidad,
 * permisos, borrado de muebles y avisos por correo.
 */
class PedidoTest extends PruebaIntegracion {

    private static final String ENTREGA = """
            "tipoEntrega":"DOMICILIO","nombreRecibe":"Ana Ruiz","telefono":"55 1234 5678",
            "direccion":"Calle Roble 12","ciudad":"CDMX","codigoPostal":"01000\"""";

    @Autowired
    private RolService rolService;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PermisoRepository permisoRepository;

    @Autowired
    private TransactionTemplate transaccion;

    @Test
    void consultaSeConvierteEnPedidoYLlegaHastaEntregado() throws Exception {
        String vendedor = usuarioConRoles("vende.pedido@prueba.com", "VENDEDOR");
        String cliente = usuarioConRoles("cliente.pedido@prueba.com", "CLIENTE");
        Integer mueble = muebleListo("Mesa Flujo", 3, vendedor);

        String consulta = preguntar(mueble, "¿La tienen en nogal?", cliente)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.datos.estado").value("CONSULTA"))
                .andExpect(jsonPath("$.datos.lado").value("CLIENTE"))
                .andExpect(jsonPath("$.datos.acciones", containsInAnyOrder("SOLICITADO", "CANCELADO")))
                .andExpect(jsonPath("$.datos.folio").value(startsWith("GC-")))
                .andReturn().getResponse().getContentAsString();
        Integer id = JsonPath.read(consulta, "$.datos.id");
        verify(correoService, timeout(5000)).enviarAviso(argThat((AvisoCorreo a) ->
                a.email().equals("vende.pedido@prueba.com") && a.asunto().startsWith("Nueva pregunta")));

        // La segunda pregunta va a la misma consulta.
        preguntar(mueble, "¿Y en color claro?", cliente)
                .andExpect(jsonPath("$.datos.id").value(id));

        resumen(vendedor).andExpect(jsonPath("$.datos.ventasSinLeer").value(1));
        mvc.perform(get("/api/pedidos/ventas").header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(jsonPath("$.datos.contenido[0].id").value(id))
                .andExpect(jsonPath("$.datos.contenido[0].sinLeer").value(2))
                .andExpect(jsonPath("$.datos.contenido[0].acciones", containsInAnyOrder("RECHAZADO")));

        escribir(id, "Sí, en nogal y en roble claro.", vendedor)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.datos.autor").value("VENDEDOR"));
        resumen(vendedor).andExpect(jsonPath("$.datos.ventasSinLeer").value(0));
        resumen(cliente).andExpect(jsonPath("$.datos.comprasSinLeer").value(1));
        mvc.perform(post("/api/pedidos/{id}/leido", id).header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(status().isOk());
        resumen(cliente).andExpect(jsonPath("$.datos.comprasSinLeer").value(0));

        // Pedir más de lo que hay o sin dirección completa no pasa.
        solicitar(id, 5, ENTREGA, cliente)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("Solo quedan 3 piezas de este mueble"));
        solicitar(id, 2, "\"tipoEntrega\":\"DOMICILIO\",\"nombreRecibe\":\"Ana\"", cliente)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("falta: teléfono, dirección, ciudad, código postal")));
        solicitar(id, 2, ENTREGA + ",\"codigoPostal\":\"12\"", cliente)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores.codigoPostal").value("El código postal tiene 5 dígitos"));

        solicitar(id, 2, ENTREGA, cliente)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.estado").value("SOLICITADO"))
                .andExpect(jsonPath("$.datos.total").value(1998.00))
                .andExpect(jsonPath("$.datos.entrega.ciudad").value("CDMX"));
        verify(correoService, timeout(5000)).enviarAviso(argThat((AvisoCorreo a) ->
                a.email().equals("vende.pedido@prueba.com") && a.asunto().startsWith("Nuevo pedido GC-")));
        resumen(vendedor).andExpect(jsonPath("$.datos.ventasPorAtender").value(1));

        cambiar(id, "ACEPTADO", null, cliente)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.mensaje").value("Solo el vendedor puede aceptar el pedido"));
        cambiar(id, "ACEPTADO", null, vendedor)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.mueble.existencias").value(1))
                .andExpect(jsonPath("$.datos.acciones", containsInAnyOrder("EN_CAMINO")));
        verify(correoService, timeout(5000)).enviarAviso(argThat((AvisoCorreo a) ->
                a.email().equals("cliente.pedido@prueba.com") && a.asunto().endsWith(": aceptado")
                        && a.ruta().equals("/pedidos/" + id)));

        cambiar(id, "EN_CAMINO", null, vendedor).andExpect(status().isOk());
        cambiar(id, "ENTREGADO", null, cliente)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.estado").value("ENTREGADO"))
                .andExpect(jsonPath("$.datos.puedeEscribir").value(false))
                .andExpect(jsonPath("$.datos.acciones", empty()));

        cambiar(id, "CANCELADO", null, cliente)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("El pedido ya está entregado y no se puede cambiar"));
        escribir(id, "Gracias", cliente)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("La conversación se cerró porque el pedido está entregado"));

        String mensajes = mvc.perform(get("/api/pedidos/{id}/mensajes", id).header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos[0].texto").value("¿La tienen en nogal?"))
                .andExpect(jsonPath("$.datos[*].texto", hasItem("Pedido aceptado. Acuerden aquí el pago y la entrega.")))
                .andExpect(jsonPath("$.datos[*].autor", hasItem("SISTEMA")))
                .andReturn().getResponse().getContentAsString();
        List<Integer> ids = JsonPath.read(mensajes, "$.datos[*].id");
        mvc.perform(get("/api/pedidos/{id}/mensajes", id).param("despuesDe", ids.get(ids.size() - 2).toString())
                        .header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos", hasSize(1)))
                .andExpect(jsonPath("$.datos[0].texto").value("Pedido entregado."));

        mvc.perform(get("/api/pedidos/compras").param("estado", "ENTREGADO").header(HttpHeaders.AUTHORIZATION, cliente))
                .andExpect(jsonPath("$.datos.totalElementos").value(1));
    }

    @Test
    void existenciasBajanAlAceptarYVuelvenAlCancelar() throws Exception {
        String vendedor = usuarioConRoles("vende.stock@prueba.com", "VENDEDOR");
        String ana = usuarioConRoles("ana.stock@prueba.com", "CLIENTE");
        String beto = usuarioConRoles("beto.stock@prueba.com", "CLIENTE");
        String caro = usuarioConRoles("caro.stock@prueba.com", "CLIENTE");
        Integer mueble = muebleListo("Banco Stock", 2, vendedor);

        Integer deAna = id(pedir(mueble, 2, "\"tipoEntrega\":\"RECOGER\"", ana).andExpect(status().isCreated()));
        Integer deBeto = id(pedir(mueble, 2, "\"tipoEntrega\":\"RECOGER\"", beto).andExpect(status().isCreated()));

        cambiar(deAna, "ACEPTADO", null, vendedor).andExpect(status().isOk());
        cambiar(deBeto, "ACEPTADO", null, vendedor)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("Ya no hay existencias suficientes: quedan 0"));
        detalle(deBeto, beto).andExpect(jsonPath("$.datos.estado").value("SOLICITADO"));

        pedir(mueble, 1, "\"tipoEntrega\":\"RECOGER\"", caro)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("agotado")));
        preguntar(mueble, "¿Cuándo vuelve a haber?", caro).andExpect(status().isCreated());

        cambiar(deAna, "CANCELADO", null, ana)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.mueble.existencias").value(2));
        cambiar(deBeto, "RECHAZADO", null, vendedor)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("Escribe el motivo del rechazo"));
        cambiar(deBeto, "ACEPTADO", null, vendedor)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.mueble.existencias").value(0));
        cambiar(deBeto, "EN_CAMINO", null, vendedor)
                .andExpect(status().isOk());
        mvc.perform(get("/api/pedidos/{id}/mensajes", deBeto).header(HttpHeaders.AUTHORIZATION, beto))
                .andExpect(jsonPath("$.datos[*].texto", hasItem("El pedido está listo para recoger.")));
    }

    @Test
    void tercerosNoVenPedidosYCadaLadoTieneSusPermisos() throws Exception {
        String vendedor = usuarioConRoles("vende.privado@prueba.com", "VENDEDOR", "CLIENTE");
        String cliente = usuarioConRoles("cliente.privado@prueba.com", "CLIENTE");
        String extrano = usuarioConRoles("extrano.privado@prueba.com", "CLIENTE");
        String admin = "Bearer " + accessToken(ADMIN_EMAIL, ADMIN_PASSWORD);
        Integer mueble = muebleListo("Repisa Privada", 4, vendedor);

        pedir(mueble, 1, ENTREGA, vendedor)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("No puedes pedir un mueble que tú vendes"));
        String creado = pedir(mueble, 1, ENTREGA, cliente).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Integer id = JsonPath.read(creado, "$.datos.id");
        String folio = JsonPath.read(creado, "$.datos.folio");

        detalle(id, extrano).andExpect(status().isNotFound());
        mvc.perform(get("/api/pedidos/{id}/mensajes", id).header(HttpHeaders.AUTHORIZATION, extrano))
                .andExpect(status().isNotFound());
        escribir(id, "Hola", extrano).andExpect(status().isNotFound());
        detalle(id, null).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/pedidos").header(HttpHeaders.AUTHORIZATION, cliente)).andExpect(status().isForbidden());
        mvc.perform(get("/api/pedidos/ventas").header(HttpHeaders.AUTHORIZATION, cliente)).andExpect(status().isForbidden());

        String soloVendedor = usuarioConRoles("solo.vende@prueba.com", "VENDEDOR");
        pedir(mueble, 1, ENTREGA, soloVendedor).andExpect(status().isForbidden());

        mvc.perform(get("/api/pedidos").param("buscar", folio).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(jsonPath("$.datos.totalElementos").value(1))
                .andExpect(jsonPath("$.datos.contenido[0].lado").value("SUPERVISOR"))
                .andExpect(jsonPath("$.datos.contenido[0].acciones", containsInAnyOrder("CANCELADO")));
        escribir(id, "Soy admin", admin).andExpect(status().isForbidden());
        cambiar(id, "ACEPTADO", null, admin).andExpect(status().isForbidden());
        cambiar(id, "CANCELADO", null, admin)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("Escribe el motivo de la cancelación"));
        cambiar(id, "CANCELADO", "Datos de contacto falsos", admin)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.motivoCierre").value("Datos de contacto falsos"));
        verify(correoService, timeout(5000)).enviarAviso(argThat((AvisoCorreo a) ->
                a.email().equals("vende.privado@prueba.com") && a.asunto().endsWith(": cancelado")));
        verify(correoService, timeout(5000)).enviarAviso(argThat((AvisoCorreo a) ->
                a.email().equals("cliente.privado@prueba.com") && a.asunto().endsWith(": cancelado")));
    }

    @Test
    void muebleConPedidosAbiertosNoSeBorraYLosCerradosConservanSuCopia() throws Exception {
        String vendedor = usuarioConRoles("vende.borrado@prueba.com", "VENDEDOR");
        String cliente = usuarioConRoles("cliente.borrado@prueba.com", "CLIENTE");
        Integer mueble = muebleListo("Silla Borrada", 2, vendedor);
        Integer id = id(pedir(mueble, 1, ENTREGA, cliente).andExpect(status().isCreated()));

        mvc.perform(delete("/api/muebles/{id}", mueble).header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("Este mueble tiene pedidos en curso; ocúltalo en lugar de borrarlo"));

        cambiar(id, "CANCELADO", "Ya no lo necesito", cliente).andExpect(status().isOk());
        mvc.perform(delete("/api/muebles/{id}", mueble).header(HttpHeaders.AUTHORIZATION, vendedor))
                .andExpect(status().isOk());

        detalle(id, cliente)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.datos.mueble.id").value(nullValue()))
                .andExpect(jsonPath("$.datos.mueble.nombre").value("Silla Borrada"))
                .andExpect(jsonPath("$.datos.precioUnitario").value(999.00));
    }

    @Test
    void permisoNuevoLlegaALosRolesBaseQueYaExistian() throws Exception {
        // Simula una base anterior a los pedidos: el permiso no existe y CLIENTE ya está creado.
        transaccion.executeWithoutResult(estado -> {
            Permiso permiso = permisoRepository.findByNombre("PEDIDO_CREAR").orElseThrow();
            rolRepository.findAll().forEach(rol -> rol.getPermisos().remove(permiso));
            rolRepository.flush();
            permisoRepository.delete(permiso);
        });

        rolService.asegurarRolesYPermisos();

        String admin = "Bearer " + accessToken(ADMIN_EMAIL, ADMIN_PASSWORD);
        mvc.perform(get("/api/roles").header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(jsonPath("$.datos[?(@.nombre == 'CLIENTE')].permisos[*]", hasItem("PEDIDO_CREAR")))
                .andExpect(jsonPath("$.datos[?(@.nombre == 'ADMIN')].permisos[*]", hasItem("PEDIDO_CREAR")))
                .andExpect(jsonPath("$.datos[?(@.nombre == 'VENDEDOR')].permisos[*]", not(hasItem("PEDIDO_CREAR"))));
    }

    private ResultActions preguntar(Integer muebleId, String texto, String token) throws Exception {
        return mvc.perform(post("/api/pedidos/consultas").header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"muebleId\":%d,\"mensaje\":\"%s\"}".formatted(muebleId, texto)));
    }

    private ResultActions pedir(Integer muebleId, int cantidad, String entrega, String token) throws Exception {
        return mvc.perform(post("/api/pedidos").header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"muebleId\":%d,\"cantidad\":%d,%s}".formatted(muebleId, cantidad, entrega)));
    }

    private ResultActions solicitar(Integer id, int cantidad, String entrega, String token) throws Exception {
        return mvc.perform(patch("/api/pedidos/{id}/solicitar", id).header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"cantidad\":%d,%s}".formatted(cantidad, entrega)));
    }

    private ResultActions cambiar(Integer id, String estado, String motivo, String token) throws Exception {
        String cuerpo = motivo == null ? "{\"estado\":\"%s\"}".formatted(estado)
                : "{\"estado\":\"%s\",\"motivo\":\"%s\"}".formatted(estado, motivo);
        return mvc.perform(patch("/api/pedidos/{id}/estado", id).header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON).content(cuerpo));
    }

    private ResultActions escribir(Integer id, String texto, String token) throws Exception {
        return mvc.perform(post("/api/pedidos/{id}/mensajes", id).header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"texto\":\"%s\"}".formatted(texto)));
    }

    private ResultActions detalle(Integer id, String token) throws Exception {
        var peticion = get("/api/pedidos/{id}", id);
        return mvc.perform(token == null ? peticion : peticion.header(HttpHeaders.AUTHORIZATION, token));
    }

    private ResultActions resumen(String token) throws Exception {
        return mvc.perform(get("/api/pedidos/resumen").header(HttpHeaders.AUTHORIZATION, token));
    }

    private static Integer id(ResultActions resultado) throws Exception {
        return JsonPath.read(resultado.andReturn().getResponse().getContentAsString(), "$.datos.id");
    }
}
