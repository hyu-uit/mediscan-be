"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const constants_1 = require("../constants");
const errors_1 = require("../utils/errors");
const SALT_ROUNDS = 10;
async function register(data) {
    if (!data.email || !data.name || !data.password) {
        throw new errors_1.BadRequestError("email, name, and password are required");
    }
    const existingUser = await prisma_1.default.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new errors_1.ConflictError(constants_1.ERROR_MESSAGES.EMAIL_EXISTS);
    }
    const hashedPassword = await bcrypt_1.default.hash(data.password, SALT_ROUNDS);
    const user = await prisma_1.default.user.create({
        data: {
            email: data.email,
            name: data.name,
            password: hashedPassword,
            settings: { create: {} },
        },
        include: { settings: true },
    });
    const token = generateToken(user.id, user.email);
    return {
        user: { id: user.id, email: user.email, name: user.name },
        token,
    };
}
async function login(data) {
    if (!data.email || !data.password) {
        throw new errors_1.BadRequestError("email and password are required");
    }
    const user = await prisma_1.default.user.findUnique({
        where: { email: data.email },
    });
    if (!user) {
        throw new errors_1.NotFoundError("User");
    }
    const isValidPassword = await bcrypt_1.default.compare(data.password, user.password);
    if (!isValidPassword) {
        throw new errors_1.UnauthorizedError(constants_1.ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
    const token = generateToken(user.id, user.email);
    return {
        user: { id: user.id, email: user.email, name: user.name },
        token,
    };
}
function generateToken(userId, email) {
    return jsonwebtoken_1.default.sign({ userId, email }, constants_1.JWT_CONFIG.SECRET, {
        expiresIn: constants_1.JWT_CONFIG.EXPIRES_IN,
    });
}
async function getMe(userId) {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            settings: {
                select: {
                    pushNotifications: true,
                    automatedCalls: true,
                    darkMode: true,
                    morningTime: true,
                    noonTime: true,
                    afternoonTime: true,
                    nightTime: true,
                    beforeSleepTime: true,
                },
            },
        },
    });
    if (!user) {
        throw new errors_1.NotFoundError("User");
    }
    return user;
}
//# sourceMappingURL=auth.service.js.map