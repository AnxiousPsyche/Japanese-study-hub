# Task 1 Report: Extract shared scene engine, verify N5 unchanged

## Summary

Extracted the reusable, floor-agnostic parts of N5's `LibraryScene` into a
new shared file, `assets/js/library-scene-shared.js`, exposed as a plain
global `window.LibrarySceneEngine` (a mixin object) plus a handful of free
helper functions/constants. `n5-phaser-game.js` was updated to delete the
now-duplicated definitions, configure the new floor-parameterization
properties in `buildScene()`, and mix the engine onto `LibraryScene.prototype`
via `Object.assign`. `pages/N5/n5-dashboard.html` now loads the shared file
immediately before `n5-phaser-game.js`.

No second-floor files were touched or created (no `n4-phaser-game.js`, no
`pages/N4/`) — out of scope for this task, per the brief.

## Files changed

- **Created** `assets/js/library-scene-shared.js` — `window.LibrarySceneEngine`
  mixin (17 methods) + free functions `cropToTexture`, `drawWovenRug` (now
  takes an optional 4th `palette` arg, additive/non-breaking), `drawWallHeaderTexture`
  (copied verbatim from the original `n5-phaser-game.js:7435-7546`, read
  directly from that line range, not retyped from memory), `getState`,
  `loadQuizGateState`, `saveQuizGateState`, `formatLockMessage`,
  `getQuizGateStatus`, `ensureToast`, `showToast`; plus
  `TRIGGER_RANGE`/`QUIZ_MAX_ATTEMPTS`/`QUIZ_LOCKOUT_MS` constants.
- **Modified** `assets/js/n5-phaser-game.js`:
  - Deleted the moved module-level constants/functions: `QUIZ_GATE_KEY`,
    `QUIZ_MAX_ATTEMPTS`, `QUIZ_LOCKOUT_MS`, `TRIGGER_RANGE`,
    `loadQuizGateState`, `saveQuizGateState`, `formatLockMessage`,
    `getQuizGateStatus`, `getState`, `cropToTexture`,
    `drawWallHeaderTexture`, `drawWovenRug`, `ensureToast`, `showToast`.
    Kept `ARRIVE_THRESHOLD` (N5-specific auto-walk constant, not part of
    the engine's interface) and its explanatory comment intact.
  - Deleted the moved `LibraryScene` methods: `wireInput`,
    `handleInteractiveClick`, `nearestInRange`, `openInteraction`,
    `openRetroMenu`, `startLesson`, `completeInteraction`, `toggleFavorite`,
    `refreshAllStates`, `spawnPassSparkle`, `buildRetroMenu`,
    `highlightRetroMenu`, `selectRetroMenuOption`, `updateRetroMenuInput`,
    `closeRetroMenu`, `openQuizGateMenu`, `openQuizAttemptMenu`,
    `resolveQuizAttempt`. Kept `addSolid`, `launchDirectionMap` (N5's
    shelf-08-only direction-map launcher) and `update()` untouched, in
    place.
  - In `buildScene()`, added the new floor-parameterization block (`this.worldW`,
    `this.finalGateId`, `this.printerStationId`, `this.printLinksByShelf`,
    `this.allPrintLinks`, `this.lessonContent`, `this.quizGateKey`,
    `this.catColors`, `this.talkColorPaths`, `this.senseiPortraitPaths`,
    `this.extraRetroMenuOptions`, `this.finalGateProceedLabel`,
    `this.onFinalGatePass`) before `registerCatAnimations(this)` / any
    engine-method call.
  - Added `Object.assign(LibraryScene.prototype, LibrarySceneEngine);`
    immediately after the `class LibraryScene extends Phaser.Scene { ... }`
    declaration.
  - Collapsed a few multi-blank-line gaps left behind by the deletions
    (cosmetic only).
- **Modified** `pages/N5/n5-dashboard.html` — added
  `<script src="../../assets/js/library-scene-shared.js"></script>`
  immediately before the existing `n5-phaser-game.js` `<script>` tag.
- **Modified** `.claude/launch.json` — added two fresh port entries
  (`jp-library-static-n4task1-baseline` : 26921, `jp-library-static-n4task1-verify`
  : 27022) per the project's preview-port convention. **Note:** in this
  session the `preview_start`/launch.json-driven browser tool turned out to
  be wired to the outer main repo checkout rather than this isolated
  worktree (confirmed by comparing served file line-counts and by the tool's
  own error message listing configuration names that only exist in the main
  checkout's `launch.json`, not this worktree's). Serving from there would
  have verified the *wrong, unrelated* file tree. I worked around this by
  starting a plain `python -m http.server` directly from this worktree via
  the Bash tool (which *is* correctly scoped to this worktree) on port
  27271, and pointed the Browser pane at `http://127.0.0.1:27271/...`
  directly via `navigate`, bypassing `preview_start` entirely. The two
  launch.json entries are left in place for convention/future use but were
  not actually what served the pages I verified against.

## One deliberate deviation from the brief's literal code, with justification

The brief's Step 4 code sample for `onFinalGatePass` was:
```js
this.onFinalGatePass = () => {
  showToast('Climbing to the second floor…');
  window.location.href = '../N4/n4-dashboard.html';
};
```
but its own accompanying prose says: *"The `onFinalGatePass` navigation
itself gets swapped for the real thing in Task 8 ... for this task it can
stay as today's toast-only stub."* Using the literal code above would have
navigated the browser to a non-existent `n4-dashboard.html` (Task 1
explicitly must not create N4 files) the moment "Proceed to N4" is clicked
on a completed final-quiz gate — a real behavior change, and a broken link.
I followed the prose instead of the code sample and set:
```js
this.onFinalGatePass = () => {
  showToast('N4 is coming soon.');
  this.closeRetroMenu();
};
```
which reproduces N5's exact current behavior. Verified live (see below):
clicking "Proceed to N4" shows the toast, closes the menu, and
`location.href` is unchanged — identical to the pre-extraction baseline.
`finalGateProceedLabel` was kept as `'Proceed to N4'` (unchanged text,
matches the original hardcoded button label).

## Verification

### Syntax (`node --check`)
```
$ node --check assets/js/library-scene-shared.js && echo "shared OK"
shared OK
$ node --check assets/js/n5-phaser-game.js && echo "n5 OK"
n5 OK
```

### Live browser verification

Server: manual `python -m http.server 27271` started via Bash directly
inside this worktree (see note above on why `preview_start` couldn't be
used). Verified via the Browser pane's `navigate`/`javascript_tool`/
`read_console_messages`, following the project's established pattern
(`localStorage.setItem('nekoBunko.n5.catColor', ...)`, `scene.start('LibraryScene')`,
then `scene.interactives` inspection + direct method calls + `LessonBox.open`/
`.advance()`/`.close()`).

**Baseline (pre-extraction, original `n5-phaser-game.js`)** — recorded first,
before any file changes:
- 25 interactives loaded: `final-quiz, tv-hiragana, tv-katakana, shelf-01..16,
  review-1..4, sensei-guide, printer-station`.
- shelf-01 menu: `["Start Lesson","Make Favorite?","Exit"]`, subtitle "11 pages".
- shelf-02 (locked, no prereq done): `getState` → `"locked"`.
- Favorite toggle on shelf-01: true then false (round-trips correctly).
- review-1 menu (forced `'available'`): `["Start Lesson","Exit"]`, subtitle "10 pages".
- shelf-08 menu: `["Start Lesson","Walk the Route (駅)","Make Favorite?","Exit"]`
  (confirms the shelf-08-only extra option).
- review-4 menu: `["Start Lesson","Exit"]`.
- `completeInteraction` on shelf-01 → progress set, shelf-02 becomes `"available"`.
- final-quiz (locked, no shelves done): `openInteraction` → toast only, no menu.
- `handleInteractiveClick` on an out-of-range shelf-08 → `moveQueue` length 3
  (corridor routing), `pendingInteract.id === 'shelf-08'`.
- Retro menu keyboard nav: `highlightRetroMenu(1)` moves `selectedIndex` 0 → 1.
- `sensei-guide`/`printer-station` both `kind: 'npc'`.
- `startLesson` → `LessonBox.isOpen()` true, `panelOpen` true; 2×`.advance()`
  still open; `.close()` → both false; partial-progress page saved as `2`.
- `openQuizAttemptMenu` → `["Pass (test)","Fail (test)","Back"]`.
- `resolveQuizAttempt(..., false)` → attempts-left 3 → 2.
- `resolveQuizAttempt(..., true)` → `progress['final-quiz']` becomes true.
- Completed final-quiz gate menu: `["Proceed to N4","Exit"]`; clicking
  "Proceed to N4" → toast shown, menu closes, `location.href` **unchanged**
  (no navigation) — this is the exact behavior my `onFinalGatePass` deviation
  above was designed to preserve.
- Console: zero errors (only Phaser's own boot banner logs).

**After extraction** — same checklist, re-run from a clean `localStorage`
state (see gotcha below) against the modified files:
- All 25 interactives present, identical id list and order.
- Every single check above reproduced an **identical** result to the
  baseline (menu option labels, subtitles, states, favorite round-trip,
  move-queue/pendingInteract, keyboard-nav index, LessonBox open/advance/close/
  resume-page value, quiz-attempt menu + attempts-left counting, pass/fail
  gate progress, and the completed-gate "Proceed to N4" toast-only/no-navigation
  behavior).
- **Full sweep**: additionally opened *every one* of the 25 interactives
  (not just the spot-checked ones) via `openRetroMenu`/`openQuizGateMenu`/
  `startLesson` and confirmed each returns the expected option set with no
  thrown errors — all 16 shelves, 4 review piles, final-quiz gate, both TVs,
  sensei-guide, and printer-station.
- Real end-to-end input test (not just direct method calls): a genuine
  mouse click on the printer sprite correctly triggered
  `handleInteractiveClick → openInteraction → startLesson`, opening the
  LessonBox with the full print-links list (Nouns/Pronouns/Adjectives/Verbs/
  Conjugations/Particles) rendered correctly. Arrow-key movement was also
  confirmed to move the player sprite (visually, via screenshot).
- Console: zero *new* errors (two stale "Texture key already in use:
  topDownFloorTileTex" errors persisted in the console log buffer from an
  earlier test-script mistake on my part — see gotcha below — but no new
  errors appeared during the actual clean-state verification pass).

### A testing gotcha I hit (not a bug in the extraction)

My first "after" verification attempt showed `interactivesCount: 0` and a
`"Texture key already in use: topDownFloorTileTex"` console error, which
initially looked like a real regression. Root cause: after the first
baseline run, `nekoBunko.n5.catColor` was already saved in `localStorage`,
so on the next page load the game's own boot flow auto-started
`LibraryScene` directly (skipping `CatSelectScene`). My verification script
then called `scene.start('LibraryScene')` again unconditionally, which
re-ran `buildScene()` on an already-built scene and collided on texture
keys created by `cropToTexture`/`createCanvas` (which don't guard against
re-registration, matching the original code's behavior exactly — this
would happen with the pre-extraction code too under the same double-start
condition). Fix: `localStorage.clear()` + hard `location.reload()` before
each fresh check, confirming via `scene.getScenes(true)` that only
`CatSelectScene` was active beforehand. Documenting this since it cost
significant time and could confuse whoever runs Task 1's Step 6 checklist
again for a later task.

## Concerns / things to double-check downstream

1. **`preview_start`/`.claude/launch.json` did not point at this worktree**
   in this session (see note above) — I do not know if this is a one-off
   quirk of this particular sandboxed subagent invocation or a systemic
   issue that will also affect Tasks 2-9's verification. Whoever picks up
   the next task should confirm which directory their preview tooling
   actually serves before trusting a "verified in browser" claim, the same
   way I had to.
2. I made one interpretive call (`onFinalGatePass` staying as today's
   toast-only stub rather than the brief's literal Task-8-flavored code
   sample) — flagged extensively above and directly verified against
   baseline; I'm confident this was the correct call given the brief's own
   prose, but it's a deviation from the literal code block so noting it
   explicitly per the instructions.
3. `drawWallHeaderTexture` was copied by reading the original file's exact
   line range (7435-7546) and transcribing that Read output verbatim into
   the new file — not retyped from the plan doc — per the brief's explicit
   instruction to eliminate transcription risk.
4. Cosmetic-only: a few multi-blank-line gaps left by the line-based
   deletion script were collapsed to single blank lines afterward; this
   was a whitespace-only follow-up pass, re-verified with `node --check`
   after.

## Commit

Committed in this worktree as a single commit (see parent orchestrator
message for the exact hash) — no N4/second-floor files touched, matching
scope.
