# Playwright Audit

Generated: 2026-07-29

## Scope

This audit covers the Shikshamitra frontend Playwright setup with special focus on the Academic module. The backend Academic controllers and permission constants were inspected to connect frontend routes to API and authorization surfaces.

## Current Setup

| Area                             | Finding                                                                                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Playwright version               | `@playwright/test` is `^1.61.1` in `package.json` and `package-lock.json`.                                                                     |
| Test directory                   | `playwright.config.ts` uses `testDir: './e2e'`. Tests under `tests/academic/subject-management` are not executed by the default config.        |
| Browser projects                 | `setup`, `chromium`, and `chromium-guest`. Full cross-browser projects are not enabled by default.                                             |
| Authentication                   | `e2e/auth.setup.ts` logs in HR manager, Academic admin, and Teacher, then writes storage states under `playwright/.auth/`.                     |
| Tenant handling                  | E2E helpers send `__tenant` from `E2E_TENANT` with fallback `DDVS`; Academic local storage context is primed through `resolveAcademicContext`. |
| Evidence                         | Screenshots on failure, videos retained on failure, and traces on first retry are configured. HTML report exists.                              |
| Existing Academic specs          | `e2e/academic/academic-smoke.spec.ts`, `academic-flow.spec.ts`, `academic-qa-signoff.spec.ts`, and `academic-api.ts`.                          |
| Existing Academic route coverage | 31 authenticated Academic routes are smoke checked.                                                                                            |
| Existing CI                      | Dashboard and docs validation workflows exist. No Academic Playwright CI workflow was found.                                                   |

## Findings

| Severity      | Finding                                                                                                 | Evidence                                                                                                                  | Recommendation                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| High          | Subject-management Playwright tests live under `tests/academic/...` but the config only executes `e2e`. | `playwright.config.ts` has `testDir: './e2e'`; `tests/academic/subject-management/*.spec.ts` exists.                      | Move, reference, or add explicit script/config for these tests before using coverage numbers.                                             |
| High          | Academic coverage is route-smoke heavy and not catalogue-driven.                                        | Existing Academic specs assert route load text and a few form openings.                                                   | Track planned vs automated scenarios in `tests/catalog/academic.yaml` and generate coverage from the catalogue.                           |
| High          | No Academic permission matrix suite exists for direct route/API denial.                                 | Academic routes use permission names, backend controllers use `Authorize`, but no focused Academic deny tests were found. | Add role-specific storage states and restricted-role tests for menu visibility, direct route access, and protected API calls.             |
| High          | Multi-tenant isolation is not verified for Academic module.                                             | Helpers send a tenant header, but there are no School A vs School B read/write tests.                                     | Add tenant-isolation tests with two safe test tenants and API-created records marked with an E2E run id.                                  |
| Medium        | Failure classification and bug-report generation are ad hoc.                                            | `academic-qa-signoff.spec.ts` builds a JSON attachment, but there is no shared classifier/report post-processor.          | Use deterministic report scripts for `PRODUCT_BUG`, `TEST_BUG`, `PERMISSION_FAILURE`, `TENANT_ISOLATION_FAILURE`, and related categories. |
| Medium        | Evidence capture does not yet redact and summarize failed network payloads globally.                    | Runtime guard captures some console/page/API 500s in the QA signoff spec only.                                            | Promote evidence collection into shared fixtures/reporters before expanding coverage.                                                     |
| Medium        | Cross-browser/mobile coverage is not available in default config.                                       | Only Chromium projects are configured.                                                                                    | Keep default stable, and enable full browser projects with an explicit environment flag.                                                  |
| Medium        | Some existing tests use fixed waits.                                                                    | `academic-flow.spec.ts` and `academic-qa-signoff.spec.ts` contain `waitForTimeout`.                                       | Replace with web-first assertions as each workflow is hardened.                                                                           |
| Low           | Default credentials are embedded as non-secret demo fallbacks.                                          | `e2e/auth.setup.ts` uses demo account names and `Temp@123`.                                                               | Prefer `.env.e2e.example` and environment-provided credentials for non-local environments.                                                |
| Informational | Auth artifacts are ignored.                                                                             | `.gitignore` ignores `playwright/.auth/`, reports, and test results.                                                      | Keep this protection.                                                                                                                     |

## Safe Changes Implemented

- Add Academic module inventory and catalogue files.
- Add catalogue-driven coverage and bug-report post-processing scripts.
- Add package scripts for Academic smoke, critical, permissions, tenant, accessibility, visual, coverage, bug reports, and all reports.
- Extend Playwright reporting to JSON and JUnit while preserving HTML/list output.
- Add opt-in full browser/mobile projects behind `E2E_FULL_BROWSERS=1`.

## Changes Requiring Team Approval

- Running write-heavy Academic E2E tests against shared environments.
- Adding deterministic backend seed/cleanup endpoints.
- Enabling cross-browser projects by default in CI.
- Auto-healing test patches.
- Updating visual baselines.
