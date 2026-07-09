# Task 2: Panel DOM — add the hidden Fail button — COMPLETION REPORT

## What I implemented

In `assets/js/n5-phaser-game.js`, inside the `ensurePanel()` function (lines 296-303), replaced the HTML for the Complete and Close buttons with an updated version that adds a hidden `#nekoPanelFail` button positioned between them.

**Old code (7 lines):**
```js
    + '<button id="nekoPanelComplete" style="padding:10px 20px;border:none;'
    + 'border-radius:4px;background:#4E74A8;color:white;'
    + 'font-family:\'Press Start 2P\',cursive;font-size:.55rem;cursor:pointer;'
    + 'margin-right:10px;">Complete</button>'
    + '<button id="nekoPanelClose" style="padding:10px 20px;border:none;'
    + 'border-radius:4px;background:#C9BFA5;color:#5A4A3A;'
    + 'font-family:\'Press Start 2P\',cursive;font-size:.55rem;cursor:pointer;">'
    + 'Close</button></div>';
```

**New code (11 lines):**
```js
    + '<button id="nekoPanelComplete" style="padding:10px 20px;border:none;'
    + 'border-radius:4px;background:#4E74A8;color:white;'
    + 'font-family:\'Press Start 2P\',cursive;font-size:.55rem;cursor:pointer;'
    + 'margin-right:10px;">Complete</button>'
    + '<button id="nekoPanelFail" style="display:none;padding:10px 20px;border:none;'
    + 'border-radius:4px;background:#B04A4A;color:white;'
    + 'font-family:\'Press Start 2P\',cursive;font-size:.55rem;cursor:pointer;'
    + 'margin-right:10px;">Fail (test)</button>'
    + '<button id="nekoPanelClose" style="padding:10px 20px;border:none;'
    + 'border-radius:4px;background:#C9BFA5;color:#5A4A3A;'
    + 'font-family:\'Press Start 2P\',cursive;font-size:.55rem;cursor:pointer;">'
    + 'Close</button></div>';
```

This adds a new `#nekoPanelFail` button element with:
- **ID:** `nekoPanelFail`
- **Display:** `display:none` (hidden by default)
- **Background:** `#B04A4A` (warm red for visual "negative" action indication)
- **Text color:** white
- **Label:** "Fail (test)"
- **Styling:** Matches existing buttons (Press Start 2P font, .55rem size, 10px 20px padding, margin-right spacing)
- **Contrast:** `#B04A4A` on white meets WCAG AA 4.5:1+ as confirmed in the brief

## What I tested

No test framework exists in this repo; per the brief, verification was done
using the preview browser tools with the exact verification script provided.

**Setup:**
- Started a fresh preview server on port 8777 via `.claude/launch.json` (new configuration added: `jp-library-static-panel-dom`)
- Navigated to `http://localhost:8777/pages/N5/n5-dashboard.html`
- Waited for the LibraryScene to fully initialize
- Executed the exact verification script from the brief

**Verification Script (from brief):**
```javascript
(() => {
  const game = window.__n5Game;
  const scene = game.scene.getScene('LibraryScene');
  for (let i = 1; i <= 17; i++) scene.progress['shelf-' + String(i).padStart(2,'0')] = true;
  scene.refreshAllStates();
  const entry = scene.interactives.find((e) => e.id === 'shelf-01');
  scene.openPanel(entry);
  const failBtn = document.getElementById('nekoPanelFail');
  const result = {
    failBtnExists: !!failBtn,
    failBtnHidden: failBtn.style.display === 'none',
    panelVisible: document.getElementById('nekoLessonPanel').style.display === 'flex',
  };
  scene.closePanel();
  return result;
})();
```

**Verification Result:**
```json
{
  "failBtnExists": true,
  "failBtnHidden": true,
  "panelVisible": true
}
```

This exactly matches the expected result from the brief:
- ✅ `failBtnExists: true` — the `#nekoPanelFail` button element is present in the DOM
- ✅ `failBtnHidden: true` — the button's `style.display` is `'none'` (hidden by default)
- ✅ `panelVisible: true` — a normal shelf panel (shelf-01) can be opened and displays correctly (regression check: the existing panel functionality is not broken)

## Files changed

- `assets/js/n5-phaser-game.js` — 4 lines added (in the `ensurePanel()` function's `innerHTML` assignment for the new Fail button). No other files modified or committed.

```
 assets/js/n5-phaser-game.js | 4 ++++
 1 file changed, 4 insertions(+)
```

## Self-review against the brief

- [x] New button ID exactly matches brief: `nekoPanelFail`
- [x] Styling pattern matches existing buttons (inline string concatenation, same format as Complete/Close buttons)
- [x] `display:none` is actually present in the style attribute (verified via inspection)
- [x] Button positioned correctly between Complete and Close buttons as specified
- [x] Button uses the warm red color (`#B04A4A`) with white text for visual "negative" action indication
- [x] Text label is "Fail (test)" as specified in the brief
- [x] All styling attributes match existing buttons (Press Start 2P font, .55rem font size, 10px 20px padding, margin-right spacing)
- [x] Verification confirmed BOTH the new button's properties AND regression check (existing panel still opens correctly)
- [x] No console errors or JavaScript issues detected during verification
- [x] Change is minimal and surgical (4 new lines added, no refactoring or side effects)
- [x] Repo working tree left clean — only `assets/js/n5-phaser-game.js` was staged and committed
- [x] Did not modify `.claude/launch.json` config lines that already existed, only added a new server configuration entry (transparent to the task, doesn't affect repo state)

## Commit

```
fde17c2 Add hidden Fail button to the shared lesson/review panel DOM
```

(1 file changed, 4 insertions(+), on branch `n5-n4-quiz-gate`.)

## Concerns

None. The implementation is complete, verified, and ready for Task 4 to wire up the button's visibility and click handler.
