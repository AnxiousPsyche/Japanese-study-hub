# N4 Second Floor — Design Spec

## Goal

Add a second, explorable Phaser floor for JLPT N4 content, reached from the
existing N5 library's staircase ("Proceed to N4," currently a stub toast at
`n5-phaser-game.js`'s `openQuizGateMenu`). N5's `LibraryScene` is not
redesigned or replaced — N4 is new, additive work that reuses N5's proven
systems (movement, camera-follow, collision, the retro interaction menu,
LessonBox content pipeline, progression/persistence patterns) without
duplicating their code.

This first pass builds the **entire N4 floor's layout and progression
skeleton** — every wing, room, shelf plaque, and review pile placed and
wired into the same lock/available/completed system N5 uses — but most
individual shelves ship with a short placeholder lesson instead of a fully
curated one. A handful of flagship shelves get full content to prove the
content pipeline works unchanged on the new floor.

## Architecture

**Chosen approach: parallel scene + shared helpers module** (not a
parameterized single scene, not a copy-pasted duplicate file).

- `assets/js/library-scene-shared.js` (new): the genuinely reusable,
  self-contained pieces get lifted out of `n5-phaser-game.js` verbatim and
  exposed as plain functions (this project has no bundler/module system —
  everything is `<script src>` globals, so these become global functions
  both scene files call):
  - `cropToTexture(scene, sourceKey, rect, destKey)`
  - `drawWovenRug`, `drawWallHeaderTexture` (or any other canvas-texture
    drawing helpers proven not to be N5-specific)
  - The retro in-canvas menu engine: `buildRetroMenu` and its
    keyboard/click wiring (the same ▶-prefixed dark-panel list used by
    `CatSelectScene`, shelf menus, and review piles)
  - The LessonBox glue: the `startLesson`-style open/onComplete/onClose
    wiring against `window.LessonBox`, `appendGreetingSummary`,
    `resolveConversationTurns`, `resolveDynamicDiagrams` (these already
    take lesson data as a parameter, not hardcoded content, so they lift
    cleanly)
  - Auto-walk pathing (`moveQueue` consumption in `update()`,
    `handleInteractiveClick`'s "route through a clear corridor" logic) —
    generalized to take the corridor X and world bounds as scene-provided
    values instead of reading `WORLD_W`/`WORLD_H` module constants
    directly, since N4 has its own world size
  - Camera-follow setup, physics/collision group setup
    (`wallGroup`/`solidGroup` creation and the invisible-rectangle wall
    pattern)

  `n5-phaser-game.js`'s own copies of these get replaced with calls into
  the shared file (a mechanical extraction, not a rewrite) — this is the
  one N5-file touch this project makes, and it's required to satisfy "do
  not duplicate movement/interaction/collision code." Behavior must stay
  pixel-identical; this is a refactor task with its own verification pass
  before any N4-specific work begins.

- `assets/js/n4-phaser-game.js` (new): `N4LibraryScene extends Phaser.Scene`,
  structured like `LibraryScene` (`buildScene()` calling
  `buildFloor/buildWalls/buildTopBand/buildFurniture/buildShelves/
  buildReception/buildPlayer`, `preload()`, `update()`) but with N4's own:
  - `LAYOUT`/`GRID_COLS`/`GRID_ROWS` (larger world, see Theme below)
  - `LESSON_DATA` (16 N4 shelf titles, grouped into 4 wings)
  - `SHELF_PREREQ` / `BOOK_PILE_DATA` (same shape as N5's, gating every 4
    shelves behind a review pile, mirroring N5's pattern exactly)
  - `LESSON_CONTENT` (N4's own lesson pages — flagship shelves fully
    authored, the rest placeholder pages, see Content Plan)
  - `ASSET_RECTS` — reuses the **same image files** already in
    `assets/images/ui/`, `assets/images/lesson/`, `assets/images/avatars/`
    (no new art packs, per your explicit instruction), with new crop
    rects only where N4's furniture arrangement needs a piece N5 doesn't
    already crop (e.g., a different bookshelf variant for "rare book
    archive" rooms, a research-desk prop for the grammar wing) — each new
    crop gets the same per-pixel verification pass established for every
    other asset in this project (no guessed bounding boxes)

- `pages/N4/n4-dashboard.html` (new): mirrors `pages/N5/n5-dashboard.html`
  — same OS-shell CSS/JS includes, then Phaser + `library-scene-shared.js`
  + `n4-phaser-game.js`.

## Transition (N5 -> N4)

- The staircase's "Proceed to N4" option (`n5-phaser-game.js`,
  `openQuizGateMenu`) changes from `showToast('N4 is coming soon.')` to a
  real page navigation: `window.location.href =
  '../N4/n4-dashboard.html'`. This matches the project's existing
  structure (each JLPT level is already its own dashboard page under
  `pages/<LEVEL>/`) and avoids running two full Phaser game instances in
  one document — the simplest, lowest-risk transition mechanism available,
  reusing what's already there rather than inventing an in-page scene-swap.
- A brief "climbing the stairs..." beat plays before navigating, reusing
  the project's existing teleport/transition CSS
  (`assets/css/teleport.css`) rather than building new transition polish.
- No return-to-N5 stair is built in this pass (out of scope — flagged
  below).

## Theme

Same pixel-art assets, recombined for a "deeper into the library" feel
without new art packs:

- World size increased from N5's 56x149 tiles (896x2384px) to roughly
  72x180 tiles (~1152x2880px) — larger, per your brief, but not
  dramatically so; camera-follow and world bounds work exactly as they do
  in N5 (no fixed camera, no shrinking).
- A distinct accent palette pulled from colors already used elsewhere in
  this project's asset sheets (e.g., a deeper green/burgundy carpet and
  richer wood tones instead of N5's warm red reception), not a new
  invented palette.
- Denser furniture per room (more shelves, reading nooks, archive-style
  clutter) using the same `buildDeskItems`-style clutter pattern N5
  already established for the reception desk, applied to more surfaces.

## Wings & Shelves

Mirrors N5's 16-shelf / 4-review-pile / 1-final-gate shape for
architectural and progression consistency:

| Wing | Shelves | Room theme |
|---|---|---|
| N4 Grammar | 1-4 | Grammar study wing |
| N4 Vocabulary | 5-8 | Vocabulary wing |
| Reading & Listening | 9-12 | Reading corner + archive room |
| Conversation & Practice | 13-16 | Conversation wing |

- 4 review piles, one per wing (same gating pattern as N5's review-1..4).
- 1 "Boss Quiz" staircase gate at the end (same interaction pattern as
  N5's `final-quiz`), stubbed to `showToast('N3 is coming soon.')` — the
  same kind of stub N5 itself shipped with for N4 before this pass.

## Content Plan

- **Flagship shelves (full curated content, same page-type vocabulary as
  N5 — `grammar-intro`/`summary`/`try-it`/`quiz-fill`/etc.):**
  shelf-01 (first Grammar shelf — the player's first N4 impression),
  one Reading & Listening shelf, one Conversation & Practice shelf.
- **All other shelves:** a short placeholder lesson — a single
  `grammar-intro` page naming the topic and noting it's coming soon,
  still wired through the real `LESSON_CONTENT`/progression system (so
  completing it marks progress and unlocks the next shelf) rather than a
  fake/disabled plaque.
- Review piles: same "recap + quiz" shape as N5's, built once flagship
  shelves in that wing exist; wings without a flagship shelf get a short
  placeholder review pile page instead, upgradeable later.

## Testing / Verification

- `node --check` on both new files after every edit (existing project
  convention).
- Live verification via the Browser pane preview tooling on a fresh,
  never-before-used port (per this project's documented stale-cache
  gotcha), checking: scene boots without console errors, player spawns
  and moves, every shelf/review pile/staircase is reachable and opens its
  content, no wall/collision overlaps, and the N5->N4 navigation actually
  lands on the new page.
- The shared-helpers extraction step gets its own before/after
  verification pass on N5 alone (confirm N5 behaves identically) before
  any N4-specific code is written against it.

## Out of scope for this pass (explicitly deferred)

- Full curated lesson content for every N4 shelf (only flagships this
  pass).
- A return staircase from N4 back down to N5.
- The N3 floor (stubbed exactly like N5 stubbed N4).
- Any shared save-slot/cross-floor progress dashboard beyond what already
  exists per-floor.
