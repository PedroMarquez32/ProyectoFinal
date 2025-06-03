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

## 🔧 Soporte Técnico

Para cualquier consulta o soporte técnico, por favor contactar al equipo de desarrollo.

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.
