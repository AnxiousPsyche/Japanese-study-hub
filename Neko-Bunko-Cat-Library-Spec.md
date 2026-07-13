# Neko Bunko (猫文庫) — Cat-Avatar JLPT N5 Library
### Detailed Spec for Claude Code — v2 (extends N5-Library-Build-Spec.md)

---

## 1. Core Premise

The player IS a cat. There is no human character anywhere. The library is the
entire app: no separate dashboard screen, no lesson-list menu. The cat roams a
top-down 2D pixel library; bookshelves ARE the lessons; walking up to a shelf
and interacting opens that lesson. Progress is expressed spatially — you
literally walk deeper into the library as you advance.

Tone: cozy, Stardew-Valley-adjacent, but with a COOLER pastel palette
(sage, lavender, cream) instead of Stardew's warm oranges.

---

## 2. The Cat Avatar

- **Sprite**: 4-directional top-down cat (up/down/left/right), 3–4 frames per
  walk cycle. Reference: standard "top down pixel cat sprite sheet" packs on
  itch.io / OpenGameArt. 16px or 32px to match tileset scale.
- **Idle animation**: when standing still >2s, play idle frames — tail flick,
  ear twitch, occasional sit + slow blink. This is important: the cat should
  never feel like a frozen cursor.
- **Movement**: WASD / arrow keys, 4-directional grid-ish movement (free
  movement with collision is fine too). Speed ~2 tiles/sec walking.
- **Optional flavor motions** (nice-to-have, not v1-blocking):
  - Cat does a small "stretch" animation when a lesson is completed
  - Cat sits when the lesson panel is open (visible behind/beside the modal)
  - Random autonomous "sniff" animation when near plants
- **Customization hook**: structure the sprite loading so cat color/pattern
  (cream tabby, gray, calico, black) can be swapped later via one config value.

## 3. NPC Cats (world flavor + checkpoints)

- **Sensei-cat** (lavender/gray cat with tiny glasses or a scarf): sits at
  each Review Nook. Interacting with sensei-cat starts the Review quiz.
  Idle animation: slowly turning a page.
- **Librarian-cat** (optional): behind the front desk, gives a one-line
  tooltip hint about where the next unlocked shelf is ("The next book you
  need is on the west wall, nya").
- NPC cats never move rooms; small idle loops only. Keep them cheap.

---

## 4. World Layout (tile map)

Top-down single room, symmetric left/right, based on the reference library
image but re-palettized. Suggested map size: ~40×30 tiles at 16px
(640×480 logical, scale up 2x for display).

From top (north) to bottom (south):

1. **Entrance alcove (north center)** — spawn point. Soft lavender
   stained-glass window, parted cream curtains. Cat spawns here each session
   facing south.
2. **Short staircase** descending from alcove into main hall (walkable ramp
   tiles or just visual steps with no elevation logic).
3. **Upper shelf wings (left + right of staircase)** — 2 shelf units per
   side. These hold Lessons 1–4 (west) and 5–8 (east). Each shelf has a
   small wooden sign plaque with lesson number + short title.
4. **Central rug/path** — a lavender-dusty runner going north–south. This is
   the "critical path": tiles on it are 1 shade brighter, subtly guiding the
   player forward.
5. **Mid-hall REVIEW NOOK (center)** — cushion + low table + sensei-cat +
   warm lamp glow. This is the **Foundations Review** checkpoint (after
   Lesson 8).
6. **Lower shelf wings (left + right)** — Lessons 9–13 (west) and the
   Sentence Builder Review nook sits between/after them (second cushion +
   sensei-cat).
7. **Deep shelves (south wings)** — Lessons 14–17 (Sentence Construction,
   Particle Mastery, Existence あります・います split across final shelves).
8. **South wall, center: FINAL QUIZ altar** — a grander gold-trimmed
   shelf/lectern with a glowing book. Distinct silhouette from normal shelves.
9. **Front desk (near south exit)** — the in-world HUD (see Section 6).
10. **Decor scattered throughout**: reading tables + chairs (2 per side),
    potted plants, a globe on one table, wall lamps, non-interactive display
    shelves along outer walls, benches by the south door.

**Collision**: walls, shelves, tables, desk, plants = solid. Rug, floor,
stairs = walkable. Interaction trigger zones extend 1 tile in front of each
interactive object (bigger than the collision box, so it feels forgiving).

---

## 5. Lesson System (shelves)

### Lesson list & shelf order (walk-order = curriculum order)
1. Basic Greetings
2. Everyday Expressions
3. Self Introduction
4. A は B です
5. Demonstratives
6. Questions (か)
7. Numbers & Counters
8. Places and Directions
— **📚 Foundations Review** (Review Nook 1, sensei-cat)
9. Nouns & Pronouns
10. Adjectives
11. Adverbs and Verbs
12. Conjugations
— **📚 Sentence Builder Review** (Review Nook 2, sensei-cat)
13. Sentence Construction
14. Particle Mastery
15. Existence (あります・います)
— **🏆 Final Quiz** (gold altar, south wall)

### Shelf visual states (no icons needed — the shelf itself communicates)
- **Locked**: shelf dimmed ~50% opacity, book spines desaturated gray,
  sign plaque unreadable/blank. Interacting shows a soft "…" bubble from the
  cat (it can't read it yet).
- **Available (next up)**: full color spines + soft pulsing warm-gold outline
  glow. Only ONE shelf glows at a time — the next lesson.
- **Completed**: full color, no glow, small green check/stamp on the plaque.
- **Review nooks**: cushion glows lavender when unlocked; sensei-cat has a
  "!" bubble.

### Book spine color coding (per shelf, cosmetic)
- Grammar-focused lessons → terracotta #C97B63 dominant spines
- Vocabulary/expression lessons → dusty gold #D9A05B dominant
- Particle/structure lessons → lavender #B99BC7 dominant
- Mix in sage #8FA68E and teal #7FA8A3 as filler spines everywhere

### Interaction flow
1. Cat walks into a shelf's trigger zone → floating prompt appears:
   `[E] Read` (or tap/click the shelf while in range).
2. Movement pauses; lesson panel opens as an overlay (HTML modal over the
   canvas is fine — easier to style text than in-canvas UI).
3. Panel shows: lesson number + title (EN + JP), lesson content
   (placeholder for now), and a "Finish lesson" button.
4. On finish: panel closes, shelf flips to Completed, next shelf begins
   glowing, cat plays a stretch animation, +XP toast.
5. Esc or close button exits without completing.

### Progression rules
- Lessons unlock strictly in order.
- Review Nook 1 unlocks after Lessons 1–8 complete; passing it unlocks 9.
- Review Nook 2 unlocks after 9–12; passing unlocks 13.
- Final Quiz unlocks after 13–15 (i.e., all lessons) complete.
- Persist progress in localStorage for v1 (note: if this ever runs as a
  claude.ai artifact, localStorage is unavailable — keep the persistence
  layer behind a small save/load interface so it can be swapped).

### Data model
```js
{
  id: "n5-04",
  order: 4,
  title_en: "A wa B desu",
  title_jp: "AはBです",
  type: "lesson",          // "lesson" | "review" | "final_quiz"
  spineTheme: "grammar",   // maps to spine palette
  shelfId: "shelf_west_04",// ties to map object
  status: "locked",        // "locked" | "available" | "completed"
  content: { ... }         // placeholder; swappable later
}
```

---

## 6. In-World HUD (the front desk)

No floating header bar. The desk near the south door IS the HUD:
- **Stamp card** pinned to desk: one stamp per completed lesson (17 slots +
  2 review seals + 1 final seal). Walking to the desk and interacting zooms
  into the stamp card = progress screen.
- **Book stack** on the desk: physical pile whose height = remaining
  lessons. Shrinks as you progress. This replaces any "upcoming lessons"
  list — upcoming is simply visible as remaining books.
- **Bell** on desk: interact = toggles music/ambience.
- Small always-on corner widget is allowed for practical minimums
  (XP number + current lesson name), but keep it tiny and pastel —
  everything else lives in the world.

---

## 7. Palette (authoritative — reuse everywhere)

| Role | Hex |
|---|---|
| Floor/wall base cream | #F3EFE6 |
| Floor alt tile | #EDE7D9 |
| Shelf wood (sage) | #8FA68E |
| Shelf wood dark | #7C947B |
| Rug / accent lavender | #B99BC7 / #CBBBD1 |
| Terracotta accents (desk, spines) | #C97B63 |
| Dusty gold (spines, glow) | #D9A05B / #F0D889 |
| Soft teal accent | #7FA8A3 |
| Player cat cream | #F0DCC0 |
| Sensei cat lavender-gray | #9B8AA6 |
| Text/ink | #5A4A3A |
| Locked/desaturated | #ABABAB at 50% opacity |

Lighting: no harsh shadows; soft radial warm glows under lamps and around
the available shelf, done with low-opacity overlay sprites.

---

## 8. Tech Notes

- **Phaser 3**, one main Scene for the library + a UI Scene (or HTML overlay)
  for lesson panels.
- Tilemap via Tiled JSON export preferred; hand-coded array acceptable.
- Assets: free itch.io packs (LimeZu interiors for furniture/shelves; any
  free top-down cat sprite pack for avatars). If exact pastel colors aren't
  available in a pack, apply a palette-swap/tint pass or recolor the
  spritesheet once — do NOT tint per-frame at runtime.
- Camera: fixed if the whole map fits; otherwise follow-cam with soft lerp
  and map-edge clamping.
- Sound (optional v1): soft lo-fi loop, page-flip SFX on lesson open, tiny
  "mya" on interaction.

## 9. Build Order

1. Map + collision with placeholder tiles
2. Cat movement + idle animation
3. Shelf trigger zones + `[E] Read` prompt
4. Lesson data model + modal panel + completion flow
5. Lock/glow/complete shelf states + progression logic
6. Review nooks + sensei-cat + Final Quiz altar
7. Desk HUD (stamp card, book stack, bell)
8. Real tileset + palette pass
9. Polish: NPC idle loops, glow pulses, SFX
