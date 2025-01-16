const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../public/index.html');
});

// Handle AI generation request
app.post('/generate-text', async (req, res) => {
  const userInput = req.body.text;  // Use 'text' field from frontend

  if (!userInput) {
    return res.status(400).json({ error: "No text provided." });
  }

  try {
    // Make sure to structure the request as per Gemini API documentation
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: userInput }]  // Correct structure as per documentation
        }]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Log the entire response to inspect its structure
    console.log("API Response:", response.data);

    // Check if the expected fields are present in the response
    if (response.data && response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content) {
      // Access the 'text' property inside the 'parts' array
      const aiText = response.data.candidates[0].content.parts[0].text || "No response generated.";
      res.json({ generatedText: aiText });
    } else {
      console.error("Unexpected response structure:", response.data);
      res.status(500).json({ error: "Unexpected response structure from AI." });
    }
  } catch (error) {
    console.error("Error calling API:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate response from AI." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
