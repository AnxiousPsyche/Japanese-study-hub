//======================================================
// N5 SAVE — favorited-lesson persistence (localStorage)
//======================================================

const N5_FAVORITES_KEY = "jpLibraryOS.n5.favorites";

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

window.N5Save = {

    getFavorites: n5GetFavorites,

    isFavorite: n5IsFavorite,

    toggleFavorite: n5ToggleFavorite,

};
