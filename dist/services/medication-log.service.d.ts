export declare function markMedicationTaken(medicationLogId: string): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    medicationId: string;
    scheduledDate: Date;
    scheduledTime: string;
    timeSlot: import(".prisma/client").$Enums.TimeSlot;
    status: import(".prisma/client").$Enums.IntakeStatus;
    takenAt: Date | null;
    scheduleId: string | null;
}>;
export declare function skipMedication(medicationLogId: string): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    medicationId: string;
    scheduledDate: Date;
    scheduledTime: string;
    timeSlot: import(".prisma/client").$Enums.TimeSlot;
    status: import(".prisma/client").$Enums.IntakeStatus;
    takenAt: Date | null;
    scheduleId: string | null;
}>;
export declare function getMedicationLogs(userId: string, date?: Date): Promise<({
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
    userId: string;
    medicationId: string;
    scheduledDate: Date;
    scheduledTime: string;
    timeSlot: import(".prisma/client").$Enums.TimeSlot;
    status: import(".prisma/client").$Enums.IntakeStatus;
    takenAt: Date | null;
    scheduleId: string | null;
})[]>;
type Period = "daily" | "weekly" | "monthly";
export declare function getIntakeStats(userId: string, period: Period): Promise<{
    period: Period;
    adherence: number;
    adherenceChange: number;
    comparisonLabel: string;
    taken: number;
    missed: number;
    skipped: number;
    pending: number;
    total: number;
    periodStart: string;
    periodEnd: string;
}>;
export declare function getLogsForPeriod(userId: string, period: Period): Promise<{
    period: Period;
    periodStart: string;
    periodEnd: string;
    logs: {
        id: string | null;
        logId: string;
        medicationId: string;
        medicationName: string;
        dosage: string | null;
        unit: import(".prisma/client").$Enums.DosageUnit;
        instructions: string | null;
        scheduledDate: string;
        time: string;
        timeSlot: import(".prisma/client").$Enums.TimeSlot;
        status: import(".prisma/client").$Enums.IntakeStatus;
        takenAt: Date | null;
    }[];
}>;
export {};
//# sourceMappingURL=medication-log.service.d.ts.map