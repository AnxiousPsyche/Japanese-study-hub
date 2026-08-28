/* KANA DOJO — stroke-order tracing engine.
   Pure vanilla JS + inline SVG, no framework/library needed: each stroke
   is an SVG <path>, animated with the classic line-drawing trick —
   stroke-dasharray/stroke-dashoffset both set to the path's own
   getTotalLength(), then stroke-dashoffset transitions to 0, so the
   line appears to draw itself in the browser's normal CSS transition
   engine. Strokes play back one at a time, in the stroke-order given by
   kana-data.js, with a short pause between them.

   Each stroke also gets a small numbered dot — the same "①②③..."
   marker every real stroke-order chart/video uses — placed at that
   stroke's true starting point. The point comes from the path's own
   getPointAtLength(0), not a hand-picked coordinate, so the dot can
   never drift off the line it's marking. The dot lights up the instant
   its stroke starts drawing, then settles to a faint, still-visible
   mark once the stroke finishes, so by the end the whole numbered
   sequence is readable at a glance — exactly like a printed stroke
   diagram. */
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
        let chars = opts.chars;
        const gridEl = opts.gridEl;
        const viewerEl = opts.viewerEl;
        const svgEl = opts.svgEl;
        const labelEl = opts.labelEl;
        const strokeCountEl = opts.strokeCountEl;
        const replayBtn = opts.replayBtn;
        const prevBtn = opts.prevBtn;
        const nextBtn = opts.nextBtn;
        const strokeOrderStripEl = opts.strokeOrderStripEl;

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

        function buildStartDot(path, number) {
            /* Real start point of the actual path geometry — never a
               hand-placed guess, so it always lands exactly on the line. */
            const start = path.getPointAtLength(0);
            const dot = document.createElementNS(SVG_NS, "g");
            dot.setAttribute("class", "kana-writer__dot");
            dot.setAttribute("transform", "translate(" + start.x + "," + start.y + ")");

            const circle = document.createElementNS(SVG_NS, "circle");
            circle.setAttribute("r", "4.6");
            dot.appendChild(circle);

            const label = document.createElementNS(SVG_NS, "text");
            label.setAttribute("x", "0");
            label.setAttribute("y", "0.5");
            label.textContent = String(number);
            dot.appendChild(label);

            svgEl.appendChild(dot);
            return dot;
        }

        function buildStrokeOrderFrame(strokes, upToIndex) {
            /* One frame of the jisho.org-style "stroke order" strip: every
               stroke before upToIndex drawn faint/gray (already-done), the
               stroke AT upToIndex drawn solid black plus a red start dot
               (the one being introduced this frame), and nothing beyond it
               — exactly the progressive reveal jisho's own kanji/kana pages
               use, which is itself rendered from this same KanjiVG data. */
            const frame = document.createElement("div");
            frame.className = "kana-stroke-order-frame";
            const svg = document.createElementNS(SVG_NS, "svg");
            svg.setAttribute("viewBox", "0 0 109 109");
            svg.setAttribute("class", "kana-stroke-order-frame__svg");
            frame.appendChild(svg);

            for (let i = 0; i < upToIndex; i++) {
                const p = document.createElementNS(SVG_NS, "path");
                p.setAttribute("d", strokes[i]);
                p.setAttribute("class", "kana-stroke-order-frame__stroke kana-stroke-order-frame__stroke--prior");
                svg.appendChild(p);
            }

            const current = document.createElementNS(SVG_NS, "path");
            current.setAttribute("d", strokes[upToIndex]);
            current.setAttribute("class", "kana-stroke-order-frame__stroke kana-stroke-order-frame__stroke--current");
            svg.appendChild(current);

            const start = current.getPointAtLength(0);
            const dot = document.createElementNS(SVG_NS, "circle");
            dot.setAttribute("cx", start.x);
            dot.setAttribute("cy", start.y);
            dot.setAttribute("r", "4.5");
            dot.setAttribute("class", "kana-stroke-order-frame__dot");
            svg.appendChild(dot);

            return frame;
        }

        function buildStrokeOrderComplete(strokes) {
            /* The final, un-boxed "here's the finished character" thumbnail
               jisho.org tacks onto the end of its stroke-order strip. */
            const frame = document.createElement("div");
            frame.className = "kana-stroke-order-frame kana-stroke-order-frame--complete";
            const svg = document.createElementNS(SVG_NS, "svg");
            svg.setAttribute("viewBox", "0 0 109 109");
            svg.setAttribute("class", "kana-stroke-order-frame__svg");
            frame.appendChild(svg);
            strokes.forEach(function (d) {
                const p = document.createElementNS(SVG_NS, "path");
                p.setAttribute("d", d);
                p.setAttribute("class", "kana-stroke-order-frame__stroke kana-stroke-order-frame__stroke--current");
                svg.appendChild(p);
            });
            return frame;
        }

        function buildStrokeOrderStrip(strokes) {
            if (!strokeOrderStripEl) return;
            strokeOrderStripEl.innerHTML = "";
            strokes.forEach(function (_, i) {
                strokeOrderStripEl.appendChild(buildStrokeOrderFrame(strokes, i));
            });
            strokeOrderStripEl.appendChild(buildStrokeOrderComplete(strokes));
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

            /* Dots are built once up front (each anchored to its own
               stroke's real start point) and simply toggled visible in
               step with playback, rather than being created mid-sequence —
               keeps playAt() a plain timer loop. */
            const dots = paths.map(function (p, i) {
                return buildStartDot(p, i + 1);
            });

            function playAt(i) {
                if (myToken !== playToken) return;
                if (i >= paths.length) return;
                const p = paths[i];
                const dot = dots[i];
                dot.classList.add("is-active");
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
                setTimeout(function () {
                    if (myToken !== playToken) return;
                    dot.classList.add("is-done");
                }, STROKE_MS);
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
            buildStrokeOrderStrip(c.strokes);

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

        function setChars(newChars) {
            chars = newChars;
            currentIndex = -1;
            playToken++;
            clearSvg();
            viewerEl.classList.remove("is-visible");
            if (strokeOrderStripEl) strokeOrderStripEl.innerHTML = "";
            renderGrid();
        }

        if (replayBtn) replayBtn.addEventListener("click", replay);
        if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
        if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });

        renderGrid();

        return { setChars: setChars };
    }

    window.KanaWriter = { init: initKanaWriter };
})();
