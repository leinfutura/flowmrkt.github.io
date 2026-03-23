# Flow Market

Minimalist and aesthetic flower marketplace website (HTML + CSS + JS) prepared for GitHub Pages.

## Included

- Hero, categories, catalog, features, testimonials, FAQ, contacts
- Search (debounced), category/price/sort filters
- Cart with quantity controls and total
- LocalStorage persistence for cart and city selector
- Quick order form validation
- SEO basics: `robots.txt`, `sitemap.xml`, Open Graph meta tags
- GitHub Pages deployment workflow

## Local Run

Option 1: open `index.html` directly in browser.

Option 2 (recommended): run local static server:

```powershell
cd d:\flowwow
python -m http.server 5500
```

Then open `http://localhost:5500`.

## GitHub Pages Deploy

1. Create empty GitHub repository, for example `flow-market`.
2. Initialize git and push:

```powershell
cd d:\flowwow
git init
git add .
git commit -m "Initial Flow Market site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/flow-market.git
git push -u origin main
```

3. In GitHub repository settings, enable Pages source: `GitHub Actions`.
4. Update URLs in:
- `index.html` (`og:url`)
- `sitemap.xml` (`https://YOUR_USERNAME.github.io/flow-market/`)

After push, workflow `.github/workflows/deploy.yml` publishes automatically.
