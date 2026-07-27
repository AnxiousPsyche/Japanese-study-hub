# N4/N3 Mezzanine Polish Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the atrium's missing lower-floor sightline, scale up the brick wall texture, add a jukebox decorative prop, and add N2/N1 exam gates to the left wing of the live N4/N3 mezzanine — per `docs/superpowers/specs/2026-07-28-n4-atrium-walls-jukebox-gates-design.md`.

**Architecture:** Three small reusable factory functions move into `assets/js/library-scene-shared.js` (`buildOpenAtriumVoid`, `createBrickWallTexture`, `createDecorativeProp`), following that file's existing plain-function style — no bundler, no framework, everything a global loaded via `<script src>`. In `assets/js/n4-phaser-game.js`, `buildExamGate()`'s hand-duplicated N4/N3 block collapses into a `createExamGateEntry()` method, then gets called 4 times (N4, N3, N2, N1) instead of 2. No new scene, no new persistence namespace, no changes to N5.

**Tech Stack:** Phaser 3.90.0, vanilla JS, no build step (matches the rest of the repo).

## Global Constraints

- No test runner exists in this project. "Testing" means: `node --check` on every changed `.js` file after every task, plus live verification in the Browser pane preview on a **fresh, never-before-used port** (this project's documented stale-JS-cache gotcha, `CLAUDE.md`) — check `read_console_messages` for errors and take a screenshot of the relevant change.
- Do not change any N5 behavior or any file under `pages/N5/`.
- No new image assets except `assets/images/ui/jukebox-Original.png` (already supplied — confirmed present at that path, `1024x1024`, RGBA with a soft alpha-vignette background, colorType 6).
- N2/N1 gates are standalone landmarks this pass, same as N4's own gate: `requires: []`, not wired into `SHELF_PREREQ` (no N2/N1 shelf content exists yet — out of scope, see spec).
- localStorage keys follow the existing `nekoBunko.n4.*` one-key-per-concern pattern: new keys this pass are `nekoBunko.n4.n2Gate` and `nekoBunko.n4.n1Gate`.
- Every gate's locked/unlocked visual is `alpha` dimming only (`0.55` locked / `1` unlocked) — no new bespoke door art, per the approved spec (Item 4 uses the existing lightweight pattern, not new pixel-art door states).

---

### Task 1: Atrium sightline — `buildOpenAtriumVoid()`

**Files:**
- Modify: `assets/js/library-scene-shared.js` (add `buildOpenAtriumVoid` function)
- Modify: `assets/js/n4-phaser-game.js:1225-1253` (`buildAtrium()` — replace the flat-fill body)

**Interfaces:**
- Produces: `buildOpenAtriumVoid(scene, g, config)` in `library-scene-shared.js`. `config: { left, top, width, height }`. Draws onto the `Graphics` object the caller passes in (`g`) — the same object the caller already owns for its rail/frame trim, so the void illustration composites under that trim automatically — returns nothing; pure side-effecting draw, matching every other draw helper in this file (`drawWovenRug`, `drawWallHeaderTexture`).
- Consumes: nothing beyond a live `scene`/`g` and the rect it's told to draw into — no scene-instance properties required, so it's safe to call from any future floor with a similar mezzanine-over-void layout.

- [ ] **Step 1: Read the current `buildAtrium()` body to confirm line range before editing**

  Confirm `assets/js/n4-phaser-game.js:1225-1253` still matches:
  ```js
  buildAtrium() {
    const left = 392;
    const width = WORLD_W - left * 2;
    const top = 510;
    const height = 910;
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x160f0c, 1).fillRect(left, top, width, height);
    g.fillStyle(0x27170f, 1).fillRect(left + 14, top + 16, width - 28, height - 32);
    ...
  }
  ```
  If line numbers have drifted, locate `buildAtrium()` by name instead — the content is what matters.

- [ ] **Step 2: Add `buildOpenAtriumVoid()` to `assets/js/library-scene-shared.js`**

  Add near the other Canvas/Graphics draw helpers (next to `drawWovenRug`/`drawWallHeaderTexture`):
  ```js
  // Draws an illustrated "lower floor" void into a mezzanine's open
  // atrium rect, instead of a flat color fill — a darker/desaturated
  // floor-tile pattern, a few silhouette shelf blocks suggesting
  // receding first-floor furniture, and a soft vertical depth gradient,
  // all drawn on the caller's own Graphics object so it composites under
  // whatever rail/frame trim the caller draws next. Pure procedural
  // drawing (no new image assets) — reusable by any future floor with a
  // similar mezzanine-over-void layout.
  // config: { left, top, width, height, label } (label optional)
  function buildOpenAtriumVoid(scene, g, config) {
    const { left, top, width, height } = config;
    const midY = top + height / 2;

    // Desaturated "first floor" tile pattern — small dark tiles, cooler
    // and flatter than the mezzanine's own warm wood tones, reading as
    // a different, more distant surface.
    const tileW = 34;
    const tileH = 22;
    for (let ty = top + 20; ty < top + height - 20; ty += tileH) {
      for (let tx = left + 20; tx < left + width - 20; tx += tileW) {
        const shade = ((tx / tileW + ty / tileH) % 2) ? 0x1c1410 : 0x211714;
        g.fillStyle(shade, 1).fillRect(tx, ty, tileW - 1, tileH - 1);
      }
    }

    // Depth gradient — brighter near the rail edges (top/bottom of the
    // void, closest to the viewer on each balcony), darker toward the
    // center, implying the floor recedes downward/away.
    const bands = 10;
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1);
      const distFromMid = Math.abs(t - 0.5) * 2; // 1 at edges, 0 at center
      const alpha = 0.16 * (1 - distFromMid);
      if (alpha <= 0.01) continue;
      const bandTop = top + (height / bands) * i;
      g.fillStyle(0x000000, alpha).fillRect(left, bandTop, width, height / bands + 1);
    }

    // Silhouette shelf blocks — simple dark rectangles (not full
    // sprites) scattered across the void, reading as distant first-floor
    // shelving seen from above without competing with the mezzanine's
    // own shelf sprites.
    const silhouettes = [
      { x: left + width * 0.18, w: 30, h: 16 },
      { x: left + width * 0.34, w: 22, h: 16 },
      { x: left + width * 0.62, w: 26, h: 16 },
      { x: left + width * 0.80, w: 30, h: 16 },
    ];
    silhouettes.forEach((s, i) => {
      const sy = midY - 40 + (i % 2) * 26;
      g.fillStyle(0x0e0906, 0.85).fillRect(s.x, sy, s.w, s.h);
      g.fillStyle(0x3a2415, 0.4).fillRect(s.x, sy, s.w, 2);
    });
  }
  ```

- [ ] **Step 3: Wire it into `buildAtrium()` in `n4-phaser-game.js`**

  Replace the two flat `fillRect` calls (the `0x160f0c` base fill and the `0x27170f` inset fill) with the void illustration, keeping every line below unchanged (rail/plank trim, label text, rear walkway):
  ```js
  buildAtrium() {
    const left = 392;
    const width = WORLD_W - left * 2;
    const top = 510;
    const height = 910;
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x160f0c, 1).fillRect(left, top, width, height);
    buildOpenAtriumVoid(this, g, { left: left + 14, top: top + 16, width: width - 28, height: height - 32 });
    for (let y = top + 48; y < top + height - 28; y += 42) {
      g.lineStyle(2, 0x4a2d1d, 0.9).lineBetween(left + 22, y, left + width - 22, y);
    }
    // ...unchanged from here: outer frame lines, side rail posts, gold
    // trim lines, "OPEN ATRIUM" label, rear walkway.
  ```
  Keep the base `0x160f0c` fill as a backdrop (in case the void's tile pattern doesn't reach every pixel of the rect), draw the void illustration on top of it, then the existing horizontal plank-seam lines (`for (let y = ...) lineBetween(...)`) continue to draw over both, same as before.

- [ ] **Step 4: `node --check`**

  Run: `node --check assets/js/library-scene-shared.js && node --check assets/js/n4-phaser-game.js`
  Expected: no output, exit code 0.

- [ ] **Step 5: Live verification**

  Start the preview on a fresh, never-before-used port. Navigate to `pages/N4/n4-dashboard.html`, walk to either wing's atrium rail. Confirm: the atrium now shows a tiled, shadowed, silhouette-dotted "lower floor" instead of a flat color block, the "OPEN ATRIUM" label still reads clearly over it, no console errors. Screenshot it.

- [ ] **Step 6: Commit**

  ```bash
  git add assets/js/library-scene-shared.js assets/js/n4-phaser-game.js
  git commit -m "Give the N4/N3 atrium a real first-floor sightline instead of a flat fill"
  ```

---

### Task 2: Larger brick wall texture — `createBrickWallTexture()`

**Files:**
- Modify: `assets/js/library-scene-shared.js` (add `createBrickWallTexture` function)
- Modify: `assets/js/n4-phaser-game.js:1084-1105` (`buildWalls()`)

**Interfaces:**
- Produces: `createBrickWallTexture(scene, key, config)` in `library-scene-shared.js`. `config: { blockW, blockH, mortarColor, brickColors }` (mortarColor/brickColors optional, sensible defaults). Returns the texture `key`, same contract as `cropToTexture`.
- Scope note: this only replaces `buildWalls()`'s decorative 3-tile-deep wall strip (the thing visibly close to shelves like `n4-shelf-06` "Comparisons"). `buildFloor()`'s 1-tile perimeter border tilemap (which uses the same old `ASSET_RECTS.brickTile` crop) is mostly hidden behind `buildWalls()`'s strip and is unrelated to the close-up "small repeating pattern" complaint — leave it untouched to avoid an unrelated tilemap-registration change.

- [ ] **Step 1: Confirm current `buildWalls()` body**

  Re-read `assets/js/n4-phaser-game.js`'s `buildWalls()` (currently ~line 1084) and confirm it still tiles `brickKey` at `TILE_SIZE` (16px) steps across the top/bottom rows and left/right 3-tile-deep side strips, per the design spec's findings.

- [ ] **Step 2: Add `createBrickWallTexture()` to `assets/js/library-scene-shared.js`**

  Same procedural Canvas-drawing technique as the existing wood-plank floor texture (`n4-phaser-game.js`'s `drawHardwoodFloorTexture()`) — mortar lines + per-brick shading, not an image crop:
  ```js
  // Procedural brick-wall texture, replacing a small tiled image crop.
  // Bigger, hand-drawn blocks with mortar lines and per-brick shading
  // read as "real brickwork" instead of a tight repeating pattern.
  // config: { blockW, blockH, mortarColor, brickColors } — blockW/blockH
  // default to 32x32 (2x the previous 16x16 crop); brickColors is an
  // array cycled per-brick for subtle variation.
  function createBrickWallTexture(scene, key, config) {
    const cfg = config || {};
    const blockW = cfg.blockW || 32;
    const blockH = cfg.blockH || 32;
    const mortar = cfg.mortarColor || '#1c120b';
    const brickColors = cfg.brickColors || ['#4c2b1b', '#442619', '#3e2216'];
    const rowH = blockH / 2; // two brick courses per texture tile, offset like real brickwork
    const tex = scene.textures.createCanvas(key, blockW, blockH);
    const ctx = tex.getContext();
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = mortar;
    ctx.fillRect(0, 0, blockW, blockH);
    let brickIndex = 0;
    for (let row = 0; row < 2; row++) {
      const y = row * rowH;
      const offset = row % 2 ? -blockW / 4 : 0;
      for (let x = offset; x < blockW; x += blockW / 2) {
        ctx.fillStyle = brickColors[brickIndex % brickColors.length];
        brickIndex += 1;
        ctx.fillRect(x + 1, y + 1, blockW / 2 - 2, rowH - 2);
        // Top highlight + bottom shadow per brick, same technique as
        // drawHardwoodFloorTexture's plank shading.
        ctx.fillStyle = 'rgba(235, 178, 98, .08)';
        ctx.fillRect(x + 2, y + 1, blockW / 2 - 4, 1);
        ctx.fillStyle = 'rgba(10, 5, 2, .45)';
        ctx.fillRect(x + 1, y + rowH - 2, blockW / 2 - 2, 1);
      }
    }
    tex.refresh();
    return key;
  }
  ```

- [ ] **Step 3: Wire it into `buildWalls()` in `n4-phaser-game.js`**

  Replace the `cropToTexture`-based `brickKey` with the new procedural texture, and re-tile the strip loops at the new block size. Handle the "doesn't divide evenly" edge case by clamping the loop's last step to the strip's true remaining length using a per-tile `setDisplaySize` clip rather than overshooting:
  ```js
  buildWalls() {
    const blockSize = 32; // was TILE_SIZE (16) via image crop — see Task 2
    const brickKey = createBrickWallTexture(this, 'n4BrickWallTex', { blockW: blockSize, blockH: blockSize });
    const wallGroup = this.physics.add.staticGroup();

    // Top/bottom strips — WORLD_W (1152) divides evenly by 32 (36 tiles),
    // so no remainder handling needed on this axis.
    for (let x = 0; x < WORLD_W; x += blockSize) {
      this.add.image(x, TILE_SIZE, brickKey).setOrigin(0, 0).setDepth(0);
      this.add.image(x, (GRID_ROWS - 2) * TILE_SIZE, brickKey).setOrigin(0, 0).setDepth(0);
    }

    // Left/right strips — 3 * TILE_SIZE (48px) deep, starting below the
    // top wall band. The vertical run length (GRID_ROWS * TILE_SIZE minus
    // the header) is not guaranteed to be a multiple of blockSize, so the
    // final tile in each column gets clipped to the remaining pixel
    // height instead of overshooting past the strip's bottom edge.
    const sideWallStartY = Math.ceil(TOP_BAND_HEIGHT / TILE_SIZE) * TILE_SIZE;
    const sideWallEndY = GRID_ROWS * TILE_SIZE;
    const colWidth = 3 * TILE_SIZE; // 48px, same total strip width as before
    for (let y = sideWallStartY; y < sideWallEndY; y += blockSize) {
      const remaining = sideWallEndY - y;
      const h = Math.min(blockSize, remaining);
      this.add.image(0, y, brickKey).setOrigin(0, 0).setDepth(0)
        .setCrop(0, 0, colWidth, h).setDisplaySize(colWidth, h);
      this.add.image(WORLD_W - colWidth, y, brickKey).setOrigin(0, 0).setDepth(0)
        .setCrop(0, 0, colWidth, h).setDisplaySize(colWidth, h);
    }
    this.wallGroup = wallGroup;
  }
  ```
  Note: this also collapses the previous per-column (`col 1..3`) tile loop into a single wider image per row (`colWidth = 48`), since the new texture already tiles the brick pattern within its own block — simpler than placing 3 separate 16px-wide images per row. Visually this covers the same 3-tile-deep strip.

- [ ] **Step 4: `node --check`**

  Run: `node --check assets/js/library-scene-shared.js && node --check assets/js/n4-phaser-game.js`
  Expected: no output, exit code 0.

- [ ] **Step 5: Live verification**

  Fresh port. Walk the player up close to a wall near a left-wing shelf (e.g. `n4-shelf-06` "Comparisons"). Confirm the brick blocks read as visibly larger and less tightly repetitive than before, with visible mortar lines and per-brick shading variation. Check both the top/bottom strips and the side strips, and confirm no gap or overflow at the side strips' bottom edge (the clipped-tile remainder handling). Screenshot a close-up. Check console for errors.

- [ ] **Step 6: Commit**

  ```bash
  git add assets/js/library-scene-shared.js assets/js/n4-phaser-game.js
  git commit -m "Scale up the N4/N3 wall brick texture from a tight 16px tile to a larger procedural pattern"
  ```

---

### Task 3: Jukebox decorative prop — `createDecorativeProp()`

**Files:**
- Modify: `assets/js/library-scene-shared.js` (add `createDecorativeProp` function)
- Modify: `assets/js/n4-phaser-game.js` (`preload()`, new `buildJukebox()` method, wire into `buildScene()`)

**Interfaces:**
- Produces: `createDecorativeProp(scene, config)` in `library-scene-shared.js`. `config: { x, y, textureKey, scale, onClick, depth }` (`scale`/`onClick`/`depth` optional). Returns the created `Phaser.GameObjects.Image`. Deliberately **not** pushed into `scene.interactives` — it doesn't participate in the progress/lock system (`refreshAllStates()`/`nearestInRange()` never see it), so it needs no `requires`/`glow`/`stamp` fields, matching a purely decorative prop that only optionally reacts to a direct click.
- Consumes: a texture already registered via `scene.textures` (loaded in `preload()` or cropped earlier in `buildScene()`).

- [ ] **Step 1: Confirm the jukebox source asset**

  `assets/images/ui/jukebox-Original.png` — `1024x1024`, RGBA (colorType 6). The artwork's opaque content sits roughly within `x:242-782, y:122-912` in source pixels; alpha fades to near-zero within that range but the file's extreme corners retain a faint residual alpha (~80-99/255, a rendering artifact) rather than true transparency. A direct crop-and-place would leave a faint translucent square around the jukebox — clean this up in Step 3 rather than placing the raw file.

- [ ] **Step 2: Load the source image in `preload()`**

  Add alongside the other `this.load.image(...)` calls in `N4LibraryScene.preload()`:
  ```js
  this.load.image('jukebox', '../../assets/images/ui/jukebox-Original.png');
  ```

- [ ] **Step 3: Add a jukebox texture-cleanup helper to `n4-phaser-game.js`**

  This is floor-specific (uses this asset's own measured crop rect), so it lives here, not in the shared file:
  ```js
  // Crops a padded window around the jukebox artwork's opaque content
  // and zeroes any residual low-alpha pixels (<20/255) left over from
  // the source file's soft vignette background, so the destination
  // texture reads as a clean cutout against the mezzanine floor instead
  // of a faint translucent square.
  function cropJukeboxTexture(scene) {
    const destKey = 'n4JukeboxTex';
    const srcImage = scene.textures.get('jukebox').getSourceImage();
    const rect = { x: 202, y: 82, w: 620, h: 870 }; // padded around the measured x:242-782, y:122-912 opaque bbox
    const tex = scene.textures.createCanvas(destKey, rect.w, rect.h);
    const ctx = tex.getContext();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(srcImage, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
    const imageData = ctx.getImageData(0, 0, rect.w, rect.h);
    const data = imageData.data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 20) data[i] = 0;
    }
    ctx.putImageData(imageData, 0, 0);
    tex.refresh();
    return destKey;
  }
  ```

- [ ] **Step 4: Add `buildJukebox()` to `N4LibraryScene`**

  Place along the rear walkway, clear of shelf traffic. Click shows a toast and a small floating-note flourish (reusing the same particle technique as `spawnPassSparkle`, swapped to a note glyph so it doesn't literally duplicate that method):
  ```js
  // Decorative jukebox prop — visual-only this pass (no real audio;
  // n4-dashboard.html doesn't load music-player.js and no audio asset
  // was supplied). Placed along the rear walkway, non-solid like every
  // other decor piece on this floor.
  buildJukebox() {
    const texKey = cropJukeboxTexture(this);
    const x = 470;
    const y = 480; // on the rear walkway strip (buildAtrium()'s walkway spans roughly y 452-494)
    const scale = 0.16; // source crop is 620x870 — scales down to a footprint similar to the centerpiece clock
    createDecorativeProp(this, {
      x, y, textureKey: texKey, scale, depth: 2,
      onClick: () => {
        showToast('The jukebox hums an old N4 tune...');
        this.spawnNoteFlourish(x, y);
      },
    });
  }

  // Same particle technique as spawnPassSparkle (library-scene-shared.js)
  // but with a musical-note glyph and no dependency on quiz-pass state —
  // kept local since it's cosmetic flavor for one prop, not shared engine.
  spawnNoteFlourish(x, y) {
    const count = 4;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const note = this.add.text(x, y, '♪', { fontSize: '16px', color: '#e8d4a8' })
        .setOrigin(0.5).setDepth(10);
      this.tweens.add({
        targets: note, x: x + Math.cos(angle) * 30, y: y + Math.sin(angle) * 30 - 20,
        alpha: { from: 1, to: 0 }, duration: 800, ease: 'Cubic.Out',
        onComplete: () => note.destroy(),
      });
    }
  }
  ```

- [ ] **Step 5: Call `buildJukebox()` from `buildScene()`**

  In `N4LibraryScene.buildScene()`, add the call after `buildFurniture()` (alongside the other decor-building calls, before shelves/gates):
  ```js
  this.buildFurniture();
  this.buildJukebox();
  this.buildAtrium();
  ```

- [ ] **Step 6: `node --check`**

  Run: `node --check assets/js/library-scene-shared.js && node --check assets/js/n4-phaser-game.js`
  Expected: no output, exit code 0.

- [ ] **Step 7: Live verification**

  Fresh port. Confirm the jukebox renders at its placed position with no visible translucent halo/background square, doesn't block walking to nearby shelves, shows a hand cursor on hover, and clicking it shows the toast plus the note-particle flourish. Check console for errors (including any texture-load errors for the `jukebox` key). Screenshot it.

- [ ] **Step 8: Commit**

  ```bash
  git add assets/js/library-scene-shared.js assets/js/n4-phaser-game.js
  git commit -m "Add jukebox decorative prop to the N4/N3 mezzanine"
  ```

---

### Task 4: Collapse `buildExamGate()`'s duplicated N4/N3 block into a factory

**Files:**
- Modify: `assets/js/n4-phaser-game.js:1453-1498` (`buildExamGate()`)

**Interfaces:**
- Produces: `N4LibraryScene.prototype.createExamGateEntry(config)`. `config: { id, title, x, y, requires, quizGateKey, onPass, bookKey, scale }`. Builds the sprite/glow/stamp/label/interaction wiring and pushes the entry onto `this.interactives`; returns the entry object.
- Consumes: `ASSET_RECTS.bookPileTall`, `this.handleInteractiveClick` (from `LibrarySceneEngine`), `this.interactives`.
- Flagged side-effect fix (call this out in the commit message, not silent): today's N3 gate has **no floating label text** above it (only N4's gate does — a copy-paste omission in the original code). The consolidated factory always draws one, so N3's gate gains a "N3 EXAM GATE" label it didn't render before. This is a one-line visual fix, not a new feature — verify it looks right live rather than assuming it's fine.

- [ ] **Step 1: Add `createExamGateEntry()` to `N4LibraryScene`**

  ```js
  // Builds one exam-gate interactive: sprite (reused book-pile texture,
  // scaled), glow (available-state pulse) / stamp (completed) icons, a
  // floating title label, and the this.interactives entry. Replaces the
  // hand-duplicated N4/N3 block buildExamGate() used to write out twice.
  // config: { id, title, x, y, requires, quizGateKey, onPass, bookKey, scale }
  createExamGateEntry(config) {
    const { id, title, x, y, requires, quizGateKey, onPass, bookKey, scale } = config;
    const w = ASSET_RECTS.bookPileTall.w * scale;
    const h = ASSET_RECTS.bookPileTall.h * scale;
    const sprite = this.add.image(x, y, bookKey).setOrigin(0, 0).setDisplaySize(w, h).setDepth(2);
    const glow = this.add.text(x + w - 8, y - 6, '⭐', { fontSize: '18px' }).setOrigin(.5).setDepth(4).setVisible(false);
    const stamp = this.add.text(x + w - 8, y - 6, '✅', { fontSize: '18px' }).setOrigin(.5).setDepth(4).setVisible(false);
    this.tweens.add({ targets: glow, alpha: { from: 1, to: 0.35 }, duration: 650, yoyo: true, repeat: -1 });
    const entry = {
      id, kind: 'pile', title, sprite, glow, stamp, requires,
      x: x + w / 2, y: y + h / 2, baseScale: scale, isExamGate: true, quizGateKey, onPass,
    };
    sprite.setInteractive({ useHandCursor: true });
    sprite.on('pointerdown', () => this.handleInteractiveClick(entry));
    this.add.text(x + w / 2, y - 18, title.toUpperCase(), {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#e8d4a8',
    }).setOrigin(.5).setDepth(4);
    this.interactives.push(entry);
    return entry;
  }
  ```
  Note: standardizes on the `⭐`/`✅` glow/stamp glyphs (what N3's gate and every review pile already use) rather than N4's current plain `*`/`OK` text — another small existing inconsistency this consolidation fixes rather than preserves. Flag this in the same commit.

- [ ] **Step 2: Rewrite `buildExamGate()` to call the factory for N4 and N3**

  Replace the entire hand-written body with:
  ```js
  buildExamGate() {
    const bookKey = this.bookPileTexKey;
    const scale = 1.3;
    this.createExamGateEntry({
      id: EXAM_GATE_DATA.n4.id, title: EXAM_GATE_DATA.n4.title,
      x: 322, y: 1515, requires: EXAM_GATE_DATA.n4.requires,
      quizGateKey: N4_ENTRANCE_GATE_KEY, bookKey, scale,
      onPass: () => showToast('The N4 balcony is permanently open.'),
    });
    const w = ASSET_RECTS.bookPileTall.w * scale;
    this.createExamGateEntry({
      id: EXAM_GATE_DATA.n3.id, title: EXAM_GATE_DATA.n3.title,
      x: WORLD_W - 322 - w, y: 1515, requires: EXAM_GATE_DATA.n3.requires,
      quizGateKey: QUIZ_GATE_KEY, bookKey, scale,
      onPass: () => showToast('The N3 balcony is permanently open.'),
    });
  }
  ```

- [ ] **Step 3: `node --check`**

  Run: `node --check assets/js/n4-phaser-game.js`
  Expected: no output, exit code 0.

- [ ] **Step 4: Live verification — confirm N4/N3 gates unchanged (plus the flagged label fix)**

  Fresh port. Confirm both gates still render at the same positions/scale, still show the lock-dim/available-glow/completed-stamp states correctly, still open the exam-attempt menu on click, and "Pass (test)"/"Fail (test)" still work (via the existing in-menu test options — no manual localStorage editing needed). Confirm N3's gate now also shows a floating label above it. Screenshot both. Check console for errors.

- [ ] **Step 5: Commit**

  ```bash
  git add assets/js/n4-phaser-game.js
  git commit -m "Refactor buildExamGate() into a reusable createExamGateEntry() factory"
  ```

---

### Task 5: N2/N1 exam gates, left wing

**Files:**
- Modify: `assets/js/n4-phaser-game.js` (`EXAM_GATE_DATA`, new key constants, `buildExamGate()`)

**Interfaces:**
- Consumes: `createExamGateEntry()` (Task 4).
- Produces: two more entries in `this.interactives` with ids `n2-exam-gate`/`n1-exam-gate`.

- [ ] **Step 1: Add new persistence keys**

  Next to `N4_ENTRANCE_GATE_KEY`:
  ```js
  const N2_ENTRANCE_GATE_KEY = 'nekoBunko.n4.n2Gate';
  const N1_ENTRANCE_GATE_KEY = 'nekoBunko.n4.n1Gate';
  ```

- [ ] **Step 2: Extend `EXAM_GATE_DATA`**

  ```js
  const EXAM_GATE_DATA = {
    n4: { id: 'n4-exam-gate', title: 'N4 Entrance Exam', requires: [] },
    n3: { id: 'n3-exam-gate', title: 'N3 Entrance Exam', requires: ['n4-review-1', 'n4-review-2'] },
    n2: { id: 'n2-exam-gate', title: 'N2 Entrance Exam', requires: [] },
    n1: { id: 'n1-exam-gate', title: 'N1 Entrance Exam', requires: [] },
  };
  ```
  `requires: []` matches N4's own gate — standalone, attemptable any time, not wired into any shelf's `SHELF_PREREQ` chain (no N2/N1 shelf content exists yet, out of scope per spec).

- [ ] **Step 3: Add the two new gate calls to `buildExamGate()`, placed in the left wing**

  Left-wing shelves occupy `x` values `70/178/286` starting at `y=630` and below (`createMezzanineShelfPositions()`); the band between the rear walkway (ends ~`y=494`) and the first shelf row (`y=630`) is open floor. Place N2/N1 there, side by side:
  ```js
  buildExamGate() {
    const bookKey = this.bookPileTexKey;
    const scale = 1.3;
    this.createExamGateEntry({
      id: EXAM_GATE_DATA.n4.id, title: EXAM_GATE_DATA.n4.title,
      x: 322, y: 1515, requires: EXAM_GATE_DATA.n4.requires,
      quizGateKey: N4_ENTRANCE_GATE_KEY, bookKey, scale,
      onPass: () => showToast('The N4 balcony is permanently open.'),
    });
    const w = ASSET_RECTS.bookPileTall.w * scale;
    this.createExamGateEntry({
      id: EXAM_GATE_DATA.n3.id, title: EXAM_GATE_DATA.n3.title,
      x: WORLD_W - 322 - w, y: 1515, requires: EXAM_GATE_DATA.n3.requires,
      quizGateKey: QUIZ_GATE_KEY, bookKey, scale,
      onPass: () => showToast('N2 is next... someday.'),
    });

    // N2/N1 — left wing, per explicit instruction (breaks the natural
    // N4->N3->N2->N1 left/right progression on purpose; see design spec
    // Item 4). Placed in the open band between the rear walkway and the
    // first shelf row (y 630), clear of every left-wing shelf position.
    const gateScale = 1.0; // smaller than the 1.3 entry gates — these read as "future" landmarks, not the floor's primary gate
    this.createExamGateEntry({
      id: EXAM_GATE_DATA.n2.id, title: EXAM_GATE_DATA.n2.title,
      x: 100, y: 520, requires: EXAM_GATE_DATA.n2.requires,
      quizGateKey: N2_ENTRANCE_GATE_KEY, bookKey, scale: gateScale,
      onPass: () => showToast('The N2 gate creaks open... nothing beyond it yet.'),
    });
    this.createExamGateEntry({
      id: EXAM_GATE_DATA.n1.id, title: EXAM_GATE_DATA.n1.title,
      x: 220, y: 520, requires: EXAM_GATE_DATA.n1.requires,
      quizGateKey: N1_ENTRANCE_GATE_KEY, bookKey, scale: gateScale,
      onPass: () => showToast('The N1 gate creaks open... nothing beyond it yet.'),
    });
  }
  ```
  (The N3 gate's `onPass` toast text above is unchanged from Task 4 — shown in full here only because the whole method is being replaced again; don't actually change its wording.)

- [ ] **Step 4: `node --check`**

  Run: `node --check assets/js/n4-phaser-game.js`
  Expected: no output, exit code 0.

- [ ] **Step 5: Live verification**

  Fresh port. Walk to the left wing's open band north of the shelf grid. Confirm:
  - Both N2 and N1 gates render, locked-dim (`alpha 0.55`) by default, with labels "N2 EXAM GATE" / "N1 EXAM GATE".
  - Neither overlaps a shelf sprite, the wall header/footer collision blocks, or each other (visually inspect the screenshot; nudge the `x`/`y` values in Step 3 and re-verify if they do).
  - Click each gate, open its exam-attempt menu, select "Pass (test)" — confirm it flips to full opacity, shows the unlock toast, and the state persists across a page reload (re-navigate to `n4-dashboard.html` and confirm it's still unlocked, proving the new `localStorage` keys round-trip correctly).
  - Separately confirm "Fail (test)" 3 times in a row locks that gate for 24h with the correct lock message (same mechanic already proven for N4/N3, now on a fresh key).
  - No regression to N4/N3 shelves, review piles, or their own gates.
  Screenshot the left wing showing both new gates in locked state, and again after unlocking one.

- [ ] **Step 6: Commit**

  ```bash
  git add assets/js/n4-phaser-game.js
  git commit -m "Add N2/N1 exam gates to the N4/N3 mezzanine's left wing"
  ```

---

### Task 6: Full-pass regression check

**Files:** none (verification only)

- [ ] **Step 1: Fresh-port full walkthrough**

  Start the preview on a port not yet used this session. Load `pages/N4/n4-dashboard.html` from a clean `localStorage` (or a state with some N4 shelves already completed, to check both fresh and mid-progress views). Walk the full floor: both wings' shelves, all 4 review piles, N4/N3/N2/N1 gates, the jukebox, both atrium rails.

- [ ] **Step 2: Confirm all four spec items together, in one session**

  - Atrium reads as open with visible depth/silhouette content from both wings.
  - Wall brick blocks are visibly larger/less repetitive, no gaps or overflow at strip edges.
  - Jukebox is visible, clickable, shows its flourish, doesn't block pathing.
  - N2/N1 render correctly in the left wing and unlock correctly on a simulated pass.

- [ ] **Step 3: Check console + confirm no N5 regression**

  `read_console_messages` on the N4 page — zero errors. Separately load `pages/N5/n5-dashboard.html` on the same fresh port and confirm it still boots and plays exactly as before (this pass touched no N5 file, but `library-scene-shared.js` is shared — any syntax slip there would break N5 too).

- [ ] **Step 4: Update `SUMMARY.md`**

  Add a short note under "What's next"/build status reflecting: atrium sightline fixed, wall texture scaled up, jukebox prop added, N2/N1 gates added to the left wing (standalone, not wired into any shelf content).

- [ ] **Step 5: Final commit**

  ```bash
  git add SUMMARY.md
  git commit -m "Update SUMMARY.md after the N4/N3 mezzanine polish pass"
  ```
