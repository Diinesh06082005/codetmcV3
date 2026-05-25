pipeline {
    agent any

    environment {
        // Name of the credentials set up in Jenkins for Docker Hub
        DOCKER_HUB_CREDS = 'docker-hub-credentials'
        DOCKER_REGISTRY  = 'docker.io'
        
        // Define Docker Hub repository names
        DOCKER_USER      = 'your_docker_username' // Change to your username or inject via environment
        SERVER_IMAGE     = "${DOCKER_USER}/codetmc-server"
        CLIENT_IMAGE     = "${DOCKER_USER}/codetmc-client"
        
        // Production URLs for the build stage of Vite
        PRODUCTION_API_URL    = "http://your-production-server.com:5000"
        PRODUCTION_SOCKET_URL = "http://your-production-server.com:5000"
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from Git Repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing node workspaces dependencies...'
                sh 'npm ci'
            }
        }

        stage('Build Frontend Assets') {
            steps {
                echo 'Building client frontend application...'
                // Build client workspace using workspaces
                sh 'npm run build'
            }
        }

        // Uncomment and configure once tests are defined in package.json
        /*
        stage('Run Tests') {
            steps {
                echo 'Running tests...'
                sh 'npm run test -w server || true'
                sh 'npm run test -w client || true'
            }
        }
        */

        stage('Build Docker Images') {
            steps {
                echo 'Building Docker Images...'
                // Build the server image using root context
                sh "docker build -f server/Dockerfile -t ${SERVER_IMAGE}:latest -t ${SERVER_IMAGE}:${BUILD_NUMBER} ."
                
                // Build the client image using root context passing production API endpoints as build arguments
                sh "docker build -f client/Dockerfile --build-arg VITE_API_URL=${PRODUCTION_API_URL} --build-arg VITE_SOCKET_URL=${PRODUCTION_SOCKET_URL} -t ${CLIENT_IMAGE}:latest -t ${CLIENT_IMAGE}:${BUILD_NUMBER} ."
            }
        }

        stage('Push Docker Images') {
            // Only run on release/production branch builds
            when {
                branch 'main'
            }
            steps {
                echo 'Logging into Docker Hub and pushing images...'
                withCredentials([usernamePassword(credentialsId: DOCKER_HUB_CREDS, usernameVariable: 'DOCKER_USER_NAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh "echo \$DOCKER_PASSWORD | docker login ${DOCKER_REGISTRY} -u \$DOCKER_USER_NAME --password-stdin"
                    
                    // Push server tags
                    sh "docker push ${SERVER_IMAGE}:latest"
                    sh "docker push ${SERVER_IMAGE}:${BUILD_NUMBER}"
                    
                    // Push client tags
                    sh "docker push ${CLIENT_IMAGE}:latest"
                    sh "docker push ${CLIENT_IMAGE}:${BUILD_NUMBER}"
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying application container orchestration...'
                // Example deployment using Docker Compose:
                // sh 'docker compose down && docker compose up -d'
                echo 'Pipeline completed successfully. Ready for deployment!'
            }
        }
    }

    post {
        always {
            echo 'Performing workspace cleanup...'
            // Clean up unused dangling images locally to preserve disk space
            sh 'docker image prune -f || true'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed. Please check build logs.'
        }
    }
}
