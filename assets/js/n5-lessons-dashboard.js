/* N5 Lessons Dashboard — renders the 47 shelf lessons (grown from an
   original 16 via repeated splits/insertions -- see CLAUDE.md for the
   history; the LESSONS array below is current ground truth, not any
   older doc's shelf count) + 3 checkpoint quizzes + the N5 Kanji lesson
   as a collapsible file-drawer of folders,
   each folder's contents shown as a plain directory-listing table
   (id / name / status), instead of one flat card grid. Combines two of
   the "10 lesson display concepts" mockups the user picked ("File
   Drawer" + "Directory Listing") — folder boundaries aren't arbitrary,
   they're exactly where the checkpoint quizzes land, so the grouping
   reflects the curriculum's real shape. Shelves 07, 08, 09, and 10 each
   fully split into lettered sub-lessons (07a-e, 08a-d, 09a-b, 10a-c) with
   no bare "s07"/"s08"/"s09"/"s10" lesson of their own — per explicit
   feedback, each now gets its own top-level folder ("Numbers & Counters",
   "Places & Directions", "Nouns & Pronouns", "Adjectives & Adverbs")
   instead of being buried as a nested sub-group inside a mixed folder.
   Shelf 11 split the same way (11a-c) but stayed nested inside "Verbs &
   Conjugations" alongside s12/s13 — see the FOLDERS comment below for
   why. cq2 (which reviews s04 through s08d) now attaches to the
   end of "Places & Directions" — the last folder in that reviewed span
   — rather than to "Identity & Questions", since it isn't scoped to
   just the shelves that folder holds anymore. The 50-question N5 Final
   Quiz stays a standalone finale bar below every folder rather than
   living inside one, since it isn't scoped to any single folder.

   Shelf 04 split (2026-09-04) into "s04" (greeting+name, required core)
   and "s04b" (age & hobby, the optional Going-Further pieces) -- only one
   lettered sibling, so it doesn't trigger groupFolderIds()'s 2+ nesting
   threshold and just renders as a plain sibling row right after s04,
   same as any single-lettered split would.

   Shelf 02c split further (2026-09-04, per explicit request) into "s02c"
   (Reactions & Hedging Words, kept) and "s02d" (Filler Words, pulled out
   of what used to be one combined "Filler Words & Reactions" lesson) --
   "Greetings & Intros" already had 02b/02c as a lettered run under s02's
   own header, so 02d just extends that same group to three children.

   Note: unlike the mockup's illustrative "locked" rows, every lesson
   here is ALWAYS actually clickable (Study Room has no lesson-gating
   mechanic) — so real status only ever shows "done" or "not started",
   not a fake locked state that would misrepresent what's actually
   accessible. */
(function () {
    "use strict";

    const LESSONS = [
        { id: "s01", title: "Basic Greetings" },
        { id: "s02", title: "Greetings & Everyday Phrases" },
        { id: "s02b", title: "At Home & At the Table" },
        { id: "s02c", title: "Reactions & Hedging Words" },
        { id: "s02d", title: "Filler Words" },
        { id: "s03", title: "A は B です" },
        { id: "s03b", title: "Basic Verbs & Word Order" },
        { id: "s04", title: "Self Introduction" },
        { id: "s04b", title: "Self Introduction — Age & Hobby" },
        { id: "s05", title: "Demonstratives" },
        { id: "s06", title: "Questions (か)" },
        { id: "s06d", title: "More Question Words" },
        { id: "s06b", title: "Existence Verbs" },
        { id: "s06c", title: "Everyday Action Verbs" },
        { id: "s07a", title: "Basic Numbers" },
        { id: "s07b", title: "つ & 人 Counters" },
        { id: "s07c", title: "Telling Time" },
        { id: "s07d", title: "Counters for Animals" },
        { id: "s07e", title: "Counters for Things" },
        { id: "s07g", title: "Days, Dates in the Calendar" },
        { id: "s08a", title: "There Is/Are" },
        { id: "s08b", title: "Direction Words" },
        { id: "s08c", title: "Movement & The Compass" },
        { id: "s08d", title: "Places — Common Locations" },
        { id: "s09a", title: "Nouns" },
        { id: "s09b", title: "Pronouns" },
        { id: "s10a", title: "い-Adjectives" },
        { id: "s10b", title: "な-Adjectives" },
        { id: "s10c", title: "Adverbs" },
        { id: "s10e", title: "Frequency Adverbs" },
        { id: "s10f", title: "Hardly Ever & Never" },
        { id: "s11a", title: "Ichidan Verbs" },
        { id: "s11b", title: "Godan Verbs" },
        { id: "s11c", title: "Kuru & Suru (Irregular Verbs)" },
        { id: "s12", title: "Invitations" },
        { id: "s13", title: "Conjugations (て-form)" },
        { id: "s14", title: "Past & Negative" },
        { id: "s15", title: "Sentence Construction" },
        { id: "s16a", title: "Subject Particles" },
        { id: "s16b", title: "Time Particles" },
        { id: "s16c", title: "Place Particles" },
        { id: "s16d", title: "Object Particles" },
        { id: "s16e", title: "Other Particles & Full Reference" },
        { id: "s17", title: "Wants & Preferences" },
        { id: "s18", title: "Ongoing Actions & Restrictions" },
        { id: "s19", title: "Comparing & Changing" },
        { id: "s20", title: "Explaining Yourself" }
    ];

    const KANJI_LESSON = { id: "k01", title: "N5 Kanji — full card gallery" };

    const CHECKPOINT_QUIZZES = {
        cq1: { id: "cq1", title: "Checkpoint Quiz 1" },
        cq2: { id: "cq2", title: "Checkpoint Quiz 2" },
        cq3: { id: "cq3", title: "Checkpoint Quiz 3" }
    };

    /* Folder boundaries mirror cq1/cq2/cq3's actual coverage in
       assets/js/study-room.js (quizGroup lessons) — keep these two in
       sync if the checkpoint quiz coverage ever changes. Numbers &
       Counters / Places & Directions / Nouns & Pronouns / Adjectives &
       Adverbs are all marked `flat: true`: each one IS a fully-split
       shelf group (07a-e / 08a-d / 09a-b / 10a-c, no bare lesson), so the
       folder's own title already reads as the group label -- no need for
       makeFolder() to also render a synthetic level-2 group header inside
       it the way a shelf-group nested in a mixed folder (e.g. 02b/02c
       inside "Greetings & Intros", or 11a-c inside "Verbs & Conjugations"
       below) still does.

       Adjectives split into i-adjectives / na-adjectives / adverbs
       (s10a/s10b/s10c) and Nouns & Pronouns split into nouns / pronouns
       (s09a/s09b) per explicit feedback -- same shape as the 07/08
       lettered splits. Verbs (s11) split the same way into ichidan /
       godan / kuru & suru (s11a/s11b/s11c), but stayed nested inside
       "Verbs & Conjugations" alongside s12/s13 rather than becoming its
       own top-level folder, since groupFolderIds() below already renders
       a same-number lettered group as its own indented sub-section
       automatically -- promoting it to a whole folder would just
       duplicate that grouping one level up. cq3 still attaches to
       "Verbs & Conjugations", since that's the piece that ends where
       cq3's reviewed span (s09-s13) ends. */
    const FOLDERS = [
        { title: "Greetings & Intros", ids: ["s01", "s02", "s02b", "s02c", "s02d", "s03", "s03b"], quiz: "cq1" },
        /* s06d (2026-09-04) splits s06's old "Six more question words"
           section into its own lesson (a table + paired-comparison boxes
           for the two easily-conflated pairs, どうして／なぜ and いくつ／いくら,
           instead of one dense paragraph). It's a genuine split of s06's
           own content, so it sits right after s06 here -- unlike s06b/s06c
           below, which are an unrelated "Verb Basics" module that only
           shares the "06" number for id-chaining reasons. Only one
           lettered sibling directly after s06, so same non-nesting case
           as s04b. */
        { title: "Identity & Questions", ids: ["s04", "s04b", "s05", "s06", "s06d"], quiz: null },
        /* New module (2026-09-04, curriculum-review request): several
           downstream lessons (There Is/Are, Movement & The Compass,
           Telling Time) already quietly assumed verb knowledge before any
           verb had been formally taught. This front-loads just enough to
           unblock those, without touching real conjugation mechanics
           (that stays in Verbs & Conjugations, later, untouched). Only
           2 lessons, so `flat: true` the same way the other fully-split,
           no-bare-lesson modules are. */
        { title: "Verb Basics", ids: ["s06b", "s06c"], quiz: null, flat: true },
        { title: "Numbers & Counters", ids: ["s07a", "s07b", "s07c", "s07d", "s07e", "s07g"], quiz: null, flat: true },
        { title: "Places & Directions", ids: ["s08a", "s08b", "s08c", "s08d"], quiz: "cq2", flat: true },
        { title: "Nouns & Pronouns", ids: ["s09a", "s09b"], quiz: null, flat: true },
        /* s10e (2026-09-04) is a genuine new adverb page (たいてい／いつも／
           ほとんど frequency comparison) inserted right after s10c. s10f
           (2026-09-05) is a genuine split OUT of s10e -- everything that
           needs a negative verb (ほとんど／あまり／全然) moved to its own page,
           slotted right after s10e. `s10d` (Adjective Past & Negative)
           used to sit last in this folder but was removed outright
           (2026-09-05) as redundant with the present/negative/past/past-
           negative conjugation tables s10a/s10b each already carry --
           its one unique bit, いい's irregular past よかった, was folded
           into s10a instead of being lost. */
        { title: "Adjectives & Adverbs", ids: ["s10a", "s10b", "s10c", "s10e", "s10f"], quiz: null, flat: true },
        { title: "Verbs & Conjugations", ids: ["s11a", "s11b", "s11c", "s13", "s14", "s12"], quiz: "cq3" },
        { title: "Actions & Structure", ids: ["s15", "s16a", "s16b", "s16c", "s16d", "s16e"], quiz: null },
        { title: "Everyday Expression", ids: ["s17", "s18", "s19", "s20"], quiz: null }
    ];

    // Human labels for a shelf-number group that has no lesson of its own,
    // nested inside a mixed folder alongside other lessons (e.g. a future
    // shelf split that doesn't warrant a whole standalone folder the way
    // 07/08 now get). Not used by 07/08/09/10 anymore -- see the `flat`
    // folders above. 11 IS still used: s11a-c has no bare "s11" lesson,
    // and "Verbs & Conjugations" stayed a mixed folder (s11a-c + s12/s13)
    // rather than going flat, so groupFolderIds() renders this label as
    // the synthetic header above the three lettered verb lessons.
    const GROUP_LABELS = { "11": "Verbs", "16": "Particles" };

    function lessonById(id) {
        return LESSONS.find((l) => l.id === id);
    }

    function isDone(id) {
        return !!(window.StudyProgress && StudyProgress.isLessonDone(id));
    }

    // Explicit indent level instead of the old regex auto-detect: 0 = plain
    // top-level row, 1 = a shelf-group's own header row (still clickable
    // when it's a real lesson like s02), 2 = a lettered lesson nested
    // under a group header (07a under the "07" header, 02b under s02...).
    function makeRow(id, title, numLabel, isCheckpoint, level) {
        const done = isDone(id);
        const lvl = level || 0;
        const row = document.createElement("a");
        row.className = "n5dir-row"
            + (isCheckpoint ? " n5dir-row--quiz" : "")
            + (done ? " is-done" : "")
            + (lvl === 1 ? " n5dir-row--group-head" : "")
            + (lvl === 2 ? " n5dir-row--sub" : "");
        row.href = "study-room.html?lesson=" + id;
        row.innerHTML =
            "<span class='n5dir-row__id'>" + numLabel + "</span>"
            + "<span class='n5dir-row__name'>" + title + "</span>"
            + "<span class='n5dir-row__status'>"
            + (done ? "&#10003; done" : (isCheckpoint ? "10-question review" : "not started"))
            + "</span>";
        return row;
    }

    // A synthetic (non-clickable) level-2 header for a shelf-number group
    // that has no lesson of its own to stand in as the header row (07/08).
    function makeGroupHeader(numPrefix) {
        const header = document.createElement("div");
        header.className = "n5dir-row n5dir-row--group-head n5dir-row--group-head-synthetic";
        header.innerHTML =
            "<span class='n5dir-row__id'>" + numPrefix + "</span>"
            + "<span class='n5dir-row__name'>" + (GROUP_LABELS[numPrefix] || "") + "</span>"
            + "<span class='n5dir-row__status'></span>";
        return header;
    }

    // Groups a folder's flat id list into top-level singles and shelf-number
    // groups (any run of 2+ lettered ids sharing a numeric prefix -- 07a-e,
    // 08a-d, 02b/02c) so a folder can render as folder > shelf-group >
    // lettered-lesson, three real indent levels, instead of one flat list
    // with just an arrow prefix on the lettered rows.
    function groupFolderIds(ids) {
        const groups = [];
        const seen = new Set();
        ids.forEach((id) => {
            if (seen.has(id)) return;
            const m = id.match(/^s(\d+)([a-z]?)$/);
            const numPrefix = m ? m[1] : null;
            const letteredSiblings = numPrefix
                ? ids.filter((otherId) => {
                    const om = otherId.match(/^s(\d+)([a-z]?)$/);
                    return om && om[1] === numPrefix && om[2];
                })
                : [];
            if (letteredSiblings.length >= 2) {
                const bareId = "s" + numPrefix;
                const hasBare = ids.indexOf(bareId) !== -1;
                letteredSiblings.forEach((s) => seen.add(s));
                if (hasBare) seen.add(bareId);
                groups.push({ type: "group", numPrefix: numPrefix, headerId: hasBare ? bareId : null, children: letteredSiblings });
            } else {
                seen.add(id);
                groups.push({ type: "single", id: id });
            }
        });
        return groups;
    }

    function makeFolder(folder) {
        const wrap = document.createElement("div");
        wrap.className = "n5dir-folder";

        const doneCount = folder.ids.filter(isDone).length;
        const total = folder.ids.length;

        const head = document.createElement("button");
        head.type = "button";
        head.className = "n5dir-folder__head";
        head.innerHTML =
            "<span class='n5dir-folder__chevron'>&#9654;</span>"
            + "<span class='n5dir-folder__icon'>&#128193;</span>"
            + "<span class='n5dir-folder__name'>" + folder.title + "</span>"
            + "<span class='n5dir-folder__meta'>" + doneCount + "/" + total + " done" + (folder.quiz ? " &middot; +quiz" : "") + "</span>";
        head.addEventListener("click", function () {
            wrap.classList.toggle("is-open");
        });
        wrap.appendChild(head);

        const listing = document.createElement("div");
        listing.className = "n5dir-listing";
        if (folder.flat) {
            // The folder's own title IS the shelf-group label (see the
            // FOLDERS comment above) -- no synthetic group header needed,
            // just plain top-level rows for every lettered lesson.
            folder.ids.forEach((id) => {
                const les = lessonById(id);
                listing.appendChild(makeRow(id, les.title, id.replace("s", ""), false, 0));
            });
        } else {
            groupFolderIds(folder.ids).forEach((item) => {
                if (item.type === "single") {
                    const les = lessonById(item.id);
                    listing.appendChild(makeRow(item.id, les.title, item.id.replace("s", ""), false, 0));
                    return;
                }
                if (item.headerId) {
                    const les = lessonById(item.headerId);
                    listing.appendChild(makeRow(item.headerId, les.title, item.numPrefix, false, 1));
                } else {
                    listing.appendChild(makeGroupHeader(item.numPrefix));
                }
                item.children.forEach((childId) => {
                    const les = lessonById(childId);
                    listing.appendChild(makeRow(childId, les.title, childId.replace("s", ""), false, 2));
                });
            });
        }
        if (folder.quiz) {
            const q = CHECKPOINT_QUIZZES[folder.quiz];
            listing.appendChild(makeRow(q.id, q.title, "\u{1F4CB}", true, 0));
        }
        wrap.appendChild(listing);

        return wrap;
    }

    function makeKanjiFolder() {
        const wrap = document.createElement("div");
        wrap.className = "n5dir-folder";
        const done = isDone(KANJI_LESSON.id);

        const head = document.createElement("button");
        head.type = "button";
        head.className = "n5dir-folder__head";
        head.innerHTML =
            "<span class='n5dir-folder__chevron'>&#9654;</span>"
            + "<span class='n5dir-folder__icon'>&#128193;</span>"
            + "<span class='n5dir-folder__name'>N5 Kanji</span>"
            + "<span class='n5dir-folder__meta'>103 characters" + (done ? " &middot; done" : "") + "</span>";
        head.addEventListener("click", function () {
            wrap.classList.toggle("is-open");
        });
        wrap.appendChild(head);

        const listing = document.createElement("div");
        listing.className = "n5dir-listing";
        listing.appendChild(makeRow(KANJI_LESSON.id, KANJI_LESSON.title, "漢"));
        wrap.appendChild(listing);

        return wrap;
    }

    function render() {
        const grid = document.getElementById("lessonGrid");
        if (!grid) return;
        grid.classList.add("n5dir");

        const dir = document.createElement("div");
        dir.className = "n5dir-root";

        FOLDERS.forEach((folder, i) => {
            const el = makeFolder(folder);
            if (i === 0) el.classList.add("is-open"); // first folder starts open
            dir.appendChild(el);
        });
        dir.appendChild(makeKanjiFolder());

        grid.appendChild(dir);

        const quizDone = window.StudyProgress && StudyProgress.hasPassedQuiz("n5");
        const best = window.StudyProgress ? StudyProgress.quizBest("n5") : null;
        const totalLessons = LESSONS.length;
        const totalDone = LESSONS.filter((l) => isDone(l.id)).length;

        const finale = document.createElement("a");
        finale.className = "n5dir-finale" + (quizDone ? " is-done" : "");
        finale.href = "n5-quiz.html";
        let status;
        if (quizDone) {
            status = "&#10003; Passed" + (best !== null ? " &mdash; best " + best + "%" : "");
        } else {
            status = "50 questions &mdash; pass with 70% for 150 XP";
        }
        finale.innerHTML =
            "<span class='n5dir-finale__icon'>&#127894;</span>"
            + "<span class='n5dir-finale__body'>"
            + "<span class='n5dir-finale__title'>N5 Final Quiz</span>"
            + "<span class='n5dir-finale__sub'>" + status + "</span>"
            + "</span>"
            + "<span class='n5dir-finale__count'>" + totalDone + " / " + totalLessons + " lessons</span>";
        grid.appendChild(finale);
    }

    window.N5LessonsDashboard = { init: render };
})();
