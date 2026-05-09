pipeline {
    agent any

    options {
        // Mantiene solo las últimas 3 ejecuciones para no llenar el disco del servidor
        buildDiscarder(logRotator(numToKeepStr: '3'))
    }

    tools {
        nodejs 'Node20' // Referencia a la configuración que hiciste en Jenkins Tools
    }

    environment {
        EC2_IP = '16.59.126.224' // Tu IP de AWS actual
        EC2_USER = 'ubuntu'
        SSH_CREDENTIAL_ID = 'aws-ec2-ssh-key' // El ID que crearás en Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend: Instalar y Probar') {
            steps {
                dir('server') {
                    echo 'Instalando dependencias del Backend...'
                    sh 'npm install'
                    echo 'Ejecutando pruebas unitarias de Jest...'
                    // sh 'npm test' // Descomentar cuando tengas los archivos .test.js listos
                }
            }
        }

        stage('Frontend: Instalar y Construir') {
            steps {
                dir('client') {
                    echo 'Instalando dependencias del Frontend...'
                    sh 'npm install'
                    echo 'Construyendo artefactos estáticos (Vite)...'
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                echo 'Desplegando cambios en el servidor local de AWS...'
                // 1. Sincronizamos el Backend asegurando que no sobreescribimos el .env de producción
                sh "sudo rsync -av --exclude='.env' server/ /home/ubuntu/Farmacia-San-Jorge/server/"
                
                // 2. Borramos el frontend viejo y copiamos el nuevo build
                sh "sudo rm -rf /home/ubuntu/Farmacia-San-Jorge/server/dist"
                sh "sudo cp -r client/dist /home/ubuntu/Farmacia-San-Jorge/server/"
                
                // 3. Entramos a la carpeta de producción y reiniciamos PM2
                sh "sudo su - ubuntu -c 'cd /home/ubuntu/Farmacia-San-Jorge/server && npm install && pm2 restart all'"
            }
        }
    }

    post {
        always {
            // Limpia el workspace al finalizar el pipeline para no ocupar espacio
            cleanWs()
        }
        success {
            echo '¡SGT San Jorge desplegado con éxito! ✅'
        }
        failure {
            echo 'Error en el despliegue. Revisar logs. ❌'
        }
    }
}