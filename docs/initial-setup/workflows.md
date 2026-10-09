---
module: initial-setup
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-10-09
owner: frontend-team
audience: humans-and-agents
---

# Complete and resume institute setup

TL;DR: the wizard separates saved draft entries from validated configuration and only opens the dashboard after backend completion.

| Step | User task |
| --- | --- |
| Welcome | Start the setup |
| Institute details | Confirm the current institute's contact and address; school code is read-only |
| Academic year | Create or select a year and confirm ordered dates |
| Academic structure | Configure the first board, medium, stage, class and division |
| Users and access | Optionally open the full academic workspace for more branches; optionally create staff with available roles |
| Review | Inspect the saved configuration, revisit earlier steps and finish |

Save and continue first flushes the draft, then saves the active step.
Back and completed-step navigation save entries before moving.
Save and exit waits for persistence before signing out.
Closing the browser resumes the last successfully saved entries on the next login; offline entries are not guaranteed to have reached the server.

Changing a confirmed section marks it as needing another save without deleting later work.
Changing the selected year requires academic structure confirmation for that year.
A conflict keeps entered values and offers explicit Reload, with confirmation before replacing unsaved edits.

The academic workspace starts on the setup year and reuses existing CRUD dialogs.
Shift and room assignment are optional, consistent with their backend contracts.
Record actions use the adaptive actions component and exact action visibility checks.

On completion, the screen selects the setup year as the working year, clears previous board/medium selection, refreshes account context and opens `/dashboard`.
Later logins use normal completed-institute routing.

The setup shell fills the viewport. Only the central step body scrolls; the header, desktop navigation and compact action footer remain visible. Step changes return the body to the top. Mobile actions retain touch-sized targets and shorter visible labels, with full accessible action names.
Academic year fields and review dates use `DD/MM/YYYY`; stored API dates remain ISO values. The calendar exposes separate month and year buttons plus previous/next month controls.

Motion introduces the active heading first, then section cards in reading order. Welcome rows and newly added staff appear briefly; completed step icons and save-state icons confirm state changes. The active sidebar highlight and header progress bar move with navigation. Completion has a short success animation while account context loads, without delaying dashboard navigation.
All setup motion honors `prefers-reduced-motion`. Animations run on entry or state changes, not while typing; the fixed shell and persisted form state remain stable. Styles are scoped to setup in `components/setup-motion.module.css`.
