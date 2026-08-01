# N4 Mezzanine Polish — Summary

Related specs: [2026-07-27-n4-second-floor-design.md](2026-07-27-n4-second-floor-design.md),
[2026-07-28-n4-atrium-walls-jukebox-gates-design.md](2026-07-28-n4-atrium-walls-jukebox-gates-design.md)

**Both specs above describe an earlier design (a floor split down the
middle into a gated N4 column + N3 column) that was reversed per explicit
follow-up feedback.** The N3 wing, the frosted N3 threshold wall, and the
N3 entrance exam gate were all removed entirely. What actually shipped,
and everything below, is a single continuous N4-only floor. This session
was iterative live-feedback polish (many rounds, driven by screenshots of
the running game) rather than a new formal design — no separate
plan.md/design.md pair was written; this summary is the record of what
changed, kept current as the floor evolved.

## Current shape of the floor

- **One continuous floor, 20 shelves** (not the old two-column N4/N3
  split): 16 grammar shelves + a 4-shelf Reading Room capstone, in a
  single walking order from the entry. The 16 grammar shelves are a
  content-preserving merge of the old 24 (12 N4 + 12 N3) shelves — no
  grammar point was dropped, only regrouped and renamed.
- **4 review piles**, one per 4-shelf group, same "1 pile per 4 shelves"
  cadence N5 uses. Reading Room is unlocked as a capstone after the final
  review pile rather than gating (or being gated by) any grammar shelf.
- **Two standalone stations, not part of the shelf chain**: a Vocabulary
  Press ("The Composing Room" / "Est. 1450") and a Listening Jukebox,
  both always-available `kind: 'npc'` interactives. The jukebox carries
  real external listening links (NHK Easy News, Nihongo con Teppei, JLPT
  Mochi Sensei) plus an original in-game transcript + comprehension quiz;
  the press carries the full vocabulary PDF reference list. Both sit
  side-by-side in the same wing row (jukebox left, press right) after an
  earlier "north feels empty" fix moved the jukebox out of an isolated
  north-wall spot.
- **One real gate**: an N2 door stub (`buildExamGate()`), a genuinely
  detailed hand-drawn pixel-art door (arch, keystone, beveled panels,
  hinges, ring-pull/keyhole when locked, a warm glowing gap when
  unlocked) — not the book-pile-texture placeholder the original spec
  described. It exists as a locked landmark for a future floor; nothing
  on this floor gates on it. An N1 stub exists in `EXAM_GATE_DATA` but is
  explicitly not built this pass ("N1 is dropped for this pass entirely").
- **Open atrium void** (`buildOpenAtriumVoid()` in
  `library-scene-shared.js`) — a center-strip "peek down to N5's first
  floor." Originally a near-black silhouette, then a brightly-lit but
  still abstract color-block preview; now layers real content on top:
  the actual hardwood floor tileSprite (dimmed a shade), a real woven-rug
  strip (same `drawWovenRug()` generator every other rug in the game
  uses), and tiny real shelf-sprite crops, with a soft dimming gradient
  drawn last so it still reads as "receding into shadow." Two
  `Phaser.Game` instances can't share a live scene (N4 and N5 are
  separate games on separate HTML pages), so this is a stylized,
  statically-tinted illustration, not a literal live rendering.

## Layout polish (multiple live-feedback rounds)

- **Wing content reorder + spacing.** Section-plaque/shelf overlap was
  fixed by growing `GRID_ROWS` and widening the gaps between wing bands;
  content was reassigned per explicit feedback so the walking order from
  the entry reads Foundations → Grammar → Reading → Listening, bottom row
  to top row within each band.
- **Shelf reading-order bug.** `createMezzanineShelfPositions()`'s
  position generator originally put the shelf farthest from the entry at
  the lowest array index (so shelf01 physically sat in the back row of
  its band); fixed by sorting south-to-north instead. A second,
  compounding bug — mirroring for the right-side shelves reversed
  left-to-right order even after the row-order fix — was also caught and
  fixed. Section signs were re-anchored to `LAYOUT`'s own wing-band Y
  values instead of shelf-id lookups, since the ordering fix changed
  which shelf id physically lands on the "safe" (clearance-having) row.
- **Review piles**: resized slightly larger (scale 0.7 → 0.78) and
  repositioned so each pile sits on the side matching the shelf group it
  gates (left-center of the right wing, center-right of the left wing).
- **Plaques**: font changed to VT323 (self-hosted, matches the rest of
  the game's "readable at header-or-bigger sizes" convention) and sized
  up, applied to both N4's and N5's plaque helper. Shelf plaques now show
  just the title, not the "-- grammar list" subtext that used to overlap
  neighboring shelves on the map (the full string still shows in the
  click-to-open popup title). Three shelf titles that wrapped to 3 lines
  were shortened to simple 2-word titles: "Embedded Questions Shelf" →
  "Question Shelf", "Effort & Demonstratives Shelf" → "Effort Shelf",
  "Requests & Suggestions Shelf" → "Requests Shelf".
- **Empty-space filler.** Several large gaps (a blank column behind the
  "Refinement" section, the header-to-first-shelf gap, and the south
  wall before the entry) originally got duplicate shelf sprites as filler
  — reverted per explicit feedback ("instead of the same shelves for
  fillers of space"). Replaced with small reading-nook furniture clusters
  (table + flanking chairs, and a couch — `topDownFurniture1` crops,
  reusing N5's own already-verified `libTable`/`libChair`/`sofaCouch2`
  rects rather than cropping fresh ones), labeled "Reading Nook," "Study
  Corner," and "Rest Area."
- **Print-links / citation UI** (`lesson-box.js` + `lesson-box.css`): the
  print-links list and the sources-citation footer used to both anchor
  to bottom corners and collided on single-page lessons. Print links are
  now a centered, wrapping row of pill-style chip buttons under a
  "Reference sheets" label; the sources footer moved to the top-right
  (below the page indicator) so the two can never share vertical space
  regardless of page count.

## Deliberately not in this pass

- The atrium void remains a stylized illustration of "N5's floor," not a
  live rendering — confirmed technically infeasible (separate Phaser game
  instances, separate HTML pages), not skipped for time.
- No N1 gate, no N2/N1 shelf content, no real prereq-chain wiring beyond
  the single standalone N2 door landmark.
- Filled shelf textures (once completed) render a few px taller than the
  locked texture at the same fixed scale — accepted as a minor,
  uniform-safe tradeoff.

## Files touched

- `assets/js/n4-phaser-game.js`
- `assets/js/library-scene-shared.js`
- `assets/js/n5-phaser-game.js` (plaque font/size only, per explicit
  "apply it to all plaques including the N5 plaques")
- `assets/js/lesson-box.js`
- `assets/css/lesson-box.css`

## Verification

`node --check` on every touched `.js` file after each edit (existing
project convention) — all clean. No browser has been available for most
of this polish arc, so live/visual verification (does the new layout
actually look balanced, does the atrium preview read as intended, does
the furniture filler look right at its placed scale) has relied on
numeric gap-arithmetic checks by construction rather than screenshots,
with several rounds driven by the user's own screenshots of the running
game pointing out what still needed fixing. Anything not yet confirmed
against a live screenshot is flagged as such inline in the code comments
it touches.
