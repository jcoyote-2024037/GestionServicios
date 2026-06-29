'use strict'

import { Router } from 'express';
import {
  register, login, verifyEmail,
  requestPasswordReset, resetPassword,
  listUsers, resendVerification
} from './auth.controller.js';
import { validateRegister, validateLogin, validateResetPassword } from '../../../middlewares/authValidator.js';
import { rateLimitAuth } from '../../../middlewares/rateLimiter.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Usuario registrado. Se envía email de verificación.
 *       400:
 *         description: Datos inválidos
 *       429:
 *         description: Demasiados intentos
 */
router.post('/register', rateLimitAuth, validateRegister, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login exitoso. Retorna token JWT.
 *       400:
 *         description: Credenciales inválidas
 *       429:
 *         description: Demasiados intentos
 */
router.post('/login', rateLimitAuth, validateLogin, login);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Verificar correo electrónico (vía body)
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verificado
 *   get:
 *     summary: Verificar correo electrónico (vía query param)
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verificado
 */
router.post('/verify-email', verifyEmail);
router.get('/verify-email', verifyEmail);

/**
 * @swagger
 * /auth/request-reset:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@example.com
 *     responses:
 *       200:
 *         description: Correo de recuperación enviado
 */
router.post('/request-reset', requestPasswordReset);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Contraseña restablecida
 *       400:
 *         description: Token inválido o expirado
 */
router.post('/reset-password', validateResetPassword, resetPassword);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Listar todos los usuarios (Admin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       403:
 *         description: Acceso denegado
 */
router.get('/users', validateJWT, requireRole('ADMIN_ROLE'), listUsers);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Reenviar correo de verificación
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Correo reenviado
 */
router.post('/resend-verification', resendVerification);

export default router;