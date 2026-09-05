/* N4 Lessons Dashboard — renders the 16 grammar shelves + 4 Reading Room
   passages as a collapsible file-drawer of folders, same "file drawer +
   directory listing" concept as assets/js/n5-lessons-dashboard.js, but
   simplified: N4 has no lettered sub-lessons and no checkpoint quizzes
   yet, so there's no need for groupFolderIds()/makeGroupHeader() or a
   kanji folder / final-quiz finale bar. Folder boundaries mirror the
   Adventure Room's own BOOK_PILE_DATA review-pile groupings in
   assets/js/n4-phaser-game.js (shelf01-04 / 05-08 / 09-12 / 13-16), plus
   a fifth folder for the Reading Room passages. */
(function () {
    "use strict";

    const LESSONS = [
        { id: "n4-shelf-01", title: "Potential Form" },
        { id: "n4-shelf-01b", title: "Volitional Form — ikou, tagaru" },
        { id: "n4-shelf-02", title: "Passive & Causative" },
        { id: "n4-shelf-02b", title: "Transitivity & Resultant State" },
        { id: "n4-shelf-03", title: "Particle Reference Desk — de, ni, kara, mo" },
        { id: "n4-shelf-04", title: "Special Collections — zutsu, hodo-nai, dewa" },
        { id: "n4-shelf-05", title: "Everyday Speech — demo, de, mo" },
        { id: "n4-shelf-06", title: "Casual Listing — toka, tari, shi" },
        { id: "n4-shelf-06b", title: "Timing Words — tokoro, aida, toki, nagara" },
        { id: "n4-shelf-17", title: "Reason & Cause — genin, node, tame" },
        { id: "n4-shelf-07", title: "State & Experience — mama, kotogaaru" },
        { id: "n4-shelf-18", title: "Becoming & Deciding — ni suru, ni naru, you ni suru" },
        { id: "n4-shelf-08", title: "Obligation & Permission — nakereba, temoii" },
        { id: "n4-shelf-08b", title: "Preparing & Completing — teoku, teshimau" },
        { id: "n4-shelf-09", title: "Giving & Receiving — ageru, kureru, morau" },
        { id: "n4-shelf-09b", title: "Purpose — tame, youni" },
        { id: "n4-shelf-10", title: "Demonstratives — konna, sonna, anna, donna" },
        { id: "n4-shelf-11", title: "Manner Adverbs — kou, sou, aa, dou" },
        { id: "n4-shelf-11b", title: "Advice — hougaii, beki" },
        { id: "n4-shelf-11c", title: "Commands — imperative, prohibitive" },
        { id: "n4-shelf-12", title: "Embedded Questions & Nominalizing — kadouka, no" },
        { id: "n4-shelf-12b", title: "Ability & Senses — kotogadekiru, kikoeru/mieru" },
        { id: "n4-shelf-13", title: "Concession & Requests — demo/temo, kudasai, hoshii" },
        { id: "n4-shelf-13b", title: "Suggesting & Quoting — tara dou, to iu, to omou" },
        { id: "n4-shelf-14", title: "Intentions — tsumori, you to omou" },
        { id: "n4-shelf-19", title: "Conditionals — ba, nara, to, tara" },
        { id: "n4-shelf-16", title: "Certainty & Appearance — sou, rashii, you da, deshou, hazu, kamoshirenai" },
        { id: "n4-shelf-16b", title: "Ease & Excess Endings — yasui, nikui, sugiru" },
        { id: "n4-shelf-16c", title: "Explanatory Tone — sa, ndesu, tone particles" },
        { id: "n4-reading-01", title: "Reading Room I — A Day Off" },
        { id: "n4-reading-02", title: "Reading Room II — The New Student" },
        { id: "n4-reading-03", title: "Reading Room III — A Letter Home" },
        { id: "n4-reading-04", title: "Reading Room IV — Lost in Kyoto" }
    ];

    /* Regrouped 2026-09-05 alongside the shelf split/consolidation pass in
       study-room-n4.js (16 shelves -> 29) — folder boundaries now follow
       the new shelf families instead of a flat "4 old ids per folder"
       count, since the old grouping no longer lines up with anything
       once shelves split and content moved across old shelf lines. */
    const FOLDERS = [
        { title: "Verb Conjugations", ids: ["n4-shelf-01", "n4-shelf-01b", "n4-shelf-02", "n4-shelf-02b"] },
        { title: "Particles Reference", ids: ["n4-shelf-03", "n4-shelf-04", "n4-shelf-05"] },
        { title: "Listing & Timing", ids: ["n4-shelf-06", "n4-shelf-06b", "n4-shelf-17", "n4-shelf-07"] },
        { title: "Decisions & Obligations", ids: ["n4-shelf-18", "n4-shelf-08", "n4-shelf-08b"] },
        { title: "Giving, Purpose & Description", ids: ["n4-shelf-09", "n4-shelf-09b", "n4-shelf-10"] },
        { title: "Advice & Commands", ids: ["n4-shelf-11", "n4-shelf-11b", "n4-shelf-11c"] },
        { title: "Questions & Requests", ids: ["n4-shelf-12", "n4-shelf-12b", "n4-shelf-13", "n4-shelf-13b"] },
        { title: "Intentions, Conditionals & Certainty", ids: ["n4-shelf-14", "n4-shelf-19", "n4-shelf-16", "n4-shelf-16b", "n4-shelf-16c"] },
        { title: "Reading Room", ids: ["n4-reading-01", "n4-reading-02", "n4-reading-03", "n4-reading-04"] }
    ];

    function lessonById(id) {
        return LESSONS.find((l) => l.id === id);
    }

    function isDone(id) {
        return !!(window.StudyProgress && StudyProgress.isLessonDone(id));
    }

    function shortLabel(id) {
        const m = id.match(/^n4-shelf-(\d+[a-z]?)$/);
        if (m) return "sh" + m[1];
        const r = id.match(/^n4-reading-(\d+)$/);
        if (r) return "rd" + r[1];
        return id;
    }

    function makeRow(id, title) {
        const done = isDone(id);
        const row = document.createElement("a");
        row.className = "n4dir-row" + (done ? " is-done" : "");
        row.href = "study-room.html?lesson=" + id;
        row.innerHTML =
            "<span class='n4dir-row__id'>" + shortLabel(id) + "</span>"
            + "<span class='n4dir-row__name'>" + title + "</span>"
            + "<span class='n4dir-row__status'>" + (done ? "&#10003; done" : "not started") + "</span>";
        return row;
    }

    function makeFolder(folder, isOpenByDefault) {
        const wrap = document.createElement("div");
        wrap.className = "n4dir-folder" + (isOpenByDefault ? " is-open" : "");

        const doneCount = folder.ids.filter(isDone).length;
        const total = folder.ids.length;

        const head = document.createElement("button");
        head.type = "button";
        head.className = "n4dir-folder__head";
        head.innerHTML =
            "<span class='n4dir-folder__chevron'>&#9654;</span>"
            + "<span class='n4dir-folder__icon'>&#128193;</span>"
            + "<span class='n4dir-folder__name'>" + folder.title + "</span>"
            + "<span class='n4dir-folder__meta'>" + doneCount + "/" + total + " done</span>";
        head.addEventListener("click", function () {
            wrap.classList.toggle("is-open");
        });
        wrap.appendChild(head);

        const listing = document.createElement("div");
        listing.className = "n4dir-listing";
        folder.ids.forEach((id) => {
            const les = lessonById(id);
            listing.appendChild(makeRow(id, les.title));
        });
        wrap.appendChild(listing);

        return wrap;
    }

    function render() {
        const grid = document.getElementById("lessonGrid");
        if (!grid) return;
        grid.classList.add("n4dir");

        const root = document.createElement("div");
        root.className = "n4dir-root";
        FOLDERS.forEach((folder, i) => {
            root.appendChild(makeFolder(folder, i === 0));
        });
        grid.appendChild(root);
    }

    window.N4LessonsDashboard = { init: render };
})();
