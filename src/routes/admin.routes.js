import { Router } from 'express'
import { isAuth } from '../middlewares/auth.middleware.js'
import { createAdmin, listAdmins, createDirigente, sendReport } from '../controllers/admin.controller.js'

const router = Router()

router.use(isAuth)

router.post('/', createAdmin)
router.post('/dirigentes', createDirigente)
router.post('/send-report', sendReport)
router.get('/', listAdmins)

export default router
