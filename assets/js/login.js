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

});

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

    //==================================================
    // NEW EXPLORER
    //==================================================

    if(

        newName.value.trim() !== "" &&

        newPassword.value.trim() !== ""

    ){

        explorer = {

            name:
                newName.value.trim(),

            password:
                newPassword.value.trim(),

            avatar:"",

            level:1,

            xp:0,

            currentDisc:"N5",

            currentQuest:"Self Introduction",

            achievements:[],

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
    // Player Name
    //--------------------------------------------------

    const playerName =

        document.getElementById(

            "playerNameText"

        );

    if(playerName){

        playerName.textContent =

            explorer.name;

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

//======================================================
// LOGIN
//======================================================

document.addEventListener("DOMContentLoaded",()=>{

    const loginForm =
        document.getElementById("loginForm");

    const loginScreen =
        document.getElementById("login-screen");

    const desktop =
        document.getElementById("desktop");

    if(!loginForm) return;

    loginForm.addEventListener("submit",(event)=>{

        event.preventDefault();

        const newExplorer =
            document.getElementById("newPlayerName");

        const currentExplorer =
            document.getElementById("playerName");

        let explorerName = "";

        if(

            newExplorer &&
            newExplorer.value.trim() !== ""

        ){

            explorerName =
                newExplorer.value.trim();

        }

        else if(

            currentExplorer &&
            currentExplorer.value.trim() !== ""

        ){

            explorerName =
                currentExplorer.value.trim();

        }

        else{

            explorerName = "Explorer";

        }

        localStorage.setItem(

            "jpExplorer",

            explorerName

        );

        const greeting =

            document.getElementById("englishGreeting");

        if(greeting){

            greeting.textContent =

                "Welcome back, " +

                explorerName +

                ".";

        }

        loginScreen.classList.add("fade-out");

        setTimeout(()=>{

            loginScreen.style.display = "none";

            desktop.style.display = "block";

            desktop.classList.add("fade-in");

        },600);

    });

});