import { Worker, Job } from "bullmq";
import redisConnection from "../config/redis";
import {
  MedicationReminderJobData,
  medicationMissedQueue,
} from "../queues/medication.queue";
import { sendMedicationReminder } from "../services/notification.service";

// This worker handles sending notifications when medication time is up
const medicationReminderWorker = new Worker<MedicationReminderJobData>(
  "medication-reminder",
  async (job: Job<MedicationReminderJobData>) => {
    const { medicationLogId, userId, medicationName, timeSlot, scheduledTime } =
      job.data;

    console.log(
      `🔔 Sending reminder to user ${userId}: Take ${medicationName} (${timeSlot}) at ${scheduledTime}`
    );

    // Send push notification via FCM
    const notificationSent = await sendMedicationReminder(
      userId,
      medicationName,
      scheduledTime,
      medicationLogId
    );

    if (notificationSent) {
      console.log(`📲 Push notification sent for ${medicationName}`);
    }

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

    return { success: true, notified: notificationSent };
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

medicationReminderWorker.on("ready", () => {
  console.log("🔔 Medication Reminder Worker is ready and listening for jobs");
});

medicationReminderWorker.on("error", (err) => {
  console.error("❌ Reminder Worker error:", err.message);
});

export default medicationReminderWorker;
