import { NextResponse } from "next/server"
import { generateMusic } from "@/lib/music-generation-sdk"

export async function POST(request: Request) {
  try {
    console.log("AI music generation API route called")

    // Parse the request body
    let body
    try {
      body = await request.json()
      console.log("Request body:", JSON.stringify(body, null, 2))
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { title, lyrics, genre, mood, style, voiceType, duration, userId } = body

    // Validate required fields
    if (!lyrics && !title) {
      return NextResponse.json({ error: "Either lyrics or title is required" }, { status: 400 })
    }

    console.log("Calling generateMusic with options...")

    // Generate music using our SDK
    const musicData = await generateMusic({
      title,
      lyrics,
      genre,
      mood,
      style,
      voiceType,
      duration,
      userId,
    })

    console.log("Generated music data:", JSON.stringify(musicData, null, 2))

    // Return the generated music metadata
    console.log("Returning successful response")
    return NextResponse.json(musicData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error in AI music generation API route:", error)

    let errorMessage = "Failed to generate music"
    let statusCode = 500

    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
      errorMessage = error.message

      // Handle specific error types
      if (error.message.includes("API key")) {
        statusCode = 401
        errorMessage = "API key is missing or invalid"
      } else if (error.message.includes("rate limit")) {
        statusCode = 429
        errorMessage = "Rate limit exceeded"
      } else if (error.message.includes("timeout")) {
        statusCode = 408
        errorMessage = "Request timeout"
      }
    }

    // Always return JSON, never HTML
    return NextResponse.json(
      {
        error: errorMessage,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      {
        status: statusCode,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST to generate music." }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed. Use POST to generate music." }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed. Use POST to generate music." }, { status: 405 })
}
npm install axios fs

npm install axios fs


Base URL: https://suno-api.gcui.ai

Key Endpoints:

Generate Music from Prompt

POST /generate

Payload:




json
Copy
Edit
{
  "prompt": "Create a lo-fi chill beat with mellow vocals about summer nights"
}
Generate Music with Custom Lyrics

POST /generate/custom

Payload:

json
Copy
Edit
{
  "lyrics": "Under the moonlight, we danced all night",
  "style": "pop",
  "language": "en"
}
Get Generated Songs

GET /songs

Returns list of generated tracks.

Download Song

GET /download/{song_id}

Docs: https://suno.gcui.ai/docs
GitHub: https://github.com/gcui-art/suno-api

🔧 Setup
Clone the GitHub repo:
git clone https://github.com/gcui-art/suno-api.git

Install dependencies:
Navigate into the folder and run npm install or yarn

Run the server locally or connect to hosted API

const axios = require('axios');
const fs = require('fs');
const API_BASE = 'https://suno-api.gcui.ai';

async function generateMusic(prompt) {
  try {
    // Step 1: Generate music from prompt
    const response = await axios.post(`${API_BASE}/generate`, { prompt });
    console.log("Music generation triggered:", response.data);

    // Step 2: Wait a few seconds for the generation to complete
    await new Promise(res => setTimeout(res, 10000)); // Wait 10 sec

    // Step 3: Fetch song list
    const songs = await axios.get(`${API_BASE}/songs`);
    const firstSong = songs.data[0];
    console.log("First song:", firstSong);

    // Step 4: Download the first song
    const songStream = await axios({
      method: 'GET',
      url: `${API_BASE}/download/${firstSong.id}`,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream('generated_song.mp3');
    songStream.data.pipe(writer);

    writer.on('finish', () => {
      console.log('Song downloaded as generated_song.mp3');
    });

  } catch (error) {
    console.error('Error generating music:', error.response?.data || error.message);
  }
}

// Replace with your desired prompt
generateMusic("Make a INTELLECTUALLY ADVANCED WORDPLAY AGLORYTHYM STYLE  dreamy synthwave TECHNO STUDIO QUALITY track THAT IS IN 432HZ AND COMMERCIALLY VIABLE with soft vocals about the future");

node -v

mkdir suno-music-gen
cd suno-music-gen
npm init -y


npm install axios fs


const axios = require('axios');
const fs = require('fs');
const API_BASE = 'https://suno-api.gcui.ai';

async function generateMusic(prompt) {
  try {
    const response = await axios.post(`${API_BASE}/generate`, { prompt });
    console.log("Music generation triggered:", response.data);

    await new Promise(res => setTimeout(res, 10000));

    const songs = await axios.get(`${API_BASE}/songs`);
    const firstSong = songs.data[0];
    console.log("First song:", firstSong);

    const songStream = await axios({
      method: 'GET',
      url: `${API_BASE}/download/${firstSong.id}`,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream('generated_song.mp3');
    songStream.data.pipe(writer);

    writer.on('finish', () => {
      console.log('Song downloaded as generated_song.mp3');
    });

  } catch (error) {
    console.error('Error generating music:', error.response?.data || error.message);
  }
}

generateMusic("Create a cinematic orchestral track with emotional vocals");


node generateMusic.js

🎉 Output
Your music will be saved as generated_song.mp3 in the project directory.

You can change the prompt inside the script to get different results.


"bin": {
  "musicgen": "./cli.js"
}


Create cli.js file:

bash
Copy
Edit
touch cli.js
chmod +x cli.js
✅ 2. CLI Script (cli.js)
Paste this code in cli.js:

js
Copy
Edit
#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const prompt = require('prompt-sync')({ sigint: true });

const API_BASE = 'https://suno-api.gcui.ai';

async function generateMusic(promptText) {
  try {
    const response = await axios.post(`${API_BASE}/generate`, { prompt: promptText });
    console.log("Music generation triggered...");

    await new Promise(res => setTimeout(res, 10000));

    const songs = await axios.get(`${API_BASE}/songs`);
    const firstSong = songs.data[0];

    const songStream = await axios({
      method: 'GET',
      url: `${API_BASE}/download/${firstSong.id}`,
      responseType: 'stream'
    });

    const fileName = `song_${Date.now()}.mp3`;
    const writer = fs.createWriteStream(fileName);
    songStream.data.pipe(writer);

    writer.on('finish', () => {
      console.log(`✅ Download complete: ${fileName}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

const userPrompt = process.argv[2] || prompt('🎵 Enter your music prompt: ');
generateMusic(userPrompt);
✅ 3. Link Your CLI Locally
In your project folder:

bash
Copy
Edit
npm link
Now you can use your CLI anywhere by typing:

bash
Copy
Edit
musicgen "Generate a funk groove with 80s-style vocals"
✅ 4. Optional: Publish to NPM (for global use)
Create an NPM account

Run:

bash
Copy
Edit
npm login
npm publish


 Project Structure
bash
Copy
Edit
suno-web/
├── client/         # React frontend
├── server/         # Node.js Express backend
├── package.json
🖥️ 2. Server (Express)
Create /server/index.js:

js
Copy
Edit
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const API_BASE = 'https://suno-api.gcui.ai';

app.post('/api/generate', async (req, res) => {
  const prompt = req.body.prompt;
  try {
    const { data } = await axios.post(`${API_BASE}/generate`, { prompt });
    await new Promise(resolve => setTimeout(resolve, 10000));
    const songs = await axios.get(`${API_BASE}/songs`);
    const firstSong = songs.data[0];
    res.json({ songId: firstSong.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/download/:id', async (req, res) => {
  try {
    const { data } = await axios({
      method: 'GET',
      url: `${API_BASE}/download/${req.params.id}`,
      responseType: 'stream'
    });

    res.setHeader('Content-Disposition', `attachment; filename="music.mp3"`);
    data.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
Install dependencies:

bash
Copy
Edit
cd server
npm init -y
npm install express axios cors
🌐 3. Frontend (React)
Create React app:

bash
Copy
Edit
npx create-react-app client
cd client
npm install axios
Update /client/src/App.js:

jsx
Copy
Edit
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [prompt, setPrompt] = useState('');
  const [songId, setSongId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const res = await axios.post('http://localhost:5000/api/generate', { prompt });
    setSongId(res.data.songId);
    setLoading(false);
  };

  const downloadSong = () => {
    window.open(`http://localhost:5000/api/download/${songId}`, '_blank');
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>🎶 AI Music Generator</h2>
      <input
        style={{ width: 400 }}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Describe your music..."
      />
      <button onClick={handleGenerate} disabled={loading} style={{ marginLeft: 10 }}>
        {loading ? 'Generating...' : 'Generate'}
      </button>
      {songId && <button onClick={downloadSong} style={{ marginLeft: 10 }}>Download Song</button>}
    </div>
  );
}

export default App;
🚀 4. Run It All
Backend:

bash
Copy
Edit
cd server
node index.js
Frontend:

bash
Copy
Edit
cd client
npm start

BASH

Recommended Setup (Works on All Platforms)
🔹 Folder Structure
bash
Copy
Edit
suno-music-ai/
├── client/         # React app
├── server/         # Express backend
├── package.json    # Root
├── index.js        # Combined entry
├── .gitignore
├── README.md
🔹 Root package.json
Supports Heroku, Vercel (via API routes or backend repo), Railway, Render, and Fly.io:

json
Copy
Edit
{
  "name": "suno-music-ai",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js",
    "build": "cd client && npm install && npm run build",
    "vercel-build": "npm run build"
  },
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "axios": "^1.6.7",
    "cors": "^2.8.5",
    "express": "^4.18.2"
  }
}
🔹 Platform-Specific Notes
Platform	Use	Notes
Vercel	Split repo	Host React frontend directly; use API routes or deploy backend on Render/Railway
Render	Fullstack OK	Set build command as npm run build, start as npm start
Railway	Fullstack OK	Works out of the box with Express + build step
Fly.io	Fullstack OK	Use fly launch — auto builds both parts
Heroku	Fullstack OK	Supports heroku-postbuild and dynamic port

🔹 Deployment Steps (Any Platform)
Push project to GitHub

Go to any platform (Vercel, Render, Railway, etc.)

Connect repo → set build to npm run build and start to npm start


.gitignore
gitignore
Copy
Edit
# Node
node_modules
npm-debug.log
yarn-debug.log
yarn-error.log

# Build Output
client/build
server/build
dist

# Logs
logs
*.log
log.*

# Environment
.env

# OS
.DS_Store
Thumbs.db
✅ 2. README.md
markdown
Copy
Edit
# 🎵 AI Music Generator (Powered by Suno API)

This fullstack app lets users generate original music (with vocals and instruments) from text prompts. Built with:

- 🔥 React (frontend)
- 🚀 Express (backend)
- 🎶 Suno AI Music API

## 🖥️ Local Development

```bash
git clone https://github.com/yourusername/suno-music-ai
cd suno-music-ai
npm install
npm run build
npm start
🌍 Deployment
✅ Vercel (Frontend Only)
Move client/ to its own repo

Connect to Vercel and deploy

Set proxy in client/package.json to your backend

✅ Railway / Render / Fly.io (Fullstack)
Just deploy the root directory with:

Build Command: npm run build

Start Command: npm start

📦 API Endpoints
POST /api/generate – Prompt-based music generation

GET /api/download/:id – Download track by ID

Built by [Your Name]

yaml
Copy
Edit

---

## ✅ 3. `vercel.json` (If frontend is deployed separately)
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-domain.com/api/$1"
    }
  ]
}
✅ 4. railway.json (Optional for Railway)
json
Copy
Edit
{
  "build": {
    "buildCommand": "npm run build",
    "startCommand": "npm start"
  }
}
