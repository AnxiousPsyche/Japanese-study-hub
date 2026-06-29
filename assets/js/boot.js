// ==========================================
// BOOT SCREEN
// ==========================================

const bootScreen =
document.getElementById("boot-screen");

const desktop =
document.getElementById("desktop");

const startButton =
document.getElementById("start-btn");

const statusText =
document.getElementById("boot-status-text");

const loadingBars =
document.querySelectorAll(".loading-fill");

const bootMessages=[

    "🌸 Connecting to Sakura Academy...",

    "📚 Preparing Today's Lesson...",

    "🍵 Brewing Green Tea...",

    "🏫 Opening Classroom Door...",

    "👩 Tanaka Sensei is waiting...",

    "📖 Opening Your Japanese Textbook...",

    "💿 Initializing Disc Drive...",

    "✨ System Ready."

];

let currentMessage=0;

desktop.style.display="none";

function bootSequence(){

    if(currentMessage<loadingBars.length){

        statusText.textContent=
        bootMessages[currentMessage];

        loadingBars[currentMessage].style.width="100%";

        currentMessage++;

        setTimeout(bootSequence,900);

    }

    else if(currentMessage<bootMessages.length){

        statusText.textContent=
        bootMessages[currentMessage];

        currentMessage++;

        setTimeout(bootSequence,700);

    }

    else{

        statusText.textContent=
        "▶ Press START";

        startButton.disabled=false;

    }

}

window.addEventListener("load",()=>{

    setTimeout(bootSequence,600);

});

startButton.onclick=function(){

    bootScreen.classList.add("fade-out");

    setTimeout(()=>{

        bootScreen.style.display="none";

        desktop.style.display="block";

        desktop.classList.add("fade-in");

    },600);

};