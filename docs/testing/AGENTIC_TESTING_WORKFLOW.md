# Agentic Testing Workflow

Use this workflow for Academic Playwright work.

1. Read `docs/testing/module-inventory.json`.
2. Read `tests/catalog/academic.yaml`.
3. Select one Academic submodule or changed route.
4. Confirm frontend route, RTK Query client, backend controller, and permission name.
5. Add or update catalogue scenarios before writing tests.
6. Generate deterministic Playwright tests with stable locators and requirement annotations.
7. Run the focused spec first.
8. Classify failures using `docs/testing/BUG_CLASSIFICATION_POLICY.md`.
9. Repair only allowed test defects from `docs/testing/HEALER_POLICY.md`.
10. Generate bug reports for suspected product bugs.
11. Generate coverage reports.

Never weaken assertions, skip without a tracked reason, update visual baselines automatically, or commit secrets.
