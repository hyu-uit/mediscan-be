"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicationMissedQueue = exports.medicationReminderQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../config/redis"));
// Queue for sending medication reminders
exports.medicationReminderQueue = new bullmq_1.Queue("medication-reminder", {
    connection: redis_1.default,
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
    },
});
// Queue for checking missed medications (runs 10 mins after reminder)
exports.medicationMissedQueue = new bullmq_1.Queue("medication-missed", {
    connection: redis_1.default,
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
    },
});
//# sourceMappingURL=medication.queue.js.map