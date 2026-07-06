//======================================================
// N5 POPUP — lesson popup: Start Lesson / Favorite / Exit
//======================================================

document.addEventListener("DOMContentLoaded", () => {

    const popup            = document.getElementById("lessonPopup");
    const popupTitle        = document.getElementById("popupTitle");
    const popupLessonTitle  = document.getElementById("popupLessonTitle");
    const popupDescription  = document.getElementById("popupLessonDescription");
    const popupXP           = document.getElementById("popupXP");
    const startButton       = document.getElementById("startLessonButton");
    const favoriteButton    = document.getElementById("favoriteLessonButton");
    const closeButton       = document.getElementById("closePopup");

    if(!popup) return;

    let currentLesson = null;

    function renderFavoriteState(){

        if(!currentLesson || !favoriteButton) return;

        const favorited = window.N5Save.isFavorite(currentLesson.id);

        favoriteButton.textContent = favorited
            ? "⭐ Favorited"
            : "⭐ Save/Favorite";

        favoriteButton.classList.toggle("favorited", favorited);

    }

    function open(lesson){

        currentLesson = lesson;

        popupTitle.textContent = "Lesson";
        popupLessonTitle.textContent = lesson.label;
        popupDescription.textContent = lesson.description;
        popupXP.textContent = "+" + lesson.xp;

        if(lesson.href){

            startButton.disabled = false;
            startButton.textContent = "▶ Start Lesson";

        } else {

            startButton.disabled = true;
            startButton.textContent = "🔒 Coming Soon";

        }

        renderFavoriteState();

        popup.classList.add("show");

    }

    function close(){

        popup.classList.remove("show");
        currentLesson = null;

    }

    function isOpen(){

        return popup.classList.contains("show");

    }

    if(startButton){

        startButton.addEventListener("click", () => {

            if(currentLesson && currentLesson.href){

                window.location.href = currentLesson.href;

            }

        });

    }

    if(favoriteButton){

        favoriteButton.addEventListener("click", () => {

            if(!currentLesson) return;

            window.N5Save.toggleFavorite(currentLesson.id);
            renderFavoriteState();

        });

    }

    if(closeButton){

        closeButton.addEventListener("click", close);

    }

    document.addEventListener("keydown", (e) => {

        if(e.key === "Escape" && isOpen()){

            close();

        }

    });

    window.N5Popup = { open, close, isOpen };

});
