import sqlite3 from "sqlite3";
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";

dotenv.config();

const DB_FILE = process.env.SQLITE_PATH || "./data/shop.db";
const resolvedPath = path.resolve(process.cwd(), DB_FILE);
const dbDir = path.dirname(resolvedPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

sqlite3.verbose();

export const db = new sqlite3.Database(resolvedPath);

export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

export async function initializeDatabase() {
  await run(`PRAGMA foreign_keys = ON`);

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      city TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      rating REAL NOT NULL DEFAULT 5,
      shop TEXT NOT NULL,
      badge TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      description TEXT DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      total INTEGER NOT NULL,
      delivery_date TEXT DEFAULT '',
      address TEXT DEFAULT '',
      comment TEXT DEFAULT '',
      city TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      rating REAL NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  const count = await get(`SELECT COUNT(*) AS total FROM products`);
  if (!count || count.total === 0) {
    const seeds = [
      ["Rosa Cloud", "roses", 4100, 4.9, "Bloom Atelier", "Хит", "Воздушный букет из премиальных роз."],
      ["Rose Garden", "roses", 7200, 4.8, "Rose Crafters", "", "Классический букет для важных моментов."],
      ["Peony Air", "peonies", 6900, 4.8, "Mira Flowers", "Новинка", "Нежные пионы в пастельной гамме."],
      ["Tulip Story", "tulips", 4600, 4.6, "Flowline", "", "Яркий весенний букет тюльпанов."],
      ["White Morning", "designer", 10200, 4.9, "Atelier 24", "Хит", "Авторская композиция в белых тонах."],
      ["Basket Meadow", "baskets", 7700, 4.7, "Baskette", "", "Цветочная корзина для праздника."],
      ["Silk Composition", "compositions", 9100, 4.8, "Forma Flora", "", "Стильная композиция в современном стиле."],
      ["Gift Set Premium", "giftsets", 7900, 4.8, "Gift Flower Lab", "Хит", "Подарочный набор с букетом и свечой."]
    ];

    for (const item of seeds) {
      await run(
        `INSERT INTO products (name, category, price, rating, shop, badge, description) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    }
  }
}
