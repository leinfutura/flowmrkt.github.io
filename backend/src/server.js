import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { all, get, initializeDatabase, run } from "./db.js";
import { makePasswordHash, signToken, verifyPassword } from "./auth.js";
import { requireAdmin, requireAuth } from "./middleware.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

const corsOrigin = (process.env.CORS_ORIGIN || "http://localhost:5500")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

app.use(cors({ origin: corsOrigin, credentials: false }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "floristry-backend" });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email = "", password = "", name = "", phone = "", city = "" } = req.body || {};
    if (!email.trim() || !password.trim() || password.length < 6 || !name.trim()) {
      return res.status(400).json({ error: "Проверьте email, пароль (минимум 6) и имя" });
    }

    const exists = await get(`SELECT id FROM users WHERE email = ?`, [email.trim().toLowerCase()]);
    if (exists) return res.status(409).json({ error: "Пользователь уже существует" });

    const { hash, salt } = makePasswordHash(password);
    const created = await run(
      `INSERT INTO users (email, password_hash, password_salt, role, name, phone, city) VALUES (?, ?, ?, 'customer', ?, ?, ?)`,
      [email.trim().toLowerCase(), hash, salt, name.trim(), phone.trim(), city.trim()]
    );

    const user = await get(`SELECT id, email, role, name, phone, city, created_at FROM users WHERE id = ?`, [created.id]);
    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email = "", password = "" } = req.body || {};
    const user = await get(`SELECT * FROM users WHERE email = ?`, [email.trim().toLowerCase()]);
    if (!user) return res.status(401).json({ error: "Неверный email или пароль" });

    const ok = verifyPassword(password, user.password_salt, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Неверный email или пароль" });

    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
      city: user.city,
      created_at: user.created_at
    };
    const token = signToken(safeUser);
    return res.json({ token, user: safeUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await get(
      `SELECT id, email, role, name, phone, city, created_at FROM users WHERE id = ?`,
      [Number(req.user.sub)]
    );
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch("/api/account/profile", requireAuth, async (req, res) => {
  try {
    const { name = "", phone = "", city = "" } = req.body || {};
    await run(`UPDATE users SET name = ?, phone = ?, city = ? WHERE id = ?`, [name.trim(), phone.trim(), city.trim(), Number(req.user.sub)]);
    const user = await get(`SELECT id, email, role, name, phone, city, created_at FROM users WHERE id = ?`, [Number(req.user.sub)]);
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { q = "", category = "all", min = "", max = "", sort = "popular" } = req.query;
    const where = ["is_active = 1"];
    const params = [];

    if (category !== "all") {
      where.push("category = ?");
      params.push(String(category));
    }

    if (q) {
      where.push("(name LIKE ? OR shop LIKE ? OR category LIKE ?)");
      const term = `%${String(q).trim()}%`;
      params.push(term, term, term);
    }

    if (min !== "") {
      where.push("price >= ?");
      params.push(Number(min));
    }

    if (max !== "") {
      where.push("price <= ?");
      params.push(Number(max));
    }

    let orderBy = "rating DESC, price ASC";
    if (sort === "price-asc") orderBy = "price ASC";
    if (sort === "price-desc") orderBy = "price DESC";
    if (sort === "rating") orderBy = "rating DESC";

    const rows = await all(`SELECT * FROM products WHERE ${where.join(" AND ")} ORDER BY ${orderBy}`, params);
    return res.json({ items: rows });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const row = await get(`SELECT * FROM products WHERE id = ? AND is_active = 1`, [Number(req.params.id)]);
    if (!row) return res.status(404).json({ error: "Товар не найден" });
    return res.json({ item: row });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/orders", requireAuth, async (req, res) => {
  try {
    const { items = [], delivery_date = "", address = "", comment = "", city = "" } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Корзина пуста" });
    }

    let total = 0;
    const normalized = [];
    for (const raw of items) {
      const productId = Number(raw.product_id);
      const quantity = Number(raw.quantity || 1);
      if (!productId || quantity <= 0) continue;

      const product = await get(`SELECT id, price, is_active FROM products WHERE id = ?`, [productId]);
      if (!product || product.is_active !== 1) continue;

      total += product.price * quantity;
      normalized.push({ productId, quantity, price: product.price });
    }

    if (normalized.length === 0) {
      return res.status(400).json({ error: "Нет доступных товаров для заказа" });
    }

    const created = await run(
      `INSERT INTO orders (user_id, status, total, delivery_date, address, comment, city) VALUES (?, 'new', ?, ?, ?, ?, ?)`,
      [Number(req.user.sub), total, String(delivery_date), String(address), String(comment), String(city)]
    );

    for (const item of normalized) {
      await run(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [created.id, item.productId, item.quantity, item.price]
      );
    }

    return res.status(201).json({ order_id: created.id, total });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/account/orders", requireAuth, async (req, res) => {
  try {
    const orders = await all(
      `SELECT id, status, total, delivery_date, address, comment, city, created_at FROM orders WHERE user_id = ? ORDER BY id DESC`,
      [Number(req.user.sub)]
    );

    for (const order of orders) {
      const items = await all(
        `SELECT oi.product_id, oi.quantity, oi.price, p.name FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    return res.json({ items: orders });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/stats", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const users = await get(`SELECT COUNT(*) AS total FROM users`);
    const products = await get(`SELECT COUNT(*) AS total FROM products`);
    const orders = await get(`SELECT COUNT(*) AS total FROM orders`);
    const revenue = await get(`SELECT COALESCE(SUM(total), 0) AS total FROM orders`);
    return res.json({
      users: users.total,
      products: products.total,
      orders: orders.total,
      revenue: revenue.total
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/users", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const rows = await all(`SELECT id, email, role, name, phone, city, created_at FROM users ORDER BY id DESC`);
    return res.json({ items: rows });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/orders", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const rows = await all(
      `SELECT o.id, o.status, o.total, o.delivery_date, o.address, o.comment, o.city, o.created_at, u.email, u.name
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.id DESC`
    );
    return res.json({ items: rows });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch("/api/admin/orders/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status = "" } = req.body || {};
    const allowed = ["new", "processing", "shipping", "done", "canceled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Недопустимый статус" });
    }
    await run(`UPDATE orders SET status = ? WHERE id = ?`, [status, Number(req.params.id)]);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/products", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const rows = await all(`SELECT * FROM products ORDER BY id DESC`);
    return res.json({ items: rows });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/products", requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      name = "",
      category = "",
      price = 0,
      rating = 5,
      shop = "",
      badge = "",
      image_url = "",
      description = ""
    } = req.body || {};

    if (!name.trim() || !category.trim() || !shop.trim() || Number(price) <= 0) {
      return res.status(400).json({ error: "Проверьте обязательные поля" });
    }

    const created = await run(
      `INSERT INTO products (name, category, price, rating, shop, badge, image_url, description, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [name.trim(), category.trim(), Number(price), Number(rating), shop.trim(), badge.trim(), image_url.trim(), description.trim()]
    );

    const item = await get(`SELECT * FROM products WHERE id = ?`, [created.id]);
    return res.status(201).json({ item });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch("/api/admin/products/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const existing = await get(`SELECT * FROM products WHERE id = ?`, [Number(req.params.id)]);
    if (!existing) return res.status(404).json({ error: "Товар не найден" });

    const patch = { ...existing, ...req.body };
    await run(
      `UPDATE products SET name = ?, category = ?, price = ?, rating = ?, shop = ?, badge = ?, image_url = ?, description = ?, is_active = ? WHERE id = ?`,
      [
        String(patch.name || "").trim(),
        String(patch.category || "").trim(),
        Number(patch.price || 0),
        Number(patch.rating || 5),
        String(patch.shop || "").trim(),
        String(patch.badge || "").trim(),
        String(patch.image_url || "").trim(),
        String(patch.description || "").trim(),
        Number(patch.is_active ? 1 : 0),
        Number(req.params.id)
      ]
    );

    const item = await get(`SELECT * FROM products WHERE id = ?`, [Number(req.params.id)]);
    return res.json({ item });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/admin/products/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await run(`DELETE FROM products WHERE id = ?`, [Number(req.params.id)]);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function bootstrap() {
  await initializeDatabase();
  app.listen(port, () => {
    console.log(`Floristry backend running at http://localhost:${port}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
