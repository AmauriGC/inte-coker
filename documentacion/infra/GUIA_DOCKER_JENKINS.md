# Guía de Docker, docker-compose y Jenkins

> Apuntes para explicar y demostrar la infraestructura de GC-Confort (por ejemplo, ante
> el profesor) y para hacer cambios puntuales sin romper nada. El detalle de cómo se
> construyó está en `md/hechos/FASE_08_docker.md` y `md/hechos/FASE_09_jenkins.md`.

## 1. La idea en una frase

Docker empaqueta cada parte (MySQL, back, front) en un contenedor; docker-compose las
levanta juntas con un comando; Jenkins vigila GitHub y, cuando algo llega a `test` o
`main`, prueba el proyecto y lo vuelve a levantar solo.

```
GitHub (develop / test / main)
   │  Jenkins revisa cada 2 minutos
   ▼
Jenkins (contenedor) ──► pruebas back (MySQL desechable) ──► lint + build front
   │                                            (si la rama es test o main)
   ▼
docker compose -p gc-test / gc-main up -d --build
   │
   ├─ mysql  (volumen datos)
   ├─ back   (Spring Boot, volumen archivos)
   └─ front  (nginx: sirve la PWA y reenvía /api y /uploads al back)
```

## 2. Archivos y para qué sirve cada uno

| Archivo | Qué es | Puntos para explicar |
|---|---|---|
| `back/Dockerfile` | Imagen del back | Multietapa: etapa 1 compila con el JDK, etapa 2 corre con el JRE (imagen más chica). El `pom.xml` se copia antes que el código para cachear dependencias. Usuario sin privilegios. `HEALTHCHECK` a `/actuator/health/readiness` |
| `front/Dockerfile` | Imagen del front | Multietapa: Node compila (`npm ci`, `npm run build`), nginx sirve el `dist`. `VITE_API_URL=/api` (relativa) |
| `front/nginx/default.conf.template` | Configuración de nginx | Respaldo SPA a `index.html`; `/api` y `/uploads` van al back; `sw.js` sin caché; `/assets` con caché de un año |
| `back/.dockerignore`, `front/.dockerignore` | Lo que no entra a la imagen | `target`, `node_modules`, `dist`, `.env` |
| `docker-compose.yml` | Los tres servicios juntos | `depends_on` con `condition: service_healthy`; volúmenes con nombre; variables del `.env` |
| `jenkins/Dockerfile` | Imagen de Jenkins | Jenkins LTS + Node + cliente de Docker + plugins |
| `jenkins/plugins.txt` | Plugins | JCasC, Job DSL, Pipeline, Git, credenciales, JUnit |
| `jenkins/jenkins.yaml` | Configuración como código (JCasC) | Usuario admin, credencial `gc-env` (el `.env`) y el job multibranch |
| `jenkins/docker-compose.yml` | Levanta Jenkins | Monta el socket de Docker, el `.env` y la red `gc-ci` |
| `Jenkinsfile` | El pipeline | Etapas: pruebas back, lint y build front, desplegar |

## 3. Comandos de Docker y compose

Todos desde la raíz del repositorio y con Docker Desktop encendido.

| Para | Comando |
|---|---|
| Levantar todo (y reconstruir si cambió el código) | `docker compose up -d --build` |
| Ver estado y salud | `docker compose ps` |
| Ver logs en vivo de un servicio | `docker compose logs -f back` |
| Reconstruir solo un servicio | `docker compose up -d --build front` |
| Reiniciar un servicio | `docker compose restart back` |
| Entrar a un contenedor | `docker compose exec back sh` |
| Abrir MySQL de Docker | `docker compose exec mysql mysql -uroot -p` (pide `DB_PASSWORD`) |
| Apagar (los datos se quedan) | `docker compose down` |
| Apagar y borrar base y archivos | `docker compose down -v` |
| Ver la configuración final con variables | `docker compose config` |
| Ver imágenes y su tamaño | `docker images gc-confort/*` |
| Ver volúmenes | `docker volume ls` |
| Uso de CPU y memoria | `docker stats` |

Direcciones: front `http://localhost:8088`, back `http://localhost:8089/swagger-ui.html`,
health `http://localhost:8089/actuator/health`.

## 4. Comandos de Jenkins

| Para | Comando o lugar |
|---|---|
| Levantar Jenkins | `docker compose -f jenkins/docker-compose.yml --env-file .env up -d --build` |
| Apagar Jenkins (el historial se queda) | `docker compose -f jenkins/docker-compose.yml --env-file .env down` |
| Logs de Jenkins | `docker logs -f gc-jenkins-jenkins-1` |
| Entrar | `http://localhost:8090`, usuario y contraseña `JENKINS_ADMIN_*` del `.env` |
| Lanzar un build sin esperar | En el job `GC-Confort`: "Scan Multibranch Pipeline Now", o en la rama: "Build Now" |
| Ver pruebas | En el build: "Test Result" (reportes JUnit del back) |
| Ver etapas | Vista "Stage View" del job de la rama |

## 5. Flujo de despliegue (cuándo se levanta solo)

| Llega un cambio a | Jenkins hace | Resultado |
|---|---|---|
| `develop` (PR fusionado) | Pruebas del back y lint/build del front | Solo verifica; no despliega |
| `test` (PR `develop → test`) | Lo mismo y despliega `gc-test` | `http://localhost:8180` |
| `main` (PR `test → main`) | Lo mismo y despliega `gc-main` | `http://localhost:8280` |

Condiciones: Jenkins tiene que estar encendido. Si estaba apagado, al encenderlo escanea,
ve los commits nuevos y construye. Si una etapa falla, no se despliega nada y el ambiente
anterior sigue arriba.

Cada ambiente es un proyecto de compose distinto (`-p gc-test`, `-p gc-main`): tiene su
propia base y sus propios archivos, y no choca con el compose local (8088).

## 6. Preguntas probables y respuesta corta

| Pregunta | Respuesta |
|---|---|
| ¿Por qué multietapa? | La imagen final solo lleva lo necesario para correr (JRE o nginx), no el JDK, Maven ni Node: es más chica y más segura |
| ¿Por qué se copia el `pom.xml` primero? | Docker cachea por capa; si solo cambia el código, no vuelve a bajar dependencias |
| ¿Cómo se comunican los contenedores? | Por la red que crea compose; cada servicio se llama por su nombre (`mysql`, `back`) |
| ¿Dónde quedan los datos? | En volúmenes con nombre (`datos`, `archivos`); sobreviven a `down`, se borran con `down -v` |
| ¿Cómo sabe compose que el back está listo? | `healthcheck` en cada servicio y `depends_on: condition: service_healthy` |
| ¿Dónde están los secretos? | En el `.env` (no se sube). compose lo lee para las variables; Jenkins lo guarda como credencial de archivo |
| ¿Por qué nginx reenvía `/api`? | Página y API quedan en el mismo origen: sin CORS y funciona desde cualquier IP |
| ¿Por qué las pruebas no corren en el `docker build`? | Necesitan MySQL real; corren en Jenkins con un MySQL desechable |
| ¿Qué es JCasC? | Configuration as Code: Jenkins se configura desde `jenkins.yaml`, sin clics; se puede borrar y recrear igual |
| ¿Qué es multibranch? | Un job que encuentra las ramas con `Jenkinsfile` y crea un pipeline por rama |
| ¿Por qué no webhook? | Jenkins está en la laptop y GitHub no puede llamarlo; el escaneo cada 2 minutos hace el mismo trabajo. Con un túnel público se puede agregar |
| ¿Cómo despliega Jenkins si está en un contenedor? | Usa el Docker de la laptop por el socket montado (`/var/run/docker.sock`); los ambientes son contenedores hermanos |

## 7. Cambios que pueden pedir y cómo hacerlos

| Petición | Qué tocar |
|---|---|
| Cambiar el puerto del front o del back | `FRONT_PORT` / `BACK_PORT` en el `.env` y `docker compose up -d` |
| Cambiar los puertos de test o main | `Jenkinsfile`, etapa "Desplegar", bloque `environment` |
| Publicar el puerto de MySQL de Docker | En `docker-compose.yml`, servicio `mysql`: `ports: ["3307:3306"]` (3307 para no chocar con el MySQL local) |
| Agregar una variable al back | `.env` y `.env.example`, `application.properties` con `${VAR:default}` y `docker-compose.yml` en `back.environment` |
| Limitar memoria o CPU | En el servicio de compose: `deploy: resources: limits: { memory: 512M, cpus: "1.0" }` |
| Agregar un servicio (por ejemplo phpMyAdmin o Adminer) | Nuevo servicio en `docker-compose.yml` con `image: adminer`, `ports: ["8087:8080"]` y `depends_on: [mysql]` |
| Subir las imágenes a Docker Hub | `docker login`, `docker tag gc-confort/back:local <usuario>/gc-back:1.0`, `docker push <usuario>/gc-back:1.0` |
| Agregar una etapa al pipeline | Nuevo `stage('Nombre') { steps { sh '...' } }` en el `Jenkinsfile`; se sube por PR y Jenkins la toma solo |
| Correr etapas en paralelo | Envolver las dos etapas en `stage('Verificar') { parallel { stage('Back') {...} stage('Front') {...} } }` |
| Pedir aprobación antes de main | En "Desplegar": `input message: '¿Desplegar a producción?'` cuando `BRANCH_NAME == 'main'` |
| Construir también las ramas `feat/*` | `jenkins/jenkins.yaml`: `includes('develop test main feat/*')` y reiniciar Jenkins |
| Cambiar la frecuencia de revisión | `jenkins/jenkins.yaml`: `periodicFolderTrigger { interval('5m') }` |
| Webhook en vez de escaneo | Exponer Jenkins con un túnel (Tailscale Funnel, ngrok), webhook en GitHub a `<url>/github-webhook/` y plugin `github` |
| Etiquetar la versión al liberar | Después del PR a `main`: `git tag v0.1.0` y `git push origin v0.1.0` |

## 8. Guion corto para una demostración

1. Mostrar `docker-compose.yml` y los dos `Dockerfile` (multietapa).
2. `docker compose up -d --build` y `docker compose ps` hasta ver los tres `healthy`.
3. Abrir `http://localhost:8088`: catálogo, un mueble en 3D. Abrir Swagger en 8089.
4. `docker compose logs back` para mostrar el arranque y la semilla.
5. Levantar Jenkins y entrar a `http://localhost:8090`; mostrar el job `GC-Confort`, el
   `Jenkinsfile` y el `jenkins.yaml` (configuración como código).
6. Hacer un cambio pequeño (por ejemplo un texto), PR a `develop` y luego `develop → test`.
7. Esperar el escaneo (o "Scan Multibranch Pipeline Now"): ver las etapas en verde, las
   pruebas en "Test Result" y el despliegue en `http://localhost:8180`.

## 9. Problemas conocidos y su arreglo

| Síntoma | Causa | Arreglo |
|---|---|---|
| `failed to connect to the docker API` | Docker Desktop apagado | Abrir Docker Desktop y esperar a que diga "running" |
| Front `unhealthy` con `Connection refused` | `localhost` en Alpine es IPv6 y nginx escucha IPv4 | Ya resuelto: el healthcheck usa `127.0.0.1` |
| Jenkins: `GnuTLS recv error (-110)` al bajar de GitHub | git con HTTP/2 y red inestable | Ya resuelto: la imagen usa `http.version HTTP/1.1` |
| Maven: `Connection refused` a Maven Central | Red inestable | Volver a lanzar el build; lo ya bajado queda en caché |
| Puerto ocupado al levantar | Otro programa usa 8088, 8089 u 8090 | Cambiar el puerto en el `.env` o cerrar el otro programa (`netstat -ano | findstr :8088`) |
| El back no ve los modelos en Docker | Los archivos viven en el volumen `archivos`, no en `back/uploads` | Es lo esperado; la semilla los vuelve a cargar en una base nueva |
| `HEAD` a un `.glb` da 401 | El back solo permite `GET` en `/uploads` | Es lo esperado; el navegador usa `GET` |
