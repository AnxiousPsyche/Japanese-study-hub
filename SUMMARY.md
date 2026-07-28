# Session Summary — N5 Complete + N4/N3 Second Floor (last updated 2026-07-28)

## 1. Where things stand right now (read this first)

- **Current build:** two floors of a Phaser 3 top-down library game.
  - **N5** (`assets/js/n5-phaser-game.js`, loaded from `pages/N5/n5-dashboard.html`) — complete.
    16 lesson shelves + 4 review piles + a printer station + 2 interactive TVs + a reception
    sensei + the staircase, all with full lesson content, all reachable, progression-gated,
    localStorage-persisted (`nekoBunko.n5.*`).
  - **N4/N3** (`assets/js/n4-phaser-game.js`, loaded from `pages/N4/n4-dashboard.html`) — merged
    to `main`/pushed to `origin/main` through commit `761facb`. Reached by completing N5's final
    quiz and clicking "Proceed to N4" on the staircase (real navigation, not a stub). **All 24
    shelves now have real, source-verified JLPT grammar content** (`n4-shelf-01`..`12`,
    `n3-shelf-01`..`12` — the last 21 were written and committed this session; only the 4→6
    review piles are still placeholder, see section 2). Own localStorage namespace
    (`nekoBunko.n4.*`), confirmed non-colliding with N5's.
  - **A large mezzanine geometry/visual pass is uncommitted in the working tree right now**
    (`assets/js/n4-phaser-game.js`, `assets/js/library-scene-shared.js`) — see the dedicated
    subsection below. Read this before touching layout/atrium/railing/gate code.
  - A HUD shortcut button ("N3 gate exam," top nav bar) opens the N3 exam gate's menu directly
    once both required N4 review piles are done, without walking there — same interaction path as
    walking up to the gate, not a separate mechanism.

### Uncommitted: map shrink + C-shape + rope-and-brass rail + N3 mist (this session, latest pass)

Triggered by an explicit, detailed user spec superseding the mezzanine's earlier "physical N3
gate" and "generic wooden railing" treatment. All of this is real, live-verified (via direct scene
inspection — `wallGroup` body bounds, shelf/pile/gate coordinates, mist state), but **not yet
screenshotted** — this session's Browser pane has `document.hidden = true` and Phaser's frame
counter is stuck at 1 no matter how long the wait, so no tween/animation could be watched play out
and no real screenshot could be taken. That's a confirmed environment limitation (also explains
every earlier screenshot failure this session), not a code defect — but it means a human needs to
eyeball this live before it's considered done.

- **Foundational bug fix (had to happen before any rescale could be trusted):** shelf/pile/gate
  sprites previously rendered at their texture's native crop size, not the `LAYOUT`-requested
  `setDisplaySize`, because `update()`'s per-frame proximity-pulse loop called
  `sprite.setScale(baseScale * pulseFactor)` every frame, which silently overwrites
  `setDisplaySize()` (a long-flagged, "works by accident" quirk inherited from N5 — see git
  history). Fixed: every interactive entry now stores its own `displayW`/`displayH` at creation,
  and `update()` calls `setDisplaySize(displayW * pulseFactor, displayH * pulseFactor)` instead of
  `setScale`. N5 was not touched (out of scope; its own copy of this quirk is undisturbed).
- **Map shrunk so stairs→first-shelf is exactly 12 tiles (192px)**, per explicit user requirement,
  rescaling proportionally (not just the one gap) while leaving every sprite's own pixel footprint
  (shelfW/H, pile/gate sizes) untouched — only pure floor-space gaps shrink, since resizing
  pixel-art crops by a non-clean ratio would blur them under `pixelArt:true`. `WORLD_W` 1152→800,
  `WORLD_H` 2080→1376, `GRID_COLS` 72→50 (kept even — `buildWalls()`'s top/bottom brick strips loop
  in 32px blocks with no remainder handling), `GRID_ROWS` 130→86. `LAYOUT`'s wing/review-pile Y
  values were fully rederived (not just multiplied) from a gap-by-gap breakdown of the old layout —
  every consecutive pair checked positive-gap (no overlaps) before writing any code. Live-verified:
  distance from actual player spawn to the actual nearest shelf sprite edge = exactly 192px = 12.0
  tiles.
- **C-shape wing geometry — a scoped-down version of what was approved, flagged to the user as a
  real deviation:** the approved option was a full concave floor reshape; what got built instead is
  four short new wall "corner" stubs (`buildWingCorners()`, reusing `buildWalls()`'s own brick
  texture) at each spine/arm junction, with real collision, rather than actually re-shaping the
  atrium/floor boundary — a true concave notch would have required either moving the atrium-facing
  rail (contradicting the explicit "full-height, every atrium-facing edge" rail instruction) or
  walling off the shelf-to-corridor path (risking breaking existing auto-walk routing). **User has
  not yet confirmed whether this compromise is acceptable** — surfaced clearly, not silently
  substituted.
- **Rope-and-brass railing** replaces the previous "heavy gold-capped rail" fence entirely:
  `buildAtriumFence()` (`library-scene-shared.js`) now draws tapered brass posts (thicker base,
  rounded cap, fixed-direction highlight/shadow — this codebase has no actual lantern/light-source
  objects despite "lantern lighting" appearing in the original design-spec prose, confirmed by
  grep, so a fixed-direction fake was used instead of building a whole lighting system) with thick
  hemp rope strung between posts in a parabolic catenary sag (bulging toward the atrium's center on
  every edge — a deliberate physical simplification, noted in-code). Same collision mechanism as
  before (one invisible rect over the full atrium footprint, added to `wallGroup`) — this was a
  pure rendering swap, not a collision change. `buildOpenAtriumVoid()` was also enriched with
  denser shelf-silhouette rows for the "first floor visible below" effect (already done in the
  prior session pass, unchanged here).
- **N3's physical gate is gone — replaced by a full-wing violet mist**
  (`buildN3Mist()`/`updateN3MistState()`): `n3-exam-gate`'s interactive entry, `x`/`y`,
  `requires`, `quizGateKey`, and the entire 3-attempt/24h-cooldown flow are byte-for-byte
  unchanged — only its presentation changed. `createExamGateEntry()` gained a `hideSprite: true`
  option (sprite alpha 0, no floating title label, empty-text glow/stamp so `refreshAllStates()`'s
  unconditional `.setVisible()` calls have nothing to reveal) used only for this gate. A new
  `config: hideSprite` also required a small, backward-compatible addition to the SHARED
  `refreshAllStates()` (`library-scene-shared.js`): entries with `entry.hideSprite` skip the
  generic lock-dim alpha line, since that would otherwise fight the intentional alpha-0. The mist
  itself is a translucent violet (`0x4a3a6b`) Graphics overlay + a few slow-tweening Ellipse
  "wisps" covering the wing's full floor/shelf area, built once and faded out (`tweens.killTweensOf`
  first, to stop the ambient wisp-drift tweens from fighting the one-shot fade — a real bug found
  and fixed mid-session) permanently the first time `progress['n3-exam-gate']` flips true. Wired via
  a prototype-patch AFTER `Object.assign(N4LibraryScene.prototype, LibrarySceneEngine)` (wrapping
  `refreshAllStates` to also call `updateN3MistState()`) rather than a class-body override, because
  a same-named class-body method would just get clobbered by that `Object.assign` call — this
  keeps `library-scene-shared.js` itself untouched by the mist concept, so N5 is unaffected.
- **Stairs landing redesigned from scratch** (`buildStairsLandmark()`): the prior session's version
  reused N5's actual staircase image crop; this was replaced with a small purpose-built procedural
  top-down composition (brick columns flanking a dark corridor, 3 receding stair-tread bands)
  matching this file's own brick/floor drawing conventions, since the raster crop didn't read
  correctly in a flat top-down camera. Centered exactly on `LAYOUT.entryX` so the player spawns in
  the middle of the depicted corridor; only the two brick columns are solid, the corridor between
  them (where the player actually stands) stays open.
  - All exam-gate positions (`n4`/`n3`/`n2`/`n1`) and the jukebox were repositioned to fit the new,
    smaller world — all formula-derived from `LAYOUT` where possible, not re-hardcoded blind.
  - Known minor cosmetic overlap (not a functional bug): each new wing-corner stub's X-range
    overlaps its nearest shelf sprite's first ~34px; the stub is depth 0, the shelf depth 1, so the
    shelf should render in front — worth a glance in the live screenshot.

- **Shared engine:** `assets/js/library-scene-shared.js` — movement/camera/collision/retro-menu/
  LessonBox glue extracted from N5, consumed by both floors via
  `Object.assign(SceneClass.prototype, LibrarySceneEngine)`. Any engine-level bug fix belongs
  here, not duplicated per-floor. (N4-only behavior that must NOT leak into N5 — like the N3 mist
  hook above — gets patched onto `N4LibraryScene.prototype` afterward instead, per the pattern
  just established.)
- **Architecture, persistence keys, and page-type field contracts are in `CLAUDE.md`** — read
  that first for "how does X work"; this file is for "where are we and what's next."
- **Design/plan docs for the ORIGINAL N4/N3 build:** `docs/superpowers/specs/2026-07-27-n4-second-floor-design.md`,
  `docs/superpowers/plans/2026-07-27-n4-second-floor.md`, plus the prior mezzanine-polish pass's
  own spec/plan docs (`docs/superpowers/specs/2026-07-28-n4-atrium-walls-jukebox-gates-design.md`,
  `docs/superpowers/plans/2026-07-28-n4-atrium-walls-jukebox-gates.md`) — all already merged.
  **This session's shelf-position fix, review-pile restructuring, and the map-shrink/C-shape/
  rope-and-brass/N3-mist pass above have no spec/plan doc** — both moved fast off direct user
  feedback + live debugging rather than the usual brainstorm→spec→plan flow.

## 2. What's next (not started)

- **Immediate:** the map-shrink/C-shape/rope-and-brass/N3-mist pass (section 1 above) is
  uncommitted — needs a live visual check in a real browser (screenshots of: the C-shape/atrium
  view, the stair landing with the cat spawned, the 12-tile distance, and the N3 mist in both
  locked/lifted states), and a decision on whether the scoped-down C-shape corner-stub approach is
  acceptable versus the fuller reshape that was originally approved. Then commit (user commits
  their own work, per standing preference — don't auto-commit this).
- Real "recap + quiz" content for all 6 N4/N3 review piles — still placeholder (the 21-shelf
  content pass explicitly didn't cover these).
- N3-side visual confirmation generally (the atrium/rail code is floor-wide, so it should already
  apply symmetrically to N3, but hasn't been separately screenshotted this pass either).

Per the design spec's explicit "Out of Scope" section for the original build:

- A return staircase from the N4/N3 floor back down to N5 (not built — one-way trip only).
- Real N2/N1 shelf content and floor layout — the N2/N1 entrance-exam gates exist as standalone
  landmarks in the left wing but aren't wired into any lesson/shelf structure yet, same
  relationship N5's old staircase had to N4/N3 before this floor existed.
- Any shared save-slot/cross-floor progress dashboard beyond the current per-floor localStorage
  keys.

Flagged during past whole-branch review as real, non-urgent maintenance debt:

- `n4-phaser-game.js` carries several helper functions copied byte-for-byte from
  `n5-phaser-game.js` (cat-avatar data, LessonBox content resolvers, shelf-decoration helpers)
  because `n4-dashboard.html` doesn't load `n5-phaser-game.js`. None of these are N5-specific —
  they belong in `library-scene-shared.js`. Worth a consolidation pass; until then, a future fix
  to one of these in N5 won't silently reach N4.
- `resolveConversationTurns` in `n4-phaser-game.js` references `ACTION_SPRITE_PATHS`, undefined
  there — harmless today (no N4/N3 lesson uses a `conversation` page yet), but will throw the
  moment one does. The consolidation above fixes this as a side effect.

## 3. How to resume

If picking this up mid-session: check `git status`/`git diff` first. As of this update,
`assets/js/n4-phaser-game.js`, `assets/js/library-scene-shared.js`, and `.claude/launch.json`
(just a new preview-port entry) are modified but uncommitted — that's the entire map-shrink/
C-shape/rope-and-brass/N3-mist pass described in section 1. Everything else (the full 24-shelf
lesson content, the earlier shelf-position fix and 4→6 review-pile restructuring, the original
mezzanine polish pass) is already committed and pushed to `origin/main`.

Before building anything further on top of the current layout, get a live human screenshot check
of the uncommitted pass first (see section 2's "Immediate" item) — several of its choices (the
C-shape scope-down in particular) were made without the usual visual confirmation loop this
session otherwise relies on, purely because the Browser pane couldn't composite frames this
session.

Otherwise, name a specific item from section 2, or say "write the next N4/N3 lesson" and name
which review pile (the 6 piles are the only remaining placeholder content). Full task-by-task
build history for the ORIGINAL floor build + the prior mezzanine polish pass (both merged to
`main`), including every per-task independent review's findings, is in
`docs/superpowers/plans/2026-07-27-n4-second-floor.md` and
`docs/superpowers/plans/2026-07-28-n4-atrium-walls-jukebox-gates.md`. If the worktrees at
`.claude/worktrees/n4-second-floor` and `.claude/worktrees/n4-mezzanine-polish` still exist, each
has its own `.superpowers/sdd/**/progress.md` review ledger — safe to remove whenever they're in
the way, no re-deriving context needed from them.
