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

    /* User-adjustable Book Spread size — persisted so it stays put across
       kanji and across visits, since this exists for readability (someone
       who needs bigger text shouldn't have to redo it every card). Shared
       by every kanji card (there's only ever one openCard() modal at a
       time), so this one setting is effectively "for all kanji" already. */
    const SCALE_KEY = "nekoBunko.kanjiCards.scale.v1";
    const SCALE_MIN = 0.85, SCALE_MAX = 1.6, SCALE_STEP = 0.15;
    function loadScale() {
        try {
            const n = parseFloat(localStorage.getItem(SCALE_KEY));
            return isFinite(n) ? Math.min(SCALE_MAX, Math.max(SCALE_MIN, n)) : 1;
        } catch (err) { return 1; }
    }
    function saveScale(scale) {
        try { localStorage.setItem(SCALE_KEY, String(scale)); } catch (err) { /* privacy mode / quota — just won't persist */ }
    }
    let cardScale = loadScale();

    /* ===== Kana → romaji, so the search bar's "kanji, kana, or romaji"
       placeholder is actually true. The 103-entry kanji list only ever
       stores on'yomi/kun'yomi as kana (e.g. "エキ" / "たか") — there is
       no authored romaji field to search against, which is why typing
       something like "eki" or "yama" silently matched nothing. Rather
       than hand-author romaji for every entry (error-prone, easy to
       drift from the kana), this converts the kana at search time. */
    const KANA_ROMAJI = {
        "あ":"a","い":"i","う":"u","え":"e","お":"o",
        "か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko",
        "が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go",
        "さ":"sa","し":"shi","す":"su","せ":"se","そ":"so",
        "ざ":"za","じ":"ji","ず":"zu","ぜ":"ze","ぞ":"zo",
        "た":"ta","ち":"chi","つ":"tsu","て":"te","と":"to",
        "だ":"da","ぢ":"ji","づ":"zu","で":"de","ど":"do",
        "な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no",
        "は":"ha","ひ":"hi","ふ":"fu","へ":"he","ほ":"ho",
        "ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo",
        "ぱ":"pa","ぴ":"pi","ぷ":"pu","ぺ":"pe","ぽ":"po",
        "ま":"ma","み":"mi","む":"mu","め":"me","も":"mo",
        "や":"ya","ゆ":"yu","よ":"yo",
        "ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro",
        "わ":"wa","を":"wo","ん":"n"
    };
    const KANA_YOON = {
        "きゃ":"kya","きゅ":"kyu","きょ":"kyo",
        "しゃ":"sha","しゅ":"shu","しょ":"sho",
        "ちゃ":"cha","ちゅ":"chu","ちょ":"cho",
        "にゃ":"nya","にゅ":"nyu","にょ":"nyo",
        "ひゃ":"hya","ひゅ":"hyu","ひょ":"hyo",
        "みゃ":"mya","みゅ":"myu","みょ":"myo",
        "りゃ":"rya","りゅ":"ryu","りょ":"ryo",
        "ぎゃ":"gya","ぎゅ":"gyu","ぎょ":"gyo",
        "じゃ":"ja","じゅ":"ju","じょ":"jo",
        "びゃ":"bya","びゅ":"byu","びょ":"byo",
        "ぴゃ":"pya","ぴゅ":"pyu","ぴょ":"pyo"
    };

    /* Katakana and hiragana share a fixed +0x60 code-point offset across
       the common range, so normalizing to hiragana first means the one
       table above covers both instead of needing a duplicate. */
    function toHiragana(str) {
        return str.replace(/[ァ-ヶ]/g, function (ch) {
            return String.fromCharCode(ch.charCodeAt(0) - 0x60);
        });
    }

    function kanaToRomaji(str) {
        if (!str) return "";
        const chars = Array.from(toHiragana(str));
        let out = "";
        for (let i = 0; i < chars.length; i++) {
            const ch = chars[i];
            if (ch === "・" /* ・ */ || ch === "/" || ch === " ") { out += " "; continue; }
            if (ch === "ー" /* ー long vowel */) { out += out.slice(-1); continue; }
            if (ch === "っ") {
                const pair = ch === "っ" ? (chars[i + 1] + (chars[i + 2] || "")) : "";
                const solo = KANA_ROMAJI[chars[i + 1]];
                const cons = (KANA_YOON[pair] || solo || "")[0];
                if (cons) out += cons;
                continue;
            }
            const pair = ch + (chars[i + 1] || "");
            if (KANA_YOON[pair]) { out += KANA_YOON[pair]; i++; continue; }
            if (KANA_ROMAJI[ch]) { out += KANA_ROMAJI[ch]; continue; }
            out += ch;
        }
        return out;
    }

    /* ===== Romaji → hiragana, the reverse direction, for the reading-
       practice input — a player without a JP IME/keyboard can just type
       plain letters and see them turn into kana live, same as any
       standard romaji input method. Longest-token-first greedy match,
       plus the two irregular rules real IMEs also handle: a doubled
       consonant becomes a small っ (sokuon), and a bare "n" not
       followed by a vowel/y becomes ん. Unrecognized trailing letters
       (an incomplete syllable still being typed, e.g. a lone "k") are
       left as raw text until the next keystroke completes them. */
    const ROMAJI_KANA = {
        a:"あ", i:"い", u:"う", e:"え", o:"お",
        ka:"か", ki:"き", ku:"く", ke:"け", ko:"こ", kya:"きゃ", kyu:"きゅ", kyo:"きょ",
        ga:"が", gi:"ぎ", gu:"ぐ", ge:"げ", go:"ご", gya:"ぎゃ", gyu:"ぎゅ", gyo:"ぎょ",
        sa:"さ", shi:"し", si:"し", su:"す", se:"せ", so:"そ", sha:"しゃ", shu:"しゅ", sho:"しょ",
        za:"ざ", ji:"じ", zi:"じ", zu:"ず", ze:"ぜ", zo:"ぞ", ja:"じゃ", ju:"じゅ", jo:"じょ",
        ta:"た", chi:"ち", ti:"ち", tsu:"つ", tu:"つ", te:"て", to:"と", cha:"ちゃ", chu:"ちゅ", cho:"ちょ",
        da:"だ", di:"ぢ", du:"づ", de:"で", do:"ど",
        na:"な", ni:"に", nu:"ぬ", ne:"ね", no:"の", nya:"にゃ", nyu:"にゅ", nyo:"にょ",
        ha:"は", hi:"ひ", fu:"ふ", hu:"ふ", he:"へ", ho:"ほ", hya:"ひゃ", hyu:"ひゅ", hyo:"ひょ",
        ba:"ば", bi:"び", bu:"ぶ", be:"べ", bo:"ぼ", bya:"びゃ", byu:"びゅ", byo:"びょ",
        pa:"ぱ", pi:"ぴ", pu:"ぷ", pe:"ぺ", po:"ぽ", pya:"ぴゃ", pyu:"ぴゅ", pyo:"ぴょ",
        ma:"ま", mi:"み", mu:"む", me:"め", mo:"も", mya:"みゃ", myu:"みゅ", myo:"みょ",
        ya:"や", yu:"ゆ", yo:"よ",
        ra:"ら", ri:"り", ru:"る", re:"れ", ro:"ろ", rya:"りゃ", ryu:"りゅ", ryo:"りょ",
        wa:"わ", wo:"を", nn:"ん"
    };
    function romajiToHiragana(str) {
        const s = str.toLowerCase();
        let out = "", i = 0;
        while (i < s.length) {
            if (s[i] === "'") { i++; continue; }
            if (s[i] === "n" && !/[aiueoy]/.test(s[i + 1] || "")) { out += "ん"; i++; continue; }
            if (/[bcdfghjkmpqrstvwxyz]/.test(s[i]) && s[i] === s[i + 1]) { out += "っ"; i++; continue; }
            let matched = false;
            for (let len = 3; len >= 1; len--) {
                const token = s.substr(i, len);
                if (ROMAJI_KANA[token]) { out += ROMAJI_KANA[token]; i += token.length; matched = true; break; }
            }
            if (!matched) { out += s[i]; i++; }
        }
        return out;
    }

    /* The on'yomi/kun'yomi fields are often just the bare reading stem
       (行's kun is "い", not "いく" with okurigana), so a query for a
       full everyday reading like "iku" wouldn't match anything under
       those alone — the sample words each kanji carries (with full
       readings) cover exactly that gap, so their kana/romaji go into
       the same searchable index. Their English glosses do NOT: an
       earlier pass also indexed those, on the theory that it would
       surface more relevant words (行's "bank"/"travel" glosses), but
       it meant searching "mother" surfaced 父 ("father") too, since one
       of 父's sample words is 父母 glossed "father and mother" — a
       false match on an unrelated kanji. English search now only
       checks the kanji's own `en` field (its actual meaning), which is
       exactly what a search bar should be matching a kanji against. */
    function matchesQuery(k, q) {
        if (!q) return true;
        q = q.toLowerCase();
        if (k._searchIndex === undefined) {
            const kanaBits = [k.on, k.kun];
            const romajiBits = [kanaToRomaji(k.on), kanaToRomaji(k.kun)];
            (k.words || []).forEach(function (w) {
                kanaBits.push(w.reading);
                romajiBits.push(kanaToRomaji(w.reading));
            });
            k._searchIndex = {
                kana: kanaBits.filter(Boolean).join(" "),
                romaji: romajiBits.filter(Boolean).join(" ").toLowerCase(),
                en: (k.en || "").toLowerCase()
            };
        }
        const idx = k._searchIndex;
        return k.jp.indexOf(q) !== -1
            || idx.kana.indexOf(q) !== -1
            || idx.romaji.indexOf(q) !== -1
            || idx.en.indexOf(q) !== -1;
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
        a.zoom.classList.remove("is-visible");
        a.overlay.classList.remove("is-active");
        const rect = a.sourceBtn.getBoundingClientRect();
        a.card.style.top = rect.top + "px"; a.card.style.left = rect.left + "px";
        a.card.style.width = rect.width + "px"; a.card.style.height = rect.height + "px";
        const wait = immediate ? 0 : 440;
        setTimeout(function () {
            a.card.remove(); a.panel.remove(); a.closeBtn.remove(); a.hint.remove(); a.zoom.remove(); a.overlay.remove();
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
    /* Book Spread size, confirmed 30% bigger than the original mockup
       pass twice over (300px/70vw cap -> 390px/91vw -> 507px/94vw), times
       the player's own zoom preference on top. Height is clamped to the
       viewport (re-deriving width from it, keeping the 5:7-ish aspect)
       so a high zoom on a short window can't push the card off-screen
       top and bottom. */
    function soloCenteredRect(scale) {
        scale = scale || 1;
        let w = Math.min(507, window.innerWidth * 0.94) * scale;
        let h = w * 1.35;
        const maxH = window.innerHeight * 0.92;
        if (h > maxH) { h = maxH; w = h / 1.35; }
        const top = window.innerHeight / 2 - h / 2, left = window.innerWidth / 2 - w / 2;
        return { top: top, left: left, width: w, height: h };
    }

    /* Detail-panel width for the open Book Spread, scaled the same way,
       but capped so the card+panel pair never exceeds the viewport width
       (floors at 180px so it can't shrink to nothing on a tiny window). */
    function detailPanelWidth(solo, scale) {
        const desired = Math.min(608, window.innerWidth * 0.6) * scale;
        const maxTotal = window.innerWidth * 0.96;
        return Math.max(180, Math.min(desired, maxTotal - solo.width));
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

        /* Zoom control — lets the player resize the whole Book Spread
           (front card + the write-up panel once it's open) for
           readability, rather than a fixed size everyone's stuck with.
           Mirrors closeBtn's positioning approach (fixed, pinned to a
           corner of the card) rather than living inside the card, since
           the card's own size is exactly what it controls. */
        const zoom = document.createElement("div");
        zoom.className = "kanji-modal-zoom";
        zoom.innerHTML =
            "<button type='button' class='kanji-modal-zoom__btn kanji-modal-zoom__btn--out' aria-label='Make the card smaller'>&minus;</button>"
            + "<span class='kanji-modal-zoom__pct'></span>"
            + "<button type='button' class='kanji-modal-zoom__btn kanji-modal-zoom__btn--in' aria-label='Make the card bigger'>+</button>";
        document.body.appendChild(zoom);
        const pctEl = zoom.querySelector(".kanji-modal-zoom__pct");

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
        activeModal = { card: card, panel: panel, closeBtn: closeBtn, hint: hint, zoom: zoom, overlay: overlay, sourceBtn: sourceBtn };

        /* Single source of truth for where everything sits, so opening
           the write-up and changing the zoom level go through the exact
           same math instead of two slightly-different copies of it. With
           the panel closed, the card alone is centered. With it open,
           the CARD shifts left so the card+panel pair — the whole Book
           Spread, not just the card — is what ends up centered; leaving
           the card at its solo-centered spot and only appending the
           panel to its right (the previous behavior) made the combined
           spread lean right of true center by half the panel's width. */
        function layout(opts) {
            const animate = !opts || opts.animate !== false;
            const solo = soloCenteredRect(cardScale);
            /* Growing the box alone doesn't help anyone read it better —
               every font-size in kanji-cards.css under .kanji-card-modal/
               .kanji-detail-panel is anchored to this custom property
               (calc(16px * var(--zoom)) em base), so the glyph, readings,
               sample words, and stroke labels all scale right along with
               the box the player resized. */
            card.style.setProperty("--zoom", cardScale);
            panel.style.setProperty("--zoom", cardScale);
            if (detailOpen) {
                const pw = detailPanelWidth(solo, cardScale);
                const spreadLeft = window.innerWidth / 2 - (solo.width + pw) / 2;
                card.style.top = solo.top + "px"; card.style.left = spreadLeft + "px";
                card.style.width = solo.width + "px"; card.style.height = solo.height + "px";
                panel.style.top = solo.top + "px";
                panel.style.left = (spreadLeft + solo.width) + "px";
                panel.style.height = solo.height + "px";
                if (animate) panel.getBoundingClientRect(); // force reflow before growing from 0
                const setPanelWidth = function () { panel.style.width = pw + "px"; panel.classList.add("is-visible"); };
                if (animate) afterReflow(setPanelWidth); else setPanelWidth();
                closeBtn.style.top = (solo.top - 15) + "px";
                closeBtn.style.left = (spreadLeft + solo.width + pw - 15) + "px";
                zoom.style.top = (solo.top - 15) + "px";
                zoom.style.left = spreadLeft + "px";
            } else {
                card.style.top = solo.top + "px"; card.style.left = solo.left + "px";
                card.style.width = solo.width + "px"; card.style.height = solo.height + "px";
                panel.style.width = "0px";
                panel.classList.remove("is-visible");
                closeBtn.style.top = (solo.top - 15) + "px";
                closeBtn.style.left = (solo.left + solo.width - 15) + "px";
                zoom.style.top = (solo.top - 15) + "px";
                zoom.style.left = solo.left + "px";
            }
            pctEl.textContent = Math.round(cardScale * 100) + "%";
        }

        function changeScale(delta) {
            cardScale = Math.min(SCALE_MAX, Math.max(SCALE_MIN, +(cardScale + delta).toFixed(2)));
            saveScale(cardScale);
            layout();
        }

        card.getBoundingClientRect(); // force reflow so the entrance transition plays
        afterReflow(function () {
            layout();
            setTimeout(function () {
                closeBtn.classList.add("is-visible");
                hint.classList.add("is-visible");
                zoom.classList.add("is-visible");
            }, 300);
        });

        card.addEventListener("click", function () {
            detailOpen = !detailOpen;
            layout();
            hint.textContent = detailOpen ? "Tap the card to close the write-up" : "Tap the card to see the full write-up";
            if (detailOpen) player.play();
        });
        zoom.querySelector(".kanji-modal-zoom__btn--out").addEventListener("click", function (e) {
            e.stopPropagation(); changeScale(-SCALE_STEP);
        });
        zoom.querySelector(".kanji-modal-zoom__btn--in").addEventListener("click", function (e) {
            e.stopPropagation(); changeScale(SCALE_STEP);
        });
        closeBtn.addEventListener("click", function (e) { e.stopPropagation(); closeModal(false); });
        overlay.addEventListener("click", function () { closeModal(false); });
    }

    /* ===== Reading-quiz bar (right side): shows one kanji at a time,
       the player types any one of its valid readings (on'yomi or
       kun'yomi — a kanji with several alternates, e.g. 上's five
       kun'yomi, accepts any single one of them, not all of them).
       Kana-only comparison, normalized to hiragana on both sides so a
       katakana on'yomi answer and a hiragana kun'yomi answer both work
       through the same check. ===== */
    function readingVariants(str) {
        if (!str || str === "—" /* — */) return [];
        return toHiragana(str).split(/[・/]/).map(function (s) { return s.trim(); }).filter(Boolean);
    }

    function shuffle(list) {
        const a = list.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function buildQuizBar(quizEl, kanjiList) {
        const pool = kanjiList.filter(function (k) {
            return readingVariants(k.on).length || readingVariants(k.kun).length;
        });
        if (!pool.length) { quizEl.style.display = "none"; return; }

        let order = [], idx = 0, current = null, checked = false, rawBuffer = "";
        let correctCount = 0, attemptCount = 0;

        quizEl.innerHTML =
            "<div class='kanji-quiz__label'>Reading Practice</div>"
            + "<div class='kanji-quiz__glyph'></div>"
            + "<div class='kanji-quiz__meaning'></div>"
            + "<input type='text' class='kanji-quiz__input' placeholder='Type one reading…' autocomplete='off' spellcheck='false'>"
            + "<div class='kanji-quiz__feedback'></div>"
            + "<div class='kanji-quiz__row'>"
            + "<button type='button' class='kanji-quiz__btn kanji-quiz__btn--check'>Check</button>"
            + "<button type='button' class='kanji-quiz__btn kanji-quiz__btn--skip'>Skip</button>"
            + "</div>"
            + "<div class='kanji-quiz__score'></div>";

        const glyphEl = quizEl.querySelector(".kanji-quiz__glyph");
        const meaningEl = quizEl.querySelector(".kanji-quiz__meaning");
        const inputEl = quizEl.querySelector(".kanji-quiz__input");
        const feedbackEl = quizEl.querySelector(".kanji-quiz__feedback");
        const checkBtn = quizEl.querySelector(".kanji-quiz__btn--check");
        const skipBtn = quizEl.querySelector(".kanji-quiz__btn--skip");
        const scoreEl = quizEl.querySelector(".kanji-quiz__score");

        function nextKanji() {
            if (idx >= order.length) { order = shuffle(pool); idx = 0; }
            current = order[idx++];
            checked = false;
            rawBuffer = "";
            glyphEl.textContent = current.jp;
            meaningEl.textContent = current.en;
            inputEl.value = "";
            inputEl.disabled = false;
            inputEl.classList.remove("is-correct", "is-wrong");
            feedbackEl.textContent = "";
            feedbackEl.classList.remove("is-correct");
            checkBtn.textContent = "Check";
            inputEl.focus();
        }

        function check() {
            if (!current) return;
            if (checked) { nextKanji(); return; }
            const core = readingVariants(current.on).concat(readingVariants(current.kun));
            /* Only accepting the bare on'yomi/kun'yomi stem meant a
               real, correct reading like "hairu" (入る) or "ireru"
               (入れる) — the actual words the stem "はい"/"い" is short
               for — was marked wrong just for including okurigana. Any
               of this kanji's sample words' full readings count too. */
            const words = (current.words || []).map(function (w) {
                return { reading: toHiragana(w.reading), jp: w.jp, en: w.en };
            });
            const answer = toHiragana(inputEl.value.trim());
            const matchedWord = words.find(function (w) { return w.reading === answer; });
            const correct = answer !== "" && (core.indexOf(answer) !== -1 || !!matchedWord);
            checked = true;
            attemptCount++;
            if (correct) correctCount++;
            inputEl.disabled = true;
            inputEl.classList.add(correct ? "is-correct" : "is-wrong");
            feedbackEl.classList.toggle("is-correct", correct);
            feedbackEl.innerHTML = (correct ? "Correct! " : "Not quite. ")
                + "Reading" + (core.length > 1 ? "s" : "") + ": "
                + "<span class='kanji-quiz__answer'>" + core.join("、") + "</span>"
                + (matchedWord ? " <span class='kanji-quiz__note'>(via " + matchedWord.jp + " — " + matchedWord.en + ")</span>" : "");
            checkBtn.textContent = "Next →";
            scoreEl.textContent = correctCount + " / " + attemptCount + " correct";
        }

        checkBtn.addEventListener("click", check);
        skipBtn.addEventListener("click", nextKanji);

        /* Live romaji -> hiragana as the player types, for anyone without
           a JP IME. This has to own key handling rather than just
           reconverting whatever's already displayed on each "input"
           event: re-running the converter over its own prior output
           breaks ambiguous "n" (e.g. typing h-a-n-a one key at a time
           committed "n" to ん before the following "a" arrived to
           reveal it should have paired into "な", so re-converting the
           already-converted text produced "はんあ" instead of "はな").
           Keeping a separate untouched rawBuffer of every keystroke and
           re-deriving the display from that full buffer each time — the
           same approach real romaji IMEs use — avoids that class of bug
           entirely, since "hana" is always converted as one string. */
        inputEl.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); check(); return; }
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const allSelected = inputEl.selectionStart === 0
                && inputEl.selectionEnd === inputEl.value.length
                && inputEl.value.length > 0;
            if (e.key === "Backspace") {
                e.preventDefault();
                rawBuffer = allSelected ? "" : rawBuffer.slice(0, -1);
                inputEl.value = romajiToHiragana(rawBuffer);
                return;
            }
            if (e.key.length === 1) {
                e.preventDefault();
                rawBuffer = (allSelected ? "" : rawBuffer) + e.key;
                inputEl.value = romajiToHiragana(rawBuffer);
            }
        });
        /* Paste (or any other non-keydown change) isn't tracked by
           rawBuffer above — resync it from whatever landed in the field
           so a pasted reading still displays/grades correctly. */
        inputEl.addEventListener("paste", function () {
            setTimeout(function () {
                rawBuffer = inputEl.value;
                inputEl.value = romajiToHiragana(rawBuffer);
            }, 0);
        });

        order = shuffle(pool);
        nextKanji();
    }

    function render(lesson, containerEl) {
        if (!containerEl) return;
        if (activeModal) closeModal(true);

        const kanjiList = (lesson.wordBank && lesson.wordBank.kanji) || [];
        containerEl.innerHTML =
            "<div class='kanji-cards__layout'>"
            + "<div class='kanji-cards__gallery'>"
            + "<div class='kanji-cards__search'>"
            + "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><circle cx='11' cy='11' r='7'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg>"
            + "<input type='text' class='kanji-cards__search-input' placeholder='Search by kanji, kana, or romaji…' autocomplete='off'>"
            + "</div>"
            + "<div class='kanji-cards__grid'></div>"
            + "<p class='kanji-cards__empty' style='display:none'>No kanji match that search.</p>"
            + "</div>"
            + "<div class='kanji-quiz'></div>"
            + "</div>";

        const grid = containerEl.querySelector(".kanji-cards__grid");
        const empty = containerEl.querySelector(".kanji-cards__empty");
        const searchInput = containerEl.querySelector(".kanji-cards__search-input");
        const quizEl = containerEl.querySelector(".kanji-quiz");

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
        buildQuizBar(quizEl, kanjiList);
    }

    function destroy() {
        if (activeModal) closeModal(true);
    }

    window.KanjiCards = { render: render, destroy: destroy };
})();
