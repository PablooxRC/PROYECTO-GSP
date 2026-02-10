import { Router } from 'express'
import { isAuth } from '../middlewares/auth.middleware.js'
import { validateSchema } from '../middlewares/validate.middleware.js'
import { createRegistroSchema, updateRegistroSchema } from '../schemas/registro.schema.js'
import {
    getRegistros,
    getUnidades,
    getRegistrosByScout,
    getRegistro,
    createRegistro,
    updateRegistro,
    deleteRegistro
} from '../controllers/registro.controller.js'

const router = Router()

// Todos los endpoints requieren autenticación
router.use(isAuth)

// Obtener unidades (para filtro)
router.get('/unidades', getUnidades)

// Obtener todos los registros del dirigente
router.get('/', getRegistros)

// Obtener registros de un scout específico
router.get('/scout/:scout_ci', getRegistrosByScout)

// Obtener un registro específico
router.get('/:id', getRegistro)

// Crear nuevo registro
router.post('/', validateSchema(createRegistroSchema), createRegistro)

// Actualizar registro
router.put('/:id', validateSchema(updateRegistroSchema), updateRegistro)

// Eliminar registro
router.delete('/:id', deleteRegistro)

export default router
