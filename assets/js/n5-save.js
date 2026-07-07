//======================================================
// N5 SAVE — favorited-lesson persistence (localStorage)
//======================================================

const N5_FAVORITES_KEY = "jpLibraryOS.n5.favorites";

const N5_AVATAR_COLOR_KEY = "jpLibraryOS.n5.avatarColor";

function n5GetFavorites(){

    try{

        const raw = localStorage.getItem(N5_FAVORITES_KEY);

        return raw ? JSON.parse(raw) : [];

    } catch(e){

        return [];

    }

}

function n5IsFavorite(lessonId){

    return n5GetFavorites().includes(lessonId);

}

function n5ToggleFavorite(lessonId){

    const favorites = n5GetFavorites();

    const index = favorites.indexOf(lessonId);

    if(index === -1){

        favorites.push(lessonId);

    } else {

        favorites.splice(index, 1);

    }

    try{

        localStorage.setItem(N5_FAVORITES_KEY, JSON.stringify(favorites));

    } catch(e){

        // localStorage unavailable (privacy mode, quota, etc.) —
        // degrade to session-only, never throw.

    }

    return favorites.includes(lessonId);

}

function n5GetAvatarColor(){

    try{

        return localStorage.getItem(N5_AVATAR_COLOR_KEY);

    } catch(e){

        return null;

    }

}

function n5SetAvatarColor(color){

    try{

        localStorage.setItem(N5_AVATAR_COLOR_KEY, color);

    } catch(e){

        // localStorage unavailable (privacy mode, quota, etc.) —
        // degrade to session-only, never throw.

    }

}

window.N5Save = {

    getFavorites: n5GetFavorites,

    isFavorite: n5IsFavorite,

    toggleFavorite: n5ToggleFavorite,

    getAvatarColor: n5GetAvatarColor,

    setAvatarColor: n5SetAvatarColor,

};
