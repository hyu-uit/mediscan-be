"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleUserMedications = scheduleUserMedications;
exports.scheduleAllUserMedications = scheduleAllUserMedications;
const prisma_1 = __importDefault(require("../utils/prisma"));
const medication_queue_1 = require("../queues/medication.queue");
const time_1 = require("../utils/time");
async function queueReminderForSchedule(userId, schedule, today) {
    try {
        const timePassed = (0, time_1.hasTimePassed)(schedule.time);
        // Set status based on whether time has passed
        // MISSED for passed times, PENDING for upcoming times
        const status = timePassed ? "MISSED" : "PENDING";
        // Always create the medication log with scheduleId link
        const medicationLog = await prisma_1.default.medicationLog.create({
            data: {
                userId,
                medicationId: schedule.medication.id,
                scheduleId: schedule.id,
                timeSlot: schedule.type,
                scheduledDate: today,
                scheduledTime: schedule.time,
                status,
            },
        });
        // If time has passed, don't queue reminder
        if (timePassed) {
            console.log(`⏭️ Created log for ${schedule.medication.name} at ${schedule.time} (already passed, marked as MISSED)`);
            return true;
        }
        // Queue the reminder job for future times
        const delay = (0, time_1.getDelayUntil)(schedule.time);
        await medication_queue_1.medicationReminderQueue.add("send-reminder", {
            medicationLogId: medicationLog.id,
            userId,
            medicationId: schedule.medication.id,
            medicationName: schedule.medication.name,
            timeSlot: schedule.type,
            scheduledTime: schedule.time,
        }, { delay, jobId: `reminder-${medicationLog.id}` });
        console.log(`📅 Scheduled ${schedule.medication.name} at ${schedule.time} (${Math.round(delay / 60000)} mins, status: PENDING)`);
        return true;
    }
    catch (error) {
        console.error(`❌ Failed to schedule ${schedule.medication.name}:`, error);
        return false;
    }
}
async function scheduleUserMedications(userId) {
    const today = (0, time_1.getTodayUTC)();
    const medications = await prisma_1.default.medication.findMany({
        where: { userId, isActive: true },
        include: { schedules: { where: { isActive: true } } },
    });
    // Filter medications that should be scheduled today based on frequency
    const medicationsToSchedule = medications.filter(time_1.shouldScheduleToday);
    console.log(`📋 User ${userId}: ${medicationsToSchedule.length}/${medications.length} medications scheduled for today`);
    const allSchedules = [];
    for (const medication of medicationsToSchedule) {
        for (const schedule of medication.schedules) {
            allSchedules.push({
                ...schedule,
                medication: { id: medication.id, name: medication.name },
            });
        }
    }
    const results = await Promise.all(allSchedules.map((schedule) => queueReminderForSchedule(userId, schedule, today)));
    const queued = results.filter(Boolean).length;
    console.log(`✅ User ${userId}: ${queued} reminders queued`);
    return { queued, skipped: results.length - queued };
}
async function scheduleAllUserMedications() {
    console.log("🚀 Starting daily medication scheduling...");
    const users = await prisma_1.default.user.findMany({ select: { id: true } });
    const results = await Promise.all(users.map((user) => scheduleUserMedications(user.id)));
    const totalQueued = results.reduce((sum, r) => sum + r.queued, 0);
    console.log(`✅ Scheduled ${totalQueued} reminders for ${users.length} users`);
    return { usersProcessed: users.length, totalQueued };
}
//# sourceMappingURL=medication-scheduler.service.js.map