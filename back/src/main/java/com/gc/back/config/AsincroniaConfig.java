package com.gc.back.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Activa {@code @Async}. Lo usan los avisos por correo para no frenar la respuesta mientras
 * el servidor SMTP contesta. Usa el ejecutor que Spring Boot configura por defecto.
 */
@Configuration
@EnableAsync
public class AsincroniaConfig {
}
