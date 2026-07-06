# N5 Library Map — Design Spec

## Context

The N5 dashboard (`pages/N5/n5-dashboard.html`) currently uses a painted
mountain/forest/river "journey map" (`n5-journey-map.png`) as its walkable
overworld, with a single fortune-cat sprite (`fortunecat-Original.png`)
the player drives with arrow keys/WASD to reach 18 lesson/review stops.
This was just built and merged (see
[2026-07-06-n5-journey-roam-design.md](2026-07-06-n5-journey-roam-design.md)),
including a fix for a real alignment bug where painted landmarks and
%-positioned nodes drifted apart on window sizes other than the map's
calibration reference.

The vast fantasy-journey theming (mountains, forests, bridges, rivers) is
being **retired from N5** and saved for a future **N1** build, where the
epic scale fits the "final stretch" of the learner's journey better. N5,
being the learner's starting point, moves to a smaller, cozier setting:
the library itself (matching the "JP Library OS" branding already used
throughout the app), with multiple colored cats — matching an earlier
discussion about wanting several cat avatar colors — living in and
roaming that space.

No image-generation tool is available in this environment, so the
library scene is built from code (CSS shapes), not painted/rendered art.

**Amendment (2026-07-07):** partway through implementation, real
hand-drawn pixel sprite sheets were added to the project for 5 idle-cat
animations (`assets/images/icons/pixels/OrangeCatIdle.png`,
`blackCatIdle.png`, `CalicoCatIdle.png`, `whitecatIdle.png`,
`tuxedoIdle.png` — each a horizontal strip of 300×300px frames, an
idle bob/look-around loop, no walk-cycle frames). This changes the
color roster from 6 to **7** (orange, black, calico, gray, brown,
white, tuxedo) and splits cat rendering into two mechanisms used for
two different purposes:

- **Avatar-picker preview swatches** for the 5 colors with real art
  (orange, black, calico, white, tuxedo) show the actual sprite sheet,
  animated continuously via CSS `steps()` stepping through frames, so
  the learner sees a lively preview while browsing. Gray and brown
  (no real art) show the code-drawn CSS cat shape as their preview
  instead.
- **The actual roaming cat** (player and every ambient NPC) is, for
  *all 7 colors without exception*, the code-drawn CSS `.cat`
  component with its walk-cycle animation — never the sprite sheets.
  There is no walk-cycle art for any color, so using the code-drawn
  component uniformly for movement avoids an inconsistent mix of real
  vs. fake walking motion. Picking a color in the picker always ends
  up applying a `.cat--<color>` class to the player, regardless of
  which mechanism that color's picker swatch used to preview it.

## Goals

- Replace the mountain/forest/river map with a code-drawn library
  interior (bookshelves, reading tables/desks, a rug, windows, warm
  lighting) in the app's existing pixel-art visual language.
- The same 18 lesson/review/final-review stops from `n5-map.js`'s
  `N5_LESSONS`, re-themed as library furniture instead of glowing road
  circles, keeping the existing walk-up-to-interact popup model.
- A reusable, recolorable cat sprite component (one shared shape +
  walk-cycle animation, parameterized fur color) covering 7 colors:
  orange (tabby stripes), black, calico (patched), gray (tabby stripes),
  brown, white, tuxedo (patched, added per the 2026-07-07 amendment
  above). This component is what actually roams the library — see the
  amendment above for why it's used for all 7 colors, not just gray/brown.
- A first-visit avatar picker: the learner picks their cat's color once;
  the choice persists via `localStorage` and is reused on later visits.
  Preview swatches use real animated sprite art where available (5 of
  the 7 colors) and the CSS component otherwise (gray, brown).
- 3 ambient NPC cats, each a different color from the player's own,
  wandering the room independently and continuously (pick a random point,
  walk to it, pause, repeat) — decorative only, no interaction.
- Keep everything outside the map layer as-is: the HUD, the lesson popup
  (Start Lesson / Save-Favorite / Exit), and `localStorage`-backed
  favorites.

## Non-goals (explicitly deferred)

- **The old journey map is not deleted.** `n5-journey-map.png` and its
  calibrated coordinate data stay in the repo, untouched, earmarked for a
  future N1 build. This pass only stops *referencing* it from the N5
  dashboard.
- **No treasure chests or equivalent.** They were decorative and
  content-less in the old map; not carried into the library reskin.
- **No lock/complete progress gating** — unchanged from the existing
  journey-roam feature; every stop stays open and interactive regardless
  of order.
- **No NPC-cat interaction** — the 3 ambient cats are wander-only, not
  clickable, no popup, no dialogue.
- **No collision between cats (player or NPC) and furniture** — matches
  the prior map's "no road-locked collision" precedent; movement is
  bounds-clamped to the room only, not path-constrained. Furniture-aware
  collision is a bigger job (needs a hand-authored walkable-area mask)
  deferred the same way it was for the road in the previous pass.
- **No changes to lesson content, count, or data shape** — `N5_LESSONS` in
  `n5-map.js` keeps the same 18 entries (ids, labels, descriptions, xp,
  hrefs); only how each one is *drawn* on the map changes.

## Architecture

### Files touched

| File | Change |
|---|---|
| `pages/N5/n5-dashboard.html` | Replace the journey-map `<img>` and node/scenery markup with the library scene markup; add the avatar-picker overlay markup; add markup for 3 ambient NPC cats. |
| `assets/css/n5-dashboard.css` | Replace map-background/node-position rules with the library scene's CSS (bookshelves, tables, rug, windows); add the recolorable cat component's base styles + 6 color variants + walk-cycle keyframes; add avatar-picker overlay styles; add ambient-cat wander-animation styles. |
| `assets/js/n5-map.js` | Keep `N5_LESSONS` and the movement/proximity engine's shape; update node selectors/positions to the new furniture layout; add ambient-cat spawn + autonomous wander loop. |
| `assets/js/n5-save.js` | Add a second `localStorage` key for the player's chosen cat color (alongside the existing favorites key), with the same degrade-to-session-only-on-failure behavior. |
| `assets/js/n5-popup.js` | Unchanged — same `open`/`close`/`isOpen` contract, still consumed the same way. |
| New: `assets/js/n5-avatar-picker.js` (or folded into `n5-map.js` — decided at planning time) | First-visit picker UI logic: show if no saved color, apply the chosen color class to `#playerCharacter`, persist the choice. |

### The library frame — avoiding the old alignment bug

The map layer is wrapped in an aspect-ratio-locked frame (the same fix
just applied to the journey map): a container with a fixed
`aspect-ratio` matching the library scene's designed proportions,
constrained by `max-width:100%; max-height:100%` and centered. Because
the scene is code-drawn rather than a photographed/painted image, its
"native aspect ratio" is a design choice made up front (e.g. 16:10) rather
than measured from a file — furniture and node positions are authored as
percentages of that same frame from day one, so there is no calibration
step and no risk of the drift bug recurring.

### Library scene composition

Built as layered CSS (divs styled as shelving units, tables, a rug,
window panes with a warm gradient "glow") reusing existing visual
tokens already in the codebase: the wood tones and border treatment from
`.lesson-sign`/`.scenery-sign` (now removed from the journey map, but
their color/border values are a good starting point), the
`Press Start 2P` title font, and the warm HUD lighting palette
(`--hud-bg`, `--hud-border`). No new visual system is invented.

### The 18 stops as library furniture

Each of the 18 entries in `N5_LESSONS` (unchanged data) gets a furniture
representation instead of a round glowing node — e.g. a labeled bookshelf
or reading table — positioned as a percentage of the library frame. The
walk-up-to-interact model (proximity radius, `in-range` highlight,
Enter/Space or click to open the popup) is unchanged from `n5-map.js`'s
existing engine; only the visual representation and its coordinates
change.

### Recolorable cat component

One shared markup/CSS structure (body, head, ears, legs, tail as simple
shapes) with fur color(s) driven by a CSS class per variant:

- **Solid-color variants** (orange, black, gray, brown, white): a single
  fur-color CSS custom property swap per class, e.g. `.cat--orange`,
  `.cat--black`, etc. Orange and gray additionally get simple tabby
  stripe marks (a few darker-shade bars across the back) via extra
  layered shapes.
- **Calico**: not a simple recolor — a distinct variant with actual
  patch shapes (white base, orange and black/gray patches positioned on
  top), since calico coloring is inherently multi-region.
- **Tuxedo** (added per the 2026-07-07 amendment): also not a simple
  recolor — black base fur with a single white patch shape over the
  chest/belly area, reusing the same patch mechanism calico uses (just
  one patch color instead of two).

A single shared `@keyframes` walk-cycle (legs alternating angle/position)
applies identically to every color variant, replacing the current
bounce-only `.walking` animation with a real walk-cycle for the player's
cat. The existing `#playerCharacter` element gets one of the 7 color
classes based on the saved/picked avatar; ambient NPC cats each get their
own independently-assigned color class.

### Avatar picker

On first load of the library map, if no color is saved yet
(`n5-save.js`'s new color key), an overlay presents all 7 swatches, one
per option. Per the 2026-07-07 amendment, swatch *previews* are not
uniform: orange/black/calico/white/tuxedo show their real animated
sprite sheet (continuously looping while the picker is open); gray/brown
show the code-drawn CSS cat component instead (no real art for those
two). Picking any swatch applies that color's `.cat--<color>` class to
`#playerCharacter` (always the CSS component, regardless of which
preview mechanism was shown), persists the choice, and dismisses the
overlay. On every subsequent visit, the saved color is applied
immediately and the picker never shows again unless `localStorage` is
cleared.

### Ambient NPC cats

3 `<div>` elements using the same recolorable cat component. Colors are
assigned by taking the 6 palette colors other than the player's chosen
one (of 7 total) and picking 3 (e.g. randomly, or a fixed rotation —
decided at planning time), guaranteeing no NPC ever matches the
player's own color.
Each runs its own independent wander loop: pick a random point within the library frame's
bounds, walk toward it at a modest speed (visually distinct from the
player's faster, key-driven movement is not required — same speed is
fine), pause briefly on arrival, pick a new random point, repeat. No
collision with furniture, other cats, or the player. Not clickable, no
popup, no proximity detection — purely decorative motion for atmosphere.

## Error handling / edge cases

- `localStorage` unavailable/blocked for the new avatar-color key:
  degrades to session-only (picker re-shows next visit), matching the
  existing favorites behavior — must not throw.
- If the picker is dismissed without a selection somehow (e.g. Escape) —
  re-show it on next interaction/reload rather than defaulting silently
  to a color the learner didn't choose.
- Ambient cats must never wander outside the library frame's bounds
  (same clamping approach as the player).

## Verification

Using Playwright, matching the verification style from the previous
journey-roam pass:

1. Load the N5 dashboard fresh (no saved avatar color) — confirm the
   picker overlay appears with all 7 options rendered (5 with animated
   sprite previews, 2 with CSS-cat previews).
2. Pick a color, confirm `#playerCharacter` gets the right class and the
   picker closes; reload and confirm the same color persists without the
   picker re-appearing.
3. Confirm walking the player cat up to a furniture stop still opens the
   popup with the correct lesson data (spec-compliance check that the
   `N5_LESSONS` contract survived the reskin unchanged).
4. Confirm the 3 ambient cats are present, each a color different from
   the player's, and that their position changes over time (wandering,
   not static).
5. Re-run the aspect-ratio-drift check from the previous pass (compare a
   furniture stop's position against the frame at multiple viewport
   sizes) to confirm the new frame doesn't reintroduce the alignment bug.
6. Screenshot the library scene with the player mid-roam, the picker
   overlay, and a popup open, for visual confirmation.
