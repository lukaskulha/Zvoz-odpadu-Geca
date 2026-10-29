# Zvoz odpadu Geča – moved

The waste collection app for Geča is now part of one app for several villages:

**https://zvoz-odpadu.netlify.app/geca/**

Source code: https://github.com/lukaskulha/zvoz-odpadu

This repository only keeps the old address (https://zvoz-odpadu-geca.netlify.app/) working: Netlify redirects every request
to the new app (see `netlify.toml`), and `sw.js` removes the old offline copy from phones
where the app was installed.
