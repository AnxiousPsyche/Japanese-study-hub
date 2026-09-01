//======================================================
// TODAY'S QUEST — picks one lesson-scoped mini-goal per day for the
// homepage "Today's Quest" window. Was a single hardcoded "Self
// Introduction" quest before; now:
//   - scoped to lessons the player has actually completed (via
//     StudyProgress.completedLessonIds()) — never suggests something
//     they haven't studied yet. A fresh player (nothing completed) gets
//     shelf 01 as a natural "get started" default.
//   - stable for the whole day (same quest on every reload today), but
//     different from whatever was shown yesterday, by design — never
//     literally random-per-load.
//======================================================

const QUEST_POOL = [
    { lessonId: "s01", title: "Basic Greetings", desc: "Greet someone in Japanese." },
    { lessonId: "s02", title: "Greetings & Everyday Phrases", desc: "Use an everyday expression." },
    { lessonId: "s02b", title: "At Home & At the Table", desc: "Use a phrase from home life." },
    { lessonId: "s02c", title: "Filler Words & Reactions", desc: "Drop in a natural filler word." },
    { lessonId: "s03", title: "A は B です", desc: "Describe something with A は B です." },
    { lessonId: "s04", title: "Self Introduction", desc: "Introduce yourself." },
    { lessonId: "s05", title: "Demonstratives", desc: "Point out \"this\" or \"that\"." },
    { lessonId: "s06", title: "Questions (か)", desc: "Ask a yes/no question." },
    { lessonId: "s07a", title: "Basic Numbers", desc: "Count something." },
    { lessonId: "s07b", title: "つ & 匹 Counters", desc: "Count objects or a small animal." },
    { lessonId: "s07c", title: "Telling Time", desc: "Say what time it is." },
    { lessonId: "s08a", title: "There Is/Are & Places", desc: "Say where something is located." },
    { lessonId: "s08b", title: "Direction Words", desc: "Describe a position relative to something." },
    { lessonId: "s08c", title: "Movement & The Compass", desc: "Give someone directions." },
    { lessonId: "s09a", title: "Nouns", desc: "Name a noun." },
    { lessonId: "s09b", title: "Pronouns", desc: "Use a pronoun instead of a name." },
    { lessonId: "s10a", title: "い-Adjectives", desc: "Describe something with an い-adjective." },
    { lessonId: "s10b", title: "な-Adjectives", desc: "Describe something with a な-adjective." },
    { lessonId: "s10c", title: "Adverbs", desc: "Describe an action with an adverb." },
    { lessonId: "s11a", title: "Ichidan Verbs", desc: "Conjugate an ichidan verb to ます-form." },
    { lessonId: "s11b", title: "Godan Verbs", desc: "Conjugate a godan verb to ます-form." },
    { lessonId: "s11c", title: "Kuru & Suru", desc: "Use する or 来る in a sentence." },
    { lessonId: "s12", title: "Invitations", desc: "Invite someone to do something." },
    { lessonId: "s13", title: "Conjugations (て-form)", desc: "Practice the て-form." },
    { lessonId: "s14", title: "Past & Negative", desc: "Talk about the past." },
    { lessonId: "s15", title: "Sentence Construction", desc: "Build a full sentence." },
    { lessonId: "s16a", title: "Subject Particles", desc: "Practice は, が, and も." },
    { lessonId: "s16b", title: "Time Particles", desc: "Practice に and time words." },
    { lessonId: "s16c", title: "Place Particles", desc: "Practice で and に for places." },
    { lessonId: "s16d", title: "Object Particles", desc: "Practice を." },
    { lessonId: "s16e", title: "Other Particles", desc: "Practice の and か." },
    { lessonId: "k01", title: "N5 Kanji", desc: "Recognize a kanji from the N5 list." }
];

const QUEST_STATE_KEY = "nekoBunko.dailyQuest.v1";
const QUEST_XP = 50;

function todayDateString() {
    const now = new Date();
    return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
}

/* Small deterministic string hash (djb2) — same date always picks the
   same starting index, no Math.random() needed for "stable all day". */
function hashString(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
    }
    return hash;
}

function loadQuestState() {
    try {
        const raw = localStorage.getItem(QUEST_STATE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function saveQuestState(state) {
    try {
        localStorage.setItem(QUEST_STATE_KEY, JSON.stringify(state));
    } catch (e) {
        /* storage unavailable — quest just won't persist across reloads today */
    }
}

/* Scope the pool to lessons the player has actually completed; a fresh
   player (nothing completed) still gets shelf 01 as a starting quest. */
function scopedPool() {
    const doneIds = (window.StudyProgress && window.StudyProgress.completedLessonIds())
        || [];
    const pool = QUEST_POOL.filter((q) => doneIds.indexOf(q.lessonId) !== -1);
    return pool.length ? pool : [QUEST_POOL[0]];
}

function pickTodaysQuest() {
    const today = todayDateString();
    const state = loadQuestState();

    if (state && state.date === today) {
        // Already picked today — stay stable across reloads/re-visits.
        const cached = QUEST_POOL.find((q) => q.lessonId === state.lessonId);
        if (cached) return cached;
    }

    const pool = scopedPool();
    let index = hashString(today) % pool.length;

    // Never repeat yesterday's pick when there's an actual choice to make.
    if (state && pool.length > 1 && pool[index].lessonId === state.lessonId) {
        index = (index + 1) % pool.length;
    }

    const quest = pool[index];
    saveQuestState({ date: today, lessonId: quest.lessonId });
    return quest;
}

function renderTodaysQuest() {
    const questWindow = document.getElementById("questWindow");
    if (!questWindow) return;
    const content = questWindow.querySelector(".window-content");
    if (!content) return;

    const quest = pickTodaysQuest();
    const titleEl = content.querySelector("h2");
    const descEl = content.querySelector("p");
    const continueBtn = content.querySelector(".retro-btn");

    if (titleEl) titleEl.textContent = quest.title;
    if (descEl) descEl.textContent = quest.desc;
    if (continueBtn) {
        continueBtn.addEventListener("click", () => {
            window.location.href = "pages/missions/study-room.html?lesson=" + quest.lessonId;
        });
    }
}

document.addEventListener("DOMContentLoaded", renderTodaysQuest);
