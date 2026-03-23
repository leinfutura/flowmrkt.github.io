import { verifyToken } from "./auth.js";

export function requireAuth(req, res, next) {
  const raw = req.headers.authorization || "";
  const token = raw.startsWith("Bearer ") ? raw.slice(7) : "";

  if (!token) {
    return res.status(401).json({ error: "Необходима авторизация" });
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: "Недействительный токен" });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Доступ только для администратора" });
  }
  return next();
}
