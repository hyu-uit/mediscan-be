"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const node_cron_1 = __importDefault(require("node-cron"));
dotenv_1.default.config();
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const medication_routes_1 = __importDefault(require("./routes/medication.routes"));
const schedule_routes_1 = __importDefault(require("./routes/schedule.routes"));
const user_settings_routes_1 = __importDefault(require("./routes/user-settings.routes"));
const medication_log_routes_1 = __importDefault(require("./routes/medication-log.routes"));
const scan_routes_1 = __importDefault(require("./routes/scan.routes"));
const auth_middleware_1 = require("./middleware/auth.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const medication_scheduler_service_1 = require("./services/medication-scheduler.service");
require("./workers/medication-reminder.worker");
require("./workers/medication-missed.worker");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/medications", auth_middleware_1.authMiddleware, medication_routes_1.default);
app.use("/api/schedules", auth_middleware_1.authMiddleware, schedule_routes_1.default);
app.use("/api/user-settings", auth_middleware_1.authMiddleware, user_settings_routes_1.default);
app.use("/api/medication-logs", auth_middleware_1.authMiddleware, medication_log_routes_1.default);
app.use("/api/scan", auth_middleware_1.authMiddleware, scan_routes_1.default);
// Error Handling
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
// Daily cron job: Schedule all user medications at midnight
node_cron_1.default.schedule("0 0 * * *", async () => {
    console.log("🕛 [CRON] Running daily medication scheduler...");
    try {
        const result = await (0, medication_scheduler_service_1.scheduleAllUserMedications)();
        console.log(`✅ [CRON] Scheduled ${result.totalQueued} reminders for ${result.usersProcessed} users`);
    }
    catch (error) {
        console.error("❌ [CRON] Failed to schedule medications:", error);
    }
});
process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
//# sourceMappingURL=index.js.map