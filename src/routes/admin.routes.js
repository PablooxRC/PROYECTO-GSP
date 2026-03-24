import { Router } from "express";
import { isAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../utils/permissions.js";
import {
  createAdmin,
  listAdmins,
  listDirigentes,
  getDirigente,
  createDirigente,
  updateDirigente,
  deleteDirigente,
  sendReport,
  downloadReport,
  getDirigentesForReport,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(isAuth);
router.use(requireAdmin);

router.post("/", createAdmin);
router.post("/dirigentes", createDirigente);
router.post("/send-report", sendReport);
router.get("/", listAdmins);
router.get("/dirigentes-list", listDirigentes);
router.get("/dirigentes-report", getDirigentesForReport);
router.get("/download-report", downloadReport);
router.get("/dirigentes/:ci", getDirigente);
router.put("/dirigentes/:ci", updateDirigente);
router.delete("/dirigentes/:ci", deleteDirigente);

export default router;
