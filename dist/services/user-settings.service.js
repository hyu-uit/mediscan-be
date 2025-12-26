"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSettings = getUserSettings;
exports.createUserSettings = createUserSettings;
exports.updateUserSettings = updateUserSettings;
exports.upsertUserSettings = upsertUserSettings;
exports.deleteUserSettings = deleteUserSettings;
exports.togglePushNotifications = togglePushNotifications;
exports.toggleAutomatedCalls = toggleAutomatedCalls;
exports.toggleDarkMode = toggleDarkMode;
const prisma_1 = __importDefault(require("../utils/prisma"));
const errors_1 = require("../utils/errors");
async function getUserSettings(userId) {
    if (!userId)
        throw new errors_1.BadRequestError("userId is required");
    return prisma_1.default.userSettings.findUnique({ where: { userId } });
}
async function createUserSettings(userId) {
    if (!userId)
        throw new errors_1.BadRequestError("userId is required");
    return prisma_1.default.userSettings.create({ data: { userId } });
}
async function updateUserSettings(userId, data) {
    if (!userId)
        throw new errors_1.BadRequestError("userId is required");
    const existing = await prisma_1.default.userSettings.findUnique({ where: { userId } });
    if (!existing)
        throw new errors_1.NotFoundError("User settings");
    return prisma_1.default.userSettings.update({ where: { userId }, data });
}
async function upsertUserSettings(userId, data) {
    if (!userId)
        throw new errors_1.BadRequestError("userId is required");
    return prisma_1.default.userSettings.upsert({
        where: { userId },
        create: { userId, ...data },
        update: data,
    });
}
async function deleteUserSettings(userId) {
    if (!userId)
        throw new errors_1.BadRequestError("userId is required");
    return prisma_1.default.userSettings.delete({ where: { userId } });
}
async function togglePushNotifications(userId) {
    if (!userId)
        throw new errors_1.BadRequestError("userId is required");
    const settings = await prisma_1.default.userSettings.findUnique({ where: { userId } });
    if (!settings) {
        // Create with push notifications enabled (toggled from default true to false doesn't make sense for first toggle)
        return prisma_1.default.userSettings.create({
            data: { userId, pushNotifications: false },
        });
    }
    return prisma_1.default.userSettings.update({
        where: { userId },
        data: { pushNotifications: !settings.pushNotifications },
    });
}
async function toggleAutomatedCalls(userId) {
    if (!userId)
        throw new errors_1.BadRequestError("userId is required");
    const settings = await prisma_1.default.userSettings.findUnique({ where: { userId } });
    if (!settings) {
        return prisma_1.default.userSettings.create({
            data: { userId, automatedCalls: true },
        });
    }
    return prisma_1.default.userSettings.update({
        where: { userId },
        data: { automatedCalls: !settings.automatedCalls },
    });
}
async function toggleDarkMode(userId) {
    if (!userId)
        throw new errors_1.BadRequestError("userId is required");
    const settings = await prisma_1.default.userSettings.findUnique({ where: { userId } });
    if (!settings) {
        return prisma_1.default.userSettings.create({
            data: { userId, darkMode: true },
        });
    }
    return prisma_1.default.userSettings.update({
        where: { userId },
        data: { darkMode: !settings.darkMode },
    });
}
//# sourceMappingURL=user-settings.service.js.map