import { Response } from "express";
import { AuthRequest } from "../types";
export declare function createBulkMedicationsWithSchedules(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createSchedule(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getSchedulesByMedication(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateSchedule(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteSchedule(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getTodaySchedule(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getScheduleByDate(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=schedule.controller.d.ts.map