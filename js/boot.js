"use strict";

(() => {
    const block = (e) => e.preventDefault();

    ["gesturestart", "gesturechange", "gestureend"].forEach(name => {
        document.addEventListener(name, block, { passive: false });
    });

    ["touchstart", "touchmove"].forEach(name => {
        document.addEventListener(name, (e) => {
            if (e.touches.length > 1)
                e.preventDefault();
        }, { passive: false });
    });

    window.addEventListener("wheel", (e) => {
        if (e.ctrlKey)
            e.preventDefault();
    }, { passive: false });

    window.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && ["+", "-", "=", "_", "0"].includes(e.key))
            e.preventDefault();
    });
})();

(() => {
    if (window.self !== window.top) {
        ["pointerdown", "touchstart", "keydown", "scroll"].forEach(name => {
            window.addEventListener(name, () => {
                window.parent.postMessage({ kr: "activity" }, location.origin);
            }, { passive: true, capture: true });
        });
        return;
    }

    const IDLE_MS = 120000;
    const CHECK_MS = 5000;
    const UPDATE_MS = 3600000;
    const HOME = new URL("./", location.href).pathname;

    let lastTouch = Date.now();
    let dirty = false;
    let updateReady = false;
    let hadController = "serviceWorker" in navigator && !!navigator.serviceWorker.controller;

    if ("scrollRestoration" in history)
        history.scrollRestoration = "manual";

    function resetKiosk() {
        try {
            sessionStorage.removeItem("kr-lang");
            sessionStorage.removeItem("kr-rules");
        } catch (e) {}
        location.replace(HOME);
    }

    ["pointerdown", "touchstart", "keydown", "scroll"].forEach(name => {
        window.addEventListener(name, () => {
            lastTouch = Date.now();
            dirty = true;
        }, { passive: true, capture: true });
    });

    setInterval(() => {
        if ((dirty || updateReady) && Date.now() - lastTouch > IDLE_MS)
            resetKiosk();
    }, CHECK_MS);

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