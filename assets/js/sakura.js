//======================================================
// SAKURA — petals falling from above
//
// Petals spawn across the FULL WIDTH of the page and
// drift straight down with a gentle sway, like they're
// falling from a tree overhead. Active on the login
// screen and the desktop; paused during the boot
// sequence.
//======================================================

(function(){

    //──────────────────────────────────────────────────
    // CONFIG — tweak without touching anything else
    //──────────────────────────────────────────────────

    const PETALS = [
        "🌸","🌸","🌸","🌸",   // cherry blossom (most common)
        "🌺",                    // hibiscus (rare)
        "🍃","🍃",               // leaf (occasional)
    ];

    // Gap between each new petal
    const SPAWN_MIN_MS = 500;
    const SPAWN_MAX_MS = 1400;

    // How long each petal takes to fall top to bottom.
    // Slower = gentle drift; this is a real "falling
    // leaf" pace, not a gust.
    const FALL_MIN_S = 14;
    const FALL_MAX_S = 22;

    //──────────────────────────────────────────────────
    // HELPERS
    //──────────────────────────────────────────────────

    function rand(min, max){
        return Math.random() * (max - min) + min;
    }

    function randItem(arr){
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function isVisible(id){

        const el = document.getElementById(id);

        if(!el) return false;

        return getComputedStyle(el).display !== "none";

    }

    function shouldShowPetals(){

        return isVisible("login-screen") || isVisible("desktop");

    }

    //──────────────────────────────────────────────────
    // SPAWN ONE PETAL
    //──────────────────────────────────────────────────

    function spawnPetal(){

        const container =
            document.getElementById("sakura-container");

        if(!container) return;

        const petal = document.createElement("span");

        petal.className   = "sakura";
        petal.textContent = randItem(PETALS);

        // Spread across the FULL width of the page, not
        // just one side.
        petal.style.left = rand(0, 96) + "vw";

        // Start just above the visible area — the fall
        // keyframes carry it down from there.
        petal.style.top = "-40px";

        // Small horizontal sway amount, varies per petal
        // so they don't all swing in unison.
        petal.style.setProperty("--sway", rand(20, 60) + "px");

        // Size variation gives a sense of depth
        const size = rand(15, 26);
        petal.style.fontSize = size + "px";

        // Duration — slower petals feel further away
        const duration = rand(FALL_MIN_S, FALL_MAX_S);
        petal.style.animationDuration = duration + "s";

        // Small stagger so bursts of spawns don't all
        // move in lockstep
        petal.style.animationDelay =
            rand(0, 0.5) + "s";

        // Opacity variation for depth
        petal.style.opacity =
            rand(0.5, 1).toFixed(2);

        container.appendChild(petal);

        // Remove from DOM once the animation finishes
        // (duration + delay + 1 s buffer)
        setTimeout(() => {
            if(petal.parentNode){
                petal.parentNode.removeChild(petal);
            }
        }, (duration + 1.5) * 1000);

    }

    //──────────────────────────────────────────────────
    // LOOP — schedule next petal after a random gap.
    // Keeps running always, but only actually spawns
    // (and only leaves existing petals falling) while
    // the login screen or desktop is visible — paused
    // during the boot sequence.
    //──────────────────────────────────────────────────

    function scheduleNext(){

        const delay = rand(SPAWN_MIN_MS, SPAWN_MAX_MS);

        setTimeout(() => {

            if(shouldShowPetals()){

                spawnPetal();

            } else {

                clearPetals();

            }

            scheduleNext();

        }, delay);

    }

    function clearPetals(){

        const container =
            document.getElementById("sakura-container");

        if(!container) return;

        container.innerHTML = "";

    }

    //──────────────────────────────────────────────────
    // START
    //──────────────────────────────────────────────────

    if(document.readyState === "loading"){
        document.addEventListener("DOMContentLoaded", scheduleNext);
    } else {
        scheduleNext();
    }

})();
