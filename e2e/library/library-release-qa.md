# Run the supplemental Library release suite

Use the [Library testing guide](../../docs/library/testing.md) for required release checks, including the Codex in-app browser walkthrough. The checked-in Playwright suite supplements those checks when an alternate browser run is explicitly requested.

## Local fixture

Use a disposable seeded school with a current academic year, default catalogue rules and an eligible dedicated Library borrower. The signed-in staff account needs the exact grants and school-wide stock scope for the routes and commands under test. The suite creates and retains circulation and reporting records and exercises settings writes in the disposable school.

Set `E2E_LIBRARY=1`, `E2E_TENANT` to the disposable school and `E2E_LIBRARY_MEMBER_ID` to its eligible borrower. Configure the frontend base URL and `E2E_API_URL` for the local instances. Both URLs must use loopback. Set `E2E_LIBRARY_ACADEMIC_YEAR_ID` when needed to select the fixture year. The circulation scenario reads the school date from the copy lookup. If the manual-date fixture has no confirmed timezone, set `E2E_LIBRARY_SCHOOL_DATE` to its actual civil date in `YYYY-MM-DD` form.

Set the frontend process's `AUTH_URL` and `NEXTAUTH_URL` to the same loopback frontend origin. The sign-in callback and its session cookies follow the configured Auth.js origin.

## Coverage

- Staff routes include catalogue, receiving, imports, stock verification, classroom custody, campus transfers, circulation, members, charges, reports, notifications and settings.
- The circulation scenario previews and cancels a reservation, reviews and records checkout by copy ID, receives the physical copy as damaged, and verifies the separate assessment. Exact checkout and return replays must keep the same loan and assessment.
- Additional scenarios exercise member tabs, standalone assessments, report preview and export, notification history and Library settings.

Use the signed-in walkthrough for linked student or guardian access, view-only scenarios, narrow layouts and keyboard navigation. Keep generated authentication and test artifacts in the ignored Playwright directories.
