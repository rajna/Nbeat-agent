---
description: Generate a complete beat with NBeat meta-music techniques
argument-hint: "<style-description> [template-json-file]"
---

# NBeat Generate

Generate a professional beat using the NBeat meta-music technique system.

## Input

- **Style**: $1
- **Template JSON (optional)**: $2

## Instructions

1. Read the complete beatmakestep workflow from `skills/nbeat/beatmakestep.md`
2. Read all 5 meta-music-skill files:
   - `skills/nbeat/meta-music-skill/目录A_元技巧与算子目录.md`
   - `skills/nbeat/meta-music-skill/目录B_参数值空间.md`
   - `skills/nbeat/meta-music-skill/目录C_复合元技巧与复合算子目录.md`
   - `skills/nbeat/meta-music-skill/目录D_复合算子参数值空间.md`
   - `skills/nbeat/meta-music-skill/rule/增量融合规则.md`
3. If a template JSON is provided, read it and use the melody/chord design as motif
4. Follow beatmakestep.md's stages strictly, using the meta-technique system (directories A/B/C/D) at every step
5. Output all three deliverables: Beat design MD, Suno prompt, and MIDI+WAV generation
