# GestionServicios

Plataforma de gestión de servicios con frontend web, backend API y aplicación móvil.

## Estructura del proyecto

```
GestionServicios/
├── GestionServiciosFronted/   # Frontend React + Vite (Vercel)
├── GestionServiciosManagment/ # Backend Node.js + Express (Render)
├── mobile/                    # App React Native + Expo (EAS Build)
├── Documentacion/             # Documentación técnica
├── Endpoints/                 # Colección Postman
└── README.md
```

## Requisitos

- Node.js >= 18
- pnpm >= 9
- MongoDB Atlas (producción) o MongoDB local (desarrollo)
- PostgreSQL (opcional, para logs)
- Expo CLI (para mobile)
- EAS CLI (para builds mobile)

## Variables de entorno

Cada parte del proyecto tiene su propio archivo `.env.example`. Copia cada uno como `.env` y completa los valores.

### Backend (`GestionServiciosManagment/.env`)

| Variable | Descripción |
|---|---|
| `MONGODB_URI` | URI de conexión a MongoDB (Atlas en producción) |
| `PORT` | Puerto del servidor (Render asigna automáticamente) |
| `JWT_SECRET` | Secreto para firmar tokens JWT |
| `CORS_ORIGINS` | Orígenes permitidos separados por coma |
| `FRONTEND_URL` | URL del frontend (para enlaces en correos) |
| `SMTP_*` | Configuración de correo SMTP |

### Frontend (`GestionServiciosFronted/.env`)

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API del backend |

### Mobile (`mobile/.env`)

| Variable | Descripción |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL base de la API para la app |

## Instalación

```bash
# Backend
cd GestionServiciosManagment
pnpm install
pnpm start

# Frontend
cd GestionServiciosFronted
pnpm install
pnpm dev

# Mobile
cd mobile
pnpm install
npx expo start
```

## Despliegue

### Frontend → Vercel

1. Conecta el repositorio en Vercel
2. Selecciona `GestionServiciosFronted` como directorio raíz
3. Framework: Vite
4. Variables de entorno: `VITE_API_URL`
5. Despliega

### Backend → Render

1. Crea un Web Service en Render
2. Root directory: `GestionServiciosManagment`
3. Build command: `pnpm install`
4. Start command: `node index.js`
5. Variables de entorno requeridas:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CORS_ORIGINS` (URL del frontend en Vercel)
   - `FRONTEND_URL`

### Base de datos → MongoDB Atlas

1. Crea un cluster en MongoDB Atlas
2. Obtén la URI de conexión
3. Configura Network Access (IP 0.0.0.0/0 para Render)
4. Usa la URI como `MONGODB_URI` en Render

### Mobile → EAS Build

1. Instala EAS CLI: `pnpm add -g eas-cli`
2. Autentica: `eas login`
3. Configura proyecto: `eas init`
4. Actualiza `app.json` con `extra.eas.projectId`
5. Build:

```bash
eas build --profile production --platform android
eas build --profile production --platform ios
```

6. Submit a stores:

```bash
eas submit --platform android
eas submit --platform ios
```

## Comandos útiles

```bash
# Backend
pnpm start        # Iniciar servidor
pnpm dev          # Iniciar con nodemon
pnpm seed         # Ejecutar seed

# Frontend
pnpm dev          # Servidor de desarrollo
pnpm build        # Build producción
pnpm preview      # Vista previa del build

# Mobile
pnpm start        # Iniciar Expo
pnpm android      # Iniciar en Android
pnpm ios          # Iniciar en iOS
```

## URLs por defecto (desarrollo)

| Servicio | URL |
|---|---|
| Backend API | http://localhost:3006/gestionservicio/v1 |
| Swagger UI | http://localhost:3006/api-docs |
| Frontend | http://localhost:5173 |
| Health Check | http://localhost:3006/gestionservicio/v1/Health |
