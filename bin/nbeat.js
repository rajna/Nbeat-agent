#!/usr/bin/env node
/**
 * nbeat — NBeat Agent CLI
 * =======================
 * Launches pi coding agent with nbeat-agent extension pre-loaded,
 * or starts the Web UI server.
 *
 * Usage:
 *   nbeat                                    # Interactive beat making (CLI)
 *   nbeat -p "make a dark pop beat, G minor" # One-shot
 *   nbeat -c                                 # Continue last session
 *   nbeat ui                                 # Start Web UI + open browser
 *   nbeat setup                              # Configure LLM API key
 *   nbeat help                               # Show help
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// ── Paths ──────────────────────────────────────────────
const NBEAT_ROOT = path.resolve(__dirname, "..");
const NBEAT_EXT  = path.join(NBEAT_ROOT, "src", "index.ts");

// ── Find pi binary ─────────────────────────────────────
function findPi() {
  const isWin  = process.platform === "win32";
  const piCmd  = isWin ? "pi.cmd" : "pi";

  // 1. Prefer BUNDLED pi (guaranteed compatible version)
  const bundled = path.join(NBEAT_ROOT, "node_modules", ".bin", piCmd);
  try {
    fs.accessSync(bundled, fs.constants.X_OK);
    return bundled;
  } catch {}

  // 2. Try npm root -g → nbeat-agent/node_modules/.bin (alternative global layout)
  try {
    const { execSync } = require("child_process");
    const npmRoot = execSync("npm root -g", { encoding: "utf-8", timeout: 5000 }).trim();
    if (npmRoot) {
      const altBundled = path.join(npmRoot, "nbeat-agent", "node_modules", ".bin", piCmd);
      try {
        fs.accessSync(altBundled, fs.constants.X_OK);
        return altBundled;
      } catch {}
    }
  } catch {}

  // 3. Try pnpm global layout
  try {
    const { execSync } = require("child_process");
    const pnpmRoot = execSync("pnpm root -g 2>/dev/null", { encoding: "utf-8", timeout: 5000 }).trim();
    if (pnpmRoot) {
      const pnpmBundled = path.join(pnpmRoot, "nbeat-agent", "node_modules", ".bin", piCmd);
      try {
        fs.accessSync(pnpmBundled, fs.constants.X_OK);
        return pnpmBundled;
      } catch {}
    }
  } catch {}

  // 4. Fallback: check PATH for globally installed pi (separate install)
  if (process.env.PATH) {
    for (const dir of process.env.PATH.split(path.delimiter)) {
      const candidate = path.join(dir, piCmd);
      try {
        fs.accessSync(candidate, fs.constants.X_OK);
        return candidate;
      } catch {}
    }
  }

  return null;
}

// ── Check LLM API key ──────────────────────────────────

function hasApiKey() {
  const keyVars = [
    "ANTHROPIC_API_KEY", "ANTHROPIC_OAUTH_TOKEN",
    "OPENAI_API_KEY", "GEMINI_API_KEY", "DEEPSEEK_API_KEY",
    "OPENROUTER_API_KEY", "GROQ_API_KEY",
  ];
  for (const v of keyVars) {
    if (process.env[v]) return true;
  }
  // Check auth.json for subscription login
  const authFile = path.join(
    process.env.HOME || "/tmp",
    ".pi", "agent", "auth.json"
  );
  if (fs.existsSync(authFile)) {
    try {
      const auth = JSON.parse(fs.readFileSync(authFile, "utf-8"));
      if (auth.active_provider || Object.keys(auth).length > 0) return true;
    } catch {}
  }
  return false;
}

function showSetupGuide() {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`
╔══════════════════════════════════════════════════════════╗
║  🔑  NBeat Setup — 配置 LLM API Key                      ║
╚══════════════════════════════════════════════════════════╝

  NBeat uses pi coding agent under the hood.
  Supported: Anthropic, OpenAI, Gemini, DeepSeek, etc.

  1. Environment variable (temporary, per-session)
  2. Save to ~/.pi/agent/auth.json (persistent)
  3. Subscription login (Claude Pro / ChatGPT / Copilot)
  4. Show instructions & exit
`);

  rl.question("\n  Choose [1-4]: ", (answer) => {
    const choice = answer.trim();

    if (choice === "1") {
      rl.question("  Provider [anthropic]: ", (provider) => {
        provider = provider.trim() || "anthropic";
        rl.question("  API Key: ", (key) => {
          key = key.trim();
          if (!key) {
            console.log("  ❌ No key entered.\n");
            rl.close();
            return;
          }
          const varMap = { anthropic: "ANTHROPIC_API_KEY", openai: "OPENAI_API_KEY", gemini: "GEMINI_API_KEY", deepseek: "DEEPSEEK_API_KEY" };
          const envVar = varMap[provider.toLowerCase()] || `${provider.toUpperCase()}_API_KEY`;
          console.log(`\n  ✅ Run this command (or add to ~/.zshrc / ~/.bashrc):`);
          console.log(`  export ${envVar}=${key}\n`);
          console.log(`  Then: nbeat\n`);
          rl.close();
        });
      });

    } else if (choice === "2") {
      rl.question("  Provider [anthropic]: ", (provider) => {
        provider = provider.trim() || "anthropic";
        rl.question("  API Key: ", (key) => {
          key = key.trim();
          if (!key) {
            console.log("  ❌ No key entered.\n");
            rl.close();
            return;
          }
          const authDir = path.join(process.env.HOME || "/tmp", ".pi", "agent");
          fs.mkdirSync(authDir, { recursive: true });
          const authFile = path.join(authDir, "auth.json");
          const auth = { active_provider: provider, api_key: key };
          fs.writeFileSync(authFile, JSON.stringify(auth, null, 2), "utf-8");
          fs.chmodSync(authFile, 0o600);
          console.log(`\n  ✅ Saved to ${authFile}`);
          console.log(`  Run: nbeat\n`);
          rl.close();
        });
      });

    } else if (choice === "3") {
      console.log(`
  1. Run: nbeat
  2. Inside pi, type: /login
  3. Select your subscription (Claude Pro, ChatGPT, Copilot...)
  `);
      rl.close();

    } else {
      console.log(`
  ┌─────────────────────────────────────────────────┐
  │  Option 1: API Key (recommended, pay-as-you-go) │
  └─────────────────────────────────────────────────┘

    export ANTHROPIC_API_KEY=sk-ant-...
    nbeat

  ┌──────────────────────────────────────────┐
  │  Option 2: Save to auth.json (persistent)│
  └──────────────────────────────────────────┘

    nbeat setup → choose 2

  ┌──────────────────────────────────────────┐
  │  Option 3: Subscription Login            │
  └──────────────────────────────────────────┘

    nbeat → /login → Claude Pro / ChatGPT

  After setup, run:  nbeat ui   or   nbeat
`);
      rl.close();
    }
  });
}

// ── Show nbeat-specific help ───────────────────────────

function showHelp() {
  console.log(`
🎧  nbeat — NBeat Music Agent

   Professional AI beat maker powered by meta-music techniques.
   Uses pi coding agent under the hood.

Usage:
   nbeat                        Interactive beat making (CLI)
   nbeat <pi-options>           Forward options to pi
   nbeat ui                     Launch Web UI + open browser
   nbeat ui --port 3000         Web UI on custom port
   nbeat setup                  Configure LLM API key
   nbeat help                   Show this help

Modes:
   CLI   — Terminal-based beat making with pi agent
   Web   — Visual UI at http://localhost:8080
            Type style → click Create → get beat design + MIDI + WAV

Quick examples:
   nbeat -p "dark pop, G minor, 135 BPM"
   nbeat -c
   nbeat ui

Requirements:
   Node.js 18+  ·  Python 3.8+  ·  LLM API key or /login
   macOS: afplay  ·  Linux: mpv/mpg123 for audio playback

Docs: https://github.com/yourname/nbeat-agent
`);
}

// ── Launch Web UI ──────────────────────────────────────

function launchUI(extraArgs) {
  const bridgePath = path.join(NBEAT_ROOT, "ui", "bridge.js");

  if (!fs.existsSync(bridgePath)) {
    console.error(`❌ Bridge server not found: ${bridgePath}`);
    console.error("   Make sure nbeat-agent is installed correctly.");
    process.exit(1);
  }

  // Determine port from args or env, default 8080
  let uiPort = 8080;
  for (let i = 0; i < extraArgs.length; i++) {
    if (extraArgs[i] === "--port" && extraArgs[i + 1]) {
      uiPort = parseInt(extraArgs[i + 1], 10) || 8080;
      break;
    }
  }
  process.env.NBEAT_UI_PORT = String(uiPort);

  console.log(`
╔══════════════════════════════════════════════════════════╗
║  🎧  NBeat Studio — Web UI                               ║
║                                                          ║
║  Starting server on http://localhost:${uiPort}                   ║
║  Press Ctrl+C to stop                                     ║
╚══════════════════════════════════════════════════════════╝
`);

  // Spawn the bridge server
  const bridge = spawn(
    process.execPath,  // node
    [bridgePath, "--ui-port", String(uiPort)],
    {
      stdio: "inherit",
      shell: false,
      env: { ...process.env, NBEAT_UI_PORT: String(uiPort) },
    }
  );

  // Open browser after a short delay
  setTimeout(() => {
    const url = `http://localhost:${uiPort}`;
    const platform = process.platform;
    let openCmd;
    if (platform === "darwin") {
      openCmd = spawn("open", [url]);
    } else if (platform === "win32") {
      openCmd = spawn("start", ["", url], { shell: true });
    } else {
      openCmd = spawn("xdg-open", [url]);
    }
    openCmd.on("error", () => {
      // Browser open failed — user can open manually
      console.log(`  🌐 Open in browser: ${url}`);
    });
  }, 1500);

  bridge.on("exit", (code) => {
    process.exit(code ?? 0);
  });

  process.on("SIGINT",  () => bridge.kill("SIGINT"));
  process.on("SIGTERM", () => bridge.kill("SIGTERM"));
  process.on("SIGHUP",  () => bridge.kill("SIGHUP"));
}

// ── Main ───────────────────────────────────────────────

// Handle subcommands first
const subcommand = process.argv[2];

if (subcommand === "setup") {
  showSetupGuide();
  return;
}

if (subcommand === "help" || subcommand === "--help" || subcommand === "-h") {
  showHelp();
  return;
}

if (subcommand === "ui" || subcommand === "serve" || subcommand === "--ui" || subcommand === "web") {
  launchUI(process.argv.slice(3));
  return;
}

const piBin = findPi();

if (!piBin) {
  console.error(`
╔══════════════════════════════════════════════════════════╗
║  ❌  pi coding agent not found                            ║
║                                                          ║
║  Run: npm install -g @earendil-works/pi-coding-agent      ║
╚══════════════════════════════════════════════════════════╝
`);
  process.exit(1);
}

// ── Check API key before launching pi ────────────────
if (!hasApiKey()) {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  ⚠️  未检测到 API Key                                    ║
║                                                          ║
║  nbeat setup   → 交互式配置                               ║
║  /login        → 订阅登录 (启动后输入)                     ║
║                                                          ║
║  继续启动 nbeat (可进入后 /login)...                       ║
╚══════════════════════════════════════════════════════════╝
`);
  // Don't exit — let user do /login inside pi
}

// ── Check extension exists ─────────────────────────────
if (!fs.existsSync(NBEAT_EXT)) {
  console.error(`❌ Extension not found: ${NBEAT_EXT}`);
  process.exit(1);
}

// ── Launch pi with nbeat-agent extension ───────────────
const args = ["-e", NBEAT_EXT, ...process.argv.slice(2)];

const child = spawn(piBin, args, {
  stdio: "inherit",
  shell: false,
  env: { ...process.env },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

// Forward signals
process.on("SIGINT",  () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
process.on("SIGHUP",  () => child.kill("SIGHUP"));
