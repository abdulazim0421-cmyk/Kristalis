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
    if (!("serviceWorker" in navigator))
        return;

    const IDLE_MS = 120000;
    const UPDATE_MS = 3600000;
    let lastTouch = Date.now();
    let reloadWanted = false;
    let hadController = !!navigator.serviceWorker.controller;

    ["pointerdown", "keydown", "scroll"].forEach(name => {
        window.addEventListener(name, () => {
            lastTouch = Date.now();
        }, { passive: true, capture: true });
    });

    setInterval(() => {
        if (reloadWanted && Date.now() - lastTouch > IDLE_MS)
            location.reload();
    }, 10000);

    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (hadController)
            reloadWanted = true;
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