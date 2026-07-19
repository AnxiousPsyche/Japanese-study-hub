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
//   pages: array of { type: 'greeting'|'sentence'|'conjugation'|'grammar-intro'|'summary'|'conversation'|'try-it'|'quiz-fill'|'quiz-review'|'quiz-answers'|'quiz-score', ...fields }
//   'quiz-review'/'quiz-answers'/'quiz-score' are a 3-page group: the
//     review page captures MC/fill answers with no inline grading, the
//     answers page reveals + grades them against the SAME questions array
//     reference, and the score page just displays the resulting tally —
//     see renderContent() below for each page's exact field contract.
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
      continue: root.querySelector('.lesson-box__continue'),
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

  // Shared by 'quiz-answers' (grading) — compares a captured answer
  // (state.quizReviewAnswers[i], set by 'quiz-review') against a question's
  // correct answer. MC compares choice index; fill compares trimmed
  // lowercase text against answer + altAnswers, same normalization as
  // 'quiz-fill' uses for its own inline check.
  function gradeQuizQuestion(q, userAnswer) {
    if (q.kind === 'mc') return userAnswer === q.correctIndex;
    const typed = (userAnswer || '').trim().toLowerCase();
    const accepted = [q.answer].concat(q.altAnswers || []).map((a) => a.toLowerCase());
    return accepted.includes(typed);
  }

  // Shared by 'quiz-score' — a retro-RPG-flavored cat reaction picked from
  // the score percentage, so every quiz-score page gets an appropriate
  // message automatically (page.note still overrides it per-page if a
  // lesson ever wants different flavor text for its own score screen).
  function quizScoreMessage(score) {
    const total = score.total || 0;
    const pct = total > 0 ? (score.correct / total) * 100 : 0;
    if (pct >= 80) {
      return '*proud meow, tail held high* Purrfect! These foundations are locked in.';
    }
    if (pct >= 55) {
      return '*tail flicks happily* Nice work! Most of this has already sunk in.';
    }
    return '*ears droop, then perk right back up* That\'s totally fine — every cat stumbles on the first climb up the shelf. Come back and revisit this pile any time.';
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
      // Visual aid — a small framed image or hand-drawn icon floated to
      // the right so the kana/romaji/meaning text wraps around it (same
      // "float, text flows around" pattern already used for the
      // portrait on the left). imageSrc takes a real photo/illustration
      // path; iconSvg takes raw inline SVG markup for phrases with no
      // photo available — both render into the same framed slot so the
      // page reads consistently either way. Optional: pages without
      // either just render without a visual, unchanged from before.
      // spriteRows/spriteIndex select one equal-height band out of a
      // vertically stacked sprite sheet (e.g. a day/night strip) via
      // background-position math instead of needing a separately
      // cropped image file on disk.
      const visual = page.imageSrc
        ? (page.spriteRows
          ? `<div class="lesson-box__greeting-visual jr-stepped lesson-box__greeting-visual--sprite" role="img" aria-label="${page.visualAlt || ''}" style="background-image:url('${page.imageSrc}');background-size:100% ${page.spriteRows * 100}%;background-position-y:${(page.spriteIndex / (page.spriteRows - 1)) * 100}%;"></div>`
          : `<div class="lesson-box__greeting-visual jr-stepped"><img src="${page.imageSrc}" alt="${page.visualAlt || ''}"></div>`)
        : page.iconSvg
          ? `<div class="lesson-box__greeting-visual jr-stepped lesson-box__greeting-visual--icon">${page.iconSvg}</div>`
          : '';
      c.innerHTML = `
        ${visual}
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
      //   bigIdea: one-line, no-jargon "here's the big idea" framing
      //     sentence — rendered first, before anything else.
      //   analogy: a real-world-comparison paragraph, rendered right
      //     after bigIdea, before the technical breakdown (terms/pattern).
      //   pattern: array of {text, role?} — inline colored A/は/B/です line.
      //   recapChips: array of plain strings — "already know this" pill
      //     badges, rendered before explain (replaces a prose recap
      //     sentence — reusable by any lesson, not self-intro-specific).
      //   explain: array of paragraph strings, rendered first.
      //   tensePair: {present:{kana,translation}, past:{kana,translation}}.
      //   explainAfter: array of paragraph strings, rendered after tensePair
      //     (e.g. a future-tense / negative-form teaser).
      //   terms: array of {role, name, desc} — glossary grid.
      //   diagramSvg: raw inline <svg> markup (author-controlled content,
      //     not user input) + optional diagramCaption string.
      //   samples: array of {tag, tiles:[{text,role,gloss}], translation}.
      //   cultureNote / cultureNotes: single string or array of strings.
      //   takeaway: one bolded sentence — "the one thing that actually
      //     matters right now," rendered last in the intro block, in its
      //     own high-contrast callout so it doesn't blend into the rest
      //     of the explanation.
      const bigIdeaHtml = page.bigIdea ? `<div class="lesson-box__big-idea">${page.bigIdea}</div>` : '';
      const analogyHtml = page.analogy ? `<div class="lesson-box__analogy">${page.analogy}</div>` : '';
      const takeawayHtml = page.takeaway ? `<div class="lesson-box__takeaway"><b>${page.takeaway}</b></div>` : '';
      const patternHtml = page.pattern ? `<div class="lesson-box__pattern-line">${
        page.pattern.map((p) => (p.role ? `<span class="role-${p.role}">${p.text}</span>` : p.text)).join(' ')
      }</div>` : '';
      // recapChips: array of plain strings — a "you already know this"
      // callout rendered as small pill badges instead of a prose
      // sentence (reusable by any future lesson, not just self-intro).
      const recapChipsHtml = page.recapChips ? `
        <div class="lesson-box__recap-chips">
          ${page.recapChips.map((c) => `<span class="lesson-box__recap-chip">&#10003; ${c}</span>`).join('')}
        </div>
      ` : '';
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
      const hasIntroContent = Boolean(page.bigIdea || page.analogy || page.pattern || page.recapChips || (page.explain && page.explain.length) || page.tensePair || page.terms || page.takeaway);
      const introHtml = hasIntroContent
        ? `<div class="lesson-box__section-label">${page.sectionLabel || 'How this sentence works'}</div>${bigIdeaHtml}${analogyHtml}${recapChipsHtml}${explainHtml}${patternHtml}${termsHtml}${tensePairHtml}${explainAfterHtml}${takeawayHtml}`
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
    } else if (page.type === 'try-it') {
      // Gated practice page — advance() (both click-anywhere and
      // keyboard) is blocked until the player types something into the
      // blank; see the 'try-it' block in advance() and the input
      // listener wired below in render(). before/after render around a
      // live text input styled to match the pattern-line diagram.
      c.innerHTML = `
        <div class="lesson-box__section-label">${page.sectionLabel || 'Your turn'}</div>
        <div class="lesson-box__explain-text">${page.prompt}</div>
        <div class="lesson-box__pattern-line lesson-box__try-it-line">
          ${page.before || ''}<input type="text" class="lesson-box__try-it-input" placeholder="${page.placeholder || ''}" autocomplete="off">${page.after || ''}
        </div>
        <div class="lesson-box__try-it-hint">Type your answer, then click anywhere (or press Enter) to continue.</div>
      `;
    } else if (page.type === 'quiz-fill') {
      // Non-blocking fill-in-the-blank check (unlike 'try-it', this never
      // gates advance() — it's the lesson's last page, so the player can
      // always finish, but "Check answers" gives immediate right/wrong
      // feedback per blank). Each question: { before, after, answer,
      // altAnswers?, hint? } — answer/altAnswers compared case-insensitive,
      // trimmed, against the typed blank.
      const questionsHtml = page.questions.map((q, i) => `
        <div class="lesson-box__quiz-row" data-q-idx="${i}">
          <div class="lesson-box__quiz-sentence">
            ${q.before || ''}<input type="text" class="lesson-box__quiz-blank" autocomplete="off">${q.after || ''}
            <span class="lesson-box__quiz-result"></span>
          </div>
          ${q.hint ? `<div class="lesson-box__quiz-hint">${q.hint}</div>` : ''}
        </div>
      `).join('');
      c.innerHTML = `
        <div class="lesson-box__section-label">${page.sectionLabel || 'Quick check'}</div>
        ${page.intro ? `<div class="lesson-box__explain-text">${page.intro}</div>` : ''}
        ${questionsHtml}
        <button type="button" class="lesson-box__quiz-check">Check answers</button>
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
    } else if (page.type === 'quiz-review') {
      // Mixed multiple-choice + fill-in-the-blank review quiz — unlike
      // 'quiz-fill', this does NOT grade inline. Answers are captured into
      // state.quizReviewAnswers (keyed by question index) as the player
      // interacts, and grading + reveal happens on the following
      // 'quiz-answers' page instead — a "answer everything, then compare
      // against the key" self-check flow rather than instant feedback.
      // Each question: { kind: 'mc', prompt, choices, correctIndex } or
      // { kind: 'fill', prompt?, before, after, answer, altAnswers? }.
      const questionsHtml = page.questions.map((q, i) => {
        const prompt = `<div class="lesson-box__quizreview-prompt">${i + 1}. ${q.prompt || ''}</div>`;
        if (q.kind === 'mc') {
          const choicesHtml = q.choices.map((choice, ci) => `
            <div class="lesson-box__quizreview-choice" data-q-idx="${i}" data-choice-idx="${ci}">${choice}</div>
          `).join('');
          return `
            <div class="lesson-box__quizreview-block" data-q-idx="${i}">
              ${prompt}
              <div class="lesson-box__quizreview-choices">${choicesHtml}</div>
            </div>
          `;
        }
        return `
          <div class="lesson-box__quizreview-block" data-q-idx="${i}">
            ${prompt}
            <div class="lesson-box__quizreview-fill">
              ${q.before || ''}<input type="text" class="lesson-box__quizreview-input" data-q-idx="${i}" autocomplete="off">${q.after || ''}
            </div>
          </div>
        `;
      }).join('');
      c.innerHTML = `
        <div class="lesson-box__section-label">${page.sectionLabel || 'Review Quiz'}</div>
        ${page.intro ? `<div class="lesson-box__explain-text">${page.intro}</div>` : ''}
        ${questionsHtml}
      `;
    } else if (page.type === 'quiz-answers') {
      // Reveal + grade page for the immediately preceding 'quiz-review'
      // page — the caller passes the SAME questions array reference to
      // both pages, so grading here reads state.quizReviewAnswers
      // (captured on the review page) against that shared array. Stashes
      // the tally into state.quizReviewScore for the following
      // 'quiz-score' page to display, rather than re-grading there too.
      const answers = state.quizReviewAnswers || {};
      let correctCount = 0;
      const rowsHtml = page.questions.map((q, i) => {
        const userAnswer = answers[i];
        const correct = gradeQuizQuestion(q, userAnswer);
        if (correct) correctCount += 1;
        const correctLabel = q.kind === 'mc' ? q.choices[q.correctIndex] : q.answer;
        const yourAnswerLabel = q.kind === 'mc'
          ? (userAnswer != null ? q.choices[userAnswer] : '(no answer)')
          : (userAnswer && userAnswer.trim() ? userAnswer : '(no answer)');
        return `
          <div class="lesson-box__quizanswer-row">
            <span class="lesson-box__quizanswer-mark ${correct ? 'is-correct' : 'is-wrong'}">${correct ? '✓' : '✗'}</span>
            <div>
              <div class="lesson-box__quizanswer-correct">${i + 1}. Correct: <b>${correctLabel}</b></div>
              <div class="lesson-box__quizanswer-yours">Your answer: ${yourAnswerLabel}</div>
            </div>
          </div>
        `;
      }).join('');
      state.quizReviewScore = { correct: correctCount, total: page.questions.length };
      c.innerHTML = `
        <div class="lesson-box__section-label">${page.sectionLabel || 'Answer Key'}</div>
        ${rowsHtml}
      `;
    } else if (page.type === 'quiz-score') {
      // Final tally page — reads state.quizReviewScore, computed as a
      // side effect of rendering the preceding 'quiz-answers' page, so
      // this page never re-grades anything itself. The reaction line is
      // auto-picked from the score percentage (quizScoreMessage) unless
      // the page explicitly supplies its own page.note.
      const score = state.quizReviewScore || { correct: 0, total: 0 };
      const note = page.note || quizScoreMessage(score);
      c.innerHTML = `
        <div class="lesson-box__quizscore-box">
          <div class="lesson-box__quizscore-num">${score.correct} / ${score.total}</div>
          <div class="lesson-box__quizscore-label">${page.title || 'Score'}</div>
          <div class="lesson-box__quizscore-note">${note}</div>
        </div>
      `;
    }
  }

  // "Spoken word" pulse — cycles a glow/scale highlight through each
  // word-tile in a row, one at a time, as if it's being read aloud.
  // Applies automatically to every word-tile row on the page (both
  // 'sentence'-type pages and grammar-intro 'samples' blocks use the
  // same .lesson-box__sentence-row/.lesson-box__word-tile-text markup),
  // so any lesson — old, current, or future — that renders a tile row
  // gets this for free without opting in per-page.
  function clearPulseIntervals() {
    if (state && state.pulseIntervals) {
      state.pulseIntervals.forEach((id) => clearInterval(id));
    }
    if (state) state.pulseIntervals = [];
  }

  function startPulseAnimations() {
    const rows = els.content.querySelectorAll('.lesson-box__sentence-row');
    rows.forEach((row) => {
      const tiles = row.querySelectorAll('.lesson-box__word-tile-text');
      if (!tiles.length) return;
      let i = 0;
      tiles[0].classList.add('is-pulsing');
      const id = setInterval(() => {
        tiles.forEach((t) => t.classList.remove('is-pulsing'));
        i = (i + 1) % tiles.length;
        tiles[i].classList.add('is-pulsing');
      }, 1150);
      state.pulseIntervals.push(id);
    });
  }

  // Quiet ambient chime played once each time a lesson OPENS (not on
  // every page turn) — a short sine sweep synthesized via Web Audio, no
  // audio asset needed. Applies to every lesson automatically since it's
  // called from open() itself, not per-page data.
  function playOpenChime() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Web Audio unavailable (autoplay policy, unsupported browser) —
      // the box still opens fine, just silently, never throw.
    }
  }

  function render() {
    clearPulseIntervals();
    const page = state.pages[state.index];
    const isConversation = page.type === 'conversation';
    // Conversation pages bring their own per-turn avatars, so the
    // standard single portrait + speaker name (which would otherwise
    // float top-left of the whole exchange) is hidden for the duration
    // of that page, then restored on the next non-conversation page.
    els.portrait.style.display = isConversation ? 'none' : '';
    els.speaker.style.display = isConversation ? 'none' : '';
    els.speaker.textContent = state.speaker;
    // Reset per-page gate state before rendering — 'try-it' always starts
    // locked on a fresh view of that page (re-visiting doesn't keep a
    // stale "already typed" pass from a previous open()).
    state.tryItSatisfied = false;
    renderContent(page);
    if (page.type === 'try-it') {
      const input = els.content.querySelector('.lesson-box__try-it-input');
      const updateGate = () => {
        state.tryItSatisfied = input.value.trim().length > 0;
        els.continue.classList.toggle('lesson-box__continue--locked', !state.tryItSatisfied);
      };
      updateGate();
      input.addEventListener('input', updateGate);
      // Clicking/focusing the input is itself a click inside .lesson-box,
      // which would otherwise bubble to the box's click-to-advance
      // listener — stop it so focusing the field doesn't immediately
      // attempt (and silently fail) an advance.
      input.addEventListener('click', (e) => e.stopPropagation());
    } else if (page.type === 'quiz-fill') {
      const checkBtn = els.content.querySelector('.lesson-box__quiz-check');
      const rows = els.content.querySelectorAll('.lesson-box__quiz-row');
      rows.forEach((row) => {
        row.querySelector('.lesson-box__quiz-blank').addEventListener('click', (e) => e.stopPropagation());
      });
      checkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        rows.forEach((row, i) => {
          const q = page.questions[i];
          const typed = row.querySelector('.lesson-box__quiz-blank').value.trim().toLowerCase();
          const accepted = [q.answer].concat(q.altAnswers || []).map((a) => a.toLowerCase());
          const result = row.querySelector('.lesson-box__quiz-result');
          const correct = accepted.includes(typed);
          result.textContent = correct ? '✓' : `✗ (${q.answer})`;
          result.className = `lesson-box__quiz-result ${correct ? 'is-correct' : 'is-wrong'}`;
        });
      });
    } else if (page.type === 'quiz-review') {
      // Captures answers into state.quizReviewAnswers as the player
      // interacts (no inline grading — see renderContent's 'quiz-review'
      // branch). MC choices toggle a single selection per question; fill
      // inputs capture on every keystroke, same as quiz-fill's blanks.
      // Both stop click propagation so selecting/typing doesn't trigger
      // the box's click-anywhere-to-advance listener.
      const blocks = els.content.querySelectorAll('.lesson-box__quizreview-block');
      blocks.forEach((block) => {
        const qIdx = Number(block.dataset.qIdx);
        const choices = block.querySelectorAll('.lesson-box__quizreview-choice');
        choices.forEach((choiceEl) => {
          choiceEl.addEventListener('click', (e) => {
            e.stopPropagation();
            state.quizReviewAnswers[qIdx] = Number(choiceEl.dataset.choiceIdx);
            choices.forEach((c) => c.classList.remove('is-selected'));
            choiceEl.classList.add('is-selected');
          });
        });
        const input = block.querySelector('.lesson-box__quizreview-input');
        if (input) {
          input.addEventListener('click', (e) => e.stopPropagation());
          input.addEventListener('input', () => {
            state.quizReviewAnswers[qIdx] = input.value;
          });
        }
      });
    }
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
    startPulseAnimations();
  }

  function advance() {
    if (!state) return;
    const currentPage = state.pages[state.index];
    // 'try-it' pages block advancing (both click-anywhere and keyboard,
    // since both funnel through here) until the player has typed
    // something — see render()'s updateGate(), which keeps
    // state.tryItSatisfied in sync with the input's value.
    if (currentPage.type === 'try-it' && !state.tryItSatisfied) return;
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
      pulseIntervals: [],
      // Captured by 'quiz-review' pages, read (and graded) by the
      // following 'quiz-answers' page — lives for the whole lesson-open
      // session since LessonBox has no back-navigation, so a question's
      // answer is only ever written once per open().
      quizReviewAnswers: {},
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
    playOpenChime();
  }

  function close() {
    if (!root) return;
    clearPulseIntervals();
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
    // While a text input inside the box has focus (try-it name field,
    // quiz blanks), typing letters like "e" or a space must reach the
    // input normally, not get hijacked as an advance shortcut — only
    // Enter (submit-like) and Escape (bail out) still act as box
    // controls while typing.
    const isTyping = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
    if (isTyping && e.key !== 'Enter' && e.key !== 'Escape') return;
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
