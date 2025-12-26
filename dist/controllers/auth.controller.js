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
exports.register = register;
exports.login = login;
exports.getMe = getMe;
const authService = __importStar(require("../services/auth.service"));
const response_1 = require("../utils/response");
const constants_1 = require("../constants");
const errors_1 = require("../utils/errors");
async function register(req, res) {
    try {
        const { email, name, password } = req.body;
        const result = await authService.register({ email, name, password });
        return (0, response_1.sendSuccess)(res, result, constants_1.HTTP_STATUS.CREATED);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error registering user:", error);
        return (0, response_1.sendError)(res, "Failed to register user", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const result = await authService.login({ email, password });
        return (0, response_1.sendSuccess)(res, result, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error logging in:", error);
        return (0, response_1.sendError)(res, "Failed to login", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
async function getMe(req, res) {
    try {
        const userId = req.user.userId;
        const user = await authService.getMe(userId);
        return (0, response_1.sendSuccess)(res, user, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            return (0, response_1.sendError)(res, error.message, error.statusCode, req.path);
        }
        console.error("Error fetching user:", error);
        return (0, response_1.sendError)(res, "Failed to fetch user", constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
//# sourceMappingURL=auth.controller.js.map