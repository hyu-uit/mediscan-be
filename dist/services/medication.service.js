"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMedication = createMedication;
exports.getMedications = getMedications;
exports.getMedicationsList = getMedicationsList;
exports.getMedicationById = getMedicationById;
exports.updateMedication = updateMedication;
exports.deleteMedication = deleteMedication;
const prisma_1 = __importDefault(require("../utils/prisma"));
const constants_1 = require("../constants");
// Helper to reverse lookup from a map
function reverseLookup(map, value, defaultKey) {
    const entry = Object.entries(map).find(([, v]) => v === value);
    return entry ? entry[0] : defaultKey;
}
const errors_1 = require("../utils/errors");
const medication_queue_1 = require("../queues/medication.queue");
const time_1 = require("../utils/time");
async function createMedication(data) {
    if (!data.userId)
        throw new errors_1.BadRequestError("userId is required");
    if (!data.name)
        throw new errors_1.BadRequestError("name is required");
    console.log(`\n🚀 ========== CREATE MEDICATION ==========`);
    console.log(`👤 User: ${data.userId}`);
    console.log(`💊 Medication: ${data.name}`);
    const result = await prisma_1.default.$transaction(async (tx) => {
        const medication = await tx.medication.create({
            data: {
                userId: data.userId,
                name: data.name,
                dosage: data.dosage,
                unit: data.unit || constants_1.DEFAULTS.DOSAGE_UNIT,
                instructions: data.instructions,
                notes: data.notes,
                frequencyType: data.frequencyType || constants_1.DEFAULTS.FREQUENCY_TYPE,
                intervalValue: data.intervalValue || constants_1.DEFAULTS.INTERVAL_VALUE,
                intervalUnit: data.intervalUnit || constants_1.DEFAULTS.INTERVAL_UNIT,
                selectedDays: data.selectedDays || [],
                imageUrl: data.imageUrl,
            },
        });
        if (data.intakeTimes && data.intakeTimes.length > 0) {
            await tx.schedule.createMany({
                data: data.intakeTimes.map((intake) => ({
                    medicationId: medication.id,
                    time: intake.time,
                    type: intake.type,
                })),
            });
        }
        return tx.medication.findUnique({
            where: { id: medication.id },
            include: { schedules: true },
        });
    });
    // Queue BullMQ reminders if medication created successfully
    if (result) {
        console.log(`✅ Created medication with ${result.schedules.length} schedules`);
        await queueRemindersForMedication(data.userId, result);
    }
    console.log(`🏁 ========== MEDICATION CREATED ==========\n`);
    return result;
}
// Queue reminders for a single medication
async function queueRemindersForMedication(userId, medication) {
    // Check if medication should be scheduled today based on frequency
    if (!(0, time_1.shouldScheduleToday)(medication)) {
        console.log(`⏭️ Skipping ${medication.name} (not scheduled for today based on frequency)`);
        return;
    }
    const today = (0, time_1.getTodayUTC)();
    let queuedCount = 0;
    let passedCount = 0;
    for (const schedule of medication.schedules) {
        const timePassed = (0, time_1.hasTimePassed)(schedule.time);
        const status = timePassed ? "MISSED" : "PENDING";
        // Create medication log
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
        if (timePassed) {
            console.log(`⏭️ ${medication.name} at ${schedule.time} (already passed, marked as MISSED)`);
            passedCount++;
        }
        else {
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
            console.log(`📅 Queued ${medication.name} at ${schedule.time} (${Math.round(delay / 60000)} mins)`);
            queuedCount++;
        }
    }
    console.log(`📊 Summary: ✅ Queued: ${queuedCount} | ⏰ Passed: ${passedCount}`);
}
async function getMedications(userId) {
    if (!userId)
        throw new errors_1.BadRequestError("userId is required");
    return prisma_1.default.medication.findMany({
        where: { userId, isActive: true },
        include: { schedules: true },
        orderBy: { createdAt: "desc" },
    });
}
// Helper function to format frequency string
function formatFrequencyString(medication) {
    const frequencyType = reverseLookup(constants_1.FREQUENCY_TYPE_MAP, medication.frequencyType, medication.frequencyType);
    if (frequencyType === "daily") {
        return "Daily";
    }
    else if (frequencyType === "interval") {
        const unit = reverseLookup(constants_1.INTERVAL_UNIT_MAP, medication.intervalUnit, medication.intervalUnit);
        return `Every ${medication.intervalValue} ${unit}`;
    }
    else if (frequencyType === "specific-days") {
        const days = medication.selectedDays;
        if (days.length === 0)
            return "No days selected";
        if (days.length === 7)
            return "Daily";
        return days
            .map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3))
            .join(", ");
    }
    return frequencyType;
}
// Helper function to get icon color based on first schedule type
function getIconColor(schedules) {
    if (schedules.length === 0)
        return undefined;
    const colorMap = {
        morning: "#FFB020",
        noon: "#FF6B6B",
        afternoon: "#4ECDC4",
        night: "#7C3AED",
        before_sleep: "#6366F1",
    };
    const firstType = schedules[0].type.toLowerCase();
    return colorMap[firstType];
}
async function getMedicationsList(userId) {
    if (!userId)
        throw new errors_1.BadRequestError("userId is required");
    const medications = await prisma_1.default.medication.findMany({
        where: { userId },
        include: { schedules: true },
        orderBy: { createdAt: "desc" },
    });
    const formattedMedications = medications.map((med) => ({
        id: med.id,
        name: med.name,
        dosage: med.dosage || "",
        unit: reverseLookup(constants_1.DOSAGE_UNIT_MAP, med.unit, "mg"),
        frequency: formatFrequencyString(med),
        instructions: med.instructions || "",
        status: med.isActive ? "active" : "inactive",
        iconColor: getIconColor(med.schedules),
    }));
    return {
        medications: formattedMedications,
        totalCount: medications.length,
    };
}
async function getMedicationById(id) {
    if (!id)
        throw new errors_1.BadRequestError("id is required");
    return prisma_1.default.medication.findUnique({
        where: { id },
        include: { schedules: true },
    });
}
async function updateMedication(id, data) {
    if (!id)
        throw new errors_1.BadRequestError("id is required");
    const existing = await prisma_1.default.medication.findUnique({ where: { id } });
    if (!existing)
        throw new errors_1.NotFoundError("Medication");
    const { intakeTimes, ...medicationData } = data;
    return prisma_1.default.$transaction(async (tx) => {
        await tx.medication.update({
            where: { id },
            data: medicationData,
        });
        if (intakeTimes !== undefined) {
            await tx.schedule.deleteMany({ where: { medicationId: id } });
            if (intakeTimes.length > 0) {
                await tx.schedule.createMany({
                    data: intakeTimes.map((intake) => ({
                        medicationId: id,
                        time: intake.time,
                        type: intake.type,
                    })),
                });
            }
        }
        return tx.medication.findUnique({
            where: { id },
            include: { schedules: true },
        });
    });
}
async function deleteMedication(id) {
    if (!id)
        throw new errors_1.BadRequestError("id is required");
    const existing = await prisma_1.default.medication.findUnique({ where: { id } });
    if (!existing)
        throw new errors_1.NotFoundError("Medication");
    return prisma_1.default.medication.delete({ where: { id } });
}
//# sourceMappingURL=medication.service.js.map