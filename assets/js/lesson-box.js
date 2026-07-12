// Reusable retro RPG-style lesson dialogue box (DOM overlay on top of the
// Phaser canvas — everything else in this game is canvas-drawn, but the
// per-lessonType layouts here (word-tiles, tables, wrapped text) are far
// more natural in real HTML/CSS than hand-drawn Phaser primitives).
//
// Single-content-type per instance, driven entirely by the `pages` array
// passed to open() — no in-box tab switcher (confirmed explicitly: a
// LessonBox only ever renders whichever lessonType the clicked shelf is).
//
// Usage: LessonBox.open(pages, { speaker, catImagePath, onComplete, onClose })
//   pages: array of { type: 'greeting'|'sentence'|'conjugation', ...fields }
//   catImagePath: URL to that color's idle+walk spritesheet (896x4608,
//     64x64 frames, 14 cols — same sheet CAT_COLORS already loads in
//     n5-phaser-game.js) — used for BOTH the speaker portrait (looping
//     idle) and the ambient corner cat.
(function () {
  const SHEET_COLS = 14;
  const IDLE_ROW = 12;
  const IDLE_FRAMES = 8;
  const FRAME = 64;
  const PORTRAIT_SIZE = 120; // bumped up alongside the bigger "TV screen" box

  let root = null;
  let els = null;
  let state = null; // { pages, index, onComplete, onClose }

  function ensureDom() {
    if (root) return;
    root = document.getElementById('lessonBoxOverlay');
    if (!root) return;
    root.innerHTML = `
      <div class="lesson-box jr-stepped" role="dialog" aria-live="polite">
        <div class="lesson-box__mid jr-stepped">
          <div class="lesson-box__panel jr-stepped">
            <div class="lesson-box__ambient-cat"></div>
            <div class="lesson-box__portrait jr-stepped">
              <div class="lesson-box__portrait-mid jr-stepped">
                <div class="lesson-box__portrait-inner jr-stepped">
                  <div class="lesson-box__portrait-sprite"></div>
                </div>
              </div>
            </div>
            <div class="lesson-box__speaker"></div>
            <div class="lesson-box__content"></div>
            <div class="lesson-box__continue">&#9660;</div>
          </div>
        </div>
      </div>
    `;
    els = {
      box: root.querySelector('.lesson-box'),
      portraitSprite: root.querySelector('.lesson-box__portrait-sprite'),
      ambientCat: root.querySelector('.lesson-box__ambient-cat'),
      speaker: root.querySelector('.lesson-box__speaker'),
      content: root.querySelector('.lesson-box__content'),
    };
    els.box.addEventListener('click', advance);
  }

  function spriteStyle(el, catImagePath, displaySize) {
    const scale = displaySize / FRAME;
    const sheetW = SHEET_COLS * FRAME * scale;
    const rowOffset = -(IDLE_ROW * FRAME * scale);
    const frameW = FRAME * scale;
    el.style.backgroundImage = `url("${catImagePath}")`;
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundSize = `${sheetW}px auto`;
    el.style.backgroundPosition = `0px ${rowOffset}px`;
    el.style.width = `${displaySize}px`;
    el.style.height = `${displaySize}px`;
    // Inline @keyframes per instance (frame width varies with displaySize)
    // via a unique animation name, so the two sprites (portrait 64px,
    // ambient 40px) don't fight over one shared keyframe rule.
    const animName = `lessonBoxIdle_${displaySize}`;
    if (!document.getElementById(`style-${animName}`)) {
      const styleTag = document.createElement('style');
      styleTag.id = `style-${animName}`;
      styleTag.textContent = `
        @keyframes ${animName} {
          from { background-position: 0px ${rowOffset}px; }
          to { background-position: -${frameW * IDLE_FRAMES}px ${rowOffset}px; }
        }
      `;
      document.head.appendChild(styleTag);
    }
    el.style.animation = `${animName} 1.2s steps(${IDLE_FRAMES}) infinite`;
  }

  // Shared by 'conjugation' and 'summary' — both are a 3-column
  // headword/romaji/gloss table, just with different headers and data.
  function renderDataTable(headers, rows) {
    const rowsHtml = rows.map((r) => `
      <tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>
    `).join('');
    return `
      <table class="lesson-box__data-table">
        <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;
  }

  function renderContent(page) {
    const c = els.content;
    c.innerHTML = '';
    if (page.type === 'greeting') {
      // Usage notes ("when and where they should be used") are optional
      // per page — greetings without one just skip the block rather than
      // rendering an empty note.
      const usage = page.usage ? `
        <div class="lesson-box__greeting-usage-label">When to use:</div>
        <div class="lesson-box__greeting-usage">${page.usage}</div>
      ` : '';
      // Phonetic pronunciation guide is optional too, same reasoning as
      // usage — older/future pages without one just skip the line.
      const pronunciation = page.pronunciation
        ? `<div class="lesson-box__greeting-pronunciation">${page.pronunciation}</div>`
        : '';
      c.innerHTML = `
        <div class="lesson-box__greeting-kana">${page.kana}</div>
        <div class="lesson-box__greeting-romaji">${page.romaji}</div>
        ${pronunciation}
        <div class="lesson-box__greeting-meaning">${page.meaning}</div>
        ${usage}
      `;
    } else if (page.type === 'sentence') {
      // label ("Example 2") and newWordFlag ("New word: kore") are both
      // optional per page — a page can be a plain example with neither.
      const label = page.label ? `<div class="lesson-box__sentence-label">${page.label}</div>` : '';
      const newWordFlag = page.newWordFlag ? `<div class="lesson-box__new-word-flag">${page.newWordFlag}</div>` : '';
      const tiles = page.tiles.map((t) => `
        <div class="lesson-box__word-tile">
          <div class="lesson-box__word-tile-text role-${t.role}${t.isNew ? ' is-new' : ''}">${t.text}</div>
          <div class="lesson-box__word-tile-gloss">${t.gloss}</div>
        </div>
      `).join('');
      const note = page.note ? `<div class="lesson-box__sentence-note">${page.note}</div>` : '';
      c.innerHTML = `
        ${label}${newWordFlag}
        <div class="lesson-box__sentence-row">${tiles}</div>
        <div class="lesson-box__sentence-translation">${page.translation}</div>
        ${note}
      `;
    } else if (page.type === 'grammar-intro') {
      // pattern: array of {text, role?} rendered inline (role-colored
      // spans for A/particle/B/copula, plain spans for connective text
      // like "-" or quoted glosses). explain: array of plain paragraph
      // strings. terms: array of {role, name, desc}. cultureNote: optional
      // HTML string (e.g. cross-language politeness-marker aside).
      const patternHtml = page.pattern.map((p) => (
        p.role ? `<span class="role-${p.role}">${p.text}</span>` : p.text
      )).join(' ');
      const explainHtml = page.explain.map((t) => `<div class="lesson-box__explain-text">${t}</div>`).join('');
      const termsHtml = page.terms.map((t) => `
        <div class="lesson-box__term-name role-${t.role}">${t.name}</div>
        <div class="lesson-box__term-desc">${t.desc}</div>
      `).join('');
      const cultureNote = page.cultureNote ? `<div class="lesson-box__culture-note">${page.cultureNote}</div>` : '';
      c.innerHTML = `
        <div class="lesson-box__section-label">${page.sectionLabel || 'How this sentence works'}</div>
        <div class="lesson-box__pattern-line">${patternHtml}</div>
        ${explainHtml}
        <div class="lesson-box__term-grid">${termsHtml}</div>
        ${cultureNote}
      `;
    } else if (page.type === 'conjugation') {
      c.innerHTML = renderDataTable(
        ['Form', 'Romaji', 'Label'],
        page.rows.map((r) => [r.kana, r.romaji, r.label]),
      );
    } else if (page.type === 'summary') {
      // Lesson-end recap — the caller (n5-phaser-game.js) builds this
      // page from whatever 'greeting'/other pages came before it, so it
      // stays generic here rather than hardcoded to any one lesson.
      const title = page.title ? `<div class="lesson-box__summary-title">${page.title}</div>` : '';
      c.innerHTML = title + renderDataTable(
        page.headers || ['Phrase', 'Romaji', 'Meaning'],
        page.rows.map((r) => [r.kana, r.romaji, r.meaning]),
      );
    }
  }

  function render() {
    const page = state.pages[state.index];
    els.speaker.textContent = state.speaker;
    renderContent(page);
    spriteStyle(els.portraitSprite, state.catImagePath, PORTRAIT_SIZE);
    spriteStyle(els.ambientCat, state.catImagePath, 40);
  }

  function advance() {
    if (!state) return;
    if (state.index < state.pages.length - 1) {
      state.index += 1;
      render();
    } else {
      const onComplete = state.onComplete;
      close();
      if (onComplete) onComplete();
    }
  }

  function open(pages, options) {
    ensureDom();
    if (!root || !pages || !pages.length) return;
    state = {
      pages,
      index: 0,
      speaker: (options && options.speaker) || 'Neko-sensei',
      catImagePath: options && options.catImagePath,
      onComplete: options && options.onComplete,
      onClose: options && options.onClose,
    };
    root.hidden = false;
    render();
    // CRT power-on pop-in, once per lesson open (not on every page
    // advance — render() above doesn't touch this class). Force a
    // reflow before re-adding so back-to-back opens (e.g. Exit then
    // immediately Start again) restart the animation instead of no-op
    // since the class never actually left the "already applied" state.
    els.box.classList.remove('lesson-box--tv-on');
    void els.box.offsetWidth;
    els.box.classList.add('lesson-box--tv-on');
  }

  function close() {
    if (!root) return;
    root.hidden = true;
    const onClose = state && state.onClose;
    state = null;
    if (onClose) onClose();
  }

  function isOpen() {
    return !!state;
  }

  function handleKey(e) {
    if (!state) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      advance();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  }
  document.addEventListener('keydown', handleKey);

  window.LessonBox = { open, close, advance, isOpen };
})();
