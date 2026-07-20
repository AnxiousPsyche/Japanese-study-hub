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
  // Alpha-scan corrected (per-shelf, not shared, and per-column x-window
  // to avoid bleed from an unrelated small-furniture sprite sitting
  // directly above shelfFilled2 in the sheet — see below). The 3 filled
  // variants stack books ON TOP of the shelf; each book pile's true top
  // is different per variant (books are hand-placed, not uniform
  // height), so a single shared rect always clipped at least one of
  // them. Found by scanning each column for the first opaque row,
  // confirming a real transparent gap above it (not just "first hit in
  // an overly generous window", which the first attempt at this fix got
  // wrong for shelfFilled2 — its window's top edge caught the bottom of
  // a small stool/table-leg prop positioned directly above it in the
  // sheet, 5px of true gap separating the two).
  shelfLocked: { x: 28, y: 384, w: 88, h: 120 },
  shelfFilled1: { x: 148, y: 372, w: 88, h: 132 },
  shelfFilled2: { x: 268, y: 365, w: 88, h: 139 },
  shelfFilled3: { x: 388, y: 373, w: 88, h: 131 },
  globe: { x: 143, y: 217, w: 94, h: 118 },
  bookStack: { x: 358, y: 25, w: 26, h: 50 },
  // Alpha-scan corrected: the old {673,43,45,52} clipped ~4px off the top
  // of the gold frame. This is the complete, non-clipped bounding box.
  armchair: { x: 672, y: 39, w: 48, h: 57 },
  // Same chair, facing the OTHER way (stacked directly below armchair in
  // the sheet) — cushion fills the whole seat facing the viewer, instead
  // of armchair's backrest-only view. Per-row scan started at y=100 (not
  // armchair's own y=90 bottom) specifically to avoid merging its
  // shadow/leg bleed into this box. Used for reception's chair, which
  // needs to face down toward the desk.
  armchairFacingDown: { x: 672, y: 100, w: 48, h: 68 },
  // Reception furniture (found via alpha-scan against the user's
  // reference images — desk/chair/rug/lamp are all confirmed matches).
  receptionDesk: { x: 541, y: 229, w: 191, h: 107 },
  receptionRug: { x: 456, y: 24, w: 168, h: 72 },
  deskLamp: { x: 624, y: 125, w: 24, h: 43 },
  // Desk-clutter item sheet (18 sprites), all found by flood-fill
  // island-scanning libassetpack-tiled.png's top-left region against the
  // user's reference item-sheet image, then individually confirmed by
  // rendering each candidate crop.
  deskRedBook: { x: 360, y: 26, w: 24, h: 22 },
  deskClipboard: { x: 390, y: 28, w: 12, h: 16 },
  deskScrap: { x: 384, y: 159, w: 24, h: 9 },
  deskStripedStack: { x: 361, y: 97, w: 22, h: 23 },
  deskPaperWavy: { x: 387, y: 50, w: 17, h: 19 },
  deskPaperFanned: { x: 410, y: 51, w: 21, h: 20 },
  deskGreenLedger: { x: 360, y: 76, w: 24, h: 20 },
  deskPaperStackA: { x: 409, y: 73, w: 22, h: 21 },
  deskTallStack: { x: 240, y: 96, w: 30, h: 48 },
  deskThickStack: { x: 240, y: 27, w: 31, h: 45 },
  deskPaperStackB: { x: 388, y: 75, w: 15, h: 18 },
  deskMug: { x: 415, y: 102, w: 10, h: 13 },
  deskFlatBook: { x: 360, y: 55, w: 24, h: 17 },
  deskDice: { x: 392, y: 130, w: 8, h: 7 },
  deskQuillCup: { x: 415, y: 122, w: 10, h: 22 },
  deskOpenBook: { x: 290, y: 24, w: 45, h: 24 },
  deskRibbonScroll: { x: 361, y: 149, w: 22, h: 19 },
  deskInkwellQuill: { x: 411, y: 144, w: 19, h: 24 },
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
// Was 119, then 151 (SHELF_SCALE-enlarged vertical stack), then 154 (zone
// 2's widened internal row gap) — grew again to 161 so decorRow3Gap could
// widen enough to fit a FULL-SIZE (110px, matching every other header)
// wall below shelves 1/2/5/6, instead of the undersized 30px one that
// only fit because decorRow3Gap was still at its old value.
const GRID_ROWS = 161;
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
// Zone 2 only (shelves 1-8) needs a taller gap than shelfRowGap between
// its 2 rows — shelfRowGap only leaves ~20px of clearance above the
// second row, not enough to fit a wall header there without it colliding
// with the shelf row above. Zone 1 keeps the tighter shelfRowGap (its
// un-headered second/third rows weren't part of this request).
const zone2RowGap = 160 * SHELF_SCALE;
const zoneTransitionGap = 258 * SHELF_SCALE; // gap between zone 1's last row and zone 2's first row
// Was 158 — widened so the wall below shelves 1/2/5/6 (see buildShelves'
// buildWallFooter calls) can be the same 110px height as every other
// header instead of a cramped 30px one, per explicit "same height and
// size as the other header walls" feedback.
const decorRow3Gap = 220 * SHELF_SCALE;
const carpetGlobeGap = 100 * SHELF_SCALE;
const sofaRowGap = 140 * SHELF_SCALE;
const receptionGap = 40 * SHELF_SCALE;
const spawnGap = 180 * SHELF_SCALE;

const zone1Row0 = 560; // unchanged anchor — same distance below the top wall band as before scaling
const zone1RowY = [zone1Row0, zone1Row0 + shelfRowGap, zone1Row0 + shelfRowGap * 2];
const zone2Row0 = zone1RowY[2] + zoneTransitionGap;
const zone2RowY = [zone2Row0, zone2Row0 + zone2RowGap];
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
  { id: 'shelf-03', title: 'A は B です' },
  { id: 'shelf-04', title: 'Self Introduction' },
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

// review-1's quiz questions ("Foundations Review", gates shelf-05) — a
// single shared array referenced by BOTH the 'quiz-review' page (captures
// answers, no inline grading) and the 'quiz-answers' page (grades against
// this exact same array) below, so the two pages can never drift out of
// sync with each other. 10 questions across shelf-01..04 (1 multiple-choice
// + 1 fill-in-the-blank per shelf, plus one extra pair on shelf-01/shelf-04
// to reach 10), in shelf order.
const REVIEW_1_QUIZ_QUESTIONS = [
  {
    kind: 'mc', prompt: 'What does すみません mean?',
    choices: ['Thank you', 'Excuse me / Sorry', 'Hello', 'Goodbye'], correctIndex: 1,
  },
  {
    kind: 'fill', prompt: '"Good morning" (polite):',
    before: '', after: 'ございます。', answer: 'おはよう', altAnswers: ['ohayou'],
  },
  {
    kind: 'mc', prompt: 'What does ありがとうございます mean?',
    choices: ['Nice to meet you', 'Excuse me', 'Thank you (polite)', 'Good evening'], correctIndex: 2,
  },
  {
    kind: 'mc', prompt: 'What do you say right before eating?',
    choices: ['ごちそうさまでした', 'いただきます', 'いってきます', 'ただいま'], correctIndex: 1,
  },
  {
    kind: 'fill', prompt: 'Said when you arrive back home:',
    before: '', after: '', answer: 'ただいま', altAnswers: ['tadaima'],
  },
  {
    kind: 'mc', prompt: 'Which particle marks the topic in "わたしはがくせいです"?',
    choices: ['です', 'これ', 'は', 'か'], correctIndex: 2,
  },
  {
    kind: 'fill', prompt: '"I WAS a student" (past tense):',
    before: 'わたしはがくせい', after: '。', answer: 'でした', altAnswers: ['deshita'],
  },
  {
    kind: 'mc', prompt: 'What is the correct order of a jikoshoukai (self-introduction)?',
    choices: ['Close → Name → Greet', 'Greet → Name → Close', 'Name → Close → Greet', 'Greet → Close → Name'], correctIndex: 1,
  },
  {
    kind: 'fill', prompt: 'The closing phrase of a self-introduction:',
    before: '', after: 'お願いします。', answer: 'よろしく', altAnswers: ['yoroshiku'],
  },
  {
    kind: 'fill', prompt: '"What is your name?" (polite):',
    before: '', after: 'は何ですか。', answer: 'お名前', altAnswers: ['onamae', 'o-namae'],
  },
];

// Real lesson content, keyed by LESSON_DATA id, rendered through
// LessonBox (assets/js/lesson-box.js) when a shelf's "Start/Continue?"
// option is selected. Each entry is an array of "pages" the player clicks/
// presses through in order (classic RPG dialogue chaining) — shelf-01
// through shelf-05 are populated as of this writing; shelves without an
// entry here fall back to the old direct-complete behavior (see
// openRetroMenu/startLesson).
const LESSON_CONTENT = {
  'shelf-01': [
    {
      type: 'greeting', kana: 'こんにちは', romaji: 'Konnichiwa', pronunciation: '(kohn-nee-chee-wah)', meaning: 'Hello / Good afternoon',
      usage: 'Used from late morning through early evening. Safe with strangers, coworkers, and acquaintances — not usually used with close family or young children.',
      // pixel bgs.png is a 3-band day/night sprite strip (night / day / sunset,
      // 63px each) — index 1 selects the daytime sun-and-clouds band.
      imageSrc: '../../assets/images/lesson/pixel%20bgs.png', spriteRows: 3, spriteIndex: 1,
      visualAlt: 'Pixel-art daytime sky with sun and clouds',
    },
    {
      type: 'greeting', kana: 'おはようございます', romaji: 'Ohayou gozaimasu', pronunciation: '(oh-hah-yoh goh-zah-ee-mahs)', meaning: 'Good morning (polite)',
      usage: 'Used in the morning, roughly until mid-to-late morning. This is the polite form — used with teachers, coworkers, or people you don’t know well. Drop "gozaimasu" for the casual version among friends.',
      imageSrc: '../../assets/images/lesson/sunrise-pixel-Original.png', visualAlt: 'Pixel-art sunrise over water',
    },
    {
      type: 'greeting', kana: 'こんばんは', romaji: 'Konbanwa', pronunciation: '(kohn-bahn-wah)', meaning: 'Good evening',
      usage: 'Used in the evening and at night, once it starts getting dark. Same level of formality as konnichiwa.',
      imageSrc: '../../assets/images/lesson/sunset-pixel-Original.png', visualAlt: 'Pixel-art sunset over water',
    },
    {
      // No matching photo supplied for this one — falls back to a
      // hand-drawn SVG icon in the same framed slot so the page still
      // reads consistently with its neighbors (see visual-aid mockup).
      type: 'greeting', kana: 'さようなら', romaji: 'Sayounara', pronunciation: '(sah-yoh-nah-rah)', meaning: 'Goodbye',
      usage: 'A fairly formal goodbye that can imply you won’t see the person again for a while. Not typically used daily with close friends or family — they usually use a casual alternative instead.',
      iconSvg: '<svg viewBox="0 0 56 56"><path d="M20 48 C20 30, 20 18, 28 12 C32 9, 38 12, 36 18 C34 23, 28 24, 28 24" fill="none" stroke="#e8c99b" stroke-width="7" stroke-linecap="round"></path><circle cx="28" cy="12" r="6" fill="#e8c99b"></circle></svg>',
    },
    {
      type: 'greeting', kana: 'ありがとうございます', romaji: 'Arigatou gozaimasu', pronunciation: '(ah-ree-gah-toh goh-zah-ee-mahs)', meaning: 'Thank you (polite)',
      usage: 'The polite form of "thank you" — used with strangers, shop staff, and at work. Drop "gozaimasu" for casual thanks among friends.',
      imageSrc: '../../assets/images/lesson/563640%20(1).jpg', visualAlt: 'A person bowing politely',
    },
    {
      // Also no matching photo — same SVG-icon fallback pattern as
      // さようなら above.
      type: 'greeting', kana: 'すみません', romaji: 'Sumimasen', pronunciation: '(soo-mee-mah-sen)', meaning: 'Excuse me / Sorry',
      usage: 'Very versatile: use it to apologize, to get someone’s attention (like a waiter), or even to say thanks when someone went out of their way for you.',
      iconSvg: '<svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#f0c674" stroke-width="2.5"></circle><text x="28" y="36" text-anchor="middle" font-size="24" fill="#f0c674" font-family="VT323, DotGothic16, monospace">!</text></svg>',
    },
    {
      // Two NPC cats using a few of the phrases above in a natural
      // exchange, before the auto-generated summary table — brings the
      // same "conversation" liveliness already used on later shelves to
      // the very first lesson, using only vocab this shelf just taught.
      type: 'conversation',
      turns: [
        {
          speaker: 'sensei', name: 'Neko-sensei', action: 'meow', actionLabel: '*meows*',
          text: 'こんにちは！', romaji: 'Konnichiwa! — "Hello!"',
        },
        {
          speaker: 'player', name: 'You', action: 'tailwagLeft', actionLabel: '*tail wags*',
          text: 'こんにちは！ありがとうございます。', romaji: 'Konnichiwa! Arigatou gozaimasu. — "Hello! Thank you."',
        },
        {
          speaker: 'sensei', name: 'Neko-sensei', action: 'meow', actionLabel: '*meows*',
          text: 'さようなら！', romaji: 'Sayounara! — "Goodbye!"',
        },
      ],
    },
    {
      // 3 drag-and-drop mini-checks (page.choices) — matching shelf-05's
      // pattern, retrofitted here so every content-complete lesson has at
      // least 3. Each blank stands alone (no before/after sentence frame)
      // since these greetings are standalone phrases, not sentence-
      // embedded — the prompt itself carries the context.
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'How do you say "Thank you" politely?',
      before: '', after: '',
      choices: ['すみません', 'ありがとうございます', 'さようなら'],
      answer: 'ありがとうございます',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Which one means "Good morning" (polite)?',
      before: '', after: '',
      choices: ['こんにちは', 'おはようございます', 'こんばんは'],
      answer: 'おはようございます',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'You bump into someone by accident — what do you say?',
      before: '', after: '',
      choices: ['ありがとうございます', 'こんにちは', 'すみません'],
      answer: 'すみません',
    },
  ],
  'shelf-02': [
    {
      // Recap chips referencing shelf-01, before diving into more
      // everyday phrases — same "already know this" pill-badge pattern
      // used on shelf-04, retrofitted here instead of a prose sentence.
      type: 'grammar-intro',
      sectionLabel: 'Building on shelf 1',
      explain: [
        'You already have a few greetings in your pocket. This shelf adds more everyday phrases for check-ins, meals, and coming and going.',
      ],
      recapChips: ['こんにちは (hello)', 'ありがとうございます (thank you)', 'すみません (sorry/excuse me)'],
    },
    {
      type: 'greeting', kana: 'お元気ですか', romaji: 'Ogenki desu ka', pronunciation: '(oh-GEN-kee dess kah)', meaning: 'How are you?',
      usage: 'A polite check-in, but not used as casually as English "how are you" — often reserved for someone you haven’t seen in a while rather than a daily greeting to a coworker.',
    },
    {
      type: 'greeting', kana: '元気です', romaji: 'Genki desu', pronunciation: '(GEN-kee dess)', meaning: 'I’m doing well',
      usage: 'The standard reply to "ogenki desu ka". Can also be used on its own to describe someone as energetic/well.',
    },
    {
      type: 'greeting', kana: 'いただきます', romaji: 'Itadakimasu', pronunciation: '(ee-tah-dah-kee-mahs)', meaning: 'Said before eating',
      usage: 'Said right before starting a meal, whether alone or with others — a small expression of thanks for the food, not just to whoever cooked it.',
    },
    {
      type: 'greeting', kana: 'ごちそうさまでした', romaji: 'Gochisousama deshita', pronunciation: '(goh-chee-soh-sah-mah desh-tah)', meaning: 'Said after eating',
      usage: 'The counterpart to itadakimasu, said after finishing a meal. Also commonly said to a host, chef, or shop staff on the way out.',
    },
    {
      type: 'greeting', kana: 'いってきます', romaji: 'Ittekimasu', pronunciation: '(eet-teh-kee-mahs)', meaning: 'I’m heading out',
      usage: 'Said when leaving home (or your desk/base for a while), announcing you’re going and will be back. The people staying reply with "itterasshai".',
    },
    {
      type: 'greeting', kana: 'ただいま', romaji: 'Tadaima', pronunciation: '(tah-dah-ee-mah)', meaning: 'I’m home',
      usage: 'Said upon returning home (or back to a place you left earlier). The standard reply from whoever’s there is "okaeri" ("welcome back").',
    },
    {
      type: 'greeting', kana: 'お願いします', romaji: 'Onegaishimasu', pronunciation: '(oh-neh-gai-shee-mahs)', meaning: 'Please (making a request)',
      usage: 'Attached to the end of a request to make it polite — ordering food, asking a favor, or handing something over for someone to handle. Extremely common in daily conversation.',
    },
    {
      type: 'greeting', kana: 'ください', romaji: 'Kudasai.', pronunciation: '(koo-duh-sai)', meaning: 'Please. (asking for something)',
      usage: 'Attached after a noun (or a verb\'s te-form) to ask for something directly — e.g. handing over an item, or "mizu wo kudasai" ("water, please"). More concrete/direct than onegaishimasu, which can stand alone.',
    },
    {
      type: 'greeting', kana: 'では、また。', romaji: 'Dewa, mata.', pronunciation: '(deh-wah, mah-tah)', meaning: 'See you again.',
      usage: 'では means "well then" and また means "again". A neutral, slightly formal goodbye that implies you\'ll see the person again — works with coworkers or acquaintances.',
    },
    {
      type: 'greeting', kana: 'じゃ、また。', romaji: 'Ja, mata.', pronunciation: '(jah, mah-tah)', meaning: 'See you again. (casual)',
      usage: 'じゃ is the casual contraction of では — use this instead of "dewa, mata" with friends, family, or casual acquaintances.',
    },
    {
      type: 'greeting', kana: 'じゃあ(ね)。', romaji: 'Jaa (ne).', pronunciation: '(jah(-neh))', meaning: 'See you. (more casual)',
      usage: 'The most casual of the three "see you" phrases — used constantly among friends when parting ways, close to English "see ya" or "later". The ね softens it further.',
    },
    {
      type: 'greeting', kana: 'お邪魔します', romaji: 'Ojama shimasu', pronunciation: '(oh-jah-mah shee-mahs)', meaning: 'Excuse me for intruding / Thanks for having me',
      usage: 'Said when entering someone else\'s home or room — literally acknowledges you\'re "in their way". A must-know phrase for visiting someone\'s house.',
    },
    {
      type: 'greeting', kana: 'よろしくお願いします', romaji: 'Yoroshiku onegaishimasu', pronunciation: '(yoh-roh-shee-koo oh-neh-gai-shee-mahs)', meaning: 'Please treat me kindly / Nice to meet you / Please take care of this',
      usage: 'Extremely common and versatile — said right after introducing yourself, when starting to work with someone, or when asking someone to handle something. Doesn\'t translate directly into English.',
    },
    {
      type: 'greeting', kana: 'はじめまして', romaji: 'Hajimemashite', pronunciation: '(hah-jee-meh-mahsh-teh)', meaning: 'How do you do / Nice to meet you',
      usage: 'Said ONLY the very first time you meet someone — never used again with that same person afterward. Usually followed immediately by your name, then by "yoroshiku onegaishimasu".',
    },
    {
      // Two NPC cats using shelf-02 vocab (plus one already-known
      // shelf-01 phrase, reinforcing retention) in a natural exchange,
      // same pattern as shelf-01's closing conversation page.
      type: 'conversation',
      turns: [
        {
          speaker: 'sensei', name: 'Neko-sensei', action: 'meow', actionLabel: '*meows*',
          text: 'お元気ですか？', romaji: 'Ogenki desu ka? — "How are you?"',
        },
        {
          speaker: 'player', name: 'You', action: 'tailwagLeft', actionLabel: '*tail wags*',
          text: '元気です！ありがとうございます。', romaji: 'Genki desu! Arigatou gozaimasu. — "I\'m doing well! Thank you."',
        },
        {
          speaker: 'sensei', name: 'Neko-sensei', action: 'meow', actionLabel: '*meows*',
          text: 'じゃあね！', romaji: 'Jaa ne! — "See you!"',
        },
      ],
    },
    {
      // 3 drag-and-drop mini-checks (page.choices) — see shelf-01's for
      // the standing pattern this retrofits everywhere.
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'What do you say right before eating?',
      before: '', after: '',
      choices: ['ごちそうさまでした', 'いただきます', 'いってきます'],
      answer: 'いただきます',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Said when you arrive back home:',
      before: '', after: '',
      choices: ['いってきます', 'ただいま', 'お邪魔します'],
      answer: 'ただいま',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'The most casual way to say "see you"?',
      before: '', after: '',
      choices: ['では、また。', 'じゃ、また。', 'じゃあ(ね)。'],
      answer: 'じゃあ(ね)。',
    },
  ],
  // shelf-03 and shelf-04 were swapped (A は B です moved from shelf-04 to
  // shelf-03, Self Introduction moved from shelf-03 to shelf-04) per
  // explicit request — A は B です is now taught FIRST, so Self
  // Introduction can lean on it instead of re-teaching it. LESSON_DATA's
  // titles above were swapped to match; only the content bodies below
  // moved, the physical shelf positions/prereq chain did not change.
  'shelf-03': [
    {
      // Page 1/4 of the intro — restructured to the standing "explain a
      // grammar point" template: one-line big idea (no jargon) -> real-
      // world analogy -> parts table -> fixed pattern (code-box style)
      // -> tense-pair detail -> one bolded takeaway. Diagram/samples/
      // notes each still get their own page below.
      type: 'grammar-intro',
      sectionLabel: 'How this sentence works',
      bigIdea: 'One short pattern does the job of "is/am/are" almost everywhere in Japanese.',
      analogy: 'Think of は like a spotlight and です like a stamp of approval: は swings the spotlight onto whatever you\'re about to talk about, and です stamps "yep, that\'s what it is" at the end.',
      terms: [
        { role: 'particle', name: 'は (wa)', desc: 'Points the spotlight at A — "as for A..."' },
        { role: 'copula', name: 'です (desu)', desc: 'Stamps it as true, politely — "...it\'s B." Also carries the tense.' },
      ],
      pattern: [
        { text: 'A', role: 'subject' }, { text: 'は', role: 'particle' }, { text: 'B', role: 'predicate' }, { text: 'です', role: 'copula' },
      ],
      explain: [
        'です changes shape to move the tense — swap it for でした and the whole sentence slides from now to before, nothing else changes:',
      ],
      tensePair: {
        present: { kana: 'わたしはがくせい<span class="hl">です</span>', translation: '"I am a student."' },
        past: { kana: 'わたしはがくせい<span class="hl">でした</span>', translation: '"I was a student."' },
      },
      explainAfter: [
        'Japanese doesn\'t have a separate future word either — です already covers "will be." (There\'s also a <b>negative</b> form you\'ll meet in a later lesson: <b>わたしはがくせいではありません</b> / dewa arimasen — "I am NOT a student." Same は, same job — just です\'s ending changes again.)',
      ],
      takeaway: 'A は B です means "A is B" — that\'s the one thing to remember for now; everything else is detail.',
    },
    {
      // Page 2/4: the sentence-structure diagram, on its own page.
      type: 'grammar-intro',
      diagramSvg: `
        <svg viewBox="0 0 620 250" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; display:block;">
          <defs>
            <marker id="lb-arrow-gold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--lb-role-particle-bg)"></path>
            </marker>
            <marker id="lb-arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--lb-role-copula-bg)"></path>
            </marker>
          </defs>
          <text x="10" y="24" font-size="11" fill="var(--jr-text-dim)" font-family="VT323, DotGothic16, monospace" letter-spacing="1">ENGLISH - "am" does both jobs at once</text>
          <g font-family="VT323, DotGothic16, monospace" font-size="16">
            <rect x="10" y="36" width="70" height="34" rx="3" fill="var(--lb-role-neutral-bg, #746fa8)"></rect>
            <text x="45" y="58" text-anchor="middle" fill="#efeeff">I</text>
            <rect x="96" y="36" width="70" height="34" rx="3" fill="var(--lb-role-neutral-bg, #746fa8)"></rect>
            <text x="131" y="58" text-anchor="middle" fill="#efeeff">am</text>
            <rect x="182" y="36" width="140" height="34" rx="3" fill="var(--lb-role-neutral-bg, #746fa8)"></rect>
            <text x="252" y="58" text-anchor="middle" fill="#efeeff">a teacher</text>
          </g>
          <text x="131" y="30" text-anchor="middle" font-size="9" fill="var(--jr-text-dim)" font-family="VT323, DotGothic16, monospace">"is" + tense, bundled</text>
          <path d="M121,72 C 118,100 116,140 118,158" fill="none" stroke="var(--lb-role-particle-bg)" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#lb-arrow-gold)"></path>
          <text x="70" y="118" text-anchor="middle" font-size="10" fill="var(--lb-role-particle-bg)" font-family="VT323, DotGothic16, monospace">"is" -&gt; は</text>
          <path d="M141,72 C 175,112 260,145 313,158" fill="none" stroke="var(--lb-role-copula-bg)" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#lb-arrow-green)"></path>
          <text x="270" y="118" text-anchor="middle" font-size="10" fill="var(--lb-role-copula-bg)" font-family="VT323, DotGothic16, monospace">tense -&gt; です (sentence-final)</text>
          <text x="10" y="148" font-size="11" fill="var(--jr-text-dim)" font-family="VT323, DotGothic16, monospace" letter-spacing="1">JAPANESE - split into は (is) and です (tense)</text>
          <g font-family="VT323, DotGothic16, monospace" font-size="16">
            <rect x="10" y="160" width="90" height="34" rx="3" fill="var(--lb-role-subject-bg)"></rect>
            <text x="55" y="182" text-anchor="middle" fill="var(--lb-role-subject-fg)">わたし</text>
            <rect x="108" y="160" width="46" height="34" rx="3" fill="var(--lb-role-particle-bg)"></rect>
            <text x="131" y="182" text-anchor="middle" fill="var(--lb-role-particle-fg)">は</text>
            <rect x="162" y="160" width="110" height="34" rx="3" fill="var(--lb-role-predicate-bg)"></rect>
            <text x="217" y="182" text-anchor="middle" fill="var(--lb-role-predicate-fg)">せんせい</text>
            <rect x="280" y="160" width="70" height="34" rx="3" fill="var(--lb-role-copula-bg)"></rect>
            <text x="315" y="182" text-anchor="middle" fill="var(--lb-role-copula-fg)">です</text>
          </g>
          <g font-family="VT323, DotGothic16, monospace" font-size="9" fill="var(--jr-text-dim)">
            <text x="55" y="208" text-anchor="middle">subject</text>
            <text x="131" y="203" text-anchor="middle">topic + "is"</text>
            <text x="217" y="208" text-anchor="middle">predicate</text>
            <text x="315" y="203" text-anchor="middle">tense +</text>
            <text x="315" y="215" text-anchor="middle">politeness</text>
          </g>
          <text x="10" y="238" font-size="10" fill="var(--jr-text-dim)" font-family="VT323, DotGothic16, monospace">Swap です -&gt; でした and ONLY the tense changes - は's job never moves.</text>
        </svg>
      `,
      diagramCaption: '"Watashi wa sensei desu." — English bundles "is" and tense into one word (am/was). Japanese splits them: は carries "is," です carries tense.',
    },
    {
      // Page 3/4: the 3 quick illustrative samples, on their own page.
      type: 'grammar-intro',
      samples: [
        {
          tag: '"I am a student."',
          tiles: [
            { text: 'わたし', role: 'subject', gloss: 'I / me' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'がくせい', role: 'predicate', gloss: 'student' },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Watashi wa gakusei desu.',
        },
        {
          tag: '"This is a book."',
          tiles: [
            { text: 'これ', role: 'subject', gloss: 'this' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'ほん', role: 'predicate', gloss: 'book' },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Kore wa hon desu.',
        },
        {
          tag: '"I was a student."',
          tiles: [
            { text: 'わたし', role: 'subject', gloss: 'I / me' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'がくせい', role: 'predicate', gloss: 'student' },
            { text: 'でした', role: 'copula', gloss: 'was (past)' },
          ],
          translation: 'Watashi wa gakusei deshita.',
        },
      ],
    },
    {
      // Page 4/4: the two culture notes, on their own page.
      type: 'grammar-intro',
      cultureNotes: [
        'です also makes a sentence sound <b>polite</b> — like how Filipino adds <b>"po"</b> or <b>"opo"</b>. It doesn\'t change what you\'re saying, just how respectful it sounds.',
        'Filipino even has its own は: the particle <b>"ay"</b> sits right after the topic the same way は does — <b>"Ako ay guro"</b> works just like <b>"Watashi wa sensei."</b>',
      ],
    },
    {
      type: 'sentence',
      label: 'Example 1',
      tiles: [
        { text: 'わたし', role: 'subject', gloss: 'I / me (subject)' },
        { text: 'は', role: 'particle', gloss: 'topic marker (wa)' },
        { text: 'がくせい', role: 'predicate', gloss: 'student (predicate)' },
        { text: 'です', role: 'copula', gloss: 'am / is / are (copula, polite)' },
      ],
      translation: 'Watashi wa gakusei desu. — "I am a student."',
    },
    {
      type: 'sentence',
      label: 'Example 2',
      newWordFlag: 'New word: これ (kore)',
      tiles: [
        { text: 'これ', role: 'subject', gloss: 'this (thing near me)', isNew: true },
        { text: 'は', role: 'particle', gloss: 'topic marker (wa)' },
        { text: 'ほん', role: 'predicate', gloss: 'book (predicate)' },
        { text: 'です', role: 'copula', gloss: 'am / is / are (copula, polite)' },
      ],
      translation: 'Kore wa hon desu. — "This is a book."',
    },
    {
      type: 'sentence',
      label: 'Example 3',
      newWordFlag: 'New word: ペン (pen)',
      tiles: [
        { text: 'これ', role: 'subject', gloss: 'this (thing near me)' },
        { text: 'は', role: 'particle', gloss: 'topic marker (wa)' },
        { text: 'ペン', role: 'predicate', gloss: 'pen (predicate)', isNew: true },
        { text: 'です', role: 'copula', gloss: 'am / is / are (copula, polite)' },
      ],
      translation: 'Kore wa pen desu. — "This is a pen."',
      note: 'Same これ from before, just a different B. Swap in any noun you know and the pattern still works.',
    },
    {
      type: 'sentence',
      label: 'Example 4',
      newWordFlag: 'New word: でした (deshita)',
      tiles: [
        { text: 'わたし', role: 'subject', gloss: 'I / me (subject)' },
        { text: 'は', role: 'particle', gloss: 'topic marker (wa)' },
        { text: 'がくせい', role: 'predicate', gloss: 'student (predicate)' },
        { text: 'でした', role: 'copula', gloss: 'was (copula, polite past)', isNew: true },
      ],
      translation: 'Watashi wa gakusei deshita. — "I was a student."',
      note: 'でした is just です pushed into the past — same politeness, same job, only the tense changes. Nothing else about the sentence pattern moves.',
    },
    {
      type: 'sentence',
      label: 'Example 5',
      newWordFlag: 'New word: せんせい (sensei)',
      tiles: [
        { text: 'わたし', role: 'subject', gloss: 'I / me (subject)' },
        { text: 'は', role: 'particle', gloss: 'topic marker (wa)' },
        { text: 'せんせい', role: 'predicate', gloss: 'teacher (predicate)', isNew: true },
        { text: 'です', role: 'copula', gloss: 'am / is / are (copula, polite)' },
      ],
      translation: 'Watashi wa sensei desu. — "I am a teacher."',
      note: 'Filipino lines up word-for-word almost perfectly: <b>Ako</b> (watashi) <b>ay</b> (wa) <b>guro/Teacher</b> (sensei) <b>po</b> (desu). ay plays は\'s role, po plays です\'s role.',
    },
    {
      // Full-shelf vocab recap (reuses the 'summary' type's data table,
      // same as appendGreetingSummary produces for greeting-type shelves)
      // — every word used across the 5 example sentences, not just the
      // ones flagged newWordFlag, since a beginner benefits from seeing
      // the whole set reinforced together at the end.
      type: 'summary',
      title: 'New Words: A は B です',
      headers: ['Word', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'わたし', romaji: 'watashi', meaning: 'I / me' },
        { kana: 'は', romaji: 'wa', meaning: 'topic marker' },
        { kana: 'です', romaji: 'desu', meaning: 'am / is / are (polite)' },
        { kana: 'がくせい', romaji: 'gakusei', meaning: 'student' },
        { kana: 'これ', romaji: 'kore', meaning: 'this (thing near me)' },
        { kana: 'ほん', romaji: 'hon', meaning: 'book' },
        { kana: 'ペン', romaji: 'pen', meaning: 'pen' },
        { kana: 'でした', romaji: 'deshita', meaning: 'was / were (polite past)' },
        { kana: 'せんせい', romaji: 'sensei', meaning: 'teacher' },
      ],
    },
    {
      // 3 drag-and-drop mini-checks (page.choices) — see shelf-01's for
      // the standing pattern this retrofits everywhere. Distractors are
      // all words this shelf itself already taught (see the summary
      // table above), not invented/untaught vocab.
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I am a student":',
      before: 'わたしはがくせい', after: '。',
      choices: ['でした', 'です', 'せんせい'],
      answer: 'です',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "This is a pen":',
      before: 'これは', after: 'です。',
      choices: ['ほん', 'ペン', 'がくせい'],
      answer: 'ペン',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "I WAS a student" (past tense):',
      before: 'わたしはがくせい', after: '。',
      choices: ['です', 'でした', 'せんせい'],
      answer: 'でした',
    },
  ],
  'shelf-04': [
    {
      // Page 1/8: what jikoshoukai is + a BRIEF pattern reminder (not a
      // re-teach — A は B です is shelf-03 now, already studied) + the
      // culture behind it, all combined on one page via grammar-intro's
      // section stacking (intro block, then a notes block, divided).
      type: 'grammar-intro',
      sectionLabel: 'What is jikoshoukai?',
      bigIdea: 'A Japanese self-introduction always follows the exact same 3-step shape.',
      analogy: 'It\'s like a knock-knock joke — everyone already knows the shape, so you just fill in your own punchline (your name) in the middle.',
      recapChips: ['はじめまして (greet)', 'A は B です (name)', 'よろしくお願いします (close)'],
      terms: [
        { role: 'particle', name: '1. Greet', desc: 'はじめまして — said only at a first meeting.' },
        { role: 'subject', name: '2. Name', desc: 'わたしは [name] です — the pattern from the last shelf, put to work.' },
        { role: 'predicate', name: '3. Close', desc: 'よろしくお願いします — closes politely, every time.' },
      ],
      explain: [
        'Quick reminder of the pattern from the last shelf: <b><span class="role-subject">わたし</span><span class="role-particle">は</span> <span class="role-predicate">Neko</span> <span class="role-copula">です</span></b> — "as for me, Neko."',
      ],
      cultureNotes: [
        'Jikoshoukai isn\'t just small talk — it\'s treated like a small ritual. You give it standing up, often with a slight bow, on your first day at a new school or job, or when meeting someone through a mutual connection.',
        'よろしくお願いします doesn\'t really translate into English — it\'s closer to "please treat me well going forward" or "I\'m counting on a good relationship." Saying it at the end of a self-introduction is basically mandatory, not optional politeness.',
      ],
      takeaway: 'Greet, say your name with A は B です, close politely — same 3 steps, every single time.',
    },
    {
      // Page 2/8: the self-intro exchange as an actual two-party
      // conversation. Neko-sensei's color is resolved dynamically at
      // lesson-start (resolveConversationTurns) so she never matches the
      // player's own selected cat color. お名前/何/か are genuinely new
      // here (jikoshoukai-specific vocab, not covered by A は B です) so
      // they're still color-coded; わたし/は/です are NOT re-highlighted
      // as new since shelf-03 already introduced them.
      type: 'conversation',
      turns: [
        {
          speaker: 'sensei', name: 'Neko-sensei', action: 'meow', actionLabel: '*meows*',
          text: 'はじめまして。<span class="role-subject">お名前</span><span class="role-particle">は</span><span class="role-predicate">何</span><span class="role-copula">です</span><span class="role-particle">か</span>。',
          romaji: 'Hajimemashite. O-namae wa nan desu ka. — "How do you do. What is your name?"',
        },
        {
          speaker: 'player', name: 'You', action: 'tailwagLeft', actionLabel: '*tail wags*',
          text: 'わたしはレイヤです。',
          romaji: 'Watashi wa Reya desu. — "I am Reya."',
        },
        {
          speaker: 'sensei', name: 'Neko-sensei', action: 'meow', actionLabel: '*meows*',
          text: 'レイヤさん、よろしくお願いします！',
          romaji: 'Reya-san, yoroshiku onegaishimasu! — "Nice to meet you, Reya!"',
        },
      ],
    },
    {
      // Page 3/8: "you try" gate — advance() won't move past this page
      // until the player actually types a name (see lesson-box.js).
      // Deliberately kept as free-text (not the drag-and-drop
      // page.choices variant) — this blank has no single fixed correct
      // answer, any name is valid, so offering 3 fake "name choices"
      // wouldn't make sense here the way it does for a real grammar blank.
      type: 'try-it',
      sectionLabel: 'Your turn',
      prompt: 'Now you try — type your own name to finish your self-introduction:',
      before: 'わたしは ',
      after: ' です',
      placeholder: 'Neko',
    },
    {
      // 3 drag-and-drop mini-checks (page.choices) — see shelf-01's for
      // the standing pattern this retrofits everywhere.
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'The greeting used ONLY the first time you meet someone:',
      before: '', after: '',
      choices: ['よろしくお願いします', 'はじめまして', 'こんにちは'],
      answer: 'はじめまして',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "What is your name?" (polite):',
      before: '', after: 'は何ですか。',
      choices: ['か', 'お名前', '何'],
      answer: 'お名前',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'The polite closing line after introducing yourself:',
      before: '', after: '',
      choices: ['はじめまして', 'よろしくお願いします', 'ありがとうございます'],
      answer: 'よろしくお願いします',
    },
    {
      // Page 7/8: new-words recap — only お名前/何/か are new to THIS
      // shelf (わたし/は/です were already taught on shelf-03, so they're
      // deliberately left off this table rather than re-listed).
      type: 'summary',
      title: 'New Words: Jikoshoukai',
      headers: ['Word', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'お名前', romaji: 'o-namae', meaning: 'name (polite)' },
        { kana: '何', romaji: 'nan', meaning: 'what' },
        { kana: 'か', romaji: 'ka', meaning: 'question marker' },
      ],
    },
    {
      // Page 8/8: fill-in-the-blank check — non-blocking (this is the
      // last page; advancing past it completes the lesson regardless),
      // "Check answers" just gives immediate right/wrong feedback.
      type: 'quiz-fill',
      sectionLabel: 'Quick check: Jikoshoukai',
      intro: 'Fill in the blanks:',
      questions: [
        { before: '', after: 'まして。', answer: 'はじめ', altAnswers: ['hajime'], hint: '(the greeting — first meeting only)' },
        { before: 'わたしはタロウ', after: '。', answer: 'です', altAnswers: ['desu'], hint: '(the polite copula)' },
        { before: '', after: 'お願いします。', answer: 'よろしく', altAnswers: ['yoroshiku'], hint: '(closing politely)' },
      ],
    },
  ],
  'shelf-05': [
    {
      // Page 1/13: how the demonstrative (こそあど) system works, plus a
      // recap chip for これ (already known since shelf-03's samples) so
      // it doesn't get re-taught as new — intro/diagram/4x samples/
      // conversation/try-it/summary/quiz is the standing pattern for
      // every future grammar shelf; this one has an extra page (これ vs
      // この construction contrast) specific to demonstratives' quirk of
      // some forms standing alone and others needing a noun attached.
      type: 'grammar-intro',
      sectionLabel: 'How demonstratives work',
      bigIdea: 'Japanese picks "this/that" based on distance, not just what the object is.',
      analogy: 'It\'s like a 3-ring dartboard centered on YOU, the speaker: the bullseye ring is yours, the middle ring belongs to whoever you\'re talking to, and everything outside that is "over there," full stop.',
      recapChips: ['これ (this — already known)'],
      terms: [
        { role: 'subject', name: 'これ / この', desc: 'Close to YOU, the speaker.' },
        { role: 'subject', name: 'それ / その', desc: 'Close to the person you\'re talking to.' },
        { role: 'subject', name: 'あれ / あの', desc: 'Far from both of you.' },
      ],
      explain: [
        'Two shapes per distance: これ/それ/あれ stand alone ("this one"), while この/その/あの attach directly in front of a noun ("this ___").',
      ],
      takeaway: 'Distance from YOU decides the word — これ is always yours, それ is always theirs, あれ is always far away.',
    },
    {
      // Page 2/10: the near-you / near-them / far-from-both diagram — one
      // row per word instead of three side-by-side zone boxes, using the
      // player's own cat color for "you" and Neko-sensei's derived color
      // for "listener" (a function here, not a static string — resolved
      // by resolveDynamicDiagrams at lesson-open time, same mechanism
      // resolveConversationTurns already uses for conversation pages) plus
      // the cattomouse pixel art as the item marker.
      type: 'grammar-intro',
      diagramSvg: buildDemonstrativesDiagram,
      diagramCaption: 'これ/それ/あれ always track distance from the SPEAKER — not from the object to "you" in general.',
    },
    {
      // Page 3/10: standalone これ/それ/あれ samples — これ shown too
      // (unflagged, since it's already known) so the full 3-way contrast
      // reads together instead of only showing the 2 new ones in isolation.
      type: 'grammar-intro',
      samples: [
        {
          tag: '"This is a book." (near you)',
          tiles: [
            { text: 'これ', role: 'subject', gloss: 'this' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'ほん', role: 'predicate', gloss: 'book' },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Kore wa hon desu.',
        },
        {
          tag: '"That is a pen." (near the listener)',
          tiles: [
            { text: 'それ', role: 'subject', gloss: 'that', isNew: true },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'ペン', role: 'predicate', gloss: 'pen' },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Sore wa pen desu.',
        },
        {
          tag: '"That over there is a book." (far from both)',
          tiles: [
            { text: 'あれ', role: 'subject', gloss: 'that over there', smallGloss: true, isNew: true },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'ほん', role: 'predicate', gloss: 'book' },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Are wa hon desu.',
        },
      ],
    },
    {
      // Page 4/10: この/その/あの + どれ/どの (the noun-modifying shapes,
      // plus the question member of the set — a full こそあど lesson
      // conventionally covers all 4, not just 3). These are short noun
      // phrases, not full sentences (this shelf comes before adjectives
      // or の-possessives, so there's nothing to build a natural full
      // sentence out of yet without borrowing ungrounded grammar).
      type: 'grammar-intro',
      sectionLabel: 'Attaching to a noun',
      samples: [
        {
          tag: '"this book"',
          tiles: [
            { text: 'この', role: 'subject', gloss: 'this ~', isNew: true },
            { text: 'ほん', role: 'subject', gloss: 'book' },
          ],
          translation: 'kono hon',
        },
        {
          tag: '"that pen" (near the listener)',
          tiles: [
            { text: 'その', role: 'subject', gloss: 'that ~', isNew: true },
            { text: 'ペン', role: 'subject', gloss: 'pen' },
          ],
          translation: 'sono pen',
        },
        {
          tag: '"that teacher over there"',
          tiles: [
            { text: 'あの', role: 'subject', gloss: 'that ~ over there', isNew: true },
            { text: 'せんせい', role: 'subject', gloss: 'teacher' },
          ],
          translation: 'ano sensei',
        },
        {
          tag: '"which student?"',
          tiles: [
            { text: 'どの', role: 'subject', gloss: 'which ~', isNew: true },
            { text: 'がくせい', role: 'subject', gloss: 'student' },
          ],
          translation: 'dono gakusei',
        },
      ],
    },
    {
      // これ vs この sentence-construction contrast — これ/それ/あれ can
      // BE the subject on their own (page 3), but この/その/あの/どの
      // can't stand alone (page 4 above only shows them as bare noun
      // phrases, e.g. "kono hon") — they grab a noun, and that noun
      // becomes the subject together with them. Borrows の (possessive
      // "'s/mine") one shelf early specifically to show a real full
      // sentence built on a この-phrase, since without it there's no
      // natural predicate to attach — flagged isNew like any other
      // early-introduced word.
      type: 'grammar-intro',
      sectionLabel: 'これ vs この — same word, different job',
      bigIdea: 'これ IS the subject. この can\'t be the subject alone — it grabs a noun, and the two together become the subject.',
      analogy: 'これ is like pointing at something and saying "this one" — that\'s the whole subject, done. この is like pointing while your hand is already resting on a noun — "this ___" only becomes the subject once you name what "___" is.',
      explain: [
        'That\'s why これはペンです works (これ alone is enough to be "this"), but この alone doesn\'t — この always needs a noun glued to it (このペン, "this pen"), and THAT whole phrase is what は marks as the topic.',
      ],
      samples: [
        {
          tag: '"This is a pen." — これ alone is the subject',
          tiles: [
            { text: 'これ', role: 'subject', gloss: 'this' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'ペン', role: 'predicate', gloss: 'pen' },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Kore wa pen desu.',
        },
        {
          tag: '"This pen is mine." — この+pen together are the subject',
          tiles: [
            { text: 'この', role: 'subject', gloss: 'this ~' },
            { text: 'ペン', role: 'subject', gloss: 'pen' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'わたし', role: 'predicate', gloss: 'I / me' },
            { text: 'の', role: 'particle', gloss: '\'s / mine (possessive)', smallGloss: true, isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Kono pen wa watashi no desu.',
        },
      ],
      takeaway: 'これ replaces a whole noun; この borrows one — either way, は…です still wraps around whatever the real subject turns out to be.',
    },
    {
      // Page 6/13: ここ/そこ/あそこ/どこ — the "place" row of the こそあど
      // grid (これ/この/ここ/こちら etc. is a 4-column table; this shelf
      // now covers 3 of those 4 columns). Full copula sentences, same
      // shape as page 3, since these stand alone like これ/それ/あれ
      // rather than attaching to a noun like この/その/あの.
      type: 'grammar-intro',
      sectionLabel: 'Talking about places',
      samples: [
        {
          tag: '"The book is here." (near you)',
          tiles: [
            { text: 'ほん', role: 'subject', gloss: 'book' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'ここ', role: 'predicate', gloss: 'here', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Hon wa koko desu.',
        },
        {
          tag: '"The pen is there." (near the listener)',
          tiles: [
            { text: 'ペン', role: 'subject', gloss: 'pen' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'そこ', role: 'predicate', gloss: 'there', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Pen wa soko desu.',
        },
        {
          tag: '"The teacher is over there." (far from both)',
          tiles: [
            { text: 'せんせい', role: 'subject', gloss: 'teacher' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'あそこ', role: 'predicate', gloss: 'over there', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Sensei wa asoko desu.',
        },
        {
          tag: '"Where is the cat?"',
          tiles: [
            { text: 'ねこ', role: 'subject', gloss: 'cat' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'どこ', role: 'predicate', gloss: 'where', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker' },
          ],
          translation: 'Neko wa doko desu ka?',
        },
      ],
    },
    {
      // Page 7/13: こちら/そちら/あちら/どちら — the polite/direction row
      // (the 4th column of the grid). More formal than これ/それ/あれ and
      // doubles as a polite way to refer to a person ("this is ~"), so the
      // samples lean on real service-counter phrasing (restroom/exit/
      // station) rather than repeating the book/pen examples verbatim.
      type: 'grammar-intro',
      sectionLabel: 'Polite direction words',
      explain: [
        'こちら/そちら/あちら/どちら are the polite versions of これ/それ/あれ/どれ — same distance rules, softer tone. Common on signs, in shops, and when politely introducing someone ("こちらは〜です" = "this is ~").',
      ],
      samples: [
        {
          tag: '"This is Tanaka-san." (polite, introducing someone near you)',
          tiles: [
            { text: 'こちら', role: 'subject', gloss: 'this (polite)', isNew: true },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'たなかさん', role: 'predicate', gloss: 'Mr. / Ms. Tanaka' },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Kochira wa Tanaka-san desu.',
        },
        {
          tag: '"The restroom is that way." (near the listener)',
          tiles: [
            { text: 'おてあらい', role: 'subject', gloss: 'restroom' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'そちら', role: 'predicate', gloss: 'that way (polite)', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Otearai wa sochira desu.',
        },
        {
          tag: '"The exit is over there." (far from both, polite)',
          tiles: [
            { text: 'でぐち', role: 'subject', gloss: 'exit' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'あちら', role: 'predicate', gloss: 'over there (polite)', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Deguchi wa achira desu.',
        },
        {
          tag: '"Which way is the station?"',
          tiles: [
            { text: 'えき', role: 'subject', gloss: 'station' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'どちら', role: 'predicate', gloss: 'which way', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker' },
          ],
          translation: 'Eki wa dochira desu ka?',
        },
      ],
    },
    {
      // Page 8/13: conversation — reuses なん (shelf-04) and ありがとう
      // (shelf-01) so it's not leaning on brand-new vocab beyond この
      // shelf's own それ.
      type: 'conversation',
      turns: [
        {
          speaker: 'sensei', name: 'Neko-sensei', action: 'meow', actionLabel: '*meows*',
          text: '<span class="role-subject">それ</span>はなんですか？',
          romaji: 'Sore wa nan desu ka? — "What is that (by you)?"',
        },
        {
          speaker: 'player', name: 'You', action: 'tailwagLeft', actionLabel: '*tail wags*',
          text: '<span class="role-subject">これ</span>はほんです。',
          romaji: 'Kore wa hon desu. — "This is a book."',
        },
        {
          speaker: 'sensei', name: 'Neko-sensei', action: 'meow', actionLabel: '*meows*',
          text: 'ありがとう！',
          romaji: 'Arigatou! — "Thanks!"',
        },
      ],
    },
    {
      // Page 9/13: "you try" gate — advance() stays locked until the
      // correct tile is dragged into the blank, same gate mechanism as
      // shelf-04's try-it (see lesson-box.js) but the drag-and-drop
      // variant (page.choices) — this blank has one fixed correct answer
      // (これ), so 3 draggable options work naturally here, unlike
      // shelf-04's free-name blank.
      type: 'try-it',
      sectionLabel: 'Your turn',
      prompt: 'Something is right next to YOU. Drag the right word into the blank to say "this is a pen":',
      before: '',
      after: 'はペンです',
      choices: ['それ', 'これ', 'あれ'],
      answer: 'これ',
    },
    {
      // 2 more drag-and-drop mini-checks — brings this shelf to 3 total
      // (this + the これ one above), matching the standing per-lesson
      // minimum retrofitted across shelf-01..05.
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Something is far from both you and the listener. Say "that is a book":',
      before: '', after: 'はほんです。',
      choices: ['それ', 'あれ', 'これ'],
      answer: 'あれ',
    },
    {
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Ask "Where is the cat?":',
      before: 'ねこは', after: 'ですか。',
      choices: ['どこ', 'ここ', 'そこ'],
      answer: 'どこ',
    },
    {
      // Page 10/13: new-words recap — これ deliberately excluded (already
      // taught on shelf-03), matching the "only genuinely new words"
      // convention from shelf-04's summary page. Now covers all 4 columns
      // of the こそあど grid (これ/この/ここ/こちら etc.), not just the
      // first two.
      type: 'summary',
      title: 'New Words: Demonstratives',
      headers: ['Word', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'それ', romaji: 'sore', meaning: 'that (near listener)' },
        { kana: 'あれ', romaji: 'are', meaning: 'that over there' },
        { kana: 'どれ', romaji: 'dore', meaning: 'which one' },
        { kana: 'この', romaji: 'kono', meaning: 'this ~ (+noun)' },
        { kana: 'その', romaji: 'sono', meaning: 'that ~ (+noun)' },
        { kana: 'あの', romaji: 'ano', meaning: 'that ~ over there (+noun)' },
        { kana: 'どの', romaji: 'dono', meaning: 'which ~ (+noun)' },
        { kana: 'ここ', romaji: 'koko', meaning: 'here (near you)' },
        { kana: 'そこ', romaji: 'soko', meaning: 'there (near listener)' },
        { kana: 'あそこ', romaji: 'asoko', meaning: 'over there (far from both)' },
        { kana: 'どこ', romaji: 'doko', meaning: 'where' },
        { kana: 'こちら', romaji: 'kochira', meaning: 'this (polite) / this way' },
        { kana: 'そちら', romaji: 'sochira', meaning: 'that (polite) / that way' },
        { kana: 'あちら', romaji: 'achira', meaning: 'that over there (polite)' },
        { kana: 'どちら', romaji: 'dochira', meaning: 'which way (polite)' },
        { kana: 'の', romaji: 'no', meaning: '\'s / mine (possessive)' },
      ],
    },
    {
      // Page 13/13: fill-in-the-blank check — non-blocking, same pattern
      // as shelf-04's closing quiz. Covers all 4 columns now, not just
      // これ/それ/あれ/どれ.
      type: 'quiz-fill',
      sectionLabel: 'Quick check: Demonstratives',
      intro: 'Fill in the blanks:',
      questions: [
        { before: '', after: 'はペンです。 (near the listener)', answer: 'それ', altAnswers: ['sore'], hint: '(close to the person you\'re talking to)' },
        { before: '', after: 'はほんです。 (far from both of you)', answer: 'あれ', altAnswers: ['are'], hint: '(far from both speaker and listener)' },
        { before: '', after: 'ですか。 (asking "which one?")', answer: 'どれ', altAnswers: ['dore'], hint: '(the question member of the set)' },
        { before: 'ねこは', after: 'ですか。 (asking "where is the cat?")', answer: 'どこ', altAnswers: ['doko'], hint: '(place question word)' },
        { before: 'えきは', after: 'です。 (far away, polite)', answer: 'あちら', altAnswers: ['achira'], hint: '(polite "over there")' },
      ],
    },
  ],
  // shelf-06's "Questions (か)" — builds on shelf-05's どこ/どの/どちら and
  // shelf-04's なん, adding か itself plus だれ/いつ/どうして・なぜ/いくつ/
  // いくら and the はい/いいえ/そうです/ちがいます answer words. Every
  // sample stays on the established Xは...です(か) pattern — no adjectives
  // or verb conjugation yet (those start at shelf-10/11/13).
  'shelf-06': [
    {
      // Page 1/14: か's hook — just the big idea + analogy, kept alone so
      // the very first thing the player sees is light, not a wall of
      // fields (previously this page also carried recapChips/terms/
      // pattern/explain/takeaway all at once — split across pages 1-3
      // below per explicit "keep it 3 page, easy on the eyes" request).
      type: 'grammar-intro',
      sectionLabel: 'How か makes a question',
      dividedIntro: true,
      bigIdea: 'One tiny particle turns any calm statement into a question — nothing else moves.',
      analogy: 'か works like the sound of a question mark: you don\'t reorder the sentence or slot in a new word partway through, you just tack it onto the very end.',
    },
    {
      // Page 2/14: the mechanics — recap + the term itself + the fixed
      // pattern, dividedIntro so these 3 distinct chunks each read as
      // their own section instead of one dense stack.
      type: 'grammar-intro',
      dividedIntro: true,
      recapChips: ['です (shelf 3)', 'なん (shelf 4)', 'どこ・どの・どちら (shelf 5)'],
      terms: [
        { role: 'particle', name: 'か (ka)', desc: 'Added to the very end of a sentence — turns a statement into a question.' },
      ],
      pattern: [
        { text: '[statement]', role: 'subject' }, { text: 'か', role: 'particle' },
      ],
    },
    {
      // Page 3/14: the fuller explanation + the one-thing-to-remember
      // takeaway, on their own page — split into 2 short paragraphs (was
      // 1 dense wall of text) with inline role-colored spans on the
      // example words, matching the colorful, "alive" look every other
      // page already has (samples/diagram/word-tiles) instead of reading
      // as flat white text.
      type: 'grammar-intro',
      sectionLabel: 'Putting it together',
      dividedIntro: true,
      explain: [
        'The first way: tack it onto a plain yes/no statement. <span class="role-subject">これ</span><span class="role-particle">は</span><span class="role-predicate">ほん</span><span class="role-copula">です</span> becomes <span class="role-subject">これ</span><span class="role-particle">は</span><span class="role-predicate">ほん</span><span class="role-copula">です</span><b class="role-particle">か</b> — "Is this a book?"',
        'The second way: tack it onto a sentence that already has a question word in it. <span class="role-subject">せんせい</span><span class="role-particle">は</span><span class="role-predicate">どこ</span><span class="role-copula">です</span> becomes ...どこです<b class="role-particle">か</b> — "Where is the teacher?" (reusing どこ from shelf 5).',
      ],
      takeaway: 'Either way, word order never changes — か always goes at the very end.',
    },
    {
      // Page 4/14: statement -> question diagram — real cat-face pips
      // (buildQuestionParticleDiagram), matching shelf-05's diagram
      // treatment instead of plain SVG boxes, per explicit request.
      // Function, not a static string — resolved by resolveDynamicDiagrams
      // at lesson-open time (same mechanism shelf-05 uses).
      type: 'grammar-intro',
      diagramSvg: buildQuestionParticleDiagram,
      diagramCaption: 'Same words, same order — か tacked onto the very end is the only difference between a statement and a question.',
    },
    {
      // Page 5/14: yes/no questions and their answers — introduces
      // はい/いいえ/そうです/ちがいます inline with the questions they answer.
      type: 'grammar-intro',
      sectionLabel: 'Yes-or-no questions, and answering them',
      samples: [
        {
          tag: '"Is this a book?"',
          tiles: [
            { text: 'これ', role: 'subject', gloss: 'this' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'ほん', role: 'predicate', gloss: 'book' },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker', smallGloss: true, isNew: true },
          ],
          translation: 'Kore wa hon desu ka?',
        },
        {
          tag: '"Yes, that\'s right."',
          tiles: [
            { text: 'はい', role: 'subject', gloss: 'yes', isNew: true },
            { text: 'そうです', role: 'subject', gloss: 'that\'s right', isNew: true },
          ],
          translation: 'Hai, sou desu.',
        },
        {
          tag: '"Is that a pen?"',
          tiles: [
            { text: 'それ', role: 'subject', gloss: 'that' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'ペン', role: 'predicate', gloss: 'pen' },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker', smallGloss: true },
          ],
          translation: 'Sore wa pen desu ka?',
        },
        {
          tag: '"No, that\'s wrong. It\'s a book."',
          tiles: [
            { text: 'いいえ', role: 'predicate', gloss: 'no', isNew: true },
            { text: 'ちがいます', role: 'predicate', gloss: 'that\'s wrong', smallGloss: true, isNew: true },
            { text: 'ほん', role: 'predicate', gloss: 'book' },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Iie, chigaimasu. Hon desu.',
        },
      ],
    },
    {
      // Page 6/14: the 5 new content question words as a set.
      type: 'grammar-intro',
      sectionLabel: 'The question words',
      explain: [
        'These attach the same way どこ/どの/どちら did on shelf 5 — swap in whichever question word fits, keep everything else the same.',
      ],
      terms: [
        { role: 'predicate', name: 'だれ (dare)', desc: 'Who' },
        { role: 'predicate', name: 'いつ (itsu)', desc: 'When' },
        { role: 'predicate', name: 'どうして (doushite)', desc: 'Why — neutral, spoken' },
        { role: 'predicate', name: 'なぜ (naze)', desc: 'Why — more formal, written' },
        { role: 'predicate', name: 'いくつ (ikutsu)', desc: 'How many (small countable things)' },
        { role: 'predicate', name: 'いくら (ikura)', desc: 'How much (price)' },
      ],
    },
    {
      // Page 7/14: だれ・いつ samples. たんじょうび is a one-off context
      // noun (same precedent as shelf-05's えき/でぐち/おてあらい) — glossed
      // inline, not added to this shelf's vocab table.
      type: 'grammar-intro',
      samples: [
        {
          tag: '"Who is the teacher?"',
          tiles: [
            { text: 'せんせい', role: 'subject', gloss: 'teacher' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'だれ', role: 'predicate', gloss: 'who', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker', smallGloss: true },
          ],
          translation: 'Sensei wa dare desu ka?',
        },
        {
          tag: '"When is your birthday?"',
          tiles: [
            { text: 'たんじょうび', role: 'subject', gloss: 'birthday' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'いつ', role: 'predicate', gloss: 'when', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker', smallGloss: true },
          ],
          translation: 'Tanjoubi wa itsu desu ka?',
        },
      ],
    },
    {
      // Page 8/14: どうして・なぜ・いくつ・いくら samples. りんご is a
      // one-off context noun, same treatment as たんじょうび above.
      type: 'grammar-intro',
      samples: [
        {
          tag: '"Why?" (casual, spoken)',
          tiles: [
            { text: 'どうして', role: 'predicate', gloss: 'why (casual)', smallGloss: true, isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker', smallGloss: true },
          ],
          translation: 'Doushite desu ka?',
        },
        {
          tag: '"Why?" (formal, written)',
          tiles: [
            { text: 'なぜ', role: 'predicate', gloss: 'why (formal)', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker', smallGloss: true },
          ],
          translation: 'Naze desu ka?',
        },
        {
          tag: '"How many apples?"',
          tiles: [
            { text: 'りんご', role: 'subject', gloss: 'apple' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'いくつ', role: 'predicate', gloss: 'how many', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker', smallGloss: true },
          ],
          translation: 'Ringo wa ikutsu desu ka?',
        },
        {
          tag: '"How much is this?"',
          tiles: [
            { text: 'これ', role: 'subject', gloss: 'this' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'いくら', role: 'predicate', gloss: 'how much (price)', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker', smallGloss: true },
          ],
          translation: 'Kore wa ikura desu ka?',
        },
      ],
    },
    {
      // Page 9/14: conversation — reuses なん (shelf-04) and this shelf's
      // own か/ありがとうございます (shelf-01). そうですか (literally
      // そう+です+か) is called out inline via the romaji gloss since it
      // functions as "oh, I see" — a reaction phrase, not a real question.
      type: 'conversation',
      turns: [
        {
          speaker: 'player', name: 'You', action: 'tailwagRight', actionLabel: '*tail wags*',
          text: 'すみません、これはなんですか？',
          romaji: 'Sumimasen, kore wa nan desu ka? — "Excuse me, what is this?"',
        },
        {
          speaker: 'sensei', name: 'Neko-sensei', action: 'meow', actionLabel: '*meows*',
          text: 'それはほんです。',
          romaji: 'Sore wa hon desu. — "That is a book."',
        },
        {
          speaker: 'player', name: 'You', action: 'tailwagLeft', actionLabel: '*tail wags*',
          text: 'そうですか！ありがとうございます。',
          romaji: 'Sou desu ka! Arigatou gozaimasu. — "Oh, I see! Thank you."',
        },
      ],
    },
    {
      // Page 10/14: drag-and-drop mini-check — the shelf's core grammar
      // point itself (add か to make a question), not just vocab recall.
      // Distractors are taught words that would NOT turn this into a
      // question, so a correct pick means actually understanding か's job.
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Turn "これはほんです" into a question — drag the one particle that goes at the very end:',
      before: 'これはほんです', after: '',
      choices: ['は', 'です', 'か'],
      answer: 'か',
    },
    {
      // Page 11/14: drag-and-drop mini-check — だれ.
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Ask "Who is the teacher?":',
      before: 'せんせいは', after: 'ですか。',
      choices: ['だれ', 'いつ', 'いくつ'],
      answer: 'だれ',
    },
    {
      // Page 12/14: drag-and-drop mini-check — いくら.
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Ask "How much is this?":',
      before: 'これは', after: 'ですか。',
      choices: ['いくつ', 'いくら', 'いつ'],
      answer: 'いくら',
    },
    {
      // Page 13/14: new-words recap — 11 words, none re-taught from
      // earlier shelves (どこ/どの/どちら/なん stay excluded per scope).
      type: 'summary',
      title: 'New Words: Questions (か)',
      headers: ['Word', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'か', romaji: 'ka', meaning: 'question marker' },
        { kana: 'だれ', romaji: 'dare', meaning: 'who' },
        { kana: 'いつ', romaji: 'itsu', meaning: 'when' },
        { kana: 'どうして', romaji: 'doushite', meaning: 'why (casual)' },
        { kana: 'なぜ', romaji: 'naze', meaning: 'why (formal)' },
        { kana: 'いくつ', romaji: 'ikutsu', meaning: 'how many' },
        { kana: 'いくら', romaji: 'ikura', meaning: 'how much (price)' },
        { kana: 'はい', romaji: 'hai', meaning: 'yes' },
        { kana: 'いいえ', romaji: 'iie', meaning: 'no' },
        { kana: 'そうです', romaji: 'sou desu', meaning: 'that\'s right' },
        { kana: 'ちがいます', romaji: 'chigaimasu', meaning: 'that\'s wrong' },
      ],
    },
    {
      // Page 14/14: fill-in-the-blank check — non-blocking, same pattern
      // as every other shelf's closing quiz. Samples (not exhaustively
      // covers) the new set, matching shelf-05's quiz size.
      type: 'quiz-fill',
      sectionLabel: 'Quick check: Questions (か)',
      intro: 'Fill in the blanks:',
      questions: [
        { before: 'これはほんです', after: '。 (turn it into a question)', answer: 'か', altAnswers: ['ka'], hint: '(goes at the very end)' },
        { before: 'せんせいは', after: 'ですか。 (asking "who?")', answer: 'だれ', altAnswers: ['dare'], hint: '(asking about a person)' },
        { before: 'たんじょうびは', after: 'ですか。 (asking "when?")', answer: 'いつ', altAnswers: ['itsu'], hint: '(asking about time)' },
        { before: 'りんごは', after: 'ですか。 (asking "how many?")', answer: 'いくつ', altAnswers: ['ikutsu'], hint: '(small countable things)' },
        { before: 'これは', after: 'ですか。 (asking "how much?")', answer: 'いくら', altAnswers: ['ikura'], hint: '(asking about price)' },
      ],
    },
  ],
  'shelf-07': [
    {
      // Page 1/22: hook — numbers build compositionally, plus a heads-up
      // that counters/time each get their own quick walkthrough below
      // (matches shelf-06's "light first page, not a wall of fields").
      type: 'grammar-intro',
      sectionLabel: 'Numbers & Counters',
      dividedIntro: true,
      bigIdea: 'Japanese numbers are built like Lego blocks — learn 1 through 10, and you can build every number up to 100 just by combining them.',
      analogy: 'にじゅう (20) is just に (2) + じゅう (10) stuck together — "two tens." さんじゅう (30) is さん (3) + じゅう (10) — "three tens." Once you know the blocks, the rest is just snapping them together.',
      explain: [
        'One more thing: a few numbers have two different readings depending on context (4, 7, 9), and when you attach a "counter" word to count specific things — animals, objects, time — the sounds sometimes shift a little. Don\'t worry, each new pattern gets its own quick walkthrough below.',
      ],
    },
    {
      // Page 2/22: base numbers 1-10, both readings shown where they exist.
      type: 'grammar-intro',
      sectionLabel: 'Numbers 1–10',
      terms: [
        { role: 'predicate', name: 'いち (ichi)', desc: '1' },
        { role: 'predicate', name: 'に (ni)', desc: '2' },
        { role: 'predicate', name: 'さん (san)', desc: '3' },
        { role: 'predicate', name: 'よん・し (yon / shi)', desc: '4 — よん is the everyday reading; し is avoided since it sounds like the word for "death"' },
        { role: 'predicate', name: 'ご (go)', desc: '5' },
        { role: 'predicate', name: 'ろく (roku)', desc: '6' },
        { role: 'predicate', name: 'なな・しち (nana / shichi)', desc: '7 — なな is the everyday reading; しち shows up in a few fixed words (like time, later on this shelf)' },
        { role: 'predicate', name: 'はち (hachi)', desc: '8' },
        { role: 'predicate', name: 'きゅう・く (kyuu / ku)', desc: '9 — きゅう is the everyday reading; く shows up in a few fixed words' },
        { role: 'predicate', name: 'じゅう (juu)', desc: '10' },
      ],
    },
    {
      // Page 3/22: tens 20-100 — fully regular (digit + じゅう), so just a
      // one-line explain instead of a dividedIntro breakdown.
      type: 'grammar-intro',
      sectionLabel: 'Tens: 20 to 100',
      explain: ['Every tens number is just [digit] + じゅう ("ten") stuck together — no surprises here.'],
      terms: [
        { role: 'predicate', name: 'にじゅう (nijuu)', desc: '20' },
        { role: 'predicate', name: 'さんじゅう (sanjuu)', desc: '30' },
        { role: 'predicate', name: 'よんじゅう (yonjuu)', desc: '40' },
        { role: 'predicate', name: 'ごじゅう (gojuu)', desc: '50' },
        { role: 'predicate', name: 'ろくじゅう (rokujuu)', desc: '60' },
        { role: 'predicate', name: 'ななじゅう (nanajuu)', desc: '70' },
        { role: 'predicate', name: 'はちじゅう (hachijuu)', desc: '80' },
        { role: 'predicate', name: 'きゅうじゅう (kyuujuu)', desc: '90' },
        { role: 'predicate', name: 'ひゃく (hyaku)', desc: '100' },
      ],
    },
    {
      // Page 4/22: general counter つ — intro.
      type: 'grammar-intro',
      sectionLabel: 'Counting general things: つ',
      dividedIntro: true,
      bigIdea: 'When you count everyday objects — apples, boxes, cups, anything without its own special counter — Japanese uses an entirely different, older set of number words ending in つ.',
      explain: ['This "つ series" only goes up to 10 — for 11 and higher, people just switch back to the plain numbers you already learned.'],
      takeaway: 'ひとつ, ふたつ, みっつ... these don\'t look like いち, に, さん at all — they\'re their own set to memorize.',
    },
    {
      // Page 5/22: つ counter full 1-10 table.
      type: 'grammar-intro',
      sectionLabel: 'The つ counter, 1–10',
      terms: [
        { role: 'predicate', name: 'ひとつ (hitotsu)', desc: '1 (general things)' },
        { role: 'predicate', name: 'ふたつ (futatsu)', desc: '2' },
        { role: 'predicate', name: 'みっつ (mittsu)', desc: '3' },
        { role: 'predicate', name: 'よっつ (yottsu)', desc: '4' },
        { role: 'predicate', name: 'いつつ (itsutsu)', desc: '5' },
        { role: 'predicate', name: 'むっつ (muttsu)', desc: '6' },
        { role: 'predicate', name: 'ななつ (nanatsu)', desc: '7' },
        { role: 'predicate', name: 'やっつ (yattsu)', desc: '8' },
        { role: 'predicate', name: 'ここのつ (kokonotsu)', desc: '9' },
        { role: 'predicate', name: 'とお (too)', desc: '10 — irregular, not じゅっつ' },
      ],
    },
    {
      // Page 6/22: つ samples — reuses りんご (established context noun,
      // already used on shelf-06's いくつ samples).
      type: 'grammar-intro',
      samples: [
        {
          tag: '"There is one apple." (lit. "As for the apple, [it\'s] one.")',
          tiles: [
            { text: 'りんご', role: 'subject', gloss: 'apple' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'ひとつ', role: 'predicate', gloss: 'one (things)', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Ringo wa hitotsu desu.',
        },
        {
          tag: '"There are three apples."',
          tiles: [
            { text: 'りんご', role: 'subject', gloss: 'apple' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'みっつ', role: 'predicate', gloss: 'three (things)', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Ringo wa mittsu desu.',
        },
        {
          tag: '"There are ten apples."',
          tiles: [
            { text: 'りんご', role: 'subject', gloss: 'apple' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'とお', role: 'predicate', gloss: 'ten (things)', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Ringo wa too desu.',
        },
      ],
    },
    {
      // Page 7/22: animal counter 匹 — intro.
      type: 'grammar-intro',
      sectionLabel: 'Counting animals: 匹',
      dividedIntro: true,
      bigIdea: 'Small animals — cats, dogs, fish, bugs — get their own counter, 匹 (hiki), attached directly after the number.',
      explain: ['匹\'s sound shifts depending on the number before it — it reads ひき, びき, or ぴき depending on what comes right before, the same way English "a" becomes "an" before a vowel. You don\'t have to reason it out — just memorize the full list below.'],
      takeaway: 'One cat is いっぴき, not いちひき — the sound genuinely changes, so learn each one by ear.',
    },
    {
      // Page 8/22: 匹 counter full 1-10 table.
      type: 'grammar-intro',
      sectionLabel: 'The 匹 counter, 1–10',
      terms: [
        { role: 'predicate', name: 'いっぴき (ippiki)', desc: '1 animal' },
        { role: 'predicate', name: 'にひき (nihiki)', desc: '2 animals' },
        { role: 'predicate', name: 'さんびき (sanbiki)', desc: '3 animals' },
        { role: 'predicate', name: 'よんひき (yonhiki)', desc: '4 animals' },
        { role: 'predicate', name: 'ごひき (gohiki)', desc: '5 animals' },
        { role: 'predicate', name: 'ろっぴき (roppiki)', desc: '6 animals' },
        { role: 'predicate', name: 'ななひき (nanahiki)', desc: '7 animals' },
        { role: 'predicate', name: 'はっぴき (happiki)', desc: '8 animals' },
        { role: 'predicate', name: 'きゅうひき (kyuuhiki)', desc: '9 animals' },
        { role: 'predicate', name: 'じゅっぴき (juppiki)', desc: '10 animals' },
      ],
    },
    {
      // Page 9/22: 匹 samples — reuses ねこ (the player's own species in
      // this game).
      type: 'grammar-intro',
      samples: [
        {
          tag: '"There is one cat."',
          tiles: [
            { text: 'ねこ', role: 'subject', gloss: 'cat' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'いっぴき', role: 'predicate', gloss: 'one (animal)', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Neko wa ippiki desu.',
        },
        {
          tag: '"There are three cats."',
          tiles: [
            { text: 'ねこ', role: 'subject', gloss: 'cat' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'さんびき', role: 'predicate', gloss: 'three (animals)', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Neko wa sanbiki desu.',
        },
        {
          tag: '"There are ten cats."',
          tiles: [
            { text: 'ねこ', role: 'subject', gloss: 'cat' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'じゅっぴき', role: 'predicate', gloss: 'ten (animals)', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Neko wa juppiki desu.',
        },
      ],
    },
    {
      // Page 10/22: telling time (hour) — intro.
      type: 'grammar-intro',
      sectionLabel: 'Telling time: 時 (hour)',
      dividedIntro: true,
      bigIdea: 'To say "o\'clock," attach 時 (じ) directly after the number.',
      explain: ['Most hours use the plain number readings you already know — but 4, 7, and 9 o\'clock swap to special readings instead: よじ (not よんじ), しちじ (not ななじ), and くじ (not きゅうじ).'],
      takeaway: 'Almost everything follows the pattern — just memorize the 3 exceptions: よじ, しちじ, くじ.',
    },
    {
      // Page 11/22: 時 1-12 full table.
      type: 'grammar-intro',
      sectionLabel: 'Hours, 1–12',
      terms: [
        { role: 'predicate', name: 'いちじ (ichiji)', desc: '1:00' },
        { role: 'predicate', name: 'にじ (niji)', desc: '2:00' },
        { role: 'predicate', name: 'さんじ (sanji)', desc: '3:00' },
        { role: 'predicate', name: 'よじ (yoji)', desc: '4:00 — irregular, not よんじ' },
        { role: 'predicate', name: 'ごじ (goji)', desc: '5:00' },
        { role: 'predicate', name: 'ろくじ (rokuji)', desc: '6:00' },
        { role: 'predicate', name: 'しちじ (shichiji)', desc: '7:00 — irregular, not ななじ' },
        { role: 'predicate', name: 'はちじ (hachiji)', desc: '8:00' },
        { role: 'predicate', name: 'くじ (kuji)', desc: '9:00 — irregular, not きゅうじ' },
        { role: 'predicate', name: 'じゅうじ (juuji)', desc: '10:00' },
        { role: 'predicate', name: 'じゅういちじ (juuichiji)', desc: '11:00' },
        { role: 'predicate', name: 'じゅうにじ (juuniji)', desc: '12:00' },
      ],
    },
    {
      // Page 12/22: 時 samples — いま (now) introduced as a one-off context
      // noun (same precedent as shelf-06's たんじょうび/りんご).
      type: 'grammar-intro',
      samples: [
        {
          tag: '"It\'s 4 o\'clock now."',
          tiles: [
            { text: 'いま', role: 'subject', gloss: 'now', isNew: true },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'よじ', role: 'predicate', gloss: '4:00', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Ima wa yoji desu.',
        },
        {
          tag: '"It\'s 9 o\'clock now."',
          tiles: [
            { text: 'いま', role: 'subject', gloss: 'now' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'くじ', role: 'predicate', gloss: '9:00', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Ima wa kuji desu.',
        },
        {
          tag: '"It\'s 12 o\'clock now."',
          tiles: [
            { text: 'いま', role: 'subject', gloss: 'now' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'じゅうにじ', role: 'predicate', gloss: '12:00', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Ima wa juuniji desu.',
        },
      ],
    },
    {
      // Page 13/22: telling time (minute) — intro.
      type: 'grammar-intro',
      sectionLabel: 'Telling time: 分 (minute)',
      dividedIntro: true,
      bigIdea: 'Minutes attach the same way hours do — but 分\'s sound shifts around even more than 匹\'s did.',
      explain: ['Depending on the number before it, 分 reads ふん or ぷん (and a couple of numbers change shape too, just like 匹). "What minute? / how many minutes?" is 何分 (なんぷん).'],
      takeaway: 'There\'s no shortcut here either — learn the common ones below by ear, the same way you did for 匹.',
    },
    {
      // Page 14/22: 分 — representative set covering every sound-change
      // pattern (っぷん / ふん), not an exhaustive 1-10 drill, to keep this
      // already-long lesson from ballooning further.
      type: 'grammar-intro',
      sectionLabel: 'Minutes — the ones that shift',
      terms: [
        { role: 'predicate', name: 'いっぷん (ippun)', desc: '1 minute' },
        { role: 'predicate', name: 'にふん (nifun)', desc: '2 minutes' },
        { role: 'predicate', name: 'さんぷん (sanpun)', desc: '3 minutes' },
        { role: 'predicate', name: 'よんぷん (yonpun)', desc: '4 minutes' },
        { role: 'predicate', name: 'ごふん (gofun)', desc: '5 minutes' },
        { role: 'predicate', name: 'ろっぷん (roppun)', desc: '6 minutes' },
        { role: 'predicate', name: 'はっぷん (happun)', desc: '8 minutes' },
        { role: 'predicate', name: 'じゅっぷん (juppun)', desc: '10 minutes' },
        { role: 'predicate', name: 'なんぷん (nanpun)', desc: 'how many minutes? / what minute?' },
      ],
    },
    {
      // Page 15/22: combined 時+分 samples.
      type: 'grammar-intro',
      samples: [
        {
          tag: '"It\'s 3:10 now."',
          tiles: [
            { text: 'いま', role: 'subject', gloss: 'now' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'さんじ', role: 'predicate', gloss: '3:00' },
            { text: 'じゅっぷん', role: 'predicate', gloss: '10 minutes', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Ima wa sanji juppun desu.',
        },
        {
          tag: '"It\'s 9:02 now."',
          tiles: [
            { text: 'いま', role: 'subject', gloss: 'now' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'くじ', role: 'predicate', gloss: '9:00' },
            { text: 'にふん', role: 'predicate', gloss: '2 minutes', isNew: true },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
          ],
          translation: 'Ima wa kuji nifun desu.',
        },
      ],
    },
    {
      // Page 16/22: conversation — combines the time question with なんびき
      // (何 + 匹, a logically-composed new word glossed inline via romaji,
      // same treatment as shelf-06's そうですか).
      type: 'conversation',
      turns: [
        {
          speaker: 'player', name: 'You', action: 'tailwagRight', actionLabel: '*tail wags*',
          text: 'すみません、いまなんじですか？',
          romaji: 'Sumimasen, ima nanji desu ka? — "Excuse me, what time is it now?"',
        },
        {
          speaker: 'sensei', name: 'Neko-sensei', action: 'meow', actionLabel: '*meows*',
          text: 'いまさんじじゅっぷんです。',
          romaji: 'Ima sanji juppun desu. — "It\'s 3:10 now."',
        },
        {
          speaker: 'player', name: 'You', action: 'tailwagLeft', actionLabel: '*tail wags*',
          text: 'ありがとうございます！ねこはなんびきですか？',
          romaji: 'Arigatou gozaimasu! Neko wa nanbiki desu ka? — "Thank you! How many cats are there?"',
        },
        {
          speaker: 'sensei', name: 'Neko-sensei', action: 'meow', actionLabel: '*meows*',
          text: 'ねこはさんびきです。',
          romaji: 'Neko wa sanbiki desu. — "There are three cats."',
        },
      ],
    },
    {
      // Page 17/22: drag-and-drop mini-check — tens.
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "90":',
      before: '', after: '',
      choices: ['はちじゅう', 'きゅうじゅう', 'ろくじゅう'],
      answer: 'きゅうじゅう',
    },
    {
      // Page 18/22: drag-and-drop mini-check — つ vs 匹 counter distinction,
      // distractor みっつ/さんつ specifically tests whether the player
      // confuses the general-things counter with the animal counter.
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "three cats" — pick the right counter:',
      before: 'ねこは', after: 'です。',
      choices: ['さんびき', 'みっつ', 'さんつ'],
      answer: 'さんびき',
    },
    {
      // Page 19/22: drag-and-drop mini-check — 時's irregular reading.
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "It\'s 9 o\'clock":',
      before: 'いまは', after: 'です。',
      choices: ['きゅうじ', 'くじ', 'ごじ'],
      answer: 'くじ',
    },
    {
      // Page 20/22: new-words recap, part 1 — base numbers + tens.
      type: 'summary',
      title: 'New Words: Numbers 1–100',
      headers: ['Word', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'いち', romaji: 'ichi', meaning: '1' },
        { kana: 'に', romaji: 'ni', meaning: '2' },
        { kana: 'さん', romaji: 'san', meaning: '3' },
        { kana: 'よん・し', romaji: 'yon / shi', meaning: '4' },
        { kana: 'ご', romaji: 'go', meaning: '5' },
        { kana: 'ろく', romaji: 'roku', meaning: '6' },
        { kana: 'なな・しち', romaji: 'nana / shichi', meaning: '7' },
        { kana: 'はち', romaji: 'hachi', meaning: '8' },
        { kana: 'きゅう・く', romaji: 'kyuu / ku', meaning: '9' },
        { kana: 'じゅう', romaji: 'juu', meaning: '10' },
        { kana: 'にじゅう', romaji: 'nijuu', meaning: '20' },
        { kana: 'さんじゅう', romaji: 'sanjuu', meaning: '30' },
        { kana: 'よんじゅう', romaji: 'yonjuu', meaning: '40' },
        { kana: 'ごじゅう', romaji: 'gojuu', meaning: '50' },
        { kana: 'ろくじゅう', romaji: 'rokujuu', meaning: '60' },
        { kana: 'ななじゅう', romaji: 'nanajuu', meaning: '70' },
        { kana: 'はちじゅう', romaji: 'hachijuu', meaning: '80' },
        { kana: 'きゅうじゅう', romaji: 'kyuujuu', meaning: '90' },
        { kana: 'ひゃく', romaji: 'hyaku', meaning: '100' },
      ],
    },
    {
      // Page 21/22: new-words recap, part 2 — counters (つ/匹) + time
      // (時/分). Split into 2 summary pages (rather than 1 giant table)
      // so neither page is overwhelming, matching the "keep it digestible"
      // lesson from shelf-06's decluttering pass.
      type: 'summary',
      title: 'New Words: Counters & Time',
      headers: ['Word', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'ひとつ', romaji: 'hitotsu', meaning: '1 (general things)' },
        { kana: 'ふたつ', romaji: 'futatsu', meaning: '2' },
        { kana: 'みっつ', romaji: 'mittsu', meaning: '3' },
        { kana: 'よっつ', romaji: 'yottsu', meaning: '4' },
        { kana: 'いつつ', romaji: 'itsutsu', meaning: '5' },
        { kana: 'むっつ', romaji: 'muttsu', meaning: '6' },
        { kana: 'ななつ', romaji: 'nanatsu', meaning: '7' },
        { kana: 'やっつ', romaji: 'yattsu', meaning: '8' },
        { kana: 'ここのつ', romaji: 'kokonotsu', meaning: '9' },
        { kana: 'とお', romaji: 'too', meaning: '10 (general things)' },
        { kana: 'いっぴき', romaji: 'ippiki', meaning: '1 animal' },
        { kana: 'にひき', romaji: 'nihiki', meaning: '2 animals' },
        { kana: 'さんびき', romaji: 'sanbiki', meaning: '3 animals' },
        { kana: 'よんひき', romaji: 'yonhiki', meaning: '4 animals' },
        { kana: 'ごひき', romaji: 'gohiki', meaning: '5 animals' },
        { kana: 'ろっぴき', romaji: 'roppiki', meaning: '6 animals' },
        { kana: 'ななひき', romaji: 'nanahiki', meaning: '7 animals' },
        { kana: 'はっぴき', romaji: 'happiki', meaning: '8 animals' },
        { kana: 'きゅうひき', romaji: 'kyuuhiki', meaning: '9 animals' },
        { kana: 'じゅっぴき', romaji: 'juppiki', meaning: '10 animals' },
        { kana: 'いちじ', romaji: 'ichiji', meaning: '1:00' },
        { kana: 'にじ', romaji: 'niji', meaning: '2:00' },
        { kana: 'さんじ', romaji: 'sanji', meaning: '3:00' },
        { kana: 'よじ', romaji: 'yoji', meaning: '4:00' },
        { kana: 'ごじ', romaji: 'goji', meaning: '5:00' },
        { kana: 'ろくじ', romaji: 'rokuji', meaning: '6:00' },
        { kana: 'しちじ', romaji: 'shichiji', meaning: '7:00' },
        { kana: 'はちじ', romaji: 'hachiji', meaning: '8:00' },
        { kana: 'くじ', romaji: 'kuji', meaning: '9:00' },
        { kana: 'じゅうじ', romaji: 'juuji', meaning: '10:00' },
        { kana: 'じゅういちじ', romaji: 'juuichiji', meaning: '11:00' },
        { kana: 'じゅうにじ', romaji: 'juuniji', meaning: '12:00' },
        { kana: 'いっぷん', romaji: 'ippun', meaning: '1 minute' },
        { kana: 'にふん', romaji: 'nifun', meaning: '2 minutes' },
        { kana: 'さんぷん', romaji: 'sanpun', meaning: '3 minutes' },
        { kana: 'よんぷん', romaji: 'yonpun', meaning: '4 minutes' },
        { kana: 'ごふん', romaji: 'gofun', meaning: '5 minutes' },
        { kana: 'ろっぷん', romaji: 'roppun', meaning: '6 minutes' },
        { kana: 'はっぷん', romaji: 'happun', meaning: '8 minutes' },
        { kana: 'じゅっぷん', romaji: 'juppun', meaning: '10 minutes' },
        { kana: 'なんぷん', romaji: 'nanpun', meaning: 'how many minutes?' },
      ],
    },
    {
      // Page 22/22: fill-in-the-blank check — non-blocking, same pattern
      // as every other shelf's closing quiz.
      type: 'quiz-fill',
      sectionLabel: 'Quick check: Numbers & Counters',
      intro: 'Fill in the blanks:',
      questions: [
        { before: '', after: ' (say "90")', answer: 'きゅうじゅう', altAnswers: ['kyuujuu'], hint: '(9 + 10)' },
        { before: 'りんごは', after: 'です。 (say "three apples")', answer: 'みっつ', altAnswers: ['mittsu'], hint: '(general-things counter)' },
        { before: 'ねこは', after: 'です。 (say "one cat")', answer: 'いっぴき', altAnswers: ['ippiki'], hint: '(animal counter — sound shifts!)' },
        { before: 'いまは', after: 'です。 (say "4 o\'clock")', answer: 'よじ', altAnswers: ['yoji'], hint: '(irregular — not よんじ)' },
        { before: 'いまは', after: 'です。 (say "9 o\'clock")', answer: 'くじ', altAnswers: ['kuji'], hint: '(irregular — not きゅうじ)' },
      ],
    },
  ],
  'shelf-08': [
    {
      // Page 1/24: hook — あります/います is the first grammar this shelf
      // adds beyond です, so the intro frames it as a genuinely new tool,
      // not just more vocab.
      type: 'grammar-intro',
      sectionLabel: 'Places & Directions',
      dividedIntro: true,
      bigIdea: 'To say where something is, Japanese reaches for a whole new pair of words — あります and います — instead of です.',
      analogy: 'Think of です as "naming" something ("this is a book") and あります/います as "placing" something ("the book is over there"). Different job, different word.',
    },
    {
      // Page 2/24: places vocab — 9 places, confirmed scope.
      type: 'grammar-intro',
      sectionLabel: 'Places',
      terms: [
        { role: 'subject', name: 'がっこう (gakkou)', desc: 'school' },
        { role: 'subject', name: 'えき (eki)', desc: 'station' },
        { role: 'subject', name: 'としょかん (toshokan)', desc: 'library' },
        { role: 'subject', name: 'びょういん (byouin)', desc: 'hospital' },
        { role: 'subject', name: 'レストラン (resutoran)', desc: 'restaurant' },
        { role: 'subject', name: 'こうえん (kouen)', desc: 'park' },
        { role: 'subject', name: 'ほんや (honya)', desc: 'bookstore' },
        { role: 'subject', name: 'ぎんこう (ginkou)', desc: 'bank' },
        { role: 'subject', name: 'うち (uchi)', desc: 'home' },
      ],
    },
    {
      // Page 3/24: あります/います mechanics — the animate/inanimate split
      // is the one thing that actually needs explaining; everything else
      // about the sentence shape stays put. Each verb gets its own
      // labeled paragraph (rather than one combined sentence) so the
      // categories read as clearly separate, and the plant exception is
      // called out explicitly since "is it alive?" is the wrong test —
      // players who reason from "alive" alone will get plants wrong.
      type: 'grammar-intro',
      sectionLabel: 'あります / います — "there is / there are"',
      dividedIntro: true,
      pattern: [
        { text: '[Thing]', role: 'subject' }, { text: 'は', role: 'particle' }, { text: '[Place]', role: 'predicate' }, { text: 'に', role: 'particle' }, { text: 'あります・います', role: 'copula' },
      ],
      explain: [
        '<b class="role-copula">います</b> is for things that are truly alive <i>and</i> can move around on their own: people (せんせい、がくせい) and animals (ねこ、いぬ). If it could get up and walk away, use います.',
        '<b class="role-copula">あります</b> is for everything else: objects (ほん、つくえ) and places (がっこう、えき) — but also plants (木、はな)! A tree is alive, but it can\'t move itself, so even a living plant still takes あります, not います.',
        'Everything else about the sentence stays the same either way: [Thing] は [Place] に あります・います — "As for [thing], it is at [place]."',
      ],
      takeaway: 'The real test isn\'t "is it alive?" — it\'s "can it walk away on its own?" That\'s the whole reason plants take あります even though they\'re alive.',
    },
    {
      // Page 4/24: drag-and-drop mini-check — あります vs います, placed
      // right after the explanation and before the samples page (page 5)
      // per explicit request, so the distinction (including the plant
      // exception) is tested immediately, not just shown passively in
      // samples first. 木 (tree) is used here specifically to drill the
      // "alive but can't walk away" exception just explained.
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "the tree is here" — pick the right verb (remember: can it walk away?):',
      before: '木はここに', after: '。',
      choices: ['あります', 'います', 'です'],
      answer: 'あります',
    },
    {
      // Page 5/24: あります vs います side-by-side, same "near" pattern so
      // the only thing that changes between the two examples is the verb.
      type: 'grammar-intro',
      samples: [
        {
          tag: '"The library is near the school."',
          tiles: [
            { text: 'としょかん', role: 'subject', gloss: 'library', isNew: true },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'がっこう', role: 'predicate', gloss: 'school', isNew: true },
            { text: 'の', role: 'particle', gloss: "'s / of" },
            { text: 'ちかく', role: 'predicate', gloss: 'near', isNew: true },
            { text: 'に', role: 'particle', gloss: 'location marker', isNew: true },
            { text: 'あります', role: 'copula', gloss: 'there is (things)', isNew: true },
          ],
          translation: 'Toshokan wa gakkou no chikaku ni arimasu.',
        },
        {
          tag: '"The cat is near the station."',
          tiles: [
            { text: 'ねこ', role: 'subject', gloss: 'cat' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'えき', role: 'predicate', gloss: 'station', isNew: true },
            { text: 'の', role: 'particle', gloss: "'s / of" },
            { text: 'ちかく', role: 'predicate', gloss: 'near' },
            { text: 'に', role: 'particle', gloss: 'location marker' },
            { text: 'います', role: 'copula', gloss: 'there is (living things)', isNew: true },
          ],
          translation: 'Neko wa eki no chikaku ni imasu.',
        },
      ],
    },
    {
      // Page 6/24: direction words — intro, flags the naka/soto exception
      // up front so the diagram (2 pages later) doesn't need to re-explain
      // why it has 2 stages.
      type: 'grammar-intro',
      sectionLabel: 'Direction words',
      dividedIntro: true,
      bigIdea: 'These 10 words describe where something is relative to something else — most compare to the cat itself, but two need an actual container to make sense.',
      explain: [
        '前・後ろ・右・左・隣・近く・上・下 all work the same way against any reference: "[Thing] は [something]の [direction]に あります." 中 and 外 ("inside"/"outside") only make sense next to a container — a cat isn\'t a box, so those two get their own box example instead.',
      ],
    },
    {
      // Page 7/24: all 10 direction words as a table, before the
      // interactive diagram puts them into motion.
      type: 'grammar-intro',
      sectionLabel: 'The 10 direction words',
      terms: [
        { role: 'predicate', name: '前 (mae)', desc: 'in front of' },
        { role: 'predicate', name: '後ろ (ushiro)', desc: 'behind' },
        { role: 'predicate', name: '右 (migi)', desc: 'right of' },
        { role: 'predicate', name: '左 (hidari)', desc: 'left of' },
        { role: 'predicate', name: '隣 (tonari)', desc: 'next to' },
        { role: 'predicate', name: '近く (chikaku)', desc: 'near' },
        { role: 'predicate', name: '上 (ue)', desc: 'above' },
        { role: 'predicate', name: '下 (shita)', desc: 'below' },
        { role: 'predicate', name: '中 (naka)', desc: 'inside' },
        { role: 'predicate', name: '外 (soto)', desc: 'outside' },
      ],
    },
    {
      // Page 8/24: interactive diagram — click any of the 10 direction
      // words, a book repositions around the cat (or the box, for
      // naka/soto) and the live sentence below rebuilds with it. See
      // buildDirectionsDiagram/wireDirectionsDiagram in this file.
      type: 'grammar-intro',
      diagramSvg: buildDirectionsDiagram,
      wireDiagram: wireDirectionsDiagram,
      diagramCaption: 'Click a direction word — the book moves, and the sentence below updates to match.',
    },
    {
      // Page 9/24: written practice on 3 of the direction words (one per
      // reference type: cat, cat, box) reinforcing what the diagram just
      // showed in motion. はこ (box) introduced here as the one new word
      // the diagram needed but the vocab table didn't cover yet.
      type: 'grammar-intro',
      samples: [
        {
          tag: '"The book is in front of the cat."',
          tiles: [
            { text: 'ほん', role: 'subject', gloss: 'book' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'ねこ', role: 'predicate', gloss: 'cat' },
            { text: 'の', role: 'particle', gloss: "'s / of" },
            { text: '前', role: 'predicate', gloss: 'in front of', isNew: true },
            { text: 'に', role: 'particle', gloss: 'location marker' },
            { text: 'あります', role: 'copula', gloss: 'there is' },
          ],
          translation: 'Hon wa neko no mae ni arimasu.',
        },
        {
          tag: '"The book is next to the cat."',
          tiles: [
            { text: 'ほん', role: 'subject', gloss: 'book' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'ねこ', role: 'predicate', gloss: 'cat' },
            { text: 'の', role: 'particle', gloss: "'s / of" },
            { text: '隣', role: 'predicate', gloss: 'next to', isNew: true },
            { text: 'に', role: 'particle', gloss: 'location marker' },
            { text: 'あります', role: 'copula', gloss: 'there is' },
          ],
          translation: 'Hon wa neko no tonari ni arimasu.',
        },
        {
          tag: '"The book is inside the box."',
          tiles: [
            { text: 'ほん', role: 'subject', gloss: 'book' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'はこ', role: 'predicate', gloss: 'box', isNew: true },
            { text: 'の', role: 'particle', gloss: "'s / of" },
            { text: '中', role: 'predicate', gloss: 'inside', isNew: true },
            { text: 'に', role: 'particle', gloss: 'location marker' },
            { text: 'あります', role: 'copula', gloss: 'there is' },
          ],
          translation: 'Hon wa hako no naka ni arimasu.',
        },
      ],
    },
    {
      // Page 10/24: interactive town-map diagram — pays off the direction
      // words with real place vocab instead of the abstract book/cat. See
      // buildPlacesMapDiagram/wirePlacesMapDiagram in this file.
      type: 'grammar-intro',
      diagramSvg: buildPlacesMapDiagram,
      wireDiagram: wirePlacesMapDiagram,
      diagramCaption: 'Click a building — its relationship to the station lights up, and the sentence updates to match.',
    },
    {
      // Page 11/24: 2 more places+direction samples using vocab the map
      // diagram didn't cover (restaurant/park, bank/bookstore), so the
      // player practices beyond just the 4 buildings shown on the map.
      type: 'grammar-intro',
      samples: [
        {
          tag: '"The restaurant is next to the park."',
          tiles: [
            { text: 'レストラン', role: 'subject', gloss: 'restaurant' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'こうえん', role: 'predicate', gloss: 'park' },
            { text: 'の', role: 'particle', gloss: "'s / of" },
            { text: '隣', role: 'predicate', gloss: 'next to' },
            { text: 'に', role: 'particle', gloss: 'location marker' },
            { text: 'あります', role: 'copula', gloss: 'there is' },
          ],
          translation: 'Resutoran wa kouen no tonari ni arimasu.',
        },
        {
          tag: '"The bank is near the bookstore."',
          tiles: [
            { text: 'ぎんこう', role: 'subject', gloss: 'bank' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'ほんや', role: 'predicate', gloss: 'bookstore' },
            { text: 'の', role: 'particle', gloss: "'s / of" },
            { text: '近く', role: 'predicate', gloss: 'near' },
            { text: 'に', role: 'particle', gloss: 'location marker' },
            { text: 'あります', role: 'copula', gloss: 'there is' },
          ],
          translation: 'Ginkou wa honya no chikaku ni arimasu.',
        },
      ],
    },
    {
      // Page 12/24: conversation — reuses どこ (shelf-05) to ask where
      // something is, answered with this shelf's own ちかく pattern.
      type: 'conversation',
      turns: [
        {
          speaker: 'player', name: 'You', action: 'tailwagRight', actionLabel: '*tail wags*',
          text: 'すみません、としょかんはどこですか？',
          romaji: 'Sumimasen, toshokan wa doko desu ka? — "Excuse me, where is the library?"',
        },
        {
          speaker: 'sensei', name: 'Neko-sensei', action: 'meow', actionLabel: '*meows*',
          text: 'としょかんはえきのちかくにあります。',
          romaji: 'Toshokan wa eki no chikaku ni arimasu. — "The library is near the station."',
        },
        {
          speaker: 'player', name: 'You', action: 'tailwagLeft', actionLabel: '*tail wags*',
          text: 'ありがとうございます！',
          romaji: 'Arigatou gozaimasu! — "Thank you!"',
        },
      ],
    },
    {
      // Page 13/24: giving-directions movement vocab — a different kind
      // of direction word than pages 6-10's positional ones ("where
      // something is" vs "which way to walk"). あっち/こっち/どっち
      // explicitly called back as the casual counterparts of shelf-05's
      // こちら/そちら/あちら/どちら (どちら has no everyday そっち-slot
      // equivalent in casual speech, hence only 3 words here vs 4 there).
      type: 'grammar-intro',
      sectionLabel: 'Giving directions: movement words',
      dividedIntro: true,
      bigIdea: 'Actually walking somewhere needs a different kind of word — not "where something is," but "which way to go."',
      recapChips: ['こちら・そちら・あちら・どちら (shelf 5)'],
      explain: [
        'あっち・こっち・どっち are the everyday, casual versions of こちら・そちら・あちら・どちら from shelf 5 — same "which way" meaning, softer tone.',
      ],
      terms: [
        { role: 'predicate', name: 'まっすぐ (massugu)', desc: 'straight ahead' },
        { role: 'predicate', name: '曲がります (magarimasu)', desc: 'to turn' },
        { role: 'predicate', name: '行きます (ikimasu)', desc: 'to go' },
        { role: 'predicate', name: 'あっち (acchi)', desc: 'that way (casual)' },
        { role: 'predicate', name: 'こっち (kocchi)', desc: 'this way (casual)' },
        { role: 'predicate', name: 'どっち (docchi)', desc: 'which way (casual)' },
      ],
    },
    {
      // Page 14/24: interactive movement diagram — click まっすぐ/turn-
      // right/turn-left, a single arrow rotates to match and the sentence
      // below updates. See buildMovementDiagram/wireMovementDiagram.
      type: 'grammar-intro',
      diagramSvg: buildMovementDiagram,
      wireDiagram: wireMovementDiagram,
      diagramCaption: 'Click a movement word — the arrow turns to match, and the sentence below updates.',
    },
    {
      // Page 15/24: interactive route diagram — a real cat sprite (not an
      // emoji marker) walks 4 legs to 駅, one per screen direction
      // (前・右・後ろ・左), per explicit "use the existing cat sprite" /
      // "walking right left below above" request. See
      // buildRouteDiagram/wireRouteDiagram.
      type: 'grammar-intro',
      diagramSvg: buildRouteDiagram,
      wireDiagram: wireRouteDiagram,
      diagramCaption: 'Click each step in order to watch the cat walk the route to 駅.',
    },
    {
      // Page 16/24: compass diagram — 北・南・東・西, a fixed reference
      // grid rather than anything relative to the cat, so this one stays
      // static (no interactivity needed the way relative directions had).
      type: 'grammar-intro',
      sectionLabel: 'The compass',
      diagramSvg: buildCompassDiagram(),
      terms: [
        { role: 'predicate', name: '北 (kita)', desc: 'north' },
        { role: 'predicate', name: '南 (minami)', desc: 'south' },
        { role: 'predicate', name: '東 (higashi)', desc: 'east' },
        { role: 'predicate', name: '西 (nishi)', desc: 'west' },
      ],
    },
    {
      // Page 17/24: に/の spelled out explicitly — both particles have
      // been used all lesson without being named as a pattern; this page
      // names it and gives one more worked example with new vocab 木.
      type: 'grammar-intro',
      sectionLabel: 'に and の, one more time',
      explain: [
        'You\'ve been using に (location marker) and の ("\'s / of") this whole lesson without a name for the pattern — here it is spelled out: [Reference]の [Direction]に あります・います literally reads "at [reference]\'s [direction]."',
      ],
      samples: [
        {
          tag: '"The cat is under the tree."',
          tiles: [
            { text: 'ねこ', role: 'subject', gloss: 'cat' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: '木', role: 'predicate', gloss: 'tree', isNew: true },
            { text: 'の', role: 'particle', gloss: "'s / of" },
            { text: '下', role: 'predicate', gloss: 'below' },
            { text: 'に', role: 'particle', gloss: 'location marker' },
            { text: 'います', role: 'copula', gloss: 'there is (living things)' },
          ],
          translation: 'Neko wa ki no shita ni imasu.',
        },
      ],
    },
    {
      // Page 18/24: drag-and-drop mini-check — a direction word, with
      // 中 as a distractor to make sure the player isn't just guessing.
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "the book is in front of the cat":',
      before: 'ほんはねこの', after: 'にあります。',
      choices: ['前', '後ろ', '中'],
      answer: '前',
    },
    {
      // Page 19/24: drag-and-drop mini-check — あります vs います, the
      // core new grammar point itself, not just vocab recall.
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "the cat is near the station" — pick the right verb:',
      before: 'ねこはえきのちかくに', after: '。',
      choices: ['あります', 'います', 'です'],
      answer: 'います',
    },
    {
      // Page 20/24: drag-and-drop mini-check — places + a direction word.
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "the bank is left of the school":',
      before: 'ぎんこうはがっこうの', after: 'にあります。',
      choices: ['左', '右', '中'],
      answer: '左',
    },
    {
      // Page 21/24: drag-and-drop mini-check — movement vocab, the newest
      // grammar this shelf added (pages 12-16).
      type: 'try-it',
      sectionLabel: 'Quick check',
      prompt: 'Say "turn right":',
      before: '', after: 'に曲がります。',
      choices: ['右', '左', 'まっすぐ'],
      answer: '右',
    },
    {
      // Page 22/24: new-words recap, part 1 — the 9 places + はこ.
      type: 'summary',
      title: 'New Words: Places',
      headers: ['Word', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'がっこう', romaji: 'gakkou', meaning: 'school' },
        { kana: 'えき', romaji: 'eki', meaning: 'station' },
        { kana: 'としょかん', romaji: 'toshokan', meaning: 'library' },
        { kana: 'びょういん', romaji: 'byouin', meaning: 'hospital' },
        { kana: 'レストラン', romaji: 'resutoran', meaning: 'restaurant' },
        { kana: 'こうえん', romaji: 'kouen', meaning: 'park' },
        { kana: 'ほんや', romaji: 'honya', meaning: 'bookstore' },
        { kana: 'ぎんこう', romaji: 'ginkou', meaning: 'bank' },
        { kana: 'うち', romaji: 'uchi', meaning: 'home' },
        { kana: 'はこ', romaji: 'hako', meaning: 'box' },
      ],
    },
    {
      // Page 23/24: new-words recap, part 2 — the grammar + all 10
      // direction words + the movement/compass vocab added later, split
      // from the places table per the established "2 summary tables beat
      // 1 giant one" lesson from shelf-07.
      type: 'summary',
      title: 'New Words: Directions & Grammar',
      headers: ['Word', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'あります', romaji: 'arimasu', meaning: 'there is (things, places)' },
        { kana: 'います', romaji: 'imasu', meaning: 'there is (people, animals)' },
        { kana: '前', romaji: 'mae', meaning: 'in front of' },
        { kana: '後ろ', romaji: 'ushiro', meaning: 'behind' },
        { kana: '右', romaji: 'migi', meaning: 'right of' },
        { kana: '左', romaji: 'hidari', meaning: 'left of' },
        { kana: '隣', romaji: 'tonari', meaning: 'next to' },
        { kana: '近く', romaji: 'chikaku', meaning: 'near' },
        { kana: '上', romaji: 'ue', meaning: 'above' },
        { kana: '下', romaji: 'shita', meaning: 'below' },
        { kana: '中', romaji: 'naka', meaning: 'inside' },
        { kana: '外', romaji: 'soto', meaning: 'outside' },
        { kana: 'まっすぐ', romaji: 'massugu', meaning: 'straight ahead' },
        { kana: '曲がります', romaji: 'magarimasu', meaning: 'to turn' },
        { kana: '行きます', romaji: 'ikimasu', meaning: 'to go' },
        { kana: 'あっち', romaji: 'acchi', meaning: 'that way (casual)' },
        { kana: 'こっち', romaji: 'kocchi', meaning: 'this way (casual)' },
        { kana: 'どっち', romaji: 'docchi', meaning: 'which way (casual)' },
        { kana: '北', romaji: 'kita', meaning: 'north' },
        { kana: '南', romaji: 'minami', meaning: 'south' },
        { kana: '東', romaji: 'higashi', meaning: 'east' },
        { kana: '西', romaji: 'nishi', meaning: 'west' },
        { kana: '木', romaji: 'ki', meaning: 'tree' },
      ],
    },
    {
      // Page 24/24: fill-in-the-blank check — non-blocking, same pattern
      // as every other shelf's closing quiz.
      type: 'quiz-fill',
      sectionLabel: 'Quick check: Places & Directions',
      intro: 'Fill in the blanks:',
      questions: [
        { before: 'としょかんはえきのちかくに', after: '。 (things/places verb)', answer: 'あります', altAnswers: ['arimasu'], hint: '(the library can\'t walk away)' },
        { before: 'ねこはえきのちかくに', after: '。 (people/animals verb)', answer: 'います', altAnswers: ['imasu'], hint: '(the cat could walk away)' },
        { before: 'ほんはねこの', after: 'にあります。 (in front of)', answer: '前', altAnswers: ['mae'], hint: '(front)' },
        { before: 'ほんははこの', after: 'にあります。 (inside)', answer: '中', altAnswers: ['naka'], hint: '(needs a container, not the cat)' },
        { before: 'ぎんこうはがっこうの', after: 'にあります。 (left of)', answer: '左', altAnswers: ['hidari'], hint: '(left)' },
        { before: '', after: 'に曲がります。 (turn right)', answer: '右', altAnswers: ['migi'], hint: '(right)' },
        { before: 'ねこは木の', after: 'にいます。 (under the tree)', answer: '下', altAnswers: ['shita'], hint: '(below)' },
      ],
    },
  ],
  // "Foundations Review" — review-1, gates shelf-05. First review pile to
  // actually open LessonBox content (previously all review piles were
  // instant-complete with nothing to read — see openRetroMenu's
  // hasContent check). Recaps shelf-01..04 by reusing their real vocab
  // data directly (not re-authored prose), then a mixed MC/fill quiz with
  // deferred grading — see REVIEW_1_QUIZ_QUESTIONS above and the
  // 'quiz-review'/'quiz-answers'/'quiz-score' page types in lesson-box.js.
  'review-1': [
    {
      type: 'grammar-intro',
      sectionLabel: 'Foundations Review',
      bigIdea: 'Before Demonstratives, let\'s make sure the first 4 lessons actually stuck.',
      explain: [
        'This review recaps Basic Greetings, Everyday Expressions, A は B です, and Self Introduction — then closes with a 10-question quiz (multiple choice + fill-in-the-blank). The quiz doesn\'t grade as you go: answer everything first, then the next page shows the answer key so you can self-check, followed by your score.',
      ],
      takeaway: 'Skim each recap, then take the quiz at the end — no pressure, you can revisit this pile any time.',
    },
    {
      // Recap 1/4: Basic Greetings — same 6 rows shelf-01's own
      // auto-generated summary uses (appendGreetingSummary), just
      // hand-listed here since review-1 isn't itself built from
      // 'greeting'-type pages.
      type: 'summary',
      title: 'Recap: Basic Greetings',
      headers: ['Phrase', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'こんにちは', romaji: 'Konnichiwa', meaning: 'Hello / Good afternoon' },
        { kana: 'おはようございます', romaji: 'Ohayou gozaimasu', meaning: 'Good morning (polite)' },
        { kana: 'こんばんは', romaji: 'Konbanwa', meaning: 'Good evening' },
        { kana: 'さようなら', romaji: 'Sayounara', meaning: 'Goodbye' },
        { kana: 'ありがとうございます', romaji: 'Arigatou gozaimasu', meaning: 'Thank you (polite)' },
        { kana: 'すみません', romaji: 'Sumimasen', meaning: 'Excuse me / Sorry' },
      ],
    },
    {
      // Recap 2/4: Everyday Expressions — same 14 phrases shelf-02
      // teaches, in the same order they're introduced there.
      type: 'summary',
      title: 'Recap: Everyday Expressions',
      headers: ['Phrase', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'お元気ですか', romaji: 'Ogenki desu ka', meaning: 'How are you?' },
        { kana: '元気です', romaji: 'Genki desu', meaning: 'I’m doing well' },
        { kana: 'いただきます', romaji: 'Itadakimasu', meaning: 'Said before eating' },
        { kana: 'ごちそうさまでした', romaji: 'Gochisousama deshita', meaning: 'Said after eating' },
        { kana: 'いってきます', romaji: 'Ittekimasu', meaning: 'I’m heading out' },
        { kana: 'ただいま', romaji: 'Tadaima', meaning: 'I’m home' },
        { kana: 'お願いします', romaji: 'Onegaishimasu', meaning: 'Please (making a request)' },
        { kana: 'ください', romaji: 'Kudasai', meaning: 'Please (asking for something)' },
        { kana: 'では、また。', romaji: 'Dewa, mata', meaning: 'See you again' },
        { kana: 'じゃ、また。', romaji: 'Ja, mata', meaning: 'See you again (casual)' },
        { kana: 'じゃあ(ね)。', romaji: 'Jaa (ne)', meaning: 'See you (more casual)' },
        { kana: 'お邪魔します', romaji: 'Ojama shimasu', meaning: 'Excuse me for intruding' },
        { kana: 'よろしくお願いします', romaji: 'Yoroshiku onegaishimasu', meaning: 'Please treat me kindly' },
        { kana: 'はじめまして', romaji: 'Hajimemashite', meaning: 'How do you do' },
      ],
    },
    {
      // Recap 3/4: A は B です — the pattern itself (short reminder,
      // matching shelf-03's own "code box" pattern-line treatment) plus
      // its vocab table on the same page.
      type: 'grammar-intro',
      sectionLabel: 'Recap: A は B です',
      pattern: [
        { text: 'A', role: 'subject' }, { text: 'は', role: 'particle' }, { text: 'B', role: 'predicate' }, { text: 'です', role: 'copula' },
      ],
      explain: [
        'は marks the topic ("as for A..."), です stamps it as true and carries the tense — swap です for でした and the sentence slides from present to past.',
      ],
    },
    {
      type: 'summary',
      title: 'Recap: A は B です — Words',
      headers: ['Word', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'わたし', romaji: 'watashi', meaning: 'I / me' },
        { kana: 'は', romaji: 'wa', meaning: 'topic marker' },
        { kana: 'です', romaji: 'desu', meaning: 'am / is / are (polite)' },
        { kana: 'がくせい', romaji: 'gakusei', meaning: 'student' },
        { kana: 'でした', romaji: 'deshita', meaning: 'was / were (polite past)' },
        { kana: 'せんせい', romaji: 'sensei', meaning: 'teacher' },
      ],
    },
    {
      // Recap 4/4: Self Introduction — a complete jikoshoukai shown as one
      // flowing example (greet+name+close as a single sample, not 3
      // separate step chips) plus 1 more version with a different name
      // right below it in the same box, so the 3-step shape reads as one
      // reusable template instead of an abstract outline. はじめまして/
      // よろしくお願いします use smallGloss — as long single-tile phrases
      // their glosses were wrapping to 2 lines and breaking baseline
      // alignment with the short 1-word tiles (わたし/は/name/です) beside
      // them in the same row.
      type: 'grammar-intro',
      sectionLabel: 'Recap: Self Introduction (jikoshoukai)',
      samples: [
        {
          tag: 'A complete self-introduction',
          tiles: [
            { text: 'はじめまして', role: 'subject', gloss: 'how do you do (greet)', smallGloss: true },
            { text: 'わたし', role: 'subject', gloss: 'I / me' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'レイヤ', role: 'predicate', gloss: 'name' },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
            { text: 'よろしくお願いします', role: 'predicate', gloss: 'please treat me kindly (close)', smallGloss: true },
          ],
          translation: 'Hajimemashite. Watashi wa Reya desu. Yoroshiku onegaishimasu.',
        },
        {
          tag: 'Another version (swap in any name)',
          tiles: [
            { text: 'はじめまして', role: 'subject', gloss: 'greet', smallGloss: true },
            { text: 'わたし', role: 'subject', gloss: 'I / me' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'タロウ', role: 'predicate', gloss: 'name' },
            { text: 'です', role: 'copula', gloss: 'am / is / are' },
            { text: 'よろしくお願いします', role: 'predicate', gloss: 'close', smallGloss: true },
          ],
          translation: 'Hajimemashite. Watashi wa Tarou desu. Yoroshiku onegaishimasu.',
        },
      ],
    },
    {
      type: 'summary',
      title: 'Recap: Self Introduction — Words',
      headers: ['Word', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'お名前', romaji: 'o-namae', meaning: 'name (polite)' },
        { kana: '何', romaji: 'nan', meaning: 'what' },
        { kana: 'か', romaji: 'ka', meaning: 'question marker' },
      ],
    },
    {
      type: 'quiz-review',
      sectionLabel: 'Foundations Review Quiz',
      intro: 'Answer each question, then continue to see the answer key. 10 questions across the 4 lessons.',
      questions: REVIEW_1_QUIZ_QUESTIONS,
    },
    {
      type: 'quiz-answers',
      sectionLabel: 'Answer Key',
      questions: REVIEW_1_QUIZ_QUESTIONS,
    },
    {
      // note omitted deliberately — quizScoreMessage in lesson-box.js
      // auto-picks a retro-cat reaction line from the score percentage.
      type: 'quiz-score',
      title: 'Foundations Review — Score',
    },
  ],
};

// Builds the lesson-end recap page (LessonBox type: 'summary') from
// whatever 'greeting' pages a lesson has, and appends it — generic to
// any lesson's page array, not specific to shelf-01, so future
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

// Builds shelf-05's distance-diagram markup (page 2/8) as one row per
// demonstrative instead of three side-by-side zone boxes: a YOU / LISTENER
// / FAR AWAY column track per row, with the item's icon landing in
// whichever column matches where it actually is for that word. Takes the
// resolved playerColorId/senseiColorId (see resolveDynamicDiagrams below)
// so the cat-face pips always match the player's actual chosen colors,
// the same colors resolveConversationTurns already uses for this player.
// TALK_COLOR_PATHS is defined later in this file (per-color, referenced
// only when this function is actually called at lesson-open time, by
// which point the whole module has finished loading).
function buildDemonstrativesDiagram(playerColorId, senseiColorId) {
  const youPath = TALK_COLOR_PATHS[playerColorId];
  const listenerPath = TALK_COLOR_PATHS[senseiColorId];
  const itemPath = '../../assets/images/lesson/cattomouse-Original.png';
  const track = '<div class="lesson-box__demo-track"></div>';
  const pip = (path) => `<div class="lesson-box__demo-cat-pip" style="background-image:url('${path}');"></div>`;
  const item = '<img class="lesson-box__demo-item-icon" src="' + itemPath + '" alt="item">';
  return `
    <div class="lesson-box__demo-grid">
      <div class="lesson-box__demo-head lesson-box__demo-head--word"></div>
      <div class="lesson-box__demo-head">YOU</div>
      <div class="lesson-box__demo-head">LISTENER</div>
      <div class="lesson-box__demo-head">FAR AWAY</div>

      <div class="lesson-box__demo-row-word" style="color:var(--lb-role-subject-bg);">これ</div>
      <div class="lesson-box__demo-cell">${track}${pip(youPath)}${item}</div>
      <div class="lesson-box__demo-cell">${track}${pip(listenerPath)}</div>
      <div class="lesson-box__demo-cell">${track}</div>
      <div class="lesson-box__demo-row-note">kore — the item is right there <b>with you</b>.</div>

      <div class="lesson-box__demo-row-word" style="color:var(--lb-role-subject-bg);">それ</div>
      <div class="lesson-box__demo-cell">${track}${pip(youPath)}</div>
      <div class="lesson-box__demo-cell">${track}${pip(listenerPath)}${item}</div>
      <div class="lesson-box__demo-cell">${track}</div>
      <div class="lesson-box__demo-row-note">sore — the item is over <b>with the listener</b>.</div>

      <div class="lesson-box__demo-row-word" style="color:var(--lb-role-subject-bg);">あれ</div>
      <div class="lesson-box__demo-cell">${track}${pip(youPath)}</div>
      <div class="lesson-box__demo-cell">${track}${pip(listenerPath)}</div>
      <div class="lesson-box__demo-cell">${track}${item}</div>
      <div class="lesson-box__demo-row-note">are — far from <b>both of you</b>.</div>
    </div>
  `;
}

// Builds shelf-06's statement-to-question diagram — two rows (STATEMENT /
// QUESTION) with a real cat-face pip per row (player's own color for the
// statement, sensei's derived color for the question — same "who's
// talking" cue used everywhere else, not a distance/listener concept like
// shelf-05's diagram, just reusing the same real-cat-sprite treatment
// instead of plain boxes) plus a tilted "?" badge and a glowing highlight
// ring on か itself so it reads as "the one thing that changed."
function buildQuestionParticleDiagram(playerColorId, senseiColorId) {
  const youPath = TALK_COLOR_PATHS[playerColorId];
  const senseiPath = TALK_COLOR_PATHS[senseiColorId];
  const pip = (path) => `<div class="lesson-box__qdiagram-cat" style="background-image:url('${path}');"></div>`;
  const tile = (text, role, extraClass) => `<div class="lesson-box__qdiagram-tile role-${role}${extraClass ? ' ' + extraClass : ''}">${text}</div>`;
  return `
    <div class="lesson-box__qdiagram">
      <div class="lesson-box__qdiagram-row">
        <div class="lesson-box__qdiagram-label">Statement</div>
        <div class="lesson-box__qdiagram-cells">
          ${pip(youPath)}
          ${tile('これ', 'subject')}${tile('は', 'particle')}${tile('ほん', 'predicate')}${tile('です', 'copula')}
        </div>
      </div>
      <div class="lesson-box__qdiagram-row">
        <div class="lesson-box__qdiagram-label">Question</div>
        <div class="lesson-box__qdiagram-cells">
          <span class="lesson-box__qdiagram-qmark">?</span>
          ${pip(senseiPath)}
          ${tile('これ', 'subject')}${tile('は', 'particle')}${tile('ほん', 'predicate')}${tile('です', 'copula')}${tile('か', 'particle', 'is-highlight')}
        </div>
      </div>
    </div>
  `;
}

// -- shelf-08 interactive direction diagram ---------------------------------
// "Around the cat" (bird's-eye compass: mae/ushiro/migi/hidari/tonari,
// plus chikaku as a dashed proximity ring) — all relative to the
// player's own cat — and a "box & cat" side view for ue/shita (still cat-
// relative) and naka/soto (a cat isn't a container, so those two get a
// drawn box as their reference instead). diagramSvg is a function
// (playerColorId) => string, resolved once by resolveDynamicDiagrams like
// buildQuestionParticleDiagram/buildDemonstrativesDiagram above.
// wireDirectionsDiagram has no color dependency, so it's attached
// directly as page.wireDiagram (see lesson-box.js render()'s hook) rather
// than going through that resolver.
function buildDirectionsDiagram(playerColorId) {
  const catPath = TALK_COLOR_PATHS[playerColorId];
  return `
    <div class="lesson-box__dirdiagram">
      <div class="lesson-box__dirdiagram-stages">
        <div>
          <div class="lesson-box__dirdiagram-stage-label">Around the cat</div>
          <div class="lesson-box__dirdiagram-grid">
            <div class="lesson-box__dirdiagram-cell"></div>
            <div class="lesson-box__dirdiagram-cell"></div>
            <div class="lesson-box__dirdiagram-cell"></div>
            <div class="lesson-box__dirdiagram-cell"></div>
            <div class="lesson-box__dirdiagram-cell lesson-box__dirdiagram-cat-cell">
              <div class="lesson-box__dirdiagram-cat" data-anchor="cat-compass" style="background-image:url('${catPath}');"></div>
              <div class="lesson-box__dirdiagram-near-ring" data-near></div>
            </div>
            <div class="lesson-box__dirdiagram-cell"></div>
            <div class="lesson-box__dirdiagram-cell"></div>
            <div class="lesson-box__dirdiagram-cell"></div>
            <div class="lesson-box__dirdiagram-cell"></div>
          </div>
        </div>
        <div>
          <div class="lesson-box__dirdiagram-stage-label">Box &amp; cat (side view)</div>
          <div class="lesson-box__dirdiagram-sideview">
            <div class="lesson-box__dirdiagram-cell"></div>
            <div class="lesson-box__dirdiagram-side-row">
              <div class="lesson-box__dirdiagram-cat" data-anchor="cat-side" style="background-image:url('${catPath}');"></div>
              <div class="lesson-box__dirdiagram-box" data-anchor="box"></div>
            </div>
            <div class="lesson-box__dirdiagram-cell"></div>
          </div>
        </div>
      </div>
      <div class="lesson-box__dirdiagram-target" data-target hidden>&#128214;</div>
      <div class="lesson-box__dirdiagram-controls">
        <button class="lesson-box__dirdiagram-btn" data-dir="mae">前</button>
        <button class="lesson-box__dirdiagram-btn" data-dir="ushiro">後ろ</button>
        <button class="lesson-box__dirdiagram-btn" data-dir="migi">右</button>
        <button class="lesson-box__dirdiagram-btn" data-dir="hidari">左</button>
        <button class="lesson-box__dirdiagram-btn" data-dir="tonari">隣</button>
        <button class="lesson-box__dirdiagram-btn" data-dir="chikaku">近く</button>
        <button class="lesson-box__dirdiagram-btn" data-dir="ue">上</button>
        <button class="lesson-box__dirdiagram-btn" data-dir="shita">下</button>
        <button class="lesson-box__dirdiagram-btn" data-dir="naka">中</button>
        <button class="lesson-box__dirdiagram-btn" data-dir="soto">外</button>
      </div>
      <div class="lesson-box__dirdiagram-sentence" data-sentence></div>
    </div>
  `;
}

// Pixel offset (from the anchor element's own center) the floating target
// icon moves to for each direction word, plus which anchor it's relative
// to — computed at click time against real layout via
// getBoundingClientRect (see wireDirectionsDiagram), not baked into fixed
// page coordinates, so this stays correct at any panel width.
const DIRDIAGRAM_OFFSETS = {
  mae: { anchor: 'cat-compass', dx: 0, dy: 50 },
  ushiro: { anchor: 'cat-compass', dx: 0, dy: -50 },
  migi: { anchor: 'cat-compass', dx: 50, dy: 0 },
  hidari: { anchor: 'cat-compass', dx: -50, dy: 0 },
  tonari: { anchor: 'cat-compass', dx: -48, dy: -48 },
  chikaku: { anchor: 'cat-compass', dx: 34, dy: -34, ring: true },
  ue: { anchor: 'cat-side', dx: 0, dy: -42 },
  shita: { anchor: 'cat-side', dx: 0, dy: 42 },
  naka: { anchor: 'box', dx: 0, dy: 0 },
  soto: { anchor: 'box', dx: 46, dy: 0 },
};

const DIRDIAGRAM_SENTENCES = {
  mae: { ref: 'ねこの', refGloss: "cat's", word: '前', gloss: 'in front of', romaji: 'Hon wa neko no mae ni arimasu.' },
  ushiro: { ref: 'ねこの', refGloss: "cat's", word: '後ろ', gloss: 'behind', romaji: 'Hon wa neko no ushiro ni arimasu.' },
  migi: { ref: 'ねこの', refGloss: "cat's", word: '右', gloss: 'right of', romaji: 'Hon wa neko no migi ni arimasu.' },
  hidari: { ref: 'ねこの', refGloss: "cat's", word: '左', gloss: 'left of', romaji: 'Hon wa neko no hidari ni arimasu.' },
  tonari: { ref: 'ねこの', refGloss: "cat's", word: '隣', gloss: 'next to', romaji: 'Hon wa neko no tonari ni arimasu.' },
  chikaku: { ref: 'ねこの', refGloss: "cat's", word: '近く', gloss: 'near', romaji: 'Hon wa neko no chikaku ni arimasu.' },
  ue: { ref: 'ねこの', refGloss: "cat's", word: '上', gloss: 'above', romaji: 'Hon wa neko no ue ni arimasu.' },
  shita: { ref: 'ねこの', refGloss: "cat's", word: '下', gloss: 'below', romaji: 'Hon wa neko no shita ni arimasu.' },
  naka: { ref: 'はこの', refGloss: "box's", word: '中', gloss: 'inside', romaji: 'Hon wa hako no naka ni arimasu.' },
  soto: { ref: 'はこの', refGloss: "box's", word: '外', gloss: 'outside', romaji: 'Hon wa hako no soto ni arimasu.' },
};

function wireDirectionsDiagram(container) {
  const wrap = container.querySelector('.lesson-box__dirdiagram');
  if (!wrap) return;
  const anchors = {
    'cat-compass': wrap.querySelector('[data-anchor="cat-compass"]'),
    'cat-side': wrap.querySelector('[data-anchor="cat-side"]'),
    box: wrap.querySelector('[data-anchor="box"]'),
  };
  const target = wrap.querySelector('[data-target]');
  const near = wrap.querySelector('[data-near]');
  const sentence = wrap.querySelector('[data-sentence]');
  const buttons = Array.from(wrap.querySelectorAll('[data-dir]'));

  function select(dir) {
    buttons.forEach((b) => b.classList.toggle('is-active', b.dataset.dir === dir));
    const cfg = DIRDIAGRAM_OFFSETS[dir];
    const anchorEl = anchors[cfg.anchor];
    const wrapRect = wrap.getBoundingClientRect();
    const anchorRect = anchorEl.getBoundingClientRect();
    const cx = anchorRect.left + anchorRect.width / 2 - wrapRect.left;
    const cy = anchorRect.top + anchorRect.height / 2 - wrapRect.top;
    target.style.left = `${cx + cfg.dx}px`;
    target.style.top = `${cy + cfg.dy}px`;
    target.hidden = false;
    near.classList.toggle('is-shown', !!cfg.ring);

    const s = DIRDIAGRAM_SENTENCES[dir];
    sentence.innerHTML = `
      <div class="lesson-box__sentence-row">
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-subject">ほん</div><div class="lesson-box__word-tile-gloss">book</div></div>
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-particle">は</div><div class="lesson-box__word-tile-gloss">topic marker</div></div>
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-predicate">${s.ref}</div><div class="lesson-box__word-tile-gloss">${s.refGloss}</div></div>
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-predicate">${s.word}</div><div class="lesson-box__word-tile-gloss">${s.gloss}</div></div>
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-particle">に</div><div class="lesson-box__word-tile-gloss">location marker</div></div>
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-copula">あります</div><div class="lesson-box__word-tile-gloss">there is</div></div>
      </div>
      <div class="lesson-box__sentence-translation">${s.romaji}</div>
    `;
  }

  buttons.forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    select(b.dataset.dir);
  }));
  select('mae');
}

// -- shelf-08 interactive town-map diagram -----------------------------------
// Reuses this shelf's own places vocab + direction words together (駅 as a
// fixed anchor building, 3 others positioned around it) so the "map" pays
// off the "around the cat" diagram's direction words with real place
// nouns instead of an abstract book/cat. No color dependency, but
// diagramSvg still has to be a function reference here (not called
// eagerly) — LESSON_CONTENT is defined before MAPDIAGRAM_PLACES/
// MAPDIAGRAM_PAIRS below, so calling buildPlacesMapDiagram() inline
// would hit those consts before their temporal-dead-zone initialization.
// resolveDynamicDiagrams calls any function-valued diagramSvg lazily at
// lesson-open time regardless of whether it uses the color args, so this
// resolves the same way buildDirectionsDiagram does. wirePlacesMapDiagram
// is attached directly as page.wireDiagram (that hook is never resolved
// early, so no such ordering constraint there).
const MAPDIAGRAM_PLACES = [
  { id: 'eki', kana: '駅', gloss: 'station', x: 108, y: 78, icon: '\u{1F686}' },
  { id: 'toshokan', kana: '図書館', gloss: 'library', x: 16, y: 12, icon: '\u{1F4DA}' },
  { id: 'gakkou', kana: '学校', gloss: 'school', x: 196, y: 12, icon: '\u{1F3EB}' },
  { id: 'byouin', kana: '病院', gloss: 'hospital', x: 196, y: 140, icon: '\u{1F3E5}' },
];

const MAPDIAGRAM_PAIRS = {
  toshokan: { near: 'eki', word: '近く', gloss: 'near', romaji: 'Toshokan wa eki no chikaku ni arimasu.' },
  gakkou: { near: 'eki', word: '右', gloss: 'right of', romaji: 'Gakkou wa eki no migi ni arimasu.' },
  byouin: { near: 'eki', word: '左', gloss: 'left of', romaji: 'Byouin wa eki no hidari ni arimasu.' },
};

function buildPlacesMapDiagram() {
  const buildings = MAPDIAGRAM_PLACES.map((p) => `
    <div class="lesson-box__mapdiagram-building${p.id === 'eki' ? ' is-anchor' : ''}" data-building="${p.id}" style="left:${p.x}px; top:${p.y}px;">
      <div>${p.icon}</div>
      <div class="lesson-box__mapdiagram-building-label">${p.kana}</div>
    </div>
  `).join('');
  const buttons = Object.keys(MAPDIAGRAM_PAIRS).map((id) => {
    const p = MAPDIAGRAM_PLACES.find((x) => x.id === id);
    return `<button class="lesson-box__mapdiagram-btn" data-place="${id}">${p.kana} (${p.gloss})</button>`;
  }).join('');
  return `
    <div class="lesson-box__mapdiagram">
      <div class="lesson-box__mapdiagram-town">${buildings}</div>
      <div class="lesson-box__mapdiagram-btn-list">${buttons}</div>
    </div>
    <div class="lesson-box__mapdiagram-sentence" data-map-sentence></div>
  `;
}

function wirePlacesMapDiagram(container) {
  const buildingEls = {};
  container.querySelectorAll('[data-building]').forEach((el) => { buildingEls[el.dataset.building] = el; });
  const buttons = Array.from(container.querySelectorAll('[data-place]'));
  const sentence = container.querySelector('[data-map-sentence]');
  if (!sentence) return;

  function select(id) {
    buttons.forEach((b) => b.classList.toggle('is-active', b.dataset.place === id));
    Object.keys(buildingEls).forEach((k) => buildingEls[k].classList.remove('is-subject'));
    buildingEls[id].classList.add('is-subject');
    const pair = MAPDIAGRAM_PAIRS[id];
    const p = MAPDIAGRAM_PLACES.find((x) => x.id === id);
    const ref = MAPDIAGRAM_PLACES.find((x) => x.id === pair.near);
    sentence.innerHTML = `
      <div class="lesson-box__sentence-row">
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-subject">${p.kana}</div><div class="lesson-box__word-tile-gloss">${p.gloss}</div></div>
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-particle">は</div><div class="lesson-box__word-tile-gloss">topic marker</div></div>
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-predicate">${ref.kana}の</div><div class="lesson-box__word-tile-gloss">${ref.gloss}'s</div></div>
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-predicate">${pair.word}</div><div class="lesson-box__word-tile-gloss">${pair.gloss}</div></div>
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-particle">に</div><div class="lesson-box__word-tile-gloss">location marker</div></div>
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-copula">あります</div><div class="lesson-box__word-tile-gloss">there is</div></div>
      </div>
      <div class="lesson-box__sentence-translation">${pair.romaji}</div>
    `;
  }

  buttons.forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    select(b.dataset.place);
  }));
  select('toshokan');
}

// -- shelf-08 interactive movement diagram -----------------------------------
// Click まっすぐ/turn-right/turn-left — a single arrow rotates to match
// and the sentence below rebuilds. diagramSvg is a function
// (playerColorId) => string, resolved by resolveDynamicDiagrams like
// buildDirectionsDiagram; wireMovementDiagram has no color dependency, so
// it's attached directly as page.wireDiagram.
function buildMovementDiagram(playerColorId) {
  const catPath = TALK_COLOR_PATHS[playerColorId];
  return `
    <div class="lesson-box__movediagram">
      <div class="lesson-box__movediagram-stage">
        <div class="lesson-box__movediagram-arrow" data-arrow>&#8593;</div>
        <div class="lesson-box__movediagram-cat" style="background-image:url('${catPath}');"></div>
      </div>
      <div class="lesson-box__movediagram-controls">
        <button class="lesson-box__movediagram-btn" data-move="massugu">まっすぐ</button>
        <button class="lesson-box__movediagram-btn" data-move="migi">右に曲がります</button>
        <button class="lesson-box__movediagram-btn" data-move="hidari">左に曲がります</button>
      </div>
      <div class="lesson-box__movediagram-sentence" data-move-sentence></div>
    </div>
  `;
}

const MOVEDIAGRAM_DATA = {
  massugu: { rotate: 0, romaji: 'Massugu ikimasu.', tiles: [{ t: 'まっすぐ', r: 'predicate', g: 'straight ahead' }, { t: '行きます', r: 'copula', g: 'to go' }] },
  migi: { rotate: 90, romaji: 'Migi ni magarimasu.', tiles: [{ t: '右', r: 'predicate', g: 'right' }, { t: 'に', r: 'particle', g: 'location marker' }, { t: '曲がります', r: 'copula', g: 'to turn' }] },
  hidari: { rotate: -90, romaji: 'Hidari ni magarimasu.', tiles: [{ t: '左', r: 'predicate', g: 'left' }, { t: 'に', r: 'particle', g: 'location marker' }, { t: '曲がります', r: 'copula', g: 'to turn' }] },
};

function wireMovementDiagram(container) {
  const wrap = container.querySelector('.lesson-box__movediagram');
  if (!wrap) return;
  const arrow = wrap.querySelector('[data-arrow]');
  const sentence = wrap.querySelector('[data-move-sentence]');
  const buttons = Array.from(wrap.querySelectorAll('[data-move]'));

  function select(move) {
    buttons.forEach((b) => b.classList.toggle('is-active', b.dataset.move === move));
    const d = MOVEDIAGRAM_DATA[move];
    arrow.style.transform = `rotate(${d.rotate}deg)`;
    const tilesHtml = d.tiles.map((t) => `
      <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-${t.r}">${t.t}</div><div class="lesson-box__word-tile-gloss">${t.g}</div></div>
    `).join('');
    sentence.innerHTML = `
      <div class="lesson-box__sentence-row">${tilesHtml}</div>
      <div class="lesson-box__sentence-translation">${d.romaji}</div>
    `;
  }

  buttons.forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    select(b.dataset.move);
  }));
  select('massugu');
}

// -- shelf-08 interactive route diagram --------------------------------------
// A 4-leg walk to 駅 using the player's own real cat sprite (the full
// idle+walk spritesheet already loaded for the player character in
// LibraryScene — CAT_COLORS[id].path, NOT the talk-portrait crop used by
// the other diagrams on this shelf) instead of a generic emoji marker,
// walking in all 4 screen directions (up/right/down/left) so each of
// 前・後ろ・右・左 gets demonstrated as an actual movement, not just a
// static position word. diagramSvg is a function (playerColorId) =>
// string, resolved by resolveDynamicDiagrams like buildDirectionsDiagram;
// wireRouteDiagram has no further color dependency (the path is baked
// into the returned markup via a data attribute), so it's attached
// directly as page.wireDiagram.
function buildRouteDiagram(playerColorId) {
  const catPath = CAT_COLORS[playerColorId].path;
  return `
    <div class="lesson-box__routediagram">
      <div class="lesson-box__routediagram-map">
        <div class="lesson-box__routediagram-eki" data-eki style="left:70px; top:90px;">&#128647;<span>駅</span></div>
        <div class="lesson-box__routediagram-cat" data-cat data-cat-path="${catPath}"></div>
      </div>
      <div class="lesson-box__routediagram-controls">
        <button class="lesson-box__routediagram-btn" data-step="1">1. 前に行きます</button>
        <button class="lesson-box__routediagram-btn" data-step="2">2. 右に曲がります</button>
        <button class="lesson-box__routediagram-btn" data-step="3">3. 後ろに行きます</button>
        <button class="lesson-box__routediagram-btn" data-step="4">4. 左に曲がります</button>
      </div>
      <div class="lesson-box__routediagram-sentence" data-route-sentence></div>
    </div>
  `;
}

// One waypoint per step (index 0 = start) — screen pixel coordinates
// within the 220x170 map. Each leg's direction is purely visual (which
// way the position moves, and which walk row that plays); it doesn't
// need to trace a geometrically "efficient" path to read as a walk.
const ROUTE_WAYPOINTS = [
  { x: 20, y: 120 }, // start
  { x: 20, y: 20 }, // after step 1 (前 — walks up)
  { x: 160, y: 20 }, // after step 2 (右 — walks right)
  { x: 160, y: 90 }, // after step 3 (後ろ — walks down)
  { x: 70, y: 90 }, // after step 4 (左 — walks left) = 駅
];

// animRow indices match CAT_SHEET_ROWS above (walkUp=3, walkRight=5,
// walkDown=2, walkLeft=4).
const ROUTE_STEPS = {
  1: {
    animRow: 3,
    tiles: [{ t: '前', r: 'predicate', g: 'forward' }, { t: 'に', r: 'particle', g: 'location marker' }, { t: '行きます', r: 'copula', g: 'to go' }],
    romaji: 'Mae ni ikimasu.',
  },
  2: {
    animRow: 5,
    tiles: [{ t: '右', r: 'predicate', g: 'right' }, { t: 'に', r: 'particle', g: 'location marker' }, { t: '曲がります', r: 'copula', g: 'to turn' }],
    romaji: 'Migi ni magarimasu.',
  },
  3: {
    animRow: 2,
    tiles: [{ t: '後ろ', r: 'predicate', g: 'backward' }, { t: 'に', r: 'particle', g: 'location marker' }, { t: '行きます', r: 'copula', g: 'to go' }],
    romaji: 'Ushiro ni ikimasu.',
  },
  4: {
    animRow: 4,
    tiles: [{ t: '左', r: 'predicate', g: 'left' }, { t: 'に', r: 'particle', g: 'location marker' }, { t: '曲がります', r: 'copula', g: 'to turn' }],
    romaji: 'Hidari ni magarimasu. — ここは駅です。("Here is the station.")',
  },
};
const ROUTE_STEP_DURATION_MS = 500;

function wireRouteDiagram(container) {
  const wrap = container.querySelector('.lesson-box__routediagram');
  if (!wrap) return;
  const catEl = wrap.querySelector('[data-cat]');
  const eki = wrap.querySelector('[data-eki]');
  const sentence = wrap.querySelector('[data-route-sentence]');
  const buttons = Array.from(wrap.querySelectorAll('[data-step]'));
  const catPath = catEl.dataset.catPath;
  let step = 0;
  let idleTimeout = null;

  function setCatPosition(p) {
    catEl.style.left = `${p.x}px`;
    catEl.style.top = `${p.y}px`;
  }

  function playWalk(animRow) {
    window.LessonBox.spriteStyle(catEl, catPath, 36, {
      sheetCols: CAT_SHEET_COLS, row: animRow, frameCount: 6, duration: '0.5s', animKey: `route-walk-${animRow}`,
    });
  }

  function playIdle() {
    window.LessonBox.spriteStyle(catEl, catPath, 36, {
      sheetCols: CAT_SHEET_COLS, row: CAT_SHEET_ROWS.idle.row, frameCount: CAT_SHEET_ROWS.idle.count, duration: '1.2s', animKey: 'route-idle',
    });
  }

  function render() {
    buttons.forEach((b) => {
      const n = Number(b.dataset.step);
      b.classList.toggle('is-active', n === step);
      b.disabled = n !== step + 1;
    });
    eki.classList.toggle('is-arrived', step >= 4);
    if (step === 0) {
      sentence.innerHTML = '<div class="lesson-box__diagram-caption">Click step 1 to start walking.</div>';
      return;
    }
    const s = ROUTE_STEPS[step];
    const tilesHtml = s.tiles.map((t) => `
      <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-${t.r}">${t.t}</div><div class="lesson-box__word-tile-gloss">${t.g}</div></div>
    `).join('');
    sentence.innerHTML = `
      <div class="lesson-box__sentence-row">${tilesHtml}</div>
      <div class="lesson-box__sentence-translation">${s.romaji}</div>
    `;
  }

  buttons.forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const n = Number(b.dataset.step);
    if (n !== step + 1) return;
    clearTimeout(idleTimeout);
    playWalk(ROUTE_STEPS[n].animRow);
    setCatPosition(ROUTE_WAYPOINTS[n]);
    step = n;
    render();
    idleTimeout = setTimeout(playIdle, ROUTE_STEP_DURATION_MS);
  }));

  setCatPosition(ROUTE_WAYPOINTS[0]);
  playIdle();
  render();
}

// -- shelf-08 compass diagram -------------------------------------------------
// 北・南・東・西 around a fixed ring — a static diagram (no page.wireDiagram)
// since compass directions are fixed reference points, not anything
// relative to the cat that needs interactive repositioning.
function buildCompassDiagram() {
  return `
    <div class="lesson-box__compass">
      <div class="lesson-box__compass-ring">
        <div class="lesson-box__compass-label lesson-box__compass-n">北<span>kita</span></div>
        <div class="lesson-box__compass-label lesson-box__compass-e">東<span>higashi</span></div>
        <div class="lesson-box__compass-label lesson-box__compass-s">南<span>minami</span></div>
        <div class="lesson-box__compass-label lesson-box__compass-w">西<span>nishi</span></div>
        <div class="lesson-box__compass-needle"></div>
      </div>
    </div>
  `;
}

// Resolves any 'grammar-intro' page whose diagramSvg is a function (not a
// plain string) into real markup using this lesson's actual cat colors —
// mirrors resolveConversationTurns' player/sensei color derivation so a
// diagram page and a conversation page in the same lesson never disagree
// about which color means "you" vs "the other cat". Pages with a static
// string diagramSvg (or none) pass through unchanged.
function resolveDynamicDiagrams(pages, playerColorId) {
  const senseiColorId = playerColorId === 'orange' ? 'black' : 'orange';
  return pages.map((page) => {
    if (typeof page.diagramSvg !== 'function') return page;
    return { ...page, diagramSvg: page.diagramSvg(playerColorId, senseiColorId) };
  });
}

// Prerequisite for each shelf to become "available": null = always
// available (first lesson); otherwise the id of the shelf/pile that
// must be completed first. Reviews now gate every 4 lessons (one per
// shelf column-block — see buildWallHeader's 4 calls, same grouping) —
// shelf-05 gates on review-1 (1-4), shelf-09 on review-2 (5-8), shelf-13
// on review-3 (9-12), shelf-17 on review-4 (13-16) — instead of the
// earlier 2-checkpoint (8-then-6) split, per explicit request.
const SHELF_PREREQ = {
  'shelf-01': null,
  'shelf-02': 'shelf-01', 'shelf-03': 'shelf-02', 'shelf-04': 'shelf-03',
  'shelf-05': 'review-1',
  'shelf-06': 'shelf-05', 'shelf-07': 'shelf-06', 'shelf-08': 'shelf-07',
  'shelf-09': 'review-2',
  'shelf-10': 'shelf-09', 'shelf-11': 'shelf-10', 'shelf-12': 'shelf-11',
  'shelf-13': 'review-3',
  'shelf-14': 'shelf-13', 'shelf-15': 'shelf-14', 'shelf-16': 'shelf-15',
  'shelf-17': 'review-4',
};

// 4 review book piles, one per 4-lesson column-block, each placed beside
// that block's own side of the corridor (2 left, 2 right — was 2 piles
// both on the left side only). The 5th checkpoint ("final-quiz") is not
// a book pile — it's the staircase up at the north wall (see
// buildTopBand()), which is the gate to N4 ("second floor").
const BOOK_PILE_DATA = [
  { id: 'review-1', title: 'Foundations Review', requires: ['shelf-01', 'shelf-02', 'shelf-03', 'shelf-04'] },
  { id: 'review-2', title: 'Everyday Vocabulary Review', requires: ['shelf-05', 'shelf-06', 'shelf-07', 'shelf-08'] },
  { id: 'review-3', title: 'Core Grammar Review', requires: ['shelf-09', 'shelf-10', 'shelf-11', 'shelf-12'] },
  // Renamed from "Sentence Builder Review" — that name collides with a
  // different lesson grouping (shelves 9-14) used in the N5 map design
  // doc/chat spec; this pile actually covers shelves 13-16, so it gets
  // its own non-colliding name instead.
  { id: 'review-4', title: 'Grammar Mastery Review', requires: ['shelf-13', 'shelf-14', 'shelf-15', 'shelf-16'] },
];

// Reception desk clutter — 18 items scattered across the desk's usable
// surface (approved via mockup iterations: books cluster bottom-left/
// bottom-right + 1 on each wing, papers/mug/scrap scattered around the
// center, paper stack + quill cup + inkwell&quill grouped top-right-of-
// center at 180deg). Coordinates are offsets (x, y, w, h) in the desk
// SPRITE'S OWN native pixel space (0..191 wide, 0..107 tall, matching
// ASSET_RECTS.receptionDesk) — not world coordinates — from the desk's
// top-left corner, so buildDeskItems() can scale/position the whole set
// relative to wherever the desk itself is drawn. tier is the depth
// layer (1=back, 2=middle, 3=front); rot is a CSS-style rotation in
// degrees, applied around each item's own center.
const DESK_ITEMS = [
  // Wings (the pillar-top surfaces flanking the notch) — 1 book each.
  { key: 'stripedStack', rectKey: 'deskStripedStack', x: 4, y: 4, w: 14.3, h: 14.95, tier: 1, rot: 0 },
  { key: 'flatBook', rectKey: 'deskFlatBook', x: 150, y: 4, w: 15.6, h: 11.05, tier: 1, rot: 0 },
  // Bottom-left book cluster.
  { key: 'tallStack', rectKey: 'deskTallStack', x: 20, y: 30, w: 19.5, h: 31.2, tier: 1, rot: 0 },
  { key: 'greenLedger', rectKey: 'deskGreenLedger', x: 43.5, y: 65, w: 15.6, h: 13, tier: 2, rot: 0 },
  { key: 'redBook', rectKey: 'deskRedBook', x: 62.1, y: 63.7, w: 15.6, h: 14.3, tier: 2, rot: 0 },
  // Bottom-right book cluster.
  { key: 'thickStack', rectKey: 'deskThickStack', x: 150.85, y: 30, w: 20.15, h: 29.25, tier: 1, rot: 0 },
  { key: 'ribbonScroll', rectKey: 'deskRibbonScroll', x: 133.55, y: 65.65, w: 14.3, h: 12.35, tier: 2, rot: 0 },
  { key: 'openBook', rectKey: 'deskOpenBook', x: 101.3, y: 62.4, w: 29.25, h: 15.6, tier: 2, rot: 0 },
  // Papers + dice, scattered around the center.
  { key: 'clipboard', rectKey: 'deskClipboard', x: 103.95, y: 51.06, w: 7.8, h: 10.4, tier: 3, rot: 0.3 },
  { key: 'paperWavy', rectKey: 'deskPaperWavy', x: 150.35, y: 58.55, w: 11.05, h: 12.35, tier: 3, rot: 0.2 },
  { key: 'paperFanned', rectKey: 'deskPaperFanned', x: 133.56, y: 63.22, w: 13.65, h: 13, tier: 3, rot: -3.4 },
  { key: 'paperStackB', rectKey: 'deskPaperStackB', x: 152.92, y: 48.67, w: 9.75, h: 11.7, tier: 3, rot: -2.5 },
  { key: 'dice', rectKey: 'deskDice', x: 156.86, y: 45.74, w: 5.2, h: 4.55, tier: 3, rot: -0.9 },
  // Coffee mug — top-left-of-center.
  { key: 'mug', rectKey: 'deskMug', x: 68.32, y: 32, w: 6.5, h: 8.45, tier: 2, rot: 0 },
  // Parchment scroll — dead center.
  { key: 'scrap', rectKey: 'deskScrap', x: 87.7, y: 51.08, w: 15.6, h: 5.85, tier: 3, rot: 0 },
  // Paper stack + quill cup + inkwell&quill, grouped top-right-of-center,
  // each rotated 180deg.
  { key: 'paperStackA', rectKey: 'deskPaperStackA', x: 103.05, y: 32, w: 14.3, h: 13.65, tier: 2, rot: 180 },
  { key: 'quillCup', rectKey: 'deskQuillCup', x: 120.35, y: 32, w: 6.5, h: 14.3, tier: 2, rot: 180 },
  { key: 'inkwellQuill', rectKey: 'deskInkwellQuill', x: 129.85, y: 32, w: 12.35, h: 15.6, tier: 2, rot: 180 },
];

const SAVE_KEY = 'nekoBunko.n5.progress';
const FAVORITES_KEY = 'nekoBunko.n5.favorites';
const LESSON_PAGE_KEY = 'nekoBunko.n5.lessonPage';
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
// Per-action, per-color sprite strips for LessonBox 'conversation' pages
// (see resolveConversationTurns below) — all cropped from the same
// "<color> cat with text.png" packs via a blob-center scan (fixed-grid
// cropping bled neighboring frames' ears/tails into each cell; centering
// each frame's crop window on its own detected blob eliminated that —
// see assets/images/avatars/*-{color}-64x64.png). Each entry is a
// single-row strip; frame counts are declared in lesson-box.js's
// ACTION_META, not here (this file only resolves WHICH file to use).
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

// { [shelfOrPileId]: pageIndex } — the page a lesson was left on when the
// player closed LessonBox mid-way (Escape), read by openRetroMenu() to
// offer "Continue Reading" and by startLesson() to reopen at that page.
// Cleared for a lesson once it's actually completed (see startLesson's
// onClose) — only ever holds partial-progress positions.
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
    scene.load.spritesheet(c.key, c.path, { frameWidth: 64, frameHeight: 64 });
  });
}

// Idempotent: both CatSelectScene and LibraryScene call this, and Phaser
// throws if you register the same animation key twice. One idle + 4
// directional walk animations per color, all sharing the naming
// convention `${colorId}-${suffix}` so callers can look up the right key
// by combining the selected color with whatever state they're in.
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

function cropToTexture(scene, sourceKey, rect, destKey) {
  const srcImage = scene.textures.get(sourceKey).getSourceImage();
  const canvasTexture = scene.textures.createCanvas(destKey, rect.w, rect.h);
  const ctx = canvasTexture.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(srcImage, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
  canvasTexture.refresh();
  return destKey;
}

// Hand-drawn "real wall" header: individual hand-cut planks (randomized
// per-plank shade + grain streaks + occasional knots) instead of a single
// flat tiled strip, a weathered stain streak across the lower wainscoting
// band, a 3-step carved molding cap/base trim, and pillars with a flared
// capital/base, a center grain line, and 2 riveted iron straps. Ported
// verbatim (same palette + proportions) from the approved
// wall_header_mockup_v2 visualize mockup — do not reinterpret the colors
// or swap the blocky/smooth techniques used there.
// Keyed by size (not a single cached key) — the shorter wall segment
// above shelves 1/2/5/6 needs its own smaller texture alongside the main
// 110px-tall header, and Phaser throws on re-registering a canvas key.
function drawWallHeaderTexture(scene, w, h) {
  const key = `wallHeaderPanelTex_${w}x${h}`;
  if (scene.textures.exists(key)) return key;

  let seed = 42;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const shade = ([r, g, b], amt) =>
    `rgb(${Math.max(0, Math.min(255, r + amt))},${Math.max(0, Math.min(255, g + amt))},${Math.max(0, Math.min(255, b + amt))})`;

  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;

  const moldH = Math.max(3, Math.round((h * 6) / 58));
  const baseH = Math.max(3, Math.round((h * 6) / 58));
  const pillarW = Math.max(6, Math.round((w * 10) / 220));
  const panelCount = 3;
  const totalPillarW = pillarW * (panelCount - 1);
  const panelW = (w - totalPillarW) / panelCount;
  const plankW = Math.max(3, Math.round((w * 5) / 220));
  const plankBandH = Math.max(6, Math.round(((h - moldH - baseH) * 24) / 46));

  const plankTopBase = [192, 107, 30];
  const panelBottomBase = [90, 47, 38];

  // 3-step carved molding cap.
  ctx.fillStyle = '#241209'; ctx.fillRect(0, 0, w, moldH);
  ctx.fillStyle = '#4a2a1c'; ctx.fillRect(0, 1, w, Math.max(1, moldH - 2));
  ctx.fillStyle = '#6a4128'; ctx.fillRect(0, 1, w, 1);

  let x = 0;
  for (let p = 0; p < panelCount; p++) {
    // Individual planks — each a slightly different hand-cut shade, with
    // a vertical grain streak and occasional knot.
    for (let px = 0; px < panelW; px += plankW) {
      const thisPlankW = Math.min(plankW, panelW - px);
      const variance = Math.floor(rand() * 20) - 10;
      ctx.fillStyle = shade(plankTopBase, variance);
      ctx.fillRect(x + px, moldH, thisPlankW, plankBandH);
      ctx.fillStyle = shade(plankTopBase, variance - 30);
      ctx.fillRect(x + px, moldH, 1, plankBandH);
      if (rand() > 0.4) {
        ctx.fillStyle = shade(plankTopBase, variance - 18);
        ctx.fillRect(x + px + Math.floor(thisPlankW / 2), moldH + Math.round(plankBandH * 0.12), 1, Math.round(plankBandH * 0.65));
      }
      if (rand() > 0.75) {
        ctx.fillStyle = shade(plankTopBase, -35);
        ctx.fillRect(x + px + 1, moldH + Math.round(plankBandH * 0.4) + Math.floor(rand() * Math.round(plankBandH * 0.25)), 2, 2);
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, moldH + plankBandH, panelW, 1);

    // Lower panel (paneled wainscoting) with grain + a weathering streak.
    const panelBandY = moldH + plankBandH + 1;
    const panelBandH = h - baseH - panelBandY;
    for (let px = 0; px < panelW; px += plankW) {
      const thisPlankW = Math.min(plankW, panelW - px);
      const variance = Math.floor(rand() * 16) - 8;
      ctx.fillStyle = shade(panelBottomBase, variance);
      ctx.fillRect(x + px, panelBandY, thisPlankW, panelBandH);
      ctx.fillStyle = shade(panelBottomBase, variance - 25);
      ctx.fillRect(x + px, panelBandY, 1, panelBandH);
    }
    ctx.fillStyle = shade(panelBottomBase, -30);
    ctx.fillRect(x, panelBandY, panelW, 1);
    ctx.fillRect(x, h - baseH - 1, panelW, 1);
    ctx.fillStyle = 'rgba(20,10,6,0.25)';
    ctx.fillRect(x + Math.floor(panelW * 0.3), panelBandY + 2, Math.max(2, Math.floor(panelW * 0.15)), Math.max(1, panelBandH - 4));

    x += panelW;
    if (p < panelCount - 1) {
      // Pillar: flared capital + base, grain, 2 riveted metal straps.
      const capFlare = 2;
      ctx.fillStyle = '#241209';
      ctx.fillRect(x - capFlare, moldH - 1, pillarW + capFlare * 2, 5);
      ctx.fillRect(x, moldH + 4, pillarW, h - moldH - baseH - 8);
      ctx.fillRect(x - capFlare, h - baseH - 4, pillarW + capFlare * 2, 5);

      ctx.fillStyle = '#5a3220';
      ctx.fillRect(x + 1, moldH + 4, pillarW - 2, h - moldH - baseH - 8);
      ctx.fillStyle = '#6f4126';
      ctx.fillRect(x + 1, moldH + 4, 1, h - moldH - baseH - 8);
      ctx.fillStyle = '#3a2013';
      ctx.fillRect(x + pillarW - 2, moldH + 4, 1, h - moldH - baseH - 8);

      ctx.fillStyle = '#4a2a1a';
      ctx.fillRect(x + Math.floor(pillarW / 2), moldH + 6, 1, h - moldH - baseH - 12);

      ctx.fillStyle = '#3a3a38';
      ctx.fillRect(x, moldH + 12, pillarW, 2);
      ctx.fillRect(x, h - baseH - 16, pillarW, 2);
      ctx.fillStyle = '#5a5a56';
      ctx.fillRect(x, moldH + 12, pillarW, 1);
      ctx.fillRect(x, h - baseH - 16, pillarW, 1);
      ctx.fillStyle = '#1c1c1a';
      ctx.fillRect(x + 1, moldH + 12, 1, 2);
      ctx.fillRect(x + pillarW - 2, moldH + 12, 1, 2);

      x += pillarW;
    }
  }

  // 3-step carved base trim.
  ctx.fillStyle = '#241209'; ctx.fillRect(0, h - baseH, w, baseH);
  ctx.fillStyle = '#4a2a1c'; ctx.fillRect(0, h - baseH + 1, w, Math.max(1, baseH - 2));

  tex.refresh();
  return key;
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
    // Replaces the old 'favoriteIcon' (gay.png — a leftover rainbow-flag
    // placeholder that never actually read as "favorite") — a pixel-art
    // floppy-disk/save-point icon, cropped tight in buildShelves() below
    // to strip this source file's ~40% transparent padding.
    this.load.image('savePointRaw', '../../assets/images/ui/save-point-Original.png');
    this.load.image('finishFlagIcon', '../../assets/images/ui/finish-line-Original.png');
    loadCatSpritesheets(this);
  }

  create() {
    this.interactives = []; // { id, kind, sprite, glow, stamp, x, y, prereq/requires }
    this.progress = loadProgress();
    this.favorites = loadFavorites();
    this.lessonPage = loadLessonPage();
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
    // duplicated in both. The review pile now sits right beside the wall
    // too (same x offset the plants use), one per side of the corridor —
    // was always `gapLeft + 70` regardless of side, both dead-centered
    // away from the wall and only ever on the left, per explicit feedback
    // ("position it where I pointed" + "put one on the other side too").
    const reviewPileW = ASSET_RECTS.bookPileTall.w * 0.7;
    const buildReviewRow = (y, reviewPile, side) => {
      const x = side === 'right' ? gapRight - 16 - reviewPileW : gapLeft + 16;
      this.reviewPilePositions[reviewPile] = { x, y: y - 8 };
    };
    // Table/chair/sofa/carpet all scaled up ~1.3x per explicit "these
    // table and chairs and sofa and carpet needs to be resized bigger"
    // request. Checked against the corridor/shelf-column clearance by
    // hand (right-side table's right edge lands ~7-10px inside the
    // shelf column's inner edge at this scale — 1.5x was the computed
    // ceiling before it would clip).
    const FURNITURE_SCALE = 1.3;
    const tableW = ASSET_RECTS.libTable.w * FURNITURE_SCALE;
    const tableH = ASSET_RECTS.libTable.h * FURNITURE_SCALE;
    const chairDW = ASSET_RECTS.libChair.w * FURNITURE_SCALE;
    const chairDH = ASSET_RECTS.libChair.h * FURNITURE_SCALE;
    // 2 chairs side by side in front of every table (was 1) — centered
    // under the table with a small gap between them, per explicit
    // request applied to every table+chair placement in the room.
    const addTableWithChairs = (tableX, tableY, chairY) => {
      const chairGap = 4;
      const pairW = chairDW * 2 + chairGap;
      const chairStartX = tableX + (tableW - pairW) / 2;
      this.add.image(tableX, tableY, libTableKey).setOrigin(0, 0).setDepth(1)
        .setDisplaySize(tableW, tableH);
      this.add.image(chairStartX, chairY, libChairKey).setOrigin(0, 0).setDepth(2)
        .setDisplaySize(chairDW, chairDH);
      this.add.image(chairStartX + chairDW + chairGap, chairY, libChairKey).setOrigin(0, 0).setDepth(2)
        .setDisplaySize(chairDW, chairDH);
    };
    const buildTableRow = (y) => {
      const tableY = y - tableH / 2;
      const chairY = y + tableH / 2 - 6;
      const plantY = y - ASSET_RECTS.plant.h / 2;
      // Plant pulled in flush against the wall (was +16 padding, now 0)
      // per explicit "plants need to be moved a few pixels away from the
      // table" feedback — at the post-FURNITURE_SCALE table width, the
      // wall-to-table gap is only ~10px, less than the 16px-wide plant,
      // so full separation isn't geometrically possible without also
      // moving the table (which would push it into the corridor on the
      // other side — left alone here, out of scope for a plant-only
      // request). This still cuts the overlap from ~16px to ~6px.
      const leftTableX = gapCenter - 40 - tableW;
      const rightTableX = gapCenter + 40;
      this.add.image(gapLeft, plantY, plantKey).setOrigin(0, 0).setDepth(1);
      addTableWithChairs(leftTableX, tableY, chairY);
      addTableWithChairs(rightTableX, tableY, chairY);
      this.add.image(gapRight - ASSET_RECTS.plant.w, plantY, plantKey).setOrigin(0, 0).setDepth(1);
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
    // solo row (no left shelf, so just a plant), row[1] gets a
    // table+chair pair, row[2] hosts both review-3 (left side, gates
    // shelf-13 — requires the left column's 9-12) and review-4 (right
    // side, gates shelf-17 — requires the right column's 13-16) as the
    // transition into zone 2. Table/review-row order swapped back per
    // explicit feedback that they'd ended up flipped from where they
    // should be.
    buildSoloPlantRow(LAYOUT.zone1RowY[0]);
    buildTableRow(LAYOUT.zone1RowY[1]);
    buildReviewRow(LAYOUT.zone1RowY[2], 'review-3', 'left');
    buildReviewRow(LAYOUT.zone1RowY[2], 'review-4', 'right');
    // Zone 2 (nearest zone 1 -> nearest spawn): row[0] gets a table+chair
    // pair (transition from zone 1); row[1] hosts both review-1 (left
    // side, gates shelf-05 — requires the left column's 1-4) and
    // review-2 (right side, gates shelf-09 — requires the right column's
    // 5-8).
    buildTableRow(LAYOUT.zone2RowY[0]);
    buildReviewRow(LAYOUT.zone2RowY[1], 'review-1', 'left');
    buildReviewRow(LAYOUT.zone2RowY[1], 'review-2', 'right');

    // One more pure-decor T&C-T&C row, nearest the carpet/globe — not
    // shelf-adjacent, so it keeps its own small band. No plants here
    // (removed per feedback) — they were redundant with the ones now
    // living in every table row. Table X now uses the same gapCenter-
    // relative formula as buildTableRow (was decorSpanLeft+80 /
    // decorSpanRight-80-tableW, which put the two tables close enough to
    // overlap into one fused table — per explicit "the two tables have
    // joined" bug report and "make them the same position as the other
    // table" request).
    const tableY3 = LAYOUT.decorRow3Y - tableH / 2;
    const chairY3 = LAYOUT.decorRow3Y + tableH / 2 - 6;
    addTableWithChairs(gapCenter - 40 - tableW, tableY3, chairY3);
    addTableWithChairs(gapCenter + 40, tableY3, chairY3);

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
    const carpetW = 90 * FURNITURE_SCALE;
    const carpetH = 50 * FURNITURE_SCALE;
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
    const sofaDisplayW = sofaRect.w * FURNITURE_SCALE;
    const sofaDisplayH = sofaRect.h * FURNITURE_SCALE;
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
    // than before to land at a similar on-screen footprint. Scaled up
    // ~1.4x (0.9->1.26) alongside the reception cluster per explicit
    // "enlarge... the shoe cabinet" request.
    const shoeCabinetScale = 1.26;
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
    // Was a single flat-tiled crop of TopDownHouse_FloorsAndWalls.png (visible
    // repeat seams) — now a hand-drawn "real wall" mural (drawWallHeaderTexture):
    // individual planks with per-plank shading/grain/knots, a molding cap and
    // base trim, and pillars between panels, per explicit "not some rectangles,
    // give it more life" feedback. Bottom edge stays anchored at topY-4
    // regardless of headerH (the center-Y formula below cancels headerH out of
    // the bottom-edge position), so growing the header taller only extends it
    // upward — no other positioning needs to change.
    const headerH = 110;
    const headerKey = drawWallHeaderTexture(this, colWidth, headerH);
    // Solid, unlike every other decor piece in this file — it reads as a
    // real built wall (molding/pillars/base trim), so the player should
    // not be able to walk through it, per explicit feedback. Same
    // invisible-rectangle + wallGroup pattern used for the top wall/
    // staircase art in buildTopBand(). Height is overridable per call —
    // the last shelf row (1/2/5/6, see below) only has ~59px of
    // clearance above it (zone2RowGap - shelfH) before it would collide
    // with the shelf row above, so it uses a shorter header.
    const buildWallHeader = (x, topY, h = headerH) => {
      const key = h === headerH ? headerKey : drawWallHeaderTexture(this, colWidth, h);
      const cx = x + colWidth / 2;
      const cy = topY - h / 2 - 4;
      this.add.image(cx, cy, key).setOrigin(0.5, 0.5).setDepth(0);
      const block = this.add.rectangle(cx, cy, colWidth, h, 0x000000, 0).setOrigin(0.5, 0.5);
      this.physics.add.existing(block, true);
      this.wallGroup.add(block);
    };
    buildWallHeader(leftColX[0], zone1RowY[1]);
    buildWallHeader(rightColX[0], zone1RowY[0]);
    buildWallHeader(leftColX[0], zone2RowY[0]);
    buildWallHeader(rightColX[0], zone2RowY[0]);
    // The last shelf row (shelves 1/2/5/6, nearest spawn) previously had
    // no wall behind it at all. First attempt put it above the row (same
    // as every other header) — per explicit correction ("the walls need
    // to be on where the arrow lands"), it belongs BELOW this row
    // instead, in the gap before the table row. Same height as every
    // other header (110) — decorRow3Gap was widened specifically to fit
    // this, per explicit "same height and size as the other header
    // walls" feedback (was a cramped 30px to fit the old, narrower gap).
    const lastRowFooterH = headerH;
    const buildWallFooter = (x, bottomY, h) => {
      const key = drawWallHeaderTexture(this, colWidth, h);
      const cx = x + colWidth / 2;
      const cy = bottomY + h / 2 + 4;
      this.add.image(cx, cy, key).setOrigin(0.5, 0.5).setDepth(0);
      const block = this.add.rectangle(cx, cy, colWidth, h, 0x000000, 0).setOrigin(0.5, 0.5);
      this.physics.add.existing(block, true);
      this.wallGroup.add(block);
    };
    buildWallFooter(leftColX[0], zone2RowY[1] + shelfH, lastRowFooterH);
    buildWallFooter(rightColX[0], zone2RowY[1] + shelfH, lastRowFooterH);

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
    // Favorite icon: crop savePointRaw down to its tight 624x624 content
    // box (source is 1024x1024 with ~40% transparent padding around a
    // centered glyph) so setDisplaySize below fills its box cleanly
    // instead of rendering a tiny disk surrounded by dead space.
    const favoriteDiskKey = cropToTexture(this, 'savePointRaw', { x: 200, y: 200, w: 624, h: 624 }, 'favoriteDiskTex');

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
      // floppy-disk badge floating above the plaque's top-right corner
      // (not riding the right edge at vertical-center anymore — that
      // sat directly over the title text and made it unreadable).
      // Independent of lock/complete state (a locked shelf can't be
      // favorited since the retro menu only opens once available, but a
      // favorited shelf keeps showing the disk regardless of its
      // progress state). Was a top-left heart-shaped icon (actually a
      // leftover rainbow-flag placeholder, gay.png) — moved here and
      // reskinned per explicit request.
      const favIcon = this.add.image(label.bg.x + label.width / 2 - 10, label.bg.y - 8, favoriteDiskKey)
        .setOrigin(0.5).setDepth(4).setDisplaySize(18, 18).setVisible(false);

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

  // -- 4 review book piles (final quiz is the staircase — see buildTopBand) --

  buildBookPiles() {
    const bookKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.bookPileTall, 'bookPileTex');
    // Positions come from buildFurniture()'s decor rows — each review
    // pile sits beside its own column's wall, one per side, in the
    // zone2RowY[1]/zone1RowY[1] rows (see the buildReviewRow calls there).
    // Scale dropped from
    // 1.6 (52x83 displayed — towered over the neighboring plants/tables)
    // to 0.7, small enough to read as sitting "in" the shelf-row scale
    // instead of dominating it.
    const positions = {
      'review-1': { ...this.reviewPilePositions['review-1'], scale: 0.7 },
      'review-2': { ...this.reviewPilePositions['review-2'], scale: 0.7 },
      'review-3': { ...this.reviewPilePositions['review-3'], scale: 0.7 },
      'review-4': { ...this.reviewPilePositions['review-4'], scale: 0.7 },
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

  buildDeskItems(originX, deskTopY, deskScale) {
    DESK_ITEMS.forEach((item) => {
      const rect = ASSET_RECTS[item.rectKey];
      const texKey = cropToTexture(this, 'libAssetPack', rect, `${item.rectKey}Tex`);
      const w = item.w * deskScale;
      const h = item.h * deskScale;
      const cx = originX + (item.x + item.w / 2) * deskScale;
      const cy = deskTopY + (item.y + item.h / 2) * deskScale;
      const img = this.add.image(cx, cy, texKey).setOrigin(0.5, 0.5)
        .setDisplaySize(w, h).setDepth(1 + item.tier * 0.1);
      if (item.rot) img.setAngle(item.rot);
    });
  }

  buildReception() {
    const deskKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.receptionDesk, 'receptionDeskTex');
    const rugKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.receptionRug, 'receptionRugTex');
    // armchairFacingDown (not buildFurniture's armchairTex, which shows
    // the chair's BACK) — alpha-scanned from the source sheet specifically
    // because the reception chair needs to face down toward the desk, per
    // explicit correction after both the unflipped and flipY(true)
    // attempts still showed the wrong orientation. This is a genuinely
    // different sprite (stacked below armchair in the sheet), not a
    // transform of the same one.
    const chairKey = cropToTexture(this, 'libAssetPack', ASSET_RECTS.armchairFacingDown, 'armchairFacingDownTex');

    // libAssetPack's furniture (desk/rug/armchair) is drawn at a much
    // higher pixel density than the sofa/cabinet/curio sheets used
    // elsewhere in this cluster — at native size the desk (191x107) and
    // rug (168x72) dwarfed the 48px-wide sofas next to them. Scaled down
    // so the whole reception nook sits in the same visual scale as its
    // neighbors: desk width lands near the shelf sprite's 87px (the
    // project's existing "big furniture" reference), chair matches the
    // ~32-38px single-seat scale the sofa armchair variants use.
    // Scaled up ~1.4x (76->106 etc.) per explicit "enlarge all items
    // here, including the reception table" request — desk items and the
    // rug/chair all derive their own size from these three numbers, so
    // bumping them enlarges the whole reception cluster together. Bumped
    // again (106->118) per "a little bit bigger", then again (118->150)
    // per plain "make the table more bigger" — rug kept at the same
    // ratio to the desk each time (~1.22x). Bumped again (150->190).
    // Chair was independently resized/repositioned per its own explicit
    // feedback and stays fixed at 46 here (not tied to deskW).
    const deskW = 190;
    const deskH = ASSET_RECTS.receptionDesk.h * (deskW / ASSET_RECTS.receptionDesk.w);
    const rugW = 232;
    const rugH = ASSET_RECTS.receptionRug.h * (rugW / ASSET_RECTS.receptionRug.w);
    const chairW = 46;
    const chairH = ASSET_RECTS.armchairFacingDown.h * (chairW / ASSET_RECTS.armchairFacingDown.w);

    const originX = WORLD_W / 2 - deskW / 2;
    const originY = LAYOUT.receptionY;

    this.furnitureSprites.receptionDesk = this.add
      .image(originX, originY + 10, deskKey).setOrigin(0, 0)
      .setDisplaySize(deskW, deskH).setDepth(1);
    // Rug moved to sit IN FRONT of the desk (south of it, where a visitor
    // approaching from spawn would stand) instead of behind/north of it
    // — was `(originX - 8, originY)`, which put it mostly hidden behind
    // the desk sprite, per explicit "position the red carpet... to be IN
    // FRONT of the table" feedback. Horizontal centering offset is half
    // the rug/desk width difference (was a hardcoded -8 for the old
    // 92/76 sizes — recomputed so it stays centered after resizes).
    this.furnitureSprites.receptionRug = this.add
      .image(originX - (rugW - deskW) / 2, originY + 10 + deskH + 6, rugKey).setOrigin(0, 0)
      .setDisplaySize(rugW, rugH).setDepth(0);
    // Chair nudged further back each pass (further into the notch, away
    // from the desk) — was -22, then -30, now -45 — and sized down
    // (64->46) per explicit "the yellow chair must be smaller and move
    // it back some more" feedback.
    this.furnitureSprites.receptionChair = this.add
      .image(originX + deskW / 2 - chairW / 2, originY - 45, chairKey).setOrigin(0, 0)
      .setDisplaySize(chairW, chairH).setDepth(1);
    // Non-solid, same reasoning as every other decor piece this round.

    // Desk clutter (books/papers/mug/writing implements) — positions are
    // DESK_ITEMS's native-desk-pixel offsets (0..191 x, 0..107 y) from the
    // desk sprite's own top-left, scaled by the same deskW/191 factor the
    // desk itself uses, so the whole cluster moves with the desk if its
    // position/size is ever retuned.
    this.buildDeskItems(originX, originY + 10, deskW / ASSET_RECTS.receptionDesk.w);
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
    this.player.setDisplaySize(60, 60);
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

  // Idle plays while stationary; the matching directional walk animation
  // plays while moving (dominant axis of velocity picks the direction —
  // diagonal movement reads as whichever of up/down/left/right is
  // stronger that frame). Reads this.player.body.velocity, which Phaser
  // only updates when setVelocity() is called — so this runs at the TOP
  // of update(), before this frame's movement branches set a new
  // velocity, meaning it reacts to last frame's velocity. One frame of
  // lag at 60fps is imperceptible. `.play(key, true)` (ignoreIfPlaying)
  // on every branch, not just once, so re-entering the same direction
  // every tick doesn't restart the anim from frame 0 (that would show as
  // a visible pop/stutter every frame while holding a direction).
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
      // LessonBox (a DOM overlay, not a Phaser object) owns E/Enter/Space
      // while it's open via its own document keydown listener — without
      // this guard, the SAME keypress would also fall through to
      // nearestInRange()/openInteraction() here and re-open the shelf's
      // retro menu underneath the lesson dialogue.
      if (this.panelOpen) return;
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
    // Anything (shelf or review pile) with real LESSON_CONTENT opens the
    // LessonBox dialogue instead of completing instantly; entries with no
    // content yet keep the old direct-complete behavior. Piles skip
    // "Make Favorite?" — favoriting is a shelf-plaque-specific affordance
    // (see the favorite-disk icon wiring in buildShelves), not something
    // review piles have a slot for.
    const hasContent = !!LESSON_CONTENT[entry.id];
    // Page count for the subtitle — computed via appendGreetingSummary
    // alone (not the full resolveConversationTurns/resolveDynamicDiagrams
    // pipeline) since only appendGreetingSummary can change page COUNT;
    // the other two only resolve per-page content and don't depend on
    // catColorId, so this stays accurate without needing a color.
    const totalPages = hasContent ? appendGreetingSummary(LESSON_CONTENT[entry.id], entry.title).length : 0;
    const savedIndex = hasContent ? this.lessonPage[entry.id] : undefined;
    // A saved index only means something to resume if it's strictly
    // between the start and the last page — index 0 is indistinguishable
    // from "never started" and isn't worth a resume prompt, and the last
    // page is never saved (startLesson's onClose clears it on completion).
    const hasResume = typeof savedIndex === 'number' && savedIndex > 0 && savedIndex < totalPages - 1;
    const startAction = hasContent
      ? () => this.startLesson(entry)
      : () => this.completeInteraction(entry);
    const options = hasContent
      ? [
        ...(hasResume
          ? [
            { label: `Continue (pg ${savedIndex + 1})`, onSelect: () => this.startLesson(entry, savedIndex) },
            { label: 'Start Over', onSelect: startAction },
          ]
          : [{ label: 'Start Lesson', onSelect: startAction }]),
        // "Michi Shirube" overworld direction scene — only offered from
        // shelf-08 (Places & Directions), the shelf that actually teaches
        // まっすぐ/みぎ/ひだり/うしろにきて. See DirectionMapScene below.
        ...(entry.id === 'shelf-08' ? [{ label: 'Walk the Route (駅)', onSelect: () => this.launchDirectionMap() }] : []),
        ...(entry.kind === 'shelf' ? [{ label: 'Make Favorite?', onSelect: () => this.toggleFavorite(entry) }] : []),
        { label: 'Exit', onSelect: () => this.closeRetroMenu() },
      ]
      : [
        { label: 'Read again', onSelect: () => this.completeInteraction(entry) },
        { label: 'Exit', onSelect: () => this.closeRetroMenu() },
      ];
    void state; // available vs completed doesn't change the option set — both are "revisit" actions
    const subtitle = hasContent ? `${totalPages} pages` : undefined;
    this.buildRetroMenu(entry.title, options, subtitle);
  }

  // Opens the DOM LessonBox (assets/js/lesson-box.js) for shelves that
  // have LESSON_CONTENT. Closes the in-canvas retro menu first (both
  // can't be open at once), keeps this.panelOpen = true for the whole
  // lesson (freezes player movement, same as the retro menu does), and
  // marks progress complete only once the player reaches the last page —
  // matching completeInteraction's own save/refresh/close sequence.
  startLesson(entry, resumeIndex) {
    this.closeRetroMenu();
    this.panelOpen = true;
    // Appends a lesson-end recap table of every 'greeting' page seen so
    // far, generic to any lesson (not hardcoded to shelf-01) — per
    // explicit "summary table of all basic greetings used" request.
    // Lessons with no greeting pages (future sentence/conjugation-only
    // shelves) just don't get one.
    let pages = appendGreetingSummary(LESSON_CONTENT[entry.id], entry.title);
    pages = resolveConversationTurns(pages, this.catColorId);
    pages = resolveDynamicDiagrams(pages, this.catColorId);
    const catColor = CAT_COLORS[this.catColorId];
    window.LessonBox.open(pages, {
      speaker: 'Neko-sensei',
      catImagePath: catColor.path,
      talkImagePath: TALK_COLOR_PATHS[this.catColorId],
      startIndex: resumeIndex,
      onComplete: () => {
        this.progress[entry.id] = true;
        saveProgress(this.progress);
        this.refreshAllStates();
        this.panelOpen = false;
      },
      // Fires on every close, including natural completion (closedIndex
      // is then the last page) — save a resume position only when the
      // player actually left mid-lesson, clear it otherwise (finished,
      // or closed right at the start).
      onClose: (closedIndex, totalPages) => {
        this.panelOpen = false;
        if (typeof closedIndex === 'number' && totalPages && closedIndex < totalPages - 1) {
          this.lessonPage[entry.id] = closedIndex;
        } else {
          delete this.lessonPage[entry.id];
        }
        saveLessonPage(this.lessonPage);
      },
    });
  }

  // Launches the overworld "Michi Shirube" direction scene as an overlay,
  // same pause/launch/resume pattern CatSelectScene's overlay re-pick
  // uses (this.scene.pause + this.scene.launch, resumed by the other
  // scene calling this.scene.resume('LibraryScene') when it's done) —
  // not a LessonBox popup, a real scene swap, since it needs the cat to
  // actually walk a route rather than read paginated content.
  launchDirectionMap() {
    this.closeRetroMenu();
    this.scene.pause('LibraryScene');
    this.scene.launch('DirectionMapScene', { catColorId: this.catColorId });
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

  // subtitle: optional non-interactive line under the title (e.g. a page
  // count) — doesn't count toward options/keyboard nav.
  buildRetroMenu(title, options, subtitle) {
    this.closeRetroMenu();
    const cam = this.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;
    const hasSubtitle = !!subtitle;
    const boxHeight = (hasSubtitle ? 96 : 76) + options.length * 32;
    const boxTop = cy - boxHeight / 2;

    const bg = this.add.rectangle(cx, cy, 300, boxHeight, 0x1a1410)
      .setStrokeStyle(3, 0x8a6a3a).setScrollFactor(0).setDepth(2000);
    const titleText = this.add.text(cx, boxTop + 26, title, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#F0C674',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
    const subtitleText = hasSubtitle ? this.add.text(cx, boxTop + 46, subtitle, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#8a7a5a',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2001) : null;
    const optionsStartY = boxTop + (hasSubtitle ? 78 : 58);
    const optionTexts = options.map((opt, i) => this.add.text(cx - 118, optionsStartY + i * 32, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#B08D57',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(2001)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.highlightRetroMenu(i))
      .on('pointerup', () => { if (this.retroMenu && this.retroMenu.selectedIndex === i) this.selectRetroMenuOption(); }));

    this.retroMenu = { bg, titleText, subtitleText, optionTexts, options, selectedIndex: 0 };
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

  // Up/down (arrow keys or WASD) cycles the highlighted option, Enter/E/
  // Space confirms it (the confirm side lives in wireInput's tryInteract)
  // — same debounced isDown-edge pattern as CatSelectScene's keyboard nav.
  updateRetroMenuInput() {
    const upDown = this.cursors.up.isDown || this.wasd.up.isDown;
    const downDown = this.cursors.down.isDown || this.wasd.down.isDown;
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
      if (this.retroMenu.subtitleText) this.retroMenu.subtitleText.destroy();
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
      const libraryScene = this.scene.get('LibraryScene');
      libraryScene.setPlayerCatColor(colorId);
      this.scene.stop('CatSelectScene');
      this.scene.resume('LibraryScene');
    } else {
      this.scene.start('LibraryScene');
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

// -- "Michi Shirube" (道しるべ, signpost) direction scene --------------------
// A route the cat walks to Eki, taught as a click-to-choose puzzle: at each
// junction the player picks the correct direction word (ひだり/みぎ/まっすぐ)
// from three buttons — no auto-walk-past-a-signpost, the player has to get
// it right to advance. Only three direction words are used (no うしろ/
// reversal): ひだり → みぎ → まっすぐ → みぎ, migi repeated for the final leg
// since that's the word that actually points the road at the station.
// Buildings are the real lesson-folder illustrations (standalone images,
// never cropped from a packed sheet — see SUMMARY.md's crop-rect lesson),
// and every Latin/romaji/gloss/note string uses the self-hosted "Datatype"
// face (lesson-box.css's @font-face, already loaded on this page), kept in
// a completely separate font-family declaration from the Japanese
// DIRMAP_JP_FONT stack — Datatype has zero CJK glyphs.
const DIRMAP_COLORS = {
  cream: 0xf3efe6,
  sage: 0x8fa68e,
  terracotta: 0xc97b63,
  gold: 0xf2b45c,
  indigo: 0x3d3875,
  indigoLight: 0x6a5fa8,
};
const DIRMAP_JP_FONT = '"DotGothic16", sans-serif';
const DIRMAP_LATIN_FONT = '"Datatype", monospace';

// One continuous road, four real junctions, three vocabulary words total
// (migi appears twice). Each waypoint's `correct` is the word needed to
// leave it; the last waypoint (Eki) has none — arriving there just ends
// the route. Geometry verified via heading vectors (not just labeled by
// guess): WP0->WP1 heads west (hidari from an assumed north-facing
// start), WP1->WP2 heads north (migi from west), WP2->WP3 continues north
// (massugu), WP3->WP4 heads east (migi from north) — straight into Eki.
const DIRECTION_ROUTE = [
  { x: 620, y: 380, correct: 'hidari' },
  { x: 260, y: 380, correct: 'migi' },
  { x: 260, y: 220, correct: 'massugu' },
  { x: 260, y: 110, correct: 'migi' },
  { x: 520, y: 110, correct: null },
];

// Vocabulary shown on the junction buttons — shared across every junction
// that needs it (migi's grammar note doesn't change between its two uses),
// so it's keyed by word, not duplicated per waypoint.
const DIRMAP_CHOICES = {
  hidari: {
    kana: 'ひだり', romaji: 'hidari', full: 'ひだりに曲がって', gloss: 'turn left',
    note: '曲がる (magaru, "to turn") → 曲がって (te-form). に marks the direction you’re turning toward.',
  },
  migi: {
    kana: 'みぎ', romaji: 'migi', full: 'みぎに曲がって', gloss: 'turn right',
    note: '曲がる (magaru, "to turn") → 曲がって (te-form). に marks the direction you’re turning toward.',
  },
  massugu: {
    kana: 'まっすぐ', romaji: 'massugu', full: 'まっすぐ行って', gloss: 'go straight',
    note: '行く (iku, "to go") → 行って (te-form) — softens a plain verb into a natural direction.',
  },
};
// Fixed order every time (not shuffled) — same three buttons throughout,
// so the player is reading the words, not hunting for a moved button.
const DIRMAP_CHOICE_ORDER = ['hidari', 'migi', 'massugu'];

// The real lesson-folder illustrations used for every building/compass in
// this scene, loaded once as standalone images (no cropping from a packed
// sheet — each file is its own icon).
const DIRMAP_ASSET_FILES = {
  house: 'house-pixel-Original.png',
  church: 'cathedral-pixel-Original.png',
  school: 'college-building-Original.png',
  restaurant: 'restaurant-building-Original.png',
  hospital: 'hospital-building-Original.png',
  building: 'apartment-building-2-Original.png',
  station: 'subway-station-Original.png',
  compass: 'compass-icon-1-Original.png',
};

// Buildings positioned relative to the road (segment index into
// DIRECTION_ROUTE + how far along it [0-1] + which side), pulled in tight
// to the road shoulder so they read as storefronts lining an actual street
// rather than floating off it.
const DIRMAP_BUILDINGS = [
  { key: 'restaurant', label: 'レストラン', segment: 0, t: 0.18, side: -1, scale: 0.05 },
  { key: 'hospital', label: '病院', segment: 0, t: 0.58, side: 1, scale: 0.05 },
  { key: 'school', label: '学校', segment: 1, t: 0.5, side: -1, scale: 0.05 },
  { key: 'church', label: '教会', segment: 2, t: 0.5, side: 1, scale: 0.05 },
  { key: 'building', label: 'ビル', segment: 3, t: 0.5, side: -1, scale: 0.055 },
];
// Offset from the road centerline, in px — clears the road's own ~11px
// half-width plus a small margin so buildings sit close to the street
// instead of floating far off it.
const DIRMAP_PROP_OFFSET = 42;

// Resolves a {segment, t, side} descriptor to real {x, y} screen
// coordinates: a point `t` fraction along DIRECTION_ROUTE[segment]->
// [segment+1], offset perpendicular to that segment's direction by
// DIRMAP_PROP_OFFSET * side (side is 1 or -1).
function resolveDirmapPropPosition(prop) {
  const a = DIRECTION_ROUTE[prop.segment];
  const b = DIRECTION_ROUTE[prop.segment + 1];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const px = a.x + ux * len * prop.t;
  const py = a.y + uy * len * prop.t;
  const offset = typeof prop.offset === 'number' ? prop.offset : DIRMAP_PROP_OFFSET;
  return { x: px + nx * offset * prop.side, y: py + ny * offset * prop.side };
}

// Turns a sharp-cornered waypoint list into a dense, smoothly-rounded
// point list (straight legs, quadratic-bezier-rounded corners at each
// interior waypoint) — a curved road instead of right-angle bends.
// `radius` is clamped per-corner to at most half of its shorter
// neighboring leg so a short leg's rounding never overshoots into the
// previous/next corner.
function buildRoundedRoadPoints(pts, radius, steps) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const next = pts[i + 1];
    const inDx = curr.x - prev.x;
    const inDy = curr.y - prev.y;
    const inLen = Math.sqrt(inDx * inDx + inDy * inDy) || 1;
    const outDx = next.x - curr.x;
    const outDy = next.y - curr.y;
    const outLen = Math.sqrt(outDx * outDx + outDy * outDy) || 1;
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const beforePt = { x: curr.x - (inDx / inLen) * r, y: curr.y - (inDy / inLen) * r };
    const afterPt = { x: curr.x + (outDx / outLen) * r, y: curr.y + (outDy / outLen) * r };
    out.push(beforePt);
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const mt = 1 - t;
      out.push({
        x: mt * mt * beforePt.x + 2 * mt * t * curr.x + t * t * afterPt.x,
        y: mt * mt * beforePt.y + 2 * mt * t * curr.y + t * t * afterPt.y,
      });
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
const DIRMAP_CORNER_RADIUS = 40;
const DIRMAP_CORNER_STEPS = 12;

// Phaser Text draws its own glyphs onto a small offscreen canvas, then
// uploads that as a texture — with the game's pixelArt:true nearest-
// neighbor filtering (needed to keep sprites crisp), that texture gets
// blown up blockily when Scale.FIT stretches the canvas, reading as
// blurry/muddy instead of sharp. Rendering at a higher internal resolution
// before LINEAR-filtering it back (see addPixelText) fixes this.
const DIRMAP_TEXT_RESOLUTION = 3;

class DirectionMapScene extends Phaser.Scene {
  constructor() {
    super('DirectionMapScene');
  }

  init(data) {
    this.catColorId = (data && data.catColorId) || getSavedCatColor() || 'orange';
  }

  // Every text label in this scene should go through here instead of
  // this.add.text() directly: the higher internal resolution rasterizes
  // glyphs more crisply, and — the fix that actually matters — this
  // switches the text's own texture back to LINEAR filtering, since the
  // game-wide pixelArt:true default (NEAREST, correct for sprites) makes
  // text alias into illegible mush.
  addPixelText(x, y, text, style) {
    const t = this.add.text(x, y, text, { ...style, resolution: DIRMAP_TEXT_RESOLUTION });
    t.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    return t;
  }

  preload() {
    // Guarded the same way as every load call here — LibraryScene has
    // always already loaded the cat spritesheets by the time this scene
    // can be reached (only launched from LibraryScene's shelf-08 menu),
    // but re-declaring an existing key throws, so check first.
    CAT_COLOR_ORDER.forEach((id) => {
      const c = CAT_COLORS[id];
      if (!this.textures.exists(c.key)) {
        this.load.spritesheet(c.key, c.path, { frameWidth: 64, frameHeight: 64 });
      }
    });
    Object.entries(DIRMAP_ASSET_FILES).forEach(([key, file]) => {
      const textureKey = `dirmap-${key}`;
      if (!this.textures.exists(textureKey)) {
        this.load.image(textureKey, `../../assets/images/lesson/${file}`);
      }
    });
  }

  create() {
    // Draw the background immediately so the screen isn't blank while
    // fonts finish loading below — everything that actually NEEDS the
    // real fonts waits in buildScene().
    this.add.rectangle(0, 0, 768, 480, DIRMAP_COLORS.cream).setOrigin(0, 0).setDepth(0);
    const loadingText = this.add.text(384, 240, 'Loading…', {
      fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#3D3875',
    }).setOrigin(0.5).setDepth(999);

    this.ensureDirmapFontsReady().then(() => {
      loadingText.destroy();
      this.buildScene();
    });
  }

  // Phaser rasterizes each Text object onto its own canvas using whatever
  // font is ACTUALLY available in the browser at that exact instant — if
  // Datatype/DotGothic16 haven't finished loading yet, the text bakes in
  // using the browser's fallback font, and Phaser never re-renders it once
  // the real font arrives later. Gate every this.add.* call in the scene
  // behind this resolving first, verified live via document.fonts.check()
  // rather than assumed from the fontFamily string being correct.
  async ensureDirmapFontsReady() {
    try {
      await Promise.all([
        document.fonts.load('16px "Datatype"'),
        document.fonts.load('16px "DotGothic16"'),
        document.fonts.ready,
      ]);
    } catch (e) {
      // Font Loading API unsupported or the load itself failed — proceed
      // anyway rather than block the scene forever; worst case is the
      // pre-fix fallback-font behavior, not a stuck loading screen.
    }
  }

  buildScene() {
    registerCatAnimations(this);
    this.drawRoad();
    this.placeHeaderBanner();
    this.placeCompass();
    this.placeHouse();

    DIRMAP_BUILDINGS.forEach((b) => {
      const pos = resolveDirmapPropPosition(b);
      const img = this.add.image(pos.x, pos.y, `dirmap-${b.key}`).setScale(b.scale).setDepth(5);
      this.addPixelText(pos.x, pos.y + img.displayHeight / 2 + 8, b.label, {
        fontFamily: DIRMAP_JP_FONT, fontSize: '13px', color: '#3D3875',
      }).setOrigin(0.5).setDepth(6);
    });

    this.placeStation();

    // Every building image (+ label margin), used by showJunction/
    // onArrival to pick a panel position that's actually clear of them —
    // measured real bounds, not assumed from the layout data.
    this.propExclusionRects = this.children.list
      .filter((o) => o.type === 'Image' && o.texture && o.texture.key && o.texture.key.startsWith('dirmap-') && o.texture.key !== 'dirmap-compass')
      .map((o) => {
        const r = o.getBounds();
        return { x: r.x - 10, y: r.y - 10, width: r.width + 20, height: r.height + 40 };
      });

    const start = DIRECTION_ROUTE[0];
    const catColor = CAT_COLORS[this.catColorId];
    this.playerSprite = this.add.sprite(start.x, start.y, catColor.key).setDepth(20);
    this.playerSprite.play(`${this.catColorId}-idle`);

    this.routeIndex = 0;
    this.advanceRoute();
  }

  // This page's own DOM header (#gameHUD) visually sits on top of the
  // canvas' top edge — confirmed via getBoundingClientRect(), not assumed
  // from a fixed pixel guess, since the overlap in canvas-internal units
  // depends on Phaser's current Scale.FIT zoom factor, which changes with
  // viewport size.
  getHeaderSafeY() {
    try {
      const header = document.getElementById('gameHUD');
      const canvas = this.sys.game.canvas;
      if (!header || !canvas) return 90;
      const headerRect = header.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const scale = canvasRect.height / 480;
      if (scale <= 0) return 90;
      return Math.max(0, (headerRect.bottom - canvasRect.top) / scale);
    } catch (e) {
      return 90;
    }
  }

  // Centered banner naming the goal — kept narrower than the full canvas
  // width so the compass (top-right corner) still has a clear spot beside
  // it instead of the two fighting over the same strip.
  placeHeaderBanner() {
    const y = this.getHeaderSafeY() + 20;
    const text = 'Help Neko reach Eki by clicking the correct road!';
    const style = { fontFamily: DIRMAP_LATIN_FONT, fontSize: '11px' };
    const measure = this.addPixelText(0, 0, text, style).setVisible(false);
    const w = measure.width;
    const h = measure.height;
    measure.destroy();
    this.add.rectangle(384, y, w + 26, h + 12, 0x2b2864, 0.92).setStrokeStyle(2, DIRMAP_COLORS.terracotta).setDepth(2);
    this.addPixelText(384, y, text, { ...style, color: '#F2B45C' }).setOrigin(0.5).setDepth(3);
  }

  // Purely decorative, tucked in the corner clear of the banner and the
  // road/buildings — not part of propExclusionRects, so it never blocks a
  // junction panel from using that corner.
  placeCompass() {
    this.add.image(710, this.getHeaderSafeY() + 40, 'dirmap-compass').setScale(0.045).setDepth(4);
  }

  // The house the cat starts from — drawn BELOW WP0 (not centered on it),
  // since the player sprite sits exactly at WP0 and a house drawn at the
  // same point was fully hidden behind the cat (measured/reported).
  placeHouse() {
    const start = DIRECTION_ROUTE[0];
    const houseY = start.y + 42;
    const img = this.add.image(start.x, houseY, 'dirmap-house').setScale(0.05).setDepth(5);
    this.addPixelText(start.x, houseY + img.displayHeight / 2 + 7, '家', {
      fontFamily: DIRMAP_JP_FONT, fontSize: '13px', color: '#3D3875',
    }).setOrigin(0.5).setDepth(6);
    this.addPixelText(start.x, houseY + img.displayHeight / 2 + 20, 'START HERE', {
      fontFamily: DIRMAP_LATIN_FONT, fontSize: '9px', color: '#8FA68E',
    }).setOrigin(0.5).setDepth(6);
  }

  // Larger than every other building (matches the size bump the game
  // already uses to call out "this is the destination"), plus a small pin
  // marker above it and a GOAL tag for a second, unambiguous cue.
  placeStation() {
    const goal = DIRECTION_ROUTE[DIRECTION_ROUTE.length - 1];
    const img = this.add.image(goal.x, goal.y, 'dirmap-station').setScale(0.07).setDepth(7);
    const pin = this.add.graphics().setDepth(8);
    const pinY = goal.y - img.displayHeight / 2 - 16;
    pin.fillStyle(DIRMAP_COLORS.terracotta, 1);
    pin.fillCircle(goal.x, pinY, 8);
    pin.fillTriangle(goal.x - 6, pinY + 6, goal.x + 6, pinY + 6, goal.x, pinY + 18);
    this.addPixelText(goal.x, goal.y + img.displayHeight / 2 + 8, '駅', {
      fontFamily: DIRMAP_JP_FONT, fontSize: '16px', color: '#3D3875',
    }).setOrigin(0.5).setDepth(9);
    this.addPixelText(goal.x, goal.y + img.displayHeight / 2 + 26, 'GOAL', {
      fontFamily: DIRMAP_LATIN_FONT, fontSize: '9px', color: '#C97B63',
    }).setOrigin(0.5).setDepth(9);
  }

  drawRoad() {
    const pts = buildRoundedRoadPoints(
      DIRECTION_ROUTE.map((wp) => ({ x: wp.x, y: wp.y })),
      DIRMAP_CORNER_RADIUS, DIRMAP_CORNER_STEPS,
    );
    const road = this.add.graphics().setDepth(1);
    road.lineStyle(22, DIRMAP_COLORS.sage, 1);
    road.beginPath();
    road.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) road.lineTo(pts[i].x, pts[i].y);
    road.strokePath();
    road.lineStyle(16, DIRMAP_COLORS.cream, 1);
    road.beginPath();
    road.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) road.lineTo(pts[i].x, pts[i].y);
    road.strokePath();

    const centerline = this.add.graphics().setDepth(2);
    centerline.lineStyle(3, DIRMAP_COLORS.gold, 1);
    this.drawDashedPath(centerline, pts);
  }

  // Dashes by cumulative distance along the WHOLE point list rather than
  // per-original-segment, so the dash pattern flows continuously through
  // a rounded corner instead of resetting at every one of
  // buildRoundedRoadPoints' short curve sub-segments.
  drawDashedPath(g, pts) {
    const dashLen = 10;
    const gapLen = 8;
    let dashOn = true;
    let remaining = dashLen;
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      let a = pts[i - 1];
      const b = pts[i];
      let segLen = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
      while (segLen > 0) {
        const step = Math.min(remaining, segLen);
        const nx = a.x + (b.x - a.x) * (step / (segLen || 1));
        const ny = a.y + (b.y - a.y) * (step / (segLen || 1));
        if (dashOn) g.lineTo(nx, ny); else g.moveTo(nx, ny);
        a = { x: nx, y: ny };
        segLen -= step;
        remaining -= step;
        if (remaining <= 0) {
          dashOn = !dashOn;
          remaining = dashOn ? dashLen : gapLen;
        }
      }
    }
    g.strokePath();
  }

  // A junction pauses for the click-quiz; the null-`correct` final
  // waypoint (the station) just arrives.
  advanceRoute() {
    const wp = DIRECTION_ROUTE[this.routeIndex];
    if (wp.correct) {
      this.showJunction(wp, () => this.walkNextLeg());
    } else if (this.routeIndex < DIRECTION_ROUTE.length - 1) {
      this.walkNextLeg();
    } else {
      this.onArrival();
    }
  }

  walkNextLeg() {
    const from = this.routeIndex;
    const to = from + 1;
    this.tweenCatTo(from, to, () => {
      this.routeIndex = to;
      this.advanceRoute();
    });
  }

  tweenCatTo(fromIdx, toIdx, onComplete) {
    const from = DIRECTION_ROUTE[fromIdx];
    const to = DIRECTION_ROUTE[toIdx];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    this.playerSprite.play(`${this.catColorId}-walk-${dir}`);
    this.tweens.add({
      targets: this.playerSprite,
      x: to.x,
      y: to.y,
      duration: 700,
      ease: 'Linear',
      onComplete: () => {
        this.playerSprite.play(`${this.catColorId}-idle`);
        onComplete();
      },
    });
  }

  // Cut-corner pixel-border panel (LessonBox's stepped-corner language,
  // approximated as a single flat corner cut) — shared by showJunction and
  // onArrival so both popups stay visually consistent.
  drawCutCornerPanel(cx, cy, w, h, fillColor, strokeColor, strokeWidth, cut) {
    const l = cx - w / 2;
    const r = cx + w / 2;
    const t = cy - h / 2;
    const b = cy + h / 2;
    const pts = [
      { x: l + cut, y: t }, { x: r - cut, y: t },
      { x: r, y: t + cut }, { x: r, y: b - cut },
      { x: r - cut, y: b }, { x: l + cut, y: b },
      { x: l, y: b - cut }, { x: l, y: t + cut },
    ];
    const g = this.add.graphics();
    g.fillStyle(fillColor, 1);
    g.lineStyle(strokeWidth, strokeColor, 1);
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
    g.closePath();
    g.fillPath();
    g.strokePath();
    return g;
  }

  // The click-to-choose junction: a prompt plus three buttons (always the
  // same three words, fixed order — see DIRMAP_CHOICE_ORDER), each showing
  // its kana + romaji. Clicking the correct one flashes it green and
  // advances; clicking a wrong one shakes it red and stays open so the
  // player can try again — no auto-advance, the player has to get it
  // right. Sized from real measured text/button dimensions, positioned via
  // a corner-search against propExclusionRects (bottom-center first) so it
  // never lands on a building.
  showJunction(wp, onCorrect) {
    const depth = 500;
    const promptStyle = { fontFamily: DIRMAP_LATIN_FONT, fontSize: '9px', color: '#9d97c9' };
    const promptText = 'Which way now?';
    const measurePrompt = this.addPixelText(0, 0, promptText, promptStyle).setVisible(false);
    const promptW = measurePrompt.width;
    const promptH = measurePrompt.height;
    measurePrompt.destroy();

    const btnW = 76;
    const btnH = 44;
    const btnGap = 8;
    const padding = 10;
    const rowGap = 6;
    const totalBtnW = DIRMAP_CHOICE_ORDER.length * btnW + (DIRMAP_CHOICE_ORDER.length - 1) * btnGap;
    const panelW = Math.max(promptW, totalBtnW) + padding * 2;
    const panelH = promptH + rowGap + btnH + padding * 2;

    const headerSafeY = this.getHeaderSafeY() + 60;
    const minX = panelW / 2 + 10;
    const maxX = 768 - panelW / 2 - 10;
    const minY = headerSafeY + panelH / 2;
    const maxY = 480 - panelH / 2 - 10;
    const candidates = [
      { x: 384, y: maxY },
      { x: minX, y: maxY },
      { x: maxX, y: maxY },
      { x: 384, y: minY },
      { x: minX, y: minY },
      { x: maxX, y: minY },
    ];
    const overlapsAny = (rect, rects) => rects.some((r) => (
      rect.x < r.x + r.width && rect.x + rect.width > r.x && rect.y < r.y + r.height && rect.y + rect.height > r.y
    ));
    let cx = candidates[0].x;
    let cy = candidates[0].y;
    for (const candidate of candidates) {
      const rect = { x: candidate.x - panelW / 2, y: candidate.y - panelH / 2, width: panelW, height: panelH };
      if (!overlapsAny(rect, this.propExclusionRects)) {
        cx = candidate.x;
        cy = candidate.y;
        break;
      }
    }

    const panel = this.drawCutCornerPanel(cx, cy, panelW, panelH, 0x2b2864, DIRMAP_COLORS.terracotta, 2, 8).setDepth(depth);
    const promptObj = this.addPixelText(cx, cy - panelH / 2 + padding, promptText, promptStyle).setOrigin(0.5, 0).setDepth(depth + 1);

    const by = cy - panelH / 2 + padding + promptH + rowGap + btnH / 2;
    let bx = cx - totalBtnW / 2 + btnW / 2;
    const buttons = [];
    const texts = [promptObj];
    let resolved = false;
    const btnFill = 0x3d3875;

    DIRMAP_CHOICE_ORDER.forEach((choiceId) => {
      const choice = DIRMAP_CHOICES[choiceId];
      const thisBx = bx;
      const btnRect = this.add.rectangle(thisBx, by, btnW, btnH, btnFill)
        .setStrokeStyle(2, DIRMAP_COLORS.terracotta)
        .setDepth(depth + 1)
        .setInteractive({ useHandCursor: true });
      const kanaText = this.addPixelText(thisBx, by - 9, choice.kana, {
        fontFamily: DIRMAP_JP_FONT, fontSize: '13px', color: '#F2B45C',
      }).setOrigin(0.5).setDepth(depth + 2);
      const romajiText = this.addPixelText(thisBx, by + 11, choice.romaji, {
        fontFamily: DIRMAP_LATIN_FONT, fontSize: '8px', color: '#F3EFE6',
      }).setOrigin(0.5).setDepth(depth + 2);
      buttons.push(btnRect);
      texts.push(kanaText, romajiText);

      btnRect.on('pointerdown', () => {
        if (resolved) return;
        if (choiceId === wp.correct) {
          resolved = true;
          btnRect.setFillStyle(DIRMAP_COLORS.sage);
          this.time.delayedCall(320, () => {
            panel.destroy();
            texts.forEach((t) => t.destroy());
            buttons.forEach((b) => b.destroy());
            onCorrect();
          });
        } else {
          btnRect.setFillStyle(0xa4453a);
          this.tweens.add({
            targets: [btnRect, kanaText, romajiText],
            x: thisBx + 6,
            duration: 45,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
              btnRect.setFillStyle(btnFill);
              btnRect.x = thisBx;
              kanaText.x = thisBx;
              romajiText.x = thisBx;
            },
          });
        }
      });

      bx += btnW + btnGap;
    });
  }

  onArrival() {
    const depth = 600;
    const panelW = 240;
    const panelH = 66;
    const headerSafeY = this.getHeaderSafeY() + 60;
    const minX = panelW / 2 + 10;
    const maxX = 768 - panelW / 2 - 10;
    const minY = headerSafeY + panelH / 2;
    const maxY = 480 - panelH / 2 - 10;
    const candidates = [
      { x: 384, y: maxY },
      { x: minX, y: maxY },
      { x: maxX, y: maxY },
      { x: 384, y: minY },
    ];
    const overlapsAny = (rect, rects) => rects.some((r) => (
      rect.x < r.x + r.width && rect.x + rect.width > r.x && rect.y < r.y + r.height && rect.y + rect.height > r.y
    ));
    let cx = candidates[0].x;
    let cy = candidates[0].y;
    for (const candidate of candidates) {
      const rect = { x: candidate.x - panelW / 2, y: candidate.y - panelH / 2, width: panelW, height: panelH };
      if (!overlapsAny(rect, this.propExclusionRects)) {
        cx = candidate.x;
        cy = candidate.y;
        break;
      }
    }
    const panel = this.drawCutCornerPanel(cx, cy, panelW, panelH, 0x2b2864, DIRMAP_COLORS.terracotta, 2, 8)
      .setDepth(depth)
      .setInteractive(new Phaser.Geom.Rectangle(cx - panelW / 2, cy - panelH / 2, panelW, panelH), Phaser.Geom.Rectangle.Contains);
    this.addPixelText(cx, cy - 14, '駅に着きました！', {
      fontFamily: DIRMAP_JP_FONT, fontSize: '15px', color: '#F2B45C',
    }).setOrigin(0.5).setDepth(depth + 1);
    this.addPixelText(cx, cy + 8, 'Eki ni tsukimashita! — Arrived!', {
      fontFamily: DIRMAP_LATIN_FONT, fontSize: '8px', color: '#F3EFE6',
    }).setOrigin(0.5).setDepth(depth + 1);
    this.addPixelText(cx, cy + 22, '[Enter] back to the library', {
      fontFamily: DIRMAP_LATIN_FONT, fontSize: '7px', color: '#9d97c9',
    }).setOrigin(0.5).setDepth(depth + 1);

    const goBack = () => {
      this.scene.stop('DirectionMapScene');
      this.scene.resume('LibraryScene');
    };
    this.input.keyboard.once('keydown-ENTER', goBack);
    panel.on('pointerdown', goBack);
  }
}

const n5PhaserGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'phaserGame',
  width: 768,
  height: 480,
  // Without this, Phaser defaults to bilinear texture filtering + a
  // smoothed canvas — fine for photos, but it blurs every pixel-art
  // sprite in the game, especially anything scaled up by Scale.FIT
  // stretching the 768x480 canvas to fill a larger viewport. pixelArt: true turns off
  // antialiasing, forces nearest-neighbor texture sampling, snaps sprite
  // positions to whole pixels (roundPixels), and sets the canvas' own
  // CSS image-rendering to pixelated — the standard fix for "why is my
  // retro game blurry" in Phaser, and confirmed working for sprites.
  //
  // IMPORTANT GOTCHA — this setting also applies nearest-neighbor
  // filtering to every Text object's texture, which is wrong for text:
  // sprites need nearest (no smoothing) when magnified, but Text glyphs
  // are drawn at a small native size and need to be sampled smoothly
  // (LINEAR) or they alias into illegible mush — confirmed by directly
  // inspecting a live Text object's WebGL texture (magFilter/minFilter
  // were 9728 = gl.NEAREST). Neither a top-level `resolution` field nor
  // `scale.zoom` fixed this (both tested live — neither actually changed
  // the canvas' real pixel buffer size, g.canvas.width stayed 768 either
  // way). The actual fix is per-object: every Text this game creates
  // must call `.texture.setFilter(Phaser.Textures.FilterMode.LINEAR)`
  // right after creation to override this default back to smooth
  // sampling — see DirectionMapScene's addPixelText() for the pattern.
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [CatSelectScene, LibraryScene, DirectionMapScene],
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
