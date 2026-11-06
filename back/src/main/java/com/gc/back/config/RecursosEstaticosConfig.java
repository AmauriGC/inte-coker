package com.gc.back.config;

import com.gc.back.archivo.service.AlmacenamientoService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.handler.SimpleUrlHandlerMapping;
import org.springframework.web.servlet.resource.ResourceHttpRequestHandler;

import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Sirve los archivos subidos en /uploads/** con caché larga (los nombres cambian
 * en cada subida) y el tipo model/gltf-binary para los .glb.
 * Se declara el handler a mano porque en Spring 7 el registro de recursos no
 * permite agregar tipos MIME propios.
 */
@Configuration
public class RecursosEstaticosConfig {

    public static final String RUTA_PUBLICA = "/uploads/";

    @Bean
    public ResourceHttpRequestHandler manejadorUploads(AlmacenamientoService almacenamientoService) {
        String raiz = almacenamientoService.getRaiz().toString().replace('\\', '/');
        ResourceHttpRequestHandler handler = new ResourceHttpRequestHandler();
        handler.setLocations(List.of(new FileSystemResource(raiz.endsWith("/") ? raiz : raiz + "/")));
        handler.setMediaTypes(Map.of("glb", MediaType.parseMediaType("model/gltf-binary")));
        handler.setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic().immutable());
        return handler;
    }

    @Bean
    public SimpleUrlHandlerMapping mapeoUploads(ResourceHttpRequestHandler manejadorUploads) {
        SimpleUrlHandlerMapping mapeo = new SimpleUrlHandlerMapping(Map.of(RUTA_PUBLICA + "**", manejadorUploads));
        mapeo.setOrder(1);
        return mapeo;
    }
}
