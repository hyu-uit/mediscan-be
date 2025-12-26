"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendList = exports.sendError = exports.sendSuccess = void 0;
/**
 * Send success response
 */
const sendSuccess = (res, data, statusCode = 200) => {
    const response = {
        statusCode,
        success: true,
        data,
    };
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
/**
 * Send error response
 */
const sendError = (res, message, statusCode = 500, path = "", translation = "") => {
    const response = {
        success: false,
        message,
        error: message,
        timestamp: new Date().toISOString(),
        path,
        statusCode,
        translation: translation || message,
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
/**
 * Send list response with pagination
 */
const sendList = (res, data, total, page = 1, limit = 10) => {
    const totalPage = Math.ceil(total / limit);
    const response = {
        statusCode: 200,
        success: true,
        data: {
            data,
            total,
            totalPage,
        },
    };
    return res.status(200).json(response);
};
exports.sendList = sendList;
//# sourceMappingURL=response.js.map