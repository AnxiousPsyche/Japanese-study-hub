# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"JP Library OS" — a static, no-build multi-page site that teaches Japanese (JLPT N5/N4) through a retro "desktop OS" shell. There is no `package.json`, no bundler, no test runner, and no linter configured. Everything is hand-written HTML/CSS/vanilla JS loaded directly via `<script src>`/`<link>` tags.

The most actively developed piece is a Phaser 3 mini-game (a walkable pixel-art library) that replaces flat lesson lists with an explorable map. Most current work happens in a single file: `assets/js/n5-phaser-game.js`.

## Commands

There is no build/lint/test tooling. To run the site locally, serve the repo root with any static file server and open `index.html` (paths in the HTML are root-relative, e.g. `assets/css/...`, `assets/js/...`):

```bash
python -m http.server 8080
```

`.claude/launch.json` already defines several named static-server configs (different ports) for use with the preview tooling — reuse one via the launch config rather than inventing a new port unless you need a guaranteed-uncached one (see caching note below).

To sanity-check the Phaser game file for syntax errors without a browser:
```bash
node --check assets/js/n5-phaser-game.js
```

There are no automated tests. Verification is done manually in a browser (see Preview/verification below).

## High-level architecture

### Two layers: OS shell + page content
`index.html` boots a retro desktop UI (taskbar, start menu, draggable "windows", disc-insert boot sequence) via `assets/js/{boot,os,homepage,teleport,music-player,sakura,login,progress,index}.js` and `assets/css/{os,boot,homepage,navbar,components,animations,teleport,...}.css`. `assets/css/variables.css` is the single design-token source (colors, spacing, fonts, shadows) — check it before hand-picking new colors elsewhere.

Content pages (JLPT levels, lessons, dashboards) live under `pages/<LEVEL>/...` and are separate HTML documents that pull in a subset of the same CSS/JS via relative paths (e.g. `pages/N5/n5-dashboard.html` uses `../../assets/css/...`). `templates/*.html` are starting-point templates for new lesson/quiz/mission/vocabulary pages, not live pages themselves.

Some files under `pages/` are stale/orphaned scratch copies with broken paths (e.g. `pages/N5/lesson-01-greetings.html` references `/css/style.css` and a Bootstrap-navbar structure that doesn't match the rest of the site) — don't treat everything under `pages/` as canonical without checking its `<link>`/`<script>` paths resolve. Likewise `dump.html` (an isolated HTML fragment, not a full document) and `klasjdlas.html` (a near-duplicate of `index.html`) at the repo root appear to be scratch/backup files rather than live entry points.

### Persistence: localStorage, one key per concern
No backend — all state lives in `localStorage`, each concern its own key, always wrapped in try/catch that degrades to an in-memory/no-op default rather than throwing (privacy mode, quota, corrupted JSON, etc. must never break the page):
- `jpExplorer` — the logged-in player profile/progress object (name, xp, streak, avatar, achievements); read/written in `login.js`/`progress.js` via `getSavedExplorer()`/`applyPlayerProgress()`.
- `jpLibraryOS.n5.favorites`, `jpLibraryOS.n5.avatarColor` — N5 dashboard state (`n5-save.js`, exposed as `window.N5Save`).
- `nekoBunko.n5.progress`, `nekoBunko.n5.catColor`, `nekoBunko.n5.quizGate`, `nekoBunko.n5.favorites` — Phaser game state, defined and loaded near the top of `n5-phaser-game.js` (`loadProgress`/`saveProgress`, `loadFavorites`/`saveFavorites`, etc.). Follow this exact pattern (key constant + try/catch load/save pair) for any new persisted state rather than reading/writing `localStorage` inline.

### The Phaser game (`assets/js/n5-phaser-game.js`)
Loaded only from `pages/N5/n5-dashboard.html`, after the `phaser@3.90.0` CDN script. Two scenes:
- `LibraryScene` — the main walkable map. Player moves via arrow keys or click-to-pathfind (`moveQueue`), auto-walks a waypoint corridor to reach clicked interactives, and everything except the outer walls/top wall-block is intentionally **non-solid** (shelves, decor, piles) so every interactive stays reachable — don't add solid bodies to decor without re-verifying reachability.
- `CatSelectScene` — the avatar/cat-color picker shown before the library loads. Its retro dark-panel `▶`-prefixed selection-list pattern (bg rect, gold title, tan/gold option text, keyboard nav with debounced up/down flags, click support) is the template the in-canvas shelf/review-pile menus (`openRetroMenu`/`buildRetroMenu`/`updateRetroMenuInput`) were built to match — reuse this exact visual/interaction pattern for any new in-canvas menu instead of inventing a new style or falling back to a DOM panel.

Key structural pieces:
- `LAYOUT` (near the top) is the single source of truth for all vertical/horizontal positions (shelf columns, row Y-coordinates, corridor/sofa/reception Y). Change layout here, not by hand-tuning coordinates scattered through `buildShelves()`/`buildFurniture()`.
- `ASSET_RECTS` holds pixel crop rectangles (`{x, y, w, h}`) used to cut individual sprites out of packed asset sheets (`assets/images/...`) at runtime via `cropToTexture(scene, sourceKey, rect, destKey)`. **When adding or fixing a crop, scan for opaque pixel runs per-row (or per-column), not with a single global bounding-box flood fill** — packed sheets place sprites close enough together that a bounding-box scan reliably merges neighbors into one crop. Every `destKey` passed to `cropToTexture` must be unique (Phaser throws on reuse).
- `LESSON_DATA` + `SHELF_PREREQ` define the 17 lessons/shelves and their unlock prerequisites — this is a simpler, purpose-built structure, not the more elaborate lesson schema described in `Neko-Bunko-Cat-Library-Spec.md` (that doc is an earlier design spec; treat it as historical intent, not as a description of the current data model).
- Interactives (shelves, review piles, the staircase quiz gate) share one click/keyboard entry path — `openInteraction(entry)` — which routes to either `openRetroMenu()` (shelves, review piles) or the older DOM `openPanel()` (currently only the final-quiz staircase panel). `refreshAllStates()` re-derives locked/available/completed visuals for every interactive from `this.progress`/`SHELF_PREREQ` after any state change; call it after any progress/favorite mutation instead of hand-updating individual sprites.

### The LessonBox dialogue component (`assets/js/lesson-box.js` + `assets/css/lesson-box.css`)
The only DOM-based UI in an otherwise canvas-drawn game — a retro JRPG-style dialogue overlay (`window.LessonBox.open(pages, options)` / `.advance()` / `.close()` / `.isOpen()`) invoked from `startLesson(entry)` in `n5-phaser-game.js`. Lesson content lives in `LESSON_CONTENT[shelfId]`, an array of typed "page" objects; each page's `type` picks a rendering branch in `renderContent()`: `greeting`, `sentence`, `conjugation`, `grammar-intro`, `summary`, `conversation`, `try-it`, `quiz-fill`. The field contract for each type is documented in a comment block at the top of `renderContent()` — read it before adding a new page rather than guessing field names from examples.

Global features apply automatically to every lesson (not per-page opt-in): an ambient open chime, a pulsing "spoken word" animation on word tiles, and a CRT power-on pop-in on `open()`.

**Per-player dynamic content** — some page fields can't be static because they depend on which cat color the player picked (there's no way to know that when `LESSON_CONTENT` is authored). The pattern: author the field as a **function** instead of a plain value, then resolve it once at lesson-open time in `startLesson()` before handing pages to `LessonBox.open()`:
- `conversation` pages' `turns[].spritePath` — resolved by `resolveConversationTurns(pages, playerColorId)`, which derives a `senseiColorId` distinct from the player's own color (falls back to black when the player picked orange, else orange) and looks up `ACTION_SPRITE_PATHS[action][colorId]`.
- `grammar-intro` pages' `diagramSvg` — normally a static HTML/SVG string, but can be a `(playerColorId, senseiColorId) => string` function instead (e.g. shelf-05's `buildDemonstrativesDiagram`); resolved by `resolveDynamicDiagrams(pages, playerColorId)` using the same sensei-color derivation. Pages with a static string `diagramSvg` pass through unchanged.

Follow this factory-function-plus-resolver pattern for any new field that needs to reflect the player's chosen color — don't hardcode a color or duplicate the sensei-color fallback logic inline.

**Visual aids on `greeting` pages** — `imageSrc`/`visualAlt` (a real photo/illustration) or `iconSvg` (raw inline SVG) render into the same framed slot, floated right so text wraps around it. For a vertically-stacked sprite sheet (multiple equal-height images in one file, e.g. a day/night strip), add `spriteRows`/`spriteIndex` alongside `imageSrc` instead of pre-cropping a separate file — it renders as a `background-image` with `background-size`/`background-position-y` computed to show just that one band (see `.lesson-box__greeting-visual--sprite` in `lesson-box.css`).

### Preview/verification workflow gotcha
The dev "server" is just static file serving, but the browser preview tooling can serve **stale JS even after a hard reload** once a port has been used once in a session — when verifying a code change actually took effect, prefer starting the preview on a port/launch-config that hasn't been used yet in the current session rather than trusting a reload on a reused port.
