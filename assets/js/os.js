// ==========================================
// START MENU
// ==========================================

const startButton =
document.getElementById("startMenuButton");

const startMenu =
document.getElementById("startMenu");

if(startButton && startMenu){

    startButton.addEventListener("click",()=>{

        startMenu.classList.toggle("show");

    });

}

if(startButton && startMenu){

    document.addEventListener("click",(event)=>{

        if(

            !startMenu.contains(event.target)

            &&

            !startButton.contains(event.target)

        ){

            startMenu.classList.remove("show");

        }

    });

}

// ==========================================
// MUSIC PANEL
// ==========================================

const musicButton =
document.getElementById("musicToggle");

const volumePanel =
document.getElementById("volumePanel");

const volumeSlider =
document.getElementById("volumeSlider");

const bgMusic =
document.getElementById("bgMusic");

if(bgMusic){

    bgMusic.volume = .35;

}

musicButton.addEventListener("click",()=>{

    volumePanel.classList.toggle("show");

});

volumeSlider.addEventListener("input",()=>{

    bgMusic.volume =
    volumeSlider.value / 100;

});

// ==========================================
// TASKBAR CLOCK
// ==========================================

const clock =
document.getElementById("taskbarClock");

const date =
document.getElementById("taskbarDate");

function updateTaskbarClock(){

    const now = new Date();

    clock.textContent =
    now.toLocaleTimeString([],{

        hour:"2-digit",

        minute:"2-digit",

        hour12:true

    });

    date.textContent =
    now.toLocaleDateString([],{

        month:"short",

        day:"numeric"

    });

}

updateTaskbarClock();

setInterval(updateTaskbarClock,1000);


const speakerButton =
document.getElementById("speakerButton");

const musicPlayer =
document.getElementById("musicPlayer");

speakerButton.addEventListener("click",()=>{

    musicPlayer.classList.toggle("show");

});

document.addEventListener("click",(event)=>{

    if(

        !musicPlayer.contains(event.target)

        &&

        !speakerButton.contains(event.target)

    ){

        musicPlayer.classList.remove("show");

    }

});