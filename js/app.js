"use strict";
/* Данные (SECTIONS, IMAGES) лежат в js/data.js */

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

const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
const priceText = (item) => `${item[3] ? 'от\u00A0' : ''}${fmt(item[1])}\u00A0сом`;
const esc = (s) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const plural = (n, one, few, many) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
};

/* ---------- Состояние ---------- */
const state = { g: 'm', section: null };

/* Разделы и услуги с учётом выбранного пола */
function view(g) {
    return SECTIONS.map(s => {
        const groups = s.groups
            .map(gr => ({ title: gr.title, items: gr.items.filter(it => it[2].includes(g)) }))
            .filter(gr => gr.items.length);
        return { ...s, groups, title: g === 'm' && s.titleM ? s.titleM : s.title,
            text: g === 'm' && s.textM ? s.textM : s.text };
    }).filter(s => s.groups.length);
}

/* Что показать в блоке «Что входит»: все услуги, а если их много — по очереди из каждой группы */
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

/* ---------- Услуги (карточки) ---------- */
const list = must('#svc-list');

function renderService(s, i) {
    const total = s.groups.reduce((n, gr) => n + gr.items.length, 0);
    const shown = pickShown(s);
    const rest = total - shown.length;
    const img = s.img && IMAGES[s.img] ? ` style="--img:url('${IMAGES[s.img]}')"` : '';
    const names = shown.map(it => `<li>${esc(it[0])}</li>`).join('');
    return `
  <article class="svc reveal${i % 2 ? ' svc--rev' : ''}" id="${s.id}">
    <div class="svc__text">
      <p class="svc__tag">${total} ${plural(total, 'услуга', 'услуги', 'услуг')}</p>
      <h3 class="svc__title">${s.title}</h3>
      <p class="svc__lead">${s.text}</p>
      <div class="info">
        <h4>Что входит</h4>
        <ul class="info__list">${names}</ul>
        ${rest > 0 ? `<p class="info__rest">и ещё ${rest} в прайсе</p>` : ''}
      </div>
      ${s.note ? `<div class="info"><h4>Важно</h4><p>${s.note}</p></div>` : ''}
      <button class="svc__link" type="button" data-go="${s.id}">Весь прайс раздела</button>
    </div>
    <div class="svc__img"${img}>
      <svg viewBox="0 0 64 64" aria-hidden="true">${ICONS[s.id] || ''}</svg>
      <span>0${i + 1}</span>
    </div>
  </article>`;
}

/* ---------- Появление при прокрутке ---------- */
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
    list.innerHTML = view(state.g).map(renderService).join('');
    if (firstRender) {
        list.querySelectorAll('.reveal').forEach(el => io.observe(el));
    } else {
        list.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in'));
        swapAnim(list);
    }
    firstRender = false;
}

list.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (!go)
        return;
    state.section = go.dataset.go;
    renderPrices();
    must('#prices').scrollIntoView({ behavior: 'smooth' });
});

/* ---------- Прайс ---------- */
const tabs = must('#tabs');
const price = must('#price');

const rowHtml = (it, i) => `<li style="--d:${Math.min(i, 8) * 40}ms"><span>${esc(it[0])}</span><i></i><b>${priceText(it)}</b></li>`;

function groupHtml(gr) {
    return `${gr.title ? `<h4 class="price__group">${gr.title}</h4>` : ''}<ul class="price__list">${gr.items.map(rowHtml).join('')}</ul>`;
}

function renderPrices() {
    const secs = view(state.g);
    if (!secs.some(s => s.id === state.section))
        state.section = secs[0].id;

    tabs.innerHTML = secs.map(s =>
        `<button type="button" role="tab" data-k="${s.id}" class="${s.id === state.section ? 'is-active' : ''}" aria-selected="${s.id === state.section}">${s.title}</button>`).join('');

    const s = secs.find(x => x.id === state.section);
    price.innerHTML = `<div class="price__card">${s.groups.map(groupHtml).join('')}</div>`;
    swapAnim(price);
}

tabs.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b?.dataset.k) {
        state.section = b.dataset.k;
        renderPrices();
    }
});

/* ---------- Мужской / женский ---------- */
function setGender(g, rerender = true) {
    state.g = g;
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
    if (el && el.dataset.g !== state.g)
        setGender(el.dataset.g);
});

setGender(state.g, false);
renderServices();
renderPrices();

/* ---------- Шапка, меню, кнопка вверх ---------- */
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

/* ---------- Пылинки в тёплом свете на главном экране ---------- */
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