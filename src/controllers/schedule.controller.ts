import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as scheduleService from "../services/schedule.service";

export const createSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { medicationId, timeSlot, customTime } = req.body;

    if (!medicationId || !timeSlot) {
      return res
        .status(400)
        .json({ error: "medicationId and timeSlot are required" });
    }

    const schedule = await scheduleService.createSchedule({
      medicationId,
      timeSlot,
      customTime,
    });

    return res.status(201).json(schedule);
  } catch (error) {
    console.error("Error creating schedule:", error);
    return res.status(500).json({ error: "Failed to create schedule" });
  }
};

export const getSchedulesByMedication = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { medicationId } = req.params;

    const schedules = await scheduleService.getSchedulesByMedication(
      medicationId
    );
    return res.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return res.status(500).json({ error: "Failed to fetch schedules" });
  }
};

export const updateSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { timeSlot, customTime, isActive } = req.body;

    const schedule = await scheduleService.updateSchedule(id, {
      timeSlot,
      customTime,
      isActive,
    });

    return res.json(schedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return res.status(500).json({ error: "Failed to update schedule" });
  }
};

export const deleteSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await scheduleService.deleteSchedule(id);
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return res.status(500).json({ error: "Failed to delete schedule" });
  }
};
