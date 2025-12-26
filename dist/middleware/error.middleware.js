"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
exports.asyncHandler = asyncHandler;
const errors_1 = require("../utils/errors");
const constants_1 = require("../constants");
function errorHandler(err, req, res, _next) {
    console.error("❌ Error:", err.message);
    const response = {
        success: false,
        message: err.message || "Internal server error",
        statusCode: err instanceof errors_1.AppError ? err.statusCode : constants_1.HTTP_STATUS.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
        path: req.path,
    };
    if (process.env.NODE_ENV !== "production") {
        response.stack = err.stack;
    }
    return res.status(response.statusCode).json(response);
}
function notFoundHandler(req, res, _next) {
    return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
        statusCode: constants_1.HTTP_STATUS.NOT_FOUND,
        timestamp: new Date().toISOString(),
        path: req.path,
    });
}
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
//# sourceMappingURL=error.middleware.js.map