# Zvoz odpadu Geča – rules for changes

This is a static PWA (no build step). Netlify deploys every push to `main` automatically.

## Translations (SK, HU, EN) – mandatory
- All user-visible text lives in `i18n.js` (`sk` is the reference). Never write visible text
  directly into `index.html`: add a key to **all three languages** and use `T("key")`
  (or `TP("key", n)` for plurals, or `data-i18n="key"` / `data-i18n-aria="key"` in markup).
- Plural values are arrays of 3 forms `[1, 2–4, 5+]`; placeholders (`{n}`, `{t}`, `{x}`…) must
  match in every language.
- Dates use `fmtDate()` (locale from the `locale` key), never a hard-coded `"sk-SK"`.
- Before committing, run `node scripts/check-i18n.js` – it must report 0 errors.
  Netlify runs the same check (`netlify.toml`) and stops the deploy if it fails.
- Strings that users never see (analytics labels) may stay Slovak; mark the line with `i18n-ignore`.
- Hungarian texts were machine-translated; ask the owner before larger wording changes.

## Releasing
- Bump `APP_VERSION` in `index.html` and the cache name `C` in `sw.js` for every release.
- Every new file the app needs offline must be added to the precache list in `sw.js`.
- Commit messages in Slovak, short summary of the change.
