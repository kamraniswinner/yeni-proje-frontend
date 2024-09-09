pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "kamran7777777/frontend-image-test"
        SONARQUBE_TOKEN = credentials('056e8765-82cd-40a4-a414-3a52ec80065f')
        SNYK_TOKEN = credentials('21db75b6-b23c-4b44-9e8e-02685993df22')
        SONAR_HOST_URL = 'http://localhost:9000' // Replace with your SonarQube host URL
        SCANNER_CLI_VERSION = '4.8.0.2856' // Change version as needed
        JAVA_HOME = '/usr/lib/jvm/java-1.17.0-openjdk-amd64' // Update this path to your Java 17 installation
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

        stage('Install SonarQube Scanner') {
            steps {
                script {
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
                    '''
                    // Ensure sonar-scanner is available in the current shell
                    sh 'export PATH=$PATH:$PWD/sonar-scanner/bin'
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
                    withEnv(["JAVA_HOME=${JAVA_HOME}"]) {
                        withSonarQubeEnv('SonarQube') {
                            sh '''
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
        }

        stage('Snyk Vulnerability Scan') {
            steps {
                script {
                    sh "snyk auth ${SNYK_TOKEN}"
                    sh "snyk test || true" // Continue even if vulnerabilities are found, but log them
                }
            }
        }

        stage('OWASP Dependency-Check') {
            steps {
                script {
                    // Assuming Dependency-Check CLI is installed
                    sh '''
                        dependency-check.sh --project "frontend-image-test" --out . --scan .
                    '''
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                script {
                    // Run Trivy scan on the Docker image
                    sh "trivy image --severity HIGH,CRITICAL ${DOCKER_IMAGE}:latest || true"
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

        stage('OWASP ZAP Scan') {
            steps {
                script {
                    // Run OWASP ZAP scan
                    sh '''
                        zap-baseline.py -t http://user.k8s.dearsoft.tech/ -r zap_report.html || true
                    '''
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
        always {
            archiveArtifacts artifacts: '*.html, *.xml, zap_report.html', allowEmptyArchive: true
        }
        success {
            echo 'Build, Docker image creation, and push successful!'
        }
        failure {
            echo 'Build failed!'
        }
    }
}
