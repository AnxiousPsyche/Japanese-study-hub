/* STUDY ROOM - Exact 16-shelf sequence from Neko Bunko adventure */
/* Vocabulary from n5-phaser-game.js LESSON_CONTENT per shelf */
(function () {
    "use strict";

    var NAMES = [
        { jp: "\u305F\u306A\u304B", en: "Tanaka" },
        { jp: "\u3055\u3068\u3046", en: "Sato" },
        { jp: "\u3084\u307E\u3060", en: "Yamada" },
        { jp: "\u3059\u305A\u304D", en: "Suzuki" },
        { jp: "\u305F\u3051\u3060", en: "Takeda" },
        { jp: "\u306A\u304B\u3080\u3089", en: "Nakamura" },
        { jp: "\u308F\u305F\u306A\u3079", en: "Watanabe" },
        { jp: "\u3084\u307E\u3082\u3068", en: "Yamamoto" },
        { jp: "\u3044\u3057\u3044", en: "Ishii" },
        { jp: "\u3075\u3058\u3044", en: "Fuji" }
    ];

    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
    function shuffle(a) {
        var b = a.slice();
        for (var i = b.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = b[i]; b[i] = b[j]; b[j] = t;
        }
        return b;
    }
    function uPick(a, n) { return shuffle(a).slice(0, n); }
    function pickD(a, ex) {
        var f = a.filter(function (x) { return (typeof ex === "string" ? x !== ex : x.jp !== ex.jp); });
        return pick(f);
    }
    function norm(s) {
        return s.replace(/\s+/g, "").replace(/[\uFF01-\uFF5E]/g, function (c) {
            return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
        });
    }

    function buildLessons() {
        return [s01(),s02(),s03(),s04(),s05(),s06(),s07(),s08(),
                s09(),s10(),s11(),s12(),s13(),s14(),s15(),s16()];
    }

    /* SHELF 01: Basic Greetings */
    function s01() {
        var ph = [
            { jp: "\u3053\u3093\u306B\u3061\u306F", en: "Hello" },
            { jp: "\u304A\u306F\u3088\u3046\u3054\u3056\u3044\u307E\u3059", en: "Good morning" },
            { jp: "\u3053\u3093\u3070\u3093\u306F", en: "Good evening" },
            { jp: "\u3055\u3088\u3046\u306A\u3089", en: "Goodbye" },
            { jp: "\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059", en: "Thank you" },
            { jp: "\u3059\u307F\u307E\u305B\u3093", en: "Excuse me" }
        ];
        return {
            id: "s01", title: "Basic Greetings", subtitle: "Shelf 01",
            buildInstruction: function () {
                return {
                    grammarTitle: "Essential Greetings",
                    grammarExplain: "These 6 phrases are your survival toolkit. Memorize them and you can handle most everyday social situations.",
                    grammarPattern: "No pattern \u2014 just phrases to memorize!",
                    examples: [
                        { jp: "\u3053\u3093\u306B\u3061\u306F\uFF01", en: "Hello!" },
                        { jp: "\u3053\u3093\u306B\u3061\u306F\uFF01\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\u3002", en: "Hello! Thank you." },
                        { jp: "\u3055\u3088\u3046\u306A\u3089\uFF01", en: "Goodbye!" }
                    ]
                };
            },
            buildExercises: function () {
                return shuffle([
                    { prompt: "Type: <strong>Hello</strong>", words: [ph[0].jp], roles: ["greeting"], accepted: [[ph[0].jp]], hint: "\u3053\u3093\u306B\u3061\u306F" },
                    { prompt: "Type: <strong>Good morning</strong>", words: [ph[1].jp], roles: ["greeting"], accepted: [[ph[1].jp]], hint: "\u304A\u306F\u3088\u3046\u3054\u3056\u3044\u307E\u3059" },
                    { prompt: "Type: <strong>Good evening</strong>", words: [ph[2].jp], roles: ["greeting"], accepted: [[ph[2].jp]], hint: "\u3053\u3093\u3070\u3093\u306F" },
                    { prompt: "Type: <strong>Goodbye</strong>", words: [ph[3].jp], roles: ["greeting"], accepted: [[ph[3].jp]], hint: "\u3055\u3088\u3046\u306A\u3089" },
                    { prompt: "Type: <strong>Thank you</strong>", words: [ph[4].jp], roles: ["greeting"], accepted: [[ph[4].jp]], hint: "\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059" },
                    { prompt: "Type: <strong>Excuse me</strong>", words: [ph[5].jp], roles: ["greeting"], accepted: [[ph[5].jp]], hint: "\u3059\u307F\u307E\u305B\u3093" }
                ]).slice(0, 3);
            }
        };
    }

    /* SHELF 02: Everyday Expressions */
    function s02() {
        var sit = [
            { jp: "\u304A\u5143\u6C17\u3067\u3059\u304B", en: "How are you?" },
            { jp: "\u5143\u6C17\u3067\u3059", en: "I'm doing well" },
            { jp: "\u3044\u305F\u3060\u304D\u307E\u3059", en: "Before eating" },
            { jp: "\u3054\u3061\u305D\u3046\u3055\u307E\u3067\u3057\u305F", en: "After eating" },
            { jp: "\u3044\u3063\u3066\u304D\u307E\u3059", en: "I'm heading out" },
            { jp: "\u305F\u3060\u3044\u307E", en: "I'm home" },
            { jp: "\u304A\u9858\u3044\u3057\u307E\u3059", en: "Please (request)" },
            { jp: "\u304F\u3060\u3055\u3044", en: "Please" },
            { jp: "\u3067\u306F\u3001\u307E\u305F", en: "See you again" },
            { jp: "\u3058\u3083\u3042\u306D", en: "See you (casual)" },
            { jp: "\u304A\u90AA\u9B54\u3057\u307E\u3059", en: "Excuse me for intruding" },
            { jp: "\u3088\u308D\u3057\u304F\u304A\u9858\u3044\u3057\u307E\u3059", en: "Nice to meet you" },
            { jp: "\u306F\u3058\u3081\u307E\u3057\u3066", en: "How do you do" }
        ];
        var fill = [
            { jp: "\u3069\u3046\u3082", en: "Thanks / general" },
            { jp: "\u3069\u3046\u305E", en: "Please (go ahead)" },
            { jp: "\u306F\u3044", en: "Yes" },
            { jp: "\u3048\u3048", en: "Yes (softer)" },
            { jp: "\u3055\u3042", en: "Well..." },
            { jp: "\u305D\u308C\u3067\u306F", en: "Well then" },
            { jp: "\u591A\u5206", en: "Probably" },
            { jp: "\u306A\u308B\u307B\u3069", en: "I see" },
            { jp: "\u3084\u3063\u3071\u308A", en: "As I thought" },
            { jp: "\u5168\u7136", en: "Not at all" }
        ];
        return {
            id: "s02", title: "Everyday Expressions", subtitle: "Shelf 02",
            buildInstruction: function () {
                return {
                    grammarTitle: "Situational Phrases & Fillers",
                    grammarExplain: "Everyday expressions for daily life + filler words that make your Japanese sound natural.",
                    grammarPattern: "Phrases to memorize \u2014 no grammar pattern yet!",
                    examples: [
                        { jp: "\u304A\u5143\u6C17\u3067\u3059\u304B\uFF1F", en: "How are you?" },
                        { jp: "\u5143\u6C17\u3067\u3059\uFF01\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\u3002", en: "I'm doing well! Thank you." },
                        { jp: "\u3058\u3083\u3042\u306D\uFF01", en: "See you!" }
                    ]
                };
            },
            buildExercises: function () {
                var pool = uPick(sit, 2).concat(uPick(fill, 1));
                return shuffle(pool).map(function (w) {
                    return {
                        prompt: "Type: <strong>" + w.en + "</strong>",
                        words: [w.jp], roles: ["phrase"],
                        accepted: [[w.jp]], hint: w.jp
                    };
                });
            }
        };
    }

    /* SHELF 03: A wa B desu */
    function s03() {
        var nm = uPick(NAMES, 2);
        return {
            id: "s03", title: "A \u306F B \u3067\u3059", subtitle: "Shelf 03",
            buildInstruction: function () {
                return {
                    grammarTitle: "A \u306F B \u3067\u3059",
                    grammarExplain: "Use \u306F to mark the topic and \u3067\u3059 to make it polite. The most basic Japanese sentence: 'A is B'.",
                    grammarPattern: '<span class="pattern-box__slot">Topic</span> <span class="pattern-box__fixed">\u306F</span> <span class="pattern-box__slot">Predicate</span> <span class="pattern-box__fixed">\u3067\u3059</span>',
                    examples: [
                        { jp: "\u308F\u305F\u3057\u306F\u304C\u304F\u305B\u3044\u3067\u3059", en: "I am a student." },
                        { jp: "\u3053\u308C\u306F\u307B\u3093\u3067\u3059", en: "This is a book." },
                        { jp: "\u3053\u308C\u306F\u30DA\u30F3\u3067\u3059", en: "This is a pen." }
                    ]
                };
            },
            buildExercises: function () {
                return [
                    { prompt: "Write: <strong>I am a student</strong>", words: ["\u308F\u305F\u3057", "\u306F", "\u304C\u304F\u305B\u3044", "\u3067\u3059"], roles: ["subject", "particle", "predicate", "auxiliary"], accepted: [["\u308F\u305F\u3057", "\u306F", "\u304C\u304F\u305B\u3044", "\u3067\u3059"]], hint: "\u308F\u305F\u3057 + \u306F + \u304C\u304F\u305B\u3044 + \u3067\u3059" },
                    { prompt: "Write: <strong>This is a book</strong>", words: ["\u3053\u308C", "\u306F", "\u307B\u3093", "\u3067\u3059"], roles: ["subject", "particle", "predicate", "auxiliary"], accepted: [["\u3053\u308C", "\u306F", "\u307B\u3093", "\u3067\u3059"]], hint: "\u3053\u308C + \u306F + \u307B\u3093 + \u3067\u3059" },
                    { prompt: "Write: <strong>" + nm[0].en + " is a teacher</strong>", words: [nm[0].jp, "\u306F", "\u305B\u3093\u305B\u3044", "\u3067\u3059"], roles: ["subject", "particle", "predicate", "auxiliary"], accepted: [[nm[0].jp, "\u306F", "\u305B\u3093\u305B\u3044", "\u3067\u3059"]], hint: "Name + \u306F + \u305B\u3093\u305B\u3044 + \u3067\u3059" },
                    { prompt: "Write: <strong>This is a pen</strong>", words: ["\u3053\u308C", "\u306F", "\u30DA\u30F3", "\u3067\u3059"], roles: ["subject", "particle", "predicate", "auxiliary"], accepted: [["\u3053\u308C", "\u306F", "\u30DA\u30F3", "\u3067\u3059"]], hint: "\u3053\u308C + \u306F + \u30DA\u30F3 + \u3067\u3059" }
                ];
            }
        };
    }

    /* SHELF 04: Self Introduction */
    function s04() {
        var nm = pick(NAMES);
        return {
            id: "s04", title: "Self Introduction", subtitle: "Shelf 04",
            buildInstruction: function () {
                return {
                    grammarTitle: "\u3058\u3053\u3057\u3087\u304F\u304B\u3044 (Self-Intro)",
                    grammarExplain: "The 3-step self-introduction template: greet \u2192 state your name \u2192 close politely. Also introduces \u306A\u3093 (what) and \u304B (question marker).",
                    grammarPattern: '<span class="pattern-box__fixed">\u306F\u3058\u3081\u307E\u3057\u3066</span> \u2192 <span class="pattern-box__slot">\u308F\u305F\u3057\u306F [name] \u3067\u3059</span> \u2192 <span class="pattern-box__fixed">\u3088\u308D\u3057\u304F\u304A\u9858\u3044\u3057\u307E\u3059</span>',
                    examples: [
                        { jp: "\u306F\u3058\u3081\u307E\u3057\u3066\u3002\u304A\u540D\u524D\u306F\u306A\u3093\u3067\u3059\u304B\u3002", en: "Nice to meet you. What is your name?" },
                        { jp: "\u308F\u305F\u3057\u306F" + nm.jp + "\u3067\u3059\u3002", en: "I am " + nm.en + "." },
                        { jp: nm.jp + "\u3055\u3093\u3001\u3088\u308D\u3057\u304F\u304A\u9858\u3044\u3057\u307E\u3059\uFF01", en: "Nice to meet you, " + nm.en + "-san!" }
                    ]
                };
            },
            buildExercises: function () {
                return [
                    { prompt: "Write: <strong>I am " + nm.en + "</strong>", words: ["\u308F\u305F\u3057", "\u306F", nm.jp, "\u3067\u3059"], roles: ["subject", "particle", "name", "auxiliary"], accepted: [["\u308F\u305F\u3057", "\u306F", nm.jp, "\u3067\u3059"]], hint: "\u308F\u305F\u3057\u306F + name + \u3067\u3059" },
                    { prompt: "Write: <strong>What is your name?</strong>", words: ["\u304A\u540D\u524D", "\u306F", "\u306A\u3093", "\u3067\u3059\u304B"], roles: ["noun", "particle", "question", "auxiliary"], accepted: [["\u304A\u540D\u524D", "\u306F", "\u306A\u3093", "\u3067\u3059\u304B"]], hint: "\u304A\u540D\u524D\u306F\u306A\u3093\u3067\u3059\u304B" },
                    { prompt: "Write: <strong>Nice to meet you</strong>", words: ["\u306F\u3058\u3081\u307E\u3057\u3066"], roles: ["greeting"], accepted: [["\u306F\u3058\u3081\u307E\u3057\u3066"]], hint: "\u306F\u3058\u3081\u307E\u3057\u3066" }
                ];
            }
        };
    }

    /* SHELF 05: Demonstratives */
    function s05() {
        return {
            id: "s05", title: "Demonstratives", subtitle: "Shelf 05",
            buildInstruction: function () {
                return {
                    grammarTitle: "\u3053\u305D\u3042\u3069 System",
                    grammarExplain: "Distance-based system: \u3053 (near me) \u305D (near you) \u3042 (far from both) \u3069 (which?). Three types: standalone, +noun, place.",
                    grammarPattern: '<span class="pattern-box__slot">This/That</span> <span class="pattern-box__fixed">\u306F</span> <span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">\u3067\u3059</span>',
                    examples: [
                        { jp: "\u3053\u308C\u306F\u307B\u3093\u3067\u3059", en: "This is a book." },
                        { jp: "\u305D\u308C\u306F\u30DA\u30F3\u3067\u3059", en: "That (by you) is a pen." },
                        { jp: "\u3042\u308C\u306F\u307B\u3093\u3067\u3059", en: "That over there is a book." },
                        { jp: "\u306D\u3053\u306F\u3068\u3053\u3067\u3059\u304B", en: "Where is the cat?" }
                    ]
                };
            },
            buildExercises: function () {
                return [
                    { prompt: "Write: <strong>This is a book</strong>", words: ["\u3053\u308C", "\u306F", "\u307B\u3093", "\u3067\u3059"], roles: ["demonstrative", "particle", "predicate", "auxiliary"], accepted: [["\u3053\u308C", "\u306F", "\u307B\u3093", "\u3067\u3059"]], hint: "\u3053\u308C + \u306F + noun + \u3067\u3059" },
                    { prompt: "Write: <strong>That (near you) is a pen</strong>", words: ["\u305D\u308C", "\u306F", "\u30DA\u30F3", "\u3067\u3059"], roles: ["demonstrative", "particle", "predicate", "auxiliary"], accepted: [["\u305D\u308C", "\u306F", "\u30DA\u30F3", "\u3067\u3059"]], hint: "\u305D\u308C + \u306F + \u30DA\u30F3 + \u3067\u3059" },
                    { prompt: "Write: <strong>That book (over there)</strong>", words: ["\u3042\u306E", "\u307B\u3093"], roles: ["demonstrative", "object"], accepted: [["\u3042\u306E", "\u307B\u3093"]], hint: "\u3042\u306E + noun" },
                    { prompt: "Write: <strong>Where is the cat?</strong>", words: ["\u306D\u3053", "\u306F", "\u3068\u3053", "\u3067\u3059\u304B"], roles: ["noun", "particle", "question", "auxiliary"], accepted: [["\u306D\u3053", "\u306F", "\u3068\u3053", "\u3067\u3059\u304B"]], hint: "\u306D\u3053\u306F + \u3068\u3053 + \u3067\u3059\u304B" },
                    { prompt: "Write: <strong>This pen is mine</strong>", words: ["\u3053\u306E", "\u30DA\u30F3", "\u306F", "\u308F\u305F\u3057", "\u306E", "\u3067\u3059"], roles: ["demonstrative", "object", "particle", "subject", "particle", "auxiliary"], accepted: [["\u3053\u306E", "\u30DA\u30F3", "\u306F", "\u308F\u305F\u3057", "\u306E", "\u3067\u3059"]], hint: "Kono pen wa watashi no desu" }
                ];
            }
        };
    }

    /* SHELF 06: Questions */
    function s06() {
        return {
            id: "s06", title: "Questions (\u304B)", subtitle: "Shelf 06",
            buildInstruction: function () {
                return {
                    grammarTitle: "Statement + \u304B\uFF1F",
                    grammarExplain: "Add \u304B at the end to turn any statement into a question. Also introduces question words: \u3060\u308C (who), \u3044\u3064 (when), \u306A\u306B (what), \u3044\u304F\u3064 (how many), \u3044\u304F\u3089 (how much).",
                    grammarPattern: '<span class="pattern-box__slot">Statement</span> <span class="pattern-box__fixed">\u304B</span>',
                    examples: [
                        { jp: "\u305B\u3093\u305B\u3044\u306F\u3060\u308C\u3067\u3059\u304B\uFF1F", en: "Who is the teacher?" },
                        { jp: "\u305F\u3093\u3058\u3087\u3046\u3073\u306F\u3044\u3064\u3067\u3059\u304B\uFF1F", en: "When is your birthday?" },
                        { jp: "\u3053\u308C\u306F\u3044\u304F\u3089\u3067\u3059\u304B\uFF1F", en: "How much is this?" }
                    ]
                };
            },
            buildExercises: function () {
                return [
                    { prompt: "Write: <strong>Who is the teacher?</strong>", words: ["\u305B\u3093\u305B\u3044", "\u306F", "\u3060\u308C", "\u3067\u3059\u304B"], roles: ["noun", "particle", "question", "auxiliary"], accepted: [["\u305B\u3093\u305B\u3044", "\u306F", "\u3060\u308C", "\u3067\u3059\u304B"]], hint: "Sensei wa dare desu ka" },
                    { prompt: "Write: <strong>Is this a book?</strong>", words: ["\u3053\u308C", "\u306F", "\u307B\u3093", "\u3067\u3059\u304B"], roles: ["subject", "particle", "predicate", "auxiliary"], accepted: [["\u3053\u308C", "\u306F", "\u307B\u3093", "\u3067\u3059\u304B"]], hint: "Statement + \u304B" },
                    { prompt: "Write: <strong>How much is this?</strong>", words: ["\u3053\u308C", "\u306F", "\u3044\u304F\u3089", "\u3067\u3059\u304B"], roles: ["subject", "particle", "question", "auxiliary"], accepted: [["\u3053\u308C", "\u306F", "\u3044\u304F\u3089", "\u3067\u3059\u304B"]], hint: "Kore wa ikura desu ka" },
                    { prompt: "Write: <strong>When is your birthday?</strong>", words: ["\u305F\u3093\u3058\u3087\u3046\u3073", "\u306F", "\u3044\u3064", "\u3067\u3059\u304B"], roles: ["noun", "particle", "question", "auxiliary"], accepted: [["\u305F\u3093\u3058\u3087\u3046\u3073", "\u306F", "\u3044\u3064", "\u3067\u3059\u304B"]], hint: "Tanjoubi wa itsu desu ka" }
                ];
            }
        };
    }

    /* SHELF 07: Numbers & Counters */
    function s07() {
        return {
            id: "s07", title: "Numbers & Counters", subtitle: "Shelf 07",
            buildInstruction: function () {
                return {
                    grammarTitle: "Counting Things, Animals & Time",
                    grammarExplain: "Numbers 1-10 + counters: \u3064 (general things), \u5339 (small animals), \u6642 (hours), \u5206 (minutes). Sound shifts happen with some counters.",
                    grammarPattern: '<span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">\u306F</span> <span class="pattern-box__slot">Number + Counter</span> <span class="pattern-box__fixed">\u3067\u3059</span>',
                    examples: [
                        { jp: "\u308A\u3093\u3054\u306F\u3072\u3068\u3064\u3067\u3059", en: "There is one apple." },
                        { jp: "\u306D\u3053\u306F\u3055\u3093\u3073\u304D\u3067\u3059", en: "There are three cats." },
                        { jp: "\u3044\u307E\u306F\u3088\u3058\u3067\u3059", en: "It's 4 o'clock now." }
                    ]
                };
            },
            buildExercises: function () {
                var nums = [
                    { jp: "\u3072\u3068\u3064", en: "one (thing)" },
                    { jp: "\u3075\u305F\u3064", en: "two (things)" },
                    { jp: "\u307F\u3063\u3064", en: "three (things)" },
                    { jp: "\u3044\u3063\u3071\u304D", en: "one (animal)" },
                    { jp: "\u3055\u3093\u3073\u304D", en: "three (animals)" },
                    { jp: "\u3058\u3085\u3063\u3074\u304D", en: "ten (animals)" }
                ];
                var times = [
                    { jp: "\u306B\u3058", en: "2 o'clock" },
                    { jp: "\u3088\u3058", en: "4 o'clock" },
                    { jp: "\u304F\u3058", en: "9 o'clock" }
                ];
                return [
                    { prompt: "Write: <strong>There is one apple (\u308A\u3093\u3054)</strong>", words: ["\u308A\u3093\u3054", "\u306F", "\u3072\u3068\u3064", "\u3067\u3059"], roles: ["noun", "particle", "counter", "auxiliary"], accepted: [["\u308A\u3093\u3054", "\u306F", "\u3072\u3068\u3064", "\u3067\u3059"]], hint: "Ringo wa hitotsu desu" },
                    { prompt: "Write: <strong>There are three cats (\u306D\u3053)</strong>", words: ["\u306D\u3053", "\u306F", "\u3055\u3093\u3073\u304D", "\u3067\u3059"], roles: ["noun", "particle", "counter", "auxiliary"], accepted: [["\u306D\u3053", "\u306F", "\u3055\u3093\u3073\u304D", "\u3067\u3059"]], hint: "Neko wa sanbiki desu" },
                    { prompt: "Write: <strong>It's 4 o'clock now (\u3044\u307E)</strong>", words: ["\u3044\u307E", "\u306F", "\u3088\u3058", "\u3067\u3059"], roles: ["time", "particle", "counter", "auxiliary"], accepted: [["\u3044\u307E", "\u306F", "\u3088\u3058", "\u3067\u3059"]], hint: "Ima wa yoji desu" }
                ];
            }
        };
    }

    /* SHELF 08: Places and Directions */
    function s08() {
        return {
            id: "s08", title: "Places & Directions", subtitle: "Shelf 08",
            buildInstruction: function () {
                return {
                    grammarTitle: "There is/are \u2014 \u3042\u308A\u307E\u3059 / \u3044\u307E\u3059",
                    grammarExplain: "\u3042\u308A\u307E\u3059 for things. \u3044\u307E\u3059 for living things (people/animals). Location marked by \u306B.",
                    grammarPattern: '<span class="pattern-box__slot">Thing</span> <span class="pattern-box__fixed">\u306F</span> <span class="pattern-box__slot">Place</span> <span class="pattern-box__fixed">\u306B \u3042\u308A\u307E\u3059/\u3044\u307E\u3059</span>',
                    examples: [
                        { jp: "\u3068\u3057\u3087\u304B\u3093\u306F\u304C\u3063\u3053\u3046\u306E\u3061\u304B\u304F\u306B\u3042\u308A\u307E\u3059", en: "The library is near the school." },
                        { jp: "\u306D\u3053\u306F\u3048\u304D\u306E\u3061\u304B\u304F\u306B\u3044\u307E\u3059", en: "The cat is near the station." }
                    ]
                };
            },
            buildExercises: function () {
                return [
                    { prompt: "Write: <strong>The library is near the school</strong>", words: ["\u3068\u3057\u3087\u304B\u3093", "\u306F", "\u304C\u3063\u3053\u3046", "\u306E", "\u3061\u304B\u304F", "\u306B", "\u3042\u308A\u307E\u3059"], roles: ["subject", "particle", "noun", "particle", "direction", "particle", "verb"], accepted: [["\u3068\u3057\u3087\u304B\u3093", "\u306F", "\u304C\u3063\u3053\u3046", "\u306E", "\u3061\u304B\u304F", "\u306B", "\u3042\u308A\u307E\u3059"]], hint: "Toshokan wa gakkou no chikaku ni arimasu" },
                    { prompt: "Write: <strong>The cat is under the tree</strong>", words: ["\u306D\u3053", "\u306F", "\u304D", "\u306E", "\u3057\u305F", "\u306B", "\u3044\u307E\u3059"], roles: ["subject", "particle", "noun", "particle", "direction", "particle", "verb"], accepted: [["\u306D\u3053", "\u306F", "\u304D", "\u306E", "\u3057\u305F", "\u306B", "\u3044\u307E\u3059"]], hint: "Neko wa ki no shita ni imasu" },
                    { prompt: "Write: <strong>The restaurant is next to the park</strong>", words: ["\u30EC\u30B9\u30C8\u30E9\u30F3", "\u306F", "\u3053\u3046\u3048\u3093", "\u306E", "\u3068\u306A\u308A", "\u306B", "\u3042\u308A\u307E\u3059"], roles: ["subject", "particle", "noun", "particle", "direction", "particle", "verb"], accepted: [["\u30EC\u30B9\u30C8\u30E9\u30F3", "\u306F", "\u3053\u3046\u3048\u3093", "\u306E", "\u3068\u306A\u308A", "\u306B", "\u3042\u308A\u307E\u3059"]], hint: "Resutoran wa kouen no tonari ni arimasu" }
                ];
            }
        };
    }

    /* SHELF 09: Nouns & Pronouns */
    function s09() {
        return {
            id: "s09", title: "Nouns & Pronouns", subtitle: "Shelf 09",
            buildInstruction: function () {
                return {
                    grammarTitle: "Pronouns & \u306E Possessive",
                    grammarExplain: "Personal pronouns (\u308F\u305F\u3057, \u3042\u306A\u305F, \u307C\u304F, etc.) + \u306E for possession ('s / mine). Also: \u3053\u3093\u306A/\u305D\u3093\u306A/\u3042\u3093\u306A/\u3069\u3093\u306A (this/that/what kind of).",
                    grammarPattern: '<span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">\u306E</span> <span class="pattern-box__slot">Noun</span>',
                    examples: [
                        { jp: "\u3042\u306E\u3072\u3068\u306F\u308F\u305F\u3057\u306E\u3068\u3082\u3060\u3061\u3067\u3059", en: "That person is my friend." },
                        { jp: "\u3053\u308C\u306F\u308F\u305F\u3057\u306E\u307B\u3093\u3067\u3059", en: "This is my book." },
                        { jp: "\u3069\u3093\u306A\u3072\u3068\u3067\u3059\u304B", en: "What kind of person?" }
                    ]
                };
            },
            buildExercises: function () {
                var nm = pick(NAMES);
                return [
                    { prompt: "Write: <strong>That person is my friend</strong>", words: ["\u3042\u306E", "\u3072\u3068", "\u306F", "\u308F\u305F\u3057", "\u306E", "\u3068\u3082\u3060\u3061", "\u3067\u3059"], roles: ["demonstrative", "noun", "particle", "subject", "particle", "predicate", "auxiliary"], accepted: [["\u3042\u306E", "\u3072\u3068", "\u306F", "\u308F\u305F\u3057", "\u306E", "\u3068\u3082\u3060\u3061", "\u3067\u3059"]], hint: "Ano hito wa watashi no tomodachi desu" },
                    { prompt: "Write: <strong>This is my book</strong>", words: ["\u3053\u308C", "\u306F", "\u308F\u305F\u3057", "\u306E", "\u307B\u3093", "\u3067\u3059"], roles: ["subject", "particle", "subject", "particle", "predicate", "auxiliary"], accepted: [["\u3053\u308C", "\u306F", "\u308F\u305F\u3057", "\u306E", "\u307B\u3093", "\u3067\u3059"]], hint: "Kore wa watashi no hon desu" },
                    { prompt: "Write: <strong>" + nm.en + " is a friend</strong>", words: [nm.jp, "\u306F", "\u3068\u3082\u3060\u3061", "\u3067\u3059"], roles: ["subject", "particle", "predicate", "auxiliary"], accepted: [[nm.jp, "\u306F", "\u3068\u3082\u3060\u3061", "\u3067\u3059"]], hint: "Name + \u306F + \u3068\u3082\u3060\u3061 + \u3067\u3059" }
                ];
            }
        };
    }

    /* SHELF 10: Adjectives */
    function s10() {
        var iAdj = pick([
            { jp: "\u304A\u304A\u304D\u3044", en: "big" },
            { jp: "\u3061\u3044\u3055\u3044", en: "small" },
            { jp: "\u3042\u305F\u3089\u3057\u3044", en: "new" },
            { jp: "\u3075\u308B\u3044", en: "old" },
            { jp: "\u305F\u304B\u3044", en: "expensive" },
            { jp: "\u305F\u306E\u3057\u3044", en: "fun" }
        ]);
        var naAdj = pick([
            { jp: "\u3057\u305A\u304B", en: "quiet" },
            { jp: "\u3059\u304D", en: "like" },
            { jp: "\u3052\u3093\u304D", en: "healthy" },
            { jp: "\u304F\u308C\u3044", en: "beautiful" },
            { jp: "\u3086\u3046\u3081\u3044", en: "famous" }
        ]);
        return {
            id: "s10", title: "Adjectives", subtitle: "Shelf 10",
            buildInstruction: function () {
                return {
                    grammarTitle: "\u3044 / \u306A Adjectives",
                    grammarExplain: "\u3044-adjectives: drop \u3044, add \u304F\u306A\u3044\u3067\u3059 (neg) or \u304B\u3063\u305F (past). \u306A-adjectives: add \u3058\u3083\u306A\u3044\u3067\u3059 (neg) or \u3067\u3057\u305F (past).",
                    grammarPattern: '<span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">\u306F</span> <span class="pattern-box__slot">Adjective</span> <span class="pattern-box__fixed">\u3067\u3059</span>',
                    examples: [
                        { jp: "\u307B\u3093\u306F\u304A\u304A\u304D\u3044\u3067\u3059", en: "The book is big." },
                        { jp: "\u3068\u3057\u3087\u304B\u3093\u306F\u3057\u305A\u304B\u3067\u3059", en: "The library is quiet." },
                        { jp: "\u3053\u306E\u307B\u3093\u306F\u5C0F\u3055\u304F\u306A\u3044\u3067\u3059", en: "This book is not small." }
                    ]
                };
            },
            buildExercises: function () {
                return [
                    { prompt: "Write: <strong>The book is " + iAdj.en + "</strong>", words: ["\u307B\u3093", "\u306F", iAdj.jp, "\u3067\u3059"], roles: ["subject", "particle", "adjective", "auxiliary"], accepted: [["\u307B\u3093", "\u306F", iAdj.jp, "\u3067\u3059"]], hint: "Hon wa " + iAdj.jp + " desu" },
                    { prompt: "Write: <strong>The library is " + naAdj.en + "</strong>", words: ["\u3068\u3057\u3087\u304B\u3093", "\u306F", naAdj.jp, "\u3067\u3059"], roles: ["subject", "particle", "adjective", "auxiliary"], accepted: [["\u3068\u3057\u3087\u304B\u3093", "\u306F", naAdj.jp, "\u3067\u3059"]], hint: "Toshokan wa " + naAdj.jp + " desu" },
                    { prompt: "Write: <strong>This book is not small</strong>", words: ["\u3053\u306E", "\u307B\u3093", "\u306F", "\u5C0F\u3055\u304F\u306A\u3044", "\u3067\u3059"], roles: ["demonstrative", "noun", "particle", "adjective", "auxiliary"], accepted: [["\u3053\u306E", "\u307B\u3093", "\u306F", "\u5C0F\u3055\u304F\u306A\u3044", "\u3067\u3059"]], hint: "Kono hon wa chiisakunai desu" }
                ];
            }
        };
    }

    /* SHELF 11: Verbs */
    function s11() {
        var v = pick([
            { dict: "\u98DF\u3079\u308B", masu: "\u98DF\u3079\u307E\u3059", en: "eat" },
            { dict: "\u884C\u304F", masu: "\u884C\u304D\u307E\u3059", en: "go" },
            { dict: "\u8A71\u3059", masu: "\u8A71\u3057\u307E\u3059", en: "speak" },
            { dict: "\u8AAD\u3080", masu: "\u8AAD\u307F\u307E\u3059", en: "read" },
            { dict: "\u8CB7\u3046", masu: "\u8CB7\u3044\u307E\u3059", en: "buy" },
            { dict: "\u66F4\u304D\u308B", masu: "\u66F4\u304D\u307E\u3059", en: "wake up" },
            { dict: "\u6B4C\u3046", masu: "\u6B4C\u3044\u307E\u3059", en: "sing" },
            { dict: "\u5209\u304F", masu: "\u66F4\u304D\u307E\u3059", en: "write" }
        ]);
        return {
            id: "s11", title: "Verbs", subtitle: "Shelf 11",
            buildInstruction: function () {
                return {
                    grammarTitle: "Verb + \u307E\u3059 (Polite Form)",
                    grammarExplain: "Ichidan (\u308B-verbs): drop \u308B, add \u307E\u3059. Godan: swap final u-sound for i-sound + \u307E\u3059. Object marked by \u3092.",
                    grammarPattern: '<span class="pattern-box__slot">Object</span> <span class="pattern-box__fixed">\u3092</span> <span class="pattern-box__slot">Verb</span> <span class="pattern-box__fixed">\u307E\u3059</span>',
                    examples: [
                        { jp: "\u672C\u3092\u8AAD\u307F\u307E\u3059", en: "I read a book." },
                        { jp: "\u5B66\u6821\u306B\u884C\u304D\u307E\u3059", en: "I go to school." },
                        { jp: "\u53CB\u9054\u3068\u8A71\u3057\u307E\u3059", en: "I speak with a friend." }
                    ]
                };
            },
            buildExercises: function () {
                return [
                    { prompt: "Write: <strong>I read a book</strong>", words: ["\u308F\u305F\u3057", "\u306F", "\u672C", "\u3092", "\u8AAD\u307F\u307E\u3059"], roles: ["subject", "particle", "object", "particle", "verb"], accepted: [["\u308F\u305F\u3057", "\u306F", "\u672C", "\u3092", "\u8AAD\u307F\u307E\u3059"]], hint: "Watashi wa hon wo yomimasu" },
                    { prompt: "Write: <strong>I go to school</strong>", words: ["\u308F\u305F\u3057", "\u306F", "\u5B66\u6821", "\u306B", "\u884C\u304D\u307E\u3059"], roles: ["subject", "particle", "place", "particle", "verb"], accepted: [["\u308F\u305F\u3057", "\u306F", "\u5B66\u6821", "\u306B", "\u884C\u304D\u307E\u3059"]], hint: "Watashi wa gakkou ni ikimasu" },
                    { prompt: "Write: <strong>I buy a bag</strong>", words: ["\u304B\u3070\u3093", "\u3092", "\u8CB7\u3044\u307E\u3059"], roles: ["object", "particle", "verb"], accepted: [["\u304B\u3070\u3093", "\u3092", "\u8CB7\u3044\u307E\u3059"]], hint: "Kaban wo kaimasu" }
                ];
            }
        };
    }

    /* SHELF 12: Volitional & Invitations */
    function s12() {
        return {
            id: "s12", title: "Invitations", subtitle: "Shelf 12",
            buildInstruction: function () {
                return {
                    grammarTitle: "\u307E\u3057\u3087\u3046 / \u307E\u305B\u3093\u304B",
                    grammarExplain: "\u307E\u3057\u3087\u3046 = 'Let's...' (confident). \u307E\u305B\u3093\u304B = 'Won't you...?' (softer invitation). \u3067 marks WHERE an action happens.",
                    grammarPattern: '<span class="pattern-box__slot">Verb</span> <span class="pattern-box__fixed">\u307E\u3057\u3087\u3046</span> / <span class="pattern-box__slot">Verb</span> <span class="pattern-box__fixed">\u307E\u305B\u3093\u304B</span>',
                    examples: [
                        { jp: "\u56F3\u66F8\u9928\u306B\u884C\u304D\u307E\u3057\u3087\u3046", en: "Let's go to the library." },
                        { jp: "\u4E00\u7DDA\u306B\u98DF\u3079\u307E\u305B\u3093\u304B", en: "Won't you eat together?" },
                        { jp: "\u516C\u5712\u3067\u904A\u3073\u307E\u305B\u3093\u304B", en: "Won't you play at the park?" }
                    ]
                };
            },
            buildExercises: function () {
                return [
                    { prompt: "Write: <strong>Let's go to the library</strong>", words: ["\u56F3\u66F8\u9928", "\u306B", "\u884C\u304D\u307E\u3057\u3087\u3046"], roles: ["place", "particle", "verb"], accepted: [["\u56F3\u66F8\u9928", "\u306B", "\u884C\u304D\u307E\u3057\u3087\u3046"]], hint: "Toshokan ni ikimashou" },
                    { prompt: "Write: <strong>Let's rest a little</strong>", words: ["\u5C11\u3057", "\u4F11\u307F\u307E\u3057\u3087\u3046"], roles: ["adverb", "verb"], accepted: [["\u5C11\u3057", "\u4F11\u307F\u307E\u3057\u3087\u3046"]], hint: "Sukoshi yasumimashou" },
                    { prompt: "Write: <strong>Won't you play at the park?</strong>", words: ["\u516C\u5712", "\u3067", "\u904A\u3073\u307E\u305B\u3093\u304B"], roles: ["place", "particle", "verb"], accepted: [["\u516C\u5712", "\u3067", "\u904A\u3073\u307E\u305B\u3093\u304B"]], hint: "Kouen de asobimasenka" }
                ];
            }
        };
    }

    /* SHELF 13: Conjugations (te-form) */
    function s13() {
        var v = pick([
            { dict: "\u98DF\u3079\u308B", te: "\u98DF\u3079\u3066", en: "eat" },
            { dict: "\u884C\u304F", te: "\u884C\u3063\u3066", en: "go (exception!)" },
            { dict: "\u8A71\u3059", te: "\u8A71\u3057\u3066", en: "speak" },
            { dict: "\u8AAD\u3080", te: "\u8AAD\u3093\u3067", en: "read" },
            { dict: "\u8CB7\u3046", te: "\u8CB7\u3063\u3066", en: "buy" },
            { dict: "\u66F4\u304D\u308B", te: "\u66F4\u304D\u3066", en: "wake up" },
            { dict: "\u6B4C\u3046", te: "\u6B4C\u3063\u3066", en: "sing" },
            { dict: "\u66F4\u304F", te: "\u66F4\u3044\u3066", en: "write" }
        ]);
        return {
            id: "s13", title: "Conjugations", subtitle: "Shelf 13",
            buildInstruction: function () {
                return {
                    grammarTitle: "\u3066-form + \u304F\u3060\u3055\u3044",
                    grammarExplain: "\u3066-form rules: \u3046/\u308B/\u3064\u2192\u3063\u3066, \u3076/\u3080/\u306C\u2192\u3093\u3067, \u304F\u2192\u3044\u3066, \u3059\u2192\u3057\u3066. Add \u304F\u3060\u3055\u3044 for 'please do'.",
                    grammarPattern: '<span class="pattern-box__slot">Verb \u3066 form</span> <span class="pattern-box__fixed">\u304F\u3060\u3055\u3044</span>',
                    examples: [
                        { jp: "\u66F4\u3044\u3066\u304F\u3060\u3055\u3044", en: "Please write." },
                        { jp: "\u5EA7\u3063\u3066\u304F\u3060\u3055\u3044", en: "Please sit." },
                        { jp: "\u66F4\u304D\u3066\u98DF\u3079\u307E\u3059", en: "I wake up and eat." }
                    ]
                };
            },
            buildExercises: function () {
                return [
                    { prompt: "Write: <strong>Please " + v.en + "</strong>", words: [v.te + "\u304F\u3060\u3055\u3044"], roles: ["verb"], accepted: [[v.te + "\u304F\u3060\u3055\u3044"]], hint: v.te + "\u304F\u3060\u3055\u3044" },
                    { prompt: "Write: <strong>Please write</strong>", words: ["\u66F4\u3044\u3066\u304F\u3060\u3055\u3044"], roles: ["verb"], accepted: [["\u66F4\u3044\u3066\u304F\u3060\u3055\u3044"]], hint: "\u304B\u3044\u3066\u304F\u3060\u3055\u3044" },
                    { prompt: "Write: <strong>Please sit</strong>", words: ["\u5EA7\u3063\u3066\u304F\u3060\u3055\u3044"], roles: ["verb"], accepted: [["\u5EA7\u3063\u3066\u304F\u3060\u3055\u3044"]], hint: "\u3059\u308F\u3063\u3066\u304F\u3060\u3055\u3044" }
                ];
            }
        };
    }

    /* SHELF 14: Past & Negative Tense */
    function s14() {
        var v = pick([
            { masu: "\u8AAD\u307F\u307E\u3059", neg: "\u8AAD\u307F\u307E\u305B\u3093", past: "\u8AAD\u307F\u307E\u3057\u305F", en: "read" },
            { masu: "\u98DF\u3079\u307E\u3059", neg: "\u98DF\u3079\u307E\u305B\u3093", past: "\u98DF\u3079\u307E\u3057\u305F", en: "eat" },
            { masu: "\u884C\u304D\u307E\u3059", neg: "\u884C\u304D\u307E\u305B\u3093", past: "\u884C\u304D\u307E\u3057\u305F", en: "go" },
            { masu: "\u8A71\u3057\u307E\u3059", neg: "\u8A71\u3057\u307E\u305B\u3093", past: "\u8A71\u3057\u307E\u3057\u305F", en: "speak" }
        ]);
        return {
            id: "s14", title: "Past & Negative", subtitle: "Shelf 14",
            buildInstruction: function () {
                return {
                    grammarTitle: "\u307E\u305B\u3093 / \u307E\u3057\u305F",
                    grammarExplain: "Present neg: drop \u307E\u3059 \u2192 \u307E\u305B\u3093. Past: swap \u307E\u3059 \u2192 \u307E\u3057\u305F. Past neg: \u307E\u305B\u3093\u3067\u3057\u305F. No conjugation changes based on verb group!",
                    grammarPattern: '<span class="pattern-box__slot">Verb stem</span> <span class="pattern-box__fixed">\u307E\u305B\u3093/\u307E\u3057\u305F/\u307E\u305B\u3093\u3067\u3057\u305F</span>',
                    examples: [
                        { jp: "\u672C\u3092\u8AAD\u307F\u307E\u305B\u3093", en: "I don't read books." },
                        { jp: "\u53CB\u9054\u306B\u4F1A\u3044\u307E\u3057\u305F", en: "I met a friend." },
                        { jp: "\u4ECA\u65E5\u5BFE\u54E5\u306E\u4F5C\u696D\u3057\u307E\u305B\u3093\u3067\u3057\u305F", en: "I didn't work today." }
                    ]
                };
            },
            buildExercises: function () {
                return [
                    { prompt: "Write: <strong>I don't " + v.en + "</strong>", words: ["\u308F\u305F\u3057", "\u306F", v.neg], roles: ["subject", "particle", "verb"], accepted: [["\u308F\u305F\u3057", "\u306F", v.neg]], hint: "Watashi wa " + v.neg },
                    { prompt: "Write: <strong>I " + v.en + " (past)</strong>", words: ["\u308F\u305F\u3057", "\u306F", v.past], roles: ["subject", "particle", "verb"], accepted: [["\u308F\u305F\u3057", "\u306F", v.past]], hint: "Watashi wa " + v.past },
                    { prompt: "Write: <strong>I met a friend (past)</strong>", words: ["\u53CB\u9054", "\u306B", "\u4F1A\u3044\u307E\u3057\u305F"], roles: ["noun", "particle", "verb"], accepted: [["\u53CB\u9054", "\u306B", "\u4F1A\u3044\u307E\u3057\u305F"]], hint: "Tomodachi ni aimashita" }
                ];
            }
        };
    }

    /* SHELF 15: Sentence Construction */
    function s15() {
        return {
            id: "s15", title: "Sentence Construction", subtitle: "Shelf 15",
            buildInstruction: function () {
                return {
                    grammarTitle: "\u304B\u3089 / \u3051\u3069 / \u3068 Connectors",
                    grammarExplain: "\u304B\u3089 = 'because' (reason first). \u3051\u3069 = 'but' (contrast). \u3068 = 'and' (listing nouns). \u3066-form chains actions.",
                    grammarPattern: '<span class="pattern-box__slot">Reason</span> <span class="pattern-box__fixed">\u304B\u3089</span> <span class="pattern-box__slot">Result</span>',
                    examples: [
                        { jp: "\u9759\u304B\u3060\u304B\u3089\u3001\u597D\u304D\u3067\u3059", en: "Because it's quiet, I like it." },
                        { jp: "\u53E4\u3044\u3051\u3069\u3001\u597D\u304D\u3067\u3059", en: "It's old, but I like it." },
                        { jp: "\u672C\u3068\u304B\u3070\u3093", en: "A book and a bag." }
                    ]
                };
            },
            buildExercises: function () {
                return [
                    { prompt: "Write: <strong>Because it's quiet, I like it</strong>", words: ["\u9759\u304B", "\u3060", "\u304B\u3089", "\u3001", "\u597D\u304D", "\u3067\u3059"], roles: ["adjective", "copula", "connector", "pause", "adjective", "auxiliary"], accepted: [["\u9759\u304B", "\u3060", "\u304B\u3089", "\u3059\u304D", "\u3067\u3059"], ["\u9759\u304B\u3060\u304B\u3089", "\u3059\u304D", "\u3067\u3059"]], hint: "Shizuka dakara suki desu" },
                    { prompt: "Write: <strong>It's old, but I like it</strong>", words: ["\u53E4\u3044", "\u3051\u3069", "\u597D\u304D", "\u3067\u3059"], roles: ["adjective", "connector", "adjective", "auxiliary"], accepted: [["\u53E4\u3044", "\u3051\u3069", "\u597D\u304D", "\u3067\u3059"]], hint: "Furui kedo suki desu" },
                    { prompt: "Write: <strong>A book and a bag</strong>", words: ["\u672C", "\u3068", "\u304B\u3070\u3093"], roles: ["noun", "connector", "noun"], accepted: [["\u672C", "\u3068", "\u304B\u3070\u3093"]], hint: "Hon to kaban" }
                ];
            }
        };
    }

    /* SHELF 16: Particle Mastery */
    function s16() {
        return {
            id: "s16", title: "Particle Mastery", subtitle: "Shelf 16",
            buildInstruction: function () {
                return {
                    grammarTitle: "\u304C / \u3082 / \u3067 Particles",
                    grammarExplain: "\u304C = subject marker (singles out). \u3082 = 'also' (replaces \u306F/\u304C). \u3067 = location of action (not existence). \u306F vs \u304C: general topic vs singled-out subject.",
                    grammarPattern: '<span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">\u304C/\u3082/\u3067</span> <span class="pattern-box__slot">Predicate</span>',
                    examples: [
                        { jp: "\u732B\u304C\u3044\u307E\u3059", en: "It's the cat (not the dog) that's here." },
                        { jp: "\u53CB\u9054\u3082\u5B66\u751F\u3067\u3059", en: "My friend is also a student." },
                        { jp: "\u56F3\u66F8\u9928\u3067\u52E9\u5F37\u3057\u307E\u3059", en: "I study at the library." }
                    ]
                };
            },
            buildExercises: function () {
                return [
                    { prompt: "Write: <strong>The cat is here (\u304C singles out)</strong>", words: ["\u732B", "\u304C", "\u3044\u307E\u3059"], roles: ["noun", "particle", "verb"], accepted: [["\u732B", "\u304C", "\u3044\u307E\u3059"]], hint: "Neko ga imasu" },
                    { prompt: "Write: <strong>My friend is also a student</strong>", words: ["\u53CB\u9054", "\u3082", "\u5B66\u751F", "\u3067\u3059"], roles: ["noun", "particle", "noun", "auxiliary"], accepted: [["\u53CB\u9054", "\u3082", "\u5B66\u751F", "\u3067\u3059"]], hint: "Tomodachi mo gakusei desu" },
                    { prompt: "Write: <strong>I study at the library</strong>", words: ["\u56F3\u66F8\u9928", "\u3067", "\u52E9\u5F37\u3057\u307E\u3059"], roles: ["place", "particle", "verb"], accepted: [["\u56F3\u66F8\u9928", "\u3067", "\u52E9\u5F37\u3057\u307E\u3059"]], hint: "Toshokan de benkyoushimasu" },
                    { prompt: "Write: <strong>I speak with the teacher at school</strong>", words: ["\u5B66\u6821", "\u3067", "\u5148\u751F", "\u3068", "\u8A71\u3057\u307E\u3059"], roles: ["place", "particle", "noun", "particle", "verb"], accepted: [["\u5B66\u6821", "\u3067", "\u5148\u751F", "\u3068", "\u8A71\u3057\u307E\u3059"]], hint: "Gakkou de sensei to hanashimasu" }
                ];
            }
        };
    }

    /* ===== STATE ===== */
    var currentLesson = null;
    var currentExercises = [];
    var exerciseIndex = 0;
    var attempts = 0;
    var maxAttempts = 3;
    var totalExercises = 0;
    var completedExercises = 0;
    var lessonScore = 0;

    var lessons = buildLessons();

    function $(id) { return document.getElementById(id); }

    /* ===== SIDEBAR: lesson list ===== */
    function renderSidebar() {
        var sidebar = $("studySidebar");
        if (!sidebar) return;
        sidebar.innerHTML = "<div class='study-sidebar__heading'>N5 Shelves</div>";
        lessons.forEach(function (les) {
            var btn = document.createElement("button");
            btn.className = "study-lesson-btn";
            btn.setAttribute("data-id", les.id);
            btn.innerHTML = "<span class='study-lesson-btn__num'>" + les.id.replace("s","") + "</span>"
                + "<span class='study-lesson-btn__label'>" + les.title + "</span>"
                + "<span class='study-lesson-btn__check'>&#10003;</span>";
            btn.addEventListener("click", function () { openLesson(les.id); });
            sidebar.appendChild(btn);
        });
    }

    function highlightActiveLesson(id) {
        var btns = document.querySelectorAll(".study-lesson-btn");
        btns.forEach(function (b) {
            b.classList.toggle("is-active", b.getAttribute("data-id") === id);
        });
    }

    /* ===== OPEN LESSON: instruction panel + start practice ===== */
    function openLesson(id) {
        currentLesson = lessons.find(function (l) { return l.id === id; });
        if (!currentLesson) return;
        currentExercises = currentLesson.buildExercises();
        exerciseIndex = 0;
        totalExercises = currentExercises.length;
        completedExercises = 0;
        lessonScore = 0;
        highlightActiveLesson(id);
        renderInstruction();
        show($("studyPractice"));
        hide($("studyComplete"));
        var progressWrap = $("studyProgressFill") ? $("studyProgressFill").parentElement.parentElement : null;
        if (progressWrap) progressWrap.style.display = "";
        renderExercise();
    }

    function renderInstruction() {
        var panel = $("studyInstruct");
        if (!panel) return;
        var inst = currentLesson.buildInstruction();
        var html = "<h2>" + currentLesson.title + " <span style='font-size:14px;color:var(--text-light)'>(" + currentLesson.subtitle + ")</span></h2>"
            + "<div class='grammar-box'>"
            + "<div class='grammar-box__title'>" + inst.grammarTitle + "</div>"
            + "<p>" + inst.grammarExplain + "</p>"
            + "<div class='pattern-box'><span class='pattern-box__label'>Pattern:</span> " + inst.grammarPattern + "</div>"
            + "</div>"
            + "<h3>Examples</h3>";
        inst.examples.forEach(function (ex) {
            html += "<div class='example-sentence'>"
                + "<span>" + ex.jp + "</span>"
                + "<span class='example-sentence__english'>\u2014 " + ex.en + "</span>"
                + "</div>";
        });
        panel.innerHTML = html;
    }

    /* ===== EXERCISE RENDERING ===== */
    function renderExercise() {
        if (exerciseIndex >= currentExercises.length) {
            showResult();
            return;
        }
        var ex = currentExercises[exerciseIndex];
        attempts = 0;

        var prompt = $("studyPractice").querySelector(".study-practice__prompt");
        if (prompt) prompt.innerHTML = ex.prompt;

        var input = $("studyInput");
        if (input) {
            input.value = "";
            input.disabled = false;
            input.className = "study-practice__input";
            setTimeout(function () { input.focus(); }, 80);
        }

        var fill = $("studyProgressFill");
        if (fill) fill.style.width = Math.round((exerciseIndex / totalExercises) * 100) + "%";
        var txt = $("studyProgressText");
        if (txt) txt.textContent = exerciseIndex + " / " + totalExercises;

        hide($("studyFeedback"));
        var fb = $("studyFeedback");
        if (fb) { fb.className = "study-practice__feedback"; fb.innerHTML = ""; }

        show($("studyCheckBtn"));
        show($("studyHintBtn"));
        hide($("studyNextBtn"));
    }

    /* ===== CHECK ANSWER ===== */
    function checkAnswer() {
        var input = $("studyInput");
        if (!input || !currentLesson) return;
        var ex = currentExercises[exerciseIndex];
        var userVal = norm(input.value);
        var accepted = ex.accepted.some(function (acc) {
            var fullSentence = acc.join("");
            return norm(fullSentence) === userVal;
        });

        if (accepted) {
            input.disabled = true;
            input.classList.add("is-correct");
            completedExercises++;
            lessonScore++;
            showFeedback("Correct! +1 point", "correct");
            show($("studyNextBtn"));
            hide($("studyCheckBtn"));
            hide($("studyHintBtn"));
        } else {
            attempts++;
            input.classList.add("is-wrong");
            setTimeout(function () { input.classList.remove("is-wrong"); }, 400);
            if (attempts >= maxAttempts) {
                input.disabled = true;
                completedExercises++;
                showFeedback("The answer is: <strong>" + ex.hint + "</strong>", "reveal");
                show($("studyNextBtn"));
                hide($("studyCheckBtn"));
                hide($("studyHintBtn"));
            } else {
                showFeedback("Wrong! " + (maxAttempts - attempts) + " attempt" + (maxAttempts - attempts === 1 ? "" : "s") + " left", "wrong");
            }
        }
    }

    function nextExercise() {
        exerciseIndex++;
        renderExercise();
    }

    /* ===== HINT ===== */
    function showHint() {
        var ex = currentExercises[exerciseIndex];
        if (!ex) return;
        showFeedback("Hint: <strong>" + ex.hint + "</strong>", "hint");
    }

    /* ===== FEEDBACK ===== */
    function showFeedback(msg, type) {
        var fb = $("studyFeedback");
        if (!fb) return;
        fb.className = "study-practice__feedback study-practice__feedback--" + type + " is-visible";
        fb.innerHTML = msg;
    }

    /* ===== RESULT ===== */
    function showResult() {
        hide($("studyPractice"));
        var panel = $("studyComplete");
        if (!panel) return;
        var pct = totalExercises > 0 ? Math.round((lessonScore / totalExercises) * 100) : 0;
        var msg;
        if (pct === 100) msg = "Perfect score! You're amazing!";
        else if (pct >= 75) msg = "Great job! Almost there!";
        else if (pct >= 50) msg = "Not bad! Keep practicing!";
        else msg = "Don't give up! Try again!";
        panel.innerHTML = "<div class='study-complete__icon'>&#127968;</div>"
            + "<div class='study-complete__title'>Lesson Complete!</div>"
            + "<div class='study-complete__msg'>" + msg + "</div>"
            + "<div class='study-complete__score'>" + lessonScore + " / " + totalExercises + " (" + pct + "%)</div>";
        panel.classList.add("is-visible");
        hide($("studyProgressFill").parentElement.parentElement);
    }

    /* ===== EVENT WIRING ===== */
    function wireEvents() {
        var checkBtn = $("studyCheckBtn");
        if (checkBtn) checkBtn.addEventListener("click", checkAnswer);

        var hintBtn = $("studyHintBtn");
        if (hintBtn) hintBtn.addEventListener("click", showHint);

        var nextBtn = $("studyNextBtn");
        if (nextBtn) nextBtn.addEventListener("click", nextExercise);

        var input = $("studyInput");
        if (input) input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                if ($("studyNextBtn").style.display !== "none" && $("studyNextBtn").style.display !== "") {
                    nextExercise();
                } else {
                    checkAnswer();
                }
            }
        });

        var skipBtn = $("studySkipBtn");
        if (skipBtn) skipBtn.addEventListener("click", function () {
            if (currentLesson) {
                exerciseIndex++;
                renderExercise();
            }
        });
    }

    /* ===== PUBLIC API (called by index.html toggle) ===== */
    window.StudyRoom = {
        init: function () {
            renderSidebar();
            wireEvents();
            var practice = $("studyPractice");
            if (practice) practice.style.display = "none";
            var complete = $("studyComplete");
            if (complete) { complete.classList.remove("is-visible"); complete.innerHTML = ""; }
        }
    };
})();
