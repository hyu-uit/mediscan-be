import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JwtPayload } from "../types";
import { JWT_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "../constants";

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void | Response {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.NO_TOKEN,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        timestamp: new Date().toISOString(),
        path: req.path,
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as JwtPayload;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
}

export function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as JwtPayload;

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };
    }

    next();
  } catch {
    next();
  }
}
