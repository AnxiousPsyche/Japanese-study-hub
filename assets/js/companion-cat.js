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

    /* Ambient extra actions layered on top of the idle tail-wag loop (see
       companion-cat.css's .is-scratching/.is-playing rules) so the cat
       isn't just sitting there indefinitely — cycles between scratching
       and playing bursts instead of the earlier standing/playing pair.
       Black still gets a "scratching" entry in the pool for parity with
       the other two colors, but heads up: blackCatScratching.png is a
       byte-identical duplicate of blackCatTailWagging.png (verified via
       hash — no real scratching pose was ever exported for the black cat,
       same asset gap the old "standing" pose had), so a black cat's
       scratching burst will just silently replay its own idle frames
       rather than visibly do anything different. Swap this back out (or
       drop it) if/when a real blackCatScratching.png ever gets exported. */
    const EXTRA_ACTIONS = {
        orange: ["scratching", "playing"],
        white: ["scratching", "playing"],
        black: ["scratching", "playing"]
    };
    const ACTION_DURATION_MS = { scratching: 2000, playing: 2600 };
    const ACTION_MIN_GAP_MS = 16000;
    const ACTION_MAX_GAP_MS = 34000;

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

    /* Dark mode override: white reads far better than orange/black against
       a dark backdrop, so the companion shows white regardless of the
       player's chosen color whenever the effective theme is dark — same
       "explicit choice beats system preference" logic the homepage's own
       taskbar toggle uses (os.js applyTheme()), just read here since this
       widget runs on pages that don't have that toggle's UI at all. */
    function isDarkTheme() {
        const explicit = readLocal("nekoBunko.theme");
        if (explicit === "light") return false;
        if (explicit === "dark") return true;
        try {
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        } catch (e) {
            return false;
        }
    }

    function getCatColor() {
        if (isDarkTheme()) return "white";
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

    function prefersReducedMotion() {
        try {
            return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        } catch (e) {
            return false;
        }
    }

    /* Schedules one ambient "scratching" or "playing" burst at a random
       15-35s gap, then reschedules itself — runs for the lifetime of the
       page. Skipped entirely under reduced-motion (matches the CSS media
       query, which also turns off the idle tail-wag loop), and a burst
       that would land while the tab is hidden just gets skipped rather
       than queued, so nothing plays out of sync on return. `color` is
       captured once at init() time — a color change only takes effect
       on the next page load, same as the rest of this widget. */
    function scheduleNextAction(wrap, color) {
        if (prefersReducedMotion()) return;
        const actions = EXTRA_ACTIONS[color] || [];
        if (!actions.length) return;

        const gap = ACTION_MIN_GAP_MS + Math.random() * (ACTION_MAX_GAP_MS - ACTION_MIN_GAP_MS);
        setTimeout(function () {
            if (document.hidden) {
                scheduleNextAction(wrap, color);
                return;
            }
            const action = actions[Math.floor(Math.random() * actions.length)];
            const className = "is-" + action;
            wrap.classList.add(className);
            setTimeout(function () {
                wrap.classList.remove(className);
                scheduleNextAction(wrap, color);
            }, ACTION_DURATION_MS[action] || 1000);
        }, gap);
    }

    function init() {
        if (!readLocal(EXPLORER_KEY)) return; // no profile yet — stay hidden on login

        /* Belt-and-suspenders against showing alongside the login screen's
           own .login-cat (index.html's synchronous inline script is
           supposed to hide #login-screen before first paint whenever
           jpExplorer exists, via the has-saved-explorer class — this
           guard covers the case where that check doesn't fire for some
           reason and #login-screen is still visible, which would
           otherwise put two different cats on screen at once). Only
           index.html has a #login-screen element at all. */
        const loginScreen = document.getElementById("login-screen");
        if (loginScreen && getComputedStyle(loginScreen).display !== "none") return;

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
        scheduleNextAction(wrap, color);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
