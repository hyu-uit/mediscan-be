import { Request, Response, NextFunction } from "express";
export declare function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): Response;
export declare function notFoundHandler(req: Request, res: Response, _next: NextFunction): Response;
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=error.middleware.d.ts.map