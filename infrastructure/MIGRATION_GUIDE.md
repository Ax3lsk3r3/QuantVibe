# Guía de Migración de Servidor a Futuro
# Future Server Migration & Multi-Cloud Playbook

Este documento explica cómo migrar **QuantVibe** a cualquier otro proveedor de infraestructura (AWS, DigitalOcean, Hetzner, Google Cloud, Linode o un servidor local) en el futuro, aprovechando que el dominio y el SSL están desacoplados en Cloudflare.

---

## 🚀 La Gran Ventaja del Setup Actual: Migración en 3 Minutos

Debido a que configuramos **Cloudflare** como intermediario DNS y proveedor de SSL:
1. El certificado SSL **NO** depende del servidor ni se pierde al cambiar de máquina.
2. Migrar de servidor solo requiere **cambiar 1 número (la IP)** en Cloudflare.
3. El cambio se propaga a nivel mundial en menos de **30 segundos** sin tiempo de inactividad (*zero downtime*).

---

## 📋 Pasos para Migrar a un Nuevo Servidor

### Paso 1: Contratar y preparar el nuevo servidor
En cualquier proveedor (por ejemplo: Hetzner por $4 USD/mes, DigitalOcean por $6 USD/mes, AWS EC2, etc.):
1. Crea una máquina con **Ubuntu 22.04 LTS** o **Ubuntu 24.04 LTS**.
2. Conéctate por SSH a tu nuevo servidor y ejecuta:
   ```bash
   sudo apt update && sudo apt install -y python3-pip python3-venv git
   ```

### Paso 2: Descargar QuantVibe y arrancar el servicio
En el nuevo servidor:
```bash
# 1. Clonar el repositorio oficial
git clone https://github.com/Ax3lsk3r3/QuantVibe.git
cd QuantVibe

# 2. Crear el entorno virtual e instalar librerías
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-web.txt

# 3. Arrancar el servicio en el puerto 80
nohup python scripts/start_web.py --port 80 > web.log 2>&1 &
```

Verifica que el firewall del nuevo proveedor tenga el puerto `80` (HTTP) abierto hacia `0.0.0.0/0`.

### Paso 3: Apuntar Cloudflare a la nueva IP (El paso mágico)
1. Entra a tu cuenta en [dash.cloudflare.com](https://dash.cloudflare.com).
2. Selecciona `quantvibeapp.com` -> ve a la pestaña **DNS** -> **Records**.
3. Busca el registro tipo **`A`** que actualmente tiene la IP `47.85.111.6`.
4. Haz clic en **Edit** y cambia esa IP por la **IP pública de tu nuevo servidor**.
5. Haz clic en **Save**.

**¡Listo!** En menos de 1 minuto, todo el tráfico mundial de `https://quantvibeapp.com` empezará a llegar al nuevo servidor, manteniendo el candado verde SSL y sin que los usuarios noten ninguna interrupción.

### Paso 4: Apagar el servidor viejo
Una vez verificado que el nuevo servidor responde correctamente:
1. Entra a Alibaba Cloud ECS.
2. Libera o elimina la instancia vieja (`Release Instance`) para dar por concluida la migración.
