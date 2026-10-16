# Staff policy access browser regression

This local fixture renders the production Add Staff personal-information form, policy access hook,
shared dialog and stepper, and RTK API clients. Authentication and HTTP responses are synthetic.
Later wizard steps that these tests do not visit are stubbed to keep the dependency build focused.
The server rejects writes; the submit tests intercept their specific request in Playwright.
No real school service or data is used.

Run from the frontend repository:

```powershell
node node_modules/@playwright/test/cli.js test --config e2e/hr/staff-policy-access.config.ts
```

For a manual smoke test:

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/staff-policy-access/vite.config.mts
```

Open `http://127.0.0.1:4197/?scenario=missing-permission`. Other scenarios are `ready`, `forbidden`,
`transient`, `missing-default`, `multiple-default`, and `edit`. Add a unique `run` query value to reset
the first-request failure in the transient scenario. Permission refresh returns all required grants.
The `forbidden` scenario continues returning 403 to represent a server-side denial despite cached grants.

Browser evidence covers prerequisite messages, unauthorized request suppression, default policy
loading, permission refresh, retry, draft retention after submit denial, edit behavior, focus return,
and desktop/mobile/tablet-dark layouts. Backend tests own actual permission enforcement, tenant
isolation, transaction boundaries, and persistence.
