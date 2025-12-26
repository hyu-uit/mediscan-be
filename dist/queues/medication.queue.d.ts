import { Queue } from "bullmq";
export declare const medicationReminderQueue: Queue<any, any, string, any, any, string>;
export declare const medicationMissedQueue: Queue<any, any, string, any, any, string>;
export interface MedicationReminderJobData {
    medicationLogId: string;
    userId: string;
    medicationId: string;
    medicationName: string;
    timeSlot: string;
    scheduledTime: string;
}
export interface MedicationMissedJobData {
    medicationLogId: string;
}
//# sourceMappingURL=medication.queue.d.ts.map