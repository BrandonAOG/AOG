# Always On Generators — Field Operations Hub

A mobile-first Progressive Web App (PWA) built for Always On Generators field technicians. The hub centralizes all field forms, NEC calculators, and reference tools in one offline-capable portal deployed via GitHub Pages.

---

## Live Site

**[brandonaog.github.io/AOG](https://brandonaog.github.io/AOG)**

---

## Features

- **11 field tool modules** accessible from a single dashboard
- **Offline support** via service worker — works in the field without a connection
- **Installable PWA** — add to home screen on iOS or Android, works like a native app
- **Auto-update toast** — notifies technicians when a new version is available
- **PWA shortcuts** — jump directly to any tool from the home screen long-press menu

---

## Tool Modules

| Module | Description |
|---|---|
| ⚡ Electrical Install | New generator installation paperwork & checklists |
| 🔥 Gas Installation | Gas line hookup, connection & installation paperwork |
| 📋 Estimate Form | Quote & pricing forms for new jobs |
| 🔧 Maintenance Form | Service logs, PMs & repair documentation |
| 📍 Site Visit Form | On-site inspection & assessment forms |
| ✏️ Sketch Pad | Freehand site diagrams & field drawings |
| 📐 Conduit Fill | NEC Chapter 9 conduit sizing & fill calculations |
| ⚡ Load Calculation *(experimental)* | Advanced power load analysis & sizing (NEC 2020) |
| 🔥 Gas Calculator | BTU sizing, pipe sizing & Generac model selection · 10–150kW |
| 🔌 Breaker & Conductor | NEC conductor sizing, derating, EGC & parallel sets |
| 📄 Spec Viewer | Generac generator & ATS full specs · 10–150kW · All transfer switches |

---

## Repo Structure

```
AOG/
├── index.html              # Main hub dashboard
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (offline caching & update logic)
├── update-banner.js        # Update toast helper
├── offline.html            # Fallback page when offline and page not cached
├── logo.png                # Company logo
├── icons/                  # PWA icons (192px, 512px, apple-touch-icon)
├── elect-install/          # Electrical Install module
├── gas-install/            # Gas Installation module
├── estimate/               # Estimate Form module
├── maintenance/            # Maintenance Form module
├── site-visit/             # Site Visit Form module
├── sketch-pad/             # Sketch Pad module
├── conduit-fill/           # Conduit Fill module
├── load-calcs/             # Load Calculation module
├── gas-calc/               # Gas Calculator module
├── breaker-conductor/      # Breaker & Conductor module
└── spec-viewer/            # Spec Viewer module
```

---

## Tech Stack

- **Pure HTML / CSS / JavaScript** — no framework, no build step, no dependencies
- **Service Worker** — cache-first strategy with background update detection
- **Web App Manifest** — full PWA with home screen install and shortcuts
- **GitHub Pages** — zero-config static hosting

---

## Installing on a Phone

**Android (Chrome)**
1. Open the site in Chrome
2. Tap the browser menu → *Add to Home Screen*
3. Tap *Install*

**iOS (Safari)**
1. Open the site in Safari
2. Tap the Share button → *Add to Home Screen*
3. Tap *Add*

Once installed, the app opens in standalone mode (no browser chrome) and works offline after the first load.

---

## Adding a New Tool Module

1. Create a new folder at the repo root (e.g. `my-tool/`)
2. Add an `index.html` inside it
3. Register the route in `index.html` under `FORM_URLS`:
   ```js
   const FORM_URLS = {
     // ...existing entries...
     'my-tool': './my-tool/',
   };
   ```
4. Add a card in the `forms-grid` section with `data-form="my-tool"`
5. Update `sw.js` to include the new path in the cache list

---

## Offline Behavior

On first load, the service worker caches all core assets and module pages. Subsequent visits — including with no network — are served from cache. When a new version is deployed, a toast notification appears in the bottom-right corner giving technicians the option to update immediately or dismiss.

---

## Deployment

The site is deployed automatically via **GitHub Pages** from the `main` branch root. No build process required — push to `main` and the site updates within seconds.

---

*Always On Generators  · Power When You Need It*
Made and developed by Brandon Keilholz
