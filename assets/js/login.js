//======================================================
// JP LIBRARY LOGIN
//======================================================

document.addEventListener("DOMContentLoaded", () => {

    const loginForm =
        document.getElementById("loginForm");

    const loginScreen =
        document.getElementById("login-screen");

    const desktop =
        document.getElementById("desktop");

    if(!loginForm) return;

    loginForm.addEventListener("submit", loginExplorer);

    loadExplorer();

    initPasswordToggles();

    initRecallPassphrase();

});

//======================================================
// SHOW / HIDE PASSPHRASE
//======================================================

function initPasswordToggles(){

    document
        .querySelectorAll(".toggle-password")
        .forEach((button) => {

            button.addEventListener("click", () => {

                const input =
                    document.getElementById(
                        button.dataset.target
                    );

                if(!input) return;

                const icon = button.querySelector("i");

                const isHidden = input.type === "password";

                input.type = isHidden ? "text" : "password";

                if(icon){

                    icon.className =
                        isHidden ? "bi bi-eye-slash" : "bi bi-eye";

                }

                button.setAttribute(
                    "aria-label",
                    isHidden ? "Hide secret passphrase" : "Show secret passphrase"
                );

            });

        });

}

//======================================================
// PASSPHRASE GONE AMISS?
//======================================================

function initRecallPassphrase(){

    const recallButton =
        document.getElementById("recallPassphrase");

    if(!recallButton) return;

    recallButton.addEventListener("click", () => {

        const message =
            document.getElementById("recallMessage");

        const explorer = JSON.parse(
            localStorage.getItem("jpExplorer")
        );

        if(!explorer){

            if(message){

                message.textContent =
                    "📜 No journal has been recorded in this realm yet. Begin your adventure below.";

            }

            return;

        }

        const passwordInput =
            document.getElementById("playerPassword");

        const toggleButton =
            document.querySelector(
                '.toggle-password[data-target="playerPassword"]'
            );

        if(passwordInput){

            passwordInput.value = explorer.password;
            passwordInput.type = "text";

        }

        if(toggleButton){

            const icon = toggleButton.querySelector("i");

            if(icon) icon.className = "bi bi-eye-slash";

            toggleButton.setAttribute(
                "aria-label",
                "Hide secret passphrase"
            );

        }

        if(message){

            message.textContent =
                "🔮 A raven has delivered your secret passphrase, " +
                explorer.name +
                ". It now lies revealed below.";

        }

    });

}

//======================================================
// LOGIN / CREATE ACCOUNT
//======================================================

function loginExplorer(event){

    event.preventDefault();

    const oldName =
        document.getElementById("playerName");

    const oldPassword =
        document.getElementById("playerPassword");

    const newName =
        document.getElementById("newPlayerName");

    const newPassword =
        document.getElementById("newPlayerPassword");

    const avatar =
        document.getElementById("avatarUpload");

    let explorer = JSON.parse(

        localStorage.getItem("jpExplorer")

    );

    const clickedContinue =
        event.submitter &&
        event.submitter.id === "continueButton";

    //==================================================
    // NEW EXPLORER
    //==================================================

    if(

        !clickedContinue &&

        newName.value.trim() !== "" &&

        newPassword.value.trim() !== ""

    ){

        explorer = {

            name:
                newName.value.trim(),

            password:
                newPassword.value.trim(),

            avatar:"",

            title:"Grammar Explorer",

            level:1,

            xp:0,

            currentDisc:"N5",

            currentQuest:"Self Introduction",

            achievements:[],

            lessonsCompleted:[],

            streak:0,

            lastPlayedDate:null,

            created:

                new Date().toLocaleDateString()

        };

        // Save Avatar
        if(

            avatar.files.length > 0

        ){

            const reader = new FileReader();

            reader.onload = function(){

                explorer.avatar = reader.result;

                localStorage.setItem(

                    "jpExplorer",

                    JSON.stringify(explorer)

                );

                finishLogin(explorer);

            };

            reader.readAsDataURL(

                avatar.files[0]

            );

        }

        else{

            localStorage.setItem(

                "jpExplorer",

                JSON.stringify(explorer)

            );

            finishLogin(explorer);

        }

        return;

    }

    //==================================================
    // RETURNING EXPLORER
    //==================================================

    if(

        explorer &&

        oldName.value.trim() === explorer.name &&

        oldPassword.value === explorer.password

    ){

        finishLogin(explorer);

    }

    else{

        alert(

            "Explorer name or Secret Passphrase is incorrect."

        );

    }

}

//======================================================
// LOAD EXISTING ACCOUNT
//======================================================

function loadExplorer(){

    const explorer = JSON.parse(

        localStorage.getItem("jpExplorer")

    );

    if(!explorer) return;

    const oldName =
        document.getElementById("playerName");

    if(oldName){

        oldName.value = explorer.name;

    }

}

//======================================================
// LOGIN SUCCESS
//======================================================

function finishLogin(explorer){

    updateDesktop(explorer);

    const loginScreen =
        document.getElementById("login-screen");

    const desktop =
        document.getElementById("desktop");

    loginScreen.classList.add(

        "fade-out"

    );

    setTimeout(()=>{

        loginScreen.style.display="none";

        desktop.style.display="block";

        desktop.classList.add(

            "fade-in"

        );

    },600);

}

//======================================================
// UPDATE WHOLE DESKTOP
//======================================================

function updateDesktop(explorer){

    //--------------------------------------------------
    // Greeting
    //--------------------------------------------------

    const greeting =

        document.getElementById(

            "englishGreeting"

        );

    if(greeting){

        greeting.textContent =

            "Welcome back, " +

            explorer.name +

            ".";

    }

    //--------------------------------------------------
    // Player Status window (level, XP, streak, stats)
    //--------------------------------------------------

    if(typeof applyPlayerProgress === "function"){

        applyPlayerProgress(explorer);

    }

    //--------------------------------------------------
    // Start Menu
    //--------------------------------------------------

    const startProfile =

        document.querySelector(

            ".start-profile h3"

        );

    if(startProfile){

        startProfile.textContent =

            explorer.name;

    }

    //--------------------------------------------------
    // Avatar
    //--------------------------------------------------

    if(explorer.avatar !== ""){

        const avatar =

            document.querySelector(

                ".start-profile img"

            );

        if(avatar){

            avatar.src = explorer.avatar;

        }

    }

}