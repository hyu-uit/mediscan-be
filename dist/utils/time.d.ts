import { FrequencyType, IntervalUnit } from "@prisma/client";
interface ParsedTime {
    hours: number;
    minutes: number;
}
export interface MedicationFrequency {
    frequencyType: FrequencyType;
    intervalValue: number;
    intervalUnit: IntervalUnit;
    selectedDays: string[];
    createdAt: Date;
}
/**
 * Get today's date at UTC midnight (00:00:00.000Z)
 * This ensures consistent date storage regardless of server timezone
 */
export declare function getTodayUTC(): Date;
/**
 * Get a specific date at UTC midnight
 */
export declare function getDateUTC(date: Date | string): Date;
export declare function parseTime(timeStr: string): ParsedTime;
export declare function getScheduledDateTimeForToday(timeStr: string): Date;
export declare function hasTimePassed(timeStr: string): boolean;
export declare function getDelayUntil(timeStr: string): number;
/**
 * Check if a medication should be scheduled on a specific date based on its frequency settings
 */
export declare function shouldScheduleOnDate(medication: MedicationFrequency, targetDate: Date): boolean;
/**
 * Check if a medication should be scheduled today based on its frequency settings
 */
export declare function shouldScheduleToday(medication: MedicationFrequency): boolean;
export {};
//# sourceMappingURL=time.d.ts.map