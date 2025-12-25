import { Router } from "express";
import multer from "multer";
import * as scanController from "../controllers/scan.controller";

const router = Router();

// Configure multer for memory storage (file stays in memory as buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

router.post("/", upload.single("file"), scanController.scanDocument);

export default router;
