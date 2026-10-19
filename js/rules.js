"use strict";

(() => {
    const KEY = 'kr-rules-v1';
    const root = document.documentElement;

    const T = {
        ru: {
            link: 'Правила',
            title: 'Правила посещения',
            sub: 'Прочитайте, пожалуйста, перед выбором услуг. Это займёт минуту.',
            close: 'Закрыть',
            check: 'Я прочитал(а) правила и согласен(на)',
            ok: 'Ознакомился',
            depth: 'Глубина бассейна',
            depthVal: '1,5 м',
            secs: [
                {
                    h: 'Парилка, бассейн и джакузи',
                    depth: true,
                    items: [
                        ['do', 'Перед входом в парилку снимайте обувь'],
                        ['no', 'В парилке нельзя париться веником'],
                        ['do', 'В парилку, бассейн и джакузи заходите только в одноразовом белье'],
                        ['no', 'Ходить в собственном нижнем белье строго запрещено'],
                        ['no', 'Стеклянную посуду нельзя ни приносить, ни использовать'],
                        ['no', 'В зоне бассейна нельзя пользоваться мылом и другими моющими средствами'],
                        ['do', 'Перед бассейном и джакузи примите душ, особенно после парилки'],
                    ],
                },
                {
                    h: 'В помывочной',
                    items: [
                        ['no', 'Не берите с собой стеклянную посуду'],
                        ['no', 'Не пользуйтесь одноразовыми бритвами'],
                        ['no', 'Не стригите ногти'],
                        ['do', 'Следите за своими вещами'],
                    ],
                },
                {
                    h: 'Раздевалка и личные вещи',
                    items: [
                        ['do', 'Не оставляйте без присмотра телефоны, кошельки, сумки и другие ценные вещи'],
                        ['no', 'Фото- и видеосъёмка запрещена'],
                        ['info', 'За утерянные вещи администрация ответственности не несёт'],
                    ],
                },
                {
                    h: '2 этаж и ресторан',
                    items: [
                        ['do', 'Пока вы на 2 этаже, ходите в халате'],
                        ['no', 'В ресторан без халата входить нельзя'],
                    ],
                },
            ],
            info: {
                restaurant: 'Ресторан',
                hours: 'Режим работы',
                kitchen: 'Работа кухни',
                robe: 'В ресторан — только в халате',
                floors: 'Этажи',
                floorList: [
                    ['2 этаж', 'Парикмахерская, ногтевой сервис, кабинет косметолога, массажные комнаты, солевая комната, ресторан'],
                    ['1 этаж', 'Раздевалка, помывочная, хаммам'],
                    ['−1 этаж', 'Русская парная, индивидуальная парная, бассейн, джакузи, пилинг'],
                ],
                rules: 'Правила посещения',
                rulesText: 'Коротко о главном: парилка, бассейн, раздевалка и личные вещи.',
                rulesBtn: 'Открыть правила',
            },
        },
        ky: {
            link: 'Эрежелер',
            title: 'Келүү эрежелери',
            sub: 'Кызматтарды тандаардан мурун окуп чыгыңыз. Бир мүнөт алат.',
            close: 'Жабуу',
            check: 'Эрежелерди окудум жана макулмун',
            ok: 'Таанышып чыктым',
            depth: 'Бассейндин тереңдиги',
            depthVal: '1,5 м',
            secs: [
                {
                    h: 'Буукана, бассейн жана джакузи',
                    depth: true,
                    items: [
                        ['do', 'Бууканага кирерде бут кийимиңизди чечиңиз'],
                        ['no', 'Бууканада шыпыргы колдонбоңуз'],
                        ['do', 'Буукана, бассейн жана джакузиге бир жолу кийилүүчү ич кийим менен гана кириңиз'],
                        ['no', 'Өзүңүздүн ич кийим менен жүрүүгө катуу тыюу салынат'],
                        ['no', 'Айнек идишти алып кирүүгө да, колдонууга да болбойт'],
                        ['no', 'Бассейндин аймагында самын жана башка жуучу каражаттарды колдонууга болбойт'],
                        ['do', 'Бассейнге жана джакузиге кирерден мурун, айрыкча паредөн кийин, душка түшүңүз'],
                    ],
                },
                {
                    h: 'Жуунуучу бөлмөдө',
                    items: [
                        ['no', 'Айнек идиш алып кирбеңиз'],
                        ['no', 'Бир жолу колдонулуучу устара колдонбоңуз'],
                        ['no', 'Тырмак албаңыз'],
                        ['do', 'Жеке буюмдарыңызга көз салыңыз'],
                    ],
                },
                {
                    h: 'Чечинүүчү жай жана жеке буюмдар',
                    items: [
                        ['do', 'Телефон, капчык, баштык жана башка баалуу буюмдарды кароосуз калтырбаңыз'],
                        ['no', 'Сүрөткө жана видеого тартууга тыюу салынат'],
                        ['info', 'Жоголгон буюмдар үчүн администрация жооп бербейт'],
                    ],
                },
                {
                    h: '2-кабат жана ресторан',
                    items: [
                        ['do', '2-кабатта жүргөндө халат кийиңиз'],
                        ['no', 'Ресторанга халатсыз кирүүгө болбойт'],
                    ],
                },
            ],
            info: {
                restaurant: 'Ресторан',
                hours: 'Иштөө убактысы',
                kitchen: 'Ашкананын иштөөсү',
                robe: 'Ресторанга халат менен гана',
                floors: 'Кабаттар',
                floorList: [
                    ['2-кабат', 'Чач тарач, тырмак боюнча кызмат, косметолог кабинети, массаж бөлмөлөрү, туз бөлмөсү, ресторан'],
                    ['1-кабат', 'Чечинип-кийинүүчү жай, жуунуучу бөлмө, хаммам'],
                    ['−1-кабат', 'Орус бууканасы, жекече буукана, бассейн, джакузи, пилинг'],
                ],
                rules: 'Келүү эрежелери',
                rulesText: 'Кыскача эң маанилүүсү: буукана, бассейн, чечинүүчү жай жана жеке буюмдар.',
                rulesBtn: 'Эрежелерди ачуу',
            },
        },
        en: {
            link: 'Rules',
            title: 'Visitor rules',
            sub: 'Please read before choosing services. It takes a minute.',
            close: 'Close',
            check: 'I have read the rules and agree',
            ok: 'I have read it',
            depth: 'Pool depth',
            depthVal: '1.5 m',
            secs: [
                {
                    h: 'Steam room, pool and jacuzzi',
                    depth: true,
                    items: [
                        ['do', 'Take off your shoes before entering the steam room'],
                        ['no', 'Do not use a bath broom in the steam room'],
                        ['do', 'Enter the steam room, pool and jacuzzi only in disposable underwear'],
                        ['no', 'Wearing your own underwear is strictly prohibited'],
                        ['no', 'Glass containers may not be brought in or used'],
                        ['no', 'Do not use soap or other washing products in the pool area'],
                        ['do', 'Shower before the pool and jacuzzi, especially after the steam room'],
                    ],
                },
                {
                    h: 'In the washing room',
                    items: [
                        ['no', 'Do not bring glass containers'],
                        ['no', 'Do not use disposable razors'],
                        ['no', 'Do not trim your nails'],
                        ['do', 'Keep an eye on your belongings'],
                    ],
                },
                {
                    h: 'Changing room and belongings',
                    items: [
                        ['do', 'Do not leave phones, wallets, bags or other valuables unattended'],
                        ['no', 'Photo and video recording is prohibited'],
                        ['info', 'The administration is not responsible for lost items'],
                    ],
                },
                {
                    h: '2nd floor and restaurant',
                    items: [
                        ['do', 'Wear a robe while you are on the 2nd floor'],
                        ['no', 'Entering the restaurant without a robe is not allowed'],
                    ],
                },
            ],
            info: {
                restaurant: 'Restaurant',
                hours: 'Opening hours',
                kitchen: 'Kitchen hours',
                robe: 'Robe required in the restaurant',
                floors: 'Floors',
                floorList: [
                    ['2nd floor', 'Hairdresser, nail service, cosmetologist, massage rooms, salt room, restaurant'],
                    ['1st floor', 'Changing room, washing room, hammam'],
                    ['−1 floor', 'Russian steam room, private steam room, pool, jacuzzi, peeling'],
                ],
                rules: 'Visitor rules',
                rulesText: 'The essentials: steam room, pool, changing room and your belongings.',
                rulesBtn: 'Open the rules',
            },
        },
    };

    const cur = () => (T[root.lang] ? root.lang : 'ru');
    const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    let okMem = false;
    let pending = null;
    let lastFocus = null;

    const isOk = () => {
        if (okMem)
            return true;
        try {
            return sessionStorage.getItem(KEY) === '1';
        } catch (e) {
            return false;
        }
    };

    const setOk = () => {
        okMem = true;
        try {
            sessionStorage.setItem(KEY, '1');
        } catch (e) {}
    };

    const LOGO =
        '<svg class="rm__logo" width="52" height="52" viewBox="0 0 48 48" aria-hidden="true">'
        + '<defs><linearGradient id="kr-gold-rm" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="48" y2="48">'
        + '<stop offset="0" stop-color="#c9904a"/><stop offset="0.35" stop-color="#fff1cf"/><stop offset="0.65" stop-color="#f0c27a"/><stop offset="1" stop-color="#c9904a"/>'
        + '</linearGradient></defs>'
        + '<circle cx="24" cy="24" r="22.5" fill="none" stroke="url(#kr-gold-rm)" stroke-width="1.1"/>'
        + '<g fill="url(#kr-gold-rm)" stroke="url(#kr-gold-rm)" stroke-linecap="round" stroke-linejoin="round">'
        + '<path d="M23.2 14.2L26.4 14.9L21.3 30.2L18.3 30.2Z" stroke-width="0.6"/>'
        + '<path d="M16.6 30.9C19.2 30.5 21.8 30.5 24 30.1" fill="none" stroke-width="1.3"/>'
        + '<path d="M24.8 14.4C21.2 12.1 15.6 12.2 12.4 15.2C10.7 16.9 11 20.3 13 21.9C15 23.4 17.4 22.6 17.9 20.9" fill="none" stroke-width="1.9"/>'
        + '<circle cx="17.8" cy="20.3" r="1.2" stroke="none"/>'
        + '<path d="M25 21.4C28 18.6 31 14.6 33.2 13C34.6 12 36.6 11.8 37.4 12.9C36.1 13 34.7 13.6 33.7 15C31.1 18.3 28.5 20.7 25.2 21.7Z" stroke-width="0.5"/>'
        + '<path d="M25.3 21.5C27.5 22.7 28.9 24.6 29.3 27.6C29.7 31.2 31.4 34.1 34 34.3C35.6 34.4 37.1 33.4 37.2 31.8C37.3 30.4 36.2 29.7 35.4 30.3C34.9 30.8 35.1 31.5 35.7 31.7C35.4 32.7 34.2 33.2 33.2 32.6C31.3 31.4 30.7 28.6 30.4 26.3C30 23.9 28.4 22.1 25.3 21.5Z" stroke-width="0.5"/>'
        + '</g></svg>';

    const modal = document.createElement('div');
    modal.className = 'rm';
    modal.id = 'rules-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'rm-title');
    modal.innerHTML =
        '<div class="rm__box" tabindex="-1">'
        + '<div class="rm__top">'
        + LOGO
        + '<div class="rm__head"><h2 class="rm__title" id="rm-title"></h2><p class="rm__sub"></p></div>'
        + '<button type="button" class="rm__x" data-rm-close><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>'
        + '<div class="rm__langs" role="group">'
        + '<button type="button" data-lang="ru">Русский</button>'
        + '<button type="button" data-lang="ky">Кыргызча</button>'
        + '<button type="button" data-lang="en">English</button>'
        + '</div>'
        + '</div>'
        + '<div class="rm__body"></div>'
        + '<div class="rm__foot">'
        + '<label class="rm__check"><input type="checkbox"><span class="rm__mark"></span><span class="rm__ctext"></span></label>'
        + '<button type="button" class="rm__ok" disabled></button>'
        + '</div>'
        + '</div>';
    document.body.appendChild(modal);

    const box = modal.querySelector('.rm__box');
    const body = modal.querySelector('.rm__body');
    const chk = modal.querySelector('input');
    const okBtn = modal.querySelector('.rm__ok');

    const info = document.createElement('div');
    info.className = 'kinfo';
    const pricesWrap = document.querySelector('#prices .wrap');
    if (pricesWrap)
        pricesWrap.appendChild(info);

    document.querySelectorAll('.nav, .mnav').forEach(n => {
        const a = document.createElement('a');
        a.href = '#rules';
        a.className = 'rm-link';
        a.setAttribute('data-rules-open', '');
        n.insertBefore(a, n.querySelector('a[href^="tel"]'));
    });

    function renderModal() {
        const t = T[cur()];
        modal.querySelector('.rm__title').textContent = t.title;
        modal.querySelector('.rm__sub').textContent = t.sub;
        modal.querySelector('.rm__x').setAttribute('aria-label', t.close);
        modal.querySelector('.rm__ctext').textContent = t.check;
        okBtn.textContent = t.ok;
        body.innerHTML = t.secs.map(s => {
            const depth = s.depth
                ? `<div class="rm__depth"><span>${esc(t.depth)}</span><b>${esc(t.depthVal)}</b></div>`
                : '';
            const items = s.items.map(i => `<li class="is-${i[0]}">${esc(i[1])}</li>`).join('');
            return `<section class="rm__sec"><h3>${esc(s.h)}</h3><ul class="rm__list">${items}</ul>${depth}</section>`;
        }).join('');
    }

    function renderInfo() {
        const i = T[cur()].info;
        info.innerHTML =
            '<div class="kinfo__card">'
            + `<h3>${esc(i.restaurant)}</h3>`
            + `<div class="kinfo__row"><span>${esc(i.hours)}</span><b>8:00 – 23:00</b></div>`
            + `<div class="kinfo__row"><span>${esc(i.kitchen)}</span><b>9:00 – 22:00</b></div>`
            + `<p class="kinfo__note">${esc(i.robe)}</p>`
            + '</div>'
            + '<div class="kinfo__card">'
            + `<h3>${esc(i.floors)}</h3>`
            + i.floorList.map(f => `<p class="kinfo__floor"><b>${esc(f[0])}</b><span>${esc(f[1])}</span></p>`).join('')
            + '</div>'
            + '<div class="kinfo__card kinfo__card--rules">'
            + `<h3>${esc(i.rules)}</h3>`
            + `<p class="kinfo__text">${esc(i.rulesText)}</p>`
            + `<button type="button" class="kinfo__btn" data-rules-open>${esc(i.rulesBtn)}</button>`
            + '</div>';
    }

    function renderAll() {
        renderModal();
        renderInfo();
        const t = T[cur()];
        document.querySelectorAll('.rm-link').forEach(a => {
            a.textContent = t.link;
        });
    }

    function open() {
        lastFocus = document.activeElement;
        chk.checked = false;
        okBtn.disabled = true;
        renderAll();
        body.scrollTop = 0;
        modal.classList.add('is-open');
        root.classList.add('no-scroll');
        box.focus({ preventScroll: true });
    }

    function close() {
        modal.classList.remove('is-open');
        if (!document.querySelector('.pside.is-open'))
            root.classList.remove('no-scroll');
        pending = null;
        if (lastFocus && lastFocus.focus)
            lastFocus.focus({ preventScroll: true });
    }

    chk.addEventListener('change', () => {
        okBtn.disabled = !chk.checked;
    });

    okBtn.addEventListener('click', () => {
        if (!chk.checked)
            return;
        setOk();
        const next = pending;
        close();
        if (next)
            setTimeout(() => next.click(), 280);
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-rules-open]')) {
            e.preventDefault();
            pending = null;
            open();
            return;
        }
        if (e.target === modal || e.target.closest('[data-rm-close]'))
            close();
    });

    document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-g]');
        if (!el || isOk())
            return;
        e.preventDefault();
        e.stopPropagation();
        open();
        pending = el;
    }, true);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open'))
            close();
    });

    new MutationObserver(renderAll).observe(root, { attributes: true, attributeFilter: ['lang'] });

    renderAll();
})();