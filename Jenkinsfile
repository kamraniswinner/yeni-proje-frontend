pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "kamran7777777/frontend-image-test"
        SONARQUBE_TOKEN = credentials('056e8765-82cd-40a4-a414-3a52ec80065f') // Update with your SonarQube token
        SONAR_HOST_URL = 'http://localhost:9000' // Replace with your SonarQube host URL
        SCANNER_CLI_VERSION = '4.8.0.2856' // Change version as needed
        JAVA_HOME = '/usr/lib/jvm/java-1.17.0-openjdk-amd64' // Update this path to your Java 17 installation
        SNYK_TOKEN = credentials('21db75b6-b23c-4b44-9e8e-02685993df22') // Update with your Snyk token
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/kamraniswinner/yeni-proje-frontend.git'
            }
        }

        stage('Check Project Directory') {
            steps {
                script {
                    def packageJson = "${workspace}/package.json"
                    if (fileExists(packageJson)) {
                        echo "package.json found at ${packageJson}."
                    } else {
                        error "package.json not found at ${packageJson}."
                    }
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    sh 'pwd' // Print current directory
                    sh 'ls -la' // List all files and permissions
                    sh 'npm config list' // Print npm configuration
                    sh 'npm install --silent'
                    sh 'npm run build'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                        sh '''
                            if ! [ -x "$(command -v sonar-scanner)" ]; then
                                echo "Installing SonarQube Scanner..."
                                wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SCANNER_CLI_VERSION}-linux.zip
                                unzip sonar-scanner-cli-${SCANNER_CLI_VERSION}-linux.zip
                                mv sonar-scanner-${SCANNER_CLI_VERSION}-linux sonar-scanner
                                export PATH=$PATH:$PWD/sonar-scanner/bin
                            else
                                echo "SonarQube Scanner is already installed."
                            fi
                            export PATH=$PATH:$PWD/sonar-scanner/bin
                            sonar-scanner \
                            -Dsonar.projectKey=your_project_key \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.login=${SONARQUBE_TOKEN} || true
                        '''
                    }
                }
            }
        }

        stage('Snyk Vulnerability Scan') {
            steps {
                script {
                    catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                        sh '''
                            if ! [ -x "$(command -v snyk)" ]; then
                                echo "Installing Snyk..."
                                npm install -g snyk
                            else
                                echo "Snyk is already installed."
                            fi
                            snyk auth ${SNYK_TOKEN}
                            snyk test || true
                        '''
                    }
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                script {
                    catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                        sh '''
                            if ! [ -x "$(command -v trivy)" ]; then
                                echo "Installing Trivy..."
                                wget https://github.com/aquasecurity/trivy/releases/download/v0.34.1/trivy_0.34.1_Linux-64bit.deb
                                dpkg -i trivy_0.34.1_Linux-64bit.deb
                            else
                                echo "Trivy is already installed."
                            fi
                            trivy image --severity HIGH,CRITICAL ${DOCKER_IMAGE}:latest || true
                        '''
                    }
                }
            }
        }

        stage('OWASP Dependency-Check') {
            steps {
                script {
                    catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                        sh '''
                            if ! [ -x "$(command -v dependency-check.sh)" ]; then
                                echo "Installing OWASP Dependency-Check..."
                                wget https://github.com/jeremydmiller/aspnetcore-owasp-dependency-check/releases/download/5.0.1/owasp-dependency-check-5.0.1-release.zip
                                unzip owasp-dependency-check-5.0.1-release.zip
                                export PATH=$PATH:$PWD/owasp-dependency-check/bin
                            fi
                            echo "Running OWASP Dependency-Check..."
                            dependency-check.sh --project "frontend-image-test" --out . --scan . || true
                        '''
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image with the environment variable
                    sh "docker build --build-arg REACT_APP_BACKEND_URL=http://api.k8s.dearsoft.tech -t ${DOCKER_IMAGE}:latest ."
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
                        currentBuild.result = 'FAILURE'
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
