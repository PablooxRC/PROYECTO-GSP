import Router from 'express-promise-router'
import {createScout, deleteScout, getScouts, getScout, updateScout}  from '../controllers/scout.controller.js'

import { isAuth } from '../middlewares/auth.middleware.js';
const router = Router();

router.get('/scouts', isAuth, getScouts)

router.get('/scout/:ci',isAuth, getScout)

router.post('/scout',isAuth, createScout )

router.put('/scout/:ci',isAuth, updateScout)

router.delete('/scout/:ci',isAuth, deleteScout)

export default router;
