//======================================================
// N5 MAP — free-roam movement, proximity, lesson data
//======================================================

const N5_LESSONS = {

    "1":       { id:"1",       label:"👋 Basic Greetings",              description:"Learn the basic greetings every conversation starts with.",       xp:50,  href:"lesson-01-greetings.html" },
    "2":       { id:"2",       label:"💬 Everyday Expressions",          description:"Common everyday phrases you'll use constantly.",                  xp:50,  href:null },
    "3":       { id:"3",       label:"🙋 Self Introduction",             description:"Introduce yourself: name, nationality, and job.",                 xp:50,  href:"grammar/lesson-02-self-introduction.html" },
    "4":       { id:"4",       label:"📘 A は B です",                    description:"The core A は B です sentence pattern.",                           xp:50,  href:"grammar/lesson-03-a-wa-b-desu.html" },
    "5":       { id:"5",       label:"📦 Demonstratives",                description:"This, that, and that over there — これ／それ／あれ and friends.", xp:50,  href:"grammar/lesson-04-demonstratives.html" },
    "6":       { id:"6",       label:"❓ Questions (か)",                 description:"Turn statements into questions with か.",                         xp:50,  href:"grammar/questions.html" },
    "7":       { id:"7",       label:"🧭 Places and Directions",         description:"Numbers, counters, and asking where things are.",                xp:50,  href:"grammar/numbers.html" },
    "review1": { id:"review1", label:"📋 Foundations Review",            description:"Review everything from Basic Greetings through Places and Directions.", xp:100, href:null },
    "9":       { id:"9",       label:"👥 Nouns & Pronouns",              description:"Nouns and pronouns — the building blocks of any sentence.",       xp:50,  href:null },
    "10":      { id:"10",      label:"🌸 Adjectives",                    description:"Describing things with い-adjectives and な-adjectives.",          xp:50,  href:null },
    "11":      { id:"11",      label:"⚡ Adverbs and Verbs",              description:"Adverbs and verb basics.",                                        xp:50,  href:null },
    "12":      { id:"12",      label:"🔄 Conjugations",                  description:"Conjugating verbs into their different forms.",                   xp:50,  href:null },
    "review2": { id:"review2", label:"📋 Sentence Builder Review",       description:"Review everything from Nouns & Pronouns through Conjugations.",   xp:100, href:null },
    "13":      { id:"13",      label:"🧱 Sentence Construction",         description:"Putting it all together: building full sentences.",              xp:50,  href:null },
    "14":      { id:"14",      label:"🧩 Particle Mastery",              description:"Mastering は、が、を、に、で and friends.",                          xp:50,  href:null },
    "15":      { id:"15",      label:"👥 Existence (あります・います)",    description:"Existence: あります and います.",                                  xp:50,  href:null },
    "final":   { id:"final",   label:"🏆 Final N5 Review",               description:"The final N5 review before you're ready for N4.",                xp:200, href:null },

};

document.addEventListener("DOMContentLoaded", () => {

    const map    = document.getElementById("lessonMap");
    const player = document.getElementById("playerCharacter");
    const nodes  = Array.from(document.querySelectorAll(".lesson-node"));

    if(!map || !player || !window.N5Popup) return;

    const SPEED = 220; // px per second
    const RANGE = 40;  // px proximity radius for the "in range" hint + Enter/Space interact

    const pressedKeys = new Set();

    let x = null;
    let y = null;
    let nearestNode = null;
    let lastFrameTime = null;

    function initialPosition(){

        const startGate = document.getElementById("startGate");
        const mapRect = map.getBoundingClientRect();

        if(startGate){

            const gateRect = startGate.getBoundingClientRect();
            x = gateRect.left - mapRect.left;
            y = gateRect.top - mapRect.top;

        } else {

            x = 0;
            y = mapRect.height - player.offsetHeight;

        }

    }

    function render(){

        player.style.left = x + "px";
        player.style.top = y + "px";

    }

    function setWalking(isWalking){

        player.classList.toggle("walking", isWalking);

    }

    function updateNearestNode(){

        const mapRect = map.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();
        const playerCenterX = playerRect.left - mapRect.left + playerRect.width / 2;
        const playerCenterY = playerRect.top - mapRect.top + playerRect.height / 2;

        let closest = null;
        let closestDistance = Infinity;

        nodes.forEach((node) => {

            const rect = node.getBoundingClientRect();
            const nodeCenterX = rect.left - mapRect.left + rect.width / 2;
            const nodeCenterY = rect.top - mapRect.top + rect.height / 2;

            const distance = Math.hypot(
                playerCenterX - nodeCenterX,
                playerCenterY - nodeCenterY
            );

            node.classList.remove("in-range");

            if(distance < RANGE && distance < closestDistance){

                closest = node;
                closestDistance = distance;

            }

        });

        if(closest){

            closest.classList.add("in-range");

        }

        nearestNode = closest;

    }

    function openNodePopup(node){

        const lessonId = node.dataset.lesson;
        const lesson = N5_LESSONS[lessonId];

        if(lesson){

            window.N5Popup.open(lesson);

        }

    }

    function step(timestamp){

        requestAnimationFrame(step);

        if(lastFrameTime === null){

            lastFrameTime = timestamp;
            return;

        }

        const deltaSeconds = (timestamp - lastFrameTime) / 1000;
        lastFrameTime = timestamp;

        if(window.N5Popup.isOpen()){

            setWalking(false);
            return;

        }

        let dx = 0;
        let dy = 0;

        if(pressedKeys.has("ArrowUp")    || pressedKeys.has("w")) dy -= 1;
        if(pressedKeys.has("ArrowDown")  || pressedKeys.has("s")) dy += 1;
        if(pressedKeys.has("ArrowLeft")  || pressedKeys.has("a")) dx -= 1;
        if(pressedKeys.has("ArrowRight") || pressedKeys.has("d")) dx += 1;

        const isMoving = dx !== 0 || dy !== 0;

        if(isMoving){

            const length = Math.hypot(dx, dy);
            dx /= length;
            dy /= length;

            const mapRect = map.getBoundingClientRect();

            x = Math.min(
                Math.max(x + dx * SPEED * deltaSeconds, 0),
                mapRect.width - player.offsetWidth
            );

            y = Math.min(
                Math.max(y + dy * SPEED * deltaSeconds, 0),
                mapRect.height - player.offsetHeight
            );

            render();

        }

        setWalking(isMoving);
        updateNearestNode();

    }

    document.addEventListener("keydown", (e) => {

        if(window.N5Popup.isOpen()){

            if(e.key === "Enter" || e.key === " "){

                e.preventDefault();

            }

            return;

        }

        pressedKeys.add(e.key);

        if((e.key === "Enter" || e.key === " ") && nearestNode){

            e.preventDefault();
            openNodePopup(nearestNode);

        }

    });

    document.addEventListener("keyup", (e) => {

        pressedKeys.delete(e.key);

    });

    nodes.forEach((node) => {

        node.addEventListener("click", () => openNodePopup(node));

    });

    initialPosition();
    render();
    requestAnimationFrame(step);

});
