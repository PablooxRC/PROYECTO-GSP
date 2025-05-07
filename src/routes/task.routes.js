import {Router} from 'express'

const router = Router();

router.get('/scouts', (req, res) => res.send ('obteniendo scouts'))

router.get('/scouts/:id', (req, res) => res.send ('obteniendo scout'))

router.post('/scouts', (req, res) => res.send ('crando scout'))

router.put('/scouts/:id', (req, res) => res.send ('actualizando scout'))

router.delete('/scouts/:id', (req, res) => res.send ('eliminando scout'))

export default router;
