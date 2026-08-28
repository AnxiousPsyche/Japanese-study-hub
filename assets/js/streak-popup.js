/* STREAK POPUP — a once-per-day "you're on a N-day streak" check-in
   shown when the player opens the Study Room to review/learn. Reuses
   the same jpExplorer.streak/lastPlayedDate the homepage's Player
   window already tracks (assets/js/progress.js) rather than a parallel
   counter, and calls applyPlayerProgress() itself so the streak still
   advances correctly on a day the player goes straight to the Study
   Room without ever visiting the homepage. Self-initializing like
   companion-cat.js — the <script> tag alone is enough, no markup
   required in the page body. */
(function () {
    "use strict";

    const SHOWN_KEY = "nekoBunko.streakPopup.v1";

    /* Mirrors login.js's getSavedExplorer() self-healing read so a
       corrupted save doesn't throw here either. */
    function getExplorer() {
        const raw = localStorage.getItem("jpExplorer");
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (err) {
            localStorage.removeItem("jpExplorer");
            return null;
        }
    }

    function alreadyShownToday(today) {
        try {
            const raw = localStorage.getItem(SHOWN_KEY);
            return raw ? JSON.parse(raw).lastShownDate === today : false;
        } catch (err) {
            return false;
        }
    }

    function markShown(today) {
        try {
            localStorage.setItem(SHOWN_KEY, JSON.stringify({ lastShownDate: today }));
        } catch (err) { /* privacy mode / quota — the popup just shows again next visit */ }
    }

    /* Mon/Tue/... abbreviations for the 7 calendar days ending today,
       so the strip is a real week view, not arbitrary "Day 1..7" boxes. */
    function dayLabels() {
        const labels = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2));
        }
        return labels;
    }

    function streakMessage(streak) {
        if (streak <= 1) return "You're back! Keep it going tomorrow.";
        if (streak < 7) return "Nice work — " + streak + " days in a row!";
        return "A full week strong. Amazing streak!";
    }

    function buildPopup(streak) {
        const overlay = document.createElement("div");
        overlay.className = "streak-popup-overlay";

        const labels = dayLabels();
        const lit = Math.min(streak, 7);
        let daysHtml = "";
        labels.forEach(function (label, i) {
            const isLit = i >= (7 - lit);
            const isToday = i === 6;
            daysHtml += "<div class='streak-popup__day"
                + (isLit ? " is-lit" : "") + (isToday ? " is-today" : "") + "'>"
                + "<span class='streak-popup__day-flame'>" + (isLit ? "\u{1F525}" : "") + "</span>"
                + "<span class='streak-popup__day-label'>" + label + "</span>"
                + "</div>";
        });

        overlay.innerHTML =
            "<div class='streak-popup'>"
            + "<div class='streak-popup__flame'>\u{1F525}</div>"
            + "<div class='streak-popup__count'>" + streak + "</div>"
            + "<div class='streak-popup__label'>Day Streak</div>"
            + "<div class='streak-popup__week'>" + daysHtml + "</div>"
            + "<p class='streak-popup__msg'>" + streakMessage(streak) + "</p>"
            + "<button type='button' class='streak-popup__btn'>Let's study! →</button>"
            + "</div>";

        document.body.appendChild(overlay);
        requestAnimationFrame(function () { overlay.classList.add("is-visible"); });

        function close() {
            overlay.classList.remove("is-visible");
            setTimeout(function () { overlay.remove(); }, 300);
        }
        overlay.querySelector(".streak-popup__btn").addEventListener("click", close);
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) close();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        const explorer = getExplorer();
        if (!explorer) return;

        if (typeof applyPlayerProgress === "function") {
            applyPlayerProgress(explorer);
        }

        const today = new Date().toDateString();
        if (alreadyShownToday(today)) return;
        markShown(today);

        buildPopup(explorer.streak || 1);
    });
})();
