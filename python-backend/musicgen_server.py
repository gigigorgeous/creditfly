from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from audiocraft.models import MusicGen
from audiocraft.data.audio import audio_write
import tempfile
import os
import uuid
import json
from typing import Optional
from datetime import datetime

app = FastAPI(title="Custom Music Generation API")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model storage
musicgen_model = None
generation_tasks = {}

class MusicGenerationRequest(BaseModel):
    prompt: str
    duration: float = 30.0
    model_size: str = "medium"  # small, medium, large
    temperature: float = 1.0
    top_k: int = 250
    top_p: float = 0.0

class TaskStatus(BaseModel):
    task_id: str
    status: str  # pending, processing, completed, failed
    audio_url: Optional[str] = None
    error: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None

def load_model(model_size: str = "medium"):
    """Load MusicGen model"""
    global musicgen_model
    
    if musicgen_model is None or musicgen_model.name != f"facebook/musicgen-{model_size}":
        print(f"Loading MusicGen model: {model_size}")
        musicgen_model = MusicGen.get_pretrained(f"facebook/musicgen-{model_size}")
        
        # Set generation parameters
        musicgen_model.set_generation_params(
            duration=30.0,
            temperature=1.0,
            top_k=250,
            top_p=0.0
        )
    
    return musicgen_model

@app.on_event("startup")
async def startup_event():
    """Initialize model on startup"""
    print("Initializing MusicGen model...")
    load_model("medium")
    print("Model loaded successfully!")

@app.get("/")
async def root():
    return {
        "message": "Custom Music Generation API",
        "status": "running",
        "model": "MusicGen (Facebook AI)",
        "endpoints": {
            "generate": "/api/generate",
            "status": "/api/status/{task_id}",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": musicgen_model is not None,
        "device": "cuda" if torch.cuda.is_available() else "cpu"
    }

async def generate_music_task(task_id: str, request: MusicGenerationRequest):
    """Background task for music generation"""
    try:
        # Update status to processing
        generation_tasks[task_id]["status"] = "processing"
        
        # Load model
        model = load_model(request.model_size)
        
        # Set generation parameters
        model.set_generation_params(
            duration=request.duration,
            temperature=request.temperature,
            top_k=request.top_k,
            top_p=request.top_p
        )
        
        # Generate music
        print(f"Generating music for task {task_id}: {request.prompt}")
        wav = model.generate([request.prompt])
        
        # Save audio file
        output_dir = "generated_audio"
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, f"{task_id}")
        audio_write(
            output_path,
            wav[0].cpu(),
            model.sample_rate,
            strategy="loudness",
            loudness_compressor=True
        )
        
        # Update task status
        generation_tasks[task_id].update({
            "status": "completed",
            "audio_url": f"/audio/{task_id}.wav",
            "completed_at": datetime.now().isoformat()
        })
        
        print(f"Task {task_id} completed successfully")
        
    except Exception as e:
        print(f"Task {task_id} failed: {str(e)}")
        generation_tasks[task_id].update({
            "status": "failed",
            "error": str(e),
            "completed_at": datetime.now().isoformat()
        })

@app.post("/api/generate")
async def generate_music(
    request: MusicGenerationRequest,
    background_tasks: BackgroundTasks
):
    """Generate music from text prompt"""
    try:
        # Create unique task ID
        task_id = str(uuid.uuid4())
        
        # Initialize task status
        generation_tasks[task_id] = {
            "task_id": task_id,
            "status": "pending",
            "audio_url": None,
            "error": None,
            "created_at": datetime.now().isoformat(),
            "completed_at": None,
            "prompt": request.prompt
        }
        
        # Add background task
        background_tasks.add_task(generate_music_task, task_id, request)
        
        return {
            "task_id": task_id,
            "status": "pending",
            "message": "Music generation started"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status/{task_id}")
async def get_task_status(task_id: str):
    """Get status of a generation task"""
    if task_id not in generation_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return generation_tasks[task_id]

@app.get("/audio/{filename}")
async def get_audio(filename: str):
    """Serve generated audio files"""
    from fastapi.responses import FileResponse
    
    file_path = os.path.join("generated_audio", filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        file_path,
        media_type="audio/wav",
        filename=filename
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
