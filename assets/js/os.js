// ==========================================
// START MENU
// ==========================================

const startButton=
document.getElementById("startMenuButton");

const startMenu=
document.getElementById("startMenu");

startButton.onclick=function(){

    startMenu.classList.toggle("show");

};

document.addEventListener("click",(event)=>{

    if(

        !startMenu.contains(event.target)

        &&

        !startButton.contains(event.target)

    ){

        startMenu.classList.remove("show");

    }

});


// ==========================================
// CLOCK
// ==========================================

const taskbarClock=
document.getElementById("taskbarClock");

const taskbarDate=
document.getElementById("taskbarDate");

function updateClock(){

    const now=new Date();

    taskbarClock.textContent=

    now.toLocaleTimeString([],{

        hour:"2-digit",

        minute:"2-digit"

    });

    taskbarDate.textContent=

    now.toLocaleDateString([],{

        month:"short",

        day:"numeric"

    });

}

updateClock();

setInterval(updateClock,1000);


// ==========================================
// VOLUME PANEL
// ==========================================

const volumeButton=
document.getElementById("volumeButton");

const volumePanel=
document.getElementById("volumePanel");

volumeButton.onclick=function(){

    volumePanel.classList.toggle("show");

};

document.addEventListener("click",(event)=>{

    if(

        !volumePanel.contains(event.target)

        &&

        !volumeButton.contains(event.target)

    ){

        volumePanel.classList.remove("show");

    }

});