"use strict";

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