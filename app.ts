type Category = {
  id: string;
  label: string;
};

type Product = {
  id: number;
  name: string;
  categoryId: Category["id"];
  basePrice: number;
  rating: number;
  shop: string;
  badge?: "Новинка" | "Хит";
};

type CartEntry = {
  id: number;
  qty: number;
};

type SortOption = "popular" | "price-asc" | "price-desc" | "rating";
type PriceFilterOption = "all" | "0-4500" | "4500-8000" | "8000-15000";

type City = "Москва" | "Санкт-Петербург" | "Казань" | "Екатеринбург";

type Refs = {
  categoryGrid: HTMLElement;
  heroTags: HTMLElement;
  productGrid: HTMLElement;
  reviewGrid: HTMLElement;
  cartCount: HTMLElement;
  cartItems: HTMLElement;
  cartTotal: HTMLElement;
  cartDrawer: HTMLElement;
  overlay: HTMLElement;
  cartOpenButton: HTMLButtonElement;
  cartCloseButton: HTMLButtonElement;
  checkoutButton: HTMLButtonElement;
  searchInput: HTMLInputElement;
  searchForm: HTMLFormElement;
  priceFilter: HTMLSelectElement;
  sortFilter: HTMLSelectElement;
  citySelect: HTMLSelectElement;
  orderForm: HTMLFormElement;
  orderMessage: HTMLElement;
  mainNav: HTMLElement;
  mobileMenuButton: HTMLButtonElement;
};

const STORAGE_KEYS = {
  cart: "FLOW_MARKET_V2_CART",
  city: "FLOW_MARKET_V2_CITY",
  category: "FLOW_MARKET_V2_CATEGORY"
} as const;

const CITY_COEFFICIENTS: Record<City, number> = {
  "Москва": 1,
  "Санкт-Петербург": 1.04,
  "Казань": 0.95,
  "Екатеринбург": 0.93
};

const CATEGORIES: Category[] = [
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

const PRODUCTS: Product[] = [
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

const state: {
  query: string;
  category: string;
  price: PriceFilterOption;
  sort: SortOption;
  city: City;
  cart: CartEntry[];
} = {
  query: "",
  category: "all",
  price: "all",
  sort: "popular",
  city: "Москва",
  cart: []
};

function must<T extends Element>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node as T;
}

const refs: Refs = {
  categoryGrid: must<HTMLElement>("categoryGrid"),
  heroTags: must<HTMLElement>("heroTags"),
  productGrid: must<HTMLElement>("productGrid"),
  reviewGrid: must<HTMLElement>("reviewGrid"),
  cartCount: must<HTMLElement>("cartCount"),
  cartItems: must<HTMLElement>("cartItems"),
  cartTotal: must<HTMLElement>("cartTotal"),
  cartDrawer: must<HTMLElement>("cartDrawer"),
  overlay: must<HTMLElement>("overlay"),
  cartOpenButton: must<HTMLButtonElement>("cartOpenButton"),
  cartCloseButton: must<HTMLButtonElement>("cartCloseButton"),
  checkoutButton: must<HTMLButtonElement>("checkoutButton"),
  searchInput: must<HTMLInputElement>("searchInput"),
  searchForm: must<HTMLFormElement>("searchForm"),
  priceFilter: must<HTMLSelectElement>("priceFilter"),
  sortFilter: must<HTMLSelectElement>("sortFilter"),
  citySelect: must<HTMLSelectElement>("citySelect"),
  orderForm: must<HTMLFormElement>("orderForm"),
  orderMessage: must<HTMLElement>("orderMessage"),
  mainNav: must<HTMLElement>("mainNav"),
  mobileMenuButton: must<HTMLButtonElement>("mobileMenuButton")
};

function formatRub(value: number): string {
  return `${value.toLocaleString("ru-RU")} RUB`;
}

function getCityAdjustedPrice(basePrice: number): number {
  const multiplier = CITY_COEFFICIENTS[state.city] ?? 1;
  return Math.round(basePrice * multiplier);
}

function getCategoryLabel(categoryId: string): string {
  return CATEGORIES.find((entry) => entry.id === categoryId)?.label ?? "Категория";
}

function saveStorage(): void {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(state.cart));
  localStorage.setItem(STORAGE_KEYS.city, state.city);
  localStorage.setItem(STORAGE_KEYS.category, state.category);
}

function loadStorage(): void {
  try {
    const savedCart = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) ?? "[]") as CartEntry[];
    if (Array.isArray(savedCart)) {
      state.cart = savedCart.filter((entry) => typeof entry.id === "number" && typeof entry.qty === "number");
    }
  } catch {
    state.cart = [];
  }

  const savedCity = localStorage.getItem(STORAGE_KEYS.city);
  if (savedCity && savedCity in CITY_COEFFICIENTS) {
    state.city = savedCity as City;
  }

  const savedCategory = localStorage.getItem(STORAGE_KEYS.category);
  if (savedCategory) {
    state.category = savedCategory;
  }

  refs.citySelect.value = state.city;
}

function renderHeroTags(): void {
  const tags = [{ id: "all", label: "Все" }, ...CATEGORIES.map((entry) => ({ id: entry.id, label: entry.label }))];
  refs.heroTags.innerHTML = tags
    .map(
      (entry) =>
        `<button class="hero-tag ${state.category === entry.id ? "active" : ""}" data-category="${entry.id}" type="button">${entry.label}</button>`
    )
    .join("");
}

function renderCategoryCards(): void {
  refs.categoryGrid.innerHTML = CATEGORIES.map((entry) => {
    const count = PRODUCTS.filter((product) => product.categoryId === entry.id).length;
    return `
      <article class="category-card reveal">
        <div class="category-card-content">
          <strong>${entry.label}</strong>
          <span class="category-count">${count} шт.</span>
        </div>
      </article>
    `;
  }).join("");
}

function productScore(product: Product): number {
  const priceRank = getCityAdjustedPrice(product.basePrice) / 10000;
  return product.rating * 10 - priceRank;
}

function parsePriceRange(filter: PriceFilterOption): [number, number] | null {
  if (filter === "all") return null;
  const [fromText, toText] = filter.split("-");
  const from = Number(fromText);
  const to = Number(toText);
  if (Number.isNaN(from) || Number.isNaN(to)) return null;
  return [from, to];
}

function getFilteredProducts(): Product[] {
  const query = state.query.trim().toLowerCase();
  const range = parsePriceRange(state.price);

  const list = PRODUCTS.filter((product) => {
    const matchCategory = state.category === "all" || product.categoryId === state.category;
    if (!matchCategory) return false;

    const computedPrice = getCityAdjustedPrice(product.basePrice);
    const matchRange = !range || (computedPrice >= range[0] && computedPrice <= range[1]);
    if (!matchRange) return false;

    if (!query) return true;

    return [product.name, product.shop, getCategoryLabel(product.categoryId)].some((field) =>
      field.toLowerCase().includes(query)
    );
  });

  if (state.sort === "price-asc") {
    list.sort((a, b) => getCityAdjustedPrice(a.basePrice) - getCityAdjustedPrice(b.basePrice));
  }

  if (state.sort === "price-desc") {
    list.sort((a, b) => getCityAdjustedPrice(b.basePrice) - getCityAdjustedPrice(a.basePrice));
  }

  if (state.sort === "rating") {
    list.sort((a, b) => b.rating - a.rating);
  }

  if (state.sort === "popular") {
    list.sort((a, b) => productScore(b) - productScore(a));
  }

  return list;
}

function renderProductCards(): void {
  const items = getFilteredProducts();
  refs.productGrid.innerHTML = items.length
    ? items
        .map((product) => {
          const categoryLabel = getCategoryLabel(product.categoryId);
          const price = formatRub(getCityAdjustedPrice(product.basePrice));
          const badgeHtml = product.badge ? `<span class="category-count">${product.badge}</span>` : "";
          return `
            <article class="product-card reveal">
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
                ${badgeHtml}
              </div>
            </article>
          `;
        })
        .join("")
    : `<p>Ничего не найдено. Измените фильтры или запрос.</p>`;
}

function renderReviews(): void {
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

function getProductById(id: number): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

function addToCart(id: number): void {
  const item = state.cart.find((entry) => entry.id === id);
  if (item) {
    item.qty += 1;
  } else {
    state.cart.push({ id, qty: 1 });
  }
  saveStorage();
  renderCart();
}

function updateCartQty(id: number, delta: number): void {
  const item = state.cart.find((entry) => entry.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== id);
  }

  saveStorage();
  renderCart();
}

function renderCart(): void {
  const count = state.cart.reduce((sum, entry) => sum + entry.qty, 0);
  const total = state.cart.reduce((sum, entry) => {
    const product = getProductById(entry.id);
    if (!product) return sum;
    return sum + getCityAdjustedPrice(product.basePrice) * entry.qty;
  }, 0);

  refs.cartCount.textContent = String(count);
  refs.cartTotal.textContent = formatRub(total);

  if (!state.cart.length) {
    refs.cartItems.innerHTML = "<p>Корзина пока пуста.</p>";
    return;
  }

  refs.cartItems.innerHTML = state.cart
    .map((entry) => {
      const product = getProductById(entry.id);
      if (!product) return "";
      const rowPrice = formatRub(getCityAdjustedPrice(product.basePrice) * entry.qty);
      return `
        <article class="cart-item">
          <div class="cart-item-top">
            <strong>${product.name}</strong>
            <span>${rowPrice}</span>
          </div>
          <div class="cart-item-controls">
            <button type="button" data-minus="${entry.id}">-</button>
            <span>${entry.qty}</span>
            <button type="button" data-plus="${entry.id}">+</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function openCart(): void {
  refs.cartDrawer.classList.add("open");
  refs.overlay.classList.add("show");
}

function closeCart(): void {
  refs.cartDrawer.classList.remove("open");
  refs.overlay.classList.remove("show");
}

function debounce<T extends (...args: any[]) => void>(callback: T, delay = 220): (...args: Parameters<T>) => void {
  let timer: number | undefined;
  return (...args: Parameters<T>) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), delay);
  };
}

function refreshCatalog(): void {
  renderHeroTags();
  renderProductCards();
  saveStorage();
  applyRevealAnimation();
}

function applyRevealAnimation(): void {
  const revealNodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
  if (!("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("visible"));
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

  revealNodes.forEach((node) => observer.observe(node));
}

function onTagClick(event: Event): void {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-category]");
  if (!target) return;
  state.category = target.dataset.category ?? "all";
  refreshCatalog();
}

function attachEvents(): void {
  refs.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    refreshCatalog();
  });

  refs.searchInput.addEventListener(
    "input",
    debounce((event: Event) => {
      state.query = (event.target as HTMLInputElement).value;
      refreshCatalog();
    })
  );

  refs.priceFilter.addEventListener("change", (event) => {
    state.price = (event.target as HTMLSelectElement).value as PriceFilterOption;
    refreshCatalog();
  });

  refs.sortFilter.addEventListener("change", (event) => {
    state.sort = (event.target as HTMLSelectElement).value as SortOption;
    refreshCatalog();
  });

  refs.citySelect.addEventListener("change", (event) => {
    state.city = (event.target as HTMLSelectElement).value as City;
    renderProductCards();
    renderCart();
    saveStorage();
    applyRevealAnimation();
  });

  refs.heroTags.addEventListener("click", onTagClick);

  refs.categoryGrid.addEventListener("click", (event) => {
    const card = (event.target as HTMLElement).closest<HTMLElement>(".category-card");
    if (!card) return;
    const index = Array.from(refs.categoryGrid.children).indexOf(card);
    const category = CATEGORIES[index];
    if (!category) return;
    state.category = category.id;
    refreshCatalog();
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  refs.productGrid.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-add]");
    if (!button) return;
    const id = Number(button.dataset.add ?? "0");
    if (!id) return;
    addToCart(id);
    openCart();
  });

  refs.cartItems.addEventListener("click", (event) => {
    const plus = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-plus]");
    const minus = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-minus]");
    if (plus) {
      updateCartQty(Number(plus.dataset.plus), 1);
      return;
    }
    if (minus) {
      updateCartQty(Number(minus.dataset.minus), -1);
    }
  });

  refs.cartOpenButton.addEventListener("click", openCart);
  refs.cartCloseButton.addEventListener("click", closeCart);
  refs.overlay.addEventListener("click", closeCart);

  refs.checkoutButton.addEventListener("click", () => {
    closeCart();
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  refs.orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(refs.orderForm);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();

    if (!name || phone.length < 8) {
      refs.orderMessage.textContent = "Проверьте имя и телефон.";
      return;
    }

    refs.orderMessage.textContent = "Заявка отправлена. Мы скоро свяжемся с вами.";
    refs.orderForm.reset();
  });

  refs.mobileMenuButton.addEventListener("click", () => {
    const isOpen = refs.mainNav.classList.toggle("open");
    refs.mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

function init(): void {
  loadStorage();
  renderHeroTags();
  renderCategoryCards();
  renderProductCards();
  renderReviews();
  renderCart();
  attachEvents();
  applyRevealAnimation();
}

init();