#!/usr/bin/env python3
"""
NBeat MIDI → WAV Generator
===========================
Architecture: MIDI驱动的PCM合成引擎
  - MIDI: 负责 节奏 / 旋律 / 和声 / 结构
  - PCM:  负责 音源 / 音色 / 空间 / 质感 / 氛围

Usage:
  python3 generate_beat.py [--design DESIGN.md] [--output OUTPUT_DIR] [--bpm BPM]

如果没有指定设计文档，将使用内置的 demo beat。
"""

import argparse
import json
import math
import os
import struct
import sys
import wave
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

# ── MIDI Constants ──────────────────────────────────────
MIDI_NOTE_ON  = 0x90
MIDI_NOTE_OFF = 0x80
MIDI_TEMPO    = 0xFF  # meta event
MIDI_EOT       = 0x2F  # end of track

# Standard GM instrument map
GM_INSTRUMENTS: dict[str, int] = {
    "acoustic_grand_piano": 0,
    "bright_acoustic_piano": 1,
    "electric_grand_piano": 2,
    "honky_tonk_piano": 3,
    "electric_piano_1": 4,  # Rhodes
    "electric_piano_2": 5,  # FM EP
    "harpsichord": 6,
    "clavinet": 7,
    "celesta": 8,
    "glockenspiel": 9,
    "music_box": 10,
    "vibraphone": 11,
    "marimba": 12,
    "xylophone": 13,
    "tubular_bells": 14,
    "dulcimer": 15,
    "drawbar_organ": 16,
    "percussive_organ": 17,
    "rock_organ": 18,
    "church_organ": 19,
    "reed_organ": 20,
    "accordion": 21,
    "harmonica": 22,
    "tango_accordion": 23,
    "acoustic_guitar_nylon": 24,
    "acoustic_guitar_steel": 25,
    "electric_guitar_jazz": 26,
    "electric_guitar_clean": 27,
    "electric_guitar_muted": 28,
    "overdriven_guitar": 29,
    "distortion_guitar": 30,
    "guitar_harmonics": 31,
    "acoustic_bass": 32,
    "electric_bass_finger": 33,
    "electric_bass_pick": 34,
    "fretless_bass": 35,
    "slap_bass_1": 36,
    "slap_bass_2": 37,
    "synth_bass_1": 38,
    "synth_bass_2": 39,
    "violin": 40,
    "viola": 41,
    "cello": 42,
    "contrabass": 43,
    "tremolo_strings": 44,
    "pizzicato_strings": 45,
    "orchestral_harp": 46,
    "timpani": 47,
    "string_ensemble_1": 48,
    "string_ensemble_2": 49,
    "synth_strings_1": 50,
    "synth_strings_2": 51,
    "choir_aahs": 52,
    "voice_oohs": 53,
    "synth_voice": 54,
    "orchestra_hit": 55,
    "trumpet": 56,
    "trombone": 57,
    "tuba": 58,
    "muted_trumpet": 59,
    "french_horn": 60,
    "brass_section": 61,
    "synth_brass_1": 62,
    "synth_brass_2": 63,
    "soprano_sax": 64,
    "alto_sax": 65,
    "tenor_sax": 66,
    "baritone_sax": 67,
    "oboe": 68,
    "english_horn": 69,
    "bassoon": 70,
    "clarinet": 71,
    "piccolo": 72,
    "flute": 73,
    "recorder": 74,
    "pan_flute": 75,
    "blown_bottle": 76,
    "shakuhachi": 77,
    "whistle": 78,
    "ocarina": 79,
    "lead_1_square": 80,
    "lead_2_sawtooth": 81,
    "lead_3_calliope": 82,
    "lead_4_chiff": 83,
    "lead_5_charang": 84,
    "lead_6_voice": 85,
    "lead_7_fifths": 86,
    "lead_8_bass_lead": 87,
    "pad_1_new_age": 88,
    "pad_2_warm": 89,
    "pad_3_polysynth": 90,
    "pad_4_choir": 91,
    "pad_5_bowed": 92,
    "pad_6_metallic": 93,
    "pad_7_halo": 94,
    "pad_8_sweep": 95,
    "fx_1_rain": 96,
    "fx_2_soundtrack": 97,
    "fx_3_crystal": 98,
    "fx_4_atmosphere": 99,
    "fx_5_brightness": 100,
    "fx_6_goblins": 101,
    "fx_7_echoes": 102,
    "fx_8_scifi": 103,
    "sitar": 104,
    "banjo": 105,
    "shamisen": 106,
    "koto": 107,
    "kalimba": 108,
    "bagpipe": 109,
    "fiddle": 110,
    "shanai": 111,
    "tinkle_bell": 112,
    "agogo": 113,
    "steel_drums": 114,
    "woodblock": 115,
    "taiko_drum": 116,
    "melodic_tom": 117,
    "synth_drum": 118,
    "reverse_cymbal": 119,
    "guitar_fret_noise": 120,
    "breath_noise": 121,
    "seashore": 122,
    "bird_tweet": 123,
    "telephone_ring": 124,
    "helicopter": 125,
    "applause": 126,
    "gunshot": 127,
}

# GM Percussion map (channel 10, note → sound)
GM_DRUM_MAP: dict[int, str] = {
    35: "Acoustic Bass Drum",
    36: "Bass Drum 1 (Kick)",
    37: "Side Stick",
    38: "Acoustic Snare",
    39: "Hand Clap",
    40: "Electric Snare",
    41: "Low Floor Tom",
    42: "Closed Hi-Hat",
    43: "High Floor Tom",
    44: "Pedal Hi-Hat",
    45: "Low Tom",
    46: "Open Hi-Hat",
    47: "Low-Mid Tom",
    48: "Hi-Mid Tom",
    49: "Crash Cymbal 1",
    50: "High Tom",
    51: "Ride Cymbal 1",
    52: "Chinese Cymbal",
    53: "Ride Bell",
    54: "Tambourine",
    55: "Splash Cymbal",
    56: "Cowbell",
    57: "Crash Cymbal 2",
    58: "Vibraslap",
    59: "Ride Cymbal 2",
    60: "Hi Bongo",
    61: "Low Bongo",
    62: "Mute Hi Conga",
    63: "Open Hi Conga",
    64: "Low Conga",
    65: "High Timbale",
    66: "Low Timbale",
    67: "High Agogo",
    68: "Low Agogo",
    69: "Cabasa",
    70: "Maracas",
    71: "Short Whistle",
    72: "Long Whistle",
    73: "Short Guiro",
    74: "Long Guiro",
    75: "Claves",
    76: "Hi Wood Block",
    77: "Low Wood Block",
    78: "Mute Cuica",
    79: "Open Cuica",
    80: "Mute Triangle",
    81: "Open Triangle",
}

# ── Data Structures ─────────────────────────────────────

@dataclass
class Note:
    """A single MIDI note event."""
    pitch: int          # MIDI pitch 0-127
    start_beat: float   # start time in beats
    duration_beats: float  # duration in beats
    velocity: int = 100  # 0-127


@dataclass
class Track:
    """A MIDI track (one instrument/role)."""
    name: str
    channel: int         # MIDI channel 0-15 (9 = percussion)
    program: int         # GM program number (0-127), -1 for percussion
    notes: list[Note] = field(default_factory=list)


@dataclass
class BeatDesign:
    """Beat design from the workflow."""
    bpm: float = 135.0
    key: str = "G"
    scale: str = "harmonic_minor"
    time_signature: tuple[int, int] = (4, 4)
    bars: int = 32
    tracks: list[Track] = field(default_factory=list)


# ── MIDI Writer ─────────────────────────────────────────

def write_midi(design: BeatDesign, filepath: str) -> None:
    """Write a BeatDesign as a Standard MIDI File (format 1)."""
    ticks_per_beat = 480
    us_per_beat = int(60_000_000 / design.bpm)

    def encode_var_len(value: int) -> bytes:
        """Encode a variable-length MIDI value."""
        buf = [value & 0x7F]
        value >>= 7
        while value:
            buf.append(0x80 | (value & 0x7F))
            value >>= 7
        return bytes(reversed(buf))

    with open(filepath, "wb") as f:
        # ── Header chunk ──
        f.write(b"MThd")
        f.write(struct.pack(">I", 6))       # chunk size
        f.write(struct.pack(">H", 1))       # format 1 (multiple tracks)
        f.write(struct.pack(">H", 1 + len(design.tracks)))  # num tracks (tempo + instrument tracks)
        f.write(struct.pack(">H", ticks_per_beat))

        # ── Tempo track ──
        tempo_events = bytearray()
        # Set tempo
        tempo_events.append(0x00)  # delta time = 0
        tempo_events.append(0xFF)  # meta
        tempo_events.append(0x51)  # tempo
        tempo_events.append(0x03)  # length
        tempo_events.extend(struct.pack(">I", us_per_beat)[1:])  # 3 bytes
        # Time signature
        tempo_events.append(0x00)
        tempo_events.append(0xFF)
        tempo_events.append(0x58)
        tempo_events.append(0x04)
        tempo_events.append(design.time_signature[0])
        tempo_events.append(0x02)  # denominator = 2^(denom)
        tempo_events.append(0x18)  # clocks per click
        tempo_events.append(0x08)  # 32nd notes per beat
        # End of track
        tempo_events.append(0x00)
        tempo_events.append(0xFF)
        tempo_events.append(0x2F)
        tempo_events.append(0x00)

        f.write(b"MTrk")
        f.write(struct.pack(">I", len(tempo_events)))
        f.write(tempo_events)

        # ── Instrument tracks ──
        for track in design.tracks:
            events = bytearray()

            # Track name
            name_bytes = track.name.encode("ascii", errors="replace")
            events.append(0x00)
            events.append(0xFF)
            events.append(0x03)
            events.append(len(name_bytes))
            events.extend(name_bytes)

            # Program change (skip for percussion channel)
            if track.channel != 9 and track.program >= 0:
                events.append(0x00)
                events.append(0xC0 | track.channel)
                events.append(track.program)

            # Sort notes by start time
            sorted_notes = sorted(track.notes, key=lambda n: n.start_beat)

            # Build note on/off events with delta times
            note_events: list[tuple[float, int, int, int]] = []  # (beat, channel, pitch, velocity)
            for note in sorted_notes:
                # Note on
                note_events.append((note.start_beat, MIDI_NOTE_ON | track.channel, note.pitch, note.velocity))
                # Note off
                note_events.append((
                    note.start_beat + note.duration_beats,
                    MIDI_NOTE_OFF | track.channel,
                    note.pitch,
                    0,
                ))

            note_events.sort(key=lambda e: e[0])

            prev_tick = 0
            prev_beat = 0.0
            for beat_pos, status, data1, data2 in note_events:
                tick = int(beat_pos * ticks_per_beat)
                delta = tick - prev_tick

                # Limit delta to 24-bit for MIDI compatibility
                while delta > 0x0FFFFF:
                    events.extend([0xFF, 0xFF, 0xFF])
                    delta -= 0x0FFFFF

                events.extend(encode_var_len(max(0, delta)))
                events.append(status)
                events.append(data1)
                events.append(data2)

                prev_tick = tick
                prev_beat = beat_pos

            # End of track
            events.append(0x00)
            events.append(0xFF)
            events.append(0x2F)
            events.append(0x00)

            f.write(b"MTrk")
            f.write(struct.pack(">I", len(events)))
            f.write(events)


# ── PCM Synthesizer ─────────────────────────────────────

class PCMSynthesizer:
    """Simple PCM synthesizer that renders MIDI tracks to audio."""

    def __init__(self, sample_rate: int = 44100):
        self.sample_rate = sample_rate

    def _freq(self, midi_note: int) -> float:
        """MIDI note to frequency."""
        return 440.0 * (2.0 ** ((midi_note - 69) / 12.0))

    def _adsr_envelope(self, duration_sec: float, attack: float = 0.01,
                       decay: float = 0.05, sustain: float = 0.7,
                       release: float = 0.1) -> list[float]:
        """Generate an ADSR envelope for a note."""
        num_samples = int(duration_sec * self.sample_rate)
        if num_samples == 0:
            return []

        env = [0.0] * num_samples
        attack_samples = int(attack * self.sample_rate)
        decay_samples = int(decay * self.sample_rate)
        release_samples = int(release * self.sample_rate)
        sustain_samples = max(0, num_samples - attack_samples - decay_samples - release_samples)

        pos = 0
        # Attack
        for i in range(min(attack_samples, num_samples)):
            env[pos] = i / max(1, attack_samples)
            pos += 1
        # Decay
        for i in range(min(decay_samples, max(0, num_samples - pos))):
            env[pos] = 1.0 - (1.0 - sustain) * (i / max(1, decay_samples))
            pos += 1
        # Sustain
        for i in range(min(sustain_samples, max(0, num_samples - pos))):
            env[pos] = sustain
            pos += 1
        # Release
        for i in range(min(release_samples, max(0, num_samples - pos))):
            env[pos] = sustain * (1.0 - i / max(1, release_samples))
            pos += 1

        return env[:num_samples]

    def _sine_wave(self, freq: float, duration_sec: float, velocity: float) -> list[float]:
        """Generate a sine wave (used for sub bass, simple tones)."""
        num_samples = int(duration_sec * self.sample_rate)
        amp = velocity / 127.0 * 0.3
        return [
            amp * math.sin(2.0 * math.pi * freq * i / self.sample_rate)
            for i in range(num_samples)
        ]

    def _saw_wave(self, freq: float, duration_sec: float, velocity: float) -> list[float]:
        """Generate a sawtooth wave (rich harmonics, good for leads/bass)."""
        num_samples = int(duration_sec * self.sample_rate)
        amp = velocity / 127.0 * 0.2
        period = max(1, int(self.sample_rate / freq))
        return [
            amp * (2.0 * ((i % period) / period) - 1.0)
            for i in range(num_samples)
        ]

    def _square_wave(self, freq: float, duration_sec: float, velocity: float) -> list[float]:
        """Generate a square wave (hollow, good for 8-bit/NES sounds)."""
        num_samples = int(duration_sec * self.sample_rate)
        amp = velocity / 127.0 * 0.15
        period = max(1, int(self.sample_rate / freq))
        return [
            amp * (1.0 if (i % period) < period / 2 else -1.0)
            for i in range(num_samples)
        ]

    def _triangle_wave(self, freq: float, duration_sec: float, velocity: float) -> list[float]:
        """Generate a triangle wave (smooth, good for pads/flutes)."""
        num_samples = int(duration_sec * self.sample_rate)
        amp = velocity / 127.0 * 0.25
        period = max(1, int(self.sample_rate / freq))
        return [
            amp * (4.0 * abs(((i % period) / period) - 0.5) * 2.0 - 1.0)
            for i in range(num_samples)
        ]

    def _noise(self, duration_sec: float, velocity: float) -> list[float]:
        """Generate white noise (for hi-hats, snares, percussion)."""
        import random
        num_samples = int(duration_sec * self.sample_rate)
        amp = velocity / 127.0 * 0.1
        return [amp * (random.random() * 2.0 - 1.0) for _ in range(num_samples)]

    def _kick_drum(self, velocity: float, duration_sec: float = 0.4) -> list[float]:
        """Synthesize an 808-style kick drum."""
        num_samples = int(duration_sec * self.sample_rate)
        amp = velocity / 127.0 * 0.8
        # Frequency sweep from ~150Hz down to ~40Hz
        start_freq = 150.0
        end_freq = 40.0
        samples = []
        for i in range(num_samples):
            t = i / self.sample_rate
            progress = i / num_samples
            freq = start_freq + (end_freq - start_freq) * (progress ** 0.5)
            # Add distortion via tanh
            raw = math.sin(2.0 * math.pi * freq * t)
            distorted = math.tanh(raw * 3.0)
            # Envelope
            env = math.exp(-progress * 8.0) * 1.0 + math.exp(-progress * 1.5) * 0.3
            samples.append(amp * distorted * env)
        return samples

    def _snare_drum(self, velocity: float, duration_sec: float = 0.3) -> list[float]:
        """Synthesize a snare drum (tone + noise)."""
        import random

        num_samples = int(duration_sec * self.sample_rate)
        amp = velocity / 127.0 * 0.6

        samples = []
        for i in range(num_samples):
            t = i / self.sample_rate
            progress = i / num_samples
            # Tone component (~200Hz)
            tone = math.sin(2.0 * math.pi * 200.0 * t) * 0.5
            # Noise component
            noise = (random.random() * 2.0 - 1.0) * 0.5
            # Mix
            mix = tone * 0.3 + noise * 0.7
            # Envelope
            env = math.exp(-progress * 12.0)
            samples.append(amp * mix * env)
        return samples

    def _hihat(self, velocity: float, duration_sec: float = 0.08, open_hat: bool = False) -> list[float]:
        """Synthesize a hi-hat (filtered noise)."""
        import random

        duration = duration_sec * 3.0 if open_hat else duration_sec
        num_samples = int(duration * self.sample_rate)
        amp = velocity / 127.0 * 0.3

        # Simple high-pass filtered noise via running average
        samples = [0.0] * num_samples
        prev_sample = 0.0
        hp_coeff = 0.95  # high-pass coefficient
        for i in range(num_samples):
            noise = random.random() * 2.0 - 1.0
            # High-pass filter: y[n] = coeff * (y[n-1] + x[n] - x[n-1])
            filtered = hp_coeff * (prev_sample + noise - (noise * 0.5 if i > 0 else 0))
            prev_sample = filtered
            # Envelope
            progress = i / num_samples
            env = math.exp(-progress * (10.0 if open_hat else 25.0))
            # Band-pass character via resonance
            res = 1.0 + 0.5 * math.sin(2.0 * math.pi * 8000.0 * float(i) / self.sample_rate)
            samples[i] = amp * filtered * env * res
        return samples

    def render_track(self, track: Track, design: BeatDesign) -> tuple[list[float], bool]:
        """
        Render a single MIDI track to PCM audio.
        Returns (samples, is_drum_track).
        """
        total_samples = int(design.bars * 4.0 * 60.0 / design.bpm * self.sample_rate)
        audio = [0.0] * total_samples
        is_drum = track.channel == 9

        for note in track.notes:
            start_sec = note.start_beat * 60.0 / design.bpm
            duration_sec = note.duration_beats * 60.0 / design.bpm
            start_sample = int(start_sec * self.sample_rate)

            if start_sample >= total_samples:
                continue

            velocity = note.velocity

            # Select waveform based on track name hints
            name_lower = track.name.lower()
            waveform: list[float]

            if is_drum and note.pitch in GM_DRUM_MAP:
                drum_name = GM_DRUM_MAP[note.pitch].lower()
                if "kick" in drum_name or "bass drum" in drum_name:
                    waveform = self._kick_drum(velocity)
                elif "snare" in drum_name:
                    waveform = self._snare_drum(velocity)
                elif "hi-hat" in drum_name and "open" in drum_name:
                    waveform = self._hihat(velocity, open_hat=True)
                elif "hi-hat" in drum_name or "hat" in drum_name:
                    waveform = self._hihat(velocity)
                elif "clap" in drum_name:
                    waveform = self._noise(0.15, velocity)
                elif "crash" in drum_name or "cymbal" in drum_name:
                    waveform = self._noise(0.5, velocity * 0.5)
                else:
                    waveform = self._noise(duration_sec, velocity * 0.5)
            elif "bass" in name_lower or "808" in name_lower or "sub" in name_lower:
                waveform = self._saw_wave(self._freq(note.pitch), duration_sec, velocity)
            elif "pad" in name_lower or "atmosph" in name_lower or "string" in name_lower:
                waveform = self._triangle_wave(self._freq(note.pitch), duration_sec, velocity)
            elif "lead" in name_lower or "hook" in name_lower or "melody" in name_lower:
                waveform = self._saw_wave(self._freq(note.pitch), duration_sec, velocity)
            elif "chord" in name_lower or "piano" in name_lower or "key" in name_lower:
                waveform = self._triangle_wave(self._freq(note.pitch), duration_sec, velocity)
            elif "fx" in name_lower or "sfx" in name_lower:
                waveform = self._square_wave(self._freq(note.pitch), duration_sec, velocity * 0.5)
            else:
                waveform = self._sine_wave(self._freq(note.pitch), duration_sec, velocity)

            # Apply ADSR envelope
            envelope = self._adsr_envelope(
                max(0.001, duration_sec),
                attack=0.005 if is_drum else 0.02,
                decay=0.05 if is_drum else 0.1,
                sustain=0.5 if is_drum else 0.7,
                release=0.05 if is_drum else 0.15,
            )

            # Mix into output
            for j in range(min(len(waveform), len(envelope))):
                idx = start_sample + j
                if idx < total_samples:
                    audio[idx] += waveform[j] * envelope[j]

        return audio, is_drum

    def mix_and_normalize(self, track_audios: list[tuple[list[float], bool]],
                          design: BeatDesign) -> list[int]:
        """Mix all track audio buffers and normalize to 16-bit."""
        total_samples = int(design.bars * 4.0 * 60.0 / design.bpm * self.sample_rate)
        mixed = [0.0] * total_samples

        # Mix with drum emphasis
        for audio, is_drum in track_audios:
            for i in range(min(len(audio), total_samples)):
                mixed[i] += audio[i] * (0.8 if is_drum else 1.0)

        # Find peak for normalization
        peak = max(max(abs(s) for s in mixed), 1e-6)

        # Normalize and convert to 16-bit
        scale = 0.9 / peak * 32767
        return [max(-32768, min(32767, int(s * scale))) for s in mixed]

    def write_wav(self, samples: list[int], filepath: str) -> None:
        """Write PCM samples to a WAV file."""
        with wave.open(filepath, "w") as wf:
            wf.setnchannels(1)  # mono
            wf.setsampwidth(2)  # 16-bit
            wf.setframerate(self.sample_rate)
            wf.writeframes(struct.pack(f"<{len(samples)}h", *samples))


# ── Demo Beat (Bad Guy style) ───────────────────────────

def demo_badguy_beat(bpm: float = 140.0) -> BeatDesign:
    """
    Demo: Dark Trap Beat — "Shadow Slide"
    Key: C natural minor, 140 BPM, 8 bars.
    Aggressive 808 slides, sparse hi-hat rolls, dark bell melody.
    """
    design = BeatDesign(
        bpm=bpm,
        key="C",
        scale="natural_minor",
        time_signature=(4, 4),
        bars=8,
    )

    # ── Drum Track (Channel 9) ──
    drum_track = Track(name="Drums", channel=9, program=-1)

    # Kick pattern: aggressive trap — sparse but punchy syncopated hits
    # Per bar skeleton: beat 1.0, 1.666, 2.333, 3.0, 3.666
    # Adding variations for bar 4 and 8 transitions
    kick_pattern = [
        # Bar 1
        (0.0, 1.0), (0.666, 1.0), (1.333, 1.5), (2.0, 2.25), (2.666, 2.75),
        # Bar 2
        (4.0, 4.25), (4.666, 4.75), (5.333, 5.5), (6.0, 6.25), (6.666, 6.75),
        # Bar 3
        (8.0, 8.25), (8.666, 8.75), (9.333, 9.5), (10.0, 10.25), (10.666, 10.75),
        # Bar 4 (transition — extra kicks)
        (12.0, 12.25), (12.666, 12.75), (13.333, 13.5), (14.0, 14.25),
        (15.0, 15.1), (15.333, 15.4),
        # Bar 5
        (16.0, 16.25), (16.666, 16.75), (17.333, 17.5), (18.0, 18.25), (18.666, 18.75),
        # Bar 6
        (20.0, 20.25), (20.666, 20.75), (21.333, 21.5), (22.0, 22.25), (22.666, 22.75),
        # Bar 7
        (24.0, 24.25), (24.666, 24.75), (25.333, 25.5), (26.0, 26.25), (26.666, 26.75),
        # Bar 8 (final transition — slide prep)
        (28.0, 28.25), (28.666, 28.75), (29.333, 29.5), (30.0, 30.25),
        (30.666, 30.75), (31.0, 31.25), (31.333, 31.5),
    ]
    for start, end in kick_pattern:
        drum_track.notes.append(Note(pitch=36, start_beat=start, duration_beats=end - start, velocity=115))

    # Snare on beat 3, Clap on beat 1 — trap convention
    for bar in range(8):
        # Snare (38) on beat 3
        drum_track.notes.append(Note(pitch=38, start_beat=bar * 4 + 2.0, duration_beats=0.15, velocity=100))
        # Clap (39) layered on beat 1 with kick
        drum_track.notes.append(Note(pitch=39, start_beat=bar * 4 + 0.0, duration_beats=0.1, velocity=90))

    # Hi-hat: SPARSE by design — only rolls at transitions, silence otherwise
    # Bar 4 transition: 16th roll on beats 3.0–4.0
    for sixteenth in range(16):
        drum_track.notes.append(Note(pitch=42, start_beat=12.0 + sixteenth * 0.25, duration_beats=0.08, velocity=60))
    # Bar 8 transition: 16th roll on beats 3.0–4.0
    for sixteenth in range(16):
        drum_track.notes.append(Note(pitch=42, start_beat=28.0 + sixteenth * 0.25, duration_beats=0.08, velocity=60))
    # Open hi-hat punctuation on beat 4.5 of bars 2, 4, 6
    for bar_idx in [1, 3, 5]:
        drum_track.notes.append(Note(pitch=46, start_beat=bar_idx * 4 + 3.5, duration_beats=0.25, velocity=85))

    design.tracks.append(drum_track)

    # ── 808 Bass (Channel 0, Program 38: Synth Bass 1) ──
    bass_track = Track(name="808 Bass", channel=0, program=38)

    # C natural minor: C=36, D=38, Eb=39, F=41, G=43, Ab=44, Bb=46
    # Static Cm drone with chromatic slide tension (C→B→Bb→C)
    # Aggressive slides implemented as rapid neighboring pitch bends
    bass_pattern = [
        # Bar 1-2: C pulse — trap rhythm skeleton
        (36, 0.0, 0.4), (36, 0.666, 0.3), (36, 1.333, 0.25),
        (36, 2.0, 0.4), (36, 2.666, 0.3), (36, 3.5, 0.5),
        (36, 4.0, 0.4), (36, 4.666, 0.3), (36, 5.333, 0.25),
        (36, 6.0, 0.4), (36, 6.666, 0.3), (36, 7.5, 0.5),
        # Bar 3-4: C with chromatic slide to B (35)
        (36, 8.0, 0.35), (35, 8.25, 0.08), (36, 8.35, 0.3),
        (36, 8.666, 0.3), (36, 9.333, 0.25), (36, 10.0, 0.4),
        (36, 10.666, 0.3), (35, 11.25, 0.08), (36, 11.35, 0.3),
        (36, 12.0, 0.35), (35, 12.25, 0.08), (36, 12.35, 0.3),
        (36, 12.666, 0.3), (36, 13.333, 0.25), (36, 14.0, 0.4),
        (36, 14.5, 0.5), (35, 15.25, 0.08), (36, 15.35, 0.3),
        # Bar 5-6: C with deeper chromatic drift to Bb (34) — dark tension
        (36, 16.0, 0.35), (34, 16.25, 0.1), (36, 16.35, 0.3),
        (36, 16.666, 0.3), (36, 17.333, 0.25), (36, 18.0, 0.4),
        (36, 18.666, 0.3), (34, 19.25, 0.1), (36, 19.35, 0.3),
        (36, 20.0, 0.35), (34, 20.25, 0.1), (36, 20.35, 0.3),
        (36, 20.666, 0.3), (36, 21.333, 0.25), (36, 22.0, 0.4),
        (36, 22.5, 0.5), (34, 23.25, 0.1), (36, 23.35, 0.3),
        # Bar 7-8: aggressive slide return to C — glissando burst
        (36, 24.0, 0.35), (35, 24.2, 0.08), (34, 24.3, 0.08), (36, 24.4, 0.35),
        (36, 24.666, 0.3), (36, 25.333, 0.25), (36, 26.0, 0.4),
        (36, 26.666, 0.3), (36, 27.0, 0.4),
        # Big finish
        (34, 27.5, 0.1), (35, 27.65, 0.08), (36, 27.75, 0.5),
        (36, 28.0, 0.35), (36, 28.666, 0.3), (36, 29.333, 0.25),
        (36, 30.0, 0.4), (36, 30.5, 0.5), (36, 31.0, 1.0),
    ]
    for pitch, start, dur in bass_pattern:
        bass_track.notes.append(Note(pitch=pitch, start_beat=start, duration_beats=dur, velocity=110))

    design.tracks.append(bass_track)

    # ── Dark Bell Melody (Channel 1, Program 14: Tubular Bells) ──
    bell_track = Track(name="Bell Melody", channel=1, program=14)

    # C natural minor: C5=72, D5=74, Eb5=75, F5=77, G5=79, Ab5=80, Bb5=82
    # Descending sigh motif: Eb→D→C — dark, minimalist, memorable
    # Microtonal slide via ghost note D→C (74→73→72)
    melody = [
        # ── Bar 1-2: Motif A — Eb→D→C, then Eb→D→C→Bb ──
        (75, 0.0, 0.5), (74, 0.5, 0.05), (73, 0.55, 0.05), (72, 0.6, 1.0),
        (75, 2.0, 0.5), (74, 2.5, 0.05), (73, 2.55, 0.05), (72, 2.6, 0.5),
        (70, 3.5, 0.5),
        # ── Bar 3-4: Motif A' — micro-variation on tail ──
        (75, 4.0, 0.5), (74, 4.5, 0.05), (73, 4.55, 0.05), (72, 4.6, 1.0),
        (75, 6.0, 0.5), (74, 6.5, 0.05), (73, 6.55, 0.05), (72, 6.6, 0.5),
        (74, 7.0, 0.05), (73, 7.05, 0.05), (72, 7.1, 0.5),
        # ── Bar 5-6: Motif B — rise and fall ──
        (72, 8.0, 0.4), (75, 8.5, 0.4), (79, 9.0, 0.75),
        (77, 10.0, 0.4), (75, 10.5, 0.4), (74, 11.0, 0.5),
        (72, 11.5, 1.0),
        (72, 12.5, 0.4), (75, 13.0, 0.4), (79, 13.5, 0.75),
        (77, 14.5, 0.4), (75, 15.0, 0.4), (74, 15.5, 0.5),
        # ── Bar 7-8: Motif B' — resolution with held C ──
        (72, 16.0, 0.5), (74, 16.5, 0.05), (73, 16.55, 0.05), (72, 16.6, 0.5),
        (75, 17.0, 0.75), (74, 18.0, 0.5), (72, 18.5, 1.5),
        (72, 20.5, 0.4), (75, 21.0, 0.4), (74, 21.5, 0.05),
        (73, 21.55, 0.05), (72, 21.6, 0.5),
        (70, 22.5, 0.5), (72, 23.0, 2.0),
    ]
    for pitch, start, dur in melody:
        bell_track.notes.append(Note(pitch=pitch, start_beat=start, duration_beats=dur, velocity=85))

    design.tracks.append(bell_track)

    # ── Dark Pad (Channel 2, Program 94: Pad 7 Halo) ──
    pad_track = Track(name="Dark Pad", channel=2, program=94)

    # C minor triad sustained throughout: C3=48, Eb3=51, G3=55
    # One chord drone — static harmony
    for bar_start in [0.0, 4.0, 8.0, 12.0, 16.0, 20.0, 24.0, 28.0]:
        for note_pitch in (48, 51, 55):
            pad_track.notes.append(Note(
                pitch=note_pitch,
                start_beat=bar_start,
                duration_beats=3.95,
                velocity=42,
            ))
        # Upper octave whisper
        pad_track.notes.append(Note(pitch=60, start_beat=bar_start, duration_beats=3.95, velocity=35))

    design.tracks.append(pad_track)

    # ── FX Riser (Channel 3, Program 99: FX 4 Atmosphere) ──
    fx_track = Track(name="FX Riser", channel=3, program=99)
    # 16th-note chromatic climb at bar 4 and bar 8 transitions
    for bar_start, bar_offset in [(3.0, 12.0), (7.0, 28.0)]:
        for j in range(16):
            pitch = 60 + j  # C4 → C5 chromatic climb
            fx_track.notes.append(Note(
                pitch=pitch,
                start_beat=bar_offset + j * 0.25,
                duration_beats=0.2,
                velocity=25 + j * 3,
            ))

    design.tracks.append(fx_track)

    return design


# ── CLI Entry Point ─────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="NBeat MIDI → WAV Generator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 generate_beat.py                                    # Demo Bad Guy beat
  python3 generate_beat.py --bpm 140 --output ./my_beat       # Custom BPM
  python3 generate_beat.py --design ./Beat_Design.md           # From design doc
        """,
    )
    parser.add_argument("--design", help="Path to Beat Design Markdown file")
    parser.add_argument("--output", "-o", default="./output", help="Output directory (default: ./output)")
    parser.add_argument("--bpm", type=float, default=140.0, help="BPM for demo beat (default: 140)")
    parser.add_argument("--bars", type=int, default=8, help="Number of bars for demo (default: 8)")

    args = parser.parse_args()

    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"🎧 NBeat Generator")
    print(f"   Output: {output_dir}")

    # ── Build beat design ──
    if args.design and Path(args.design).exists():
        print(f"   Design: {args.design}")
        # TODO: Parse design markdown and build BeatDesign from it
        # For now, use demo beat
        print("   ⚠️  Design parsing not yet implemented — using demo beat")
        design = demo_badguy_beat(args.bpm)
    else:
        print(f"   Using demo beat (Bad Guy style, {args.bpm} BPM, {args.bars} bars)")
        design = demo_badguy_beat(args.bpm)
        design.bars = args.bars

    # ── Generate MIDI ──
    midi_path = output_dir / f"Beat_{int(design.bpm)}BPM_{design.bars}bar.mid"
    write_midi(design, str(midi_path))
    print(f"✅ MIDI written: {midi_path} ({midi_path.stat().st_size} bytes)")

    # ── Generate WAV ──
    synth = PCMSynthesizer(sample_rate=44100)
    print(f"🔊 Synthesizing {len(design.tracks)} tracks...")

    track_audios = []
    for track in design.tracks:
        audio, is_drum = synth.render_track(track, design)
        track_audios.append((audio, is_drum))
        print(f"   ✓ {track.name} ({'drums' if is_drum else 'instrument'}) — {len(audio)} samples")

    mixed = synth.mix_and_normalize(track_audios, design)
    wav_path = output_dir / f"Beat_{int(design.bpm)}BPM_{design.bars}bar.wav"
    synth.write_wav(mixed, str(wav_path))
    print(f"✅ WAV written: {wav_path} ({wav_path.stat().st_size} bytes, {len(mixed) / 44100:.1f}s)")

    print(f"\n🎉 Done! Generated {design.bars} bars at {design.bpm} BPM in {design.key} {design.scale}")


if __name__ == "__main__":
    main()
