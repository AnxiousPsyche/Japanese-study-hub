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
        { id: "n4-shelf-01", title: "Verb Stacks I — Potential, Volitional, Ba-form" },
        { id: "n4-shelf-02", title: "Verb Stacks II — Passive, Causative, Transitive/Intransitive" },
        { id: "n4-shelf-03", title: "Particle Reference Desk — de, ni, kara, mo" },
        { id: "n4-shelf-04", title: "Special Collections — zutsu, hodo-nai, dewa" },
        { id: "n4-shelf-05", title: "Everyday Speech Shelf — demo, de, mo" },
        { id: "n4-shelf-06", title: "Timing & Sequence Shelf — toka, tari, shi, tokoro, aida, toki" },
        { id: "n4-shelf-07", title: "Change & Decision Shelf — cause, mama, experience, deciding, becoming" },
        { id: "n4-shelf-08", title: "Obligation & Permission Shelf — nakereba, temoii, teoku, teshimau" },
        { id: "n4-shelf-09", title: "Giving & Purpose Shelf — ageru/kureru/morau, tame, youni" },
        { id: "n4-shelf-10", title: "Effort Shelf" },
        { id: "n4-shelf-11", title: "Advice & Commands Shelf — manner, imperative, prohibitive" },
        { id: "n4-shelf-12", title: "Question Shelf — kadouka, nominalizing, ability, senses" },
        { id: "n4-shelf-13", title: "Requests Shelf — concession, requests, suggesting, quoting" },
        { id: "n4-shelf-14", title: "Intentions & Plans Shelf — tsumori, to omou, tara" },
        { id: "n4-shelf-15", title: "If & When Almanac — ba, nara, to conditionals" },
        { id: "n4-shelf-16", title: "Degree & Tone Shelf — appearance, sugiru, ndesu, tone particles" },
        { id: "n4-reading-01", title: "Reading Room I — A Day Off" },
        { id: "n4-reading-02", title: "Reading Room II — The New Student" },
        { id: "n4-reading-03", title: "Reading Room III — A Letter Home" },
        { id: "n4-reading-04", title: "Reading Room IV — Lost in Kyoto" }
    ];

    const FOLDERS = [
        { title: "Foundations", ids: ["n4-shelf-01", "n4-shelf-02", "n4-shelf-03", "n4-shelf-04"] },
        { title: "Everyday Grammar", ids: ["n4-shelf-05", "n4-shelf-06", "n4-shelf-07", "n4-shelf-08"] },
        { title: "Nuance & Giving", ids: ["n4-shelf-09", "n4-shelf-10", "n4-shelf-11", "n4-shelf-12"] },
        { title: "Requests & Conditionals", ids: ["n4-shelf-13", "n4-shelf-14", "n4-shelf-15", "n4-shelf-16"] },
        { title: "Reading Room", ids: ["n4-reading-01", "n4-reading-02", "n4-reading-03", "n4-reading-04"] }
    ];

    function lessonById(id) {
        return LESSONS.find((l) => l.id === id);
    }

    function isDone(id) {
        return !!(window.StudyProgress && StudyProgress.isLessonDone(id));
    }

    function shortLabel(id) {
        const m = id.match(/^n4-shelf-(\d+)$/);
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
