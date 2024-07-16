pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "kamran7777777/frontend-image"
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/kamraniswinner/yeni-proje-frontend.git'
                dir('frontend') {
                    // Ensure we're working in the frontend directory
                }
            }
        }

        stage('Check Frontend Directory') {
            steps {
                script {
                    if (fileExists('frontend')) {
                        echo 'Frontend directory exists.'
                        sh 'ls -l frontend'
                        
                        // Check if package.json exists inside frontend
                        if (fileExists('frontend/package.json')) {
                            echo 'package.json exists inside frontend.'
                        } else {
                            error 'package.json does not exist inside frontend.'
                        }
                    } else {
                        error 'Frontend directory does not exist.'
                    }
                }
            }
        }

        stage('Build') {
    steps {
        script {
            dir('frontend') {
                sh 'pwd' // Print current directory
                sh 'ls -la' // List all files and permissions
                sh 'npm config list' // Print npm configuration
                sh 'npm install --silent'
                sh 'npm run build'
            }
        }
    }
}


        stage('Build Docker Image') {
            steps {
                script {
                    dir('frontend') {
                        sh "docker build -t ${DOCKER_IMAGE}:latest ."
                    }
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    try {
                        withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                            sh '''
                                echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
                                docker push ${DOCKER_IMAGE}:latest
                            '''
                        }
                        echo 'Successfully pushed Docker image to Docker Hub'
                    } catch (Exception e) {
                        echo "Failed to push Docker image to Docker Hub: ${e.message}"
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Build, Docker image creation, and push successful!'
        }
        failure {
            echo 'Build failed!'
        }
    }
}
