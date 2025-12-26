"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.optionalAuthMiddleware = optionalAuthMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../constants");
function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: constants_1.ERROR_MESSAGES.NO_TOKEN,
                statusCode: constants_1.HTTP_STATUS.UNAUTHORIZED,
                timestamp: new Date().toISOString(),
                path: req.path,
            });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, constants_1.JWT_CONFIG.SECRET);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
        };
        next();
    }
    catch {
        return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: constants_1.ERROR_MESSAGES.INVALID_TOKEN,
            statusCode: constants_1.HTTP_STATUS.UNAUTHORIZED,
            timestamp: new Date().toISOString(),
            path: req.path,
        });
    }
}
function optionalAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const decoded = jsonwebtoken_1.default.verify(token, constants_1.JWT_CONFIG.SECRET);
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
            };
        }
        next();
    }
    catch {
        next();
    }
}
//# sourceMappingURL=auth.middleware.js.map