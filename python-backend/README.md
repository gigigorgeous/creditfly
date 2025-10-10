# Custom Music Generation Backend

This is your own AI music generation server using Facebook's MusicGen model. No external APIs required!

## Quick Start

### 1. Install Dependencies

\`\`\`bash
cd python-backend
pip install -r requirements.txt
\`\`\`

### 2. Run the Server

\`\`\`bash
uvicorn musicgen_server:app --reload
\`\`\`

The server will start at `http://localhost:8000`

### 3. Run with Docker (Optional)

\`\`\`bash
docker-compose up --build
\`\`\`

## API Endpoints

- `POST /api/generate` - Generate music from text prompt
- `GET /api/status/{task_id}` - Check generation status
- `GET /audio/{filename}` - Download generated audio
- `GET /health` - Check server health

## Model Sizes

- **small**: Fast, lower quality (~300MB)
- **medium**: Balanced speed/quality (~1.5GB) - Recommended
- **large**: Best quality, slower (~3.3GB)

## System Requirements

- Python 3.8+
- 8GB RAM minimum (16GB recommended for large model)
- GPU recommended but not required (CPU will work, just slower)

## Environment Variables

Add to your `.env` file:

\`\`\`
PYTHON_BACKEND_URL=http://localhost:8000
\`\`\`

## Features

✅ No external API dependencies
✅ Unlimited generations
✅ Full control over models
✅ No usage costs beyond infrastructure
✅ Privacy - your data stays on your server

## Deployment

For production, consider:
- Using Docker for consistent deployment
- Running on GPU instances for faster generation
- Implementing rate limiting and authentication
- Setting up proper CORS for your domain
\`\`\`

```plaintext file=".env.example"
# API Keys

# Groq API Key (for lyrics and video concepts)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Kie.ai API Key (for music generation)
KIE_API_KEY=your_kie_api_key_here

# Python Backend URL (for custom music generation)
PYTHON_BACKEND_URL=http://localhost:8000

# OpenAI API Key (backup)
OPENAI_API_KEY=sk-proj-your_openai_api_key_here

# Replicate API Key (backup)
REPLICATE_API_KEY=r8_your_replicate_api_key_here
