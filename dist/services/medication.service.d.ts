import { CreateMedicationInput, UpdateMedicationInput, MedicinesListResponse } from "../types";
export declare function createMedication(data: CreateMedicationInput): Promise<({
    schedules: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        isActive: boolean;
        medicationId: string;
        time: string;
    }[];
} & {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    dosage: string | null;
    unit: import(".prisma/client").$Enums.DosageUnit;
    instructions: string | null;
    notes: string | null;
    frequencyType: import(".prisma/client").$Enums.FrequencyType;
    intervalValue: number;
    intervalUnit: import(".prisma/client").$Enums.IntervalUnit;
    selectedDays: string[];
    imageUrl: string | null;
    isActive: boolean;
}) | null>;
export declare function getMedications(userId: string): Promise<({
    schedules: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        isActive: boolean;
        medicationId: string;
        time: string;
    }[];
} & {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    dosage: string | null;
    unit: import(".prisma/client").$Enums.DosageUnit;
    instructions: string | null;
    notes: string | null;
    frequencyType: import(".prisma/client").$Enums.FrequencyType;
    intervalValue: number;
    intervalUnit: import(".prisma/client").$Enums.IntervalUnit;
    selectedDays: string[];
    imageUrl: string | null;
    isActive: boolean;
})[]>;
export declare function getMedicationsList(userId: string): Promise<MedicinesListResponse>;
export declare function getMedicationById(id: string): Promise<({
    schedules: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        isActive: boolean;
        medicationId: string;
        time: string;
    }[];
} & {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    dosage: string | null;
    unit: import(".prisma/client").$Enums.DosageUnit;
    instructions: string | null;
    notes: string | null;
    frequencyType: import(".prisma/client").$Enums.FrequencyType;
    intervalValue: number;
    intervalUnit: import(".prisma/client").$Enums.IntervalUnit;
    selectedDays: string[];
    imageUrl: string | null;
    isActive: boolean;
}) | null>;
export declare function updateMedication(id: string, data: UpdateMedicationInput): Promise<({
    schedules: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        isActive: boolean;
        medicationId: string;
        time: string;
    }[];
} & {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    dosage: string | null;
    unit: import(".prisma/client").$Enums.DosageUnit;
    instructions: string | null;
    notes: string | null;
    frequencyType: import(".prisma/client").$Enums.FrequencyType;
    intervalValue: number;
    intervalUnit: import(".prisma/client").$Enums.IntervalUnit;
    selectedDays: string[];
    imageUrl: string | null;
    isActive: boolean;
}) | null>;
export declare function deleteMedication(id: string): Promise<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    dosage: string | null;
    unit: import(".prisma/client").$Enums.DosageUnit;
    instructions: string | null;
    notes: string | null;
    frequencyType: import(".prisma/client").$Enums.FrequencyType;
    intervalValue: number;
    intervalUnit: import(".prisma/client").$Enums.IntervalUnit;
    selectedDays: string[];
    imageUrl: string | null;
    isActive: boolean;
}>;
//# sourceMappingURL=medication.service.d.ts.map