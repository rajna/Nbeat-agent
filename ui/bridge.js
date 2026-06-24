#!/usr/bin/env node
/**
 * NBeat WebSocket Bridge
 * ======================
 * Connects the NBeat Web UI to pi coding agent.
 *
 * Flow:
 *   Web UI → WebSocket → Bridge → pi RPC (sendUserMessage) → LLM → result → UI
 *
 * Usage:
 *   node bridge.js [--port 8765] [--ui-port 8080]
 *
 * Prerequisites:
 *   - pi installed and configured
 *   - nbeat-agent extension loaded (pi -e /path/to/nbeat-agent/src/index.ts)
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const crypto = require("crypto");

// ── Config ─────────────────────────────────────────────
const WS_PORT = parseInt(process.env.NBEAT_WS_PORT || "8765");
const UI_PORT = parseInt(process.env.NBEAT_UI_PORT || "8080");
const DRY_RUN = process.env.NBEAT_DRY_RUN === "1";
const UI_DIR = path.resolve(__dirname, "..", "ui", "demo3");
const NBEAT_DIR = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(process.env.HOME || "/tmp", ".nbeat", "output");

// ── Ensure output dir ──────────────────────────────────
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── Job Manager ────────────────────────────────────────
const JOBS = new Map();

function createJobId() {
  return crypto.randomBytes(4).toString("hex");
}

function newJob(style, template) {
  const jobId = createJobId();
  const workDir = path.join(OUTPUT_DIR, `job_${jobId}`);
  fs.mkdirSync(workDir, { recursive: true });
  JOBS.set(jobId, {
    id: jobId,
    style,
    template,
    workDir,
    startedAt: Date.now(),
    status: "preparing",
    output: [],
  });
  return jobId;
}

function scanOutputFiles(workDir) {
  const files = [];
  if (!fs.existsSync(workDir)) return files;

  // Compute relative path from OUTPUT_DIR for HTTP serving
  const relDir = path.relative(OUTPUT_DIR, workDir);

  for (const entry of fs.readdirSync(workDir)) {
    const filePath = path.join(workDir, entry);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    const ext = path.extname(entry).toLowerCase();
    let type = "text/plain";
    if (ext === ".wav") type = "audio/wav";
    else if (ext === ".mid") type = "audio/midi";
    else if (ext === ".md") type = "text/markdown";
    else if (ext === ".py") type = "text/python";
    else if (ext === ".txt") type = "text/plain";

    // URL: http://localhost:8080/output/<job_dir>/<filename>
    const urlPath = relDir ? `output/${relDir}/${entry}` : `output/${entry}`;
    files.push({
      name: entry,
      path: filePath,
      type,
      size: stat.size,
      httpUrl: `http://localhost:${UI_PORT}/${urlPath}`,
    });
  }

  // Sort: wav first, then mid, then docs
  files.sort((a, b) => {
    const order = { "audio/wav": 0, "audio/midi": 1 };
    return (order[a.type] ?? 3) - (order[b.type] ?? 3);
  });

  return files;
}

// ── Build the NBeat prompt for LLM ───────────────────── ── Stage Detector ─────────────────────────────────────
const STAGE_PATTERNS = [
  ["读取", "📖 读取文件中..."],
  ["beatmakestep", "📋 加载工作流..."],
  ["目录A", "📖 加载元技巧目录A..."],
  ["目录B", "📖 加载参数空间B..."],
  ["目录C", "📖 加载复合技巧C..."],
  ["目录D", "📖 加载复合参数D..."],
  ["增量融合", "📖 加载融合规则..."],
  ["step 1", "🔍 Step 1: 分析动机..."],
  ["step 2", "🧩 Step 2: 匹配元技巧..."],
  ["step 3", "✍️ Step 3: 设计文档..."],
  ["step 4", "🐍 Step 4: 生成代码..."],
  ["step 5", "🔨 Step 5: 合成音频..."],
  ["step 6", "✅ Step 6: 验证..."],
  [".wav", "🎵 WAV 已生成!"],
  ["Beat_Design", "📄 设计文档已生成"],
  ["Suno_Prompt", "📝 Suno prompt 已生成"],
  ["error", "❌ 出错"],
  ["Error", "❌ 出错"],
  ["完成", "🏁 完成"],
  ["Done", "🏁 完成"],
];

function detectStage(line) {
  for (const [keyword, label] of STAGE_PATTERNS) {
    if (line.includes(keyword)) return label;
  }
  return null;
}

// ── MIME types for file server ─────────────────────────
const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".wav": "audio/wav",
  ".mid": "audio/midi",
  ".midi": "audio/midi",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".md": "text/markdown",
  ".txt": "text/plain",
  ".py": "text/plain",
};

// ── Serve file with range support (needed for audio seeking) ─
function serveFile(req, res, filePath, mimeType) {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = (end - start) + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": mimeType,
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Type": mimeType,
      "Content-Length": fileSize,
      "Accept-Ranges": "bytes",
    });
    fs.createReadStream(filePath).pipe(res);
  }
}

// ── HTTP Server (UI + file serving) ────────────────────
const httpServer = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${UI_PORT}`);

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: POST /api/generate → generate prompt
  if (req.method === "POST" && url.pathname === "/api/generate") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { style, template } = JSON.parse(body);
        const prompt = buildNBeatPrompt(style, template, null);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ prompt }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API: GET /api/jobs → list all generated beats
  if (req.method === "GET" && url.pathname === "/api/jobs") {
    const jobs = [];
    if (fs.existsSync(OUTPUT_DIR)) {
      for (const dir of fs.readdirSync(OUTPUT_DIR)) {
        const jobDir = path.join(OUTPUT_DIR, dir);
        if (!fs.statSync(jobDir).isDirectory() || !dir.startsWith("job_")) continue;
        const files = scanOutputFiles(jobDir);
        if (files.length === 0) continue;
        jobs.push({
          id: dir,
          workDir: jobDir,
          files: files.map(f => ({ name: f.name, type: f.type, size: f.size, httpUrl: f.httpUrl })),
        });
      }
    }
    // Sort by job dir modification time (newest first)
    jobs.sort((a, b) => {
      try { return fs.statSync(b.workDir).mtime - fs.statSync(a.workDir).mtime; } catch { return 0; }
    });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(jobs));
    return;
  }

  // API: GET /api/templates
  if (req.method === "GET" && url.pathname === "/api/templates") {
    const templatesDir = path.join(NBEAT_DIR, "skills", "nbeat", "templates");
    const templates = [];
    if (fs.existsSync(templatesDir)) {
      for (const f of fs.readdirSync(templatesDir)) {
        if (f.endsWith(".json")) {
          const raw = fs.readFileSync(path.join(templatesDir, f), "utf-8");
          let summary = "";
          try {
            const data = JSON.parse(raw);
            if (data.notes) summary = `${data.notes.length} notes`;
            if (data.chords) summary += `, ${data.chords.length} chords`;
            if (data.keys && data.keys[0]) {
              summary += `, ${data.keys[0].tonic} ${data.keys[0].scale}`;
            }
          } catch {}
          templates.push({ name: f, size: raw.length, summary });
        }
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(templates));
    return;
  }

  // Serve UI files
  let filePath = url.pathname === "/" ? "/index.html" : url.pathname;

  // Serve output files (supports nested job dirs: /output/job_<id>/file.wav)
  if (filePath.startsWith("/output/")) {
    const relPath = filePath.replace("/output/", "");
    const outputFile = path.join(OUTPUT_DIR, relPath);
    if (fs.existsSync(outputFile) && fs.statSync(outputFile).isFile()) {
      const ext = path.extname(outputFile).toLowerCase();
      serveFile(req, res, outputFile, MIME_TYPES[ext] || "application/octet-stream");
      return;
    }
  }

  // Serve UI static files (with range support for audio)
  const fullPath = path.join(UI_DIR, filePath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(fullPath).toLowerCase();
    const mime = MIME_TYPES[ext] || "text/plain";
    if (ext === ".wav" || ext === ".mid" || ext === ".mp3") {
      serveFile(req, res, fullPath, mime);
    } else {
      const content = fs.readFileSync(fullPath);
      res.writeHead(200, { "Content-Type": mime, "Content-Length": content.length });
      res.end(content);
    }
    return;
  }

  // Fallback: serve index.html
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(fs.readFileSync(path.join(UI_DIR, "index.html")));
});

// ── Find pi binary ─────────────────────────────────────
function findPiBinary() {
  const isWin = process.platform === "win32";
  const piCmd = isWin ? "pi.cmd" : "pi";

  // 1. Bundled pi inside nbeat-agent
  const bundled = path.join(NBEAT_DIR, "node_modules", ".bin", piCmd);
  try {
    fs.accessSync(bundled, fs.constants.X_OK);
    return bundled;
  } catch {}

  // 2. npm root -g
  try {
    const { execSync } = require("child_process");
    const npmRoot = execSync("npm root -g", { encoding: "utf-8", timeout: 3000 }).trim();
    const altBundled = path.join(npmRoot, "nbeat-agent", "node_modules", ".bin", piCmd);
    try { fs.accessSync(altBundled, fs.constants.X_OK); return altBundled; } catch {}
  } catch {}

  // 3. PATH
  if (process.env.PATH) {
    for (const dir of process.env.PATH.split(path.delimiter)) {
      const candidate = path.join(dir, piCmd);
      try { fs.accessSync(candidate, fs.constants.X_OK); return candidate; } catch {}
    }
  }

  // 4. Windows: common npm global locations
  if (isWin) {
    const winPaths = [
      path.join(process.env.APPDATA || "", "npm", piCmd),
    ];
    for (const p of winPaths) {
      try { fs.accessSync(p, fs.constants.X_OK); return p; } catch {}
    }
  }

  return null;
}

// ── Spawn pi and stream JSON events ────────────────────

function spawnPiAndStream(jobId, prompt, ws, sessionId) {
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would spawn pi with session ${sessionId || `nbeat_${jobId}`}`);
    ws.send(JSON.stringify({
      type: "done",
      jobId,
      workDir: JOBS.get(jobId)?.workDir || "",
      files: [],
      message: "🧪 Dry run — prompt logged above. Set NBEAT_DRY_RUN=0 to execute.",
    }));
    return;
  }
  const piBin = findPiBinary();
  if (!piBin) {
    ws.send(JSON.stringify({
      type: "error",
      message: "❌ pi agent not found. Install: npm install -g @earendil-works/pi-coding-agent",
    }));
    return;
  }

  const job = JOBS.get(jobId);
  if (!job) return;

  const nbeatExt = path.join(NBEAT_DIR, "src", "index.ts");

  ws.send(JSON.stringify({
    type: "progress",
    text: "🚀 Launching pi agent...",
    stage: "🚀 启动中...",
    jobId,
  }));

  const child = spawn(piBin, [
    "--mode", "json",
    "--session-id", sessionId || `nbeat_${jobId}`,
    "-e", nbeatExt,
    "-p", prompt,
  ], {
    cwd: job.workDir,
    env: {
      ...process.env,
      NBEAT_WORK_DIR: job.workDir,
    },
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",  // Windows .cmd requires shell
  });

  let buffer = "";
  let currentTool = null;

  child.stdout.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line);

        switch (event.type) {
          case "session":
            ws.send(JSON.stringify({
              type: "progress",
              text: `📋 Session ${event.id?.slice(0, 8)}`,
              stage: "📋 会话开始",
              jobId,
            }));
            break;

          case "turn_start":
            ws.send(JSON.stringify({
              type: "progress",
              text: "🤔 思考中...",
              stage: "🤔 思考中",
              jobId,
              stream: "turn",
            }));
            break;

          case "message_update":
            // Stream LLM text output to UI
            if (event.assistantMessageEvent?.type === "text_delta") {
              ws.send(JSON.stringify({
                type: "progress",
                text: event.assistantMessageEvent.delta || "",
                stage: "💬 输出中",
                jobId,
                stream: "text",
              }));
            }
            break;

          case "tool_execution_start":
            currentTool = event.toolName;
            const toolLabels = {
              nbeat_generate: "📖 加载工作流与知识库",
              nbeat_read_kb: "📚 读取元技巧知识库",
              read: "📖 读取文件",
              write: "✍️ 写入文件",
              edit: "✏️ 编辑文件",
              bash: "💻 执行命令",
            };
            ws.send(JSON.stringify({
              type: "progress",
              text: `${toolLabels[event.toolName] || `🔧 ${event.toolName}`}`,
              stage: toolLabels[event.toolName] || `🔧 ${event.toolName}`,
              jobId,
            }));
            break;

          case "tool_execution_end":
            currentTool = null;
            if (event.toolName === "write" && event.result?.details?.path) {
              const fn = path.basename(event.result.details.path);
              ws.send(JSON.stringify({
                type: "progress",
                text: `📄 ${fn}`,
                stage: `📄 产出: ${fn}`,
                jobId,
              }));
            } else if (event.toolName === "bash") {
              ws.send(JSON.stringify({
                type: "progress",
                text: event.isError ? "⚠️ 命令出错" : "✅ 命令完成",
                stage: event.isError ? "⚠️" : "✅",
                jobId,
              }));
            }
            break;

          case "agent_end":
            ws.send(JSON.stringify({
              type: "progress",
              text: "🏁 LLM 处理完成，扫描输出...",
              stage: "🏁 完成",
              jobId,
            }));
            break;
        }
      } catch {}
    }
  });

  child.stderr.on("data", (chunk) => {
    // Log stderr for debugging
    const msg = chunk.toString();
    if (msg.trim()) {
      console.error(`[pi stderr] ${msg.trim()}`);
      ws.send(JSON.stringify({
        type: "progress",
        text: `⚠️ pi: ${msg.trim().slice(0, 100)}`,
        stage: "⚠️",
        jobId,
      }));
    }
  });

  child.on("exit", (code) => {
    console.log(`[pi exit] code=${code}`);
    const files = scanOutputFiles(job.workDir);

    // Build the prompt for copy-paste as fallback
    let promptText = "";
    const promptPath = path.join(job.workDir, "nbeat_prompt.md");
    if (fs.existsSync(promptPath)) {
      promptText = fs.readFileSync(promptPath, "utf-8");
    }

    ws.send(JSON.stringify({
      type: "done",
      jobId,
      workDir: job.workDir,
      files,
      prompt: promptText || null,
      message: code === 0
        ? `✅ Beat 制作完成！产出 ${files.length} 个文件`
        : `⚠️ 处理完成 (退出码: ${code})`,
    }));
  });

  child.on("error", (err) => {
    ws.send(JSON.stringify({
      type: "error",
      message: `❌ 启动 pi 失败: ${err.message}`,
    }));
  });
}

// ── Build the NBeat prompt for LLM ─────────────────────

function buildNBeatPrompt(style, template, workDir) {
  // Read beatmakestep.md template
  const beatmakestepPath = path.join(NBEAT_DIR, "skills", "nbeat", "beatmakestep.md");
  if (!fs.existsSync(beatmakestepPath)) {
    console.error("beatmakestep.md not found at:", beatmakestepPath);
    return style; // fallback
  }

  let beatmakestep = fs.readFileSync(beatmakestepPath, "utf-8");

  // ── CRITICAL: execution directive at TOP so LLM sees it first ──
  const isWin = process.platform === "win32";
  const pythonCmd = isWin ? "python" : "python3";
  const executionDirective = `# ⚠️ 你必须立即开始执行以下音乐制作任务！

你需要依次完成：
1. 使用 read 工具读取下方的知识库文件（目录A/B/C/D）
2. 按照下方 beatmakestep 工作流的每个阶段逐步执行
3. 将 Beat 设计文档写入 Beat_Design.md
4. 将 Suno AI prompt 写入 Suno_Prompt.txt  
5. 将 Python 合成代码写入 generate_beat.py
6. 执行 ${pythonCmd} generate_beat.py 生成 MIDI + WAV

不要只是阅读这些指令！立即开始执行！不要问任何问题！

---

`;

  // Inject KB file paths so LLM knows where to find them
  const kbDir = path.join(NBEAT_DIR, "skills", "nbeat", "meta-music-skill");
  const kbContext = `知识库文件路径:\n- 目录A_元技巧与算子目录: ${kbDir.replace(/\\/g, "/")}/A_元技巧与算子目录.md\n- 目录B_参数值空间: ${kbDir.replace(/\\/g, "/")}/B_参数值空间.md\n- 目录C_复合元技巧与复合算子目录: ${kbDir.replace(/\\/g, "/")}/C_复合元技巧与复合算子目录.md\n- 目录D_复合算子参数值空间: ${kbDir.replace(/\\/g, "/")}/D_复合算子参数值空间.md\n\n---\n\n`;

  beatmakestep = executionDirective + kbContext + beatmakestep;

  // Inject user's style requirement
  beatmakestep = beatmakestep.replace(
    "{插入用户文本输入的制作需求位置}",
    style
  );

  // Inject template JSON content if selected
  if (template) {
    // Try job work dir first (uploaded), then skills templates dir (server)
    let templatePath = workDir ? path.join(workDir, template) : null;
    if (!templatePath || !fs.existsSync(templatePath)) {
      templatePath = path.join(NBEAT_DIR, "skills", "nbeat", "templates", template);
    }
    if (fs.existsSync(templatePath)) {
      const templateContent = fs.readFileSync(templatePath, "utf-8");
      beatmakestep = beatmakestep.replace(
        "{插入用户上传的json文件内容位置(可选 如果插入 以此为动机)}",
        `json文件(用户上传)是歌曲的旋律设计 以此为灵感动机展开制作:\n\`\`\`json\n${templateContent}\n\`\`\``
      );
    } else {
      // Template file not found, remove placeholder
      beatmakestep = beatmakestep.replace(
        "{插入用户上传的json文件内容位置(可选 如果插入 以此为动机)}",
        ""
      );
    }
  } else {
    // No template, remove placeholder
    beatmakestep = beatmakestep.replace(
      "{插入用户上传的json文件内容位置(可选 如果插入 以此为动机)}",
      ""
    );
  }

  // Template file not found or no template — placeholder already handled above.

  return beatmakestep;
}

// ── Build the Refine prompt ────────────────────────────

function buildRefinePrompt(feedback, workDir) {
  const isWin = process.platform === "win32";
  const pythonCmd = isWin ? "python" : "python3";
  const kbDir = path.join(NBEAT_DIR, "skills", "nbeat", "meta-music-skill");

  return `# 🔄 修改 Beat

## 反馈
${feedback}

## 上一版文件（必须先读取）
- ${workDir}/Beat_Design.md
- ${workDir}/generate_beat.py

## 知识库（按需参考，涉及元技巧修改时才读）
- ${kbDir.replace(/\\/g, "/")}/A_元技巧与算子目录.md
- ${kbDir.replace(/\\/g, "/")}/B_参数值空间.md
- ${kbDir.replace(/\\/g, "/")}/C_复合元技巧与复合算子目录.md
- ${kbDir.replace(/\\/g, "/")}/D_复合算子参数值空间.md

## 步骤
1. read Beat_Design.md 和 generate_beat.py
2. 如果反馈涉及元技巧调整，read 对应知识库文件
3. 根据反馈修改 Beat_Design.md
4. 修改 generate_beat.py 匹配新设计
5. 执行 ${pythonCmd} generate_beat.py 生成新 WAV

直接开始！
`;
}

// ── WebSocket Server ───────────────────────────────────
const { WebSocketServer } = require("ws");
const wss = new WebSocketServer({ port: WS_PORT });

wss.on("connection", (ws) => {
  console.log(`[ws] Client connected`);
  let currentJobId = null;

  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      return;
    }

    if (msg.type === "generate") {
      const style = (msg.style || "").trim();
      let template = msg.template || null;
      let templateContent = msg.templateContent || null;
      let templateName = msg.templateName || null;

      if (!style) {
        ws.send(JSON.stringify({ type: "error", message: "请填写风格需求" }));
        return;
      }

      currentJobId = newJob(style, template || templateName || null);
      const job = JOBS.get(currentJobId);

      // If user uploaded raw JSON, save it as a temp template file
      if (templateContent) {
        template = templateName || "uploaded_template.json";
        const uploadPath = path.join(job.workDir, template);
        fs.writeFileSync(uploadPath, templateContent, "utf-8");
        console.log(`[job ${currentJobId}] Uploaded template saved: ${template}`);
      }

      // Build and save the prompt
      const promptText = buildNBeatPrompt(style, template, job.workDir);
      const promptPath = path.join(job.workDir, "nbeat_prompt.md");
      fs.writeFileSync(promptPath, promptText, "utf-8");

      console.log(`[job ${currentJobId}] Style: "${style}"${template ? ` Template: ${template}` : ""}`);
      console.log(`[job ${currentJobId}] Work dir: ${job.workDir}`);
      console.log(`[job ${currentJobId}] === FULL PROMPT (${promptText.length} chars) ===`);
      console.log(promptText);
      console.log(`[job ${currentJobId}] === END PROMPT ===`);

      ws.send(JSON.stringify({
        type: "progress",
        text: `📋 Job ${currentJobId} 创建`,
        stage: "📋 准备中...",
        jobId: currentJobId,
      }));

      // Execute: spawn pi with the prompt
      const sessionId = "nbeat_" + path.basename(job.workDir).replace("job_", "");
      job.sessionId = sessionId;
      spawnPiAndStream(currentJobId, promptText, ws, sessionId);

    } else if (msg.type === "refine") {
      const feedback = (msg.feedback || "").trim();
      let workDir = msg.workDir || null;

      if (!feedback) {
        ws.send(JSON.stringify({ type: "error", message: "请输入修改意见" }));
        return;
      }

      // Find the work dir (from message, or from previous job)
      if (!workDir) {
        if (currentJobId && JOBS.has(currentJobId)) {
          workDir = JOBS.get(currentJobId).workDir;
        } else {
          const jobDirs = fs.readdirSync(OUTPUT_DIR).filter(d => d.startsWith("job_"));
          if (jobDirs.length > 0) {
            workDir = path.join(OUTPUT_DIR, jobDirs[jobDirs.length - 1]);
          }
        }
      }

      if (!workDir || !fs.existsSync(path.join(workDir, "Beat_Design.md"))) {
        ws.send(JSON.stringify({ type: "error", message: "未找到上一版文件，请先生成一个 beat" }));
        return;
      }

      const sessionId = "nbeat_" + path.basename(workDir).replace("job_", "");

      // Check if session file still exists (has LLM context from original creation)
      const sessionFile = path.join(
        process.env.HOME || "/tmp", ".pi", "agent", "sessions",
        sessionId + ".jsonl"
      );
      const hasSession = fs.existsSync(sessionFile);
      console.log(`[refine] Session ${sessionId}: ${hasSession ? "found" : "not found"}`);

      currentJobId = newJob(feedback, null);
      const job = JOBS.get(currentJobId);

      // hasSession → light refine (LLM has KB context from history)
      // no session → full workflow (LLM needs KB + beatmakestep)
      const promptText = hasSession
        ? buildRefinePrompt(feedback, workDir)
        : buildNBeatPrompt(
            `基于已有 Beat 修改，先 read 旧文件再按工作流重做：\n- 设计: ${workDir}/Beat_Design.md\n- 代码: ${workDir}/generate_beat.py\n\n用户意见: ${feedback}`,
            null, workDir
          );

      const promptPath = path.join(job.workDir, "nbeat_prompt.md");
      fs.writeFileSync(promptPath, promptText, "utf-8");

      console.log(`[job ${currentJobId}] Refine: "${feedback}"`);
      console.log(`[job ${currentJobId}] Session: ${sessionId}, exists: ${hasSession}`);
      console.log(`[job ${currentJobId}] === REFINE PROMPT (${promptText.length} chars) ===`);
      console.log(promptText);
      console.log(`[job ${currentJobId}] === END REFINE PROMPT ===`);
      console.log(`[job ${currentJobId}] Prev work dir: ${workDir}`);

      ws.send(JSON.stringify({
        type: "progress",
        text: `🔄 基于上一版修改: ${feedback}`,
        stage: "🔄 Refine",
        jobId: currentJobId,
      }));

      spawnPiAndStream(currentJobId, promptText, ws, sessionId);

    } else if (msg.type === "ping") {
      ws.send(JSON.stringify({ type: "pong" }));
    }
  });

  ws.on("close", () => {
    console.log(`[ws] Client disconnected`);
  });
});

// ── Start ──────────────────────────────────────────────
httpServer.listen(UI_PORT, () => {
  const boxWidth = 60;
  const line = "═".repeat(boxWidth);

  console.log(`
╔${line}╗
║  🎧  NBeat Studio — Bridge Server                          ║
║                                                              ║
║  UI:      http://localhost:${UI_PORT}                                  ║
║  WS:      ws://localhost:${WS_PORT}                                     ║
║  Output:  ${OUTPUT_DIR}          ║
║                                                              ║
║  To use with pi coding agent:                                ║
║    1. Open http://localhost:${UI_PORT} in browser                     ║
║    2. Enter style and click Create                            ║
║    3. Copy the generated prompt to pi                        ║
║    4. Or install nbeat-agent: pi install ${NBEAT_DIR}   ║
╚${line}╝
`);

  console.log("📁 Serving UI from:", UI_DIR);
  console.log("📁 Templates at:", path.join(NBEAT_DIR, "skills", "nbeat", "templates"));
  console.log("📁 Output at:", OUTPUT_DIR);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[shutdown]");
  wss.close();
  httpServer.close();
  process.exit(0);
});
