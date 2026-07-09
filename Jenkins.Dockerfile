FROM jenkins/jenkins:2.452.2-lts

USER root

# Install dependencies: ONLY Docker CLI. We will run Newman and SonarScanner as Docker containers!
RUN apt-get update && \
    apt-get install -y docker.io curl unzip && \
    rm -rf /var/lib/apt/lists/*

USER jenkins
