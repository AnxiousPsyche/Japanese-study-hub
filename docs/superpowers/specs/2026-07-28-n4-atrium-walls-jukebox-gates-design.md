# N4/N3 Mezzanine — Atrium, Walls, Jukebox, N2/N1 Gates — Design Spec

## Goal

Four fixes/additions to the already-live N4/N3 mezzanine
(`assets/js/n4-phaser-game.js`, `pages/N4/n4-dashboard.html`,
`assets/css/n4-mezzanine.css`), scoped as one pass since they touch the
same file and share patterns:

1. The atrium doesn't actually read as open — no visual sightline to the
   first floor.
2. The brick wall texture tiles too small/tight.
3. A jukebox decorative prop (art already supplied) is missing.
4. Two new exam gates — N2 and N1 — need to exist in the **left wing**
   (intentionally breaking the natural N4→N3→N2→N1 order, per explicit
   instruction).

This is a polish/extension pass on an existing floor, not a new floor —
no new scene, no new persistence namespace. Follows the project's
established no-framework, plain-function style (`CLAUDE.md`); the
"component" language below means small reusable JS functions in
`library-scene-shared.js`, not a formal UI framework layer.

## Current-state findings (why each fix is needed)

- `buildAtrium()` (`n4-phaser-game.js`) fills the atrium rect with two flat
  colors (`0x160f0c` / `0x27170f`), draws plank/rail trim, and floats
  "OPEN ATRIUM / FIRST-FLOOR LIBRARY" text over it. There is no rendered
  lower-floor content — the label is the only thing implying depth.
- Wall bricks are a single `16×16` crop (`ASSET_RECTS.brickTile`) from
  `floors-walls02.png`, tiled 1:1 at `TILE_SIZE=16` across the top/bottom
  and side wall strips (`buildWalls()`) — a genuinely tight, small repeat.
- Jukebox art already exists at `assets/images/ui/jukebox-Original.png`
  (confirmed present).
- Exam gates (`buildExamGate()`) are **not** bespoke locked/unlocked door
  sprites today — N4 and N3's gates both reuse the same book-pile texture
  crop (`bookPileTall`, via `this.bookPileTexKey`), scaled up (1.3x) with
  a text label above, and dimmed to `alpha 0.55` while locked
  (`refreshAllStates()` in `library-scene-shared.js`, line ~442). There's
  no texture swap for gates (unlike shelves, which do have
  `lockedKey`/`filledKey` pairs). Per your decision, N2/N1 match this
  same lightweight pattern rather than introducing new bespoke door art.
- `n4-dashboard.html` does not load `music-player.js`; no audio asset was
  supplied for the jukebox. The jukebox is therefore visual-only in this
  pass (see Item 3).

## Component architecture

Three small reusable factories move into `library-scene-shared.js`
(usable by a future floor, not just this one) alongside the existing
`cropToTexture`/`drawWovenRug`-style helpers already there:

- **`buildOpenAtriumVoid(scene, config)`** — draws an illustrated
  "lower-floor" void (procedural Graphics, no new image assets) instead
  of a flat fill. `config: { left, top, width, height, label }`.
- **`createBrickWallTexture(scene, key, config)`** — procedural brick
  texture generator (Canvas-drawn, same technique as the existing
  wood-plank floor texture), replacing the current image-crop tiling.
  `config: { blockW, blockH, mortarColor, brickColors[] }`. Returns a
  texture key ready to tile.
- **`createDecorativeProp(scene, config)`** — generic non-solid,
  interactive decorative prop. `config: { x, y, textureKey, onClick,
  label }`. Used for the jukebox; reusable for any future one-off prop.

In `n4-phaser-game.js`, `buildExamGate()`'s hand-duplicated N4/N3 block
collapses into one factory, called 4× instead of 2×:

- **`createExamGateEntry(scene, config)`** — `config: { id, title, x, y,
  requires, quizGateKey, onPass, textureKey, scale }`. Builds the sprite,
  glow/stamp text, interactive wiring, and the `interactives` entry —
  identical output to what `buildExamGate()` hand-writes today for N4/N3,
  just not copy-pasted a 3rd and 4th time.

None of these introduce new state management, new persistence, or a
props/lifecycle system beyond what Phaser + the existing
`refreshAllStates()` sweep already provide — consistent with your call to
keep this in the existing lightweight style.

## Item 1 — Atrium sightline

Replace `buildAtrium()`'s flat two-color fill with `buildOpenAtriumVoid()`:
a darker/desaturated procedural floor-tile pattern (small rectangles, not
image crops) + a handful of small silhouette shelf/bookcase blocks placed
to suggest receding first-floor furniture + a soft vertical gradient
(brighter near the rail edges, darker toward center) implying depth. All
drawn under the existing plank-frame/rail-cap decoration (kept as-is) and
under the "OPEN ATRIUM" label (kept, now sitting over actual illustrated
content instead of blank fill). Pure `Phaser.GameObjects.Graphics` +
existing Canvas-texture technique — no new image loads, no perf cost
beyond current (static draw, not per-frame).

## Item 2 — Wall/brick scale

Replace the `cropToTexture`-based 16×16 brick tile with
`createBrickWallTexture()`: a larger procedural brick block (target
32×32px per unit — 2x current) with mortar lines and light per-brick
shading variation, drawn once to a Canvas texture (same pattern as the
existing wood-plank floor generator) and tiled across the wall strips at
the new size.

Edge case — tile remainder: wall strips run along a fixed world-pixel
length (`WORLD_W`/wall-strip height are constants, not a responsive
viewport — this game renders to one fixed internal resolution; the outer
page just scales/letterboxes that canvas, so no responsive tiling concern
exists beyond this fixed strip). Where a strip's length isn't an exact
multiple of the new block size, the trailing tile at each strip's far end
draws a partial-width/height source-rect slice instead of leaving a gap
or overflowing past the strip boundary.

## Item 3 — Jukebox prop

Load `assets/images/ui/jukebox-Original.png`, place via
`createDecorativeProp()` along the rear walkway (visible from both
wings, clear of shelf traffic — exact coordinates picked in
implementation against `LAYOUT`/walkway geometry). Non-solid, same
reasoning as every other interactive on this floor (keeps auto-walk
routing simple). Click → `showToast()` flavor line + a small
floating-note particle flourish (reuses the existing sparkle-particle
pattern from `spawnPassSparkle`, swapped to a note-style glyph). No real
audio wiring in this pass — flagged in the prior message; revisit if you
want actual playback later.

## Item 4 — N2/N1 gates, left wing

New `EXAM_GATE_DATA.n2` / `.n1` entries (own `id`, `title`, own
localStorage `quizGateKey` per the existing
`loadQuizGateState(quizGateKey)`/`saveQuizGateState` pattern — already
parameterized, no changes needed there). Built via two more
`createExamGateEntry()` calls, both placed in the **left wing** (N4's
side), per your explicit instruction to break the natural
N4→N3→N2→N1 left/right progression. Visually identical to today's N4/N3
gates: reused pile texture, ~1.3x scale, label above ("N2 EXAM GATE" /
"N1 EXAM GATE"), alpha-dimmed while locked, full opacity + toast on
unlock. `requires` left empty (`[]`) like N4's own gate, since nothing in
this pass wires them into the real shelf-prereq chain — they exist as
placed, functional, locked-until-passed landmarks, not as gates blocking
new shelf content (no N2/N1 shelves are being built this pass).

Placement: left wing's open floor, clear of the 12 existing N4 shelves —
likely near the rear walkway (north end of the left wing), symbolically
reading as "further floors, already visible from here" rather than
crowding the existing N4 gate near the entry. Exact pixel coordinates
finalized during implementation.

## Data flow / persistence

No new persistence design: N2/N1 gates reuse the exact existing
`nekoBunko.n4.*`-style quiz-gate state shape
(`{attemptsUsed, lockedUntil}`) under their own keys, read through the
already-parameterized `getQuizGateStatus(quizGateKey)` — the same
function N4/N3 already call. Same 3-attempt/24h-cooldown mechanic,
unchanged.

## Edge cases

- **Gate rendered before localStorage exam state loads**: already
  handled — `loadQuizGateState()` returns a safe
  `{attemptsUsed:0, lockedUntil:null}` default on missing/corrupt data
  (existing try/catch pattern). N2/N1 get this for free via the same
  function.
- **Jukebox clicked with no audio loaded**: moot — this pass is
  visual-only, nothing to fail to load.
- **Wall tiles at strip lengths that don't divide evenly**: partial
  trailing tile (Item 2, above).
- **Different canvas/viewport sizes**: not applicable beyond the above —
  fixed internal world/camera resolution, no responsive canvas layout to
  break.

## Accessibility

No new DOM-layer HUD controls are in scope this pass (only in-canvas
gates/prop were requested — no N2/N1 HUD shortcut buttons, unlike the
existing N3-gate HUD button). If those get added later, they'd follow the
existing HUD button's baseline (real `<button>`, visible focus outline,
`aria-label`) rather than a div/span click target. The Phaser `<canvas>`
content itself has the same inherent accessibility ceiling every
interactive on this floor already has (mouse/keyboard-via-arrow-movement,
not a screen-reader-navigable DOM) — not something this pass changes or
regresses.

## Testing / verification

- `node --check assets/js/n4-phaser-game.js` and
  `node --check assets/js/library-scene-shared.js` after edits.
- Live verification on a fresh, never-before-used preview port (this
  project's documented stale-JS-cache gotcha):
  - Atrium reads as an open void with visible depth/silhouette content
    from both wings (screenshot).
  - Wall brick blocks are visibly larger/less repetitive (screenshot,
    close on a shelf-against-wall view like "Comparisons").
  - Jukebox renders at its placed position, is clickable, shows the
    toast/particle flourish, doesn't block pathing to nearby shelves.
  - N2 and N1 gates render in the left wing, locked-dim state by
    default; simulate a passed exam (write a passing `quizGate` state
    directly to `localStorage` for that gate's key, or walk through the
    real quiz flow) and confirm both flip to unlocked/full-opacity with
    the unlock toast.
  - No regression to existing N4/N3 shelves, review piles, or the
    existing N4/N3 exam gates' own behavior.

## Out of scope for this pass

- Real audio playback for the jukebox.
- Any N2/N1 shelf content, review piles, or real prereq-chain wiring
  beyond the two standalone gate landmarks.
- New HUD shortcut buttons for N2/N1 (only the N3 gate has one today).
- Retrofitting N4/N3's existing gates to bespoke door art (explicitly
  deferred per your "match current lightweight pattern" choice).
