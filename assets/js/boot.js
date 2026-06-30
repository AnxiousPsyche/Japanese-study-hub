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

    "📖 Opening Your Japanese Textbook...",

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

    statusText.textContent =
    "🎮 System Ready.";

    startButton.disabled = false;

    startButton.textContent = "▶ PRESS START";

    startButton.classList.add("xp-glow");

}

}

window.addEventListener("load",()=>{

    setTimeout(bootSequence,600);

});

startButton.onclick=function(){

    startButton.disabled=true;

    bootScreen.classList.add("fade-out");

    setTimeout(()=>{

        bootScreen.style.display="none";

        desktop.style.display="block";
    

desktop.classList.add("fade-in");

window.scrollTo(0,0);

const bgMusic=document.getElementById("bgMusic");

if(bgMusic){

    bgMusic.play().catch(()=>{

        console.log("Music autoplay blocked.");

    });

}

},600);

};
