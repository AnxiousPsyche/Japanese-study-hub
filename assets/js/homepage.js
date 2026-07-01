// ==========================================
// DISC LAUNCHER
// ==========================================

const discs=
document.querySelectorAll(".launcher-disc");

const selectedText=
document.getElementById("selectedDisc");

const insertButton=
document.getElementById("insertDiscButton");

let selectedDisc=null;

discs.forEach(disc=>{

    disc.addEventListener("click",()=>{

        if(disc.classList.contains("locked")){

            return;

        }

        discs.forEach(item=>{

            item.classList.remove("selected");

        });

        disc.classList.add("selected");

        selectedDisc=disc;

        selectedText.textContent=

        disc.dataset.level+

        " Learning Disc Selected";

        insertButton.disabled=false;

    });

});

//======================================================
// DISC CAROUSEL
// Jukebox-style left/right glide between JLPT discs.
// Add this file as a new <script> tag in index.html,
// placed AFTER homepage.js and BEFORE os.js (it doesn't
// depend on either, but keeping init order consistent
// avoids surprises later).
//======================================================

document.addEventListener("DOMContentLoaded", () => {

    initializeDiscCarousel();

});

function initializeDiscCarousel(){

    const track =
        document.getElementById("discTrack");

    const prevBtn =
        document.getElementById("discPrev");

    const nextBtn =
        document.getElementById("discNext");

    const dotsContainer =
        document.getElementById("discDots");

    const resumeBtn =
        document.getElementById("discResumeBtn");

    if(!track || !prevBtn || !nextBtn) return;

    const slides =
        Array.from(track.querySelectorAll(".disc-slide"));

    let currentIndex = 0;

    //======================================================
    // BUILD DOTS
    //======================================================

    slides.forEach((slide, index)=>{

        const dot = document.createElement("button");

        dot.className = "disc-dot";

        dot.setAttribute(
            "aria-label",
            "Go to " + slide.dataset.level + " disc"
        );

        dot.addEventListener("click", ()=>{

            goToSlide(index);

        });

        dotsContainer.appendChild(dot);

    });

    const dots =
        Array.from(dotsContainer.querySelectorAll(".disc-dot"));

    //======================================================
    // CORE MOVE / RENDER
    //======================================================

    function render(){

        track.style.transform =
            "translateX(" + (currentIndex * -100) + "%)";

        dots.forEach((dot, index)=>{

            dot.classList.toggle(
                "active",
                index === currentIndex
            );

        });

        prevBtn.disabled = currentIndex === 0;

        nextBtn.disabled = currentIndex === slides.length - 1;

        const activeSlide = slides[currentIndex];

        const locked =
            activeSlide.dataset.locked === "true";

        if(resumeBtn){

            if(locked){

                resumeBtn.classList.add("disabled");

                resumeBtn.setAttribute("aria-disabled","true");

                resumeBtn.removeAttribute("href");

                resumeBtn.textContent = "🔒 Level Locked";

            }else{

                resumeBtn.classList.remove("disabled");

                resumeBtn.removeAttribute("aria-disabled");

                resumeBtn.setAttribute(
                    "href",
                    activeSlide.dataset.href || "#"
                );

                resumeBtn.textContent = "▶ Resume Adventure";

            }

        }

    }

    function goToSlide(index){

        currentIndex = Math.max(

            0,

            Math.min(index, slides.length - 1)

        );

        render();

    }

    //======================================================
    // ARROW CONTROLS
    //======================================================

    prevBtn.addEventListener("click", ()=>{

        goToSlide(currentIndex - 1);

    });

    nextBtn.addEventListener("click", ()=>{

        goToSlide(currentIndex + 1);

    });

    //======================================================
    // KEYBOARD SUPPORT (left/right while disc area focused)
    //======================================================

    track.closest(".disc-carousel").addEventListener(

        "keydown",

        (event)=>{

            if(event.key === "ArrowLeft"){

                goToSlide(currentIndex - 1);

            }

            if(event.key === "ArrowRight"){

                goToSlide(currentIndex + 1);

            }

        }

    );

    //======================================================
    // SWIPE / DRAG SUPPORT (mouse + touch)
    //======================================================

    let startX = 0;

    let isPointerDown = false;

    const viewport = track.parentElement;

    viewport.addEventListener("pointerdown",(event)=>{

        isPointerDown = true;

        startX = event.clientX;

        track.style.transition = "none";

    });

    viewport.addEventListener("pointermove",(event)=>{

        if(!isPointerDown) return;

        const deltaX = event.clientX - startX;

        const dragPercent =
            (deltaX / viewport.offsetWidth) * 100;

        track.style.transform =

            "translateX(" +
            ((currentIndex * -100) + dragPercent) +
            "%)";

    });

    function endDrag(event){

        if(!isPointerDown) return;

        isPointerDown = false;

        track.style.transition = "";

        const deltaX = event.clientX - startX;

        const threshold = viewport.offsetWidth * 0.18;

        if(deltaX > threshold){

            goToSlide(currentIndex - 1);

        }else if(deltaX < -threshold){

            goToSlide(currentIndex + 1);

        }else{

            render();

        }

    }

    viewport.addEventListener("pointerup", endDrag);

    viewport.addEventListener("pointerleave", endDrag);

    //======================================================
    // INITIAL RENDER
    //======================================================

    render();

}

//======================================================
// DESKTOP HEADER — GREETING + LIVE CLOCK + TYPING EFFECT
//
// Drives the "JP LIBRARY OS" welcome window:
//   #jpGreeting       -> Japanese greeting, time-aware
//   #englishGreeting  -> English translation, typed out
//   #greetingMessage  -> sub-message, typed out after
//   #currentTime      -> live clock inside the window
//
// Add as a new <script src="assets/js/greeting.js"></script>
// in index.html, before os.js is fine, after homepage.js.
//======================================================

document.addEventListener("DOMContentLoaded", () => {

    initializeGreeting();

    initializeHeaderClock();

});


//======================================================
// PLAYER NAME
// Swap this out for wherever the player's actual name
// is stored once you have profiles/login. Hardcoded for
// now to match the rest of the homepage.
//======================================================

const PLAYER_NAME = "Rei";


//======================================================
// TIME-OF-DAY GREETINGS
//======================================================

function getGreetingForHour(hour){

    // Late night / very early morning

    if(hour >= 0 && hour < 5){

        return {

            jp: "夜更かしですね！",

            en: "Burning the midnight oil, " + PLAYER_NAME + "?",

            message: "Even night owls need rest — but if you're studying, ganbatte!"

        };

    }

    // Morning

    if(hour >= 5 && hour < 12){

        return {

            jp: "おはようございます！",

            en: "Good morning, " + PLAYER_NAME + ".",

            message: "A fresh start to your Japanese adventure today."

        };

    }

    // Afternoon

    if(hour >= 12 && hour < 17){

        return {

            jp: "こんにちは！",

            en: "Good afternoon, " + PLAYER_NAME + ".",

            message: "Perfect time for a quick lesson or two."

        };

    }

    // Evening

    if(hour >= 17 && hour < 21){

        return {

            jp: "こんばんは！",

            en: "Good evening, " + PLAYER_NAME + ".",

            message: "Wind down the day with some vocabulary practice."

        };

    }

    // Late evening / returning home

    return {

        jp: "おかえりなさい！",

        en: "Welcome back, " + PLAYER_NAME + ".",

        message: "Your Japanese adventure continues today."

    };

}


//======================================================
// GREETING + TYPING EFFECT
//======================================================

function initializeGreeting(){

    const jpEl =
        document.getElementById("jpGreeting");

    const enEl =
        document.getElementById("englishGreeting");

    const msgEl =
        document.getElementById("greetingMessage");

    if(!jpEl || !enEl || !msgEl) return;

    const now = new Date();

    const greeting = getGreetingForHour(now.getHours());

    // Japanese line appears instantly (it reads as a
    // title), English + sub-message type out below it.

    jpEl.textContent = greeting.jp;

    typeText(enEl, greeting.en, 45, () => {

        typeText(msgEl, greeting.message, 28);

    });

}


//======================================================
// GENERIC TYPEWRITER
// el        -> target element
// text      -> full string to type
// speed     -> ms per character
// onDone    -> optional callback once finished
//======================================================

function typeText(el, text, speed, onDone){

    el.textContent = "";

    el.classList.add("typing-cursor");

    let index = 0;

    function typeNextChar(){

        if(index < text.length){

            el.textContent += text.charAt(index);

            index++;

            setTimeout(typeNextChar, speed);

        }else{

            el.classList.remove("typing-cursor");

            if(typeof onDone === "function"){

                onDone();

            }

        }

    }

    typeNextChar();

}


//======================================================
// LIVE CLOCK (inside the JP LIBRARY OS window itself,
// separate from the taskbar clock in os.js)
//======================================================

function initializeHeaderClock(){

    const clockEl =
        document.getElementById("currentTime");

    if(!clockEl) return;

    updateHeaderClock(clockEl);

    setInterval(() => {

        updateHeaderClock(clockEl);

    }, 1000);

}

function updateHeaderClock(clockEl){

    const now = new Date();

    clockEl.textContent =

        now.toLocaleTimeString([], {

            hour: "2-digit",

            minute: "2-digit",

            second: "2-digit"

        });

}

