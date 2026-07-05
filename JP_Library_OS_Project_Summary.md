# JP Library OS --- Project Summary & Development Log

> Living project summary for JP Library OS.

## Project Vision

JP Library OS is a retro-inspired web application for learning Japanese
through an RPG-style operating system interface.

### Goals

-   Retro boot sequence
-   Login and player creation
-   Desktop OS interface
-   JRPG-style JLPT journey maps
-   Lessons, reviews, quizzes
-   Progress saving
-   JLPT N5 → N1 roadmap

## Completed

### Boot Screen

-   Animated loading sequence
-   Loading bars
-   Status messages
-   Start button
-   Background music trigger

### Login

-   Returning Explorer
-   New Explorer
-   Avatar upload
-   Local storage
-   Medieval journal theme
-   Glassmorphism UI

### Desktop

-   Icons
-   Taskbar
-   Player status
-   Sakura particles
-   Background music

### Journey

-   N5 fantasy map
-   Torii gate start
-   Goal castle
-   Continuous RPG path concept
-   Lesson popup foundation

## N5 Lesson Flow

1.  Basic Greetings
2.  Everyday Expressions
3.  Self Introduction
4.  A は B です
5.  Demonstratives
6.  Questions (か)
7.  Numbers & Counters
8.  Places and Directions
9.  Foundations Review
10. Nouns & Pronouns
11. Adjectives
12. Adverbs and Verbs
13. Conjugations
14. Sentence Builder Review
15. Sentence Construction
16. Particle Mastery
17. Existence (あります・います)

## World Regions

-   Mountains of Vocabulary
-   Rivers of Grammar
-   Bridge of Particles
-   Towers of Conjugations
-   Castle of Patterns

## Planned Systems

-   XP
-   Coins
-   Hearts
-   Inventory
-   Achievements
-   Player movement
-   Locked lessons
-   Treasure rewards
-   Camera follow
-   Quiz engine
-   Save engine

## Suggested Structure

``` text
assets/
  css/
    core/
    layout/
    pages/
    journey/
    lessons/

  js/
    core/
    journey/
    lessons/
    ui/

pages/
  N5/
  N4/
  N3/
  N2/
  N1/
```

## Git Commands

``` bash
git status
git add .
git commit -m "message"
git push
```

Restore previous commit state:

``` bash
git restore .
git clean -fd
```

## Notes

-   Scope page CSS to avoid conflicts.
-   Keep shared engines generic.
-   Store JLPT-specific lesson data separately.
-   Commit frequently before major refactors.
