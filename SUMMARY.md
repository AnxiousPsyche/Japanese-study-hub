# Session Summary — N5 Dashboard Work (last updated 2026-07-09)

## 1. Where things stand right now (read this first)

- **Current build:** a Phaser 3 top-down library scene, on branch
  `n5-phaser-real-layout`. This is the **active, current approach** —
  superseding two earlier ones (see History below).
- **Master vision doc:** `Neko-Bunko-Cat-Library-Spec.md` (project root) —
  "Neko Bunko (猫文庫)": the player IS a cat, no separate dashboard, the
  whole app is the library, bookshelves are lessons, sage/lavender/cream
  pastel palette (world art stays native pack colors; pastel expressed
  through UI chrome per B8 below).
- **The game code:** `assets/js/n5-phaser-game.js` — a single `LibraryScene`,
  hand-built 56×75 tile floor (896×1200 world, extended in Round 2) +
  individually-placed furniture sprites cropped at runtime from 3 real
  asset sheets in `assets/images/ui/` (`libassetpack-tiled.png`,
  `furniture03.png`, `floors-walls02.png`, `TopDownHouse_DoorsAndWindows.png`).
- **Full player movement, collision, and interaction system now exists**
  (built in Round 2, see below) — walking (WASD/arrows), click-to-walk,
  E/Enter/Space-to-interact, 15 lesson shelves + 3 book piles with
  locked/available/completed states and progression gating, localStorage
  persistence. The scene is no longer static.
- **Just completed: a full "Round 2 Corrections" pass** on top of Round 1
  (not yet merged to `main`): map extended to 896×1200 with a
  camera that follows the cat, 100% floor coverage + full 4-side wall
  border + dark `#2A2320` backdrop outside the room, re-sliced windows
  (frame+glass only, 2 per side symmetric around the door), exactly 15
  named clickable lesson shelves (`shelf-01`..`shelf-15`, 4/4/4/3 wall
  layout, click-in-range or walk-into-zone+E, auto-walk-to-shelf,
  locked/available/completed sprite states), exactly 3 clickable book
  piles (`review-1`, `review-2`, `final-quiz` — final-quiz visually
  larger at 2.4x vs 1.6x scale). All 18 interactives confirmed reachable
  and triggerable via auto-walk (tested individually via Playwright).

### Round 2 bugs found and fixed (worth knowing if touching this code again)

1. **Auto-walk got stuck grazing other shelves' collision boxes** on
   long/off-axis routes — fixed by routing through a central corridor
   (3-waypoint: horizontal → vertical → final approach) instead of a
   straight line.
2. **Shelves/piles/tables/armchairs/globe all made non-solid.** The room
   is tight (2 shelves per row with only a 14px gap, decor sitting
   directly in the routing corridor), so *any* solid furniture in the
   path reliably blocked auto-walk to something. Only the outer walls
   are solid now. Interaction still works purely via distance checks
   (`TRIGGER_RANGE`), not physical contact — this was a deliberate
   trade-off of collision realism for guaranteed reachability of all 18
   required interactives.
3. **Real bug: the proximity-highlight effect was silently overriding
   every interactive's display scale, every frame** — `entry.sprite
   .setScale(entry === near ? 1.08 : 1)` hardcoded the "not near" case
   to scale 1, clobbering the book piles' intended 1.6x/2.4x
   `setDisplaySize`. This made `final-quiz` render at the same size as
   the review piles despite the "grander" requirement, undetected until
   directly checking `sprite.displayWidth` (position/clickability tests
   alone didn't catch it). Fixed by storing each entry's intended
   `baseScale` at creation and multiplying by the highlight factor
   instead of overwriting it.

## 2. A real methodology lesson from this pass

Pixel-coordinate measurement via a visual grid-overlay screenshot (render
a grid, eyeball where an object's edges line up with the labels) turned
out **unreliable** — it silently misread real coordinates by 2-4x on two
separate items (a door's height, then an entire shelf row's width),
each time confidently and wrong, only caught by testing the crop
directly rather than trusting the visual read.

**What actually works: alpha-channel pixel scanning.** Draw the source
image into a canvas, then use `getImageData` to scan a row or column for
runs of opaque pixels (`alpha > 10`) — this finds real object boundaries
programmatically instead of eyeballing a screenshot. Every coordinate in
this pass found this way turned out correct on the first try. **Use this
method for any future asset-coordinate work in this codebase**, not
visual grid reading. (Some items — the grandfather clock, treasure chest,
chalkboard — were hunted for and not found efficiently even with this
method, since the source sheet is densely packed and this technique
still requires scanning the right region; those were skipped this pass
rather than guessing.)

## 3. History — how we got to the Phaser build

1. **N5 Journey Roam** (merged to `main`): a CSS-drawn mountain/forest map
   with a free-roam cat, walk-up lesson popups, favorites. Later retired.
2. **N5 Library Map** (branch `n5-library-map`, not merged, superseded):
   pivoted the mountain map to a code-drawn (CSS shapes) library scene
   with a 7-color recolorable cat avatar system. This branch's work is
   **not part of the current build** — abandoned in favor of the Phaser
   approach below once real tileset assets were sourced. Still exists on
   its branch if anything from it is worth revisiting later.
3. **N5 Phaser migration** (current, branch `n5-phaser-real-layout`):
   scaffold sub-project (Phaser 3 mounts, placeholder tilemap) → real
   tileset + layout sub-project (real art, decorative scene) → Round 1
   feedback correction pass → **Round 2 corrections pass (this session):
   map resize, movement/collision/interaction system, 15 shelves + 3 book
   piles with progression gating**. Specs/plans:
   `docs/superpowers/specs/2026-07-08-n5-phaser-scaffold-design.md`,
   `docs/superpowers/specs/2026-07-08-n5-phaser-real-layout-design.md`.

## 4. What's next (not started)

The core loop (movement, collision, interaction, progression, persistence)
is done. Remaining, per the master spec: actual lesson content behind
each shelf/pile panel (currently placeholder "Lesson content coming
soon." text), cat avatar customization/recoloring, ambient NPC wandering,
sound, and polish passes (shelf art variety beyond the pack's 3 filled
variants, decorative-only items below).

Also worth a look, not yet done: the grandfather clock, treasure chest,
chalkboard, teapot, and armchair-pack items requested in Round 1 feedback
B4 but not found efficiently that pass.

Known trade-off to revisit if it ever matters: shelves, book piles,
tables, armchairs, and the globe are all **non-solid** (only the outer
walls collide) — a deliberate Round 2 fix for auto-walk reliability (see
section 1's bug notes). If a future pass wants the cat to physically
bump into furniture, the room will likely need to be widened first
(especially the 14px gap between shelf rows), or routing made smarter
than the current 3-waypoint corridor approach.

## 5. How to resume

Say **"apply Round 3 feedback"** (if you have more corrections) or name a
specific next item from section 4 above. Everything needed is in git
history (`git log` on `n5-phaser-real-layout`) and the two spec docs
above — no re-deriving context needed.
