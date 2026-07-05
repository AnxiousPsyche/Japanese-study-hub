//======================================================
// MUSIC PLAYER — volume, mute, play/pause
//======================================================

document.addEventListener("DOMContentLoaded", () => {

    const bgMusic = document.getElementById("bgMusic");
    const volumeRange = document.getElementById("volumeRange");
    const volumeIcon = document.querySelector("#volumeButton i");
    const playPause = document.getElementById("playPause");
    const playPauseIcon = playPause ? playPause.querySelector("i") : null;

    if(!bgMusic) return;

    //--------------------------------------------------
    // Start muted (matches the slider's default 0)
    //--------------------------------------------------

    bgMusic.volume = 0;

    //--------------------------------------------------
    // Volume slider
    //--------------------------------------------------

    if(volumeRange){

        volumeRange.addEventListener("input", () => {

            const value = Number(volumeRange.value);

            bgMusic.volume = value / 100;

            if(volumeIcon){

                volumeIcon.className =
                    value === 0
                        ? "bi bi-volume-mute-fill"
                        : "bi bi-volume-up-fill";

            }

        });

    }

    //--------------------------------------------------
    // Play / Pause
    //--------------------------------------------------

    if(playPause){

        playPause.addEventListener("click", () => {

            if(bgMusic.paused){

                bgMusic.play().catch(() => {});

                if(playPauseIcon) playPauseIcon.className = "bi bi-pause-fill";

            } else {

                bgMusic.pause();

                if(playPauseIcon) playPauseIcon.className = "bi bi-play-fill";

            }

        });

    }

});
