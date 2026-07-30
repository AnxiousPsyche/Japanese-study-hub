# N4 Mezzanine Polish — Summary

Related specs: [2026-07-27-n4-second-floor-design.md](2026-07-27-n4-second-floor-design.md),
[2026-07-28-n4-atrium-walls-jukebox-gates-design.md](2026-07-28-n4-atrium-walls-jukebox-gates-design.md)

(This session was iterative live-feedback polish on top of those two specs, not
a new formal design — no separate plan.md/design.md pair was written; this
summary is the record of what changed.)

## What's changing

A round of visual/layout fixes to N4's mezzanine scene
(`assets/js/n4-phaser-game.js`, `assets/js/library-scene-shared.js`),
driven by live screenshots from the running game rather than code review
alone:

- **Frosted N3 threshold wall (`buildN3Mist()`).** The center-corridor
  carpet is gone; the frosted "sealed" wall that replaced it now runs as
  two segments — flush against the underside of the top wall header
  (no gap of bare brick above it) down to the atrium's top edge, and
  from the atrium's bottom edge down to the south wall's own top edge
  (previously stopped short, leaving a stretch of unfrosted floor). The
  open atrium void itself is deliberately left unfrosted — it already
  has its own rope-and-brass fence/collision, and a frosted panel
  floating across an open two-story space read as wrong. A "N3 SEALED /
  COMPLETE N4 TO ENTER" label sits in the north segment.
- **Southwest corner (`buildFurniture()`'s arrival rug).** The
  small stair-tread landmark that used to sit here was removed entirely
  (redundant — N5's own staircase gate already gates entry to this
  floor). The arrival rug is now the only decor at the corner, anchored
  flush against the true corner (just past the single outer border
  tile, not `buildWalls()`'s wider inner brick strip, which was leaving
  a visible gap/seam before), with the player spawn re-centered on it.
- **Shelves (`buildShelves()`).** `shelfW`/`shelfH` used to be a fixed
  87x64 box with the shelf art (a tall ~88x120-139 portrait crop)
  forced into it via non-uniform `setDisplaySize`, squashing it to
  about half its real height — reading as a flattened, nearly
  featureless strip. Shelves are now sized via a uniform `setScale`
  derived from the tallest of the 4 crop variants (so a completed shelf
  can't render taller than its row budget), landing on ~73x100 —
  recognizable bookshelf proportions, checked against the real
  `libassetpack-tiled.png` crop. `LAYOUT`'s wing-row spacing
  (`wing1RowY`/`wing2RowY`/`wing3RowY`, `rowStep`) was widened to match;
  verified at worst-case (every shelf forced to its tallest filled
  texture) with zero overlaps across all 24 shelves.
- **Jukeboxes (`buildJukebox()`).** Moved from deep in the south half of
  the map up to sit in front of the north wall header (mirrored, one
  per side), and scaled down (0.16 → 0.12) per explicit feedback.
- **Open atrium void (`buildOpenAtriumVoid()` in
  `library-scene-shared.js`).** Was a deliberately near-black
  desaturated silhouette — read as an empty hole rather than a floor.
  Two `Phaser.Game` instances can't share a live scene (N4 and N5 are
  separate games on separate HTML pages), so this can't be a literal
  peek into the running N5 scene; it's now lit brightly enough to read
  as a real, occupied room, tinted in N5's own warm reception-red
  palette (new optional `floorBase`/`floorTileA`/`floorTileB`/
  `shelfColor` config, defaulting to that palette since N4 is this
  function's only caller). The "OPEN ATRIUM" label below it now
  explicitly reads "N5 FIRST-FLOOR LIBRARY".
- **Exam gates (`buildExamGate()`).** The separate "N4 Entrance Exam"
  book-pile interactive is gone entirely (redundant — reaching N4 at
  all already means N5's staircase gate was passed). `n4-shelf-01`'s
  prereq was cleared to `null` accordingly. The N3 unlock exam
  (already an invisible click-hitbox, presented via the frosted wall
  rather than a physical pile) is now positioned centered *inside* the
  frosted wall's south segment instead of off to the side near the
  shelf column, so a player standing at the wall is within
  `TRIGGER_RANGE` of it.

## Deliberately not in this pass

- The atrium void is a stylized, statically-tinted illustration of "N5's
  floor," not a live or literal rendering of the actual N5 scene —
  confirmed technically infeasible (separate Phaser game instances,
  separate HTML pages) rather than skipped for time.
- Filled shelf textures (once a shelf is completed) render a few px
  taller than the locked texture at the same fixed scale — accepted as
  a minor, uniform-safe tradeoff rather than adding per-texture
  non-uniform scaling back in.

## Files touched

- `assets/js/n4-phaser-game.js`
- `assets/js/library-scene-shared.js`

## Verification

Live, not just static review: served the repo root
(`python -m http.server 8080`) and drove the actual running game via the
Claude-in-Chrome extension — screenshots at each step, plus direct Phaser
scene introspection (`n4PhaserGame`/`window.Phaser`, both reachable
un-namespaced since classic `<script>` globals share the page's real
world, not the extension's isolated one) to read exact sprite bounds,
camera scroll, and interactive positions rather than estimating from
screenshots alone. Confirmed: zero shelf-to-shelf overlap at worst-case
(all-filled) texture size; the N3 exam gate is within trigger range of a
player standing at the frosted wall; no console errors on load.
