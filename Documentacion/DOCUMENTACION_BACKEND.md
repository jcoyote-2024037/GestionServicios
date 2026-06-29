# Documentación del backend de GestionServicios

## 1. Descripción general

GestionServicios es un backend para una plataforma de servicios donde los usuarios pueden:

- Registrarse e iniciar sesión de forma segura.
- Publicar servicios.
- Buscar y consultar servicios disponibles.
- Enviar solicitudes de servicio.
- Gestionar estados de solicitudes.
- Valorar servicios mediante reseñas.
- Guardar servicios en favoritos.
- Recibir notificaciones por correo.
- Consultar reportes, insignias y métricas de uso.

Este proyecto está pensado como el motor de negocio del sistema, expuesto mediante una API REST y documentada con Swagger.

---

## 2. Objetivo del proyecto

El objetivo principal de este backend es administrar toda la lógica de negocio de una marketplace de servicios, incluyendo:

- Autenticación y autorización de usuarios.
- Gestión de servicios y categorías.
- Gestión de solicitudes entre usuarios y proveedores.
- Recomendaciones, favoritos y reseñas.
- Seguridad, validaciones y auditoría.

---

## 3. Tecnologías utilizadas

### Backend principal
- Node.js
- Express.js
- JavaScript (módulos ES)

### Bases de datos
- PostgreSQL + Sequelize
- MongoDB + Mongoose

### Autenticación y seguridad
- JWT (jsonwebtoken)
- bcryptjs
- Helmet
- CORS
- express-validator
- rate limiting

### Documentación y utilidades
- Swagger / Swagger UI
- Nodemailer
- Morgan
- dotenv
- Multer

---

## 4. Arquitectura del proyecto

El backend sigue una estructura modular en capas:

- Configuración general del servidor
- Rutas de la API
- Controladores
- Modelos de datos
- Middlewares de validación y seguridad
- Helpers y utilidades

La idea es separar claramente:

1. La entrada HTTP (rutas)
2. La lógica de negocio (controladores)
3. El acceso a datos (modelos)
4. La seguridad y validación (middlewares)

---

## 5. Estructura del proyecto

### Raíz del proyecto
- package.json: dependencias y scripts del proyecto.
- index.js: punto de entrada de la aplicación.
- docker-compose.yml: configuración para levantar PostgreSQL.
- README.md: documentación básica.

### Carpeta principal
- configs/: configuración del servidor, bases de datos, Swagger y CORS.
- middlewares/: validaciones JWT, roles, validadores de body y rate limit.
- src/: módulos funcionales del sistema.
- helpers/: lógica auxiliar para notificaciones, reportes y solicitudes.
- utils/: funciones utilitarias compartidas.

---

## 6. Módulos principales

### 6.1 Autenticación

Responsable de:
- Registro de usuarios
- Inicio de sesión
- Verificación de correo electrónico
- Recuperación de contraseña
- Reenvío de verificación
- Listado de usuarios para administradores

Rutas principales:
- /auth/register
- /auth/login
- /auth/verify-email
- /auth/request-reset
- /auth/reset-password

### 6.2 Usuarios

Módulo para gestionar usuarios del sistema.

Incluye:
- Crear usuarios
- Consultar usuarios
- Actualizar usuarios
- Eliminar usuarios
- Confirmación de eliminación para administradores

### 6.3 Servicios

Permite publicar y consultar servicios.

Funcionalidades:
- Crear servicio
- Obtener servicios
- Obtener servicio por ID
- Actualizar servicio
- Eliminar servicio
- Servicios destacados y populares

Este módulo se relaciona con:
- categorías
- ubicaciones
- etiquetas
- reseñas
- favoritos
- badges

### 6.4 Solicitudes

Es uno de los módulos más importantes del negocio.

Permite:
- Crear solicitudes de servicio
- Consultar solicitudes
- Cambiar estado de la solicitud
- Aceptar o rechazar solicitudes
- Completar solicitudes
- Ver historial por usuario o por servicio
- Expirar solicitudes pendientes

Estados típicos:
- pending
- accepted
- rejected
- completed
- cancelled
- expired

### 6.5 Reseñas

El sistema permite evaluar servicios y usuarios mediante reseñas.

Incluye funcionalidades como:
- Crear reseñas
- Editar reseñas
- Eliminar reseñas
- Dar like
- Moderar contenido
- Reportar reseñas

### 6.6 Favoritos

Permite a los usuarios guardar servicios como favoritos.

Incluye:
- Agregar a favoritos
- Eliminar de favoritos
- Consultar favoritos por usuario
- Sugerencias de servicios
- Seguimiento de interacción

### 6.7 Categorías, ubicaciones y etiquetas

Estos módulos ayudan a organizar y filtrar los servicios.

- Categorías: agrupan servicios por tipo.
- Ubicaciones: ayudan a filtrar por zona geográfica.
- Etiquetas: permiten clasificar mejor los servicios.

### 6.8 Reportes

El backend incluye un módulo de reportes para generar información útil del sistema.

### 6.9 Badges

Se implementa un sistema de insignias para destacar servicios o proveedores.

### 6.10 Logs y auditoría

El backend registra acciones de sistema y eventos importantes.

### 6.11 IA

Existen endpoints para integrar inteligencia artificial, lo cual amplía el sistema con funcionalidades inteligentes.

---

## 7. Flujo de negocio principal

Un flujo típico sería este:

1. El usuario se registra e inicia sesión.
2. El usuario publica un servicio o busca uno existente.
3. Otro usuario crea una solicitud para ese servicio.
4. El proveedor acepta, rechaza o completa la solicitud.
5. El usuario puede dejar una reseña.
6. El servicio puede aparecer en favoritos o en listados destacados.

---

## 8. Base URL de la API

La API está montada bajo:

- /gestionservicio/v1

Ejemplo:
- /gestionservicio/v1/auth/login
- /gestionservicio/v1/services
- /gestionservicio/v1/solicitudes

---

## 9. Documentación con Swagger

El proyecto incorpora Swagger UI para probar la API visualmente.

Ruta principal:
- /api-docs

También cuenta con un endpoint de salud:
- /gestionservicio/v1/Health

---

## 10. Autenticación y roles

El sistema usa JWT para autenticar usuarios.

Roles implementados:
- USER_ROLE
- ADMIN_ROLE

Algunas rutas están protegidas y requieren:
- Token válido
- Rol específico según el caso

---

## 11. Modelos principales

### Usuario
Representa a los usuarios del sistema.

Campos clave:
- name
- surname
- username
- email
- password
- role
- status
- emailVerified

### Servicio
Representa un servicio ofrecido por un proveedor.

Campos clave:
- nombre
- descripcion
- categoriaId
- locationId
- tags
- telefono
- imagenes
- promedioCalificacion
- favoritosCount
- viewsCount
- averageRating
- estado
- usuarioId

### Solicitud
Representa una solicitud realizada sobre un servicio.

Campos clave:
- usuarioId
- proveedorId
- servicioId
- descripcion
- status
- priceEstimate
- scheduledDate
- historialEstados

---

## 12. Base de datos

### PostgreSQL
Se usa para la autenticación y manejo central de usuarios.

### MongoDB
Se usa para almacenar contenido más orientado a negocio como:
- servicios
- solicitudes
- reseñas
- favoritos
- categorías
- ubicaciones
- etiquetas

Esto permite separar mejor la lógica transaccional de la lógica de contenido.

---

## 13. Variables de entorno

El proyecto espera variables como estas en un archivo .env:

```env
PORT=3000

DB_NAME=tu_db
DB_USER=tu_usuario
DB_PASS=tu_password
DB_HOST=localhost
DB_PORT=5432

URI_MONGO=mongodb://localhost:27017/gestionservicios

JWT_SECRET=tu_clave_secreta

EMAIL_USER=tu_correo
EMAIL_PASS=tu_password
GROQ_API_KEY=tu_api_key
```

---

## 14. Cómo correr el proyecto

### Opción 1: con Docker para PostgreSQL

```bash
docker-compose up -d
```

### Opción 2: instalar dependencias

```bash
pnpm install
```

### Opción 3: iniciar el servidor

```bash
pnpm dev
```

El servidor quedará disponible en:
- http://localhost:3000

---

## 15. Buenas prácticas recomendadas

- Mantener los controladores limpios y enfocados en la lógica de negocio.
- Usar middlewares para validaciones y seguridad.
- Mantener los modelos bien definidos y con validaciones.
- Documentar nuevos endpoints en Swagger.
- Separar claramente el acceso a datos de la lógica de negocio.
- Proteger rutas sensibles con JWT y roles.

---

## 16. Sugerencias de mejora para el backend

Algunas mejoras que podrían hacerse en el futuro:

- Implementar pruebas unitarias e integradas.
- Agregar paginación más robusta y filtros avanzados.
- Mejorar manejo de errores centralizado.
- Añadir logs estructurados.
- Crear un sistema de caché para consultas frecuentes.
- Mejorar la arquitectura con servicios dedicados por módulo.

---

## 17. Prompt excelente para pedir un frontend

A continuación tienes un prompt listo para pasarle a un desarrollador frontend o a una IA que te ayude a construir la interfaz:

"Desarrolla un frontend moderno para una plataforma de servicios llamada GestionServicios, consumiendo este backend REST. El sistema debe tener autenticación de usuarios, registro e inicio de sesión, panel de servicios, creación de servicios, visualización de detalles, formulario para solicitar servicios, flujo de solicitudes con estados como pendiente, aceptada, rechazada, completada y cancelada, reseñas, favoritos, perfil de usuario y panel administrativo básico. La interfaz debe ser limpia, responsive, con diseño moderno y buena experiencia de usuario. Usa React o Next.js, preferiblemente con Tailwind CSS, y asegúrate de conectar correctamente los endpoints del backend bajo la base URL /gestionservicio/v1. También incluye manejo de carga, errores, validaciones de formularios, protección de rutas y una experiencia visual atractiva para móviles y escritorio."

---

## 18. Resumen corto

Este proyecto es un backend sólido para una plataforma de servicios que combina:

- autenticación segura
- gestión de servicios
- solicitudes de trabajo
- reseñas y favoritos
- reportes y badges
- documentación con Swagger
- integración con PostgreSQL y MongoDB

Es una base excelente para construir una aplicación completa, tanto en web como en móvil, con un frontend bien diseñado encima de esta API.
