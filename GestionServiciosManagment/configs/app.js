'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection, connectPostgres, sequelize } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configurations.js';
import { setupSwagger } from './swagger.js';
import locationRoutes from '../src/fields/location/location.routes.js';
import userRoutes from '../src/fields/user/user.routes.js';
import authRoutes from '../src/fields/auth/auth.routes.js';
import servicesRoutes from '../src/fields/services/services.routes.js';
import categoriesRoutes from '../src/fields/categories/categories.routes.js';
import solicitudesRoutes from '../src/fields/solicitudes/solicitudes.routes.js';
import reportesRoutes from '../src/fields/reportes/reportes.routes.js';
import tagRoutes from '../src/fields/tag/tag.routes.js';
import reviewsRoutes from '../src/fields/reviews/reviews.routes.js';
import favoritesRoutes from '../src/fields/favorites/favorites.routes.js';
import badgesRoutes from '../src/fields/badges/badges_routes.js';
import logsRoutes from '../src/fields/logs/logs_routes.js';
import aiRoutes from '../src/AI/ai.routes.js';
import chatRoutes from '../src/fields/chat/chat.routes.js';
import { seedAdmin } from '../seed.js';

const BASE_PATH = '/gestionservicio/v1';

const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(morgan('dev'));
    app.use('/uploads', express.static('./'));
}

const routes = (app) => {
    // ── Swagger UI ──────────────────────────────────────────────────────────
    setupSwagger(app);

    // ── API Routes ──────────────────────────────────────────────────────────
    app.use(`${BASE_PATH}/users`, userRoutes);
    app.use(`${BASE_PATH}/locations`, locationRoutes);
    app.use(`${BASE_PATH}/auth`, authRoutes);
    app.use(`${BASE_PATH}/services`, servicesRoutes);
    app.use(`${BASE_PATH}/categories`, categoriesRoutes);
    app.use(`${BASE_PATH}/solicitudes`, solicitudesRoutes);
    app.use(`${BASE_PATH}/reportes`, reportesRoutes);
    app.use(`${BASE_PATH}/reviews`, reviewsRoutes);
    app.use(`${BASE_PATH}/favorites`, favoritesRoutes);
    app.use(`${BASE_PATH}/tags`, tagRoutes);
    app.use(`${BASE_PATH}/badges`, badgesRoutes);
    app.use(`${BASE_PATH}/logs`, logsRoutes);
    app.use(`${BASE_PATH}/ai`, aiRoutes);
    app.use(`${BASE_PATH}/chat`, chatRoutes);

    /**
     * @swagger
     * /Health:
     *   get:
     *     summary: Estado del servidor
     *     tags: [Health]
     *     responses:
     *       200:
     *         description: Servidor activo
     */
    app.get(`${BASE_PATH}/Health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'Gestion Service Server'
        })
    })

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado en GestionServicios API'
        })
    })
}

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3000;

    app.set('trust proxy', 1);

    try {
        await dbConnection();
        await connectPostgres();
        await sequelize.sync({ alter: true });
        await seedAdmin();

        middlewares(app);
        routes(app);

        app.listen(PORT, () => {
            console.log(`🚀 GestionServicios Server running on port ${PORT}`);
            console.log(`🏥 Health check: http://localhost:${PORT}${BASE_PATH}/Health`);
            console.log(`📄 Swagger UI:   http://localhost:${PORT}/api-docs`);
        });

    } catch (error) {
        console.error(`Error starting Server: ${error.message}`);
        process.exit(1);
    }
};
