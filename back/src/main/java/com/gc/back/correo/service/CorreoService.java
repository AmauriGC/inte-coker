package com.gc.back.correo.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.util.HtmlUtils;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;

/**
 * Envía los correos de la app. Con MAIL_ENABLED=false no envía nada y escribe el
 * enlace en el log, para probar en local sin SMTP.
 * Un fallo de envío no rompe la operación: se registra y el usuario puede pedir reenvío.
 */
@Slf4j
@Service
public class CorreoService {

    private final JavaMailSender mailSender;
    private final boolean habilitado;
    private final String remitente;
    private final String urlFront;

    public CorreoService(JavaMailSender mailSender,
                         @Value("${app.mail.enabled:false}") boolean habilitado,
                         @Value("${app.mail.from:}") String remitente,
                         @Value("${app.frontend-url}") String frontendUrl) {
        this.mailSender = mailSender;
        this.habilitado = habilitado;
        this.remitente = remitente;
        this.urlFront = frontendUrl.split(",")[0].trim().replaceAll("/+$", "");
    }

    public void enviarVerificacion(String email, String nombre, String token) {
        String enlace = urlFront + "/verificar?token=" + token;
        enviar(email, "Verifica tu cuenta en GC-Confort", "verificacion", nombre, enlace);
    }

    public void enviarRecuperacion(String email, String nombre, String token) {
        String enlace = urlFront + "/restablecer-password?token=" + token;
        enviar(email, "Restablece tu contraseña de GC-Confort", "recuperacion", nombre, enlace);
    }

    private void enviar(String email, String asunto, String plantilla, String nombre, String enlace) {
        if (!habilitado) {
            log.info("Correo deshabilitado (MAIL_ENABLED=false). Para {} | {} | {}", email, asunto, enlace);
            return;
        }
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, StandardCharsets.UTF_8.name());
            helper.setFrom(remitente);
            helper.setTo(email);
            helper.setSubject(asunto);
            helper.setText(renderizar(plantilla, nombre, enlace), true);
            mailSender.send(mensaje);
            log.info("Correo '{}' enviado a {}", asunto, email);
        } catch (MessagingException | MailException ex) {
            log.error("No se pudo enviar el correo '{}' a {}: {}", asunto, email, ex.getMessage());
        }
    }

    private String renderizar(String plantilla, String nombre, String enlace) {
        try {
            String html = StreamUtils.copyToString(
                    new ClassPathResource("correo/" + plantilla + ".html").getInputStream(),
                    StandardCharsets.UTF_8);
            return html
                    .replace("{{nombre}}", HtmlUtils.htmlEscape(nombre))
                    .replace("{{enlace}}", HtmlUtils.htmlEscape(enlace));
        } catch (IOException ex) {
            throw new UncheckedIOException("No se encontró la plantilla de correo " + plantilla, ex);
        }
    }
}
