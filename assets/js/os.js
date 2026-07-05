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
// Every .retro-window is ALREADY position:absolute or
// position:fixed via its own CSS (base rule + per-window
// overrides) — none of them are real in-flow grid items,
// so .dashboard-grid / .desktop-container never actually
// need to "hold a window's place." A window's own
// offsetParent (the browser's built-in nearest-positioned-
// ancestor lookup) is always the correct reference frame,
// whether that's .dashboard-grid, .desktop-container, or
// (for position:fixed windows) the viewport itself, where
// offsetParent is null.
//
// This replaces an earlier "ghost + reparent to
// .desktop-container" system: that system inserted a
// plain position:static placeholder div into a CSS Grid
// container to "hold the grid cell open" while dragging —
// but since nothing here is ever a real grid item, that
// placeholder became a brand-new in-flow block the moment
// it was inserted, growing .desktop-container's height by
// exactly the dragged window's own height. Because
// #desktop's wallpaper uses background-size:cover, that
// sudden height growth rescaled the image — the "zoom"
// bug. Tracking each window's own offsetParent instead
// needs no placeholder and no reparenting at all.
//======================================================

function parentOrigin(windowEl){
    const parent = windowEl.offsetParent;
    if(!parent) return {left:0, top:0};
    const r = parent.getBoundingClientRect();
    return {left:r.left, top:r.top};
}


//======================================================
// LOCK POSITION
//
// Called once, the first time a window is dragged or
// resized. Converts whatever positioned it originally
// (left/right/bottom/transform/CSS centering, etc.) into
// plain left/top pixel values at the identical visual
// spot, so dragging can just update left/top from there.
//======================================================

function lockPosition(windowEl){

    if(windowEl.dataset.locked === "true") return;

    const wRect  = windowEl.getBoundingClientRect();
    const origin = parentOrigin(windowEl);

    windowEl.style.left      = (wRect.left - origin.left) + "px";
    windowEl.style.top       = (wRect.top  - origin.top)  + "px";
    windowEl.style.width     = wRect.width  + "px";
    windowEl.style.height    = wRect.height + "px";
    windowEl.style.right     = "auto";
    windowEl.style.bottom    = "auto";
    windowEl.style.margin    = "0";
    windowEl.style.transform = "none";

    windowEl.dataset.locked = "true";

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
// grabX/grabY are read BEFORE lockPosition so any
// micro layout-shift (there shouldn't be any now, since
// nothing is reparented) doesn't corrupt the offset.
// lockPosition then places the window at the identical
// visual spot, so the grab offset stays valid throughout.
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
        // MUST happen before lockPosition
        const wRect = windowEl.getBoundingClientRect();
        grabX = e.clientX - wRect.left;
        grabY = e.clientY - wRect.top;

        lockPosition(windowEl);

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
        // convert to this window's own positioned-ancestor space
        const origin = parentOrigin(windowEl);

        windowEl.style.left = (e.clientX - grabX - origin.left) + "px";
        windowEl.style.top  = (e.clientY - grabY - origin.top)  + "px";

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

        lockPosition(windowEl);

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