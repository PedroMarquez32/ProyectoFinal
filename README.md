# 🌍 TravelEase - Plataforma de Viajes

## 📖 Introducción a la aplicación

TravelEase es una plataforma web moderna que permite a los usuarios explorar, reservar y personalizar sus viajes. La aplicación ofrece una experiencia completa para los amantes de los viajes, permitiendo:

- ✈️ Explorar destinos turísticos
- 🏨 Realizar reservas
- 💬 Comentar y compartir experiencias
- ⭐ Marcar destinos favoritos
- 🎯 Crear viajes personalizados
- 👥 Gestión de usuarios y roles
- 💰 Sistema de pagos integrado

## 🚀 Manual de Instalación

### Requisitos Previos
- Docker
- Docker Compose

### Pasos de Instalación
1. Clonar el repositorio
2. Cambiar a la rama Local:
```bash
git checkout Local
```
3. Navegar a la raíz del proyecto
4. Ejecutar el siguiente comando:
```bash
docker compose up --build
```

> **Nota importante**: La versión que funciona con Docker Compose se encuentra en la rama `Local` del proyecto, no en la rama `main`. Asegúrate de estar en la rama correcta antes de proceder con la instalación.

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- BD: http://localhost:5432

## 👤 Manual de Usuario

### Registro y Acceso
1. Acceder a la vista de registro
2. Completar el formulario con los datos requeridos
3. Iniciar sesión con las credenciales creadas

### Funcionalidades Disponibles
- **Explorar Destinos**: Navegar por la lista de destinos disponibles
- **Reservas**: Seleccionar fechas y realizar reservas
- **Comentarios**: Dejar reseñas y comentarios sobre destinos
- **Viajes Personalizados**: Crear itinerarios personalizados
- **Favoritos**: Marcar destinos como favoritos para acceso rápido

## 👨‍💼 Manual de Administración

### Acceso al Panel de Administración
1. Acceder a la página de login
2. Iniciar sesión con las credenciales de administrador:
   - Email: admin123@traveldream.com
   - Contraseña: 123456

   -Email-Pagina desplegada: admin@traveldreams.com
   -Contraseña: 123456
3. Acceder al panel de administración desde el dashboard

### Funcionalidades de Administración
- **Gestión de Usuarios**
  - Ver información de usuarios
  - Gestionar roles y permisos
  - Modificar datos de usuarios

- **Gestión de Destinos**
  - Añadir nuevos destinos
  - Editar información existente
  - Eliminar destinos

- **Gestión de Reservas**
  - Ver todas las reservas
  - Gestionar estados de reservas
  - Modificar detalles de reservas

- **Gestión de Viajes Personalizados**
  - Revisar solicitudes
  - Aprobar/Rechazar viajes
  - Modificar itinerarios

- **Gestión de Pagos**
  - Ver historial de transacciones
  - Gestionar reembolsos
  - Configurar métodos de pago

- **Gestión de Reseñas**
  - Moderar comentarios
  - Eliminar contenido inapropiado
  - Responder a reseñas

## ⚙️ Variables de Entorno necesarias para desarrollo local

### Frontend (`/frontend/.env`)
Crea un archivo `.env` en la carpeta `frontend` con el siguiente contenido:

```
VITE_API_URL=http://localhost:5000
```

### Backend (`/backend/.env`)
Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido:

```
PORT=5000
JWT_SECRET=tuSecretoMuySeguroAqui
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 🔗 Endpoints importantes de la API

A continuación se listan los endpoints REST más relevantes para el funcionamiento y pruebas de la plataforma:

### Autenticación y Usuarios
- `POST   /api/auth/register` — Registro de usuario
- `POST   /api/auth/login` — Login de usuario
- `GET    /api/auth/me` — Obtener usuario autenticado
- `POST   /api/auth/logout` — Cerrar sesión

- `GET    /api/users` — (Admin) Listar todos los usuarios
- `PUT    /api/users/:id` — (Admin) Editar usuario por ID
- `PUT    /api/users/:id/role` — (Admin) Cambiar rol de usuario
- `DELETE /api/users/:id` — (Admin) Eliminar usuario

### Destinos
- `GET    /api/trips` — Listar destinos
- `POST   /api/trips` — (Admin) Crear destino
- `PUT    /api/trips/:id` — (Admin) Editar destino
- `DELETE /api/trips/:id` — (Admin) Eliminar destino

### Reservas
- `GET    /api/bookings` — (Admin) Listar reservas
- `POST   /api/bookings` — Crear reserva
- `DELETE /api/bookings/:id` — (Admin) Eliminar reserva

### Viajes Personalizados
- `POST   /api/custom-trips` — Crear viaje personalizado
- `GET    /api/custom-trips` — (Admin) Listar todos los viajes personalizados
- `DELETE /api/custom-trips/:id` — (Admin) Eliminar viaje personalizado

### Pagos
- `GET    /api/finances/transactions` — (Admin) Listar pagos
- `POST   /api/finances/manual` — (Admin) Añadir pago manual
- `PATCH  /api/finances/transactions/:id/status` — (Admin) Cambiar estado de pago
- `DELETE /api/finances/transactions/:id` — (Admin) Eliminar pago

### Reseñas
- `GET    /api/reviews` — Listar reseñas
- `POST   /api/reviews` — Crear reseña
- `DELETE /api/reviews/:id` — (Admin) Eliminar reseña

---

**Notas para desarrolladores:**
- Todos los endpoints `/api/*` requieren autenticación por cookie (login previo).
- Los endpoints marcados como **(Admin)** requieren usuario con rol de administrador.
- Para desarrollo local, asegúrate de tener los archivos `.env` en `/frontend` y `/backend` como se indica en la sección anterior.
- Si cambias los puertos o URLs, actualiza los `.env` y la configuración de Docker Compose si la usas.
