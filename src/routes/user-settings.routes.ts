import { Router } from "express";
import * as userSettingsController from "../controllers/user-settings.controller";

const router = Router();

router.get("/", userSettingsController.getUserSettings);
router.post("/", userSettingsController.createUserSettings);
router.patch("/", userSettingsController.updateUserSettings);
router.put("/", userSettingsController.upsertUserSettings);
router.delete("/", userSettingsController.deleteUserSettings);

// FCM token registration
router.post("/fcm-token", userSettingsController.registerFcmToken);

export default router;
