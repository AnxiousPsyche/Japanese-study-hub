/* Shared XP/progress store for the Study Room suite (dashboards, lessons, quizzes).
   Persisted under one localStorage key per concern (repo convention):
   nekoBunko.study.v1 = { xp, lessons: { s01: true, ... }, quiz: { n5: { bestPct, passed, perfect } } }
   All access is try/catch-wrapped so private mode / quota / corrupted JSON never breaks a page.
   Exposed as window.StudyProgress. */
(function () {
    "use strict";

    const STORAGE_KEY = "nekoBunko.study.v1";

    const XP_REWARDS = {
        lesson: 50,          // first-time lesson + practice completion
        quizPass: 150,       // first time scoring >= 70% on the level quiz
        quizPerfectBonus: 100 // extra on top of quizPass for a 100% run
    };
    const QUIZ_PASS_PCT = 70;

    let cache = null;

    function defaults() {
        return { xp: 0, lessons: {}, quiz: {} };
    }

    function load() {
        if (cache) return cache;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            cache = raw ? Object.assign(defaults(), JSON.parse(raw)) : defaults();
        } catch (e) {
            cache = defaults();
        }
        return cache;
    }

    function save() {
        if (!cache) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
        } catch (e) {
            /* storage unavailable — keep in-memory copy only */
        }
    }

    function isLessonDone(lessonId) {
        return !!load().lessons[lessonId];
    }

    /* Awards XP only the FIRST time a lesson+practice is completed.
       Returns { gained } — 0 when already completed before. */
    function completeLesson(lessonId) {
        const state = load();
        if (state.lessons[lessonId]) {
            notifyProgress("lesson", lessonId);
            return { gained: 0 };
        }
        state.lessons[lessonId] = true;
        state.xp += XP_REWARDS.lesson;
        save();
        notifyProgress("lesson", lessonId);
        return { gained: XP_REWARDS.lesson };
    }

    /* Fires a DOM event any time practice is completed (a lesson finished
       or a quiz submitted) so unrelated widgets — e.g. streak-popup.js —
       can react without this module needing to know they exist. */
    function notifyProgress(kind, id) {
        try {
            document.dispatchEvent(new CustomEvent("nekoBunko:studyProgress", { detail: { kind: kind, id: id } }));
        } catch (e) { /* CustomEvent unsupported — no listener, no harm */ }
    }

    function quizBest(levelId) {
        const entry = load().quiz[levelId];
        return entry ? entry.bestPct : null;
    }

    function hasPassedQuiz(levelId) {
        const entry = load().quiz[levelId];
        return !!(entry && entry.passed);
    }

    function lessonsCompleted() {
        const state = load();
        return Object.keys(state.lessons).filter((id) => state.lessons[id]).length;
    }

    /* The actual lesson ids (e.g. ["s01","s03"]) rather than just a count —
       lets a caller (the homepage's daily quest) scope itself to lessons
       the player has actually studied instead of the whole curriculum. */
    function completedLessonIds() {
        const state = load();
        return Object.keys(state.lessons).filter((id) => state.lessons[id]);
    }

    /* Records a finished quiz run and awards XP:
       - first-ever pass (>= QUIZ_PASS_PCT): +quizPass
       - first-ever perfect score: +quizPerfectBonus on top
       Returns { gained, bestPct, passed, perfect }. */
    function recordQuizRun(levelId, pct) {
        const state = load();
        const entry = state.quiz[levelId] || { bestPct: 0, passed: false, perfect: false };
        let gained = 0;
        const passed = pct >= QUIZ_PASS_PCT;
        const perfect = pct === 100;
        if (passed && !entry.passed) gained += XP_REWARDS.quizPass;
        if (perfect && !entry.perfect) gained += XP_REWARDS.quizPerfectBonus;
        entry.bestPct = Math.max(entry.bestPct || 0, pct);
        if (passed) entry.passed = true;
        if (perfect) entry.perfect = true;
        state.quiz[levelId] = entry;
        state.xp += gained;
        save();
        notifyProgress("quiz", levelId);
        return { gained: gained, bestPct: entry.bestPct, passed: passed, perfect: perfect };
    }

    /* Updates every [data-study-xp] element on the page with current XP. */
    function renderXpBadges() {
        const xp = load().xp;
        document.querySelectorAll("[data-study-xp]").forEach((el) => {
            el.textContent = String(xp);
        });
    }

    window.StudyProgress = {
        XP_REWARDS: XP_REWARDS,
        QUIZ_PASS_PCT: QUIZ_PASS_PCT,
        getXp: () => load().xp,
        isLessonDone: isLessonDone,
        completeLesson: completeLesson,
        lessonsCompleted: lessonsCompleted,
        completedLessonIds: completedLessonIds,
        quizBest: quizBest,
        hasPassedQuiz: hasPassedQuiz,
        recordQuizRun: recordQuizRun,
        renderXpBadges: renderXpBadges
    };
})();
