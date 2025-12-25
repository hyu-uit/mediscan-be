import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

import authRoutes from "./routes/auth.routes";
import medicationRoutes from "./routes/medication.routes";
import scheduleRoutes from "./routes/schedule.routes";
import userSettingsRoutes from "./routes/user-settings.routes";
import medicationLogRoutes from "./routes/medication-log.routes";

import { authMiddleware } from "./middleware/auth.middleware";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

import "./workers/medication-reminder.worker";
import "./workers/medication-missed.worker";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/medications", authMiddleware, medicationRoutes);
app.use("/api/schedules", authMiddleware, scheduleRoutes);
app.use("/api/user-settings", authMiddleware, userSettingsRoutes);
app.use("/api/medication-logs", authMiddleware, medicationLogRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
