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

  // -- Stubs: world geometry, shelves, exam gate, player ------------------
  // No-op placeholders so buildScene() runs cleanly at this scaffolding
  // stage (a near-empty world is expected — see Task 2's verify step).
  // Each of these gets its real implementation in a later task:
  //   buildFloor/buildWalls/buildTopBand/buildFurniture — Task 3
  //   buildShelves/buildBookPiles — Task 4/5
  //   buildExamGate — Task 6
  //   buildPlayer — Task 3 (also wires camera-follow + world bounds)

  buildFloor() {}
  buildWalls() {}
  buildTopBand() {}
  buildFurniture() {}
  buildShelves() {}
  buildBookPiles() {}
  buildExamGate() {}
  buildPlayer() {
    // Until Task 3 builds a real player sprite, this.player stays
    // undefined — update() below guards on that, same pattern as
    // LibraryScene.update() in n5-phaser-game.js.
  }

  update() {
    if (!this.player) return;
    // Full movement/auto-walk update loop arrives in Task 3, Step 3 —
    // same logic as LibraryScene.update() in n5-phaser-game.js.
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
