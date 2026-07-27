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
- N4's world: `TILE_SIZE = 16`, `GRID_COLS = 72`, `GRID_ROWS = 130` → `WORLD_W = 1152`, `WORLD_H = 2080` (revised down from an original 180-row estimate once the floor's split-column redesign needed only 2 physical shelf-rows instead of 4 — see Task 4). Camera-follow, no fixed camera, no shrinking — same as N5.
- N4 palette accents (from the approved mockup): deep wine `#5c1a2e` (carpet), forest green `#1f3d2b` (accent), dark wood `#3a2415`, richer amber `#d4a24c` (gold accent, replaces N5's `#F0C674` where N4 draws its own canvas textures).
- **Revised per explicit follow-up feedback:** this floor is split down the middle, not entirely N4. Left column = N4 (8 shelves, 2 wings, 2 review piles). Right column = N3 (8 shelves, 2 wings, 2 review piles) — genuinely locked (not just dimmed) behind a real **exam gate** until both N4 review piles are complete. 16 shelves total, same as the original plan, now split 8/8 across two JLPT levels instead of 16 on one. There is no "boss quiz stubbed to N3 coming soon" anymore — N3 IS the real content this pass; a further stub (N3 -> N2) is deferred, out of scope, see the spec's Out of Scope section.
- Flagship shelves with full content: `n4-shelf-01`, `n4-shelf-05` (one per N4 wing), `n3-shelf-01` (proves the gated side works identically). All other shelves get a single-page placeholder lesson (real `LESSON_CONTENT`, marks progress, just short).
- Shelf/pile ids are prefixed `n4-`/`n3-` (e.g. `n4-shelf-01`, `n4-review-1`, `n3-shelf-01`, `n3-exam-gate`) so they can never collide with N5's `localStorage` progress keys if floors' saves are ever merged later.

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

  // Quiz-gate (staircase/exam-gate attempt/cooldown) persistence —
  // generalized to take the floor's own localStorage key instead of N5's
  // hardcoded QUIZ_GATE_KEY, so N4's exam gate can reuse this unchanged
  // with its own key instead of a duplicated copy.
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
  const GRID_ROWS = 130; // revised down from 180 — see Task 4 (only 2 physical shelf-rows needed, not 4)
  const WORLD_W = GRID_COLS * TILE_SIZE; // 1152
  const WORLD_H = GRID_ROWS * TILE_SIZE; // 2080

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
      // This floor's one quiz-gate-mechanic entry (3-attempt/24h-cooldown,
      // same as N5's staircase) is the N4->N3 exam gate, NOT a north-wall
      // staircase (there's no further N2 stub built this pass — see the
      // design spec's Out of Scope). Passing it just unlocks the N3
      // column in place (n3-shelf-01's SHELF_PREREQ points at this id) —
      // no page navigation needed, so onFinalGatePass is just a toast.
      this.finalGateId = 'n3-exam-gate';
      this.printerStationId = null;
      this.printLinksByShelf = {};
      this.allPrintLinks = {};
      this.lessonContent = LESSON_CONTENT; // Task 7
      this.quizGateKey = QUIZ_GATE_KEY;
      this.catColors = CAT_COLORS; // copied verbatim from N5, Task 2 Step 3
      this.talkColorPaths = TALK_COLOR_PATHS;
      this.senseiPortraitPaths = SENSEI_PORTRAIT_PATHS;
      this.extraRetroMenuOptions = undefined; // N4 has no shelf-08-style extra option this pass
      this.finalGateProceedLabel = 'Continue';
      this.onFinalGatePass = () => showToast('The N3 wing is now unlocked!');
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
      this.buildExamGate(); // Task 6 — the one interactive N5 has no equivalent of
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

- [ ] **Step 4: Write N4's `buildTopBand()` (plain wall, no gate this pass)**

  Unlike N5, this floor's real gate (the N4->N3 exam gate) sits in the middle of the map, not at the north end (see Task 6) — a further "N3 -> N2" gate is explicitly out of scope this pass (per the design spec). So `buildTopBand()` here is simpler than N5's: just the solid north wall/architectural cap (reuse `drawWallHeaderTexture`/the wall-collision-rectangle pattern), no interactive staircase object at all.

- [ ] **Step 5: Verify**

  `node --check`. Live-verify: player spawns at the south entry point, WASD/arrow movement works, camera follows smoothly with no fixed-camera regression, walls block movement at every world edge including the plain north wall.

---

### Task 4: N4 layout constants (`LAYOUT`)

**Files:**
- Modify: `assets/js/n4-phaser-game.js`

**Interfaces:**
- Produces: `const LAYOUT = { ... }` consumed by every later task (`buildShelves`, `buildFurniture`, `buildBookPiles`).

- [ ] **Step 1: Define `LAYOUT`**

  **Revised per explicit follow-up feedback** (split floor, not 4 stacked all-N4 wings): the left column carries N4 shelves throughout, the right column carries N3 shelves throughout, in the SAME 2 physical rows — so only 2 shelf-rows are needed total (N4 Grammar Foundations + N3 Grammar Expansion share row 1; N4 Vocabulary & Usage + N3 Nuance & Conversation share row 2), each with its own review-pile row below it. The exam gate sits in the center corridor between the two columns, at its own row.

  ```js
  // North (top) = deeper into the building, toward a future N2 stub (not
  // built this pass). South (bottom) = arrival point from N5's
  // staircase. Mirrors N5's own spawn-south / stairs-north shape (see
  // LAYOUT's doc comment in n5-phaser-game.js) at N4/N3's larger scale.
  // leftColX = N4 shelves throughout every row; rightColX = N3 shelves
  // throughout every row (not arbitrary sub-columns of one topic, like
  // N5's shape — a real per-side split, per explicit feedback). Y values
  // are a first pass — expect to retune them live against actual
  // rendered shelf/furniture sizes, exactly as every N5 row/gap constant
  // was tuned over many rounds (see that file's own comments for
  // precedent) — this is normal for this codebase, not a gap in this plan.
  const shelfW = 87; // same "big furniture" reference size N5 uses
  const shelfH = 64;
  const leftColX = [64, 64 + shelfW + 20]; // N4, always
  const rightColX = [WORLD_W - 64 - shelfW * 2 - 20, WORLD_W - 64 - shelfW]; // N3, always

  // Smaller Y = further north (deeper in). N3's shelves sit in the SAME
  // 2 rows as N4's (just the right column) — visible-but-locked the
  // whole time, same as seeing a locked door before you have the key.
  // The exam gate itself is the northmost interactive, the last
  // checkpoint before the plain north wall, reached only after both N4
  // reviews (which are further south/closer to entry) are done.
  const examGateY = 420; // center corridor, north-most interactive
  const review2Y = 600; // N4 review-2 (left) / N3 review-2 (right)
  const row2Y = 780; // N4 Vocabulary & Usage (left) / N3 Nuance & Conversation (right)
  const review1Y = 960; // N4 review-1 (left) / N3 review-1 (right)
  const row1Y = 1140; // N4 Grammar Foundations (left) / N3 Grammar Expansion (right) — nearest entry
  const centerpieceY = 1360; // N4/N3's globe-equivalent decorative landmark
  const entryY = 1560; // player spawn / arrival from N5, south-most

  const LAYOUT = {
    shelfW, shelfH, leftColX, rightColX,
    row1Y, review1Y, examGateY, row2Y, review2Y,
    centerpieceY, entryY,
  };
  ```
  Note this shrinks `GRID_ROWS` from Task 2's original placeholder estimate (180) down to something closer to N5's own 149 — recompute `GRID_ROWS` in `n4-phaser-game.js` so `WORLD_H` comfortably fits `entryY` plus south margin (e.g. `GRID_ROWS = 130` → `WORLD_H = 2080`; adjust `entryY` above if it doesn't, verify live in Task 3/6 rather than trusting the arithmetic blind).

- [ ] **Step 2: Verify**

  `node --check`. No live check needed yet (pure data) — Task 5/6 exercise these values.

---

### Task 5: N4 progression data — `LESSON_DATA`, `SHELF_PREREQ`, `BOOK_PILE_DATA`

**Files:**
- Modify: `assets/js/n4-phaser-game.js`

**Interfaces:**
- Produces: `LESSON_DATA` (16 entries), `SHELF_PREREQ`, `BOOK_PILE_DATA` (4 entries) — same shapes as N5's, consumed by `buildShelves()`/`buildBookPiles()` in Task 6.

**Revised per explicit follow-up feedback:** 8 N4 shelves (left column) + 8 N3 shelves (right column) = 16 total, instead of 16 all-N4. A real exam gate (`n3-exam-gate`) sits between them — every N3 shelf's prereq chain roots on it instead of `null`.

- [ ] **Step 1: Write `LESSON_DATA`**

  ```js
  // Illustrative topic names approved in the design mockup — real N4/N3
  // grammar points, but only n4-shelf-01/n4-shelf-05/n3-shelf-01 (the
  // flagships) get full lesson content this pass; the rest get a
  // placeholder page (Task 7).
  const LESSON_DATA = [
    // N4 side (left column) — Grammar Foundations wing.
    { id: 'n4-shelf-01', title: 'て-form Requests & Permission' },
    { id: 'n4-shelf-02', title: 'Potential Form' },
    { id: 'n4-shelf-03', title: 'Conditionals (と・ば・たら・なら)' },
    { id: 'n4-shelf-04', title: 'Volitional & Intention' },
    // N4 side (left column) — Vocabulary & Usage wing.
    { id: 'n4-shelf-05', title: 'Giving & Receiving' },
    { id: 'n4-shelf-06', title: 'Comparisons' },
    { id: 'n4-shelf-07', title: 'Passive & Causative Verbs' },
    { id: 'n4-shelf-08', title: 'Adjective + なる・する' },
    // N3 side (right column) — Grammar Expansion wing. Locked behind
    // n3-exam-gate until both N4 review piles are complete.
    { id: 'n3-shelf-01', title: '〜ておく・〜てしまう' },
    { id: 'n3-shelf-02', title: 'Causative-Passive' },
    { id: 'n3-shelf-03', title: 'Conjecture & Hearsay (そうだ・ようだ・らしい)' },
    { id: 'n3-shelf-04', title: 'Relative Clauses & Complex Modification' },
    // N3 side (right column) — Nuance & Conversation wing.
    { id: 'n3-shelf-05', title: 'Formal Written Style (である体)' },
    { id: 'n3-shelf-06', title: 'Advanced Keigo' },
    { id: 'n3-shelf-07', title: 'Conjunction Nuances (ものの・くせに・というより)' },
    { id: 'n3-shelf-08', title: 'Extended Reading Practice' },
  ];
  ```

- [ ] **Step 2: Write `SHELF_PREREQ`**

  ```js
  // N4 chain (left column) — n4-shelf-01 is always available, it's the
  // floor's entry point. N3 chain (right column) — n3-shelf-01's prereq
  // is the exam gate itself (not null), so the ENTIRE right column stays
  // locked until it's passed; the rest of the N3 chain then works exactly
  // like N4's own internal chaining.
  const SHELF_PREREQ = {
    'n4-shelf-01': null,
    'n4-shelf-02': 'n4-shelf-01', 'n4-shelf-03': 'n4-shelf-02', 'n4-shelf-04': 'n4-shelf-03',
    'n4-shelf-05': 'n4-review-1',
    'n4-shelf-06': 'n4-shelf-05', 'n4-shelf-07': 'n4-shelf-06', 'n4-shelf-08': 'n4-shelf-07',
    'n3-shelf-01': 'n3-exam-gate',
    'n3-shelf-02': 'n3-shelf-01', 'n3-shelf-03': 'n3-shelf-02', 'n3-shelf-04': 'n3-shelf-03',
    'n3-shelf-05': 'n3-review-1',
    'n3-shelf-06': 'n3-shelf-05', 'n3-shelf-07': 'n3-shelf-06', 'n3-shelf-08': 'n3-shelf-07',
  };
  ```

- [ ] **Step 3: Write `BOOK_PILE_DATA`**

  ```js
  const BOOK_PILE_DATA = [
    { id: 'n4-review-1', title: 'N4 Grammar Foundations Review', requires: ['n4-shelf-01', 'n4-shelf-02', 'n4-shelf-03', 'n4-shelf-04'] },
    { id: 'n4-review-2', title: 'N4 Vocabulary & Usage Review', requires: ['n4-shelf-05', 'n4-shelf-06', 'n4-shelf-07', 'n4-shelf-08'] },
    { id: 'n3-review-1', title: 'N3 Grammar Expansion Review', requires: ['n3-shelf-01', 'n3-shelf-02', 'n3-shelf-03', 'n3-shelf-04'] },
    { id: 'n3-review-2', title: 'N3 Nuance & Conversation Review', requires: ['n3-shelf-05', 'n3-shelf-06', 'n3-shelf-07', 'n3-shelf-08'] },
  ];
  ```

- [ ] **Step 4: Write the exam gate entry**

  This is NOT a `BOOK_PILE_DATA` entry (it doesn't use the review-pile "recap + quiz" content shape) — it reuses the SAME quiz-gate mechanic N5's own staircase already has (3-attempt/24h-cooldown, `openQuizGateMenu`/`openQuizAttemptMenu`/`resolveQuizAttempt`, all already generalized in the shared engine from Task 1). Define it as its own small object, built into a physical `kind: 'pile'`-shaped interactive in Task 6 (it needs `id`, `title`, `requires`, exactly like a review pile does, for `openInteraction`'s generic locked/available/completed check to work):
  ```js
  const EXAM_GATE_DATA = { id: 'n3-exam-gate', title: 'N3 Entrance Exam', requires: ['n4-review-1', 'n4-review-2'] };
  ```

- [ ] **Step 5: Verify**

  `node --check`. No live check yet — Task 6 wires these into actual sprites.

---

### Task 6: N4 shelves, review piles, and furniture placement

**Files:**
- Modify: `assets/js/n4-phaser-game.js`

**Interfaces:**
- Consumes: `LAYOUT` (Task 4), `LESSON_DATA`/`SHELF_PREREQ`/`BOOK_PILE_DATA`/`EXAM_GATE_DATA` (Task 5).
- Produces: `buildShelves()`, `buildBookPiles()`, `buildExamGate()`, `buildFurniture()` (wing decor + centerpiece + N4/N3 palette application).

- [ ] **Step 1: Read `n5-phaser-game.js`'s `buildShelves()` and `buildBookPiles()` in full**

  These already read `LESSON_DATA`/`SHELF_PREREQ`/`BOOK_PILE_DATA`/`LAYOUT` generically (no N5-specific hardcoded shelf ids in the loop bodies themselves, per that file's own "Matches LESSON_DATA's order exactly" comment on the `positions` array) — confirm this by reading them, then adapt only the `positions` array. **Revised per explicit follow-up feedback:** the left column is N4 throughout, the right column is N3 throughout, across just 2 physical rows (not N5's 2-rows-per-zone/4-rows-total shape) — matches `LESSON_DATA`'s order exactly (N4 shelves 1-8 first, then N3 shelves 1-8):
  ```js
  // Row 1: N4 Grammar Foundations (left) / N3 Grammar Expansion (right).
  // Row 2: N4 Vocabulary & Usage (left) / N3 Nuance & Conversation (right).
  // LESSON_DATA order is n4-shelf-01..08 then n3-shelf-01..08 — positions
  // below must match that exactly (buildShelves zips LESSON_DATA[i] with
  // positions[i]).
  const positions = [
    [LAYOUT.leftColX[0], LAYOUT.row1Y], [LAYOUT.leftColX[1], LAYOUT.row1Y], // n4-shelf-01, 02
    [LAYOUT.leftColX[0], LAYOUT.row1Y + LAYOUT.shelfH + 12], [LAYOUT.leftColX[1], LAYOUT.row1Y + LAYOUT.shelfH + 12], // n4-shelf-03, 04 (2nd sub-row within Grammar Foundations)
    [LAYOUT.leftColX[0], LAYOUT.row2Y], [LAYOUT.leftColX[1], LAYOUT.row2Y], // n4-shelf-05, 06
    [LAYOUT.leftColX[0], LAYOUT.row2Y + LAYOUT.shelfH + 12], [LAYOUT.leftColX[1], LAYOUT.row2Y + LAYOUT.shelfH + 12], // n4-shelf-07, 08
    [LAYOUT.rightColX[0], LAYOUT.row1Y], [LAYOUT.rightColX[1], LAYOUT.row1Y], // n3-shelf-01, 02
    [LAYOUT.rightColX[0], LAYOUT.row1Y + LAYOUT.shelfH + 12], [LAYOUT.rightColX[1], LAYOUT.row1Y + LAYOUT.shelfH + 12], // n3-shelf-03, 04
    [LAYOUT.rightColX[0], LAYOUT.row2Y], [LAYOUT.rightColX[1], LAYOUT.row2Y], // n3-shelf-05, 06
    [LAYOUT.rightColX[0], LAYOUT.row2Y + LAYOUT.shelfH + 12], [LAYOUT.rightColX[1], LAYOUT.row2Y + LAYOUT.shelfH + 12], // n3-shelf-07, 08
  ];
  ```
  Everything else in `buildShelves()` (wall-header-per-column, shelf sprite/lock/glow/stamp construction, non-solid collision reasoning) copies verbatim.

- [ ] **Step 2: Adapt `buildBookPiles()`**

  Copy verbatim; review pile positions: `n4-review-1` and `n4-review-2` sit beside the left column at `LAYOUT.review1Y`/`LAYOUT.review2Y` respectively, `n3-review-1` and `n3-review-2` sit beside the right column at the same two Y values — same "review pile beside its own column" pattern as N5's `review-1`/`review-2`.

- [ ] **Step 3: Write `buildExamGate()`**

  A new method, not present in N5 — builds the one physical interactive that gates N4 from N3. Reuses the exact same `kind: 'pile'`-shaped interactive object shape `openInteraction`/`refreshAllStates` already expect (id/title/requires/sprite/glow/stamp), positioned in the center corridor at `LAYOUT.examGateY`, using `this.finalGateId` (already set to `'n3-exam-gate'` in `create()`, Task 2) so it automatically routes through `openQuizGateMenu`'s 3-attempt/24h-cooldown flow instead of a plain review-pile menu — no new interaction logic needed, this is purely "place one more `BOOK_PILE_DATA`-shaped sprite whose id happens to equal `this.finalGateId`." Use `EXAM_GATE_DATA` (Task 5) for its id/title/requires. Visually, reuse the same book-pile sprite/crop `buildBookPiles()` already established (or a locked-gate-style variant if a suitable crop exists in the same sheets) rather than introducing a new asset.

- [ ] **Step 4: Write N4's `buildFurniture()`**

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

- [ ] **Step 5: Verify**

  `node --check`. Live-verify: all 8 N4 shelves render, dimmed-locked except `n4-shelf-01`; all 8 N3 shelves render, fully dimmed-locked (their prereq chain roots on `n3-exam-gate`, which has 0 progress yet); both N4 review piles and both N3 review piles render; the exam gate itself renders and is NOT dimmed (same exemption as N5's staircase, since `entry.id === this.finalGateId`). Clicking any shelf/pile opens the interaction system correctly (still placeholder/no-content behavior until Task 7 — `openRetroMenu`'s `hasContent` check will currently be false for every id, so they'll show the old instant-complete menu; expected until Task 7 adds `LESSON_CONTENT`). Confirm no wall/collision overlaps anywhere on the map (check every shelf/pile/gate bounds against `wallGroup`/`solidGroup`, same method used throughout this session). Confirm the exam gate genuinely blocks N3: force-complete both N4 review piles via the console, confirm the gate's state becomes `'available'` (not auto-completed) and N3 shelves stay locked until the gate itself is actually passed.

---

### Task 7: N4 lesson content — flagships + placeholders

**Files:**
- Modify: `assets/js/n4-phaser-game.js`

**Interfaces:**
- Produces: `const LESSON_CONTENT = { ... }` with 20 keys (16 shelves + 4 review piles). `n3-exam-gate` gets NO `LESSON_CONTENT` entry — same as N5's `final-quiz`, it's driven entirely by `openQuizGateMenu`'s attempt/cooldown mechanic, not `LESSON_CONTENT`.
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
    'n4-shelf-06': buildPlaceholderLesson('Comparisons'),
    'n4-shelf-07': buildPlaceholderLesson('Passive & Causative Verbs'),
    'n4-shelf-08': buildPlaceholderLesson('Adjective + なる・する'),
    'n3-shelf-02': buildPlaceholderLesson('Causative-Passive'),
    'n3-shelf-03': buildPlaceholderLesson('Conjecture & Hearsay (そうだ・ようだ・らしい)'),
    'n3-shelf-04': buildPlaceholderLesson('Relative Clauses & Complex Modification'),
    'n3-shelf-05': buildPlaceholderLesson('Formal Written Style (である体)'),
    'n3-shelf-06': buildPlaceholderLesson('Advanced Keigo'),
    'n3-shelf-07': buildPlaceholderLesson('Conjunction Nuances (ものの・くせに・というより)'),
    'n3-shelf-08': buildPlaceholderLesson('Extended Reading Practice'),
    'n4-review-1': buildPlaceholderLesson('N4 Grammar Foundations Review'),
    'n4-review-2': buildPlaceholderLesson('N4 Vocabulary & Usage Review'),
    'n3-review-1': buildPlaceholderLesson('N3 Grammar Expansion Review'),
    'n3-review-2': buildPlaceholderLesson('N3 Nuance & Conversation Review'),
    'n4-shelf-01': [ /* Step 3 */ ],
    'n4-shelf-05': [ /* Step 4 */ ],
    'n3-shelf-01': [ /* Step 5 */ ],
  };
  ```
  That's 13 placeholder shelves + 4 placeholder review piles + 3 flagship shelves = 20 keys, matching this task's Interfaces line.

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

- [ ] **Step 4: Author `n4-shelf-05` — "Giving & Receiving" (flagship, full content)**

  ```js
  'n4-shelf-05': [
    {
      type: 'grammar-intro',
      sectionLabel: 'Giving & Receiving',
      bigIdea: 'Japanese has three different verbs for "give/receive" depending on WHO is giving to WHOM — English just uses "give" for all of it.',
      explain: [
        'あげる (give, moving away from you), もらう (receive), くれる (give, moving toward you) — the verb itself encodes the direction, not just who\'s speaking.',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'あげる: giving (away from you)',
      pattern: [
        { text: '[giver]は', role: 'subject' }, { text: '[receiver]に', role: 'particle' }, { text: '[thing]を', role: 'particle' }, { text: 'あげます', role: 'predicate' },
      ],
      explain: ['Use あげる when you (or someone else) give something to another person — the giving moves away from the speaker\'s side.'],
      samples: [
        {
          tag: '"I gave my friend a book."',
          tiles: [
            { text: '私は', role: 'subject', gloss: 'I' },
            { text: '友達に', role: 'particle', gloss: 'to my friend' },
            { text: '本を', role: 'particle', gloss: 'a book' },
            { text: 'あげました', role: 'predicate', gloss: 'gave', isNew: true },
          ],
          translation: 'Watashi wa tomodachi ni hon o agemashita.',
        },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'もらう: receiving',
      pattern: [
        { text: '[receiver]は', role: 'subject' }, { text: '[giver]に', role: 'particle' }, { text: '[thing]を', role: 'particle' }, { text: 'もらいます', role: 'predicate' },
      ],
      explain: ['もらう flips the perspective to the receiver\'s side — same event as あげる, described from the other direction.'],
      samples: [
        {
          tag: '"I received a book from my friend."',
          tiles: [
            { text: '私は', role: 'subject', gloss: 'I' },
            { text: '友達に', role: 'particle', gloss: 'from my friend' },
            { text: '本を', role: 'particle', gloss: 'a book' },
            { text: 'もらいました', role: 'predicate', gloss: 'received', isNew: true },
          ],
          translation: 'Watashi wa tomodachi ni hon o moraimashita.',
        },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'くれる: giving (toward you)',
      pattern: [
        { text: '[giver]は', role: 'subject' }, { text: '私に', role: 'particle' }, { text: '[thing]を', role: 'particle' }, { text: 'くれます', role: 'predicate' },
      ],
      explain: ['くれる is only for gifts moving TOWARD the speaker (or the speaker\'s in-group) — never used for the speaker\'s own giving.'],
      samples: [
        {
          tag: '"My friend gave me a book."',
          tiles: [
            { text: '友達は', role: 'subject', gloss: 'my friend' },
            { text: '私に', role: 'particle', gloss: 'to me' },
            { text: '本を', role: 'particle', gloss: 'a book' },
            { text: 'くれました', role: 'predicate', gloss: 'gave (to me)', isNew: true },
          ],
          translation: 'Tomodachi wa watashi ni hon o kuremashita.',
        },
      ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "My friend gave me a book" (friend = 友達, book = 本):',
      before: '友達は私に本を', after: '。',
      choices: ['くれました', 'あげました', 'もらいました'],
      answer: 'くれました',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I gave my friend a book":',
      before: '私は友達に本を', after: '。',
      choices: ['あげました', 'くれました', 'もらいました'],
      answer: 'あげました',
    },
    {
      type: 'summary',
      title: 'New Patterns: Giving & Receiving',
      headers: ['Verb', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'あげる', romaji: 'ageru', meaning: 'give (away from speaker)' },
        { kana: 'もらう', romaji: 'morau', meaning: 'receive' },
        { kana: 'くれる', romaji: 'kureru', meaning: 'give (toward speaker)' },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '友達は私に本を', after: '。', answer: 'くれました', hint: '"My friend gave me a book."' },
        { before: '私は友達に本を', after: '。', answer: 'あげました', hint: '"I gave my friend a book."' },
      ],
    },
  ],
  ```

- [ ] **Step 5: Author `n3-shelf-01` — "〜ておく・〜てしまう" (flagship, full content, gated behind the exam gate — proves the N3 side works identically to N4)**

  ```js
  'n3-shelf-01': [
    {
      type: 'grammar-intro',
      sectionLabel: '〜ておく・〜てしまう',
      recapChips: ['て-form itself (N4, shelf 1)'],
      bigIdea: 'Two more jobs for て-form: doing something in advance/leaving it as-is (ておく), and doing something completely/with a sense of regret (てしまう).',
      explain: [
        'Both attach to the exact same て-form from N4 — no new conjugation to learn, just two new meanings on top of it.',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜ておく: preparing / leaving as-is',
      pattern: [
        { text: '[て-form]', role: 'subject' }, { text: 'おきます', role: 'predicate' },
      ],
      explain: ['ておく marks an action done in advance, in preparation for something later — or simply leaving something as it is on purpose.'],
      samples: [
        {
          tag: '"I\'ll buy the tickets in advance."',
          tiles: [
            { text: 'チケットを', role: 'subject', gloss: 'tickets' },
            { text: '買って', role: 'predicate', gloss: 'buy (て-form)' },
            { text: 'おきます', role: 'predicate', gloss: 'in advance', isNew: true },
          ],
          translation: 'Chiketto o katte okimasu.',
        },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜てしまう: completing / regret',
      pattern: [
        { text: '[て-form]', role: 'subject' }, { text: 'しまいます', role: 'predicate' },
      ],
      explain: ['てしまう marks an action finished completely — often with a nuance of "and now I can\'t undo it" or mild regret.'],
      samples: [
        {
          tag: '"I ended up reading the whole book."',
          tiles: [
            { text: '本を', role: 'subject', gloss: 'the book' },
            { text: '全部', role: 'predicate', gloss: 'all', isNew: true },
            { text: '読んで', role: 'predicate', gloss: 'read (て-form)' },
            { text: 'しまいました', role: 'predicate', gloss: 'ended up (completely)', isNew: true },
          ],
          translation: 'Hon o zenbu yonde shimaimashita.',
        },
      ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I\'ll buy the tickets in advance" (tickets = チケット, buy = 買って):',
      before: 'チケットを買って', after: '。',
      choices: ['おきます', 'しまいます', 'あります'],
      answer: 'おきます',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I ended up reading the whole book" (book = 本, all = 全部, read = 読んで):',
      before: '本を全部読んで', after: '。',
      choices: ['しまいました', 'おきました', 'もらいました'],
      answer: 'しまいました',
    },
    {
      type: 'summary',
      title: 'New Patterns: 〜ておく・〜てしまう',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: '〜ておく', romaji: '~te oku', meaning: 'do in advance / leave as-is' },
        { kana: '〜てしまう', romaji: '~te shimau', meaning: 'do completely / regretfully' },
        { kana: '買っておきます', romaji: 'katte okimasu', meaning: 'buy in advance' },
        { kana: '読んでしまいました', romaji: 'yonde shimaimashita', meaning: 'ended up reading (all of it)' },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: 'チケットを買って', after: '。', answer: 'おきます', hint: '"I\'ll buy the tickets in advance."' },
        { before: '本を全部読んで', after: '。', answer: 'しまいました', hint: '"I ended up reading the whole book."' },
      ],
    },
  ],
  ```

- [ ] **Step 6: Verify**

  `node --check`. Live-verify: open all 3 flagship shelves end to end (`n4-shelf-01`, `n4-shelf-05`, and `n3-shelf-01` — force-unlock the exam gate via the console first, same technique used throughout this session, since `n3-shelf-01` is genuinely locked until then) — every page renders, no "undefined", try-it/quiz-fill grade correctly. Open 2-3 placeholder shelves on each side (single page, marks progress, unlocks the next shelf). Open all 4 review piles (placeholder content for now — fine, matches this pass's scope).

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
- [ ] **Step 2: Full floor walkthrough** — from a cold load of `n4-dashboard.html`: player spawns at the entry point, can walk to and open all 8 N4 shelves (left column, respecting lock order) and both N4 review piles. Confirm every N3 shelf (right column) stays locked until the exam gate is passed, then confirm the exam gate is reachable, gated correctly (locked toast until both N4 reviews done, then opens the 3-attempt/24h-cooldown menu), and passing it genuinely unlocks `n3-shelf-01` (not just cosmetically — verify via `SHELF_PREREQ`/`progress` state, not just that the sprite stopped looking dimmed). Then walk all 8 N3 shelves and both N3 review piles. No wall/collision overlaps anywhere on the map. No console errors at any point.
- [ ] **Step 3: Cross-floor check** — N5's localStorage keys (`nekoBunko.n5.*`) and N4's (`nekoBunko.n4.*`) don't collide; clearing one floor's progress doesn't affect the other's.
