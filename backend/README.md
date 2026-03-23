# Floristry Backend

Node.js API для marketplace цветов.

## Stack

- Express
- SQLite (`sqlite3`)
- JWT auth
- role-based access (`customer`, `admin`)

## Setup

```bash
cp .env.example .env
npm install
npm run seed
npm start
```

## ENV

- `PORT`
- `JWT_SECRET`
- `CORS_ORIGIN` (comma-separated)
- `SQLITE_PATH`

## Seed admin

`npm run seed` создаст admin:

- `admin@floristry.local`
- `admin123`
