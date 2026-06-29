// ==========================================
// TELEPORT
// ==========================================

const overlay = document.getElementById("teleport-overlay");
const teleportLinks = document.querySelectorAll(".teleport-link");
const teleportSound = document.getElementById("teleportSound");

teleportLinks.forEach(link => {

    link.addEventListener("click", (e) => {

        e.preventDefault();

        overlay.classList.add("active");

        if (teleportSound) {

            teleportSound.currentTime = 0;
            teleportSound.volume = 1;

            teleportSound.play()
                .then(() => {
                    console.log("Teleport sound is playing!");
                })
                .catch(error => {
                    console.error("Audio Error:", error);
                });

        }

        setTimeout(() => {

            window.location.href = link.href;

        }, 850);

    });

});