const ASSET_RECTS = {
  // floors-walls02.png (288x160px) — brickTile still used for the outer
  // border only; the old floorTile/floorTileVariant crops were removed
  // once the interior floor switched to TopDownHouse_FloorsAndWalls.png.
  brickTile: { x: 30, y: 90, w: 16, h: 16 },
  // TopDownHouse_FloorsAndWalls.png (288x144px) — a 4-column x 2-row grid
  // of wall+floor swatch pairs (no consistent internal cell borders, found
  // via per-row color-transition scanning, not a uniform tile grid). Column
  // 2's pair confirmed against the user's own screenshot: the grooved
  // reddish-brown wood panel (wall, replaces the corridor's old flat-color
  // divider) and its paired tan diamond-weave floor (replaces floorTile).
  dividerWallPanel: { x: 81, y: 52, w: 63, h: 28 },
  topDownFloorTile: { x: 81, y: 81, w: 63, h: 46 },
  // libassetpack-tiled.png (1488x528px) — all found via alpha-channel
  // pixel scanning (getImageData row/column opaque-run detection), the
  // only reliable measurement method found this project (see SUMMARY.md).
  // h trimmed from 300: a narrow (~8px) support-beam/pillar feature at
  // the crop's right edge (cols 424-431) is opaque all the way to the
  // crop's bottom row. Since display height scales uniformly with the
  // width-driven wallScale (see buildTopBand's "moved right until the
  // wood floor" fix), that pillar's tail was being stretched down to
  // world y≈515 — well past the y=464 row where the side-wall brick
  // strip already picks up — reading as a dark line running into open
  // floor. 269 keeps the pillar but stops it right at that seam instead.
  wallBalcony: { x: 1040, y: 0, w: 448, h: 269 },
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
  // paver/stone tiles sitting just below it in the sheet. h further
  // corrected 26->25: per-row scanning found the couch's own opaque
  // content ends at row 191 (y:167-191), and the old h:26 crop's last
  // row (192) was already the first row of an unrelated sprite sitting
  // just below the couch in the sheet — showing as a stray dark line
  // under the couch once rendered in-game.
  sofaCouch2: { x: 24, y: 167, w: 56, h: 25 },
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
// Was 119 — grown to fit the SHELF_SCALE-enlarged vertical stack below
// (shelves render bigger now, so every row/zone/decor gap scales with
// them; see LAYOUT).
const GRID_ROWS = 151;
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
//
// Shelves render SHELF_SCALE times their native crop size (was native
// 1x) so the wooden-plaque label's text doesn't need to be shrunk to
// fit, per explicit request. Every gap in the vertical/horizontal stack
// below (row spacing, the zone-1/zone-2 transition, decor row, carpet,
// sofas, reception, spawn, and the gap between paired shelf columns)
// scales proportionally with it, so the whole layout stays internally
// consistent — retuning the size later only means changing this one
// number. GRID_ROWS above grew (119 -> 151) to fit the taller result.
// This is a bigger, untested change than earlier small tweaks this
// session (browser tooling has been unavailable throughout) — the
// reachability/no-overlap math is worked out by hand below, but a real
// playthrough check is worth doing once verification is possible again.
const SHELF_SCALE = 1.4;
const shelfW = ASSET_RECTS.shelfLocked.w * SHELF_SCALE;
const shelfH = ASSET_RECTS.shelfLocked.h * SHELF_SCALE;
const shelfPairGap = 20 * SHELF_SCALE; // gap between the 2 shelves in the same column pair — was a fixed 20
const shelfRowGap = 132 * SHELF_SCALE; // gap between consecutive shelf rows within one zone
const zoneTransitionGap = 258 * SHELF_SCALE; // gap between zone 1's last row and zone 2's first row
const decorRow3Gap = 158 * SHELF_SCALE;
const carpetGlobeGap = 100 * SHELF_SCALE;
const sofaRowGap = 140 * SHELF_SCALE;
const receptionGap = 40 * SHELF_SCALE;
const spawnGap = 180 * SHELF_SCALE;

const zone1Row0 = 560; // unchanged anchor — same distance below the top wall band as before scaling
const zone1RowY = [zone1Row0, zone1Row0 + shelfRowGap, zone1Row0 + shelfRowGap * 2];
const zone2Row0 = zone1RowY[2] + zoneTransitionGap;
const zone2RowY = [zone2Row0, zone2Row0 + shelfRowGap];
const decorRow3Y = zone2RowY[1] + decorRow3Gap;
const carpetGlobeY = decorRow3Y + carpetGlobeGap;
const sofaRowY = carpetGlobeY + sofaRowGap;
const receptionY = sofaRowY + receptionGap;
const spawnY = receptionY + spawnGap;

const LAYOUT = {
  // Shelf column geometry — shared by buildShelves() (shelf positions)
  // and buildFurniture() (the P/T&C/RV decor sitting in the gap between
  // the two shelf columns at each row, per an explicit reference
  // diagram showing those items beside the shelves, not in a separate
  // band above/below each zone).
  shelfW,
  shelfH,
  // Margin stays 40 short of the wall's true edge (64), matching the
  // "flush against the wall" fix from an earlier pass — untouched by
  // the scale-up since it's independent of shelf size.
  leftColX: [64, 64 + shelfW + shelfPairGap],
  rightColX: [
    WORLD_W - 64 - shelfW * 2 - shelfPairGap,
    WORLD_W - 64 - shelfW,
  ],
  zone1RowY, // shelves 9-17 (nearest stairs -> nearest zone 2)
  zone2RowY, // shelves 1-8 (nearest zone 1 -> nearest spawn)
  decorRow3Y, // P / T&C / P — pure decor, nearest the carpet/globe
  carpetGlobeY, // red carpet / globe / red carpet
  sofaRowY, // 4 sofas, 2 per side, flanking the corridor
  receptionY, // centered — sits between the two vertical sofa stacks
  spawnY,
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
const FAVORITES_KEY = 'nekoBunko.n5.favorites';
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
    // localStorage unavailable — degrade to session-only, same pattern
    // as saveProgress().
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

// Hand-drawn woven pixel-art rug: bordered edges with alternating fringe
// ticks, horizontal thread-line weave texture across the body, and a
// centered cream/tan diamond motif. Brick-red/gold-tan palette (no pink)
// per explicit feedback. Shared by the long corridor runner (drawn once
// as a small repeat unit, then tiled via tileSprite) and the two smaller
// accent rugs beside the globe (drawn at their own full, fixed size, no
// tiling needed) so every rug in the room reads as the same family.
function drawWovenRug(scene, key, w, h) {
  const rugDark = 0x3a1816;
  const rugFringeLight = 0x4a231f;
  const rugBase = 0x7a3230;
  const rugWeave = 0x6b2b28;
  const rugMotif = 0xc9a66b;
  const rugMotifShade = 0xa87f4a;
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

// Reusable wooden-plaque shelf label — replaces the earlier parchment-tag
// style per an explicit mockup comparison (deep maroon-red plank, matched
// to the shelf's own wood color, over the lighter tan-brown a generic
// wooden plaque would default to). Dark frame, wood-grain plank lines,
// 4 gold corner rivets, cream engraved text in the project's existing
// "Press Start 2P" pixel font (matching the retro menus/HUD elsewhere in
// this file — no new text pipeline introduced). Auto-sizes to the text
// (word-wrapped to maxWidth) so both short tags and long phrases fit
// without overflowing. (x, y) anchors the plaque's top-center; the caller
// positions it at the shelf's existing bottom-of-shelf label spot.
//
// "Press Start 2P" has no Japanese glyphs; DotGothic16 (loaded in
// n5-dashboard.html as a fallback specifically for this) is a Japanese
// pixel/dot-matrix font in a matching retro style. CSS font-family
// fallback resolves per-glyph, so Latin characters still render in Press
// Start 2P and only the Japanese ones (e.g. "か", "ましょう" in some
// lesson titles) fall through to DotGothic16 — no separate text pipeline.
let bookshelfLabelSeq = 0;
function createBookshelfLabel(scene, x, y, text, options = {}) {
  const fontSize = options.fontSize || 6;
  const paddingX = options.paddingX || 6;
  const paddingY = options.paddingY || 5;
  const maxWidth = options.maxWidth || 78;
  const frame = '#3a1414';
  const plank = '#7a2e2e';
  const grain = '#5a1f1f';
  const rivet = '#c9a66b';
  const ink = '#e8d4a8';
  const textStyle = {
    fontFamily: '"Press Start 2P", "DotGothic16", monospace', fontSize: fontSize + 'px', color: ink,
    align: 'center', wordWrap: { width: maxWidth - paddingX * 2, useAdvancedWrap: true },
  };

  // Measure first (throwaway, invisible) so the plaque background can be
  // sized exactly to the wrapped text instead of a guessed constant.
  const measure = scene.add.text(0, 0, text, textStyle).setVisible(false);
  const textW = Math.min(measure.width, maxWidth - paddingX * 2);
  const textH = measure.height;
  measure.destroy();

  const tagW = Math.ceil(textW + paddingX * 2);
  const tagH = Math.ceil(textH + paddingY * 2);

  bookshelfLabelSeq += 1;
  const key = `bookshelfLabelTex_${bookshelfLabelSeq}`;
  const tex = scene.textures.createCanvas(key, tagW, tagH);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;

  // Dark frame, inset plank fill.
  ctx.fillStyle = frame;
  ctx.fillRect(0, 0, tagW, tagH);
  ctx.fillStyle = plank;
  ctx.fillRect(2, 2, tagW - 4, tagH - 4);

  // Wood-grain plank lines, every 6px.
  ctx.fillStyle = grain;
  for (let gy = 6; gy < tagH - 3; gy += 6) ctx.fillRect(4, gy, tagW - 8, 1);

  // 4 gold corner rivets.
  ctx.fillStyle = rivet;
  ctx.fillRect(4, 4, 2, 2);
  ctx.fillRect(tagW - 6, 4, 2, 2);
  ctx.fillRect(4, tagH - 6, 2, 2);
  ctx.fillRect(tagW - 6, tagH - 6, 2, 2);

  tex.refresh();

  const bg = scene.add.image(x, y, key).setOrigin(0.5, 0);
  const label = scene.add.text(x, y + paddingY, text, textStyle).setOrigin(0.5, 0);
  return { bg, label, width: tagW, height: tagH };
}

// Tiny retro-tech trinket sitting on top of a shelf — replaces the old
// "⭐" emoji "available" indicator. Reads as a miniature version of the
// game's own retro-menu chrome (same near-black + gold palette players
// already see when clicking a shelf) rather than an unrelated prop: a
// bordered panel with 2 corner accent squares and a segmented progress
// bar, styled after a retro loading-screen panel per an explicit
// reference. Actually animates (was a single static frame) — draws one
// texture per fill state (0..segCount segments lit) and registers a
// looping Phaser animation over them, so it genuinely reads as a loading
// bar cycling rather than just a pulsing icon. Drawn/registered once
// (guarded) and shared by every shelf sprite that plays the animation.
let shelfTrinketAnimKey = null;
function buildShelfTrinketAnim(scene) {
  if (shelfTrinketAnimKey) return shelfTrinketAnimKey;
  shelfTrinketAnimKey = 'shelfTrinketLoad';

  // Was 26x19 — resized (alongside the matching completed-badge below)
  // to match the mockup size/proportions the user approved.
  const w = 30;
  const h = 22;
  const face = '#1a1410';
  const hi = '#5a4a3a';
  const lo = '#000000';
  const track = '#0a0806';
  const segFill = '#f0c674';
  const segEmpty = '#3a2418';
  const corner1 = '#f0c674';
  const corner2 = '#6b2f2c';
  const segCount = 5;

  const frameKeys = [];
  for (let segFilled = 0; segFilled <= segCount; segFilled++) {
    const key = `shelfTrinketFrame${segFilled}`;
    const tex = scene.textures.createCanvas(key, w, h);
    const ctx = tex.getContext();
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = lo;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = face;
    ctx.fillRect(1, 1, w - 2, h - 2);
    ctx.fillStyle = hi;
    ctx.fillRect(1, 1, w - 2, 1);

    // Corner accent squares, top edge.
    ctx.fillStyle = corner1;
    ctx.fillRect(3, 3, 3, 3);
    ctx.fillStyle = corner2;
    ctx.fillRect(w - 6, 3, 3, 3);

    // Segmented progress bar — this frame's fill state.
    ctx.fillStyle = track;
    ctx.fillRect(3, h - 7, w - 6, 4);
    const segW = (w - 8) / segCount;
    for (let i = 0; i < segCount; i++) {
      ctx.fillStyle = i < segFilled ? segFill : segEmpty;
      ctx.fillRect(4 + i * segW, h - 6, Math.max(1, segW - 1), 2);
    }

    tex.refresh();
    frameKeys.push(key);
  }

  // 0 -> full -> back to 0, looping, slow enough (3fps) that each step
  // reads as a distinct "block filled in" moment, not a blur.
  const frames = frameKeys.concat(frameKeys.slice(1, -1).reverse()).map((key) => ({ key }));
  scene.anims.create({ key: shelfTrinketAnimKey, frames, frameRate: 3, repeat: -1 });
  return shelfTrinketAnimKey;
}

// Center-of-shelf "completed" indicator. Faithful port of the approved
// mockup option ("same panel as the loading trinket, checkmark instead
// of bar") — a slightly greener take on the trinket's panel (not an
// exact color copy: gold top-left corner + green top-right, a dark
// track strip with a solid green fill bar, smooth-stroked checkmark)
// rather than the trinket's literal near-black/gold palette, since
// that's what the shown mockup actually looked like and was approved.
// 30x22, matching the trinket's own resize. Shown instead of the
// trinket once a shelf reaches 'completed' (the trinket itself only
// shows for 'available' — see refreshAllStates). Static single frame.
let shelfCompleteKey = null;
function drawShelfCompleteTexture(scene) {
  if (shelfCompleteKey) return shelfCompleteKey;
  shelfCompleteKey = 'shelfCompleteTex';

  const w = 30;
  const h = 22;
  const outline = '#000000';
  const face = '#1a2b1a';
  const hi = '#3a6b40';
  const corner1 = '#c9a66b';
  const corner2 = '#2f6b3f';
  const trackBg = '#0a0806';
  const trackFill = '#3ca35c';
  const checkColor = '#c8f0d0';

  const tex = scene.textures.createCanvas(shelfCompleteKey, w, h);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = outline;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = face;
  ctx.fillRect(1, 1, w - 2, h - 2);
  ctx.fillStyle = hi;
  ctx.fillRect(1, 1, w - 2, 1);

  ctx.fillStyle = corner1;
  ctx.fillRect(3, 3, 3, 3);
  ctx.fillStyle = corner2;
  ctx.fillRect(w - 6, 3, 3, 3);

  ctx.fillStyle = trackBg;
  ctx.fillRect(3, h - 8, w - 6, 5);
  ctx.fillStyle = trackFill;
  ctx.fillRect(4, h - 7, w - 8, 3);

  // Smooth-stroked checkmark (not blocky pixel squares) — matches the
  // mockup exactly rather than this file's usual hard-pixel convention,
  // since that softer line is specifically what was approved here.
  const cx = w / 2;
  const cy = h / 2 - 2;
  const s = 6;
  ctx.strokeStyle = checkColor;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.5, cy);
  ctx.lineTo(cx - s * 0.15, cy + s * 0.4);
  ctx.lineTo(cx + s * 0.55, cy - s * 0.45);
  ctx.stroke();

  tex.refresh();
  return shelfCompleteKey;
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
    this.load.image('floorsWallsTopDown', '../../assets/images/ui/TopDownHouse_FloorsAndWalls.png');
    this.load.image('furniture03', '../../assets/images/ui/furniture03.png');
    this.load.image('libAssetPack', '../../assets/images/ui/libassetpack-tiled.png');
    this.load.image('doorsWindows', '../../assets/images/ui/TopDownHouse_DoorsAndWindows.png');
    this.load.image('topDownFurniture1', '../../assets/images/ui/TopDownHouse_FurnitureState1.png');
    this.load.image('checkmarkIcon', '../../assets/images/ui/checkmark-1-Original.png');
    this.load.image('favoriteIcon', '../../assets/images/icons/pixels/gay.png');
    this.load.image('finishFlagIcon', '../../assets/images/ui/finish-line-Original.png');
    loadCatSpritesheets(this);
  }

  create() {
    this.interactives = []; // { id, kind, sprite, glow, stamp, x, y, prereq/requires }
    this.progress = loadProgress();
    this.favorites = loadFavorites();
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

    ensureToast();
  }

  // -- Floor + border tilemap -------------------------------------------

  buildFloor() {
    // Floor tile swapped for the new TopDownHouse_FloorsAndWalls.png crop
    // (topDownFloorTile) per explicit request — rendered as a single
    // tileSprite spanning the whole world instead of a per-cell tilemap
    // tile, so the 63x46 source repeats at its native size with guaranteed
    // seamless wrapping (Phaser tileSprite tiling) rather than being
    // squeezed into the unrelated 16x16 border-tile grid. Sits at depth -1,
    // strictly behind the border tilemap below.
    const floorKey = cropToTexture(this, 'floorsWallsTopDown', ASSET_RECTS.topDownFloorTile, 'topDownFloorTileTex');
    this.add.tileSprite(0, 0, WORLD_W, WORLD_H, floorKey).setOrigin(0, 0).setDepth(-1);

    // Border tileset now holds only the brick tile — untouched, per
    // explicit instruction to leave the left/right/outer border exactly
    // as-is. Every non-border cell (including the gate opening) is now
    // "no tile" (-1) so the floor tileSprite above shows through.
    const floorSrc = this.textures.get('floorsWalls').getSourceImage();
    const tileTex = this.textures.createCanvas('libraryTiles', TILE_SIZE, TILE_SIZE);
    const tileCtx = tileTex.getContext();
    tileCtx.imageSmoothingEnabled = false;
    tileCtx.drawImage(
      floorSrc, ASSET_RECTS.brickTile.x, ASSET_RECTS.brickTile.y, TILE_SIZE, TILE_SIZE,
      0, 0, TILE_SIZE, TILE_SIZE
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
        row.push(isBorder && !isGate ? 0 : -1);
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
    // Was 40 — alpha-scanned per-row against the live crop and found the
    // staircase's real (opaque) content starts as late as world x≈65 at
    // some rows, leaving a wide strip of bare floor between it and the
    // true left wall (x=16, just past the 1-tile brick border). Shifting
    // the sprite's origin left closes that gap; the small sliver of the
    // sprite this pushes past x=0 is off-world and simply never rendered.
    const stairX = -5;

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
    // The staircase's real (opaque) art only occupies the top ~53% of its
    // 300px-tall source crop (alpha-scanned: rows 0-160 of 300) — the rest
    // is transparent padding. "Bottom of the stairs" means the bottom of
    // that real art (staircaseDisplayHeight * 160/300), not the padded
    // bounding box, and uses the finish-line flag image instead of a
    // checkmark emoji per the explicit reference image.
    const stairContentBottom = staircaseDisplayHeight * (160 / 300);
    // Spans the staircase's own width (with a small margin on each side)
    // instead of a small fixed-size icon — "spans between the end of
    // each stairs right and left" per feedback. Height keeps the
    // checkered pattern reasonably readable rather than matching the
    // source image's native (near-square) aspect ratio, which at this
    // width would make it far taller than a finish-line banner should be.
    const stairStampWidth = staircaseDisplayWidth - 16;
    const stairStamp = this.add
      .image(stairX + staircaseDisplayWidth / 2, stairContentBottom, 'finishFlagIcon')
      .setOrigin(0.5).setDepth(4).setDisplaySize(stairStampWidth, 50).setVisible(false);
    this.tweens.add({ targets: stairGlow, alpha: { from: 1, to: 0.35 }, duration: 650, yoyo: true, repeat: -1 });

    const wallRect = ASSET_RECTS.wallBalcony;
    const wallX = stairX + staircaseDisplayWidth;
    // Was WORLD_W - 40 - wallX — same issue as stairX above: alpha-scanning
    // found the wall art's real right edge lands ~26px short of its own
    // bounding box consistently (world x≈830 vs bbox edge 856), which on
    // top of this deliberate margin left a ~50px bare-floor gap before the
    // brick border at 880. Widening the target (effectively a small
    // negative margin — the bbox is allowed to extend a few px past the
    // world edge, which is simply never rendered) pushes the real content
    // edge to ≈877, flush against the floor/brick boundary.
    const wallTargetWidth = WORLD_W - wallX + 10;
    const wallScale = wallTargetWidth / wallRect.w;
    const wallDisplayWidth = wallRect.w * wallScale;
    const wallDisplayHeight = wallRect.h * wallScale;

    const wallKey = cropToTexture(this, 'libAssetPack', wallRect, 'wallBalconyTex');
    this.furnitureSprites.wallBalcony = this.add
      .image(wallX, 0, wallKey)
      .setOrigin(0, 0)
      .setDisplaySize(wallDisplayWidth, wallDisplayHeight);

    // Block the player from walking into the painted wall art. Split into
    // a staircase-specific block and a wall-specific block (was one
    // uniform-height rectangle sized off the taller of the two) — alpha-
    // scanning found the staircase's real content ends far higher (~53%
    // of its height) than the wall's (whose lower "trim/railing" sections
    // reach much further down), so sharing one height meant the staircase
    // was blocked well past where anything is actually drawn. Each block
    // now uses a tight-but-safe height for its own art (small buffer
    // above the alpha-scanned real content edge), letting the player walk
    // noticeably closer to both.
    const stairBlockHeight = stairContentBottom + 15;
    const stairBlock = this.add.rectangle(0, 0, wallX, stairBlockHeight, 0x000000, 0)
      .setOrigin(0, 0);
    this.physics.add.existing(stairBlock, true);
    this.wallGroup.add(stairBlock);

    const wallBlockHeight = 260;
    const wallBlock = this.add.rectangle(wallX, 0, WORLD_W - wallX, wallBlockHeight, 0x000000, 0)
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
      // Smaller than the default TRIGGER_RANGE (80): the staircase is a
      // much bigger sprite than a shelf, so the same 80px radius from its
      // base point read as "still visibly far from the stairs" — the
      // hover-highlight (scale-up) and keyboard-interact were both firing
      // well before the player looked anywhere near it. Only affects the
      // proximity checks (nearestInRange/handleInteractiveClick's already-
      // close case); auto-walk-then-arrive uses its own ARRIVE_THRESHOLD
      // and is unaffected, so click-to-walk-there still works normally.
      triggerRange: 45,
    };
    staircaseSprite.setInteractive({ useHandCursor: true });
    staircaseSprite.on('pointerdown', () => this.handleInteractiveClick(stairEntry));
    this.interactives.push(stairEntry);

    // Windows: 4 total, as 2 mirrored pairs straddling the "veranda" — the
    // raised balcony/pillar feature alpha-scanned earlier at wallBalconyTex
    // columns ~123-224 (its real content starts far lower than the rest of
    // the wall there, see the windowY note below). Simple even 5-slot
    // spacing put one window directly on top of that pillared veranda,
    // which reads as structurally wrong regardless of vertical alignment —
    // windows shouldn't sit on a balcony rail. Each pair's offset is
    // measured from the veranda's own center, not the wall's, so the left
    // pair mirrors the right pair around the veranda exactly (left window
    // "moved left, symmetrical to the right one" per feedback), even
    // though the veranda itself isn't centered on the wall as a whole.
    const windowRect = ASSET_RECTS.wallWindow;
    const windowKey = cropToTexture(this, 'doorsWindows', windowRect, 'wallWindowTex');
    const windowScale = 1.8;
    const windowDisplayWidth = windowRect.w * windowScale;
    const windowDisplayHeight = windowRect.h * windowScale;
    // Real (opaque) content in this column range starts ~35 source rows
    // (60 world px) lower than the rest of the wall — a window fixed at
    // the old windowY=42 sat partly above where the art begins there,
    // reading as "floating". 68 clears that threshold everywhere.
    const windowY = 68;
    const verandaStartCol = 123;
    const verandaEndCol = 224;
    const verandaCenterX = wallX + ((verandaStartCol + verandaEndCol) / 2) * wallScale;
    const innerOffset = 125; // clears the veranda's own edges with margin
    const outerOffset = 229; // roomy, symmetric gap from the inner pair
    const windowCenterXs = [
      verandaCenterX - outerOffset,
      verandaCenterX - innerOffset,
      verandaCenterX + innerOffset,
      verandaCenterX + outerOffset,
    ];
    windowCenterXs.forEach((cx, i) => {
      this.furnitureSprites[`wallWindow${i}`] = this.add
        .image(cx - windowDisplayWidth / 2, windowY, windowKey)
        .setOrigin(0, 0)
        .setDisplaySize(windowDisplayWidth, windowDisplayHeight)
        .setDepth(3);
    });

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
    // Single "upward facing" 2-seat couch, reused for all 4 sofa slots
    // (was 4 distinct variants — see the placement loop below).
    const sofaKeys = [cropToTexture(this, 'topDownFurniture1', ASSET_RECTS.sofaCouch2, 'sofaCouch2Tex')];
    // Shoe cabinet, from furniture03.png per an explicit reference image.
    const shoeCabinetKey = cropToTexture(this, 'furniture03', ASSET_RECTS.shoeCabinet, 'shoeCabinetTex');

    // Center corridor rug — a hand-drawn woven pixel-art runner (border +
    // fringe ticks, horizontal thread-line texture, a repeating cream
    // diamond motif) instead of either the old flat 3-shade block or the
    // wood-panel wall texture tried in an earlier pass. Brick-red/gold-tan
    // palette per explicit feedback that the previous pink/maroon clashed
    // with the library's warm wood tones — the globe's accent rugs below
    // get the same treatment now too. Drawn once as a small repeat-unit
    // texture (drawWovenRug) and tiled via tileSprite — same rendering
    // approach as the floor and wall-header tiles elsewhere in this file,
    // guaranteeing a seamless repeat along the corridor's length. Non-
    // solid, like every other decor piece (walkable, no collider added).
    const corridorX = WORLD_W / 2;
    const corridorTop = 460; // just below the top wall block, unrelated to any shelf row now
    const corridorBottom = LAYOUT.receptionY;
    const corridorHeight = corridorBottom - corridorTop;
    const corridorMidY = (corridorTop + corridorBottom) / 2;
    // Tunable — was 56 (the flat placeholder's width), widened per
    // explicit request that the old strip read as too thin for the aisle.
    const corridorWidth = 80;
    const corridorRugRepeatH = 32;
    drawWovenRug(this, 'corridorRugTex', corridorWidth, corridorRugRepeatH);
    this.add.tileSprite(corridorX, corridorMidY, corridorWidth, corridorHeight, 'corridorRugTex')
      .setDepth(0);

    // Per-shelf-row decor: P/T&C/RV sit in the gap between the left and
    // right shelf columns AT THE SAME ROW HEIGHT as the shelves next to
    // them, per an explicit reference diagram — not in a separate band
    // above/below each zone (the earlier layout).
    const gapLeft = LAYOUT.leftColX[1] + LAYOUT.shelfW; // inner edge of the left shelf column
    const gapRight = LAYOUT.rightColX[0]; // inner edge of the right shelf column
    const gapCenter = (gapLeft + gapRight) / 2;
    this.reviewPilePositions = {};

    // Plants moved out of the review row and into the paired table row
    // instead (per an explicit reference diagram) — "beside the wall" in
    // the row that's actually adjacent to the shelf columns, not
    // duplicated in both. The review pile shifts further left into the
    // gap the left plant used to occupy, closer to the shelves.
    const buildReviewRow = (y, reviewPile) => {
      this.reviewPilePositions[reviewPile] = { x: gapLeft + 70, y: y - 8 };
    };
    const buildTableRow = (y) => {
      const tableY = y - ASSET_RECTS.libTable.h / 2;
      const chairY = y + ASSET_RECTS.libTable.h / 2 - 6;
      const plantY = y - ASSET_RECTS.plant.h / 2;
      const leftTableX = gapCenter - 40 - ASSET_RECTS.libTable.w;
      const rightTableX = gapCenter + 40;
      this.add.image(gapLeft + 16, plantY, plantKey).setOrigin(0, 0).setDepth(1);
      this.add.image(leftTableX, tableY, libTableKey).setOrigin(0, 0).setDepth(1);
      this.add.image(leftTableX + 10, chairY, libChairKey).setOrigin(0, 0).setDepth(2);
      this.add.image(rightTableX, tableY, libTableKey).setOrigin(0, 0).setDepth(1);
      this.add.image(rightTableX + 10, chairY, libChairKey).setOrigin(0, 0).setDepth(2);
      this.add.image(gapRight - 16 - ASSET_RECTS.plant.w, plantY, plantKey).setOrigin(0, 0).setDepth(1);
    };
    // Beside the RIGHT wall specifically — this row only has a shelf
    // (shelf-17) on the right side (see the zone-1 call below), so that's
    // the only side with an actual wall to sit against. Was dead-centered
    // in the open gap, the one instance the "beside the wall" fix missed.
    const buildSoloPlantRow = (y) => {
      const plantY = y - ASSET_RECTS.plant.h / 2;
      this.add.image(gapRight - 16 - ASSET_RECTS.plant.w, plantY, plantKey).setOrigin(0, 0).setDepth(1);
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

    // One more pure-decor T&C-T&C row, nearest the carpet/globe — not
    // shelf-adjacent, so it keeps its own small band. No plants here
    // (removed per feedback) — they were redundant with the ones now
    // living in every table row.
    const decorSpanLeft = gapLeft;
    const decorSpanRight = gapRight;
    const tableY3 = LAYOUT.decorRow3Y - ASSET_RECTS.libTable.h / 2;
    const chairY3 = LAYOUT.decorRow3Y + ASSET_RECTS.libTable.h / 2 - 6;
    this.add.image(decorSpanLeft + 80, tableY3, libTableKey).setOrigin(0, 0).setDepth(1);
    this.add.image(decorSpanLeft + 90, chairY3, libChairKey).setOrigin(0, 0).setDepth(2);
    this.add.image(decorSpanRight - 80 - ASSET_RECTS.libTable.w, tableY3, libTableKey).setOrigin(0, 0).setDepth(1);
    this.add.image(decorSpanRight - 90 - ASSET_RECTS.libChair.w, chairY3, libChairKey).setOrigin(0, 0).setDepth(2);

    // Globe, centered on the corridor per the requested layout — non-
    // solid like every other decor piece, so centering it doesn't block
    // auto-walk (no collider is ever added for it).
    const globeX = WORLD_W / 2 - ASSET_RECTS.globe.w / 2;
    const globeY = LAYOUT.carpetGlobeY - ASSET_RECTS.globe.h / 2;
    this.furnitureSprites.globe = this.add.image(globeX, globeY, globeKey).setOrigin(0, 0).setDepth(1);

    // Two carpet accents — moved out from flanking the globe to sitting
    // below each shelf column instead (x centered on that column's own
    // footprint), per explicit feedback that they read as too close to
    // center for the aisle. Same woven-rug treatment as the corridor
    // (drawWovenRug), drawn once each at their own fixed size (no tiling
    // needed for a small accent rug), rather than the old flat 3-shade
    // rectangles.
    const carpetW = 90;
    const carpetH = 50;
    const leftShelfColCenterX = (LAYOUT.leftColX[0] + LAYOUT.leftColX[1] + LAYOUT.shelfW) / 2;
    const rightShelfColCenterX = (LAYOUT.rightColX[0] + LAYOUT.rightColX[1] + LAYOUT.shelfW) / 2;
    drawWovenRug(this, 'globeRugLeftTex', carpetW, carpetH);
    drawWovenRug(this, 'globeRugRightTex', carpetW, carpetH);
    this.add.image(leftShelfColCenterX, LAYOUT.carpetGlobeY, 'globeRugLeftTex').setDepth(0);
    this.add.image(rightShelfColCenterX, LAYOUT.carpetGlobeY, 'globeRugRightTex').setDepth(0);

    // 4 sofas, 2 per side, stacked vertically directly in front of (below)
    // each accent rug — was hugging the outer wall further down near
    // reception, with 4 distinct variants (2-seat couch, 3-seat, 2
    // armchairs). Per explicit feedback, both slots on each side are now
    // the same "upward facing" 2-seat couch (sofaCouch2Tex), centered on
    // the same x as that side's rug, moved up so the sofas sit just below
    // the rug instead of far down the aisle — and placed side by side
    // (was stacked vertically) since there's enough width in the shelf
    // column's own footprint for 2 sofas at this scale.
    const sofaRect = ASSET_RECTS.sofaCouch2;
    const sofaDisplayW = sofaRect.w;
    const sofaDisplayH = sofaRect.h;
    const sofaGap = 14;
    const rugBottomY = LAYOUT.carpetGlobeY + carpetH / 2;
    const sofaTopY = rugBottomY + 20;
    const sofaPairWidth = sofaDisplayW * 2 + sofaGap;
    [leftShelfColCenterX, rightShelfColCenterX].forEach((cx, side) => {
      [0, 1].forEach((col) => {
        const slot = side * 2 + col;
        const x = cx - sofaPairWidth / 2 + col * (sofaDisplayW + sofaGap);
        this.furnitureSprites[`sofa${slot + 1}`] = this.add
          .image(x, sofaTopY, sofaKeys[0]).setOrigin(0, 0).setDepth(1)
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
    // Was a flat 14px color rectangle — now the full 2-part wall swatch
    // from TopDownHouse_FloorsAndWalls.png (flat orange plank on top of
    // the grooved reddish-brown panel), tiled across each column's width
    // and scaled down slightly so it reads as a real wall segment sitting
    // above the shelf, per explicit request. Bottom edge stays anchored
    // at topY-4 regardless of headerH (the center-Y formula below cancels
    // headerH out of the bottom-edge position), so growing the header
    // taller only extends it upward — no other positioning needs to change.
    const headerH = 48;
    const headerRect = { x: 81, y: 17, w: 63, h: 62 };
    const headerKey = cropToTexture(this, 'floorsWallsTopDown', headerRect, 'wallHeaderTex');
    const headerScale = headerH / headerRect.h;
    const buildWallHeader = (x, topY) => {
      this.add.tileSprite(x + colWidth / 2, topY - headerH / 2 - 4, colWidth, headerH, headerKey)
        .setTileScale(headerScale, headerScale)
        .setDepth(0);
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
    // Registers the trinket's frame textures + looping animation once,
    // before any shelf sprite tries to use them (must exist first).
    const trinketAnimKey = buildShelfTrinketAnim(this);

    // Shelf sprite is displayed at LAYOUT.shelfW/shelfH directly — those
    // are already SHELF_SCALE-enlarged (see the LAYOUT block), so no
    // extra multiplier is needed here (a separate ~1.12 visual-only bump
    // from an earlier, smaller pass has been folded into SHELF_SCALE).
    // Centered anchor keeps the sprite symmetric around the same point
    // the row/column math is built from.
    LESSON_DATA.forEach((lesson, i) => {
      const [x, y] = positions[i];
      const sprite = this.add.image(x + shelfW / 2, y + shelfH / 2, lockedKey)
        .setOrigin(0.5, 0.5).setDepth(1)
        .setDisplaySize(shelfW, shelfH);
      // "Available" indicator — was a "⭐" emoji, now a bigger, actually-
      // animated retro-tech trinket (mini loading-panel prop, its
      // progress bar genuinely cycling through fill states) centered on
      // the shelf instead of tucked in the top-right corner, per explicit
      // request to make it more visible. Replaces the old static-image +
      // alpha-pulse-tween combo entirely — the fill animation is the
      // effect now, so no extra pulse layered on top.
      const glow = this.add.sprite(x + shelfW / 2, y + shelfH / 2, 'shelfTrinketFrame0')
        .setOrigin(0.5).setDepth(4).setVisible(false)
        .play(trinketAnimKey);
      // "Completed" indicator — same center spot the trinket occupies
      // during 'available', shown once the shelf resolves to
      // 'completed' (the trinket itself is hidden by then). Same panel
      // chrome as the trinket, checkmark instead of a progress bar, per
      // explicit request.
      const completeBadge = this.add.image(x + shelfW / 2, y + shelfH / 2, drawShelfCompleteTexture(this))
        .setOrigin(0.5).setDepth(4).setVisible(false);

      // Wooden plaque label, same bottom-of-shelf spot the old
      // parchment-tag/checkmark placeholders occupied. Back to the
      // default (readable) font size now that SHELF_SCALE gives it real
      // room, instead of the size-5 squeeze from when the shelf itself
      // was only ~12% bigger. maxWidth allows a modest overhang past the
      // shelf's own edges — the (now scaled-up) gap between shelves in
      // the same column pair has room for this without the plaque
      // colliding with its neighbor.
      const label = createBookshelfLabel(this, x + shelfW / 2, y + shelfH - 20, lesson.title, {
        maxWidth: shelfW + 20,
      });
      label.bg.setDepth(2);
      label.label.setDepth(3);
      // Completion checkmark now sits at the tag's top-right corner
      // (small badge) instead of beside plain text — uses the real
      // checkmark asset instead of the "✅" emoji used elsewhere here.
      const stamp = this.add.image(label.bg.x + label.width / 2 - 6, label.bg.y + 6, 'checkmarkIcon')
        .setOrigin(0.5).setDepth(4).setDisplaySize(12, 12).setVisible(false);
      // Favorite marker (retro menu's "Make Favorite?" option) — a small
      // heart icon over the shelf's top-left corner, independent of
      // lock/complete state (a locked shelf can't be favorited since the
      // retro menu only opens once available, but a favorited shelf
      // keeps showing the heart regardless of its progress state).
      const favIcon = this.add.image(x + 14, y - 6, 'favoriteIcon')
        .setOrigin(0.5).setDepth(4).setDisplaySize(14, 14).setVisible(false);

      // Deliberately non-solid: 2 shelves share each row with only a
      // 14px gap, and auto-walk routing to the far column would have to
      // cross the near column's collision box. Interaction still works
      // via distance checks (TRIGGER_RANGE), not physical contact.
      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => this.handleInteractiveClick(entry));

      const entry = {
        id: lesson.id, kind: 'shelf', title: lesson.title,
        sprite, glow, completeBadge, stamp, favIcon, lockedKey, filledKey: filledKeys[i % filledKeys.length],
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
    // LAYOUT's comment for which row hosts which). Scale dropped from
    // 1.6 (52x83 displayed — towered over the neighboring plants/tables)
    // to 0.7, small enough to read as sitting "in" the shelf-row scale
    // instead of dominating it.
    const positions = {
      'review-1': { ...this.reviewPilePositions['review-1'], scale: 0.7 },
      'review-2': { ...this.reviewPilePositions['review-2'], scale: 0.7 },
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
    this.retroMenu = null;
    this.retroUpKeyWasDown = false;
    this.retroDownKeyWasDown = false;
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
      // If the retro menu is already open, E/Enter/Space confirms the
      // highlighted option instead of trying to open a new interaction.
      if (this.retroMenu) {
        this.selectRetroMenuOption();
        return;
      }
      const near = this.nearestInRange();
      if (near) this.openInteraction(near);
    };
    this.interactKey.on('down', tryInteract);
    this.enterKey.on('down', tryInteract);
    this.spaceKey.on('down', tryInteract);
  }

  handleInteractiveClick(entry) {
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.x, entry.y);
    if (dist <= (entry.triggerRange || TRIGGER_RANGE)) {
      this.openInteraction(entry);
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
      if (dist <= (entry.triggerRange || TRIGGER_RANGE) && dist < closestDist) {
        closest = entry;
        closestDist = dist;
      }
    });
    return closest;
  }

  // -- Lesson/review interaction ---------------------------------------------
  // Shelves, the 2 review piles, and the staircase/quiz gate all share the
  // same retro in-canvas menu engine (below).

  openInteraction(entry) {
    const state = entry.kind === 'shelf'
      ? getState(entry.id, entry.prereq, this.progress)
      : (this.progress[entry.id] ? 'completed'
        : (entry.requires.every((r) => this.progress[r]) ? 'available' : 'locked'));

    if (state === 'locked') {
      showToast('Not yet…');
      return;
    }

    if (entry.id === 'final-quiz') {
      if (state !== 'completed') {
        const gate = getQuizGateStatus();
        if (gate.locked) {
          showToast(gate.lockMessage);
          return;
        }
      }
      this.openQuizGateMenu(entry, state);
      return;
    }
    this.openRetroMenu(entry, state);
  }

  // -- Retro in-canvas selection menu (shelves + review piles) -----------
  // Same interaction pattern as CatSelectScene: a dark panel with a
  // ▶-prefixed, keyboard/click-selectable option list, screen-fixed
  // (scrollFactor 0) so it stays centered regardless of camera position.

  openRetroMenu(entry, state) {
    const options = entry.kind === 'shelf'
      ? [
        { label: 'Start/Continue?', onSelect: () => this.completeInteraction(entry) },
        { label: 'Make Favorite?', onSelect: () => this.toggleFavorite(entry) },
        { label: 'Exit', onSelect: () => this.closeRetroMenu() },
      ]
      : [
        { label: 'Read again', onSelect: () => this.completeInteraction(entry) },
        { label: 'Exit', onSelect: () => this.closeRetroMenu() },
      ];
    void state; // available vs completed doesn't change the option set — both are "revisit" actions
    this.buildRetroMenu(entry.title, options);
  }

  completeInteraction(entry) {
    this.progress[entry.id] = true;
    saveProgress(this.progress);
    this.refreshAllStates();
    this.closeRetroMenu();
  }

  toggleFavorite(entry) {
    this.favorites[entry.id] = !this.favorites[entry.id];
    saveFavorites(this.favorites);
    this.refreshAllStates();
    this.closeRetroMenu();
  }

  // -- Quiz gate (staircase) retro menu -----------------------------------
  // Same buildRetroMenu engine as shelves/review piles, two levels deep:
  // a top-level menu whose options depend on pass state, and — for "Retry
  // exam" — a nested Pass/Fail test menu that exercises the attempts/
  // cooldown mechanic from getQuizGateStatus()/saveQuizGateState().

  openQuizGateMenu(entry, state) {
    const options = state === 'completed'
      ? [
        { label: 'Proceed to N4', onSelect: () => { showToast('N4 is coming soon.'); this.closeRetroMenu(); } },
        { label: 'Exit', onSelect: () => this.closeRetroMenu() },
      ]
      : [
        { label: 'Retry exam', onSelect: () => this.openQuizAttemptMenu(entry) },
        { label: 'Exit', onSelect: () => this.closeRetroMenu() },
      ];
    this.buildRetroMenu(entry.title, options);
  }

  openQuizAttemptMenu(entry) {
    const { attemptsLeft } = getQuizGateStatus();
    const options = [
      { label: 'Pass (test)', onSelect: () => this.resolveQuizAttempt(entry, true) },
      { label: 'Fail (test)', onSelect: () => this.resolveQuizAttempt(entry, false) },
      { label: 'Back', onSelect: () => this.openQuizGateMenu(entry, 'available') },
    ];
    this.buildRetroMenu(`${entry.title} (${attemptsLeft} left)`, options);
  }

  resolveQuizAttempt(entry, passed) {
    if (passed) {
      this.progress[entry.id] = true;
      saveProgress(this.progress);
      this.refreshAllStates();
      this.closeRetroMenu();
      this.spawnPassSparkle(entry.x, entry.y);
      return;
    }
    const gateState = loadQuizGateState();
    gateState.attemptsUsed += 1;
    if (gateState.attemptsUsed >= QUIZ_MAX_ATTEMPTS) {
      gateState.lockedUntil = Date.now() + QUIZ_LOCKOUT_MS;
      saveQuizGateState(gateState);
      this.closeRetroMenu();
      showToast('Locked for 24 hours.');
    } else {
      saveQuizGateState(gateState);
      this.closeRetroMenu();
      showToast(`Try again (${QUIZ_MAX_ATTEMPTS - gateState.attemptsUsed} left)`);
    }
  }

  buildRetroMenu(title, options) {
    this.closeRetroMenu();
    const cam = this.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;
    const boxHeight = 76 + options.length * 32;
    const boxTop = cy - boxHeight / 2;

    const bg = this.add.rectangle(cx, cy, 300, boxHeight, 0x1a1410)
      .setStrokeStyle(3, 0x8a6a3a).setScrollFactor(0).setDepth(2000);
    const titleText = this.add.text(cx, boxTop + 26, title, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#F0C674',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
    const optionTexts = options.map((opt, i) => this.add.text(cx - 118, boxTop + 58 + i * 32, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#B08D57',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(2001)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.highlightRetroMenu(i))
      .on('pointerup', () => { if (this.retroMenu && this.retroMenu.selectedIndex === i) this.selectRetroMenuOption(); }));

    this.retroMenu = { bg, titleText, optionTexts, options, selectedIndex: 0 };
    this.panelOpen = true;
    this.highlightRetroMenu(0);
  }

  highlightRetroMenu(index) {
    if (!this.retroMenu) return;
    this.retroMenu.selectedIndex = index;
    this.retroMenu.optionTexts.forEach((t, i) => {
      t.setColor(i === index ? '#FFDD88' : '#B08D57');
      t.setText((i === index ? '▶ ' : '  ') + this.retroMenu.options[i].label);
    });
  }

  selectRetroMenuOption() {
    if (!this.retroMenu) return;
    const opt = this.retroMenu.options[this.retroMenu.selectedIndex];
    if (opt) opt.onSelect();
  }

  // Up/down cycles the highlighted option, Enter/E/Space confirms it (the
  // confirm side lives in wireInput's tryInteract) — same debounced
  // isDown-edge pattern as CatSelectScene's keyboard nav.
  updateRetroMenuInput() {
    const upDown = this.cursors.up.isDown;
    const downDown = this.cursors.down.isDown;
    if (upDown && !this.retroUpKeyWasDown) {
      this.highlightRetroMenu(Math.max(0, this.retroMenu.selectedIndex - 1));
    }
    if (downDown && !this.retroDownKeyWasDown) {
      this.highlightRetroMenu(Math.min(this.retroMenu.options.length - 1, this.retroMenu.selectedIndex + 1));
    }
    this.retroUpKeyWasDown = upDown;
    this.retroDownKeyWasDown = downDown;
  }

  closeRetroMenu() {
    if (this.retroMenu) {
      this.retroMenu.bg.destroy();
      this.retroMenu.titleText.destroy();
      this.retroMenu.optionTexts.forEach((t) => t.destroy());
      this.retroMenu = null;
    }
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
        entry.favIcon.setVisible(!!this.favorites[entry.id]);
        entry.completeBadge.setVisible(state === 'completed');
      }
      // The staircase is exempt from the locked-state dim — see
      // buildTopBand's comment: fading a large architectural piece to
      // 55% opacity reads as broken, not "locked". It still gates
      // correctly (openInteraction's "Not yet…" toast is unaffected), it just
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
      if (this.retroMenu) this.updateRetroMenuInput();
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
