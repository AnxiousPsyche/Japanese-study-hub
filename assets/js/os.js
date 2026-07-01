// JP LIBRARY OS — os.js
//======================================================
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

const startButton  = document.getElementById("startButton");
const startMenu    = document.getElementById("startMenu");
const volumeButton = document.getElementById("volumeButton");
const volumePanel  = document.getElementById("volumePanel");
const taskbarClock = document.getElementById("taskbarClock");
const taskbarDate  = document.getElementById("taskbarDate");


//======================================================
// START MENU
//======================================================

function initializeStartMenu(){

    if(!startButton || !startMenu) return;

    startButton.addEventListener("click", (e) => {
        e.stopPropagation();
        startMenu.classList.toggle("show");
        if(volumePanel) volumePanel.classList.remove("show");
    });

    document.addEventListener("click", (e) => {
        if(!startMenu.contains(e.target) && !startButton.contains(e.target)){
            startMenu.classList.remove("show");
        }
    });

}


//======================================================
// VOLUME PANEL
//======================================================

function initializeVolumePanel(){

    if(!volumeButton || !volumePanel) return;

    volumeButton.addEventListener("click", (e) => {
        e.stopPropagation();
        volumePanel.classList.toggle("show");
        if(startMenu) startMenu.classList.remove("show");
    });

    document.addEventListener("click", (e) => {
        if(!volumePanel.contains(e.target) && !volumeButton.contains(e.target)){
            volumePanel.classList.remove("show");
        }
    });

}


//======================================================
// TASKBAR CLOCK
//======================================================

function initializeClock(){
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock(){

    const now = new Date();

    if(taskbarClock){
        taskbarClock.textContent = now.toLocaleTimeString([], {
            hour:"2-digit", minute:"2-digit"
        });
    }

    if(taskbarDate){
        taskbarDate.textContent = now.toLocaleDateString([], {
            month:"short", day:"numeric"
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
// COORDINATE HELPERS
//
// All drag/resize math uses TWO numbers to convert a
// viewport coordinate into a container-relative one:
//
//   containerLeft(el)  =  the viewport X of the
//                         container's left padding edge
//   containerTop(el)   =  the viewport Y of the
//                         container's top  padding edge
//
// For position:absolute children, CSS `left`/`top` are
// measured from the containing block's PADDING EDGE.
// Since .desktop-container has no border, its padding
// edge equals getBoundingClientRect().left / .top.
//
// Therefore:
//   style.left  =  viewportX  −  containerLeft
//   style.top   =  viewportY  −  containerTop
//
// No padding subtraction is needed or correct.
// Subtracting padLeft/padTop was the cause of the jump —
// it double-counted padding that is already baked into
// the position of grid children (their wRect.left
// already reflects the container's padding offset).
//======================================================

function getDesktop(){
    return document.querySelector(".desktop-container");
}

function containerLeft(){
    return getDesktop().getBoundingClientRect().left;
}

function containerTop(){
    return getDesktop().getBoundingClientRect().top;
}


//======================================================
// DETACH FROM GRID
//
// Called once, the first time a window is dragged or
// resized. Steps in strict order:
//
//  1. Snapshot window rect NOW, before any DOM changes.
//  2. Insert an invisible ghost in the original parent
//     so sibling grid items don't enlarge/reflow.
//  3. Reparent window to .desktop-container and set
//     position:absolute at the identical visual spot.
//
// position formula:
//   left = wRect.left − containerLeft()
//   top  = wRect.top  − containerTop()
//======================================================

function detachFromGrid(windowEl){

    if(windowEl.dataset.detached === "true") return;

    const desktop = getDesktop();

    // Step 1 — snapshot before touching DOM
    const wRect = windowEl.getBoundingClientRect();
    const cLeft = containerLeft();
    const cTop  = containerTop();

    // Step 2 — ghost holds the original grid cell open
    const wStyle = getComputedStyle(windowEl);
    const ghost  = document.createElement("div");

    ghost.className        = "window-ghost";
    ghost.style.width      = wRect.width  + "px";
    ghost.style.height     = wRect.height + "px";
    ghost.style.gridArea   = wStyle.gridArea;
    ghost.style.gridColumn = wStyle.gridColumn;
    ghost.style.gridRow    = wStyle.gridRow;

    windowEl.parentElement.insertBefore(ghost, windowEl);
    windowEl._ghost = ghost;

    // Step 3 — reparent + place at exact same visual position
    desktop.appendChild(windowEl);

    windowEl.style.position  = "absolute";
    windowEl.style.left      = (wRect.left - cLeft) + "px";
    windowEl.style.top       = (wRect.top  - cTop)  + "px";
    windowEl.style.width     = wRect.width  + "px";
    windowEl.style.height    = wRect.height + "px";
    windowEl.style.right     = "auto";
    windowEl.style.bottom    = "auto";
    windowEl.style.margin    = "0";
    windowEl.style.transform = "none";

    windowEl.dataset.detached = "true";

}


//======================================================
// INIT ALL WINDOWS
//======================================================

const MIN_W = 180;
const MIN_H = 100;

function initializeDraggableWindows(){

    document.querySelectorAll(".retro-window").forEach(windowEl => {
        injectResizeHandles(windowEl);
        initDrag(windowEl);
        initResize(windowEl);
    });

}


//======================================================
// RESIZE HANDLE INJECTION
//======================================================

function injectResizeHandles(windowEl){

    if(windowEl.querySelector(".resize-handle")) return;

    ["n","ne","e","se","s","sw","w","nw"].forEach(dir => {
        const handle       = document.createElement("div");
        handle.className   = "resize-handle " + dir;
        handle.dataset.dir = dir;
        windowEl.appendChild(handle);
    });

}


//======================================================
// DRAG
//
// grabX/grabY are read BEFORE detachFromGrid so any
// micro layout-shift from the ghost insertion doesn't
// corrupt the offset. detachFromGrid then places the
// window at the exact same visual spot, so the grab
// offset stays valid throughout the drag.
//======================================================

function initDrag(windowEl){

    const titleBar = windowEl.querySelector(".window-title");
    if(!titleBar) return;

    let dragging = false;
    let grabX = 0;
    let grabY = 0;

    titleBar.addEventListener("mousedown", (e) => {

        if(e.target.closest(".window-buttons")) return;
        e.preventDefault();

        // Read where inside the window we grabbed —
        // MUST happen before detachFromGrid
        const wRect = windowEl.getBoundingClientRect();
        grabX = e.clientX - wRect.left;
        grabY = e.clientY - wRect.top;

        detachFromGrid(windowEl);

        dragging = true;
        activeWindow = windowEl;
        highestZ++;
        windowEl.style.zIndex = highestZ;
        windowEl.classList.add("dragging");

    });

    document.addEventListener("mousemove", (e) => {

        if(!dragging) return;

        // viewport position where window-left-edge should be
        // = mouse position minus grab offset
        // convert to container space: subtract container's own left/top
        windowEl.style.left = (e.clientX - grabX - containerLeft()) + "px";
        windowEl.style.top  = (e.clientY - grabY - containerTop())  + "px";

    });

    document.addEventListener("mouseup", () => {
        if(!dragging) return;
        dragging = false;
        windowEl.classList.remove("dragging");
    });

}


//======================================================
// RESIZE
//======================================================

function initResize(windowEl){

    windowEl.addEventListener("mousedown", (e) => {

        const handle = e.target.closest(".resize-handle");
        if(!handle) return;

        e.preventDefault();
        e.stopPropagation();

        detachFromGrid(windowEl);

        highestZ++;
        windowEl.style.zIndex = highestZ;
        windowEl.classList.add("resizing");

        const dir = handle.dataset.dir;
        const startMouseX = e.clientX;
        const startMouseY = e.clientY;
        const startW = windowEl.offsetWidth;
        const startH = windowEl.offsetHeight;
        const startL = parseFloat(windowEl.style.left) || 0;
        const startT = parseFloat(windowEl.style.top)  || 0;

        function onMouseMove(e){

            const dx = e.clientX - startMouseX;
            const dy = e.clientY - startMouseY;

            let newW = startW, newH = startH;
            let newL = startL, newT = startT;

            if(dir.includes("e")) newW = Math.max(MIN_W, startW + dx);

            if(dir.includes("w")){
                newW = Math.max(MIN_W, startW - dx);
                newL = startL + (startW - newW);
            }

            if(dir.includes("s")) newH = Math.max(MIN_H, startH + dy);

            if(dir.includes("n")){
                newH = Math.max(MIN_H, startH - dy);
                newT = startT + (startH - newH);
            }

            windowEl.style.width  = newW + "px";
            windowEl.style.height = newH + "px";
            windowEl.style.left   = newL + "px";
            windowEl.style.top    = newT + "px";

        }

        function onMouseUp(){
            windowEl.classList.remove("resizing");
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup",   onMouseUp);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup",   onMouseUp);

    });

}


//======================================================
// WINDOW BUTTONS
//======================================================

function initializeWindowButtons(){

    document.querySelectorAll(".window-buttons").forEach(buttonGroup => {

        const windowEl = buttonGroup.closest(".retro-window");
        if(!windowEl) return;

        const buttons = buttonGroup.querySelectorAll("span");
        if(buttons.length < 3) return;

        // Red — close (noop for now)
        buttons[0].addEventListener("click", (e) => {
            e.stopPropagation();
        });

        // Yellow — minimize
        buttons[1].addEventListener("click", (e) => {
            e.stopPropagation();
            windowEl.classList.add("window-minimizing");
            setTimeout(() => { windowEl.style.display = "none"; }, 250);
        });

        // Green — maximize / restore
        buttons[2].addEventListener("click", (e) => {
            e.stopPropagation();
            windowEl.classList.toggle("window-maximized");
        });

    });

}


//======================================================
// RESTORE WINDOW (called by taskbar buttons)
//======================================================

function restoreWindow(id){

    const windowEl = document.getElementById(id);
    if(!windowEl) return;

    windowEl.style.display = "block";
    highestZ++;
    windowEl.style.zIndex = highestZ;
    windowEl.classList.remove("window-minimizing");
    windowEl.classList.add("window-restoring");

    setTimeout(() => {
        windowEl.classList.remove("window-restoring");
    }, 300);

}


//======================================================
// TASKBAR WINDOW BUTTONS
//======================================================

document.querySelectorAll(".taskbar-app").forEach(button => {
    button.addEventListener("click", () => {
        restoreWindow(button.dataset.window);
    });
});

//======================================================
// DESKTOP SHORTCUT SELECTION
//======================================================

document

.querySelectorAll(".desktop-icon")

.forEach(shortcut=>{

    shortcut.addEventListener("click",()=>{

        document

        .querySelectorAll(".desktop-icon")

        .forEach(item=>{

            item.classList.remove("selected");

        });

        shortcut.classList.add("selected");

    });

});