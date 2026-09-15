---
module: library
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-09-15
owner: frontend-team
audience: humans-and-agents
---

# Trace Library frontend workflows

TL;DR: trace Library workflows from the menu route to the App Router page, then screen folder, client, adapter, and backend contract.
Use this page to pick the first files for common Library changes.

## Trace catalog changes

Catalog changes start at `/library/book-list`.

1. Inspect `src/app/(auth-route)/library/book-list/**`.
2. Inspect `src/screens/library/BookList/**`.
3. Inspect `src/redux/library/bookList/**`.
4. Inspect `src/redux/library/library-adapters.ts`.
5. Confirm backend behavior in `../../../Shikshamitra-BE/docs/modules/library/api.md`.

## Trace issue and return changes

Issue and return changes start at `/library/issued-books`.

1. Inspect `src/app/(auth-route)/library/issued-books/**`.
2. Inspect `src/screens/library/IssuedBook/**`.
3. Inspect `src/redux/library/issueAndReturnApi/**`.
4. Confirm copy status, issue state, return state, and member side effects.

## Trace member and charge changes

Member and charge flows cross screens and client folders.

| Workflow | Inspect first |
|---|---|
| Member list and detail | `src/screens/library/MemberManagement/**` and `src/redux/library/libraryMembers/**` |
| Charges | `src/screens/library/ChargesManagement/**` and `src/redux/library/charges-management/**` |
| Dashboard | `src/screens/library/dashboard/**` and `src/redux/library/dashboard-api.ts` |

## Trace report and notification changes

Reports and notifications have release-gate coverage.

| Workflow | Inspect first |
|---|---|
| Reports | `src/screens/library/reports/**` and `src/redux/library/reports-api.ts` |
| Notifications | `src/screens/library/Notification/**` and `src/redux/library/notifications-api.ts` |
| Settings | `src/screens/library/settings/**` and `src/redux/library/settingApi.tsx` |

## Trace AI report generation

1. `LibraryAiReportDrawer` collects the user's wording in English, Gujarati, Hindi, or mixed natural language.
2. `useLibraryAiReport` calls the plan endpoint and renders material clarification questions when needed.
3. A ready typed plan is sent to the normal preview endpoint.
4. `LibraryAiReportPlanReview` shows the interpreted request, selected filters and columns, format, assumptions, permission summary, and live rows.
5. Approval queues PDF or Excel generation through the normal Library export endpoint.
6. The reports screen polls export status and refreshes the visible export list.
