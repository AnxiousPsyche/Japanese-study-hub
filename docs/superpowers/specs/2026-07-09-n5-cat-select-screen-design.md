# N5 Cat Color-Select Screen — Design Spec

## Context

This is sub-project #2 of the 5-way decomposition of
`N5_Library_Map_Spec.md`'s remaining gaps against the current Phaser build
(sub-project #1, the 15→17 lesson roster expansion, and the door-removal /
staircase-as-N4-gate / reception-nook / shelf-label pass, are both already
committed to `n5-phaser-real-layout`). The other three sub-projects (finish
the N4 quiz gate's attempt/cooldown mechanic, remaining decor, instructions
button) are untouched by this spec.

`N5_Library_Map_Spec.md` section 2 asks for a pre-map cat color-select
screen: "retro RPG list-select... exactly 3 entries... orange, black,
white... live preview... no timer, no penalty for switching later."

Asset check confirmed the three matching idle spritesheets already exist —
`assets/images/icons/pixels/OrangeCatIdle.png` (3600×300, 12 frames),
`blackCatIdle.png` (6000×300, 20 frames), `whitecatIdle.png` (5400×300, 18
frames) — all 300×300px/frame, same sit-and-tail-wag idle loop style.
`CalicoCatIdle.png` and `tuxedoIdle.png` also exist but are out of scope
("exactly 3 entries... no more, no fewer"). The current in-map player
(`fortunecat-Original.png`, a single static image, no animation) is
unrelated to these three and is being replaced.

No walk/run spritesheets exist for any color (confirmed by a full scan of
`assets/images/icons/pixels/`). The spec itself anticipated this
possibility ("if the map is click-to-navigate only, idle may be enough")
but this map is free-roam movement, not click-to-navigate. User decision:
play the idle loop while stationary, freeze on the current frame while
moving — no walk-cycle is attempted since no walk art exists.

## Goals

- A new Phaser Scene, `CatSelectScene`, shown before `LibraryScene` the
  first time a player has no saved color choice.
- Exactly 3 selectable entries (Orange/Black/White), vertical list, dark
  panel background, `Press Start 2P` pixel font in a warm amber color —
  visually consistent with the existing lesson/review panel's font choice
  (no new font dependency). Arrow keys or click to change the highlighted
  entry; Enter or a "Select" button confirms.
- The highlighted entry's cat plays its idle animation loop live in a
  preview area, using Phaser's native sprite+animation system (not
  CSS) — each color's sheet becomes a Phaser spritesheet + a looping
  `idle` animation.
- On confirm: save the chosen color to `localStorage` under
  `nekoBunko.n5.catColor`, then start `LibraryScene`.
- On subsequent boots (color already saved), skip `CatSelectScene`
  entirely and go straight to `LibraryScene`.
- A small persistent "Change" button added to the existing DOM `#gameHUD`
  bar (the same header that already holds Desktop/Home/Journey/Lessons)
  reopens `CatSelectScene` at any time, launched as a **paused overlay**
  on top of the running `LibraryScene` (`this.scene.launch` +
  `this.scene.pause('LibraryScene')`) rather than a full restart — so
  in-progress player position and lesson progress aren't disturbed.
  Confirming a new color in this overlay path updates the saved color,
  swaps the live player's animation key, and resumes `LibraryScene`
  (no scene restart, no repositioning).
- The map player (in `LibraryScene`) uses the saved color's spritesheet
  instead of `fortunecat-Original.png`. It plays the looping `idle`
  animation whenever the player's physics velocity is ~0, and freezes on
  whatever frame was showing the moment velocity becomes non-zero (per
  the user's explicit choice, avoiding a sitting-pose cat sliding across
  the floor). Display size stays 30×30 (scaled down from the native
  300×300 frames), matching the current player's on-screen size exactly.

## Non-goals (explicitly deferred)

- **No walk-cycle animation.** No walk/run art exists for any color; not
  faked with idle frames stretched to serve double duty beyond the
  freeze-on-move behavior above.
- **No 4th/5th color options.** `CalicoCatIdle.png`/`tuxedoIdle.png` are
  not wired in, per the spec's explicit "no more, no fewer" entries.
- **No changes to the N4 quiz gate, remaining decor, or instructions
  button** — separate sub-projects.
- **No user-profile/account-level persistence.** Same `localStorage`-only,
  degrade-to-session-only-on-failure pattern already used for lesson
  progress (`nekoBunko.n5.progress`) — a second, independent key,
  `nekoBunko.n5.catColor`, not merged into the same object.

## Architecture

### Scene registration and boot flow

`n5PhaserGame`'s config `scene` array becomes `[CatSelectScene,
LibraryScene]` (currently just `LibraryScene`). Phaser starts the first
scene in the array by default, so `CatSelectScene.create()` is the new
entry point. Its first action: read `localStorage.getItem('nekoBunko.n5.catColor')`
— if a valid saved value exists (`'orange' | 'black' | 'white'`), it
immediately calls `this.scene.start('LibraryScene')` without rendering
any select-screen UI (a one-frame passthrough, not a visible flash of the
select screen). If no saved value, it renders the select UI as described
in Goals.

### Cat color data

A small local map, e.g.:

```js
const CAT_COLORS = {
  orange: { key: 'orangeCatIdle', path: '.../OrangeCatIdle.png', frames: 12 },
  black:  { key: 'blackCatIdle',  path: '.../blackCatIdle.png',  frames: 20 },
  white:  { key: 'whiteCatIdle',  path: '.../whitecatIdle.png',  frames: 18 },
};
```

Both `CatSelectScene` and `LibraryScene` preload all three spritesheets
(cheap — three images, no different from the furniture sheets already
loaded) via `this.load.spritesheet(key, path, { frameWidth: 300,
frameHeight: 300 })`, and register one `idle` animation per color (e.g.
`orange-idle`, `black-idle`, `white-idle`) via `this.anims.create(...)`,
each looping (`repeat: -1`) through that color's full frame range at a
fixed frame rate (8fps — a simple, uniform choice rather than trying to
normalize perceived loop speed across differing frame counts).

### CatSelectScene UI

DOM is not used here (unlike the lesson panels) — this is a Phaser-native
scene, consistent with the "live animated preview" requirement. Rendered
elements:
- A dark rectangle panel (`this.add.rectangle`) covering most of the
  768×480 canvas.
- Three `this.add.text` entries ("Orange", "Black", "White") in
  `Press Start 2P`, left-aligned, stacked vertically, amber color;
  the highlighted entry gets a brighter shade / a simple selector glyph
  prefix (e.g. `▶`) to mark it, matching "numbered entries" loosely (a
  glyph cursor reads more like the "spell-select" reference than literal
  numbers, and avoids implying the number is a hotkey when arrow-key/click
  is the actual input).
- One `this.add.sprite` in a preview area (right/center of the panel)
  playing the highlighted color's `idle` animation; swapped (`.play(...)`)
  whenever the highlighted entry changes.
- Keyboard: up/down arrow keys move the highlight (wrapping top-to-bottom
  or clamped — clamped, simpler and matches typical menu conventions
  without wraparound surprise); Enter confirms. Click on a list entry both
  highlights and can immediately confirm on a second click (matches the
  spec's "click to highlight, click again... to confirm"), or a single
  visible "Select" text button confirms whichever is currently
  highlighted, satisfying "Enter / click again or a 'Select' button."

### LibraryScene player changes

`buildPlayer()` reads the saved color (already validated present, since
`LibraryScene` is only reached after a color exists), resolves it to that
color's Phaser texture/animation key, creates the player sprite from that
spritesheet (`this.physics.add.sprite(spawnX, spawnY, texKey)`) instead of
`'catPlayer'`, sets display size 30×30 as today, and calls
`.play(colorKey + '-idle')` immediately (starts idle since the player is
stationary at spawn). In `update()`'s existing movement block: when the
computed velocity for this frame is `(0, 0)`, ensure the idle animation is
playing (`isPlaying` check to avoid restarting it every idle frame); when
velocity is non-zero, call `.stop()` once (on the transition into moving,
not every frame) so the sprite freezes on its current frame rather than
continuing to animate while sliding.

### Change-character HUD button

A new small button added to the existing `#gameHUD` DOM bar in
`n5-dashboard.html`/its CSS (the same bar holding
Desktop/Home/Journey/Lessons) — not a new floating overlay element, since
a slot already exists in that established button row. Click handler:
if `LibraryScene` is the active/running scene, `this.scene.launch
('CatSelectScene', { overlay: true })` and `this.scene.pause
('LibraryScene')`. `CatSelectScene.create()` checks the `overlay` init
data flag — when true, confirming a selection does **not** call
`scene.start('LibraryScene')` (which would restart it); instead it saves
the color, updates the *already-running* `LibraryScene`'s player texture/
animation directly (via the scene manager's reference to the other active
scene instance), then `this.scene.stop('CatSelectScene')` +
`this.scene.resume('LibraryScene')`.

## Error handling / edge cases

- Missing/invalid `localStorage` value (corrupted, or a value outside the
  3 valid keys): treated the same as "no saved color" — show the select
  screen. Matches the existing degrade-gracefully pattern used for lesson
  progress.
- `localStorage` unavailable entirely (privacy mode/quota): color choice
  becomes session-only for that tab, same degrade pattern as
  `saveProgress()`'s existing try/catch — `CatSelectScene` would show on
  every fresh page load in that case, which is an acceptable, already-
  precedented degradation, not a new failure mode to special-case.
- Overlay reopen while a lesson/review panel is open: the "Change" button
  should be a no-op (or implicitly close the lesson panel first) rather
  than stacking two modal-ish UIs — implementation should guard against
  launching the overlay while `scene.panelOpen` is true on `LibraryScene`.

## Verification

Manual (Playwright, matching this session's established methodology —
alpha-scan/direct-crop verification isn't needed here since no new pixel
crops are involved, just whole-sheet spritesheet loads):

1. Clear `localStorage`, load the dashboard — confirm `CatSelectScene`
   renders (3 entries, amber pixel font, dark panel) and the initially-
   highlighted entry's preview sprite is actually animating (frame
   changes over a short poll, not a static image).
2. Change highlight via keyboard and via click — confirm the preview
   sprite swaps to the newly-highlighted color's animation each time.
3. Confirm a selection — confirm `localStorage`'s `nekoBunko.n5.catColor`
   is set correctly, and `LibraryScene` loads with a player sprite that
   is visibly one of the three cat spritesheets (not the old
   `fortunecat-Original.png`), playing its idle loop while stationary.
4. Reload the page — confirm `CatSelectScene` is skipped entirely (no
   visible flash of the select UI) and `LibraryScene` loads directly with
   the previously-saved color.
5. Trigger the new HUD "Change" button mid-game (player moved away from
   spawn, some progress saved) — confirm the overlay appears, confirm a
   different color, confirm `LibraryScene` resumes with the player still
   at the same world position and progress intact, now using the new
   color's animation.
6. Confirm the freeze-while-moving behavior specifically: walk the player
   (auto-walk or keyboard) and confirm the sprite is not visibly
   animating (same frame) while `moveQueue`/velocity is non-zero, then
   resumes animating once it stops.
