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
  brickTile: { x: 30, y: 90, w: 16, h: 16 }, // floors-walls02.png, n5-phaser-game.js:5
  topDownFloorTile: { x: 81, y: 81, w: 63, h: 46 }, // TopDownHouse_FloorsAndWalls.png, n5-phaser-game.js:13
  // libassetpack-tiled.png (1488x528px) — shelf/book-pile crops, verbatim
  // from n5-phaser-game.js's own ASSET_RECTS (same source sheet, same
  // already-alpha-scan-confirmed rects — see that file's comments for
  // how each was isolated).
  shelfLocked: { x: 28, y: 384, w: 88, h: 120 },
  shelfFilled1: { x: 148, y: 372, w: 88, h: 132 },
  shelfFilled2: { x: 268, y: 365, w: 88, h: 139 },
  shelfFilled3: { x: 388, y: 373, w: 88, h: 131 },
  bookPileTall: { x: 240, y: 96, w: 30, h: 48 },
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
  grandfatherClock: { x: 79, y: 24, w: 58, h: 120 },
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
  'n4-shelf-02': buildPlaceholderLesson('Potential Form'),
  'n4-shelf-03': buildPlaceholderLesson('Conditionals (と・ば・たら・なら)'),
  'n4-shelf-04': buildPlaceholderLesson('Volitional & Intention'),
  'n4-shelf-06': buildPlaceholderLesson('Comparisons'),
  'n4-shelf-07': buildPlaceholderLesson('Passive & Causative Verbs'),
  'n4-shelf-08': buildPlaceholderLesson('Adjective + なる・する'),
  'n3-shelf-02': buildPlaceholderLesson('Causative-Passive'),
  'n3-shelf-03': buildPlaceholderLesson('Conjecture & Hearsay (そうだ・ようだ・らしい)'),
  'n3-shelf-04': buildPlaceholderLesson('Relative Clauses & Complex Modification'),
  'n3-shelf-05': buildPlaceholderLesson('Formal Written Style (である体)'),
  'n3-shelf-06': buildPlaceholderLesson('Advanced Keigo'),
  'n3-shelf-07': buildPlaceholderLesson('Conjunction Nuances (ものの・くせに・というより)'),
  'n3-shelf-08': buildPlaceholderLesson('Extended Reading Practice'),
  'n4-review-1': buildPlaceholderLesson('N4 Grammar Foundations Review'),
  'n4-review-2': buildPlaceholderLesson('N4 Vocabulary & Usage Review'),
  'n3-review-1': buildPlaceholderLesson('N3 Grammar Expansion Review'),
  'n3-review-2': buildPlaceholderLesson('N3 Nuance & Conversation Review'),
  'n4-shelf-01': [
    {
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
      pattern: [
        { text: '[て-form]', role: 'subject' }, { text: 'もいいです', role: 'predicate' },
      ],
      explain: ['Grants permission — literally "even if you do [X], it\'s fine."'],
      samples: [
        {
          tag: '"You may go home."',
          tiles: [
            { text: '帰っても', role: 'subject', gloss: 'even if you go home', isNew: true, smallGloss: true },
            { text: 'いいです', role: 'predicate', gloss: 'it\'s fine' },
          ],
          translation: 'Kaettemo ii desu.',
        },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜てはいけません: "You must not..."',
      pattern: [
        { text: '[て-form]', role: 'subject' }, { text: 'はいけません', role: 'predicate' },
      ],
      explain: ['Denies permission — "as for doing [X], it won\'t do."'],
      samples: [
        {
          tag: '"You must not eat here."',
          tiles: [
            { text: 'ここで', role: 'subject', gloss: 'here' },
            { text: '食べては', role: 'predicate', gloss: 'as for eating', isNew: true, smallGloss: true },
            { text: 'いけません', role: 'predicate', gloss: 'won\'t do' },
          ],
          translation: 'Koko de tabete wa ikemasen.',
        },
      ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "You may sit" (sit = 座って):',
      before: '', after: '。',
      choices: ['座ってもいいです', '座ってはいけません', '座ります'],
      answer: '座ってもいいです',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "You must not write here" (here = ここで, write = 書いて):',
      before: '', after: '。',
      choices: ['ここで書いてはいけません', 'ここで書いてもいいです', 'ここで書きます'],
      answer: 'ここで書いてはいけません',
    },
    {
      type: 'summary',
      title: 'New Patterns: Permission',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: '〜てもいいです', romaji: '~temo ii desu', meaning: 'you may...' },
        { kana: '〜てはいけません', romaji: '~tewa ikemasen', meaning: 'you must not...' },
        { kana: '帰ってもいいです', romaji: 'kaettemo ii desu', meaning: 'you may go home' },
        { kana: '食べてはいけません', romaji: 'tabetewa ikemasen', meaning: 'you must not eat' },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '座って', after: '。', answer: 'もいいです', hint: '"You may sit."' },
        { before: 'ここで書いて', after: '。', answer: 'はいけません', hint: '"You must not write here."' },
      ],
    },
  ],
  'n4-shelf-05': [
    {
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
      pattern: [
        { text: '[giver]は', role: 'subject' }, { text: '[receiver]に', role: 'particle' }, { text: '[thing]を', role: 'particle' }, { text: 'あげます', role: 'predicate' },
      ],
      explain: ['Use あげる when you (or someone else) give something to another person — the giving moves away from the speaker\'s side.'],
      samples: [
        {
          tag: '"I gave my friend a book."',
          tiles: [
            { text: '私は', role: 'subject', gloss: 'I' },
            { text: '友達に', role: 'particle', gloss: 'to my friend' },
            { text: '本を', role: 'particle', gloss: 'a book' },
            { text: 'あげました', role: 'predicate', gloss: 'gave', isNew: true },
          ],
          translation: 'Watashi wa tomodachi ni hon o agemashita.',
        },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'もらう: receiving',
      pattern: [
        { text: '[receiver]は', role: 'subject' }, { text: '[giver]に', role: 'particle' }, { text: '[thing]を', role: 'particle' }, { text: 'もらいます', role: 'predicate' },
      ],
      explain: ['もらう flips the perspective to the receiver\'s side — same event as あげる, described from the other direction.'],
      samples: [
        {
          tag: '"I received a book from my friend."',
          tiles: [
            { text: '私は', role: 'subject', gloss: 'I' },
            { text: '友達に', role: 'particle', gloss: 'from my friend' },
            { text: '本を', role: 'particle', gloss: 'a book' },
            { text: 'もらいました', role: 'predicate', gloss: 'received', isNew: true },
          ],
          translation: 'Watashi wa tomodachi ni hon o moraimashita.',
        },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'くれる: giving (toward you)',
      pattern: [
        { text: '[giver]は', role: 'subject' }, { text: '私に', role: 'particle' }, { text: '[thing]を', role: 'particle' }, { text: 'くれます', role: 'predicate' },
      ],
      explain: ['くれる is only for gifts moving TOWARD the speaker (or the speaker\'s in-group) — never used for the speaker\'s own giving.'],
      samples: [
        {
          tag: '"My friend gave me a book."',
          tiles: [
            { text: '友達は', role: 'subject', gloss: 'my friend' },
            { text: '私に', role: 'particle', gloss: 'to me' },
            { text: '本を', role: 'particle', gloss: 'a book' },
            { text: 'くれました', role: 'predicate', gloss: 'gave (to me)', isNew: true },
          ],
          translation: 'Tomodachi wa watashi ni hon o kuremashita.',
        },
      ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "My friend gave me a book" (friend = 友達, book = 本):',
      before: '友達は私に本を', after: '。',
      choices: ['くれました', 'あげました', 'もらいました'],
      answer: 'くれました',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I gave my friend a book":',
      before: '私は友達に本を', after: '。',
      choices: ['あげました', 'くれました', 'もらいました'],
      answer: 'あげました',
    },
    {
      type: 'summary',
      title: 'New Patterns: Giving & Receiving',
      headers: ['Verb', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'あげる', romaji: 'ageru', meaning: 'give (away from speaker)' },
        { kana: 'もらう', romaji: 'morau', meaning: 'receive' },
        { kana: 'くれる', romaji: 'kureru', meaning: 'give (toward speaker)' },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: '友達は私に本を', after: '。', answer: 'くれました', hint: '"My friend gave me a book."' },
        { before: '私は友達に本を', after: '。', answer: 'あげました', hint: '"I gave my friend a book."' },
      ],
    },
  ],
  'n3-shelf-01': [
    {
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
      pattern: [
        { text: '[て-form]', role: 'subject' }, { text: 'おきます', role: 'predicate' },
      ],
      explain: ['ておく marks an action done in advance, in preparation for something later — or simply leaving something as it is on purpose.'],
      samples: [
        {
          tag: '"I\'ll buy the tickets in advance."',
          tiles: [
            { text: 'チケットを', role: 'subject', gloss: 'tickets' },
            { text: '買って', role: 'predicate', gloss: 'buy (て-form)' },
            { text: 'おきます', role: 'predicate', gloss: 'in advance', isNew: true },
          ],
          translation: 'Chiketto o katte okimasu.',
        },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '〜てしまう: completing / regret',
      pattern: [
        { text: '[て-form]', role: 'subject' }, { text: 'しまいます', role: 'predicate' },
      ],
      explain: ['てしまう marks an action finished completely — often with a nuance of "and now I can\'t undo it" or mild regret.'],
      samples: [
        {
          tag: '"I ended up reading the whole book."',
          tiles: [
            { text: '本を', role: 'subject', gloss: 'the book' },
            { text: '全部', role: 'predicate', gloss: 'all', isNew: true },
            { text: '読んで', role: 'predicate', gloss: 'read (て-form)' },
            { text: 'しまいました', role: 'predicate', gloss: 'ended up (completely)', isNew: true },
          ],
          translation: 'Hon o zenbu yonde shimaimashita.',
        },
      ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I\'ll buy the tickets in advance" (tickets = チケット, buy = 買って):',
      before: 'チケットを買って', after: '。',
      choices: ['おきます', 'しまいます', 'あります'],
      answer: 'おきます',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I ended up reading the whole book" (book = 本, all = 全部, read = 読んで):',
      before: '本を全部読んで', after: '。',
      choices: ['しまいました', 'おきました', 'もらいました'],
      answer: 'しまいました',
    },
    {
      type: 'summary',
      title: 'New Patterns: 〜ておく・〜てしまう',
      headers: ['Pattern', 'Romaji', 'Meaning'],
      rows: [
        { kana: '〜ておく', romaji: '~te oku', meaning: 'do in advance / leave as-is' },
        { kana: '〜てしまう', romaji: '~te shimau', meaning: 'do completely / regretfully' },
        { kana: '買っておきます', romaji: 'katte okimasu', meaning: 'buy in advance' },
        { kana: '読んでしまいました', romaji: 'yonde shimaimashita', meaning: 'ended up reading (all of it)' },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Final check',
      intro: 'Fill in each blank, then check your answers.',
      questions: [
        { before: 'チケットを買って', after: '。', answer: 'おきます', hint: '"I\'ll buy the tickets in advance."' },
        { before: '本を全部読んで', after: '。', answer: 'しまいました', hint: '"I ended up reading the whole book."' },
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
    rows: greetings.map((p) => ({ kana: p.kana, romaji: p.romaji, meaning: p.meaning })),
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
        return { ...t, spritePath: ACTION_SPRITE_PATHS[t.action][colorId] };
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
    return { ...page, diagramSvg: page.diagramSvg(playerColorId, senseiColorId) };
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
const shelfW = 87; // same "big furniture" reference size N5 uses
const shelfH = 64;
const leftColX = [64, 64 + shelfW + 20]; // N4, always
const rightColX = [WORLD_W - 64 - shelfW * 2 - 20, WORLD_W - 64 - shelfW]; // N3, always

// Smaller Y = further north (deeper in). N3's shelves sit in the SAME
// 2 rows as N4's (just the right column) — visible-but-locked the
// whole time, same as seeing a locked door before you have the key.
// The exam gate itself is the northmost interactive, the last
// checkpoint before the plain north wall, reached only after both N4
// reviews (which are further south/closer to entry) are done.
const examGateY = 420; // center corridor, north-most interactive
const review2Y = 600; // N4 review-2 (left) / N3 review-2 (right)
const row2Y = 780; // N4 Vocabulary & Usage (left) / N3 Nuance & Conversation (right)
const review1Y = 960; // N4 review-1 (left) / N3 review-1 (right)
const row1Y = 1140; // N4 Grammar Foundations (left) / N3 Grammar Expansion (right) — nearest entry
const centerpieceY = 1360; // N4/N3's globe-equivalent decorative landmark
const entryY = 1560; // player spawn / arrival from N5, south-most

const LAYOUT = {
  shelfW, shelfH, leftColX, rightColX,
  row1Y, review1Y, examGateY, row2Y, review2Y,
  centerpieceY, entryY,
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
  { id: 'n4-shelf-01', title: 'て-form Requests & Permission' },
  { id: 'n4-shelf-02', title: 'Potential Form' },
  { id: 'n4-shelf-03', title: 'Conditionals (と・ば・たら・なら)' },
  { id: 'n4-shelf-04', title: 'Volitional & Intention' },
  // N4 side (left column) — Vocabulary & Usage wing.
  { id: 'n4-shelf-05', title: 'Giving & Receiving' },
  { id: 'n4-shelf-06', title: 'Comparisons' },
  { id: 'n4-shelf-07', title: 'Passive & Causative Verbs' },
  { id: 'n4-shelf-08', title: 'Adjective + なる・する' },
  // N3 side (right column) — Grammar Expansion wing. Locked behind
  // n3-exam-gate until both N4 review piles are complete.
  { id: 'n3-shelf-01', title: '〜ておく・〜てしまう' },
  { id: 'n3-shelf-02', title: 'Causative-Passive' },
  { id: 'n3-shelf-03', title: 'Conjecture & Hearsay (そうだ・ようだ・らしい)' },
  { id: 'n3-shelf-04', title: 'Relative Clauses & Complex Modification' },
  // N3 side (right column) — Nuance & Conversation wing.
  { id: 'n3-shelf-05', title: 'Formal Written Style (である体)' },
  { id: 'n3-shelf-06', title: 'Advanced Keigo' },
  { id: 'n3-shelf-07', title: 'Conjunction Nuances (ものの・くせに・というより)' },
  { id: 'n3-shelf-08', title: 'Extended Reading Practice' },
];

// N4 chain (left column) — n4-shelf-01 is always available, it's the
// floor's entry point. N3 chain (right column) — n3-shelf-01's prereq
// is the exam gate itself (not null), so the ENTIRE right column stays
// locked until it's passed; the rest of the N3 chain then works exactly
// like N4's own internal chaining.
const SHELF_PREREQ = {
  'n4-shelf-01': null,
  'n4-shelf-02': 'n4-shelf-01', 'n4-shelf-03': 'n4-shelf-02', 'n4-shelf-04': 'n4-shelf-03',
  'n4-shelf-05': 'n4-review-1',
  'n4-shelf-06': 'n4-shelf-05', 'n4-shelf-07': 'n4-shelf-06', 'n4-shelf-08': 'n4-shelf-07',
  'n3-shelf-01': 'n3-exam-gate',
  'n3-shelf-02': 'n3-shelf-01', 'n3-shelf-03': 'n3-shelf-02', 'n3-shelf-04': 'n3-shelf-03',
  'n3-shelf-05': 'n3-review-1',
  'n3-shelf-06': 'n3-shelf-05', 'n3-shelf-07': 'n3-shelf-06', 'n3-shelf-08': 'n3-shelf-07',
};

// Four review piles: 2 for N4 progression, 2 for N3 progression.
// Each review pile's requires array lists all shelves that must be completed
// before this pile becomes available (same pattern as SHELF_PREREQ, but
// review piles are accessed via BOOK_PILE_DATA in buildBookPiles()).
const BOOK_PILE_DATA = [
  { id: 'n4-review-1', title: 'N4 Grammar Foundations Review', requires: ['n4-shelf-01', 'n4-shelf-02', 'n4-shelf-03', 'n4-shelf-04'] },
  { id: 'n4-review-2', title: 'N4 Vocabulary & Usage Review', requires: ['n4-shelf-05', 'n4-shelf-06', 'n4-shelf-07', 'n4-shelf-08'] },
  { id: 'n3-review-1', title: 'N3 Grammar Expansion Review', requires: ['n3-shelf-01', 'n3-shelf-02', 'n3-shelf-03', 'n3-shelf-04'] },
  { id: 'n3-review-2', title: 'N3 Nuance & Conversation Review', requires: ['n3-shelf-05', 'n3-shelf-06', 'n3-shelf-07', 'n3-shelf-08'] },
];

// The N4→N3 gate: reuses the same quiz-gate mechanic N5's staircase has
// (3-attempt/24h-cooldown). Built as a physical interactive in Task 6
// (kind: 'pile'-shaped for interaction model consistency), but the content
// and scoring differ: it's a standalone exam, not a recap+quiz review pile.
// Every N3 shelf's prereq chain roots on it — the entire right column stays
// locked until this exam is passed.
const EXAM_GATE_DATA = { id: 'n3-exam-gate', title: 'N3 Entrance Exam', requires: ['n4-review-1', 'n4-review-2'] };

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
  return { bg, label, width: tagW, height: tagH };
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

  const frames = frameKeys.concat(frameKeys.slice(1, -1).reverse()).map((key) => ({ key }));
  scene.anims.create({ key: n4ShelfTrinketAnimKey, frames, frameRate: 3, repeat: -1 });
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
    this.buildAtrium();
    this.buildShelves();
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
    const floorKey = cropToTexture(this, 'floorsWallsTopDown', ASSET_RECTS.topDownFloorTile, 'n4TopDownFloorTileTex');
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
    const map = this.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tileset = map.addTilesetImage('n4LibraryTiles', null, TILE_SIZE, TILE_SIZE);
    map.createLayer(0, tileset, 0, 0);
    this.floorTilemap = map;

    // Solid dark backdrop outside the room instead of transparency,
    // same as N5.
    this.cameras.main.setBackgroundColor('#2A2320');
  }

  buildWalls() {
    const blockSize = 32; // was TILE_SIZE (16) via image crop — see Task 2
    const brickKey = createBrickWallTexture(this, 'n4BrickWallTex', { blockW: blockSize, blockH: blockSize });
    const wallGroup = this.physics.add.staticGroup();

    // Top/bottom strips — WORLD_W (1152) divides evenly by 32 (36 tiles),
    // so no remainder handling needed on this axis. Constrain height to
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
      rugDark: 0x2a0d1a, rugFringeLight: 0x3a1526, rugBase: N4_PALETTE.carpet,
      rugWeave: 0x4a1524, rugMotif: N4_PALETTE.gold, rugMotifShade: 0xa87f3a,
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
    // (wing1's south sub-row bottom edge sits at row1Y + shelfH*2 + 12 =
    // 1280; at this scale the clock's top edge lands at ~1291, an 11px
    // clearance) or the arrival rug below. Non-solid, like every other
    // decor piece — centering it doesn't block auto-walk.
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
    // spawn point doesn't read as bare floor.
    const arrivalW = 90;
    const arrivalH = 50;
    drawWovenRug(this, 'n4ArrivalRugTex', arrivalW, arrivalH, n4RugPalette);
    this.add.image(WORLD_W / 2, LAYOUT.entryY, 'n4ArrivalRugTex').setDepth(0);
  }

  buildAtrium() {
    const left = 392;
    const width = WORLD_W - left * 2;
    const top = 510;
    const height = 910;
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x160f0c, 1).fillRect(left, top, width, height);
    buildOpenAtriumVoid(this, g, { left: left + 14, top: top + 16, width: width - 28, height: height - 32 });
    for (let y = top + 48; y < top + height - 28; y += 42) {
      g.lineStyle(2, 0x4a2d1d, 0.9).lineBetween(left + 22, y, left + width - 22, y);
    }
    // Outer frame lines (1px, dark border box around the whole rect)
    g.lineStyle(1, 0x1a0f0a, 0.95).lineBetween(left, top, left + width, top)
      .lineBetween(left + width, top, left + width, top + height)
      .lineBetween(left + width, top + height, left, top + height)
      .lineBetween(left, top + height, left, top);
    // Side rail posts (tall, thin vertical dividers on the left+right edges
    // of the atrium, reading as the visual anchors holding the two balcony
    // rails apart)
    g.lineStyle(3, 0x4a2d1d, 0.9).lineBetween(left + 22, top, left + 22, top + height)
      .lineBetween(left + width - 22, top, left + width - 22, top + height);
    // Gold trim lines (highlight accent on top edge of the outer frame, top
    // edge of the plank seams, and top edge of the side rail posts, evoking
    // polished gold leaf or a precious metal cap)
    g.lineStyle(1, 0xc9a66b, 0.65).lineBetween(left, top, left + width, top)
      .lineBetween(left + 22, top, left + 22, top + height)
      .lineBetween(left + width - 22, top, left + width - 22, top + height);
    // Rear walkway strip — a horizontal band above the top of the atrium
    // void (at the scene's very back / topmost), just visual space, not
    // an interactive or path (the player can't walk behind the atrium
    // because the bounds are set up to lock off the north corridor access).
    const walkwayTop = top - 42;
    const walkwayH = 42;
    g.fillStyle(0x2a2118, 1).fillRect(left, walkwayTop, width, walkwayH);
    // Rear walkway trim (a double line giving it depth)
    g.lineStyle(1, 0x1a0f0a, 0.85).lineBetween(left, walkwayTop + 1, left + width, walkwayTop + 1)
      .lineBetween(left, walkwayTop + walkwayH - 1, left + width, walkwayTop + walkwayH - 1);
    // "OPEN ATRIUM / FIRST-FLOOR LIBRARY" label, centered inside the
    // atrium void, floating over the illustrated content.
    const labelX = left + width / 2;
    const labelY = top + height / 2 - 20;
    this.add.text(labelX, labelY, 'OPEN ATRIUM', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#e8d4a8', align: 'center',
    }).setOrigin(0.5).setDepth(2);
    this.add.text(labelX, labelY + 28, 'FIRST-FLOOR LIBRARY', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#a89068', align: 'center',
    }).setOrigin(0.5).setDepth(2);
  }

  // -- 16 lesson shelves, 2 physical rows (left column = N4, right column
  // = N3 throughout — see LAYOUT's doc comment) --------------------------

  buildShelves() {
    const shelfW = LAYOUT.shelfW;
    const shelfH = LAYOUT.shelfH;
    const leftColX = LAYOUT.leftColX;
    const rightColX = LAYOUT.rightColX;

    // Each of LAYOUT's 2 rows is actually a "wing" of 4 shelves split
    // into 2 sub-rows: [0] = north sub-row (further from entry), [1] =
    // south sub-row (closer to entry) — matches LESSON_DATA's grouping
    // into Grammar Foundations/Vocabulary & Usage (N4) and Grammar
    // Expansion/Nuance & Conversation (N3).
    const wing1RowY = [LAYOUT.row1Y, LAYOUT.row1Y + shelfH + 12];
    const wing2RowY = [LAYOUT.row2Y, LAYOUT.row2Y + shelfH + 12];

    // Wall header above each column's topmost (north) sub-row per wing,
    // same hand-drawn "real wall" mural + invisible-rectangle/wallGroup
    // collision pattern as N5's buildShelves() (n5-phaser-game.js:8216-
    // 8275) — copied verbatim, this reads as shelves built into a wall
    // rather than floating in open floor.
    const colWidth = shelfW * 2 + 20;
    const headerH = 110;
    const headerKey = drawWallHeaderTexture(this, colWidth, headerH);
    const buildWallHeader = (x, topY, h = headerH) => {
      const key = h === headerH ? headerKey : drawWallHeaderTexture(this, colWidth, h);
      const cx = x + colWidth / 2;
      const cy = topY - h / 2 - 4;
      this.add.image(cx, cy, key).setOrigin(0.5, 0.5).setDepth(0);
      const block = this.add.rectangle(cx, cy, colWidth, h, 0x000000, 0).setOrigin(0.5, 0.5);
      this.physics.add.existing(block, true);
      this.wallGroup.add(block);
    };
    buildWallHeader(leftColX[0], wing1RowY[0]);
    buildWallHeader(rightColX[0], wing1RowY[0]);
    buildWallHeader(leftColX[0], wing2RowY[0]);
    buildWallHeader(rightColX[0], wing2RowY[0]);

    // Wall footer below the southmost sub-row overall (wing1's south
    // sub-row, nearest the entry point) — same "the walls need to be on
    // where the arrow lands" reasoning as N5's own footer-only-nearest-
    // spawn treatment (n5-phaser-game.js:8256-8275).
    const buildWallFooter = (x, bottomY, h) => {
      const key = drawWallHeaderTexture(this, colWidth, h);
      const cx = x + colWidth / 2;
      const cy = bottomY + h / 2 + 4;
      this.add.image(cx, cy, key).setOrigin(0.5, 0.5).setDepth(0);
      const block = this.add.rectangle(cx, cy, colWidth, h, 0x000000, 0).setOrigin(0.5, 0.5);
      this.physics.add.existing(block, true);
      this.wallGroup.add(block);
    };
    buildWallFooter(leftColX[0], wing1RowY[1] + shelfH, headerH);
    buildWallFooter(rightColX[0], wing1RowY[1] + shelfH, headerH);

    // Matches LESSON_DATA's order (n4-shelf-01..08, n3-shelf-01..08)
    // exactly — buildShelves() zips LESSON_DATA[i] with positions[i] by
    // array index below.
    const positions = [
      [leftColX[0], wing1RowY[0]], [leftColX[1], wing1RowY[0]],
      [leftColX[0], wing1RowY[1]], [leftColX[1], wing1RowY[1]],
      [leftColX[0], wing2RowY[0]], [leftColX[1], wing2RowY[0]],
      [leftColX[0], wing2RowY[1]], [leftColX[1], wing2RowY[1]],
      [rightColX[0], wing1RowY[0]], [rightColX[1], wing1RowY[0]],
      [rightColX[0], wing1RowY[1]], [rightColX[1], wing1RowY[1]],
      [rightColX[0], wing2RowY[0]], [rightColX[1], wing2RowY[0]],
      [rightColX[0], wing2RowY[1]], [rightColX[1], wing2RowY[1]],
    ];

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
    const favoriteDiskKey = cropToTexture(this, 'savePointRaw', { x: 200, y: 200, w: 624, h: 624 }, 'n4FavoriteDiskTex');

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

  // -- 4 review book piles (2 for N4 progression, 2 for N3) ---------------

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
      'n4-review-1': { x: gapLeft + 16, y: LAYOUT.review1Y },
      'n4-review-2': { x: gapLeft + 16, y: LAYOUT.review2Y },
      'n3-review-1': { x: gapRight - 16 - w, y: LAYOUT.review1Y },
      'n3-review-2': { x: gapRight - 16 - w, y: LAYOUT.review2Y },
    };

    BOOK_PILE_DATA.forEach((pile) => {
      const pos = positions[pile.id];
      const sprite = this.add.image(pos.x, pos.y, bookKey).setOrigin(0, 0)
        .setDisplaySize(w, h).setDepth(1);
      const glow = this.add.text(pos.x + w - 8, pos.y - 6, '⭐', { fontSize: '18px' })
        .setOrigin(0.5).setDepth(4).setVisible(false);
      const stamp = this.add.text(pos.x + w - 8, pos.y - 6, '✅', { fontSize: '18px' })
        .setOrigin(0.5).setDepth(4).setVisible(false);
      this.tweens.add({ targets: glow, alpha: { from: 1, to: 0.35 }, duration: 650, yoyo: true, repeat: -1 });

      // Non-solid, same reasoning as shelves — keeps auto-walk routing
      // simple and reliable for every interactive on this floor.
      sprite.setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => this.handleInteractiveClick(entry));

      const entry = {
        id: pile.id, kind: 'pile', title: pile.title,
        sprite, glow, stamp, requires: pile.requires,
        x: pos.x + w / 2, y: pos.y + h / 2,
        baseScale: scale,
      };
      this.interactives.push(entry);
    });
  }

  // -- N4->N3 exam gate: the one interactive N5 has no equivalent of ------
  // Built like a BOOK_PILE_DATA-shaped interactive (kind: 'pile', same
  // shape openInteraction()/refreshAllStates() already expect from any
  // pile), but its id equals this.finalGateId ('n3-exam-gate', set in
  // create()) — that single equality is what routes it through
  // openQuizGateMenu()'s 3-attempt/24h-cooldown flow (library-scene-
  // shared.js:340-356) instead of a plain review-pile menu, and exempts
  // it from refreshAllStates()' lock-dimming (library-scene-shared.js:
  // 442-444, "entry.id !== this.finalGateId") the same way N5's own
  // staircase gate is exempt. No new interaction-dispatch logic needed.

  buildExamGate() {
    // Reuses the exact same book-pile crop buildBookPiles() already
    // established (must reuse the cached key, not call cropToTexture
    // again with the same destKey — Phaser throws on re-registering a
    // canvas key). buildScene() always calls buildBookPiles() before
    // buildExamGate(), so this.bookPileTexKey is guaranteed to exist.
    const bookKey = this.bookPileTexKey;
    const scale = 1.3; // larger than the 0.7 review piles — reads as the floor's one landmark gate, not just another pile
    const w = ASSET_RECTS.bookPileTall.w * scale;
    const h = ASSET_RECTS.bookPileTall.h * scale;
    const x = WORLD_W / 2 - w / 2; // centered in the corridor, between leftColX and rightColX
    const y = LAYOUT.examGateY - h / 2;

    const sprite = this.add.image(x, y, bookKey).setOrigin(0, 0)
      .setDisplaySize(w, h).setDepth(1);
    const glow = this.add.text(x + w - 8, y - 6, '⭐', { fontSize: '18px' })
      .setOrigin(0.5).setDepth(4).setVisible(false);
    const stamp = this.add.text(x + w - 8, y - 6, '✅', { fontSize: '18px' })
      .setOrigin(0.5).setDepth(4).setVisible(false);
    this.tweens.add({ targets: glow, alpha: { from: 1, to: 0.35 }, duration: 650, yoyo: true, repeat: -1 });

    sprite.setInteractive({ useHandCursor: true });
    sprite.on('pointerdown', () => this.handleInteractiveClick(entry));

    const entry = {
      id: EXAM_GATE_DATA.id, kind: 'pile', title: EXAM_GATE_DATA.title,
      sprite, glow, stamp, requires: EXAM_GATE_DATA.requires,
      x: x + w / 2, y: y + h / 2,
      baseScale: scale,
    };
    this.interactives.push(entry);
  }

  buildPlayer() {
    // Spawns near the south end of the world — this floor's real entry
    // point from N5's staircase.
    const spawnX = WORLD_W / 2;
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
      const dir = Math.abs(vel.x) > Math.abs(vel.y)
        ? (vel.x > 0 ? 'right' : 'left')
        : (vel.y > 0 ? 'down' : 'up');
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
    const near = this.nearestInRange();
    this.interactives.forEach((entry) => {
      entry.sprite.setScale(entry.baseScale * (entry === near ? 1.08 : 1));
    });
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

// Task 10 (additive): HUD shortcut button that opens the n3-exam-gate's
// existing menu without walking up to it. Mirrors changeCharBtn's exact
// defensive shape (n5-phaser-game.js:9621-9639) — null-safe getElementById,
// scene-active check, panelOpen guard. Reuses the real interactive entry
// (found in this.interactives, not a newly-constructed object) so
// openInteraction() routes through the exact same openQuizGateMenu/
// openQuizAttemptMenu path a walk-up interaction uses.
document.getElementById('n3GateExamBtn')?.addEventListener('click', () => {
  if (!n4PhaserGame.scene.isActive('N4LibraryScene')) return;
  const libraryScene = n4PhaserGame.scene.getScene('N4LibraryScene');
  if (libraryScene.panelOpen) return; // don't stack over an open lesson/review/gate panel
  const gateEntry = libraryScene.interactives.find((e) => e.id === libraryScene.finalGateId);
  if (!gateEntry) return;
  libraryScene.openInteraction(gateEntry);
});
