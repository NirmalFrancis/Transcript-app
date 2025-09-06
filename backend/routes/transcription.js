const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const GeminiTranscriptionService = require('../services/geminiService');

const router = express.Router();
const transcriptionService = new GeminiTranscriptionService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 // 100MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/m4a',
      'audio/ogg',
      'audio/webm',
      'audio/mp4',
      'audio/aac'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'), false);
    }
  }
});

// POST /api/transcription/upload
router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;

    console.log(`Processing audio file: ${fileName} (${fileSize} bytes)`);

    // Start transcription process
    const transcriptionResult = await transcriptionService.transcribeAudio(filePath);

    // Generate summary
    const summaryResult = await transcriptionService.generateSummary(transcriptionResult);

    // Prepare response
    const response = {
      id: uuidv4(),
      fileName: fileName,
      fileSize: fileSize,
      uploadedAt: new Date().toISOString(),
      transcription: transcriptionResult,
      summary: summaryResult,
      status: 'completed'
    };

    res.json(response);

  } catch (error) {
    console.error('Upload/transcription error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      await fs.remove(req.file.path).catch(console.error);
    }

    res.status(500).json({ 
      error: 'Transcription failed', 
      details: error.message 
    });
  }
});

// POST /api/transcription/transcribe
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const filePath = req.file.path;
    console.log(`Transcribing file: ${req.file.originalname}`);

    const transcriptionResult = await transcriptionService.transcribeAudio(filePath);

    // Clean up file after processing
    await fs.remove(filePath);

    res.json({
      id: uuidv4(),
      fileName: req.file.originalname,
      transcription: transcriptionResult,
      status: 'completed'
    });

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      await fs.remove(req.file.path).catch(console.error);
    }

    res.status(500).json({ 
      error: 'Transcription failed', 
      details: error.message 
    });
  }
});

// GET /api/transcription/formats
router.get('/formats', (req, res) => {
  res.json({
    supportedFormats: [
      { extension: 'mp3', mimeType: 'audio/mpeg', description: 'MP3 Audio' },
      { extension: 'wav', mimeType: 'audio/wav', description: 'WAV Audio' },
      { extension: 'm4a', mimeType: 'audio/m4a', description: 'M4A Audio' },
      { extension: 'ogg', mimeType: 'audio/ogg', description: 'OGG Audio' },
      { extension: 'webm', mimeType: 'audio/webm', description: 'WebM Audio' },
      { extension: 'mp4', mimeType: 'audio/mp4', description: 'MP4 Audio' },
      { extension: 'aac', mimeType: 'audio/aac', description: 'AAC Audio' }
    ],
    maxFileSize: process.env.MAX_FILE_SIZE || '100MB',
    recommendedFormat: 'wav',
    recommendedSettings: {
      sampleRate: '16kHz',
      channels: 'mono',
      bitRate: '128kbps'
    }
  });
});

// Error handling middleware for this router
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large', 
        maxSize: process.env.MAX_FILE_SIZE || '100MB' 
      });
    }
  }
  
  console.error('Transcription router error:', error);
  res.status(500).json({ 
    error: 'Internal server error', 
    details: error.message 
  });
});

module.exports = router;

