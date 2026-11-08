package com.gc.back.correo.service;

import com.gc.back.correo.dto.AvisoCorreo;
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
import java.util.Map;

/**
 * Envía los correos de la app. Con MAIL_ENABLED=false no envía nada y escribe el
 * enlace en el log, para probar en local sin SMTP.
 * Un fallo de envío no rompe la operación: se registra y el usuario puede pedir reenvío.
 * Los avisos de pedidos llegan por {@link AvisosCorreoListener}, en segundo plano.
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
        enviar(email, "Verifica tu cuenta en GC-Confort", "verificacion", Map.of("nombre", nombre, "enlace", enlace));
    }

    public void enviarRecuperacion(String email, String nombre, String token) {
        String enlace = urlFront + "/restablecer-password?token=" + token;
        enviar(email, "Restablece tu contraseña de GC-Confort", "recuperacion", Map.of("nombre", nombre, "enlace", enlace));
    }

    /** El vendedor registró a un transportista: el enlace le deja poner su contraseña. */
    public void enviarInvitacion(String email, String nombre, String vendedor, String token) {
        enviar(email, vendedor + " te invitó a GC-Confort", "aviso", Map.of(
                "nombre", nombre,
                "titulo", "Ya eres transportista de " + vendedor,
                "texto", "Pon tu contraseña para ver las entregas que te asignen. El enlace dura 72 horas.",
                "boton", "Activar mi cuenta",
                "enlace", urlFront + "/activar?token=" + token));
    }

    /** Aviso de un módulo (pedidos): título, texto y un botón que lleva al front. */
    public void enviarAviso(AvisoCorreo aviso) {
        enviar(aviso.email(), aviso.asunto(), "aviso", Map.of(
                "nombre", aviso.nombre(),
                "titulo", aviso.titulo(),
                "texto", aviso.texto(),
                "boton", aviso.boton(),
                "enlace", urlFront + aviso.ruta()));
    }

    private void enviar(String email, String asunto, String plantilla, Map<String, String> datos) {
        if (!habilitado) {
            log.info("Correo deshabilitado (MAIL_ENABLED=false). Para {} | {} | {}", email, asunto, datos.get("enlace"));
            return;
        }
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, StandardCharsets.UTF_8.name());
            helper.setFrom(remitente);
            helper.setTo(email);
            helper.setSubject(asunto);
            helper.setText(renderizar(plantilla, datos), true);
            mailSender.send(mensaje);
            log.info("Correo '{}' enviado a {}", asunto, email);
        } catch (MessagingException | MailException ex) {
            log.error("No se pudo enviar el correo '{}' a {}: {}", asunto, email, ex.getMessage());
        }
    }

    /** Reemplaza cada {{clave}} de la plantilla por su valor escapado para HTML. */
    private String renderizar(String plantilla, Map<String, String> datos) {
        try {
            String html = StreamUtils.copyToString(
                    new ClassPathResource("correo/" + plantilla + ".html").getInputStream(),
                    StandardCharsets.UTF_8);
            for (Map.Entry<String, String> dato : datos.entrySet()) {
                html = html.replace("{{" + dato.getKey() + "}}", HtmlUtils.htmlEscape(dato.getValue()));
            }
            return html;
        } catch (IOException ex) {
            throw new UncheckedIOException("No se encontró la plantilla de correo " + plantilla, ex);
        }
    }
}
