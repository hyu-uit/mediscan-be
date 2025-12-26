"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../config/redis"));
const medication_queue_1 = require("../queues/medication.queue");
const notification_service_1 = require("../services/notification.service");
// This worker handles sending notifications when medication time is up
const medicationReminderWorker = new bullmq_1.Worker("medication-reminder", async (job) => {
    const { medicationLogId, userId, medicationName, timeSlot, scheduledTime } = job.data;
    console.log(`🔔 Sending reminder to user ${userId}: Take ${medicationName} (${timeSlot}) at ${scheduledTime}`);
    // Send push notification via FCM
    const notificationSent = await (0, notification_service_1.sendMedicationReminder)(userId, medicationName, scheduledTime, medicationLogId);
    if (notificationSent) {
        console.log(`📲 Push notification sent for ${medicationName}`);
    }
    // Schedule the "missed" check job to run 10 minutes from now
    await medication_queue_1.medicationMissedQueue.add("check-missed", { medicationLogId }, {
        delay: 10 * 60 * 1000, // 10 minutes in milliseconds
        jobId: `missed-check-${medicationLogId}`,
    });
    console.log(`⏰ Scheduled missed check for ${medicationLogId} in 10 minutes`);
    return { success: true, notified: notificationSent };
}, {
    connection: redis_1.default,
    concurrency: 10,
});
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
exports.default = medicationReminderWorker;
//# sourceMappingURL=medication-reminder.worker.js.map