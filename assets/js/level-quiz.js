/* N5 Final Quiz — 10 questions (5 MC + 5 type-in) drawn from across all 16 shelves.
   Awards XP via StudyProgress on first pass (>= 70%). */
(function () {
    "use strict";

    /* ── Question Bank ─────────────────────────────────────────────── */

    const QUESTIONS = [
        /* ---- multiple choice ---- */
        {
            kind: "mc",
            prompt: "What does the particle \u306F (wa) do in a sentence?",
            choices: ["Marks the object", "Marks the topic", "Marks the location", "Marks the question"],
            correctIndex: 1,
            shelf: "s03"
        },
        {
            kind: "mc",
            prompt: "What does adding \u304B at the end of a sentence do?",
            choices: ["Makes it past tense", "Makes it polite", "Turns it into a question", "Makes it negative"],
            correctIndex: 2,
            shelf: "s06"
        },
        {
            kind: "mc",
            prompt: "Which word means \u2018library\u2019?",
            choices: ["\u306B\u3055\u3093\u3076\u304D (\u4E09\u5339)", "\u3068\u3057\u3087\u304B\u3093 (\u56F3\u66F8\u9928)", "\u304A\u306B\u3083 (\u5C4B\u6839)", "\u3068\u3057\u3087\u304B\u3093 (\u5C02\u5BB6)"],
            correctIndex: 1,
            shelf: "s05"
        },
        {
            kind: "mc",
            prompt: "Which sentence means \u2018My friend is also a student.\u2019?",
            choices: [
                "\u53CB\u9054\u306F\u5B66\u751F\u3067\u3059",
                "\u53CB\u9054\u3082\u5B66\u751F\u3067\u3059",
                "\u53CB\u9054\u306B\u5B66\u751F\u3067\u3059",
                "\u53CB\u9054\u3092\u5B66\u751F\u3067\u3059"
            ],
            correctIndex: 1,
            shelf: "s16"
        },
        {
            kind: "mc",
            prompt: "What does \u3066\u3066\u304F\u3060\u3055\u3044 mean?",
            choices: ["Please do (polite request)", "Please don\u2019t do", "I will do (future)", "I want to do"],
            correctIndex: 0,
            shelf: "s13"
        },

        /* ---- type-in hiragana ---- */
        {
            kind: "fill",
            prompt: "Type \u2018Good morning\u2019 in hiragana:",
            before: "",
            after: "\u3002",
            accepted: ["\u304A\u306F\u3088\u3046\u3054\u3056\u3044\u307E\u3059"],
            hint: "\u304A\u306F\u3088\u3046\u3054\u3056\u3044\u307E\u3059",
            shelf: "s01"
        },
        {
            kind: "fill",
            prompt: "Type \u2018student\u2019 in hiragana:",
            before: "",
            after: "",
            accepted: ["\u304C\u304F\u305B\u3044"],
            hint: "\u304C\u304F\u305B\u3044",
            shelf: "s03"
        },
        {
            kind: "fill",
            prompt: "Type \u2018This is a book\u2019 in hiragana (full sentence):",
            before: "",
            after: "\u3002",
            accepted: ["\u3053\u308C\u306F\u307B\u3093\u3067\u3059"],
            hint: "\u3053\u308C\u306F\u307B\u3093\u3067\u3059",
            shelf: "s05"
        },
        {
            kind: "fill",
            prompt: "Type \u2018I like cats\u2019 in hiragana:",
            before: "",
            after: "\u3002",
            accepted: ["\u732B\u304C\u597D\u304D\u3067\u3059", "\u732B\u304C\u3059\u304D\u3067\u3059"],
            hint: "\u732B\u304C\u597D\u304D\u3067\u3059",
            shelf: "s10"
        },
        {
            kind: "fill",
            prompt: "Type \u2018Let\u2019s go to the library\u2019 in hiragana:",
            before: "",
            after: "\u3002",
            accepted: ["\u56F3\u66F8\u9928\u306B\u884C\u304D\u307E\u3057\u3087\u3046"],
            hint: "\u56F3\u66F8\u9928\u306B\u884C\u304D\u307E\u3057\u3087\u3046",
            shelf: "s12"
        }
    ];

    /* ── Helpers ───────────────────────────────────────────────────── */

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        }
        return a;
    }

    function norm(s) {
        return s.replace(/\s+/g, "")
                .replace(/[\uFF01-\uFF5E]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
    }

    /* ── State ─────────────────────────────────────────────────────── */

    let questions = [];
    let index = 0;
    let correct = 0;
    let answered = false;

    function $(id) { return document.getElementById(id); }

    function show(el) { if (el) el.style.display = ""; }
    function hide(el) { if (el) el.style.display = "none"; }

    /* ── Render ────────────────────────────────────────────────────── */

    function renderQuestion() {
        if (index >= questions.length) { showResult(); return; }
        answered = false;
        const q = questions[index];
        const panel = $("quizPanel");
        if (!panel) return;

        let inner = "<h2>Question " + (index + 1) + " / " + questions.length + "</h2>"
            + "<p class='quiz-panel__sub'>" + q.prompt + "</p>";

        if (q.kind === "mc") {
            inner += "<div class='quiz-mc'>";
            q.choices.forEach((ch, i) => {
                inner += "<button class='quiz-mc__btn' data-idx='" + i + "'>" + ch + "</button>";
            });
            inner += "</div>";
        } else {
            inner += "<div class='quiz-practice'>"
                + "<div class='quiz-practice__input-row'>"
                + "<input type='text' class='study-practice__input quiz-input' id='quizInput' "
                + "placeholder='Type your answer in hiragana...' autocomplete='off' spellcheck='false'>"
                + "</div>"
                + "<button class='quiz-action-btn' id='quizCheckBtn'>Check</button>"
                + "</div>";
        }

        inner += "<div class='quiz-feedback' id='quizFeedback'></div>";
        inner += "<button class='quiz-action-btn is-next' id='quizNextBtn' style='display:none'>Next \u2192</button>";

        panel.innerHTML = inner;

        if (q.kind === "mc") {
            panel.querySelectorAll(".quiz-mc__btn").forEach((btn) => {
                btn.addEventListener("click", () => handleMcClick(btn));
            });
        } else {
            const input = $("quizInput");
            if (input) {
                setTimeout(() => input.focus(), 80);
                input.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" && !answered) handleFillCheck();
                });
            }
            const checkBtn = $("quizCheckBtn");
            if (checkBtn) checkBtn.addEventListener("click", handleFillCheck);
        }

        const nextBtn = $("quizNextBtn");
        if (nextBtn) nextBtn.addEventListener("click", () => { index++; renderQuestion(); });

        $("quizFill").style.width = Math.round((index / questions.length) * 100) + "%";
        $("quizText").textContent = index + " / " + questions.length;
    }

    function handleMcClick(btn) {
        if (answered) return;
        answered = true;
        const q = questions[index];
        const idx = parseInt(btn.dataset.idx, 10);
        const isCorrect = idx === q.correctIndex;
        btn.classList.add(isCorrect ? "is-correct" : "is-wrong");
        if (!isCorrect) {
            document.querySelector(".quiz-mc__btn[data-idx='" + q.correctIndex + "']")
                .classList.add("is-correct");
        }
        if (isCorrect) correct++;
        showFeedback(isCorrect
            ? (index === questions.length - 1 && correct === questions.length ? "Perfect!" : "Correct! +1")
            : "Wrong \u2014 the answer was: " + q.choices[q.correctIndex],
            isCorrect ? "correct" : "wrong");
        show($("quizNextBtn"));
    }

    function handleFillCheck() {
        if (answered) return;
        answered = true;
        const q = questions[index];
        const input = $("quizInput");
        if (!input) return;
        const val = norm(input.value);
        const isCorrect = q.accepted.some((a) => norm(a) === val);
        input.disabled = true;
        input.classList.add(isCorrect ? "is-correct" : "is-wrong");
        if (isCorrect) {
            correct++;
            showFeedback("Correct! +1", "correct");
        } else {
            showFeedback("Wrong \u2014 the answer was: <strong>" + q.hint + "</strong>", "wrong");
        }
        show($("quizNextBtn"));
    }

    function showFeedback(msg, type) {
        const fb = $("quizFeedback");
        if (!fb) return;
        fb.className = "study-practice__feedback study-practice__feedback--" + type + " is-visible";
        fb.innerHTML = msg;
    }

    /* ── Result ────────────────────────────────────────────────────── */

    function showResult() {
        const panel = $("quizPanel");
        if (!panel) return;
        const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

        let result;
        if (window.StudyProgress) {
            result = StudyProgress.recordQuizRun("n5", pct);
        } else {
            result = { gained: 0, bestPct: pct, passed: pct >= 70, perfect: pct === 100 };
        }

        $("quizFill").style.width = "100%";
        $("quizText").textContent = questions.length + " / " + questions.length;

        let verdict;
        if (pct === 100) verdict = "Perfect! You've mastered N5 basics!";
        else if (pct >= 80) verdict = "Excellent work! You really know this material.";
        else if (pct >= 70) verdict = "Nice job! You passed with " + correct + " / " + questions.length + ".";
        else if (pct >= 50) verdict = "Close! " + correct + " / " + questions.length + ". Review the tricky lessons and try again.";
        else verdict = "Keep studying! " + correct + " / " + questions.length + ". You'll get there.";

        let xpLine = "";
        if (result.gained > 0) xpLine = "<div class='quiz-xp-gained'>+" + result.gained + " XP earned!</div>";

        panel.innerHTML =
            "<div class='quiz-result'>"
            + "<div class='quiz-result__icon'>&#127894;</div>"
            + "<div class='quiz-result__title'>Quiz Complete!</div>"
            + "<div class='quiz-result__score'>" + correct + " / " + questions.length + " (" + pct + "%)</div>"
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
        questions = shuffle(QUESTIONS).slice(0, 10);
        index = 0;
        correct = 0;
        const progress = $("quizProgressWrap");
        if (progress) progress.style.display = "";
        renderQuestion();
    }

    window.N5Quiz = { init: startQuiz };
})();
