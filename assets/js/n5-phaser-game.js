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
