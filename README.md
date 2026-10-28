# Waste Collection Calendar – Geča 2026

A free, lightweight web app (PWA) with the 2026 waste collection calendar for the village of **Geča, Slovakia**. Sister project of [Zvoz odpadu Čaňa](https://github.com/lukaskulha/Zvoz-odpadu-Cana).

**Live app:** https://zvoz-odpadu-geca.netlify.app/

> This is an unofficial, community project. It is not affiliated with the municipality of Geča or KOSIT a.s. The dates were transcribed from the official KOSIT collection calendar for Geča 2026: https://www.kosit.sk/wp-content/uploads/2025/12/Geca.pdf. If in doubt, the official calendar applies. Found a mistake? Please open an issue.

## Features

- Days remaining until the next collection of mixed waste, glass, paper, and plastics/metals/beverage cartons
- Warnings on the tiles: red "take it out" notice for collections today or tomorrow, yellow notice for collections later this calendar week
- Colour-coded monthly calendar with today highlighted
- "Add to calendar" button: generates an `.ics` file you can import into iPhone, Android or any other calendar app. You choose which waste types to include and when to be reminded:
  - day before: 7:00, 13:00 or 19:00
  - on collection day: 6:00, 7:00 or 10:00
- A guide to what belongs in each bin and what does not
- A separate **Other waste (Iný odpad)** tab: Geča has no collection yard, so the tab explains how bulky waste, small construction waste, e-waste, batteries, hazardous waste, textiles, cooking oil and green waste are handled, with the municipal office contact
- Light and dark theme: automatic (follows your phone) or chosen manually
- Installable as an app on your home screen, works offline
- Interface in Slovak, Hungarian and English (flag menu next to the theme switch; Hungarian is picked automatically when the phone is set to Hungarian, the choice is remembered, and `?lang=hu` / `?lang=en` in the link opens a specific language)

## Install on your phone

- **iPhone:** open the link in Safari, tap Share, then **Add to Home Screen**.
- **Android:** open the link in Chrome, tap the ⋮ menu, then **Install app** or **Add to Home screen**.

## Privacy

The app stores your settings (theme, language, reminder times) only in your own browser using `localStorage`. There are no accounts, no cookies, and no server-side data.

Visit counts are measured anonymously with [GoatCounter](https://www.goatcounter.com/) (`zvozgeca.goatcounter.com`), which uses no cookies and collects no personal data. **If you fork this project, replace the GoatCounter script tag at the bottom of `index.html` with your own, or remove it.**

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole app: markup, styles and JavaScript in one file |
| `sw.js` | Service worker for offline use |
| `manifest.webmanifest` | Web app manifest (name, icons, colours) |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | App icons (bin with colour stripes for the four waste types) |
| `i18n.js` | All texts in Slovak, Hungarian and English |
| `scripts/check-i18n.js`, `netlify.toml` | Translation check, run automatically by Netlify before each deploy |
| `og-image.png` | Preview image for link sharing (Open Graph) |
| `robots.txt`, `sitemap.xml` | Search engine hints. **If the site address changes, update the URLs in these files and in the `canonical` and `og:` tags of `index.html`.** |

There is no build step and there are no dependencies.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. The service worker and install prompt need `localhost` or HTTPS.

## Deploy

Any static host works (Netlify, GitHub Pages, Cloudflare Pages). On Netlify, link this repository so every commit to `main` deploys automatically.

## Updating the dates

Collection dates are defined in the `D` object at the top of the main script in `index.html`. Keys are `K` (mixed waste), `S` (glass), `P` (paper) and `L` (plastics and metals), each mapping month numbers to lists of days. If mixed waste is ever collected on two different days depending on the street, set `KSW = true`: a Thursday/Friday switch appears on the tile and the Friday dates are derived by shifting the listed dates by one day. When KOSIT publishes the next year's calendar, update these lists and the year in the texts.

## Updating the "Other waste" tab

The texts are the `io_*` keys in `i18n.js` (`io_t` = titles, `io_d` = descriptions, same order; the icons are the `IOI` list in `index.html`). Source: Geča bylaw VZN No. 2/2016 on municipal and small construction waste, as amended by VZN No. 6/2022 (obecgeca.sk).

## Translations

All texts shown to users are in `i18n.js`, with Slovak (`sk`) as the reference and Hungarian (`hu`) and English (`en`) translations. Run the check before you commit:

```bash
node scripts/check-i18n.js
```

Netlify runs the same check before every deploy (`netlify.toml`), so an incomplete translation never goes live.

## License

Released under the MIT License, see [LICENSE](LICENSE). The collection schedule itself comes from KOSIT a.s.
