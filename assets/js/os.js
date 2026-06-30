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

        if(volumePanel){
            volumePanel.classList.remove("show");

        }

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

        if(startMenu){

        startMenu.classList.remove("show");

        }

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

            window.classList.add("window-active");

        });

    });

    initializeDraggableWindows();

}



//======================================================
// DRAG WINDOWS
//======================================================

function initializeDraggableWindows(){

    const draggableWindows =

        document.querySelectorAll(

    "#playerWindow, #discWindow, #questWindow"

);

    draggableWindows.forEach(window=>{

        const titleBar =

        window.querySelector(".window-title");

        if(!titleBar) return;

        let dragging = false;

        let offsetX = 0;

        let offsetY = 0;

        titleBar.addEventListener("mousedown",(event)=>{

            dragging = true;

            event.preventDefault();

            window.style.right = "auto";
            window.style.bottom = "auto";

            window.style.transform = "none";

            highestZ++;

            window.style.zIndex = highestZ;

            window.classList.add("dragging");

            offsetX =

                event.clientX -

                window.offsetLeft;

            offsetY =

                event.clientY -

                window.offsetTop;

        });

        document.addEventListener("mousemove",(event)=>{

            if(!dragging) return;

            window.style.position="absolute";

            window.style.left=
            (event.clientX-offsetX)+"px";

            window.style.top=
            (event.clientY-offsetY)+"px";

        });

        document.addEventListener("mouseup",()=>{

            dragging = false;

            window.classList.remove("dragging");

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
