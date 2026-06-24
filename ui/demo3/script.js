// Mavis Studio — workspace interactions

(function () {
  'use strict';

  // ============================================
  // Empty song data (only generated beats appear)
  // ============================================

  const songs = [];

  // ============================================
  // Thumbnail SVG generator
  // ============================================

  function thumbSVG(type, grad) {
    const [a, b, c] = grad;
    const bg = `<defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${a}"/>
        <stop offset="0.5" stop-color="${b}"/>
        <stop offset="1" stop-color="${c}"/>
      </linearGradient>
      <radialGradient id="rg" cx="0.5" cy="0.4" r="0.6">
        <stop offset="0" stop-color="rgba(255,255,255,0.3)"/>
        <stop offset="1" stop-color="rgba(0,0,0,0)"/>
      </radialGradient>
    </defs>
    <rect width="64" height="64" fill="url(#g)"/>`;

    let art = '';
    switch (type) {
      case 'lightning':
        art = `<path d="M30 4 L18 32 L28 32 L24 60 L46 28 L36 28 L40 4 Z" fill="rgba(255,255,255,0.85)" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>`;
        break;
      case 'waveform':
        const bars = [];
        for (let i = 0; i < 14; i++) {
          const h = Math.max(2, 8 + Math.sin(i * 0.7) * 14 + Math.random() * 8);
          bars.push(`<rect x="${6 + i * 4}" y="${32 - h / 2}" width="2.5" height="${h}" rx="1" fill="rgba(255,255,255,0.8)"/>`);
        }
        art = bars.join('');
        break;
      case 'spiral':
        art = `<path d="M32 32 m-20 0 a20 20 0 1 1 40 0 a16 16 0 1 1 -32 0 a12 12 0 1 1 24 0 a8 8 0 1 1 -16 0 a4 4 0 1 1 8 0" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.2"/>`;
        break;
      case 'grid':
        let grid = '';
        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < 6; j++) {
            const op = 0.15 + Math.random() * 0.5;
            grid += `<rect x="${8 + i * 9}" y="${8 + j * 9}" width="6" height="6" fill="rgba(255,255,255,${op})" rx="1"/>`;
          }
        }
        art = grid;
        break;
      case 'dots':
        let dots = '';
        for (let i = 0; i < 12; i++) {
          for (let j = 0; j < 12; j++) {
            const cx = 6 + i * 5;
            const cy = 6 + j * 5;
            const r = 0.5 + Math.random() * 1.5;
            const op = 0.3 + Math.random() * 0.5;
            dots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(255,255,255,${op})"/>`;
          }
        }
        art = dots;
        break;
      case 'sphere':
        art = `<circle cx="32" cy="32" r="18" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
               <circle cx="32" cy="32" r="12" fill="rgba(255,255,255,0.2)"/>
               <circle cx="32" cy="32" r="6" fill="rgba(255,255,255,0.4)"/>`;
        break;
      case 'stripes':
        art = '';
        for (let i = 0; i < 8; i++) {
          art += `<rect x="${-10 + i * 12}" y="0" width="6" height="64" fill="rgba(255,255,255,${0.08 + (i % 3) * 0.06})" transform="rotate(20 32 32)"/>`;
        }
        break;
      default:
        art = '';
    }

    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${bg}${art}<rect width="64" height="64" fill="url(#rg)"/></svg>`;
  }

  // ============================================
  // Render song list
  // ============================================

  const list = document.getElementById('songList');

  // ── Pagination State ──────────────────────────
  const PAGE_SIZE = 10;
  let currentPage = 1;
  let currentData = []; // all (possibly filtered) songs

  function updatePager() {
    const totalPages = Math.max(1, Math.ceil(currentData.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    const numEl = document.querySelector('.pager-num');
    if (numEl) numEl.textContent = currentPage;
    const prevBtn = document.querySelector('.pager-btn:first-child');
    const nextBtn = document.querySelector('.pager-btn:last-child');
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
  }

  function goToPage(page) {
    const totalPages = Math.max(1, Math.ceil(currentData.length / PAGE_SIZE));
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;
    renderSongs(currentData, currentPage);
    updatePager();
  }

  function renderSongs(data, page) {
    if (!list) return;
    if (data.length === 0) {
      list.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-3);font-size:13px">
        🎧 No beats yet. Create your first beat!
      </div>`;
      updatePager();
      return;
    }

    const thumbTypes = ['lightning', 'waveform', 'spiral', 'grid', 'dots', 'sphere', 'stripes'];

    // Paginate
    const p = page || 1;
    const start = (p - 1) * PAGE_SIZE;
    const paged = data.slice(start, start + PAGE_SIZE);

    list.innerHTML = paged
      .map((s, i) => {
        const actualIdx = start + i;
        const thumb = s.thumb || thumbTypes[Math.floor(Math.random() * thumbTypes.length)];
        const grad = s.gradient || [
          '#' + Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0'),
          '#' + Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0'),
          '#' + Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0'),
        ];
        const badgeClass = s.badgeType === 'preview' ? 'title-badge preview' : 'title-badge v4';
        const right = s.workDir
          ? `<button class="remix-btn refine-trigger" data-idx="${actualIdx}">
               <svg viewBox="0 0 24 24" width="13" height="13" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>
               Refine
             </button>`
          : `<span style="font-size:11px;color:var(--text-3)">processing...</span>`;
        return `
          <div class="song-row" data-idx="${actualIdx}">
            <div class="song-thumb" data-idx="${actualIdx}">
              ${thumbSVG(thumb, grad)}
              <div class="play-overlay">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <span class="thumb-time" style="display:none">${s.duration || '--:--'}</span>
            </div>
            <div class="song-row-main">
              <div class="song-row-title">
                <span>${s.title}</span>
                <span class="${badgeClass}">${s.badge || '🎧 nbeat'}</span>
              </div>
              <div class="song-row-desc">${s.desc || ''}</div>
              <div class="song-row-actions">
                <span class="copy-suno-btn" data-idx="${actualIdx}" title="Copy Suno prompt">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M16 12h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                ${s.wavUrl ? `<a href="${s.wavUrl}" download class="action-btn" title="Download WAV">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>` : ''}
              </div>
            </div>
            <div class="song-row-right">
              ${right}
            </div>
          </div>
        `;
      })
      .join('');

    // Bind thumb click → toggle play/pause
    list.querySelectorAll('.song-thumb').forEach((thumb) => {
      thumb.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = thumb.dataset.idx;
        const song = songs[idx];
        if (!song || !song.wavUrl) return;

        if (currentAudio && currentAudio.src.includes(song.wavUrl.split('/').pop())) {
          // Same song: toggle play/pause
          if (playing) {
            currentAudio.pause();
            playing = false;
            stopPlayback();
          } else {
            currentAudio.play();
            playing = true;
          }
          updatePlayIcon();
        } else {
          // Different song: play it
          playWavInPlayer({ httpUrl: song.wavUrl, name: song.title });
        }
      });
    });

    // Bind desc click → expand/collapse Suno prompt
    list.querySelectorAll('.song-row-desc').forEach((desc) => {
      desc.addEventListener('click', (e) => {
        e.stopPropagation();
        desc.classList.toggle('expanded');
      });
    });

    // Bind copy-suno button
    list.querySelectorAll('.copy-suno-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = btn.dataset.idx;
        const song = songs[idx];
        if (!song) return;
        const text = song.desc?.replace(/\s*\(\d+ chars\)$/, '') || '';
        if (text && navigator.clipboard) {
          navigator.clipboard.writeText(text).then(() => {
            btn.textContent = '✅';
            setTimeout(() => btn.textContent = '📋', 1000);
          });
        }
      });
    });

    // Bind Refine button → select beat + show refine panel
    list.querySelectorAll('.refine-trigger').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = btn.dataset.idx;
        const song = songs[idx];
        if (!song || !song.workDir) return;
        activeWorkDir = song.workDir;
        list.querySelectorAll('.song-row').forEach(r => r.classList.remove('selected'));
        btn.closest('.song-row')?.classList.add('selected');
        const refinePanel = document.getElementById('refinePanel');
        if (refinePanel) refinePanel.style.display = 'block';
        showNBeatProgress(`📌 已选中: ${song.title} — 输入修改意见后点 Refine`);
      });
    });

    // Bind row click → select for refinement
    list.querySelectorAll('.song-row').forEach((row) => {
      row.addEventListener('click', () => {
        const idx = row.dataset.idx;
        const song = songs[idx];
        if (song && song.workDir) {
          activeWorkDir = song.workDir;
          // Highlight selected row
          list.querySelectorAll('.song-row').forEach(r => r.classList.remove('selected'));
          row.classList.add('selected');
          // Show refine panel
          const refinePanel = document.getElementById('refinePanel');
          if (refinePanel) refinePanel.style.display = 'block';
          showNBeatProgress(`📌 Selected: ${song.title}`);
        }
      });
    });
  }

  // ============================================
  // Mode toggle (Simple / Advanced)
  // ============================================

  document.querySelectorAll('.mode-opt').forEach((opt) => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.mode-opt').forEach((o) => o.classList.remove('active'));
      opt.classList.add('active');
    });
  });

  // ============================================
  // Lyrics tabs
  // ============================================

  const lyricsInput = document.querySelector('.lyrics-input');
  document.querySelectorAll('.lyrics-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.lyrics-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const placeholders = {
        Write: '[Verse]\nThis is where you write your rhymes\nor give our Magic Wand a try ↙\nSection [tags] can help instruct your\nsongs to feel more tight and structured',
        Prompt: 'A lonely highway at 3AM, neon lights fading in the rear-view mirror, a love letter that was never sent…',
        Instrumental: 'Instrumental only. 90 BPM. Warm analog synth pads, punchy lo-fi drum groove, walking bass line.',
      };
      if (lyricsInput && placeholders[tab.textContent]) {
        lyricsInput.placeholder = placeholders[tab.textContent];
        if (tab.textContent === 'Instrumental') lyricsInput.value = '';
      }
    });
  });

  // ============================================
  // Section collapse
  // ============================================

  document.querySelectorAll('.section-toggle').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const body = toggle.closest('.panel-section').querySelector('.lyrics-body, .styles-body');
      const caret = toggle.querySelector('.caret');
      if (!body) return;
      const collapsed = body.style.display === 'none';
      body.style.display = collapsed ? '' : 'none';
      if (caret) caret.style.transform = collapsed ? '' : 'rotate(-90deg)';
    });
  });

  // ============================================
  // NBeat: Create button → generate prompt
  // ============================================

  const createBeatBtn = document.getElementById('createBeatBtn');
  if (createBeatBtn) {
    const stylesInput = document.querySelector('.styles-input');
    const stylesVal = () => stylesInput ? stylesInput.value.trim() : '';

    function refreshCreate() {
      if (stylesVal()) {
        createBeatBtn.classList.add('ready');
        createBeatBtn.style.color = '#000';
      } else {
        createBeatBtn.classList.remove('ready');
        createBeatBtn.style.color = '';
      }
    }
    refreshCreate();
    if (stylesInput) stylesInput.addEventListener('input', refreshCreate);
    if (lyricsInput) lyricsInput.addEventListener('input', refreshCreate);

    createBeatBtn.addEventListener('click', () => {
      generateNBeatPrompt();
    });
  }

  // ============================================
  // NBeat: WebSocket connection to bridge
  // ============================================

  const WS_URL = `ws://${location.hostname}:8765`;
  const API_BASE = `http://${location.hostname}:${location.port}`;
  let nbeatWs = null;
  let nbeatConnected = false;

  function connectNBeatWS() {
    try {
      const ws = new WebSocket(WS_URL);
      ws.onopen = () => {
        nbeatConnected = true;
        nbeatWs = ws;
        updateNBeatStatus('🟢 Connected');
        console.log('[nbeat] WebSocket connected');
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'progress') {
            if (msg.stream === 'text') {
              appendLogText(msg.text);
            } else {
              showNBeatProgress(msg.stage || msg.text);
            }
          }
          else if (msg.type === 'done') showNBeatResults(msg);
          else if (msg.type === 'error') showNBeatProgress(`❌ ${msg.message}`);
        } catch (e) { console.error('[nbeat] Parse error:', e); }
      };
      ws.onerror = () => updateNBeatStatus('⚫ Offline');
      ws.onclose = () => {
        nbeatConnected = false;
        nbeatWs = null;
        updateNBeatStatus('⚫ Offline');
        setTimeout(connectNBeatWS, 5000);
      };
    } catch (e) {
      updateNBeatStatus('⚫ Offline');
    }
  }

  function updateNBeatStatus(text) {
    const el = document.getElementById('nbeatStatus');
    if (el) el.innerHTML = `<span>${text}</span>`;
  }

  // ============================================
  // NBeat: Templates
  // ============================================

  let templates = [];
  let selectedTemplate = null;

  async function loadTemplates() {
    try {
      const resp = await fetch(`${API_BASE}/api/templates`);
      if (resp.ok) {
        templates = await resp.json();
        console.log(`[nbeat] Loaded ${templates.length} templates`);
      }
    } catch (e) {
      console.warn('[nbeat] Cannot load templates');
    }
  }

  function showTemplateModal() {
    const modal = document.getElementById('templateModal');
    const list = document.getElementById('templateList');
    if (!modal || !list) return;

    let html = `<div class="template-item ${!selectedTemplate ? 'selected' : ''}" data-template="">
      <div class="template-item-name">✨ No template (freestyle)</div>
      <div class="template-item-meta">Generate from description only</div>
    </div>`;

    for (const t of templates) {
      html += `<div class="template-item ${selectedTemplate === t.name ? 'selected' : ''}" data-template="${t.name}">
        <div class="template-item-name">📄 ${t.name}</div>
        <div class="template-item-meta">${t.summary || ''}</div>
      </div>`;
    }

    list.innerHTML = html;
    list.querySelectorAll('.template-item').forEach(item => {
      item.addEventListener('click', () => {
        selectTemplate(item.dataset.template || null);
        modal.style.display = 'none';
      });
    });

    modal.style.display = 'flex';
  }

  function selectTemplate(name) {
    selectedTemplate = name || null;
    uploadedTemplateContent = null;
    uploadedTemplateName = null;
    jsonFileInput.value = '';
    const tag = document.getElementById('templateTag');
    if (tag) {
      tag.style.display = name ? 'inline-block' : 'none';
      tag.textContent = name || '';
      tag.style.background = 'rgba(77, 141, 255, 0.15)';
      tag.style.color = 'var(--accent)';
    }
  }

  const templateBtn = document.getElementById('templateBtn');
  if (templateBtn) templateBtn.addEventListener('click', showTemplateModal);

  // Upload JSON file
  const uploadJsonBtn = document.getElementById('uploadJsonBtn');
  const jsonFileInput = document.getElementById('jsonFileInput');
  let uploadedTemplateContent = null;
  let uploadedTemplateName = null;

  if (uploadJsonBtn && jsonFileInput) {
    uploadJsonBtn.addEventListener('click', () => jsonFileInput.click());
    jsonFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target.result;
        uploadedTemplateContent = content;
        uploadedTemplateName = file.name;
        selectedTemplate = null; // deselect server template

        const tag = document.getElementById('templateTag');
        if (tag) {
          tag.style.display = 'inline-block';
          tag.textContent = `📤 ${file.name}`;
          tag.style.background = 'rgba(255, 158, 60, 0.15)';
          tag.style.color = '#ff9e3c';
        }
        showNBeatProgress(`📤 上传模板: ${file.name}`);
      };
      reader.readAsText(file);
    });
  }

  const closeTemplateModal = document.getElementById('closeTemplateModal');
  if (closeTemplateModal) {
    closeTemplateModal.addEventListener('click', () => {
      document.getElementById('templateModal').style.display = 'none';
    });
  }
  document.getElementById('templateModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
  });

  // ============================================
  // NBeat: Results display with WAV player
  // ============================================

  let currentAudio = null;

  function showNBeatResults(msg) {
    const { files, prompt, message } = msg;
    showNBeatProgress(message || '✅ Done');

    // Don't show the full prompt - keep promptOutput hidden
    // (user can inspect it via the nbeat_prompt.md download link if needed)

    // Show and play generated files
    if (files && files.length > 0) {
      const wavFile = files.find(f => f.type === 'audio/wav');
      const midiFile = files.find(f => f.type === 'audio/midi');
      const sunoFile = files.find(f => f.name === 'Suno_Prompt.txt');

      // Play WAV in the player bar
      if (wavFile) {
        playWavInPlayer(wavFile);
        showNBeatProgress(`🎵 Now playing: ${wavFile.name}`);
      }

      // Add to workspace song list
      const beatStyle = document.querySelector('.styles-input')?.value?.trim() || 'NBeat Beat';
      const thumbs = ['lightning', 'waveform', 'spiral', 'grid', 'dots', 'sphere', 'stripes'];
      const grads = [
        ['#1a0033', '#3d1b6b', '#7b2cbf'],
        ['#001f3f', '#003d7a', '#0066cc'],
        ['#330033', '#660066', '#cc0066'],
        ['#0d0d2b', '#1f0d4d', '#4d1f8c'],
        ['#0a1a0a', '#1a3d1a', '#2d6b2d'],
      ];
      const jobDir = msg.workDir || '';  // from bridge's done message
      songs.unshift({
        title: beatStyle.slice(0, 50),
        badge: '🎧 nbeat',
        badgeType: 'v4',
        desc: 'Loading Suno prompt...',
        duration: '3:00',
        thumb: thumbs[Math.floor(Math.random() * thumbs.length)],
        gradient: grads[Math.floor(Math.random() * grads.length)],
        wavUrl: wavFile?.httpUrl || null,
        midiUrl: midiFile?.httpUrl || null,
        sunoUrl: sunoFile?.httpUrl || null,
        workDir: jobDir,
        files,
        cta: null,
      });
      showSongs(songs);

      // Fetch Suno_Prompt.txt content for the desc
      if (sunoFile?.httpUrl) {
        fetch(sunoFile.httpUrl)
          .then(r => r.text())
          .then(text => {
            const song = songs[0];
            if (song) {
              const t = text.trim();
              song.desc = t + ` (${t.length} chars)`;
              song.title = t.slice(0, 20) + (t.length > 20 ? '…' : '');
              showSongs(songs);
            }
          })
          .catch(() => {
            const song = songs[0];
            if (song) {
              song.desc = `Suno_Prompt.txt (${sunoFile.size ? formatSize(sunoFile.size) : 'N/A'})`;
              showSongs(songs);
            }
          });
      } else {
        // No Suno file, show file list as fallback
        const song = songs[0];
        if (song) {
          song.desc = files.map(f => `${f.name} (${formatSize(f.size)})`).join(' · ');
          showSongs(songs);
        }
      }

      // Show files in progress log
      const log = document.getElementById('progressLog');
      if (log) {
        log.innerHTML += `<div class="log-line" style="color:var(--accent);margin-top:6px">📦 产出文件:</div>`;
        for (const f of files) {
          log.innerHTML += `<div class="log-line">  <a href="${f.httpUrl}" download style="color:var(--accent-blue)">⬇ ${f.name}</a> (${formatSize(f.size)})</div>`;
        }
      }
    } else if (!prompt) {
      showNBeatProgress('⚠️ 未找到输出文件');
    }

    // Show refine panel
    const refinePanel = document.getElementById('refinePanel');
    if (refinePanel) refinePanel.style.display = 'block';
  }

  // ============================================
  // NBeat: Refine button
  // ============================================

  let activeWorkDir = null;  // currently selected beat for refinement

  const refineBtn = document.getElementById('refineBtn');
  const refineInput = document.getElementById('refineInput');
  const newBeatBtn = document.getElementById('newBeatBtn');

  if (refineBtn && refineInput) {
    refineBtn.addEventListener('click', () => {
      const feedback = refineInput.value.trim();
      if (!feedback || !nbeatWs) return;

      const dir = activeWorkDir || (songs.length > 0 ? songs[0].workDir : null);
      if (!dir) {
        showNBeatProgress('⚠️ 没有可修改的 beat');
        return;
      }

      showNBeatProgress(`🔄 Refining: ${feedback}`);
      document.getElementById('refinePanel').style.display = 'none';
      document.getElementById('promptOutput').style.display = 'none';

      nbeatWs.send(JSON.stringify({
        type: 'refine',
        feedback,
        workDir: dir,
      }));
    });
  }

  if (newBeatBtn) {
    newBeatBtn.addEventListener('click', () => {
      // Reset to fresh state
      document.getElementById('refinePanel').style.display = 'none';
      document.getElementById('promptOutput').style.display = 'none';
      document.getElementById('progressPanel').style.display = 'none';
      refineInput.value = '';
      const stylesInput = document.querySelector('.styles-input');
      if (stylesInput) stylesInput.value = '';
      showNBeatProgress('🎧 Ready for new beat');
    });
  }

  function playWavInPlayer(wavFile) {
    stopPlayback();
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    currentAudio = new Audio(wavFile.httpUrl);

    // Find song index for this URL
    currentSongIdx = songs.findIndex(s => s.wavUrl === wavFile.httpUrl);
    updateSongName();
    updateThumbStates();
    currentAudio.addEventListener('loadedmetadata', () => {
      totalSeconds = Math.round(currentAudio.duration) || 180;
      curSeconds = 0;
      progress = 0;
      renderProgress();
      updatePlayIcon();
    });
    currentAudio.addEventListener('timeupdate', () => {
      if (dragging) return;  // Don't fight with user drag
      if (currentAudio) {
        curSeconds = Math.round(currentAudio.currentTime);
        totalSeconds = Math.round(currentAudio.duration) || 180;
        progress = (curSeconds / totalSeconds) * 100;
        renderProgress();
      }
    });
    currentAudio.addEventListener('ended', () => {
      if (repeatMode) {
        currentAudio.currentTime = 0;
        currentAudio.play();
      } else {
        playing = false;
        progress = 0;
        curSeconds = 0;
        updatePlayIcon();
        playNext();
      }
    });
    currentAudio.play().then(() => {
      playing = true;
      updatePlayIcon();
    }).catch(e => {
      showNBeatProgress('⚠️ Click download link to play');
    });
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ============================================
  // NBeat: Generate prompt
  // ============================================

  function showNBeatProgress(text) {
    const panel = document.getElementById('progressPanel');
    const stage = document.getElementById('progressStage');
    const log = document.getElementById('progressLog');
    if (panel) panel.style.display = 'block';
    if (stage) stage.textContent = text;
    if (log) {
      // Don't duplicate streaming text as log lines
      if (!text.startsWith('💬') && !text.startsWith('🤔')) {
        log.innerHTML += `<div class="log-line">${text}</div>`;
      }
      log.scrollTop = log.scrollHeight;
    }
  }

  let streamBuffer = '';
  let streamLineEl = null;
  function appendLogText(text) {
    const panel = document.getElementById('progressPanel');
    const log = document.getElementById('progressLog');
    if (panel) panel.style.display = 'block';
    if (!log) return;

    if (!streamLineEl || streamLineEl.parentNode !== log) {
      streamLineEl = document.createElement('div');
      streamLineEl.className = 'log-line log-stream';
      log.appendChild(streamLineEl);
      streamBuffer = '';
    }
    streamBuffer += text;
    streamLineEl.textContent = streamBuffer;
    log.scrollTop = log.scrollHeight;
  }

  function showNBeatPrompt(promptText, message) {
    const output = document.getElementById('promptOutput');
    const pre = document.getElementById('promptText');
    const hint = document.getElementById('promptHint');

    if (output) output.style.display = 'block';
    if (pre) pre.textContent = promptText;
    if (hint) {
      hint.innerHTML = `💡 <b>Paste this prompt into <code>nbeat</code></b> (or pi) in your terminal to generate the beat.<br>
        Install: <code>npm install -g nbeat-agent</code> &nbsp;|&nbsp; Run: <code>nbeat</code>`;
    }
    if (message) showNBeatProgress(message);

    // Copy to clipboard
    if (navigator.clipboard && promptText) {
      navigator.clipboard.writeText(promptText).then(() => {
        showNBeatProgress('✅ Prompt copied to clipboard!');
      }).catch(() => {});
    }
  }

  function generateNBeatPrompt() {
    const stylesInput = document.querySelector('.styles-input');
    const style = stylesInput ? stylesInput.value.trim() : '';

    if (!style) {
      stylesInput?.focus();
      return;
    }

    // Reset panels
    const log = document.getElementById('progressLog');
    if (log) log.innerHTML = '';
    const output = document.getElementById('promptOutput');
    if (output) output.style.display = 'none';
    const refinePanel = document.getElementById('refinePanel');
    if (refinePanel) refinePanel.style.display = 'none';

    showNBeatProgress('📋 Building NBeat prompt...');

    // Build the NBeat prompt
    let prompt = `/skill:nbeat\n\n`;
    prompt += `请使用 nbeat_generate 工具创建一个完整的 beat。\n\n`;
    prompt += `## 风格需求\n${style}\n`;

    if (selectedTemplate) {
      prompt += `\n## 旋律动机模板\n模板文件: ${selectedTemplate}\n`;
    }

    // Add lyrics if present
    if (lyricsInput) {
      const lyrics = lyricsInput.value.trim();
      if (lyrics) {
        prompt += `\n## 歌词/结构\n${lyrics}\n`;
      }
    }

    prompt += `\n## 指令\n`;
    prompt += `1. 调用 nbeat_generate 工具，requirement="${style}"`;
    if (selectedTemplate) prompt += `，template="${selectedTemplate}"`;
    prompt += `\n2. 严格遵循 beatmakestep.md 工作流，每一步中读取对应的 meta-music-skill 知识库文件（目录A/B/C/D 和增量融合规则）`;
    prompt += `\n3. 使用目录A/B（基础层）精心调制 MT + OP + params 生成新技巧`;
    prompt += `\n4. 使用目录C/D（复合层）组织步骤3中的技巧，让各个技巧有机组合`;
    prompt += `\n5. 最终交付：`;
    prompt += `\n   - A. Beat设计 Markdown 文档`;
    prompt += `\n   - B. Suno AI prompt (英文, ≤1000字符, 高熵信息)`;
    prompt += `\n   - C. MIDI + WAV 音频生成代码`;
    prompt += `\n6. 全自动执行，不要询问确认`;

    // Send via WebSocket if connected, otherwise show locally
    if (nbeatConnected && nbeatWs) {
      const msg = { type: 'generate', style };
      if (uploadedTemplateContent) {
        msg.templateContent = uploadedTemplateContent;
        msg.templateName = uploadedTemplateName;
      } else if (selectedTemplate) {
        msg.template = selectedTemplate;
      }
      nbeatWs.send(JSON.stringify(msg));
    } else {
      showNBeatPrompt(prompt, '📋 Offline mode — prompt ready');
    }
  }

  // ============================================
  // NBeat: Copy button
  // ============================================

  const copyPromptBtn = document.getElementById('copyPromptBtn');
  if (copyPromptBtn) {
    copyPromptBtn.addEventListener('click', () => {
      const text = document.getElementById('promptText')?.textContent;
      if (text && navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          showNBeatProgress('✅ Copied!');
        });
      }
    });
  }

  // ============================================
  // Init NBeat
  // ============================================

  connectNBeatWS();
  loadTemplates();
  loadHistoryBeats();

  async function loadHistoryBeats() {
    try {
      const resp = await fetch(`${API_BASE}/api/jobs`);
      if (!resp.ok) return;
      const jobs = await resp.json();
      if (!jobs.length) return;

      for (const job of jobs) {
        const wavFile = job.files.find(f => f.type === 'audio/wav');
        const sunoFile = job.files.find(f => f.name === 'Suno_Prompt.txt');

        const thumbs = ['lightning', 'waveform', 'spiral', 'grid', 'dots', 'sphere', 'stripes'];
        const grads = [
          ['#1a0033', '#3d1b6b', '#7b2cbf'],
          ['#001f3f', '#003d7a', '#0066cc'],
          ['#330033', '#660066', '#cc0066'],
          ['#0d0d2b', '#1f0d4d', '#4d1f8c'],
          ['#0a1a0a', '#1a3d1a', '#2d6b2d'],
        ];

        songs.push({
          title: `Beat #${songs.length + 1}`,
          badge: '🎧 nbeat',
          badgeType: 'v4',
          desc: sunoFile ? 'Loading...' : job.files.map(f => f.name).join(' · '),
          duration: '--:--',
          thumb: thumbs[Math.floor(Math.random() * thumbs.length)],
          gradient: grads[Math.floor(Math.random() * grads.length)],
          wavUrl: wavFile?.httpUrl || null,
          sunoUrl: sunoFile?.httpUrl || null,
          workDir: job.workDir,
          files: job.files,
          cta: null,
        });
      }

      showSongs(songs);

      // Fetch Suno prompts — update title + desc
      for (const song of songs) {
        if (song.sunoUrl) {
          fetch(song.sunoUrl)
            .then(r => r.text())
            .then(text => {
              const t = text.trim();
              song.desc = t + ` (${t.length} chars)`;
              song.title = t.slice(0, 20) + (t.length > 20 ? '…' : '');
              showSongs(songs);
            })
            .catch(() => {});
        }
      }
    } catch (e) {
      console.warn('[nbeat] Cannot load history:', e.message);
    }
  }

  // ============================================
  // Player bar
  // ============================================

  const playerPlay = document.getElementById('playerPlayBtn');
  const progFill = document.getElementById('progFill');
  const progThumb = document.getElementById('progThumb');
  const progTrack = document.getElementById('progTrack');
  const curTime = document.getElementById('curTime');
  const totalTime = document.getElementById('totalTime');

  let playing = false;
  let progress = 0;
  let totalSeconds = 0;
  let curSeconds = 0;
  let currentSongIdx = -1;
  let repeatMode = false;
  let shuffleMode = false;
  let dragging = false;

  function formatTime(s) {
    if (!s || s <= 0) return '--:--';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function renderProgress() {
    progFill.style.width = progress + '%';
    progThumb.style.left = progress + '%';
    curTime.textContent = formatTime(curSeconds);
    totalTime.textContent = formatTime(totalSeconds);
  }

  let playInterval = null;
  function startPlayback() {
    if (playInterval) return;
    playInterval = setInterval(() => {
      curSeconds = Math.min(curSeconds + 1, totalSeconds);
      progress = (curSeconds / totalSeconds) * 100;
      renderProgress();
      if (curSeconds >= totalSeconds) {
        stopPlayback();
        playing = false;
        updatePlayIcon();
      }
    }, 1000);
  }
  function stopPlayback() {
    if (playInterval) clearInterval(playInterval);
    playInterval = null;
  }

  function updatePlayIcon() {
    playerPlay.innerHTML = playing
      ? '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>'
      : '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  }

  if (playerPlay) {
    playerPlay.addEventListener('click', () => {
      if (currentAudio) {
        stopPlayback(); // kill mock interval
        if (playing) {
          currentAudio.pause();
          playing = false;
        } else {
          currentAudio.play();
          playing = true;
        }
      } else {
        playing = !playing;
        if (playing) startPlayback();
        else stopPlayback();
      }
      updatePlayIcon();
    });
  }

  // ── Next / Prev / Repeat / Shuffle ──────────────────

  function getPlayableSongs() {
    return songs.map((s, i) => ({ ...s, idx: i })).filter(s => s.wavUrl);
  }
  function playNext() {
    const pl = getPlayableSongs();
    if (!pl.length) return;
    let n;
    if (shuffleMode) n = pl[Math.floor(Math.random() * pl.length)];
    else if (currentSongIdx >= 0) {
      const c = pl.findIndex(s => s.idx === currentSongIdx);
      n = pl[(c + 1) % pl.length];
    } else n = pl[0];
    if (n) playWavInPlayer({ httpUrl: n.wavUrl, name: n.title });
  }
  function playPrev() {
    const pl = getPlayableSongs();
    if (!pl.length) return;
    let p;
    if (shuffleMode) p = pl[Math.floor(Math.random() * pl.length)];
    else if (currentSongIdx >= 0) {
      const c = pl.findIndex(s => s.idx === currentSongIdx);
      p = pl[(c - 1 + pl.length) % pl.length];
    } else p = pl[0];
    if (p) playWavInPlayer({ httpUrl: p.wavUrl, name: p.title });
  }
  function updateSongName() {
    const el = document.getElementById('songName');
    if (el) el.textContent = (currentSongIdx >= 0 && songs[currentSongIdx]) ? songs[currentSongIdx].title || '' : '';
  }
  function updateThumbStates() {
    document.querySelectorAll('.song-thumb').forEach(t => {
      t.classList.remove('playing');
      const overlay = t.querySelector('.play-overlay svg');
      if (overlay) overlay.innerHTML = '<path d="M8 5v14l11-7z"/>';
    });
    if (currentSongIdx >= 0) {
      const t = document.querySelector('.song-thumb[data-idx="' + currentSongIdx + '"]');
      if (t) {
        t.classList.add('playing');
        const overlay = t.querySelector('.play-overlay svg');
        if (overlay) overlay.innerHTML = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';
      }
    }
  }
  document.querySelector('.player-bar [aria-label="Next"]')?.addEventListener('click', playNext);
  document.querySelector('.player-bar [aria-label="Previous"]')?.addEventListener('click', playPrev);
  document.querySelector('.player-bar [aria-label="Repeat"]')?.addEventListener('click', function() {
    repeatMode = !repeatMode;
    this.style.color = repeatMode ? 'var(--accent)' : '';
  });
  document.querySelector('.player-bar [aria-label="Shuffle"]')?.addEventListener('click', function() {
    shuffleMode = !shuffleMode;
    this.style.color = shuffleMode ? 'var(--accent)' : '';
  });

  // Drag/scrub — use player-progress as the full clickable area
  const playerProgress = document.querySelector('.player-progress');
  if (playerProgress) {
    let wasPlaying = false;

    function getProgressPct(e) {
      const rect = playerProgress.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
      return Math.max(0, Math.min(100, (x / rect.width) * 100));
    }

    function seekTo(pct) {
      progress = pct;
      if (currentAudio && currentAudio.duration && !isNaN(currentAudio.duration)) {
        const targetTime = (pct / 100) * currentAudio.duration;
        currentAudio.currentTime = targetTime;
      } else if (!totalSeconds || totalSeconds === 0) {
        // No audio loaded yet, just update visual
        curSeconds = Math.round((pct / 100) * 180);
        totalSeconds = 180;
      }
      renderProgress();
    }

    playerProgress.addEventListener('mousedown', (e) => {
      dragging = true;
      wasPlaying = playing;
      const pct = getProgressPct(e);
      
      if (currentAudio && currentAudio.duration && !isNaN(currentAudio.duration)) {
        const target = (pct / 100) * currentAudio.duration;
        currentAudio.currentTime = target;
        // Update visual immediately
        curSeconds = Math.round(target);
        totalSeconds = Math.round(currentAudio.duration);
        progress = pct;
        renderProgress();
        
        const onSeeked = () => {
          currentAudio.removeEventListener('seeked', onSeeked);
          clearTimeout(fallback);
          currentAudio.play().then(() => {
            playing = true;
            updatePlayIcon();
          }).catch(() => {});
        };
        currentAudio.addEventListener('seeked', onSeeked);
        const fallback = setTimeout(() => {
          currentAudio.removeEventListener('seeked', onSeeked);
          currentAudio.play().then(() => {
            playing = true;
            updatePlayIcon();
          }).catch(() => {});
        }, 500);
      } else {
        seekTo(pct);
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (dragging) seekTo(getProgressPct(e));
    });

    document.addEventListener('mouseup', () => {
      if (dragging && currentAudio && wasPlaying) {
        currentAudio.play().catch(() => {});
        playing = true;
        updatePlayIcon();
      }
      dragging = false;
    });
  }

  // ============================================
  // Show songs (with pagination state)
  // ============================================

  function showSongs(data) {
    currentData = data;
    currentPage = 1;
    renderSongs(data, 1);
    updatePager();
  }

  // Pager buttons
  const prevBtn = document.querySelector('.pager-btn:first-child');
  const nextBtn = document.querySelector('.pager-btn:last-child');
  if (prevBtn) prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToPage(currentPage + 1));

  // ============================================
  // Search filter
  // ============================================

  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        showSongs(songs);
        return;
      }
      const filtered = songs.filter(
        (s) => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
      );
      showSongs(filtered);
    });
  }
  renderProgress();
})();

// Inject spinner CSS
const extraCSS = `
.spin {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.create-btn-large.ready .spin {
  border-color: rgba(0,0,0,0.2);
  border-top-color: #000;
}
`;
const style = document.createElement('style');
style.textContent = extraCSS;
document.head.appendChild(style);