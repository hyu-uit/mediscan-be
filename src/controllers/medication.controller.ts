import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as medicationService from "../services/medication.service";
import { sendSuccess, sendError } from "../utils/response";
import {
  FrequencyType,
  DosageUnit,
  IntervalUnit,
  TimeSlot,
} from "@prisma/client";

// Map frontend values to Prisma enums
const frequencyTypeMap: Record<string, FrequencyType> = {
  daily: "DAILY",
  interval: "INTERVAL",
  "specific-days": "SPECIFIC_DAYS",
};

const dosageUnitMap: Record<string, DosageUnit> = {
  mg: "MG",
  ml: "ML",
  IU: "IU",
  tablet: "TABLET",
  capsule: "CAPSULE",
  drops: "DROPS",
  tsp: "TSP",
  tbsp: "TBSP",
};

const intervalUnitMap: Record<string, IntervalUnit> = {
  days: "DAYS",
  weeks: "WEEKS",
  months: "MONTHS",
};

const timeSlotMap: Record<string, TimeSlot> = {
  morning: "MORNING",
  noon: "NOON",
  afternoon: "AFTERNOON",
  night: "NIGHT",
  before_sleep: "BEFORE_SLEEP",
};

// Transform intakeTimes to use TimeSlot values
const mapIntakeTimes = (
  intakeTimes?: { id: string; time: string; type: string }[]
) => {
  if (!intakeTimes) return undefined;
  return intakeTimes.map((intake) => ({
    id: intake.id,
    time: intake.time,
    type: timeSlotMap[intake.type] || intake.type.toUpperCase(),
  }));
};

export const createMedication = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      name,
      dosage,
      unit,
      instructions,
      notes,
      frequencyType,
      intervalValue,
      intervalUnit,
      selectedDays,
      intakeTimes,
    } = req.body;

    if (!name) {
      return sendError(res, "name is required", 400, req.path);
    }

    const medication = await medicationService.createMedication({
      userId,
      name,
      dosage,
      unit: unit ? dosageUnitMap[unit] : undefined,
      instructions,
      notes,
      frequencyType: frequencyType
        ? frequencyTypeMap[frequencyType]
        : undefined,
      intervalValue: intervalValue ? parseInt(intervalValue, 10) : undefined,
      intervalUnit: intervalUnit ? intervalUnitMap[intervalUnit] : undefined,
      selectedDays,
      intakeTimes: mapIntakeTimes(intakeTimes),
    });

    return sendSuccess(res, medication, 201);
  } catch (error) {
    console.error("Error creating medication:", error);
    return sendError(res, "Failed to create medication", 500, req.path);
  }
};

export const getMedications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const medications = await medicationService.getMedications(userId);
    return sendSuccess(res, medications);
  } catch (error) {
    console.error("Error fetching medications:", error);
    return sendError(res, "Failed to fetch medications", 500, req.path);
  }
};

export const updateMedication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      dosage,
      unit,
      instructions,
      notes,
      frequencyType,
      intervalValue,
      intervalUnit,
      selectedDays,
      intakeTimes,
      imageUrl,
      isActive,
    } = req.body;

    const medication = await medicationService.updateMedication(id, {
      name,
      dosage,
      unit: unit ? dosageUnitMap[unit] : undefined,
      instructions,
      notes,
      frequencyType: frequencyType
        ? frequencyTypeMap[frequencyType]
        : undefined,
      intervalValue: intervalValue ? parseInt(intervalValue, 10) : undefined,
      intervalUnit: intervalUnit ? intervalUnitMap[intervalUnit] : undefined,
      selectedDays,
      intakeTimes: mapIntakeTimes(intakeTimes),
      imageUrl,
      isActive,
    });

    return sendSuccess(res, medication);
  } catch (error) {
    console.error("Error updating medication:", error);
    return sendError(res, "Failed to update medication", 500, req.path);
  }
};

export const deleteMedication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await medicationService.deleteMedication(id);
    return sendSuccess(res, null, 204);
  } catch (error) {
    console.error("Error deleting medication:", error);
    return sendError(res, "Failed to delete medication", 500, req.path);
  }
};
