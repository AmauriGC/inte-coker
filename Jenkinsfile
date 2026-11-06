// Pipeline de GC-Confort (multibranch: develop, test y main).
// develop: pruebas del back contra MySQL + lint y build del front.
// test y main: lo mismo y, si pasa, despliegue automático con docker compose.

pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 40, unit: 'MINUTES')
    }

    environment {
        // MySQL desechable para las pruebas, en la red gc-ci (la misma de Jenkins).
        MYSQL_CI = "gc-ci-mysql-${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
    }

    stages {
        stage('Back: pruebas') {
            steps {
                sh '''
                    docker run -d --rm --name "$MYSQL_CI" --network gc-ci -e MYSQL_ROOT_PASSWORD=ci mysql:8.4
                    # Por TCP: el servidor temporal del primer arranque no escucha en red.
                    for i in $(seq 1 60); do
                        docker exec "$MYSQL_CI" mysqladmin ping -h 127.0.0.1 -uroot -pci --silent && break
                        sleep 2
                    done
                '''
                dir('back') {
                    withEnv(["DB_HOST=${env.MYSQL_CI}", 'DB_PORT=3306', 'DB_USERNAME=root', 'DB_PASSWORD=ci',
                             'DB_NAME_TEST=catalogo_muebles_test']) {
                        sh 'chmod +x mvnw && ./mvnw -B -ntp verify'
                    }
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'back/target/surefire-reports/*.xml'
                    sh 'docker rm -f "$MYSQL_CI" > /dev/null 2>&1 || true'
                }
            }
        }

        stage('Front: lint y build') {
            steps {
                dir('front') {
                    sh 'npm ci --no-audit --no-fund && npm run lint && npm run build'
                }
            }
        }

        stage('Desplegar') {
            when {
                anyOf { branch 'test'; branch 'main' }
            }
            environment {
                // Cada ambiente con su proyecto de compose (base y archivos propios) y sus puertos.
                FRONT_PORT = "${env.BRANCH_NAME == 'main' ? '8280' : '8180'}"
                BACK_PORT = "${env.BRANCH_NAME == 'main' ? '8281' : '8181'}"
                TAG = "${env.BRANCH_NAME}"
            }
            steps {
                withCredentials([file(credentialsId: 'gc-env', variable: 'ENV_FILE')]) {
                    sh 'docker compose --env-file "$ENV_FILE" -p "gc-$BRANCH_NAME" up -d --build --wait --wait-timeout 300'
                }
                // Prueba de humo: el catálogo responde a través de nginx.
                sh 'curl -fsS "http://host.docker.internal:$FRONT_PORT/api/muebles?size=1" > /dev/null'
                echo "Desplegado ${env.BRANCH_NAME}: http://localhost:${env.FRONT_PORT}"
            }
        }
    }

    post {
        success { echo "Pipeline en verde (${env.BRANCH_NAME} #${env.BUILD_NUMBER})" }
        failure { echo "Pipeline en rojo: revisa la etapa marcada (${env.BRANCH_NAME} #${env.BUILD_NUMBER})" }
    }
}
