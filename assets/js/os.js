//======================================================
// JP LIBRARY OS
// INITIALIZATION
//======================================================

document.addEventListener("DOMContentLoaded",()=>{

    initializeStartMenu();

    initializeVolumePanel();

    initializeClock();

    initializeWindowManager();

});

//======================================================
// START MENU
//======================================================

const startButton =
document.getElementById("startButton");

const startMenu =
document.getElementById("startMenu");

function initializeStartMenu(){

    if(!startButton || !startMenu) return;

    startButton.addEventListener("click",(event)=>{

        event.stopPropagation();

        startMenu.classList.toggle("show");

        volumePanel?.classList.remove("show");

    });

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

//======================================================
// VOLUME PANEL
//======================================================

const volumeButton =
document.getElementById("volumeButton");

const volumePanel =
document.getElementById("volumePanel");

function initializeVolumePanel(){

    if(!volumeButton || !volumePanel) return;

    volumeButton.addEventListener("click",(event)=>{

        event.stopPropagation();

        volumePanel.classList.toggle("show");

        startMenu?.classList.remove("show");

    });

    document.addEventListener("click",(event)=>{

        if(

            !volumePanel.contains(event.target)

            &&

            !volumeButton.contains(event.target)

        ){

            volumePanel.classList.remove("show");

        }

    });

}

//======================================================
// TASKBAR CLOCK
//======================================================

const taskbarClock =
document.getElementById("taskbarClock");

const taskbarDate =
document.getElementById("taskbarDate");

function initializeClock(){

    updateClock();

    setInterval(updateClock,1000);

}

function updateClock(){

    const now = new Date();

    if(taskbarClock){

        taskbarClock.textContent=

        now.toLocaleTimeString(

            [],

            {

                hour:"2-digit",

                minute:"2-digit"

            }

        );

    }

    if(taskbarDate){

        taskbarDate.textContent=

        now.toLocaleDateString(

            [],

            {

                month:"short",

                day:"numeric"

            }

        );

    }

}

//======================================================
// WINDOW MANAGER
//======================================================

let highestZ = 100;

function initializeWindowManager(){

    const windows =

    document.querySelectorAll(".retro-window");

    windows.forEach(window=>{

        window.addEventListener("mousedown",()=>{

            highestZ++;

            window.style.zIndex = highestZ;

        });

    });

}

//======================================================
// MINIMIZE
//======================================================

document.querySelectorAll(".window-minimize")

.forEach(button=>{

    button.addEventListener("click",()=>{

        const window =

        button.closest(".retro-window");

        if(!window) return;

        window.classList.add("window-minimizing");

        setTimeout(()=>{

            window.style.display="none";

        },250);

    });

});

//======================================================
// MAXIMIZE
//======================================================

document.querySelectorAll(".window-maximize")

.forEach(button=>{

    button.addEventListener("click",()=>{

        const window=

        button.closest(".retro-window");

        if(!window) return;

        window.classList.toggle("window-maximized");

    });

});


//======================================================
// RESTORE WINDOW
//======================================================

function restoreWindow(id){

    const window =

    document.getElementById(id);

    if(!window) return;

    window.style.display="block";

    window.classList.remove("window-minimizing");

    window.classList.add("window-restoring");

}