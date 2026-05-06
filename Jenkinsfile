pipeline {
    agent any

    // Configuramos las variables de entorno si es necesario
    // tools {
    //     nodejs 'Node20' // Asegúrate de tener configurado Node.js en Jenkins -> Global Tool Configuration
    // }

    environment {
        // Variables para el despliegue en EC2 (Deberás configurar estas credenciales en Jenkins)
        // EC2_IP = 'tu-ip-elastica-aws'
        // EC2_USER = 'ubuntu' // o 'ec2-user' dependiendo de tu AMI
        // SSH_CREDENTIAL_ID = 'aws-ec2-ssh-key' // ID de la credencial en Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                // Descarga el código desde la rama de Git
                checkout scm
            }
        }

        stage('Backend: Instalar y Probar') {
            steps {
                dir('server') {
                    echo 'Instalando dependencias del Backend...'
                    sh 'npm install'
                    
                    echo 'Ejecutando pruebas unitarias de Jest...'
                    sh 'npm test'
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

        // --- Etapa de Despliegue (Descomentar y configurar según tus necesidades) ---
        /*
        stage('Deploy to EC2') {
            when {
                branch 'main' // Solo desplegar cuando se hace push a la rama principal
            }
            steps {
                sshagent([SSH_CREDENTIAL_ID]) {
                    // Ejemplo: Copiar archivos al servidor EC2
                    // sh "scp -o StrictHostKeyChecking=no -r server/* ${EC2_USER}@${EC2_IP}:/var/www/farmacia/server"
                    // sh "scp -o StrictHostKeyChecking=no -r client/dist/* ${EC2_USER}@${EC2_IP}:/var/www/farmacia/client/dist"
                    
                    // Ejemplo: Reiniciar servicios usando PM2 en el servidor
                    // sh "ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} 'cd /var/www/farmacia/server && npm install --production && pm2 restart server'"
                }
            }
        }
        */
    }

    post {
        always {
            echo 'Limpiando el workspace...'
            cleanWs()
        }
        success {
            echo '¡Pipeline ejecutado con éxito! ✅'
            // Aquí podrías agregar notificaciones por correo o Slack
        }
        failure {
            echo '¡El Pipeline ha fallado! ❌'
        }
    }
}
