//======================================================
// PLAYER PROGRESS — level, XP, streak, stats
//======================================================

const XP_PER_LEVEL = 500;

//======================================================
// LEVEL / XP MATH
//======================================================

function getLevelProgress(explorer){

    const xp = explorer.xp || 0;

    const level = Math.floor(xp / XP_PER_LEVEL) + 1;

    const xpIntoLevel = xp % XP_PER_LEVEL;

    return {

        level,
        xpIntoLevel,
        xpForNextLevel: XP_PER_LEVEL

    };

}

//======================================================
// DAILY STREAK
//======================================================

function updateDailyStreak(explorer){

    const today = new Date().toDateString();

    if(!explorer.lastPlayedDate){

        explorer.streak = 1;
        explorer.lastPlayedDate = today;

        return true;

    }

    if(explorer.lastPlayedDate === today){

        return false;

    }

    const msPerDay = 24 * 60 * 60 * 1000;

    const last = new Date(explorer.lastPlayedDate);
    const dayGap = Math.round(
        (new Date(today) - new Date(last.toDateString())) / msPerDay
    );

    explorer.streak =
        dayGap === 1 ? (explorer.streak || 0) + 1 : 1;

    explorer.lastPlayedDate = today;

    return true;

}

//======================================================
// RENDER — Player Status window
//======================================================

function renderPlayerStatus(explorer){

    const nameEl = document.getElementById("playerNameText");
    if(nameEl) nameEl.textContent = explorer.name;

    const titleEl = document.getElementById("playerTitleText");
    if(titleEl) titleEl.textContent = explorer.title || "Grammar Explorer";

    const avatarEl = document.getElementById("playerAvatar");
    if(avatarEl && explorer.avatar){
        avatarEl.src = explorer.avatar;
    }

    const { level, xpIntoLevel, xpForNextLevel } = getLevelProgress(explorer);

    const levelEl = document.getElementById("playerLevelText");
    if(levelEl) levelEl.textContent = "Level " + level;

    const xpFillEl = document.getElementById("playerXpFill");
    if(xpFillEl){
        const pct = (xpIntoLevel / xpForNextLevel) * 100;
        xpFillEl.style.width = pct + "%";
    }

    const xpTextEl = document.getElementById("playerXpText");
    if(xpTextEl){
        xpTextEl.textContent = xpIntoLevel + " / " + xpForNextLevel + " XP";
    }

    const streakEl = document.getElementById("playerStreakText");
    if(streakEl) streakEl.textContent = explorer.streak || 0;

    const badgesEl = document.getElementById("playerBadgesText");
    if(badgesEl) badgesEl.textContent = (explorer.achievements || []).length;

    const lessonsEl = document.getElementById("playerLessonsText");
    if(lessonsEl) lessonsEl.textContent = (explorer.lessonsCompleted || []).length;

}

//======================================================
// ENTRY POINT — called from login.js on every login
//======================================================

function applyPlayerProgress(explorer){

    const streakChanged = updateDailyStreak(explorer);

    renderPlayerStatus(explorer);

    if(streakChanged){

        localStorage.setItem(
            "jpExplorer",
            JSON.stringify(explorer)
        );

    }

}
