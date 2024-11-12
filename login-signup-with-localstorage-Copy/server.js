const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');  // Import Axios
require('dotenv').config(); // To load environment variables from a .env file

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Hpvi@2410',
  database: 'SignInLogin'
});

// Test DB connection
db.connect(err => {
  if (err) {
    console.error('Error connecting to Db:', err.message);
    return;
  }
  console.log('Connected to the database');
});

// API key from environment variable
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';


// Function to analyze text using the Groq API
async function analyzeTextWithGroq(text) {
  try {
    const prompt = `Please analyze the following text and extract key-value pairs for a travel booking form.
The text will describe a travel booking request. Your task is to identify the following fields. Only one pair per key is needed. Here are the fields to identify:

- Name
- Email
- Phone
- Source City
- Destination City
- Departure Date (format: YYYY-MM-DD)
- Departure Time (format: HH:MM in 24-hour format)
- Mode of Transport (Flight/Train/Bus)

Here is the text:

${text}

Please format the output as key-value pairs, one per line, like this:
Key: Value`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions', // Ensure this is the correct endpoint
      {
        model: "llama-3.2-11b-text-preview",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
    return "Error analyzing text";
  }
}

// Function to extract key-value pairs from the Groq API's response
function extractKeyValuePairs(extractedData) {
  const keyValuePairs = {};

  extractedData.split('\n').forEach(line => {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      keyValuePairs[key] = value;
    }
  });

  return keyValuePairs;
}

// POST route to analyze the text input (Groq API Integration)
app.post('/api/analyze-text', async (req, res) => {
  const { booking_info } = req.body;

  if (!booking_info) {
    return res.status(400).json({ error: 'Please enter some text to analyze.' });
  }

  try {
    // Analyze text with Groq
    const extractedData = await analyzeTextWithGroq(booking_info);

    // Process the extracted data to create key-value pairs
    const keyValuePairs = extractKeyValuePairs(extractedData);

    return res.json({ key_value_pairs: keyValuePairs });
  } catch (error) {
    return res.status(500).json({ error: `Failed to analyze text: ${error.message}` });
  }
});

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send('Please provide all required fields.');
  }

  const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(query, [name, email, password], (error, results) => {
    if (error) {
      console.error('Error during signup:', error.message);
      return res.status(500).send('Server error: ' + error.message);
    }
    res.status(201).send('User registered successfully');
  });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (error, results) => {
    if (error || results.length === 0) {
      res.status(401).send('Invalid email or password');
    } else {
      res.status(200).send('Login successful');
    }
  });
});

// POST route to analyze the text input (Groq API Integration)
app.post('/api/analyze-text', async (req, res) => {
  const { booking_info } = req.body;

  if (!booking_info) {
    return res.status(400).json({ error: 'Please enter some text to analyze.' });
  }

  try {
    // Analyze text with Groq
    const extractedData = await analyzeTextWithGroq(booking_info);

    // Process the extracted data to create key-value pairs
    const keyValuePairs = extractKeyValuePairs(extractedData);

    // Log the final key-value pairs or an error if none found
    if (Object.keys(keyValuePairs).length > 0) {
      console.log("Final Key-Value Pairs:", keyValuePairs);
    } else {
      console.error("Failed to extract valid key-value pairs from the response.");
    }

    return res.json({ key_value_pairs: keyValuePairs });
  } catch (error) {
    console.error("Failed to analyze text:", error.message);
    return res.status(500).json({ error: `Failed to analyze text: ${error.message}` });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
