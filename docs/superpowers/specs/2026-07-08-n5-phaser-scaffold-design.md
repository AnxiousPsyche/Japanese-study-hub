# N5 Phaser Scaffold — Design Spec

## Context

The N5 dashboard's library map (`pages/N5/n5-dashboard.html`) is currently a
code-drawn CSS scene (`assets/css/n5-dashboard.css`'s `.library-room`), driven
by vanilla JS (`assets/js/n5-map.js`, `n5-popup.js`, `n5-avatar-picker.js`,
`n5-save.js`) with a recolorable 7-color CSS `.cat` component for the player
and 3 ambient NPCs. This was just finished and merged (see
[2026-07-06-n5-library-map-design.md](2026-07-06-n5-library-map-design.md)).

The user has now decided to migrate the N5 map to **Phaser 3** with a real
downloaded tileset, reinterpreting a richer reference layout (top entrance
alcove with stained-glass window, grand staircase, symmetrical upper
shelf/balcony sections, lower table+lamp+bench+plant clusters, central rug,
bottom gate) rather than continuing the CSS-shape approach. This is a full
engine migration, not a reskin, and is being broken into sub-projects, built
and reviewed one at a time:

1. **Phaser 3 scaffold** — this spec.
2. Tileset decision + real art swap.
3. Tilemap layout (the actual library scene).
4. Player movement + collision.
5. Interaction system (shelf trigger zones, prompt UI).
6. Lesson data model + UI panel (migrate the 17-lesson `N5_LESSONS` set).
7. Review/checkpoint visuals + optional locking.
8. Cat avatar carry-over into Phaser.
9. Ambient NPC wandering + polish.

Work happens on a new branch, `n5-phaser-migration`, off `main`. `main` keeps
the current working CSS library map until the Phaser version is far enough
along to replace it — the N5 dashboard will be non-functional (placeholder
tiles only, no lessons) on this branch across most of the sub-projects above.

## Goals (this sub-project only)

- Get Phaser 3 mounted on the N5 dashboard page and rendering something, with
  the camera/tilemap pipeline proven end to end.
- Establish the pattern (Tilemap API + generated placeholder texture) that
  sub-projects #2 and #3 extend with a real tileset and real layout, so this
  scaffold isn't thrown away — it's built on.
- Match the current map's on-screen footprint (16:10 aspect, fills the frame
  responsively) so the rest of the page (HUD, footer, sakura, music player)
  is undisturbed.

## Non-goals (explicitly deferred to later sub-projects)

- No player sprite, no movement, no collision.
- No real tileset art — placeholder solid-color textures only.
- No lesson shelves, no interaction, no popup wiring.
- No cat avatar (player or NPC) in the Phaser scene yet — the old CSS cat
  component is simply removed from the page along with the rest of the old
  map markup.
- No deletion of `n5-map.js` / `n5-popup.js` / `n5-avatar-picker.js` /
  `n5-save.js` / the old library-room CSS rules — they're unlinked from the
  page (their DOM targets go away) but stay in the repo untouched, since
  later sub-projects will pull reusable logic back out of them (localStorage
  key patterns from `n5-save.js`, the lesson data shape from `n5-map.js`'s
  `N5_LESSONS`) rather than starting from scratch.

## Architecture

### Loading Phaser

Phaser 3 (latest stable) is loaded via a CDN `<script>` tag
(`cdn.jsdelivr.net`) in `n5-dashboard.html`'s `<head>`, alongside the existing
Bootstrap CDN tags. No npm, no bundler, no build step — consistent with the
rest of the site, which has no `package.json` today.

### HTML changes (`pages/N5/n5-dashboard.html`)

Everything currently inside `#mapFrame` is removed and replaced with a single
empty mount point:

```html
<main id="journeyMap">
    <div id="mapFrame">
        <div id="phaserGame"></div>
    </div>
</main>
```

This removes: `.library-room` and its children, `#libraryEntrance`,
`#playerCharacter` and the 3 `.npc-cat` divs, `#lessonMap` and all 17
`furniture-node` buttons, the 3 `treasure-node` buttons, `#goalCastle`, and
the `#avatarPicker` overlay.

`<script>` tags removed (page no longer has their DOM targets):
`n5-popup.js`, `n5-save.js`, `n5-avatar-picker.js`, `n5-map.js`.

New `<script>` tags added: the Phaser 3 CDN tag, then
`assets/js/n5-phaser-game.js`.

Everything outside `#mapFrame` — `#gameHUD`, `#dashboardFooter`,
`#sakura-container`, `#teleport-overlay`, `#achievement-container`, the audio
elements, `player.js`/`sakura.js`/`teleport.js`/`achievement.js`/
`music-player.js` — is untouched.

### `#mapFrame` / `#phaserGame` sizing

`#mapFrame` keeps its existing CSS (`position:absolute; inset:0; margin:auto;
aspect-ratio:16/10; max-width:100%; max-height:100%; overflow:hidden`) from
`n5-dashboard.css` — unchanged. `#phaserGame` fills it at `width:100%;
height:100%`.

### Phaser game config (`assets/js/n5-phaser-game.js`)

```js
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'phaserGame',
  width: 768,
  height: 480,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: LibraryScaffoldScene,
});
```

768×480 at 32px tiles = a 24×15 tile grid, and 768/480 = 16/10, matching
`#mapFrame`'s existing aspect ratio exactly — no change to the page's overall
proportions. `Scale.FIT` + `autoCenter` reproduces the old
`max-width/max-height:100%` responsive-shrink behavior.

### `LibraryScaffoldScene`

- `preload()`: generates two placeholder textures at runtime via
  `this.make.graphics()` → `generateTexture()` — a `floor` tile (one flat
  color) and a `wall` tile (a different flat color) — no external image
  files. This keeps the scaffold fully self-contained; sub-project #2 swaps
  these generated textures for loaded tileset images without touching the
  tilemap-construction code below.
- `create()`: builds a hardcoded 24×15 array (0 = floor, 1 = wall — a solid
  wall border, floor interior), turns it into a tilemap via
  `this.make.tilemap({ data, tileWidth: 32, tileHeight: 32 })`,
  `addTilesetImage` against the generated textures, and renders one layer.
  This is the same `Phaser.Tilemaps` API a real Tiled-exported JSON map will
  use in sub-project #3 — only the data source changes later, not the
  construction pattern.
- No update loop, no input handling, no player — camera stays at its default
  (matches the full 768×480 world, so the whole "room" is visible at once,
  matching the fixed-camera decision from brainstorming).

### CSS

No changes to `n5-dashboard.css` in this pass. The now-unused
`.library-room`/`.cat`/`.furniture-node`/`.avatar-picker`/etc. rules are left
in place rather than deleted, to avoid unrelated cleanup churn in a
scaffold-only change — later sub-projects will either resurrect or remove
them as the Phaser version grows to cover that ground.

## Error handling / edge cases

- Phaser CDN failing to load (offline dev): the page degrades to an empty
  `#phaserGame` div with no crash elsewhere on the page — HUD/footer/sakura
  are independent of the map and keep working. No fallback UI is built for
  this in the scaffold; acceptable for a dev-only intermediate state.
- Window resize: `Scale.FIT` handles reflow automatically; no custom resize
  code needed.

## Verification

Manual (Playwright or browser):

1. Load `pages/N5/n5-dashboard.html` on the `n5-phaser-migration` branch —
   confirm a Phaser canvas renders inside `#mapFrame`, showing a walled
   rectangular room (placeholder colors) filling the frame at 16:10.
2. Confirm the HUD, footer, sakura particles, and music player still render
   and function normally (untouched by this change).
3. Resize the browser window / check a narrow viewport — confirm the canvas
   scales via `Scale.FIT` without distorting the aspect ratio or breaking the
   rest of the page layout.
4. Confirm no JS console errors on load (old map scripts are fully unlinked,
   not just broken).
