// ==========================================
// TELEPORT
// ==========================================

const overlay =
document.getElementById("teleport-overlay");

const teleportLinks =
document.querySelectorAll(".teleport-link");

teleportLinks.forEach(link=>{

    link.addEventListener("click",(e)=>{

        e.preventDefault();

        overlay.classList.add("active");

        setTimeout(()=>{

            window.location.href =
            link.href;

        },850);

    });

});