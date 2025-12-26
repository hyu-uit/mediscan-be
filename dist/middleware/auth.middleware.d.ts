import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void | Response;
export declare function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map