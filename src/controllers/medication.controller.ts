import { Request, Response } from "express";
import * as medicationService from "../services/medication.service";

export const createMedication = async (req: Request, res: Response) => {
  try {
    const { userId, name, dosage, instructions } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ error: "userId and name are required" });
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

export const getMedications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }

    const medications = await medicationService.getMedications(userId);
    return res.json(medications);
  } catch (error) {
    console.error("Error fetching medications:", error);
    return res.status(500).json({ error: "Failed to fetch medications" });
  }
};

export const updateMedication = async (req: Request, res: Response) => {
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

export const deleteMedication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await medicationService.deleteMedication(id);
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting medication:", error);
    return res.status(500).json({ error: "Failed to delete medication" });
  }
};
