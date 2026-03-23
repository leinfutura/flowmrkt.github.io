import dotenv from "dotenv";
import { get, run } from "../src/db.js";
import { makePasswordHash } from "../src/auth.js";
import { initializeDatabase } from "../src/db.js";

dotenv.config();

async function seedAdmin() {
  await initializeDatabase();

  const email = "admin@floristry.local";
  const password = "admin123";
  const exists = await get(`SELECT id FROM users WHERE email = ?`, [email]);

  if (exists) {
    console.log("Admin already exists:", email);
    return;
  }

  const { hash, salt } = makePasswordHash(password);
  await run(
    `INSERT INTO users (email, password_hash, password_salt, role, name, phone, city) VALUES (?, ?, ?, 'admin', ?, ?, ?)`,
    [email, hash, salt, "Администратор", "+7 (000) 000-00-00", "Москва"]
  );

  console.log("Admin created:");
  console.log("  email:", email);
  console.log("  password:", password);
}

seedAdmin().catch((e) => {
  console.error(e);
  process.exit(1);
});
