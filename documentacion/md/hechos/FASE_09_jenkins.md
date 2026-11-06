# FASE 09 · Jenkins

- Maestro: MAESTRO_proyecto.md
- Estado: Hecho
- Fecha: 06/11/2026
- Traza: práctica de Jenkins con despliegue automático (sin HU de usuario)

## Objetivo

Que cada cambio que llega a `develop`, `test` o `main` se pruebe solo y que `test` y
`main` se desplieguen automáticamente con Docker, sin pasos a mano.

## Cambios

- [x] `jenkins/Dockerfile`: `jenkins/jenkins:lts-jdk21` con Node 24, cliente de Docker y
  compose, y los plugins de `plugins.txt`. Sin asistente de instalación.
- [x] `jenkins/jenkins.yaml` (JCasC): usuario administrador desde el `.env`, un ejecutor,
  credencial de archivo `gc-env` con el `.env` y el job multibranch `GC-Confort` (Job DSL).
- [x] `jenkins/docker-compose.yml`: Jenkins en `JENKINS_PORT` (8090), con el socket de
  Docker de la laptop, el `.env` montado de solo lectura y la red fija `gc-ci`.
- [x] `Jenkinsfile` (raíz): pipeline declarativo.
- [x] `.gitattributes`: YAML, plantillas y `plugins.txt` siempre con LF.
- [x] `.env.example`: `JENKINS_PORT`, `JENKINS_ADMIN_USER`, `JENKINS_ADMIN_PASSWORD`.

## Pipeline

| Etapa | Ramas | Qué hace |
|---|---|---|
| Back: pruebas | todas | Levanta un `mysql:8.4` desechable en `gc-ci`, corre `./mvnw verify` contra él, publica los reportes JUnit y borra el MySQL |
| Front: lint y build | todas | `npm ci`, `npm run lint`, `npm run build` |
| Desplegar | `test`, `main` | `docker compose -p gc-<rama> up -d --build --wait` con el `.env` de la credencial; prueba de humo al catálogo por nginx |

| Ambiente | Proyecto compose | Front | Back |
|---|---|---|---|
| test | `gc-test` | `http://localhost:8180` | `http://localhost:8181` |
| main | `gc-main` | `http://localhost:8280` | `http://localhost:8281` |

Cada ambiente tiene su propia base y sus archivos (volúmenes del proyecto compose).

## Cómo se usa

```powershell
# Desde la raíz, con JENKINS_* en el .env
docker compose -f jenkins/docker-compose.yml --env-file .env up -d --build
# Apagar (el historial queda en el volumen jenkins_home)
docker compose -f jenkins/docker-compose.yml --env-file .env down
```

Flujo: PR a `develop` → Jenkins prueba `develop`. PR `develop → test` → Jenkins prueba y
despliega test. PR `test → main` → despliega main.

## Decisiones

- **Escaneo cada 2 minutos en vez de webhook.** Jenkins corre en la laptop y GitHub no
  puede llamarlo. El escaneo periódico detecta los commits nuevos y lanza el build; con
  un túnel público (por ejemplo Tailscale Funnel) se puede agregar el webhook después.
- **Solo `develop`, `test` y `main`.** Las ramas de trabajo se verifican en local antes del
  PR (regla de `AGENTS.md`); así Jenkins no construye las ramas viejas que se conservan.
- **Docker de la laptop (socket montado).** Los ambientes son contenedores hermanos de
  Jenkins. Por eso el compose usa solo volúmenes con nombre, sin rutas de la laptop.
- **El `.env` como credencial.** No se copia al repositorio ni al workspace; el despliegue
  lo recibe con `withCredentials`.
- **Un ejecutor y `-Xmx768m`** para no cargar la laptop.

## Pruebas

Corrida real con Jenkins levantado desde `jenkins/docker-compose.yml` (para la prueba, el
filtro incluyó temporalmente la rama `chore/jenkins`):

- JCasC aplicado al arrancar: usuario, credencial `gc-env` y job `GC-Confort` creados solos.
- Build 3 en verde: MySQL desechable en `gc-ci`, `./mvnw verify` con 10 pruebas, reportes
  JUnit publicados, `npm ci` + lint + build; "Desplegar" omitido por no ser `test` ni `main`.
- Despliegue probado dentro del contenedor de Jenkins con el mismo comando del pipeline y
  los puertos de `test`: los tres servicios `healthy`, prueba de humo por
  `host.docker.internal:8180` en verde y `http://localhost:8180` responde desde la laptop.

Problemas encontrados y resueltos:

| Problema | Arreglo |
|---|---|
| `git fetch` a GitHub cortado: `GnuTLS recv error (-110)` | `git config --system http.version HTTP/1.1` en la imagen |
| `docker run` rechaza `gc-ci-mysql-chore/jenkins-1` | El nombre del contenedor reemplaza `/` por `-` |
| Maven sin conexión a Central a media descarga (red inestable) | Se reintenta; las dependencias quedan en `jenkins_home/.m2` y la siguiente corrida no las baja |
