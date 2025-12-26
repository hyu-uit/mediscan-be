import { Response } from "express";
import { AuthRequest } from "../types";
export declare function getUserSettings(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createUserSettings(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateUserSettings(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function upsertUserSettings(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteUserSettings(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function registerFcmToken(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function togglePushNotifications(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function toggleAutomatedCalls(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function toggleDarkMode(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=user-settings.controller.d.ts.map