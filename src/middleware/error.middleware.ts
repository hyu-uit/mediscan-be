import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { HTTP_STATUS } from "../constants";

interface ErrorResponse {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  stack?: string;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  console.error("❌ Error:", err.message);

  const response: ErrorResponse = {
    success: false,
    message: err.message || "Internal server error",
    statusCode:
      err instanceof AppError ? err.statusCode : HTTP_STATUS.INTERNAL_ERROR,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  return res.status(response.statusCode).json(response);
}

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: HTTP_STATUS.NOT_FOUND,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
