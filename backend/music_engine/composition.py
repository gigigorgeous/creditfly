from dataclasses import dataclass
import random

import pretty_midi

from .schemas import GenerationRequest


@dataclass(frozen=True)
class Arrangement:
    midi: pretty_midi.PrettyMIDI
    title: str
    tracks: list[str]


# Natural minor/major pitch classes, rotated from the requested tonic.
NOTE_NAMES = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4,
              "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9,
              "A#": 10, "Bb": 10, "B": 11}
MAJOR = (0, 2, 4, 5, 7, 9, 11)
MINOR = (0, 2, 3, 5, 7, 8, 10)


def compose(request: GenerationRequest) -> Arrangement:
    """Create a repeatable, editable multi-track MIDI sketch without external services."""
    rng = random.Random(request.seed)
    tonic = NOTE_NAMES[request.key]
    scale = MINOR if request.mode == "minor" else MAJOR
    # I–V–vi–IV in major, i–VI–III–VII in minor; all notes remain in key.
    degree_progression = (0, 4, 5, 3) if request.mode == "major" else (0, 5, 2, 6)
    seconds_per_beat = 60.0 / request.tempo
    beats_per_bar = 4
    bar_seconds = seconds_per_beat * beats_per_bar
    duration = request.bars * bar_seconds
    midi = pretty_midi.PrettyMIDI(initial_tempo=request.tempo)

    chords = pretty_midi.Instrument(program=pretty_midi.instrument_name_to_program("Electric Piano 1"), name="Chords")
    melody = pretty_midi.Instrument(program=pretty_midi.instrument_name_to_program("Lead 2 (sawtooth)"), name="Melody")
    bass = pretty_midi.Instrument(program=pretty_midi.instrument_name_to_program("Synth Bass 1"), name="Bass")
    drums = pretty_midi.Instrument(program=0, is_drum=True, name="Drums")

    for bar in range(request.bars):
        start = bar * bar_seconds
        degree = degree_progression[bar % len(degree_progression)]
        chord_tones = [scale[(degree + interval) % 7] + (12 if degree + interval >= 7 else 0)
                       for interval in (0, 2, 4)]
        root_pitch = 48 + tonic + scale[degree]
        for beat in range(4):
            at = start + beat * seconds_per_beat
            chord_notes = chord_tones if beat == 0 else [chord_tones[0], chord_tones[2]]
            for tone in chord_notes:
                pitch_class = (tonic + tone) % 12
                octave = 60 + ((tonic + tone) // 12) * 12
                chords.notes.append(pretty_midi.Note(velocity=70, pitch=octave + pitch_class,
                                                     start=at, end=at + seconds_per_beat * 0.88))
            bass.notes.append(pretty_midi.Note(velocity=82, pitch=root_pitch,
                                               start=at, end=at + seconds_per_beat * 0.8))
            # Kick on 1/3 and snare on 2/4 (General MIDI drum notes).
            drum_pitch = 36 if beat in (0, 2) else 38
            drums.notes.append(pretty_midi.Note(velocity=92, pitch=drum_pitch,
                                                start=at, end=at + 0.12))
            drums.notes.append(pretty_midi.Note(velocity=55, pitch=42,
                                                start=at, end=at + 0.08))

        # A simple scale-constrained lead phrase: deterministic for a given seed.
        for subdivision in range(8):
            if rng.random() < 0.18:
                continue
            scale_degree = rng.randrange(7)
            octave = rng.choice((5, 5, 6))
            pitch = 12 * octave + tonic + scale[scale_degree]
            at = start + subdivision * seconds_per_beat / 2
            melody.notes.append(pretty_midi.Note(velocity=rng.randint(62, 94), pitch=pitch,
                                                  start=at, end=at + seconds_per_beat * 0.38))

    for instrument in (chords, melody, bass, drums):
        midi.instruments.append(instrument)
    return Arrangement(midi=midi, title=request.title or request.prompt[:60] or "AI Music Sketch",
                       tracks=[instrument.name for instrument in midi.instruments])
