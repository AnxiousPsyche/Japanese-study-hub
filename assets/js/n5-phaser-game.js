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

    this.furnitureSprites = {};

    const wallRect = ASSET_RECTS.wallBalcony;
    const wallKey = cropToTexture(this, 'libAssetPack', wallRect, 'wallBalconyTex');
    const wallScale = 768 / wallRect.w;
    this.furnitureSprites.wallBalcony = this.add
      .image(0, 0, wallKey)
      .setOrigin(0, 0)
      .setDisplaySize(768, wallRect.h * wallScale);

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
