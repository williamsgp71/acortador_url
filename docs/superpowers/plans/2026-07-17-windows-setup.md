# Plan de Implementación: Levantar el Proyecto en Windows (PowerShell)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configurar el entorno virtual de Python, instalar dependencias de backend y frontend, inicializar la base de datos y arrancar la aplicación completa de forma local en Windows.

**Architecture:** Levantamiento local del backend (FastAPI, SQLite, puerto 8000) y del frontend (Vite React, puerto 5173) en consolas de PowerShell independientes.

**Tech Stack:** Python 3.11+, Node.js v18+, npm v9+, PowerShell.

## Global Constraints
- Ejecución en entorno Windows 10/11 utilizando PowerShell.
- Evitar hacer commits de Git a petición del usuario.
- Puerto del backend: 8000.
- Puerto del frontend: 5173.

---

### Task 1: Verificación de Entorno y Prerrequisitos

**Files:**
- Create: None (Consola)

**Interfaces:**
- Consumes: None
- Produces: Consola de PowerShell con política de ejecución de scripts habilitada temporalmente.

- [ ] **Step 1: Verificar versión de Python**
  Ejecutar en PowerShell:
  ```powershell
  python --version
  ```
  *Resultado esperado*: Debe responder con versión `Python 3.11` o superior (por ejemplo, `Python 3.12.x`).

- [ ] **Step 2: Verificar versión de Node.js y npm**
  Ejecutar en PowerShell:
  ```powershell
  node -v
  npm -v
  ```
  *Resultado esperado*: Node.js `v18.x` o superior, npm `v9.x` o superior.

- [ ] **Step 3: Habilitar temporalmente la ejecución de scripts en la terminal**
  Ejecutar en PowerShell:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
  ```
  *Resultado esperado*: Sin errores. Esto permitirá que PowerShell ejecute el script de activación del entorno virtual de Python (`.venv\Scripts\Activate.ps1`) en esta ventana de consola.

---

### Task 2: Configuración del Entorno de Python (Backend)

**Files:**
- Create: `.venv/` (Carpeta del entorno virtual)
- Modify: None (Instalación de paquetes en `.venv`)

**Interfaces:**
- Consumes: PowerShell con permisos para ejecutar scripts (Task 1).
- Produces: Entorno virtual activo con todas las dependencias del archivo `requirements.txt` instaladas.

- [ ] **Step 1: Crear el entorno virtual de Python**
  Ejecutar en la raíz del proyecto:
  ```powershell
  python -m venv .venv
  ```
  *Resultado esperado*: Se creará una carpeta llamada `.venv` en el directorio.

- [ ] **Step 2: Activar el entorno virtual**
  Ejecutar en PowerShell:
  ```powershell
  .venv\Scripts\Activate.ps1
  ```
  *Resultado esperado*: El prompt de la terminal debe mostrar `(.venv)` a la izquierda.

- [ ] **Step 3: Instalar las dependencias de Python**
  Ejecutar en PowerShell (con `.venv` activo):
  ```powershell
  pip install -r requirements.txt
  ```
  *Resultado esperado*: Instalación correcta de FastAPI, Uvicorn, SQLAlchemy, Alembic, etc.

---

### Task 3: Base de Datos y Configuración del Backend

**Files:**
- Create: `.env` (Copia del archivo de configuración)
- Create: `auth.db` (Base de datos SQLite generada por migraciones)

**Interfaces:**
- Consumes: Entorno virtual activo con librerías instaladas (Task 2).
- Produces: Archivo `.env` configurado y base de datos `auth.db` inicializada con las tablas.

- [ ] **Step 1: Copiar archivo de variables de entorno**
  Ejecutar en PowerShell:
  ```powershell
  Copy-Item .env.example .env
  ```
  *Resultado esperado*: Se crea el archivo `.env` en la raíz del proyecto.

- [ ] **Step 2: Ejecutar las migraciones de base de datos**
  Ejecutar en PowerShell (con `.venv` activo):
  ```powershell
  alembic upgrade head
  ```
  *Resultado esperado*: Alembic ejecutará los scripts SQL de creación de tablas. Se creará un archivo `auth.db` en el directorio del proyecto.

---

### Task 4: Instalación del Frontend

**Files:**
- Modify: `frontend/node_modules/` (Instalación de paquetes de node)

**Interfaces:**
- Consumes: Node.js y npm instalados (Task 1).
- Produces: Carpeta `frontend/node_modules` con todas las dependencias del frontend instaladas.

- [ ] **Step 1: Acceder al directorio del frontend**
  Ejecutar en PowerShell:
  ```powershell
  cd frontend
  ```
  *Resultado esperado*: La ruta de tu consola cambia a `.../frontend`.

- [ ] **Step 2: Instalar las dependencias del frontend**
  Ejecutar en PowerShell:
  ```powershell
  npm install
  ```
  *Resultado esperado*: Instalación exitosa de los paquetes npm sin errores críticos.

---

### Task 5: Ejecución de Servidores y Verificación Final

**Files:**
- Create: None (Servidores en ejecución)

**Interfaces:**
- Consumes: Entorno del backend e instalación del frontend (Task 3 y Task 4).
- Produces: Servidores backend y frontend corriendo de forma concurrente, listos para pruebas en navegador.

- [ ] **Step 1: Arrancar el servidor Backend**
  En la primera terminal de PowerShell (raíz del proyecto, con `.venv` activo), ejecutar:
  ```powershell
  uvicorn app.main:app --reload --port 8000
  ```
  *Resultado esperado*: `Uvicorn running on http://127.0.0.1:8000`.

- [ ] **Step 2: Arrancar el servidor Frontend**
  Abrir una **segunda** terminal de PowerShell, acceder al directorio del frontend (`cd frontend`) y ejecutar:
  ```powershell
  npm run dev
  ```
  *Resultado esperado*: `VITE ... ready in ... Local: http://localhost:5173/`.

- [ ] **Step 3: Realizar prueba funcional**
  - Abrir el navegador en `http://localhost:5173/`.
  - Registrar un nuevo usuario en la página `/register`.
  - Navegar a **My URLs** e ingresar una URL de prueba para verificar que el acortador y la redirección funcionan.
