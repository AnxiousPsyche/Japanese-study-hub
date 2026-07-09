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
  // TopDownHouse_DoorsAndWindows.png
  entranceDoor: { x: 130, y: 0, w: 25, h: 45 },
  // Round 2 feedback item 3: previous h:55 crop bled into the door tiles
  // immediately above (y:40-47) and below (y:82+) this window in the
  // sheet. Alpha-scan found the clean window (frame+2 panes+sill, no
  // neighbors) is only y:49-80.
  wallWindow: { x: 130, y: 49, w: 26, h: 31 },
  // furniture03.png (256x256px)
  rug: { x: 49, y: 146, w: 46, h: 28 },
  table: { x: 64, y: 32, w: 64, h: 32 },
  floorBench: { x: 160, y: 0, w: 48, h: 18 },
  lamp: { x: 212, y: 122, w: 34, h: 48 },
  plant: { x: 190, y: 108, w: 35, h: 62 },
};

// Round 2 feedback item 1 (Option A — extend the map). World is much
// bigger than the 768x480 viewport now; the camera follows the player
// and is clamped to these bounds. Viewport itself (Phaser.Game
// width/height below) is unchanged — still matches #mapFrame's
// aspect-ratio:16/10 in n5-dashboard.css, per that file's explicit
// "no CSS changes" constraint from the real-layout spec.
const GRID_COLS = 56;
const GRID_ROWS = 75;
const TILE_SIZE = 16;
const WORLD_W = GRID_COLS * TILE_SIZE;
const WORLD_H = GRID_ROWS * TILE_SIZE;
const GATE_COLS = [25, 26, 27, 28, 29, 30];

// Round 2 feedback item 4: exactly 15 lesson shelves, stable ids,
// walk-order layout (4 upper-left / 4 upper-right / 4 lower-left /
// 3 lower-right, matching the feedback's suggested layout exactly).
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
  { id: 'shelf-12', title: 'Conjugations' },
  { id: 'shelf-13', title: 'Sentence Construction' },
  { id: 'shelf-14', title: 'Particle Mastery' },
  { id: 'shelf-15', title: 'Existence (あります・います)' },
];

// Prerequisite for each shelf to become "available": null = always
// available (first lesson); otherwise the id of the shelf/pile that
// must be completed first. Matches Neko-Bunko-Cat-Library-Spec.md's
// progression rules: lessons unlock strictly in order, and passing a
// review nook unlocks the next section (shelf-09 gates on review-1,
// shelf-13 gates on review-2), not just the previous shelf.
const SHELF_PREREQ = {
  'shelf-01': null,
  'shelf-02': 'shelf-01', 'shelf-03': 'shelf-02', 'shelf-04': 'shelf-03',
  'shelf-05': 'shelf-04', 'shelf-06': 'shelf-05', 'shelf-07': 'shelf-06',
  'shelf-08': 'shelf-07',
  'shelf-09': 'review-1',
  'shelf-10': 'shelf-09', 'shelf-11': 'shelf-10', 'shelf-12': 'shelf-11',
  'shelf-13': 'review-2',
  'shelf-14': 'shelf-13', 'shelf-15': 'shelf-14',
};

// Round 2 feedback item 5: exactly 3 book piles (2 reviews + final quiz).
const BOOK_PILE_DATA = [
  { id: 'review-1', title: 'Foundations Review', requires: ['shelf-01', 'shelf-02', 'shelf-03', 'shelf-04', 'shelf-05', 'shelf-06', 'shelf-07', 'shelf-08'] },
  { id: 'review-2', title: 'Sentence Builder Review', requires: ['shelf-09', 'shelf-10', 'shelf-11', 'shelf-12'] },
  { id: 'final-quiz', title: 'Final Quiz', requires: ['shelf-13', 'shelf-14', 'shelf-15'] },
];

const SAVE_KEY = 'nekoBunko.n5.progress';
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
  panel.innerHTML = ''
    + '<div style="background:#FFFDF6;border:4px solid #C9BFA5;border-radius:16px;'
    + 'padding:30px;max-width:420px;text-align:center;">'
    + '<h2 id="nekoPanelTitle" style="font-family:\'Press Start 2P\',cursive;'
    + 'font-size:.85rem;margin-bottom:16px;color:#5A4A3A;line-height:1.6;"></h2>'
    + '<p id="nekoPanelBody" style="margin-bottom:22px;color:#5A4A3A;'
    + 'font-family:Nunito,sans-serif;"></p>'
    + '<button id="nekoPanelComplete" style="padding:10px 20px;border:none;'
    + 'border-radius:10px;background:#87A8D8;color:white;'
    + 'font-family:\'Press Start 2P\',cursive;font-size:.55rem;cursor:pointer;'
    + 'margin-right:10px;">Complete</button>'
    + '<button id="nekoPanelClose" style="padding:10px 20px;border:none;'
    + 'border-radius:10px;background:#C9BFA5;color:#5A4A3A;'
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
    + 'background:#5A4A3A;color:#FFFDF6;padding:10px 18px;border-radius:10px;'
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
    this.load.image('catPlayer', '../../assets/images/icons/pixels/fortunecat-Original.png');
  }

  create() {
    this.interactives = []; // { id, kind, sprite, glow, stamp, x, y, prereq/requires }
    this.progress = loadProgress();
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
    this.furnitureSprites.staircase = this.add
      .image(bandX, 0, staircaseKey)
      .setOrigin(0, 0)
      .setDisplaySize(staircaseDisplayWidth, staircaseRect.h * topBandScale)
      .setDepth(2);

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

    const gapCenterX = bandX + staircaseDisplayWidth + ((110 + 260) / 2) * topBandScale;
    const gapFloorY = 130 * topBandScale;

    const doorRect = ASSET_RECTS.entranceDoor;
    const doorKey = cropToTexture(this, 'doorsWindows', doorRect, 'entranceDoorTex');
    const doorScale = 1.8;
    const doorDisplayWidth = doorRect.w * doorScale;
    const doorDisplayHeight = doorRect.h * doorScale;
    this.furnitureSprites.entranceDoor = this.add
      .image(gapCenterX - doorDisplayWidth / 2, gapFloorY - doorDisplayHeight, doorKey)
      .setOrigin(0, 0)
      .setDisplaySize(doorDisplayWidth, doorDisplayHeight)
      .setDepth(3);

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

    this.entranceX = gapCenterX;
    this.entranceY = gapFloorY + 30;
  }

  // -- Central decor: globe, reading tables, review-nook seating ---------

  buildFurniture() {
    const globeKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.globe, 'globeTex');
    this.furnitureSprites.globe = this.add
      .image(WORLD_W / 2 - ASSET_RECTS.globe.w / 2, 470, globeKey)
      .setOrigin(0, 0)
      .setDepth(1);
    this.addSolid(WORLD_W / 2 - ASSET_RECTS.globe.w / 2, 470, ASSET_RECTS.globe.w, ASSET_RECTS.globe.h);

    const rugKey = cropToTexture(this, 'furniture03', ASSET_RECTS.rug, 'rugTex');
    const tableKey = cropToTexture(this, 'furniture03', ASSET_RECTS.table, 'tableTex');
    const lampKey = cropToTexture(this, 'furniture03', ASSET_RECTS.lamp, 'lampTex');
    const plantKey = cropToTexture(this, 'furniture03', ASSET_RECTS.plant, 'plantTex');
    const armchairKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.armchair, 'armchairTex');
    this.rugKey = rugKey;

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
      this.furnitureSprites[`${name}Table`] = this.add.image(x, y, tableKey).setOrigin(0, 0);
      this.addSolid(x, y, ASSET_RECTS.table.w, ASSET_RECTS.table.h);
      this.furnitureSprites[`${name}Lamp`] = this.add.image(x + 70, y - 8, lampKey).setOrigin(0, 0);
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
      this.addSolid(x, y, ASSET_RECTS.armchair.w, ASSET_RECTS.armchair.h);
    };
    placeNook('nookLeft', this.pathLeft - 100, 440, false);
    placeNook('nookRight', this.pathRight + 55, 440, true);
  }

  // -- 15 lesson shelves (Round 2 feedback item 4) ------------------------

  buildShelves() {
    const shelfW = ASSET_RECTS.shelfLocked.w;
    const shelfH = ASSET_RECTS.shelfLocked.h;
    const colGap = 20;
    const rowGap = 14;

    const leftColX = [40, 40 + shelfW + colGap];
    const rightColX = [WORLD_W - 40 - shelfW - shelfW - colGap, WORLD_W - 40 - shelfW];
    const upperRowY = [460, 460 + shelfH + rowGap];
    const lowerRowY = [780, 780 + shelfH + rowGap];

    // 4 upper-left (L1-4), 4 upper-right (L5-8), 4 lower-left (L9-12),
    // 3 lower-right (L13-15) — matches the feedback's suggested layout
    // and walk order exactly.
    const positions = [
      [leftColX[0], upperRowY[0]], [leftColX[1], upperRowY[0]],
      [leftColX[0], upperRowY[1]], [leftColX[1], upperRowY[1]],
      [rightColX[0], upperRowY[0]], [rightColX[1], upperRowY[0]],
      [rightColX[0], upperRowY[1]], [rightColX[1], upperRowY[1]],
      [leftColX[0], lowerRowY[0]], [leftColX[1], lowerRowY[0]],
      [leftColX[0], lowerRowY[1]], [leftColX[1], lowerRowY[1]],
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

      this.addSolid(x, y, shelfW, shelfH);
      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => this.handleInteractiveClick(entry));

      const entry = {
        id: lesson.id, kind: 'shelf', title: lesson.title,
        sprite, glow, stamp, lockedKey, filledKey: filledKeys[i % filledKeys.length],
        x: x + shelfW / 2, y: y + shelfH / 2, prereq: SHELF_PREREQ[lesson.id],
      };
      this.interactives.push(entry);
    });
  }

  // -- 3 book piles: 2 reviews + final quiz (Round 2 feedback item 5) ----

  buildBookPiles() {
    const bookKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.bookStack, 'bookPileTex');
    const y1 = 730; // between upper cluster (ends ~592) and lower cluster (starts 780)
    const y2 = WORLD_H - 130; // between lower cluster and the south end
    const positions = {
      'review-1': { x: this.pathLeft - 60, y: y1, scale: 1.6 },
      'review-2': { x: this.pathRight + 20, y: y2, scale: 1.6 },
      // Final quiz reads as bigger/grander, centered on the path near
      // the south gate, per "so it reads as the finale."
      'final-quiz': { x: WORLD_W / 2 - 20, y: WORLD_H - 90, scale: 2.4 },
    };

    BOOK_PILE_DATA.forEach((pile) => {
      const pos = positions[pile.id];
      const w = ASSET_RECTS.bookStack.w * pos.scale;
      const h = ASSET_RECTS.bookStack.h * pos.scale;
      const sprite = this.add.image(pos.x, pos.y, bookKey).setOrigin(0, 0)
        .setDisplaySize(w, h).setDepth(1);
      const glow = this.add.text(pos.x + w - 8, pos.y - 6, '⭐', { fontSize: '18px' })
        .setOrigin(0.5).setDepth(4).setVisible(false);
      const stamp = this.add.text(pos.x + w - 8, pos.y - 6, '✅', { fontSize: '18px' })
        .setOrigin(0.5).setDepth(4).setVisible(false);
      this.tweens.add({ targets: glow, alpha: { from: 1, to: 0.35 }, duration: 650, yoyo: true, repeat: -1 });

      this.addSolid(pos.x, pos.y, w, h);
      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => this.handleInteractiveClick(entry));

      const entry = {
        id: pile.id, kind: 'pile', title: pile.title,
        sprite, glow, stamp, requires: pile.requires,
        x: pos.x + w / 2, y: pos.y + h / 2,
      };
      this.interactives.push(entry);
    });
  }

  // -- Player + camera -----------------------------------------------------

  buildPlayer() {
    this.player = this.physics.add.sprite(this.entranceX, this.entranceY, 'catPlayer');
    this.player.setDisplaySize(30, 30);
    this.player.body.setSize(this.player.width * 0.5, this.player.height * 0.5);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(5);

    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.physics.add.collider(this.player, this.solidGroup || (this.solidGroup = this.physics.add.staticGroup()));
    this.physics.add.collider(this.player, this.wallGroup);

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);

    this.moveTarget = null;
    this.pendingInteract = null;
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
    } else {
      this.moveTarget = { x: entry.x, y: entry.y };
      this.pendingInteract = entry;
    }
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
    if (this.panelOpen) {
      this.player.setVelocity(0, 0);
      return;
    }

    const SPEED = 140;
    let vx = 0;
    let vy = 0;

    if (this.moveTarget) {
      const dx = this.moveTarget.x - this.player.x;
      const dy = this.moveTarget.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= ARRIVE_THRESHOLD) {
        this.player.setVelocity(0, 0);
        this.moveTarget = null;
        if (this.pendingInteract) {
          const toOpen = this.pendingInteract;
          this.pendingInteract = null;
          this.openPanel(toOpen);
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
      entry.sprite.setScale(entry === near ? 1.08 : 1);
    });
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
  scene: LibraryScene,
});

window.__n5Game = n5PhaserGame;
