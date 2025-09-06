# Meeting Summarizer Backend

A Node.js backend service for AI-powered meeting transcription and summarization using Google's Gemini API.

## Features

- 🎤 **Audio Transcription**: Convert audio files to text with speaker identification
- 🧠 **AI Summarization**: Generate intelligent summaries using Gemini API
- 👥 **Speaker Diarization**: Distinguish between different speakers in meetings
- 📊 **Sentiment Analysis**: Analyze meeting tone and emotional context
- ✅ **Action Item Extraction**: Automatically identify and extract action items
- 🔄 **Real-time Processing**: Fast transcription and summary generation
- 🛡️ **Security**: Built-in security features and rate limiting

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Google Gemini API key
- FFmpeg (for audio processing)

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Install FFmpeg:
   - **Windows**: Download from https://ffmpeg.org/download.html
   - **macOS**: `brew install ffmpeg`
   - **Linux**: `sudo apt install ffmpeg`

4. Set up environment variables:
```bash
cp env.example .env
```

5. Edit `.env` file with your configuration:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
NODE_ENV=development
MAX_FILE_SIZE=100MB
UPLOAD_DIR=./uploads
TEMP_DIR=./temp
CORS_ORIGIN=http://localhost:1420
```

## Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to your `.env` file

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:3001` (or your configured PORT).

## API Endpoints

### Transcription

#### POST `/api/transcription/upload`
Upload and transcribe an audio file with full analysis.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `audio` file

**Response:**
```json
{
  "id": "uuid",
  "fileName": "meeting.mp3",
  "fileSize": 1024000,
  "uploadedAt": "2024-01-01T00:00:00.000Z",
  "transcription": {
    "transcript": [...],
    "speakers": [...],
    "keyTopics": [...],
    "actionItems": [...],
    "summary": "Meeting summary",
    "duration": 1800.5,
    "wordCount": 2500,
    "speakingRate": 1.4
  },
  "summary": {
    "executiveSummary": "...",
    "keyDecisions": [...],
    "actionItems": [...],
    "discussionPoints": [...],
    "nextSteps": [...],
    "sentiment": {...}
  },
  "status": "completed"
}
```

#### POST `/api/transcription/transcribe`
Transcribe audio file only (no summary).

#### GET `/api/transcription/formats`
Get supported audio formats and upload limits.

### Summary

#### POST `/api/summary/generate`
Generate AI summary from transcript data.

#### POST `/api/summary/analyze-sentiment`
Analyze sentiment of meeting transcript.

#### POST `/api/summary/extract-action-items`
Extract action items from transcript.

### Health Check

#### GET `/api/health`
Check server status and uptime.

## Supported Audio Formats

- MP3 (.mp3)
- WAV (.wav)
- M4A (.m4a)
- OGG (.ogg)
- WebM (.webm)
- MP4 (.mp4)
- AAC (.aac)

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `MAX_FILE_SIZE` | Maximum upload size | 100MB |
| `UPLOAD_DIR` | Upload directory | ./uploads |
| `TEMP_DIR` | Temporary files directory | ./temp |
| `CORS_ORIGIN` | CORS origin | http://localhost:1420 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid input)
- `413`: Payload Too Large (file too big)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **File Validation**: Audio file type checking
- **Input Sanitization**: Request validation

## Development

### Project Structure
```
backend/
├── server.js              # Main server file
├── services/
│   └── geminiService.js   # Gemini API integration
├── routes/
│   ├── transcription.js   # Transcription endpoints
│   └── summary.js         # Summary endpoints
├── middleware/
│   └── errorHandler.js    # Error handling
├── uploads/               # Uploaded files
├── temp/                  # Temporary files
└── package.json
```

### Adding New Features

1. Create new service in `services/`
2. Add routes in `routes/`
3. Update error handling if needed
4. Test with appropriate test files

## Troubleshooting

### Common Issues

1. **FFmpeg not found**: Install FFmpeg and ensure it's in PATH
2. **Gemini API errors**: Check API key and quota limits
3. **File upload fails**: Check file size and format
4. **CORS errors**: Update CORS_ORIGIN in .env

### Logs

The server logs important events:
- File uploads and processing
- API calls and responses
- Errors and warnings

## License

MIT License - see LICENSE file for details.

