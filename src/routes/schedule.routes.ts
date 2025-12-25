import { Router } from "express";
import * as scheduleController from "../controllers/schedule.controller";

const router = Router();

router.get("/today", scheduleController.getTodaySchedule);
router.get("/date/:date", scheduleController.getScheduleByDate);
router.post("/bulk", scheduleController.createBulkMedicationsWithSchedules);
router.post("/", scheduleController.createSchedule);
router.get(
  "/medication/:medicationId",
  scheduleController.getSchedulesByMedication
);
router.patch("/:id", scheduleController.updateSchedule);
router.delete("/:id", scheduleController.deleteSchedule);

export default router;
