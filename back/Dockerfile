# Imagen del back (Spring Boot). Multietapa: compila con el JDK y corre con el JRE.
# Las pruebas no corren aquí (necesitan MySQL): las corre ./mvnw verify en local y en Jenkins.

# ---------- 1. Compilación ----------
FROM eclipse-temurin:21-jdk-jammy AS compilacion
WORKDIR /fuente

# Primero el wrapper y el pom: las dependencias quedan en caché mientras no cambie el pom.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q -B dependency:go-offline

COPY src/ src/
RUN ./mvnw -q -B -DskipTests package \
    && cp target/back-*.jar app.jar

# ---------- 2. Ejecución ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Usuario sin privilegios; la carpeta de archivos subidos es suya (se monta como volumen).
RUN addgroup -S gc && adduser -S gc -G gc \
    && mkdir -p /app/uploads && chown gc:gc /app/uploads
USER gc

COPY --from=compilacion /fuente/app.jar app.jar

ENV UPLOADS_DIR=/app/uploads \
    JAVA_OPTS="-XX:MaxRAMPercentage=75"
VOLUME /app/uploads
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
    CMD wget -qO- http://localhost:8080/actuator/health/readiness | grep -q '"UP"' || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
