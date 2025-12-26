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
exports.createMedication = createMedication;
exports.getMedications = getMedications;
exports.updateMedication = updateMedication;
exports.deleteMedication = deleteMedication;
const medicationService = __importStar(require("../services/medication.service"));
const response_1 = require("../utils/response");
const constants_1 = require("../constants");
const errors_1 = require("../utils/errors");
function transformIntakeTimes(intakeTimes) {
    if (!intakeTimes)
        return undefined;
    return intakeTimes?.map((intake) => ({
        id: intake.id,
        time: intake.time,
        type: (constants_1.TIME_SLOT_MAP[intake.type] ||
            intake?.type?.toUpperCase() ||
            ""),
    }));
}
async function createMedication(req, res) {
    try {
        const userId = req.user.userId;
        const { name, dosage, unit, instructions, notes, frequencyType, intervalValue, intervalUnit, selectedDays, intakeTimes, } = req.body;
        const medication = await medicationService.createMedication({
            userId,
            name,
            dosage,
            unit: unit ? constants_1.DOSAGE_UNIT_MAP[unit] : undefined,
            instructions,
            notes,
            frequencyType: frequencyType
                ? constants_1.FREQUENCY_TYPE_MAP[frequencyType]
                : undefined,
            intervalValue: intervalValue ? parseInt(intervalValue, 10) : undefined,
            intervalUnit: intervalUnit ? constants_1.INTERVAL_UNIT_MAP[intervalUnit] : undefined,
            selectedDays,
            intakeTimes: transformIntakeTimes(intakeTimes),
        });
        return (0, response_1.sendSuccess)(res, medication, constants_1.HTTP_STATUS.CREATED);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error creating medication:", error);
        return (0, response_1.sendError)(res, "Failed to create medication", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function getMedications(req, res) {
    try {
        const userId = req.user.userId;
        const result = await medicationService.getMedicationsList(userId);
        return (0, response_1.sendSuccess)(res, result, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error fetching medications:", error);
        return (0, response_1.sendError)(res, "Failed to fetch medications", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function updateMedication(req, res) {
    try {
        const { id } = req.params;
        const { name, dosage, unit, instructions, notes, frequencyType, intervalValue, intervalUnit, selectedDays, intakeTimes, imageUrl, isActive, } = req.body;
        const medication = await medicationService.updateMedication(id, {
            name,
            dosage,
            unit: unit ? constants_1.DOSAGE_UNIT_MAP[unit] : undefined,
            instructions,
            notes,
            frequencyType: frequencyType
                ? constants_1.FREQUENCY_TYPE_MAP[frequencyType]
                : undefined,
            intervalValue: intervalValue ? parseInt(intervalValue, 10) : undefined,
            intervalUnit: intervalUnit ? constants_1.INTERVAL_UNIT_MAP[intervalUnit] : undefined,
            selectedDays,
            intakeTimes: transformIntakeTimes(intakeTimes),
            imageUrl,
            isActive,
        });
        return (0, response_1.sendSuccess)(res, medication, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error updating medication:", error);
        return (0, response_1.sendError)(res, "Failed to update medication", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function deleteMedication(req, res) {
    try {
        const { id } = req.params;
        await medicationService.deleteMedication(id);
        return (0, response_1.sendSuccess)(res, null, constants_1.HTTP_STATUS.NO_CONTENT);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error deleting medication:", error);
        return (0, response_1.sendError)(res, "Failed to delete medication", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
//# sourceMappingURL=medication.controller.js.map