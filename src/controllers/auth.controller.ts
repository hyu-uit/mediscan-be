import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res
        .status(400)
        .json({ error: "email, name, and password are required" });
    }

    const result = await authService.register({ email, name, password });
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Email already exists") {
      return res.status(409).json({ error: error.message });
    }
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Failed to register user" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const result = await authService.login({ email, password });
    return res.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid credentials") {
      return res.status(401).json({ error: error.message });
    }
    console.error("Error logging in:", error);
    return res.status(500).json({ error: "Failed to login" });
  }
};
