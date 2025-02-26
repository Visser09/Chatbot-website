// server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config(); // Load environment variables from .env

// Use proper import for node-fetch
let fetch;
(async () => {
  const module = await import('node-fetch');
  fetch = module.default;
})();

// Rate limiting middleware
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

// Enable JSON parsing and serve static files from the "public" folder
app.use(express.json({ limit: '1mb' })); // Set request size limit
app.use(express.static('public'));
app.use('/api', limiter); // Apply rate limiting to API routes

// Proxy endpoint to handle chat requests
app.post('/api/chat', async (req, res) => {
  const API_KEY = process.env.OPENAI_API_KEY;
  
  // Validate API key
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  
  // Validate request body
  if (!req.body || !req.body.messages) {
    return res.status(400).json({ error: 'Invalid request format' });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Error from OpenAI API',
        code: data.error?.code || 'unknown_error'
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching from OpenAI:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});