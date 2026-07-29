import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const BASE_PATH = '/gestionservicio/v1'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'GestionServicios API',
    version: '1.0.0',
    description: 'Documentación completa de la API de GestionServicios. Incluye autenticación, servicios, reseñas, favoritos, solicitudes y más.',
    contact: {
      name: 'Equipo GestionServicios',
    },
  },
  servers: [
    {
      url: `${BASE_PATH}`,
      description: 'Servidor actual',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa tu token JWT. Ejemplo: **Bearer eyJhbGci...**',
      },
    },
    schemas: {
      RegisterInput: {
        type: 'object',
        required: ['nombre', 'email', 'password'],
        properties: {
          nombre: { type: 'string', example: 'Juan Pérez' },
          email: { type: 'string', format: 'email', example: 'juan@example.com' },
          password: { type: 'string', format: 'password', example: 'MiClave123!' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'juan@example.com' },
          password: { type: 'string', format: 'password', example: 'MiClave123!' },
        },
      },
      ServiceInput: {
        type: 'object',
        required: ['nombre', 'descripcion', 'categoriaId', 'locationId', 'telefono', 'usuarioId'],
        properties: {
          nombre: { type: 'string', example: 'Plomería Express' },
          descripcion: { type: 'string', example: 'Servicio de plomería a domicilio 24/7' },
          categoriaId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
          locationId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d2' },
          telefono: { type: 'string', example: '+502 5555-1234' },
          usuarioId: { type: 'integer', example: 1 },
          estado: { type: 'string', enum: ['activo', 'inactivo'], example: 'activo' },
        },
      },
      ReviewInput: {
        type: 'object',
        required: ['servicioId', 'usuarioId', 'calificacion', 'comentario'],
        properties: {
          servicioId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
          usuarioId: { type: 'integer', example: 1 },
          calificacion: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
          comentario: { type: 'string', minLength: 20, maxLength: 1000, example: 'Excelente servicio, muy puntual y profesional.' },
          title: { type: 'string', maxLength: 150, example: 'Gran experiencia' },
          isVerifiedPurchase: { type: 'boolean', example: true },
        },
      },
      ReviewUpdateInput: {
        type: 'object',
        properties: {
          calificacion: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
          comentario: { type: 'string', minLength: 20, example: 'Actualizo mi reseña, sigue siendo excelente.' },
          title: { type: 'string', maxLength: 150, example: 'Título actualizado' },
        },
      },
      ReviewReportInput: {
        type: 'object',
        required: ['usuarioId'],
        properties: {
          usuarioId: { type: 'integer', example: 2 },
        },
      },
      ReviewModerateInput: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['visible', 'hidden', 'flagged'], example: 'hidden' },
        },
      },
      FavoriteInput: {
        type: 'object',
        required: ['usuarioId', 'servicioId'],
        properties: {
          usuarioId: { type: 'integer', example: 1 },
          servicioId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
          notes: { type: 'string', maxLength: 300, example: 'Usar para urgencias los fines de semana' },
          notificationEnabled: { type: 'boolean', example: true },
        },
      },
      FavoriteUpdateInput: {
        type: 'object',
        properties: {
          notes: { type: 'string', maxLength: 300, example: 'Nota actualizada' },
          notificationEnabled: { type: 'boolean', example: false },
        },
      },
      SolicitudInput: {
        type: 'object',
        required: ['servicioId', 'usuarioId'],
        properties: {
          servicioId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
          usuarioId: { type: 'integer', example: 1 },
          descripcion: { type: 'string', example: 'Necesito reparar una tubería rota' },
          fechaSolicitada: { type: 'string', format: 'date-time', example: '2025-12-01T10:00:00Z' },
        },
      },
      CambioEstadoInput: {
        type: 'object',
        required: ['estado'],
        properties: {
          estado: {
            type: 'string',
            enum: ['pendiente', 'aceptado', 'rechazado', 'completado', 'cancelado'],
            example: 'aceptado',
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operación exitosa' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Descripción del error' },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Registro, login y gestión de contraseñas' },
    { name: 'Services', description: 'Gestión de servicios' },
    { name: 'Reviews', description: 'Reseñas, moderación y reportes' },
    { name: 'Favorites', description: 'Favoritos, sugerencias y popularidad' },
    { name: 'Solicitudes', description: 'Solicitudes de servicio y cambio de estado' },
    { name: 'Categories', description: 'Categorías de servicios' },
    { name: 'Locations', description: 'Ubicaciones' },
    { name: 'Tags', description: 'Etiquetas de servicios' },
    { name: 'Badges', description: 'Insignias de usuarios' },
    { name: 'Logs', description: 'Registro de actividad' },
    { name: 'Health', description: 'Estado del servidor' },
  ],
}

const options = {
  swaggerDefinition,
  apis: ['./src/fields/**/*.routes.js', './src/AI/*.routes.js'],
}

export const swaggerSpec = swaggerJSDoc(options)

export const setupSwagger = (app) => {
  app.use('/api-docs', (req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;")
    next()
  })

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'GestionServicios API Docs',
    customCss: `
      .topbar { background-color: #1a1a2e; }
      .topbar-wrapper img { display: none; }
      .topbar-wrapper::after { content: 'GestionServicios API'; color: white; font-size: 1.4rem; font-weight: bold; }
      .swagger-ui .info .title { color: #1a1a2e; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      docExpansion: 'none',
    },
  }))

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })
}
