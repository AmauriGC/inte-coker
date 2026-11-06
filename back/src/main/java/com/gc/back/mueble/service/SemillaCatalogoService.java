package com.gc.back.mueble.service;

import com.gc.back.archivo.entity.TipoArchivo;
import com.gc.back.categoria.entity.Categoria;
import com.gc.back.categoria.service.CategoriaService;
import com.gc.back.mueble.dto.MuebleRequest;
import com.gc.back.mueble.entity.Mueble;
import com.gc.back.mueble.repository.MuebleRepository;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.util.List;

/**
 * Carga los 4 muebles hechos en Blender (resources/semilla) cuando el catálogo está
 * vacío, publicados y a nombre del administrador. Los precios son de ejemplo.
 * Se apaga con SEMILLA_CATALOGO=false.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SemillaCatalogoService {

    private record Ejemplo(String archivo, String categoria, String descripcionCategoria, MuebleDatos datos) {
    }

    private record MuebleDatos(String nombre, String descripcion, String precio,
                               int ancho, int fondo, int alto, String materiales) {
    }

    private static final List<Ejemplo> EJEMPLOS = List.of(
            new Ejemplo("sofa-nube", "Sofás", "Sofás de dos y tres plazas",
                    new MuebleDatos("Sofá Nube", "Sofá de tres plazas con cojines mullidos y patas de roble.",
                            "18900.00", 210, 92, 89, "Tela arena, patas de roble")),
            new Ejemplo("sillon-ola", "Sillones", "Sillones y butacas individuales",
                    new MuebleDatos("Sillón Ola", "Sillón individual de respaldo curvo, ideal junto a la ventana.",
                            "7450.00", 78, 72, 101, "Tela terracota, estructura de roble")),
            new Ejemplo("mesa-luna", "Mesas", "Mesas de centro, auxiliares y de comedor",
                    new MuebleDatos("Mesa Luna", "Mesa de centro redonda con cubierta de mármol.",
                            "5200.00", 80, 80, 40, "Mármol, base de roble, zócalo de latón")),
            new Ejemplo("lampara-faro", "Iluminación", "Lámparas de piso, mesa y techo",
                    new MuebleDatos("Lámpara Faro", "Lámpara de piso con pantalla de lino y luz cálida.",
                            "3350.00", 48, 48, 160, "Metal negro, pantalla de lino, latón"))
    );

    private final MuebleRepository muebleRepository;
    private final MuebleService muebleService;
    private final CategoriaService categoriaService;
    private final UsuarioService usuarioService;

    @Transactional
    public void sembrarSiVacio(String adminEmail) {
        if (muebleRepository.count() > 0) {
            return;
        }
        UsuarioPrincipal admin = UsuarioPrincipal.desde(usuarioService.obtenerPorEmail(adminEmail));
        for (Ejemplo ejemplo : EJEMPLOS) {
            Categoria categoria = categoriaService.asegurar(ejemplo.categoria(), ejemplo.descripcionCategoria());
            MuebleDatos d = ejemplo.datos();
            Long id = muebleService.crear(new MuebleRequest(d.nombre(), d.descripcion(), new BigDecimal(d.precio()),
                    d.ancho(), d.fondo(), d.alto(), d.materiales(), categoria.getId()), admin).id();

            Mueble mueble = muebleRepository.findWithRelacionesById(id).orElseThrow();
            muebleService.adjuntar(mueble, leer(ejemplo.archivo() + ".glb"), TipoArchivo.MODELO_3D);
            muebleService.adjuntar(mueble, leer(ejemplo.archivo() + ".webp"), TipoArchivo.IMAGEN);
            mueble.setPublicado(true);
        }
        log.info("Catálogo de ejemplo cargado: {} muebles", EJEMPLOS.size());
    }

    private static byte[] leer(String archivo) {
        try (InputStream in = new ClassPathResource("semilla/" + archivo).getInputStream()) {
            return in.readAllBytes();
        } catch (IOException ex) {
            throw new UncheckedIOException("Falta el archivo de semilla " + archivo, ex);
        }
    }
}
