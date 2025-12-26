import { Response } from "express";
import { AuthRequest } from "../types";
export declare function createMedication(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getMedications(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateMedication(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteMedication(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=medication.controller.d.ts.map