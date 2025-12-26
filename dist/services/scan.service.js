"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanDocument = scanDocument;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://localhost:2332";
async function scanDocument(file) {
    const formData = new form_data_1.default();
    formData.append("file", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
    });
    console.log(`📷 Scanning document: ${file.originalname}`);
    console.log(`🔗 AI Server: ${AI_SERVER_URL}/scan`);
    try {
        const response = await axios_1.default.post(`${AI_SERVER_URL}/scan`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 60000, // 60 second timeout for AI processing
        });
        console.log(`✅ Scan complete: ${response.data.medications?.length || 0} medications found`);
        return {
            medications: response.data.medications,
            rawText: response.data.rawText,
            confidence: response.data.confidence,
        };
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error(`❌ AI Server error:`);
            console.error(`  Status: ${error.response?.status || "N/A"}`);
            console.error(`  Status Text: ${error.response?.statusText || "N/A"}`);
            console.error(`  URL: ${error.config?.url || "N/A"}`);
            console.error(`  Response Data:`, JSON.stringify(error.response?.data, null, 2));
            console.error(`  Error Message: ${error.message}`);
            if (error.code) {
                console.error(`  Error Code: ${error.code}`);
            }
            throw new Error(error.response?.data?.message || "Failed to scan document");
        }
        console.error(`❌ Unexpected error during scan:`, error);
        throw error;
    }
}
//# sourceMappingURL=scan.service.js.map