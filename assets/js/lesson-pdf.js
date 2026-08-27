/* LESSON PDF EXPORT — the Study Room's printer icon.
   Builds a watermarked "Neko Bunko" PDF of a lesson's full word list
   (its wordBank categories, the same words used in its exercises, plus
   its buildInstruction().vocab table).

   jsPDF's own built-in fonts only cover Latin text — calling doc.text()
   directly with Japanese characters renders blank/garbled, since the
   base14 PDF fonts have no CJK glyphs. Instead this renders an off-screen
   HTML table (in the page's own DotGothic16 Japanese web font) and hands
   it to jsPDF's doc.html(), which rasterizes via html2canvas — that
   respects real CSS fonts, so Japanese text comes through correctly.
   Both libraries are loaded as plain CDN scripts in study-room.html. */
(function () {
    "use strict";

    /* Every word/phrase this lesson can ever ask about: its wordBank
       categories (excluding the "preview" sneak-peek chip, which belongs
       to the next lesson, not this one) plus buildInstruction().vocab,
       de-duplicated by the Japanese text. */
    function collectRows(lesson) {
        var rows = [];
        var seen = {};
        function pushWord(w) {
            if (!w || !w.jp || seen[w.jp]) return;
            seen[w.jp] = true;
            rows.push({ jp: w.jp, romaji: w.romaji || "", en: w.en || "" });
        }
        if (lesson.wordBank) {
            Object.keys(lesson.wordBank).forEach(function (key) {
                if (key === "preview") return;
                (lesson.wordBank[key] || []).forEach(pushWord);
            });
        }
        if (typeof lesson.buildInstruction === "function") {
            var inst = lesson.buildInstruction();
            (inst.vocab || []).forEach(pushWord);
        }
        return rows;
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c];
        });
    }

    function buildContainer(lesson, rows) {
        var rowsHtml = rows.map(function (w) {
            return "<tr>"
                + "<td style='padding:7px 10px 7px 0;font-family:\"DotGothic16\",\"Nunito\",sans-serif;font-size:16px;'>" + escapeHtml(w.jp) + "</td>"
                + "<td style='padding:7px 10px 7px 0;color:#666;font-size:13px;'>" + escapeHtml(w.romaji) + "</td>"
                + "<td style='padding:7px 0;font-size:13px;'>" + escapeHtml(w.en) + "</td>"
                + "</tr>";
        }).join("");

        var el = document.createElement("div");
        el.style.position = "fixed";
        el.style.top = "0";
        el.style.left = "-10000px";
        el.style.width = "760px";
        el.style.padding = "24px";
        el.style.background = "#ffffff";
        el.style.color = "#1a1a1a";
        el.style.fontFamily = "'Nunito', 'DotGothic16', sans-serif";
        el.innerHTML =
            "<h1 style='font-size:22px;margin:0 0 4px;'>" + escapeHtml(lesson.title) + "</h1>"
            + "<div style='font-size:12px;color:#777;margin-bottom:18px;'>" + escapeHtml(lesson.subtitle || "") + " &middot; Neko Bunko Study Room</div>"
            + "<table style='width:100%;border-collapse:collapse;'>"
            + "<thead><tr style='text-align:left;color:#999;font-size:11px;text-transform:uppercase;letter-spacing:.05em;'>"
            + "<th style='padding-bottom:6px;'>Japanese</th><th style='padding-bottom:6px;'>Romaji</th><th style='padding-bottom:6px;'>English</th>"
            + "</tr></thead>"
            + "<tbody>" + rowsHtml + "</tbody>"
            + "</table>";
        document.body.appendChild(el);
        return el;
    }

    /* ASCII-only, so it's safe to draw with jsPDF's own default font
       directly (ink stamped on top of the already-rasterized table,
       hence the low opacity). */
    function stampWatermark(doc) {
        var pageWidth = doc.internal.pageSize.getWidth();
        var pageHeight = doc.internal.pageSize.getHeight();
        doc.saveGraphicsState();
        if (doc.setGState && doc.GState) {
            doc.setGState(new doc.GState({ opacity: 0.08 }));
        }
        doc.setFontSize(50);
        doc.setTextColor(90, 90, 90);
        doc.text("NEKO BUNKO", pageWidth / 2, pageHeight / 2, {
            align: "center",
            angle: 45
        });
        doc.restoreGraphicsState();
    }

    function exportLessonPdf(lesson) {
        if (!lesson) return;
        if (!window.jspdf || !window.jspdf.jsPDF || !window.html2canvas) return;

        var rows = collectRows(lesson);
        var container = buildContainer(lesson, rows);
        var doc = new window.jspdf.jsPDF({ unit: "pt", format: "a4" });

        doc.html(container, {
            margin: [36, 36, 36, 36],
            autoPaging: "text",
            width: 523,
            windowWidth: 760,
            html2canvas: { scale: 0.75 },
            callback: function (doc) {
                var totalPages = doc.internal.getNumberOfPages();
                for (var i = 1; i <= totalPages; i++) {
                    doc.setPage(i);
                    stampWatermark(doc);
                }
                doc.save("neko-bunko-" + (lesson.id || "lesson") + ".pdf");
                document.body.removeChild(container);
            }
        });
    }

    window.exportLessonPdf = exportLessonPdf;
})();
