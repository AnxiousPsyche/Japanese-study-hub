/* N5 Lessons Dashboard — renders the 16 shelf lesson cards + the 10-question
   final quiz card, and marks completed lessons from the shared progress store. */
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

    function render() {
        const grid = document.getElementById("lessonGrid");
        if (!grid) return;

        LESSONS.forEach((les) => {
            const done = window.StudyProgress && StudyProgress.isLessonDone(les.id);
            const card = document.createElement("a");
            card.className = "lesson-card" + (done ? " is-complete" : "");
            card.href = "study-room.html?lesson=" + les.id;
            card.innerHTML =
                "<span class='lesson-card__num'>" + les.id.replace("s", "") + "</span>"
                + "<span class='lesson-card__title'>" + les.title + "</span>"
                + "<span class='lesson-card__status'>"
                + (done ? "&#10003; Complete &mdash; +50 XP earned" : "Lesson + practice &mdash; rewards 50 XP")
                + "</span>";
            grid.appendChild(card);
        });

        const quizDone = window.StudyProgress && StudyProgress.hasPassedQuiz("n5");
        const best = window.StudyProgress ? StudyProgress.quizBest("n5") : null;
        const quizCard = document.createElement("a");
        quizCard.className = "lesson-card lesson-card--quiz" + (quizDone ? " is-complete" : "");
        quizCard.href = "n5-quiz.html";
        let status;
        if (!quizDone) {
            status = "10 questions &mdash; pass with 70% for 150 XP";
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
