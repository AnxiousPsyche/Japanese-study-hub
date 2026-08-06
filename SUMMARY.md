# Session Summary — N5 + N4 content-complete, font/proofread/debug pass (last updated 2026-08-04)

## 1. Where things stand right now (read this first)

- **Current build:** two floors of a Phaser 3 top-down library game, both content-complete.
  - **N5** (`assets/js/n5-phaser-game.js`, loaded from `pages/N5/n5-dashboard.html`) — 16 lesson
    shelves + 4 review piles + a printer station + 2 interactive TVs (hiragana/katakana viewers) +
    a reception sensei + the staircase, all with full lesson content, all reachable, progression-
    gated, localStorage-persisted (`nekoBunko.n5.*`).
  - **N4** (`assets/js/n4-phaser-game.js`, loaded from `pages/N4/n4-dashboard.html`) — **a single
    consolidated 16-shelf floor**, not the two-wing "N4 + N3" split described in section 4 below.
    That earlier two-wing mezzanine design (map-shrink, C-shape wings, rope-and-brass rail, N3
    threshold mist, 3 separate jukeboxes, etc.) was fully replaced in a later pass ("rebuild N4/N3
    shelves per user's grammar list" → "implement consolidated N4-only floor in code"). Current
    N4 floor: `n4-shelf-01`..`16` (full JLPT N4 grammar coverage), 4 review piles (`n4-review-1`..
    `4`, **now fully built** — recap tables + quiz banks, no longer placeholder), 4 reading-room
    passages (`n4-reading-01`..`04`), one jukebox (`n4-jukebox`), one Vocabulary Press
    (`n4-vocab-press`), a Study Corner and Rest Area furniture nook, and one functional exam gate
    (`n2-exam-gate`, "N2 Entrance Exam"). `EXAM_GATE_DATA.n1` is still defined but not built into an
    actual interactive — future work, not a bug. Own localStorage namespace (`nekoBunko.n4.*`),
    confirmed non-colliding with N5's.
  - Reached from N5 by completing N5's final quiz and clicking "Proceed to N4" on the staircase.

### This session's work (4 user-directed tasks, completed in order, each reported separately)

Ground rules for this pass: stay scoped to these 4 tasks, don't refactor unrelated code, search
rather than assume when structure was unclear, preserve the existing palette/pixel-art aesthetic
(a font/content/bug pass, not a redesign).

1. **Font audit** — full list of every font declaration across the codebase (CSS `@font-face`,
   Phaser text configs, Google Fonts links), with file/line/scope (Latin/Japanese/both).
2. **Shelf plaque titles → Space Mono** — `createBookshelfLabel()` (both N5's and N4's local copy)
   now renders shelf/pile plaque titles in self-hosted Space Mono (400/700 + italic; new files
   `assets/fonts/SpaceMono-{Regular,Bold,Italic,BoldItalic}.woff2` + matching `@font-face` blocks in
   `assets/css/lesson-box.css`), keeping the `DotGothic16` fallback for Japanese-mixed titles.
   Space Mono's glyphs measured ~53% wider than VT323 via `fontTools`/`brotli` — fixed with
   per-shelf/per-floor `fontSize`/`maxWidth` tuning (not a blanket size cut) verified against a
   custom word-wrap simulator, rather than letting long titles wrap/collide.
3. **Proofread + fact-check all N5 + N4 lesson content** — read every page of both floors' full
   `LESSON_CONTENT` against Tofugu/Wasabi/Bunpro/Tae Kim's Guide/imabi/Jisho.org/JLPT official
   lists. Added a "Sources" page as the final page of 22 N5 lessons/kana-viewers and 25 N4
   lessons/reading-rooms/jukebox. Fixes made: を/ヲ romaji inconsistency in N5's kana viewers
   (`wo`→`o`, matching each page's own prose); a passive/active grammar error in `n4-reading-04`
   (親切な人に道を聞かれて → 聞いて, plus romaji/translation); a content gap in `n4-shelf-14` where
   the plaque promised つもり content that was never written (added the grammar point + a quiz
   question). **N4's 4 review piles had zero LessonBox content** (no recap, no quiz) — flagged via
   `AskUserQuestion` as a scope question rather than assumed; user said "build them now," so all 4
   were built from scratch, matching N5's review-pile structure (recap tables, a "trickiest point"
   grammar-intro page, a `quiz-review`/`quiz-answers`/`quiz-score` group, a Sources page).
4. **Full front-end debug pass** — static-analysis sweep (console errors, broken assets,
   listener/interactivity bugs, collision/movement, memory) found and fixed 5 bugs:
   - N4's "🐱 Change" cat-color button was dead (no `CatSelectScene` existed on N4's separate
     `Phaser.Game` instance). Asked the user full-build vs. minimal-disable vs. flag-only; **user
     chose full build** — added `N4CatSelectScene` (ported from N5's `CatSelectScene`) to
     `n4-phaser-game.js`, `N4LibraryScene.prototype.setPlayerCatColor()`, registered the scene, and
     wired `#changeCharBtn` (same defensive pattern as the existing `#n3GateExamBtn` wiring, which
     is itself now permanently inert — see section 4, the N3 wing it targeted no longer exists).
   - `lesson-box.js`'s try-it drag-and-drop left 4 orphaned `document`-level listeners + a lifted
     tile clone if the box closed/re-rendered mid-drag. Fixed with a tracked `activeDragCleanup`
     hook invoked by `render()`/`close()`.
   - `library-scene-shared.js`'s `startLesson()` could soft-lock the game (keyboard permanently
     disabled, no dialogue open to recover) if anything threw during page preprocessing. Wrapped in
     try/catch that always restores `panelOpen`/`keyboard.enabled`.
   - `n4-phaser-game.js`'s `resolveConversationTurns()` referenced `ACTION_SPRITE_PATHS`, which was
     never defined in that file — a latent `ReferenceError` waiting for the first N4 `'conversation'`
     page (none exist yet). Copied the constant over from N5's copy. **This resolves the
     "maintenance debt" item flagged in the old section 4/section-2 list below — no longer an open
     item.**
   - `openInteraction()`'s `'npc'` branch skipped the `hasContent` guard every other interaction
     type gets. Added the same guard (falls back to a toast) so a future content-less npc entry
     fails visibly instead of silently.
   - `node --check` passed clean on all 4 touched JS files after every edit batch.
   - **Flagged, not fixed** (need a live browser to confirm rather than guessing): a possible
     spritesheet re-queue warning when a `CatSelectScene`/`N4CatSelectScene` overlay reopens after
     the map's already loaded once; a possible `moveQueue` stuck-state near N4's atrium fence; the
     LessonBox dialogue portrait always showing the player's own cat color even when labeled
     "Neko-sensei"; and general visual/position confirmation of the brand-new `N4CatSelectScene`
     overlay (built and syntax-checked this session, never rendered in an actual browser).

### Follow-on work this same session, after the debug pass (9 more user-directed tasks)

The 4-task pass above was followed by a much longer run of separate, user-directed requests in the
same session — some content (a real graded exam), some new interactive LessonBox components (each
built via the "show me mockups first" workflow), some fixes to bugs the user hit live in a real
browser, and one proofreading-scale audit. Listed in the order they happened:

5. **N4 entrance exam built for real** — the staircase's exam gate (in-game label "N2 Entrance
   Exam"; underlying key `final-quiz`) previously fell back to an old Pass(test)/Fail(test) stub.
   Built a real 20-question exam (10 multiple-choice + 10 fill-in-the-blank, one question per
   LessonBox page), sourced from Bunpro/Tae Kim's Guide/Tofugu rather than invented — every
   `correctIndex`/fill answer double-checked with a throwaway Node script that `eval`'d the
   extracted array. Required two new LessonBox page types, `'exam-question'`/`'exam-score'`
   (distinct from the existing `quiz-review`/`quiz-answers`/`quiz-score` 3-page group — an exam
   grades each question immediately on the player's first answer, no retry, one page per question
   instead of a batch), a new `startExamAttempt()` in `library-scene-shared.js`, and
   `this.examContent` wiring in both `n4-phaser-game.js` (`EXAM_CONTENT = { 'final-quiz':
   N4_ENTRANCE_EXAM_PAGES }`) and `n5-phaser-game.js` (same field, since the shared
   `openQuizAttemptMenu()` branches on it regardless of floor).
6. **Fixed a real bug the user hit live in a real browser**: N4 rendered as a blank brown panel,
   console showing `Uncaught ReferenceError: Cannot access 'N4_REVIEW_1_QUIZ_QUESTIONS' before
   initialization` — a temporal-dead-zone bug (the four `N4_REVIEW_*_QUIZ_QUESTIONS` consts were
   declared textually AFTER `LESSON_CONTENT`, which reads them from inside its own object-literal
   evaluation the instant that statement runs). Fixed by moving all four above `LESSON_CONTENT`.
   Confirmed via the user's own follow-up screenshot showing clean console output (`Phaser v3.90.0`,
   no errors). **`node --check` cannot catch this class of bug** — it's a runtime ordering issue,
   not a syntax error — worth remembering before trusting a syntax-only pass again.
7. **Claw-slash conjugation diagram** — replaced "stem"-based prose ("る-verb stem + られる") on
   conjugation pages with an animated component: the old verb ending visibly gets clawed through and
   falls away, replaced by the new ending (`buildEndingSwapDiagram()`/`wireEndingSwapDiagram()` in
   `n4-phaser-game.js`, styled in `lesson-box.css`). Shown to the user as 5 mockup concepts first
   (via `mcp__visualize__show_widget`) before building the real thing, per an explicit "create me a
   mockup first" instruction — this became the established workflow for every interactive component
   built afterward. Applied to the 9 pages that are a genuine single-ending swap (potential,
   volitional, ば-form, passive, causative, imperative, そうだ, すぎる, やすい／にくい) and explicitly
   did NOT convert the 5 pages that don't fit the metaphor (multi-option grammar with no single swap:
   なければ／なくては／ないと, てもいい／なくてもいい／てはいけない, 禁止形's bare な, でしょう／だろう,
   んです／のです) — flagged rather than force-fit.
8. **Two-portal で／に diagram** — built the same mockups-first way (user picked "two portals" from
   5 shown concepts): `buildParticlePortalDiagram()`/`wireParticlePortalDiagram()`, a demo word
   auto-flies into whichever of two colored portals fits it (gold = で/action, blue = に/existence-
   destination), replayable via two buttons. Applied to the で vs に page in `n4-shelf-03`, with its
   `explain` text rewritten to be more thorough per explicit "this needs to be expounded... this
   could be confusing" feedback (added a concrete "happens vs is located" test). Checked the rest of
   N4 for other genuine two-way particle comparisons per "the portals must be used to other
   particles that needs comparison" — found none that actually fit (から and に-as-target are
   single-particle explanations, not pairs; なければ vs なくては is a 3-way formality-level
   comparison, not a situational either/or) — flagged instead of force-applying the component.
9. **Branching-path とか／たり～たり／し diagram** — third component built the same way, except the
   mockups themselves went through two rounds: 5 static preview concepts first, then a full
   interactive/clickable rebuild of all 5 per an explicit follow-up ask, before the user picked
   "branching path." `buildBranchingPathDiagram()`/`wireBranchingPathDiagram()` — deliberately no
   auto-play (the player clicks one of 3 colored branches to explore at their own pace, unlike the
   two auto-playing components above), inserted as a new page right after the existing し～し page in
   `n4-shelf-06`. Verified end-to-end with a throwaway jsdom script (attribute escaping, `<br>`
   handling inside the reveal panel, click wiring) since there's no live browser in this environment.
10. **ずつ page rule added** — per a request to clarify the 一人に二つずつ example, added an explain
    bullet distinguishing に (marks the recipient — an ordinary particle, not part of ずつ's own
    rule) from ずつ (attaches directly to a quantity, full stop) — sourced against Bunpro's ～ずつ
    grammar entry rather than asserted from memory.
11. **N/V/Adj abbreviation legend** — many N4 pattern lines use bare `N`/`V`/`N1`/`N2` placeholder
    letters with no explanation. Added an auto-shown legend (`patternUsesAbbr()` in `lesson-box.js`
    detects the bare letter via regex; `ABBR_LEGEND_HTML` renders it) under any pattern line that
    uses one — same "global feature, not opted into per page" pattern as the existing color-role
    legend. Confirmed N5 doesn't use these abbreviations anywhere before claiming so, so this only
    ever fires on N4 pages.
12. **Fixed word-tile row misalignment across BOTH floors** — the documented "align-items:flex-end"
    gotcha (a tile whose gloss caption wraps to 2 lines renders its kana higher than single-line
    neighbors) turned out to affect far more rows than the one screenshot the user flagged. Wrote a
    throwaway Node script using `acorn` to parse the file as a real AST (rather than fragile regex —
    `tiles: [...]` arrays are deeply nested with quotes/commas that break naive matching) to find
    every multi-tile row where one gloss is long enough to wrap while another isn't, and applied the
    existing `smallGloss: true` fix to each. **25 tiles fixed in `n4-phaser-game.js`, 17 in
    `n5-phaser-game.js`** — including the exact ここでは／"here (in particular)" tile the user's
    screenshot showed misaligned.
13. **Printable PDFs watermarked** — all 8 files under `assets/lesson pdf/` (`pypdf`/`reportlab`, an
    overlay page merged onto each real page). Went through two rounds: first a large diagonal center
    watermark ("Neko Bunko Library — Do Not Redistribute"), then per follow-up feedback ("that way
    they can still print it, but it will be known as nekobunko property") replaced with a small
    top-right corner badge instead ("Neko Bunko Library", 9pt oblique). Since the first pass had
    already overwritten the only copies of the originals in place, recovered pristine files via
    `git show HEAD:"<path>"` (a read-only plumbing command — `git checkout`/`add`/`commit` are all
    blocked by a stale `.git/index.lock` this session; confirmed `rm -f` on that lock file fails with
    `Operation not permitted`) before reapplying the corner-badge version.

- **Shared engine:** `assets/js/library-scene-shared.js` — movement/camera/collision/retro-menu/
  LessonBox glue, consumed by both floors via `Object.assign(SceneClass.prototype, LibrarySceneEngine)`.
  Any engine-level bug fix belongs here, not duplicated per-floor. Floor-only behavior gets patched
  onto that floor's own scene prototype afterward (established pattern — see `updateDoorGateTextures`,
  `setPlayerCatColor`, etc.).
- **Architecture, persistence keys, and page-type field contracts are in `CLAUDE.md`** — read that
  first for "how does X work"; this file is for "where are we and what's next."

## 2. What's next (not started)

- **Live browser confirmation of the newest interactive components** — the user HAS confirmed real
  browser rendering works for the game in general this session (screenshots of several LessonBox
  pages, including a clean console after the temporal-dead-zone fix), but none of the 3 new
  diagram components (claw-slash, two-portal で/に, branching-path とか/たり/し) or the 20-question
  entrance exam have specifically been screenshotted/confirmed by the user yet — only `node --check`
  (syntax only) plus, for the branching-path diagram, a throwaway jsdom script (DOM behavior only,
  not real CSS/Phaser rendering). Also still unconfirmed from the earlier debug pass: font sizing on
  real plaques, the 4 review piles' layout, and the `N4CatSelectScene` overlay (does the "Change"
  button actually open it and correctly swap the walking sprite).
- The 4 "needs live-browser confirmation" debug-pass items listed above (spritesheet re-queue
  warning, `moveQueue` edge case, sensei portrait color, `N4CatSelectScene` visual check).
- **5 conjugation-style pages still use the old plain `pattern:` line, not the claw-slash diagram**
  (deliberately, not an oversight) — なければ／なくては／ないと, てもいい／なくてもいい／てはいけない,
  禁止形's bare な, でしょう／だろう, んです／のです — each doesn't fit the "one ending drops, one
  ending replaces it" metaphor the claw-slash component is built around.
- **とか／たり～たり／し branching-path diagram is the only 3-way particle/pattern comparison built
  so far** — no other N4 grammar point was found to need the same treatment (see item 8/9 above);
  revisit only if a genuinely new multi-way comparison point gets added later.
- `EXAM_GATE_DATA.n1` ("N1 Entrance Exam") — data defined, not yet built into a real interactive.
- `#n3GateExamBtn`'s HUD wiring in `n4-phaser-game.js` is permanently inert now that the N3 wing/
  gate it targeted no longer exists (`finalGateId` is `null` on N4's scene) — harmless dead code,
  candidate for removal whenever someone's back in that file for something else.
- Longer-standing, still-real maintenance debt: `n4-phaser-game.js` still carries several helper
  functions copied byte-for-byte from `n5-phaser-game.js` (cat-avatar data, LessonBox content
  resolvers, shelf-decoration helpers) because `n4-dashboard.html` doesn't load
  `n5-phaser-game.js`. None of these are N5-specific — they belong in `library-scene-shared.js`.
  Worth a consolidation pass; until then, a future fix to one of these in N5 won't silently reach
  N4 (this bit us once already — see the `ACTION_SPRITE_PATHS` bug fixed this session).

Per the design spec's explicit "Out of Scope" section for the original build (still applies):

- A return staircase from N4 back down to N5 (not built — one-way trip only).
- Any shared save-slot/cross-floor progress dashboard beyond the current per-floor localStorage keys.

## 3. How to resume

`git status` currently shows more modified files than just this session touched — a number of CSS
files (`animations.css`, `main.css`, `mission.css`, `music-player.css`, `navbar.css`, `quiz.css`,
`reset.css`, `responsive.css`, `teleport.css`) plus `boot.js`/`homepage.js` are marked modified from
before this session started. **This session's own edits are scoped to:** `assets/js/lesson-box.js`,
`assets/js/library-scene-shared.js`, `assets/js/n4-phaser-game.js`, `assets/js/n5-phaser-game.js`,
`assets/css/lesson-box.css` (Space Mono `@font-face` blocks, the claw-slash/portal/branching-path
diagram styles, the N/V/Adj abbreviation legend, exam-question/exam-score styles), 4 new font files
under `assets/fonts/` (`SpaceMono-Regular.woff2`, `SpaceMono-Bold.woff2`, `SpaceMono-Italic.woff2`,
`SpaceMono-BoldItalic.woff2`), and all 8 PDFs under `assets/lesson pdf/` (corner-badge watermark,
content otherwise byte-identical to the git-tracked originals). Run `git diff` scoped to those paths
if you need exactly what changed this session versus everything else sitting uncommitted. User
commits their own work per standing preference — don't auto-commit.

Before building anything further on the N4 floor or its cat-select overlay, get the live browser
check called out in section 2 — this session (like the mezzanine pass in section 4) had no working
render/screenshot loop, so every visual judgment (plaque sizing, review-pile layout, the new
overlay scene) was made from code + `node --check` only, never an actual frame.

Full history of the original N4/N3 two-wing build and the mezzanine polish pass that came before
the consolidation (both since superseded architecturally, but useful for git-archaeology) is in
section 4 below and in `docs/superpowers/plans/2026-07-27-n4-second-floor.md` /
`docs/superpowers/plans/2026-07-28-n4-atrium-walls-jukebox-gates.md`.

---

## 4. Historical background — SUPERSEDED, archival only

**Everything below this line describes the two-wing "N4 + N3" mezzanine design as it existed on
2026-07-29.** A later pass consolidated N4 into the single 16-shelf floor described in section 1
above — the N3 wing, its threshold mist, the 3-jukebox layout, the C-shape wing corners, and the
N2/N1 gate positions described below no longer reflect the current code. Kept only so the reasoning
behind old commits (`842dca4` and earlier) isn't lost; don't use it to answer "how does the current
N4 floor work" — use section 1 and `CLAUDE.md` for that.

### Map shrink + C-shape + rope-and-brass rail + N3 threshold wall (as of 2026-07-29)

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

- **Design/plan docs for the ORIGINAL N4/N3 build:** `docs/superpowers/specs/2026-07-27-n4-second-floor-design.md`,
  `docs/superpowers/plans/2026-07-27-n4-second-floor.md`, plus the prior mezzanine-polish pass's
  own spec/plan docs (`docs/superpowers/specs/2026-07-28-n4-atrium-walls-jukebox-gates-design.md`,
  `docs/superpowers/plans/2026-07-28-n4-atrium-walls-jukebox-gates.md`) — all already merged.
  **The shelf-position fix, review-pile restructuring, and the map-shrink/C-shape/rope-and-brass/
  N3-mist pass above have no spec/plan doc** — both moved fast off direct user feedback + live
  debugging rather than the usual brainstorm→spec→plan flow. **All of this was subsequently
  replaced by the single-floor N4 consolidation described in section 1 — kept here only for
  archival git-history context.**

If the worktrees at `.claude/worktrees/n4-second-floor` and `.claude/worktrees/n4-mezzanine-polish`
still exist, each has its own `.superpowers/sdd/**/progress.md` review ledger — safe to remove
whenever they're in the way, no re-deriving context needed from them.
