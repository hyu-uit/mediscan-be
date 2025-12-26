"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../config/redis"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const notification_service_1 = require("../services/notification.service");
// This worker checks if medication was taken and marks it as missed if not
const medicationMissedWorker = new bullmq_1.Worker("medication-missed", async (job) => {
    const { medicationLogId } = job.data;
    console.log(`🔍 Checking if medication log ${medicationLogId} was taken...`);
    // Find the medication log with medication details
    const medicationLog = await prisma_1.default.medicationLog.findUnique({
        where: { id: medicationLogId },
        include: {
            medication: true,
        },
    });
    if (!medicationLog) {
        console.log(`⚠️ Medication log ${medicationLogId} not found`);
        return { success: false, reason: "Log not found" };
    }
    // If status is still PENDING (not yet taken), mark as MISSED
    if (medicationLog.status === "PENDING") {
        await prisma_1.default.medicationLog.update({
            where: { id: medicationLogId },
            data: { status: "MISSED" },
        });
        console.log(`❌ Medication log ${medicationLogId} marked as MISSED`);
        // Send missed medication alert
        await (0, notification_service_1.sendMissedMedicationAlert)(medicationLog.userId, medicationLog.medication.name);
        return { success: true, status: "MISSED" };
    }
    console.log(`✅ Medication log ${medicationLogId} was already handled (status: ${medicationLog.status})`);
    return { success: true, status: medicationLog.status };
}, {
    connection: redis_1.default,
    concurrency: 10,
});
medicationMissedWorker.on("completed", (job) => {
    console.log(`✅ Missed check job ${job.id} completed`);
});
medicationMissedWorker.on("failed", (job, err) => {
    console.error(`❌ Missed check job ${job?.id} failed:`, err.message);
});
medicationMissedWorker.on("ready", () => {
    console.log("⏰ Medication Missed Worker is ready and listening for jobs");
});
medicationMissedWorker.on("error", (err) => {
    console.error("❌ Missed Worker error:", err.message);
});
exports.default = medicationMissedWorker;
//# sourceMappingURL=medication-missed.worker.js.map