// API service for communicating with the backend
const API_BASE_URL = 'http://localhost:3001/api';

export interface TranscriptionResult {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  transcription: {
    transcript: Array<{
      speaker: string;
      text: string;
      startTime: number;
      endTime: number;
      confidence: number;
    }>;
    speakers: Array<{
      id: string;
      totalSpeakingTime: number;
      speakingPercentage: number;
      characteristics: string;
    }>;
    keyTopics: Array<{
      topic: string;
      startTime: number;
      endTime: number;
      importance: 'high' | 'medium' | 'low';
    }>;
    actionItems: Array<{
      task: string;
      assignee: string;
      priority: 'high' | 'medium' | 'low';
      timestamp: number;
    }>;
    summary: string;
    duration: number;
    wordCount: number;
    speakingRate: number;
  };
  summary: {
    executiveSummary: string;
    keyDecisions: string[];
    actionItems: Array<{
      task: string;
      assignee: string;
      priority: 'high' | 'medium' | 'low';
      dueDate?: string;
      timestamp: number;
    }>;
    discussionPoints: Array<{
      topic: string;
      description: string;
      timestamp: number;
      importance: 'high' | 'medium' | 'low';
    }>;
    nextSteps: string[];
    sentiment: {
      overall: 'positive' | 'neutral' | 'negative';
      score: number;
      highlights: string[];
    };
  };
  status: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async uploadAndTranscribe(audioFile: File): Promise<TranscriptionResult> {
    const formData = new FormData();
    formData.append('audio', audioFile);

    return this.makeRequest<TranscriptionResult>('/transcription/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async transcribeOnly(audioFile: File): Promise<TranscriptionResult> {
    const formData = new FormData();
    formData.append('audio', audioFile);

    return this.makeRequest<TranscriptionResult>('/transcription/transcribe', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async generateSummary(transcriptData: any): Promise<any> {
    return this.makeRequest('/summary/generate', {
      method: 'POST',
      body: JSON.stringify({ transcriptData }),
    });
  }

  async analyzeSentiment(text: string): Promise<any> {
    return this.makeRequest('/summary/analyze-sentiment', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async extractActionItems(transcriptData: any): Promise<any> {
    return this.makeRequest('/summary/extract-action-items', {
      method: 'POST',
      body: JSON.stringify({ transcriptData }),
    });
  }

  async getSupportedFormats(): Promise<any> {
    return this.makeRequest('/transcription/formats');
  }

  async healthCheck(): Promise<any> {
    return this.makeRequest('/health');
  }
}

export const apiService = new ApiService();

