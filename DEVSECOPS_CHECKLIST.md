# DevSecOps Checklist

## Software Security

| # | Category | Tool / Approach | Status |
|---|----------|----------------|--------|
| 1 | Threat Modeling | OWASP Threat Dragon | ✅ Done |
| 2 | Password Hashing | bcrypt | ✅ Done |
| 3 | Session Tokens | JWT + short expiry (15min access / 7d refresh) | ✅ Done |
| 4 | Input Validation | Zod | ✅ Done |
| 5 | SQL Injection Defense | ORM (Prisma) | ✅ Done |
| 6 | XSS / Output Encoding | React (auto-escapes JSX by default) | ✅ Done |
| 7 | Secrets Handling | dotenv + .gitignore | ✅ Done |
| 8 | TLS / HTTPS | Reverse proxy (Nginx) | ✅ Done |
| 9 | Dependency Scan (SCA) | npm audit | ✅ Done |
| 10 | SAST (Code Scan) | SonarQube (Week-12 lab) | ✅ Done |
| 11 | DAST (Running-App Scan) | OWASP ZAP | ❌ Not Implemented |
| 12 | Logging / Detection | Winston | ❌ Not Implemented |

## DevOps

| # | Category | Tool / Approach | Status |
|---|----------|----------------|--------|
| 1 | Plan | Jira | ✅ Done |
| 2 | Source Control | GitHub | ✅ Done |
| 3 | CI - Build & Test | GitHub Actions | ❌ Not Implemented |
| 4 | Automated Tests | Postman / Newman | ❌ Not Implemented |
| 5 | Containerize | Docker (Dockerfile) | ✅ Done |
| 6 | Image Registry | Docker Hub | ✅ Done |
| 7 | IaC / Provision | Docker Compose | ✅ Done |
| 8 | Orchestrate / Run | Kubernetes (minikube / k3s / kind / managed) | ❌ Not Implemented |
| 9 | Deploy Strategy | Blue-Green | ❌ Not Implemented |
| 10 | Load Balancer / HA | Nginx | ✅ Done |
| 11 | Backup & DR | DB Dump | ❌ Not Implemented |
| 12 | Logging | Loki + Grafana | ❌ Not Implemented |

## Progress Summary

| Area | Done | Remaining | Total |
|------|------|-----------|-------|
| Software Security | 9 | 3 | 12 |
| DevOps | 6 | 6 | 12 |
| **Overall** | **15** | **9** | **24** |

## Remaining Items

### Software Security

- [ ] **DAST** — OWASP ZAP scan on running application
- [ ] **Logging / Detection** — Winston structured logging (plan approved)

### DevOps
- [ ] **CI - Build & Test** — GitHub Actions pipeline
- [ ] **Automated Tests** — Postman / Newman test collections
- [ ] **Orchestrate / Run** — Kubernetes deployment (minikube / k3s / kind)
- [ ] **Deploy Strategy** — Blue-Green deployment
- [ ] **Backup & DR** — Database dump scripts
- [ ] **Logging** — Loki + Grafana stack
