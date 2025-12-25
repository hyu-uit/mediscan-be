import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response";
import { HTTP_STATUS } from "../constants";
import { AppError } from "../utils/errors";

export async function register(req: Request, res: Response) {
  try {
    const { email, name, password } = req.body;
    const result = await authService.register({ email, name, password });
    return sendSuccess(res, result, HTTP_STATUS.CREATED);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error registering user:", error);
    return sendError(res, "Failed to register user", HTTP_STATUS.INTERNAL_ERROR, req.path);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return sendSuccess(res, result, HTTP_STATUS.OK);
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, req.path);
    }
    console.error("Error logging in:", error);
    return sendError(res, "Failed to login", HTTP_STATUS.INTERNAL_ERROR, req.path);
  }
}
