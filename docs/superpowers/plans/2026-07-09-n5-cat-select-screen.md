# N5 Cat Color-Select Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a pre-map cat color-select screen (orange/black/white, live animated preview) whose choice becomes the map player's animated sprite, reopenable anytime via a HUD button.

**Architecture:** A new Phaser Scene (`CatSelectScene`) runs before the existing `LibraryScene`. It skips straight through to `LibraryScene` if a color is already saved in `localStorage`. `LibraryScene`'s player switches from a static image to one of three looping idle-animation spritesheets, playing while stationary and freezing while moving (no walk-cycle art exists). A HUD button reopens `CatSelectScene` as a paused overlay on top of a running game, without resetting position or progress.

**Tech Stack:** Phaser 3.90.0 (already in use), vanilla JS, `localStorage` (matching the existing `saveProgress()`/`loadProgress()` degrade-to-session-only pattern), no new dependencies.

**Design spec:** [docs/superpowers/specs/2026-07-09-n5-cat-select-screen-design.md](../specs/2026-07-09-n5-cat-select-screen-design.md)

## Global Constraints

- Exactly 3 selectable colors: orange, black, white. No more, no fewer (`CalicoCatIdle.png`/`tuxedoIdle.png` exist but are explicitly out of scope).
- No walk-cycle animation is built or faked — idle plays while stationary, freezes on the current frame while moving.
- New `localStorage` key `nekoBunko.n5.catColor`, independent of the existing `nekoBunko.n5.progress` key. Same try/catch degrade-to-session-only pattern as `saveProgress()`.
- Reuse the `Press Start 2P` font already loaded on `n5-dashboard.html` (via the existing Google Fonts `<link>`) — no new font dependency.
- No changes to the N4 quiz gate mechanic, remaining decor (sofas/wall boards), or the instructions button — those are separate, untouched sub-projects.
- All work lives in the existing single-file pattern (`assets/js/n5-phaser-game.js`) — this project has never split the Phaser game code across files, and this feature doesn't grow the file enough to justify unilaterally starting now (~150 net new lines on top of an existing 867).

---

## File Structure

- Modify: `assets/js/n5-phaser-game.js` — add `CAT_COLORS`/`CAT_COLOR_ORDER` data, `CAT_COLOR_KEY` constant, `loadCatSpritesheets()`/`registerCatAnimations()`/`getSavedCatColor()`/`saveCatColor()` helpers, the new `CatSelectScene` class, `LibraryScene.preload()`/`buildPlayer()`/`update()` changes, a new `LibraryScene.setPlayerCatColor()` method, the `Phaser.Game` config's `scene` array, and the HUD button's click handler.
- Modify: `pages/N5/n5-dashboard.html` — add the "Change" button markup to the existing `#gameHUD` `.hud-right` group.
- No CSS changes — the new button reuses the existing `.hud-btn` class already used by `#musicButton`.

---

### Task 1: Cat color data, spritesheet loading, shared animations

**Files:**
- Modify: `assets/js/n5-phaser-game.js:115` (near `SAVE_KEY`)
- Modify: `assets/js/n5-phaser-game.js:221-228` (`LibraryScene.preload()`)
- Modify: `assets/js/n5-phaser-game.js:230-248` (`LibraryScene.create()`)

**Interfaces:**
- Produces: `CAT_COLORS` (object keyed by `'orange'|'black'|'white'`, each `{key, path, frames, label}`), `CAT_COLOR_ORDER` (array `['orange','black','white']`), `CAT_COLOR_KEY` (string constant), `loadCatSpritesheets(scene)`, `registerCatAnimations(scene)`, `getSavedCatColor()` (returns a valid color id or `null`), `saveCatColor(id)` — all used by Tasks 2-4.

- [ ] **Step 1: Add the cat color data and localStorage key**

In `assets/js/n5-phaser-game.js`, find this existing line (around line 115):

```js
const SAVE_KEY = 'nekoBunko.n5.progress';
```

Add immediately after it:

```js
const CAT_COLOR_KEY = 'nekoBunko.n5.catColor';
// Idle-only spritesheets confirmed present for exactly these 3 colors
// (see design spec) — CalicoCatIdle.png/tuxedoIdle.png also exist but are
// explicitly out of scope ("exactly 3 entries... no more, no fewer").
// All three sheets are 300x300px/frame; frame counts differ per sheet.
const CAT_COLORS = {
  orange: { key: 'orangeCatIdle', path: '../../assets/images/icons/pixels/OrangeCatIdle.png', frames: 12, label: 'Orange' },
  black: { key: 'blackCatIdle', path: '../../assets/images/icons/pixels/blackCatIdle.png', frames: 20, label: 'Black' },
  white: { key: 'whiteCatIdle', path: '../../assets/images/icons/pixels/whitecatIdle.png', frames: 18, label: 'White' },
};
const CAT_COLOR_ORDER = ['orange', 'black', 'white'];
```

- [ ] **Step 2: Add the shared loading/animation/persistence helpers**

In the same file, find the existing `cropToTexture` function (around line 152):

```js
function cropToTexture(scene, sourceKey, rect, destKey) {
```

Add these four new top-level functions immediately **before** it:

```js
function loadCatSpritesheets(scene) {
  CAT_COLOR_ORDER.forEach((id) => {
    const c = CAT_COLORS[id];
    scene.load.spritesheet(c.key, c.path, { frameWidth: 300, frameHeight: 300 });
  });
}

// Idempotent: both CatSelectScene and LibraryScene call this, and Phaser
// throws if you register the same animation key twice.
function registerCatAnimations(scene) {
  CAT_COLOR_ORDER.forEach((id) => {
    const c = CAT_COLORS[id];
    const animKey = id + '-idle';
    if (scene.anims.exists(animKey)) return;
    scene.anims.create({
      key: animKey,
      frames: scene.anims.generateFrameNumbers(c.key, { start: 0, end: c.frames - 1 }),
      frameRate: 8,
      repeat: -1,
    });
  });
}

function getSavedCatColor() {
  try {
    const v = localStorage.getItem(CAT_COLOR_KEY);
    return CAT_COLORS[v] ? v : null;
  } catch (e) {
    return null;
  }
}

function saveCatColor(id) {
  try {
    localStorage.setItem(CAT_COLOR_KEY, id);
  } catch (e) {
    // localStorage unavailable — degrade to session-only, same pattern
    // as saveProgress().
  }
}
```

- [ ] **Step 3: Load the spritesheets and register animations in `LibraryScene`**

Find `LibraryScene.preload()` (around line 221):

```js
  preload() {
    this.load.image('floorsWalls', '../../assets/images/ui/floors-walls02.png');
    this.load.image('furniture03', '../../assets/images/ui/furniture03.png');
    this.load.image('libAssetPack', '../../assets/images/ui/libassetpack-tiled.png');
    this.load.image('doorsWindows', '../../assets/images/ui/TopDownHouse_DoorsAndWindows.png');
    this.load.image('pixellabLibrary', '../../assets/images/ui/pixellab-2d-pixel-library-assets-1783435154845.png');
    this.load.image('catPlayer', '../../assets/images/icons/pixels/fortunecat-Original.png');
  }
```

Replace the last line (`this.load.image('catPlayer', ...)`) with:

```js
    loadCatSpritesheets(this);
  }
```

(The static `fortunecat-Original.png` load is removed — the player now always uses one of the three color spritesheets, wired in Task 3.)

Find `LibraryScene.create()` (around line 230):

```js
  create() {
    this.interactives = []; // { id, kind, sprite, glow, stamp, x, y, prereq/requires }
    this.progress = loadProgress();
    this.furnitureSprites = {};
```

Add a new line right after `this.furnitureSprites = {};`:

```js
    registerCatAnimations(this);
```

- [ ] **Step 4: Verify — reload and check textures/animations registered**

Start the preview server if not already running (`jp-library-static-r3` on port 8210, or start a fresh one), navigate to `http://localhost:<port>/pages/N5/n5-dashboard.html`, then run via `preview_eval`:

```js
(() => {
  const game = window.__n5Game;
  const scene = game.scene.keys.LibraryScene || game.scene.getScenes(true)[0];
  return {
    animsExist: ['orange-idle', 'black-idle', 'white-idle'].map((k) => scene.anims.exists(k)),
    texturesExist: ['orangeCatIdle', 'blackCatIdle', 'whiteCatIdle'].map((k) => scene.textures.exists(k)),
  };
})();
```

Expected: `{ animsExist: [true, true, true], texturesExist: [true, true, true] }`. Also check `preview_console_logs` with `level: 'error'` — expect none related to this change (the game still boots straight into `LibraryScene` at this point since `CatSelectScene` doesn't exist yet — that's Task 2).

- [ ] **Step 5: Commit**

```bash
git add assets/js/n5-phaser-game.js
git commit -m "Add cat color data, spritesheet loading, and idle animations"
```

---

### Task 2: `CatSelectScene` (select UI + boot-skip logic)

**Files:**
- Modify: `assets/js/n5-phaser-game.js` (add new class before the `Phaser.Game` config; modify the config's `scene` array)

**Interfaces:**
- Consumes: `CAT_COLORS`, `CAT_COLOR_ORDER`, `loadCatSpritesheets`, `registerCatAnimations`, `getSavedCatColor`, `saveCatColor` (Task 1). Also calls `libraryScene.setPlayerCatColor(colorId)` in its overlay-confirm branch — that method is defined in Task 3 and only actually invoked once Task 4 wires the HUD button that can reach the overlay path; the non-overlay (first-boot) path used by this task's own verification never calls it.
- Produces: `CatSelectScene` (Phaser Scene class), registered in the game config as the first scene.

- [ ] **Step 1: Add the `CatSelectScene` class**

In `assets/js/n5-phaser-game.js`, find the end of the `LibraryScene` class (the closing brace right before the `Phaser.Game` config, around line 849):

```js
    this.interactives.forEach((entry) => {
      entry.sprite.setScale(entry.baseScale * (entry === near ? 1.08 : 1));
    });
  }
}

const n5PhaserGame = new Phaser.Game({
```

Insert the new class between the `LibraryScene` closing `}` and `const n5PhaserGame = ...`:

```js
class CatSelectScene extends Phaser.Scene {
  constructor() {
    super('CatSelectScene');
  }

  init(data) {
    this.isOverlay = !!(data && data.overlay);
  }

  preload() {
    loadCatSpritesheets(this);
  }

  create() {
    registerCatAnimations(this);

    // First-boot path only: if a color is already saved, skip the select
    // UI entirely and go straight to the map. The overlay path (reopened
    // via the HUD "Change" button, see Task 4) always shows the UI.
    if (!this.isOverlay) {
      const saved = getSavedCatColor();
      if (saved) {
        this.scene.start('LibraryScene');
        return;
      }
    }

    this.selectedIndex = 0;
    this.buildUI();
  }

  buildUI() {
    this.add.rectangle(384, 240, 688, 400, 0x1a1410).setStrokeStyle(3, 0x8a6a3a);

    this.add.text(384, 70, 'Choose Your Cat', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#F0C674',
    }).setOrigin(0.5);

    this.entryTexts = CAT_COLOR_ORDER.map((id, i) => {
      const c = CAT_COLORS[id];
      return this.add.text(110, 150 + i * 50, c.label, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#B08D57',
      }).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.highlight(i))
        .on('pointerup', () => { if (this.selectedIndex === i) this.confirm(); });
    });

    this.previewSprite = this.add.sprite(560, 260, CAT_COLORS[CAT_COLOR_ORDER[0]].key)
      .setDisplaySize(120, 120);

    this.selectButton = this.add.text(110, 350, '[ Select ]', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '13px', color: '#F0C674',
    }).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.confirm());

    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.upKeyWasDown = false;
    this.downKeyWasDown = false;

    this.highlight(0);
  }

  highlight(index) {
    this.selectedIndex = index;
    CAT_COLOR_ORDER.forEach((id, i) => {
      this.entryTexts[i].setColor(i === index ? '#FFDD88' : '#B08D57');
      this.entryTexts[i].setText((i === index ? '▶ ' : '') + CAT_COLORS[id].label);
    });
    const colorId = CAT_COLOR_ORDER[index];
    this.previewSprite.setTexture(CAT_COLORS[colorId].key);
    this.previewSprite.play(colorId + '-idle');
  }

  confirm() {
    const colorId = CAT_COLOR_ORDER[this.selectedIndex];
    saveCatColor(colorId);
    if (this.isOverlay) {
      const libraryScene = this.scene.get('LibraryScene');
      libraryScene.setPlayerCatColor(colorId);
      this.scene.stop('CatSelectScene');
      this.scene.resume('LibraryScene');
    } else {
      this.scene.start('LibraryScene');
    }
  }

  update() {
    const upDown = this.cursors.up.isDown;
    const downDown = this.cursors.down.isDown;
    if (upDown && !this.upKeyWasDown) {
      this.highlight(Math.max(0, this.selectedIndex - 1));
    }
    if (downDown && !this.downKeyWasDown) {
      this.highlight(Math.min(CAT_COLOR_ORDER.length - 1, this.selectedIndex + 1));
    }
    this.upKeyWasDown = upDown;
    this.downKeyWasDown = downDown;
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.confirm();
    }
  }
}

```

- [ ] **Step 2: Register the scene and make it boot first**

Find the `Phaser.Game` config (around line 851-865):

```js
const n5PhaserGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'phaserGame',
  width: 768,
  height: 480,
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: LibraryScene,
});
```

Change `scene: LibraryScene` to:

```js
  scene: [CatSelectScene, LibraryScene],
```

(Phaser boots the first scene in the array automatically — `CatSelectScene` becomes the entry point. `LibraryScene` is registered but not started until `CatSelectScene` calls `this.scene.start('LibraryScene')`.)

- [ ] **Step 3: Verify — first boot shows the select screen**

Clear saved state and reload:

```js
(() => {
  localStorage.removeItem('nekoBunko.n5.catColor');
  window.location.reload();
  return 'reloading';
})();
```

After reload, check the active scene and UI:

```js
(() => {
  const game = window.__n5Game;
  return {
    activeScenes: game.scene.getScenes(true).map((s) => s.scene.key),
    hasEntries: !!(game.scene.getScene('CatSelectScene') && game.scene.getScene('CatSelectScene').entryTexts),
  };
})();
```

Expected: `activeScenes` includes `'CatSelectScene'` (not `'LibraryScene'`), `hasEntries: true`.

- [ ] **Step 4: Verify — preview animates and highlight changes on keyboard/click**

```js
(async () => {
  const game = window.__n5Game;
  const scene = game.scene.getScene('CatSelectScene');
  const frameBefore = scene.previewSprite.frame.name;
  await new Promise((r) => setTimeout(r, 300));
  const frameAfter = scene.previewSprite.frame.name;
  scene.highlight(2); // white
  return {
    frameChanged: frameBefore !== frameAfter,
    afterHighlight: scene.previewSprite.texture.key,
    selectedIndex: scene.selectedIndex,
  };
})();
```

Expected: `frameChanged: true` (the idle loop is actually animating), `afterHighlight: 'whiteCatIdle'`, `selectedIndex: 2`.

- [ ] **Step 5: Verify — confirm saves color and transitions to `LibraryScene`; reload skips straight through**

```js
(async () => {
  const game = window.__n5Game;
  const scene = game.scene.getScene('CatSelectScene');
  scene.confirm();
  await new Promise((r) => setTimeout(r, 300));
  return {
    savedColor: localStorage.getItem('nekoBunko.n5.catColor'),
    libraryActive: game.scene.isActive('LibraryScene'),
  };
})();
```

Expected: `savedColor: 'white'`, `libraryActive: true`. Then reload the page again and confirm `game.scene.isActive('CatSelectScene')` is `false` and `game.scene.isActive('LibraryScene')` is `true` immediately (no visible select-screen flash) — the boot-skip logic from Step 1 of this task.

- [ ] **Step 6: Commit**

```bash
git add assets/js/n5-phaser-game.js
git commit -m "Add CatSelectScene: 3-color list, animated preview, boot-skip when saved"
```

---

### Task 3: `LibraryScene` player uses the saved color's animated sprite

**Files:**
- Modify: `assets/js/n5-phaser-game.js:650-671` (`LibraryScene.buildPlayer()`)
- Modify: `assets/js/n5-phaser-game.js` (add `setPlayerCatColor()` method; add `updatePlayerAnimation()` method; modify `update()`)

**Interfaces:**
- Consumes: `CAT_COLORS`, `getSavedCatColor` (Task 1).
- Produces: `LibraryScene.setPlayerCatColor(colorId)` (called by `CatSelectScene`'s overlay-confirm path from Task 2, and by the HUD button flow in Task 4), `this.catColorId` (instance property other code can read).

- [ ] **Step 1: Use the saved color's spritesheet in `buildPlayer()`**

Find `buildPlayer()` (around line 650):

```js
  buildPlayer() {
    // Spawns at the south gate now (the door/north entrance is gone —
    // the staircase at the north end is the N4 exit, not an entry
    // point), on the rug just above the gate opening.
    const spawnX = WORLD_W / 2;
    const spawnY = WORLD_H - 70;
    this.player = this.physics.add.sprite(spawnX, spawnY, 'catPlayer');
    this.player.setDisplaySize(30, 30);
    this.player.body.setSize(this.player.width * 0.5, this.player.height * 0.5);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(5);

    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.physics.add.collider(this.player, this.solidGroup || (this.solidGroup = this.physics.add.staticGroup()));
    this.physics.add.collider(this.player, this.wallGroup);

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);

    this.moveQueue = null;
    this.pendingInteract = null;
  }
```

Replace the middle section (from `const spawnX` through `this.player.setDepth(5);`) with:

```js
  buildPlayer() {
    // Spawns at the south gate now (the door/north entrance is gone —
    // the staircase at the north end is the N4 exit, not an entry
    // point), on the rug just above the gate opening.
    const spawnX = WORLD_W / 2;
    const spawnY = WORLD_H - 70;
    // LibraryScene is only ever reached after CatSelectScene has run (or
    // skipped itself because a color was already saved), so a saved
    // color always exists here — 'orange' is a defensive fallback only,
    // not an expected runtime path.
    this.catColorId = getSavedCatColor() || 'orange';
    this.player = this.physics.add.sprite(spawnX, spawnY, CAT_COLORS[this.catColorId].key);
    this.player.setDisplaySize(30, 30);
    // Deliberately left as `this.player.width` (frame-native size, NOT
    // displaySize) — investigated during planning and confirmed this
    // already produces an oversized/off-center Arcade body relative to
    // the 30x30 visual (512x512 with the old 1024px-native image; empty
    // solidGroup + walls-only collision since Round 2 means it's never
    // been visibly exercised). Switching to 300x300-native spritesheets
    // here SHRINKS that same pre-existing body to 150x150 — proportionally
    // identical misalignment, strictly smaller in absolute terms — so
    // this line is intentionally NOT "fixed" as part of this task to
    // avoid scope creep into an unrelated, seemingly-harmless bug whose
    // proper fix (Arcade body offset for non-1:1-scaled sprites) turned
    // out to be non-trivial when spiked. Leave for a future pass if it
    // ever causes a visible symptom.
    this.player.body.setSize(this.player.width * 0.5, this.player.height * 0.5);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(5);
    this.player.play(this.catColorId + '-idle');

    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.physics.add.collider(this.player, this.solidGroup || (this.solidGroup = this.physics.add.staticGroup()));
    this.physics.add.collider(this.player, this.wallGroup);

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);

    this.moveQueue = null;
    this.pendingInteract = null;
  }

  // Called by CatSelectScene when reopened mid-game via the HUD "Change"
  // button (Task 4) — swaps the live player's sprite without resetting
  // position, camera, or progress. The next updatePlayerAnimation() tick
  // corrects play/freeze state based on actual velocity regardless of
  // whether the player happened to be moving when this was called.
  setPlayerCatColor(colorId) {
    this.catColorId = colorId;
    this.player.setTexture(CAT_COLORS[colorId].key);
    this.player.play(colorId + '-idle');
  }
```

- [ ] **Step 2: Add the idle/freeze animation helper**

Find the `addSolid` method (right after `buildPlayer()`, around line 673):

```js
  addSolid(x, y, w, h) {
```

Add a new method immediately before it:

```js
  // Idle plays while stationary; freezes on the current frame while
  // moving (no walk-cycle art exists for any color — see design spec).
  // Reads this.player.body.velocity, which Phaser only updates when
  // setVelocity() is called — so this runs at the TOP of update(), before
  // this frame's movement branches set a new velocity, meaning it reacts
  // to last frame's velocity. One frame of lag at 60fps is imperceptible.
  updatePlayerAnimation() {
    const vel = this.player.body.velocity;
    const moving = Math.abs(vel.x) > 0.5 || Math.abs(vel.y) > 0.5;
    if (moving) {
      if (this.player.anims.isPlaying) this.player.anims.stop();
    } else if (!this.player.anims.isPlaying) {
      this.player.play(this.catColorId + '-idle');
    }
  }

  addSolid(x, y, w, h) {
```

- [ ] **Step 3: Call it from `update()`**

Find `update()` (around line 790):

```js
  update() {
    if (this.panelOpen) {
      this.player.setVelocity(0, 0);
      return;
    }
```

Add a call as the very first line inside `update()`:

```js
  update() {
    this.updatePlayerAnimation();
    if (this.panelOpen) {
      this.player.setVelocity(0, 0);
      return;
    }
```

- [ ] **Step 4: Verify — player spawns with the saved color, animating while stationary**

Reload (color from Task 2's Step 5 test, `'white'`, is still saved) and check:

```js
(() => {
  const game = window.__n5Game;
  const scene = game.scene.getScene('LibraryScene');
  return {
    catColorId: scene.catColorId,
    textureKey: scene.player.texture.key,
    isPlayingIdle: scene.player.anims.isPlaying,
    currentAnimKey: scene.player.anims.currentAnim ? scene.player.anims.currentAnim.key : null,
  };
})();
```

Expected: `catColorId: 'white'`, `textureKey: 'whiteCatIdle'`, `isPlayingIdle: true`, `currentAnimKey: 'white-idle'`.

- [ ] **Step 5: Verify — animation freezes while moving, resumes when stopped**

```js
(async () => {
  const game = window.__n5Game;
  const scene = game.scene.getScene('LibraryScene');
  scene.player.setVelocity(100, 0); // simulate movement directly
  await new Promise((r) => setTimeout(r, 200));
  const whileMoving = scene.player.anims.isPlaying;
  scene.player.setVelocity(0, 0);
  await new Promise((r) => setTimeout(r, 200));
  const afterStopping = scene.player.anims.isPlaying;
  return { whileMoving, afterStopping };
})();
```

Expected: `whileMoving: false`, `afterStopping: true`.

- [ ] **Step 6: Regression-check auto-walk still works end-to-end**

The animation hook runs before the existing movement/auto-walk logic and doesn't touch `moveQueue`, `setVelocity` call sites, or collision — but confirm one representative auto-walk still completes cleanly:

```js
(async () => {
  const game = window.__n5Game;
  const scene = game.scene.getScene('LibraryScene');
  const entry = scene.interactives.find((e) => e.id === 'shelf-01');
  scene.player.setPosition(448, 1250);
  scene.moveQueue = null;
  scene.pendingInteract = null;
  scene.closePanel();
  scene.handleInteractiveClick(entry);
  const t0 = Date.now();
  let arrived = false;
  while (Date.now() - t0 < 9000) {
    await new Promise((r) => setTimeout(r, 100));
    const qEmpty = !scene.moveQueue || scene.moveQueue.length === 0;
    if (qEmpty && !scene.pendingInteract) { arrived = true; break; }
  }
  return { arrived, panelOpen: scene.panelOpen };
})();
```

Expected: `{ arrived: true, panelOpen: true }` — matches the same result this exact check produced before this task's changes (see prior session verification).

- [ ] **Step 7: Commit**

```bash
git add assets/js/n5-phaser-game.js
git commit -m "LibraryScene player uses the saved cat color's animated sprite"
```

---

### Task 4: HUD "Change" button + overlay reopen flow

**Files:**
- Modify: `pages/N5/n5-dashboard.html` (add button markup)
- Modify: `assets/js/n5-phaser-game.js` (add click handler after game creation)

**Interfaces:**
- Consumes: `n5PhaserGame` (Phaser.Game instance, already exists at the bottom of the file), `LibraryScene.setPlayerCatColor` (Task 3), `CatSelectScene`'s `overlay` init-data handling (Task 2).

- [ ] **Step 1: Add the button markup**

In `pages/N5/n5-dashboard.html`, find the `musicButton` inside `.hud-right` (around line 187):

```html
        <button
            id="musicButton"
            class="hud-btn">

            <i class="bi bi-volume-up-fill"></i>

        </button>
```

Add a new button immediately before it:

```html
        <button
            id="changeCharBtn"
            class="hud-btn">

            🐱 Change

        </button>

        <button
            id="musicButton"
            class="hud-btn">

            <i class="bi bi-volume-up-fill"></i>

        </button>
```

(Reuses the existing `.hud-btn` class — no new CSS needed.)

- [ ] **Step 2: Wire the click handler**

In `assets/js/n5-phaser-game.js`, find the end of the file (around line 866):

```js
  scene: [CatSelectScene, LibraryScene],
});

window.__n5Game = n5PhaserGame;
```

(If `window.__n5Game = n5PhaserGame;` isn't immediately after the config in your current copy, find wherever it is — it's the last line of the file.) Add after it:

```js

document.getElementById('changeCharBtn')?.addEventListener('click', () => {
  if (!n5PhaserGame.scene.isActive('LibraryScene')) return;
  const libraryScene = n5PhaserGame.scene.getScene('LibraryScene');
  if (libraryScene.panelOpen) return; // don't stack over an open lesson/review panel
  n5PhaserGame.scene.pause('LibraryScene');
  n5PhaserGame.scene.launch('CatSelectScene', { overlay: true });
});
```

- [ ] **Step 3: Verify — overlay opens, confirming updates the live player without resetting position**

Reload the page (skips straight to `LibraryScene` since a color is saved from Task 2's test), then:

```js
(async () => {
  const game = window.__n5Game;
  const scene = game.scene.getScene('LibraryScene');
  scene.player.setPosition(300, 900); // simulate being mid-map with progress
  scene.progress['shelf-01'] = true;
  saveProgress(scene.progress);

  document.getElementById('changeCharBtn').click();
  await new Promise((r) => setTimeout(r, 200));
  const overlayActive = game.scene.isActive('CatSelectScene');
  const libraryPaused = game.scene.isPaused('LibraryScene');

  const selectScene = game.scene.getScene('CatSelectScene');
  selectScene.highlight(0); // orange
  selectScene.confirm();
  await new Promise((r) => setTimeout(r, 200));

  return {
    overlayActive,
    libraryPaused,
    overlayStillActive: game.scene.isActive('CatSelectScene'),
    libraryResumed: game.scene.isActive('LibraryScene') && !game.scene.isPaused('LibraryScene'),
    newColor: scene.catColorId,
    newTexture: scene.player.texture.key,
    positionPreserved: scene.player.x === 300 && scene.player.y === 900,
    progressPreserved: scene.progress['shelf-01'] === true,
  };
})();
```

Expected: `overlayActive: true`, `libraryPaused: true`, `overlayStillActive: false`, `libraryResumed: true`, `newColor: 'orange'`, `newTexture: 'orangeCatIdle'`, `positionPreserved: true`, `progressPreserved: true`.

- [ ] **Step 4: Verify — guarded against opening while a lesson panel is open**

```js
(async () => {
  const game = window.__n5Game;
  const scene = game.scene.getScene('LibraryScene');
  const entry = scene.interactives.find((e) => e.id === 'shelf-01');
  scene.openPanel(entry);
  document.getElementById('changeCharBtn').click();
  await new Promise((r) => setTimeout(r, 200));
  const overlayLaunched = game.scene.isActive('CatSelectScene');
  scene.closePanel();
  return { panelWasOpen: true, overlayLaunched };
})();
```

Expected: `overlayLaunched: false` (the guard in Step 2 prevented it).

- [ ] **Step 5: Full click-through smoke test in the browser**

Using `preview_click`/`preview_snapshot` (not just `preview_eval`): clear `localStorage`, reload, confirm the select screen is visible via `preview_snapshot`, click an entry then the Select button (or press Enter via keyboard simulation), confirm the map loads with the chosen cat visible via `preview_screenshot`. Then click the new "🐱 Change" HUD button, confirm the overlay screenshot shows the select UI on top of the (frozen) map, pick a different color, confirm the map's player sprite changed color in a follow-up screenshot.

- [ ] **Step 6: Commit**

```bash
git add pages/N5/n5-dashboard.html assets/js/n5-phaser-game.js
git commit -m "Add HUD change-character button and CatSelectScene overlay reopen flow"
```

---

## Self-Review Notes (for whoever executes this plan)

- **Spec coverage:** All Goals from the design spec are covered — Task 1 (data/anims), Task 2 (select UI + boot-skip), Task 3 (animated map player + freeze-on-move), Task 4 (HUD reopen + overlay, panel-open guard). The design spec's Error handling section's three cases are all addressed: invalid/missing localStorage value → `getSavedCatColor()`'s `CAT_COLORS[v] ? v : null` check (Task 1); localStorage unavailable → try/catch in `saveCatColor`/`getSavedCatColor` (Task 1); reopen-while-panel-open → explicit guard (Task 4, Step 2).
- **Type/name consistency check:** `CAT_COLORS`/`CAT_COLOR_ORDER`/`CAT_COLOR_KEY` (Task 1) are used with identical names in Tasks 2-4. `setPlayerCatColor` (defined Task 3) is called with that exact name in Task 2's `confirm()` and is the method Task 4's verification checks against. `this.catColorId` is set in both `buildPlayer()` and `setPlayerCatColor()` (Task 3) and read by `updatePlayerAnimation()` (Task 3) and Task 4's verification — consistent throughout.
- **No placeholders:** every step has complete, runnable code — no "add appropriate handling" style gaps.
