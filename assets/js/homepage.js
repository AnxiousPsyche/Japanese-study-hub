// ==========================================
// JP LIBRARY OS
// Homepage
// ==========================================

const jpGreeting = document.getElementById("jpGreeting");
const englishGreeting = document.getElementById("englishGreeting");
const greetingMessage = document.getElementById("greetingMessage");
const currentTime = document.getElementById("currentTime");

// Temporary player
// Later this comes from login

const playerName = "Rei";



// ======================================================
// TYPEWRITER
// ======================================================

function typeText(element, text, speed = 50){

    element.textContent = "";

    element.classList.add("typing");

    let index = 0;

    function typing(){

        if(index < text.length){

            element.textContent += text.charAt(index);

            index++;

            setTimeout(typing, speed);

        }

        else{

            element.classList.remove("typing");

        }

    }

    typing();

}



// ======================================================
// GREETING
// ======================================================

function updateGreeting(){

    const now = new Date();

    const hour = now.getHours();

    let jp = "";
    let english = "";
    let message = "";



    if(hour >= 5 && hour < 12){

        jp = "おはようございます！";

        english = `Good Morning, ${playerName}!`;

        message = "A wonderful day to learn Japanese.";

    }

    else if(hour >= 12 && hour < 18){

        jp = "こんにちは！";

        english = `Good Afternoon, ${playerName}!`;

        message = "Ready for today's lesson?";

    }

    else if(hour >= 18 && hour < 22){

        jp = "こんばんは！";

        english = `Good Evening, ${playerName}!`;

        message = "Let's continue your adventure.";

    }

    else{

        jp = "🌙 こんばんは！";

        english = `Still studying, ${playerName}?`;

        message = "You're doing amazing. Keep going!";

    }



    typeText(jpGreeting, jp, 70);

    setTimeout(() => {

        typeText(englishGreeting, english, 35);

    }, jp.length * 70 + 250);



    setTimeout(() => {

        typeText(greetingMessage, message, 25);

    }, jp.length * 70 + english.length * 35 + 500);

}



// ======================================================
// CLOCK
// ======================================================

function updateClock(){

    const now = new Date();

    currentTime.textContent = now.toLocaleTimeString([],{

        hour:"2-digit",

        minute:"2-digit",

        second:"2-digit",

        hour12:true

    });

}



// ======================================================

window.addEventListener("DOMContentLoaded", () => {

    updateClock();

    setInterval(updateClock, 1000);

});

// ==========================================
// Sakura Petals
// ==========================================

const sakuraContainer =
document.getElementById("sakura-container");

function createPetal(){

    const petal =
    document.createElement("div");

    petal.classList.add("sakura");

    petal.innerHTML = "🌸";



    petal.style.left =
        Math.random()*100+"vw";



    petal.style.fontSize =
        (18+Math.random()*14)+"px";



    petal.style.animationDuration =
        (8+Math.random()*6)+"s";



    petal.style.transform =
        `rotate(${Math.random()*360}deg)`;



    sakuraContainer.appendChild(petal);



    setTimeout(()=>{

        petal.remove();

    },15000);

}



setInterval(createPetal,650);


// ==========================================
// Background Music
// ==========================================

const bgMusic = document.getElementById("bgMusic");

const musicToggle = document.getElementById("musicToggle");

let musicPlaying = false;

musicToggle.addEventListener("click", () => {

    if(musicPlaying){

        bgMusic.pause();

        musicToggle.textContent = "🔇";

    }

    else{

        bgMusic.play();

        musicToggle.textContent = "🔊";

    }

    musicPlaying = !musicPlaying;

});

// ==========================================
// ACHIEVEMENTS
// ==========================================

const achievementContainer =
document.getElementById("achievement-container");

function unlockAchievement(title, description){

    const achievement =
    document.createElement("div");

    achievement.className = "achievement";

    achievement.innerHTML = `

        <h3>🏆 Achievement Unlocked!</h3>

        <strong>${title}</strong>

        <p>${description}</p>

    `;

    achievementContainer.appendChild(achievement);

    setTimeout(()=>{

        achievement.remove();

    },5000);
}

setTimeout(()=>{

    unlockAchievement(

        "Grammar Explorer",

        "Welcome to JP Library!"

    );

},2500);
