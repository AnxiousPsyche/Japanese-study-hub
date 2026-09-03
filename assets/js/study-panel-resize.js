/* Draggable divider between the Study Room's two panels (.study-instruction
   left, .study-practice-col right) — both N5 (study-room.js) and N4
   (study-room-n4.js) share the exact same .study-main/.study-instruction/
   .study-practice-col markup, so this one self-initializing script (loaded
   on both pages) covers every lesson in both engines. Resets to the CSS
   default 50/50 split on every page load — no persistence, per explicit
   request. */
(function () {
    "use strict";

    var MIN_PCT = 25;
    var MAX_PCT = 75;

    document.addEventListener("DOMContentLoaded", function () {
        var handle = document.getElementById("studyResizeHandle");
        var main = document.querySelector(".study-main");
        var left = document.querySelector(".study-instruction");
        if (!handle || !main || !left) return;

        var dragging = false;

        function clientXOf(e) {
            return e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
        }

        function setWidthFromClientX(clientX) {
            var rect = main.getBoundingClientRect();
            var pct = ((clientX - rect.left) / rect.width) * 100;
            pct = Math.max(MIN_PCT, Math.min(MAX_PCT, pct));
            /* flex-shrink:1 (not 0) so the browser can still yield space
               back to .study-practice-col's own min-width:320px on a
               narrower desktop window instead of forcing an overflow. */
            left.style.flex = "0 1 " + pct + "%";
        }

        function onMove(e) {
            if (!dragging) return;
            setWidthFromClientX(clientXOf(e));
            e.preventDefault();
        }

        function stopDrag() {
            if (!dragging) return;
            dragging = false;
            document.body.classList.remove("is-resizing-study-panels");
        }

        function startDrag(e) {
            /* Only two panels sit side by side above the mobile breakpoint
               (study-style.css switches .study-main to flex-direction:
               column there) — the handle itself is hidden by CSS at that
               width, but guard here too in case of a mid-drag resize. */
            if (getComputedStyle(main).flexDirection !== "row") return;
            dragging = true;
            document.body.classList.add("is-resizing-study-panels");
            e.preventDefault();
        }

        handle.addEventListener("mousedown", startDrag);
        handle.addEventListener("touchstart", startDrag, { passive: false });
        document.addEventListener("mousemove", onMove);
        document.addEventListener("touchmove", onMove, { passive: false });
        document.addEventListener("mouseup", stopDrag);
        document.addEventListener("touchend", stopDrag);
    });
})();
