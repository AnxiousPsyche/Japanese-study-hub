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
  balconyBench: { x: 360, y: 215, w: 160, h: 118 },
  bookStack: { x: 358, y: 25, w: 26, h: 50 },
  armchair: { x: 673, y: 43, w: 45, h: 52 },
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
  rug: { x: 49, y: 146, w: 46, h: 28 },
  table: { x: 64, y: 32, w: 64, h: 32 },
  floorBench: { x: 160, y: 0, w: 48, h: 18 },
  plant: { x: 190, y: 108, w: 35, h: 62 },
  // pixellab-2d-pixel-library-assets...png — a proper 3-book pile
  // (green/red/blue), used for review checkpoints instead of the old
  // 2-book bookStack crop above. Different source sheet than the rest
  // of this list; kept in its own ASSET_RECTS entry since it loads
  // under a separate texture key (see preload()).
  bookPileTall: { x: 21, y: 190, w: 33, h: 37 },
};

// Round 2 feedback item 1 (Option A — extend the map). World is much
// bigger than the 768x480 viewport now; the camera follows the player
// and is clamped to these bounds. Viewport itself (Phaser.Game
// width/height below) is unchanged — still matches #mapFrame's
// aspect-ratio:16/10 in n5-dashboard.css, per that file's explicit
// "no CSS changes" constraint from the real-layout spec.
const GRID_COLS = 56;
// +9 rows (144px, one shelf-row-unit: shelfH 118 + rowGap 14, rounded up
// to whole tiles) vs. the Round 2 baseline of 75 — makes room for the
// lower-left cluster's 3rd shelf row (17-lesson roster expansion, see
// LESSON_DATA). review-2/final-quiz/the south gate are all positioned
// relative to WORLD_H already, so they shift down automatically.
const GRID_ROWS = 84;
const TILE_SIZE = 16;
const WORLD_W = GRID_COLS * TILE_SIZE;
const WORLD_H = GRID_ROWS * TILE_SIZE;
const GATE_COLS = [25, 26, 27, 28, 29, 30];

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
    this.load.image('pixellabLibrary', '../../assets/images/ui/pixellab-2d-pixel-library-assets-1783435154845.png');
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
    for (let y = 0; y < GRID_ROWS; y++) {
      this.add.image(TILE_SIZE, y * TILE_SIZE, brickKey).setOrigin(0, 0).setDepth(0);
      this.add.image((GRID_COLS - 2) * TILE_SIZE, y * TILE_SIZE, brickKey).setOrigin(0, 0).setDepth(0);
    }
    void floorSrc;
    this.wallGroup = wallGroup;
  }

  // -- Top wall/balcony/staircase band ------------------------------------

  buildTopBand() {
    // Round 2 feedback item 1: kept at a fixed, proportionate scale
    // (not stretched to the new, much wider world) and centered — the
    // rest of the top wall is covered by the brick perimeter from
    // buildWalls(). Round 1's approach of stretching this art to fill
    // the whole canvas width doesn't hold once the world is wider than
    // the art's native aspect ratio without looking distorted.
    const topBandScale = 1.4;
    const wallRect = ASSET_RECTS.wallBalcony;
    const staircaseRect = ASSET_RECTS.staircase;
    const staircaseDisplayWidth = staircaseRect.w * topBandScale;
    const wallDisplayWidth = wallRect.w * topBandScale;
    const bandTotalWidth = staircaseDisplayWidth + wallDisplayWidth;
    const bandX = (WORLD_W - bandTotalWidth) / 2;

    const staircaseKey = cropToTexture(this, 'libAssetPack', staircaseRect, 'staircaseTex');
    const staircaseSprite = this.add
      .image(bandX, 0, staircaseKey)
      .setOrigin(0, 0)
      .setDisplaySize(staircaseDisplayWidth, staircaseRect.h * topBandScale)
      .setDepth(2);
    this.furnitureSprites.staircase = staircaseSprite;

    // The staircase IS the final-quiz/N4 gate (per "remove the door,
    // just make the stairs the final exam/quiz and gate-lock to N4,
    // which will be second floor") — no separate book pile or door
    // sprite. Same interaction pattern as every other interactive:
    // click-in-range/E-to-interact/auto-walk, locked until L15-17 are
    // done, dim+padlock-style alpha while locked (no separate
    // locked/unlocked art for the staircase itself).
    const stairGlow = this.add
      .text(bandX + staircaseDisplayWidth - 14, staircaseRect.h * topBandScale - 10, '⭐', { fontSize: '16px' })
      .setOrigin(0.5).setDepth(4).setVisible(false);
    const stairStamp = this.add
      .text(bandX + staircaseDisplayWidth - 14, staircaseRect.h * topBandScale - 10, '✅', { fontSize: '16px' })
      .setOrigin(0.5).setDepth(4).setVisible(false);
    this.tweens.add({ targets: stairGlow, alpha: { from: 1, to: 0.35 }, duration: 650, yoyo: true, repeat: -1 });

    // Trigger point deliberately sits near the BASE of the staircase
    // (not its vertical center) — the wallBlock rectangle below covers
    // y:0-252 to keep players out of the painted wall art, and the
    // staircase's own center (y~210) falls inside that solid zone,
    // making it unreachable via corridor auto-walk. y:390 is below the
    // block, at the foot of the stairs, so the routed approach clears it.
    const stairEntry = {
      id: 'final-quiz', kind: 'pile', title: 'Final Quiz',
      sprite: staircaseSprite, glow: stairGlow, stamp: stairStamp,
      requires: ['shelf-15', 'shelf-16', 'shelf-17'],
      x: bandX + staircaseDisplayWidth / 2, y: 390,
      baseScale: topBandScale,
    };
    staircaseSprite.setInteractive({ useHandCursor: true });
    staircaseSprite.on('pointerdown', () => this.handleInteractiveClick(stairEntry));
    this.interactives.push(stairEntry);

    const wallKey = cropToTexture(this, 'libAssetPack', wallRect, 'wallBalconyTex');
    this.furnitureSprites.wallBalcony = this.add
      .image(bandX + staircaseDisplayWidth, 0, wallKey)
      .setOrigin(0, 0)
      .setDisplaySize(wallDisplayWidth, wallRect.h * topBandScale);

    // Block the player from walking into the painted wall art.
    const wallBlock = this.add.rectangle(bandX, 0, bandTotalWidth, wallRect.h * topBandScale * 0.6, 0x000000, 0)
      .setOrigin(0, 0);
    this.physics.add.existing(wallBlock, true);
    this.wallGroup.add(wallBlock);

    // No door (removed per "remove the door" — the staircase above is
    // now the sole gate to N4). doorDisplayWidth is kept as a pure
    // layout constant (the old door crop's width) purely so the window
    // spacing below doesn't need re-deriving — no door sprite is drawn.
    const gapCenterX = bandX + staircaseDisplayWidth + ((110 + 260) / 2) * topBandScale;
    const doorDisplayWidth = 25 * 1.8;

    // Round 2 feedback item 3: re-sliced window (frame+glass+sill only,
    // no neighboring door tiles) and positioned higher on the wall band
    // — vertically centered in the band between the wainscot trim
    // (~y:20) and the ceiling curtain top — rather than floor-aligned
    // with the door.
    const windowRect = ASSET_RECTS.wallWindow;
    const windowKey = cropToTexture(this, 'doorsWindows', windowRect, 'wallWindowTex');
    const windowScale = 1.8;
    const windowDisplayWidth = windowRect.w * windowScale;
    const windowDisplayHeight = windowRect.h * windowScale;
    const windowY = 42;
    this.furnitureSprites.wallWindowLeft = this.add
      .image(gapCenterX - doorDisplayWidth / 2 - windowDisplayWidth - 34, windowY, windowKey)
      .setOrigin(0, 0)
      .setDisplaySize(windowDisplayWidth, windowDisplayHeight)
      .setDepth(3);
    this.furnitureSprites.wallWindowRight = this.add
      .image(gapCenterX + doorDisplayWidth / 2 + 34, windowY, windowKey)
      .setOrigin(0, 0)
      .setDisplaySize(windowDisplayWidth, windowDisplayHeight)
      .setDepth(3);
    // Second pair, further out, per "2 per side of the top wall".
    this.furnitureSprites.wallWindowLeft2 = this.add
      .image(bandX + 30, windowY, windowKey)
      .setOrigin(0, 0)
      .setDisplaySize(windowDisplayWidth, windowDisplayHeight)
      .setDepth(3);
    this.furnitureSprites.wallWindowRight2 = this.add
      .image(bandX + bandTotalWidth - 30 - windowDisplayWidth, windowY, windowKey)
      .setOrigin(0, 0)
      .setDisplaySize(windowDisplayWidth, windowDisplayHeight)
      .setDepth(3);
  }

  // -- Central decor: globe, reading tables, review-nook seating ---------

  buildFurniture() {
    // Globe moved off the rug path entirely (was centered on it, which
    // both technically violated "no object may sit on the path" and,
    // worse, its collision body was silently blocking long-distance
    // auto-walk any time a target's straight-line route passed through
    // the map's center column - found by literally testing a full-map
    // auto-walk, not by inspection. Positioned just right of the path
    // instead of on/astride it.
    const globeX = WORLD_W / 2 + ASSET_RECTS.rug.w / 2 + 15;
    const globeKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.globe, 'globeTex');
    this.furnitureSprites.globe = this.add
      .image(globeX, 470, globeKey)
      .setOrigin(0, 0)
      .setDepth(1);
    // Non-solid, same reasoning as the reading tables/armchairs: its
    // y-span (470-588) overlaps the row1 shelf y-band, so a solid globe
    // still blocks corridor-to-right-shelf routing even off the rug.

    const rugKey = cropToTexture(this, 'furniture03', ASSET_RECTS.rug, 'rugTex');
    const tableKey = cropToTexture(this, 'furniture03', ASSET_RECTS.table, 'tableTex');
    const plantKey = cropToTexture(this, 'furniture03', ASSET_RECTS.plant, 'plantTex');
    const armchairKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.armchair, 'armchairTex');
    const deskLampKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.deskLamp, 'deskLampTex');
    const tableBookKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.bookStack, 'tableBookTex');
    this.rugKey = rugKey;
    this.armchairKey = armchairKey; // reused by buildReception's chair

    // Round 2 feedback item 1: the rug path is centered at WORLD_W/2 and
    // is now the one thing NOTHING is placed on top of — every other
    // object below is placed either left of pathLeft or right of
    // pathRight, with >2 tiles of clearance from the path itself.
    const pathCenter = WORLD_W / 2;
    const pathHalfWidth = ASSET_RECTS.rug.w / 2;
    this.pathLeft = pathCenter - pathHalfWidth;
    this.pathRight = pathCenter + pathHalfWidth;

    let rugIndex = 0;
    for (let y = 200; y + ASSET_RECTS.rug.h <= WORLD_H - 60; y += 30) {
      this.add.image(this.pathLeft, y, rugKey).setOrigin(0, 0);
      rugIndex += 1;
    }
    void rugIndex;

    // Two reading tables, clear of the path on both sides.
    const placeTable = (name, x, y) => {
      // Non-solid: these sit at y=520, directly in the routing corridor
      // used to reach the left/right shelf rows (see buildShelves) — a
      // solid table here would block auto-walk to every shelf on that
      // side, same reasoning as the shelves/piles themselves.
      this.furnitureSprites[`${name}Table`] = this.add.image(x, y, tableKey).setOrigin(0, 0);
      // A couple of small items sitting on the table surface itself
      // (lamp + book stack), so it reads as lived-in rather than bare —
      // both depth 2 so they draw in front of the table (depth default).
      this.furnitureSprites[`${name}Lamp`] = this.add
        .image(x + 38, y - 20, deskLampKey).setOrigin(0, 0).setDepth(2);
      this.furnitureSprites[`${name}Book`] = this.add
        .image(x + 10, y - 4, tableBookKey).setOrigin(0, 0).setDepth(2)
        .setDisplaySize(ASSET_RECTS.bookStack.w * 0.7, ASSET_RECTS.bookStack.h * 0.7);
      this.furnitureSprites[`${name}Plant`] = this.add.image(x - 40, y - 20, plantKey).setOrigin(0, 0);
    };
    placeTable('readingLeft', this.pathLeft - 150, 520);
    placeTable('readingRight', this.pathRight + 90, 520);

    // Review-nook seating (armchair + rug swatch) flanking the globe,
    // clear of the path.
    const placeNook = (name, x, y, flip) => {
      this.furnitureSprites[`${name}Rug`] = this.add
        .image(x - 6, y + 30, rugKey).setOrigin(0, 0)
        .setDisplaySize(ASSET_RECTS.rug.w * 1.2, ASSET_RECTS.rug.h * 1.2);
      this.furnitureSprites[`${name}Chair`] = this.add
        .image(x, y, armchairKey).setOrigin(0, 0).setFlipX(!!flip).setDepth(1);
      // Non-solid, same reasoning as the reading tables above.
    };
    placeNook('nookLeft', this.pathLeft - 100, 440, false);
    placeNook('nookRight', this.pathRight + 55, 440, true);
  }

  // -- 17 lesson shelves (17-lesson roster expansion) --------------------

  buildShelves() {
    const shelfW = ASSET_RECTS.shelfLocked.w;
    const shelfH = ASSET_RECTS.shelfLocked.h;
    const colGap = 20;
    const rowGap = 14;

    const leftColX = [40, 40 + shelfW + colGap];
    const rightColX = [WORLD_W - 40 - shelfW - shelfW - colGap, WORLD_W - 40 - shelfW];
    const upperRowY = [460, 460 + shelfH + rowGap];
    const lowerRowY = [780, 780 + shelfH + rowGap, 780 + 2 * (shelfH + rowGap)];

    // 4 upper-left (L1-4), 4 upper-right (L5-8), 6 lower-left (L9-14,
    // Sentence Builder — grown from 4 to 6, adds a 3rd row), 3
    // lower-right (L15-17, Final stretch — unchanged, stays 2 rows with
    // the 2nd row half-empty, left deliberately asymmetric against the
    // now-taller left wall rather than re-spreading 3 shelves into 3
    // rows). Matches LESSON_DATA's order and walk order exactly.
    const positions = [
      [leftColX[0], upperRowY[0]], [leftColX[1], upperRowY[0]],
      [leftColX[0], upperRowY[1]], [leftColX[1], upperRowY[1]],
      [rightColX[0], upperRowY[0]], [rightColX[1], upperRowY[0]],
      [rightColX[0], upperRowY[1]], [rightColX[1], upperRowY[1]],
      [leftColX[0], lowerRowY[0]], [leftColX[1], lowerRowY[0]],
      [leftColX[0], lowerRowY[1]], [leftColX[1], lowerRowY[1]],
      [leftColX[0], lowerRowY[2]], [leftColX[1], lowerRowY[2]],
      [rightColX[0], lowerRowY[0]], [rightColX[1], lowerRowY[0]],
      [rightColX[0], lowerRowY[1]],
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
      const stamp = this.add.text(x + shelfW - 14, y - 6, '✅', { fontSize: '16px' })
        .setOrigin(0.5).setDepth(4).setVisible(false);
      this.tweens.add({ targets: glow, alpha: { from: 1, to: 0.35 }, duration: 650, yoyo: true, repeat: -1 });

      // Label placement (spec section 4): the lesson number engraved on
      // the empty plinth strip at the shelf's base — small, low-contrast
      // (a shade darker than the maroon plinth wood), not a bold badge.
      this.add.text(x + shelfW / 2, y + shelfH - 12, String(i + 1), {
        fontSize: '10px', fontFamily: 'Georgia, serif', color: '#4a1f1f',
      }).setOrigin(0.5).setDepth(2);

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
    const bookKey = cropToTexture(this, 'pixellabLibrary', ASSET_RECTS.bookPileTall, 'bookPileTex');
    const y1 = 730; // between upper cluster (ends ~592) and lower cluster (starts 780)
    const y2 = WORLD_H - 130; // between lower cluster and the south end
    const positions = {
      'review-1': { x: this.pathLeft - 60, y: y1, scale: 1.6 },
      'review-2': { x: this.pathRight + 20, y: y2, scale: 1.6 },
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
  // Spec section 7 puts this "right after spawn." Spawn is now the south
  // gate (see buildPlayer), so the nook sits there instead of near the
  // (removed) north door — offset left of the path, matching every other
  // piece of decor's "never touch the rug" rule from Round 2.

  buildReception() {
    const deskKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.receptionDesk, 'receptionDeskTex');
    const rugKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.receptionRug, 'receptionRugTex');
    // Reuses buildFurniture's armchairTex crop rather than re-cropping
    // the same source rect under the same key (which Phaser rejects).
    const chairKey = this.armchairKey;

    const rugScale = 0.9;
    const deskScale = 0.85;
    const rugW = ASSET_RECTS.receptionRug.w * rugScale;
    const rugH = ASSET_RECTS.receptionRug.h * rugScale;
    const deskW = ASSET_RECTS.receptionDesk.w * deskScale;
    const deskH = ASSET_RECTS.receptionDesk.h * deskScale;

    const originX = this.pathLeft - 210;
    const originY = WORLD_H - 165;

    this.furnitureSprites.receptionRug = this.add
      .image(originX - 10, originY, rugKey).setOrigin(0, 0)
      .setDisplaySize(rugW, rugH).setDepth(0);
    this.furnitureSprites.receptionDesk = this.add
      .image(originX, originY + 18, deskKey).setOrigin(0, 0)
      .setDisplaySize(deskW, deskH).setDepth(1);
    this.furnitureSprites.receptionChair = this.add
      .image(originX + 58, originY - 44, chairKey).setOrigin(0, 0).setDepth(1);
    // Non-solid, same reasoning as every other decor piece this round.
  }

  // -- Player + camera -----------------------------------------------------

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
      entry.sprite.setAlpha(state === 'locked' ? 0.55 : 1);
      entry.glow.setVisible(state === 'available');
      entry.stamp.setVisible(state === 'completed');
    });
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
