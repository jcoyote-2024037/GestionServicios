'use strict'
import { BADGE_TYPES } from '../src/fields/badges/badges_model.js'

// Validaciones para POST /badges
export const badgeCreateValidator = (req, res, next) => {
  const { name, criteria, badgeType, priority, expiresAt } = req.body

  if (!name || typeof name !== 'string' || name.trim().length === 0)
    return res.status(400).json({ success: false, message: 'El nombre de la insignia es obligatorio.' })

  if (name.length > 100)
    return res.status(400).json({ success: false, message: 'El nombre no puede superar 100 caracteres.' })

  if (!badgeType || !BADGE_TYPES.includes(badgeType))
    return res.status(400).json({ success: false, message: `badgeType es obligatorio. Valores permitidos: ${BADGE_TYPES.join(', ')}.` })

  if (criteria === undefined || criteria === null)
    return res.status(400).json({ success: false, message: 'El campo criteria es obligatorio.' })

  if (typeof criteria !== 'object' || Array.isArray(criteria))
    return res.status(400).json({ success: false, message: 'criteria debe ser un objeto JSON valido, no un array ni un primitivo.' })

  // Verificar que criteria no sea demasiado grande (max 2kb)
  const criteriaSize = Buffer.byteLength(JSON.stringify(criteria), 'utf8')
  if (criteriaSize > 2048)
    return res.status(400).json({ success: false, message: 'El objeto criteria no puede superar 2kb.' })

  if (priority !== undefined) {
    if (!Number.isInteger(priority) || priority < 1 || priority > 100)
      return res.status(400).json({ success: false, message: 'priority debe ser un entero entre 1 y 100.' })
  }

  if (expiresAt !== undefined && expiresAt !== null) {
    const date = new Date(expiresAt)
    if (isNaN(date.getTime()))
      return res.status(400).json({ success: false, message: 'expiresAt no es una fecha valida.' })
    if (date <= new Date())
      return res.status(400).json({ success: false, message: 'expiresAt debe ser una fecha futura.' })
  }

  next()
}

// Validaciones para PUT /badges/:id
export const badgeUpdateValidator = (req, res, next) => {
  const { name, criteria, badgeType, priority, expiresAt } = req.body

  const allowedFields = ['name', 'description', 'criteria', 'badgeType', 'icon', 'priority', 'autoAssign', 'expiresAt']
  const sentFields = Object.keys(req.body)

  if (sentFields.length === 0)
    return res.status(400).json({ success: false, message: 'Debe enviar al menos un campo para actualizar.' })

  const invalidFields = sentFields.filter(f => !allowedFields.includes(f))
  if (invalidFields.length > 0)
    return res.status(400).json({ success: false, message: `Campos no permitidos: ${invalidFields.join(', ')}.` })

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0)
      return res.status(400).json({ success: false, message: 'El nombre no puede estar vacio.' })
    if (name.length > 100)
      return res.status(400).json({ success: false, message: 'El nombre no puede superar 100 caracteres.' })
  }

  if (badgeType !== undefined && !BADGE_TYPES.includes(badgeType))
    return res.status(400).json({ success: false, message: `badgeType invalido. Valores permitidos: ${BADGE_TYPES.join(', ')}.` })

  if (criteria !== undefined) {
    if (typeof criteria !== 'object' || Array.isArray(criteria) || criteria === null)
      return res.status(400).json({ success: false, message: 'criteria debe ser un objeto JSON valido.' })

    const criteriaSize = Buffer.byteLength(JSON.stringify(criteria), 'utf8')
    if (criteriaSize > 2048)
      return res.status(400).json({ success: false, message: 'El objeto criteria no puede superar 2kb.' })
  }

  if (priority !== undefined) {
    if (!Number.isInteger(priority) || priority < 1 || priority > 100)
      return res.status(400).json({ success: false, message: 'priority debe ser un entero entre 1 y 100.' })
  }

  if (expiresAt !== undefined && expiresAt !== null) {
    const date = new Date(expiresAt)
    if (isNaN(date.getTime()))
      return res.status(400).json({ success: false, message: 'expiresAt no es una fecha valida.' })
    if (date <= new Date())
      return res.status(400).json({ success: false, message: 'expiresAt debe ser una fecha futura.' })
  }

  next()
}