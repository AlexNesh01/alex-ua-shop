/* ALEX.UA storefront: catalogue with real prices and real BlackSea checkout links.
   Payment and file delivery happen on BlackSea, not on this page. */
const CATALOG = window.VibeCatalog ? VibeCatalog.load() : { name: 'ALEX.UA', sub: 'DIGITAL MARKET', rate: 45.1, store: '', products: [] };
let PRODUCTS = CATALOG.products;
const CATEGORIES = ['Все', ...VibeCatalog.CATEGORIES];
let DEMO_UAH_PER_USD = CATALOG.rate || 45.1;
const STORAGE = { favorites: 'vibe-digital-favorites-v1', currency: 'vibe-digital-currency-v1' };
const $ = id => document.getElementById(id);
const icons = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const productById = id => PRODUCTS.find(product => product.id === id);
const normalize = value => value.toLocaleLowerCase('ru-RU').replaceAll('ё', 'е').trim();
const otherCurrency = unit => unit === 'UAH' ? 'USD' : 'UAH';

function formatMoney(amount, unit) {
  if (unit === 'USD') return `$${amount.toFixed(2)}`;
  const digits = Number.isInteger(amount) ? 0 : 2;
  return `${new Intl.NumberFormat('ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: 2 }).format(amount)} ₴`;
}
function convert(amount, from, to) {
  if (from === to) return amount;
  const usd = from === 'USD' ? amount : amount / DEMO_UAH_PER_USD;
  return to === 'USD' ? usd : usd * DEMO_UAH_PER_USD;
}
function convertedText(amount, from, to) {
  const value = convert(amount, from, to);
  return formatMoney(to === 'USD' ? Math.round(value * 100) / 100 : Math.round(value), to);
}
/* The real price always stays visible; the chosen currency only decides what is shown first. */
function priceView(product, unit) {
  if (product.priceLabel) return { main: product.priceLabel, alt: '', approx: false };
  const native = product.currency;
  if (native === unit) return { main: formatMoney(product.price, native), alt: `≈ ${convertedText(product.price, native, otherCurrency(unit))}`, approx: false };
  return { main: `≈ ${convertedText(product.price, native, unit)}`, alt: formatMoney(product.price, native), approx: true };
}
const uahValue = product => product.priceLabel ? 0 : convert(product.price, product.currency, 'UAH');

function readStore(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (_) { return fallback; }
}
function writeStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* storage may be blocked */ }
}
function validIds(value) {
  return Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string' && productById(id)))] : [];
}

let favorites = new Set(validIds(readStore(STORAGE.favorites, [])));
const savedCurrency = readStore(STORAGE.currency, 'UAH');
let currency = savedCurrency === 'USD' ? 'USD' : 'UAH';
let activeCategory = 'Все';
let searchTerm = '';
let sortBy = 'popular';
let favoritesOnly = false;
let currentProduct = null;
let openPanelElement = null;
let returnFocusTo = null;
let toastTimer;

function saveState() {
  writeStore(STORAGE.favorites, [...favorites]);
  writeStore(STORAGE.currency, currency);
}
function countLabel(n) {
  const lastTwo = n % 100, last = n % 10;
  return `${n} ${lastTwo >= 11 && lastTwo <= 14 ? 'товаров' : last === 1 ? 'товар' : last >= 2 && last <= 4 ? 'товара' : 'товаров'}`;
}
function notify(message) {
  const toast = $('toast');
  toast.textContent = message;
  clearTimeout(toastTimer);
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}
function applyBranding() {
  const name = CATALOG.name || 'ALEX.UA';
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
  document.querySelectorAll('[data-brand-name]').forEach(el => { el.textContent = name; });
  document.querySelectorAll('[data-brand-upper]').forEach(el => { el.textContent = name.toUpperCase(); });
  document.querySelectorAll('[data-brand-sub]').forEach(el => { el.textContent = CATALOG.sub || ''; });
  document.querySelectorAll('[data-store-title]').forEach(el => { el.textContent = `${capitalized} digital`; });
  document.querySelectorAll('a.brand').forEach(link => link.setAttribute('aria-label', `${name} digital — на главную`));
  document.querySelectorAll('[data-store-link]').forEach(el => { if (CATALOG.store) el.href = CATALOG.store; });
  document.title = `${capitalized} digital — цифровые планеры, книги и шаблоны`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', `${capitalized} digital — цифровые планеры, книги и шаблоны. Оплата картой, файлы приходят сразу после покупки.`);
}
function renderCategories() {
  $('categoryPills').innerHTML = CATEGORIES.map(category => `
    <button class="category-pill ${category === activeCategory ? 'is-active' : ''}" type="button" data-category="${category}" aria-pressed="${category === activeCategory}">${category === 'Все' ? 'Все товары' : category}</button>
  `).join('');
}
function filteredProducts() {
  const query = normalize(searchTerm);
  const list = PRODUCTS.filter(product => {
    const matchCategory = activeCategory === 'Все' || product.category === activeCategory;
    const matchFavorite = !favoritesOnly || favorites.has(product.id);
    const searchable = normalize([product.name, product.category, product.type, product.format, product.caption, product.description].join(' '));
    return matchCategory && matchFavorite && (!query || searchable.includes(query));
  });
  if (sortBy === 'cheap') list.sort((a, b) => uahValue(a) - uahValue(b));
  if (sortBy === 'expensive') list.sort((a, b) => uahValue(b) - uahValue(a));
  if (sortBy === 'new') list.sort((a, b) => b.newest - a.newest);
  return list;
}
function buyLabel(product) {
  return product.priceLabel || product.price === 0 ? 'Получить' : 'Купить';
}
function typeLine(product) {
  return [product.type, product.format].filter(Boolean).join(' · ');
}
function renderProducts() {
  const list = filteredProducts();
  $('catalogTitle').innerHTML = favoritesOnly ? 'Ваши избранные <em>находки.</em>' : 'Цифровые <em>находки.</em>';
  $('resultCount').textContent = `${favoritesOnly ? 'Избранное · ' : ''}${countLabel(list.length)}`;
  const favoriteButton = $('favoritesButton');
  favoriteButton.classList.toggle('is-active', favoritesOnly);
  favoriteButton.setAttribute('aria-pressed', String(favoritesOnly));
  favoriteButton.setAttribute('aria-label', favoritesOnly ? 'Показать все товары' : 'Показать избранное');
  if (!list.length) {
    const emptyFavorite = favoritesOnly && favorites.size === 0;
    $('productGrid').innerHTML = `<div class="empty-state"><div class="empty-icon">${icons(emptyFavorite ? 'heart' : 'search')}</div><h3>${emptyFavorite ? 'Здесь пока пусто' : 'Ничего не нашлось'}</h3><p>${emptyFavorite ? 'Нажмите на сердечко у товара, чтобы сохранить его здесь.' : 'Попробуйте другой запрос или выберите другую категорию.'}</p><button class="empty-reset" type="button" data-reset>Посмотреть все товары</button></div>`;
    return;
  }
  $('productGrid').innerHTML = list.map((product, index) => {
    const isFavorite = favorites.has(product.id);
    const view = priceView(product, currency);
    return `<article class="product-card">
      <div class="product-media">
        <button class="product-open" type="button" data-view="${product.id}" aria-label="Подробнее о товаре ${product.name}"><img src="${product.image}" alt="Обложка: ${product.name}" ${index > 3 ? 'loading="lazy"' : ''}></button>
        ${product.badge ? `<span class="product-badge ${product.badgeClass}">${product.badge}</span>` : ''}
        <button class="product-favorite ${isFavorite ? 'is-active' : ''}" type="button" data-favorite="${product.id}" aria-label="${isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}: ${product.name}" aria-pressed="${isFavorite}">${icons('heart')}</button>
      </div>
      <div class="product-info">
        <div class="product-type"><span class="type-part">${product.type}</span>${product.format ? `<span class="type-dot"></span><span class="type-part">${product.format}</span>` : ''}</div>
        <button class="product-title" type="button" data-view="${product.id}">${product.name}</button>
        <p class="product-caption">${product.caption}</p>
        <div class="product-foot">
          <div class="product-price">
            <div class="product-price-main"><strong>${view.main}</strong></div>
            ${view.alt ? `<span class="price-alt">${view.alt}</span>` : '<span class="price-alt">по желанию</span>'}
          </div>
          <a class="product-add" href="${product.checkout}" target="_blank" rel="noopener" aria-label="${buyLabel(product)}: ${product.name}">${icons('bag')}<span>${buyLabel(product)}</span></a>
        </div>
      </div>
    </article>`;
  }).join('');
}
function renderCurrency() {
  document.querySelectorAll('[data-currency]').forEach(button => {
    const selected = button.dataset.currency === currency;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('[data-demo-rate]').forEach(element => { element.textContent = DEMO_UAH_PER_USD; });
}
function setCurrency(unit) {
  if (unit !== 'UAH' && unit !== 'USD') return;
  currency = unit;
  saveState();
  renderCurrency();
  renderProducts();
  if (openPanelElement === $('productModal') && currentProduct) renderProductModal(currentProduct);
}
function updateFavoritesBadge() {
  $('favoritesCount').hidden = favorites.size === 0;
  $('favoritesCount').textContent = favorites.size;
}
function renderAll() { renderCurrency(); renderCategories(); renderProducts(); updateFavoritesBadge(); }
function toggleFavorite(id) {
  const product = productById(id);
  if (!product) return;
  if (favorites.has(id)) { favorites.delete(id); notify('Убрано из избранного'); }
  else { favorites.add(id); notify('Добавлено в избранное'); }
  saveState();
  renderProducts();
  updateFavoritesBadge();
  if (openPanelElement === $('productModal')) {
    renderProductModal(id);
    $('productModal').querySelector('[data-favorite]')?.focus();
  }
}
function selectCategory(category, clearSearch = false) {
  if (!CATEGORIES.includes(category)) return;
  activeCategory = category;
  favoritesOnly = false;
  if (clearSearch) {
    searchTerm = '';
    $('searchInput').value = '';
    $('mobileSearchInput').value = '';
  }
  renderCategories();
  renderProducts();
}
function resetFilters() {
  activeCategory = 'Все';
  favoritesOnly = false;
  searchTerm = '';
  $('searchInput').value = '';
  $('mobileSearchInput').value = '';
  renderCategories(); renderProducts();
}

/* One panel at a time, keyboard-closeable, focus restored on close. */
function hidePanels() {
  const modal = $('productModal');
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
}
function showPanel(element) {
  if (!openPanelElement) returnFocusTo = document.activeElement;
  hidePanels();
  openPanelElement = element;
  $('backdrop').hidden = false;
  $('backdrop').classList.add('is-open');
  document.body.classList.add('is-locked');
  element.hidden = false;
  element.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => { if (openPanelElement === element) element.querySelector('[data-close-panel]')?.focus(); });
}
function closePanels(restoreFocus = true) {
  hidePanels();
  $('backdrop').classList.remove('is-open');
  $('backdrop').hidden = true;
  document.body.classList.remove('is-locked');
  openPanelElement = null;
  currentProduct = null;
  if (restoreFocus && returnFocusTo && typeof returnFocusTo.focus === 'function' && returnFocusTo.isConnected) returnFocusTo.focus();
  returnFocusTo = null;
}
function renderProductModal(id) {
  const product = productById(id);
  if (!product) return;
  const isFavorite = favorites.has(id);
  const view = priceView(product, currency);
  $('productModalContent').innerHTML = `<div class="product-modal-layout">
    <div class="product-modal-image"><img src="${product.image}" alt="Обложка: ${product.name}"></div>
    <div class="product-modal-info">
      <span class="overline">${typeLine(product)}</span>
      <h2 id="productModalTitle">${product.name}</h2>
      <p class="product-modal-description">${product.description}</p>
      <div class="product-modal-spec"><span>Формат и совместимость</span><strong>${[product.format, product.compatibility].filter(Boolean).join(' · ')}</strong></div>
      <div class="product-modal-price"><div><strong>${view.main}</strong></div><span>${view.alt || 'цена по желанию'}</span></div>
      <div class="modal-actions">
        <a class="button button-primary" href="${product.checkout}" target="_blank" rel="noopener">${buyLabel(product)} на BlackSea ${icons('up-right')}</a>
        <button class="modal-fav ${isFavorite ? 'is-active' : ''}" type="button" data-favorite="${product.id}" aria-label="${isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}" aria-pressed="${isFavorite}">${icons('heart')}</button>
      </div>
      <p class="product-modal-note">Оплата картой и выдача файлов — на защищённой странице BlackSea. После оплаты ссылка на файл приходит сразу. <a href="${product.link}" target="_blank" rel="noopener">Страница товара ↗</a></p>
    </div>
  </div>`;
}
function openProduct(id) {
  if (!productById(id)) return;
  currentProduct = id;
  renderProductModal(id);
  showPanel($('productModal'));
}

document.addEventListener('click', event => {
  const target = event.target;
  const currencyButton = target.closest('[data-currency]');
  if (currencyButton) { setCurrency(currencyButton.dataset.currency); return; }
  const nav = target.closest('[data-nav-category]');
  if (nav) { selectCategory(nav.dataset.navCategory, true); return; }
  const category = target.closest('[data-category]');
  if (category) { selectCategory(category.dataset.category); return; }
  const favorite = target.closest('[data-favorite]');
  if (favorite) { toggleFavorite(favorite.dataset.favorite); return; }
  const view = target.closest('[data-view]');
  if (view) { openProduct(view.dataset.view); return; }
  if (target.closest('[data-reset]')) { resetFilters(); return; }
  if (target.closest('[data-close-panel]')) { closePanels(); return; }
  if (target.classList.contains('modal')) closePanels();
});

$('backdrop').addEventListener('click', () => closePanels());
$('favoritesButton').addEventListener('click', () => {
  favoritesOnly = !favoritesOnly;
  activeCategory = 'Все'; searchTerm = '';
  $('searchInput').value = ''; $('mobileSearchInput').value = '';
  renderCategories(); renderProducts();
  $('catalog').scrollIntoView({ behavior: 'smooth' });
});
$('sortSelect').addEventListener('change', event => { sortBy = event.target.value; renderProducts(); });
for (const id of ['searchInput', 'mobileSearchInput']) {
  $(id).addEventListener('input', event => {
    searchTerm = event.target.value;
    $(id === 'searchInput' ? 'mobileSearchInput' : 'searchInput').value = searchTerm;
    renderProducts();
  });
}
for (const id of ['desktopSearchForm', 'mobileSearchForm']) {
  $(id).addEventListener('submit', event => { event.preventDefault(); $('catalog').scrollIntoView({ behavior: 'smooth' }); });
}
$('mobileSearchToggle').addEventListener('click', () => {
  const bar = $('mobileSearchBar');
  bar.hidden = !bar.hidden;
  $('mobileSearchToggle').setAttribute('aria-expanded', String(!bar.hidden));
  $('mobileSearchToggle').setAttribute('aria-label', bar.hidden ? 'Открыть поиск' : 'Закрыть поиск');
  if (!bar.hidden) $('mobileSearchInput').focus();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && openPanelElement) { closePanels(); return; }
  if (event.key !== 'Tab' || !openPanelElement) return;
  const focusable = [...openPanelElement.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(el => el.getClientRects().length);
  if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

/* Lets the admin panel (same page in the single-file build) refresh the storefront
   without a page reload. */
window.VibeStorefront = {
  refresh() {
    if (!window.VibeCatalog) return;
    const next = VibeCatalog.load();
    Object.assign(CATALOG, next);
    PRODUCTS = next.products;
    applyBranding();
    renderCategories();
    renderProgressSafe();
  }
};
function renderProgressSafe() { renderProducts(); renderCurrency(); updateFavoritesBadge(); }

/* Товары и настройки магазина живут в content/products.json и content/site.json —
   эти файлы правит владелец магазина через редактор (Pages CMS) без кода.
   Если файлов нет или они недоступны (например, страница открыта как file://),
   сайт показывает каталог из catalog.js — поэтому всегда что-то отображается. */
async function hydrateFromContent() {
  if (typeof fetch !== 'function' || location.protocol === 'file:') return false;
  try {
    const [siteRes, productsRes] = await Promise.all([
      fetch('content/site.json', { cache: 'no-store' }),
      fetch('content/products.json', { cache: 'no-store' })
    ]);
    if (!siteRes.ok || !productsRes.ok) return false;
    const site = await siteRes.json();
    let list = await productsRes.json();
    if (list && !Array.isArray(list) && Array.isArray(list.products)) list = list.products;
    if (!Array.isArray(list) || !list.length) return false;
    const next = VibeCatalog.normalize({
      name: site.name || CATALOG.name,
      sub: site.sub || CATALOG.sub,
      rate: site.rate || CATALOG.rate,
      store: site.store || CATALOG.store,
      products: list
    });
    if (!next.products.length) return false;
    Object.assign(CATALOG, next);
    PRODUCTS = next.products;
    DEMO_UAH_PER_USD = next.rate || DEMO_UAH_PER_USD;
    favorites = new Set(validIds([...favorites]));
    return true;
  } catch (_) { return false; }
}

(async function boot() {
  await hydrateFromContent();
  applyBranding();
  renderAll();
})();
