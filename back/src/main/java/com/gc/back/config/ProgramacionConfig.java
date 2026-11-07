package com.gc.back.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Activa {@code @Scheduled}. Lo usa la revisión de apartados vencidos. */
@Configuration
@EnableScheduling
public class ProgramacionConfig {
}
