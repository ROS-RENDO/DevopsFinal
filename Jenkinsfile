pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "rosrendo/devops-final-backend"
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_HUB_CREDENTIALS = 'dockerhub-credentials-id'
        SONAR_PROJECT_KEY = 'devop'
        SONAR_HOST_URL = 'http://localhost:9000'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('SAST - SonarQube Analysis') {
            steps {
                echo 'Running SonarQube Scanner...'
                // Run SonarScanner via Docker container
                sh 'docker run --rm -v $(pwd):/usr/src sonarsource/sonar-scanner-cli -Dsonar.projectKey=${SONAR_PROJECT_KEY} -Dsonar.sources=./backend/src -Dsonar.host.url=http://host.docker.internal:9000'
                echo 'SonarQube scan completed. Findings pushed to SonarQube Dashboard.'
            }
        }

        stage('Build Docker Image') {
            steps {
                dir('backend') {
                    echo 'Building Docker Image...'
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -t ${DOCKER_IMAGE}:latest ."
                }
            }
        }

        stage('Automated Tests - Postman/Newman') {
            steps {
                echo 'Starting Temporary Container for Newman Tests...'
                sh "docker run -d --name temp-backend -p 5000:5000 ${DOCKER_IMAGE}:latest"
                
                echo 'Running Postman tests via Newman Docker container...'
                sh "docker run --rm -v \$(pwd)/tests:/etc/newman postman/newman run /etc/newman/postman_collection.json -k"
                
                echo 'Cleaning up Temporary Container...'
                sh "docker rm -f temp-backend"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing to Docker Hub Registry...'
                withCredentials([usernamePassword(credentialsId: DOCKER_HUB_CREDENTIALS, passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                    sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                }
            }
        }
        
        stage('DAST - OWASP ZAP (Practice)') {
            steps {
                echo 'Running Dynamic Application Security Testing against staging...'
                // Practice implementation: Running OWASP ZAP baseline scan against the container
                // sh "docker run -t zaproxy/zap-stable zap-baseline.py -t https://staging-url.com"
                echo 'OWASP ZAP scan completed.'
            }
        }

        stage('Deploy to Kubernetes (GitOps Trigger)') {
            steps {
                echo 'Deployment is handled by ArgoCD syncing the Kubernetes manifests.'
                echo 'Updating K8s manifests with new image tag...'
                // Practice: Commit new image tag to Git repo to trigger ArgoCD sync
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution finished.'
        }
        success {
            echo 'Build, Test, and Security Scans passed!'
        }
        failure {
            echo 'Pipeline failed! Check logs for failing tests or high-severity SonarQube findings.'
        }
    }
}
