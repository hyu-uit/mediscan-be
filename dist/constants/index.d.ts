import { FrequencyType, DosageUnit, IntervalUnit, TimeSlot } from "@prisma/client";
export declare const JWT_CONFIG: {
    readonly SECRET: string;
    readonly EXPIRES_IN: "7d";
};
export declare const ERROR_MESSAGES: {
    readonly EMAIL_EXISTS: "Email already exists";
    readonly USER_NOT_FOUND: "User not found";
    readonly INVALID_CREDENTIALS: "Invalid credentials";
    readonly NO_TOKEN: "No token provided";
    readonly INVALID_TOKEN: "Invalid token";
    readonly REQUIRED_FIELD: (field: string) => string;
    readonly NOT_FOUND: (resource: string) => string;
};
export declare const FREQUENCY_TYPE_MAP: Record<string, FrequencyType>;
export declare const DOSAGE_UNIT_MAP: Record<string, DosageUnit>;
export declare const INTERVAL_UNIT_MAP: Record<string, IntervalUnit>;
export declare const TIME_SLOT_MAP: Record<string, TimeSlot>;
export declare const DEFAULTS: {
    readonly DOSAGE_UNIT: DosageUnit;
    readonly FREQUENCY_TYPE: FrequencyType;
    readonly INTERVAL_VALUE: 1;
    readonly INTERVAL_UNIT: IntervalUnit;
    readonly LATE_THRESHOLD_MINUTES: 10;
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly INTERNAL_ERROR: 500;
};
//# sourceMappingURL=index.d.ts.map