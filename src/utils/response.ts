import { Response } from "express";

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  statusCode: number;
  success: boolean;
  data: T;
}

/**
 * Standard API error response
 */
export interface ApiError {
  success: boolean;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  statusCode: number;
  translation: string;
}

/**
 * Base list response
 */
export interface BaseListDto<T = unknown> {
  data: T[];
  total: number;
  totalPage: number;
}

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    statusCode,
    success: true,
    data,
  };
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  path: string = "",
  translation: string = ""
): Response => {
  const response: ApiError = {
    success: false,
    message,
    error: message,
    timestamp: new Date().toISOString(),
    path,
    statusCode,
    translation: translation || message,
  };
  return res.status(statusCode).json(response);
};

/**
 * Send list response with pagination
 */
export const sendList = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 10
): Response => {
  const totalPage = Math.ceil(total / limit);
  const response: ApiResponse<BaseListDto<T>> = {
    statusCode: 200,
    success: true,
    data: {
      data,
      total,
      totalPage,
    },
  };
  return res.status(200).json(response);
};
