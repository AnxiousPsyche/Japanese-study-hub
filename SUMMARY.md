# Session Summary — N5 Complete + N4/N3 Second Floor (last updated 2026-07-28)

## 1. Where things stand right now (read this first)

- **Current build:** two floors of a Phaser 3 top-down library game, both live on `main`.
  - **N5** (`assets/js/n5-phaser-game.js`, loaded from `pages/N5/n5-dashboard.html`) — complete.
    16 lesson shelves + 4 review piles + a printer station + 2 interactive TVs + a reception
    sensei + the staircase, all with full lesson content, all reachable, progression-gated,
    localStorage-persisted (`nekoBunko.n5.*`).
  - **N4/N3** (`assets/js/n4-phaser-game.js`, loaded from `pages/N4/n4-dashboard.html`) — merged
    to `main` and pushed to `origin/main` (commit `5116409`, includes the mezzanine polish pass
    below). Reached by completing N5's final quiz and clicking "Proceed to N4"
    on the staircase (real navigation, not a stub). The floor is split down the middle: left
    mezzanine wings = 12 N4 shelves on the left and 12 N3 shelves on the right, arranged as
    mirrored C-shaped balconies around an open central atrium. A rear walkway connects the wings;
    dark hardwood is procedural in the Phaser world, with layered CSS walnut paneling in
    `assets/css/n4-mezzanine.css` around the play frame. The two wings each have wooden atrium
    railings and an unobstructed view down to the first-floor library. The original N3 gate is now
    joined by a persistent N4 entrance gate (`n4-exam-gate`); each gate has its own saved exam state.
    The N3 side remains behind a real exam gate
    (`n3-exam-gate`, same 3-attempt/24h-cooldown mechanic as N5's staircase) that keeps the entire
    N3 column genuinely locked until both N4 review piles are done. **Only 3 shelves have full
    lesson content** (`n4-shelf-01`, `n4-shelf-05`, `n3-shelf-01` — the flagships); the other 21
    shelves and all 4 review piles have short placeholder pages (mark progress, unlock the next
    shelf, no real grammar content yet). Own localStorage namespace (`nekoBunko.n4.*`), confirmed
    non-colliding with N5's.
  - A HUD shortcut button ("N3 gate exam," top nav bar on the N4 dashboard) opens the exam gate
    directly once both N4 reviews are done, without needing to walk there — same interaction path
    as walking up to the gate, not a separate mechanism.
- **Mezzanine polish pass** (`docs/superpowers/specs/2026-07-28-n4-atrium-walls-jukebox-gates-design.md`,
  `docs/superpowers/plans/2026-07-28-n4-atrium-walls-jukebox-gates.md`, all 6 tasks complete,
  merged to `main` via commit `5116409` and pushed to `origin/main`):
  the open atrium now draws an illustrated "lower floor" void (tiled floor pattern, depth
  gradient, silhouette shelf blocks) instead of a flat color fill (`buildOpenAtriumVoid()` in
  `library-scene-shared.js`); the wall brick texture is a larger procedural pattern (32px blocks,
  mortar lines, per-brick shading) instead of a tight 16px image-crop tile (`createBrickWallTexture()`);
  a clickable decorative jukebox prop sits on the rear walkway (visual-only — no audio asset,
  `n4-dashboard.html` doesn't load `music-player.js`); and the left wing now has standalone N2/N1
  entrance-exam gate landmarks (`n2-exam-gate`/`n1-exam-gate`, `requires: []`, own persistence keys
  `nekoBunko.n4.n2Gate`/`nekoBunko.n4.n1Gate`, same 3-attempt/24h-cooldown mechanic as N4/N3's
  gates) — not wired into `SHELF_PREREQ` since no N2/N1 shelf content exists yet.
  `buildExamGate()` was also refactored into a reusable `createExamGateEntry()` factory shared by
  all four gates.
- **Mezzanine revision pass (uncommitted, in the working tree right now — not yet merged):**
  triggered by a user bug report that the atrium/walls/shelf positions still looked wrong live;
  investigation (systematic-debugging pass, no screenshot needed — confirmed via live DOM/physics
  inspection instead) found `createMezzanineShelfPositions()`'s shelf coordinates had drifted
  completely independent of `LAYOUT.row1Y`/`row2Y` when the wing grew from 8→12 shelves, so the 6
  wall-header/footer segments (built from `LAYOUT`) floated over empty floor while shelves
  clustered unevenly elsewhere — root-caused, fixed (shelf grid now generated FROM `LAYOUT`), and
  the header/footer walls removed per explicit request (no longer needed). On top of that fix, a
  full mezzanine redesign modeled directly on `n5-phaser-game.js`'s own patterns:
  - Review-pile cadence changed from 4-then-8 to 4-4-4 per side (`n4-review-1/2/3`,
    `n3-review-1/2/3`, 6 piles total, was 4), matching N5's own "1 pile per 4 shelves" rule exactly
    — `n4-shelf-09`'s prereq changed from a linear `n4-shelf-08` to `n4-review-2`; `n3-exam-gate`
    now requires all 3 N4 piles (was 2). `LAYOUT` restructured to `wing1RowY`/`wing2RowY`/
    `wing3RowY` + `review1Y`/`review2Y`/`review3Y` instead of the old 2-wing `row1Y`/`row2Y`.
  - The atrium's open void previously had **no collision at all** — the player could walk straight
    into it. `buildOpenAtriumVoid()` (`library-scene-shared.js`) was enriched (denser rows of
    shelf silhouettes in the mezzanine's own 2-column pattern, a corridor-color hint down the
    middle) and a new `buildAtriumFence()` (same file, reusable by any future mezzanine floor)
    draws a full-perimeter heavy-rail guard fence AND adds one invisible collision rectangle
    covering the whole void footprint to `wallGroup` — verified live: `wallGroup` bounds now
    exactly match the atrium's `left:392,top:510,width:368,height:910` rect.
  - A "top of the stairs" landmark (`buildStairsLandmark()`) was added at the west wall, reusing
    N5's own real staircase art crop (`ASSET_RECTS.staircase`, same `libassetpack-tiled.png` sheet
    — not new pixel art) with its own solid collision block. Player spawn (`buildPlayer()`) and the
    arrival rug (`buildFurniture()`) both moved from dead-center (`WORLD_W/2`) to a new
    `LAYOUT.entryX = 160`, beside the landmark, so arrival visibly ties to "the top of the stairs"
    instead of a bare center rug.
  - A visual mockup (HTML/canvas, matching the game's own procedural-drawing style + the real
    cropped staircase art) was built and approved before any of this was implemented — heavy-rail
    fence style (Option B) was the user's explicit pick.
  - Not yet done: mirroring this same fence/atrium visual work onto the N3 (right) side was
    implied by symmetry (the atrium/fence code is floor-wide, not per-wing, so it already applies
    to both sides) but hasn't been separately screenshotted/confirmed for N3.
  - **A lesson-content research/proofread pass is running in the background** (a spawned agent,
    not yet returned as of this update): proofreading the 3 written flagship lessons
    (`n4-shelf-01`, `n4-shelf-05`, `n3-shelf-01`) against reliable JLPT sources, plus researching
    real grammar-point content proposals for all 21 placeholder shelves. Nothing from this pass has
    been wired into `LESSON_CONTENT` yet — it's a research/proposal report only, to be posted for
    user review first.
- **Shared engine:** `assets/js/library-scene-shared.js` — movement/camera/collision/retro-menu/
  LessonBox glue extracted from N5, consumed by both floors via
  `Object.assign(SceneClass.prototype, LibrarySceneEngine)`. Any engine-level bug fix belongs
  here, not duplicated per-floor.
- **Architecture, persistence keys, and page-type field contracts are in `CLAUDE.md`** — read
  that first for "how does X work"; this file is for "where are we and what's next."
- **Design/plan docs for the N4/N3 build:** `docs/superpowers/specs/2026-07-27-n4-second-floor-design.md`,
  `docs/superpowers/plans/2026-07-27-n4-second-floor.md` (all 9 tasks + 1 additive HUD-button task
  complete; every checkbox reflects real, independently-reviewed state).

## 2. What's next (not started)

- **Immediate:** the shelf-position/wall-removal fix and the atrium/fence/staircase/review-pile
  redesign above are uncommitted in the working tree — review live, then commit (user commits
  their own work, per standing preference — don't auto-commit this).
- The lesson-content research/proofread agent (see above) hasn't returned yet — once it does, its
  report needs to be posted for user review, then (only after approval) wired into
  `LESSON_CONTENT` for the shelves it covers.
- N3-side visual confirmation of the atrium/fence redesign (the code is floor-wide so it should
  already apply symmetrically, but hasn't been separately screenshotted).

Per the design spec's explicit "Out of Scope" section for this pass:

- Full curated lesson content for the 21 placeholder N4/N3 shelves (only 3 flagships written so
  far), plus real "recap + quiz" content for all 6 N4/N3 review piles (was 4 piles/placeholder
  content — pile count changed this session, content itself is still placeholder for all 6).
- A return staircase from the N4/N3 floor back down to N5 (not built — one-way trip only).
- Real N2/N1 shelf content and floor layout — the N2/N1 entrance-exam gates now exist as
  standalone landmarks in the left wing (see "Mezzanine polish pass" above) but aren't wired
  into any lesson/shelf structure yet, same relationship N5's old staircase had to N4/N3 before
  this floor existed.
- Any shared save-slot/cross-floor progress dashboard beyond the current per-floor localStorage
  keys.

Flagged during the final whole-branch review as real, non-urgent maintenance debt:

- `n4-phaser-game.js` carries several helper functions copied byte-for-byte from
  `n5-phaser-game.js` (cat-avatar data, LessonBox content resolvers, shelf-decoration helpers)
  because `n4-dashboard.html` doesn't load `n5-phaser-game.js`. None of these are N5-specific —
  they belong in `library-scene-shared.js`. Worth a consolidation pass; until then, a future fix
  to one of these in N5 won't silently reach N4.
- `resolveConversationTurns` in `n4-phaser-game.js` references `ACTION_SPRITE_PATHS`, undefined
  there — harmless today (no N4/N3 lesson uses a `conversation` page yet), but will throw the
  moment one does. The consolidation above fixes this as a side effect.
- N4's shelf sprites render at their texture's native crop size rather than the `LAYOUT.shelfH`
  nominal value (a per-frame `setScale` call in `update()` overrides `setDisplaySize`) —
  confirmed via live screenshot to have no visual defect (crops carry transparent padding), and
  it's inherited verbatim from N5's own shelves, not an N4 regression. Documented in place
  (`n4-phaser-game.js`, `buildShelves()`) rather than fixed, since N5 ships the identical pattern.

## 3. How to resume

Name a specific item from section 2 above, or say "write the next N4/N3 lesson" and name which
shelf. Full task-by-task build history, including every per-task independent review's findings,
is in `docs/superpowers/plans/2026-07-27-n4-second-floor.md` (original floor build) and
`docs/superpowers/plans/2026-07-28-n4-atrium-walls-jukebox-gates.md` (mezzanine polish pass). If
the worktrees at `.claude/worktrees/n4-second-floor` and `.claude/worktrees/n4-mezzanine-polish`
still exist, each has its own `.superpowers/sdd/**/progress.md` with the complete review ledger
for that pass — both branches are already fully merged into `main`, so the worktrees themselves
are just historical review records at this point, safe to remove whenever they're in the way. No
re-deriving context needed.
