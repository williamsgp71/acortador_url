# Migración de Subdominio a linkshort.kallpay.us Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar el subdominio del acortador a `linkshort.kallpay.us` en Nginx y Certbot, y limpiar por completo la configuración vieja de `acortador.kallpay.us`.

**Architecture:** Nginx en el host se reconfigura para escuchar en el nuevo subdominio `linkshort.kallpay.us`, sirviendo el frontend React de la carpeta local y proxyando las llamadas al backend en Docker (puerto `8000`). Los certificados SSL y archivos de configuración antiguos se eliminan por completo.

**Tech Stack:** Nginx, Certbot (Let's Encrypt), Ubuntu 22.04.

## Global Constraints

- Eliminar de forma segura toda configuración y certificado viejo de `acortador.kallpay.us`.
- Mantener la conectividad al backend Docker en el puerto `8000`.

---

### Task 1: Actualizar Plantilla de Configuración en el Workspace

**Files:**
- Create: `linkshort.kallpay.us`
- Delete: `acortador.kallpay.us`

- [ ] **Step 1: Renombrar el archivo de plantilla local**
  Ejecutar:
  ```bash
  mv acortador.kallpay.us linkshort.kallpay.us
  ```

- [ ] **Step 2: Actualizar el subdominio en la plantilla**
  Modificar el archivo `linkshort.kallpay.us` para que la línea `server_name` apunte al nuevo subdominio:
  ```nginx
  server_name linkshort.kallpay.us;
  ```

- [ ] **Step 3: Guardar cambios y Commit**
  Ejecutar:
  ```bash
  git rm acortador.kallpay.us
  git add linkshort.kallpay.us
  git commit -m "config: rename Nginx template to linkshort.kallpay.us and update server_name"
  ```

---

### Task 2: Configurar Nginx para el Nuevo Subdominio en el Host

**Files:**
- Create: `/etc/nginx/sites-available/linkshort.kallpay.us`

- [ ] **Step 1: Copiar la plantilla al directorio de configuración de Nginx**
  Ejecutar:
  ```bash
  sudo cp linkshort.kallpay.us /etc/nginx/sites-available/linkshort.kallpay.us
  ```

- [ ] **Step 2: Crear el enlace simbólico para habilitar el nuevo sitio**
  Ejecutar:
  ```bash
  sudo ln -sf /etc/nginx/sites-available/linkshort.kallpay.us /etc/nginx/sites-enabled/
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

### Task 3: Configurar SSL (HTTPS) con Certbot para el Nuevo Subdominio

**Files:** None

- [ ] **Step 1: Obtener y configurar certificado SSL con Certbot**
  *Nota: Requiere que el registro DNS A de `linkshort.kallpay.us` ya esté propagado y apunte a `31.220.97.55`.*
  Ejecutar:
  ```bash
  sudo certbot --nginx -d linkshort.kallpay.us --non-interactive --agree-tos --register-unsafely-without-email
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

### Task 4: Eliminar Configuración y Certificados SSL Antiguos

**Files:** None (System configuration cleanup)

- [ ] **Step 1: Eliminar archivos de Nginx del subdominio antiguo**
  Ejecutar:
  ```bash
  sudo rm -f /etc/nginx/sites-enabled/acortador.kallpay.us
  sudo rm -f /etc/nginx/sites-available/acortador.kallpay.us
  ```

- [ ] **Step 2: Recargar Nginx para que deje de escuchar en el subdominio viejo**
  Ejecutar:
  ```bash
  sudo systemctl reload nginx
  ```

- [ ] **Step 3: Revocar y eliminar el certificado SSL viejo de Certbot**
  Ejecutar:
  ```bash
  sudo certbot delete --cert-name acortador.kallpay.us
  ```
  Expected: Certbot confirma que el certificado `acortador.kallpay.us` ha sido borrado del disco.

---

### Task 5: Validación y Pruebas del Nuevo Subdominio

**Files:** None

- [ ] **Step 1: Comprobar acceso HTTP redirigiendo a HTTPS**
  Ejecutar:
  ```bash
  curl -I http://linkshort.kallpay.us
  ```
  Expected: Retorna redirección `301 Moved Permanently` a `https://linkshort.kallpay.us/`.

- [ ] **Step 2: Comprobar acceso HTTPS al frontend**
  Ejecutar:
  ```bash
  curl -s -k https://linkshort.kallpay.us | grep -i "html"
  ```
  Expected: Contiene la estructura básica del index HTML de React.

- [ ] **Step 3: Comprobar acceso HTTPS a la API**
  Ejecutar:
  ```bash
  curl -s -k https://linkshort.kallpay.us/health
  ```
  Expected: Retorna `{"status":"ok"}`.
