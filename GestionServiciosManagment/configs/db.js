import mongoose from 'mongoose'
import { Sequelize } from 'sequelize'

const URI_MONGO = process.env.MONGODB_URI || process.env.URI_MONGO

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
)

export const connectPostgres = async () => {
  try {
    await sequelize.authenticate()
    console.log('PostgreSQL | Conectado correctamente')
  } catch (error) {
    console.error('PostgreSQL | Error de conexión:', error.message)
  }
}

export const dbConnection = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB | Conectado correctamente')
    })

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB | Error de conexión:', err.message)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB | Desconectado, intentando reconectar...')
    })

    await mongoose.connect(URI_MONGO, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    })

  } catch (error) {
    console.error(`Error al conectar MongoDB: ${error.message}`)
    process.exit(1)
  }
}

const gracefulShutdown = async (signal) => {
  console.log(`Recibido ${signal}. Cerrando conexiones...`)
  await mongoose.connection.close()
  await sequelize.close()
  process.exit(0)
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'))
