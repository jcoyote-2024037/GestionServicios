'use strict'

import { Router } from 'express';
import {
    createUser,
    getUsers,
    updateUser,
    deleteUser,
    confirmDeleteAdmin
} from './user.controller.js';

import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

router.post('/create', validateJWT, requireRole('ADMIN_ROLE'), createUser);
router.get('/', validateJWT, getUsers);
router.put('/:id', validateJWT,  updateUser);
router.delete('/:id', validateJWT, deleteUser);
router.get('/confirm-delete', validateJWT, confirmDeleteAdmin);

export default router;