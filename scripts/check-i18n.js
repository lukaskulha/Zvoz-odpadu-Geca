#!/usr/bin/env node
/*
 * Translation check. Runs on every Netlify deploy (see netlify.toml) and can be run
 * locally:  node scripts/check-i18n.js
 * Exit code 1 = errors (the deploy is stopped, the previous version stays online).
 *
 * Errors:
 *  - a key is missing in a language, or a language has an extra key
 *  - value types differ (text vs list), lists have different lengths, empty values
 *  - placeholders ({n}, {t}, {x}, ...) differ between languages
 *  - index.html uses a key (data-i18n="..." or T("...")/TP("...")) that does not exist
 *  - index.html contains user-visible text outside i18n.js:
 *      * text in the <body> markup that is not inside an element with data-i18n
 *      * a string in an inline <script> with Slovak diacritics
 *        (add the comment "i18n-ignore" on that line for non-visible strings, e.g. analytics)
 * Warnings (do not stop the deploy):
 *  - a translation is identical to Slovak (maybe forgotten), unless listed in SAME_OK
 *  - a key seems unused
 */
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const { I18N, I18N_PLURAL } = require(path.join(root, "i18n.js"));
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const REF = "sk";
const LANGS = Object.keys(I18N);
const SAME_OK = new Set(["theme_auto", "theme_label", "month_title", "io_zip", "io_addr", "place", "locale"]);
// Keys built dynamically in code, e.g. T("type_" + k)
const DYNAMIC_PREFIXES = ["type_", "typeFull_", "typeShort_", "guide_", "thu", "fri", "lang_name"];
const ALLOWED_TEXT = new Set(["‹", "›", "—"]);

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const placeholders = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join(",");

// 1) dictionary consistency
const ref = I18N[REF];
if (!ref) err(`Reference language "${REF}" is missing`);
for (const l of LANGS) {
  if (!I18N_PLURAL || typeof I18N_PLURAL[l] !== "function") err(`[${l}] missing plural rule in I18N_PLURAL`);
  const d = I18N[l];
  for (const k of Object.keys(ref)) {
    if (!(k in d)) { err(`[${l}] missing key "${k}"`); continue; }
    const a = ref[k], b = d[k];
    if (Array.isArray(a) !== Array.isArray(b)) { err(`[${l}] "${k}" must be ${Array.isArray(a) ? "a list" : "a text"} like in ${REF}`); continue; }
    if (Array.isArray(a)) {
      if (a.length !== b.length) err(`[${l}] "${k}" has ${b.length} items, ${REF} has ${a.length}`);
      b.forEach((v, i) => {
        if (typeof v !== "string" || !v.trim()) err(`[${l}] "${k}"[${i}] is empty`);
        else if (a[i] !== undefined && placeholders(v) !== placeholders(a[i])) err(`[${l}] "${k}"[${i}] placeholders ${placeholders(v) || "none"} ≠ ${REF} ${placeholders(a[i]) || "none"}`);
      });
      if (l !== REF && JSON.stringify(a) === JSON.stringify(b) && !SAME_OK.has(k)) warn(`[${l}] "${k}" is identical to ${REF}`);
    } else {
      if (typeof b !== "string" || !b.trim()) { err(`[${l}] "${k}" is empty`); continue; }
      if (placeholders(a) !== placeholders(b)) err(`[${l}] "${k}" placeholders ${placeholders(b) || "none"} ≠ ${REF} ${placeholders(a) || "none"}`);
      if (l !== REF && a === b && !SAME_OK.has(k) && a.length > 3) warn(`[${l}] "${k}" is identical to ${REF}: "${a}"`);
    }
  }
  for (const k of Object.keys(d)) if (!(k in ref)) err(`[${l}] extra key "${k}" (not in ${REF})`);
}

// 2) keys used in index.html must exist
const used = new Set();
for (const m of html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)) used.add(m[1]);
for (const m of html.matchAll(/\bTP?\(\s*"([A-Za-z0-9_]+)"\s*[,)]/g)) used.add(m[1]);
for (const k of used) if (!(k in ref)) err(`index.html uses unknown key "${k}"`);
for (const k of Object.keys(ref)) {
  const seen = used.has(k) || html.includes(`"${k}"`) || html.includes(`'${k}'`) || DYNAMIC_PREFIXES.some((p) => k.startsWith(p));
  if (!seen) warn(`key "${k}" looks unused`);
}

// 3) hard-coded text in <body> markup
const bodyStart = html.indexOf("<body");
let body = html.slice(bodyStart)
  .replace(/<script[\s\S]*?<\/script>/g, "")
  .replace(/<style[\s\S]*?<\/style>/g, "")
  .replace(/<noscript>[\s\S]*?<\/noscript>/g, "") // static Slovak text for search engines
  .replace(/<svg[\s\S]*?<\/svg>/g, "");
for (const m of body.matchAll(/<([a-z0-9]+)([^>]*)>([^<]+)/gi)) {
  const attrs = m[2], text = m[3].trim();
  if (!text || ALLOWED_TEXT.has(text) || !/\p{L}{2,}/u.test(text)) continue;
  if (/data-i18n=/.test(attrs)) {
    const k = (attrs.match(/data-i18n="([^"]+)"/) || [])[1];
    if (k && ref[k] !== undefined && ref[k] !== text) warn(`static text of data-i18n="${k}" differs from ${REF} value`);
    continue;
  }
  err(`hard-coded text in index.html markup: "${text.slice(0, 60)}" – move it to i18n.js and use data-i18n`);
}
// text after closing tags, e.g. "</b> text"
for (const m of body.matchAll(/<\/[a-z0-9]+>([^<]+)/gi)) {
  const text = m[1].trim();
  if (text && /\p{L}{2,}/u.test(text) && !ALLOWED_TEXT.has(text)) err(`hard-coded text in index.html markup: "${text.slice(0, 60)}"`);
}

// 4) Slovak strings inside inline scripts
const DIAC = /[áäčďéíĺľňóôŕšťúýžÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ]/;
for (const sm of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
  if (/application\/ld\+json/.test(sm[0].slice(0, 60))) continue; // SEO data stays Slovak
  sm[1].split("\n").forEach((line) => {
    if (line.includes("i18n-ignore")) return;
    for (const lit of line.matchAll(/(["'`])((?:\\.|(?!\1).)*)\1/g)) {
      if (DIAC.test(lit[2])) err(`Slovak text in script: ${lit[0].slice(0, 70)} – use T("key") from i18n.js (or mark the line with i18n-ignore if it is not visible to users)`);
    }
  });
}

for (const w of warnings) console.log("warning: " + w);
for (const e of errors) console.log("ERROR:   " + e);
console.log(`i18n check: ${LANGS.join(", ")} · ${Object.keys(ref).length} keys · ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
