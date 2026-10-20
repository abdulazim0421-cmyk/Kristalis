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

    const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

    function softReset() {
        try {
            sessionStorage.removeItem("kr-lang");
        } catch (e) {}
        const ru = document.querySelector('#lang [data-lang="ru"]');
        if (ru && document.documentElement.lang !== "ru")
            ru.click();
        const male = document.querySelector('#services .gender [data-g="m"]');
        if (male)
            male.click();
        document.dispatchEvent(new Event("kr:reset"));
        window.scrollTo({ left: 0, top: 0, behavior: "instant" });
    }

    function resetKiosk() {
        if (isFs() && !updateReady) {
            softReset();
            dirty = false;
            return;
        }
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