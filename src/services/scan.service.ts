import axios from "axios";
import FormData from "form-data";

const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://localhost:2332";

export interface ScanResult {
  success: boolean;
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

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `❌ AI Server error:`,
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to scan document"
      );
    }
    throw error;
  }
}
