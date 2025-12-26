"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.markTaken = markTaken;
exports.skip = skip;
exports.getLogs = getLogs;
exports.getStats = getStats;
exports.getHistory = getHistory;
const medicationLogService = __importStar(require("../services/medication-log.service"));
const response_1 = require("../utils/response");
const constants_1 = require("../constants");
const errors_1 = require("../utils/errors");
async function markTaken(req, res) {
    try {
        const { id } = req.params;
        const log = await medicationLogService.markMedicationTaken(id);
        return (0, response_1.sendSuccess)(res, log, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error marking medication as taken:", error);
        return (0, response_1.sendError)(res, "Failed to mark medication as taken", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function skip(req, res) {
    try {
        const { id } = req.params;
        const log = await medicationLogService.skipMedication(id);
        return (0, response_1.sendSuccess)(res, log, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error skipping medication:", error);
        return (0, response_1.sendError)(res, "Failed to skip medication", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function getLogs(req, res) {
    try {
        const userId = req.user.userId;
        const { date } = req.query;
        const targetDate = date ? new Date(date) : undefined;
        const logs = await medicationLogService.getMedicationLogs(userId, targetDate);
        return (0, response_1.sendSuccess)(res, logs, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error fetching medication logs:", error);
        return (0, response_1.sendError)(res, "Failed to fetch medication logs", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function getStats(req, res) {
    try {
        const userId = req.user.userId;
        const { period } = req.query;
        if (!period || !["daily", "weekly", "monthly"].includes(period)) {
            return (0, response_1.sendError)(res, "period query parameter is required (daily, weekly, or monthly)", constants_1.HTTP_STATUS.BAD_REQUEST, req.path);
        }
        const stats = await medicationLogService.getIntakeStats(userId, period);
        return (0, response_1.sendSuccess)(res, stats, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error fetching intake stats:", error);
        return (0, response_1.sendError)(res, "Failed to fetch intake stats", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function getHistory(req, res) {
    try {
        const userId = req.user.userId;
        const { period } = req.query;
        if (!period || !["daily", "weekly", "monthly"].includes(period)) {
            return (0, response_1.sendError)(res, "period query parameter is required (daily, weekly, or monthly)", constants_1.HTTP_STATUS.BAD_REQUEST, req.path);
        }
        const result = await medicationLogService.getLogsForPeriod(userId, period);
        return (0, response_1.sendSuccess)(res, result, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error fetching history:", error);
        return (0, response_1.sendError)(res, "Failed to fetch history", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
//# sourceMappingURL=medication-log.controller.js.map