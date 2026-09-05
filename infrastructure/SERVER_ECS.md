# Configuración del Servidor (Alibaba Cloud ECS)
# Server Infrastructure & Process Management Manual

Este documento detalla la configuración técnica del servidor virtual que aloja el backend y frontend de **QuantVibe**, sus credenciales de red, configuración de puertos y comandos de administración.

---

## 1. Ficha Técnica de la Instancia ECS

| Parámetro | Valor Configurado |
| :--- | :--- |
| **Proveedor** | Alibaba Cloud |
| **Servicio** | Elastic Compute Service (ECS) |
| **Instance ID** | `i-0xi6jmmcv6sia7vgbvkr` |
| **Instance Name** | `iZ0xi6jmmcv6sia7vgbvkrZ` |
| **Región** | US (Virginia) `us-east-1` / Zona `us-east-1a` |
| **IP Pública (EIP)** | `47.85.111.6` |
| **IP Privada (VPC)** | `172.24.233.233` |
| **Sistema Operativo** | Ubuntu 22.04.5 LTS (Linux kernel 5.15 x86_64) |
| **Recursos de Cómputo**| 2 vCPUs, 4.0 GiB RAM |
| **Disco del Sistema** | 98.05 GiB SSD (ESSD Auto) |
| **Modalidad de Pago** | Free Trial (Savings Plan de USD 90.00) |
| **Fecha de Inicio** | 05 de Septiembre de 2026 |
| **Fecha de Vencimiento** | 05 de Diciembre de 2026 (90 días) |

---

## 2. Red y Grupo de Seguridad (Security Group)

El grupo de seguridad asignado a la instancia es **`sg-0xi6jmmcv6sia7v8kkrd`**.

### Reglas de Entrada (Inbound Rules) Habilitadas

| Prioridad | Protocolo | Puerto(s) | Origen (CIDR) | Propósito |
| :---: | :---: | :---: | :---: | :--- |
| **1** | Custom TCP | **`80/80`** | `0.0.0.0/0` | Servidor Web HTTP (Uvicorn / FastAPI). Permite que Cloudflare entregue el tráfico al puerto 80. |
| **1** | Custom TCP | **`8000/8000`** | `0.0.0.0/0` | Puerto alternativo de la API FastAPI y GitHub Codespaces. |
| **100** | Custom TCP | **`22/22`** | `0.0.0.0/0` | Acceso remoto SSH y consola remota. |
| **100** | All ICMP | `-1/-1` | `0.0.0.0/0` | Diagnóstico de conectividad de red (Ping). |
| **100** | Custom TCP | `3389/3389` | `0.0.0.0/0` | Escritorio remoto (RDP). |

---

## 3. Acceso y Conexión al Servidor

### Método A: Vía Alibaba Cloud Workbench (Recomendado)
1. Entrar a [Alibaba Cloud ECS Console](https://ecs.console.aliyun.com).
2. Seleccionar la región **US (Virginia)**.
3. En la lista de **Instances**, hacer clic en el botón **`Connect`** junto al servidor.
4. Seleccionar la opción **Workbench** con modo **Password-Free** (usuario: `root`).
5. Clic en **Log In** (se abre la terminal directamente en el navegador sin requerir llaves ni contraseñas).

### Método B: Vía SSH desde Terminal Local
```bash
ssh root@47.85.111.6
```

---

## 4. Entorno de Ejecución en el Servidor

* **Ruta de instalación:** `/root/QuantVibe`
* **Entorno virtual:** `/root/QuantVibe/venv`
* **Versión de Python:** Python 3.10.12
* **Dependencias instaladas:** `pip install -r requirements-web.txt` (FastAPI, Uvicorn, Pydantic, Requests, etc.)

---

## 5. Comandos de Administración Operativa

Todos estos comandos se ejecutan dentro del servidor como usuario `root`:

### A. Verificar si QuantVibe está en ejecución
```bash
ps aux | grep start_web.py
```
*(Debe mostrar el proceso de python corriendo con `--port 80`).*

### B. Monitorear logs y peticiones en tiempo real
```bash
cd /root/QuantVibe
tail -f web.log
```
*(Presionar `Ctrl + C` para salir de la vista de logs).*

### C. Detener el servicio web
```bash
pkill -f "python scripts/start_web.py"
```

### D. Iniciar el servicio web en segundo plano
```bash
cd /root/QuantVibe
source venv/bin/activate
nohup python scripts/start_web.py --port 80 > web.log 2>&1 &
```

### E. Actualizar con nuevos cambios de GitHub y reiniciar
```bash
cd /root/QuantVibe
git pull origin main
pkill -f "python scripts/start_web.py"
source venv/bin/activate
nohup python scripts/start_web.py --port 80 > web.log 2>&1 &
```
