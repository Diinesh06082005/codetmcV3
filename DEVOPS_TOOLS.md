# DevOps Tools Used in This Project

This document provides an overview of the DevOps tools used in this project, including their purpose, usage, verification steps, and common commands.

---

## 1. Docker

**Why Used:**
- Containerizes applications for consistent environments across development, testing, and production.
- Simplifies deployment and scaling.

**How Used:**
- `Dockerfile` and `docker-compose.yml` are used to define and build images for the server and client.
- `Dockerfile.jenkins` and `docker-compose.jenkins.yml` are used for Jenkins CI/CD integration.

**How to Verify:**
- Check running containers: `docker ps`
- Check images: `docker images`
- Test application endpoints in the browser or via curl/postman.

**Common Commands:**
- Build image: `docker build -t <image-name> .`
- Run container: `docker run -p <host-port>:<container-port> <image-name>`
- Compose up: `docker-compose up -d`
- Compose down: `docker-compose down`
- View logs: `docker logs <container-id>`

---

## 2. Jenkins

**Why Used:**
- Automates CI/CD pipelines for building, testing, and deploying code.

**How Used:**
- `Jenkinsfile` defines the pipeline steps.
- `Dockerfile.jenkins` and `docker-compose.jenkins.yml` set up Jenkins in a containerized environment.

**How to Verify:**
- Access Jenkins UI (default: http://localhost:8080)
- Check build status and logs in Jenkins dashboard.

**Common Commands:**
- Start Jenkins: `docker-compose -f docker-compose.jenkins.yml up -d`
- Stop Jenkins: `docker-compose -f docker-compose.jenkins.yml down`

---

## 3. GitHub Actions

**Why Used:**
- Provides cloud-based CI/CD workflows for code integration and deployment.

**How Used:**
- Workflow YAML files (not shown in structure, but referenced in `github_actions_setup.md`) define build/test/deploy steps.

**How to Verify:**
- Check Actions tab in GitHub repository for workflow runs and logs.

**Common Commands:**
- Triggered automatically on push/pull request.
- Manual trigger via GitHub UI (if configured).

---

## 4. Nginx

**Why Used:**
- Serves static files and acts as a reverse proxy for the client application.

**How Used:**
- `nginx.conf` in the client directory configures Nginx for serving the frontend.

**How to Verify:**
- Access the client app in the browser (default: http://localhost:80)
- Check Nginx logs inside the container: `docker logs <nginx-container-id>`

**Common Commands:**
- Reload config: `nginx -s reload` (inside container)
- Test config: `nginx -t` (inside container)

---

## 5. Node.js & npm

**Why Used:**
- Backend (server) and frontend (client) are built with Node.js.
- npm manages dependencies and scripts.

**How Used:**
- `package.json` in both server and client directories.
- Scripts for start, build, test, etc.

**How to Verify:**
- Run: `npm run start` or `npm run build`
- Check application output/logs.

**Common Commands:**
- Install dependencies: `npm install`
- Start app: `npm start`
- Build app: `npm run build`
- Run tests: `npm test`

---

## 6. Additional Tools

- **PostCSS, Tailwind CSS, Vite:** Used for frontend build and styling (see client directory for configs).
- **MongoDB:** (Assumed, based on db.js) Used as the database, typically run as a Docker service or local install.

---

## General Verification Steps
- Check service health endpoints (e.g., `/api/health` if available).
- Use `docker-compose ps` to see running services.
- Use browser or API tools (Postman, curl) to test endpoints.

---

## References
- See `devops_reference.md`, `jenkins_setup.md`, and `github_actions_setup.md` for more detailed setup and usage instructions.
