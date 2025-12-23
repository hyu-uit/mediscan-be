import { Router } from "express";
import * as userSettingsController from "../controllers/user-settings.controller";

const router = Router();

router.get("/", userSettingsController.getUserSettings);
router.post("/", userSettingsController.createUserSettings);
router.patch("/", userSettingsController.updateUserSettings);
router.put("/", userSettingsController.upsertUserSettings);
router.delete("/", userSettingsController.deleteUserSettings);

export default router;
