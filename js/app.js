"use strict";

function must(selector) {
    const el = document.querySelector(selector);
    if (!el)
        throw new Error(`Element not found: ${selector}`);
    return el;
}

const ICONS = {
    paren: '<path d="M12 52C12 28 28 12 52 12c0 24-16 40-40 40zM12 52 36 28"/>',
    massage: '<ellipse cx="32" cy="46" rx="18" ry="7"/><ellipse cx="32" cy="32" rx="13" ry="6"/><ellipse cx="32" cy="20" rx="8" ry="5"/>',
    body: '<path d="M32 10C22 24 16 32 16 40a16 16 0 0 0 32 0c0-8-6-16-16-30z"/>',
    face: '<path d="M32 8c-10 0-16 8-16 18s6 22 16 28c10-6 16-18 16-28S42 8 32 8z"/><path d="M24 28h4M36 28h4M26 40c3 3 9 3 12 0"/>',
    depil: '<path d="M32 8l5 19 19 5-19 5-5 19-5-19-19-5 19-5z"/>',
    hair: '<circle cx="18" cy="18" r="7"/><circle cx="18" cy="46" r="7"/><path d="M23 22l29 22M23 42l29-22"/>',
    nails: '<path d="M32 8l20 14-20 34L12 22z"/><path d="M12 22h40M24 22l8 34 8-34M32 8l-8 14M32 8l8 14"/>',
};

const MAX_SHOWN = 8;

let lang = 'ru';
const state = { g: 'm', section: null, group: null };

const t = (key) => UI[lang][key];
const tr = (obj) => obj[lang] || obj.ru;
const nameOf = (it) => (lang === 'en' ? it[4] || it[0] : lang === 'ky' ? it[5] || it[0] : it[0]);

const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
const esc = (s) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const plural = (n, one, few, many) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
};

function priceText(item) {
    const n = item[6] ? `${fmt(item[1])}\u00A0\u2013\u00A0${fmt(item[6])}` : fmt(item[1]);
    const from = item[3] && !item[6];
    if (lang === 'ky')
        return `${n}\u00A0${from ? 'сомдон' : 'сом'}`;
    if (lang === 'en')
        return `${from ? 'from\u00A0' : ''}${n}\u00A0som`;
    return `${from ? 'от\u00A0' : ''}${n}\u00A0сом`;
}

function countText(n) {
    if (lang === 'en')
        return `${n} ${n === 1 ? 'service' : 'services'}`;
    if (lang === 'ky')
        return `${n} кызмат`;
    return `${n} ${plural(n, 'услуга', 'услуги', 'услуг')}`;
}

function view(g) {
    const male = g === 'm';
    return SECTIONS.map(s => {
        const groups = s.groups
            .map(gr => ({ title: gr.title ? tr(gr.title) : '', items: gr.items.filter(it => it[2].includes(g)) }))
            .filter(gr => gr.items.length);
        const text = male && s.textM ? s.textM : s.text;
        return {
            id: s.id,
            priceOnly: !!s.priceOnly,
            groups,
            title: tr(male && s.titleM ? s.titleM : s.title),
            text: text ? tr(text) : '',
            note: s.note ? tr(s.note) : '',
        };
    }).filter(s => s.groups.length);
}

function pickShown(s) {
    const all = s.groups.flatMap(gr => gr.items);
    if (all.length <= MAX_SHOWN)
        return all;
    const lists = s.groups.map(gr => gr.items.slice());
    const out = [];
    while (out.length < MAX_SHOWN) {
        let added = false;
        for (const l of lists) {
            if (l.length && out.length < MAX_SHOWN) {
                out.push(l.shift());
                added = true;
            }
        }
        if (!added)
            break;
    }
    return out;
}

const list = must('#svc-list');

function renderService(s, i) {
    const total = s.groups.reduce((n, gr) => n + gr.items.length, 0);
    const shown = pickShown(s);
    const rest = total - shown.length;
    const names = shown.map(it => `<li>${esc(nameOf(it))}</li>`).join('');
    return `
  <article class="svc reveal${i % 2 ? ' svc--rev' : ''}" id="${s.id}">
    <div class="svc__text">
      <p class="svc__tag">${countText(total)}</p>
      <h3 class="svc__title">${s.title}</h3>
      <p class="svc__lead">${s.text}</p>
      <div class="info">
        <h4>${t('included')}</h4>
        <ul class="info__list">${names}</ul>
        ${rest > 0 ? `<p class="info__rest">${t('more').replace('{n}', rest)}</p>` : ''}
      </div>
      ${s.note ? `<div class="info"><h4>${t('important')}</h4><p>${s.note}</p></div>` : ''}
      <button class="svc__link" type="button" data-go="${s.id}">${t('fullPrice')}</button>
    </div>
    <div class="svc__img" data-id="${s.id}">
      <svg viewBox="0 0 64 64" aria-hidden="true">${ICONS[s.id] || ''}</svg>
      <div class="svc__slides"></div>
    </div>
  </article>`;
}

const photoCache = new Map();
const slideTimers = [];

function probe(url) {
    if (!photoCache.has(url)) {
        photoCache.set(url, new Promise(resolve => {
            const im = new Image();
            im.onload = () => resolve(url);
            im.onerror = () => resolve(null);
            im.src = url;
        }));
    }
    return photoCache.get(url);
}

function startSlides() {
    slideTimers.splice(0).forEach(clearInterval);
    list.querySelectorAll('.svc__img').forEach((card, i) => {
        const urls = PHOTOS[card.dataset.id] || [];
        Promise.all(urls.map(probe)).then(all => {
            const ok = all.filter(Boolean);
            if (!ok.length || !card.isConnected)
                return;
            const box = card.querySelector('.svc__slides');
            ok.forEach(url => {
                const d = document.createElement('div');
                d.className = 'slide';
                d.style.backgroundImage = `url("${url}")`;
                box.appendChild(d);
            });
            const slides = box.children;
            slides[0].classList.add('is-on');
            if (slides.length < 2)
                return;
            let n = 0;
            slideTimers.push(setInterval(() => {
                slides[n].classList.remove('is-on');
                n = (n + 1) % slides.length;
                slides[n].classList.add('is-on');
            }, 6000 + (i % 4) * 1000));
        });
    });
}

const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

function swapAnim(el) {
    el.classList.remove('is-swap');
    void el.offsetWidth;
    el.classList.add('is-swap');
}

let firstRender = true;
function renderServices() {
    list.innerHTML = view(state.g).filter(s => !s.priceOnly).map(renderService).join('');
    if (firstRender) {
        list.querySelectorAll('.reveal').forEach(el => io.observe(el));
    } else {
        list.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in'));
        swapAnim(list);
    }
    firstRender = false;
    startSlides();
}

/* ---------- Прайс: фильтр слева, цены справа ---------- */

const tabs = must('#tabs');
const price = must('#price');

// Оборачиваем фильтр и прайс в двухколоночный блок (HTML менять не нужно)
const pl = document.createElement('div');
pl.className = 'pl';
tabs.parentNode.insertBefore(pl, tabs);
tabs.className = 'pside';
tabs.removeAttribute('role');
pl.append(tabs, price);
price.classList.add('pmain');

const HEADER_GAP = 90;
const MOBILE = 900;
let panelOpen = false;

const FT = {
    ru: { filter: 'Фильтр', sections: 'Раздел', services: 'Услуги', extra: 'Кухня, бар, магазин', all: 'Все категории' },
    ky: { filter: 'Чыпка', sections: 'Бөлүм', services: 'Кызматтар', extra: 'Ашкана, бар, дүкөн', all: 'Бардык категориялар' },
    en: { filter: 'Filter', sections: 'Section', services: 'Services', extra: 'Kitchen, bar, shop', all: 'All categories' },
};
const ft = (k) => FT[lang][k];

function scrollToPrices() {
    const top = must('#prices .title').getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

// если верх прайса ушёл выше экрана, подтягиваем к нему
function keepInView() {
    const top = pl.getBoundingClientRect().top;
    if (top < HEADER_GAP - 20)
        window.scrollTo({ top: Math.max(0, top + window.scrollY - HEADER_GAP), behavior: 'smooth' });
}

function fitPrices() {
    const card = price.querySelector('.price__card');
    if (!card)
        return;
    card.classList.remove('is-compact');
    card.style.columnCount = '';
    if (card.dataset.big) {
        card.classList.add('is-compact');
        if (window.innerWidth >= 1280)
            card.style.columnCount = 2;
    }
}

list.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (!go)
        return;
    state.section = go.dataset.go;
    state.group = null;
    renderPrices();
    scrollToPrices();
});

const rowHtml = (it, i) => `<li style="--d:${Math.min(i, 8) * 40}ms"><span>${esc(nameOf(it))}</span><i></i><b>${priceText(it)}</b></li>`;

function groupHtml(gr) {
    return `${gr.title ? `<h4 class="price__group">${gr.title}</h4>` : ''}<ul class="price__list">${gr.items.map(rowHtml).join('')}</ul>`;
}

const ICON_FILTER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

function opt(attr, val, text, on, cls = '') {
    return `<button type="button" class="fopt${on ? ' is-on' : ''}${cls ? ' ' + cls : ''}" ${attr}="${val}"><span class="fopt__mark"></span><span>${text}</span></button>`;
}

function renderSide(secs, cur) {
    const sec = (s) => {
        const on = s.id === cur.id;
        let html = opt('data-fsec', s.id, s.title, on);
        if (on && s.priceOnly && s.groups.length > 1) {
            html += `<div class="fcats">`
                + opt('data-fgrp', '', ft('all'), state.group === null, 'fopt--sub')
                + s.groups.map((gr, i) => opt('data-fgrp', i, gr.title, state.group === i, 'fopt--sub')).join('')
                + `</div>`;
        }
        return html;
    };

    const main = secs.filter(s => !s.priceOnly);
    const extra = secs.filter(s => s.priceOnly);

    tabs.innerHTML =
        `<button type="button" class="pside__toggle${panelOpen ? ' is-open' : ''}" data-ftoggle aria-expanded="${panelOpen}">`
        + `${ICON_FILTER}<span>${ft('filter')}: ${cur.title}</span><i class="pside__arrow"></i></button>`
        + `<div class="pside__panel${panelOpen ? ' is-open' : ''}">`
        + (main.length ? `<p class="fsub">${ft('services')}</p>${main.map(sec).join('')}` : '')
        + (extra.length ? `<p class="fsub">${ft('extra')}</p>${extra.map(sec).join('')}` : '')
        + `</div>`;
}

tabs.addEventListener('click', (e) => {
    if (e.target.closest('[data-ftoggle]')) {
        panelOpen = !panelOpen;
        return renderPrices(true);
    }

    const sec = e.target.closest('[data-fsec]');
    if (sec) {
        if (sec.dataset.fsec === state.section && state.group === null)
            return;
        const next = view(state.g).find(s => s.id === sec.dataset.fsec);
        state.section = sec.dataset.fsec;
        state.group = null;
        // на телефоне: у раздела без категорий сразу закрываем панель
        if (window.innerWidth < MAX_MOBILE() && !(next && next.priceOnly && next.groups.length > 1))
            panelOpen = false;
        renderPrices();
        keepInView();
        return;
    }

    const grp = e.target.closest('[data-fgrp]');
    if (grp) {
        state.group = grp.dataset.fgrp === '' ? null : Number(grp.dataset.fgrp);
        if (window.innerWidth < MAX_MOBILE())
            panelOpen = false;
        renderPrices();
        keepInView();
    }
});

function MAX_MOBILE() { return MOBILE; }

function renderPrices(keepAnim) {
    const secs = view(state.g);
    if (!secs.some(s => s.id === state.section)) {
        state.section = secs[0].id;
        state.group = null;
    }
    const s = secs.find(x => x.id === state.section);
    if (state.group !== null && !s.groups[state.group])
        state.group = null;

    renderSide(secs, s);
    if (keepAnim === true)
        return;

    const groups = state.group === null ? s.groups : [s.groups[state.group]];
    const big = s.priceOnly && groups.length > 1;
    price.innerHTML = `<div class="price__card"${big ? ' data-big="1"' : ''}>${groups.map(groupHtml).join('')}</div>`;
    swapAnim(price);
    fitPrices();
}

/* ---------- Язык, пол, меню ---------- */

function applyStatic() {
    document.documentElement.lang = lang;
    document.title = t('docTitle');
    must('meta[name="description"]').setAttribute('content', t('metaDesc'));
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

function setLang(l) {
    if (l === lang)
        return;
    lang = l;
    applyStatic();
    renderServices();
    renderPrices();
}

document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lang]');
    if (b)
        setLang(b.dataset.lang);
});

function setGender(g, rerender = true) {
    state.g = g;
    state.group = null;
    document.querySelectorAll('.gender button').forEach(b => {
        const on = b.dataset.g === g;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
    });
    if (rerender) {
        renderServices();
        renderPrices();
    }
}

document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-g]');
    if (!el || el.dataset.g === state.g)
        return;

    const inPage = !!el.closest('.gender');
    const inPrices = !!el.closest('#prices');
    const before = inPage ? el.getBoundingClientRect().top : 0;

    setGender(el.dataset.g);

    if (inPage) {
        const delta = el.getBoundingClientRect().top - before;
        if (delta !== 0)
            window.scrollTo({ top: window.scrollY + delta, behavior: 'instant' });
    }

    if (inPrices) {
        fitPrices();
        scrollToPrices();
    }
});

setGender(state.g, false);
applyStatic();
renderServices();
renderPrices();

let resizeTimer = 0;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitPrices, 150);
});
if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(fitPrices);
window.addEventListener('load', fitPrices);

const burger = must('#burger');
const nav = must('#nav');
const head = must('#head');
const toTop = must('#to-top');
burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
    }
});
const onScroll = () => {
    head.classList.toggle('is-scrolled', window.scrollY > 40);
    toTop.classList.toggle('is-visible', window.scrollY > 600);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

document.querySelectorAll('.reveal').forEach(el => {
    if (!list.contains(el))
        io.observe(el);
});

(function buildMotes() {
    const box = document.querySelector('.motes');
    if (!box) return;
    for (let i = 0; i < 14; i++) {
        const mote = document.createElement('i');
        mote.style.cssText =
            `left:${(Math.random() * 100).toFixed(1)}%;` +
            `--s:${(2 + Math.random() * 3).toFixed(1)}px;` +
            `--t:${(14 + Math.random() * 14).toFixed(1)}s;` +
            `--d:${(-Math.random() * 24).toFixed(1)}s;` +
            `--dx:${((Math.random() - 0.5) * 120).toFixed(0)}px`;
        box.appendChild(mote);
    }
})();