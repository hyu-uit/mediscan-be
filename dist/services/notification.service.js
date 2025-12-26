"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = sendPushNotification;
exports.sendMedicationReminder = sendMedicationReminder;
exports.sendMissedMedicationAlert = sendMissedMedicationAlert;
exports.updateFcmToken = updateFcmToken;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const prisma_1 = __importDefault(require("../utils/prisma"));
// Initialize Firebase Admin SDK
// You need to set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON path
// Or set FIREBASE_SERVICE_ACCOUNT env var with the JSON content
const initializeFirebase = () => {
    if (firebase_admin_1.default.apps.length > 0) {
        return firebase_admin_1.default.app();
    }
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccount) {
        try {
            const credentials = JSON.parse(serviceAccount);
            return firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(credentials),
            });
        }
        catch (error) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", error);
        }
    }
    // Fallback to default credentials (GOOGLE_APPLICATION_CREDENTIALS env var)
    try {
        return firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.applicationDefault(),
        });
    }
    catch (error) {
        console.warn("Firebase not configured. Push notifications disabled.");
        return null;
    }
};
const firebaseApp = initializeFirebase();
async function sendPushNotification(userId, payload) {
    if (!firebaseApp) {
        console.log("📵 Firebase not configured, skipping push notification");
        return false;
    }
    try {
        // Get user's FCM token
        const settings = await prisma_1.default.userSettings.findUnique({
            where: { userId },
        });
        if (!settings?.fcmToken) {
            console.log(`📵 No FCM token for user ${userId}`);
            return false;
        }
        if (!settings.pushNotifications) {
            console.log(`📵 Push notifications disabled for user ${userId}`);
            return false;
        }
        const message = {
            token: settings.fcmToken,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data,
            android: {
                priority: "high",
                notification: {
                    sound: "default",
                    channelId: "medication_reminders",
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: "default",
                        badge: 1,
                    },
                },
            },
        };
        const response = await firebase_admin_1.default.messaging().send(message);
        console.log(`✅ Push notification sent to user ${userId}:`, response);
        return true;
    }
    catch (error) {
        const fcmError = error;
        // Handle invalid token
        if (fcmError.code === "messaging/invalid-registration-token" ||
            fcmError.code === "messaging/registration-token-not-registered") {
            // Remove invalid token
            await prisma_1.default.userSettings.update({
                where: { userId },
                data: { fcmToken: null },
            });
            console.log(`🗑️ Removed invalid FCM token for user ${userId}`);
        }
        console.error(`❌ Failed to send push notification:`, error);
        return false;
    }
}
async function sendMedicationReminder(userId, medicationName, scheduledTime, medicationLogId) {
    return sendPushNotification(userId, {
        title: "💊 Time to take your medication",
        body: `It's time to take ${medicationName} (${scheduledTime})`,
        data: {
            type: "medication_reminder",
            medicationLogId,
            action: "take_medication",
        },
    });
}
async function sendMissedMedicationAlert(userId, medicationName) {
    return sendPushNotification(userId, {
        title: "⚠️ Medication Missed",
        body: `You missed your ${medicationName}. Please take it now if possible.`,
        data: {
            type: "missed_medication",
        },
    });
}
async function updateFcmToken(userId, fcmToken) {
    await prisma_1.default.userSettings.upsert({
        where: { userId },
        update: { fcmToken },
        create: {
            userId,
            fcmToken,
        },
    });
    console.log(`📱 Updated FCM token for user ${userId}`);
}
//# sourceMappingURL=notification.service.js.map