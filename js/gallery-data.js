"use strict";

const PX = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`;

Object.assign(UI.ru, {
    navGallery: "Галерея",
    galTitle: "Галерея",
    galLead: "Выберите зал, чтобы посмотреть фотографии",
    galBack: "На главную",
    galAll: "Все залы",
    galHint: "Коснитесь фото, чтобы рассмотреть его. Коснитесь ещё раз, чтобы продолжить.",
    galCount: "{n} фото",
});

Object.assign(UI.ky, {
    navGallery: "Галерея",
    galTitle: "Галерея",
    galLead: "Сүрөттөрдү көрүү үчүн залды тандаңыз",
    galBack: "Башкы бетке",
    galAll: "Бардык залдар",
    galHint: "Сүрөттү чоңойтуу үчүн тийиңиз. Улантуу үчүн кайра тийиңиз.",
    galCount: "{n} сүрөт",
});

Object.assign(UI.en, {
    navGallery: "Gallery",
    galTitle: "Gallery",
    galLead: "Choose a hall to browse the photos",
    galBack: "Back to home",
    galAll: "All halls",
    galHint: "Tap a photo to take a closer look. Tap again to continue.",
    galCount: "{n} photos",
});

const GALLERY = [
    {
        id: "restaurant",
        title: { ru: "Ресторан", ky: "Ресторан", en: "Restaurant" },
        text: {
            ru: "Уютный зал, где приятно отдохнуть после парной",
            ky: "Паредөн кийин эс алууга ыңгайлуу жайлуу зал",
            en: "A cozy hall to relax after the steam room",
        },
        photos: [31071253, 17205673, 11794317, 30027297, 10135116, 17056975, 12688961, 2566030].map(PX),
    },
    {
        id: "pool",
        title: { ru: "Бассейн", ky: "Бассейн", en: "Pool" },
        text: {
            ru: "Чистая вода, комфортная температура и зона отдыха",
            ky: "Таза суу, ыңгайлуу температура жана эс алуу зонасы",
            en: "Clean water, comfortable temperature and a lounge area",
        },
        photos: [261323, 6667475, 39200992, 10231663, 8028466, 19155159, 19073612].map(PX),
    },
    {
        id: "steam",
        title: { ru: "Парилки", ky: "Бууканалар", en: "Steam rooms" },
        text: {
            ru: "Русская и индивидуальная парные",
            ky: "Орус жана жекече бууканалар",
            en: "Russian and private steam rooms",
        },
        photos: [7587477, 7587466, 8092430, 25084818, 23330922, 36177119, 35495086, 5582215].map(PX),
    },
    {
        id: "hammam",
        title: { ru: "Хаммам", ky: "Хаммам", en: "Hammam" },
        text: {
            ru: "Тёплый пар, мягкий свет и спокойствие",
            ky: "Жылуу буу, жумшак жарык жана тынчтык",
            en: "Warm steam, soft light and calm",
        },
        photos: [7598363, 7598359, 19980238, 36077580, 7587816, 36420274, 18408806, 19955732].map(PX),
    },
    {
        id: "massage",
        title: { ru: "Массаж", ky: "Массаж", en: "Massage" },
        text: {
            ru: "Массажные комнаты для полного расслабления",
            ky: "Толук эс алуу үчүн массаж бөлмөлөрү",
            en: "Massage rooms for complete relaxation",
        },
        photos: [6628520, 7789646, 36837604, 35495081, 6560308, 6628473, 9146378, 4599377].map(PX),
    },
];