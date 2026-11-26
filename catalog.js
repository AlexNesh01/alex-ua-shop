/* Shared catalog for the ALEX.UA digital storefront.
   The storefront (app.js) and the admin panel (admin.js) read and write the same data
   through window.VibeCatalog. Defaults live here; edits made in admin.html live in localStorage. */
(function (global) {
  const KEY = 'vibe-digital-catalog-v3';
  const DEMO_NAME = 'ALEX.UA';
  const DEMO_SUB = 'DIGITAL MARKET';
  const DEMO_RATE = 45.1;
  const DEMO_STORE = 'https://844129289197.blacksea.in.ua/';
  const CATEGORIES = ['Книги', 'Приложения', 'Планеры', 'Шаблоны'];
  const CURRENCIES = ['UAH', 'USD'];
  const BADGE_STYLES = { '': 'Обычный', new: 'Новинка', sale: 'Скидка' };

  /* Every product links to its real page and checkout on BlackSea,
     where payment and file delivery actually happen. */
  const DEMO_PRODUCTS = [
    {
      id: 'olzb',
      name: 'Планер 2027',
      category: 'Планеры',
      type: 'Цифровой планер',
      format: 'ZIP · PDF + Word',
      price: 6.5,
      currency: 'USD',
      priceLabel: '',
      badge: 'ХИТ ПРОДАЖ',
      badgeClass: '',
      image: 'assets/products/olzb.jpg',
      caption: 'Год, месяц, неделя и день — в одном файле',
      description: 'Обзор года, месячные календари, недельное планирование, ежедневное расписание, трекеры привычек, страницы для целей и финансов. Редактируемый файл Word: можно вписать свои планы и подстроить страницы под себя.',
      compatibility: 'Word / PDF · печать или планшет',
      newest: 9,
      link: 'https://844129289197.blacksea.in.ua/l/olzb',
      checkout: 'https://844129289197.blacksea.in.ua/checkout?product=olzb&quantity=1'
    },
    {
      id: 'lhm',
      name: 'Планнер на 30 дней',
      category: 'Приложения',
      type: 'Веб-приложение',
      format: 'Браузер, без установки',
      price: 13,
      currency: 'USD',
      priceLabel: '',
      badge: '',
      badgeClass: '',
      image: 'assets/products/lhm.jpg',
      caption: 'Задачи, тренировки, вода, замеры и дневник',
      description: 'План на 30 дней с полным текстом книги по каждому дню, задания дня с автоматическим прогрессом, тренировки с дозировкой, таймер отдыха, счётчик воды, замеры и график изменений, дневник настроения. Светлая и тёмная тема, резервная копия прогресса одним кодом.',
      compatibility: 'Телефон, планшет, ПК',
      newest: 8,
      link: 'https://844129289197.blacksea.in.ua/l/lhm',
      checkout: 'https://844129289197.blacksea.in.ua/checkout?product=lhm&quantity=1'
    },
    {
      id: 'yox',
      name: '5 шаблонов объявлений',
      category: 'Шаблоны',
      type: 'Шаблон',
      format: 'ZIP · PPTX + PDF',
      price: 130,
      currency: 'UAH',
      priceLabel: '',
      badge: '',
      badgeClass: '',
      image: 'assets/products/yox.jpg',
      caption: 'Чтобы объявление продавало',
      description: 'Комплект из пяти редактируемых шаблонов: «5 ошибок при создании объявления», «Как продать товар быстрее», «Как правильно выбрать цену», «Как подготовить товар к продаже», «Как избежать обмана при покупке». Внутри PDF-превью и инструкция.',
      compatibility: 'PowerPoint / LibreOffice Impress',
      newest: 7,
      link: 'https://844129289197.blacksea.in.ua/l/yox',
      checkout: 'https://844129289197.blacksea.in.ua/checkout?product=yox&quantity=1'
    },
    {
      id: 'gdk',
      name: 'Саморазвитие как стиль жизни',
      category: 'Книги',
      type: 'Электронная книга',
      format: '30 глав',
      price: 156,
      currency: 'UAH',
      priceLabel: '',
      badge: '',
      badgeClass: '',
      image: 'assets/products/gdk.jpg',
      caption: 'Цели, привычки, время и энергия',
      description: 'Практическое руководство о том, как ставить цели, формировать полезные привычки, управлять временем и энергией, развивать эмоциональный интеллект и избавляться от вредных установок. 30 глав, которые помогают внедрять изменения постепенно.',
      compatibility: 'Телефон, планшет, компьютер',
      newest: 6,
      link: 'https://844129289197.blacksea.in.ua/l/gdk',
      checkout: 'https://844129289197.blacksea.in.ua/checkout?product=gdk&quantity=1'
    },
    {
      id: 'wxx',
      name: 'Планнер 30 дней — демо',
      category: 'Приложения',
      type: 'Веб-приложение',
      format: 'Браузер, без установки',
      price: 0,
      currency: 'USD',
      priceLabel: '$0+',
      badge: 'ДЕМО',
      badgeClass: 'new',
      image: 'assets/products/wxx.jpg',
      caption: 'Попробуйте до покупки',
      description: 'Демо-версия планнера: превращает книгу в понятный план на 30 дней — что читать, как тренироваться и что отметить сегодня. Откройте файл в браузере телефона или компьютера и добавьте на главный экран: установка не нужна, данные хранятся только у вас. Цена — по желанию.',
      compatibility: 'Телефон, планшет, ПК',
      newest: 5,
      link: 'https://844129289197.blacksea.in.ua/l/wxx',
      checkout: 'https://844129289197.blacksea.in.ua/checkout?product=wxx&quantity=1'
    },
    {
      id: 'mmd',
      name: 'Шаблон «5 советов, как продать быстрее»',
      category: 'Шаблоны',
      type: 'Шаблон',
      format: 'PPTX',
      price: 14.99,
      currency: 'UAH',
      priceLabel: '',
      badge: '',
      badgeClass: '',
      image: 'assets/products/mmd.jpg',
      caption: 'Готовая инфографика о продажах',
      description: 'Готовая инфографика с пятью понятными советами для тех, кто продаёт товары и хочет, чтобы объявления работали лучше. Редактируется в PowerPoint или бесплатном LibreOffice Impress: текст, цвета, карточки и фон.',
      compatibility: 'PowerPoint / LibreOffice Impress',
      newest: 4,
      link: 'https://844129289197.blacksea.in.ua/l/mmd',
      checkout: 'https://844129289197.blacksea.in.ua/checkout?product=mmd&quantity=1'
    },
    {
      id: 'fyd',
      name: '30-дневный планер-дневник',
      category: 'Планеры',
      type: 'Планер-дневник',
      format: '',
      price: 2.6,
      currency: 'USD',
      priceLabel: '',
      badge: '',
      badgeClass: '',
      image: 'assets/products/fyd.jpg',
      caption: 'Тренировки, питание и водный баланс',
      description: 'Дневник для самостоятельного планирования активности: календарь на 30 дней, ежедневные записи, цели и стартовые замеры, недельные обзоры. Упражнения и план тренировок выбираете сами — планер подстраивается под ваш ритм.',
      compatibility: 'Телефон, планшет, компьютер',
      newest: 3,
      link: 'https://844129289197.blacksea.in.ua/l/fyd',
      checkout: 'https://844129289197.blacksea.in.ua/checkout?product=fyd&quantity=1'
    },
    {
      id: 'tid',
      name: '30-Day Fitness Plan for Weight Loss',
      category: 'Книги',
      type: 'Электронная книга',
      format: 'English',
      price: 2.6,
      currency: 'USD',
      priceLabel: '',
      badge: '',
      badgeClass: '',
      image: 'assets/products/tid.jpg',
      caption: 'English edition',
      description: 'A practical 30-day fitness plan for weight loss: a structured program that helps you build healthy habits, stay active and move toward your goals one day at a time.',
      compatibility: 'Телефон, планшет, компьютер',
      newest: 2,
      link: 'https://844129289197.blacksea.in.ua/l/tid',
      checkout: 'https://844129289197.blacksea.in.ua/checkout?product=tid&quantity=1'
    },
    {
      id: 'uuko',
      name: '30-дневный фитнес-план для похудения',
      category: 'Книги',
      type: 'Электронная книга',
      format: '',
      price: 2.6,
      currency: 'USD',
      priceLabel: '',
      badge: '',
      badgeClass: '',
      image: 'assets/products/uuko.jpg',
      caption: 'План физической активности на 30 дней',
      description: 'Практическое руководство с планом на 30 дней: как организовать занятия, следить за прогрессом и сделать физическую активность частью повседневной жизни. Подойдёт тем, кто занимается самостоятельно.',
      compatibility: 'Телефон, планшет, компьютер',
      newest: 1,
      link: 'https://844129289197.blacksea.in.ua/l/uuko',
      checkout: 'https://844129289197.blacksea.in.ua/checkout?product=uuko&quantity=1'
    }
  ];

  function defaults() {
    return {
      name: DEMO_NAME,
      sub: DEMO_SUB,
      rate: DEMO_RATE,
      store: DEMO_STORE,
      products: JSON.parse(JSON.stringify(DEMO_PRODUCTS))
    };
  }

  function cleanProduct(raw, index) {
    const p = raw && typeof raw === 'object' ? raw : {};
    const text = (value, fallback = '') => typeof value === 'string' ? value.trim() : (typeof value === 'number' ? String(value) : fallback);
    const amount = value => {
      const n = Number(value);
      return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : 0;
    };
    const newest = Number(p.newest);
    const store = text(p.link) || DEMO_STORE;
    return {
      id: text(p.id) || `item-${Date.now().toString(36)}-${index}`,
      name: text(p.name) || 'Без названия',
      category: CATEGORIES.includes(p.category) ? p.category : CATEGORIES[0],
      type: text(p.type) || 'Цифровой товар',
      format: text(p.format),
      price: amount(p.price),
      currency: CURRENCIES.includes(p.currency) ? p.currency : 'UAH',
      priceLabel: text(p.priceLabel),
      badge: text(p.badge),
      badgeClass: ['new', 'sale'].includes(p.badgeClass) ? p.badgeClass : '',
      image: text(p.image) || 'assets/book-steps.svg',
      caption: text(p.caption),
      description: text(p.description),
      compatibility: text(p.compatibility) || 'Телефон, планшет, компьютер',
      newest: Number.isFinite(newest) ? newest : 0,
      link: store,
      checkout: text(p.checkout) || store
    };
  }

  function normalize(raw) {
    const base = defaults();
    if (!raw || typeof raw !== 'object') return base;
    const products = Array.isArray(raw.products) ? raw.products.map(cleanProduct) : base.products;
    const rate = Number(raw.rate);
    return {
      name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : base.name,
      sub: typeof raw.sub === 'string' && raw.sub.trim() ? raw.sub.trim() : base.sub,
      rate: Number.isFinite(rate) && rate > 0 ? rate : base.rate,
      store: typeof raw.store === 'string' && raw.store.trim() ? raw.store.trim() : base.store,
      products
    };
  }

  function load() {
    try {
      const raw = global.localStorage.getItem(KEY);
      return raw ? normalize(JSON.parse(raw)) : defaults();
    } catch (_) {
      return defaults();
    }
  }

  function save(catalog) {
    const ready = normalize(catalog);
    try {
      global.localStorage.setItem(KEY, JSON.stringify(ready));
      return { ok: true, catalog: ready };
    } catch (_) {
      return { ok: false, catalog: ready };
    }
  }

  function clear() {
    try { global.localStorage.removeItem(KEY); } catch (_) { /* storage may be blocked */ }
  }

  function isCustomized() {
    try { return global.localStorage.getItem(KEY) !== null; } catch (_) { return false; }
  }

  global.VibeCatalog = {
    KEY, CATEGORIES, CURRENCIES, BADGE_STYLES, DEMO_NAME, DEMO_SUB, DEMO_RATE, DEMO_STORE,
    defaults, normalize, cleanProduct, load, save, clear, isCustomized
  };
})(window);
