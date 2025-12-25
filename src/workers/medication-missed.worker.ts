import { Worker, Job } from "bullmq";
import redisConnection from "../config/redis";
import { MedicationMissedJobData } from "../queues/medication.queue";
import prisma from "../utils/prisma";
import { sendMissedMedicationAlert } from "../services/notification.service";

// This worker checks if medication was taken and marks it as missed if not
const medicationMissedWorker = new Worker<MedicationMissedJobData>(
  "medication-missed",
  async (job: Job<MedicationMissedJobData>) => {
    const { medicationLogId } = job.data;

    console.log(
      `🔍 Checking if medication log ${medicationLogId} was taken...`
    );

    // Find the medication log with medication details
    const medicationLog = await prisma.medicationLog.findUnique({
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
      await prisma.medicationLog.update({
        where: { id: medicationLogId },
        data: { status: "MISSED" },
      });

      console.log(`❌ Medication log ${medicationLogId} marked as MISSED`);

      // Send missed medication alert
      await sendMissedMedicationAlert(
        medicationLog.userId,
        medicationLog.medication.name
      );

      return { success: true, status: "MISSED" };
    }

    console.log(
      `✅ Medication log ${medicationLogId} was already handled (status: ${medicationLog.status})`
    );
    return { success: true, status: medicationLog.status };
  },
  {
    connection: redisConnection,
    concurrency: 10,
  }
);

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

export default medicationMissedWorker;
