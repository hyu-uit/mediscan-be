import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return sendError(
        res,
        "email, name, and password are required",
        400,
        req.path
      );
    }

    const result = await authService.register({ email, name, password });
    return sendSuccess(res, result, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "Email already exists") {
      return sendError(res, error.message, 409, req.path);
    }
    console.error("Error registering user:", error);
    return sendError(res, "Failed to register user", 500, req.path);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "email and password are required", 400, req.path);
    }

    const result = await authService.login({ email, password });
    return sendSuccess(res, result);
  } catch (error) {
    if (
      (error instanceof Error && error.message === "User not found") ||
      (error instanceof Error && error.message === "Invalid credentials")
    ) {
      return sendError(res, error.message, 401, req.path);
    }
    console.error("Error logging in:", error);
    return sendError(res, "Failed to login", 500, req.path);
  }
};
