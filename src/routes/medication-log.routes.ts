import { Router } from "express";
import * as medicationLogController from "../controllers/medication-log.controller";

const router = Router();

router.get("/", medicationLogController.getLogs);
router.get("/stats", medicationLogController.getStats);
router.get("/history", medicationLogController.getHistory);
router.post("/:id/taken", medicationLogController.markTaken);
router.post("/:id/skip", medicationLogController.skip);

export default router;
