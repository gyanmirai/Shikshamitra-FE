# Critical icon delivery fixture

Run from the frontend repository:

```powershell
node node_modules/vite/bin/vite.js --config e2e/fixtures/icon-delivery/vite.config.mjs
```

Open http://127.0.0.1:5833/ in the Codex in-app browser.
The fixture renders the real shared Iconify/MUI components and blocks only icon-provider transport.
Verify 38 rendered icons, zero provider attempts, stable glyphs, light/dark colors and contained layouts at 1440, 768 and 320 pixels.
The license link uses the application public notice.

This fixture uses public icon data, has no login and never calls Finance APIs.
It verifies component delivery and layout; it does not establish production latency or financial workflow behavior.
