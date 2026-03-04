'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection, connectPostgres, sequelize } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configurations.js';

import userRoutes from '../src/fields/user/user.routes.js'; 
import authRoutes from '../src/fields/auth/auth.routes.js';

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
    // APS USE
    app.use(`${BASE_PATH}/users`, userRoutes);
    app.use(`${BASE_PATH}/auth`, authRoutes);



    app.get(`${BASE_PATH}/Health`, (request, response) => {
        response.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'Gestion Service Server'
        })
    })

    // Manejo de errores 404
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

