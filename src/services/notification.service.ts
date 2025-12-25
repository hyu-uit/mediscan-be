import admin from "firebase-admin";
import prisma from "../utils/prisma";

// Initialize Firebase Admin SDK
// You need to set GOOGLE_APPLICATION_CREDENTIALS env var to your service account JSON path
// Or set FIREBASE_SERVICE_ACCOUNT env var with the JSON content
const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccount) {
    try {
      const credentials = JSON.parse(serviceAccount);
      return admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
    } catch (error) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", error);
    }
  }

  // Fallback to default credentials (GOOGLE_APPLICATION_CREDENTIALS env var)
  try {
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.warn("Firebase not configured. Push notifications disabled.");
    return null;
  }
};

const firebaseApp = initializeFirebase();

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
): Promise<boolean> {
  if (!firebaseApp) {
    console.log("📵 Firebase not configured, skipping push notification");
    return false;
  }

  try {
    // Get user's FCM token
    const settings = await prisma.userSettings.findUnique({
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

    const message: admin.messaging.Message = {
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

    const response = await admin.messaging().send(message);
    console.log(`✅ Push notification sent to user ${userId}:`, response);
    return true;
  } catch (error: unknown) {
    const fcmError = error as { code?: string };
    // Handle invalid token
    if (
      fcmError.code === "messaging/invalid-registration-token" ||
      fcmError.code === "messaging/registration-token-not-registered"
    ) {
      // Remove invalid token
      await prisma.userSettings.update({
        where: { userId },
        data: { fcmToken: null },
      });
      console.log(`🗑️ Removed invalid FCM token for user ${userId}`);
    }
    console.error(`❌ Failed to send push notification:`, error);
    return false;
  }
}

export async function sendMedicationReminder(
  userId: string,
  medicationName: string,
  scheduledTime: string,
  medicationLogId: string
): Promise<boolean> {
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

export async function sendMissedMedicationAlert(
  userId: string,
  medicationName: string
): Promise<boolean> {
  return sendPushNotification(userId, {
    title: "⚠️ Medication Missed",
    body: `You missed your ${medicationName}. Please take it now if possible.`,
    data: {
      type: "missed_medication",
    },
  });
}

export async function updateFcmToken(
  userId: string,
  fcmToken: string
): Promise<void> {
  await prisma.userSettings.upsert({
    where: { userId },
    update: { fcmToken },
    create: {
      userId,
      fcmToken,
    },
  });
  console.log(`📱 Updated FCM token for user ${userId}`);
}
