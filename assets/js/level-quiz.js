/* N5 Final Quiz — a JLPT-style exam covering all 16 shelves + the N5
   kanji track, in five sections, exam-sheet style: every question in a
   section is shown at once with radio-button choices, you fill in the
   whole sheet, hit Submit, and the sheet re-renders in place with the
   correct answer underlined on every question (plus your own pick
   marked if it was wrong) before moving to the next section.
     1. Vocabulary & Grammar (15, multiple choice)
     2. Kanji Reading (15, multiple choice)
     3. Sentence Order — the "star" method real JLPT uses: a sentence
        with 4 blanks, one marked with a star, and 4 words to place
        into it in the right order; you pick which word lands on the
        star (10, multiple choice)
     4. Reading Comprehension — a short passage + a question about it
        (5, multiple choice)
     5. Word Usage — given a word, pick the one sentence among four
        that actually uses it correctly (5, multiple choice)
   Every kind above reduces to the same shape once prepareQuestion()
   runs — {prompt, extraHtml, choices, correctIndex, reveal} — so one
   render/grade path covers all five kinds instead of five near-
   duplicate code paths.
   Awards XP via StudyProgress on first pass (>= 70%) once all five
   section sheets have been submitted. */
(function () {
    "use strict";

    /* ── Question Bank (raw, kind-specific shape) ─────────────────── */

    const RAW_QUESTIONS = [
        /* ===== Section 1 — Vocabulary & Grammar (15, mc) ===== */
        { kind: "mc", section: 1,
            prompt: "What does the particle は (wa) do in a sentence?",
            choices: ["Marks the object", "Marks the topic", "Marks the location", "Marks the question"],
            correctIndex: 1, shelf: "s03" },
        { kind: "mc", section: 1,
            prompt: "What does adding か at the end of a sentence do?",
            choices: ["Makes it past tense", "Makes it polite", "Turns it into a question", "Makes it negative"],
            correctIndex: 2, shelf: "s06" },
        { kind: "mc", section: 1,
            prompt: "Which word means ‘library’?",
            choices: ["にさんぶき (三匹)", "としょかん (図書館)", "おにゃ (屋根)", "せんせい (専家)"],
            correctIndex: 1, shelf: "s05" },
        { kind: "mc", section: 1,
            prompt: "Which sentence means ‘My friend is also a student.’?",
            choices: ["友達は学生です", "友達も学生です", "友達に学生です", "友達を学生です"],
            correctIndex: 1, shelf: "s16a" },
        { kind: "mc", section: 1,
            prompt: "What does ててください mean?",
            choices: ["Please do (polite request)", "Please don’t do", "I will do (future)", "I want to do"],
            correctIndex: 0, shelf: "s13" },
        { kind: "mc", section: 1,
            prompt: "Which counter is used for long, thin objects like pencils?",
            choices: ["個 (ko)", "本 (hon)", "枚 (mai)", "匹 (hiki)"],
            correctIndex: 1, shelf: "s07b" },
        { kind: "mc", section: 1,
            prompt: "Which particle marks the destination of movement, as in 学校___行きます?",
            choices: ["が", "に", "で", "を"],
            correctIndex: 1, shelf: "s08c" },
        { kind: "mc", section: 1,
            prompt: "What’s the casual negative form of 高い (expensive)?",
            choices: ["高くない", "高いじゃない", "高くありません", "高いくない"],
            correctIndex: 0, shelf: "s10a" },
        { kind: "mc", section: 1,
            prompt: "What is the past tense of 食べます (to eat)?",
            choices: ["食べました", "食べます", "食べません", "食べていました"],
            correctIndex: 0, shelf: "s14" },
        { kind: "mc", section: 1,
            prompt: "Which particle marks the direct object of a verb, as in パン___食べます?",
            choices: ["が", "を", "に", "で"],
            correctIndex: 1, shelf: "s11a" },
        { kind: "mc", section: 1,
            prompt: "Which word means ‘that (over there, near the listener)’?",
            choices: ["これ", "それ", "あれ", "どれ"],
            correctIndex: 1, shelf: "s05" },
        { kind: "mc", section: 1,
            prompt: "Which sentence is an invitation meaning ‘Shall we go together?’?",
            choices: ["一緒に行きます", "一緒に行きましょう", "一緒に行きました", "一緒に行くでしょう"],
            correctIndex: 1, shelf: "s12" },
        { kind: "mc", section: 1,
            prompt: "What is the basic word order of a Japanese sentence?",
            choices: ["Subject–Verb–Object", "Subject–Object–Verb", "Verb–Subject–Object", "Object–Verb–Subject"],
            correctIndex: 1, shelf: "s15" },
        { kind: "mc", section: 1,
            prompt: "Which particle marks where an action happens, as in 図書館___勉強します?",
            choices: ["に", "で", "を", "へ"],
            correctIndex: 1, shelf: "s16c" },
        { kind: "mc", section: 1,
            prompt: "Which phrase means ‘Nice to meet you’?",
            choices: ["おやすみなさい", "はじめまして", "いただきます", "おげんきですか"],
            correctIndex: 1, shelf: "s04" },

        /* ===== Section 2 — Kanji Reading (15, mc) ===== */
        { kind: "kanji-reading", section: 2, glyph: "山", meaning: "Mountain",
            choices: ["やま", "かわ", "うみ", "もり"], correctIndex: 0 },
        { kind: "kanji-reading", section: 2, glyph: "川", meaning: "River",
            choices: ["やま", "かわ", "うみ", "いけ"], correctIndex: 1 },
        { kind: "kanji-reading", section: 2, glyph: "木", meaning: "Tree",
            choices: ["はな", "くさ", "き", "いし"], correctIndex: 2 },
        { kind: "kanji-reading", section: 2, glyph: "今", meaning: "Now",
            choices: ["いま", "きょう", "あした", "きのう"], correctIndex: 0 },
        { kind: "kanji-reading", section: 2, glyph: "休", meaning: "Rest / day off",
            choices: ["しごと", "がっこう", "べんきょう", "やすみ"], correctIndex: 3 },
        { kind: "kanji-reading", section: 2, glyph: "三", meaning: "Three",
            choices: ["さん", "し", "よん", "ご"], correctIndex: 0 },
        { kind: "kanji-reading", section: 2, glyph: "人", meaning: "Person",
            choices: ["もの", "ひと", "こと", "とき"], correctIndex: 1 },
        { kind: "kanji-reading", section: 2, glyph: "耳", meaning: "Ear",
            choices: ["みみ", "め", "くち", "はな"], correctIndex: 0 },
        { kind: "kanji-reading", section: 2, glyph: "目", meaning: "Eye",
            choices: ["みみ", "め", "くち", "て"], correctIndex: 1 },
        { kind: "kanji-reading", section: 2, glyph: "百", meaning: "Hundred",
            choices: ["ひゃく", "せん", "まん", "じゅう"], correctIndex: 0 },
        { kind: "kanji-reading", section: 2, glyph: "一", meaning: "One",
            choices: ["いち", "に", "さん", "し"], correctIndex: 0 },
        { kind: "kanji-reading", section: 2, glyph: "二", meaning: "Two",
            choices: ["いち", "に", "さん", "よん"], correctIndex: 1 },
        { kind: "kanji-reading", section: 2, glyph: "中", meaning: "Middle / inside",
            choices: ["なか", "うえ", "した", "そと"], correctIndex: 0 },
        { kind: "kanji-reading", section: 2, glyph: "白", meaning: "White",
            choices: ["しろ", "くろ", "あか", "あお"], correctIndex: 0 },
        { kind: "kanji-reading", section: 2, glyph: "円", meaning: "Yen",
            choices: ["えん", "まる", "せん", "まん"], correctIndex: 0 },

        /* ===== Section 3 — Sentence Order / ★ (10, mc) ===== */
        { kind: "star", section: 3, before: "たなかさん", after: "です。",
            options: ["の", "先生", "学校", "は"], correctOrder: [3, 2, 0, 1], starPosition: 2 },
        { kind: "star", section: 3, before: "これ", after: "か。",
            options: ["は", "日本の", "本", "です"], correctOrder: [0, 1, 2, 3], starPosition: 1 },
        { kind: "star", section: 3, before: "わたし", after: "食べます。",
            options: ["は", "友達と", "ご飯を", "いっしょに"], correctOrder: [0, 1, 3, 2], starPosition: 3 },
        { kind: "star", section: 3, before: "きょう", after: "。",
            options: ["は", "とても", "寒い", "です"], correctOrder: [0, 1, 2, 3], starPosition: 0 },
        { kind: "star", section: 3, before: "あそこ", after: "います。",
            options: ["に", "私の", "先生", "が"], correctOrder: [0, 1, 2, 3], starPosition: 3 },
        { kind: "star", section: 3, before: "このケーキ", after: "です。",
            options: ["は", "とても", "おいしい", "本当に"], correctOrder: [0, 3, 1, 2], starPosition: 2 },
        { kind: "star", section: 3, before: "わたしのうち", after: "あります。",
            options: ["に", "大きい", "木が", "たくさん"], correctOrder: [0, 1, 2, 3], starPosition: 2 },
        { kind: "star", section: 3, before: "これは", after: "か。",
            options: ["だれ", "の", "おもしろい", "本です"], correctOrder: [0, 1, 2, 3], starPosition: 2 },
        { kind: "star", section: 3, before: "あしたのあさ", after: "行きます。",
            options: ["学校へ", "電車で", "は", "わたし"], correctOrder: [3, 2, 1, 0], starPosition: 1 },
        { kind: "star", section: 3, before: "きのう", after: "見ました。",
            options: ["友達と", "映画を", "おもしろい", "いっしょに"], correctOrder: [0, 3, 2, 1], starPosition: 3 },

        /* ===== Section 4 — Reading Comprehension (5, mc) ===== */
        { kind: "reading", section: 4,
            passage: "わたしは毎朝七時に起きます。朝ごはんを食べてから、学校へ行きます。学校は九時に始まります。",
            prompt: "わたしは何時に起きますか。",
            choices: ["七時", "九時", "八時", "六時"], correctIndex: 0 },
        { kind: "reading", section: 4,
            passage: "たなかさんはねこが好きです。いぬはあまり好きではありません。今、白いねこを一匹かっています。",
            prompt: "たなかさんは何が好きですか。",
            choices: ["いぬ", "ねこ", "とり", "さかな"], correctIndex: 1 },
        { kind: "reading", section: 4,
            passage: "土曜日、友達と図書館へ行きました。図書館で本を三冊かりました。それから、いっしょに映画を見ました。",
            prompt: "何冊の本をかりましたか。",
            choices: ["二冊", "三冊", "四冊", "五冊"], correctIndex: 1 },
        { kind: "reading", section: 4,
            passage: "今日は雨です。だから、かさを持って行きます。明日は晴れるでしょう。",
            prompt: "今日の天気はどうですか。",
            choices: ["晴れ", "雨", "雪", "くもり"], correctIndex: 1 },
        { kind: "reading", section: 4,
            passage: "山田さんの誕生日は八月十五日です。毎年、家族といっしょにパーティーをします。今年もケーキを買いました。",
            prompt: "山田さんの誕生日はいつですか。",
            choices: ["七月十五日", "八月十五日", "九月十五日", "八月五日"], correctIndex: 1 },

        /* ===== Section 5 — Word Usage (5, mc) ===== */
        { kind: "word-sentence", section: 5, word: "友達", reading: "ともだち", meaning: "friend",
            choices: [
                "わたしには友達がたくさんいます。",
                "わたしは友達をあります。",
                "わたしは友達をいます。",
                "わたしは友達でたくさんいます。"
            ], correctIndex: 0 },
        { kind: "word-sentence", section: 5, word: "高い", reading: "たかい", meaning: "expensive / tall",
            choices: [
                "この靴は高いです。",
                "この靴は高くです。",
                "この靴は高いだです。",
                "この靴が高いをです。"
            ], correctIndex: 0 },
        { kind: "word-sentence", section: 5, word: "行きます", reading: "いきます", meaning: "to go",
            choices: [
                "明日、学校に行きます。",
                "明日、学校を行きます。",
                "明日、学校が行きます。",
                "明日、学校で行きます。"
            ], correctIndex: 0 },
        { kind: "word-sentence", section: 5, word: "忙しい", reading: "いそがしい", meaning: "busy",
            choices: [
                "今週はとても忙しいです。",
                "今週はとても忙しかったいです。",
                "今週はとても忙しくだ。",
                "今週はとても忙しいだ。"
            ], correctIndex: 0 },
        { kind: "word-sentence", section: 5, word: "食べたい", reading: "たべたい", meaning: "want to eat",
            choices: [
                "すしを食べたいです。",
                "すしを食べたいをです。",
                "すしに食べたいです。",
                "すしを食べたいます。"
            ], correctIndex: 0 }
    ];

    const SECTION_LABELS = {
        1: "Vocabulary & Grammar",
        2: "Kanji Reading",
        3: "Sentence Order (★)",
        4: "Reading Comprehension",
        5: "Word Usage"
    };

    /* ── Normalize every kind down to one common shape ────────────── */

    function starSentenceHtml(q) {
        let html = "<div class='quiz-star-sentence'>";
        if (q.before) html += "<span class='quiz-star-fixed'>" + q.before + "</span> ";
        for (let i = 0; i < 4; i++) {
            html += i === q.starPosition
                ? "<span class='quiz-star-mark'>★</span> "
                : "<span class='quiz-star-blank'>___</span> ";
        }
        if (q.after) html += "<span class='quiz-star-fixed'>" + q.after + "</span>";
        html += "</div>";
        return html;
    }

    function prepareQuestion(raw) {
        const q = { section: raw.section, kind: raw.kind };
        if (raw.kind === "mc") {
            q.prompt = raw.prompt;
            q.extraHtml = "";
            q.choices = raw.choices;
            q.correctIndex = raw.correctIndex;
        } else if (raw.kind === "kanji-reading") {
            q.prompt = "What is a reading of this kanji?";
            q.extraHtml = "<div class='quiz-kanji-display'><span class='quiz-kanji-display__glyph'>" + raw.glyph
                + "</span><span class='quiz-kanji-display__meaning'>" + raw.meaning + "</span></div>";
            q.choices = raw.choices;
            q.correctIndex = raw.correctIndex;
        } else if (raw.kind === "star") {
            q.prompt = "Which word belongs on the ★?";
            q.extraHtml = starSentenceHtml(raw);
            q.choices = raw.options;
            q.correctIndex = raw.correctOrder[raw.starPosition];
            q.reveal = raw.correctOrder.map((i) => raw.options[i]).join("");
            if (raw.before) q.reveal = raw.before + q.reveal;
            if (raw.after) q.reveal = q.reveal + raw.after;
        } else if (raw.kind === "reading") {
            q.prompt = raw.prompt;
            q.extraHtml = "<div class='quiz-passage'>" + raw.passage + "</div>";
            q.choices = raw.choices;
            q.correctIndex = raw.correctIndex;
        } else if (raw.kind === "word-sentence") {
            q.prompt = "Which sentence correctly uses this word?";
            q.extraHtml = "<div class='quiz-word-prompt'><span class='quiz-word-prompt__word'>" + raw.word
                + "</span><span class='quiz-word-prompt__reading'>" + raw.reading + "</span>"
                + "<span class='quiz-word-prompt__meaning'>" + raw.meaning + "</span></div>";
            q.choices = raw.choices;
            q.correctIndex = raw.correctIndex;
        }
        return q;
    }

    /* ── Helpers ───────────────────────────────────────────────────── */

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        }
        return a;
    }

    /* ── State ─────────────────────────────────────────────────────── */

    let sections = [];       // array of 5 arrays of prepared questions
    let sectionIndex = 0;
    let sectionSubmitted = false;
    let totalCorrect = 0;
    let totalQuestions = 0;

    function $(id) { return document.getElementById(id); }

    /* ── Render: one section as a full exam sheet ─────────────────── */

    function renderSection() {
        const panel = $("quizPanel");
        if (!panel || sectionIndex >= sections.length) { showResult(); return; }
        sectionSubmitted = false;
        const qs = sections[sectionIndex];
        const sectionNum = sectionIndex + 1;

        let html = "<div class='quiz-section-label'>Section " + sectionNum + " of " + sections.length + " — "
            + SECTION_LABELS[qs[0].section] + "</div>"
            + "<h2>" + qs.length + " Questions</h2>"
            + "<p class='quiz-panel__sub'>Answer every question below, then submit the sheet to see your results.</p>"
            + "<div class='quiz-exam-sheet'>";

        qs.forEach((q, qi) => {
            html += "<div class='quiz-exam-item' data-qi='" + qi + "'>"
                + "<div class='quiz-exam-item__num'>" + (qi + 1) + ".</div>"
                + "<div class='quiz-exam-item__body'>"
                + "<p class='quiz-exam-item__prompt'>" + q.prompt + "</p>"
                + q.extraHtml
                + "<div class='quiz-exam-choices'>"
                + q.choices.map((ch, ci) =>
                    "<label class='quiz-exam-choice'>"
                    + "<input type='radio' name='exam-q" + qi + "' value='" + ci + "'>"
                    + "<span>" + ch + "</span></label>"
                ).join("")
                + "</div>"
                + "<div class='quiz-exam-item__reveal' style='display:none'></div>"
                + "</div>"
                + "</div>";
        });

        html += "</div>"
            + "<div class='quiz-exam-submit-bar'>"
            + "<span class='quiz-exam-submit-bar__status' id='quizExamStatus'></span>"
            + "<button class='quiz-action-btn' id='quizSubmitBtn'>Submit Section</button>"
            + "<button class='quiz-action-btn is-next' id='quizContinueBtn' style='display:none'>"
            + (sectionNum < sections.length ? "Continue to Section " + (sectionNum + 1) + " →" : "See Final Results →")
            + "</button>"
            + "</div>";

        panel.innerHTML = html;

        panel.querySelectorAll("input[type=radio]").forEach((r) => {
            r.addEventListener("change", updateExamStatus);
        });
        updateExamStatus();
        $("quizSubmitBtn").addEventListener("click", submitSection);
        $("quizContinueBtn").addEventListener("click", () => { sectionIndex++; renderSection(); });

        $("quizFill").style.width = Math.round((sectionIndex / sections.length) * 100) + "%";
        $("quizText").textContent = "Section " + sectionNum + " / " + sections.length;
    }

    function updateExamStatus() {
        if (sectionSubmitted) return;
        const qs = sections[sectionIndex];
        const answered = document.querySelectorAll(".quiz-exam-item input[type=radio]:checked").length;
        const statusEl = $("quizExamStatus");
        if (statusEl) statusEl.textContent = answered + " / " + qs.length + " answered";
    }

    /* ── Grade the whole sheet at once ────────────────────────────── */

    function submitSection() {
        if (sectionSubmitted) return;
        sectionSubmitted = true;
        const qs = sections[sectionIndex];
        let sectionCorrect = 0;

        qs.forEach((q, qi) => {
            const item = document.querySelector(".quiz-exam-item[data-qi='" + qi + "']");
            const checked = item.querySelector("input[type=radio]:checked");
            const pickedIdx = checked ? parseInt(checked.value, 10) : -1;
            const isCorrect = pickedIdx === q.correctIndex;
            if (isCorrect) sectionCorrect++;

            item.querySelectorAll(".quiz-exam-choice").forEach((label, ci) => {
                label.querySelector("input").disabled = true;
                if (ci === q.correctIndex) label.classList.add("is-correct-answer");
                if (ci === pickedIdx && !isCorrect) label.classList.add("is-user-wrong");
                if (ci === pickedIdx && isCorrect) label.classList.add("is-user-correct");
            });

            if (q.reveal) {
                const revealEl = item.querySelector(".quiz-exam-item__reveal");
                revealEl.style.display = "";
                revealEl.textContent = q.reveal;
            }
        });

        totalCorrect += sectionCorrect;
        totalQuestions += qs.length;

        const statusEl = $("quizExamStatus");
        if (statusEl) statusEl.textContent = sectionCorrect + " / " + qs.length + " correct this section";
        $("quizSubmitBtn").style.display = "none";
        $("quizContinueBtn").style.display = "";
        $("quizContinueBtn").scrollIntoView({ block: "nearest" });
    }

    /* ── Result ────────────────────────────────────────────────────── */

    function showResult() {
        const panel = $("quizPanel");
        if (!panel) return;
        const pct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        let result;
        if (window.StudyProgress) {
            result = StudyProgress.recordQuizRun("n5", pct);
        } else {
            result = { gained: 0, bestPct: pct, passed: pct >= 70, perfect: pct === 100 };
        }

        $("quizFill").style.width = "100%";
        $("quizText").textContent = "Complete";

        let verdict;
        if (pct === 100) verdict = "Perfect! You've mastered N5 basics!";
        else if (pct >= 80) verdict = "Excellent work! You really know this material.";
        else if (pct >= 70) verdict = "Nice job! You passed with " + totalCorrect + " / " + totalQuestions + ".";
        else if (pct >= 50) verdict = "Close! " + totalCorrect + " / " + totalQuestions + ". Review the tricky lessons and try again.";
        else verdict = "Keep studying! " + totalCorrect + " / " + totalQuestions + ". You'll get there.";

        let xpLine = "";
        if (result.gained > 0) xpLine = "<div class='quiz-xp-gained'>+" + result.gained + " XP earned!</div>";

        panel.innerHTML =
            "<div class='quiz-result'>"
            + "<div class='quiz-result__icon'>&#127894;</div>"
            + "<div class='quiz-result__title'>Quiz Complete!</div>"
            + "<div class='quiz-result__score'>" + totalCorrect + " / " + totalQuestions + " (" + pct + "%)</div>"
            + "<div class='quiz-result__verdict'>" + verdict + "</div>"
            + xpLine
            + "<div class='quiz-result__buttons'>"
            + "<a href='n5-lessons.html' class='quiz-action-btn is-back'>&larr; Back to Lessons</a>"
            + "<button class='quiz-action-btn' id='quizRetryBtn'>Retry Quiz</button>"
            + "</div>"
            + "</div>";

        const retryBtn = $("quizRetryBtn");
        if (retryBtn) retryBtn.addEventListener("click", startQuiz);

        if (window.StudyProgress) StudyProgress.renderXpBadges();
    }

    /* ── Init ──────────────────────────────────────────────────────── */

    function startQuiz() {
        /* Shuffled within each section, but the five sections themselves
           stay in order (1 -> 5) so it still reads as one structured
           exam rather than the types interleaving randomly. */
        sections = [];
        for (let s = 1; s <= 5; s++) {
            sections.push(shuffle(RAW_QUESTIONS.filter((r) => r.section === s).map(prepareQuestion)));
        }
        sectionIndex = 0;
        totalCorrect = 0;
        totalQuestions = 0;
        const progress = $("quizProgressWrap");
        if (progress) progress.style.display = "";
        renderSection();
    }

    window.N5Quiz = { init: startQuiz };
})();
