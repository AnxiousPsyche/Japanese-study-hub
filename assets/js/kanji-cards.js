/* KANJI CARDS — the N5 Kanji lesson's card gallery (assets/js/study-room.js
   calls KanjiCards.render() for the kanjiGroup lesson instead of the
   normal quiz/match-choice flow). Museum Placard is the confirmed visual
   direction; Book Spread is the confirmed interaction: click a card and it
   grows + centers (FLIP-style, from the clicked card's own real
   getBoundingClientRect()); click again and the card itself unfolds into
   a two-page spread — front page stays put, the write-up unfurls flush
   against its right edge (no gap) like a page opening from a spine.

   The write-up itself: On'yomi / Kun'yomi, 5 sample words, a jisho.org-
   style static "stroke order" strip (every prior stroke faint gray, the
   new stroke solid black with a red start dot — see buildStrokeOrderStrip
   below, ported from the exact same technique in kana-writer.js), and
   last, the animated stroke-order player. No etymology/lore section — the
   confirmed direction dropped that in favor of more room for readings. */
(function () {
    "use strict";

    const SVG_NS = "http://www.w3.org/2000/svg";
    const STROKE_MS = 550, GAP_MS = 220;

    let activeModal = null;

    function matchesQuery(k, q) {
        if (!q) return true;
        q = q.toLowerCase();
        return k.jp.indexOf(q) !== -1
            || (k.kun && k.kun.indexOf(q) !== -1)
            || (k.on && k.on.indexOf(q) !== -1)
            || (k.romaji && k.romaji.toLowerCase().indexOf(q) !== -1)
            || k.en.toLowerCase().indexOf(q) !== -1;
    }

    function cardFrontHTML(k) {
        return "<span class='kanji-card__glyph'>" + k.jp + "</span>";
    }

    /* ===== jisho.org-style static stroke-order strip — ported directly
       from kana-writer.js's buildStrokeOrderFrame/Complete (same visual
       language: faint gray for done strokes, solid black + red dot for
       the new one, a final un-boxed completed-character thumbnail). ===== */
    function buildStrokeOrderFrame(strokes, upToIndex) {
        const frame = document.createElement("div");
        frame.className = "kanji-stroke-order-frame";
        const svg = document.createElementNS(SVG_NS, "svg");
        svg.setAttribute("viewBox", "0 0 109 109");
        svg.setAttribute("class", "kanji-stroke-order-frame__svg");
        frame.appendChild(svg);

        for (let i = 0; i < upToIndex; i++) {
            const p = document.createElementNS(SVG_NS, "path");
            p.setAttribute("d", strokes[i]);
            p.setAttribute("class", "kanji-stroke-order-frame__stroke kanji-stroke-order-frame__stroke--prior");
            svg.appendChild(p);
        }
        const current = document.createElementNS(SVG_NS, "path");
        current.setAttribute("d", strokes[upToIndex]);
        current.setAttribute("class", "kanji-stroke-order-frame__stroke kanji-stroke-order-frame__stroke--current");
        svg.appendChild(current);

        const start = current.getPointAtLength(0);
        const dot = document.createElementNS(SVG_NS, "circle");
        dot.setAttribute("cx", start.x);
        dot.setAttribute("cy", start.y);
        dot.setAttribute("r", "4.5");
        dot.setAttribute("class", "kanji-stroke-order-frame__dot");
        svg.appendChild(dot);
        return frame;
    }

    function buildStrokeOrderComplete(strokes) {
        const frame = document.createElement("div");
        frame.className = "kanji-stroke-order-frame kanji-stroke-order-frame--complete";
        const svg = document.createElementNS(SVG_NS, "svg");
        svg.setAttribute("viewBox", "0 0 109 109");
        svg.setAttribute("class", "kanji-stroke-order-frame__svg");
        frame.appendChild(svg);
        strokes.forEach(function (d) {
            const p = document.createElementNS(SVG_NS, "path");
            p.setAttribute("d", d);
            p.setAttribute("class", "kanji-stroke-order-frame__stroke kanji-stroke-order-frame__stroke--current");
            svg.appendChild(p);
        });
        return frame;
    }

    function buildStrokeOrderStrip(strokes) {
        const strip = document.createElement("div");
        strip.className = "kanji-stroke-order-strip";
        strokes.forEach(function (_, i) {
            strip.appendChild(buildStrokeOrderFrame(strokes, i));
        });
        strip.appendChild(buildStrokeOrderComplete(strokes));
        return strip;
    }

    /* ===== Animated stroke player (dash-offset draw, same technique as
       kana-writer.js's playStrokes / the Kanji Lesson Lab mockup) — shown
       last, after the static strip. ===== */
    function buildStrokePlayer(strokes) {
        const wrap = document.createElement("div");
        const svg = document.createElementNS(SVG_NS, "svg");
        svg.setAttribute("viewBox", "0 0 109 109");
        svg.setAttribute("class", "kanji-stroke-player__svg");
        wrap.appendChild(svg);
        let token = 0;

        function play() {
            const myToken = ++token;
            while (svg.firstChild) svg.removeChild(svg.firstChild);
            strokes.forEach(function (d) {
                const guide = document.createElementNS(SVG_NS, "path");
                guide.setAttribute("d", d);
                guide.setAttribute("class", "kanji-stroke-player__guide");
                svg.appendChild(guide);
            });
            const paths = strokes.map(function (d) {
                const p = document.createElementNS(SVG_NS, "path");
                p.setAttribute("d", d);
                p.setAttribute("class", "kanji-stroke-player__line");
                svg.appendChild(p);
                const len = p.getTotalLength();
                p.style.strokeDasharray = len;
                p.style.strokeDashoffset = len;
                return p;
            });
            const dots = paths.map(function (p, i) {
                const start = p.getPointAtLength(0);
                const g = document.createElementNS(SVG_NS, "g");
                g.setAttribute("class", "kanji-stroke-player__dot");
                g.setAttribute("transform", "translate(" + start.x + "," + start.y + ")");
                const circle = document.createElementNS(SVG_NS, "circle");
                g.appendChild(circle);
                const text = document.createElementNS(SVG_NS, "text");
                text.setAttribute("y", "0.5");
                text.textContent = String(i + 1);
                g.appendChild(text);
                svg.appendChild(g);
                return g;
            });
            function playAt(i) {
                if (myToken !== token || i >= paths.length) return;
                const p = paths[i], dot = dots[i];
                dot.classList.add("is-active");
                afterReflow(function () {
                    if (myToken !== token) return;
                    p.style.transition = "stroke-dashoffset " + STROKE_MS + "ms ease-in-out";
                    p.style.strokeDashoffset = "0";
                });
                setTimeout(function () { if (myToken === token) dot.classList.add("is-done"); }, STROKE_MS);
                setTimeout(function () { playAt(i + 1); }, STROKE_MS + GAP_MS);
            }
            playAt(0);
        }
        return { el: wrap, play: play };
    }

    /* requestAnimationFrame doesn't fire while the document is hidden
       (confirmed while building the sitewide companion cat) — race it
       against a short timeout so animations still resolve either way. */
    function afterReflow(cb) {
        let done = false;
        function run() { if (done) return; done = true; cb(); }
        requestAnimationFrame(run);
        setTimeout(run, 50);
    }

    function backInnerHTML(k) {
        const words = (k.words || []).map(function (w) {
            return "<div class='kanji-card__word'>"
                + "<span class='kanji-card__word-jp'>" + w.jp + "</span>"
                + "<span class='kanji-card__word-reading'>" + w.reading + "</span>"
                + "<span class='kanji-card__word-en'>" + w.en + "</span>"
                + "</div>";
        }).join("");
        return ""
            + "<div class='kanji-card__back-head'><span class='kanji-card__back-glyph'>" + k.jp + "</span><span class='kanji-card__back-meaning'>" + k.en + "</span></div>"
            + "<div class='kanji-card__reading'><div class='kanji-card__reading-label'>On&rsquo;yomi</div><div class='kanji-card__reading-value'>" + k.on + "</div></div>"
            + "<div class='kanji-card__reading'><div class='kanji-card__reading-label'>Kun&rsquo;yomi</div><div class='kanji-card__reading-value'>" + k.kun + "</div></div>"
            + "<div class='kanji-card__words'><div class='kanji-card__words-label'>Sample words</div>" + words + "</div>"
            + "<div class='kanji-card__stroke-block'>"
            + "<div class='kanji-card__stroke-label'>Stroke order</div>"
            + "<div class='kanji-stroke-order-mount'></div>"
            + "</div>"
            + "<div class='kanji-card__stroke-block'>"
            + "<div class='kanji-card__stroke-head'><span class='kanji-card__stroke-label'>Watch it drawn</span><button type='button' class='kanji-replay-btn'>&#8635; Replay</button></div>"
            + "<div class='kanji-stroke-player-mount'></div>"
            + "</div>";
    }

    function closeModal(immediate) {
        if (!activeModal) return;
        const a = activeModal;
        a.panel.classList.remove("is-visible");
        a.closeBtn.classList.remove("is-visible");
        a.hint.classList.remove("is-visible");
        a.overlay.classList.remove("is-active");
        const rect = a.sourceBtn.getBoundingClientRect();
        a.card.style.top = rect.top + "px"; a.card.style.left = rect.left + "px";
        a.card.style.width = rect.width + "px"; a.card.style.height = rect.height + "px";
        const wait = immediate ? 0 : 440;
        setTimeout(function () {
            a.card.remove(); a.panel.remove(); a.closeBtn.remove(); a.hint.remove(); a.overlay.remove();
            a.sourceBtn.classList.remove("is-source-hidden");
        }, wait);
        activeModal = null;
    }

    /* The "solo centered" geometry, computed deterministically from
       window dimensions rather than read back from the DOM via
       card.getBoundingClientRect() a tick after a prior JS resize —
       that readback pattern proved unreliable while building this (the
       inline style attribute showed the correct target values, but
       getBoundingClientRect/getComputedStyle/offsetWidth all disagreed
       with it). Recomputing sidesteps the whole class of bug. */
    function soloCenteredRect() {
        const w = Math.min(300, window.innerWidth * 0.7), h = w * 1.35;
        const top = window.innerHeight / 2 - h / 2, left = window.innerWidth / 2 - w / 2;
        return { top: top, left: left, width: w, height: h };
    }

    function openCard(sourceBtn, k) {
        if (activeModal) closeModal(true);
        const rect = sourceBtn.getBoundingClientRect();
        sourceBtn.classList.add("is-source-hidden");

        const overlay = document.createElement("div");
        overlay.className = "kanji-card-overlay";
        document.body.appendChild(overlay);
        overlay.classList.add("is-active");

        const card = document.createElement("div");
        card.className = "kanji-card-modal";
        card.style.top = rect.top + "px"; card.style.left = rect.left + "px";
        card.style.width = rect.width + "px"; card.style.height = rect.height + "px";
        card.innerHTML = cardFrontHTML(k);
        document.body.appendChild(card);

        const panel = document.createElement("div");
        panel.className = "kanji-detail-panel";
        panel.innerHTML = "<div class='kanji-detail-panel__inner'>" + backInnerHTML(k) + "</div>";
        document.body.appendChild(panel);

        const closeBtn = document.createElement("button");
        closeBtn.type = "button"; closeBtn.className = "kanji-modal-close";
        closeBtn.setAttribute("aria-label", "Close"); closeBtn.textContent = "×";
        document.body.appendChild(closeBtn);

        const hint = document.createElement("div");
        hint.className = "kanji-tap-hint"; hint.textContent = "Tap the card to see the full write-up";
        document.body.appendChild(hint);

        const stripMount = panel.querySelector(".kanji-stroke-order-mount");
        stripMount.appendChild(buildStrokeOrderStrip(k.strokes));

        const playerMount = panel.querySelector(".kanji-stroke-player-mount");
        const player = buildStrokePlayer(k.strokes);
        playerMount.appendChild(player.el);
        panel.querySelector(".kanji-replay-btn").addEventListener("click", function (e) {
            e.stopPropagation();
            player.play();
        });

        let detailOpen = false;
        activeModal = { card: card, panel: panel, closeBtn: closeBtn, hint: hint, overlay: overlay, sourceBtn: sourceBtn };

        function positionClose(top, left, width) {
            closeBtn.style.top = (top - 15) + "px";
            closeBtn.style.left = (left + width - 15) + "px";
        }

        card.getBoundingClientRect(); // force reflow so the entrance transition plays
        afterReflow(function () {
            const solo = soloCenteredRect();
            card.style.top = solo.top + "px"; card.style.left = solo.left + "px";
            card.style.width = solo.width + "px"; card.style.height = solo.height + "px";
            positionClose(solo.top, solo.left, solo.width);
            setTimeout(function () { closeBtn.classList.add("is-visible"); hint.classList.add("is-visible"); }, 300);
        });

        card.addEventListener("click", function () {
            detailOpen = !detailOpen;
            const solo = soloCenteredRect();
            if (detailOpen) {
                const pw = Math.min(360, window.innerWidth * 0.46);
                panel.style.top = solo.top + "px";
                panel.style.left = solo.left + solo.width + "px";
                panel.style.width = "0px";
                panel.style.height = solo.height + "px";
                panel.getBoundingClientRect();
                afterReflow(function () {
                    panel.style.width = pw + "px";
                    panel.classList.add("is-visible");
                    positionClose(solo.top, solo.left + solo.width, pw);
                });
                hint.textContent = "Tap the card to close the write-up";
                player.play();
            } else {
                panel.style.width = "0px";
                panel.classList.remove("is-visible");
                positionClose(solo.top, solo.left, solo.width);
                hint.textContent = "Tap the card to see the full write-up";
            }
        });
        closeBtn.addEventListener("click", function (e) { e.stopPropagation(); closeModal(false); });
        overlay.addEventListener("click", function () { closeModal(false); });
    }

    function render(lesson, containerEl) {
        if (!containerEl) return;
        if (activeModal) closeModal(true);

        const kanjiList = (lesson.wordBank && lesson.wordBank.kanji) || [];
        containerEl.innerHTML =
            "<div class='kanji-cards__search'>"
            + "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><circle cx='11' cy='11' r='7'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg>"
            + "<input type='text' class='kanji-cards__search-input' placeholder='Search by kanji, kana, or romaji…' autocomplete='off'>"
            + "</div>"
            + "<div class='kanji-cards__grid'></div>"
            + "<p class='kanji-cards__empty' style='display:none'>No kanji match that search.</p>";

        const grid = containerEl.querySelector(".kanji-cards__grid");
        const empty = containerEl.querySelector(".kanji-cards__empty");
        const searchInput = containerEl.querySelector(".kanji-cards__search-input");

        function renderGrid(query) {
            grid.innerHTML = "";
            let shown = 0;
            kanjiList.forEach(function (k) {
                if (!matchesQuery(k, query)) return;
                shown++;
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "kanji-card";
                btn.innerHTML = cardFrontHTML(k);
                btn.addEventListener("click", function () { openCard(btn, k); });
                grid.appendChild(btn);
            });
            empty.style.display = shown === 0 ? "block" : "none";
        }

        searchInput.addEventListener("input", function () {
            renderGrid(searchInput.value.trim());
        });

        renderGrid("");
    }

    function destroy() {
        if (activeModal) closeModal(true);
    }

    window.KanjiCards = { render: render, destroy: destroy };
})();
