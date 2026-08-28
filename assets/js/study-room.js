/* STUDY ROOM - Exact 16-shelf sequence from Neko Bunko adventure */
/* Word banks + word-bank sentence-building exercises per shelf, per the
   Study Room Word-Bank Sentence Builder PRD: each lesson declares a small
   closed set of words (wordBank) and 1-2 exercises that pick randomly
   *within* that set (never outside it) to build a sentence the learner
   then types in hiragana. */
(function () {
    "use strict";

    const NAMES = [
        { jp: "たなか", en: "Tanaka" },
        { jp: "さとう", en: "Sato" },
        { jp: "やまだ", en: "Yamada" },
        { jp: "すずき", en: "Suzuki" },
        { jp: "たけだ", en: "Takeda" },
        { jp: "なかむら", en: "Nakamura" },
        { jp: "わたなべ", en: "Watanabe" },
        { jp: "やまもと", en: "Yamamoto" },
        { jp: "いしい", en: "Ishii" },
        { jp: "ふじい", en: "Fuji" }
    ];

    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
    function shuffle(a) {
        let b = a.slice();
        for (let i = b.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let t = b[i]; b[i] = b[j]; b[j] = t;
        }
        return b;
    }
    function uPick(a, n) { return shuffle(a).slice(0, n); }
    function norm(s) {
        return s.replace(/\s+/g, "").replace(/[！-～]/g, function (c) {
            return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
        });
    }

    /* ===== VOCAB-MATCH EXERCISES (vocab-only lessons: s01, s02, s02b,
       s02c) — "pick the correct Japanese word/phrase for this English
       word/phrase", multiple choice, instead of typing a sentence.
       Everything from s03 onward already builds full sentences and
       keeps the free-text buildWordBankExercises() flow untouched. */
    function flattenWordBankEntries(wordBank) {
        let all = [];
        Object.keys(wordBank).forEach(function (key) {
            if (key === "preview") return;
            (wordBank[key] || []).forEach(function (w) { all.push(w); });
        });
        return all;
    }
    function buildMatchExercisesFromBank(wordBank, count) {
        let pool = flattenWordBankEntries(wordBank);
        let n = Math.min(count || 6, pool.length);
        return uPick(pool, n).map(function (word) {
            let distractorPool = pool.filter(function (w) { return w.jp !== word.jp; });
            let distractors = uPick(distractorPool, Math.min(3, distractorPool.length));
            let choices = shuffle([word].concat(distractors).map(function (w) { return w.jp; }));
            /* Some glosses are themselves questions ("Excuse me — is anyone
               home?") — strip a trailing "?" before appending our own so
               the prompt never doubles up ("...home??"). */
            let cleanEn = word.en.replace(/[?？]+$/, "");
            return {
                prompt: "Which word or phrase means: <strong>" + cleanEn + "</strong>?",
                correct: word.jp,
                choices: choices
            };
        });
    }

    function buildLessons() {
        return [s01(),s02(),s02b(),s02c(),s03(),s04(),s05(),s06(),s07(),s08(),
                s09(),s10(),s11(),s12(),s13(),s14(),s15(),s16(),
                k01(),k02(),k03(),k04()];
    }

    /* SHELF 01: Basic Greetings (phrase-only lesson) */
    function s01() {
        let ph = [
            { jp: "こんにちは", en: "Hello" },
            { jp: "おはようございます", en: "Good morning" },
            { jp: "こんばんは", en: "Good evening" },
            { jp: "さようなら", en: "Goodbye" },
            { jp: "ありがとうございます", en: "Thank you" },
            { jp: "すみません", en: "Excuse me" }
        ];
        return {
            id: "s01", title: "Basic Greetings", subtitle: "Shelf 01",
            vocabOnly: true,
            wordBank: {
                phrases: ph,
                preview: [{ jp: "お元気ですか", en: "How are you?", note: "Coming up in shelf 02 — everyday expressions" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Essential Greetings",
                            explain: "These 6 phrases are your survival toolkit. Memorize them and you can handle most everyday social situations.",
                            pattern: "No pattern — just phrases to memorize!"
                        },
                        {
                            title: "When to use each one",
                            explain: "<strong>こんにちは</strong> (konnichiwa) — used from late morning through early evening; safe with strangers, coworkers, and acquaintances, but not usually with close family or young children."
                                + "<br><br><strong>おはようございます</strong> (ohayou gozaimasu) — used in the morning; this is the polite form (drop ございます among friends)."
                                + "<br><br><strong>こんばんは</strong> (konbanwa) — evening/night, once it starts getting dark, same formality as こんにちは."
                                + "<br><br><strong>さようなら</strong> (sayounara) — a fairly formal goodbye that can imply you won't see the person again for a while; close friends/family usually use a casual alternative instead."
                                + "<br><br><strong>ありがとうございます</strong> (arigatou gozaimasu) — the polite 'thank you' for strangers, shop staff, and work (drop ございます for casual thanks)."
                                + "<br><br><strong>すみません</strong> (sumimasen) — very versatile: apologizing, getting someone's attention, or even saying thanks when someone went out of their way for you."
                        }
                    ],
                    examples: [
                        { jp: "こんにちは！", en: "Hello!" },
                        { jp: "こんにちは！ありがとうございます。", en: "Hello! Thank you." },
                        { jp: "さようなら！", en: "Goodbye!" }
                    ],
                    vocab: [
                        { jp: "こんにちは", romaji: "Konnichiwa", en: "Hello / Good afternoon" },
                        { jp: "おはようございます", romaji: "Ohayou gozaimasu", en: "Good morning (polite)" },
                        { jp: "こんばんは", romaji: "Konbanwa", en: "Good evening" },
                        { jp: "さようなら", romaji: "Sayounara", en: "Goodbye" },
                        { jp: "ありがとうございます", romaji: "Arigatou gozaimasu", en: "Thank you (polite)" },
                        { jp: "すみません", romaji: "Sumimasen", en: "Excuse me / Sorry" }
                    ],
                    sources: ["Tofugu — Japanese Greetings guide", "Tae Kim's Guide to Japanese Grammar", "Jisho.org"]
                };
            },
            /* Vocab-only lesson: practice is "pick the correct word for this
               English word/phrase" (buildMatchExercisesFromBank), not typing
               a sentence — there's no grammar pattern here to build one. */
            buildMatchExercises: function () {
                return buildMatchExercisesFromBank(this.wordBank, 6);
            }
        };
    }

    /* SHELF 02: Everyday Expressions — split into three topic-sectioned
       lessons (was one flat 34-word list with no grouping or nuance
       notes). s02 keeps its id so nothing before it in the sequence
       needs renumbering; s02b/s02c are new ids inserted right after it. */

    /* SHELF 02: Greetings & Everyday Phrases (phrase-only lesson) */
    function s02() {
        let ph = [
            { jp: "お元気ですか", en: "How are you?" },
            { jp: "元気です", en: "I'm doing well" },
            { jp: "では、また", en: "See you again" },
            { jp: "じゃ、また", en: "See you again (casual)" },
            { jp: "じゃあ(ね)", en: "See you (more casual)" },
            { jp: "よろしくお願いします", en: "Nice to meet you" },
            { jp: "はじめまして", en: "How do you do (first meeting)" },
            { jp: "お願いします", en: "Please (making a request)" },
            { jp: "ください", en: "Please (asking for something)" },
            { jp: "どうぞ", en: "Please (go ahead)" },
            { jp: "どうも", en: "Thanks / general greeting" },
            { jp: "はい", en: "Yes" },
            { jp: "ええ", en: "Yes (softer)" }
        ];
        return {
            id: "s02", title: "Greetings & Everyday Phrases", subtitle: "Shelf 02",
            vocabOnly: true,
            wordBank: {
                phrases: ph,
                preview: [{ jp: "いってきます", en: "I'm heading out", note: "Coming up next — At Home & At the Table" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Checking In & Saying Goodbye",
                            explain: "<strong>お元気ですか</strong> (ogenki desu ka) / <strong>元気です</strong> (genki desu) is the standard how-are-you exchange."
                                + "<br><br>Goodbyes have a formality ladder: <strong>では、また</strong> (dewa, mata) is neutral-polite,"
                                + "<br><br><strong>じゃ、また</strong> (ja, mata) is a shade more casual,"
                                + "<br><br>and <strong>じゃあ(ね)</strong> (jaa (ne)) is what you'd actually say to a friend."
                        },
                        {
                            title: "Meeting Someone New",
                            explain: "<strong>はじめまして</strong> (hajimemashite) is only ever said the very first time you meet someone."
                                + "<br><br><strong>よろしくお願いします</strong> (yoroshiku onegaishimasu) usually follows it — it doesn't translate 1:1, but it means something like \"please treat me well / I'm counting on you going forward.\" You'll hear it again whenever someone starts working with you on something new, not just at introductions."
                        },
                        {
                            title: "Asking Politely",
                            explain: "<strong>お願いします</strong> (onegaishimasu) attaches to a request (\"[this], please\")."
                                + "<br><br><strong>ください</strong> (kudasai) attaches to a noun or a verb's て-form (\"please give me...\" / \"please do...\")."
                                + "<br><br><strong>どうぞ</strong> (douzo) runs the other direction — it's what YOU say when offering something or letting someone go ahead."
                        }
                    ],
                    examples: [
                        { jp: "はじめまして。よろしくお願いします。", en: "How do you do. Please treat me well." },
                        { jp: "お元気ですか？", en: "How are you?" },
                        { jp: "元気です！ありがとうございます。", en: "I'm doing well! Thank you." },
                        { jp: "じゃあね！", en: "See you!" }
                    ],
                    vocab: [
                        { jp: "お元気ですか", romaji: "Ogenki desu ka", en: "How are you? (polite check-in)" },
                        { jp: "元気です", romaji: "Genki desu", en: "I'm doing well" },
                        { jp: "では、また", romaji: "Dewa, mata", en: "See you again" },
                        { jp: "じゃ、また", romaji: "Ja, mata", en: "See you again (casual)" },
                        { jp: "じゃあ(ね)", romaji: "Jaa (ne)", en: "See you (more casual)" },
                        { jp: "よろしくお願いします", romaji: "Yoroshiku onegaishimasu", en: "Nice to meet you / please take care of this" },
                        { jp: "はじめまして", romaji: "Hajimemashite", en: "How do you do (first meeting only)" },
                        { jp: "お願いします", romaji: "Onegaishimasu", en: "Please (making a request)" },
                        { jp: "ください", romaji: "Kudasai", en: "Please (asking for something)" },
                        { jp: "どうぞ", romaji: "Douzo", en: "Please (go ahead)" },
                        { jp: "どうも", romaji: "Doumo", en: "Thanks / general greeting" },
                        { jp: "はい", romaji: "Hai", en: "Yes" },
                        { jp: "ええ", romaji: "Ee", en: "Yes (softer)" }
                    ],
                    sources: ["Tofugu — Japanese Greetings guide", "Tae Kim's Guide to Japanese Grammar", "Jisho.org"]
                };
            },
            /* Vocab-only lesson: pick the correct word for the English
               word/phrase, same as s01 — no sentence pattern to build yet. */
            buildMatchExercises: function () {
                return buildMatchExercisesFromBank(this.wordBank, 6);
            }
        };
    }

    /* SHELF 02b: At Home & At the Table (phrase-only lesson) */
    function s02b() {
        let ph = [
            { jp: "いってきます", en: "I'm heading out" },
            { jp: "ただいま", en: "I'm home" },
            { jp: "お邪魔します", en: "Excuse me for intruding" },
            { jp: "お邪魔しました", en: "Thanks for having me (on leaving)" },
            { jp: "ごめんください", en: "Excuse me — is anyone home?" },
            { jp: "いただきます", en: "said before eating" },
            { jp: "ごちそうさまでした", en: "said after eating" }
        ];
        return {
            id: "s02b", title: "At Home & At the Table", subtitle: "Shelf 02b",
            vocabOnly: true,
            wordBank: {
                phrases: ph,
                preview: [{ jp: "なるほど", en: "I see / that makes sense", note: "Coming up next — Filler Words & Reactions" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Leaving & Coming Home",
                            explain: "<strong>いってきます</strong> (ittekimasu) — \"I'm off, I'll be back\" — is what the person LEAVING says; the person staying answers with いってらっしゃい (itterasshai — \"go and come back\" — not in this lesson's word bank, but good to recognize)."
                                + "<br><br><strong>ただいま</strong> (tadaima) — \"I'm home\" — gets answered with おかえりなさい (okaerinasai — \"welcome back\") the same way. It's always a call-and-response pair, not a phrase you say alone to no one."
                        },
                        {
                            title: "As a Guest in Someone's Home",
                            explain: "<strong>ごめんください</strong> (gomen kudasai) is what you call out at the door before anyone has answered — like knocking, but with words."
                                + "<br><br><strong>お邪魔します</strong> (ojama shimasu) — \"excuse me for intruding\" — is said stepping inside,"
                                + "<br><br>and its past-tense-shaped partner <strong>お邪魔しました</strong> (ojama shimashita) is said on your way back OUT — same phrase, bookending the visit."
                        },
                        {
                            title: "At the Table",
                            explain: "<strong>いただきます</strong> (itadakimasu) and <strong>ごちそうさまでした</strong> (gochisousama deshita) bookend a meal the same way — said before and after eating, even alone. Neither translates neatly into English; they're closer to a small ritual of gratitude than a literal sentence, so don't overthink a word-for-word translation."
                        }
                    ],
                    examples: [
                        { jp: "いってきます！", en: "I'm heading out!" },
                        { jp: "ただいま。", en: "I'm home." },
                        { jp: "お邪魔します。", en: "Excuse me for intruding. (entering)" },
                        { jp: "いただきます。", en: "(said before eating)" }
                    ],
                    vocab: [
                        { jp: "いってきます", romaji: "Ittekimasu", en: "I'm heading out" },
                        { jp: "ただいま", romaji: "Tadaima", en: "I'm home" },
                        { jp: "お邪魔します", romaji: "Ojama shimasu", en: "Excuse me for intruding (entering)" },
                        { jp: "お邪魔しました", romaji: "Ojama shimashita", en: "Thanks for having me (leaving)" },
                        { jp: "ごめんください", romaji: "Gomen kudasai", en: "Excuse me — is anyone home?" },
                        { jp: "いただきます", romaji: "Itadakimasu", en: "said before eating" },
                        { jp: "ごちそうさまでした", romaji: "Gochisousama deshita", en: "said after eating" }
                    ],
                    sources: ["Tofugu — Japanese Greetings guide", "Tae Kim's Guide to Japanese Grammar", "Jisho.org"]
                };
            },
            buildMatchExercises: function () {
                return buildMatchExercisesFromBank(this.wordBank, 6);
            }
        };
    }

    /* SHELF 02c: Filler Words & Reactions (phrase-only lesson) */
    function s02c() {
        let ph = [
            { jp: "さあ", en: "Well... (hesitation)" },
            { jp: "あの", en: "Um... / excuse me (getting attention)" },
            { jp: "えっと", en: "Um, let's see..." },
            { jp: "うーん", en: "Hmm... (thinking)" },
            { jp: "それでは", en: "Well then / in that case" },
            { jp: "それで", en: "And then / because of that" },
            { jp: "まず", en: "First of all" },
            { jp: "なるほど", en: "I see / now I understand" },
            { jp: "やっぱり", en: "As I thought / after all" },
            { jp: "あ", en: "Ah!/Oh!" },
            { jp: "ああ", en: "Ah, yes" },
            { jp: "多分", en: "Probably / perhaps" },
            { jp: "できるだけ", en: "As much as possible" },
            { jp: "それほど", en: "Not that much (+negative)" },
            { jp: "全然", en: "Not at all (+negative)" },
            { jp: "これから", en: "From now on / after this" },
            { jp: "もし", en: "If / in case" },
            { jp: "ちゃん", en: "familiar name suffix (affectionate)" },
            { jp: "君", en: "familiar name suffix (boys/young men)" },
            { jp: "用", en: "business / errand / use" }
        ];
        return {
            id: "s02c", title: "Filler Words & Reactions", subtitle: "Shelf 02c",
            vocabOnly: true,
            wordBank: {
                phrases: ph,
                preview: [{ jp: "がくせい", en: "student", note: "Coming up in shelf 03 — the A は B です pattern" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Hesitation & Transition Words",
                            explain: "<strong>さあ</strong> (saa) is what comes out when you're unsure or stalling for a moment (\"well...\")."
                                + "<br><br><strong>あの</strong> (ano) is how you open your mouth to get someone's attention or ease into a sentence — \"um, excuse me...\" / \"so, um...\""
                                + "<br><br><strong>えっと</strong> (etto) is the sound of actively searching for the next word — \"um, let's see...\""
                                + "<br><br><strong>うーん</strong> (uun) is a longer, thinking-it-over hum — \"hmm...\""
                                + "<br><br><strong>それでは</strong> (soredewa) formally shifts to a new topic or wraps something up (\"well then\");"
                                + "<br><br><strong>それで</strong> (sorede) is more mid-story — \"and then\" or \"because of that.\""
                                + "<br><br><strong>まず</strong> (mazu) just means you're starting a list — \"first of all.\""
                        },
                        {
                            title: "Reacting to What You Hear",
                            explain: "<strong>なるほど</strong> (naruhodo) is one of the most common things you'll say in a conversation — \"I see, that makes sense.\""
                                + "<br><br><strong>やっぱり</strong> (yappari) is for when something confirms a suspicion you already had (\"as I thought, after all\")."
                                + "<br><br><strong>あ</strong> (a) is a quick, spontaneous \"oh!\";"
                                + "<br><br><strong>ああ</strong> (aa) is a longer, more thoughtful \"ahh, right.\""
                        },
                        {
                            title: "Hedging & Degree Words",
                            explain: "<strong>多分</strong> (tabun) softens a guess (\"probably\")."
                                + "<br><br><strong>できるだけ</strong> (dekiru dake) means doing the most you're able to (\"as much as possible\")."
                                + "<br><br><strong>それほど</strong> (sorehodo) and <strong>全然</strong> (zenzen) both usually pair with a negative verb — それほど 高くない (\"not THAT expensive\") and 全然 わからない (\"I don't understand AT ALL\") — though in casual modern speech 全然 sometimes shows up before something positive too, which is a fairly recent, informal usage."
                        },
                        {
                            title: "Name Suffixes & Everyday Nouns",
                            explain: "<strong>ちゃん</strong> (chan) is affectionate — for children, close friends, or pets, never for someone you owe respect to."
                                + "<br><br><strong>君（くん）</strong> (kun) is typically used for boys or by someone senior addressing a junior; using it upward (to someone above you) can sound off."
                                + "<br><br><strong>用</strong> (you) shows up constantly on signs and labels meaning \"for [x] use\" — 関係者用 (\"staff only\"), 子供用 (\"for children\")."
                        }
                    ],
                    examples: [
                        { jp: "なるほど、わかりました。", en: "I see, got it." },
                        { jp: "やっぱりそうだね。", en: "Yeah, just as I thought." },
                        { jp: "多分、大丈夫です。", en: "It's probably fine." },
                        { jp: "全然わかりません。", en: "I don't understand at all." }
                    ],
                    vocab: [
                        { jp: "さあ", romaji: "Saa", en: "Well... (hesitation)" },
                        { jp: "あの", romaji: "Ano", en: "Um... / excuse me (getting attention)" },
                        { jp: "えっと", romaji: "Etto", en: "Um, let's see..." },
                        { jp: "うーん", romaji: "Uun", en: "Hmm... (thinking)" },
                        { jp: "それでは", romaji: "Soredewa", en: "Well then / in that case" },
                        { jp: "それで", romaji: "Sorede", en: "And then / because of that" },
                        { jp: "まず", romaji: "Mazu", en: "First of all" },
                        { jp: "なるほど", romaji: "Naruhodo", en: "I see / now I understand" },
                        { jp: "やっぱり", romaji: "Yappari", en: "As I thought / after all" },
                        { jp: "あ", romaji: "A", en: "Ah!/Oh!" },
                        { jp: "ああ", romaji: "Aa", en: "Ah, yes" },
                        { jp: "多分", romaji: "Tabun", en: "Probably/perhaps" },
                        { jp: "できるだけ", romaji: "Dekiru dake", en: "As much as possible" },
                        { jp: "それほど", romaji: "Sorehodo", en: "To that extent/not that much" },
                        { jp: "全然", romaji: "Zenzen", en: "Not at all (+negative)" },
                        { jp: "これから", romaji: "Kore kara", en: "From now on/after this" },
                        { jp: "もし", romaji: "Moshi", en: "If/in case" },
                        { jp: "ちゃん", romaji: "Chan", en: "familiar name suffix (affectionate)" },
                        { jp: "君", romaji: "Kun", en: "familiar name suffix (boys/young men)" },
                        { jp: "用", romaji: "You", en: "Business/errand/use" }
                    ],
                    sources: ["Tofugu — Japanese Greetings and everyday-phrase guides", "Tae Kim's Guide to Japanese Grammar", "Jisho.org"]
                };
            },
            /* No bonus exercise: shelf 03 introduces a full grammar pattern
               (A は B です), not a single drop-in word — preview stays
               exposure-only until shelf 03 itself teaches the pattern. */
            buildMatchExercises: function () {
                return buildMatchExercisesFromBank(this.wordBank, 6);
            }
        };
    }

    /* SHELF 03: A wa B desu */
    function s03() {
        let nm = uPick(NAMES, 2);
        return {
            id: "s03", title: "A は B です", subtitle: "Shelf 03",
            wordBank: {
                subjects: [{ jp: "わたし", en: "I" }, nm[0], nm[1]],
                thingSubjects: [{ jp: "これ", en: "this" }],
                peoplePredicates: [{ jp: "がくせい", en: "student" }, { jp: "せんせい", en: "teacher" }],
                thingPredicates: [{ jp: "ほん", en: "book" }, { jp: "ペン", en: "pen" }],
                preview: [{ jp: "はじめまして", en: "how do you do (first meeting only)", note: "Coming up in shelf 04 — self-introductions" }]
            },
            buildInstruction: function () {
                return {
                    sections: [{
                        title: "A は B です",
                        explain: "Use は to mark the topic and です to make it polite — です changes shape to move the tense: swap it for でした and the whole sentence slides from now to before, nothing else changes. Japanese doesn't have a separate future word either — です already covers 'will be.'",
                        pattern: '<span class="pattern-box__slot">Topic</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">Predicate</span> <span class="pattern-box__fixed">です</span>',
                        culture: "です also makes a sentence sound polite — like how Filipino adds \"po\" or \"opo.\" It doesn't change what you're saying, just how respectful it sounds. Filipino even has its own は: the particle \"ay\" sits right after the topic the same way は does — \"Ako ay guro\" works just like \"Watashi wa sensei.\""
                    }],
                    examples: [
                        { jp: "わたしはがくせいです", romaji: "Watashi wa gakusei desu.", en: "I am a student." },
                        { jp: "これはほんです", romaji: "Kore wa hon desu.", en: "This is a book." },
                        { jp: "これはペンです", romaji: "Kore wa pen desu.", en: "This is a pen." },
                        { jp: "わたしはがくせいでした", romaji: "Watashi wa gakusei deshita.", en: "I was a student." },
                        { jp: "わたしはせんせいです", romaji: "Watashi wa sensei desu.", en: "I am a teacher." }
                    ],
                    vocab: [
                        { jp: "わたし", romaji: "watashi", en: "I/me" }, { jp: "は", romaji: "wa", en: "topic marker" },
                        { jp: "です", romaji: "desu", en: "am/is/are (polite)" }, { jp: "がくせい", romaji: "gakusei", en: "student" },
                        { jp: "これ", romaji: "kore", en: "this (thing near me)" }, { jp: "ほん", romaji: "hon", en: "book" },
                        { jp: "ペン", romaji: "pen", en: "pen" }, { jp: "でした", romaji: "deshita", en: "was/were (polite past)" },
                        { jp: "せんせい", romaji: "sensei", en: "teacher" }
                    ],
                    sources: ["Tae Kim's Guide to Japanese Grammar — です/だ copula chapter", "Genki I — Lesson 1"]
                };
            },
            /* No bonus exercise: shelf 04 is a fixed 3-step template
               (greet/name/close), not a word that drops into an A-は-B-です
               sentence — preview stays exposure-only. */
            buildWordBankExercises: function () {
                let subj = pick(this.wordBank.subjects);
                let pred1 = pick(this.wordBank.peoplePredicates);
                let pred2 = pick(this.wordBank.thingPredicates);
                let thingSubj = this.wordBank.thingSubjects[0];
                return [
                    {
                        prompt: "Write: <strong>" + subj.en + " " + (subj.en === "I" ? "am" : "is") + " a " + pred1.en + "</strong>",
                        accepted: [[subj.jp, "は", pred1.jp, "です"]],
                        hint: subj.jp + " + は + " + pred1.jp + " + です",
                        refWords: [
                            { jp: subj.jp, role: "subject" }, { jp: "は", role: "particle" },
                            { jp: pred1.jp, role: "predicate" }, { jp: "です", role: "auxiliary" }
                        ]
                    },
                    {
                        prompt: "Write: <strong>This is a " + pred2.en + "</strong>",
                        accepted: [[thingSubj.jp, "は", pred2.jp, "です"]],
                        hint: thingSubj.jp + " + は + " + pred2.jp + " + です",
                        refWords: [
                            { jp: thingSubj.jp, role: "subject" }, { jp: "は", role: "particle" },
                            { jp: pred2.jp, role: "predicate" }, { jp: "です", role: "auxiliary" }
                        ]
                    }
                ];
            }
        };
    }

    /* SHELF 04: Self Introduction */
    function s04() {
        return {
            id: "s04", title: "Self Introduction", subtitle: "Shelf 04",
            wordBank: {
                names: uPick(NAMES, 2),
                preview: [{ jp: "それ", en: "that (near you)", note: "Coming up in shelf 05 — demonstratives" }]
            },
            buildInstruction: function () {
                let nm = this.wordBank.names[0];
                return {
                    sections: [{
                        title: "自己紹介 (jikoshoukai) — Self-Intro",
                        explain: "A Japanese self-introduction always follows the exact same 3-step shape — like a knock-knock joke: everyone already knows the shape, so you just fill in your own punchline (your name) in the middle. 1) Greet — はじめまして, said only at a first meeting. 2) Name — わたしは [name] です, the pattern from the last shelf, put to work. 3) Close — よろしくお願いします, every time.",
                        pattern: '<span class="pattern-box__fixed">はじめまして</span> → <span class="pattern-box__slot">わたしは [name] です</span> → <span class="pattern-box__fixed">よろしくお願いします</span>',
                        culture: "Jikoshoukai isn't just small talk — it's treated like a small ritual, given standing up (often with a slight bow) on a first day at school/work, or when meeting someone through a mutual connection. よろしくお願いします doesn't really translate into English — it's closer to \"please treat me well going forward,\" and saying it at the end of a self-introduction is basically mandatory, not optional politeness."
                    }],
                    examples: [
                        { jp: "はじめまして。お名前は何ですか。", romaji: "Hajimemashite. O-namae wa nan desu ka.", en: "How do you do. What is your name?" },
                        { jp: "わたしは" + nm.jp + "です。", romaji: "Watashi wa " + nm.jp + " desu.", en: "I am " + nm.en + "." },
                        { jp: nm.jp + "さん、よろしくお願いします！", romaji: nm.jp + "-san, yoroshiku onegaishimasu!", en: "Nice to meet you, " + nm.en + "!" }
                    ],
                    vocab: [
                        { jp: "お名前", romaji: "o-namae", en: "name (polite)" },
                        { jp: "何", romaji: "nan", en: "what" },
                        { jp: "か", romaji: "ka", en: "question marker" }
                    ],
                    sources: ["Tofugu — jikoshoukai (self-introduction) etiquette guide", "Tae Kim's Guide to Japanese Grammar"]
                };
            },
            /* No bonus exercise: shelf 05's demonstratives don't slot into the
               fixed self-intro template — preview stays exposure-only. */
            buildWordBankExercises: function () {
                let nm = pick(this.wordBank.names);
                return [
                    {
                        prompt: "Write: <strong>I am " + nm.en + "</strong>",
                        accepted: [["わたし", "は", nm.jp, "です"]],
                        hint: "わたしは + " + nm.jp + " + です",
                        refWords: [
                            { jp: "わたし", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: nm.jp, role: "name" }, { jp: "です", role: "auxiliary" }
                        ]
                    },
                    {
                        prompt: "Write: <strong>Nice to meet you</strong>",
                        accepted: [["よろしくお願いします"], ["はじめまして"]],
                        hint: "よろしくお願いします",
                        refWords: [{ jp: "よろしくお願いします", role: "greeting" }]
                    }
                ];
            }
        };
    }

    /* SHELF 05: Demonstratives */
    function s05() {
        return {
            id: "s05", title: "Demonstratives", subtitle: "Shelf 05",
            wordBank: {
                demonstratives: [{ jp: "これ", en: "this" }, { jp: "それ", en: "that (near you)" }, { jp: "あれ", en: "that (over there)" }],
                nouns: [{ jp: "ほん", en: "book" }, { jp: "ペン", en: "pen" }],
                creatures: [{ jp: "ねこ", en: "cat" }],
                preview: [{ jp: "だれ", en: "who", note: "Coming up in shelf 06 — question words + か" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "こそあど System",
                            explain: "Japanese picks 'this/that' based on distance, not just what the object is — like a 3-ring dartboard centered on YOU, the speaker: the bullseye ring is yours, the middle ring belongs to whoever you're talking to, and everything outside that is 'over there,' full stop. Two shapes per distance: これ/それ/あれ stand alone ('this one'), while この/その/あの attach directly in front of a noun ('this ___').",
                            pattern: '<span class="pattern-box__slot">This/That</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">です</span>'
                        },
                        {
                            title: "これ vs この",
                            explain: "これ IS the subject — like pointing at something and saying 'this one,' the whole subject, done. この can't be the subject alone — it's like pointing while your hand is already resting on a noun: 'this ___' only becomes the subject once you name what '___' is. That's why これはペンです works alone, but この always needs a noun glued to it (このペン, 'this pen'), and THAT whole phrase is what は marks as the topic."
                        },
                        {
                            title: "Talking about places — ここ/そこ/あそこ/どこ",
                            explain: "Same distance rules, now for location: ここ (here, near you), そこ (there, near the listener), あそこ (over there, far from both), どこ (where?)."
                        },
                        {
                            title: "Polite direction words — こちら/そちら/あちら/どちら",
                            explain: "The polite versions of これ/それ/あれ/どれ — same distance rules, softer tone. Common on signs, in shops, and when politely introducing someone ('こちらは〜です' = 'this is ~')."
                        }
                    ],
                    examples: [
                        { jp: "これはほんです", romaji: "Kore wa hon desu.", en: "This is a book. (near you)" },
                        { jp: "それはペンです", romaji: "Sore wa pen desu.", en: "That is a pen. (near the listener)" },
                        { jp: "あれはほんです", romaji: "Are wa hon desu.", en: "That over there is a book. (far from both)" },
                        { jp: "このペンはわたしのです", romaji: "Kono pen wa watashi no desu.", en: "This pen is mine." },
                        { jp: "ねこはどこですか", romaji: "Neko wa doko desu ka?", en: "Where is the cat?" },
                        { jp: "こちらはたなかさんです", romaji: "Kochira wa Tanaka-san desu.", en: "This is Tanaka-san. (polite)" },
                        { jp: "えきはどちらですか", romaji: "Eki wa dochira desu ka?", en: "Which way is the station?" }
                    ],
                    vocab: [
                        { jp: "それ", romaji: "sore", en: "that (near listener)" }, { jp: "あれ", romaji: "are", en: "that over there" },
                        { jp: "どれ", romaji: "dore", en: "which one" }, { jp: "この", romaji: "kono", en: "this ~ (+noun)" },
                        { jp: "その", romaji: "sono", en: "that ~ (+noun)" }, { jp: "あの", romaji: "ano", en: "that ~ over there (+noun)" },
                        { jp: "どの", romaji: "dono", en: "which ~ (+noun)" }, { jp: "ここ", romaji: "koko", en: "here (near you)" },
                        { jp: "そこ", romaji: "soko", en: "there (near listener)" }, { jp: "あそこ", romaji: "asoko", en: "over there (far from both)" },
                        { jp: "どこ", romaji: "doko", en: "where" }, { jp: "こちら", romaji: "kochira", en: "this (polite)/this way" },
                        { jp: "そちら", romaji: "sochira", en: "that (polite)/that way" }, { jp: "あちら", romaji: "achira", en: "that over there (polite)" },
                        { jp: "どちら", romaji: "dochira", en: "which way (polite)" }, { jp: "の", romaji: "no", en: "'s / mine (possessive)" }
                    ],
                    sources: ["Tae Kim's Guide to Japanese Grammar — こそあど chapter", "Wasabi — Japanese demonstrative pronouns guide"]
                };
            },
            buildWordBankExercises: function () {
                let dem = pick(this.wordBank.demonstratives);
                let noun = pick(this.wordBank.nouns);
                let creature = this.wordBank.creatures[0];
                let exercises = [
                    {
                        prompt: "Write: <strong>" + dem.en.charAt(0).toUpperCase() + dem.en.slice(1) + " is a " + noun.en + "</strong>",
                        accepted: [[dem.jp, "は", noun.jp, "です"]],
                        hint: dem.jp + " + は + " + noun.jp + " + です",
                        refWords: [
                            { jp: dem.jp, role: "demonstrative" }, { jp: "は", role: "particle" },
                            { jp: noun.jp, role: "predicate" }, { jp: "です", role: "auxiliary" }
                        ]
                    },
                    {
                        prompt: "Write: <strong>Where is the " + creature.en + "?</strong>",
                        accepted: [[creature.jp, "は", "どこ", "ですか"]],
                        hint: creature.jp + "はどこですか",
                        refWords: [
                            { jp: creature.jp, role: "subject" }, { jp: "は", role: "particle" },
                            { jp: "どこ", role: "question" }, { jp: "ですか", role: "auxiliary" }
                        ]
                    }
                ];
                /* Bonus: sneak peek at shelf 06's だれ (this lesson's own
                   どこですか example above already introduces か itself). */
                let preview = this.wordBank.preview && this.wordBank.preview[0];
                if (preview) {
                    exercises.push({
                        prompt: "(bonus — sneak peek: shelf 06) Write: <strong>Who is the cat?</strong>",
                        accepted: [[creature.jp, "は", preview.jp, "ですか"]],
                        hint: creature.jp + "は" + preview.jp + "ですか",
                        refWords: [
                            { jp: creature.jp, role: "subject" }, { jp: "は", role: "particle" },
                            { jp: preview.jp, role: "question" }, { jp: "ですか", role: "auxiliary" }
                        ]
                    });
                }
                return exercises;
            }
        };
    }

    /* SHELF 06: Questions */
    function s06() {
        return {
            id: "s06", title: "Questions (か)", subtitle: "Shelf 06",
            wordBank: {
                topics: [{ jp: "せんせい", en: "the teacher" }, { jp: "これ", en: "this" }, { jp: "たんじょうび", en: "your birthday" }],
                questionWords: [{ jp: "だれ", en: "who" }, { jp: "いくら", en: "how much" }, { jp: "いつ", en: "when" }],
                preview: [{ jp: "ひとつ", en: "one (thing)", note: "Coming up in shelf 07 — numbers & counters" }]
            },
            buildInstruction: function () {
                return {
                    sections: [{
                        title: "Statement + か？",
                        explain: "One tiny particle turns any calm statement into a question — nothing else moves, like the sound of a question mark. Two ways to use it: tack it onto a plain yes/no statement (これはほんです → これはほんですか, 'Is this a book?'), or tack it onto a sentence that already has a question word in it (せんせいはどこです → …どこですか, 'Where is the teacher?'). Either way, word order never changes — か always goes at the very end.",
                        pattern: '<span class="pattern-box__slot">Statement</span> <span class="pattern-box__fixed">か</span>'
                    }],
                    examples: [
                        { jp: "これはほんですか", romaji: "Kore wa hon desu ka?", en: "Is this a book?" },
                        { jp: "はい、そうです。", romaji: "Hai, sou desu.", en: "Yes, that's right." },
                        { jp: "いいえ、ちがいます。ほんです。", romaji: "Iie, chigaimasu. Hon desu.", en: "No, that's wrong. It's a book." },
                        { jp: "せんせいはだれですか", romaji: "Sensei wa dare desu ka?", en: "Who is the teacher?" },
                        { jp: "たんじょうびはいつですか", romaji: "Tanjoubi wa itsu desu ka?", en: "When is your birthday?" },
                        { jp: "これはいくらですか", romaji: "Kore wa ikura desu ka?", en: "How much is this?" },
                        { jp: "どうしてですか", romaji: "Doushite desu ka?", en: "Why? (casual, spoken)" }
                    ],
                    vocab: [
                        { jp: "か", romaji: "ka", en: "question marker" }, { jp: "だれ", romaji: "dare", en: "who" },
                        { jp: "いつ", romaji: "itsu", en: "when" }, { jp: "どうして", romaji: "doushite", en: "why (casual)" },
                        { jp: "なぜ", romaji: "naze", en: "why (formal)" }, { jp: "いくつ", romaji: "ikutsu", en: "how many" },
                        { jp: "いくら", romaji: "ikura", en: "how much (price)" }, { jp: "はい", romaji: "hai", en: "yes" },
                        { jp: "いいえ", romaji: "iie", en: "no" }, { jp: "そうです", romaji: "sou desu", en: "that's right" },
                        { jp: "ちがいます", romaji: "chigaimasu", en: "that's wrong" }
                    ],
                    sources: ["Tae Kim's Guide to Japanese Grammar (か)", "Bunpro か entry"]
                };
            },
            /* No bonus exercise: shelf 07's counters need their own +ひとつ-style
               grammar (which noun takes which counter) — preview stays
               exposure-only until shelf 07 teaches it.
               Topic/question-word pairs below are curated (not a free
               cross-product) so every generated question stays semantically valid. */
            buildWordBankExercises: function () {
                let wb = this.wordBank;
                let pairs = [
                    { topic: wb.topics[0], q: wb.questionWords[0] },
                    { topic: wb.topics[1], q: wb.questionWords[1] },
                    { topic: wb.topics[2], q: wb.questionWords[2] }
                ];
                let p = pick(pairs);
                return [
                    {
                        prompt: "Write: <strong>Who/how much/when is " + p.topic.en + "?</strong> (use — " + p.q.en + ")",
                        accepted: [[p.topic.jp, "は", p.q.jp, "ですか"]],
                        hint: p.topic.jp + "は" + p.q.jp + "ですか",
                        refWords: [
                            { jp: p.topic.jp, role: "subject" }, { jp: "は", role: "particle" },
                            { jp: p.q.jp, role: "question" }, { jp: "ですか", role: "auxiliary" }
                        ]
                    }
                ];
            }
        };
    }

    /* SHELF 07: Numbers & Counters */
    function s07() {
        return {
            id: "s07", title: "Numbers & Counters", subtitle: "Shelf 07",
            wordBank: {
                nouns: [{ jp: "りんご", en: "apple" }, { jp: "ねこ", en: "cat" }, { jp: "いま", en: "it (now)" }],
                counters: [{ jp: "ひとつ", en: "one" }, { jp: "さんびき", en: "three" }, { jp: "よじ", en: "4 o'clock" }],
                preview: [{ jp: "あります", en: "there is (things)", note: "Coming up in shelf 08 — places & directions" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Counting Things, Animals & Time",
                            explain: "Japanese numbers are built like Lego blocks — learn 1 through 10, and you can build every number up to 100 just by combining them. にじゅう (20) is just に (2) + じゅう (10) stuck together — 'two tens.' A few numbers have two readings depending on context (4, 7, 9), and counter words shift sounds a little.",
                            pattern: '<span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">Number + Counter</span> <span class="pattern-box__fixed">です</span>'
                        },
                        {
                            title: "つ counter — everyday objects",
                            explain: "When you count everyday objects — apples, boxes, cups, anything without its own special counter — Japanese uses an entirely different, older set of number words ending in つ. This 'つ series' only goes up to 10 — for 11 and higher, people just switch back to the plain numbers. ひとつ, ふたつ, みっつ... these don't look like いち, に, さん at all — they're their own set to memorize."
                        },
                        {
                            title: "匹 counter — small animals",
                            explain: "Small animals — cats, dogs, fish, bugs — get their own counter, 匹 (hiki), attached directly after the number. 匹's sound shifts and reads ひき, びき, or ぴき — the same way English 'a' becomes 'an' before a vowel. One cat is いっぴき, not いちひき — the sound genuinely changes, so learn each one by ear."
                        },
                        {
                            title: "時 (hour) and 分 (minute)",
                            explain: "To say 'o'clock,' attach 時 (じ) directly after the number. Most hours use the plain number readings — but 4, 7, and 9 o'clock swap to special readings: よじ (not よんじ), しちじ (not ななじ), くじ (not きゅうじ). Minutes attach the same way — but 分's sound shifts around even more, reading ふん or ぷん. 'What minute?' is 何分 (なんぷん)."
                        }
                    ],
                    examples: [
                        { jp: "りんごはひとつです", romaji: "Ringo wa hitotsu desu.", en: "There is one apple." },
                        { jp: "りんごはみっつです", romaji: "Ringo wa mittsu desu.", en: "There are three apples." },
                        { jp: "ねこはいっぴきです", romaji: "Neko wa ippiki desu.", en: "There is one cat." },
                        { jp: "ねこはさんびきです", romaji: "Neko wa sanbiki desu.", en: "There are three cats." },
                        { jp: "いまはよじです", romaji: "Ima wa yoji desu.", en: "It's 4 o'clock now." },
                        { jp: "いまはくじです", romaji: "Ima wa kuji desu.", en: "It's 9 o'clock now." },
                        { jp: "いまはさんじじゅっぷんです", romaji: "Ima wa sanji juppun desu.", en: "It's 3:10 now." }
                    ],
                    vocab: [
                        { jp: "いち〜じゅう", romaji: "ichi–juu", en: "1–10" }, { jp: "にじゅう〜きゅうじゅう", romaji: "nijuu–kyuujuu", en: "20–90 (tens)" },
                        { jp: "ひゃく", romaji: "hyaku", en: "100" },
                        { jp: "ひとつ〜とお", romaji: "hitotsu–too", en: "1–10 (general-things つ counter)" },
                        { jp: "いっぴき〜じゅっぴき", romaji: "ippiki–juppiki", en: "1–10 (small-animal 匹 counter)" },
                        { jp: "いちじ〜じゅうにじ", romaji: "ichiji–juuniji", en: "1:00–12:00 (hours)" },
                        { jp: "いっぷん〜じゅっぷん、なんぷん", romaji: "ippun–juppun, nanpun", en: "minutes, and 'what minute?'" }
                    ],
                    sources: ["Tofugu numbers/counters guide", "Jisho.org"]
                };
            },
            /* No bonus exercise: shelf 08's あります/います needs its own
               location grammar — preview stays exposure-only.
               Noun i is paired with counter i — the noun/counter pairing is fixed,
               only which pair gets asked is random. */
            buildWordBankExercises: function () {
                let wb = this.wordBank;
                let i = Math.floor(Math.random() * wb.nouns.length);
                let noun = wb.nouns[i];
                let counter = wb.counters[i];
                return [
                    {
                        prompt: "Write: <strong>" + noun.en.charAt(0).toUpperCase() + noun.en.slice(1) + " — " + counter.en + "</strong>",
                        accepted: [[noun.jp, "は", counter.jp, "です"]],
                        hint: noun.jp + "は" + counter.jp + "です",
                        refWords: [
                            { jp: noun.jp, role: "subject" }, { jp: "は", role: "particle" },
                            { jp: counter.jp, role: "counter" }, { jp: "です", role: "auxiliary" }
                        ]
                    }
                ];
            }
        };
    }

    /* SHELF 08: Places and Directions */
    function s08() {
        return {
            id: "s08", title: "Places & Directions", subtitle: "Shelf 08",
            wordBank: {
                subjects: [{ jp: "としょかん", en: "the library" }, { jp: "ねこ", en: "the cat" }, { jp: "レストラン", en: "the restaurant" }],
                places: [{ jp: "がっこう", en: "the school" }, { jp: "き", en: "the tree" }, { jp: "こうえん", en: "the park" }],
                directions: [{ jp: "ちかく", en: "near" }, { jp: "した", en: "under" }, { jp: "となり", en: "next to" }],
                verbs: [{ jp: "あります", en: "arimasu (things)" }, { jp: "います", en: "imasu (living things)" }],
                preview: [{ jp: "あなた", en: "you", note: "Coming up in shelf 09 — nouns & pronouns" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "There is/are — あります / います",
                            explain: "います is for things that are truly alive and can move around on their own: people (せんせい、がくせい) and animals (ねこ、いぬ) — if it could get up and walk away, use います. あります is for everything else: objects, places — but also plants! A tree is alive, but it can't move itself, so even a living plant still takes あります, not います. The real test isn't 'is it alive?' — it's 'can it walk away on its own?'",
                            pattern: '<span class="pattern-box__slot">Thing</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">Place</span> <span class="pattern-box__fixed">に あります/います</span>'
                        },
                        {
                            title: "Direction words",
                            explain: "These describe where something is relative to something else: [Thing]は [something]の [direction]に あります — 前 (front), 後ろ (behind), 右 (right), 左 (left), 隣 (next to), 近く (near), 上 (above), 下 (below). 中/外 ('inside'/'outside') only make sense next to a container."
                        },
                        {
                            title: "Movement words",
                            explain: "Actually walking somewhere needs a different kind of word — not 'where something is,' but 'which way to go.' あっち・こっち・どっち are the everyday/casual counterparts of shelf 05's こちら・そちら・あちら・どちら."
                        }
                    ],
                    examples: [
                        { jp: "としょかんはがっこうのちかくにあります", romaji: "Toshokan wa gakkou no chikaku ni arimasu.", en: "The library is near the school." },
                        { jp: "ねこはきのしたにいます", romaji: "Neko wa ki no shita ni imasu.", en: "The cat is under the tree." },
                        { jp: "ほんはねこの隣にあります", romaji: "Hon wa neko no tonari ni arimasu.", en: "The book is next to the cat." },
                        { jp: "ほんははこの中にあります", romaji: "Hon wa hako no naka ni arimasu.", en: "The book is inside the box." },
                        { jp: "レストランはこうえんの隣にあります", romaji: "Resutoran wa kouen no tonari ni arimasu.", en: "The restaurant is next to the park." }
                    ],
                    vocab: [
                        { jp: "がっこう", romaji: "gakkou", en: "school" }, { jp: "えき", romaji: "eki", en: "station" },
                        { jp: "としょかん", romaji: "toshokan", en: "library" }, { jp: "びょういん", romaji: "byouin", en: "hospital" },
                        { jp: "レストラン", romaji: "resutoran", en: "restaurant" }, { jp: "こうえん", romaji: "kouen", en: "park" },
                        { jp: "ほんや", romaji: "honya", en: "bookstore" }, { jp: "ぎんこう", romaji: "ginkou", en: "bank" },
                        { jp: "うち", romaji: "uchi", en: "home" }, { jp: "はこ", romaji: "hako", en: "box" },
                        { jp: "あります", romaji: "arimasu", en: "there is (things, places)" }, { jp: "います", romaji: "imasu", en: "there is (people, animals)" },
                        { jp: "前", romaji: "mae", en: "in front of" }, { jp: "後ろ", romaji: "ushiro", en: "behind" },
                        { jp: "右", romaji: "migi", en: "right of" }, { jp: "左", romaji: "hidari", en: "left of" },
                        { jp: "隣", romaji: "tonari", en: "next to" }, { jp: "近く", romaji: "chikaku", en: "near" },
                        { jp: "上", romaji: "ue", en: "above" }, { jp: "下", romaji: "shita", en: "below" },
                        { jp: "中", romaji: "naka", en: "inside" }, { jp: "外", romaji: "soto", en: "outside" },
                        { jp: "まっすぐ", romaji: "massugu", en: "straight ahead" }, { jp: "曲がります", romaji: "magarimasu", en: "to turn" },
                        { jp: "行きます", romaji: "ikimasu", en: "to go" }, { jp: "あっち", romaji: "acchi", en: "that way (casual)" },
                        { jp: "こっち", romaji: "kocchi", en: "this way (casual)" }, { jp: "どっち", romaji: "docchi", en: "which way (casual)" },
                        { jp: "北", romaji: "kita", en: "north" }, { jp: "南", romaji: "minami", en: "south" },
                        { jp: "東", romaji: "higashi", en: "east" }, { jp: "西", romaji: "nishi", en: "west" },
                        { jp: "木", romaji: "ki", en: "tree" }
                    ],
                    sources: ["Tae Kim's Guide (あります／います, location particles)", "Genki I — Lesson 5"]
                };
            },
            /* Index i ties subject/place/direction/verb into one sensible sentence
               (a library "near" the school, a cat "under" a tree, a restaurant "next to" a park). */
            buildWordBankExercises: function () {
                let wb = this.wordBank;
                let i = Math.floor(Math.random() * wb.subjects.length);
                let subj = wb.subjects[i], place = wb.places[i], dir = wb.directions[i], verb = wb.verbs[i === 1 ? 1 : 0];
                let exercises = [
                    {
                        prompt: "Write: <strong>" + subj.en.charAt(0).toUpperCase() + subj.en.slice(1) + " is " + dir.en + " " + place.en + "</strong>",
                        accepted: [[subj.jp, "は", place.jp, "の", dir.jp, "に", verb.jp]],
                        hint: subj.jp + "は" + place.jp + "の" + dir.jp + "に" + verb.jp,
                        refWords: [
                            { jp: subj.jp, role: "subject" }, { jp: "は", role: "particle" },
                            { jp: place.jp, role: "object" }, { jp: "の", role: "particle" },
                            { jp: dir.jp, role: "object" }, { jp: "に", role: "particle" },
                            { jp: verb.jp, role: "predicate" }
                        ]
                    }
                ];
                /* Bonus: sneak peek at shelf 09's あなた, slotted in as the subject
                   of an います (person) sentence — clean fit with this lesson's own pattern. */
                let preview = wb.preview && wb.preview[0];
                if (preview) {
                    let place2 = pick([wb.places[0], wb.places[2]]);
                    exercises.push({
                        prompt: "(bonus — sneak peek: shelf 09) Write: <strong>You are at " + place2.en + "</strong>",
                        accepted: [[preview.jp, "は", place2.jp, "に", "います"]],
                        hint: preview.jp + "は" + place2.jp + "にいます",
                        refWords: [
                            { jp: preview.jp, role: "subject" }, { jp: "は", role: "particle" },
                            { jp: place2.jp, role: "object" }, { jp: "に", role: "particle" }, { jp: "います", role: "predicate" }
                        ]
                    });
                }
                return exercises;
            }
        };
    }

    /* SHELF 09: Nouns & Pronouns — PILOT LESSON for the header-dropdown /
       full-content / next-lesson-preview pass. Content ported verbatim from
       LESSON_CONTENT['shelf-09'] in n5-phaser-game.js. */
    function s09() {
        return {
            id: "s09", title: "Nouns & Pronouns", subtitle: "Shelf 09",
            wordBank: {
                people: uPick(NAMES, 2),
                things: [{ jp: "ともだち", en: "friend" }, { jp: "ほん", en: "book" }, { jp: "ねこ", en: "cat" }],
                /* Next-lesson preview (shelf 10, い-adjectives) — shown for exposure
                   and usable in this lesson's bonus exercise below. */
                preview: [{ jp: "おおきい", en: "big", note: "Coming up in shelf 10 — い-adjectives" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Nouns & Pronouns",
                            explain: "A noun (めいし) names a person, place, or thing: 本 (hon, book), 友達 (tomodachi, friend). A pronoun stands in for a noun, like 私 (watashi, I) instead of your own name.",
                            pattern: '<span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">description</span> <span class="pattern-box__fixed">です</span> &mdash; any noun or pronoun can be the subject of this pattern.'
                        },
                        {
                            title: "Casual pronouns",
                            explain: "僕 and 君 are casual, everyday versions of 私 and あなた — used with friends and family, not in polite/formal speech."
                        },
                        {
                            title: "“What kind of...?” — こんな / そんな / あんな / どんな",
                            explain: "These words also attach directly before a noun, but ask about KIND instead of pointing at a specific thing — こんな本 ('this kind of book') vs. この本 ('this [specific] book')."
                        },
                        {
                            title: "自分 — pointing back at the subject",
                            explain: "自分 can point back to whoever the sentence is already about — '自分の家族' means 'my own family' if you're speaking, or 'their own family' if the sentence is about someone else."
                        }
                    ],
                    examples: [
                        { jp: "みなさん、おはようございます", romaji: "Mina-san, ohayou gozaimasu.", en: "Everyone, good morning." },
                        { jp: "あなたはせんせいですか？", romaji: "Anata wa sensei desu ka?", en: "Are you a teacher?" },
                        { jp: "あの人は私の友達です", romaji: "Ano hito wa watashi no tomodachi desu.", en: "That person is my friend." },
                        { jp: "この子供は私の家族です", romaji: "Kono kodomo wa watashi no kazoku desu.", en: "This child is my family." },
                        { jp: "これは私の本です", romaji: "Kore wa watashi no hon desu.", en: "This is my book." },
                        { jp: "そのかばんは彼のじゃないです", romaji: "Sono kaban wa kare no ja nai desu.", en: "That bag is not his." },
                        { jp: "僕はせんせいです", romaji: "Boku wa sensei desu.", en: "I am a teacher. (casual, male speaker)" },
                        { jp: "君の家族は元気ですか", romaji: "Kimi no kazoku wa genki desu ka.", en: "Is your family doing well?" },
                        { jp: "彼らは友達です", romaji: "Karera wa tomodachi desu.", en: "They are friends." },
                        { jp: "こんな本です", romaji: "Konna hon desu.", en: "It's this kind of book." },
                        { jp: "どんな人ですか", romaji: "Donna hito desu ka.", en: "What kind of person is it?" }
                    ],
                    vocab: [
                        { jp: "あなた", romaji: "anata", en: "you" }, { jp: "彼", romaji: "kare", en: "he/him" },
                        { jp: "彼女", romaji: "kanojo", en: "she/her" }, { jp: "私たち", romaji: "watashitachi", en: "we/us" },
                        { jp: "みなさん", romaji: "mina-san", en: "everyone" }, { jp: "人", romaji: "hito", en: "person" },
                        { jp: "子供", romaji: "kodomo", en: "child" }, { jp: "友達", romaji: "tomodachi", en: "friend" },
                        { jp: "家族", romaji: "kazoku", en: "family" }, { jp: "本", romaji: "hon", en: "book" },
                        { jp: "かばん", romaji: "kaban", en: "bag" }, { jp: "時計", romaji: "tokei", en: "clock/watch" },
                        { jp: "僕", romaji: "boku", en: "I/me (casual, male)" }, { jp: "君", romaji: "kimi", en: "you (casual)" },
                        { jp: "彼ら", romaji: "karera", en: "they/them" }, { jp: "こんな", romaji: "konna", en: "this kind of..." },
                        { jp: "そんな", romaji: "sonna", en: "that kind of..." }, { jp: "あんな", romaji: "anna", en: "that kind of... (over there)" },
                        { jp: "どんな", romaji: "donna", en: "what kind of...?" }, { jp: "色んな", romaji: "ironna", en: "various" },
                        { jp: "誰か", romaji: "dareka", en: "someone/somebody" }, { jp: "自分", romaji: "jibun", en: "myself/yourself/oneself" },
                        { jp: "こう", romaji: "kou", en: "this way (doing something)" }
                    ],
                    sources: ["Tae Kim's Guide to Japanese Grammar (pronouns)", "Wasabi Japanese pronouns guide"]
                };
            },
            buildWordBankExercises: function () {
                let wb = this.wordBank;
                let name = pick(wb.people);
                let thing = pick(wb.things);
                let exercises = [
                    {
                        prompt: "Write: <strong>This is " + name.en + "'s " + thing.en + "</strong>",
                        accepted: [["これ", "は", name.jp, "の", thing.jp, "です"]],
                        hint: "これは" + name.jp + "の" + thing.jp + "です",
                        refWords: [
                            { jp: "これ", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: name.jp, role: "name" }, { jp: "の", role: "particle" },
                            { jp: thing.jp, role: "predicate" }, { jp: "です", role: "auxiliary" }
                        ]
                    },
                    {
                        prompt: "Write: <strong>That person is my friend</strong>",
                        accepted: [["あの", "ひと", "は", "わたし", "の", "ともだち", "です"]],
                        hint: "あのひとはわたしのともだちです",
                        refWords: [
                            { jp: "あのひと", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: "わたし", role: "subject" }, { jp: "の", role: "particle" },
                            { jp: "ともだち", role: "predicate" }, { jp: "です", role: "auxiliary" }
                        ]
                    }
                ];
                /* Bonus: sneak peek at shelf 10's い-adjective, slotted into this
                   lesson's own の-possessive pattern (adjective directly modifies
                   the noun — grammatically valid without needing shelf 10's rules). */
                let preview = wb.preview && wb.preview[0];
                if (preview) {
                    let name2 = pick(wb.people);
                    let thing2 = pick(wb.things);
                    exercises.push({
                        prompt: "(bonus — sneak peek: shelf 10) Write: <strong>This is " + name2.en + "'s " + preview.en + " " + thing2.en + "</strong>",
                        accepted: [["これ", "は", name2.jp, "の", preview.jp, thing2.jp, "です"]],
                        hint: "これは" + name2.jp + "の" + preview.jp + thing2.jp + "です",
                        refWords: [
                            { jp: "これ", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: name2.jp, role: "name" }, { jp: "の", role: "particle" },
                            { jp: preview.jp, role: "adjective" }, { jp: thing2.jp, role: "predicate" }, { jp: "です", role: "auxiliary" }
                        ]
                    });
                }
                return exercises;
            }
        };
    }

    /* SHELF 10: Adjectives */
    function s10() {
        return {
            id: "s10", title: "Adjectives", subtitle: "Shelf 10",
            wordBank: {
                iAdjectives: [
                    { jp: "おおきい", en: "big" }, { jp: "ちいさい", en: "small" },
                    { jp: "あたらしい", en: "new" }, { jp: "ふるい", en: "old" },
                    { jp: "たかい", en: "expensive" }, { jp: "たのしい", en: "fun" }
                ],
                naAdjectives: [
                    { jp: "しずか", en: "quiet" }, { jp: "きれい", en: "beautiful" }, { jp: "ゆうめい", en: "famous" }
                ],
                preview: [{ jp: "読みます", en: "read", note: "Coming up in shelf 11 — verbs" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "い-adjectives vs な-adjectives",
                            explain: "い-adjective: ends in い (大きい, 赤い) — conjugates on its own, です is just politeness. な-adjective: doesn't end in い (静か, 好き) — behaves like a noun, needs です to attach. Both still slot into the same [Noun]は[adjective]です pattern — the difference only shows up when you negate them.",
                            pattern: '<span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">Adjective</span> <span class="pattern-box__fixed">です</span>'
                        },
                        {
                            title: "い-adjective negation",
                            explain: "Drop the final い and add くないです — 小さい becomes 小さくないです ('is not small'). 良い is the one exception: it conjugates from its older form よい, so 'not good' is よくないです, never いくないです."
                        },
                        {
                            title: "Watch out — fake い-adjectives",
                            explain: "A few words end in い by coincidence, not because they're い-adjectives: きれい, きらい, 有名(ゆうめい) — they're actually な-adjectives: negate with じゃないです, never くない. When in doubt, checking a な-adjective vocab list beats guessing from spelling."
                        },
                        {
                            title: "な-adjective negation and the two sentence shapes",
                            explain: "な-adjectives negate exactly like nouns do — just attach じゃないです (or the more formal ではありません). Two shapes: attributive (静かな図書館, 'a quiet library' — な glues straight onto the noun, no です) vs. predicate (図書館は静かです, 'the library is quiet' — です does the 'is' job, な disappears entirely). な belongs to the noun that follows it, not to です."
                        },
                        {
                            title: "Adverbs",
                            explain: "An adverb sits right before the word it describes. い-adjective → adverb: drop い, add く (大きい → 大きく, 'big' → 'greatly'; よい is irregular — always from よ, never いい). な-adjective → adverb: just add に (静か → 静かに, 'quiet' → 'quietly')."
                        },
                        {
                            title: "い-adjective past tense",
                            explain: "です/でした never attach directly to an い-adjective — the tense always lives INSIDE the adjective itself. Past affirmative: drop い, add かった (大きかったです, 'it was big'). Past negative: drop い, add くなかった (大きくなかったです, 'it was not big')."
                        },
                        {
                            title: "な-adjectives (and nouns) have a 4-way copula family",
                            explain: "Unlike い-adjectives, な-adjectives and nouns lean entirely on です/でした/じゃ for tense and negation — you already know 静かです and 静かじゃないです; じゃありません is the same negative, just more neutral/formal than じゃないです (both correct, じゃないです leans slightly casual). でした and じゃありませんでした fill in the two past forms: 静かでした ('was quiet'), 静かじゃなかったです / 静かじゃありませんでした ('was not quiet')."
                        },
                        {
                            title: "The plain (casual) register: だ instead of です",
                            explain: "Drop です down to plain speech and it becomes だ — everything else contracts the same way: 静かだ ('is quiet,' plain), 静かだった ('was quiet,' plain), 静かじゃない / 静かではない ('is not quiet,' plain), 静かじゃなかった / 静かではなかった ('was not quiet,' plain). じゃ isn't its own separate word here — it only ever shows up glued to ない, so the negative conjugates as じゃなかった, built the same drop-then-add way an い-adjective would."
                        }
                    ],
                    examples: [
                        { jp: "本は大きいです", romaji: "Hon wa ookii desu.", en: "The book is big." },
                        { jp: "これは新しい時計です", romaji: "Kore wa atarashii tokei desu.", en: "This clock is new." },
                        { jp: "この本は小さくないです", romaji: "Kono hon wa chiisakunai desu.", en: "This book is not small." },
                        { jp: "図書館は静かです", romaji: "Toshokan wa shizuka desu.", en: "The library is quiet." },
                        { jp: "これは便利じゃないです", romaji: "Kore wa benri ja nai desu.", en: "This isn't convenient." },
                        { jp: "あの先生は有名じゃないです", romaji: "Ano sensei wa yuumei ja nai desu.", en: "That teacher isn't famous." },
                        { jp: "この本はとても大きいです", romaji: "Kono hon wa totemo ookii desu.", en: "This book is very big." },
                        { jp: "図書館は静かでした", romaji: "Toshokan wa shizuka deshita.", en: "The library was quiet. (past)" },
                        { jp: "静かだ", romaji: "Shizuka da.", en: "It's quiet. (plain/casual register)" }
                    ],
                    vocab: [
                        { jp: "大きい", romaji: "ookii", en: "big" }, { jp: "小さい", romaji: "chiisai", en: "small" },
                        { jp: "赤い", romaji: "akai", en: "red" }, { jp: "青い", romaji: "aoi", en: "blue" },
                        { jp: "新しい", romaji: "atarashii", en: "new" }, { jp: "古い", romaji: "furui", en: "old" },
                        { jp: "高い", romaji: "takai", en: "expensive/tall" }, { jp: "安い", romaji: "yasui", en: "cheap" },
                        { jp: "楽しい", romaji: "tanoshii", en: "fun/enjoyable" }, { jp: "良い", romaji: "ii", en: "good" },
                        { jp: "静か", romaji: "shizuka", en: "quiet" }, { jp: "好き", romaji: "suki", en: "like" },
                        { jp: "元気", romaji: "genki", en: "energetic" }, { jp: "便利", romaji: "benri", en: "convenient" },
                        { jp: "有名", romaji: "yuumei", en: "famous" }, { jp: "大切", romaji: "taisetsu", en: "important" },
                        { jp: "きれい", romaji: "kirei", en: "pretty/clean" }, { jp: "きらい", romaji: "kirai", en: "dislike/hate" },
                        { jp: "大変", romaji: "taihen", en: "tough/serious" }, { jp: "よく", romaji: "yoku", en: "often/well" },
                        { jp: "いつも", romaji: "itsumo", en: "always" }, { jp: "ときどき", romaji: "tokidoki", en: "sometimes" },
                        { jp: "あまり", romaji: "amari", en: "not much (+negative)" }, { jp: "すぐに", romaji: "sugu ni", en: "right away" },
                        { jp: "まだ", romaji: "mada", en: "still/not yet" }, { jp: "もう", romaji: "mou", en: "already" },
                        { jp: "とても", romaji: "totemo", en: "very" },
                        { jp: "静かです→静かでした", romaji: "shizuka deshita", en: "was quiet (な-adj/noun past)" },
                        { jp: "静かじゃないです→静かじゃなかったです", romaji: "shizuka ja nakatta desu", en: "was not quiet (past negative)" },
                        { jp: "静かです→静かだ", romaji: "shizuka da", en: "is quiet (plain/casual register)" },
                        { jp: "静かじゃないです→静かじゃない", romaji: "shizuka ja nai", en: "is not quiet (plain/casual)" }
                    ],
                    sources: ["Tae Kim's Guide (い-adjectives, な-adjectives)", "Wasabi Japanese adjectives guide"]
                };
            },
            buildWordBankExercises: function () {
                let iAdj = pick(this.wordBank.iAdjectives);
                let naAdj = pick(this.wordBank.naAdjectives);
                let exercises = [
                    {
                        prompt: "Write: <strong>The book is " + iAdj.en + "</strong>",
                        accepted: [["ほん", "は", iAdj.jp, "です"]],
                        hint: "ほんは" + iAdj.jp + "です",
                        refWords: [
                            { jp: "ほん", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: iAdj.jp, role: "adjective" }, { jp: "です", role: "auxiliary" }
                        ]
                    },
                    {
                        prompt: "Write: <strong>The library is " + naAdj.en + "</strong>",
                        accepted: [["としょかん", "は", naAdj.jp, "です"]],
                        hint: "としょかんは" + naAdj.jp + "です",
                        refWords: [
                            { jp: "としょかん", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: naAdj.jp, role: "adjective" }, { jp: "です", role: "auxiliary" }
                        ]
                    }
                ];
                /* Bonus: sneak peek at shelf 11's verb+を, combined with an
                   い-adjective modifying the object noun directly. */
                let preview = this.wordBank.preview && this.wordBank.preview[0];
                if (preview) {
                    let adj = pick(this.wordBank.iAdjectives);
                    exercises.push({
                        prompt: "(bonus — sneak peek: shelf 11) Write: <strong>I " + preview.en + " a " + adj.en + " book</strong>",
                        accepted: [["わたし", "は", adj.jp, "ほん", "を", preview.jp]],
                        hint: "わたしは" + adj.jp + "ほんを" + preview.jp,
                        refWords: [
                            { jp: "わたし", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: adj.jp, role: "adjective" }, { jp: "ほん", role: "object" },
                            { jp: "を", role: "particle" }, { jp: preview.jp, role: "predicate" }
                        ]
                    });
                }
                return exercises;
            }
        };
    }

    /* SHELF 11: Verbs */
    function s11() {
        return {
            id: "s11", title: "Verbs", subtitle: "Shelf 11",
            wordBank: {
                objects: [{ jp: "本", en: "a book" }, { jp: "かばん", en: "a bag" }],
                places: [{ jp: "学校", en: "school" }],
                verbs: [{ jp: "読みます", en: "read" }, { jp: "買います", en: "buy" }, { jp: "行きます", en: "go" }],
                preview: [{ jp: "ましょう", en: "let's...", note: "Coming up in shelf 12 — invitations" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Verb groups & ます (Polite Form)",
                            explain: "A verb's dictionary form always ends in an u-sound (る, く, す, む, ぶ, つ, う...) — but which group it belongs to decides how it changes for polite speech: three groups total — ichidan (る-verbs), godan (everything else), and する-verbs.",
                            pattern: '<span class="pattern-box__slot">Object</span> <span class="pattern-box__fixed">を</span> <span class="pattern-box__slot">Verb</span> <span class="pattern-box__fixed">ます</span>'
                        },
                        {
                            title: "Ichidan (る-verbs)",
                            explain: "Most verbs ending in る where the sound right before it is an い or え row sound are ichidan — just drop る and add ます. 起きる(おきる) becomes 起き(おき)ます."
                        },
                        {
                            title: "Godan (everything else)",
                            explain: "Every other verb is godan — swap the final u-sound for its matching i-sound, then add ます. 行く(いく, 'go') becomes 行き(いき)ます; 話す(はなす, 'speak') becomes 話し(はなし)ます."
                        },
                        {
                            title: "Watch out — 帰る looks ichidan",
                            explain: "帰る(かえる, 'to go home') ends in える, just like 起きる — but it's godan, not ichidan. Drop る the ichidan way and you'd get 帰ます, which is wrong. The real form is 帰り(かえり)ます — treat り as part of the stem, godan-style."
                        },
                        {
                            title: "する-verbs and を (the object marker)",
                            explain: "する-verbs are a noun plus する ('to do') — swap する for します and every one conjugates the same way: 勉強する(べんきょうする) → 勉強(べんきょう)します. を marks the thing a verb acts on — it never means anything on its own, it just points at what comes right before it."
                        }
                    ],
                    examples: [
                        { jp: "私は起きます。", romaji: "Watashi wa okimasu.", en: "I wake up." },
                        { jp: "私は学校に行きます。", romaji: "Watashi wa gakkou ni ikimasu.", en: "I go to school." },
                        { jp: "私は先生と話します。", romaji: "Watashi wa sensei to hanashimasu.", en: "I speak with the teacher." },
                        { jp: "私は勉強します。", romaji: "Watashi wa benkyoushimasu.", en: "I study." },
                        { jp: "かばんを買います。", romaji: "Kaban wo kaimasu.", en: "I buy a bag." },
                        { jp: "本を読みます。", romaji: "Hon wo yomimasu.", en: "I read a book." },
                        { jp: "友達に会います。", romaji: "Tomodachi ni aimasu.", en: "I meet a friend." }
                    ],
                    vocab: [
                        { jp: "起きる", romaji: "okiru", en: "to wake up" }, { jp: "食べる", romaji: "taberu", en: "to eat" },
                        { jp: "行く", romaji: "iku", en: "to go" }, { jp: "話す", romaji: "hanasu", en: "to speak" },
                        { jp: "帰る", romaji: "kaeru", en: "to go home" }, { jp: "勉強する", romaji: "benkyousuru", en: "to study" },
                        { jp: "読む", romaji: "yomu", en: "to read" }, { jp: "買う", romaji: "kau", en: "to buy" },
                        { jp: "書く", romaji: "kaku", en: "to write" }, { jp: "聞く", romaji: "kiku", en: "to listen/ask" },
                        { jp: "会う", romaji: "au", en: "to meet" }, { jp: "立つ", romaji: "tatsu", en: "to stand" },
                        { jp: "座る", romaji: "suwaru", en: "to sit" }, { jp: "働く", romaji: "hataraku", en: "to work" },
                        { jp: "休む", romaji: "yasumu", en: "to rest" }, { jp: "遊ぶ", romaji: "asobu", en: "to play" },
                        { jp: "分かる", romaji: "wakaru", en: "to understand" }, { jp: "歌う", romaji: "utau", en: "to sing" }
                    ],
                    sources: ["Tae Kim's Guide to Japanese Grammar — verb groups and the ます-form", "Genki I — Lesson 3"]
                };
            },
            /* Object/verb pairs are curated (本+読みます, かばん+買います) plus one
               place+行きます pair, so every combo stays grammatically valid. */
            buildWordBankExercises: function () {
                let wb = this.wordBank;
                let choice = pick(["object", "place"]);
                let exercises;
                if (choice === "object") {
                    let idx = Math.floor(Math.random() * 2); // 0: book/read, 1: bag/buy
                    let obj = wb.objects[idx];
                    let verb = wb.verbs[idx];
                    exercises = [{
                        prompt: "Write: <strong>I " + verb.en + " " + obj.en + "</strong>",
                        accepted: [["わたし", "は", obj.jp, "を", verb.jp]],
                        hint: "わたしは" + obj.jp + "を" + verb.jp,
                        refWords: [
                            { jp: "わたし", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: obj.jp, role: "object" }, { jp: "を", role: "particle" }, { jp: verb.jp, role: "predicate" }
                        ]
                    }];
                } else {
                    let place = wb.places[0];
                    let verb = wb.verbs[2];
                    exercises = [{
                        prompt: "Write: <strong>I go to " + place.en + "</strong>",
                        accepted: [["わたし", "は", place.jp, "に", verb.jp]],
                        hint: "わたしは" + place.jp + "に" + verb.jp,
                        refWords: [
                            { jp: "わたし", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: place.jp, role: "object" }, { jp: "に", role: "particle" }, { jp: verb.jp, role: "predicate" }
                        ]
                    }];
                }
                /* Bonus: sneak peek at shelf 12's ましょう, built off this
                   lesson's own ます-stem (drop ます, add ましょう). */
                let preview = wb.preview && wb.preview[0];
                if (preview) {
                    let obj2 = pick(wb.objects);
                    let verb2 = wb.verbs[wb.objects.indexOf(obj2)];
                    let stem = verb2.jp.replace(/ます$/, "");
                    exercises.push({
                        prompt: "(bonus — sneak peek: shelf 12) Write: <strong>Let's " + verb2.en + " " + obj2.en + "</strong>",
                        accepted: [[obj2.jp, "を", stem + preview.jp]],
                        hint: obj2.jp + "を" + stem + preview.jp,
                        refWords: [
                            { jp: obj2.jp, role: "object" }, { jp: "を", role: "particle" },
                            { jp: stem + preview.jp, role: "predicate" }
                        ]
                    });
                }
                return exercises;
            }
        };
    }

    /* SHELF 12: Volitional & Invitations */
    function s12() {
        return {
            id: "s12", title: "Invitations", subtitle: "Shelf 12",
            wordBank: {
                places: [{ jp: "図書館", en: "the library", particle: "に" }, { jp: "公園", en: "the park", particle: "で" }],
                verbs: [{ jp: "行きましょう", en: "let's go to" }, { jp: "遊びませんか", en: "won't you play at" }],
                preview: [{ jp: "買って", en: "buy (て-form)", note: "Coming up in shelf 13 — the て-form" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "ましょう — \"Let's...\"",
                            explain: "Both patterns build on the ます-stem already known — just swap what comes after it. Drop ます, add ましょう — 行きます becomes 行きましょう ('let's go'). A confident, ready-to-act suggestion.",
                            pattern: '<span class="pattern-box__slot">Verb</span> <span class="pattern-box__fixed">ましょう</span>'
                        },
                        {
                            title: "ませんか — \"Won't you...?\"",
                            explain: "The negative-question shape 行きませんか literally asks 'won't you go?' — softer and more polite than ましょう, since it leaves room for the other person to say no.",
                            pattern: '<span class="pattern-box__slot">Verb</span> <span class="pattern-box__fixed">ませんか</span>'
                        },
                        {
                            title: "One more — ましょうか",
                            explain: "ましょう assumes everyone's in; ませんか politely checks first; ましょうか offers to do something FOR the other person rather than inviting them along — 手伝いましょうか, 'Shall I help?'"
                        },
                        {
                            title: "New particle along the way — で",
                            explain: "で marks WHERE an action happens (playing, working, eating) — a different job from に, which marks a destination or where something simply exists."
                        }
                    ],
                    examples: [
                        { jp: "図書館に行きましょう。", romaji: "Toshokan ni ikimashou.", en: "Let's go to the library." },
                        { jp: "一緒に食べませんか。", romaji: "Issho ni tabemasenka.", en: "Won't you eat with me?" },
                        { jp: "手伝いましょうか。", romaji: "Tetsudaimashou ka.", en: "Shall I help? (offering)" },
                        { jp: "少し休みましょう。", romaji: "Sukoshi yasumimashou.", en: "Let's rest a little." },
                        { jp: "公園で遊びませんか。", romaji: "Kouen de asobimasenka.", en: "Won't you play at the park?" }
                    ],
                    vocab: [
                        { jp: "〜ましょう", romaji: "~mashou", en: "Let's..." }, { jp: "〜ませんか", romaji: "~masenka", en: "Won't you...? (softer invitation)" },
                        { jp: "〜ましょうか", romaji: "~mashou ka", en: "Shall I...? (offering)" }, { jp: "少し", romaji: "sukoshi", en: "a little" },
                        { jp: "公園", romaji: "kouen", en: "park" }, { jp: "で", romaji: "de", en: "particle: where an action happens" }
                    ],
                    sources: ["Bunpro — ましょう／ませんか grammar entries", "Tae Kim's Guide — invitations and suggestions"]
                };
            },
            /* No bonus exercise: shelf 13's て-form needs its own conjugation
               rules taught first — preview stays exposure-only.
               Index-paired: library goes with "let's go" (destination に), park with "won't you play" (location-of-action で). */
            buildWordBankExercises: function () {
                let wb = this.wordBank;
                let i = Math.floor(Math.random() * wb.places.length);
                let place = wb.places[i];
                let verb = wb.verbs[i];
                return [{
                    prompt: "Write: <strong>" + verb.en.charAt(0).toUpperCase() + verb.en.slice(1) + " " + place.en + "</strong>",
                    accepted: [[place.jp, place.particle, verb.jp]],
                    hint: place.jp + place.particle + verb.jp,
                    refWords: [
                        { jp: place.jp, role: "object" }, { jp: place.particle, role: "particle" }, { jp: verb.jp, role: "predicate" }
                    ]
                }];
            }
        };
    }

    /* SHELF 13: Conjugations (te-form + ください) */
    function s13() {
        return {
            id: "s13", title: "Conjugations", subtitle: "Shelf 13",
            wordBank: {
                verbs: [
                    { te: "食べて", en: "eat" }, { te: "話して", en: "speak" },
                    { te: "読んで", en: "read" }, { te: "買って", en: "buy" },
                    { te: "歌って", en: "sing" }, { te: "書いて", en: "write" }
                ],
                preview: [{ jp: "ません", en: "don't (present negative)", note: "Coming up in shelf 14 — four forms, one stem" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "The て-form: one shape, many jobs",
                            explain: "て-form doesn't mean anything by itself — it's a connector shape that plugs into other patterns. It links two actions together ('do X, then Y'), and it's the shape a polite request needs — [て-form] + ください means 'please do this.'",
                            pattern: '<span class="pattern-box__slot">Verb て form</span> <span class="pattern-box__fixed">ください</span>'
                        },
                        {
                            title: "Godan verbs — 5 endings, all one group",
                            explain: "う・る・つ → って (買う→買って); ぶ・む・ぬ → んで (読む→読んで); ぐ → いで (泳ぐ→泳いで); く → いて (書く→書いて) — EXCEPTION: 行く breaks its own rule → 行って, not 行いて (the single most common て-form mistake); す → して (話す→話して)."
                        },
                        {
                            title: "Ichidan — drop る, add て",
                            explain: "Same shape as the ます-stem already known — just add て instead: 食べる→食べて, 起きる→起きて. Watch out: a handful of verbs LOOK ichidan (~える／~いる) but are secretly godan — 帰る (shelf 11) is one, hence 帰って not 帰て. A few more you'll meet later (reference only, not tested here): 入る (はいる, enter), 走る (はしる, run), 知る (しる, know), 要る (いる, need), 切る (きる, cut), 減る (へる, decrease)."
                        },
                        {
                            title: "Irregular verbs & connecting actions",
                            explain: "Only one truly irregular pattern at this level: する-verbs swap to して the same way they swap to します (勉強する→勉強して). The other classic irregular is 来る (くる, 'to come') → 来て (きて) — not taught as vocabulary in this course, but worth knowing by name since it follows no group's rule at all, same as する. て-form also chains actions together in order, without needing a separate word for 'and' — 起きて食べます, 'I wake up and eat.'"
                        }
                    ],
                    examples: [
                        { jp: "書いてください。", romaji: "Kaite kudasai.", en: "Please write it." },
                        { jp: "座ってください。", romaji: "Suwatte kudasai.", en: "Please sit." },
                        { jp: "起きて食べます。", romaji: "Okite tabemasu.", en: "I wake up and eat." }
                    ],
                    vocab: [
                        { jp: "起きる→起きて", romaji: "okite", en: "wake up (て-form)" }, { jp: "食べる→食べて", romaji: "tabete", en: "eat (て-form)" },
                        { jp: "行く→行って", romaji: "itte", en: "go (て-form — exception!)" }, { jp: "話す→話して", romaji: "hanashite", en: "speak (て-form)" },
                        { jp: "帰る→帰って", romaji: "kaette", en: "go home (て-form)" }, { jp: "勉強する→勉強して", romaji: "benkyoushite", en: "study (て-form)" },
                        { jp: "読む→読んで", romaji: "yonde", en: "read (て-form)" }, { jp: "買う→買って", romaji: "katte", en: "buy (て-form)" },
                        { jp: "書く→書いて", romaji: "kaite", en: "write (て-form)" }, { jp: "聞く→聞いて", romaji: "kiite", en: "listen/ask (て-form)" },
                        { jp: "会う→会って", romaji: "atte", en: "meet (て-form)" }, { jp: "立つ→立って", romaji: "tatte", en: "stand (て-form)" },
                        { jp: "座る→座って", romaji: "suwatte", en: "sit (て-form)" }, { jp: "働く→働いて", romaji: "hataraite", en: "work (て-form)" },
                        { jp: "休む→休んで", romaji: "yasunde", en: "rest (て-form)" }, { jp: "遊ぶ→遊んで", romaji: "asonde", en: "play (て-form)" },
                        { jp: "分かる→分かって", romaji: "wakatte", en: "understand (て-form)" }, { jp: "歌う→歌って", romaji: "utatte", en: "sing (て-form)" }
                    ],
                    sources: ["Tae Kim's Guide — the て-form chapter", "Bunpro — て-form conjugation reference"]
                };
            },
            /* No bonus exercise: shelf 14's ません pattern is a different,
               competing polite ending (not something that stacks onto て+
               ください) — preview stays exposure-only. */
            buildWordBankExercises: function () {
                let v = pick(this.wordBank.verbs);
                return [{
                    prompt: "Write: <strong>Please " + v.en + "</strong>",
                    accepted: [[v.te + "ください"]],
                    hint: v.te + "ください",
                    refWords: [{ jp: v.te + "ください", role: "verb" }]
                }];
            }
        };
    }

    /* SHELF 14: Past & Negative Tense */
    function s14() {
        return {
            id: "s14", title: "Past & Negative", subtitle: "Shelf 14",
            wordBank: {
                verbs: [
                    { neg: "読みません", past: "読みました", en: "read" },
                    { neg: "食べません", past: "食べました", en: "eat" },
                    { neg: "行きません", past: "行きました", en: "go" },
                    { neg: "話しません", past: "話しました", en: "speak" }
                ],
                preview: [{ jp: "から", en: "because", note: "Coming up in shelf 15 — sentence construction" }]
            },
            buildInstruction: function () {
                return {
                    sections: [{
                        title: "Four forms, one stem — ません / ました / ませんでした",
                        explain: "Already know present-tense ます. Three more forms all attach to the exact same ます-stem: present negative — drop ます, add ません (起きません, 'I don't wake up'). Past — swap ます for ました (起きました, 'I woke up'). Past negative — builds on the present-negative form: ません + でした = ませんでした (起きませんでした, 'I didn't wake up'). The 'present' ます form also covers habits and future plans, not just this instant — use the past forms only for things that have already happened.",
                        pattern: '<span class="pattern-box__slot">Verb stem</span> <span class="pattern-box__fixed">ません/ました/ませんでした</span>'
                    }],
                    examples: [
                        { jp: "本を読みません。", romaji: "Hon o yomimasen.", en: "I don't read books." },
                        { jp: "友達に会いました。", romaji: "Tomodachi ni aimashita.", en: "I met a friend." },
                        { jp: "今日働きませんでした。", romaji: "Kyou hatarakimasendeshita.", en: "I didn't work today." }
                    ],
                    vocab: [
                        { jp: "起きます→起きません", romaji: "okimasen", en: "present negative" },
                        { jp: "起きます→起きました", romaji: "okimashita", en: "past" },
                        { jp: "起きます→起きませんでした", romaji: "okimasendeshita", en: "past negative" },
                        { jp: "行きます→行きませんでした", romaji: "ikimasendeshita", en: "go, past negative" },
                        { jp: "話します→話しました", romaji: "hanashimashita", en: "speak, past" },
                        { jp: "勉強します→勉強しません", romaji: "benkyoushimasen", en: "study, present negative" }
                    ],
                    sources: ["Tae Kim's Guide — past and negative verb forms", "Genki I — Lesson 3"]
                };
            },
            /* No bonus exercise: shelf 15's から needs an adjective/reason
               clause this lesson doesn't have vocab for yet — exposure-only. */
            buildWordBankExercises: function () {
                let v1 = pick(this.wordBank.verbs);
                let v2 = pick(this.wordBank.verbs);
                return [
                    {
                        prompt: "Write: <strong>I don't " + v1.en + "</strong>",
                        accepted: [["わたし", "は", v1.neg]],
                        hint: "わたしは" + v1.neg,
                        refWords: [{ jp: "わたし", role: "subject" }, { jp: "は", role: "particle" }, { jp: v1.neg, role: "predicate" }]
                    },
                    {
                        prompt: "Write: <strong>I " + v2.en + " (past)</strong>",
                        accepted: [["わたし", "は", v2.past]],
                        hint: "わたしは" + v2.past,
                        refWords: [{ jp: "わたし", role: "subject" }, { jp: "は", role: "particle" }, { jp: v2.past, role: "predicate" }]
                    }
                ];
            }
        };
    }

    /* SHELF 15: Sentence Construction */
    function s15() {
        return {
            id: "s15", title: "Sentence Construction", subtitle: "Shelf 15",
            wordBank: {
                adjectives: [{ jp: "静か", en: "quiet" }, { jp: "古い", en: "old" }],
                connectors: [{ jp: "から", en: "because" }, { jp: "けど", en: "but" }, { jp: "と", en: "and (nouns only)" }],
                nouns: [{ jp: "本", en: "book" }, { jp: "かばん", en: "bag" }],
                preview: [{ jp: "が", en: "but (formal) / singles something out", note: "Coming up in shelf 16 — every particle, one place" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Putting it all together — four connectors",
                            explain: "You already know single-clause sentences. This shelf connects them into longer ones with a small set of connector words: て-form (already known, chains actions), から ('because'), けど ('but'), と ('and,' nouns only)."
                        },
                        {
                            title: "から — \"because...\"",
                            explain: "から attaches to the end of the reason clause, then a comma, then the result — the reason always comes first, unlike English 'I rested because I was tired' (reason comes second there). から attaches directly after a verb too, not just だ.",
                            pattern: '<span class="pattern-box__slot">Reason</span> <span class="pattern-box__fixed">から、</span> <span class="pattern-box__slot">Result</span>'
                        },
                        {
                            title: "けど — \"but...\"",
                            explain: "けど joins two contrasting clauses — 'X, but Y.' The everyday-conversation version; が can be used the same way in more formal writing, but that's a different job from the subject-marker が you'll meet on shelf 16.",
                            pattern: '<span class="pattern-box__slot">Clause 1</span> <span class="pattern-box__fixed">けど、</span> <span class="pattern-box__slot">Clause 2</span>'
                        },
                        {
                            title: "と — \"and\" (for listing nouns)",
                            explain: "と joins nouns into a complete list — 'A and B,' nothing left out. Only works for nouns, never verbs or full clauses (て-form handles those).",
                            pattern: '<span class="pattern-box__slot">Noun A</span> <span class="pattern-box__fixed">と</span> <span class="pattern-box__slot">Noun B</span>'
                        }
                    ],
                    examples: [
                        { jp: "静かだから、好きです。", romaji: "Shizuka dakara, suki desu.", en: "Because it's quiet, I like it." },
                        { jp: "古いけど、好きです。", romaji: "Furui kedo, suki desu.", en: "It's old, but I like it." },
                        { jp: "本とかばん。", romaji: "Hon to kaban.", en: "A book and a bag." },
                        { jp: "起きて静かだから、読みました。", romaji: "Okite shizuka dakara, yomimashita.", en: "I woke up, and because it was quiet, I read." }
                    ],
                    vocab: [
                        { jp: "〜から", romaji: "~kara", en: "because... (reason first)" },
                        { jp: "〜けど", romaji: "~kedo", en: "but..." },
                        { jp: "〜と〜", romaji: "~to~", en: "...and... (nouns only)" }
                    ],
                    sources: ["Bunpro — から／けど／と grammar entries", "Tae Kim's Guide — connecting clauses"]
                };
            },
            /* 静か pairs with から (な-adjective + だ + から), 古い pairs with けど (い-adjective, no だ). */
            buildWordBankExercises: function () {
                let exercises = [
                    {
                        prompt: "Write: <strong>Because it's quiet, I like it</strong>",
                        accepted: [["静か", "だ", "から", "好き", "です"], ["静かだから", "好き", "です"]],
                        hint: "静かだから好きです",
                        refWords: [{ jp: "静か", role: "adjective" }, { jp: "から", role: "particle" }, { jp: "好き", role: "adjective" }, { jp: "です", role: "auxiliary" }]
                    },
                    {
                        prompt: "Write: <strong>It's old, but I like it</strong>",
                        accepted: [["古い", "けど", "好き", "です"]],
                        hint: "古いけど好きです",
                        refWords: [{ jp: "古い", role: "adjective" }, { jp: "けど", role: "particle" }, { jp: "好き", role: "adjective" }, { jp: "です", role: "auxiliary" }]
                    },
                    {
                        prompt: "Write: <strong>A book and a bag</strong>",
                        accepted: [["本", "と", "かばん"]],
                        hint: "本とかばん",
                        refWords: [{ jp: "本", role: "object" }, { jp: "と", role: "particle" }, { jp: "かばん", role: "object" }]
                    }
                ];
                /* Bonus: sneak peek at shelf 16's formal-writing が, substituted
                   for けど in the exact same real sentence (source-noted swap). */
                let preview = this.wordBank.preview && this.wordBank.preview[0];
                if (preview) {
                    exercises.push({
                        prompt: "(bonus — sneak peek: shelf 16) Write: <strong>It's old, but I like it (formal — swap けど for " + preview.jp + ")</strong>",
                        accepted: [["古い", preview.jp, "好き", "です"]],
                        hint: "古い" + preview.jp + "好きです",
                        refWords: [{ jp: "古い", role: "adjective" }, { jp: preview.jp, role: "particle" }, { jp: "好き", role: "adjective" }, { jp: "です", role: "auxiliary" }]
                    });
                }
                return exercises;
            }
        };
    }

    /* SHELF 16: Particle Mastery */
    function s16() {
        return {
            id: "s16", title: "Particle Mastery", subtitle: "Shelf 16",
            wordBank: {
                predicates: [{ jp: "学生", en: "a student" }, { jp: "先生", en: "a teacher" }],
                places: [{ jp: "図書館", en: "the library" }, { jp: "公園", en: "the park" }],
                actions: [{ jp: "勉強します", en: "study" }, { jp: "遊びます", en: "play" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Every particle, one place",
                            explain: "This shelf reviews every particle taught so far (は topic shelf 3, を object shelf 11, に location/target shelf 8, で action-location shelf 12, の possessive shelf 5, か question shelf 6, と and/with shelf 11/15, から because shelf 15, けど but shelf 15), then adds the last two: が and も. Sentence skeleton, when several particles show up together: topic/subject (は・が) → place (に・で) → thing (を) → verb.",
                            pattern: '<span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">が/も</span> <span class="pattern-box__slot">Predicate</span>'
                        },
                        {
                            title: "が — singling something out",
                            explain: "が singles out exactly what fits a description — often answering an unspoken 'which one?' 猫はかわいいです ('as for the cat, it's cute' — general statement) vs. 猫がかわいいです ('IT'S the cat that's cute' — maybe among several animals, this one stands out)."
                        },
                        {
                            title: "も — \"also\"",
                            explain: "も replaces は or が entirely (never stacks with them) when the same thing applies to something else too — 友達も学生です, 'My friend is also a student.'"
                        },
                        {
                            title: "で vs に — same place, different job",
                            explain: "で marks the place an ACTION happens (reading, working, playing, eating) — it never attaches to あります・います (existence uses に instead). 図書館にいます ('I am AT the library' — existence) vs. 図書館で勉強します ('I study AT the library' — action)."
                        },
                        {
                            title: "から / けど / と — in depth",
                            explain: "から: the reason always comes FIRST, then から, then a comma, then the result — backwards from English. けど is the everyday connector for 'X, but Y'; が can do the same job in more formal writing (a different job from this shelf's subject-marker が). と does two jobs on NOUNS only: listing ('A and B') and marking who you do something WITH."
                        }
                    ],
                    examples: [
                        { jp: "猫がいます。", romaji: "Neko ga imasu.", en: "IT'S the cat (not the dog) that's here." },
                        { jp: "友達も学生です。", romaji: "Tomodachi mo gakusei desu.", en: "My friend is also a student." },
                        { jp: "図書館で勉強します。", romaji: "Toshokan de benkyoushimasu.", en: "I study at the library." },
                        { jp: "公園で遊びます。", romaji: "Kouen de asobimasu.", en: "I play at the park." },
                        { jp: "学校で先生と話します。", romaji: "Gakkou de sensei to hanashimasu.", en: "I speak with the teacher at school." }
                    ],
                    vocab: [
                        { jp: "は", romaji: "wa", en: "topic marker" }, { jp: "が", romaji: "ga", en: "subject marker (singles out)" },
                        { jp: "を", romaji: "o", en: "object marker" }, { jp: "に", romaji: "ni", en: "destination / location of being" },
                        { jp: "で", romaji: "de", en: "location of an action" }, { jp: "の", romaji: "no", en: "possessive" },
                        { jp: "か", romaji: "ka", en: "question marker" }, { jp: "と", romaji: "to", en: "and / with" },
                        { jp: "も", romaji: "mo", en: "also" }, { jp: "から", romaji: "kara", en: "because" },
                        { jp: "けど", romaji: "kedo", en: "but" }
                    ],
                    sources: ["imabi — Japanese particles reference", "Tae Kim's Guide — は vs が chapter"]
                };
            },
            buildWordBankExercises: function () {
                let pred = pick(this.wordBank.predicates);
                let place = pick(this.wordBank.places);
                let action = this.wordBank.actions[this.wordBank.places.indexOf(place)];
                return [
                    {
                        prompt: "Write: <strong>The cat is here (using が)</strong>",
                        accepted: [["猫", "が", "います"]],
                        hint: "猫がいます",
                        refWords: [{ jp: "猫", role: "subject" }, { jp: "が", role: "particle" }, { jp: "います", role: "predicate" }]
                    },
                    {
                        prompt: "Write: <strong>My friend is also " + pred.en + "</strong>",
                        accepted: [["友達", "も", pred.jp, "です"]],
                        hint: "友達も" + pred.jp + "です",
                        refWords: [{ jp: "友達", role: "subject" }, { jp: "も", role: "particle" }, { jp: pred.jp, role: "predicate" }, { jp: "です", role: "auxiliary" }]
                    },
                    {
                        prompt: "Write: <strong>I " + action.en + " at " + place.en + " (using で)</strong>",
                        accepted: [[place.jp, "で", action.jp]],
                        hint: place.jp + "で" + action.jp,
                        refWords: [{ jp: place.jp, role: "object" }, { jp: "で", role: "particle" }, { jp: action.jp, role: "predicate" }]
                    }
                ];
            }
        };
    }

    /* ===== N5 KANJI TRACK — segregated from the s01-s16 grammar shelves
       (own "k##" id namespace, own <optgroup> in the lesson picker, own
       section in the N5 Lessons dashboard) rather than numbered as more
       shelves. Each lesson is vocab-only kanji recognition, grouped by
       theme the same way shelf 02 was split into s02/s02b/s02c topic
       lessons — a flat 100-kanji wall would be a worse lesson than four
       focused ones. k01 (Numbers) reuses sounds already taught in Shelf
       07; every group below stays this same small, closed, single-kanji
       scope (compounds only ever appear in the worked examples, never in
       the wordBank itself). */
    function k01() {
        let kanji = [
            { jp: "一", romaji: "ichi", en: "one" }, { jp: "二", romaji: "ni", en: "two" }, { jp: "三", romaji: "san", en: "three" },
            { jp: "四", romaji: "yon", en: "four" }, { jp: "五", romaji: "go", en: "five" }, { jp: "六", romaji: "roku", en: "six" },
            { jp: "七", romaji: "nana", en: "seven" }, { jp: "八", romaji: "hachi", en: "eight" }, { jp: "九", romaji: "kyuu", en: "nine" },
            { jp: "十", romaji: "juu", en: "ten" }
        ];
        return {
            id: "k01", title: "N5 Kanji: Numbers", subtitle: "一〜十",
            vocabOnly: true, kanjiGroup: true,
            wordBank: { kanji: kanji },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "What's a kanji?",
                            explain: "Kana (ひらがな/カタカナ) spell out sounds; kanji are whole characters borrowed from Chinese that stand for a word or idea on their own. N5 asks for around 100 of the most common ones, split across this track by theme rather than as one long list — this group starts with the ten easiest and most useful: the numbers you already learned as sounds back in Shelf 07."
                        },
                        {
                            title: "The same sounds, their real characters",
                            explain: "一 (いち), 二 (に), 三 (さん), 四 (よん), 五 (ご), 六 (ろく), 七 (なな), 八 (はち), 九 (きゅう), 十 (じゅう) — exactly the readings from Shelf 07's counters, just written the way native text actually writes them. In real Japanese, ひとつ・ふたつ style counting is one of the only places numbers routinely stay in kana; everywhere else (dates, prices, phone numbers, addresses) uses the kanji.",
                            pattern: "No grammar pattern here — just ten characters to recognize on sight."
                        },
                        {
                            title: "Reading quirks to remember",
                            explain: "四, 七, and 九 each have a second common reading depending on context — 四 also reads し (as in 四月, April), 七 also reads しち (as in 七月, July), and 九 also reads く (as in 九月, September). This group only tests the everyday standalone readings (よん・なな・きゅう); the alternates are worth recognizing once you start seeing dates and months."
                        }
                    ],
                    examples: [
                        { jp: "二人", romaji: "futari", en: "two people (irregular reading — not \"ににん\")" },
                        { jp: "三時", romaji: "sanji", en: "3 o'clock" },
                        { jp: "十分", romaji: "juppun", en: "ten minutes" },
                        { jp: "八百屋", romaji: "yaoya", en: "greengrocer (literally \"800 shop\")" }
                    ],
                    vocab: kanji.map(function (k) { return { jp: k.jp, romaji: k.romaji, en: k.en }; }),
                    sources: ["Tofugu — Japanese Numbers guide", "Jisho.org"]
                };
            },
            buildMatchExercises: function () { return buildMatchExercisesFromBank(this.wordBank, 6); }
        };
    }

    function k02() {
        let kanji = [
            { jp: "人", romaji: "hito", en: "person" }, { jp: "子", romaji: "ko", en: "child" },
            { jp: "女", romaji: "onna", en: "woman" }, { jp: "男", romaji: "otoko", en: "man" },
            { jp: "父", romaji: "chichi", en: "father" }, { jp: "母", romaji: "haha", en: "mother" },
            { jp: "友", romaji: "tomo", en: "friend" }, { jp: "名", romaji: "na", en: "name" },
            { jp: "私", romaji: "watashi", en: "I / me" }, { jp: "生", romaji: "sei", en: "life / birth" }
        ];
        return {
            id: "k02", title: "N5 Kanji: People & Family", subtitle: "人・子・女・男…",
            vocabOnly: true, kanjiGroup: true,
            wordBank: { kanji: kanji },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "The people around you",
                            explain: "These ten kanji cover the words you reach for constantly: naming people, describing who's a man/woman/child, and the family terms 父/母. 人 itself is one of the most productive kanji in the whole language — it shows up standalone (a person) and glued onto other kanji as a counter/suffix (日本人, a Japanese person)."
                        },
                        {
                            title: "生 — one kanji, many jobs",
                            explain: "生 alone means \"life\" or \"birth,\" but you'll meet it constantly as part of bigger words you may already know: 先生 (sensei, teacher), 学生 (gakusei, student), 誕生日 (tanjoubi, birthday). Recognizing 生 on sight helps those compounds stop looking like random kanji soup."
                        }
                    ],
                    examples: [
                        { jp: "私の友達", romaji: "watashi no tomodachi", en: "my friend" },
                        { jp: "男の子", romaji: "otoko no ko", en: "boy (literally \"male child\")" },
                        { jp: "女の子", romaji: "onna no ko", en: "girl (literally \"female child\")" },
                        { jp: "お名前は？", romaji: "onamae wa?", en: "What's your name?" }
                    ],
                    vocab: kanji.map(function (k) { return { jp: k.jp, romaji: k.romaji, en: k.en }; }),
                    sources: ["Tofugu — N5 kanji guide", "Jisho.org"]
                };
            },
            buildMatchExercises: function () { return buildMatchExercisesFromBank(this.wordBank, 6); }
        };
    }

    function k03() {
        let kanji = [
            { jp: "山", romaji: "yama", en: "mountain" }, { jp: "川", romaji: "kawa", en: "river" },
            { jp: "木", romaji: "ki", en: "tree" }, { jp: "花", romaji: "hana", en: "flower" },
            { jp: "空", romaji: "sora", en: "sky" }, { jp: "雨", romaji: "ame", en: "rain" },
            { jp: "天", romaji: "ten", en: "heaven / sky" }, { jp: "気", romaji: "ki", en: "spirit / weather" },
            { jp: "水", romaji: "mizu", en: "water" }, { jp: "火", romaji: "hi", en: "fire" }
        ];
        return {
            id: "k03", title: "N5 Kanji: Nature & Weather", subtitle: "山・川・木・花…",
            vocabOnly: true, kanjiGroup: true,
            wordBank: { kanji: kanji },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "The natural world",
                            explain: "山, 川, 木, and 花 are some of the oldest, simplest kanji there are — several literally started as little pictures (山 as three mountain peaks, 木 as a trunk with branches). They're also everywhere in place names, so recognizing them helps far beyond just vocabulary."
                        },
                        {
                            title: "天気 — when two kanji meet",
                            explain: "天 (heaven/sky) and 気 (spirit) combine into 天気 (tenki), \"weather\" — neither kanji means \"weather\" alone, but together they do. 気 alone is also the second half of 元気 (genki, \"doing well\") from Shelf 01 — the same character, a different pairing, a different meaning."
                        }
                    ],
                    examples: [
                        { jp: "今日はいい天気です。", romaji: "Kyou wa ii tenki desu.", en: "The weather is nice today." },
                        { jp: "雨が降っています。", romaji: "Ame ga futte imasu.", en: "It's raining." },
                        { jp: "山に木がたくさんあります。", romaji: "Yama ni ki ga takusan arimasu.", en: "There are a lot of trees on the mountain." }
                    ],
                    vocab: kanji.map(function (k) { return { jp: k.jp, romaji: k.romaji, en: k.en }; }),
                    sources: ["Tofugu — N5 kanji guide", "Jisho.org"]
                };
            },
            buildMatchExercises: function () { return buildMatchExercisesFromBank(this.wordBank, 6); }
        };
    }

    function k04() {
        let kanji = [
            { jp: "今", romaji: "ima", en: "now" }, { jp: "年", romaji: "nen", en: "year" },
            { jp: "月", romaji: "tsuki", en: "month / moon" }, { jp: "日", romaji: "hi", en: "day / sun" },
            { jp: "時", romaji: "ji", en: "o'clock / time" }, { jp: "間", romaji: "kan", en: "interval / space" },
            { jp: "週", romaji: "shuu", en: "week" }, { jp: "朝", romaji: "asa", en: "morning" },
            { jp: "昼", romaji: "hiru", en: "noon / daytime" }, { jp: "夜", romaji: "yoru", en: "night" }
        ];
        return {
            id: "k04", title: "N5 Kanji: Time & Calendar", subtitle: "今・年・月・日…",
            vocabOnly: true, kanjiGroup: true,
            wordBank: { kanji: kanji },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Telling time, the kanji way",
                            explain: "月 and 日 do double duty depending on what they're attached to: alone, 月 is \"moon\" and 日 is \"sun/day,\" but stack a number in front (三月, 三日) and they become \"March\" and \"the 3rd\" — the same characters Shelf 07 already touched on with 時/分. 間 rarely stands alone; you'll mostly meet it glued onto other kanji, e.g. 時間 (jikan, \"time/hours\") or 週間 (shuukan, \"week(s)\")."
                        },
                        {
                            title: "Morning, noon, and night",
                            explain: "朝 (asa), 昼 (hiru), and 夜 (yoru) carve the day into thirds and combine freely with other words: 朝ご飯 (asagohan, breakfast), 昼ご飯 (hirugohan, lunch), 今夜 (konya, tonight)."
                        }
                    ],
                    examples: [
                        { jp: "今、何時ですか。", romaji: "Ima, nanji desu ka.", en: "What time is it now?" },
                        { jp: "来週の月曜日", romaji: "raishuu no getsuyoubi", en: "next Monday (literally \"next week's moon-day\")" },
                        { jp: "毎朝、六時に起きます。", romaji: "Maiasa, rokuji ni okimasu.", en: "I wake up at 6 every morning." }
                    ],
                    vocab: kanji.map(function (k) { return { jp: k.jp, romaji: k.romaji, en: k.en }; }),
                    sources: ["Tofugu — N5 kanji guide", "Jisho.org"]
                };
            },
            buildMatchExercises: function () { return buildMatchExercisesFromBank(this.wordBank, 6); }
        };
    }

    /* ===== STATE ===== */
    let currentLesson = null;
    let currentExercises = [];
    let exerciseIndex = 0;
    let attempts = 0;
    let maxAttempts = 3;
    let totalExercises = 0;
    let completedExercises = 0;
    let lessonScore = 0;
    let streak = 0;
    let bestStreak = 0;

    const lessons = buildLessons();

    function $(id) { return document.getElementById(id); }

    /* Element visibility helpers (reset to CSS default when shown) */
    function show(el) { if (el) el.style.display = ""; }
    function hide(el) { if (el) el.style.display = "none"; }

    /* ===== HEADER LESSON PICKER (dropdown, replaces the old sidebar list) ===== */
    function lessonOptionLabel(les) {
        let done = window.StudyProgress && StudyProgress.isLessonDone(les.id);
        /* Kanji-track lessons carry their theme in the title already
           ("N5 Kanji: Numbers") — numbering them like shelves ("17. N5
           Kanji: Numbers") would just restate the segregation the
           optgroup below already provides. */
        if (les.kanjiGroup) return (done ? "✓ " : "") + les.title;
        return (done ? "✓ " : "") + les.id.replace("s", "") + ". " + les.title;
    }

    function renderLessonPicker() {
        let select = $("studyLessonSelect");
        if (!select) return;
        select.innerHTML = "";
        /* Kanji lessons are a segregated track, not more numbered shelves —
           their own <optgroup> keeps that visually true in the dropdown
           instead of just interleaving them into the shelf sequence. */
        let shelvesGroup = document.createElement("optgroup");
        shelvesGroup.label = "Shelves — Grammar & Vocab";
        let kanjiGroupEl = document.createElement("optgroup");
        kanjiGroupEl.label = "N5 Kanji";
        lessons.forEach(function (les) {
            let opt = document.createElement("option");
            opt.value = les.id;
            opt.textContent = lessonOptionLabel(les);
            (les.kanjiGroup ? kanjiGroupEl : shelvesGroup).appendChild(opt);
        });
        select.appendChild(shelvesGroup);
        select.appendChild(kanjiGroupEl);
        select.addEventListener("change", function () { openLesson(this.value); });
    }

    function refreshLessonPickerLabels() {
        let select = $("studyLessonSelect");
        if (!select) return;
        Array.prototype.forEach.call(select.options, function (opt) {
            let les = lessons.find(function (l) { return l.id === opt.value; });
            if (les) opt.textContent = lessonOptionLabel(les);
        });
    }

    function highlightActiveLesson(id) {
        let select = $("studyLessonSelect");
        if (select) select.value = id;
    }

    /* ===== OPEN LESSON: instruction panel + start practice ===== */
    function openLesson(id) {
        currentLesson = lessons.find(function (l) { return l.id === id; });
        if (!currentLesson) return;
        currentExercises = currentLesson.vocabOnly
            ? currentLesson.buildMatchExercises()
            : currentLesson.buildWordBankExercises();
        exerciseIndex = 0;
        totalExercises = currentExercises.length;
        completedExercises = 0;
        lessonScore = 0;
        streak = 0;
        bestStreak = 0;
        highlightActiveLesson(id);
        renderInstruction();
        show($("studyPractice"));
        hide($("studyComplete"));
        let progressWrap = $("studyProgressFill") ? $("studyProgressFill").parentElement.parentElement : null;
        if (progressWrap) progressWrap.style.display = "";
        renderExercise();
    }

    function renderInstruction() {
        let panel = $("studyInstruct");
        if (!panel) return;
        let inst = currentLesson.buildInstruction();
        let html = "<h2>" + currentLesson.title + " <span style='font-size:14px;color:var(--text-light)'>(" + currentLesson.subtitle + ")</span></h2>";

        (inst.sections || []).forEach(function (sec) {
            html += "<div class='grammar-box'>"
                + "<div class='grammar-box__title'>" + sec.title + "</div>"
                + "<p>" + sec.explain + "</p>"
                + (sec.pattern ? "<div class='pattern-box'><span class='pattern-box__label'>Pattern:</span> " + sec.pattern + "</div>" : "")
                + (sec.culture ? "<p class='grammar-box__culture'>&#127760; " + sec.culture + "</p>" : "")
                + "</div>";
        });

        if (inst.examples && inst.examples.length) {
            html += "<h3>Examples</h3>";
            inst.examples.forEach(function (ex) {
                html += "<div class='example-sentence'>"
                    + "<span>" + ex.jp + "</span>"
                    + (ex.romaji ? "<span class='example-sentence__romaji'>" + ex.romaji + "</span>" : "")
                    + "<span class='example-sentence__english'>&mdash; " + ex.en + "</span>"
                    + "</div>";
            });
        }

        if (inst.vocab && inst.vocab.length) {
            html += "<h3>Vocabulary</h3>" + buildVocabTable(inst.vocab);
        }

        if (inst.sources && inst.sources.length) {
            html += "<h3>Sources</h3><p class='sources-line'>" + inst.sources.join(" &middot; ") + "</p>";
        }

        html += buildWordBankBox(currentLesson.wordBank);
        panel.innerHTML = html;
    }

    /* Full vocab list for the lesson (content-fidelity pass) — a compact
       scrollable table rather than inline prose, since some shelves teach
       50+ words (e.g. shelf-07's numbers/counters). */
    function buildVocabTable(vocab) {
        let rows = vocab.map(function (w) {
            return "<tr><td class='vocab-table__jp'>" + w.jp + "</td>"
                + "<td class='vocab-table__romaji'>" + (w.romaji || "") + "</td>"
                + "<td class='vocab-table__en'>" + w.en + "</td></tr>";
        }).join("");
        return "<div class='vocab-table-wrap'><table class='vocab-table'>" + rows + "</table></div>";
    }

    /* Display-name + chip-role lookup for each wordBank category key */
    const WORD_BANK_LABELS = {
        phrases: "Phrases", subjects: "Subjects", thingSubjects: "Subjects",
        peoplePredicates: "Predicates (people)", thingPredicates: "Predicates (things)",
        demonstratives: "Demonstratives", nouns: "Nouns", creatures: "Nouns",
        topics: "Topics", questionWords: "Question Words", people: "People", things: "Things",
        names: "Names", iAdjectives: "い-Adjectives", naAdjectives: "な-Adjectives",
        adjectives: "Adjectives", verbs: "Verbs", objects: "Objects", places: "Places",
        counters: "Counters", connectors: "Connectors", predicates: "Predicates", directions: "Directions",
        kanji: "Kanji"
    };
    const WORD_BANK_ROLES = {
        phrases: "greeting", subjects: "subject", thingSubjects: "subject",
        peoplePredicates: "predicate", thingPredicates: "predicate",
        demonstratives: "subject", nouns: "object", creatures: "subject",
        topics: "subject", questionWords: "particle", people: "subject", things: "predicate",
        names: "subject", iAdjectives: "adjective", naAdjectives: "adjective",
        adjectives: "adjective", verbs: "predicate", objects: "object", places: "object",
        counters: "object", connectors: "particle", predicates: "predicate", directions: "object",
        kanji: "neutral"
    };

    /* Renders the "Fixed word bank for this lesson" box in the instruction panel
       (Study Room Word-Bank Sentence Builder PRD, FR1/FR5) directly from the
       lesson's own wordBank object — the exact words that CAN be asked, no more. */
    function buildWordBankBox(wordBank) {
        if (!wordBank) return "";
        let rowsHtml = "";
        Object.keys(wordBank).forEach(function (key) {
            if (key === "preview") return;
            let items = wordBank[key];
            if (!items || !items.length) return;
            let label = WORD_BANK_LABELS[key] || key;
            let role = WORD_BANK_ROLES[key] || "neutral";
            let chipsHtml = items.map(function (w) {
                return "<span class='word-bank__chip' data-role='" + role + "'>" + w.jp + "</span>";
            }).join("");
            rowsHtml += "<div class='word-bank-box__category'>" + label + "</div>"
                + "<div class='word-bank'>" + chipsHtml + "</div>";
        });
        if (!rowsHtml) return "";
        let previewHtml = "";
        if (wordBank.preview && wordBank.preview.length) {
            let chips = wordBank.preview.map(function (w) {
                return "<span class='word-bank__chip word-bank__chip--preview' data-role='preview'>" + w.jp
                    + "<span class='word-bank__chip-tag'>" + w.note + " &mdash; “" + w.en + "”</span></span>";
            }).join("");
            previewHtml = "<div class='word-bank-box__preview'>"
                + "<div class='word-bank-box__preview-label'>Coming up next lesson, usable here too:</div>"
                + "<div class='word-bank'>" + chips + "</div>"
                + "</div>";
        }
        return "<div class='word-bank-box'>"
            + "<div class='word-bank-box__title'>&#128274; Fixed word bank for this lesson</div>"
            + rowsHtml
            + "<p class='word-bank-box__note'>Only these words are ever used in this lesson's exercises — nothing outside this list.</p>"
            + previewHtml
            + "</div>";
    }

    /* ===== EXERCISE RENDERING ===== */
    function renderExercise() {
        if (exerciseIndex >= currentExercises.length) {
            showResult();
            return;
        }
        let ex = currentExercises[exerciseIndex];
        attempts = 0;

        let prompt = $("studyPractice").querySelector(".study-practice__prompt");
        if (prompt) prompt.innerHTML = ex.prompt;

        /* Option-C hybrid: non-clickable reference chips for this exercise's words */
        let refWrap = $("studyWordBankRef");
        if (refWrap) {
            if (ex.refWords && ex.refWords.length) {
                /* Shuffled on display only (grading never reads this order) —
                   the chips used to render in the exact order the correct
                   sentence needs, which meant the "exercise" was just
                   copying top-to-bottom instead of actually recalling word
                   order. Applies to every sentence-building lesson (s03
                   onward) automatically since this is the one shared
                   render path they all go through. */
                refWrap.innerHTML = shuffle(ex.refWords).map(function (w) {
                    return "<span class='word-bank__chip word-bank__chip--ref' data-role='" + (w.role || "neutral") + "'>" + w.jp + "</span>";
                }).join("");
            } else {
                refWrap.innerHTML = "";
            }
        }

        let input = $("studyInput");
        let checkBtn = $("studyCheckBtn");
        let hintBtn = $("studyHintBtn");
        let matchWrap = $("studyMatchChoices");

        if (currentLesson.vocabOnly) {
            hide(input);
            hide(checkBtn);
            hide(hintBtn);
            show(matchWrap);
            renderMatchChoices(ex);
        } else {
            hide(matchWrap);
            if (matchWrap) matchWrap.innerHTML = "";
            show(checkBtn);
            show(hintBtn);
            if (input) {
                show(input);
                input.value = "";
                input.disabled = false;
                input.className = "study-practice__input";
                setTimeout(function () { input.focus(); }, 80);
            }
        }

        let fill = $("studyProgressFill");
        if (fill) fill.style.width = Math.round((exerciseIndex / totalExercises) * 100) + "%";
        let txt = $("studyProgressText");
        if (txt) txt.textContent = exerciseIndex + " / " + totalExercises;

        hide($("studyFeedback"));
        let fb = $("studyFeedback");
        if (fb) { fb.className = "study-practice__feedback"; fb.innerHTML = ""; }

        hide($("studyNextBtn"));
    }

    /* ===== MATCH-CHOICE EXERCISES (vocab-only lessons) ===== */
    function renderMatchChoices(ex) {
        let wrap = $("studyMatchChoices");
        if (!wrap) return;
        wrap.classList.remove("is-locked");
        wrap.innerHTML = ex.choices.map(function (choice) {
            return "<button type='button' class='study-match-choice'>" + choice + "</button>";
        }).join("");
        Array.prototype.forEach.call(wrap.querySelectorAll(".study-match-choice"), function (btn) {
            btn.addEventListener("click", function () { checkMatchAnswer(ex, btn, wrap); });
        });
    }

    function checkMatchAnswer(ex, btnEl, wrap) {
        if (wrap.classList.contains("is-locked")) return;
        wrap.classList.add("is-locked");

        let choiceButtons = wrap.querySelectorAll(".study-match-choice");
        Array.prototype.forEach.call(choiceButtons, function (btn) {
            btn.disabled = true;
            if (btn.textContent === ex.correct) btn.classList.add("is-correct");
        });

        let correct = btnEl.textContent === ex.correct;
        completedExercises++;
        if (correct) {
            lessonScore++;
            streak++;
            if (streak > bestStreak) bestStreak = streak;
            showFeedback("&#10003; correct &middot; streak: " + streak, "correct");
        } else {
            streak = 0;
            btnEl.classList.add("is-wrong");
            showFeedback("&#10007; the answer was: <strong>" + ex.correct + "</strong>", "reveal");
        }
        show($("studyNextBtn"));
    }

    /* ===== CHECK ANSWER ===== */
    function checkAnswer() {
        let input = $("studyInput");
        if (!input || !currentLesson) return;
        let ex = currentExercises[exerciseIndex];
        let userVal = norm(input.value);
        let accepted = ex.accepted.some(function (acc) {
            let fullSentence = acc.join("");
            return norm(fullSentence) === userVal;
        });

        if (accepted) {
            input.disabled = true;
            input.classList.add("is-correct");
            completedExercises++;
            lessonScore++;
            streak++;
            if (streak > bestStreak) bestStreak = streak;
            showFeedback("&#10003; correct &middot; streak: " + streak, "correct");
            show($("studyNextBtn"));
            hide($("studyCheckBtn"));
            hide($("studyHintBtn"));
        } else {
            attempts++;
            streak = 0;
            input.classList.add("is-wrong");
            setTimeout(function () { input.classList.remove("is-wrong"); }, 400);
            if (attempts >= maxAttempts) {
                input.disabled = true;
                completedExercises++;
                showFeedback("&#10007; the answer was: <strong>" + ex.hint + "</strong>", "reveal");
                show($("studyNextBtn"));
                hide($("studyCheckBtn"));
                hide($("studyHintBtn"));
            } else {
                showFeedback("&#10007; not quite &middot; " + (maxAttempts - attempts) + " attempt" + (maxAttempts - attempts === 1 ? "" : "s") + " left &middot; streak reset", "wrong");
            }
        }
    }

    function nextExercise() {
        exerciseIndex++;
        renderExercise();
    }

    /* ===== HINT ===== */
    function showHint() {
        let ex = currentExercises[exerciseIndex];
        if (!ex) return;
        showFeedback("Hint: <strong>" + ex.hint + "</strong>", "hint");
    }

    /* ===== FEEDBACK ===== */
    function showFeedback(msg, type) {
        let fb = $("studyFeedback");
        if (!fb) return;
        fb.className = "study-practice__feedback study-practice__feedback--" + type + " is-visible";
        fb.innerHTML = msg;
        show(fb);
    }

    /* ===== RESULT ===== */
    function showResult() {
        hide($("studyPractice"));
        let panel = $("studyComplete");
        if (!panel) return;
        let pct = totalExercises > 0 ? Math.round((lessonScore / totalExercises) * 100) : 0;
        let msg;
        if (pct === 100) msg = "Perfect score! You're amazing!";
        else if (pct >= 75) msg = "Great job! Almost there!";
        else if (pct >= 50) msg = "Not bad! Keep practicing!";
        else msg = "Don't give up! Try again!";

        let xpGained = 0;
        let alreadyDone = false;
        if (currentLesson && window.StudyProgress) {
            let result = StudyProgress.completeLesson(currentLesson.id);
            xpGained = result.gained || 0;
            alreadyDone = !(result.gained > 0);
            StudyProgress.renderXpBadges();
            refreshLessonPickerLabels();
        }

        let lessonIdx = lessons.indexOf(currentLesson);
        let nextLesson = lessonIdx >= 0 ? lessons[lessonIdx + 1] : null;

        panel.innerHTML = "<p class='study-complete__heading'>&#9670; lesson " + (lessonIdx + 1) + " complete &mdash; " + currentLesson.title + " cleared</p>"
            + "<p class='study-complete__msg'>" + msg + "</p>"
            + "<div class='study-complete__tiles'>"
            + "<div class='study-complete__tile'><p class='study-complete__tile-label'>accuracy</p><p class='study-complete__tile-value'>" + pct + "%</p></div>"
            + "<div class='study-complete__tile'><p class='study-complete__tile-label'>xp earned</p><p class='study-complete__tile-value'>+" + xpGained + "</p></div>"
            + "<div class='study-complete__tile'><p class='study-complete__tile-label'>best streak</p><p class='study-complete__tile-value'>" + bestStreak + "</p></div>"
            + "</div>"
            + (alreadyDone ? "<p class='study-complete__note'>Lesson already completed before &mdash; no bonus XP.</p>" : "")
            + (nextLesson
                ? "<button type='button' class='study-complete__cta' id='studyContinueBtn'>Next Lesson &#8594; " + nextLesson.title + "</button>"
                : "<p class='study-complete__note'>You've completed every lesson in the Study Room!</p>");
        /* show() first to clear the inline style.display:none that
           openLesson()'s hide($("studyComplete")) sets on every lesson
           open — classList.add("is-visible") alone can't win against
           that inline style (inline always beats a CSS class), so the
           whole completion panel — including the Next Lesson button —
           silently never appeared. Same gotcha documented elsewhere in
           this file: hide()/show() must be paired, not mixed with class
           toggling. */
        show(panel);
        panel.classList.add("is-visible");
        hide($("studyProgressFill").parentElement.parentElement);

        let continueBtn = $("studyContinueBtn");
        if (continueBtn) continueBtn.addEventListener("click", function () { openLesson(nextLesson.id); });
    }

    /* ===== EVENT WIRING ===== */
    function wireEvents() {
        let checkBtn = $("studyCheckBtn");
        if (checkBtn) checkBtn.addEventListener("click", checkAnswer);

        let hintBtn = $("studyHintBtn");
        if (hintBtn) hintBtn.addEventListener("click", showHint);

        let nextBtn = $("studyNextBtn");
        if (nextBtn) nextBtn.addEventListener("click", nextExercise);

        let input = $("studyInput");
        if (input) input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                if ($("studyNextBtn").style.display !== "none" && $("studyNextBtn").style.display !== "") {
                    nextExercise();
                } else {
                    checkAnswer();
                }
            }
        });

        let skipBtn = $("studySkipBtn");
        if (skipBtn) skipBtn.addEventListener("click", function () {
            if (currentLesson) {
                exerciseIndex++;
                renderExercise();
            }
        });

        let printBtn = $("studyPrintBtn");
        if (printBtn) printBtn.addEventListener("click", function () {
            if (currentLesson && typeof window.exportLessonPdf === "function") {
                window.exportLessonPdf(currentLesson);
            }
        });
    }

    /* ===== PUBLIC API (called by index.html toggle) ===== */
    window.StudyRoom = {
        init: function () {
            renderLessonPicker();
            wireEvents();
            let practice = $("studyPractice");
            if (practice) practice.style.display = "none";
            let complete = $("studyComplete");
            if (complete) { complete.classList.remove("is-visible"); complete.innerHTML = ""; }

            /* Auto-open a lesson from ?lesson=sXX URL param */
            let params = new URLSearchParams(window.location.search);
            let lessonId = params.get("lesson");
            if (lessonId && lessons.find(function (l) { return l.id === lessonId; })) {
                openLesson(lessonId);
            }
        }
    };
})();
