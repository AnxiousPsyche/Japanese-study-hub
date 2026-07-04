// ==========================================
// BOOT SCREEN
// ==========================================

const bootScreen =
document.getElementById("boot-screen");

const loginScreen =
document.getElementById("login-screen");

const desktop =
document.getElementById("desktop");

const startBootButton =
document.getElementById("startBoot-btn");

const statusText =
document.getElementById("boot-status-text");

const loadingBars =
document.querySelectorAll(".loading-fill");

const bootMessages = [

    "🌸 Connecting to Sakura Academy...",

    "📚 Preparing Today's Lesson...",

    "🍵 Brewing Green Tea...",

    "📖 Opening Your Japanese Textbook...",

    "✨ System Ready."

];

let currentMessage = 0;

// ==========================================
// INITIAL STATE
// ==========================================

bootScreen.style.display = "flex";

loginScreen.style.display = "none";

desktop.style.display = "none";

// ==========================================
// BOOT SEQUENCE
// ==========================================

function bootSequence(){

    if(currentMessage < loadingBars.length){

        statusText.textContent =
        bootMessages[currentMessage];

        loadingBars[currentMessage].style.width = "100%";

        currentMessage++;

        setTimeout(bootSequence, 900);

    }

    else if(currentMessage < bootMessages.length){

        statusText.textContent =
        bootMessages[currentMessage];

        currentMessage++;

        setTimeout(bootSequence, 700);

    }

    else{

        statusText.textContent =
        "🎮 System Ready.";

        startBootButton.disabled = false;

        startBootButton.textContent =
        "▶ PRESS START";

        startBootButton.classList.add("xp-glow");

    }

}

// ==========================================
// START BOOT WHEN PAGE LOADS
// ==========================================

window.addEventListener("load", () => {

    setTimeout(bootSequence, 600);

});

// ==========================================
// BOOT BUTTON
// ==========================================

startBootButton.onclick = function(){

    startBootButton.disabled = true;

    bootScreen.classList.add("fade-out");

    setTimeout(() => {

        bootScreen.style.display = "none";

        loginScreen.style.display = "flex";

        loginScreen.classList.add("fade-in");

        window.scrollTo(0, 0);

        const bgMusic =
        document.getElementById("bgMusic");

        if(bgMusic){

            bgMusic.play().catch(() => {

                console.log("Music autoplay blocked.");

            });

        }

    }, 600);

};