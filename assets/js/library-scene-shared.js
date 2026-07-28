// Shared engine for every LibraryScene-style floor (N5, N4, ...).
// Loaded as a plain global (no bundler in this project) — each floor's
// own scene file must load this script first, then do
// Object.assign(FloorScene.prototype, LibrarySceneEngine) once, after
// its class declaration.
//
// Consumes these scene instance properties, set by each floor's own
// create()/buildScene() before any engine method runs:
//   this.worldW           - that floor's WORLD_W
//   this.finalGateId      - id of that floor's end-of-floor gate entry
//                           (was the hardcoded 'final-quiz' string)
//   this.printerStationId - id of that floor's printer-station entry,
//                           or null if it has none (was the hardcoded
//                           'printer-station' string)
//   this.printLinksByShelf, this.allPrintLinks - that floor's own
//                           PRINT_LINKS_BY_SHELF / ALL_PRINT_LINKS maps
//                           (empty objects if the floor has no PDFs yet)
//   this.lessonContent    - that floor's LESSON_CONTENT object
//   this.quizGateKey      - that floor's own quiz-gate localStorage key
//   this.catColors, this.talkColorPaths, this.senseiPortraitPaths -
//                           that floor's CAT_COLORS/TALK_COLOR_PATHS/
//                           SENSEI_PORTRAIT_PATHS objects
//   this.extraRetroMenuOptions - optional (entry) => options[], or
//                           undefined
//   this.finalGateProceedLabel, this.onFinalGatePass - button label +
//                           callback for the completed end-of-floor gate

const TRIGGER_RANGE = 80; // px — click-in-range / E-to-interact radius, copied verbatim from n5-phaser-game.js:7245
const QUIZ_MAX_ATTEMPTS = 3;
const QUIZ_LOCKOUT_MS = 24 * 60 * 60 * 1000;

function cropToTexture(scene, sourceKey, rect, destKey) {
  const srcImage = scene.textures.get(sourceKey).getSourceImage();
  const canvasTexture = scene.textures.createCanvas(destKey, rect.w, rect.h);
  const ctx = canvasTexture.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(srcImage, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
  canvasTexture.refresh();
  return destKey;
}

// Hand-drawn "real wall" header: individual hand-cut planks (randomized
// per-plank shade + grain streaks + occasional knots) instead of a single
// flat tiled strip, a weathered stain streak across the lower wainscoting
// band, a 3-step carved molding cap/base trim, and pillars with a flared
// capital/base, a center grain line, and 2 riveted iron straps. Verbatim
// from n5-phaser-game.js:7435-7546 — no N5-specific data referenced
// anywhere in its body (only its own local vars + the scene/w/h params).
// Keyed by size (not a single cached key) — the shorter wall segment
// above shelves 1/2/5/6 needs its own smaller texture alongside the main
// 110px-tall header, and Phaser throws on re-registering a canvas key.
function drawWallHeaderTexture(scene, w, h) {
  const key = `wallHeaderPanelTex_${w}x${h}`;
  if (scene.textures.exists(key)) return key;

  let seed = 42;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const shade = ([r, g, b], amt) =>
    `rgb(${Math.max(0, Math.min(255, r + amt))},${Math.max(0, Math.min(255, g + amt))},${Math.max(0, Math.min(255, b + amt))})`;

  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;

  const moldH = Math.max(3, Math.round((h * 6) / 58));
  const baseH = Math.max(3, Math.round((h * 6) / 58));
  const pillarW = Math.max(6, Math.round((w * 10) / 220));
  const panelCount = 3;
  const totalPillarW = pillarW * (panelCount - 1);
  const panelW = (w - totalPillarW) / panelCount;
  const plankW = Math.max(3, Math.round((w * 5) / 220));
  const plankBandH = Math.max(6, Math.round(((h - moldH - baseH) * 24) / 46));

  const plankTopBase = [192, 107, 30];
  const panelBottomBase = [90, 47, 38];

  // 3-step carved molding cap.
  ctx.fillStyle = '#241209'; ctx.fillRect(0, 0, w, moldH);
  ctx.fillStyle = '#4a2a1c'; ctx.fillRect(0, 1, w, Math.max(1, moldH - 2));
  ctx.fillStyle = '#6a4128'; ctx.fillRect(0, 1, w, 1);

  let x = 0;
  for (let p = 0; p < panelCount; p++) {
    // Individual planks — each a slightly different hand-cut shade, with
    // a vertical grain streak and occasional knot.
    for (let px = 0; px < panelW; px += plankW) {
      const thisPlankW = Math.min(plankW, panelW - px);
      const variance = Math.floor(rand() * 20) - 10;
      ctx.fillStyle = shade(plankTopBase, variance);
      ctx.fillRect(x + px, moldH, thisPlankW, plankBandH);
      ctx.fillStyle = shade(plankTopBase, variance - 30);
      ctx.fillRect(x + px, moldH, 1, plankBandH);
      if (rand() > 0.4) {
        ctx.fillStyle = shade(plankTopBase, variance - 18);
        ctx.fillRect(x + px + Math.floor(thisPlankW / 2), moldH + Math.round(plankBandH * 0.12), 1, Math.round(plankBandH * 0.65));
      }
      if (rand() > 0.75) {
        ctx.fillStyle = shade(plankTopBase, -35);
        ctx.fillRect(x + px + 1, moldH + Math.round(plankBandH * 0.4) + Math.floor(rand() * Math.round(plankBandH * 0.25)), 2, 2);
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, moldH + plankBandH, panelW, 1);

    // Lower panel (paneled wainscoting) with grain + a weathering streak.
    const panelBandY = moldH + plankBandH + 1;
    const panelBandH = h - baseH - panelBandY;
    for (let px = 0; px < panelW; px += plankW) {
      const thisPlankW = Math.min(plankW, panelW - px);
      const variance = Math.floor(rand() * 16) - 8;
      ctx.fillStyle = shade(panelBottomBase, variance);
      ctx.fillRect(x + px, panelBandY, thisPlankW, panelBandH);
      ctx.fillStyle = shade(panelBottomBase, variance - 25);
      ctx.fillRect(x + px, panelBandY, 1, panelBandH);
    }
    ctx.fillStyle = shade(panelBottomBase, -30);
    ctx.fillRect(x, panelBandY, panelW, 1);
    ctx.fillRect(x, h - baseH - 1, panelW, 1);
    ctx.fillStyle = 'rgba(20,10,6,0.25)';
    ctx.fillRect(x + Math.floor(panelW * 0.3), panelBandY + 2, Math.max(2, Math.floor(panelW * 0.15)), Math.max(1, panelBandH - 4));

    x += panelW;
    if (p < panelCount - 1) {
      // Pillar: flared capital + base, grain, 2 riveted metal straps.
      const capFlare = 2;
      ctx.fillStyle = '#241209';
      ctx.fillRect(x - capFlare, moldH - 1, pillarW + capFlare * 2, 5);
      ctx.fillRect(x, moldH + 4, pillarW, h - moldH - baseH - 8);
      ctx.fillRect(x - capFlare, h - baseH - 4, pillarW + capFlare * 2, 5);

      ctx.fillStyle = '#5a3220';
      ctx.fillRect(x + 1, moldH + 4, pillarW - 2, h - moldH - baseH - 8);
      ctx.fillStyle = '#6f4126';
      ctx.fillRect(x + 1, moldH + 4, 1, h - moldH - baseH - 8);
      ctx.fillStyle = '#3a2013';
      ctx.fillRect(x + pillarW - 2, moldH + 4, 1, h - moldH - baseH - 8);

      ctx.fillStyle = '#4a2a1a';
      ctx.fillRect(x + Math.floor(pillarW / 2), moldH + 6, 1, h - moldH - baseH - 12);

      ctx.fillStyle = '#3a3a38';
      ctx.fillRect(x, moldH + 12, pillarW, 2);
      ctx.fillRect(x, h - baseH - 16, pillarW, 2);
      ctx.fillStyle = '#5a5a56';
      ctx.fillRect(x, moldH + 12, pillarW, 1);
      ctx.fillRect(x, h - baseH - 16, pillarW, 1);
      ctx.fillStyle = '#1c1c1a';
      ctx.fillRect(x + 1, moldH + 12, 1, 2);
      ctx.fillRect(x + pillarW - 2, moldH + 12, 1, 2);

      x += pillarW;
    }
  }

  // 3-step carved base trim.
  ctx.fillStyle = '#241209'; ctx.fillRect(0, h - baseH, w, baseH);
  ctx.fillStyle = '#4a2a1c'; ctx.fillRect(0, h - baseH + 1, w, Math.max(1, baseH - 2));

  tex.refresh();
  return key;
}

// Verbatim from n5-phaser-game.js:7555-7601 (drawWovenRug), with ONE
// addition: an optional `palette` param so N4 can recolor it to the
// approved mockup's wine/gold accent without forking the function.
// Calling it with no 4th arg reproduces N5's exact existing colors —
// this is an additive, non-breaking change to the function's signature.
function drawWovenRug(scene, key, w, h, palette) {
  const p = palette || {};
  const rugDark = p.rugDark ?? 0x3a1816;
  const rugFringeLight = p.rugFringeLight ?? 0x4a231f;
  const rugBase = p.rugBase ?? 0x7a3230;
  const rugWeave = p.rugWeave ?? 0x6b2b28;
  const rugMotif = p.rugMotif ?? 0xc9a66b;
  const rugMotifShade = p.rugMotifShade ?? 0xa87f4a;
  const borderW = 6;
  const hex = (n) => '#' + n.toString(16).padStart(6, '0');

  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = hex(rugBase);
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = hex(rugWeave);
  for (let y = 1; y < h; y += 3) ctx.fillRect(borderW, y, w - borderW * 2, 1);
  ctx.fillStyle = hex(rugDark);
  ctx.fillRect(0, 0, borderW, h);
  ctx.fillRect(w - borderW, 0, borderW, h);
  ctx.fillStyle = hex(rugFringeLight);
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, borderW - 2, 2);
    ctx.fillRect(w - borderW + 2, y, borderW - 2, 2);
  }

  const dcx = w / 2;
  const dcy = h / 2;
  const dw = Math.min(18, w - borderW * 2 - 6);
  const dh = Math.min(12, h - 6);
  const drawDiamond = (fill, pad) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(dcx, dcy - dh / 2 - pad);
    ctx.lineTo(dcx + dw / 2 + pad, dcy);
    ctx.lineTo(dcx, dcy + dh / 2 + pad);
    ctx.lineTo(dcx - dw / 2 - pad, dcy);
    ctx.closePath();
    ctx.fill();
  };
  drawDiamond(hex(rugMotifShade), 1);
  drawDiamond(hex(rugMotif), 0);

  tex.refresh();
  return key;
}

// Procedural brick-wall texture, replacing a small tiled image crop.
// Bigger, hand-drawn blocks with mortar lines and per-brick shading
// read as "real brickwork" instead of a tight repeating pattern.
// config: { blockW, blockH, mortarColor, brickColors } — blockW/blockH
// default to 32x32 (2x the previous 16x16 crop); brickColors is an
// array cycled per-brick for subtle variation.
function createBrickWallTexture(scene, key, config) {
  const cfg = config || {};
  const blockW = cfg.blockW || 32;
  const blockH = cfg.blockH || 32;
  const mortar = cfg.mortarColor || '#1c120b';
  const brickColors = cfg.brickColors || ['#4c2b1b', '#442619', '#3e2216'];
  const rowH = blockH / 2; // two brick courses per texture tile, offset like real brickwork
  const tex = scene.textures.createCanvas(key, blockW, blockH);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = mortar;
  ctx.fillRect(0, 0, blockW, blockH);
  let brickIndex = 0;
  for (let row = 0; row < 2; row++) {
    const y = row * rowH;
    const offset = row % 2 ? -blockW / 4 : 0;
    for (let x = offset; x < blockW; x += blockW / 2) {
      ctx.fillStyle = brickColors[brickIndex % brickColors.length];
      brickIndex += 1;
      ctx.fillRect(x + 1, y + 1, blockW / 2 - 2, rowH - 2);
      // Top highlight + bottom shadow per brick, same technique as
      // drawHardwoodFloorTexture's plank shading.
      ctx.fillStyle = 'rgba(235, 178, 98, .08)';
      ctx.fillRect(x + 2, y + 1, blockW / 2 - 4, 1);
      ctx.fillStyle = 'rgba(10, 5, 2, .45)';
      ctx.fillRect(x + 1, y + rowH - 2, blockW / 2 - 2, 1);
    }
  }
  tex.refresh();
  return key;
}

// Draws an illustrated "lower floor" void into a mezzanine's open
// atrium rect, instead of a flat color fill — a darker/desaturated
// floor-tile pattern, rows of silhouette shelf blocks arranged in the
// same two-column-per-side pattern the mezzanine's own shelf wings use
// (so it reads as "the actual floor below", not generic clutter), a
// dim corridor-color hint down the middle, and a soft vertical depth
// gradient, all drawn on the caller's own Graphics object so it
// composites under whatever rail/frame trim the caller draws next.
// Pure procedural drawing (no new image assets) — reusable by any
// future floor with a similar mezzanine-over-void layout.
// config: { left, top, width, height, corridorColor } (corridorColor optional,
// defaults to a neutral warm brown — pass the floor's own rug/accent color
// so the hint reads as "the same corridor, one level down")
function buildOpenAtriumVoid(scene, g, config) {
  const { left, top, width, height } = config;
  const corridorColor = config.corridorColor !== undefined ? config.corridorColor : 0x5c1a2e;

  // Desaturated "first floor" tile pattern — small dark tiles, cooler
  // and flatter than the mezzanine's own warm wood tones, reading as
  // a different, more distant surface.
  const tileW = 34;
  const tileH = 22;
  for (let ty = top + 20; ty < top + height - 20; ty += tileH) {
    for (let tx = left + 20; tx < left + width - 20; tx += tileW) {
      const shade = ((tx / tileW + ty / tileH) % 2) ? 0x1c1410 : 0x211714;
      g.fillStyle(shade, 1).fillRect(tx, ty, tileW - 1, tileH - 1);
    }
  }

  // Corridor hint — a dim vertical strip down the middle, the same
  // color family as the floor's own rug, implying the same corridor
  // continues straight down to the level below.
  g.fillStyle(corridorColor, 0.22).fillRect(left + width / 2 - 10, top + 8, 20, height - 16);

  // Rows of silhouette shelf blocks, two per side (mirroring the
  // mezzanine's own 2-column shelf wings above), receding in shade
  // toward the far end of the void so the row nearest each rail edge
  // reads as "closer" — simple dark rectangles, not full sprites, so
  // they don't compete with the mezzanine's own shelf sprites.
  const rowCount = 6;
  const rowGap = (height - 40) / (rowCount - 1);
  for (let i = 0; i < rowCount; i++) {
    const ry = top + 20 + rowGap * i;
    const distFromMid = Math.abs(i / (rowCount - 1) - 0.5) * 2; // 0 at center, 1 at edges (closer to a rail)
    const shadeAlpha = 0.55 + distFromMid * 0.3;
    const colX = [
      left + width * 0.14, left + width * 0.30,
      left + width * 0.62, left + width * 0.78,
    ];
    colX.forEach((cx) => {
      g.fillStyle(0x0e0906, shadeAlpha).fillRect(cx, ry, 28, 14);
      g.fillStyle(0x3a2415, shadeAlpha * 0.5).fillRect(cx, ry, 28, 2);
    });
  }

  // Depth gradient — brighter near the rail edges (top/bottom of the
  // void, closest to the viewer on each balcony), darker toward the
  // center, implying the floor recedes downward/away.
  const bands = 10;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const distFromMid = Math.abs(t - 0.5) * 2; // 1 at edges, 0 at center
    const alpha = 0.16 * (1 - distFromMid);
    if (alpha <= 0.01) continue;
    const bandTop = top + (height / bands) * i;
    g.fillStyle(0x000000, alpha).fillRect(left, bandTop, width, height / bands + 1);
  }
}

// Builds a full-perimeter guard rail around a mezzanine's open atrium —
// heavy gold-capped wood posts + a double rail line, reusing the exact
// wood/gold palette the atrium's own frame trim already uses — AND a
// single invisible collision rectangle covering the whole atrium
// footprint, added to the caller's wallGroup, so the player genuinely
// cannot walk into the void (the previous version had no collision at
// all here). Reusable by any future mezzanine floor with the same
// layout — pass that floor's own wallGroup.
// config: { left, top, width, height, wallGroup, postGap? }
function buildAtriumFence(scene, config) {
  const { left, top, width, height, wallGroup } = config;
  const postGap = config.postGap || 84;
  const g = scene.add.graphics().setDepth(3);
  const wood = 0x4a2d1d;
  const gold = 0xc9a66b;
  const cap = 0xe8d4a8;
  const postW = 7;

  const drawPost = (cx, cy, horizontal) => {
    const w = horizontal ? postW : 10;
    const h = horizontal ? 10 : postW;
    g.fillStyle(wood, 1).fillRect(cx - w / 2, cy - h / 2, w, h);
    g.fillStyle(gold, 1);
    if (horizontal) g.fillRect(cx - w / 2 - 1, cy - h / 2 - 2, w + 2, 3);
    else g.fillRect(cx - w / 2 - 2, cy - h / 2 - 1, 3, h + 2);
    g.fillStyle(cap, 1).fillRect(cx - 1, cy - h / 2 - (horizontal ? 3 : 0) - 1, 2, 2);
  };

  // Double rail line (gold core, dark wood outline) around the whole
  // perimeter, matching the atrium's existing outer-frame gold trim.
  g.lineStyle(5, wood, 1).strokeRect(left, top, width, height);
  g.lineStyle(2, gold, 0.9).strokeRect(left, top, width, height);

  // Posts along the top/bottom edges (horizontal runs)...
  for (let x = left; x <= left + width; x += postGap) {
    drawPost(x, top, true);
    drawPost(x, top + height, true);
  }
  // ...and the left/right edges (vertical runs) — corners get a post
  // from both loops, which is fine (a post at a corner reads correctly
  // either way).
  for (let y = top; y <= top + height; y += postGap) {
    drawPost(left, y, false);
    drawPost(left + width, y, false);
  }

  // One solid rectangle covering the whole atrium footprint — simpler
  // and more robust than trying to collide against the visual rail
  // exactly, and guarantees no gap the player could slip through.
  const block = scene.add.rectangle(left + width / 2, top + height / 2, width, height, 0x000000, 0);
  scene.physics.add.existing(block, true);
  wallGroup.add(block);

  return g;
}

// Pure DOM helpers (no scene/floor state, no Phaser dependency) — were
// module-level functions in n5-phaser-game.js, move unchanged. Safe as
// a page-wide singleton toast element since N5 and N4 are separate
// page loads that never coexist in the same document.
function ensureToast() {
  let toast = document.getElementById('nekoToast');
  if (toast) return toast;
  toast = document.createElement('div');
  toast.id = 'nekoToast';
  toast.style.cssText = 'position:fixed;top:110px;left:50%;transform:translateX(-50%);'
    + 'background:#5A4A3A;color:#FFFDF6;padding:10px 18px;border-radius:4px;'
    + 'font-family:Nunito,sans-serif;font-size:.85rem;z-index:20001;'
    + 'opacity:0;transition:opacity .25s;pointer-events:none;';
  document.body.appendChild(toast);
  return toast;
}
function showToast(text) {
  const toast = ensureToast();
  toast.textContent = text;
  toast.style.opacity = '1';
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.style.opacity = '0'; }, 1400);
}

// Pure helper (no scene/floor state) — was a module-level function in
// n5-phaser-game.js, moves unchanged.
function getState(id, prereq, progress) {
  if (progress[id]) return 'completed';
  if (prereq === null || prereq === undefined || progress[prereq]) return 'available';
  return 'locked';
}

// Renders a decorative prop (non-interactive by default, optionally clickable).
// config: { x, y, textureKey, scale?, onClick?, depth? }
// Returns the created Phaser.GameObjects.Image. Deliberately NOT pushed into
// scene.interactives — decor props don't participate in the progress/lock system,
// so they need no requires/glow/stamp fields. Scale/onClick/depth are optional.
function createDecorativeProp(scene, config) {
  const { x, y, textureKey } = config;
  const scale = config.scale !== undefined ? config.scale : 1;
  const depth = config.depth !== undefined ? config.depth : 1;
  const sprite = scene.add.image(x, y, textureKey).setOrigin(0.5).setScale(scale).setDepth(depth);
  if (config.onClick) {
    sprite.setInteractive({ useHandCursor: true });
    sprite.on('pointerdown', config.onClick);
  }
  return sprite;
}

// Quiz-gate (staircase/exam-gate attempt/cooldown) persistence —
// generalized to take the floor's own localStorage key instead of N5's
// hardcoded QUIZ_GATE_KEY, so N4's exam gate can reuse this unchanged
// with its own key instead of a duplicated copy.
function loadQuizGateState(quizGateKey) {
  try {
    const raw = localStorage.getItem(quizGateKey);
    if (!raw) return { attemptsUsed: 0, lockedUntil: null };
    const parsed = JSON.parse(raw);
    return {
      attemptsUsed: typeof parsed.attemptsUsed === 'number' ? parsed.attemptsUsed : 0,
      lockedUntil: typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : null,
    };
  } catch (e) {
    return { attemptsUsed: 0, lockedUntil: null };
  }
}
function saveQuizGateState(quizGateKey, state) {
  try {
    localStorage.setItem(quizGateKey, JSON.stringify(state));
  } catch (e) {
    // localStorage unavailable — degrade to session-only, same pattern as saveProgress().
  }
}
function formatLockMessage(msRemaining) {
  const totalMinutes = Math.max(1, Math.ceil(msRemaining / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `Locked - try again in ${hours}h ${minutes}m`;
}
function getQuizGateStatus(quizGateKey) {
  const state = loadQuizGateState(quizGateKey);
  if (state.lockedUntil !== null && Date.now() >= state.lockedUntil) {
    state.attemptsUsed = 0;
    state.lockedUntil = null;
    saveQuizGateState(quizGateKey, state);
  }
  const locked = state.lockedUntil !== null && Date.now() < state.lockedUntil;
  return {
    state,
    locked,
    attemptsLeft: Math.max(0, QUIZ_MAX_ATTEMPTS - state.attemptsUsed),
    lockMessage: locked ? formatLockMessage(state.lockedUntil - Date.now()) : null,
  };
}

const LibrarySceneEngine = {
  wireInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
    this.interactKey = this.input.keyboard.addKey('E');
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const tryInteract = () => {
      if (this.retroMenu) { this.selectRetroMenuOption(); return; }
      if (this.panelOpen) return;
      const near = this.nearestInRange();
      if (near) this.openInteraction(near);
    };
    this.interactKey.on('down', tryInteract);
    this.enterKey.on('down', tryInteract);
    this.spaceKey.on('down', tryInteract);
  },
  handleInteractiveClick(entry) {
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.x, entry.y);
    if (dist <= (entry.triggerRange || TRIGGER_RANGE)) {
      this.openInteraction(entry);
      return;
    }
    const corridorX = this.worldW / 2; // was WORLD_W / 2
    this.moveQueue = [
      { x: corridorX, y: this.player.y },
      { x: corridorX, y: entry.y },
      { x: entry.x, y: entry.y },
    ];
    this.pendingInteract = entry;
  },
  nearestInRange() {
    let closest = null;
    let closestDist = Infinity;
    this.interactives.forEach((entry) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.x, entry.y);
      if (dist <= (entry.triggerRange || TRIGGER_RANGE) && dist < closestDist) {
        closest = entry;
        closestDist = dist;
      }
    });
    return closest;
  },
  openInteraction(entry) {
    if (entry.kind === 'npc') { this.startLesson(entry); return; }
    const state = entry.kind === 'shelf'
      ? getState(entry.id, entry.prereq, this.progress)
      : (this.progress[entry.id] ? 'completed'
        : (entry.requires.every((r) => this.progress[r]) ? 'available' : 'locked'));
    if (state === 'locked') { showToast('Not yet…'); return; }
    if (entry.id === this.finalGateId || entry.isExamGate) {
      if (state !== 'completed') {
        const gate = getQuizGateStatus(entry.quizGateKey || this.quizGateKey);
        if (gate.locked) { showToast(gate.lockMessage); return; }
      }
      this.openQuizGateMenu(entry, state);
      return;
    }
    this.openRetroMenu(entry, state);
  },
  openRetroMenu(entry, state) {
    const hasContent = !!this.lessonContent[entry.id]; // was the module-level LESSON_CONTENT global
    const totalPages = hasContent ? appendGreetingSummary(this.lessonContent[entry.id], entry.title).length : 0;
    const savedIndex = hasContent ? this.lessonPage[entry.id] : undefined;
    const hasResume = typeof savedIndex === 'number' && savedIndex > 0 && savedIndex < totalPages - 1;
    const startAction = hasContent
      ? () => this.startLesson(entry)
      : () => this.completeInteraction(entry);
    const options = hasContent
      ? [
        ...(hasResume
          ? [
            { label: `Continue (pg ${savedIndex + 1})`, onSelect: () => this.startLesson(entry, savedIndex) },
            { label: 'Start Over', onSelect: startAction },
          ]
          : [{ label: 'Start Lesson', onSelect: startAction }]),
        ...(this.extraRetroMenuOptions ? this.extraRetroMenuOptions(entry) : []), // was the shelf-08-only "Walk the Route" hardcode
        ...(entry.kind === 'shelf' ? [{ label: 'Make Favorite?', onSelect: () => this.toggleFavorite(entry) }] : []),
        { label: 'Exit', onSelect: () => this.closeRetroMenu() },
      ]
      : [
        { label: 'Read again', onSelect: () => this.completeInteraction(entry) },
        { label: 'Exit', onSelect: () => this.closeRetroMenu() },
      ];
    void state;
    const subtitle = hasContent ? `${totalPages} pages` : undefined;
    this.buildRetroMenu(entry.title, options, subtitle);
  },
  startLesson(entry, resumeIndex) {
    this.closeRetroMenu();
    this.panelOpen = true;
    let pages = appendGreetingSummary(this.lessonContent[entry.id], entry.title); // was module-level LESSON_CONTENT
    pages = resolveConversationTurns(pages, this.catColorId);
    pages = resolveDynamicDiagrams(pages, this.catColorId);
    const isSenseiGuide = entry.kind === 'npc';
    const catImagePath = isSenseiGuide ? this.senseiPortraitPaths.idle : this.catColors[this.catColorId].path;
    const talkImagePath = isSenseiGuide ? this.senseiPortraitPaths.talk : this.talkColorPaths[this.catColorId];
    window.LessonBox.open(pages, {
      speaker: 'Neko-sensei',
      catImagePath,
      talkImagePath,
      startIndex: resumeIndex,
      printLinks: entry.id === this.printerStationId ? this.allPrintLinks : this.printLinksByShelf[entry.id], // was 'printer-station' / PRINT_LINKS_BY_SHELF / ALL_PRINT_LINKS
      printIconPath: '../../assets/images/lesson/printer-image-Original.png',
      onComplete: () => {
        this.progress[entry.id] = true;
        saveProgress(this.progress);
        this.refreshAllStates();
        this.panelOpen = false;
      },
      onClose: (closedIndex, totalPages) => {
        this.panelOpen = false;
        if (typeof closedIndex === 'number' && totalPages && closedIndex < totalPages - 1) {
          this.lessonPage[entry.id] = closedIndex;
        } else {
          delete this.lessonPage[entry.id];
        }
        saveLessonPage(this.lessonPage);
      },
    });
  },
  completeInteraction(entry) {
    this.progress[entry.id] = true;
    saveProgress(this.progress);
    this.refreshAllStates();
    this.closeRetroMenu();
  },
  toggleFavorite(entry) {
    this.favorites[entry.id] = !this.favorites[entry.id];
    saveFavorites(this.favorites);
    this.refreshAllStates();
    this.closeRetroMenu();
  },
  refreshAllStates() {
    this.interactives.forEach((entry) => {
      if (entry.kind === 'npc') return;
      const state = entry.kind === 'shelf'
        ? getState(entry.id, entry.prereq, this.progress)
        : (this.progress[entry.id] ? 'completed'
          : (entry.requires.every((r) => this.progress[r]) ? 'available' : 'locked'));
      if (entry.kind === 'shelf') {
        entry.sprite.setTexture(state === 'locked' ? entry.lockedKey : entry.filledKey);
        entry.favIcon.setVisible(!!this.favorites[entry.id]);
        entry.completeBadge.setVisible(state === 'completed');
      }
      entry.sprite.setAlpha(state === 'locked' ? 0.55 : 1);
      entry.glow.setVisible(state === 'available');
      entry.stamp.setVisible(state === 'completed');
    });
  },
  spawnPassSparkle(x, y) {
    const sparkCount = 6;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount;
      const dist = 40;
      const targetX = x + Math.cos(angle) * dist;
      const targetY = y + Math.sin(angle) * dist;
      const spark = this.add.text(x, y, '✨', { fontSize: '18px' }).setOrigin(0.5).setDepth(10);
      this.tweens.add({
        targets: spark, x: targetX, y: targetY,
        scale: { from: 1, to: 1.4 }, alpha: { from: 1, to: 0 },
        duration: 700, ease: 'Cubic.Out',
        onComplete: () => spark.destroy(),
      });
    }
  },
  buildRetroMenu(title, options, subtitle) {
    this.closeRetroMenu();
    const cam = this.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;
    const hasSubtitle = !!subtitle;
    const boxWidth = 300;
    const titleText = this.add.text(0, 0, title, {
      fontFamily: '"Press Start 2P", "DotGothic16", monospace', fontSize: '12px', color: '#F0C674',
      align: 'center', wordWrap: { width: boxWidth - 40, useAdvancedWrap: true },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
    const titleExtra = Math.max(0, titleText.height - 16);
    const boxHeight = (hasSubtitle ? 96 : 76) + titleExtra + options.length * 32;
    const boxTop = cy - boxHeight / 2;
    const bg = this.add.rectangle(cx, cy, boxWidth, boxHeight, 0x1a1410)
      .setStrokeStyle(3, 0x8a6a3a).setScrollFactor(0).setDepth(2000);
    titleText.setPosition(cx, boxTop + 26 + titleExtra / 2);
    const subtitleText = hasSubtitle ? this.add.text(cx, boxTop + 46 + titleExtra, subtitle, {
      fontFamily: '"Press Start 2P", "DotGothic16", monospace', fontSize: '8px', color: '#8a7a5a',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2001) : null;
    const optionsStartY = boxTop + (hasSubtitle ? 78 : 58) + titleExtra;
    const optionTexts = options.map((opt, i) => this.add.text(cx - 118, optionsStartY + i * 32, '', {
      fontFamily: '"Press Start 2P", "DotGothic16", monospace', fontSize: '10px', color: '#B08D57',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(2001)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.highlightRetroMenu(i))
      .on('pointerup', () => { if (this.retroMenu && this.retroMenu.selectedIndex === i) this.selectRetroMenuOption(); }));
    this.retroMenu = { bg, titleText, subtitleText, optionTexts, options, selectedIndex: 0 };
    this.panelOpen = true;
    this.highlightRetroMenu(0);
  },
  highlightRetroMenu(index) {
    if (!this.retroMenu) return;
    this.retroMenu.selectedIndex = index;
    this.retroMenu.optionTexts.forEach((t, i) => {
      t.setColor(i === index ? '#FFDD88' : '#B08D57');
      t.setText((i === index ? '▶ ' : '  ') + this.retroMenu.options[i].label);
    });
  },
  selectRetroMenuOption() {
    if (!this.retroMenu) return;
    const opt = this.retroMenu.options[this.retroMenu.selectedIndex];
    if (opt) opt.onSelect();
  },
  updateRetroMenuInput() {
    const upDown = this.cursors.up.isDown || this.wasd.up.isDown;
    const downDown = this.cursors.down.isDown || this.wasd.down.isDown;
    if (upDown && !this.retroUpKeyWasDown) {
      this.highlightRetroMenu(Math.max(0, this.retroMenu.selectedIndex - 1));
    }
    if (downDown && !this.retroDownKeyWasDown) {
      this.highlightRetroMenu(Math.min(this.retroMenu.options.length - 1, this.retroMenu.selectedIndex + 1));
    }
    this.retroUpKeyWasDown = upDown;
    this.retroDownKeyWasDown = downDown;
  },
  closeRetroMenu() {
    if (this.retroMenu) {
      this.retroMenu.bg.destroy();
      this.retroMenu.titleText.destroy();
      if (this.retroMenu.subtitleText) this.retroMenu.subtitleText.destroy();
      this.retroMenu.optionTexts.forEach((t) => t.destroy());
      this.retroMenu = null;
    }
    this.panelOpen = false;
  },
  openQuizGateMenu(entry, state) {
    const options = state === 'completed'
      ? [
        { label: this.finalGateProceedLabel || 'Proceed', onSelect: () => (entry.onPass || this.onFinalGatePass)() },
        { label: 'Exit', onSelect: () => this.closeRetroMenu() },
      ]
      : [
        { label: 'Retry exam', onSelect: () => this.openQuizAttemptMenu(entry) },
        { label: 'Exit', onSelect: () => this.closeRetroMenu() },
      ];
    this.buildRetroMenu(entry.title, options);
  },
  openQuizAttemptMenu(entry) {
    const { attemptsLeft } = getQuizGateStatus(entry.quizGateKey || this.quizGateKey);
    const options = [
      { label: 'Pass (test)', onSelect: () => this.resolveQuizAttempt(entry, true) },
      { label: 'Fail (test)', onSelect: () => this.resolveQuizAttempt(entry, false) },
      { label: 'Back', onSelect: () => this.openQuizGateMenu(entry, 'available') },
    ];
    this.buildRetroMenu(`${entry.title} (${attemptsLeft} left)`, options);
  },
  resolveQuizAttempt(entry, passed) {
    if (passed) {
      this.progress[entry.id] = true;
      saveProgress(this.progress);
      this.refreshAllStates();
      this.closeRetroMenu();
      this.spawnPassSparkle(entry.x, entry.y);
      return;
    }
    const gateKey = entry.quizGateKey || this.quizGateKey;
    const gateState = loadQuizGateState(gateKey);
    gateState.attemptsUsed += 1;
    if (gateState.attemptsUsed >= QUIZ_MAX_ATTEMPTS) {
      gateState.lockedUntil = Date.now() + QUIZ_LOCKOUT_MS;
      saveQuizGateState(gateKey, gateState);
      this.closeRetroMenu();
      showToast('Locked for 24 hours.');
    } else {
      saveQuizGateState(gateKey, gateState);
      this.closeRetroMenu();
      showToast(`Try again (${QUIZ_MAX_ATTEMPTS - gateState.attemptsUsed} left)`);
    }
  },
};

window.LibrarySceneEngine = LibrarySceneEngine;
window.cropToTexture = cropToTexture;
window.drawWovenRug = drawWovenRug;
window.drawWallHeaderTexture = drawWallHeaderTexture;
window.buildOpenAtriumVoid = buildOpenAtriumVoid;
window.buildAtriumFence = buildAtriumFence;
window.getState = getState;
window.createDecorativeProp = createDecorativeProp;
window.getQuizGateStatus = getQuizGateStatus;
window.ensureToast = ensureToast;
window.showToast = showToast;
window.TRIGGER_RANGE = TRIGGER_RANGE;
