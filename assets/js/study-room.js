/* STUDY ROOM - Exact 16-shelf sequence from Neko Bunko adventure */
/* Word banks + word-bank sentence-building exercises per shelf, per the
   Study Room Word-Bank Sentence Builder PRD: each lesson declares a small
   closed set of words (wordBank) and 1-2 exercises that pick randomly
   *within* that set (never outside it) to build a sentence the learner
   then types in hiragana. */
/* Interactive route diagram for shelf 08c's "Movement & giving directions"
   section (see s08c's buildInstruction() below). diagramSvg is just a
   static HTML string dumped via innerHTML, so a <script> tag inside it
   would never execute — instead the buttons carry inline onclick
   attributes that call this one global handler. State lives on the
   diagram's own root element (data-step), not in a JS variable, so a
   lesson re-render (switching lessons and back) always starts fresh.

   MAP GEOMETRY — ported from a hand-drawn reference map (Home -> House ->
   Hospital/Library corner -> School -> Kouen -> Eki), kept here as a single
   NODES table (in `left%/top%` of .route2-scene) so the road layout, the
   route, and the building placements all read off ONE source of truth
   instead of scattered magic numbers. Edit NODES to reshape the map; edit
   `steps` to reshape the route (each step is one Japanese instruction the
   player must press, in order). */
window.NekoRoute = {
    NODES: {
        home: [8, 92], houseIntersection: [32, 92], kouenBottom: [58, 92],
        kouenTop: [58, 62], schoolJunction: [32, 62], hospitalJunction: [32, 32],
        buildingCrossing: [62, 32], eki: [94, 32],
        /* Scenery buildings — kept close/adjacent to the road segment they
           sit next to, not floating off in open space. */
        house: [32, 78], hospital: [18, 45], library: [38, 20], building: [62, 18],
        restaurant: [76, 23], school: [45, 70], kouen: [64, 80]
    },
    /* Each step is one instruction: `action` is which of the three buttons
       is correct (right = migi, left = hidari, straight = massugu);
       `facing` is the cat's resulting compass heading after the step
       (e = east/right, w = west/left, n = north/up — see press() for how
       `n` is rendered given there's no dedicated "walking away" sprite);
       `move` (optional, [left%, top%]) is where the cat animates to —
       omitted on a step that's a pure in-place turn (the cat only travels
       on the *next* step). */
    steps: [
        { action: "right", facing: "e", move: [32, 92] },      // Home -> house intersection (turn to face the road, walk to it)
        { action: "straight", facing: "e", move: [58, 92] },   // straight past that intersection, don't turn, to the Kouen corner
        { action: "left", facing: "n", move: [58, 62] },       // turn north up the Kouen road
        { action: "left", facing: "w", move: [32, 62] },       // dead end north — turn west along the School row
        { action: "right", facing: "n", move: [32, 32] },      // turn north up to the top row
        { action: "right", facing: "e" },                      // turn east to face the final stretch (no move yet)
        { action: "straight", facing: "e", move: [94, 32] }    // straight all the way to Eki
    ],
    prompts: {
        right: { jp: "右に曲がってください。", romaji: "migi ni magatte kudasai — turn right" },
        straight: { jp: "まっすぐ行ってください。", romaji: "massugu itte kudasai — go straight" },
        left: { jp: "左に曲がってください。", romaji: "hidari ni magatte kudasai — turn left" }
    },
    press: function (btn, action) {
        var scene = btn.closest(".grammar-box__route2");
        if (!scene) return;
        var idx = parseInt(scene.dataset.step || "0", 10);
        var step = this.steps[idx];
        if (!step || step.action !== action) {
            btn.classList.remove("is-wrong");
            void btn.offsetWidth;
            btn.classList.add("is-wrong");
            return;
        }
        var cat = scene.querySelector('[data-role="cat"]');
        /* Swap the actual sitewide directional walking sprite (same
           tailwagright/tailwagleft sheets the conversation avatars use)
           instead of mirroring a flat static image — a real orange cat
           genuinely walking each way, not a CSS flip trick. There's no
           dedicated "walking away/up" sheet in the asset set, so a
           north-facing step reuses the rightward walk-cycle and rotates
           the whole sprite -90deg (CCW) via the .is-facing-n class —
           whatever was pointing east now points north — rather than
           leaving a sideways-facing sprite showing while the cat visibly
           moves up the map. */
        if (step.facing === "e") { cat.style.backgroundImage = "url(\"../../assets/images/avatars/tailwagright-orange-64x64.png\")"; cat.classList.remove("is-facing-n"); }
        if (step.facing === "w") { cat.style.backgroundImage = "url(\"../../assets/images/avatars/tailwagleft-orange-64x64.png\")"; cat.classList.remove("is-facing-n"); }
        if (step.facing === "n") { cat.style.backgroundImage = "url(\"../../assets/images/avatars/tailwagright-orange-64x64.png\")"; cat.classList.add("is-facing-n"); }
        if (step.move) {
            cat.style.left = step.move[0] + "%";
            cat.style.top = step.move[1] + "%";
        }
        idx++;
        scene.dataset.step = String(idx);
        var promptJp = scene.querySelector('[data-role="promptJp"]');
        var promptRomaji = scene.querySelector('[data-role="promptRomaji"]');
        if (idx < this.steps.length) {
            var next = this.prompts[this.steps[idx].action];
            promptJp.textContent = next.jp;
            promptRomaji.textContent = next.romaji;
        } else {
            promptJp.textContent = "駅に着きました！";
            promptRomaji.textContent = "Eki ni tsukimashita — arrived!";
            var arrival = scene.querySelector('[data-role="arrival"]');
            if (arrival) arrival.classList.add("show");
        }
    }
};

/* s15's S-T-P-O-V sentence-order diagram + 3-round slot-builder practice.
   Two independently-clickable widgets share this namespace: the "signal
   stack" (5 always-visible role lights, each with its actual particle(s)
   stacked underneath it, per explicit feedback correcting the acronym to
   Subject/Time/Place/Object/Verb -- not the "Particle" guess an earlier
   pass used) and the slot-builder underneath it (pick up a word chip,
   then click the slot you think its grammatical role belongs in -- gets
   it wrong on a mismatch rather than silently auto-sorting, so it's a
   real recognition test, not just a sorting toy). Round state lives on
   .stpov-builder's own data-round attribute, same reasoning as
   .grammar-box__route2's data-step above: a lesson re-render always
   starts clean, no separate JS variable to go stale. */
window.NekoSTPOV = {
    ROLES: [
        { key: "S", label: "Subject", particles: ["は", "が", "も"] },
        { key: "T", label: "Time", particles: ["に"] },
        { key: "P", label: "Place", particles: ["で", "に"] },
        { key: "O", label: "Object", particles: ["を"] },
        { key: "V", label: "Verb", particles: [] }
    ],
    ROLE_DETAIL: {
        S: "who or what the sentence is about -- は for the topic, が to single one thing out, も for \"also.\"",
        T: "when it happens -- に for a specific point in time (三時に, \"at 3 o'clock\"). Relative day words like あした (tomorrow) or きょう (today) usually skip に entirely.",
        P: "where it happens -- で for where an ACTION takes place (図書館で読みます, \"read AT the library\"), に for where something exists or a destination.",
        O: "the thing the verb acts on -- always marked with を.",
        V: "the action itself, always last -- ます／ません／ました and friends attach here. Nothing ever comes after the verb."
    },
    ROUNDS: [
        {
            en: "I will read a book at the library at 3 o'clock.",
            chips: [
                { tag: "S", jp: "私は" }, { tag: "T", jp: "三時に" }, { tag: "P", jp: "図書館で" },
                { tag: "O", jp: "本を" }, { tag: "V", jp: "読みます" }
            ]
        },
        {
            en: "My friend will play soccer at the park tomorrow.",
            chips: [
                { tag: "S", jp: "友達は" }, { tag: "T", jp: "あした" }, { tag: "P", jp: "公園で" },
                { tag: "O", jp: "サッカーを" }, { tag: "V", jp: "します" }
            ]
        },
        {
            en: "The cat eats food in the kitchen in the morning.",
            chips: [
                { tag: "S", jp: "猫は" }, { tag: "T", jp: "朝に" }, { tag: "P", jp: "台所で" },
                { tag: "O", jp: "ごはんを" }, { tag: "V", jp: "たべます" }
            ]
        }
    ],
    buildSignalStackHTML: function () {
        var cols = this.ROLES.map(function (r) {
            var particlesHTML = r.particles.length
                ? r.particles.map(function (p) { return '<span class="stpov-chip-static">' + p + "</span>"; }).join("")
                : '<span class="stpov-col__none">end of sentence</span>';
            return '<div class="stpov-col">'
                + '<div class="stpov-light" onclick="window.NekoSTPOV.selectRole(this,\'' + r.key + '\')">' + r.key + "</div>"
                + '<div class="stpov-col__label">' + r.label + "</div>"
                + '<div class="stpov-col__connector"></div>'
                + '<div class="stpov-col__particles">' + particlesHTML + "</div>"
                + "</div>";
        }).join("");
        return '<div class="stpov-diagram-wrap"><div class="stpov-stack">' + cols + '</div>'
            + '<div class="stpov-readout" data-role="stpovReadout">Click a letter above for what it marks.</div></div>';
    },
    selectRole: function (el, key) {
        var wrap = el.closest(".stpov-diagram-wrap");
        wrap.querySelectorAll(".stpov-light").forEach(function (l) { l.classList.remove("is-active"); });
        el.classList.add("is-active");
        var role = this.ROLES.find(function (r) { return r.key === key; });
        var readout = wrap.querySelector('[data-role="stpovReadout"]');
        readout.textContent = key + " = " + role.label + ": " + this.ROLE_DETAIL[key];
    },
    renderRoundData: function (idx) {
        var round = this.ROUNDS[idx];
        var slots = this.ROLES.map(function (r) {
            return '<div class="stpov-slot" data-tag="' + r.key + '" onclick="window.NekoSTPOV.dropOnSlot(this)">'
                + '<span class="stpov-slot__tag">' + r.key + "</span>"
                + '<span class="stpov-slot__jp"></span></div>';
        }).join("");
        var shuffled = round.chips.slice().sort(function () { return Math.random() - 0.5; });
        var chips = shuffled.map(function (c) {
            return '<div class="stpov-chip" data-tag="' + c.tag + '" data-jp="' + c.jp + '" onclick="window.NekoSTPOV.pickChip(this)">' + c.jp + "</div>";
        }).join("");
        return { slots: slots, chips: chips, prompt: round.en, total: this.ROUNDS.length };
    },
    buildBuilderHTML: function () {
        var r0 = this.renderRoundData(0);
        return '<div class="stpov-builder" data-round="0">'
            + '<div class="stpov-builder__head"><span class="stpov-builder__round" data-role="roundLabel">Round 1 of ' + r0.total + "</span></div>"
            + '<div class="stpov-builder__prompt" data-role="prompt">Build: <strong>' + r0.prompt + "</strong></div>"
            + '<div class="stpov-slots" data-role="slots">' + r0.slots + "</div>"
            + '<div class="stpov-chip-tray" data-role="chips">' + r0.chips + "</div>"
            + '<div class="stpov-builder__feedback" data-role="feedback"></div>'
            + '<button type="button" class="stpov-builder__next" data-role="nextBtn" onclick="window.NekoSTPOV.nextRound(this)">Next round &rarr;</button>'
            + "</div>";
    },
    pickChip: function (el) {
        if (el.classList.contains("is-used")) return;
        var tray = el.closest(".stpov-chip-tray");
        tray.querySelectorAll(".stpov-chip").forEach(function (c) { c.classList.remove("is-selected"); });
        el.classList.add("is-selected");
    },
    dropOnSlot: function (slotEl) {
        if (slotEl.classList.contains("is-filled")) return;
        var wrapper = slotEl.closest(".stpov-builder");
        var chip = wrapper.querySelector(".stpov-chip.is-selected");
        var feedback = wrapper.querySelector('[data-role="feedback"]');
        if (!chip) {
            feedback.textContent = "Pick a word chip first, then click the slot you think it belongs in.";
            feedback.className = "stpov-builder__feedback";
            return;
        }
        if (chip.dataset.tag === slotEl.dataset.tag) {
            slotEl.classList.add("is-filled");
            slotEl.querySelector(".stpov-slot__jp").textContent = chip.dataset.jp;
            chip.classList.remove("is-selected");
            chip.classList.add("is-used");
            var allFilled = Array.prototype.every.call(wrapper.querySelectorAll(".stpov-slot"), function (s) { return s.classList.contains("is-filled"); });
            if (allFilled) {
                var round = parseInt(wrapper.dataset.round, 10);
                var isLast = round >= this.ROUNDS.length - 1;
                feedback.textContent = isLast ? "All 3 rounds complete! Nice work." : "Round complete!";
                var nextBtn = wrapper.querySelector('[data-role="nextBtn"]');
                if (!isLast) { nextBtn.classList.add("show"); } else { nextBtn.classList.remove("show"); }
            } else {
                feedback.textContent = "Correct!";
            }
            feedback.className = "stpov-builder__feedback is-good";
        } else {
            slotEl.classList.remove("is-wrong");
            void slotEl.offsetWidth;
            slotEl.classList.add("is-wrong");
            feedback.textContent = "Not quite -- try a different slot.";
            feedback.className = "stpov-builder__feedback is-bad";
        }
    },
    nextRound: function (btn) {
        var wrapper = btn.closest(".stpov-builder");
        var round = parseInt(wrapper.dataset.round, 10) + 1;
        if (round >= this.ROUNDS.length) return;
        wrapper.dataset.round = String(round);
        var r = this.renderRoundData(round);
        wrapper.querySelector('[data-role="roundLabel"]').textContent = "Round " + (round + 1) + " of " + r.total;
        wrapper.querySelector('[data-role="prompt"]').innerHTML = "Build: <strong>" + r.prompt + "</strong>";
        wrapper.querySelector('[data-role="slots"]').innerHTML = r.slots;
        wrapper.querySelector('[data-role="chips"]').innerHTML = r.chips;
        var feedback = wrapper.querySelector('[data-role="feedback"]');
        feedback.textContent = "";
        feedback.className = "stpov-builder__feedback";
        btn.classList.remove("show");
    }
};

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

    /* Sprite sheets for 'conversation' turns (see buildInstruction()'s
       optional `conversation` field + renderConversation() below) — the
       same per-color action sheets n5-phaser-game.js's ACTION_SPRITE_PATHS
       uses, but with a fixed color pairing baked in instead of resolved
       from the player's chosen cat color: Study Room has no color-select
       flow at all, so every conversation always casts the sensei as
       black and the player as orange (explicit choice, not a default —
       matches the Adventure Room's own sensei-color fallback when a
       player picks orange). Each sheet is a clean, untrimmed 64px-pitch
       grid (confirmed by direct pixel scan, unlike the trimmed
       Playing/StandingUp sheets companion-cat.css had to special-case),
       so a plain percentage-based steps() loop (see .conv-avatar in
       study-style.css) needs only the frame count — no per-sheet crop
       math required. */
    const CONV_ACTION_SPRITES = {
        meow: { frames: 3, black: "../../assets/images/avatars/talk-black-64x64.png", orange: "../../assets/images/avatars/talk-orange-64x64.png" },
        scratch: { frames: 8, black: "../../assets/images/avatars/scratch-black-64x64.png", orange: "../../assets/images/avatars/scratch-orange-64x64.png" },
        tailwagFront: { frames: 5, black: "../../assets/images/avatars/tailwag-black-64x64.png", orange: "../../assets/images/avatars/tailwag-orange-64x64.png" },
        tailwagLeft: { frames: 5, black: "../../assets/images/avatars/tailwagleft-black-64x64.png", orange: "../../assets/images/avatars/tailwagleft-orange-64x64.png" },
        tailwagRight: { frames: 5, black: "../../assets/images/avatars/tailwagright-black-64x64.png", orange: "../../assets/images/avatars/tailwagright-orange-64x64.png" }
    };

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

    /* ===== FURIGANA =====
       No existing furigana system anywhere on this site — this is it.
       One flat dictionary of every kanji-containing word/phrase that
       appears in this file's vocab/example text (whole-word readings,
       not per-character — "静か" → "しずか" as one <rt>, not two separate
       readings for 静 and か — simpler to author correctly and still
       genuinely useful for a self-study tool, at the cost of not being
       typographically "proper" per-character furigana). annotateFurigana()
       scans a string and wraps every dictionary match it finds in <ruby>,
       longest match first at each position so a compound like "静かです"
       matches before the shorter "静か" would. Anything not in the
       dictionary (a kanji that slipped through, or already-kana text)
       passes through untouched — this degrades gracefully rather than
       ever breaking rendering. */
    const KANJI_READINGS = {
        "お元気ですか": "おげんきですか", "元気です": "げんきです", "元気": "げんき",
        "よろしくお願いします": "よろしくおねがいします", "お願いします": "おねがいします",
        "お邪魔します": "おじゃまします", "お邪魔しました": "おじゃましました",
        "多分": "たぶん", "全然": "ぜんぜん", "君": "くん", "用": "よう",
        "お名前": "おなまえ", "何": "なん",
        "前": "まえ", "右": "みぎ", "隣": "となり", "上": "うえ", "中": "なか",
        "北": "きた", "東": "ひがし", "木": "き",
        "彼女": "かのじょ", "子供": "こども", "家族": "かぞく", "僕": "ぼく", "彼ら": "かれら", "誰か": "だれか",
        "大きい": "おおきい", "赤い": "あかい", "新しい": "あたらしい", "高い": "たかい", "楽しい": "たのしい",
        "有名": "ゆうめい", "大変": "たいへん", "古い": "ふるい", "本": "ほん", "好き": "すき",
        "静かです": "しずかです", "静かでした": "しずかでした",
        "静かじゃないです": "しずかじゃないです", "静かじゃなかったです": "しずかじゃなかったです",
        "静かだ": "しずかだ", "静かじゃない": "しずかじゃない", "静か": "しずか",
        "起きる": "おきる", "起きて": "おきて", "起きます": "おきます", "起きません": "おきません",
        "起きました": "おきました", "起きませんでした": "おきませんでした",
        "行きます": "いきます", "行きません": "いきません", "行きませんでした": "いきませんでした",
        "行く": "いく", "行って": "いって",
        "帰る": "かえる", "帰って": "かえって",
        "読む": "よむ", "読んで": "よんで",
        "書く": "かく", "書いて": "かいて",
        "会う": "あう", "会って": "あって",
        "座る": "すわる", "座って": "すわって",
        "休む": "やすむ", "休んで": "やすんで",
        "分かる": "わかる", "分かって": "わかって",
        "話します": "はなします", "話しました": "はなしました",
        "勉強します": "べんきょうします", "勉強しません": "べんきょうしません",
        "公園": "こうえん", "学校": "がっこう", "学生": "がくせい", "先生": "せんせい",
        "図書館": "としょかん", "遊びます": "あそびます", "猫": "ねこ", "友達": "ともだち"
    };
    const KANJI_READING_KEYS = Object.keys(KANJI_READINGS).sort(function (a, b) { return b.length - a.length; });
    function annotateFurigana(text) {
        if (!text) return text;
        let out = "";
        let i = 0;
        outer: while (i < text.length) {
            for (let k = 0; k < KANJI_READING_KEYS.length; k++) {
                let key = KANJI_READING_KEYS[k];
                if (text.startsWith(key, i)) {
                    out += "<ruby>" + key + "<rt>" + KANJI_READINGS[key] + "</rt></ruby>";
                    i += key.length;
                    continue outer;
                }
            }
            out += text[i];
            i++;
        }
        return out;
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
        return [s01(),s02(),s02b(),s02c(),s03(),s04(),s05(),s06(),s07a(),s07b(),s07c(),s07d(),s07e(),s08a(),s08b(),s08c(),s08d(),
                s09a(),s09b(),s10a(),s10b(),s10c(),s11a(),s11b(),s11c(),s14(),s12(),s13(),s15(),s16(),
                k01(), cq1(), cq2(), cq3()];
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
                newWords: [
                    { jp: "ねこ", en: "cat" }, { jp: "みず", en: "water" }, { jp: "がっこう", en: "school" },
                    { jp: "おおきい", en: "big" }, { jp: "ちいさい", en: "small" }
                ],
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
                    /* Ported verbatim from the Adventure Room's shelf-01
                       LESSON_CONTENT (the closing 'conversation' page, two
                       NPC cats using only this shelf's own vocab), fixed
                       sensei=black/player=orange casting per Study Room's
                       own convention. No role-* highlight spans in the
                       original and no name variable in scope for this
                       vocab-only lesson, so nothing else to convert. */
                    conversation: {
                        turns: [
                            {
                                speaker: "sensei", name: "Neko-sensei", action: "meow", actionLabel: "*meows*",
                                text: "こんにちは！",
                                romaji: "Konnichiwa! — \"Hello!\""
                            },
                            {
                                speaker: "player", name: "You", action: "tailwagLeft", actionLabel: "*tail wags*",
                                text: "こんにちは！ありがとうございます。",
                                romaji: "Konnichiwa! Arigatou gozaimasu. — \"Hello! Thank you.\""
                            },
                            {
                                speaker: "sensei", name: "Neko-sensei", action: "meow", actionLabel: "*meows*",
                                text: "さようなら！",
                                romaji: "Sayounara! — \"Goodbye!\""
                            }
                        ]
                    },
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
                newWords: [
                    { jp: "でんわ", en: "telephone" }, { jp: "くるま", en: "car" }, { jp: "ほん", en: "book" },
                    { jp: "たのしい", en: "fun" }, { jp: "いそがしい", en: "busy" }
                ],
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
                    /* Ported verbatim from the Adventure Room's shelf-02
                       LESSON_CONTENT (the closing 'conversation' page, two
                       NPC cats using this shelf's お元気ですか/元気です/じゃあね
                       plus one already-known shelf-01 phrase), fixed
                       sensei=black/player=orange casting per Study Room's
                       own convention. No role-* spans in the original and
                       no name variable in scope for this vocab-only
                       lesson, so nothing else to convert. */
                    conversation: {
                        turns: [
                            {
                                speaker: "sensei", name: "Neko-sensei", action: "meow", actionLabel: "*meows*",
                                text: "お元気ですか？",
                                romaji: "Ogenki desu ka? — \"How are you?\""
                            },
                            {
                                speaker: "player", name: "You", action: "tailwagLeft", actionLabel: "*tail wags*",
                                text: "元気です！ありがとうございます。",
                                romaji: "Genki desu! Arigatou gozaimasu. — \"I'm doing well! Thank you.\""
                            },
                            {
                                speaker: "sensei", name: "Neko-sensei", action: "meow", actionLabel: "*meows*",
                                text: "じゃあね！",
                                romaji: "Jaa ne! — \"See you!\""
                            }
                        ]
                    },
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
                newWords: [
                    { jp: "たべもの", en: "food" }, { jp: "おちゃ", en: "tea" }, { jp: "いえ", en: "house" },
                    { jp: "おいしい", en: "delicious" }, { jp: "あつい", en: "hot" }
                ],
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
                newWords: [
                    { jp: "はなし", en: "talk / story" }, { jp: "きもち", en: "feeling" }, { jp: "おもしろい", en: "interesting" },
                    { jp: "うれしい", en: "happy" }, { jp: "へん", en: "strange / odd" }
                ],
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
                newWords: [
                    { jp: "いす", en: "chair" }, { jp: "つくえ", en: "desk" }, { jp: "かさ", en: "umbrella" },
                    { jp: "たかい", en: "expensive" }, { jp: "やすい", en: "cheap" }
                ],
                preview: [{ jp: "はじめまして", en: "how do you do (first meeting only)", note: "Coming up in shelf 04 — self-introductions" }]
            },
            buildInstruction: function () {
                return {
                    sections: [{
                        title: "A は B です",
                        explain: "Use は to mark the topic and です to make it polite — です changes shape to move the tense: swap it for でした and the whole sentence slides from now to before, nothing else changes. Japanese doesn't have a separate future word either — です already covers 'will be.'",
                        pattern: '<span class="pattern-box__slot">Topic</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">Predicate</span> <span class="pattern-box__fixed">です</span>',
                        /* Ported verbatim (structure/wording) from n5-phaser-game.js's
                           LESSON_CONTENT['shelf-03'] grammar-intro diagram page. The
                           original used var(--lb-role-*)/var(--jr-text-dim), which only
                           resolve inside .lesson-box-overlay (lesson-box.css) — Study
                           Room's DOM never has that ancestor, so every var(...) below is
                           replaced with its literal N5-theme hex value straight from
                           lesson-box.css's :root block: --lb-role-particle-bg #f0c674,
                           --lb-role-copula-bg #ffffff, --lb-role-subject-bg/fg #6fb3e6/
                           #0b2438, --lb-role-predicate-bg/fg #e2685f/#2e0e0b,
                           --lb-role-copula-fg #201d54, --lb-role-particle-fg #4a3211,
                           --lb-role-neutral-bg #746fa8, --jr-text-dim #c9a66b. */
                        diagramSvg: `
        <svg viewBox="0 0 620 250" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; display:block;">
          <defs>
            <marker id="lb-arrow-gold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#f0c674"></path>
            </marker>
            <marker id="lb-arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#ffffff"></path>
            </marker>
          </defs>
          <text x="10" y="24" font-size="11" fill="#c9a66b" font-family="VT323, DotGothic16, monospace" letter-spacing="1">ENGLISH - "am" does both jobs at once</text>
          <g font-family="VT323, DotGothic16, monospace" font-size="16">
            <rect x="10" y="36" width="70" height="34" rx="3" fill="#746fa8"></rect>
            <text x="45" y="58" text-anchor="middle" fill="#efeeff">I</text>
            <rect x="96" y="36" width="70" height="34" rx="3" fill="#746fa8"></rect>
            <text x="131" y="58" text-anchor="middle" fill="#efeeff">am</text>
            <rect x="182" y="36" width="140" height="34" rx="3" fill="#746fa8"></rect>
            <text x="252" y="58" text-anchor="middle" fill="#efeeff">a teacher</text>
          </g>
          <text x="131" y="30" text-anchor="middle" font-size="9" fill="#c9a66b" font-family="VT323, DotGothic16, monospace">"is" + tense, bundled</text>
          <circle cx="131" cy="72" r="3" fill="#c9a66b"></circle>
          <path d="M131,72 C 131,102 131,128 131,155" fill="none" stroke="#f0c674" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#lb-arrow-gold)"></path>
          <text x="142" y="112" text-anchor="start" font-size="10" fill="#f0c674" font-family="VT323, DotGothic16, monospace">"is" -&gt; は</text>
          <path d="M131,72 C 190,96 260,122 315,155" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#lb-arrow-green)"></path>
          <text x="225" y="102" text-anchor="middle" font-size="10" fill="#ffffff" font-family="VT323, DotGothic16, monospace">tense -&gt; です (sentence-final)</text>
          <text x="10" y="148" font-size="11" fill="#c9a66b" font-family="VT323, DotGothic16, monospace" letter-spacing="1">JAPANESE - split into は (is) and です (tense)</text>
          <g font-family="VT323, DotGothic16, monospace" font-size="16">
            <rect x="10" y="160" width="90" height="34" rx="3" fill="#6fb3e6"></rect>
            <text x="55" y="182" text-anchor="middle" fill="#0b2438">わたし</text>
            <rect x="108" y="160" width="46" height="34" rx="3" fill="#f0c674"></rect>
            <text x="131" y="182" text-anchor="middle" fill="#4a3211">は</text>
            <rect x="162" y="160" width="110" height="34" rx="3" fill="#e2685f"></rect>
            <text x="217" y="182" text-anchor="middle" fill="#2e0e0b">せんせい</text>
            <rect x="280" y="160" width="70" height="34" rx="3" fill="#ffffff"></rect>
            <text x="315" y="182" text-anchor="middle" fill="#201d54">です</text>
          </g>
          <g font-family="VT323, DotGothic16, monospace" font-size="9" fill="#c9a66b">
            <text x="55" y="208" text-anchor="middle">subject</text>
            <text x="131" y="203" text-anchor="middle">topic + "is"</text>
            <text x="217" y="208" text-anchor="middle">predicate</text>
            <text x="315" y="203" text-anchor="middle">tense +</text>
            <text x="315" y="215" text-anchor="middle">politeness</text>
          </g>
          <text x="10" y="238" font-size="10" fill="#c9a66b" font-family="VT323, DotGothic16, monospace">Swap です -&gt; でした and ONLY the tense changes - は's job never moves.</text>
        </svg>
      `,
                        diagramCaption: '"Watashi wa sensei desu." — English bundles "is" and tense into one word (am/was). Japanese splits them: は carries "is," です carries tense.',
                        culture: "です also makes a sentence sound polite — like how Filipino adds \"po\" or \"opo.\" It doesn't change what you're saying, just how respectful it sounds. Filipino even has its own は: the particle \"ay\" sits right after the topic the same way は does — \"Ako ay guro\" works just like \"Watashi wa sensei.\""
                    }, {
                        title: "Sentence construction — the box breakdown",
                        explain: "Here's the same pattern with every piece labeled by its job, not just its meaning: a Topic slot, the は particle that marks it, a Predicate slot (whatever the topic IS), and です sitting fixed at the very end. これ works exactly like わたし here — 'this' is just a topic like any other, so it slots into the same first box.",
                        diagramSvg: `
        <svg viewBox="0 0 640 200" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; display:block;">
          <text x="20" y="20" font-size="11" fill="#c9a66b" font-family="VT323, DotGothic16, monospace" letter-spacing="1">A は B です - BOX BY BOX</text>
          <g font-family="VT323, DotGothic16, monospace" font-size="16">
            <rect x="20" y="38" width="100" height="34" rx="3" fill="#6fb3e6"></rect>
            <text x="70" y="60" text-anchor="middle" fill="#0b2438">わたし</text>
            <rect x="126" y="38" width="46" height="34" rx="3" fill="#f0c674"></rect>
            <text x="149" y="60" text-anchor="middle" fill="#4a3211">は</text>
            <rect x="178" y="38" width="110" height="34" rx="3" fill="#e2685f"></rect>
            <text x="233" y="60" text-anchor="middle" fill="#2e0e0b">がくせい</text>
            <rect x="294" y="38" width="70" height="34" rx="3" fill="#ffffff"></rect>
            <text x="329" y="60" text-anchor="middle" fill="#201d54">です</text>
          </g>
          <g font-family="VT323, DotGothic16, monospace" font-size="9" fill="#c9a66b">
            <text x="70" y="86" text-anchor="middle">topic</text>
            <text x="149" y="86" text-anchor="middle">は - marks it</text>
            <text x="233" y="86" text-anchor="middle">predicate</text>
            <text x="329" y="86" text-anchor="middle">です - copula</text>
          </g>
          <text x="20" y="108" font-size="10" fill="#c9a66b" font-family="VT323, DotGothic16, monospace">Watashi wa gakusei desu. - "I am a student."</text>

          <g font-family="VT323, DotGothic16, monospace" font-size="16">
            <rect x="20" y="128" width="80" height="34" rx="3" fill="#6fb3e6"></rect>
            <text x="60" y="150" text-anchor="middle" fill="#0b2438">これ</text>
            <rect x="106" y="128" width="46" height="34" rx="3" fill="#f0c674"></rect>
            <text x="129" y="150" text-anchor="middle" fill="#4a3211">は</text>
            <rect x="158" y="128" width="80" height="34" rx="3" fill="#e2685f"></rect>
            <text x="198" y="150" text-anchor="middle" fill="#2e0e0b">ほん</text>
            <rect x="244" y="128" width="70" height="34" rx="3" fill="#ffffff"></rect>
            <text x="279" y="150" text-anchor="middle" fill="#201d54">です</text>
          </g>
          <text x="20" y="180" font-size="10" fill="#c9a66b" font-family="VT323, DotGothic16, monospace">Kore wa hon desu. - "This is a book." (same 4 boxes, different topic + predicate)</text>
        </svg>
      `,
                        diagramCaption: "Same four boxes, every time — only what goes IN the topic and predicate boxes ever changes. は and です never move."
                    }, {
                        title: "Swap the cards — any topic, any predicate",
                        explain: "は and です never move — they're fixed. Everything else is a deck of interchangeable cards: pull any topic card, pull any predicate card, drop them into the same two slots. That's exactly why the exercise below accepts any word from the word bank instead of one baked-in answer.",
                        diagramSvg: `
        <svg viewBox="0 0 560 190" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:auto; display:block;">
          <text x="10" y="20" font-size="11" fill="#c9a66b" font-family="VT323, DotGothic16, monospace" letter-spacing="1">SWAP THE CARDS - TOPIC AND PREDICATE ARE INTERCHANGEABLE</text>

          <g font-family="VT323, DotGothic16, monospace" font-size="15">
            <rect x="34" y="58" width="96" height="38" rx="4" fill="#6fb3e6" opacity=".3"></rect>
            <rect x="26" y="64" width="96" height="38" rx="4" fill="#6fb3e6" opacity=".6"></rect>
            <rect x="18" y="70" width="96" height="38" rx="4" fill="#6fb3e6"></rect>
            <text x="66" y="94" text-anchor="middle" fill="#0b2438">わたし</text>
          </g>
          <text x="66" y="126" text-anchor="middle" font-size="9" fill="#c9a66b" font-family="Space Mono, monospace">any topic card</text>

          <rect x="150" y="70" width="46" height="38" rx="4" fill="#f0c674"></rect>
          <text x="173" y="94" text-anchor="middle" font-size="15" fill="#4a3211" font-family="VT323, DotGothic16, monospace">は</text>
          <text x="173" y="126" text-anchor="middle" font-size="9" fill="#c9a66b" font-family="Space Mono, monospace">always は</text>

          <g font-family="VT323, DotGothic16, monospace" font-size="15">
            <rect x="230" y="58" width="112" height="38" rx="4" fill="#e2685f" opacity=".3"></rect>
            <rect x="222" y="64" width="112" height="38" rx="4" fill="#e2685f" opacity=".6"></rect>
            <rect x="214" y="70" width="112" height="38" rx="4" fill="#e2685f"></rect>
            <text x="270" y="94" text-anchor="middle" fill="#2e0e0b">がくせい</text>
          </g>
          <text x="270" y="126" text-anchor="middle" font-size="9" fill="#c9a66b" font-family="Space Mono, monospace">any predicate card</text>

          <rect x="360" y="70" width="60" height="38" rx="4" fill="#ffffff"></rect>
          <text x="390" y="94" text-anchor="middle" font-size="15" fill="#201d54" font-family="VT323, DotGothic16, monospace">です</text>
          <text x="390" y="126" text-anchor="middle" font-size="9" fill="#c9a66b" font-family="Space Mono, monospace">always です</text>

          <text x="10" y="160" font-size="10" fill="#c9a66b" font-family="VT323, DotGothic16, monospace">わたしはがくせいです ・ これはほんです ・ たなかさんはせんせいです</text>
          <text x="10" y="178" font-size="10" fill="#c9a66b" font-family="VT323, DotGothic16, monospace">— every one of these is the SAME sentence with different cards in the same two slots.</text>
        </svg>
      `,
                        diagramCaption: "The word bank below is exactly this deck — pick any topic card and any predicate card, and the sentence is correct."
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
            /* Free word-choice: earlier versions baked in one randomly-picked
               subject/predicate as the ONLY accepted answer, which meant a
               grammatically correct sentence using a different word from the
               same word bank (or a word carried over from an earlier lesson,
               e.g. a name from this lesson reused in shelf 04+) was marked
               wrong. A は B です has no grammatical link tying one specific
               subject to one specific predicate, so any non-empty subject +
               predicate is graded via `pattern` instead of one fixed
               `accepted` string — subj/pred1/pred2 below are kept only to
               build a concrete worked example for the hint text. */
            buildWordBankExercises: function () {
                let subj = pick(this.wordBank.subjects);
                let pred1 = pick(this.wordBank.peoplePredicates);
                let pred2 = pick(this.wordBank.thingPredicates);
                let thingSubj = this.wordBank.thingSubjects[0];
                return [
                    {
                        prompt: "Write a sentence using <strong>A は B です</strong> to say who someone is (e.g. \"I am a student\" or \"Tanaka is a teacher\"). Feel free to pick any word from the word bank below — from this lesson, or an earlier one.",
                        pattern: /^.+は.+です$/,
                        hint: "Pattern: [someone] + は + [what they are] + です — e.g. " + subj.jp + "は" + pred1.jp + "です",
                        refWords: [
                            { jp: "は", role: "particle" }, { jp: "です", role: "auxiliary" }
                        ].concat(this.wordBank.subjects.map(function (w) { return { jp: w.jp, role: "subject" }; }))
                            .concat(this.wordBank.peoplePredicates.map(function (w) { return { jp: w.jp, role: "predicate" }; }))
                    },
                    {
                        prompt: "Write a sentence using <strong>これは B です</strong> to say what something is (e.g. \"This is a book\"). Feel free to pick any word from the word bank below — from this lesson, or an earlier one.",
                        pattern: /^これは.+です$/,
                        hint: "Pattern: これ + は + [thing] + です — e.g. これは" + pred2.jp + "です",
                        refWords: [
                            { jp: thingSubj.jp, role: "subject" }, { jp: "は", role: "particle" }, { jp: "です", role: "auxiliary" }
                        ].concat(this.wordBank.thingPredicates.map(function (w) { return { jp: w.jp, role: "predicate" }; }))
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
                newWords: [
                    { jp: "いしゃ", en: "doctor" }, { jp: "かいしゃいん", en: "office worker" }, { jp: "しゅふ", en: "homemaker" },
                    { jp: "わかい", en: "young" }, { jp: "やさしい", en: "kind / gentle" }
                ],
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
                    /* Ported verbatim from the Adventure Room's shelf-04
                       LESSON_CONTENT (the same self-intro exchange,
                       'conversation' page type) — text/romaji unchanged,
                       just with the fixed sensei=black/player=orange
                       casting per Study Room's own convention (see
                       CONV_ACTION_SPRITES) instead of the Adventure
                       Room's dynamic per-player color resolution, and the
                       hardcoded name "レイヤ" swapped for this lesson's own
                       randomly-picked `nm` (already used by the examples
                       below) so the dialogue matches whichever name the
                       player is seeing everywhere else on this page. */
                    conversation: {
                        turns: [
                            {
                                speaker: "sensei", name: "Neko-sensei", action: "meow", actionLabel: "*meows*",
                                text: "はじめまして。<span class=\"conv-hl conv-hl--subject\">お名前</span><span class=\"conv-hl conv-hl--particle\">は</span><span class=\"conv-hl conv-hl--predicate\">何</span><span class=\"conv-hl conv-hl--copula\">です</span><span class=\"conv-hl conv-hl--particle\">か</span>。",
                                romaji: "Hajimemashite. O-namae wa nan desu ka. — \"How do you do. What is your name?\""
                            },
                            {
                                speaker: "player", name: "You", action: "tailwagLeft", actionLabel: "*tail wags*",
                                text: "わたしは" + nm.jp + "です。",
                                romaji: "Watashi wa " + nm.jp + " desu. — \"I am " + nm.en + ".\""
                            },
                            {
                                speaker: "sensei", name: "Neko-sensei", action: "meow", actionLabel: "*meows*",
                                text: nm.jp + "さん、よろしくお願いします！",
                                romaji: nm.jp + "-san, yoroshiku onegaishimasu! — \"Nice to meet you, " + nm.en + "!\""
                            }
                        ]
                    },
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
                        /* よろしくお願いします's 願 is the one kanji this
                           very-early lesson would otherwise require —
                           accepting the all-hiragana spelling too, same as
                           shelves 15/16 do for their own kanji. */
                        prompt: "Write: <strong>Nice to meet you</strong>",
                        accepted: [["よろしくお願いします"], ["よろしくおねがいします"], ["はじめまして"]],
                        hint: "よろしくお願いします (よろしくおねがいします)",
                        refWords: [{ jp: "よろしくお願いします", role: "greeting" }]
                    },
                    /* Capstone: a genuinely free-write jiko-shoukai, not a
                       fixed-answer blank — there's no single "correct"
                       self-introduction, so this skips accepted/pattern
                       grading entirely (see checkAnswer()'s openEnded
                       branch). validate() just checks for a real attempt
                       (です present, more than a couple characters) rather
                       than grading content, since anything beyond that
                       would need real language understanding this engine
                       doesn't have. */
                    {
                        prompt: "Now write your own <strong>自己紹介 (jikoshoukai)</strong> using what you've learned today — greeting, your name, and closing.",
                        openEnded: true,
                        validate: function (raw) { return raw.trim().length >= 8 && raw.indexOf("です") !== -1; },
                        hint: "はじめまして → わたしは [name] です → よろしくお願いします",
                        refWords: [
                            { jp: "はじめまして", role: "greeting" }, { jp: "わたし", role: "subject" },
                            { jp: "は", role: "particle" }, { jp: "です", role: "auxiliary" },
                            { jp: "よろしくお願いします", role: "greeting" }
                        ]
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
                newWords: [
                    { jp: "とけい", en: "clock / watch" }, { jp: "かばん", en: "bag" }, { jp: "さいふ", en: "wallet" },
                    { jp: "あかい", en: "red" }, { jp: "あおい", en: "blue" }
                ],
                preview: [{ jp: "だれ", en: "who", note: "Coming up in shelf 06 — question words + か" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "こそあど System",
                            explain: "Japanese picks 'this/that' based on distance, not just what the object is — like a 3-ring dartboard centered on YOU, the speaker: the bullseye ring is yours, the middle ring belongs to whoever you're talking to, and everything outside that is 'over there,' full stop. Two shapes per distance: これ/それ/あれ stand alone ('this one'), while この/その/あの attach directly in front of a noun ('this ___').",
                            pattern: '<span class="pattern-box__slot">This/That</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">です</span>',
                            /* Ported from n5-phaser-game.js's buildDemonstrativesDiagram(),
                               which is authored as a (playerColorId, senseiColorId) => string
                               function so the "YOU"/"LISTENER" cat portraits match whichever
                               cat color the player picked in the Adventure Room. Study Room
                               has no cat-color-select flow at all, so per the porting
                               instructions this is resolved once with fixed defaults
                               ('orange' for you, 'black' for the listener) instead of staying
                               a function — the color choice here is purely decorative (which
                               cat portrait shows), not part of the grammar point itself.
                               var(--lb-role-subject-bg) (この row-word color) is hardcoded to
                               its literal N5-theme value #6fb3e6 for the same reason as
                               shelf-03's diagram above; var(--jr-text-dim) (head/row-note
                               text) is instead pointed at this page's own
                               --term-text-dim token (see study-style.css's .study-room.
                               is-terminal block) so the diagram's captions read in the same
                               green terminal palette as the rest of the lesson panel. */
                            diagramSvg: '<div class="grammar-box__demo-grid">'
                                + '<div class="grammar-box__demo-head grammar-box__demo-head--word"></div>'
                                + '<div class="grammar-box__demo-head">YOU</div>'
                                + '<div class="grammar-box__demo-head">LISTENER</div>'
                                + '<div class="grammar-box__demo-head">FAR AWAY</div>'
                                + '<div class="grammar-box__demo-row-word" style="color:#6fb3e6;">これ</div>'
                                + '<div class="grammar-box__demo-cell"><div class="grammar-box__demo-track"></div><div class="grammar-box__demo-cat-pip" style="background-image:url(\'../../assets/images/avatars/talk-orange-64x64.png\');"></div><img class="grammar-box__demo-item-icon" src="../../assets/images/lesson/cattomouse-Original.png" alt="item"></div>'
                                + '<div class="grammar-box__demo-cell"><div class="grammar-box__demo-track"></div><div class="grammar-box__demo-cat-pip" style="background-image:url(\'../../assets/images/avatars/talk-black-64x64.png\');"></div></div>'
                                + '<div class="grammar-box__demo-cell"><div class="grammar-box__demo-track"></div></div>'
                                + '<div class="grammar-box__demo-row-note">kore — the item is right there <b>with you</b>.</div>'
                                + '<div class="grammar-box__demo-row-word" style="color:#6fb3e6;">それ</div>'
                                + '<div class="grammar-box__demo-cell"><div class="grammar-box__demo-track"></div><div class="grammar-box__demo-cat-pip" style="background-image:url(\'../../assets/images/avatars/talk-orange-64x64.png\');"></div></div>'
                                + '<div class="grammar-box__demo-cell"><div class="grammar-box__demo-track"></div><div class="grammar-box__demo-cat-pip" style="background-image:url(\'../../assets/images/avatars/talk-black-64x64.png\');"></div><img class="grammar-box__demo-item-icon" src="../../assets/images/lesson/cattomouse-Original.png" alt="item"></div>'
                                + '<div class="grammar-box__demo-cell"><div class="grammar-box__demo-track"></div></div>'
                                + '<div class="grammar-box__demo-row-note">sore — the item is over <b>with the listener</b>.</div>'
                                + '<div class="grammar-box__demo-row-word" style="color:#6fb3e6;">あれ</div>'
                                + '<div class="grammar-box__demo-cell"><div class="grammar-box__demo-track"></div><div class="grammar-box__demo-cat-pip" style="background-image:url(\'../../assets/images/avatars/talk-orange-64x64.png\');"></div></div>'
                                + '<div class="grammar-box__demo-cell"><div class="grammar-box__demo-track"></div><div class="grammar-box__demo-cat-pip" style="background-image:url(\'../../assets/images/avatars/talk-black-64x64.png\');"></div></div>'
                                + '<div class="grammar-box__demo-cell"><div class="grammar-box__demo-track"></div><img class="grammar-box__demo-item-icon" src="../../assets/images/lesson/cattomouse-Original.png" alt="item"></div>'
                                + '<div class="grammar-box__demo-row-note">are — far from <b>both of you</b>.</div>'
                                + '</div>',
                            diagramCaption: 'これ/それ/あれ always track distance from the SPEAKER — not from the object to "you" in general.'
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
                    /* Ported verbatim from the Adventure Room's shelf-05
                       LESSON_CONTENT (the それ/これ 'conversation' page),
                       fixed sensei=black/player=orange casting per Study
                       Room's own convention, role-subject spans converted
                       to conv-hl--subject. No name variable in scope for
                       this lesson (the original didn't reference one
                       either), so nothing to substitute. */
                    conversation: {
                        turns: [
                            {
                                speaker: "sensei", name: "Neko-sensei", action: "meow", actionLabel: "*meows*",
                                text: "<span class=\"conv-hl conv-hl--subject\">それ</span>はなんですか？",
                                romaji: "Sore wa nan desu ka? — \"What is that (by you)?\""
                            },
                            {
                                speaker: "player", name: "You", action: "tailwagLeft", actionLabel: "*tail wags*",
                                text: "<span class=\"conv-hl conv-hl--subject\">これ</span>はほんです。",
                                romaji: "Kore wa hon desu. — \"This is a book.\""
                            },
                            {
                                speaker: "sensei", name: "Neko-sensei", action: "meow", actionLabel: "*meows*",
                                text: "ありがとう！",
                                romaji: "Arigatou! — \"Thanks!\""
                            }
                        ]
                    },
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
                        /* Free word-choice on the noun (any noun from this
                           lesson or an earlier one) — the demonstrative
                           itself stays restricted to これ/それ/あれ since
                           that's what this exercise is actually practicing. */
                        prompt: "Write a sentence using <strong>A は B です</strong> with a demonstrative (これ/それ/あれ) to say what something is. Feel free to pick any noun from the word bank below — from this lesson, or an earlier one.",
                        pattern: /^(これ|それ|あれ)は.+です$/,
                        hint: "Pattern: [これ/それ/あれ] + は + [thing] + です — e.g. " + dem.jp + "は" + noun.jp + "です",
                        refWords: [
                            { jp: "これ", role: "demonstrative" }, { jp: "それ", role: "demonstrative" }, { jp: "あれ", role: "demonstrative" },
                            { jp: "は", role: "particle" }, { jp: "です", role: "auxiliary" }
                        ].concat(this.wordBank.nouns.map(function (w) { return { jp: w.jp, role: "predicate" }; }))
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
                newWords: [
                    { jp: "なまえ", en: "name" }, { jp: "じゅうしょ", en: "address" }, { jp: "しごと", en: "job" },
                    { jp: "むずかしい", en: "difficult" }, { jp: "かんたん", en: "easy / simple" }
                ],
                preview: [{ jp: "ひとつ", en: "one (thing)", note: "Coming up in shelf 07 — numbers & counters" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Statement + か？",
                            explain: "One tiny particle turns any calm statement into a question — nothing else moves, like the sound of a question mark. Two ways to use it: tack it onto a plain yes/no statement (これはほんです → これはほんですか, 'Is this a book?'), or tack it onto a sentence that already has a question word in it (せんせいはどこです → …どこですか, 'Where is the teacher?'). Either way, word order never changes — か always goes at the very end.",
                            pattern: '<span class="pattern-box__slot">Statement</span> <span class="pattern-box__fixed">か</span>',
                            /* Ported from n5-phaser-game.js's buildQuestionParticleDiagram
                               (a plain-HTML statement-vs-question comparison, not SVG) —
                               reuses the already-existing .conv-hl role spans (see study-
                               style.css) instead of the original's lesson-box-only
                               .lesson-box__qdiagram-tile/role-* classes, since conv-hl
                               already carries the identical N5-theme role colors. The
                               original's per-player cat portraits are decorative only
                               (same reasoning as s05's diagram) and dropped here rather
                               than hardcoding a color choice. */
                            diagramSvg: '<div style="display:flex;flex-direction:column;gap:10px;font-size:18px;">'
                                + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">'
                                + '<span style="min-width:82px;color:var(--term-text-dim,#c9a66b);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Statement</span>'
                                + '<span class="conv-hl conv-hl--subject">これ</span><span class="conv-hl conv-hl--particle">は</span><span class="conv-hl conv-hl--predicate">ほん</span><span class="conv-hl conv-hl--copula">です</span>'
                                + '</div>'
                                + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">'
                                + '<span style="min-width:82px;color:var(--term-text-dim,#c9a66b);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Question</span>'
                                + '<span class="conv-hl conv-hl--subject">これ</span><span class="conv-hl conv-hl--particle">は</span><span class="conv-hl conv-hl--predicate">ほん</span><span class="conv-hl conv-hl--copula">です</span><span class="conv-hl conv-hl--particle">か</span>'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "Same words, same order — か tacked onto the very end is the only difference between a statement and a question."
                        },
                        {
                            title: "Answering yes or no",
                            explain: "<strong>はい、そうです</strong> (hai, sou desu — 'yes, that's right') and <strong>いいえ、ちがいます</strong> (iie, chigaimasu — 'no, that's wrong') are the standard reply pair to any これ/それ/あれ-style yes/no question. ちがいます doesn't mean the other person lied — it just means the guess was off, so a correction (ほんです, 'it's a book') usually follows right after."
                        },
                        {
                            title: "Six more question words",
                            explain: "だれ (who) and いつ (when) attach exactly like どこ did in shelf 5 — swap it in, everything else stays put. どうして and なぜ both mean 'why,' but aren't interchangeable registers: どうして is what you'd actually say out loud to a friend, while なぜ leans formal/written — a news report or an essay reaches for なぜ, a conversation reaches for どうして. いくつ and いくら split the same way: いくつ counts small countable things ('how many apples?'), いくら asks a price ('how much is this?') — never mix the two up just because English uses 'how' for both."
                        }
                    ],
                    /* Ported verbatim from the Adventure Room's shelf-06
                       LESSON_CONTENT (the closing 'conversation' page),
                       fixed sensei=black/player=orange casting per Study
                       Room's own convention. No role-* spans in the
                       original and no name variable in scope for this
                       lesson, so nothing else to convert. */
                    conversation: {
                        turns: [
                            {
                                speaker: "player", name: "You", action: "tailwagRight", actionLabel: "*tail wags*",
                                text: "すみません、これはなんですか？",
                                romaji: "Sumimasen, kore wa nan desu ka? — \"Excuse me, what is this?\""
                            },
                            {
                                speaker: "sensei", name: "Neko-sensei", action: "meow", actionLabel: "*meows*",
                                text: "それはほんです。",
                                romaji: "Sore wa hon desu. — \"That is a book.\""
                            },
                            {
                                speaker: "player", name: "You", action: "tailwagLeft", actionLabel: "*tail wags*",
                                text: "そうですか！ありがとうございます。",
                                romaji: "Sou desu ka! Arigatou gozaimasu. — \"Oh, I see! Thank you.\""
                            }
                        ]
                    },
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

    /* SHELF 07 SPLIT — the original single "Numbers & Counters" lesson
       covered a lot of genuinely distinct number systems (plain counting,
       the つ series, the 匹 series, hours, minutes) in one page. Per
       explicit feedback ("there are a lot of types of numbers... properly
       section them out"), it's now three separate lessons — 07a/07b/07c —
       instead of one long one, mirroring how s02 already splits into
       s02/s02b/s02c. Each keeps its own wordBank/exercises/XP, chained
       together with the same preview-the-next-lesson pattern every other
       shelf uses. */

    /* SHELF 07a: Basic Numbers (1–100) */
    function s07a() {
        return {
            id: "s07a", title: "Basic Numbers", subtitle: "Shelf 07a",
            wordBank: {
                /* Curated rather than formula-generated — a live
                   tens+ones generator would need to pick a reading for
                   4/7/9 (よん/し, なな/しち, きゅう/く) with no context to
                   decide from; a fixed, pre-verified list sidesteps that
                   ambiguity entirely. */
                numbers: [
                    { n: "13", jp: "じゅうさん" }, { n: "20", jp: "にじゅう" }, { n: "35", jp: "さんじゅうご" },
                    { n: "47", jp: "よんじゅうなな" }, { n: "58", jp: "ごじゅうはち" }, { n: "100", jp: "ひゃく" }
                ],
                newWords: [{ jp: "おおい", en: "many" }, { jp: "すくない", en: "few" }],
                preview: [{ jp: "ひとつ", en: "one (general objects)", note: "Coming up in shelf 07b — つ & 匹 counters" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Basic Numbers — いち〜ひゃく",
                            explain: "Japanese numbers are built like Lego blocks — learn 1 through 10, and you can build every number up to 100 just by combining them. にじゅう (20) is just に (2) + じゅう (10) stuck together — 'two tens.' さんじゅうご (35) is さん (3) + じゅう (10) + ご (5) — 'three tens, five.' ひゃく (100) caps this set off. A few numbers have two readings depending on context — 4 is よん or し, 7 is なな or しち, 9 is きゅう or く — which reading wins depends on what comes next, covered in the next two lessons.",
                            pattern: '<span class="pattern-box__slot">Tens digit</span> <span class="pattern-box__fixed">じゅう</span> <span class="pattern-box__slot">Ones digit</span>'
                        },
                        {
                            title: "Counters — why the numbers change shape",
                            explain: "This is the part that trips people up next: いち・に・さん by themselves only work for pure counting ('1, 2, 3...') — the moment you're counting something specific, a counter word glues onto the number, and often changes its sound. English does a mild version of this too ('a slice of bread,' 'a herd of cattle') but Japanese counters are mandatory, not optional. The three you'll use constantly at N5 — つ (everyday objects), 匹 (small animals), and 時/分 (time) — each get their own lesson next, since they don't follow one shared rule.",
                            pattern: '<span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">Number + Counter</span> <span class="pattern-box__fixed">です</span>'
                        }
                    ],
                    examples: [
                        { jp: "にじゅうです", romaji: "Nijuu desu.", en: "It's 20." },
                        { jp: "さんじゅうごです", romaji: "Sanjuu go desu.", en: "It's 35." },
                        { jp: "ひゃくです", romaji: "Hyaku desu.", en: "It's 100." }
                    ],
                    vocab: [
                        { jp: "いち〜じゅう", romaji: "ichi–juu", en: "1–10" },
                        { jp: "にじゅう〜きゅうじゅう", romaji: "nijuu–kyuujuu", en: "20–90 (tens)" },
                        { jp: "ひゃく", romaji: "hyaku", en: "100" }
                    ],
                    sources: ["Tofugu numbers/counters guide", "Jisho.org"]
                };
            },
            buildWordBankExercises: function () {
                let n = pick(this.wordBank.numbers);
                return [
                    {
                        prompt: "Write the number: <strong>" + n.n + "</strong>",
                        accepted: [[n.jp]],
                        hint: n.jp,
                        refWords: [{ jp: n.jp, role: "neutral" }]
                    }
                ];
            }
        };
    }

    /* SHELF 07b: つ & 匹 Counters */
    function s07b() {
        return {
            id: "s07b", title: "つ & 人 Counters", subtitle: "Shelf 07b",
            wordBank: {
                nouns: [{ jp: "りんご", en: "apple" }, { jp: "がくせい", en: "student" }],
                counters: [{ jp: "ひとつ", en: "one" }, { jp: "さんにん", en: "three" }],
                newWords: [{ jp: "たまご", en: "egg" }, { jp: "さかな", en: "fish" }],
                preview: [{ jp: "よじ", en: "4 o'clock", note: "Coming up in shelf 07c — telling time" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "つ counter — everyday objects",
                            explain: "When you count everyday objects — apples, boxes, cups, anything without its own special counter — Japanese uses an entirely different, older set of number words ending in つ. This 'つ series' only goes up to 10 — for 11 and higher, people just switch back to the plain numbers. ひとつ, ふたつ, みっつ... these don't look like いち, に, さん at all — they're their own set to memorize. パン (bread) is exactly this kind of plain object, so it takes the same つ series as りんご below — never いち, に, さん directly; いち is a pure counting number, not a counter for objects on its own.",
                            pattern: '<span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">Number + つ</span> <span class="pattern-box__fixed">です</span>',
                            diagramSvg: (function () {
                                var counts = [
                                    "ひとつ|hitotsu", "ふたつ|futatsu", "みっつ|mittsu", "よっつ|yottsu", "いつつ|itsutsu",
                                    "むっつ|muttsu", "ななつ|nanatsu", "やっつ|yattsu", "ここのつ|kokonotsu", "とお|too"
                                ];
                                var rows = counts.map(function (entry, i) {
                                    var n = i + 1;
                                    var parts = entry.split("|");
                                    var imgs = "";
                                    for (var k = 1; k <= n; k++) {
                                        imgs += '<img src="../../assets/images/lesson/transparent/bread' + k + '.png" alt="bread">';
                                    }
                                    return '<div class="grammar-box__bread-row">'
                                        + '<div class="grammar-box__bread-imgs">' + imgs + '</div>'
                                        + '<div class="grammar-box__bread-label"><span class="jp">' + parts[0] + '</span><span class="romaji">' + parts[1] + ' — ' + n + '</span></div>'
                                        + '</div>';
                                }).join('');
                                return '<div class="grammar-box__bread-stack">' + rows + '</div>';
                            })(),
                            diagramCaption: "パンが ひとつ あります。 (Pan ga hitotsu arimasu. — \"There is one piece of bread.\") Each row below adds one more — count them and read the label."
                        },
                        {
                            title: "人 counter — counting people",
                            explain: "People get their own counter too, and it starts out irregular: 1 and 2 people are their own special words — ひとり, ふたり — that don't even contain a number you'd recognize. From 3 people on, it settles into a normal pattern, [number]+にん: さんにん, よにん (not よんにん!), ごにん... 7 people can be しちにん or ななにん, both fine.",
                            pattern: '<span class="pattern-box__slot">Group</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">Number + 人</span> <span class="pattern-box__fixed">です</span>',
                            // person.png now sits inside the ひとり row itself instead of a
                            // separate strip above the table, per feedback to keep every
                            // counter-example photo attached to its own row.
                            diagramSvg: '<table class="grammar-box__counter-table"><tbody>'
                                + '<tr><td class="jp">ひとり</td><td>hitori</td><td class="counter-count">1</td><td class="counter-photo"><img src="../../assets/images/lesson/transparent/person.png" alt="person"></td></tr>'
                                + '<tr><td class="jp">ふたり</td><td>futari</td><td class="counter-count">2</td><td class="counter-photo"></td></tr>'
                                + '<tr><td class="jp">さんにん</td><td>sannin</td><td class="counter-count">3</td><td class="counter-photo"></td></tr>'
                                + '<tr><td class="jp">よにん</td><td>yonin</td><td class="counter-count">4</td><td class="counter-photo"></td></tr>'
                                + '<tr><td class="jp">ごにん</td><td>gonin</td><td class="counter-count">5</td><td class="counter-photo"></td></tr>'
                                + '<tr><td class="jp">ろくにん</td><td>rokunin</td><td class="counter-count">6</td><td class="counter-photo"></td></tr>'
                                + '<tr><td class="jp">しちにん・ななにん</td><td>shichinin / nananin</td><td class="counter-count">7</td><td class="counter-photo"></td></tr>'
                                + '<tr><td class="jp">はちにん</td><td>hachinin</td><td class="counter-count">8</td><td class="counter-photo"></td></tr>'
                                + '<tr><td class="jp">きゅうにん</td><td>kyuunin</td><td class="counter-count">9</td><td class="counter-photo"></td></tr>'
                                + '<tr><td class="jp">じゅうにん</td><td>juunin</td><td class="counter-count">10</td><td class="counter-photo"></td></tr>'
                                + '</tbody></table>',
                            diagramCaption: "がくせいは さんにんです。 (Gakusei wa sannin desu. — \"There are three students.\") Only 1 and 2 people break the pattern — everything from 3 up is just [number]+にん."
                        }
                    ],
                    examples: [
                        { jp: "りんごはひとつです", romaji: "Ringo wa hitotsu desu.", en: "There is one apple." },
                        { jp: "りんごはみっつです", romaji: "Ringo wa mittsu desu.", en: "There are three apples." },
                        { jp: "がくせいはひとりです", romaji: "Gakusei wa hitori desu.", en: "There is one student." },
                        { jp: "がくせいはさんにんです", romaji: "Gakusei wa sannin desu.", en: "There are three students." }
                    ],
                    vocab: [
                        { jp: "ひとつ〜とお", romaji: "hitotsu–too", en: "1–10 (general-things つ counter)" },
                        { jp: "ひとり・ふたり・さんにん〜じゅうにん", romaji: "hitori, futari, sannin–juunin", en: "1–10 (people 人 counter)" }
                    ],
                    sources: ["Tofugu numbers/counters guide", "Jisho.org"]
                };
            },
            /* Noun i is paired with counter i — the noun/counter pairing is
               fixed, only which pair gets asked is random. */
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

    /* SHELF 07c: Telling Time */
    function s07c() {
        return {
            id: "s07c", title: "Telling Time", subtitle: "Shelf 07c",
            wordBank: {
                nouns: [{ jp: "いま", en: "it (now)" }],
                times: [
                    { jp: "よじ", en: "4 o'clock" }, { jp: "くじ", en: "9 o'clock" }, { jp: "さんじじゅっぷん", en: "3:10" }
                ],
                newWords: [{ jp: "くるま", en: "car" }, { jp: "あさ", en: "morning" }, { jp: "よる", en: "night" }],
                preview: [{ jp: "あります", en: "there is (things)", note: "Coming up in shelf 08a — there is/are & places" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "時 (hour) — telling time, part 1",
                            explain: "To say 'o'clock,' attach 時 (じ) directly after the number. Most hours use the plain number readings — but 4, 7, and 9 o'clock swap to special readings: よじ (not よんじ), しちじ (not ななじ), くじ (not きゅうじ). These three exceptions are worth memorizing on their own — they show up constantly.",
                            pattern: '<span class="pattern-box__slot">Number</span> <span class="pattern-box__fixed">時</span>'
                        },
                        {
                            title: "分 (minute) — telling time, part 2",
                            explain: "Minutes attach the same way as hours — but 分's sound shifts around even more than 匹's did, reading ふん or ぷん depending on the number before it (いっぷん, にふん, さんぷん...). 'What minute?' is 何分 (なんぷん). Put both halves together and you can tell any time: さんじじゅっぷん — '3:10.'",
                            pattern: '<span class="pattern-box__slot">Hour</span> <span class="pattern-box__fixed">時</span> <span class="pattern-box__slot">Minute</span> <span class="pattern-box__fixed">分</span>'
                        }
                    ],
                    /* Ported verbatim from the Adventure Room's shelf-07
                       LESSON_CONTENT conversation, trimmed to just its
                       time-question half — the original's second half
                       (なんびき, counting cats) now belongs to shelf 07b
                       instead, so it's not repeated here. */
                    conversation: {
                        turns: [
                            {
                                speaker: "player", name: "You", action: "tailwagRight", actionLabel: "*tail wags*",
                                text: "すみません、いまなんじですか？",
                                romaji: "Sumimasen, ima nanji desu ka? — \"Excuse me, what time is it now?\""
                            },
                            {
                                speaker: "sensei", name: "Neko-sensei", action: "meow", actionLabel: "*meows*",
                                text: "いまさんじじゅっぷんです。",
                                romaji: "Ima sanji juppun desu. — \"It's 3:10 now.\""
                            }
                        ]
                    },
                    examples: [
                        { jp: "いまはよじです", romaji: "Ima wa yoji desu.", en: "It's 4 o'clock now." },
                        { jp: "いまはくじです", romaji: "Ima wa kuji desu.", en: "It's 9 o'clock now." },
                        { jp: "いまはさんじじゅっぷんです", romaji: "Ima wa sanji juppun desu.", en: "It's 3:10 now." }
                    ],
                    vocab: [
                        { jp: "いちじ〜じゅうにじ", romaji: "ichiji–juuniji", en: "1:00–12:00 (hours)" },
                        { jp: "いっぷん〜じゅっぷん、なんぷん", romaji: "ippun–juppun, nanpun", en: "minutes, and 'what minute?'" }
                    ],
                    sources: ["Tofugu numbers/counters guide", "Jisho.org"]
                };
            },
            /* No bonus exercise: shelf 08a's あります/います needs its own
               location grammar — preview stays exposure-only. */
            buildWordBankExercises: function () {
                let wb = this.wordBank;
                let noun = wb.nouns[0];
                let time = pick(wb.times);
                return [
                    {
                        prompt: "Write: <strong>It's now — " + time.en + "</strong>",
                        accepted: [[noun.jp, "は", time.jp, "です"]],
                        hint: noun.jp + "は" + time.jp + "です",
                        refWords: [
                            { jp: noun.jp, role: "subject" }, { jp: "は", role: "particle" },
                            { jp: time.jp, role: "counter" }, { jp: "です", role: "auxiliary" }
                        ]
                    }
                ];
            }
        };
    }

    /* SHELF 07d: Counters for Animals — split out of 07b per explicit
       feedback ("counter for animals needs to be properly explained and
       sectioned out, put it on a different page") — 匹 alone doesn't tell
       the whole story (it's specifically SMALL animals), so this covers
       all three animal-size counters together instead of just one. */
    function s07d() {
        return {
            id: "s07d", title: "Counters for Animals", subtitle: "Shelf 07d",
            wordBank: {
                small: [{ jp: "ねこ", en: "cat" }, { jp: "いぬ", en: "dog" }, { jp: "さかな", en: "fish" }],
                large: [{ jp: "うし", en: "cow" }, { jp: "うま", en: "horse" }, { jp: "ぞう", en: "elephant" }],
                birds: [{ jp: "とり", en: "bird" }, { jp: "うさぎ", en: "rabbit" }],
                newWords: [{ jp: "どうぶつ", en: "animal" }, { jp: "どうぶつえん", en: "zoo" }],
                preview: [{ jp: "冊", en: "counter for books", note: "Coming up in shelf 07e — counters for things" }]
            },
            buildInstruction: function () {
                // r[3], when present, is a transparent/ image name shown inline in that
                // row's own trailing photo cell -- keeps the example photo attached to
                // the exact row it illustrates instead of a separate strip above the
                // table (per feedback: a shared photo strip made it hard to tell which
                // picture belonged to which row).
                function table(rows) {
                    return '<table class="grammar-box__counter-table"><tbody>' + rows.map(function (r) {
                        var photo = r[3] ? '<img src="../../assets/images/lesson/transparent/' + r[3] + '.png" alt="' + r[3] + '">' : '';
                        return '<tr><td class="jp">' + r[0] + '</td><td>' + r[1] + '</td><td class="counter-count">' + r[2] + '</td><td class="counter-photo">' + photo + '</td></tr>';
                    }).join('') + '</tbody></table>';
                }
                return {
                    sections: [
                        {
                            title: "匹 — small animals",
                            explain: "匹 (hiki) covers small animals: cats, dogs, fish, insects, mice — basically anything that comfortably fits in your arms or smaller. Its sound shifts constantly, the same way 匹 already did back in shelf 07b's brief mention — ひき, びき, or ぴき depending on the number before it.",
                            pattern: '<span class="pattern-box__slot">Small animal</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">Number + 匹</span> <span class="pattern-box__fixed">です</span>',
                            diagramSvg: table([
                                ["いっぴき", "ippiki", "1", "cat"], ["にひき", "nihiki", "2"], ["さんびき", "sanbiki", "3"], ["よんひき", "yonhiki", "4"], ["ごひき", "gohiki", "5"],
                                ["ろっぴき", "roppiki", "6"], ["ななひき", "nanahiki", "7"], ["はっぴき", "happiki", "8"], ["きゅうひき", "kyuuhiki", "9"], ["じゅっぴき", "juppiki", "10"]
                            ]),
                            diagramCaption: "ねこは さんびきです。 (Neko wa sanbiki desu. — \"There are three cats.\")"
                        },
                        {
                            title: "頭 — large animals",
                            explain: "頭 (tou) takes over once an animal is too big to comfortably pick up: cows, horses, elephants, whales. Its readings are much more regular than 匹's — mostly just [number]+とう, with the usual small-つ doubling on 1, 8, and 10.",
                            pattern: '<span class="pattern-box__slot">Large animal</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">Number + 頭</span> <span class="pattern-box__fixed">です</span>',
                            diagramSvg: table([
                                ["いっとう", "ittou", "1", "elephant"], ["にとう", "nitou", "2"], ["さんとう", "santou", "3"], ["よんとう", "yontou", "4"], ["ごとう", "gotou", "5"],
                                ["ろくとう", "rokutou", "6"], ["ななとう", "nanatou", "7"], ["はっとう", "hattou", "8"], ["きゅうとう", "kyuutou", "9"], ["じゅっとう", "juttou", "10"]
                            ]),
                            diagramCaption: "うしは にとうです。 (Ushi wa nitou desu. — \"There are two cows.\")"
                        },
                        {
                            title: "羽 — birds (and, oddly, rabbits)",
                            explain: "羽 (wa) counts birds — but Japanese has historically counted rabbits with 羽 too, not 匹. Nobody's fully sure why (one common explanation: rabbits were counted this way to sidestep old religious restrictions on eating four-legged animals), but it's a real, current N5-relevant fact: うさぎ takes 羽, not 匹.",
                            pattern: '<span class="pattern-box__slot">Bird (or rabbit!)</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">Number + 羽</span> <span class="pattern-box__fixed">です</span>',
                            diagramSvg: table([
                                ["いちわ", "ichiwa", "1", "bird"], ["にわ", "niwa", "2"], ["さんわ", "sanwa", "3"], ["よんわ", "yonwa", "4"], ["ごわ", "gowa", "5"],
                                ["ろくわ", "rokuwa", "6"], ["ななわ", "nanawa", "7"], ["はちわ", "hachiwa", "8"], ["きゅうわ", "kyuuwa", "9"], ["じゅうわ", "juuwa", "10"]
                            ]),
                            diagramCaption: "うさぎは いちわです。 (Usagi wa ichiwa desu. — \"There is one rabbit.\") Yes — 羽, the bird counter, not 匹."
                        }
                    ],
                    examples: [
                        { jp: "ねこはいっぴきです", romaji: "Neko wa ippiki desu.", en: "There is one cat." },
                        { jp: "うまはさんとうです", romaji: "Uma wa santou desu.", en: "There are three horses." },
                        { jp: "とりはにわです", romaji: "Tori wa niwa desu.", en: "There are two birds." },
                        { jp: "うさぎはよんわです", romaji: "Usagi wa yonwa desu.", en: "There are four rabbits." }
                    ],
                    vocab: [
                        { jp: "匹", romaji: "hiki/biki/piki", en: "counter — small animals" },
                        { jp: "頭", romaji: "tou", en: "counter — large animals" },
                        { jp: "羽", romaji: "wa", en: "counter — birds (and rabbits)" },
                        { jp: "うし", romaji: "ushi", en: "cow" }, { jp: "うま", romaji: "uma", en: "horse" },
                        { jp: "ぞう", romaji: "zou", en: "elephant" }, { jp: "とり", romaji: "tori", en: "bird" },
                        { jp: "うさぎ", romaji: "usagi", en: "rabbit" }
                    ],
                    sources: ["Tofugu numbers/counters guide", "Jisho.org"]
                };
            },
            buildWordBankExercises: function () {
                var wb = this.wordBank;
                var groups = [
                    { list: wb.small, counter: "匹", readings: ["いっぴき", "にひき", "さんびき"] },
                    { list: wb.large, counter: "頭", readings: ["いっとう", "にとう", "さんとう"] },
                    { list: wb.birds, counter: "羽", readings: ["いちわ", "にわ", "さんわ"] }
                ];
                var group = groups[Math.floor(Math.random() * groups.length)];
                var animal = pick(group.list);
                var reading = pick(group.readings);
                return [
                    {
                        prompt: "Write: <strong>" + animal.en.charAt(0).toUpperCase() + animal.en.slice(1) + " — " + reading + "</strong>",
                        accepted: [[animal.jp, "は", reading, "です"]],
                        hint: animal.jp + "は" + reading + "です",
                        refWords: [
                            { jp: animal.jp, role: "subject" }, { jp: "は", role: "particle" },
                            { jp: reading, role: "counter" }, { jp: "です", role: "auxiliary" }
                        ]
                    }
                ];
            }
        };
    }

    /* SHELF 07e: Counters for Things — split out of 07a/07b per explicit
       feedback ("counter for things a different page again"). N5/N4-level
       object counters, one per shape/category. */
    function s07e() {
        return {
            id: "s07e", title: "Counters for Things", subtitle: "Shelf 07e",
            wordBank: {
                items: [
                    { jp: "ほん", en: "book", counter: "冊", reading: "いっさつ" },
                    { jp: "りんご", en: "apple", counter: "個", reading: "いっこ" },
                    { jp: "ペン", en: "pen", counter: "本", reading: "いっぽん" },
                    { jp: "かみ", en: "paper", counter: "枚", reading: "いちまい" },
                    { jp: "くるま", en: "car", counter: "台", reading: "いちだい" },
                    { jp: "くつ", en: "shoes (a pair)", counter: "足", reading: "いっそく" },
                    { jp: "コーヒー", en: "cup of coffee", counter: "杯", reading: "いっぱい" }
                ],
                newWords: [{ jp: "かみ", en: "paper" }, { jp: "くつ", en: "shoes" }],
                preview: [{ jp: "回", en: "counter for times/occurrences", note: "Coming up later — verb frequency" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "One counter per shape",
                            explain: "Objects get sorted into counters by SHAPE or CATEGORY, not by what they're made of — a rolled-up poster and a pencil use the same counter (本) because they're both long and thin, even though they have nothing else in common. Learn the shape, not the object.",
                            pattern: '<span class="pattern-box__slot">Thing</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">Number + counter</span> <span class="pattern-box__fixed">です</span>',
                            // Each real photo now sits inside its OWN row's trailing cell
                            // instead of one bunched row above the table -- per explicit
                            // feedback that a shared photo strip made it hard to tell which
                            // picture belonged to which counter. blender.png dropped (too
                            // visually similar to tv.png for the same 台 row); car + tv both
                            // stay, shown side by side in that one row's photo cell.
                            diagramSvg: '<table class="grammar-box__counter-table"><tbody>'
                                + '<tr><td class="jp">冊</td><td>satsu</td><td class="counter-desc">bound things — books, magazines, notebooks</td><td class="counter-photo"><img src="../../assets/images/lesson/transparent/book.png" alt="book"></td></tr>'
                                + '<tr><td class="jp">個</td><td>ko</td><td class="counter-desc">small round/general objects — apples, boxes, candy</td><td class="counter-photo"></td></tr>'
                                + '<tr><td class="jp">本</td><td>hon/bon/pon</td><td class="counter-desc">long, thin things — pens, bottles, umbrellas</td><td class="counter-photo"><img src="../../assets/images/lesson/transparent/pencil.png" alt="pencil"></td></tr>'
                                + '<tr><td class="jp">枚</td><td>mai</td><td class="counter-desc">flat, thin things — paper, tickets, plates, shirts</td><td class="counter-photo"></td></tr>'
                                + '<tr><td class="jp">台</td><td>dai</td><td class="counter-desc">machines &amp; vehicles — cars, computers, TVs</td><td class="counter-photo"><img src="../../assets/images/lesson/transparent/car.png" alt="car"><img src="../../assets/images/lesson/transparent/tv.png" alt="TV"></td></tr>'
                                + '<tr><td class="jp">足</td><td>soku</td><td class="counter-desc">pairs of footwear — shoes, socks</td><td class="counter-photo"><img src="../../assets/images/lesson/transparent/shoes.png" alt="shoes"></td></tr>'
                                + '<tr><td class="jp">杯</td><td>hai/bai/pai</td><td class="counter-desc">cup/glass/bowlfuls of something</td><td class="counter-photo"></td></tr>'
                                + '<tr><td class="jp">回</td><td>kai</td><td class="counter-desc">times / occurrences something happens</td><td class="counter-photo"></td></tr>'
                                + '</tbody></table>',
                            diagramCaption: "本は いっさつです。 (Hon wa issatsu desu. — \"There is one book.\") Same [Thing]は[Number+counter]です pattern every time — only the counter changes."
                        },
                        {
                            title: "Sound changes to watch for",
                            explain: "本, 杯, and 匹 all shift sound the same three ways depending on the number before them — 1, 6, 8, 10 usually trigger a small-つ doubling (いっぽん, ろっぽん, はっぽん, じゅっぽん), while 3 often voices the counter (さんぼん, さんばい). 個, 枚, and 台 stay simple and regular the whole way through — いっこ, にこ, さんこ..."
                        }
                    ],
                    examples: [
                        { jp: "ほんはいっさつです", romaji: "Hon wa issatsu desu.", en: "There is one book." },
                        { jp: "ペンはにほんです", romaji: "Pen wa nihon desu.", en: "There are two pens." },
                        { jp: "かみはさんまいです", romaji: "Kami wa sanmai desu.", en: "There are three sheets of paper." },
                        { jp: "くるまはいちだいです", romaji: "Kuruma wa ichidai desu.", en: "There is one car." }
                    ],
                    vocab: [
                        { jp: "冊", romaji: "satsu", en: "counter — bound things" }, { jp: "個", romaji: "ko", en: "counter — small objects" },
                        { jp: "本", romaji: "hon", en: "counter — long thin things" }, { jp: "枚", romaji: "mai", en: "counter — flat thin things" },
                        { jp: "台", romaji: "dai", en: "counter — machines/vehicles" }, { jp: "足", romaji: "soku", en: "counter — pairs of footwear" },
                        { jp: "杯", romaji: "hai", en: "counter — cups/glasses" }, { jp: "回", romaji: "kai", en: "counter — times/occurrences" }
                    ],
                    sources: ["Tofugu numbers/counters guide", "Jisho.org"]
                };
            },
            buildWordBankExercises: function () {
                var item = pick(this.wordBank.items);
                return [
                    {
                        prompt: "Write: <strong>" + item.en.charAt(0).toUpperCase() + item.en.slice(1) + " — one</strong>",
                        accepted: [[item.jp, "は", item.reading, "です"]],
                        hint: item.jp + "は" + item.reading + "です",
                        refWords: [
                            { jp: item.jp, role: "subject" }, { jp: "は", role: "particle" },
                            { jp: item.reading, role: "counter" }, { jp: "です", role: "auxiliary" }
                        ]
                    }
                ];
            }
        };
    }

    /* SHELF 08 SPLIT — same reasoning as shelf 07's split above: "Places &
       Directions" bundled a lot of genuinely distinct content (existence,
       place vocab, relative-position words, grammar mechanics, movement,
       the compass) into one long lesson. Per explicit feedback ("same
       with places and directions... place another subsection"), it's now
       three separate lessons — 08a/08b/08c. */

    /* SHELF 08a: There Is/Are & Places */
    function s08a() {
        return {
            id: "s08a", title: "There Is/Are", subtitle: "Shelf 08a",
            wordBank: {
                subjects: [
                    { jp: "ねこ", en: "the cat", verb: "います" },
                    { jp: "ほん", en: "the book", verb: "あります" },
                    { jp: "せんせい", en: "the teacher", verb: "います" }
                ],
                places: [{ jp: "こうえん", en: "the park" }, { jp: "としょかん", en: "the library" }, { jp: "がっこう", en: "school" }],
                newWords: [
                    { jp: "ゆうびんきょく", en: "post office" }, { jp: "えいがかん", en: "movie theater" }, { jp: "にぎやか", en: "lively / bustling" }
                ],
                preview: [{ jp: "前", en: "in front of", note: "Coming up in shelf 08b — direction words" }]
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
                            title: "Location — where exactly is it?",
                            explain: "Two full worked examples of the pattern above, one for each verb: a cat (alive, いる) inside a box, and bread (an object, ある) inside a basket. Same grammar, different verb — the picture is the fastest way to see why.",
                            diagramSvg: '<div class="grammar-box__location">'
                                + '<div class="grammar-box__location-item">'
                                + '<div class="grammar-box__location-scene"><img src="../../assets/images/lesson/transparent/cat-in-box.png" alt="cat inside the box"></div>'
                                + '<div class="grammar-box__location-text">'
                                + '<div class="jp-lg">ねこは はこの 中に います。</div>'
                                + '<div class="kana-sm">neko wa hako no naka ni imasu</div>'
                                + '<div class="en-sm">"The cat is inside the box." — います, because ねこ is alive and could walk away.</div>'
                                + '</div>'
                                + '</div>'
                                + '<div class="grammar-box__location-item">'
                                + '<div class="grammar-box__location-scene"><img src="../../assets/images/lesson/transparent/basket.png" alt="bread inside a basket"></div>'
                                + '<div class="grammar-box__location-text">'
                                + '<div class="jp-lg">かごの 中に パンが あります。</div>'
                                + '<div class="kana-sm">kago no naka ni pan ga arimasu</div>'
                                + '<div class="en-sm">"There is bread inside the basket." — あります, because bread can\'t get up and walk away.</div>'
                                + '</div>'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "Same pattern either way: [thing] は/が [place/container] に あります／います — only the verb changes, and only based on whether the thing itself could get up and move."
                        }
                    ],
                    examples: [
                        { jp: "ねこはこうえんにいます", romaji: "Neko wa kouen ni imasu.", en: "The cat is at the park." },
                        { jp: "ほんはとしょかんにあります", romaji: "Hon wa toshokan ni arimasu.", en: "The book is at the library." },
                        { jp: "せんせいはがっこうにいます", romaji: "Sensei wa gakkou ni imasu.", en: "The teacher is at school." }
                    ],
                    vocab: [
                        { jp: "はこ", romaji: "hako", en: "box" }, { jp: "かご", romaji: "kago", en: "basket" }, { jp: "パン", romaji: "pan", en: "bread" },
                        { jp: "こうえん", romaji: "kouen", en: "park" }, { jp: "としょかん", romaji: "toshokan", en: "library" }, { jp: "がっこう", romaji: "gakkou", en: "school" },
                        { jp: "あります", romaji: "arimasu", en: "there is (things, places)" }, { jp: "います", romaji: "imasu", en: "there is (people, animals)" }
                    ],
                    sources: ["Tae Kim's Guide (あります／います, location particles)", "Genki I — Lesson 5"]
                };
            },
            /* subject i pairs with its own required verb (います for living
               things, あります for objects) and place i — index tied so
               the sentence is always grammatically valid. */
            buildWordBankExercises: function () {
                let wb = this.wordBank;
                let i = Math.floor(Math.random() * wb.subjects.length);
                let subj = wb.subjects[i];
                let place = wb.places[i];
                return [
                    {
                        prompt: "Write: <strong>" + subj.en.charAt(0).toUpperCase() + subj.en.slice(1) + " is at " + place.en + "</strong>",
                        accepted: [[subj.jp, "は", place.jp, "に", subj.verb]],
                        hint: subj.jp + "は" + place.jp + "に" + subj.verb,
                        refWords: [
                            { jp: subj.jp, role: "subject" }, { jp: "は", role: "particle" },
                            { jp: place.jp, role: "object" }, { jp: "に", role: "particle" }, { jp: subj.verb, role: "predicate" }
                        ]
                    }
                ];
            }
        };
    }

    /* SHELF 08b: Direction Words */
    function s08b() {
        return {
            id: "s08b", title: "Direction Words", subtitle: "Shelf 08b",
            wordBank: {
                subjects: [{ jp: "としょかん", en: "the library" }, { jp: "ねこ", en: "the cat" }, { jp: "レストラン", en: "the restaurant" }],
                places: [{ jp: "がっこう", en: "the school" }, { jp: "テーブル", en: "the table" }, { jp: "こうえん", en: "the park" }],
                directions: [{ jp: "ちかく", en: "near" }, { jp: "した", en: "under" }, { jp: "となり", en: "next to" }],
                verbs: [{ jp: "あります", en: "arimasu (things)" }, { jp: "います", en: "imasu (living things)" }],
                newWords: [
                    { jp: "ひろい", en: "spacious / wide" }, { jp: "せまい", en: "narrow / cramped" }
                ],
                preview: [{ jp: "まっすぐ", en: "straight ahead", note: "Coming up in shelf 08c — movement & the compass" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "前・後ろ・右・左 — in pictures",
                            explain: "These describe where something is relative to something else: [Thing]は [something]の [direction]に あります. Same real cat, same real box, four more spots.",
                            diagramSvg: '<div class="grammar-box__pic-grid">'
                                + '<div class="grammar-box__pic-cell">'
                                + '<div class="grammar-box__pic-scene is-mae"><img class="pic-box" src="../../assets/images/lesson/transparent/box.png" alt="box"><img class="pic-cat" src="../../assets/images/lesson/transparent/cat.png" alt="cat"></div>'
                                + '<div class="grammar-box__pic-word">前</div><div class="grammar-box__pic-kana">mae</div><div class="grammar-box__pic-en">in front of</div>'
                                + '</div>'
                                + '<div class="grammar-box__pic-cell">'
                                + '<div class="grammar-box__pic-scene is-ushiro"><img class="pic-box" src="../../assets/images/lesson/transparent/box.png" alt="box"><img class="pic-cat" src="../../assets/images/lesson/transparent/cat.png" alt="cat"></div>'
                                + '<div class="grammar-box__pic-word">後ろ</div><div class="grammar-box__pic-kana">ushiro</div><div class="grammar-box__pic-en">behind</div>'
                                + '</div>'
                                + '<div class="grammar-box__pic-cell">'
                                + '<div class="grammar-box__pic-scene is-migi"><img class="pic-box" src="../../assets/images/lesson/transparent/box.png" alt="box"><img class="pic-cat" src="../../assets/images/lesson/transparent/cat.png" alt="cat"></div>'
                                + '<div class="grammar-box__pic-word">右</div><div class="grammar-box__pic-kana">migi</div><div class="grammar-box__pic-en">right of</div>'
                                + '</div>'
                                + '<div class="grammar-box__pic-cell">'
                                + '<div class="grammar-box__pic-scene is-hidari"><img class="pic-box" src="../../assets/images/lesson/transparent/box.png" alt="box"><img class="pic-cat" src="../../assets/images/lesson/transparent/cat.png" alt="cat"></div>'
                                + '<div class="grammar-box__pic-word">左</div><div class="grammar-box__pic-kana">hidari</div><div class="grammar-box__pic-en">left of</div>'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "ねこを はこの前に おきました — same four-piece sentence pattern as 中・外・上・下, just a different direction word each time."
                        },
                        {
                            title: "How close? となり・そば・近く",
                            explain: "Three ways to say something is nearby, and the ONLY thing that changes between them is distance — same cat, same box, all in one picture below so you can compare them directly. となり means touching, zero gap. そば means a small step away, still clearly beside it. 近く means way over on the other side of the room — still \"near\" in a loose sense, but nothing like となり's zero gap.",
                            diagramSvg: '<div class="grammar-box__dist2-scene">'
                                + '<img class="dist2-box" src="../../assets/images/lesson/transparent/box.png" alt="box">'
                                + '<div class="dist2-threshold t1"></div>'
                                + '<div class="dist2-threshold t2"></div>'
                                + '<div class="dist2-item p-tonari"><img src="../../assets/images/lesson/transparent/cat.png" alt="cat"><div class="dist2-label">となり<span>touching -- zero gap</span></div></div>'
                                + '<div class="dist2-item p-soba"><img src="../../assets/images/lesson/transparent/cat.png" alt="cat"><div class="dist2-label">そば<span>a small step away</span></div></div>'
                                + '<div class="dist2-item p-chikaku"><img src="../../assets/images/lesson/transparent/cat.png" alt="cat"><div class="dist2-label">近く<span>way across the room</span></div></div>'
                                + '</div>',
                            diagramCaption: "としょかんはがっこうのちかくにあります -- \"The library is near the school.\" Swap ちかく for となり or そば and the sentence still works, just with a tighter or looser sense of \"near\" -- exactly like the gaps above."
                        },
                        {
                            title: "中・外・上・下 — in pictures",
                            explain: "These four anchor to a container instead of rotating around a person, so a plain picture says it faster than another diagram: the same cat and box, actually placed in each spot.",
                            diagramSvg: '<div class="grammar-box__pic-grid">'
                                + '<div class="grammar-box__pic-cell">'
                                + '<div class="grammar-box__pic-scene is-naka">'
                                + '<img class="pic-box" src="../../assets/images/lesson/transparent/box.png" alt="box">'
                                + '<img class="pic-combo" src="../../assets/images/lesson/transparent/cat-in-box.png" alt="cat inside the box">'
                                + '</div>'
                                + '<div class="grammar-box__pic-word">中</div>'
                                + '<div class="grammar-box__pic-kana">naka</div>'
                                + '<div class="grammar-box__pic-en">inside</div>'
                                + '</div>'
                                + '<div class="grammar-box__pic-cell">'
                                + '<div class="grammar-box__pic-scene is-soto">'
                                + '<img class="pic-box" src="../../assets/images/lesson/transparent/box.png" alt="box">'
                                + '<img class="pic-cat" src="../../assets/images/lesson/transparent/cat.png" alt="cat">'
                                + '</div>'
                                + '<div class="grammar-box__pic-word">外</div>'
                                + '<div class="grammar-box__pic-kana">soto</div>'
                                + '<div class="grammar-box__pic-en">outside</div>'
                                + '</div>'
                                + '<div class="grammar-box__pic-cell">'
                                + '<div class="grammar-box__pic-scene is-ue">'
                                + '<img class="pic-box" src="../../assets/images/lesson/transparent/box.png" alt="box">'
                                + '<img class="pic-cat" src="../../assets/images/lesson/transparent/cat.png" alt="cat">'
                                + '</div>'
                                + '<div class="grammar-box__pic-word">上</div>'
                                + '<div class="grammar-box__pic-kana">ue</div>'
                                + '<div class="grammar-box__pic-en">above</div>'
                                + '</div>'
                                + '<div class="grammar-box__pic-cell">'
                                + '<div class="grammar-box__pic-scene is-shita">'
                                + '<img class="pic-box" src="../../assets/images/lesson/transparent/box.png" alt="box">'
                                + '<img class="pic-cat" src="../../assets/images/lesson/transparent/cat.png" alt="cat">'
                                + '</div>'
                                + '<div class="grammar-box__pic-word">下</div>'
                                + '<div class="grammar-box__pic-kana">shita</div>'
                                + '<div class="grammar-box__pic-en">below</div>'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "中 and 外 need something to be inside or outside OF — that's what the box is for. 上 and 下 work the same way with anything, not just boxes: 木の上 (up in the tree), いすの下 (under the chair)."
                        },
                        {
                            title: "に and の, spelled out",
                            explain: "Break it into three plain steps: (1) テーブル means \"table.\" (2) の does the exact same job as English's possessive 's — it glues two nouns together, so テーブルの = \"the table's.\" (3) 下 means \"underneath,\" so テーブルの下 = \"the table's underneath\" — an awkward literal translation, but it's just a roundabout way of saying \"under the table.\" に then marks that whole thing as WHERE something is — the exact same に you've already used all lesson (こうえんに, がっこうに...). Put it together: テーブルの下にいます = \"[it] is under the table.\"",
                            diagramSvg: '<div class="grammar-box__no-diagram">'
                                + '<div class="no-diagram-steps">'
                                + '<div class="no-step"><span class="jp">テーブル</span><span>table</span></div>'
                                + '<div class="no-plus">+</div>'
                                + '<div class="no-step"><span class="jp">の</span><span>\'s</span></div>'
                                + '<div class="no-plus">+</div>'
                                + '<div class="no-step"><span class="jp">下</span><span>underneath</span></div>'
                                + '<div class="no-eq">=</div>'
                                + '<div class="no-step no-step--result"><span class="jp">テーブルの下</span><span>"the table\'s underneath"</span></div>'
                                + '</div>'
                                + '<div class="no-diagram-scene">'
                                + '<img class="no-table" src="../../assets/images/lesson/transparent/table.png" alt="table">'
                                + '<div class="no-zone">テーブルの下<span>the table\'s "underneath"</span></div>'
                                + '<img class="no-cat" src="../../assets/images/lesson/transparent/cat.png" alt="cat">'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "テーブルの下に います。 (Teeburu no shita ni imasu.) — \"[The cat] is under the table.\" Swap テーブルの下 for any [reference]の[direction] pair and the rest of the sentence never changes."
                        }
                    ],
                    /* Ported verbatim from the Adventure Room's shelf-08
                       LESSON_CONTENT (the closing 'conversation' page,
                       reusing shelf-05's どこ to ask where something is,
                       answered with this shelf's own ちかく pattern), fixed
                       sensei=black/player=orange casting per Study Room's
                       own convention. No role-* spans in the original and
                       no name variable in scope for this lesson, so
                       nothing else to convert. */
                    conversation: {
                        turns: [
                            {
                                speaker: "player", name: "You", action: "tailwagLeft", actionLabel: "*tail wags*",
                                text: "すみません、としょかんはどこですか？",
                                romaji: "Sumimasen, toshokan wa doko desu ka? — \"Excuse me, where is the library?\""
                            },
                            {
                                speaker: "sensei", name: "Neko-sensei", action: "meow", actionLabel: "*meows*",
                                text: "としょかんはえきのちかくにあります。",
                                romaji: "Toshokan wa eki no chikaku ni arimasu. — \"The library is near the station.\""
                            },
                            {
                                speaker: "player", name: "You", action: "tailwagLeft", actionLabel: "*tail wags*",
                                text: "ありがとうございます！",
                                romaji: "Arigatou gozaimasu! — \"Thank you!\""
                            }
                        ]
                    },
                    examples: [
                        { jp: "としょかんはがっこうのちかくにあります", romaji: "Toshokan wa gakkou no chikaku ni arimasu.", en: "The library is near the school." },
                        { jp: "ねこはテーブルのしたにいます", romaji: "Neko wa teeburu no shita ni imasu.", en: "The cat is under the table." },
                        { jp: "ほんはねこの隣にあります", romaji: "Hon wa neko no tonari ni arimasu.", en: "The book is next to the cat." },
                        { jp: "ほんははこの中にあります", romaji: "Hon wa hako no naka ni arimasu.", en: "The book is inside the box." },
                        { jp: "レストランはこうえんの隣にあります", romaji: "Resutoran wa kouen no tonari ni arimasu.", en: "The restaurant is next to the park." }
                    ],
                    vocab: [
                        { jp: "前", romaji: "mae", en: "in front of" }, { jp: "後ろ", romaji: "ushiro", en: "behind" },
                        { jp: "右", romaji: "migi", en: "right of" }, { jp: "左", romaji: "hidari", en: "left of" },
                        { jp: "隣", romaji: "tonari", en: "next to" }, { jp: "そば", romaji: "soba", en: "by its side" }, { jp: "近く", romaji: "chikaku", en: "near" },
                        { jp: "上", romaji: "ue", en: "above" }, { jp: "下", romaji: "shita", en: "below" },
                        { jp: "中", romaji: "naka", en: "inside" }, { jp: "外", romaji: "soto", en: "outside" },
                        { jp: "テーブル", romaji: "teeburu", en: "table" }, { jp: "はこ", romaji: "hako", en: "box" }
                    ],
                    sources: ["Tae Kim's Guide (あります／います, location particles)", "Genki I — Lesson 5"]
                };
            },
            /* Index i ties subject/place/direction/verb into one sensible sentence
               (a library "near" the school, a cat "under" a tree, a restaurant "next to" a park).
               No bonus exercise: shelf 08c's まっすぐ/曲がります don't fit this
               lesson's location-description sentence pattern — preview stays
               exposure-only. */
            buildWordBankExercises: function () {
                let wb = this.wordBank;
                let i = Math.floor(Math.random() * wb.subjects.length);
                let subj = wb.subjects[i], place = wb.places[i], dir = wb.directions[i], verb = wb.verbs[i === 1 ? 1 : 0];
                return [
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
            }
        };
    }

    /* SHELF 08c: Movement & The Compass */
    function s08c() {
        return {
            id: "s08c", title: "Movement & The Compass", subtitle: "Shelf 08c",
            wordBank: {
                places: [{ jp: "としょかん", en: "the library" }, { jp: "がっこう", en: "school" }, { jp: "こうえん", en: "the park" }],
                newWords: [{ jp: "にぎやか", en: "lively / bustling" }],
                preview: [{ jp: "あなた", en: "you", note: "Coming up in shelf 09b — pronouns" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Movement & giving directions",
                            explain: "Actually walking somewhere needs a different kind of word — not 'where something is,' but 'which way to go.' あっち・こっち・どっち are the everyday, casual versions of shelf 05's こちら・そちら・あちら・どちら — same 'which way' meaning, softer tone. まっすぐ (straight ahead), 曲がります (to turn), and 行きます (to go) round out actually giving someone directions. This is a real map with a real route on it — press the buttons in order and the cat actually walks it, turn by turn.",
                            diagramSvg: '<div class="grammar-box__route2" data-step="0">'
                                + '<div class="route2-prompt"><div class="jp" data-role="promptJp">右に曲がってください。</div><div class="romaji" data-role="promptRomaji">migi ni magatte kudasai — turn right</div></div>'
                                + '<div class="route2-scene">'
                                + '<svg viewBox="0 0 1000 600" preserveAspectRatio="none">'
                                /* Decorative (non-route) roads. Both of these deliberately cross
                                   ALL THE WAY THROUGH the highlighted route — extending past it on
                                   BOTH sides, not just stopping at a T — so the two pass-through
                                   points on the route (the house intersection on the first
                                   massugu, the Building crossing on the last) read as real 4-way
                                   crossroads: there genuinely was a road going the other way at
                                   each one, and "massugu" means the player is choosing to ignore
                                   it and keep going straight, not just following the only path. */
                                + '<path d="M320,372 L320,600" fill="none" stroke="#0a2e26" stroke-width="40" stroke-linecap="round" opacity="0.55"></path>'
                                + '<path d="M620,95 L620,240" fill="none" stroke="#0a2e26" stroke-width="34" stroke-linecap="round" opacity="0.55"></path>'
                                /* The route itself: Home -> house intersection -> Kouen corner ->
                                   up -> School row -> up -> top row -> Eki. Triple-stroke same as
                                   before: dark outline, translucent green fill, gold dashed
                                   centerline showing direction of travel. */
                                + '<path d="M80,552 L320,552 L580,552 L580,372 L320,372 L320,192 L620,192 L940,192" fill="none" stroke="#0a2e26" stroke-width="56" stroke-linejoin="round" stroke-linecap="round"></path>'
                                + '<path d="M80,552 L320,552 L580,552 L580,372 L320,372 L320,192 L620,192 L940,192" fill="none" stroke="#1D9E75" stroke-width="46" opacity="0.35" stroke-linejoin="round" stroke-linecap="round"></path>'
                                + '<path d="M80,552 L320,552 L580,552 L580,372 L320,372 L320,192 L620,192 L940,192" fill="none" stroke="#f0c674" stroke-width="4" stroke-dasharray="16 12" opacity="0.9"></path>'
                                + '</svg>'
                                + '<img class="route2-bldg" src="../../assets/images/lesson/transparent/house.png" alt="house" style="left:32%;top:78%">'
                                + '<img class="route2-bldg" src="../../assets/images/lesson/transparent/hospital.png" alt="hospital" style="left:18%;top:45%">'
                                + '<img class="route2-bldg" src="../../assets/images/lesson/transparent/library.png" alt="library" style="left:38%;top:20%">'
                                + '<img class="route2-bldg" src="../../assets/images/lesson/transparent/tall-apartment.png" alt="building" style="left:62%;top:18%">'
                                + '<img class="route2-bldg" src="../../assets/images/lesson/transparent/restaurant.png" alt="restaurant" style="left:76%;top:23%">'
                                + '<img class="route2-bldg" src="../../assets/images/lesson/transparent/school.png" alt="school" style="left:45%;top:70%">'
                                + '<img class="route2-bldg" src="../../assets/images/lesson/transparent/park.png" alt="kouen — park" style="left:64%;top:80%">'
                                + '<img class="route2-house" src="../../assets/images/lesson/transparent/house.png" alt="home — start" style="left:8%;top:92%">'
                                + '<img class="route2-station" src="../../assets/images/lesson/transparent/station.png" alt="eki — destination" style="left:94%;top:32%">'
                                + '<div class="route2-cat" data-role="cat" style="left:8%;top:92%;background-image:url(&quot;../../assets/images/avatars/tailwagright-orange-64x64.png&quot;)"></div>'
                                + '</div>'
                                + '<div class="route2-controls">'
                                + '<button class="route2-btn" type="button" onclick="window.NekoRoute.press(this,\'right\')">右に曲がる<span>migi ni magaru</span></button>'
                                + '<button class="route2-btn" type="button" onclick="window.NekoRoute.press(this,\'straight\')">まっすぐ<span>massugu</span></button>'
                                + '<button class="route2-btn" type="button" onclick="window.NekoRoute.press(this,\'left\')">左に曲がる<span>hidari ni magaru</span></button>'
                                + '</div>'
                                + '<div class="route2-arrival" data-role="arrival"><div class="jp">駅に着きました！</div><div class="romaji">Eki ni tsukimashita — "Arrived at the station!"</div></div>'
                                + '</div>',
                            diagramCaption: "うち (home) is the start, 駅 is the destination — 家・病院・図書館・ビル・レストラン・学校・公園 are just scenery the road passes on the way, same as real street landmarks. Press 右に曲がる／まっすぐ／左に曲がる in the right order and the cat walks the whole highlighted route, turn by turn."
                        },
                        {
                            title: "へ vs に — same 'to', two flavors",
                            explain: "Both へ and に can mark 'the place you're heading toward' after a movement verb like 行きます. に points at the exact destination — the specific spot you're arriving at (it's the same に used for 'is located at,' just applied to motion instead). へ points in a direction — it emphasizes which way you're heading, without pinning down the endpoint quite as precisely (へ is literally the character used for 'direction' itself, 方向 — hougou). In practice, for a plain 'I'm going to [place]' sentence, they're interchangeable — native speakers use either, and this course accepts both. This swap only works for motion toward a place (行きます／来ます／帰ります); に still does other jobs (marking where something IS, marking time) that へ can't take over.",
                            diagramSvg: '<div class="grammar-box__no-diagram">'
                                + '<div class="no-diagram-steps">'
                                + '<div class="no-step"><span class="jp">がっこう</span><span>school</span></div>'
                                + '<div class="no-plus">+</div>'
                                + '<div class="no-step"><span class="jp">に</span><span>exact destination</span></div>'
                                + '<div class="no-plus">+</div>'
                                + '<div class="no-step"><span class="jp">行きます</span><span>go</span></div>'
                                + '<div class="no-eq">=</div>'
                                + '<div class="no-step no-step--result"><span class="jp">がっこうに行きます</span><span>"I go to school"</span></div>'
                                + '</div>'
                                + '<div class="no-diagram-steps">'
                                + '<div class="no-step"><span class="jp">がっこう</span><span>school</span></div>'
                                + '<div class="no-plus">+</div>'
                                + '<div class="no-step"><span class="jp">へ</span><span>general direction</span></div>'
                                + '<div class="no-plus">+</div>'
                                + '<div class="no-step"><span class="jp">行きます</span><span>go</span></div>'
                                + '<div class="no-eq">=</div>'
                                + '<div class="no-step no-step--result"><span class="jp">がっこうへ行きます</span><span>same meaning, both correct</span></div>'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "がっこうに行きます and がっこうへ行きます both mean \"I go to school.\" Either particle is accepted anywhere this course asks you to build a 'going to [place]' sentence."
                        },
                        {
                            title: "The compass",
                            explain: "北 (kita, north), 南 (minami, south), 東 (higashi, east), and 西 (nishi, west) are a fixed reference grid — unlike 前/後ろ/右/左, they don't rotate depending on which way anyone is facing, so they show up constantly on maps, signs, and addresses.",
                            diagramSvg: '<div class="grammar-box__compass-cross">'
                                + '<div class="cross-line cross-line--v"></div>'
                                + '<div class="cross-line cross-line--h"></div>'
                                + '<img class="cross-icon" src="../../assets/images/lesson/transparent/compass-oga.png" alt="compass">'
                                + '<div class="cross-label n"><span class="jp">北</span><span class="romaji">kita</span></div>'
                                + '<div class="cross-label s"><span class="jp">南</span><span class="romaji">minami</span></div>'
                                + '<div class="cross-label e"><span class="jp">東</span><span class="romaji">higashi</span></div>'
                                + '<div class="cross-label w"><span class="jp">西</span><span class="romaji">nishi</span></div>'
                                + '</div>',
                            diagramCaption: "Unlike 前/後ろ/右/左 (which rotate with whoever is speaking), 北・南・東・西 always point the same way — the same compass works on every map."
                        }
                    ],
                    examples: [
                        { jp: "わたしはがっこうに行きます", romaji: "Watashi wa gakkou ni ikimasu.", en: "I go to school." },
                        { jp: "まっすぐ行きます", romaji: "Massugu ikimasu.", en: "Go straight ahead." },
                        { jp: "右に曲がります", romaji: "Migi ni magarimasu.", en: "Turn right." },
                        { jp: "としょかんはえきのきたにあります", romaji: "Toshokan wa eki no kita ni arimasu.", en: "The library is north of the station." }
                    ],
                    vocab: [
                        { jp: "まっすぐ", romaji: "massugu", en: "straight ahead" }, { jp: "曲がります", romaji: "magarimasu", en: "to turn" },
                        { jp: "行きます", romaji: "ikimasu", en: "to go" }, { jp: "あっち", romaji: "acchi", en: "that way (casual)" },
                        { jp: "こっち", romaji: "kocchi", en: "this way (casual)" }, { jp: "どっち", romaji: "docchi", en: "which way (casual)" },
                        { jp: "北", romaji: "kita", en: "north" }, { jp: "南", romaji: "minami", en: "south" },
                        { jp: "東", romaji: "higashi", en: "east" }, { jp: "西", romaji: "nishi", en: "west" }
                    ],
                    sources: ["Genki I — Lesson 5"]
                };
            },
            buildWordBankExercises: function () {
                let wb = this.wordBank;
                let place = pick(wb.places);
                let exercises = [
                    {
                        prompt: "Write: <strong>I go to " + place.en + "</strong>",
                        // へ accepted alongside に -- both mean "toward [place]" for a
                        // plain going-there sentence, see the "へ vs に" section above.
                        accepted: [
                            ["わたし", "は", place.jp, "に", "行きます"],
                            ["わたし", "は", place.jp, "へ", "行きます"]
                        ],
                        hint: "わたしは" + place.jp + "に行きます",
                        refWords: [
                            { jp: "わたし", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: place.jp, role: "object" }, { jp: "に", role: "particle" }, { jp: "行きます", role: "predicate" }
                        ]
                    }
                ];
                /* Bonus: sneak peek at shelf 09b's あなた, slotted in as the subject
                   of an います (person) sentence — reuses the います pattern
                   already taught back in shelf 08a. */
                let preview = wb.preview && wb.preview[0];
                if (preview) {
                    let place2 = pick(wb.places);
                    exercises.push({
                        prompt: "(bonus — sneak peek: shelf 09b) Write: <strong>You are at " + place2.en + "</strong>",
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

    /* SHELF 08d: Places — Common Locations. Split out of 08a per explicit
       feedback — 08a was covering the あります/います grammar AND a full
       place-vocab reference diagram at once, which made one lesson feel
       like two. 08a keeps the grammar; this is just the place words. */
    function s08d() {
        return {
            id: "s08d", title: "Places — Common Locations", subtitle: "Shelf 08d",
            wordBank: {
                places: [
                    { jp: "うち", en: "home" }, { jp: "がっこう", en: "school" }, { jp: "えき", en: "station" },
                    { jp: "びょういん", en: "hospital" }, { jp: "レストラン", en: "restaurant" }, { jp: "教会", en: "church" },
                    { jp: "としょかん", en: "library" }, { jp: "こうえん", en: "park" },
                    { jp: "ほんや", en: "bookstore" }, { jp: "ぎんこう", en: "bank" }
                ]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Places — common locations",
                            explain: "A solid set of place nouns to plug into [Place]は…にあります (covered in shelf 08a) without any special handling — every single one now has its own real photo.",
                            diagramSvg: '<div class="grammar-box__place-grid">'
                                + '<div class="grammar-box__place-cell"><img src="../../assets/images/lesson/transparent/house.png" alt="house"><div class="grammar-box__place-jp">うち</div><div class="grammar-box__place-en">uchi &middot; home</div></div>'
                                + '<div class="grammar-box__place-cell"><img src="../../assets/images/lesson/transparent/college.png" alt="school"><div class="grammar-box__place-jp">がっこう</div><div class="grammar-box__place-en">gakkou &middot; school</div></div>'
                                + '<div class="grammar-box__place-cell"><img src="../../assets/images/lesson/transparent/station.png" alt="station"><div class="grammar-box__place-jp">えき</div><div class="grammar-box__place-en">eki &middot; station</div></div>'
                                + '<div class="grammar-box__place-cell"><img src="../../assets/images/lesson/transparent/hospital.png" alt="hospital"><div class="grammar-box__place-jp">びょういん</div><div class="grammar-box__place-en">byouin &middot; hospital</div></div>'
                                + '<div class="grammar-box__place-cell"><img src="../../assets/images/lesson/transparent/restaurant.png" alt="restaurant"><div class="grammar-box__place-jp">レストラン</div><div class="grammar-box__place-en">resutoran &middot; restaurant</div></div>'
                                + '<div class="grammar-box__place-cell"><img src="../../assets/images/lesson/transparent/cathedral.png" alt="church"><div class="grammar-box__place-jp">教会</div><div class="grammar-box__place-en">kyoukai &middot; church</div></div>'
                                + '<div class="grammar-box__place-cell"><img src="../../assets/images/lesson/transparent/library.png" alt="library"><div class="grammar-box__place-jp">としょかん</div><div class="grammar-box__place-en">toshokan &middot; library</div></div>'
                                + '<div class="grammar-box__place-cell"><img src="../../assets/images/lesson/transparent/park.png" alt="park"><div class="grammar-box__place-jp">こうえん</div><div class="grammar-box__place-en">kouen &middot; park</div></div>'
                                + '</div>',
                            diagramCaption: "Every one of these is a plain noun — no counter, no special grammar. The ONLY thing that changes sentence to sentence is which direction word (shelf 08b) sits between the place and に あります."
                        }
                    ],
                    examples: [
                        { jp: "ねこはこうえんにいます", romaji: "Neko wa kouen ni imasu.", en: "The cat is at the park." },
                        { jp: "ほんはとしょかんにあります", romaji: "Hon wa toshokan ni arimasu.", en: "The book is at the library." },
                        { jp: "せんせいはがっこうにいます", romaji: "Sensei wa gakkou ni imasu.", en: "The teacher is at school." }
                    ],
                    vocab: [
                        { jp: "がっこう", romaji: "gakkou", en: "school" }, { jp: "えき", romaji: "eki", en: "station" },
                        { jp: "としょかん", romaji: "toshokan", en: "library" }, { jp: "びょういん", romaji: "byouin", en: "hospital" },
                        { jp: "レストラン", romaji: "resutoran", en: "restaurant" }, { jp: "こうえん", romaji: "kouen", en: "park" },
                        { jp: "ほんや", romaji: "honya", en: "bookstore" }, { jp: "ぎんこう", romaji: "ginkou", en: "bank" },
                        { jp: "うち", romaji: "uchi", en: "home" }, { jp: "教会", romaji: "kyoukai", en: "church" }
                    ],
                    sources: ["Tae Kim's Guide (あります／います, location particles)", "Genki I — Lesson 5"]
                };
            },
            buildWordBankExercises: function () {
                let place = pick(this.wordBank.places);
                return [
                    {
                        prompt: "Write the place: <strong>" + place.en.charAt(0).toUpperCase() + place.en.slice(1) + "</strong>",
                        accepted: [[place.jp]],
                        hint: place.jp,
                        refWords: [{ jp: place.jp, role: "neutral" }]
                    }
                ];
            }
        };
    }

    /* SHELF 09a/09b: Nouns & Pronouns, split into their own pages per
       explicit feedback (nouns and pronouns are different word classes
       with different jobs — の-possessive and noun categories belong with
       nouns, casual/plural pronouns and the こんな family belong with
       pronouns). Same split shape as the 07a-e / 08a-d shelf-groups:
       lettered ids, no bare "s09" lesson of its own. Content ported
       originally from LESSON_CONTENT['shelf-09'] in n5-phaser-game.js,
       then divided and each half given room to stand on its own. */
    function s09a() {
        return {
            id: "s09a", title: "Nouns", subtitle: "Shelf 09a",
            wordBank: {
                people: uPick(NAMES, 2),
                things: [{ jp: "ともだち", en: "friend" }, { jp: "ほん", en: "book" }, { jp: "ねこ", en: "cat" }],
                newWords: [
                    { jp: "せんぱい", en: "senior (upperclassman)" }, { jp: "こうはい", en: "junior (underclassman)" },
                    { jp: "どうりょう", en: "colleague" }, { jp: "しんせき", en: "relative" }
                ],
                /* Next-lesson preview (shelf 09b, pronouns) — shown for exposure
                   and usable in this lesson's bonus exercise below. */
                preview: [{ jp: "あなた", en: "you", note: "Coming up in shelf 09b — pronouns" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Nouns (名詞 / めいし)",
                            explain: "A noun names a person, place, or thing — 本 (hon, \"book\"), 友達 (tomodachi, \"friend\"), 学校 (gakkou, \"school\"). Japanese nouns don't change form for singular/plural or gender the way English ones sometimes do — 本 can mean \"book\" or \"books\" from context alone, no -s ending to add. Any noun slots straight into the [Noun]は[description]です pattern you've already been using since shelf 03.",
                            pattern: '<span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">description</span> <span class="pattern-box__fixed">です</span>'
                        },
                        {
                            title: "の — connecting two nouns",
                            explain: "の links two nouns together the same way English's possessive 's does, just in the opposite order: [Noun A]の[Noun B] means \"A's B.\" The second noun is always the real thing the sentence is about — の just says who or what it belongs to.",
                            diagramSvg: '<div class="grammar-box__no-diagram">'
                                + '<div class="no-diagram-steps">'
                                + '<div class="no-step"><span class="jp">私</span><span>I / me</span></div>'
                                + '<div class="no-plus">+</div>'
                                + '<div class="no-step"><span class="jp">の</span><span>\'s</span></div>'
                                + '<div class="no-plus">+</div>'
                                + '<div class="no-step"><span class="jp">本</span><span>book</span></div>'
                                + '<div class="no-eq">=</div>'
                                + '<div class="no-step no-step--result"><span class="jp">私の本</span><span>"my book"</span></div>'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "私の本 (watashi no hon) — \"my book.\" Swap either noun freely: 彼の家族 (\"his family\"), 先生の名前 (\"the teacher's name\") — の always means \"[first noun]'s [second noun].\""
                        },
                        {
                            title: "People & relationships",
                            explain: "A cluster of N5 nouns exists just to name the people around you: 友達 (friend), 家族 (family), 先生 (teacher), 学生 (student) — plus a workplace/school-hierarchy set: せんぱい (senior/upperclassman) and こうはい (junior/underclassman) mark relative seniority, not age; どうりょう (colleague) and しんせき (relative) round out the everyday relationship vocabulary you'll reach for constantly once you start describing your own life in Japanese."
                        }
                    ],
                    examples: [
                        { jp: "あの人は私の友達です", romaji: "Ano hito wa watashi no tomodachi desu.", en: "That person is my friend." },
                        { jp: "これは先生の本です", romaji: "Kore wa sensei no hon desu.", en: "This is the teacher's book." },
                        { jp: "彼は私のせんぱいです", romaji: "Kare wa watashi no senpai desu.", en: "He is my senior/upperclassman." }
                    ],
                    examplesMore: [
                        { label: "nouns", href: encodeURI("../../assets/lesson pdf/NIHONGO VOCABS (NOUNS).pdf") }
                    ],
                    vocab: [
                        { jp: "人", romaji: "hito", en: "person" }, { jp: "子供", romaji: "kodomo", en: "child" },
                        { jp: "友達", romaji: "tomodachi", en: "friend" }, { jp: "家族", romaji: "kazoku", en: "family" },
                        { jp: "先生", romaji: "sensei", en: "teacher" }, { jp: "学生", romaji: "gakusei", en: "student" },
                        { jp: "本", romaji: "hon", en: "book" }, { jp: "かばん", romaji: "kaban", en: "bag" },
                        { jp: "時計", romaji: "tokei", en: "clock/watch" },
                        { jp: "せんぱい", romaji: "senpai", en: "senior (upperclassman)" },
                        { jp: "こうはい", romaji: "kouhai", en: "junior (underclassman)" },
                        { jp: "どうりょう", romaji: "douryou", en: "colleague" },
                        { jp: "しんせき", romaji: "shinseki", en: "relative" }
                    ],
                    sources: ["Tae Kim's Guide to Japanese Grammar (nouns)", "Wasabi Japanese nouns guide"]
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
                /* Bonus: sneak peek at shelf 09b's あなた, dropped into this
                   lesson's own [Noun]は[description]です pattern. */
                let preview = wb.preview && wb.preview[0];
                if (preview) {
                    exercises.push({
                        prompt: "(bonus — sneak peek: shelf 09b) Write: <strong>You are a teacher</strong>",
                        accepted: [[preview.jp, "は", "せんせい", "です"]],
                        hint: preview.jp + "はせんせいです",
                        refWords: [
                            { jp: preview.jp, role: "subject" }, { jp: "は", role: "particle" },
                            { jp: "せんせい", role: "predicate" }, { jp: "です", role: "auxiliary" }
                        ]
                    });
                }
                return exercises;
            }
        };
    }

    function s09b() {
        return {
            id: "s09b", title: "Pronouns", subtitle: "Shelf 09b",
            wordBank: {
                casual: [{ jp: "僕", en: "I / me (casual, male)" }, { jp: "君", en: "you (casual)" }],
                demonstratives: [{ jp: "どんな", en: "what kind of" }],
                nouns: [{ jp: "ひと", en: "person" }, { jp: "ほん", en: "book" }, { jp: "ねこ", en: "cat" }],
                newWords: [{ jp: "色んな", en: "various" }],
                /* Next-lesson preview (shelf 10a, い-adjectives) — shown for
                   exposure and usable in this lesson's bonus exercise below. */
                preview: [{ jp: "おおきい", en: "big", note: "Coming up in shelf 10a — い-adjectives" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Pronouns (代名詞 / だいめいし)",
                            explain: "A pronoun stands in for a noun instead of repeating it — 私 (watashi, \"I/me\") instead of saying your own name every time, あなた (anata, \"you\") instead of the listener's name, 彼 (kare, \"he\") / 彼女 (kanojo, \"she\") once it's already clear who you mean. Grammatically, a pronoun is just a noun — it slots into は, の, を, and every other particle exactly the same way 本 or 友達 would."
                        },
                        {
                            title: "Casual pronouns — 僕 (boku) & 君 (kimi)",
                            explain: "僕 (boku) and 君 (kimi) are casual, everyday versions of 私 (watashi) and あなた (anata) — used with friends and family, not in polite/formal speech. Swapping one pronoun for another doesn't change anything else in the sentence — only how formal or masculine/neutral it sounds (see the diagram below)."
                        },
                        {
                            title: "Same sentence, different pronoun — how the choice changes the tone",
                            explain: "The pronoun slot in [Pronoun]は[description]です can be filled by any of these words, and the rest of the sentence never has to change — only the register (how casual, formal, or gendered it sounds) shifts with it.",
                            diagramSvg: '<div class="pronoun-diagram">'
                                + '<div class="pronoun-diagram__slot-row">'
                                + '<span class="pronoun-diagram__slot">私 / 僕 / あなた / 君</span>'
                                + '<span class="pronoun-diagram__fixed">は</span>'
                                + '<span>せんせい</span>'
                                + '<span class="pronoun-diagram__fixed">です</span>'
                                + '</div>'
                                + '<div class="pronoun-diagram__ladder">'
                                + '<div class="pronoun-diagram__pill"><span class="jp">私</span><span>watashi — neutral, safe anywhere</span></div>'
                                + '<div class="pronoun-diagram__pill"><span class="jp">僕</span><span>boku — casual, male-leaning</span></div>'
                                + '<div class="pronoun-diagram__pill"><span class="jp">あなた</span><span>anata — direct, can sound blunt</span></div>'
                                + '<div class="pronoun-diagram__pill"><span class="jp">君</span><span>kimi — casual, said to a peer/junior</span></div>'
                                + '</div>'
                                + '<div class="pronoun-diagram__axis"><span>&larr; more casual</span><span>more formal &rarr;</span></div>'
                                + '</div>',
                            diagramCaption: "One sentence, four valid pronouns — the grammar (は...です) never moves, only who's speaking and how casually they sound does. This is also why Japanese speakers often drop the pronoun entirely once it's already clear from context — the sentence still works without it."
                        },
                        {
                            title: "Plural pronouns — 私たち, 彼ら, みなさん",
                            explain: "Add たち or ら to make a pronoun plural: 私たち (watashitachi, \"we/us\"), 彼ら (karera, \"they/them\" — masculine-leaning in origin, but used generically; 彼女たち kanojotachi exists too for an all-female \"they\"). みなさん (mina-san, \"everyone\") is its own word rather than a pluralized pronoun, and it carries a note of politeness — it's what a teacher says to a whole class, not just a flat, neutral \"everyone.\""
                        },
                        {
                            title: "“What kind of...?” — こんな / そんな / あんな / どんな",
                            explain: "These attach directly before a noun, but ask about KIND instead of pointing at a specific thing — こんな本 ('this kind of book') vs. この本 ('this [specific] book')."
                        },
                        {
                            title: "自分 (jibun) — pointing back at the subject",
                            explain: "自分 (jibun) can point back to whoever the sentence is already about — '自分の家族 (jibun no kazoku)' means 'my own family' if you're speaking, or 'their own family' if the sentence is about someone else."
                        }
                    ],
                    examples: [
                        { jp: "あなたはせんせいですか？", romaji: "Anata wa sensei desu ka?", en: "Are you a teacher?" },
                        { jp: "そのかばんは彼のじゃないです", romaji: "Sono kaban wa kare no ja nai desu.", en: "That bag is not his." },
                        { jp: "僕はせんせいです", romaji: "Boku wa sensei desu.", en: "I am a teacher. (casual, male speaker)" },
                        { jp: "どんな人ですか", romaji: "Donna hito desu ka.", en: "What kind of person is it?" }
                    ],
                    examplesMore: [
                        { label: "pronouns", href: encodeURI("../../assets/lesson pdf/NIHONGO VOCABS (PRONOUNS).pdf") }
                    ],
                    vocab: [
                        { jp: "あなた", romaji: "anata", en: "you" }, { jp: "彼", romaji: "kare", en: "he/him" },
                        { jp: "彼女", romaji: "kanojo", en: "she/her" }, { jp: "私たち", romaji: "watashitachi", en: "we/us" },
                        { jp: "みなさん", romaji: "mina-san", en: "everyone" },
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
                let noun = pick(wb.nouns);
                let exercises = [
                    {
                        prompt: "Write (casual): <strong>I am a teacher</strong>",
                        accepted: [["ぼく", "は", "せんせい", "です"]],
                        hint: "ぼくはせんせいです",
                        refWords: [
                            { jp: "ぼく", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: "せんせい", role: "predicate" }, { jp: "です", role: "auxiliary" }
                        ]
                    },
                    {
                        prompt: "Write: <strong>What kind of " + noun.en + " is it?</strong>",
                        accepted: [["どんな", noun.jp, "です", "か"]],
                        hint: "どんな" + noun.jp + "ですか",
                        refWords: [
                            { jp: "どんな", role: "adjective" }, { jp: noun.jp, role: "object" },
                            { jp: "です", role: "auxiliary" }, { jp: "か", role: "particle" }
                        ]
                    }
                ];
                /* Bonus: sneak peek at shelf 10a's い-adjective, modifying a
                   noun directly (grammatically valid without shelf 10a's rules). */
                let preview = wb.preview && wb.preview[0];
                if (preview) {
                    exercises.push({
                        prompt: "(bonus — sneak peek: shelf 10a) Write: <strong>I am a big person</strong>",
                        accepted: [["わたし", "は", preview.jp, "ひと", "です"]],
                        hint: "わたしは" + preview.jp + "ひとです",
                        refWords: [
                            { jp: "わたし", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: preview.jp, role: "adjective" }, { jp: "ひと", role: "object" }, { jp: "です", role: "auxiliary" }
                        ]
                    });
                }
                return exercises;
            }
        };
    }

    /* SHELF 10a/10b/10c: Adjectives, split into their own pages per
       explicit feedback (い-adjectives, な-adjectives, and adverbs are
       three genuinely different conjugation systems that were previously
       crammed into one shelf) — each page expanded with real depth rather
       than just relocated, since cramming them together was exactly what
       kept any one of them from getting room to breathe. */
    function s10a() {
        return {
            id: "s10a", title: "い-Adjectives", subtitle: "Shelf 10a",
            wordBank: {
                iAdjectives: [
                    { jp: "おおきい", en: "big" }, { jp: "ちいさい", en: "small" },
                    { jp: "あたらしい", en: "new" }, { jp: "ふるい", en: "old" },
                    { jp: "たかい", en: "expensive" }, { jp: "たのしい", en: "fun" }
                ],
                newWords: [
                    { jp: "さむい", en: "cold" }, { jp: "あつい", en: "hot" },
                    { jp: "おもい", en: "heavy" }, { jp: "かるい", en: "light (weight)" }
                ],
                preview: [{ jp: "しずか", en: "quiet", note: "Coming up in shelf 10b — な-adjectives" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "い-Adjectives — what makes them different",
                            explain: "An い-adjective always ends in い in its dictionary form — 大きい (big), 新しい (new), 高い (expensive/tall). Unlike English adjectives, い-adjectives conjugate on their own, the same way a verb does — です after one is just politeness, not doing any grammatical work. That's the single biggest thing to internalize about this whole family: the adjective itself carries tense and negation, not です.",
                            pattern: '<span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">い-Adjective</span> <span class="pattern-box__fixed">です</span>'
                        },
                        {
                            title: "Negative — drop い, add くない",
                            explain: "Drop the final い and add くないです: 小さい → 小さくないです ('is not small'). 良い is the one true exception — it conjugates from its older reading よい, so 'not good' is よくないです, never いくないです. Memorize 良い as an irregular from day one rather than trying to force the regular rule onto it.",
                            diagramSvg: '<div class="grammar-box__no-diagram">'
                                + '<div class="no-diagram-steps">'
                                + '<div class="no-step"><span class="jp">大き<span class="slash-char">い</span></span><span>dictionary form</span></div>'
                                + '<div class="no-eq">&rarr;</div>'
                                + '<div class="no-step no-step--result"><span class="jp">大き<span class="add-char">くない</span></span><span>drop い, add くない</span></div>'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "い-adjectives conjugate on their own — the ending itself changes, です never has to. Watch the last い get slashed away, then くない fade in — that's the whole rule in one picture."
                        },
                        {
                            title: "Past tense — drop い, add かった / くなかった",
                            explain: "です/でした never attach directly to an い-adjective — the tense always lives INSIDE the adjective. Past affirmative: drop い, add かった → 大きかったです ('it was big'). Past negative: drop い, add くなかった → 大きくなかったです ('it was not big'). Every tense/polarity combination follows this same drop-い pattern — there's no separate rule to learn for past vs. present."
                        },
                        {
                            title: "い-adjectives modifying a noun directly",
                            explain: "An い-adjective can also sit directly in front of the noun it describes, no です or particle needed — 大きい本 ('a/the big book'), 新しい時計 ('a new watch'). It's the exact same word you'd use in [Noun]は[い-adjective]です — い-adjectives never change shape to do this, they just relocate in front of the noun."
                        },
                        {
                            title: "Watch out — fake い-adjectives",
                            explain: "A couple of words end in い by coincidence, not because they're real い-adjectives: きれい (pretty/clean), きらい (dislike/hate). They're actually な-adjectives — negate with じゃないです, never くない. That trap, and the rest of な-adjective conjugation, gets its own lesson next."
                        }
                    ],
                    examples: [
                        { jp: "本は大きいです", romaji: "Hon wa ookii desu.", en: "The book is big." },
                        { jp: "これは新しい時計です", romaji: "Kore wa atarashii tokei desu.", en: "This clock is new." },
                        { jp: "この本は小さくないです", romaji: "Kono hon wa chiisakunai desu.", en: "This book is not small." },
                        { jp: "この本はとても大きいです", romaji: "Kono hon wa totemo ookii desu.", en: "This book is very big." },
                        { jp: "大きい本です", romaji: "Ookii hon desu.", en: "It's a big book. (adjective directly modifying the noun)" }
                    ],
                    examplesMore: [
                        { label: "い-adjective", href: encodeURI("../../assets/lesson pdf/NIHONGO VOCABS I-Adj.pdf") }
                    ],
                    vocab: [
                        { jp: "大きい", romaji: "ookii", en: "big" }, { jp: "小さい", romaji: "chiisai", en: "small" },
                        { jp: "赤い", romaji: "akai", en: "red" }, { jp: "青い", romaji: "aoi", en: "blue" },
                        { jp: "新しい", romaji: "atarashii", en: "new" }, { jp: "古い", romaji: "furui", en: "old" },
                        { jp: "高い", romaji: "takai", en: "expensive/tall" }, { jp: "安い", romaji: "yasui", en: "cheap" },
                        { jp: "楽しい", romaji: "tanoshii", en: "fun/enjoyable" }, { jp: "良い", romaji: "ii", en: "good" },
                        { jp: "さむい", romaji: "samui", en: "cold" }, { jp: "あつい", romaji: "atsui", en: "hot" },
                        { jp: "おもい", romaji: "omoi", en: "heavy" }, { jp: "かるい", romaji: "karui", en: "light (weight)" },
                        { jp: "とても", romaji: "totemo", en: "very" }
                    ],
                    sources: ["Tae Kim's Guide (い-adjectives)", "Wasabi Japanese adjectives guide"]
                };
            },
            buildWordBankExercises: function () {
                let wb = this.wordBank;
                let iAdj = pick(wb.iAdjectives);
                /* No よい in this lesson's word bank, so the drop-い/add-くない
                   rule applies with no exception to work around. */
                let negAdj = wb.iAdjectives[Math.floor(Math.random() * wb.iAdjectives.length)];
                let negForm = negAdj.jp.slice(0, -1) + "くない";
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
                        prompt: "Write: <strong>The book is not " + negAdj.en + "</strong>",
                        accepted: [["ほん", "は", negForm, "です"]],
                        hint: "ほんは" + negForm + "です",
                        refWords: [
                            { jp: "ほん", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: negForm, role: "adjective" }, { jp: "です", role: "auxiliary" }
                        ]
                    }
                ];
                /* Bonus: sneak peek at shelf 10b's な-adjective. */
                let preview = wb.preview && wb.preview[0];
                if (preview) {
                    exercises.push({
                        prompt: "(bonus — sneak peek: shelf 10b) Write: <strong>The library is quiet</strong>",
                        accepted: [["としょかん", "は", preview.jp, "です"]],
                        hint: "としょかんは" + preview.jp + "です",
                        refWords: [
                            { jp: "としょかん", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: preview.jp, role: "adjective" }, { jp: "です", role: "auxiliary" }
                        ]
                    });
                }
                return exercises;
            }
        };
    }

    function s10b() {
        return {
            id: "s10b", title: "な-Adjectives", subtitle: "Shelf 10b",
            wordBank: {
                naAdjectives: [
                    { jp: "しずか", en: "quiet" }, { jp: "きれい", en: "beautiful" }, { jp: "ゆうめい", en: "famous" }
                ],
                newWords: [{ jp: "大変", en: "tough/serious" }],
                preview: [{ jp: "よく", en: "often/well", note: "Coming up in shelf 10c — adverbs" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "な-Adjectives — what makes them different",
                            explain: "A な-adjective does NOT end in い in its dictionary form — 静か (quiet), 好き (like), 有名 (famous). Grammatically, a な-adjective behaves exactly like a noun: it can't conjugate on its own the way an い-adjective can, so it leans entirely on です (and its relatives でした/じゃない/だ) to carry tense and negation. The name \"な-adjective\" comes from the な that appears when one directly modifies a noun (see below) — that な never shows up in the [Noun]は[な-adjective]です sentence shape itself.",
                            pattern: '<span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">は</span> <span class="pattern-box__slot">な-Adjective</span> <span class="pattern-box__fixed">です</span>'
                        },
                        {
                            title: "Negation — just add じゃないです",
                            explain: "な-adjectives negate exactly like nouns do: attach じゃないです (or the more formal ではありません) — never くない, that's an い-adjective-only conjugation. 静か → 静かじゃないです ('is not quiet')."
                        },
                        {
                            title: "The two sentence shapes — attributive vs. predicate",
                            explain: "Attributive (modifying a noun directly): 静かな図書館 ('a quiet library') — な glues the adjective onto the noun, no です needed. Predicate (the sentence's main description): 図書館は静かです ('the library is quiet') — です does the 'is' job here, and な disappears entirely. な belongs to the noun that follows it, never to です — that one rule explains both shapes at once.",
                            diagramSvg: '<div class="grammar-box__no-diagram">'
                                + '<div class="no-diagram-steps">'
                                + '<div class="no-step"><span class="jp">静か</span><span>dictionary form</span></div>'
                                + '<div class="no-eq">&rarr;</div>'
                                + '<div class="no-step no-step--result"><span class="jp">静かじゃない</span><span>just add じゃない</span></div>'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "な-adjectives lean on じゃない the same way a plain noun would — the adjective's own ending never changes."
                        },
                        {
                            title: "The 4-way copula family — です / でした / じゃない / じゃなかった",
                            explain: "な-adjectives (and nouns) lean entirely on です/でした/じゃ for tense and negation: 静かです ('is quiet'), 静かでした ('was quiet'), 静かじゃないです ('is not quiet'), 静かじゃなかったです ('was not quiet'). じゃありません is the same negative as じゃないです, just more neutral/formal — both correct, じゃないです leans slightly casual."
                        },
                        {
                            title: "The plain (casual) register: だ instead of です",
                            explain: "Drop です down to plain speech and it becomes だ — everything else contracts the same way: 静かだ ('is quiet,' plain), 静かだった ('was quiet,' plain), 静かじゃない / 静かではない ('is not quiet,' plain), 静かじゃなかった / 静かではなかった ('was not quiet,' plain). じゃ isn't its own separate word here — it only ever shows up glued to ない, so the negative conjugates as じゃなかった, built the same drop-then-add way an い-adjective would."
                        },
                        {
                            title: "Watch out — fake い-adjectives are secretly な-adjectives",
                            explain: "A couple of words end in い by coincidence and LOOK like い-adjectives, but conjugate as な-adjectives instead: きれい (pretty/clean), きらい (dislike/hate). Negate them with じゃないです, never くない — checking a な-adjective vocab list beats guessing from spelling every time."
                        }
                    ],
                    examples: [
                        { jp: "図書館は静かです", romaji: "Toshokan wa shizuka desu.", en: "The library is quiet." },
                        { jp: "これは便利じゃないです", romaji: "Kore wa benri ja nai desu.", en: "This isn't convenient." },
                        { jp: "あの先生は有名じゃないです", romaji: "Ano sensei wa yuumei ja nai desu.", en: "That teacher isn't famous." },
                        { jp: "図書館は静かでした", romaji: "Toshokan wa shizuka deshita.", en: "The library was quiet. (past)" },
                        { jp: "静かだ", romaji: "Shizuka da.", en: "It's quiet. (plain/casual register)" },
                        { jp: "静かな図書館です", romaji: "Shizuka na toshokan desu.", en: "It's a quiet library. (adjective directly modifying the noun)" }
                    ],
                    examplesMore: [
                        { label: "な-adjective", href: encodeURI("../../assets/lesson pdf/NIHONGO VOCABS Na-Adj.pdf") }
                    ],
                    vocab: [
                        { jp: "静か", romaji: "shizuka", en: "quiet" }, { jp: "好き", romaji: "suki", en: "like" },
                        { jp: "元気", romaji: "genki", en: "energetic" }, { jp: "便利", romaji: "benri", en: "convenient" },
                        { jp: "有名", romaji: "yuumei", en: "famous" }, { jp: "大切", romaji: "taisetsu", en: "important" },
                        { jp: "きれい", romaji: "kirei", en: "pretty/clean" }, { jp: "きらい", romaji: "kirai", en: "dislike/hate" },
                        { jp: "大変", romaji: "taihen", en: "tough/serious" },
                        { jp: "静かです→静かでした", romaji: "shizuka deshita", en: "was quiet (な-adj/noun past)" },
                        { jp: "静かじゃないです→静かじゃなかったです", romaji: "shizuka ja nakatta desu", en: "was not quiet (past negative)" },
                        { jp: "静かです→静かだ", romaji: "shizuka da", en: "is quiet (plain/casual register)" },
                        { jp: "静かじゃないです→静かじゃない", romaji: "shizuka ja nai", en: "is not quiet (plain/casual)" }
                    ],
                    sources: ["Tae Kim's Guide (な-adjectives)", "Wasabi Japanese adjectives guide"]
                };
            },
            buildWordBankExercises: function () {
                let wb = this.wordBank;
                let naAdj = pick(wb.naAdjectives);
                let negAdj = wb.naAdjectives[Math.floor(Math.random() * wb.naAdjectives.length)];
                let exercises = [
                    {
                        prompt: "Write: <strong>The library is " + naAdj.en + "</strong>",
                        accepted: [["としょかん", "は", naAdj.jp, "です"]],
                        hint: "としょかんは" + naAdj.jp + "です",
                        refWords: [
                            { jp: "としょかん", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: naAdj.jp, role: "adjective" }, { jp: "です", role: "auxiliary" }
                        ]
                    },
                    {
                        prompt: "Write: <strong>The library is not " + negAdj.en + "</strong>",
                        accepted: [["としょかん", "は", negAdj.jp + "じゃないです"]],
                        hint: "としょかんは" + negAdj.jp + "じゃないです",
                        refWords: [
                            { jp: "としょかん", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: negAdj.jp + "じゃないです", role: "adjective" }
                        ]
                    }
                ];
                /* Bonus: sneak peek at shelf 10c's よく, paired with this
                   lesson's own な-adjective predicate sentence shape. */
                let preview = wb.preview && wb.preview[0];
                if (preview) {
                    exercises.push({
                        prompt: "(bonus — sneak peek: shelf 10c) Write: <strong>The library is often quiet</strong>",
                        accepted: [["としょかん", "は", preview.jp, "しずか", "です"]],
                        hint: "としょかんは" + preview.jp + "しずかです",
                        refWords: [
                            { jp: "としょかん", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: preview.jp, role: "neutral" }, { jp: "しずか", role: "adjective" }, { jp: "です", role: "auxiliary" }
                        ]
                    });
                }
                return exercises;
            }
        };
    }

    function s10c() {
        return {
            id: "s10c", title: "Adverbs", subtitle: "Shelf 10c",
            wordBank: {
                iAdjectives: [{ jp: "はやい", en: "fast" }, { jp: "おそい", en: "slow" }],
                newWords: [{ jp: "はやい", en: "fast/early" }, { jp: "おそい", en: "slow/late" }, { jp: "じょうず", en: "skillful" }],
                preview: [{ jp: "おきます", en: "wake up", note: "Coming up in shelf 11a — ichidan verbs" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "What an adverb does",
                            explain: "An adverb sits right before the word it describes — usually a verb, sometimes another adjective — and answers \"how?\" or \"how much?\": 大きく笑う ('laugh loudly'), とても大きい ('very big'). Unlike English, Japanese doesn't have one universal ending like \"-ly\" — how you form an adverb depends on what kind of word you're starting from."
                        },
                        {
                            title: "い-adjective → adverb: drop い, add く",
                            explain: "大きい → 大きく ('big' → 'greatly/loudly'), 早い → 早く ('fast/early' → 'quickly/early'), 遅い → 遅く ('slow/late' → 'slowly/late'). 良い is irregular here too, same as everywhere else — it becomes よく ('well'), built from よ, never いく.",
                            diagramSvg: '<div class="grammar-box__no-diagram">'
                                + '<div class="no-diagram-steps">'
                                + '<div class="no-step"><span class="jp">大き<span class="slash-char">い</span></span><span>い-adjective</span></div>'
                                + '<div class="no-eq">&rarr;</div>'
                                + '<div class="no-step no-step--result"><span class="jp">大き<span class="add-char">く</span></span><span>drop い, add く</span></div>'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "Watch the trailing い get slashed away, then く fades in — that one swap is the whole rule (良い aside)."
                        },
                        {
                            title: "な-adjective → adverb: just add に",
                            explain: "静か → 静かに ('quiet' → 'quietly'), 上手 → 上手に ('skillful' → 'skillfully'). This is the easier of the two rules — な-adjectives don't change shape at all, they just pick up a に.",
                            diagramSvg: '<div class="grammar-box__no-diagram">'
                                + '<div class="no-diagram-steps">'
                                + '<div class="no-step"><span class="jp">静か</span><span>な-adjective</span></div>'
                                + '<div class="no-eq">&rarr;</div>'
                                + '<div class="no-step no-step--result"><span class="jp">静か<span class="add-na">に</span></span><span>just add に</span></div>'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "Nothing gets dropped here — the adjective stays whole, に just pops onto the end."
                        },
                        {
                            title: "Frequency adverbs — a closed set to just memorize",
                            explain: "A handful of very common adverbs don't derive from an adjective at all — they're their own words, and N5 expects you to just know them: いつも (always), よく (often), ときどき (sometimes), あまり (not much — always paired with a negative verb/adjective), まだ (still/not yet), もう (already), とても (very), すぐに (right away)."
                        }
                    ],
                    /* Every example below was re-checked for accuracy: particle
                       choice, verb conjugation, and adjective->adverb form
                       all verified against Tae Kim's Guide / Wasabi's
                       adverb references before this lesson shipped. Three
                       な-adjective examples and two い-adjective examples
                       were added (below the original five) per explicit
                       feedback asking for more of each -- all reuse verbs
                       and adjectives already introduced elsewhere in the
                       N5 curriculum rather than new vocabulary. */
                    examples: [
                        { jp: "猫はよく遊びます", romaji: "Neko wa yoku asobimasu.", en: "The cat often plays." },
                        { jp: "図書館はいつも静かです", romaji: "Toshokan wa itsumo shizuka desu.", en: "The library is always quiet." },
                        { jp: "これはあまり大きくないです", romaji: "Kore wa amari ookikunai desu.", en: "This isn't very big." },
                        { jp: "早く行きます", romaji: "Hayaku ikimasu.", en: "I'll go quickly." },
                        { jp: "静かに話します", romaji: "Shizuka ni hanashimasu.", en: "I'll speak quietly." },
                        { jp: "猫は元気に遊びます", romaji: "Neko wa genki ni asobimasu.", en: "The cat plays energetically. (な-adjective → adverb)" },
                        { jp: "彼は上手に歌います", romaji: "Kare wa jouzu ni utaimasu.", en: "He sings skillfully. (な-adjective → adverb)" },
                        { jp: "きれいに書きます", romaji: "Kirei ni kakimasu.", en: "I write neatly. (な-adjective → adverb)" },
                        { jp: "たのしく遊びます", romaji: "Tanoshiku asobimasu.", en: "I play happily. (い-adjective → adverb)" },
                        { jp: "おそく起きます", romaji: "Osoku okimasu.", en: "I wake up late. (い-adjective → adverb)" }
                    ],
                    vocab: [
                        { jp: "よく", romaji: "yoku", en: "often/well" }, { jp: "いつも", romaji: "itsumo", en: "always" },
                        { jp: "ときどき", romaji: "tokidoki", en: "sometimes" }, { jp: "あまり", romaji: "amari", en: "not much (+negative)" },
                        { jp: "すぐに", romaji: "sugu ni", en: "right away" }, { jp: "まだ", romaji: "mada", en: "still/not yet" },
                        { jp: "もう", romaji: "mou", en: "already" }, { jp: "とても", romaji: "totemo", en: "very" },
                        { jp: "はやい→はやく", romaji: "hayai → hayaku", en: "fast/early → quickly/early" },
                        { jp: "おそい→おそく", romaji: "osoi → osoku", en: "slow/late → slowly/late" },
                        { jp: "じょうず→じょうずに", romaji: "jouzu → jouzu ni", en: "skillful → skillfully" }
                    ],
                    sources: ["Tae Kim's Guide (adverbs)", "Wasabi Japanese adverbs guide"]
                };
            },
            buildWordBankExercises: function () {
                let wb = this.wordBank;
                let iAdj = pick(wb.iAdjectives);
                let advForm = iAdj.jp.slice(0, -1) + "く";
                let exercises = [
                    {
                        prompt: "Write: <strong>The library is always quiet</strong>",
                        accepted: [["としょかん", "は", "いつも", "しずか", "です"]],
                        hint: "としょかんはいつもしずかです",
                        refWords: [
                            { jp: "としょかん", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: "いつも", role: "neutral" }, { jp: "しずか", role: "adjective" }, { jp: "です", role: "auxiliary" }
                        ]
                    },
                    {
                        prompt: "Write: <strong>I'll go " + (iAdj.jp === "はやい" ? "quickly" : "slowly") + "</strong>",
                        accepted: [[advForm, "いきます"]],
                        hint: advForm + "いきます",
                        refWords: [{ jp: advForm, role: "neutral" }, { jp: "いきます", role: "predicate" }]
                    }
                ];
                /* Bonus: sneak peek at shelf 11a's ichidan ます-form, paired
                   with this lesson's own い-adjective-to-adverb rule. */
                let preview = wb.preview && wb.preview[0];
                if (preview) {
                    exercises.push({
                        prompt: "(bonus — sneak peek: shelf 11a) Write: <strong>I always wake up early</strong>",
                        accepted: [["いつも", "はやく", preview.jp]],
                        hint: "いつもはやく" + preview.jp,
                        refWords: [{ jp: "いつも", role: "neutral" }, { jp: "はやく", role: "neutral" }, { jp: preview.jp, role: "predicate" }]
                    });
                }
                return exercises;
            }
        };
    }

    /* SHELF 11a/11b/11c: Verbs, split into their own pages per explicit
       feedback (ichidan / godan / kuru & suru are three genuinely
       different conjugation systems, previously crammed into one shelf).
       Each page: the shared verb-basics recap (11a only, so it exists
       exactly once), then that group's own N5 verb list, THEN that
       group's ます-form conjugation pattern — in that order, per
       explicit request. */
    function s11a() {
        return {
            id: "s11a", title: "Ichidan Verbs", subtitle: "Shelf 11a",
            wordBank: {
                objects: [{ jp: "パン", en: "bread" }, { jp: "テレビ", en: "TV" }],
                verbs: [{ jp: "たべます", en: "will eat" }, { jp: "みます", en: "will watch" }],
                newWords: [{ jp: "でます", en: "will exit/leave" }, { jp: "かります", en: "will borrow" }, { jp: "おしえます", en: "will teach" }],
                preview: [{ jp: "よみます", en: "will read", note: "Coming up in shelf 11b — godan verbs" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Ichidan verbs — いる／える",
                            explain: "Ichidan verbs end in る, with an い or え sound right before it — 食べる (taberu, \"eat\"), 見る (miru, \"see\"), 起きる (okiru, \"wake up\"). Whatever the verb, it always comes last in the sentence, with を marking the object right before it: パンを食べます ('will eat bread').",
                            pattern: '<span class="pattern-box__slot">Object</span> <span class="pattern-box__fixed">を</span> <span class="pattern-box__slot">Verb</span> <span class="pattern-box__fixed">ます</span>'
                        },
                        {
                            title: "Conjugating to ます-form",
                            explain: "Ichidan verbs are the easy case: drop る, then add ます. No sound changes, no exceptions inside this group — every real ichidan verb conjugates exactly this way.",
                            pattern: '<span class="pattern-box__slot">Verb stem</span> <span class="pattern-box__fixed">る</span> &rarr; <span class="pattern-box__slot">Verb stem</span> <span class="pattern-box__fixed">ます</span>',
                            diagramSvg: '<div class="masu-diagram">'
                                + '<div class="masu-row">'
                                + '<div class="no-step"><span class="jp">食べ<span class="slash-char">る</span></span><span>taberu — dictionary form</span></div>'
                                + '<div class="no-eq">&rarr;</div>'
                                + '<div class="no-step no-step--result"><span class="jp">食べ</span><span>tabe — る is dropped</span></div>'
                                + '</div>'
                                + '<div class="masu-arrow-down">&darr;</div>'
                                + '<div class="masu-row">'
                                + '<div class="no-step"><span class="jp">食べ</span><span>tabe — the stem</span></div>'
                                + '<div class="no-eq">&rarr;</div>'
                                + '<div class="no-step no-step--result"><span class="jp">食べ<span class="add-char">ます</span></span><span>tabemasu — ます is added</span></div>'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "Two steps, zero exceptions: 食べる (taberu) → 食べ (tabe, る slashed off) → 食べます (tabemasu, ます added). Every ichidan verb follows this exact formula — try it yourself with 起きる (okiru) or 見る (miru)."
                        },
                        {
                            title: "Impostors — look ichidan, conjugate godan",
                            explain: "A handful of very common N5 verbs end in る with an い or え sound right before it, exactly like an ichidan verb — but they secretly conjugate as godan verbs instead. Drop る and add ます like ichidan here, and the ます-form comes out wrong.",
                            diagramSvg: '<div class="impostor-table-wrap"><table class="impostor-table">'
                                + '<tr><th>Verb</th><th>Meaning</th><th>ます-form (godan, not ichidan)</th></tr>'
                                + '<tr><td class="impostor-table__jp">帰る (かえる)</td><td class="impostor-table__en">to go home</td><td class="impostor-table__masu">帰ります (kaerimasu)</td></tr>'
                                + '<tr><td class="impostor-table__jp">入る (はいる)</td><td class="impostor-table__en">to enter</td><td class="impostor-table__masu">入ります (hairimasu)</td></tr>'
                                + '<tr><td class="impostor-table__jp">走る (はしる)</td><td class="impostor-table__en">to run</td><td class="impostor-table__masu">走ります (hashirimasu)</td></tr>'
                                + '<tr><td class="impostor-table__jp">知る (しる)</td><td class="impostor-table__en">to know</td><td class="impostor-table__masu">知ります (shirimasu)</td></tr>'
                                + '<tr><td class="impostor-table__jp">要る (いる)</td><td class="impostor-table__en">to need</td><td class="impostor-table__masu">要ります (irimasu)</td></tr>'
                                + '<tr><td class="impostor-table__jp">切る (きる)</td><td class="impostor-table__en">to cut</td><td class="impostor-table__masu">切ります (kirimasu)</td></tr>'
                                + '</table></div>',
                            diagramCaption: "These six show up constantly in N5 material — memorize them as a set, since there's no way to tell just by looking. See the Godan Verbs page for how their conjugation actually works."
                        }
                    ],
                    /* ます is the non-past polite form -- it covers a flat
                       present-tense habit AND a future action, and reads
                       most naturally in English as "will [verb]" rather
                       than a bare present tense, per explicit feedback
                       that "eat bread" was a misleading translation. */
                    examples: [
                        { jp: "私は起きます。", romaji: "Watashi wa okimasu.", en: "I will wake up." },
                        { jp: "私は寝ます。", romaji: "Watashi wa nemasu.", en: "I will sleep." },
                        { jp: "パンを食べます。", romaji: "Pan wo tabemasu.", en: "I will eat bread." },
                        { jp: "テレビを見ます。", romaji: "Terebi wo mimasu.", en: "I will watch TV." },
                        { jp: "本を借ります。", romaji: "Hon wo karimasu.", en: "I will borrow a book." }
                    ],
                    examplesMore: [
                        { label: "ichidan verb", href: encodeURI("../../assets/lesson pdf/N5_ICHIDAN_VERBS.pdf") }
                    ],
                    vocab: [
                        { jp: "起きる", romaji: "okiru", en: "to wake up" }, { jp: "寝る", romaji: "neru", en: "to sleep" },
                        { jp: "食べる", romaji: "taberu", en: "to eat" }, { jp: "見る", romaji: "miru", en: "to see/watch" },
                        { jp: "出る", romaji: "deru", en: "to exit/leave" }, { jp: "借りる", romaji: "kariru", en: "to borrow" },
                        { jp: "教える", romaji: "oshieru", en: "to teach" }, { jp: "いる", romaji: "iru", en: "to exist/be (people, animals)" }
                    ],
                    sources: ["Tae Kim's Guide to Japanese Grammar — verb groups and the ます-form", "Genki I — Lesson 3"]
                };
            },
            /* Object/verb pairs are curated (パン+たべます, テレビ+みます) so both
               combos stay grammatically valid and both verbs are genuinely
               ichidan. */
            buildWordBankExercises: function () {
                let wb = this.wordBank;
                let idx = Math.floor(Math.random() * wb.objects.length);
                let obj = wb.objects[idx];
                let verb = wb.verbs[idx];
                let exercises = [{
                    prompt: "Write: <strong>I " + verb.en + " " + obj.en + "</strong>",
                    accepted: [["わたし", "は", obj.jp, "を", verb.jp]],
                    hint: "わたしは" + obj.jp + "を" + verb.jp,
                    refWords: [
                        { jp: "わたし", role: "subject" }, { jp: "は", role: "particle" },
                        { jp: obj.jp, role: "object" }, { jp: "を", role: "particle" }, { jp: verb.jp, role: "predicate" }
                    ]
                }];
                /* Bonus: sneak peek at shelf 11b's godan 読みます. */
                let preview = wb.preview && wb.preview[0];
                if (preview) {
                    exercises.push({
                        prompt: "(bonus — sneak peek: shelf 11b) Write: <strong>I will read a book</strong>",
                        accepted: [["わたし", "は", "ほん", "を", preview.jp]],
                        hint: "わたしはほんを" + preview.jp,
                        refWords: [
                            { jp: "わたし", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: "ほん", role: "object" }, { jp: "を", role: "particle" }, { jp: preview.jp, role: "predicate" }
                        ]
                    });
                }
                return exercises;
            }
        };
    }

    function s11b() {
        return {
            id: "s11b", title: "Godan Verbs", subtitle: "Shelf 11b",
            wordBank: {
                /* Kana-only, per the site's "graded accepted answers stay in
                   kana" convention — the original combined shelf 11 had
                   kanji here (本, 学校, 読みます, 買います), which silently made
                   those two exercises ungradeable via plain hiragana typing;
                   fixed while splitting this content out. */
                objects: [{ jp: "ほん", en: "a book" }, { jp: "かばん", en: "a bag" }],
                places: [{ jp: "がっこう", en: "school" }],
                verbs: [{ jp: "よみます", en: "will read" }, { jp: "かいます", en: "will buy" }, { jp: "いきます", en: "will go" }],
                newWords: [
                    { jp: "しんぶん", en: "newspaper" }, { jp: "ざっし", en: "magazine" }, { jp: "てがみ", en: "letter" }
                ],
                preview: [{ jp: "します", en: "will do", note: "Coming up in shelf 11c — kuru & suru" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "N5 Godan Verbs",
                            explain: "This is the largest verb group by far. Every one ends in an u-sound &mdash; that final syllable (highlighted below) is what makes it godan: 行く (い<span class=\"godan-ending\">く</span>, go), 話す (はな<span class=\"godan-ending\">す</span>, speak), 帰る (かえ<span class=\"godan-ending\">る</span>, go home), 読む (よ<span class=\"godan-ending\">む</span>, read), 買う (か<span class=\"godan-ending\">う</span>, buy), 書く (か<span class=\"godan-ending\">く</span>, write), 聞く (き<span class=\"godan-ending\">く</span>, listen/ask), 会う (あ<span class=\"godan-ending\">う</span>, meet), 立つ (た<span class=\"godan-ending\">つ</span>, stand), 座る (すわ<span class=\"godan-ending\">る</span>, sit), 働く (はたら<span class=\"godan-ending\">く</span>, work), 休む (やす<span class=\"godan-ending\">む</span>, rest), 遊ぶ (あそ<span class=\"godan-ending\">ぶ</span>, play), 分かる (わか<span class=\"godan-ending\">る</span>, understand), 歌う (うた<span class=\"godan-ending\">う</span>, sing). That final sound is the one that changes when you conjugate it &mdash; see the ます-form diagram below."
                        },
                        {
                            title: "Conjugating to ます-form",
                            explain: "Swap the final u-sound for its matching i-sound (same row, い column), then add ます: く→き, ぐ→ぎ, す→し, つ→ち, ぬ→に, ぶ→び, む→み, う→い, る→り.",
                            pattern: '<span class="pattern-box__slot">Verb stem</span> <span class="pattern-box__fixed">(u-sound)</span> &rarr; <span class="pattern-box__slot">Verb stem</span> <span class="pattern-box__fixed">(i-sound) + ます</span>',
                            diagramSvg: '<div class="masu-diagram">'
                                + '<div class="masu-row">'
                                + '<div class="no-step"><span class="jp">飲<span class="slash-char">む</span></span><span>nomu — dictionary form</span></div>'
                                + '<div class="no-eq">&rarr;</div>'
                                + '<div class="no-step no-step--result"><span class="jp">飲</span><span>nom — う-sound dropped</span></div>'
                                + '</div>'
                                + '<div class="masu-arrow-down">&darr;</div>'
                                + '<div class="masu-row">'
                                + '<div class="no-step"><span class="jp">飲</span><span>nom — the stem</span></div>'
                                + '<div class="no-eq">&rarr;</div>'
                                + '<div class="no-step no-step--result"><span class="jp">飲<span class="add-char">みます</span></span><span>nomimasu — い-sound + ます added</span></div>'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "飲む (nomu, \"drink\") → 飲 (nom, む dropped) → 飲みます (nomimasu, み + ます added). Same two-step shape every time, just swap the u-sound for its matching い row first: 行く→行きます, 話す→話します, 読む→読みます, 買う→買います."
                        },
                        {
                            title: "Impostors — look ichidan, conjugate godan",
                            explain: "These N5 verbs end in いる/える, exactly like an ichidan verb, but are secretly godan &mdash; drop る the ichidan way and you'll get it wrong every time. Check a verb against this list (or a dictionary) rather than guessing from its ending alone.",
                            diagramSvg: '<div class="impostor-table-wrap"><table class="impostor-table">'
                                + '<tr><th>Verb</th><th>Meaning</th><th>ます-form (godan, not ichidan)</th></tr>'
                                + '<tr><td class="impostor-table__jp">帰る (かえる)</td><td class="impostor-table__en">to go home</td><td class="impostor-table__masu">帰ります (kaerimasu)</td></tr>'
                                + '<tr><td class="impostor-table__jp">入る (はいる)</td><td class="impostor-table__en">to enter</td><td class="impostor-table__masu">入ります (hairimasu)</td></tr>'
                                + '<tr><td class="impostor-table__jp">走る (はしる)</td><td class="impostor-table__en">to run</td><td class="impostor-table__masu">走ります (hashirimasu)</td></tr>'
                                + '<tr><td class="impostor-table__jp">知る (しる)</td><td class="impostor-table__en">to know</td><td class="impostor-table__masu">知ります (shirimasu)</td></tr>'
                                + '<tr><td class="impostor-table__jp">要る (いる)</td><td class="impostor-table__en">to need</td><td class="impostor-table__masu">要ります (irimasu)</td></tr>'
                                + '<tr><td class="impostor-table__jp">切る (きる)</td><td class="impostor-table__en">to cut</td><td class="impostor-table__masu">切ります (kirimasu)</td></tr>'
                                + '</table></div>',
                            diagramCaption: "帰る is the single most common trap at N5 — 帰ります, never 帰ます. The rest of this list follows the exact same rule: real u-sound godan verbs that just happen to look like they end in -iru/-eru."
                        }
                    ],
                    examples: [
                        { jp: "私は学校に行きます。", romaji: "Watashi wa gakkou ni ikimasu.", en: "I will go to school." },
                        { jp: "私は先生と話します。", romaji: "Watashi wa sensei to hanashimasu.", en: "I will speak with the teacher." },
                        { jp: "かばんを買います。", romaji: "Kaban wo kaimasu.", en: "I will buy a bag." },
                        { jp: "本を読みます。", romaji: "Hon wo yomimasu.", en: "I will read a book." },
                        { jp: "友達に会います。", romaji: "Tomodachi ni aimasu.", en: "I will meet a friend." }
                    ],
                    examplesMore: [
                        { label: "godan verb", href: encodeURI("../../assets/lesson pdf/N5_GODAN_VERBS.pdf") }
                    ],
                    vocab: [
                        { jp: "行く", romaji: "iku", en: "to go" }, { jp: "話す", romaji: "hanasu", en: "to speak" },
                        { jp: "帰る", romaji: "kaeru", en: "to go home" }, { jp: "読む", romaji: "yomu", en: "to read" },
                        { jp: "買う", romaji: "kau", en: "to buy" }, { jp: "書く", romaji: "kaku", en: "to write" },
                        { jp: "聞く", romaji: "kiku", en: "to listen/ask" }, { jp: "会う", romaji: "au", en: "to meet" },
                        { jp: "立つ", romaji: "tatsu", en: "to stand" }, { jp: "座る", romaji: "suwaru", en: "to sit" },
                        { jp: "働く", romaji: "hataraku", en: "to work" }, { jp: "休む", romaji: "yasumu", en: "to rest" },
                        { jp: "遊ぶ", romaji: "asobu", en: "to play" }, { jp: "分かる", romaji: "wakaru", en: "to understand" },
                        { jp: "歌う", romaji: "utau", en: "to sing" }, { jp: "飲む", romaji: "nomu", en: "to drink" }
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
                        prompt: "Write: <strong>I will go to " + place.en + "</strong>",
                        accepted: [["わたし", "は", place.jp, "に", verb.jp]],
                        hint: "わたしは" + place.jp + "に" + verb.jp,
                        refWords: [
                            { jp: "わたし", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: place.jp, role: "object" }, { jp: "に", role: "particle" }, { jp: verb.jp, role: "predicate" }
                        ]
                    }];
                }
                /* Bonus: sneak peek at shelf 11c's します. */
                let preview = wb.preview && wb.preview[0];
                if (preview) {
                    exercises.push({
                        prompt: "(bonus — sneak peek: shelf 11c) Write: <strong>I will study</strong>",
                        accepted: [["わたし", "は", "べんきょう", preview.jp]],
                        hint: "わたしはべんきょう" + preview.jp,
                        refWords: [
                            { jp: "わたし", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: "べんきょう", role: "object" }, { jp: preview.jp, role: "predicate" }
                        ]
                    });
                }
                return exercises;
            }
        };
    }

    function s11c() {
        return {
            id: "s11c", title: "Kuru & Suru (Irregular Verbs)", subtitle: "Shelf 11c",
            wordBank: {
                suruWords: [{ jp: "べんきょう", en: "will study" }, { jp: "でんわ", en: "will phone/call" }],
                newWords: [{ jp: "れんしゅうします", en: "will practice" }],
                preview: [{ jp: "ましょう", en: "let's...", note: "Coming up in shelf 13 — invitations" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "N5 する-verbs & 来る",
                            explain: "Only two verbs — plus the whole family of する compound verbs — don't follow either the ichidan or godan pattern at N5: する (to do, on its own) and 来る (くる, 'to come'). The compounds are just a noun glued to する: 勉強する (べんきょうする, study), 電話する (でんわする, phone/call), 練習する (れんしゅうする, practice)."
                        },
                        {
                            title: "What makes these verbs irregular",
                            explain: "する and 来る conjugate in ways that don't follow any predictable sound rule — 来る's stem sound literally changes, from く to き, which neither ichidan nor godan verbs ever do. Every する-compound conjugates exactly the same way once you know plain する's own pattern, since only する itself is doing anything irregular — the noun in front of it (勉強, 電話, 練習...) never changes."
                        },
                        {
                            title: "Conjugating to ます-form",
                            explain: "する and 来る don't follow the drop-and-swap formulas ichidan and godan verbs use — each one just has to be memorized on its own, as shown below. For a compound する-verb, keep the noun and just swap する for します: 勉強する → 勉強します, 電話する → 電話します.",
                            pattern: '<span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">する</span> &rarr; <span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">します</span>',
                            diagramSvg: '<div class="masu-diagram">'
                                + '<div class="masu-row">'
                                + '<div class="no-step"><span class="jp">す<span class="slash-char">る</span></span><span>suru — dictionary form</span></div>'
                                + '<div class="no-eq">&rarr;</div>'
                                + '<div class="no-step no-step--result"><span class="jp">し</span><span>shi — irregular stem (す&rarr;し, not a simple drop)</span></div>'
                                + '</div>'
                                + '<div class="masu-arrow-down">&darr;</div>'
                                + '<div class="masu-row">'
                                + '<div class="no-step"><span class="jp">し</span><span>shi — the stem</span></div>'
                                + '<div class="no-eq">&rarr;</div>'
                                + '<div class="no-step no-step--result"><span class="jp">し<span class="add-char">ます</span></span><span>shimasu — ます added</span></div>'
                                + '</div>'
                                + '</div>'
                                + '<div class="masu-diagram" style="margin-top:14px">'
                                + '<div class="masu-row">'
                                + '<div class="no-step"><span class="jp">く<span class="slash-char">る</span></span><span>kuru — dictionary form (来る)</span></div>'
                                + '<div class="no-eq">&rarr;</div>'
                                + '<div class="no-step no-step--result"><span class="jp">き</span><span>ki — irregular stem (く&rarr;き, the reading itself shifts)</span></div>'
                                + '</div>'
                                + '<div class="masu-arrow-down">&darr;</div>'
                                + '<div class="masu-row">'
                                + '<div class="no-step"><span class="jp">き</span><span>ki — the stem</span></div>'
                                + '<div class="no-eq">&rarr;</div>'
                                + '<div class="no-step no-step--result"><span class="jp">き<span class="add-char">ます</span></span><span>kimasu — ます added (来ます)</span></div>'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "する → し → します, and 来る (kuru) → き → 来ます (kimasu) — same two-step \"stem, then add ます\" shape as ichidan/godan, just with a stem that has to be memorized instead of derived from a rule."
                        }
                    ],
                    examples: [
                        { jp: "私は勉強します。", romaji: "Watashi wa benkyoushimasu.", en: "I will study." },
                        { jp: "友達に電話します。", romaji: "Tomodachi ni denwashimasu.", en: "I will call a friend." },
                        { jp: "練習します。", romaji: "Renshuu shimasu.", en: "I will practice." },
                        { jp: "学校に来ます。", romaji: "Gakkou ni kimasu.", en: "I will come to school." }
                    ],
                    vocab: [
                        { jp: "する", romaji: "suru", en: "to do" }, { jp: "来る", romaji: "kuru", en: "to come" },
                        { jp: "勉強する", romaji: "benkyousuru", en: "to study" }, { jp: "電話する", romaji: "denwasuru", en: "to phone/call" },
                        { jp: "練習する", romaji: "renshuusuru", en: "to practice" }
                    ],
                    sources: ["Tae Kim's Guide to Japanese Grammar — verb groups and the ます-form", "Genki I — Lesson 3"]
                };
            },
            buildWordBankExercises: function () {
                let wb = this.wordBank;
                let word = pick(wb.suruWords);
                let exercises = [
                    {
                        prompt: "Write: <strong>I " + word.en + "</strong>",
                        accepted: [["わたし", "は", word.jp, "します"]],
                        hint: "わたしは" + word.jp + "します",
                        refWords: [
                            { jp: "わたし", role: "subject" }, { jp: "は", role: "particle" },
                            { jp: word.jp, role: "object" }, { jp: "します", role: "predicate" }
                        ]
                    },
                    {
                        prompt: "Write: <strong>I come to school</strong>",
                        accepted: [["がっこう", "に", "きます"]],
                        hint: "がっこうにきます",
                        refWords: [
                            { jp: "がっこう", role: "object" }, { jp: "に", role: "particle" }, { jp: "きます", role: "predicate" }
                        ]
                    }
                ];
                /* Bonus: sneak peek at shelf 12's ましょう, built off this
                   lesson's own する-verb ます-stem (drop ます, add ましょう). */
                let preview = wb.preview && wb.preview[0];
                if (preview) {
                    exercises.push({
                        prompt: "(bonus — sneak peek: shelf 12) Write: <strong>Let's study</strong>",
                        accepted: [["べんきょう", "し" + preview.jp]],
                        hint: "べんきょうし" + preview.jp,
                        refWords: [{ jp: "べんきょう", role: "object" }, { jp: "し" + preview.jp, role: "predicate" }]
                    });
                }
                return exercises;
            }
        };
    }

    /* SHELF 13: Volitional & Invitations */
    function s12() {
        return {
            id: "s12", title: "Invitations", subtitle: "Shelf 13",
            wordBank: {
                places: [{ jp: "図書館", en: "the library", particle: "に" }, { jp: "公園", en: "the park", particle: "で" }],
                verbs: [{ jp: "行きましょう", en: "let's go to" }, { jp: "遊びませんか", en: "won't you play at" }],
                newWords: [
                    { jp: "カフェ", en: "café" }, { jp: "どうぶつえん", en: "zoo" }, { jp: "うみ", en: "sea / beach" },
                    { jp: "たのしい", en: "fun" }, { jp: "きれい", en: "pretty / beautiful" }
                ],
                preview: [{ jp: "買って", en: "buy (て-form)", note: "Coming up in shelf 14 — the て-form" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "ましょう — \"Let's...\"",
                            explain: "Both patterns build on the ます-stem already known — just swap what comes after it. Drop ます, add ましょう — 行きます becomes 行きましょう ('let's go'). A confident, ready-to-act suggestion.",
                            pattern: '<span class="pattern-box__slot">Verb</span> <span class="pattern-box__fixed">ましょう</span>',
                            diagramSvg: '<div class="grammar-box__no-diagram">'
                                + '<div class="no-diagram-steps">'
                                + '<div class="no-step"><span class="jp">行き<span class="slash-char">ます</span></span><span>ikimasu — ます-form</span></div>'
                                + '<div class="no-eq">&rarr;</div>'
                                + '<div class="no-step no-step--result"><span class="jp">行き<span class="add-char">ましょう</span></span><span>ikimashou — drop ます, add ましょう</span></div>'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "行きます (ikimasu) → 行きましょう (ikimashou, \"let's go\") — the same ます-stem you already know, just with a different ending swapped on."
                        },
                        {
                            title: "ませんか — \"Won't you...?\"",
                            explain: "The negative-question shape 行きませんか literally asks 'won't you go?' — softer and more polite than ましょう, since it leaves room for the other person to say no.",
                            pattern: '<span class="pattern-box__slot">Verb</span> <span class="pattern-box__fixed">ませんか</span>',
                            diagramSvg: '<div class="grammar-box__no-diagram">'
                                + '<div class="no-diagram-steps">'
                                + '<div class="no-step"><span class="jp">行き<span class="slash-char">ます</span></span><span>ikimasu — ます-form</span></div>'
                                + '<div class="no-eq">&rarr;</div>'
                                + '<div class="no-step no-step--result"><span class="jp">行き<span class="add-char">ませんか</span></span><span>ikimasenka — drop ます, add ませんか</span></div>'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "行きます (ikimasu) → 行きませんか (ikimasenka, \"won't you go?\") — same ます-stem again, this time swapped for the softer negative-question ending."
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

    /* SHELF 14: Conjugations (te-form + ください) */
    function s13() {
        return {
            id: "s13", title: "Conjugations", subtitle: "Shelf 14",
            wordBank: {
                verbs: [
                    { te: "食べて", en: "eat" }, { te: "話して", en: "speak" },
                    { te: "読んで", en: "read" }, { te: "買って", en: "buy" },
                    { te: "歌って", en: "sing" }, { te: "書いて", en: "write" }
                ],
                newWords: [
                    { jp: "まど", en: "window" }, { jp: "ドア", en: "door" }, { jp: "かぎ", en: "key" },
                    { jp: "あかるい", en: "bright" }, { jp: "くらい", en: "dark" }
                ],
                preview: [{ jp: "から", en: "because", note: "Coming up in shelf 15 — sentence construction" }]
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
                            explain: "Every godan verb's dictionary-form ending sorts into one of five swap rules below — drop the ending shown and replace it with what's on the right. EXCEPTION: 行く breaks its own rule → 行って, not 行いて (the single most common て-form mistake).",
                            diagramSvg: '<div class="impostor-table-wrap"><table class="impostor-table">'
                                + '<tr><th>Ending group</th><th>Swap to</th><th>Example</th></tr>'
                                + '<tr><td class="impostor-table__jp">う・つ・る</td><td class="impostor-table__masu">って</td><td class="impostor-table__en">買う &rarr; 買って (kau &rarr; katte)</td></tr>'
                                + '<tr><td class="impostor-table__jp">ぬ・ぶ・む</td><td class="impostor-table__masu">んで</td><td class="impostor-table__en">読む &rarr; 読んで (yomu &rarr; yonde)</td></tr>'
                                + '<tr><td class="impostor-table__jp">く</td><td class="impostor-table__masu">いて</td><td class="impostor-table__en">書く &rarr; 書いて (kaku &rarr; kaite)</td></tr>'
                                + '<tr><td class="impostor-table__jp">ぐ</td><td class="impostor-table__masu">いで</td><td class="impostor-table__en">泳ぐ &rarr; 泳いで (oyogu &rarr; oyoide)</td></tr>'
                                + '<tr><td class="impostor-table__jp">す</td><td class="impostor-table__masu">して</td><td class="impostor-table__en">話す &rarr; 話して (hanasu &rarr; hanashite)</td></tr>'
                                + '</table></div>',
                            diagramCaption: "Five swap rules, zero memorizing sentence-by-sentence — one exception to remember: 行く (iku) &rarr; 行って (itte), not 行いて."
                        },
                        {
                            title: "Ichidan — drop る, add て",
                            explain: "Same shape as the ます-stem already known — just add て instead of ます. Watch out: a handful of verbs LOOK ichidan (~える／~いる) but are secretly godan — see the Impostors table on the Ichidan Verbs page (帰る, 入る, 走る, 知る, 要る, 切る) — so they follow the godan う・つ・る rule above instead: 帰る &rarr; 帰って, not 帰て.",
                            diagramSvg: '<div class="masu-diagram">'
                                + '<div class="masu-row">'
                                + '<div class="no-step"><span class="jp">食べ<span class="slash-char">る</span></span><span>taberu — dictionary form</span></div>'
                                + '<div class="no-eq">&rarr;</div>'
                                + '<div class="no-step no-step--result"><span class="jp">食べ</span><span>tabe — る is dropped</span></div>'
                                + '</div>'
                                + '<div class="masu-arrow-down">&darr;</div>'
                                + '<div class="masu-row">'
                                + '<div class="no-step"><span class="jp">食べ</span><span>tabe — the stem</span></div>'
                                + '<div class="no-eq">&rarr;</div>'
                                + '<div class="no-step no-step--result"><span class="jp">食べ<span class="add-char">て</span></span><span>tabete — て is added</span></div>'
                                + '</div>'
                                + '</div>',
                            diagramCaption: "Identical two steps to the ます-form formula from shelf 11a — just swap in て instead of ます at the end."
                        },
                        {
                            title: "Irregular verbs — fixed forms, no formula",
                            explain: "する and 来る (くる, 'to come', shelf 11c) don't follow any group's rule at all — irregular verbs always have their own fixed conjugation, memorized individually rather than derived from an ending. する &rarr; して (so 勉強する &rarr; 勉強して, the same swap it makes for ます). 来る &rarr; 来て (きて). て-form also chains actions together in order, without needing a separate word for 'and' — 起きて食べます, 'I wake up and eat.'",
                            diagramSvg: '<div class="impostor-table-wrap"><table class="impostor-table">'
                                + '<tr><th>Dictionary form</th><th>て-form</th><th>Rule</th></tr>'
                                + '<tr><td class="impostor-table__jp">する (suru)</td><td class="impostor-table__masu">して (shite)</td><td class="impostor-table__en">memorized — no group</td></tr>'
                                + '<tr><td class="impostor-table__jp">来る (kuru)</td><td class="impostor-table__masu">来て (kite)</td><td class="impostor-table__en">memorized — no group</td></tr>'
                                + '</table></div>',
                            diagramCaption: "Only two irregulars exist at this level — worth memorizing by name since neither one is derivable from a rule."
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
            /* No bonus exercise: shelf 15's から needs an adjective/reason
               clause this lesson doesn't have vocab for yet — preview stays exposure-only. */
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

    /* SHELF 12: Past & Negative Tense */
    function s14() {
        return {
            id: "s14", title: "Past & Negative", subtitle: "Shelf 12",
            wordBank: {
                verbs: [
                    { neg: "読みません", past: "読みました", en: "read" },
                    { neg: "食べません", past: "食べました", en: "eat" },
                    { neg: "行きません", past: "行きました", en: "go" },
                    { neg: "話しません", past: "話しました", en: "speak" }
                ],
                newWords: [
                    { jp: "きのう", en: "yesterday" }, { jp: "きょう", en: "today" }, { jp: "あした", en: "tomorrow" },
                    { jp: "さびしい", en: "lonely" }, { jp: "うれしい", en: "happy" }
                ],
                preview: [{ jp: "ましょう", en: "let's...", note: "Coming up in shelf 13 — invitations" }]
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
            /* No bonus exercise: shelf 13's ましょう／ませんか swaps onto its own
               ます-stem taught fresh there — preview stays exposure-only. */
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
                /* This lesson's own wordBank already puts real kanji into
                   adjectives/nouns (静か, 古い, 本) — per the newWords
                   convention, kanji is fair game here too (unlike most
                   other kana-only lessons), so these five are picked
                   straight from the KANJI_READINGS furigana dictionary
                   above so their readings stay verified/correct. */
                newWords: [
                    { jp: "大きい", en: "big" }, { jp: "新しい", en: "new" }, { jp: "高い", en: "expensive / tall" },
                    { jp: "友達", en: "friend" }, { jp: "好き", en: "like / favorite" }
                ],
                preview: [{ jp: "が", en: "but (formal) / singles something out", note: "Coming up in shelf 16 — every particle, one place" }]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Basic sentence order — S-T-P-O-V",
                            explain: "Before connecting clauses together, here's the skeleton every clause is built on. Japanese word order is fixed by ROLE, not by where a word \"feels\" like it goes in English: Subject, Time, Place, Object, then the Verb, always last. Click each letter below to see what it marks and which particle(s) go with it.",
                            diagramSvg: window.NekoSTPOV.buildSignalStackHTML(),
                            diagramCaption: "私は 三時に 図書館で 本を 読みます — Subject(は) Time(に) Place(で) Object(を) Verb. Time and Place can swap order with each other, but the Verb never moves from the end, and the Subject never moves from the front."
                        },
                        {
                            title: "Practice — build the sentence",
                            explain: "Pick up a word chip, then click the slot you think matches its role. A wrong slot just shakes — try again. Three rounds, each a full S-T-P-O-V sentence.",
                            diagramSvg: window.NekoSTPOV.buildBuilderHTML()
                        },
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
            /* 静か pairs with から (な-adjective + だ + から), 古い pairs with けど (い-adjective, no だ).
               Kana-equivalent `accepted` entries alongside the kanji ones below:
               this is one of only two lessons (with shelf 16) that put real
               kanji into a graded answer at all — every other shelf's
               accepted answers are already pure kana — so a learner who
               hasn't memorized 静か/古い/本 yet can still answer correctly
               by writing しずか/ふるい/ほん instead. */
            buildWordBankExercises: function () {
                let exercises = [
                    {
                        prompt: "Write: <strong>Because it's quiet, I like it</strong>",
                        accepted: [
                            ["静か", "だ", "から", "好き", "です"], ["静かだから", "好き", "です"],
                            ["しずか", "だ", "から", "すき", "です"], ["しずかだから", "すき", "です"]
                        ],
                        hint: "静かだから好きです (しずかだからすきです)",
                        refWords: [{ jp: "静か", role: "adjective" }, { jp: "から", role: "particle" }, { jp: "好き", role: "adjective" }, { jp: "です", role: "auxiliary" }]
                    },
                    {
                        prompt: "Write: <strong>It's old, but I like it</strong>",
                        accepted: [["古い", "けど", "好き", "です"], ["ふるい", "けど", "すき", "です"]],
                        hint: "古いけど好きです (ふるいけどすきです)",
                        refWords: [{ jp: "古い", role: "adjective" }, { jp: "けど", role: "particle" }, { jp: "好き", role: "adjective" }, { jp: "です", role: "auxiliary" }]
                    },
                    {
                        prompt: "Write: <strong>A book and a bag</strong>",
                        accepted: [["本", "と", "かばん"], ["ほん", "と", "かばん"]],
                        hint: "本とかばん (ほんとかばん)",
                        refWords: [{ jp: "本", role: "object" }, { jp: "と", role: "particle" }, { jp: "かばん", role: "object" }]
                    }
                ];
                /* Bonus: sneak peek at shelf 16's formal-writing が, substituted
                   for けど in the exact same real sentence (source-noted swap). */
                let preview = this.wordBank.preview && this.wordBank.preview[0];
                if (preview) {
                    exercises.push({
                        prompt: "(bonus — sneak peek: shelf 16) Write: <strong>It's old, but I like it (formal — swap けど for " + preview.jp + ")</strong>",
                        accepted: [["古い", preview.jp, "好き", "です"], ["ふるい", preview.jp, "すき", "です"]],
                        hint: "古い" + preview.jp + "好きです (ふるい" + preview.jp + "すきです)",
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
            /* kana: alongside every kanji jp entry — this shelf and shelf 15
               are the only two lessons that put real kanji into a graded
               answer at all (every other shelf's accepted answers are
               already pure kana), so buildWordBankExercises() below accepts
               either spelling: a learner who hasn't memorized 学生/先生/
               図書館/公園/勉強します/遊びます yet can still answer correctly
               in hiragana. */
            wordBank: {
                predicates: [{ jp: "学生", kana: "がくせい", en: "a student" }, { jp: "先生", kana: "せんせい", en: "a teacher" }],
                places: [{ jp: "図書館", kana: "としょかん", en: "the library" }, { jp: "公園", kana: "こうえん", en: "the park" }],
                actions: [{ jp: "勉強します", kana: "べんきょうします", en: "study" }, { jp: "遊びます", kana: "あそびます", en: "play" }],
                /* Same jp/kana/en shape as predicates/places/actions above
                   (this lesson's own convention) — all five readings are
                   verified against the KANJI_READINGS furigana dictionary. */
                newWords: [
                    { jp: "猫", kana: "ねこ", en: "cat" }, { jp: "友達", kana: "ともだち", en: "friend" },
                    { jp: "本", kana: "ほん", en: "book" }, { jp: "大きい", kana: "おおきい", en: "big" },
                    { jp: "好き", kana: "すき", en: "like / favorite" }
                ]
            },
            buildInstruction: function () {
                return {
                    sections: [
                        {
                            title: "Every particle, one place",
                            explain: "This shelf reviews every particle taught so far (は topic shelf 3, を object shelf 11a, に location/target shelf 8, で action-location shelf 12, の possessive shelf 5, か question shelf 6, と and/with shelf 11/15, から because shelf 15, けど but shelf 15), then adds the last two: が and も. Sentence skeleton, when several particles show up together: topic/subject (は・が) → place (に・で) → thing (を) → verb.",
                            pattern: '<span class="pattern-box__slot">Noun</span> <span class="pattern-box__fixed">が/も</span> <span class="pattern-box__slot">Predicate</span>',
                            /* Ported from n5-phaser-game.js's shelf-16 "Where each
                               particle goes" sentence-skeleton diagram — reuses the
                               already-existing .conv-hl role spans (see study-style.css)
                               instead of the original's lesson-box-only
                               .lesson-box__skeleton-slot/role-* classes, same approach
                               as s06's ported diagram above. Not every sentence uses
                               every slot, but this is the fixed order when several
                               particles show up together. */
                            diagramSvg: '<div style="display:flex;flex-wrap:wrap;align-items:flex-end;gap:16px;font-size:17px;">'
                                + '<div style="display:flex;flex-direction:column;align-items:center;gap:5px;"><span class="conv-hl conv-hl--subject">猫</span><span style="font-size:11px;color:var(--term-text-dim,#c9a66b);">topic/subject</span></div>'
                                + '<div style="display:flex;flex-direction:column;align-items:center;gap:5px;"><span class="conv-hl conv-hl--particle">は・が</span><span style="font-size:11px;color:var(--term-text-dim,#c9a66b);">は / が</span></div>'
                                + '<div style="display:flex;flex-direction:column;align-items:center;gap:5px;"><span class="conv-hl conv-hl--subject">図書館</span><span style="font-size:11px;color:var(--term-text-dim,#c9a66b);">place</span></div>'
                                + '<div style="display:flex;flex-direction:column;align-items:center;gap:5px;"><span class="conv-hl conv-hl--particle">に・で</span><span style="font-size:11px;color:var(--term-text-dim,#c9a66b);">に / で</span></div>'
                                + '<div style="display:flex;flex-direction:column;align-items:center;gap:5px;"><span class="conv-hl conv-hl--subject">本</span><span style="font-size:11px;color:var(--term-text-dim,#c9a66b);">thing</span></div>'
                                + '<div style="display:flex;flex-direction:column;align-items:center;gap:5px;"><span class="conv-hl conv-hl--particle">を</span><span style="font-size:11px;color:var(--term-text-dim,#c9a66b);">object</span></div>'
                                + '<div style="display:flex;flex-direction:column;align-items:center;gap:5px;"><span class="conv-hl conv-hl--copula">読みます</span><span style="font-size:11px;color:var(--term-text-dim,#c9a66b);">verb</span></div>'
                                + '</div>',
                            diagramCaption: "Not every sentence uses every slot — but when several particles show up together, this is the order: topic/subject first, then place, then the direct object, then the verb last."
                        },
                        {
                            title: "が — singling something out",
                            explain: "が singles out exactly what fits a description — often answering an unspoken 'which one?' 猫はかわいいです ('as for the cat, it's cute' — general statement) vs. 猫がかわいいです ('IT'S the cat that's cute' — maybe among several animals, this one stands out).",
                            /* Ported from n5-phaser-game.js's は vs が reference table
                               (shelf-16) — plain HTML table instead of the original's
                               .lesson-box__particletable classes, styled inline with the
                               same conv-hl badge spans used elsewhere on this page. */
                            diagramSvg: '<table style="width:100%;border-collapse:collapse;font-size:15px;">'
                                + '<thead><tr style="text-align:left;color:var(--term-text-dim,#c9a66b);font-size:12px;text-transform:uppercase;letter-spacing:1px;">'
                                + '<th style="padding:4px 8px;"></th><th style="padding:4px 8px;">Job</th><th style="padding:4px 8px;">Example</th><th style="padding:4px 8px;">Use when...</th></tr></thead>'
                                + '<tbody>'
                                + '<tr><td style="padding:6px 8px;"><span class="conv-hl conv-hl--particle">は</span></td><td style="padding:6px 8px;">Topic marker</td><td style="padding:6px 8px;">猫はかわいいです</td><td style="padding:6px 8px;">Making a general statement about the topic.</td></tr>'
                                + '<tr><td style="padding:6px 8px;"><span class="conv-hl conv-hl--subject">が</span></td><td style="padding:6px 8px;">Subject marker</td><td style="padding:6px 8px;">猫がかわいいです</td><td style="padding:6px 8px;">Singling one thing out — often answering "which one?"</td></tr>'
                                + '</tbody></table>',
                            diagramCaption: "Same word, same predicate — only the particle changes."
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
                        accepted: [["猫", "が", "います"], ["ねこ", "が", "います"]],
                        hint: "猫がいます (ねこがいます)",
                        refWords: [{ jp: "猫", role: "subject" }, { jp: "が", role: "particle" }, { jp: "います", role: "predicate" }]
                    },
                    {
                        prompt: "Write: <strong>My friend is also " + pred.en + "</strong>",
                        accepted: [["友達", "も", pred.jp, "です"], ["ともだち", "も", pred.kana, "です"]],
                        hint: "友達も" + pred.jp + "です (ともだちも" + pred.kana + "です)",
                        refWords: [{ jp: "友達", role: "subject" }, { jp: "も", role: "particle" }, { jp: pred.jp, role: "predicate" }, { jp: "です", role: "auxiliary" }]
                    },
                    {
                        prompt: "Write: <strong>I " + action.en + " at " + place.en + " (using で)</strong>",
                        accepted: [[place.jp, "で", action.jp], [place.kana, "で", action.kana]],
                        hint: place.jp + "で" + action.jp + " (" + place.kana + "で" + action.kana + ")",
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

    /* ===== CHECKPOINT QUIZZES (cq1/cq2/cq3) =====
       A 10-question review every 5 lessons in curriculum order, same idea
       as the Adventure Room's review piles (REVIEW_1/2/3_QUIZ_QUESTIONS in
       n5-phaser-game.js) but built fresh for the Study Room's own document-
       mode engine rather than porting lesson-box.js's DOM. Segregated from
       the s01..s16 shelves and the k01 kanji track the same way k01 is
       segregated from the shelves — its own `quizGroup` flag (parallel to
       `kanjiGroup`), its own <optgroup> in renderLessonPicker(), and its
       own branch in openLesson() that hands off to renderCheckpointQuiz()
       instead of the normal currentExercises/renderExercise() flow (see
       "===== CHECKPOINT QUIZ RENDERING =====" below openLesson()).
       Question shape is copied exactly from REVIEW_1_QUIZ_QUESTIONS:
       { kind:'mc', prompt, choices, correctIndex } or
       { kind:'fill', prompt?, before, after, answer, altAnswers? } — every
       question below is drawn from the real wordBank/buildInstruction
       content of the 5 lessons it covers, nothing invented. Lessons #16-18
       (s14/s15/s16) roll straight into the existing 50-question N5 Final
       Quiz instead of getting a 4th checkpoint. */
    const CQ1_QUESTIONS = [
        // s01 — Basic Greetings
        { kind: 'mc', prompt: 'What does こんばんは mean?',
          choices: ['Good morning', 'Good evening', 'Goodbye', 'Thank you'], correctIndex: 1 },
        { kind: 'fill', prompt: '"Excuse me / Sorry":',
          before: '', after: '', answer: 'すみません', altAnswers: ['sumimasen'] },
        // s02 — Greetings & Everyday Phrases
        { kind: 'mc', prompt: 'What does よろしくお願いします mean (roughly)?',
          choices: ['Good evening', 'Nice to meet you / please treat me well', 'Goodbye', 'Excuse me'], correctIndex: 1 },
        { kind: 'fill', prompt: '"How are you?" (polite check-in):',
          before: '', after: '', answer: 'お元気ですか', altAnswers: ['ogenki desu ka', 'おげんきですか'] },
        // s02b — At Home & At the Table
        { kind: 'fill', prompt: 'Said right when you arrive back home:',
          before: '', after: '', answer: 'ただいま', altAnswers: ['tadaima'] },
        { kind: 'fill', prompt: '"Excuse me for intruding" (said entering someone’s home):',
          before: '', after: '', answer: 'お邪魔します', altAnswers: ['ojama shimasu', 'おじゃまします'] },
        // s02c — Filler Words & Reactions
        { kind: 'mc', prompt: 'What does なるほど mean?',
          choices: ['I see / that makes sense', 'Probably', 'Not at all', 'First of all'], correctIndex: 0 },
        { kind: 'mc', prompt: 'Which word means "not at all" (paired with a negative)?',
          choices: ['多分', 'それほど', '全然', 'やっぱり'], correctIndex: 2 },
        // s03 — A は B です
        { kind: 'fill', prompt: 'Complete with the topic marker: これ___ほんです。',
          before: 'これ', after: 'ほんです。', answer: 'は', altAnswers: ['wa'] },
        { kind: 'fill', prompt: '"I was a student" (past tense): わたしはがくせい___。',
          before: 'わたしはがくせい', after: '。', answer: 'でした', altAnswers: ['deshita'] }
    ];

    function cq1() {
        return {
            id: "cq1", title: "Checkpoint Quiz 1 (Shelves 1–5)", subtitle: "10-question checkpoint",
            quizGroup: true,
            questions: CQ1_QUESTIONS,
            buildInstruction: function () {
                return {
                    sections: [{
                        title: "Checkpoint Quiz 1 — Shelves 1–5",
                        explain: "A 10-question review covering everything so far: Basic Greetings (s01), Greetings & Everyday Phrases (s02), At Home & At the Table (s02b), Filler Words & Reactions (s02c), and A は B です (s03). Answer all 10 questions on the right, then submit to see your score and the correct answers."
                    }]
                };
            }
        };
    }

    const CQ2_QUESTIONS = [
        // s04 — Self Introduction
        { kind: 'fill', prompt: '"What is your name?" (polite): ___は何ですか。',
          before: '', after: 'は何ですか。', answer: 'お名前', altAnswers: ['onamae', 'o-namae', 'おなまえ'] },
        { kind: 'mc', prompt: 'What is the correct order of a self-introduction (jikoshoukai)?',
          choices: ['Close → Name → Greet', 'Greet → Name → Close', 'Name → Close → Greet', 'Greet → Close → Name'], correctIndex: 1 },
        // s05 — Demonstratives
        { kind: 'mc', prompt: 'What does あれ mean?',
          choices: ['This', 'That (near listener)', 'That over there (far from both)', 'Which one'], correctIndex: 2 },
        { kind: 'fill', prompt: '"Where" (asking about a place):',
          before: '', after: '', answer: 'どこ', altAnswers: ['doko'] },
        // s06 — Questions (か)
        { kind: 'mc', prompt: 'What does だれ mean?',
          choices: ['What', 'Who', 'When', 'Where'], correctIndex: 1 },
        { kind: 'fill', prompt: 'Turn a statement into a question by adding this to the end: これはほんです___',
          before: 'これはほんです', after: '', answer: 'か', altAnswers: ['ka'] },
        // s07b — つ & 匹 Counters
        { kind: 'mc', prompt: 'Which counter is used for small animals like cats?',
          choices: ['つ', '匹', '時', '分'], correctIndex: 1 },
        // s07c — Telling Time
        { kind: 'fill', prompt: '"4 o’clock" (special reading, not よんじ):',
          before: '', after: '', answer: 'よじ', altAnswers: ['yoji'] },
        // s08a — There Is/Are & Places
        { kind: 'mc', prompt: 'Which word means "there is / are" for people and animals?',
          choices: ['あります', 'います', 'ください', 'です'], correctIndex: 1 },
        // s08b — Direction Words
        { kind: 'fill', prompt: '"Next to" (direction word):',
          before: '', after: '', answer: '隣', altAnswers: ['となり', 'tonari'] }
    ];

    function cq2() {
        return {
            id: "cq2", title: "Checkpoint Quiz 2 (Shelves 6–10)", subtitle: "10-question checkpoint",
            quizGroup: true,
            questions: CQ2_QUESTIONS,
            buildInstruction: function () {
                return {
                    sections: [{
                        title: "Checkpoint Quiz 2 — Shelves 6–10",
                        explain: "A 10-question review covering Self Introduction (s04), Demonstratives (s05), Questions か (s06), Numbers (s07a–e), and Places & Directions (s08a–d). Answer all 10 questions on the right, then submit to see your score and the correct answers."
                    }]
                };
            }
        };
    }

    const CQ3_QUESTIONS = [
        // s09b — Pronouns
        { kind: 'mc', prompt: 'What does あなた mean?',
          choices: ['you', 'he / him', 'we / us', 'everyone'], correctIndex: 0 },
        { kind: 'fill', prompt: '"This kind of ___" (asking/describing a kind, not one specific thing): ___本',
          before: '', after: '本', answer: 'こんな', altAnswers: ['konna'] },
        // s10b — な-Adjectives
        { kind: 'mc', prompt: 'Which of these is a な-adjective (negates with じゃないです, not くない)?',
          choices: ['大きい', '静か', '新しい', '高い'], correctIndex: 1 },
        // s10a — い-Adjectives
        { kind: 'fill', prompt: '"This book is not small." — この本は小さ___です。',
          before: 'この本は小さ', after: 'です。', answer: 'くない', altAnswers: ['kunai'] },
        // s11b — Godan Verbs
        { kind: 'mc', prompt: 'Which verb group does 帰る (かえる, "to go home") secretly belong to, despite looking like an ichidan る-verb?',
          choices: ['Ichidan', 'Godan', 'する-verb', 'Irregular'], correctIndex: 1 },
        // s11a — Ichidan Verbs (verb basics: を marks the object)
        { kind: 'fill', prompt: '"I read a book." — 本___読みます。 (object marker)',
          before: '本', after: '読みます。', answer: 'を', altAnswers: ['o', 'wo'] },
        // s12 — Invitations
        { kind: 'mc', prompt: 'Which pattern politely asks "Won’t you...?", leaving room for the other person to decline?',
          choices: ['〜ましょう', '〜ませんか', '〜ましょうか', '〜てください'], correctIndex: 1 },
        { kind: 'fill', prompt: '"Let’s go to the library." — 図書館に行き___。',
          before: '図書館に行き', after: '。', answer: 'ましょう', altAnswers: ['mashou'] },
        // s13 — Conjugations (て-form)
        { kind: 'mc', prompt: 'What is the て-form of 買う ("to buy")?',
          choices: ['買いて', '買って', '買んで', '買した'], correctIndex: 1 },
        { kind: 'fill', prompt: '"Please write it." — 書いて___。',
          before: '書いて', after: '。', answer: 'ください', altAnswers: ['kudasai'] }
    ];

    function cq3() {
        return {
            id: "cq3", title: "Checkpoint Quiz 3 (Shelves 11–15)", subtitle: "10-question checkpoint",
            quizGroup: true,
            questions: CQ3_QUESTIONS,
            buildInstruction: function () {
                return {
                    sections: [{
                        title: "Checkpoint Quiz 3 — Shelves 11–15",
                        explain: "A 10-question review covering Nouns & Pronouns (s09a/s09b), Adjectives & Adverbs (s10a/s10b/s10c), Verbs (s11a/s11b/s11c), Invitations (s12), and Conjugations — the て-form (s13). Answer all 10 questions on the right, then submit to see your score and the correct answers."
                    }]
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
    // Same synthetic shelf-group labels as GROUP_LABELS in
    // n5-lessons-dashboard.js -- shown as a disabled header option above a
    // lettered run that has no bare lesson of its own (07a-e, 08a-d).
    var SHELF_GROUP_LABELS = {
        "07": "Numbers & Counters",
        "08": "Places & Directions",
        "09": "Nouns & Pronouns",
        "10": "Adjectives & Adverbs",
        "11": "Verbs"
    };

    function lessonOptionLabel(les) {
        let done = window.StudyProgress && StudyProgress.isLessonDone(les.id);
        /* Kanji-track lessons carry their name in the title already
           ("N5 Kanji") — numbering it like a shelf ("19. N5 Kanji")
           would just restate the segregation the optgroup below
           already provides. */
        if (les.kanjiGroup) return (done ? "✓ " : "") + les.title;
        /* Checkpoint quizzes carry their own "Checkpoint Quiz N (Shelves
           X–Y)" name already — same reasoning as the kanji-group branch
           above, no shelf-number prefix needed on top of that. */
        if (les.quizGroup) return (done ? "✓ " : "") + les.title;
        /* Lettered ids (s07a, s08b...) are sub-lessons of a shared numbered
           shelf — indent them so the dropdown reads as "shelf 7, then its
           four sub-lessons" instead of a flat, unrelated list. */
        let isSubLesson = /^s\d+[a-z]$/.test(les.id);
        let prefix = isSubLesson ? "   ↳ " : "";
        return (done ? "✓ " : "") + prefix + les.id.replace("s", "") + ". " + les.title;
    }

    function renderLessonPicker() {
        let select = $("studyLessonSelect");
        if (!select) return;
        select.innerHTML = "";
        /* Kanji lessons and checkpoint quizzes are both segregated tracks,
           not more numbered shelves — their own <optgroup>s keep that
           visually true in the dropdown instead of just interleaving them
           into the shelf sequence. */
        let shelvesGroup = document.createElement("optgroup");
        shelvesGroup.label = "Shelves — Grammar & Vocab";
        let kanjiGroupEl = document.createElement("optgroup");
        kanjiGroupEl.label = "N5 Kanji";
        let quizGroupEl = document.createElement("optgroup");
        quizGroupEl.label = "Checkpoint Quizzes";
        // Curriculum order lets a single pass detect "entering a lettered
        // run with no bare lesson before it" (07a right after s06, 08a
        // right after s07e) and insert a disabled header option there --
        // matches the folder > shelf-group > lettered-lesson hierarchy
        // used on the lessons directory page. 02b/02c need no such header
        // since s02 itself, immediately before them, already reads as one.
        let lastNumPrefix = null;
        lessons.forEach(function (les) {
            if (les.kanjiGroup || les.quizGroup) {
                let opt = document.createElement("option");
                opt.value = les.id;
                opt.textContent = lessonOptionLabel(les);
                (les.kanjiGroup ? kanjiGroupEl : quizGroupEl).appendChild(opt);
                return;
            }
            let m = les.id.match(/^s(\d+)([a-z]?)$/);
            let numPrefix = m ? m[1] : null;
            let letter = m ? m[2] : "";
            if (letter && numPrefix !== lastNumPrefix) {
                let header = document.createElement("option");
                header.disabled = true;
                header.textContent = "── " + numPrefix + " " + (SHELF_GROUP_LABELS[numPrefix] || "") + " ──";
                shelvesGroup.appendChild(header);
            }
            lastNumPrefix = numPrefix;
            let opt = document.createElement("option");
            opt.value = les.id;
            opt.textContent = lessonOptionLabel(les);
            shelvesGroup.appendChild(opt);
        });
        select.appendChild(shelvesGroup);
        select.appendChild(kanjiGroupEl);
        select.appendChild(quizGroupEl);
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

        let mainEl = document.querySelector(".study-main");
        if (mainEl) mainEl.classList.toggle("is-kanji-lesson", !!currentLesson.kanjiGroup);
        if (mainEl) mainEl.classList.toggle("is-checkpoint-lesson", !!currentLesson.quizGroup);

        if (currentLesson.kanjiGroup) {
            /* Card-gallery UI, not a quiz — there's no single "correct
               answer" to grade when browsing kanji, so this skips the
               whole currentExercises/renderExercise machinery entirely
               and hands off to assets/js/kanji-cards.js instead. */
            hide($("studyPractice"));
            hide($("studyComplete"));
            hide($("checkpointQuiz"));
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

        if (currentLesson.quizGroup) {
            /* All 10 questions rendered at once as one sheet, graded on
               Submit — not the one-at-a-time currentExercises/
               renderExercise() flow the s01-s16 shelves use — so this
               skips that machinery entirely too, same as the kanjiGroup
               branch above, and hands off to renderCheckpointQuiz()
               instead (see "===== CHECKPOINT QUIZ RENDERING =====" below). */
            hide($("studyPractice"));
            hide($("studyComplete"));
            hide($("kanjiCards"));
            let quizWrap = $("checkpointQuiz");
            show(quizWrap);
            renderCheckpointQuiz(currentLesson, quizWrap);
            return;
        }

        hide($("kanjiCards"));
        hide($("checkpointQuiz"));
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

    /* Renders an optional `conversation: { turns: [...] }` field on
       buildInstruction()'s return value as a two-party dialogue thread —
       Study Room's own equivalent of the Adventure Room's LessonBox
       'conversation' page type, built fresh for this file's own DOM/CSS
       rather than reusing lesson-box.js's markup (same reasoning as every
       other Study Room feature: this engine deliberately doesn't share
       code with the Phaser game's dialogue component). Each turn is
       `{ speaker: 'sensei'|'player', name, action, actionLabel, text, romaji }` —
       `action` must be a key in CONV_ACTION_SPRITES (meow/scratch/
       tailwagFront/tailwagLeft/tailwagRight). `text` may contain
       `.conv-hl--subject/particle/predicate/copula` spans for word-role
       highlighting, styled in study-style.css with the exact same colors
       lesson-box.css uses for its own `.role-*` spans, so a ported
       conversation reads identically in both systems. */
    function renderConversation(conv) {
        let turnsHtml = conv.turns.map(function (t) {
            let sprite = CONV_ACTION_SPRITES[t.action] || CONV_ACTION_SPRITES.meow;
            let color = t.speaker === "player" ? "orange" : "black";
            /* Percentage-based background-position (0% -> 100%) needs no
               per-frame-count keyframe variant — steps(N) alone decides
               how many discrete positions that same 0-100% range gets
               divided into, matching the technique companion-cat.css
               uses for its own multi-sheet animations. 0.28s/frame
               matches this site's other cat-sprite loops exactly
               (e.g. companion-cat.css's 1.4s/5-frame tailwag). */
            let avatarStyle = "background-image:url('" + sprite[color] + "');"
                + "background-size:" + (sprite.frames * 100) + "% 100%;"
                + "animation:studyConvSprite " + (sprite.frames * 0.28).toFixed(2) + "s steps(" + sprite.frames + ") infinite;";
            return "<div class='study-conv-turn" + (t.speaker === "player" ? " is-player" : "") + "'>"
                + "<div class='study-conv-avatar' style=\"" + avatarStyle + "\"></div>"
                + "<div class='study-conv-bubble-wrap'>"
                + "<div class='study-conv-name-row'>"
                + "<span class='study-conv-name'>" + t.name + "</span>"
                + (t.actionLabel ? "<span class='study-conv-action-tag'>" + t.actionLabel + "</span>" : "")
                + "</div>"
                + "<div class='study-conv-bubble'>" + t.text + "</div>"
                + (t.romaji ? "<div class='study-conv-meta'>" + t.romaji + "</div>" : "")
                + "</div>"
                + "</div>";
        }).join("");
        return "<div class='study-conv-thread'>" + turnsHtml + "</div>";
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
                + (sec.diagramSvg ? "<div class='grammar-box__diagram'>" + sec.diagramSvg + "</div>" : "")
                + (sec.diagramCaption ? "<p class='grammar-box__diagram-caption'>" + sec.diagramCaption + "</p>" : "")
                + (sec.culture ? "<p class='grammar-box__culture'>&#127760; " + sec.culture + "</p>" : "")
                + "</div>";
        });

        if (inst.conversation && inst.conversation.turns && inst.conversation.turns.length) {
            html += renderConversation(inst.conversation);
        }

        if (inst.examples && inst.examples.length) {
            html += "<h3>Examples</h3>";
            inst.examples.forEach(function (ex) {
                html += "<div class='example-sentence'>"
                    + "<span>" + annotateFurigana(ex.jp) + "</span>"
                    + (ex.romaji ? "<span class='example-sentence__romaji'>" + ex.romaji + "</span>" : "")
                    + "<span class='example-sentence__english'>&mdash; " + ex.en + "</span>"
                    + "</div>";
            });
            /* Points to a full reference PDF (assets/lesson pdf/) for shelves
               whose curated example set is a small slice of a much bigger
               real list -- same PDFs the Adventure Room's printer-icon popup
               already links per shelf (see PRINT_LINKS_BY_SHELF in
               n5-phaser-game.js), just surfaced inline here instead of
               behind an icon click. */
            if (inst.examplesMore && inst.examplesMore.length) {
                /* Paraphrased per feedback that "you can view the whole list
                   of X by downloading this" read as awkward/unclear -- says
                   plainly what the file is and what's in it instead. */
                html += "<p class='examples-more'>"
                    + inst.examplesMore.map(function (l) {
                        return "Want the full " + l.label + " list, beyond the examples above? "
                            + "<a class='examples-more__link' href='" + l.href + "' target='_blank' rel='noopener'>Download the " + l.label + " reference sheet (PDF)</a>.";
                    }).join(" ")
                    + "</p>";
            }
        }

        /* The kanji-track lesson's own "vocab" IS its 103-entry kanji
           list and its wordBank.kanji is that same list again — both
           just duplicate the card gallery next to it (see kanji-cards.js)
           and, at 103 rows, dominate the panel for no reason. Skip both
           here; the shelf lessons still get the full vocab table + word
           bank box. Checkpoint-quiz lessons (cq1/cq2/cq3) have no
           wordBank/vocab of their own at all — they're a review of 5
           earlier lessons' content, not a new lesson with its own set —
           so they're excluded the same way. */
        if (!currentLesson.kanjiGroup && !currentLesson.quizGroup) {
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
            return "<tr><td class='vocab-table__jp'>" + annotateFurigana(w.jp) + "</td>"
                + "<td class='vocab-table__romaji'>" + (w.romaji || "") + "</td>"
                + "<td class='vocab-table__en'>" + w.en + "</td></tr>";
        }).join("");
        return "<div class='vocab-table-wrap'><table class='vocab-table'>" + rows + "</table></div>";
    }


    /* Renders the word-bank box in the instruction panel. Used to also list
       every category of vocab the lesson's exercises are allowed to draw
       from (subjects/verbs/particles/etc, straight from the lesson's
       wordBank object) — but that just repeated the same words already
       shown in the lesson's own vocab table above (buildVocabTable()),
       so it was cut per explicit feedback ("kinda redundant... to have
       the vocabulary, then phrases again"). What's actually still useful
       here is content NOT already shown elsewhere: the "New this lesson"
       exposure-only words and the next-lesson preview chips. The exercise
       grading logic (buildWordBankExercises()) is untouched — it still
       pulls from the lesson's full wordBank object regardless of what
       this box displays. */
    function buildWordBankBox(wordBank) {
        if (!wordBank) return "";
        /* "New this lesson" — exposure-only vocabulary, exactly like the
           preview block below (never wired into buildWordBankExercises()/
           grading), just surfacing 5 fresh nouns/adjectives for THIS
           lesson instead of a sneak peek at the next one. Visually
           distinct from the amber "coming up" preview chips below via
           its own --new-tokened modifier classes (see study-style.css). */
        let newWordsHtml = "";
        if (wordBank.newWords && wordBank.newWords.length) {
            let newChips = wordBank.newWords.map(function (w) {
                return "<span class='word-bank__chip word-bank__chip--new' data-role='new'>" + w.jp
                    + "<span class='word-bank__chip-tag word-bank__chip-tag--new'>NEW &mdash; “" + w.en + "”</span></span>";
            }).join("");
            newWordsHtml = "<div class='word-bank-box__new'>"
                + "<div class='word-bank-box__new-label'>🆕 New this lesson:</div>"
                + "<div class='word-bank'>" + newChips + "</div>"
                + "</div>";
        }
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
        if (!newWordsHtml && !previewHtml) return "";
        return "<div class='word-bank-box'>"
            + "<div class='word-bank-box__title'>&#128274; Word bank</div>"
            + newWordsHtml
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

        /* Reference chips for this exercise's words used to render up front,
           before the learner had even tried — which meant the "exercise"
           was really just copying the shown words into the input box
           instead of recalling them. Per explicit feedback ("remove the
           words in the exercise... let the user properly think things
           through"), this now stays empty at render time; showHint() is
           what populates it, and only once the learner has earned it via
           2 wrong attempts (see checkAnswer()'s attempts >= 2 branch). */
        let refWrap = $("studyWordBankRef");
        if (refWrap) refWrap.innerHTML = "";

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
            /* Hint stays hidden until the learner has actually tried —
               revealed after 2 wrong attempts in checkAnswer() below,
               instead of being available from the very first look. */
            hide(hintBtn);
            if (input) {
                show(input);
                input.value = "";
                input.disabled = false;
                input.className = "study-practice__input";
                input.placeholder = ex.openEnded
                    ? "Type your full self-introduction here, all on one line..."
                    : "Type your answer in hiragana...";
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
        /* Three grading modes, checked in order of how open-ended they are:
           - `openEnded` (free-write, e.g. s04's jiko-shoukai capstone): no
             single correct answer exists, so `validate` (if given) checks
             for the loose shape of a real attempt; with no `validate` any
             non-empty input passes.
           - `pattern` (a RegExp): grades by sentence SHAPE instead of one
             fixed string — used by exercises that let the learner pick any
             word from the word bank rather than one baked-in "correct" word
             (see s03/s05).
           - otherwise: the original exact-match-against-accepted behavior,
             unchanged for every exercise that doesn't opt into the above. */
        let accepted;
        if (ex.openEnded) {
            accepted = ex.validate ? ex.validate(input.value, userVal) : userVal.length > 0;
        } else if (ex.pattern) {
            accepted = ex.pattern.test(userVal);
        } else {
            accepted = ex.accepted.some(function (acc) {
                let fullSentence = acc.join("");
                return norm(fullSentence) === userVal;
            });
        }

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
                showFeedback("&#10007; " + (ex.openEnded ? "here's the pattern to follow: " : "the answer was: ") + "<strong>" + ex.hint + "</strong>", "reveal");
                show($("studyNextBtn"));
                hide($("studyCheckBtn"));
                hide($("studyHintBtn"));
            } else {
                showFeedback("&#10007; not quite &middot; " + (maxAttempts - attempts) + " attempt" + (maxAttempts - attempts === 1 ? "" : "s") + " left &middot; streak reset", "wrong");
                /* Reveal the hint button only once the learner has genuinely
                   struggled (2 wrong tries), not on the very first look. */
                if (attempts >= 2) show($("studyHintBtn"));
            }
        }
    }

    function nextExercise() {
        exerciseIndex++;
        renderExercise();
    }

    /* ===== HINT =====
       Only reachable after 2 wrong attempts (checkAnswer() gates the
       button itself). Reveals the WORDS the sentence needs — same
       reference chips that used to render up front — not the full
       constructed sentence, so the learner still has to work out order
       and particles themselves rather than just re-reading the answer.
       Exercises without refWords (a few pattern/open-ended ones) fall
       back to the old full-hint text since there's no word list to show. */
    function showHint() {
        let ex = currentExercises[exerciseIndex];
        if (!ex) return;
        let refWrap = $("studyWordBankRef");
        if (refWrap && ex.refWords && ex.refWords.length) {
            refWrap.innerHTML = shuffle(ex.refWords).map(function (w) {
                return "<span class='word-bank__chip word-bank__chip--ref' data-role='" + (w.role || "neutral") + "'>" + w.jp + "</span>";
            }).join("");
            showFeedback("Hint &mdash; here are the words you'll need. Work out the order and particles yourself!", "hint");
        } else {
            showFeedback("Hint: <strong>" + ex.hint + "</strong>", "hint");
        }
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

    /* ===== CHECKPOINT QUIZ RENDERING (cq1/cq2/cq3) =====
       All 10 questions render on one sheet at once — radio-style buttons
       for 'mc', a text input for 'fill' — rather than the one-at-a-time
       currentExercises/renderExercise() flow the s01-s16 shelves use.
       No inline grading while answering (same "answer everything, then
       compare against the key" idea as the Adventure Room's quiz-review/
       quiz-answers pages in lesson-box.js) — Submit reveals every correct
       answer next to the player's own pick, tallies a score, and awards
       XP via the same StudyProgress.completeLesson() every other lesson
       in this file uses (once per lesson id, no score-gating). */
    function gradeCheckpointFill(q, raw) {
        /* Same normalization this file already uses for grading elsewhere
           (norm() — see checkAnswer() above) plus a case-fold, since some
           altAnswers here are romaji (matching gradeQuizQuestion()'s
           .trim().toLowerCase() approach in lesson-box.js). */
        let typed = norm((raw || "").toLowerCase());
        let accepted = [q.answer].concat(q.altAnswers || []).map(function (a) {
            return norm(a.toLowerCase());
        });
        return accepted.indexOf(typed) !== -1;
    }

    function renderCheckpointQuiz(lesson, container) {
        if (!container) return;
        let questions = lesson.questions || [];
        let quizAnswers = {};
        let submitted = false;

        function renderSheet() {
            let questionsHtml = questions.map(function (q, i) {
                let promptHtml = "<div class='checkpoint-quiz__prompt'>" + (i + 1) + ". " + (q.prompt || "") + "</div>";
                if (q.kind === "mc") {
                    let choicesHtml = q.choices.map(function (choice, ci) {
                        let selected = quizAnswers[i] === ci ? " is-selected" : "";
                        return "<button type='button' class='checkpoint-quiz__choice" + selected + "' data-q='" + i + "' data-choice='" + ci + "'>" + choice + "</button>";
                    }).join("");
                    return "<div class='checkpoint-quiz__block' data-q='" + i + "'>" + promptHtml
                        + "<div class='checkpoint-quiz__choices'>" + choicesHtml + "</div></div>";
                }
                let val = quizAnswers[i] || "";
                return "<div class='checkpoint-quiz__block' data-q='" + i + "'>" + promptHtml
                    + "<div class='checkpoint-quiz__fill'>" + (q.before || "")
                    + "<input type='text' class='checkpoint-quiz__input' data-q='" + i + "' autocomplete='off' spellcheck='false' value=\""
                    + String(val).replace(/"/g, "&quot;") + "\">"
                    + (q.after || "") + "</div></div>";
            }).join("");

            container.innerHTML = "<div class='checkpoint-quiz__title'>" + lesson.title + "</div>"
                + "<p class='checkpoint-quiz__intro'>Answer all " + questions.length + " questions below, then submit to see your score.</p>"
                + "<div class='checkpoint-quiz__sheet'>" + questionsHtml + "</div>"
                + "<button type='button' class='checkpoint-quiz__submit' id='checkpointQuizSubmit'" + (submitted ? " disabled" : "") + ">Submit</button>"
                + "<div class='checkpoint-quiz__result' id='checkpointQuizResult'></div>";

            Array.prototype.forEach.call(container.querySelectorAll(".checkpoint-quiz__choice"), function (btn) {
                btn.disabled = submitted;
                btn.addEventListener("click", function () {
                    if (submitted) return;
                    let qi = Number(btn.dataset.q);
                    quizAnswers[qi] = Number(btn.dataset.choice);
                    let block = container.querySelector(".checkpoint-quiz__block[data-q='" + qi + "']");
                    if (block) {
                        Array.prototype.forEach.call(block.querySelectorAll(".checkpoint-quiz__choice"), function (b) {
                            b.classList.remove("is-selected");
                        });
                    }
                    btn.classList.add("is-selected");
                });
            });
            Array.prototype.forEach.call(container.querySelectorAll(".checkpoint-quiz__input"), function (input) {
                input.disabled = submitted;
                input.addEventListener("input", function () {
                    quizAnswers[Number(input.dataset.q)] = input.value;
                });
            });

            let submitBtn = $("checkpointQuizSubmit");
            if (submitBtn) submitBtn.addEventListener("click", gradeAndShow);
        }

        function gradeAndShow() {
            submitted = true;
            let correctCount = 0;
            let rowsHtml = questions.map(function (q, i) {
                let userAnswer = quizAnswers[i];
                let correct, yourLabel, correctLabel;
                if (q.kind === "mc") {
                    correct = userAnswer === q.correctIndex;
                    yourLabel = userAnswer != null ? q.choices[userAnswer] : "(no answer)";
                    correctLabel = q.choices[q.correctIndex];
                } else {
                    correct = gradeCheckpointFill(q, userAnswer);
                    yourLabel = (userAnswer && String(userAnswer).trim()) ? userAnswer : "(no answer)";
                    correctLabel = q.answer;
                }
                if (correct) correctCount++;
                return "<div class='checkpoint-quiz__result-row'>"
                    + "<span class='checkpoint-quiz__result-mark " + (correct ? "is-correct" : "is-wrong") + "'>" + (correct ? "&#10003;" : "&#10007;") + "</span>"
                    + "<div><div class='checkpoint-quiz__result-correct'>" + (i + 1) + ". Correct: <strong>" + correctLabel + "</strong></div>"
                    + "<div class='checkpoint-quiz__result-yours'>Your answer: " + yourLabel + "</div></div>"
                    + "</div>";
            }).join("");

            let pct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
            let xpGained = 0;
            let alreadyDone = false;
            if (window.StudyProgress) {
                let result = StudyProgress.completeLesson(lesson.id);
                xpGained = result.gained || 0;
                alreadyDone = !(result.gained > 0);
                StudyProgress.renderXpBadges();
                refreshLessonPickerLabels();
            }

            let resultWrap = $("checkpointQuizResult");
            if (resultWrap) {
                resultWrap.innerHTML = "<div class='checkpoint-quiz__score'>" + correctCount + " / " + questions.length + " (" + pct + "%)</div>"
                    + "<div class='checkpoint-quiz__xp'>+" + xpGained + " XP" + (alreadyDone ? " &mdash; already completed before, no bonus XP" : "") + "</div>"
                    + rowsHtml;
            }
            let submitBtn = $("checkpointQuizSubmit");
            if (submitBtn) submitBtn.disabled = true;
            Array.prototype.forEach.call(container.querySelectorAll(".checkpoint-quiz__choice"), function (btn) { btn.disabled = true; });
            Array.prototype.forEach.call(container.querySelectorAll(".checkpoint-quiz__input"), function (input) { input.disabled = true; });
        }

        renderSheet();
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
