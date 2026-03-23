import crypto from "node:crypto";
import jwt from "jsonwebtoken";

const ITERATIONS = 120000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

export function makePasswordHash(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return { salt, hash };
}

export function verifyPassword(password, salt, hash) {
  const nextHash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(nextHash, "hex"));
}

export function signToken(user) {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
      email: user.email,
      name: user.name
    },
    secret,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
