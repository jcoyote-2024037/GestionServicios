'use strict'
import { query } from 'express-validator'
import { handleValidationErrors } from './handle_validation_errors.js'

export const logQueryValidator = [
  query('userId')
    .optional()
    .isMongoId().withMessage('El userId no es un ID válido.'),

  query('action')
    .optional()
    .isLength({ max: 100 }).withMessage('La acción no puede superar 100 caracteres.')
    .trim(),

  query('affectedEntity')
    .optional()
    .isLength({ max: 100 }).withMessage('La entidad afectada no puede superar 100 caracteres.')
    .trim(),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un número entero mayor a 0.'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser entre 1 y 100.'),

  handleValidationErrors
]