# 🚀 Cloud VPS & Production Deployment Guide

This guide provides institutional instructions for deploying **QuantVibe** on any cloud VPS provider (Alibaba Cloud, AWS, GCP, DigitalOcean, Hetzner, Linode) running Ubuntu 22.04 / 24.04 LTS or Debian 12.

---

## 📌 1. Hardware & System Prerequisites

| Parameter | Recommended Specification |
| :--- | :--- |
| **Compute** | 2+ vCPUs, 4.0+ GiB RAM |
| **Storage** | 20+ GB SSD (NVMe preferred) |
| **Operating System** | Ubuntu 22.04 LTS / 24.04 LTS (x86_64 or arm64) |
| **Network** | Dedicated IPv4, Ingress Ports `80` (HTTP) and `443` (HTTPS) |
| **Runtime** | Python 3.10+ and/or Docker Engine 24+ |

---

## 🛡️ 2. Security & Firewall Hardening

Configure your Cloud Provider Security Group and host firewall (`ufw`) before exposing services to the public internet:

```bash
# 1. Update package registry
sudo apt update && sudo apt upgrade -y

# 2. Configure UFW Firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH Access'
sudo ufw allow 80/tcp comment 'HTTP Ingress'
sudo ufw allow 443/tcp comment 'HTTPS TLS 1.3 Ingress'

# 3. Enable firewall
sudo ufw enable
```

> [!IMPORTANT]
> Keep port `8000` (FastAPI direct) internal behind localhost or a reverse proxy. Never expose raw database or internal IPC ports directly to `0.0.0.0/0`.

---

## 🔑 3. Standard Git Deployment

### A. Clone and Environment Setup
```bash
# Clone the repository
git clone https://github.com/Ax3lsk3r3/QuantVibe.git
cd QuantVibe

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install web and quant dependencies
pip install --upgrade pip
pip install -r requirements-web.txt
```

### B. Generate Initial Signals & Run Verification
```bash
# Run demonstration pipeline to generate signed payloads and ledger
python scripts/run_pipeline.py --force-demo

# Verify signal integrity and SHA-256 signatures
python bridge/signal_store.py
```

### C. Run Web Terminal Service
```bash
# Start Web Server on port 80 (or 8000 behind reverse proxy)
nohup python scripts/start_web.py --port 80 > web.log 2>&1 &
```

---

## 🐳 4. Containerized Deployment (Docker & Docker Compose)

QuantVibe includes pre-configured Docker manifests for isolated, reproducible deployments:

```bash
# Build and launch all services in detached mode
docker compose up -d

# Verify running containers
docker compose ps

# Inspect real-time service logs
docker compose logs -f
```

---

## 🔄 5. Automated CI/CD Deployment via GitHub Actions

QuantVibe includes an automated continuous deployment workflow (`.github/workflows/deploy.yml`).

To enable zero-downtime continuous deployment on your own server, configure the following **Encrypted Secrets** in your GitHub repository (`Settings -> Secrets and variables -> Actions`):

| Secret Name | Description | Example |
| :--- | :--- | :--- |
| `SERVER_HOST` | Public IP address or domain of your VPS | `203.0.113.10` or `vps.example.com` |
| `SERVER_USER` | SSH user with deploy privileges | `deploy` or `ubuntu` or `root` |
| `SERVER_SSH_KEY` | Private Ed25519 or RSA OpenSSH key | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

Whenever commits are pushed to `main`, GitHub Actions will run automated QA, security audits, build the frontend SPA bundle, and perform an atomic rolling swap on your server.

---

## 🌐 6. Production Domain & Reverse Proxy (SSL / HTTPS)

### Recommended Setup: Reverse Proxy with Caddy
Caddy automatically provisions and renews Let's Encrypt TLS 1.3 certificates:

```caddyfile
# /etc/caddy/Caddyfile
yourdomain.com {
    encode gzip zstd
    reverse_proxy 127.0.0.1:8000
}
```

Restart Caddy to activate HTTPS:
```bash
sudo systemctl restart caddy
```

---

## 🩺 7. Healthcheck & Telemetry Probes

QuantVibe provides an automated health probe script (`scripts/sentinel.py`) to verify system status, endpoint response latencies, and signal integrity:

```bash
python scripts/sentinel.py
```

Expected output:
```
[*] Probing Production Telemetry...
[PASS] [200] Frontend Landing & App Nominal
[PASS] [200] System Status & Pipeline Info (v1.0.1)
[PASS] [200] Verified Alpha Signals (SHA-256)
[PASS] [200] Execution Orders Plan
[PASS] [200] Track Record Ledger
[PASS] [200] Bloomberg RSS News Stream
[+] All production services are healthy and nominal.
```
