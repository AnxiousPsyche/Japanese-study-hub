# N4 Quiz Gate Mechanic — Design Spec

## Context

This is sub-project #3 of the 5-way decomposition of `N5_Library_Map_Spec.md`'s
remaining gaps against the current Phaser build (#1 lesson roster expansion
and #2 cat color-select screen are both done and merged to `main`).

The staircase (top of the map) already exists as the `final-quiz` interactive
(added in Round 3, replacing the spec's original "door" concept per an
explicit user instruction — "remove the door, just make the stairs the final
exam/quiz and gate-lock to N4, which will be second floor"). It already gates
correctly on lesson completion: `BOOK_PILE_DATA`-style `requires:
['shelf-15','shelf-16','shelf-17']`, reusing the exact same generic
locked/available/completed logic every shelf and review pile uses. Clicking
it while lessons are incomplete already shows a "Not yet…" toast — that part
needs no changes.

What's missing is `N5_Library_Map_Spec.md` section 6's actual gate mechanic:
3 attempts, a 24-hour cooldown after the 3rd failure, and a locked-with-
countdown message. Per this session's scoping conversation: **mechanic only,
placeholder quiz content** (a "Pass (test)" / "Fail (test)" button pair
standing in for a real quiz, matching how every lesson panel already shows
"Lesson content coming soon." instead of real content) — and since no N4
page/scene exists anywhere in the site yet (confirmed: only `pages/N5/`
exists), passing does not navigate anywhere. It shows a **permanent passed
state** instead (user's explicit choice over "passed but re-takeable").

## Goals

- **No new "passed" flag.** Passing the quiz sets `progress['final-quiz'] =
  true` — the exact same completion flag every shelf/review pile already
  uses via the existing generic state logic in `openPanel()`/
  `refreshAllStates()`. The staircase's locked/available/completed visuals
  (dim alpha, star glow, checkmark stamp) keep working with zero changes to
  that system.
- **New state, scoped narrowly:** a `nekoBunko.n5.quizGate` localStorage key
  holding `{ attemptsUsed: number, lockedUntil: number|null }`. Independent
  of `nekoBunko.n5.progress` and `nekoBunko.n5.catColor`, same try/catch
  degrade-to-session-only pattern as `saveProgress()`/`saveCatColor()`.
- **Click behavior on the staircase, once lessons are complete** (the
  existing "lessons incomplete" toast path is unchanged):
  - Already passed (`progress['final-quiz']===true`) → panel opens with
    distinct copy: "You passed! N4 is coming soon." No attempts UI, no Pass/
    Fail buttons — just the existing single Close button.
  - Not passed, currently in cooldown → **no panel opens at all** — a toast:
    `"Locked - try again in {X}h {Y}m"`, computed once at click time from
    `lockedUntil - Date.now()` (not a live-ticking countdown — out of scope
    for this pass, re-computed fresh on the next click instead).
  - Not passed, not in cooldown → panel opens, body text shows attempts
    remaining via ``You have ${n} attempt${n === 1 ? '' : 's'} remaining.``
    (proper singular/plural, not a literal "attempt(s)" string), with two
    buttons: **Pass (test)** and **Fail (test)**, replacing the single
    Complete button this entry would otherwise get.
    - **Pass (test):** sets `progress['final-quiz']=true`, saves, calls
      `refreshAllStates()` (staircase becomes visually "completed" — same
      generic path every other completion already takes), closes the panel,
      and fires the sparkle burst (see below) at the staircase's position.
    - **Fail (test):** increments `attemptsUsed`, saves. If `attemptsUsed <
      3`: closes the panel, toast `"Try again ({N} left)"`. If
      `attemptsUsed >= 3`: sets `lockedUntil = Date.now() + 24*60*60*1000`,
      saves, closes the panel, toast `"Locked for 24 hours."`.
  - **Cooldown expiry is lazy**, not a background timer: the next time gate
    status is computed (i.e. the next click) after `lockedUntil` has passed,
    `attemptsUsed` resets to 0 and `lockedUntil` clears back to `null` before
    anything else is evaluated — matching the spec's "attempts reset to 3...
    no re-review required."
- **Sparkle burst on Pass:** a one-time celebratory flourish at the moment
  `progress['final-quiz']` becomes `true`, matching the existing lightweight
  emoji-plus-tween visual language already used for the glow/checkmark icons
  (no new particle-emitter system, no new image assets). Several `✨` text
  objects spawn at the staircase's center, tween outward in a small fan
  pattern with scale-up-then-fade over roughly 600-800ms, then
  `destroy()` themselves. Purely visual, no interaction, no persistent
  state — if the player reloads mid-animation or immediately after, nothing
  is lost or replayed; the permanent "passed" visual state (checkmark stamp)
  is what persists, not the sparkle itself.

## Non-goals (explicitly deferred)

- **No real quiz content.** "Pass (test)"/"Fail (test)" are the entire quiz
  for this pass — matches every other lesson/review panel's current
  placeholder-content state.
- **No N4 navigation.** No N4 page/scene exists yet; passing shows a
  permanent in-panel message only.
- **No live-ticking countdown.** The lockout message is computed fresh each
  time the player clicks while locked, not updated in real time while the
  panel/toast is visible.
- **No re-takeable-after-passing mode.** Once passed, always shows the
  passed message — the user explicitly chose this over a re-takeable option.
- **No changes to review-1/review-2 or any shelf.** The new attempts/
  cooldown/Pass-Fail logic is scoped to `entry.id === 'final-quiz'`
  specifically inside `openPanel()`; every other entry keeps its existing
  single-Complete-button flow untouched.

## Architecture

### New state helpers (mirroring the existing `loadProgress`/`saveProgress`
### and `getSavedCatColor`/`saveCatColor` pairs)

```js
const QUIZ_GATE_KEY = 'nekoBunko.n5.quizGate';
const QUIZ_MAX_ATTEMPTS = 3;
const QUIZ_LOCKOUT_MS = 24 * 60 * 60 * 1000;

function loadQuizGateState() {
  try {
    const raw = localStorage.getItem(QUIZ_GATE_KEY);
    if (!raw) return { attemptsUsed: 0, lockedUntil: null };
    const parsed = JSON.parse(raw);
    return {
      attemptsUsed: typeof parsed.attemptsUsed === 'number' ? parsed.attemptsUsed : 0,
      lockedUntil: typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : null,
    };
  } catch (e) {
    return { attemptsUsed: 0, lockedUntil: null };
  }
}

function saveQuizGateState(state) {
  try {
    localStorage.setItem(QUIZ_GATE_KEY, JSON.stringify(state));
  } catch (e) {
    // localStorage unavailable — degrade to session-only, same pattern
    // as saveProgress()/saveCatColor().
  }
}

// Applies lazy cooldown-expiry reset, then returns the status the UI needs.
function getQuizGateStatus() {
  const state = loadQuizGateState();
  if (state.lockedUntil !== null && Date.now() >= state.lockedUntil) {
    state.attemptsUsed = 0;
    state.lockedUntil = null;
    saveQuizGateState(state);
  }
  const locked = state.lockedUntil !== null && Date.now() < state.lockedUntil;
  return {
    state,
    locked,
    attemptsLeft: Math.max(0, QUIZ_MAX_ATTEMPTS - state.attemptsUsed),
    lockMessage: locked ? formatLockMessage(state.lockedUntil - Date.now()) : null,
  };
}

function formatLockMessage(msRemaining) {
  const totalMinutes = Math.max(1, Math.ceil(msRemaining / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `Locked - try again in ${hours}h ${minutes}m`;
}
```

### `openPanel()` — one new branch, everything else untouched

Immediately after the existing `if (state === 'locked') { showToast('Not
yet…'); return; }` check (which already covers "lessons incomplete" for
every entry including the staircase), add:

```js
if (entry.id === 'final-quiz' && state !== 'completed') {
  const gate = getQuizGateStatus();
  if (gate.locked) {
    showToast(gate.lockMessage);
    return;
  }
  this.openQuizGatePanel(entry, gate);
  return;
}
```

`openQuizGatePanel()` is a new method that fills in the panel body (singular/
plural attempts message, see above), shows the Pass/Fail button pair (hides the
existing single Complete button), and wires their `onclick` handlers as
described in Goals. The existing panel-building code below the new branch
(shared title-set, `panel.style.display='flex'`, `this.panelOpen=true`)
still runs for every other case, including the *already-passed* final-quiz
case (which falls through to the existing generic completed-message body —
overridden with the distinct "You passed!" copy via one more small
conditional on `entry.id === 'final-quiz'` in the existing body-text
ternary).

### `ensurePanel()` — one new hidden-by-default button

Add a third button, `#nekoPanelFail`, to the panel's static HTML (same
inline-style pattern as the existing two), `display:none` by default.
`openQuizGatePanel()` shows it (and relabels/repurposes Complete as "Pass
(test)") when building the attempts UI; every other `openPanel()` path
explicitly hides it again (defensive — since the DOM node is shared/reused
across all panel opens) before showing the panel, so it can never leak into
a shelf or review panel's button row.

### Sparkle burst

A new scene method, `spawnPassSparkle(x, y)`, called once from the Pass
button's handler right after `refreshAllStates()`. Creates 5-6 `this.add
.text(x, y, '✨', {...})` objects at the staircase's center, each tweened to
a randomized nearby offset with scale 1→1.4 and alpha 1→0, `duration:
700`, then `onComplete: () => sprite.destroy()`. No new assets, no new
Phaser systems (particles/emitters) — same tween-based approach the existing
glow-star pulse already uses elsewhere in this file.

## Error handling / edge cases

- **Corrupted/malformed `quizGate` localStorage value:** `loadQuizGateState`
  falls back to a fresh `{attemptsUsed:0, lockedUntil:null}` on any parse
  failure or unexpected shape — same degrade-gracefully posture as the rest
  of this codebase's localStorage reads.
- **`attemptsUsed` somehow >= 3 with no `lockedUntil` set** (e.g. hand-edited
  storage): `getQuizGateStatus` doesn't specifically self-heal this today,
  since it isn't a reachable state through normal UI flow (the Fail handler
  always sets `lockedUntil` in the same write that pushes `attemptsUsed` to
  3) — not defended against as a deliberate scope cut, matching this
  project's established pattern of not adding handling for unreachable
  states.
- **localStorage unavailable entirely:** attempts/cooldown become session-
  only for that tab (matches `saveProgress`'s existing degrade pattern) —
  the player could in principle refresh to "reset" their attempts in that
  degraded case; acceptable, not a new failure mode to special-case.
- **Panel reused across entries:** the new `#nekoPanelFail` button is
  explicitly hidden by every non-quiz-gate `openPanel()` path before
  display, preventing it from appearing on shelf/review panels.

## Verification

Manual (Playwright/`preview_eval`, matching this session's established
methodology):

1. Lessons incomplete, click staircase → existing "Not yet…" toast, no
   changes (regression check against the current, already-working
   behavior).
2. Lessons complete, first click → panel opens with "You have 3 attempts
   remaining.", Pass and Fail buttons visible, Complete/Close relabeled
   correctly.
3. Click Fail three times (reopening the panel each time) → after the 3rd,
   confirm `localStorage`'s `quizGate.lockedUntil` is set ~24h out, panel
   closes, toast shows.
4. Click the staircase again while locked → confirm **no panel opens**,
   toast shows a "Locked - try again in ...h ...m" message with plausible
   values.
5. Manually set `lockedUntil` to a past timestamp via `preview_eval`, click
   again → confirm attempts silently reset (`attemptsUsed===0`,
   `lockedUntil===null` after the click) and the attempts panel opens
   normally.
6. Click Pass → confirm `progress['final-quiz']===true`, staircase shows the
   checkmark stamp (existing generic completed-state visual, unchanged
   code path), sparkle text objects appear and self-destroy (count check via
   scene children before/after), panel closes.
7. Click the staircase again after passing → confirm panel opens showing
   "You passed! N4 is coming soon." with no attempts UI and no Pass/Fail
   buttons.
8. Regression: click a shelf and a review pile → confirm their panels are
   completely unaffected (single Complete/Close button pair, no Fail button
   visible, existing body-text logic unchanged).
