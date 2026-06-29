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