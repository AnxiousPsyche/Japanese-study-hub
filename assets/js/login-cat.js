/* LOGIN CAT — two responsibilities for the login screen's cat
   (assets/css/login.css's .login-cat):

   1. Theme-aware color. Unlike the sitewide companion-cat widget (which
      shows the player's own chosen color, only overriding to white in
      dark mode), this screen is pre-authentication — there's no
      "player's cat" yet — so it just always shows black in light theme
      and white in dark theme, whichever reads better against that
      screen's chrome. Reads the exact same effective-theme logic
      companion-cat.js's isDarkTheme() uses (an explicit `nekoBunko.theme`
      localStorage choice wins outright, otherwise `prefers-color-scheme`)
      so this stays in sync with whatever the player last chose on the
      homepage's taskbar toggle, even though that toggle's UI doesn't
      exist on this pre-login screen.

   2. Title scramble. The cat plays a continuous pouncing loop (CSS-only,
      see login.css); this periodically scrambles the title text in
      .scroll-title__text through random katakana before resolving it
      back to "Welcome to Neko Bunko OS", selling the illusion that the
      cat is batting at the letters. Loosely synced, not physically wired
      to the cat's actual sprite frames — the two just run on their own
      independent loops and read as connected because they're both "the
      cat is playing" motion happening together.

   Self-initializing like companion-cat.js/streak-popup.js — the
   <script> tag alone is enough, no other markup required. Only ever
   loaded on index.html (the login screen lives nowhere else), so no
   guard against a missing element is needed beyond the usual null check. */
(function () {
    "use strict";

    const SCRAMBLE_CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンー";
    const SCRAMBLE_STEPS = 12;
    const STEP_MS = 45;
    const MIN_GAP_MS = 7000;
    const MAX_GAP_MS = 13000;

    function readLocal(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    /* Identical logic to companion-cat.js's isDarkTheme() — kept as a
       separate copy rather than a shared import since this project has
       no build step/module system to share code across plain <script>
       tags without a global namespace dependency; if this ever drifts
       from companion-cat.js's version, re-sync both by hand. */
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

    function applyCatColor(el) {
        el.classList.remove("login-cat--black", "login-cat--white");
        el.classList.add(isDarkTheme() ? "login-cat--white" : "login-cat--black");
    }

    function randomChar() {
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }

    /* Resolves left-to-right: character i "locks in" to its real value
       once the frame count passes its own reveal frame (earlier
       characters get a smaller threshold, so they settle first), so the
       whole word doesn't snap back all at once. Everything before that
       threshold keeps re-rolling a random character each frame. */
    function scrambleOnce(el, finalText) {
        let frame = 0;
        const len = finalText.length;

        function tick() {
            let out = "";
            for (let i = 0; i < len; i++) {
                const ch = finalText[i];
                if (ch === " ") { out += " "; continue; }
                const revealFrame = Math.floor((i / len) * SCRAMBLE_STEPS);
                out += frame >= revealFrame ? ch : randomChar();
            }
            el.textContent = out;
            frame++;
            if (frame <= SCRAMBLE_STEPS) {
                setTimeout(tick, STEP_MS);
            } else {
                el.textContent = finalText;
            }
        }
        tick();
    }

    function scheduleNext(el, finalText) {
        const gap = MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS);
        setTimeout(function () {
            if (!document.hidden) scrambleOnce(el, finalText);
            scheduleNext(el, finalText);
        }, gap);
    }

    function init() {
        const cat = document.querySelector(".login-cat");
        if (cat) applyCatColor(cat);

        const el = document.querySelector(".scroll-title__text");
        if (!el) return;
        const finalText = el.textContent;
        scheduleNext(el, finalText);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
