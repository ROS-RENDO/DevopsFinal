# 🎓 FESE311 & FESE308 Joint Final Project: Presentation Guide

This document maps every grading requirement to the exact **Code** in our repository and the **Command** needed to demonstrate it live during the presentation.

---

## 🛡️ Track A: Build It Secure (Software Security)

### A1. Project Scope & Threat Model [VISAL]
* **What it is:** Showing we thought about what could go wrong before coding.
* **Code / Artifact:** The `threats/` directory containing our OWASP Threat Dragon files.
* **Command / Demo:** 
  1. Open the Threat Dragon diagrams.
  2. Show the Data-Flow Diagram (DFD).
  3. Point out the STRIDE threat list (Spoofing, Tampering, etc.) and how they map to OWASP Top 10.

### A2. Secure Authentication & Session Management [RENDO]
* **What it is:** Safe login, session handling, and brute-force protection.
* **Code / Artifact:** 
  * `backend/src/controllers/auth.controller.js` (bcrypt hashing and JWT generation).
  * `backend/src/routes/auth.routes.js` (`express-rate-limit` configuration).
* **Command / Demo:** 
  1. **DB Check:** Open Prisma Studio (`npx prisma studio`) to show hashed passwords (no plain text).
  2. **Auth Block:** Try to access a protected route without a token to trigger a `403 Forbidden` response.
  3. **Brute Force:** Spam the login endpoint in Postman/Swagger to trigger the "Too many requests" rate-limit error.

### A3. Input Validation & Injection Defense [SIHAC]
* **What it is:** Never trusting user input; keeping data out of the command channel.
* **Code / Artifact:** 
  * `backend/src/validators/` (Zod schemas for strict typing and length checks).
  * Prisma ORM handles parameterized queries automatically.
* **Command / Demo:** 
  1. **Validation Block:** Send a request with a missing or malformed email to show Zod rejecting it before it hits the database.
  2. **SQLi Defense:** Explain that because we use `Prisma`, it automatically parameterizes variables, making `' OR 1=1 --` impossible to execute.

### A4. Secrets Management & Cryptography [Assignee]
* **What it is:** No secrets in source code.
* **Code / Artifact:** 
  * `.gitignore` (contains `.env`).
  * `backend/server.js` (loads `process.env`).
* **Command / Demo:** 
  1. Run `cat .gitignore` (or show it in the editor) to prove `.env` is never pushed to GitHub.
  2. Show where `process.env.JWT_SECRET` is used at runtime.

### A5. Dependency & Supply-Chain Scanning (SCA) [Assignee]
* **What it is:** Checking third-party libraries for known vulnerabilities.
* **Code / Artifact:** `backend/package.json` and `backend/package-lock.json`.
* **Command / Demo:** 
  1. Run `npm audit` in the `backend/` folder.
  2. Show the terminal output listing any vulnerabilities (or 0 vulnerabilities) and explain how we use `npm audit fix` to triage them.

### A6. Security Testing: SAST + DAST [Assignee]
* **What it is:** Static (code) and Dynamic (running app) vulnerability scanning.
* **Code / Artifact:** 
  * SAST: `sonar-project.properties`.
  * DAST: `Jenkinsfile` (OWASP ZAP step).
* **Command / Demo:** 
  1. **SAST:** Run `sonar-scanner` and open the SonarQube dashboard URL to show the Quality Gate.
  2. **DAST:** Ensure the backend is running (`npm run dev`), then open a new terminal and run:
     `docker run -v ${PWD}:/zap/wrk/:rw -t zaproxy/zap-stable zap-baseline.py -t http://host.docker.internal:5000 -r zap_report.html`
  3. Open `zap_report.html` in the browser to show the scan results.

### A7. Logging, Monitoring & Error Handling [Assignee]
* **What it is:** Tracking security events safely without crashing.
* **Code / Artifact:** `backend/src/utils/logger.js` (Winston configuration).
* **Command / Demo:** 
  1. Trigger an error (like a failed login).
  2. Open the server terminal or `backend/logs/` to show the structured timestamped log that explicitly does *not* contain the user's plain-text password.

---

## 🚀 Track B: Deliver It Securely (DevOps)

### B1. DevOps Principles & Culture [Assignee]
* **What it is:** Planning, version control, and collaboration.
* **Code / Artifact:** GitHub Repository & Jira/Trello Board.
* **Command / Demo:** 
  1. Open GitHub to show branches, pull requests, and commit history.
  2. Show the Jira/Trello board used to track tasks.

### B2. Technical Implementation

* **B2.1 Infrastructure (IaC):** 
  * **Code:** `docker-compose.yml`.
  * **Demo:** Run `docker-compose up -d` to spin up infrastructure instantly.
* **B2.2 CI Pipeline & Auto Testing:**
  * **Code:** `Jenkinsfile` and `tests/postman_collection.json`.
  * **Demo:** 
    1. Start Jenkins locally: `docker run -d --name jenkins -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts`
    2. Show the Jenkins dashboard with a green (passed) pipeline run that automatically ran Postman/Newman tests.
* **B2.3 Deployment Strategy:**
  * **Code:** `k8s/` (Blue-Green Deployment manifests).
  * **Demo:** Show how traffic can be shifted from Blue to Green safely.
* **B2.4 Containerization:**
  * **Code:** `backend/Dockerfile` and `frontend/Dockerfile`.
  * **Demo:** Explain the multi-stage build or the base image used.
* **B2.5 Orchestration & B2.6 Scaling:**
  * **Code:** `k8s/deployment.yaml`.
  * **Demo:** Run `kubectl get pods` to show replicas. Run `kubectl scale deployment backend --replicas=3` to show live scaling.
* **B2.7 High Availability (HA):**
  * **Code:** Nginx configuration.
  * **Demo:** Delete a pod manually (`kubectl delete pod <name>`) and refresh the browser to show the app is still up because the load balancer shifted traffic.
* **B2.8 Backup & Disaster Recovery:**
  * **Code:** `scripts/backup.sh`.
  * **Demo:** Run `./scripts/backup.sh` to generate a database dump.
* **B2.9 Logging & Monitoring:**
  * **Code:** `monitoring/` folder.
  * **Demo:** Open the Grafana dashboard to show centralized Loki logs.

### B3. Practical Execution [Assignee]
* **What it is:** A full, live end-to-end run.
* **Command / Demo:** 
  1. Make a small visual code change.
  2. `git commit` and `git push`.
  3. Watch Jenkins pick it up, run SonarQube, run ZAP, build the Docker image, and push to Docker Hub.

### B5. Bonus Items (GitOps & Metrics) [Assignee]
* **What it is:** Going above and beyond standard pipelines.
* **Code / Artifact:** `argocd/` and `monitoring/` (Prometheus).
* **Command / Demo:** 
  1. **GitOps:** Change the image tag in GitHub; show ArgoCD automatically detecting the change and updating the Kubernetes cluster without human intervention.
  2. **Metrics:** Show live CPU/RAM usage in Grafana.

---

## 🛠️ Appendix: Local Jenkins Setup Guide
If you are presenting the CI Pipeline locally on your machine, follow these steps before the presentation starts to get Jenkins running and connected to Docker Hub:

### 1. Build and Spin up Custom Jenkins
To run the *real* CI pipeline, Jenkins needs Docker, Node.js, and SonarScanner installed. We created a custom `Jenkins.Dockerfile` for this!
Run these commands in your terminal:
1. `docker rm -f jenkins` (to delete the old mock one, if any)
2. `docker build -f Jenkins.Dockerfile -t devops-jenkins-custom .`
3. `docker run -d --name jenkins -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home -v //var/run/docker.sock:/var/run/docker.sock devops-jenkins-custom`

### 2. Unlock Jenkins
Run `docker logs jenkins` in the terminal. Look for the password block and copy the long string (e.g. `97f8ec467f464b9587704671fea4d92f`).
Go to **http://localhost:8080**, paste the password, and click **Install suggested plugins**. Create your admin account.

### 3. Add Docker Hub Credentials
So Jenkins can push images without leaking your password, you must store your secret token in the Jenkins Vault:
1. Go to **Manage Jenkins** -> **Credentials**.
2. Click **System** -> **Global credentials (unrestricted)** -> **+ Add Credentials**.
3. Set **Kind:** `Username with password`.
4. **Username:** Your Docker Hub username (e.g. `rosrendo`).
5. **Password:** Your secret Docker Hub Access Token (`dckr_pat_...`).
6. **ID:** `dockerhub-credentials-id` *(⚠️ You must type this exactly! It maps to line 7 in the Jenkinsfile).*
7. Click **Create**.

### 4. Run the Pipeline
1. Click **New Item** -> Name it `DevOps-Final` -> select **Pipeline**.
2. Scroll down to the Pipeline script box.
3. Paste the entire contents of your `Jenkinsfile` into the box.
4. Click **Save** and **Build Now** to get a green pipeline!

---

## 🛠️ Appendix: Running the "Other" Tools Locally
If you want to demo the rest of the DevSecOps stack live on your laptop, here is exactly how to start each one:

### 1. SonarQube (For SAST Code Scanning)
Since your `Jenkinsfile` and `sonar-project.properties` are now pointed at `localhost:9000`, you need a local SonarQube server running:
1. Open a terminal and run:
   `docker run -d --name sonarqube -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true -p 9000:9000 sonarqube:lts`
2. Go to `http://localhost:9000` (Login: `admin` / `admin`).
3. You will be forced to change your password. 
4. Go to **My Account** -> **Security** -> Generate a Token.
5. In your `Jenkinsfile` (or `sonar-project.properties`), paste this new token!

### 2. Prometheus, Loki, and Grafana (Monitoring & Logging)
We built a separate `docker-compose.yml` specifically for your monitoring stack!
1. Open a terminal and navigate to your monitoring folder:
   `cd monitoring`
2. Spin up the entire monitoring stack:
   `docker-compose up -d`
3. Go to **http://localhost:3000** to see Grafana. (Default login is usually `admin`/`admin`). From there, you can view your Prometheus Metrics and Loki logs!

### 3. Kubernetes & ArgoCD (GitOps & Orchestration)
To show off your `k8s/` and `argocd/` folders, you need a local Kubernetes cluster.
1. Enable Kubernetes in **Docker Desktop settings** (or install `minikube`).
2. Apply your app deployments:
   `kubectl apply -f k8s/`
3. Check that your pods are running:
   `kubectl get pods`
4. If you want to show ArgoCD, you can install it into your local cluster with this one command:
   `kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml`
