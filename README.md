# Auth App — JWT Authentication + URL Shortener

Aplicación web completa con autenticación JWT y acortador de URLs con tracking de clicks.

## Stack Tecnológico

### Backend
- **Python 3.12** + **FastAPI** (framework async)
- **SQLAlchemy** (ORM async) + **SQLite** (desarrollo) / **PostgreSQL** (producción)
- **JWT** (python-jose) con access + refresh tokens
- **bcrypt** para hashing de contraseñas
- **slowapi** para rate limiting
- **Alembic** para migraciones de BD

### Frontend
- **React 19** + **Vite 8**
- **Tailwind CSS 4** (estilos)
- **React Router 7** (routing)

## Funcionalidades

| Feature | Descripción |
|---|---|
| Registro de usuarios | Email, username, password con validación |
| Login / Logout | JWT con rotación de refresh tokens |
| Rate limiting | 5 req/min en registro, 10 req/min en login |
| Acortar URLs | Short codes aleatorios de 6 caracteres |
| Tracking de clicks | Conteo de clicks + timestamp del último acceso |
| URLs por usuario | Cada usuario solo ve sus propias URLs |
| Eliminar URLs | Borrar URLs acortadas |
| Frontend SPA | Interfaz web completa con React |

## Requisitos

- Python 3.11+
- Node.js 18+
- pip
- npm

## Instalación

### 1. Clonar el proyecto

```bash
git clone <repo-url>
cd test_ai
```

### 2. Backend

```bash
# Crear entorno virtual
python -m venv .venv

# Activar entorno virtual
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores (SECRET_KEY, DATABASE_URL, etc.)
```

### 3. Frontend

```bash
cd frontend
npm install
```

## Ejecución

### Terminal 1 — Backend

```bash
# Desde la raíz del proyecto
source .venv/bin/activate  # o .venv\Scripts\activate en Windows
uvicorn app.main:app --reload --port 8000
```

El backend estará disponible en: `http://127.0.0.1:8000`

Documentación interactiva (Swagger): `http://127.0.0.1:8000/docs`

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## Uso del Sistema

### 1. Registrarse

1. Abrir `http://localhost:5173`
2. Hacer clic en **Register**
3. Completar email, username y password
4. Serás redirigido al Dashboard

### 2. Iniciar Sesión

1. Ir a `http://localhost:5173/login`
2. Ingresar username y password
3. Serás redirigido al Dashboard

### 3. Acortar URLs

1. Ir a **My URLs** en la navbar
2. Pegar una URL en el formulario
3. Hacer clic en **Shorten URL**
4. El link acortado aparecerá en la lista

### 4. Usar una URL Acortada

1. Copiar el link de la lista (clic para copiar al portapapeles)
2. Abrirlo en el navegador → redirige a la URL original
3. El click queda registrado

### 5. Ver Estadísticas

En la lista de URLs se muestra:
- **Clicks**: número total de accesos
- **Last accessed**: fecha/hora del último click
- **Created**: fecha de creación

### 6. Eliminar URLs

1. Hacer clic en **Delete** junto a la URL
2. Confirmar la eliminación

## API Endpoints

### Autenticación (`/auth`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/auth/register` | No | Registrar usuario |
| `POST` | `/auth/login` | No | Iniciar sesión |
| `POST` | `/auth/refresh` | No | Renovar tokens |
| `POST` | `/auth/logout` | Sí | Cerrar sesión |
| `GET` | `/auth/me` | Sí | Obtener perfil |

### URLs (`/urls`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/urls/shorten` | Sí | Crear URL acortada |
| `GET` | `/urls` | Sí | Listar mis URLs |
| `GET` | `/urls/{code}` | Sí | Ver stats de una URL |
| `DELETE` | `/urls/{code}` | Sí | Eliminar URL |

### Redirect (`/s`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/s/{code}` | No | Redirigir y contar click |

## Ejemplos con curl

```bash
# Registrar usuario
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","username":"user","password":"pass12345"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass12345"}'

# Crear URL acortada (reemplazar TOKEN)
curl -X POST http://localhost:8000/urls/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"original_url":"https://www.ejemplo.com"}'

# Listar URLs
curl http://localhost:8000/urls \
  -H "Authorization: Bearer TOKEN"

# Redirigir (abrir en navegador)
curl -I http://localhost:8000/s/ABC123
```

## Estructura del Proyecto

```
├── app/
│   ├── api/
│   │   ├── deps.py              # Dependencias (get_current_user)
│   │   └── routes/
│   │       ├── auth.py          # Endpoints de autenticación
│   │       ├── urls.py          # Endpoints de URLs
│   │       └── redirect.py      # Redirect + click tracking
│   ├── models/
│   │   ├── user.py              # Modelo Usuario
│   │   ├── refresh_token.py     # Modelo RefreshToken
│   │   └── short_url.py         # Modelo ShortUrl
│   ├── schemas/
│   │   ├── auth.py              # Schemas de autenticación
│   │   └── urls.py              # Schemas de URLs
│   ├── security/
│   │   ├── hashing.py           # bcrypt
│   │   └── tokens.py            # JWT
│   ├── utils/
│   │   └── rate_limit.py        # slowapi
│   ├── config.py                # Settings
│   ├── database.py              # SQLAlchemy engine
│   └── main.py                  # FastAPI app
├── frontend/
│   └── src/
│       ├── api/
│       │   ├── auth.js          # API auth
│       │   └── urls.js          # API URLs
│       ├── components/
│       │   ├── Layout.jsx       # Navbar
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   └── AuthContext.jsx  # Estado de auth
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── DashboardPage.jsx
│       │   └── UrlsPage.jsx
│       ├── App.jsx              # Routing
│       └── main.jsx             # Entry point
├── tests/
│   ├── conftest.py
│   └── test_auth.py
├── alembic/                     # Migraciones
├── requirements.txt
├── pyproject.toml
├── docker-compose.yml
└── .env.example
```

## Tests

```bash
# Ejecutar todos los tests
source .venv/bin/activate
pytest tests/ -v
```

## Docker

```bash
# Levantar con Docker Compose (requiere Docker)
docker-compose up -d
```

Esto levanta PostgreSQL + la aplicación backend.

## Variables de Entorno

Archivo `.env`:

```env
SECRET_KEY=tu-clave-secreta-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
DATABASE_URL=sqlite+aiosqlite:///./auth.db
```

Para PostgreSQL:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/authdb
```
