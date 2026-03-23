const API_BASE = window.localStorage.getItem("FLORISTRY_API_BASE") || "http://localhost:4000/api";
const TOKEN_KEY = "FLORISTRY_AUTH_TOKEN";

const refs = {
  state: document.getElementById("adminState"),
  stats: document.getElementById("statsGrid"),
  users: document.getElementById("usersGrid"),
  orders: document.getElementById("ordersGrid"),
  products: document.getElementById("productsGrid"),
  productForm: document.getElementById("productForm")
};

function setState(message, isError = false) {
  refs.state.textContent = message;
  refs.state.style.color = isError ? "#b3261e" : "#1f7a42";
}

function authHeader() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(options.headers || {})
    },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function loadAll() {
  try {
    const me = await request("/auth/me");
    if (me.user.role !== "admin") throw new Error("Требуется роль admin");

    const [stats, users, orders, products] = await Promise.all([
      request("/admin/stats"),
      request("/admin/users"),
      request("/admin/orders"),
      request("/admin/products")
    ]);

    refs.stats.innerHTML = `
      <article class="panel-card"><h4>Пользователи</h4><p>${stats.users}</p></article>
      <article class="panel-card"><h4>Товары</h4><p>${stats.products}</p></article>
      <article class="panel-card"><h4>Заказы</h4><p>${stats.orders}</p></article>
      <article class="panel-card"><h4>Оборот</h4><p>${Number(stats.revenue).toLocaleString("ru-RU")} RUB</p></article>
    `;

    refs.users.innerHTML = users.items
      .map((u) => `<article class="panel-card"><h4>${u.name}</h4><p>${u.email}</p><p>Роль: ${u.role}</p></article>`)
      .join("");

    refs.orders.innerHTML = orders.items
      .map(
        (o) => `
          <article class="panel-card">
            <h4>Заказ #${o.id}</h4>
            <p>${o.name} (${o.email})</p>
            <p>Статус: ${o.status}</p>
            <p>Сумма: ${Number(o.total).toLocaleString("ru-RU")} RUB</p>
            <label>Изменить статус
              <select data-order-status="${o.id}">
                <option value="new" ${o.status === "new" ? "selected" : ""}>new</option>
                <option value="processing" ${o.status === "processing" ? "selected" : ""}>processing</option>
                <option value="shipping" ${o.status === "shipping" ? "selected" : ""}>shipping</option>
                <option value="done" ${o.status === "done" ? "selected" : ""}>done</option>
                <option value="canceled" ${o.status === "canceled" ? "selected" : ""}>canceled</option>
              </select>
            </label>
          </article>
        `
      )
      .join("");

    refs.products.innerHTML = products.items
      .map(
        (p) => `<article class="panel-card"><h4>${p.name}</h4><p>${p.category}</p><p>${Number(p.price).toLocaleString("ru-RU")} RUB</p><p>active: ${p.is_active}</p></article>`
      )
      .join("");

    setState("Админ-данные загружены");
  } catch (error) {
    setState(error.message, true);
  }
}

refs.orders?.addEventListener("change", async (event) => {
  const select = event.target.closest("select[data-order-status]");
  if (!select) return;
  try {
    await request(`/admin/orders/${select.dataset.orderStatus}`, {
      method: "PATCH",
      body: JSON.stringify({ status: select.value })
    });
    setState("Статус заказа обновлен");
  } catch (error) {
    setState(error.message, true);
  }
});

refs.productForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(refs.productForm);
  try {
    const payload = {
      name: String(data.get("name") || ""),
      category: String(data.get("category") || ""),
      price: Number(data.get("price") || 0),
      rating: Number(data.get("rating") || 5),
      shop: String(data.get("shop") || ""),
      badge: String(data.get("badge") || ""),
      description: String(data.get("description") || "")
    };
    await request("/admin/products", { method: "POST", body: JSON.stringify(payload) });
    refs.productForm.reset();
    setState("Товар создан");
    await loadAll();
  } catch (error) {
    setState(error.message, true);
  }
});

loadAll();
