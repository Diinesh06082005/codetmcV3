# Jenkins CI/CD Pipeline Implementation Guide

This guide details how to configure and run the Jenkins pipeline defined in `Jenkinsfile` for the **codetmc** project.

---

## 🐳 Running Jenkins Locally via Docker

We have configured a containerized Jenkins environment at the root of the project. This contains the Docker CLI and Node.js v20 preloaded, and mounts the host Docker socket.

### 1. Start the Jenkins Container
Run the following command at the root of the project:
```bash
docker compose -f docker-compose.jenkins.yml up -d --build
```

### 2. Retrieve the Initial Admin Password
To unlock Jenkins on your first visit:
```bash
docker logs codetmc-jenkins 2>&1 | grep -A 5 "Jenkins initial setup is required"
```
*(Alternatively, check the password file inside the container: `docker exec codetmc-jenkins cat /var/jenkins_home/secrets/initialAdminPassword`)*

### 3. Access Jenkins
Go to **[http://localhost:8090](http://localhost:8090)** in your browser, paste the admin password, and select **Install suggested plugins**.

---

## 🛠️ Prerequisites (For Host-Installed Jenkins)

If running Jenkins directly on a host machine rather than using our Docker Compose container:
1. **Docker**: The Jenkins service user (`jenkins`) must have permission to execute Docker commands (e.g., `sudo usermod -aG docker jenkins`).
2. **Node.js (v20+) & npm**: Needed for dependency installation and asset building.
3. **Git**: Installed on the host system to clone the repository.

---

## 🔌 Required Jenkins Plugins

Ensure the following plugins are installed and active on your Jenkins server:
* **Pipeline** (Core pipeline capabilities)
* **Git Plugin** (For checkout steps)
* **Credentials Binding Plugin** (Required for the `withCredentials` block to safely log in to Docker Hub)
* **Workspace Cleanup Plugin** (Optional, but recommended for housekeeping)

---

## 🔑 Configure Jenkins Credentials

The pipeline references a credentials block named `docker-hub-credentials` to securely log in and push Docker images to Docker Hub.

### Step-by-Step Credentials Setup:
1. Open Jenkins and click on **Manage Jenkins** -> **Credentials**.
2. Under the **Stores scoped to Jenkins** section, select **(global)** domains.
3. Click **Add Credentials**.
4. Configure the form as follows:
   * **Kind**: `Username with password`
   * **Scope**: `Global`
   * **Username**: Your Docker Hub username
   * **Password**: Your Docker Hub Personal Access Token (PAT)
   * **ID**: `docker-hub-credentials` *(Must match the variable in Jenkinsfile)*
5. Click **Create** to save.

---

## 🏗️ Creating the Pipeline Job

1. From the Jenkins dashboard, click **New Item**.
2. Enter `codetmc-pipeline` as the name, select **Pipeline**, and click **OK**.
3. Under the **Pipeline** configuration section:
   * **Definition**: Select `Pipeline script from SCM`.
   * **SCM**: Select `Git`.
   * **Repository URL**: Paste your repository URL.
   * **Credentials**: Select your git access credentials.
   * **Branch Specifier**: `*/main` (or matching your primary branch).
   * **Script Path**: `Jenkinsfile` *(The location of the Jenkinsfile at the root)*.
4. Click **Save**.

---

## 🚀 Running and Verifying

1. Click **Build Now** on the pipeline dashboard to manually trigger the first build.
2. Under the **Stage View**, you will see the progressive execution of:
   * **Checkout**: Clones the source.
   * **Install Dependencies**: Installs project workspace dependencies using `npm ci`.
   * **Build Frontend Assets**: Runs client build scripts.
   * **Build Docker Images**: Builds backend and client Docker containers using the root directory context.
   * **Push Docker Images**: Pushes built tags (`latest` and the respective build number) to Docker Hub.
3. Check the **Console Output** of the run to troubleshoot if any step fails.
