'use strict'
import { Router } from 'express'
import {
    createTag,
    getTags,
    getTag,
    updateTag,
    deleteTag,
    assignTagToService,
    removeTagFromService,
    getServicesByTag,
    getSuggestedTags,
    getRarelyUsedTags,
    autoSuggestTagsFromDescription
} from './tag.controller.js'
import { validateJWT } from '../../../middlewares/validate_jwt.js'
import { requireRole } from '../../../middlewares/validate_role.js'
import { tagValidator } from '../../../middlewares/tagValidator.js'

const router = Router()

// Obtiene todas las tags activas
router.get(
    '/',
    validateJWT,
    getTags
)

// Etiquetas sugeridas (más usadas)
router.get(
    '/suggestions',
    validateJWT,
    getSuggestedTags
)

// Etiquetas raramente usadas
router.get(
    '/rarely-used',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    getRarelyUsedTags
)

// Sugerir etiquetas desde descripción
router.post(
    '/auto-suggest',
    validateJWT,
    autoSuggestTagsFromDescription
)

// Obtiene una tag por id
router.get(
    '/:id',
    validateJWT,
    getTag
)

// Crea una nueva tag (solo admin)
router.post(
    '/',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    tagValidator,
    createTag
)

// Actualiza una tag (solo admin)
router.put(
    '/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    tagValidator,
    updateTag
)

// Elimina una tag (solo admin)
router.delete(
    '/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    deleteTag
)

// Asigna una tag a un servicio
router.post(
    '/:id/assign',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    assignTagToService
)

// Quita una tag de un servicio
router.delete(
    '/:id/remove',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    removeTagFromService
)

// Servicios que usan esta tag
router.get(
    '/:id/services',
    validateJWT,
    getServicesByTag
)

export default router