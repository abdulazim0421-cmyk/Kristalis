"use strict";

(() => {
    const root = document.documentElement;
    const FS_KEY = "kr-fs";

    const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
    const canFs = () => !!(root.requestFullscreen || root.webkitRequestFullscreen);

    const getFlag = () => {
        try {
            return sessionStorage.getItem(FS_KEY) === "1";
        } catch (e) {
            return false;
        }
    };

    const setFlag = (v) => {
        try {
            sessionStorage.setItem(FS_KEY, v ? "1" : "0");
        } catch (e) {}
    };

    const kiosk = () => isFs() || getFlag();
    const swallow = (p) => {
        if (p && p.catch)
            p.catch(() => {});
    };

    function enterFs() {
        if (!canFs() || isFs())
            return;
        try {
            swallow((root.requestFullscreen || root.webkitRequestFullscreen).call(root));
        } catch (e) {}
    }

    function exitFs() {
        if (!isFs())
            return;
        try {
            swallow((document.exitFullscreen || document.webkitExitFullscreen).call(document));
        } catch (e) {}
    }

    ["gesturestart", "gesturechange", "gestureend"].forEach(name => {
        document.addEventListener(name, (e) => e.preventDefault(), { passive: false });
    });

    window.addEventListener("wheel", (e) => {
        if (e.ctrlKey)
            e.preventDefault();
    }, { passive: false });

    window.addEventListener("keydown", (e) => {
        const key = e.key || "";
        const low = key.toLowerCase();
        const mod = e.ctrlKey || e.metaKey;
        if (mod && ["+", "-", "=", "_", "0"].includes(key)) {
            e.preventDefault();
            return;
        }
        if (!kiosk())
            return;
        if (key === "F12" || (mod && ["u", "s", "p"].includes(low)) || (mod && e.shiftKey && ["i", "j", "c"].includes(low)))
            e.preventDefault();
    });

    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("dragstart", (e) => e.preventDefault());

    window.addEventListener("click", (e) => {
        const a = e.target.closest && e.target.closest('a[href^="tel:"]');
        if (a && kiosk())
            e.preventDefault();
    }, true);

    window.addEventListener("pointerdown", (e) => {
        if (canFs() && e.target.closest && e.target.closest(".brand"))
            e.stopPropagation();
    }, true);

    window.addEventListener("click", (e) => {
        if (!canFs() || !(e.target.closest && e.target.closest(".brand")))
            return;
        e.preventDefault();
        e.stopPropagation();
        if (isFs()) {
            setFlag(false);
            exitFs();
        } else {
            setFlag(true);
            enterFs();
        }
    }, true);

    const restore = (e) => {
        if (!getFlag() || isFs() || !canFs())
            return;
        if (e.target.closest && e.target.closest(".brand"))
            return;
        enterFs();
    };

    ["pointerup", "touchend", "click"].forEach(name => {
        window.addEventListener(name, restore, { capture: true, passive: true });
    });

    if (navigator.storage && navigator.storage.persist)
        navigator.storage.persist().catch(() => {});
})();

(() => {
    const root = document.documentElement;
    const IDLE_MS = 120000;
    const CHECK_MS = 5000;
    const UPDATE_MS = 3600000;
    const WATCH_FIRST_MS = 30000;
    const WATCH_MS = 600000;
    const MAX_UPTIME_MS = 6 * 3600000;
    const HOME = new URL("./", location.href).pathname;
    const WATCH = [
        "index.html",
        "css/style.css",
        "css/extra.css",
        "css/rules.css",
        "css/gallery.css",
        "css/herocards.css",
        "css/perf.css",
        "js/data.js",
        "js/gallery-data.js",
        "js/data-extra.js",
        "js/app.js",
        "js/rules.js",
        "js/gallery.js",
        "js/boot.js",
    ];

    const bootAt = Date.now();
    let lastTouch = Date.now();
    let dirty = false;
    let updateReady = false;
    let signature = "";
    let checking = false;
    let hadController = "serviceWorker" in navigator && !!navigator.serviceWorker.controller;

    if ("scrollRestoration" in history)
        history.scrollRestoration = "manual";

    const q = (s) => document.querySelector(s);

    function canReload() {
        return navigator.onLine || !!(navigator.serviceWorker && navigator.serviceWorker.controller);
    }

    function hardReload() {
        try {
            sessionStorage.removeItem("kr-lang");
            sessionStorage.removeItem("kr-rules");
        } catch (e) {}
        location.replace(HOME);
    }

    function softReset() {
        const over = q(".pover.is-open");
        if (over)
            over.click();
        const burger = q("#burger.is-open");
        if (burger)
            burger.click();
        const menu = q("#lang.is-open #lang-btn");
        if (menu)
            menu.click();
        try {
            sessionStorage.removeItem("kr-lang");
        } catch (e) {}
        const ru = q('#lang [data-lang="ru"]');
        if (ru && root.lang !== "ru")
            ru.click();
        const male = q('#services .gender [data-g="m"]');
        if (male)
            male.click();
        const first = q("#tabs [data-fsec]");
        if (first)
            first.click();
        document.dispatchEvent(new Event("kr:reset"));
        window.scrollTo({ left: 0, top: 0, behavior: "instant" });
    }

    const mark = () => {
        lastTouch = Date.now();
        dirty = true;
    };

    ["pointerdown", "touchstart", "keydown", "wheel"].forEach(name => {
        window.addEventListener(name, mark, { passive: true, capture: true });
    });

    setInterval(() => {
        if (Date.now() - lastTouch <= IDLE_MS)
            return;
        if ((updateReady || Date.now() - bootAt > MAX_UPTIME_MS) && canReload()) {
            hardReload();
            return;
        }
        if (dirty) {
            dirty = false;
            softReset();
        }
    }, CHECK_MS);

    async function readSignature() {
        let h = 5381;
        for (const url of WATCH) {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok)
                return "";
            const text = await res.text();
            for (let i = 0; i < text.length; i++)
                h = ((h * 33) ^ text.charCodeAt(i)) | 0;
        }
        return String(h);
    }

    async function checkUpdate() {
        if (checking || updateReady || !navigator.onLine)
            return;
        checking = true;
        try {
            const sig = await readSignature();
            if (sig) {
                if (!signature)
                    signature = sig;
                else if (sig !== signature)
                    updateReady = true;
            }
        } catch (e) {
        } finally {
            checking = false;
        }
    }

    setTimeout(checkUpdate, WATCH_FIRST_MS);
    setInterval(checkUpdate, WATCH_MS);
    window.addEventListener("online", () => setTimeout(checkUpdate, 5000));

    function warm() {
        const urls = [];
        try {
            if (typeof GALLERY !== "undefined")
                GALLERY.forEach(c => c.photos.forEach(u => urls.push(u)));
            if (typeof PHOTOS !== "undefined")
                Object.keys(PHOTOS).forEach(k => PHOTOS[k].forEach(u => urls.push(u)));
        } catch (e) {
            return;
        }
        const queue = Array.from(new Set(urls));
        const next = () => {
            if (!queue.length)
                return;
            if (!navigator.onLine || document.hidden) {
                setTimeout(next, 30000);
                return;
            }
            const im = new Image();
            im.decoding = "async";
            const done = () => {
                im.onload = null;
                im.onerror = null;
                setTimeout(next, 700);
            };
            im.onload = done;
            im.onerror = done;
            im.src = queue.shift();
        };
        setTimeout(next, 15000);
    }

    window.addEventListener("load", warm);

    if (!("serviceWorker" in navigator))
        return;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (hadController)
            updateReady = true;
        hadController = true;
    });

    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
            .then(reg => {
                setInterval(() => reg.update().catch(() => {}), UPDATE_MS);
            })
            .catch(() => {});
    });
})();