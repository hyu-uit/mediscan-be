import axios from "axios";
import FormData from "form-data";

const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://localhost:2332";

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

export async function scanDocument(
  file: Express.Multer.File
): Promise<ScanResult> {
  const formData = new FormData();
  formData.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  console.log(`📷 Scanning document: ${file.originalname}`);
  console.log(`🔗 AI Server: ${AI_SERVER_URL}/scan`);

  try {
    const response = await axios.post<ScanResult>(
      `${AI_SERVER_URL}/scan`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000, // 60 second timeout for AI processing
      }
    );

    console.log(
      `✅ Scan complete: ${
        response.data.medications?.length || 0
      } medications found`
    );

    return {
      medications: response.data.medications,
      rawText: response.data.rawText,
      confidence: response.data.confidence,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ AI Server error:`);
      console.error(`  Status: ${error.response?.status || "N/A"}`);
      console.error(`  Status Text: ${error.response?.statusText || "N/A"}`);
      console.error(`  URL: ${error.config?.url || "N/A"}`);
      console.error(
        `  Response Data:`,
        JSON.stringify(error.response?.data, null, 2)
      );
      console.error(`  Error Message: ${error.message}`);
      if (error.code) {
        console.error(`  Error Code: ${error.code}`);
      }
      throw new Error(
        error.response?.data?.message || "Failed to scan document"
      );
    }
    console.error(`❌ Unexpected error during scan:`, error);
    throw error;
  }
}
