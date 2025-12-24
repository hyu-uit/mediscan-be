import { Worker, Job } from "bullmq";
import redisConnection from "../config/redis";
import { MedicationMissedJobData } from "../queues/medication.queue";
import prisma from "../utils/prisma";

// This worker checks if medication was taken and marks it as missed if not
const medicationMissedWorker = new Worker<MedicationMissedJobData>(
  "medication-missed",
  async (job: Job<MedicationMissedJobData>) => {
    const { medicationLogId } = job.data;

    console.log(
      `🔍 Checking if medication log ${medicationLogId} was taken...`
    );

    // Find the medication log
    const medicationLog = await prisma.medicationLog.findUnique({
      where: { id: medicationLogId },
    });

    if (!medicationLog) {
      console.log(`⚠️ Medication log ${medicationLogId} not found`);
      return { success: false, reason: "Log not found" };
    }

    // If status is still pending (not CONFIRMED or LATE), mark as MISSED
    if (
      medicationLog.status !== "CONFIRMED" &&
      medicationLog.status !== "LATE" &&
      medicationLog.status !== "SKIPPED"
    ) {
      await prisma.medicationLog.update({
        where: { id: medicationLogId },
        data: { status: "MISSED" },
      });

      console.log(`❌ Medication log ${medicationLogId} marked as MISSED`);

      // TODO: Send notification that medication was missed
      // This could trigger emergency contact notification if configured

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

export default medicationMissedWorker;
