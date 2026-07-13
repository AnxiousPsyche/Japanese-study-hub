// Lesson Box Lab — DEV-ONLY comparison tool, not wired into real gameplay.
// Standalone page (pages/N5/lesson-box-lab.html): no Phaser, no game save
// data. Renders 30 small interactive demos of possible LessonBox redesign
// directions, grouped into the 7 categories from the design brief, each
// using the REAL assets/css/lesson-box.css chrome/tokens (via the .lab-box*
// wrapper classes defined in lesson-box-lab.css, which mirror
// .lesson-box/__mid/__panel at card scale) so comparisons are apples-to-
// apples with what's actually in the game. Favorites are starred per-card
// and persisted to localStorage so picks survive a reload; the pinned
// summary bar reads them off at a glance.
(function () {
  const FAV_KEY = 'nekoBunko.lab.favorites';
  const AVATAR = '../../assets/images/avatars/';

  function loadFavorites() {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveFavorites(list) {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(list));
    } catch (e) {
      // localStorage unavailable — favorites just won't persist, never throw.
    }
  }

  let favorites = new Set(loadFavorites());

  function renderSummary() {
    const countEl = document.getElementById('labFavCount');
    const listEl = document.getElementById('labFavList');
    const ids = Array.from(favorites).sort((a, b) => a - b);
    countEl.textContent = String(ids.length);
    if (!ids.length) {
      listEl.innerHTML = '<span class="lab-summary-empty">None selected yet — star any card below.</span>';
      return;
    }
    listEl.innerHTML = ids.map((id) => {
      const idea = IDEAS.find((i) => i.id === id);
      return `<span class="lab-summary-chip" data-jump="${id}">#${id} ${idea ? idea.title : ''}</span>`;
    }).join('');
    listEl.querySelectorAll('[data-jump]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const card = document.querySelector(`.lab-card[data-idea="${chip.dataset.jump}"]`);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  function toggleFavorite(id, checked) {
    if (checked) favorites.add(id); else favorites.delete(id);
    saveFavorites(Array.from(favorites));
    renderSummary();
  }

  // -- shared small helpers --------------------------------------------------

  function el(html) {
    const wrap = document.createElement('div');
    wrap.innerHTML = html.trim();
    return wrap.firstElementChild;
  }

  // Scaled-down replica of the real .lesson-box/__mid/__panel chrome
  // (see lesson-box-lab.css's .lab-box*), wrapping arbitrary inner HTML.
  function miniBox(innerHtml, boxClass) {
    return el(`
      <div class="lab-box jr-stepped ${boxClass || ''}">
        <div class="lab-box-mid jr-stepped">
          <div class="lab-box-panel jr-stepped">${innerHtml}</div>
        </div>
      </div>
    `);
  }

  // Sets background-image/position/animation on a sprite element from a
  // single-row strip sheet — same math as the real lesson-box.js
  // spriteStyle(), reimplemented locally since this page doesn't load that
  // module (standalone, no LessonBox.open() dialogue flow here).
  function spriteStyle(elm, path, displaySize, frameNative, frameCount, row, duration) {
    const scale = displaySize / frameNative;
    const sheetCols = frameCount;
    const sheetW = sheetCols * frameNative * scale;
    const rowOffset = -(row * frameNative * scale);
    const frameW = frameNative * scale;
    elm.style.backgroundImage = `url("${path}")`;
    elm.style.backgroundRepeat = 'no-repeat';
    elm.style.backgroundSize = `${sheetW}px auto`;
    elm.style.backgroundPosition = `0px ${rowOffset}px`;
    elm.style.width = `${displaySize}px`;
    elm.style.height = `${displaySize}px`;
    const animName = `lab_anim_${Math.random().toString(36).slice(2)}`;
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      @keyframes ${animName} {
        from { background-position: 0px ${rowOffset}px; }
        to { background-position: -${frameW * frameCount}px ${rowOffset}px; }
      }
    `;
    document.head.appendChild(styleTag);
    elm.style.animation = `${animName} ${duration} steps(${frameCount}) infinite`;
  }

  // ===========================================================================
  // SECTION 1 — Content (say less, show more)
  // ===========================================================================

  function demo1(root) {
    root.appendChild(miniBox(`
      <div style="font-size:15px;">わたしは <b>[name]</b> です — that's the whole pattern.</div>
      <button class="lab-tell-more" type="button">▸ tell me more</button>
      <div class="lab-more-text" hidden>は marks わたし (I/me) as the topic, and です politely confirms it. This borrows the full A は B です grammar you'll break down in depth on the next shelf.</div>
    `));
    const btn = root.querySelector('.lab-tell-more');
    const more = root.querySelector('.lab-more-text');
    btn.addEventListener('click', () => {
      const isHidden = more.hasAttribute('hidden');
      if (isHidden) { more.removeAttribute('hidden'); btn.textContent = '▾ hide'; }
      else { more.setAttribute('hidden', ''); btn.textContent = '▸ tell me more'; }
    });
  }

  function demo2(root) {
    root.appendChild(miniBox(`
      <div class="lesson-box__pattern-line" style="font-size:17px; margin-bottom:0;">
        <span class="role-noun">わたし</span> <span class="role-particle">は</span> <span class="role-noun">[name]</span> <span class="role-verb">です</span>
      </div>
    `));
  }

  function demo3(root) {
    root.appendChild(miniBox(`
      <div class="lesson-box__sentence-row" style="gap:10px;">
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-noun" style="font-size:18px;">わたし</div></div>
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-particle" style="font-size:18px;">は</div></div>
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-noun" style="font-size:18px;">Neko</div></div>
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-verb" style="font-size:18px;">です</div></div>
      </div>
      <div style="font-size:13px; color:var(--jr-text-dim); margin-top:6px;">A real name reads as an example you'd actually say, not a template slot.</div>
    `));
  }

  function demo4(root) {
    root.appendChild(miniBox(`
      <div style="font-size:14px; margin-bottom:6px;">Already know:</div>
      <span class="lab-recap-chip" data-word="はじめまして" data-meaning="How do you do (first meeting only)">✓ はじめまして</span>
      <span class="lab-recap-chip" data-word="よろしくお願いします" data-meaning="Please treat me kindly / nice to meet you">✓ よろしくお願いします</span>
      <div class="lab-recap-tooltip" hidden></div>
    `));
    const tooltip = root.querySelector('.lab-recap-tooltip');
    root.querySelectorAll('.lab-recap-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        tooltip.hidden = false;
        tooltip.textContent = `${chip.dataset.word} — ${chip.dataset.meaning}`;
      });
    });
  }

  function demo5(root) {
    root.appendChild(miniBox(`
      <div style="font-size:14px; line-height:1.5;">Jikoshoukai always follows: greet, name, close.</div>
      <div class="lab-takeaway">Takeaway: わたしは + [name] + です = your name, done.</div>
    `));
  }

  // ===========================================================================
  // SECTION 2 — Layout (stop wasting the box)
  // ===========================================================================

  function demo6(root) {
    const box = miniBox(`<div style="font-size:14px;">Short content.</div>`, 'is-fixed-height');
    root.appendChild(box);
    const toggle = el(`<button class="lab-tell-more" type="button" style="margin-top:8px;">Switch to auto-height</button>`);
    root.appendChild(toggle);
    let auto = false;
    toggle.addEventListener('click', () => {
      auto = !auto;
      box.classList.toggle('is-fixed-height', !auto);
      box.classList.toggle('is-auto-height', auto);
      toggle.textContent = auto ? 'Switch to fixed-height' : 'Switch to auto-height';
    });
  }

  function demo7(root) {
    root.appendChild(miniBox(`
      <div class="lab-two-col">
        <div class="lesson-box__pattern-line" style="font-size:15px; margin-bottom:0;">
          <span class="role-noun">A</span> <span class="role-particle">は</span> <span class="role-noun">B</span> <span class="role-verb">です</span>
        </div>
        <div style="font-size:13px; color:var(--jr-text-dim);">は marks the topic; です confirms it, politely.</div>
      </div>
    `));
  }

  function demo8(root) {
    root.appendChild(miniBox(`
      <div class="lab-two-col">
        <div>
          <div class="lab-compare-label">Edge-to-edge (current)</div>
          <div class="lab-wide-text">は marks わたし as the topic, and です politely confirms it, every time.</div>
        </div>
        <div>
          <div class="lab-compare-label">Narrow + airy</div>
          <div class="lab-narrow-text">は marks わたし as the topic, and です politely confirms it, every time.</div>
        </div>
      </div>
    `));
  }

  function demo9(root) {
    root.appendChild(miniBox(`
      <div style="font-size:14px;">To say your name, use this shape:</div>
      <div class="lab-callout">
        <span class="role-noun">わたし</span><span class="role-particle">は</span> [name] <span class="role-verb">です</span>
      </div>
    `));
  }

  function demo10(root) {
    root.appendChild(miniBox(`
      <div class="lab-icon-row">
        <div class="lab-icon-step"><span class="glyph">👋</span><span class="label">Greet</span></div>
        <div class="lab-icon-step"><span class="glyph">📛</span><span class="label">Name</span></div>
        <div class="lab-icon-step"><span class="glyph">🙏</span><span class="label">Close</span></div>
      </div>
    `));
  }

  // ===========================================================================
  // SECTION 3 — Interaction (make them do something)
  // ===========================================================================

  function demo11(root) {
    root.appendChild(miniBox(`
      <div style="font-size:12px; color:var(--jr-text-dim); margin-bottom:6px;">Tap a tile:</div>
      <div class="lesson-box__sentence-row" style="gap:10px;">
        <div class="lesson-box__word-tile lab-tile-clickable" data-gloss="watashi — I / me">
          <div class="lesson-box__word-tile-text role-noun" style="font-size:17px;">わたし</div>
          <div class="lab-tile-gloss-pop"></div>
        </div>
        <div class="lesson-box__word-tile lab-tile-clickable" data-gloss="wa — topic marker">
          <div class="lesson-box__word-tile-text role-particle" style="font-size:17px;">は</div>
          <div class="lab-tile-gloss-pop"></div>
        </div>
        <div class="lesson-box__word-tile lab-tile-clickable" data-gloss="desu — am / is / are (polite)">
          <div class="lesson-box__word-tile-text role-verb" style="font-size:17px;">です</div>
          <div class="lab-tile-gloss-pop"></div>
        </div>
      </div>
    `));
    root.querySelectorAll('.lab-tile-clickable').forEach((tile) => {
      const pop = tile.querySelector('.lab-tile-gloss-pop');
      tile.addEventListener('click', () => {
        const revealed = tile.classList.toggle('is-revealed');
        if (revealed) pop.textContent = tile.dataset.gloss;
      });
    });
  }

  function demo12(root) {
    root.appendChild(miniBox(`
      <div style="font-size:14px; margin-bottom:8px;">Your name: <input class="lab-name-input" type="text" placeholder="Neko" maxlength="12"></div>
      <div class="lesson-box__pattern-line" style="font-size:17px; margin-bottom:0;" id="lab12Preview">
        <span class="role-noun">わたし</span><span class="role-particle">は</span> <span class="role-noun">[name]</span> <span class="role-verb">です</span>
      </div>
    `));
    const input = root.querySelector('.lab-name-input');
    const preview = root.querySelector('#lab12Preview');
    input.addEventListener('input', () => {
      const name = input.value.trim() || '[name]';
      preview.innerHTML = `<span class="role-noun">わたし</span><span class="role-particle">は</span> <span class="role-noun">${name}</span> <span class="role-verb">です</span>`;
    });
  }

  function demo13(root) {
    const box = miniBox(`
      <div class="lesson-box__conv-thread" style="max-width:none; gap:12px;">
        <div class="lesson-box__conv-turn">
          <div class="lesson-box__conv-avatar" id="lab13a1" style="width:40px;height:40px;"></div>
          <div class="lesson-box__conv-bubble-wrap">
            <div class="lesson-box__conv-bubble" style="font-size:14px; padding:6px 10px;">はじめまして。お名前は？</div>
          </div>
        </div>
        <div class="lesson-box__conv-turn is-player">
          <div class="lesson-box__conv-avatar" id="lab13a2" style="width:40px;height:40px;"></div>
          <div class="lesson-box__conv-bubble-wrap">
            <div class="lesson-box__conv-bubble" style="font-size:14px; padding:6px 10px;">わたしはNekoです。</div>
          </div>
        </div>
      </div>
    `);
    root.appendChild(box);
    spriteStyle(box.querySelector('#lab13a1'), AVATAR + 'talk-orange-64x64.png', 40, 64, 3, 0, '0.6s');
    spriteStyle(box.querySelector('#lab13a2'), AVATAR + 'tailwagleft-white-64x64.png', 40, 64, 5, 0, '0.9s');
  }

  function demo14(root) {
    root.appendChild(miniBox(`
      <div class="lesson-box__pattern-line" style="font-size:17px; margin-bottom:0;">
        <span class="role-noun">わたし</span><span class="role-particle">は</span> [name] <span class="role-verb">です</span>
      </div>
      <button class="lab-tell-more" type="button">+ grammar note</button>
      <div class="lab-more-text" hidden>は is a particle — it marks the word before it as the sentence's topic, not necessarily its grammatical subject.</div>
    `));
    const btn = root.querySelector('.lab-tell-more');
    const more = root.querySelector('.lab-more-text');
    btn.addEventListener('click', () => {
      const isHidden = more.hasAttribute('hidden');
      if (isHidden) { more.removeAttribute('hidden'); btn.textContent = '− hide grammar note'; }
      else { more.setAttribute('hidden', ''); btn.textContent = '+ grammar note'; }
    });
  }

  function demo15(root) {
    root.appendChild(miniBox(`
      <div style="font-size:14px;">Say your own name to continue:</div>
      <input class="lab-name-input" type="text" placeholder="type here" style="margin-top:6px;">
      <div>
        <span class="lesson-box__continue lab-continue-locked" style="position:static; display:inline-block; margin-top:10px;">&#9660; Continue</span>
      </div>
    `));
    const input = root.querySelector('.lab-name-input');
    const cont = root.querySelector('.lesson-box__continue');
    input.addEventListener('input', () => {
      cont.classList.toggle('lab-continue-locked', input.value.trim().length === 0);
    });
  }

  // ===========================================================================
  // SECTION 4 — Pacing (chunk it)
  // ===========================================================================

  const PAGE_CONTENT = [
    'はじめまして — say this only at a first meeting.',
    'わたしは [name] です — this is how you say your name.',
    'よろしくお願いします — close politely, every time.',
  ];

  function demo16(root) {
    const box = miniBox(`
      <div class="lab-page-content" id="lab16content">${PAGE_CONTENT[0]}</div>
      <div class="lab-page-nav">
        <span></span>
        <button class="lab-page-arrow" type="button" id="lab16next">&#9660;</button>
      </div>
    `);
    root.appendChild(box);
    let i = 0;
    box.querySelector('#lab16next').addEventListener('click', () => {
      i = (i + 1) % PAGE_CONTENT.length;
      box.querySelector('#lab16content').textContent = PAGE_CONTENT[i];
    });
  }

  function demo17(root) {
    const box = miniBox(`
      <div class="lab-page-content" id="lab17content">${PAGE_CONTENT[0]}</div>
      <div class="lab-page-nav">
        <div class="lab-page-dots" id="lab17dots">
          ${PAGE_CONTENT.map((_, i) => `<div class="lab-page-dot${i === 0 ? ' is-active' : ''}"></div>`).join('')}
        </div>
        <button class="lab-page-arrow" type="button" id="lab17next">&#9660;</button>
      </div>
    `);
    root.appendChild(box);
    let i = 0;
    const dots = box.querySelectorAll('.lab-page-dot');
    box.querySelector('#lab17next').addEventListener('click', () => {
      i = (i + 1) % PAGE_CONTENT.length;
      box.querySelector('#lab17content').textContent = PAGE_CONTENT[i];
      dots.forEach((d, di) => d.classList.toggle('is-active', di === i));
    });
  }

  function demo18(root) {
    root.appendChild(miniBox(`
      <div class="lab-mnemonic">"As for ME... I'm [name]!"</div>
      <div style="font-size:12px; color:var(--jr-text-dim); text-align:center;">— a memory hook instead of "topic marker + copula"</div>
    `));
  }

  function demo19(root) {
    root.appendChild(miniBox(`
      <div class="lab-compare-strip">
        <div class="lab-compare-col">
          <div class="lab-compare-label">Known</div>
          <div class="lab-compare-item is-known">はじめまして</div>
          <div class="lab-compare-item is-known">よろしくお願いします</div>
        </div>
        <div class="lab-compare-col">
          <div class="lab-compare-label">New</div>
          <div class="lab-compare-item is-new">わたし・は・です</div>
        </div>
      </div>
    `));
  }

  function demo20(root) {
    root.appendChild(miniBox(`
      <div class="lesson-box__pattern-line" style="font-size:17px; margin-bottom:0;">
        <span class="role-noun">わたし</span><span class="role-particle">は</span> [name] <span class="role-verb">です</span>
      </div>
      <div class="lab-defer-note">Full grammar breakdown → next shelf</div>
    `));
  }

  // ===========================================================================
  // SECTION 5 — Motion & feedback
  // ===========================================================================

  function demo21(root) {
    const box = miniBox(`<div style="display:flex; justify-content:center;"><img class="lab-idle-portrait" id="lab21sprite" alt=""></div>`);
    root.appendChild(box);
    // Real idle sheet: 14 cols, row 12, 8 frames, same rig as CAT_SHEET_ROWS.
    const img = box.querySelector('#lab21sprite');
    img.src = ''; // placeholder <img> swapped for a div-based sprite below
    const spriteDiv = document.createElement('div');
    spriteDiv.className = 'lab-idle-portrait';
    img.replaceWith(spriteDiv);
    spriteStyle(spriteDiv, AVATAR + 'cat-2-64x64.png', 64, 64, 8, 12, '1.2s');
  }

  function demo22(root) {
    const box = miniBox(`
      <div class="lesson-box__sentence-row" style="gap:10px;" id="lab22row">
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-noun lab-word-pulse" style="font-size:17px;">わたし</div></div>
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-particle lab-word-pulse" style="font-size:17px;">は</div></div>
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-noun lab-word-pulse" style="font-size:17px;">Neko</div></div>
        <div class="lesson-box__word-tile"><div class="lesson-box__word-tile-text role-verb lab-word-pulse" style="font-size:17px;">です</div></div>
      </div>
    `);
    root.appendChild(box);
    const words = box.querySelectorAll('.lab-word-pulse');
    let i = 0;
    setInterval(() => {
      words.forEach((w) => w.classList.remove('is-active'));
      words[i % words.length].classList.add('is-active');
      i++;
    }, 700);
  }

  function demo23(root) {
    const box = miniBox(`
      <div style="display:flex; align-items:center; gap:10px;">
        <div id="lab23sprite" style="flex-shrink:0;"></div>
        <div>
          <input class="lab-name-input" type="text" placeholder="type です">
          <button class="lab-try-btn" type="button" id="lab23check">Check</button>
        </div>
      </div>
    `);
    root.appendChild(box);
    const sprite = box.querySelector('#lab23sprite');
    spriteStyle(sprite, AVATAR + 'cat-2-64x64.png', 48, 64, 8, 12, '1.2s');
    const input = box.querySelector('.lab-name-input');
    box.querySelector('#lab23check').addEventListener('click', () => {
      if (input.value.trim() === 'です') {
        sprite.classList.remove('lab-bounce-play');
        void sprite.offsetWidth;
        sprite.classList.add('lab-bounce-play');
      }
    });
  }

  function demo24(root) {
    const slot = el('<div></div>');
    root.appendChild(slot);
    const controls = el(`
      <div style="display:flex; gap:8px; margin-top:8px;">
        <button class="lab-tell-more" type="button" id="lab24new">Open as NEW</button>
        <button class="lab-tell-more" type="button" id="lab24review">Open as REVIEW</button>
      </div>
    `);
    root.appendChild(controls);
    function openAs(animClass) {
      slot.innerHTML = '';
      const box = miniBox(`<div style="font-size:14px;">A fresh lesson box, animated in.</div>`);
      box.classList.add(animClass);
      slot.appendChild(box);
    }
    openAs('lab-anim-slide');
    controls.querySelector('#lab24new').addEventListener('click', () => openAs('lab-anim-slide'));
    controls.querySelector('#lab24review').addEventListener('click', () => openAs('lab-anim-fade'));
  }

  // ===========================================================================
  // SECTION 6 — Personalization & pacing
  // ===========================================================================

  function demo25(root) {
    const box = miniBox(`
      <div class="lab-tag-chip is-new" id="lab25tag">NEW</div>
      <div style="font-size:14px;">わたしは [name] です</div>
    `);
    box.querySelector('.lab-box-panel').style.position = 'relative';
    root.appendChild(box);
    const toggle = el('<button class="lab-tell-more" type="button" style="margin-top:8px;">Toggle NEW / REVIEW</button>');
    root.appendChild(toggle);
    const tag = box.querySelector('#lab25tag');
    toggle.addEventListener('click', () => {
      const isNew = tag.classList.contains('is-new');
      tag.classList.toggle('is-new', !isNew);
      tag.classList.toggle('is-review', isNew);
      tag.textContent = isNew ? 'REVIEW' : 'NEW';
    });
  }

  function demo26(root) {
    const names = ['Neko', 'Sakura', 'Reya', 'Tanaka', 'Yuki'];
    const box = miniBox(`<div style="font-size:16px;" id="lab26text">わたしは <b>Neko</b> です</div>`);
    root.appendChild(box);
    const btn = el('<button class="lab-reopen-btn" type="button">↻ Reopen lesson</button>');
    root.appendChild(btn);
    btn.addEventListener('click', () => {
      const name = names[Math.floor(Math.random() * names.length)];
      box.querySelector('#lab26text').innerHTML = `わたしは <b>${name}</b> です`;
    });
  }

  function demo27(root) {
    const box = miniBox(`
      <div id="lab27full">
        <div style="font-size:14px;">は marks わたし as the topic, and です politely confirms it — the full explanation.</div>
        <div class="lesson-box__pattern-line" style="font-size:16px; margin-top:8px; margin-bottom:0;">
          <span class="role-noun">わたし</span><span class="role-particle">は</span> [name] <span class="role-verb">です</span>
        </div>
      </div>
    `);
    root.appendChild(box);
    const btn = el('<button class="lab-mark-read-btn" type="button">✓ Mark as read</button>');
    root.appendChild(btn);
    const full = box.querySelector('#lab27full');
    const fullHtml = full.innerHTML;
    let collapsed = false;
    btn.addEventListener('click', () => {
      if (collapsed) return;
      collapsed = true;
      full.innerHTML = `<div class="lesson-box__pattern-line lab-collapsed-box" style="font-size:16px; margin-bottom:0;"><span class="role-noun">わたし</span><span class="role-particle">は</span> [name] <span class="role-verb">です</span></div>`;
      full.querySelector('.lab-collapsed-box').addEventListener('click', () => {
        full.innerHTML = fullHtml;
        collapsed = false;
      });
      btn.disabled = true;
      btn.textContent = '(tap the pattern to re-expand)';
    });
  }

  function demo28(root) {
    root.appendChild(miniBox(`
      <div style="font-size:14px; line-height:1.6;">
        は marks the topic
        <span class="lab-glossary-icon">i<span class="lab-glossary-tooltip">"Topic marker" — signals what the sentence is about, not necessarily its grammatical subject.</span></span>
        , and です (the copula
        <span class="lab-glossary-icon">i<span class="lab-glossary-tooltip">"Copula" — a linking word meaning is/am/are. In Japanese it always sits at the very end of the sentence.</span></span>
        ) confirms it.
      </div>
    `));
    root.querySelectorAll('.lab-glossary-icon').forEach((icon) => {
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = icon.classList.contains('is-open');
        root.querySelectorAll('.lab-glossary-icon').forEach((i) => i.classList.remove('is-open'));
        if (!wasOpen) icon.classList.add('is-open');
      });
    });
    document.addEventListener('click', () => {
      root.querySelectorAll('.lab-glossary-icon').forEach((i) => i.classList.remove('is-open'));
    });
  }

  // ===========================================================================
  // SECTION 7 — Atmosphere
  // ===========================================================================

  function demo29(root) {
    const wrap = el(`
      <div class="lab-atmosphere-wrap">
        <div class="lab-atmosphere-bg" style="background-image:url('${AVATAR}../library-tiles/bookshelf.png');"></div>
      </div>
    `);
    const box = miniBox(`<div style="font-size:14px;">A sliver of scenery shows through instead of solid navy.</div>`);
    wrap.appendChild(box);
    root.appendChild(wrap);
  }

  function demo30(root) {
    const box = miniBox(`<div style="font-size:14px;">Click to open — listen for the chime.</div>`);
    root.appendChild(box);
    const btn = el('<button class="lab-sound-btn" type="button">🔊 Open box</button>');
    root.appendChild(btn);
    btn.addEventListener('click', () => {
      box.classList.remove('lab-anim-fade');
      void box.offsetWidth;
      box.classList.add('lab-anim-fade');
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch (e) {
        // Web Audio unavailable — visual animation still plays, never throw.
      }
    });
  }

  // ===========================================================================

  const IDEAS = [
    { id: 1, section: 1, title: 'Cut to 1-2 lines', desc: 'Two paragraphs trimmed to one line; "why" hides behind a tap.', build: demo1 },
    { id: 2, section: 1, title: 'Formula diagram replaces prose', desc: 'The colored A/は/B/です line stands in for a written description.', build: demo2 },
    { id: 3, section: 1, title: 'Real filled-in name', desc: '"Neko" instead of [name] — reads like an actual sentence.', build: demo3 },
    { id: 4, section: 1, title: 'Recap chip, not a sentence', desc: '"You already know X and Y" becomes tappable pill badges.', build: demo4 },
    { id: 5, section: 1, title: 'Bolded takeaway line', desc: 'Ends on one highlighted line instead of trailing explanation.', build: demo5 },

    { id: 6, section: 2, title: 'Box sizes to content', desc: 'Toggle between a tall fixed box (dead space) and auto-height.', build: demo6 },
    { id: 7, section: 2, title: 'Two-column split', desc: 'Diagram on one side, one-line note on the other.', build: demo7 },
    { id: 8, section: 2, title: 'Narrower, airier text', desc: 'Wider line-height + narrower line length vs. edge-to-edge.', build: demo8 },
    { id: 9, section: 2, title: 'Formula callout box', desc: 'The pattern gets its own highlighted box, separate from body text.', build: demo9 },
    { id: 10, section: 2, title: 'Icons break up concepts', desc: 'Greet / name / close shown as icon+label instead of prose.', build: demo10 },

    { id: 11, section: 3, title: 'Tap a tile to reveal gloss', desc: 'Click any word-tile to pop its pronunciation/meaning.', build: demo11 },
    { id: 12, section: 3, title: 'Type your own name', desc: 'Live-updating sentence preview as you type.', build: demo12 },
    { id: 13, section: 3, title: 'Two NPC cats conversing', desc: 'A live example exchange, animated, not just described.', build: demo13 },
    { id: 14, section: 3, title: 'Progressive reveal', desc: 'Pattern shown first; deeper grammar note only on tap.', build: demo14 },
    { id: 15, section: 3, title: '"Try it" gate', desc: 'Continue arrow stays locked until you type something.', build: demo15 },

    { id: 16, section: 4, title: 'Capped 2-3 lines, paged', desc: 'Short chunks, click the arrow to advance.', build: demo16 },
    { id: 17, section: 4, title: 'Page dots', desc: 'A small 1/3-style dot row shows more content follows.', build: demo17 },
    { id: 18, section: 4, title: 'Memory-hook line', desc: 'A mnemonic instead of grammar terminology.', build: demo18 },
    { id: 19, section: 4, title: 'Known vs. new strip', desc: 'Checkmark vs. glow comparison instead of stating it in prose.', build: demo19 },
    { id: 20, section: 4, title: 'Grammar deferred entirely', desc: 'Only the bare minimum pattern shown; rest pushed to next shelf.', build: demo20 },

    { id: 21, section: 5, title: 'Idle portrait animation', desc: 'The sensei sprite loops its idle animation at rest.', build: demo21 },
    { id: 22, section: 5, title: 'Spoken-word pulse', desc: 'Each word glows in turn as if being "read aloud."', build: demo22 },
    { id: 23, section: 5, title: 'Correct-answer reaction', desc: 'The cat bounces when a typed answer matches.', build: demo23 },
    { id: 24, section: 5, title: 'Entrance animation differs', desc: 'Slide-in for new grammar, fade-in for review.', build: demo24 },

    { id: 25, section: 6, title: 'NEW / REVIEW tag chip', desc: 'A corner badge toggles between the two states.', build: demo25 },
    { id: 26, section: 6, title: 'Rotating example name', desc: 'Reopening the lesson re-rolls a different example name.', build: demo26 },
    { id: 27, section: 6, title: 'Collapse after first read', desc: '"Mark as read" shrinks the box to just the formula.', build: demo27 },
    { id: 28, section: 6, title: 'Glossary tooltip icons', desc: 'Recurring terms get a reusable "ⓘ" instead of re-explaining.', build: demo28 },

    { id: 29, section: 7, title: 'Blurred scenery behind box', desc: 'A sliver of bookshelf shows through instead of solid fill.', build: demo29 },
    { id: 30, section: 7, title: 'Ambient open chime', desc: 'A quiet synthesized cue plays when the box opens.', build: demo30 },
  ];

  const SECTIONS = [
    { id: 1, title: '1 — Content (say less, show more)' },
    { id: 2, title: '2 — Layout (stop wasting the box)' },
    { id: 3, title: '3 — Interaction (make them do something)' },
    { id: 4, title: '4 — Pacing (chunk it)' },
    { id: 5, title: '5 — Motion & feedback' },
    { id: 6, title: '6 — Personalization & pacing' },
    { id: 7, title: '7 — Atmosphere' },
  ];

  function buildCard(idea) {
    const card = el(`
      <div class="lab-card" data-idea="${idea.id}">
        <div class="lab-card-head">
          <label class="lab-star">
            <input type="checkbox" data-fav-checkbox="${idea.id}">
            <span class="star-glyph">★</span>
          </label>
          <div class="lab-card-title">${idea.id}. ${idea.title}</div>
        </div>
        <div class="lab-card-desc">${idea.desc}</div>
        <div class="lab-demo-slot"></div>
      </div>
    `);
    const checkbox = card.querySelector('[data-fav-checkbox]');
    checkbox.checked = favorites.has(idea.id);
    checkbox.addEventListener('change', () => toggleFavorite(idea.id, checkbox.checked));
    try {
      idea.build(card.querySelector('.lab-demo-slot'));
    } catch (e) {
      card.querySelector('.lab-demo-slot').textContent = 'Demo failed to build: ' + e.message;
    }
    return card;
  }

  function init() {
    const main = document.getElementById('labSections');
    SECTIONS.forEach((section) => {
      const sectionEl = el(`
        <section class="lab-section" data-section="${section.id}">
          <div class="lab-section-title">${section.title}</div>
          <div class="lab-grid"></div>
        </section>
      `);
      const grid = sectionEl.querySelector('.lab-grid');
      IDEAS.filter((i) => i.section === section.id).forEach((idea) => {
        grid.appendChild(buildCard(idea));
      });
      main.appendChild(sectionEl);
    });
    renderSummary();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
