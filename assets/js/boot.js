// ==========================================
// JP LIBRARY OS
// Boot Sequence
// ==========================================

const bootScreen = document.getElementById("boot-screen");
const discScreen = document.getElementById("disc-screen");
const discDrive = document.getElementById("disc-drive");
const desktop = document.getElementById("desktop");

const startButton = document.getElementById("start-btn");
const insertButton = document.getElementById("insert-disc");

const disc = document.querySelector(".jp-disc");

const statusText = document.getElementById("boot-status-text");

const bars = document.querySelectorAll(".loading-fill");

// Hide screens
discScreen.style.display = "none";
desktop.style.display = "none";

// Boot messages
const messages = [

    "🌸 Connecting to Sakura Academy...",

    "📚 Preparing Today's Lesson...",

    "🍵 Brewing Green Tea...",

    "🏫 Opening Classroom Door...",

    "👩 Tanaka Sensei is waiting...",

    "📖 Opening Your Japanese Textbook...",

    "✨ Welcome back, Reya!",

    "💿 System Ready."

];

// Animate loading bars
let current = 0;

function loadNext(){

    if(current < bars.length){

    statusText.textContent = messages[current];

    bars[current].style.width = "100%";

    current++;

    setTimeout(loadNext,1000);

}

else if(current < messages.length){

    statusText.textContent = messages[current];

    current++;

    setTimeout(loadNext,800);

}

else{

    statusText.textContent = "🎮 Press START to begin your adventure.";

    startButton.disabled = false;

    startButton.textContent = "▶ PRESS START";

    startButton.classList.add("xp-glow");

}

}

window.addEventListener("load", () => {

    setTimeout(loadNext,700);

});

// START
startButton.addEventListener("click", () => {


    startButton.disabled = true;
    
    bootScreen.classList.add("fade-out");

    setTimeout(() => {

        bootScreen.style.display = "none";

        discScreen.style.display = "flex";

        discScreen.classList.add("fade-in");

    },600);

});

// INSERT DISC
const readingText = document.getElementById("reading-text");
const readingProgress = document.querySelector(".reading-progress");
const driveLed = document.querySelector(".drive-led");

insertButton.addEventListener("click", () => {

    insertButton.disabled = true;
    
    disc.style.animation = "none";
    
    disc.offsetHeight;
    
    disc.classList.add("inserting");
    
    setTimeout(() => {

    discDrive.classList.add("drive-accept");},700);

    driveLed.classList.add("reading");

    readingText.textContent = "Reading Disc...";

    readingProgress.style.width = "0%";
    
    void readingProgress.offsetWidth;

readingProgress.style.width = "100%";

    setTimeout(() => {

        readingText.textContent = "Launching JP Library...";

    },1800);

    setTimeout(() => {

        discScreen.classList.add("fade-out");

    },2600);

    setTimeout(() => {

    driveLed.classList.remove("reading");

    discScreen.style.display = "none";

    discDrive.classList.remove("drive-accept");

    desktop.style.display = "block";

    desktop.classList.add("fade-in");

},3200);

});