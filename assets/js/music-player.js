//======================================================
// MUSIC PLAYER — volume, mute, play/pause, playlist
//======================================================

const TRACKS = {

    "kyoto":          { file:"Nebulite - Kyoto (freetouse.com).mp3",             label:"🌸 Kyoto",           artist:"Nebulite" },
    "coming-of-age":  { file:"Hazelwood - Coming Of Age (freetouse.com).mp3",    label:"🍁 Coming Of Age",   artist:"Hazelwood" },
    "daydreams":      { file:"Pufino - Daydreams (freetouse.com).mp3",           label:"☁️ Daydreams",       artist:"Pufino" },
    "dreaming":       { file:"Pufino - Dreaming (freetouse.com).mp3",            label:"🌙 Dreaming",        artist:"Pufino" },
    "andorra":        { file:"Zambolino - Andorra (freetouse.com).mp3",         label:"🏔️ Andorra",         artist:"Zambolino" },

};

const TRACK_ORDER = ["kyoto", "coming-of-age", "daydreams", "dreaming", "andorra"];

document.addEventListener("DOMContentLoaded", () => {

    const bgMusic       = document.getElementById("bgMusic");
    const volumeRange   = document.getElementById("volumeRange");
    const volumeIcon    = document.querySelector("#volumeButton i");
    const playPause     = document.getElementById("playPause");
    const playPauseIcon = playPause ? playPause.querySelector("i") : null;
    const previousTrack = document.getElementById("previousTrack");
    const nextTrack     = document.getElementById("nextTrack");
    const currentTrackEl = document.getElementById("currentTrack");
    const currentTrackArtistEl = document.getElementById("currentTrackArtist");
    const playlistItems  = document.querySelectorAll(".playlist-item");

    if(!bgMusic) return;

    let currentTrackId = "kyoto";

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

    function setPlayIcon(isPlaying){
        if(playPauseIcon){
            playPauseIcon.className = isPlaying ? "bi bi-pause-fill" : "bi bi-play-fill";
        }
    }

    if(playPause){

        playPause.addEventListener("click", () => {

            if(bgMusic.paused){

                bgMusic.play().catch(() => {});
                setPlayIcon(true);

            } else {

                bgMusic.pause();
                setPlayIcon(false);

            }

        });

    }

    //--------------------------------------------------
    // PLAYLIST — switch track, keep playing state
    //--------------------------------------------------

    function loadTrack(trackId, { autoplay } = {}){

        const track = TRACKS[trackId];
        if(!track) return;

        currentTrackId = trackId;

        const wasPlaying = !bgMusic.paused;

        bgMusic.src = "assets/sounds/" + track.file;

        if(currentTrackEl) currentTrackEl.textContent = track.label;
        if(currentTrackArtistEl) currentTrackArtistEl.textContent = track.artist;

        playlistItems.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.track === trackId);
        });

        if(autoplay || wasPlaying){
            bgMusic.play().catch(() => {});
            setPlayIcon(true);
        }

    }

    function stepTrack(direction, options){

        const index = TRACK_ORDER.indexOf(currentTrackId);
        const nextIndex = (index + direction + TRACK_ORDER.length) % TRACK_ORDER.length;

        loadTrack(TRACK_ORDER[nextIndex], options);

    }

    playlistItems.forEach(btn => {

        btn.addEventListener("click", () => {
            loadTrack(btn.dataset.track, { autoplay: true });
        });

    });

    if(previousTrack){
        previousTrack.addEventListener("click", () => stepTrack(-1));
    }

    if(nextTrack){
        nextTrack.addEventListener("click", () => stepTrack(1));
    }

    //--------------------------------------------------
    // Auto-advance to the next track when one finishes
    //--------------------------------------------------

    bgMusic.addEventListener("ended", () => {
        stepTrack(1, { autoplay: true });
    });

    // Mark the initially-loaded track (Kyoto, set via the
    // <audio><source> in HTML) as active in the playlist UI.
    playlistItems.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.track === currentTrackId);
    });

});
