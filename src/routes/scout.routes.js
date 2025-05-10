import Router from 'express-promise-router'
import {createScout, deleteScout, getScouts, getScout, updateScout}  from '../controllers/scout.controller.js'

const router = Router();

router.get('/scouts', getScouts)

router.get('/scout/:ci', getScout)

router.post('/scout', createScout )

router.put('/scout/:ci', updateScout)

router.delete('/scout/:ci', deleteScout)

export default router;
