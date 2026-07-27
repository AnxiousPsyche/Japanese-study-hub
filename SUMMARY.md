# Session Summary — N5 Complete + N4/N3 Second Floor (last updated 2026-07-28)

## 1. Where things stand right now (read this first)

- **Current build:** two floors of a Phaser 3 top-down library game, both live on `main`.
  - **N5** (`assets/js/n5-phaser-game.js`, loaded from `pages/N5/n5-dashboard.html`) — complete.
    16 lesson shelves + 4 review piles + a printer station + 2 interactive TVs + a reception
    sensei + the staircase, all with full lesson content, all reachable, progression-gated,
    localStorage-persisted (`nekoBunko.n5.*`).
  - **N4/N3** (`assets/js/n4-phaser-game.js`, loaded from `pages/N4/n4-dashboard.html`) — just
    merged (commit `40a5166`). Reached by completing N5's final quiz and clicking "Proceed to N4"
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

Per the design spec's explicit "Out of Scope" section for this pass:

- Full curated lesson content for the 21 placeholder N4/N3 shelves (only 3 flagships written so
  far), plus real "recap + quiz" content for all 4 N4/N3 review piles (currently placeholder,
  same as the shelves).
- A return staircase from the N4/N3 floor back down to N5 (not built — one-way trip only).
- A further "N2 is coming soon" stub gate past the N3 side's completion (mirrors how N5 itself
  was stubbed before this floor existed — not built this pass).
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
is in `docs/superpowers/plans/2026-07-27-n4-second-floor.md`; if the worktree at
`.claude/worktrees/n4-second-floor` still exists, `.superpowers/sdd/progress.md` there has the
complete review ledger. No re-deriving context needed.
