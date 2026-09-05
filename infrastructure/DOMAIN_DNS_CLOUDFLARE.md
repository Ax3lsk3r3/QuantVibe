# Dominio, DNS y Configuración Cloudflare
# Domain, DNS & Cloudflare Edge Architecture

Este documento detalla el registro del dominio oficial `quantvibeapp.com`, la delegación de nombres a Cloudflare y la configuración del certificado SSL/TLS para navegación segura universal.

---

## 1. Ficha del Dominio Oficial

| Parámetro | Valor |
| :--- | :--- |
| **Nombre de Dominio** | `quantvibeapp.com` |
| **Registrador Oficial** | Alibaba Cloud Domains / Dominet (HK) Limited |
| **IANA Registrar ID** | 3775 |
| **Costo de Registro** | $11.99 USD / primer año |
| **Fecha de Registro** | 04 de Septiembre de 2026, 23:46 UTC |
| **Fecha de Vencimiento** | 04 de Septiembre de 2027, 23:46 UTC |
| **Estado en ICANN** | `active` |
| **Renovación Anual** | ~$12.99 USD / año |
| **Panel de Gestión** | Alibaba Cloud Console > Domain Names |

---

## 2. Servidores de Nombres Delegados (Nameservers)

El dominio fue delegado formalmente desde Alibaba Cloud hacia la red Anycast global de Cloudflare:

* **Nameserver 1:** `rachel.ns.cloudflare.com`
* **Nameserver 2:** `roan.ns.cloudflare.com`

*(Verificable con: `nslookup -type=NS quantvibeapp.com`)*

---

## 3. Registros DNS en Cloudflare

En la consola de Cloudflare ([dash.cloudflare.com](https://dash.cloudflare.com)), se configuraron los siguientes registros autoritativos:

| Tipo | Nombre | Contenido / Destino | Proxy Status | TTL | Propósito |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **A** | `@` (`quantvibeapp.com`) | `47.85.111.6` | **Proxied (Nube Naranja)** | Auto | Apunta el dominio raíz al servidor ECS pasando por la protección de Cloudflare. |
| **CNAME** | `www` | `quantvibeapp.com` | **Proxied (Nube Naranja)** | Auto | Permite que las personas que escriban `www.quantvibeapp.com` lleguen al mismo sitio con SSL. |

---

## 4. Configuración de Cifrado SSL/TLS (Modo Flexible)

### ¿Por qué se configuró en modo "Flexible"?
* En modo **Flexible**, la conexión entre los visitantes (navegadores de celulares, computadores, tablets) y Cloudflare está **100% cifrada mediante HTTPS (puerto 443)** con un certificado SSL válido universal.
* La comunicación entre los servidores de Cloudflare y la máquina virtual de Alibaba Cloud viaja por **HTTP estándar (puerto 80)**.
* **Ventaja arquitectónica:** El servidor Ubuntu no necesita configuraciones complejas de Nginx, Certbot o apertura del puerto 443 en el firewall de Alibaba. El certificado SSL se renueva de forma automática y gratuita en la nube de Cloudflare para siempre.

### Ficha del Certificado Edge en Cloudflare:
* **Hostnames cubiertos:** `quantvibeapp.com`, `*.quantvibeapp.com`
* **Tipo:** Universal SSL
* **Estado:** `Active`
* **Cifrado soportado:** TLS 1.2, TLS 1.3, HTTP/2, HTTP/3 (QUIC)
* **Emisor:** Let's Encrypt / Google Trust Services (gestionado por Cloudflare)
* **Costo:** $0.00 USD (incluido en el plan Free de Cloudflare)

---

## 5. Pruebas de Verificación y Diagnóstico

### Probar conectividad HTTPS desde terminal:
```bash
curl -I https://quantvibeapp.com
```
*Respuesta esperada: `HTTP/1.1 200 OK`, `server: cloudflare`.*

### Probar estado de la API:
```bash
curl https://quantvibeapp.com/api/status
```
*Respuesta esperada: JSON con el estado de QuantVibe y el pipeline.*
