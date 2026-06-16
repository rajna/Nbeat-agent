#!/usr/bin/env node
/**
 * nbeat — NBeat Agent CLI
 * =======================
 * Launches pi coding agent with nbeat-agent extension pre-loaded,
 * or starts the Web UI server.
 *
 * Installation installs both nbeat-agent and @earendil-works/pi-coding-agent.
 *
 * Usage:
 *   nbeat                                    # Interactive beat making (CLI)
 *   nbeat -p "make a dark pop beat, G minor" # One-shot
 *   nbeat -c                                 # Continue last session
 *   nbeat ui                                 # Start Web UI + open browser
 *   nbeat serve                              # Same as ui
 *   nbeat --help                             # Show pi help
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
║  nbeat-agent bundles pi as a dependency, but the binary   ║
║  could not be located.                                    ║
║                                                          ║
║  Quick fix:                                              ║
║    npm install -g @earendil-works/pi-coding-agent         ║
║                                                          ║
║  Or reinstall nbeat-agent:                               ║
║    npm uninstall -g nbeat-agent                           ║
║    npm install -g nbeat-agent                             ║
╚══════════════════════════════════════════════════════════╝
`);
  process.exit(1);
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
