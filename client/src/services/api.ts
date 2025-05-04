import axios, { AxiosProgressEvent } from "axios";

const API_URL = "http://localhost:3000"; // Update this to your actual backend URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface FollowUpQuestion {
  id: string;
  text: string;
}

export interface ChatResponse {
  message: ChatMessage;
  followUpQuestions?: FollowUpQuestion[];
  chartData?: {
    url?: string;
    type?: string;
    data?: unknown;
  };
}

export interface UploadResponse {
  success: boolean;
  fileIds: string[];
  message: string;
}

export const uploadFiles = async (
  files: File[],
  onProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<UploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  try {
    const response = await api.post<UploadResponse>("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: onProgress,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Upload error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Failed to upload files"
      );
    }
    throw error;
  }
};

export const sendChatMessage = async (
  message: string,
  history: ChatMessage[]
): Promise<ChatResponse> => {
  try {
    const response = await api.post<ChatResponse>("/chat", {
      message,
      history,
    });
    return response.data;
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};

export const generateChart = async (
  prompt: string,
  data?: unknown
): Promise<ChatResponse> => {
  try {
    const response = await api.post<ChatResponse>("/chart", {
      prompt,
      data,
    });
    return response.data;
  } catch (error) {
    console.error("Chart generation error:", error);
    throw error;
  }
};

// Mock API responses for development
export const mockUploadFiles = async (
  files: File[]
): Promise<UploadResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        fileIds: files.map((_, i) => `file-${i}-${Date.now()}`),
        message: `Successfully uploaded ${files.length} files.`,
      });
    }, 1500);
  });
};

export const mockSendChatMessage = async (
  message: string,
  history: ChatMessage[]
): Promise<ChatResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const hasChartRequest =
        message.toLowerCase().includes("chart") ||
        message.toLowerCase().includes("graph") ||
        message.toLowerCase().includes("plot");

      resolve({
        message: {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: hasChartRequest
            ? "Here's the chart you requested based on the document data."
            : "Based on the documents you've uploaded, I can provide the following information: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          timestamp: Date.now(),
        },
        followUpQuestions: [
          {
            id: `q1-${Date.now()}`,
            text: "Can you summarize the main findings?",
          },
          {
            id: `q2-${Date.now()}`,
            text: "What are the key trends in the data?",
          },
          {
            id: `q3-${Date.now()}`,
            text: "How does this compare to industry standards?",
          },
        ],
        chartData: hasChartRequest
          ? {
              type: "bar",
              data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [
                  {
                    label: "Revenue",
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: "rgba(126, 105, 171, 0.6)",
                  },
                ],
              },
            }
          : undefined,
      });
    }, 1500);
  });
};

export const mockGenerateChart = async (
  prompt: string
): Promise<ChatResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        message: {
          id: `chart-${Date.now()}`,
          role: "assistant",
          content: "I've regenerated the chart based on your request.",
          timestamp: Date.now(),
        },
        chartData: {
          type: prompt.toLowerCase().includes("line") ? "line" : "bar",
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
              {
                label: "Data",
                data: Array.from(
                  { length: 6 },
                  () => Math.floor(Math.random() * 20) + 1
                ),
                backgroundColor: "rgba(126, 105, 171, 0.6)",
                borderColor: "rgba(126, 105, 171, 1)",
              },
            ],
          },
        },
      });
    }, 1500);
  });
};

// Choose which API to use (mock or real)
export const apiService = {
  uploadFiles, // Using real API implementation
  sendChatMessage, // Using real API implementation
  generateChart, // Using real API implementation
};

export default apiService;
