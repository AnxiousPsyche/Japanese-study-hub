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

  var BANK = {
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
      { text: 'みる', reading: 'みる', romaji: 'miru', meaning: 'to see / watch' },
      { text: 'よむ', reading: 'よむ', romaji: 'yomu', meaning: 'to read' },
      { text: 'いく', reading: 'いく', romaji: 'iku', meaning: 'to go' },
      { text: 'かう', reading: 'かう', romaji: 'kau', meaning: 'to buy' },
      { text: 'たべる', reading: 'たべる', romaji: 'taberu', meaning: 'to eat' },
      { text: 'のむ', reading: 'のむ', romaji: 'nomu', meaning: 'to drink' },
      { text: 'どきどきする', reading: 'どきどきする', romaji: 'dokidoki suru', meaning: 'to get nervous / excited' },
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
      { text: 'のみで', reading: 'のみで', romaji: 'nomide', meaning: 'て-form of のむ (drink)' },
      { text: 'いって', reading: 'いって', romaji: 'itte', meaning: 'て-form of いく (go) — irregular' },
      { text: 'かって', reading: 'かって', romaji: 'katte', meaning: 'て-form of かう (buy)' },
    ],
  };

  // ── Helpers ──────────────────────────────────────────────────────────

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // ── Template Patterns ───────────────────────────────────────────────
  // Each template is a function that returns a page object for one
  // randomly-filled mission.  wordChips is always shuffled so the shelf
  // never presents words in sentence order.

  var TEMPLATES = [
    // ─── の Possession ────────────────────────────────────────────────
    function () {
      var person = pick(BANK.names);
      var noun   = pick(BANK.nouns);
      var adj    = pick(BANK.adjectives);
      var sentence = person.text + ' の ' + noun.text + ' は ' + adj.text + ' です';
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
      var person = pick(BANK.names);
      var obj    = pick(BANK.nouns);
      var verb   = pick(BANK.verbs);
      var stem   = pick(BANK.verbStems);
      var sentence = person.text + ' は ' + obj.text + ' を ' + stem.text + ' たいです';
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
          { kana: stem.text, reading: stem.reading, romaji: stem.romaji, meaning: stem.meaning, role: 'predicate' },
          { kana: 'たいです', reading: 'たいです', romaji: 'tai desu', meaning: 'want to (do)', role: 'copula' },
        ]),
        acceptedOrderings: [
          [person.text, 'は', obj.text, 'を', stem.text, 'たいです'],
        ],
        expectedTokens: [person.text, 'は', obj.text, 'を', stem.text, 'たいです'],
        explainPattern: function (used) {
          return "The verb stem (" + stem.text + " from " + verb.text + ") + たいです expresses desire — '" + stem.text + "たいです' means 'want to " + verb.meaning.replace('to ', '') + "'.";
        },
      };
    },

    // ─── か Question ──────────────────────────────────────────────────
    function () {
      var noun  = pick(BANK.nouns);
      var adj   = pick(BANK.adjectives);
      var sentence = noun.text + ' は ' + adj.text + ' ですか';
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

    // ─── て-form Request / Sequence ───────────────────────────────────
    function () {
      var person = pick(BANK.names);
      var teVerb = pick(BANK.teForms);
      var ending = pick(BANK.endings);
      var sentence = person.text + ' は ' + teVerb.text + ' ' + ending.text;
      return {
        type: 'sentence-mission',
        grammarGoal: "Use the て-form to request or connect actions.",
        prompt: 'Arrange the words to say: "[Person], please [verb] (politely)."',
        sentence: sentence,
        wordChips: shuffle([
          { kana: person.text, reading: person.reading, romaji: person.romaji, meaning: person.meaning, role: 'subject' },
          { kana: 'は', reading: 'は', romaji: 'wa', meaning: 'topic marker', role: 'particle' },
          { kana: teVerb.text, reading: teVerb.reading, romaji: teVerb.romaji, meaning: teVerb.meaning, role: 'predicate' },
          { kana: ending.text, reading: ending.reading, romaji: ending.romaji, meaning: ending.meaning, role: 'copula' },
        ]),
        acceptedOrderings: [
          [person.text, 'は', teVerb.text, ending.text],
        ],
        expectedTokens: [person.text, 'は', teVerb.text, ending.text],
        explainPattern: function (used) {
          return "The て-form + ます makes a polite request — '" + teVerb.text + " " + ending.text + "' means 'please " + teVerb.meaning.replace('て-form of ', '').replace(/ \(.*\)/, '') + " politely.'";
        },
      };
    },
  ];

  // ── Public API ──────────────────────────────────────────────────────

  function generate() {
    var template = pick(TEMPLATES);
    return template();
  }

  window.SentenceMissions = { generate: generate, BANK: BANK };
})();
