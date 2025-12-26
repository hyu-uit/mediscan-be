import { Worker } from "bullmq";
import { MedicationReminderJobData } from "../queues/medication.queue";
declare const medicationReminderWorker: Worker<MedicationReminderJobData, any, string>;
export default medicationReminderWorker;
//# sourceMappingURL=medication-reminder.worker.d.ts.map