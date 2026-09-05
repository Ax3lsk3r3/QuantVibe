# 🚀 Guía de Despliegue y Administración en la Nube (Alibaba Cloud ECS)
# Cloud Deployment & Server Administration Manual

Esta guía documenta la infraestructura en la nube desplegada para **QuantVibe**, los comandos de administración operativa, la vinculación de dominios con SSL/HTTPS y el procedimiento para apagar o liberar el servidor para evitar cobros.

---

## 📌 1. Ficha Técnica de la Infraestructura Activa

| Parámetro | Valor Configurado |
| :--- | :--- |
| **Proveedor Cloud** | Alibaba Cloud |
| **Producto** | Elastic Compute Service (ECS) |
| **Modalidad** | Free Trial (Savings Plan USD 90.00) |
| **Vigencia del Trial** | 05 de Septiembre 2026 – 05 de Diciembre 2026 (90 días) |
| **Región** | US (Virginia) `us-east-1` |
| **Instance ID** | `i-0xi6jmmcv6sia7vgbvkr` |
| **Nombre del Host** | `iZ0xi6jmmcv6sia7vgbvkrZ` |
| **Dirección IP Pública** | `47.85.111.6` |
| **Dirección IP Privada (VPC)** | `172.24.233.233` |
| **Especificaciones de Cómputo**| 2 vCPUs, 4.0 GiB RAM |
| **Almacenamiento** | ~100 GB SSD (ESSD Auto) |
| **Sistema Operativo** | Ubuntu 22.04.5 LTS (x86_64 Linux) |
| **Cuota de Tráfico Gratuito** | 200 GiB / mes (Regiones fuera de China continental) |

---

## 🛡️ 2. Configuración de Red y Firewall (Security Group)

El grupo de seguridad asignado a la instancia es **`sg-0xi6jmmcv6sia7v8kkrd`**.

### Reglas de Entrada Activas (Inbound Rules)

| Prioridad | Protocolo | Rango de Puertos | Origen (Source) | Descripción / Propósito |
| :---: | :---: | :---: | :---: | :--- |
| **1** | Custom TCP | **`80/80`** | `0.0.0.0/0` (All) | Acceso Web HTTP Estándar (QuantVibe) |
| **1** | Custom TCP | **`8000/8000`** | `0.0.0.0/0` (All) | Acceso API FastAPI / Puerto de respaldo |
| **100** | Custom TCP | **`22/22`** | `0.0.0.0/0` (All) | Conexión remota SSH |
| **100** | All ICMP | `-1/-1` | `0.0.0.0/0` (All) | Ping y diagnóstico de red |
| **100** | Custom TCP | `3389/3389` | `0.0.0.0/0` (All) | Remote Desktop (RDP) |

---

## 🔑 3. Cómo Conectarse al Servidor

### Opción A: Desde la Consola Web de Alibaba Cloud (Workbench)
1. Entra a [Alibaba Cloud Console](https://ecs.console.aliyun.com).
2. Asegúrate de tener seleccionada la región **US (Virginia)** arriba.
3. Ve a **Instances**, busca tu servidor y dale clic a **`Connect`**.
4. Selecciona **Workbench** con la opción **Password-Free** (sin contraseña) y usuario `root`.
5. Dale a **Log In** y se abrirá la terminal directamente en tu navegador.

### Opción B: Desde tu Terminal Local (PowerShell, macOS o Linux)
Puedes conectarte directamente por SSH desde tu computador:
```bash
ssh root@47.85.111.6
```
*(Si te pide contraseña y no la configuraste, puedes asignarle una en la consola de Alibaba: haz clic en `...` en la fila de la instancia -> `Reset Password` -> reinicia la máquina).*

---

## ⚙️ 4. Comandos de Administración Operativa en el Servidor

Ruta base del proyecto en el servidor: `/root/QuantVibe`

### A. Ver si el servidor web está corriendo
```bash
ps aux | grep start_web.py
```

### B. Ver los logs en tiempo real (visitas, peticiones, errores)
```bash
cd /root/QuantVibe
tail -f web.log
```
*(Para salir de la vista de logs presiona `Ctrl + C`).*

### C. Actualizar QuantVibe con nuevos cambios de GitHub
Cuando hagas cambios en tu código local, los subas a GitHub con `git push`, y quieras que se reflejen en tu servidor cloud:

```bash
cd /root/QuantVibe

# 1. Traer los últimos cambios
git pull origin main

# 2. Detener el proceso anterior
pkill -f "python scripts/start_web.py"

# 3. Activar el entorno e iniciar de nuevo
source venv/bin/activate
nohup python scripts/start_web.py --port 80 > web.log 2>&1 &
```

### D. Detener el servicio web
```bash
pkill -f "python scripts/start_web.py"
```

### E. Iniciar el servicio web manualmente
```bash
cd /root/QuantVibe
source venv/bin/activate
nohup python scripts/start_web.py --port 80 > web.log 2>&1 &
```

---

## 5. Dominio Oficial y Configuración SSL / HTTPS (Cloudflare)

El sitio cuenta con dominio oficial propio con certificado SSL activo:
- URL de Producción: **https://quantvibeapp.com**
- IP de Origen: `47.85.111.6` (Puerto 80)
- Proveedor de Dominio: Alibaba Cloud Domains
- Gestión DNS y Proxy SSL: Cloudflare (Nameservers: `rachel.ns.cloudflare.com`, `roan.ns.cloudflare.com`)
- Modo SSL/TLS: **Flexible** (HTTPS seguro al usuario, comunicación HTTP puerto 80 con el origen)

---

## 💰 6. Gestión de Costos, Créditos y Cómo Apagar el Servidor

### ¿Cómo funcionan los $90 USD de Crédito de Prueba?
* **Cuota Total:** USD 90.00 disponibles para 3 meses completos (Septiembre 5 a Diciembre 5, 2026).
* **Consumo por Hora de la Máquina:** USD 0.084 / hora.
* **Crédito Gratuito por Hora:** USD 0.25 / hora.
* **Conclusión:** La máquina consume **mucho menos** de lo que Alibaba te da gratis cada hora. **Dejarla encendida 24/7 NO acabará tus créditos antes de los 90 días.** Está completamente cubierta hasta el **05 de Diciembre de 2026**.

### ¿Cómo apagar el servidor temporalmente?
Si quieres apagar la máquina durante unos días o semanas:
1. En la consola de Alibaba Cloud ECS, ve a **Instances**.
2. En la fila de tu servidor, haz clic en **`Stop`**.
3. Selecciona *"Stop"* -> *"OK"*.
4. Cuando quieras volver a prenderla, simplemente dale a **`Start`**.

### ⚠️ ¿Cómo destruir/liberar el servidor para que NUNCA te cobren?
Si llega finales de Noviembre de 2026 y no deseas continuar pagando por el servidor después de que venza el trial de 3 meses:
1. Entra a **ECS** en la consola de Alibaba Cloud.
2. En el panel principal de **Trial Progress**, haz clic en el botón:  
   👉 **`Release Trial ECS`**
3. O en la lista de **Instances**, haz clic en los tres puntos `...` -> **`Release Instance`** -> Confirma con tu teléfono/email.
4. Esto eliminará la máquina virtual y asegurará que tu tarjeta nunca reciba ningún cobro posterior.
