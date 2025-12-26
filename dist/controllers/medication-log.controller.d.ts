import { Response } from "express";
import { AuthRequest } from "../types";
export declare function markTaken(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function skip(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getLogs(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getStats(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getHistory(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=medication-log.controller.d.ts.map