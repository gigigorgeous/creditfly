"use client"

import { useEffect, useRef, useState } from "react"
import { Download, Loader2, Music2, Play, Square, WandSparkles } from "lucide-react"

type PreviewNote = { track: string; pitch: number; start: number; end: number; velocity: number }
type Generation = {
  id: string; title: string; genre: string; key: string; mode: string; tempo: number; bars: number
  tracks: string[]; preview: PreviewNote[]
}

const TRACK_COLORS: Record<string, string> = {
  Chords: "bg-violet-400", Melody: "bg-cyan-300", Bass: "bg-emerald-400", Drums: "bg-orange-300",
}

export function DawWorkstation() {
  const [prompt, setPrompt] = useState("Warm, upbeat synth pop with a memorable lead")
  const [genre, setGenre] = useState("pop")
  const [key, setKey] = useState("C")
  const [mode, setMode] = useState("major")
  const [tempo, setTempo] = useState(110)
  const [bars, setBars] = useState(8)
  const [generation, setGeneration] = useState<Generation | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [playing, setPlaying] = useState(false)
  const contextRef = useRef<AudioContext | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => stopPlayback(), [])

  function stopPlayback() {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    oscillatorsRef.current.forEach((oscillator) => {
      try { oscillator.stop() } catch { /* already stopped */ }
    })
    oscillatorsRef.current = []
    setPlaying(false)
  }

  async function generate() {
    setBusy(true)
    setError("")
    stopPlayback()
    try {
      const response = await fetch("/api/daw/generations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, genre, key, mode, tempo, bars }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || data.error || "Generation failed")
      setGeneration(data as Generation)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not generate the arrangement")
    } finally {
      setBusy(false)
    }
  }

  async function play() {
    if (!generation || !generation.preview.length) return
    stopPlayback()
    const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextConstructor) { setError("Web Audio is not supported in this browser."); return }
    const context = contextRef.current ?? new AudioContextConstructor()
    contextRef.current = context
    await context.resume()
    const origin = context.currentTime + 0.08
    for (const note of generation.preview) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const isDrum = note.track === "Drums"
      oscillator.type = isDrum ? "triangle" : note.track === "Bass" ? "sawtooth" : "sine"
      oscillator.frequency.value = isDrum && note.pitch === 36 ? 65 : 440 * Math.pow(2, (note.pitch - 69) / 12)
      const start = origin + note.start
      const end = origin + Math.max(note.end, note.start + 0.04)
      const level = Math.max(0.0001, (note.velocity / 127) * (isDrum ? 0.12 : 0.075))
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.linearRampToValueAtTime(level, start + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.0001, end)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(start)
      oscillator.stop(end + 0.02)
      oscillatorsRef.current.push(oscillator)
    }
    setPlaying(true)
    const totalSeconds = (generation.bars * 4 * 60) / generation.tempo
    stopTimerRef.current = setTimeout(() => { oscillatorsRef.current = []; setPlaying(false) }, totalSeconds * 1000 + 300)
  }

  const totalBeats = (generation?.bars ?? bars) * 4
  const duration = generation ? (generation.bars * 4 * 60) / generation.tempo : 0

  return (
    <main className="min-h-screen bg-[#09090f] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-violet-300"><Music2 size={16}/> AIMUSIC WORKSTATION</p>
            <h1 className="text-3xl font-bold md:text-4xl">Compose. Preview. Export.</h1>
            <p className="mt-2 text-sm text-zinc-400">Generate an editable MIDI arrangement, audition it here, then open it in your DAW.</p>
          </div>
          {generation && <a className="inline-flex items-center gap-2 rounded-lg border border-violet-400/40 px-4 py-2.5 text-sm font-semibold hover:bg-violet-400/10" href={`/api/daw/generations/${generation.id}/download`}><Download size={17}/> Export MIDI</a>}
        </header>

        <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <form className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5" onSubmit={(event) => { event.preventDefault(); void generate() }}>
            <label className="block text-sm font-medium text-zinc-300">Describe your track<textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={500} rows={4} className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-black/30 p-3 text-white outline-none focus:border-violet-400" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm text-zinc-300">Genre<select value={genre} onChange={(event) => setGenre(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#15151f] p-2.5 text-white"><option value="pop">Pop</option><option value="electronic">Electronic</option><option value="hip-hop">Hip-Hop</option><option value="rock">Rock</option><option value="jazz">Jazz</option><option value="ambient">Ambient</option></select></label>
              <label className="text-sm text-zinc-300">Key<select value={key} onChange={(event) => setKey(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#15151f] p-2.5 text-white">{["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"].map((note) => <option key={note}>{note}</option>)}</select></label>
              <label className="text-sm text-zinc-300">Mode<select value={mode} onChange={(event) => setMode(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#15151f] p-2.5 text-white"><option value="major">Major</option><option value="minor">Minor</option></select></label>
              <label className="text-sm text-zinc-300">Tempo<input type="number" min={40} max={240} value={tempo} onChange={(event) => setTempo(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-white/10 bg-[#15151f] p-2.5 text-white"/></label>
              <label className="col-span-2 text-sm text-zinc-300">Length: {bars} bars<input type="range" min={1} max={32} value={bars} onChange={(event) => setBars(Number(event.target.value))} className="mt-3 w-full accent-violet-400"/></label>
            </div>
            <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-3 font-semibold transition hover:bg-violet-400 disabled:cursor-wait disabled:opacity-60">{busy ? <Loader2 className="animate-spin" size={18}/> : <WandSparkles size={18}/>} {busy ? "Building arrangement…" : "Generate arrangement"}</button>
            {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          </form>

          <section className="min-h-[420px] rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div><h2 className="text-lg font-semibold">Arrangement</h2><p className="mt-1 text-sm text-zinc-400">{generation ? `${generation.key} ${generation.mode} · ${generation.tempo} BPM · ${generation.bars} bars · ${duration.toFixed(1)} sec` : "Your generated tracks appear here."}</p></div>
              <button onClick={() => playing ? stopPlayback() : void play()} disabled={!generation} className="inline-flex items-center gap-2 rounded-lg border border-violet-400/40 px-4 py-2 text-sm font-semibold disabled:opacity-40">{playing ? <Square size={15}/> : <Play size={15}/>} {playing ? "Stop" : "Preview"}</button>
            </div>
            {generation ? <div className="mt-6 space-y-5"><div className="grid grid-cols-[76px_1fr] gap-3 text-xs text-zinc-500"><span>TRACK</span><div className="flex justify-between">{Array.from({ length: Math.min(generation.bars, 16) }, (_, index) => <span key={index}>{index + 1}</span>)}</div></div>{generation.tracks.map((track) => {
              const notes = generation.preview.filter((note) => note.track === track)
              return <div key={track} className="grid grid-cols-[76px_1fr] items-center gap-3"><span className="truncate text-xs font-medium text-zinc-300">{track}</span><div className="relative h-14 overflow-hidden rounded-md border border-white/5 bg-black/30" style={{ backgroundImage: "linear-gradient(to right,rgba(255,255,255,.07) 1px,transparent 1px)", backgroundSize: `${100 / generation.bars}% 100%` }}>{notes.map((note, index) => <span key={`${track}-${index}`} title={`${track} MIDI ${note.pitch}`} className={`absolute top-2 h-3 rounded-sm ${TRACK_COLORS[track] || "bg-violet-400"}`} style={{ left: `${(note.start / duration) * 100}%`, width: `${Math.max(0.35, ((note.end - note.start) / duration) * 100)}%`, opacity: 0.55 + (note.velocity / 127) * 0.45 }}/>)}</div></div>
            })}<p className="text-xs leading-relaxed text-zinc-500">Preview uses simple browser synth tones. Export the Standard MIDI file to use your DAW’s instruments, plugins, and mixing tools. MIDI export is supported; DAW-specific project files and audio rendering are not included.</p></div> : <div className="flex h-64 flex-col items-center justify-center text-center text-zinc-500"><Music2 size={42} className="mb-3 text-violet-300/70"/><p>Generate a track to see the MIDI arrangement timeline.</p></div>}
          </section>
        </section>
      </div>
    </main>
  )
}
