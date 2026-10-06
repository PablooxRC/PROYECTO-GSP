import { Router } from "express";
import { isAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../utils/permissions.js";
import { asyncHandler } from "../utils/errorHandler.js";
import {
  inventory,
  listLocations,
  listMaterials,
  listInUse,
  createLocation,
  saveMaterial,
  listRequests,
  createRequest,
  changeRequest,
} from "../controllers/kral.controller.js";
const router = Router();
router.use(isAuth);
router.get("/inventory", asyncHandler(inventory));
router.get("/locations", asyncHandler(listLocations));
router.get("/materials", asyncHandler(listMaterials));
router.get("/in-use", asyncHandler(listInUse));
router.post("/locations", requireAdmin, asyncHandler(createLocation));
router.post("/materials", requireAdmin, asyncHandler(saveMaterial));
router.put("/materials/:id", requireAdmin, asyncHandler(saveMaterial));
router.get("/requests", asyncHandler(listRequests));
router.post("/requests", asyncHandler(createRequest));
router.post("/requests/:id/:action", requireAdmin, asyncHandler(changeRequest));
export default router;
