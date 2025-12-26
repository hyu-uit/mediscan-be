import { Request } from "express";
import { FrequencyType, DosageUnit, IntervalUnit, TimeSlot } from "@prisma/client";
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}
export interface ApiResponse<T = unknown> {
    statusCode: number;
    success: boolean;
    data: T;
}
export interface ApiErrorResponse {
    success: boolean;
    message: string;
    error: string;
    timestamp: string;
    path: string;
    statusCode: number;
}
export interface PaginatedResponse<T = unknown> {
    data: T[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
}
export interface IntakeTime {
    id: string;
    time: string;
    type: TimeSlot;
}
export interface CreateMedicationInput {
    userId: string;
    name: string;
    dosage?: string;
    unit?: DosageUnit;
    instructions?: string;
    notes?: string;
    frequencyType?: FrequencyType;
    intervalValue?: number;
    intervalUnit?: IntervalUnit;
    selectedDays?: string[];
    intakeTimes?: IntakeTime[];
    imageUrl?: string;
}
export interface UpdateMedicationInput {
    name?: string;
    dosage?: string;
    unit?: DosageUnit;
    instructions?: string;
    notes?: string;
    frequencyType?: FrequencyType;
    intervalValue?: number;
    intervalUnit?: IntervalUnit;
    selectedDays?: string[];
    intakeTimes?: IntakeTime[];
    imageUrl?: string;
    isActive?: boolean;
}
export interface MedicationInputFromFrontend {
    id: string;
    name: string;
    dosage?: string;
    unit?: string;
    instructions?: string;
    notes?: string;
    frequencyType?: string;
    intervalValue?: string;
    intervalUnit?: string;
    selectedDays?: string[];
    intakeTimes?: Array<{
        id: string;
        time: string;
        type: string;
    }>;
}
export interface CreateScheduleInput {
    medicationId: string;
    time: string;
    type: string;
}
export interface UpdateScheduleInput {
    time?: string;
    type?: string;
    isActive?: boolean;
}
export interface UpdateUserSettingsInput {
    pushNotifications?: boolean;
    automatedCalls?: boolean;
    darkMode?: boolean;
    morningTime?: string;
    noonTime?: string;
    afternoonTime?: string;
    nightTime?: string;
    beforeSleepTime?: string;
}
export interface RegisterInput {
    email: string;
    name: string;
    password: string;
}
export interface LoginInput {
    email: string;
    password: string;
}
export interface JwtPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}
export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
    };
    token: string;
}
export type DosageUnitType = "mg" | "ml" | "IU" | "tablet" | "capsule" | "drops" | "tsp" | "tbsp";
export type MedicineStatusType = "active" | "inactive";
export interface MedicineResponse {
    id: string;
    name: string;
    dosage: string;
    unit: DosageUnitType;
    frequency: string;
    instructions: string;
    status: MedicineStatusType;
    iconColor?: string;
}
export interface MedicinesListResponse {
    medications: MedicineResponse[];
    totalCount: number;
}
//# sourceMappingURL=index.d.ts.map