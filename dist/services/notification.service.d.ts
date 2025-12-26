interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}
export declare function sendPushNotification(userId: string, payload: NotificationPayload): Promise<boolean>;
export declare function sendMedicationReminder(userId: string, medicationName: string, scheduledTime: string, medicationLogId: string): Promise<boolean>;
export declare function sendMissedMedicationAlert(userId: string, medicationName: string): Promise<boolean>;
export declare function updateFcmToken(userId: string, fcmToken: string): Promise<void>;
export {};
//# sourceMappingURL=notification.service.d.ts.map