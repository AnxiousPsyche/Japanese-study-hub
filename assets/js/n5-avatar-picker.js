//======================================================
// N5 AVATAR PICKER — first-visit cat color choice
//======================================================

document.addEventListener("DOMContentLoaded", () => {

    const picker   = document.getElementById("avatarPicker");
    const player   = document.getElementById("playerCharacter");
    const swatches = document.querySelectorAll(".avatar-swatch");

    if(!picker || !player || !window.N5Save) return;

    const CAT_COLORS = ["orange", "black", "calico", "gray", "brown", "white", "tuxedo"];

    function applyColor(color){

        CAT_COLORS.forEach((c) => player.classList.remove("cat--" + c));
        player.classList.add("cat--" + color);

    }

    const savedColor = window.N5Save.getAvatarColor();

    if(savedColor){

        applyColor(savedColor);

    } else {

        picker.classList.add("show");

    }

    swatches.forEach((swatch) => {

        swatch.addEventListener("click", () => {

            const color = swatch.dataset.color;

            window.N5Save.setAvatarColor(color);
            applyColor(color);
            picker.classList.remove("show");

        });

    });

});
