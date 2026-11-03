# Finance Setup Guide Verification

Runs the real Finance setup screen, shared setup shell, catalog, progress hook and RTK endpoints
against a synthetic API. Authentication state and academic-year control are fixture adapters.
No school, bank, student or financial records are read or written.

```bash
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js --config e2e/fixtures/finance-setup-guide/vite.config.mts
```

Open `http://127.0.0.1:4188` in the Codex in-app browser. Check desktop and 390px phone layouts,
tab and sidebar keyboard navigation, inline manager loading, deferred progress, final review, academic-year
switching and scope isolation. Query flags: `configured`, `readonly`, `limited`, `denied`, `loadError`,
`conflict`, `dark`. Stage/setting deep links use the production query parameters.

This proves component integration only. Authenticated Next/API/database sign-off remains separate.

The fixture API owns guide progress only. Verify the embedded native Finance tables and add/edit forms in the authenticated local Next frontend; their data and mutation endpoints are not simulated by this fixture.
