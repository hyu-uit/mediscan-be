import { FrequencyType, DosageUnit, IntervalUnit, TimeSlot } from "@prisma/client";
import { MedicationFrequency } from "../utils/time";
interface IntakeTime {
    id: string;
    time: string;
    type: TimeSlot;
}
interface MedicationInput {
    id: string;
    name: string;
    dosage?: string;
    unit?: DosageUnit;
    instructions?: string;
    notes?: string;
    frequencyType?: FrequencyType;
    intervalValue?: string;
    intervalUnit?: IntervalUnit;
    selectedDays?: string[];
    intakeTimes?: IntakeTime[];
}
interface MedicationWithSchedules extends MedicationFrequency {
    id: string;
    name: string;
    schedules: Array<{
        id: string;
        time: string;
        type: string;
    }>;
}
export declare function createBulkMedicationsWithSchedules(userId: string, medications: MedicationInput[]): Promise<(MedicationWithSchedules | null)[]>;
export declare function createSchedule(data: {
    medicationId: string;
    time: string;
    type: string;
}): Promise<{
    medication: {
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
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    isActive: boolean;
    medicationId: string;
    time: string;
}>;
export declare function getSchedulesByMedication(medicationId: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    isActive: boolean;
    medicationId: string;
    time: string;
}[]>;
export declare function updateSchedule(id: string, data: {
    time?: string;
    type?: string;
    isActive?: boolean;
}): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    isActive: boolean;
    medicationId: string;
    time: string;
}>;
export declare function deleteSchedule(id: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    isActive: boolean;
    medicationId: string;
    time: string;
}>;
export declare function getTodaySchedule(userId: string): Promise<{
    schedules: {
        id: string;
        logId: string | null;
        medicationId: string;
        medicationName: string;
        dosage: string | null;
        unit: import(".prisma/client").$Enums.DosageUnit;
        instructions: string | null;
        time: string;
        timeSlot: string;
        status: import(".prisma/client").$Enums.IntakeStatus;
        takenAt: Date | null;
        isPassed: boolean;
    }[];
    totalCount: number;
    remainingCount: number;
}>;
export declare function getScheduleByDate(userId: string, date: string): Promise<{
    schedules: {
        id: string;
        logId: string | null;
        medicationId: string;
        medicationName: string;
        dosage: string | null;
        unit: import(".prisma/client").$Enums.DosageUnit;
        instructions: string | null;
        time: string;
        timeSlot: string;
        status: import(".prisma/client").$Enums.IntakeStatus;
        takenAt: Date | null;
        isPassed: boolean;
    }[];
}>;
export {};
//# sourceMappingURL=schedule.service.d.ts.map