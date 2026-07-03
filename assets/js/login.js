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