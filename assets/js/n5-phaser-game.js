const ASSET_RECTS = {
  // floors-walls02.png (288x160px)
  floorTile: { x: 220, y: 25, w: 16, h: 16 },
  brickTile: { x: 30, y: 90, w: 16, h: 16 },
  // Darker plank variant, same sheet — same relative offset (4,25) within
  // its own grid cell as floorTile has within its cell, one row down.
  // Used under furniture clusters (Round 1 feedback B3) to break up the
  // single uniform floor tile without introducing a clashing pattern.
  floorTileVariant: { x: 220, y: 105, w: 16, h: 16 },
  // libassetpack-tiled.png (1488x528px)
  // wallBalcony/staircase were split from one crop (x:850,w:638) into two:
  // the staircase chunk (measured via grid-overlay harness) sits at
  // x:935-1035, with the curtain/balcony wall picking up cleanly at
  // x:1040. Splitting them lets the staircase be positioned independently
  // against the left wall instead of wherever it happened to fall inside
  // a single wide crop (Round 1 feedback item A).
  wallBalcony: { x: 1040, y: 0, w: 448, h: 300 },
  staircase: { x: 935, y: 0, w: 100, h: 300 },
  bookshelf: { x: 385, y: 345, w: 100, h: 175 },
  // Shelf-state progression (Round 1 feedback B2): the pack already
  // supplies an empty/red shelf plus 3 increasingly-full variants, so we
  // reuse those directly as locked/available/completed states instead of
  // tinting or inventing new art. Measured via the canvas-grid method.
  // Coordinates found via alpha-channel pixel scanning (getImageData row/
  // column scans for opaque-pixel runs), not visual grid reading — two
  // prior visual-reading attempts on this same row were each off by a
  // large, inconsistent margin (likely downscaling when viewing large
  // rendered grid overlays), so this row was re-derived programmatically.
  shelfLocked: { x: 28, y: 385, w: 87, h: 118 },
  shelfFilled1: { x: 148, y: 385, w: 87, h: 118 },
  shelfFilled2: { x: 268, y: 385, w: 87, h: 118 },
  shelfFilled3: { x: 388, y: 385, w: 87, h: 118 },
  globe: { x: 143, y: 217, w: 94, h: 118 },
  balconyBench: { x: 360, y: 215, w: 160, h: 118 },
  // Small book stack for tables (Round 1 feedback B4), found via alpha
  // scan after the clock/chest hunt in this region proved unreliable
  // (kept re-finding the already-used globe instead of new items) —
  // scoped B4 down to items found with real confidence.
  bookStack: { x: 358, y: 25, w: 26, h: 50 },
  // Blue armchair for review-nook seating (Round 1 feedback B5).
  armchair: { x: 673, y: 43, w: 45, h: 52 },
  // TopDownHouse_DoorsAndWindows.png (measured via grid-overlay harness)
  entranceDoor: { x: 130, y: 0, w: 25, h: 45 },
  wallWindow: { x: 130, y: 45, w: 26, h: 55 },
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

// Tile-cell ranges (col-start, col-end, row-start, row-end, inclusive)
// under each furniture cluster's table+bench footprint, converted from
// the clusters' pixel bounds (see placeCluster calls) at TILE_SIZE=16.
// Round 1 feedback B3: "a slightly different tile under furniture
// clusters" — tile index 2 (floorTileVariant) is placed here instead of
// the uniform floor tile (index 0).
const CLUSTER_TILE_RANGES = [
  [5, 13, 13, 17],  // clusterLeft1
  [5, 13, 20, 25],  // clusterLeft2
  [34, 43, 13, 17], // clusterRight1
  [34, 43, 20, 25], // clusterRight2
];

function buildFloorTileData() {
  const data = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    const row = [];
    for (let x = 0; x < GRID_COLS; x++) {
      const isBorder = x === 0 || y === 0 || x === GRID_COLS - 1 || y === GRID_ROWS - 1;
      const isGate = y === GRID_ROWS - 1 && GATE_COLS.includes(x);
      if (isBorder && !isGate) {
        row.push(1);
        continue;
      }
      const underCluster = CLUSTER_TILE_RANGES.some(
        ([cxs, cxe, cys, cye]) => x >= cxs && x <= cxe && y >= cys && y <= cye
      );
      row.push(underCluster ? 2 : 0);
    }
    data.push(row);
  }
  // The improvised floor step-lines this used to draw at columns 10-37
  // were positioned under the OLD single-crop staircase (which sat in the
  // 850-1488 crop's left portion, roughly mid-canvas). Now that the real
  // staircase art is a separate piece anchored to the far-left wall
  // (Round 1 feedback item A), that mid-canvas striping no longer lines
  // up with anything and was removed rather than repositioned — the real
  // staircase art carries the visual on its own.
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
    this.load.image('doorsWindows', '../../assets/images/ui/TopDownHouse_DoorsAndWindows.png');
  }

  create() {
    // Not using cropToTexture here: the floor/brick tileset needs both
    // crops combined side-by-side into one 32x16 two-cell texture (so
    // Phaser's tilemap API can index them as tile 0 / tile 1), which the
    // single-rect cropToTexture helper can't produce. Every other texture
    // in this file is a single independent crop and uses cropToTexture.
    const floorSrc = this.textures.get('floorsWalls').getSourceImage();
    const tileTex = this.textures.createCanvas('libraryTiles', TILE_SIZE * 3, TILE_SIZE);
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
    tileCtx.drawImage(
      floorSrc,
      ASSET_RECTS.floorTileVariant.x, ASSET_RECTS.floorTileVariant.y, TILE_SIZE, TILE_SIZE,
      TILE_SIZE * 2, 0, TILE_SIZE, TILE_SIZE
    );
    tileTex.refresh();

    const data = buildFloorTileData();
    const map = this.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tileset = map.addTilesetImage('libraryTiles', null, TILE_SIZE, TILE_SIZE);
    const layer = map.createLayer(0, tileset, 0, 0);

    this.floorTilemap = map;
    this.floorLayer = layer;

    this.furnitureSprites = {};

    // Staircase + wall/balcony share one scale factor (computed from their
    // combined natural width filling the full 768px canvas width) so their
    // bricks/curtains read at the same zoom level and the seam between them
    // — stairs flush against the left edge, wall picking up immediately to
    // its right — looks like one continuous piece of architecture, not two
    // mismatched crops. Round 1 feedback item A: staircase anchored to the
    // left wall instead of stranded mid-canvas.
    const wallRect = ASSET_RECTS.wallBalcony;
    const staircaseRect = ASSET_RECTS.staircase;
    const topBandScale = 768 / (staircaseRect.w + wallRect.w);

    const staircaseKey = cropToTexture(this, 'libAssetPack', staircaseRect, 'staircaseTex');
    const staircaseDisplayWidth = staircaseRect.w * topBandScale;
    this.furnitureSprites.staircase = this.add
      .image(0, 0, staircaseKey)
      .setOrigin(0, 0)
      .setDisplaySize(staircaseDisplayWidth, staircaseRect.h * topBandScale)
      .setDepth(2);

    const wallKey = cropToTexture(this, 'libAssetPack', wallRect, 'wallBalconyTex');
    this.furnitureSprites.wallBalcony = this.add
      .image(staircaseDisplayWidth, 0, wallKey)
      .setOrigin(0, 0)
      .setDisplaySize(wallRect.w * topBandScale, wallRect.h * topBandScale);

    // Entrance door in the balcony art's recessed center gap (Round 1
    // feedback B1). Gap measured at source x:1150-1300 (within the
    // pre-split 1488-wide sheet) = x:110-260 relative to wallRect's own
    // x:1040 origin, floor (where the recess curtain meets its own trim
    // strip) at source y:130 — all re-verified with a self-contained
    // canvas grid overlay (see commit note: the CSS-<img>-scaling harness
    // used for TopDownHouse_DoorsAndWindows.png gave wrong Y readings for
    // that file; this libassetpack-tiled.png measurement was re-checked
    // against the same canvas method and confirmed accurate).
    const doorRect = ASSET_RECTS.entranceDoor;
    const doorKey = cropToTexture(this, 'doorsWindows', doorRect, 'entranceDoorTex');
    const doorScale = 1.8;
    const doorDisplayWidth = doorRect.w * doorScale;
    const doorDisplayHeight = doorRect.h * doorScale;
    const gapCenterX = staircaseDisplayWidth + ((110 + 260) / 2) * topBandScale;
    const gapFloorY = 130 * topBandScale;
    this.furnitureSprites.entranceDoor = this.add
      .image(gapCenterX - doorDisplayWidth / 2, gapFloorY - doorDisplayHeight, doorKey)
      .setOrigin(0, 0)
      .setDisplaySize(doorDisplayWidth, doorDisplayHeight)
      .setDepth(3);

    // Wall windows flanking the door (Round 1 feedback B3). This scene
    // only has one vertical wall surface (the north/balcony band) — a
    // true top-down room has no side-wall geometry to cut window
    // openings into — so these are placed as accents within that same
    // band rather than on the (nonexistent) left/right walls literally.
    const windowRect = ASSET_RECTS.wallWindow;
    const windowKey = cropToTexture(this, 'doorsWindows', windowRect, 'wallWindowTex');
    const windowScale = 1.8;
    const windowDisplayWidth = windowRect.w * windowScale;
    const windowDisplayHeight = windowRect.h * windowScale;
    const windowY = gapFloorY - windowDisplayHeight;
    this.furnitureSprites.wallWindowLeft = this.add
      .image(gapCenterX - doorDisplayWidth / 2 - windowDisplayWidth - 30, windowY, windowKey)
      .setOrigin(0, 0)
      .setDisplaySize(windowDisplayWidth, windowDisplayHeight)
      .setDepth(3);
    this.furnitureSprites.wallWindowRight = this.add
      .image(gapCenterX + doorDisplayWidth / 2 + 30, windowY, windowKey)
      .setOrigin(0, 0)
      .setDisplaySize(windowDisplayWidth, windowDisplayHeight)
      .setDepth(3);

    const bookshelfKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.bookshelf, 'bookshelfTex');
    const globeKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.globe, 'globeTex');
    const balconyBenchKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.balconyBench, 'balconyBenchTex');

    this.furnitureSprites.bookshelfLeft = this.add.image(50, 260, bookshelfKey).setOrigin(0, 0);
    this.furnitureSprites.bookshelfRight = this.add
      .image(618, 260, bookshelfKey)
      .setOrigin(0, 0)
      .setFlipX(true);
    this.furnitureSprites.globe = this.add.image(334, 280, globeKey).setOrigin(0, 0).setDepth(1);

    // Additional lesson shelves using the pack's locked/filled state art
    // (Round 1 feedback B2 — "the core feature"). This pass adds visible
    // shelf variety across the wings; it does not map individual shelves
    // to specific N5_LESSONS entries yet — per the real-layout spec's own
    // Non-goals, that precise 1:1 binding is later interaction/lesson-data
    // work, not this decorative pass.
    const shelfScale = 1;
    const placeShelf = (name, rectKey, x, y, flip) => {
      const rect = ASSET_RECTS[rectKey];
      const key = cropToTexture(this, 'libAssetPack', rect, rectKey + 'Tex');
      this.furnitureSprites[name] = this.add
        .image(x, y, key)
        .setOrigin(0, 0)
        .setDisplaySize(rect.w * shelfScale, rect.h * shelfScale)
        .setFlipX(!!flip);
    };

    placeShelf('shelfLeftUpperA', 'shelfLocked', 4, 205, false);
    placeShelf('shelfLeftUpperB', 'shelfFilled1', 4, 333, false);
    placeShelf('shelfRightUpperA', 'shelfFilled2', 677, 205, false);
    placeShelf('shelfRightUpperB', 'shelfFilled3', 677, 333, false);
    this.furnitureSprites.balconyBenchLeft = this.add
      .image(170, 310, balconyBenchKey)
      .setOrigin(0, 0)
      .setDisplaySize(112, 83);
    this.furnitureSprites.balconyBenchRight = this.add
      .image(486, 310, balconyBenchKey)
      .setOrigin(0, 0)
      .setFlipX(true)
      .setDisplaySize(112, 83);

    const rugKey = cropToTexture(this, 'furniture03', ASSET_RECTS.rug, 'rugTex');
    const tableKey = cropToTexture(this, 'furniture03', ASSET_RECTS.table, 'tableTex');
    const floorBenchKey = cropToTexture(this, 'furniture03', ASSET_RECTS.floorBench, 'floorBenchTex');
    const lampKey = cropToTexture(this, 'furniture03', ASSET_RECTS.lamp, 'lampTex');
    const plantKey = cropToTexture(this, 'furniture03', ASSET_RECTS.plant, 'plantTex');

    // Extended south to actually reach the gate opening instead of
    // stopping short at the globe (Round 1 feedback B6 — "the path
    // is the player's what's-next guide," so it should visibly connect
    // entrance -> globe -> exit, not trail off mid-room).
    let rugIndex = 0;
    for (let y = 192; y + ASSET_RECTS.rug.h <= 468; y += 30) {
      this.furnitureSprites[`rug${rugIndex}`] = this.add.image(361, y, rugKey).setOrigin(0, 0);
      rugIndex += 1;
    }

    // Short spur toward the left shelf wing (Round 1 feedback B6),
    // branching off the main path at globe height. Kept unrotated
    // (axis-aligned like the main path tiles) rather than rotated 90
    // degrees — rotating a Phaser image with origin (0,0) pivots around
    // that corner instead of its center, which throws off positioning
    // (the same class of bug the bookshelfRight flip hit earlier), so
    // this reads as a row of small connector patches, not a literal
    // perpendicular rug strip.
    this.furnitureSprites.rugSpurLeft0 = this.add
      .image(300, 296, rugKey)
      .setOrigin(0, 0)
      .setDisplaySize(ASSET_RECTS.rug.w * 0.7, ASSET_RECTS.rug.h);
    this.furnitureSprites.rugSpurLeft1 = this.add
      .image(258, 296, rugKey)
      .setOrigin(0, 0)
      .setDisplaySize(ASSET_RECTS.rug.w * 0.7, ASSET_RECTS.rug.h);

    const bookStackKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.bookStack, 'bookStackTex');

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
      // Small book stack on the table itself (Round 1 feedback B4 — "so
      // they read as study tables, not empty slabs"), scaled down to sit
      // naturally on the 64x32 tabletop instead of towering over it.
      this.furnitureSprites[`${name}Books`] = this.add
        .image(cx - 6, cy - 30, bookStackKey)
        .setOrigin(0, 0)
        .setDisplaySize(ASSET_RECTS.bookStack.w * 0.5, ASSET_RECTS.bookStack.h * 0.5)
        .setDepth(1);
    };

    placeCluster('clusterLeft1', 150, 240, 'left');
    placeCluster('clusterLeft2', 150, 360, 'left');
    placeCluster('clusterRight1', 618, 240, 'right');
    placeCluster('clusterRight2', 618, 360, 'right');

    // Extra potted plants beside the new shelf columns (Round 1 feedback
    // B4 — "currently exist but are sparse"), reusing the same plant crop
    // already proven to work elsewhere rather than hunting for new art.
    this.furnitureSprites.shelfLeftPlant = this.add
      .image(168, 380, plantKey)
      .setOrigin(0, 0);
    this.furnitureSprites.shelfRightPlant = this.add
      .image(566, 380, plantKey)
      .setOrigin(0, 0)
      .setFlipX(true);

    this.furnitureSprites.gateBenchLeft = this.add
      .image(216, 393, balconyBenchKey)
      .setOrigin(0, 0)
      .setDisplaySize(112, 83);
    this.furnitureSprites.gateBenchRight = this.add
      .image(440, 393, balconyBenchKey)
      .setOrigin(0, 0)
      .setFlipX(true)
      .setDisplaySize(112, 83);

    // Review nooks (Round 1 feedback B5): armchair + rug swatch marking
    // the two checkpoint spots (Foundations Review after L8, Sentence
    // Builder Review after L12), between the shelf wings and the central
    // path. Not wired to lesson data/progression yet — visual marker only,
    // matching this whole sub-project's decorative-pass scope.
    const armchairKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.armchair, 'armchairTex');
    const placeReviewNook = (name, x, y, flip) => {
      this.furnitureSprites[`${name}Rug`] = this.add
        .image(x - 6, y + 30, rugKey)
        .setOrigin(0, 0)
        .setDisplaySize(ASSET_RECTS.rug.w * 1.3, ASSET_RECTS.rug.h * 1.3);
      this.furnitureSprites[`${name}Chair`] = this.add
        .image(x, y, armchairKey)
        .setOrigin(0, 0)
        .setFlipX(!!flip)
        .setDepth(1);
    };
    placeReviewNook('reviewNookLeft', 262, 280, false);
    placeReviewNook('reviewNookRight', 462, 280, true);

    // Final Quiz altar (Round 1 feedback B5): the most gold/blue-trimmed
    // shelf variant, scaled up and centered above the south gate to read
    // as a distinct, grander focal point vs. the regular lesson shelves.
    const finalQuizScale = 1.3;
    this.furnitureSprites.finalQuizAltar = this.add
      .image(384 - (ASSET_RECTS.shelfFilled3.w * finalQuizScale) / 2, 350, 'shelfFilled3Tex')
      .setOrigin(0, 0)
      .setDisplaySize(ASSET_RECTS.shelfFilled3.w * finalQuizScale, ASSET_RECTS.shelfFilled3.h * finalQuizScale)
      .setDepth(1);
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
