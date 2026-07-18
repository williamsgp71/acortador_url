# Configuración de Nginx y Subdominio acortador.kallpay.us Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configurar Nginx en el host y habilitar el subdominio `acortador.kallpay.us` con HTTPS mediante Certbot, sirviendo el frontend React precompilado y haciendo de proxy inverso al backend FastAPI en Docker.

**Architecture:** El frontend de React se compila mediante Docker a una carpeta local del host (`frontend/dist`), la cual es servida de forma estática por Nginx del host. El backend (FastAPI) y la base de datos (Postgres) se ejecutan en Docker, y Nginx desvía las peticiones a `/api` y `/s` al puerto `8000` del backend.

**Tech Stack:** Nginx, Docker, Docker Compose, Certbot (Let's Encrypt), Ubuntu 22.04.

## Global Constraints

- Utilizar el puerto local `8000` para redirecciones de proxy al backend.
- Mantener la base de datos PostgreSQL en Docker.
- No instalar Node.js o npm directamente en el host (compilar usando Docker).

---

### Task 1: Compilación de Frontend React y Ajuste de Docker Compose

**Files:**
- Modify: `docker-compose.yml`

- [ ] **Step 1: Compilar la aplicación React en modo de producción usando Docker**
  Ejecutar el comando de Docker Compose para descargar dependencias y compilar el frontend:
  ```bash
  docker compose run --rm frontend npm run build
  ```
  Expected: El comando termina exitosamente y genera la carpeta `frontend/dist/` en el host conteniendo `index.html` y una carpeta `assets/`.

- [ ] **Step 2: Verificar la existencia de la carpeta dist**
  Ejecutar:
  ```bash
  ls -la frontend/dist
  ```
  Expected: Salida listando `index.html` y la carpeta `assets`.

- [ ] **Step 3: Modificar docker-compose.yml para deshabilitar puertos públicos de frontend**
  Abrir `docker-compose.yml` y comentar o quitar la sección de puertos (`ports: - "5173:5173"`) del servicio `frontend` para que no intente exponer puertos en producción.
  
  Cambiar en `docker-compose.yml`:
  ```yaml
    frontend:
      build:
        context: ./frontend
        dockerfile: Dockerfile
      # ports:
      #   - "5173:5173"
      volumes:
        - ./frontend:/app
        - /app/node_modules
      environment:
        - BACKEND_URL=http://app:8000
      depends_on:
        app:
          condition: service_healthy
  ```

- [ ] **Step 4: Confirmar cambios en docker-compose.yml**
  Verificar que los puertos están comentados correctamente.

- [ ] **Step 5: Guardar cambios y Commit**
  Ejecutar:
  ```bash
  git add docker-compose.yml
  git commit -m "deploy: remove public frontend ports and compile dist assets"
  ```

---

### Task 2: Configuración e Inicio de Servicios Docker en Producción

**Files:**
- Modify: `docker-compose.yml`

- [ ] **Step 1: Detener contenedores actuales de Docker**
  Ejecutar:
  ```bash
  docker compose down
  ```
  Expected: Todos los servicios de Docker se detienen.

- [ ] **Step 2: Levantar base de datos y backend FastAPI en segundo plano**
  Ejecutar:
  ```bash
  docker compose up -d db app
  ```
  Expected: Solo se inician los contenedores `db` y `app` (el frontend no debe iniciar en segundo plano).

- [ ] **Step 3: Verificar que los contenedores están activos y saludables**
  Ejecutar:
  ```bash
  docker compose ps
  ```
  Expected: `db` y `app` muestran estado `running` (healthy).

- [ ] **Step 4: Comprobar el endpoint de salud del Backend**
  Ejecutar:
  ```bash
  curl http://localhost:8000/health
  ```
  Expected: Responde `{"status":"ok"}`.

---

### Task 3: Instalación de Nginx y Certbot en el Host

**Files:** None

- [ ] **Step 1: Actualizar paquetes del sistema e instalar Nginx y Certbot**
  Ejecutar:
  ```bash
  sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
  ```
  Expected: La instalación finaliza sin errores.

- [ ] **Step 2: Verificar el estado del servicio Nginx**
  Ejecutar:
  ```bash
  sudo systemctl status nginx
  ```
  Expected: El estado se muestra como `active (running)`.

---

### Task 4: Configuración de Nginx para el Subdominio

**Files:**
- Create: `/etc/nginx/sites-available/acortador.kallpay.us`

- [ ] **Step 1: Crear archivo de configuración de Nginx**
  Crear el archivo `/etc/nginx/sites-available/acortador.kallpay.us` con el siguiente contenido:
  ```nginx
  server {
      listen 80;
      server_name acortador.kallpay.us;

      root /home/acortador_url/frontend/dist;
      index index.html;

      gzip on;
      gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

      location / {
          try_files $uri $uri/ /index.html;
      }

      location /api {
          proxy_pass http://127.0.0.1:8000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }

      location /s {
          proxy_pass http://127.0.0.1:8000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  ```

- [ ] **Step 2: Crear el enlace simbólico para activar el sitio**
  Ejecutar:
  ```bash
  sudo ln -sf /etc/nginx/sites-available/acortador.kallpay.us /etc/nginx/sites-enabled/
  ```

- [ ] **Step 3: Comprobar la sintaxis de configuración de Nginx**
  Ejecutar:
  ```bash
  sudo nginx -t
  ```
  Expected: `syntax is ok` y `test is successful`.

- [ ] **Step 4: Recargar Nginx para aplicar cambios**
  Ejecutar:
  ```bash
  sudo systemctl reload nginx
  ```

---

### Task 5: Configuración de Certificado SSL (HTTPS) con Let's Encrypt

**Files:** None

- [ ] **Step 1: Obtener y configurar certificado SSL con Certbot**
  *Nota: Requiere que el registro DNS A de `acortador.kallpay.us` ya esté propagado y apunte a `31.220.97.55`.*
  Ejecutar:
  ```bash
  sudo certbot --nginx -d acortador.kallpay.us --non-interactive --agree-tos --register-unsafely-without-email
  ```
  Expected: Mensaje de éxito indicando que el certificado fue guardado y HTTPS configurado automáticamente en Nginx.

- [ ] **Step 2: Comprobar la sintaxis de Nginx tras la modificación de Certbot**
  Ejecutar:
  ```bash
  sudo nginx -t
  ```
  Expected: `syntax is ok` y `test is successful`.

- [ ] **Step 3: Recargar Nginx**
  Ejecutar:
  ```bash
  sudo systemctl reload nginx
  ```

---

### Task 6: Validación y Pruebas del Sistema

**Files:** None

- [ ] **Step 1: Comprobar acceso HTTP redirigiendo a HTTPS**
  Ejecutar:
  ```bash
  curl -I http://acortador.kallpay.us
  ```
  Expected: Retorna redirección `301 Moved Permanently` a `https://acortador.kallpay.us/`.

- [ ] **Step 2: Comprobar acceso HTTPS al frontend**
  Ejecutar:
  ```bash
  curl -s -k https://acortador.kallpay.us | grep -i "html"
  ```
  Expected: Contiene la estructura básica del index HTML de React.

- [ ] **Step 3: Comprobar acceso HTTPS a la API a través de Nginx**
  Ejecutar:
  ```bash
  curl -s -k https://acortador.kallpay.us/health
  ```
  Expected: Retorna `{"status":"ok"}`.
