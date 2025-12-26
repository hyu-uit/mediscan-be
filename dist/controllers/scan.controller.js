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
exports.scanDocument = scanDocument;
const scanService = __importStar(require("../services/scan.service"));
const response_1 = require("../utils/response");
const constants_1 = require("../constants");
async function scanDocument(req, res) {
    try {
        if (!req.file) {
            return (0, response_1.sendError)(res, "No file uploaded. Please upload an image.", constants_1.HTTP_STATUS.BAD_REQUEST, req.path);
        }
        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return (0, response_1.sendError)(res, "Invalid file type. Please upload a JPEG, PNG, or WebP image.", constants_1.HTTP_STATUS.BAD_REQUEST, req.path);
        }
        const result = await scanService.scanDocument(req.file);
        return (0, response_1.sendSuccess)(res, result, constants_1.HTTP_STATUS.OK);
    }
    catch (error) {
        console.error("Error scanning document:", error);
        const message = error instanceof Error ? error.message : "Failed to scan document";
        return (0, response_1.sendError)(res, message, constants_1.HTTP_STATUS.INTERNAL_ERROR, req.path);
    }
}
//# sourceMappingURL=scan.controller.js.map