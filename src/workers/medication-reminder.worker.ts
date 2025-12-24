import { Worker, Job } from "bullmq";
import redisConnection from "../config/redis";
import {
  MedicationReminderJobData,
  medicationMissedQueue,
} from "../queues/medication.queue";

// This worker handles sending notifications when medication time is up
const medicationReminderWorker = new Worker<MedicationReminderJobData>(
  "medication-reminder",
  async (job: Job<MedicationReminderJobData>) => {
    const { medicationLogId, userId, medicationName, timeSlot, scheduledTime } =
      job.data;

    console.log(
      `🔔 Sending reminder to user ${userId}: Take ${medicationName} (${timeSlot}) at ${scheduledTime}`
    );

    // TODO: Implement actual notification sending (push notification, email, SMS, etc.)
    // For now, we just log the notification
    // You can integrate with:
    // - Firebase Cloud Messaging for push notifications
    // - Twilio for SMS
    // - SendGrid/Nodemailer for email

    // Schedule the "missed" check job to run 10 minutes from now
    await medicationMissedQueue.add(
      "check-missed",
      { medicationLogId },
      {
        delay: 10 * 60 * 1000, // 10 minutes in milliseconds
        jobId: `missed-check-${medicationLogId}`,
      }
    );

    console.log(
      `⏰ Scheduled missed check for ${medicationLogId} in 10 minutes`
    );

    return { success: true, notified: true };
  },
  {
    connection: redisConnection,
    concurrency: 10,
  }
);

medicationReminderWorker.on("completed", (job) => {
  console.log(`✅ Reminder job ${job.id} completed`);
});

medicationReminderWorker.on("failed", (job, err) => {
  console.error(`❌ Reminder job ${job?.id} failed:`, err.message);
});

export default medicationReminderWorker;
