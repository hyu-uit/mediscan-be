import { Router } from "express";
import * as medicationController from "../controllers/medication.controller";

const router = Router();

router.post("/", medicationController.createMedication);
router.get("/", medicationController.getMedications);
router.patch("/:id", medicationController.updateMedication);
router.delete("/:id", medicationController.deleteMedication);

export default router;
