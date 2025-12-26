export declare function scheduleUserMedications(userId: string): Promise<{
    queued: number;
    skipped: number;
}>;
export declare function scheduleAllUserMedications(): Promise<{
    usersProcessed: number;
    totalQueued: number;
}>;
//# sourceMappingURL=medication-scheduler.service.d.ts.map