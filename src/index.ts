/**
 * NBeat Agent — pi Extension
 * 
 * A professional AI beat maker powered by meta-music techniques.
 * Orchestrates the complete workflow: user input → knowledge base → LLM → beat output.
 * 
 * Architecture:
 *   Web UI ↔ WebSocket ↔ pi Extension ↔ LLM (reads meta-music-skill, follows beatmakestep)
 *                                   ↔ Python (MIDI → WAV generation)
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { spawn, type ChildProcess } from "node:child_process";
import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";

// ── Constants ──────────────────────────────────────────

const SKILL_DIR = path.resolve(__dirname, "..", "skills", "nbeat");
const META_DIR = path.join(SKILL_DIR, "meta-music-skill");
const TEMPLATE_DIR = path.join(SKILL_DIR, "templates");
const UI_DIR = path.resolve(__dirname, "..", "ui", "demo3");
const BRIDGE_PATH = path.resolve(__dirname, "..", "ui", "bridge.js");
const BEATMAKESTEP_PATH = path.join(SKILL_DIR, "beatmakestep.md");

// Bridge process reference (shared across commands)
let bridgeProcess: ChildProcess | null = null;
const WS_PORT = 8765;
const UI_PORT = 8080;

function isBridgeRunning(): boolean {
  return bridgeProcess !== null && bridgeProcess.exitCode === null;
}

// Knowledge base files
const KB_FILES: Record<string, string> = {
  "目录A_元技巧与算子目录":       path.join(META_DIR, "A_元技巧与算子目录.md"),
  "目录B_参数值空间":              path.join(META_DIR, "B_参数值空间.md"),
  "目录C_复合元技巧与复合算子目录": path.join(META_DIR, "C_复合元技巧与复合算子目录.md"),
  "目录D_复合算子参数值空间":      path.join(META_DIR, "D_复合算子参数值空间.md"),
};

// ── Helpers ────────────────────────────────────────────

function listTemplates(): { name: string; size: number; summary: string }[] {
  if (!fs.existsSync(TEMPLATE_DIR)) return [];
  return fs.readdirSync(TEMPLATE_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => {
      const filePath = path.join(TEMPLATE_DIR, f);
      const raw = fs.readFileSync(filePath, "utf-8");
      let summary = "";
      try {
        const data = JSON.parse(raw) as Record<string, unknown>;
        if (data.notes && Array.isArray(data.notes)) {
          summary = `${data.notes.length} notes`;
        }
        if (data.chords && Array.isArray(data.chords)) {
          summary += `, ${data.chords.length} chords`;
        }
        if (data.keys && Array.isArray(data.keys)) {
          const k = data.keys[0] as Record<string, unknown> | undefined;
          summary += `, key: ${k?.tonic ?? "?"} ${k?.scale ?? ""}`;
        }
      } catch { /* ignore parse errors */ }
      return { name: f, size: raw.length, summary };
    });
}

function buildWorkDir(sessionId: string): string {
  // Allow bridge/CLI to override the work directory
  if (process.env.NBEAT_WORK_DIR) {
    const dir = process.env.NBEAT_WORK_DIR;
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }
  const workDir = path.join(
    process.env.HOME || "/tmp",
    ".nbeat",
    "sessions",
    sessionId.slice(0, 8)
  );
  fs.mkdirSync(workDir, { recursive: true });
  return workDir;
}

// ── Extension Entry ────────────────────────────────────

export default function (pi: ExtensionAPI) {
  // ========================================================
  // Tool: nbeat_list_templates
  // ========================================================
  pi.registerTool({
    name: "nbeat_list_templates",
    label: "List NBeat Templates",
    description:
      "List available song/melody template JSON files in the NBeat template library. " +
      "Each template contains melody note designs and chord progressions in Hooktheory format. " +
      "Use this to show the user available templates they can select.",
    parameters: Type.Object({}),
    async execute() {
      const templates = listTemplates();
      if (templates.length === 0) {
        return {
          content: [{ type: "text", text: "No templates found in the library." }],
          details: { templates: [] },
        };
      }
      const lines = templates.map(
        t => `- **${t.name}**: ${t.summary || "no summary"} (${(t.size / 1024).toFixed(1)} KB)`
      );
      return {
        content: [{ type: "text", text: `## NBeat Templates (${templates.length})\n\n${lines.join("\n")}` }],
        details: { templates },
      };
    },
  });

  // ========================================================
  // Tool: nbeat_generate — the main beat generation tool
  // ========================================================
  pi.registerTool({
    name: "nbeat_generate",
    label: "NBeat Generate Beat",
    description:
      "Generate a complete professional beat using the NBeat meta-music technique system. " +
      "This is the MAIN tool for beat making. It sets up the full workflow context including " +
      "reading the beatmakestep workflow and all meta-music knowledge base files. " +
      "Use this when the user wants to create a beat, make an instrumental, or generate music production assets.",
    parameters: Type.Object({
      requirement: Type.String({
        description:
          "User's requirement description. E.g., 'Bad Guy by Billie Eilish style, dark pop, G harmonic minor, 135 BPM'",
      }),
      template: Type.Optional(
        Type.String({
          description:
            "Optional template JSON file name from the template library. E.g., 'Bad Guy.json'. Leave empty if not using a template.",
        })
      ),
    }),
    async execute(_toolCallId, params, _signal, onUpdate, ctx) {
      const { requirement, template } = params;

      // ── Setup work directory ──
      const sessionId = ctx.sessionManager?.getSessionFile?.() ?? "nbeat_session";
      const workDir = buildWorkDir(
        typeof sessionId === "string" ? sessionId : (sessionId as unknown as string) || "nbeat"
      );
      onUpdate?.({ content: [{ type: "text", text: `📁 Work dir: ${workDir}` }] });

      // ── Read beatmakestep and inject user requirement ──
      let beatmakestep = "";
      if (fs.existsSync(BEATMAKESTEP_PATH)) {
        beatmakestep = fs.readFileSync(BEATMAKESTEP_PATH, "utf-8");
      } else {
        return {
          content: [{ type: "text", text: `❌ Error: beatmakestep.md not found at ${BEATMAKESTEP_PATH}` }],
          details: { error: "beatmakestep not found" },
        };
      }

      // Inject user requirement into the placeholder
      beatmakestep = beatmakestep.replace(
        "{插入用户文本输入的制作需求位置}",
        `${requirement}\n`
      );
      // Inject template JSON if provided
      if (template) {
        const templatePath = path.join(TEMPLATE_DIR, template);
        if (fs.existsSync(templatePath)) {
          const templateContent = fs.readFileSync(templatePath, "utf-8");
          templateInfo = `json文件(用户上传)是歌曲的旋律设计 以此为灵感动机展开制作:\n\`\`\`json\n${templateContent}\n\`\`\`\n`;
          beatmakestep = beatmakestep.replace(
            "{插入用户上传的json文件内容位置(可选 如果插入 以此为动机)}",
            templateInfo
          );
        }
      } else {
        beatmakestep = beatmakestep.replace(
          "{插入用户上传的json文件内容位置(可选 如果插入 以此为动机)}",
          ""
        );
      }

      // Write the combined prompt to work dir for reference
      const promptPath = path.join(workDir, "nbeat_prompt.md");
      fs.writeFileSync(promptPath, beatmakestep, "utf-8");

      onUpdate?.({
        content: [{ type: "text", text: "✅ Workflow context prepared. Loading knowledge base..." }],
      });

      // ── Return the full workflow for the LLM to follow ──
      // We provide the beatmakestep as context, and instruct the LLM to
      // read KB files as needed during each step.
      return {
        content: [
          {
            type: "text",
            text: [
              `# 🎧 NBeat Beat Generation Task`,
              ``,
              `## User Requirement`,
              `> ${requirement}`,
              template ? `\n## Template\n> ${template}` : "",
              ``,
              `## Workflow (from beatmakestep.md)`,
              ``,
              beatmakestep,
              ``,
              `---`,
              `## 🔑 Key Instructions`,
              ``,
              `1. **Read the knowledge base files as needed** during each step. The files are at:`,
              ...Object.entries(KB_FILES).map(([label, fpath]) => `   - ${label}: \`${fpath}\``),
              ``,
              `2. **Follow the beatmakestep workflow strictly** — stages 1→2→4→5→6`,
              `3. **ALL meta-techniques must serve**: emotion → memory → groove → replay value`,
              `4. **Use directories A/B for base techniques**, C/D for compound techniques`,
              `5. **Parameter spaces (B/D) are samples, NOT boundaries** — extrapolate creatively`,
              `6. **Understand cross-pollution**: rhythm changes harmony perception, timbre changes time feel, density changes melody memory`,
              ``,
              `## 📦 Deliverables`,
              ``,
              `**A. Beat Design Markdown** → write to \`${workDir}/Beat_Design.md\``,
              `**B. Suno AI Prompt** → 1000 chars max, English, high-entropy. Write to \`${workDir}/Suno_Prompt.txt\``,
              `**C. MIDI + WAV** → Generate Python code to \`${workDir}/generate_beat.py\`, then execute it`,
              ``,
              `## ⚙️ Work Directory`,
              `All output files go to: \`${workDir}/\``,
            ].join("\n"),
          },
        ],
        details: {
          workDir,
          requirement,
          template: template || null,
          kbFiles: KB_FILES,
        },
      };
    },
  });

  // ========================================================
  // Tool: nbeat_read_kb — read a specific knowledge base section
  // ========================================================
  pi.registerTool({
    name: "nbeat_read_kb",
    label: "Read NBeat KB",
    description:
      "Read a specific section of the NBeat knowledge base (directories A/B/C/D). " +
      "Use this when you need to look up specific meta-techniques (MT), operators (OP), " +
      "compound operators (COP), or parameter value spaces during beat generation.",
    parameters: Type.Object({
      section: Type.String({
        description: "Knowledge base section name. One of: A, B, C, D, rule",
      }),
      filter: Type.Optional(
        Type.String({
          description:
            "Optional filter to narrow down content. E.g., 'MT_chord' to only show chord techniques, " +
            "'OP_harmonic_cycle' for a specific operator, or 'MCT_density_form' for compound techniques.",
        })
      ),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      const { section, filter } = params;
      const sectionMap: Record<string, string> = {
        a: KB_FILES["目录A_元技巧与算子目录"],
        A: KB_FILES["目录A_元技巧与算子目录"],
        b: KB_FILES["目录B_参数值空间"],
        B: KB_FILES["目录B_参数值空间"],
        c: KB_FILES["目录C_复合元技巧与复合算子目录"],
        C: KB_FILES["目录C_复合元技巧与复合算子目录"],
        d: KB_FILES["目录D_复合算子参数值空间"],
        D: KB_FILES["目录D_复合算子参数值空间"],
      };

      const filePath = sectionMap[section];
      if (!filePath || !fs.existsSync(filePath)) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Unknown section: "${section}". Available: A, B, C, D`,
            },
          ],
          details: { error: "unknown_section" },
        };
      }

      let content = fs.readFileSync(filePath, "utf-8");

      // If a filter is provided, extract relevant sections
      if (filter) {
        const lines = content.split("\n");
        const filtered: string[] = [];
        let inSection = false;
        let headerCount = 0;

        for (const line of lines) {
          if (line.includes(filter)) {
            inSection = true;
            headerCount = 0;
          }
          if (inSection) {
            if (line.startsWith("## ") || line.startsWith("### ")) {
              headerCount++;
              if (headerCount > 3) {
                inSection = false;
                continue;
              }
            }
            filtered.push(line);
          }
        }

        if (filtered.length > 0 && filtered.length < content.length) {
          content = filtered.join("\n");
        }
      }

      // Truncate if too large
      const MAX_BYTES = 60000;
      if (Buffer.byteLength(content, "utf-8") > MAX_BYTES) {
        content = content.slice(0, MAX_BYTES);
        content += "\n\n... (truncated, use filter to narrow down)";
      }

      return {
        content: [{ type: "text", text: content }],
        details: { section, filter: filter || null, file: filePath, size: content.length },
      };
    },
  });

  // ========================================================
  // Command: /nbeat:ui — launch the Web UI server
  // ========================================================
  pi.registerCommand("nbeat:ui", {
    description: "Launch the NBeat Web UI for interactive beat generation",
    handler: async (_args, ctx) => {
      // Check if port 8080 is already in use (possibly already running)
      const alreadyRunning = await new Promise<boolean>((resolve) => {
        const req = http.get(`http://localhost:${UI_PORT}/`, (res) => {
          res.resume();
          resolve(true);
        });
        req.on("error", () => resolve(false));
        req.setTimeout(1000, () => { req.destroy(); resolve(false); });
      });

      if (alreadyRunning) {
        ctx.ui.notify(
          `🎧 NBeat Studio is already running at http://localhost:${UI_PORT}`,
          "info"
        );
        ctx.ui.setStatus("nbeat", `🎧 NBeat Studio → http://localhost:${UI_PORT} | /nbeat:ui-stop to stop`);
        return;
      }

      if (isBridgeRunning()) {
        ctx.ui.notify("🎧 Bridge process exists but port not responding. Restarting...", "warning");
        bridgeProcess?.kill();
        bridgeProcess = null;
      }

      if (!fs.existsSync(BRIDGE_PATH)) {
        ctx.ui.notify(`❌ Bridge not found at: ${BRIDGE_PATH}`, "error");
        return;
      }

      ctx.ui.notify(`🎧 Launching NBeat Studio...`, "info");

      bridgeProcess = spawn("node", [BRIDGE_PATH], {
        stdio: "pipe",
        env: { ...process.env },
      });

      bridgeProcess.stdout?.on("data", (data: Buffer) => {
        // Silently consume stdout (bridge logs to its own console)
      });

      bridgeProcess.stderr?.on("data", (data: Buffer) => {
        const msg = data.toString().trim();
        if (msg) ctx.ui.notify(`[nbeat] ${msg}`, "info");
      });

      bridgeProcess.on("exit", (code) => {
        bridgeProcess = null;
        ctx.ui.setStatus("nbeat", `🎧 NBeat stopped (exit ${code}) | /nbeat:ui to restart`);
      });

      bridgeProcess.on("error", (err) => {
        bridgeProcess = null;
        ctx.ui.notify(`❌ Failed to start NBeat Studio: ${err.message}`, "error");
        ctx.ui.setStatus("nbeat", `🎧 NBeat error | /nbeat:ui to retry`);
      });

      // Wait a moment for the server to start, then confirm
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const ready = await new Promise<boolean>((resolve) => {
        const req = http.get(`http://localhost:${UI_PORT}/`, (res) => {
          res.resume();
          resolve(true);
        });
        req.on("error", () => resolve(false));
        req.setTimeout(2000, () => { req.destroy(); resolve(false); });
      });

      if (ready) {
        ctx.ui.notify(
          `🎧 NBeat Studio is live! Open http://localhost:${UI_PORT} in your browser`,
          "success"
        );
        ctx.ui.setStatus(
          "nbeat",
          `🎧 NBeat Studio → http://localhost:${UI_PORT} | /nbeat:ui-stop to stop`
        );
      } else {
        ctx.ui.notify(
          `⚠️ Bridge started but UI not responding yet. Try http://localhost:${UI_PORT}`,
          "warning"
        );
      }
    },
  });

  // ========================================================
  // Command: /nbeat:ui-stop — stop the Web UI server
  // ========================================================
  pi.registerCommand("nbeat:ui-stop", {
    description: "Stop the NBeat Web UI server",
    handler: async (_args, ctx) => {
      if (!isBridgeRunning()) {
        ctx.ui.notify("🎧 NBeat Studio is not running.", "info");
        return;
      }

      bridgeProcess?.kill();
      bridgeProcess = null;
      ctx.ui.notify("🎧 NBeat Studio stopped.", "info");
      ctx.ui.setStatus("nbeat", `🎧 NBeat stopped | /nbeat:ui to restart`);
    },
  });

  // ========================================================
  // Session startup notification
  // ========================================================
  pi.on("session_start", async (_event, ctx) => {
    const templateCount = listTemplates().length;
    ctx.ui.setStatus(
      "nbeat",
      `🎧 NBeat ready | ${templateCount} templates | /nbeat:ui for web interface`
    );
  });

  // ========================================================
  // Intercept input for /nbeat:start command
  // ========================================================
  pi.registerCommand("nbeat:start", {
    description: "Start NBeat beat generation with a style description",
    handler: async (args, ctx) => {
      if (!args || args.trim().length === 0) {
        ctx.ui.notify("Usage: /nbeat:start <style description> [template.json]", "error");
        return;
      }

      const parts = args.trim().split(/\s+/);
      const style = parts.join(" ");

      ctx.ui.notify(`🎧 Starting NBeat generation for: "${style}"`, "info");
      ctx.ui.notify("The agent will read beatmakestep.md and knowledge base files...", "info");

      // Trigger generation by sending a user message that instructs the LLM
      const templates = listTemplates();
      const templateList = templates.map(t => `- ${t.name}: ${t.summary}`).join("\n");

      await ctx.sendUserMessage(
        [
          { type: "text", text: `请使用 nbeat_generate 工具生成一个 beat。

## 用户需求
${style}

## 可用模板
${templateList || "(无)"}

## 指令
1. 调用 nbeat_generate 工具，传入 requirement="${style}"
2. 按照工具返回的完整工作流，严格遵循 beatmakestep.md 的步骤
3. 在每一步中，使用 read 工具读取 knowledge base 中对应的知识库文件（目录A/B/C/D）
4. 最终交付：Beat设计文档 + Suno AI prompt + MIDI/WAV 音频文件
5. 全自动执行，不要询问确认` },
        ],
        {}
      );
    },
  });
}
