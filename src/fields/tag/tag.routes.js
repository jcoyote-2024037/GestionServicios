'use strict';
import { Router } from 'express';
import {
  createTag,
  getTags,
  getTag,
  updateTag,
  deleteTag
} from './tag.controller.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

//obtiene todas las tags activas
router.get(
    '/', 
    validateJWT, 
    getTags
);

//obtiene una tag por id
router.get(
    '/:id', 
    validateJWT, 
    getTag
);

//crea una nueva tag (solo admin)
router.post(
    '/', 
    validateJWT, 
    requireRole('ADMIN_ROLE'), 
    createTag
);

//actualiza una tag por id (solo admin)
router.put(
    '/:id', 
    validateJWT, 
    requireRole('ADMIN_ROLE'), 
    updateTag
);

//elimina una tag por id (solo admin)
router.delete(
    '/:id', 
    validateJWT, 
    requireRole('ADMIN_ROLE'), 
    deleteTag
);

export default router;