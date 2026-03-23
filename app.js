const STORAGE_KEYS = {
  cart: "FLOW_MARKET_CART",
  city: "FLOW_MARKET_CITY",
  category: "FLOW_MARKET_CATEGORY"
};

const CATEGORY_IMAGE_MAP = {
  roses: "./assets/images/generated/flower-1.svg",
  peonies: "./assets/images/generated/flower-2.svg",
  tulips: "./assets/images/generated/flower-3.svg",
  designer: "./assets/images/generated/flower-4.svg",
  baskets: "./assets/images/generated/flower-5.svg",
  compositions: "./assets/images/generated/flower-6.svg",
  wedding: "./assets/images/generated/flower-7.svg",
  boxes: "./assets/images/generated/flower-8.svg",
  giftsets: "./assets/images/generated/flower-9.svg"
};

const CITY_COEFFICIENTS = {
  "Москва": 1,
  "Санкт-Петербург": 1.04,
  "Казань": 0.95,
  "Екатеринбург": 0.93
};

const CATEGORIES = [
  { id: "roses", label: "Розы" },
  { id: "peonies", label: "Пионы" },
  { id: "tulips", label: "Тюльпаны" },
  { id: "designer", label: "Авторские" },
  { id: "baskets", label: "Корзины" },
  { id: "compositions", label: "Композиции" },
  { id: "wedding", label: "Свадебные" },
  { id: "boxes", label: "Flower Box" },
  { id: "giftsets", label: "Подарочные наборы" }
];

const PRODUCTS = [
  { id: 1, name: "Rosa Cloud", categoryId: "roses", basePrice: 4100, rating: 4.9, shop: "Bloom Atelier", badge: "Хит" },
  { id: 2, name: "Rose Garden", categoryId: "roses", basePrice: 7200, rating: 4.8, shop: "Rose Crafters" },
  { id: 3, name: "Peony Air", categoryId: "peonies", basePrice: 6900, rating: 4.8, shop: "Mira Flowers", badge: "Новинка" },
  { id: 4, name: "Spring Peony", categoryId: "peonies", basePrice: 6350, rating: 4.7, shop: "Mira Flowers" },
  { id: 5, name: "Tulip Story", categoryId: "tulips", basePrice: 4600, rating: 4.6, shop: "Flowline" },
  { id: 6, name: "Sun Tulips", categoryId: "tulips", basePrice: 4200, rating: 4.5, shop: "Flowline" },
  { id: 7, name: "White Morning", categoryId: "designer", basePrice: 10200, rating: 4.9, shop: "Atelier 24", badge: "Хит" },
  { id: 8, name: "Nude Palette", categoryId: "designer", basePrice: 11800, rating: 5, shop: "Atelier 24" },
  { id: 9, name: "Basket Meadow", categoryId: "baskets", basePrice: 7700, rating: 4.7, shop: "Baskette" },
  { id: 10, name: "Warm Basket", categoryId: "baskets", basePrice: 8050, rating: 4.8, shop: "Baskette" },
  { id: 11, name: "Silk Composition", categoryId: "compositions", basePrice: 9100, rating: 4.8, shop: "Forma Flora" },
  { id: 12, name: "Soft Geometry", categoryId: "compositions", basePrice: 9700, rating: 4.9, shop: "Forma Flora", badge: "Новинка" },
  { id: 13, name: "Wedding Light", categoryId: "wedding", basePrice: 12300, rating: 4.9, shop: "Ceremony Bloom" },
  { id: 14, name: "Wedding Ivory", categoryId: "wedding", basePrice: 13700, rating: 5, shop: "Ceremony Bloom" },
  { id: 15, name: "Box Velvet", categoryId: "boxes", basePrice: 6300, rating: 4.6, shop: "Box and Bloom" },
  { id: 16, name: "Box Blush", categoryId: "boxes", basePrice: 7050, rating: 4.8, shop: "Box and Bloom" },
  { id: 17, name: "Gift Set Calm", categoryId: "giftsets", basePrice: 5600, rating: 4.6, shop: "Gift Flower Lab" },
  { id: 18, name: "Gift Set Premium", categoryId: "giftsets", basePrice: 7900, rating: 4.8, shop: "Gift Flower Lab", badge: "Хит" }
];

const REVIEWS = [
  { name: "Анна, Москва", score: 5, text: "Очень удобный сайт и быстрая доставка." },
  { name: "Михаил, Казань", score: 5, text: "Минималистично, понятно и без лишнего." },
  { name: "Лина, Санкт-Петербург", score: 4.9, text: "Легко выбрать букет и оформить заказ." }
];

const state = {
  query: "",
  category: "all",
  price: "all",
  sort: "popular",
  city: "Москва",
  cart: []
};

function must(id) {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node;
}

const refs = {
  categoryGrid: must("categoryGrid"),
  heroTags: must("heroTags"),
  productGrid: must("productGrid"),
  reviewGrid: must("reviewGrid"),
  cartCount: must("cartCount"),
  cartItems: must("cartItems"),
  cartTotal: must("cartTotal"),
  cartDrawer: must("cartDrawer"),
  overlay: must("overlay"),
  cartOpenButton: must("cartOpenButton"),
  cartCloseButton: must("cartCloseButton"),
  checkoutButton: must("checkoutButton"),
  searchInput: must("searchInput"),
  searchForm: must("searchForm"),
  priceFilter: must("priceFilter"),
  sortFilter: must("sortFilter"),
  citySelect: must("citySelect"),
  orderForm: must("orderForm"),
  orderMessage: must("orderMessage"),
  mobileMenuButton: must("mobileMenuButton"),
  mainNav: must("mainNav")
};

function formatRub(value) {
  return `${value.toLocaleString("ru-RU")} RUB`;
}

function getCityAdjustedPrice(basePrice) {
  return Math.round(basePrice * (CITY_COEFFICIENTS[state.city] || 1));
}

function getCategoryLabel(categoryId) {
  return CATEGORIES.find((entry) => entry.id === categoryId)?.label || "Категория";
}

function getCategoryImage(categoryId) {
  return CATEGORY_IMAGE_MAP[categoryId] || CATEGORY_IMAGE_MAP.roses;
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(state.cart));
  localStorage.setItem(STORAGE_KEYS.city, state.city);
  localStorage.setItem(STORAGE_KEYS.category, state.category);
}

function loadState() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || "[]");
    state.cart = Array.isArray(savedCart)
      ? savedCart.filter((item) => Number.isFinite(item.id) && Number.isFinite(item.qty))
      : [];
  } catch {
    state.cart = [];
  }

  const savedCity = localStorage.getItem(STORAGE_KEYS.city);
  if (savedCity && CITY_COEFFICIENTS[savedCity]) state.city = savedCity;

  const savedCategory = localStorage.getItem(STORAGE_KEYS.category);
  if (savedCategory) state.category = savedCategory;

  refs.citySelect.value = state.city;
}

function renderHeroTags() {
  const tags = [{ id: "all", label: "Все" }, ...CATEGORIES.map((entry) => ({ id: entry.id, label: entry.label }))];
  refs.heroTags.innerHTML = tags
    .map(
      (tag) =>
        `<button class="hero-tag ${state.category === tag.id ? "active" : ""}" data-category="${tag.id}" type="button">${tag.label}</button>`
    )
    .join("");
}

function renderCategoryCards() {
  refs.categoryGrid.innerHTML = CATEGORIES.map((entry) => {
    const count = PRODUCTS.filter((product) => product.categoryId === entry.id).length;
    return `
      <article class="category-card reveal" data-category-card="${entry.id}">
        <img class="category-thumb" src="${getCategoryImage(entry.id)}" alt="Категория ${entry.label}" loading="lazy" decoding="async" />
        <div class="category-card-content">
          <strong>${entry.label}</strong>
          <span class="category-count">${count} шт.</span>
        </div>
      </article>
    `;
  }).join("");
}

function parsePriceRange(value) {
  if (value === "all") return null;
  const [minRaw, maxRaw] = String(value).split("-");
  const min = Number(minRaw);
  const max = Number(maxRaw);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return [min, max];
}

function getFilteredProducts() {
  const query = state.query.trim().toLowerCase();
  const range = parsePriceRange(state.price);

  const filtered = PRODUCTS.filter((item) => {
    if (state.category !== "all" && item.categoryId !== state.category) return false;

    const price = getCityAdjustedPrice(item.basePrice);
    if (range && (price < range[0] || price > range[1])) return false;

    if (!query) return true;

    return [item.name, item.shop, getCategoryLabel(item.categoryId)].some((field) =>
      field.toLowerCase().includes(query)
    );
  });

  if (state.sort === "price-asc") filtered.sort((a, b) => getCityAdjustedPrice(a.basePrice) - getCityAdjustedPrice(b.basePrice));
  if (state.sort === "price-desc") filtered.sort((a, b) => getCityAdjustedPrice(b.basePrice) - getCityAdjustedPrice(a.basePrice));
  if (state.sort === "rating") filtered.sort((a, b) => b.rating - a.rating);
  if (state.sort === "popular") filtered.sort((a, b) => b.rating * 10 - b.basePrice / 10000 - (a.rating * 10 - a.basePrice / 10000));

  return filtered;
}

function renderProductCards() {
  const items = getFilteredProducts();

  refs.productGrid.innerHTML = items.length
    ? items
        .map((product) => {
          const price = formatRub(getCityAdjustedPrice(product.basePrice));
          const categoryLabel = getCategoryLabel(product.categoryId);
          const badge = product.badge ? `<span class="category-count">${product.badge}</span>` : "";
          return `
            <article class="product-card reveal">
              <img class="product-thumb" src="${getCategoryImage(product.categoryId)}" alt="${product.name}" loading="lazy" decoding="async" />
              <div class="product-body">
                <h3>${product.name}</h3>
                <div class="product-meta">
                  <span>${product.shop}</span>
                  <span>${categoryLabel} • ${product.rating}</span>
                </div>
                <div class="product-price-row">
                  <strong>${price}</strong>
                  <button type="button" data-add="${product.id}">В корзину</button>
                </div>
                ${badge}
              </div>
            </article>
          `;
        })
        .join("")
    : "<p>Ничего не найдено. Измените фильтры или поисковый запрос.</p>";
}

function renderReviews() {
  refs.reviewGrid.innerHTML = REVIEWS.map(
    (review) => `
      <article class="review-card reveal">
        <h3>${review.name}</h3>
        <p>${review.score} / 5</p>
        <p>${review.text}</p>
      </article>
    `
  ).join("");
}

function getProductById(id) {
  return PRODUCTS.find((product) => product.id === id);
}

function addToCart(id) {
  const existing = state.cart.find((item) => item.id === id);
  if (existing) existing.qty += 1;
  else state.cart.push({ id, qty: 1 });
  saveState();
  renderCart();
}

function changeCartQty(id, delta) {
  const item = state.cart.find((entry) => entry.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter((entry) => entry.id !== id);
  saveState();
  renderCart();
}

function renderCart() {
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const total = state.cart.reduce((sum, entry) => {
    const product = getProductById(entry.id);
    return sum + (product ? getCityAdjustedPrice(product.basePrice) * entry.qty : 0);
  }, 0);

  refs.cartCount.textContent = String(count);
  refs.cartTotal.textContent = formatRub(total);

  refs.cartItems.innerHTML = state.cart.length
    ? state.cart
        .map((entry) => {
          const product = getProductById(entry.id);
          if (!product) return "";
          return `
            <article class="cart-item">
              <div class="cart-item-top">
                <strong>${product.name}</strong>
                <span>${formatRub(getCityAdjustedPrice(product.basePrice) * entry.qty)}</span>
              </div>
              <div class="cart-item-controls">
                <button type="button" data-minus="${entry.id}">-</button>
                <span>${entry.qty}</span>
                <button type="button" data-plus="${entry.id}">+</button>
              </div>
            </article>
          `;
        })
        .join("")
    : "<p>Корзина пока пуста.</p>";
}

function openCart() {
  refs.cartDrawer.classList.add("open");
  refs.overlay.classList.add("show");
  refs.cartCloseButton.focus();
}

function closeCart() {
  refs.cartDrawer.classList.remove("open");
  refs.overlay.classList.remove("show");
  refs.cartOpenButton.focus();
}

function debounce(fn, delay = 220) {
  let timer = 0;
  return (...args) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

function applyRevealAnimation() {
  const nodes = Array.from(document.querySelectorAll(".reveal"));
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  nodes.forEach((node) => observer.observe(node));
}

function refreshCatalog() {
  renderHeroTags();
  renderProductCards();
  saveState();
  applyRevealAnimation();
}

function attachEvents() {
  refs.searchForm.addEventListener("submit", (event) => event.preventDefault());

  refs.searchInput.addEventListener(
    "input",
    debounce((event) => {
      state.query = event.target.value;
      refreshCatalog();
    })
  );

  refs.priceFilter.addEventListener("change", (event) => {
    state.price = event.target.value;
    refreshCatalog();
  });

  refs.sortFilter.addEventListener("change", (event) => {
    state.sort = event.target.value;
    refreshCatalog();
  });

  refs.citySelect.addEventListener("change", (event) => {
    state.city = event.target.value;
    renderProductCards();
    renderCart();
    saveState();
    applyRevealAnimation();
  });

  refs.heroTags.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    state.category = button.dataset.category || "all";
    refreshCatalog();
  });

  refs.categoryGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-category-card]");
    if (!card) return;
    state.category = card.dataset.categoryCard;
    refreshCatalog();
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  refs.productGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-add]");
    if (!button) return;
    addToCart(Number(button.dataset.add));
    openCart();
  });

  refs.cartItems.addEventListener("click", (event) => {
    const plus = event.target.closest("button[data-plus]");
    const minus = event.target.closest("button[data-minus]");
    if (plus) changeCartQty(Number(plus.dataset.plus), 1);
    if (minus) changeCartQty(Number(minus.dataset.minus), -1);
  });

  refs.cartOpenButton.addEventListener("click", openCart);
  refs.cartCloseButton.addEventListener("click", closeCart);
  refs.overlay.addEventListener("click", closeCart);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      refs.mainNav.classList.remove("open");
      refs.mobileMenuButton.setAttribute("aria-expanded", "false");
      closeCart();
    }
  });

  refs.checkoutButton.addEventListener("click", () => {
    closeCart();
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  refs.orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(refs.orderForm);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();

    if (!name || phone.length < 8) {
      refs.orderMessage.textContent = "Проверьте имя и телефон.";
      return;
    }

    refs.orderMessage.textContent = "Спасибо! Заявка отправлена.";
    refs.orderForm.reset();
  });

  refs.mobileMenuButton.addEventListener("click", () => {
    const isOpen = refs.mainNav.classList.toggle("open");
    refs.mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

function init() {
  loadState();
  renderHeroTags();
  renderCategoryCards();
  renderProductCards();
  renderReviews();
  renderCart();
  attachEvents();
  applyRevealAnimation();
}

init();
