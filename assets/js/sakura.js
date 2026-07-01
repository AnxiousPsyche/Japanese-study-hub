//======================================================
// SAKURA — wind-blown petal spawner
//
// Petals enter from the RIGHT side of the screen and
// drift left-and-downward, as if blown by wind.
// Each petal self-removes after its animation ends.
//
// Add to index.html after os.js:
//   <script src="assets/js/sakura.js"></script>
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

    // Gap between each new petal (randomised so they
    // don't march out in a neat row)
    const SPAWN_MIN_MS = 350;
    const SPAWN_MAX_MS = 1000;

    // How long each petal takes to cross the screen.
    // Slower = more gentle; faster = gust-like.
    const FALL_MIN_S = 7;
    const FALL_MAX_S = 13;

    //──────────────────────────────────────────────────
    // HELPERS
    //──────────────────────────────────────────────────

    function rand(min, max){
        return Math.random() * (max - min) + min;
    }

    function randItem(arr){
        return arr[Math.floor(Math.random() * arr.length)];
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

        // Start just off the RIGHT edge of the screen.
        // The horizontal start is between 95 vw and 115 vw
        // so some petals enter mid-screen, some from further right.
        petal.style.left =
            rand(92, 115) + "vw";

        // Spawn at a random height in the upper 60% of
        // the screen so petals feel like they come in at
        // different heights on the wind.
        petal.style.top =
            rand(-10, 55) + "vh";

        // Size variation gives a sense of depth
        const size = rand(15, 28);
        petal.style.fontSize = size + "px";

        // Duration — slower petals feel further away
        const duration = rand(FALL_MIN_S, FALL_MAX_S);
        petal.style.animationDuration = duration + "s";

        // Small stagger so bursts of spawns don't all
        // arrive at the left edge simultaneously
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
    // LOOP — schedule next petal after a random gap
    //──────────────────────────────────────────────────

    function scheduleNext(){

        const delay = rand(SPAWN_MIN_MS, SPAWN_MAX_MS);

        setTimeout(() => {
            spawnPetal();
            scheduleNext();
        }, delay);

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