---
name: nbeat
description: Professional AI beat maker using meta-music techniques. Generate beat design documents, Suno AI prompts, MIDI files, and WAV audio. Supports 14 meta-technique dimensions (MT_chord, MT_groove, MT_melody, MT_motif, MT_rhythm, MT_dynamic, MT_timbre, MT_texture, MT_space, MT_time, MT_ton, MT_orch, MT_emotion, MT_voice) with 169 operators and compound techniques. Use this skill when the user wants to create beats, compose instrumentals, or generate music production assets.
---

# NBeat Music Agent

Professional beat maker powered by **meta-music techniques** — a system of 14 orthogonal technique dimensions (MT) and 169 operators (OP) for music creation.

## Core Philosophy

- **MT(OP(params))**: Every musical decision = dimension selector ⊕ operator transform
- **EML_music**: Recursive composition of techniques creates novel musical DNA
- **Pollution effect**: Rhythm changes harmony perception, timbre changes time feel, density changes melody memory
- **Service target**: emotion → memory → groove → replay value

## Workflow Overview

When generating a beat, follow the beatmakestep workflow:

1. **Stage 1**: Core design — BPM/Key, rhythm, melody, motif development, tonality, orchestration, drum design, instrument selection
2. **Stage 2**: Arrangement refinement — texture variation, rhythm variation, dynamics, ornamentation, devil details
3. **Stage 4**: Grammy-level reflection — timbre character, memorability, groove, replay value
4. **Stage 5**: Negative reflection loop — go back to Stage 4 until truly satisfied
5. **Stage 6**: Classic polish — adjust based on feedback, target: 好听/摇/爽/有特色/有性格

## Deliverables

Every beat must produce:
- **A**: Beat design Markdown document
- **B**: 1000-char Suno AI prompt (English, high-entropy, no DAW params, no mixing/vocal sections)
- **C**: MIDI + WAV audio (via Python MIDI→PCM pipeline)

## Knowledge Base

The `new/` directory contains:
- **目录A**: MT元技巧与算子目录 — 11 MT dimensions + 26 OP operators
- **目录B**: 参数值空间 — 244 parameter keys with value spaces
- **目录C**: 复合元技巧与复合算子目录 — 32 compound MCT techniques
- **目录D**: 复合算子参数值空间 — 236 compound structural parameters

## Usage

```bash
# Start the NBeat agent
/nbeat:start "Bad Guy by Billie Eilish style, dark pop, G harmonic minor"

# Or use the prompt template
/nbeat-generate
```

## Tips

1. MT dimensions can nest in multi-dimensional combinations to create entirely new techniques
2. Directories A/B are the base layer: A = MT dimensions + OP catalog, B = OP parameter space
3. Directories C/D are the compound layer: C = MCT compound techniques + COP compound operators, D = COP parameter space
4. Use base layer (A/B) to carefully modulate MT + OP + params to generate new techniques
5. Use compound layer (C/D) to organize techniques from step 4 into organic, creative combinations
6. Directories B/D are analyzed samples, NOT creative boundaries — extrapolate new parameter values based on music production knowledge and listening goals
7. Understand cross-pollution between techniques (rhythm→harmony perception, timbre→time feel, density→melody memory) to evolve new species
8. ALL techniques MUST serve: emotion → memory → groove → replay value
