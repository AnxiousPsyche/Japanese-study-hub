/* N5 Lessons Dashboard — renders the 18 shelf lesson cards, the
   segregated N5 Kanji lesson's own card, and the 50-question final quiz
   card, marking completed lessons from the shared progress store. */
(function () {
    "use strict";

    const LESSONS = [
        { id: "s01", title: "Basic Greetings" },
        { id: "s02", title: "Greetings & Everyday Phrases" },
        { id: "s02b", title: "At Home & At the Table" },
        { id: "s02c", title: "Filler Words & Reactions" },
        { id: "s03", title: "A \u306F B \u3067\u3059" },
        { id: "s04", title: "Self Introduction" },
        { id: "s05", title: "Demonstratives" },
        { id: "s06", title: "Questions (\u304B)" },
        { id: "s07", title: "Numbers & Counters" },
        { id: "s08", title: "Places & Directions" },
        { id: "s09", title: "Nouns & Pronouns" },
        { id: "s10", title: "Adjectives" },
        { id: "s11", title: "Verbs" },
        { id: "s12", title: "Invitations" },
        { id: "s13", title: "Conjugations (\u3066-form)" },
        { id: "s14", title: "Past & Negative" },
        { id: "s15", title: "Sentence Construction" },
        { id: "s16", title: "Particle Mastery" }
    ];

    /* Segregated from LESSONS above on purpose — a distinct "kanji"
       track, not shelf-numbered — see the matching k01 factory
       + kanjiGroup flag in assets/js/study-room.js. One consolidated
       lesson covering all 103 official N5 kanji as a searchable card
       gallery, not a quiz. */
    const KANJI_LESSONS = [
        { id: "k01", title: "N5 Kanji" }
    ];

    function makeCard(les, numLabel) {
        const done = window.StudyProgress && StudyProgress.isLessonDone(les.id);
        const card = document.createElement("a");
        card.className = "lesson-card" + (done ? " is-complete" : "");
        card.href = "study-room.html?lesson=" + les.id;
        card.innerHTML =
            "<span class='lesson-card__num'>" + numLabel + "</span>"
            + "<span class='lesson-card__title'>" + les.title + "</span>"
            + "<span class='lesson-card__status'>"
            + (done ? "&#10003; Complete &mdash; +50 XP earned" : "Lesson + practice &mdash; rewards 50 XP")
            + "</span>";
        return card;
    }

    function render() {
        const grid = document.getElementById("lessonGrid");
        if (!grid) return;

        LESSONS.forEach((les) => {
            grid.appendChild(makeCard(les, les.id.replace("s", "")));
        });

        const kanjiHeading = document.createElement("h2");
        kanjiHeading.className = "lesson-grid__section-title";
        kanjiHeading.textContent = "N5 Kanji";
        grid.appendChild(kanjiHeading);

        KANJI_LESSONS.forEach((les) => {
            grid.appendChild(makeCard(les, "漢")); // shared marker instead of a shelf number
        });

        const quizDone = window.StudyProgress && StudyProgress.hasPassedQuiz("n5");
        const best = window.StudyProgress ? StudyProgress.quizBest("n5") : null;
        const quizCard = document.createElement("a");
        quizCard.className = "lesson-card lesson-card--quiz" + (quizDone ? " is-complete" : "");
        quizCard.href = "n5-quiz.html";
        let status;
        if (!quizDone) {
            status = "50 questions &mdash; pass with 70% for 150 XP";
        } else {
            status = "&#10003; Passed";
            if (best !== null) status += " &mdash; best " + best + "%";
        }
        quizCard.innerHTML =
            "<span class='lesson-card__num'>&#127894;</span>"
            + "<span class='lesson-card__title'>N5 Final Quiz</span>"
            + "<span class='lesson-card__status'>" + status + "</span>";
        grid.appendChild(quizCard);
    }

    window.N5LessonsDashboard = { init: render };
})();
