# Searchable select panel fixture

This synthetic school-safe fixture renders the production initial-setup `StructureStep`,
`BoardNameField`, `CustomSelect` and theme. Formik shows class/division required errors.
The production RTK Query board endpoint receives cache entries for CBSE (`0`) and GSEB (`1`)
before render, so the fixture does not read or update school data or call a backend.

Run from `Shikshamitra-FE`:

```powershell
node node_modules/vite/bin/vite.js --config e2e/fixtures/searchable-select-panel/vite.config.mts
node e2e/fixtures/searchable-select-panel/check.mjs
```

Open `http://127.0.0.1:4209/?theme=light` or `?theme=dark`. The fixed host and strict port
prevent an accidental server fallback. Theme links reload the same local fixture.

Supporting Playwright checks run at 390 x 844, 768 x 1024 and 1440 x 900 in both themes.
They verify field/popup width, matching horizontal inset, compact header line height and
4 px bottom gap, solid popup surface, viewport containment, stable filtering/no-results
width, the exact disabled `No results found` row, click and ArrowDown/Enter selection,
Escape/focus return/search reset, retained selections, multiple values, an empty source,
custom legacy/slot menu props, no page overflow and no board/auth backend requests.

Screenshots, geometry, result JSON and the check log go only into ignored
`.artifacts/searchable-select-panel/`. These automated checks support the required final
Codex in-app browser smoke test; they do not replace it or exercise authenticated routing.

The fixture keeps production colors, typography, icons and section layout to reproduce
the affected UI. Its narrow controls expose long-option sizing. Spacing separates the
real form from boundary cases; no additional visual design is introduced.
