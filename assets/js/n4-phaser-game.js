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
const GRID_ROWS = 86;
const WORLD_W = GRID_COLS * TILE_SIZE; // 800
const WORLD_H = GRID_ROWS * TILE_SIZE; // 1376

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
  brickTile: {
    x: 30,
    y: 90,
    w: 16,
    h: 16
  }, // floors-walls02.png, n5-phaser-game.js:5
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
  // N4's own new crop (no N5 equivalent) — a freestanding grandfather
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
  // ASSET_RECTS.staircase, verbatim rect) — kept for reference; only
  // lastStairStep below is actually used by buildStairsLandmark() now
  // (see that function's comment for why). Only the top ~53% of this
  // 300px-tall crop is opaque content — the rest is transparent padding.
  staircase: {
    x: 935,
    y: 0,
    w: 100,
    h: 300
  },
  // The bottom-most tread of the same staircase asset — its rounded
  // drop-shadow terminus is the actual real end of the opaque content
  // (confirmed by alpha-scanning zoomed crops of the source sheet: the
  // staircase's visible steps end around source row 165, this rect
  // captures just the last one plus its shadow). Used as a small "one
  // step visible, the rest continues off-world toward N5" landmark at
  // the spawn corner, per explicit request to crop this real asset
  // rather than hand-draw new stair art.
  lastStairStep: {
    x: 935,
    y: 140,
    w: 100,
    h: 35
  },
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
const QUIZ_GATE_KEY = 'nekoBunko.n4.quizGate'; // N3 wing entrance exam
const N4_ENTRANCE_GATE_KEY = 'nekoBunko.n4.entranceGate';
const N2_ENTRANCE_GATE_KEY = 'nekoBunko.n4.n2Gate';
const N1_ENTRANCE_GATE_KEY = 'nekoBunko.n4.n1Gate';

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
const CAT_COLOR_ORDER = ['orange', 'black', 'white'];

function loadCatSpritesheets(scene) {
  CAT_COLOR_ORDER.forEach((id) => {
    const c = CAT_COLORS[id];
    scene.load.spritesheet(c.key, c.path, {
      frameWidth: 64,
      frameHeight: 64
    });
  });
}

// Idempotent: safe even though N4 is a separate Game instance from N5
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
      'This shelf is part of the N4 floor\'s layout, but its lesson content is still being written. Completing this page marks it done for now, and you can revisit it any time once the real lesson ships.',
    ],
  }];
}

const LESSON_CONTENT = {
  'n4-shelf-02': [{
      type: 'grammar-intro',
      sectionLabel: 'Potential Form: "Can Do"',
      bigIdea: 'The potential form turns any verb into its own "can do" — no separate ことができる construction needed once you know the conjugation.',
      explain: [
        'Every verb has a potential form: ichidan verbs swap る for られる, godan verbs shift their final u-row sound to the matching e-row sound and add る, and the two irregulars する/来る each have their own form. One more twist: the direct object marker を often shifts to が once a verb goes potential.',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Ichidan: 〜る → 〜られる',
      pattern: [{
        text: '[verb stem]',
        role: 'subject'
      }, {
        text: 'られる',
        role: 'predicate'
      }, ],
      explain: ['Drop る and add られる — the same simple swap as every other ichidan conjugation you\'ve learned.'],
      samples: [{
        tag: '"I can eat natto."',
        tiles: [{
            text: '私は',
            role: 'subject',
            gloss: 'I'
          },
          {
            text: '納豆が',
            role: 'particle',
            gloss: 'natto'
          },
          {
            text: '食べられます',
            role: 'predicate',
            gloss: 'can eat',
            isNew: true,
            smallGloss: true
          },
        ],
        translation: 'Watashi wa nattou ga taberaremasu.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Godan: final u-row → e-row + る',
      pattern: [{
        text: '[verb stem, u→e]',
        role: 'subject'
      }, {
        text: 'る',
        role: 'predicate'
      }, ],
      explain: ['Swap the verb\'s final u-sound for its e-row match, then add る — 話す (hanasu) becomes 話せる (hanaseru).'],
      samples: [{
          tag: '"I can speak Japanese."',
          tiles: [{
              text: '日本語を',
              role: 'particle',
              gloss: 'Japanese'
            },
            {
              text: '話せます',
              role: 'predicate',
              gloss: 'can speak',
              isNew: true
            },
          ],
          translation: 'Nihongo o hanasemasu.',
        },
        {
          tag: '"Can you read kanji?"',
          tiles: [{
              text: '漢字が',
              role: 'particle',
              gloss: 'kanji'
            },
            {
              text: '読めますか',
              role: 'predicate',
              gloss: 'can you read?',
              isNew: true
            },
          ],
          translation: 'Kanji ga yomemasu ka?',
        },
      ],
      cultureNote: 'Notice 漢字 takes が, not を, in the second sample — once a verb goes potential, its direct object often shifts from を to が.',
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Irregular: する → できる, 来る → 来られる',
      explain: [
        'する doesn\'t become される for potential — it swaps to a whole new word, できる ("to be able to do"). 来る follows the ichidan-style swap, becoming 来られる (korareru).',
      ],
      samples: [{
          tag: '"I can do this job."',
          tiles: [{
              text: 'この仕事が',
              role: 'particle',
              gloss: 'this job'
            },
            {
              text: 'できます',
              role: 'predicate',
              gloss: 'can do',
              isNew: true
            },
          ],
          translation: 'Kono shigoto ga dekimasu.',
        },
        {
          tag: '"I can come tomorrow."',
          tiles: [{
              text: '明日',
              role: 'particle',
              gloss: 'tomorrow'
            },
            {
              text: '来られます',
              role: 'predicate',
              gloss: 'can come',
              isNew: true,
              smallGloss: true
            },
          ],
          translation: 'Ashita koraremasu.',
        },
      ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I can speak Japanese" (Japanese = 日本語, speak = 話す):',
      before: '',
      after: '。',
      choices: ['日本語を話せます', '日本語を話します', '日本語を話しました'],
      answer: '日本語を話せます',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "Can you read kanji?" (kanji = 漢字, read = 読む):',
      before: '',
      after: 'か。',
      choices: ['漢字が読めます', '漢字を読みます', '漢字が読みました'],
      answer: '漢字が読めます',
    },
    {
      type: 'summary',
      title: 'New Patterns: Potential Form',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜られる (ichidan)',
          romaji: '~rareru',
          meaning: 'can do (ichidan verbs)'
        },
        {
          kana: '〜る→〜える (godan)',
          romaji: '~eru',
          meaning: 'can do (godan verbs)'
        },
        {
          kana: 'できる',
          romaji: 'dekiru',
          meaning: 'can do (from する)'
        },
        {
          kana: '来られる',
          romaji: 'korareru',
          meaning: 'can come'
        },
        {
          kana: '日本語を話せます',
          romaji: 'Nihongo o hanasemasu',
          meaning: 'I can speak Japanese'
        },
        {
          kana: '漢字が読めますか',
          romaji: 'Kanji ga yomemasu ka',
          meaning: 'Can you read kanji?'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '日本語を',
          after: '。',
          answer: '話せます',
          hint: '"I can speak Japanese."'
        },
        {
          before: '漢字が',
          after: 'か。',
          answer: '読めます',
          hint: '"Can you read kanji?"'
        },
      ],
    },
  ],
  'n4-shelf-03': [{
      type: 'grammar-intro',
      sectionLabel: 'Conditionals: と・ば・たら・なら',
      bigIdea: 'Japanese doesn\'t have one "if" — it has four, split by whether the outcome is automatic, a rule, a one-off guess, or advice reacting to what was just said.',
      explain: [
        'と marks an automatic, natural result. ば marks a general "if...then" rule, more formal in tone. たら is the flexible, one-time hypothetical you\'ll hear most often in speech. なら reacts to something already said — "given that/since you mentioned it."',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'と: automatic result',
      pattern: [{
        text: '[plain form]',
        role: 'subject'
      }, {
        text: 'と、[result]',
        role: 'predicate'
      }, ],
      explain: ['Use と when B always, naturally follows A — a law of nature, a habit, a fixed rule. Not for one-time plans or invitations.'],
      samples: [{
        tag: '"When spring comes, flowers bloom."',
        tiles: [{
            text: '春に',
            role: 'particle',
            gloss: 'spring'
          },
          {
            text: 'なると',
            role: 'predicate',
            gloss: 'when it becomes',
            isNew: true
          },
          {
            text: '花が',
            role: 'particle',
            gloss: 'flowers'
          },
          {
            text: '咲きます',
            role: 'predicate',
            gloss: 'bloom'
          },
        ],
        translation: 'Haru ni naru to, hana ga sakimasu.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'たら: one-time hypothetical',
      pattern: [{
        text: '[た-form]+ら',
        role: 'subject'
      }, {
        text: '、[result]',
        role: 'predicate'
      }, ],
      explain: ['Built on the plain past (た-form) plus ら. The most flexible, everyday way to say "if" — a one-off guess about a specific situation, most common in casual speech.'],
      samples: [{
        tag: '"If it rains, I won\'t go."',
        tiles: [{
            text: '雨が',
            role: 'particle',
            gloss: 'rain'
          },
          {
            text: '降ったら',
            role: 'predicate',
            gloss: 'if it falls',
            isNew: true
          },
          {
            text: '行きません',
            role: 'predicate',
            gloss: 'won\'t go'
          },
        ],
        translation: 'Ame ga futtara, ikimasen.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'ば: general rule (and なら: reacting to context)',
      explain: [
        'ば attaches to the verb\'s e-row stem + ば (行けば, "if [one] goes") and reads slightly more formal or bookish than たら — good for general truths and advice.',
        'なら doesn\'t react to a hypothetical future — it reacts to something the other person JUST said. If a friend says "I\'m going," 行くなら responds directly to that plan, not to some unrelated guess about going.',
      ],
      samples: [{
        tag: '"If you\'re going, let\'s go together."',
        tiles: [{
            text: '行くなら',
            role: 'predicate',
            gloss: 'if you\'re going (given that)',
            isNew: true,
            smallGloss: true
          },
          {
            text: '一緒に',
            role: 'predicate',
            gloss: 'together'
          },
          {
            text: '行きましょう',
            role: 'predicate',
            gloss: 'let\'s go'
          },
        ],
        translation: 'Iku nara, issho ni ikimashou.',
      }, ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "When spring comes, flowers bloom" (spring = 春, become = なる, flower = 花, bloom = 咲きます):',
      before: '',
      after: '。',
      choices: ['春になると、花が咲きます', '春になったら、花が咲きます', '春になれば、花が咲きます'],
      answer: '春になると、花が咲きます',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "If it rains, I won\'t go" (rain = 雨, fall = 降る, go = 行きます):',
      before: '',
      after: '。',
      choices: ['雨が降ったら、行きません', '雨が降ると、行きません', '雨が降るなら、行きません'],
      answer: '雨が降ったら、行きません',
    },
    {
      type: 'summary',
      title: 'New Patterns: Conditionals',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜と',
          romaji: '~to',
          meaning: 'automatic/natural result'
        },
        {
          kana: '〜ば',
          romaji: '~ba',
          meaning: 'general "if...then" (formal)'
        },
        {
          kana: '〜たら',
          romaji: '~tara',
          meaning: 'flexible one-time hypothetical'
        },
        {
          kana: '〜なら',
          romaji: '~nara',
          meaning: '"given that / since you said so"'
        },
        {
          kana: '春になると、花が咲きます',
          romaji: 'Haru ni naru to, hana ga sakimasu',
          meaning: 'When spring comes, flowers bloom'
        },
        {
          kana: '雨が降ったら、行きません',
          romaji: 'Ame ga futtara, ikimasen',
          meaning: 'If it rains, I won\'t go'
        },
        {
          kana: '行くなら、一緒に行きましょう',
          romaji: 'Iku nara, issho ni ikimashou',
          meaning: 'If you\'re going, let\'s go together'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '春に',
          after: '、花が咲きます。',
          answer: 'なると',
          hint: '"When spring comes, flowers bloom."'
        },
        {
          before: '雨が',
          after: '、行きません。',
          answer: '降ったら',
          hint: '"If it rains, I won\'t go."'
        },
      ],
    },
  ],
  'n4-shelf-04': [{
      type: 'grammar-intro',
      sectionLabel: 'Volitional & Intention',
      bigIdea: 'The volitional form is the plain-speech "let\'s/I will"; stacking と思う on top turns a decision into a tentative intention — softer than つもりだ.',
      explain: [
        'Ichidan verbs swap る for よう; godan verbs shift their final u-sound to the matching o-row sound and add う; the irregulars する/来る become しよう/来よう. Add と思う afterward to soften a plan into "I\'m thinking of doing X."',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Forming the volitional',
      pattern: [{
        text: '[godan: u→o+う]',
        role: 'subject'
      }, {
        text: '[ichidan: 〜る→よう]',
        role: 'predicate'
      }, ],
      explain: ['行く (godan) becomes 行こう (ikou); 食べる (ichidan) becomes 食べよう (tabeyou); する becomes しよう; 来る becomes 来よう.'],
      samples: [{
        tag: '"Let\'s watch a movie together next time."',
        tiles: [{
            text: '今度、',
            role: 'subject',
            gloss: 'next time'
          },
          {
            text: 'いっしょに',
            role: 'particle',
            gloss: 'together'
          },
          {
            text: '映画を',
            role: 'particle',
            gloss: 'a movie'
          },
          {
            text: '見よう',
            role: 'predicate',
            gloss: 'let\'s watch',
            isNew: true
          },
        ],
        translation: 'Kondo, issho ni eiga o miyou.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜（よ）うと思う: "I\'m thinking of doing..."',
      pattern: [{
        text: '[volitional]',
        role: 'subject'
      }, {
        text: 'と思います',
        role: 'predicate'
      }, ],
      explain: ['Stacking と思う on the volitional form softens a bare "I will" into "I\'m thinking of..." — a tentative intention, not a firm commitment.'],
      samples: [{
        tag: '"I\'m thinking of going to Japan next year."',
        tiles: [{
            text: '来年、',
            role: 'subject',
            gloss: 'next year'
          },
          {
            text: '日本へ',
            role: 'particle',
            gloss: 'to Japan'
          },
          {
            text: '行こうと',
            role: 'predicate',
            gloss: 'thinking of going',
            isNew: true,
            smallGloss: true
          },
          {
            text: '思います',
            role: 'predicate',
            gloss: 'think'
          },
        ],
        translation: 'Rainen, nihon e ikou to omoimasu.',
      }, ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "Let\'s watch a movie together" (movie = 映画, watch = 見る):',
      before: 'いっしょに映画を',
      after: '。',
      choices: ['見よう', '見ます', '見たい'],
      answer: '見よう',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I\'m thinking of going to Japan next year" (next year = 来年, Japan = 日本, go = 行く):',
      before: '来年、日本へ',
      after: '。',
      choices: ['行こうと思います', '行きます', '行こう'],
      answer: '行こうと思います',
    },
    {
      type: 'summary',
      title: 'New Patterns: Volitional & Intention',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '行こう',
          romaji: 'ikou',
          meaning: 'let\'s go / I will go (godan)'
        },
        {
          kana: '見よう',
          romaji: 'miyou',
          meaning: 'let\'s watch / I will watch (ichidan)'
        },
        {
          kana: 'しよう / 来よう',
          romaji: 'shiyou / koyou',
          meaning: 'let\'s do / let\'s come (irregular)'
        },
        {
          kana: '〜（よ）うと思います',
          romaji: '~(y)ou to omoimasu',
          meaning: 'I\'m thinking of doing...'
        },
        {
          kana: '来年、日本へ行こうと思います',
          romaji: 'Rainen, nihon e ikou to omoimasu',
          meaning: 'I\'m thinking of going to Japan next year'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: 'いっしょに映画を',
          after: '。',
          answer: '見よう',
          hint: '"Let\'s watch a movie together."'
        },
        {
          before: '来年、日本へ',
          after: '。',
          answer: '行こうと思います',
          hint: '"I\'m thinking of going to Japan next year."'
        },
      ],
    },
  ],
  'n4-shelf-06': [{
      type: 'grammar-intro',
      sectionLabel: 'Comparisons',
      bigIdea: 'To compare, you name the loser with より — the thing compared against, not the winner, takes the marker.',
      explain: [
        'Three shapes cover most comparisons: [A]は[B]より[adj] ("A is more ~ than B"), [A]は[B]ほど〜ない ("A isn\'t as ~ as B" — negative only), and AとBとどちらが〜 ("which of A and B is more...").',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜より: "more ~ than..."',
      pattern: [{
        text: '[A]は',
        role: 'subject'
      }, {
        text: '[B]より',
        role: 'particle'
      }, {
        text: '[adjective]です',
        role: 'predicate'
      }, ],
      explain: ['より marks the thing A is being compared against — B is the "loser" of the comparison, not A.'],
      samples: [{
        tag: '"The bullet train is faster than the bus."',
        tiles: [{
            text: '新幹線は',
            role: 'subject',
            gloss: 'the bullet train'
          },
          {
            text: 'バスより',
            role: 'particle',
            gloss: 'than the bus',
            isNew: true
          },
          {
            text: '速いです',
            role: 'predicate',
            gloss: 'is fast'
          },
        ],
        translation: 'Shinkansen wa basu yori hayai desu.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜ほど〜ない: "not as ~ as..."',
      pattern: [{
        text: '[A]は',
        role: 'subject'
      }, {
        text: '[B]ほど',
        role: 'particle'
      }, {
        text: '[adjective]ないです',
        role: 'predicate'
      }, ],
      explain: ['ほど always pairs with a negative predicate — there\'s no positive "as ~ as" version of this pattern.'],
      samples: [{
        tag: '"Today isn\'t as cold as yesterday."',
        tiles: [{
            text: '今日は',
            role: 'subject',
            gloss: 'today'
          },
          {
            text: '昨日ほど',
            role: 'particle',
            gloss: 'as much as yesterday',
            isNew: true,
            smallGloss: true
          },
          {
            text: '寒くないです',
            role: 'predicate',
            gloss: 'isn\'t cold'
          },
        ],
        translation: 'Kyou wa kinou hodo samukunai desu.',
      }, ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "The bullet train is faster than the bus" (bullet train = 新幹線, bus = バス, fast = 速い):',
      before: '新幹線は',
      after: '。',
      choices: ['バスより速いです', 'バスほど速いです', 'バスが速いです'],
      answer: 'バスより速いです',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "Today isn\'t as cold as yesterday" (today = 今日, yesterday = 昨日, cold = 寒い):',
      before: '今日は',
      after: '。',
      choices: ['昨日ほど寒くないです', '昨日より寒いです', '昨日ほど寒いです'],
      answer: '昨日ほど寒くないです',
    },
    {
      type: 'summary',
      title: 'New Patterns: Comparisons',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜は〜より〜です',
          romaji: '~wa ~yori ~desu',
          meaning: 'A is more ~ than B'
        },
        {
          kana: '〜は〜ほど〜ないです',
          romaji: '~wa ~hodo ~nai desu',
          meaning: 'A isn\'t as ~ as B'
        },
        {
          kana: '〜と〜とどちらが〜',
          romaji: '~to ~to dochira ga ~',
          meaning: 'which of A and B is more...'
        },
        {
          kana: '新幹線はバスより速いです',
          romaji: 'Shinkansen wa basu yori hayai desu',
          meaning: 'The bullet train is faster than the bus'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '新幹線は',
          after: '。',
          answer: 'バスより速いです',
          hint: '"The bullet train is faster than the bus."'
        },
        {
          before: '今日は',
          after: '。',
          answer: '昨日ほど寒くないです',
          hint: '"Today isn\'t as cold as yesterday."'
        },
      ],
    },
  ],
  'n4-shelf-07': [{
      type: 'grammar-intro',
      sectionLabel: 'Passive & Causative Verbs',
      bigIdea: 'Passive puts the person something happened to in the subject slot; causative puts the person forcing/allowing the action there — same conjugation family, opposite direction of control.',
      explain: [
        'Passive: godan verbs add え-row + れる (話す→話される), ichidan verbs add られる (見る→見られる). Causative: godan verbs add あ-row + せる (話す→話させる), ichidan verbs add させる (見る→見させる).',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '受け身: the passive',
      pattern: [{
        text: '[agent]に',
        role: 'particle'
      }, {
        text: '[verb, e-row/られる]',
        role: 'predicate'
      }, ],
      explain: ['The person something happened TO becomes the subject; the person who DID it is marked with に.'],
      samples: [{
        tag: '"I was praised by the teacher."',
        tiles: [{
            text: '先生に',
            role: 'particle',
            gloss: 'by the teacher'
          },
          {
            text: '褒められました',
            role: 'predicate',
            gloss: 'was praised',
            isNew: true,
            smallGloss: true
          },
        ],
        translation: 'Sensei ni homeraremashita.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '使役形: the causative',
      pattern: [{
        text: '[causer]は',
        role: 'subject'
      }, {
        text: '[target]に',
        role: 'particle'
      }, {
        text: '[verb, a-row/させる]',
        role: 'predicate'
      }, ],
      explain: ['The person forcing or allowing the action becomes the subject; the person made to do it is marked with に.'],
      samples: [{
        tag: '"My mother made me eat vegetables."',
        tiles: [{
            text: '母は',
            role: 'subject',
            gloss: 'my mother'
          },
          {
            text: '私に',
            role: 'particle',
            gloss: 'me'
          },
          {
            text: '野菜を',
            role: 'particle',
            gloss: 'vegetables'
          },
          {
            text: '食べさせました',
            role: 'predicate',
            gloss: 'made [me] eat',
            isNew: true,
            smallGloss: true
          },
        ],
        translation: 'Haha wa watashi ni yasai o tabesasemashita.',
      }, ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I was praised by the teacher" (teacher = 先生, praise = 褒める):',
      before: '',
      after: '。',
      choices: ['先生に褒められました', '先生を褒めました', '先生に褒めさせました'],
      answer: '先生に褒められました',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "My mother made me eat vegetables" (mother = 母, vegetables = 野菜, eat = 食べる):',
      before: '母は私に野菜を',
      after: '。',
      choices: ['食べさせました', '食べられました', '食べました'],
      answer: '食べさせました',
    },
    {
      type: 'summary',
      title: 'New Patterns: Passive & Causative',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜（ら）れる',
          romaji: '~(ra)reru',
          meaning: 'passive: was done to'
        },
        {
          kana: '〜（さ）せる',
          romaji: '~(sa)seru',
          meaning: 'causative: make/let someone do'
        },
        {
          kana: '先生に褒められました',
          romaji: 'Sensei ni homeraremashita',
          meaning: 'I was praised by the teacher'
        },
        {
          kana: '母は私に野菜を食べさせました',
          romaji: 'Haha wa watashi ni yasai o tabesasemashita',
          meaning: 'My mother made me eat vegetables'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '先生に',
          after: '。',
          answer: '褒められました',
          hint: '"I was praised by the teacher."'
        },
        {
          before: '母は私に野菜を',
          after: '。',
          answer: '食べさせました',
          hint: '"My mother made me eat vegetables."'
        },
      ],
    },
  ],
  'n4-shelf-08': [{
      type: 'grammar-intro',
      sectionLabel: 'Adjective + なる・する',
      bigIdea: 'なる describes something changing on its own; する describes someone deliberately making it that way — same adjective, opposite direction of agency.',
      explain: [
        'い-adjectives drop い and add くなる/くする; な-adjectives and nouns add になる/にする. One irregular: いい ("good") becomes よくなる, not いくなる.',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜くなる・〜になる: becoming',
      pattern: [{
        text: '[い-adj, drop い]+く',
        role: 'subject'
      }, {
        text: '[な-adj/noun]+に',
        role: 'subject'
      }, {
        text: 'なります',
        role: 'predicate'
      }, ],
      explain: ['なる marks a spontaneous change — nobody deliberately did this, it just happened.'],
      samples: [{
        tag: '"It became autumn, and it got cool."',
        tiles: [{
            text: '秋になって、',
            role: 'subject',
            gloss: 'it became autumn',
            isNew: true,
            smallGloss: true
          },
          {
            text: '涼しく',
            role: 'predicate',
            gloss: 'cool',
            isNew: true
          },
          {
            text: 'なりました',
            role: 'predicate',
            gloss: 'became'
          },
        ],
        translation: 'Aki ni natte, suzushiku narimashita.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜くする・〜にする: making',
      pattern: [{
        text: '[い-adj, drop い]+く',
        role: 'subject'
      }, {
        text: '[な-adj/noun]+に',
        role: 'subject'
      }, {
        text: 'します',
        role: 'predicate'
      }, ],
      explain: ['する marks a deliberate change — someone made it that way on purpose.'],
      samples: [{
        tag: '"I made the room clean."',
        tiles: [{
            text: '部屋を',
            role: 'particle',
            gloss: 'the room'
          },
          {
            text: 'きれいに',
            role: 'predicate',
            gloss: 'clean'
          },
          {
            text: 'しました',
            role: 'predicate',
            gloss: 'made [it]',
            isNew: true
          },
        ],
        translation: 'Heya o kirei ni shimashita.',
      }, ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "It became autumn, and it got cool" (autumn = 秋, cool = 涼しい, become = なる):',
      before: '',
      after: '。',
      choices: ['秋になって、涼しくなりました', '秋になって、涼しくしました', '秋にして、涼しくなりました'],
      answer: '秋になって、涼しくなりました',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I made the room clean" (room = 部屋, clean = きれい, make = する):',
      before: '部屋を',
      after: '。',
      choices: ['きれいにしました', 'きれいになりました', 'きれくしました'],
      answer: 'きれいにしました',
    },
    {
      type: 'summary',
      title: 'New Patterns: Adjective + なる・する',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜くなる / 〜になる',
          romaji: '~ku naru / ~ni naru',
          meaning: 'to become (spontaneous)'
        },
        {
          kana: '〜くする / 〜にする',
          romaji: '~ku suru / ~ni suru',
          meaning: 'to make (deliberate)'
        },
        {
          kana: '涼しくなりました',
          romaji: 'suzushiku narimashita',
          meaning: 'it got cool'
        },
        {
          kana: 'きれいにしました',
          romaji: 'kirei ni shimashita',
          meaning: 'I made it clean'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '秋になって、',
          after: '。',
          answer: '涼しくなりました',
          hint: '"It became autumn, and it got cool."'
        },
        {
          before: '部屋を',
          after: '。',
          answer: 'きれいにしました',
          hint: '"I made the room clean."'
        },
      ],
    },
  ],
  'n4-shelf-09': [{
      type: 'grammar-intro',
      sectionLabel: 'Obligation & Necessity',
      bigIdea: 'なければなりません is a double negative — "if you don\'t do X, it won\'t do" — adding up to "must." Its mirror なくてもいいです marks the same action as optional.',
      explain: [
        'Both patterns build on the plain negative (nai-form): drop い and add ければなりません/いけません for "must," or くてもいいです for "don\'t have to."',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜なければなりません: "must"',
      pattern: [{
        text: '[nai-form, drop い]',
        role: 'subject'
      }, {
        text: 'ければなりません',
        role: 'predicate'
      }, ],
      explain: ['Literally "if [I] don\'t do it, it won\'t do" — the double negative reads as an obligation.'],
      samples: [{
        tag: '"I have to submit the report by tomorrow."',
        tiles: [{
            text: '明日までに',
            role: 'particle',
            gloss: 'by tomorrow'
          },
          {
            text: 'レポートを',
            role: 'particle',
            gloss: 'the report'
          },
          {
            text: '出さなければ',
            role: 'predicate',
            gloss: 'if [I] don\'t submit',
            isNew: true,
            smallGloss: true
          },
          {
            text: 'なりません',
            role: 'predicate',
            gloss: 'won\'t do'
          },
        ],
        translation: 'Ashita made ni repooto o dasanakereba narimasen.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜なくてもいいです: "don\'t have to"',
      pattern: [{
        text: '[nai-form, drop い]',
        role: 'subject'
      }, {
        text: 'くてもいいです',
        role: 'predicate'
      }, ],
      explain: ['Marks the same action as optional — "even if [I] don\'t do it, it\'s fine."'],
      samples: [{
        tag: '"I don\'t have to go home early today."',
        tiles: [{
            text: '今日は',
            role: 'subject',
            gloss: 'today'
          },
          {
            text: '早く',
            role: 'predicate',
            gloss: 'early'
          },
          {
            text: '帰らなくても',
            role: 'predicate',
            gloss: 'even if [I] don\'t go home',
            isNew: true,
            smallGloss: true
          },
          {
            text: 'いいです',
            role: 'predicate',
            gloss: 'it\'s fine'
          },
        ],
        translation: 'Kyou wa hayaku kaeranakutemo ii desu.',
      }, ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I have to submit the report by tomorrow" (tomorrow = 明日, report = レポート, submit = 出す):',
      before: '明日までにレポートを',
      after: '。',
      choices: ['出さなければなりません', '出してもいいです', '出さなくてもいいです'],
      answer: '出さなければなりません',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I don\'t have to go home early today" (today = 今日, early = 早く, go home = 帰る):',
      before: '今日は早く',
      after: '。',
      choices: ['帰らなくてもいいです', '帰らなければなりません', '帰ってもいいです'],
      answer: '帰らなくてもいいです',
    },
    {
      type: 'summary',
      title: 'New Patterns: Obligation & Necessity',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜なければなりません',
          romaji: '~nakereba narimasen',
          meaning: 'must do...'
        },
        {
          kana: '〜なくてもいいです',
          romaji: '~nakutemo ii desu',
          meaning: 'don\'t have to do...'
        },
        {
          kana: 'レポートを出さなければなりません',
          romaji: 'Repooto o dasanakereba narimasen',
          meaning: 'I have to submit the report'
        },
        {
          kana: '早く帰らなくてもいいです',
          romaji: 'Hayaku kaeranakutemo ii desu',
          meaning: 'I don\'t have to go home early'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '明日までにレポートを',
          after: '。',
          answer: '出さなければなりません',
          hint: '"I have to submit the report by tomorrow."'
        },
        {
          before: '今日は早く',
          after: '。',
          answer: '帰らなくてもいいです',
          hint: '"I don\'t have to go home early today."'
        },
      ],
    },
  ],
  'n4-shelf-10': [{
      type: 'grammar-intro',
      sectionLabel: 'Experience & Continuation',
      bigIdea: 'たことがある reports a life experience regardless of when; ている on a past-tense verb captures what was happening/already true at one specific moment.',
      explain: [
        'Two new patterns: [た-form]+ことがあります ("have done X before") and [て-form]+いました ("was doing / had done").',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜たことがあります: past experience',
      pattern: [{
        text: '[た-form]',
        role: 'subject'
      }, {
        text: 'ことがあります',
        role: 'predicate'
      }, ],
      explain: ['Reports something you\'ve experienced at least once — the exact timing doesn\'t matter, only that it happened.'],
      samples: [{
        tag: '"I have climbed Mt. Fuji once."',
        tiles: [{
            text: '一度、',
            role: 'predicate',
            gloss: 'once'
          },
          {
            text: '富士山に',
            role: 'particle',
            gloss: 'Mt. Fuji'
          },
          {
            text: '登った',
            role: 'predicate',
            gloss: 'climbed',
            isNew: true
          },
          {
            text: 'ことがあります',
            role: 'predicate',
            gloss: 'have [done]',
            isNew: true,
            smallGloss: true
          },
        ],
        translation: 'Ichido, Fujisan ni nobotta koto ga arimasu.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜ていました: was doing / had done',
      pattern: [{
        text: '[て-form]',
        role: 'subject'
      }, {
        text: 'いました',
        role: 'predicate'
      }, ],
      explain: ['Past-tense ている captures what was already happening, or already true, at one specific moment in the past.'],
      samples: [{
        tag: '"When I called, he was sleeping."',
        tiles: [{
            text: '電話をかけたとき、',
            role: 'subject',
            gloss: 'when [I] called',
            isNew: true,
            smallGloss: true
          },
          {
            text: '彼は',
            role: 'subject',
            gloss: 'he'
          },
          {
            text: '寝ていました',
            role: 'predicate',
            gloss: 'was sleeping',
            isNew: true
          },
        ],
        translation: 'Denwa o kaketa toki, kare wa nete imashita.',
      }, ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I have climbed Mt. Fuji once" (once = 一度, Mt. Fuji = 富士山, climb = 登る):',
      before: '一度、富士山に',
      after: '。',
      choices: ['登ったことがあります', '登っています', '登ります'],
      answer: '登ったことがあります',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "When I called, he was sleeping" (call = 電話をかける, he = 彼, sleep = 寝る):',
      before: '電話をかけたとき、彼は',
      after: '。',
      choices: ['寝ていました', '寝たことがあります', '寝ます'],
      answer: '寝ていました',
    },
    {
      type: 'summary',
      title: 'New Patterns: Experience & Continuation',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜たことがあります',
          romaji: '~ta koto ga arimasu',
          meaning: 'have done X before'
        },
        {
          kana: '〜ていました',
          romaji: '~te imashita',
          meaning: 'was doing / had done'
        },
        {
          kana: '富士山に登ったことがあります',
          romaji: 'Fujisan ni nobotta koto ga arimasu',
          meaning: 'I have climbed Mt. Fuji'
        },
        {
          kana: '彼は寝ていました',
          romaji: 'Kare wa nete imashita',
          meaning: 'He was sleeping'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '一度、富士山に',
          after: '。',
          answer: '登ったことがあります',
          hint: '"I have climbed Mt. Fuji once."'
        },
        {
          before: '電話をかけたとき、彼は',
          after: '。',
          answer: '寝ていました',
          hint: '"When I called, he was sleeping."'
        },
      ],
    },
  ],
  'n4-shelf-11': [{
      type: 'grammar-intro',
      sectionLabel: 'Purpose & Preparation',
      bigIdea: 'ために is for goals you deliberately work toward; ように is for goals outside your direct control — improvement, avoidance, or someone else\'s outcome.',
      explain: [
        '[volitional/dictionary-form verb]+ために = "in order to" (same-subject, intentional goal). [potential/non-volitional verb]+ように = "so that" (a goal outside direct control, or achieved by a different subject).',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜ために: "in order to" (deliberate)',
      pattern: [{
        text: '[dictionary-form verb]',
        role: 'subject'
      }, {
        text: 'ために、[action]',
        role: 'predicate'
      }, ],
      explain: ['Use ために when the goal is something you deliberately, intentionally work toward.'],
      samples: [{
        tag: '"In order to study Japanese, I\'m going to Japan."',
        tiles: [{
            text: '日本語を',
            role: 'particle',
            gloss: 'Japanese'
          },
          {
            text: '勉強するために、',
            role: 'predicate',
            gloss: 'in order to study',
            isNew: true,
            smallGloss: true
          },
          {
            text: '日本へ',
            role: 'particle',
            gloss: 'to Japan'
          },
          {
            text: '行きます',
            role: 'predicate',
            gloss: 'go'
          },
        ],
        translation: 'Nihongo o benkyou suru tame ni, nihon e ikimasu.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜ように: "so that" (outside direct control)',
      pattern: [{
        text: '[potential/non-volitional verb]',
        role: 'subject'
      }, {
        text: 'ように、[action]',
        role: 'predicate'
      }, ],
      explain: ['Use ように when the goal isn\'t something you can just decide to do — spontaneous improvement, avoiding something, or a different subject achieving the outcome.'],
      samples: [{
        tag: '"So that I get good at Japanese, I practice every day."',
        tiles: [{
            text: '日本語が',
            role: 'particle',
            gloss: 'Japanese'
          },
          {
            text: '上手になるように、',
            role: 'predicate',
            gloss: 'so that [I] get good at',
            isNew: true,
            smallGloss: true
          },
          {
            text: '毎日',
            role: 'predicate',
            gloss: 'every day'
          },
          {
            text: '練習しています',
            role: 'predicate',
            gloss: 'practice'
          },
        ],
        translation: 'Nihongo ga jouzu ni naru you ni, mainichi renshuu shite imasu.',
      }, ],
      cultureNote: '上手になる ("to get good at") is a spontaneous change, not something you can will directly — that\'s why it takes ように, not ために.',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "In order to study Japanese, I\'m going to Japan" (Japanese = 日本語, study = 勉強する, Japan = 日本, go = 行く):',
      before: '',
      after: '。',
      choices: ['日本語を勉強するために、日本へ行きます', '日本語が上手になるように、日本へ行きます', '日本語を勉強しますが、日本へ行きます'],
      answer: '日本語を勉強するために、日本へ行きます',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "So that I get good at Japanese, I practice every day" (Japanese = 日本語, get good at = 上手になる, practice = 練習する):',
      before: '',
      after: '。',
      choices: ['日本語が上手になるように、毎日練習しています', '日本語が上手になるために、毎日練習しています', '日本語を上手にするように、毎日練習しています'],
      answer: '日本語が上手になるように、毎日練習しています',
    },
    {
      type: 'summary',
      title: 'New Patterns: Purpose & Preparation',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜ために',
          romaji: '~tame ni',
          meaning: 'in order to (deliberate goal)'
        },
        {
          kana: '〜ように',
          romaji: '~you ni',
          meaning: 'so that (goal outside direct control)'
        },
        {
          kana: '日本語を勉強するために、日本へ行きます',
          romaji: 'Nihongo o benkyou suru tame ni, nihon e ikimasu',
          meaning: 'In order to study Japanese, I\'m going to Japan'
        },
        {
          kana: '日本語が上手になるように、毎日練習しています',
          romaji: 'Nihongo ga jouzu ni naru you ni, mainichi renshuu shite imasu',
          meaning: 'So that I get good at Japanese, I practice every day'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '日本語を勉強するために、',
          after: '。',
          answer: '日本へ行きます',
          hint: '"In order to study Japanese, I\'m going to Japan."'
        },
        {
          before: '日本語が上手になるように、',
          after: '。',
          answer: '毎日練習しています',
          hint: '"So that I get good at Japanese, I practice every day."'
        },
      ],
    },
  ],
  'n4-shelf-12': [{
      type: 'grammar-intro',
      sectionLabel: 'Everyday Reading Practice',
      bigIdea: 'A casual message from a friend, using grammar from this floor — conditionals, potential form, and て-form permission — all in one everyday context.',
      explain: [
        '今度の週末、映画を見に行こうと思います。もしよかったら、いっしょに行きませんか。土曜日なら、午後に行けます。日曜日は仕事があるので、行けません。もし雨が降ったら、うちで映画を見てもいいですよ。',
        '<span class="dim">(Kondo no shuumatsu, eiga o mi ni ikou to omoimasu. Moshi yokattara, issho ni ikimasen ka. Doyoubi nara, gogo ni ikemasu. Nichiyoubi wa shigoto ga aru node, ikemasen. Moshi ame ga futtara, uchi de eiga o mitemo ii desu yo.)</span>',
      ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Comprehension check',
      prompt: 'What is this message mainly about?',
      before: '',
      after: '',
      choices: ['Weekend movie plans', 'A shopping trip', 'A work meeting'],
      answer: 'Weekend movie plans',
    },
    {
      type: 'try-it',
      sectionLabel: 'Comprehension check',
      prompt: 'On which day can the writer go in the afternoon?',
      before: '',
      after: '',
      choices: ['Saturday (土曜日)', 'Sunday (日曜日)', 'Friday (金曜日)'],
      answer: 'Saturday (土曜日)',
    },
    {
      type: 'try-it',
      sectionLabel: 'Comprehension check',
      prompt: 'Why can\'t the writer go on Sunday?',
      before: '',
      after: '',
      choices: ['They have work', 'They are sick', 'They dislike movies'],
      answer: 'They have work',
    },
    {
      type: 'summary',
      title: 'Summary: Everyday Reading Practice',
      headers: ['Phrase', 'Romaji', 'Meaning'],
      rows: [{
          kana: '今度の週末',
          romaji: 'kondo no shuumatsu',
          meaning: 'this coming weekend'
        },
        {
          kana: '見に行こうと思います',
          romaji: 'mi ni ikou to omoimasu',
          meaning: 'I\'m thinking of going to see'
        },
        {
          kana: 'もしよかったら',
          romaji: 'moshi yokattara',
          meaning: 'if you\'d like (conditional)'
        },
        {
          kana: '土曜日なら',
          romaji: 'doyoubi nara',
          meaning: 'if it\'s Saturday'
        },
        {
          kana: '午後に行けます',
          romaji: 'gogo ni ikemasu',
          meaning: 'I can go in the afternoon (potential)'
        },
        {
          kana: '仕事があるので',
          romaji: 'shigoto ga aru node',
          meaning: 'since I have work'
        },
        {
          kana: '見てもいいですよ',
          romaji: 'mitemo ii desu yo',
          meaning: 'it\'s fine to watch (permission)'
        },
      ],
    },
  ],
  'n3-shelf-02': [{
      type: 'grammar-intro',
      sectionLabel: 'Causative-Passive',
      recapChips: ['Causative & passive verbs (N4, shelf 7)'],
      bigIdea: 'Causative-passive layers "was made to" on top of causative — the unwilling receiver\'s-eye view of being forced into an action by someone else.',
      explain: [
        'Build it from the causative you already know: drop る and add られる (or the contracted される for godan verbs). たつ (godan) → 待たせる (causative) → 待たせられる/待たされる (causative-passive). 食べる (ichidan) → 食べさせる → 食べさせられる.',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Forming the causative-passive',
      pattern: [{
        text: '[causative stem]',
        role: 'subject'
      }, {
        text: 'られる／される',
        role: 'predicate'
      }, ],
      explain: ['Godan verbs often contract to される (待たせられる → 待たされる) in speech; ichidan verbs keep the full させられる with no contraction.'],
      samples: [{
        tag: '"When I was a child, I was made to eat vegetables I disliked."',
        tiles: [{
            text: '子供のとき、',
            role: 'subject',
            gloss: 'when I was a child'
          },
          {
            text: '嫌いな野菜を',
            role: 'particle',
            gloss: 'vegetables I disliked'
          },
          {
            text: '食べさせられました',
            role: 'predicate',
            gloss: 'was made to eat',
            isNew: true,
            smallGloss: true
          },
        ],
        translation: 'Kodomo no toki, kiraina yasai o tabesaseraremashita.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'The unwilling receiver\'s-eye view',
      explain: [
        'Causative-passive almost always carries a nuance of reluctance — you didn\'t want to do this, but someone with authority over you made you anyway.',
      ],
      samples: [{
        tag: '"I was made to work overtime by my boss."',
        tiles: [{
            text: '上司に',
            role: 'particle',
            gloss: 'by my boss'
          },
          {
            text: '残業させられました',
            role: 'predicate',
            gloss: 'was made to work overtime',
            isNew: true,
            smallGloss: true
          },
        ],
        translation: 'Joushi ni zangyou saseraremashita.',
      }, ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I was made to eat vegetables I disliked" (dislike = 嫌いな, vegetables = 野菜, eat = 食べる):',
      before: '嫌いな野菜を',
      after: '。',
      choices: ['食べさせられました', '食べさせました', '食べられました'],
      answer: '食べさせられました',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I was made to work overtime by my boss" (boss = 上司, overtime = 残業):',
      before: '上司に',
      after: '。',
      choices: ['残業させられました', '残業させました', '残業されました'],
      answer: '残業させられました',
    },
    {
      type: 'summary',
      title: 'New Patterns: Causative-Passive',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜させられる／〜される',
          romaji: '~saserareru / ~sareru',
          meaning: 'was made to do (unwillingly)'
        },
        {
          kana: '食べさせられました',
          romaji: 'tabesaseraremashita',
          meaning: 'was made to eat'
        },
        {
          kana: '残業させられました',
          romaji: 'zangyou saseraremashita',
          meaning: 'was made to work overtime'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '子供のとき、嫌いな野菜を',
          after: '。',
          answer: '食べさせられました',
          hint: '"When I was a child, I was made to eat vegetables I disliked."'
        },
        {
          before: '上司に',
          after: '。',
          answer: '残業させられました',
          hint: '"I was made to work overtime by my boss."'
        },
      ],
    },
  ],
  'n3-shelf-03': [{
      type: 'grammar-intro',
      sectionLabel: 'Conjecture & Hearsay',
      bigIdea: 'そうだ、ようだ、らしい all mean roughly "seems / apparently," but the source of the impression differs — a visual cue, secondhand info, your own reasoning, or a rumor you half-believe.',
      explain: [
        '[verb stem]+そうだ = a visual/sensory impression ("looks like"). [plain form]+そうだ = hearsay ("I heard that..."). [plain form]+ようだ = your own judgment from indirect evidence. [plain form, drop な on na-adj/noun]+らしい = hearsay/rumor stated with some confidence.',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜そうだ: visual impression vs. hearsay',
      pattern: [{
        text: '[verb stem]',
        role: 'subject'
      }, {
        text: 'そうです',
        role: 'predicate'
      }, ],
      explain: ['Two completely different そうだ patterns share the same word: attach it to a verb stem for a visual guess ("looks like it will..."), or to a full plain-form sentence for hearsay ("I heard that...").'],
      samples: [{
          tag: '"The sky is dark. It looks like it\'s going to rain."',
          tiles: [{
              text: '空が',
              role: 'subject',
              gloss: 'the sky'
            },
            {
              text: '暗いです。',
              role: 'predicate',
              gloss: 'is dark'
            },
            {
              text: '雨が',
              role: 'subject',
              gloss: 'rain'
            },
            {
              text: '降りそうです',
              role: 'predicate',
              gloss: 'looks like it will fall',
              isNew: true,
              smallGloss: true
            },
          ],
          translation: 'Sora ga kurai desu. Ame ga furisou desu.',
        },
        {
          tag: '"According to the forecast, it will be sunny tomorrow."',
          tiles: [{
              text: '天気予報によると、',
              role: 'particle',
              gloss: 'according to the forecast'
            },
            {
              text: '明日は',
              role: 'subject',
              gloss: 'tomorrow'
            },
            {
              text: '晴れるそうです',
              role: 'predicate',
              gloss: 'I heard it will be sunny',
              isNew: true,
              smallGloss: true
            },
          ],
          translation: 'Tenki yohou ni yoru to, ashita wa hareru sou desu.',
        },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜ようだ・〜らしい: judgment vs. rumor',
      pattern: [{
        text: '[plain form]',
        role: 'subject'
      }, {
        text: 'ようです／らしいです',
        role: 'predicate'
      }, ],
      explain: ['ようだ is your own conclusion, reasoned from indirect evidence you\'ve seen or noticed. らしい leans more on what other people say — a rumor stated with some confidence, not your own firsthand judgment.'],
      samples: [{
        tag: '"That shop\'s ramen is apparently delicious."',
        tiles: [{
            text: 'あの店の',
            role: 'subject',
            gloss: 'that shop\'s'
          },
          {
            text: 'ラーメンは',
            role: 'subject',
            gloss: 'ramen'
          },
          {
            text: 'おいしいらしいです',
            role: 'predicate',
            gloss: 'is apparently delicious',
            isNew: true,
            smallGloss: true
          },
        ],
        translation: 'Ano mise no raamen wa oishii rashii desu.',
      }, ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "It looks like it\'s going to rain" (rain = 雨, fall = 降る):',
      before: '雨が',
      after: '。',
      choices: ['降りそうです', '降るそうです', '降るらしいです'],
      answer: '降りそうです',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "That shop\'s ramen is apparently delicious" (that shop = あの店, ramen = ラーメン, delicious = おいしい):',
      before: 'あの店のラーメンは',
      after: '。',
      choices: ['おいしいらしいです', 'おいしそうです', 'おいしいです'],
      answer: 'おいしいらしいです',
    },
    {
      type: 'summary',
      title: 'New Patterns: Conjecture & Hearsay',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜そうだ (stem)',
          romaji: '~sou da',
          meaning: 'looks like (visual impression)'
        },
        {
          kana: '〜そうだ (plain form)',
          romaji: '~sou da',
          meaning: 'I heard that... (hearsay)'
        },
        {
          kana: '〜ようだ',
          romaji: '~you da',
          meaning: 'seems (own judgment)'
        },
        {
          kana: '〜らしい',
          romaji: '~rashii',
          meaning: 'apparently (rumor)'
        },
        {
          kana: '雨が降りそうです',
          romaji: 'Ame ga furisou desu',
          meaning: 'It looks like it\'s going to rain'
        },
        {
          kana: 'あの店のラーメンはおいしいらしいです',
          romaji: 'Ano mise no raamen wa oishii rashii desu',
          meaning: 'That shop\'s ramen is apparently delicious'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '空が暗いです。雨が',
          after: '。',
          answer: '降りそうです',
          hint: '"The sky is dark. It looks like it\'s going to rain."'
        },
        {
          before: 'あの店のラーメンは',
          after: '。',
          answer: 'おいしいらしいです',
          hint: '"That shop\'s ramen is apparently delicious."'
        },
      ],
    },
  ],
  'n3-shelf-04': [{
      type: 'grammar-intro',
      sectionLabel: 'Relative Clauses & Complex Modification',
      bigIdea: 'Japanese doesn\'t have a separate "who/that/which" — a full plain-form clause goes right in front of a noun, like a giant adjective.',
      explain: [
        '[clause, plain form] directly precedes the noun it modifies — no relative pronoun needed. Modifying clauses stay in plain form even inside an otherwise polite sentence, and は can\'t mark the subject inside the clause — が is used instead.',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Clause + noun: no relative pronoun',
      pattern: [{
        text: '[clause, plain form]',
        role: 'subject'
      }, {
        text: '[noun]',
        role: 'predicate'
      }, ],
      explain: ['The whole clause sits directly in front of the noun, just like a single adjective would — 昨日買った本 is literally "yesterday-bought book."'],
      samples: [{
        tag: '"The book I bought yesterday is very interesting."',
        tiles: [{
            text: '昨日買った',
            role: 'subject',
            gloss: 'bought yesterday',
            isNew: true,
            smallGloss: true
          },
          {
            text: '本は',
            role: 'subject',
            gloss: 'book'
          },
          {
            text: 'とても',
            role: 'predicate',
            gloss: 'very'
          },
          {
            text: '面白いです',
            role: 'predicate',
            gloss: 'is interesting'
          },
        ],
        translation: 'Kinou katta hon wa totemo omoshiroi desu.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'は→が inside the clause',
      explain: ['Inside a modifying clause, the subject marker switches from は to が — the clause needs its own subject marker, and は is reserved for the sentence\'s outer topic.'],
      samples: [{
        tag: '"The person who lives next door is a doctor."',
        tiles: [{
            text: '隣に',
            role: 'particle',
            gloss: 'next door'
          },
          {
            text: '住んでいる',
            role: 'predicate',
            gloss: 'lives (plain form)',
            isNew: true
          },
          {
            text: '人は',
            role: 'subject',
            gloss: 'person'
          },
          {
            text: '医者です',
            role: 'predicate',
            gloss: 'is a doctor'
          },
        ],
        translation: 'Tonari ni sunde iru hito wa isha desu.',
      }, ],
      cultureNote: 'Inside the clause 隣に住んでいる, the person doing the living has no explicit が-marked subject here because it IS the noun 人 being modified — が would only appear if a different subject were introduced inside the clause.',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "The book I bought yesterday is very interesting" (yesterday = 昨日, buy = 買う, book = 本, interesting = 面白い):',
      before: '',
      after: '。',
      choices: ['昨日買った本はとても面白いです', '昨日買う本はとても面白いです', '本は昨日買って面白いです'],
      answer: '昨日買った本はとても面白いです',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "The person who lives next door is a doctor" (next door = 隣, live = 住む, person = 人, doctor = 医者):',
      before: '',
      after: '。',
      choices: ['隣に住んでいる人は医者です', '隣は住んでいる人が医者です', '隣に住む人は医者でした'],
      answer: '隣に住んでいる人は医者です',
    },
    {
      type: 'summary',
      title: 'New Patterns: Relative Clauses',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '[clause, plain form]+[noun]',
          romaji: '(no separate word for "that/which")',
          meaning: 'a clause modifying a noun'
        },
        {
          kana: '昨日買った本',
          romaji: 'kinou katta hon',
          meaning: 'the book [I] bought yesterday'
        },
        {
          kana: '隣に住んでいる人',
          romaji: 'tonari ni sunde iru hito',
          meaning: 'the person who lives next door'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '',
          after: 'はとても面白いです。',
          answer: '昨日買った本',
          hint: '"The book I bought yesterday is very interesting."'
        },
        {
          before: '',
          after: 'は医者です。',
          answer: '隣に住んでいる人',
          hint: '"The person who lives next door is a doctor."'
        },
      ],
    },
  ],
  'n3-shelf-05': [{
      type: 'grammar-intro',
      sectionLabel: 'Formal Written Style (である体)',
      bigIdea: 'である is だ\'s formal-writing cousin — used in essays, news, and reports where です／ます would sound out of place.',
      explain: [
        '[noun／な-adjective]+である can replace な or の when linking nouns, and reads as a blunt, written-register version of だ. Once a piece of writing commits to である style, it stays in plain form throughout — mixing in です／ます mid-document reads as a mistake.',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜である: the written-register だ',
      pattern: [{
        text: '[noun／な-adjective]',
        role: 'subject'
      }, {
        text: 'である',
        role: 'predicate'
      }, ],
      explain: ['である attaches to a noun or な-adjective the same place だ or です would — just in a more formal, written register.'],
      samples: [{
          tag: '"This is a Japanese textbook."',
          tiles: [{
              text: 'これは',
              role: 'subject',
              gloss: 'this'
            },
            {
              text: '日本語の',
              role: 'particle',
              gloss: 'Japanese'
            },
            {
              text: '教科書である',
              role: 'predicate',
              gloss: 'is a textbook (formal)',
              isNew: true,
              smallGloss: true
            },
          ],
          translation: 'Kore wa nihongo no kyoukasho de aru.',
        },
        {
          tag: '"He is a famous writer."',
          tiles: [{
              text: '彼は',
              role: 'subject',
              gloss: 'he'
            },
            {
              text: '有名な',
              role: 'predicate',
              gloss: 'famous'
            },
            {
              text: '作家である',
              role: 'predicate',
              gloss: 'is a writer (formal)',
              isNew: true,
              smallGloss: true
            },
          ],
          translation: 'Kare wa yuumeina sakka de aru.',
        },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Staying consistent',
      explain: ['Once a document opens in である style, every sentence in it stays in plain form — です／ます never mixes back in, even in a polite-sounding aside. Consistency is the whole point: it signals "this is formal writing," not spoken register.'],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "This is a Japanese textbook" in である体 (this = これ, Japanese = 日本語, textbook = 教科書):',
      before: 'これは日本語の',
      after: '。',
      choices: ['教科書である', '教科書です', '教科書だった'],
      answer: '教科書である',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "He is a famous writer" in である体 (he = 彼, famous = 有名な, writer = 作家):',
      before: '彼は有名な',
      after: '。',
      choices: ['作家である', '作家です', '作家でした'],
      answer: '作家である',
    },
    {
      type: 'summary',
      title: 'New Patterns: である体',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜である',
          romaji: '~de aru',
          meaning: 'formal written "to be" (essays, reports, news)'
        },
        {
          kana: 'これは日本語の教科書である',
          romaji: 'Kore wa nihongo no kyoukasho de aru',
          meaning: 'This is a Japanese textbook'
        },
        {
          kana: '彼は有名な作家である',
          romaji: 'Kare wa yuumeina sakka de aru',
          meaning: 'He is a famous writer'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: 'これは日本語の',
          after: '。',
          answer: '教科書である',
          hint: '"This is a Japanese textbook" (formal written style).'
        },
        {
          before: '彼は有名な',
          after: '。',
          answer: '作家である',
          hint: '"He is a famous writer" (formal written style).'
        },
      ],
    },
  ],
  'n3-shelf-06': [{
      type: 'grammar-intro',
      sectionLabel: 'Advanced Keigo',
      bigIdea: 'Keigo runs two directions — sonkeigo lifts the other person\'s action up, kenjougo lowers your own action down.',
      explain: [
        'Sonkeigo (尊敬語, "respect language"): お+[verb stem]+になる — used for what someone ELSE does. Kenjougo (謙譲語, "humble language"): お+[verb stem]+する／いたす — used for what YOU do, humbling your own action relative to the listener.',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '尊敬語: raising the other person',
      pattern: [{
        text: 'お',
        role: 'particle'
      }, {
        text: '[verb stem]',
        role: 'subject'
      }, {
        text: 'になる',
        role: 'predicate'
      }, ],
      explain: ['Use sonkeigo for a customer, boss, teacher, or anyone you\'re showing respect to — never for your own actions.'],
      samples: [{
        tag: '"The president has already gone home."',
        tiles: [{
            text: '社長は',
            role: 'subject',
            gloss: 'the president'
          },
          {
            text: 'もう',
            role: 'predicate',
            gloss: 'already'
          },
          {
            text: 'お帰りになりました',
            role: 'predicate',
            gloss: 'went home (respectful)',
            isNew: true,
            smallGloss: true
          },
        ],
        translation: 'Shachou wa mou okaeri ni narimashita.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '謙譲語: lowering yourself',
      pattern: [{
        text: 'お',
        role: 'particle'
      }, {
        text: '[verb stem]',
        role: 'subject'
      }, {
        text: 'する／いたす',
        role: 'predicate'
      }, ],
      explain: ['Use kenjougo for your OWN actions when speaking to someone above you — humbling yourself is itself a form of respect. いたす is even more formal than する.'],
      samples: [{
        tag: '"I will wait here."',
        tiles: [{
            text: 'こちらで',
            role: 'particle',
            gloss: 'here'
          },
          {
            text: 'お待ちいたします',
            role: 'predicate',
            gloss: 'will wait (humble)',
            isNew: true,
            smallGloss: true
          },
        ],
        translation: 'Kochira de omachi itashimasu.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Memorized irregular pairs',
      dividedIntro: true,
      explain: ['Some of the most common verbs skip the お〜になる／お〜する pattern entirely and use their own irregular sonkeigo/kenjougo words instead — these have to be memorized individually.'],
      terms: [{
          role: 'subject',
          name: '言う → おっしゃる (尊敬) / 申す (謙譲)',
          desc: 'to say'
        },
        {
          role: 'predicate',
          name: '行く・来る → いらっしゃる (尊敬) / 参る (謙譲)',
          desc: 'to go / to come'
        },
        {
          role: 'subject',
          name: '食べる → 召し上がる (尊敬) / いただく (謙譲)',
          desc: 'to eat'
        },
      ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "The president has already gone home" using sonkeigo (president = 社長, already = もう, go home = 帰る):',
      before: '社長はもう',
      after: '。',
      choices: ['お帰りになりました', 'お帰りしました', '帰りました'],
      answer: 'お帰りになりました',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I will wait here" using kenjougo (here = こちら, wait = 待つ):',
      before: 'こちらで',
      after: '。',
      choices: ['お待ちいたします', 'お待ちになります', '待ちます'],
      answer: 'お待ちいたします',
    },
    {
      type: 'summary',
      title: 'New Patterns: Advanced Keigo',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: 'お〜になる',
          romaji: 'o~ni naru',
          meaning: 'sonkeigo: respectful, for someone else\'s action'
        },
        {
          kana: 'お〜する／いたす',
          romaji: 'o~suru / itasu',
          meaning: 'kenjougo: humble, for your own action'
        },
        {
          kana: '社長はお帰りになりました',
          romaji: 'Shachou wa okaeri ni narimashita',
          meaning: 'The president went home (respectful)'
        },
        {
          kana: 'こちらでお待ちいたします',
          romaji: 'Kochira de omachi itashimasu',
          meaning: 'I will wait here (humble)'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '社長はもう',
          after: '。',
          answer: 'お帰りになりました',
          hint: '"The president has already gone home" (sonkeigo).'
        },
        {
          before: 'こちらで',
          after: '。',
          answer: 'お待ちいたします',
          hint: '"I will wait here" (kenjougo).'
        },
      ],
    },
  ],
  'n3-shelf-07': [{
      type: 'grammar-intro',
      sectionLabel: 'Conjunction Nuances',
      bigIdea: 'ものの、くせに、というより all connect contrasting ideas, but the emotional temperature differs — ものの is neutral/formal, くせに is accusatory, and というより isn\'t really contrast at all, it\'s correcting your own word choice.',
      explain: [
        '[plain form]+ものの = neutral concession ("that said..."). [plain form／な-adj+な]+くせに = critical "even though" (implies annoyance). [phrase]+というより = "rather than saying A, actually B" (self-correction).',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜ものの: neutral concession',
      pattern: [{
        text: '[plain form]',
        role: 'subject'
      }, {
        text: 'ものの、[contrast]',
        role: 'predicate'
      }, ],
      explain: ['ものの reads as calm and even slightly formal — "that said..." — with no judgment attached to either half.'],
      samples: [{
        tag: '"Although the price is high, the quality is very good."',
        tiles: [{
            text: '値段は',
            role: 'subject',
            gloss: 'the price'
          },
          {
            text: '高いものの、',
            role: 'predicate',
            gloss: 'is high, that said',
            isNew: true,
            smallGloss: true
          },
          {
            text: '品質は',
            role: 'subject',
            gloss: 'the quality'
          },
          {
            text: 'とてもいいです',
            role: 'predicate',
            gloss: 'is very good'
          },
        ],
        translation: 'Nedan wa takai monono, hinshitsu wa totemo ii desu.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜くせに: critical "even though"',
      pattern: [{
        text: '[plain form／な-adj+な]',
        role: 'subject'
      }, {
        text: 'くせに、[criticism]',
        role: 'predicate'
      }, ],
      explain: ['くせに carries real annoyance — it points out a contradiction the speaker finds irritating, not just neutral fact.'],
      samples: [{
        tag: '"Even though he was late, he doesn\'t even apologize."',
        tiles: [{
            text: '遅刻したくせに、',
            role: 'subject',
            gloss: 'even though [he] was late',
            isNew: true,
            smallGloss: true
          },
          {
            text: '謝りもしない',
            role: 'predicate',
            gloss: 'doesn\'t even apologize',
            isNew: true
          },
        ],
        translation: 'Chikoku shita kuse ni, ayamari mo shinai.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜というより: self-correction, not contrast',
      pattern: [{
        text: '[A]というより、',
        role: 'subject'
      }, {
        text: '[B]',
        role: 'predicate'
      }, ],
      explain: ['というより isn\'t contrasting two opposing facts — it\'s the speaker correcting their own word choice: "rather than saying A, it\'s more accurate to say B."'],
      samples: [{
        tag: '"It\'s not so much that I like it — I need it."',
        tiles: [{
            text: '好きというより、',
            role: 'subject',
            gloss: 'rather than saying [I] like it',
            isNew: true,
            smallGloss: true
          },
          {
            text: '必要なんです',
            role: 'predicate',
            gloss: 'it\'s [that I] need it'
          },
        ],
        translation: 'Suki to iu yori, hitsuyou nan desu.',
      }, ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "Although the price is high, the quality is very good" (price = 値段, high = 高い, quality = 品質):',
      before: '値段は',
      after: '。',
      choices: ['高いものの、品質はとてもいいです', '高いくせに、品質はとてもいいです', '高いというより、品質はとてもいいです'],
      answer: '高いものの、品質はとてもいいです',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "Even though he was late, he doesn\'t even apologize" (be late = 遅刻する, apologize = 謝る):',
      before: '',
      after: '。',
      choices: ['遅刻したくせに、謝りもしない', '遅刻したものの、謝りもしない', '遅刻したというより、謝りもしない'],
      answer: '遅刻したくせに、謝りもしない',
    },
    {
      type: 'summary',
      title: 'New Patterns: Conjunction Nuances',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜ものの',
          romaji: '~monono',
          meaning: 'that said... (neutral concession)'
        },
        {
          kana: '〜くせに',
          romaji: '~kuse ni',
          meaning: 'even though... (critical, annoyed)'
        },
        {
          kana: '〜というより',
          romaji: '~to iu yori',
          meaning: 'rather than saying A, actually B'
        },
        {
          kana: '値段は高いものの、品質はいいです',
          romaji: 'Nedan wa takai monono, hinshitsu wa ii desu',
          meaning: 'Although the price is high, the quality is good'
        },
        {
          kana: '遅刻したくせに、謝りもしない',
          romaji: 'Chikoku shita kuse ni, ayamari mo shinai',
          meaning: 'Even though he was late, he doesn\'t even apologize'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '値段は',
          after: '。',
          answer: '高いものの、品質はとてもいいです',
          hint: '"Although the price is high, the quality is very good."'
        },
        {
          before: '',
          after: '。',
          answer: '遅刻したくせに、謝りもしない',
          hint: '"Even though he was late, he doesn\'t even apologize."'
        },
      ],
    },
  ],
  'n3-shelf-08': [{
      type: 'grammar-intro',
      sectionLabel: 'Extended Reading Practice',
      bigIdea: 'A short blog-style post about convenience-store culture in Japan, using a relative clause and a conjecture form from this wing\'s earlier shelves.',
      explain: [
        '最近、近所にできたコンビニに毎日行っている。24時間開いている店は、夜遅くに帰るときも安心である。店員がいつも笑顔で挨拶してくれるので、疲れているときも少し元気になる。日本のコンビニは、ただ物を買うだけの場所ではなく、公共料金の支払いや荷物の受け取りもできるらしい。生活に欠かせない存在になっているようだ。',
        '<span class="dim">(Saikin, kinjo ni dekita konbini ni mainichi itte iru. Nijuu-yo jikan aite iru mise wa, yoru osoku ni kaeru toki mo anshin de aru. Ten\'in ga itsumo egao de aisatsu shite kureru node, tsukarete iru toki mo sukoshi genki ni naru. Nihon no konbini wa, tada mono o kau dake no basho de wa naku, koukyou ryoukin no shiharai ya nimotsu no uketori mo dekiru rashii. Seikatsu ni kakasenai sonzai ni natte iru you da.)</span>',
      ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Comprehension check',
      prompt: 'What does the writer say makes them feel a little better even when tired?',
      before: '',
      after: '',
      choices: ['The clerk\'s smiling greeting', 'The store\'s low prices', 'The store\'s music'],
      answer: 'The clerk\'s smiling greeting',
    },
    {
      type: 'try-it',
      sectionLabel: 'Comprehension check',
      prompt: 'According to the passage, what else can you do at a convenience store besides buy things (referent: それ／この点)?',
      before: '',
      after: '',
      choices: ['Pay utility bills and receive packages', 'Get a haircut', 'Rent a car'],
      answer: 'Pay utility bills and receive packages',
    },
    {
      type: 'try-it',
      sectionLabel: 'Comprehension check',
      prompt: 'What is the writer\'s overall point about convenience stores?',
      before: '',
      after: '',
      choices: ['They\'ve become an indispensable part of daily life', 'They are too expensive', 'They should open even later'],
      answer: 'They\'ve become an indispensable part of daily life',
    },
    {
      type: 'summary',
      title: 'Summary: Extended Reading Practice',
      headers: ['Phrase', 'Romaji', 'Meaning'],
      rows: [{
          kana: '近所にできたコンビニ',
          romaji: 'kinjo ni dekita konbini',
          meaning: 'the convenience store that opened nearby (relative clause)'
        },
        {
          kana: '24時間開いている店',
          romaji: 'nijuu-yo jikan aite iru mise',
          meaning: 'a store that\'s open 24 hours (relative clause)'
        },
        {
          kana: '公共料金の支払い',
          romaji: 'koukyou ryoukin no shiharai',
          meaning: 'utility bill payment'
        },
        {
          kana: '荷物の受け取り',
          romaji: 'nimotsu no uketori',
          meaning: 'package pickup'
        },
        {
          kana: '〜できるらしい',
          romaji: '~dekiru rashii',
          meaning: 'apparently you can... (hearsay)'
        },
        {
          kana: '〜になっているようだ',
          romaji: '~ni natte iru you da',
          meaning: 'it seems to have become... (own judgment)'
        },
      ],
    },
  ],
  'n3-shelf-09': [{
      type: 'grammar-intro',
      sectionLabel: 'Tendency & Appearance',
      bigIdea: 'がち、っぽい、気味 all mean "kind of / tends to," but they don\'t overlap — がち is a bad recurring habit, っぽい is a surface impression, 気味 is a slight symptom you\'re noticing.',
      explain: [
        '[verb stem]+がち = a recurring, often negative habit. [noun／adjective stem]+っぽい = a passing quality or "-ish" appearance. [noun／verb stem]+気味 = a slight symptom or leaning, often physical or mental.',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜がち: a bad recurring habit',
      pattern: [{
        text: '[verb stem]',
        role: 'subject'
      }, {
        text: 'がちです',
        role: 'predicate'
      }, ],
      explain: ['がち marks something that happens more often than it should — usually framed as a shortcoming.'],
      samples: [{
        tag: '"Lately I tend to skip breakfast."',
        tiles: [{
            text: '最近、',
            role: 'predicate',
            gloss: 'lately'
          },
          {
            text: '朝ご飯を',
            role: 'particle',
            gloss: 'breakfast'
          },
          {
            text: '抜きがちです',
            role: 'predicate',
            gloss: 'tend to skip',
            isNew: true,
            smallGloss: true
          },
        ],
        translation: 'Saikin, asagohan o nukigachi desu.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜っぽい・〜気味: surface impression vs. slight symptom',
      pattern: [{
        text: '[noun／adj-stem]',
        role: 'subject'
      }, {
        text: 'っぽい／気味',
        role: 'predicate'
      }, ],
      explain: ['っぽい describes how something LOOKS or COMES ACROSS on the surface — an impression, not a deep truth. 気味 flags a slight, often physical or mental symptom you\'ve started to notice in yourself.'],
      samples: [{
          tag: '"He has a childish personality."',
          tiles: [{
              text: '彼は',
              role: 'subject',
              gloss: 'he'
            },
            {
              text: '子供っぽい',
              role: 'predicate',
              gloss: 'childish (-ish)',
              isNew: true,
              smallGloss: true
            },
            {
              text: '性格です',
              role: 'predicate',
              gloss: 'personality'
            },
          ],
          translation: 'Kare wa kodomoppoi seikaku desu.',
        },
        {
          tag: '"I\'ve been feeling a bit under the weather lately."',
          tiles: [{
              text: '最近、',
              role: 'predicate',
              gloss: 'lately'
            },
            {
              text: '風邪気味です',
              role: 'predicate',
              gloss: 'a bit of a cold coming on',
              isNew: true,
              smallGloss: true
            },
          ],
          translation: 'Saikin, kazegimi desu.',
        },
      ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "Lately I tend to skip breakfast" (lately = 最近, breakfast = 朝ご飯, skip = 抜く):',
      before: '最近、朝ご飯を',
      after: '。',
      choices: ['抜きがちです', '抜きっぽいです', '抜き気味です'],
      answer: '抜きがちです',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I\'ve been feeling a bit under the weather lately" (lately = 最近, cold = 風邪):',
      before: '最近、',
      after: '。',
      choices: ['風邪気味です', '風邪がちです', '風邪っぽいです'],
      answer: '風邪気味です',
    },
    {
      type: 'summary',
      title: 'New Patterns: Tendency & Appearance',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜がち',
          romaji: '~gachi',
          meaning: 'tends to (bad recurring habit)'
        },
        {
          kana: '〜っぽい',
          romaji: '~ppoi',
          meaning: '-ish (surface impression)'
        },
        {
          kana: '〜気味',
          romaji: '~gimi',
          meaning: 'a slight symptom / leaning'
        },
        {
          kana: '朝ご飯を抜きがちです',
          romaji: 'Asagohan o nukigachi desu',
          meaning: 'I tend to skip breakfast'
        },
        {
          kana: '風邪気味です',
          romaji: 'Kazegimi desu',
          meaning: 'I\'m feeling a bit under the weather'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '最近、朝ご飯を',
          after: '。',
          answer: '抜きがちです',
          hint: '"Lately I tend to skip breakfast."'
        },
        {
          before: '最近、',
          after: '。',
          answer: '風邪気味です',
          hint: '"I\'ve been feeling a bit under the weather lately."'
        },
      ],
    },
  ],
  'n3-shelf-10': [{
      type: 'grammar-intro',
      sectionLabel: 'Restriction & Emphasis',
      bigIdea: 'だけ／しか both mean "only," but だけ is neutral while しか forces a negative verb and reads more emphatically final; さえ pushes further into "even this minimal/surprising case."',
      explain: [
        '[noun]+だけ + affirmative = neutral "only." [noun]+しか + negative = stronger "nothing but." [noun]+さえ (usually with a negative or extreme case) = "even."',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜だけ vs. 〜しか〜ない',
      pattern: [{
        text: '[noun]',
        role: 'subject'
      }, {
        text: 'だけ／しか〜ない',
        role: 'predicate'
      }, ],
      explain: ['だけ is neutral and pairs with an affirmative verb. しか MUST pair with a negative verb, and reads as more emphatic — almost complaining about how little there is.'],
      samples: [{
          tag: '"I only have 1,000 yen [and that\'s enough]."',
          tiles: [{
              text: '千円だけ',
              role: 'particle',
              gloss: 'only 1,000 yen',
              isNew: true,
              smallGloss: true
            },
            {
              text: '持っています',
              role: 'predicate',
              gloss: 'have'
            },
          ],
          translation: 'Sen\'en dake motte imasu.',
        },
        {
          tag: '"I have nothing but 1,000 yen."',
          tiles: [{
              text: '千円しか',
              role: 'particle',
              gloss: 'nothing but 1,000 yen',
              isNew: true,
              smallGloss: true
            },
            {
              text: '持っていません',
              role: 'predicate',
              gloss: 'don\'t have'
            },
          ],
          translation: 'Sen\'en shika motte imasen.',
        },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜さえ: "even"',
      pattern: [{
        text: '[noun]',
        role: 'subject'
      }, {
        text: 'さえ、[extreme case]',
        role: 'predicate'
      }, ],
      explain: ['さえ picks a minimal or surprising example to make a point — "even this simplest case is true, so of course everything else is too."'],
      samples: [{
        tag: '"It\'s a problem even a child can understand."',
        tiles: [{
            text: '子供でさえ',
            role: 'particle',
            gloss: 'even a child',
            isNew: true,
            smallGloss: true
          },
          {
            text: '分かる',
            role: 'predicate',
            gloss: 'can understand'
          },
          {
            text: '問題です',
            role: 'predicate',
            gloss: 'is a problem'
          },
        ],
        translation: 'Kodomo de sae wakaru mondai desu.',
      }, ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I have nothing but 1,000 yen" (1,000 yen = 千円, have = 持つ):',
      before: '',
      after: '。',
      choices: ['千円しか持っていません', '千円だけ持っています', '千円さえ持っています'],
      answer: '千円しか持っていません',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "It\'s a problem even a child can understand" (child = 子供, understand = 分かる, problem = 問題):',
      before: '',
      after: '。',
      choices: ['子供でさえ分かる問題です', '子供だけ分かる問題です', '子供しか分かる問題です'],
      answer: '子供でさえ分かる問題です',
    },
    {
      type: 'summary',
      title: 'New Patterns: Restriction & Emphasis',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜だけ',
          romaji: '~dake',
          meaning: 'only (neutral, affirmative)'
        },
        {
          kana: '〜しか〜ない',
          romaji: '~shika ~nai',
          meaning: 'nothing but (emphatic, negative)'
        },
        {
          kana: '〜さえ',
          romaji: '~sae',
          meaning: 'even (minimal/extreme case)'
        },
        {
          kana: '千円しか持っていません',
          romaji: 'Sen\'en shika motte imasen',
          meaning: 'I have nothing but 1,000 yen'
        },
        {
          kana: '子供でさえ分かる問題です',
          romaji: 'Kodomo de sae wakaru mondai desu',
          meaning: 'It\'s a problem even a child can understand'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '',
          after: '持っていません。',
          answer: '千円しか',
          hint: '"I have nothing but 1,000 yen."'
        },
        {
          before: '',
          after: '分かる問題です。',
          answer: '子供でさえ',
          hint: '"It\'s a problem even a child can understand."'
        },
      ],
    },
  ],
  'n3-shelf-11': [{
      type: 'grammar-intro',
      sectionLabel: 'Abstract Expressions',
      bigIdea: 'はず、わけ、わけではない all turn a clause into an abstract judgment — はず is what should logically follow, わけ explains why something is the way it is, わけではない politely walks back a broad assumption without fully denying it.',
      explain: [
        '[plain form]+はずです = "should be the case" (expectation from known facts). [plain form]+わけです = "that\'s why / it means that" (logical conclusion). [plain form]+わけではない = "it\'s not that..." (partial denial, leaves room for nuance).',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜はずです: logical expectation',
      pattern: [{
        text: '[plain form]',
        role: 'subject'
      }, {
        text: 'はずです',
        role: 'predicate'
      }, ],
      explain: ['はず is a confident expectation based on facts you already know — not a guess, a conclusion.'],
      samples: [{
        tag: '"He should have already left."',
        tiles: [{
            text: '彼は',
            role: 'subject',
            gloss: 'he'
          },
          {
            text: 'もう',
            role: 'predicate',
            gloss: 'already'
          },
          {
            text: '出発したはずです',
            role: 'predicate',
            gloss: 'should have left',
            isNew: true,
            smallGloss: true
          },
        ],
        translation: 'Kare wa mou shuppatsu shita hazu desu.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜わけです・〜わけではない: explaining and softening',
      pattern: [{
        text: '[plain form]',
        role: 'subject'
      }, {
        text: 'わけです／わけではない',
        role: 'predicate'
      }, ],
      explain: ['わけです connects a reason to its natural conclusion — "given X, that\'s why Y." わけではない partially denies a broad statement someone might assume, without fully rejecting it.'],
      samples: [{
          tag: '"He lived in Japan for a whole 3 years, so that\'s why his Japanese is good."',
          tiles: [{
              text: '3年も',
              role: 'particle',
              gloss: 'a whole 3 years'
            },
            {
              text: '日本に住んでいたから、',
              role: 'predicate',
              gloss: 'since [he] lived in Japan'
            },
            {
              text: '日本語が上手なわけです',
              role: 'predicate',
              gloss: 'that\'s why [his] Japanese is good',
              isNew: true,
              smallGloss: true
            },
          ],
          translation: 'San-nen mo nihon ni sunde ita kara, nihongo ga jouzuna wake desu.',
        },
        {
          tag: '"It\'s not that I have no money, but I don\'t want to spend it right now."',
          tiles: [{
              text: 'お金が',
              role: 'subject',
              gloss: 'money'
            },
            {
              text: 'ないわけではないですが、',
              role: 'predicate',
              gloss: 'it\'s not that [I] have none',
              isNew: true,
              smallGloss: true
            },
            {
              text: '今は',
              role: 'subject',
              gloss: 'right now'
            },
            {
              text: '使いたくないです',
              role: 'predicate',
              gloss: 'don\'t want to spend'
            },
          ],
          translation: 'Okane ga nai wake dewa nai desu ga, ima wa tsukaitakunai desu.',
        },
      ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "He should have already left" (he = 彼, already = もう, leave = 出発する):',
      before: '彼はもう',
      after: '。',
      choices: ['出発したはずです', '出発したわけです', '出発したらしいです'],
      answer: '出発したはずです',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "It\'s not that I have no money" (money = お金, have = ある):',
      before: 'お金が',
      after: 'が、今は使いたくないです。',
      choices: ['ないわけではないです', 'ないはずです', 'ないわけです'],
      answer: 'ないわけではないです',
    },
    {
      type: 'summary',
      title: 'New Patterns: Abstract Expressions',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜はずです',
          romaji: '~hazu desu',
          meaning: 'should be the case (expectation)'
        },
        {
          kana: '〜わけです',
          romaji: '~wake desu',
          meaning: 'that\'s why / it means that (conclusion)'
        },
        {
          kana: '〜わけではないです',
          romaji: '~wake dewa nai desu',
          meaning: 'it\'s not that... (partial denial)'
        },
        {
          kana: '彼はもう出発したはずです',
          romaji: 'Kare wa mou shuppatsu shita hazu desu',
          meaning: 'He should have already left'
        },
        {
          kana: 'お金がないわけではないです',
          romaji: 'Okane ga nai wake dewa nai desu',
          meaning: 'It\'s not that I have no money'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '彼はもう',
          after: '。',
          answer: '出発したはずです',
          hint: '"He should have already left."'
        },
        {
          before: 'お金が',
          after: 'が、今は使いたくないです。',
          answer: 'ないわけではないです',
          hint: '"It\'s not that I have no money, but I don\'t want to spend it right now."'
        },
      ],
    },
  ],
  'n3-shelf-12': [{
      type: 'grammar-intro',
      sectionLabel: 'Advanced Reading Practice',
      bigIdea: 'An essay-style passage in である体 about Japan\'s shifting work culture, weaving in keigo, an advanced conjunction, and an abstract expression from this wing\'s earlier shelves.',
      explain: [
        '近年、日本企業においてもリモートワークを導入する動きが広がっている。通勤時間が短くなるものの、同僚と直接顔を合わせる機会は減っているようだ。ある上司は「無理に出社させる必要はない」とおっしゃっていたが、実際にはまだオフィスに来ることを求める会社も多いらしい。この変化は、単なる働き方の問題というより、日本社会全体の価値観の転換であるように思われる。もちろん、全ての仕事が在宅でできるわけではない。しかし、技術が発達した今、その可能性は着実に広がっているはずである。',
        '<span class="dim">(Kinnen, nihon kigyou ni oite mo rimooto waaku o dounyuu suru ugoki ga hirogatte iru. Tsuukin jikan ga mijikaku naru monono, douryou to chokusetsu kao o awaseru kikai wa hette iru you da. Aru joushi wa "muri ni shussha saseru hitsuyou wa nai" to osshatte ita ga, jissai ni wa mada ofisu ni kuru koto o motomeru kaisha mo ooi rashii. Kono henka wa, tannaru hatarakikata no mondai to iu yori, nihon shakai zentai no kachikan no tenkan de aru you ni omowareru. Mochiron, subete no shigoto ga zaitaku de dekiru wake de wa nai. Shikashi, gijutsu ga hattatsu shita ima, sono kanousei wa chakujitsu ni hirogatte iru hazu de aru.)</span>',
      ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Comprehension check',
      prompt: 'What claim does the writer make about the meaning of this shift toward remote work?',
      before: '',
      after: '',
      choices: ['It reflects a shift in Japanese society\'s values', 'It has no real significance', 'It will disappear soon'],
      answer: 'It reflects a shift in Japanese society\'s values',
    },
    {
      type: 'try-it',
      sectionLabel: 'Comprehension check',
      prompt: 'What does 「この変化」("this change") refer to?',
      before: '',
      after: '',
      choices: ['The spread of remote work', 'A rise in commute times', 'A change in company leadership'],
      answer: 'The spread of remote work',
    },
    {
      type: 'try-it',
      sectionLabel: 'Comprehension check',
      prompt: 'What is the writer\'s overall stance on the future of remote work?',
      before: '',
      after: '',
      choices: ['Its possibilities will likely keep expanding', 'It should be banned entirely', 'It has already failed'],
      answer: 'Its possibilities will likely keep expanding',
    },
    {
      type: 'summary',
      title: 'Summary: Advanced Reading Practice',
      headers: ['Phrase', 'Romaji', 'Meaning'],
      rows: [{
          kana: '動きが広がっている',
          romaji: 'ugoki ga hirogatte iru',
          meaning: 'the movement is spreading'
        },
        {
          kana: '短くなるものの',
          romaji: 'mijikaku naru monono',
          meaning: 'although it becomes shorter (concession)'
        },
        {
          kana: 'とおっしゃっていた',
          romaji: 'to osshatte ita',
          meaning: 'said [quoting, sonkeigo]'
        },
        {
          kana: '単なる問題というより',
          romaji: 'tannaru mondai to iu yori',
          meaning: 'rather than simply a matter of...'
        },
        {
          kana: 'できるわけではない',
          romaji: 'dekiru wake de wa nai',
          meaning: 'it\'s not that [it] can be done (partial denial)'
        },
        {
          kana: '広がっているはずである',
          romaji: 'hirogatte iru hazu de aru',
          meaning: 'should be expanding (である体 + expectation)'
        },
      ],
    },
  ],
  'n4-review-1': buildPlaceholderLesson('N4 Grammar Foundations Review'),
  'n4-review-2': buildPlaceholderLesson('N4 Vocabulary & Usage Review'),
  'n3-review-1': buildPlaceholderLesson('N3 Grammar Expansion Review'),
  'n3-review-2': buildPlaceholderLesson('N3 Nuance & Conversation Review'),
  'n4-shelf-01': [{
      type: 'grammar-intro',
      sectionLabel: 'て-form Requests & Permission',
      recapChips: ['て-form itself (N5, shelf 13)'],
      bigIdea: 'You already know て-form as a connector. N4 adds two new jobs for it: asking permission, and granting or denying it.',
      explain: [
        'Two new patterns this shelf: [て-form] + もいいです ("you may...") and [て-form] + はいけません ("you must not..."). Both attach to the exact same て-form you already built back in N5.',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜てもいいです: "You may..."',
      pattern: [{
        text: '[て-form]',
        role: 'subject'
      }, {
        text: 'もいいです',
        role: 'predicate'
      }, ],
      explain: ['Grants permission — literally "even if you do [X], it\'s fine."'],
      samples: [{
        tag: '"You may go home."',
        tiles: [{
            text: '帰っても',
            role: 'subject',
            gloss: 'even if you go home',
            isNew: true,
            smallGloss: true
          },
          {
            text: 'いいです',
            role: 'predicate',
            gloss: 'it\'s fine'
          },
        ],
        translation: 'Kaettemo ii desu.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜てはいけません: "You must not..."',
      pattern: [{
        text: '[て-form]',
        role: 'subject'
      }, {
        text: 'はいけません',
        role: 'predicate'
      }, ],
      explain: ['Denies permission — "as for doing [X], it won\'t do."'],
      samples: [{
        tag: '"You must not eat here."',
        tiles: [{
            text: 'ここで',
            role: 'subject',
            gloss: 'here'
          },
          {
            text: '食べては',
            role: 'predicate',
            gloss: 'as for eating',
            isNew: true,
            smallGloss: true
          },
          {
            text: 'いけません',
            role: 'predicate',
            gloss: 'won\'t do'
          },
        ],
        translation: 'Koko de tabete wa ikemasen.',
      }, ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "You may sit" (sit = 座って):',
      before: '',
      after: '。',
      choices: ['座ってもいいです', '座ってはいけません', '座ります'],
      answer: '座ってもいいです',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "You must not write here" (here = ここで, write = 書いて):',
      before: '',
      after: '。',
      choices: ['ここで書いてはいけません', 'ここで書いてもいいです', 'ここで書きます'],
      answer: 'ここで書いてはいけません',
    },
    {
      type: 'summary',
      title: 'New Patterns: Permission',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜てもいいです',
          romaji: '~temo ii desu',
          meaning: 'you may...'
        },
        {
          kana: '〜てはいけません',
          romaji: '~tewa ikemasen',
          meaning: 'you must not...'
        },
        {
          kana: '帰ってもいいです',
          romaji: 'kaettemo ii desu',
          meaning: 'you may go home'
        },
        {
          kana: '食べてはいけません',
          romaji: 'tabetewa ikemasen',
          meaning: 'you must not eat'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '座って',
          after: '。',
          answer: 'もいいです',
          hint: '"You may sit."'
        },
        {
          before: 'ここで書いて',
          after: '。',
          answer: 'はいけません',
          hint: '"You must not write here."'
        },
      ],
    },
  ],
  'n4-shelf-05': [{
      type: 'grammar-intro',
      sectionLabel: 'Giving & Receiving',
      bigIdea: 'Japanese has three different verbs for "give/receive" depending on WHO is giving to WHOM — English just uses "give" for all of it.',
      explain: [
        'あげる (give, moving away from you), もらう (receive), くれる (give, moving toward you) — the verb itself encodes the direction, not just who\'s speaking.',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'あげる: giving (away from you)',
      pattern: [{
        text: '[giver]は',
        role: 'subject'
      }, {
        text: '[receiver]に',
        role: 'particle'
      }, {
        text: '[thing]を',
        role: 'particle'
      }, {
        text: 'あげます',
        role: 'predicate'
      }, ],
      explain: ['Use あげる when you (or someone else) give something to another person — the giving moves away from the speaker\'s side.'],
      samples: [{
        tag: '"I gave my friend a book."',
        tiles: [{
            text: '私は',
            role: 'subject',
            gloss: 'I'
          },
          {
            text: '友達に',
            role: 'particle',
            gloss: 'to my friend'
          },
          {
            text: '本を',
            role: 'particle',
            gloss: 'a book'
          },
          {
            text: 'あげました',
            role: 'predicate',
            gloss: 'gave',
            isNew: true
          },
        ],
        translation: 'Watashi wa tomodachi ni hon o agemashita.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'もらう: receiving',
      pattern: [{
        text: '[receiver]は',
        role: 'subject'
      }, {
        text: '[giver]に',
        role: 'particle'
      }, {
        text: '[thing]を',
        role: 'particle'
      }, {
        text: 'もらいます',
        role: 'predicate'
      }, ],
      explain: ['もらう flips the perspective to the receiver\'s side — same event as あげる, described from the other direction.'],
      samples: [{
        tag: '"I received a book from my friend."',
        tiles: [{
            text: '私は',
            role: 'subject',
            gloss: 'I'
          },
          {
            text: '友達に',
            role: 'particle',
            gloss: 'from my friend'
          },
          {
            text: '本を',
            role: 'particle',
            gloss: 'a book'
          },
          {
            text: 'もらいました',
            role: 'predicate',
            gloss: 'received',
            isNew: true
          },
        ],
        translation: 'Watashi wa tomodachi ni hon o moraimashita.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'くれる: giving (toward you)',
      pattern: [{
        text: '[giver]は',
        role: 'subject'
      }, {
        text: '私に',
        role: 'particle'
      }, {
        text: '[thing]を',
        role: 'particle'
      }, {
        text: 'くれます',
        role: 'predicate'
      }, ],
      explain: ['くれる is only for gifts moving TOWARD the speaker (or the speaker\'s in-group) — never used for the speaker\'s own giving.'],
      samples: [{
        tag: '"My friend gave me a book."',
        tiles: [{
            text: '友達は',
            role: 'subject',
            gloss: 'my friend'
          },
          {
            text: '私に',
            role: 'particle',
            gloss: 'to me'
          },
          {
            text: '本を',
            role: 'particle',
            gloss: 'a book'
          },
          {
            text: 'くれました',
            role: 'predicate',
            gloss: 'gave (to me)',
            isNew: true
          },
        ],
        translation: 'Tomodachi wa watashi ni hon o kuremashita.',
      }, ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "My friend gave me a book" (friend = 友達, book = 本):',
      before: '友達は私に本を',
      after: '。',
      choices: ['くれました', 'あげました', 'もらいました'],
      answer: 'くれました',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I gave my friend a book":',
      before: '私は友達に本を',
      after: '。',
      choices: ['あげました', 'くれました', 'もらいました'],
      answer: 'あげました',
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜てあげる・〜てくれる: doing someone a favor',
      pattern: [{
        text: '[て-form]',
        role: 'subject'
      }, {
        text: 'あげる／くれる',
        role: 'predicate'
      }, ],
      explain: [
        'Attach あげる or くれる to a て-form instead of a noun, and the verb now describes a FAVOR — an action done for someone, not just a thing handed over. The same away-from-you (あげる) / toward-you (くれる) direction rules from the bare verbs still apply.',
      ],
      samples: [{
          tag: '"I taught my friend Japanese (as a favor)."',
          tiles: [{
              text: '私は',
              role: 'subject',
              gloss: 'I'
            },
            {
              text: '友達に',
              role: 'particle',
              gloss: 'to my friend'
            },
            {
              text: '日本語を',
              role: 'particle',
              gloss: 'Japanese'
            },
            {
              text: '教えてあげました',
              role: 'predicate',
              gloss: 'taught, as a favor',
              isNew: true,
              smallGloss: true
            },
          ],
          translation: 'Watashi wa tomodachi ni nihongo o oshiete agemashita.',
        },
        {
          tag: '"My friend helped me with my homework."',
          tiles: [{
              text: '友達が',
              role: 'subject',
              gloss: 'my friend'
            },
            {
              text: '宿題を',
              role: 'particle',
              gloss: 'homework'
            },
            {
              text: '手伝ってくれました',
              role: 'predicate',
              gloss: 'helped [me], as a favor',
              isNew: true,
              smallGloss: true
            },
          ],
          translation: 'Tomodachi ga shukudai o tetsudatte kuremashita.',
        },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜てもらう: having someone do you a favor',
      pattern: [{
        text: '[て-form]',
        role: 'subject'
      }, {
        text: 'もらう',
        role: 'predicate'
      }, ],
      explain: [
        'てもらう flips the perspective to the receiver\'s side, same as bare もらう — "I had [someone] do [X] for me," described from your own point of view.',
      ],
      samples: [{
        tag: '"I had my friend help me with my homework."',
        tiles: [{
            text: '私は',
            role: 'subject',
            gloss: 'I'
          },
          {
            text: '友達に',
            role: 'particle',
            gloss: 'from my friend'
          },
          {
            text: '宿題を',
            role: 'particle',
            gloss: 'homework'
          },
          {
            text: '手伝ってもらいました',
            role: 'predicate',
            gloss: 'had [them] help, as a favor',
            isNew: true,
            smallGloss: true
          },
        ],
        translation: 'Watashi wa tomodachi ni shukudai o tetsudatte moraimashita.',
      }, ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "My friend helped me with my homework" (friend = 友達, homework = 宿題, help = 手伝う):',
      before: '友達が',
      after: '。',
      choices: ['宿題を手伝ってくれました', '宿題を手伝ってあげました', '宿題を手伝ってもらいました'],
      answer: '宿題を手伝ってくれました',
    },
    {
      type: 'summary',
      title: 'New Patterns: Giving & Receiving',
      headers: ['Verb', 'Romaji', 'Meaning'],
      rows: [{
          kana: 'あげる',
          romaji: 'ageru',
          meaning: 'give (away from speaker)'
        },
        {
          kana: 'もらう',
          romaji: 'morau',
          meaning: 'receive'
        },
        {
          kana: 'くれる',
          romaji: 'kureru',
          meaning: 'give (toward speaker)'
        },
        {
          kana: '〜てあげる',
          romaji: '~te ageru',
          meaning: 'do a favor for someone (away from speaker)'
        },
        {
          kana: '〜てもらう',
          romaji: '~te morau',
          meaning: 'have someone do a favor for you'
        },
        {
          kana: '〜てくれる',
          romaji: '~te kureru',
          meaning: 'someone does you a favor (toward speaker)'
        },
        {
          kana: '友達が宿題を手伝ってくれました',
          romaji: 'Tomodachi ga shukudai o tetsudatte kuremashita',
          meaning: 'My friend helped me with my homework'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: '友達は私に本を',
          after: '。',
          answer: 'くれました',
          hint: '"My friend gave me a book."'
        },
        {
          before: '私は友達に本を',
          after: '。',
          answer: 'あげました',
          hint: '"I gave my friend a book."'
        },
      ],
    },
  ],
  'n3-shelf-01': [{
      type: 'grammar-intro',
      sectionLabel: '〜ておく・〜てしまう',
      recapChips: ['て-form itself (N4, shelf 1)'],
      bigIdea: 'Two more jobs for て-form: doing something in advance/leaving it as-is (ておく), and doing something completely/with a sense of regret (てしまう).',
      explain: [
        'Both attach to the exact same て-form from N4 — no new conjugation to learn, just two new meanings on top of it.',
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜ておく: preparing / leaving as-is',
      pattern: [{
        text: '[て-form]',
        role: 'subject'
      }, {
        text: 'おきます',
        role: 'predicate'
      }, ],
      explain: ['ておく marks an action done in advance, in preparation for something later — or simply leaving something as it is on purpose.'],
      samples: [{
        tag: '"I\'ll buy the tickets in advance."',
        tiles: [{
            text: 'チケットを',
            role: 'subject',
            gloss: 'tickets'
          },
          {
            text: '買って',
            role: 'predicate',
            gloss: 'buy (て-form)'
          },
          {
            text: 'おきます',
            role: 'predicate',
            gloss: 'in advance',
            isNew: true
          },
        ],
        translation: 'Chiketto o katte okimasu.',
      }, ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜てしまう: completing / regret',
      pattern: [{
        text: '[て-form]',
        role: 'subject'
      }, {
        text: 'しまいます',
        role: 'predicate'
      }, ],
      explain: ['てしまう marks an action finished completely — often with a nuance of "and now I can\'t undo it" or mild regret.'],
      samples: [{
        tag: '"I ended up reading the whole book."',
        tiles: [{
            text: '本を',
            role: 'subject',
            gloss: 'the book'
          },
          {
            text: '全部',
            role: 'predicate',
            gloss: 'all',
            isNew: true
          },
          {
            text: '読んで',
            role: 'predicate',
            gloss: 'read (て-form)'
          },
          {
            text: 'しまいました',
            role: 'predicate',
            gloss: 'ended up (completely)',
            isNew: true
          },
        ],
        translation: 'Hon o zenbu yonde shimaimashita.',
      }, ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I\'ll buy the tickets in advance" (tickets = チケット, buy = 買って):',
      before: 'チケットを買って',
      after: '。',
      choices: ['おきます', 'しまいます', 'あります'],
      answer: 'おきます',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I ended up reading the whole book" (book = 本, all = 全部, read = 読んで):',
      before: '本を全部読んで',
      after: '。',
      choices: ['しまいました', 'おきました', 'もらいました'],
      answer: 'しまいました',
    },
    {
      type: 'summary',
      title: 'New Patterns: 〜ておく・〜てしまう',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [{
          kana: '〜ておく',
          romaji: '~te oku',
          meaning: 'do in advance / leave as-is'
        },
        {
          kana: '〜てしまう',
          romaji: '~te shimau',
          meaning: 'do completely / regretfully'
        },
        {
          kana: '買っておきます',
          romaji: 'katte okimasu',
          meaning: 'buy in advance'
        },
        {
          kana: '読んでしまいました',
          romaji: 'yonde shimaimashita',
          meaning: 'ended up reading (all of it)'
        },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [{
          before: 'チケットを買って',
          after: '。',
          answer: 'おきます',
          hint: '"I\'ll buy the tickets in advance."'
        },
        {
          before: '本を全部読んで',
          after: '。',
          answer: 'しまいました',
          hint: '"I ended up reading the whole book."'
        },
      ],
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
// LESSON_CONTENT. n4-dashboard.html does NOT load n5-phaser-game.js (only
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
// doesn't hold for n4-dashboard.html, so it's copied verbatim below too;
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

// Shared furigana helper — wraps a kanji string with its kana reading as
// native <ruby>/<rt> (styled in lesson-box.css, scoped to .lesson-box), so
// every diagram/table that shows a kanji word can add its reading with
// one call instead of hand-writing the ruby markup each time. Falls back
// to the bare word when no reading is given (kana-only words like レストラン
// don't need one).
function furigana(word, reading) {
  return reading ? `<ruby>${word}<rt>${reading}</rt></ruby>` : word;
}

// cropJukeboxTexture moved to library-scene-shared.js (Task: jukebox in
// every floor's hall, N4/N3/N5 alike) — reusable now that more than one
// scene needs the same crop, instead of a copy per file.

// -- Layout constants: positioning for shelves, piles, exam gate (Task 4) ----
// North (top) = deeper into the building, toward a future N2 stub (not
// built this pass). South (bottom) = arrival point from N5's
// staircase. Mirrors N5's own spawn-south / stairs-north shape (see
// LAYOUT's doc comment in n5-phaser-game.js) at N4/N3's larger scale.
// leftColX = N4 shelves throughout every row; rightColX = N3 shelves
// throughout every row (not arbitrary sub-columns of one topic, like
// N5's shape — a real per-side split, per explicit feedback). Y values
// are a first pass — expect to retune them live against actual
// rendered shelf/furniture sizes, exactly as every N5 row/gap constant
// was tuned over many rounds (see that file's own comments for
// precedent) — this is normal for this codebase, not a gap in this plan.
const shelfW = 87; // same "big furniture" reference size N5 uses — unchanged, real pixel art
const shelfH = 64;
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
// rows as N4's (just the right column) — visible-but-locked the whole
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
const wing3RowY = [442, 511]; // shelves 09-12
const review3Y = 385; // gates nothing further (last N4/N3 group) — required by n3-exam-gate
const wing2RowY = [664, 733]; // shelves 05-08
const review2Y = 593; // N4 review-2 (left) / N3 review-2 (right) — gates shelf-09
const wing1RowY = [887, 956]; // shelves 01-04, nearest entry
const review1Y = 815; // N4 review-1 (left) / N3 review-1 (right) — gates shelf-05
const centerpieceY = 1062; // N4/N3's globe-equivalent decorative landmark
// Player spawn — moved into the literal southwest corner per explicit
// follow-up feedback (flush against both the west wall and the south
// wall, matching the annotated screenshot), just a few pixels north of
// the stairs landing itself. NOTE: this REOPENS the "exactly 12 tiles
// from stairs to first shelf" constraint from the map-shrink pass —
// the distance from here to wing1RowY[1] is no longer 192px/12 tiles
// (it's now ~330px/~20.6 tiles). Flagged, not silently dropped — see
// this session's report for the tradeoff; ask if wing1 should move
// closer to restore the exact 12-tile distance from this new spawn.
const entryY = 1313; // a few px north of the last-stair-step landmark's own top edge (see buildStairsLandmark)
const entryX = 94; // centered on the last-stair-step landmark's own footprint

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
  review1Y,
  review2Y,
  review3Y,
  centerpieceY,
  entryY,
  entryX,
  atriumLeft,
  atriumWidth,
  atriumTop,
  atriumHeight,
};

// -- Progression data: lessons, prereqs, review piles, exam gate (Tasks 5-7) --
// Task 5 (this task) adds the data structures. Task 6 builds the sprites.
// Task 7 populates LESSON_CONTENT with actual pages for selected shelves.

// 16 total shelves: 8 N4 (left column, Grammar Foundations + Vocabulary & Usage wings),
// 8 N3 (right column, Grammar Expansion + Nuance & Conversation wings). Only
// n4-shelf-01, n4-shelf-05, n3-shelf-01 get full content this pass; the rest
// get placeholder pages in Task 7.
const LESSON_DATA = [
  // N4 side (left column) — Grammar Foundations wing.
  {
    id: 'n4-shelf-01',
    title: 'て-form Requests & Permission'
  },
  {
    id: 'n4-shelf-02',
    title: 'Potential Form'
  },
  {
    id: 'n4-shelf-03',
    title: 'Conditionals (と・ば・たら・なら)'
  },
  {
    id: 'n4-shelf-04',
    title: 'Volitional & Intention'
  },
  // N4 side (left column) — Vocabulary & Usage wing.
  {
    id: 'n4-shelf-05',
    title: 'Giving & Receiving'
  },
  {
    id: 'n4-shelf-06',
    title: 'Comparisons'
  },
  {
    id: 'n4-shelf-07',
    title: 'Passive & Causative Verbs'
  },
  {
    id: 'n4-shelf-08',
    title: 'Adjective + なる・する'
  },
  {
    id: 'n4-shelf-09',
    title: 'Obligation & Necessity'
  },
  {
    id: 'n4-shelf-10',
    title: 'Experience & Continuation'
  },
  {
    id: 'n4-shelf-11',
    title: 'Purpose & Preparation'
  },
  {
    id: 'n4-shelf-12',
    title: 'Everyday Reading Practice'
  },
  // N3 side (right column) — Grammar Expansion wing. Locked behind
  // n3-exam-gate until both N4 review piles are complete.
  {
    id: 'n3-shelf-01',
    title: '〜ておく・〜てしまう'
  },
  {
    id: 'n3-shelf-02',
    title: 'Causative-Passive'
  },
  {
    id: 'n3-shelf-03',
    title: 'Conjecture & Hearsay (そうだ・ようだ・らしい)'
  },
  {
    id: 'n3-shelf-04',
    title: 'Relative Clauses & Complex Modification'
  },
  // N3 side (right column) — Nuance & Conversation wing.
  {
    id: 'n3-shelf-05',
    title: 'Formal Written Style (である体)'
  },
  {
    id: 'n3-shelf-06',
    title: 'Advanced Keigo'
  },
  {
    id: 'n3-shelf-07',
    title: 'Conjunction Nuances (ものの・くせに・というより)'
  },
  {
    id: 'n3-shelf-08',
    title: 'Extended Reading Practice'
  },
  {
    id: 'n3-shelf-09',
    title: 'Tendency & Appearance'
  },
  {
    id: 'n3-shelf-10',
    title: 'Restriction & Emphasis'
  },
  {
    id: 'n3-shelf-11',
    title: 'Abstract Expressions'
  },
  {
    id: 'n3-shelf-12',
    title: 'Advanced Reading Practice'
  },
];

// N4 chain (left column) — n4-shelf-01 is always available, it's the
// floor's entry point. N3 chain (right column) — n3-shelf-01's prereq
// is the exam gate itself (not null), so the ENTIRE right column stays
// locked until it's passed; the rest of the N3 chain then works exactly
// like N4's own internal chaining.
// Review-pile cadence matches N5's exactly (see n5-phaser-game.js's own
// SHELF_PREREQ, shelf-05/09/13 each gated by the previous group's review
// pile): a pile after every 4 shelves, not after 4 then 8. n4-shelf-09's
// prereq used to be a plain linear 'n4-shelf-08' (no pile in between) —
// changed to 'n4-review-2' so the 8-shelf Vocabulary & Usage wing splits
// into two real 4-shelf review checkpoints, same as N3's mirror.
const SHELF_PREREQ = {
  'n4-shelf-01': 'n4-exam-gate',
  'n4-shelf-02': 'n4-shelf-01',
  'n4-shelf-03': 'n4-shelf-02',
  'n4-shelf-04': 'n4-shelf-03',
  'n4-shelf-05': 'n4-review-1',
  'n4-shelf-06': 'n4-shelf-05',
  'n4-shelf-07': 'n4-shelf-06',
  'n4-shelf-08': 'n4-shelf-07',
  'n4-shelf-09': 'n4-review-2',
  'n4-shelf-10': 'n4-shelf-09',
  'n4-shelf-11': 'n4-shelf-10',
  'n4-shelf-12': 'n4-shelf-11',
  'n3-shelf-01': 'n3-exam-gate',
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
};

// Six review piles now: 3 for N4 progression, 3 for N3 progression — one
// per 4-shelf group, matching N5's own cadence (BOOK_PILE_DATA there is
// 4 piles for 16 shelves, i.e. exactly this same "1 per 4" rule). Each
// review pile's requires array lists all shelves that must be completed
// before this pile becomes available (same pattern as SHELF_PREREQ, but
// review piles are accessed via BOOK_PILE_DATA in buildBookPiles()).
const BOOK_PILE_DATA = [{
    id: 'n4-review-1',
    title: 'N4 Grammar Foundations Review',
    requires: ['n4-shelf-01', 'n4-shelf-02', 'n4-shelf-03', 'n4-shelf-04']
  },
  {
    id: 'n4-review-2',
    title: 'N4 Vocabulary & Usage Review',
    requires: ['n4-shelf-05', 'n4-shelf-06', 'n4-shelf-07', 'n4-shelf-08']
  },
  {
    id: 'n4-review-3',
    title: 'N4 Advanced Usage Review',
    requires: ['n4-shelf-09', 'n4-shelf-10', 'n4-shelf-11', 'n4-shelf-12']
  },
  {
    id: 'n3-review-1',
    title: 'N3 Grammar Expansion Review',
    requires: ['n3-shelf-01', 'n3-shelf-02', 'n3-shelf-03', 'n3-shelf-04']
  },
  {
    id: 'n3-review-2',
    title: 'N3 Nuance & Conversation Review',
    requires: ['n3-shelf-05', 'n3-shelf-06', 'n3-shelf-07', 'n3-shelf-08']
  },
  {
    id: 'n3-review-3',
    title: 'N3 Advanced Expression Review',
    requires: ['n3-shelf-09', 'n3-shelf-10', 'n3-shelf-11', 'n3-shelf-12']
  },
];

// The N4→N3 gate: reuses the same quiz-gate mechanic N5's staircase has
// (3-attempt/24h-cooldown). Built as a physical interactive in Task 6
// (kind: 'pile'-shaped for interaction model consistency), but the content
// and scoring differ: it's a standalone exam, not a recap+quiz review pile.
// Every N3 shelf's prereq chain roots on it — the entire right column stays
// locked until this exam is passed. Requires all 3 N4 review piles now
// (was 2, back when N4 only had 2 piles total).
const EXAM_GATE_DATA = {
  n4: {
    id: 'n4-exam-gate',
    title: 'N4 Entrance Exam',
    requires: []
  },
  n3: {
    id: 'n3-exam-gate',
    title: 'N3 Entrance Exam',
    requires: ['n4-review-1', 'n4-review-2', 'n4-review-3']
  },
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
// 7373-7562), copied verbatim rather than referenced — n4-dashboard.html
// does NOT load n5-phaser-game.js (only library-scene-shared.js), so
// these generic, scene-only helpers (no N5-specific data referenced
// anywhere in their bodies) aren't reachable as bare identifiers here.
// Kept byte-for-byte identical to the N5 versions so both floors' shelves
// render with the same plaque/trinket/checkmark chrome.

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
    fontFamily: '"Press Start 2P", "DotGothic16", monospace',
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
  const key = `n4BookshelfLabelTex_${bookshelfLabelSeq}`;
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
// checkmark variant for 'completed'. Keyed with an n4-prefixed anim/
// texture key since N4 is a separate Game instance (separate texture/
// anim registries from N5) but shares the page's global JS scope with
// no other floor's script — no actual collision risk, just kept
// consistent with this file's n4-prefixing convention elsewhere.
let n4ShelfTrinketAnimKey = null;

function buildShelfTrinketAnim(scene) {
  if (n4ShelfTrinketAnimKey) return n4ShelfTrinketAnimKey;
  n4ShelfTrinketAnimKey = 'n4ShelfTrinketLoad';

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
    const key = `n4ShelfTrinketFrame${segFilled}`;
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
    key: n4ShelfTrinketAnimKey,
    frames,
    frameRate: 3,
    repeat: -1
  });
  return n4ShelfTrinketAnimKey;
}

let n4ShelfCompleteKey = null;

function drawShelfCompleteTexture(scene) {
  if (n4ShelfCompleteKey) return n4ShelfCompleteKey;
  n4ShelfCompleteKey = 'n4ShelfCompleteTex';

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

  const tex = scene.textures.createCanvas(n4ShelfCompleteKey, w, h);
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
  return n4ShelfCompleteKey;
}

// Procedural exam-gate DOOR texture — locked (closed, iron-braced, a
// keyhole) and unlocked (leaves parted, warm light in the gap) variants
// of the same door frame, matching this file's existing wood/brass
// palette (N4_PALETTE, the rope-and-brass fence's brass tones). Reusable
// for any future level's own entrance door — pass a distinct `key` per
// state per level (Phaser throws on re-registering a canvas key).
// config: { locked: boolean }
function drawDoorTexture(scene, key, config) {
  if (scene.textures.exists(key)) return key;
  const w = 48;
  const h = 72;
  const {
    locked
  } = config;
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;

  const frameDark = '#241209';
  const frameLight = '#5a3220';
  const woodBase = locked ? '#4a2d1d' : '#5a3a24';
  const woodGrain = locked ? '#3a2415' : '#4a2c18';
  const iron = '#1c1c1a';
  const ironHi = '#4a4a44';
  const brass = '#c9a24c';
  const brassHi = '#f0d080';
  const glow = '#f0c674';

  // Door frame (outer trim).
  ctx.fillStyle = frameDark;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = frameLight;
  ctx.fillRect(2, 2, w - 4, h - 4);

  const gap = locked ? 0 : 6; // leaves parted when unlocked
  const leafW = (w - 4 - gap) / 2;

  [0, 1].forEach((i) => {
    const lx = 2 + i * (leafW + gap);
    ctx.fillStyle = woodBase;
    ctx.fillRect(lx, 4, leafW, h - 8);
    // Vertical plank lines.
    for (let px = 4; px < leafW - 2; px += 6) {
      ctx.fillStyle = woodGrain;
      ctx.fillRect(lx + px, 4, 1, h - 8);
    }
    // Iron corner braces.
    ctx.fillStyle = iron;
    ctx.fillRect(lx, 4, leafW, 4);
    ctx.fillRect(lx, h - 8, leafW, 4);
    ctx.fillStyle = ironHi;
    ctx.fillRect(lx, 4, leafW, 1);
    ctx.fillRect(lx, h - 8, leafW, 1);
  });

  if (locked) {
    // Keyhole/lock plate, centered on the seam.
    ctx.fillStyle = brass;
    ctx.fillRect(w / 2 - 4, h / 2 - 6, 8, 12);
    ctx.fillStyle = brassHi;
    ctx.fillRect(w / 2 - 4, h / 2 - 6, 8, 1);
    ctx.fillStyle = iron;
    ctx.fillRect(w / 2 - 1, h / 2 - 3, 2, 2);
    ctx.fillRect(w / 2 - 1, h / 2, 2, 4);
  } else {
    // Warm light glowing through the parted gap.
    ctx.fillStyle = glow;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(w / 2 - gap / 2, 4, gap, h - 8);
    ctx.globalAlpha = 1;
    ctx.fillStyle = brassHi;
    ctx.fillRect(w / 2 - gap / 2 - 1, 4, 1, h - 8);
    ctx.fillRect(w / 2 + gap / 2, 4, 1, h - 8);
  }

  tex.refresh();
  return key;
}

class N4LibraryScene extends Phaser.Scene {
  constructor() {
    super('N4LibraryScene');
  }

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
    // Shelf stamp/favorite icons — same source files as N5's LibraryScene
    // preload() (n5-phaser-game.js:7576/7581), needed for Task 6's
    // buildShelves() (completion checkmark stamp + favorite floppy-disk
    // badge, both copied verbatim from that file).
    this.load.image('checkmarkIcon', '../../assets/images/ui/checkmark-1-Original.png');
    this.load.image('savePointRaw', '../../assets/images/ui/save-point-Original.png');
    // Jukebox decorative prop (Task 3) — loaded here for texture cleanup in buildJukebox()
    this.load.image('jukebox', '../../assets/images/ui/jukebox-Original.png');
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
    this.buildWingCorners();
    this.buildTopBand();
    this.buildFurniture();
    this.buildJukebox();
    this.buildStairsLandmark();
    this.buildAtrium();
    this.buildShelves();
    this.buildBookPiles();
    this.buildExamGate(); // Task 6 — the one interactive N5 has no equivalent of
    this.buildN3Mist();
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
    const map = this.make.tilemap({
      data,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE
    });
    const tileset = map.addTilesetImage('n4LibraryTiles', null, TILE_SIZE, TILE_SIZE);
    map.createLayer(0, tileset, 0, 0);
    this.floorTilemap = map;

    // Solid dark backdrop outside the room instead of transparency,
    // same as N5.
    this.cameras.main.setBackgroundColor('#2A2320');
  }

  buildWalls() {
    const blockSize = 32; // was TILE_SIZE (16) via image crop — see Task 2
    const brickKey = createBrickWallTexture(this, 'n4BrickWallTex', {
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
    const brickKey = 'n4BrickWallTex';

    const addStub = (x, y, w) => {
      this.add.tileSprite(x, y, w, stubH, brickKey).setOrigin(0, 0).setDepth(0);
      const block = this.add.rectangle(x + w / 2, y + stubH / 2, w, stubH, 0x000000, 0);
      this.physics.add.existing(block, true);
      this.wallGroup.add(block);
    };

    const topY = LAYOUT.wing3RowY[0] - stubH - 6; // in the gap between review-3's pile and wing3
    const bottomY = LAYOUT.wing1RowY[1] + LAYOUT.shelfH + 10; // just south of wing1's south row

    addStub(64, topY, stubW); // N4 spine (west, x=64 inner edge) juts east
    addStub(64, bottomY, stubW);
    addStub(WORLD_W - 64 - stubW, topY, stubW); // N3 spine (east), mirrored, juts west
    addStub(WORLD_W - 64 - stubW, bottomY, stubW);
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

  // -- Central decor (Task 6): corridor rug, centerpiece landmark, arrival
  // marker. A first pass only — denser than N5's per the design spec, but
  // that density (reading tables/sofas/TVs/reception desk) is explicitly
  // out of scope for this pass; only 3 pieces are built here.

  buildFurniture() {
    // Recolors drawWovenRug's default brick-red/tan palette to this
    // floor's deeper wine/gold accent (N4_PALETTE, declared at the top of
    // this file — this is the "consumer" that comment forward-referenced).
    // rugDark/rugFringeLight/rugWeave/rugMotifShade have no N4_PALETTE
    // equivalent yet, so those 4 stay literal; rugBase/rugMotif reuse
    // N4_PALETTE.carpet/gold directly rather than duplicating the hex.
    const n4RugPalette = {
      rugDark: 0x2a0d1a,
      rugFringeLight: 0x3a1526,
      rugBase: N4_PALETTE.carpet,
      rugWeave: 0x4a1524,
      rugMotif: N4_PALETTE.gold,
      rugMotifShade: 0xa87f3a,
    };

    // Center-corridor rug — same hand-drawn woven-runner technique as
    // N5's corridorRugTex (drawWovenRug + tileSprite for a seamless
    // vertical repeat), recolored via the palette above. Runs from just
    // below the top wall band down to just above the centerpiece
    // landmark; the arrival point near entryY gets its own separate
    // small rug below instead of one strip spanning the whole room.
    // Non-solid, like every decor piece in this file — no collider.
    const corridorX = WORLD_W / 2;
    const corridorTop = TOP_BAND_HEIGHT + 20;
    const corridorBottom = LAYOUT.entryY - 80;
    const corridorHeight = corridorBottom - corridorTop;
    const corridorMidY = (corridorTop + corridorBottom) / 2;
    const corridorWidth = 100; // wider than N5's 80 — this floor's shelf columns sit further apart
    const corridorRugRepeatH = 32;
    drawWovenRug(this, 'n4CorridorRugTex', corridorWidth, corridorRugRepeatH, n4RugPalette);
    this.add.tileSprite(corridorX, corridorMidY, corridorWidth, corridorHeight, 'n4CorridorRugTex')
      .setDepth(0);

    // Centerpiece landmark — this floor's globe-equivalent decorative
    // prop: a large freestanding grandfather clock, cropped from the same
    // libassetpack-tiled.png sheet N5's own globe/shelves come from (see
    // ASSET_RECTS.grandfatherClock for the isolation method). Centered in
    // the corridor at LAYOUT.centerpieceY, scaled just enough to read as
    // a landmark without reaching into the shelf rows immediately above
    // (wing1's south sub-row bottom edge sits at wing1RowY[1] + shelfH =
    // 1200, well clear of centerpieceY = 1360) or the arrival rug below.
    // Non-solid, like every other decor piece — centering it doesn't
    // block auto-walk.
    const clockKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.grandfatherClock, 'n4CenterpieceClockTex');
    const clockScale = 1.15;
    const clockW = ASSET_RECTS.grandfatherClock.w * clockScale;
    const clockH = ASSET_RECTS.grandfatherClock.h * clockScale;
    this.furnitureSprites.centerpiece = this.add
      .image(WORLD_W / 2, LAYOUT.centerpieceY, clockKey)
      .setOrigin(0.5, 0.5).setDepth(1).setDisplaySize(clockW, clockH);

    // Plain arrival rug at the entry point — N4 has no "Neko-sensei" desk
    // this pass (out of scope, matches the design spec's placeholder-
    // first approach), just a small accent rug (same woven technique,
    // fixed-size like N5's globeRug accents, no tiling needed) so the
    // spawn point doesn't read as bare floor. Positioned under the new
    // west-side spawn point (LAYOUT.entryX), beside the stairs landmark,
    // not center — was WORLD_W/2.
    const arrivalW = 90;
    const arrivalH = 50;
    drawWovenRug(this, 'n4ArrivalRugTex', arrivalW, arrivalH, n4RugPalette);
    this.add.image(LAYOUT.entryX, LAYOUT.entryY, 'n4ArrivalRugTex').setDepth(0);
  }

  // "Top of the stairs" landing at the west-side spawn point — a small,
  // purpose-built top-down composition (brick wall columns flanking a
  // dark floor corridor, a few visible stair treads) — REPLACED per
  // explicit follow-up feedback ("that's the last step in the
  // libassetpack-tiled.png stairs, just crop it") with a direct crop of
  // the real asset's bottom-most tread (ASSET_RECTS.lastStairStep,
  // captured at its rounded drop-shadow terminus — the genuine end of
  // the staircase's opaque content). "I don't care if the 1 step is
  // only seen" — this is deliberately a single small tread, not a full
  // staircase composition; the rest is implied to continue south,
  // off-world, toward N5. Flush against the literal southwest corner
  // (both the west wall's inner edge and the south wall). Purely
  // decorative (non-solid) — it's a single tread graphic, not a
  // structure the player could plausibly collide with.
  buildStairsLandmark() {
    const rect = ASSET_RECTS.lastStairStep;
    const scale = 0.6;
    const w = rect.w * scale;
    const h = rect.h * scale;
    const x = 64; // flush against the west wall's inner edge
    const y = (GRID_ROWS - 2) * TILE_SIZE - h; // flush against the south wall strip
    const key = cropToTexture(this, 'libAssetPack', rect, 'n4LastStairStepTex');
    this.add.image(x, y, key).setOrigin(0, 0).setDepth(1).setDisplaySize(w, h);
  }

  // The mezzanine's floor is drawn in layers rather than borrowed from a
  // bitmap: long alternating planks, fine grain, seams, and a soft warm
  // highlight read as dark hardwood even at the game's pixel scale.
  drawHardwoodFloorTexture() {
    const key = 'n4LayeredHardwoodTex';
    if (this.textures.exists(key)) return key;
    const tex = this.textures.createCanvas(key, 128, 96);
    const ctx = tex.getContext();
    ctx.fillStyle = '#301b12';
    ctx.fillRect(0, 0, 128, 96);
    for (let y = 0; y < 96; y += 16) {
      const offset = (y / 16) % 2 ? -28 : 0;
      for (let x = offset; x < 128; x += 56) {
        ctx.fillStyle = (x / 56 + y / 16) % 2 ? '#4c2b1b' : '#422417';
        ctx.fillRect(x + 1, y + 1, 54, 14);
        ctx.fillStyle = 'rgba(235, 178, 98, .10)';
        ctx.fillRect(x + 3, y + 3, 50, 1);
        ctx.fillStyle = 'rgba(15, 6, 3, .52)';
        ctx.fillRect(x, y + 15, 56, 1);
        ctx.strokeStyle = 'rgba(25, 10, 5, .36)';
        ctx.lineWidth = 1;
        for (let grain = 7; grain < 52; grain += 13) {
          ctx.beginPath();
          ctx.moveTo(x + grain, y + 5);
          ctx.lineTo(x + grain + 8, y + 6);
          ctx.stroke();
        }
      }
    }
    tex.refresh();
    return key;
  }

  // A real open central void makes the floor read as a mezzanine. The
  // subdued lower level, trim, posts, and rail caps preserve a clear view
  // down while keeping the traversal route entirely on the balconies.
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
      corridorColor: N4_PALETTE.carpet,
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
    // "OPEN ATRIUM / FIRST-FLOOR LIBRARY" label, centered inside the
    // atrium void, floating over the illustrated content.
    const labelX = left + width / 2;
    const labelY = top + height / 2 - 20;
    this.add.text(labelX, labelY, 'OPEN ATRIUM', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#e8d4a8',
      align: 'center',
    }).setOrigin(0.5).setDepth(4);
    this.add.text(labelX, labelY + 28, 'FIRST-FLOOR LIBRARY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#a89068',
      align: 'center',
    }).setOrigin(0.5).setDepth(4);
  }

  // Decorative jukebox props — one per wing, each flush against that
  // wing's own spine wall ("in front of the wall," per explicit
  // feedback — the previous single copy floated on the open rear
  // walkway with no wall behind it). Visual-only this pass (no real
  // audio; n4-dashboard.html doesn't load music-player.js and no audio
  // asset was supplied) — "the listening machine" is the intent for a
  // future pass, not this one. Non-solid, like every other decor piece.
  // Crops the shared texture ONCE (cropJukeboxTexture, now in
  // library-scene-shared.js) and reuses that one key for both wing
  // instances — re-cropping with the same destKey would throw.
  buildJukebox() {
    const texKey = cropJukeboxTexture(this, 'n4JukeboxTex');
    const scale = 0.16; // source crop is 620x870 — scales down to a footprint similar to the centerpiece clock
    const w = 620 * scale;
    const y = 1080; // clear of wing1's south row (ends y=1020) and the exam-gate row (896-1132 doesn't overlap this x)

    const placeJukebox = (x, tuneLabel) => createDecorativeProp(this, {
      x,
      y,
      textureKey: texKey,
      scale,
      depth: 2,
      onClick: () => {
        showToast(`The jukebox hums an old ${tuneLabel} tune...`);
        this.spawnNoteFlourish(x, y);
      },
    });
    placeJukebox(64 + w / 2, 'N4'); // flush against the N4 (west) spine wall
    placeJukebox(WORLD_W - 64 - w / 2, 'N3'); // flush against the N3 (east) spine wall, mirrored
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

  // Generates the 12 left-column (N4) + 12 mirrored right-column (N3)
  // shelf positions FROM LAYOUT's own Y bands. Three grid-aligned 2x2
  // groups of 4 shelves each (was a 4-then-8 split, and before that a
  // hand-scattered coordinate list with no relationship to LAYOUT at
  // all — see this file's git history) — one review pile per group now,
  // matching N5's own "1 pile per 4 shelves" cadence exactly.
  createMezzanineShelfPositions() {
    const group = (rowY) => LAYOUT.leftColX
      .flatMap((x) => [0, 1].map((r) => [x, rowY[0] + r * LAYOUT.rowStep]))
      .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    // South-to-north order (wing1 nearest entry, wing3 deepest) matches
    // LESSON_DATA's declared order (shelf-01..04, 05..08, 09..12).
    const left = [...group(LAYOUT.wing1RowY), ...group(LAYOUT.wing2RowY), ...group(LAYOUT.wing3RowY)];
    const right = left.map(([x, y]) => [WORLD_W - x - shelfW, y]);
    return [...left, ...right];
  }

  // -- 16 lesson shelves, 2 physical rows (left column = N4, right column
  // = N3 throughout — see LAYOUT's doc comment) --------------------------

  buildShelves() {
    const shelfW = LAYOUT.shelfW;
    const shelfH = LAYOUT.shelfH;

    // Matches LESSON_DATA's order (n4-shelf-01..08, n3-shelf-01..08)
    // exactly — buildShelves() zips LESSON_DATA[i] with positions[i] by
    // array index below.
    const positions = this.createMezzanineShelfPositions();

    const filledVariants = ['shelfFilled1', 'shelfFilled2', 'shelfFilled3'];
    const lockedKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.shelfLocked, 'n4ShelfLockedTex');
    const filledKeys = filledVariants.map(
      (v) => cropToTexture(this, 'libAssetPack', ASSET_RECTS[v], 'n4' + v + 'Tex')
    );
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
    }, 'n4FavoriteDiskTex');

    LESSON_DATA.forEach((lesson, i) => {
      const [x, y] = positions[i];
      // setDisplaySize below is overwritten every frame: update()'s
      // proximity-pulse loop calls entry.sprite.setScale(entry.baseScale *
      // ...) unconditionally on every interactive (baseScale: 1 here), which
      // resets the sprite back to its texture's native crop size (88x120
      // locked, up to 88x139 filled) rather than the shelfW/shelfH (87x64)
      // requested here. LAYOUT's sub-row gap (shelfH + 12) is computed
      // against the nominal 64px, not the ~120-139px shelves actually
      // render at — confirmed live (scaleY reads 1, not ~0.53) and verified
      // visually to have no rendering defect (crops carry transparent
      // padding beyond the opaque artwork), but the layout math technically
      // "works by accident." This exact setDisplaySize+per-frame-setScale
      // conflict is called out explicitly for N5's NPC props (see
      // n5-phaser-game.js's buildFurniture(), "setScale (not
      // setDisplaySize)..." comment) which deliberately use setScale
      // instead for this reason — N5's own shelves have the identical
      // conflict, unflagged, shipped without issue; this comment documents
      // it for N4 rather than silently reproducing the ambiguity.
      const sprite = this.add.image(x + shelfW / 2, y + shelfH / 2, lockedKey)
        .setOrigin(0.5, 0.5).setDepth(1)
        .setDisplaySize(shelfW, shelfH);
      const glow = this.add.sprite(x + shelfW / 2, y + shelfH / 2, 'n4ShelfTrinketFrame0')
        .setOrigin(0.5).setDepth(4).setVisible(false)
        .play(trinketAnimKey);
      const completeBadge = this.add.image(x + shelfW / 2, y + shelfH / 2, drawShelfCompleteTexture(this))
        .setOrigin(0.5).setDepth(4).setVisible(false);

      const label = createBookshelfLabel(this, x + shelfW / 2, y + shelfH - 20, lesson.title, {
        maxWidth: shelfW + 20,
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
  }

  // -- 6 review book piles (3 for N4 progression, 3 for N3) ---------------

  buildBookPiles() {
    const bookKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.bookPileTall, 'n4BookPileTex');
    this.bookPileTexKey = bookKey; // reused by buildExamGate() (same crop, must not re-cropToTexture with a duplicate destKey)

    // "Beside its own column" — same pattern as N5's buildReviewRow: each
    // pile sits just inside the corridor gap, flush against its own
    // column's inner edge. gapLeft/gapRight are that inner edge on each
    // side (mirrors buildFurniture's own gap-edge math, kept local here
    // since this floor's buildFurniture() doesn't build a table row to
    // derive it from).
    const gapLeft = LAYOUT.leftColX[1] + LAYOUT.shelfW;
    const gapRight = LAYOUT.rightColX[0];
    const scale = 0.7; // same as N5's review piles — reads as sitting "in" the shelf-row scale, not dominating it
    const w = ASSET_RECTS.bookPileTall.w * scale;
    const h = ASSET_RECTS.bookPileTall.h * scale;
    const positions = {
      'n4-review-1': {
        x: gapLeft + 16,
        y: LAYOUT.review1Y
      },
      'n4-review-2': {
        x: gapLeft + 16,
        y: LAYOUT.review2Y
      },
      'n4-review-3': {
        x: gapLeft + 16,
        y: LAYOUT.review3Y
      },
      'n3-review-1': {
        x: gapRight - 16 - w,
        y: LAYOUT.review1Y
      },
      'n3-review-2': {
        x: gapRight - 16 - w,
        y: LAYOUT.review2Y
      },
      'n3-review-3': {
        x: gapRight - 16 - w,
        y: LAYOUT.review3Y
      },
    };

    BOOK_PILE_DATA.forEach((pile) => {
      const pos = positions[pile.id];
      const sprite = this.add.image(pos.x, pos.y, bookKey).setOrigin(0, 0)
        .setDisplaySize(w, h).setDepth(1);
      const glow = this.add.text(pos.x + w - 8, pos.y - 6, '⭐', {
          fontSize: '18px'
        })
        .setOrigin(0.5).setDepth(4).setVisible(false);
      const stamp = this.add.text(pos.x + w - 8, pos.y - 6, '✅', {
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

  // -- N4/N3 entrance exam gates: interactives N5 has no equivalent of ----
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
  // hand-duplicated N4/N3 block buildExamGate() used to write out twice.
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
    const w = doorTextures ? 48 * scale : ASSET_RECTS.bookPileTall.w * scale;
    const h = doorTextures ? 72 * scale : ASSET_RECTS.bookPileTall.h * scale;
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
    // Reuses the exact same book-pile crop buildBookPiles() already
    // established (must reuse the cached key, not call cropToTexture
    // again with the same destKey — Phaser throws on re-registering a
    // canvas key). buildScene() always calls buildBookPiles() before
    // buildExamGate(), so this.bookPileTexKey is guaranteed to exist.
    const bookKey = this.bookPileTexKey;
    const scale = 1.3; // larger than the 0.7 review piles — reads as the floor's one landmark gate, not just another pile
    // Positioned in the corridor gap between the shelf column and the
    // atrium (same gapLeft/gapRight math buildBookPiles() uses for review
    // piles), just north of the spawn point — small margin kept clear of
    // both the shelf column and the atrium's rope-and-brass rail.
    const gateY = 1070;
    this.createExamGateEntry({
      id: EXAM_GATE_DATA.n4.id,
      title: EXAM_GATE_DATA.n4.title,
      x: 265,
      y: gateY,
      requires: EXAM_GATE_DATA.n4.requires,
      quizGateKey: N4_ENTRANCE_GATE_KEY,
      bookKey,
      scale,
      onPass: () => showToast('The N4 balcony is permanently open.'),
    });
    const w = ASSET_RECTS.bookPileTall.w * scale;
    // N3's gate has no visible sprite/label/glow at all now — its
    // "locked" state is presented as the full-wing violet mist
    // (buildN3Mist()) instead of a physical gate object, per explicit
    // design change. The interactive itself (this exact x/y, its
    // requires/quizGateKey/onPass, the 3-attempt/24h-cooldown flow) is
    // unchanged — hideSprite only removes what the player SEES, not the
    // interaction or unlock logic.
    this.createExamGateEntry({
      id: EXAM_GATE_DATA.n3.id,
      title: EXAM_GATE_DATA.n3.title,
      x: WORLD_W - 265 - w,
      y: gateY,
      requires: EXAM_GATE_DATA.n3.requires,
      quizGateKey: QUIZ_GATE_KEY,
      bookKey,
      scale,
      hideSprite: true,
      onPass: () => showToast('The N3 balcony is permanently open.'),
    });

    // N2 — a real pixel-art DOOR (drawDoorTexture) in the very top-right
    // corner of the N3 (right) wing — moved here per explicit follow-up
    // correction (an earlier version placed it in the N4/left wing,
    // matching this pass's ORIGINAL spec; the live feedback overrode
    // that in favor of the N3 side instead). Positioned flush toward
    // the east spine wall (WORLD_W - 64 inner edge) and as far north as
    // the top wall band allows. N1 is dropped for this pass entirely —
    // a future pass can add N1's own door once this one's design and
    // position are confirmed live.
    const doorScale = 1.4;
    const n2LockedKey = drawDoorTexture(this, 'n4N2DoorLockedTex', {
      locked: true
    });
    const n2UnlockedKey = drawDoorTexture(this, 'n4N2DoorUnlockedTex', {
      locked: false
    });
    const n2DoorW = 48 * doorScale;
    const n2X = WORLD_W - 64 - n2DoorW - 8; // flush toward the N3 (east) spine, top-right corner
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
    const doorLabel = createBookshelfLabel(this, n2Entry.x, n2Entry.y + (72 * doorScale) / 2 - 6, 'N2 Entrance Exam', {
      fontSize: 6,
      maxWidth: 90,
    });
    doorLabel.bg.setDepth(3);
    doorLabel.label.setDepth(4);
  }

  // Frosted threshold veil across the CENTER hall — literally where the
  // corridor rug lies (corridorX = WORLD_W/2), not tucked into the N3-
  // side gap — while n3-exam-gate is locked, per explicit follow-up
  // feedback. This is the one spot every click-to-walk route in the
  // scene passes through (see handleInteractiveClick's shared 3-
  // waypoint route, always via x = worldW/2), so putting real collision
  // here needed a matching fix: the N4LibraryScene.prototype patch below
  // this class detours the route around the wall's east edge whenever a
  // path would cross it, instead of leaving the player stuck against
  // solid collision mid-route. Position/size are a fixed, compact band
  // (not tied to LAYOUT.entryY, which grew a lot once spawn moved into
  // the SW corner) sitting in open floor between N2's door (ends y=216)
  // and wing3 (starts y=442) — clear of every current interactive on
  // both sides, though the detour patch is what actually guarantees
  // reachability, not this placement choice.
  buildN3Mist() {
    const top = 280;
    const height = 140;
    const veilWidth = 80;
    const veilLeft = WORLD_W / 2 - veilWidth / 2;

    this.n3MistShapes = buildThresholdVeil(this, {
      x: veilLeft,
      top,
      height,
      width: veilWidth
    });
    const block = this.add.rectangle(veilLeft + veilWidth / 2, top + height / 2, veilWidth, height, 0x000000, 0);
    this.physics.add.existing(block, true);
    this.wallGroup.add(block);
    this.n3MistBlock = block;

    this.n3MistLifted = !!this.progress['n3-exam-gate'];
    if (this.n3MistLifted) {
      this.n3MistShapes.forEach((s) => s.setVisible(false));
      this.wallGroup.remove(block, true, true); // already unlocked on load — no barrier, no leftover collider
    }
  }

  // Called after every refreshAllStates() (wrapped onto the prototype
  // just below this class, after Object.assign) — fades the veil out
  // exactly once, the first time n3-exam-gate's progress flips to
  // passed, and never re-shows it (a permanent lift, per the design's
  // explicit "lifts permanently" requirement). Also removes the solid
  // collision block immediately (not tied to the fade animation's
  // duration) — the barrier lifting is a state change, not something
  // that needs to visually "solidify away."
  updateN3MistState() {
    if (this.n3MistLifted || !this.n3MistShapes) return;
    if (!this.progress['n3-exam-gate']) return;
    this.n3MistLifted = true;
    if (this.n3MistBlock) {
      this.wallGroup.remove(this.n3MistBlock, true, true);
      this.n3MistBlock = null;
    }
    this.tweens.add({
      targets: this.n3MistShapes,
      alpha: 0,
      duration: 900,
      ease: 'Sine.In',
      onComplete: () => this.n3MistShapes.forEach((s) => s.setVisible(false)),
    });
  }

  buildPlayer() {
    // Spawns near the south end of the world, on the west side beside the
    // stairs landmark (buildStairsLandmark()) — this floor's real entry
    // point from N5's staircase. Was WORLD_W/2 (dead center, no visual
    // tie to how the player arrived); LAYOUT.entryX moves it beside the
    // reused staircase art instead.
    const spawnX = LAYOUT.entryX;
    const spawnY = LAYOUT.entryY;
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
      const dir = Math.abs(vel.x) > Math.abs(vel.y) ?
        (vel.x > 0 ? 'right' : 'left') :
        (vel.y > 0 ? 'down' : 'up');
      this.player.play(`${this.catColorId}-walk-${dir}`, true);
    } else {
      this.player.play(`${this.catColorId}-idle`, true);
    }
  }

  // N4-only (Task 10 additive HUD button): shows/hides #n3GateExamBtn based
  // on whether both N4 review piles are complete. Deliberately NOT added to
  // library-scene-shared.js (loaded by N5 too, which has no such button).
  // Caches the last-known boolean on this.n3GateBtnVisible so the DOM is
  // only touched when the value actually changes, not every frame.
  updateN3GateButtonVisibility() {
    const shouldShow = !!this.progress['n4-review-1'] && !!this.progress['n4-review-2'];
    if (this.n3GateBtnVisible === shouldShow) return;
    this.n3GateBtnVisible = shouldShow;
    const btn = document.getElementById('n3GateExamBtn');
    if (btn) btn.hidden = !shouldShow;
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
    this.updateN3GateButtonVisibility();
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
Object.assign(N4LibraryScene.prototype, LibrarySceneEngine);

// Wraps the shared engine's refreshAllStates() (just assigned above) so
// every progress-state refresh also checks whether N3's mist should
// lift — done this way (patching the prototype after Object.assign,
// not adding a same-named method to the class body) because a class-body
// method of the same name would just get clobbered by the Object.assign
// call above; library-scene-shared.js itself stays untouched, so N5
// (which has no mist concept) is completely unaffected.
const sharedRefreshAllStates = N4LibraryScene.prototype.refreshAllStates;
N4LibraryScene.prototype.refreshAllStates = function () {
  sharedRefreshAllStates.call(this);
  this.updateN3MistState();
  this.updateDoorGateTextures();
};

// Swaps a door-gate's sprite between its locked/unlocked textures
// (drawDoorTexture) as progress changes — the shared refreshAllStates()
// only knows how to texture-swap kind:'shelf' entries (locked/filled
// crops); door gates are kind:'pile' (same interaction model as every
// other exam gate), so this is a small N4-only extension rather than
// touching the shared engine for one gate type. Only entries built with
// createExamGateEntry's `doorTextures` config are affected (currently
// just N2) — every other entry has `doorTextures` undefined and this
// loop skips it immediately.
N4LibraryScene.prototype.updateDoorGateTextures = function () {
  this.interactives.forEach((entry) => {
    if (!entry.doorTextures) return;
    const unlocked = !!this.progress[entry.id];
    entry.sprite.setTexture(unlocked ? entry.doorTextures.unlocked : entry.doorTextures.locked);
  });
};

// Wraps the shared engine's handleInteractiveClick() so click-to-walk
// routing can detour around this.n3MistBlock when it exists.
//
// Why this exists: the shared routing (library-scene-shared.js) always
// sends the player through ONE fixed vertical line (x = worldW/2) on the
// way to ANY interactive, regardless of which side of the map it's on.
// Putting the N3 threshold wall's solid collision on that exact line —
// which is what "in the center hall, where the carpet lies" requires —
// would silently strand click-to-walk for EVERY interactive whose route
// crosses the wall's Y-band, on BOTH sides (N4 and N3 share the same
// Y-levels, mirrored), not just N3's. Confirmed by tracing the geometry
// before writing any of this: with the wall placed anywhere between the
// entry point and the shelves, nearly every shelf/pile in the floor
// becomes unreachable by click — worth fixing properly rather than
// picking "a Y-band nothing currently uses" and hoping a future
// shelf/pile never lands on it.
//
// The fix: after the shared method builds its normal 3-waypoint route,
// check whether the route's vertical segment would cross the wall's
// body bounds; if so, splice in a short detour around the wall's east
// edge instead of letting the player walk into (and get stuck on) solid
// collision. Once n3-exam-gate is passed, this.n3MistBlock is null
// (removed in updateN3MistState()) and every route goes back to the
// plain 3-waypoint path with zero overhead.
const sharedHandleInteractiveClick = N4LibraryScene.prototype.handleInteractiveClick;
N4LibraryScene.prototype.handleInteractiveClick = function (entry) {
  sharedHandleInteractiveClick.call(this, entry);
  if (!this.moveQueue || !this.n3MistBlock) return;
  const b = this.n3MistBlock.body;
  const [wp0, wp1, wp2] = this.moveQueue;
  if (!wp1) return; // already close enough to interact directly — no route to patch
  const segX = wp0.x; // the shared route's fixed vertical line
  if (segX < b.left - 24 || segX > b.right + 24) return; // route doesn't run through the wall's x at all
  const segYMin = Math.min(wp0.y, wp1.y);
  const segYMax = Math.max(wp0.y, wp1.y);
  if (segYMax < b.top - 10 || segYMin > b.bottom + 10) return; // no vertical overlap with the wall
  const detourX = b.right + 24;
  this.moveQueue = [{
      x: segX,
      y: wp0.y
    },
    {
      x: detourX,
      y: b.top - 12
    },
    {
      x: detourX,
      y: b.bottom + 12
    },
    {
      x: segX,
      y: wp1.y
    },
    wp2,
  ].filter((wp) => wp);
};

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
    arcade: {
      debug: false
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [N4LibraryScene],
});

window.__n4Game = n4PhaserGame;

// Task 10 (additive): HUD shortcut button that opens the n3-exam-gate's
// existing menu without walking up to it. Mirrors changeCharBtn's exact
// defensive shape (n5-phaser-game.js:9621-9639) — null-safe getElementById,
// scene-active check, panelOpen guard. Reuses the real interactive entry
// (found in this.interactives, not a newly-constructed object) so
// openInteraction() routes through the exact same openQuizGateMenu/
// openQuizAttemptMenu path a walk-up interaction uses.
document.getElementById('n3GateExamBtn') ? .addEventListener('click', () => {
  if (!n4PhaserGame.scene.isActive('N4LibraryScene')) return;
  const libraryScene = n4PhaserGame.scene.getScene('N4LibraryScene');
  if (libraryScene.panelOpen) return; // don't stack over an open lesson/review/gate panel
  const gateEntry = libraryScene.interactives.find((e) => e.id === libraryScene.finalGateId);
  if (!gateEntry) return;
  libraryScene.openInteraction(gateEntry);
});