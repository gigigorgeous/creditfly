# DAW workstation integration

The web workstation is available at `/daw` and is linked from `/music-studio`. It uses a Next.js server-side proxy to the Python MIDI engine, so the browser does not need direct cross-origin access.

## Run locally

1. Start the Python service: `cd backend && pip install -r requirements.txt && uvicorn music_engine.main:app --reload --port 8000`.
2. Start the existing Next.js app in another terminal: `pnpm dev` (or your package-manager equivalent).
3. Set `MUSIC_ENGINE_URL` in the Next.js server environment only if the Python API is not at `http://127.0.0.1:8000`.
4. Open `/daw`, generate a MIDI arrangement, audition its notes with the browser Web Audio synth, and use **Export MIDI** to import the `.mid` into a DAW.

The preview and downloadable file are produced from the same Python arrangement. The preview is a simple audition synth; it is not a DAW audio engine. The export is Standard MIDI, not a DAW-specific project, audio render, VST host, or remote DAW controller. The Python service currently keeps generation metadata in process memory, so IDs do not survive restarts and multiple workers need persistent shared metadata/storage before deployment.

No existing Suno/OpenAI key configuration is changed by this integration. Keep provider credentials server-side and rotate any credential that has been published in a public commit; an exposed key cannot be made safe by leaving it in source control.
