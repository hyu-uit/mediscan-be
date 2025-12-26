"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markMedicationTaken = markMedicationTaken;
exports.skipMedication = skipMedication;
exports.getMedicationLogs = getMedicationLogs;
exports.getIntakeStats = getIntakeStats;
exports.getLogsForPeriod = getLogsForPeriod;
const prisma_1 = __importDefault(require("../utils/prisma"));
const medication_queue_1 = require("../queues/medication.queue");
const constants_1 = require("../constants");
const errors_1 = require("../utils/errors");
const time_1 = require("../utils/time");
async function markMedicationTaken(medicationLogId) {
    if (!medicationLogId)
        throw new errors_1.BadRequestError("medicationLogId is required");
    const medicationLog = await prisma_1.default.medicationLog.findUnique({
        where: { id: medicationLogId },
    });
    if (!medicationLog)
        throw new errors_1.NotFoundError("Medication log");
    const now = new Date();
    const { hours, minutes } = (0, time_1.parseTime)(medicationLog.scheduledTime);
    const scheduledDateTime = new Date(medicationLog.scheduledDate);
    scheduledDateTime.setUTCHours(hours, minutes, 0, 0);
    const diffMinutes = (now.getTime() - scheduledDateTime.getTime()) / 60000;
    const status = diffMinutes <= constants_1.DEFAULTS.LATE_THRESHOLD_MINUTES ? "CONFIRMED" : "LATE";
    const updated = await prisma_1.default.medicationLog.update({
        where: { id: medicationLogId },
        data: { status, takenAt: now },
    });
    await removeMissedCheckJob(medicationLogId);
    return updated;
}
async function skipMedication(medicationLogId) {
    if (!medicationLogId)
        throw new errors_1.BadRequestError("medicationLogId is required");
    const existing = await prisma_1.default.medicationLog.findUnique({
        where: { id: medicationLogId },
    });
    if (!existing)
        throw new errors_1.NotFoundError("Medication log");
    const updated = await prisma_1.default.medicationLog.update({
        where: { id: medicationLogId },
        data: { status: "SKIPPED" },
    });
    await removeMissedCheckJob(medicationLogId);
    return updated;
}
async function getMedicationLogs(userId, date) {
    if (!userId)
        throw new errors_1.BadRequestError("userId is required");
    const targetDate = date ? (0, time_1.getDateUTC)(date) : (0, time_1.getTodayUTC)();
    const nextDay = new Date(targetDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    return prisma_1.default.medicationLog.findMany({
        where: {
            userId,
            scheduledDate: { gte: targetDate, lt: nextDay },
        },
        include: { medication: true },
        orderBy: { scheduledTime: "asc" },
    });
}
async function removeMissedCheckJob(medicationLogId) {
    try {
        const job = await medication_queue_1.medicationMissedQueue.getJob(`missed-check-${medicationLogId}`);
        if (job) {
            await job.remove();
            console.log(`🗑️ Removed missed check job for ${medicationLogId}`);
        }
    }
    catch (error) {
        console.error("Error removing missed check job:", error);
    }
}
function getPeriodRange(period, offset = 0) {
    const now = new Date();
    const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const end = new Date(start);
    switch (period) {
        case "daily":
            start.setUTCDate(start.getUTCDate() - offset);
            end.setUTCDate(start.getUTCDate() + 1);
            break;
        case "weekly":
            // Start of week (Sunday)
            const dayOfWeek = start.getUTCDay();
            start.setUTCDate(start.getUTCDate() - dayOfWeek - offset * 7);
            end.setUTCDate(start.getUTCDate() + 7);
            break;
        case "monthly":
            start.setUTCMonth(start.getUTCMonth() - offset, 1);
            end.setUTCMonth(start.getUTCMonth() + 1, 1);
            break;
    }
    return { start, end };
}
async function getStatsForPeriod(userId, start, end) {
    const logs = await prisma_1.default.medicationLog.findMany({
        where: {
            userId,
            scheduledDate: { gte: start, lt: end },
        },
    });
    const taken = logs.filter((log) => log.status === "CONFIRMED" || log.status === "LATE").length;
    const missed = logs.filter((log) => log.status === "MISSED").length;
    const skipped = logs.filter((log) => log.status === "SKIPPED").length;
    const pending = logs.filter((log) => log.status === "PENDING").length;
    const total = logs.length;
    // Adherence = taken / (total - pending - skipped) * 100
    // We exclude pending (not yet due) and skipped (intentional) from calculation
    const relevantTotal = total - pending - skipped;
    const adherence = relevantTotal > 0 ? Math.round((taken / relevantTotal) * 100) : 0;
    return { taken, missed, skipped, pending, total, adherence };
}
async function getIntakeStats(userId, period) {
    if (!userId)
        throw new errors_1.BadRequestError("userId is required");
    if (!["daily", "weekly", "monthly"].includes(period)) {
        throw new errors_1.BadRequestError("period must be daily, weekly, or monthly");
    }
    // Get current period stats
    const currentRange = getPeriodRange(period, 0);
    const currentStats = await getStatsForPeriod(userId, currentRange.start, currentRange.end);
    // Get previous period stats for comparison
    const previousRange = getPeriodRange(period, 1);
    const previousStats = await getStatsForPeriod(userId, previousRange.start, previousRange.end);
    // Calculate change
    const adherenceChange = currentStats.adherence - previousStats.adherence;
    const periodLabels = {
        daily: "yesterday",
        weekly: "last week",
        monthly: "last month",
    };
    return {
        period,
        adherence: currentStats.adherence,
        adherenceChange,
        comparisonLabel: `vs ${periodLabels[period]}`,
        taken: currentStats.taken,
        missed: currentStats.missed,
        skipped: currentStats.skipped,
        pending: currentStats.pending,
        total: currentStats.total,
        periodStart: currentRange.start.toISOString().split("T")[0],
        periodEnd: new Date(currentRange.end.getTime() - 1)
            .toISOString()
            .split("T")[0],
    };
}
// Get logs for a period with medication details
async function getLogsForPeriod(userId, period) {
    if (!userId)
        throw new errors_1.BadRequestError("userId is required");
    if (!["daily", "weekly", "monthly"].includes(period)) {
        throw new errors_1.BadRequestError("period must be daily, weekly, or monthly");
    }
    const { start, end } = getPeriodRange(period, 0);
    const logs = await prisma_1.default.medicationLog.findMany({
        where: {
            userId,
            scheduledDate: { gte: start, lt: end },
        },
        include: {
            medication: true,
            schedule: true,
        },
        orderBy: [{ scheduledDate: "desc" }, { scheduledTime: "asc" }],
    });
    // Transform to match schedule response format
    const formattedLogs = logs
        .map((log) => ({
        id: log.schedule?.id || null,
        logId: log.id,
        medicationId: log.medicationId,
        medicationName: log.medication.name,
        dosage: log.medication.dosage,
        unit: log.medication.unit,
        instructions: log.medication.instructions,
        scheduledDate: log.scheduledDate.toISOString().split("T")[0],
        time: log.scheduledTime,
        timeSlot: log.timeSlot,
        status: log.status,
        takenAt: log.takenAt,
    }))
        .sort((a, b) => {
        const timeA = (0, time_1.parseTime)(a.time);
        const timeB = (0, time_1.parseTime)(b.time);
        // Compare hours first, then minutes
        if (timeA.hours !== timeB.hours) {
            return timeA.hours - timeB.hours;
        }
        return timeA.minutes - timeB.minutes;
    });
    return {
        period,
        periodStart: start.toISOString().split("T")[0],
        periodEnd: new Date(end.getTime() - 1).toISOString().split("T")[0],
        logs: formattedLogs,
    };
}
//# sourceMappingURL=medication-log.service.js.map