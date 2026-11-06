# Python AI music engine

A MIDI-first composition service designed to work alongside the existing Next.js app. It creates editable, multi-track MIDI arrangements that can be imported into Ableton Live, FL Studio, Logic Pro, Reaper, and other DAWs. The included composition engine is a deterministic, local baseline (not a trained generative model); its provider interface is ready for plugging in a licensed model or hosted generation API later.

## Quick start

Requires Python 3.11+.

```bash
cd backend
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
uvicorn music_engine.main:app --reload --port 8000
```

Open `http://localhost:8000/docs` for the interactive API. Generate a short demo arrangement:

```bash
curl -X POST http://localhost:8000/api/v1/generations \\
  -H 'Content-Type: application/json' \\
  -d '{"prompt":"warm upbeat synth pop","genre":"pop","key":"C","tempo":110,"bars":8,"seed":7}'
```

The response contains a `download_url` for a Standard MIDI File. Open/import that `.mid` in your DAW, then assign your own instruments and effects. Generated files are stored under `backend/data/generated` by default; set `MUSIC_OUTPUT_DIR` to change this. This starter writes MIDI, not rendered audio, and does not automate or control a DAW process.

## API

- `GET /health` — service status.
- `POST /api/v1/generations` — create an editable multi-track MIDI arrangement; accepts genre, musical key, tempo (40–240 BPM), bars (1–64), seed, and prompt.
- `GET /api/v1/generations/{generation_id}` — inspect the generated artifact.
- `GET /api/v1/generations/{generation_id}/download` — download the `.mid` file.

The initial in-process registry is suitable for local development. For multi-worker or production deployment, replace it with persistent metadata storage and a job queue/object store. See `docker-compose.yml` for a local container setup.

## Checks

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

## Environment

Copy `.env.example` to `.env` if you want to configure a custom output directory or CORS origins. Do not commit credentials. CORS is disabled by default; configure explicit origins for the frontend deployment.
