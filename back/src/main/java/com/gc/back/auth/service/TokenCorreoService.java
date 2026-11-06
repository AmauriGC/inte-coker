package com.gc.back.auth.service;

import com.gc.back.auth.entity.TipoTokenCorreo;
import com.gc.back.auth.entity.TokenCorreo;
import com.gc.back.auth.exception.TokenInvalidoException;
import com.gc.back.auth.repository.TokenCorreoRepository;
import com.gc.back.usuario.entity.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

/** Crea y consume los tokens de un solo uso que viajan en los enlaces de correo. */
@Service
@RequiredArgsConstructor
public class TokenCorreoService {

    private static final SecureRandom ALEATORIO = new SecureRandom();

    private final TokenCorreoRepository tokenCorreoRepository;

    /** Invalida los enlaces anteriores del mismo tipo y devuelve el token nuevo en claro. */
    @Transactional
    public String generar(Usuario usuario, TipoTokenCorreo tipo) {
        Instant ahora = Instant.now();
        tokenCorreoRepository.invalidarVigentes(usuario, tipo, ahora);

        byte[] bytes = new byte[32];
        ALEATORIO.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        TokenCorreo registro = new TokenCorreo();
        registro.setTokenHash(hash(token));
        registro.setTipo(tipo);
        registro.setUsuario(usuario);
        registro.setExpiraEn(ahora.plus(tipo.getVigencia()));
        tokenCorreoRepository.save(registro);
        return token;
    }

    /** Marca el token como usado y devuelve su usuario; falla si no existe, se usó o caducó. */
    @Transactional
    public Usuario consumir(String token, TipoTokenCorreo tipo) {
        Instant ahora = Instant.now();
        TokenCorreo registro = tokenCorreoRepository.findByTokenHashAndTipo(hash(token.trim()), tipo)
                .filter(t -> t.vigente(ahora))
                .orElseThrow(TokenInvalidoException::new);
        registro.setUsadoEn(ahora);
        return registro.getUsuario();
    }

    private static String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 no disponible", ex);
        }
    }
}
