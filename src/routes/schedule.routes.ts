import { Router } from "express";
import * as scheduleController from "../controllers/schedule.controller";

const router = Router();

router.post("/", scheduleController.createSchedule);
router.get(
  "/medication/:medicationId",
  scheduleController.getSchedulesByMedication
);
router.patch("/:id", scheduleController.updateSchedule);
router.delete("/:id", scheduleController.deleteSchedule);

export default router;
