"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_STATUS = exports.DEFAULTS = exports.TIME_SLOT_MAP = exports.INTERVAL_UNIT_MAP = exports.DOSAGE_UNIT_MAP = exports.FREQUENCY_TYPE_MAP = exports.ERROR_MESSAGES = exports.JWT_CONFIG = void 0;
// JWT Configuration
exports.JWT_CONFIG = {
    SECRET: process.env.JWT_SECRET || "your-secret-key",
    EXPIRES_IN: "7d",
};
// Error Messages
exports.ERROR_MESSAGES = {
    EMAIL_EXISTS: "Email already exists",
    USER_NOT_FOUND: "User not found",
    INVALID_CREDENTIALS: "Invalid credentials",
    NO_TOKEN: "No token provided",
    INVALID_TOKEN: "Invalid token",
    REQUIRED_FIELD: (field) => `${field} is required`,
    NOT_FOUND: (resource) => `${resource} not found`,
};
// Enum Mappings (Frontend → Backend)
exports.FREQUENCY_TYPE_MAP = {
    daily: "DAILY",
    interval: "INTERVAL",
    "specific-days": "SPECIFIC_DAYS",
};
exports.DOSAGE_UNIT_MAP = {
    mg: "MG",
    ml: "ML",
    IU: "IU",
    tablet: "TABLET",
    capsule: "CAPSULE",
    drops: "DROPS",
    tsp: "TSP",
    tbsp: "TBSP",
};
exports.INTERVAL_UNIT_MAP = {
    days: "DAYS",
    weeks: "WEEKS",
    months: "MONTHS",
};
exports.TIME_SLOT_MAP = {
    morning: "MORNING",
    noon: "NOON",
    afternoon: "AFTERNOON",
    night: "NIGHT",
    before_sleep: "BEFORE_SLEEP",
};
// Default Values
exports.DEFAULTS = {
    DOSAGE_UNIT: "MG",
    FREQUENCY_TYPE: "DAILY",
    INTERVAL_VALUE: 1,
    INTERVAL_UNIT: "DAYS",
    LATE_THRESHOLD_MINUTES: 10,
};
// HTTP Status Codes
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
};
//# sourceMappingURL=index.js.map