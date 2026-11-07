package com.gc.back.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Ajustes de esquema que ddl-auto=update no hace. Hibernate creó algunas columnas de
 * enums como ENUM nativo de MySQL; al agregar un valor nuevo (por ejemplo el estado
 * APARTADO) el insert fallaría. Aquí se pasan a VARCHAR, que es como ya las mapea la
 * entidad. Es idempotente: si la columna ya es VARCHAR no hace nada.
 */
@Slf4j
@Component
@Order(0)
@RequiredArgsConstructor
public class AjustesEsquema implements ApplicationRunner {

    private record Columna(String tabla, String columna, boolean obligatoria) {
    }

    private static final List<Columna> A_VARCHAR = List.of(
            new Columna("pedidos", "estado", true),
            new Columna("pedidos", "tipo_entrega", false));

    private final JdbcTemplate jdbc;

    @Override
    public void run(ApplicationArguments args) {
        for (Columna c : A_VARCHAR) {
            Integer enums = jdbc.queryForObject("""
                    select count(*) from information_schema.columns
                    where table_schema = database() and table_name = ? and column_name = ? and data_type = 'enum'
                    """, Integer.class, c.tabla(), c.columna());
            if (enums != null && enums > 0) {
                jdbc.execute("alter table %s modify %s varchar(20)%s".formatted(
                        c.tabla(), c.columna(), c.obligatoria() ? " not null" : " null"));
                log.info("Columna {}.{} cambiada de ENUM a VARCHAR(20)", c.tabla(), c.columna());
            }
        }
    }
}
