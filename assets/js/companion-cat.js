/* COMPANION CAT — a small ambient idle-sprite widget that follows the
   player across every non-Adventure-Room page (the Adventure Room already
   has its own walking cat + Neko-sensei presence in-scene, so it's
   deliberately excluded here to avoid a redundant second cat).

   Identity: reuses the exact same `nekoBunko.n5.catColor` localStorage key
   the Phaser CatSelectScene already writes (assets/js/n5-phaser-game.js) —
   this is "your" cat, not a separate character, so picking a color once in
   the Adventure Room is what the rest of the site shows too.

   Visibility: only renders once a player profile exists (`jpExplorer` in
   localStorage) — never shows on top of the login screen. */
(function () {
    "use strict";

    const CAT_COLOR_KEY = "nekoBunko.n5.catColor";
    const EXPLORER_KEY = "jpExplorer";
    const VALID_COLORS = ["orange", "black", "white"]; // matches CAT_COLOR_ORDER in n5-phaser-game.js exactly

    const TIPS = [
        "You're doing great — keep it up! 🐾",
        "Tip: try the exercise before peeking at the lesson notes.",
        "Every lesson finished is XP in the bank.",
        "Stuck on stroke order? Kana Dojo will show you, stroke by stroke.",
        "Little and often beats one big cram session.",
        "Mistakes are just how the words stick better next time.",
        "Don't forget your daily streak — check the homepage quest!",
        "Numbers, particles, verbs... one shelf at a time.",
        "You can always replay a lesson if you want a refresher.",
        "Proud of you for showing up today.",
        "Try saying today's new word out loud — it helps it stick.",
        "Meow. (That means \"good luck.\")"
    ];

    function readLocal(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    function getCatColor() {
        const saved = readLocal(CAT_COLOR_KEY);
        return VALID_COLORS.indexOf(saved) !== -1 ? saved : "orange";
    }

    function pickTip(lastTip) {
        if (TIPS.length === 1) return TIPS[0];
        let tip;
        do {
            tip = TIPS[Math.floor(Math.random() * TIPS.length)];
        } while (tip === lastTip);
        return tip;
    }

    function init() {
        if (!readLocal(EXPLORER_KEY)) return; // no profile yet — stay hidden on login

        const color = getCatColor();
        let lastTip = null;
        let hideTimer = null;

        const wrap = document.createElement("div");
        wrap.className = "companion-cat companion-cat--" + color;
        wrap.setAttribute("role", "button");
        wrap.setAttribute("tabindex", "0");
        wrap.setAttribute("aria-label", "Your study companion cat — click for a tip");

        const bubble = document.createElement("div");
        bubble.className = "companion-cat__bubble";
        bubble.setAttribute("aria-live", "polite");
        wrap.appendChild(bubble);

        function showTip() {
            lastTip = pickTip(lastTip);
            bubble.textContent = lastTip;
            bubble.classList.add("is-visible");
            if (hideTimer) clearTimeout(hideTimer);
            hideTimer = setTimeout(function () {
                bubble.classList.remove("is-visible");
            }, 4500);
        }

        wrap.addEventListener("click", showTip);
        wrap.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                showTip();
            }
        });

        document.body.appendChild(wrap);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
