pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "kamran7777777/frontend-image-test"
        SONARQUBE_TOKEN = credentials('sonarqube-token') // Update with your SonarQube token
        SONAR_HOST_URL = 'http://localhost:9000' // Replace with your SonarQube host URL
        SCANNER_CLI_VERSION = '4.8.0.2856' // Change version as needed
        JAVA_HOME = '/usr/lib/jvm/java-1.17.0-openjdk-amd64' // Update this path to your Java 17 installation
        SNYK_TOKEN = credentials('21db75b6-b23c-4b44-9e8e-02685993df22') // Update with your Snyk token
        DEPENDENCY_CHECK_HOME = "${env.WORKSPACE}/Downloads/dependency-check"
        SONAR_NODEJS_EXECUTABLE = '/usr/bin/node' // Path to Node.js executable
    }

    stages {
        stage('Check Node.js Version') {
            steps {
                sh 'node -v' // checking node version
                sh 'npm -v' 
            }
        }

        stage('Checkout') {
            steps {
                git 'https://github.com/kamraniswinner/yeni-proje-frontend.git'
            }
        }

        stage('Check Project Directory') {
            steps {
                script {
                    def packageJson = "${env.WORKSPACE}/package.json"
                    if (fileExists(packageJson)) {
                        echo "package.json found at ${packageJson}."
                    } else {
                        error "package.json not found at ${packageJson}."
                    }
                }
            }
        }

        stage('Update Dependencies'){
            steps {
                script {
                    sh '''
                        echo "Checking for outdated dependencies..."
                        npm outdated || echo "Error occurred during npm outdated"
                        echo "Updating dependencies..."
                        npm update --silent || echo "Error occurred during npm update"
                        echo "Reinstalling updated dependencies..."
                        npm install || echo "Error occurred installing npm update"
                    '''
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
                            echo "Logging versions and environment details:"
                            
                            # Log Java version
                            echo "Java version:"
                            java -version
                            
                            # Log SonarQube Scanner version
                            echo "SonarQube Scanner version:"
                            /opt/sonar-scanner/bin/sonar-scanner -v

                            # Print PATH variable for debugging
                            echo "Current PATH:"
                            echo $PATH
                            
                            # Run SonarQube Scanner
                            echo "Running SonarQube Scanner:"
                            /opt/sonar-scanner/bin/sonar-scanner \
                                -Dsonar.projectKey=yeni-proje-frontend-test-branch \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=${SONAR_HOST_URL} \
                                -Dsonar.login=${SONARQUBE_TOKEN} \
                                -Dsonar.javascript.node.maxWaitTime=600 \
                                -Dsonar.nodejs.executable=${SONAR_NODEJS_EXECUTABLE}   // Added Node.js executable path
                                -X  # Enable debug logging for SonarQube Scanner
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
                            snyk test --all-projects --json | tee snyk-report.json
                            cat snyk-report.json
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
                                sudo dpkg -i trivy_0.34.1_Linux-64bit.deb
                            else
                                echo "Trivy is already installed."
                            fi
                            trivy image --severity HIGH,CRITICAL ${DOCKER_IMAGE}:latest
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
                                echo "Dependency-Check not found. Installing..."
                                wget https://github.com/jeremylong/DependencyCheck/releases/download/v7.1.1/dependency-check-7.1.1-release.zip
                                unzip dependency-check-7.1.1-release.zip -d ${DEPENDENCY_CHECK_HOME}
                            else
                                echo "Dependency-Check is already installed."
                            fi
                            export PATH=$PATH:${DEPENDENCY_CHECK_HOME}/bin
                            dependency-check.sh --project frontend-image-test --out . --scan . --disableYarnAudit
                        '''
                    }
                }
            }
        }

        stage('OWASP ZAP Scan') {
            steps {
                script {
                    catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                        // Run OWASP ZAP scan
                        sh '''
                            zap-baseline.py -t http://user.k8s.dearsoft.tech/ -r zap_report.html
                        '''
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
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
