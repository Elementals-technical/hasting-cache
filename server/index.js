const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { generateFakePdfData } = require('./fakePdfApi');

const app = express();
const PORT = process.env.PORT || 8080;
const uiBuildPath = path.join(__dirname, '../dist');

// Налаштування multer для обробки FormData
const upload = multer({ memory: true });

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Збільшуємо ліміт для base64 зображень

// Serve static files from the React app build directory
app.use(express.static(uiBuildPath));

// Endpoint для генерації превью
app.post('/generate', upload.single('snapshot'), async (req, res) => {
  try {
    let shortId, base64Image;

    // Перевіряємо чи це FormData запит (з файлом)
    if (req.file) {
      // FormData запит з файлом
      shortId = req.body.shortId;
      // Конвертуємо буфер файлу в base64
      base64Image = req.file.buffer.toString('base64');
    } else {
      // JSON запит
      shortId = req.body.shortId;
      base64Image = req.body.base64Image;
    }
    
    if (!shortId) {
      return res.status(400).json({ error: 'shortId is required' });
    }

    // Отримати дані від API з можливим base64 зображенням
    const result = await generateFakePdfData(shortId, base64Image);
    
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Статичний endpoint для тестового SVG
app.get('/placeholder.svg', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
      <text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
        SVG Preview Placeholder
      </text>
      <text x="200" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af">
        Generated for preview
      </text>
    </svg>
  `);
});

// SPA fallback - serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(uiBuildPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
