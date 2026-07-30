# N5 Journey Map Roam — Summary

Full spec: [2026-07-06-n5-journey-roam-design.md](2026-07-06-n5-journey-roam-design.md)

## What's changing

The N5 dashboard's journey map (torii → 15 lessons + 2 reviews → castle,
already painted as one continuous road with scenery signposts) currently
has zero working JS behind it — every node position is a rough placeholder
guess and most of its `<script>` tags point at files that don't exist.

This feature makes it a real Mario/Zelda-style overworld:

- **Walk it yourself.** Arrow keys / WASD move a pixel cat
  (`fortunecat-Original.png`) anywhere around the map — no more click-to-jump.
- **Bump into a lesson, get a popup.** Walking up to any node pops up
  ▶ Start Lesson / ⭐ Save-Favorite / ✕ Exit.
- **Favorites remember you.** Saving a lesson survives a page reload
  (`localStorage`).
- **Everything's unlocked.** No lesson-order gating this pass — walk to any
  node, any time.
- **Real positions.** Every node gets re-measured against the actual
  background art instead of the old guessed grid.
- **5 new scenery signs** (Bridge of Particles, Grammar Forest, Towns of
  Conjugations, Mountains of Kanji and Vocab, Listening Falls) — decoration
  only, not clickable.

## Deliberately not in this pass

- No lock/complete progress tracking (everything's open).
- No multi-color cat picker (one cat for now — needs real art first, and
  there's no image-generation tool available to make one).
- No road-locked collision (cat can wander onto grass/decoration, not just
  the stone path — constraining it to the road is a much bigger job with
  no tool available to author a precise collision mask).

## Files touched

- `pages/N5/n5-dashboard.html`
- `assets/css/n5-dashboard.css`
- `assets/js/n5-map.js` (movement + collision)
- `assets/js/n5-popup.js` (new)
- `assets/js/n5-save.js` (new)

Dead `<script>` tags for `n5-dashboard.js`, `n5-lessons.js`, `n5-player.js`
(none of which exist on disk) are removed.

## Verification

Playwright-driven: simulate arrow-key movement, confirm bounds clamping,
confirm walking up to a real node opens the popup, confirm favoriting
survives a reload, screenshot the result.
