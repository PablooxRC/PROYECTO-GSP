import { Router } from 'express'
import { isAuth } from '../middlewares/auth.middleware.js'
import { createAdmin, listAdmins, listDirigentes, createDirigente, updateDirigente, deleteDirigente, sendReport } from '../controllers/admin.controller.js'

const router = Router()

router.use(isAuth)

router.post('/', createAdmin)
router.post('/dirigentes', createDirigente)
router.post('/send-report', sendReport)
router.get('/', listAdmins)
router.get('/dirigentes-list', listDirigentes)
router.put('/dirigentes/:ci', updateDirigente)
router.delete('/dirigentes/:ci', deleteDirigente)

export default router
