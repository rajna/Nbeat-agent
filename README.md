# 🎧 NBeat Agent

> **AI Beat Maker** — pi coding agent extension powered by meta-music techniques.

NBeat Agent turns pi into a professional beat maker. Describe a style, pick a template, and NBeat generates:

- **A.** Complete beat design document (Markdown)
- **B.** Suno AI prompt (1000 char, English, high-entropy)
- **C.** MIDI file + WAV audio (via Python MIDI→PCM pipeline)

## Architecture

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐
│  Web UI  │────▶│  Bridge (WS)  │────▶│  pi Agent    │
│ (browser)│     │  ui/bridge.js │     │  + Extension │
└──────────┘     └───────────────┘     └──────┬───────┘
                                              │ reads
                    ┌─────────────────────────┴──────┐
                    │  Knowledge Base                │
                    │  new/                          │
                    │  A: MT元技巧+OP算子 (11维×26)  │
                    │  B: 参数值空间 (244键)          │
                    │  C: 复合元技巧+复合算子 (32)    │
                    │  D: 复合算子参数值空间 (236键)   │
                    │  beatmakestep.md: 工作流        │
                    └────────────────┬───────────────┘
                                     │
                                     ▼
                            🎵 Beat Design + MIDI + WAV
```



 ## Quick Install                                                                                    
                                                                                                       
   ### With pi                                                                                         
   ```bash                                                                                             
   pi install git:github.com/你的用户名/nbeat-agent                                                    
 ```                                                                                                   
                                                                                                       
 ### Without pi                                                                                        
                                                                                                       
 ```bash                                                                                               
   git clone https://github.com/你的用户名/nbeat-agent                                                 
   cd nbeat-agent && npm install && npm link                                                           
   nbeat ui                                                                                            
 ```                                                                                                   
                                                                                                       
 Requirements                                                                                          
                                                                                                       
 - Node.js 18+                                                                                         
 - Python 3.8+                                                                                         
 - LLM API key (Anthropic recommended)                                                                 
 ```                                    

### Launch Web UI

```bash
nbeat ui                    # One command: start server + open browser
# Or manually:
node ui/bridge.js
```

## Custom Tools

| Tool | Description |
|------|-------------|
| `nbeat_generate` | Main beat generation — loads workflow + knowledge base |
| `nbeat_read_kb` | Read specific sections of the knowledge base (A/B/C/D/rule) |
| `nbeat_list_templates` | List available melody template JSON files |

## Commands

| Command | Description |
|---------|-------------|
| `/nbeat:start <style>` | Quick start beat generation |
| `/nbeat:ui` | Show Web UI file location |

## Meta-Music Technique System

The core of NBeat is a **14-dimension meta-technique system**:

| MT Dimension | Domain |
|---|---|
| `MT_chord` | Harmony/cadence/extensions |
| `MT_dynamic` | Velocity/pump/accent |
| `MT_emotion` | Imagery/semantic binding |
| `MT_groove` | Rhythm skeleton/micro-timing/syncopation |
| `MT_melody` | Melodic contour/intervals/ornaments |
| `MT_motif` | Motif/sample/theme variation |
| `MT_orch` | Orchestration/instrument fill |
| `MT_rhythm` | Rhythmic ornament/onomatopoeia |
| `MT_space` | Depth/pan/frequency separation |
| `MT_texture` | Density/layering/sustain field |
| `MT_timbre` | Timbre fusion/distortion/style graft |
| `MT_time` | Tempo/form/structure reset |
| `MT_ton` | Tonal anchor/mode color/shift |
| `MT_voice` | Vocal layering/counterpoint |

Each dimension has **operators (OP)** with parameter spaces. Compound techniques (MCT/COP) combine multiple dimensions for complex effects.

## Requirements

### Minimal (nbeat CLI)

- **Node.js 18+**
- **Python 3.8+** for MIDI→WAV generation
- LLM provider: Anthropic API key or `/login` subscription (Claude Pro, ChatGPT, Copilot)
- **macOS**: `afplay` (built-in) for audio preview
- **Linux**: `mpv` or `mpg123` for audio playback

### As pi Package

- [pi coding agent](https://pi.dev) installed (`npm install -g @earendil-works/pi-coding-agent`)
- **Python 3.8+**
- Same LLM / audio requirements as above

## Template Format

Templates use the Hooktheory clipboard JSON format with `notes`, `chords`, and `keys` arrays. Example:

```json
{
  "notes": [
    {"beat": 1, "duration": 1, "sd": "3", "octave": -1, "isRest": false}
  ],
  "chords": [
    {"beat": 1, "duration": 16, "root": 1, "type": 5}
  ],
  "keys": [
    {"beat": 1, "scale": "harmonicMinor", "tonic": "G"}
  ]
}
```

## License

MIT
