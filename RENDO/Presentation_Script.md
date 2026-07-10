# Joint Final Presentation Script: Secure Software, Delivered Securely
**Team Size:** 4 Members
**Theme:** "These controls are only as good as the pipeline that enforces them."

---

## 🎤 Speaker 1: Introduction & Security Foundations
*(Focus: Joint Intro, Scope, Threat Model, Auth, Input Validation - A1, A2, A3)*

**Slide 1: Joint Intro**
* "Hello everyone, today we are presenting our project: **Secure Software, Delivered Securely**. Our application is a Node.js REST API using Prisma, SQLite, and a React frontend. Our trust boundary separates untrusted client HTTP requests from our server-controlled API and database."

**Slide 2: Threat Model (A1)**
* "Before writing code, we threat modeled our app using STRIDE. Our biggest threats were Spoofing (unauthorized access) and Injection (tampering with the DB). We mapped these to the OWASP Top 10."

**Slide 3: Defending Authentication & Inputs (A2 & A3)**
* "To defend against Authentication Failures, we never store plaintext passwords. We use `bcrypt` to salt and hash them. We secure our sessions using JWTs inside `httpOnly` cookies, preventing JavaScript access."
* "For Input Validation, we adopted a 'never trust the client' approach. We use `Zod` schemas to strictly validate every request body. To prevent XSS, we rely on React's native auto-escaping templates, and Prisma ORM automatically parameterizes our SQL queries, completely eliminating SQL Injection."

---

## 🎤 Speaker 2: Advanced Security & Shift-Left
*(Focus: Secrets, Scans, and Logging - A4, A5, A6, A7)*

**Slide 4: Secrets Management (A4)**
* "Hardcoding secrets is a critical Cryptographic Failure. Our repository contains absolutely zero secrets. We use `.env` files which are strictly added to `.gitignore`. At runtime, secrets are injected via environment variables, and all data in transit is encrypted using HTTPS."

**Slide 5: Shift-Left Security Scans (A5 & A6)**
* "Writing secure code isn't enough; we have to scan for vulnerabilities. We ran an `npm audit` (SCA) to analyze our dependency tree and documented a non-exploitable vulnerability in our dev-tools."
* *(Show Screenshot)* "Our GitHub Actions pipeline automatically runs SonarQube for SAST (Static Analysis) and OWASP ZAP for DAST (Dynamic Analysis) to ensure no runtime vulnerabilities make it to production."

**Slide 6: Security Logging (A7)**
* "Finally, if we are attacked, we need to know. We use `Winston` for structured logging. If an attacker attempts credential stuffing, our `security.log` captures the bursts of failed logins by IP, without ever exposing passwords. Our global error handler ensures that if the app crashes, the user sees a generic 500 error, keeping stack traces hidden."

---

## 🎤 Speaker 3: The Handoff & CI/CD Pipeline
*(Focus: Handoff, GitHub Actions Pipeline, Postman, Containerization - B1, B2.2, B2.4)*

**Slide 7: The Hand-Off**
* "As Speaker 2 mentioned, our security controls are robust. **But these controls are only as good as the pipeline that enforces them.** I will now walk through how we deliver this secure app using DevOps."

**Slide 8: The CI/CD Pipeline (B1 & B2.2)**
* "We enforce our security and quality through a **GitHub Actions** CI pipeline. Every time code is pushed, our `.github/workflows/ci.yml` runs our SonarQube scans, builds our Docker application, and executes our automated **Postman/Newman** tests."
* "To make this completely isolated and portable, we run our tooling directly inside temporary Docker containers on the GitHub runners, ensuring a clean state for every build!"

**Slide 9: Containerization (B2.4)**
* "Once the Postman tests pass, the pipeline builds our Docker image. We wrote a multi-stage `Dockerfile`. We don't run as root—we run as a restricted `node` user (Least Privilege). The final image is then pushed to **Docker Hub**."

---

## 🎤 Speaker 4: Infrastructure, High Availability & Conclusion
*(Focus: IaC, Kubernetes, Blue-Green, Monitoring - B2.1, B2.5-2.9, B3, B5)*

**Slide 10: Orchestration & Deploy Strategy (B2.1, B2.3 & B2.5)**
* "For deployment orchestration, we use **Kubernetes**. We chose a **Blue-Green** deployment strategy. We have two separate deployments defined in our manifests, and we can switch live traffic instantly by updating our Kubernetes Service selector."

**Slide 11: High Availability & Scaling (B2.6, B2.7)**
* "Our Kubernetes Service acts as an internal load balancer, and we use an Nginx Ingress to expose it to the internet safely. *[LIVE DEMO]* If a pod fails, Kubernetes automatically self-heals and spins up a new one. We can also scale our application to 5 replicas instantly using `kubectl scale`."

**Slide 12: Disaster Recovery & Monitoring Bonus (B2.8 & B5)**
* "For Disaster Recovery, we have a script that creates a DB Dump without corrupting data."
* "For our **Bonus**, we implemented a full observability stack using Docker Compose. We run **Prometheus and Grafana** for metrics, and **Loki with Promtail** to aggregate all our Winston logs into a single, searchable dashboard."
* "We also configured **ArgoCD** to automatically sync our Kubernetes manifests directly from Git!"

**Slide 13: Joint Close & Q&A**
* "To wrap up: We built a secure Node.js API protected by Bcrypt and Zod, and we shipped it through a fully automated GitHub Actions pipeline into a highly available Kubernetes cluster. Secure software, delivered securely. We are now open for Q&A!"
