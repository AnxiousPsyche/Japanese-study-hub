# N5 Phaser Real Tileset + Library Layout — Design Spec

## Context

Sub-project #1 (the Phaser 3 scaffold — see
[2026-07-08-n5-phaser-scaffold-design.md](2026-07-08-n5-phaser-scaffold-design.md))
is merged to `main`: Phaser 3.90.0 mounts on the N5 dashboard and renders a
placeholder 24×15 tilemap (32px tiles, solid wall border, generated-color
floor) proving the tilemap/camera pipeline works. No real art, no player, no
lesson content yet.

The original migration plan split the remaining work into 9 sub-projects,
with #2 ("tileset decision + real art swap") and #3 ("tilemap layout")
separate. During this session the user identified real, already-downloaded
tile/sprite sheets in `assets/images/ui/` and made concrete placement
decisions (which sheet supplies the carpet, the table, the floor, the
wall/balcony structure). Since those decisions already imply the actual
layout rather than a generic placeholder-with-real-colors checkpoint, the
user chose to **combine #2 and #3 into one sub-project**, this spec. The
remaining roadmap after this sub-project is: player movement + collision,
interaction system, lesson data model + UI panel, review/checkpoint visuals
+ optional locking, cat avatar carry-over, ambient NPC wandering + polish
(6 sub-projects, down from the original 7 for #4-#9).

Several other candidate assets were surveyed and explicitly rejected for
this pass:
- `groundtiles_wood.png` — isometric-diamond tiles, incompatible with the
  locked top-down/orthogonal camera decision from the original brainstorm.
  Not used.
- `Interior1.tmx` (and its `Tiled_files/` companions) — a real, pre-built
  Tiled map, but 16×24 tiles @ 16px (256×384px portrait), a generic
  single-room interior with no staircase/balcony/alcove structure. Doesn't
  match this migration's locked 16:10 landscape aspect or the target
  layout's composition. Not adopted as a base; the layout is hand-built
  instead.
- `Tilemap/`, `interior free/` packs — reviewed, not used for this pass
  (available for future reference if a specific piece is needed later).

## Goals

- Change the tile grid from the scaffold's 24×15 @ 32px to **48×30 @ 16px**.
  Total resolution stays 768×480 (still exactly 16:10, matching
  `#mapFrame`'s CSS `aspect-ratio:16/10`) — only the internal tile-count and
  tile-size constants change. This matches the real assets' native 16px
  tile size with zero upscaling (avoids blur from nearest-neighbor 2×
  scaling of 16px-native art).
- Replace the scaffold's `LibraryScaffoldScene` (generated-color
  placeholder) with a `LibraryScene` that renders the real library layout
  using real art from three sheets already in the repo:
  - `assets/images/ui/furniture03.png` (256×256px) — carpet/rug and table.
  - `assets/images/ui/floors-walls02.png` (288×160px) — floor tiles and
    perimeter wall/brick border.
  - `assets/images/ui/libassetpack-tiled.png` (1488×528px) — the top
    wall/balcony/curtain structure, plus bookshelves/benches/globe/plant
    furniture pieces.
- Build the zone layout (mirroring the original reference composition,
  reinterpreted with these assets) across the 48×30 grid:

  | Rows | Zone | Source |
  |---|---|---|
  | 0–3 | Top wall + entrance alcove (curtain/balustrade strip) | `libassetpack-tiled.png` wall/balcony fragment, tiled across the width |
  | 4–11 | Staircase descending + two flanking balcony/shelf sections | `libassetpack-tiled.png` bookshelves + benches; stair steps improvised from `floors-walls02.png` tiles if no dedicated stair art exists |
  | 12–26 | Main floor: `floors-walls02.png` wood-plank floor tiled throughout; one vertical rug strip down the center (`furniture03.png` rug); 4 symmetrical table+bench+lamp+plant clusters (2 left, 2 right) from `furniture03.png` | mixed |
  | 27–29 | Bottom gate/door, flanked by benches | `libassetpack-tiled.png` / `furniture03.png` |
  | Perimeter (all rows) | Wall/brick border | `floors-walls02.png` brick tile + baseboard trim strip |

- The balcony/shelf zones (rows 4–11) and floor table clusters (rows
  12–26) give the scene enough distinct shelf/table surfaces that a future
  sub-project can plausibly map the 17 `N5_LESSONS` stops onto them — but
  this sub-project does not commit to a specific 1:1 piece-to-lesson
  mapping, placing exactly 17 individually distinguishable furniture
  pieces, or any labeling/signage. That precise mapping is lesson-data and
  interaction-system work, both later sub-projects. This sub-project's job
  is purely a good-looking, correctly-scaled decorative scene with real
  art.

## Non-goals (explicitly deferred)

- **No player sprite, no movement, no collision.** Still a future
  sub-project.
- **No interaction/trigger zones, no "press E" prompt, no lesson popup
  wiring.** The furniture pieces are visually placed but not clickable or
  hoverable yet.
- **No lesson data model changes.** `N5_LESSONS`'s shape and content aren't
  touched by this sub-project — only pulled from later, when interaction
  wiring lands.
- **No review/checkpoint visual distinction, no locking.**
- **No cat avatar/player sprite of any kind** in the Phaser scene — the old
  CSS `.cat` component stays retired (as it has been since sub-project #1).
- **No ambient NPCs.**
- **Exact tile indices and furniture-piece crop rectangles are not pinned
  down in this document.** They're determined during implementation by
  inspecting the three source PNGs directly (both the plan-writer and the
  implementer can view them) — this spec fixes *which* sheet supplies *which*
  zone/piece and the approximate row-band placement, not pixel-exact source
  or destination coordinates.

## Architecture

### Scene rename and restructure

`assets/js/n5-phaser-game.js`'s `LibraryScaffoldScene` is replaced by
`LibraryScene` (the scaffold's placeholder job is done; this is the real
scene going forward). `window.__n5Game` stays exposed the same way
established in sub-project #1.

The scene's `Phaser.Game` config keeps `type: Phaser.AUTO`, `parent:
'phaserGame'`, `width: 768`, `height: 480`, `scale: { mode: Phaser.Scale.FIT,
autoCenter: Phaser.Scale.CENTER_BOTH }` — unchanged from sub-project #1.

### Floor + border: one Tilemap layer

`floors-walls02.png` is loaded as a real image asset (not runtime-generated,
unlike the scaffold's placeholder) and sliced at 16×16px into a Phaser
tileset. A single 48×30 tile-index array builds one tilemap layer via
`this.make.tilemap({ data, tileWidth: 16, tileHeight: 16 })` +
`addTilesetImage` + `createLayer`, extending the exact same construction
pattern sub-project #1 proved out — floor tile indices fill the interior,
brick/wall tile indices form the perimeter border, matching the scaffold's
"same API, different inputs" design intent. Scene property:
`this.floorTilemap` / `this.floorLayer` (renamed from the scaffold's
`libraryTilemap`/`libraryLayer` to reflect this layer's specific role now
that other, non-tilemap layers exist alongside it — see below).

### Wall/balcony structure and furniture: individual sprites, not tile-diced

`libassetpack-tiled.png`'s balcony/curtain fragment is one cohesive,
multi-tile scenic composition, not a repeating tileable pattern — diced into
the tilemap grid it would either repeat awkwardly or need dozens of unique
tile indices for one-time use. Instead it's loaded as a spritesheet/atlas
and rendered as **one static `Phaser.GameObjects.Image`** (or a small
handful, if the fragment needs to be split into left/center/right pieces to
tile across the 768px width) positioned across rows 0–3, layered on top of
the floor tilemap.

Individual furniture pieces — the rug, the table, benches, lamps, plants,
bookshelves — are each their own cropped `Phaser.GameObjects.Image`, sourced
from `furniture03.png` and `libassetpack-tiled.png` via source-rect crops
(exact rects determined during implementation, per the Non-goals note
above), positioned at specific pixel coordinates matching the zone table.
This mirrors standard Phaser practice for irregularly-sized RPG furniture
sprites (a rug or a table doesn't cleanly occupy one tile cell) and sets up
the right foundation for the next sub-project: attaching interaction/trigger
zones to a furniture sprite's bounding box is straightforward; attaching one
to an arbitrary tilemap tile index is not.

Scene property: `this.furnitureSprites` — a plain object keyed by a short
name per placed piece (e.g. `rug`, `table1`, `bookshelfLeft1`, ...), each
value the corresponding `Phaser.GameObjects.Image`. Exact key set is decided
during implementation once the concrete piece list and positions are final.

### Asset loading

All three PNGs are loaded in the scene's `preload()` via `this.load.image()`
/ `this.load.spritesheet()` as appropriate (no runtime `generateTexture`
calls for these — that technique was scaffold-only, for placeholder color
swatches with no real art to load). Paths:
`../../assets/images/ui/furniture03.png`,
`../../assets/images/ui/floors-walls02.png`,
`../../assets/images/ui/libassetpack-tiled.png` (relative to
`pages/N5/n5-dashboard.html`, matching the existing asset-path convention
used elsewhere on that page).

### CSS / HTML

No changes to `n5-dashboard.html`'s markup (still just the empty
`#phaserGame` mount point from sub-project #1) or to
`n5-dashboard.css`'s `#mapFrame`/`#phaserGame` rules (already correct from
sub-project #1's final-review fix). Only `assets/js/n5-phaser-game.js`
changes.

## Error handling / edge cases

- Missing/failed image loads: Phaser's default behavior (a missing-texture
  placeholder square) is acceptable for this sub-project — no custom
  fallback UI is built. All three source files are already confirmed present
  in the repo, so this is a defensive note, not an expected case.
- Grid-dimension change from 24×15 to 48×30 must not change
  `Phaser.Game`'s `width`/`height`/`scale` config — only the tilemap's
  internal tile array and `tileWidth`/`tileHeight` constants change. This is
  the same invariant sub-project #1's final review checked (aspect ratio
  stays 1.6 at any viewport width) and must still hold after this change.

## Verification

Manual (Playwright, extending sub-project #1's approach):

1. Load the N5 dashboard on this branch — confirm the Phaser canvas renders
   real art (floor planks, wall/brick border, the top balcony/curtain
   structure, rug, table, and other furniture pieces) instead of solid
   placeholder colors.
2. Confirm canvas intrinsic size is still exactly 768×480 and aspect ratio
   stays ~1.6 at both a wide and a narrow viewport (same check sub-project
   #1 used, re-run against the new grid).
3. Confirm no unexpected console errors/404s beyond the already-known,
   pre-existing, out-of-scope ones (`player.js`, `achievement.js`,
   `default-avatar.png`, `book.png` — allowlisted by URL, per the pattern
   established in sub-project #1's Task 1 correction).
4. Screenshot the full scene for visual comparison against the original
   reference composition (top alcove, staircase, balconies, rug, furniture
   clusters, bottom gate) — confirms the zone layout reads as intended, not
   just that individual assets load.
