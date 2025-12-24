import { Queue } from "bullmq";
import redisConnection from "../config/redis";

// Queue for sending medication reminders
export const medicationReminderQueue = new Queue("medication-reminder", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

// Queue for checking missed medications (runs 10 mins after reminder)
export const medicationMissedQueue = new Queue("medication-missed", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

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
