import { Router } from "express";
import { isAuth } from "../middlewares/auth.middleware.js";
import {
  getPadronByCi,
  listPadron,
  createPadron,
  updatePadron,
  deletePadron,
} from "../controllers/padron.controller.js";

const router = Router();

router.use(isAuth);

router.get("/", listPadron);
router.get("/:ci", getPadronByCi);
router.post("/", createPadron);
router.put("/:ci", updatePadron);
router.delete("/:ci", deletePadron);

export default router;
