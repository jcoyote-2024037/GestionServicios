# GestionServicios — Frontend

Frontend moderno para la plataforma de gestión de servicios, construido con React + Vite + Tailwind CSS v4, siguiendo la arquitectura por features del proyecto de referencia KinalSports.

---

## 🎨 Paleta de colores

Paleta **"La Clave de la Confianza"**:

| Token CSS         | Valor     | Uso                              |
|-------------------|-----------|----------------------------------|
| `--navy`          | `#0F2D54` | Primario: headers, títulos, CTAs |
| `--navy-dark`     | `#091D38` | Hover oscuro del primario        |
| `--orange`        | `#F4650A` | Acento: botones de acción        |
| `--orange-light`  | `#FF8040` | Estados hover del acento         |
| `--bg`            | `#F7F8FA` | Fondo general (gris muy claro)   |
| `--bg-white`      | `#FFFFFF` | Fondo de cards y paneles         |

---

## 🏗️ Estructura del proyecto

```
src/
├── app/
│   ├── App.jsx              # Root con Toaster + checkAuth
│   ├── main.jsx             # Entry point
│   ├── index.css            # Design tokens (CSS vars) + Tailwind
│   ├── pages/
│   │   └── HomePage.jsx     # Landing page
│   └── router/
│       ├── AppRoutes.jsx    # Todas las rutas
│       └── ProtectedRoute.jsx
├── features/
│   ├── auth/
│   │   ├── pages/           # LoginPage, RegisterPage
│   │   └── store/authStore.js  # Zustand + persist
│   ├── services/
│   │   ├── pages/           # ServicesPage, ServiceDetailPage, ServiceFormPage
│   │   └── store/serviceStore.js
│   ├── requests/
│   │   ├── pages/RequestsPage.jsx
│   │   └── store/requestStore.js
│   ├── favorites/
│   │   ├── pages/FavoritesPage.jsx
│   │   └── store/favoriteStore.js
│   ├── profile/
│   │   └── pages/ProfilePage.jsx
│   └── admin/
│       └── pages/AdminPage.jsx
└── shared/
    ├── api/api.js           # Axios con interceptor de token
    └── components/
        ├── ui/              # Button, Input, Modal, Spinner, StatusBadge
        └── layout/          # Navbar
```

---

## 🚀 Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita VITE_API_URL con tu backend

# 3. Arrancar en desarrollo
npm run dev

# 4. Build para producción
npm run build
```

---

## 🔗 Endpoints consumidos

Base URL: `/gestionservicio/v1`

| Método | Endpoint                       | Acción                    |
|--------|-------------------------------|---------------------------|
| POST   | `/auth/login`                  | Inicio de sesión          |
| POST   | `/auth/register`               | Registro de usuario       |
| GET    | `/services`                    | Listar servicios          |
| GET    | `/services/:id`                | Detalle de servicio       |
| POST   | `/services`                    | Crear servicio            |
| PUT    | `/services/:id`                | Editar servicio           |
| DELETE | `/services/:id`                | Eliminar servicio         |
| GET    | `/requests/my`                 | Mis solicitudes           |
| GET    | `/requests`                    | Todas (admin)             |
| POST   | `/requests`                    | Crear solicitud           |
| PATCH  | `/requests/:id/status`         | Cambiar estado            |
| PATCH  | `/requests/:id/cancel`         | Cancelar solicitud        |
| GET    | `/favorites`                   | Mis favoritos             |
| POST   | `/favorites`                   | Agregar favorito          |
| DELETE | `/favorites/:serviceId`        | Quitar favorito           |
| PUT    | `/users/:id`                   | Actualizar perfil         |

---

## 🌟 Características

- ✅ Autenticación con token JWT (Zustand + persist)
- ✅ Protección de rutas (`ProtectedRoute`)
- ✅ Panel de administración básico (servicios + solicitudes)
- ✅ Flujo completo de solicitudes (pendiente → aceptada/rechazada → completada/cancelada)
- ✅ Sistema de favoritos con toggle
- ✅ Perfil de usuario editable
- ✅ Búsqueda y filtrado de servicios
- ✅ Diseño responsive (mobile-first)
- ✅ Notificaciones con `react-hot-toast`
- ✅ Validaciones de formularios con `react-hook-form`
- ✅ Estados de carga y manejo de errores
- ✅ Interceptor Axios con inyección automática de token

---

## 🔧 Tecnologías

- **React 18** + **Vite 6**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **React Router v6**
- **Zustand v4** con `persist`
- **React Hook Form v7**
- **Axios v1**
- **React Hot Toast v2**
- **@heroicons/react v2**
