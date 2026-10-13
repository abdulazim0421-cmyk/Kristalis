"use strict";
const SERVICES = [
    { id: 'russian', tag: 'Парная', title: 'Русская баня на дровах', from: '3 500', unit: '/час', text: 'Классический влажный пар, берёзовые дрова и аромат дерева.',
        time: '60–120 минут · до 8 человек', inc: ['Парная на дровах', 'Комната отдыха с душем', 'Простыни и тапочки', 'Травяной чай'],
        ben: 'Прогревает мышцы, улучшает кровообращение, снимает усталость и укрепляет иммунитет.',
        how: 'Заходим 2–3 раза по 5–10 минут, между заходами — душ или купель и отдых с чаем.', warn: 'Гипертония, болезни сердца, острые воспаления, беременность — только после консультации с врачом.' },
    { id: 'finnish', tag: 'Парная', title: 'Финская сауна', from: '2 500', unit: '/час', text: 'Сухой жар 80–100 °C, светлое дерево и тишина.',
        time: '60–120 минут · до 6 человек', inc: ['Сауна с каменкой', 'Душ и комната отдыха', 'Простыни', 'Чай и вода'],
        ben: 'Глубоко расслабляет, очищает кожу через пот, помогает при напряжении в спине.',
        how: 'Заходов 2–3 по 8–12 минут. Для мягкого пара можно плеснуть воды на камни.', warn: 'Нельзя при высокой температуре, повышенном давлении и острых болезнях сердца.' },
    { id: 'hammam', tag: 'Парная', title: 'Хаммам', from: '3 000', unit: '/час', text: 'Тёплый мрамор, густой пар и восточный ритуал.',
        time: '60–120 минут · до 6 человек', inc: ['Парная 40–50 °C', 'Мраморная лежанка', 'Душ и комната отдыха', 'Мыло и мочалка'],
        ben: 'Мягкий пар раскрывает поры, увлажняет кожу и расслабляет без нагрузки на сердце.',
        how: 'Лежим на тёплом мраморе 15–20 минут, затем пилинг, мыльный массаж и ополаскивание.', warn: 'Кожные инфекции и острые воспалительные процессы — противопоказания.' },
    { id: 'veniki', tag: 'Процедура', title: 'Парение с веником', from: '1 500', unit: '/сеанс', text: 'Мастер-парильщик с берёзовым, дубовым или эвкалиптовым веником.',
        time: '30–40 минут · 1 человек', inc: ['Услуги парильщика', 'Веник по выбору', 'Ароматические масла', 'Накидка из льна'],
        ben: 'Мягкий массаж листьями прогревает глубокие слои, снимает зажимы и тонизирует кожу.',
        how: 'Начинаем с прогрева, затем «поглаживание», «накрывание» и лёгкое хлопанье по телу.', warn: 'Не рекомендуется при высоком давлении, ожогах и открытых ранах.' },
    { id: 'massage', tag: 'Массаж', title: 'Массаж', from: '2 000', unit: '/час', text: 'Классический, расслабляющий, антицеллюлитный и спортивный.',
        time: '30–90 минут · 1 человек', inc: ['Консультация мастера', 'Профессиональные масла', 'Чистое бельё', 'Чай после сеанса'],
        ben: 'Снимает мышечные блоки, улучшает осанку, лимфоток и качество сна.',
        how: 'Мастер подбирает технику, обсуждает зоны напряжения и работает в комфортной для вас силе.', warn: 'Температура, варикоз, онкология и травмы — только по согласованию с врачом.' },
    { id: 'peeling', tag: 'Уход', title: 'Пилинг и скрабы', from: '1 200', unit: '/процедура', text: 'Кофейный, солевой, медовый скрабы и грязевые обёртывания.',
        time: '30–45 минут · 1 человек', inc: ['Скраб на выбор', 'Обёртывание', 'Душ', 'Увлажняющий крем'],
        ben: 'Удаляет ороговевшие клетки, выравнивает тон кожи и делает её гладкой и шелковистой.',
        how: 'После прогрева в парной наносим скраб массирующими движениями, затем смываем и наносим крем.', warn: 'Не делается при раздражении, ожогах и аллергии на компоненты.' },
    { id: 'salt', tag: 'Релакс', title: 'Соляная комната', from: '800', unit: '/сеанс', text: 'Галотерапия: воздух с мелкодисперсной солью и мягкий свет.',
        time: '30–45 минут · до 4 человек', inc: ['Сеанс галотерапии', 'Шезлонги', 'Релакс-музыка'],
        ben: 'Очищает дыхательные пути, помогает при аллергии, улучшает сон и настроение.',
        how: 'Сидим или лежим в спокойной атмосфере и дышим солевым воздухом без нагрузки на организм.', warn: 'Острые респираторные инфекции и повышенная температура.' },
    { id: 'pool', tag: 'Релакс', title: 'Бассейн и купель', from: '600', unit: '/час', text: 'Прохладная купель и тёплый бассейн для контраста.',
        time: '30–60 минут · до 8 человек', inc: ['Купель с прохладной водой', 'Бассейн', 'Душ и полотенце'],
        ben: 'Закаляет, тонизирует сосуды и дарит заряд бодрости после жара.',
        how: 'Погружайтесь на 10–30 секунд после парной, затем отдых 5–10 минут.', warn: 'Заболевания сердца и сосудов — консультация врача обязательна.' },
];
const PRICES = {
    'Парные': [['Русская баня на дровах', '3 500 сом/час'], ['Финская сауна', '2 500 сом/час'], ['Хаммам', '3 000 сом/час'], ['Баня + хаммам (комбо)', '5 000 сом/час'], ['Дополнительный час', '−10% от тарифа'], ['Каждый человек сверх нормы', '+300 сом']],
    'Парение': [['Берёзовый веник', '1 500 сом'], ['Дубовый веник', '1 700 сом'], ['Эвкалиптовый веник', '1 800 сом'], ['Парение VIP (2 мастера)', '3 000 сом']],
    'Массаж': [['Классический, 30 мин', '1 200 сом'], ['Классический, 60 мин', '2 000 сом'], ['Антицеллюлитный, 60 мин', '2 400 сом'], ['Спортивный, 60 мин', '2 400 сом'], ['Расслабляющий, 90 мин', '3 200 сом'], ['Вакуумный, 45 мин', '1 800 сом']],
    'Пилинг и спа': [['Кофейный скраб', '1 200 сом'], ['Солевой скраб', '1 200 сом'], ['Медовое обёртывание', '1 800 сом'], ['Грязевое обёртывание', '2 000 сом'], ['Спа-программа «Кристалис»', '4 500 сом']],
    'Релакс': [['Соляная комната, 30 мин', '800 сом'], ['Бассейн / купель', '600 сом/час'], ['Травяной чай (чайник)', '300 сом'], ['Аренда простыни / халата', '150 сом']],
};
/* Фото для блоков услуг. Положите свои фото в папку img/ и укажите путь, например 'img/russian.jpg'.
   Если фото нет — блок покажет деревянную текстуру. */
const IMAGES = {
    russian: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=70',
    finnish: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=70',
    hammam: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1000&q=70',
    veniki: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1000&q=70',
};
function must(selector) {
    const el = document.querySelector(selector);
    if (!el)
        throw new Error(`Element not found: ${selector}`);
    return el;
}
/* ---------- Услуги ---------- */
const list = must('#svc-list');
const renderService = (s, i) => {
    const img = IMAGES[s.id] ? ` style="--img:url('${IMAGES[s.id]}')"` : '';
    return `
  <article class="svc reveal${i % 2 ? ' svc--rev' : ''}" id="${s.id}">
    <div class="svc__text">
      <p class="svc__tag">${s.tag}</p>
      <h3 class="svc__title">${s.title}</h3>
      <p class="svc__lead">${s.text}</p>
      <p class="svc__meta">${s.time}</p>
      <p class="svc__price">от ${s.from} сом <span>${s.unit}</span></p>
      <button class="svc__btn" type="button" aria-expanded="false" aria-controls="m-${s.id}">Подробнее о процедуре</button>
      <div class="svc__more" id="m-${s.id}"><div class="svc__more-inner">
        <div class="info"><h4>Что входит</h4><ul>${s.inc.map(x => `<li>${x}</li>`).join('')}</ul></div>
        <div class="info"><h4>Польза</h4><p>${s.ben}</p></div>
        <div class="info"><h4>Как проходит</h4><p>${s.how}</p></div>
        <div class="info"><h4>Противопоказания</h4><p>${s.warn}</p></div>
      </div></div>
    </div>
    <div class="svc__img"${img}><span>0${i + 1}</span></div>
  </article>`;
};
list.innerHTML = SERVICES.map(renderService).join('');
list.addEventListener('click', (e) => {
    const btn = e.target.closest('.svc__btn');
    const item = btn?.closest('.svc');
    if (!btn || !item)
        return;
    const open = item.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Скрыть' : 'Подробнее о процедуре';
});
/* ---------- Прайс ---------- */
const tabs = must('#tabs');
const price = must('#price');
const groups = Object.keys(PRICES);
function showTab(group) {
    tabs.querySelectorAll('button').forEach(b => {
        const active = b.dataset.k === group;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
    });
    const rows = PRICES[group] ?? [];
    price.innerHTML = `<ul class="price__list">${rows
        .map(([name, cost], i) => `<li style="--d:${i * 50}ms"><span>${name}</span><i></i><b>${cost}</b></li>`)
        .join('')}</ul>`;
}
tabs.innerHTML = groups.map(k => `<button type="button" role="tab" data-k="${k}">${k}</button>`).join('');
tabs.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b?.dataset.k)
        showTab(b.dataset.k);
});
showTab(groups[0]);
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
    if (e.target.matches('a')) {
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
/* ---------- Появление при прокрутке ---------- */
const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- Банный веник: SVG рисуется программно ---------- */
(function buildBroom() {
    const svg = document.getElementById('broom');
    if (!svg) return;

    let seed = 7; // фиксированное зерно — веник всегда выглядит одинаково
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    const palette = ['#24603b', '#2c6e44', '#357f50', '#3f9160', '#4aa56f', '#5bb683'];
    const CX = 180;      // ось веника
    const HEAD_Y = 150;  // где прутья выходят из перевязки

    let twigs = '';
    const angles = [];
    for (let a = -46; a <= 46; a += 5.75) angles.push(a);
    angles.sort((a, b) => Math.abs(b) - Math.abs(a)); // дальние ветки рисуем первыми

    angles.forEach(deg => {
        const rad = (deg * Math.PI) / 180;
        const len = 235 - Math.abs(deg) * 1.6 + rnd() * 30;
        const x2 = CX + Math.sin(rad) * len;
        const y2 = HEAD_Y + Math.cos(rad) * len;
        const cx = CX + Math.sin(rad) * len * 0.5 + (rnd() - 0.5) * 18;
        const cy = HEAD_Y + Math.cos(rad) * len * 0.5;
        const shade = Math.abs(deg) < 20 ? 2 : 0;           // центр светлее, края темнее

        let leaves = '';
        for (let k = 0; k < 5; k++) {
            const t = 0.32 + k * 0.15 + rnd() * 0.04;
            const px = (1 - t) ** 2 * CX + 2 * (1 - t) * t * cx + t * t * x2;
            const py = (1 - t) ** 2 * HEAD_Y + 2 * (1 - t) * t * cy + t * t * y2;
            [-1, 1].forEach(side => {
                const rot = -deg + side * (38 + rnd() * 28);
                const scale = 0.85 + rnd() * 0.5;
                const color = palette[Math.floor(rnd() * 4) + shade];
                leaves += `<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${rot.toFixed(0)}) scale(${scale.toFixed(2)})"><use href="#leaf" fill="${color}"/></g>`;
            });
        }
        leaves += `<g transform="translate(${x2.toFixed(1)} ${y2.toFixed(1)}) rotate(${(-deg).toFixed(0)}) scale(1.15)"><use href="#leaf" fill="${palette[3 + (shade ? 1 : 0)]}"/></g>`;

        twigs += `<g class="twig" style="animation-delay:${(-rnd() * 3).toFixed(2)}s">` +
            `<path d="M${CX} ${HEAD_Y}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="#6b4a2b" stroke-width="2.4" stroke-linecap="round"/>` +
            leaves + `</g>`;
    });

    svg.innerHTML = `
    <defs>
      <g id="leaf">
        <path d="M0 0C10 7 13 22 0 42C-13 22-10 7 0 0Z"/>
        <path d="M0 3V34" stroke="rgba(255,255,255,.28)" stroke-width="1" fill="none"/>
      </g>
      <linearGradient id="bundle" x1="0" x2="1">
        <stop offset="0" stop-color="#7a5230"/><stop offset=".5" stop-color="#a7743f"/><stop offset="1" stop-color="#6b4526"/>
      </linearGradient>
    </defs>
    <g class="broom__swing">
      <g class="broom__head">${twigs}</g>
      <path d="M180 0V44" stroke="#d9c9a8" stroke-width="3"/>
      <circle cx="180" cy="46" r="7" fill="none" stroke="#d9c9a8" stroke-width="3"/>
      <path d="M169 52h22l5 100h-32z" fill="url(#bundle)"/>
      <g fill="#d8b46a">
        <rect x="167" y="78" width="26" height="7" rx="3"/>
        <rect x="166" y="108" width="28" height="7" rx="3"/>
        <rect x="165" y="138" width="30" height="8" rx="3"/>
      </g>
    </g>`;
})();