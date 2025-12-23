import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as medicationService from "../services/medication.service";

export const createMedication = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, dosage, instructions } = req.body;

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const medication = await medicationService.createMedication({
      userId,
      name,
      dosage,
      instructions,
    });

    return res.status(201).json(medication);
  } catch (error) {
    console.error("Error creating medication:", error);
    return res.status(500).json({ error: "Failed to create medication" });
  }
};

export const getMedications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const medications = await medicationService.getMedications(userId);
    return res.json(medications);
  } catch (error) {
    console.error("Error fetching medications:", error);
    return res.status(500).json({ error: "Failed to fetch medications" });
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

    return res.json(medication);
  } catch (error) {
    console.error("Error updating medication:", error);
    return res.status(500).json({ error: "Failed to update medication" });
  }
};

export const deleteMedication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await medicationService.deleteMedication(id);
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting medication:", error);
    return res.status(500).json({ error: "Failed to delete medication" });
  }
};
