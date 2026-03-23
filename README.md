# Flow Market

Minimalistic and aesthetic flower shop for GitHub Pages with dynamic catalog, cart, and order flow.

## Live URL

- https://leinfutura.github.io/flowmrkt.github.io/

## Tech

- Static HTML + CSS + JavaScript for runtime
- TypeScript source included in `app.ts`
- LocalStorage for cart, selected city, and active category

## Features

- Pastel visual style with responsive layout (desktop + mobile)
- Category gallery with flower photos
- Live search, category filters, price filters, and sorting
- City selector with dynamic pricing adjustment
- Cart drawer with quantity management and persistent storage
- Order form with client-side validation
- Smooth reveal animations and accessible focus states

## Project files

- `index.html` - page structure and SEO meta tags
- `styles.css` - design system and responsive styles
- `app.js` - runtime script used by GitHub Pages
- `app.ts` - typed source version for future maintenance

## Deploy to GitHub Pages

1. Push all files to your repository root (`flowmrkt.github.io`).
2. In GitHub repository settings, open `Pages`.
3. Set source to `Deploy from a branch`.
4. Choose branch `main` and folder `/ (root)`.
5. Wait for GitHub Pages build and open your live URL.

## Notes

- Category photos are included from local free-to-use assets in `assets/images/catalog`.
- No backend required for basic operation.