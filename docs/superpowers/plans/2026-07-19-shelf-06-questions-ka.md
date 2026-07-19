# Shelf-06 "Questions (か)" Lesson Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author `LESSON_CONTENT['shelf-06']` in `assets/js/n5-phaser-game.js` — a 10-page lesson teaching the か question particle plus だれ/いつ/どうして・なぜ/いくつ/いくら and the はい/いいえ/そうです/ちがいます answer words, per the approved spec.

**Architecture:** Pure data addition. No new page types, no new rendering code, no changes to `LESSON_DATA`/`SHELF_PREREQ` (both already reference `shelf-06` correctly). The entry is inserted into the existing `LESSON_CONTENT` object literal, immediately after the `'shelf-05'` array closes and before the `'review-1'` comment/key, matching `LESSON_DATA`'s shelf ordering.

**Tech Stack:** Vanilla JS object literals rendered by `assets/js/lesson-box.js`'s `renderContent()`. No build step, no test runner — this repo has neither (see `CLAUDE.md`).

## Global Constraints

- No test framework exists in this repo. "Verify" steps below use `node --check assets/js/n5-phaser-game.js` (syntax) and `grep`/manual read (content presence) — this is the established pattern per `CLAUDE.md`'s Commands section, not a deviation.
- Every sample sentence stays on the `Xは...です(か)` pattern already taught through shelf-05. No い-adjectives, no verb conjugation, no が-marked subjects (those are out of scope until shelf-10/11/13/16 respectively) — even where more natural real-world Japanese would use them.
- Do not re-teach vocabulary already introduced: どこ/どの/どちら (shelf-05), なん (shelf-04), です (shelf-03) are reused, not redefined.
- **Do not run `git add`, `git commit`, or `git push` at any point in this plan.** The user will stage, commit, and push all resulting changes themselves. Skip any "Commit" step you would normally include after a task.
- Field names/shapes for each page `type` (`grammar-intro`, `conversation`, `try-it`, `summary`, `quiz-fill`) must match the existing contract documented in a comment block at the top of `renderContent()` in `assets/js/lesson-box.js` — when in doubt, that comment block is authoritative, not this plan's prose.
- Preview verification (Task 6) is subject to this repo's known stale-JS-caching gotcha: reused ports can serve stale JS even after a hard reload. Use a static-server port/launch-config not yet used this session.

---

### Task 1: Insert shelf-06 entry with pages 1–2 (か mechanic + diagram)

**Files:**
- Modify: `assets/js/n5-phaser-game.js` (insert immediately after the `'shelf-05'` array's closing `],` and before the `'review-1'` comment block, currently around line 1068)

**Interfaces:**
- Consumes: nothing new — inserts a fresh `'shelf-06': [...]` key into the existing `LESSON_CONTENT` object literal (defined starting `assets/js/n5-phaser-game.js:316`).
- Produces: `LESSON_CONTENT['shelf-06']` array containing exactly 2 pages, closed with `],`. Task 2 will locate this closing sequence (ending in the `diagramCaption` line shown below) to extend it.

- [ ] **Step 1: Apply the insertion**

Use the Edit tool with this exact `old_string` (unique in the file — the あちら quiz line only appears once):

```
        { before: 'えきは', after: 'です。 (far away, polite)', answer: 'あちら', altAnswers: ['achira'], hint: '(polite "over there")' },
      ],
    },
  ],
  // "Foundations Review" — review-1, gates shelf-05. First review pile to
```

Replace with this `new_string`:

```
        { before: 'えきは', after: 'です。 (far away, polite)', answer: 'あちら', altAnswers: ['achira'], hint: '(polite "over there")' },
      ],
    },
  ],
  // shelf-06's "Questions (か)" — builds on shelf-05's どこ/どの/どちら and
  // shelf-04's なん, adding か itself plus だれ/いつ/どうして・なぜ/いくつ/
  // いくら and the はい/いいえ/そうです/ちがいます answer words. Every
  // sample stays on the established Xは...です(か) pattern — no adjectives
  // or verb conjugation yet (those start at shelf-10/11/13).
  'shelf-06': [
    {
      type: 'grammar-intro',
      sectionLabel: 'How か makes a question',
      bigIdea: 'One tiny particle turns any calm statement into a question — nothing else moves.',
      analogy: 'か works like the sound of a question mark: you don\'t reorder the sentence or slot in a new word partway through, you just tack it onto the very end.',
      recapChips: ['です (shelf 3)', 'なん (shelf 4)', 'どこ・どの・どちら (shelf 5)'],
      terms: [
        { role: 'particle', name: 'か (ka)', desc: 'Added to the very end of a sentence — turns a statement into a question.' },
      ],
      pattern: [
        { text: '[statement]', role: 'noun' }, { text: 'か', role: 'particle' },
      ],
      explain: [
        'か works two ways: tack it onto a plain yes/no statement (これはほんです → これはほんですか, "Is this a book?"), or onto a sentence that already has a question word in it (せんせいはどこです → せんせいはどこですか, "Where is the teacher?", reusing どこ from shelf 5). Either way, word order never changes — か always goes at the very end.',
      ],
      takeaway: 'Add か to the end of any statement — that\'s a question. No question mark needed.',
    },
    {
      type: 'grammar-intro',
      diagramSvg: `
        <svg viewBox="0 0 480 200" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; display:block;">
          <defs>
            <marker id="lb-arrow-gold-q" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--lb-role-particle-bg)"></path>
            </marker>
          </defs>
          <text x="10" y="22" font-size="11" fill="var(--jr-text-dim)" font-family="VT323, DotGothic16, monospace" letter-spacing="1">STATEMENT</text>
          <g font-family="VT323, DotGothic16, monospace" font-size="16">
            <rect x="10" y="32" width="70" height="34" rx="3" fill="var(--lb-role-noun-bg)"></rect>
            <text x="45" y="54" text-anchor="middle" fill="var(--lb-role-noun-fg)">これ</text>
            <rect x="86" y="32" width="46" height="34" rx="3" fill="var(--lb-role-particle-bg)"></rect>
            <text x="109" y="54" text-anchor="middle" fill="var(--lb-role-particle-fg)">は</text>
            <rect x="138" y="32" width="70" height="34" rx="3" fill="var(--lb-role-noun-bg)"></rect>
            <text x="173" y="54" text-anchor="middle" fill="var(--lb-role-noun-fg)">ほん</text>
            <rect x="214" y="32" width="70" height="34" rx="3" fill="var(--lb-role-verb-bg)"></rect>
            <text x="249" y="54" text-anchor="middle" fill="var(--lb-role-verb-fg)">です</text>
          </g>
          <path d="M120,74 C 120,100 120,116 120,132" fill="none" stroke="var(--lb-role-particle-bg)" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#lb-arrow-gold-q)"></path>
          <text x="150" y="108" font-size="10" fill="var(--lb-role-particle-bg)" font-family="VT323, DotGothic16, monospace">+ か at the very end</text>
          <text x="10" y="146" font-size="11" fill="var(--jr-text-dim)" font-family="VT323, DotGothic16, monospace" letter-spacing="1">QUESTION</text>
          <g font-family="VT323, DotGothic16, monospace" font-size="16">
            <rect x="10" y="156" width="70" height="34" rx="3" fill="var(--lb-role-noun-bg)"></rect>
            <text x="45" y="178" text-anchor="middle" fill="var(--lb-role-noun-fg)">これ</text>
            <rect x="86" y="156" width="46" height="34" rx="3" fill="var(--lb-role-particle-bg)"></rect>
            <text x="109" y="178" text-anchor="middle" fill="var(--lb-role-particle-fg)">は</text>
            <rect x="138" y="156" width="70" height="34" rx="3" fill="var(--lb-role-noun-bg)"></rect>
            <text x="173" y="178" text-anchor="middle" fill="var(--lb-role-noun-fg)">ほん</text>
            <rect x="214" y="156" width="70" height="34" rx="3" fill="var(--lb-role-verb-bg)"></rect>
            <text x="249" y="178" text-anchor="middle" fill="var(--lb-role-verb-fg)">です</text>
            <rect x="290" y="156" width="46" height="34" rx="3" fill="var(--lb-role-particle-bg)" stroke="#fff6da" stroke-width="2"></rect>
            <text x="313" y="178" text-anchor="middle" fill="var(--lb-role-particle-fg)">か</text>
          </g>
        </svg>
      `,
      diagramCaption: 'Same words, same order — か tacked onto the very end is the only difference between a statement and a question.',
    },
  ],
  // "Foundations Review" — review-1, gates shelf-05. First review pile to
```

- [ ] **Step 2: Verify syntax**

Run: `node --check "assets/js/n5-phaser-game.js"`
Expected: no output, exit code 0.

- [ ] **Step 3: Verify content landed**

Run: `grep -n "'shelf-06': \[" "assets/js/n5-phaser-game.js"`
Expected: one match.

Do not commit — leave the change unstaged for the user.

---

### Task 2: Extend shelf-06 with pages 3–4 (yes/no samples + question-word set)

**Files:**
- Modify: `assets/js/n5-phaser-game.js` (extends the `'shelf-06'` array Task 1 created)

**Interfaces:**
- Consumes: the exact closing sequence Task 1 produced (ending in the `diagramCaption` line).
- Produces: `LESSON_CONTENT['shelf-06']` now containing 4 pages, closed with `],`. Task 3 will locate the new closing sequence (ending in the `takeaway` line about どうして/なぜ) to extend it further.

- [ ] **Step 1: Apply the insertion**

Use the Edit tool with this exact `old_string`:

```
      diagramCaption: 'Same words, same order — か tacked onto the very end is the only difference between a statement and a question.',
    },
  ],
  // "Foundations Review" — review-1, gates shelf-05. First review pile to
```

Replace with this `new_string`:

```
      diagramCaption: 'Same words, same order — か tacked onto the very end is the only difference between a statement and a question.',
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Yes-or-no questions, and answering them',
      samples: [
        {
          tag: '"Is this a book?"',
          tiles: [
            { text: 'これ', role: 'noun', gloss: 'this' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'ほん', role: 'noun', gloss: 'book' },
            { text: 'です', role: 'verb', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker', isNew: true },
          ],
          translation: 'Kore wa hon desu ka?',
        },
        {
          tag: '"Yes, that\'s right."',
          tiles: [
            { text: 'はい', role: 'verb', gloss: 'yes', isNew: true },
            { text: 'そうです', role: 'verb', gloss: 'that\'s right', isNew: true },
          ],
          translation: 'Hai, sou desu.',
        },
        {
          tag: '"Is that a pen?"',
          tiles: [
            { text: 'それ', role: 'noun', gloss: 'that' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'ペン', role: 'noun', gloss: 'pen' },
            { text: 'です', role: 'verb', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker' },
          ],
          translation: 'Sore wa pen desu ka?',
        },
        {
          tag: '"No, that\'s not right."',
          tiles: [
            { text: 'いいえ', role: 'adjective', gloss: 'no', isNew: true },
            { text: 'ちがいます', role: 'adjective', gloss: 'that\'s wrong / not it', isNew: true },
          ],
          translation: 'Iie, chigaimasu.',
        },
        {
          tag: '"It\'s actually a book."',
          tiles: [
            { text: 'ほん', role: 'noun', gloss: 'book' },
            { text: 'です', role: 'verb', gloss: 'am / is / are' },
          ],
          translation: 'Hon desu.',
        },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: 'Five more question words',
      explain: [
        'These attach the same way どこ/どの/なん already do — just swap in the question word for whatever piece of information you don\'t know yet.',
      ],
      terms: [
        { role: 'noun', name: 'だれ (dare)', desc: 'Who.' },
        { role: 'noun', name: 'いつ (itsu)', desc: 'When.' },
        { role: 'adjective', name: 'どうして (doushite)', desc: 'Why — neutral, everyday spoken Japanese.' },
        { role: 'adjective', name: 'なぜ (naze)', desc: 'Why — more formal, common in writing.' },
        { role: 'verb', name: 'いくつ (ikutsu)', desc: 'How many (small countable things).' },
        { role: 'verb', name: 'いくら (ikura)', desc: 'How much (price / money).' },
      ],
      takeaway: 'どうして and なぜ both mean "why" — どうして is the everyday spoken choice, なぜ leans formal/written. (There\'s also なんで, an even more casual version you\'ll hear among friends — not covered here.)',
    },
  ],
  // "Foundations Review" — review-1, gates shelf-05. First review pile to
```

- [ ] **Step 2: Verify syntax**

Run: `node --check "assets/js/n5-phaser-game.js"`
Expected: no output, exit code 0.

- [ ] **Step 3: Verify content landed**

Run: `grep -n "Five more question words" "assets/js/n5-phaser-game.js"`
Expected: one match.

Do not commit — leave the change unstaged for the user.

---

### Task 3: Extend shelf-06 with pages 5–6 (だれ/いつ samples + どうして/なぜ/いくつ/いくら samples)

**Files:**
- Modify: `assets/js/n5-phaser-game.js` (extends the `'shelf-06'` array Task 2 left at 4 pages)

**Interfaces:**
- Consumes: the exact closing sequence Task 2 produced (ending in the どうして/なぜ `takeaway` line).
- Produces: `LESSON_CONTENT['shelf-06']` now containing 6 pages, closed with `],`. Task 4 will locate the new closing sequence (ending in the いくら sample's `translation` line) to extend it further.

- [ ] **Step 1: Apply the insertion**

Use the Edit tool with this exact `old_string`:

```
      takeaway: 'どうして and なぜ both mean "why" — どうして is the everyday spoken choice, なぜ leans formal/written. (There\'s also なんで, an even more casual version you\'ll hear among friends — not covered here.)',
    },
  ],
  // "Foundations Review" — review-1, gates shelf-05. First review pile to
```

Replace with this `new_string`:

```
      takeaway: 'どうして and なぜ both mean "why" — どうして is the everyday spoken choice, なぜ leans formal/written. (There\'s also なんで, an even more casual version you\'ll hear among friends — not covered here.)',
    },
    {
      type: 'grammar-intro',
      sectionLabel: '"Who" and "when"',
      samples: [
        {
          tag: '"Who is the teacher?"',
          tiles: [
            { text: 'せんせい', role: 'noun', gloss: 'teacher' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'だれ', role: 'noun', gloss: 'who', isNew: true },
            { text: 'です', role: 'verb', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker' },
          ],
          translation: 'Sensei wa dare desu ka?',
        },
        {
          tag: '"When is your birthday?"',
          tiles: [
            { text: 'たんじょうび', role: 'noun', gloss: 'birthday' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'いつ', role: 'noun', gloss: 'when', isNew: true },
            { text: 'です', role: 'verb', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker' },
          ],
          translation: 'Tanjoubi wa itsu desu ka?',
        },
      ],
    },
    {
      type: 'grammar-intro',
      sectionLabel: '"Why," "how many," and "how much"',
      samples: [
        {
          tag: '"Why?" (everyday)',
          tiles: [
            { text: 'どうして', role: 'adjective', gloss: 'why (neutral)', isNew: true },
            { text: 'です', role: 'verb', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker' },
          ],
          translation: 'Doushite desu ka?',
        },
        {
          tag: '"Why?" (formal)',
          tiles: [
            { text: 'なぜ', role: 'adjective', gloss: 'why (formal)', isNew: true },
            { text: 'です', role: 'verb', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker' },
          ],
          translation: 'Naze desu ka?',
        },
        {
          tag: '"How many apples?"',
          tiles: [
            { text: 'りんご', role: 'noun', gloss: 'apple' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'いくつ', role: 'verb', gloss: 'how many', isNew: true },
            { text: 'です', role: 'verb', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker' },
          ],
          translation: 'Ringo wa ikutsu desu ka?',
        },
        {
          tag: '"How much is this?"',
          tiles: [
            { text: 'これ', role: 'noun', gloss: 'this' },
            { text: 'は', role: 'particle', gloss: 'topic marker' },
            { text: 'いくら', role: 'verb', gloss: 'how much (price)', isNew: true },
            { text: 'です', role: 'verb', gloss: 'am / is / are' },
            { text: 'か', role: 'particle', gloss: 'question marker' },
          ],
          translation: 'Kore wa ikura desu ka?',
        },
      ],
    },
  ],
  // "Foundations Review" — review-1, gates shelf-05. First review pile to
```

- [ ] **Step 2: Verify syntax**

Run: `node --check "assets/js/n5-phaser-game.js"`
Expected: no output, exit code 0.

- [ ] **Step 3: Verify content landed**

Run: `grep -n "How many apples" "assets/js/n5-phaser-game.js"`
Expected: one match.

Do not commit — leave the change unstaged for the user.

---

### Task 4: Extend shelf-06 with pages 7–8 (conversation + try-it)

**Files:**
- Modify: `assets/js/n5-phaser-game.js` (extends the `'shelf-06'` array Task 3 left at 6 pages)

**Interfaces:**
- Consumes: the exact closing sequence Task 3 produced (ending in the いくら sample's `translation` line).
- Produces: `LESSON_CONTENT['shelf-06']` now containing 8 pages, closed with `],`. Task 5 will locate the new closing sequence (ending in the try-it page's `placeholder` line) to extend it further.

- [ ] **Step 1: Apply the insertion**

Use the Edit tool with this exact `old_string`:

```
          translation: 'Kore wa ikura desu ka?',
        },
      ],
    },
  ],
  // "Foundations Review" — review-1, gates shelf-05. First review pile to
```

Replace with this `new_string`:

```
          translation: 'Kore wa ikura desu ka?',
        },
      ],
    },
    {
      type: 'conversation',
      turns: [
        {
          speaker: 'player', name: 'You', action: 'tailwagLeft', actionLabel: '*tail wags*',
          text: 'すみません、これはなんですか？',
          romaji: 'Sumimasen, kore wa nan desu ka? — "Excuse me, what is this?"',
        },
        {
          speaker: 'sensei', name: 'Neko-sensei', action: 'meow', actionLabel: '*meows*',
          text: 'それはほんです。',
          romaji: 'Sore wa hon desu. — "That\'s a book."',
        },
        {
          speaker: 'player', name: 'You', action: 'tailwagLeft', actionLabel: '*tail wags*',
          text: 'そうですか！ありがとうございます。',
          romaji: 'Sou desu ka! Arigatou gozaimasu. — "Oh, I see! Thank you." (そうですか is そう+です+か — not a real question, just a common "I see" reaction.)',
        },
      ],
    },
    {
      type: 'try-it',
      sectionLabel: 'Your turn',
      prompt: 'Turn this statement into a yes/no question by adding one particle to the very end:',
      before: 'これはほんです',
      after: '',
      placeholder: 'か',
    },
  ],
  // "Foundations Review" — review-1, gates shelf-05. First review pile to
```

- [ ] **Step 2: Verify syntax**

Run: `node --check "assets/js/n5-phaser-game.js"`
Expected: no output, exit code 0.

- [ ] **Step 3: Verify content landed**

Run: `grep -n "type: 'try-it'" "assets/js/n5-phaser-game.js"`
Expected: at least 3 matches (shelf-04, shelf-05, shelf-06).

Do not commit — leave the change unstaged for the user.

---

### Task 5: Extend shelf-06 with pages 9–10 (summary table + quiz-fill)

**Files:**
- Modify: `assets/js/n5-phaser-game.js` (extends the `'shelf-06'` array Task 4 left at 8 pages — this is the final content task, closing the array at 10 pages)

**Interfaces:**
- Consumes: the exact closing sequence Task 4 produced (ending in the try-it page's `placeholder` line).
- Produces: `LESSON_CONTENT['shelf-06']` complete at 10 pages. No further tasks extend this array.

- [ ] **Step 1: Apply the insertion**

Use the Edit tool with this exact `old_string`:

```
      placeholder: 'か',
    },
  ],
  // "Foundations Review" — review-1, gates shelf-05. First review pile to
```

Replace with this `new_string`:

```
      placeholder: 'か',
    },
    {
      type: 'summary',
      title: 'New Words: Questions',
      headers: ['Word', 'Romaji', 'Meaning'],
      rows: [
        { kana: 'か', romaji: 'ka', meaning: 'question marker (added to sentence end)' },
        { kana: 'だれ', romaji: 'dare', meaning: 'who' },
        { kana: 'いつ', romaji: 'itsu', meaning: 'when' },
        { kana: 'どうして', romaji: 'doushite', meaning: 'why (neutral)' },
        { kana: 'なぜ', romaji: 'naze', meaning: 'why (formal)' },
        { kana: 'いくつ', romaji: 'ikutsu', meaning: 'how many' },
        { kana: 'いくら', romaji: 'ikura', meaning: 'how much (price)' },
        { kana: 'はい', romaji: 'hai', meaning: 'yes' },
        { kana: 'いいえ', romaji: 'iie', meaning: 'no' },
        { kana: 'そうです', romaji: 'sou desu', meaning: 'that\'s right' },
        { kana: 'ちがいます', romaji: 'chigaimasu', meaning: 'that\'s wrong / not it' },
      ],
    },
    {
      type: 'quiz-fill',
      sectionLabel: 'Quick check: Questions',
      intro: 'Fill in the blanks:',
      questions: [
        { before: 'これはほんです', after: ' (turn this into a question)', answer: 'か', altAnswers: ['ka'], hint: '(the particle that goes at the very end)' },
        { before: 'せんせいは', after: 'ですか。 (asking "who is the teacher?")', answer: 'だれ', altAnswers: ['dare'], hint: '(asks about a person)' },
        { before: 'たんじょうびは', after: 'ですか。 (asking "when is your birthday?")', answer: 'いつ', altAnswers: ['itsu'], hint: '(asks about time)' },
        { before: 'りんごは', after: 'ですか。 (asking "how many apples?")', answer: 'いくつ', altAnswers: ['ikutsu'], hint: '(asks a count of small items)' },
        { before: 'これは', after: 'ですか。 (asking "how much is this?")', answer: 'いくら', altAnswers: ['ikura'], hint: '(asks about price)' },
      ],
    },
  ],
  // "Foundations Review" — review-1, gates shelf-05. First review pile to
```

- [ ] **Step 2: Verify syntax**

Run: `node --check "assets/js/n5-phaser-game.js"`
Expected: no output, exit code 0.

- [ ] **Step 3: Verify the full shelf-06 array is well-formed**

Run: `node -e "const fs=require('fs'); const src=fs.readFileSync('assets/js/n5-phaser-game.js','utf8'); const m=src.match(/'shelf-06': \[[\s\S]*?\n  \],\n  \/\/ \"Foundations Review\"/); if(!m){throw new Error('shelf-06 block not found')}; const pageCount=(m[0].match(/\n {4}\{\n {6}type: '/g)||[]).length; console.log('pages:', pageCount);"`
Expected: `pages: 10`

Do not commit — leave the change unstaged for the user.

---

### Task 6: Manual browser verification

**Files:** none (verification only, no code changes)

**Interfaces:**
- Consumes: the completed `LESSON_CONTENT['shelf-06']` from Task 5, plus the existing shelf click/keyboard entry path `openInteraction()` → `openRetroMenu()` → `startLesson()` → `LessonBox.open()` (all pre-existing, untouched).
- Produces: a pass/fail verification result reported back in this task's own output — no file changes.

- [ ] **Step 1: Start a fresh preview server**

This repo's known gotcha: a reused port can serve stale JS even after a hard reload. Check `.claude/launch.json` for a static-server config not yet used this session, or start one directly, e.g.:

Run: `python -m http.server 8099` (pick a port not already used this session)

- [ ] **Step 2: Open the N5 dashboard and reach shelf-06**

Navigate to `http://localhost:8099/pages/N5/n5-dashboard.html`, get through the cat-select screen, and walk/click to the "Questions (か)" shelf (shelf-06). It should render as unlocked (shelf-05 must be completed first in this browser's `nekoBunko.n5.progress` — if it isn't, complete shelf-05 first, or temporarily seed `localStorage` via devtools console: `JSON.parse(localStorage.getItem('nekoBunko.n5.progress'))` to check current state).

- [ ] **Step 3: Walk through all 10 pages**

Click "Start/Continue?" on the shelf, then click/press through every page in order. Confirm:
- Page 1–2: intro text and diagram render without layout breakage (diagram SVG boxes aligned, か tile visibly highlighted in the "QUESTION" row).
- Page 3: yes/no samples render, はい/いいえ/そうです/ちがいます show as new-word tiles.
- Page 4: the 6-term list (か already covered, plus だれ/いつ/どうして/なぜ/いくつ/いくら) renders.
- Pages 5–6: だれ/いつ/どうして/なぜ/いくつ/いくら sample sentences render.
- Page 7: conversation plays with correct speaker sprites/actions.
- Page 8 (try-it): confirm `advance()`/Next is blocked until typing `か` (case/kana as implemented — check both か and romaji `ka` if the try-it mechanism accepts romaji, matching shelf-04/05's behavior).
- Page 9: summary table shows all 11 rows.
- Page 10 (quiz-fill): type both a kana answer and its romaji `altAnswers` entry for at least 2 questions, confirm both are accepted.

- [ ] **Step 4: Confirm completion state persists**

After finishing the lesson, confirm the shelf shows as "completed" (checkmark/star visual via `refreshAllStates()`) and that `localStorage.getItem('nekoBunko.n5.progress')` (devtools console) includes `"shelf-06":true`. Reload the page and confirm the completed state survives the reload.

- [ ] **Step 5: Report result**

Summarize pass/fail for each sub-check in Step 3–4. If anything fails, do not attempt a fix as part of this task — report back for a follow-up fix task instead.

Do not commit — this task makes no file changes.
