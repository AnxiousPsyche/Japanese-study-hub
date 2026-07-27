// N4LibraryScene — second explorable floor, reached from N5's staircase.
// Mirrors n5-phaser-game.js's LibraryScene structurally (buildScene()
// calling buildFloor/buildWalls/buildTopBand/buildFurniture/buildShelves/
// buildBookPiles/buildPlayer, preload(), update()) but mixes in the
// reusable engine extracted to library-scene-shared.js (Task 1) instead
// of duplicating that code. This floor will contain BOTH N4 and N3
// content (split left/right column, gated by an exam-gate interactive —
// see docs/superpowers/specs/2026-07-27-n4-second-floor-design.md) — the
// "N4" naming throughout this file is just this floor's identifier, not
// a claim that it's N4-only content.
//
// This file (Task 2) is scaffolding only: world-size constants, this
// floor's own persistence keys, the cat-avatar data copied verbatim from
// N5 (same 3 avatars, no new art), and an N4LibraryScene skeleton whose
// build*() methods are still no-op stubs. World geometry, shelves, the
// exam gate, and the player all arrive in Tasks 3-6.

const TILE_SIZE = 16;
const GRID_COLS = 72;
const GRID_ROWS = 130; // revised down from 180 — see Task 4 (only 2 physical shelf-rows needed, not 4)
const WORLD_W = GRID_COLS * TILE_SIZE; // 1152
const WORLD_H = GRID_ROWS * TILE_SIZE; // 2080

// -- Movement/collision constants, copied verbatim from n5-phaser-game.js --
const ARRIVE_THRESHOLD = 74; // px — how close auto-walk needs to get before stopping, n5-phaser-game.js:7242
// Height of the solid north-wall header buildTopBand() draws (Task 3) —
// shared with buildWalls() so the side-wall brick strip starts exactly
// below it instead of visually colliding with it (same reasoning as N5's
// buildWalls()/buildTopBand() split, n5-phaser-game.js:7757).
const TOP_BAND_HEIGHT = 110;

// Local subset of n5-phaser-game.js's ASSET_RECTS (that file isn't loaded
// on this page — see n4-dashboard.html's script list — so its rects
// aren't reachable as bare identifiers here). Same source sheets, same
// crop coordinates verbatim: this floor's floor/wall texture is
// deliberately identical art to N5's (theme comes from N4_PALETTE-driven
// furniture/accent color in later tasks, not a different floor crop —
// see the design spec).
const ASSET_RECTS = {
  brickTile: { x: 30, y: 90, w: 16, h: 16 }, // floors-walls02.png, n5-phaser-game.js:5
  topDownFloorTile: { x: 81, y: 81, w: 63, h: 46 }, // TopDownHouse_FloorsAndWalls.png, n5-phaser-game.js:13
};

// Distinct accent palette for this floor (deeper wine/green/wood instead
// of N5's warm red reception) — see design spec's Theme section. Not
// wired into any texture yet (Tasks 3-6); drawWovenRug's optional
// `palette` param (library-scene-shared.js) is what will eventually
// consume this.
const N4_PALETTE = {
  carpet: 0x5c1a2e,
  accentGreen: 0x1f3d2b,
  darkWood: 0x3a2415,
  gold: 0xd4a24c,
};

// -- Persistence: this floor's own localStorage keys --------------------
// Per CLAUDE.md's "one key per concern" pattern — N4 progress/favorites/
// lesson-page state is separate from N5's (nekoBunko.n5.*), since it's a
// different floor's worth of shelves. Cat color/animations are the one
// exception (see CAT_COLOR_KEY below) — that's a player-level preference
// set once in N5's CatSelectScene, not a per-floor concern, so N4 reads
// it from N5's existing key rather than duplicating a select step.

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

// -- Cat avatar data — copied verbatim from n5-phaser-game.js -----------
// Same 3 cat avatars, same animation rig, same sensei portrait; no new
// art packs for this floor (per the design spec). CAT_COLOR_KEY
// deliberately reuses N5's own key ('nekoBunko.n5.catColor') rather than
// a n4-scoped one — see the persistence note above.

const CAT_COLOR_KEY = 'nekoBunko.n5.catColor';
// Idle + 4-directional walk, all 3 colors, confirmed present for exactly
// these 3 colors (see design spec) — CalicoCatIdle.png/tuxedoIdle.png
// also exist but are explicitly out of scope ("exactly 3 entries... no
// more, no fewer"). Each sheet is a single 64x64-frame, 14-col x 72-row
// grid covering a much larger animation rig (idle/walk/sleep/etc.) — only
// the idle and walk rows are used here. Filenames were renamed from
// "cat N (64х64).png" (Cyrillic х) to plain ASCII to make them safe to
// reference from source. Row-to-animation mapping was confirmed by
// visually inspecting the actual sheets (not assumed) — see
// CAT_SHEET_ROWS below.
const CAT_COLORS = {
  orange: { key: 'orangeCatSheet', path: '../../assets/images/avatars/cat-2-64x64.png', label: 'Orange' },
  black: { key: 'blackCatSheet', path: '../../assets/images/avatars/cat-1-64x64.png', label: 'Black' },
  white: { key: 'whiteCatSheet', path: '../../assets/images/avatars/cat-3-64x64.png', label: 'White' },
};
// Tight 3-frame "meow sit front" strips (192x64, closed/open/closed mouth)
// cropped from the "<color> cat with text.png" asset packs' row 14 —
// used only by LessonBox's speaker portrait so it visibly talks instead
// of idling next to the dialogue text. DOM-only (background-image via
// lesson-box.js), not a Phaser texture, so no scene.load needed here.
const TALK_COLOR_PATHS = {
  orange: '../../assets/images/avatars/talk-orange-64x64.png',
  black: '../../assets/images/avatars/talk-black-64x64.png',
  white: '../../assets/images/avatars/talk-white-64x64.png',
};
// Neko-sensei's own LessonBox portrait (used only for the 'sensei-guide'
// conversation), built offline from the same alpha-scanned single pose
// buildReceptionSensei crops out of calico-sensei-idle.png — NOT the raw
// 3-pose sheet, which has a misaligned-frame problem. Both files are
// pre-built to the exact layouts spriteStyle()/LessonBox expects (idle:
// 14 cols x 13 rows @ 64px, only row 12 populated; talk: 3 cols x 1 row
// @ 64px), each cell just the one clean pose centered — so cycling
// through "frames" shows zero motion instead of a shifted duplicate.
const SENSEI_PORTRAIT_PATHS = {
  idle: '../../assets/images/avatars/calico-sensei-idle-sheet.png',
  talk: '../../assets/images/avatars/calico-sensei-talk.png',
};
// Frame geometry shared by all 3 sheets (same rig, palette-swapped).
const CAT_SHEET_COLS = 14;
// Row index (0-based) and frame count for each animation, confirmed by
// visual inspection of the actual sheet content, not assumed from any
// filename/ordering convention:
//   row 2  = walking down/toward camera (front-facing), 6 frames
//   row 3  = walking up/away (back of cat, tail curled above), 6 frames
//   row 4  = walking left (side view facing left), 6 frames
//   row 5  = walking right (side view facing right), 6 frames
//   row 12 = idle: sitting facing forward, tail-flick, 8 frames
const CAT_SHEET_ROWS = {
  idle: { row: 12, count: 8 },
  walkDown: { row: 2, count: 6 },
  walkUp: { row: 3, count: 6 },
  walkLeft: { row: 4, count: 6 },
  walkRight: { row: 5, count: 6 },
};
function catFrameRange(rowKey) {
  const { row, count } = CAT_SHEET_ROWS[rowKey];
  const start = row * CAT_SHEET_COLS;
  return { start, end: start + count - 1 };
}
const CAT_COLOR_ORDER = ['orange', 'black', 'white'];

function loadCatSpritesheets(scene) {
  CAT_COLOR_ORDER.forEach((id) => {
    const c = CAT_COLORS[id];
    scene.load.spritesheet(c.key, c.path, { frameWidth: 64, frameHeight: 64 });
  });
}

// Idempotent: safe even though N4 is a separate Game instance from N5
// (Phaser's anim registry is per-Game, not shared) — but also safe to
// call more than once within this same page, same as N5's own guard.
const CAT_ANIM_DEFS = [
  { suffix: 'idle', rowKey: 'idle', frameRate: 6 },
  { suffix: 'walk-down', rowKey: 'walkDown', frameRate: 10 },
  { suffix: 'walk-up', rowKey: 'walkUp', frameRate: 10 },
  { suffix: 'walk-left', rowKey: 'walkLeft', frameRate: 10 },
  { suffix: 'walk-right', rowKey: 'walkRight', frameRate: 10 },
];
function registerCatAnimations(scene) {
  CAT_COLOR_ORDER.forEach((id) => {
    const c = CAT_COLORS[id];
    CAT_ANIM_DEFS.forEach((def) => {
      const animKey = `${id}-${def.suffix}`;
      if (scene.anims.exists(animKey)) return;
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(c.key, catFrameRange(def.rowKey)),
        frameRate: def.frameRate,
        repeat: -1,
      });
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

// -- Lesson content, shelf/gate data -------------------------------------
// Task 7 populates LESSON_CONTENT with this floor's actual pages. Empty
// for now — Tasks 4-6 (shelves/piles/exam gate) haven't built any
// interactives that would read into it yet either.
const LESSON_CONTENT = {};

class N4LibraryScene extends Phaser.Scene {
  constructor() { super('N4LibraryScene'); }

  preload() {
    // Phaser's texture cache is per-Game-instance, and N4 is a separate
    // page/Game instance from N5 — every source sheet N4 needs must be
    // loaded here too, even ones N5 also loads. Paths confirmed against
    // n5-phaser-game.js's own preload() (LibraryScene). This is the
    // minimum set for Tasks 3-6 (walls/floor/shelves/furniture/player) —
    // add more this.load.image(...) calls here in later tasks only if a
    // specific new crop needs a sheet not listed yet.
    this.load.image('libAssetPack', '../../assets/images/ui/libassetpack-tiled.png');
    this.load.image('furniture03', '../../assets/images/ui/furniture03.png');
    this.load.image('topDownFurniture1', '../../assets/images/ui/TopDownHouse_FurnitureState1.png');
    // Same floor/wall source sheets as N5's LibraryScene (buildFloor()/
    // buildWalls() below reuse their exact crops) — added for Task 3.
    this.load.image('floorsWalls', '../../assets/images/ui/floors-walls02.png');
    this.load.image('floorsWallsTopDown', '../../assets/images/ui/TopDownHouse_FloorsAndWalls.png');
    loadCatSpritesheets(this);
  }

  create() {
    // Every property the shared LibrarySceneEngine (Task 1) reads instead
    // of N5's old module-level globals — must be set before buildScene()
    // calls wireInput()/refreshAllStates(), which are the first engine
    // methods to run.
    this.worldW = WORLD_W;
    this.worldH = WORLD_H;
    // This floor's one quiz-gate-mechanic entry (3-attempt/24h-cooldown,
    // same as N5's staircase) is the N4->N3 exam gate, NOT a north-wall
    // staircase (there's no further N2 stub built this pass — see the
    // design spec's Out of Scope). Passing it just unlocks the N3 column
    // in place (n3-shelf-01's SHELF_PREREQ points at this id) — no page
    // navigation needed, so onFinalGatePass is just a toast.
    this.finalGateId = 'n3-exam-gate';
    this.printerStationId = null;
    this.printLinksByShelf = {};
    this.allPrintLinks = {};
    this.lessonContent = LESSON_CONTENT; // Task 7
    this.quizGateKey = QUIZ_GATE_KEY;
    this.catColors = CAT_COLORS;
    this.talkColorPaths = TALK_COLOR_PATHS;
    this.senseiPortraitPaths = SENSEI_PORTRAIT_PATHS;
    this.extraRetroMenuOptions = undefined; // N4 has no shelf-08-style extra option this pass
    this.finalGateProceedLabel = 'Continue';
    this.onFinalGatePass = () => showToast('The N3 wing is now unlocked!');
    this.buildScene();
  }

  buildScene() {
    this.interactives = [];
    registerCatAnimations(this); // idempotent, safe even though N4 is a separate Game instance
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

  // -- World geometry (Task 3): floor, walls, top band, player ------------
  // buildFurniture/buildShelves/buildBookPiles/buildExamGate stay no-op
  // stubs below (still an expected near-empty world past the floor/walls,
  // see Task 2's verify step) — each gets its real implementation in a
  // later task:
  //   buildShelves/buildBookPiles — Task 4/5
  //   buildExamGate — Task 6
  //   buildFurniture — a later task (not this one)

  buildFloor() {
    // Same TopDownHouse_FloorsAndWalls.png floor crop as N5's LibraryScene
    // (buildFloor(), n5-phaser-game.js:7684) rendered as a single
    // tileSprite spanning the whole world for guaranteed seamless tiling.
    // Sits at depth -1, strictly behind the border tilemap below.
    const floorKey = cropToTexture(this, 'floorsWallsTopDown', ASSET_RECTS.topDownFloorTile, 'n4TopDownFloorTileTex');
    this.add.tileSprite(0, 0, WORLD_W, WORLD_H, floorKey).setOrigin(0, 0).setDepth(-1);

    // Border tileset holds only the brick tile, same as N5 — every
    // non-border cell is "no tile" (-1) so the floor tileSprite above
    // shows through. No gate opening this pass (unlike N5's bottom-row
    // GATE_COLS cutout): this floor's one gate mechanic is the N4->N3
    // exam-gate interactive built in the middle of the map (Task 6), not
    // a hole in the perimeter wall, so the border stays fully solid.
    const tileTex = this.textures.createCanvas('n4LibraryTiles', TILE_SIZE, TILE_SIZE);
    const tileCtx = tileTex.getContext();
    tileCtx.imageSmoothingEnabled = false;
    const floorSrc = this.textures.get('floorsWalls').getSourceImage();
    tileCtx.drawImage(
      floorSrc, ASSET_RECTS.brickTile.x, ASSET_RECTS.brickTile.y, TILE_SIZE, TILE_SIZE,
      0, 0, TILE_SIZE, TILE_SIZE
    );
    tileTex.refresh();

    const data = [];
    for (let y = 0; y < GRID_ROWS; y++) {
      const row = [];
      for (let x = 0; x < GRID_COLS; x++) {
        const isBorder = x === 0 || y === 0 || x === GRID_COLS - 1 || y === GRID_ROWS - 1;
        row.push(isBorder ? 0 : -1);
      }
      data.push(row);
    }
    const map = this.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tileset = map.addTilesetImage('n4LibraryTiles', null, TILE_SIZE, TILE_SIZE);
    map.createLayer(0, tileset, 0, 0);
    this.floorTilemap = map;

    // Solid dark backdrop outside the room instead of transparency,
    // same as N5.
    this.cameras.main.setBackgroundColor('#2A2320');
  }

  buildWalls() {
    // Visually thicker wall strip just inside the tilemap's border tile,
    // using the same brick tile crop, same pattern as N5's buildWalls()
    // (n5-phaser-game.js:7735).
    const brickKey = cropToTexture(this, 'floorsWalls', ASSET_RECTS.brickTile, 'n4BrickWallTex');
    const wallGroup = this.physics.add.staticGroup();
    for (let x = 0; x < GRID_COLS; x++) {
      this.add.image(x * TILE_SIZE, TILE_SIZE, brickKey).setOrigin(0, 0).setDepth(0);
      this.add.image(x * TILE_SIZE, (GRID_ROWS - 2) * TILE_SIZE, brickKey).setOrigin(0, 0).setDepth(0);
    }
    // Left/right walls, 3 tiles deep, starting below the top wall band
    // (buildTopBand()'s solid header) so the brick strip doesn't visually
    // collide with it — same reasoning as N5's sideWallStartRow.
    const sideWallStartRow = Math.ceil(TOP_BAND_HEIGHT / TILE_SIZE);
    for (let y = sideWallStartRow; y < GRID_ROWS; y++) {
      for (let col = 1; col <= 3; col++) {
        this.add.image(col * TILE_SIZE, y * TILE_SIZE, brickKey).setOrigin(0, 0).setDepth(0);
        this.add.image((GRID_COLS - 1 - col) * TILE_SIZE, y * TILE_SIZE, brickKey).setOrigin(0, 0).setDepth(0);
      }
    }
    this.wallGroup = wallGroup;
  }

  buildTopBand() {
    // Simpler than N5's buildTopBand() (n5-phaser-game.js:7770): no
    // staircase/gate art at all this pass — this floor's one gate
    // mechanic (the N4->N3 exam gate) is a separate interactive built in
    // the middle of the map by Task 6, not a north-wall staircase (a
    // further N3->N2 gate is explicitly out of scope — see the design
    // spec). Just a solid procedural wall header spanning the full
    // width, reusing drawWallHeaderTexture (library-scene-shared.js) the
    // same way n5-phaser-game.js's buildShelves() reuses it for its own
    // wall-header segments, plus the same invisible-rectangle +
    // wallGroup collision pattern used throughout that file.
    const headerH = TOP_BAND_HEIGHT;
    const headerKey = drawWallHeaderTexture(this, WORLD_W, headerH);
    this.add.image(WORLD_W / 2, headerH / 2, headerKey).setOrigin(0.5, 0.5).setDepth(2);

    const block = this.add.rectangle(WORLD_W / 2, headerH / 2, WORLD_W, headerH, 0x000000, 0)
      .setOrigin(0.5, 0.5);
    this.physics.add.existing(block, true);
    this.wallGroup.add(block);
  }

  buildFurniture() {}
  buildShelves() {}
  buildBookPiles() {}
  buildExamGate() {}
  buildPlayer() {
    // Spawns near the south end of the world — this floor's real entry
    // point (LAYOUT.entryY) doesn't exist yet (Task 4 defines LAYOUT), so
    // this is a placeholder Y that Task 4 will replace.
    const spawnX = WORLD_W / 2;
    const spawnY = WORLD_H - 200; // placeholder — Task 4 replaces with LAYOUT.entryY
    // N4LibraryScene is only ever reached after N5's CatSelectScene has
    // run (the cat color is a player-level preference, not per-floor —
    // see CAT_COLOR_KEY above), so a saved color always exists here;
    // 'orange' is a defensive fallback only, same as N5's buildPlayer()
    // (n5-phaser-game.js:8661).
    this.catColorId = getSavedCatColor() || 'orange';
    this.player = this.physics.add.sprite(spawnX, spawnY, CAT_COLORS[this.catColorId].key);
    this.player.setDisplaySize(60, 60);
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
    this.retroMenu = null;
    this.retroUpKeyWasDown = false;
    this.retroDownKeyWasDown = false;
  }

  // Reads this.player.body.velocity, which Phaser only updates when
  // setVelocity() is called — so this runs at the TOP of update(), before
  // this frame's movement branches set a new velocity, meaning it reacts
  // to last frame's velocity. Copied verbatim from N5's LibraryScene
  // (n5-phaser-game.js:8718).
  updatePlayerAnimation() {
    const vel = this.player.body.velocity;
    const moving = Math.abs(vel.x) > 0.5 || Math.abs(vel.y) > 0.5;
    if (moving) {
      const dir = Math.abs(vel.x) > Math.abs(vel.y)
        ? (vel.x > 0 ? 'right' : 'left')
        : (vel.y > 0 ? 'down' : 'up');
      this.player.play(`${this.catColorId}-walk-${dir}`, true);
    } else {
      this.player.play(`${this.catColorId}-idle`, true);
    }
  }

  // -- Per-frame update: movement, auto-walk, proximity glow -------------
  // Copied verbatim from N5's LibraryScene.update() (n5-phaser-game.js:
  // 8752) — only references this.player/this.cursors/this.wasd/
  // this.moveQueue/this.interactives, all scene-local, no N5-specific
  // module constants (no direct WORLD_W/WORLD_H reference existed to
  // convert to this.worldW/this.worldH).
  update() {
    if (!this.player) return;
    this.updatePlayerAnimation();
    if (this.panelOpen) {
      this.player.setVelocity(0, 0);
      if (this.retroMenu) this.updateRetroMenuInput();
      return;
    }

    const SPEED = 140;
    let vx = 0;
    let vy = 0;

    if (this.moveQueue && this.moveQueue.length > 0) {
      const waypoint = this.moveQueue[0];
      const isFinalWaypoint = this.moveQueue.length === 1;
      const threshold = isFinalWaypoint ? ARRIVE_THRESHOLD : 10;
      const dx = waypoint.x - this.player.x;
      const dy = waypoint.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= threshold) {
        this.moveQueue.shift();
        if (this.moveQueue.length === 0) {
          this.player.setVelocity(0, 0);
          if (this.pendingInteract) {
            const toOpen = this.pendingInteract;
            this.pendingInteract = null;
            this.openInteraction(toOpen);
          }
        }
        return;
      }
      vx = (dx / dist) * SPEED;
      vy = (dy / dist) * SPEED;
      this.player.setVelocity(vx, vy);
      return;
    }

    if (this.cursors.left.isDown || this.wasd.left.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) vy += 1;

    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      this.player.setVelocity((vx / len) * SPEED, (vy / len) * SPEED);
    } else {
      this.player.setVelocity(0, 0);
    }

    // Proximity highlight: scale up whichever interactive is nearest
    // and in range (visual "you can interact here" cue), reset others.
    const near = this.nearestInRange();
    this.interactives.forEach((entry) => {
      entry.sprite.setScale(entry.baseScale * (entry === near ? 1.08 : 1));
    });
  }
}
Object.assign(N4LibraryScene.prototype, LibrarySceneEngine);

const n4PhaserGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'phaserGame',
  width: 768,
  height: 480,
  // pixelArt: true + scale.mode FIT/CENTER_BOTH matches N5's exact config
  // (n5-phaser-game.js's own new Phaser.Game({...}) block) — see that
  // file's comment for why (nearest-neighbor sprite filtering without
  // blurring, FIT scaling to fill the viewport while staying centered).
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [N4LibraryScene],
});

window.__n4Game = n4PhaserGame;
