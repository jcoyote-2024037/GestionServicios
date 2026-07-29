import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { dbConnection, connectPostgres, sequelize } from './db.js'
import { corsOptions } from './cors-configuration.js'
import { helmetConfiguration } from './helmet-configurations.js'
import { setupSocket } from './socket.js'
import { setupSwagger } from './swagger.js'
import locationRoutes from '../src/fields/location/location.routes.js'
import userRoutes from '../src/fields/user/user.routes.js'
import authRoutes from '../src/fields/auth/auth.routes.js'
import servicesRoutes from '../src/fields/services/services.routes.js'
import categoriesRoutes from '../src/fields/categories/categories.routes.js'
import solicitudesRoutes from '../src/fields/solicitudes/solicitudes.routes.js'
import reportesRoutes from '../src/fields/reportes/reportes.routes.js'
import tagRoutes from '../src/fields/tag/tag.routes.js'
import reviewsRoutes from '../src/fields/reviews/reviews.routes.js'
import favoritesRoutes from '../src/fields/favorites/favorites.routes.js'
import badgesRoutes from '../src/fields/badges/badges_routes.js'
import logsRoutes from '../src/fields/logs/logs_routes.js'
import aiRoutes from '../src/AI/ai.routes.js'
import chatRoutes from '../src/fields/chat/chat.routes.js'
import notificationRoutes from '../src/fields/notifications/notification.routes.js'
import { seedAdmin } from '../seed.js'

const BASE_PATH = '/gestionservicio/v1'

const middlewares = (app) => {
  app.use(compression())
  app.use(express.urlencoded({ extended: false, limit: '10mb' }))
  app.use(express.json({ limit: '10mb' }))
  app.use(cors(corsOptions))
  app.use(helmet(helmetConfiguration))
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
  app.use('/uploads', express.static('./'))
}

const routes = (app) => {
  setupSwagger(app)

  app.use(`${BASE_PATH}/users`, userRoutes)
  app.use(`${BASE_PATH}/locations`, locationRoutes)
  app.use(`${BASE_PATH}/auth`, authRoutes)
  app.use(`${BASE_PATH}/services`, servicesRoutes)
  app.use(`${BASE_PATH}/categories`, categoriesRoutes)
  app.use(`${BASE_PATH}/solicitudes`, solicitudesRoutes)
  app.use(`${BASE_PATH}/reportes`, reportesRoutes)
  app.use(`${BASE_PATH}/reviews`, reviewsRoutes)
  app.use(`${BASE_PATH}/favorites`, favoritesRoutes)
  app.use(`${BASE_PATH}/tags`, tagRoutes)
  app.use(`${BASE_PATH}/badges`, badgesRoutes)
  app.use(`${BASE_PATH}/logs`, logsRoutes)
  app.use(`${BASE_PATH}/ai`, aiRoutes)
  app.use(`${BASE_PATH}/chat`, chatRoutes)
  app.use(`${BASE_PATH}/notifications`, notificationRoutes)

  app.get(`${BASE_PATH}/Health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      service: 'Gestion Service Server',
      uptime: process.uptime(),
    })
  })

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint no encontrado en GestionServicios API',
    })
  })
}

export const initServer = async () => {
  const app = express()
  const PORT = process.env.PORT || 3006

  app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1)

  try {
    middlewares(app)
    routes(app)

    const httpServer = createServer(app)
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      },
    })
    setupSocket(io)
    app.set('io', io)

    await dbConnection()
    await connectPostgres()
    await sequelize.sync({ alter: true })
    await seedAdmin()

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 GestionServicios Server running on port ${PORT}`)
      console.log(`🏥 Health check: ${BASE_PATH}/Health`)
      console.log(`📄 Swagger UI: /api-docs`)
    })

  } catch (error) {
    console.error(`Error starting Server: ${error.message}`)
    process.exit(1)
  }
}
