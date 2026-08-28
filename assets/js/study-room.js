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
                k01()];
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

    /* ===== N5 KANJI — one consolidated lesson (not segregated into
       per-theme sub-lessons — an earlier version split this into
       k01-k04 by category; the confirmed direction folds it back into
       a single browsable set) covering the full official 103-kanji N5
       list, sourced from the N5 Kanji Trace worksheet
       (assets/lesson pdf/N5_Kanji_Trace.pdf). Readings/meanings are
       transcribed directly from that sheet; onyomi is converted from
       the sheet's hiragana to katakana to match this site's existing
       convention elsewhere (e.g. Shelf 07's kanji tags). Sample words
       and stroke-order paths (real KanjiVG data, same source/technique
       as Kana Dojo) were compiled separately — see kanji-cards.js for
       how this wordBank.kanji shape (on/kun/words/strokes) is consumed;
       the card gallery there is the whole lesson UI, not a quiz. */
    function k01() {
        let kanji = [
            { jp: "一", en: "One", kun: "ひと", on: "イチ・イツ",
                words: [{ jp: "一人", reading: "ひとり", en: "one person" }, { jp: "一月", reading: "いちがつ", en: "January" }, { jp: "一つ", reading: "ひとつ", en: "one (thing)" }, { jp: "一番", reading: "いちばん", en: "number one / best" }, { jp: "一緒に", reading: "いっしょに", en: "together" }],
                strokes: [
                "M11,54.25c3.19,0.62,6.25,0.75,9.73,0.5c20.64-1.5,50.39-5.12,68.58-5.24c3.6-0.02,5.77,0.24,7.57,0.49"
                ] },
            { jp: "七", en: "Seven", kun: "なな・なの", on: "シチ",
                words: [{ jp: "七月", reading: "しちがつ", en: "July" }, { jp: "七つ", reading: "ななつ", en: "seven (things)" }, { jp: "七日", reading: "なのか", en: "the 7th / seven days" }, { jp: "七人", reading: "しちにん", en: "seven people" }, { jp: "七夕", reading: "たなばた", en: "Star Festival" }],
                strokes: [
                "M15.5,51.75c1.82,0.5,4.38,0.88,6.96,0.5c16.91-2.45,50.92-8.12,64.44-8.74c3.02-0.14,4.84,0.24,6.35,0.49",
                "M43,20c1.38,1.38,2.15,3.25,2.15,5.26C45.15,29.5,45,71.84,45,76c0,10.5,2.25,12.25,20.25,12.25c18.75,0,20-3.75,20-2.75"
                ] },
            { jp: "万", en: "Ten Thousand", kun: "—", on: "マン・バン",
                words: [{ jp: "一万", reading: "いちまん", en: "ten thousand" }, { jp: "万年筆", reading: "まんねんひつ", en: "fountain pen" }, { jp: "万国", reading: "ばんこく", en: "all nations" }, { jp: "百万", reading: "ひゃくまん", en: "one million" }, { jp: "万一", reading: "まんいち", en: "by any chance" }],
                strokes: [
                "M14.38,24.73c2.3,0.54,6.52,0.78,8.81,0.54c21.57-2.27,44.44-5.64,64.9-5.98c3.83-0.06,6.12,0.26,8.04,0.53",
                "M51,41.5c1.45,0.7,3.19,1.43,5.19,1.74c7.31,1.14,17.05,1.94,22.64,1.5c4.64-0.37,6.38,1.08,5.17,4.73C77.88,68,72.75,78.75,63.87,90.4c-7.6,9.97-10.12,3.22-12.62,0.2",
                "M51.75,25.5c0.5,2,0.22,3.78-0.21,5.89C48.95,43.8,34.75,73.38,13.56,87.97"
                ] },
            { jp: "三", en: "Three", kun: "み", on: "サン",
                words: [{ jp: "三人", reading: "さんにん", en: "three people" }, { jp: "三月", reading: "さんがつ", en: "March" }, { jp: "三つ", reading: "みっつ", en: "three (things)" }, { jp: "三時", reading: "さんじ", en: "3 o'clock" }, { jp: "三日", reading: "みっか", en: "the 3rd / three days" }],
                strokes: [
                "M27.5,23.65c3.09,0.73,6.29,0.36,9.4,0.06c10.2-1,27-2.94,38.97-3.57c3.06-0.16,6.09-0.2,9.14,0.23",
                "M28.75,55.14c3.13,0.76,6.46,0.43,9.64,0.2c10.03-0.72,23.97-2.63,34.73-3.12c2.7-0.12,5.45-0.16,8.13,0.3",
                "M13,87.83c3.94,1.01,7.72,0.96,11.75,0.72c18.41-1.07,41.27-3.39,61.12-4.07c3.63-0.13,7.2-0.1,10.75,0.78"
                ] },
            { jp: "上", en: "Above, Up, Over", kun: "うえ・あ・のぼ・うわ・かみ", on: "ジョウ",
                words: [{ jp: "上手", reading: "じょうず", en: "skillful" }, { jp: "上着", reading: "うわぎ", en: "jacket" }, { jp: "川上", reading: "かわかみ", en: "upstream" }, { jp: "上がる", reading: "あがる", en: "to rise" }, { jp: "屋上", reading: "おくじょう", en: "rooftop" }],
                strokes: [
                "M52.31,15.88c1.15,1.15,2.01,3.12,2.01,5.12c0,0.82-0.22,63.62-0.25,64.63",
                "M58,44.75c7-0.62,14.25-2.5,17.75-3c1.38-0.2,3.5-0.38,4.75,0",
                "M13.38,88.28c3.6,1.15,7.45,0.62,11.13,0.34c16.23-1.23,41.16-2.66,60.24-2.92c3.65-0.05,7.47-0.32,11,0.82"
                ] },
            { jp: "下", en: "Below, Down, Under, Beneath", kun: "した・さ・くだ・お", on: "カ・ゲ",
                words: [{ jp: "下手", reading: "へた", en: "unskillful" }, { jp: "地下", reading: "ちか", en: "underground" }, { jp: "下さい", reading: "ください", en: "please" }, { jp: "下りる", reading: "おりる", en: "to descend" }, { jp: "下着", reading: "したぎ", en: "underwear" }],
                strokes: [
                "M13.25,22.5c0.94,0.23,5.18,0.96,7.74,0.75c17.87-1.5,46.54-4.75,66.38-4.75c2.92,0,6.42,0.75,7.88,1.25",
                "M52.97,23.25c0.93,1.07,1.56,2.75,1.56,5.3c0,8.65-0.2,39.42-0.27,57.2c-0.02,3.86-0.02,5.89-0.02,8.25",
                "M67.83,37.17C72.75,39.5,79.88,47.62,82,52.12"
                ] },
            { jp: "中", en: "Middle, In, Inside, Center", kun: "なか", on: "チュウ",
                words: [{ jp: "中学校", reading: "ちゅうがっこう", en: "middle school" }, { jp: "中国", reading: "ちゅうごく", en: "China" }, { jp: "一日中", reading: "いちにちじゅう", en: "all day long" }, { jp: "中に", reading: "なかに", en: "inside" }, { jp: "世界中", reading: "せかいじゅう", en: "worldwide" }],
                strokes: [
                "M19.89,36.87c1,1,1.74,2.25,2.01,3.65c1.13,5.71,2.58,13.06,4.17,22.97c0.27,1.68,0.55,4.43,0.83,6.26",
                "M23.33,39.51C37.12,37.62,70.88,34,84,33.24c4.38-0.25,6,1.14,5.12,4.42c-1.53,5.7-5.61,20.18-6.12,22.09",
                "M27.74,64.84C40.12,63.62,61.86,62.2,79,60.77c2.36-0.2,5.75-0.27,7.25-0.27",
                "M52.5,11.5c1.44,1.44,2.25,3.5,2.25,5.06c0,0.9,0.06,56.6-0.15,76.69c-0.03,3.3-0.07,5.6-0.1,6.5"
                ] },
            { jp: "九", en: "Nine", kun: "ここの", on: "ク・キュウ",
                words: [{ jp: "九月", reading: "くがつ", en: "September" }, { jp: "九人", reading: "きゅうにん", en: "nine people" }, { jp: "九つ", reading: "ここのつ", en: "nine (things)" }, { jp: "九時", reading: "くじ", en: "9 o'clock" }, { jp: "九日", reading: "ここのか", en: "the 9th / nine days" }],
                strokes: [
                "M41.88,14.38c1,1.38,1.5,3.25,1.5,5.12c0,40.13-9.12,57.5-28.5,68.75",
                "M13.5,45.75c2.88,0.85,5.78,0.05,8.58-0.66c8.47-2.14,39.88-9.79,40.92-9.84c2.5-0.12,4.75,0.5,4.25,4.75c-0.5,4.25-5.5,20.75-7,32.5c-2.23,17.46,2,19.37,18.21,19.37c13.79,0,19.01-1.07,19.27-10.12"
                ] },
            { jp: "二", en: "Two", kun: "ふた", on: "ニ",
                words: [{ jp: "二人", reading: "ふたり", en: "two people" }, { jp: "二月", reading: "にがつ", en: "February" }, { jp: "二つ", reading: "ふたつ", en: "two (things)" }, { jp: "二階", reading: "にかい", en: "2nd floor" }, { jp: "二十", reading: "にじゅう", en: "twenty" }],
                strokes: [
                "M25.25,32.4c1.77,0.37,4.78,0.56,6.55,0.37c10.82-1.15,28.82-3.4,41.24-3.76c2.95-0.09,4.73,0.18,6.21,0.36",
                "M12,80.75c2.37,0.5,6.73,0.67,9.09,0.5c23.79-1.75,45.04-4.12,67.49-4.74c3.95-0.11,6.32,0.24,8.3,0.49"
                ] },
            { jp: "五", en: "Five", kun: "いつ", on: "ゴ",
                words: [{ jp: "五人", reading: "ごにん", en: "five people" }, { jp: "五月", reading: "ごがつ", en: "May" }, { jp: "五つ", reading: "いつつ", en: "five (things)" }, { jp: "五時", reading: "ごじ", en: "5 o'clock" }, { jp: "五日", reading: "いつか", en: "the 5th / five days" }],
                strokes: [
                "M31.75,23.15c2.8,0.67,5.54,0.42,8.36,0.12c9.3-0.99,22.18-2.4,34.14-3.21c2.49-0.17,5.04-0.33,7.5,0.2",
                "M55.75,25.25c0.62,1.25,1.02,3.01,0.5,5c-3.12,11.88-14,44.12-19.75,59",
                "M25.5,55.25c2.07,1.24,4.73,1.03,7,0.81c15.49-1.45,29.89-3.03,42.25-4.06c3-0.25,4.25,1.75,3.5,3.75c-2.24,5.96-6,20.75-7.75,31.5",
                "M11.25,90.5c3.04,0.81,6.52,0.63,9.63,0.41c15.71-1.1,43.9-2.8,67.75-3.8c3.41-0.14,6.9-0.4,10.25,0.39"
                ] },
            { jp: "人", en: "Person", kun: "ひと・と", on: "ニン・ジン",
                words: [{ jp: "日本人", reading: "にほんじん", en: "Japanese person" }, { jp: "一人", reading: "ひとり", en: "one person" }, { jp: "人気", reading: "にんき", en: "popularity" }, { jp: "外国人", reading: "がいこくじん", en: "foreigner" }, { jp: "大人", reading: "おとな", en: "adult" }],
                strokes: [
                "M54.5,20c0.37,2.12,0.23,4.03-0.22,6.27C51.68,39.48,38.25,72.25,16.5,87.25",
                "M46,54.25c6.12,6,25.51,22.24,35.52,29.72c3.66,2.73,6.94,4.64,11.48,5.53"
                ] },
            { jp: "今", en: "Now", kun: "いま", on: "コン",
                words: [{ jp: "今日", reading: "きょう", en: "today" }, { jp: "今年", reading: "ことし", en: "this year" }, { jp: "今週", reading: "こんしゅう", en: "this week" }, { jp: "今月", reading: "こんげつ", en: "this month" }, { jp: "今晩", reading: "こんばん", en: "tonight" }],
                strokes: [
                "M49.42,14.25c0.1,1.11-0.11,2.93-0.71,4.47C44.5,29.5,32,47.25,11.5,61.75",
                "M50.66,18.99c6.1,7.28,32.37,31.03,39.1,36.36c2.28,1.81,5.21,2.58,7.49,3.09",
                "M39.23,50.26c1.27,0.24,2.64,0.37,4.13,0.18c5.39-0.68,11.02-1.69,15.86-2.31c1.8-0.23,3.66-0.38,4.8-0.08",
                "M33.25,67.75c2.12,0.38,3.57,0.61,6,0.25c6.31-0.93,18.5-3.25,25.24-4.44C68.48,62.85,70,65,68,68.75C63.33,77.5,58.75,85,53,94.5"
                ] },
            { jp: "休", en: "Rest", kun: "やす", on: "キュウ",
                words: [{ jp: "休み", reading: "やすみ", en: "rest / holiday" }, { jp: "休日", reading: "きゅうじつ", en: "holiday" }, { jp: "休む", reading: "やすむ", en: "to rest" }, { jp: "夏休み", reading: "なつやすみ", en: "summer vacation" }, { jp: "休憩", reading: "きゅうけい", en: "break" }],
                strokes: [
                "M35,16.5c0.25,1.75,0.25,4.25-0.88,6.8C28.91,35.01,22.37,46.02,10.5,60.29",
                "M26.28,42.5c0.72,1.25,1.26,3.48,1.26,4.75c0,12.75-0.07,29.88-0.26,42.25c-0.02,1.54-0.04,2.97-0.04,4.25",
                "M37.65,38.83c2.45,0.97,5.18,0.75,7.73,0.54c11.76-0.97,24.94-3.35,37.49-4.01c2.65-0.14,5.39-0.22,7.99,0.39",
                "M61.43,14c0.82,0.75,1.87,2.12,1.87,3.7c0,8.8,0.05,53.72-0.12,72.05c-0.03,2.88-0.06,4.91-0.08,5.75",
                "M62.43,38.32c0,2.18-1.1,4.31-1.9,6.04C54.57,57.4,44.96,71.84,35,78.75",
                "M64.12,38.08c4.45,8.37,16.21,25.33,24.99,33.19c1.96,1.76,4.35,4.18,6.9,5"
                ] },
            { jp: "会", en: "Meet", kun: "あ", on: "カイ",
                words: [{ jp: "会う", reading: "あう", en: "to meet" }, { jp: "会社", reading: "かいしゃ", en: "company" }, { jp: "会話", reading: "かいわ", en: "conversation" }, { jp: "大会", reading: "たいかい", en: "tournament" }, { jp: "会員", reading: "かいいん", en: "member" }],
                strokes: [
                "M52.25,14c0.25,2.28-0.52,3.59-1.8,5.62c-5.76,9.14-17.9,27-39.2,39.88",
                "M54.5,19.25c6.73,7.3,24.09,24.81,32.95,31.91c2.73,2.18,5.61,3.8,9.05,4.59",
                "M37.36,50.16c1.64,0.34,4.04,0.36,4.98,0.25c6.79-0.79,14.29-1.91,19.66-2.4c1.56-0.14,3.25-0.39,4.66,0",
                "M23,65.98c2.12,0.52,4.25,0.64,7.01,0.3c13.77-1.71,30.99-3.66,46.35-3.74c3.04-0.02,4.87,0.14,6.4,0.29",
                "M47.16,66.38c0.62,1.65-0.03,2.93-0.92,4.28c-5.17,7.8-8.02,11.38-14.99,18.84c-2.11,2.25-1.5,4.18,2,3.75c7.35-0.91,28.19-5.83,40.16-7.95",
                "M66.62,77.39c4.52,3.23,11,12.73,13.06,18.82"
                ] },
            { jp: "何", en: "What", kun: "なに・なん", on: "カ",
                words: [{ jp: "何", reading: "なに", en: "what" }, { jp: "何時", reading: "なんじ", en: "what time" }, { jp: "何か", reading: "なにか", en: "something" }, { jp: "何人", reading: "なんにん", en: "how many people" }, { jp: "何曜日", reading: "なんようび", en: "what day of the week" }],
                strokes: [
                "M32.5,13.75c0.23,2.1-0.19,3.81-0.8,5.66c-3.95,11.84-9.67,23.37-20.45,37.34",
                "M26.76,36.5c1.24,1.5,1.54,3.04,1.54,5.5c0,9.46-0.13,30.79-0.17,44.62c-0.01,2.6-0.01,4.94-0.01,6.88",
                "M38.88,26.64c1.74,0.5,4.68,0.67,6.41,0.5c13.21-1.27,33.84-4.77,46.26-5.86c2.88-0.25,4.63,0.24,6.08,0.49",
                "M40.87,44c0.75,0.75,1.26,1.62,1.36,2.21c0.67,4.06,1.44,10.16,2.25,16.3c0.27,2.04,0.26,2.01,0.47,3.75",
                "M43.27,45.6c6.28-1.17,15.14-2.97,19.73-3.72c3.13-0.51,4.4,0.31,3.68,3.51c-0.86,3.86-2.49,10.33-3.28,14.14",
                "M45.59,63.17c3.71-0.39,9.45-1.24,14.45-1.85c1.89-0.23,3.82-0.47,5.75-0.69",
                "M83.25,24.75c1,1,1.74,2.18,1.81,4.99c0.33,13.52-0.21,56.44-0.21,61.04c0,10.71-6.35,2.71-9.18-0.77"
                ] },
            { jp: "先", en: "Previous, Ahead, Past, Former", kun: "さき・まず", on: "セン",
                words: [{ jp: "先生", reading: "せんせい", en: "teacher" }, { jp: "先週", reading: "せんしゅう", en: "last week" }, { jp: "先月", reading: "せんげつ", en: "last month" }, { jp: "先に", reading: "さきに", en: "ahead / first" }, { jp: "先輩", reading: "せんぱい", en: "senior / upperclassman" }],
                strokes: [
                "M37.51,21c0.07,0.62,0.15,1.61-0.14,2.49C35.25,29.88,31.62,37.38,24.5,45",
                "M38.13,32.04c1.5,0.09,3.95-0.16,4.64-0.22c6.48-0.57,20.36-1.82,27.82-2.94c1.65-0.25,3.66-0.13,5.16,0.27",
                "M52.81,12.38c1.28,1.28,2.01,3.12,2.01,4.75c0,0.75-0.05,31.92-0.07,32.87",
                "M15.88,53.26c3.42,0.98,7.15,0.5,10.62,0.22c15.99-1.3,38.99-3.55,59-4.4c2.94-0.13,5.84-0.03,8.75,0.47",
                "M45.18,55.68c0.32,1.45,0.15,2.48-0.15,3.85C43.24,67.65,35,86.62,20,96.38",
                "M60.49,53.62c1.07,1.07,1.38,2.71,1.38,4.98c0,7.78-0.22,14.88-0.22,21.89c0,15.14,1.1,16.04,15.85,16.04c14.62,0,15.64-1.78,15.64-11.29"
                ] },
            { jp: "入", en: "Enter", kun: "はい・い", on: "ニュウ",
                words: [{ jp: "入る", reading: "はいる", en: "to enter" }, { jp: "入り口", reading: "いりぐち", en: "entrance" }, { jp: "入学", reading: "にゅうがく", en: "school entry" }, { jp: "入れる", reading: "いれる", en: "to put in" }, { jp: "輸入", reading: "ゆにゅう", en: "import" }],
                strokes: [
                "M54.75,48.75c-0.5,2-1.1,3.2-2.07,4.62C44.22,65.8,27.98,81.44,14.5,88",
                "M36.5,20c8.25,1.38,15.12,34,48.81,62.08c2.71,2.26,5.56,4.8,9.44,6.42"
                ] },
            { jp: "八", en: "Eight", kun: "や・よう", on: "ハチ",
                words: [{ jp: "八月", reading: "はちがつ", en: "August" }, { jp: "八人", reading: "はちにん", en: "eight people" }, { jp: "八つ", reading: "やっつ", en: "eight (things)" }, { jp: "八時", reading: "はちじ", en: "8 o'clock" }, { jp: "八日", reading: "ようか", en: "the 8th / eight days" }],
                strokes: [
                "M37.22,45c0.28,1.5,0.2,3.21-0.86,5.48c-4.23,9.02-11.48,20.4-24.1,32.02",
                "M48,27.25c9.38,0.25,21.12,30,37.27,45.72c3.79,3.69,6.73,5.66,9.98,7.03"
                ] },
            { jp: "六", en: "Six", kun: "む", on: "ロク",
                words: [{ jp: "六月", reading: "ろくがつ", en: "June" }, { jp: "六人", reading: "ろくにん", en: "six people" }, { jp: "六つ", reading: "むっつ", en: "six (things)" }, { jp: "六時", reading: "ろくじ", en: "6 o'clock" }, { jp: "六日", reading: "むいか", en: "the 6th / six days" }],
                strokes: [
                "M51.87,17.5c1.78,1.78,2.71,3.48,2.71,6.5c0,6.46,0.12,9.16,0.12,14.35",
                "M13.5,42.13c3.27,0.74,7.11,0.89,9.93,0.64c21.56-1.9,41.78-5.02,61.41-5.47c4.8-0.11,7.49,0.31,11.06,1.07",
                "M38.11,58.6c0.51,1.37,0.42,3.67-0.49,5.29C33.38,71.38,24,82.38,15.41,88.75",
                "M70.16,59.92c9.96,8.61,18.18,18.54,23.16,28.99"
                ] },
            { jp: "円", en: "Yen, Round, Circle", kun: "まる", on: "エン",
                words: [{ jp: "円", reading: "えん", en: "yen" }, { jp: "百円", reading: "ひゃくえん", en: "100 yen" }, { jp: "円い", reading: "まるい", en: "round" }, { jp: "円形", reading: "えんけい", en: "circular shape" }, { jp: "千円", reading: "せんえん", en: "1000 yen" }],
                strokes: [
                "M21.75,19.8c0.91,0.91,1.47,3.23,1.5,5.45c0.2,13.9,0.03,47.69,0.03,62.5c0,2-0.03,4.99-0.03,6",
                "M24.06,21.56c15.07-1.68,49.46-5.58,57.92-6.31c2.9-0.25,4.78,1.88,4.78,4.27c0,13.48,0,53.21,0,67.48c0,9.75-4.25,6.5-8.5,1.5",
                "M52.25,20.75c0.88,0.88,1.5,2,1.5,3.71c0,6.76,0,27.54,0,31.04",
                "M24.75,59.75c14.62-1.75,43-4.25,60.5-5.25"
                ] },
            { jp: "出", en: "Exit", kun: "で・だ", on: "シュツ",
                words: [{ jp: "出る", reading: "でる", en: "to exit / leave" }, { jp: "出口", reading: "でぐち", en: "exit" }, { jp: "出す", reading: "だす", en: "to take out" }, { jp: "出発", reading: "しゅっぱつ", en: "departure" }, { jp: "思い出", reading: "おもいで", en: "memory" }],
                strokes: [
                "M52.76,13.38c1.42,1.42,1.86,2.91,1.86,5.31c0,3.18,0.19,61.81,0.19,68.31",
                "M29.02,36.13c0.98,1.12,1.23,2.87,1.06,4.04c-0.4,2.82-1.02,7.67-2.78,13.4c-0.43,1.41,0.07,2.84,1.55,2.39c10.61-3.24,33.9-5.33,55.97-6.28",
                "M86.31,30.63c0.94,1.37,1.17,3,0.94,4.87c-0.62,5.12-0.86,7.07-1.66,13.48c-0.15,1.19-0.34,1.9-0.51,3.4",
                "M25.27,71.13c1.11,1.11,1.6,2.74,1.31,4.29c-0.53,2.8-1.27,8.92-3.03,14.65c-0.43,1.41,0.57,3.11,2.05,2.64c12.9-4.08,41.9-6.21,59.47-7.03",
                "M85.06,66.88c1.06,1.49,1.56,3.12,1.44,5.37c-0.27,4.8-0.23,9.14-0.45,13.51c-0.08,1.54-0.17,3.17-0.3,4.99"
                ] },
            { jp: "分", en: "Part, Minute, Separate, Understand", kun: "わ", on: "ブン・フン・ブ",
                words: [{ jp: "十分", reading: "じゅっぷん", en: "ten minutes" }, { jp: "半分", reading: "はんぶん", en: "half" }, { jp: "分かる", reading: "わかる", en: "to understand" }, { jp: "自分", reading: "じぶん", en: "oneself" }, { jp: "気分", reading: "きぶん", en: "feeling / mood" }],
                strokes: [
                "M41.12,19.38c0.25,1.24-0.44,3.01-1.1,4.08C34.31,32.72,27.13,40.62,13,51.25",
                "M54.69,13.75c7.56-0.12,20.68,19.17,29.41,25.95c3.07,2.39,6.02,4.05,10.4,5.3",
                "M29.35,55.37c2.42,0.83,4.97,0.75,7.42,0.37c11.06-1.7,28.87-5.3,34.1-5.76c3.69-0.33,5.08,1.48,4.88,3.77c-0.54,6.05-5.94,29.03-10.5,36.3c-4.99,7.96-5.74,4.21-9.84-0.49",
                "M49.12,57.25c0.15,1.49,0.06,2.72-0.56,4.08C43.5,72.5,35.75,82,22.5,90.75"
                ] },
            { jp: "前", en: "Front, Before", kun: "まえ", on: "ゼン",
                words: [{ jp: "前", reading: "まえ", en: "before / front" }, { jp: "名前", reading: "なまえ", en: "name" }, { jp: "午前", reading: "ごぜん", en: "a.m." }, { jp: "前に", reading: "まえに", en: "before" }, { jp: "駅前", reading: "えきまえ", en: "in front of the station" }],
                strokes: [
                "M33.5,14.5c3.34,2.07,8.64,8.5,9.48,11.72",
                "M72.67,12c0.26,1.14,0.07,2.23-0.52,3.19c-2.12,3.41-6.02,8.65-8.6,11.31",
                "M13.38,33.24c2.63,0.72,7.46,0.94,10.08,0.72c21.67-1.83,39.8-3.58,62.68-4.61c4.37-0.2,7.01,0.34,9.2,0.7",
                "M24.65,45.46c1.1,1.29,1.63,2.92,1.63,4.17c0,3.05,0.1,28.65,0.08,40.62c0,3.23-0.03,5.46-0.1,6",
                "M27.01,46.8c2.3-0.41,13.37-2.3,17.2-2.9c2.2-0.34,3.51,1.1,3.51,3.24c0,1.02-0.16,30.82-0.16,44.63c0,5.48-3.79,2.98-5.93,0.53",
                "M27.65,60.01c5.72-0.76,13.63-1.81,18.59-2.32",
                "M27.57,73.47c4.41-0.51,13.3-1.54,18.4-1.89",
                "M62.27,47.58c1.2,1.2,1.76,2.67,1.76,4.58c0,8.93-0.01,15.1-0.09,18.59c-0.04,1.49-0.09,2.76-0.16,4.05",
                "M78.85,39.25c1.26,1.26,2.01,2.88,2.01,5.02c0,14.56-0.01,42.91-0.01,47.87c0,8.62-5.96,1-7.46-0.25"
                ] },
            { jp: "北", en: "North", kun: "きた", on: "ホク",
                words: [{ jp: "北", reading: "きた", en: "north" }, { jp: "北海道", reading: "ほっかいどう", en: "Hokkaido" }, { jp: "東北", reading: "とうほく", en: "Tohoku / northeast" }, { jp: "北風", reading: "きたかぜ", en: "north wind" }, { jp: "北口", reading: "きたぐち", en: "north exit" }],
                strokes: [
                "M13.25,48.75c2.61,0.5,3.52,0.51,6.12,0.25c3.76-0.38,14.13-3.38,17.63-3.75",
                "M37.25,21.5c1.19,1.19,2,3.25,2,4.75c0,1,0.25,48,0.25,50.75",
                "M12.75,88.75c1.88,1.12,4.29,0.87,6.5-0.25C32.5,81.75,36.5,80,43.5,76.25",
                "M90.25,33c-0.25,1.75-1.13,3.26-2.19,4.07C82.12,41.62,73.75,46.5,65,49.75",
                "M60.37,19.5c1.38,1.5,1.91,3.25,1.91,5.3c0,1.12-0.28,33.71-0.28,47.7c0,14,2,15.75,17.25,15.75c15.5,0,16.5-1.5,16.5-12.49"
                ] },
            { jp: "十", en: "Ten", kun: "とお", on: "ジュウ",
                words: [{ jp: "十月", reading: "じゅうがつ", en: "October" }, { jp: "十人", reading: "じゅうにん", en: "ten people" }, { jp: "十日", reading: "とおか", en: "the 10th / ten days" }, { jp: "二十", reading: "にじゅう", en: "twenty" }, { jp: "十分", reading: "じゅうぶん", en: "enough / sufficiently" }],
                strokes: [
                "M11.88,50.98c3.18,0.89,6.62,0.61,9.87,0.35c19.92-1.58,45.23-4.76,63.38-5.82c3.85-0.23,7.23-0.07,11,0.56",
                "M52.22,11.63c1.4,1.4,2.2,3.96,2.2,6.26c0,1.13-0.03,51.22-0.19,73.41c-0.03,3.96-0.06,6.83-0.08,8.08"
                ] },
            { jp: "千", en: "Thousand", kun: "ち", on: "セン",
                words: [{ jp: "千円", reading: "せんえん", en: "1000 yen" }, { jp: "千人", reading: "せんにん", en: "a thousand people" }, { jp: "三千", reading: "さんぜん", en: "3000" }, { jp: "千葉", reading: "ちば", en: "Chiba (place name)" }, { jp: "八百屋", reading: "やおや", en: "greengrocer" }],
                strokes: [
                "M70.38,10.17c-0.13,1.58-0.83,2.64-2.17,3.67c-5.71,4.41-21.46,11.91-41.57,16.82",
                "M12.13,50.83c3.36,0.94,7.21,0.75,10.63,0.49c17.76-1.34,37.63-4.16,66.24-4.94c3.08-0.08,6.08-0.14,9.13,0.38",
                "M54.56,25.25c1.03,1.03,2.01,3,2.01,5.18c0,0.9-0.07,46.38-0.19,63.58c-0.02,2.93-0.04,5.04-0.06,5.99"
                ] },
            { jp: "午", en: "Noon", kun: "—", on: "ゴ",
                words: [{ jp: "午前", reading: "ごぜん", en: "a.m." }, { jp: "午後", reading: "ごご", en: "p.m." }, { jp: "正午", reading: "しょうご", en: "noon" }, { jp: "午前中", reading: "ごぜんちゅう", en: "during the morning" }, { jp: "午後三時", reading: "ごごさんじ", en: "3 p.m." }],
                strokes: [
                "M37.5,9.14c0.06,0.7,0.22,1.85-0.11,2.83C35.25,18.25,27,29.62,17.5,39",
                "M32.13,27.28c2.75,0.09,4.3-0.07,5.82-0.21c12.92-1.2,20.78-2.82,33.1-4.68c2.49-0.38,4.69-0.24,5.95,0.03",
                "M13.88,54.53c3,0.72,7.23,0.71,9.74,0.46c19.64-1.99,42.64-4.99,63-6.16c4.22-0.24,6.77,0.22,8.89,0.45",
                "M53.06,28.13c1.03,1.03,1.79,2.37,1.79,4.33c0,0.88-0.02,44.17-0.13,61.04c-0.02,2.88-0.03,4.96-0.05,5.88"
                ] },
            { jp: "半", en: "Half", kun: "なか", on: "ハン",
                words: [{ jp: "半分", reading: "はんぶん", en: "half" }, { jp: "三時半", reading: "さんじはん", en: "3:30" }, { jp: "半年", reading: "はんとし", en: "half a year" }, { jp: "前半", reading: "ぜんはん", en: "first half" }, { jp: "半日", reading: "はんにち", en: "half a day" }],
                strokes: [
                "M26.02,22.58c3.9,2.41,10.07,9.89,11.04,13.63",
                "M82.75,18.75c0.16,1.19-0.39,2.25-1.01,3.2c-2.57,3.96-7.16,8.76-12.62,12.92",
                "M28.3,48.57c1.78,0.38,5.07,0.21,6.83,0.03c10.62-1.09,29.12-2.99,38.5-3.67c2.97-0.22,4.75-0.17,6.24,0.02",
                "M13.5,67.22c2.25,0.91,6.85,1.03,9.22,0.78c18.28-1.87,40.4-3.58,62.61-4.38c4-0.14,6.41,0.25,8.42,0.52",
                "M52.67,11.5c1.23,1.23,1.85,3.17,1.85,4.4c0,7.6,0.1,54.35,0.1,75.1c0,3.18-0.07,5.46-0.11,6.5"
                ] },
            { jp: "南", en: "South", kun: "みなみ", on: "ナン",
                words: [{ jp: "南", reading: "みなみ", en: "south" }, { jp: "南口", reading: "みなみぐち", en: "south exit" }, { jp: "東南", reading: "とうなん", en: "southeast" }, { jp: "南極", reading: "なんきょく", en: "the South Pole" }, { jp: "南米", reading: "なんべい", en: "South America" }],
                strokes: [
                "M27.38,28.25c1.82,0.38,4.2,0.45,7.22,0.2c11.52-0.95,28.37-3.2,40.58-3.7c3.03-0.12,4.92-0.23,6.82,0",
                "M52.35,10.75c0.95,0.95,1.55,2.86,1.55,3.96c0,7.3,0,19.47,0,28.54",
                "M20.25,45.75c1.25,1.25,1.89,2.74,2,5c0.19,4.06,0.83,27.03,1.12,37.99c0.08,3.23,0.13,5.48,0.13,6.01",
                "M22.78,47.6c16.31-1.76,59.32-6.35,60.97-6.35c5,0,6.25,1.62,6.25,6.75c0,5.25-0.25,37.3-0.25,43.05c0,7.7-3.5,6.45-9.5,0.95",
                "M38.5,49.38c2.58,1.74,6.66,7.14,7.31,9.84",
                "M66.25,45.5c0.05,0.89-0.07,1.75-0.37,2.59c-0.8,2.73-2.75,6.92-5.26,9.66",
                "M34.78,61.67c1.81,0.39,4.55,0.55,6.36,0.39c9.11-0.8,18.63-1.54,27.63-2.39c2.99-0.28,4.83-0.32,6.33-0.12",
                "M33.13,74.19c1.81,0.49,4.55,0.83,6.38,0.74c10.73-0.56,22.66-1.94,31.04-2.66c3-0.26,4.82-0.02,6.33,0.23",
                "M53.5,62.5c0.75,0.75,1,2.14,0.99,3.5c-0.04,6.22-0.15,18.46-0.21,25.26c-0.02,2.19-0.03,3.81-0.03,4.49"
                ] },
            { jp: "友", en: "Friend", kun: "とも", on: "ユウ",
                words: [{ jp: "友達", reading: "ともだち", en: "friend" }, { jp: "親友", reading: "しんゆう", en: "close friend" }, { jp: "友人", reading: "ゆうじん", en: "friend (formal)" }, { jp: "友情", reading: "ゆうじょう", en: "friendship" }, { jp: "学友", reading: "がくゆう", en: "schoolmate" }],
                strokes: [
                "M17.88,37.23c2.13,0.54,5.78,0.58,7.89,0.29c17.48-2.39,35.98-4.39,54.65-5.48c3.54-0.21,5.68,0.01,7.46,0.28",
                "M48.22,14.14c0.53,2.11,0.53,4.3,0.31,6.73C47,38,33,72.5,15.5,85.25",
                "M42.66,54.86c1.09,0.27,2.51,0.28,3.59,0.14c6.88-0.88,16.62-3.25,22.43-4.88c3.45-0.97,4.6,1.45,3.11,4.55C66.5,65.62,48.12,87.75,24,96.5",
                "M41.25,63.5c5.15,0.45,27.5,18.62,40.93,26.36c3.2,1.84,6.65,3.76,10.32,4.39"
                ] },
            { jp: "口", en: "Mouth", kun: "くち", on: "コウ・ク",
                words: [{ jp: "口", reading: "くち", en: "mouth" }, { jp: "入り口", reading: "いりぐち", en: "entrance" }, { jp: "出口", reading: "でぐち", en: "exit" }, { jp: "人口", reading: "じんこう", en: "population" }, { jp: "窓口", reading: "まどぐち", en: "counter / window" }],
                strokes: [
                "M22.25,33.25c1.25,1.25,2,2.88,2.26,4.43c1.16,7.03,3.15,23.61,4.68,37.85C29.46,78.09,29.73,80.6,30,83",
                "M25.29,35.67c17.46-2.17,41.59-5.04,55.49-5.93c3.94-0.25,6.33,2.72,5.72,5.14c-2.25,8.87-6.62,26.5-9,38.87",
                "M30.25,77.75c10.5-0.5,30.53-2.3,44.99-3.04c2.05-0.11,3.99-0.18,5.76-0.21"
                ] },
            { jp: "古", en: "Old", kun: "ふる", on: "コ",
                words: [{ jp: "古い", reading: "ふるい", en: "old" }, { jp: "古本", reading: "ふるほん", en: "used book" }, { jp: "中古", reading: "ちゅうこ", en: "secondhand" }, { jp: "古代", reading: "こだい", en: "ancient times" }, { jp: "古都", reading: "こと", en: "old capital" }],
                strokes: [
                "M11.25,43.25c2.75,0.62,5.54,0.83,9.53,0.5c23.85-2,49.47-4.12,67.35-4.75c4.02-0.14,6.87,0,9.12,0.5",
                "M52.41,12.5c1.42,1.42,2.13,3.25,2.13,5.06c0,17.05-0.14,39.31-0.14,48.94",
                "M31,67.77c1.12,1.12,2,2.73,2.24,4.48c0.61,4.43,1.87,12.12,3.22,20.93c0.2,1.31,0.39,2.59,0.57,3.83",
                "M33.77,69.3c11.97-1.17,36.4-3.39,42.99-3.81c3.74-0.24,5.11,1.39,4.26,4.71c-1.18,4.63-3.81,13.6-5.23,20.06",
                "M37.88,94.42c7.81-0.36,23.99-1.88,35.14-2.65c1.87-0.13,3.61-0.24,5.18-0.32"
                ] },
            { jp: "右", en: "Right", kun: "みぎ", on: "ウ・ユウ",
                words: [{ jp: "右", reading: "みぎ", en: "right" }, { jp: "右手", reading: "みぎて", en: "right hand" }, { jp: "右側", reading: "みぎがわ", en: "right side" }, { jp: "左右", reading: "さゆう", en: "left and right" }, { jp: "右折", reading: "うせつ", en: "turning right" }],
                strokes: [
                "M53.5,21.5c0.62,1.12,0.69,2.23,0.25,4C49.62,42,39.5,61,25.25,74.25",
                "M13,42.15c1.9,0.56,5.9,0.52,7.79,0.34c23.41-2.24,49.76-5.74,67.67-6.3c3.24-0.1,6.45,0.31,9.17,0.81",
                "M41.75,66.5c0.75,0.75,1.35,1.93,1.54,2.95c0.94,5,2.38,16.66,3.07,22.76c0.24,2.15,0.39,2.8,0.39,3.54",
                "M43.25,68c5.25-0.5,29.75-3.25,37-3.75c1.75-0.12,3.24,1.52,3,2.75c-1,5.12-3.38,18-4.5,23.25",
                "M47,93.25c5.79-0.2,19.51-1.58,28.25-2.23c2.21-0.17,4.18-0.27,5.75-0.27"
                ] },
            { jp: "名", en: "Name, Famous", kun: "な", on: "メイ・ミョウ",
                words: [{ jp: "名前", reading: "なまえ", en: "name" }, { jp: "有名", reading: "ゆうめい", en: "famous" }, { jp: "名字", reading: "みょうじ", en: "surname" }, { jp: "地名", reading: "ちめい", en: "place name" }, { jp: "本名", reading: "ほんみょう", en: "real name" }],
                strokes: [
                "M54.2,12.64c0.3,1.61-0.07,2.99-0.69,4.24c-3.49,7.13-13.28,19.29-25.96,27.54",
                "M53.25,24.16c0.88,0.47,1.95,0.5,3.28,0.37c4.37-0.43,11.99-2.47,17.81-4.1c4.18-1.17,5.46,1.02,4.41,3.51C72.25,39.38,43.88,69.62,16,77.5",
                "M43.62,40.88c3.62,2,8,6,9.68,9.58",
                "M42,67.81c0.91,0.91,1.62,2.19,1.83,3.33c0.5,2.82,2.15,14.38,3.05,20.86c0.3,2.12,0.52,3.7,0.59,4.25",
                "M44.53,69.52c10.82-1.38,32.39-4.4,38.01-4.53c2.76-0.06,4.08,1.63,3.25,4.64c-1.13,4.06-3.52,14.04-4.64,20.36",
                "M47.99,93.99c7.26-0.61,19.65-1.61,29.54-2.37c2.19-0.17,4.24-0.28,6.04-0.31"
                ] },
            { jp: "四", en: "Four", kun: "よん・よ", on: "シ",
                words: [{ jp: "四月", reading: "しがつ", en: "April" }, { jp: "四人", reading: "よにん", en: "four people" }, { jp: "四つ", reading: "よっつ", en: "four (things)" }, { jp: "四時", reading: "よじ", en: "4 o'clock" }, { jp: "四日", reading: "よっか", en: "the 4th / four days" }],
                strokes: [
                "M14.5,31.48c1.51,1.51,2.25,3.27,2.53,5.2c1.14,7.9,2.61,25.18,4.39,40.83c0.29,2.55,0.34,3.81,0.64,6.24",
                "M17.85,34.04c21.65-1.92,51.52-3.92,67.82-4.3c4.85-0.11,6.31,2.62,6.04,5.38c-0.9,9.02-4.17,28.29-6.41,39.62c-0.49,2.49-0.94,4.6-1.3,6.13",
                "M40.5,36c0.08,0.64,0.12,1.65-0.16,2.57c-2.22,7.3-5.1,14.55-13.35,22.68",
                "M59.75,34.25c0.8,1.05,1.44,2.29,1.49,3.92c0.11,3.62,0.05,7.05,0.05,9.89c0,6.94,0.71,7.54,9.47,7.54c4.99,0,8.86-0.72,10.25-1.72",
                "M22.73,79.32c13.77-0.57,43.64-1.8,61.18-2.08"
                ] },
            { jp: "国", en: "Country", kun: "くに", on: "コク",
                words: [{ jp: "国", reading: "くに", en: "country" }, { jp: "外国", reading: "がいこく", en: "foreign country" }, { jp: "中国", reading: "ちゅうごく", en: "China" }, { jp: "国語", reading: "こくご", en: "national language" }, { jp: "国際", reading: "こくさい", en: "international" }],
                strokes: [
                "M19,16.82c1.09,1.09,1.61,2.51,1.61,4.41c0,14.65-0.22,44.9-0.22,71.53c0,1.95-0.06,3.86-0.09,5.75",
                "M21.52,18.67C41.38,16.75,74.03,13.5,85,13.5c3.38,0,5,1.85,5,5.25c0,15.36-0.04,47.89-0.08,70.62c0,1.68,0,3.31,0,4.88",
                "M35.12,33.88c1.32,0.28,4.2,0.44,5.51,0.28c10.47-1.29,20.62-2.54,28.62-3.13c2.02-0.15,3.88-0.19,5.56,0.04",
                "M52.8,34.89c0.96,0.97,1.47,2.48,1.47,3.81c0,3.99-0.13,24.74-0.09,33.55",
                "M37.58,52.16c1.79,0.22,3.41,0.14,5.36-0.08c7.56-0.83,17.56-1.99,25.38-2.8c1.25-0.13,4.02-0.15,5.89,0.17",
                "M31.08,75.14c1.54,0.36,3.85,0.28,5.19,0.16c9.98-0.92,25.85-2.67,37.03-3.54c2.15-0.17,5.04-0.18,6.12,0.13",
                "M67.75,56.62c3,1.75,6.12,5.12,8,8.38",
                "M21.5,93.01c14.25-0.51,48.38-1.89,67-2.51"
                ] },
            { jp: "土", en: "Dirt, Soil, Earth, Ground", kun: "つち", on: "ド・ト",
                words: [{ jp: "土曜日", reading: "どようび", en: "Saturday" }, { jp: "土", reading: "つち", en: "dirt / soil" }, { jp: "土地", reading: "とち", en: "land" }, { jp: "粘土", reading: "ねんど", en: "clay" }, { jp: "風土", reading: "ふうど", en: "local climate/features" }],
                strokes: [
                "M26.63,50.89c1.63,0.4,4.64,0.6,6.26,0.4C43.5,50,62.12,48,75.66,46.92c2.71-0.22,4.36,0.19,5.72,0.39",
                "M52.17,17.37c1.17,1.17,2.02,3.13,2.02,4.64c0,10.25,0.14,61.06,0.14,63.36",
                "M15.38,87.73c2.12,0.54,6.01,0.73,8.12,0.54C46,86.25,69,84.62,90.34,83.79c3.53-0.14,5.65,0.26,7.41,0.53"
                ] },
            { jp: "外", en: "Outside", kun: "そと・はず", on: "ガイ",
                words: [{ jp: "外", reading: "そと", en: "outside" }, { jp: "外国", reading: "がいこく", en: "foreign country" }, { jp: "外出", reading: "がいしゅつ", en: "going out" }, { jp: "外側", reading: "そとがわ", en: "outer side" }, { jp: "海外", reading: "かいがい", en: "overseas" }],
                strokes: [
                "M35.44,15.75c0.53,1.77,0.62,3.56,0.13,5.33C33.25,29.5,26.75,44.75,16.5,55",
                "M36.72,28.81c1.47,0.25,3.12,0.16,4.56-0.14c3.52-0.72,5.83-1.04,9.45-2.2c3.61-1.17,4.39,1.7,3.77,3.54c-5.46,16.06-22.18,50.32-39.75,58.5",
                "M27.5,47c3.71,1.68,9.57,6.89,10.5,9.5",
                "M65.56,12.13c1.09,1.09,1.76,2.87,1.76,5.25c0,0.78-0.07,54.62-0.19,73.62c-0.02,3.16-0.04,5.33-0.06,6.13",
                "M71.5,42.5c7.85,3.75,20.29,15.42,22.25,21.25"
                ] },
            { jp: "多", en: "Many, Much, Lots Of", kun: "おお", on: "タ",
                words: [{ jp: "多い", reading: "おおい", en: "many" }, { jp: "多分", reading: "たぶん", en: "probably" }, { jp: "多数", reading: "たすう", en: "large number" }, { jp: "多少", reading: "たしょう", en: "somewhat" }, { jp: "多様", reading: "たよう", en: "diverse" }],
                strokes: [
                "M45.82,11.92c0.18,1.08-0.22,2.3-0.66,3.01C42.5,19.25,37,26.33,28.5,31.25",
                "M48.24,16.65c1.38,0.22,3.15,0.08,4.79-0.12c5.59-0.66,9.72-1.28,14.9-2.3c3.15-0.62,4.07,1.15,3.01,3.46c-4.46,9.74-24.82,31.44-44.28,37.66",
                "M40,28.25c2.67,1.56,7,6.5,7.75,9",
                "M58.5,42.25c0.25,1.5-0.11,2.78-0.48,3.6C55.25,52,48.75,59.5,33.75,68.5",
                "M60.42,48.62c1.58,0.13,3.01,0.09,4.6-0.09c5.86-0.66,9.23-1.16,13.48-2.03c3.13-0.64,4.62,1.62,3.48,4.09c-5,10.79-23.61,34.91-54.73,48.16",
                "M48.25,63c2.93,1.73,7.67,7.22,8.5,10"
                ] },
            { jp: "大", en: "Big, Large", kun: "おお", on: "タイ・ダイ",
                words: [{ jp: "大きい", reading: "おおきい", en: "big" }, { jp: "大学", reading: "だいがく", en: "university" }, { jp: "大丈夫", reading: "だいじょうぶ", en: "okay / fine" }, { jp: "大切", reading: "たいせつ", en: "important" }, { jp: "大人", reading: "おとな", en: "adult" }],
                strokes: [
                "M19.38,48.25c1.49,0.51,5.03,0.89,7.6,0.49C41.12,46.5,63,43,77.19,42.44c2.7-0.11,4.87-0.06,7.31,0.33",
                "M49.5,18c0.88,2.12,1.03,4.16,0.99,6.32C50,57,37.75,81.12,18,91.75",
                "M49.5,46c9,10.5,28.5,36.25,37.49,43.28c3.06,2.39,5.62,3.75,7.01,3.97"
                ] },
            { jp: "天", en: "Heaven", kun: "あま", on: "テン",
                words: [{ jp: "天気", reading: "てんき", en: "weather" }, { jp: "天才", reading: "てんさい", en: "genius" }, { jp: "天国", reading: "てんごく", en: "heaven" }, { jp: "雨天", reading: "うてん", en: "rainy weather" }, { jp: "天の川", reading: "あまのがわ", en: "the Milky Way" }],
                strokes: [
                "M21.63,24.83c1.81,0.46,5.14,0.4,6.94,0.21c14.55-1.53,35.18-4.16,50.1-5.25c3.01-0.22,4.83,0.22,6.34,0.45",
                "M25.31,51.64c2.09,0.31,3.47,0.4,5.94,0.11c10.62-1.25,35.88-4.38,45.96-4.93c1.74-0.1,3.62,0.03,5.99,0.45",
                "M50.32,26c0.68,1,1.3,3.43,1.29,5.37c-0.24,30.51-14.86,50.88-33.86,60.25",
                "M50.1,51.39C58.71,60,75.07,78.48,86.59,87.05c2.33,1.73,4.41,3.08,7.91,4.2"
                ] },
            { jp: "女", en: "Woman", kun: "おんな・め", on: "ジョ",
                words: [{ jp: "女の子", reading: "おんなのこ", en: "girl" }, { jp: "女性", reading: "じょせい", en: "woman" }, { jp: "彼女", reading: "かのじょ", en: "she / girlfriend" }, { jp: "女優", reading: "じょゆう", en: "actress" }, { jp: "少女", reading: "しょうじょ", en: "young girl" }],
                strokes: [
                "M53.21,18.37c0.54,2.13,0.26,3.41-0.25,5.25C50.38,33,42.62,52.75,35.75,64c-1.39,2.27-1,3.5,1,3.5c11.63,0,28.46,7.48,38.83,16.41c2.56,2.21,4.68,4.51,6.17,6.84",
                "M69.62,42.18c0.5,1.7,0.63,3.57-0.01,5.93C65.93,61.8,54.61,81.6,27,91.75",
                "M13.88,50.43c3.48,1.39,7.26,0.85,10.88,0.53c19.52-1.7,42.04-4.08,60.61-4.63c3.66-0.11,7.21-0.1,10.62,1.42"
                ] },
            { jp: "子", en: "Child, Kid", kun: "こ", on: "シ・ス",
                words: [{ jp: "子供", reading: "こども", en: "child" }, { jp: "女の子", reading: "おんなのこ", en: "girl" }, { jp: "男の子", reading: "おとこのこ", en: "boy" }, { jp: "息子", reading: "むすこ", en: "son" }, { jp: "子猫", reading: "こねこ", en: "kitten" }],
                strokes: [
                "M33.28,19.04c1.84,0.71,3.7,0.86,5.4,0.63c4.95-0.67,27.95-4.58,29.86-4.92c3.46-0.62,4.06,1.36,2.11,3.58c-1.95,2.22-11.41,13.17-16.35,17.19",
                "M52.48,37.74c6.42,2.97,11.75,30.73,5.24,52.57c-2.8,9.38-8.09,2.96-10.47,0.99",
                "M12.25,51.48c3.75,1.14,8.79,1.03,12.48,0.49c16.77-2.47,42.86-5.84,58.53-6.75c4.26-0.25,9.11-0.34,13.11,0.57"
                ] },
            { jp: "学", en: "Study, Learn, Learning", kun: "まな", on: "ガク",
                words: [{ jp: "学校", reading: "がっこう", en: "school" }, { jp: "学生", reading: "がくせい", en: "student" }, { jp: "大学", reading: "だいがく", en: "university" }, { jp: "学ぶ", reading: "まなぶ", en: "to learn" }, { jp: "語学", reading: "ごがく", en: "language study" }],
                strokes: [
                "M29.5,17.25c3.5,3,6.5,7.25,7.75,9.75",
                "M49,12c1.25,2,4.75,8.25,5.25,11.5",
                "M75,11c0.25,1.75-0.12,2.75-0.75,4.25c-1.29,3.1-4.25,7.38-6.5,9.75",
                "M21.25,33.75c-0.12,4.75-2,12.5-3.75,16.25",
                "M23.5,36.5c17-1.62,42.38-5.5,60-5.75c9.5-0.13,4.12,5.12,0,9",
                "M37.25,46.5c1,0.25,3.75,0.25,5.5-0.25s18.25-4,20-4s2.75,0.75,1,2.25S54.5,53.5,53,54.75",
                "M50.75,55.75c4,8.75,7.18,24.67,1.75,38c-2.75,6.75-7.75,1.25-9.75-2",
                "M15.75,67.75c1.75,1,4.64,1.36,7.5,1c15.88-2,44.43-6.25,61.37-5.5c2.5,0.11,4.72,0.25,6.39,1"
                ] },
            { jp: "安", en: "Relax, Cheap", kun: "やす", on: "アン",
                words: [{ jp: "安い", reading: "やすい", en: "cheap" }, { jp: "安心", reading: "あんしん", en: "relief / peace of mind" }, { jp: "安全", reading: "あんぜん", en: "safety" }, { jp: "不安", reading: "ふあん", en: "anxiety" }, { jp: "目安", reading: "めやす", en: "a guide / rough standard" }],
                strokes: [
                "M53.06,13.73c0.92,0.92,1.63,2.6,1.6,3.75c-0.09,3.62-0.09,7.03-0.09,10.33",
                "M26.67,28.85c0,3.6-3.32,13.5-4.83,15.9",
                "M27.53,30.96c12.72-1.58,40.97-4.21,54.14-4.86c9.82-0.48,1.45,6.65-2.17,9.9",
                "M49.87,36.87c0.51,1.45,0.52,3.55,0,5.32c-2.74,9.22-7.03,20.09-13.85,30.42c-1.43,2.17-0.76,2.95,1.26,3.14c8.23,0.75,21.61,4.5,33.74,11.77c4.36,2.61,8.24,5.98,10.24,9.48",
                "M70,50c0.38,1.48,0.22,3.46-0.26,5.13c-3.88,13.52-17.45,34.6-43.24,42.49",
                "M15.13,60.22c2.85,0.74,6.22,0.42,9.12,0.2c11.33-0.85,40.73-4.55,64.72-4.64c2.27-0.01,6.19,0.33,8.03,0.96"
                ] },
            { jp: "小", en: "Small, Little", kun: "ちい・こ・お", on: "ショウ",
                words: [{ jp: "小さい", reading: "ちいさい", en: "small" }, { jp: "小学校", reading: "しょうがっこう", en: "elementary school" }, { jp: "小説", reading: "しょうせつ", en: "novel" }, { jp: "小さな", reading: "ちいさな", en: "small" }, { jp: "小鳥", reading: "ことり", en: "small bird" }],
                strokes: [
                "M54.71,18.37c1.4,1.4,2.26,3.13,2.26,5.77c0,14.56-0.26,54.91-0.26,59.87c0,11.25-7.21,1.5-8.71,0.25",
                "M31.95,47.68c0.17,0.82,0.1,1.72-0.34,2.9C29.5,56.38,24.38,66.25,16.75,73",
                "M80.96,47.12C86.62,52,95.25,64.62,97,72"
                ] },
            { jp: "少", en: "Few, A Little", kun: "すこ", on: "ショウ",
                words: [{ jp: "少ない", reading: "すくない", en: "few" }, { jp: "少し", reading: "すこし", en: "a little" }, { jp: "少年", reading: "しょうねん", en: "boy" }, { jp: "多少", reading: "たしょう", en: "somewhat" }, { jp: "少女", reading: "しょうじょ", en: "young girl" }],
                strokes: [
                "M53.46,14c0.9,0.9,1.76,2.23,1.76,4.33c0,12.04-0.01,37.2-0.01,40.65c0,9.77-6.71,2.04-8.21,1.17",
                "M36.65,29.04c0.12,1.26-0.02,2.17-0.58,3.32c-2.85,5.83-11.53,15.7-18.65,20.56",
                "M77,30c7.23,2.73,16.13,9.04,19.25,14.5",
                "M76.75,41c0.14,1.34,0.06,3.54-0.79,5.39C68.67,62.17,49.7,86.63,24,98"
                ] },
            { jp: "山", en: "Mountain", kun: "やま", on: "サン",
                words: [{ jp: "富士山", reading: "ふじさん", en: "Mt. Fuji" }, { jp: "山田さん", reading: "やまださん", en: "Mr./Ms. Yamada" }, { jp: "山登り", reading: "やまのぼり", en: "mountain climbing" }, { jp: "火山", reading: "かざん", en: "volcano" }, { jp: "山道", reading: "やまみち", en: "mountain path" }],
                strokes: [
                "M52.49,15.5c1.38,1.38,2.26,3.5,2.26,5.75c0,0.75-0.22,58.3-0.25,59.25",
                "M21.49,54.5c0.88,0.88,1.39,2.25,1.26,3.75c-0.58,6.99-1,16-2.5,23c-0.7,3.26,0.11,4,2,3.75c17-2.25,47.12-5.12,65.5-6",
                "M89.24,49c0.94,0.94,1.64,2.38,1.51,4.25c-0.25,3.68-1.83,20.3-2.55,28.77c-0.22,2.64-0.39,4.51-0.45,4.98"
                ] },
            { jp: "川", en: "River", kun: "かわ", on: "セン",
                words: [{ jp: "川口さん", reading: "かわぐちさん", en: "Mr./Ms. Kawaguchi" }, { jp: "小川", reading: "おがわ", en: "stream / surname" }, { jp: "川岸", reading: "かわぎし", en: "riverbank" }, { jp: "河川", reading: "かせん", en: "rivers (formal)" }, { jp: "川で泳ぐ", reading: "かわでおよぐ", en: "to swim in the river" }],
                strokes: [
                "M27.22,25.68c0.91,1.57,1.18,3.45,1.19,5.37C28.5,43.5,28.5,69,17.39,84.15",
                "M53.75,23.63c0.94,0.94,1.41,2.37,1.41,3.9c0,0.58-0.01,28.48-0.08,41.71c-0.02,3.31-0.04,5.74-0.06,6.63",
                "M85.56,15.63c1.09,1.09,1.76,2.62,1.76,4.25c0,0.74,0.23,46.86,0.09,66.12c-0.03,4.31-0.06,7.61-0.09,8.63"
                ] },
            { jp: "左", en: "Left", kun: "ひだり", on: "サ",
                words: [{ jp: "左", reading: "ひだり", en: "left" }, { jp: "左手", reading: "ひだりて", en: "left hand" }, { jp: "左側", reading: "ひだりがわ", en: "left side" }, { jp: "左右", reading: "さゆう", en: "left and right" }, { jp: "左折", reading: "させつ", en: "turning left" }],
                strokes: [
                "M20.75,40.17c2.95,0.49,5.68,0.29,8.64-0.05c14.5-1.68,29.75-4.47,47.22-5.96c2.83-0.24,5.87-0.58,8.64,0.26",
                "M55.48,12.5c0.27,1.57,0.21,4.18-0.29,5.93C46.59,48.64,32.07,74.14,11.25,91",
                "M43.25,64.59c1.25,0.29,2.38,0.29,3.86,0.17c4.86-0.37,17.91-2.17,26.92-3.77c1.88-0.33,3.97-0.5,5.97-0.11",
                "M58.54,66.75c1.04,1.04,1.91,2.62,1.91,4.03c0,6.84,0.04,13.22,0.04,18.72",
                "M28.5,92.25c2.76,0.84,5.92,0.51,8.75,0.34c14.54-0.9,32.08-2.65,48.13-3.26c3.25-0.12,6.38-0.17,9.49,0.93"
                ] },
            { jp: "年", en: "Year", kun: "とし", on: "ネン",
                words: [{ jp: "今年", reading: "ことし", en: "this year" }, { jp: "来年", reading: "らいねん", en: "next year" }, { jp: "毎年", reading: "まいとし", en: "every year" }, { jp: "年上", reading: "としうえ", en: "older" }, { jp: "一年生", reading: "いちねんせい", en: "first-year student" }],
                strokes: [
                "M40.01,11.89c0.24,1.61-0.01,2.86-0.84,4.46c-2.53,4.84-6.91,11.4-15.86,19.62",
                "M39.13,23.62c2.25,0.38,4.4,0.18,5.79,0.03c11.7-1.27,21.33-2.9,33.22-4.07c2.3-0.23,4.2,0,5.35,0.26",
                "M30.13,43.59c1.36,0.33,3.87,0.46,5.21,0.33c10.91-1.05,28.53-3.42,40.78-4.26c2.26-0.15,3.63,0.16,4.76,0.32",
                "M33.75,44.5c1,1.25,1,1.97,1.01,3.5C34.8,52.33,35,65.29,35,66.25",
                "M13.88,67.74c1.97,0.47,5.61,0.66,7.57,0.47c20.21-2.03,36.35-4.62,66.65-5.31c3.29-0.08,5.26,0.22,6.91,0.46",
                "M56.56,25.46c1.12,1.12,1.79,3.54,1.79,4.94c0,0.89-0.05,44.26-0.13,61.6c-0.01,3.12-0.03,5.39-0.05,6.38"
                ] },
            { jp: "店", en: "Shop, Store", kun: "みせ", on: "テン",
                words: [{ jp: "店", reading: "みせ", en: "shop" }, { jp: "店員", reading: "てんいん", en: "shop clerk" }, { jp: "書店", reading: "しょてん", en: "bookstore" }, { jp: "開店", reading: "かいてん", en: "store opening" }, { jp: "店長", reading: "てんちょう", en: "store manager" }],
                strokes: [
                "M56.81,11.13c1.28,1.28,2.01,2.74,2.01,4.15c0,0.79,0.08,4.65-0.07,9.46",
                "M25.63,27.23c2.62,0.77,4.72,0.67,6.39,0.54C48,26.5,63.11,24.75,84.3,23.04c2.76-0.22,4.44,0.26,5.83,0.53",
                "M28.99,28.5c0.88,0.88,1.18,2,1.16,3.38C29.88,54.88,27.25,78.75,14.5,91",
                "M57.87,32.88c0.93,0.93,1.62,2.62,1.62,4.09c0,3.03-0.21,27.9-0.21,32.77",
                "M60.28,50.84c8.22-0.96,16.22-1.96,22.11-2.82c1.04-0.15,2.96,0,3.8,0.21",
                "M39.49,71.71c1,0.98,1.37,1.56,1.64,3c1.24,6.54,2.21,13.16,3.22,20.24c0.17,1.21,0.33,2.37,0.48,3.45",
                "M41.78,73.18c12.31-1.73,32.97-3.68,39.91-4.33c3.3-0.31,4.47,2.39,4.16,3.79c-1.04,4.67-3.04,13.25-4.41,18.9",
                "M45.8,95.62C51.66,95,67.7,93.74,78,92.83c1.96-0.17,3.7-0.32,5.11-0.44"
                ] },
            { jp: "後", en: "Behind, After, Back, Rear", kun: "うし・あと・のち", on: "ゴ・コウ",
                words: [{ jp: "後で", reading: "あとで", en: "later" }, { jp: "午後", reading: "ごご", en: "p.m." }, { jp: "後ろ", reading: "うしろ", en: "behind" }, { jp: "最後", reading: "さいご", en: "the last" }, { jp: "後輩", reading: "こうはい", en: "junior / underclassman" }],
                strokes: [
                "M34.25,18.38c0,1.3-0.24,2.26-0.93,3.05c-3.57,4.07-8.94,8.7-15.91,13.39",
                "M38.75,36.62c0.14,1.32-0.42,2.67-1.13,3.79c-3.45,5.4-11.43,14.17-22.37,22.71",
                "M28.4,54.36c0.81,0.81,1.38,2.02,1.38,3.28c0,0.68,0.03,25.57-0.07,35.86c-0.02,1.74-0.04,3.05-0.05,3.75",
                "M61.16,12.62c0.29,1.07,0.21,2.43-0.39,3.54c-2.52,4.6-6.1,9.01-9.88,12.93c-1.01,1.05-1.26,2.17,0,2.68c2.96,1.19,6.3,3.11,8.88,5.07",
                "M76.35,20.12c0.27,1.25-0.3,2.56-1,3.31c-7.6,8.19-16.6,16.57-26.61,25.32c-1.25,1.1-0.74,1.76,0.74,1.41C55.72,48.69,74.5,44.4,82.5,43",
                "M77.88,36.25c3.66,2.21,9.46,9.07,10.38,12.5",
                "M57.75,53c0.09,1.13,0.02,2.27-0.4,3.33c-2.2,5.51-7.08,13.22-15.6,20.92",
                "M59.31,59.82c1.17,0.13,2.31,0.02,3.29-0.09c2.65-0.29,9.84-1.39,13.62-2.29c2.59-0.62,3.24,0.68,2.67,2.4C75.25,70.75,59.25,88.88,43.02,96.5",
                "M54.75,67.5c2.52,0,19.5,15.75,31.17,24.23c2.31,1.68,4.74,3.38,7.58,4.01"
                ] },
            { jp: "手", en: "Hand", kun: "て", on: "シュ",
                words: [{ jp: "手", reading: "て", en: "hand" }, { jp: "上手", reading: "じょうず", en: "skillful" }, { jp: "下手", reading: "へた", en: "unskillful" }, { jp: "手紙", reading: "てがみ", en: "letter" }, { jp: "歌手", reading: "かしゅ", en: "singer" }],
                strokes: [
                "M61.48,11.5c0.02,1-0.61,1.88-1.67,2.9c-3.27,3.15-13.69,8.23-28.57,11.85",
                "M26.38,42.92c1.8,0.46,3.61,0.67,5.68,0.38C46,41.38,58.4,39,71.37,37.75c1.92-0.19,4.62-0.38,7.25,0.04",
                "M13.27,62.87c2.71,0.63,4.86,0.6,7.22,0.38c22.63-2.12,46.13-5.62,67.7-7c2.01-0.13,4.83,0,7.46,0.37",
                "M48.88,23.55C60.38,31,62.73,63.66,57.83,89.87c-2.08,11.13-8.64,2.34-9.89,1.17"
                ] },
            { jp: "新", en: "New", kun: "あたら・あら・にい", on: "シン",
                words: [{ jp: "新しい", reading: "あたらしい", en: "new" }, { jp: "新聞", reading: "しんぶん", en: "newspaper" }, { jp: "新年", reading: "しんねん", en: "new year" }, { jp: "新幹線", reading: "しんかんせん", en: "bullet train" }, { jp: "新人", reading: "しんじん", en: "newcomer" }],
                strokes: [
                "M33.72,12.76c0.88,0.88,1.53,2.49,1.53,4.35c0,2.63,0.01,1.9,0.02,9.04",
                "M18.32,28.69c1.19,0.11,2.61,0.17,3.79,0.03c7.4-0.84,18.02-2.59,25.62-3.22c1.98-0.16,3.19-0.03,4.18,0.02",
                "M23.62,34.38c3.39,4.82,4.03,8.08,4.34,11.36",
                "M45.59,29.5c0.62,1.09,0.38,2.59-0.08,3.75c-1.65,4.12-4.74,10.59-5.88,12.61",
                "M14.17,50.95c1.78,0.27,3.57,0.27,5.34,0.05c7.96-1.02,21.06-2.74,29.12-3.36c1.96-0.15,3.91-0.03,5.87,0.11",
                "M16.76,63.42c0.83,0.22,3.05,0.44,5.23,0.18c8.88-1.09,17.01-2.34,26.08-3.01c2.2-0.16,2.76-0.23,4.13,0",
                "M34.38,51c1.12,1.12,1.5,2.75,1.5,4.22c0,1.31-0.15,24.25-0.25,34.78c-0.02,2.8-0.05,4.69-0.06,5",
                "M34.25,62.84c0,1.41-0.35,2.47-0.87,3.37c-4.25,7.45-12.94,17.12-19.63,21.04",
                "M39.25,68.5c4.71,2.98,7.9,5.97,9.49,8.43",
                "M82.74,17.44c-0.12,0.93-0.46,2.3-1.27,3.21C76.25,26.5,70.5,30.62,61.69,35.7",
                "M59.2,35.14c0.83,0.83,1.53,2.28,1.53,3.96c0,29.15-2.36,38.52-8.98,48.4",
                "M62.89,47.36c1.98-0.11,3.36-0.31,4.54-0.48c7.82-1.13,18.82-2.38,26.29-3.3c1.18-0.15,3.25-0.17,3.99,0",
                "M80.32,48.54c0.95,0.95,1.59,2.21,1.59,3.8c0,0.93,0.24,27.72,0.16,40.16c-0.02,2.33-0.04,4.17-0.06,5.25"
                ] },
            { jp: "日", en: "Sun, Day", kun: "ひ・か・び", on: "ニチ・ジツ",
                words: [{ jp: "日曜日", reading: "にちようび", en: "Sunday" }, { jp: "誕生日", reading: "たんじょうび", en: "birthday" }, { jp: "毎日", reading: "まいにち", en: "every day" }, { jp: "日本", reading: "にほん", en: "Japan" }, { jp: "二日", reading: "ふつか", en: "the 2nd / two days" }],
                strokes: [
                "M31.5,24.5c1.12,1.12,1.74,2.75,1.74,4.75c0,1.6-0.16,38.11-0.09,53.5c0.02,3.82,0.05,6.35,0.09,6.75",
                "M33.48,26c0.8-0.05,37.67-3.01,40.77-3.25c3.19-0.25,5,1.75,5,4.25c0,4-0.22,40.84-0.23,56c0,3.48,0,5.72,0,6",
                "M34.22,55.25c7.78-0.5,35.9-2.5,44.06-2.75",
                "M34.23,86.5c10.52-0.75,34.15-2.12,43.81-2.25"
                ] },
            { jp: "時", en: "Time, O'clock, Hour", kun: "とき", on: "ジ",
                words: [{ jp: "時間", reading: "じかん", en: "time" }, { jp: "何時", reading: "なんじ", en: "what time" }, { jp: "時々", reading: "ときどき", en: "sometimes" }, { jp: "時計", reading: "とけい", en: "clock / watch" }, { jp: "食事の時", reading: "しょくじのとき", en: "at mealtime" }],
                strokes: [
                "M16,29.84c0.75,0.66,1.21,1.62,1.21,3.07c0,1.18-0.16,30.08-0.21,40.85c-0.01,2.42-0.02,3.95-0.02,4.08",
                "M17.78,30.74c4.65-0.63,16.12-2.07,17.6-2.25c1.52-0.18,3,1.5,2.88,2.57c-0.24,2.17-0.36,24.9-0.35,40.79c0,1.63-0.12,3.35-0.12,4.43",
                "M18.75,52c4.5-0.75,13.5-2.12,18.22-2.35",
                "M17.8,74.52c6.2-0.92,11.45-1.89,18.94-2.7",
                "M51.44,29.03c1.37,0.44,3.63,0.34,5,0.19c9.79-1.09,16.34-2.34,25.62-3.08c2.27-0.18,3.9-0.04,5.04,0.18",
                "M67.59,11.37c0.89,0.9,1.59,2.24,1.59,3.75c0,8.39,0.03,27.02,0.03,27.6",
                "M45.38,45.35c1.49,0.44,4.21,0.59,5.71,0.44c11.29-1.16,25.66-3.29,39.2-3.99c2.48-0.13,3.97,0.21,5.21,0.43",
                "M46,60.99c1.43,0.46,4.04,0.58,5.49,0.46c12.01-1.07,26.89-3.07,39.07-3.89c2.38-0.16,4.41,0.22,5.6,0.44",
                "M78.07,46.08c1.11,1.11,1.66,2.56,1.71,5.06c0.23,12.03-0.09,34.43-0.09,38.52c0,9.83-5.42,2.19-7.66-0.04",
                "M56.75,70.38c2.87,1.76,6.55,6.38,7.27,9.12"
                ] },
            { jp: "書", en: "Write, Writing", kun: "か", on: "ショ",
                words: [{ jp: "書く", reading: "かく", en: "to write" }, { jp: "辞書", reading: "じしょ", en: "dictionary" }, { jp: "図書館", reading: "としょかん", en: "library" }, { jp: "読書", reading: "どくしょ", en: "reading" }, { jp: "教科書", reading: "きょうかしょ", en: "textbook" }],
                strokes: [
                "M30.74,20.63c2.01,0.49,3.84,0.58,5.91,0.39c9.45-0.89,28.54-2.97,37.54-3.64c2.92-0.22,4.18,1.24,3.66,3.55c-0.4,1.76-2.56,9.62-3.88,16.56",
                "M11.89,32.34c3.17,0.66,5.87,0.47,9.58,0.19c20.16-1.52,48.41-3.9,67.91-4.64c4.08-0.16,7.07,0.26,8.91,0.59",
                "M29.86,41.38c1.64,0.49,3.39,0.52,4.84,0.44c9.67-0.57,27.55-2.07,37.43-2.85c1.93-0.15,3.14-0.08,4.59,0.07",
                "M30.04,52.06c1.47,0.26,3.65,0.54,5.12,0.43c12.34-0.98,25.59-2.23,36.78-3.31c2.43-0.23,4.41-0.19,5.63-0.07",
                "M17,63.44c2,0.58,5.67,0.57,7.66,0.41c20.78-1.7,42.92-3.93,61.09-4.48c3.33-0.1,5.33,0.15,6.99,0.42",
                "M52.69,9.52c1.33,1.33,1.95,2.98,1.95,4.71c0,5.67,0.22,33.72,0.31,45.77",
                "M31.25,71.75c0.43,0.46,1.24,1.44,1.43,2.7c1.11,7.42,2.22,14.33,3.18,20.74c0.18,1.2,0.34,2.38,0.49,3.57",
                "M33.75,73.75c14.98-2.05,36.1-3.71,44.41-4.26c3.33-0.22,5.09,1.76,4.6,4.33c-0.99,5.22-2.01,11.55-3.81,19.41c-0.3,1.31-0.74,2.55-1.15,3.72",
                "M35.5,83.75C46.79,83.03,65.75,81.5,80.25,81",
                "M37.25,95.25c10.7-0.68,26.5-1.38,40.5-2"
                ] },
            { jp: "月", en: "Moon, Month", kun: "つき", on: "ゲツ・ガツ",
                words: [{ jp: "月曜日", reading: "げつようび", en: "Monday" }, { jp: "一月", reading: "いちがつ", en: "January" }, { jp: "今月", reading: "こんげつ", en: "this month" }, { jp: "三日月", reading: "みかづき", en: "crescent moon" }, { jp: "毎月", reading: "まいつき", en: "every month" }],
                strokes: [
                "M34.25,16.25c1,1,1.48,2.38,1.5,4c0.38,33.62,2.38,59.38-11,73.25",
                "M36.25,19c4.12-0.62,31.49-4.78,33.25-5c4-0.5,5.5,1.12,5.5,4.75c0,2.76-0.5,49.25-0.5,69.5c0,13-6.25,4-8.75,1.75",
                "M37.25,38c10.25-1.5,27.25-3.75,36.25-4.5",
                "M37,58.25c8.75-1.12,27-3.5,36.25-4"
                ] },
            { jp: "木", en: "Tree, Wood", kun: "き・こ", on: "モク・ボク",
                words: [{ jp: "木曜日", reading: "もくようび", en: "Thursday" }, { jp: "木村さん", reading: "きむらさん", en: "Mr./Ms. Kimura" }, { jp: "木製", reading: "もくせい", en: "made of wood" }, { jp: "植木", reading: "うえき", en: "garden plant" }, { jp: "木の下", reading: "きのした", en: "under the tree" }],
                strokes: [
                "M19.5,39.86c2.45,0.57,5.23,0.8,8.04,0.57C40.75,39.38,63,36.5,79.78,36.15c2.8-0.06,4.54,0.1,7.34,0.5",
                "M51.75,10.5c1.19,1.19,2,3,2,5c0,8.65,0,55.15-0.14,74.75c-0.03,4.19-0.07,7.15-0.11,8.25",
                "M50.75,39.5c0,1.12-0.61,2.44-1.42,3.95C41.75,57.5,26.7,73.93,15.75,80.25",
                "M54.5,39c4.62,6,23,25.75,31.76,34.61c2.27,2.29,4.61,4.39,7.49,5.64"
                ] },
            { jp: "本", en: "Book, Origin, Real, Main", kun: "もと", on: "ホン",
                words: [{ jp: "本", reading: "ほん", en: "book" }, { jp: "日本", reading: "にほん", en: "Japan" }, { jp: "本当", reading: "ほんとう", en: "really / true" }, { jp: "本屋", reading: "ほんや", en: "bookstore" }, { jp: "一本", reading: "いっぽん", en: "one (long thin object)" }],
                strokes: [
                "M20.5,33.5c1.93,0.62,4.91,1.07,8.1,0.75C42.43,32.88,66,30.75,79.64,30c3.2-0.18,7.22,0.25,9.23,0.5",
                "M52.1,11.12c1.25,1.25,2.05,3.23,2.05,4.99c0,0.84,0,57.16-0.02,76.76c-0.01,3.96-0.01,6.42-0.02,6.62",
                "M51.75,33.5c0,1-0.41,2.22-1.29,3.88C43.62,50.25,30.12,65.5,13.25,75.5",
                "M54.75,35.5c4.92,5.74,23.48,23.33,32.85,31.27c2.58,2.18,5.16,4.41,8.52,5.23",
                "M33.88,73.92c1.5,0.46,2.74,0.75,5.3,0.59c9.95-0.63,21.2-2.13,27.96-2.95c1.93-0.23,3.62-0.31,6-0.02"
                ] },
            { jp: "来", en: "Come, Next", kun: "く", on: "ライ",
                words: [{ jp: "来る", reading: "くる", en: "to come" }, { jp: "来年", reading: "らいねん", en: "next year" }, { jp: "来週", reading: "らいしゅう", en: "next week" }, { jp: "未来", reading: "みらい", en: "the future" }, { jp: "出来る", reading: "できる", en: "to be able to" }],
                strokes: [
                "M25.54,28.33c1.61,0.39,4.58,0.53,6.19,0.39c16.32-1.46,27.01-3.46,43.69-3.67c2.69-0.03,4.31,0.18,5.65,0.38",
                "M30.12,37.62c2.85,2.07,7.16,7.91,7.88,11.12",
                "M74.52,33c0.08,0.98-0.11,1.9-0.58,2.77c-1.33,3.04-4.7,7.77-9.06,10.86",
                "M16.62,57c2.28,0.5,4.9,0.74,8.42,0.5c14.81-1,39.08-3.5,58.03-4.25c3.54-0.14,6.33,0.25,8.55,0.5",
                "M51.67,10.75c1.33,1,2.18,2.75,2.18,4.5c0,0.9,0.06,58.96-0.17,78c-0.03,2.77-0.07,4.71-0.1,5.5",
                "M49.75,56.5c0,1.5-0.44,2.48-0.82,3.11C42.37,70.49,29,83.75,15.75,90.5",
                "M55,56.25c4.38,3.88,19.75,19,29.73,26.28c2.82,2.06,6.52,4.5,10.02,5.22"
                ] },
            { jp: "東", en: "East", kun: "ひがし", on: "トウ",
                words: [{ jp: "東", reading: "ひがし", en: "east" }, { jp: "東京", reading: "とうきょう", en: "Tokyo" }, { jp: "東口", reading: "ひがしぐち", en: "east exit" }, { jp: "中東", reading: "ちゅうとう", en: "the Middle East" }, { jp: "東北", reading: "とうほく", en: "Tohoku / northeast" }],
                strokes: [
                "M30.63,25.23c2.36,0.62,4.86,0.47,7.25,0.22c8.24-0.86,22.7-2.7,32.4-3.57c2.38-0.21,4.51-0.14,6.85,0.22",
                "M26.77,37.86c1.03,1.03,1.78,2.05,2.07,3.44c0.86,4.14,3.61,16.02,4.97,21.91c0.43,1.87,0.72,3.14,0.76,3.36",
                "M29.55,39.31c14.7-2.12,34.45-4.37,48.18-5.5c2.89-0.24,4.02,2.01,3.49,4.2c-1.33,5.48-2.84,12.21-5.27,19.87c-0.52,1.65-1.08,3.3-1.7,4.94",
                "M32.25,51.07c8.12-0.88,37.75-4.12,45.57-4.4",
                "M35.76,63.99c8.99-1.05,28.37-2.68,38.3-3.23",
                "M51.25,12.32c1.5,1.5,2.25,3.5,2.25,5.25c0,4.5,0.06,55.21-0.14,75.75c-0.04,3.7-0.07,5.29-0.11,6.25",
                "M51.62,63.94c-0.24,1.91-0.81,2.76-1.27,3.45c-6.59,9.83-20.19,21.12-31.6,26.42",
                "M55,64.44c7.5,7.2,21.77,17.49,29.78,22.16c2.81,1.64,6.1,3.51,9.34,4.09"
                ] },
            { jp: "校", en: "School", kun: "—", on: "コウ",
                words: [{ jp: "学校", reading: "がっこう", en: "school" }, { jp: "高校", reading: "こうこう", en: "high school" }, { jp: "校長", reading: "こうちょう", en: "principal" }, { jp: "校門", reading: "こうもん", en: "school gate" }, { jp: "転校", reading: "てんこう", en: "changing schools" }],
                strokes: [
                "M11.53,40.68c1.1,0.32,2.6,0.45,4.53,0.32c5.4-0.35,16.57-3,23.14-4.04c1.25-0.2,2.3-0.18,3.07,0",
                "M28.99,17.25c1.07,1.07,1.76,3.25,1.76,5.25c0,0.77-0.03,48.09-0.18,65.25c-0.03,3.03-0.05,5.16-0.07,6",
                "M30.25,40.75c0,1.25-0.49,2.66-0.96,3.77C25.28,53.91,20.88,62.25,15,70",
                "M33.75,51.25c2.75,1.5,6,5.25,7.25,7.75",
                "M66.39,15.5c0.99,0.99,1.38,1.88,1.38,3.62c0,4.25-0.02,7.62-0.08,10.41",
                "M48.12,31.71c2.3,0.29,3.9,0.44,6.09,0.2c10.28-1.16,20.32-2.66,32.45-3.53c2.35-0.17,4.03-0.01,5.33,0.32",
                "M59.24,38.93c0.2,0.53,0.06,2.27-0.4,3.14C57,45.5,53.75,49.5,50,52.5",
                "M79.27,38.5c4.34,3.07,8.73,8.68,10.9,12.41",
                "M79.15,49.18c0.35,1.32,0.17,2.62-0.54,4.18C72.25,67.25,58.75,83.25,44,91.25",
                "M55.95,55.88c6.3,3.37,21.64,22.12,31.45,30.33c2.64,2.21,5.07,4.15,8.6,4.44"
                ] },
            { jp: "母", en: "Mother, Mom, Mum", kun: "はは", on: "ボ",
                words: [{ jp: "お母さん", reading: "おかあさん", en: "mother (polite)" }, { jp: "母親", reading: "ははおや", en: "one's mother" }, { jp: "母の日", reading: "ははのひ", en: "Mother's Day" }, { jp: "祖母", reading: "そぼ", en: "grandmother" }, { jp: "母国", reading: "ぼこく", en: "home country" }],
                strokes: [
                "M34.82,19.37c1.14,1.02,1.72,3.42,1.41,6.09c-1.46,12.62-8.22,32.3-13.04,44.1c-1.47,3.6-0.44,5.27,3.63,5.2c11.37-0.18,27.52,2.13,40.68,7.24c4.98,1.93,9.54,4.26,13.25,7.01",
                "M37.32,22.07c4.81,0.56,13.81-1.32,39.18-6.07c4-0.75,5.92,0.77,5.5,4.25c-2.25,18.62-7,49-16.06,69.18c-3.36,7.49-9.86,1.68-11.42,0",
                "M49,28.5c3.88,1.98,10.03,8.16,11,11.25",
                "M45.25,57.62c3.79,1.96,9.8,8.07,10.75,11.12",
                "M9.88,51.45c2.21,0.63,6.26,0.87,8.46,0.63C46.77,49,67.12,47,90.65,46.07c3.68-0.15,5.89,0.3,7.72,0.61"
                ] },
            { jp: "毎", en: "Every", kun: "ごと", on: "マイ",
                words: [{ jp: "毎日", reading: "まいにち", en: "every day" }, { jp: "毎週", reading: "まいしゅう", en: "every week" }, { jp: "毎年", reading: "まいとし", en: "every year" }, { jp: "毎朝", reading: "まいあさ", en: "every morning" }, { jp: "毎晩", reading: "まいばん", en: "every night" }],
                strokes: [
                "M44.13,10.62c0.11,1.39-0.04,2.48-0.54,3.78c-2.23,5.81-9.37,16.73-16.84,22.34",
                "M43.77,23.04c1.73,0.08,3.68,0.03,4.73-0.04c6.88-0.46,19.87-3.02,27.66-4.42c2.11-0.38,3.74-0.39,5.84-0.14",
                "M41.55,34.87c1.1,0.91,1.96,3.97,1.36,6.3C40.25,51.5,33.25,67,29.45,72.74c-1.98,2.99-0.52,4.58,1.57,4.62c11.98,0.26,25.1,1.88,37.95,5.72c5.92,1.77,11.28,4.6,15.77,7.92",
                "M44.26,37.32c9.17-1.07,22.11-2.57,28.58-3.32c3.9-0.45,6.36,2.01,6.1,5.12c-1.44,17.51-4.81,42.51-11.32,56.07c-2.99,6.22-6.5-1.15-7.52-2.27",
                "M58.71,39.5c0.51,1,0.75,2.74,0.53,4c-1.53,8.5-7.11,27-9.92,35",
                "M10.88,58.99c2.46,0.56,6.98,0.49,9.45,0.31c21.05-1.54,44.8-3.42,69.3-3.88c4.11-0.08,6.57,0.26,8.62,0.54"
                ] },
            { jp: "気", en: "Energy, Spirit", kun: "いき", on: "キ・ケ",
                words: [{ jp: "天気", reading: "てんき", en: "weather" }, { jp: "元気", reading: "げんき", en: "healthy / energetic" }, { jp: "気分", reading: "きぶん", en: "mood" }, { jp: "人気", reading: "にんき", en: "popularity" }, { jp: "気持ち", reading: "きもち", en: "feeling" }],
                strokes: [
                "M37.75,9.25c0.25,1.62-0.25,2.75-1,4.25C35.63,15.74,28,25.25,24,29",
                "M36.5,21.25c1.33-0.03,3.29-0.05,4.8-0.32c9.2-1.68,18.17-3.46,26.98-5.27c1.63-0.33,3.71-0.64,5.21-0.91",
                "M31.25,32.75c1.5,0.38,3.3,0.26,4.96,0.08c7.67-0.83,19.54-2.58,29.14-4.39c1.94-0.37,3.64-0.41,4.91-0.45",
                "M18.5,47c1.88,0.75,4,0.88,6.25,0.5c15.08-2.51,35-5.62,48.25-8c4.73-0.85,5.6,0.47,4.5,6.25c-4,21,0.71,40.32,11.5,50c7.25,6.5,6.5,0.75,6-5.25",
                "M57,51.75c0.12,1.62-0.17,3.03-1,4.75C49.5,70,40.25,82.75,25.75,93.25",
                "M30,63.75C41.5,68,54.5,78,62.25,90.5"
                ] },
            { jp: "水", en: "Water", kun: "みず", on: "スイ",
                words: [{ jp: "水曜日", reading: "すいようび", en: "Wednesday" }, { jp: "お水", reading: "おみず", en: "water (polite)" }, { jp: "水泳", reading: "すいえい", en: "swimming" }, { jp: "香水", reading: "こうすい", en: "perfume" }, { jp: "水着", reading: "みずぎ", en: "swimsuit" }],
                strokes: [
                "M52.77,15.08c1.08,1.08,1.67,2.49,1.76,5.52c0.4,14.55-0.26,62.16-0.26,67.12c0,9.78-7.52,0.03-9.02-1.22",
                "M17.5,45.75c1.75,0.62,3.73,0.43,5.25,0C25.88,44.88,36.09,41,38.59,40s4.47,1.24,3.75,3.5C39,54,28.25,69,19,74.75",
                "M81.22,27.5c-0.22,1.25-0.72,2.25-1.52,2.97c-5.64,5.1-12.45,9.78-22.45,13.78",
                "M57,46c8.82,10.73,19.23,21.46,28.42,27.42c2.16,1.4,4.52,3,7.08,3.58"
                ] },
            { jp: "火", en: "Fire", kun: "ひ・ほ", on: "カ",
                words: [{ jp: "火曜日", reading: "かようび", en: "Tuesday" }, { jp: "花火", reading: "はなび", en: "fireworks" }, { jp: "火事", reading: "かじ", en: "fire / blaze" }, { jp: "火山", reading: "かざん", en: "volcano" }, { jp: "花火大会", reading: "はなびたいかい", en: "fireworks festival" }],
                strokes: [
                "M24.25,34c3.27,3.33,8.5,13,9.5,17.75",
                "M83,27.25c0.5,1.38,0.22,2.74-0.5,4.25c-2.38,5-7.5,12.12-12.75,17.25",
                "M52.5,14.25c1,1.25,1.5,3.12,1.5,5C54,69,39.62,80,21,91.5",
                "M52.75,50c12.49,14.06,25.01,28.42,33.62,36.13c2.7,2.42,4.9,4.02,8.38,4.87"
                ] },
            { jp: "父", en: "Father, Dad", kun: "ちち", on: "フ",
                words: [{ jp: "お父さん", reading: "おとうさん", en: "father (polite)" }, { jp: "父親", reading: "ちちおや", en: "one's father" }, { jp: "父の日", reading: "ちちのひ", en: "Father's Day" }, { jp: "祖父", reading: "そふ", en: "grandfather" }, { jp: "父母", reading: "ふぼ", en: "father and mother" }],
                strokes: [
                "M38.49,18.25c0.39,1.38,0.07,2.89-0.59,4.16C32,33.91,26.32,39.13,18.75,45.62",
                "M69.38,19.5c7.25,4,14.29,9.68,18.88,15.5",
                "M67.7,39.68c0.55,1.57,0.31,3.8-0.42,5.92C60.63,64.87,48,80.25,23,90.25",
                "M34.25,47c4.83,0,29,25.38,45.99,37.02c3.54,2.43,7.39,4.55,11.51,5.77"
                ] },
            { jp: "生", en: "Life", kun: "い・なま・う・は・き", on: "セイ・ショウ",
                words: [{ jp: "先生", reading: "せんせい", en: "teacher" }, { jp: "学生", reading: "がくせい", en: "student" }, { jp: "誕生日", reading: "たんじょうび", en: "birthday" }, { jp: "生まれる", reading: "うまれる", en: "to be born" }, { jp: "生活", reading: "せいかつ", en: "daily life" }],
                strokes: [
                "M31.26,25.89c0.36,1.36,0.35,2.65-0.05,3.79c-2.34,6.69-7.24,17.22-14.96,24.19",
                "M31.13,40.67c2.37,0.33,4.03,0.07,5.64-0.12c9.5-1.1,25.15-4.12,35.35-5.83c2.51-0.42,4.86-0.73,7.38-0.33",
                "M52.31,12.63c1.28,1.28,2.01,3.12,2.01,5.23c0,4.01,0,65.14,0,69.77",
                "M29.38,64.03c2.64,0.67,5.38,0.31,8.04-0.02C49.45,62.51,62.16,61,72.5,59.86c2.38-0.26,4.99-0.76,7.38-0.23",
                "M15.75,90.25c3.04,0.75,6.21,0.94,8.4,0.8C40.62,90,68.12,86.5,83.3,85.75c3.63-0.18,7.68,0,10.07,0.73"
                ] },
            { jp: "男", en: "Man", kun: "おとこ", on: "ダン",
                words: [{ jp: "男の子", reading: "おとこのこ", en: "boy" }, { jp: "男性", reading: "だんせい", en: "male" }, { jp: "男子", reading: "だんし", en: "boy / male" }, { jp: "長男", reading: "ちょうなん", en: "eldest son" }, { jp: "男の人", reading: "おとこのひと", en: "man" }],
                strokes: [
                "M26.5,14.25c0.88,0.88,1.56,1.99,1.73,2.98c0.84,4.77,2.47,16.75,3.34,26.04c0.18,1.95,0.37,2.37,0.55,4.23",
                "M29,15.95c11.38-1.45,41.21-4.57,49.56-4.71c3.9-0.07,5.44,1.51,4.91,5.29c-0.45,3.21-3.15,15.19-4.94,22.23c-0.41,1.62-0.79,2.99-1.4,4.19",
                "M54,15.97c0.77,0.77,1,1.91,1,2.79c0.02,6.32,0.2,22,0.2,22.75",
                "M30.98,30.82C45,29.12,57.12,28,80.53,26.34",
                "M32.87,44.74c11.38-1.24,28.38-2.99,44.14-3.7",
                "M19.98,60.98c2.15,0.67,4.58,0.78,6.77,0.53c13.46-1.53,42.24-5.66,51.88-6.86c5.26-0.66,6.86,1.04,5.72,6.27c-1.92,8.83-9,27.39-15.66,33.19c-5.11,4.45-7.44,2.14-9.69-0.86",
                "M53.22,46.43c0.28,1.32,0.29,3.04-0.2,4.57C49.12,63.12,38,81.25,17.14,92.06"
                ] },
            { jp: "白", en: "White", kun: "しろ・しら", on: "ハク",
                words: [{ jp: "白い", reading: "しろい", en: "white" }, { jp: "白紙", reading: "はくし", en: "blank paper" }, { jp: "白鳥", reading: "はくちょう", en: "swan" }, { jp: "面白い", reading: "おもしろい", en: "interesting" }, { jp: "白黒", reading: "しろくろ", en: "black and white" }],
                strokes: [
                "M55,13c0.38,1.5,0,3.25-0.57,4.29C51.32,22.93,46,31.12,36.81,40.22",
                "M25.5,40.47c1.14,1.14,1.63,2.81,1.63,4.63c0,1.55,0.95,32.47,1.32,47.14c0.06,2.58,0.13,4.66,0.18,6",
                "M28.27,43.98c13.98-1.73,39.08-4.47,49.67-5.48c5.19-0.5,7.37,0.76,7.06,5.38c-0.62,9.12-2.09,30.3-3.29,46.88c-0.17,2.42-0.33,4.65-0.46,6.57",
                "M29.13,67.44C42.25,66,72.38,63.62,82.57,63.4",
                "M29.69,94.49C43,93.75,66.62,92,80.19,91.41"
                ] },
            { jp: "百", en: "Hundred", kun: "もも", on: "ヒャク",
                words: [{ jp: "百", reading: "ひゃく", en: "hundred" }, { jp: "百円", reading: "ひゃくえん", en: "100 yen" }, { jp: "三百", reading: "さんびゃく", en: "300" }, { jp: "八百屋", reading: "やおや", en: "greengrocer" }, { jp: "百科事典", reading: "ひゃっかじてん", en: "encyclopedia" }],
                strokes: [
                "M16.13,20.23c2.22,0.54,6.29,0.75,8.51,0.54c21.49-2.02,41.86-4.39,59.22-4.98c3.7-0.12,5.92,0.26,7.77,0.53",
                "M52.31,21.75c0.19,1.38,0.19,2.5-0.38,3.93c-1.65,4.19-4.81,9.19-8.66,14.68",
                "M30.75,42.82c0.96,0.96,1.64,2.45,1.72,4.19c0.41,8.74,0.96,32.92,1.18,43.74c0.05,2.48,0.08,4.12,0.1,4.5",
                "M33.55,44.8c10.35-1.37,35.73-4.38,38.78-4.59c3.15-0.22,4.92,1.17,4.92,4.24c0,4.48-0.68,32-0.92,44.06c-0.06,3.02-0.1,5.05-0.11,5.48",
                "M34.14,66.95c10.24-1.08,32.11-3.2,41.44-3.57",
                "M34.97,92.87c8.78-0.87,30.53-2.12,40.06-2.39"
                ] },
            { jp: "目", en: "Eye", kun: "め", on: "モク",
                words: [{ jp: "目", reading: "め", en: "eye" }, { jp: "目玉", reading: "めだま", en: "eyeball" }, { jp: "一つ目", reading: "ひとつめ", en: "the first one" }, { jp: "目的", reading: "もくてき", en: "purpose" }, { jp: "科目", reading: "かもく", en: "subject" }],
                strokes: [
                "M29.75,19.05c1.35,1.35,1.86,3.21,1.86,5.47c0,1.77,0.19,42.37,0.06,60.23c-0.04,4.91-0.06,8.11-0.06,8.36",
                "M32.54,21.39c10.92-1.23,38.33-4.11,41.42-4.38c3.25-0.28,5.54,1.25,5.54,4.18c0,8.95-0.26,39.93-0.26,64.82c0,3,0.01,3.75,0.01,6",
                "M33.05,43.64c12.45-1.51,34.83-3.51,45.18-4.09",
                "M32.9,65.95C44.25,65,66,62.88,77.72,62.56",
                "M33,90.5c9.75-0.5,33.25-2.5,44.79-2.53"
                ] },
            { jp: "社", en: "Company", kun: "やしろ", on: "シャ",
                words: [{ jp: "会社", reading: "かいしゃ", en: "company" }, { jp: "社長", reading: "しゃちょう", en: "company president" }, { jp: "神社", reading: "じんじゃ", en: "shrine" }, { jp: "入社", reading: "にゅうしゃ", en: "joining a company" }, { jp: "社会", reading: "しゃかい", en: "society" }],
                strokes: [
                "M29.5,15.25c3.41,2.06,6.75,4.75,10,8.75",
                "M15.5,39c2,0.75,3.05,0.8,5.55,0.17c6.2-1.55,15.6-4.05,17.7-4.67c2.5-0.75,4.46,1.23,3,3.5c-4.75,7.38-13.88,18.62-25,28.75",
                "M30.82,55.37C32,56.5,32.21,58,32.21,59.94c0,8.57-0.15,21.05-0.3,29.06c-0.06,3.28-0.12,5.81-0.12,7",
                "M36.25,54.5c3.67,2.41,7.6,6.03,10.75,10.25",
                "M52.13,52.03c1.49,0.39,4.23,0.31,5.71,0.14c7.92-0.91,19.17-2.04,28.02-2.68c2.48-0.18,3.97-0.07,5.22,0.13",
                "M69.31,17.87c1.23,1.23,1.81,3.13,1.81,5.13c0,14.25,0.13,62.57,0.13,63.07",
                "M42.25,88.97c1.92,0.55,5.44,0.76,7.36,0.55c12.39-1.39,28.51-3.64,41.04-4.03c3.2-0.1,6.09,0.14,7.72,0.79"
                ] },
            { jp: "空", en: "Sky", kun: "そら・あ・から・す", on: "クウ",
                words: [{ jp: "空", reading: "そら", en: "sky" }, { jp: "空気", reading: "くうき", en: "air" }, { jp: "青空", reading: "あおぞら", en: "blue sky" }, { jp: "空港", reading: "くうこう", en: "airport" }, { jp: "空っぽ", reading: "からっぽ", en: "empty" }],
                strokes: [
                "M52.29,12c0.96,0.75,1.7,2,1.7,3.64c0,3.36-0.08,7.61-0.08,10.67",
                "M27.07,27.75c0,3.34-1.57,8.5-4.63,15.25",
                "M27.65,30c18.85-2.75,40.6-5.12,52.95-5.75c9.9-0.5,4.15,5-0.6,8.75",
                "M41.51,39c0.24,1.5-0.01,2.38-0.67,3.76C38.17,48.4,33.38,55.88,25,61.25",
                "M59.76,32.97c0.94,1.02,1.43,2.47,1.49,4.03c0.12,3.47,0.06,6.75,0.06,9.48c0,5.77,1.69,7.33,11.45,7.33c5.5,0,10.54-1.04,12.25-1.56",
                "M32.29,68.97c2.46,1.03,5.63,0.46,7.97,0.22c7.7-0.76,18.13-2.01,27.36-2.76c2.53-0.21,5.16-0.53,7.62,0.32",
                "M53.08,70.45c0.67,0.8,0.96,2.05,0.96,3.5c0,5.56-0.1,14.66-0.1,16.3",
                "M19.5,92.55c3.17,1.27,6.19,1,9.52,0.7c13.57-1.2,37.71-3.53,54.11-4.35c3.19-0.16,6.33-0.28,9.37,0.9"
                ] },
            { jp: "立", en: "Stand", kun: "た", on: "リツ・リュウ",
                words: [{ jp: "立つ", reading: "たつ", en: "to stand" }, { jp: "立派", reading: "りっぱ", en: "splendid" }, { jp: "国立", reading: "こくりつ", en: "national / state-run" }, { jp: "立ち上がる", reading: "たちあがる", en: "to stand up" }, { jp: "独立", reading: "どくりつ", en: "independence" }],
                strokes: [
                "M51.51,15c1.43,1.43,2.24,3.25,2.24,5.81c0,4.06,0,9.56,0,13.69",
                "M22,37.86c2.62,0.51,4.75,0.34,7,0.16c11.38-0.9,36.13-3.4,50.65-4.26c2.38-0.14,4.86-0.01,6.86,0.4",
                "M32,49c4.75,9.75,8.25,22.5,9.5,31.5",
                "M74,39c0.75,1.38,0.81,3.29,0.5,4.5c-2.88,11.12-8.5,30.38-12.75,42",
                "M15.25,88.8c2.33,0.45,5.89,0.53,7.82,0.39c18.3-1.32,40.31-1.94,64.83-2.75c3.24-0.11,6.14,0.05,8.47,0.88"
                ] },
            { jp: "耳", en: "Ear", kun: "みみ", on: "ジ",
                words: [{ jp: "耳", reading: "みみ", en: "ear" }, { jp: "耳鼻科", reading: "じびか", en: "ENT clinic" }, { jp: "早耳", reading: "はやみみ", en: "quick to hear news" }, { jp: "右耳", reading: "みぎみみ", en: "right ear" }, { jp: "耳が痛い", reading: "みみがいたい", en: "that's hard to hear (idiom)" }],
                strokes: [
                "M20.25,20c3.03,0.85,6.17,0.58,9.24,0.21c14.62-1.76,31.45-3.95,48.12-5.06c3.33-0.22,6.59-0.2,9.89,0.35",
                "M36.68,22.5c1.1,1.1,1.64,2.71,1.64,4.73c0,1.6-0.33,40.02-0.33,41.52",
                "M39.5,35.5c6.75-0.88,24-2.75,32.25-3.25",
                "M39.25,51.25c7-0.5,24.62-2.75,32.25-3",
                "M17.25,71c0.75,1.12,2.01,1.81,3.75,1.5c7-1.25,48-8.75,58.75-10.75",
                "M71,18.5c1,1,1.75,2.5,1.75,4.25c0,1.05,0.18,44.73,0.23,64.75c0.01,3.74,0.02,6.64,0.02,8.25"
                ] },
            { jp: "聞", en: "Hear", kun: "き", on: "ブン・モン",
                words: [{ jp: "聞く", reading: "きく", en: "to listen / ask" }, { jp: "新聞", reading: "しんぶん", en: "newspaper" }, { jp: "聞こえる", reading: "きこえる", en: "to be audible" }, { jp: "見聞", reading: "けんぶん", en: "experience / knowledge" }, { jp: "聞き取り", reading: "ききとり", en: "listening comprehension" }],
                strokes: [
                "M16.14,17.97c0.94,0.94,1.51,2.16,1.51,3.25c0,0.77-0.03,48.45-0.18,66.29c-0.03,3.16-0.05,5.37-0.07,6.21",
                "M19.01,19.6c6.86-1.22,18.49-3.1,21.08-3.39c1.9-0.21,3.03,0.79,3,2.46c-0.04,1.84-0.59,10.46-1.44,20.02c-0.09,1.04-0.15,2-0.15,2.69",
                "M18.81,30.43c6.94-1.05,15.82-2.55,22.41-2.9",
                "M17.86,42.57C26.25,41.25,33,40,40.42,39.4",
                "M66.21,14.22c0.66,0.66,1.17,1.78,1.17,2.93c0,0.56,0.12,13.19,0.17,19.1c0.02,1.71,0.03,2.83,0.03,2.91",
                "M68.51,16.1c6.89-1.1,19.28-3.26,21.17-3.36c1.96-0.1,3.57,1.38,3.57,2.98c0,18.78-0.26,60.28-0.26,73.89c0,11.13-6.37,2.13-8.21,0.25",
                "M68.59,25.94c5.16-0.69,18.16-2.44,23-2.71",
                "M69.13,36.75c6.37-0.75,15.12-2,22.15-2.53",
                "M33.5,51.24c1.71,0.31,4.02,0.25,5.71,0.06c9.6-1.05,20.21-3.05,30.66-4.05c2.83-0.27,4.57-0.1,6,0.05",
                "M42.71,53c0.89,0.89,1.3,2.26,1.3,3.51S44,79.31,44,83.84",
                "M45.13,61.43c4.49-0.43,13.74-2.05,19.78-2.36",
                "M44.81,71.67c5.72-0.67,12.31-1.92,20.12-2.95",
                "M32.51,85.14c0.99,0.86,2.2,1.23,3.25,0.92c4.87-1.43,28.2-7.83,34.76-9.39",
                "M64.84,49.66c0.62,0.63,1.05,1.71,1.05,2.99c0,0.66,0.12,27.55,0.15,39.1c0.01,1.88,0.01,3.36,0.01,4.25"
                ] },
            { jp: "花", en: "Flower", kun: "はな", on: "カ・ケ",
                words: [{ jp: "花見", reading: "はなみ", en: "flower viewing" }, { jp: "お花", reading: "おはな", en: "flower (polite)" }, { jp: "花屋", reading: "はなや", en: "flower shop" }, { jp: "花瓶", reading: "かびん", en: "vase" }, { jp: "花火", reading: "はなび", en: "fireworks" }],
                strokes: [
                "M17,29.77c3,0.73,6.35,0.54,9.37,0.29c16.22-1.35,36.31-4.64,56.76-4.79c2.4-0.02,4.77,0.04,7.12,0.51",
                "M32.25,16c1.25,0.5,2.25,1.62,2.5,2.75c1.33,5.97,4.86,19.92,5,20.75",
                "M71.25,12.5c0.42,1.18,0.47,3.05,0,4.5c-2.19,6.77-6.14,19.12-6.75,20.75",
                "M38.25,48.25c0.25,1.75-0.37,3.31-0.98,4.44C33.25,60,24.8,69.67,19.5,74.5",
                "M30.75,65.5c0.75,1,1.12,1.97,1.12,3c0,6.64-0.08,16.47-0.11,24c-0.01,1.96-0.01,3.82-0.01,5.5",
                "M84.25,50.25c-0.12,1.62-0.84,2.87-2,3.75c-4.62,3.5-11,6.75-19,9.75",
                "M58.25,43.75c1.06,1.06,1.5,2.5,1.5,4.75c0,2.96-0.22,20.59-0.22,31.25C59.53,93,63,94.15,77,94.15c16.25,0,18-2.65,18-11.15"
                ] },
            { jp: "行", en: "Go", kun: "い・おこな・ゆ", on: "コウ・ギョウ",
                words: [{ jp: "行く", reading: "いく", en: "to go" }, { jp: "旅行", reading: "りょこう", en: "travel" }, { jp: "銀行", reading: "ぎんこう", en: "bank" }, { jp: "行う", reading: "おこなう", en: "to conduct / carry out" }, { jp: "急行", reading: "きゅうこう", en: "express train" }],
                strokes: [
                "M32.49,12c-0.12,1-0.45,1.9-1.1,2.62C28.29,18.06,22.2,22.6,12.5,28",
                "M36.5,31.75c0.07,0.73,0.08,2.28-0.39,3.18C32.12,42.5,23.83,52.5,11,62.75",
                "M25.57,51.75c0.9,0.9,1.23,2.25,1.23,3.26c0,0.72,0.04,24.47-0.07,35.49c-0.02,2.19-0.04,3.87-0.07,4.75",
                "M50.5,18.45c1.44,0.35,3.81,0.52,5.23,0.35c7.14-0.8,16.01-2.43,24.49-3.06c2.38-0.18,3.83-0.06,5.02,0.11",
                "M43.13,41.42c1.5,0.38,4.27,0.58,5.76,0.38c12.86-1.67,28.86-4.05,41.85-5.38c2.49-0.26,4.01,0.18,5.26,0.37",
                "M71.52,41.33c1.26,1.26,1.76,2.79,1.76,5.27c0,14.56-0.26,38.66-0.26,43.62c0,8.03-7.21-0.5-8.71-1.75"
                ] },
            { jp: "西", en: "West", kun: "にし", on: "セイ・サイ",
                words: [{ jp: "西", reading: "にし", en: "west" }, { jp: "西口", reading: "にしぐち", en: "west exit" }, { jp: "西洋", reading: "せいよう", en: "the West / Occident" }, { jp: "関西", reading: "かんさい", en: "Kansai region" }, { jp: "西日", reading: "にしび", en: "the evening sun" }],
                strokes: [
                "M20.63,24.22c2.31,0.34,6.05,0.3,8.35,0.09c15.15-1.43,36.18-3.38,49.83-4.02c3.84-0.18,6.66-0.09,8.58,0.08",
                "M18.25,48.63c1.25,1.25,2.14,3.42,2.33,4.49c1.25,6.77,3.24,20.18,5.12,33.35c0.27,1.87,0.53,3.72,0.77,5.53",
                "M20.75,50.26c17.77-1.6,53.73-5.05,63.68-5.27c4.51-0.1,7.27,2.79,6.55,6.54c-1.6,8.35-4.1,21.97-6.49,32.97c-0.36,1.68-0.61,2.5-1.13,4.6",
                "M42.75,26.75c0.5,1.25,0.81,3.99,0.85,5.73C43.98,48.84,42,64.5,30.64,73.77",
                "M60.6,24.46c0.94,1.12,1.74,2.94,1.74,4.67c0,13.33-0.45,21.61-0.45,27.37c0,10.25,0.62,11.14,11.36,11.14c6.38,0,8.94-0.54,10.55-1.53",
                "M27.34,88.55C40.75,88,66.69,86.2,83,85.97"
                ] },
            { jp: "見", en: "See", kun: "み", on: "ケン",
                words: [{ jp: "見る", reading: "みる", en: "to see" }, { jp: "花見", reading: "はなみ", en: "flower viewing" }, { jp: "見物", reading: "けんぶつ", en: "sightseeing" }, { jp: "見つける", reading: "みつける", en: "to find" }, { jp: "意見", reading: "いけん", en: "opinion" }],
                strokes: [
                "M32.5,15.46c0.96,0.96,1.18,2.1,1.18,3.52c0,1.12,0.07,27.43-0.02,39.27c-0.02,3.12-0.02,5.21,0.02,5.5",
                "M34.65,17.15c9.23-1.27,22.23-2.65,31.1-3.65c2.99-0.34,4.26,1.01,4.26,3.55c0,2.5-0.1,28.08-0.14,38.96c-0.01,2.91-0.02,4.75-0.02,4.79",
                "M34.84,31.1c7.28-0.6,25.03-2.98,33.9-3.38",
                "M34.86,44.63C43.38,44,59,42.12,68.6,41.51",
                "M34.71,59.66C44.5,59,58.38,57.5,68.45,57.03",
                "M41.99,66.75c0.26,1.5,0.01,2.99-0.41,4.04c-2.7,6.83-13.83,20.83-28.41,27.87",
                "M54.49,61.37c1.07,1.07,1.33,2.59,1.38,4.43c0.2,8.19,0.04,6.2,0.04,18.2c0,10.12,1.23,11.53,18.54,11.53c18.81,0,19.81-1.53,19.81-10.12"
                ] },
            { jp: "言", en: "Say", kun: "い・こと", on: "ゲン・ゴン",
                words: [{ jp: "言う", reading: "いう", en: "to say" }, { jp: "言葉", reading: "ことば", en: "word / language" }, { jp: "方言", reading: "ほうげん", en: "dialect" }, { jp: "言語", reading: "げんご", en: "language" }, { jp: "独り言", reading: "ひとりごと", en: "talking to oneself" }],
                strokes: [
                "M48.38,11.25c4.38,2.5,8.88,7.75,10.38,11.5",
                "M14.88,33.98c2.52,0.54,6.91,0.76,9.42,0.54c22.95-2.02,40.82-4.02,59.99-4.73c4.2-0.16,6.73,0.26,8.83,0.53",
                "M38.63,46.65C40,47,41,47,42.45,46.88c7.06-0.6,18.6-2.27,22.81-2.6c1.86-0.15,3.36-0.15,4.74,0.22",
                "M37.88,61.4c1.5,0.23,2.75,0.35,4.16,0.23c7.68-0.67,20.23-2.28,24.8-2.85c2.16-0.27,3.66-0.15,5.17,0.22",
                "M37,74.75c0.81,0.81,1.4,1.76,1.53,2.77c0.85,6.73,1.9,11.43,2.89,18.45c0.18,1.24,0.35,2.43,0.54,3.53",
                "M39.53,76.74c9.24-1.7,22.59-3.37,30.29-4.25c2.21-0.25,3.55,1.17,3.24,2.32c-0.69,2.52-3.74,12.7-4.94,16.98",
                "M42.2,95.16c6.19-0.53,16.55-1.39,25.32-2.22c1.33-0.13,2.73-0.12,3.95-0.12"
                ] },
            { jp: "話", en: "Talk, Speak", kun: "はな・はなし", on: "ワ",
                words: [{ jp: "話す", reading: "はなす", en: "to speak" }, { jp: "電話", reading: "でんわ", en: "telephone" }, { jp: "会話", reading: "かいわ", en: "conversation" }, { jp: "話", reading: "はなし", en: "a talk / story" }, { jp: "昔話", reading: "むかしばなし", en: "old tale / folktale" }],
                strokes: [
                "M24.99,14c2.36,1.5,6.1,6.17,6.7,8.5",
                "M11.37,32.83c1.41,0.42,3.07,0.29,4.51,0.17c8.29-0.7,16.95-1.9,23.59-2.81c1.28-0.17,3.22,0.11,3.87,0.23",
                "M17.78,47.06c1.05,0.32,2.15,0.35,3.23,0.29c4.11-0.23,10.69-1.59,14.43-1.97c1.31-0.13,2.68-0.13,4.04-0.13",
                "M18.58,59.33c1.2,0.36,2.8,0.13,4.04,0.08c3.71-0.16,8.38-0.79,12.92-1.36c1.43-0.18,2.85-0.34,4.3-0.08",
                "M17.4,71.9c0.81,0.68,1.33,1.82,1.49,2.87c0.73,4.61,1.4,8.31,2.2,13.18c0.22,1.33,0.43,2.62,0.63,3.8",
                "M19.64,73.54c6.67-1.14,13.31-2.75,19.46-3.66c1.85-0.27,2.96,1.26,2.7,2.51c-0.89,4.19-2.46,8.16-4.05,14.07",
                "M22.49,89.55c4.76-0.55,8.86-1.17,14.02-1.72c0.93-0.1,1.91,0.04,2.97-0.09",
                "M81.75,13.75c-0.12,1.25-0.79,2.39-1.66,3.06c-4.84,3.69-15.34,9.94-29.34,14.94",
                "M45.39,45.8c1.55,0.34,4.36,0.62,6.73,0.34C62.8,44.9,76.37,43.07,91,42.23c2.28-0.13,4.49-0.01,6.75,0.29",
                "M68.87,27.19c1.4,1.4,1.85,3.06,1.85,4.88c0,1.44-0.21,28.18-0.21,35.16",
                "M52.07,67.83c0.93,1.17,1.22,1.76,1.35,2.34c1.38,6.2,2.13,12.33,3.08,20.33c0.13,1.14,0.27,2.31,0.42,3.53",
                "M54.62,69.29c12.9-1.37,25.41-2.73,32.68-3.31c2.94-0.24,3.79,2.4,3.37,3.8c-1.47,4.87-3.03,11.64-5.04,18.35",
                "M56.64,91.74c7.5-0.57,16.99-1.13,27.14-1.93c1.37-0.11,2.75-0.22,4.13-0.34"
                ] },
            { jp: "語", en: "Language", kun: "かた", on: "ゴ",
                words: [{ jp: "日本語", reading: "にほんご", en: "Japanese language" }, { jp: "英語", reading: "えいご", en: "English" }, { jp: "語学", reading: "ごがく", en: "language study" }, { jp: "単語", reading: "たんご", en: "vocabulary word" }, { jp: "物語", reading: "ものがたり", en: "story" }],
                strokes: [
                "M26,15.25c2.82,1.41,7.29,5.8,8,8",
                "M12.37,32.97c1.25,0.28,2.88,0.66,4.36,0.53c7.02-0.59,17.78-1.75,25.95-3c1.52-0.23,3.57-0.38,5.16,0.03",
                "M18.73,45.76c0.38,0.18,2.71,0.2,3.1,0.18c3.97-0.21,9.79-1.19,14.46-2.31c1.67-0.4,2.71-0.38,3.86-0.08",
                "M18.73,58.89c0.89,0.23,1.89,0.36,3.35,0.15c3.89-0.54,10.71-1.51,14.85-2.29c0.7-0.13,1.82-0.26,2.61-0.1",
                "M17.14,71.9c0.63,0.62,1.12,1.65,1.23,2.57c0.63,5.03,1.51,10.28,2.23,15.59c0.14,1.03,0.27,2.02,0.41,2.93",
                "M19.37,73.6c5.67-0.94,15.47-2.73,20.36-3.48c1.49-0.22,2.39,1.05,2.18,2.08c-0.71,3.44-2.27,9.75-3.23,13.89",
                "M21.47,89.02c3.95-0.45,10.71-1.19,16.28-1.61c1.21-0.09,2.36-0.17,3.41-0.22",
                "M51.79,17.49c1.38,0.26,3.91,0.28,5.27,0.15C63.88,17,72.62,15.62,80,15.32c2.3-0.1,3.67,0.04,4.81,0.15",
                "M67.75,20.25c0.37,1.25,0.5,2.38,0.23,3.75c-0.75,3.78-6.03,23.83-7.96,31.58",
                "M52.18,36.96c1.82,0.66,4.17,0.95,5.84,0.66c8.48-1.5,16.13-3.06,22.74-4.1c2.49-0.39,4.05,1.27,3.71,2.93c-0.6,2.93-2.48,11.43-3.74,17.86",
                "M46.33,58.46c1.13,0.24,3.94,0.2,5.07,0.08c12.34-1.29,19.11-2.39,40.88-4.02c1.88-0.14,3.75-0.02,4.69,0.09",
                "M52.5,69.88c0.93,0.93,1.42,2.28,1.54,3.31c0.71,6.06,1.42,12.65,2.06,19.3c0.15,1.5,0.28,2.44,0.4,3.75",
                "M54.99,71.67c9.47-1.45,23.75-3.41,28.85-3.9c2.14-0.21,3.28,0.98,2.86,2.93c-0.84,3.88-3.08,12.57-4.39,17.58",
                "M57.2,91.49c5.94-0.55,14.67-1.24,23.54-1.76c1.3-0.08,2.63-0.13,3.97-0.2"
                ] },
            { jp: "読", en: "Read", kun: "よ", on: "トウ・ドク",
                words: [{ jp: "読む", reading: "よむ", en: "to read" }, { jp: "読書", reading: "どくしょ", en: "reading" }, { jp: "音読", reading: "おんどく", en: "reading aloud" }, { jp: "読者", reading: "どくしゃ", en: "reader" }, { jp: "読み方", reading: "よみかた", en: "how to read" }],
                strokes: [
                "M22.38,14.75c2.25,1.63,5.81,6.71,6.37,9.25",
                "M10.37,33.08c1.61,0.48,3.62,0.35,5.27,0.14c5.96-0.76,13.52-1.42,20.1-2.38c1.5-0.22,3.09-0.43,4.6-0.16",
                "M16.23,46.31c1.17,0.37,2.73,0.18,3.93-0.01c3.99-0.62,8.33-1.2,11.58-1.97c1.35-0.32,3.26-0.58,4.65-0.58",
                "M16.73,58.58c1.02,0.35,2.46,0.15,3.53,0.04c3.8-0.4,9.57-1.17,12.55-1.77c1.45-0.29,2.94-0.48,4.22-0.14",
                "M15.64,70.4c0.71,0.61,1.08,1.37,1.12,2.29c0.79,3.76,1.71,9.85,2.52,15.05c0.16,1.05,0.32,2.06,0.48,3",
                "M17.75,72.05c6.09-0.91,11.59-1.7,17.42-2.67c1.7-0.28,2.73,1.3,2.49,2.58c-0.85,4.46-1.61,6.91-2.88,12.78",
                "M20.47,88.3c4.06-0.46,7.76-1.19,12.79-1.92c0.92-0.13,1.88-0.26,2.9-0.39",
                "M46.37,26.71c2.31,0.59,4.67,0.42,7,0.15c9.97-1.14,21.82-2.23,29.77-3.06c2.36-0.25,4.38-0.21,6.71,0.14",
                "M65.76,13.25c1.06,1.06,1.59,2.08,1.59,3.25c0,8.5-0.07,17.03-0.19,20.46",
                "M52.53,38.58c2.22,0.42,4.15,0.3,5.98,0.08C64,38,71.21,37.1,78,36.47c1.61-0.15,3.63-0.29,5.23,0.04",
                "M46.14,48.1c-0.11,3.93-1.7,12-2.6,14.35",
                "M47,49.96c11.42-1.27,28-3.71,41.35-4.28c9.15-0.39,0.43,7.14-0.74,8.35",
                "M59.49,59.25c0.5,1.52,0.71,3.09,0.29,4.83c-2.76,11.61-6.54,22.94-15.26,30.61",
                "M71.64,56.26c1.11,1.24,1.65,2.67,1.69,4.37c0.11,4.62-0.13,16.99-0.13,24.62c0,9.5,0.8,10.52,11.3,10.52c11,0,11.38-1.02,11.38-7.31"
                ] },
            { jp: "買", en: "Buy", kun: "か", on: "バイ",
                words: [{ jp: "買う", reading: "かう", en: "to buy" }, { jp: "買い物", reading: "かいもの", en: "shopping" }, { jp: "買い物客", reading: "かいものきゃく", en: "shopper" }, { jp: "購買", reading: "こうばい", en: "purchasing" }, { jp: "売買", reading: "ばいばい", en: "buying and selling" }],
                strokes: [
                "M20.5,14.64c0.49,0.49,1.44,1.59,1.66,2.43c1.09,4.17,1.51,6.88,2.4,11.91c0.2,1.15,0.39,2.26,0.55,3.26",
                "M23.25,16.2c15.2-1.38,58.15-3.72,64.01-4.22c2.74-0.23,4.12,1.39,3.32,3.95c-1.08,3.44-1.82,5.56-3.62,10.4c-0.38,1.02-0.87,1.99-1.32,2.94",
                "M43.25,16.5c0.75,0.75,0.68,1.25,0.85,2.27c0.6,3.64,1.21,7.47,1.4,9.23",
                "M66.25,14.5c0.5,0.75,0.42,2.03,0.29,3.01c-0.54,4.37-0.79,6.62-1.29,9.24",
                "M26.3,30.62c8.83-0.74,51.2-3.49,59.17-3.65",
                "M34.7,38.87c1.09,1.09,1.57,2.82,1.57,4.01c0,1.2,0.07,32.68,0.07,33.28s-0.07,2.47-0.07,3.8",
                "M37.02,40.77c8.15-0.63,32.05-3.03,34.84-3.03c2.89,0,4.19,1.26,4.19,3.7c0,2.44-0.08,19.9-0.06,33.08c0,1.35,0.04,2.86,0.04,4.34",
                "M37.53,52.38c5.97-0.26,31.44-2.43,37.25-2.43",
                "M37.5,64.75C46.25,64,65,62.5,74.59,62.1",
                "M37.76,76.86c8.24-0.48,27.49-1.73,36.87-2.04",
                "M43.77,83c0.23,1.5-0.38,2.82-1.5,3.83C38.75,90,30.5,95.5,21.5,99",
                "M69.84,83.97C75,87.91,80.38,94.38,82.5,98.5"
                ] },
            { jp: "足", en: "Foot, Leg, Sufficient", kun: "あし・た", on: "ソク",
                words: [{ jp: "足", reading: "あし", en: "foot / leg" }, { jp: "足りる", reading: "たりる", en: "to be sufficient" }, { jp: "満足", reading: "まんぞく", en: "satisfaction" }, { jp: "足元", reading: "あしもと", en: "at one's feet" }, { jp: "遠足", reading: "えんそく", en: "school excursion" }],
                strokes: [
                "M29.75,18.99c0.82,0.82,1.43,1.68,1.66,2.33c1.15,3.39,3.44,13.48,4.61,18.68c0.34,1.51,0.59,2.61,0.68,3",
                "M31.56,19.63c12.09-1.87,34.1-5.01,40.27-5.14c2.89-0.06,3.98,2.41,3.7,3.88c-0.73,3.84-3.94,15.23-4.51,17.27",
                "M37.25,40.74c7.07-0.43,20.75-2.48,31.53-3.73c1.71-0.2,3.34-0.14,4.86-0.32",
                "M52.75,41c0.81,0.81,1.4,1.75,1.4,3.62c0,5.11,0.37,32.49,0.35,33.88",
                "M55.75,59.25C56.94,59.25,66.25,57.75,73.54,56.53C75.08,56.27,76.53,56.25,77.75,56.25",
                "M36.49,55c0.13,1.5,0.14,3.05-0.2,4.35c-2.04,7.78-10.16,24.15-17.79,30.9",
                "M33.25,70.75C41.75,72.12,67,87.38,82,92.5c2.94,1,6.85,1.68,9.75,2"
                ] },
            { jp: "車", en: "Car", kun: "くるま", on: "シャ",
                words: [{ jp: "車", reading: "くるま", en: "car" }, { jp: "電車", reading: "でんしゃ", en: "train" }, { jp: "自転車", reading: "じてんしゃ", en: "bicycle" }, { jp: "車内", reading: "しゃない", en: "inside a vehicle" }, { jp: "駐車場", reading: "ちゅうしゃじょう", en: "parking lot" }],
                strokes: [
                "M26,26c2.85,0.69,6.1,0.14,8.98-0.1c11.09-0.93,25.8-2.64,38.89-3.51c2.68-0.18,5.22-0.16,7.88,0.23",
                "M27.5,37.92c0.81,0.5,1.83,2.39,1.98,3.05c0.85,3.73,1.83,11.31,2.95,18.54c0.32,2.09,0.41,3.2,0.75,5.24",
                "M30.36,39.49c14.52-1.61,36.14-4.11,47.63-4.5c3.46-0.12,4.17,1.57,4.03,3.08c-0.42,4.32-2.01,13.81-3.5,20.19c-0.21,0.89-0.51,1.87-0.76,3",
                "M32.5,51.25c13.75-1.5,34.25-3.75,47-4.25",
                "M34.25,63.25C46,61.62,65,59.75,77,59.25",
                "M16,77.86c3.62,0.89,7.38,0.77,10.63,0.39c18.51-2.14,39.85-4.55,57.12-5.45c3.05-0.16,6.5-0.05,9.5,0.63",
                "M52.5,11.51c1.36,1.36,2.06,2.78,2.14,6.02c0.03,1.07-0.07,48.79-0.19,70.7c-0.02,4.27-0.05,7.36-0.07,8.65"
                ] },
            { jp: "週", en: "Week", kun: "—", on: "シュウ",
                words: [{ jp: "今週", reading: "こんしゅう", en: "this week" }, { jp: "来週", reading: "らいしゅう", en: "next week" }, { jp: "毎週", reading: "まいしゅう", en: "every week" }, { jp: "先週", reading: "せんしゅう", en: "last week" }, { jp: "週末", reading: "しゅうまつ", en: "weekend" }],
                strokes: [
                "M45.93,17.66c1.02,1.02,1.67,2.55,1.67,4.3c0,21.04,2.53,45.54-8.1,58.79",
                "M48.49,18.95c9.79-1.25,32.29-4.39,33.41-4.45c4.34-0.24,5.42,1.26,5.42,5.64c0,1.93,0.17,52.16,0.17,56.6c0,9.53-5.28,4.86-8.4,1.69",
                "M55.43,31.42c0.83,0.25,2.88,0.54,3.72,0.51c4.54-0.18,13.51-1.92,16.84-2.23c1.39-0.13,2.22-0.07,2.91,0.03",
                "M65.84,22.3c0.99,0.99,1.51,2.32,1.51,3.39c0,3.19-0.07,10.44-0.07,16.81",
                "M53.61,44.53c1,0.35,2.64,0.41,4.31,0.23C65,44,70.38,43.38,77.01,42.4c1.84-0.27,3.25-0.4,4.81-0.26",
                "M56.17,53.75c1.08,0.75,1.6,2.01,1.71,2.97c0.5,4.53,1.05,6.63,1.48,10.27c0.17,1.46,0.3,2.58,0.34,2.94",
                "M58.6,55.4c5.86-1.39,13.69-2.83,16.29-3.02c1.73-0.13,2.48,1,2.28,2.58c-0.38,2.92-1.34,5.94-2.12,9.61",
                "M60.65,67.64c2.32-0.44,8.3-1.1,13.1-1.63c1.43-0.16,2.69-0.28,3.61-0.34",
                "M20.71,19c3.1,1.41,8.02,5.8,8.79,8",
                "M13.25,54.95c2.25,0.92,4.29,0.84,5.25,0.48c2.5-0.93,8.31-4.06,9.75-4.68c2.88-1.24,4.14,0.9,1.5,3.78c-6.38,6.98-6,8.23-0.75,14.1c1.83,2.04,2.03,3.44-1.5,6.12c-5.25,4-7.5,5.75-10.75,8.5",
                "M13.75,85.75c4.12-0.88,10.41-0.97,15-0.5c7.25,0.75,29.97,5.13,34.5,6c13,2.5,21.25,4.5,30.25,2.75"
                ] },
            { jp: "道", en: "Road, Street, Path, Way", kun: "みち", on: "ドウ",
                words: [{ jp: "道", reading: "みち", en: "road" }, { jp: "北海道", reading: "ほっかいどう", en: "Hokkaido" }, { jp: "道具", reading: "どうぐ", en: "tool" }, { jp: "水道", reading: "すいどう", en: "water supply" }, { jp: "柔道", reading: "じゅうどう", en: "judo" }],
                strokes: [
                "M49.38,14.88c2.61,1.78,6.73,7.3,7.38,10.06",
                "M77.25,12.5c0.06,0.84-0.03,1.66-0.37,2.42c-1.38,3.08-3.38,6.7-6.63,10.2",
                "M42.06,32.6c1.75,0.45,4.97,0.38,6.7,0.2c9.99-1.05,25.86-2.93,36.82-3.2c2.91-0.07,4.8,0.15,6.12,0.44",
                "M64.26,33.62c0.25,0.1-0.23,1.75-0.39,2.04c-1.03,1.93-2.08,4.55-4.5,7.09",
                "M51.06,43.52c0.77,0.77,1.13,1.71,1.13,2.82c0,0.9-0.1,22.98-0.06,31.9c0.01,2.08,0.03,3.45,0.06,3.66",
                "M53.01,45.09c6.24-0.71,22.66-2.75,24.6-2.88c1.96-0.14,3.35,0.55,3.35,2.81c0,1.08-0.57,23.4-0.8,32.24c-0.05,2-0.09,3.28-0.12,3.43",
                "M52.9,55.9c6.1-0.4,20.85-2.15,26.64-2.34",
                "M53.11,67.65c6.85-0.47,19.47-1.75,26.13-1.75",
                "M53.36,79.25c5.14,0,18.66-1.07,25.31-1.07",
                "M19.75,20c3.38,1.75,8,6.12,9.5,8.75",
                "M13,51.53c2.25,0.86,3.75,0.43,4.75,0.22s9-3.47,10.5-3.9c2.96-0.85,4.22,0.21,2.44,3.03c-6.56,10.38-6.81,8.5-0.11,14.4c2.39,2.1,2.15,3.52-0.57,5.48C25.5,74,21.75,76.25,17.5,79.04",
                "M12.5,81.71c3.11-0.47,9.22-0.87,13.97-0.71c7.15,0.25,31.13,8.25,35.71,9.46C74.61,93.76,81.62,95.5,91,96.05"
                ] },
            { jp: "金", en: "Gold", kun: "かね", on: "キン",
                words: [{ jp: "お金", reading: "おかね", en: "money" }, { jp: "金曜日", reading: "きんようび", en: "Friday" }, { jp: "金魚", reading: "きんぎょ", en: "goldfish" }, { jp: "料金", reading: "りょうきん", en: "fee" }, { jp: "現金", reading: "げんきん", en: "cash" }],
                strokes: [
                "M51.75,11.88c0.25,1.52-0.22,3.57-0.8,4.84C47.73,23.79,33.13,47.1,14.5,58",
                "M52.25,18.25c9.5,7.5,34.14,30.88,37.21,32.67c3.12,1.82,4.14,2.66,5.54,2.83",
                "M34.02,47.08c1.69,0.65,3.85,0.36,5.6,0.21c6.91-0.6,14.33-1.69,23.99-2.64c2.07-0.2,4.1-0.4,6.15,0.12",
                "M30.18,64.96c1.95,0.67,4.47,0.31,6.47,0.12c9.24-0.87,17.42-1.58,31.35-2.53c2.3-0.16,4.68-0.36,6.96,0.08",
                "M51.47,48.82c0.89,0.85,0.89,3.76,0.89,4.43c0,3.64,0.27,38.71,0.22,39.82",
                "M31,74.75c3.25,3,7.48,9.27,8.5,12",
                "M73.01,72.11c0.24,1.14,0.11,2.46-0.54,3.51C70.38,79,66.44,83.22,63,86",
                "M18.5,94.86c2.88,1.01,6.41,0.4,9.37,0.15c16.55-1.42,32.95-2.12,51.51-3c3.13-0.15,6.32-0.27,9.38,0.59"
                ] },
            { jp: "長", en: "Long, Leader", kun: "なが", on: "チョウ",
                words: [{ jp: "長い", reading: "ながい", en: "long" }, { jp: "校長", reading: "こうちょう", en: "principal" }, { jp: "社長", reading: "しゃちょう", en: "company president" }, { jp: "長さ", reading: "ながさ", en: "length" }, { jp: "部長", reading: "ぶちょう", en: "department head" }],
                strokes: [
                "M34,14.75C35.25,16,36,18,36,19.5s0,33.5,0,35.75",
                "M37.75,16c9.6-0.15,21.73-3.26,26.63-4.2c1.97-0.38,3.9-0.41,5.87,0.06",
                "M37.25,29.5C48.12,28.25,57,27,64,25.72c1.96-0.36,3.76-0.25,5.25,0.06",
                "M37.5,42.5c8.88-0.86,21.62-2.62,26.75-3.53c1.97-0.35,3.88-0.32,5.75,0",
                "M10.88,58.23c3.14,0.86,6.44,0.68,9.62,0.29c19.73-2.35,44.86-6.1,65-7.61c2.97-0.22,5.7-0.08,8.63,0.4",
                "M31.25,60.25c0.94,0.94,1.39,2.38,1.39,4c0,11.82-0.7,28.19-0.7,30.19s1.65,3.14,3.74,1.64c2.09-1.5,17.25-11.09,20.03-12.59",
                "M76.52,55.25c0.23,1.25-0.33,2.45-1.05,3.41C73.5,61.25,69.62,65,64.62,68.75",
                "M46.5,62.25c8.21,0,34.52,25.9,44.28,29.5C93.12,92.61,94.51,93,97,93.5"
                ] },
            { jp: "間", en: "Interval, Interval Of Time, Time Interval", kun: "あいだ・ま", on: "カン・ケン",
                words: [{ jp: "時間", reading: "じかん", en: "time" }, { jp: "人間", reading: "にんげん", en: "human being" }, { jp: "間に合う", reading: "まにあう", en: "to be in time" }, { jp: "週間", reading: "しゅうかん", en: "week-long period" }, { jp: "その間", reading: "そのあいだ", en: "in the meantime" }],
                strokes: [
                "M18.64,15.3c0.71,0.71,1.18,1.82,1.18,3.43c0,3.89-0.05,56.65-0.19,72.77c-0.02,1.92-0.03,4.03-0.05,4.65",
                "M21.01,16.81c5.75-0.6,18.73-2.74,20.5-2.84c1.85-0.1,2.86,0.28,2.9,2.02c0.06,2.75-0.5,16.1-0.85,20.76c-0.12,1.55-0.19,2.57-0.19,2.7",
                "M20.95,27.27c5.99-0.61,14.92-2.02,21.88-2.6",
                "M21.02,39.04c8.11-1.19,14.14-2.1,21.31-2.64",
                "M63.19,13.1c0.98,0.98,1.34,2.15,1.34,2.97c0,5.8-0.08,12.65-0.06,18.93c0.01,2.01,0.02,3.4,0.06,3.58",
                "M65.32,14.77c5.97-0.68,20.69-3.19,22.38-3.28c1.8-0.09,2.81,0.88,2.81,2.82c0,17-0.22,66.12-0.22,78.44c0,10.5-6.35,1.36-7.72,0.23",
                "M65.63,24.79c4.49-0.42,19.73-1.99,23.35-1.99",
                "M65.22,36.07c6.41-0.32,16.53-1.32,23.49-1.81",
                "M40.56,50.95c0.74,0.74,1.04,1.93,1.04,2.99c0,0.83-0.08,20.84-0.05,29.06c0.01,2.25,0.02,2.77,0.05,3",
                "M42.26,52.09c5.56-0.48,19.71-1.98,21.3-2.1c1.68-0.13,2.76,1.46,2.63,2.24c-0.21,1.24-0.41,20.66-0.48,29.02c-0.02,2.29-0.03,3.8-0.03,3.97",
                "M42.64,66.6c5.11-0.48,17.36-1.73,21.88-2.07",
                "M42.25,82.8c5.13-0.3,17-1.55,22.26-2.05"
                ] },
            { jp: "雨", en: "Rain", kun: "あめ・あま", on: "ウ",
                words: [{ jp: "雨", reading: "あめ", en: "rain" }, { jp: "大雨", reading: "おおあめ", en: "heavy rain" }, { jp: "梅雨", reading: "つゆ", en: "rainy season" }, { jp: "雨の日", reading: "あめのひ", en: "rainy day" }, { jp: "雨傘", reading: "あまがさ", en: "umbrella" }],
                strokes: [
                "M25.75,22.37c1.87,0.4,4.47,0.62,6.32,0.4c11.68-1.39,28.28-3.77,41.25-4.64c2.49-0.17,4.37-0.12,7.18,0.28",
                "M15.5,41.25c1.25,1.5,1.66,3.26,1.89,5.19c1.24,10.69,2.19,26.61,2.66,36.31c0.13,2.7,0.2,5,0.2,6",
                "M18.25,44.25c1.42-0.09,62.76-5.33,69.5-6c2.5-0.25,4.61,1,4.5,3.75c-0.5,12.75-1.77,28.11-6,44.75c-1.88,7.38-5.38,1.88-8.5-1.25",
                "M52.25,23.5C53.31,24.56,54,26.25,54,28c0,0.82-0.25,37.8-0.43,53c-0.04,3.43-0.07,5.74-0.07,6.25",
                "M31,53.5c4.21,1.24,8.95,3.94,11.25,6",
                "M30.5,68.75c3.8,1.26,9.68,5.89,11.75,8",
                "M66.88,48.88c4.98,1.99,10.63,5.97,12.62,7.62",
                "M67.25,66.5c2.75,1,9,5.5,11,7.75"
                ] },
            { jp: "電", en: "Electricity", kun: "—", on: "デン",
                words: [{ jp: "電話", reading: "でんわ", en: "telephone" }, { jp: "電車", reading: "でんしゃ", en: "train" }, { jp: "電気", reading: "でんき", en: "electricity / light" }, { jp: "電池", reading: "でんち", en: "battery" }, { jp: "停電", reading: "ていでん", en: "power outage" }],
                strokes: [
                "M34.66,16.19c2.31,0.7,4.78,0.25,7.11-0.04c6.03-0.75,16.15-1.97,23.49-2.76c2.19-0.23,4.03-0.14,6.05,0.1",
                "M19.51,29.11c-0.2,5.55-1.93,11.7-3.21,17.3",
                "M20.85,32.18C37.62,30.38,70,25.62,86.4,25.2c9.1-0.24,2.35,6.05-0.78,9.53",
                "M50.92,17.26c1.1,1.1,1.83,2.49,1.83,3.76c0,3.98-0.16,17.08-0.23,23.73c-0.02,2.1-0.04,3.56-0.04,3.89",
                "M32.75,36.46c3.42,0.53,8.09,2.12,9.96,3",
                "M31.25,45c3.16,0.57,8.05,2.68,9.77,3.64",
                "M65.5,33.47c3.66,0.79,7.81,2.37,9.28,3.03",
                "M65.54,41.89c2.82,0.77,6.67,3.06,8.21,4.34",
                "M25.86,55.87c0.89,1.04,1.07,1.52,1.21,2.88c0.47,4.62,2.55,21.84,2.55,22.22c0,0.43,0.19,1.93,0.37,2.79",
                "M28.04,57.11c10.79-1,41.49-4.23,43.85-4.37c4.11-0.24,5.36,1.76,4.73,4.82c-0.27,1.31-2.37,9.94-4.05,17.74c-0.2,0.95-0.69,2.39-0.69,3.04",
                "M29.46,68.34c7.42-0.97,36.17-3.47,44.14-3.8",
                "M31.02,80.34C42.25,79,59.5,77.75,71.25,76.75",
                "M48.42,57.62c1.08,1.13,1.45,2.8,1.45,4.78c0,4.85-0.1,12.75-0.1,18.85c0,12.75,1.48,14.5,20.5,14.5c19.23,0,20.18-2.75,20.18-10.82"
                ] },
            { jp: "食", en: "Eat, Meal", kun: "た・く", on: "ショク",
                words: [{ jp: "食べる", reading: "たべる", en: "to eat" }, { jp: "食事", reading: "しょくじ", en: "meal" }, { jp: "朝食", reading: "ちょうしょく", en: "breakfast" }, { jp: "食堂", reading: "しょくどう", en: "cafeteria" }, { jp: "食べ物", reading: "たべもの", en: "food" }],
                strokes: [
                "M52.75,10.5c0.11,0.98-0.19,2.67-0.97,3.93C45,25.34,31.75,41.19,14,51.5",
                "M52.75,16.25c5.09,4.8,25.71,19.61,33.7,24.9c2.68,1.78,5.37,2.79,8.55,3.35",
                "M52.25,29.25c1,1,1.5,2.25,1.5,3.5c0,2,0,3,0,5.5",
                "M38,40c0.83,0.47,2.19,1,3.86,0.83c9.39-0.96,21.95-2.76,23.25-2.84c1.67-0.1,3.14,0.88,3.11,2.53C68.2,41.8,67,53.25,66.34,62.4c-0.07,0.94-0.13,1.36-0.13,1.99",
                "M40.83,51.73C47.25,51.25,59.5,50,66,49.75",
                "M40.69,63.9c7.04-0.52,16.55-1.62,24.6-2.04",
                "M38.25,40.25c1.12,1.12,1.5,2.62,1.5,4c0,9.12,0,43.62,0,47.25c0,4,1,4.88,4.12,2.88c2.93-1.87,6.75-5.25,10.88-8.38",
                "M74,64c0.25,1.25,0.09,2.57-0.75,3.5c-3.5,3.88-4.5,4.88-7.25,7.5",
                "M51.5,71C55.75,71,77,90,81,92.75c2.49,1.71,4.62,2.62,7.5,3.5"
                ] },
            { jp: "飲", en: "Drink", kun: "の", on: "イン",
                words: [{ jp: "飲む", reading: "のむ", en: "to drink" }, { jp: "飲み物", reading: "のみもの", en: "beverage" }, { jp: "飲食", reading: "いんしょく", en: "eating and drinking" }, { jp: "飲み会", reading: "のみかい", en: "drinking party" }, { jp: "試飲", reading: "しいん", en: "tasting (a drink)" }],
                strokes: [
                "M31.53,14.5c0.06,0.73,0.24,1.94-0.12,2.92c-2.96,8.1-11.79,20.97-21.04,27.95",
                "M33.5,19.5c5.48,2.15,11.9,6.21,15,10.75",
                "M32.79,32.26c0.85,0.85,1.28,2.38,1.28,3.32c0,3.54-0.08,5.92-0.08,8.2",
                "M20.01,46.32c1.61,0.8,2.86,0.43,4.86,0.03c5.87-1.17,15.18-2.91,16.08-3.04c2.3-0.32,2.98,1.17,2.77,2.63c-0.71,4.9-2.07,13.76-2.78,18.54c-0.27,1.86-0.45,3.1-0.45,3.26",
                "M22.71,57.53c4.17-0.91,13.42-2.41,18.53-3.16",
                "M22.37,68.85c5.51-0.98,11.63-1.73,17.21-2.47",
                "M20.37,47.01c0.69,0.69,1.03,1.8,1.03,2.74c0,5.75-0.29,36.68-0.33,38.97C21,92.75,21.5,93.75,26,90.5c2.1-1.52,7-5,12.5-8.25",
                "M37.25,74.25c1.59,2.03,4.09,7.46,5,11.75",
                "M61.5,14.25c0.25,1.12,0.42,2.14,0.18,3.31C60,25.75,55.82,40.12,49,49.5",
                "M58.22,37.74c1.9,0.39,3.14,0.18,4.51-0.14c1.67-0.39,21.21-5.25,22.76-5.6c6.75-1.5,3.5,4.5-3,11.25",
                "M64.85,47.5c0.78,1.5,0.86,2.88,0.62,4.52C63,68.62,57.25,84.5,42.25,95.75",
                "M65.42,60.5c3.56,6.77,15.26,21.56,22.62,29.46c1.89,2.03,3.98,4.66,6.71,5.54"
                ] },
            { jp: "駅", en: "Station, Train Station", kun: "—", on: "エキ",
                words: [{ jp: "駅", reading: "えき", en: "station" }, { jp: "駅前", reading: "えきまえ", en: "in front of the station" }, { jp: "駅員", reading: "えきいん", en: "station staff" }, { jp: "地下鉄駅", reading: "ちかてつえき", en: "subway station" }, { jp: "隣の駅", reading: "となりのえき", en: "the next station" }],
                strokes: [
                "M16.24,17.12c0.76,0.63,1.5,1.69,1.49,2.88c-0.04,7.8-0.57,24.25-0.67,34.5c-0.02,2.35,0.09,3.32-0.31,5.75",
                "M18.23,18.15c4.39-0.65,17.37-2.21,22.41-2.87c1.63-0.21,3.26-0.51,4.9-0.21",
                "M30.31,17.82c0.49,0.49,0.95,1.46,0.95,2.49c0,6.17-0.25,26.44-0.25,35.66",
                "M18.41,32.09c5.46-0.51,16.44-2.11,21.13-2.77c1.19-0.17,3.34-0.57,4.56-0.25",
                "M18.51,44.88c5.61-0.52,16.7-1.95,21.02-2.57c1.15-0.17,3.05-0.71,4.17-0.2",
                "M17.74,59.65c6.17-1.41,20.29-4.04,23.68-4.63c4.33-0.76,4.19,2.81,3.95,6.45C44.7,71.81,42.59,83.13,39.75,90c-3,7.25-5.62,1.62-7.21-0.86",
                "M9.79,73.5c0.28,6.41-0.57,12.04-0.87,13.32",
                "M17.5,71.5c1.08,2.1,2,4.75,2.25,8.5",
                "M25.44,68.22C26,69.25,28,72.64,28.25,76",
                "M32.75,65.25c1.25,2.01,3.3,4.09,3.75,6.75",
                "M55.22,20.32c1.16,0.77,2.9,0.9,4.14,0.79c7.4-0.61,19.18-2.64,21.85-2.97c3.3-0.4,4.77,1.69,4.42,3.94C84.97,26.2,83.6,34.25,82,40.32",
                "M58.61,44.25c3.51-0.38,13.46-1.53,20.43-2.42c2.36-0.3,3.58-0.33,5.1-0.09",
                "M56.84,21.12c0.91,0.88,1.04,2.43,1.05,3.38c0.67,41.32-3.54,54.77-10.14,66.5",
                "M64.28,44.75c5.1,9.38,16.09,30.23,25.17,40.55c2.13,2.42,4.99,5.29,8.05,6.45"
                ] },
            { jp: "高", en: "Tall, Expensive, High", kun: "たか", on: "コウ",
                words: [{ jp: "高い", reading: "たかい", en: "tall / expensive" }, { jp: "高校", reading: "こうこう", en: "high school" }, { jp: "高速", reading: "こうそく", en: "high speed" }, { jp: "円高", reading: "えんだか", en: "strong yen" }, { jp: "最高", reading: "さいこう", en: "the best" }],
                strokes: [
                "M52.47,11.75c1.08,1.08,1.48,2.25,1.48,4.22c0,1.53-0.12,4.28-0.12,5.45",
                "M22.9,25.7c2.68,0.3,4.96,0.26,7.47-0.04c14.76-1.78,35.83-4.16,49.3-5.17c2.89-0.22,4.99-0.12,6.81,0.33",
                "M36.25,34.75c1,0.63,1.5,1.5,1.78,2.89c0.72,3.59,1.36,7.37,2.05,11.85c0.2,1.3,0.17,1.82,0.44,3.01",
                "M39.05,36.33c9.95-1.71,23.99-3.65,29.61-4.1c2.96-0.23,3.83,1.02,3.14,3.31c-0.88,2.93-2.17,7.01-3.32,10.2",
                "M41.28,49.94c6.57-0.42,16.36-1.87,25.72-2.71c1.3-0.12,2.59-0.22,3.85-0.31",
                "M21,60.25c1.31,1.31,1.9,2.76,2.21,5c0.79,5.62,2.21,18.19,3.16,26.99c0.15,1.39,0.28,2.67,0.38,3.76",
                "M24.06,64c16.08-1.51,58.63-6.55,60.19-6.75c3.75-0.5,6,1.5,5.25,6.25c-1.49,9.45-2.62,19.62-5.25,28.25c-2.05,6.75-5.38,2.5-7.8,0",
                "M41.5,71.68c0.66,0.66,1.16,1.63,1.31,2.47c0.89,2.82,1.58,7.24,2.39,11.81c0.21,1.16,0.4,1.78,0.56,2.79",
                "M44.02,73.08c6.79-1.36,17.1-2.86,20.92-3.35c1.81-0.23,3.31,1.02,3.13,2.5c-0.35,2.92-1.96,8.31-3.12,11.75",
                "M46.44,87.05c4.61-0.4,11.01-1.31,17.32-1.94c0.88-0.09,1.77-0.17,2.65-0.26"
                ] },
            { jp: "魚", en: "Fish", kun: "さかな", on: "ギョ",
                words: [{ jp: "魚", reading: "さかな", en: "fish" }, { jp: "金魚", reading: "きんぎょ", en: "goldfish" }, { jp: "魚屋", reading: "さかなや", en: "fish shop" }, { jp: "焼き魚", reading: "やきざかな", en: "grilled fish" }, { jp: "魚市場", reading: "うおいちば", en: "fish market" }],
                strokes: [
                "M48,13c0.14,1.21-0.07,2.22-0.59,3.32C45.08,21.29,37,30.31,26.25,36",
                "M49,19.13c1.25,0.37,2.35,0.4,3.8,0.24c4.73-0.53,10.95-1.37,14.14-2.13c2.5-0.6,3.69,1.64,2.06,3.51c-4.94,5.7-9.5,11.12-14.25,17.25",
                "M27.49,40.98c1.2,1.2,1.88,2.4,2.11,3.82c0.85,5.2,2.43,14.61,3.41,22.71c0.17,1.36,0.32,2.69,0.47,3.96",
                "M30.27,42.78C45.25,40.62,67,37.75,78.41,37.3c3.85-0.15,5.83,1.46,5.59,3.95c-0.5,5.12-1.85,15.04-3.39,23.73c-0.2,1.15-0.41,2.25-0.61,3.27",
                "M53.75,41.5c1,0.75,1.12,1.88,1.16,2.98C55.13,50.39,55,65.45,55,66.25",
                "M32.47,55.61C43.5,54.38,69.88,52,81.21,51.64",
                "M34.2,69.54c12.92-1.29,30.42-3.04,45.8-3.79",
                "M26.25,81c0,5.25-5.75,13-7.25,14.5",
                "M42.52,79.08c3.15,2.76,6.15,10.84,6.94,15.13",
                "M62.37,77.83c3.15,2.76,8.15,11.34,8.93,15.63",
                "M84.27,78.58c4.16,2.63,10.75,10.8,11.79,14.88"
                ] }
        ];
        return {
            id: "k01", title: "N5 Kanji", subtitle: "103 kanji \u2014 tap a card",
            kanjiGroup: true,
            wordBank: { kanji: kanji },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "What's a kanji?",
                            explain: "Kana (\u3072\u3089\u304c\u306a/\u30ab\u30bf\u30ab\u30ca) spell out sounds; kanji are whole characters borrowed from Chinese that stand for a word or idea on their own. This is the full official N5 list \u2014 103 characters, straight from the N5 Kanji Trace worksheet."
                        },
                        {
                            title: "On\u2019yomi vs Kun\u2019yomi",
                            explain: "Most kanji have two reading types: <strong>On\u2019yomi</strong> (\u97f3\u8aad\u307f), the Chinese-derived reading, usually used when a kanji is paired with another kanji in a compound word; and <strong>Kun\u2019yomi</strong> (\u8a13\u8aad\u307f), the native Japanese reading, usually used when a kanji stands alone or with okurigana (trailing kana)."
                        },
                        {
                            title: "How to read a kanji",
                            explain: "Context decides which reading applies \u2014 a kanji standing alone usually takes its kun\u2019yomi, while one glued to another kanji usually takes its on\u2019yomi (\u65e5 alone is \u3072, \u201cday\u201d; in \u65e5\u672c it's \u306b\u3061, part of \u201cJapan\u201d). It's a pattern you absorb with exposure, not a fixed rule \u2014 and many kanji have more than one of each type."
                        },
                        {
                            title: "What are radicals?",
                            explain: "The building-block components kanji are made of \u2014 often a smaller, simpler character in its own right (\u6c35 water, \u6728 tree, \u4ebb person). Recognizing them makes new kanji easier to guess and remember, since the same radical tends to carry a similar meaning or sound wherever it shows up."
                        }
                    ],
                    vocab: kanji.map(function (k) { return { jp: k.jp, romaji: k.on + " / " + k.kun, en: k.en }; }),
                    sources: ["NihongoSensei", "KanjiVG (stroke data)", "Jisho.org"]
                };
            }
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
        /* Kanji-track lessons carry their name in the title already
           ("N5 Kanji") — numbering it like a shelf ("19. N5 Kanji")
           would just restate the segregation the optgroup below
           already provides. */
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
        if (window.KanjiCards) KanjiCards.destroy();
        highlightActiveLesson(id);
        renderInstruction();

        if (currentLesson.kanjiGroup) {
            /* Card-gallery UI, not a quiz — there's no single "correct
               answer" to grade when browsing kanji, so this skips the
               whole currentExercises/renderExercise machinery entirely
               and hands off to assets/js/kanji-cards.js instead. */
            hide($("studyPractice"));
            hide($("studyComplete"));
            let kanjiWrap = $("kanjiCards");
            show(kanjiWrap);
            if (window.KanjiCards) KanjiCards.render(currentLesson, kanjiWrap);
            if (window.StudyProgress) {
                StudyProgress.completeLesson(id);
                StudyProgress.renderXpBadges();
                refreshLessonPickerLabels();
            }
            return;
        }

        hide($("kanjiCards"));
        currentExercises = currentLesson.vocabOnly
            ? currentLesson.buildMatchExercises()
            : currentLesson.buildWordBankExercises();
        exerciseIndex = 0;
        totalExercises = currentExercises.length;
        completedExercises = 0;
        lessonScore = 0;
        streak = 0;
        bestStreak = 0;
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

        /* The kanji-track lesson's own "vocab" IS its 103-entry kanji
           list and its wordBank.kanji is that same list again — both
           just duplicate the card gallery next to it (see kanji-cards.js)
           and, at 103 rows, dominate the panel for no reason. Skip both
           here; the shelf lessons still get the full vocab table + word
           bank box. */
        if (!currentLesson.kanjiGroup) {
            if (inst.vocab && inst.vocab.length) {
                html += "<h3>Vocabulary</h3>" + buildVocabTable(inst.vocab);
            }
            html += buildWordBankBox(currentLesson.wordBank);
        }

        if (inst.sources && inst.sources.length) {
            html += "<h3>Sources</h3><p class='sources-line'>" + inst.sources.join(" &middot; ") + "</p>";
        }

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
