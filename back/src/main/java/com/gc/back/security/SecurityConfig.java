package com.gc.back.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * API sin sesión con JWT. Rutas públicas aquí; los permisos finos van con
 * {@code @PreAuthorize} en cada controller.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final String[] RUTAS_PUBLICAS = {
            "/api/auth/registro",
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/auth/verificar",
            "/api/auth/reenviar-verificacion",
            "/api/auth/olvide-password",
            "/api/auth/restablecer-password",
            "/swagger-ui.html",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/actuator/health/**",
            "/actuator/info",
            "/error"
    };

    /** Catálogo y archivos: cualquiera puede leer (GET); escribir pide token y permiso. */
    private static final String[] LECTURAS_PUBLICAS = {
            "/api/muebles",
            "/api/muebles/*",
            "/api/muebles/*/resenas",
            "/api/muebles/*/resenas/resumen",
            "/api/categorias",
            "/api/categorias/*",
            "/api/vendedores/*",
            "/api/vendedores/*/muebles",
            "/api/vendedores/*/trabajos",
            "/uploads/**"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtService jwtService,
                                           UserDetailsService userDetailsService,
                                           ManejadorErroresSeguridad manejadorErrores) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(manejadorErrores)
                        .accessDeniedHandler(manejadorErrores))
                .authorizeHttpRequests(a -> a
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/muebles/gestion").authenticated()
                        // "yo" no es un slug: mi perfil siempre pide sesión (401 sin token).
                        .requestMatchers("/api/vendedores/yo", "/api/vendedores/yo/**").authenticated()
                        .requestMatchers(HttpMethod.GET, LECTURAS_PUBLICAS).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/muebles/*/vista").permitAll()
                        .requestMatchers(RUTAS_PUBLICAS).permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(new JwtAuthenticationFilter(jwtService, userDetailsService),
                        UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
