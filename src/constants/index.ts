import {
  FrequencyType,
  DosageUnit,
  IntervalUnit,
  TimeSlot,
} from "@prisma/client";

// JWT Configuration
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || "your-secret-key",
  EXPIRES_IN: "7d",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  EMAIL_EXISTS: "Email already exists",
  USER_NOT_FOUND: "User not found",
  INVALID_CREDENTIALS: "Invalid credentials",
  NO_TOKEN: "No token provided",
  INVALID_TOKEN: "Invalid token",
  REQUIRED_FIELD: (field: string) => `${field} is required`,
  NOT_FOUND: (resource: string) => `${resource} not found`,
} as const;

// Enum Mappings (Frontend → Backend)
export const FREQUENCY_TYPE_MAP: Record<string, FrequencyType> = {
  daily: "DAILY",
  interval: "INTERVAL",
  "specific-days": "SPECIFIC_DAYS",
};

export const DOSAGE_UNIT_MAP: Record<string, DosageUnit> = {
  mg: "MG",
  ml: "ML",
  IU: "IU",
  tablet: "TABLET",
  capsule: "CAPSULE",
  drops: "DROPS",
  tsp: "TSP",
  tbsp: "TBSP",
};

export const INTERVAL_UNIT_MAP: Record<string, IntervalUnit> = {
  days: "DAYS",
  weeks: "WEEKS",
  months: "MONTHS",
};

export const TIME_SLOT_MAP: Record<string, TimeSlot> = {
  morning: "MORNING",
  noon: "NOON",
  afternoon: "AFTERNOON",
  night: "NIGHT",
  before_sleep: "BEFORE_SLEEP",
};

// Default Values
export const DEFAULTS = {
  DOSAGE_UNIT: "MG" as DosageUnit,
  FREQUENCY_TYPE: "DAILY" as FrequencyType,
  INTERVAL_VALUE: 1,
  INTERVAL_UNIT: "DAYS" as IntervalUnit,
  LATE_THRESHOLD_MINUTES: 10,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const;
