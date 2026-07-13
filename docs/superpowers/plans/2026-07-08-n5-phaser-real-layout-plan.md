# N5 Phaser Real Tileset + Library Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Phaser scaffold's placeholder solid-color tilemap with a real, art-based library scene — real floor/wall tiles, a top wall/balcony backdrop, bookshelves, a globe, benches, tables, lamps, plants, and a center rug — laid out across a 48×30 @ 16px grid, using three sprite sheets already in the repo.

**Architecture:** One file (`assets/js/n5-phaser-game.js`) is rewritten. `LibraryScaffoldScene` becomes `LibraryScene`. A shared `ASSET_RECTS` manifest gives every task exact source-pixel rectangles. A `cropToTexture()` helper (using Phaser's `textures.createCanvas` + 2D canvas `drawImage`) turns any rectangle from a loaded sheet into its own placeable texture — this is how both the 2-cell floor/brick tileset and every individual furniture piece are produced, so every task uses the same one technique. The floor/brick tilemap layer is built once (Task 1); every later task only *appends* `this.add.image(...)` calls to the end of `create()` and records each new sprite on `this.furnitureSprites`.

**Tech Stack:** Phaser 3.90.0 (CDN `<script>` tag, already in place — no npm/bundler). No test framework in this repo; verification is manual/Playwright throwaway scripts, matching the pattern established in sub-project #1.

## Global Constraints

- No npm/bundler. Phaser stays loaded via the existing CDN `<script>` tag — do not add any build step.
- `Phaser.Game` config (`width: 768`, `height: 480`, `scale.mode: Phaser.Scale.FIT`, `scale.autoCenter: Phaser.Scale.CENTER_BOTH`, `parent: 'phaserGame'`) must NOT change — only the tilemap's internal tile array and `tileWidth`/`tileHeight` constants change (24×15@32px → 48×30@16px, same 768×480 total).
- Only `assets/js/n5-phaser-game.js` changes. Do not touch `pages/N5/n5-dashboard.html` or `assets/css/n5-dashboard.css` — both are already correct from sub-project #1.
- No player sprite, no movement, no collision, no interaction/trigger zones, no "press E" prompts, no lesson data model changes, no review/checkpoint visual distinction or locking, no cat avatar of any kind in the Phaser scene, no ambient NPCs. All of these are later sub-projects.
- Known pre-existing, out-of-scope 404s (`player.js`, `achievement.js`, `default-avatar.png`, `book.png`) are not this branch's problem — allowlist them by URL in verification scripts, do not fix them.
- `window.__n5Game` must stay exposed exactly as sub-project #1 established.

## File Structure

Single file, fully rewritten in place: `assets/js/n5-phaser-game.js`.

Internal responsibilities (top to bottom):
1. `ASSET_RECTS` — a plain object constant with every confirmed source-pixel rectangle across all three sheets (defined once, in Task 1; every later task only reads from it).
2. `GRID_COLS`, `GRID_ROWS`, `TILE_SIZE`, `GATE_COLS` — grid constants (Task 1).
3. `cropToTexture(scene, sourceKey, rect, destKey)` — shared helper function (Task 1), used by every later task.
4. `buildFloorTileData()` — builds the 48×30 tile-index array, including the bottom gate opening and the improvised staircase step-lines (Task 1).
5. `class LibraryScene extends Phaser.Scene` — `preload()` loads the three sheets; `create()` builds the floor tilemap (Task 1) then has furniture-placement code appended task by task (Tasks 2–5).
6. `Phaser.Game` bootstrap + `window.__n5Game = n5PhaserGame;` (unchanged structurally from sub-project #1, just referencing the renamed scene class).

## Confirmed source-pixel rectangles (all tasks use these — do not re-derive)

```js
const ASSET_RECTS = {
  // floors-walls02.png (288x160px)
  floorTile: { x: 220, y: 25, w: 16, h: 16 },
  brickTile: { x: 30, y: 90, w: 16, h: 16 },
  // libassetpack-tiled.png (1488x528px)
  wallBalcony: { x: 850, y: 0, w: 638, h: 300 },
  bookshelf: { x: 385, y: 345, w: 100, h: 175 },
  globe: { x: 143, y: 217, w: 94, h: 118 },
  balconyBench: { x: 360, y: 215, w: 160, h: 118 },
  // furniture03.png (256x256px)
  rug: { x: 49, y: 146, w: 46, h: 28 },
  table: { x: 64, y: 32, w: 64, h: 32 },
  floorBench: { x: 160, y: 0, w: 48, h: 18 },
  lamp: { x: 212, y: 122, w: 34, h: 48 },
  plant: { x: 190, y: 108, w: 35, h: 62 },
};
```

---

### Task 1: Rebuild the floor/brick tilemap at 48×30 @ 16px, rename the scene

**Files:**
- Modify: `assets/js/n5-phaser-game.js` (full rewrite of the existing 51-line scaffold file)
- Test: `<your scratchpad>/verify-task1.js` (throwaway Playwright script, not committed — matches the established no-test-framework convention from sub-project #1)

**Interfaces:**
- Consumes: nothing from earlier tasks (this is the first task of this sub-project; it replaces sub-project #1's scaffold).
- Produces: `ASSET_RECTS` (full object, all 11 keys — later tasks read `wallBalcony`, `bookshelf`, `globe`, `balconyBench`, `rug`, `table`, `floorBench`, `lamp`, `plant` from it), `cropToTexture(scene, sourceKey, rect, destKey)` function, texture keys `'floorsWalls'`, `'furniture03'`, `'libAssetPack'` (loaded in `preload()`, available for later tasks' `cropToTexture` calls), `class LibraryScene` with `this.floorTilemap` / `this.floorLayer`.

- [ ] **Step 1: Write the verification script against the CURRENT (scaffold) code**

Write this to your scratchpad as `verify-task1.js`:

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://localhost:8160/pages/N5/n5-dashboard.html', { waitUntil: 'load' });
  await page.waitForTimeout(300);

  const result = await page.evaluate(() => {
    const scene = window.__n5Game.scene.scenes[0];
    const canvas = document.querySelector('#phaserGame canvas');
    return {
      sceneKey: scene.sys.settings.key,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      aspect: (canvas.width / canvas.height).toFixed(4),
      tileCols: scene.floorTilemap ? scene.floorTilemap.width : null,
      tileRows: scene.floorTilemap ? scene.floorTilemap.height : null,
      tileSize: scene.floorTilemap ? scene.floorTilemap.tileWidth : null,
      gateColIsFloor: scene.floorTilemap
        ? scene.floorTilemap.getTileAt(23, scene.floorTilemap.height - 1).index === 0
        : null,
    };
  });

  console.log(JSON.stringify({ errors, result }, null, 2));
  await browser.close();
})();
```

- [ ] **Step 2: Start a local server and run the script against the scaffold**

```bash
cd "C:\Users\almaz\Downloads\Japanese Web Dev"
python -m http.server 8160
```

In a second terminal, from your scratchpad: `node verify-task1.js`

Expected (against the OLD scaffold code): `sceneKey: "LibraryScaffoldScene"`, `tileCols: 24`, `tileRows: 15`, `tileSize: 32`, `gateColIsFloor: null` (the scaffold has no `floorTilemap` reference under that exact name mismatch is fine either way — the key point is `tileCols`/`tileRows`/`tileSize` show the OLD 24/15/32 values, proving the script correctly observes pre-change state).

- [ ] **Step 3: Rewrite `assets/js/n5-phaser-game.js`**

Replace the entire file contents with:

```js
const ASSET_RECTS = {
  // floors-walls02.png (288x160px)
  floorTile: { x: 220, y: 25, w: 16, h: 16 },
  brickTile: { x: 30, y: 90, w: 16, h: 16 },
  // libassetpack-tiled.png (1488x528px)
  wallBalcony: { x: 850, y: 0, w: 638, h: 300 },
  bookshelf: { x: 385, y: 345, w: 100, h: 175 },
  globe: { x: 143, y: 217, w: 94, h: 118 },
  balconyBench: { x: 360, y: 215, w: 160, h: 118 },
  // furniture03.png (256x256px)
  rug: { x: 49, y: 146, w: 46, h: 28 },
  table: { x: 64, y: 32, w: 64, h: 32 },
  floorBench: { x: 160, y: 0, w: 48, h: 18 },
  lamp: { x: 212, y: 122, w: 34, h: 48 },
  plant: { x: 190, y: 108, w: 35, h: 62 },
};

const GRID_COLS = 48;
const GRID_ROWS = 30;
const TILE_SIZE = 16;
const GATE_COLS = [21, 22, 23, 24, 25, 26];

function cropToTexture(scene, sourceKey, rect, destKey) {
  const srcImage = scene.textures.get(sourceKey).getSourceImage();
  const canvasTexture = scene.textures.createCanvas(destKey, rect.w, rect.h);
  const ctx = canvasTexture.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(srcImage, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
  canvasTexture.refresh();
  return destKey;
}

function buildFloorTileData() {
  const data = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    const row = [];
    for (let x = 0; x < GRID_COLS; x++) {
      const isBorder = x === 0 || y === 0 || x === GRID_COLS - 1 || y === GRID_ROWS - 1;
      const isGate = y === GRID_ROWS - 1 && GATE_COLS.includes(x);
      row.push(isBorder && !isGate ? 1 : 0);
    }
    data.push(row);
  }
  // Improvised staircase step-lines (rows 4-11 band) — no dedicated stair
  // art exists in the source sheets, per the design spec's explicit fallback.
  for (let x = 14; x <= 33; x++) data[6][x] = 1;
  for (let x = 10; x <= 37; x++) data[9][x] = 1;
  return data;
}

class LibraryScene extends Phaser.Scene {
  constructor() {
    super('LibraryScene');
  }

  preload() {
    this.load.image('floorsWalls', '../../assets/images/ui/floors-walls02.png');
    this.load.image('furniture03', '../../assets/images/ui/furniture03.png');
    this.load.image('libAssetPack', '../../assets/images/ui/libassetpack-tiled.png');
  }

  create() {
    const floorSrc = this.textures.get('floorsWalls').getSourceImage();
    const tileTex = this.textures.createCanvas('libraryTiles', TILE_SIZE * 2, TILE_SIZE);
    const tileCtx = tileTex.getContext();
    tileCtx.imageSmoothingEnabled = false;
    tileCtx.drawImage(
      floorSrc,
      ASSET_RECTS.floorTile.x, ASSET_RECTS.floorTile.y, TILE_SIZE, TILE_SIZE,
      0, 0, TILE_SIZE, TILE_SIZE
    );
    tileCtx.drawImage(
      floorSrc,
      ASSET_RECTS.brickTile.x, ASSET_RECTS.brickTile.y, TILE_SIZE, TILE_SIZE,
      TILE_SIZE, 0, TILE_SIZE, TILE_SIZE
    );
    tileTex.refresh();

    const data = buildFloorTileData();
    const map = this.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tileset = map.addTilesetImage('libraryTiles', null, TILE_SIZE, TILE_SIZE);
    const layer = map.createLayer(0, tileset, 0, 0);

    this.floorTilemap = map;
    this.floorLayer = layer;
  }
}

const n5PhaserGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'phaserGame',
  width: 768,
  height: 480,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: LibraryScene,
});

window.__n5Game = n5PhaserGame;
```

- [ ] **Step 4: Re-run the verification script**

`node verify-task1.js` again (server from Step 2 still running).

Expected: `errors: []`, `sceneKey: "LibraryScene"`, `canvasWidth: 768`, `canvasHeight: 480`, `aspect: "1.6000"`, `tileCols: 48`, `tileRows: 30`, `tileSize: 16`, `gateColIsFloor: true`.

- [ ] **Step 5: Stop the server and commit**

Stop the `http.server` process (Ctrl+C).

```bash
cd "C:\Users\almaz\Downloads\Japanese Web Dev"
git add assets/js/n5-phaser-game.js
git commit -m "Replace Phaser scaffold placeholder with real 48x30 floor/brick tilemap"
```

---

### Task 2: Top wall/balcony/curtain backdrop

**Files:**
- Modify: `assets/js/n5-phaser-game.js` (append to the end of `LibraryScene.create()`, immediately after `this.floorLayer = layer;`)
- Test: `<your scratchpad>/verify-task2.js`

**Interfaces:**
- Consumes: `ASSET_RECTS.wallBalcony` (from Task 1), `cropToTexture` (from Task 1), texture key `'libAssetPack'` (from Task 1's `preload()`).
- Produces: `this.furnitureSprites` (object, initialized here — every later task adds keys to this same object), `this.furnitureSprites.wallBalcony`.

- [ ] **Step 1: Write the verification script against Task 1's code**

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://localhost:8160/pages/N5/n5-dashboard.html', { waitUntil: 'load' });
  await page.waitForTimeout(300);

  const result = await page.evaluate(() => {
    const scene = window.__n5Game.scene.scenes[0];
    const wall = scene.furnitureSprites ? scene.furnitureSprites.wallBalcony : null;
    return {
      hasFurnitureSprites: !!scene.furnitureSprites,
      wallDisplayWidth: wall ? wall.displayWidth : null,
      wallDisplayHeight: wall ? wall.displayHeight : null,
      wallX: wall ? wall.x : null,
      wallY: wall ? wall.y : null,
    };
  });

  console.log(JSON.stringify({ errors, result }, null, 2));
  await page.screenshot({ path: 'task2-check.png' });
  await browser.close();
})();
```

- [ ] **Step 2: Run against Task 1's code**

Start the server (`python -m http.server 8160` from the repo root), then `node verify-task2.js`.

Expected (before this task's change): `hasFurnitureSprites: false`, `wallDisplayWidth: null`.

- [ ] **Step 3: Append the wall/balcony backdrop to `create()`**

In `assets/js/n5-phaser-game.js`, insert the following immediately after `this.floorLayer = layer;` (still inside `create()`, before its closing `}`):

```js

    this.furnitureSprites = {};

    const wallRect = ASSET_RECTS.wallBalcony;
    const wallKey = cropToTexture(this, 'libAssetPack', wallRect, 'wallBalconyTex');
    const wallScale = 768 / wallRect.w;
    this.furnitureSprites.wallBalcony = this.add
      .image(0, 0, wallKey)
      .setOrigin(0, 0)
      .setDisplaySize(768, wallRect.h * wallScale);
```

- [ ] **Step 4: Re-run the verification script**

`node verify-task2.js` again.

Expected: `errors: []`, `hasFurnitureSprites: true`, `wallDisplayWidth: 768`, `wallDisplayHeight` ≈ `300.5` (i.e. `300 * (768/638)`, ~361), `wallX: 0`, `wallY: 0`. Read `task2-check.png` — confirm the brick-pillar/blue-curtain/railing structure with its recessed center alcove notch is visible spanning the full canvas width near the top, drawn on top of the floor tilemap.

- [ ] **Step 5: Stop the server and commit**

```bash
cd "C:\Users\almaz\Downloads\Japanese Web Dev"
git add assets/js/n5-phaser-game.js
git commit -m "Add top wall/balcony/curtain backdrop to the library scene"
```

---

### Task 3: Bookshelves, globe, and balcony benches (rows 4-11 zone)

**Files:**
- Modify: `assets/js/n5-phaser-game.js` (append to the end of `create()`, immediately after `this.furnitureSprites.wallBalcony = ...` block)
- Test: `<your scratchpad>/verify-task3.js`

**Interfaces:**
- Consumes: `this.furnitureSprites` (from Task 2), `ASSET_RECTS.bookshelf`/`.globe`/`.balconyBench` (from Task 1), `cropToTexture` (from Task 1), texture key `'libAssetPack'`.
- Produces: `this.furnitureSprites.bookshelfLeft`, `.bookshelfRight`, `.globe`, `.balconyBenchLeft`, `.balconyBenchRight`. Also a local `const balconyBenchKey` inside `create()` that **Task 5 reuses** (same texture, new instances) — do not rename this variable.

- [ ] **Step 1: Write the verification script against Task 2's code**

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://localhost:8160/pages/N5/n5-dashboard.html', { waitUntil: 'load' });
  await page.waitForTimeout(300);

  const result = await page.evaluate(() => {
    const scene = window.__n5Game.scene.scenes[0];
    const keys = Object.keys(scene.furnitureSprites || {}).sort();
    return { keys };
  });

  console.log(JSON.stringify({ errors, result }, null, 2));
  await page.screenshot({ path: 'task3-check.png' });
  await browser.close();
})();
```

- [ ] **Step 2: Run against Task 2's code**

Start the server, then `node verify-task3.js`.

Expected: `result.keys` is exactly `["wallBalcony"]`.

- [ ] **Step 3: Append bookshelves/globe/balcony benches**

Insert immediately after the `.setDisplaySize(768, wallRect.h * wallScale);` line from Task 2:

```js

    const bookshelfKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.bookshelf, 'bookshelfTex');
    const globeKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.globe, 'globeTex');
    const balconyBenchKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.balconyBench, 'balconyBenchTex');

    this.furnitureSprites.bookshelfLeft = this.add.image(50, 260, bookshelfKey).setOrigin(0, 0);
    this.furnitureSprites.bookshelfRight = this.add
      .image(618, 260, bookshelfKey)
      .setOrigin(0, 0)
      .setFlipX(true);
    this.furnitureSprites.globe = this.add.image(334, 280, globeKey).setOrigin(0, 0);
    this.furnitureSprites.balconyBenchLeft = this.add
      .image(170, 310, balconyBenchKey)
      .setOrigin(0, 0)
      .setDisplaySize(112, 83);
    this.furnitureSprites.balconyBenchRight = this.add
      .image(486, 310, balconyBenchKey)
      .setOrigin(0, 0)
      .setFlipX(true)
      .setDisplaySize(112, 83);
```

- [ ] **Step 4: Re-run the verification script**

`node verify-task3.js` again.

Expected: `errors: []`, `result.keys` is exactly `["balconyBenchLeft", "balconyBenchRight", "bookshelfLeft", "bookshelfRight", "globe", "wallBalcony"]`. Read `task3-check.png` — confirm two bookshelves (mirrored) flank the staircase area, a globe sits between/below them, and two small benches sit near the bookshelves, all layered on top of the wall backdrop and floor.

- [ ] **Step 5: Stop the server and commit**

```bash
cd "C:\Users\almaz\Downloads\Japanese Web Dev"
git add assets/js/n5-phaser-game.js
git commit -m "Add bookshelves, globe, and balcony benches to the library scene"
```

---

### Task 4: Center rug and 4 symmetric table+bench+lamp+plant clusters (main floor)

**Files:**
- Modify: `assets/js/n5-phaser-game.js` (append to the end of `create()`, immediately after `this.furnitureSprites.balconyBenchRight = ...` block)
- Test: `<your scratchpad>/verify-task4.js`

**Interfaces:**
- Consumes: `this.furnitureSprites` (from Task 3), `ASSET_RECTS.rug`/`.table`/`.floorBench`/`.lamp`/`.plant` (from Task 1), `cropToTexture` (from Task 1), texture key `'furniture03'`.
- Produces: `this.furnitureSprites.rug0` through `.rug7`, and for each of `clusterLeft1`, `clusterLeft2`, `clusterRight1`, `clusterRight2`: `<name>Table`, `<name>Bench`, `<name>Lamp`, `<name>Plant` keys on `this.furnitureSprites`. A local `placeCluster(name, cx, cy, outerSide)` helper, used only within this task (not consumed later).

- [ ] **Step 1: Write the verification script against Task 3's code**

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://localhost:8160/pages/N5/n5-dashboard.html', { waitUntil: 'load' });
  await page.waitForTimeout(300);

  const result = await page.evaluate(() => {
    const scene = window.__n5Game.scene.scenes[0];
    const keys = Object.keys(scene.furnitureSprites || {}).sort();
    return {
      keyCount: keys.length,
      hasClusterLeft1Table: keys.includes('clusterLeft1Table'),
      hasRug0: keys.includes('rug0'),
    };
  });

  console.log(JSON.stringify({ errors, result }, null, 2));
  await page.screenshot({ path: 'task4-check.png' });
  await browser.close();
})();
```

- [ ] **Step 2: Run against Task 3's code**

Start the server, then `node verify-task4.js`.

Expected: `result.keyCount: 6`, `hasClusterLeft1Table: false`, `hasRug0: false`.

- [ ] **Step 3: Append the rug strip and 4 furniture clusters**

Insert immediately after the `.setFlipX(true).setDisplaySize(112, 83);` line that ends `balconyBenchRight` from Task 3:

```js

    const rugKey = cropToTexture(this, 'furniture03', ASSET_RECTS.rug, 'rugTex');
    const tableKey = cropToTexture(this, 'furniture03', ASSET_RECTS.table, 'tableTex');
    const floorBenchKey = cropToTexture(this, 'furniture03', ASSET_RECTS.floorBench, 'floorBenchTex');
    const lampKey = cropToTexture(this, 'furniture03', ASSET_RECTS.lamp, 'lampTex');
    const plantKey = cropToTexture(this, 'furniture03', ASSET_RECTS.plant, 'plantTex');

    let rugIndex = 0;
    for (let y = 192; y + ASSET_RECTS.rug.h <= 432; y += 30) {
      this.furnitureSprites[`rug${rugIndex}`] = this.add.image(361, y, rugKey).setOrigin(0, 0);
      rugIndex += 1;
    }

    const placeCluster = (name, cx, cy, outerSide) => {
      this.furnitureSprites[`${name}Table`] = this.add
        .image(cx - 32, cy - 16, tableKey)
        .setOrigin(0, 0);
      this.furnitureSprites[`${name}Bench`] = this.add
        .image(cx - 24, cy + 20, floorBenchKey)
        .setOrigin(0, 0);
      const outerX = outerSide === 'left' ? cx - 72 : cx + 38;
      const innerX = outerSide === 'left' ? cx + 38 : cx - 73;
      this.furnitureSprites[`${name}Lamp`] = this.add
        .image(outerX, cy - 24, lampKey)
        .setOrigin(0, 0);
      this.furnitureSprites[`${name}Plant`] = this.add
        .image(innerX, cy - 31, plantKey)
        .setOrigin(0, 0);
    };

    placeCluster('clusterLeft1', 150, 240, 'left');
    placeCluster('clusterLeft2', 150, 360, 'left');
    placeCluster('clusterRight1', 618, 240, 'right');
    placeCluster('clusterRight2', 618, 360, 'right');
```

- [ ] **Step 4: Re-run the verification script**

`node verify-task4.js` again.

Expected: `errors: []`, `result.keyCount: 24` (6 from before + 8 rugs + 4×4 cluster pieces = 6+8+16=30 — recount: rugs fill `y` from 192 while `y + 28 <= 432`, i.e. `y` from 192 to 404 step 30 → 192,222,252,282,312,342,372,402 = 8 rugs; clusters = 4 names × 4 pieces = 16; total new = 24; grand total = 6 + 24 = 30), `hasClusterLeft1Table: true`, `hasRug0: true`. Read `task4-check.png` — confirm a vertical rug runner down the center of the main floor, and 4 symmetric table+bench+lamp+plant clusters (2 left column, 2 right column), lamps on the outer (wall) side and plants on the inner (rug) side of each cluster.

- [ ] **Step 5: Stop the server and commit**

```bash
cd "C:\Users\almaz\Downloads\Japanese Web Dev"
git add assets/js/n5-phaser-game.js
git commit -m "Add center rug strip and 4 symmetric floor furniture clusters"
```

---

### Task 5: Bottom gate benches (rows 27-29 zone)

**Files:**
- Modify: `assets/js/n5-phaser-game.js` (append to the end of `create()`, immediately after the `placeCluster('clusterRight2', 618, 360, 'right');` line)
- Test: `<your scratchpad>/verify-task5.js`

**Interfaces:**
- Consumes: `this.furnitureSprites` (from Task 4), the local `balconyBenchKey` variable declared in Task 3's code (still in lexical scope — same `create()` function body, no re-declaration needed). The gate opening itself (tile-index carve-out at `GATE_COLS` in the bottom border row) was already built into `buildFloorTileData()` in Task 1 — this task ONLY adds the two flanking bench sprites, no tile-data changes.
- Produces: `this.furnitureSprites.gateBenchLeft`, `.gateBenchRight`.

- [ ] **Step 1: Write the verification script against Task 4's code**

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://localhost:8160/pages/N5/n5-dashboard.html', { waitUntil: 'load' });
  await page.waitForTimeout(300);

  const result = await page.evaluate(() => {
    const scene = window.__n5Game.scene.scenes[0];
    const keys = Object.keys(scene.furnitureSprites || {}).sort();
    return { keyCount: keys.length, hasGateBenchLeft: keys.includes('gateBenchLeft') };
  });

  console.log(JSON.stringify({ errors, result }, null, 2));
  await page.screenshot({ path: 'task5-check.png' });
  await browser.close();
})();
```

- [ ] **Step 2: Run against Task 4's code**

Start the server, then `node verify-task5.js`.

Expected: `result.keyCount: 30`, `hasGateBenchLeft: false`.

- [ ] **Step 3: Append the gate-flanking benches**

Insert immediately after `placeCluster('clusterRight2', 618, 360, 'right');`:

```js

    this.furnitureSprites.gateBenchLeft = this.add
      .image(216, 393, balconyBenchKey)
      .setOrigin(0, 0)
      .setDisplaySize(112, 83);
    this.furnitureSprites.gateBenchRight = this.add
      .image(440, 393, balconyBenchKey)
      .setOrigin(0, 0)
      .setFlipX(true)
      .setDisplaySize(112, 83);
```

- [ ] **Step 4: Re-run the verification script**

`node verify-task5.js` again.

Expected: `errors: []`, `result.keyCount: 32`, `hasGateBenchLeft: true`. Read `task5-check.png` — confirm two benches flank the gap in the bottom wall border (the gate opening), and neither bench visually collides badly with the nearest floor furniture cluster (a small corner overlap is acceptable; if the overlap looks wrong, nudge the `x`/`y` values here — this is the one placement most likely to need a small tweak, since the bench is a large asset in a tight bottom band).

- [ ] **Step 5: Stop the server and commit**

```bash
cd "C:\Users\almaz\Downloads\Japanese Web Dev"
git add assets/js/n5-phaser-game.js
git commit -m "Add bottom gate-flanking benches to the library scene"
```

---

### Task 6: End-to-end verification pass

**Files:**
- No source changes — verification only.

**Interfaces:**
- Consumes: everything from Tasks 1-5 (`window.__n5Game`, `scene.floorTilemap`, `scene.furnitureSprites`).

- [ ] **Step 1: Full walkthrough script**

Write to your scratchpad as `verify-task6.js`:

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const results = [];
  for (const vp of [{ w: 1920, h: 1080 }, { w: 1366, h: 768 }, { w: 1280, h: 1024 }]) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    const errors = [];
    const failedRequests = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('requestfailed', (req) => failedRequests.push(req.url()));
    await page.goto('http://localhost:8160/pages/N5/n5-dashboard.html', { waitUntil: 'load' });
    await page.waitForTimeout(500);

    const info = await page.evaluate(() => {
      const scene = window.__n5Game.scene.scenes[0];
      const canvas = document.querySelector('#phaserGame canvas');
      return {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        aspect: (canvas.width / canvas.height).toFixed(4),
        tileCols: scene.floorTilemap.width,
        tileRows: scene.floorTilemap.height,
        tileSize: scene.floorTilemap.tileWidth,
        furnitureKeyCount: Object.keys(scene.furnitureSprites).length,
      };
    });

    const allowedFailures = ['player.js', 'achievement.js', 'default-avatar.png', 'book.png'];
    const unexpectedFailures = failedRequests.filter(
      (url) => !allowedFailures.some((name) => url.includes(name))
    );

    results.push({ vp, errors, unexpectedFailures, info });
    await page.close();
  }
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
```

- [ ] **Step 2: Run it**

Start the server (`python -m http.server 8160` from the repo root), then `node verify-task6.js`.

Expected: for all three viewports — `errors: []`, `unexpectedFailures: []`, `info.canvasWidth: 768`, `info.canvasHeight: 480`, `info.aspect: "1.6000"`, `info.tileCols: 48`, `info.tileRows: 30`, `info.tileSize: 16`, `info.furnitureKeyCount: 32`.

- [ ] **Step 3: Full-scene screenshot**

```js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1900, height: 1100 } });
  await page.goto('http://localhost:8160/pages/N5/n5-dashboard.html', { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'library-real-layout-full.png' });
  await browser.close();
})();
```

Run it, then read `library-real-layout-full.png`. Confirm: real floor planks and brick border (no solid placeholder colors anywhere), the top wall/balcony/curtain backdrop with its recessed alcove notch, two bookshelves + a globe + two small benches in the staircase/balcony band, a center rug runner, 4 symmetric table+bench+lamp+plant clusters, and two benches flanking a visible gap in the bottom wall border — all rendering together with no missing-texture squares and no obvious overlap glitches. Compare informally against the original reference composition (top alcove, descending stair impression, symmetrical balconies, rug, furniture clusters, bottom gate).

- [ ] **Step 4: Stop the server**

Stop the `http.server` process. No commit needed for this task — it's verification-only.

## Self-Review Notes

- **Spec coverage:** grid change (Task 1), floor tileset from real art (Task 1), wall/balcony structure as one static image (Task 2), bookshelves/benches/globe in the staircase zone (Task 3), rug + 4 symmetric clusters on the main floor (Task 4), bottom gate flanked by benches (Task 1's tile carve-out + Task 5's sprites), perimeter brick border (Task 1), `Phaser.Game` config untouched (all tasks), no HTML/CSS changes (all tasks), all six explicit non-goals respected (no task adds player/movement/interaction/lesson-data/review-visuals/cat-avatar/NPCs).
- **Type/naming consistency:** `this.furnitureSprites` is introduced once in Task 2 and only ever added to (never reset or renamed) in Tasks 3-5. `ASSET_RECTS`, `cropToTexture`, and the three texture keys (`floorsWalls`, `furniture03`, `libAssetPack`) are defined once in Task 1 and referenced identically (same names) in every later task. `balconyBenchKey` is declared once (Task 3) and reused by name in Task 5 without re-declaration — Task 5's Interfaces section calls this out explicitly so the implementer doesn't accidentally re-crop it under a different name.
