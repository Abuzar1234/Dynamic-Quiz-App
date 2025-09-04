import http from 'http';
import { URL } from 'url';
import { dirname } from 'path';
import { fileURLToPath } from "url";
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY; // Changed to match the console.log
console.log("Gemini key:", process.env.GEMINI_API_KEY);

// Add validation for API key
if (!API_KEY) {
  console.error("GEMINI_API_KEY environment variable is not set!");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

async function Questions(input, field) {
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
      Generate 10 quiz questions in the field "${field}".
      Follow these instructions: ${input}
      Format output ONLY as a valid JSON array with no additional text or markdown:
      [
        {
          "question": "string",
          "options": ["opt1","opt2","opt3","opt4"],
          "answer": "string"
        }
      ]
      Return ONLY the JSON array, no explanations, no markdown formatting.
    `,
    config: {
      thinkingConfig: {
        thinkingBudget: 1024,
      },
    },
  });

  let responseText = response.candidates[0].content.parts[0].text;
  //console.log("Gemini raw response:", responseText);

  // Clean up the response - remove markdown formatting if present
  responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  
  // Validate it's valid JSON
  try {
    const parsed = JSON.parse(responseText);
    return JSON.stringify(parsed); // Return clean JSON string
  } catch (error) {
    console.error("JSON parse error:", error);
    console.error("Raw response was:", responseText);
    throw new Error("Invalid JSON response from AI");
  }
}

const server = http.createServer(async (req, res) => {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  const parsedURL = new URL(req.url, `http://localhost:${PORT}`);
  const path = parsedURL.pathname;
  const method = req.method;

  if (path === '/health' && method === 'GET') {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: "ok" }));
  }
  if (path === '/debug' && method === 'GET') {
    try {
      const questions = await Questions("Give me quiz on circles", "circles");
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(questions);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  if (path === '/quiz' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const { input, field } = JSON.parse(body);
        const questions = await Questions(input, field);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(questions);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  }
});

server.listen(PORT,"0.0.0.0" () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
