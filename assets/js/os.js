// JP LIBRARY OS
// INITIALIZATION
//======================================================

let highestZ = 100;

document.addEventListener("DOMContentLoaded", () => {

    initializeStartMenu();

    initializeVolumePanel();

    initializeClock();

    initializeWindowManager();

});


//======================================================
// ELEMENTS
//======================================================

const startButton =
document.getElementById("startButton");

const startMenu =
document.getElementById("startMenu");

const volumeButton =
document.getElementById("volumeButton");

const volumePanel =
document.getElementById("volumePanel");

const taskbarClock =
document.getElementById("taskbarClock");

const taskbarDate =
document.getElementById("taskbarDate");


//======================================================
// START MENU
//======================================================

function initializeStartMenu(){

    if(!startButton || !startMenu){

        return;

    }

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

function initializeVolumePanel(){

    if(!volumeButton || !volumePanel){

        return;

    }

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
// CLOCK
//======================================================

function initializeClock(){

    updateClock();

    setInterval(updateClock,1000);

}

function updateClock(){

    const now = new Date();

    if(taskbarClock){

        taskbarClock.textContent =

        now.toLocaleTimeString([],{

            hour:"2-digit",

            minute:"2-digit"

        });

    }

    if(taskbarDate){

        taskbarDate.textContent =

        now.toLocaleDateString([],{

            month:"short",

            day:"numeric"

        });

    }

}

//======================================================
// WINDOW MANAGER
//======================================================

function initializeWindowManager(){

    initializeDraggableWindows();

    initializeWindowButtons();

}

let activeWindow = null;


//======================================================
// DRAG WINDOWS
//
// FIX: left/top must be computed relative to the
// window's offsetParent (the nearest positioned
// ancestor — here, .desktop-container), NOT relative
// to the viewport. clientX/clientY from mouse events
// are always viewport-relative, so we have to subtract
// the offsetParent's own position on the page before
// using them to set left/top. Previously this subtraction
// was missing, which is why windows would jump/fly away
// the moment you started dragging: the further the
// container was from the page's top-left corner, the
// bigger the jump.
//======================================================

function initializeDraggableWindows(){

    const windows =

    document.querySelectorAll(

        "#playerWindow, #discWindow, #questWindow"

    );

    windows.forEach(windowEl=>{

        const titleBar =

        windowEl.querySelector(".window-title");

        if(!titleBar) return;

        let dragging = false;

        let offsetX = 0;

        let offsetY = 0;

        titleBar.addEventListener("mousedown",(event)=>{

            event.preventDefault();

            dragging = true;

            activeWindow = windowEl;

            highestZ++;

            windowEl.style.zIndex = highestZ;

            // Snapshot the window's CURRENT on-screen box

            // before we touch position, so it doesn't

            // visually jump when it switches from a grid

            // item to an absolutely positioned element.

            const windowRect =

                windowEl.getBoundingClientRect();

            const parentRect =

                windowEl.offsetParent

                ? windowEl.offsetParent.getBoundingClientRect()

                : { left:0, top:0 };

            windowEl.style.position = "absolute";

            windowEl.style.right = "auto";

            windowEl.style.bottom = "auto";

            windowEl.style.transform = "none";

            windowEl.style.width =

                windowRect.width + "px";

            // Re-anchor at the exact same visual spot,

            // now expressed relative to offsetParent.

            windowEl.style.left =

                (windowRect.left - parentRect.left) + "px";

            windowEl.style.top =

                (windowRect.top - parentRect.top) + "px";

            // Once detached from the grid, give it its

            // own stacking layer so the grid doesn't try

            // to reflow other windows into its old slot.

            windowEl.style.gridArea = "unset";

            offsetX =

                event.clientX -

                windowEl.getBoundingClientRect().left;

            offsetY =

                event.clientY -

                windowEl.getBoundingClientRect().top;

            windowEl.classList.add("dragging");

        });

        document.addEventListener("mousemove",(event)=>{

            if(!dragging) return;

            const parentRect =

                windowEl.offsetParent

                ? windowEl.offsetParent.getBoundingClientRect()

                : { left:0, top:0 };

            windowEl.style.left =

                (event.clientX - offsetX - parentRect.left) + "px";

            windowEl.style.top =

                (event.clientY - offsetY - parentRect.top) + "px";

        });

        document.addEventListener("mouseup",()=>{

            dragging = false;

            windowEl.classList.remove("dragging");

        });

    });

}


//======================================================
// WINDOW BUTTONS
//======================================================

function initializeWindowButtons(){

    document

    .querySelectorAll(".window-buttons")

    .forEach(buttonGroup=>{

        const windowEl =

        buttonGroup.closest(".retro-window");

        if(!windowEl) return;

        const buttons =

        buttonGroup.querySelectorAll("span");

        if(buttons.length<3) return;

        // Close Button (disabled for now)

        buttons[0].addEventListener("click",(event)=>{

            event.stopPropagation();

        });

        // Minimize

        buttons[1].addEventListener("click",(event)=>{

            event.stopPropagation();

            windowEl.classList.add("window-minimizing");

            setTimeout(()=>{

                windowEl.style.display="none";

            },250);

        });

        // Maximize

        buttons[2].addEventListener("click",(event)=>{

            event.stopPropagation();

            windowEl.classList.toggle("window-maximized");

        });

    });

}


//======================================================
// RESTORE WINDOW
//======================================================

function restoreWindow(id){

    const windowEl =

    document.getElementById(id);

    if(!windowEl) return;

    windowEl.style.display = "block";

    highestZ++;

    windowEl.style.zIndex = highestZ;

    windowEl.classList.remove(

        "window-minimizing"

    );

    windowEl.classList.add(

        "window-restoring"

    );

    setTimeout(()=>{

        windowEl.classList.remove(

            "window-restoring"

        );

    },300);

}


//======================================================
// TASKBAR WINDOW BUTTONS
//======================================================

document

.querySelectorAll(".taskbar-app")

.forEach(button=>{

    button.addEventListener("click",()=>{

        restoreWindow(

            button.dataset.window

        );

    });

});