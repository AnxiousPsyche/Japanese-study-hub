// Closed-word-bank Sentence Missions for Neko Bunko.
// Provides a curated N5 vocabulary bank, grammar-pattern templates, and a
// generateSentenceMission() function that picks compatible words and returns
// a LessonBox-compatible { type: 'sentence-mission', ... } page object.
//
// Every mission shows ONLY the words needed for one sentence — the learner
// arranges word chips into the correct order, never thinking of vocabulary
// outside the provided set.
//
// Exposed as window.SentenceMissions = { generate, BANK }.
(function () {
  'use strict';

  // ── N5 Vocabulary Bank ──────────────────────────────────────────────
  // Curated to the exact word set specified for closed-word-bank missions.
  // Each entry: { text, reading, romaji, meaning }.
  // Organised by part of speech so templates can pick from the right pool.

  const BANK = {
    names: [
      { text: 'たなかさん', reading: 'たなかさん', romaji: 'Tanaka-san', meaning: 'Mr./Ms. Tanaka' },
      { text: 'なかむらさん', reading: 'なかむらさん', romaji: 'Nakamura-san', meaning: 'Mr./Ms. Nakamura' },
      { text: 'さとうさん', reading: 'さとうさん', romaji: 'Sato-san', meaning: 'Mr./Ms. Sato' },
    ],
    nouns: [
      { text: 'ねこ', reading: 'ねこ', romaji: 'neko', meaning: 'cat' },
      { text: 'ほん', reading: 'ほん', romaji: 'hon', meaning: 'book' },
      { text: 'としょかん', reading: 'としょかん', romaji: 'toshokan', meaning: 'library' },
      { text: 'みせ', reading: 'みせ', romaji: 'mise', meaning: 'shop / store' },
      { text: 'えいが', reading: 'えいが', romaji: 'eiga', meaning: 'movie' },
      { text: 'みず', reading: 'みず', romaji: 'mizu', meaning: 'water' },
    ],
    adjectives: [
      { text: 'きれい', reading: 'きれい', romaji: 'kirei', meaning: 'pretty / clean' },
      { text: 'おおきい', reading: 'おおきい', romaji: 'ookii', meaning: 'big' },
      { text: 'ちいさい', reading: 'ちいさい', romaji: 'chiisai', meaning: 'small' },
      { text: 'たのしい', reading: 'たのしい', romaji: 'tanoshii', meaning: 'fun' },
      { text: 'あたらしい', reading: 'あたらしい', romaji: 'atarashii', meaning: 'new' },
    ],
    verbs: [
      { text: 'みる', reading: 'みる', romaji: 'miru', meaning: 'to see / watch', stem: 'み' },
      { text: 'よむ', reading: 'よむ', romaji: 'yomu', meaning: 'to read', stem: 'よみ' },
      { text: 'いく', reading: 'いく', romaji: 'iku', meaning: 'to go', stem: 'いき' },
      { text: 'かう', reading: 'かう', romaji: 'kau', meaning: 'to buy', stem: 'かい' },
      { text: 'たべる', reading: 'たべる', romaji: 'taberu', meaning: 'to eat', stem: 'たべ' },
      { text: 'のむ', reading: 'のむ', romaji: 'nomu', meaning: 'to drink', stem: 'のみ' },
    ],
    particles: [
      { text: 'は', reading: 'は', romaji: 'wa', meaning: 'topic marker', role: 'particle' },
      { text: 'が', reading: 'が', romaji: 'ga', meaning: 'subject marker', role: 'particle' },
      { text: 'を', reading: 'を', romaji: 'wo / o', meaning: 'object marker', role: 'particle' },
      { text: 'に', reading: 'に', romaji: 'ni', meaning: 'to / at (direction / location)', role: 'particle' },
      { text: 'で', reading: 'で', romaji: 'de', meaning: 'at / by / with (action location)', role: 'particle' },
      { text: 'の', reading: 'の', romaji: 'no', meaning: "possessive ('s / of)", role: 'particle' },
      { text: 'と', reading: 'と', romaji: 'to', meaning: "and / with (connector)", role: 'particle' },
    ],
    endings: [
      { text: 'です', reading: 'です', romaji: 'desu', meaning: 'polite copula (am/is/are)' },
      { text: 'ます', reading: 'ます', romaji: 'masu', meaning: 'polite verb ending' },
      { text: 'たいです', reading: 'たいです', romaji: 'tai desu', meaning: "want to (do)" },
    ],
    verbStems: [
      { text: 'み', reading: 'み', romaji: 'mi', meaning: 'stem of みる (to see)' },
      { text: 'よみ', reading: 'よみ', romaji: 'yomi', meaning: 'stem of よむ (to read)' },
      { text: 'いき', reading: 'いき', romaji: 'iki', meaning: 'stem of いく (to go)' },
      { text: 'かい', reading: 'かい', romaji: 'kai', meaning: 'stem of かう (to buy)' },
      { text: 'たべ', reading: 'たべ', romaji: 'tabe', meaning: 'stem of たべる (to eat)' },
      { text: 'のみ', reading: 'のみ', romaji: 'nomi', meaning: 'stem of のむ (to drink)' },
    ],
    teForms: [
      { text: 'みて', reading: 'みて', romaji: 'mite', meaning: 'て-form of みる (see/watch)' },
      { text: 'よんで', reading: 'よんで', romaji: 'yonde', meaning: 'て-form of よむ (read)' },
      { text: 'たべて', reading: 'たべて', romaji: 'tabete', meaning: 'て-form of たべる (eat)' },
      { text: 'のんで', reading: 'のんで', romaji: 'nonde', meaning: 'て-form of のむ (drink)' },
      { text: 'いって', reading: 'いって', romaji: 'itte', meaning: 'て-form of いく (go) — irregular' },
      { text: 'かって', reading: 'かって', romaji: 'katte', meaning: 'て-form of かう (buy)' },
    ],
    requestWord: { text: 'ください', reading: 'ください', romaji: 'kudasai', meaning: 'please (polite request)' },
  };

  // ── Helpers ──────────────────────────────────────────────────────────

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    let a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // ── Template Patterns ───────────────────────────────────────────────
  // Each template is a function that returns a page object for one
  // randomly-filled mission.  wordChips is always shuffled so the shelf
  // never presents words in sentence order.

  const TEMPLATES = [
    // ─── の Possession ────────────────────────────────────────────────
    function () {
      let person = pick(BANK.names);
      let noun   = pick(BANK.nouns);
      let adj    = pick(BANK.adjectives);
      let sentence = person.text + ' の ' + noun.text + ' は ' + adj.text + ' です';
      return {
        type: 'sentence-mission',
        grammarGoal: "Use の to show possession ('s / of).",
        prompt: 'Arrange the words to say: "[Person]\'s [noun] is [adjective]."',
        sentence: sentence,
        wordChips: shuffle([
          { kana: person.text, reading: person.reading, romaji: person.romaji, meaning: person.meaning, role: 'subject' },
          { kana: 'の', reading: 'の', romaji: 'no', meaning: "possessive ('s / of)", role: 'particle' },
          { kana: noun.text, reading: noun.reading, romaji: noun.romaji, meaning: noun.meaning, role: 'predicate' },
          { kana: 'は', reading: 'は', romaji: 'wa', meaning: 'topic marker', role: 'particle' },
          { kana: adj.text, reading: adj.reading, romaji: adj.romaji, meaning: adj.meaning, role: 'predicate' },
          { kana: 'です', reading: 'です', romaji: 'desu', meaning: 'polite copula (am/is/are)', role: 'copula' },
        ]),
        acceptedOrderings: [
          [person.text, 'の', noun.text, 'は', adj.text, 'です'],
        ],
        expectedTokens: [person.text, 'の', noun.text, 'は', adj.text, 'です'],
        explainPattern: function (used) {
          return "Here, の connects the owner (" + person.text + ") to the thing (" + noun.text + ") — just like 's in English: " + person.text + "'s " + noun.text + ".";
        },
      };
    },

    // ─── 〜たい Desire ────────────────────────────────────────────────
    function () {
      let person = pick(BANK.names);
      let obj    = pick(BANK.nouns);
      let verb   = pick(BANK.verbs);
      let stem   = verb.stem;
      let sentence = person.text + ' は ' + obj.text + ' を ' + stem + 'たいです';
      return {
        type: 'sentence-mission',
        grammarGoal: "Say what a person wants to do using 〜たいです.",
        prompt: 'Arrange the words to say: "[Person] wants to [verb] [object]."',
        sentence: sentence,
        wordChips: shuffle([
          { kana: person.text, reading: person.reading, romaji: person.romaji, meaning: person.meaning, role: 'subject' },
          { kana: 'は', reading: 'は', romaji: 'wa', meaning: 'topic marker', role: 'particle' },
          { kana: obj.text, reading: obj.reading, romaji: obj.romaji, meaning: obj.meaning, role: 'predicate' },
          { kana: 'を', reading: 'を', romaji: 'wo / o', meaning: 'object marker', role: 'particle' },
          { kana: stem, reading: stem, romaji: verb.romaji.replace(/u$/, 'i'), meaning: 'stem of ' + verb.text + ' (' + verb.meaning.replace('to ', '') + ')', role: 'predicate' },
          { kana: 'たいです', reading: 'たいです', romaji: 'tai desu', meaning: 'want to (do)', role: 'copula' },
        ]),
        acceptedOrderings: [
          [person.text, 'は', obj.text, 'を', stem, 'たいです'],
        ],
        expectedTokens: [person.text, 'は', obj.text, 'を', stem, 'たいです'],
        explainPattern: function (used) {
          return "The verb stem (" + stem + " from " + verb.text + ") + たいです expresses desire — '" + stem + "たいです' means 'want to " + verb.meaning.replace('to ', '') + "'.";
        },
      };
    },

    // ─── か Question ──────────────────────────────────────────────────
    function () {
      let noun  = pick(BANK.nouns);
      let adj   = pick(BANK.adjectives);
      let sentence = noun.text + ' は ' + adj.text + ' ですか';
      return {
        type: 'sentence-mission',
        grammarGoal: "Turn a statement into a yes/no question with か.",
        prompt: 'Arrange the words to ask: "Is the [noun] [adjective]?"',
        sentence: sentence,
        wordChips: shuffle([
          { kana: noun.text, reading: noun.reading, romaji: noun.romaji, meaning: noun.meaning, role: 'subject' },
          { kana: 'は', reading: 'は', romaji: 'wa', meaning: 'topic marker', role: 'particle' },
          { kana: adj.text, reading: adj.reading, romaji: adj.romaji, meaning: adj.meaning, role: 'predicate' },
          { kana: 'です', reading: 'です', romaji: 'desu', meaning: 'polite copula (am/is/are)', role: 'copula' },
          { kana: 'か', reading: 'か', romaji: 'ka', meaning: 'question particle', role: 'particle' },
        ]),
        acceptedOrderings: [
          [noun.text, 'は', adj.text, 'です', 'か'],
        ],
        expectedTokens: [noun.text, 'は', adj.text, 'です', 'か'],
        explainPattern: function (used) {
          return "Adding か at the end of a polite statement turns it into a yes/no question — no word order change needed.";
        },
      };
    },

    // ─── て-form + ください Request ──────────────────────────────────
    function () {
      let person = pick(BANK.names);
      let teVerb = pick(BANK.teForms);
      let kudasai = BANK.requestWord;
      let verbEn = teVerb.meaning.replace('て-form of ', '').replace(/ \(.*\)/, '');
      let sentence = person.text + '、' + teVerb.text + ' ください';
      return {
        type: 'sentence-mission',
        grammarGoal: "Use the て-form + ください to make a polite request.",
        prompt: 'Arrange the words to say: "[Person], please [verb] (politely)."',
        sentence: sentence,
        wordChips: shuffle([
          { kana: person.text, reading: person.reading, romaji: person.romaji, meaning: person.meaning, role: 'subject' },
          { kana: teVerb.text, reading: teVerb.reading, romaji: teVerb.romaji, meaning: teVerb.meaning, role: 'predicate' },
          { kana: kudasai.text, reading: kudasai.reading, romaji: kudasai.romaji, meaning: kudasai.meaning, role: 'copula' },
        ]),
        acceptedOrderings: [
          [person.text, teVerb.text, kudasai.text],
        ],
        expectedTokens: [person.text, teVerb.text, kudasai.text],
        explainPattern: function (used) {
          return "The て-form + ください makes a polite request — '" + teVerb.text + " ください' means 'please " + verbEn + ".'";
        },
      };
    },
  ];

  // ── Public API ──────────────────────────────────────────────────────

  function generate() {
    let template = pick(TEMPLATES);
    return template();
  }

  window.SentenceMissions = { generate: generate, BANK: BANK };
})();
