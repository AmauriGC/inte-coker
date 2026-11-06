package com.gc.back.archivo.service;

import com.gc.back.archivo.entity.TipoArchivo;
import com.gc.back.archivo.exception.ArchivoInvalidoException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.UUID;
import java.util.stream.Stream;

/**
 * Guarda archivos en disco bajo UPLOADS_DIR y devuelve la ruta relativa
 * (por ejemplo "muebles/12/modelo-1a2b3c4d.glb"), que se sirve en /uploads/**.
 * Cada archivo nuevo lleva un sufijo aleatorio, así el navegador puede cachearlo
 * mucho tiempo sin quedarse con una versión vieja.
 */
@Slf4j
@Service
public class AlmacenamientoService {

    private final Path raiz;

    public AlmacenamientoService(@Value("${app.uploads-dir}") String directorio) throws IOException {
        this.raiz = Paths.get(directorio).toAbsolutePath().normalize();
        Files.createDirectories(raiz);
    }

    public Path getRaiz() {
        return raiz;
    }

    public String guardar(String carpeta, String prefijo, MultipartFile archivo, TipoArchivo tipo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new ArchivoInvalidoException("El archivo está vacío");
        }
        if (archivo.getSize() > tipo.getMaxBytes()) {
            throw new ArchivoInvalidoException(tipo.getMensajeTamano());
        }
        try {
            return guardar(carpeta, prefijo, archivo.getBytes(), tipo);
        } catch (IOException ex) {
            throw new UncheckedIOException("No se pudo leer el archivo subido", ex);
        }
    }

    public String guardar(String carpeta, String prefijo, byte[] contenido, TipoArchivo tipo) {
        if (contenido == null || contenido.length == 0) {
            throw new ArchivoInvalidoException("El archivo está vacío");
        }
        if (contenido.length > tipo.getMaxBytes()) {
            throw new ArchivoInvalidoException(tipo.getMensajeTamano());
        }
        String extension = tipo.detectarExtension(contenido)
                .orElseThrow(() -> new ArchivoInvalidoException(tipo.getMensajeFormato()));
        String ruta = carpeta + "/" + prefijo + "-" + UUID.randomUUID().toString().substring(0, 8) + "." + extension;
        Path destino = resolver(ruta);
        try {
            Files.createDirectories(destino.getParent());
            Files.write(destino, contenido);
        } catch (IOException ex) {
            throw new UncheckedIOException("No se pudo guardar el archivo", ex);
        }
        return ruta;
    }

    public void eliminar(String ruta) {
        if (ruta == null) {
            return;
        }
        try {
            Files.deleteIfExists(resolver(ruta));
        } catch (IOException ex) {
            log.warn("No se pudo borrar {}: {}", ruta, ex.getMessage());
        }
    }

    public void eliminarCarpeta(String carpeta) {
        Path directorio = resolver(carpeta);
        if (!Files.isDirectory(directorio)) {
            return;
        }
        try (Stream<Path> rutas = Files.walk(directorio)) {
            rutas.sorted(Comparator.reverseOrder()).forEach(p -> {
                try {
                    Files.deleteIfExists(p);
                } catch (IOException ex) {
                    log.warn("No se pudo borrar {}: {}", p, ex.getMessage());
                }
            });
        } catch (IOException ex) {
            log.warn("No se pudo recorrer {}: {}", carpeta, ex.getMessage());
        }
    }

    /** Evita rutas que se salgan de UPLOADS_DIR (por ejemplo con "../"). */
    private Path resolver(String ruta) {
        Path destino = raiz.resolve(ruta).normalize();
        if (!destino.startsWith(raiz)) {
            throw new ArchivoInvalidoException("Ruta de archivo no válida");
        }
        return destino;
    }
}
