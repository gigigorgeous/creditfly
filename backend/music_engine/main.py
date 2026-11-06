from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .composition import compose
from .config import settings
from .schemas import GenerationRecord, GenerationRequest, GenerationResponse, HealthResponse

app = FastAPI(title="AI Music Engine", version="0.1.0", description="Generate editable multi-track MIDI sketches for your DAW.")
origins = settings.parsed_cors_origins()
if origins:
    app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET", "POST"],
                       allow_headers=["Content-Type"])

# Local-development metadata registry. Use a persistent database/job queue for multi-worker deployments.
records: dict[UUID, GenerationRecord] = {}


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", service="music-engine")


@app.post("/api/v1/generations", response_model=GenerationResponse, status_code=201)
def create_generation(request: GenerationRequest) -> GenerationResponse:
    settings.output_dir.mkdir(parents=True, exist_ok=True)
    identifier = uuid4()
    seed = request.seed if request.seed is not None else int(datetime.now(timezone.utc).timestamp() * 1_000_000) % (2**32)
    arrangement = compose(request.model_copy(update={"seed": seed}))
    file_path = (settings.output_dir / f"{identifier}.mid").resolve()
    try:
        file_path.parent.mkdir(parents=True, exist_ok=True)
        arrangement.midi.write(str(file_path))
    except OSError as exc:
        raise HTTPException(status_code=500, detail="Could not save generated MIDI file") from exc

    record = GenerationRecord(id=identifier, title=arrangement.title, genre=request.genre,
                              key=request.key, mode=request.mode, tempo=request.tempo, bars=request.bars,
                              tracks=arrangement.tracks,
                              download_url=f"/api/v1/generations/{identifier}/download",
                              file_path=str(file_path))
    records[identifier] = record
    return GenerationResponse(**record.model_dump(exclude={"file_path"}))


@app.get("/api/v1/generations/{generation_id}", response_model=GenerationResponse)
def get_generation(generation_id: UUID) -> GenerationResponse:
    record = records.get(generation_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Generation not found")
    return GenerationResponse(**record.model_dump(exclude={"file_path"}))


@app.get("/api/v1/generations/{generation_id}/download")
def download_generation(generation_id: UUID) -> FileResponse:
    record = records.get(generation_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Generation not found")
    file_path = Path(record.file_path)
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Generated MIDI file is no longer available")
    return FileResponse(file_path, media_type="audio/midi", filename=f"{generation_id}.mid")
