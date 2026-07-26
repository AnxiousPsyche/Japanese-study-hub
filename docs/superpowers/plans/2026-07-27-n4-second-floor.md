# N4 Second Floor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fully-explorable second floor (JLPT N4) reached from N5's staircase, reusing N5's movement/camera/collision/interaction/LessonBox systems through a new shared-helpers file instead of duplicating them, per `docs/superpowers/specs/2026-07-27-n4-second-floor-design.md`.

**Architecture:** Extract the genuinely engine-level, content-agnostic parts of `LibraryScene` (crop/texture helpers, the retro menu engine, interaction dispatch, LessonBox glue, auto-walk pathing) into `assets/js/library-scene-shared.js` as a plain mixin object + free functions. `n5-phaser-game.js`'s `LibraryScene` keeps its own layout/shelf data but mixes in the shared engine instead of defining it twice. A new `assets/js/n4-phaser-game.js` defines `N4LibraryScene`, structured the same way, with its own layout/shelf data, mixing in the same shared engine. A new `pages/N4/n4-dashboard.html` boots it. This project has no bundler — every file is a plain `<script src>` global, so "shared" means "loaded once, referenced by both scene files," not an ES module import.

**Tech Stack:** Phaser 3.90.0, vanilla JS, no build step (matches the rest of the repo).

## Global Constraints

- Do not change any N5 visual/gameplay behavior except the one explicit hook point (the "Proceed to N4" staircase option) and the mechanical shared-helpers extraction (Task 1) — extraction must be behavior-preserving, verified live before any N4-specific code is written.
- No new art packs or image files — every new crop comes from `assets/images/ui/*.png`, `assets/images/lesson/*`, or `assets/images/avatars/*`, already loaded by N5.
- Every new/changed `.js` file must pass `node --check` after every task.
- Every task that touches rendering must be verified live in the Browser pane preview on a fresh, never-before-used port (this project's documented stale-JS-cache gotcha — see `CLAUDE.md`), checking for console errors via `read_console_messages`.
- N4's world: `TILE_SIZE = 16`, `GRID_COLS = 72`, `GRID_ROWS = 180` → `WORLD_W = 1152`, `WORLD_H = 2880`. Camera-follow, no fixed camera, no shrinking — same as N5.
- N4 palette accents (from the approved mockup): deep wine `#5c1a2e` (carpet), forest green `#1f3d2b` (accent), dark wood `#3a2415`, richer amber `#d4a24c` (gold accent, replaces N5's `#F0C674` where N4 draws its own canvas textures).
- 16 N4 shelves in 4 wings of 4 (Grammar 1-4, Vocabulary 5-8, Reading & Listening 9-12, Conversation & Practice 13-16), 4 review piles (one per wing), 1 boss-quiz gate stubbed to `showToast('N3 is coming soon.')`. Flagship shelves with full content: `n4-shelf-01`, `n4-shelf-09`, `n4-shelf-13`. All other shelves get a single-page placeholder lesson (real `LESSON_CONTENT`, marks progress, just short).
- Shelf/pile ids are prefixed `n4-` (e.g. `n4-shelf-01`, `n4-review-1`, `n4-boss-quiz`) so they can never collide with N5's `localStorage` progress keys if the two floors' saves are ever merged later.

---

### Task 1: Extract shared scene engine, verify N5 unchanged

**Files:**
- Create: `assets/js/library-scene-shared.js`
- Modify: `assets/js/n5-phaser-game.js`
- Modify: `pages/N5/n5-dashboard.html` (add the new `<script>` tag)

**Interfaces:**
- Produces: `window.LibrarySceneEngine` — a plain object whose methods get mixed onto a scene class via `Object.assign(SceneClass.prototype, LibrarySceneEngine)`. Members: `buildRetroMenu(title, options, subtitle)`, `highlightRetroMenu(index)`, `selectRetroMenuOption()`, `updateRetroMenuInput()`, `closeRetroMenu()`, `handleInteractiveClick(entry)`, `nearestInRange()`, `openInteraction(entry)`, `openRetroMenu(entry, state)`, `startLesson(entry, resumeIndex)`, `completeInteraction(entry)`, `toggleFavorite(entry)`, `refreshAllStates()`, `spawnPassSparkle(x, y)`, `openQuizGateMenu(entry, state)`, `openQuizAttemptMenu(entry)`, `resolveQuizAttempt(entry, passed)`, `wireInput()`.
- Produces: free functions `cropToTexture(scene, sourceKey, rect, destKey)`, `drawWovenRug(scene, key, w, h, palette)`, `drawWallHeaderTexture(scene, w, h)`, `getState(id, prereq, progress)`, `loadQuizGateState(quizGateKey)`, `saveQuizGateState(quizGateKey, state)`, `getQuizGateStatus(quizGateKey)` — all pure/scene-parameterized, no floor-specific globals referenced internally.
- Produces: `const TRIGGER_RANGE = 80;`, `const QUIZ_MAX_ATTEMPTS = 3;`, `const QUIZ_LOCKOUT_MS = 24 * 60 * 60 * 1000;` (values copied verbatim from `n5-phaser-game.js:7233-7245` — confirmed, not guessed).
- Consumes (every scene that mixes in the engine must set all of these in its own `create()`/`buildScene()` before any engine method is called): `this.worldW`, `this.finalGateId` (replaces the hardcoded `'final-quiz'` string), `this.printerStationId` (replaces the hardcoded `'printer-station'` string, or `null`), `this.printLinksByShelf`/`this.allPrintLinks` (replace the module-level `PRINT_LINKS_BY_SHELF`/`ALL_PRINT_LINKS` lookups), `this.lessonContent` (replaces the module-level `LESSON_CONTENT` lookup), `this.quizGateKey` (that floor's own quiz-gate `localStorage` key), `this.catColors`/`this.talkColorPaths`/`this.senseiPortraitPaths` (replace `CAT_COLORS`/`TALK_COLOR_PATHS`/`SENSEI_PORTRAIT_PATHS`), `this.extraRetroMenuOptions` (optional `(entry) => options[]`, replaces the shelf-08-only "Walk the Route" hardcode — may be `undefined`), `this.finalGateProceedLabel` (button text) and `this.onFinalGatePass` (callback, replaces the hardcoded "Proceed to N4" toast stub).

- [ ] **Step 1: Record current N5 behavior as a baseline**

  Before touching anything, start the game on a fresh port and record: does every shelf/review pile/staircase open correctly, does auto-walk routing work, does the retro menu keyboard nav work. Use the existing verification pattern (`localStorage.setItem('nekoBunko.n5.catColor','orange')`, `scene.start('LibraryScene')`, then `scene.interactives` inspection + `LessonBox.open`/`advance` calls) already used throughout this session. Note anything you'd need to re-check after the extraction.

- [ ] **Step 2: Read the exact current source of `drawWallHeaderTexture`**

  Every other function/method needed for Step 3 is already transcribed in full there. `drawWallHeaderTexture` (112 lines of pure canvas drawing, `n5-phaser-game.js:7435-7546`) is the one exception — read it directly from that range when you reach Step 3 rather than retyping from this plan, to eliminate transcription risk on a function that size.

- [ ] **Step 3: Write `assets/js/library-scene-shared.js`**

  Structure:
  ```js
  // Shared engine for every LibraryScene-style floor (N5, N4, ...).
  // Loaded as a plain global (no bundler in this project) — each floor's
  // own scene file must load this script first, then do
  // Object.assign(FloorScene.prototype, LibrarySceneEngine) once, after
  // its class declaration.
  //
  // Consumes these scene instance properties, set by each floor's own
  // create()/buildScene() before any engine method runs:
  //   this.worldW           - that floor's WORLD_W
  //   this.finalGateId      - id of that floor's end-of-floor gate entry
  //                           (was the hardcoded 'final-quiz' string)
  //   this.printerStationId - id of that floor's printer-station entry,
  //                           or null if it has none (was the hardcoded
  //                           'printer-station' string)
  //   this.printLinksByShelf, this.allPrintLinks - that floor's own
  //                           PRINT_LINKS_BY_SHELF / ALL_PRINT_LINKS maps
  //                           (empty objects if the floor has no PDFs yet)

  const TRIGGER_RANGE = 80; // px — click-in-range / E-to-interact radius, copied verbatim from n5-phaser-game.js:7245
  const QUIZ_MAX_ATTEMPTS = 3;
  const QUIZ_LOCKOUT_MS = 24 * 60 * 60 * 1000;

  function cropToTexture(scene, sourceKey, rect, destKey) {
    const srcImage = scene.textures.get(sourceKey).getSourceImage();
    const canvasTexture = scene.textures.createCanvas(destKey, rect.w, rect.h);
    const ctx = canvasTexture.getContext();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(srcImage, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
    canvasTexture.refresh();
    return destKey;
  }

  // Verbatim from n5-phaser-game.js:7435-7546 (drawWallHeaderTexture) —
  // 112 lines of pure canvas drawing (planks/molding/pillars/rivets), no
  // N5-specific data referenced anywhere in its body (only its own local
  // vars + the scene/w/h params). Copy it byte-for-byte into this file
  // with ZERO modifications — read it directly from that exact line
  // range rather than retyping it by hand, so there is no transcription
  // risk on a function this size.
  function drawWallHeaderTexture(scene, w, h) { /* copied verbatim from n5-phaser-game.js:7435-7546 — see note above */ }

  // Verbatim from n5-phaser-game.js:7555-7601 (drawWovenRug), with ONE
  // addition: an optional `palette` param so N4 can recolor it to the
  // approved mockup's wine/gold accent without forking the function.
  // Calling it with no 4th arg reproduces N5's exact existing colors —
  // this is an additive, non-breaking change to the function's signature.
  function drawWovenRug(scene, key, w, h, palette) {
    const p = palette || {};
    const rugDark = p.rugDark ?? 0x3a1816;
    const rugFringeLight = p.rugFringeLight ?? 0x4a231f;
    const rugBase = p.rugBase ?? 0x7a3230;
    const rugWeave = p.rugWeave ?? 0x6b2b28;
    const rugMotif = p.rugMotif ?? 0xc9a66b;
    const rugMotifShade = p.rugMotifShade ?? 0xa87f4a;
    const borderW = 6;
    const hex = (n) => '#' + n.toString(16).padStart(6, '0');

    const tex = scene.textures.createCanvas(key, w, h);
    const ctx = tex.getContext();
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = hex(rugBase);
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = hex(rugWeave);
    for (let y = 1; y < h; y += 3) ctx.fillRect(borderW, y, w - borderW * 2, 1);
    ctx.fillStyle = hex(rugDark);
    ctx.fillRect(0, 0, borderW, h);
    ctx.fillRect(w - borderW, 0, borderW, h);
    ctx.fillStyle = hex(rugFringeLight);
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, borderW - 2, 2);
      ctx.fillRect(w - borderW + 2, y, borderW - 2, 2);
    }

    const dcx = w / 2;
    const dcy = h / 2;
    const dw = Math.min(18, w - borderW * 2 - 6);
    const dh = Math.min(12, h - 6);
    const drawDiamond = (fill, pad) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(dcx, dcy - dh / 2 - pad);
      ctx.lineTo(dcx + dw / 2 + pad, dcy);
      ctx.lineTo(dcx, dcy + dh / 2 + pad);
      ctx.lineTo(dcx - dw / 2 - pad, dcy);
      ctx.closePath();
      ctx.fill();
    };
    drawDiamond(hex(rugMotifShade), 1);
    drawDiamond(hex(rugMotif), 0);

    tex.refresh();
    return key;
  }

  // Pure DOM helpers (no scene/floor state, no Phaser dependency) — were
  // module-level functions in n5-phaser-game.js, move unchanged. Safe as
  // a page-wide singleton toast element since N5 and N4 are separate
  // page loads that never coexist in the same document.
  function ensureToast() {
    let toast = document.getElementById('nekoToast');
    if (toast) return toast;
    toast = document.createElement('div');
    toast.id = 'nekoToast';
    toast.style.cssText = 'position:fixed;top:110px;left:50%;transform:translateX(-50%);'
      + 'background:#5A4A3A;color:#FFFDF6;padding:10px 18px;border-radius:4px;'
      + 'font-family:Nunito,sans-serif;font-size:.85rem;z-index:20001;'
      + 'opacity:0;transition:opacity .25s;pointer-events:none;';
    document.body.appendChild(toast);
    return toast;
  }
  function showToast(text) {
    const toast = ensureToast();
    toast.textContent = text;
    toast.style.opacity = '1';
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { toast.style.opacity = '0'; }, 1400);
  }

  // Pure helper (no scene/floor state) — was a module-level function in
  // n5-phaser-game.js, moves unchanged.
  function getState(id, prereq, progress) {
    if (progress[id]) return 'completed';
    if (prereq === null || prereq === undefined || progress[prereq]) return 'available';
    return 'locked';
  }

  // Quiz-gate (staircase attempt/cooldown) persistence — generalized to
  // take the floor's own localStorage key instead of N5's hardcoded
  // QUIZ_GATE_KEY, so N4's boss-quiz gate can reuse this unchanged with
  // its own key instead of a duplicated copy.
  function loadQuizGateState(quizGateKey) {
    try {
      const raw = localStorage.getItem(quizGateKey);
      if (!raw) return { attemptsUsed: 0, lockedUntil: null };
      const parsed = JSON.parse(raw);
      return {
        attemptsUsed: typeof parsed.attemptsUsed === 'number' ? parsed.attemptsUsed : 0,
        lockedUntil: typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : null,
      };
    } catch (e) {
      return { attemptsUsed: 0, lockedUntil: null };
    }
  }
  function saveQuizGateState(quizGateKey, state) {
    try {
      localStorage.setItem(quizGateKey, JSON.stringify(state));
    } catch (e) {
      // localStorage unavailable — degrade to session-only, same pattern as saveProgress().
    }
  }
  function formatLockMessage(msRemaining) {
    const totalMinutes = Math.max(1, Math.ceil(msRemaining / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `Locked - try again in ${hours}h ${minutes}m`;
  }
  function getQuizGateStatus(quizGateKey) {
    const state = loadQuizGateState(quizGateKey);
    if (state.lockedUntil !== null && Date.now() >= state.lockedUntil) {
      state.attemptsUsed = 0;
      state.lockedUntil = null;
      saveQuizGateState(quizGateKey, state);
    }
    const locked = state.lockedUntil !== null && Date.now() < state.lockedUntil;
    return {
      state,
      locked,
      attemptsLeft: Math.max(0, QUIZ_MAX_ATTEMPTS - state.attemptsUsed),
      lockMessage: locked ? formatLockMessage(state.lockedUntil - Date.now()) : null,
    };
  }

  const LibrarySceneEngine = {
    wireInput() {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
      this.interactKey = this.input.keyboard.addKey('E');
      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      const tryInteract = () => {
        if (this.retroMenu) { this.selectRetroMenuOption(); return; }
        if (this.panelOpen) return;
        const near = this.nearestInRange();
        if (near) this.openInteraction(near);
      };
      this.interactKey.on('down', tryInteract);
      this.enterKey.on('down', tryInteract);
      this.spaceKey.on('down', tryInteract);
    },
    handleInteractiveClick(entry) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.x, entry.y);
      if (dist <= (entry.triggerRange || TRIGGER_RANGE)) {
        this.openInteraction(entry);
        return;
      }
      const corridorX = this.worldW / 2; // was WORLD_W / 2
      this.moveQueue = [
        { x: corridorX, y: this.player.y },
        { x: corridorX, y: entry.y },
        { x: entry.x, y: entry.y },
      ];
      this.pendingInteract = entry;
    },
    nearestInRange() {
      let closest = null;
      let closestDist = Infinity;
      this.interactives.forEach((entry) => {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.x, entry.y);
        if (dist <= (entry.triggerRange || TRIGGER_RANGE) && dist < closestDist) {
          closest = entry;
          closestDist = dist;
        }
      });
      return closest;
    },
    openInteraction(entry) {
      if (entry.kind === 'npc') { this.startLesson(entry); return; }
      const state = entry.kind === 'shelf'
        ? getState(entry.id, entry.prereq, this.progress)
        : (this.progress[entry.id] ? 'completed'
          : (entry.requires.every((r) => this.progress[r]) ? 'available' : 'locked'));
      if (state === 'locked') { showToast('Not yet…'); return; }
      if (entry.id === this.finalGateId) { // was === 'final-quiz'
        if (state !== 'completed') {
          const gate = getQuizGateStatus(this.quizGateKey); // was getQuizGateStatus() reading module-level QUIZ_GATE_KEY
          if (gate.locked) { showToast(gate.lockMessage); return; }
        }
        this.openQuizGateMenu(entry, state);
        return;
      }
      this.openRetroMenu(entry, state);
    },
    openRetroMenu(entry, state) {
      const hasContent = !!this.lessonContent[entry.id]; // was the module-level LESSON_CONTENT global
      const totalPages = hasContent ? appendGreetingSummary(this.lessonContent[entry.id], entry.title).length : 0;
      const savedIndex = hasContent ? this.lessonPage[entry.id] : undefined;
      const hasResume = typeof savedIndex === 'number' && savedIndex > 0 && savedIndex < totalPages - 1;
      const startAction = hasContent
        ? () => this.startLesson(entry)
        : () => this.completeInteraction(entry);
      const options = hasContent
        ? [
          ...(hasResume
            ? [
              { label: `Continue (pg ${savedIndex + 1})`, onSelect: () => this.startLesson(entry, savedIndex) },
              { label: 'Start Over', onSelect: startAction },
            ]
            : [{ label: 'Start Lesson', onSelect: startAction }]),
          ...(this.extraRetroMenuOptions ? this.extraRetroMenuOptions(entry) : []), // was the shelf-08-only "Walk the Route" hardcode
          ...(entry.kind === 'shelf' ? [{ label: 'Make Favorite?', onSelect: () => this.toggleFavorite(entry) }] : []),
          { label: 'Exit', onSelect: () => this.closeRetroMenu() },
        ]
        : [
          { label: 'Read again', onSelect: () => this.completeInteraction(entry) },
          { label: 'Exit', onSelect: () => this.closeRetroMenu() },
        ];
      void state;
      const subtitle = hasContent ? `${totalPages} pages` : undefined;
      this.buildRetroMenu(entry.title, options, subtitle);
    },
    startLesson(entry, resumeIndex) {
      this.closeRetroMenu();
      this.panelOpen = true;
      let pages = appendGreetingSummary(this.lessonContent[entry.id], entry.title); // was module-level LESSON_CONTENT
      pages = resolveConversationTurns(pages, this.catColorId);
      pages = resolveDynamicDiagrams(pages, this.catColorId);
      const isSenseiGuide = entry.kind === 'npc';
      const catImagePath = isSenseiGuide ? this.senseiPortraitPaths.idle : this.catColors[this.catColorId].path;
      const talkImagePath = isSenseiGuide ? this.senseiPortraitPaths.talk : this.talkColorPaths[this.catColorId];
      window.LessonBox.open(pages, {
        speaker: 'Neko-sensei',
        catImagePath,
        talkImagePath,
        startIndex: resumeIndex,
        printLinks: entry.id === this.printerStationId ? this.allPrintLinks : this.printLinksByShelf[entry.id], // was 'printer-station' / PRINT_LINKS_BY_SHELF / ALL_PRINT_LINKS
        printIconPath: '../../assets/images/lesson/printer-image-Original.png',
        onComplete: () => {
          this.progress[entry.id] = true;
          saveProgress(this.progress);
          this.refreshAllStates();
          this.panelOpen = false;
        },
        onClose: (closedIndex, totalPages) => {
          this.panelOpen = false;
          if (typeof closedIndex === 'number' && totalPages && closedIndex < totalPages - 1) {
            this.lessonPage[entry.id] = closedIndex;
          } else {
            delete this.lessonPage[entry.id];
          }
          saveLessonPage(this.lessonPage);
        },
      });
    },
    completeInteraction(entry) {
      this.progress[entry.id] = true;
      saveProgress(this.progress);
      this.refreshAllStates();
      this.closeRetroMenu();
    },
    toggleFavorite(entry) {
      this.favorites[entry.id] = !this.favorites[entry.id];
      saveFavorites(this.favorites);
      this.refreshAllStates();
      this.closeRetroMenu();
    },
    refreshAllStates() {
      this.interactives.forEach((entry) => {
        if (entry.kind === 'npc') return;
        const state = entry.kind === 'shelf'
          ? getState(entry.id, entry.prereq, this.progress)
          : (this.progress[entry.id] ? 'completed'
            : (entry.requires.every((r) => this.progress[r]) ? 'available' : 'locked'));
        if (entry.kind === 'shelf') {
          entry.sprite.setTexture(state === 'locked' ? entry.lockedKey : entry.filledKey);
          entry.favIcon.setVisible(!!this.favorites[entry.id]);
          entry.completeBadge.setVisible(state === 'completed');
        }
        if (entry.id !== this.finalGateId) { // was !== 'final-quiz'
          entry.sprite.setAlpha(state === 'locked' ? 0.55 : 1);
        }
        entry.glow.setVisible(state === 'available');
        entry.stamp.setVisible(state === 'completed');
      });
    },
    spawnPassSparkle(x, y) {
      const sparkCount = 6;
      for (let i = 0; i < sparkCount; i++) {
        const angle = (Math.PI * 2 * i) / sparkCount;
        const dist = 40;
        const targetX = x + Math.cos(angle) * dist;
        const targetY = y + Math.sin(angle) * dist;
        const spark = this.add.text(x, y, '✨', { fontSize: '18px' }).setOrigin(0.5).setDepth(10);
        this.tweens.add({
          targets: spark, x: targetX, y: targetY,
          scale: { from: 1, to: 1.4 }, alpha: { from: 1, to: 0 },
          duration: 700, ease: 'Cubic.Out',
          onComplete: () => spark.destroy(),
        });
      }
    },
    buildRetroMenu(title, options, subtitle) {
      this.closeRetroMenu();
      const cam = this.cameras.main;
      const cx = cam.width / 2;
      const cy = cam.height / 2;
      const hasSubtitle = !!subtitle;
      const boxWidth = 300;
      const titleText = this.add.text(0, 0, title, {
        fontFamily: '"Press Start 2P", "DotGothic16", monospace', fontSize: '12px', color: '#F0C674',
        align: 'center', wordWrap: { width: boxWidth - 40, useAdvancedWrap: true },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
      const titleExtra = Math.max(0, titleText.height - 16);
      const boxHeight = (hasSubtitle ? 96 : 76) + titleExtra + options.length * 32;
      const boxTop = cy - boxHeight / 2;
      const bg = this.add.rectangle(cx, cy, boxWidth, boxHeight, 0x1a1410)
        .setStrokeStyle(3, 0x8a6a3a).setScrollFactor(0).setDepth(2000);
      titleText.setPosition(cx, boxTop + 26 + titleExtra / 2);
      const subtitleText = hasSubtitle ? this.add.text(cx, boxTop + 46 + titleExtra, subtitle, {
        fontFamily: '"Press Start 2P", "DotGothic16", monospace', fontSize: '8px', color: '#8a7a5a',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(2001) : null;
      const optionsStartY = boxTop + (hasSubtitle ? 78 : 58) + titleExtra;
      const optionTexts = options.map((opt, i) => this.add.text(cx - 118, optionsStartY + i * 32, '', {
        fontFamily: '"Press Start 2P", "DotGothic16", monospace', fontSize: '10px', color: '#B08D57',
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(2001)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.highlightRetroMenu(i))
        .on('pointerup', () => { if (this.retroMenu && this.retroMenu.selectedIndex === i) this.selectRetroMenuOption(); }));
      this.retroMenu = { bg, titleText, subtitleText, optionTexts, options, selectedIndex: 0 };
      this.panelOpen = true;
      this.highlightRetroMenu(0);
    },
    highlightRetroMenu(index) {
      if (!this.retroMenu) return;
      this.retroMenu.selectedIndex = index;
      this.retroMenu.optionTexts.forEach((t, i) => {
        t.setColor(i === index ? '#FFDD88' : '#B08D57');
        t.setText((i === index ? '▶ ' : '  ') + this.retroMenu.options[i].label);
      });
    },
    selectRetroMenuOption() {
      if (!this.retroMenu) return;
      const opt = this.retroMenu.options[this.retroMenu.selectedIndex];
      if (opt) opt.onSelect();
    },
    updateRetroMenuInput() {
      const upDown = this.cursors.up.isDown || this.wasd.up.isDown;
      const downDown = this.cursors.down.isDown || this.wasd.down.isDown;
      if (upDown && !this.retroUpKeyWasDown) {
        this.highlightRetroMenu(Math.max(0, this.retroMenu.selectedIndex - 1));
      }
      if (downDown && !this.retroDownKeyWasDown) {
        this.highlightRetroMenu(Math.min(this.retroMenu.options.length - 1, this.retroMenu.selectedIndex + 1));
      }
      this.retroUpKeyWasDown = upDown;
      this.retroDownKeyWasDown = downDown;
    },
    closeRetroMenu() {
      if (this.retroMenu) {
        this.retroMenu.bg.destroy();
        this.retroMenu.titleText.destroy();
        if (this.retroMenu.subtitleText) this.retroMenu.subtitleText.destroy();
        this.retroMenu.optionTexts.forEach((t) => t.destroy());
        this.retroMenu = null;
      }
      this.panelOpen = false;
    },
    openQuizGateMenu(entry, state) {
      const options = state === 'completed'
        ? [
          { label: this.finalGateProceedLabel || 'Proceed', onSelect: () => this.onFinalGatePass() }, // was the hardcoded 'Proceed to N4' + showToast stub
          { label: 'Exit', onSelect: () => this.closeRetroMenu() },
        ]
        : [
          { label: 'Retry exam', onSelect: () => this.openQuizAttemptMenu(entry) },
          { label: 'Exit', onSelect: () => this.closeRetroMenu() },
        ];
      this.buildRetroMenu(entry.title, options);
    },
    openQuizAttemptMenu(entry) {
      const { attemptsLeft } = getQuizGateStatus(this.quizGateKey);
      const options = [
        { label: 'Pass (test)', onSelect: () => this.resolveQuizAttempt(entry, true) },
        { label: 'Fail (test)', onSelect: () => this.resolveQuizAttempt(entry, false) },
        { label: 'Back', onSelect: () => this.openQuizGateMenu(entry, 'available') },
      ];
      this.buildRetroMenu(`${entry.title} (${attemptsLeft} left)`, options);
    },
    resolveQuizAttempt(entry, passed) {
      if (passed) {
        this.progress[entry.id] = true;
        saveProgress(this.progress);
        this.refreshAllStates();
        this.closeRetroMenu();
        this.spawnPassSparkle(entry.x, entry.y);
        return;
      }
      const gateState = loadQuizGateState(this.quizGateKey);
      gateState.attemptsUsed += 1;
      if (gateState.attemptsUsed >= QUIZ_MAX_ATTEMPTS) {
        gateState.lockedUntil = Date.now() + QUIZ_LOCKOUT_MS;
        saveQuizGateState(this.quizGateKey, gateState);
        this.closeRetroMenu();
        showToast('Locked for 24 hours.');
      } else {
        saveQuizGateState(this.quizGateKey, gateState);
        this.closeRetroMenu();
        showToast(`Try again (${QUIZ_MAX_ATTEMPTS - gateState.attemptsUsed} left)`);
      }
    },
  };

  window.LibrarySceneEngine = LibrarySceneEngine;
  window.cropToTexture = cropToTexture;
  window.drawWovenRug = drawWovenRug;
  window.drawWallHeaderTexture = drawWallHeaderTexture;
  window.getState = getState;
  window.getQuizGateStatus = getQuizGateStatus;
  window.ensureToast = ensureToast;
  window.showToast = showToast;
  window.TRIGGER_RANGE = TRIGGER_RANGE;
  ```
  For `drawWallHeaderTexture`, open `n5-phaser-game.js` and copy lines
  7435-7546 verbatim into the function body above — do not retype it by
  hand (read + copy, to eliminate transcription risk on a function this
  size). Every other function/method above is complete as written; no
  further lookups needed.

  Each floor scene must additionally set these NEW scene properties
  (beyond the ones already listed in this task's Interfaces section)
  before calling any engine method, since the engine now reads them
  instead of N5's old module-level globals:
  `this.lessonContent` (that floor's `LESSON_CONTENT` object),
  `this.quizGateKey` (that floor's own quiz-gate localStorage key),
  `this.catColors`, `this.talkColorPaths`, `this.senseiPortraitPaths`
  (N4 can reuse N5's exact `CAT_COLORS`/`TALK_COLOR_PATHS`/
  `SENSEI_PORTRAIT_PATHS` objects verbatim — same cat sprites, same
  sensei — so these can be copied as-is into `n4-phaser-game.js`),
  `this.extraRetroMenuOptions` (optional function `(entry) => options[]`
  — N5 sets this to reproduce today's shelf-08-only "Walk the Route"
  option; N4 can leave it `undefined`).

- [ ] **Step 4: Update `n5-phaser-game.js` to consume the shared engine**

  - Delete the now-duplicated function/method definitions from `LibraryScene` and the module scope (the ones moved in Step 3): `cropToTexture`, `drawWovenRug`, `drawWallHeaderTexture`, `getState`, `loadQuizGateState`, `saveQuizGateState`, `formatLockMessage`, `getQuizGateStatus`, `ensureToast`, `showToast`, `TRIGGER_RANGE`, `QUIZ_MAX_ATTEMPTS`, `QUIZ_LOCKOUT_MS`, `QUIZ_GATE_KEY` (the constant itself is replaced by the `this.quizGateKey` property below), and every `LibraryScene` method now in `LibrarySceneEngine` (`wireInput`, `handleInteractiveClick`, `nearestInRange`, `openInteraction`, `openRetroMenu`, `startLesson`, `completeInteraction`, `toggleFavorite`, `refreshAllStates`, `spawnPassSparkle`, `buildRetroMenu`, `highlightRetroMenu`, `selectRetroMenuOption`, `updateRetroMenuInput`, `closeRetroMenu`, `openQuizGateMenu`, `openQuizAttemptMenu`, `resolveQuizAttempt`).
  - In `LibraryScene.buildScene()` (or `create()`, whichever runs first), before anything that calls an engine method, set:
    ```js
    this.worldW = WORLD_W;
    this.finalGateId = 'final-quiz';
    this.printerStationId = 'printer-station';
    this.printLinksByShelf = PRINT_LINKS_BY_SHELF;
    this.allPrintLinks = ALL_PRINT_LINKS;
    this.lessonContent = LESSON_CONTENT;
    this.quizGateKey = 'nekoBunko.n5.quizGate'; // was the module-level QUIZ_GATE_KEY
    this.catColors = CAT_COLORS;
    this.talkColorPaths = TALK_COLOR_PATHS;
    this.senseiPortraitPaths = SENSEI_PORTRAIT_PATHS;
    this.extraRetroMenuOptions = (entry) =>
      entry.id === 'shelf-08' ? [{ label: 'Walk the Route (駅)', onSelect: () => this.launchDirectionMap() }] : [];
    this.finalGateProceedLabel = 'Proceed to N4';
    this.onFinalGatePass = () => {
      showToast('Climbing to the second floor…');
      window.location.href = '../N4/n4-dashboard.html';
    };
    ```
    (The `onFinalGatePass` navigation itself gets swapped for the real thing in Task 8 — for this task it can stay as today's toast-only stub, since Task 8 is a separate, focused change.)
  - After the `class LibraryScene extends Phaser.Scene { ... }` declaration, add:
    ```js
    Object.assign(LibraryScene.prototype, LibrarySceneEngine);
    ```
  - Replace every remaining call site that referenced the deleted module-level `cropToTexture`/`drawWovenRug`/`drawWallHeaderTexture` with the same names (now globals from the shared file — no call-site changes needed since the names are identical).

- [ ] **Step 5: Add the shared script tag to N5's dashboard**

  In `pages/N5/n5-dashboard.html`, add `<script src="../../assets/js/library-scene-shared.js"></script>` immediately before the existing `<script src="../../assets/js/n5-phaser-game.js"></script>` tag.

- [ ] **Step 6: Verify**

  `node --check assets/js/library-scene-shared.js && node --check assets/js/n5-phaser-game.js`. Then live-verify on a fresh port: re-run every check from Step 1's baseline (every shelf/review pile/staircase opens, auto-walk routing works, retro menu keyboard nav works, no console errors). Behavior must be identical to the baseline — if anything differs, fix it before starting Task 2.

---

### Task 2: N4 scaffolding — dashboard page, boot sequence, empty scene

**Files:**
- Create: `pages/N4/n4-dashboard.html`
- Create: `assets/js/n4-phaser-game.js`

**Interfaces:**
- Consumes: `window.LibrarySceneEngine`, `cropToTexture`, `drawWovenRug`, `drawWallHeaderTexture`, `TRIGGER_RANGE` from Task 1's `library-scene-shared.js`.
- Produces: `N4LibraryScene` class, `window.__n4Game` (matches N5's `window.__n5Game` debug-access pattern).

- [ ] **Step 1: Copy `pages/N5/n5-dashboard.html` structure to `pages/N4/n4-dashboard.html`**

  Same OS-shell CSS/JS includes (the ones shared across all pages, e.g. `assets/css/variables.css`, `assets/css/os.css`, whatever `n5-dashboard.html` itself includes for the surrounding chrome — read the real file to copy its exact `<head>` includes, don't guess). Swap the page title/heading text to reference N4. Load order in `<body>`: OS-shell scripts (unchanged), then Phaser CDN script, then `../../assets/js/library-scene-shared.js`, then `../../assets/js/n4-phaser-game.js`.

- [ ] **Step 2: Write the skeleton of `assets/js/n4-phaser-game.js`**

  ```js
  const TILE_SIZE = 16;
  const GRID_COLS = 72;
  const GRID_ROWS = 180;
  const WORLD_W = GRID_COLS * TILE_SIZE; // 1152
  const WORLD_H = GRID_ROWS * TILE_SIZE; // 2880

  const N4_PALETTE = {
    carpet: 0x5c1a2e,
    accentGreen: 0x1f3d2b,
    darkWood: 0x3a2415,
    gold: 0xd4a24c,
  };

  class N4LibraryScene extends Phaser.Scene {
    constructor() { super('N4LibraryScene'); }

    preload() {
      // Phaser's texture cache is per-Game-instance, and N4 is a
      // separate page/Game instance from N5 — every source sheet N4
      // needs must be loaded here too, even ones N5 also loads. Read
      // n5-phaser-game.js's own preload() first to confirm these are
      // the exact same path strings (do not guess at paths); this is
      // the minimum set for Tasks 3-6 (walls/floor/shelves/furniture/
      // player) — add more `this.load.image(...)` calls here in later
      // tasks only if a specific new crop needs a sheet not listed yet.
      this.load.image('libAssetPack', '../../assets/images/ui/libassetpack-tiled.png');
      this.load.image('furniture03', '../../assets/images/ui/furniture03.png');
      this.load.image('topDownFurniture1', '../../assets/images/ui/TopDownHouse_FurnitureState1.png');
      loadCatSpritesheets(this); // copy this function verbatim from n5-phaser-game.js, Task 2 Step 3
    }

    create() {
      // Every property the shared LibrarySceneEngine (Task 1) reads
      // instead of N5's old module-level globals — must be set before
      // buildScene() calls wireInput()/refreshAllStates(), which are the
      // first engine methods to run.
      this.worldW = WORLD_W;
      this.worldH = WORLD_H;
      this.finalGateId = 'n4-boss-quiz';
      this.printerStationId = null;
      this.printLinksByShelf = {};
      this.allPrintLinks = {};
      this.lessonContent = LESSON_CONTENT; // Task 7
      this.quizGateKey = QUIZ_GATE_KEY;
      this.catColors = CAT_COLORS; // copied verbatim from N5, Task 2 Step 3
      this.talkColorPaths = TALK_COLOR_PATHS;
      this.senseiPortraitPaths = SENSEI_PORTRAIT_PATHS;
      this.extraRetroMenuOptions = undefined; // N4 has no shelf-08-style extra option this pass
      this.finalGateProceedLabel = 'Proceed to N3';
      this.onFinalGatePass = () => showToast('N3 is coming soon.');
      this.buildScene();
    }

    buildScene() {
      this.interactives = [];
      registerCatAnimations(this); // copied verbatim from N5, Task 2 Step 3 — idempotent, safe even though N4 is a separate Game instance
      this.progress = loadProgress();
      this.favorites = loadFavorites();
      this.lessonPage = loadLessonPage();
      this.furnitureSprites = {};
      this.buildFloor();
      this.buildWalls();
      this.buildTopBand();
      this.buildFurniture();
      this.buildShelves();
      this.buildBookPiles();
      this.buildPlayer();
      this.wireInput();
      this.refreshAllStates();
      ensureToast();
    }

    update() {
      // same movement/auto-walk update loop as LibraryScene.update() —
      // see Task 3, Step 3.
    }
  }
  Object.assign(N4LibraryScene.prototype, LibrarySceneEngine);

  const n4PhaserGame = new Phaser.Game({
    type: Phaser.AUTO,
    width: 768,
    height: 480,
    parent: /* same parent element id n5-phaser-game.js uses */,
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [N4LibraryScene],
    pixelArt: true,
  });
  window.__n4Game = n4PhaserGame;
  ```
  Read `n5-phaser-game.js`'s actual `new Phaser.Game({...})` block first and copy its exact config (parent element id, scale settings, any custom resolution handling mentioned in `CLAUDE.md`'s "game-resolution"/"zoom-fix" history) — do not invent different Phaser config than N5 uses, since the whole point is identical engine behavior.

- [ ] **Step 3: Persistence functions and shared cat-avatar data**

  N4 needs its own separate save data, not shared with N5 (per-floor `localStorage` keys, per `CLAUDE.md`'s "one key per concern" pattern). Add directly in `n4-phaser-game.js`:
  ```js
  const SAVE_KEY = 'nekoBunko.n4.progress';
  const FAVORITES_KEY = 'nekoBunko.n4.favorites';
  const LESSON_PAGE_KEY = 'nekoBunko.n4.lessonPage';
  const QUIZ_GATE_KEY = 'nekoBunko.n4.quizGate'; // passed as this.quizGateKey to the shared engine (Task 1) — load/save/status functions themselves now live in library-scene-shared.js, parameterized by this key

  function loadProgress() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }
  function saveProgress(progress) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
    } catch (e) {
      // localStorage unavailable — degrade to session-only, never throw.
    }
  }
  function loadFavorites() {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }
  function saveFavorites(favorites) {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      // localStorage unavailable — degrade to session-only.
    }
  }
  function loadLessonPage() {
    try {
      const raw = localStorage.getItem(LESSON_PAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }
  function saveLessonPage(lessonPage) {
    try {
      localStorage.setItem(LESSON_PAGE_KEY, JSON.stringify(lessonPage));
    } catch (e) {
      // localStorage unavailable — degrade to session-only.
    }
  }
  ```
  Also copy N5's `CAT_COLORS`, `TALK_COLOR_PATHS`, `SENSEI_PORTRAIT_PATHS`, `CAT_COLOR_KEY`, `getSavedCatColor`, `saveCatColor`, `CAT_SHEET_ROWS`, `loadCatSpritesheets`, `registerCatAnimations` objects/functions verbatim into `n4-phaser-game.js` (read them from `n5-phaser-game.js` first) — N4 reuses the exact same 3 cat avatars, animation rig, and sensei portrait, per the design spec's "no new art packs." Note `n4-dashboard.html` has no cat-select step in this pass (N4 is only reached by walking up from N5, which already asked once) — `buildPlayer()` (Task 3) should read the color N5 already saved via `getSavedCatColor()` directly, falling back to `'orange'` only as the defensive no-save-yet case, same as N5's own fallback comment explains.

- [ ] **Step 4: Verify**

  `node --check assets/js/n4-phaser-game.js`. Start the N4 dashboard on a fresh port, confirm the Phaser canvas boots with no console errors (it will render an empty/near-empty world at this stage — that's expected, later tasks add content).

---

### Task 3: N4 world geometry — floor, walls, player, camera, movement

**Files:**
- Modify: `assets/js/n4-phaser-game.js`

**Interfaces:**
- Consumes: `WORLD_W`, `WORLD_H`, `N4_PALETTE` from Task 2.
- Produces: `buildFloor()`, `buildWalls()`, `buildTopBand()`, `buildPlayer()`, full `update()` movement loop.

- [ ] **Step 1: Read `n5-phaser-game.js`'s `buildFloor()`, `buildWalls()`, `buildPlayer()`, and `update()` in full**

  These are the methods that actually define movement feel, collision setup, and camera-follow — the design spec requires them to behave identically on N4. Read each completely before writing N4's versions.

- [ ] **Step 2: Write N4's `buildFloor()`/`buildWalls()`**

  Copy the structure verbatim, swapping any N5-specific texture keys for N4-appropriate ones from the SAME source sheets (e.g. if N5's floor uses a warm-wood tile crop, N4 can reuse the identical crop — theme comes from furniture/accent color, not a different floor tile, since no new art packs are allowed and re-cropping the same tile sheet for a "different" floor texture that looks the same would be pointless). Outer walls sized to `WORLD_W`x`WORLD_H` instead of N5's dimensions. Keep the same `wallGroup`/static-body collision pattern.

- [ ] **Step 3: Write N4's `buildPlayer()` and `update()`**

  Copy verbatim from `LibraryScene`. `buildPlayer()`'s spawn point becomes N4's own entry point (south end, see Task 4's `LAYOUT.entryY`) instead of N5's `spawnY`. `this.cameras.main.startFollow(this.player, true, 0.09, 0.09)` — identical call, no fixed camera, confirming the Global Constraint. `update()`'s movement/auto-walk/proximity-glow logic is copied verbatim (it already only references `this.player`/`this.cursors`/`this.wasd`/`this.moveQueue`/`this.interactives`, all scene-local, no N5-specific module constants) except any direct `WORLD_W`/`WORLD_H` reference becomes `this.worldW`/`this.worldH` (set `this.worldH = WORLD_H;` alongside `this.worldW` in `create()`, Task 2).

- [ ] **Step 4: Write N4's `buildTopBand()` (the boss-quiz staircase)**

  Mirrors N5's `buildTopBand()` staircase-as-gate pattern: a solid architectural piece at the north end, non-dimmed when locked (same exemption reasoning as N5's `final-quiz`), that opens `openQuizGateMenu` with `entry.id = 'n4-boss-quiz'`, `entry.requires` = every N4 review pile id (`['n4-review-1','n4-review-2','n4-review-3','n4-review-4']`).

- [ ] **Step 5: Verify**

  `node --check`. Live-verify: player spawns at the south entry point, WASD/arrow movement works, camera follows smoothly with no fixed-camera regression, walls block movement at the world edges, the boss-quiz staircase is visible and un-dimmed at the north end (still locked/toast-only until Task 5's review piles exist).

---

### Task 4: N4 layout constants (`LAYOUT`)

**Files:**
- Modify: `assets/js/n4-phaser-game.js`

**Interfaces:**
- Produces: `const LAYOUT = { ... }` consumed by every later task (`buildShelves`, `buildFurniture`, `buildBookPiles`).

- [ ] **Step 1: Define `LAYOUT`**

  ```js
  // North (top) = deeper into the building, toward the boss-quiz gate.
  // South (bottom) = arrival point from N5's staircase. Mirrors N5's own
  // spawn-south / stairs-north shape (see LAYOUT's doc comment in
  // n5-phaser-game.js) at N4's larger scale. Y values are a first pass —
  // expect to retune them live against actual rendered shelf/furniture
  // sizes, exactly as every N5 row/gap constant was tuned over many
  // rounds (see that file's own comments for precedent) — this is normal
  // for this codebase, not a gap in this plan.
  const shelfW = 87; // same "big furniture" reference size N5 uses
  const shelfH = 64;
  const leftColX = [64, 64 + shelfW + 20];
  const rightColX = [WORLD_W - 64 - shelfW * 2 - 20, WORLD_W - 64 - shelfW];

  const bossQuizY = 220;
  const conversationRowY = 480;
  const conversationReviewY = 660;
  const readingRowY = 900;
  const readingReviewY = 1080;
  const wingTransitionY = 1260; // visual-only breathing room between the two wing pairs
  const vocabRowY = 1500;
  const vocabReviewY = 1680;
  const grammarRowY = 1920;
  const grammarReviewY = 2100;
  const centerpieceY = 2340; // N4's globe-equivalent decorative landmark
  const entryY = 2680; // player spawn / arrival from N5

  const LAYOUT = {
    shelfW, shelfH, leftColX, rightColX,
    bossQuizY, conversationRowY, conversationReviewY,
    readingRowY, readingReviewY, wingTransitionY,
    vocabRowY, vocabReviewY, grammarRowY, grammarReviewY,
    centerpieceY, entryY,
  };
  ```

- [ ] **Step 2: Verify**

  `node --check`. No live check needed yet (pure data) — Task 5 exercises these values.

---

### Task 5: N4 progression data — `LESSON_DATA`, `SHELF_PREREQ`, `BOOK_PILE_DATA`

**Files:**
- Modify: `assets/js/n4-phaser-game.js`

**Interfaces:**
- Produces: `LESSON_DATA` (16 entries), `SHELF_PREREQ`, `BOOK_PILE_DATA` (4 entries) — same shapes as N5's, consumed by `buildShelves()`/`buildBookPiles()` in Task 6.

- [ ] **Step 1: Write `LESSON_DATA`**

  ```js
  // Illustrative N4 topic names approved in the design mockup — real
  // grammar points, but only n4-shelf-01/09/13 (the flagships) get full
  // lesson content this pass; the rest get a placeholder page (Task 7).
  const LESSON_DATA = [
    { id: 'n4-shelf-01', title: 'て-form Requests & Permission' },
    { id: 'n4-shelf-02', title: 'Potential Form' },
    { id: 'n4-shelf-03', title: 'Conditionals (と・ば・たら・なら)' },
    { id: 'n4-shelf-04', title: 'Volitional & Intention' },
    { id: 'n4-shelf-05', title: 'Giving & Receiving' },
    { id: 'n4-shelf-06', title: 'Comparisons' },
    { id: 'n4-shelf-07', title: 'Passive & Causative Verbs' },
    { id: 'n4-shelf-08', title: 'Adjective + なる・する' },
    { id: 'n4-shelf-09', title: 'Reading Short Passages' },
    { id: 'n4-shelf-10', title: 'Listening Comprehension' },
    { id: 'n4-shelf-11', title: 'Quotation & Hearsay' },
    { id: 'n4-shelf-12', title: 'Extended Predicates (んです)' },
    { id: 'n4-shelf-13', title: 'Keigo Basics' },
    { id: 'n4-shelf-14', title: 'Making Suggestions' },
    { id: 'n4-shelf-15', title: 'Ability & Experience' },
    { id: 'n4-shelf-16', title: 'Conversation Practice' },
  ];
  ```

- [ ] **Step 2: Write `SHELF_PREREQ`**

  ```js
  // Each wing gates its first shelf on the PREVIOUS wing's review pile
  // (n4-shelf-01 is always available — it's the floor's entry point),
  // same "review gates every 4" shape as N5.
  const SHELF_PREREQ = {
    'n4-shelf-01': null,
    'n4-shelf-02': 'n4-shelf-01', 'n4-shelf-03': 'n4-shelf-02', 'n4-shelf-04': 'n4-shelf-03',
    'n4-shelf-05': 'n4-review-1',
    'n4-shelf-06': 'n4-shelf-05', 'n4-shelf-07': 'n4-shelf-06', 'n4-shelf-08': 'n4-shelf-07',
    'n4-shelf-09': 'n4-review-2',
    'n4-shelf-10': 'n4-shelf-09', 'n4-shelf-11': 'n4-shelf-10', 'n4-shelf-12': 'n4-shelf-11',
    'n4-shelf-13': 'n4-review-3',
    'n4-shelf-14': 'n4-shelf-13', 'n4-shelf-15': 'n4-shelf-14', 'n4-shelf-16': 'n4-shelf-15',
  };
  ```

- [ ] **Step 3: Write `BOOK_PILE_DATA`**

  ```js
  const BOOK_PILE_DATA = [
    { id: 'n4-review-1', title: 'N4 Grammar Review', requires: ['n4-shelf-01', 'n4-shelf-02', 'n4-shelf-03', 'n4-shelf-04'] },
    { id: 'n4-review-2', title: 'N4 Vocabulary Review', requires: ['n4-shelf-05', 'n4-shelf-06', 'n4-shelf-07', 'n4-shelf-08'] },
    { id: 'n4-review-3', title: 'Reading & Listening Review', requires: ['n4-shelf-09', 'n4-shelf-10', 'n4-shelf-11', 'n4-shelf-12'] },
    { id: 'n4-review-4', title: 'Conversation & Practice Review', requires: ['n4-shelf-13', 'n4-shelf-14', 'n4-shelf-15', 'n4-shelf-16'] },
  ];
  ```
  Note: the design's wing order (Grammar first, nearest the entry) means `n4-review-1` through `n4-review-4` go grammar → vocabulary → reading&listening → conversation&practice, matching `SHELF_PREREQ`'s gating order above — opposite of the mockup's north-to-south drawing order (which showed conversation at the top/deepest point). Grammar is nearest the entry (south), Conversation & Practice is nearest the boss-quiz gate (north).

- [ ] **Step 4: Verify**

  `node --check`. No live check yet — Task 6 wires these into actual sprites.

---

### Task 6: N4 shelves, review piles, and furniture placement

**Files:**
- Modify: `assets/js/n4-phaser-game.js`

**Interfaces:**
- Consumes: `LAYOUT` (Task 4), `LESSON_DATA`/`SHELF_PREREQ`/`BOOK_PILE_DATA` (Task 5).
- Produces: `buildShelves()`, `buildBookPiles()`, `buildFurniture()` (wing decor + centerpiece + N4 palette application).

- [ ] **Step 1: Read `n5-phaser-game.js`'s `buildShelves()` and `buildBookPiles()` in full**

  These already read `LESSON_DATA`/`SHELF_PREREQ`/`BOOK_PILE_DATA`/`LAYOUT` generically (no N5-specific hardcoded shelf ids in the loop bodies themselves, per that file's own "Matches LESSON_DATA's order exactly" comment on the `positions` array) — confirm this by reading them, then adapt only the `positions` array to N4's simpler 1-row-per-wing shape instead of N5's 2-row-per-zone shape:
  ```js
  // 4 wings, 1 row each (was N5's 2 rows per zone) — matches the
  // approved mockup's "13-14 / 15-16 side by side" shelf-pair shape.
  const positions = [
    [LAYOUT.leftColX[0], LAYOUT.grammarRowY], [LAYOUT.leftColX[1], LAYOUT.grammarRowY],
    [LAYOUT.rightColX[0], LAYOUT.grammarRowY], [LAYOUT.rightColX[1], LAYOUT.grammarRowY],
    [LAYOUT.leftColX[0], LAYOUT.vocabRowY], [LAYOUT.leftColX[1], LAYOUT.vocabRowY],
    [LAYOUT.rightColX[0], LAYOUT.vocabRowY], [LAYOUT.rightColX[1], LAYOUT.vocabRowY],
    [LAYOUT.leftColX[0], LAYOUT.readingRowY], [LAYOUT.leftColX[1], LAYOUT.readingRowY],
    [LAYOUT.rightColX[0], LAYOUT.readingRowY], [LAYOUT.rightColX[1], LAYOUT.readingRowY],
    [LAYOUT.leftColX[0], LAYOUT.conversationRowY], [LAYOUT.leftColX[1], LAYOUT.conversationRowY],
    [LAYOUT.rightColX[0], LAYOUT.conversationRowY], [LAYOUT.rightColX[1], LAYOUT.conversationRowY],
  ];
  ```
  Everything else in `buildShelves()` (wall-header-per-column, shelf sprite/lock/glow/stamp construction, non-solid collision reasoning) copies verbatim.

- [ ] **Step 2: Adapt `buildBookPiles()`**

  Copy verbatim; review pile positions become one per wing row (beside that wing's own row, left/right split matching `n5-review-1`/`n5-review-2`'s "one per side" pattern), using `LAYOUT.grammarReviewY`/`vocabReviewY`/`readingReviewY`/`conversationReviewY`.

- [ ] **Step 3: Write N4's `buildFurniture()`**

  Denser than N5's per the design spec, but built from the SAME crop/placement helpers (`cropToTexture`, `drawWovenRug`, the `addTableWithChairs`-style pattern from N5's `buildFurniture` — copy that helper's shape, it's generic). Concretely, for this first pass:
  - A woven-rug corridor down the center, same technique as N5's, recolored via `drawWovenRug`'s new `palette` param (Task 1):
    ```js
    const n4RugPalette = {
      rugDark: 0x2a0d1a, rugFringeLight: 0x3a1526, rugBase: 0x5c1a2e,
      rugWeave: 0x4a1524, rugMotif: 0xd4a24c, rugMotifShade: 0xa87f3a,
    };
    drawWovenRug(this, 'n4CorridorRugTex', corridorWidth, corridorRugRepeatH, n4RugPalette);
    ```
  - One centerpiece decorative prop at `LAYOUT.centerpieceY` (N4's globe-equivalent landmark — reuse an existing uncropped prop from the same sheets, e.g. a large bookstand or reading-lectern crop, verified via the same per-pixel crop process as every other asset this project has added).
  - Reception-style desk clutter is NOT required at N4's entry (N4 has no "Neko-sensei" desk in this pass — out of scope, matches the design spec's placeholder-first approach) — the entry point (`LAYOUT.entryY`) can be a plain arrival rug/marker instead.

- [ ] **Step 4: Verify**

  `node --check`. Live-verify: all 16 shelves render (locked-state dimmed except `n4-shelf-01`), all 4 review piles render, clicking each opens the interaction system correctly (still placeholder/no-content behavior until Task 7 — `openRetroMenu`'s `hasContent` check will currently be false for every `n4-shelf-*`/`n4-review-*` id, so they'll show the old instant-complete menu; that's expected until Task 7 adds `LESSON_CONTENT`). Confirm no wall/collision overlaps anywhere on the new, larger map (check every shelf/pile bounds against `wallGroup`/`solidGroup`, same method used throughout this session).

---

### Task 7: N4 lesson content — flagships + placeholders

**Files:**
- Modify: `assets/js/n4-phaser-game.js`

**Interfaces:**
- Produces: `const LESSON_CONTENT = { ... }` with 19 keys (16 shelves + ... actually 16 shelves + 4 review piles = 20 keys, `n4-boss-quiz` stays content-less/toast-only per the design spec).
- Consumes: `LibrarySceneEngine.startLesson`/`openRetroMenu` (Task 1) — no changes needed there, they already key off `LESSON_CONTENT[entry.id]` generically.

- [ ] **Step 1: Write the placeholder-lesson helper**

  ```js
  // One-page placeholder for shelves not getting full content this pass
  // — still real LESSON_CONTENT (marks progress, unlocks the next shelf),
  // just short. title/kanaHint are used verbatim, no re-authoring per
  // shelf beyond what's already in LESSON_DATA.
  function buildPlaceholderLesson(title) {
    return [{
      type: 'grammar-intro',
      sectionLabel: title,
      bigIdea: `${title} is on its way — a full lesson isn't written yet.`,
      explain: [
        'This shelf is part of the N4 floor\'s layout, but its lesson content is still being written. Completing this page marks it done for now, and you can revisit it any time once the real lesson ships.',
      ],
    }];
  }
  ```

- [ ] **Step 2: Write `LESSON_CONTENT`, filling all 13 non-flagship shelves via the helper**

  ```js
  const LESSON_CONTENT = {
    'n4-shelf-02': buildPlaceholderLesson('Potential Form'),
    'n4-shelf-03': buildPlaceholderLesson('Conditionals (と・ば・たら・なら)'),
    'n4-shelf-04': buildPlaceholderLesson('Volitional & Intention'),
    'n4-shelf-05': buildPlaceholderLesson('Giving & Receiving'),
    'n4-shelf-06': buildPlaceholderLesson('Comparisons'),
    'n4-shelf-07': buildPlaceholderLesson('Passive & Causative Verbs'),
    'n4-shelf-08': buildPlaceholderLesson('Adjective + なる・する'),
    'n4-shelf-10': buildPlaceholderLesson('Listening Comprehension'),
    'n4-shelf-11': buildPlaceholderLesson('Quotation & Hearsay'),
    'n4-shelf-12': buildPlaceholderLesson('Extended Predicates (んです)'),
    'n4-shelf-14': buildPlaceholderLesson('Making Suggestions'),
    'n4-shelf-15': buildPlaceholderLesson('Ability & Experience'),
    'n4-shelf-16': buildPlaceholderLesson('Conversation Practice'),
    'n4-review-1': buildPlaceholderLesson('N4 Grammar Review'),
    'n4-review-2': buildPlaceholderLesson('N4 Vocabulary Review'),
    'n4-review-3': buildPlaceholderLesson('Reading & Listening Review'),
    'n4-review-4': buildPlaceholderLesson('Conversation & Practice Review'),
    'n4-shelf-01': [ /* Step 3 */ ],
    'n4-shelf-09': [ /* Step 4 */ ],
    'n4-shelf-13': [ /* Step 5 */ ],
  };
  ```

- [ ] **Step 3: Author `n4-shelf-01` — "て-form Requests & Permission" (flagship, full content)**

  ```js
  'n4-shelf-01': [
    {
      type: 'grammar-intro',
      sectionLabel: 'て-form Requests & Permission',
      recapChips: ['て-form itself (N5, shelf 13)'],
      bigIdea: 'You already know て-form as a connector. N4 adds two new jobs for it: asking permission, and granting or denying it.',
      explain: [
        'Two new patterns this shelf: [て-form] + もいいです (\"you may...\") and [て-form] + はいけません (\"you must not...\"). Both attach to the exact same て-form you already built back in N5.',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜てもいいです: "You may..."',
      pattern: [
        { text: '[て-form]', role: 'subject' }, { text: 'もいいです', role: 'predicate' },
      ],
      explain: ['Grants permission — literally "even if you do [X], it\'s fine."'],
      samples: [
        {
          tag: '"You may go home."',
          tiles: [
            { text: '帰っても', role: 'subject', gloss: 'even if you go home', isNew: true, smallGloss: true },
            { text: 'いいです', role: 'predicate', gloss: 'it\'s fine' },
          ],
          translation: 'Kaettemo ii desu.',
        },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜てはいけません: "You must not..."',
      pattern: [
        { text: '[て-form]', role: 'subject' }, { text: 'はいけません', role: 'predicate' },
      ],
      explain: ['Denies permission — "as for doing [X], it won\'t do."'],
      samples: [
        {
          tag: '"You must not eat here."',
          tiles: [
            { text: 'ここで', role: 'subject', gloss: 'here' },
            { text: '食べては', role: 'predicate', gloss: 'as for eating', isNew: true, smallGloss: true },
            { text: 'いけません', role: 'predicate', gloss: 'won\'t do' },
          ],
          translation: 'Koko de tabete wa ikemasen.',
        },
      ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "You may sit" (sit = 座って):',
      before: '', after: '。',
      choices: ['座ってもいいです', '座ってはいけません', '座ります'],
      answer: '座ってもいいです',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "You must not write here" (here = ここで, write = 書いて):',
      before: '', after: '。',
      choices: ['ここで書いてはいけません', 'ここで書いてもいいです', 'ここで書きます'],
      answer: 'ここで書いてはいけません',
    },
    {
      type: 'summary',
      title: 'New Patterns: Permission',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: '〜てもいいです', romaji: '~temo ii desu', meaning: 'you may...' },
        { kana: '〜てはいけません', romaji: '~tewa ikemasen', meaning: 'you must not...' },
        { kana: '帰ってもいいです', romaji: 'kaettemo ii desu', meaning: 'you may go home' },
        { kana: '食べてはいけません', romaji: 'tabetewa ikemasen', meaning: 'you must not eat' },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '座って', after: '。', answer: 'もいいです', hint: '"You may sit."' },
        { before: 'ここで書いて', after: '。', answer: 'はいけません', hint: '"You must not write here."' },
      ],
    },
  ],
  ```

- [ ] **Step 4: Author `n4-shelf-09` — "Reading Short Passages" (flagship, full content)**

  ```js
  'n4-shelf-09': [
    {
      type: 'grammar-intro',
      sectionLabel: 'Reading Short Passages',
      bigIdea: 'N4 reading means short, connected passages instead of single sentences — the same grammar you know, just longer.',
      explain: [
        'This shelf walks through one short passage line by line, then checks comprehension — no new grammar, just practice reading connected text.',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Passage',
      explain: [
        '私は毎日図書館で本を読みます。今日は静かだから、たくさん読みました。 ("I read books at the library every day. Today it was quiet, so I read a lot.")',
      ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Comprehension check',
      prompt: 'Where does the narrator read every day?',
      before: '', after: '',
      choices: ['図書館', '学校', '公園'],
      answer: '図書館',
    },
    {
      type: 'try-it',
      sectionLabel: 'Comprehension check',
      prompt: 'Why did the narrator read a lot today?',
      before: '', after: '',
      choices: ['静かだったから', '楽しかったから', '友達が来たから'],
      answer: '静かだったから',
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in the blank from the passage above.',
      questions: [
        { before: '私は毎日図書館で本を', after: '。', answer: '読みます', hint: '"I read books every day."' },
      ],
    },
  ],
  ```

- [ ] **Step 5: Author `n4-shelf-13` — "Keigo Basics" (flagship, full content)**

  ```js
  'n4-shelf-13': [
    {
      type: 'grammar-intro',
      sectionLabel: 'Keigo Basics',
      bigIdea: 'Keigo (敬語) is respectful language — a different register, not different grammar rules.',
      explain: [
        'This shelf covers just the most common polite swap: いらっしゃいます replaces います/来ます/行きます when talking ABOUT someone you\'re being respectful toward (a teacher, a customer, a boss).',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'いらっしゃいます',
      pattern: [
        { text: '[respected person]は', role: 'subject' }, { text: 'いらっしゃいます', role: 'predicate' },
      ],
      explain: ['One word covers "is here," "is coming," and "is going" — context tells you which.'],
      samples: [
        {
          tag: '"The teacher is here."',
          tiles: [
            { text: '先生は', role: 'subject', gloss: 'teacher' },
            { text: 'いらっしゃいます', role: 'predicate', gloss: 'is here (respectful)', isNew: true },
          ],
          translation: 'Sensei wa irasshaimasu.',
        },
      ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "The teacher is here" respectfully (teacher = 先生):',
      before: '先生は', after: '。',
      choices: ['いらっしゃいます', 'います', '行きます'],
      answer: 'いらっしゃいます',
    },
    {
      type: 'summary',
      title: 'New Patterns: Keigo Basics',
      headers: ['Word', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'いらっしゃいます', romaji: 'irasshaimasu', meaning: 'is / comes / goes (respectful)' },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in the blank.',
      questions: [
        { before: '先生は', after: '。', answer: 'いらっしゃいます', hint: '"The teacher is here." (respectful)' },
      ],
    },
  ],
  ```

- [ ] **Step 6: Verify**

  `node --check`. Live-verify: open all 3 flagship shelves end to end (every page renders, no "undefined", try-it/quiz-fill grade correctly), open 2-3 placeholder shelves (single page, marks progress, unlocks the next shelf), open all 4 review piles (placeholder content for now — fine, matches this pass's scope).

---

### Task 8: N5 → N4 transition wiring

**Files:**
- Modify: `assets/js/n5-phaser-game.js`

**Interfaces:**
- Consumes: `this.onFinalGatePass` (set in Task 1, Step 4).

- [ ] **Step 1: Replace the stub navigation**

  In `LibraryScene.create()`/`buildScene()` (wherever Task 1 set `this.onFinalGatePass`), change it from the toast-only stub to:
  ```js
  this.onFinalGatePass = () => {
    showToast('Climbing to the second floor…');
    setTimeout(() => { window.location.href = '../N4/n4-dashboard.html'; }, 900);
  };
  ```
  The `setTimeout` gives the toast (and, per the design spec, the existing `assets/css/teleport.css` transition if it's reused here) time to actually be seen before the page navigates away — read `teleport.css`/wherever it's invoked first to confirm the right hook and duration instead of guessing 900ms blind.

- [ ] **Step 2: Verify**

  `node --check`. Live-verify on a fresh port: complete N5's final quiz gate (or force `progress` state via the console, same technique used throughout this session), click "Proceed to N4," confirm the browser actually navigates to `pages/N4/n4-dashboard.html` and N4 boots correctly from a cold load.

---

### Task 9: Full end-to-end verification pass

**Files:** none (verification only).

- [ ] **Step 1: N5 regression check** — every shelf, review pile, printer station, TV, reception sensei, and the staircase still behave exactly as before Task 1's extraction.
- [ ] **Step 2: N4 full walkthrough** — from a cold load of `n4-dashboard.html`: player spawns at the entry point, can walk to and open all 16 shelves (respecting lock order), all 4 review piles, the boss-quiz gate (locked until all 4 reviews done, then shows the "N3 is coming soon" stub). No wall/collision overlaps anywhere on the map. No console errors at any point.
- [ ] **Step 3: Cross-floor check** — N5's localStorage keys (`nekoBunko.n5.*`) and N4's (`nekoBunko.n4.*`) don't collide; clearing one floor's progress doesn't affect the other's.
