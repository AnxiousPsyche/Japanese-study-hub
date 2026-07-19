# Shelf-06 Lesson Content: "Questions (か)" — Design Spec

## Context

`LESSON_DATA` (`assets/js/n5-phaser-game.js:245`) already reserves `shelf-06`
with the title "Questions (か)", and `SHELF_PREREQ` already gates it behind
`shelf-05` and gates `review-2` behind it. What's missing is the actual
`LESSON_CONTENT['shelf-06']` entry — shelves 1 through 5 are populated,
shelf-06 currently has none and falls back to the old instant-complete
behavior.

Shelf-05 (Demonstratives) is the template every grammar shelf since has
followed: a ~10-page arc (grammar-intro → diagram → samples ×2-3 →
conversation → try-it → summary table → quiz-fill). Shelf-06 follows the
same shape.

**Scope guard:** shelf-05 already taught どこ/どの/どちら/どれ (where/which),
and shelf-04 already used なん (what). Shelf-06 must not re-teach those — it
covers か itself plus the question words not yet introduced: だれ, いつ,
どうして/なぜ, いくつ, いくら. It also introduces the yes/no answer words
はい/いいえ/そうです/ちがいます, since answering a か-question is the natural
other half of asking one and there's no other shelf slot for them.

**Grammar-level guard:** no shelf past shelf-05 has taught い-adjectives or
verb conjugation yet (those are shelf-10/11/13+). Every sample sentence in
this shelf stays on the established `Xは...です(か)` pattern already taught
by shelf-03 — no adjectives, no verbs, no が-marked subjects (だれ
technically pairs with が as a grammatical subject-marker, but that's
deferred to shelf-16 "Particle Mastery" rather than introduced early here).

## Page-by-page content

1. **grammar-intro** — か as the universal question-maker. `bigIdea`: one
   particle turns any statement into a question, word order never changes.
   `recapChips`: です (shelf-03), なん (shelf-04), どこ・どの・どちら
   (shelf-05). `pattern`: `[statement] + か`. `explain` covers both forms —
   bare yes/no (これはほんですか) and content-word questions (せんせいは
   どこですか, reusing shelf-05's already-known どこ rather than
   forward-referencing this shelf's own new vocab) — as the same mechanic.
   `takeaway`: add か to the end of any
   statement — that's a question, no question mark needed.

2. **grammar-intro (diagramSvg)** — before/after visual: a statement's word
   tiles, then the same tiles with か appended at the end, highlighted.
   Reuses これ/は/ほん/です (already-known tiles) rather than inventing new
   vocab for the diagram. Static SVG (no per-player color resolution needed
   — this isn't a distance/sensei-color concept like shelf-05's diagram).

3. **grammar-intro (samples)** — yes/no questions and their answers:
   - これはほんですか。→ はい、そうです。
   - それはペンですか。→ いいえ、ちがいます。ほんです。
   Introduces はい/いいえ/そうです/ちがいます here, inline with the
   questions they answer.

4. **grammar-intro** — the 5 new content question words as a set: だれ
   (who), いつ (when), どうして (why — neutral/spoken), なぜ (why —
   formal/written; note なんで exists but is too casual for this level),
   いくつ (how many, small countables), いくら (how much, price).

5. **grammar-intro (samples)** — だれ・いつ:
   - せんせいはだれですか。("Who is the teacher?")
   - たんじょうびはいつですか。("When is your birthday?") — たんじょうび
     is a one-off context noun (same precedent as shelf-05's えき/でぐち/
     おてあらい), glossed inline via the tile's `gloss`, not added to the
     shelf's vocab table.

6. **grammar-intro (samples)** — どうして・なぜ・いくつ・いくら:
   - どうしてですか。 / なぜですか。 — standalone phrases (deliberately no
     adjective attached), samples side by side to show the formality
     contrast directly.
   - りんごはいくつですか。("How many apples?") — りんご is a one-off
     context noun, same treatment as たんじょうび above.
   - これはいくらですか。("How much is this?") — reuses known これ.

7. **conversation** — player: すみません、これはなんですか？ → sensei:
   それはほんです。(a plain statement, deliberately no か, reinforcing the
   question/statement contrast) → player: そうですか！ありがとうございます。
   The `explain` text on an earlier page (or a caption here) calls out
   **そうですか** specifically: literally そう+です+か, but functions as
   "oh, I see" / "is that so" — a common reaction phrase, not a literal
   yes/no question. Only reuses vocab already known or introduced earlier on
   this same shelf.

8. **try-it** — typed fill-in gate testing the shelf's core grammar point
   (not just vocab recall): turn これはほんです into a question by adding
   the one particle that goes at the end. `before: 'これはほんです'`,
   `after: ''`, expected answer `か`.

9. **summary** — new-words table, 11 rows: か, だれ, いつ, どうして, なぜ,
   いくつ, いくら, はい, いいえ, そうです, ちがいます.

10. **quiz-fill** — 5 non-blocking fill-in-the-blank checks, sampling (not
    exhaustively covering) the new set: か (add-the-particle style item),
    だれ, いつ, いくつ, いくら. Matches shelf-05's quiz size (5 items
    against a larger vocab set, not 1:1 coverage).

## Non-goals

- Not touching `SHELF_PREREQ`, `LESSON_DATA`, or any layout/shelf-position
  code — this is a pure `LESSON_CONTENT['shelf-06']` data addition following
  the existing rendering pipeline.
- Not teaching が, adjectives, or verb conjugation — those stay out of scope
  per the grammar-level guard above, even where real Japanese usage (e.g.
  だれが) would normally call for them.
- Not adding new `renderContent()` page types — this shelf only uses page
  types already implemented (`grammar-intro`, `conversation`, `try-it`,
  `summary`, `quiz-fill`).
- Not resolving `diagramSvg` as a per-player-color function (like shelf-05's
  `buildDemonstrativesDiagram`) — the か diagram has no color-dependent
  content, so a static SVG string is sufficient.

## Verification

- `node --check assets/js/n5-phaser-game.js` for syntax.
- Manual walkthrough in-browser on a fresh preview port (per this repo's
  known stale-JS-caching gotcha): open shelf-06 from the library map, click
  through all 10 pages, confirm the try-it gate blocks advance() until か is
  typed, confirm the quiz-fill accepts both kana and romaji answers, confirm
  shelf-06 still correctly unlocks review-2 alongside shelf-07/08.
