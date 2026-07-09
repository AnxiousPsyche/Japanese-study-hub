# Session Summary — N5 Dashboard Work (last updated 2026-07-08)

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
  hand-built 48×30 tile floor + individually-placed furniture sprites
  cropped at runtime from 3 real asset sheets in `assets/images/ui/`
  (`libassetpack-tiled.png`, `furniture03.png`, `floors-walls02.png`,
  plus `TopDownHouse_DoorsAndWindows.png` added this pass).
- **No player/movement/collision/interaction system exists yet.** This
  whole build is still a decorative-scene pass — walking, lesson-shelf
  interaction, and the cat avatar are explicitly future sub-projects (see
  `docs/superpowers/specs/2026-07-08-n5-phaser-real-layout-design.md`'s
  Non-goals). Don't be surprised the scene looks static.
- **Just completed: a full "Round 1 Feedback" correction pass** (9
  commits, all on `n5-phaser-real-layout`, not yet merged to `main`):
  staircase moved to the true left wall, entrance door + 2 windows added,
  4 more lesson shelves using the pack's built-in locked/filled state art,
  a floor-tile variant under furniture clusters, book stacks on tables +
  extra plants, 2 review nooks + a final-quiz altar, the rug path
  extended to the gate, and exact HUD pastel colors (#F6F2EA/#C9BFA5).
  Screenshot-verified after every change.

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
   tileset + layout sub-project (real art, current decorative scene) →
   **this session's Round 1 feedback correction pass**. Specs/plans:
   `docs/superpowers/specs/2026-07-08-n5-phaser-scaffold-design.md`,
   `docs/superpowers/specs/2026-07-08-n5-phaser-real-layout-design.md`.

## 4. What's next (not started)

Per the real-layout spec's own roadmap: player movement + collision,
interaction system (walk-up triggers, "[E] Read" prompt), lesson data
model + modal panel, lock/glow/complete shelf states + progression logic
(the shelf art added this pass is decorative only, not yet bound to
`N5_LESSONS` or any progression state), review-nook/final-quiz
interactivity, cat avatar integration, ambient NPC wandering, polish.

Also worth a look, not yet done: the grandfather clock, treasure chest,
chalkboard, teapot, and armchair-pack items requested in Round 1 feedback
B4 but not found efficiently this pass; a real "border tile row along
walls" (currently just relying on the pre-existing brick perimeter).

## 5. How to resume

Say **"apply Round 2 feedback"** (if you have more corrections) or
**"continue the Phaser build — add interaction/movement"** to move to the
next roadmap item. Everything needed is in git history (`git log` on
`n5-phaser-real-layout`) and the two spec docs above — no re-deriving
context needed.
