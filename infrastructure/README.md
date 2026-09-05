# Registro Maestro de Infraestructura y Configuración
# Infrastructure & Cloud Architecture Master Record

Este directorio contiene la documentación técnica exhaustiva de la infraestructura activa de **QuantVibe**: servidor en la nube, configuración de red, registro de dominio, proxy SSL en Cloudflare, desglose financiero de costos y plan de migración para futuras sesiones.

---

## 🗺️ Mapa de Arquitectura y Flujo de Tráfico

```
[ Usuario / Dispositivo / Celular en Cualquier Parte del Mundo ]
                          │
                          │  HTTPS (Puerto 443) con Candado SSL Válido
                          ▼
             ┌────────────────────────┐
             │    CLOUDFLARE CDN      │
             │   (Reverse Proxy)      │
             │                        │
             │ • DNS Anycast Global   │
             │ • Universal SSL Activo │
             │ • Modo SSL: Flexible   │
             │ • Protección DDoS      │
             └───────────┬────────────┘
                         │
                         │  HTTP (Puerto 80 plano hacia el origen)
                         ▼
             ┌────────────────────────┐
             │   ALIBABA CLOUD ECS    │
             │  (Ubuntu 22.04.5 LTS)  │
             │                        │
             │ • IP: 47.85.111.6:80   │
             │ • Python 3.10 Venv     │
             │ • FastAPI + React SPA  │
             │ • Free Trial 90 Días   │
             └────────────────────────┘
```

---

## 📑 Índice de Documentación de Infraestructura

| Documento | Contenido Principal |
| :--- | :--- |
| [**`SERVER_ECS.md`**](SERVER_ECS.md) | Ficha técnica del servidor Alibaba Cloud ECS, firewall, entorno virtual Python, comandos de inicio/reinicio y monitoreo de logs. |
| [**`DOMAIN_DNS_CLOUDFLARE.md`**](DOMAIN_DNS_CLOUDFLARE.md) | Registro del dominio `quantvibeapp.com`, servidores de nombres (nameservers), registros DNS y configuración del modo SSL Flexible. |
| [**`COSTS_AND_EXPIRATIONS.md`**](COSTS_AND_EXPIRATIONS.md) | Desglose financiero, matemática del crédito de $90 USD, fechas de vencimiento, alertas y guía para apagar o destruir el servidor para evitar cobros. |
| [**`CI_CD_DEPLOYMENT.md`**](CI_CD_DEPLOYMENT.md) | Despliegue continuo automatizado con GitHub Actions: cada `git push` actualiza la web en 15 segundos sin tocar el servidor. |
| [**`MIGRATION_GUIDE.md`**](MIGRATION_GUIDE.md) | Procedimiento paso a paso para migrar el sistema a cualquier otro proveedor (AWS, DigitalOcean, Hetzner, etc.) sin caídas ni pérdida de SSL. |

---

## ⚡ Ficha de Resumen Rápido (Cheat Sheet)

* **URL Oficial de Producción:** [https://quantvibeapp.com](https://quantvibeapp.com)
* **IP Pública Directa del Servidor:** `47.85.111.6`
* **Proveedor de VPS:** Alibaba Cloud ECS (Región `us-east-1`, Virginia, EE. UU.)
* **Proveedor de Dominio:** Alibaba Cloud Domains (vigente hasta 04-Sep-2027)
* **Gestor de DNS y Certificado SSL:** Cloudflare (Plan Free $0/mes)
* **Nameservers Activos:**
  * `rachel.ns.cloudflare.com`
  * `roan.ns.cloudflare.com`
* **Ruta del Proyecto en el Servidor:** `/root/QuantVibe`
* **Entorno Virtual Python:** `/root/QuantVibe/venv`
* **Comando de Ejecución Activo:**
  ```bash
  nohup python scripts/start_web.py --port 80 > web.log 2>&1 &
  ```
* **Fecha Límite del Servidor Gratuito:** **05 de Diciembre de 2026**
