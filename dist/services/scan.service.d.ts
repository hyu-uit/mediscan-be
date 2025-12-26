export interface ScanResult {
    medications: Array<{
        id: string;
        name: string;
        dosage: string | null;
        unit: string | null;
        instructions: string | null;
        notes: string | null;
        frequencyType: string | null;
        intervalValue: string | null;
        intervalUnit: string | null;
        selectedDays: string[] | null;
        intakeTimes: Array<{
            id: string;
            time: string;
            type: string;
        }> | null;
    }>;
    rawText: string;
    confidence: number;
}
export declare function scanDocument(file: Express.Multer.File): Promise<ScanResult>;
//# sourceMappingURL=scan.service.d.ts.map