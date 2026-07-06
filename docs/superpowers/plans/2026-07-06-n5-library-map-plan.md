# N5 Library Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the N5 dashboard's mountain/forest/river journey map with a code-drawn library scene, keeping the existing HUD/popup/favorites shell and the same 18 lesson stops (now furniture), and add a recolorable cat sprite system: a first-visit avatar picker (6 colors) for the player's own cat, plus 3 ambient NPC cats wandering the room.

**Architecture:** Pure static HTML/CSS/vanilla JS, no build step, no new dependency — matches every other script in `assets/js/`. The map layer stays wrapped in an aspect-ratio-locked frame (the fix already proven on the old journey map) so furniture/node positions never drift from the art, but the "art" is now CSS shapes authored at a fixed 16:10 design ratio instead of a measured photo. The existing movement/proximity/popup engine (`n5-map.js`, `n5-popup.js`) is reused almost unchanged — only its node styling and initial-position anchor change.

**Tech Stack:** HTML/CSS/vanilla JS (`window`-namespaced globals). Verification via Playwright, installed in the session scratchpad only (`C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Downloads-Japanese-Web-Dev\1654f77f-f109-4d3a-951c-1152d31cb30b\scratchpad`, already has `node_modules/playwright` with chromium installed — reuse it, do not reinstall). Static server: `python -m http.server 8123` from the project root (already the convention from the previous pass; start it if not already running, check with `curl -s -o /dev/null -w "%{http_code}" http://localhost:8123/pages/N5/n5-dashboard.html` first).

## Global Constraints

- No lock/complete progress gating — every stop stays open and interactive regardless of order (spec Non-goals).
- No treasure chests or equivalent — dropped entirely, not re-themed (spec Non-goals, user-confirmed).
- No NPC-cat interaction — the 3 ambient cats are wander-only: no click handler, no popup, no proximity detection (spec Non-goals).
- No collision between any cat (player or NPC) and furniture, or between cats — movement is bounds-clamped to the frame only (spec Non-goals, matches the prior map's precedent).
- `N5_LESSONS`'s 18 entries (ids, labels, descriptions, xp, hrefs) do not change — only how each one is drawn changes (spec Non-goals).
- `assets/images/backgrounds/n5-journey-map.png` and its calibrated coordinates are not deleted — earmarked for a future N1 build (spec Non-goals). This plan only removes the N5 dashboard's *references* to it.
- No image-generation tool is available — the library scene and every cat are built from CSS/SVG shapes, not image files (spec Context).
- `localStorage` failures (privacy mode, quota, etc.) must degrade to session-only behavior for both favorites (already true) and the new avatar-color key — never throw.

---

### Task 1: Library scene shell + aspect-locked frame

**Files:**
- Modify: `pages/N5/n5-dashboard.html:207-227` (the `<main id="journeyMap">` opening through the old `#startGate` block)
- Modify: `assets/css/n5-dashboard.css:262-417` (MAP / MAP FRAME / BACKGROUND / LESSON MAP / START GATE / MAP DECORATION sections)

**Interfaces:**
- Produces: `#mapFrame` now locked to a `16/10` design aspect ratio (was `1672/941`, the old photo's ratio) — this is the shared coordinate space every later task positions against. `#libraryEntrance` replaces `#startGate` as the player's spawn-position anchor (same role, new id).
- Consumes: nothing from other tasks.

- [ ] **Step 1: Replace the map markup**

In `pages/N5/n5-dashboard.html`, replace this block (currently lines 207-227):

```html
<main id="journeyMap">

    <div id="mapFrame">

    <!-- Background Image -->

    <img
        src="../../assets/images/backgrounds/n5-journey-map.png"
        alt="JLPT N5 Journey"
        class="journey-background">

    <!-- =====================================
         PLAYER CHARACTER
    ====================================== -->

    <div id="playerCharacter">

        <img
            src="../../assets/images/icons/pixels/fortunecat-Original.png"
            alt="Player">

    </div>

    <!-- =====================================
         START GATE
    ====================================== -->

    <div id="startGate">

        <img
            src="../../assets/images/map/torii.png"
            alt="Start Gate">

        <span>

            START

        </span>

    </div>
```

with:

```html
<main id="journeyMap">

    <div id="mapFrame">

    <!-- =====================================
         LIBRARY SCENE (code-drawn, no image file)
    ====================================== -->

    <div class="library-room">

        <div class="library-wall library-wall--back"></div>

        <div class="library-window library-window--1"></div>

        <div class="library-window library-window--2"></div>

        <div class="library-floor"></div>

        <div class="library-rug"></div>

    </div>

    <!-- =====================================
         ENTRANCE (player spawn anchor, no art)
    ====================================== -->

    <div id="libraryEntrance"></div>

    <!-- =====================================
         PLAYER CHARACTER
         (cat markup replaced in Task 4 — placeholder
         div kept here so Task 2/3 have a stable anchor)
    ====================================== -->

    <div id="playerCharacter"></div>
```

Leave everything from `<!-- MAP CONTAINER -->` / `<div id="lessonMap">` onward untouched for this task — Task 3 replaces its contents.

- [ ] **Step 2: Replace the map/background CSS**

In `assets/css/n5-dashboard.css`, replace lines 262-417 (from the `MAP` comment header through the end of the `MAP DECORATION` block) with:

```css
/*======================================================
MAP
======================================================*/

#journeyMap{

    position:relative;

    width:100%;

    height:calc(100vh - var(--hud-height) - 42px);

    overflow:hidden;

}

/*======================================================
MAP FRAME
Locks the map layer to a fixed 16:10 design ratio so
furniture and %-positioned nodes always share the same
coordinate space, at any window size. The library scene
is code-drawn (no source image), so this ratio is an
authored design choice, not a measured value.
======================================================*/

#mapFrame{

    position:absolute;

    inset:0;

    margin:auto;

    aspect-ratio:16/10;

    max-width:100%;

    max-height:100%;

    overflow:hidden;

}


/*======================================================
LIBRARY ROOM SHELL
======================================================*/

.library-room{

    position:absolute;

    inset:0;

    background:linear-gradient(#3B2A1E, #4A3520 60%, #5C4028);

}

.library-wall{

    position:absolute;

    left:0;

    right:0;

    top:0;

    height:45%;

    background:#4A3520;

}

.library-window{

    position:absolute;

    top:8%;

    width:14%;

    height:22%;

    background:linear-gradient(#FFE9B0, #FFB870);

    border:6px solid #6E4A2E;

    border-radius:6px;

}

.library-window--1{

    left:12%;

}

.library-window--2{

    right:12%;

}

.library-floor{

    position:absolute;

    left:0;

    right:0;

    bottom:0;

    height:55%;

    background:

        repeating-linear-gradient(

            90deg,

            #7A5330,

            #7A5330 40px,

            #6E4A2A 40px,

            #6E4A2A 80px

        );

}

.library-rug{

    position:absolute;

    left:20%;

    right:20%;

    bottom:6%;

    height:30%;

    background:#8B2E2E;

    border:10px solid #6E2323;

    border-radius:8px;

}


/*======================================================
LESSON MAP
======================================================*/

#lessonMap{

    position:absolute;

    inset:0;

    width:100%;

    height:100%;

}


/*======================================================
LIBRARY ENTRANCE (spawn anchor, no visible art)
======================================================*/

#libraryEntrance{

    position:absolute;

    left:83%;

    bottom:6%;

    width:1px;

    height:1px;

}
```

Do not touch anything from `PLAYER CHARACTER` onward in the CSS file yet — Task 4 replaces that section.

- [ ] **Step 3: Verify with Playwright**

Ensure the static server is running (`curl -s -o /dev/null -w "%{http_code}" http://localhost:8123/pages/N5/n5-dashboard.html` should print `200`; if not, run `python -m http.server 8123` from the project root in the background first).

```bash
cd "C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Downloads-Japanese-Web-Dev\1654f77f-f109-4d3a-951c-1152d31cb30b\scratchpad"
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const results = [];
  for (const vp of [{w:1920,h:1080},{w:1366,h:768},{w:1280,h:1024}]) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://localhost:8123/pages/N5/n5-dashboard.html', { waitUntil: 'load' });
    const aspect = await page.evaluate(() => {
      const f = document.getElementById('mapFrame').getBoundingClientRect();
      return (f.width / f.height).toFixed(4);
    });
    results.push({ vp, aspect, errors });
    await page.screenshot({ path: 'library-shell-' + vp.w + 'x' + vp.h + '.png' });
    await page.close();
  }
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
"
```

Expected: `aspect` reads `1.6000` at all three viewport sizes (confirms the 16:10 lock holds regardless of window shape), `errors` is `[]` for each. Read at least one screenshot and confirm a warm-toned room (dark wood walls, two glowing windows, wood floor, a red rug) renders inside the frame with no visible tearing or overflow outside `#mapFrame`.

- [ ] **Step 4: Commit**

```bash
cd "C:\Users\almaz\Downloads\Japanese Web Dev"
git add pages/N5/n5-dashboard.html assets/css/n5-dashboard.css
git commit -m "Replace N5 journey map with code-drawn library scene shell"
```

---

### Task 2: Recolorable cat component

**Files:**
- Modify: `assets/css/n5-dashboard.css` (append a new `CAT COMPONENT` section — exact insertion point given in Step 2)

**Interfaces:**
- Produces: a reusable `.cat` component — outer element needs classes `cat cat--<color>` (`<color>` ∈ `orange`, `black`, `calico`, `gray`, `brown`, `white`) and the fixed inner markup shown in Step 1. Toggling a `.walking` class on the same outer element starts the leg-walk-cycle. Consumed by Task 4 (player), Task 5 (picker swatches), Task 6 (NPCs).
- Consumes: nothing from other tasks.

- [ ] **Step 1: Note the reusable cat markup (used by later tasks, not written to any file in this task)**

Every cat instance (player, picker swatch, NPC) uses this exact inner structure, with only the outer `cat--<color>` class changing:

```html
<div class="cat cat--orange">

    <span class="cat__tail"></span>

    <span class="cat__ear cat__ear--l"></span>

    <span class="cat__ear cat__ear--r"></span>

    <span class="cat__head"></span>

    <span class="cat__body"></span>

    <span class="cat__stripe cat__stripe--1"></span>

    <span class="cat__stripe cat__stripe--2"></span>

    <span class="cat__patch cat__patch--a"></span>

    <span class="cat__patch cat__patch--b"></span>

    <span class="cat__leg cat__leg--fl"></span>

    <span class="cat__leg cat__leg--fr"></span>

    <span class="cat__leg cat__leg--bl"></span>

    <span class="cat__leg cat__leg--br"></span>

</div>
```

- [ ] **Step 2: Append the cat component CSS**

Append this new section to the end of `assets/css/n5-dashboard.css` (after the last `@media` block):

```css
/*======================================================
CAT COMPONENT
Reusable recolorable pixel-cat: body/head/ears/tail/legs
as plain shapes, fur color driven by --fur/--fur-dark
custom properties per .cat--<color> class. .cat__stripe
only renders for tabby colors (orange, gray); .cat__patch
only renders for calico. Toggling .walking on the outer
.cat element runs the leg-alternation keyframes.
======================================================*/

.cat{

    position:relative;

    width:40px;

    height:40px;

}

.cat__body{

    position:absolute;

    left:7px;

    top:16px;

    width:26px;

    height:18px;

    background:var(--fur);

    border-radius:10px 10px 6px 6px;

    z-index:2;

}

.cat__head{

    position:absolute;

    left:11px;

    top:4px;

    width:18px;

    height:16px;

    background:var(--fur);

    border-radius:8px 8px 6px 6px;

    z-index:3;

}

.cat__ear{

    position:absolute;

    top:-2px;

    width:0;

    height:0;

    border-left:5px solid transparent;

    border-right:5px solid transparent;

    border-bottom:8px solid var(--fur);

    z-index:3;

}

.cat__ear--l{

    left:10px;

    transform:rotate(-15deg);

}

.cat__ear--r{

    left:22px;

    transform:rotate(15deg);

}

.cat__tail{

    position:absolute;

    left:29px;

    top:14px;

    width:6px;

    height:20px;

    background:var(--fur);

    border-radius:4px;

    transform-origin:top center;

    animation:catTailSway 1.2s ease-in-out infinite alternate;

    z-index:1;

}

.cat__leg{

    position:absolute;

    bottom:0;

    width:5px;

    height:10px;

    background:var(--fur-dark);

    border-radius:2px;

    transform-origin:top center;

    z-index:1;

}

.cat__leg--fl{ left:9px; }

.cat__leg--fr{ left:16px; }

.cat__leg--bl{ left:23px; }

.cat__leg--br{ left:30px; }

.cat__stripe,
.cat__patch{

    display:none;

}

.cat--orange .cat__stripe,
.cat--gray .cat__stripe{

    display:block;

    position:absolute;

    background:var(--fur-dark);

    border-radius:2px;

}

.cat__stripe--1{ left:12px; top:8px; width:12px; height:3px; }

.cat__stripe--2{ left:10px; top:20px; width:16px; height:3px; }

.cat--calico .cat__patch{

    display:block;

    position:absolute;

    border-radius:50%;

}

.cat--calico .cat__patch--a{

    left:10px;

    top:6px;

    width:10px;

    height:8px;

    background:#E8935A;

}

.cat--calico .cat__patch--b{

    left:16px;

    top:18px;

    width:9px;

    height:9px;

    background:#2B2B2E;

}

@keyframes catTailSway{

    from{ transform:rotate(-10deg); }

    to{ transform:rotate(10deg); }

}

@keyframes catWalkA{

    0%, 100%{ transform:rotate(-18deg); }

    50%{ transform:rotate(18deg); }

}

@keyframes catWalkB{

    0%, 100%{ transform:rotate(18deg); }

    50%{ transform:rotate(-18deg); }

}

.cat.walking .cat__leg--fl,
.cat.walking .cat__leg--br{

    animation:catWalkA .4s linear infinite;

}

.cat.walking .cat__leg--fr,
.cat.walking .cat__leg--bl{

    animation:catWalkB .4s linear infinite;

}

.cat--orange{ --fur:#E8935A; --fur-dark:#C97A44; }

.cat--black{ --fur:#2B2B2E; --fur-dark:#1A1A1C; }

.cat--gray{ --fur:#9AA0A6; --fur-dark:#7D8388; }

.cat--brown{ --fur:#8B5E3C; --fur-dark:#6E4A2E; }

.cat--white{ --fur:#F5F1E8; --fur-dark:#D8D2C4; }

.cat--calico{ --fur:#F5F1E8; --fur-dark:#D8D2C4; }
```

- [ ] **Step 3: Verify all 6 colors + walk-cycle in a scratchpad harness**

Write `cat-harness.html` in the scratchpad (not part of the project — same precedent as the earlier calibration harness):

```html
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="file:///C:/Users/almaz/Downloads/Japanese Web Dev/assets/css/n5-dashboard.css">
<style>body{background:#3B2A1E;display:flex;gap:40px;padding:40px;}</style>
</head>
<body>
</body>
</html>
```

Then use Playwright to inject one `.cat` instance per color (using the exact markup from Step 1, swapping only the `cat--<color>` class), add `.walking` to the first one, and screenshot:

```bash
cd "C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Downloads-Japanese-Web-Dev\1654f77f-f109-4d3a-951c-1152d31cb30b\scratchpad"
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 500, height: 200 } });
  await page.goto('file://' + __dirname + '/cat-harness.html');
  const colors = ['orange','black','calico','gray','brown','white'];
  const inner = '<span class=\"cat__tail\"></span><span class=\"cat__ear cat__ear--l\"></span><span class=\"cat__ear cat__ear--r\"></span><span class=\"cat__head\"></span><span class=\"cat__body\"></span><span class=\"cat__stripe cat__stripe--1\"></span><span class=\"cat__stripe cat__stripe--2\"></span><span class=\"cat__patch cat__patch--a\"></span><span class=\"cat__patch cat__patch--b\"></span><span class=\"cat__leg cat__leg--fl\"></span><span class=\"cat__leg cat__leg--fr\"></span><span class=\"cat__leg cat__leg--bl\"></span><span class=\"cat__leg cat__leg--br\"></span>';
  await page.evaluate(({colors, inner}) => {
    colors.forEach((c, i) => {
      const div = document.createElement('div');
      div.className = 'cat cat--' + c + (i === 0 ? ' walking' : '');
      div.innerHTML = inner;
      document.body.appendChild(div);
    });
  }, { colors, inner });
  await page.screenshot({ path: 'cat-harness.png' });
  await browser.close();
})();
"
```

Read `cat-harness.png`. Confirm: 6 visually distinct cats (orange with stripes, solid black, calico with orange+black patches on a white base, gray with stripes, solid brown, solid white), and that the first (walking) one's legs are visibly mid-stride relative to the other 5 (different rotation angle — a single screenshot catches one animation frame, which is sufficient to confirm the animation is applying, not that it's mid-cycle at a specific angle).

- [ ] **Step 4: Commit**

```bash
cd "C:\Users\almaz\Downloads\Japanese Web Dev"
git add assets/css/n5-dashboard.css
git commit -m "Add reusable recolorable cat sprite component with walk-cycle"
```

---

### Task 3: Wire the 18 lesson stops as library furniture

**Files:**
- Modify: `pages/N5/n5-dashboard.html` (the `<div id="lessonMap">` block, currently empty after Task 1)
- Modify: `assets/css/n5-dashboard.css` (append `FURNITURE NODE` styles + positions)

**Interfaces:**
- Consumes: nothing from other tasks (does not depend on the cat component).
- Produces: 18 elements matching `.lesson-node` (unchanged selector — `n5-map.js` already does `document.querySelectorAll(".lesson-node")` and reads `node.dataset.lesson`, so **no JS changes are needed for node wiring**). Each also carries `.furniture-node` for its new visual styling, and its original position-lookup class (`.lesson-1`, `.review-node`, `.final-review`, etc.) is unchanged so no popup/movement logic elsewhere needs updating.

- [ ] **Step 1: Replace the `#lessonMap` contents**

In `pages/N5/n5-dashboard.html`, find `<div id="lessonMap">` (empty since Task 1 removed its children) and insert all 18 furniture nodes:

```html
    <div id="lessonMap">

    <button class="lesson-node furniture-node lesson-1" data-lesson="1">
        <span class="furniture-icon">👋</span>
        <span class="furniture-label">Basic Greetings</span>
    </button>

    <button class="lesson-node furniture-node lesson-2" data-lesson="2">
        <span class="furniture-icon">💬</span>
        <span class="furniture-label">Everyday Expressions</span>
    </button>

    <button class="lesson-node furniture-node lesson-3" data-lesson="3">
        <span class="furniture-icon">🙋</span>
        <span class="furniture-label">Self Introduction</span>
    </button>

    <button class="lesson-node furniture-node lesson-4" data-lesson="4">
        <span class="furniture-icon">📘</span>
        <span class="furniture-label">A は B です</span>
    </button>

    <button class="lesson-node furniture-node lesson-5" data-lesson="5">
        <span class="furniture-icon">📦</span>
        <span class="furniture-label">Demonstratives</span>
    </button>

    <button class="lesson-node furniture-node lesson-6" data-lesson="6">
        <span class="furniture-icon">❓</span>
        <span class="furniture-label">Questions (か)</span>
    </button>

    <button class="lesson-node furniture-node lesson-7" data-lesson="7">
        <span class="furniture-icon">🧭</span>
        <span class="furniture-label">Places and Directions</span>
    </button>

    <button class="lesson-node furniture-node review-node" data-lesson="review1">
        <span class="furniture-icon">📋</span>
        <span class="furniture-label">Foundations Review</span>
    </button>

    <button class="lesson-node furniture-node lesson-9" data-lesson="9">
        <span class="furniture-icon">👥</span>
        <span class="furniture-label">Nouns &amp; Pronouns</span>
    </button>

    <button class="lesson-node furniture-node lesson-10" data-lesson="10">
        <span class="furniture-icon">🌸</span>
        <span class="furniture-label">Adjectives</span>
    </button>

    <button class="lesson-node furniture-node lesson-11" data-lesson="11">
        <span class="furniture-icon">⚡</span>
        <span class="furniture-label">Adverbs and Verbs</span>
    </button>

    <button class="lesson-node furniture-node lesson-12" data-lesson="12">
        <span class="furniture-icon">🔄</span>
        <span class="furniture-label">Conjugations</span>
    </button>

    <button class="lesson-node furniture-node review-node review-node-2" data-lesson="review2">
        <span class="furniture-icon">📋</span>
        <span class="furniture-label">Sentence Builder Review</span>
    </button>

    <button class="lesson-node furniture-node lesson-13" data-lesson="13">
        <span class="furniture-icon">🧱</span>
        <span class="furniture-label">Sentence Construction</span>
    </button>

    <button class="lesson-node furniture-node lesson-14" data-lesson="14">
        <span class="furniture-icon">🧩</span>
        <span class="furniture-label">Particle Mastery</span>
    </button>

    <button class="lesson-node furniture-node lesson-15" data-lesson="15">
        <span class="furniture-icon">👥</span>
        <span class="furniture-label">Existence (あります・います)</span>
    </button>

    <button class="lesson-node furniture-node final-review" data-lesson="final">
        <span class="furniture-icon">🏆</span>
        <span class="furniture-label">Final N5 Review</span>
    </button>

    </div>
```

- [ ] **Step 2: Append furniture-node styles and positions**

Append to `assets/css/n5-dashboard.css`:

```css
/*======================================================
FURNITURE NODE
Re-themes the old glowing-circle lesson node as a labeled
library furniture plank. Keeps the same interactive
contract (.lesson-node, data-lesson, .in-range) that
n5-map.js already drives — only the look changes.
======================================================*/

.furniture-node{

    position:absolute;

    display:flex;

    flex-direction:column;

    align-items:center;

    gap:6px;

    min-width:150px;

    padding:14px 18px;

    background:#8B5A2B;

    color:#FFF9E8;

    border:3px solid #C9A05A;

    border-radius:14px;

    font-size:.68rem;

    font-weight:700;

    text-align:center;

    cursor:pointer;

    box-shadow:0 8px 18px rgba(0,0,0,.25);

    transition:.25s ease;

    z-index:210;

}

.furniture-icon{

    font-size:1.4rem;

}

.furniture-node:hover{

    transform:translateY(-4px);

}

.furniture-node.in-range{

    transform:scale(1.08);

    box-shadow:0 0 22px #FFD84D, 0 0 45px #FFD84D;

}

.furniture-node.review-node{

    border-color:#F5C14C;

}

.furniture-node.final-review{

    border-color:#FF6B6B;

    background:#6E3A2B;

}


/*======================================================
FURNITURE POSITIONS
======================================================*/

.lesson-1{ left:30%; bottom:5%; }

.lesson-2{ left:45%; bottom:5%; }

.lesson-3{ left:61%; bottom:5%; }

.lesson-4{ right:69%; bottom:22%; }

.lesson-5{ right:53%; bottom:22%; }

.lesson-6{ right:38%; bottom:22%; }

.lesson-7{ left:37%; bottom:36%; }

.review-node{ left:52%; bottom:36%; }

.lesson-9{ left:67%; bottom:36%; }

.lesson-10{ right:56%; bottom:57%; }

.lesson-11{ right:41%; bottom:57%; }

.lesson-12{ right:27%; bottom:57%; }

.review-node-2{ left:22%; bottom:66%; }

.lesson-13{ left:44%; bottom:71%; }

.lesson-14{ left:59%; bottom:71%; }

.lesson-15{ left:73%; bottom:71%; }

.final-review{ left:32%; bottom:82%; }
```

- [ ] **Step 3: Verify with Playwright**

```bash
cd "C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Downloads-Japanese-Web-Dev\1654f77f-f109-4d3a-951c-1152d31cb30b\scratchpad"
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1900, height: 1100 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8123/pages/N5/n5-dashboard.html', { waitUntil: 'load' });
  const nodeCount = await page.evaluate(() => document.querySelectorAll('.lesson-node').length);
  await page.click('.lesson-node.lesson-1');
  const popupState = await page.evaluate(() => ({
    open: window.N5Popup.isOpen(),
    title: document.getElementById('popupLessonTitle').textContent.trim()
  }));
  await page.screenshot({ path: 'furniture-nodes.png', fullPage: true });
  console.log(JSON.stringify({ errors, nodeCount, popupState }, null, 2));
  await browser.close();
})();
"
```

Expected: `errors: []`, `nodeCount: 18`, `popupState.open: true`, `popupState.title` contains "Basic Greetings" (confirms the reskinned node still resolves to the correct `N5_LESSONS` entry via the unchanged `data-lesson`/popup wiring). Read `furniture-nodes.png` and visually confirm 18 labeled wood-plank furniture pieces are spread across the library scene without overlapping each other or running outside `#mapFrame`.

- [ ] **Step 4: Commit**

```bash
cd "C:\Users\almaz\Downloads\Japanese Web Dev"
git add pages/N5/n5-dashboard.html assets/css/n5-dashboard.css
git commit -m "Re-theme the 18 lesson stops as library furniture"
```

---

### Task 4: Player cat integration (real walk-cycle replaces bounce)

**Files:**
- Modify: `pages/N5/n5-dashboard.html` (the `#playerCharacter` div, currently empty)
- Modify: `assets/css/n5-dashboard.css:438-478` approx. (the old `PLAYER CHARACTER` section — exact text given below)
- Modify: `assets/js/n5-map.js:47` (the `initialPosition()` function's `startGate` lookup)

**Interfaces:**
- Consumes: the `.cat` component from Task 2.
- Produces: `#playerCharacter` now carries `cat cat--orange` directly (no wrapper `<img>`), so `.walking` toggled by `n5-map.js`'s existing `setWalking()` (unchanged) now drives the leg-walk-cycle instead of the old bounce. Task 5's avatar picker later swaps which `cat--<color>` class is present.

- [ ] **Step 1: Give `#playerCharacter` the cat markup and classes**

In `pages/N5/n5-dashboard.html`, replace:

```html
    <div id="playerCharacter"></div>
```

with:

```html
    <div id="playerCharacter" class="cat cat--orange">

        <span class="cat__tail"></span>

        <span class="cat__ear cat__ear--l"></span>

        <span class="cat__ear cat__ear--r"></span>

        <span class="cat__head"></span>

        <span class="cat__body"></span>

        <span class="cat__stripe cat__stripe--1"></span>

        <span class="cat__stripe cat__stripe--2"></span>

        <span class="cat__patch cat__patch--a"></span>

        <span class="cat__patch cat__patch--b"></span>

        <span class="cat__leg cat__leg--fl"></span>

        <span class="cat__leg cat__leg--fr"></span>

        <span class="cat__leg cat__leg--bl"></span>

        <span class="cat__leg cat__leg--br"></span>

    </div>
```

(`cat--orange` here is only the pre-picker default — Task 5's picker overrides it on load if a different color was saved, or on first choice.)

- [ ] **Step 2: Replace the old PLAYER CHARACTER CSS**

In `assets/css/n5-dashboard.css`, find:

```css
/*======================================================
PLAYER CHARACTER
======================================================*/

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

#playerCharacter img{

    width:100%;

    image-rendering:pixelated;

    user-select:none;

    pointer-events:none;

}

#playerCharacter.walking{

    animation:playerBounce .45s infinite alternate;

}
```

Replace it with:

```css
/*======================================================
PLAYER CHARACTER
#playerCharacter IS a .cat instance (Task 4 puts both
classes on the same element) — its 40x40 size comes from
.cat itself (CAT COMPONENT section), so this rule only
adds positioning, not a conflicting width/height. Do not
add width/height here: overriding .cat's 40x40 without
also rescaling every internal .cat__* child's fixed px
coordinates would leave the shapes not filling the box.
======================================================*/

#playerCharacter{

    position:absolute;

    left:8%;

    bottom:8%;

    z-index:300;

}
```

Also delete the now-unused `@keyframes playerBounce` block further down the file (search for `@keyframes playerBounce`) — nothing references it anymore.

- [ ] **Step 3: Point `initialPosition()` at the new entrance anchor**

In `assets/js/n5-map.js`, line 47, change:

```javascript
        const startGate = document.getElementById("startGate");
```

to:

```javascript
        const startGate = document.getElementById("libraryEntrance");
```

(Only this one line changes — the variable name `startGate` is left as-is since renaming it is a pure style nit outside this task's scope, not worth a second unrelated diff hunk.)

- [ ] **Step 4: Verify movement + walk-cycle with Playwright**

```bash
cd "C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Downloads-Japanese-Web-Dev\1654f77f-f109-4d3a-951c-1152d31cb30b\scratchpad"
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1900, height: 1100 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8123/pages/N5/n5-dashboard.html', { waitUntil: 'load' });
  await page.waitForTimeout(200);

  const before = await page.evaluate(() => {
    const p = document.getElementById('playerCharacter');
    return { left: p.style.left, top: p.style.top, hasCat: p.classList.contains('cat') };
  });

  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(500);
  const midWalk = await page.evaluate(() => {
    const p = document.getElementById('playerCharacter');
    const leg = p.querySelector('.cat__leg--fl');
    return { walking: p.classList.contains('walking'), legAnimation: getComputedStyle(leg).animationName };
  });
  await page.keyboard.up('ArrowRight');

  await page.screenshot({ path: 'player-cat-walk.png' });
  console.log(JSON.stringify({ errors, before, midWalk }, null, 2));
  await browser.close();
})();
"
```

Expected: `errors: []`, `before.hasCat: true`, `midWalk.walking: true`, `midWalk.legAnimation: "catWalkA"` (confirms the leg's walk-cycle animation is actually applying while moving, not just the class toggle). Read `player-cat-walk.png` and visually confirm an orange cat shape (not a broken image, not the old bounce) sits in the library scene.

- [ ] **Step 5: Commit**

```bash
cd "C:\Users\almaz\Downloads\Japanese Web Dev"
git add pages/N5/n5-dashboard.html assets/css/n5-dashboard.css assets/js/n5-map.js
git commit -m "Replace player sprite image with the recolorable cat component"
```

---

### Task 5: Avatar persistence + first-visit picker

**Files:**
- Modify: `assets/js/n5-save.js`
- Create: `assets/js/n5-avatar-picker.js`
- Modify: `pages/N5/n5-dashboard.html` (add picker overlay markup + new `<script>` tag)
- Modify: `assets/css/n5-dashboard.css` (append `AVATAR PICKER` styles)

**Interfaces:**
- Produces: `window.N5Save.getAvatarColor(): string|null`, `window.N5Save.setAvatarColor(color: string): void` (added to the existing `window.N5Save` object). `n5-avatar-picker.js` has no exports — it self-initializes on `DOMContentLoaded` and applies a `cat--<color>` class directly to `#playerCharacter`.
- Consumes: the `.cat` component's `cat--<color>` classes (Task 2) and `#playerCharacter` (Task 4).

- [ ] **Step 1: Add avatar-color persistence to `n5-save.js`**

In `assets/js/n5-save.js`, add after the existing `N5_FAVORITES_KEY` line:

```javascript
const N5_AVATAR_COLOR_KEY = "jpLibraryOS.n5.avatarColor";
```

Add these two functions after `n5ToggleFavorite`:

```javascript
function n5GetAvatarColor(){

    try{

        return localStorage.getItem(N5_AVATAR_COLOR_KEY);

    } catch(e){

        return null;

    }

}

function n5SetAvatarColor(color){

    try{

        localStorage.setItem(N5_AVATAR_COLOR_KEY, color);

    } catch(e){

        // localStorage unavailable (privacy mode, quota, etc.) —
        // degrade to session-only, never throw.

    }

}
```

Update the `window.N5Save` export at the bottom to:

```javascript
window.N5Save = {

    getFavorites: n5GetFavorites,

    isFavorite: n5IsFavorite,

    toggleFavorite: n5ToggleFavorite,

    getAvatarColor: n5GetAvatarColor,

    setAvatarColor: n5SetAvatarColor,

};
```

- [ ] **Step 2: Verify with a Node smoke check**

```bash
cd "C:\Users\almaz\Downloads\Japanese Web Dev"
node -e "
global.localStorage = (() => { let s = {}; return { getItem: k => s[k] ?? null, setItem: (k,v) => { s[k]=v; } }; })();
global.window = {};
require('./assets/js/n5-save.js');
console.assert(window.N5Save.getAvatarColor() === null, 'starts unset');
window.N5Save.setAvatarColor('orange');
console.assert(window.N5Save.getAvatarColor() === 'orange', 'persists set color');
console.log('n5-save.js avatar-color: all assertions passed');
"
```

Expected output: `n5-save.js avatar-color: all assertions passed`

- [ ] **Step 3: Add the picker overlay markup**

In `pages/N5/n5-dashboard.html`, add this block immediately before the closing `</main>` tag (after the `#mapFrame` closing `</div>` — i.e. as a sibling of `<main id="journeyMap">`'s children, not nested inside `#mapFrame`, so it overlays the whole screen like `.lesson-popup` does):

```html
<!-- =========================================
     AVATAR PICKER (first-visit cat color choice)
========================================== -->

<div id="avatarPicker" class="avatar-picker">

    <div class="avatar-picker-window">

        <h2>Choose Your Cat</h2>

        <div class="avatar-swatches">

            <button class="avatar-swatch" data-color="orange">
                <div class="cat cat--orange">
                    <span class="cat__tail"></span>
                    <span class="cat__ear cat__ear--l"></span>
                    <span class="cat__ear cat__ear--r"></span>
                    <span class="cat__head"></span>
                    <span class="cat__body"></span>
                    <span class="cat__stripe cat__stripe--1"></span>
                    <span class="cat__stripe cat__stripe--2"></span>
                    <span class="cat__patch cat__patch--a"></span>
                    <span class="cat__patch cat__patch--b"></span>
                    <span class="cat__leg cat__leg--fl"></span>
                    <span class="cat__leg cat__leg--fr"></span>
                    <span class="cat__leg cat__leg--bl"></span>
                    <span class="cat__leg cat__leg--br"></span>
                </div>
                <span>Orange</span>
            </button>

            <button class="avatar-swatch" data-color="black">
                <div class="cat cat--black">
                    <span class="cat__tail"></span>
                    <span class="cat__ear cat__ear--l"></span>
                    <span class="cat__ear cat__ear--r"></span>
                    <span class="cat__head"></span>
                    <span class="cat__body"></span>
                    <span class="cat__stripe cat__stripe--1"></span>
                    <span class="cat__stripe cat__stripe--2"></span>
                    <span class="cat__patch cat__patch--a"></span>
                    <span class="cat__patch cat__patch--b"></span>
                    <span class="cat__leg cat__leg--fl"></span>
                    <span class="cat__leg cat__leg--fr"></span>
                    <span class="cat__leg cat__leg--bl"></span>
                    <span class="cat__leg cat__leg--br"></span>
                </div>
                <span>Black</span>
            </button>

            <button class="avatar-swatch" data-color="calico">
                <div class="cat cat--calico">
                    <span class="cat__tail"></span>
                    <span class="cat__ear cat__ear--l"></span>
                    <span class="cat__ear cat__ear--r"></span>
                    <span class="cat__head"></span>
                    <span class="cat__body"></span>
                    <span class="cat__stripe cat__stripe--1"></span>
                    <span class="cat__stripe cat__stripe--2"></span>
                    <span class="cat__patch cat__patch--a"></span>
                    <span class="cat__patch cat__patch--b"></span>
                    <span class="cat__leg cat__leg--fl"></span>
                    <span class="cat__leg cat__leg--fr"></span>
                    <span class="cat__leg cat__leg--bl"></span>
                    <span class="cat__leg cat__leg--br"></span>
                </div>
                <span>Calico</span>
            </button>

            <button class="avatar-swatch" data-color="gray">
                <div class="cat cat--gray">
                    <span class="cat__tail"></span>
                    <span class="cat__ear cat__ear--l"></span>
                    <span class="cat__ear cat__ear--r"></span>
                    <span class="cat__head"></span>
                    <span class="cat__body"></span>
                    <span class="cat__stripe cat__stripe--1"></span>
                    <span class="cat__stripe cat__stripe--2"></span>
                    <span class="cat__patch cat__patch--a"></span>
                    <span class="cat__patch cat__patch--b"></span>
                    <span class="cat__leg cat__leg--fl"></span>
                    <span class="cat__leg cat__leg--fr"></span>
                    <span class="cat__leg cat__leg--bl"></span>
                    <span class="cat__leg cat__leg--br"></span>
                </div>
                <span>Gray</span>
            </button>

            <button class="avatar-swatch" data-color="brown">
                <div class="cat cat--brown">
                    <span class="cat__tail"></span>
                    <span class="cat__ear cat__ear--l"></span>
                    <span class="cat__ear cat__ear--r"></span>
                    <span class="cat__head"></span>
                    <span class="cat__body"></span>
                    <span class="cat__stripe cat__stripe--1"></span>
                    <span class="cat__stripe cat__stripe--2"></span>
                    <span class="cat__patch cat__patch--a"></span>
                    <span class="cat__patch cat__patch--b"></span>
                    <span class="cat__leg cat__leg--fl"></span>
                    <span class="cat__leg cat__leg--fr"></span>
                    <span class="cat__leg cat__leg--bl"></span>
                    <span class="cat__leg cat__leg--br"></span>
                </div>
                <span>Brown</span>
            </button>

            <button class="avatar-swatch" data-color="white">
                <div class="cat cat--white">
                    <span class="cat__tail"></span>
                    <span class="cat__ear cat__ear--l"></span>
                    <span class="cat__ear cat__ear--r"></span>
                    <span class="cat__head"></span>
                    <span class="cat__body"></span>
                    <span class="cat__stripe cat__stripe--1"></span>
                    <span class="cat__stripe cat__stripe--2"></span>
                    <span class="cat__patch cat__patch--a"></span>
                    <span class="cat__patch cat__patch--b"></span>
                    <span class="cat__leg cat__leg--fl"></span>
                    <span class="cat__leg cat__leg--fr"></span>
                    <span class="cat__leg cat__leg--bl"></span>
                    <span class="cat__leg cat__leg--br"></span>
                </div>
                <span>White</span>
            </button>

        </div>

    </div>

</div>
```

Then find the existing `<script src="../../assets/js/n5-save.js"></script>` tag and add a new script tag immediately after it:

```html
<script src="../../assets/js/n5-avatar-picker.js"></script>
```

- [ ] **Step 4: Write `n5-avatar-picker.js`**

```javascript
//======================================================
// N5 AVATAR PICKER — first-visit cat color choice
//======================================================

document.addEventListener("DOMContentLoaded", () => {

    const picker   = document.getElementById("avatarPicker");
    const player   = document.getElementById("playerCharacter");
    const swatches = document.querySelectorAll(".avatar-swatch");

    if(!picker || !player || !window.N5Save) return;

    const CAT_COLORS = ["orange", "black", "calico", "gray", "brown", "white"];

    function applyColor(color){

        CAT_COLORS.forEach((c) => player.classList.remove("cat--" + c));
        player.classList.add("cat--" + color);

    }

    const savedColor = window.N5Save.getAvatarColor();

    if(savedColor){

        applyColor(savedColor);

    } else {

        picker.classList.add("show");

    }

    swatches.forEach((swatch) => {

        swatch.addEventListener("click", () => {

            const color = swatch.dataset.color;

            window.N5Save.setAvatarColor(color);
            applyColor(color);
            picker.classList.remove("show");

        });

    });

});
```

- [ ] **Step 5: Append avatar-picker CSS**

Append to `assets/css/n5-dashboard.css`:

```css
/*======================================================
AVATAR PICKER
======================================================*/

.avatar-picker{

    position:fixed;

    inset:0;

    display:none;

    justify-content:center;

    align-items:center;

    background:rgba(0,0,0,.55);

    z-index:10000;

}

.avatar-picker.show{

    display:flex;

}

.avatar-picker-window{

    background:#FFFDF6;

    border:4px solid #C7A35D;

    border-radius:20px;

    padding:30px;

    text-align:center;

}

.avatar-picker-window h2{

    font-family:var(--title-font);

    font-size:1rem;

    margin-bottom:20px;

}

.avatar-swatches{

    display:grid;

    grid-template-columns:repeat(3, 1fr);

    gap:20px;

}

.avatar-swatch{

    display:flex;

    flex-direction:column;

    align-items:center;

    gap:8px;

    padding:14px;

    border:none;

    border-radius:12px;

    background:#F7F9FD;

    cursor:pointer;

    transition:.2s;

}

.avatar-swatch:hover{

    background:#EAF3FF;

    transform:translateY(-3px);

}
```

- [ ] **Step 6: Verify picker flow + persistence with Playwright**

```bash
cd "C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Downloads-Japanese-Web-Dev\1654f77f-f109-4d3a-951c-1152d31cb30b\scratchpad"
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://localhost:8123/pages/N5/n5-dashboard.html', { waitUntil: 'load' });

  const firstVisit = await page.evaluate(() => ({
    pickerShown: document.getElementById('avatarPicker').classList.contains('show')
  }));

  await page.click('.avatar-swatch[data-color=\"black\"]');

  const afterPick = await page.evaluate(() => ({
    pickerShown: document.getElementById('avatarPicker').classList.contains('show'),
    playerHasBlack: document.getElementById('playerCharacter').classList.contains('cat--black'),
    savedColor: window.N5Save.getAvatarColor()
  }));

  await page.reload({ waitUntil: 'load' });

  const afterReload = await page.evaluate(() => ({
    pickerShown: document.getElementById('avatarPicker').classList.contains('show'),
    playerHasBlack: document.getElementById('playerCharacter').classList.contains('cat--black')
  }));

  console.log(JSON.stringify({ firstVisit, afterPick, afterReload }, null, 2));
  await browser.close();
})();
"
```

Expected: `firstVisit.pickerShown: true`; `afterPick.pickerShown: false`, `afterPick.playerHasBlack: true`, `afterPick.savedColor: "black"`; `afterReload.pickerShown: false`, `afterReload.playerHasBlack: true` (confirms the picker only shows once and the choice survives a real reload).

- [ ] **Step 7: Commit**

```bash
cd "C:\Users\almaz\Downloads\Japanese Web Dev"
git add assets/js/n5-save.js assets/js/n5-avatar-picker.js pages/N5/n5-dashboard.html assets/css/n5-dashboard.css
git commit -m "Add first-visit cat avatar picker with localStorage persistence"
```

---

### Task 6: Ambient NPC cats

**Files:**
- Modify: `pages/N5/n5-dashboard.html` (add 3 NPC cat elements)
- Modify: `assets/js/n5-map.js` (append the NPC wander engine)

**Interfaces:**
- Consumes: the `.cat` component (Task 2), `window.N5Save.getAvatarColor()` (Task 5, to avoid color collisions with the player).
- Produces: nothing consumed elsewhere — decorative only, per Global Constraints (no click handler, no popup, no proximity detection).

- [ ] **Step 1: Add 3 NPC cat elements**

In `pages/N5/n5-dashboard.html`, add this block immediately after `#playerCharacter`'s closing `</div>` (still inside `#mapFrame`, as a sibling of `#playerCharacter` and `#lessonMap`):

```html
    <!-- =====================================
         AMBIENT NPC CATS (decorative, no interaction)
         Colors are reassigned at runtime by n5-map.js
         to avoid matching the player's chosen color —
         the classes below are just non-empty placeholders.
    ====================================== -->

    <div class="cat npc-cat cat--black">

        <span class="cat__tail"></span>

        <span class="cat__ear cat__ear--l"></span>

        <span class="cat__ear cat__ear--r"></span>

        <span class="cat__head"></span>

        <span class="cat__body"></span>

        <span class="cat__stripe cat__stripe--1"></span>

        <span class="cat__stripe cat__stripe--2"></span>

        <span class="cat__patch cat__patch--a"></span>

        <span class="cat__patch cat__patch--b"></span>

        <span class="cat__leg cat__leg--fl"></span>

        <span class="cat__leg cat__leg--fr"></span>

        <span class="cat__leg cat__leg--bl"></span>

        <span class="cat__leg cat__leg--br"></span>

    </div>

    <div class="cat npc-cat cat--gray">

        <span class="cat__tail"></span>

        <span class="cat__ear cat__ear--l"></span>

        <span class="cat__ear cat__ear--r"></span>

        <span class="cat__head"></span>

        <span class="cat__body"></span>

        <span class="cat__stripe cat__stripe--1"></span>

        <span class="cat__stripe cat__stripe--2"></span>

        <span class="cat__patch cat__patch--a"></span>

        <span class="cat__patch cat__patch--b"></span>

        <span class="cat__leg cat__leg--fl"></span>

        <span class="cat__leg cat__leg--fr"></span>

        <span class="cat__leg cat__leg--bl"></span>

        <span class="cat__leg cat__leg--br"></span>

    </div>

    <div class="cat npc-cat cat--calico">

        <span class="cat__tail"></span>

        <span class="cat__ear cat__ear--l"></span>

        <span class="cat__ear cat__ear--r"></span>

        <span class="cat__head"></span>

        <span class="cat__body"></span>

        <span class="cat__stripe cat__stripe--1"></span>

        <span class="cat__stripe cat__stripe--2"></span>

        <span class="cat__patch cat__patch--a"></span>

        <span class="cat__patch cat__patch--b"></span>

        <span class="cat__leg cat__leg--fl"></span>

        <span class="cat__leg cat__leg--fr"></span>

        <span class="cat__leg cat__leg--bl"></span>

        <span class="cat__leg cat__leg--br"></span>

    </div>
```

Also append this CSS so NPCs are positioned absolutely (same footprint treatment as `#playerCharacter`) but sized/z-indexed independently:

```css
/*======================================================
NPC CAT
Each .npc-cat element is also a .cat instance, so — same
reasoning as #playerCharacter above — this rule only adds
positioning/z-index, not a conflicting width/height.
======================================================*/

.npc-cat{

    position:absolute;

    left:0;

    top:0;

    z-index:280;

}
```

- [ ] **Step 2: Append the NPC wander engine to `n5-map.js`**

Append this to the end of `assets/js/n5-map.js` (after the existing player `document.addEventListener("DOMContentLoaded", ...)` block closes):

```javascript
//======================================================
// AMBIENT NPC CATS — autonomous wander, decorative only
//======================================================

const NPC_PALETTE = ["orange", "black", "calico", "gray", "brown", "white"];

document.addEventListener("DOMContentLoaded", () => {

    const map     = document.getElementById("mapFrame");
    const npcCats = Array.from(document.querySelectorAll(".npc-cat"));

    if(!map || npcCats.length === 0) return;

    const playerColor = (window.N5Save && window.N5Save.getAvatarColor())
        || "orange";

    const npcColors = NPC_PALETTE
        .filter((color) => color !== playerColor)
        .slice(0, npcCats.length);

    npcCats.forEach((cat, index) => {

        NPC_PALETTE.forEach((c) => cat.classList.remove("cat--" + c));
        cat.classList.add("cat--" + (npcColors[index] || NPC_PALETTE[index]));

    });

    const NPC_SPEED = 70; // px per second — slower than the player's 220

    function randomTarget(mapRect, cat){

        return {
            x: Math.random() * Math.max(mapRect.width - cat.offsetWidth, 0),
            y: Math.random() * Math.max(mapRect.height - cat.offsetHeight, 0),
        };

    }

    function startWander(cat){

        let x = 0;
        let y = 0;
        let target = null;
        let pauseUntil = 0;
        let lastFrameTime = null;

        cat.style.left = x + "px";
        cat.style.top = y + "px";

        function step(timestamp){

            requestAnimationFrame(step);

            if(lastFrameTime === null){

                lastFrameTime = timestamp;
                return;

            }

            const deltaSeconds = (timestamp - lastFrameTime) / 1000;
            lastFrameTime = timestamp;

            const mapRect = map.getBoundingClientRect();

            if(timestamp < pauseUntil){

                cat.classList.remove("walking");
                return;

            }

            if(!target){

                target = randomTarget(mapRect, cat);

            }

            const dx = target.x - x;
            const dy = target.y - y;
            const distance = Math.hypot(dx, dy);

            if(distance < 4){

                target = null;
                pauseUntil = timestamp + 1500 + Math.random() * 1500;
                cat.classList.remove("walking");
                return;

            }

            x += (dx / distance) * NPC_SPEED * deltaSeconds;
            y += (dy / distance) * NPC_SPEED * deltaSeconds;

            cat.style.left = x + "px";
            cat.style.top = y + "px";
            cat.classList.add("walking");

        }

        requestAnimationFrame(step);

    }

    npcCats.forEach(startWander);

});
```

- [ ] **Step 3: Verify autonomous movement + no color collision with Playwright**

```bash
cd "C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Downloads-Japanese-Web-Dev\1654f77f-f109-4d3a-951c-1152d31cb30b\scratchpad"
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1900, height: 1100 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8123/pages/N5/n5-dashboard.html', { waitUntil: 'load' });
  await page.click('.avatar-swatch[data-color=\"orange\"]');
  await page.waitForTimeout(300);

  const info1 = await page.evaluate(() => {
    const npcs = Array.from(document.querySelectorAll('.npc-cat'));
    return {
      count: npcs.length,
      colors: npcs.map(n => Array.from(n.classList).find(c => c.startsWith('cat--'))),
      positions: npcs.map(n => ({ left: n.style.left, top: n.style.top }))
    };
  });

  await page.waitForTimeout(1000);

  const info2 = await page.evaluate(() => {
    const npcs = Array.from(document.querySelectorAll('.npc-cat'));
    return { positions: npcs.map(n => ({ left: n.style.left, top: n.style.top })) };
  });

  await page.screenshot({ path: 'npc-cats.png' });
  console.log(JSON.stringify({ errors, info1, info2 }, null, 2));
  await browser.close();
})();
"
```

Expected: `errors: []`; `info1.count: 3`; `info1.colors` contains 3 distinct entries, none equal to `"cat--orange"` (the just-picked player color); comparing `info1.positions` to `info2.positions`, at least one NPC's `left`/`top` differs between the two reads (proves autonomous movement over that 1-second gap, not a static placement).

- [ ] **Step 4: Commit**

```bash
cd "C:\Users\almaz\Downloads\Japanese Web Dev"
git add pages/N5/n5-dashboard.html assets/css/n5-dashboard.css assets/js/n5-map.js
git commit -m "Add 3 ambient wandering NPC cats to the library map"
```

---

### Task 7: End-to-end verification pass

**Files:**
- No source changes — verification only.

**Interfaces:**
- Consumes: everything from Tasks 1-6.

- [ ] **Step 1: Full walkthrough + aspect-ratio-drift re-check**

```bash
cd "C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Downloads-Japanese-Web-Dev\1654f77f-f109-4d3a-951c-1152d31cb30b\scratchpad"
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const results = [];
  for (const vp of [{w:1920,h:1080},{w:1366,h:768},{w:1280,h:1024}]) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://localhost:8123/pages/N5/n5-dashboard.html', { waitUntil: 'load' });

    const node1 = await page.evaluate(() => {
      const frame = document.getElementById('mapFrame').getBoundingClientRect();
      const node = document.querySelector('.lesson-node.lesson-1').getBoundingClientRect();
      return {
        aspect: (frame.width / frame.height).toFixed(4),
        leftPct: ((node.x + node.width/2 - frame.x) / frame.width * 100).toFixed(1),
        bottomPct: ((frame.y + frame.height - (node.y + node.height/2)) / frame.height * 100).toFixed(1)
      };
    });

    results.push({ vp, errors, node1 });
    await page.close();
  }
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
"
```

Expected: `aspect` reads `1.6000` at every viewport size; `leftPct`/`bottomPct` for `.lesson-1` stay within a fraction of a percent of each other across all three sizes (confirms the library frame doesn't reintroduce the drift bug the old journey map had).

- [ ] **Step 2: Screenshot the full experience for visual confirmation**

```bash
cd "C:\Users\almaz\AppData\Local\Temp\claude\C--Users-almaz-Downloads-Japanese-Web-Dev\1654f77f-f109-4d3a-951c-1152d31cb30b\scratchpad"
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1900, height: 1100 } });
  await page.goto('http://localhost:8123/pages/N5/n5-dashboard.html', { waitUntil: 'load' });
  await page.click('.avatar-swatch[data-color=\"calico\"]');
  await page.waitForTimeout(500);
  await page.click('.lesson-node.lesson-1');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'library-full-walkthrough.png' });
  await browser.close();
})();
"
```

Read `library-full-walkthrough.png`. Confirm: the library scene, 18 furniture nodes, a calico player cat, 3 differently-colored ambient NPC cats, and the open lesson popup are all visible together with no rendering errors.

- [ ] **Step 3: No commit needed**

This task only verifies prior work; there are no file changes to commit.
