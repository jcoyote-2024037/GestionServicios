import dotenv from 'dotenv';
dotenv.config();

export const config = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
    fromEmail: process.env.SMTP_FROM_EMAIL,
    fromName: process.env.SMTP_FROM_NAME || 'Gestión Servicios',
  },
  app: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    port: process.env.PORT || 3006,
  },
};
