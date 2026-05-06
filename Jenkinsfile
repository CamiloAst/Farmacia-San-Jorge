pipeline {
    agent any

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
            when {
                branch 'main' 
            }
            steps {
                sshagent([SSH_CREDENTIAL_ID]) {
                    echo 'Desplegando cambios en el servidor local de AWS...'
                    // Sincronizamos el código y reiniciamos procesos
                    sh "cp -r client/dist/* /home/ubuntu/Farmacia-San-Jorge/server/dist/"
                    sh "cd /home/ubuntu/Farmacia-San-Jorge/server && npm install && pm2 restart all"
                }
            }
        }
    }

    post {
        success {
            echo '¡SGT San Jorge desplegado con éxito! ✅'
        }
        failure {
            echo 'Error en el despliegue. Revisar logs. ❌'
        }
    }
}