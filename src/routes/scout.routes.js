import Router from 'express-promise-router'
import {createScout, deleteScout, getScouts, getScoutsAdmin, getScout, updateScout}  from '../controllers/scout.controller.js'

import { isAuth } from '../middlewares/auth.middleware.js';
import { validateSchema } from '../middlewares/validate.middleware.js';
import { createScoutSchema, updateScoutSchema} from '../schemas/scout.schema.js';
const router = Router();

router.get('/scouts/admin/all', isAuth, getScoutsAdmin)

router.get('/scouts', isAuth, getScouts)

router.get('/scout/:ci',isAuth, getScout)

router.post('/scout',isAuth, validateSchema(createScoutSchema), createScout )

router.put('/scout/:ci',isAuth, validateSchema(updateScoutSchema), updateScout)

router.delete('/scout/:ci',isAuth, deleteScout)

export default router;
