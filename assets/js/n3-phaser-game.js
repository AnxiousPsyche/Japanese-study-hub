// N3LibraryScene — second explorable floor, reached from N5's staircase.
// Mirrors n5-phaser-game.js's LibraryScene structurally (buildScene()
// calling buildFloor/buildWalls/buildTopBand/buildFurniture/buildShelves/
// buildBookPiles/buildPlayer, preload(), update()) but mixes in the
// reusable engine extracted to library-scene-shared.js (Task 1) instead
// of duplicating that code. This floor will contain BOTH N3 and N3
// content (split left/right column, gated by an exam-gate interactive —
// see docs/superpowers/specs/2026-07-27-n3-second-floor-design.md) — the
// "N3" naming throughout this file is just this floor's identifier, not
// a claim that it's N3-only content.
//
// This file (Task 2) is scaffolding only: world-size constants, this
// floor's own persistence keys, the cat-avatar data copied verbatim from
// N5 (same 3 avatars, no new art), and an N3LibraryScene skeleton whose
// build*() methods are still no-op stubs. World geometry, shelves, the
// exam gate, and the player all arrive in Tasks 3-6.

const TILE_SIZE = 16;
// Shrunk (was 72x130 / 1152x2080) so the walk from the stairs-landing
// spawn point to the nearest shelf is exactly 12 tiles — every other
// gap in LAYOUT (below) shrinks by the same ratio (R ≈ 0.4528, derived
// from the 12-tile constraint itself: old gap was 424px/26.5 tiles, new
// is 192px/12 tiles). Sprite footprints (shelfW/H, pile/gate sizes,
// stair-landing crop) are NOT scaled down — only the empty-floor gaps
// between them shrink, since these are hand-cropped pixel art and
// resizing by a non-clean ratio would blur/distort them at this game's
// pixelArt:true nearest-neighbor rendering. See the design-approval
// message in this session's history for the full gap-by-gap derivation.
// GRID_COLS must stay even — buildWalls()'s top/bottom brick strips loop
// in 32px (2-tile) blocks with no remainder handling (unlike the
// left/right strips, which already clip their last tile); an odd
// GRID_COLS would leave a 1-tile gap in those strips.
const GRID_COLS = 50;
// 86 -> 106: +20 tiles (320px) of extra south-end floor added this pass to
// fit a new 4-shelf Reading wing (wing4, N3/left side only) plus a
// Vocabulary press station (N3/right side, same row) between wing1 and the
// south wall/entry point, without touching any north-anchored geometry
// (top wall, N2/N1 gates, jukebox, N3 threshold wall, atrium all stay
// exactly where they were). buildFloor()/buildWalls() are already fully
// GRID_ROWS/WORLD_H-driven (loops, not hardcoded row counts) and the
// arrival-rug anchor in buildFurniture() derives its Y from GRID_ROWS too,
// so all three auto-extend correctly. The one thing that does NOT
// auto-follow is LAYOUT.entryY (a hand-picked absolute, not GRID_ROWS-
// derived) — shifted by the same +320px below so the spawn point still
// sits flush against the (now further south) south wall/rug.
const GRID_ROWS = 114; // was 106 -- grew by 8 tiles (128px) this pass to give the
// wing1<->wing2 and wing2<->wing3 transitions real breathing room (see
// wing1RowY/wing2RowY/entryY below): the merged 16-shelf redesign packed
// 2 four-shelf groups into each wing-row-band, which left only ~18px
// between one wing's south-row shelf and the next wing's north-row shelf
// -- barely enough for either shelf's own label, let alone a section-sign
// plaque above it (this is what was causing the visible label/plaque
// overlap in-browser). entryY is the one constant that doesn't
// auto-follow GRID_ROWS (see its own comment below) and was shifted to
// match.
const WORLD_W = GRID_COLS * TILE_SIZE; // 800
const WORLD_H = GRID_ROWS * TILE_SIZE; // 1696

// -- Movement/collision constants, copied verbatim from n5-phaser-game.js --
const ARRIVE_THRESHOLD = 74; // px — how close auto-walk needs to get before stopping, n5-phaser-game.js:7242
// Height of the solid north-wall header buildTopBand() draws (Task 3) —
// shared with buildWalls() so the side-wall brick strip starts exactly
// below it instead of visually colliding with it (same reasoning as N5's
// buildWalls()/buildTopBand() split, n5-phaser-game.js:7757).
const TOP_BAND_HEIGHT = 110;

// Local subset of n5-phaser-game.js's ASSET_RECTS (that file isn't loaded
// on this page — see n3-dashboard.html's script list — so its rects
// aren't reachable as bare identifiers here). Same source sheets, same
// crop coordinates verbatim: this floor's floor/wall texture is
// deliberately identical art to N5's (theme comes from N3_PALETTE-driven
// furniture/accent color in later tasks, not a different floor crop —
// see the design spec).
const ASSET_RECTS = {
  brickTile: {
    x: 30,
    y: 90,
    w: 16,
    h: 16
  }, // floors-walls02.png, n5-phaser-game.js:5
  // Archive Vault palette (this floor only) — the sage wood-panel wall +
  // orange-herringbone floor combo, 3rd of 4 wall/floor pairs on
  // floors-walls02.png's own sheet. Isolated via alpha-bbox scanning
  // restricted to just this pair's column (x:144-207) — the naive full
  // "column 2+3 together" bbox merges in column 2's dotted tile pattern,
  // a real mistake made once already while building the approval mockup
  // (see mockups/n3-archive-vault/ — worth checking before touching this
  // rect again). Approved via that mockup before this file existed.
  archiveVaultWall: {
    x: 144,
    y: 16,
    w: 63,
    h: 64
  },
  archiveVaultFloor: {
    x: 144,
    y: 81,
    w: 63,
    h: 46
  },
  topDownFloorTile: {
    x: 81,
    y: 81,
    w: 63,
    h: 46
  }, // TopDownHouse_FloorsAndWalls.png, n5-phaser-game.js:13
  // libassetpack-tiled.png (1488x528px) — shelf/book-pile crops, verbatim
  // from n5-phaser-game.js's own ASSET_RECTS (same source sheet, same
  // already-alpha-scan-confirmed rects — see that file's comments for
  // how each was isolated).
  shelfLocked: {
    x: 28,
    y: 384,
    w: 88,
    h: 120
  },
  shelfFilled1: {
    x: 148,
    y: 372,
    w: 88,
    h: 132
  },
  shelfFilled2: {
    x: 268,
    y: 365,
    w: 88,
    h: 139
  },
  shelfFilled3: {
    x: 388,
    y: 373,
    w: 88,
    h: 131
  },
  bookPileTall: {
    x: 240,
    y: 96,
    w: 30,
    h: 48
  },
  // N3's own new crop (no N5 equivalent) — a freestanding grandfather
  // clock, this floor's globe-equivalent centerpiece landmark (Task 6,
  // buildFurniture). Isolated via per-row/per-column alpha-run scanning
  // of the same libassetpack-tiled.png sheet (not a bounding-box flood
  // fill — see CLAUDE.md's crop-isolation warning): the item sits
  // between a potted plant (left, columns <=67) and a treasure chest
  // (below, rows >=150), both confirmed transparent in the gap columns/
  // rows immediately surrounding this box (cols 68-78 and 137-149 fully
  // transparent for rows 20-146; rows 144-149 fully transparent for
  // cols 75-140) — a clean, unmerged isolation.
  grandfatherClock: {
    x: 79,
    y: 24,
    w: 58,
    h: 120
  },
  // Same staircase crop N5's own buildTopBand() uses (n5-phaser-game.js's
  // ASSET_RECTS.staircase, verbatim rect) — kept for reference only, not
  // consumed anywhere in this file. Only the top ~53% of this 300px-tall
  // crop is opaque content — the rest is transparent padding.
  staircase: {
    x: 935,
    y: 0,
    w: 100,
    h: 300
  },
  // The bottom-most tread of the same staircase asset — used to be
  // cropped for a small "one step visible" landmark at the spawn corner
  // (buildStairsLandmark()), removed per explicit follow-up feedback
  // ("just remove the stairs"). Kept here for reference only, not
  // consumed anywhere in this file.
  lastStairStep: {
    x: 935,
    y: 140,
    w: 100,
    h: 35
  },
  // TopDownHouse_FurnitureState1.png ('topDownFurniture1', already
  // preloaded above) — reading-nook furniture for buildFillerFurniture(),
  // replacing this pass's original duplicate-shelf-sprite filler per
  // explicit feedback ("instead of the same shelves for fillers of
  // space"). Verbatim rects from n5-phaser-game.js's own ASSET_RECTS
  // (libTable/libChair/sofaCouch2), already alpha-scan-verified and
  // already proven in-game by N5's own reading nook — reused as-is
  // rather than cropping fresh, unverified rects from a new sheet.
  libTable: { x: 0, y: 32, w: 48, h: 32 },
  libChair: { x: 161, y: 9, w: 14, h: 22 },
  sofaCouch2: { x: 24, y: 167, w: 56, h: 25 },
  // furniture03.png ('furniture03', already preloaded above) — the same
  // reference-kiosk TV cabinet crop N5's own buildFurniture() uses,
  // reused verbatim (already alpha-scan-verified there) for the Rest
  // Area's decorative TV, per explicit "2 loveseats pointed to the tv
  // again" request — this TV is decorative only here, not a 3rd
  // interactive lesson kiosk (N3 already has its own 2 standalone
  // stations, the Vocabulary Press and the Jukebox).
  tvCabinet: { x: 191, y: 48, w: 33, h: 32 },
  // Verbatim from n5-phaser-game.js's own ASSET_RECTS.globe (same
  // libassetpack-tiled.png sheet, already alpha-scan-verified there) —
  // reused as-is per explicit "put the globe in N4 and N3 too" request,
  // see buildFurniture()'s Reading Nook section for where it lands here.
  globe: { x: 143, y: 217, w: 94, h: 118 },
};

// Archive Vault accent palette (deep teal + brass, approved via the
// room-layout mockup before this file existed — see
// mockups/n3-archive-vault/) — replaces the wine/forest-green/wood/gold
// values this block carried over verbatim from N4 during the initial
// N4->N3 rename pass. carpet (the entrance rug's base color) is kept
// warm/brass rather than teal so it still reads as a distinct accent
// against the teal walls/shelves, same "warm rug against cool walls"
// contrast N4's own wine-on-warm-reception pairing used. gold is renamed
// in spirit only (kept as `gold` for every existing call site that reads
// N3_PALETTE.gold — see N3_RUG_PALETTE.rugMotif below) but is now this
// floor's actual brass tone, matching --lb-role-particle-bg-adjacent
// brass trim on the recolored shelves.
const N3_PALETTE = {
  carpet: 0x8a651f,
  accentGreen: 0x1d4a43,
  darkWood: 0x2a1f14,
  gold: 0xc9a24b,
};

// drawWovenRug()'s palette param, in this floor's brass/gold Archive
// Vault accent (was a leftover wine-toned family from the N4->N3 rename
// pass, updated to match N3_PALETTE.carpet above) — hoisted to module
// scope (was a local const duplicated only inside buildFurniture()) so
// buildAtrium()'s "real carpet" preview can reuse the exact same rug
// this floor's own arrival mat uses, per the same reasoning N4 already
// established ("show the same... carpet").
const N3_RUG_PALETTE = {
  rugDark: 0x2a1f0a,
  rugFringeLight: 0x4a3618,
  rugBase: N3_PALETTE.carpet,
  rugWeave: 0x5c4420,
  rugMotif: N3_PALETTE.gold,
  rugMotifShade: 0xa87f3a,
};

// Vocabulary press reference list (this pass) — verbatim-path copy of
// n5-phaser-game.js's PRINT_LINKS_BY_SHELF entries (same PDFs, same
// '../../assets/lesson pdf/...' relative depth, since pages/N3/
// n3-dashboard.html sits at the identical folder depth as pages/N5/
// n5-dashboard.html — confirmed by grep before use). Flattened into one
// list (not per-shelf) since the press is a single always-available
// station, not tied to any one shelf's popup links.
const ALL_PRINT_LINKS_N3 = [
  { label: 'Nouns', href: encodeURI('../../assets/lesson pdf/NIHONGO VOCABS (NOUNS).pdf') },
  { label: 'Pronouns', href: encodeURI('../../assets/lesson pdf/NIHONGO VOCABS (PRONOUNS).pdf') },
  { label: 'Adjectives', href: encodeURI('../../assets/lesson pdf/NIHONGO VOCABS ADJ.pdf') },
  { label: 'Verbs', href: encodeURI('../../assets/lesson pdf/NIHONGO VOCABS VERBS.pdf') },
  { label: 'Expressions', href: encodeURI('../../assets/lesson pdf/NIHONGO VOCABS (EXPRESSIONS).pdf') },
  { label: 'Conjugations', href: encodeURI('../../assets/lesson pdf/N5 Conjugations - Conjugations.pdf') },
  { label: 'Particles', href: encodeURI('../../assets/lesson pdf/N5 particles - Particles.pdf') },
];

// Listening Jukebox reference list (this pass) -- real, freely available
// external N3/N3-level listening resources (not hosted locally, unlike the
// press's PDFs): NHK Easy News (text+audio together), the Nihongo con
// Teppei podcast (free, beginner/N3-N5-friendly slow speech), and two
// JLPT N3/N3 listening-practice videos.
const JUKEBOX_LINKS = [
  { label: 'NHK News Web Easy (text + audio)', href: 'https://www3.nhk.or.jp/news/easy/' },
  { label: 'Nihongo con Teppei -- For Beginners (podcast)', href: 'https://nihongoconteppei.com/' },
  { label: 'JLPT N3 Listening Practice (Mochi Sensei)', href: 'https://www.youtube.com/watch?v=Xh3uMWQxJjM' },
  { label: 'JLPT N3 Listening Practice (Mochi Sensei)', href: 'https://www.youtube.com/watch?v=BAy4J9CurtE' },
];

// -- Persistence: this floor's own localStorage keys --------------------
// Per CLAUDE.md's "one key per concern" pattern — N3 progress/favorites/
// lesson-page state is separate from N5's (nekoBunko.n5.*), since it's a
// different floor's worth of shelves. Cat color/animations are the one
// exception (see CAT_COLOR_KEY below) — that's a player-level preference
// set once in N5's CatSelectScene, not a per-floor concern, so N3 reads
// it from N5's existing key rather than duplicating a select step.

const SAVE_KEY = 'nekoBunko.n3.progress';
const FAVORITES_KEY = 'nekoBunko.n3.favorites';
const LESSON_PAGE_KEY = 'nekoBunko.n3.lessonPage';
const QUIZ_GATE_KEY = 'nekoBunko.n3.quizGate'; // N3 wing entrance exam
const N2_ENTRANCE_GATE_KEY = 'nekoBunko.n3.n2Gate';
const N1_ENTRANCE_GATE_KEY = 'nekoBunko.n3.n1Gate';

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
// a n3-scoped one — see the persistence note above.

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
  orange: {
    key: 'orangeCatSheet',
    path: '../../assets/images/avatars/cat-2-64x64.png',
    label: 'Orange'
  },
  black: {
    key: 'blackCatSheet',
    path: '../../assets/images/avatars/cat-1-64x64.png',
    label: 'Black'
  },
  white: {
    key: 'whiteCatSheet',
    path: '../../assets/images/avatars/cat-3-64x64.png',
    label: 'White'
  },
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
  idle: {
    row: 12,
    count: 8
  },
  walkDown: {
    row: 2,
    count: 6
  },
  walkUp: {
    row: 3,
    count: 6
  },
  walkLeft: {
    row: 4,
    count: 6
  },
  walkRight: {
    row: 5,
    count: 6
  },
};

function catFrameRange(rowKey) {
  const {
    row,
    count
  } = CAT_SHEET_ROWS[rowKey];
  const start = row * CAT_SHEET_COLS;
  return {
    start,
    end: start + count - 1
  };
}

// Run sheets — dedicated 5-col x 4-row @ 64px spritesheets, one per
// color, added per explicit "add running sprites... speed up the time to
// view the library... if the cat can run as well as walk" request.
// Built by re-packing the user-supplied Aseprite exports
// (<color>cat-running.ase) into a uniform grid via a one-off Python pass
// (connected-component blob detection per row, since the hand-placed
// source frames weren't on a fixed grid to begin with) — see
// assets/images/avatars/<color>cat-run-sheet.png. Row layout confirmed by
// visual inspection of the decoded source art (not assumed): row0=run
// toward camera (4f), row1=run away from camera (4f), row2=run facing
// right (5f), row3=run facing left (5f) — same 4-direction convention as
// CAT_SHEET_ROWS' walk rows, just a separate sheet/column-count.
const RUN_SHEETS = {
  orange: { key: 'orangeCatRunSheet', path: '../../assets/images/avatars/orangecat-run-sheet.png' },
  black: { key: 'blackCatRunSheet', path: '../../assets/images/avatars/blackcat-run-sheet.png' },
  white: { key: 'whiteCatRunSheet', path: '../../assets/images/avatars/whitecat-run-sheet.png' },
};
const RUN_SHEET_COLS = 5;
const RUN_SHEET_ROWS = {
  runDown: { row: 0, count: 4 },
  runUp: { row: 1, count: 4 },
  runRight: { row: 2, count: 5 },
  runLeft: { row: 3, count: 5 },
};
function runFrameRange(rowKey) {
  const { row, count } = RUN_SHEET_ROWS[rowKey];
  const start = row * RUN_SHEET_COLS;
  return { start, end: start + count - 1 };
}

// Sleep sheets — dedicated 14-col x 1-row @ 64px spritesheet per color
// (same repacking technique as RUN_SHEETS), added for the "lay down when
// idle" request. Frames 0-9 are a one-shot sit -> curl -> fully-asleep
// sequence; 6-9 (the fully-curled poses) loop afterward as a gentle
// breathing idle. Frames 10-13 (stretch + dash off, already in the source
// art) aren't used yet — reserved for a future "waking up" transition.
const SLEEP_SHEETS = {
  orange: { key: 'orangeCatSleepSheet', path: '../../assets/images/avatars/orangecat-sleep-sheet.png' },
  black: { key: 'blackCatSleepSheet', path: '../../assets/images/avatars/blackcat-sleep-sheet.png' },
  white: { key: 'whiteCatSleepSheet', path: '../../assets/images/avatars/whitecat-sleep-sheet.png' },
};
// How long (ms) with zero movement before the player cat lies down and
// falls asleep — see updatePlayerAnimation().
const IDLE_SLEEP_MS = 10000;
// Speed multiplier while the run key (Shift) is held — see update().
const RUN_SPEED_MULTIPLIER = 1.8;

const CAT_COLOR_ORDER = ['orange', 'black', 'white'];

function loadCatSpritesheets(scene) {
  CAT_COLOR_ORDER.forEach((id) => {
    const c = CAT_COLORS[id];
    scene.load.spritesheet(c.key, c.path, {
      frameWidth: 64,
      frameHeight: 64
    });
    const r = RUN_SHEETS[id];
    scene.load.spritesheet(r.key, r.path, { frameWidth: 64, frameHeight: 64 });
    const s = SLEEP_SHEETS[id];
    scene.load.spritesheet(s.key, s.path, { frameWidth: 64, frameHeight: 64 });
  });
}

// Idempotent: safe even though N3 is a separate Game instance from N5
// (Phaser's anim registry is per-Game, not shared) — but also safe to
// call more than once within this same page, same as N5's own guard.
const CAT_ANIM_DEFS = [{
    suffix: 'idle',
    rowKey: 'idle',
    frameRate: 6
  },
  {
    suffix: 'walk-down',
    rowKey: 'walkDown',
    frameRate: 10
  },
  {
    suffix: 'walk-up',
    rowKey: 'walkUp',
    frameRate: 10
  },
  {
    suffix: 'walk-left',
    rowKey: 'walkLeft',
    frameRate: 10
  },
  {
    suffix: 'walk-right',
    rowKey: 'walkRight',
    frameRate: 10
  },
];

// Same naming convention as CAT_ANIM_DEFS (`${colorId}-run-${dir}`), just
// sourced from RUN_SHEETS instead of CAT_COLORS, and played at a faster
// frameRate so the gait itself reads as quicker, not just the underlying
// movement speed.
const RUN_ANIM_DEFS = [
  { suffix: 'run-down', rowKey: 'runDown', frameRate: 14 },
  { suffix: 'run-up', rowKey: 'runUp', frameRate: 14 },
  { suffix: 'run-left', rowKey: 'runLeft', frameRate: 16 },
  { suffix: 'run-right', rowKey: 'runRight', frameRate: 16 },
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

    const runSheetKey = RUN_SHEETS[id].key;
    RUN_ANIM_DEFS.forEach((def) => {
      const animKey = `${id}-${def.suffix}`;
      if (scene.anims.exists(animKey)) return;
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(runSheetKey, runFrameRange(def.rowKey)),
        frameRate: def.frameRate,
        repeat: -1,
      });
    });

    // Sleep — a one-shot "fall asleep" anim (frames 0-9: sit -> curl up
    // -> fully asleep), plays ONCE (repeat: 0) and then just holds on its
    // last frame — Phaser leaves a non-repeating animation's final frame
    // showing once it completes, it doesn't reset or need a follow-up
    // anim. Originally chained into a repeat:-1 loop over frames 6-9, but
    // those 4 frames aren't a subtle breathing cycle — they visibly turn
    // the cat's head/tuck side to side, which looped forever read as
    // "tossing and turning" instead of settling down (explicit bug
    // report). One turn into the curled pose, then stay there, is what
    // was actually wanted.
    const sleepSheetKey = SLEEP_SHEETS[id].key;
    const sleepFallKey = `${id}-sleep-fall`;
    if (!scene.anims.exists(sleepFallKey)) {
      scene.anims.create({
        key: sleepFallKey,
        frames: scene.anims.generateFrameNumbers(sleepSheetKey, { start: 0, end: 9 }),
        frameRate: 8,
        repeat: 0,
      });
    }
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
// Task 7 populates LESSON_CONTENT with this floor's actual pages.

// One-page placeholder for shelves not getting full content this pass
// — still real LESSON_CONTENT (marks progress, unlocks the next shelf),
// just short. title/kanaHint are used verbatim, no re-authoring per
// shelf beyond what's already in LESSON_DATA.
function buildPlaceholderLesson(title) {
  return [{
    type: 'grammar-intro',
    sectionLabel: title,
    bigIdea: `${title} is on its way — a full lesson isn't written yet.`,
    explain: [
      'This shelf is part of the N3 floor\'s layout, but its lesson content is still being written. Completing this page marks it done for now, and you can revisit it any time once the real lesson ships.',
    ],
  }];
}

// -- Review-pile quiz question banks (Task 3 proofreading-pass addition) --
// Same shape/convention as N5's REVIEW_1_QUIZ_QUESTIONS..REVIEW_4_QUIZ_
// QUESTIONS (n5-phaser-game.js): one shared array per pile, referenced by
// both that pile's 'quiz-review' and 'quiz-answers' pages (LESSON_CONTENT
// below) so the two pages can't drift out of sync. kind:'mc' needs
// {prompt, choices, correctIndex}; kind:'fill' needs {prompt, before,
// after, answer, altAnswers?} -- graded by gradeQuizQuestion() in
// lesson-box.js exactly like N5's.
// Declared here, ABOVE LESSON_CONTENT (moved from just after furigana()
// below, where they originally lived) -- LESSON_CONTENT's own object
// literal references these by bare name, and `const` bindings are only
// hoisted (not initialized) ahead of their declaration line, so having
// them declared textually AFTER the const LESSON_CONTENT = {...} statement
// that reads them threw "Cannot access before initialization" the instant
// this file loaded in a real browser (never caught by node --check, which
// only validates syntax, not this kind of temporal-dead-zone ordering bug).
const N3_REVIEW_1_QUIZ_QUESTIONS = [
  {
    kind: 'mc', prompt: '日本語が話せます -- what form is 話せます?',
    choices: ['Volitional (意向形)', 'Potential (可能形)', 'Passive (受身形)', 'Conditional (ば形)'], correctIndex: 1,
  },
  {
    kind: 'fill', prompt: '"Let\'s watch a movie together" -- volitional form of 見る:',
    before: '一緒に映画を', after: '。', answer: '見よう', altAnswers: ['miyou'],
  },
  {
    kind: 'fill', prompt: '"If it rains, I\'ll stay home" -- ば-form of 降る:',
    before: '雨が', after: '、家にいます。', answer: '降れば', altAnswers: ['fureba'],
  },
  {
    kind: 'mc', prompt: '先生に褒められた -- who did the praising?',
    choices: ['I praised the teacher', 'The teacher was praised', 'The teacher praised me', 'I praised myself'], correctIndex: 2,
  },
  {
    kind: 'mc', prompt: 'Which pair is 自動詞／他動詞 (intransitive/transitive)?',
    choices: ['話す／話される', 'ドアが開く／ドアを開ける', '見る／見られる', '行く／行かせる'], correctIndex: 1,
  },
  {
    kind: 'mc', prompt: 'Which particle marks WHERE an action happens (not just where something exists)?',
    choices: ['に', 'で', 'の', 'へ'], correctIndex: 1,
  },
  {
    kind: 'fill', prompt: '"It starts from nine o\'clock":',
    before: '', after: '始まります。', answer: '九時から', altAnswers: ['kuji kara'],
  },
  {
    kind: 'fill', prompt: '"I am a student too" -- も replaces は here:',
    before: '', after: '学生です。', answer: '私も', altAnswers: ['watashi mo'],
  },
  {
    kind: 'mc', prompt: 'What does ずつ mean in 二つずつ配ります?',
    choices: ['All at once', 'Two each (apiece)', 'Only two total', 'Never two'], correctIndex: 1,
  },
  {
    kind: 'mc', prompt: '東京は大阪ほど暑くない means:',
    choices: ['Tokyo is hotter than Osaka', 'Tokyo is not as hot as Osaka', 'Tokyo and Osaka are equally hot', 'Osaka is not hot at all'], correctIndex: 1,
  },
];

const N3_REVIEW_2_QUIZ_QUESTIONS = [
  {
    kind: 'mc', prompt: 'お茶でも飲みませんか -- what job is でも doing here?',
    choices: ['"Even if" (concessive)', 'Softening a suggestion ("or something")', 'Marking a total', 'Marking a location'], correctIndex: 1,
  },
  {
    kind: 'fill', prompt: '"1000 yen in total":',
    before: '', after: '千円です。', answer: '全部で', altAnswers: ['zenbu de'],
  },
  {
    kind: 'mc', prompt: '三時間も待った -- what does も add here?',
    choices: ['Nothing, it\'s decorative', 'A surprising amount ("as much as")', '"Also / too"', 'A question'], correctIndex: 1,
  },
  {
    kind: 'mc', prompt: 'Which is the CASUAL listing pattern ("things like coffee and tea")?',
    choices: ['コーヒーとか紅茶とか', 'コーヒーと紅茶', 'コーヒーでも紅茶でも', 'コーヒーも紅茶も'], correctIndex: 0,
  },
  {
    kind: 'fill', prompt: '"I\'m just about to go out":',
    before: 'ちょうど出かける', after: 'です。', answer: 'ところ', altAnswers: ['tokoro'],
  },
  {
    kind: 'fill', prompt: '"While mom was sleeping, I studied" -- while = の間に／ているあいだに:',
    before: '母が寝ている', after: '勉強した。', answer: 'あいだに', altAnswers: ['aida ni', '間に'],
  },
  {
    kind: 'mc', prompt: '靴を履いたまま部屋に入った means the person entered the room:',
    choices: ['After taking their shoes off', 'While still wearing their shoes', 'Without any shoes', 'While changing shoes'], correctIndex: 1,
  },
  {
    kind: 'fill', prompt: '"I have climbed Mt. Fuji" -- experience, たことがある:',
    before: '富士山に登った', after: '。', answer: 'ことがある', altAnswers: ['koto ga aru'],
  },
  {
    kind: 'mc', prompt: '転勤することになった means the transfer was decided:',
    choices: ['By me, on my own', 'By circumstance / someone else', 'By nobody, it\'s a mistake', 'A long time ago'], correctIndex: 1,
  },
  {
    kind: 'fill', prompt: '"You must not take photos" -- prohibition:',
    before: '写真を撮って', after: '。', answer: 'はいけません', altAnswers: ['wa ikemasen'],
  },
  {
    kind: 'fill', prompt: '"I ended up forgetting my homework" -- regret nuance, てしまう:',
    before: '宿題を忘れて', after: '。', answer: 'しまった', altAnswers: ['shimatta'],
  },
];

const N3_REVIEW_3_QUIZ_QUESTIONS = [
  {
    kind: 'mc', prompt: '友達が本をくれた -- who ends up with the book?',
    choices: ['My friend', 'Me', 'Neither', 'Both'], correctIndex: 1,
  },
  {
    kind: 'fill', prompt: '"For my health, I run every day":',
    before: '健康の', after: '毎日走っています。', answer: 'ために', altAnswers: ['tame ni'],
  },
  {
    kind: 'fill', prompt: '"I wrote a note so I wouldn\'t forget" -- goal, ように:',
    before: '忘れない', after: 'メモした。', answer: 'ように', altAnswers: ['you ni'],
  },
  {
    kind: 'mc', prompt: '漢字が読めるようになった means:',
    choices: ['I am trying to read kanji', 'I have become able to read kanji', 'I decided to read kanji', 'I refuse to read kanji'], correctIndex: 1,
  },
  {
    kind: 'mc', prompt: 'こんな問題は簡単だ -- こんな describes:',
    choices: ['A specific problem pointed at directly', 'A kind/type of problem', 'A question about problems', 'A comparison of problems'], correctIndex: 1,
  },
  {
    kind: 'fill', prompt: '"You\'d better sleep more":',
    before: 'もっと寝た', after: 'ですよ。', answer: 'ほうがいい', altAnswers: ['hou ga ii'],
  },
  {
    kind: 'mc', prompt: '行け and 触るな are both:',
    choices: ['Polite requests', 'Blunt commands (imperative/prohibitive)', 'Questions', 'Past tense'], correctIndex: 1,
  },
  {
    kind: 'fill', prompt: '"I don\'t know whether he\'s coming or not":',
    before: '彼が来る', after: '分かりません。', answer: 'かどうか', altAnswers: ['ka douka'],
  },
  {
    kind: 'mc', prompt: '波の音が聞こえる vs. このラジオでニュースが聞ける -- the difference is:',
    choices: ['No difference, both are potential form', '聞こえる = reaches you naturally; 聞ける = you have the ability/chance to', '聞こえる is more polite', '聞ける only works with music'], correctIndex: 1,
  },
  {
    kind: 'fill', prompt: '"Even though I tried hard, I failed" -- のに, surprise/complaint:',
    before: '頑張った', after: '失敗した。', answer: 'のに', altAnswers: ['noni'],
  },
];

const N3_REVIEW_4_QUIZ_QUESTIONS = [
  {
    kind: 'mc', prompt: '何でも食べます -- でも here means:',
    choices: ['"Or something"', '"Even if"', '"Anything" (concessive, with a question word)', '"But"'], correctIndex: 2,
  },
  {
    kind: 'mc', prompt: 'Which is the MOST polite way to ask for help?',
    choices: ['手伝ってくれ', '手伝って', '手伝ってもらえる？', '手伝っていただけますか'], correctIndex: 3,
  },
  {
    kind: 'fill', prompt: '"I want you to come earlier":',
    before: 'もっと早く来て', after: 'です。', answer: 'ほしい', altAnswers: ['hoshii'],
  },
  {
    kind: 'mc', prompt: '田中さんという人 -- という does what job here?',
    choices: ['Marks a location', 'Quotes/names ("called...")', 'Marks a question', 'Marks a reason'], correctIndex: 1,
  },
  {
    kind: 'fill', prompt: '"Alright, let\'s go" -- bare volitional:',
    before: 'さあ、', after: '。', answer: '行こう', altAnswers: ['ikou'],
  },
  {
    kind: 'mc', prompt: '先生になるつもりです vs. 留学しようと思っています -- which is the FIRMER, more settled intention?',
    choices: ['つもりです', 'ようと思っています', 'Both are equally firm', 'Neither expresses intention'], correctIndex: 0,
  },
  {
    kind: 'fill', prompt: '"When I get home, I\'ll call you" -- たら conditional:',
    before: '家に着い', after: '電話します。', answer: 'たら', altAnswers: ['tara'],
  },
  {
    kind: 'mc', prompt: '行くなら一緒に行きましょう -- なら is used because:',
    choices: ['It\'s a general hypothetical with no context', 'It reacts to something the other person just said', 'It describes an automatic result', 'It\'s the past tense of ば'], correctIndex: 1,
  },
  {
    kind: 'fill', prompt: '"It looks like it\'s going to rain" -- appearance, そうだ:',
    before: '雨が降り', after: 'です。', answer: 'そう', altAnswers: ['sou'],
  },
  {
    kind: 'fill', prompt: '"I ate too much":',
    before: '食べ', after: 'ました。', answer: 'すぎ', altAnswers: ['sugi'],
  },
  {
    kind: 'mc', prompt: 'どうしたんですか adds what nuance versus plain どうしたか?',
    choices: ['No difference', 'An explanatory "the thing is..." nuance', 'Past tense', 'A command'], correctIndex: 1,
  },
];

// AUTO-STRUCTURED reference data for the Kanji Easel interactive (see
// buildKanjiEasel() / LESSON_CONTENT['kanji-easel'] below). N3's
// LESSON_CONTENT is still a placeholder copy of N4's grammar content (see
// this file's own top-of-file status note from the N3 floor build), so
// this word list necessarily duplicates N4's own kanji-easel list --
// flagged explicitly in this floor's easel intro page (via the `note`
// passed to buildKanjiEaselPages() below) so it reads as an honest
// "coming soon, N3 content not authored yet" state, not a silent copy.
const N3_KANJI_EASEL_WORDS = [
  { kana: '話す', reading: 'はなす', romaji: 'hanasu', meaning: 'to speak' },
  { kana: '見る', reading: 'みる', romaji: 'miru', meaning: 'to see / watch' },
  { kana: '降る', reading: 'ふる', romaji: 'furu', meaning: 'to fall (rain, snow)' },
  { kana: '褒める', reading: 'ほめる', romaji: 'homeru', meaning: 'to praise' },
  { kana: '食べる', reading: 'たべる', romaji: 'taberu', meaning: 'to eat' },
  { kana: '開く', reading: 'あく', romaji: 'aku', meaning: 'to open (by itself)' },
  { kana: '開ける', reading: 'あける', romaji: 'akeru', meaning: 'to open (something)' },
  { kana: '図書館', reading: 'としょかん', romaji: 'toshokan', meaning: 'library' },
  { kana: '勉強する', reading: 'べんきょうする', romaji: 'benkyou suru', meaning: 'to study' },
  { kana: '九時', reading: 'くじ', romaji: 'kuji', meaning: 'nine o’clock' },
  { kana: '友達', reading: 'ともだち', romaji: 'tomodachi', meaning: 'friend' },
  { kana: '手紙', reading: 'てがみ', romaji: 'tegami', meaning: 'letter' },
  { kana: '書く', reading: 'かく', romaji: 'kaku', meaning: 'to write' },
  { kana: '学生', reading: 'がくせい', romaji: 'gakusei', meaning: 'student' },
  { kana: '二つ', reading: 'ふたつ', romaji: 'futatsu', meaning: 'two (things)' },
  { kana: '大阪', reading: 'おおさか', romaji: 'Oosaka', meaning: 'Osaka' },
  { kana: '暑い', reading: 'あつい', romaji: 'atsui', meaning: 'hot (weather)' },
  { kana: '電車', reading: 'でんしゃ', romaji: 'densha', meaning: 'train' },
  { kana: '行く', reading: 'いく', romaji: 'iku', meaning: 'to go' },
  { kana: '千円', reading: 'せんえん', romaji: "sen'en", meaning: '1,000 yen' },
  { kana: '三時間', reading: 'さんじかん', romaji: 'sanjikan', meaning: 'three hours' },
  { kana: '待つ', reading: 'まつ', romaji: 'matsu', meaning: 'to wait' },
  { kana: '紅茶', reading: 'こうちゃ', romaji: 'koucha', meaning: 'black tea' },
  { kana: '安い', reading: 'やすい', romaji: 'yasui', meaning: 'cheap' },
  { kana: '出かける', reading: 'でかける', romaji: 'dekakeru', meaning: 'to go out' },
  { kana: '寝る', reading: 'ねる', romaji: 'neru', meaning: 'to sleep' },
  { kana: '疲れる', reading: 'つかれる', romaji: 'tsukareru', meaning: 'to get tired' },
  { kana: '靴', reading: 'くつ', romaji: 'kutsu', meaning: 'shoes' },
  { kana: '履く', reading: 'はく', romaji: 'haku', meaning: 'to wear (on feet)' },
  { kana: '登る', reading: 'のぼる', romaji: 'noboru', meaning: 'to climb' },
  { kana: '運動する', reading: 'うんどうする', romaji: 'undou suru', meaning: 'to exercise' },
  { kana: '春', reading: 'はる', romaji: 'haru', meaning: 'spring (season)' },
  { kana: '転勤する', reading: 'てんきんする', romaji: 'tenkin suru', meaning: 'to be transferred (job)' },
  { kana: '終わる', reading: 'おわる', romaji: 'owaru', meaning: 'to finish' },
  { kana: '準備する', reading: 'じゅんびする', romaji: 'junbi suru', meaning: 'to prepare' },
  { kana: '忘れる', reading: 'わすれる', romaji: 'wasureru', meaning: 'to forget' },
  { kana: '健康', reading: 'けんこう', romaji: 'kenkou', meaning: 'health' },
  { kana: '問題', reading: 'もんだい', romaji: 'mondai', meaning: 'problem / question' },
  { kana: '簡単', reading: 'かんたん', romaji: 'kantan', meaning: 'simple / easy' },
  { kana: '命令', reading: 'めいれい', romaji: 'meirei', meaning: 'command / order' },
  { kana: '禁止', reading: 'きんし', romaji: 'kinshi', meaning: 'prohibition' },
  { kana: '触る', reading: 'さわる', romaji: 'sawaru', meaning: 'to touch' },
  { kana: '誰か', reading: 'だれか', romaji: 'dareka', meaning: 'someone' },
  { kana: '天気', reading: 'てんき', romaji: 'tenki', meaning: 'weather' },
  { kana: '雨', reading: 'あめ', romaji: 'ame', meaning: 'rain' },
  { kana: '音', reading: 'おと', romaji: 'oto', meaning: 'sound' },
  { kana: '波', reading: 'なみ', romaji: 'nami', meaning: 'wave' },
  { kana: '頑張る', reading: 'がんばる', romaji: 'ganbaru', meaning: 'to do one’s best' },
  { kana: '手伝う', reading: 'てつだう', romaji: 'tetsudau', meaning: 'to help' },
];

const LESSON_CONTENT = {
  // ---------------------------------------------------------------------
  // N3-ONLY SINGLE FLOOR (N3 wing, frosted wall, and exam gate removed).
  // 16 grammar shelves (merged/renamed from the old 24) + 4 Reading Room
  // shelves + Vocabulary Press + Listening Jukebox. Every merged shelf
  // below concatenates its constituent old shelves' page arrays verbatim
  // (content itself is unchanged/re-verified, only regrouped + relabeled).
  // ---------------------------------------------------------------------

  // Verb Stacks I (n3-shelf-01)
  'n3-shelf-01': [
{
      type: 'grammar-intro',
      sectionLabel: 'Conjugations I — Potential, Volitional, Ba-form',
      bigIdea: 'Three new ways to bend a verb this shelf: saying you CAN do something, saying "let\'s do" it, and saying "IF" you do it.',
      explain: ['This shelf covers 可能形 (potential), 意向形 (volitional), and ば形 (conditional) — three of the most common verb conjugations in N3 grammar.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '可能形 — Potential form',
      diagramSvg: buildEndingSwapDiagram('食べ', 'る', 'られる'),
      wireDiagram: wireEndingSwapDiagram,
      explain: ['Expresses ability or possibility — "can do" (食べる → 食べられる, "can eat"). Ichidan verbs (ending in る after an e/i sound) drop る and add られる. Godan verbs (ending in う, く, す, etc.) change the final u-sound to an e-sound and add る instead (話す → 話せる).'],
      samples: [{
        tag: '"I can speak Japanese."',
        tiles: [
          { text: '日本語が', role: 'subject', gloss: 'Japanese' },
          { text: '話せます', role: 'predicate', gloss: 'can speak', isNew: true },
        ],
        translation: 'Nihongo ga hanasemasu.',
      }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '意向形 — Volitional form',
      diagramSvg: buildEndingSwapDiagram('見', 'る', 'よう'),
      wireDiagram: wireEndingSwapDiagram,
      explain: ['"Let\'s do" or "I will (decide to)" (見る → 見よう, "let\'s watch/I\'ll watch"). Ichidan verbs drop る and add よう. Godan verbs change the final u-sound to an o-sound and add う instead (行く → 行こう).'],
      samples: [{
        tag: '"Let\'s watch a movie together."',
        tiles: [
          { text: '一緒に', role: 'subject', gloss: 'together' },
          { text: '映画を', role: 'subject', gloss: 'movie' },
          { text: '見よう', role: 'predicate', gloss: "let's watch", isNew: true },
        ],
        translation: 'Issho ni eiga o miyou.',
      }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'ば形 — Conditional "if"',
      diagramSvg: buildEndingSwapDiagram('降', 'る', 'れば'),
      wireDiagram: wireEndingSwapDiagram,
      explain: ['A hypothetical or general "if" (降る → 降れば, "if it falls/rains"). Change the verb\'s final u-sound to an e-sound and add ば (読む → 読めば works the same way).'],
      samples: [{
        tag: '"If it rains, I\'ll stay home."',
        tiles: [
          { text: '雨が', role: 'subject', gloss: 'rain' },
          { text: '降れば', role: 'particle', gloss: 'if it falls', isNew: true },
          { text: '家にいます', role: 'predicate', gloss: "I'll stay home" },
        ],
        translation: 'Ame ga fureba, ie ni imasu.',
      }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '日本語が', after: '。', answer: '話せます', altAnswers: ['はなせます'], hint: '"I can speak Japanese" — potential form of 話す.' },
        { before: '雨が降', after: '、家にいます。', answer: 'れば', hint: '"If it rains..." — conditional ば-form.' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Bunpro — JLPT N3 grammar list (可能形／意向形／ば形)', 'imabi — potential, volitional, and conditional forms'],
    },
  ],

  // Verb Stacks II (n3-shelf-02+n3-shelf-03)
  'n3-shelf-02': [
{
      type: 'grammar-intro',
      sectionLabel: 'Conjugations II — Passive, Causative',
      bigIdea: 'Two more conjugations: something being DONE TO you (passive), and someone MAKING or LETTING you do something (causative) — plus what happens when you combine them.',
      explain: ['This shelf covers 受身形 (passive) and 使役形・使役受身形 (causative and causative-passive).'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '受身形 — Passive form',
      diagramSvg: buildEndingSwapDiagram('褒め', 'る', 'られる'),
      wireDiagram: wireEndingSwapDiagram,
      explain: ['Something is done TO the subject, by someone or something else (褒める → 褒められる, "was praised"). Ichidan verbs drop る and add られる. Godan verbs change the final u-sound to an a-sound and add れる instead (書く → 書かれる).'],
      samples: [{
        tag: '"I was praised by the teacher."',
        tiles: [
          { text: '先生に', role: 'subject', gloss: 'by the teacher' },
          { text: '褒められた', role: 'predicate', gloss: 'was praised', isNew: true },
        ],
        translation: 'Sensei ni homerareta.',
      }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '使役形・使役受身形 — Causative & causative-passive',
      diagramSvg: buildEndingSwapDiagram('食べ', 'る', 'させる'),
      wireDiagram: wireEndingSwapDiagram,
      explain: ['使役形 (causative) = make/let someone do something (食べる → 食べさせる, "make (someone) eat"). Ichidan verbs drop る and add させる; godan verbs change the final u-sound to an a-sound and add せる instead (書く → 書かせる). 使役受身形 (causative-passive) = be made to do something you didn\'t want to (-させられる／-される) — the causative form pushed through the passive form on top of that.'],
      samples: [{
        tag: '"Mom made me eat vegetables." → "I was made to eat vegetables (by mom)."',
        tiles: [
          { text: '母は私に', role: 'subject', gloss: 'mom, to me' },
          { text: '野菜を', role: 'subject', gloss: 'vegetables' },
          { text: '食べさせた', role: 'predicate', gloss: 'made (me) eat', isNew: true },
        ],
        translation: 'Haha wa watashi ni yasai o tabesaseta.',
      }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '先生に', after: '。', answer: '褒められた', altAnswers: ['ほめられた'], hint: '"I was praised by the teacher" — passive form.' },
        { before: '母は私に野菜を食べ', after: '。', answer: 'させた', hint: '"Mom made me eat vegetables" — causative form.' },
      ],
    },
{
      type: 'grammar-intro',
      sectionLabel: 'Conjugations III — Transitive & Intransitive Verbs',
      bigIdea: 'Some verb pairs describe the SAME event from two angles: one where something just happens on its own (自動詞), and one where someone makes it happen (他動詞).',
      explain: [
        '自動詞 (jidoushi, intransitive) — the action happens by itself, no direct object, usually paired with が.',
        '他動詞 (tadoushi, transitive) — someone acts on an object, usually paired with を.',
      ],
      pattern: [{ text: 'ドアが開く', role: 'subject' }, { text: '／', role: 'particle' }, { text: 'ドアを開ける', role: 'predicate' }],
      samples: [
        {
          tag: '自動詞 — "The door opens (on its own)."',
          tiles: [
            { text: 'ドアが', role: 'subject', gloss: 'the door' },
            { text: '開く', role: 'predicate', gloss: 'opens', isNew: true },
          ],
          translation: 'Doa ga aku.',
        },
        {
          tag: '他動詞 — "(Someone) opens the door."',
          tiles: [
            { text: 'ドアを', role: 'subject', gloss: 'the door' },
            { text: '開ける', role: 'predicate', gloss: 'opens (it)', isNew: true },
          ],
          translation: 'Doa o akeru.',
        },
      ],
      cultureNote: 'Other common pairs: 閉まる／閉める (close), 始まる／始める (start), 落ちる／落とす (drop).',
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: 'ドアが', after: '。', answer: '開く', altAnswers: ['あく'], hint: 'Intransitive — the door opens by itself.' },
        { before: 'ドアを', after: '。', answer: '開ける', altAnswers: ['あける'], hint: 'Transitive — someone opens the door.' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Bunpro — JLPT N3 grammar list (受身形／使役形／自動詞・他動詞)', 'imabi — passive, causative, and transitivity pairs'],
    },
  ],

  // Particle Reference Desk (n3-shelf-04)
  'n3-shelf-03': [
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 1 — Particles I',
      bigIdea: 'Four small particles that do a lot of work: で vs に for location, から for starting points, and も for "also".',
      explain: ['This shelf covers で vs に, から, に, and も.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'で vs に — Location markers',
      diagramSvg: buildParticlePortalDiagram({ leftParticle: 'で', leftTag: 'action happens here', leftWord: '勉強する', rightParticle: 'に', rightTag: 'existence / destination', rightWord: 'いる' }),
      wireDiagram: wireParticlePortalDiagram,
      explain: [
        'Both で and に can follow a place word, but they answer two different questions — so the choice depends on what KIND of verb comes after the place, not on the place itself.',
        'で asks "where does this action happen?" It pairs with action verbs — things you actively DO somewhere: study, eat, play, work. The library is just the stage; the studying is the point.',
        'に asks "where does this exist, or where is this heading?" It pairs with existence/arrival verbs — いる/ある ("is/are, there is"), 行く／来る ("go/come"), and similar. The place itself IS the point — you\'re describing a location, not an action happening in it.',
        'A quick test: can you replace the verb with "happens" and still make sense ("studying happens at the library")? Then it\'s で. Can you replace it with "is located" ("I am located at the library")? Then it\'s に.',
      ],
      samples: [
        { tag: '"I study at the library." (action)', tiles: [{ text: '図書館で', role: 'particle', gloss: 'at the library' }, { text: '勉強する', role: 'predicate', gloss: 'study' }], translation: 'Toshokan de benkyou suru.' },
        { tag: '"I am at the library." (existence)', tiles: [{ text: '図書館に', role: 'particle', gloss: 'at the library' }, { text: 'いる', role: 'predicate', gloss: 'am (there)' }], translation: 'Toshokan ni iru.' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'から — "from" / "because"',
      pattern: [{ text: 'N／plain form', role: 'subject' }, { text: 'から', role: 'particle' }],
      explain: ['Marks a starting point (place or time), or a reason, following the plain form.'],
      samples: [{ tag: '"It starts from nine o\'clock."', tiles: [{ text: '九時から', role: 'particle', gloss: 'from 9 o\'clock', isNew: true }, { text: '始まります', role: 'predicate', gloss: 'starts' }], translation: 'Kuji kara hajimarimasu.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'に — Target / point',
      pattern: [{ text: 'N', role: 'subject' }, { text: 'に', role: 'particle' }],
      explain: ['Marks a target, a point in time, an indirect object, or a purpose.'],
      samples: [{ tag: '"I write a letter to a friend."', tiles: [{ text: '友達に', role: 'particle', gloss: 'to a friend' }, { text: '手紙を書く', role: 'predicate', gloss: 'write a letter' }], translation: 'Tomodachi ni tegami o kaku.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'も — "also / too"',
      pattern: [{ text: 'N', role: 'subject' }, { text: 'も', role: 'particle' }],
      explain: ['"Also/too" — replaces は・が・を after the noun.'],
      samples: [{ tag: '"I am a student too."', tiles: [{ text: '私も', role: 'subject', gloss: 'I too', isNew: true }, { text: '学生です', role: 'predicate', gloss: 'am a student' }], translation: 'Watashi mo gakusei desu.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '図書館', after: '勉強する。', answer: 'で', hint: 'Location of an action.' },
        { before: '九時', after: '始まります。', answer: 'から', hint: '"From nine o\'clock."' },
        { before: '私', after: '学生です。', answer: 'も', hint: '"I am a student too."' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Bunpro — JLPT N3 grammar list (で／に／から／も)', 'Tae Kim\'s Guide to Japanese Grammar — particle reference'],
    },
  ],

  // Special Collections (n3-shelf-05)
  'n3-shelf-04': [
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 1 — Particles II',
      bigIdea: 'Four more particle patterns: dividing things evenly, comparing two things, adding emphasis to a location, and saying "from...too".',
      explain: ['This shelf covers ずつ, N1はN2ほど〜ない, では・には, and からも.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'ずつ — "each"',
      pattern: [{ text: 'quantity', role: 'subject' }, { text: 'ずつ', role: 'particle' }],
      explain: [
        '"Each/apiece" — equal distribution of a quantity.',
        'ずつ attaches directly to a quantity — a number+counter (二つ, 一人, 三日...) or 少し ("a little") — nothing else. That\'s the whole rule for ずつ itself.',
        'When a sentence is dividing something up per recipient, like 一人に二つずつ, the recipient (一人 "each person") separately takes に — the ordinary "to/for" particle, not part of ずつ\'s own rule. に marks WHO receives it; ずつ marks HOW MUCH each one gets. They just often show up together because "give X each to each person" needs both jobs done at once.',
      ],
      samples: [{ tag: '"I\'ll give two to each person."', tiles: [{ text: '一人に', role: 'subject', gloss: 'to each person' }, { text: '二つずつ', role: 'particle', gloss: 'two each', isNew: true }, { text: '配ります', role: 'predicate', gloss: 'distribute' }], translation: 'Hitori ni futatsu zutsu kubarimasu.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'N1はN2ほど〜ない — Comparison of inferiority',
      pattern: [{ text: 'N1は', role: 'subject' }, { text: 'N2ほど', role: 'particle' }, { text: '〜ない', role: 'predicate' }],
      explain: ['"N1 is not as [adjective] as N2".'],
      samples: [{ tag: '"Tokyo isn\'t as hot as Osaka."', tiles: [{ text: '東京は', role: 'subject', gloss: 'Tokyo' }, { text: '大阪ほど', role: 'particle', gloss: 'as much as Osaka', isNew: true }, { text: '暑くない', role: 'predicate', gloss: "isn't hot" }], translation: 'Tokyo wa Osaka hodo atsukunai.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'では・には — Adds contrast/emphasis',
      pattern: [{ text: 'place', role: 'subject' }, { text: 'では／には', role: 'particle' }],
      explain: ['で／に + は — adds contrast or emphasis to the marked location, e.g. "here (as opposed to elsewhere)".'],
      samples: [{ tag: '"Please be quiet here."', tiles: [{ text: 'ここでは', role: 'particle', gloss: 'here (in particular)', smallGloss: true, isNew: true }, { text: '静かにしてください', role: 'predicate', gloss: 'please be quiet' }], translation: 'Koko dewa shizuka ni shite kudasai.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'からも — "from...too"',
      pattern: [{ text: 'N', role: 'subject' }, { text: 'からも', role: 'particle' }],
      explain: ['から ("from") + も ("also") — "from...as well".'],
      samples: [{ tag: '"I heard it from my friend too."', tiles: [{ text: '友達からも', role: 'particle', gloss: 'from my friend too', smallGloss: true, isNew: true }, { text: '聞きました', role: 'predicate', gloss: 'heard' }], translation: 'Tomodachi kara mo kikimashita.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '一人に二つ', after: '配ります。', answer: 'ずつ', hint: '"Two each."' },
        { before: '東京は大阪', after: '暑くない。', answer: 'ほど', hint: '"Not as hot as Osaka."' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Bunpro — JLPT N3 grammar list (ずつ／ほど〜ない／では・には／からも)', 'JLPT Sensei — N3 grammar reference'],
    },
  ],

  // Everyday Speech Shelf (n3-shelf-06)
  'n3-shelf-05': [
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 2 — でも, で, も',
      bigIdea: 'One particle you already know (で) gets several new jobs, plus でも for soft suggestions and も for surprising amounts.',
      explain: ['This shelf covers でも, で (multiple meanings: method, range, reason, material), and も (surprising quantity).'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'でも — "even if" / "or something"',
      pattern: [{ text: 'N', role: 'subject' }, { text: 'でも', role: 'particle' }],
      explain: ['Softens a suggestion ("or something"), or means "even if/but".'],
      samples: [{ tag: '"Won\'t you have some tea or something?"', tiles: [{ text: 'お茶でも', role: 'particle', gloss: 'tea or something', isNew: true }, { text: '飲みませんか', role: 'predicate', gloss: "won't you drink" }], translation: 'Ocha demo nomimasen ka.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'で — Method, range, reason, material',
      pattern: [{ text: 'N', role: 'subject' }, { text: 'で', role: 'particle' }],
      explain: ['Marks method/means, a total range, a cause/reason, or a material — the meaning shifts by context.'],
      samples: [
        { tag: '"Go by train."', tiles: [{ text: '電車で', role: 'particle', gloss: 'by train' }, { text: '行く', role: 'predicate', gloss: 'go' }], translation: 'Densha de iku.' },
        { tag: '"1000 yen in total."', tiles: [{ text: '全部で', role: 'particle', gloss: 'in total' }, { text: '千円です', role: 'predicate', gloss: 'it\'s 1000 yen' }], translation: 'Zenbu de sen\'en desu.' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'も — Surprising quantity',
      pattern: [{ text: 'number', role: 'subject' }, { text: 'も', role: 'particle' }],
      explain: ['After a number, emphasizes a surprisingly large amount.'],
      samples: [{ tag: '"I waited as long as three hours!"', tiles: [{ text: '三時間も', role: 'particle', gloss: 'as much as 3 hours', smallGloss: true, isNew: true }, { text: '待った', role: 'predicate', gloss: 'waited' }], translation: 'Sanjikan mo matta.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: 'お茶', after: '飲みませんか。', answer: 'でも', hint: '"Tea or something?"' },
        { before: '電車', after: '行く。', answer: 'で', hint: '"By train."' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Bunpro — JLPT N3 grammar list (でも／で／も)', 'JLPT Sensei — N3 grammar reference'],
    },
  ],

  // Timing & Sequence Shelf (n3-shelf-07+n3-shelf-08)
  'n3-shelf-06': [
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 2 — Listing things',
      bigIdea: 'Three casual ways to list examples or actions without being exhaustive: "things like...", "I do stuff like...", and "and moreover...".',
      explain: ['This shelf covers N1とかN2とか, たり〜たり, and し〜し.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'N1とかN2とか — Casual listing',
      pattern: [{ text: 'N1とか', role: 'subject' }, { text: 'N2とか', role: 'subject' }],
      explain: ['"Things like N1 and N2 (among others)" — casual.'],
      samples: [{ tag: '"I like things like coffee and tea."', tiles: [{ text: 'コーヒーとか', role: 'subject', gloss: 'coffee, etc.', isNew: true }, { text: '紅茶とか', role: 'subject', gloss: 'tea, etc.' }, { text: '好きです', role: 'predicate', gloss: 'like' }], translation: 'Koohii toka koucha toka ga suki desu.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'たり〜たり — Representative actions',
      pattern: [{ text: 'Vたり', role: 'subject' }, { text: '〜Vたり', role: 'subject' }, { text: 'する', role: 'predicate' }],
      explain: ['Lists representative actions — "do things like A and B (among others)".'],
      samples: [{ tag: '"On weekends I read, watch movies, and so on."', tiles: [{ text: '本を読んだり', role: 'subject', gloss: 'read books, etc.', isNew: true }, { text: '映画を見たりします', role: 'predicate', gloss: 'watch movies, etc.', smallGloss: true }], translation: 'Hon o yondari eiga o mitari shimasu.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'し〜し — "and moreover"',
      pattern: [{ text: 'plain form', role: 'subject' }, { text: 'し', role: 'particle' }],
      explain: ['Lists reasons or qualities additively, in a casual way.'],
      samples: [{ tag: '"This restaurant is cheap, tasty, and popular."', tiles: [{ text: '安いし', role: 'predicate', gloss: "it's cheap, and", isNew: true }, { text: 'おいしいし', role: 'predicate', gloss: "it's tasty, and" }, { text: '人気があります', role: 'predicate', gloss: "it's popular" }], translation: 'Yasui shi, oishii shi, ninki ga arimasu.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'とか vs たり〜たり vs し — Which one to pick',
      explain: [
        'All three sound casual and all three hint "there\'s more I\'m not saying" — but each one lists a completely different KIND of thing, so the choice depends on what you\'re listing, not on how polite you\'re being.',
        'Ask yourself: am I naming things/nouns (とか), actions I did (たり〜たり), or reasons for a conclusion (し)? Click a branch below to see its pattern and a full example.',
      ],
      diagramSvg: buildBranchingPathDiagram({
        question: 'What are you listing?',
        branches: [
          { id: 'toka', role: 'particle', label: 'things →とか', pattern: 'N とか N とか', example: '寿司とか天ぷらとかが好きです。<br>&quot;I like things like sushi and tempura.&quot;' },
          { id: 'tari', role: 'verb', label: 'actions →たり', pattern: 'Vたり Vたりする', example: '映画を見たり買い物したりしました。<br>&quot;I watched movies, went shopping, and so on.&quot;' },
          { id: 'shi', role: 'predicate', label: 'reasons →し', pattern: '普通形 し 普通形 し', example: '安いし、おいしいし、人気があります。<br>&quot;It\'s cheap, and it\'s tasty, and it\'s popular.&quot;' },
        ],
      }),
      wireDiagram: wireBranchingPathDiagram,
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: 'コーヒー', after: '紅茶とかが好きです。', answer: 'とか', hint: '"Things like coffee and tea."' },
        { before: '本を読んだり映画を見', after: 'します。', answer: 'たり', hint: '"Read, watch movies, and so on."' },
      ],
    },
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 2 — Timing words',
      bigIdea: 'Three ways to say WHEN something happens relative to something else: right before/during/after, while something else is going on, and at the moment it happens.',
      explain: ['This shelf covers る/て/たところ, Nの間に・ているあいだに, and る時に・た時に.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'る/て/たところ — About to / in progress / just finished',
      pattern: [{ text: 'Vる／Vている／Vた', role: 'subject' }, { text: 'ところ', role: 'particle' }],
      explain: ['るところ = about to; ているところ = in the middle of; たところ = just finished.'],
      samples: [{ tag: '"I\'m just about to go out."', tiles: [{ text: 'ちょうど', role: 'subject', gloss: 'just now' }, { text: '出かけるところです', role: 'predicate', gloss: 'about to go out', isNew: true }], translation: 'Choudo dekakeru tokoro desu.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Nの間に・ているあいだに — "While"',
      pattern: [{ text: 'Nの間に／Vているあいだに', role: 'subject' }, { text: '(event)', role: 'predicate' }],
      explain: ['Something happens within a period, or during an ongoing action.'],
      samples: [{ tag: '"While mom was sleeping, I studied."', tiles: [{ text: '母が寝ている間に', role: 'subject', gloss: 'while mom slept', isNew: true }, { text: '勉強した', role: 'predicate', gloss: 'studied' }], translation: 'Haha ga nete iru aida ni, benkyou shita.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'る時に・た時に — "When"',
      pattern: [{ text: 'Vる／Vた', role: 'subject' }, { text: '時に', role: 'particle' }],
      explain: ['る時 = as/just before it happens; た時 = after it happened.'],
      samples: [{ tag: '"When I left the house, it was raining."', tiles: [{ text: '家を出る時に', role: 'subject', gloss: 'when I left home', isNew: true }, { text: '雨が降っていた', role: 'predicate', gloss: 'it was raining' }], translation: 'Ie o deru toki ni, ame ga futte ita.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: 'ちょうど出かける', after: 'です。', answer: 'ところ', hint: '"About to go out."' },
        { before: '家を出る', after: '雨が降っていた。', answer: '時に', hint: '"When I left the house..."' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Bunpro — JLPT N3 grammar list (とか／たり〜たり／し〜し／ところ／間に／時に)', 'imabi — timing and listing constructions'],
    },
  ],

  // Change & Decision Shelf (n3-shelf-09+n3-shelf-10)
  'n3-shelf-07': [
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 3 — Cause, state, experience',
      bigIdea: 'A cause leading naturally to a result, a state that stays "as is", and talking about past experience or occasional habits.',
      explain: ['This shelf covers て・で (cause/reason), 〜まま, and たことがある／ないことがある.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'て・で（原因） — Cause / reason',
      pattern: [{ text: 'Vて／Nで', role: 'subject' }, { text: '(result)', role: 'predicate' }],
      explain: ['The te-form (or で) links a cause to its natural result.'],
      samples: [{ tag: '"Being tired, I went to bed early."', tiles: [{ text: '疲れて', role: 'subject', gloss: 'being tired', isNew: true }, { text: '早く寝た', role: 'predicate', gloss: 'went to bed early' }], translation: 'Tsukarete, hayaku neta.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜まま — "As is"',
      pattern: [{ text: 'Vた／Nの', role: 'subject' }, { text: 'まま', role: 'particle' }],
      explain: ['A state continues unchanged while something else happens.'],
      samples: [{ tag: '"He entered the room with his shoes still on."', tiles: [{ text: '靴を履いたまま', role: 'subject', gloss: 'shoes still on', isNew: true }, { text: '部屋に入った', role: 'predicate', gloss: 'entered the room' }], translation: 'Kutsu o haita mama, heya ni haitta.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'たことがある／ないことがある — Experience / occasional',
      pattern: [{ text: 'Vた', role: 'subject' }, { text: 'ことがある', role: 'particle' }],
      explain: ['たことがある = have had the experience of; る／ないことがある = it sometimes happens/doesn\'t happen.'],
      samples: [{ tag: '"I have climbed Mt. Fuji."', tiles: [{ text: '富士山に', role: 'subject', gloss: 'Mt. Fuji' }, { text: '登ったことがある', role: 'predicate', gloss: 'have climbed', isNew: true }], translation: 'Fujisan ni nobotta koto ga aru.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '疲れて、早く', after: '。', answer: '寝た', altAnswers: ['ねた'], hint: '"Being tired, I went to bed early."' },
        { before: '富士山に登った', after: '。', answer: 'ことがある', hint: '"I have climbed Mt. Fuji."' },
      ],
    },
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 3 — Deciding & becoming',
      bigIdea: 'Making a choice yourself, a natural change happening, and a decision made FOR you by circumstance.',
      explain: ['This shelf covers にする／ないことにする, になる, and ることになる／ないことになる.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'にする／ないことにする — Decide on / decide to',
      pattern: [{ text: 'Nに', role: 'subject' }, { text: 'する', role: 'predicate' }],
      explain: ['にする = decide on a choice; ることにする／ないことにする = decide to do/not do something.'],
      samples: [{ tag: '"I decided to exercise every day."', tiles: [{ text: '毎日運動する', role: 'subject', gloss: 'exercise every day', smallGloss: true }, { text: 'ことにした', role: 'predicate', gloss: 'decided to', isNew: true }], translation: 'Mainichi undou suru koto ni shita.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'になる — "Become"',
      pattern: [{ text: 'N／な-adj', role: 'subject' }, { text: 'になる', role: 'predicate' }],
      explain: ['A natural change of state.'],
      samples: [{ tag: '"Spring comes."', tiles: [{ text: '春に', role: 'subject', gloss: 'spring' }, { text: 'なる', role: 'predicate', gloss: 'becomes', isNew: true }], translation: 'Haru ni naru.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'ることになる／ないことになる — It has been decided',
      pattern: [{ text: 'Vる／Vない', role: 'subject' }, { text: 'ことになる', role: 'predicate' }],
      explain: ['Something has been decided or arranged, often by others or circumstance rather than by "me".'],
      samples: [{ tag: '"It\'s been decided I\'ll transfer to Osaka next month."', tiles: [{ text: '来月、大阪に転勤する', role: 'subject', gloss: 'transfer to Osaka next month', smallGloss: true }, { text: 'ことになった', role: 'predicate', gloss: 'has been decided', isNew: true }], translation: 'Raigetsu, Osaka ni tenkin suru koto ni natta.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '毎日運動する', after: 'した。', answer: 'ことに', hint: '"I decided to exercise every day."' },
        { before: '春に', after: '。', answer: 'なる', hint: '"Spring comes."' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Bunpro — JLPT N3 grammar list (て・で／まま／たことがある／にする／になる／ことになる)', 'JLPT Sensei — N3 grammar reference'],
    },
  ],

  // Obligation & Permission Shelf (n3-shelf-11+n3-shelf-12)
  'n3-shelf-08': [
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 3 — Obligation & permission',
      bigIdea: 'How to say "must", and how to grant or deny permission.',
      explain: ['This shelf covers なければなりません vs なくてはいけません／ないといけません, and てもいい／なくてもいい／てはいけない.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'なければ vs なくては／ないと — "Must" (levels of formality)',
      pattern: [{ text: 'Vない stem', role: 'subject' }, { text: 'なければ／なくては／ないと', role: 'predicate' }],
      explain: ['All mean "must" — なければなりません is more formal/objective; なくては／ないと feel more personal or conversational.'],
      samples: [{ tag: '"I must finish the homework by tomorrow."', tiles: [{ text: '明日までに宿題を', role: 'subject', gloss: 'homework, by tomorrow', smallGloss: true }, { text: '終わらせなければなりません', role: 'predicate', gloss: 'must finish', isNew: true }], translation: 'Ashita made ni shukudai o owarasenakereba narimasen.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'てもいい／なくてもいい／てはいけない — Permission / prohibition',
      pattern: [{ text: 'Vて', role: 'subject' }, { text: 'もいい／はいけない', role: 'predicate' }],
      explain: ['Permission ("may"), lack of obligation ("don\'t have to"), and prohibition ("must not").'],
      samples: [
        { tag: '"You may take photos here."', tiles: [{ text: 'ここで写真を', role: 'subject', gloss: 'photos, here' }, { text: '撮ってもいいです', role: 'predicate', gloss: 'may take', isNew: true }], translation: 'Koko de shashin o tottemo ii desu.' },
        { tag: '"You must not take photos."', tiles: [{ text: '写真を', role: 'subject', gloss: 'photos' }, { text: '撮ってはいけません', role: 'predicate', gloss: 'must not take' }], translation: 'Shashin o totte wa ikemasen.' },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '明日までに宿題を終わらせ', after: 'なりません。', answer: 'なければ', hint: '"Must finish the homework."' },
        { before: 'ここで写真を撮って', after: 'です。', answer: 'もいい', hint: '"You may take photos here."' },
      ],
    },
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 3 — Preparing & completing',
      bigIdea: 'Doing something ahead of time for later convenience, and the nuance of finishing something (sometimes with regret).',
      explain: ['This shelf covers ておく and てしまう.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'ておく — Do in advance',
      pattern: [{ text: 'Vて', role: 'subject' }, { text: 'おく', role: 'predicate' }],
      explain: ['Do something in advance, or leave a state as-is for later convenience.'],
      samples: [{ tag: '"I\'ll prepare the materials before the meeting."', tiles: [{ text: '会議の前に資料を', role: 'subject', gloss: 'materials, before the meeting' }, { text: '準備しておきます', role: 'predicate', gloss: 'will prepare (in advance)', isNew: true }], translation: 'Kaigi no mae ni shiryou o junbi shite okimasu.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'てしまう — Completion / regret',
      pattern: [{ text: 'Vて', role: 'subject' }, { text: 'しまう', role: 'predicate' }],
      explain: ['Completion, often with a nuance of regret, or an unintended result.'],
      samples: [{ tag: '"I ended up forgetting my homework."', tiles: [{ text: '宿題を', role: 'subject', gloss: 'homework' }, { text: '忘れてしまった', role: 'predicate', gloss: 'ended up forgetting', smallGloss: true, isNew: true }], translation: 'Shukudai o wasurete shimatta.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '資料を準備して', after: 'ます。', answer: 'おき', hint: '"Prepare in advance."' },
        { before: '宿題を忘れて', after: '。', answer: 'しまった', hint: '"Ended up forgetting."' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Bunpro — JLPT N3 grammar list (なければ／なくては／ないと／てもいい／てはいけない／ておく／てしまう)', 'Tae Kim\'s Guide to Japanese Grammar — obligation and permission'],
    },
  ],

  // Giving & Purpose Shelf (n3-shelf-01)
  'n3-shelf-09': [
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 4 — Giving, purpose, goals',
      bigIdea: 'Three verbs for giving and receiving, saying WHY you do something, and setting a goal for yourself.',
      explain: ['This shelf covers あげる・くれる・もらう, Nのために・Vため, and ように.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'あげる・くれる・もらう — Give / give-to-me / receive',
      pattern: [{ text: 'あげる', role: 'subject' }, { text: '／くれる／もらう', role: 'predicate' }],
      explain: ['あげる = I give out; くれる = someone gives TO me; もらう = I receive.'],
      samples: [{ tag: '"My friend gave me a book."', tiles: [{ text: '友達が本を', role: 'subject', gloss: 'my friend, a book' }, { text: 'くれた', role: 'predicate', gloss: 'gave (to me)', isNew: true }], translation: 'Tomodachi ga hon o kureta.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Nのために・Vため — "For the sake of"',
      pattern: [{ text: 'Nの', role: 'subject' }, { text: 'ために', role: 'particle' }],
      explain: ['"For the sake of / in order to" — purpose.'],
      samples: [{ tag: '"For my health, I run every day."', tiles: [{ text: '健康のために', role: 'particle', gloss: 'for my health', isNew: true }, { text: '毎日走っています', role: 'predicate', gloss: 'run every day' }], translation: 'Kenkou no tame ni, mainichi hashitte imasu.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'ように — "So that"',
      pattern: [{ text: 'Vる／Vない', role: 'subject' }, { text: 'ように', role: 'particle' }],
      explain: ['Expresses a goal, often with a potential or negative verb.'],
      samples: [{ tag: '"I wrote a note so I wouldn\'t forget."', tiles: [{ text: '忘れないように', role: 'particle', gloss: "so I wouldn't forget", smallGloss: true, isNew: true }, { text: 'メモした', role: 'predicate', gloss: 'wrote a note' }], translation: 'Wasurenai you ni, memo shita.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '友達が本を', after: '。', answer: 'くれた', hint: '"My friend gave me a book."' },
        { before: '健康の', after: '毎日走っています。', answer: 'ために', hint: '"For my health."' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Bunpro — JLPT N3 grammar list (あげる・くれる・もらう／のために／ように)', 'imabi — giving/receiving verbs and purpose expressions'],
    },
  ],

  // Effort Shelf, was "Effort & Demonstratives Shelf" (n3-shelf-02)
  'n3-shelf-10': [
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 4 — Effort, change, and demonstratives',
      bigIdea: 'Making an effort toward a goal, a change that happens over time, and pointing at something with "this/that kind of".',
      explain: ['This shelf covers ようにする・ようになる, こんな・そんな・あんな・どんなN, and こんなに・そんなに・あんなに・どんなに.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'ようにする・ようになる — Make an effort / come to',
      pattern: [{ text: 'Vる／Vない', role: 'subject' }, { text: 'ようにする／ようになる', role: 'predicate' }],
      explain: ['ようにする = make an effort to do; ようになる = reach a new state or ability over time.'],
      samples: [{ tag: '"I\'ve become able to read kanji."', tiles: [{ text: '漢字が読める', role: 'subject', gloss: 'can read kanji' }, { text: 'ようになった', role: 'predicate', gloss: 'have become able to', smallGloss: true, isNew: true }], translation: 'Kanji ga yomeru you ni natta.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'こんな・そんな・あんな・どんなN — "This/that kind of"',
      pattern: [{ text: 'こんな／そんな／あんな／どんな', role: 'subject' }, { text: 'N', role: 'predicate' }],
      explain: ['Demonstrative adjectives placed before a noun.'],
      samples: [{ tag: '"A problem like this is easy."', tiles: [{ text: 'こんな問題は', role: 'subject', gloss: 'a problem like this', smallGloss: true, isNew: true }, { text: '簡単だ', role: 'predicate', gloss: 'is easy' }], translation: 'Konna mondai wa kantan da.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'こんなに・そんなに・あんなに・どんなに — "To this/that extent"',
      pattern: [{ text: 'こんなに／そんなに／あんなに／どんなに', role: 'subject' }, { text: '(adj/verb)', role: 'predicate' }],
      explain: ['The adverbial versions of the demonstratives above.'],
      samples: [{ tag: '"I didn\'t think it would be this hot."', tiles: [{ text: 'こんなに暑い', role: 'subject', gloss: 'this hot', isNew: true }, { text: 'とは思わなかった', role: 'predicate', gloss: "didn't think" }], translation: 'Konna ni atsui to wa omowanakatta.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '漢字が読める', after: 'なった。', answer: 'ように', hint: '"Became able to read kanji."' },
        { before: '', after: '問題は簡単だ。', answer: 'こんな', hint: '"A problem like this."' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Bunpro — JLPT N3 grammar list (ようにする・ようになる／こんな・そんな・あんな・どんな)', 'JLPT Sensei — N3 grammar reference'],
    },
  ],

  // Advice & Commands Shelf (n3-shelf-03+n3-shelf-04)
  'n3-shelf-11': [
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 4 — Manner & advice',
      bigIdea: 'Describing HOW to do something, and giving positive advice.',
      explain: ['This shelf covers こう・そう・ああ・どうV, たほうがいい, and ないほうがいい.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'こう・そう・ああ・どうV — "This/that/how way"',
      pattern: [{ text: 'こう／そう／ああ／どう', role: 'subject' }, { text: 'V', role: 'predicate' }],
      explain: ['Manner adverbs placed before a verb.'],
      samples: [{ tag: '"If you do it this way, it\'s easy."', tiles: [{ text: 'こうすれば', role: 'subject', gloss: 'if (you do it) this way', smallGloss: true, isNew: true }, { text: '簡単です', role: 'predicate', gloss: "it's easy" }], translation: 'Kou sureba kantan desu.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'たほうがいい — "Better to do"',
      pattern: [{ text: 'Vた', role: 'subject' }, { text: 'ほうがいい', role: 'predicate' }],
      explain: ['Advice recommending an action.'],
      samples: [{ tag: '"You\'d better sleep more."', tiles: [{ text: 'もっと寝た', role: 'subject', gloss: 'sleep more' }, { text: 'ほうがいいですよ', role: 'predicate', gloss: "you'd better", isNew: true }], translation: 'Motto neta hou ga ii desu yo.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'ないほうがいい — "Better not to do"',
      pattern: [{ text: 'Vない', role: 'subject' }, { text: 'ほうがいい', role: 'predicate' }],
      explain: ['Advice against an action.'],
      samples: [{ tag: '"It\'s better not to eat late at night."', tiles: [{ text: '夜遅く食べない', role: 'subject', gloss: 'not eat late at night', smallGloss: true }, { text: 'ほうがいいです', role: 'predicate', gloss: "it's better", isNew: true }], translation: 'Yoru osoku tabenai hou ga ii desu.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: 'もっと寝た', after: 'ですよ。', answer: 'ほうがいい', hint: "You'd better sleep more." },
        { before: '夜遅く食べない', after: 'です。', answer: 'ほうがいい', hint: "It's better not to eat late." },
      ],
    },
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 4 — Commands',
      bigIdea: 'Two blunt command forms — telling someone to do something, and telling someone NOT to.',
      explain: ['This shelf covers 命令形 (imperative) and 禁止形 (prohibitive).'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '命令形 — Imperative form',
      diagramSvg: buildEndingSwapDiagram('行', 'く', 'け'),
      wireDiagram: wireEndingSwapDiagram,
      explain: ['A direct, often blunt command — used in emergencies, quotes, or by authority figures (行く → 行け, "go!"). Godan verbs change the final u-sound to an e-sound, no extra ending added. Ichidan verbs drop る and add ろ instead (食べる → 食べろ).'],
      samples: [{ tag: '"Go quickly!"', tiles: [{ text: '早く', role: 'subject', gloss: 'quickly' }, { text: '行け', role: 'predicate', gloss: 'go!', isNew: true }], translation: 'Hayaku ike!' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '禁止形 — Prohibitive form',
      pattern: [{ text: 'dictionary form', role: 'subject' }, { text: 'な', role: 'particle' }],
      explain: ['A blunt "don\'t do" command.'],
      samples: [{ tag: '"Don\'t touch it, it\'s dangerous!"', tiles: [{ text: '危ないから', role: 'subject', gloss: "it's dangerous, so", smallGloss: true }, { text: '触るな', role: 'predicate', gloss: "don't touch!", isNew: true }], translation: 'Abunai kara, sawaru na!' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '早く', after: '！', answer: '行け', altAnswers: ['いけ'], hint: '"Go quickly!" — imperative.' },
        { before: '危ないから、触る', after: '！', answer: 'な', hint: '"Don\'t touch it!" — prohibitive.' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Bunpro — JLPT N3 grammar list (こう・そう・ああ・どう／たほうがいい／命令形・禁止形)', 'imabi — imperative and prohibitive forms'],
    },
  ],

  // Question Shelf, was "Embedded Questions Shelf" (n3-shelf-05+n3-shelf-06)
  'n3-shelf-12': [
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 5 — Embedded questions & nominalizing',
      bigIdea: 'Turning a whole question or clause into something you can plug into a bigger sentence.',
      explain: ['This shelf covers かどうか, いつ・どこ・だれ〜か, and の (nominalizer/explanation).'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'かどうか — "Whether or not"',
      pattern: [{ text: 'plain form', role: 'subject' }, { text: 'かどうか', role: 'particle' }],
      explain: ['Embeds a yes/no question inside a sentence.'],
      samples: [{ tag: '"I don\'t know whether he\'s coming or not."', tiles: [{ text: '彼が来るかどうか', role: 'subject', gloss: 'whether he is coming', smallGloss: true, isNew: true }, { text: '分かりません', role: 'predicate', gloss: "don't know" }], translation: 'Kare ga kuru ka douka wakarimasen.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'いつ・どこ・だれ〜か — Embedded question',
      pattern: [{ text: 'question word ... plain form', role: 'subject' }, { text: 'か', role: 'particle' }],
      explain: ['A question word + か embeds an open question inside a sentence.'],
      samples: [{ tag: '"I haven\'t decided where to go."', tiles: [{ text: 'どこに行くか', role: 'subject', gloss: 'where to go', isNew: true }, { text: '決めていません', role: 'predicate', gloss: "haven't decided" }], translation: 'Doko ni iku ka kimete imasen.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'の（名詞化） — Nominalizer / explanation',
      pattern: [{ text: 'plain form', role: 'subject' }, { text: 'の', role: 'particle' }],
      explain: ['Turns a clause into a noun, or softens an explanation.'],
      samples: [{ tag: '"The reason I was absent yesterday is I caught a cold."', tiles: [{ text: '昨日休んだのは', role: 'subject', gloss: 'the reason I was absent', isNew: true }, { text: '風邪をひいたからです', role: 'predicate', gloss: 'is that I caught a cold' }], translation: 'Kinou yasunda no wa, kaze o hiita kara desu.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '彼が来る', after: '分かりません。', answer: 'かどうか', hint: '"Whether he\'s coming or not."' },
        { before: 'どこに行く', after: '決めていません。', answer: 'か', hint: '"Where to go."' },
      ],
    },
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 5 — Ability, senses, reasons',
      bigIdea: 'A more formal way to say "can", the difference between senses reaching you naturally vs. having the chance to use them, and two ways to give a reason.',
      explain: ['This shelf covers Vることができる, 聞こえる・聞ける／見える・見られる, and ので・のに.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Vることができる — "Can do" (formal)',
      pattern: [{ text: 'Vる', role: 'subject' }, { text: 'ことができる', role: 'predicate' }],
      explain: ['Ability or possibility, more formal than the plain potential form.'],
      samples: [{ tag: '"I am able to read kanji."', tiles: [{ text: '漢字を読む', role: 'subject', gloss: 'read kanji' }, { text: 'ことができます', role: 'predicate', gloss: 'am able to', isNew: true }], translation: 'Kanji o yomu koto ga dekimasu.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '聞こえる・聞ける／見える・見られる — Naturally reach vs. able to',
      pattern: [{ text: '聞こえる／見える', role: 'subject' }, { text: '／聞ける／見られる', role: 'predicate' }],
      explain: ['聞こえる／見える = it naturally reaches your senses; 聞ける／見られる = you have the ability/chance to.'],
      samples: [{ tag: '"I can hear the sound of the waves."', tiles: [{ text: '波の音が', role: 'subject', gloss: 'the sound of the waves', smallGloss: true }, { text: '聞こえる', role: 'predicate', gloss: 'reaches my ears', isNew: true }], translation: 'Nami no oto ga kikoeru.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'ので・のに — Since / even though',
      pattern: [{ text: 'plain form', role: 'subject' }, { text: 'ので／のに', role: 'particle' }],
      explain: ['ので = objective reason; のに = "even though/despite", often carrying surprise or complaint.'],
      samples: [{ tag: '"Even though I tried hard, I failed."', tiles: [{ text: '頑張ったのに', role: 'particle', gloss: 'even though I tried hard', smallGloss: true, isNew: true }, { text: '失敗した', role: 'predicate', gloss: 'failed' }], translation: 'Ganbatta noni, shippai shita.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '漢字を読む', after: 'できます。', answer: 'ことが', hint: '"Am able to read kanji."' },
        { before: '頑張った', after: '失敗した。', answer: 'のに', hint: '"Even though I tried hard..."' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Bunpro — JLPT N3 grammar list (かどうか／の／ことができる／聞こえる・見える／ので・のに)', 'imabi — embedded questions and potential-adjacent verbs'],
    },
  ],

  // Requests Shelf, was "Requests & Suggestions Shelf" (n3-shelf-07+n3-shelf-08)
  'n3-shelf-13': [
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 5 — Concession & requests',
      bigIdea: 'Saying "no matter what", and a whole ladder of politeness for asking someone to do something.',
      explain: ['This shelf covers でも／ても, くれ・もらえ・ください・いただけ, and てほしい・てもらいたい・ていただきたい.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'でも／ても — "Even if / no matter"',
      pattern: [{ text: 'question word', role: 'subject' }, { text: 'でも', role: 'particle' }],
      explain: ['Concessive — often paired with question words for an "any-" meaning.'],
      samples: [{ tag: '"I\'ll eat anything."', tiles: [{ text: '何でも', role: 'subject', gloss: 'anything', isNew: true }, { text: '食べます', role: 'predicate', gloss: 'will eat' }], translation: 'Nandemo tabemasu.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'くれ・もらえ・ください・いただけ — Requests, casual to formal',
      pattern: [{ text: 'Vて', role: 'subject' }, { text: 'くれる？／いただけますか', role: 'predicate' }],
      explain: ['Request forms of increasing politeness, from casual "give me" to formal "could you please".'],
      samples: [{ tag: '"Could you please help me?"', tiles: [{ text: '手伝って', role: 'subject', gloss: 'help' }, { text: 'いただけますか', role: 'predicate', gloss: 'could you please', isNew: true }], translation: 'Tetsudatte itadakemasu ka.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'てほしい・てもらいたい・ていただきたい — "Want you to do"',
      pattern: [{ text: 'Vて', role: 'subject' }, { text: 'ほしい／いただきたい', role: 'predicate' }],
      explain: ['Increasing politeness for wanting someone else to act.'],
      samples: [{ tag: '"I want you to come earlier."', tiles: [{ text: 'もっと早く来て', role: 'subject', gloss: 'come earlier' }, { text: 'ほしいです', role: 'predicate', gloss: 'want (you to)', isNew: true }], translation: 'Motto hayaku kite hoshii desu.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '何', after: '食べます。', answer: 'でも', hint: '"I\'ll eat anything."' },
        { before: '手伝って', after: 'ますか。', answer: 'いただけ', hint: '"Could you please help me?"' },
      ],
    },
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 5 — Suggesting & quoting',
      bigIdea: 'Politely suggesting an action, quoting or naming something, and stating your opinion.',
      explain: ['This shelf covers たらどう・いかがですか, と・っていう, and と思う.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'たらどう・いかがですか — "How about doing"',
      pattern: [{ text: 'Vたら', role: 'subject' }, { text: 'どうですか／いかがですか', role: 'predicate' }],
      explain: ['A suggestion; いかがですか is more polite.'],
      samples: [{ tag: '"How about going to the hospital?"', tiles: [{ text: '病院に行ったら', role: 'subject', gloss: 'if you go to the hospital', smallGloss: true, isNew: true }, { text: 'どうですか', role: 'predicate', gloss: 'how about' }], translation: 'Byouin ni ittara dou desu ka.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'と・っていう — Quoting / called',
      pattern: [{ text: 'N・plain form', role: 'subject' }, { text: 'と／っていう', role: 'particle' }],
      explain: ['Quotes a name or statement — "called..." or "that...".'],
      samples: [{ tag: '"Do you know a person called Tanaka?"', tiles: [{ text: '田中さんという', role: 'subject', gloss: 'called Tanaka', isNew: true }, { text: '人を知っていますか', role: 'predicate', gloss: 'do you know a person', smallGloss: true }], translation: 'Tanaka-san to iu hito o shitte imasu ka.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'と思う — "I think"',
      pattern: [{ text: 'plain form', role: 'subject' }, { text: 'と思う', role: 'particle' }],
      explain: ['States an opinion or thought.'],
      samples: [{ tag: '"I think it will be sunny tomorrow."', tiles: [{ text: '明日は晴れる', role: 'subject', gloss: 'it will be sunny tomorrow', smallGloss: true }, { text: 'と思います', role: 'predicate', gloss: 'I think', isNew: true }], translation: 'Ashita wa hareru to omoimasu.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '病院に行った', after: 'どうですか。', answer: 'ら', hint: '"How about going to the hospital?"' },
        { before: '明日は晴れる', after: '思います。', answer: 'と', hint: '"I think it will be sunny tomorrow."' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Bunpro — JLPT N3 grammar list (でも／くれ・もらえ・ください・いただけ／てほしい／たらどう／と思う)', 'JLPT Sensei — N3 grammar reference'],
    },
  ],

  // Intentions & Plans Shelf (n3-shelf-09)
  'n3-shelf-14': [
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 5 & 6 — Intentions and "if/when"',
      bigIdea: 'A casual "let\'s/I will", a firmer "I intend to", a softer "I\'m thinking of doing", and the most common everyday word for "if/when".',
      explain: ['This shelf covers Vよう, つもりだ, Vようと思う, and たら（過去形＋ら）.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Vよう — Bare volitional',
      pattern: [{ text: 'volitional form', role: 'subject' }],
      explain: ['Casual "let\'s/I will", used in speech or to oneself.'],
      samples: [{ tag: '"Alright, let\'s go."', tiles: [{ text: 'さあ、', role: 'subject', gloss: 'alright' }, { text: '行こう', role: 'predicate', gloss: "let's go", isNew: true }], translation: 'Saa, ikou.' }],
    },
    {
      // つもりだ — added alongside ようと思う since the shelf's own plaque
      // subtitle ("tsumori, to omou, tara") already named it, but the
      // actual grammar point had never been written (proofreading-pass
      // finding). つもりだ is the firmer, more settled-decision cousin of
      // ようと思う's tentative "thinking of doing" -- placed right before
      // it so the two intention forms sit next to each other for direct
      // contrast, same as shelf-15's ば/なら pairing does.
      type: 'grammar-intro',
      sectionLabel: 'つもりだ — "Intend to"',
      pattern: [{ text: 'Vる／Vない', role: 'subject' }, { text: 'つもりだ', role: 'predicate' }],
      explain: ['A firmer, already-decided intention -- more settled than ようと思う\'s tentative "thinking of doing". Attaches to the plain dictionary or ない form of a verb.'],
      samples: [{ tag: '"I intend to become a teacher."', tiles: [{ text: '先生になる', role: 'subject', gloss: 'become a teacher' }, { text: 'つもりです', role: 'predicate', gloss: 'intend to', isNew: true }], translation: 'Sensei ni naru tsumori desu.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Vようと思う — "Thinking of doing"',
      pattern: [{ text: 'volitional form', role: 'subject' }, { text: 'と思う', role: 'particle' }],
      explain: ['A tentative intention -- softer and less final than つもりだ.'],
      samples: [{ tag: '"I\'m thinking of studying abroad next year."', tiles: [{ text: '来年、留学しよう', role: 'subject', gloss: 'study abroad next year', smallGloss: true, isNew: true }, { text: 'と思っています', role: 'predicate', gloss: "I'm thinking of" }], translation: 'Rainen, ryuugaku shiyou to omotte imasu.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'たら（過去形＋ら） — Tara conditional',
      pattern: [{ text: 'Vた', role: 'subject' }, { text: 'ら', role: 'particle' }],
      explain: ['"If/when" — often for one-time or sequential events; the result follows naturally.'],
      samples: [{ tag: '"When I get home, I\'ll call you."', tiles: [{ text: '家に着いたら', role: 'subject', gloss: 'when I get home', isNew: true }, { text: '電話します', role: 'predicate', gloss: "I'll call" }], translation: 'Ie ni tsuitara, denwa shimasu.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '先生になる', after: '。', answer: 'つもりです', hint: '"I intend to become a teacher."' },
        { before: '来年、留学しよう', after: '思っています。', answer: 'と', hint: '"Thinking of studying abroad."' },
        { before: '家に着い', after: '電話します。', answer: 'たら', hint: '"When I get home, I\'ll call."' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Bunpro — JLPT N3 grammar list (よう／つもりだ／ようと思う／たら)', 'Tae Kim\'s Guide to Japanese Grammar — intention and たら-conditional'],
    },
  ],

  // If & When Almanac (n3-shelf-10)
  'n3-shelf-15': [
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 6 — More conditionals & inference',
      bigIdea: 'Two more ways to say "if", plus how to say something SEEMS true from evidence.',
      explain: ['This shelf covers ば・なら, と（条件）, and ようだ・みたいだ.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'ば・なら — Ba vs. nara',
      pattern: [{ text: 'Vば', role: 'subject' }, { text: '／plain form＋なら', role: 'predicate' }],
      explain: ['ば = general/hypothetical condition; なら = based on the other person\'s statement or topic ("if that\'s the case").'],
      samples: [{ tag: '"If you\'re going, let\'s go together."', tiles: [{ text: '行くなら', role: 'subject', gloss: "if you're going", isNew: true }, { text: '一緒に行きましょう', role: 'predicate', gloss: "let's go together" }], translation: 'Iku nara, issho ni ikimashou.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'と（条件） — "Whenever/if"',
      pattern: [{ text: 'plain non-past', role: 'subject' }, { text: 'と', role: 'particle' }],
      explain: ['A natural, automatic, or habitual consequence.'],
      samples: [{ tag: '"If you press the button, the door opens."', tiles: [{ text: 'ボタンを押すと', role: 'subject', gloss: 'if you press the button', smallGloss: true, isNew: true }, { text: 'ドアが開きます', role: 'predicate', gloss: 'the door opens' }], translation: 'Botan o osu to, doa ga akimasu.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'ようだ・みたいだ — "Seems / looks like"',
      pattern: [{ text: 'plain form', role: 'subject' }, { text: 'ようだ／みたいだ', role: 'predicate' }],
      explain: ['Inference from evidence; みたいだ is more casual.'],
      samples: [{ tag: '"It seems someone is there."', tiles: [{ text: '誰か', role: 'subject', gloss: 'someone' }, { text: 'いるようです', role: 'predicate', gloss: 'seems to be there', isNew: true }], translation: 'Dareka iru you desu.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '行く', after: '一緒に行きましょう。', answer: 'なら', hint: '"If you\'re going, let\'s go together."' },
        { before: 'ボタンを押す', after: 'ドアが開きます。', answer: 'と', hint: '"If you press the button..."' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Bunpro — JLPT N3 grammar list (ば・なら／と（条件）／ようだ・みたいだ)', 'imabi — conditional forms compared'],
    },
  ],

  // Degree & Tone Shelf (n3-shelf-11+n3-shelf-12)
  'n3-shelf-16': [
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 6 — Appearance & excess',
      bigIdea: 'Guessing what will probably happen, and saying something is done TOO much.',
      explain: ['This shelf covers そうだ（様態）, でしょう・だろう, and すぎる.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'そうだ（様態） — Looks like (appearance)',
      diagramSvg: buildEndingSwapDiagram('降', 'る', 'りそう'),
      wireDiagram: wireEndingSwapDiagram,
      explain: ['"Looks like it will..." based on visual appearance (降る → 降りそう, "looks like it\'ll rain"). Attaches after the same verb-ending change that builds the polite ます-form (drop/change the final u-sound), then そう instead of ます.'],
      samples: [{ tag: '"It looks like it\'s going to rain."', tiles: [{ text: '雨が', role: 'subject', gloss: 'rain' }, { text: '降りそうです', role: 'predicate', gloss: 'looks like it will fall', smallGloss: true, isNew: true }], translation: 'Ame ga furisou desu.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'でしょう・だろう — "Probably"',
      pattern: [{ text: 'plain form', role: 'subject' }, { text: 'でしょう／だろう', role: 'predicate' }],
      explain: ['Conjecture — でしょう is polite, だろう is plain.'],
      samples: [{ tag: '"It will probably rain tomorrow."', tiles: [{ text: '明日は雨', role: 'subject', gloss: 'tomorrow, rain' }, { text: 'でしょう', role: 'predicate', gloss: 'probably', isNew: true }], translation: 'Ashita wa ame deshou.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'すぎる — "Too much"',
      diagramSvg: buildEndingSwapDiagram('食べ', 'る', 'すぎる'),
      wireDiagram: wireEndingSwapDiagram,
      explain: ['"Too much" — attaches after the same ending-change that builds the polite ます-form, then すぎる instead of ます (食べる → 食べすぎる, "eat too much"). Works on adjectives the same way (高い → 高すぎる, "too expensive").'],
      samples: [{ tag: '"I ate too much."', tiles: [{ text: '食べ', role: 'subject', gloss: 'eat' }, { text: 'すぎました', role: 'predicate', gloss: 'too much', isNew: true }], translation: 'Tabesugimashita.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '雨が降り', after: 'です。', answer: 'そう', hint: '"Looks like it will rain."' },
        { before: '食べ', after: 'ました。', answer: 'すぎ', hint: '"Ate too much."' },
      ],
    },
{
      type: 'grammar-intro',
      sectionLabel: 'Grammar Set 6 — Ease, explanation, and tone',
      bigIdea: 'Saying something is easy or hard to do, giving an explanatory nuance to a statement, and the small particles that color HOW you say something.',
      explain: ['This shelf covers Vやすい／Vにくい, んです／のです, なあ・ね・よ, and かな（あ）・かしら.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Vやすい・Vにくい — Easy / hard to do',
      diagramSvg: buildEndingSwapDiagram('読', 'む', 'みやすい'),
      wireDiagram: wireEndingSwapDiagram,
      explain: ['Both attach after the same ending-change that builds the polite ます-form: やすい = easy to do (読む → 読みやすい), にくい = hard to do (書く → 書きにくい).'],
      samples: [
        { tag: '"This book is easy to read."', tiles: [{ text: 'この本は読み', role: 'subject', gloss: 'this book, to read', smallGloss: true }, { text: 'やすいです', role: 'predicate', gloss: 'easy', isNew: true }], translation: 'Kono hon wa yomiyasui desu.' },
        { tag: '"This kanji is hard to write."', tiles: [{ text: 'この漢字は書き', role: 'subject', gloss: 'this kanji, to write', smallGloss: true }, { text: 'にくいです', role: 'predicate', gloss: 'hard', isNew: true }], translation: 'Kono kanji wa kakinikui desu.' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'んです・のです — Explanatory nuance',
      pattern: [{ text: 'plain form', role: 'subject' }, { text: 'んです／のです', role: 'predicate' }],
      explain: ['んです is the casual-speech version; のです is the formal/written version — both add a "the thing is..." explanatory nuance.'],
      samples: [{ tag: '"What\'s the matter?"', tiles: [{ text: 'どうした', role: 'subject', gloss: 'what happened' }, { text: 'んですか', role: 'predicate', gloss: 'is it (that)', isNew: true }], translation: 'Doushita n desu ka.' }],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'なあ・ね・よ・かな（あ）・かしら — Sentence-final tone particles',
      pattern: [{ text: 'sentence', role: 'subject' }, { text: 'なあ／ね／よ／かな／かしら', role: 'particle' }],
      explain: ['なあ = personal feeling/exclamation; ね = seeking agreement; よ = asserting new info; かな(あ)／かしら = wondering to oneself (かしら is traditionally softer/feminine).'],
      samples: [{ tag: '"Nice weather, isn\'t it?"', tiles: [{ text: 'いい天気です', role: 'subject', gloss: 'nice weather' }, { text: 'ね', role: 'particle', gloss: "isn't it", isNew: true }], translation: 'Ii tenki desu ne.' }],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: 'この本は読み', after: 'です。', answer: 'やすい', hint: '"Easy to read."' },
        { before: 'どうした', after: 'か。', answer: 'んです', hint: '"What\'s the matter?"' },
        { before: 'いい天気です', after: '', answer: 'ね', hint: '"Nice weather, isn\'t it?"' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Bunpro — JLPT N3 grammar list (そうだ／でしょう・だろう／すぎる／やすい・にくい／んです／sentence-final particles)', 'JLPT Sensei — N3 grammar reference'],
    },
  ],

  'n3-reading-01': [
    {
      type: 'grammar-intro',
      sectionLabel: 'Reading: A Day Off',
      bigIdea: 'A short passage about a day off, using potential form, たり〜たり, and てもいい from earlier shelves.',
      explain: ['Read the passage below once for the general idea, then check the questions at the end.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '休みの日',
      explain: [
        '今日は休みです。朝はゆっくり寝ました。それから、本を読んだり音楽を聞いたりしました。',
        'Kyou wa yasumi desu. Asa wa yukkuri nemashita. Sorekara, hon o yondari ongaku o kiitari shimashita.',
        '"Today is a day off. In the morning I slept in. After that, I did things like read a book and listen to music."',
      ],
      explainAfter: [
        '午後は友達と会いました。彼女は日本語が上手に話せます。「公園で写真を撮ってもいいですか」と聞きました。',
        'Gogo wa tomodachi to aimashita. Kanojo wa nihongo ga jouzu ni hanasemasu. "Kouen de shashin o tottemo ii desu ka" to kikimashita.',
        '"In the afternoon I met a friend. She can speak Japanese well. She asked, \'May I take photos in the park?\'"',
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Comprehension check',
      intro: 'Fill in each blank based on the passage.',
      questions: [
        { before: '朝は', after: '寝ました。', answer: 'ゆっくり', hint: '"Slept in (leisurely)" in the morning.' },
        { before: '友達は日本語が上手に', after: '。', answer: '話せます', altAnswers: ['はなせます'], hint: 'Potential form — "can speak".' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Original practice passage, written for this course; grammar reused from Verb Stacks I/Obligation & Permission (potential form, たり〜たり, てもいい) — verified against Bunpro\'s JLPT N3 grammar list.'],
    },
  ],

  'n3-reading-02': [
    {
      type: 'grammar-intro',
      sectionLabel: 'Reading: The New Student',
      bigIdea: 'A passage about a new student, using giving/receiving verbs, ように, and demonstratives.',
      explain: ['Read the passage below once for the general idea, then check the questions at the end.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '新しい学生',
      explain: [
        'クラスに新しい学生が来ました。田中さんという人です。彼はまだ漢字が読めないので、私が手伝いました。',
        'Kurasu ni atarashii gakusei ga kimashita. Tanaka-san to iu hito desu. Kare wa mada kanji ga yomenai node, watashi ga tetsudaimashita.',
        '"A new student came to class. His name is Tanaka. Since he still can\'t read kanji, I helped him."',
      ],
      explainAfter: [
        '田中さんは私にお菓子をくれました。「こんなに親切にしてくれてありがとう」と言いました。',
        'Tanaka-san wa watashi ni okashi o kuremashita. "Konna ni shinsetsu ni shite kurete arigatou" to iimashita.',
        '"Tanaka gave me some snacks. He said, \'Thank you for being so kind to me.\'"',
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Comprehension check',
      intro: 'Fill in each blank based on the passage.',
      questions: [
        { before: '田中さんはまだ漢字が', after: 'ので、私が手伝いました。', answer: '読めない', altAnswers: ['よめない'], hint: 'Negative potential — "can\'t read".' },
        { before: '田中さんは私にお菓子を', after: '。', answer: 'くれました', hint: '"Gave (to me)" — くれる.' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Original practice passage, written for this course; grammar reused from Giving & Purpose (あげる・くれる・もらう, ように), Obligation & Permission (potential negative) — verified against Bunpro\'s JLPT N3 grammar list.'],
    },
  ],

  'n3-reading-03': [
    {
      type: 'grammar-intro',
      sectionLabel: 'Reading: A Letter Home',
      bigIdea: 'A short letter home, using たら conditional, ておく, and てしまう.',
      explain: ['Read the passage below once for the general idea, then check the questions at the end.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '家族への手紙',
      explain: [
        'お父さん、お母さん、元気ですか。日本に着いたら、すぐに電話します。今はまだ荷物を片付けています。',
        'Otousan, okaasan, genki desu ka. Nihon ni tsuitara, sugu ni denwa shimasu. Ima wa mada nimotsu o katazukete imasu.',
        '"Dad, Mom, are you doing well? When I arrive in Japan, I\'ll call right away. Right now I\'m still unpacking."',
      ],
      explainAfter: [
        '実は、大事な書類を家に忘れてしまいました。でも、大丈夫です。新しいのを作っておきます。',
        'Jitsu wa, daiji na shorui o ie ni wasurete shimaimashita. Demo, daijoubu desu. Atarashii no o tsukutte okimasu.',
        '"Actually, I ended up forgetting an important document at home. But it\'s fine. I\'ll prepare a new one in advance."',
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Comprehension check',
      intro: 'Fill in each blank based on the passage.',
      questions: [
        { before: '日本に着い', after: '、すぐに電話します。', answer: 'たら', hint: '"When I arrive..." — tara conditional.' },
        { before: '大事な書類を家に忘れて', after: '。', answer: 'しまいました', hint: '"Ended up forgetting" — regret nuance.' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Original practice passage, written for this course; grammar reused from Intentions & Plans (たら) and Obligation & Permission (てしまう, ておく) — verified against Bunpro\'s JLPT N3 grammar list.'],
    },
  ],

  'n3-reading-04': [
    {
      type: 'grammar-intro',
      sectionLabel: 'Reading: Lost in Kyoto',
      bigIdea: 'A short story about getting lost in Kyoto, using causative-passive, ので, and と思う.',
      explain: ['Read the passage below once for the general idea, then check the questions at the end.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '京都で迷子になった',
      explain: [
        '先週、京都へ旅行に行きました。地図が読めなかったので、道に迷ってしまいました。',
        'Senshuu, Kyouto e ryokou ni ikimashita. Chizu ga yomenakatta node, michi ni mayotte shimaimashita.',
        '"Last week I went on a trip to Kyoto. Since I couldn\'t read the map, I ended up getting lost."',
      ],
      explainAfter: [
        '親切な人に道を聞いて、私も一緒に写真を撮らせてもらいました。とても楽しい一日だったと思います。',
        'Shinsetsu na hito ni michi o kiite, watashi mo issho ni shashin o torasete moraimashita. Totemo tanoshii ichinichi datta to omoimasu.',
        '"I asked a kind person for directions, and I was also allowed to take photos together. I think it was a very fun day."',
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Comprehension check',
      intro: 'Fill in each blank based on the passage.',
      questions: [
        { before: '地図が読めなかった', after: '、道に迷ってしまいました。', answer: 'ので', hint: '"Since I couldn\'t read the map..."' },
        { before: 'とても楽しい一日だった', after: '思います。', answer: 'と', hint: '"I think it was a fun day."' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Original practice passage, written for this course; grammar reused from Verb Stacks II (causative-passive), Requests (と思う), and Advice & Commands shelves — verified against Bunpro\'s JLPT N3 grammar list.'],
    },
  ],

  'n3-vocab-press': [
    {
      type: 'grammar-intro',
      sectionLabel: 'The Composing Room',
      bigIdea: 'An old Gutenberg-style press that keeps every reference sheet from the library close at hand, ready whenever you want a paper copy.',
      explain: ['Use the list below to open or download any reference sheet -- nouns, verbs, particles, adjectives, expressions, and conjugations.'],
    },
  ],

  // The Kanji Easel prop, south of the Vocabulary Press in the right
  // column (see buildKanjiEasel) -- always-available content (kind:
  // 'npc', not gated), same reasoning as the press just above. Built via
  // the shared buildKanjiEaselPages() helper (library-scene-shared.js)
  // from N3_KANJI_EASEL_WORDS, with an explicit `note` flagging that this
  // word list is still a placeholder copy of N4's until N3 gets real
  // grammar content (see this file's own top-of-file status note).
  'kanji-easel': buildKanjiEaselPages({
    floorLabel: 'N3',
    words: N3_KANJI_EASEL_WORDS,
    note: 'This floor\'s full lesson content is still a placeholder copy of N4\'s -- this word list will be replaced once N3 gets its own real grammar shelves.',
  }),

  'n3-jukebox': [
    {
      type: 'grammar-intro',
      sectionLabel: 'Listening Jukebox',
      bigIdea: 'An old jukebox that still picks up a late-night radio broadcast -- plus a shelf of real Japanese listening practice you can open on your own device.',
      explain: ['Use the link list below to open real N3/N3-level listening practice: NHK Easy News (text and audio together), the Nihongo con Teppei podcast for beginners, and JLPT N3/N3 listening drills.', 'Or press play here first -- tonight\'s broadcast is playing now.'],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Tonight\'s broadcast',
      explain: [
        'この駅では、雨のため、電車が少し遅れています。傘を忘れた方は、駅の前の店で買うことができます。',
        'Kono eki dewa, ame no tame, densha ga sukoshi okurete imasu. Kasa o wasureta kata wa, eki no mae no mise de kau koto ga dekimasu.',
        '"At this station, because of the rain, the trains are running a little late. Those who forgot an umbrella can buy one at the shop in front of the station."',
      ],
      explainAfter: [
        '次の曲は、田中さんから、いつも笑顔をありがとうという気持ちを込めて。それでは、聞いてください。',
        'Tsugi no kyoku wa, Tanaka-san kara, itsumo egao o arigatou to iu kimochi o komete. Soredewa, kiite kudasai.',
        '"This next song comes from Tanaka-san, with the feeling of \'thank you for always smiling.\' Now, please listen."',
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Comprehension check',
      intro: 'Fill in each blank based on the broadcast.',
      questions: [
        { before: '雨の', after: '、電車が少し遅れています。', answer: 'ため', hint: '"Because of/due to" the rain.' },
        { before: '傘を忘れた方は、店で買う', after: 'できます。', answer: 'ことが', hint: '"Can do" -- koto ga dekiru.' },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Original practice passage, written for this course; grammar reused from the Obligation & Permission and Question shelves (ため, ことができる) — verified against Bunpro\'s JLPT N3 grammar list.'],
    },
  ],

  // -- Review piles (Task 3 proofreading-pass addition) -------------------
  // These 4 piles existed in BOOK_PILE_DATA/SHELF_PREREQ from the start
  // (gating shelf-05/09/13 and the Reading Room respectively) but had no
  // LESSON_CONTENT entry at all -- openRetroMenu()'s hasContent check was
  // always false for them, so clicking one just instant-completed with
  // nothing to read, unlike every one of N5's own 4 review piles. Same
  // shape as N5's review-1..4: an intro page, one 'summary' recap table
  // per shelf (Pattern/Romaji/Meaning, since N3 shelves teach grammar
  // patterns rather than N5's flat vocab lists -- 'summary' reads
  // r.meaning for its 3rd column regardless of column header, same as
  // every 'summary' page elsewhere in this file/n5-phaser-game.js), 1-2
  // short recaps of each pile's trickiest point, then a shared
  // quiz-review -> quiz-answers -> quiz-score group off that pile's own
  // REVIEW_N_QUIZ_QUESTIONS array (defined further down, alongside the
  // other lesson-content resolver helpers).
  'n3-review-1': [
    {
      type: 'grammar-intro',
      sectionLabel: 'Foundations Review',
      bigIdea: 'Before Everyday Speech, let\'s make sure Verb Stacks I/II, the Particle Reference Desk, and Special Collections actually stuck.',
      explain: [
        'This review recaps Verb Stacks I, Verb Stacks II, the Particle Reference Desk, and Special Collections -- then closes with a quiz (multiple choice + fill-in-the-blank). The quiz doesn\'t grade as you go: answer everything first, then the next page shows the answer key so you can self-check, followed by your score.',
      ],
      takeaway: 'Skim each recap, then take the quiz at the end -- no pressure, you can revisit this pile any time.',
    },
    {
      type: 'summary',
      title: 'Recap: Verb Stacks I',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: '話せます', romaji: 'hanasemasu', meaning: 'can speak (可能形, potential)' },
        { kana: '見よう', romaji: 'miyou', meaning: 'let\'s watch (意向形, volitional)' },
        { kana: '降れば', romaji: 'fureba', meaning: 'if it falls (ば形, conditional)' },
      ],
    },
    {
      type: 'summary',
      title: 'Recap: Verb Stacks II',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: '褒められた', romaji: 'homerareta', meaning: 'was praised (受身形, passive)' },
        { kana: '食べさせた', romaji: 'tabesaseta', meaning: 'made (someone) eat (使役形, causative)' },
        { kana: 'ドアが開く', romaji: 'doa ga aku', meaning: 'the door opens (自動詞, intransitive)' },
        { kana: 'ドアを開ける', romaji: 'doa o akeru', meaning: '(someone) opens the door (他動詞, transitive)' },
      ],
    },
    {
      type: 'summary',
      title: 'Recap: Particle Reference Desk',
      headers: ['Particle', 'Romaji', 'Job'],
      rows: [
        { kana: '図書館で勉強する', romaji: 'toshokan de benkyou suru', meaning: 'で -- location of an action' },
        { kana: '図書館にいる', romaji: 'toshokan ni iru', meaning: 'に -- location of existence' },
        { kana: '九時から', romaji: 'kuji kara', meaning: 'から -- starting point (place/time/reason)' },
        { kana: '友達に手紙を書く', romaji: 'tomodachi ni tegami o kaku', meaning: 'に -- target / indirect object' },
        { kana: '私も学生です', romaji: 'watashi mo gakusei desu', meaning: 'も -- also / too' },
      ],
    },
    {
      type: 'summary',
      title: 'Recap: Special Collections',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: '二つずつ', romaji: 'futatsu zutsu', meaning: 'two each (equal distribution)' },
        { kana: '大阪ほど暑くない', romaji: 'Oosaka hodo atsukunai', meaning: 'not as hot as Osaka (comparison of inferiority)' },
        { kana: 'ここでは', romaji: 'koko dewa', meaning: 'here (in particular) -- で/に + は, contrast' },
        { kana: '友達からも', romaji: 'tomodachi kara mo', meaning: 'from my friend too' },
      ],
    },
    {
      // The trickiest point in this group -- 受身形 (passive) and 使役形
      // (causative) move the SAME two people in opposite directions, and
      // are easy to swap under quiz pressure.
      type: 'grammar-intro',
      sectionLabel: 'Recap: Passive vs. Causative',
      explain: [
        '受身形 (passive) -- something is done TO you: 先生に褒められた, "I was praised BY the teacher." 使役形 (causative) -- you make/let someone else act: 野菜を食べさせた, "I made (them) eat vegetables." If English "by" fits, it\'s passive; if English "made/let" fits, it\'s causative.',
      ],
    },
    {
      type: 'quiz-review',
      sectionLabel: 'Foundations Review Quiz',
      intro: 'Answer each question, then continue to see the answer key.',
      questions: N3_REVIEW_1_QUIZ_QUESTIONS,
    },
    {
      type: 'quiz-answers',
      sectionLabel: 'Answer Key',
      questions: N3_REVIEW_1_QUIZ_QUESTIONS,
    },
    {
      type: 'quiz-score',
      title: 'Foundations Review -- Score',
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Same sources as Verb Stacks I/II and the Particle Reference Desk/Special Collections above (Bunpro\'s JLPT N3 grammar list, imabi, Tae Kim\'s Guide, JLPT Sensei) -- this pile just recaps their content.'],
    },
  ],

  'n3-review-2': [
    {
      type: 'grammar-intro',
      sectionLabel: 'Everyday Grammar Review',
      bigIdea: 'Before Giving & Purpose, let\'s make sure the Everyday Speech, Timing & Sequence, Change & Decision, and Obligation & Permission shelves actually stuck.',
      explain: [
        'This review recaps Everyday Speech, Timing & Sequence, Change & Decision, and Obligation & Permission -- then closes with a quiz. The quiz doesn\'t grade as you go: answer everything first, then check the answer key, then your score.',
      ],
      takeaway: 'Skim each recap, then take the quiz at the end -- no pressure, you can revisit this pile any time.',
    },
    {
      type: 'summary',
      title: 'Recap: Everyday Speech Shelf',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'お茶でも飲みませんか', romaji: 'ocha demo nomimasen ka', meaning: 'でも -- soft suggestion ("or something")' },
        { kana: '電車で行く', romaji: 'densha de iku', meaning: 'で -- method/means' },
        { kana: '全部で千円です', romaji: 'zenbu de sen\'en desu', meaning: 'で -- total range' },
        { kana: '三時間も待った', romaji: 'sanjikan mo matta', meaning: 'も -- surprising quantity ("as much as")' },
      ],
    },
    {
      type: 'summary',
      title: 'Recap: Timing & Sequence Shelf',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'コーヒーとか紅茶とか', romaji: 'koohii toka koucha toka', meaning: 'とか -- casual listing ("things like...")' },
        { kana: '読んだり見たりする', romaji: 'yondari mitari suru', meaning: 'たり〜たり -- representative actions' },
        { kana: '安いし、おいしいし', romaji: 'yasui shi, oishii shi', meaning: 'し〜し -- "and moreover"' },
        { kana: '出かけるところです', romaji: 'dekakeru tokoro desu', meaning: 'るところ -- about to (も ているところ = in progress, たところ = just finished)' },
        { kana: '寝ている間に', romaji: 'nete iru aida ni', meaning: 'ているあいだに -- "while"' },
        { kana: '出る時に', romaji: 'deru toki ni', meaning: '時に -- "when"' },
      ],
    },
    {
      type: 'summary',
      title: 'Recap: Change & Decision Shelf',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: '疲れて、早く寝た', romaji: 'tsukarete, hayaku neta', meaning: 'て/で -- cause leading to a natural result' },
        { kana: '靴を履いたまま', romaji: 'kutsu o haita mama', meaning: 'まま -- a state left "as is"' },
        { kana: '登ったことがある', romaji: 'nobotta koto ga aru', meaning: 'たことがある -- past experience' },
        { kana: '運動することにした', romaji: 'undou suru koto ni shita', meaning: 'ことにする -- deciding for yourself' },
        { kana: '春になる', romaji: 'haru ni naru', meaning: 'になる -- a natural change of state' },
        { kana: '転勤することになった', romaji: 'tenkin suru koto ni natta', meaning: 'ことになる -- decided by circumstance, not "me"' },
      ],
    },
    {
      type: 'summary',
      title: 'Recap: Obligation & Permission Shelf',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: '終わらせなければなりません', romaji: 'owarasenakereba narimasen', meaning: 'なければ -- "must" (formal)' },
        { kana: '撮ってもいいです', romaji: 'tottemo ii desu', meaning: 'てもいい -- permission ("may")' },
        { kana: '撮ってはいけません', romaji: 'totte wa ikemasen', meaning: 'てはいけない -- prohibition ("must not")' },
        { kana: '準備しておきます', romaji: 'junbi shite okimasu', meaning: 'ておく -- do in advance' },
        { kana: '忘れてしまった', romaji: 'wasurete shimatta', meaning: 'てしまう -- completion, often with regret' },
      ],
    },
    {
      // The trickiest point in this group -- るところ's 3 forms share the
      // same word but flip meaning entirely depending on which verb form
      // feeds into ところ.
      type: 'grammar-intro',
      sectionLabel: 'Recap: るところ vs. ているところ vs. たところ',
      explain: [
        'Same ところ, three different timings depending on what comes before it: 出かける<b>ところ</b>です ("about to go out" -- not started yet), 出かけて<b>いるところ</b>です ("in the middle of going out" -- happening now), 出かけた<b>ところ</b>です ("just went out" -- just finished). The verb form does all the work; ところ itself never changes.',
      ],
    },
    {
      type: 'quiz-review',
      sectionLabel: 'Everyday Grammar Review Quiz',
      intro: 'Answer each question, then continue to see the answer key.',
      questions: N3_REVIEW_2_QUIZ_QUESTIONS,
    },
    {
      type: 'quiz-answers',
      sectionLabel: 'Answer Key',
      questions: N3_REVIEW_2_QUIZ_QUESTIONS,
    },
    {
      type: 'quiz-score',
      title: 'Everyday Grammar Review -- Score',
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Same sources as the Everyday Speech, Timing & Sequence, Change & Decision, and Obligation & Permission shelves above (Bunpro\'s JLPT N3 grammar list, imabi, JLPT Sensei, Tae Kim\'s Guide) -- this pile just recaps their content.'],
    },
  ],

  'n3-review-3': [
    {
      type: 'grammar-intro',
      sectionLabel: 'Nuance & Manners Review',
      bigIdea: 'Before Requests, let\'s make sure Giving & Purpose, the Effort Shelf, Advice & Commands, and the Question Shelf actually stuck.',
      explain: [
        'This review recaps Giving & Purpose, the Effort Shelf, Advice & Commands, and the Question Shelf -- then closes with a quiz. The quiz doesn\'t grade as you go: answer everything first, then check the answer key, then your score.',
      ],
      takeaway: 'Skim each recap, then take the quiz at the end -- no pressure, you can revisit this pile any time.',
    },
    {
      type: 'summary',
      title: 'Recap: Giving & Purpose Shelf',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: '本をくれた', romaji: 'hon o kureta', meaning: 'くれる -- someone gives TO me' },
        { kana: '健康のために', romaji: 'kenkou no tame ni', meaning: 'のために -- "for the sake of / in order to"' },
        { kana: '忘れないように', romaji: 'wasurenai you ni', meaning: 'ように -- "so that" (a goal)' },
      ],
    },
    {
      type: 'summary',
      title: 'Recap: Effort Shelf',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: '読めるようになった', romaji: 'yomeru you ni natta', meaning: 'ようになる -- reach a new ability over time' },
        { kana: 'こんな問題', romaji: 'konna mondai', meaning: 'こんな -- "this kind of" (+ noun)' },
        { kana: 'こんなに暑い', romaji: 'konna ni atsui', meaning: 'こんなに -- "to this extent" (adverbial)' },
      ],
    },
    {
      type: 'summary',
      title: 'Recap: Advice & Commands Shelf',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'こうすれば簡単です', romaji: 'kou sureba kantan desu', meaning: 'こう -- "this way" (manner)' },
        { kana: '寝たほうがいいですよ', romaji: 'neta hou ga ii desu yo', meaning: 'たほうがいい -- "you\'d better"' },
        { kana: '食べないほうがいいです', romaji: 'tabenai hou ga ii desu', meaning: 'ないほうがいい -- "better not to"' },
        { kana: '行け', romaji: 'ike', meaning: '命令形 -- blunt imperative ("go!")' },
        { kana: '触るな', romaji: 'sawaru na', meaning: '禁止形 -- blunt prohibitive ("don\'t touch!")' },
      ],
    },
    {
      type: 'summary',
      title: 'Recap: Question Shelf',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: '来るかどうか', romaji: 'kuru ka douka', meaning: 'かどうか -- "whether or not"' },
        { kana: 'どこに行くか', romaji: 'doko ni iku ka', meaning: '疑問詞＋か -- embedded question' },
        { kana: '休んだのは', romaji: 'yasunda no wa', meaning: 'の -- nominalizer / softened explanation' },
        { kana: '読むことができます', romaji: 'yomu koto ga dekimasu', meaning: 'ことができる -- "can do" (formal)' },
        { kana: '波の音が聞こえる', romaji: 'nami no oto ga kikoeru', meaning: '聞こえる -- reaches your ears naturally' },
        { kana: '頑張ったのに', romaji: 'ganbatta noni', meaning: 'のに -- "even though" (surprise/complaint)' },
      ],
    },
    {
      // The trickiest point in this group -- 聞こえる/見える vs 聞ける/
      // 見られる is the single most commonly confused N3 pair, since all 4
      // translate to "can hear/see" in English but split on a completely
      // different axis (automatic vs. having the ability/opportunity).
      type: 'grammar-intro',
      sectionLabel: 'Recap: 聞こえる・見える vs. 聞ける・見られる',
      explain: [
        '聞こえる/見える -- the sound or sight reaches you on its own, no effort involved: 波の音が聞こえる, "the sound of the waves reaches my ears." 聞ける/見られる -- you HAVE the ability or chance to: このラジオでニュースが聞ける, "I can listen to the news on this radio (it\'s capable of that)." Both pairs are potential-shaped, but only the second pair is really "potential form" in the grammatical sense -- 聞こえる/見える are their own separate verbs.',
      ],
    },
    {
      type: 'quiz-review',
      sectionLabel: 'Nuance & Manners Review Quiz',
      intro: 'Answer each question, then continue to see the answer key.',
      questions: N3_REVIEW_3_QUIZ_QUESTIONS,
    },
    {
      type: 'quiz-answers',
      sectionLabel: 'Answer Key',
      questions: N3_REVIEW_3_QUIZ_QUESTIONS,
    },
    {
      type: 'quiz-score',
      title: 'Nuance & Manners Review -- Score',
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Same sources as Giving & Purpose, the Effort Shelf, Advice & Commands, and the Question Shelf above (Bunpro\'s JLPT N3 grammar list, imabi, JLPT Sensei) -- this pile just recaps their content.'],
    },
  ],

  'n3-review-4': [
    {
      type: 'grammar-intro',
      sectionLabel: 'Refinement Review',
      bigIdea: 'Before the Reading Room, let\'s make sure Requests, Intentions & Plans, the If & When Almanac, and the Degree & Tone Shelf actually stuck.',
      explain: [
        'This review recaps Requests, Intentions & Plans, the If & When Almanac, and the Degree & Tone Shelf -- then closes with a quiz. The quiz doesn\'t grade as you go: answer everything first, then check the answer key, then your score.',
      ],
      takeaway: 'Skim each recap, then take the quiz at the end -- this is the last review before the Reading Room.',
    },
    {
      type: 'summary',
      title: 'Recap: Requests Shelf',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: '何でも食べます', romaji: 'nandemo tabemasu', meaning: 'でも -- concessive ("any-")' },
        { kana: '手伝っていただけますか', romaji: 'tetsudatte itadakemasu ka', meaning: 'request ladder -- casual くれる? to formal いただけますか' },
        { kana: '来てほしいです', romaji: 'kite hoshii desu', meaning: 'てほしい -- "want you to do"' },
        { kana: '行ったらどうですか', romaji: 'ittara dou desu ka', meaning: 'たらどう -- suggestion ("how about")' },
        { kana: '田中さんという人', romaji: 'Tanaka-san to iu hito', meaning: 'と／っていう -- quoting / "called..."' },
        { kana: '晴れると思います', romaji: 'hareru to omoimasu', meaning: 'と思う -- stating an opinion' },
      ],
    },
    {
      type: 'summary',
      title: 'Recap: Intentions & Plans Shelf',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: '行こう', romaji: 'ikou', meaning: 'Vよう -- bare volitional ("let\'s/I will")' },
        { kana: '先生になるつもりです', romaji: 'sensei ni naru tsumori desu', meaning: 'つもりだ -- a firmer, settled intention' },
        { kana: '留学しようと思っています', romaji: 'ryuugaku shiyou to omotte imasu', meaning: 'ようと思う -- a softer, tentative intention' },
        { kana: '着いたら電話します', romaji: 'tsuitara denwa shimasu', meaning: 'たら -- "if/when" (sequential events)' },
      ],
    },
    {
      type: 'summary',
      title: 'Recap: If & When Almanac',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: '行くなら', romaji: 'iku nara', meaning: 'なら -- "if that\'s the case" (based on what was just said)' },
        { kana: '押すとドアが開きます', romaji: 'osu to doa ga akimasu', meaning: 'と -- automatic/habitual consequence' },
        { kana: '誰かいるようです', romaji: 'dareka iru you desu', meaning: 'ようだ／みたいだ -- inference from evidence' },
      ],
    },
    {
      type: 'summary',
      title: 'Recap: Degree & Tone Shelf',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: '降りそうです', romaji: 'furisou desu', meaning: 'そうだ（様態） -- looks like, from appearance' },
        { kana: '雨でしょう', romaji: 'ame deshou', meaning: 'でしょう／だろう -- conjecture ("probably")' },
        { kana: '食べすぎました', romaji: 'tabesugimashita', meaning: 'すぎる -- "too much"' },
        { kana: '読みやすいです', romaji: 'yomiyasui desu', meaning: 'やすい／にくい -- easy/hard to do' },
        { kana: 'どうしたんですか', romaji: 'doushita n desu ka', meaning: 'んです／のです -- explanatory nuance' },
        { kana: 'いい天気ですね', romaji: 'ii tenki desu ne', meaning: 'tone particles -- ね／よ／なあ／かな／かしら' },
      ],
    },
    {
      // The trickiest point in this group -- ば/なら/と all translate to
      // English "if", but each one answers a different question about
      // WHEN the condition is set up.
      type: 'grammar-intro',
      sectionLabel: 'Recap: ば vs. なら vs. と',
      explain: [
        'All three mean "if" in English, but split on timing and context: ば is a general, hypothetical condition (読めば, "if [you] read"); なら reacts to something already said or already true ("行くなら", "if that\'s the case, [you\'re] going..."); と describes an automatic or habitual result (押すと開きます, "press it and it opens, every time"). なら is the one to reach for when you\'re responding to someone else\'s statement, not setting up a hypothetical of your own.',
      ],
    },
    {
      type: 'quiz-review',
      sectionLabel: 'Refinement Review Quiz',
      intro: 'Answer each question, then continue to see the answer key.',
      questions: N3_REVIEW_4_QUIZ_QUESTIONS,
    },
    {
      type: 'quiz-answers',
      sectionLabel: 'Answer Key',
      questions: N3_REVIEW_4_QUIZ_QUESTIONS,
    },
    {
      type: 'quiz-score',
      title: 'Refinement Review -- Score',
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Sources',
      explain: ['Same sources as Requests, Intentions & Plans, the If & When Almanac, and the Degree & Tone Shelf above (Bunpro\'s JLPT N3 grammar list, imabi, Tae Kim\'s Guide, JLPT Sensei) -- this pile just recaps their content.'],
    },
  ],

};

// -- Lesson-content resolver helpers (same pattern as the Task 6 comment
// block above createBookshelfLabel/buildShelfTrinketAnim/
// drawShelfCompleteTexture) --------------------------------------------
// library-scene-shared.js's openRetroMenu()/startLesson() call these three
// functions by bare name (appendGreetingSummary, resolveConversationTurns,
// resolveDynamicDiagrams) unconditionally whenever a shelf/pile has
// LESSON_CONTENT — they were unreachable while LESSON_CONTENT was the
// Task-7 empty stub (hasContent was always false), so their absence from
// this file went unnoticed until this task actually populated
// LESSON_CONTENT. n3-dashboard.html does NOT load n5-phaser-game.js (only
// library-scene-shared.js), so these generic, scene-only helpers aren't
// reachable as bare identifiers here either — copied verbatim from
// n5-phaser-game.js (around its appendGreetingSummary/
// resolveConversationTurns/resolveDynamicDiagrams definitions) for the
// same reason as the shelf-decoration helpers above. None of this floor's
// LESSON_CONTENT this pass uses 'conversation'-type pages, so
// resolveConversationTurns' ACTION_SPRITE_PATHS lookup is never reached —
// kept byte-for-byte identical to the N5 version anyway so a future
// 'conversation' page here behaves the same way N5's do (at which point
// ACTION_SPRITE_PATHS would also need to be added to this file). Same
// story for furigana(): lesson-box.js's 'summary' page branch calls it
// unconditionally on every row (even rows with no `reading` field), and
// its own comment says it's "defined in n5-phaser-game.js, safe to call
// here since this page only ever loads alongside it" — that assumption
// doesn't hold for n3-dashboard.html, so it's copied verbatim below too;
// every one of this pass's 3 flagship shelves ends in a 'summary' page,
// so this one is not a someday-future gap like the conversation/diagram
// helpers above — it's hit immediately.

// Builds the lesson-end recap page (LessonBox type: 'summary') from
// whatever 'greeting' pages a lesson has, and appends it — generic to
// any lesson's page array, not specific to any one shelf, so future
// greeting-type lessons get the same recap for free. Lessons with no
// greeting pages come back unchanged (no summary appended).
function appendGreetingSummary(pages, lessonTitle) {
  const greetings = pages.filter((p) => p.type === 'greeting');
  if (greetings.length === 0) return pages;
  const summaryPage = {
    type: 'summary',
    title: `Summary: ${lessonTitle}`,
    headers: ['Phrase', 'Romaji', 'Meaning'],
    rows: greetings.map((p) => ({
      kana: p.kana,
      romaji: p.romaji,
      meaning: p.meaning
    })),
  };
  return [...pages, summaryPage];
}

// Per-action, per-color sprite strips for LessonBox 'conversation' pages
// (see resolveConversationTurns below) — copied verbatim from
// n5-phaser-game.js (its own ACTION_SPRITE_PATHS, near
// resolveConversationTurns there) for the same reason as the resolver
// functions themselves: no N3 lesson uses a 'conversation' page yet, so
// this was an unreached ReferenceError waiting for the first one — see
// the comment block above appendGreetingSummary. Keep in sync with N5's
// copy if either ever changes (new action, new color, new asset path).
const ACTION_SPRITE_PATHS = {
  meow: {
    orange: '../../assets/images/avatars/talk-orange-64x64.png',
    black: '../../assets/images/avatars/talk-black-64x64.png',
    white: '../../assets/images/avatars/talk-white-64x64.png',
  },
  scratch: {
    orange: '../../assets/images/avatars/scratch-orange-64x64.png',
    black: '../../assets/images/avatars/scratch-black-64x64.png',
    white: '../../assets/images/avatars/scratch-white-64x64.png',
  },
  tailwagFront: {
    orange: '../../assets/images/avatars/tailwag-orange-64x64.png',
    black: '../../assets/images/avatars/tailwag-black-64x64.png',
    white: '../../assets/images/avatars/tailwag-white-64x64.png',
  },
  tailwagLeft: {
    orange: '../../assets/images/avatars/tailwagleft-orange-64x64.png',
    black: '../../assets/images/avatars/tailwagleft-black-64x64.png',
    white: '../../assets/images/avatars/tailwagleft-white-64x64.png',
  },
  tailwagRight: {
    orange: '../../assets/images/avatars/tailwagright-orange-64x64.png',
    black: '../../assets/images/avatars/tailwagright-black-64x64.png',
    white: '../../assets/images/avatars/tailwagright-white-64x64.png',
  },
};

// Resolves each 'conversation' page's turns to an actual spritePath —
// LESSON_CONTENT only declares { speaker: 'sensei'|'player', action, ... }
// since it's static data with no knowledge of which cat color the current
// player picked. 'player' turns use the player's own selected color;
// 'sensei' turns use a fixed color distinct from it (Neko-sensei isn't
// the player's cat, so she shouldn't share its color and become
// indistinguishable — falls back to black when the player is also
// orange). Lessons with no 'conversation' pages come back unchanged.
function resolveConversationTurns(pages, playerColorId) {
  const senseiColorId = playerColorId === 'orange' ? 'black' : 'orange';
  return pages.map((page) => {
    if (page.type !== 'conversation') return page;
    return {
      ...page,
      turns: page.turns.map((t) => {
        const colorId = t.speaker === 'player' ? playerColorId : senseiColorId;
        return {
          ...t,
          spritePath: ACTION_SPRITE_PATHS[t.action][colorId]
        };
      }),
    };
  });
}

// Resolves any 'grammar-intro' page's diagramSvg field when authored as a
// (playerColorId, senseiColorId) => string function instead of a static
// string — pages with a static string diagramSvg pass through unchanged.
function resolveDynamicDiagrams(pages, playerColorId) {
  const senseiColorId = playerColorId === 'orange' ? 'black' : 'orange';
  return pages.map((page) => {
    if (typeof page.diagramSvg !== 'function') return page;
    return {
      ...page,
      diagramSvg: page.diagramSvg(playerColorId, senseiColorId)
    };
  });
}

// -- Claw-slash ending-swap diagram (conjugation pages) ------------------
// Replaces the old plain `pattern:` chip ("る-verb stem / られる") on grammar
// points that are genuinely a single verb ending getting dropped and
// replaced by a new one (potential/volitional/passive/causative/ba-form/
// imperative/etc.) — per explicit feedback: no "stem" wording anywhere in
// the diagram itself, and the dropped ending should visibly get clawed
// through and fall away instead of silently vanishing in a static
// two-chip line. NOT used for grammar points that attach a NEW suffix
// with nothing dropped (禁止形's bare な, e.g.) or that offer several
// parallel alternative endings with no single "this becomes that"
// transformation (なければ／なくては／ないと, てもいい／なくてもいい／てはいけない,
// でしょう／だろう, んです／のです) — those keep the plain `pattern:` line,
// since the claw-slash metaphor only makes sense for an actual swap.
// Call as page.diagramSvg (returns the HTML string) and
// page.wireDiagram: wireEndingSwapDiagram (the animation hookup below) —
// same two-field contract every other interactive diagramSvg page in
// this file already uses (see resolveDynamicDiagrams above).
function buildEndingSwapDiagram(stem, oldEnding, newEnding) {
  return `
    <div class="lesson-box__pattern-line lesson-box__clawform">
      <span class="lesson-box__clawform-stem">${stem}</span><span class="lesson-box__clawform-old" data-claw-old>${oldEnding}<svg class="lesson-box__clawform-slash" data-claw-slash viewBox="0 0 40 40"><line x1="4" y1="34" x2="34" y2="4"></line><line x1="10" y1="38" x2="38" y2="10"></line></svg></span>
      <span class="lesson-box__clawform-arrow">&#8594;</span>
      <span class="lesson-box__clawform-stem">${stem}</span><span class="lesson-box__clawform-new" data-claw-new>${newEnding}</span>
    </div>
    <button type="button" class="lesson-box__clawform-replay" data-claw-replay>&#8635; watch again</button>
  `;
}
// Auto-plays once when the page renders (called generically by
// lesson-box.js's render() right after it builds the page's HTML — see
// its own "Opt-in hook for any page... whose diagramSvg markup needs
// live JS interactivity" comment), then stays replayable via the small
// button for reinforcement. Every listener stopPropagation()s per that
// same comment's requirement, so replaying never accidentally advances
// the page.
function wireEndingSwapDiagram(container) {
  const oldEl = container.querySelector('[data-claw-old]');
  const newEl = container.querySelector('[data-claw-new]');
  const slashEl = container.querySelector('[data-claw-slash]');
  const replayBtn = container.querySelector('[data-claw-replay]');
  if (!oldEl || !newEl) return;
  const play = () => {
    oldEl.classList.remove('is-slashed');
    newEl.classList.remove('is-in');
    if (slashEl) slashEl.classList.remove('is-drawn');
    void oldEl.offsetWidth; // force reflow so re-adding these classes restarts the CSS transitions on replay
    requestAnimationFrame(() => {
      if (slashEl) slashEl.classList.add('is-drawn');
      setTimeout(() => oldEl.classList.add('is-slashed'), 200);
      setTimeout(() => newEl.classList.add('is-in'), 480);
    });
  };
  play();
  if (replayBtn) {
    replayBtn.addEventListener('click', (e) => { e.stopPropagation(); play(); });
  }
}

// -- Two-portal particle-comparison diagram (grammar points that contrast
// TWO particles/patterns sharing the same kind of situation but different
// meaning — で vs に location, and reusable for any other such pair: は vs
// が, に vs へ, etc.) — per explicit feedback on the で/に mockups ("i like
// the two portals, let's do that one... also the portals must be used to
// other particles that needs comparison"). One word flies into whichever
// portal fits it, demonstrating the contrast instead of just stating it in
// prose; the two buttons let the player replay either direction on demand.
// Left/right portal colors are a fixed generic gold/blue contrast (see
// .lesson-box__portaldiagram* in lesson-box.css) reused for every particle
// pair this is applied to — not tied to any single particle's "meaning" —
// so any new pair can reuse the same component with zero CSS changes.
// Call as page.diagramSvg: buildParticlePortalDiagram({...}) and
// page.wireDiagram: wireParticlePortalDiagram — same two-field contract as
// buildEndingSwapDiagram/wireEndingSwapDiagram above.
function buildParticlePortalDiagram(config) {
  const { leftParticle, leftTag, leftWord, rightParticle, rightTag, rightWord } = config;
  return `
    <div class="lesson-box__portaldiagram" data-portal-root data-left-word="${leftWord}" data-right-word="${rightWord}">
      <div class="lesson-box__portaldiagram-portal" data-portal-side="left">
        <span class="lesson-box__portaldiagram-particle">${leftParticle}</span>
        <span class="lesson-box__portaldiagram-tag">${leftTag}</span>
      </div>
      <span class="lesson-box__portaldiagram-word" data-portal-word>${leftWord}</span>
      <div class="lesson-box__portaldiagram-portal lesson-box__portaldiagram-portal--right" data-portal-side="right">
        <span class="lesson-box__portaldiagram-particle">${rightParticle}</span>
        <span class="lesson-box__portaldiagram-tag">${rightTag}</span>
      </div>
    </div>
    <div class="lesson-box__portaldiagram-buttons">
      <button type="button" class="lesson-box__portaldiagram-btn" data-portal-btn="left">&#8592; try ${leftWord}</button>
      <button type="button" class="lesson-box__portaldiagram-btn" data-portal-btn="right">try ${rightWord} &#8594;</button>
    </div>
  `;
}
// Auto-plays a short left-then-right demo once when the page renders
// (called generically by lesson-box.js's render(), same hook
// wireEndingSwapDiagram uses), then stays replayable via the two buttons.
// Every listener stopPropagation()s so replaying never advances the page.
function wireParticlePortalDiagram(container) {
  const root = container.querySelector('[data-portal-root]');
  const wordEl = container.querySelector('[data-portal-word]');
  if (!root || !wordEl) return;
  const leftWord = root.getAttribute('data-left-word');
  const rightWord = root.getAttribute('data-right-word');
  const fly = (side) => {
    wordEl.classList.remove('is-flying-left', 'is-flying-right');
    void wordEl.offsetWidth; // force reflow so replaying restarts the CSS transition
    wordEl.textContent = side === 'left' ? leftWord : rightWord;
    requestAnimationFrame(() => {
      wordEl.classList.add(side === 'left' ? 'is-flying-left' : 'is-flying-right');
    });
  };
  setTimeout(() => fly('left'), 300);
  setTimeout(() => fly('right'), 1300);
  container.querySelectorAll('[data-portal-btn]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      fly(btn.getAttribute('data-portal-btn'));
    });
  });
}

// -- Branching-path comparison diagram (grammar points that contrast
// THREE (or more) options sharing the same casual "there's more I'm not
// saying" register but each fitting a different KIND of thing being
// listed — とか (nouns/things) vs たり〜たり (actions) vs し (reasons) is
// the first use, chosen from 5 mockup concepts shown to the user ("i
// like the branching path, let's do that one"). Unlike the two-portal
// component (exactly 2 sides, auto-plays both), this is player-driven:
// nothing is pre-selected, since the whole point is the player actively
// asking "what am I listing?" and picking the branch themselves rather
// than watching a demo. Reusable for any future 3-way (or more) casual
// register comparison — just pass more/fewer `branches`.
// Call as page.diagramSvg: buildBranchingPathDiagram({...}) and
// page.wireDiagram: wireBranchingPathDiagram — same two-field contract
// as buildEndingSwapDiagram/buildParticlePortalDiagram above.
function buildBranchingPathDiagram(config) {
  const { question, branches } = config;
  return `
    <div class="lesson-box__branchdiagram">
      <div class="lesson-box__branchdiagram-question">${question}</div>
      <div class="lesson-box__branchdiagram-branches">
        ${branches.map((b) => `
          <button type="button" class="lesson-box__branchdiagram-btn role-${b.role}" data-branch-btn data-branch-pattern="${b.pattern}" data-branch-example="${b.example}">${b.label}</button>
        `).join('')}
      </div>
      <div class="lesson-box__branchdiagram-reveal" data-branch-reveal>${branches[0].placeholder || 'Click a branch above.'}</div>
    </div>
  `;
}
// No auto-play — the player clicks a branch to explore it, at their own
// pace, in any order. Every listener stopPropagation()s so clicking a
// branch never accidentally advances the page.
function wireBranchingPathDiagram(container) {
  const buttons = container.querySelectorAll('[data-branch-btn]');
  const reveal = container.querySelector('[data-branch-reveal]');
  if (!buttons.length || !reveal) return;
  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      buttons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      reveal.innerHTML = `<span class="lesson-box__branchdiagram-pattern">${btn.getAttribute('data-branch-pattern')}</span><span class="lesson-box__branchdiagram-example">${btn.getAttribute('data-branch-example')}</span>`;
    });
  });
}

// Shared furigana helper — wraps a kanji string with its kana reading as
// native <ruby>/<rt> (styled in lesson-box.css, scoped to .lesson-box), so
// every diagram/table that shows a kanji word can add its reading with
// one call instead of hand-writing the ruby markup each time. Falls back
// to the bare word when no reading is given (kana-only words like レストラン
// don't need one).
function furigana(word, reading) {
  return reading ? `<ruby>${word}<rt>${reading}</rt></ruby>` : word;
}

// N3_REVIEW_1..4_QUIZ_QUESTIONS used to live here (right after furigana())
// -- moved above LESSON_CONTENT near the top of this file, since
// LESSON_CONTENT's own object literal reads them by bare name and a
// `const` declared textually AFTER the code that reads it throws "Cannot
// access before initialization" the instant a real browser loads this
// file (a temporal-dead-zone bug node --check's syntax-only validation
// never catches). See the comment above their new location for the full
// explanation.

// cropJukeboxTexture moved to library-scene-shared.js (Task: jukebox in
// every floor's hall, N3/N3/N5 alike) — reusable now that more than one
// scene needs the same crop, instead of a copy per file.

// -- Layout constants: positioning for shelves, piles, exam gate (Task 4) ----
// North (top) = deeper into the building, toward a future N2 stub (not
// built this pass). South (bottom) = arrival point from N5's
// staircase. Mirrors N5's own spawn-south / stairs-north shape (see
// LAYOUT's doc comment in n5-phaser-game.js) at N3/N3's larger scale.
// leftColX = N3 shelves throughout every row; rightColX = N3 shelves
// throughout every row (not arbitrary sub-columns of one topic, like
// N5's shape — a real per-side split, per explicit feedback). Y values
// are a first pass — expect to retune them live against actual
// rendered shelf/furniture sizes, exactly as every N5 row/gap constant
// was tuned over many rounds (see that file's own comments for
// precedent) — this is normal for this codebase, not a gap in this plan.
//
// shelfW/shelfH used to be a fixed 87x64 box with the shelf art
// (ASSET_RECTS.shelfLocked/shelfFilled*, native ~88x120-139, a tall
// portrait crop) forced into it via non-uniform setDisplaySize — that
// stretch squashed the art to about half its real height while keeping
// nearly full width, flattening it into a near-featureless strip. Per
// explicit follow-up feedback (with the real libassetpack-tiled.png
// crop shown as reference), shelfH/shelfW are now DERIVED from the
// art's real proportions at a fixed target height, same approach
// n5-phaser-game.js's own SHELF_SCALE takes (LAYOUT.shelfW/shelfH there
// are likewise pre-scaled, not stretched at render time — see that
// file's buildShelves() comment).
//
// Scaled off the TALLEST of the 4 crops (shelfFilled2, 139 tall), not
// the locked crop (120) — all 4 share setScale() at render time (see
// buildShelves()'s own comment), so sizing off the shorter locked crop
// would only bound the LOCKED state; once a shelf actually unlocks and
// swaps to a filled texture, it would render taller than shelfH and
// eat into the row gap below it. Scaling off the tallest crop makes
// shelfH a true ceiling for every state a shelf can be in.
//
// 100 is the tallest this ceiling can be without any wing group's
// second sub-row colliding with the next wing group's first row in the
// same column — verified by construction below (wing3→wing2 and
// wing2→wing1 both leave a ~17px gap at this height, worst-case-height
// shelves on both sides included; every other neighboring gap in the
// file was already generous enough not to bind).
const shelfScaleSourceH = Math.max(
  ASSET_RECTS.shelfLocked.h, ASSET_RECTS.shelfFilled1.h, ASSET_RECTS.shelfFilled2.h, ASSET_RECTS.shelfFilled3.h
);
const shelfScale = 100 / shelfScaleSourceH;
const shelfW = ASSET_RECTS.shelfLocked.w * shelfScale; // all 4 crops share the same 88 width
const shelfH = shelfScaleSourceH * shelfScale; // = 100 by construction — the true ceiling, not just the locked crop's rendered size
// leftColX/rightColX: mirror formula (rightColX = WORLD_W - x - shelfW,
// applied to leftColX in that order) is what actually keeps the atrium
// symmetric — WORLD_W above was chosen specifically so this mirror
// lands the right column exactly where the atrium's own left/right
// symmetry expects it. Don't hand-edit one side without recomputing
// the other from this same formula.
const leftColX = [70, 167];
const rightColX = [WORLD_W - leftColX[1] - shelfW, WORLD_W - leftColX[0] - shelfW];
const rowStep = shelfH + 5; // vertical gap between two shelf rows in the same 2x2 group

// Smaller Y = further north (deeper in). N3's shelves sit in the SAME
// rows as N3's (just the right column) — visible-but-locked the whole
// time, same as seeing a locked door before you have the key.
//
// Three 4-shelf groups per side, each its own 2x2 grid with its own
// review pile — matches N5's own "1 review pile per 4 shelves" cadence
// exactly (see n5-phaser-game.js's BOOK_PILE_DATA/SHELF_PREREQ).
// North-to-south (deepest group first): wing3 (shelves 09-12, nearest
// the N2/N1 gates) -> review-3 -> wing2 (05-08) -> review-2 -> wing1
// (01-04, nearest entry) -> review-1... walking order from spawn is the
// reverse: review-1 gates wing2, review-2 gates wing3, review-3 just
// gates n3-exam-gate (no further shelf group).
//
// All Y values below were rederived (not just proportionally scaled)
// from a full gap-by-gap breakdown of the old layout, shrinking every
// pure-floor-space gap by a single ratio (R = 12-tile target ÷ old
// stairs-to-shelf distance) while leaving every sprite's own footprint
// (shelfH, pile/gate heights) untouched — see this session's design
// discussion for the full derivation. Verified by construction to leave
// a positive gap between every consecutive pair.
//
// Each wing's [0] (row 1, north) stayed exactly where it was; only [1]
// (row 2, south) now derives from rowStep instead of being a separate
// hand-picked number — it must track shelfH's enlargement (see this
// const block's own comment above) or row 2 would overlap row 1.
// leftColX/rightColX are unaffected (shelfW actually shrank, from 87 to
// ~73, so column spacing has MORE slack than before, not less).
const wing3RowY = [442, 442 + rowStep]; // Vocabulary Press's row (deepest, was Reading Room)
const review3Y = 385; // unused since the N3-removal rewrite -- kept only because LAYOUT still exports it
// Gap to wing2 widened from ~18px to ~70px (was wing2RowY=664, review2Y=593)
// -- see GRID_ROWS's own comment for why.
const wing2RowY = [717, 717 + rowStep]; // Reading Room I-IV (was shelf09-16, reassigned this pass)
const review2Y = 682; // unused -- Reading Room/Press aren't review-gated, so nothing sits in this gap anymore
// Gap to wing1 widened the same way (was wing1RowY=887, review1Y=815).
const wing1RowY = [992, 992 + rowStep]; // shelves 09-16 (2 four-shelf groups, left+right)
const review1Y = 957; // n3-review-4's position -- gates n3-reading-01
const centerpieceY = 1062; // no longer used (the clock centerpiece was removed this session) — kept only because LAYOUT still exports it and nothing has needed cleanup yet
// wing4RowY — reassigned this pass (was empty except the press) to hold
// shelf01-08 instead, since it's the band closest to the entry and having
// it sit empty was leaving a big dead room right where a player arrives.
// Reading Room moved to wing2RowY and the press moved to wing3RowY (see
// createMezzanineShelfPositions()/buildVocabPressStation()) to make room.
const wing4RowY = [1287, 1287 + rowStep]; // shelves 01-08 (2 four-shelf groups, left+right), nearest entry
// Gap between wing4's band (shelf01-08) and wing1's band (shelf09-16) --
// previously unnamed since nothing needed to sit here (wing4 held only
// the press before this reorder). Midpoint of the existing ~90px gap.
const reviewGateSouthY = 1242; // n3-review-2's position -- gates n3-shelf-09
// Player spawn — moved into the literal southwest corner per explicit
// follow-up feedback (flush against both the west wall and the south
// wall, matching the annotated screenshot), just a few pixels north of
// the stairs landing itself. NOTE: this REOPENS the "exactly 12 tiles
// from stairs to first shelf" constraint from the map-shrink pass —
// the distance from here to wing1RowY[1] is no longer 192px/12 tiles
// (it's now ~330px/~20.6 tiles). Flagged, not silently dropped — see
// this session's report for the tradeoff; ask if wing1 should move
// closer to restore the exact 12-tile distance from this new spawn.
// +128 this pass (was 1633) — GRID_ROWS grew by 8 tiles (128px) to widen
// the wing1<->wing2/wing2<->wing3 gaps (see GRID_ROWS's own comment);
// this hand-picked absolute doesn't auto-follow GRID_ROWS the way
// buildFurniture()'s rug anchor does, so it's shifted by the exact same
// amount to stay flush against the (now further south) south wall.
const entryY = 1761;
const entryX = 61; // centered on the arrival rug's own footprint (x:16-106, see buildFurniture)

// Atrium bounding rect — was local to buildAtrium(); promoted to LAYOUT
// since the C-shape wing walls (buildWingWalls()) and the rope-and-brass
// fence (buildAtriumFence()) both need these same bounds to align their
// geometry against it.
const atriumLeft = 312;
const atriumWidth = WORLD_W - 2 * atriumLeft; // symmetric by construction, same mirror principle as rightColX
const atriumTop = 420;
const atriumHeight = 610;

const LAYOUT = {
  shelfW,
  shelfH,
  leftColX,
  rightColX,
  rowStep,
  wing1RowY,
  wing2RowY,
  wing3RowY,
  wing4RowY,
  review1Y,
  review2Y,
  review3Y,
  reviewGateSouthY,
  centerpieceY,
  entryY,
  entryX,
  atriumLeft,
  atriumWidth,
  atriumTop,
  atriumHeight,
};

// -- Progression data: lessons, prereqs, review piles (N3-only single floor) --
// N3 wing, frosted threshold wall, and N3 entrance exam gate were removed
// per explicit follow-up feedback -- this is now ONE continuous 20-shelf
// floor (16 grammar shelves + 4 Reading Room shelves), not two gated columns.
// The 16 grammar shelves are a content-preserving merge of the old 24
// (12 N3 + 12 N3) shelves -- see LESSON_CONTENT's own header comment for the
// exact old-shelf-id -> new-shelf-id mapping. Bottom-to-top order (n3-shelf-01
// nearest the entry) is unchanged; only the number of stops and their names
// changed. n3-shelf-04 ("Special Collections") is the extra 16th grammar
// shelf requested this pass, giving the floor 20 total shelves.
const LESSON_DATA = [
  {
    id: 'n3-shelf-01',
    title: 'Verb Stacks I -- Potential, Volitional, Ba-form'
  },
  {
    id: 'n3-shelf-02',
    title: 'Verb Stacks II -- Passive, Causative, Transitive/Intransitive'
  },
  {
    id: 'n3-shelf-03',
    title: 'Particle Reference Desk -- de, ni, kara, mo'
  },
  {
    id: 'n3-shelf-04',
    title: 'Special Collections -- zutsu, hodo-nai, dewa'
  },
  {
    id: 'n3-shelf-05',
    title: 'Everyday Speech Shelf -- demo, de, mo'
  },
  {
    id: 'n3-shelf-06',
    title: 'Timing & Sequence Shelf -- toka, tari, shi, tokoro, aida, toki'
  },
  {
    id: 'n3-shelf-07',
    title: 'Change & Decision Shelf -- cause, mama, experience, deciding, becoming'
  },
  {
    id: 'n3-shelf-08',
    title: 'Obligation & Permission Shelf -- nakereba, temoii, teoku, teshimau'
  },
  {
    id: 'n3-shelf-09',
    title: 'Giving & Purpose Shelf -- ageru/kureru/morau, tame, youni'
  },
  {
    id: 'n3-shelf-10',
    // Was 'Effort & Demonstratives Shelf' -- wrapped to 3 lines on the
    // plaque; shortened to the shelf's more central grammar point
    // (ようにする／ようになる, "making an effort toward / coming to") per
    // explicit "simple, 2 words only" feedback. The demonstratives half
    // (こんな・そんな・あんな・どんな) is still taught inside the lesson
    // itself, just not named in the plaque anymore.
    title: 'Effort Shelf'
  },
  {
    id: 'n3-shelf-11',
    title: 'Advice & Commands Shelf -- manner, imperative, prohibitive'
  },
  {
    id: 'n3-shelf-12',
    // Was 'Embedded Questions Shelf' on the plaque -- shortened to
    // 'Question Shelf' per explicit request. Subtext (after ' -- ')
    // still shows in the retro-menu popup title.
    title: 'Question Shelf -- kadouka, nominalizing, ability, senses'
  },
  {
    id: 'n3-shelf-13',
    // Was 'Requests & Suggestions Shelf' -- the other 3-line-wrapping
    // plaque flagged alongside shelf-10 ("same here... 2 words only").
    // Shortened to the shelf's dominant theme (concession + the request-
    // politeness ladder); suggesting/quoting is a secondary sub-topic
    // still covered inside the lesson itself.
    title: 'Requests Shelf -- concession, requests, suggesting, quoting'
  },
  {
    id: 'n3-shelf-14',
    title: 'Intentions & Plans Shelf -- tsumori, to omou, tara'
  },
  {
    id: 'n3-shelf-15',
    title: 'If & When Almanac -- ba, nara, to conditionals'
  },
  {
    id: 'n3-shelf-16',
    title: 'Degree & Tone Shelf -- appearance, sugiru, ndesu, tone particles'
  },
  // Reading Room -- supplementary content, unlocked as a capstone after the
  // final review pile (see SHELF_PREREQ) rather than gating any grammar shelf.
  {
    id: 'n3-reading-01',
    title: 'Reading Room I -- A Day Off'
  },
  {
    id: 'n3-reading-02',
    title: 'Reading Room II -- The New Student'
  },
  {
    id: 'n3-reading-03',
    title: 'Reading Room III -- A Letter Home'
  },
  {
    id: 'n3-reading-04',
    title: 'Reading Room IV -- Lost in Kyoto'
  },
];

// N3-only single-floor chain -- one continuous line of 16 grammar shelves,
// a review pile after every 4 (matching N5's own "1 pile per 4 shelves"
// cadence), then the Reading Room as a capstone unlocked by the final
// review. No exam gate anywhere on this floor (N5's own staircase gate is
// still what gates arrival here in the first place).
const SHELF_PREREQ = {
  'n3-shelf-01': null,
  'n3-shelf-02': 'n3-shelf-01',
  'n3-shelf-03': 'n3-shelf-02',
  'n3-shelf-04': 'n3-shelf-03',
  'n3-shelf-05': 'n3-review-1',
  'n3-shelf-06': 'n3-shelf-05',
  'n3-shelf-07': 'n3-shelf-06',
  'n3-shelf-08': 'n3-shelf-07',
  'n3-shelf-09': 'n3-review-2',
  'n3-shelf-10': 'n3-shelf-09',
  'n3-shelf-11': 'n3-shelf-10',
  'n3-shelf-12': 'n3-shelf-11',
  'n3-shelf-13': 'n3-review-3',
  'n3-shelf-14': 'n3-shelf-13',
  'n3-shelf-15': 'n3-shelf-14',
  'n3-shelf-16': 'n3-shelf-15',
  // Reading Room -- supplementary, unlocked once the final review pile is
  // cleared rather than gating (or being gated by) any grammar shelf.
  'n3-reading-01': 'n3-review-4',
  'n3-reading-02': 'n3-reading-01',
  'n3-reading-03': 'n3-reading-02',
  'n3-reading-04': 'n3-reading-03',
};

// 4 review piles for 16 shelves -- one per 4-shelf group, same "1 per 4"
// cadence as N5's own BOOK_PILE_DATA.
const BOOK_PILE_DATA = [
  {
    id: 'n3-review-1',
    title: 'Foundations Review',
    requires: ['n3-shelf-01', 'n3-shelf-02', 'n3-shelf-03', 'n3-shelf-04']
  },
  {
    id: 'n3-review-2',
    title: 'Everyday Grammar Review',
    requires: ['n3-shelf-05', 'n3-shelf-06', 'n3-shelf-07', 'n3-shelf-08']
  },
  {
    id: 'n3-review-3',
    title: 'Nuance & Manners Review',
    requires: ['n3-shelf-09', 'n3-shelf-10', 'n3-shelf-11', 'n3-shelf-12']
  },
  {
    id: 'n3-review-4',
    title: 'Refinement Review',
    requires: ['n3-shelf-13', 'n3-shelf-14', 'n3-shelf-15', 'n3-shelf-16']
  },
];

// N3 entrance exam gate removed entirely (no more N3 wing to gate). The N2
// door stub stays -- it's an unrelated future-floor placeholder, not part
// of the N3 wing being removed this pass.
const EXAM_GATE_DATA = {
  n2: {
    id: 'n2-exam-gate',
    title: 'N2 Entrance Exam',
    requires: []
  },
  n1: {
    id: 'n1-exam-gate',
    title: 'N1 Entrance Exam',
    requires: []
  },
};

// -- Shelf-decoration helpers (Task 6) -----------------------------------
// Local copies of n5-phaser-game.js's createBookshelfLabel()/
// buildShelfTrinketAnim()/drawShelfCompleteTexture() (n5-phaser-game.js:
// 7373-7562), copied verbatim rather than referenced — n3-dashboard.html
// does NOT load n5-phaser-game.js (only library-scene-shared.js), so
// these generic, scene-only helpers (no N5-specific data referenced
// anywhere in their bodies) aren't reachable as bare identifiers here.
// Kept byte-for-byte identical to the N5 versions so both floors' shelves
// render with the same plaque/trinket/checkmark chrome.

let bookshelfLabelSeq = 0;

function createBookshelfLabel(scene, x, y, text, options = {}) {
  const fontSize = options.fontSize || 10; // was 6, then 8 -- bumped again per explicit feedback
  const paddingX = options.paddingX || 6;
  const paddingY = options.paddingY || 5;
  const maxWidth = options.maxWidth || 78;
  const frame = '#3a1414';
  const plank = '#7a2e2e';
  const grain = '#5a1f1f';
  const rivet = '#c9a66b';
  const ink = '#e8d4a8';
  const textStyle = {
    // Was '"Press Start 2P", "DotGothic16", monospace' (too blocky/blurry
    // at plaque sizes), then '"DotGothic16", monospace' (better, but still
    // not what was asked for), then '"VT323", "DotGothic16", monospace'
    // (this game's general "readable at header-or-bigger sizes" retro
    // face, matched to N5's own copy of this function per explicit
    // feedback that both floors' plaques should read the same). Switched
    // to Space Mono per explicit request to give shelf plaque titles
    // specifically (not dialogue/HUD/buttons) their own distinct look --
    // self-hosted the same way as VT323/Space Grotesk/Datatype (see
    // lesson-box.css's @font-face block) rather than a Google Fonts link,
    // matching this project's established convention. Space Mono has no
    // Japanese glyphs, so DotGothic16 stays as the fallback -- N3's own
    // plaque titles are all-romaji today (the ' -- ' subtext is stripped
    // before this function ever sees it), but the fallback is kept for
    // consistency with N5's copy and in case a future title mixes in
    // Japanese characters directly.
    fontFamily: '"Space Mono", "DotGothic16", monospace',
    fontSize: fontSize + 'px',
    color: ink,
    align: 'center',
    wordWrap: {
      width: maxWidth - paddingX * 2,
      useAdvancedWrap: true
    },
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
  const key = `n3BookshelfLabelTex_${bookshelfLabelSeq}`;
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
  return {
    bg,
    label,
    width: tagW,
    height: tagH
  };
}

// Tiny retro-tech "available" trinket + "completed" badge, same as N5's
// (n5-phaser-game.js:7429-7562) — a mini loading-panel prop with a
// genuinely animating segmented progress bar for 'available', a
// checkmark variant for 'completed'. Keyed with an n3-prefixed anim/
// texture key since N3 is a separate Game instance (separate texture/
// anim registries from N5) but shares the page's global JS scope with
// no other floor's script — no actual collision risk, just kept
// consistent with this file's n3-prefixing convention elsewhere.
let n3ShelfTrinketAnimKey = null;

function buildShelfTrinketAnim(scene) {
  if (n3ShelfTrinketAnimKey) return n3ShelfTrinketAnimKey;
  n3ShelfTrinketAnimKey = 'n3ShelfTrinketLoad';

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
    const key = `n3ShelfTrinketFrame${segFilled}`;
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

  const frames = frameKeys.concat(frameKeys.slice(1, -1).reverse()).map((key) => ({
    key
  }));
  scene.anims.create({
    key: n3ShelfTrinketAnimKey,
    frames,
    frameRate: 3,
    repeat: -1
  });
  return n3ShelfTrinketAnimKey;
}

let n3ShelfCompleteKey = null;

function drawShelfCompleteTexture(scene) {
  if (n3ShelfCompleteKey) return n3ShelfCompleteKey;
  n3ShelfCompleteKey = 'n3ShelfCompleteTex';

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

  const tex = scene.textures.createCanvas(n3ShelfCompleteKey, w, h);
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
  return n3ShelfCompleteKey;
}

// Procedural exam-gate DOOR texture — locked (closed, iron-braced, a
// keyhole) and unlocked (leaves parted, warm light in the gap) variants
// of the same door frame, matching this file's existing wood/brass
// palette (N3_PALETTE, the rope-and-brass fence's brass tones). Reusable
// for any future level's own entrance door — pass a distinct `key` per
// state per level (Phaser throws on re-registering a canvas key).
// config: { locked: boolean }
//
// Redone this pass (was a flat 48x72 slab -- 2 plank colors, a bare iron
// bar top/bottom, a plain keyhole rectangle) per explicit feedback asking
// for something "handmade and beautiful... meticulously and accurately
// done", plus a base drop-shadow so it reads as standing IN the wall
// rather than a flat sticker on top of it. Canvas grew to 64x104 to fit
// the extra detail (arched stone lintel, a raised/beveled panel per leaf
// with real light-source shading, strap hinges with rivets, a proper
// brass ring-pull above the keyhole) at readable pixel sizes -- the
// in-game DISPLAY size is set separately via setDisplaySize/doorScale in
// buildExamGate(), so this doesn't change the door's footprint on the
// map, only how much detail is packed into its texture.
function drawDoorTexture(scene, key, config) {
  if (scene.textures.exists(key)) return key;
  const w = 64;
  const h = 104;
  const {
    locked
  } = config;
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;

  const stoneDark = '#2a1810';
  const stoneMid = '#4a3020';
  const stoneLight = '#6a4a34';
  const woodBase = locked ? '#4a2d1d' : '#5a3a24';
  const woodShade = locked ? '#331d11' : '#3f2716';
  const woodHi = locked ? '#5f3d27' : '#71492e';
  const woodGrain = locked ? '#3a2415' : '#4a2c18';
  const iron = '#1c1c1a';
  const ironHi = '#4a4a44';
  const brass = '#c9a24c';
  const brassHi = '#f0d080';
  const brassLo = '#8a6a2c';
  const glow = '#f0c674';

  const archH = 14; // stone lintel/arch header
  const frameX = 3;
  const frameTop = archH;
  const jambW = 4; // inner wood-trim jamb, between the stone frame and the leaves

  // -- Drop shadow first (lowest layer): grounds the door against the
  // wall/floor instead of it reading as a flat sticker. --------------------
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(4, h - 5, w - 6, 5);

  // -- Outer stone frame, full height. --------------------------------------
  ctx.fillStyle = stoneDark;
  ctx.fillRect(0, 0, w, h - 4);
  ctx.fillStyle = stoneMid;
  ctx.fillRect(frameX, archH - 8, w - frameX * 2, h - archH - 4);
  // Coarse stone-block seams down each jamb, so the frame doesn't read as
  // one flat rectangle.
  ctx.fillStyle = stoneDark;
  for (let sy = archH + 6; sy < h - 8; sy += 10) {
    ctx.fillRect(frameX, sy, w - frameX * 2, 1);
  }
  ctx.fillStyle = stoneLight;
  ctx.fillRect(frameX, archH - 8, w - frameX * 2, 1);

  // -- Rounded stone arch header, with a small keystone. --------------------
  ctx.fillStyle = stoneMid;
  ctx.beginPath();
  ctx.moveTo(frameX, archH);
  ctx.quadraticCurveTo(w / 2, -archH * 0.6, w - frameX, archH);
  ctx.lineTo(w - frameX, archH - 8);
  ctx.quadraticCurveTo(w / 2, -archH * 1.4, frameX, archH - 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = stoneLight;
  ctx.fillRect(w / 2 - 4, 1, 8, 7); // keystone
  ctx.fillStyle = stoneDark;
  ctx.fillRect(w / 2 - 4, 7, 8, 1);

  // -- Inner wood jamb (trim between stone frame and the door leaves). -----
  const innerX = frameX + jambW;
  const innerY = archH + 2;
  const innerW = w - innerX * 2;
  const innerH = h - innerY - 6;
  ctx.fillStyle = woodShade;
  ctx.fillRect(innerX - jambW, innerY - jambW, innerW + jambW * 2, innerH + jambW * 2);
  ctx.fillStyle = woodHi;
  ctx.fillRect(innerX - jambW, innerY - jambW, innerW + jambW * 2, 1);

  const gap = locked ? 0 : 7; // leaves parted when unlocked
  const leafW = (innerW - gap) / 2;
  const leafH = innerH;

  [0, 1].forEach((i) => {
    const lx = innerX + i * (leafW + gap);
    const ly = innerY;
    ctx.fillStyle = woodBase;
    ctx.fillRect(lx, ly, leafW, leafH);

    // Vertical plank lines, slightly irregular spacing so it doesn't read
    // as a mechanical repeat.
    let px = 3;
    while (px < leafW - 2) {
      ctx.fillStyle = woodGrain;
      ctx.fillRect(lx + px, ly, 1, leafH);
      px += 5 + (px % 3);
    }

    // Two raised, beveled panels per leaf (upper tall, lower short) --
    // light source top-left: highlight on the top/left inner edge, shadow
    // on the bottom/right, same convention as createBookshelfLabel's
    // plank chrome elsewhere in this file.
    const panelInset = 5;
    const panelW = leafW - panelInset * 2;
    const panels = [
      { py: ly + 5, ph: leafH * 0.52 },
      { py: ly + leafH * 0.6, ph: leafH * 0.33 },
    ];
    panels.forEach(({ py, ph }) => {
      const px2 = lx + panelInset;
      ctx.fillStyle = woodShade;
      ctx.fillRect(px2, py, panelW, ph);
      ctx.fillStyle = woodBase;
      ctx.fillRect(px2 + 2, py + 2, panelW - 4, ph - 4);
      ctx.fillStyle = woodHi;
      ctx.fillRect(px2 + 2, py + 2, panelW - 4, 1);
      ctx.fillRect(px2 + 2, py + 2, 1, ph - 4);
      ctx.fillStyle = woodShade;
      ctx.fillRect(px2 + 2, py + ph - 3, panelW - 4, 1);
      ctx.fillRect(px2 + panelW - 3, py + 2, 1, ph - 4);
    });

    // Strap hinges on the OUTER edge only (i=0 -> left edge, i=1 -> right
    // edge) -- 3 rivet-studded iron bars per leaf.
    const hingeX = i === 0 ? lx : lx + leafW - 8;
    [0.12, 0.48, 0.84].forEach((f) => {
      const hy = ly + leafH * f - 4;
      ctx.fillStyle = iron;
      ctx.fillRect(hingeX, hy, 8, 8);
      ctx.fillStyle = ironHi;
      ctx.fillRect(hingeX, hy, 8, 1);
      ctx.fillStyle = brass;
      ctx.fillRect(hingeX + (i === 0 ? 5 : 1), hy + 3, 2, 2); // rivet
    });
  });

  const seamX = innerX + leafW;
  if (locked) {
    // Brass ring-pull, one per leaf, above the keyhole.
    [0, 1].forEach((i) => {
      const rx = i === 0 ? seamX - 8 : seamX + gap + 8;
      const ry = innerY + leafH * 0.42;
      ctx.strokeStyle = brass;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rx, ry, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = brassHi;
      ctx.fillRect(rx - 1, ry - 4, 2, 1);
    });
    // Keyhole/lock plate, centered on the seam.
    ctx.fillStyle = brassLo;
    ctx.fillRect(seamX - 6, innerY + leafH * 0.52, 12, 16);
    ctx.fillStyle = brass;
    ctx.fillRect(seamX - 5, innerY + leafH * 0.52 + 1, 10, 14);
    ctx.fillStyle = brassHi;
    ctx.fillRect(seamX - 5, innerY + leafH * 0.52 + 1, 10, 1);
    ctx.fillStyle = iron;
    ctx.beginPath();
    ctx.arc(seamX, innerY + leafH * 0.52 + 6, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(seamX - 1.5, innerY + leafH * 0.52 + 8, 3, 5);
  } else {
    // Warm light glowing through the parted gap.
    ctx.fillStyle = glow;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(seamX, innerY, gap, leafH);
    ctx.globalAlpha = 1;
    ctx.fillStyle = brassHi;
    ctx.fillRect(seamX - 1, innerY, 1, leafH);
    ctx.fillRect(seamX + gap, innerY, 1, leafH);
  }

  tex.refresh();
  return key;
}

class N3LibraryScene extends Phaser.Scene {
  constructor() {
    super('N3LibraryScene');
  }

  preload() {
    // Phaser's texture cache is per-Game-instance, and N3 is a separate
    // page/Game instance from N5 — every source sheet N3 needs must be
    // loaded here too, even ones N5 also loads. Paths confirmed against
    // n5-phaser-game.js's own preload() (LibraryScene). This is the
    // minimum set for Tasks 3-6 (walls/floor/shelves/furniture/player) —
    // add more this.load.image(...) calls here in later tasks only if a
    // specific new crop needs a sheet not listed yet.
    this.load.image('libAssetPack', '../../assets/images/ui/libassetpack-tiled.png');
    this.load.image('furniture03', '../../assets/images/ui/furniture03.png');
    // Archive Vault reskin — green/olive furniture (State2), not N4's
    // orange State1, to match the approved mockup's loveseat. Same pixel
    // layout as State1 (confirmed: both are 208x288 with items in
    // identical positions), so every ASSET_RECTS.lib*/sofaCouch2 crop
    // rect below still lines up without changes.
    this.load.image('topDownFurniture1', '../../assets/images/ui/TopDownHouse_FurnitureState2.png');
    // Archive Vault reskin — pre-recolored teal/brass shelf sprites
    // (built via a one-off HSV hue-shift script against the original
    // red/maroon libassetpack-tiled.png crops, approved in the mockup
    // before this file existed — see mockups/n3-archive-vault/). Loaded
    // as standalone already-cropped images instead of ASSET_RECTS crops
    // from libAssetPack, since the recolor only exists as these 4 files.
    this.load.image('n3ShelfLockedArchiveVault', '../../assets/images/ui/n3-shelf-locked-archivevault.png');
    this.load.image('n3ShelfFilled1ArchiveVault', '../../assets/images/ui/n3-shelf-filled1-archivevault.png');
    this.load.image('n3ShelfFilled2ArchiveVault', '../../assets/images/ui/n3-shelf-filled2-archivevault.png');
    this.load.image('n3ShelfFilled3ArchiveVault', '../../assets/images/ui/n3-shelf-filled3-archivevault.png');
    // Same floor/wall source sheets as N5's LibraryScene (buildFloor()/
    // buildWalls() below reuse their exact crops) — added for Task 3.
    this.load.image('floorsWalls', '../../assets/images/ui/floors-walls02.png');
    this.load.image('floorsWallsTopDown', '../../assets/images/ui/TopDownHouse_FloorsAndWalls.png');
    // Shelf stamp/favorite icons — same source files as N5's LibraryScene
    // preload() (n5-phaser-game.js:7576/7581), needed for Task 6's
    // buildShelves() (completion checkmark stamp + favorite floppy-disk
    // badge, both copied verbatim from that file).
    this.load.image('checkmarkIcon', '../../assets/images/ui/checkmark-1-Original.png');
    this.load.image('savePointRaw', '../../assets/images/ui/save-point-Original.png');
    // Jukebox decorative prop (Task 3) — loaded here for texture cleanup in buildJukebox()
    this.load.image('jukebox', '../../assets/images/ui/jukebox-Original.png');
    // Vocabulary press (this pass) — an old Gutenberg-style press standing
    // in for N5's printer-station, on the N3/right side of the new wing4
    // row (see buildVocabPressStation()). Already a clean standalone
    // 1024x1024 image (verified via PIL before use), no cropToTexture
    // isolation needed unlike the packed libassetpack-tiled.png crops.
    this.load.image('gutenbergPress', '../../assets/images/lesson/gutenberg-press-Original.png');
    // Kanji Easel prop (see buildKanjiEasel) — same pre-cropped asset N5/
    // N4 load (693x870, true alpha bbox, no transparent padding to
    // account for in placement math).
    this.load.image('kanjiEaselRaw', '../../assets/images/ui/easel-tripod-cropped.png');
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
    // same as N5's staircase) is the N3->N3 exam gate, NOT a north-wall
    // staircase (there's no further N2 stub built this pass — see the
    // design spec's Out of Scope). Passing it just unlocks the N3 column
    // in place -- no page
    // navigation needed, so onFinalGatePass is just a toast.
    this.finalGateId = null; // N3 exam gate removed this pass -- no finalGateId needed on this floor
    // Vocabulary press (this pass) — reuses the exact same reference PDFs
    // N5's own printer station links to (ALL_PRINT_LINKS_N3 below is a
    // verbatim-path copy of n5-phaser-game.js's PRINT_LINKS_BY_SHELF
    // entries, not new documents), just reachable from N3's floor too via
    // its own press prop instead of N5's printer.
    this.printerStationId = 'n3-vocab-press';
    this.printLinksByShelf = { 'n3-jukebox': JUKEBOX_LINKS };
    this.allPrintLinks = ALL_PRINT_LINKS_N3;
    this.lessonContent = LESSON_CONTENT; // Task 7
    this.quizGateKey = QUIZ_GATE_KEY;
    this.catColors = CAT_COLORS;
    this.talkColorPaths = TALK_COLOR_PATHS;
    this.senseiPortraitPaths = SENSEI_PORTRAIT_PATHS;
    this.extraRetroMenuOptions = undefined; // N3 has no shelf-08-style extra option this pass
    // Recolors the LessonBox dialogue/quiz chrome to N3_PALETTE's wine/
    // gold/dark-wood instead of N5's navy/indigo default — see the
    // .lesson-box--theme-n3 override in lesson-box.css and the
    // `theme: this.lessonBoxTheme` read in library-scene-shared.js's
    // startLesson(). Layout/components are identical to N5; only these
    // CSS custom properties change.
    this.lessonBoxTheme = 'n3';
    this.finalGateProceedLabel = 'Continue';
    this.onFinalGatePass = () => showToast('The N3 wing is now unlocked!');
    this.buildScene();
  }

  buildScene() {
    this.interactives = [];
    registerCatAnimations(this); // idempotent, safe even though N3 is a separate Game instance
    this.progress = loadProgress();
    this.favorites = loadFavorites();
    this.lessonPage = loadLessonPage();
    this.furnitureSprites = {};
    this.buildFloor();
    this.buildWalls();
    this.buildWingCorners();
    this.buildTopBand();
    this.buildFurniture();
    this.buildJukebox();
    this.buildShelves();
    // Moved after buildShelves() (was before) -- buildAtrium()'s "real
    // shelves" preview reuses this.n3ShelfFilledKeys, which buildShelves()
    // is what populates. No ordering dependency the other way: the atrium
    // sits in the center void, shelves sit in the side columns, so
    // nothing about buildShelves() needs the atrium to exist first.
    this.buildAtrium();
    this.buildFillerFurniture();
    this.buildVocabPressStation();
    this.buildKanjiEasel();
    this.buildBookPiles();
    this.buildExamGate(); // Task 6 — the one interactive N5 has no equivalent of

    this.buildPlayer();
    this.wireInput();
    this.refreshAllStates();
    ensureToast();
  }

  // -- World geometry (Task 3): floor, walls, top band, player ------------

  buildFloor() {
    // Same TopDownHouse_FloorsAndWalls.png floor crop as N5's LibraryScene
    // (buildFloor(), n5-phaser-game.js:7684) rendered as a single
    // tileSprite spanning the whole world for guaranteed seamless tiling.
    // Sits at depth -1, strictly behind the border tilemap below.
    const floorKey = this.drawHardwoodFloorTexture();
    this.add.tileSprite(0, 0, WORLD_W, WORLD_H, floorKey).setOrigin(0, 0).setDepth(-1);

    // Border tileset holds only the brick tile, same as N5 — every
    // non-border cell is "no tile" (-1) so the floor tileSprite above
    // shows through. No gate opening this pass (unlike N5's bottom-row
    // GATE_COLS cutout): this floor's one gate mechanic is the N3->N3
    // exam-gate interactive built in the middle of the map (Task 6), not
    // a hole in the perimeter wall, so the border stays fully solid.
    const tileTex = this.textures.createCanvas('n3LibraryTiles', TILE_SIZE, TILE_SIZE);
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
    const map = this.make.tilemap({
      data,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE
    });
    const tileset = map.addTilesetImage('n3LibraryTiles', null, TILE_SIZE, TILE_SIZE);
    map.createLayer(0, tileset, 0, 0);
    this.floorTilemap = map;

    // Solid dark backdrop outside the room instead of transparency,
    // same as N5.
    this.cameras.main.setBackgroundColor('#2A2320');
  }

  buildWalls() {
    const blockSize = 32; // was TILE_SIZE (16) via image crop — see Task 2
    // Archive Vault reskin — sage wall-panel tiling instead of N4/N5's
    // shared brick texture (createBrickWallTexture in
    // library-scene-shared.js, deliberately left untouched). See
    // createArchiveVaultWallTexture()'s own comment above.
    const brickKey = this.createArchiveVaultWallTexture('n3PanelWallTex', {
      blockW: blockSize,
      blockH: blockSize
    });
    const wallGroup = this.physics.add.staticGroup();

    // Top/bottom strips — WORLD_W (800) divides evenly by 32 (25 blocks),
    // so no remainder handling needed on this axis (GRID_COLS is kept
    // even for exactly this reason — see its own comment). Constrain height to
    // TILE_SIZE (16px) instead of full blockSize (32px) to avoid overwriting
    // buildFloor()'s border-row tiles at the top/bottom edges.
    for (let x = 0; x < WORLD_W; x += blockSize) {
      this.add.image(x, TILE_SIZE, brickKey).setOrigin(0, 0).setDepth(0)
        .setCrop(0, 0, blockSize, TILE_SIZE).setDisplaySize(blockSize, TILE_SIZE);
      this.add.image(x, (GRID_ROWS - 2) * TILE_SIZE, brickKey).setOrigin(0, 0).setDepth(0)
        .setCrop(0, 0, blockSize, TILE_SIZE).setDisplaySize(blockSize, TILE_SIZE);
    }

    // Left/right strips — 3 * TILE_SIZE (48px) deep, starting below the
    // top wall band. Positioned at original x-offsets (columns 1-3 left,
    // columns 68-70 right) to avoid overlapping buildFloor()'s perimeter
    // border tiles. The vertical run length (GRID_ROWS * TILE_SIZE minus
    // the header) is not guaranteed to be a multiple of blockSize, so the
    // final tile in each column gets clipped to the remaining pixel
    // height instead of overshooting past the strip's bottom edge.
    const sideWallStartY = Math.ceil(TOP_BAND_HEIGHT / TILE_SIZE) * TILE_SIZE;
    const sideWallEndY = GRID_ROWS * TILE_SIZE;
    const colWidth = 3 * TILE_SIZE; // 48px, same total strip width as before
    for (let y = sideWallStartY; y < sideWallEndY; y += blockSize) {
      const remaining = sideWallEndY - y;
      const h = Math.min(blockSize, remaining);
      this.add.image(TILE_SIZE, y, brickKey).setOrigin(0, 0).setDepth(0)
        .setCrop(0, 0, colWidth, h).setDisplaySize(colWidth, h);
      this.add.image(WORLD_W - TILE_SIZE - colWidth, y, brickKey).setOrigin(0, 0).setDepth(0)
        .setCrop(0, 0, colWidth, h).setDisplaySize(colWidth, h);
    }
    this.wallGroup = wallGroup;
  }

  // C/reverse-C wing shaping — two short wall "corner" stubs per wing
  // (top and bottom, where the spine meets the wing's outermost shelf
  // group), reusing the exact brick texture buildWalls() just created
  // for the spine itself (same key — must not re-create it, Phaser
  // throws on re-registering a canvas key). This is a deliberately
  // narrow way to add real new wall geometry (not just decoration)
  // without touching the shelf-to-atrium corridor the rope-and-brass
  // rail runs along, or blocking the center corridor's own north-south
  // path — a full concave floor reshape (moving the atrium's own edge
  // in/out per wing-band) risked breaking existing shelf/corridor
  // reachability math for a purely cosmetic gain, so this session scoped
  // the "full geometric reshape" down to these four corner turns instead.
  buildWingCorners() {
    const stubW = 40;
    const stubH = 16;
    const brickKey = 'n3BrickWallTex';

    const addStub = (x, y, w) => {
      this.add.tileSprite(x, y, w, stubH, brickKey).setOrigin(0, 0).setDepth(0);
      const block = this.add.rectangle(x + w / 2, y + stubH / 2, w, stubH, 0x000000, 0);
      this.physics.add.existing(block, true);
      this.wallGroup.add(block);
    };

    const topY = LAYOUT.wing3RowY[0] - stubH - 6; // in the gap between review-3's pile and wing3
    // Moved from wing1's south edge to wing4's (this pass's new Reading/
    // Vocabulary-press row) — wing4 is now the true southernmost content
    // group before the entry, so the C-shape pinch belongs at ITS edge,
    // not in the middle of the map where wing1 used to be the extreme.
    const bottomY = LAYOUT.wing4RowY[1] + LAYOUT.shelfH + 10; // just south of wing4's south row

    addStub(64, topY, stubW); // N3 spine (west, x=64 inner edge) juts east
    addStub(64, bottomY, stubW);
    addStub(WORLD_W - 64 - stubW, topY, stubW); // N3 spine (east), mirrored, juts west
    addStub(WORLD_W - 64 - stubW, bottomY, stubW);
  }

  buildTopBand() {
    // Simpler than N5's buildTopBand() (n5-phaser-game.js:7770): no
    // staircase/gate art at all this pass — this floor's one gate
    // mechanic (the N3->N3 exam gate) is a separate interactive built in
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

  // -- Central decor (Task 6): arrival marker. A first pass only — denser
  // than N5's per the design spec, but that density (reading tables/
  // sofas/TVs/reception desk) is explicitly out of scope for this pass.
  // The old center-corridor rug and grandfather-clock centerpiece landmark
  // both used to live here too — removed per explicit follow-up feedback
  // ("remove the pendulum clock, no use"): the corridor rug was replaced
  // by the frosted N3 threshold wall (buildN3Mist()), and the clock had
  // no functional purpose and was leaving an un-frosted gap a player
  // could walk into in the south hall segment (see buildN3Mist()'s own
  // comment for the two-segment geometry that fills that space now).

  buildFurniture() {
    // Recolors drawWovenRug's default brick-red/tan palette to this
    // floor's deeper wine/gold accent — now the module-level
    // N3_RUG_PALETTE (was a local const here only; hoisted so
    // buildAtrium() can reuse the identical palette for its own rug
    // preview). Only the small arrival rug (below) uses this in
    // buildFurniture() itself.
    const n3RugPalette = N3_RUG_PALETTE;

    // Plain arrival rug at the entry point — N3 has no "Neko-sensei" desk
    // this pass (out of scope, matches the design spec's placeholder-
    // first approach), just a small accent rug (same woven technique,
    // fixed-size like N5's globeRug accents, no tiling needed) so the
    // spawn point doesn't read as bare floor. The stair-tread landmark
    // that used to sit below it (buildStairsLandmark()) was dropped
    // entirely per explicit follow-up feedback ("just remove the
    // stairs") — this rug is now the only decor at the spawn corner.
    // Anchored with origin (0,0) at CORNER_X=16 (just past the single
    // true outer border tile, not buildWalls()'s far wider inner brick
    // strip — see this session's corner-flush fix) so it draws on top of
    // that inner strip and sits genuinely flush in the corner, and its
    // bottom edge is pinned directly to the south wall's own top edge
    // (no longer tied to the removed tread's position).
    const arrivalW = 90;
    const arrivalH = 50;
    const cornerX = 16; // just past the single true outer border tile
    const southWallTopY = (GRID_ROWS - 2) * TILE_SIZE;
    drawWovenRug(this, 'n3ArrivalRugTex', arrivalW, arrivalH, n3RugPalette);
    this.add.image(cornerX, southWallTopY - arrivalH, 'n3ArrivalRugTex')
      .setOrigin(0, 0).setDepth(0);
  }

  // The mezzanine's floor is drawn in layers rather than borrowed from a
  // bitmap: long alternating planks, fine grain, seams, and a soft warm
  // highlight read as dark hardwood even at the game's pixel scale.
  // Archive Vault reskin: this used to procedurally draw a dark hardwood
  // plank floor (same technique as N4/N5's own copy of this method) —
  // replaced with the REAL orange-herringbone floor crop from
  // floors-walls02.png (ASSET_RECTS.archiveVaultFloor), tiled into the
  // same canvas-texture contract every caller already expects (idempotent
  // by key, returns the texture key) so buildFloor()'s tileSprite and
  // buildAtrium()'s "peek into the floor below" preview both pick up the
  // new look with zero changes at their call sites. Chosen over hand-
  // painting new art per explicit user direction ("or they can use these
  // walls and flooring from floors-walls02.png") — this is the exact
  // sage-wall/herringbone-floor combo from that sheet's 3rd column,
  // approved via the room-layout mockup before this file existed.
  drawHardwoodFloorTexture() {
    const key = 'n3ArchiveVaultFloorTex';
    if (this.textures.exists(key)) return key;
    const rect = ASSET_RECTS.archiveVaultFloor;
    const tilesX = 2;
    const tilesY = 2;
    const tex = this.textures.createCanvas(key, rect.w * tilesX, rect.h * tilesY);
    const ctx = tex.getContext();
    ctx.imageSmoothingEnabled = false;
    const src = this.textures.get('floorsWalls').getSourceImage();
    for (let ty = 0; ty < tilesY; ty++) {
      for (let tx = 0; tx < tilesX; tx++) {
        ctx.drawImage(
          src, rect.x, rect.y, rect.w, rect.h,
          tx * rect.w, ty * rect.h, rect.w, rect.h
        );
      }
    }
    tex.refresh();
    return key;
  }

  // Sibling to drawHardwoodFloorTexture() above — same reasoning, but for
  // the sage wood-panel WALL crop instead of the herringbone floor one.
  // Not shared via library-scene-shared.js's createBrickWallTexture()
  // (that function stays untouched so N4/N5's brick walls are unaffected)
  // — this is a local, N3-only tiling helper with the same canvas-texture
  // contract (idempotent by key, returns the key) so it can drop straight
  // into buildWalls() in place of createBrickWallTexture().
  createArchiveVaultWallTexture(key, config) {
    if (this.textures.exists(key)) return key;
    const cfg = config || {};
    const blockW = cfg.blockW || 32;
    const blockH = cfg.blockH || 32;
    const rect = ASSET_RECTS.archiveVaultWall;
    const tex = this.textures.createCanvas(key, blockW, blockH);
    const ctx = tex.getContext();
    ctx.imageSmoothingEnabled = false;
    const src = this.textures.get('floorsWalls').getSourceImage();
    // Tile the sage panel crop to cover the requested block size —
    // ceil() so a partial final tile still fully covers the block rather
    // than leaving a transparent sliver.
    for (let y = 0; y < blockH; y += rect.h) {
      for (let x = 0; x < blockW; x += rect.w) {
        ctx.drawImage(
          src, rect.x, rect.y, rect.w, rect.h,
          x, y, Math.min(rect.w, blockW - x), Math.min(rect.h, blockH - y)
        );
      }
    }
    tex.refresh();
    return key;
  }

  // A real open central void makes the floor read as a mezzanine — this
  // floor sits above N4 (not N5 — corrected from the N4->N3 clone, which
  // originally carried over N4's own "peek down at N5" tinting
  // unchanged), so the void should read as N4's floor, not N5's. Two
  // Phaser.Game instances can't share a live scene (N3 and N4 are
  // separate `new Phaser.Game()` calls on separate HTML pages —
  // n3-dashboard.html never loads n4-phaser-game.js), so this can't be a
  // literal peek into the running N4 scene; instead buildOpenAtriumVoid's
  // floor*/shelfColor knobs are explicitly tinted to N4's own wine/gold
  // LessonBox palette (see lesson-box.css's .lesson-box--theme-n4) and
  // lit brightly enough to read as a real, occupied room one floor down,
  // with an explicit "N4" label below reinforcing it. The border fill
  // just outside the void itself stays dark, a deliberate thin frame/
  // shadow lip at the atrium's rim, not part of "the floor" the player
  // is meant to read as lit.
  buildAtrium() {
    const left = LAYOUT.atriumLeft;
    const width = LAYOUT.atriumWidth;
    const top = LAYOUT.atriumTop;
    const height = LAYOUT.atriumHeight;
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x160f0c, 1).fillRect(left, top, width, height);
    buildOpenAtriumVoid(this, g, {
      left: left + 14,
      top: top + 16,
      width: width - 28,
      height: height - 32,
      corridorColor: N3_PALETTE.carpet,
      // N4's own wine/gold palette (bg-top #7a2b46, dark wood #2f1b12,
      // gold #d4a24c — see lesson-box.css's .lesson-box--theme-n4),
      // dimmed a shade for "one floor down" the same way
      // buildOpenAtriumVoid's own N5-default comment dims N5's palette.
      floorBase: 0x5c2038,
      floorTileA: 0x6e2a42,
      floorTileB: 0x64253a,
      shelfColor: 0x2f1b12,
      // Real floor/carpet/shelves — same "show the actual floor below"
      // reasoning N4 already established for its own N5 peek.
      // this.drawHardwoodFloorTexture() is idempotent (returns the
      // existing key if already created in buildFloor()), and
      // this.n3ShelfFilledKeys is populated by buildShelves(), which now
      // runs BEFORE buildAtrium() (see buildScene()'s reordering comment).
      floorTexKey: this.drawHardwoodFloorTexture(),
      rugPalette: N3_RUG_PALETTE,
      shelfTexKeys: this.n3ShelfFilledKeys,
    });
    // Rear walkway strip's own dark fill + trim lines were removed per
    // explicit feedback — it read as a flat black rectangle sitting
    // above the rope-and-brass rail, not as a walkway. That floor space
    // (just above the atrium's top edge) now shows the ordinary hardwood
    // floor texture instead of a distinct filled band; the space itself
    // is unchanged, only its dedicated dark overlay is gone.
    // Full-perimeter rope-and-brass rail doubles as the actual collision
    // boundary: the void previously had NO physics body at all, so the
    // player could walk straight into it. Drawn AFTER the void/walkway
    // (so it sits visually on top, at the atrium's outer edge) and
    // BEFORE the label (so the label still floats above everything).
    buildAtriumFence(this, {
      left,
      top,
      width,
      height,
      wallGroup: this.wallGroup
    });
    // "OPEN ATRIUM / N4 FLOOR BELOW" label, centered inside the atrium
    // void, floating over the illustrated content — naming which floor
    // is actually visible below instead of leaving it generic. Was "N5
    // FIRST-FLOOR LIBRARY" (unchanged carry-over from the N4->N3 clone,
    // wrong once N3 sits above N4 rather than N5).
    const labelX = left + width / 2;
    const labelY = top + height / 2 - 20;
    this.add.text(labelX, labelY, 'OPEN ATRIUM', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#e8d4a8',
      align: 'center',
    }).setOrigin(0.5).setDepth(4);
    this.add.text(labelX, labelY + 28, 'N4 FLOOR BELOW', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#a89068',
      align: 'center',
    }).setOrigin(0.5).setDepth(4);
  }

  // Listening Jukebox -- upgraded this pass from a purely decorative prop
  // (toast + note flourish, no real content) into a real `kind: 'npc'`
  // interactive, same pattern as buildVocabPressStation(): always
  // available, routes to startLesson() via openInteraction()'s 'npc'
  // branch, carries its own curated external listening links via
  // this.printLinksByShelf['n3-jukebox'] (set in create()) plus an
  // original in-game "broadcast" transcript + comprehension quiz (see
  // LESSON_CONTENT['n3-jukebox']). Only one instance now (was two,
  // mirrored N3/N3). Moved this pass from its old solo spot at the north
  // wall header into wing3RowY (left side, beside the press) -- see this
  // method's own position comment for why.
  buildJukebox() {
    const texKey = cropJukeboxTexture(this, 'n3JukeboxTex');
    const scale = 0.12;
    const w = 620 * scale;
    const h = 870 * scale;
    // Moved this pass from its old solo spot at the north wall header down
    // into wing3RowY (left side), the same row the Vocabulary Press now
    // occupies (right side) -- per explicit feedback that the area
    // between the header and the press read as too empty with the
    // jukebox sitting alone up there. Centered on the left-column pair
    // the same way buildVocabPressStation() centers on the right-column
    // pair, so the two "bonus station" props read as a matched set.
    const x = (LAYOUT.leftColX[0] + LAYOUT.leftColX[1] + LAYOUT.shelfW) / 2;
    const y = LAYOUT.wing3RowY[0] + (LAYOUT.rowStep + LAYOUT.shelfH) / 2;

    const jukeboxEntry = {
      id: 'n3-jukebox',
      kind: 'npc',
      title: 'Listening Jukebox',
      x,
      y,
      baseScale: scale,
    };
    const sprite = createDecorativeProp(this, {
      x,
      y,
      textureKey: texKey,
      scale,
      depth: 2,
      onClick: () => this.handleInteractiveClick(jukeboxEntry),
    });
    jukeboxEntry.sprite = sprite;

    const label = createBookshelfLabel(this, x, y + h / 2 + 6, 'Listening Jukebox', {
      maxWidth: w + 60,
    });
    label.bg.setDepth(2);
    label.label.setDepth(3);

    this.interactives.push(jukeboxEntry);
  }

  // Same particle technique as spawnPassSparkle (library-scene-shared.js)
  // but with a musical-note glyph and no dependency on quiz-pass state —
  // kept local since it's cosmetic flavor for one prop, not shared engine.
  spawnNoteFlourish(x, y) {
    const count = 4;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const note = this.add.text(x, y, '♪', {
          fontSize: '16px',
          color: '#e8d4a8'
        })
        .setOrigin(0.5).setDepth(10);
      this.tweens.add({
        targets: note,
        x: x + Math.cos(angle) * 30,
        y: y + Math.sin(angle) * 30 - 20,
        alpha: {
          from: 1,
          to: 0
        },
        duration: 800,
        ease: 'Cubic.Out',
        onComplete: () => note.destroy(),
      });
    }
  }

  // Generates all 20 shelf positions from LAYOUT's own Y bands. wing1RowY
  // now hosts shelves 01-08 (4 left + 4 mirrored right -- no more N3/N3
  // split, just two shelves' worth of width per row-band), wing2RowY hosts
  // shelves 09-16 the same way, and wing3RowY hosts the 4 Reading Room
  // shelves (left-only). wing4RowY is no longer part of this shelf grid --
  // freed up for the Vocabulary Press (buildVocabPressStation()).
  // Content order was Y-band order = wing1(closest to entry, shelf01-08),
  // wing2(shelf09-16), wing3(reading) -- but wing4RowY (even closer to
  // entry, south of wing1) held nothing but the press, leaving a big empty
  // room right where a player arrives. Reassigned this pass so the
  // SOUTHERNMOST band is the FIRST content encountered, matching the
  // requested "Foundations, Grammar, Reading, then Listening" walking
  // order: wing4(nearest entry)=shelf01-08, wing1=shelf09-16,
  // wing2=reading, wing3(deepest, was reading)=press. Listening (the
  // jukebox) was already the true deepest point (north wall header), so
  // it needed no change. None of LAYOUT's wing*RowY *values* moved --
  // only which content fills which band -- so the carefully-tuned gaps
  // between bands are untouched.
  createMezzanineShelfPositions() {
    // Sort order fixed this pass: south row (larger y, CLOSER to entry) is
    // the "start" and must get the lower indices -- LESSON_DATA zips
    // lesson[0] to position[0] expecting shelf01 to be the very first
    // thing a player reaches, not the deepest shelf in its own wing band.
    // Was sorted ascending (north/smallest-y first), which put shelf01 in
    // the BACK row of every wing -- bottom-to-top, left-to-right within
    // a row now (descending y, then ascending x).
    const group = (rowY) => LAYOUT.leftColX
      .flatMap((x) => [0, 1].map((r) => [x, rowY[0] + r * LAYOUT.rowStep]))
      .sort((a, b) => b[1] - a[1] || a[0] - b[0]);
    // mirror() flips x (WORLD_W-x-shelfW), which on its own REVERSES
    // left-to-right order (a smaller source x becomes a LARGER mirrored
    // x) -- re-sorting by x after mirroring keeps the right-side wing
    // reading left-to-right too, instead of backwards.
    const mirror = (positions) => positions
      .map(([x, y]) => [WORLD_W - x - shelfW, y])
      .sort((a, b) => b[1] - a[1] || a[0] - b[0]);
    const wingALeft = group(LAYOUT.wing4RowY); // shelves 01-04 (nearest entry)
    const wingARight = mirror(wingALeft); // shelves 05-08
    const wingBLeft = group(LAYOUT.wing1RowY); // shelves 09-12
    const wingBRight = mirror(wingBLeft); // shelves 13-16
    const reading = group(LAYOUT.wing2RowY); // Reading Room I-IV, left-only
    return [...wingALeft, ...wingARight, ...wingBLeft, ...wingBRight, ...reading];
  }

  // -- 20 shelves total: 16 grammar (2 per row-band) + 4 Reading Room -----

  buildShelves() {
    const shelfW = LAYOUT.shelfW;
    const shelfH = LAYOUT.shelfH;

    // Matches LESSON_DATA's order (n3-shelf-01..16, n3-reading-01..04)
    // exactly — buildShelves() zips LESSON_DATA[i] with positions[i] by
    // array index below.
    const positions = this.createMezzanineShelfPositions();

    // Archive Vault reskin — pre-recolored teal/brass shelves, loaded
    // whole in preload() (n3Shelf*ArchiveVault keys) rather than cropped
    // from libAssetPack's red/maroon sheet at runtime. shelfW/shelfH
    // below (from ASSET_RECTS.shelfLocked/shelfFilled*) are still read
    // for sizing math even though those crop rects are no longer used to
    // actually cut these textures — the recolored PNGs are pixel-
    // identical in dimensions to their original crops.
    const lockedKey = 'n3ShelfLockedArchiveVault';
    const filledKeys = ['n3ShelfFilled1ArchiveVault', 'n3ShelfFilled2ArchiveVault', 'n3ShelfFilled3ArchiveVault'];
    // Stashed for buildAtrium()'s "real shelves" preview (see
    // buildOpenAtriumVoid's shelfTexKeys option) — reuses these same
    // real crops instead of re-cropping duplicate textures.
    this.n3ShelfFilledKeys = filledKeys;
    // Registers the trinket's frame textures + looping animation once,
    // before any shelf sprite tries to use them (must exist first).
    const trinketAnimKey = buildShelfTrinketAnim(this);
    // Favorite icon: crop savePointRaw down to its tight 624x624 content
    // box, same as N5's (n5-phaser-game.js:8301).
    const favoriteDiskKey = cropToTexture(this, 'savePointRaw', {
      x: 200,
      y: 200,
      w: 624,
      h: 624
    }, 'n3FavoriteDiskTex');

    LESSON_DATA.forEach((lesson, i) => {
      const [x, y] = positions[i];
      // Uniform setScale (module-level shelfScale, see this file's LAYOUT
      // section), NOT setDisplaySize(shelfW, shelfH) — the old
      // setDisplaySize forced the art's real 88x120+ portrait crop into a
      // squat 87x64 box, squashing it to about half its natural height
      // while keeping nearly full width, flattening the locked shelf's
      // (already sparse, empty-cabinet) art into a nearly featureless
      // strip. shelfW/shelfH are now pre-scaled from the real crop
      // proportions (verified live via Phaser scene introspection against
      // the actual running game, then checked against the reference
      // libassetpack-tiled.png crop directly), so setScale here just
      // applies that same factor — no per-shelf recomputation needed.
      // Filled variants are natively a little taller than locked (down to
      // 88x131-139 vs locked's 88x120), so at this fixed scale they
      // render a few px taller than shelfH once unlocked — an
      // intentional, uniform-safe tradeoff instead of a per-texture
      // non-uniform squish.
      const sprite = this.add.image(x + shelfW / 2, y + shelfH / 2, lockedKey)
        .setOrigin(0.5, 0.5).setDepth(1)
        .setScale(shelfScale);
      const glow = this.add.sprite(x + shelfW / 2, y + shelfH / 2, 'n3ShelfTrinketFrame0')
        .setOrigin(0.5).setDepth(4).setVisible(false)
        .play(trinketAnimKey);
      const completeBadge = this.add.image(x + shelfW / 2, y + shelfH / 2, drawShelfCompleteTexture(this))
        .setOrigin(0.5).setDepth(4).setVisible(false);

      // Plaque shows just the title, not the "-- grammar list" subtext
      // that follows it in lesson.title (e.g. "Verb Stacks I -- Potential,
      // Volitional, Ba-form" -> "Verb Stacks I") -- per explicit feedback
      // that the subtext was overlapping/cluttering neighboring shelves.
      // entry.title below stays the FULL string (used for the retro-menu
      // popup title when a shelf is clicked, a one-time read where the
      // extra detail is still useful, unlike the always-visible plaque).
      const plaqueTitle = lesson.title.split(' -- ')[0];
      // fontSize/maxWidth both bumped from createBookshelfLabel's defaults
      // (10 / shelfW+20) specifically for this floor's plaques: N3's
      // shelves render much smaller than N5's (shelfW here is ~63px vs
      // N5's ~123px, since this floor's shelfScale is fit to a 100px
      // ceiling height rather than N5's SHELF_SCALE=1.4), so the same
      // default plaque sizing that works for N5 was already wrapping most
      // N3 titles onto 2 lines with the old VT323 font. Space Mono's
      // characters measure ~53% wider than VT323's at the same size
      // (checked against both fonts' actual hmtx advance widths), which
      // at size 10 pushed nearly every N3 title (e.g. "Verb Stacks I",
      // one line before) onto an extra line, and a few onto 3-4 lines --
      // tall enough to risk colliding with the shelf row above/below in
      // this floor's tighter vertical spacing. fontSize 8 + maxWidth
      // shelfW+32 (~95px, checked against the ~97px gap between this
      // floor's paired shelf columns so the wider plaque still can't
      // collide with its neighbor) brings every title back to the same
      // line count it had with VT323, except "If & When Almanac" (1->2
      // lines, no overlap risk either way).
      const label = createBookshelfLabel(this, x + shelfW / 2, y + shelfH - 20, plaqueTitle, {
        maxWidth: shelfW + 32,
        fontSize: 8,
      });
      label.bg.setDepth(2);
      label.label.setDepth(3);
      const stamp = this.add.image(label.bg.x + label.width / 2 - 6, label.bg.y + 6, 'checkmarkIcon')
        .setOrigin(0.5).setDepth(4).setDisplaySize(12, 12).setVisible(false);
      const favIcon = this.add.image(label.bg.x + label.width / 2 - 10, label.bg.y - 8, favoriteDiskKey)
        .setOrigin(0.5).setDepth(4).setDisplaySize(18, 18).setVisible(false);

      // Deliberately non-solid — same reasoning as N5: 2 shelves share
      // each row with only a 14px gap, and auto-walk routing to the far
      // column would have to cross the near column's collision box.
      // Interaction still works via distance checks (TRIGGER_RANGE), not
      // physical contact.
      sprite.setInteractive({
        useHandCursor: true
      });
      sprite.on('pointerdown', () => this.handleInteractiveClick(entry));

      const entry = {
        id: lesson.id,
        kind: 'shelf',
        title: lesson.title,
        sprite,
        glow,
        completeBadge,
        stamp,
        favIcon,
        lockedKey,
        filledKey: filledKeys[i % filledKeys.length],
        x: x + shelfW / 2,
        y: y + shelfH / 2,
        prereq: SHELF_PREREQ[lesson.id],
        baseScale: 1,
        displayW: shelfW,
        displayH: shelfH,
      };
      this.interactives.push(entry);
    });

    // -- Overhead section plaques — bigger wooden signs marking where each
    // grammar category begins, in walking order (bottom/entry to top/deep).
    // Purely decorative (no interactivity, no collision), reusing the same
    // createBookshelfLabel plaque chrome as every shelf's own title so it
    // reads as "native" to the set, just bigger. Anchored to specific
    // shelves' own (x,y) rather than spanning a full wing. Only 4 signs
    // now (was 7) since the 16-shelf redesign packs 2 groups of 4 per
    // wing-row -- each sign anchors the first (north-row) shelf of its
    // own 4-shelf review group, plus one more for the Reading Room.
    // `side` says which pair of columns (leftColX or rightColX) that
    // group occupies, so the sign can center over BOTH shelves in the
    // group (its own 2-column width) instead of just the anchor shelf --
    // "top center of the shelf [group]" per explicit feedback.
    // Anchored directly off LAYOUT's own wing-band Y values now (not a
    // shelf id lookup) -- the shelf-ordering fix above (group()'s sort)
    // means the shelf CLOSEST to the entry within each band is now the
    // SOUTH row, which only has a ~5-7px gap above it into its own
    // wing's north row (not enough room for a sign). Every wing band's
    // NORTH sub-row (wingY[0]) is what borders the generous ~70-90px gap
    // into the NEXT band, so that's what every sign anchors to instead,
    // regardless of which shelf id physically ends up there.
    const sectionSigns = [
      { label: 'Foundations', wingY: LAYOUT.wing4RowY[0], side: 'left' },
      { label: 'Everyday Grammar', wingY: LAYOUT.wing4RowY[0], side: 'right' },
      { label: 'Nuance & Manners', wingY: LAYOUT.wing1RowY[0], side: 'left' },
      { label: 'Refinement', wingY: LAYOUT.wing1RowY[0], side: 'right' },
      { label: 'Reading Room', wingY: LAYOUT.wing2RowY[0], side: 'left' },
    ];
    sectionSigns.forEach((sign) => {
      const col = sign.side === 'right' ? LAYOUT.rightColX : LAYOUT.leftColX;
      const centerX = (col[0] + col[1] + shelfW) / 2;
      // fontSize was 9, then 7, then 12 -- bumped again to 14 (a bit
      // bigger than a regular shelf label's own 10) per explicit
      // feedback. Offset above the shelf stays -34, still comfortably
      // inside the ~70-90px gaps between wing bands.
      const plaque = createBookshelfLabel(this, centerX, sign.wingY - 34, sign.label, {
        fontSize: 14,
        paddingX: 10,
        paddingY: 8,
        maxWidth: (col[1] - col[0]) + shelfW + 60,
      });
      plaque.bg.setDepth(2);
      plaque.label.setDepth(3);
    });
  }

  // -- Decorative "set dressing" furniture (this pass) — replaces this
  // session's earlier duplicate-shelf-sprite filler entirely, per
  // explicit feedback ("instead of the same shelves for fillers of
  // space, can you try mocking [reading-nook furniture] up"). Reading
  // tables/chairs/a couch (topDownFurniture1 crops, same ones N5's own
  // reading nook already uses successfully — chosen over cropping fresh,
  // unverified rects from Interior.png, since these are already alpha-
  // scan-confirmed and proven in-game) read as an actual lounge/study
  // area instead of "more bookshelves", and their smaller real footprint
  // leaves more open floor around each cluster than a full shelf did —
  // both asks from the feedback in one move. Pure atmosphere: not pushed
  // into this.interactives, no lock/prereq/LessonBox content.
  //
  // Same three gaps as before (see this session's gap arithmetic — the
  // Y picks themselves are unchanged, only what's drawn at them):
  //  1. wing2RowY's RIGHT column — Reading Room only ever occupied the
  //     LEFT column there, so the right side was fully empty (the blank
  //     column behind the "Refinement" sign from an earlier screenshot).
  //  2. The header-to-wing3 gap (110-442) — clears both the N2 gate and
  //     buildWingCorners()'s brick stub with margin either side.
  //  3. The wing4-to-entry gap (1392-1761, "south wall... needs filled")
  //     — clears buildWingCorners()'s south stub and the arrival rug.
  // No live browser to screenshot-check against, so please flag if any
  // of these still read as cramped, colliding, or the wrong scale.
  buildFillerFurniture() {
    const tableKey = cropToTexture(this, 'topDownFurniture1', ASSET_RECTS.libTable, 'n3LibTableTex');
    const chairKey = cropToTexture(this, 'topDownFurniture1', ASSET_RECTS.libChair, 'n3LibChairTex');
    const couchKey = cropToTexture(this, 'topDownFurniture1', ASSET_RECTS.sofaCouch2, 'n3SofaCouch2Tex');
    const tvKey = cropToTexture(this, 'furniture03', ASSET_RECTS.tvCabinet, 'n3TvCabinetTex');
    const furnitureScale = 1.3; // a bit bigger than native crop size, closer to shelfScale's visual weight
    const tableW = ASSET_RECTS.libTable.w * furnitureScale;
    const tableH = ASSET_RECTS.libTable.h * furnitureScale;
    const chairW = ASSET_RECTS.libChair.w * furnitureScale;
    const chairH = ASSET_RECTS.libChair.h * furnitureScale;
    const couchW = ASSET_RECTS.sofaCouch2.w * furnitureScale;
    const couchH = ASSET_RECTS.sofaCouch2.h * furnitureScale;
    const tvW = ASSET_RECTS.tvCabinet.w * furnitureScale;
    const tvH = ASSET_RECTS.tvCabinet.h * furnitureScale;

    // A reading table, centered at (cx,cy). Default: one chair flanking
    // each side (Reading Nook / Rest Area). chairsBelow: true instead
    // seats both chairs south of the table, side by side facing north
    // toward it (Study Corner only, per explicit "the chair needs to be
    // south of table in study corner" feedback — Reading Nook/Rest Area
    // weren't called out, so they keep the flanking arrangement).
    const addTableCluster = (cx, cy, { chairsBelow = false } = {}) => {
      this.add.image(cx, cy, tableKey).setOrigin(0.5, 0.5).setDepth(1).setScale(furnitureScale);
      const chairGap = 6;
      if (chairsBelow) {
        const chairY = cy + tableH / 2 + chairGap + chairH / 2;
        this.add.image(cx - chairW / 2 - chairGap / 2, chairY, chairKey)
          .setOrigin(0.5, 0.5).setDepth(1).setScale(furnitureScale);
        this.add.image(cx + chairW / 2 + chairGap / 2, chairY, chairKey)
          .setOrigin(0.5, 0.5).setDepth(1).setScale(furnitureScale);
      } else {
        this.add.image(cx - tableW / 2 - chairW / 2 - chairGap, cy, chairKey)
          .setOrigin(0.5, 0.5).setDepth(1).setScale(furnitureScale);
        this.add.image(cx + tableW / 2 + chairW / 2 + chairGap, cy, chairKey)
          .setOrigin(0.5, 0.5).setDepth(1).setScale(furnitureScale);
      }
    };
    const addCouch = (cx, cy) => {
      this.add.image(cx, cy, couchKey).setOrigin(0.5, 0.5).setDepth(1).setScale(furnitureScale);
    };

    const addNookRow = (label, rowY, layout) => {
      const centerX = WORLD_W / 2;
      const plaque = createBookshelfLabel(this, centerX, rowY - 34, label, {
        fontSize: 12,
        paddingX: 10,
        paddingY: 7,
        maxWidth: 220,
      });
      plaque.bg.setDepth(2);
      plaque.label.setDepth(3);
      layout();
    };

    // A small "TV nook": a decorative TV (reusing N5's own tvCabinet crop
    // — not a 3rd interactive lesson kiosk, N3 already has the
    // Vocabulary Press + Jukebox as its 2 standalone stations), a woven
    // accent rug directly below it, then 2 couches ("loveseats" per
    // explicit request) sitting below the rug facing UP toward the TV —
    // reuses sofaCouch2's own native "upward facing" pose as-is, same as
    // every other sofaCouch2 placement in this project, rather than
    // rotating a different asset (an earlier attempt to rotate this
    // exact couch sprite via setAngle was explicitly rejected in N5's
    // own polish pass, so this reuses the proven-safe unrotated pose
    // instead of repeating that mistake here).
    // topY: where the TV's own TOP EDGE starts (same "content starts here"
    // reference the flanking single-row furniture uses, i.e. rowY + 10) —
    // NOT a center point, since this group stacks 3 pieces tall (TV, rug,
    // couches) and centering it on the same y flanking single-height
    // furniture uses would push the TV up into the plaque label above.
    // Returns the rug's own center Y so the caller can vertically align
    // flanking furniture with this group's visual midpoint instead of
    // guessing.
    const addTvLoveseatGroup = (cx, topY) => {
      const rugW = 70 * furnitureScale;
      const rugH = 40 * furnitureScale;
      const rugKey = `n3TvRugTex_${Math.round(cx)}_${Math.round(topY)}`;
      drawWovenRug(this, rugKey, rugW, rugH, N3_RUG_PALETTE);
      const rugGap = 10;
      const tvY = topY + tvH / 2;
      const rugY = tvY + tvH / 2 + rugGap + rugH / 2;
      const couchGap = 6;
      const couchY = rugY + rugH / 2 + couchGap + couchH / 2;
      this.add.image(cx, tvY, tvKey).setOrigin(0.5, 0.5).setDepth(1).setScale(furnitureScale);
      this.add.image(cx, rugY, rugKey).setOrigin(0.5, 0.5).setDepth(0);
      addCouch(cx - couchW / 2 - couchGap / 2, couchY);
      addCouch(cx + couchW / 2 + couchGap / 2, couchY);
      return rugY;
    };

    // 1. wing2RowY's right column — a table cluster and a couch, single
    // row only (was 2x2) so the nook reads as spacious, not re-cramming
    // the gap that was just opened up.
    const rightMidX = (LAYOUT.rightColX[0] + LAYOUT.rightColX[1] + LAYOUT.shelfW) / 2;
    const nookY = LAYOUT.wing2RowY[0] + tableH / 2 + 10;
    addNookRow('Reading Nook', LAYOUT.wing2RowY[0], () => {
      addTableCluster(rightMidX - 60, nookY);
      addCouch(rightMidX + 70, nookY - tableH / 2 + couchH / 2);
    });

    // Globe — this floor's own copy of N5's decorative centerpiece, per
    // explicit "put the globe in N4 and N3 too, with their respective
    // positions" follow-up (same placement reasoning as N4's own copy —
    // see that file's buildFurniture() comment): the center hall is
    // spoken for by the N3 mist veil mechanic there, so this lands
    // instead directly below the Reading Nook's table+couch, in
    // wing2RowY[1]'s right column — createMezzanineShelfPositions()'s
    // `reading` group never mirrors into the right column, so that whole
    // side is shelf-free across both wing2RowY sub-rows. Same woven-rug-
    // plus-globe-sprite pairing as N5, recolored to this floor's own
    // Archive Vault teal/brass rug palette instead of N5's default.
    const n3GlobeKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.globe, 'n3GlobeTex');
    const n3GlobeRugW = 90 * furnitureScale;
    const n3GlobeRugH = 50 * furnitureScale;
    const n3GlobeRugKey = 'n3GlobeRugTex';
    drawWovenRug(this, n3GlobeRugKey, n3GlobeRugW, n3GlobeRugH, N3_RUG_PALETTE);
    const n3GlobeCenterX = rightMidX;
    const n3GlobeCenterY = LAYOUT.wing2RowY[1] + shelfH / 2;
    this.add.image(n3GlobeCenterX, n3GlobeCenterY, n3GlobeRugKey).setDepth(0);
    this.add.image(
      n3GlobeCenterX - ASSET_RECTS.globe.w / 2,
      n3GlobeCenterY - ASSET_RECTS.globe.h / 2,
      n3GlobeKey
    ).setOrigin(0, 0).setDepth(1);

    // 2. Header-to-wing3 gap — ALL 4 slots are now table+2-chair clusters
    // (was 2 couches on the outside + 2 table clusters inside) per
    // explicit "table and 2 chairs facing the table... put 4 tables, 8
    // chairs in there" request. chairsBelow: true seats both chairs south
    // of each table (facing north toward it) instead of flanking left/
    // right, per explicit "the chair needs to be south of table in study
    // corner" follow-up — this nook only, Reading Nook/Rest Area still
    // use the default flanking arrangement.
    addNookRow('Study Corner', 285, () => {
      const y = 285 + tableH / 2 + 10;
      addTableCluster(LAYOUT.leftColX[0] + LAYOUT.shelfW / 2, y, { chairsBelow: true });
      addTableCluster(LAYOUT.leftColX[1] + LAYOUT.shelfW / 2 + 20, y, { chairsBelow: true });
      addTableCluster(LAYOUT.rightColX[0] + LAYOUT.shelfW / 2 - 20, y, { chairsBelow: true });
      addTableCluster(LAYOUT.rightColX[1] + LAYOUT.shelfW / 2, y, { chairsBelow: true });
    });

    // 3. wing4-to-entry (south) gap — table clusters kept on the
    // outside; the 2 inner couches replaced with a TV+rug+2-loveseats
    // group per explicit "2nd picture... change the chair and table
    // positioning... i need 2 loveseats pointed to the tv again" request.
    addNookRow('Rest Area', 1560, () => {
      const contentTopY = 1560 + 10; // same "content starts here" margin every other nook row uses
      const rugCenterY = addTvLoveseatGroup(WORLD_W / 2, contentTopY);
      // Flank at the TV group's own visual midpoint (its rug) rather than
      // a flat single-row y — this group stacks 3 pieces tall, so
      // matching the flanking tables to the OLD single-row y would put
      // them noticeably higher than the group's actual center.
      addTableCluster(LAYOUT.leftColX[0] + LAYOUT.shelfW / 2, rugCenterY);
      addTableCluster(LAYOUT.rightColX[1] + LAYOUT.shelfW / 2, rugCenterY);
    });
  }

  // -- Vocabulary press (this pass) — a single Gutenberg-style press prop
  // standing in wing4's N3/right-side slot (mirrored from the 4 Reading
  // shelves on the N3/left side, but NOT part of the LESSON_DATA/
  // createMezzanineShelfPositions() shelf grid — it's a standalone `kind:
  // 'npc'` interactive, same pattern as N5's own printer-station: no
  // lock/prereq state, always available, routes straight to startLesson()
  // via openInteraction()'s 'npc' branch, and its dialogue carries the
  // print-links list via this.printerStationId/this.allPrintLinks (set in
  // create()). Centered across BOTH of wing4's row-slots (one big prop
  // instead of 2-4 small ones) rather than tied to a single
  // createMezzanineShelfPositions() index, since there's no shelf sprite
  // here at all.
  buildVocabPressStation() {
    const pressDisplay = 90; // square source (1024x1024, confirmed via PIL) — no crop needed; already matches the Kanji Easel's own 90px display height (see buildKanjiEasel)
    const pressScale = pressDisplay / 1024;
    // +12 right / -10 up (north) per explicit "move it up a bit right
    // and then north like a few pixels" feedback.
    const pressNudgeX = 12;
    const pressNudgeY = -10;
    const pressX = (LAYOUT.rightColX[0] + LAYOUT.rightColX[1] + LAYOUT.shelfW) / 2 + pressNudgeX;
    // wing3RowY now (was wing4RowY) -- the deepest shelf band, freed up
    // once Reading Room moved to wing2RowY and this pass's reorder gave
    // wing4RowY to shelf01-08 instead. Sits near the north wall alongside
    // the Listening Jukebox, matching the "both are bonus stations past
    // the graded curriculum" framing.
    const pressY = LAYOUT.wing3RowY[0] + (LAYOUT.rowStep + LAYOUT.shelfH) / 2 + pressNudgeY;
    const press = this.add.image(pressX, pressY, 'gutenbergPress')
      .setOrigin(0.5, 0.5).setDepth(1).setScale(pressScale);

    const label = createBookshelfLabel(this, pressX, pressY + pressDisplay / 2 + 6, 'The Composing Room', {
      maxWidth: pressDisplay + 40,
    });
    label.bg.setDepth(2);
    label.label.setDepth(3);

    const plaque = createBookshelfLabel(this, pressX, pressY - pressDisplay / 2 - 34, 'Est. 1450', {
      fontSize: 9,
      paddingX: 8,
      paddingY: 6,
      maxWidth: pressDisplay + 50,
    });
    plaque.bg.setDepth(2);
    plaque.label.setDepth(3);

    press.setInteractive({ useHandCursor: true });
    const pressEntry = {
      id: 'n3-vocab-press',
      kind: 'npc',
      title: 'Vocabulary Press',
      sprite: press,
      x: pressX,
      y: pressY,
      baseScale: pressScale,
    };
    press.on('pointerdown', () => this.handleInteractiveClick(pressEntry));
    this.interactives.push(pressEntry);
  }

  // Kanji Easel prop -- a blank wooden tripod easel (kanjiEaselRaw,
  // user-supplied asset) standing in the right column, directly SOUTH of
  // the Vocabulary Press (wing3RowY[1], the row directly below the
  // press's wing3RowY[0] -- confirmed unused by any other builder before
  // adding this), reading as a matched vertical pair of "bonus station"
  // props alongside the jukebox/press pair to their north. Always-
  // available interactive (kind: 'npc', same pattern as the press/
  // jukebox) that opens a paginated lookup table of every kanji word this
  // floor's grammar-pattern lessons use (LESSON_CONTENT['kanji-easel'],
  // built by the shared buildKanjiEaselPages() helper from
  // N3_KANJI_EASEL_WORDS) -- a quick reference, not a gated lesson, added
  // per explicit request to give players a dedicated place for kanji-
  // recognition practice/lookup. See N3_KANJI_EASEL_WORDS's own comment
  // for why this list currently duplicates N4's.
  buildKanjiEasel() {
    // Source image is 693x870 (tall, narrow) -- displayed at the same
    // rough "standing prop" height as the press (90px square) but kept
    // at its native aspect ratio instead of being squashed to a square.
    const easelDisplayH = 90;
    const easelScale = easelDisplayH / 870;
    const easelX = (LAYOUT.rightColX[0] + LAYOUT.rightColX[1] + LAYOUT.shelfW) / 2;
    const easelY = LAYOUT.wing3RowY[1] + (LAYOUT.rowStep + LAYOUT.shelfH) / 2;
    const easel = this.add.image(easelX, easelY, 'kanjiEaselRaw')
      .setOrigin(0.5, 0.5).setDepth(1).setScale(easelScale);

    // "漢字" written on the easel's own whiteboard area, per explicit
    // "put kanji lettering in the easel to make it obvious that's the
    // item to click for KANJI" feedback. Offset measured directly off
    // the source PNG: the whiteboard's own opaque near-white bounding box
    // is x:69-450, y:99-446 out of the full 693x870 canvas, centered at
    // (259.5, 272.5) -- 87px left / 162.5px up from the sprite's own
    // center (346.5, 435) at native scale, scaled by the same easelScale
    // the sprite itself uses so this stays correct if the easel's display
    // size is ever retuned again.
    this.add.text(easelX - 87 * easelScale, easelY - 162.5 * easelScale, '漢字', {
      fontFamily: '"DotGothic16", "Press Start 2P", monospace',
      fontSize: `${Math.round(24 * (easelDisplayH / 100))}px`, // scales with easelDisplayH, tuned to read clearly at the 100px baseline size
      color: '#2a1f14',
    }).setOrigin(0.5, 0.5).setDepth(2);

    const label = createBookshelfLabel(this, easelX, easelY + easelDisplayH / 2 + 6, 'Kanji Easel', {
      maxWidth: 150,
    });
    label.bg.setDepth(2);
    label.label.setDepth(3);

    easel.setInteractive({ useHandCursor: true });
    const easelEntry = {
      id: 'kanji-easel',
      kind: 'npc',
      title: 'Kanji Easel',
      sprite: easel,
      x: easelX,
      y: easelY,
      baseScale: easelScale,
    };
    easel.on('pointerdown', () => this.handleInteractiveClick(easelEntry));
    this.interactives.push(easelEntry);
  }

  // -- 4 review book piles, one per 4-shelf group --------------------------

  buildBookPiles() {
    const bookKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.bookPileTall, 'n3BookPileTex');
    this.bookPileTexKey = bookKey; // reused by buildExamGate() (same crop, must not re-cropToTexture with a duplicate destKey)

    // Each pile is centered on the MIDPOINT between the 2 shelf columns
    // of the 4-shelf group it actually reviews (BOOK_PILE_DATA's own
    // `requires` list — Foundations/Nuance&Manners live in the left
    // columns, Everyday Grammar/Refinement in the right), same centerX
    // formula sectionSigns above already uses for its "Foundations"/
    // "Everyday Grammar" text plaques. This replaces an earlier version
    // that instead picked its side based on which shelf the pile UNLOCKS
    // next (e.g. review-1 unlocks shelf05, on the right) rather than
    // which shelves it reviews (shelf01-04, on the left) — that's why
    // the pile used to sit off to one side instead of centered over its
    // own group, per explicit "center it... not aligned to either shelf"
    // feedback. Y positions are unchanged (already read as "above the
    // top shelf row" per the reference screenshot; only the horizontal
    // centering was wrong).
    const leftMidX = (LAYOUT.leftColX[0] + LAYOUT.leftColX[1] + LAYOUT.shelfW) / 2;
    const rightMidX = (LAYOUT.rightColX[0] + LAYOUT.rightColX[1] + LAYOUT.shelfW) / 2;
    const scale = 0.78; // was 0.7 -- "a pixel bigger" per explicit feedback
    const w = ASSET_RECTS.bookPileTall.w * scale;
    const h = ASSET_RECTS.bookPileTall.h * scale;
    const positions = {
      'n3-review-1': { // reviews n3-shelf-01..04 ("Foundations", left columns)
        x: leftMidX - w / 2,
        y: LAYOUT.wing4RowY[0]
      },
      'n3-review-2': { // reviews n3-shelf-05..08 ("Everyday Grammar", right columns)
        x: rightMidX - w / 2,
        y: LAYOUT.reviewGateSouthY
      },
      'n3-review-3': { // reviews n3-shelf-09..12 ("Nuance & Manners", left columns)
        x: leftMidX - w / 2,
        y: LAYOUT.wing1RowY[0]
      },
      'n3-review-4': { // reviews n3-shelf-13..16 ("Refinement", right columns)
        x: rightMidX - w / 2,
        y: LAYOUT.review1Y
      },
    };

    BOOK_PILE_DATA.forEach((pile) => {
      const pos = positions[pile.id];
      const sprite = this.add.image(pos.x, pos.y, bookKey).setOrigin(0, 0)
        .setDisplaySize(w, h).setDepth(1);
      // Centered horizontally on the pile (was offset toward the right
      // edge) so the badge sits directly on top of the stack, per
      // explicit "checkmark badge on top of the stack" feedback.
      const glow = this.add.text(pos.x + w / 2, pos.y - 6, '⭐', {
          fontSize: '18px'
        })
        .setOrigin(0.5).setDepth(4).setVisible(false);
      const stamp = this.add.text(pos.x + w / 2, pos.y - 6, '✅', {
          fontSize: '18px'
        })
        .setOrigin(0.5).setDepth(4).setVisible(false);
      this.tweens.add({
        targets: glow,
        alpha: {
          from: 1,
          to: 0.35
        },
        duration: 650,
        yoyo: true,
        repeat: -1
      });

      // Non-solid, same reasoning as shelves — keeps auto-walk routing
      // simple and reliable for every interactive on this floor.
      sprite.setInteractive({
        useHandCursor: true
      });
      sprite.on('pointerdown', () => this.handleInteractiveClick(entry));

      const entry = {
        id: pile.id,
        kind: 'pile',
        title: pile.title,
        sprite,
        glow,
        stamp,
        requires: pile.requires,
        x: pos.x + w / 2,
        y: pos.y + h / 2,
        baseScale: scale,
        displayW: w,
        displayH: h,
      };
      this.interactives.push(entry);
    });
  }

  // -- N3/N3 entrance exam gates: interactives N5 has no equivalent of ----
  // Built like BOOK_PILE_DATA-shaped interactives (kind: 'pile', same
  // shape openInteraction()/refreshAllStates() already expect from any
  // pile), but each has entry.isExamGate: true and its own entry.quizGateKey
  // — that's what routes each one through openQuizGateMenu()'s 3-attempt/
  // 24h-cooldown flow (library-scene-shared.js, openInteraction()) instead
  // of a plain review-pile menu, and exempts it from refreshAllStates()'
  // lock-dimming, per-entry rather than via a single scene-level
  // this.finalGateId as N5's own staircase gate still uses.

  // Builds one exam-gate interactive: sprite (reused book-pile texture,
  // scaled), glow (available-state pulse) / stamp (completed) icons, a
  // floating title label, and the this.interactives entry. Replaces the
  // hand-duplicated N3/N3 block buildExamGate() used to write out twice.
  // config: { id, title, x, y, requires, quizGateKey, onPass, bookKey, scale, hideSprite?, doorTextures? }
  // hideSprite: true builds a click/proximity hitbox with NO visible book-
  // pile sprite, glow pulse, or floating title label — used by the N3 gate
  // now that its "locked" state is presented as a threshold veil instead
  // of a physical gate object (see buildN3Mist()); the interactive itself
  // (and its 3-attempt/24h-cooldown quiz-gate logic) is otherwise identical.
  // doorTextures: { locked, unlocked } — two texture keys (see
  // drawDoorTexture) to use INSTEAD of the book-pile crop, with the
  // sprite swapping between them as the gate's progress state changes
  // (wired via updateDoorGateTextures(), called from the refreshAllStates
  // wrapper below the class) — used by the N2 gate.
  createExamGateEntry(config) {
    const {
      id,
      title,
      x,
      y,
      requires,
      quizGateKey,
      onPass,
      bookKey,
      scale,
      hideSprite,
      doorTextures
    } = config;
    const w = doorTextures ? 64 * scale : ASSET_RECTS.bookPileTall.w * scale; // was 48 -- drawDoorTexture's canvas grew to 64x104 this pass
    const h = doorTextures ? 104 * scale : ASSET_RECTS.bookPileTall.h * scale; // was 72
    const initialKey = doorTextures ? doorTextures.locked : bookKey;
    const sprite = this.add.image(x, y, initialKey).setOrigin(0, 0).setDisplaySize(w, h).setDepth(2);
    if (hideSprite) sprite.setAlpha(0);
    // Empty-text glow/stamp when hidden — refreshAllStates() always calls
    // .setVisible() on these for every pile-kind entry, so they must
    // exist, but with no text content there's nothing to actually see
    // regardless of visibility, keeping "no object" true for the veil.
    const glow = this.add.text(x + w - 8, y - 6, hideSprite ? '' : '⭐', {
      fontSize: '18px'
    }).setOrigin(.5).setDepth(4).setVisible(false);
    const stamp = this.add.text(x + w - 8, y - 6, hideSprite ? '' : '✅', {
      fontSize: '18px'
    }).setOrigin(.5).setDepth(4).setVisible(false);
    if (!hideSprite) this.tweens.add({
      targets: glow,
      alpha: {
        from: 1,
        to: 0.35
      },
      duration: 650,
      yoyo: true,
      repeat: -1
    });
    const entry = {
      id,
      kind: 'pile',
      title,
      sprite,
      glow,
      stamp,
      requires,
      x: x + w / 2,
      y: y + h / 2,
      baseScale: scale,
      isExamGate: true,
      quizGateKey,
      onPass,
      displayW: w,
      displayH: h,
      hideSprite: !!hideSprite,
      doorTextures,
    };
    sprite.setInteractive({
      useHandCursor: true
    });
    sprite.on('pointerdown', () => this.handleInteractiveClick(entry));
    if (!hideSprite && !doorTextures) {
      // Doors carry their own "N2"/level plaque via createBookshelfLabel
      // (built by the caller, buildExamGate()) instead of this floating
      // caps-lock title text — a wooden plaque reads more "native to the
      // wing" for a door than book-pile gates' simple text label.
      this.add.text(x + w / 2, y - 18, title.toUpperCase(), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: '#e8d4a8',
      }).setOrigin(.5).setDepth(4);
    }
    this.interactives.push(entry);
    return entry;
  }

  buildExamGate() {
    // N3 entrance exam gate removed entirely this pass (no more N3 wing
    // to gate) -- the N2 door below is an unrelated future-floor stub.
    // N2 — a real pixel-art DOOR (drawDoorTexture) in the very top-right
    // corner of the N3 (right) wing — moved here per explicit follow-up
    // correction (an earlier version placed it in the N3/left wing,
    // matching this pass's ORIGINAL spec; the live feedback overrode
    // that in favor of the N3 side instead). Positioned flush toward
    // the east spine wall (WORLD_W - 64 inner edge) and as far north as
    // the top wall band allows. N1 is dropped for this pass entirely —
    // a future pass can add N1's own door once this one's design and
    // position are confirmed live.
    const doorScale = 1.4;
    const n2LockedKey = drawDoorTexture(this, 'n3N2DoorLockedTex', {
      locked: true
    });
    const n2UnlockedKey = drawDoorTexture(this, 'n3N2DoorUnlockedTex', {
      locked: false
    });
    const n2DoorW = 64 * doorScale; // was 48 -- matches drawDoorTexture's new 64x104 canvas
    const n2X = WORLD_W - 64 - n2DoorW - 8; // flush toward the east spine, top-right corner
    const n2Y = 115; // as far north as the top wall band allows
    const n2Entry = this.createExamGateEntry({
      id: EXAM_GATE_DATA.n2.id,
      title: EXAM_GATE_DATA.n2.title,
      x: n2X,
      y: n2Y,
      requires: EXAM_GATE_DATA.n2.requires,
      quizGateKey: N2_ENTRANCE_GATE_KEY,
      scale: doorScale,
      doorTextures: {
        locked: n2LockedKey,
        unlocked: n2UnlockedKey
      },
      onPass: () => showToast('The N2 door creaks open... nothing beyond it yet.'),
    });
    const doorLabel = createBookshelfLabel(this, n2Entry.x, n2Entry.y + (104 * doorScale) / 2 - 6, 'N2 Entrance Exam', {
      fontSize: 6,
      maxWidth: 90,
    });
    doorLabel.bg.setDepth(3);
    doorLabel.label.setDepth(4);
  }

  // Frosted threshold WALL across the CENTER hall — literally where the
  // corridor rug used to lie (x = WORLD_W/2) — while n3-exam-gate is
  // locked, per explicit follow-up feedback. Built as TWO segments, not
  // one continuous band: the open atrium void (LAYOUT.atriumTop to
  // atriumTop+atriumHeight) already has its own perimeter rope-and-brass
  // fence/collision (buildAtriumFence()) and reads as a real two-story
  // opening, so a frosted panel floating across it looked wrong (and
  // let the player wander into the gap where a decorative centerpiece
  // used to sit — see buildFurniture()'s comment on why that centerpiece
  // was removed). Instead: a north segment flush against the underside
  // of the top wall header (top = TOP_BAND_HEIGHT exactly, no gap of
  // bare brick above it) down to the atrium's top edge, and a south
  // segment from the atrium's bottom edge all the way down to the south
  // wall's own top edge (per explicit follow-up feedback — it used to
  // stop short at the old corridor rug's bottom bound, leaving a stretch
  // of unfrosted floor between there and the south wall) — sealing both
  // hall pinch-points the atrium's own fence doesn't cover, with the
  // void itself left open in between.
  //
  // This is the one spot every click-to-walk route in the scene passes
  // through (see handleInteractiveClick's shared 3-waypoint route,
  // always via x = worldW/2), so putting real collision here needed a
  // matching fix: the N3LibraryScene.prototype patch below this class
  // detours the route around whichever of this.n3MistBlocks a path would
  // cross, instead of leaving the player stuck against solid collision
  // mid-route.
  buildN3Mist() {
    const veilWidth = 100; // same width as the old corridor rug (was 80)
    const veilLeft = WORLD_W / 2 - veilWidth / 2;
    const segments = [{
      top: TOP_BAND_HEIGHT, // flush against the wall header's bottom edge — no gap
      bottom: LAYOUT.atriumTop,
    }, {
      top: LAYOUT.atriumTop + LAYOUT.atriumHeight,
      bottom: (GRID_ROWS - 2) * TILE_SIZE, // the south wall's own top edge — same anchor buildWalls() uses
    }];

    this.n3MistShapes = [];
    this.n3MistBlocks = [];
    segments.forEach(({
      top,
      bottom
    }) => {
      const height = bottom - top;
      const shapes = buildThresholdVeil(this, {
        x: veilLeft,
        top,
        height,
        width: veilWidth
      });
      this.n3MistShapes.push(...shapes);
      const block = this.add.rectangle(veilLeft + veilWidth / 2, top + height / 2, veilWidth, height, 0x000000, 0);
      this.physics.add.existing(block, true);
      this.wallGroup.add(block);
      this.n3MistBlocks.push(block);
    });

    // "N3 is locked until N3 is finished" signage, floating over the
    // dither near the top of the north segment — the first thing a
    // player sees walking up from the top-band header.
    const labelX = WORLD_W / 2;
    const labelTop = TOP_BAND_HEIGHT + 60;
    this.n3MistLabel = [
      this.add.text(labelX, labelTop, 'N3 SEALED', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#e8d4a8',
        align: 'center',
      }).setOrigin(0.5, 0).setDepth(5),
      this.add.text(labelX, labelTop + 18, 'COMPLETE N3 TO ENTER', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#c8bee0',
        align: 'center',
        lineSpacing: 3,
        wordWrap: {
          width: veilWidth - 6,
          useAdvancedWrap: true
        },
      }).setOrigin(0.5, 0).setDepth(5),
    ];

    this.n3MistLifted = !!this.progress['n3-exam-gate'];
    if (this.n3MistLifted) {
      this.n3MistShapes.forEach((s) => s.setVisible(false));
      this.n3MistLabel.forEach((s) => s.setVisible(false));
      this.n3MistBlocks.forEach((block) => this.wallGroup.remove(block, true, true)); // already unlocked on load — no barrier, no leftover collider
      this.n3MistBlocks = [];
    }
  }

  // Called after every refreshAllStates() (wrapped onto the prototype
  // just below this class, after Object.assign) — fades the veil out
  // exactly once, the first time n3-exam-gate's progress flips to
  // passed, and never re-shows it (a permanent lift, per the design's
  // explicit "lifts permanently" requirement). Also removes both solid
  // collision blocks immediately (not tied to the fade animation's
  // duration) — the barrier lifting is a state change, not something
  // that needs to visually "solidify away."
  updateN3MistState() {
    if (this.n3MistLifted || !this.n3MistShapes) return;
    if (!this.progress['n3-exam-gate']) return;
    this.n3MistLifted = true;
    (this.n3MistBlocks || []).forEach((block) => this.wallGroup.remove(block, true, true));
    this.n3MistBlocks = [];
    const fadeTargets = [...this.n3MistShapes, ...(this.n3MistLabel || [])];
    this.tweens.add({
      targets: fadeTargets,
      alpha: 0,
      duration: 900,
      ease: 'Sine.In',
      onComplete: () => fadeTargets.forEach((s) => s.setVisible(false)),
    });
  }

  buildPlayer() {
    // Spawns near the south end of the world, on the west side on top of
    // the arrival rug (buildFurniture()) — this floor's real entry point
    // from N5's staircase. Was WORLD_W/2 (dead center, no visual tie to
    // how the player arrived); LAYOUT.entryX moves it into the corner
    // instead.
    const spawnX = LAYOUT.entryX;
    const spawnY = LAYOUT.entryY;
    // N3LibraryScene is only ever reached after N5's CatSelectScene has
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

    // Idle-sleep tracking (see updatePlayerAnimation()) — starts "fresh"
    // as of spawn, not already idle, so the cat doesn't fall asleep
    // instantly on load.
    this.lastActivityTime = this.time.now;
    this.isSleeping = false;
    this.isRunning = false;
  }

  // Extended (was just idle/walk) to also handle: (a) the run cycle
  // while this.isRunning is true (set in update() from the Shift key),
  // and (b) falling asleep after IDLE_SLEEP_MS of zero movement, per
  // explicit "add running... and a laying down cat when idle 10secs"
  // request. panelOpen (a menu/lesson open) resets the idle clock in
  // update() before this runs, so reading a lesson never counts toward
  // the idle timer. Same pattern as N5's LibraryScene (n5-phaser-game.js).
  updatePlayerAnimation() {
    const vel = this.player.body.velocity;
    const moving = Math.abs(vel.x) > 0.5 || Math.abs(vel.y) > 0.5;
    const now = this.time.now;
    if (moving) {
      this.lastActivityTime = now;
      this.isSleeping = false;
      const dir = Math.abs(vel.x) > Math.abs(vel.y) ?
        (vel.x > 0 ? 'right' : 'left') :
        (vel.y > 0 ? 'down' : 'up');
      const gait = this.isRunning ? 'run' : 'walk';
      this.player.play(`${this.catColorId}-${gait}-${dir}`, true);
      return;
    }
    if (now - this.lastActivityTime >= IDLE_SLEEP_MS) {
      if (!this.isSleeping) {
        this.isSleeping = true;
        // Plays the sit -> curl -> asleep sequence ONCE (repeat: 0 on
        // this anim — see registerCatAnimations) and then just holds on
        // its last frame; no follow-up loop. Was previously chaining into
        // a repeat:-1 loop over 4 frames that visibly turned the cat's
        // head back and forth forever, which read as "tossing and
        // turning" instead of settling down (explicit bug report).
        this.player.play(`${this.catColorId}-sleep-fall`, true);
      }
      return;
    }
    this.isSleeping = false;
    this.player.play(`${this.catColorId}-idle`, true);
  }

  // N3 exam gate HUD button removed this pass along with the N3 wing --
  // #n3GateExamBtn stays permanently hidden now (its HTML default), and
  // its click listener below is a no-op (finalGateId is null).

  // -- Per-frame update: movement, auto-walk, proximity glow -------------
  // Copied verbatim from N5's LibraryScene.update() (n5-phaser-game.js:
  // 8752) — only references this.player/this.cursors/this.wasd/
  // this.moveQueue/this.interactives, all scene-local, no N5-specific
  // module constants (no direct WORLD_W/WORLD_H reference existed to
  // convert to this.worldW/this.worldH).
  update() {
    if (!this.player) return;
    // Reading a lesson/menu doesn't count as "idle" toward the sleep
    // timer — reset it every frame the panel's open so the cat is never
    // already asleep the moment a long lesson closes.
    if (this.panelOpen) this.lastActivityTime = this.time.now;
    this.updatePlayerAnimation();
    if (this.panelOpen) {
      this.player.setVelocity(0, 0);
      if (this.retroMenu) this.updateRetroMenuInput();
      return;
    }

    // Hold Shift to run — faster movement + the run-cycle animation (see
    // updatePlayerAnimation()), added per explicit "speed up the time to
    // view the library... if the cat can run as well as walk" request.
    this.isRunning = !!(this.runKey && this.runKey.isDown);
    const SPEED = this.isRunning ? 140 * RUN_SPEED_MULTIPLIER : 140;
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
    // Uses setDisplaySize (against each entry's own stored displayW/
    // displayH), NOT setScale(baseScale) — setScale multiplies the
    // sprite's NATIVE texture size, which silently overrides whatever
    // setDisplaySize() the entry was built with (confirmed: this is why
    // shelves/piles/gates previously rendered at their raw crop size
    // instead of LAYOUT's requested dimensions — every entry now carries
    // its own intended display size explicitly instead of relying on
    // native-size-relative scaling).
    const near = this.nearestInRange();
    const pulse = 1.08;
    this.interactives.forEach((entry) => {
      if (entry.displayW == null) return; // npc-kind entries have no sprite display size to pulse
      const factor = entry === near ? pulse : 1;
      entry.sprite.setDisplaySize(entry.displayW * factor, entry.displayH * factor);
    });
  }
}
Object.assign(N3LibraryScene.prototype, LibrarySceneEngine);

// Called by N3CatSelectScene when reopened mid-game via the dashboard's
// "Change" button (previously dead — see N3CatSelectScene below) —
// mirrors N5's LibraryScene.setPlayerCatColor (n5-phaser-game.js) exactly:
// swaps the live player's sprite without resetting position, camera, or
// progress. Added to the prototype directly (not via Object.assign above,
// since LibrarySceneEngine has no such method to clobber) for the same
// "small N3-only extension" reasoning as updateDoorGateTextures below.
N3LibraryScene.prototype.setPlayerCatColor = function (colorId) {
  this.catColorId = colorId;
  this.player.setTexture(CAT_COLORS[colorId].key);
  this.player.play(colorId + '-idle');
};

// Wraps the shared engine's refreshAllStates() (just assigned above) so
// every progress-state refresh also checks whether N3's mist should
// lift — done this way (patching the prototype after Object.assign,
// not adding a same-named method to the class body) because a class-body
// method of the same name would just get clobbered by the Object.assign
// call above; library-scene-shared.js itself stays untouched, so N5
// (which has no mist concept) is completely unaffected.
const sharedRefreshAllStates = N3LibraryScene.prototype.refreshAllStates;
N3LibraryScene.prototype.refreshAllStates = function () {
  sharedRefreshAllStates.call(this);
  this.updateN3MistState();
  this.updateDoorGateTextures();
};

// Swaps a door-gate's sprite between its locked/unlocked textures
// (drawDoorTexture) as progress changes — the shared refreshAllStates()
// only knows how to texture-swap kind:'shelf' entries (locked/filled
// crops); door gates are kind:'pile' (same interaction model as every
// other exam gate), so this is a small N3-only extension rather than
// touching the shared engine for one gate type. Only entries built with
// createExamGateEntry's `doorTextures` config are affected (currently
// just N2) — every other entry has `doorTextures` undefined and this
// loop skips it immediately.
N3LibraryScene.prototype.updateDoorGateTextures = function () {
  this.interactives.forEach((entry) => {
    if (!entry.doorTextures) return;
    const unlocked = !!this.progress[entry.id];
    entry.sprite.setTexture(unlocked ? entry.doorTextures.unlocked : entry.doorTextures.locked);
  });
};

// Wraps the shared engine's handleInteractiveClick() so click-to-walk
// routing can detour around whichever of this.n3MistBlocks exist.
//
// Why this exists: the shared routing (library-scene-shared.js) always
// sends the player through ONE fixed vertical line (x = worldW/2) on the
// way to ANY interactive, regardless of which side of the map it's on.
// Putting the N3 threshold wall's solid collision on that exact line —
// which is what "in the center hall, where the frosted wall now stands"
// requires — would silently strand click-to-walk for EVERY interactive whose route
// crosses either wall segment's Y-band, on BOTH sides (N3 and N3 share
// the same Y-levels, mirrored), not just N3's. Confirmed by tracing the
// geometry before writing any of this: with a wall placed anywhere
// between the entry point and the shelves, nearly every shelf/pile in
// the floor becomes unreachable by click — worth fixing properly rather
// than picking "a Y-band nothing currently uses" and hoping a future
// shelf/pile never lands on it.
//
// The fix: after the shared method builds its normal 3-waypoint route,
// check which (if any) of this.n3MistBlocks' body bounds the route's
// vertical segment would cross; for each one crossed (buildN3Mist()'s
// two segments sit far enough apart, north and south of the atrium,
// that a single route could in principle cross both), splice in a short
// detour around that block's east edge instead of letting the player
// walk into (and get stuck on) solid collision. Once n3-exam-gate is
// passed, this.n3MistBlocks is emptied (in updateN3MistState()) and
// every route goes back to the plain 3-waypoint path with zero overhead.
const sharedHandleInteractiveClick = N3LibraryScene.prototype.handleInteractiveClick;
N3LibraryScene.prototype.handleInteractiveClick = function (entry) {
  sharedHandleInteractiveClick.call(this, entry);
  if (!this.moveQueue || !this.n3MistBlocks || !this.n3MistBlocks.length) return;
  const [wp0, wp1, wp2] = this.moveQueue;
  if (!wp1) return; // already close enough to interact directly — no route to patch
  const segX = wp0.x; // the shared route's fixed vertical line
  const segYMin = Math.min(wp0.y, wp1.y);
  const segYMax = Math.max(wp0.y, wp1.y);
  const crossed = this.n3MistBlocks
    .map((block) => block.body)
    .filter((b) => segX >= b.left - 24 && segX <= b.right + 24 && segYMax >= b.top - 10 && segYMin <= b.bottom + 10)
    .sort((a, b) => a.top - b.top); // north-to-south, so the spliced waypoints stay in walking order
  if (!crossed.length) return; // route doesn't run through either wall segment at all
  const detourX = Math.max(...crossed.map((b) => b.right)) + 24;
  const detourWaypoints = [];
  crossed.forEach((b) => {
    detourWaypoints.push({
      x: detourX,
      y: b.top - 12
    });
    detourWaypoints.push({
      x: detourX,
      y: b.bottom + 12
    });
  });
  this.moveQueue = [{
      x: segX,
      y: wp0.y
    },
    ...detourWaypoints,
    {
      x: segX,
      y: wp1.y
    },
    wp2,
  ].filter((wp) => wp);
};

// N3's cat-color select scene — ported from N5's CatSelectScene
// (n5-phaser-game.js) to fix a dead button: n3-dashboard.html has always
// had its own "🐱 Change" button (copy-pasted from N5's dashboard
// template), but until now nothing wired it to anything, because N3/N5
// are separate `new Phaser.Game()` instances on separate page loads (see
// the CAT_COLOR_KEY comment near the top of this file) and N3 never had
// its own copy of CatSelectScene to open. N3LibraryScene itself never
// boots through this scene (it reads getSavedCatColor() directly in its
// own create() — see this.catColorId there), so unlike N5's version this
// is reached ONLY as an overlay, reopened over an already-running
// N3LibraryScene. The non-overlay boot path is kept anyway (rather than
// deleted) so this scene behaves identically to N5's copy and stays
// correct if anything ever starts N3 through it directly in the future.
class N3CatSelectScene extends Phaser.Scene {
  constructor() {
    super('N3CatSelectScene');
  }

  init(data) {
    this.isOverlay = !!(data && data.overlay);
  }

  preload() {
    loadCatSpritesheets(this);
  }

  create() {
    registerCatAnimations(this);

    if (!this.isOverlay) {
      const saved = getSavedCatColor();
      if (saved) {
        this.scene.start('N3LibraryScene');
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
    this.wasd = this.input.keyboard.addKeys({ up: 'W', down: 'S' });
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
      const libraryScene = this.scene.get('N3LibraryScene');
      libraryScene.setPlayerCatColor(colorId);
      this.scene.stop('N3CatSelectScene');
      this.scene.resume('N3LibraryScene');
    } else {
      this.scene.start('N3LibraryScene');
    }
  }

  update() {
    const upDown = this.cursors.up.isDown || this.wasd.up.isDown;
    const downDown = this.cursors.down.isDown || this.wasd.down.isDown;
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

const n3PhaserGame = new Phaser.Game({
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
    arcade: {
      debug: false
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // N3CatSelectScene registered after N3LibraryScene (opposite of N5's
  // order, where CatSelectScene is registered first since it's N5's real
  // boot scene) — N3LibraryScene is always this game's actual boot scene
  // (Phaser boots the first entry in this array), and N3CatSelectScene is
  // only ever reached later as an overlay via the "Change" button below.
  scene: [N3LibraryScene, N3CatSelectScene],
});

window.__n3Game = n3PhaserGame;

// Task 10 (additive): HUD shortcut button that opens the n3-exam-gate's
// existing menu without walking up to it. Mirrors changeCharBtn's exact
// defensive shape (n5-phaser-game.js:9621-9639) — null-safe getElementById,
// scene-active check, panelOpen guard. Reuses the real interactive entry
// (found in this.interactives, not a newly-constructed object) so
// openInteraction() routes through the exact same openQuizGateMenu/
// openQuizAttemptMenu path a walk-up interaction uses.
// Wires n3-dashboard.html's "🐱 Change" button (previously dead — see
// N3CatSelectScene above) to actually reopen the cat-select overlay.
// Mirrors N5's changeCharBtn wiring exactly (n5-phaser-game.js, near its
// own `new Phaser.Game({...})` call): null-safe getElementById, scene-
// active check, panelOpen guard so it can't stack over an open lesson/
// review/gate panel, run() + bringToTop() since N3CatSelectScene is
// registered after N3LibraryScene and would otherwise render behind the
// still-visible-while-paused map.
document.getElementById('changeCharBtn')?.addEventListener('click', () => {
  if (!n3PhaserGame.scene.isActive('N3LibraryScene')) return;
  const libraryScene = n3PhaserGame.scene.getScene('N3LibraryScene');
  if (libraryScene.panelOpen) return; // don't stack over an open lesson/review/gate panel
  n3PhaserGame.scene.pause('N3LibraryScene');
  n3PhaserGame.scene.run('N3CatSelectScene', { overlay: true });
  n3PhaserGame.scene.bringToTop('N3CatSelectScene');
});

document.getElementById('n3GateExamBtn')?.addEventListener('click', () => {
  if (!n3PhaserGame.scene.isActive('N3LibraryScene')) return;
  const libraryScene = n3PhaserGame.scene.getScene('N3LibraryScene');
  if (libraryScene.panelOpen) return; // don't stack over an open lesson/review/gate panel
  const gateEntry = libraryScene.interactives.find((e) => e.id === libraryScene.finalGateId);
  if (!gateEntry) return;
  libraryScene.openInteraction(gateEntry);
});