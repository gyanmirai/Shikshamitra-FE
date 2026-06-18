# Library Frontend Handoff

This is the frontend navigation index for the Library module. Canonical product and API documentation lives in the backend docs pack at [Library module documentation](../../../Shikshamitra-BE/docs/modules/library/README.md).

## Active Release Surface

The active Library menu is defined in `src/constants/library-menus.ts`:

- Dashboard: `/library/dashboard`
- All Books: `/library/book-list`
- Issue & Return: `/library/issued-books`
- Library Members: `/library/member-management`
- Charges: `/library/charges-management`
- Reports: `/library/reports`
- Notification: `/library/notification`
- Settings: `/library/settings/book-category`, `/library/settings/charge-type`, `/library/settings/library-timing`, `/library/settings/borrowing-and-return-rules`, `/library/settings/sectionManagement`

## Integration Files

- `src/redux/library/libraryModuleApi.ts`: shared Library RTK module base.
- `src/redux/library/library-adapters.ts`: backend DTO to screen-model mapping and mutation payload builders.
- `src/redux/library/bookList/*`: book, copy, reservation, and member lookup endpoints.
- `src/redux/library/issueAndReturnApi/*`: issue, return, accession lookup, and issue-return list endpoints.
- `src/redux/library/libraryMembers/*`: member list/detail tab endpoints.
- `src/redux/library/charges-management/*`: charge and charge-category endpoints.
- `src/redux/library/dashboard-api.ts`: dashboard overview endpoint.
- `src/redux/library/reports-api.ts`: report options, preview, export, status, and download endpoints.
- `src/redux/library/copy-labels-api.ts`: copy-label endpoint.
- `src/redux/library/notifications-api.ts`: notification settings, history, send, and reminder endpoints.
- `src/redux/library/settingApi.tsx`: settings endpoints for categories, hours, borrowing rules, sections, and shelves.

## Release Guards

- `src/screens/library/library-release-surface.test.ts` verifies active pages expose E2E smoke test IDs, prototype pages redirect away from release, and reports use the backend report panel.
- `e2e/library/library-release-gate.spec.ts` is the gated browser release suite.
- `e2e/library/library-api.ts` creates/reuses API fixtures for the Library E2E run.
- `e2e/library/library-release-qa.md` records the latest QA evidence and blocker status.

## Future Work Boundary

Before Finance integration, complete Phase 3E browser sign-off against a live local API and FE stack. Keep Finance receipt mapping, acquisitions, vendor flows, write-off, RFID, ISBN/OpenLibrary enrichment, SMS, WhatsApp, report scheduling, and membership-expiry workflows out of the active frontend until their backend domains exist.
