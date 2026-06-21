# Changelog

Historial de funcionalidades agregadas al proyecto.

## [0.2.0] — 2026-06-15

### Added — URL Shortener

#### Backend
- **Modelo `ShortUrl`** (`app/models/short_url.py`)
  - Campos: id, short_code (unique), original_url, user_id (FK), clicks, last_accessed_at, created_at
  - Relación con modelo User

- **Schemas** (`app/schemas/urls.py`)
  - `UrlCreate` — request body con `original_url`
  - `UrlResponse` — respuesta con stats
  - `UrlListResponse` — listado paginado

- **API Routes** (`app/api/routes/urls.py`)
  - `POST /urls/shorten` — Crear URL acortada con short code aleatorio de 6 caracteres
  - `GET /urls` — Listar URLs del usuario autenticado
  - `GET /urls/{short_code}` — Obtener estadísticas de una URL
  - `DELETE /urls/{short_code}` — Eliminar una URL

- **Redirect** (`app/api/routes/redirect.py`)
  - `GET /s/{short_code}` — Redirección 307 a la URL original
  - Incrementa contador de clicks automáticamente
  - Registra timestamp del último acceso

#### Frontend
- **API Module** (`frontend/src/api/urls.js`)
  - Funciones: createShortUrl, listUrls, getUrlStats, deleteUrl

- **Página URLs** (`frontend/src/pages/UrlsPage.jsx`)
  - Formulario para crear URLs acortadas
  - Lista de URLs con stats (clicks, fecha, último acceso)
  - Botón copiar al portapapeles
  - Botón eliminar con confirmación

- **Routing** — Nueva ruta `/urls` protegida
- **Navbar** — Link "My URLs" visible solo para usuarios autenticados
- **Proxy** — Configurado para `/urls` y `/s`

#### Infrastructure
- Tabla `short_urls` auto-creada en startup
- Alembic env.py actualizado con nuevo modelo

---

## [0.1.0] — 2026-06-15

### Added — JWT Authentication

#### Backend
- **Modelo User** (`app/models/user.py`)
  - Campos: id, email, username, hashed_password, is_active, created_at, updated_at

- **Modelo RefreshToken** (`app/models/refresh_token.py`)
  - Campos: id, jti, user_id (FK), is_revoked, expires_at, created_at
  - Token rotation con revocation

- **Auth Routes** (`app/api/routes/auth.py`)
  - `POST /auth/register` — Registro con validación de duplicados
  - `POST /auth/login` — Login con bcrypt
  - `POST /auth/refresh` — Rotación de refresh tokens
  - `POST /auth/logout` — Revocación de refresh token
  - `GET /auth/me` — Perfil del usuario autenticado

- **Security**
  - `app/security/hashing.py` — bcrypt password hashing
  - `app/security/tokens.py` — JWT create/decode con python-jose

- **Rate Limiting** — slowapi en login (10/min) y register (5/min)
- **Health Check** — `GET /health`

#### Frontend
- **React 19** + **Vite 8** + **Tailwind CSS 4**
- **AuthContext** — Manejo de estado con JWT
- **Páginas**: Login, Register, Dashboard
- **ProtectedRoute** — Guard de autenticación
- **Layout** — Navbar responsive

#### Infrastructure
- SQLite para desarrollo
- PostgreSQL soportado via Docker Compose
- Alembic para migraciones
- Tests con pytest-asyncio (9 tests)
