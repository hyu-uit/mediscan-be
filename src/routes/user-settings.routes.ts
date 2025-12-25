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

// Toggle settings
router.post(
  "/toggle/push-notifications",
  userSettingsController.togglePushNotifications
);
router.post(
  "/toggle/automated-calls",
  userSettingsController.toggleAutomatedCalls
);
router.post("/toggle/dark-mode", userSettingsController.toggleDarkMode);

export default router;
