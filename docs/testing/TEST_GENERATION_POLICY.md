# Test Generation Policy

Every Academic test must map to a scenario in `tests/catalog/academic.yaml`.

Required metadata:

- Scenario ID through a Playwright annotation.
- `@module-academic`.
- `@submodule-*`.
- Risk tag such as `@critical` or `@high`.
- Scenario type tag such as `@smoke`, `@permission`, `@tenant`, `@accessibility`, or `@responsive`.

Use semantic locators first: role, label, placeholder, text, and only then test ids. Avoid CSS classes, `nth-child`, XPath, and fixed sleeps.

Create data through APIs where possible. Every created test record must include an `e2e-{runId}` marker and cleanup must only delete records with that marker.
