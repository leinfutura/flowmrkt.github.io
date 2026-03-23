const API_BASE = window.localStorage.getItem("FLORISTRY_API_BASE") || "http://localhost:4000/api";
const TOKEN_KEY = "FLORISTRY_AUTH_TOKEN";

function setStatus(el, message, isError = false) {
  if (!el) return;
  el.textContent = message;
  el.style.color = isError ? "#b3261e" : "#1f7a42";
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
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

const refs = {
  baseInput: document.getElementById("apiBaseInput"),
  saveBaseButton: document.getElementById("saveBaseButton"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  profileForm: document.getElementById("profileForm"),
  logoutButton: document.getElementById("logoutButton"),
  authState: document.getElementById("authState"),
  profileState: document.getElementById("profileState"),
  ordersState: document.getElementById("ordersState"),
  ordersList: document.getElementById("ordersList")
};

if (refs.baseInput) refs.baseInput.value = API_BASE;

refs.saveBaseButton?.addEventListener("click", () => {
  const value = refs.baseInput.value.trim();
  if (!value) return;
  localStorage.setItem("FLORISTRY_API_BASE", value);
  setStatus(refs.authState, "API URL сохранен. Перезагрузите страницу.");
});

refs.loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(refs.loginForm);

  try {
    const payload = {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || "")
    };
    const data = await request("/auth/login", { method: "POST", body: JSON.stringify(payload) });
    localStorage.setItem(TOKEN_KEY, data.token);
    setStatus(refs.authState, `Вход выполнен: ${data.user.name}`);
    await loadMe();
    await loadOrders();
  } catch (error) {
    setStatus(refs.authState, error.message, true);
  }
});

refs.registerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(refs.registerForm);

  try {
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      phone: String(formData.get("phone") || ""),
      city: String(formData.get("city") || "")
    };
    const data = await request("/auth/register", { method: "POST", body: JSON.stringify(payload) });
    localStorage.setItem(TOKEN_KEY, data.token);
    setStatus(refs.authState, `Аккаунт создан: ${data.user.name}`);
    await loadMe();
    await loadOrders();
  } catch (error) {
    setStatus(refs.authState, error.message, true);
  }
});

refs.profileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(refs.profileForm);

  try {
    const payload = {
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      city: String(formData.get("city") || "")
    };
    const data = await request("/account/profile", { method: "PATCH", body: JSON.stringify(payload) });
    setStatus(refs.profileState, `Профиль обновлен: ${data.user.name}`);
  } catch (error) {
    setStatus(refs.profileState, error.message, true);
  }
});

refs.logoutButton?.addEventListener("click", () => {
  localStorage.removeItem(TOKEN_KEY);
  setStatus(refs.authState, "Вы вышли из аккаунта");
  refs.ordersList.innerHTML = "";
});

async function loadMe() {
  try {
    const data = await request("/auth/me");
    if (refs.profileForm) {
      refs.profileForm.name.value = data.user.name || "";
      refs.profileForm.phone.value = data.user.phone || "";
      refs.profileForm.city.value = data.user.city || "";
    }
    setStatus(refs.profileState, `Роль: ${data.user.role}`);
  } catch {
    setStatus(refs.profileState, "Войдите в аккаунт, чтобы редактировать профиль", true);
  }
}

async function loadOrders() {
  try {
    const data = await request("/account/orders");
    refs.ordersList.innerHTML = data.items.length
      ? data.items
          .map(
            (order) => `
              <article class="panel-card">
                <h4>Заказ #${order.id} — ${order.status}</h4>
                <p>Сумма: ${Number(order.total).toLocaleString("ru-RU")} RUB</p>
                <p>Дата доставки: ${order.delivery_date || "не указана"}</p>
                <p>Создан: ${order.created_at}</p>
              </article>
            `
          )
          .join("")
      : "<p>Заказов пока нет.</p>";
    setStatus(refs.ordersState, "Заказы загружены");
  } catch (error) {
    setStatus(refs.ordersState, error.message, true);
  }
}

loadMe();
loadOrders();
