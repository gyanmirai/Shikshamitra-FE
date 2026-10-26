# Room capacity browser fixture

This local fixture mounts the production room form, its nested building editor, the shared
theme, the auth reducer, the confirmation reducer, and the RTK Query API. Every API response
and save uses synthetic data. It never connects to a school backend.

Run from the frontend repository:

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js --config e2e/fixtures/room-capacity/vite.config.mts
```

Open `http://127.0.0.1:4326/` or `http://127.0.0.1:4326/?theme=dark` for the in-app browser
smoke test. Select **Add room**, **Test Building**, and **Test Floor** to reach the full floor.
The test floor starts with one assigned room and a room limit of one. Edit the building,
raise **Total rooms** to two, and return to the room draft to submit it.

`POST /fixture/reset` restores the synthetic starting state. `GET /fixture/writes` returns
only saves performed in this local server. Restarting the fixture also resets its state.

Run the automated checks with:

```powershell
node node_modules/@playwright/test/cli.js test --config e2e/institute-setup/room-capacity.config.ts
```

Playwright supplies its own isolated HTTP route state per test, checks both themes at 390,
768, and 1440 pixels, verifies the building PUT and single room POST payloads, and saves
recovery screenshots under the ignored `.artifacts/room-capacity/playwright` directory.
