# Real Collection Policy late-fee validation

This fixture mounts the production Collection Policy drawer, Redux API middleware and mutation wrapper. It sends real HTTP calls through a loopback proxy to production endpoints hosted by the existing API test factory with synthetic authentication and disposable in-memory SQLite. No school database is used.

1. From `Shikshamitra-BE`, run `dotnet run --project scripts/testing/collection-latefee-bridge/CollectionLateFeeBridge.csproj`.
2. From `Shikshamitra-FE`, run `node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/collection-policy-real/vite.config.mts`.
3. Run `node node_modules/@playwright/test/cli.js test --config e2e/collection-policy-real/playwright.config.mjs`.

The test creates and edits an active flat ₹125 policy through the real form, checks saved common-scope metadata and both versions, then publishes and assigns that policy to two fee heads with four overdue dues. Real HTTP collection assertions verify a ₹1,000 principal payment, one ₹125 late-fee charge, a ₹50 partial late-fee payment, the remaining ₹75, and repeated reads after payment. Each payment uses the current allocation revision and selected rows. Evidence is written under `.artifacts/collection-latefee`. This does not test production login or PostgreSQL concurrency; the bridge serializes requests for the test factory's single SQLite connection.

Install the matching browser once with `node node_modules/@playwright/test/cli.js install chromium --only-shell`. To redirect generated files, set `COLLECTION_LATEFEE_ARTIFACTS` for the bridge/test and `COLLECTION_LATEFEE_CACHE_DIR` for Vite.
