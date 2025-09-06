const express = require('express');
const GeminiTranscriptionService = require('../services/geminiService');

const router = express.Router();
const transcriptionService = new GeminiTranscriptionService();

// POST /api/summary/generate
router.post('/generate', async (req, res) => {
  try {
    const { transcriptData } = req.body;

    if (!transcriptData) {
      return res.status(400).json({ error: 'Transcript data is required' });
    }

    console.log('Generating AI summary...');
    const summaryResult = await transcriptionService.generateSummary(transcriptData);

    res.json({
      id: require('uuid').v4(),
      generatedAt: new Date().toISOString(),
      summary: summaryResult,
      status: 'completed'
    });

  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ 
      error: 'Summary generation failed', 
      details: error.message 
    });
  }
});

// POST /api/summary/analyze-sentiment
router.post('/analyze-sentiment', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required for sentiment analysis' });
    }

    const prompt = `
      Analyze the sentiment of this meeting transcript text and provide:
      1. Overall sentiment (positive, neutral, negative)
      2. Sentiment score (0-1)
      3. Key positive highlights
      4. Key negative highlights
      5. Emotional tone analysis
      
      Text: ${text}
      
      Format as JSON:
      {
        "overall": "positive|neutral|negative",
        "score": 0.8,
        "positiveHighlights": ["highlight 1", "highlight 2"],
        "negativeHighlights": ["highlight 1", "highlight 2"],
        "emotionalTone": {
          "professional": 0.9,
          "collaborative": 0.8,
          "frustrated": 0.2,
          "excited": 0.7,
          "concerned": 0.3
        },
        "recommendations": ["recommendation 1", "recommendation 2"]
      }
    `;

    const result = await transcriptionService.model.generateContent(prompt);
    const response = await result.response;
    const sentimentData = response.text();

    try {
      const parsedData = JSON.parse(sentimentData);
      res.json({
        id: require('uuid').v4(),
        analyzedAt: new Date().toISOString(),
        sentiment: parsedData,
        status: 'completed'
      });
    } catch (parseError) {
      res.json({
        id: require('uuid').v4(),
        analyzedAt: new Date().toISOString(),
        sentiment: {
          overall: 'neutral',
          score: 0.5,
          positiveHighlights: [],
          negativeHighlights: [],
          emotionalTone: {},
          recommendations: []
        },
        status: 'completed',
        note: 'Sentiment analysis completed but response parsing failed'
      });
    }

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ 
      error: 'Sentiment analysis failed', 
      details: error.message 
    });
  }
});

// POST /api/summary/extract-action-items
router.post('/extract-action-items', async (req, res) => {
  try {
    const { transcriptData } = req.body;

    if (!transcriptData) {
      return res.status(400).json({ error: 'Transcript data is required' });
    }

    const prompt = `
      Extract action items from this meeting transcript data:
      
      ${JSON.stringify(transcriptData)}
      
      For each action item, provide:
      1. Task description
      2. Assigned person (if mentioned)
      3. Priority level
      4. Due date (if mentioned)
      5. Timestamp in the meeting
      6. Context/notes
      
      Format as JSON:
      {
        "actionItems": [
          {
            "id": "unique_id",
            "task": "action item description",
            "assignee": "person name or 'TBD'",
            "priority": "high|medium|low",
            "dueDate": "date if mentioned or null",
            "timestamp": 45.2,
            "context": "additional context",
            "status": "pending"
          }
        ],
        "totalCount": 5,
        "highPriorityCount": 2,
        "mediumPriorityCount": 2,
        "lowPriorityCount": 1
      }
    `;

    const result = await transcriptionService.model.generateContent(prompt);
    const response = await result.response;
    const actionItemsData = response.text();

    try {
      const parsedData = JSON.parse(actionItemsData);
      res.json({
        id: require('uuid').v4(),
        extractedAt: new Date().toISOString(),
        actionItems: parsedData,
        status: 'completed'
      });
    } catch (parseError) {
      res.json({
        id: require('uuid').v4(),
        extractedAt: new Date().toISOString(),
        actionItems: {
          actionItems: [],
          totalCount: 0,
          highPriorityCount: 0,
          mediumPriorityCount: 0,
          lowPriorityCount: 0
        },
        status: 'completed',
        note: 'Action items extraction completed but response parsing failed'
      });
    }

  } catch (error) {
    console.error('Action items extraction error:', error);
    res.status(500).json({ 
      error: 'Action items extraction failed', 
      details: error.message 
    });
  }
});

module.exports = router;

