import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.routes";
import medicationRoutes from "./routes/medication.routes";
import scheduleRoutes from "./routes/schedule.routes";
import userSettingsRoutes from "./routes/user-settings.routes";
import medicationLogRoutes from "./routes/medication-log.routes";
import { authMiddleware } from "./middleware/auth.middleware";

// Import workers to start them
import "./workers/medication-reminder.worker";
import "./workers/medication-missed.worker";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/medications", authMiddleware, medicationRoutes);
app.use("/api/schedules", authMiddleware, scheduleRoutes);
app.use("/api/user-settings", authMiddleware, userSettingsRoutes);
app.use("/api/medication-logs", authMiddleware, medicationLogRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
