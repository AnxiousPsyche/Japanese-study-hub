# Session Summary — N5 Complete + N4/N3 Second Floor (last updated 2026-07-29)

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
  - **A large mezzanine geometry/visual pass landed this session** (mostly committed locally as
    `842dca4`, one small correction still uncommitted in `assets/js/n4-phaser-game.js`) — see the
    dedicated subsection below. Read this before touching layout/atrium/railing/gate code.
  - A HUD shortcut button ("N3 gate exam," top nav bar) opens the N3 exam gate's menu directly
    once both required N4 review piles are done, without walking there — same interaction path as
    walking up to the gate, not a separate mechanism.

### Map shrink + C-shape + rope-and-brass rail + N3 threshold wall (this session)

**Partially committed** — the user committed most of this pass themselves mid-session as
`842dca4` ("made changes to doors and stairs," covering `library-scene-shared.js` and
`n5-phaser-game.js`: jukebox promotion/N5 addition, `buildThresholdVeil`, door-gate texture
support, N1 drop). **Still uncommitted right now:** the very latest correction on top of that —
moving the frosted wall from the N3-side gap to the actual center hall and the matching
click-to-walk routing-detour fix, both in `assets/js/n4-phaser-game.js` only. Check `git status`
before assuming everything below is one unit.

Triggered by an explicit, detailed user spec superseding the mezzanine's earlier "physical N3
gate" and "generic wooden railing" treatment, then iterated twice more against live user feedback
(4 screenshots each round) after the first version's execution didn't land. All of this is real,
live-verified (via direct scene inspection — `wallGroup`/collision-body bounds, shelf/pile/gate
coordinates, `moveQueue` routing output), but **no actual screenshot has been taken by Claude this
entire session** — this session's Browser pane has `document.hidden = true` and Phaser's frame
counter is stuck at 1 no matter how long the wait, so no tween/animation could be watched play out
and no real render could be captured. Confirmed environment limitation, not a code defect, but it
means every visual judgment call below was made from code + live object-state inspection only —
keep checking these against the user's own screenshots, which is exactly how the two correction
rounds below got found.

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
- **N3's physical gate is gone — replaced by a frosted threshold wall across the CENTER hall**
  (`buildN3Mist()`/`updateN3MistState()`, plus a new shared `buildThresholdVeil()` in
  `library-scene-shared.js`): `n3-exam-gate`'s interactive entry, `x`/`y`, `requires`,
  `quizGateKey`, and the entire 3-attempt/24h-cooldown flow are byte-for-byte unchanged — only its
  presentation changed. `createExamGateEntry()` gained a `hideSprite: true` option (sprite alpha 0,
  no floating title label, empty-text glow/stamp so `refreshAllStates()`'s unconditional
  `.setVisible()` calls have nothing to reveal) used only for this gate; the shared
  `refreshAllStates()` itself gained a matching `entry.hideSprite` skip for the generic lock-dim
  alpha line. **Went through two live-feedback corrections** before landing:
  1. First version was a full-wing violet color wash (too flat/bug-looking) — replaced with a
     dithered "frosted glass" veil + door-posts (`buildThresholdVeil`), positioned in the N3-side
     corridor gap.
  2. That still read as "smeared across the wing" (its height was accidentally tied to
     `LAYOUT.entryY`, which had grown a lot from the SW-corner spawn move) and wasn't a real
     wall. Final version: a **fixed 80×140px band, dead-centered on `WORLD_W/2`** (the actual
     corridor/rug hall, not a side gap) **with real solid collision**, fading + removing its
     collider permanently the first time `progress['n3-exam-gate']` flips true
     (`tweens.killTweensOf` first, so the wisp's own looping drift tween doesn't fight the one-shot
     fade — a real bug found and fixed).
  - **Putting real collision on the center hall required a routing fix**, not just a placement
    choice: `handleInteractiveClick()`'s shared 3-waypoint route (`library-scene-shared.js`) always
    crosses `x = worldW/2` for literally every interactive on the floor (both N4 and N3 share the
    same Y-levels, mirrored) — solid collision there would have silently stranded click-to-walk to
    nearly the whole floor, not just N3. Fixed with an `N4LibraryScene.prototype.handleInteractiveClick`
    patch (same after-`Object.assign` technique as the mist hook) that detours the route around
    `this.n3MistBlock`'s east edge whenever a path would cross it — verified live for a target
    north of the wall (N2's door: routes around) and two south of it (an N4 and an N3 shelf: plain
    direct route, unaffected), and confirmed the detour stops being applied the instant the wall's
    collider is removed after unlock.
  - Wired via the same prototype-patch pattern already established for the mist hook — nothing in
    `library-scene-shared.js` itself knows about N3/doors/detours, so N5 is unaffected throughout.
- **Stairs landing — now a real cropped asset, not hand-drawn**: went through two versions too.
  First replaced N5's angled staircase crop with fully procedural brick-column art (didn't read as
  top-down); **final version crops the actual bottom-most tread of the same source staircase
  asset** (`ASSET_RECTS.lastStairStep = {x:935,y:140,w:100,h:35}`, its rounded drop-shadow
  terminus — identified by zooming into the actual sprite sheet with PowerShell/System.Drawing,
  not guessed) per explicit "just crop it, I don't care if only 1 step is seen" feedback. Purely
  decorative now (no collision — it's a single tread graphic, not a structure). Positioned flush
  in the literal southwest corner (`x:64`, bottom flush against the south wall strip); player spawn
  (`LAYOUT.entryX/entryY`) sits a few pixels north of it. **This reopened the "exactly 12 tiles to
  first shelf" constraint** from the earlier map-shrink pass — distance is now ~20.6 tiles, not 12 —
  flagged to the user, not silently dropped; no response yet on whether to restore it.
- **N2 gate is now a real pixel-art DOOR, not a book-pile sprite** (`drawDoorTexture()` — locked:
  dark wood + iron corner braces + brass keyhole; unlocked: parted leaves with warm light glowing
  through the gap; both drawn once via `scene.textures.exists` guard). `createExamGateEntry()`
  gained a `doorTextures: {locked, unlocked}` config; texture-swapping is wired through a new
  `N4LibraryScene.prototype.updateDoorGateTextures()`, called from the same refreshAllStates wrapper
  as the mist hook. **Position moved twice**: originally spec'd for the N4 (left) wing per the
  design's own "left wing, breaking the natural progression" instruction; live feedback then
  explicitly overrode that — final position is the **top-right corner of the N3 (right) wing**,
  flush toward its east spine wall. **N1 is dropped entirely for this pass** (was overlapping N2's
  label at the old position) — `EXAM_GATE_DATA.n1`/`N1_ENTRANCE_GATE_KEY` are left defined but
  unused, not deleted, in case a future pass wants it back.
- **Jukebox — now 3 instances, one per wing plus one in N5**: `cropJukeboxTexture()` moved from
  n4-phaser-game.js into `library-scene-shared.js` (parametrized `destKey`) so it's reusable across
  scenes/instances instead of copy-pasted. N4 and N3 each get their own copy flush against their
  own spine wall (was one shared copy floating on the rear walkway with no wall behind it); N5's
  `LibraryScene` (`n5-phaser-game.js`) now loads the same asset and builds a matching one too,
  flush against its own west wall between the top band and its first shelf zone. All still
  visual-only (no audio asset) — "the listening machine" functionality is an explicit future ask,
  not this pass.
- **Rear walkway's dark fill removed** — it read as an unexplained flat black rectangle sitting
  above the rope-and-brass rail; the fill + trim lines are gone, that strip of floor now just shows
  the ordinary hardwood texture.
  - All exam-gate positions and the jukebox are formula-derived from `LAYOUT`/`WORLD_W` where
    possible, not re-hardcoded blind, so they track any future rescale.
  - Known minor cosmetic overlap (not a functional bug, unchanged from the prior update): each
    wing-corner stub's X-range overlaps its nearest shelf sprite's first ~34px; the stub is depth
    0, the shelf depth 1, so the shelf should render in front — still worth a glance live.

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

- **Immediate:** the map-shrink/C-shape/rope-and-brass/N3-threshold-wall/door/jukebox pass (section
  1 above) is uncommitted — needs a live visual check in a real browser (this session verified
  everything via object/coordinate/routing inspection, never an actual render). Specifically worth
  a look: the N2 door in N3's top-right corner, the frosted wall's compact size at the center hall,
  the cropped last-stair-step art in the SW corner, and whether the scoped-down C-shape corner-stub
  approach (vs. the fuller reshape originally approved, still unconfirmed) is acceptable. Then
  commit (user commits their own work, per standing preference — don't auto-commit this).
- **Decide on the reopened 12-tile constraint** — moving spawn to the literal SW corner (per
  explicit request) undid the earlier "exactly 12 tiles, stairs to first shelf" requirement
  (now ~20.6 tiles). Fix is straightforward (pull wing1 closer) if wanted.
- Real "recap + quiz" content for all 6 N4/N3 review piles — still placeholder (the 21-shelf
  content pass explicitly didn't cover these).
- N1's own door — dropped for this pass (see section 1); data structures (`EXAM_GATE_DATA.n1`,
  `N1_ENTRANCE_GATE_KEY`) are still there, unused, ready for a future pass once N2's design/position
  are confirmed live.

Per the design spec's explicit "Out of Scope" section for the original build:

- A return staircase from the N4/N3 floor back down to N5 (not built — one-way trip only).
- Real N2 shelf content and floor layout beyond the door landmark itself — N2's door exists and is
  interactive (3-attempt/24h-cooldown, same mechanic as every other gate) but isn't wired into any
  lesson/shelf structure yet, same relationship N5's old staircase had to N4/N3 before this floor
  existed.
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

If picking this up mid-session: check `git status`/`git diff` first — as of this update, only
`assets/js/n4-phaser-game.js` and `.claude/launch.json` (a new preview-port entry) are modified but
uncommitted. Everything else, including most of the map-shrink/C-shape/rope-and-brass/door/jukebox
pass, is already committed locally as `842dca4` ("made changes to doors and stairs" — the user's
own commit, not Claude's) on top of the fully-pushed `761facb`. The remaining uncommitted piece in
`n4-phaser-game.js` is specifically: the frosted wall's move to the center hall + the
click-to-walk routing-detour fix that move required (see section 1's last subsection). Confirm
`842dca4` is pushed to `origin/main` if that matters for your workflow — this summary doesn't
assume it is.

Before building anything further on top of the current layout, get a live human screenshot check
of the whole pass (see section 2's "Immediate" item) — every visual judgment call in section 1 was
made from code + live object-state inspection only, never an actual render, purely because the
Browser pane couldn't composite frames all session (`document.hidden = true`, frame counter stuck
at 1 — confirmed environment issue, not something that will just clear up on its own next time).

Otherwise, name a specific item from section 2, or say "write the next N4/N3 lesson" and name
which review pile (the 6 piles are the only remaining placeholder content). Full task-by-task
build history for the ORIGINAL floor build + the prior mezzanine polish pass (both merged to
`main`), including every per-task independent review's findings, is in
`docs/superpowers/plans/2026-07-27-n4-second-floor.md` and
`docs/superpowers/plans/2026-07-28-n4-atrium-walls-jukebox-gates.md`. If the worktrees at
`.claude/worktrees/n4-second-floor` and `.claude/worktrees/n4-mezzanine-polish` still exist, each
has its own `.superpowers/sdd/**/progress.md` review ledger — safe to remove whenever they're in
the way, no re-deriving context needed from them.
