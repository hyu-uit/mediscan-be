"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBulkMedicationsWithSchedules = createBulkMedicationsWithSchedules;
exports.createSchedule = createSchedule;
exports.getSchedulesByMedication = getSchedulesByMedication;
exports.updateSchedule = updateSchedule;
exports.deleteSchedule = deleteSchedule;
exports.getTodaySchedule = getTodaySchedule;
exports.getScheduleByDate = getScheduleByDate;
const prisma_1 = __importDefault(require("../utils/prisma"));
const medication_queue_1 = require("../queues/medication.queue");
const time_1 = require("../utils/time");
const errors_1 = require("../utils/errors");
// Create medications and schedules in transaction
async function createMedicationsInTransaction(userId, medications) {
    return prisma_1.default.$transaction(async (tx) => {
        const results = [];
        for (const med of medications) {
            const medication = await tx.medication.create({
                data: {
                    userId,
                    name: med.name,
                    dosage: med.dosage,
                    unit: med.unit || "MG",
                    instructions: med.instructions,
                    notes: med.notes,
                    frequencyType: med.frequencyType || "DAILY",
                    intervalValue: med.intervalValue
                        ? parseInt(med.intervalValue, 10)
                        : 1,
                    intervalUnit: med.intervalUnit || "DAYS",
                    selectedDays: med.selectedDays || [],
                },
            });
            if (med.intakeTimes && med.intakeTimes.length > 0) {
                await tx.schedule.createMany({
                    data: med.intakeTimes.map((intake) => ({
                        medicationId: medication.id,
                        time: intake.time,
                        type: intake.type,
                    })),
                });
            }
            const medicationWithSchedules = await tx.medication.findUnique({
                where: { id: medication.id },
                include: { schedules: true },
            });
            results.push(medicationWithSchedules);
        }
        return results;
    });
}
// Queue a single reminder
async function queueSingleReminder(userId, medication, schedule) {
    try {
        const today = (0, time_1.getTodayUTC)();
        const timePassed = (0, time_1.hasTimePassed)(schedule.time);
        // Set status based on whether time has passed
        // MISSED for passed times, PENDING for upcoming times
        const status = timePassed ? "MISSED" : "PENDING";
        // Always create the medication log with scheduleId link
        const medicationLog = await prisma_1.default.medicationLog.create({
            data: {
                userId,
                medicationId: medication.id,
                scheduleId: schedule.id,
                timeSlot: schedule.type,
                scheduledDate: today,
                scheduledTime: schedule.time,
                status,
            },
        });
        // If time has passed, don't queue reminder
        if (timePassed) {
            console.log(`⏭️ Created log for ${medication.name} at ${schedule.time} (already passed, marked as MISSED)`);
            return true;
        }
        // Queue the reminder job for future times
        const delay = (0, time_1.getDelayUntil)(schedule.time);
        await medication_queue_1.medicationReminderQueue.add("send-reminder", {
            medicationLogId: medicationLog.id,
            userId,
            medicationId: medication.id,
            medicationName: medication.name,
            timeSlot: schedule.type,
            scheduledTime: schedule.time,
        }, { delay, jobId: `reminder-${medicationLog.id}` });
        console.log(`📅 Queued ${medication.name} at ${schedule.time} (${Math.round(delay / 60000)} mins, status: PENDING)`);
        return true;
    }
    catch (error) {
        console.error(`❌ Failed to queue ${medication.name}:`, error);
        return false;
    }
}
// Queue reminders for all medications
async function queueRemindersForMedications(userId, medications) {
    const promises = [];
    let queuedCount = 0;
    let skippedFrequencyCount = 0;
    let passedCount = 0;
    for (const medication of medications) {
        if (!medication)
            continue;
        // Check if medication should be scheduled today based on frequency
        if (!(0, time_1.shouldScheduleToday)(medication)) {
            console.log(`⏭️ Skipping ${medication.name} (not scheduled for today based on frequency)`);
            skippedFrequencyCount++;
            continue;
        }
        console.log(`💊 Processing: ${medication.name} (${medication.schedules.length} schedules)`);
        for (const schedule of medication.schedules) {
            const isPassed = (0, time_1.hasTimePassed)(schedule.time);
            if (isPassed) {
                passedCount++;
            }
            else {
                queuedCount++;
            }
            promises.push(queueSingleReminder(userId, medication, schedule));
        }
    }
    await Promise.all(promises);
    console.log(`\n📊 ========== QUEUE SUMMARY ==========`);
    console.log(`   ✅ Queued for notification: ${queuedCount}`);
    console.log(`   ⏰ Already passed (MISSED): ${passedCount}`);
    console.log(`   🔄 Skipped (frequency): ${skippedFrequencyCount}`);
}
// Public API
async function createBulkMedicationsWithSchedules(userId, medications) {
    if (!userId)
        throw new errors_1.BadRequestError("userId is required");
    if (!medications?.length)
        throw new errors_1.BadRequestError("medications are required");
    console.log(`\n🚀 ========== BULK MEDICATION CREATION ==========`);
    console.log(`👤 User: ${userId}`);
    console.log(`💊 Medications to create: ${medications.length}`);
    const createdMedications = await createMedicationsInTransaction(userId, medications);
    console.log(`✅ Created ${createdMedications.length} medications in database`);
    console.log(`\n📋 ========== QUEUING REMINDERS ==========`);
    await queueRemindersForMedications(userId, createdMedications);
    console.log(`🏁 ========== BULK CREATION COMPLETE ==========\n`);
    return createdMedications;
}
async function createSchedule(data) {
    if (!data.medicationId || !data.time || !data.type) {
        throw new errors_1.BadRequestError("medicationId, time, and type are required");
    }
    return prisma_1.default.schedule.create({
        data: { medicationId: data.medicationId, time: data.time, type: data.type },
        include: { medication: true },
    });
}
async function getSchedulesByMedication(medicationId) {
    if (!medicationId)
        throw new errors_1.BadRequestError("medicationId is required");
    return prisma_1.default.schedule.findMany({
        where: { medicationId, isActive: true },
        orderBy: { createdAt: "asc" },
    });
}
async function updateSchedule(id, data) {
    if (!id)
        throw new errors_1.BadRequestError("id is required");
    return prisma_1.default.schedule.update({ where: { id }, data });
}
async function deleteSchedule(id) {
    if (!id)
        throw new errors_1.BadRequestError("id is required");
    return prisma_1.default.schedule.delete({ where: { id } });
}
// Get today's schedule for home screen
async function getTodaySchedule(userId) {
    if (!userId)
        throw new errors_1.BadRequestError("userId is required");
    const today = (0, time_1.getTodayUTC)();
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    // Get medications with schedules and their logs for today (using scheduleId JOIN)
    const medications = await prisma_1.default.medication.findMany({
        where: { userId, isActive: true },
        include: {
            schedules: {
                where: { isActive: true },
                orderBy: { time: "asc" },
                include: {
                    medicationLogs: {
                        where: {
                            scheduledDate: { gte: today, lt: tomorrow },
                        },
                        take: 1, // Only get today's log for this schedule
                    },
                },
            },
        },
    });
    // Filter medications that should be scheduled today
    const medicationsToday = medications.filter(time_1.shouldScheduleToday);
    // Flatten schedules with medication info and status
    const todaySchedules = medicationsToday.flatMap((medication) => medication.schedules.map((schedule) => {
        const log = schedule.medicationLogs[0]; // Today's log for this schedule
        return {
            id: schedule.id,
            logId: log?.id || null,
            medicationId: medication.id,
            medicationName: medication.name,
            dosage: medication.dosage,
            unit: medication.unit,
            instructions: medication.instructions,
            time: schedule.time,
            timeSlot: schedule.type,
            status: log?.status || null,
            takenAt: log?.takenAt || null,
            isPassed: (0, time_1.hasTimePassed)(schedule.time),
        };
    }));
    // Sort by time (convert to 24-hour format for correct ordering)
    todaySchedules.sort((a, b) => {
        const timeA = (0, time_1.parseTime)(a.time);
        const timeB = (0, time_1.parseTime)(b.time);
        // Compare hours first, then minutes
        if (timeA.hours !== timeB.hours) {
            return timeA.hours - timeB.hours;
        }
        return timeA.minutes - timeB.minutes;
    });
    // Count remaining (not taken/skipped and not passed)
    const remainingCount = todaySchedules.filter((s) => !s.isPassed &&
        s.status !== "CONFIRMED" &&
        s.status !== "LATE" &&
        s.status !== "SKIPPED").length;
    return {
        schedules: todaySchedules,
        totalCount: todaySchedules.length,
        remainingCount,
    };
}
// Get schedule for a specific date
async function getScheduleByDate(userId, date) {
    if (!userId)
        throw new errors_1.BadRequestError("userId is required");
    if (!date)
        throw new errors_1.BadRequestError("date is required");
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
        throw new errors_1.BadRequestError("Invalid date format. Use YYYY-MM-DD");
    }
    const target = (0, time_1.getDateUTC)(targetDate);
    const nextDay = new Date(target);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    // Get medications with schedules and their logs for target date (using scheduleId JOIN)
    const medications = await prisma_1.default.medication.findMany({
        where: { userId, isActive: true },
        include: {
            schedules: {
                where: { isActive: true },
                orderBy: { time: "asc" },
                include: {
                    medicationLogs: {
                        where: {
                            scheduledDate: { gte: target, lt: nextDay },
                        },
                        take: 1, // Only get the log for this date
                    },
                },
            },
        },
    });
    // Filter medications that should be scheduled on the target date
    const medicationsForDate = medications.filter((med) => (0, time_1.shouldScheduleOnDate)(med, targetDate));
    // Check if target date is today (for isPassed calculation)
    const today = (0, time_1.getTodayUTC)();
    const isToday = today.getTime() === target.getTime();
    // Flatten schedules with medication info and status
    const schedules = medicationsForDate.flatMap((medication) => medication.schedules.map((schedule) => {
        const log = schedule.medicationLogs[0]; // Log for this schedule on target date
        return {
            id: schedule.id,
            logId: log?.id || null,
            medicationId: medication.id,
            medicationName: medication.name,
            dosage: medication.dosage,
            unit: medication.unit,
            instructions: medication.instructions,
            time: schedule.time,
            timeSlot: schedule.type,
            status: log?.status || null,
            takenAt: log?.takenAt || null,
            isPassed: isToday ? (0, time_1.hasTimePassed)(schedule.time) : target < today,
        };
    }));
    // Sort by time (convert to 24-hour format for correct ordering)
    schedules.sort((a, b) => {
        const timeA = (0, time_1.parseTime)(a.time);
        const timeB = (0, time_1.parseTime)(b.time);
        // Compare hours first, then minutes
        if (timeA.hours !== timeB.hours) {
            return timeA.hours - timeB.hours;
        }
        return timeA.minutes - timeB.minutes;
    });
    return { schedules };
}
//# sourceMappingURL=schedule.service.js.map