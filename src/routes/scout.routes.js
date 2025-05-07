import {Router} from 'express'
import {createScout, deleteScout, getScouts, getScout, updateScout}  from '../controllers/scout.controller.js'

const router = Router();

router.get('/scouts', getScouts)

router.get('/scout/:id', getScout)

router.post('/scout', createScout )

router.put('/scout/:id', updateScout)

router.delete('/scout/:id', deleteScout)

export default router;
