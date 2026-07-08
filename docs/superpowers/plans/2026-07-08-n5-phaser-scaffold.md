# N5 Phaser Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mount Phaser 3 on the N5 dashboard page, rendering a placeholder tile grid through the same Tilemap API a real tileset will use later, with the camera fixed and the frame's existing 16:10 responsive behavior preserved.

**Architecture:** Phaser 3 loaded via CDN `<script>` tag (no npm/bundler). The old CSS library-room/cat/lesson-node markup and its four driver scripts are stripped from `pages/N5/n5-dashboard.html` and replaced with one empty `#phaserGame` mount div. A new `assets/js/n5-phaser-game.js` creates a `Phaser.Game` with one scene (`LibraryScaffoldScene`) that generates a 2-tile placeholder texture at runtime and builds a 24×15 tilemap (32px tiles = 768×480 = 16:10) with a solid wall border and floor interior.

**Tech Stack:** Phaser 3.90.0 (CDN), vanilla JS, no build step. Verification uses Playwright (already available in this environment via the parent `node_modules`) driven by plain Node scripts — there is no existing test framework in this repo to plug into.

## Global Constraints

- No npm, no bundler, no `package.json` addition — CDN `<script>` tag only, per the spec.
- Phaser version pinned to `3.90.0` via `https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js` (verified reachable — returns HTTP 200).
- Design resolution is fixed at 768×480 (32px tiles, 24×15 grid) — exactly 16:10, matching `#mapFrame`'s existing `aspect-ratio:16/10` in `n5-dashboard.css`. Do not change that CSS.
- `n5-map.js`, `n5-popup.js`, `n5-avatar-picker.js`, `n5-save.js` and the `.library-room`/`.cat`/`.furniture-node`/`.avatar-picker` CSS rules are left in the repo untouched — only unlinked from `n5-dashboard.html`. Do not delete these files or rules in this plan.
- Everything outside `#mapFrame` (`#gameHUD`, `#dashboardFooter`, `#sakura-container`, `#teleport-overlay`, `#achievement-container`, the audio elements, and their scripts) must be untouched and still present/functional after both tasks.
- Work happens on the `n5-phaser-migration` branch (already checked out).

---

## Setup (once, before Task 1)

The verification scripts below need a running static server and Playwright
(already installed globally and resolvable from this repo — confirmed via
`node -e "require('playwright')"`).

- [ ] **Step 1: Start the static server in the background**

```bash
cd "C:\Users\almaz\Downloads\Japanese Web Dev"
python -m http.server 8140
```

Run this in the background (it must stay up for both tasks). Confirm it's
serving:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8140/pages/N5/n5-dashboard.html
```

Expected: `200`

---

### Task 1: Strip old map markup, add empty Phaser mount point

**Files:**
- Modify: `pages/N5/n5-dashboard.html:207-645` (the entire `<main id="journeyMap">...</main>` block)
- Modify: `pages/N5/n5-dashboard.html:822-830` (the "Dashboard" script block)
- Test script: `<scratchpad>/verify-task1.js` (throwaway, not committed — write it in the session scratchpad directory: `C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Downloads-Japanese-Web-Dev\276c3d75-192f-440e-aec1-a3a6d96d6539\scratchpad`)

**Interfaces:**
- Produces: an empty `<div id="phaserGame"></div>` inside `#mapFrame`, which Task 2 mounts the Phaser game into. Produces the Phaser 3 CDN `<script>` tag (must load before Task 2's `n5-phaser-game.js` tag, which Task 2 appends immediately after it).

- [ ] **Step 1: Write the verification script**

Create `verify-task1.js` in the scratchpad directory:

```js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto('http://localhost:8140/pages/N5/n5-dashboard.html');
  await page.waitForTimeout(500);

  const checks = await page.evaluate(() => ({
    phaserGameExists: !!document.querySelector('#phaserGame'),
    phaserGameEmpty: document.querySelector('#phaserGame') ? document.querySelector('#phaserGame').children.length === 0 : false,
    playerCharacterGone: !document.querySelector('#playerCharacter'),
    avatarPickerGone: !document.querySelector('#avatarPicker'),
    lessonMapGone: !document.querySelector('#lessonMap'),
    libraryRoomGone: !document.querySelector('.library-room'),
    hudPresent: !!document.querySelector('#gameHUD'),
    footerPresent: !!document.querySelector('#dashboardFooter'),
    phaserLoaded: typeof window.Phaser !== 'undefined',
  }));

  await browser.close();

  const failures = Object.entries(checks).filter(([, v]) => v !== true).map(([k]) => k);
  if (consoleErrors.length) failures.push('consoleErrors: ' + JSON.stringify(consoleErrors));

  if (failures.length) {
    console.log('FAIL', JSON.stringify({ failures, checks }, null, 2));
    process.exit(1);
  }
  console.log('PASS', JSON.stringify(checks, null, 2));
})();
```

- [ ] **Step 2: Run it against the current (unmodified) page to confirm it fails for the right reasons**

```bash
node "C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Downloads-Japanese-Web-Dev\276c3d75-192f-440e-aec1-a3a6d96d6539\scratchpad\verify-task1.js"
```

Expected: exit code 1, `FAIL` with a `failures` array including at least
`phaserGameExists`, `phaserGameEmpty`, `playerCharacterGone`,
`avatarPickerGone`, `lessonMapGone`, `libraryRoomGone`, and `phaserLoaded`
(all currently false/failing because none of this exists yet on the
unmodified page).

- [ ] **Step 3: Replace the `<main id="journeyMap">` block**

In `pages/N5/n5-dashboard.html`, delete everything from line 207
(`<main id="journeyMap">`) through line 645 (`</main>`) inclusive, and
replace it with:

```html
<main id="journeyMap">

    <div id="mapFrame">

        <div id="phaserGame"></div>

    </div>

</main>
```

- [ ] **Step 4: Replace the "Dashboard" script block**

In the same file, delete lines 822-830 (the `<!-- Dashboard -->` comment
through the `n5-map.js` script tag) and replace with:

```html
<!-- Dashboard -->

<script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"></script>
```

(Task 2 appends the `n5-phaser-game.js` tag directly after this line.)

- [ ] **Step 5: Run the verification script again to confirm it passes**

```bash
node "C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Downloads-Japanese-Web-Dev\276c3d75-192f-440e-aec1-a3a6d96d6539\scratchpad\verify-task1.js"
```

Expected: exit code 0, `PASS` with every check `true` and no console errors.

- [ ] **Step 6: Commit**

```bash
cd "C:\Users\almaz\Downloads\Japanese Web Dev"
git add pages/N5/n5-dashboard.html
git commit -m "$(cat <<'EOF'
Strip old library-map markup from n5-dashboard, add Phaser mount point

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Phaser game + placeholder tilemap scene

**Files:**
- Create: `assets/js/n5-phaser-game.js`
- Modify: `pages/N5/n5-dashboard.html` (append one script tag after the Phaser CDN tag added in Task 1)
- Test script: `<scratchpad>/verify-task2.js`

**Interfaces:**
- Consumes: `#phaserGame` div and the loaded `window.Phaser` global from Task 1.
- Produces: `window.__n5Game` (the `Phaser.Game` instance, for test/debug inspection) and a `LibraryScaffoldScene` reachable via `window.__n5Game.scene.getScene('LibraryScaffoldScene')`, exposing `.libraryTilemap` (the `Phaser.Tilemaps.Tilemap` instance) and `.libraryLayer` (the rendered layer) as scene properties.

- [ ] **Step 1: Write the verification script**

Create `verify-task2.js` in the scratchpad directory:

```js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto('http://localhost:8140/pages/N5/n5-dashboard.html');
  await page.waitForFunction(
    () => window.__n5Game && window.__n5Game.scene.getScene('LibraryScaffoldScene') && window.__n5Game.scene.getScene('LibraryScaffoldScene').libraryTilemap,
    null,
    { timeout: 5000 }
  ).catch(() => {});

  const checks = await page.evaluate(() => {
    const scene = window.__n5Game && window.__n5Game.scene.getScene('LibraryScaffoldScene');
    const map = scene && scene.libraryTilemap;
    const canvas = document.querySelector('#phaserGame canvas');
    return {
      gameExists: !!window.__n5Game,
      canvasExists: !!canvas,
      canvasWidth: canvas ? canvas.width : null,
      canvasHeight: canvas ? canvas.height : null,
      mapWidth: map ? map.width : null,
      mapHeight: map ? map.height : null,
      mapTileWidth: map ? map.tileWidth : null,
    };
  });

  await page.setViewportSize({ width: 1200, height: 900 });
  await page.waitForTimeout(200);
  const boxWide = await page.evaluate(() => {
    const c = document.querySelector('#phaserGame canvas');
    return c ? c.getBoundingClientRect() : null;
  });

  await page.setViewportSize({ width: 400, height: 900 });
  await page.waitForTimeout(200);
  const boxNarrow = await page.evaluate(() => {
    const c = document.querySelector('#phaserGame canvas');
    return c ? c.getBoundingClientRect() : null;
  });

  await page.screenshot({ path: 'n5-phaser-scaffold-screenshot.png' });

  await browser.close();

  const failures = [];
  if (!checks.gameExists) failures.push('gameExists false');
  if (!checks.canvasExists) failures.push('canvasExists false');
  if (checks.canvasWidth !== 768) failures.push('canvasWidth=' + checks.canvasWidth);
  if (checks.canvasHeight !== 480) failures.push('canvasHeight=' + checks.canvasHeight);
  if (checks.mapWidth !== 24) failures.push('mapWidth=' + checks.mapWidth);
  if (checks.mapHeight !== 15) failures.push('mapHeight=' + checks.mapHeight);
  if (checks.mapTileWidth !== 32) failures.push('mapTileWidth=' + checks.mapTileWidth);

  const aspectWide = boxWide ? boxWide.width / boxWide.height : null;
  const aspectNarrow = boxNarrow ? boxNarrow.width / boxNarrow.height : null;
  if (!aspectWide || Math.abs(aspectWide - 1.6) > 0.05) failures.push('aspect at wide viewport=' + aspectWide);
  if (!aspectNarrow || Math.abs(aspectNarrow - 1.6) > 0.05) failures.push('aspect at narrow viewport=' + aspectNarrow);

  if (consoleErrors.length) failures.push('consoleErrors: ' + JSON.stringify(consoleErrors));

  if (failures.length) {
    console.log('FAIL', JSON.stringify({ failures, checks, aspectWide, aspectNarrow }, null, 2));
    process.exit(1);
  }
  console.log('PASS', JSON.stringify({ checks, aspectWide, aspectNarrow }, null, 2));
})();
```

- [ ] **Step 2: Run it against the current page (no game script yet) to confirm it fails**

```bash
node "C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Downloads-Japanese-Web-Dev\276c3d75-192f-440e-aec1-a3a6d96d6539\scratchpad\verify-task2.js"
```

Expected: exit code 1, `FAIL` with `gameExists false` and `canvasExists false`
among the failures.

- [ ] **Step 3: Create `assets/js/n5-phaser-game.js`**

```js
class LibraryScaffoldScene extends Phaser.Scene {
  constructor() {
    super('LibraryScaffoldScene');
  }

  preload() {
    const gfx = this.make.graphics();
    gfx.fillStyle(0x3b2a1e, 1);
    gfx.fillRect(0, 0, 32, 32);
    gfx.fillStyle(0x6e4a2e, 1);
    gfx.fillRect(32, 0, 32, 32);
    gfx.generateTexture('placeholder-tiles', 64, 32);
    gfx.destroy();
  }

  create() {
    const cols = 24;
    const rows = 15;
    const data = [];
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        const isBorder = x === 0 || y === 0 || x === cols - 1 || y === rows - 1;
        row.push(isBorder ? 1 : 0);
      }
      data.push(row);
    }

    const map = this.make.tilemap({ data, tileWidth: 32, tileHeight: 32 });
    const tileset = map.addTilesetImage('placeholder-tiles', null, 32, 32);
    const layer = map.createLayer(0, tileset, 0, 0);

    this.libraryTilemap = map;
    this.libraryLayer = layer;
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
  scene: LibraryScaffoldScene,
});

window.__n5Game = n5PhaserGame;
```

- [ ] **Step 4: Add the script tag**

In `pages/N5/n5-dashboard.html`, immediately after the Phaser CDN `<script>`
tag added in Task 1, add:

```html
<script src="../../assets/js/n5-phaser-game.js"></script>
```

- [ ] **Step 5: Run the verification script again to confirm it passes**

```bash
node "C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Downloads-Japanese-Web-Dev\276c3d75-192f-440e-aec1-a3a6d96d6539\scratchpad\verify-task2.js"
```

Expected: exit code 0, `PASS`, with `mapWidth: 24`, `mapHeight: 15`,
`mapTileWidth: 32`, `canvasWidth: 768`, `canvasHeight: 480`, both aspect
ratios within 0.05 of 1.6, and no console errors. A screenshot is written to
`n5-phaser-scaffold-screenshot.png` in the current working directory —
open it to visually confirm a walled placeholder room renders inside the
frame.

- [ ] **Step 6: Stop the background server**

Stop the `python -m http.server 8140` process started in Setup.

- [ ] **Step 7: Commit**

```bash
cd "C:\Users\almaz\Downloads\Japanese Web Dev"
git add assets/js/n5-phaser-game.js pages/N5/n5-dashboard.html
git commit -m "$(cat <<'EOF'
Add Phaser 3 scaffold scene with placeholder tilemap for N5 library map

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Plan Self-Review Notes

- **Spec coverage:** Every goal in the design spec's "Goals (this sub-project
  only)" section maps to a task: Phaser mounted + tilemap/camera pipeline
  proven → Task 2; Tilemap-API pattern reusable by later sub-projects →
  Task 2's `make.tilemap`/`addTilesetImage` approach; 16:10 match → Task 2's
  768×480 config + Task 2 Step 5's aspect-ratio checks. The spec's
  non-goals (no player/movement/collision/lessons/cats) are intentionally
  absent from both tasks. The spec's "old scripts stay in repo, just
  unlinked" requirement is captured in Global Constraints and Task 1 only
  removes the `<script>` tags, never the files.
- **Placeholder scan:** No TBD/TODO; every step has literal code or an exact
  command with expected output.
- **Type consistency:** `libraryTilemap`/`libraryLayer` property names on
  the scene (Task 2 Step 3) match what Task 2's own verification script
  reads (Step 1/Step 5) — no other task references them yet (later
  sub-projects will, but that's out of scope here).
