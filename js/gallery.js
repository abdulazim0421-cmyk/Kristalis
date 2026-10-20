"use strict";

(() => {
    const root = document.documentElement;

    function must(selector) {
        const el = document.querySelector(selector);
        if (!el)
            throw new Error(`Element not found: ${selector}`);
        return el;
    }

    const SPEEDS = [34, 46, 40];
    const DIRS = ['normal', 'reverse', 'normal'];

    let lang = (() => {
        try {
            const v = sessionStorage.getItem('kr-lang');
            return v && UI[v] ? v : 'ru';
        } catch (e) {
            return 'ru';
        }
    })();

    const t = (key) => UI[lang][key];
    const tr = (obj) => obj[lang] || obj.ru;
    const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const head = must('#head');
    const home = must('#gal-home');
    const view = must('#gal-view');
    const catsBox = must('#gal-cats');
    const chips = must('#gal-chips');
    const rowsBox = must('#gal-rows');
    const nameEl = must('#gal-name');
    const countEl = must('#gal-count');
    const langBox = must('#lang');
    const langBtn = must('#lang-btn');

    let current = null;
    let sel = null;

    const byId = (id) => GALLERY.find(c => c.id === id);

    function swap(el) {
        el.classList.remove('is-swap');
        void el.offsetWidth;
        el.classList.add('is-swap');
    }

    function setLangMenu(open) {
        langBox.classList.toggle('is-open', open);
        langBtn.setAttribute('aria-expanded', String(open));
    }

    function applyStatic() {
        root.lang = lang;
        document.title = `${t('galTitle')} — ${t('brand')}`;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = t(el.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            el.setAttribute('aria-label', t(el.dataset.i18nAria));
        });
        document.querySelectorAll('[data-lang]').forEach(b => {
            b.classList.toggle('is-active', b.dataset.lang === lang);
        });
    }

    const countText = (cat) => t('galCount').replace('{n}', cat.photos.length);

    function renderCats() {
        catsBox.innerHTML = GALLERY.map((cat, i) => `
  <button type="button" class="gal-cat" data-cat="${esc(cat.id)}" style="--d:${i * 70}ms">
    <span class="gal-cat__img"><img src="${esc(cat.photos[0])}" alt="" decoding="async"></span>
    <span class="gal-cat__body">
      <span class="gal-cat__name">${esc(tr(cat.title))}</span>
      <span class="gal-cat__text">${esc(tr(cat.text))}</span>
      <span class="gal-cat__count">${esc(countText(cat))}</span>
    </span>
  </button>`).join('');
    }

    function renderHead() {
        const cat = byId(current);
        if (!cat)
            return;
        nameEl.textContent = tr(cat.title);
        countEl.textContent = countText(cat);
        chips.innerHTML = GALLERY.map(c =>
            `<button type="button" class="gal-chip${c.id === current ? ' is-on' : ''}" data-cat="${esc(c.id)}" aria-pressed="${c.id === current}">${esc(tr(c.title))}</button>`
        ).join('');
        const label = tr(cat.title);
        rowsBox.querySelectorAll('.gal-card').forEach(card => card.setAttribute('aria-label', label));
    }

    function order(photos, r) {
        const n = photos.length;
        const shift = Math.floor((n * r) / 3);
        const rot = photos.slice(shift).concat(photos.slice(0, shift));
        return r === 1 ? rot.slice().reverse() : rot;
    }

    function cardsHtml(items, label) {
        return items.map(src =>
            `<button type="button" class="gal-card" aria-label="${label}"><img src="${esc(src)}" alt="" draggable="false" decoding="async"></button>`
        ).join('');
    }

    function fillRow(row, items, r, cat) {
        const track = row.querySelector('.gal-track');
        const once = cardsHtml(items, esc(tr(cat.title)));
        track.innerHTML = once;
        const setW = track.getBoundingClientRect().width || 1;
        const copies = Math.max(1, Math.ceil((row.clientWidth * 2.2) / setW));
        const group = once.repeat(copies);
        track.innerHTML = group + group;
        const groupW = track.getBoundingClientRect().width / 2;
        const dur = Math.max(20, groupW / SPEEDS[r]);
        row.style.setProperty('--dur', dur.toFixed(1) + 's');
        row.style.setProperty('--dir', DIRS[r]);
        row.style.setProperty('--delay', '-' + (Math.random() * dur).toFixed(1) + 's');
    }

    function renderRows(cat) {
        rowsBox.innerHTML = '';
        for (let r = 0; r < 3; r++) {
            const row = document.createElement('div');
            row.className = 'gal-row';
            row.innerHTML = '<div class="gal-shift"><div class="gal-track"></div></div>';
            rowsBox.appendChild(row);
            fillRow(row, order(cat.photos, r), r, cat);
        }
    }

    function shiftOf(el) {
        const m = getComputedStyle(el).transform;
        if (!m || m === 'none')
            return 0;
        return new DOMMatrixReadOnly(m).m41;
    }

    function release() {
        if (!sel)
            return;
        const { row, card, shift } = sel;
        row.classList.remove('is-paused', 'has-active');
        card.classList.remove('is-active');
        shift.style.transform = '';
        sel = null;
    }

    function select(card) {
        release();
        const row = card.closest('.gal-row');
        const shift = row.querySelector('.gal-shift');
        const base = shiftOf(shift);
        const rr = row.getBoundingClientRect();
        const cr = card.getBoundingClientRect();
        const dx = base + (rr.left + rr.width / 2) - (cr.left + cr.width / 2);
        row.classList.add('is-paused', 'has-active');
        card.classList.add('is-active');
        shift.style.transform = `translate3d(${dx.toFixed(1)}px, 0, 0)`;
        sel = { row, card, shift };
    }

    function scrollTop() {
        window.scrollTo({ left: 0, top: 0, behavior: 'instant' });
    }

    function openCat(id) {
        const cat = byId(id);
        if (!cat)
            return;
        release();
        current = id;
        home.hidden = true;
        view.hidden = false;
        renderRows(cat);
        renderHead();
        swap(view);
        scrollTop();
    }

    function showHome() {
        release();
        current = null;
        rowsBox.innerHTML = '';
        view.hidden = true;
        home.hidden = false;
        swap(home);
        scrollTop();
    }

    catsBox.addEventListener('click', (e) => {
        const b = e.target.closest('[data-cat]');
        if (b)
            openCat(b.dataset.cat);
    });

    chips.addEventListener('click', (e) => {
        const b = e.target.closest('[data-cat]');
        if (b && b.dataset.cat !== current)
            openCat(b.dataset.cat);
    });

    must('#gal-all').addEventListener('click', showHome);

    rowsBox.addEventListener('click', (e) => {
        const card = e.target.closest('.gal-card');
        if (!card)
            return;
        e.stopPropagation();
        if (sel && sel.card === card)
            release();
        else
            select(card);
    });

    view.addEventListener('click', (e) => {
        if (!e.target.closest('.gal-card, .gal-chips, .gal-all'))
            release();
    });

    rowsBox.addEventListener('load', (e) => {
        if (e.target.tagName === 'IMG')
            e.target.classList.add('is-loaded');
    }, true);

    rowsBox.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG')
            e.target.remove();
    }, true);

    catsBox.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG')
            e.target.remove();
    }, true);

    document.addEventListener('contextmenu', (e) => e.preventDefault());

    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setLangMenu(!langBox.classList.contains('is-open'));
    });

    document.addEventListener('click', (e) => {
        const b = e.target.closest('[data-lang]');
        if (b) {
            setLang(b.dataset.lang);
            setLangMenu(false);
            return;
        }
        if (!e.target.closest('#lang'))
            setLangMenu(false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape')
            return;
        release();
        setLangMenu(false);
    });

    function setLang(l) {
        if (l === lang || !UI[l])
            return;
        lang = l;
        try {
            sessionStorage.setItem('kr-lang', l);
        } catch (e) {}
        applyStatic();
        renderCats();
        renderHead();
    }

    let lastW = window.innerWidth;
    let resizeTimer = 0;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth === lastW)
                return;
            lastW = window.innerWidth;
            const cat = byId(current);
            if (!cat)
                return;
            release();
            renderRows(cat);
            renderHead();
        }, 200);
    });

    let ticking = false;
    function onScrollFrame() {
        ticking = false;
        if (window.scrollX !== 0)
            window.scrollTo({ left: 0, top: window.scrollY, behavior: 'instant' });
        head.classList.toggle('is-scrolled', window.scrollY > 40);
    }

    window.addEventListener('scroll', () => {
        if (ticking)
            return;
        ticking = true;
        requestAnimationFrame(onScrollFrame);
    }, { passive: true });

    applyStatic();
    renderCats();
    onScrollFrame();

    const hash = location.hash.slice(1);
    if (byId(hash))
        openCat(hash);
})();