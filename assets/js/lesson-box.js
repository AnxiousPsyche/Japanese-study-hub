// Reusable retro RPG-style lesson dialogue box (DOM overlay on top of the
// Phaser canvas — everything else in this game is canvas-drawn, but the
// per-lessonType layouts here (word-tiles, tables, wrapped text) are far
// more natural in real HTML/CSS than hand-drawn Phaser primitives).
//
// Single-content-type per instance, driven entirely by the `pages` array
// passed to open() — no in-box tab switcher (confirmed explicitly: a
// LessonBox only ever renders whichever lessonType the clicked shelf is).
//
// Usage: LessonBox.open(pages, { speaker, catImagePath, talkImagePath, onComplete, onClose })
//   pages: array of { type: 'greeting'|'sentence'|'conjugation'|'grammar-intro'|'summary'|'conversation', ...fields }
//   catImagePath: URL to that color's idle+walk spritesheet (896x4608,
//     64x64 frames, 14 cols — same sheet CAT_COLORS already loads in
//     n5-phaser-game.js) — used for the ambient corner cat (looping idle).
//   talkImagePath: URL to that color's tight 3-frame "meow sit front"
//     strip (192x64, cropped from the "<color> cat with text.png" asset
//     packs — see TALK_COLORS in n5-phaser-game.js) — used for the
//     speaker portrait so it reads as actively talking, mouth flapping
//     open/closed, instead of idling next to the dialogue text. Falls
//     back to the idle sheet if omitted.
(function () {
  const SHEET_COLS = 14;
  const IDLE_ROW = 12;
  const IDLE_FRAMES = 8;
  const FRAME = 64;
  const PORTRAIT_SIZE = 120; // bumped up alongside the bigger "TV screen" box
  const CONV_AVATAR_SIZE = 52;

  // Frame count/duration per action for 'conversation' page turns — every
  // strip is a single-row, tight-cropped animation (see
  // n5-phaser-game.js's ACTION_SPRITE_PATHS for the actual image paths),
  // so sheetCols always equals frameCount and row is always 0 here.
  const ACTION_META = {
    meow: { frameCount: 3, duration: '0.6s' },
    scratch: { frameCount: 8, duration: '1s' },
    tailwagFront: { frameCount: 5, duration: '0.9s' },
    tailwagLeft: { frameCount: 5, duration: '0.9s' },
    tailwagRight: { frameCount: 5, duration: '0.9s' },
  };

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
      portrait: root.querySelector('.lesson-box__portrait'),
      portraitSprite: root.querySelector('.lesson-box__portrait-sprite'),
      ambientCat: root.querySelector('.lesson-box__ambient-cat'),
      speaker: root.querySelector('.lesson-box__speaker'),
      content: root.querySelector('.lesson-box__content'),
    };
    els.box.addEventListener('click', advance);
  }

  // opts: { sheetCols, row, frameCount, duration, animKey } — defaults
  // reproduce the original idle-only behavior (14-col rig, row 12, 8
  // frames). The talking portrait passes its own sheet shape (a tight
  // 3-frame, 3-col strip) and a snappier duration so it reads as a mouth
  // actually flapping open/closed rather than a lazy idle loop.
  function spriteStyle(el, imagePath, displaySize, opts) {
    const o = opts || {};
    const sheetCols = o.sheetCols || SHEET_COLS;
    const row = o.row != null ? o.row : IDLE_ROW;
    const frameCount = o.frameCount || IDLE_FRAMES;
    const duration = o.duration || '1.2s';
    const animKey = o.animKey || 'idle';
    const scale = displaySize / FRAME;
    const sheetW = sheetCols * FRAME * scale;
    const rowOffset = -(row * FRAME * scale);
    const frameW = FRAME * scale;
    el.style.backgroundImage = `url("${imagePath}")`;
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundSize = `${sheetW}px auto`;
    el.style.backgroundPosition = `0px ${rowOffset}px`;
    el.style.width = `${displaySize}px`;
    el.style.height = `${displaySize}px`;
    // Inline @keyframes per instance (frame width varies with displaySize,
    // and the talking portrait uses a different row/frame count than the
    // ambient idle cat) via a unique animation name, so sprites don't
    // fight over one shared keyframe rule.
    const animName = `lessonBox_${animKey}_${displaySize}`;
    if (!document.getElementById(`style-${animName}`)) {
      const styleTag = document.createElement('style');
      styleTag.id = `style-${animName}`;
      styleTag.textContent = `
        @keyframes ${animName} {
          from { background-position: 0px ${rowOffset}px; }
          to { background-position: -${frameW * frameCount}px ${rowOffset}px; }
        }
      `;
      document.head.appendChild(styleTag);
    }
    el.style.animation = `${animName} ${duration} steps(${frameCount}) infinite`;
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
      // Every field here is optional so this one type can render anything
      // from a plain glossary page to the full explanation+diagram+
      // samples+notes layout (currently shelf-04's intro page uses the
      // latter). Sections are only emitted (and only separated by a
      // divider) when the caller actually supplies that field.
      //   pattern: array of {text, role?} — inline colored A/は/B/です line.
      //   explain: array of paragraph strings, rendered first.
      //   tensePair: {present:{kana,translation}, past:{kana,translation}}.
      //   explainAfter: array of paragraph strings, rendered after tensePair
      //     (e.g. a future-tense / negative-form teaser).
      //   terms: array of {role, name, desc} — glossary grid.
      //   diagramSvg: raw inline <svg> markup (author-controlled content,
      //     not user input) + optional diagramCaption string.
      //   samples: array of {tag, tiles:[{text,role,gloss}], translation}.
      //   cultureNote / cultureNotes: single string or array of strings.
      const patternHtml = page.pattern ? `<div class="lesson-box__pattern-line">${
        page.pattern.map((p) => (p.role ? `<span class="role-${p.role}">${p.text}</span>` : p.text)).join(' ')
      }</div>` : '';
      const explainHtml = (page.explain || []).map((t) => `<div class="lesson-box__explain-text">${t}</div>`).join('');
      const tensePairHtml = page.tensePair ? `
        <div class="lesson-box__tense-pair">
          <div class="lesson-box__tense-card">
            <div class="lesson-box__tense-card-label">Present</div>
            <div class="lesson-box__tense-card-kana">${page.tensePair.present.kana}</div>
            <div class="lesson-box__tense-card-en">${page.tensePair.present.translation}</div>
          </div>
          <div class="lesson-box__tense-card is-past">
            <div class="lesson-box__tense-card-label">Past</div>
            <div class="lesson-box__tense-card-kana">${page.tensePair.past.kana}</div>
            <div class="lesson-box__tense-card-en">${page.tensePair.past.translation}</div>
          </div>
        </div>
      ` : '';
      const explainAfterHtml = (page.explainAfter || []).map((t) => `<div class="lesson-box__explain-text">${t}</div>`).join('');
      const termsHtml = page.terms ? `<div class="lesson-box__term-grid">${
        page.terms.map((t) => `
          <div class="lesson-box__term-name role-${t.role}">${t.name}</div>
          <div class="lesson-box__term-desc">${t.desc}</div>
        `).join('')
      }</div>` : '';
      const diagramHtml = page.diagramSvg ? `
        <div class="lesson-box__section-label">Diagram</div>
        <div class="lesson-box__diagram-wrap">
          ${page.diagramSvg}
          ${page.diagramCaption ? `<div class="lesson-box__diagram-caption">${page.diagramCaption}</div>` : ''}
        </div>
      ` : '';
      const samplesHtml = page.samples ? `
        <div class="lesson-box__mini-label">${page.samplesLabel || 'Samples'}</div>
        ${page.samples.map((s) => `
          <div class="lesson-box__sample-block">
            <div class="lesson-box__sample-tag">${s.tag}</div>
            <div class="lesson-box__sentence-row">
              ${s.tiles.map((t) => `
                <div class="lesson-box__word-tile">
                  <div class="lesson-box__word-tile-text role-${t.role}">${t.text}</div>
                  <div class="lesson-box__word-tile-gloss">${t.gloss}</div>
                </div>
              `).join('')}
            </div>
            <div class="lesson-box__sample-translation">${s.translation}</div>
          </div>
        `).join('')}
      ` : '';
      const notesArr = page.cultureNotes || (page.cultureNote ? [page.cultureNote] : []);
      const notesHtml = notesArr.length ? `
        <div class="lesson-box__mini-label">${page.notesLabel || 'Notes / Fun Fact'}</div>
        ${notesArr.map((n) => `<div class="lesson-box__culture-note">${n}</div>`).join('')}
      ` : '';
      // The intro block (label + pattern/explain/tensePair/terms) only
      // renders when the page actually supplies one of those fields —
      // this lets a single lesson split "how this works", "diagram",
      // "samples", and "notes" across separate pages (one type per
      // page, click-to-advance) instead of forcing them onto one long
      // scrolling page.
      const hasIntroContent = Boolean(page.pattern || (page.explain && page.explain.length) || page.tensePair || page.terms);
      const introHtml = hasIntroContent
        ? `<div class="lesson-box__section-label">${page.sectionLabel || 'How this sentence works'}</div>${patternHtml}${explainHtml}${tensePairHtml}${explainAfterHtml}${termsHtml}`
        : '';
      const divider = '<div class="lesson-box__divider"></div>';
      const sections = [introHtml, diagramHtml, samplesHtml, notesHtml].filter(Boolean);
      c.innerHTML = sections.join(divider);
    } else if (page.type === 'conversation') {
      // Two-party back-and-forth (e.g. Neko-sensei/player self-intro
      // exchange) — replaces the single static portrait with one small
      // animated avatar per turn, alternating sides by speaker. Each
      // turn: { speaker: 'sensei'|'player', name, action, actionLabel,
      // spritePath, text, romaji }. spritePath/action are resolved by
      // the caller (n5-phaser-game.js's resolveConversationTurns) since
      // only it knows the player's selected cat color; this file just
      // renders whatever it's given.
      const turnsHtml = page.turns.map((t, i) => `
        <div class="lesson-box__conv-turn${t.speaker === 'player' ? ' is-player' : ''}">
          <div class="lesson-box__conv-avatar" data-turn-idx="${i}"></div>
          <div class="lesson-box__conv-bubble-wrap">
            <div class="lesson-box__conv-name-row">
              <div class="lesson-box__conv-name">${t.name}</div>
              ${t.actionLabel ? `<div class="lesson-box__conv-action-tag">${t.actionLabel}</div>` : ''}
            </div>
            <div class="lesson-box__conv-bubble">${t.text}</div>
            <div class="lesson-box__conv-meta">${t.romaji}</div>
          </div>
        </div>
      `).join('');
      c.innerHTML = `<div class="lesson-box__conv-thread">${turnsHtml}</div>`;
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
    const isConversation = page.type === 'conversation';
    // Conversation pages bring their own per-turn avatars, so the
    // standard single portrait + speaker name (which would otherwise
    // float top-left of the whole exchange) is hidden for the duration
    // of that page, then restored on the next non-conversation page.
    els.portrait.style.display = isConversation ? 'none' : '';
    els.speaker.style.display = isConversation ? 'none' : '';
    els.speaker.textContent = state.speaker;
    renderContent(page);
    if (isConversation) {
      page.turns.forEach((t, i) => {
        const el = els.content.querySelector(`.lesson-box__conv-avatar[data-turn-idx="${i}"]`);
        const meta = ACTION_META[t.action] || ACTION_META.meow;
        if (el) {
          spriteStyle(el, t.spritePath, CONV_AVATAR_SIZE, {
            sheetCols: meta.frameCount, row: 0, frameCount: meta.frameCount,
            duration: meta.duration, animKey: `conv-${t.action}`,
          });
        }
      });
    } else {
      // Portrait uses the talking (mouth-flap) sprite so the speaker
      // reads as actively saying the dialogue next to it, not just
      // idling next to a wall of text — falls back to the idle sheet if
      // no talk sprite was supplied (keeps this backwards-compatible for
      // any future caller).
      if (state.talkImagePath) {
        spriteStyle(els.portraitSprite, state.talkImagePath, PORTRAIT_SIZE, {
          sheetCols: 3, row: 0, frameCount: 3, duration: '0.6s', animKey: 'talk',
        });
      } else {
        spriteStyle(els.portraitSprite, state.catImagePath, PORTRAIT_SIZE);
      }
    }
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
      talkImagePath: options && options.talkImagePath,
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
