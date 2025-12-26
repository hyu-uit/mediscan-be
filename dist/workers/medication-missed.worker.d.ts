import { Worker } from "bullmq";
import { MedicationMissedJobData } from "../queues/medication.queue";
declare const medicationMissedWorker: Worker<MedicationMissedJobData, any, string>;
export default medicationMissedWorker;
//# sourceMappingURL=medication-missed.worker.d.ts.map