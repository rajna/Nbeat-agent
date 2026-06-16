/**
 * NBeat Studio — Web UI Script
 * 
 * Connects to the NBeat WebSocket Bridge to generate beats.
 * 
 * Features:
 *   - Template selection (JSON melody templates)
 *   - Style input with mode tabs (Beat / Melody / Full Song)
 *   - WebSocket-based generation with live progress
 *   - Copy prompt for pi agent
 *   - Results display with WAV/MIDI download links
 */

(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────
  const WS_URL = `ws://${location.hostname}:8765`;
  const API_BASE = `http://${location.hostname}:${location.port}`;

  // ── State ────────────────────────────────────────────
  const state = {
    ws: null,
    connected: false,
    selectedTemplate: null,
    selectedTemplateName: null,
    currentJobId: null,
    templates: [],
  };

  // ── DOM refs ─────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const promptInput = $('#promptInput');
  const createBtn = $('#createBtn');
  const copyPromptBtn = $('#copyPromptBtn');
  const wsStatus = $('#wsStatus');
  const templateChip = $('#templateChip');
  const templateChipLabel = $('#templateChipLabel');
  const templatePreview = $('#templatePreview');
  const templateModal = $('#templateModal');
  const templateList = $('#templateList');
  const progressPanel = $('#progressPanel');
  const progressStage = $('#progressStage');
  const progressJob = $('#progressJob');
  const progressLog = $('#progressLog');
  const resultsPanel = $('#resultsPanel');
  const resultsFiles = $('#resultsFiles');
  const connectBtn = $('#connectBtn');
  const templatesBtn = $('#templatesBtn');
  const styleChipLabel = $('#styleChipLabel');
  const styleChip = $('#styleChip');

  // ── WebSocket ────────────────────────────────────────

  function connectWS() {
    if (state.ws) {
      state.ws.close();
    }

    setStatus('disconnected', '⚫ Connecting...');
    
    try {
      const ws = new WebSocket(WS_URL);
      
      ws.onopen = () => {
        state.connected = true;
        state.ws = ws;
        setStatus('connected', '🟢 Connected');
        if (connectBtn) connectBtn.textContent = '🔌 Connected';
        console.log('[nbeat] WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleWSMessage(msg);
        } catch (e) {
          console.error('[nbeat] Failed to parse WS message:', e);
        }
      };

      ws.onerror = () => {
        setStatus('error', '🔴 Error');
        console.warn('[nbeat] WebSocket error — bridge may not be running');
      };

      ws.onclose = () => {
        state.connected = false;
        state.ws = null;
        setStatus('disconnected', '⚫ Disconnected');
        if (connectBtn) connectBtn.textContent = '🔌 Connect';
        // Auto-reconnect after 5s
        setTimeout(connectWS, 5000);
      };

    } catch (e) {
      setStatus('error', '🔴 Bridge offline');
      if (connectBtn) connectBtn.textContent = '🔌 Retry';
    }
  }

  function setStatus(status, text) {
    if (wsStatus) {
      wsStatus.textContent = text;
      wsStatus.className = `ws-status ${status}`;
    }
  }

  function handleWSMessage(msg) {
    if (msg.type === 'progress') {
      showProgress(msg.stage || msg.text, msg.jobId);
    } else if (msg.type === 'done') {
      if (msg.prompt) {
        // Show the generated prompt
        appendLog('📋 Prompt generated! Copy and paste into pi agent.');
        appendLog('');
        appendLog('─────────── COPY BELOW ───────────');
        appendLog(msg.prompt);
        appendLog('─────────── COPY ABOVE ───────────');
        appendLog('');
        appendLog('💡 Tip: Install nbeat-agent in pi first: pi install /path/to/nbeat-agent');
        
        // Copy to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(msg.prompt).then(() => {
            appendLog('✅ Prompt copied to clipboard!');
          });
        }
        
        updateProgressStage('📋 Ready to paste');
      }
      if (msg.files) {
        showResults(msg.files);
      }
    } else if (msg.type === 'error') {
      appendLog(`❌ Error: ${msg.message}`);
      updateProgressStage('❌ Error');
    } else if (msg.type === 'pong') {
      // keepalive
    }
  }

  // ── Progress Panel ───────────────────────────────────

  function showProgress(stage, jobId) {
    if (progressPanel) progressPanel.style.display = 'block';
    if (progressLog) progressLog.innerHTML = '';
    updateProgressStage(stage || '🎧 Starting...');
    if (progressJob && jobId) progressJob.textContent = `Job #${jobId}`;
    state.currentJobId = jobId;
  }

  function updateProgressStage(stage) {
    if (progressStage) progressStage.textContent = stage;
  }

  function appendLog(text) {
    if (!progressLog) return;
    if (progressPanel) progressPanel.style.display = 'block';
    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = text;
    progressLog.appendChild(line);
    progressLog.scrollTop = progressLog.scrollHeight;
  }

  // ── Results Panel ────────────────────────────────────

  function showResults(files) {
    if (!resultsPanel || !resultsFiles) return;
    resultsPanel.style.display = 'block';

    let html = '';
    for (const f of files) {
      const typeClass = f.type === 'audio/wav' ? 'wav' : f.type === 'audio/midi' ? 'midi' : 'doc';
      const typeLabel = f.type === 'audio/wav' ? 'WAV' : f.type === 'audio/midi' ? 'MIDI' : 'DOC';
      html += `
        <div class="file-item">
          <span class="fi-name">🎵 ${f.name}</span>
          <span class="fi-type ${typeClass}">${typeLabel}</span>
          <span class="fi-size">${formatSize(f.size)}</span>
          <a href="${f.httpUrl}" download style="color:var(--accent-2);font-size:13px;">⬇</a>
        </div>`;
    }
    resultsFiles.innerHTML = html || '<p>No output files found.</p>';

    // Setup play button
    const wavFile = files.find(f => f.type === 'audio/wav');
    const playBtn = $('#playWavBtn');
    if (playBtn && wavFile) {
      playBtn.onclick = () => {
        const audio = new Audio(wavFile.httpUrl);
        audio.play().catch(e => appendLog(`⚠️ Cannot play audio: ${e.message}`));
      };
      playBtn.style.display = 'inline-flex';
    } else if (playBtn) {
      playBtn.style.display = 'none';
    }

    updateProgressStage('🏁 Complete!');
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ── Templates ────────────────────────────────────────

  async function loadTemplates() {
    try {
      const resp = await fetch(`${API_BASE}/api/templates`);
      if (resp.ok) {
        state.templates = await resp.json();
        renderTemplateList();
        if (templatesBtn) templatesBtn.textContent = `📁 Templates (${state.templates.length})`;
      }
    } catch (e) {
      console.warn('[nbeat] Cannot load templates (bridge offline?)', e.message);
    }
  }

  function renderTemplateList() {
    if (!templateList) return;

    let html = '';
    html += `<div class="template-item ${!state.selectedTemplate ? 'selected' : ''}" data-template="">
      <div class="template-item-name">✨ No template (freestyle)</div>
      <div class="template-item-meta">Generate from description only</div>
    </div>`;

    for (const t of state.templates) {
      html += `<div class="template-item ${state.selectedTemplate === t.name ? 'selected' : ''}" data-template="${t.name}">
        <div class="template-item-name">${t.name}</div>
        <div class="template-item-meta">${t.summary || ''} · ${formatSize(t.size)}</div>
      </div>`;
    }

    templateList.innerHTML = html;

    // Click handlers
    templateList.querySelectorAll('.template-item').forEach((item) => {
      item.addEventListener('click', () => {
        const name = item.dataset.template;
        selectTemplate(name || null);
        if (templateModal) templateModal.style.display = 'none';
      });
    });
  }

  function selectTemplate(name) {
    state.selectedTemplate = name;
    state.selectedTemplateName = name;

    if (name) {
      if (templateChipLabel) templateChipLabel.textContent = `Template: ${name}`;
      if (templatePreview) {
        const t = state.templates.find(t => t.name === name);
        templatePreview.style.display = 'block';
        templatePreview.innerHTML = `
          <span class="tp-name">📄 ${name}</span>
          <span class="tp-remove" id="removeTemplate">✕</span>
          <br><span style="color:var(--text-3)">${t?.summary || 'Loaded'}</span>
        `;
        setTimeout(() => {
          const removeBtn = $('#removeTemplate');
          if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              selectTemplate(null);
            });
          }
        }, 100);
      }
    } else {
      if (templateChipLabel) templateChipLabel.textContent = 'Template: None';
      if (templatePreview) templatePreview.style.display = 'none';
      state.selectedTemplate = null;
      state.selectedTemplateName = null;
    }

    renderTemplateList();
  }

  // ── Generate ─────────────────────────────────────────

  async function doGenerate() {
    const style = (promptInput?.value || '').trim();
    if (!style) {
      promptInput?.focus();
      return;
    }

    // Read template content
    let templateContent = null;
    if (state.selectedTemplate) {
      try {
        const resp = await fetch(`/templates/${state.selectedTemplate}`);
        if (!resp.ok) {
          // Try skills path
          const resp2 = await fetch(`/skills/nbeat/templates/${state.selectedTemplate}`);
          if (resp2.ok) templateContent = await resp2.text();
        } else {
          templateContent = await resp.text();
        }
      } catch {
        // Template file not fetchable from UI server, will be loaded by extension
        appendLog('ℹ️ Template will be loaded by the NBeat extension');
      }
    }

    // Reset panels
    if (progressPanel) progressPanel.style.display = 'block';
    if (resultsPanel) resultsPanel.style.display = 'none';
    if (progressLog) progressLog.innerHTML = '';

    // Build the generation request
    if (state.connected && state.ws) {
      // Send via WebSocket
      state.ws.send(JSON.stringify({
        type: 'generate',
        style,
        template: templateContent || state.selectedTemplate,
      }));
      showProgress('🚀 Sending to agent...', null);
    } else {
      // Offline mode: build prompt locally
      await generateOffline(style, templateContent);
    }
  }

  async function generateOffline(style, templateContent) {
    showProgress('📋 Building prompt (offline mode)', null);

    let prompt = `/skill:nbeat\n\n`;
    prompt += `请使用 nbeat_generate 工具创建一个完整的 beat。\n\n`;
    prompt += `## 风格需求\n${style}\n`;

    if (state.selectedTemplate) {
      prompt += `\n## 旋律动机模板\n`;
      prompt += `模板文件: ${state.selectedTemplate}\n`;
      if (templateContent) {
        try {
          JSON.parse(templateContent);
          prompt += `\`\`\`json\n${templateContent.slice(0, 2000)}${templateContent.length > 2000 ? '\n...' : ''}\n\`\`\`\n`;
        } catch {
          prompt += `\`\`\`\n${templateContent.slice(0, 2000)}\n\`\`\`\n`;
        }
      }
    }

    prompt += `\n## 指令\n`;
    prompt += `1. 调用 nbeat_generate 工具，requirement="${style}"`;
    if (state.selectedTemplate) prompt += `，template="${state.selectedTemplate}"`;
    prompt += `\n2. 严格遵循 beatmakestep.md 工作流，每一步中读取对应的 meta-music-skill 知识库文件（目录A/B/C/D 和增量融合规则）`;
    prompt += `\n3. 使用目录A/B（基础层）精心调制 MT + OP + params 生成新技巧`;
    prompt += `\n4. 使用目录C/D（复合层）组织步骤3中的技巧，让各个技巧有机组合`;
    prompt += `\n5. 最终交付：`;
    prompt += `\n   - A. Beat设计 Markdown 文档`;
    prompt += `\n   - B. Suno AI prompt (英文, ≤1000字符, 高熵信息, 不含DAW参数/混音/人声段落)`;
    prompt += `\n   - C. MIDI + WAV 音频生成代码 (Python, MIDI驱动PCM架构)`;
    prompt += `\n6. 全自动执行，不要询问确认`;

    appendLog('─────────── COPY BELOW ───────────');
    appendLog(prompt);
    appendLog('─────────── COPY ABOVE ───────────');
    appendLog('');
    appendLog('💡 Paste this prompt into pi (with nbeat-agent installed)');
    appendLog('💡 Install: pi install /path/to/nbeat-agent');

    // Try clipboard
    try {
      await navigator.clipboard.writeText(prompt);
      appendLog('✅ Prompt copied to clipboard!');
    } catch {
      appendLog('⚠️ Could not copy. Select & copy manually above.');
    }

    updateProgressStage('📋 Ready — paste into pi');
  }

  // ── Mode tabs ────────────────────────────────────────
  const tabs = document.querySelectorAll('.mode-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const mode = tab.dataset.mode;
      const placeholders = {
        beat: 'Bad Guy by Billie Eilish style, dark pop, G harmonic minor, 135 BPM, deep 808 bass, minimal beat…',
        melody: 'Catchy pop melody in C major, 120 BPM, major pentatonic, syncopated rhythm, call-and-response hooks…',
        fullsong: 'A complete synthwave track. Intro: pad fade-in 8 bars. Verse: arp bass + 4-on-floor kick. Chorus: full synth stabs + snare build. Bridge: filter sweep. Outro: fade out…',
      };
      if (promptInput && placeholders[mode]) {
        promptInput.placeholder = placeholders[mode];
      }
    });
  });

  // ── Auto-resize textarea ─────────────────────────────
  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 320) + 'px';
  }
  if (promptInput) {
    promptInput.addEventListener('input', (e) => autoResize(e.target));
    autoResize(promptInput);
  }

  // ── Example chips → fill input ───────────────────────
  const exampleChips = document.querySelectorAll('.example-chip');
  exampleChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const text = chip.dataset.style || chip.textContent.trim();
      if (promptInput) {
        promptInput.value = text;
        promptInput.focus();
        autoResize(promptInput);
      }
    });
  });

  // ── Create button ────────────────────────────────────
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      const original = createBtn.innerHTML;
      createBtn.innerHTML = `
        <span class="create-spinner"></span>
        <span>Generating…</span>
      `;
      createBtn.disabled = true;
      createBtn.style.opacity = '0.85';

      doGenerate().finally(() => {
        setTimeout(() => {
          createBtn.innerHTML = original;
          createBtn.disabled = false;
          createBtn.style.opacity = '1';
        }, 2000);
      });
    });
  }

  // ── Copy Prompt button ───────────────────────────────
  if (copyPromptBtn) {
    copyPromptBtn.addEventListener('click', () => {
      const style = (promptInput?.value || '').trim();
      if (!style) return;
      generateOffline(style, null);
    });
  }

  // ── Template chip → open modal ───────────────────────
  if (templateChip) {
    templateChip.addEventListener('click', () => {
      if (templateModal) {
        templateModal.style.display = 'flex';
      }
    });
  }

  // ── Modal close ──────────────────────────────────────
  const closeModal = $('#closeTemplateModal');
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      if (templateModal) templateModal.style.display = 'none';
    });
  }
  if (templateModal) {
    templateModal.addEventListener('click', (e) => {
      if (e.target === templateModal) templateModal.style.display = 'none';
    });
  }

  // ── Style chip click → cycle styles ──────────────────
  const styles = ['Dark Pop', 'Lo-fi Hip Hop', 'Trap', 'Synthwave', 'R&B Soul', 'Cinematic', 'Folk', 'EDM'];
  if (styleChip) {
    styleChip.addEventListener('click', () => {
      const current = styleChipLabel?.textContent?.replace('Style: ', '') || '';
      const idx = styles.indexOf(current);
      const next = styles[(idx + 1) % styles.length];
      if (styleChipLabel) styleChipLabel.textContent = `Style: ${next}`;
      if (promptInput) {
        promptInput.placeholder = `${next} style beat, ...`;
      }
    });
  }

  // ── Connect button ───────────────────────────────────
  if (connectBtn) {
    connectBtn.addEventListener('click', connectWS);
  }

  // ── Templates button ─────────────────────────────────
  if (templatesBtn) {
    templatesBtn.addEventListener('click', () => {
      if (templateModal) {
        renderTemplateList();
        templateModal.style.display = 'flex';
      }
    });
  }

  // ── Keyboard shortcut: Ctrl+Enter to generate ────────
  if (promptInput) {
    promptInput.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        createBtn?.click();
      }
    });
  }

  // ── Init ──────────────────────────────────────────────
  function init() {
    connectWS();
    loadTemplates();

    // Add spinner CSS
    const spinnerCSS = `
      .create-spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(0, 0, 0, 0.3);
        border-top-color: #000;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    const styleTag = document.createElement('style');
    styleTag.textContent = spinnerCSS;
    document.head.appendChild(styleTag);

    console.log('🎧 NBeat Studio UI ready');
    console.log('   Bridge WS:', WS_URL);
    console.log('   API:', API_BASE);
    console.log('   Ctrl+Enter to generate');
  }

  init();
})();
