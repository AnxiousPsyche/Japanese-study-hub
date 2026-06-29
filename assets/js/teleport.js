// ==========================================
// DISC INSERT
// ==========================================

const loader=
document.getElementById("discLoader");

const loaderDisc=
document.getElementById("loaderDisc");

const loaderTitle=
document.getElementById("loaderTitle");

const loaderFill=
document.querySelector(".loader-fill");

const teleportSound=
document.getElementById("teleportSound");

insertButton.onclick=function(){

    if(!selectedDisc){

        return;

    }

    loaderDisc.src=

    selectedDisc.src;

    loaderTitle.textContent=

    "Reading "+selectedDisc.dataset.level+

    " Learning Disc...";

    loader.classList.add("show");

    loaderFill.style.width="100%";

    teleportSound.currentTime=0;

    teleportSound.play();

    setTimeout(()=>{

        window.location.href=

        selectedDisc.dataset.target;

    },2200);

};