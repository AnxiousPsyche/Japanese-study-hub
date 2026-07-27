# Task 2 Report: N4 scaffolding — dashboard page, boot sequence, empty scene

## Status: DONE

## What was built

### `pages/N4/n4-dashboard.html` (new)
Structural copy of `pages/N5/n5-dashboard.html` — identical OS-shell/HUD
markup, identical `<head>` includes (variables/reset/components/animations/
responsive CSS, `n5-dashboard.css` reused as-is since it contains nothing
N5-specific, `lesson-box.css`), identical script load order:
`player.js` -> `sakura.js` -> `teleport.js` -> `music-player.js` -> Phaser
CDN (`phaser@3.90.0`) -> `lesson-box.js` -> `library-scene-shared.js` ->
`n4-phaser-game.js`. Title/meta/heading/footer text swapped to reference
"JLPT N4 Journey". The `changeCharBtn` HUD button is present (structural
parity) but has no wired listener in `n4-phaser-game.js` — N4 has no
`CatSelectScene` this pass (dead button, harmless; matches the brief's
"no cat-select step" note).

### `assets/js/n4-phaser-game.js` (new)
- Constants: `TILE_SIZE=16`, `GRID_COLS=72`, `GRID_ROWS=130`,
  `WORLD_W=1152`, `WORLD_H=2080`, `N4_PALETTE` — exactly per the brief.
- N4's own persistence keys/functions (`nekoBunko.n4.progress`/
  `.favorites`/`.lessonPage`/`.quizGate`), each load/save wrapped in
  try/catch degrading to `{}`/no-op, per the project's "one key per
  concern" pattern.
- Cat-avatar data copied verbatim from `n5-phaser-game.js`: `CAT_COLORS`,
  `TALK_COLOR_PATHS`, `SENSEI_PORTRAIT_PATHS`, `CAT_SHEET_COLS`,
  `CAT_SHEET_ROWS`, `catFrameRange`, `CAT_COLOR_ORDER`, `CAT_ANIM_DEFS`,
  `loadCatSpritesheets`, `registerCatAnimations`, `getSavedCatColor`,
  `saveCatColor`. **`CAT_COLOR_KEY` intentionally reuses N5's own key**
  (`'nekoBunko.n5.catColor'`, not an n4-scoped one) — cat color is a
  player-level preference set once in N5's `CatSelectScene`; N4 has no
  select step this pass and reads the color N5 already saved.
- `LESSON_CONTENT = {}` stub (Task 7 populates it; nothing reads into it
  yet since no shelves exist).
- `N4LibraryScene extends Phaser.Scene`: `preload()` loads
  `libAssetPack`/`furniture03`/`topDownFurniture1` (paths confirmed
  against `LibraryScene.preload()` in n5-phaser-game.js) plus
  `loadCatSpritesheets(this)`. `create()` sets every property
  `LibrarySceneEngine` (Task 1) reads (`worldW`, `worldH`, `finalGateId:
  'n3-exam-gate'`, `printerStationId: null`, `printLinksByShelf: {}`,
  `allPrintLinks: {}`, `lessonContent`, `quizGateKey`, `catColors`,
  `talkColorPaths`, `senseiPortraitPaths`, `extraRetroMenuOptions:
  undefined`, `finalGateProceedLabel: 'Continue'`, `onFinalGatePass`)
  then calls `buildScene()`. `buildScene()` matches the brief's skeleton
  order exactly.
- **Added beyond the brief's literal skeleton, needed to satisfy the
  brief's own Step 4 ("boots with zero console errors")**: no-op stub
  methods for `buildFloor/buildWalls/buildTopBand/buildFurniture/
  buildShelves/buildBookPiles/buildExamGate/buildPlayer`. `buildScene()`
  calls all of these; without stubs the scene would throw
  `TypeError: this.buildFloor is not a function` on boot, since those
  methods don't exist until Tasks 3-6. Each stub has a comment naming
  which task implements it for real. `update()` guards on
  `if (!this.player) return;` (same pattern as `LibraryScene.update()`)
  since `buildPlayer()` is currently a no-op.
- `Object.assign(N4LibraryScene.prototype, LibrarySceneEngine);` right
  after the class declaration, per Task 1's documented pattern.
- `new Phaser.Game({...})` config copied from N5's actual config exactly:
  `type: Phaser.AUTO`, `parent: 'phaserGame'`, `width: 768, height: 480`,
  `pixelArt: true`, `physics: { default: 'arcade', arcade: { debug: false
  } }`, **`scale: { mode: Phaser.Scale.FIT, autoCenter:
  Phaser.Scale.CENTER_BOTH }`** — this `scale` block is in N5's real
  config but was *not* in the brief's Step 2 code sample; added it since
  the brief explicitly says "do not invent different Phaser config than
  N5 uses" and this is exactly the kind of thing CLAUDE.md's
  "game-resolution"/"zoom-fix" history warns about. `scene: [N4LibraryScene]`.
  `window.__n4Game = n4PhaserGame;` at the end.

### `.claude/launch.json`
Added a fresh, never-before-used static-server entry
`jp-library-static-n4task2-verify` (port 27123) for verification, per the
project's stale-cache-port convention.

## Verification

- `node --check assets/js/n4-phaser-game.js` — passes, no syntax errors.
- **Environment note**: the Browser-pane's `preview_start` tool reads
  `.claude/launch.json` from the *main repo checkout*
  (`C:\Users\almaz\Downloads\Japanese Web Dev\.claude\launch.json`), not
  this git worktree's copy — confirmed by comparing the tool's "available
  servers" error list (ends at `jp-library-static-furniture-fixes`,
  port 26921) against the worktree's actual file (which has since gained
  `n4task1-baseline`/`n4task1-verify`/`n4task2-verify`). The main repo
  checkout has no `pages/N4/` or `n4-phaser-game.js` at all (it's on a
  divergent `main` branch, commit `44ba8db "added N4"`, separate from
  this worktree's branch), so `preview_start` cannot serve this
  worktree's new files. Worked around it by starting
  `python -m http.server 27123` directly via Bash in the worktree root,
  then using `navigate` to hit `http://localhost:27123/pages/N4/
  n4-dashboard.html` directly (bypassing `preview_start`/`launch.json`
  entirely for this task's verification). This is worth flagging to a
  human/later task since it'll block every subsequent task's Browser-pane
  verification the same way unless resolved (e.g., pointing the preview
  tool's project root at the worktree, or running verification from the
  main repo directory instead).
- Live check via Browser pane at that URL:
  - Page title renders as "JLPT N4 Journey"; HUD shows N4 branding.
  - `read_console_messages`: only Phaser's own boot banner, zero errors/warnings.
  - `read_network_requests`: every asset the scene's `preload()` requests
    (`libassetpack-tiled.png`, `furniture03.png`,
    `TopDownHouse_FurnitureState1.png`, all 3 cat spritesheets) returned
    200 OK; all CSS/JS includes 200 OK. (The bgMusic `<audio>` element
    shows a benign `net::ERR_ABORTED` from the browser's autoplay
    policy — pre-existing behavior, unrelated to this change.)
  - `javascript_tool` against `window.__n4Game`: game instance exists,
    single active scene `N4LibraryScene`, `worldW=1152`, `worldH=2080`,
    `finalGateId='n3-exam-gate'`, `quizGateKey='nekoBunko.n4.quizGate'`,
    `interactives` is an array (empty, expected), `player` is `undefined`
    (expected — Task 3), engine methods (`wireInput`, `openInteraction`)
    present via the `Object.assign` mixin, `progress` loaded as `{}`.
  - Screenshot: HUD renders correctly; game canvas area is solid black
    (no floor/walls/shelves yet) — matches the brief's explicit
    expectation for this stage.

## Concerns

- The `preview_start` main-repo-vs-worktree path mismatch above will
  likely recur for Tasks 3-9's own verification passes unless addressed
  — flagging for visibility, did not attempt to fix it (out of this
  task's scope).
- N5's `LibraryScene.create()` gates `buildScene()` behind a
  `document.fonts.ready`-style wait (`ensureLibraryFontsReady()`) because
  shelf-plaque `Text` objects with Japanese characters can bake in with
  the wrong fallback font if DotGothic16 hasn't loaded yet. The brief's
  Step 2 skeleton for `N4LibraryScene.create()` does not include this
  gate, and I followed the brief literally. It's a non-issue right now
  (no Text objects with Japanese exist yet), but Task 4+ (which adds
  shelf plaques) should double check whether this gate needs to be added
  to N4's `create()` too, or whether it belongs in the shared engine
  instead.
