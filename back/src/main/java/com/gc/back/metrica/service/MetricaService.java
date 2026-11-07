package com.gc.back.metrica.service;

import com.gc.back.common.exception.ReglaNegocioException;
import com.gc.back.metrica.dto.Calificacion;
import com.gc.back.metrica.dto.Conteo;
import com.gc.back.metrica.dto.FilaVenta;
import com.gc.back.metrica.dto.MetricasResponse;
import com.gc.back.metrica.dto.MetricasResponse.MuebleMetrica;
import com.gc.back.metrica.dto.MetricasResponse.Periodo;
import com.gc.back.metrica.dto.MetricasResponse.Punto;
import com.gc.back.metrica.dto.MetricasResponse.Resumen;
import com.gc.back.metrica.dto.MetricasResponse.Zona;
import com.gc.back.metrica.repository.MetricaRepository;
import com.gc.back.mueble.entity.Mueble;
import com.gc.back.mueble.repository.MuebleRepository;
import com.gc.back.mueble.service.MuebleService;
import com.gc.back.pedido.entity.EstadoPedido;
import com.gc.back.pedido.entity.MetodoPago;
import com.gc.back.security.UsuarioPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import static java.time.DayOfWeek.MONDAY;

/**
 * Métricas de ventas, zonas, muebles y conversión. El vendedor ve las de sus muebles
 * (METRICA_VER); quien tiene METRICA_GLOBAL puede ver toda la tienda. Los días se cuentan en
 * la zona de México. Se agregan en memoria sobre filas ligeras del periodo (máximo 365 días).
 */
@Service
@RequiredArgsConstructor
public class MetricaService {

    public static final String VER = "METRICA_VER";
    public static final String GLOBAL = "METRICA_GLOBAL";
    private static final ZoneId ZONA = ZoneId.of("America/Mexico_City");
    private static final int MAX_ZONAS = 10;
    private static final int MAX_MUEBLES = 20;

    private final MetricaRepository metricaRepository;
    private final MuebleRepository muebleRepository;
    private final MuebleService muebleService;

    /** Suma una vista al mueble publicado; las del propio vendedor no cuentan. */
    @Transactional
    public void registrarVista(Long muebleId, UsuarioPrincipal actual) {
        Mueble mueble = muebleService.obtenerPublicado(muebleId);
        if (actual != null && mueble.getVendedor().getId().equals(actual.id())) {
            return;
        }
        metricaRepository.sumarVista(mueble.getId(), LocalDate.now(ZONA), Instant.now());
    }

    @Transactional(readOnly = true)
    public MetricasResponse metricas(int dias, boolean tienda, UsuarioPrincipal actual) {
        boolean global = tienda && actual.permisos().contains(GLOBAL);
        if (!global && !actual.permisos().contains(VER)) {
            throw new ReglaNegocioException("Tu cuenta no tiene métricas de muebles propios");
        }
        Long vendedor = global ? null : actual.id();
        LocalDate hasta = LocalDate.now(ZONA);
        LocalDate desde = hasta.minusDays(dias - 1L);
        Instant inicio = desde.atStartOfDay(ZONA).toInstant();

        List<FilaVenta> ventas = metricaRepository.ventas(EstadoPedido.ENTREGADO, inicio, vendedor);
        Map<Long, Long> pedidos = mapa(metricaRepository.pedidosPorMueble(inicio, vendedor));
        Map<Long, Long> vistas = mapa(metricaRepository.vistasPorMueble(desde, vendedor));
        long totalPedidos = metricaRepository.pedidos(inicio, vendedor);
        long totalVistas = vistas.values().stream().mapToLong(Long::longValue).sum();

        boolean porDia = dias <= 31;
        return new MetricasResponse(
                new Periodo(desde, hasta, dias, global, porDia ? "DIA" : "SEMANA"),
                resumen(ventas, totalPedidos, totalVistas, inicio, vendedor),
                serie(ventas, desde, hasta, porDia),
                ciudades(ventas),
                codigosPostales(ventas),
                muebles(ventas, pedidos, vistas),
                pagos(ventas));
    }

    private Resumen resumen(List<FilaVenta> ventas, long pedidos, long vistas, Instant inicio, Long vendedor) {
        long piezas = ventas.stream().mapToLong(FilaVenta::cantidad).sum();
        BigDecimal ingresos = suma(ventas);
        BigDecimal ticket = ventas.isEmpty() ? BigDecimal.ZERO
                : ingresos.divide(BigDecimal.valueOf(ventas.size()), 2, RoundingMode.HALF_UP);
        return new Resumen(ventas.size(), piezas, ingresos, ticket, pedidos, vistas, porcentaje(pedidos, vistas),
                horas(ventas, FilaVenta::solicitadoEn, FilaVenta::aceptadoEn),
                horas(ventas, FilaVenta::aceptadoEn, FilaVenta::entregadoEn),
                redondear(metricaRepository.promedioResenas(inicio, vendedor)),
                metricaRepository.resenas(inicio, vendedor));
    }

    /** Un punto por día o por semana (lunes), aunque no haya ventas, para que la gráfica no salte. */
    private static List<Punto> serie(List<FilaVenta> ventas, LocalDate desde, LocalDate hasta, boolean porDia) {
        Function<LocalDate, LocalDate> grupo = porDia ? d -> d : d -> d.with(TemporalAdjusters.previousOrSame(MONDAY));
        Map<LocalDate, List<FilaVenta>> porGrupo = ventas.stream()
                .collect(Collectors.groupingBy(v -> grupo.apply(v.entregadoEn().atZone(ZONA).toLocalDate())));
        List<Punto> serie = new ArrayList<>();
        for (LocalDate d = grupo.apply(desde); !d.isAfter(hasta); d = d.plus(1, porDia ? ChronoUnit.DAYS : ChronoUnit.WEEKS)) {
            List<FilaVenta> filas = porGrupo.getOrDefault(d, List.of());
            serie.add(new Punto(d, filas.size(), suma(filas)));
        }
        return serie;
    }

    /** Ciudades de los envíos a domicilio; se agrupan sin importar mayúsculas ni espacios. */
    private static List<Zona> ciudades(List<FilaVenta> ventas) {
        return zonas(ventas, v -> v.ciudad() == null ? null : clave(v.ciudad()), FilaVenta::ciudad, v -> null);
    }

    private static List<Zona> codigosPostales(List<FilaVenta> ventas) {
        return zonas(ventas, FilaVenta::codigoPostal, FilaVenta::codigoPostal, FilaVenta::ciudad);
    }

    private static List<Zona> zonas(List<FilaVenta> ventas, Function<FilaVenta, String> clave,
                                    Function<FilaVenta, String> nombre, Function<FilaVenta, String> detalle) {
        Map<String, List<FilaVenta>> grupos = new LinkedHashMap<>();
        for (FilaVenta v : ventas) {
            String k = clave.apply(v);
            if (k != null) {
                grupos.computeIfAbsent(k, x -> new ArrayList<>()).add(v);
            }
        }
        return grupos.values().stream()
                .map(filas -> new Zona(nombre.apply(filas.getFirst()).trim(), detalle.apply(filas.getFirst()),
                        filas.size(), filas.stream().mapToLong(FilaVenta::cantidad).sum(), suma(filas)))
                .sorted(Comparator.comparingLong(Zona::ventas).reversed().thenComparing(Zona::ingresos, Comparator.reverseOrder()))
                .limit(MAX_ZONAS)
                .toList();
    }

    /** Muebles con ventas, pedidos o vistas en el periodo; primero los más vendidos. */
    private List<MuebleMetrica> muebles(List<FilaVenta> ventas, Map<Long, Long> pedidos, Map<Long, Long> vistas) {
        Map<Long, List<FilaVenta>> vendidos = ventas.stream().filter(v -> v.muebleId() != null)
                .collect(Collectors.groupingBy(FilaVenta::muebleId));
        Set<Long> ids = new HashSet<>(vendidos.keySet());
        ids.addAll(pedidos.keySet());
        ids.addAll(vistas.keySet());
        if (ids.isEmpty()) {
            return List.of();
        }
        Map<Long, Mueble> datos = muebleRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Mueble::getId, Function.identity()));
        Map<Long, Calificacion> calificaciones = metricaRepository.calificaciones(ids).stream()
                .collect(Collectors.toMap(Calificacion::muebleId, Function.identity()));
        return ids.stream()
                .filter(datos::containsKey)
                .map(id -> {
                    List<FilaVenta> filas = vendidos.getOrDefault(id, List.of());
                    Calificacion c = calificaciones.get(id);
                    long p = pedidos.getOrDefault(id, 0L);
                    long v = vistas.getOrDefault(id, 0L);
                    Mueble m = datos.get(id);
                    return new MuebleMetrica(id, m.getNombre(), m.getSlug(), filas.stream().mapToLong(FilaVenta::cantidad).sum(),
                            suma(filas), p, v, porcentaje(p, v), c == null ? null : redondear(c.promedio()),
                            c == null ? 0 : c.resenas());
                })
                .sorted(Comparator.comparingLong(MuebleMetrica::vendidos).reversed()
                        .thenComparing(Comparator.comparingLong(MuebleMetrica::vistas).reversed())
                        .thenComparing(MuebleMetrica::nombre))
                .limit(MAX_MUEBLES)
                .toList();
    }

    private static Map<MetodoPago, Long> pagos(List<FilaVenta> ventas) {
        Map<MetodoPago, Long> pagos = new EnumMap<>(MetodoPago.class);
        for (MetodoPago m : MetodoPago.values()) {
            pagos.put(m, ventas.stream().filter(v -> v.metodoPago() == m).count());
        }
        return pagos;
    }

    private static Map<Long, Long> mapa(List<Conteo> conteos) {
        Map<Long, Long> mapa = new HashMap<>();
        conteos.forEach(c -> mapa.put(c.muebleId(), c.total()));
        return mapa;
    }

    private static BigDecimal suma(List<FilaVenta> filas) {
        return filas.stream().map(FilaVenta::total).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** Promedio en horas (un decimal) entre dos fechas del pedido; null si no hay datos. */
    private static Double horas(List<FilaVenta> ventas, Function<FilaVenta, Instant> de, Function<FilaVenta, Instant> a) {
        double promedio = ventas.stream()
                .filter(v -> de.apply(v) != null && a.apply(v) != null)
                .mapToLong(v -> Duration.between(de.apply(v), a.apply(v)).toMinutes())
                .average().orElse(Double.NaN);
        return Double.isNaN(promedio) ? null : Math.round(promedio / 6.0) / 10.0;
    }

    private static Double porcentaje(long parte, long total) {
        return total == 0 ? null : Math.round(parte * 1000.0 / total) / 10.0;
    }

    private static Double redondear(Double valor) {
        return valor == null ? null : Math.round(valor * 10.0) / 10.0;
    }

    private static String clave(String texto) {
        return Objects.requireNonNull(texto).trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }
}
