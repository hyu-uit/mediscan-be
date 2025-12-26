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
export declare const sendSuccess: <T>(res: Response, data: T, statusCode?: number) => Response;
/**
 * Send error response
 */
export declare const sendError: (res: Response, message: string, statusCode?: number, path?: string, translation?: string) => Response;
/**
 * Send list response with pagination
 */
export declare const sendList: <T>(res: Response, data: T[], total: number, page?: number, limit?: number) => Response;
//# sourceMappingURL=response.d.ts.map