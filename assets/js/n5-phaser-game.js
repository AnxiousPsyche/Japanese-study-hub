const ASSET_RECTS = {
  // floors-walls02.png (288x160px)
  floorTile: { x: 220, y: 25, w: 16, h: 16 },
  brickTile: { x: 30, y: 90, w: 16, h: 16 },
  floorTileVariant: { x: 220, y: 105, w: 16, h: 16 },
  // libassetpack-tiled.png (1488x528px) — all found via alpha-channel
  // pixel scanning (getImageData row/column opaque-run detection), the
  // only reliable measurement method found this project (see SUMMARY.md).
  wallBalcony: { x: 1040, y: 0, w: 448, h: 300 },
  staircase: { x: 935, y: 0, w: 100, h: 300 },
  bookshelf: { x: 385, y: 345, w: 100, h: 175 },
  shelfLocked: { x: 28, y: 385, w: 87, h: 118 },
  shelfFilled1: { x: 148, y: 385, w: 87, h: 118 },
  shelfFilled2: { x: 268, y: 385, w: 87, h: 118 },
  shelfFilled3: { x: 388, y: 385, w: 87, h: 118 },
  globe: { x: 143, y: 217, w: 94, h: 118 },
  bookStack: { x: 358, y: 25, w: 26, h: 50 },
  // Alpha-scan corrected: the old {673,43,45,52} clipped ~4px off the top
  // of the gold frame. This is the complete, non-clipped bounding box.
  armchair: { x: 672, y: 39, w: 48, h: 57 },
  // Reception furniture (found via alpha-scan against the user's
  // reference images — desk/chair/rug/lamp are all confirmed matches).
  receptionDesk: { x: 541, y: 229, w: 191, h: 107 },
  receptionRug: { x: 456, y: 24, w: 168, h: 72 },
  deskLamp: { x: 624, y: 125, w: 24, h: 43 },
  // TopDownHouse_DoorsAndWindows.png
  // Round 2 feedback item 3: previous h:55 crop bled into the door tiles
  // immediately above (y:40-47) and below (y:82+) this window in the
  // sheet. Alpha-scan found the clean window (frame+2 panes+sill, no
  // neighbors) is only y:49-80.
  wallWindow: { x: 130, y: 49, w: 26, h: 31 },
  // furniture03.png (256x256px)
  // Alpha-scan corrected via per-row opaque-run isolation (not just
  // bounding-box scanning): the old {186,114,44,78} bled in a
  // neighboring chest's edge trim (left), a checkered picture-on-stand
  // item (right), and a sofa (bottom) — all separate sprites sitting
  // close enough to merge into one bounding box at the coarser scan
  // resolution used before. This sprite is fronds only, no pot.
  plant: { x: 193, y: 112, w: 16, h: 50 },
  // libassetpack-tiled.png — review-pile book stack (green/red/tan),
  // replacing the old pixellabLibrary bookPileTall per an explicit
  // reference image.
  bookPileTall: { x: 240, y: 96, w: 30, h: 48 },
  // furniture03.png — tall wardrobe/cabinet (plain top, checkered
  // drawer-pull band, dark base), replacing the old checkered-basket
  // cubby shelf as the "shoe cabinet" placed near the start entrance,
  // per an explicit reference image.
  shoeCabinet: { x: 176, y: 80, w: 39, h: 80 },
  // TopDownHouse_FurnitureState1.png — plain table + chair (replaces
  // furniture03's table/floorBench in the decor rows) and the 4-sofa
  // family (2-seat couch, 3-seat w/ pillows, armchair w/ pillow, plain
  // armchair — replaces the single libassetpack balconyBench), all per
  // explicit reference images naming this file and picture number.
  // Alpha-scan corrected: the old {0,28,44,36} clipped ~4px off the
  // table's right leg.
  libTable: { x: 0, y: 32, w: 48, h: 32 },
  // Alpha-scan corrected via per-row opaque-run isolation: the old
  // {156,2,24,30} bled in slivers of the neighboring chairs on both
  // sides (same coarser-bounding-box mistake as the plant crop above).
  libChair: { x: 161, y: 9, w: 14, h: 22 },
  // Alpha-scan corrected via per-row opaque-run isolation: the old
  // {24,162,44,34} clipped the couch's right edge, and the old
  // {88,158,48,38} both clipped its left edge and bled in a row of
  // paver/stone tiles sitting just below it in the sheet.
  sofaCouch2: { x: 24, y: 167, w: 56, h: 26 },
  sofaCouch3: { x: 82, y: 161, w: 60, h: 31 },
  sofaArmchairPillow: { x: 144, y: 158, w: 32, h: 38 },
  sofaArmchairPlain: { x: 180, y: 160, w: 28, h: 36 },
};

// Round 2 feedback item 1 (Option A — extend the map). World is much
// bigger than the 768x480 viewport now; the camera follows the player
// and is clamped to these bounds. Viewport itself (Phaser.Game
// width/height below) is unchanged — still matches #mapFrame's
// aspect-ratio:16/10 in n5-dashboard.css, per that file's explicit
// "no CSS changes" constraint from the real-layout spec.
const GRID_COLS = 56;
// Round 4 relayout: two shelf zones (9-17 near the stairs, 1-8 near
// spawn) each with their own P-T&C-R-T&C-P decor band, instead of the
// old single-corridor 4-cluster layout. Taller world (119 vs 84 rows)
// to fit both zones + 3 decor bands + sofas/reception/spawn stacked
// vertically. See buildShelves()/buildFurniture() for the exact row
// math this height was derived from.
const GRID_ROWS = 119;
const TILE_SIZE = 16;
const WORLD_W = GRID_COLS * TILE_SIZE;
const WORLD_H = GRID_ROWS * TILE_SIZE;
const GATE_COLS = [25, 26, 27, 28, 29, 30];

// Round 4 relayout: single source of truth for every Y coordinate in the
// vertical stack (top band -> decor row -> zone 1 (9-17) -> decor row ->
// zone 2 (1-8) -> decor row -> carpet/globe -> sofas -> reception ->
// spawn), top-down, matching the user's bottom-to-top ASCII layout
// exactly (spawn at the bottom, stairs at the top). buildShelves(),
// buildFurniture(), buildBookPiles(), buildReception() and buildPlayer()
// all read from here instead of duplicating these numbers or deriving
// them from WORLD_H, so the whole layout can be re-tuned in one place.
const LAYOUT = {
  // Shelf column geometry — shared by buildShelves() (shelf positions)
  // and buildFurniture() (the P/T&C/RV decor sitting in the gap between
  // the two shelf columns at each row, per an explicit reference
  // diagram showing those items beside the shelves, not in a separate
  // band above/below each zone).
  shelfW: ASSET_RECTS.shelfLocked.w,
  shelfH: ASSET_RECTS.shelfLocked.h,
  leftColX: [40, 40 + ASSET_RECTS.shelfLocked.w + 20],
  rightColX: [
    WORLD_W - 40 - ASSET_RECTS.shelfLocked.w * 2 - 20,
    WORLD_W - 40 - ASSET_RECTS.shelfLocked.w,
  ],
  zone1RowY: [560, 692, 824], // shelves 9-17 (nearest stairs -> nearest zone 2)
  zone2RowY: [1082, 1214], // shelves 1-8 (nearest zone 1 -> nearest spawn)
  decorRow3Y: 1372, // P / T&C / P — pure decor, nearest the carpet/globe
  carpetGlobeY: 1472, // red carpet / globe / red carpet
  sofaRowY: 1612, // 4 sofas, 2 per side, flanking the corridor
  receptionY: 1652, // centered — sits between the two vertical sofa stacks
  spawnY: 1832,
};

// 17-lesson roster (expanded from Round 2's 15, reconciling with
// N5_Library_Map_Spec.md): Foundations (8) unchanged, Sentence Builder
// grows from 4 to 6 lessons (adds "Volitional & Invitations" after
// "Adverbs and Verbs" and "Past & Negative Tense" after "Conjugations"),
// Final stretch (3) unchanged in content, renumbered 15-17. Walk-order
// layout is now 4 upper-left / 4 upper-right / 6 lower-left /
// 3 lower-right — see buildShelves().
const LESSON_DATA = [
  { id: 'shelf-01', title: 'Basic Greetings' },
  { id: 'shelf-02', title: 'Everyday Expressions' },
  { id: 'shelf-03', title: 'Self Introduction' },
  { id: 'shelf-04', title: 'A は B です' },
  { id: 'shelf-05', title: 'Demonstratives' },
  { id: 'shelf-06', title: 'Questions (か)' },
  { id: 'shelf-07', title: 'Numbers & Counters' },
  { id: 'shelf-08', title: 'Places and Directions' },
  { id: 'shelf-09', title: 'Nouns & Pronouns' },
  { id: 'shelf-10', title: 'Adjectives' },
  { id: 'shelf-11', title: 'Adverbs and Verbs' },
  { id: 'shelf-12', title: 'Volitional & Invitations (〜ましょう・〜ませんか)' },
  { id: 'shelf-13', title: 'Conjugations' },
  { id: 'shelf-14', title: 'Past & Negative Tense' },
  { id: 'shelf-15', title: 'Sentence Construction' },
  { id: 'shelf-16', title: 'Particle Mastery' },
  { id: 'shelf-17', title: 'Existence (あります・います)' },
];

// Prerequisite for each shelf to become "available": null = always
// available (first lesson); otherwise the id of the shelf/pile that
// must be completed first. Matches Neko-Bunko-Cat-Library-Spec.md's
// progression rules: lessons unlock strictly in order, and passing a
// review nook unlocks the next section (shelf-09 gates on review-1,
// shelf-15 gates on review-2), not just the previous shelf.
const SHELF_PREREQ = {
  'shelf-01': null,
  'shelf-02': 'shelf-01', 'shelf-03': 'shelf-02', 'shelf-04': 'shelf-03',
  'shelf-05': 'shelf-04', 'shelf-06': 'shelf-05', 'shelf-07': 'shelf-06',
  'shelf-08': 'shelf-07',
  'shelf-09': 'review-1',
  'shelf-10': 'shelf-09', 'shelf-11': 'shelf-10', 'shelf-12': 'shelf-11',
  'shelf-13': 'shelf-12', 'shelf-14': 'shelf-13',
  'shelf-15': 'review-2',
  'shelf-16': 'shelf-15', 'shelf-17': 'shelf-16',
};

// 2 review book piles. The 3rd checkpoint ("final-quiz") is no longer a
// book pile — it's the staircase up at the north wall (see
// buildTopBand()), which is the gate to N4 ("second floor").
const BOOK_PILE_DATA = [
  { id: 'review-1', title: 'Foundations Review', requires: ['shelf-01', 'shelf-02', 'shelf-03', 'shelf-04', 'shelf-05', 'shelf-06', 'shelf-07', 'shelf-08'] },
  { id: 'review-2', title: 'Sentence Builder Review', requires: ['shelf-09', 'shelf-10', 'shelf-11', 'shelf-12', 'shelf-13', 'shelf-14'] },
];

const SAVE_KEY = 'nekoBunko.n5.progress';
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
const QUIZ_GATE_KEY = 'nekoBunko.n5.quizGate';
const QUIZ_MAX_ATTEMPTS = 3;
const QUIZ_LOCKOUT_MS = 24 * 60 * 60 * 1000;
// Both thresholds must exceed the realistic minimum approach distance:
// every shelf/pile has a solid collision body (addSolid), so the player
// can never physically reach an interactive's exact center (entry.x/y)
// — collision stops them at roughly half the object's height/width away
// first. Worst case here is a shelf's half-height (59) + the player's
// half-body (~7.5) + a small buffer ≈ 72px. Values below that make
// auto-walk-arrival and click/E-range checks impossible to satisfy —
// this was a real bug caught by testing the full flow end-to-end, not
// just checking the code compiles.
const TRIGGER_RANGE = 80; // px — click-in-range / E-to-interact radius
const ARRIVE_THRESHOLD = 74; // px — how close auto-walk needs to get before stopping

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
    // localStorage unavailable (privacy mode, quota, etc.) — degrade to
    // session-only, never throw.
  }
}

function loadQuizGateState() {
  try {
    const raw = localStorage.getItem(QUIZ_GATE_KEY);
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

function saveQuizGateState(state) {
  try {
    localStorage.setItem(QUIZ_GATE_KEY, JSON.stringify(state));
  } catch (e) {
    // localStorage unavailable — degrade to session-only, same pattern
    // as saveProgress()/saveCatColor().
  }
}

function formatLockMessage(msRemaining) {
  const totalMinutes = Math.max(1, Math.ceil(msRemaining / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `Locked - try again in ${hours}h ${minutes}m`;
}

// Applies lazy cooldown-expiry reset (spec: "attempts reset to 3... no
// re-review required" once 24h has passed), then returns what the UI needs.
function getQuizGateStatus() {
  const state = loadQuizGateState();
  if (state.lockedUntil !== null && Date.now() >= state.lockedUntil) {
    state.attemptsUsed = 0;
    state.lockedUntil = null;
    saveQuizGateState(state);
  }
  const locked = state.lockedUntil !== null && Date.now() < state.lockedUntil;
  return {
    state,
    locked,
    attemptsLeft: Math.max(0, QUIZ_MAX_ATTEMPTS - state.attemptsUsed),
    lockMessage: locked ? formatLockMessage(state.lockedUntil - Date.now()) : null,
  };
}

function getState(id, prereq, progress) {
  if (progress[id]) return 'completed';
  if (prereq === null || prereq === undefined || progress[prereq]) return 'available';
  return 'locked';
}

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

function cropToTexture(scene, sourceKey, rect, destKey) {
  const srcImage = scene.textures.get(sourceKey).getSourceImage();
  const canvasTexture = scene.textures.createCanvas(destKey, rect.w, rect.h);
  const ctx = canvasTexture.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(srcImage, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
  canvasTexture.refresh();
  return destKey;
}

// ---------------------------------------------------------------------
// DOM lesson/review panel (HTML overlay over the canvas, per
// Neko-Bunko-Cat-Library-Spec.md section 8: "HTML overlay is fine for
// lesson panels — easier to style text than in-canvas UI").
// ---------------------------------------------------------------------

function ensurePanel() {
  let panel = document.getElementById('nekoLessonPanel');
  if (panel) return panel;

  panel = document.createElement('div');
  panel.id = 'nekoLessonPanel';
  panel.style.cssText = 'position:fixed;inset:0;display:none;align-items:center;'
    + 'justify-content:center;background:rgba(0,0,0,.55);z-index:20000;';
  // Retro-RPG dialog box treatment (chunkier border, pixel-ish corners,
  // hard offset shadow instead of a soft blur) rather than the site's
  // general soft-rounded card style — this panel pops up over the
  // pixel-art game canvas specifically, so its shape language matches
  // the game, not the surrounding dashboard chrome. Palette (cream
  // background, tan border/close button) is unchanged from Round 1's
  // exact HUD color match. #87A8D8 -> #4E74A8 on the Complete button:
  // the old blue was only 2.44:1 contrast against white text (fails
  // WCAG AA 4.5:1) - same fix as the HUD buttons in n5-dashboard.css.
  panel.innerHTML = ''
    + '<div style="background:#FFFDF6;border:5px solid #C9BFA5;border-radius:4px;'
    + 'box-shadow:6px 6px 0 rgba(90,74,58,.28);'
    + 'padding:30px;max-width:420px;text-align:center;">'
    + '<h2 id="nekoPanelTitle" style="font-family:\'Press Start 2P\',cursive;'
    + 'font-size:.85rem;margin-bottom:16px;color:#5A4A3A;line-height:1.6;"></h2>'
    + '<p id="nekoPanelBody" style="margin-bottom:22px;color:#5A4A3A;'
    + 'font-family:Nunito,sans-serif;"></p>'
    + '<button id="nekoPanelComplete" style="padding:10px 20px;border:none;'
    + 'border-radius:4px;background:#4E74A8;color:white;'
    + 'font-family:\'Press Start 2P\',cursive;font-size:.55rem;cursor:pointer;'
    + 'margin-right:10px;">Complete</button>'
    + '<button id="nekoPanelFail" style="display:none;padding:10px 20px;border:none;'
    + 'border-radius:4px;background:#B04A4A;color:white;'
    + 'font-family:\'Press Start 2P\',cursive;font-size:.55rem;cursor:pointer;'
    + 'margin-right:10px;">Fail (test)</button>'
    + '<button id="nekoPanelClose" style="padding:10px 20px;border:none;'
    + 'border-radius:4px;background:#C9BFA5;color:#5A4A3A;'
    + 'font-family:\'Press Start 2P\',cursive;font-size:.55rem;cursor:pointer;">'
    + 'Close</button></div>';
  document.body.appendChild(panel);
  return panel;
}

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

class LibraryScene extends Phaser.Scene {
  constructor() {
    super('LibraryScene');
  }

  preload() {
    this.load.image('floorsWalls', '../../assets/images/ui/floors-walls02.png');
    this.load.image('furniture03', '../../assets/images/ui/furniture03.png');
    this.load.image('libAssetPack', '../../assets/images/ui/libassetpack-tiled.png');
    this.load.image('doorsWindows', '../../assets/images/ui/TopDownHouse_DoorsAndWindows.png');
    this.load.image('topDownFurniture1', '../../assets/images/ui/TopDownHouse_FurnitureState1.png');
    this.load.image('checkmarkIcon', '../../assets/images/ui/checkmark-1-Original.png');
    loadCatSpritesheets(this);
  }

  create() {
    this.interactives = []; // { id, kind, sprite, glow, stamp, x, y, prereq/requires }
    this.progress = loadProgress();
    this.furnitureSprites = {};
    registerCatAnimations(this);

    this.buildFloor();
    this.buildWalls();
    this.buildTopBand();
    this.buildFurniture();
    this.buildShelves();
    this.buildBookPiles();
    this.buildReception();
    this.buildPlayer();
    this.wireInput();
    this.refreshAllStates();

    ensurePanel();
    ensureToast();
  }

  // -- Floor + border tilemap -------------------------------------------

  buildFloor() {
    const floorSrc = this.textures.get('floorsWalls').getSourceImage();
    const tileTex = this.textures.createCanvas('libraryTiles', TILE_SIZE * 3, TILE_SIZE);
    const tileCtx = tileTex.getContext();
    tileCtx.imageSmoothingEnabled = false;
    tileCtx.drawImage(
      floorSrc, ASSET_RECTS.floorTile.x, ASSET_RECTS.floorTile.y, TILE_SIZE, TILE_SIZE,
      0, 0, TILE_SIZE, TILE_SIZE
    );
    tileCtx.drawImage(
      floorSrc, ASSET_RECTS.brickTile.x, ASSET_RECTS.brickTile.y, TILE_SIZE, TILE_SIZE,
      TILE_SIZE, 0, TILE_SIZE, TILE_SIZE
    );
    tileCtx.drawImage(
      floorSrc, ASSET_RECTS.floorTileVariant.x, ASSET_RECTS.floorTileVariant.y, TILE_SIZE, TILE_SIZE,
      TILE_SIZE * 2, 0, TILE_SIZE, TILE_SIZE
    );
    tileTex.refresh();

    // Round 2 feedback item 2: floor covers 100% of the interior, full
    // brick border on all 4 sides (was already true structurally, but
    // re-verified at the new grid size), gate opening at the bottom only.
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
    const map = this.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tileset = map.addTilesetImage('libraryTiles', null, TILE_SIZE, TILE_SIZE);
    map.createLayer(0, tileset, 0, 0);
    this.floorTilemap = map;

    // Round 2 feedback item 2: solid dark backdrop outside the room
    // instead of transparency (visible at the world's edges / before the
    // camera settles), set on both the scene camera and the canvas.
    this.cameras.main.setBackgroundColor('#2A2320');
  }

  // -- Perimeter wall strips (Round 2 feedback item 2) -------------------

  buildWalls() {
    // The brick tile border above already fully encloses the room (no
    // gaps) — this adds a visually thicker wall STRIP just inside that
    // border using the same brick tile, stacked 2 tiles deep, so the
    // perimeter reads as a real wall rather than a single thin line.
    const floorSrc = this.textures.get('floorsWalls').getSourceImage();
    const brickKey = cropToTexture(this, 'floorsWalls', ASSET_RECTS.brickTile, 'brickWallTex');
    const wallGroup = this.physics.add.staticGroup();
    for (let x = 0; x < GRID_COLS; x++) {
      this.add.image(x * TILE_SIZE, TILE_SIZE, brickKey).setOrigin(0, 0).setDepth(0);
      this.add.image(x * TILE_SIZE, (GRID_ROWS - 2) * TILE_SIZE, brickKey).setOrigin(0, 0).setDepth(0);
    }
    // Left/right walls, 3 tiles deep (was 1, giving only a thin 32px
    // band total with the floor tilemap's own border tile) — widened to
    // close the gap with the shelf columns (leftColX[0] starts at x=40,
    // tile-index 2.5) so the shelves read as sitting flush against a
    // real wall instead of floating a few px off a thin border line.
    // Starts below the top wall/window band (y=460, where the floor
    // proper begins) instead of y=0 — this brick strip and the top
    // band's own blue-paneled wall art are two different wall styles,
    // and extending the brick strip up into that band made it visibly
    // overlap/collide with the windows there.
    const sideWallStartRow = Math.ceil(460 / TILE_SIZE);
    for (let y = sideWallStartRow; y < GRID_ROWS; y++) {
      for (let col = 1; col <= 3; col++) {
        this.add.image(col * TILE_SIZE, y * TILE_SIZE, brickKey).setOrigin(0, 0).setDepth(0);
        this.add.image((GRID_COLS - 1 - col) * TILE_SIZE, y * TILE_SIZE, brickKey).setOrigin(0, 0).setDepth(0);
      }
    }
    void floorSrc;
    this.wallGroup = wallGroup;
  }

  // -- Top wall/balcony/staircase band ------------------------------------

  buildTopBand() {
    // Round 4 relayout: staircase moved to the far-left corner (was
    // centered) — combined with the locked-state alpha dim, a centered
    // staircase read as a broken/unfinished wall segment rather than
    // stairs. The wall art now fills the ENTIRE remaining width instead
    // of a centered, proportionate piece with plain brick showing on
    // both sides ("extend the blue and brown wall further right and
    // left"). Wall is scaled uniformly (not stretched non-uniformly) to
    // avoid the distortion Round 1 already ran into with a more extreme
    // full-width stretch.
    const stairScale = 1.4;
    const staircaseRect = ASSET_RECTS.staircase;
    const staircaseDisplayWidth = staircaseRect.w * stairScale;
    const staircaseDisplayHeight = staircaseRect.h * stairScale;
    const stairX = 40;

    const staircaseKey = cropToTexture(this, 'libAssetPack', staircaseRect, 'staircaseTex');
    const staircaseSprite = this.add
      .image(stairX, 0, staircaseKey)
      .setOrigin(0, 0)
      .setDisplaySize(staircaseDisplayWidth, staircaseDisplayHeight)
      .setDepth(2);
    this.furnitureSprites.staircase = staircaseSprite;

    // The staircase IS the final-quiz/N4 gate. Same interaction pattern
    // as every other interactive: click-in-range/E-to-interact/auto-walk,
    // locked until L15-17 are done. Unlike every other interactive it is
    // NOT alpha-dimmed while locked (see refreshAllStates) — a large
    // architectural piece fading to 55% opacity reads as broken/half-
    // rendered, not "locked", which is exactly the confusion that
    // prompted this whole relayout pass.
    const stairGlow = this.add
      .text(stairX + staircaseDisplayWidth - 14, staircaseDisplayHeight - 10, '⭐', { fontSize: '16px' })
      .setOrigin(0.5).setDepth(4).setVisible(false);
    const stairStamp = this.add
      .text(stairX + staircaseDisplayWidth - 14, staircaseDisplayHeight - 10, '✅', { fontSize: '16px' })
      .setOrigin(0.5).setDepth(4).setVisible(false);
    this.tweens.add({ targets: stairGlow, alpha: { from: 1, to: 0.35 }, duration: 650, yoyo: true, repeat: -1 });

    const wallRect = ASSET_RECTS.wallBalcony;
    const wallX = stairX + staircaseDisplayWidth;
    const wallTargetWidth = WORLD_W - 40 - wallX;
    const wallScale = wallTargetWidth / wallRect.w;
    const wallDisplayWidth = wallRect.w * wallScale;
    const wallDisplayHeight = wallRect.h * wallScale;

    const wallKey = cropToTexture(this, 'libAssetPack', wallRect, 'wallBalconyTex');
    this.furnitureSprites.wallBalcony = this.add
      .image(wallX, 0, wallKey)
      .setOrigin(0, 0)
      .setDisplaySize(wallDisplayWidth, wallDisplayHeight);

    // Block the player from walking into the painted wall art across the
    // whole top band (staircase included).
    const wallBlockHeight = Math.max(staircaseDisplayHeight, wallDisplayHeight) * 0.6;
    const wallBlock = this.add.rectangle(0, 0, WORLD_W, wallBlockHeight, 0x000000, 0)
      .setOrigin(0, 0);
    this.physics.add.existing(wallBlock, true);
    this.wallGroup.add(wallBlock);

    // Trigger point deliberately sits near the BASE of the staircase
    // (not its vertical center), below wallBlockHeight, so the routed
    // corridor approach can actually reach it (see Round 2's original
    // note on this — the staircase's own center falls inside the solid
    // zone otherwise).
    const stairEntry = {
      id: 'final-quiz', kind: 'pile', title: 'Final Quiz',
      sprite: staircaseSprite, glow: stairGlow, stamp: stairStamp,
      requires: ['shelf-15', 'shelf-16', 'shelf-17'],
      x: stairX + staircaseDisplayWidth / 2, y: staircaseDisplayHeight - 30,
      baseScale: stairScale,
    };
    staircaseSprite.setInteractive({ useHandCursor: true });
    staircaseSprite.on('pointerdown', () => this.handleInteractiveClick(stairEntry));
    this.interactives.push(stairEntry);

    // Windows: 4 total, evenly spaced across the now-wider wall band (no
    // door to flank anymore — Round 3 removed it).
    const windowRect = ASSET_RECTS.wallWindow;
    const windowKey = cropToTexture(this, 'doorsWindows', windowRect, 'wallWindowTex');
    const windowScale = 1.8;
    const windowDisplayWidth = windowRect.w * windowScale;
    const windowDisplayHeight = windowRect.h * windowScale;
    const windowY = 42;
    const windowCount = 4;
    const windowSpacing = wallDisplayWidth / (windowCount + 1);
    for (let i = 0; i < windowCount; i++) {
      const wx = wallX + windowSpacing * (i + 1) - windowDisplayWidth / 2;
      this.furnitureSprites[`wallWindow${i}`] = this.add
        .image(wx, windowY, windowKey)
        .setOrigin(0, 0)
        .setDisplaySize(windowDisplayWidth, windowDisplayHeight)
        .setDepth(3);
    }

  }

  // -- Central decor: globe, reading tables, review-nook seating ---------

  buildFurniture() {
    const plantKey = cropToTexture(this, 'furniture03', ASSET_RECTS.plant, 'plantTex');
    const armchairKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.armchair, 'armchairTex');
    const globeKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.globe, 'globeTex');
    this.armchairKey = armchairKey; // reused by buildReception's chair
    // Decor-row table + chair, from TopDownHouse_FurnitureState1.png per
    // an explicit reference image (replaces furniture03's plain table +
    // floorBench stand-in).
    const libTableKey = cropToTexture(this, 'topDownFurniture1', ASSET_RECTS.libTable, 'libTableTex');
    const libChairKey = cropToTexture(this, 'topDownFurniture1', ASSET_RECTS.libChair, 'libChairTex');
    // 4-sofa family, same source sheet — one distinct variant per sofa
    // slot instead of repeating a single balconyBench sprite 4 times.
    const sofaKeys = [
      cropToTexture(this, 'topDownFurniture1', ASSET_RECTS.sofaCouch2, 'sofaCouch2Tex'),
      cropToTexture(this, 'topDownFurniture1', ASSET_RECTS.sofaCouch3, 'sofaCouch3Tex'),
      cropToTexture(this, 'topDownFurniture1', ASSET_RECTS.sofaArmchairPillow, 'sofaArmchairPillowTex'),
      cropToTexture(this, 'topDownFurniture1', ASSET_RECTS.sofaArmchairPlain, 'sofaArmchairPlainTex'),
    ];
    // Shoe cabinet, from furniture03.png per an explicit reference image.
    const shoeCabinetKey = cropToTexture(this, 'furniture03', ASSET_RECTS.shoeCabinet, 'shoeCabinetTex');

    // Center corridor rug — red instead of green, matching the existing
    // 0xd57c7c "CARPET RED" accents elsewhere in this room (reused
    // verbatim as the rug's own body color instead of introducing a
    // second, clashing red) with a deeper oxblood border, same 2-shade
    // treatment (darker border + lighter center, no extra lines) as the
    // original green version.
    // Non-solid (same as every other decor piece — see buildShelves'
    // header comment on the project's non-solid-furniture convention),
    // depth 0 so it sits at floor level under every sprite placed here.
    const corridorWidth = 56;
    const corridorX = WORLD_W / 2;
    const corridorTop = 460; // just below the top wall block, unrelated to any shelf row now
    const corridorBottom = LAYOUT.receptionY;
    const corridorHeight = corridorBottom - corridorTop;
    const corridorMidY = (corridorTop + corridorBottom) / 2;
    const corridorBorder = 0x8a3f3a;
    const corridorBody = 0xd57c7c;
    this.add
      .rectangle(corridorX, corridorMidY, corridorWidth, corridorHeight, corridorBorder)
      .setDepth(0);
    this.add
      .rectangle(corridorX, corridorMidY, corridorWidth - 16, corridorHeight - 6, corridorBody)
      .setDepth(0);

    // Per-shelf-row decor: P/T&C/RV sit in the gap between the left and
    // right shelf columns AT THE SAME ROW HEIGHT as the shelves next to
    // them, per an explicit reference diagram — not in a separate band
    // above/below each zone (the earlier layout).
    const gapLeft = LAYOUT.leftColX[1] + LAYOUT.shelfW; // inner edge of the left shelf column
    const gapRight = LAYOUT.rightColX[0]; // inner edge of the right shelf column
    const gapCenter = (gapLeft + gapRight) / 2;
    this.reviewPilePositions = {};

    const buildReviewRow = (y, reviewPile) => {
      const plantY = y - ASSET_RECTS.plant.h / 2;
      this.add.image(gapLeft + 16, plantY, plantKey).setOrigin(0, 0).setDepth(1);
      this.add.image(gapRight - 16 - ASSET_RECTS.plant.w, plantY, plantKey).setOrigin(0, 0).setDepth(1);
      // Shifted left of center in the gap (was dead-centered), at
      // shelf-row height, per an explicit request.
      this.reviewPilePositions[reviewPile] = { x: gapCenter - 70, y: y - 8 };
    };
    const buildTableRow = (y) => {
      const tableY = y - ASSET_RECTS.libTable.h / 2;
      const chairY = y + ASSET_RECTS.libTable.h / 2 - 6;
      const leftTableX = gapCenter - 40 - ASSET_RECTS.libTable.w;
      const rightTableX = gapCenter + 40;
      this.add.image(leftTableX, tableY, libTableKey).setOrigin(0, 0).setDepth(1);
      this.add.image(leftTableX + 10, chairY, libChairKey).setOrigin(0, 0).setDepth(2);
      this.add.image(rightTableX, tableY, libTableKey).setOrigin(0, 0).setDepth(1);
      this.add.image(rightTableX + 10, chairY, libChairKey).setOrigin(0, 0).setDepth(2);
    };
    const buildSoloPlantRow = (y) => {
      const plantY = y - ASSET_RECTS.plant.h / 2;
      this.add.image(gapCenter - ASSET_RECTS.plant.w / 2, plantY, plantKey).setOrigin(0, 0).setDepth(1);
    };

    // Zone 1 (nearest stairs -> nearest zone 2): row[0] is shelf-17's
    // solo row (no left shelf, so just a plant), row[1] hosts review-2
    // (gates shelf-15, which sits in this same row), row[2] gets a
    // table+chair pair as the transition into zone 2.
    buildSoloPlantRow(LAYOUT.zone1RowY[0]);
    buildReviewRow(LAYOUT.zone1RowY[1], 'review-2');
    buildTableRow(LAYOUT.zone1RowY[2]);
    // Zone 2 (nearest zone 1 -> nearest spawn): row[0] gets a table+chair
    // pair (transition from zone 1); row[1] hosts review-1 (gates
    // shelf-09... reached via zone 1, but placed here since it requires
    // all of zone 2's shelves, which finish in this row).
    buildTableRow(LAYOUT.zone2RowY[0]);
    buildReviewRow(LAYOUT.zone2RowY[1], 'review-1');

    // One more pure-decor P-T&C-P row, nearest the carpet/globe — not
    // shelf-adjacent, so it keeps its own small band.
    const decorSpanLeft = gapLeft;
    const decorSpanRight = gapRight;
    const plantY3 = LAYOUT.decorRow3Y - ASSET_RECTS.plant.h / 2;
    const tableY3 = LAYOUT.decorRow3Y - ASSET_RECTS.libTable.h / 2;
    const chairY3 = LAYOUT.decorRow3Y + ASSET_RECTS.libTable.h / 2 - 6;
    this.add.image(decorSpanLeft + 16, plantY3, plantKey).setOrigin(0, 0).setDepth(1);
    this.add.image(decorSpanLeft + 80, tableY3, libTableKey).setOrigin(0, 0).setDepth(1);
    this.add.image(decorSpanLeft + 90, chairY3, libChairKey).setOrigin(0, 0).setDepth(2);
    this.add.image(decorSpanRight - 16 - ASSET_RECTS.plant.w, plantY3, plantKey).setOrigin(0, 0).setDepth(1);
    this.add.image(decorSpanRight - 80 - ASSET_RECTS.libTable.w, tableY3, libTableKey).setOrigin(0, 0).setDepth(1);
    this.add.image(decorSpanRight - 90 - ASSET_RECTS.libChair.w, chairY3, libChairKey).setOrigin(0, 0).setDepth(2);

    // Globe, centered on the corridor per the requested layout — non-
    // solid like every other decor piece, so centering it doesn't block
    // auto-walk (no collider is ever added for it).
    const globeX = WORLD_W / 2 - ASSET_RECTS.globe.w / 2;
    const globeY = LAYOUT.carpetGlobeY - ASSET_RECTS.globe.h / 2;
    this.furnitureSprites.globe = this.add.image(globeX, globeY, globeKey).setOrigin(0, 0).setDepth(1);

    // Two red carpet accents flanking the globe (simple color swatches —
    // no dedicated "red carpet" crop exists in the source sheets).
    const carpetW = 90;
    const carpetH = 50;
    this.add.rectangle(WORLD_W / 2 - 170, LAYOUT.carpetGlobeY, carpetW, carpetH, 0xd57c7c).setDepth(0);
    this.add.rectangle(WORLD_W / 2 + 170, LAYOUT.carpetGlobeY, carpetW, carpetH, 0xd57c7c).setDepth(0);

    // 4 sofas, 2 per side, stacked vertically hugging each wall (not
    // side-by-side — there isn't enough width between a wall and the
    // centered reception nook below for 2 side-by-side at this scale).
    // This also keeps the whole reception footprint clear on the X axis
    // regardless of its Y, since sofas never reach the center columns.
    // One distinct variant per slot (2-seat couch, 3-seat w/ pillows,
    // armchair w/ pillow, plain armchair), matching the 4-sofa family
    // shown in the reference image, rather than repeating one sprite.
    // Their native crops differ in size (28-48px wide), which read as
    // mismatched scale side-by-side — displayed at one shared size
    // (the largest native footprint, so nothing gets downscaled) so
    // all 4 look uniform.
    const sofaRects = [ASSET_RECTS.sofaCouch2, ASSET_RECTS.sofaCouch3, ASSET_RECTS.sofaArmchairPillow, ASSET_RECTS.sofaArmchairPlain];
    const sofaDisplayW = Math.max(...sofaRects.map((r) => r.w));
    const sofaDisplayH = Math.max(...sofaRects.map((r) => r.h));
    const sofaRowGap = 14;
    const leftSofaX = 60;
    const rightSofaX = WORLD_W - 60 - sofaDisplayW;
    [leftSofaX, rightSofaX].forEach((x, side) => {
      [0, 1].forEach((row) => {
        const slot = side * 2 + row;
        const y = LAYOUT.sofaRowY + row * (sofaDisplayH + sofaRowGap);
        this.furnitureSprites[`sofa${slot + 1}`] = this.add
          .image(x, y, sofaKeys[slot]).setOrigin(0, 0).setDepth(1)
          .setDisplaySize(sofaDisplayW, sofaDisplayH);
      });
    });

    // 2 shoe cabinets, symmetric, flanking the corridor between
    // reception and spawn — per the reference diagram's "CAB CAB". The
    // new cabinet art is tall and narrow (native 39x80, vs the old
    // wide-and-short 48x28 crop) so the display scale is much smaller
    // than before to land at a similar on-screen footprint.
    const shoeCabinetScale = 0.9;
    const shoeCabinetW = ASSET_RECTS.shoeCabinet.w * shoeCabinetScale;
    const shoeCabinetH = ASSET_RECTS.shoeCabinet.h * shoeCabinetScale;
    const cabinetY = LAYOUT.spawnY - shoeCabinetH;
    this.furnitureSprites.shoeCabinetLeft = this.add
      .image(WORLD_W / 2 - 120 - shoeCabinetW, cabinetY, shoeCabinetKey)
      .setOrigin(0, 0).setDepth(1).setDisplaySize(shoeCabinetW, shoeCabinetH);
    this.furnitureSprites.shoeCabinetRight = this.add
      .image(WORLD_W / 2 + 120, cabinetY, shoeCabinetKey)
      .setOrigin(0, 0).setDepth(1).setDisplaySize(shoeCabinetW, shoeCabinetH);
  }

  // -- 17 lesson shelves, two zones (Round 4 relayout) --------------------
  // Zone 2 (shelves 1-8) sits near spawn; Zone 1 (shelves 9-17) sits near
  // the stairs — walking bottom-to-top through the room now walks
  // through the lessons in ascending order, ending at the stairs, per an
  // explicit request. Row Y values here are this pass's single source of
  // truth for the whole vertical layout — buildFurniture()/
  // buildBookPiles()/buildReception()/buildPlayer() all reference the
  // *_ROW_Y constants below rather than duplicating these numbers.

  buildShelves() {
    const shelfW = LAYOUT.shelfW;
    const shelfH = LAYOUT.shelfH;
    const leftColX = LAYOUT.leftColX;
    const rightColX = LAYOUT.rightColX;

    // Zone 1 (9-17, near stairs): [0]=nearest stairs (shelf-17 solo),
    // [1]=mid (11,12/15,16), [2]=nearest zone 2 (9,10/13,14).
    const zone1RowY = LAYOUT.zone1RowY;
    // Zone 2 (1-8, near spawn): [0]=far/nearest zone 1 (3,4/7,8),
    // [1]=near/nearest spawn (1,2/5,6).
    const zone2RowY = LAYOUT.zone2RowY;

    // Wall header above each shelf column block ("WALLS" directly above
    // each S/S group in the reference diagram) — a dark wood-panel bar
    // so the shelves visibly read as built into a wall, not floating in
    // open floor. One per column per zone, sized to that column's
    // topmost shelf row (zone1's left column starts one row lower than
    // its right column, since row[0] is shelf-17's solo row).
    const colWidth = shelfW * 2 + 20;
    const headerH = 14;
    const headerColor = 0x5a4a3a;
    const headerTrim = 0xc9bfa5;
    const buildWallHeader = (x, topY) => {
      this.add.rectangle(x + colWidth / 2, topY - headerH / 2 - 4, colWidth, headerH, headerColor)
        .setDepth(0).setStrokeStyle(2, headerTrim);
    };
    buildWallHeader(leftColX[0], zone1RowY[1]);
    buildWallHeader(rightColX[0], zone1RowY[0]);
    buildWallHeader(leftColX[0], zone2RowY[0]);
    buildWallHeader(rightColX[0], zone2RowY[0]);

    // Matches LESSON_DATA's order (shelf-01..17) exactly.
    const positions = [
      [leftColX[0], zone2RowY[1]], [leftColX[1], zone2RowY[1]],
      [leftColX[0], zone2RowY[0]], [leftColX[1], zone2RowY[0]],
      [rightColX[0], zone2RowY[1]], [rightColX[1], zone2RowY[1]],
      [rightColX[0], zone2RowY[0]], [rightColX[1], zone2RowY[0]],
      [leftColX[0], zone1RowY[2]], [leftColX[1], zone1RowY[2]],
      [leftColX[0], zone1RowY[1]], [leftColX[1], zone1RowY[1]],
      [rightColX[0], zone1RowY[2]], [rightColX[1], zone1RowY[2]],
      [rightColX[0], zone1RowY[1]], [rightColX[1], zone1RowY[1]],
      [rightColX[0], zone1RowY[0]],
    ];

    const filledVariants = ['shelfFilled1', 'shelfFilled2', 'shelfFilled3'];
    const lockedKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.shelfLocked, 'shelfLockedTex');
    const filledKeys = filledVariants.map(
      (v) => cropToTexture(this, 'libAssetPack', ASSET_RECTS[v], v + 'Tex')
    );

    LESSON_DATA.forEach((lesson, i) => {
      const [x, y] = positions[i];
      const sprite = this.add.image(x, y, lockedKey).setOrigin(0, 0).setDepth(1);
      const glow = this.add.text(x + shelfW - 14, y - 6, '⭐', { fontSize: '16px' })
        .setOrigin(0.5).setDepth(4).setVisible(false);

      // Label placement (spec section 4): the lesson number engraved on
      // the empty plinth strip at the shelf's base — small, low-contrast
      // (a shade darker than the maroon plinth wood), not a bold badge.
      this.add.text(x + shelfW / 2, y + shelfH - 12, String(i + 1), {
        fontSize: '10px', fontFamily: 'Georgia, serif', color: '#4a1f1f',
      }).setOrigin(0.5).setDepth(2);
      // Completion checkmark sits beside the number in the plinth label
      // instead of floating over the top-right corner of the shelf, per
      // an explicit request — uses the real checkmark asset instead of
      // the "✅" emoji used everywhere else in this file.
      const stamp = this.add.image(x + shelfW / 2 + 20, y + shelfH - 12, 'checkmarkIcon')
        .setOrigin(0.5).setDepth(4).setDisplaySize(16, 16).setVisible(false);
      this.tweens.add({ targets: glow, alpha: { from: 1, to: 0.35 }, duration: 650, yoyo: true, repeat: -1 });

      // Deliberately non-solid: 2 shelves share each row with only a
      // 14px gap, and auto-walk routing to the far column would have to
      // cross the near column's collision box. Interaction still works
      // via distance checks (TRIGGER_RANGE), not physical contact.
      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => this.handleInteractiveClick(entry));

      const entry = {
        id: lesson.id, kind: 'shelf', title: lesson.title,
        sprite, glow, stamp, lockedKey, filledKey: filledKeys[i % filledKeys.length],
        x: x + shelfW / 2, y: y + shelfH / 2, prereq: SHELF_PREREQ[lesson.id],
        baseScale: 1,
      };
      this.interactives.push(entry);
    });
  }

  // -- 2 review book piles (final quiz is the staircase — see buildTopBand) --

  buildBookPiles() {
    const bookKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.bookPileTall, 'bookPileTex');
    // Positions come from buildFurniture()'s decor rows — review-1 and
    // review-2 each sit as the "R" in one of the P-T&C-R-T&C-P rows (see
    // LAYOUT's comment for which row hosts which).
    const positions = {
      'review-1': { ...this.reviewPilePositions['review-1'], scale: 1.6 },
      'review-2': { ...this.reviewPilePositions['review-2'], scale: 1.6 },
    };

    BOOK_PILE_DATA.forEach((pile) => {
      const pos = positions[pile.id];
      const w = ASSET_RECTS.bookPileTall.w * pos.scale;
      const h = ASSET_RECTS.bookPileTall.h * pos.scale;
      const sprite = this.add.image(pos.x, pos.y, bookKey).setOrigin(0, 0)
        .setDisplaySize(w, h).setDepth(1);
      const glow = this.add.text(pos.x + w - 8, pos.y - 6, '⭐', { fontSize: '18px' })
        .setOrigin(0.5).setDepth(4).setVisible(false);
      const stamp = this.add.text(pos.x + w - 8, pos.y - 6, '✅', { fontSize: '18px' })
        .setOrigin(0.5).setDepth(4).setVisible(false);
      this.tweens.add({ targets: glow, alpha: { from: 1, to: 0.35 }, duration: 650, yoyo: true, repeat: -1 });

      // Non-solid for the same reason as shelves (see buildShelves) —
      // keeps auto-walk routing simple and reliable for all 18 targets.
      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => this.handleInteractiveClick(entry));

      const entry = {
        id: pile.id, kind: 'pile', title: pile.title,
        sprite, glow, stamp, requires: pile.requires,
        x: pos.x + w / 2, y: pos.y + h / 2,
        baseScale: pos.scale,
      };
      this.interactives.push(entry);
    });
  }

  // -- Reception nook: desk + chair + rug, purely decorative --------------
  // Spec section 7 puts this "right after spawn." Round 4 centers it on
  // the corridor between the two vertical sofa stacks (matches the
  // user's ASCII layout, which shows RECEPTION centered above "start").

  buildReception() {
    const deskKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.receptionDesk, 'receptionDeskTex');
    const rugKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.receptionRug, 'receptionRugTex');
    // Reuses buildFurniture's armchairTex crop rather than re-cropping
    // the same source rect under the same key (which Phaser rejects).
    const chairKey = this.armchairKey;

    // libAssetPack's furniture (desk/rug/armchair) is drawn at a much
    // higher pixel density than the sofa/cabinet/curio sheets used
    // elsewhere in this cluster — at native size the desk (191x107) and
    // rug (168x72) dwarfed the 48px-wide sofas next to them. Scaled down
    // so the whole reception nook sits in the same visual scale as its
    // neighbors: desk width lands near the shelf sprite's 87px (the
    // project's existing "big furniture" reference), chair matches the
    // ~32-38px single-seat scale the sofa armchair variants use.
    const deskW = 76;
    const deskH = ASSET_RECTS.receptionDesk.h * (deskW / ASSET_RECTS.receptionDesk.w);
    const rugW = 92;
    const rugH = ASSET_RECTS.receptionRug.h * (rugW / ASSET_RECTS.receptionRug.w);
    const chairW = 32;
    const chairH = ASSET_RECTS.armchair.h * (chairW / ASSET_RECTS.armchair.w);

    const originX = WORLD_W / 2 - deskW / 2;
    const originY = LAYOUT.receptionY;

    this.furnitureSprites.receptionRug = this.add
      .image(originX - 8, originY, rugKey).setOrigin(0, 0)
      .setDisplaySize(rugW, rugH).setDepth(0);
    this.furnitureSprites.receptionDesk = this.add
      .image(originX, originY + 10, deskKey).setOrigin(0, 0)
      .setDisplaySize(deskW, deskH).setDepth(1);
    this.furnitureSprites.receptionChair = this.add
      .image(originX + deskW / 2 - chairW / 2, originY - 22, chairKey).setOrigin(0, 0)
      .setDisplaySize(chairW, chairH).setDepth(1);
    // Non-solid, same reasoning as every other decor piece this round.
  }

  // -- Player + camera -----------------------------------------------------

  buildPlayer() {
    // Spawns at the south gate now (the door/north entrance is gone —
    // the staircase at the north end is the N4 exit, not an entry
    // point), on the rug just above the gate opening.
    const spawnX = WORLD_W / 2;
    const spawnY = LAYOUT.spawnY;
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
    if (!this.solidGroup) this.solidGroup = this.physics.add.staticGroup();
    const block = this.add.rectangle(x, y, w, h, 0x000000, 0).setOrigin(0, 0);
    this.physics.add.existing(block, true);
    this.solidGroup.add(block);
  }

  wireInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
    this.interactKey = this.input.keyboard.addKey('E');
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const tryInteract = () => {
      const near = this.nearestInRange();
      if (near) this.openPanel(near);
    };
    this.interactKey.on('down', tryInteract);
    this.enterKey.on('down', tryInteract);
    this.spaceKey.on('down', tryInteract);
  }

  handleInteractiveClick(entry) {
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.x, entry.y);
    if (dist <= TRIGGER_RANGE) {
      this.openPanel(entry);
      return;
    }
    // Route through the clear central corridor (horizontal -> vertical
    // -> final approach) instead of one straight line. A direct line to
    // a far/off-axis shelf reliably grazes some OTHER shelf's collision
    // box along the way (found by testing every shelf, not just one) -
    // the corridor at WORLD_W/2 is kept clear of every shelf cluster and
    // both review piles by design, so routing through it avoids that
    // whole class of got-stuck bug rather than special-casing each one.
    const corridorX = WORLD_W / 2;
    this.moveQueue = [
      { x: corridorX, y: this.player.y },
      { x: corridorX, y: entry.y },
      { x: entry.x, y: entry.y },
    ];
    this.pendingInteract = entry;
  }

  nearestInRange() {
    let closest = null;
    let closestDist = Infinity;
    this.interactives.forEach((entry) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.x, entry.y);
      if (dist <= TRIGGER_RANGE && dist < closestDist) {
        closest = entry;
        closestDist = dist;
      }
    });
    return closest;
  }

  // -- Lesson/review panel --------------------------------------------------

  openPanel(entry) {
    const state = entry.kind === 'shelf'
      ? getState(entry.id, entry.prereq, this.progress)
      : (this.progress[entry.id] ? 'completed'
        : (entry.requires.every((r) => this.progress[r]) ? 'available' : 'locked'));

    if (state === 'locked') {
      showToast('Not yet…');
      return;
    }

    const panel = ensurePanel();
    document.getElementById('nekoPanelTitle').textContent = entry.title;
    document.getElementById('nekoPanelBody').textContent = state === 'completed'
      ? 'Already completed. Review anytime.'
      : (entry.kind === 'shelf' ? 'Lesson content coming soon.' : 'Checkpoint content coming soon.');
    panel.style.display = 'flex';

    const completeBtn = document.getElementById('nekoPanelComplete');
    const closeBtn = document.getElementById('nekoPanelClose');
    const onComplete = () => {
      this.progress[entry.id] = true;
      saveProgress(this.progress);
      this.refreshAllStates();
      this.closePanel();
    };
    const onClose = () => this.closePanel();
    completeBtn.onclick = onComplete;
    closeBtn.onclick = onClose;

    this.panelOpen = true;
  }

  closePanel() {
    const panel = document.getElementById('nekoLessonPanel');
    if (panel) panel.style.display = 'none';
    this.panelOpen = false;
  }

  refreshAllStates() {
    this.interactives.forEach((entry) => {
      const state = entry.kind === 'shelf'
        ? getState(entry.id, entry.prereq, this.progress)
        : (this.progress[entry.id] ? 'completed'
          : (entry.requires.every((r) => this.progress[r]) ? 'available' : 'locked'));

      if (entry.kind === 'shelf') {
        entry.sprite.setTexture(state === 'locked' ? entry.lockedKey : entry.filledKey);
      }
      // The staircase is exempt from the locked-state dim — see
      // buildTopBand's comment: fading a large architectural piece to
      // 55% opacity reads as broken, not "locked". It still gates
      // correctly (openPanel's "Not yet…" toast is unaffected), it just
      // always renders at full visibility.
      if (entry.id !== 'final-quiz') {
        entry.sprite.setAlpha(state === 'locked' ? 0.55 : 1);
      }
      entry.glow.setVisible(state === 'available');
      entry.stamp.setVisible(state === 'completed');
    });
  }

  // One-time celebratory flourish on passing the quiz gate — same
  // lightweight emoji+tween approach as the glow/checkmark icons above,
  // not a new particle-emitter system. Purely visual, no state.
  spawnPassSparkle(x, y) {
    const sparkCount = 6;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount;
      const dist = 40;
      const targetX = x + Math.cos(angle) * dist;
      const targetY = y + Math.sin(angle) * dist;
      const spark = this.add.text(x, y, '✨', { fontSize: '18px' })
        .setOrigin(0.5).setDepth(10);
      this.tweens.add({
        targets: spark,
        x: targetX,
        y: targetY,
        scale: { from: 1, to: 1.4 },
        alpha: { from: 1, to: 0 },
        duration: 700,
        ease: 'Cubic.Out',
        onComplete: () => spark.destroy(),
      });
    }
  }

  // -- Per-frame update: movement, auto-walk, proximity glow -------------

  update() {
    this.updatePlayerAnimation();
    if (this.panelOpen) {
      this.player.setVelocity(0, 0);
      return;
    }

    const SPEED = 140;
    let vx = 0;
    let vy = 0;

    if (this.moveQueue && this.moveQueue.length > 0) {
      const waypoint = this.moveQueue[0];
      const isFinalWaypoint = this.moveQueue.length === 1;
      // Intermediate corridor waypoints just need to be "close enough
      // to turn" (small threshold, keeps routing tight); the final
      // waypoint is the actual interactive's center, which — same as
      // before — needs the larger ARRIVE_THRESHOLD because its own
      // collision body physically prevents getting closer than that.
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
            this.openPanel(toOpen);
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
  scene: [CatSelectScene, LibraryScene],
});

window.__n5Game = n5PhaserGame;

document.getElementById('changeCharBtn')?.addEventListener('click', () => {
  if (!n5PhaserGame.scene.isActive('LibraryScene')) return;
  const libraryScene = n5PhaserGame.scene.getScene('LibraryScene');
  if (libraryScene.panelOpen) return; // don't stack over an open lesson/review panel
  n5PhaserGame.scene.pause('LibraryScene');
  // The global SceneManager (game.scene) has no .launch() - that's a
  // per-scene ScenePlugin convenience method, not present here (confirmed
  // by enumerating game.scene's prototype: add/start/run/sleep/wake/
  // pause/resume/stop/switch, no launch). run() is the right global
  // equivalent: starts the scene fresh if stopped (which CatSelectScene
  // is, from its earlier boot-time this.scene.start('LibraryScene')
  // call), or resumes/wakes it if already paused/sleeping.
  n5PhaserGame.scene.run('CatSelectScene', { overlay: true });
  // run() reactivates the scene but doesn't change its render order -
  // CatSelectScene was registered before LibraryScene in the game config
  // and stays at that lower draw position, so without this it renders
  // BEHIND the (still-visible-while-paused) map instead of over it.
  n5PhaserGame.scene.bringToTop('CatSelectScene');
});
