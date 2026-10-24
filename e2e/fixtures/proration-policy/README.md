# Proration policy component preview

Run from the frontend repository:

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js --config e2e/fixtures/proration-policy/vite.config.mts
```

Open http://localhost:4186. This fixture uses the actual form, validation, payload mapper, summary, and saved-policy drawer with synthetic fee heads. It does not write to the backend.

Use **Open create drawer** to verify the complete production drawer and **Reopen saved policy**
after saving to verify edit hydration. Queries and mutations are served by `mock-service.ts`
in memory. Reloading clears saved fixture policies. The component preview below the launcher
also includes a one-time fee head to verify its read-only restriction.

Use `/?scroll=long` with **Open create drawer** for 36 fee heads and the internal-scroll
regression. The payment-term fixture on port 4185 accepts the same query with **Open copied
draft** for 12 monthly installments. Both retain their original short-list data without the query.
Run both fixtures and the desktop/mobile scroll checks with
`npx playwright test --config e2e/finance/configuration-section-scroll.config.ts`.

Check independent admission/withdrawal switches, all four models, both monthly strategies, invalid cutoff/minimum values, shared rounding, disabled one-time heads, saved fields, and light/dark/mobile layout. Student assignment inheritance is covered by the backend integration tests and the assignment workflow component tests.
