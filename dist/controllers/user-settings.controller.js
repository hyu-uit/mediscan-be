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
exports.getUserSettings = getUserSettings;
exports.createUserSettings = createUserSettings;
exports.updateUserSettings = updateUserSettings;
exports.upsertUserSettings = upsertUserSettings;
exports.deleteUserSettings = deleteUserSettings;
exports.registerFcmToken = registerFcmToken;
exports.togglePushNotifications = togglePushNotifications;
exports.toggleAutomatedCalls = toggleAutomatedCalls;
exports.toggleDarkMode = toggleDarkMode;
const userSettingsService = __importStar(require("../services/user-settings.service"));
const notification_service_1 = require("../services/notification.service");
const response_1 = require("../utils/response");
const constants_1 = require("../constants");
const errors_1 = require("../utils/errors");
async function getUserSettings(req, res) {
    try {
        const userId = req.user.userId;
        const settings = await userSettingsService.getUserSettings(userId);
        if (!settings) {
            return (0, response_1.sendError)(res, "User settings not found", constants_1.HTTP_STATUS.NOT_FOUND, req.path);
        }
        return (0, response_1.sendSuccess)(res, settings, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error fetching user settings:", error);
        return (0, response_1.sendError)(res, "Failed to fetch user settings", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function createUserSettings(req, res) {
    try {
        const userId = req.user.userId;
        const settings = await userSettingsService.createUserSettings(userId);
        return (0, response_1.sendSuccess)(res, settings, constants_1.HTTP_STATUS.CREATED);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error creating user settings:", error);
        return (0, response_1.sendError)(res, "Failed to create user settings", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function updateUserSettings(req, res) {
    try {
        const userId = req.user.userId;
        const { pushNotifications, automatedCalls, darkMode, morningTime, noonTime, afternoonTime, nightTime, beforeSleepTime, } = req.body;
        const settings = await userSettingsService.updateUserSettings(userId, {
            pushNotifications,
            automatedCalls,
            darkMode,
            morningTime,
            noonTime,
            afternoonTime,
            nightTime,
            beforeSleepTime,
        });
        return (0, response_1.sendSuccess)(res, settings, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error updating user settings:", error);
        return (0, response_1.sendError)(res, "Failed to update user settings", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function upsertUserSettings(req, res) {
    try {
        const userId = req.user.userId;
        const { pushNotifications, automatedCalls, darkMode, morningTime, noonTime, afternoonTime, nightTime, beforeSleepTime, } = req.body;
        const settings = await userSettingsService.upsertUserSettings(userId, {
            pushNotifications,
            automatedCalls,
            darkMode,
            morningTime,
            noonTime,
            afternoonTime,
            nightTime,
            beforeSleepTime,
        });
        return (0, response_1.sendSuccess)(res, settings, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error upserting user settings:", error);
        return (0, response_1.sendError)(res, "Failed to upsert user settings", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function deleteUserSettings(req, res) {
    try {
        const userId = req.user.userId;
        await userSettingsService.deleteUserSettings(userId);
        return (0, response_1.sendSuccess)(res, null, constants_1.HTTP_STATUS.NO_CONTENT);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error deleting user settings:", error);
        return (0, response_1.sendError)(res, "Failed to delete user settings", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function registerFcmToken(req, res) {
    try {
        const userId = req.user.userId;
        const { fcmToken } = req.body;
        if (!fcmToken) {
            return (0, response_1.sendError)(res, "FCM token is required", constants_1.HTTP_STATUS.BAD_REQUEST, req.path);
        }
        await (0, notification_service_1.updateFcmToken)(userId, fcmToken);
        return (0, response_1.sendSuccess)(res, { message: "FCM token registered successfully" }, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error registering FCM token:", error);
        return (0, response_1.sendError)(res, "Failed to register FCM token", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function togglePushNotifications(req, res) {
    try {
        const userId = req.user.userId;
        const settings = await userSettingsService.togglePushNotifications(userId);
        return (0, response_1.sendSuccess)(res, settings, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error toggling push notifications:", error);
        return (0, response_1.sendError)(res, "Failed to toggle push notifications", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function toggleAutomatedCalls(req, res) {
    try {
        const userId = req.user.userId;
        const settings = await userSettingsService.toggleAutomatedCalls(userId);
        return (0, response_1.sendSuccess)(res, settings, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error toggling automated calls:", error);
        return (0, response_1.sendError)(res, "Failed to toggle automated calls", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function toggleDarkMode(req, res) {
    try {
        const userId = req.user.userId;
        const settings = await userSettingsService.toggleDarkMode(userId);
        return (0, response_1.sendSuccess)(res, settings, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error toggling dark mode:", error);
        return (0, response_1.sendError)(res, "Failed to toggle dark mode", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
//# sourceMappingURL=user-settings.controller.js.map