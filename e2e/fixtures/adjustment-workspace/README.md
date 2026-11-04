# Adjustment workspace UI verification

Run from the FE repository:

```sh
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js build --config e2e/fixtures/adjustment-workspace/vite.config.mts
node --require ./src/test/patch-vite-windows-net-use.cjs node_modules/vite/bin/vite.js preview --config e2e/fixtures/adjustment-workspace/vite.config.mts
```

Generated cache and build output use the system temp directory. The preview listens only on loopback port 4229. Development mode is also supported, but its initial dependency optimization can be expensive on this workstation.

Open the reported loopback URL in the Codex in-app browser. This mounts the production adjustment workspace, shared table, form, detail drawer and approval components against a synthetic in-memory API. It does not write to the application database or verify backend enforcement.

Check Creator versus Reviewer/View only, academic selectors, table search and filters, creation/source amounts, failed-save retention, detail retry, partial allocation, preview, application, drawer return, dirty-close protection, 390/768/1440 widths and both themes. Refresh resets all synthetic records.
