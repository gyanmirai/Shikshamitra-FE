# Dropdown keyboard fixture

This fixture renders the production theme and value-selection dropdown components with
synthetic options. It does not connect to a school or backend.

From the frontend repository, start the fixture:

```powershell
node node_modules/vite/bin/vite.js --config e2e/fixtures/dropdown-keyboard/vite.config.mts
```

Open `http://127.0.0.1:4207/` to check each dropdown, or run the automated browser checks:

```powershell
node e2e/fixtures/dropdown-keyboard/check.mjs
```

The checks cover Spacebar, Enter, and Tab selection; forward and backward focus; retained
multi-select choices; search spaces; disabled and empty options; readonly search inputs;
and Escape inside a dialog. Reports and screenshots go to the ignored
`.artifacts/dropdown-keyboard/` directory.
