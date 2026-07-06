# N5 Journey Map Free-Roam Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the unwired N5 journey-map placeholder into a real free-roam overworld: a pixel cat the player drives with arrow keys/WASD, walking up to any of the 18 nodes (15 lessons + 2 reviews + final review) to open a Start Lesson / Save-Favorite / Exit popup.

**Architecture:** Pure static HTML/CSS/vanilla JS, no build step, no framework, no new project dependency. CSS remains the single source of truth for node positions (`%`-based, as today); JS reads live DOM rects at runtime for movement/collision math rather than duplicating coordinates. Three small script files, each with one job: `n5-save.js` (localStorage), `n5-popup.js` (popup UI), `n5-map.js` (movement + proximity + lesson metadata).

**Tech Stack:** HTML/CSS/vanilla JS (`window`-namespaced globals, no modules/bundler — matches every other script in `assets/js/`). Verification via Playwright, installed only in the session scratchpad (`C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Desktop-myapp\4e970e83-25c6-48c4-bfa4-7a6ce309860f\scratchpad`), never added to the project itself. Static server: `python -m http.server 8123` from the project root, per `.claude/launch.json`.

## Global Constraints

- No lock/complete gating this pass — every node is interactive regardless of order (spec Non-goals).
- No multi-color avatar picker this pass — one cat, `assets/images/icons/pixels/fortunecat-Original.png` (spec Non-goals).
- No road-locked collision — cat moves freely within `#lessonMap`'s bounds, not constrained to the painted road (spec Non-goals).
- Treasure chests (`.treasure-node`, 3 of them) are positioned but stay decorative/non-interactive this pass — the spec never defined popup content for them, and inventing reward content is out of scope; only lesson/review/final-review nodes (all share the `.lesson-node` class already) get the walk-up popup.
- Reuse existing visual language: wooden `.lesson-sign` look for new scenery signs, `.retro-btn` / `.retro-btn-secondary` for popup buttons, existing `.walking` bounce animation for the cat — no new visual system invented.
- `localStorage` failures (privacy mode etc.) must degrade to session-only behavior, never throw.

---

### Task 1: Calibrate real node/decoration coordinates against the art

**Files:**
- Create (scratchpad only, not part of the project repo): `C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Desktop-myapp\4e970e83-25c6-48c4-bfa4-7a6ce309860f\scratchpad\calibrate.html`
- Create (scratchpad only): `C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Desktop-myapp\4e970e83-25c6-48c4-bfa4-7a6ce309860f\scratchpad\calibrate.js`

**Interfaces:**
- Produces: a filled-in coordinate table (left/bottom `%` per node, `%` per scenery sign) consumed directly by Task 2. No code interface — this task's deliverable is data, recorded in this plan's Task 2 as literal CSS values.

- [ ] **Step 1: Build a grid-overlay calibration harness**

Write `calibrate.html`:

```html
<!doctype html>
<html>
<head><meta charset="utf-8"><style>
  body{margin:0;background:#000;}
  #wrap{position:relative;width:1900px;}
  #wrap img{display:block;width:1900px;height:auto;}
  .vline,.hline{position:absolute;background:rgba(255,0,0,.5);}
  .vline{top:0;bottom:0;width:1px;}
  .hline{left:0;right:0;height:1px;}
  .label{position:absolute;color:#0f0;font:12px monospace;background:rgba(0,0,0,.6);padding:1px 3px;}
</style></head>
<body>
  <div id="wrap">
    <img src="file:///C:/Users/almaz/Downloads/Japanese Web Dev/assets/images/backgrounds/n5-journey-map.png">
  </div>
  <script src="calibrate.js"></script>
</body>
</html>
```

Write `calibrate.js` to draw vertical/horizontal lines every 5% (thin) and every 10% (labeled) across `#wrap`:

```js
const wrap = document.getElementById('wrap');
for (let pct = 0; pct <= 100; pct += 5) {
  const v = document.createElement('div');
  v.className = 'vline';
  v.style.left = pct + '%';
  wrap.appendChild(v);

  const h = document.createElement('div');
  h.className = 'hline';
  h.style.top = pct + '%';
  wrap.appendChild(h);

  if (pct % 10 === 0) {
    const lx = document.createElement('div');
    lx.className = 'label';
    lx.style.left = pct + '%';
    lx.style.top = '0';
    lx.textContent = pct + '%';
    wrap.appendChild(lx);

    const ly = document.createElement('div');
    ly.className = 'label';
    ly.style.left = '0';
    ly.style.top = pct + '%';
    ly.textContent = pct + '%';
    wrap.appendChild(ly);
  }
}
```

- [ ] **Step 2: Screenshot the harness with Playwright**

```bash
cd "/c/Users/almaz/AppData/Local/Temp/claude/C--Users-almaz-Desktop-myapp/4e970e83-25c6-48c4-bfa4-7a6ce309860f/scratchpad"
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1900, height: 1100 } });
  await page.goto('file://' + __dirname + '/calibrate.html');
  await page.screenshot({ path: 'calibration-grid.png', fullPage: true });
  await browser.close();
})();
"
```

Expected: `calibration-grid.png` written to the scratchpad, showing the full journey-map art with a labeled 5%/10% grid overlaid.

- [ ] **Step 3: Read the grid screenshot and record every coordinate**

Read `calibration-grid.png`. For each of the following, read off its `left %` and `bottom %` (measuring bottom-up, i.e. `bottom% = 100 - top%`, to match the existing CSS convention already used for `.lesson-1` etc.) against the grid lines, to the nearest 1%:

- `#startGate` (torii)
- `.lesson-1` through `.lesson-15`
- `.review-node` (`review1`), `.review-node-2` (`review2`)
- `.final-review`
- `#goalCastle`
- `.treasure-1`, `.treasure-2`, `.treasure-3` (no painted chest exists — pick reasonable spots just off the road near scenic side-areas, e.g. near the bridge, near the mountains, near a waterfall)
- 5 scenery-sign anchor points: near the painted "Bridge of Particles" text, near "Rivers of Grammar", near "Towers of Conjugations", near "Mountains of Vocabulary", and near the waterfall art (for the new "Listening Falls" sign, nothing painted there to anchor to — pick a spot visually close to the falls near the mountains)

Write the full table into this plan's Task 2 (replacing the placeholder table there) before moving on — Task 2 cannot start until every row has real numbers.

**Recorded coordinate table (measured against `calibration-grid.png`, see full report at `.superpowers/sdd/task-1-report.md`):**

| Selector | left% | bottom% | Notes |
|---|---|---|---|
| `#startGate` | 83 | 6 | Uses `left`/`bottom` (matches existing CSS). Box-left estimate centered on painted torii (~85%). |
| `.lesson-1` | 30 | 5 | "Basic Greetings" |
| `.lesson-2` | 45 | 5 | "Everyday Expressions" |
| `.lesson-3` | 61 | 5 | "Self Introduction" |
| `.lesson-4` | 31 | 22 | "A は B です" |
| `.lesson-5` | 47 | 22 | "Demonstratives" |
| `.lesson-6` | 62 | 22 | "Questions (か)" |
| `.lesson-7` | 37 | 36 | "Places and Directions" |
| `.review-node` (review1) | 52 | 36 | "Foundations Review" (gold circle) |
| `.lesson-9` | 67 | 36 | "Nouns & Pronouns" |
| `.lesson-10` | 44 | 57 | "Adjectives" |
| `.lesson-11` | 59 | 57 | "Adverbs and Verbs" |
| `.lesson-12` | 73 | 57 | "Conjugations" |
| `.review-node-2` (review2) | 22 | 66 | No painted circle — manually placed on the road curve between Conjugations and Sentence Construction rows. |
| `.lesson-13` | 44 | 71 | "Sentence Construction" |
| `.lesson-14` | 59 | 71 | "Particle Mastery" |
| `.lesson-15` | 73 | 71 | "Existence (あります・います)" |
| `.final-review` | 32 | 82 | No painted circle — manually placed on the path curve near the castle gate. |
| `#goalCastle` | 17 | top:3 | **Uses `left`/`top`, not `bottom`**, in existing CSS — use `top:3%`, not a bottom value. |
| `.treasure-1` | 9 | 44 | Off-road, near Bridge of Particles. |
| `.treasure-2` | 86 | 74 | Off-road, near Mountains of Vocabulary. |
| `.treasure-3` | 78 | 50 | Off-road, near the right-side waterfall. |
| `.scenery-sign-bridge` ("Bridge of Particles") | 5 | 49 | Anchored at painted "Bridge of Particles" text. |
| `.scenery-sign-forest` ("Grammar Forest") | 93 | 38 | Anchored at painted "Rivers of Grammar" text. |
| `.scenery-sign-towns` ("Towns of Conjugations") | 93 | 59 | Anchored at painted "Towers of Conjugations" text. |
| `.scenery-sign-mountains` ("Mountains of Kanji and Vocab") | 91 | 80 | Anchored at painted "Mountains of Vocabulary" text. |
| `.scenery-sign-falls` ("Listening Falls") | 82 | 54 | No painted text — placed directly on the waterfall art. |

See `.superpowers/sdd/task-1-report.md` for full measurement methodology, consistency checks, and flagged uncertainties (review-node-2, final-review, and goalCastle/startGate box-vs-icon-center caveats).

- [ ] **Step 4: Commit the calibration harness for reference**

The harness lives in the scratchpad, not the project repo, so there is nothing to commit here — skip. (No project files were touched in this task.)

---

### Task 2: Apply calibrated positions, add scenery signs, remove dead scripts

**Files:**
- Modify: `pages/N5/n5-dashboard.html`
- Modify: `assets/css/n5-dashboard.css:725-1009` (the `POSITIONS` section)

**Interfaces:**
- Consumes: the coordinate table filled in during Task 1, Step 3.
- Produces: every `.lesson-N` / `.review-node` / `.final-review` / `#goalCastle` / `.treasure-N` CSS rule now uses real calibrated values; 5 new `.scenery-sign-*` HTML elements exist for Task 5's CSS to style (Task 5 adds the shared `.scenery-sign` class rule).

- [ ] **Step 1: Replace the POSITIONS section in `n5-dashboard.css`**

Replace lines 725-1009 (everything from `/* Bottom Row */` through the `.treasure-3` rule) with the calibrated values from Task 1. The rule *shapes* stay identical to today (same selectors, same `left`/`right`/`bottom` property choices per node) — only the numeric values change to whatever Task 1 measured. Do not invent numbers here; copy them from Task 1's recorded table.

Also add a position rule for `.final-review` (it currently has none — this was a real gap found during design) using Task 1's measured spot, e.g.:

```css
.final-review{

    left:80%;

    bottom:14%;

}

.lesson-sign-final{

    left:74%;

    bottom:19%;

}
```

The numbers above are illustrative only — replace them with Task 1's actual measured `left`/`bottom` values for `.final-review` before committing this task.

- [ ] **Step 2: Add the 5 scenery-sign elements to `n5-dashboard.html`**

Inside `#lessonMap`, just before the `<!-- END OF MAP -->` comment (currently around line 617-620), add:

```html
<!-- =====================================
     SCENERY SIGNS (decorative, non-interactive)
====================================== -->

<div class="scenery-sign scenery-sign-bridge">

    Bridge of Particles

</div>

<div class="scenery-sign scenery-sign-forest">

    Grammar Forest

</div>

<div class="scenery-sign scenery-sign-towns">

    Towns of Conjugations

</div>

<div class="scenery-sign scenery-sign-mountains">

    Mountains of Kanji and Vocab

</div>

<div class="scenery-sign scenery-sign-falls">

    Listening Falls

</div>
```

Position rules for `.scenery-sign-bridge/forest/towns/mountains/falls` (using Task 1's 5 scenery anchor points) get added in Task 5 alongside the shared `.scenery-sign` style rule, to keep the "what does `.scenery-sign` look like" and "where does each one sit" changes together and reviewable as one diff.

- [ ] **Step 3: Remove dead `<script>` tags**

In `pages/N5/n5-dashboard.html`, delete these three lines (files that don't exist on disk):

```html
<script src="../../assets/js/n5-dashboard.js"></script>

<script src="../../assets/js/n5-lessons.js"></script>

<script src="../../assets/js/n5-player.js"></script>
```

Leave `n5-popup.js`, `n5-save.js`, `n5-map.js` script tags in place (Tasks 3-5 fill these in).

- [ ] **Step 4: Visually verify with Playwright**

```bash
cd "/c/Users/almaz/AppData/Local/Temp/claude/C--Users-almaz-Desktop-myapp/4e970e83-25c6-48c4-bfa4-7a6ce309860f/scratchpad"
# ensure the static server is running: python -m http.server 8123 from the project root
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1900, height: 1100 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('http://localhost:8123/pages/N5/n5-dashboard.html', { waitUntil: 'load' });
  await page.screenshot({ path: 'dashboard-positions.png', fullPage: true });
  console.log(JSON.stringify({ errors }, null, 2));
  await browser.close();
})();
"
```

Expected: `errors` is `[]` for the three removed scripts (no more 404-triggered console errors from them — `n5-popup.js`/`n5-save.js`/`n5-map.js` will still 404 until Tasks 3-5 land, that's expected at this point). Read `dashboard-positions.png` and visually confirm each node circle now sits on its painted blue-circle stop, and the 5 scenery signs sit near their painted regions. If any are off, go back to Step 1 and correct that node's numbers, then re-screenshot.

- [ ] **Step 5: Commit**

```bash
cd "$HOME/Downloads/Japanese Web Dev"
git add pages/N5/n5-dashboard.html assets/css/n5-dashboard.css
git commit -m "Calibrate N5 journey-map node positions, add scenery signs"
```

---

### Task 3: Favorite-lessons persistence (`n5-save.js`)

**Files:**
- Create: `assets/js/n5-save.js`

**Interfaces:**
- Produces: `window.N5Save.isFavorite(lessonId: string): boolean`, `window.N5Save.toggleFavorite(lessonId: string): boolean` (returns the new favorited state), `window.N5Save.getFavorites(): string[]`.
- Consumes: nothing (no dependency on other files).

- [ ] **Step 1: Write `n5-save.js`**

```javascript
//======================================================
// N5 SAVE — favorited-lesson persistence (localStorage)
//======================================================

const N5_FAVORITES_KEY = "jpLibraryOS.n5.favorites";

function n5GetFavorites(){

    try{

        const raw = localStorage.getItem(N5_FAVORITES_KEY);

        return raw ? JSON.parse(raw) : [];

    } catch(e){

        return [];

    }

}

function n5IsFavorite(lessonId){

    return n5GetFavorites().includes(lessonId);

}

function n5ToggleFavorite(lessonId){

    const favorites = n5GetFavorites();

    const index = favorites.indexOf(lessonId);

    if(index === -1){

        favorites.push(lessonId);

    } else {

        favorites.splice(index, 1);

    }

    try{

        localStorage.setItem(N5_FAVORITES_KEY, JSON.stringify(favorites));

    } catch(e){

        // localStorage unavailable (privacy mode, quota, etc.) —
        // degrade to session-only, never throw.

    }

    return favorites.includes(lessonId);

}

window.N5Save = {

    getFavorites: n5GetFavorites,

    isFavorite: n5IsFavorite,

    toggleFavorite: n5ToggleFavorite,

};
```

- [ ] **Step 2: Verify with a quick Node smoke check (no browser needed for pure logic)**

```bash
cd "$HOME/Downloads/Japanese Web Dev"
node -e "
global.localStorage = (() => { let s = {}; return { getItem: k => s[k] ?? null, setItem: (k,v) => { s[k]=v; } }; })();
global.window = {};
require('./assets/js/n5-save.js');
console.assert(window.N5Save.isFavorite('1') === false, 'starts unfavorited');
console.assert(window.N5Save.toggleFavorite('1') === true, 'toggles on');
console.assert(window.N5Save.isFavorite('1') === true, 'now favorited');
console.assert(window.N5Save.toggleFavorite('1') === false, 'toggles off');
console.assert(JSON.stringify(window.N5Save.getFavorites()) === '[]', 'empty after toggle off');
console.log('n5-save.js: all assertions passed');
"
```

Expected output: `n5-save.js: all assertions passed`

- [ ] **Step 3: Commit**

```bash
cd "$HOME/Downloads/Japanese Web Dev"
git add assets/js/n5-save.js
git commit -m "Add localStorage-backed favorite-lesson persistence"
```

---

### Task 4: Lesson popup (`n5-popup.js`)

**Files:**
- Modify: `pages/N5/n5-dashboard.html:671-689` (add a Favorite button to the existing popup markup)
- Create: `assets/js/n5-popup.js`

**Interfaces:**
- Consumes: `window.N5Save.isFavorite`/`toggleFavorite` (Task 3).
- Produces: `window.N5Popup.open(lesson: {id, label, description, xp, href}): void`, `window.N5Popup.close(): void`, `window.N5Popup.isOpen(): boolean` — consumed by Task 5.

- [ ] **Step 1: Add a Favorite button to the popup markup**

In `pages/N5/n5-dashboard.html`, the existing popup body (around lines 671-689) has:

```html
            <div
                class="lesson-rewards">

                ⭐ XP:
                <span id="popupXP">

                    +50

                </span>

            </div>

            <button
                id="startLessonButton"
                class="retro-btn">

                ▶ Start Lesson

            </button>
```

Add a Favorite button right after `startLessonButton`:

```html
            <button
                id="favoriteLessonButton"
                class="retro-btn retro-btn-secondary">

                ⭐ Save/Favorite

            </button>
```

- [ ] **Step 2: Write `n5-popup.js`**

```javascript
//======================================================
// N5 POPUP — lesson popup: Start Lesson / Favorite / Exit
//======================================================

document.addEventListener("DOMContentLoaded", () => {

    const popup            = document.getElementById("lessonPopup");
    const popupTitle        = document.getElementById("popupTitle");
    const popupLessonTitle  = document.getElementById("popupLessonTitle");
    const popupDescription  = document.getElementById("popupLessonDescription");
    const popupXP           = document.getElementById("popupXP");
    const startButton       = document.getElementById("startLessonButton");
    const favoriteButton    = document.getElementById("favoriteLessonButton");
    const closeButton       = document.getElementById("closePopup");

    if(!popup) return;

    let currentLesson = null;

    function renderFavoriteState(){

        if(!currentLesson || !favoriteButton) return;

        const favorited = window.N5Save.isFavorite(currentLesson.id);

        favoriteButton.textContent = favorited
            ? "⭐ Favorited"
            : "⭐ Save/Favorite";

        favoriteButton.classList.toggle("favorited", favorited);

    }

    function open(lesson){

        currentLesson = lesson;

        popupTitle.textContent = "Lesson";
        popupLessonTitle.textContent = lesson.label;
        popupDescription.textContent = lesson.description;
        popupXP.textContent = "+" + lesson.xp;

        if(lesson.href){

            startButton.disabled = false;
            startButton.textContent = "▶ Start Lesson";

        } else {

            startButton.disabled = true;
            startButton.textContent = "🔒 Coming Soon";

        }

        renderFavoriteState();

        popup.classList.add("show");

    }

    function close(){

        popup.classList.remove("show");
        currentLesson = null;

    }

    function isOpen(){

        return popup.classList.contains("show");

    }

    if(startButton){

        startButton.addEventListener("click", () => {

            if(currentLesson && currentLesson.href){

                window.location.href = currentLesson.href;

            }

        });

    }

    if(favoriteButton){

        favoriteButton.addEventListener("click", () => {

            if(!currentLesson) return;

            window.N5Save.toggleFavorite(currentLesson.id);
            renderFavoriteState();

        });

    }

    if(closeButton){

        closeButton.addEventListener("click", close);

    }

    document.addEventListener("keydown", (e) => {

        if(e.key === "Escape" && isOpen()){

            close();

        }

    });

    window.N5Popup = { open, close, isOpen };

});
```

- [ ] **Step 3: Verify popup open/close/favorite with Playwright**

```bash
cd "/c/Users/almaz/AppData/Local/Temp/claude/C--Users-almaz-Desktop-myapp/4e970e83-25c6-48c4-bfa4-7a6ce309860f/scratchpad"
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8123/pages/N5/n5-dashboard.html', { waitUntil: 'load' });

  const result = await page.evaluate(() => {
    const lesson = { id: 'test-1', label: '👋 Test Lesson', description: 'A test.', xp: 50, href: null };
    window.N5Popup.open(lesson);
    const openedShowsComingSoon = document.getElementById('startLessonButton').disabled === true;
    const favBefore = document.getElementById('favoriteLessonButton').textContent.trim();
    document.getElementById('favoriteLessonButton').click();
    const favAfter = document.getElementById('favoriteLessonButton').textContent.trim();
    const isFavoritedNow = window.N5Save.isFavorite('test-1');
    window.N5Popup.close();
    const closedNow = !window.N5Popup.isOpen();
    return { openedShowsComingSoon, favBefore, favAfter, isFavoritedNow, closedNow };
  });

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
"
```

Expected: `openedShowsComingSoon: true`, `favBefore` contains "Save/Favorite", `favAfter` contains "Favorited", `isFavoritedNow: true`, `closedNow: true`.

- [ ] **Step 4: Commit**

```bash
cd "$HOME/Downloads/Japanese Web Dev"
git add pages/N5/n5-dashboard.html assets/js/n5-popup.js
git commit -m "Add lesson popup: Start Lesson / Save-Favorite / Exit"
```

---

### Task 5: Movement engine, lesson metadata, scenery-sign styling (`n5-map.js`)

**Files:**
- Modify: `assets/js/n5-map.js` (currently empty)
- Modify: `assets/css/n5-dashboard.css` (add `.scenery-sign` shared style + 5 position rules + `.lesson-node.in-range` hint style + switch `#playerCharacter` to JS-positioned)

**Interfaces:**
- Consumes: `window.N5Popup.open`/`isOpen` (Task 4).
- Produces: nothing consumed elsewhere — this is the top-level script that wires everything together on `DOMContentLoaded`.

- [ ] **Step 1: Add `.scenery-sign` styling to `n5-dashboard.css`**

```css
/*======================================================
SCENERY SIGN
======================================================*/

.scenery-sign{

    position:absolute;

    min-width:150px;

    padding:8px 14px;

    background:#8B5A2B;

    color:#FFF9E8;

    border:3px solid #C9A05A;

    border-radius:14px;

    font-size:.68rem;

    font-weight:700;

    text-align:center;

    box-shadow:
        0 6px 14px rgba(0,0,0,.18);

    user-select:none;

    pointer-events:none;

    z-index:150;

}

.scenery-sign-bridge{ /* use Task 1's real measured left/bottom % */ }

.scenery-sign-forest{ /* use Task 1's real measured left/bottom % */ }

.scenery-sign-towns{ /* use Task 1's real measured left/bottom % */ }

.scenery-sign-mountains{ /* use Task 1's real measured left/bottom % */ }

.scenery-sign-falls{ /* use Task 1's real measured left/bottom % */ }
```

Fill each of the 5 position rules with Task 1's recorded scenery anchor points before moving on — do not leave them empty.

- [ ] **Step 2: Add the in-range hint style and switch `#playerCharacter` to JS positioning**

```css
.lesson-node.in-range{

    transform:scale(1.4);

    box-shadow:
        0 0 22px #FFD84D,
        0 0 45px #FFD84D;

}
```

`#playerCharacter` already has `position:absolute; transition: left .5s ease, top .5s ease, transform .25s ease;` (lines 421-443). Change the `transition` line to only cover `transform` — continuous per-frame `left`/`top` updates from JS would otherwise fight the `.5s ease` transition and look laggy/rubber-banded:

```css
#playerCharacter{

    position:absolute;

    width:72px;

    height:72px;

    left:8%;

    bottom:8%;

    z-index:300;

    transition:

        transform .15s ease;

}
```

- [ ] **Step 3: Write `n5-map.js`**

```javascript
//======================================================
// N5 MAP — free-roam movement, proximity, lesson data
//======================================================

const N5_LESSONS = {

    "1":       { id:"1",       label:"👋 Basic Greetings",              description:"Learn the basic greetings every conversation starts with.",       xp:50,  href:"lesson-01-greetings.html" },
    "2":       { id:"2",       label:"💬 Everyday Expressions",          description:"Common everyday phrases you'll use constantly.",                  xp:50,  href:null },
    "3":       { id:"3",       label:"🙋 Self Introduction",             description:"Introduce yourself: name, nationality, and job.",                 xp:50,  href:"grammar/lesson-02-self-introduction.html" },
    "4":       { id:"4",       label:"📘 A は B です",                    description:"The core A は B です sentence pattern.",                           xp:50,  href:"grammar/lesson-03-a-wa-b-desu.html" },
    "5":       { id:"5",       label:"📦 Demonstratives",                description:"This, that, and that over there — これ／それ／あれ and friends.", xp:50,  href:"grammar/lesson-04-demonstratives.html" },
    "6":       { id:"6",       label:"❓ Questions (か)",                 description:"Turn statements into questions with か.",                         xp:50,  href:"grammar/questions.html" },
    "7":       { id:"7",       label:"🧭 Places and Directions",         description:"Numbers, counters, and asking where things are.",                xp:50,  href:"grammar/numbers.html" },
    "review1": { id:"review1", label:"📋 Foundations Review",            description:"Review everything from Basic Greetings through Places and Directions.", xp:100, href:null },
    "9":       { id:"9",       label:"👥 Nouns & Pronouns",              description:"Nouns and pronouns — the building blocks of any sentence.",       xp:50,  href:null },
    "10":      { id:"10",      label:"🌸 Adjectives",                    description:"Describing things with い-adjectives and な-adjectives.",          xp:50,  href:null },
    "11":      { id:"11",      label:"⚡ Adverbs and Verbs",              description:"Adverbs and verb basics.",                                        xp:50,  href:null },
    "12":      { id:"12",      label:"🔄 Conjugations",                  description:"Conjugating verbs into their different forms.",                   xp:50,  href:null },
    "review2": { id:"review2", label:"📋 Sentence Builder Review",       description:"Review everything from Nouns & Pronouns through Conjugations.",   xp:100, href:null },
    "13":      { id:"13",      label:"🧱 Sentence Construction",         description:"Putting it all together: building full sentences.",              xp:50,  href:null },
    "14":      { id:"14",      label:"🧩 Particle Mastery",              description:"Mastering は、が、を、に、で and friends.",                          xp:50,  href:null },
    "15":      { id:"15",      label:"👥 Existence (あります・います)",    description:"Existence: あります and います.",                                  xp:50,  href:null },
    "final":   { id:"final",   label:"🏆 Final N5 Review",               description:"The final N5 review before you're ready for N4.",                xp:200, href:null },

};

document.addEventListener("DOMContentLoaded", () => {

    const map    = document.getElementById("lessonMap");
    const player = document.getElementById("playerCharacter");
    const nodes  = Array.from(document.querySelectorAll(".lesson-node"));

    if(!map || !player || !window.N5Popup) return;

    const SPEED = 220; // px per second
    const RANGE = 40;  // px proximity radius for the "in range" hint + Enter/Space interact

    const pressedKeys = new Set();

    let x = null;
    let y = null;
    let nearestNode = null;
    let lastFrameTime = null;

    function initialPosition(){

        const startGate = document.getElementById("startGate");
        const mapRect = map.getBoundingClientRect();

        if(startGate){

            const gateRect = startGate.getBoundingClientRect();
            x = gateRect.left - mapRect.left;
            y = gateRect.top - mapRect.top;

        } else {

            x = 0;
            y = mapRect.height - player.offsetHeight;

        }

    }

    function render(){

        player.style.left = x + "px";
        player.style.top = y + "px";

    }

    function setWalking(isWalking){

        player.classList.toggle("walking", isWalking);

    }

    function updateNearestNode(){

        const mapRect = map.getBoundingClientRect();
        const playerCenterX = x + player.offsetWidth / 2;
        const playerCenterY = y + player.offsetHeight / 2;

        let closest = null;
        let closestDistance = Infinity;

        nodes.forEach((node) => {

            const rect = node.getBoundingClientRect();
            const nodeCenterX = rect.left - mapRect.left + rect.width / 2;
            const nodeCenterY = rect.top - mapRect.top + rect.height / 2;

            const distance = Math.hypot(
                playerCenterX - nodeCenterX,
                playerCenterY - nodeCenterY
            );

            node.classList.remove("in-range");

            if(distance < RANGE && distance < closestDistance){

                closest = node;
                closestDistance = distance;

            }

        });

        if(closest){

            closest.classList.add("in-range");

        }

        nearestNode = closest;

    }

    function openNodePopup(node){

        const lessonId = node.dataset.lesson;
        const lesson = N5_LESSONS[lessonId];

        if(lesson){

            window.N5Popup.open(lesson);

        }

    }

    function step(timestamp){

        requestAnimationFrame(step);

        if(lastFrameTime === null){

            lastFrameTime = timestamp;
            return;

        }

        const deltaSeconds = (timestamp - lastFrameTime) / 1000;
        lastFrameTime = timestamp;

        if(window.N5Popup.isOpen()){

            setWalking(false);
            return;

        }

        let dx = 0;
        let dy = 0;

        if(pressedKeys.has("ArrowUp")    || pressedKeys.has("w")) dy -= 1;
        if(pressedKeys.has("ArrowDown")  || pressedKeys.has("s")) dy += 1;
        if(pressedKeys.has("ArrowLeft")  || pressedKeys.has("a")) dx -= 1;
        if(pressedKeys.has("ArrowRight") || pressedKeys.has("d")) dx += 1;

        const isMoving = dx !== 0 || dy !== 0;

        if(isMoving){

            const length = Math.hypot(dx, dy);
            dx /= length;
            dy /= length;

            const mapRect = map.getBoundingClientRect();

            x = Math.min(
                Math.max(x + dx * SPEED * deltaSeconds, 0),
                mapRect.width - player.offsetWidth
            );

            y = Math.min(
                Math.max(y + dy * SPEED * deltaSeconds, 0),
                mapRect.height - player.offsetHeight
            );

            render();

        }

        setWalking(isMoving);
        updateNearestNode();

    }

    document.addEventListener("keydown", (e) => {

        if(window.N5Popup.isOpen()){

            if(e.key === "Enter" || e.key === " "){

                e.preventDefault();

            }

            return;

        }

        pressedKeys.add(e.key);

        if((e.key === "Enter" || e.key === " ") && nearestNode){

            e.preventDefault();
            openNodePopup(nearestNode);

        }

    });

    document.addEventListener("keyup", (e) => {

        pressedKeys.delete(e.key);

    });

    nodes.forEach((node) => {

        node.addEventListener("click", () => openNodePopup(node));

    });

    initialPosition();
    render();
    requestAnimationFrame(step);

});
```

- [ ] **Step 4: Verify movement, bounds clamping, and popup-trigger-on-proximity with Playwright**

```bash
cd "/c/Users/almaz/AppData/Local/Temp/claude/C--Users-almaz-Desktop-myapp/4e970e83-25c6-48c4-bfa4-7a6ce309860f/scratchpad"
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1900, height: 1100 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));

  await page.goto('http://localhost:8123/pages/N5/n5-dashboard.html', { waitUntil: 'load' });
  await page.waitForTimeout(200);

  const start = await page.evaluate(() => {
    const p = document.getElementById('playerCharacter');
    return { left: parseFloat(p.style.left), top: parseFloat(p.style.top) };
  });

  // Hold ArrowUp + ArrowLeft for 1.5s (moves toward top-left, off the map bounds)
  await page.keyboard.down('ArrowUp');
  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(1500);
  await page.keyboard.up('ArrowUp');
  await page.keyboard.up('ArrowLeft');
  await page.waitForTimeout(200);

  const clamped = await page.evaluate(() => {
    const p = document.getElementById('playerCharacter');
    return { left: parseFloat(p.style.left), top: parseFloat(p.style.top), walking: p.classList.contains('walking') };
  });

  // Teleport the player directly onto a known node (lesson-1) via evaluate,
  // to deterministically test the proximity+popup path without depending
  // on exact walk timing across the whole map.
  const proximityResult = await page.evaluate(() => {
    const map = document.getElementById('lessonMap');
    const node = document.querySelector('.lesson-node.lesson-1');
    const mapRect = map.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const p = document.getElementById('playerCharacter');
    p.style.left = (nodeRect.left - mapRect.left + nodeRect.width/2 - p.offsetWidth/2) + 'px';
    p.style.top = (nodeRect.top - mapRect.top + nodeRect.height/2 - p.offsetHeight/2) + 'px';
    return new Promise(resolve => {
      setTimeout(() => {
        const inRange = node.classList.contains('in-range');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        setTimeout(() => {
          resolve({ inRange, popupOpen: window.N5Popup.isOpen() });
        }, 100);
      }, 100);
    });
  });

  await page.screenshot({ path: 'roam-verify.png' });
  console.log(JSON.stringify({ errors, start, clamped, proximityResult }, null, 2));
  await browser.close();
})();
"
```

Expected: `errors: []`; `clamped.left` and `clamped.top` both `>= 0` (never negative, proving the top-left clamp held even though ArrowUp+ArrowLeft was held well past reaching the edge); `clamped.walking: false` (keys were released before the final read); `proximityResult.inRange: true`; `proximityResult.popupOpen: true`. Read `roam-verify.png` to visually confirm the cat rendered at the lesson-1 node with the popup showing.

- [ ] **Step 5: Commit**

```bash
cd "$HOME/Downloads/Japanese Web Dev"
git add assets/js/n5-map.js assets/css/n5-dashboard.css
git commit -m "Add free-roam movement engine with proximity-triggered lesson popups"
```

---

### Task 6: End-to-end favorite-persistence verification

**Files:**
- No source changes — verification only, per the spec's Verification section item 4.

**Interfaces:**
- Consumes: everything from Tasks 3-5.

- [ ] **Step 1: Verify favoriting survives a real page reload**

```bash
cd "/c/Users/almaz/AppData/Local/Temp/claude/C--Users-almaz-Desktop-myapp/4e970e83-25c6-48c4-bfa4-7a6ce309860f/scratchpad"
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:8123/pages/N5/n5-dashboard.html', { waitUntil: 'load' });

  await page.evaluate(() => {
    window.N5Popup.open(window.N5_LESSONS ? window.N5_LESSONS['1'] : { id: '1', label: 'x', description: 'x', xp: 1, href: null });
  });
  await page.click('#favoriteLessonButton');

  const beforeReload = await page.evaluate(() => window.N5Save.isFavorite('1'));

  await page.reload({ waitUntil: 'load' });

  const afterReload = await page.evaluate(() => window.N5Save.isFavorite('1'));

  console.log(JSON.stringify({ beforeReload, afterReload }, null, 2));
  await browser.close();
})();
"
```

Note: `N5_LESSONS` is declared with `const` at module scope in `n5-map.js`, not attached to `window` — if this check fails with a reference error, open the popup via clicking `.lesson-1` directly instead (`await page.click('.lesson-node.lesson-1')`) rather than reaching for `N5_LESSONS` from outside the script.

Expected: `beforeReload: true`, `afterReload: true` — proving the favorite survived a real reload via `localStorage`, not just in-memory state.

- [ ] **Step 2: No commit needed**

This task only verifies prior work; there are no file changes to commit.

---

## Plan Self-Review Notes

- **Spec coverage:** calibration (Task 1) → positions/scenery/dead-scripts (Task 2) → favorites (Task 3) → popup (Task 4) → movement/proximity/lesson data (Task 5) → reload-persistence check (Task 6). Every spec section (Architecture, Movement & interaction, Cat character, Scenery overlays, Error handling, Verification) maps to a task above.
- **Treasure chests / final-review ambiguity found while planning:** the spec said to "keep both, position them reasonably" but never defined popup content for treasure chests. Resolved explicitly in Global Constraints: treasure chests stay decorative-only this pass (no invented reward content); `.final-review` gets full popup treatment since it behaves exactly like a review checkpoint.
- **Start Lesson navigation gap found while planning:** the spec didn't say what happens when a lesson has no page yet (most don't). Resolved concretely in Task 4/5: `href: null` lessons show a disabled "🔒 Coming Soon" button instead of a broken navigation.
