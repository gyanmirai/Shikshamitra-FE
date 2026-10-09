---
module: initial-setup
domain: testing
content_type: Troubleshooting
status: canonical
updated_on: 2026-10-09
owner: frontend-team
audience: humans-and-agents
---

# Validate institute initial setup

TL;DR: use focused model, routing and browser checks alongside the backend integration suite.
Browser fixtures are synthetic and do not prove server authorization or persistence.

Run commands from the frontend repository.

| Check | Command |
| --- | --- |
| Typecheck | `npm run ts` |
| Model and routing | `npx vitest run src/screens/initial-setup-screen/services/setup-model.test.ts src/redux/host-tenants/workspace-landing.test.ts` |
| Reused academic workspace | `npx vitest run src/components/academic-setup` |
| Browser workflows | `npx playwright test --config e2e/host-tenants/playwright.config.mjs initial-setup.spec.ts` |
| Host regression | `npx playwright test --config e2e/host-tenants/playwright.config.mjs` |
| Documentation | `node scripts/docs/validate-docs.mjs --module initial-setup` |
| Hygiene | `git diff --check` |

The browser suite covers saved-step reload, direct-link guards, completed login, permission-pending state, full configuration, extra classes/divisions, staff creation, working year, mobile exit/resume and concurrent editing.
Scenario ownership is recorded in `tests/catalog/initial-setup.yaml`.
The motion regression covers focused step headings, uninterrupted input, saved values across Back/next navigation and reduced-motion removal of section and progress transitions.
Finish UI verification in the Codex in-app browser after automated checks.

Use the [backend testing page](../../../Shikshamitra-BE/docs/modules/institute-setup/testing.md) for API, tenant isolation and PostgreSQL migration validation.
Keep fixture tokens, generated traces, logs and screenshots in ignored `.artifacts/`.

## Existing full-repository check failures

The final October 9 validation reported five TypeScript errors outside the setup feature: concession-type and fee-category fixture props, two custom-select description test objects, and missing session context in the student dashboard fixture. No setup files appeared in the error output. Earlier permission-node typing errors were corrected by the concurrent role-screen work before this final check.
The shared problem-details regression also has an existing missing `Admissions.FormMakerCheckerRequired` message mapping.
The full documentation check reports 27 structural/metadata issues under the existing docs/testing folder; the initial-setup module check passes independently.
Record these separately from focused setup checks and do not claim a clean full-repository gate.

## October 9 browser evidence

The focused run passed six initial-setup workflows, three password-policy workflows and six host-tenant regression workflows. The model, routing, shared academic workspace and authentication unit run passed 55 tests; focused setup lint passed with zero warnings.
The final Codex in-app browser check used isolated synthetic schools: mobile profile edits survived Save and exit and a subsequent login, completion opened the dashboard, and both a later login and a direct setup link returned completed institutes to the dashboard. Desktop and mobile screenshots are stored under ignored `.artifacts/initial-setup-iab/`.
The fixture only covers setup and host APIs; its dashboard data error does not validate the real dashboard API.

The UI follow-up passed seven setup browser workflows, including fixed chrome during body scrolling, compact desktop actions, day-first inputs, direct month/year selection and unchanged ISO draft serialization. Final Codex in-app browser checks covered desktop, 320px mobile scrolling and 390px mobile forms; screenshots are under `.artifacts/initial-setup-ui-proof/`. Focused source lint passes with zero warnings; full typecheck retains the five unrelated errors listed above.

The motion follow-up verified all eight setup scenarios across the initial run and an isolated rerun. Seven passed initially; the full academic/staff flow hit the 180-second startup timeout during memory pressure, then passed unchanged in 40.8 seconds. The added motion scenario covers focus, saved values and reduced motion. Focused lint and the module documentation validator passed. Final Codex in-app browser checks confirmed staggered section timing, the sliding highlight aligned with the selected step, and body-only scrolling at 390px with fixed actions and no horizontal overflow. Screenshots and logs are under `.artifacts/setup-motion-proof/`; full typecheck retains the five unrelated errors above.
