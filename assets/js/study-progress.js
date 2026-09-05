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

    /* ===== XP badge reel display =====
       Each [data-study-xp] element's own content becomes one .reel per
       digit (a 0-9 vertical strip, translateY'd to the right digit) —
       an odometer, not plain text — so a fresh gain can visibly roll the
       count up instead of snapping. Approved design: see the "Star Tally
       Flight" mockup session. No HTML changes needed on any of the pages
       that already have a bare <span data-study-xp>0</span> — this
       builds/rebuilds the reel markup inside that same element. */
    function digitsOf(n) { return String(n).split("").map(Number); }

    function buildReelStrip() {
        const strip = document.createElement("div");
        strip.className = "reel__strip";
        for (let d = 0; d <= 9; d++) {
            const digit = document.createElement("div");
            digit.className = "reel__digit";
            digit.textContent = String(d);
            strip.appendChild(digit);
        }
        return strip;
    }

    /* Static (re)render — no animation. Used for every normal page-load
       update via renderXpBadges(). */
    function renderReels(el, n) {
        el.innerHTML = "";
        el.classList.add("xp-reels");
        digitsOf(n).forEach((d) => {
            const reel = document.createElement("div");
            reel.className = "reel";
            const strip = buildReelStrip();
            strip.style.transform = `translateY(-${d * 1.05}em)`;
            reel.appendChild(strip);
            el.appendChild(reel);
        });
    }

    /* Rolls an already-rendered reel element from its current digits to
       `newValue`. A digit-count increase (crossing 9->10, 99->100, ...)
       inserts new reels at the front rather than trying to animate a
       reel into existing where none was — each new reel lands directly
       on its target digit instead of rolling from nothing. */
    function rollReelsTo(el, oldValue, newValue) {
        const oldDigits = digitsOf(oldValue);
        const newDigits = digitsOf(newValue);
        const grow = newDigits.length - oldDigits.length;
        for (let g = 0; g < grow; g++) {
            const reel = document.createElement("div");
            reel.className = "reel";
            const strip = buildReelStrip();
            strip.style.transition = "none";
            strip.style.transform = "translateY(0em)";
            reel.appendChild(strip);
            el.insertBefore(reel, el.firstChild);
            requestAnimationFrame(() => {
                strip.style.transition = "transform 320ms cubic-bezier(.22,1,.36,1)";
                strip.style.transform = `translateY(-${newDigits[g] * 1.05}em)`;
            });
        }
        const existingReels = Array.prototype.slice.call(el.querySelectorAll(".reel")).slice(Math.max(grow, 0));
        existingReels.forEach((reel, i) => {
            const strip = reel.querySelector(".reel__strip");
            const targetDigit = newDigits[grow + i];
            requestAnimationFrame(() => {
                strip.style.transition = "transform 320ms cubic-bezier(.22,1,.36,1)";
                strip.style.transform = `translateY(-${targetDigit * 1.05}em)`;
            });
        });
    }

    function bumpBadge(el) {
        const badge = el.closest(".xp-badge") || el;
        badge.classList.add("is-xp-bumped");
        setTimeout(() => badge.classList.remove("is-xp-bumped"), 180);
    }

    /* Updates every [data-study-xp] element on the page with current XP
       (static — no roll, no stars). Called on every normal page load. */
    function renderXpBadges() {
        const xp = load().xp;
        document.querySelectorAll("[data-study-xp]").forEach((el) => {
            renderReels(el, xp);
        });
    }

    /* ===== Star Tally Flight =====
       A fixed, centered overlay: `count` stars fan out sideways one at a
       time (a running "Earned: N XP" total climbing alongside), pause,
       then fly to the page's XP badge one at a time, fast, each one
       shrinking to nothing right as it lands — no pile forms at the
       badge, only the reel count is left behind, bumped up per landing.
       Self-contained: builds and removes its own DOM, no markup needed
       on the calling page. */
    const TALLY_STAR_COUNT = 5;
    const TALLY_GAP = 350;
    const HOLD_AFTER_TALLY = 400;
    const LAUNCH_GAP = 120;
    const FLIGHT_MS = 180;
    const FINAL_HOLD = 300;

    function tiltFor(i) { return ((i % 2 === 0) ? -1 : 1) * (5 + (i % 3) * 2); }

    function flyStar(fromRect, toRect, onArrive) {
        try {
            const flyer = document.createElement("span");
            flyer.className = "xp-flyer";
            flyer.textContent = "⭐";
            flyer.style.left = fromRect.left + "px";
            flyer.style.top = fromRect.top + "px";
            document.body.appendChild(flyer);

            const endX = toRect.left - fromRect.left;
            const endY = toRect.top - fromRect.top;
            const midX = endX * 0.5;
            const midY = endY * 0.5 - 44;

            const anim = flyer.animate([
                { transform: "translate(0px,0px) scale(1) rotate(0deg)", offset: 0 },
                { transform: `translate(${midX}px,${midY}px) scale(1.15) rotate(10deg)`, offset: 0.5 },
                { transform: `translate(${endX}px,${endY}px) scale(0.3) rotate(-8deg)`, offset: 1 }
            ], { duration: FLIGHT_MS, easing: "cubic-bezier(.3,.4,.35,1)", fill: "forwards" });

            anim.onfinish = () => { flyer.remove(); onArrive(); };
        } catch (e) {
            onArrive(); // WAAPI unsupported or blocked — still award the XP visually via the badge
        }
    }

    /* Same job as renderXpBadges(), but for a fresh XP gain: runs the
       star tally + flight, then leaves every [data-study-xp] badge
       rolled up to the new total. Degrades to a plain renderXpBadges()
       when there's nothing to celebrate (gained === 0, e.g. a lesson/
       quiz already completed before), so callers can use this
       unconditionally in place of renderXpBadges() without checking
       gained themselves. */
    function celebrateXpGain(gained) {
        if (!gained) { renderXpBadges(); return; }

        const toXp = load().xp; // completeLesson()/recordQuizRun() already saved the post-gain total
        let currentXp = toXp - gained;
        const badgeEls = Array.prototype.slice.call(document.querySelectorAll("[data-study-xp]"));
        const targetBadge = document.querySelector(".xp-badge");
        if (!badgeEls.length || !targetBadge) { renderXpBadges(); return; }

        const overlay = document.createElement("div");
        overlay.className = "xp-tally-overlay";
        const starsRow = document.createElement("div");
        starsRow.className = "xp-tally-stars";
        const totalLine = document.createElement("div");
        totalLine.className = "xp-tally-total";
        totalLine.innerHTML = 'Earned: <span>0</span> XP';
        overlay.appendChild(starsRow);
        overlay.appendChild(totalLine);
        document.body.appendChild(overlay);

        const starValue = Math.floor(gained / TALLY_STAR_COUNT);
        const lastStarValue = gained - starValue * (TALLY_STAR_COUNT - 1); // remainder absorbed by the last star

        for (let i = 0; i < TALLY_STAR_COUNT; i++) {
            setTimeout(() => {
                const star = document.createElement("span");
                star.className = "xp-mint-star";
                star.textContent = "⭐";
                star.style.setProperty("--tilt", tiltFor(i) + "deg");
                starsRow.appendChild(star);
                const earnedSoFar = i < TALLY_STAR_COUNT - 1 ? (i + 1) * starValue : gained;
                totalLine.querySelector("span").textContent = String(earnedSoFar);
            }, i * TALLY_GAP);
        }

        const tallyDone = TALLY_STAR_COUNT * TALLY_GAP;

        setTimeout(() => {
            for (let launch = 0; launch < TALLY_STAR_COUNT; launch++) {
                setTimeout(() => {
                    const stars = starsRow.querySelectorAll(".xp-mint-star");
                    const topStar = stars[stars.length - 1];
                    if (!topStar) return;
                    const fromRect = topStar.getBoundingClientRect();
                    topStar.remove();

                    const badgeRect = targetBadge.getBoundingClientRect();
                    const toRect = { left: badgeRect.left + 10, top: badgeRect.top + badgeRect.height / 2 - 8 };

                    flyStar(fromRect, toRect, () => {
                        const isLast = launch === TALLY_STAR_COUNT - 1;
                        currentXp += isLast ? lastStarValue : starValue;
                        badgeEls.forEach((el) => {
                            rollReelsTo(el, currentXp - (isLast ? lastStarValue : starValue), currentXp);
                            bumpBadge(el);
                        });
                    });
                }, launch * LAUNCH_GAP);
            }

            const totalLaunchTime = (TALLY_STAR_COUNT - 1) * LAUNCH_GAP + FLIGHT_MS;
            setTimeout(() => overlay.remove(), totalLaunchTime + FINAL_HOLD);
        }, tallyDone + HOLD_AFTER_TALLY);
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
        renderXpBadges: renderXpBadges,
        celebrateXpGain: celebrateXpGain
    };
})();
