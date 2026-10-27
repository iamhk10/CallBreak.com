# ΣTΣЯПITY — Installable PWA

A static Progressive Web App for the ΣTΣЯПITY scorecard. The UI and game logic are contained in `index.html`; the manifest, icons, and service worker make it installable and allow the app shell to launch offline after the first successful visit.

## Deploy / host

1. Extract the ZIP and upload the **contents of the `ETERNITY` folder together**, preserving `index.html`, `manifest.webmanifest`, `sw.js`, and the `icons/` directory.
2. Host it on an HTTPS website (GitHub Pages, Netlify, Vercel, or your own HTTPS hosting).
3. Open the deployed URL once while online.
4. On Android/desktop Chrome or another supported browser, choose **Install app** / **Install ΣTΣЯПITY**. On iPhone/iPad Safari, use **Share → Add to Home Screen**.

## Offline and local data

- The service worker pre-caches the app shell and icons for offline launch after the first successful online visit.
- Scores, settings, themes, fonts, and player history are saved in the browser's local storage on that device.
- Browser storage is not cloud-synced. Clearing site data can remove local history.
- External Google Fonts may not be available offline; the app falls back to local system fonts.

## Updating

When publishing an update, change `VERSION` near the top of `sw.js` (for example, `eternity-v1.0.1`) and upload the full folder again. Users may need to close/reopen the installed app or refresh once to pick up the update.

## Project structure

- `index.html` — app UI and game logic
- `manifest.webmanifest` — app name, install mode, theme, icons, and app shortcuts
- `sw.js` — offline app-shell caching
- `icons/` — app icons, favicon, and Apple touch icon
