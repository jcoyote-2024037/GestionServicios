'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection, connectPostgres, sequelize } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configurations.js';
import locationRoutes from '../src/fields/location/location.routes.js';
import userRoutes from '../src/fields/user/user.routes.js'; 
import authRoutes from '../src/fields/auth/auth.routes.js';
import servicesRoutes from '../src/fields/services/services.routes.js';
import categoriesRoutes from '../src/fields/categories/categories.routes.js';
import solicitudesRoutes from '../src/fields/solicitudes/solicitudes.routes.js';
import reportesRoutes   from '../src/fields/reportes/reportes.routes.js';
import tagRoutes from '../src/fields/tag/tag.routes.js';
import reviewsRoutes from '../src/fields/reviews/reviews.routes.js';
import favoritesRoutes from '../src/fields/favorites/favorites.routes.js';


const BASE_PATH = '/gestionservicio/v1';

const middlewares = (app) => {
    app.use(express.urlencoded({extended: false, limit: '10mb'}));
    app.use(express.json({ limit: '10mb'}));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(morgan('dev'));

    app.use('/uploads', express.static('./')); 
    
}

const routes = (app) => {
    app.use(`${BASE_PATH}/users`, userRoutes);
    app.use(`${BASE_PATH}/locations`, locationRoutes);
    app.use(`${BASE_PATH}/auth`, authRoutes);
    app.use(`${BASE_PATH}/services`, servicesRoutes);
    app.use(`${BASE_PATH}/categories`, categoriesRoutes);
    app.use(`${BASE_PATH}/solicitudes`, solicitudesRoutes);
    app.use(`${BASE_PATH}/reportes`,    reportesRoutes);
    app.use(`${BASE_PATH}/reviews`, reviewsRoutes);
    app.use(`${BASE_PATH}/favorites`, favoritesRoutes);
    app.use(`${BASE_PATH}/tags`, tagRoutes);




    app.get(`${BASE_PATH}/Health`, (request, response) => {
        response.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'Gestion Service Server'
        })
    })

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado en Restaurant API'
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

        middlewares(app);
        routes(app);

        app.listen(PORT, () => {
            console.log(`Restaurant Server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/Health`);
        });

    } catch (error) {
        console.error(`Error starting Server: ${error.message}`);
        process.exit(1);
    }
};

