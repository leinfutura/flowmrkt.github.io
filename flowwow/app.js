const STORAGE_KEYS = {
  cart: "FLOW_MARKET_CART",
  city: "FLOW_MARKET_CITY"
};

const CATEGORY_NAMES = {
  roses: "Розы",
  peonies: "Пионы",
  tulips: "Тюльпаны",
  designer: "Авторские",
  baskets: "Корзины",
  compositions: "Композиции",
  wedding: "Свадебные",
  boxes: "Flower Box",
  giftsets: "Подарочные наборы"
};

const CATEGORY_IMAGES = {
  roses: "./assets/images/catalog/cat-roses.jpg",
  peonies: "./assets/images/catalog/cat-peonies.jpg",
  tulips: "./assets/images/catalog/cat-tulips.jpg",
  designer: "./assets/images/catalog/cat-designer.jpg",
  baskets: "./assets/images/catalog/cat-baskets.jpg",
  compositions: "./assets/images/catalog/cat-compositions.jpg",
  wedding: "./assets/images/catalog/cat-wedding.jpg",
  boxes: "./assets/images/catalog/cat-boxes.jpg",
  giftsets: "./assets/images/catalog/cat-giftsets.jpg"
};

const PRODUCTS = [
  { id: 1, name: "Rosa Cloud", category: "roses", price: 4900, rating: 4.9, shop: "Bloom Atelier", image: "./assets/images/catalog/roses-1.jpg" },
  { id: 2, name: "Rose Garden", category: "roses", price: 9200, rating: 4.8, shop: "Rose Crafters", image: "./assets/images/catalog/roses-2.jpg" },
  { id: 3, name: "Peony Air", category: "peonies", price: 8200, rating: 4.8, shop: "Mira Flowers", image: "./assets/images/catalog/peonies-1.jpg" },
  { id: 4, name: "Spring Peony", category: "peonies", price: 7800, rating: 4.7, shop: "Mira Flowers", image: "./assets/images/catalog/peonies-2.jpg" },
  { id: 5, name: "Tulip Story", category: "tulips", price: 5600, rating: 4.6, shop: "FlowLine", image: "./assets/images/catalog/tulips-1.jpg" },
  { id: 6, name: "Sun Tulips", category: "tulips", price: 4700, rating: 4.5, shop: "FlowLine", image: "./assets/images/catalog/tulips-2.jpg" },
  { id: 7, name: "White Morning", category: "designer", price: 11200, rating: 4.9, shop: "Atelier 24", image: "./assets/images/catalog/designer-1.jpg" },
  { id: 8, name: "Nude Palette", category: "designer", price: 13200, rating: 5.0, shop: "Atelier 24", image: "./assets/images/catalog/designer-2.jpg" },
  { id: 9, name: "Basket Meadow", category: "baskets", price: 8900, rating: 4.7, shop: "Baskette", image: "./assets/images/catalog/baskets-1.jpg" },
  { id: 10, name: "Warm Basket", category: "baskets", price: 9900, rating: 4.8, shop: "Baskette", image: "./assets/images/catalog/baskets-2.jpg" },
  { id: 11, name: "Silk Composition", category: "compositions", price: 10900, rating: 4.8, shop: "Forma Flora", image: "./assets/images/catalog/compositions-1.jpg" },
  { id: 12, name: "Soft Geometry", category: "compositions", price: 12100, rating: 4.9, shop: "Forma Flora", image: "./assets/images/catalog/compositions-2.jpg" },
  { id: 13, name: "Wedding Light", category: "wedding", price: 14500, rating: 4.9, shop: "Ceremony Bloom", image: "./assets/images/catalog/wedding-1.jpg" },
  { id: 14, name: "Wedding Ivory", category: "wedding", price: 16800, rating: 5.0, shop: "Ceremony Bloom", image: "./assets/images/catalog/wedding-2.jpg" },
  { id: 15, name: "Box Velvet", category: "boxes", price: 7600, rating: 4.6, shop: "Box & Bloom", image: "./assets/images/catalog/boxes-1.jpg" },
  { id: 16, name: "Box Blush", category: "boxes", price: 8700, rating: 4.8, shop: "Box & Bloom", image: "./assets/images/catalog/boxes-2.jpg" },
  { id: 17, name: "Gift Set Calm", category: "giftsets", price: 6900, rating: 4.6, shop: "Gift Flower Lab", image: "./assets/images/catalog/giftsets-1.jpg" },
  { id: 18, name: "Gift Set Premium", category: "giftsets", price: 9800, rating: 4.8, shop: "Gift Flower Lab", image: "./assets/images/catalog/giftsets-2.jpg" }
];

const refs = {
  productGrid: document.getElementById("productGrid"),
  searchInput: document.getElementById("searchInput"),
  searchForm: document.getElementById("searchForm"),
  priceFilter: document.getElementById("priceFilter"),
  sortFilter: document.getElementById("sortFilter"),
  tags: Array.from(document.querySelectorAll(".tag")),
  cartButton: document.getElementById("cartButton"),
  cartCount: document.getElementById("cartCount"),
  cartDrawer: document.getElementById("cartDrawer"),
  closeCart: document.getElementById("closeCart"),
  overlay: document.getElementById("overlay"),
  cartItems: document.getElementById("cartItems"),
  cartTotal: document.getElementById("cartTotal"),
  checkoutButton: document.getElementById("checkoutButton"),
  citySelector: document.getElementById("citySelector"),
  orderForm: document.getElementById("orderForm"),
  orderMessage: document.getElementById("orderMessage"),
  mobileToggle: document.getElementById("mobileToggle"),
  mainNav: document.getElementById("mainNav")
};

const state = {
  query: "",
  category: "all",
  price: "all",
  sort: "popular",
  cart: []
};

function loadPersisted() {
  try {
    state.cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || "[]");
  } catch {
    state.cart = [];
  }
  const city = localStorage.getItem(STORAGE_KEYS.city);
  if (city) {
    refs.citySelector.value = city;
  }
}

function persistCart() {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(state.cart));
}

function formatRub(value) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function withImages(products) {
  return products.map((product) => ({
    ...product,
    image: product.image || CATEGORY_IMAGES[product.category] || "./assets/images/mini-bouquet.png"
  }));
}

function getFilteredProducts() {
  const q = state.query.trim().toLowerCase();
  const list = withImages(PRODUCTS)
    .filter((item) => (state.category === "all" ? true : item.category === state.category))
    .filter((item) => {
      if (state.price === "all") return true;
      const [from, to] = state.price.split("-").map(Number);
      return item.price >= from && item.price <= to;
    })
    .filter((item) => {
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.shop.toLowerCase().includes(q) ||
        CATEGORY_NAMES[item.category].toLowerCase().includes(q)
      );
    });

  if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (state.sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (state.sort === "rating") list.sort((a, b) => b.rating - a.rating);
  if (state.sort === "popular") {
    list.sort((a, b) => b.rating * 10 - a.rating * 10 + (a.price - b.price) / 10000);
  }

  return list;
}

function productTemplate(product) {
  return `
    <article class="product-card">
      <img class="product-image" loading="lazy" src="${product.image}" alt="${product.name}" />
      <div class="product-body">
        <h3>${product.name}</h3>
        <div class="product-meta">
          <span>${product.shop}</span>
          <span>${CATEGORY_NAMES[product.category]} • ${product.rating} ★</span>
        </div>
        <div class="price-row">
          <strong>${formatRub(product.price)}</strong>
          <button data-add="${product.id}">В корзину</button>
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  const items = getFilteredProducts();
  refs.productGrid.innerHTML = items.length
    ? items.map(productTemplate).join("")
    : `<p>Ничего не найдено. Попробуйте изменить фильтры.</p>`;
}

function getProductById(id) {
  return PRODUCTS.find((item) => item.id === Number(id));
}

function addToCart(id) {
  const existing = state.cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id, qty: 1 });
  }
  persistCart();
  renderCart();
}

function changeQty(id, delta) {
  const item = state.cart.find((entry) => entry.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== id);
  }
  persistCart();
  renderCart();
}

function cartItemTemplate(entry) {
  const product = getProductById(entry.id);
  if (!product) return "";
  const rowSum = product.price * entry.qty;
  return `
    <article class="cart-item">
      <div class="cart-item-top">
        <strong>${product.name}</strong>
        <span>${formatRub(rowSum)}</span>
      </div>
      <div class="cart-item-controls">
        <button data-minus="${entry.id}">-</button>
        <span>${entry.qty}</span>
        <button data-plus="${entry.id}">+</button>
      </div>
    </article>
  `;
}

function renderCart() {
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const total = state.cart.reduce((sum, entry) => {
    const product = getProductById(entry.id);
    return sum + (product ? product.price * entry.qty : 0);
  }, 0);

  refs.cartCount.textContent = String(count);
  refs.cartItems.innerHTML = state.cart.length
    ? state.cart.map(cartItemTemplate).join("")
    : `<p>Корзина пока пуста.</p>`;
  refs.cartTotal.textContent = formatRub(total);
}

function openCart() {
  refs.cartDrawer.classList.add("open");
  refs.overlay.classList.add("show");
}

function closeCart() {
  refs.cartDrawer.classList.remove("open");
  refs.overlay.classList.remove("show");
}

function debounce(fn, delay = 300) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function attachEvents() {
  refs.searchForm.addEventListener("submit", (event) => event.preventDefault());
  refs.searchInput.addEventListener(
    "input",
    debounce((event) => {
      state.query = event.target.value;
      renderProducts();
    }, 250)
  );

  refs.priceFilter.addEventListener("change", (event) => {
    state.price = event.target.value;
    renderProducts();
  });

  refs.sortFilter.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderProducts();
  });

  refs.tags.forEach((tag) => {
    tag.addEventListener("click", () => {
      refs.tags.forEach((entry) => entry.classList.remove("active"));
      tag.classList.add("active");
      state.category = tag.dataset.category;
      renderProducts();
    });
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
    if (plus) changeQty(Number(plus.dataset.plus), 1);
    if (minus) changeQty(Number(minus.dataset.minus), -1);
  });

  refs.cartButton.addEventListener("click", openCart);
  refs.closeCart.addEventListener("click", closeCart);
  refs.overlay.addEventListener("click", closeCart);

  refs.citySelector.addEventListener("change", (event) => {
    localStorage.setItem(STORAGE_KEYS.city, event.target.value);
  });

  refs.checkoutButton.addEventListener("click", () => {
    closeCart();
    document.getElementById("order").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  refs.orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(refs.orderForm);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    if (!name || phone.length < 8) {
      refs.orderMessage.textContent = "Проверьте имя и телефон.";
      return;
    }
    refs.orderMessage.textContent = "Спасибо! Заявка отправлена. Мы свяжемся с вами в ближайшее время.";
    refs.orderForm.reset();
  });

  refs.mobileToggle.addEventListener("click", () => {
    refs.mainNav.classList.toggle("open");
  });
}

function init() {
  loadPersisted();
  renderProducts();
  renderCart();
  attachEvents();
}

init();
