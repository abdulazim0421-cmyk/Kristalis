"use strict";

(() => {
    const root = document.documentElement;
    let frame = null;

    const style = document.createElement("style");
    style.textContent =
        ".gal-frame{position:fixed;inset:0;width:100%;height:100%;border:0;z-index:200;background:#120a05;opacity:0;transition:opacity .3s ease}" +
        ".gal-frame.is-open{opacity:1}";
    document.head.appendChild(style);

    function openGallery() {
        if (frame)
            return;
        frame = document.createElement("iframe");
        frame.className = "gal-frame";
        frame.src = "gallery.html";
        frame.setAttribute("title", "Gallery");
        document.body.appendChild(frame);
        root.classList.add("no-scroll");
        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (frame)
                frame.classList.add("is-open");
        }));
    }

    function syncLang() {
        let v = null;
        try {
            v = sessionStorage.getItem("kr-lang");
        } catch (e) {}
        if (!v || v === root.lang)
            return;
        const btn = document.querySelector(`#lang [data-lang="${v}"]`);
        if (btn)
            btn.click();
    }

    function closeGallery() {
        if (!frame)
            return;
        const f = frame;
        frame = null;
        f.classList.remove("is-open");
        root.classList.remove("no-scroll");
        syncLang();
        setTimeout(() => f.remove(), 350);
    }

    document.addEventListener("click", (e) => {
        const a = e.target.closest ? e.target.closest('a[href="gallery.html"]') : null;
        if (!a)
            return;
        let ok = false;
        try {
            ok = sessionStorage.getItem("kr-rules") === "1";
        } catch (err) {}
        if (!ok)
            return;
        e.preventDefault();
        openGallery();
    }, true);

    window.addEventListener("message", (e) => {
        if (e.origin !== location.origin)
            return;
        const d = e.data || {};
        if (d.kr === "close-gallery")
            closeGallery();
        if (d.kr === "activity")
            window.dispatchEvent(new Event("pointerdown"));
    });
})();