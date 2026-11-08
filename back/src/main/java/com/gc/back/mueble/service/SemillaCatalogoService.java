package com.gc.back.mueble.service;

import com.gc.back.archivo.entity.TipoArchivo;
import com.gc.back.categoria.entity.Categoria;
import com.gc.back.categoria.service.CategoriaService;
import com.gc.back.mueble.dto.MuebleRequest;
import com.gc.back.mueble.dto.VarianteRequest;
import com.gc.back.mueble.entity.Mueble;
import com.gc.back.mueble.repository.MuebleRepository;
import com.gc.back.security.UsuarioPrincipal;
import com.gc.back.usuario.entity.Usuario;
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
import java.util.Map;

/**
 * Carga los muebles hechos en Blender (resources/semilla), publicados y a nombre del
 * vendedor de ejemplo (el administrador no vende). Los ejemplos que una versión anterior
 * dejó a nombre de otra cuenta pasan a ese vendedor. Solo agrega los que faltan (por slug): un modelo nuevo aparece al
 * reiniciar sin tocar los existentes. Un ejemplo borrado vuelve en el siguiente arranque;
 * para evitarlo se apaga con SEMILLA_CATALOGO=false. Los precios son de ejemplo.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SemillaCatalogoService {

    private record Ejemplo(String archivo, String categoria, String descripcionCategoria, MuebleDatos datos) {
    }

    private record MuebleDatos(String nombre, String descripcion, String precio,
                               int ancho, int fondo, int alto, String materiales, int existencias) {
    }

    private static final List<Ejemplo> EJEMPLOS = List.of(
            new Ejemplo("sofa-nube", "Sofás", "Sofás de dos y tres plazas",
                    new MuebleDatos("Sofá Nube", "Sofá de tres plazas con cojines mullidos y patas de roble.",
                            "18900.00", 210, 92, 89, "Tela arena, patas de roble", 4)),
            new Ejemplo("sillon-ola", "Sillones", "Sillones y butacas individuales",
                    new MuebleDatos("Sillón Ola", "Sillón individual de respaldo curvo, ideal junto a la ventana.",
                            "7450.00", 78, 72, 101, "Tela terracota, estructura de roble", 6)),
            new Ejemplo("mesa-luna", "Mesas", "Mesas de centro, auxiliares y de comedor",
                    new MuebleDatos("Mesa Luna", "Mesa de centro redonda con cubierta de mármol.",
                            "5200.00", 80, 80, 40, "Mármol, base de roble, zócalo de latón", 8)),
            new Ejemplo("lampara-faro", "Iluminación", "Lámparas de piso, mesa y techo",
                    new MuebleDatos("Lámpara Faro", "Lámpara de piso con pantalla de lino y luz cálida.",
                            "3350.00", 48, 48, 160, "Metal negro, pantalla de lino, latón", 10)),
            new Ejemplo("sofa-duna", "Sofás", "Sofás de dos y tres plazas",
                    new MuebleDatos("Sofá Duna", "Sofá compacto de dos plazas con cojines sueltos, ideal para espacios pequeños.",
                            "12600.00", 160, 85, 82, "Tela salvia, patas de metal negro", 3)),
            new Ejemplo("butaca-coral", "Sillones", "Sillones y butacas individuales",
                    new MuebleDatos("Butaca Coral", "Butaca de brazos anchos y asiento profundo para leer con calma.",
                            "6200.00", 74, 78, 76, "Tela mostaza, patas de roble", 5)),
            new Ejemplo("mesa-taller", "Mesas", "Mesas de centro, auxiliares y de comedor",
                    new MuebleDatos("Mesa Taller", "Mesa de comedor para seis personas con base de trineo de metal.",
                            "9800.00", 180, 90, 75, "Cubierta de roble, base de metal negro", 2)),
            new Ejemplo("lampara-nido", "Iluminación", "Lámparas de piso, mesa y techo",
                    new MuebleDatos("Lámpara Nido", "Lámpara de mesa con base de cerámica esférica y pantalla de lino.",
                            "1450.00", 30, 30, 45, "Cerámica, latón, pantalla de lino", 12)),
            new Ejemplo("sillon-alba", "Sillones", "Sillones y butacas individuales",
                    new MuebleDatos("Sillón Alba", "Sillón tapizado con respaldo capitonado, vivos en el cojín y patas torneadas de nogal.",
                            "8900.00", 83, 82, 90, "Tela arena, patas de nogal, casquillos de latón", 4))
    );

    /**
     * Colores de ejemplo. Solo los modelos con material GC_Color cambian de color en el visor.
     * Si el mueble de ejemplo ya existe sin colores, se le agregan al arrancar.
     */
    private static final Map<String, List<VarianteRequest>> COLORES = Map.of(
            "sillon-alba", List.of(
                    new VarianteRequest(null, "Arena", "#D9C4A0", 2),
                    new VarianteRequest(null, "Terracota", "#B8643F", 1),
                    new VarianteRequest(null, "Salvia", "#8FA184", 1),
                    new VarianteRequest(null, "Azul noche", "#44506A", 0)));

    private final MuebleRepository muebleRepository;
    private final MuebleService muebleService;
    private final CategoriaService categoriaService;
    private final UsuarioService usuarioService;

    @Transactional
    public void sembrarFaltantes(Usuario vendedor) {
        reasignar(vendedor);
        List<Ejemplo> faltantes = EJEMPLOS.stream()
                .filter(ejemplo -> !muebleRepository.existsBySlug(ejemplo.archivo()))
                .toList();
        asegurarColores();
        if (faltantes.isEmpty()) {
            return;
        }
        UsuarioPrincipal dueno = UsuarioPrincipal.desde(vendedor);
        for (Ejemplo ejemplo : faltantes) {
            Categoria categoria = categoriaService.asegurar(ejemplo.categoria(), ejemplo.descripcionCategoria());
            MuebleDatos d = ejemplo.datos();
            Long id = muebleService.crear(new MuebleRequest(d.nombre(), d.descripcion(), new BigDecimal(d.precio()),
                    d.ancho(), d.fondo(), d.alto(), d.materiales(), d.existencias(), categoria.getId(),
                    COLORES.get(ejemplo.archivo())), dueno).id();

            Mueble mueble = muebleRepository.findWithRelacionesById(id).orElseThrow();
            muebleService.adjuntar(mueble, leer(ejemplo.archivo() + ".glb"), TipoArchivo.MODELO_3D);
            muebleService.adjuntar(mueble, leer(ejemplo.archivo() + ".webp"), TipoArchivo.IMAGEN);
            mueble.setPublicado(true);
        }
        log.info("Catálogo de ejemplo: {} muebles agregados", faltantes.size());
    }

    private void reasignar(Usuario vendedor) {
        long movidos = EJEMPLOS.stream()
                .map(ejemplo -> muebleRepository.findBySlug(ejemplo.archivo()).orElse(null))
                .filter(m -> m != null && !m.getVendedor().getId().equals(vendedor.getId()))
                .peek(m -> m.setVendedor(vendedor))
                .count();
        if (movidos > 0) {
            log.info("Catálogo de ejemplo: {} muebles pasaron a {}", movidos, vendedor.getEmail());
        }
    }

    private void asegurarColores() {
        COLORES.forEach((slug, colores) -> muebleRepository.findBySlug(slug)
                .filter(m -> !m.tieneVariantes())
                .ifPresent(m -> {
                    muebleService.reemplazarColores(m, colores);
                    log.info("Colores de ejemplo agregados a {}", slug);
                }));
    }

    private static byte[] leer(String archivo) {
        try (InputStream in = new ClassPathResource("semilla/" + archivo).getInputStream()) {
            return in.readAllBytes();
        } catch (IOException ex) {
            throw new UncheckedIOException("Falta el archivo de semilla " + archivo, ex);
        }
    }
}
