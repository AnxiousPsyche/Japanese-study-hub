# N5 Journey Map: Free-Roam Cat Character — Design Spec

## Context

`pages/N5/n5-dashboard.html` already has a fully painted background
(`assets/images/backgrounds/n5-journey-map.png`): a continuous stone road
winding from a torii START through 15 lesson stops and 2 review checkpoints
up to a castle GOAL, with scenery signposts already painted on ("Bridge of
Particles", "Rivers of Grammar", "Towers of Conjugations", "Mountains of
Vocabulary"). The HTML already has button elements for every node
(`.lesson-node.lesson-1` .. `.lesson-15`, `.review-node`, `.review-node-2`,
`.final-review`, 3 `.treasure-node`s, `#startGate`, `#goalCastle`) and CSS
already has a `#playerCharacter` element with a `.walking` bounce animation
and `left`/`top` transitions. None of it is wired up: the placeholder node
positions (a simple 13/33/53% grid) predate the final art and don't line up
with it, `.final-review` has no position at all, the 3 treasure chests don't
appear in the art, and every dashboard-specific `<script>` tag
(`n5-dashboard.js`, `n5-lessons.js`, `n5-player.js`, `n5-popup.js`,
`n5-save.js`) points at a file that doesn't exist except `n5-map.js`, which
is empty.

This spec replaces the unwired placeholder with a real, free-roam,
Mario/Zelda-90s-style overworld: the player moves a pixel cat around the map
with arrow keys/WASD and interacts with nodes on contact, instead of
clicking a node to teleport to it.

## Goals

- Arrow-key/WASD-controlled cat character roams the whole map freely.
- Walking up to a lesson/review/final-review node and interacting opens a
  popup with three options: **Start Lesson**, **Save/Favorite**, **Exit**.
- Favoriting a lesson persists across reloads (`localStorage`).
- All node positions are recalibrated to actually match the painted art.
- 5 scenery sign overlays (decorative, non-interactive) using the site's
  existing wooden-sign visual language.
- Dead script references cleaned up.

## Non-goals (explicitly deferred)

- No lock/complete progress system. Every node is open and interactive
  regardless of order. The existing `.locked`/`.completed` CSS states are
  left in the stylesheet, unused, as groundwork for a later save-system
  feature — this pass does not drive them.
- No multi-color avatar picker. One cat sprite (`fortunecat-Original.png`)
  for now; a black/orange/calico/gray/brown/white picker is a separate
  future feature that needs real per-color art first (no image-generation
  tool is available in this environment).
- No road-locked collision. The cat can walk anywhere within the map's
  bounds, including over decorative grass/water — it is not constrained to
  the painted stone road. Road-locked movement would require a hand-traced
  walkable-area mask, which is a materially larger and riskier effort with
  no image-editing tool available to author it precisely; deferred.

## Architecture

### Files touched

| File | Change |
|---|---|
| `pages/N5/n5-dashboard.html` | Recalibrate every node's position; add 5 scenery-sign overlay elements; remove `<script>` tags for files that don't exist. |
| `assets/css/n5-dashboard.css` | Replace the placeholder `.lesson-N` / node position rules with calibrated coordinates; add `.scenery-sign` (reuses `.lesson-sign`'s wooden-sign look); switch `#playerCharacter` positioning from CSS-transition jumps to per-frame JS updates (transition kept only for the `.walking` bounce). |
| `assets/js/n5-map.js` (currently empty) | Movement engine: keyboard input, per-frame position updates, map-bounds clamping, proximity detection against every node. |
| `assets/js/n5-popup.js` (currently missing) | 3-option popup: Start Lesson / Save-Favorite / Exit. |
| `assets/js/n5-save.js` (currently missing) | `localStorage` helper for the favorited-lessons list. |

`n5-dashboard.js`, `n5-lessons.js`, `n5-player.js` are removed from the
`<script>` list — their intended responsibilities are folded into
`n5-map.js` / `n5-popup.js` / `n5-save.js` above, so the page stops loading
three 404s.

### Coordinate calibration

Node positions are re-derived against the actual rendered background image
using Playwright (already installed this session, in the scratchpad — not
added as a project dependency): load the image at its real rendered size,
click each landmark (torii, all 17 lesson/review circles, castle) and record
each as a `%` of the image's width/height, preserving the existing
responsive `%`-based positioning approach. `.final-review` and the 3
treasure chests aren't painted in the art, so they get reasonable manual
placements instead (final-review just before the castle; chests near
scenic side-areas) — called out in code comments as manual placement, not
derived from the art, so a future artist pass can reconcile it.

### Movement & interaction

- Arrow keys / WASD move the cat continuously via `requestAnimationFrame`,
  updating position directly (no CSS-transition-driven jumps), clamped to
  the map image's bounds.
- Each node has an interaction radius around its calibrated coordinate.
  Entering it shows a hint (e.g. brighter glow); interacting — clicking the
  node directly, or Enter/Space while in range — opens the popup for that
  node.
- Popup buttons:
  - **▶ Start Lesson** — navigates to / triggers that lesson's existing
    start flow.
  - **⭐ Save/Favorite** — toggles favorited state for that lesson, persisted
    via `localStorage` (key: `jpLibraryOS.n5.favorites`, a JSON array of
    lesson ids).
  - **✕ Exit** — closes the popup, returns control to roam.
- No gating: every node is reachable and interactive in any order.

### Cat character

`#playerCharacter`'s image points at
`assets/images/icons/pixels/fortunecat-Original.png`. The existing
`.walking` class (bounce animation, already styled) toggles on while any
movement key is held, off when idle.

### Scenery overlays

5 decorative wooden-sign overlays (new `.scenery-sign` class, visually
matching `.lesson-sign`), positioned near their corresponding painted art
regions, with the user's preferred wording overlaid on top of/near the
image's existing painted text:

| Sign text | Positioned near |
|---|---|
| Bridge of Particles | existing bridge / bottom-left river art |
| Grammar Forest | existing "Rivers of Grammar" painted area |
| Towns of Conjugations | existing "Towers of Conjugations" painted area |
| Mountains of Kanji and Vocab | existing "Mountains of Vocabulary" painted area |
| Listening Falls | existing waterfall art near the mountains (new label, nothing painted there yet) |

These are non-interactive — decoration only, not clickable nodes.

## Error handling / edge cases

- Movement input while a popup is open is ignored (popup captures focus;
  Exit or Escape returns control to roam).
- Cat position clamps at the image's edges — no wraparound, no walking off
  the visible map.
- `localStorage` unavailable/blocked (e.g. privacy mode): favorite-toggle
  degrades to session-only state with no persistence; it must not throw or
  break the popup.

## Verification

Using Playwright (scratchpad-installed, static server via
`.claude/launch.json`'s `python -m http.server` config):

1. Load `n5-dashboard.html` directly — confirmed it has no `#boot-screen`/
   `#login-screen`/`#desktop` gate of its own (unlike `index.html`), so no
   login-skip trick is needed here.
2. Simulate held arrow keys (`page.keyboard.down`/`up`) and confirm the
   cat's on-screen position updates continuously and clamps at map bounds.
3. Drive the cat to a real calibrated node coordinate and confirm the
   proximity hint appears and the popup opens with all three options.
4. Click Save/Favorite, reload the page, confirm the favorited state
   survived via `localStorage`.
5. Screenshot the map with the cat mid-roam and the popup open, for visual
   confirmation.
