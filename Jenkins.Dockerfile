FROM jenkins/jenkins:2.452.2-lts

USER root

# Install dependencies: Docker, Node.js (for Newman), Unzip, Wget
RUN apt-get update && \
    apt-get install -y docker.io curl unzip nodejs npm && \
    rm -rf /var/lib/apt/lists/*

# Install SonarScanner CLI
RUN curl -sSLo /tmp/sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip && \
    unzip /tmp/sonar-scanner.zip -d /opt/ && \
    ln -s /opt/sonar-scanner-5.0.1.3006-linux/bin/sonar-scanner /usr/local/bin/sonar-scanner && \
    rm /tmp/sonar-scanner.zip

USER jenkins
