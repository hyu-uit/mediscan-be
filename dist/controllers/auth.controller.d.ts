import { Request, Response } from "express";
import { AuthRequest } from "../types";
export declare function register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getMe(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map