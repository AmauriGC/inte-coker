# Jenkins para GC-Confort: LTS con JDK 21, Node, cliente de Docker y plugins ya instalados.
# Se configura solo con JCasC (jenkins.yaml): usuario admin, credencial del .env y el job.

FROM jenkins/jenkins:lts-jdk21

USER root

# Node (para lint y build del front) y cliente de Docker con compose (para desplegar).
COPY --from=node:24-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:24-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=docker:29-cli /usr/local/bin/docker /usr/local/bin/docker
COPY --from=docker:29-cli /usr/local/libexec/docker/cli-plugins/docker-compose /usr/local/libexec/docker/cli-plugins/docker-compose
# git con GnuTLS corta a veces las descargas de GitHub por HTTP/2 ("recv error -110"): HTTP/1.1.
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && git config --system http.version HTTP/1.1

USER jenkins

COPY --chown=jenkins:jenkins plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

COPY --chown=jenkins:jenkins jenkins.yaml /usr/share/jenkins/ref/jenkins.yaml

ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false -Xmx768m" \
    CASC_JENKINS_CONFIG=/usr/share/jenkins/ref/jenkins.yaml
