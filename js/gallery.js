"use strict";

(() => {
    const root = document.documentElement;
    const box = document.getElementById('galx');
    if (!box)
        return;

    const q = (s) => box.querySelector(s);
    const scroller = q('#galx-scroll');
    const home = q('#gal-home');
    const view = q('#gal-view');
    const catsBox = q('#gal-cats');
    const chips = q('#gal-chips');
    const rowsBox = q('#gal-rows');
    const nameEl = q('#gal-name');
    const countEl = q('#gal-count');
    const langBox = q('.lang');
    const langBtn = q('.lang__btn');

    const SPEEDS = [34, 46, 40];
    const DIRS = ['normal', 'reverse', 'normal'];

    const lg = () => (UI[root.lang] ? root.lang : 'ru');
    const t = (key) => UI[lg()][key];
    const tr = (obj) => obj[lg()] || obj.ru;
    const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const byId = (id) => GALLERY.find(c => c.id === id);

    let current = null;
    let sel = null;
    let isOpen = false;
    let closeTimer = 0;

    function swap(el) {
        el.classList.remove('is-swap');
        void el.offsetWidth;
        el.classList.add('is-swap');
    }

    function setLangMenu(open) {
        langBox.classList.toggle('is-open', open);
        langBtn.setAttribute('aria-expanded', String(open));
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
        scroller.scrollTo({ left: 0, top: 0, behavior: 'instant' });
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

    function openGallery() {
        if (isOpen)
            return;
        isOpen = true;
        clearTimeout(closeTimer);
        box.hidden = false;
        box.setAttribute('aria-hidden', 'false');
        root.classList.add('no-scroll');
        showHome();
        void box.offsetWidth;
        box.classList.add('is-open');
    }

    function closeGallery() {
        if (!isOpen)
            return;
        isOpen = false;
        release();
        setLangMenu(false);
        box.classList.remove('is-open');
        root.classList.remove('no-scroll');
        clearTimeout(closeTimer);
        closeTimer = setTimeout(() => {
            box.hidden = true;
            box.setAttribute('aria-hidden', 'true');
            rowsBox.innerHTML = '';
            current = null;
        }, 320);
    }

    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href="#gallery"]');
        if (!a)
            return;
        e.preventDefault();
        openGallery();
    });

    document.addEventListener('kr:reset', closeGallery);

    q('.galx__brand').addEventListener('click', closeGallery);
    q('.gal-back').addEventListener('click', closeGallery);

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

    q('#gal-all').addEventListener('click', showHome);

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

    box.addEventListener('contextmenu', (e) => e.preventDefault());

    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setLangMenu(!langBox.classList.contains('is-open'));
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-lang]') || !e.target.closest('.galx .lang'))
            setLangMenu(false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape')
            return;
        release();
        setLangMenu(false);
    });

    new MutationObserver(() => {
        renderCats();
        if (current)
            renderHead();
    }).observe(root, { attributes: true, attributeFilter: ['lang'] });

    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    let resizeTimer = 0;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const changed = w !== lastW || Math.abs(h - lastH) > 80;
            lastW = w;
            lastH = h;
            if (!changed || !isOpen)
                return;
            const cat = byId(current);
            if (!cat)
                return;
            release();
            renderRows(cat);
            renderHead();
        }, 200);
    });

    renderCats();
})();