const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs-extra');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');

class GeminiTranscriptionService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Convert audio file to base64 for Gemini API
   */
  async convertAudioToBase64(filePath) {
    try {
      const audioBuffer = await fs.readFile(filePath);
      return audioBuffer.toString('base64');
    } catch (error) {
      throw new Error(`Failed to read audio file: ${error.message}`);
    }
  }

  /**
   * Convert audio to WAV format for better compatibility
   */
  async convertToWav(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('wav')
        .audioChannels(1)
        .audioFrequency(16000)
        .on('end', () => {
          console.log('Audio conversion completed');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('Audio conversion error:', err);
          reject(err);
        })
        .save(outputPath);
    });
  }

  /**
   * Transcribe audio using Gemini API with speaker diarization
   */
  async transcribeAudio(audioPath, options = {}) {
    try {
      console.log('Starting transcription process...');
      
      // Convert to WAV if needed
      const tempWavPath = path.join(process.env.TEMP_DIR || './temp', `${uuidv4()}.wav`);
      await this.convertToWav(audioPath, tempWavPath);
      
      // Convert to base64
      const audioBase64 = await this.convertAudioToBase64(tempWavPath);
      
      // Prepare the prompt for Gemini
      const prompt = `
        Please transcribe this audio file and provide a detailed analysis including:
        
        1. Full transcript with speaker identification (Speaker 1, Speaker 2, etc.)
        2. Timestamps for each speaker segment
        3. Speaker diarization analysis (distinguish between different voices)
        4. Key topics discussed
        5. Action items mentioned
        6. Meeting summary
        
        Format the response as JSON with the following structure:
        {
          "transcript": [
            {
              "speaker": "Speaker 1",
              "text": "transcribed text here",
              "startTime": 0.0,
              "endTime": 5.2,
              "confidence": 0.95
            }
          ],
          "speakers": [
            {
              "id": "Speaker 1",
              "totalSpeakingTime": 120.5,
              "speakingPercentage": 45.2,
              "characteristics": "description of voice characteristics"
            }
          ],
          "keyTopics": [
            {
              "topic": "topic name",
              "startTime": 0.0,
              "endTime": 30.0,
              "importance": "high|medium|low"
            }
          ],
          "actionItems": [
            {
              "task": "action item description",
              "assignee": "person mentioned",
              "priority": "high|medium|low",
              "timestamp": 45.2
            }
          ],
          "summary": "overall meeting summary",
          "duration": 1800.5,
          "wordCount": 2500,
          "speakingRate": 1.4
        }
        
        Please ensure accurate speaker identification and provide timestamps in seconds.
      `;

      // Generate content using Gemini
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'audio/wav',
            data: audioBase64
          }
        }
      ]);

      const response = await result.response;
      const transcriptionData = response.text();

      // Clean up temporary file
      await fs.remove(tempWavPath);

      // Parse the JSON response
      try {
        const parsedData = JSON.parse(transcriptionData);
        return parsedData;
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
        // Return a fallback structure if parsing fails
        return {
          transcript: [{ speaker: 'Speaker 1', text: transcriptionData, startTime: 0, endTime: 0, confidence: 0.8 }],
          speakers: [{ id: 'Speaker 1', totalSpeakingTime: 0, speakingPercentage: 100, characteristics: 'Unknown' }],
          keyTopics: [],
          actionItems: [],
          summary: transcriptionData,
          duration: 0,
          wordCount: transcriptionData.split(' ').length,
          speakingRate: 0
        };
      }

    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Generate AI summary from transcript
   */
  async generateSummary(transcriptData) {
    try {
      const prompt = `
        Based on this meeting transcript data, please provide a comprehensive analysis:
        
        Transcript Data: ${JSON.stringify(transcriptData)}
        
        Please provide:
        1. Executive Summary (2-3 sentences)
        2. Key Decisions Made
        3. Action Items with priorities and assignees
        4. Important Discussion Points
        5. Next Steps
        6. Meeting Sentiment Analysis
        
        Format as JSON:
        {
          "executiveSummary": "brief summary",
          "keyDecisions": ["decision 1", "decision 2"],
          "actionItems": [
            {
              "task": "action description",
              "assignee": "person",
              "priority": "high|medium|low",
              "dueDate": "if mentioned",
              "timestamp": 45.2
            }
          ],
          "discussionPoints": [
            {
              "topic": "topic name",
              "description": "what was discussed",
              "timestamp": 30.0,
              "importance": "high|medium|low"
            }
          ],
          "nextSteps": ["next step 1", "next step 2"],
          "sentiment": {
            "overall": "positive|neutral|negative",
            "score": 0.8,
            "highlights": ["positive aspect 1", "positive aspect 2"]
          }
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const summaryText = response.text();

      try {
        return JSON.parse(summaryText);
      } catch (parseError) {
        return {
          executiveSummary: summaryText,
          keyDecisions: [],
          actionItems: [],
          discussionPoints: [],
          nextSteps: [],
          sentiment: { overall: 'neutral', score: 0.5, highlights: [] }
        };
      }

    } catch (error) {
      console.error('Summary generation error:', error);
      throw new Error(`Summary generation failed: ${error.message}`);
    }
  }
}

module.exports = GeminiTranscriptionService;

