import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as medicationService from "../services/medication.service";
import { sendSuccess, sendError } from "../utils/response";

export const createMedication = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, dosage, instructions } = req.body;

    if (!name) {
      return sendError(res, "name is required", 400, req.path);
    }

    const medication = await medicationService.createMedication({
      userId,
      name,
      dosage,
      instructions,
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
    const { name, dosage, instructions, imageUrl, isActive } = req.body;

    const medication = await medicationService.updateMedication(id, {
      name,
      dosage,
      instructions,
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
