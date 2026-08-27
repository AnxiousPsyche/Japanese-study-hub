/* KANA DOJO — stroke-order tracing engine.
   Pure vanilla JS + inline SVG, no framework/library needed: each stroke
   is an SVG <path>, animated with the classic line-drawing trick —
   stroke-dasharray/stroke-dashoffset both set to the path's own
   getTotalLength(), then stroke-dashoffset transitions to 0, so the
   line appears to draw itself in the browser's normal CSS transition
   engine. Strokes play back one at a time, in the stroke-order given by
   kana-data.js, with a short pause between them. */
(function () {
    "use strict";

    const SVG_NS = "http://www.w3.org/2000/svg";
    const STROKE_MS = 550;
    const GAP_MS = 220;

    function $(id) { return document.getElementById(id); }

    function groupByRow(chars) {
        const rows = [];
        const seen = {};
        chars.forEach(function (c) {
            if (!seen[c.row]) {
                seen[c.row] = [];
                rows.push(seen[c.row]);
            }
            seen[c.row].push(c);
        });
        return rows;
    }

    function initKanaWriter(opts) {
        const chars = opts.chars;
        const gridEl = opts.gridEl;
        const viewerEl = opts.viewerEl;
        const svgEl = opts.svgEl;
        const labelEl = opts.labelEl;
        const strokeCountEl = opts.strokeCountEl;
        const replayBtn = opts.replayBtn;
        const prevBtn = opts.prevBtn;
        const nextBtn = opts.nextBtn;

        let currentIndex = -1;
        let playToken = 0;

        function renderGrid() {
            const rows = groupByRow(chars);
            gridEl.innerHTML = "";
            rows.forEach(function (rowChars) {
                const rowEl = document.createElement("div");
                rowEl.className = "kana-grid__row";
                rowChars.forEach(function (c) {
                    const idx = chars.indexOf(c);
                    const btn = document.createElement("button");
                    btn.type = "button";
                    btn.className = "kana-grid__tile";
                    btn.innerHTML = "<span class='kana-grid__char'>" + c.char + "</span>"
                        + "<span class='kana-grid__romaji'>" + c.romaji + "</span>";
                    btn.addEventListener("click", function () { openChar(idx); });
                    rowEl.appendChild(btn);
                });
                gridEl.appendChild(rowEl);
            });
        }

        function clearSvg() {
            while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
        }

        function buildGuide(strokes) {
            /* Faint full-character outline behind the animated strokes, so
               the learner can see where the whole character is heading. */
            strokes.forEach(function (d) {
                const guide = document.createElementNS(SVG_NS, "path");
                guide.setAttribute("d", d);
                guide.setAttribute("class", "kana-writer__guide");
                svgEl.appendChild(guide);
            });
        }

        function playStrokes(strokes) {
            const myToken = ++playToken;
            const paths = strokes.map(function (d) {
                const p = document.createElementNS(SVG_NS, "path");
                p.setAttribute("d", d);
                p.setAttribute("class", "kana-writer__stroke");
                svgEl.appendChild(p);
                const len = p.getTotalLength();
                p.style.strokeDasharray = len;
                p.style.strokeDashoffset = len;
                return p;
            });

            function playAt(i) {
                if (myToken !== playToken) return;
                if (i >= paths.length) return;
                const p = paths[i];
                /* A single forced reflow isn't enough here — the browser
                   can still coalesce the starting dashoffset and the
                   transitioned target into one paint, so the stroke pops
                   in fully drawn instead of animating. Two nested rAFs
                   guarantee the starting value is actually painted in one
                   frame before the transition's target is applied in the
                   next, which is what makes the line-drawing trick work
                   reliably. */
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        if (myToken !== playToken) return;
                        p.style.transition = "stroke-dashoffset " + STROKE_MS + "ms ease-in-out";
                        p.style.strokeDashoffset = "0";
                    });
                });
                setTimeout(function () { playAt(i + 1); }, STROKE_MS + GAP_MS);
            }

            playAt(0);
        }

        function openChar(idx) {
            currentIndex = idx;
            const c = chars[idx];
            clearSvg();
            buildGuide(c.strokes);
            labelEl.textContent = c.char + "  (" + c.romaji + ")";
            strokeCountEl.textContent = c.strokes.length + (c.strokes.length === 1 ? " stroke" : " strokes");
            viewerEl.classList.add("is-visible");
            playStrokes(c.strokes);

            Array.prototype.forEach.call(gridEl.querySelectorAll(".kana-grid__tile"), function (btn, i) {
                btn.classList.toggle("is-active", i === idx);
            });
        }

        function replay() {
            if (currentIndex < 0) return;
            clearSvg();
            const c = chars[currentIndex];
            buildGuide(c.strokes);
            playStrokes(c.strokes);
        }

        function step(delta) {
            if (currentIndex < 0) return;
            const next = (currentIndex + delta + chars.length) % chars.length;
            openChar(next);
        }

        if (replayBtn) replayBtn.addEventListener("click", replay);
        if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
        if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });

        renderGrid();
    }

    window.KanaWriter = { init: initKanaWriter };
})();
