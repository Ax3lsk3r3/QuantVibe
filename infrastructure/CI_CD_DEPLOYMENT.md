# Automatización de Despliegue Continuo (CI/CD con GitHub Actions)
# Continuous Deployment (CI/CD) Architecture

Este documento detalla el pipeline de despliegue continuo configurado para **QuantVibe**: cada vez que se hace `git push origin main`, GitHub Actions se conecta de forma segura por SSH al servidor de Alibaba Cloud ECS, descarga los cambios y reinicia el servicio web automáticamente.

---

## 🔄 Flujo de Automatización

```
[ Tu Computador Local ]
       │
       │ 1. git push origin main
       ▼
[ Repositorio GitHub (Rama main) ]
       │
       │ 2. Dispara el Workflow (.github/workflows/deploy.yml)
       ▼
[ GitHub Actions Runner ]
       │
       │ 3. Conexión SSH cifrada con llave ED25519 (Puerto 22)
       ▼
[ Servidor Alibaba Cloud ECS (47.85.111.6) ]
       │
       ├─> git pull origin main
       ├─> source venv/bin/activate
       ├─> pip install -r requirements-web.txt
       ├─> Reinicia el proceso web (scripts/start_web.py --port 80)
       └─> Healthcheck HTTP: curl http://localhost/api/status
       │
       ▼
[ Sitio en Vivo Actualizado: https://quantvibeapp.com ]
```

---

## 🔑 Configuración de Credenciales (Una sola vez)

Para que GitHub Actions tenga permiso de conectarse a tu servidor, se requieren dos pasos simples:

### Paso 1: Agregar la llave pública en el servidor ECS
En la terminal de Alibaba Cloud (Workbench), ejecutar este comando de 1 línea:
```bash
mkdir -p ~/.ssh && echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDn69L93ZBv6B/UgxeefZsB8q26DeKuQ2XHJZDPOg9AT github-actions-deploy" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
```

### Paso 2: Agregar el Secret en GitHub
1. Entra a tu repositorio en GitHub: [https://github.com/Ax3lsk3r3/QuantVibe](https://github.com/Ax3lsk3r3/QuantVibe)
2. Ve a **Settings** -> menú lateral izquierdo **Secrets and variables** -> **Actions**.
3. Haz clic en **New repository secret**.
4. Llena:
   * **Name:** `SERVER_SSH_KEY`
   * **Secret:** (Pega la clave privada ED25519 completa incluyendo cabeceras `-----BEGIN OPENSSH PRIVATE KEY-----` y `-----END OPENSSH PRIVATE KEY-----`).
5. *(Opcional)* Puedes agregar también:
   * `SERVER_HOST`: `47.85.111.6` (por defecto ya está configurado).
   * `SERVER_USER`: `root` (por defecto ya está configurado).

---

## 🚀 Cómo Trabajar de Ahora en Adelante

Una vez guardado el secreto en GitHub:
1. Programas y haces cambios en tu código local.
2. Si modificas el frontend (`web/frontend/`), ejecutas `pnpm build` dentro de `web/frontend/`.
3. Haces commit y push:
   ```bash
   git add .
   git commit -m "mi nueva función"
   git push origin main
   ```
4. **¡Y te olvidas de todo!** A los 15-20 segundos, la página [https://quantvibeapp.com](https://quantvibeapp.com) ya tendrá tus cambios activos en vivo.
