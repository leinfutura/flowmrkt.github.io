# Floristry (Full-stack)

Готовый full-stack проект цветочного маркетплейса:

- клиент: статический сайт (`index.html`) + кабинет (`account.html`) + админка (`admin.html`)
- backend API: Node.js + Express + SQLite + JWT + роли

## Что реализовано

- Каталог, фильтры, корзина, оформление заказа
- Регистрация / вход пользователей
- Личный кабинет: профиль, список заказов
- Админка: статистика, список пользователей, заказы, управление товарами
- База данных SQLite с автосозданием таблиц и seed-данными

## Структура

- `index.html`, `app.js`, `styles.css` — storefront
- `account.html`, `account.js` — кабинет
- `admin.html`, `admin.js` — админ-панель
- `backend/` — API сервер и БД

## Запуск backend локально

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run start
```

По умолчанию API: `http://localhost:4000/api`

Тестовый админ после `npm run seed`:

- email: `admin@floristry.local`
- password: `admin123`

## API эндпоинты

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/account/profile`
- `GET /api/account/orders`
- `POST /api/orders`
- `GET /api/products`

Admin:

- `GET /api/admin/stats`
- `GET /api/admin/users`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`

## Важно по GitHub Pages

GitHub Pages хостит только frontend. Backend нужно деплоить отдельно (Railway/Render/Fly.io/VPS).

После деплоя backend:

- открой `account.html`
- укажи `API Base URL` (например `https://your-backend-domain/api`)
- сохрани URL

## Деплой frontend

Frontend остается в корне репозитория (`main`, `/root`) и публикуется через GitHub Pages.
