# Especificación de Diseño: Guía de Inicialización del Proyecto en Windows

Este documento define el diseño y flujo de ejecución paso a paso para levantar localmente el proyecto de autenticación JWT y acortador de URLs en un entorno de desarrollo con sistema operativo Windows.

## 1. Arquitectura y Contexto del Proyecto

El proyecto está compuesto por dos componentes que deben comunicarse de forma local:
- **Backend (puerto 8000)**: Servidor FastAPI en Python que gestiona la base de datos SQLite (`auth.db`), maneja la autenticación JWT y realiza el acortamiento y redirección de URLs.
- **Frontend (puerto 5173)**: Servidor de desarrollo Vite con React 19 y Tailwind CSS 4. Se comunica con el backend a través de peticiones HTTP con un proxy local configurado en Vite.

```
+-----------------------------------+
|          Navegador Web            |
|       http://localhost:5173       |
+-----------------+-----------------+
                  |
                  | Petición HTTP / Proxy local (/api, /s/)
                  v
+-----------------+-----------------+
|         Backend FastAPI           |
|       http://localhost:8000       |
+-----------------+-----------------+
                  |
                  v
       [ Base de Datos SQLite ]
             (auth.db)
```

---

## 2. Plan de Inicialización Detallado

### Fase 1: Prerrequisitos y Consola
1. **Verificar Python**: Ejecutar en PowerShell:
   ```powershell
   python --version
   ```
   *Criterio de aceptación*: Retornar versión 3.11 o superior.
2. **Verificar Node.js y npm**: Ejecutar en PowerShell:
   ```powershell
   node -v
   npm -v
   ```
   *Criterio de aceptación*: Node.js v18+ y npm v9+.
3. **Habilitar Ejecución de Scripts**: Ejecutar temporalmente en PowerShell para permitir la activación de entornos virtuales:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
   ```

### Fase 2: Preparación del Backend Python
1. **Creación del Entorno Virtual**: Ejecutar en la raíz del proyecto:
   ```powershell
   python -m venv .venv
   ```
2. **Activación del Entorno**:
   ```powershell
   .venv\Scripts\Activate.ps1
   ```
3. **Instalación de Dependencias**:
   ```powershell
   pip install -r requirements.txt
   ```
4. **Configuración de Variables de Entorno**:
   Copiar `.env.example` a `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
   *Nota*: Configurar una clave secreta personalizada en `SECRET_KEY` si se requiere, de lo contrario usar los valores predeterminados de SQLite.
5. **Migraciones de Base de Datos**: Crear las tablas ejecutando Alembic:
   ```powershell
   alembic upgrade head
   ```

### Fase 3: Preparación del Frontend React
1. **Acceder a la Carpeta del Frontend**:
   ```powershell
   cd frontend
   ```
2. **Instalación de Dependencias de Node.js**:
   ```powershell
   npm install
   ```
3. **Verificar Configuración del Proxy**:
   El archivo `vite.config.js` debe tener configurados los proxies para redirigir `/api` y `/s/` a `http://127.0.0.1:8000`.

### Fase 4: Ejecución y Pruebas
1. **Arrancar el Servidor Backend**:
   Desde la raíz del proyecto (con `.venv` activo), ejecutar:
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```
2. **Arrancar el Servidor Frontend**:
   Desde la carpeta `frontend/`, abrir una nueva terminal y ejecutar:
   ```powershell
   npm run dev
   ```
3. **Flujo de Prueba y Validación**:
   - Abrir `http://localhost:5173/` en el navegador.
   - Navegar a **Register** y crear una cuenta de prueba.
   - Ir a la pestaña **My URLs** y acortar un enlace de prueba.
   - Hacer clic sobre el enlace acortado para verificar que redirecciona correctamente y contabiliza el clic en la tabla.

---

## 3. Manejo de Errores y Alternativas Comunes

- **Error: `Set-ExecutionPolicy` denegado**: Si da error de administrador, cambiar la política de ejecución a nivel de proceso (`-Scope Process`) es seguro y no requiere permisos de administrador.
- **Error: `ModuleNotFoundError` en Python**: Asegurarse de que el entorno virtual `.venv` está activo en la terminal actual (se muestra `(.venv)` a la izquierda de la línea de comandos).
- **Error: `422 Unprocessable Entity` en peticiones API**: Verificar que los archivos `urls.js` y `auth.js` tienen las correcciones de fusión de cabeceras implementadas.
