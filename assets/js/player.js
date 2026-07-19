//======================================================
// N5 DASHBOARD — HUD PLAYER DISPLAY
//======================================================
// Reads the saved explorer profile (`jpExplorer`, written by
// login.js on the OS shell) and the chosen cat color
// (`nekoBunko.n5.catColor`, written by n5-phaser-game.js's
// CatSelectScene) and reflects them into the static HUD
// markup in n5-dashboard.html (#playerDisplayName, #playerRank,
// #playerAvatar, #playerXP).
//
// Read-only: this file never writes to localStorage, it only
// displays what other scripts already saved. Wrapped in an
// IIFE so it doesn't leak globals onto a page that also loads
// several other same-named-pattern scripts.
//======================================================

(function () {

  const CAT_AVATAR_PATHS = {
    orange: "../../assets/images/avatars/cat-2-64x64.png",
    black: "../../assets/images/avatars/cat-1-64x64.png",
    white: "../../assets/images/avatars/cat-3-64x64.png",
  };

  const FALLBACK_AVATAR = "../../assets/images/avatars/smeagol.png";

  //====================================================
  // SAFE READS
  //====================================================

  function getSavedExplorer() {

    try {

      const raw = localStorage.getItem("jpExplorer");
      return raw ? JSON.parse(raw) : null;

    } catch (err) {

      console.warn("player.js: corrupted jpExplorer save data, ignoring.", err);
      return null;

    }

  }

  function getSavedCatColor() {

    try {

      const raw = localStorage.getItem("nekoBunko.n5.catColor");
      if (!raw) return null;

      // n5-phaser-game.js stores this as a plain string
      // ("orange" / "black" / "white"), but fall back gracefully
      // if it's ever JSON-wrapped instead.
      try {
        const parsed = JSON.parse(raw);
        return typeof parsed === "string" ? parsed : raw;
      } catch (_) {
        return raw;
      }

    } catch (err) {

      return null;

    }

  }

  //====================================================
  // RENDER
  //====================================================

  function renderHud() {

    const explorer = getSavedExplorer();
    const catColor = getSavedCatColor();

    const nameEl = document.getElementById("playerDisplayName");
    if (nameEl && explorer && explorer.name) {
      nameEl.textContent = explorer.name;
    }

    const rankEl = document.getElementById("playerRank");
    if (rankEl && explorer && explorer.title) {
      rankEl.textContent = explorer.title;
    }

    const avatarEl = document.getElementById("playerAvatar");
    if (avatarEl) {
      avatarEl.src = (catColor && CAT_AVATAR_PATHS[catColor]) || FALLBACK_AVATAR;
    }

    const xpEl = document.getElementById("playerXP");
    if (xpEl && explorer) {
      xpEl.textContent = (explorer.xp || 0) + " XP";
    }

    // Lives (hearts) and Coins have no real tracking system anywhere in
    // the codebase yet (see JP_Library_OS_Project_Summary.md's "Planned
    // Systems" list) — intentionally left at their static HTML defaults
    // instead of displaying invented numbers with no backing data.

  }

  document.addEventListener("DOMContentLoaded", renderHud);

})();
