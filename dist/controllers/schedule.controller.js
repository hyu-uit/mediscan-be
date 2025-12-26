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
exports.createBulkMedicationsWithSchedules = createBulkMedicationsWithSchedules;
exports.createSchedule = createSchedule;
exports.getSchedulesByMedication = getSchedulesByMedication;
exports.updateSchedule = updateSchedule;
exports.deleteSchedule = deleteSchedule;
exports.getTodaySchedule = getTodaySchedule;
exports.getScheduleByDate = getScheduleByDate;
const scheduleService = __importStar(require("../services/schedule.service"));
const response_1 = require("../utils/response");
const constants_1 = require("../constants");
const errors_1 = require("../utils/errors");
async function createBulkMedicationsWithSchedules(req, res) {
    try {
        const userId = req.user.userId;
        const { medications } = req.body;
        if (!medications ||
            !Array.isArray(medications) ||
            medications.length === 0) {
            return (0, response_1.sendError)(res, "medications array is required", constants_1.HTTP_STATUS.BAD_REQUEST, req.path);
        }
        const createdMedications = await scheduleService.createBulkMedicationsWithSchedules(userId, medications);
        return (0, response_1.sendSuccess)(res, createdMedications, constants_1.HTTP_STATUS.CREATED);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error creating bulk medications:", error);
        return (0, response_1.sendError)(res, "Failed to create medications", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function createSchedule(req, res) {
    try {
        const { medicationId, time, type } = req.body;
        if (!medicationId || !time || !type) {
            return (0, response_1.sendError)(res, "medicationId, time, and type are required", constants_1.HTTP_STATUS.BAD_REQUEST, req.path);
        }
        const schedule = await scheduleService.createSchedule({
            medicationId,
            time,
            type,
        });
        return (0, response_1.sendSuccess)(res, schedule, constants_1.HTTP_STATUS.CREATED);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error creating schedule:", error);
        return (0, response_1.sendError)(res, "Failed to create schedule", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function getSchedulesByMedication(req, res) {
    try {
        const { medicationId } = req.params;
        const schedules = await scheduleService.getSchedulesByMedication(medicationId);
        return (0, response_1.sendSuccess)(res, schedules, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error fetching schedules:", error);
        return (0, response_1.sendError)(res, "Failed to fetch schedules", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function updateSchedule(req, res) {
    try {
        const { id } = req.params;
        const { time, type, isActive } = req.body;
        const schedule = await scheduleService.updateSchedule(id, {
            time,
            type,
            isActive,
        });
        return (0, response_1.sendSuccess)(res, schedule, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error updating schedule:", error);
        return (0, response_1.sendError)(res, "Failed to update schedule", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function deleteSchedule(req, res) {
    try {
        const { id } = req.params;
        await scheduleService.deleteSchedule(id);
        return (0, response_1.sendSuccess)(res, null, constants_1.HTTP_STATUS.NO_CONTENT);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error deleting schedule:", error);
        return (0, response_1.sendError)(res, "Failed to delete schedule", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function getTodaySchedule(req, res) {
    try {
        const userId = req.user.userId;
        const result = await scheduleService.getTodaySchedule(userId);
        return (0, response_1.sendSuccess)(res, result, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error fetching today's schedule:", error);
        return (0, response_1.sendError)(res, "Failed to fetch today's schedule", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function getScheduleByDate(req, res) {
    try {
        const userId = req.user.userId;
        const { date } = req.params;
        if (!date) {
            return (0, response_1.sendError)(res, "date parameter is required (format: YYYY-MM-DD)", constants_1.HTTP_STATUS.BAD_REQUEST, req.path);
        }
        const result = await scheduleService.getScheduleByDate(userId, date);
        return (0, response_1.sendSuccess)(res, result, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error fetching schedule by date:", error);
        return (0, response_1.sendError)(res, "Failed to fetch schedule", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
//# sourceMappingURL=schedule.controller.js.map