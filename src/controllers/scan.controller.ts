import { Response } from "express";
import { AuthRequest } from "../types";
import * as scanService from "../services/scan.service";
import { sendSuccess, sendError } from "../utils/response";
import { HTTP_STATUS } from "../constants";

export async function scanDocument(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return sendError(
        res,
        "No file uploaded. Please upload an image.",
        HTTP_STATUS.BAD_REQUEST,
        req.path
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return sendError(
        res,
        "Invalid file type. Please upload a JPEG, PNG, or WebP image.",
        HTTP_STATUS.BAD_REQUEST,
        req.path
      );
    }

    const result = await scanService.scanDocument(req.file);
    return sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    console.error("Error scanning document:", error);
    const message =
      error instanceof Error ? error.message : "Failed to scan document";
    return sendError(res, message, HTTP_STATUS.INTERNAL_ERROR, req.path);
  }
}
