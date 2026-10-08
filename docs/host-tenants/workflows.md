---
module: host-tenants
domain: platform
content_type: Reference
status: canonical
updated_on: 2026-10-08
owner: frontend-team
audience: humans-and-agents
---

# Tenant screen workflows

TL;DR: find schools, enter basic details and confirm access changes from one table workspace.

## Login

Leave School code empty for the host account.
The login guard waits for the backend account context and opens Tenant directly.
School academic selectors, onboarding, notifications and school profile shortcuts are omitted for the host workspace.

## Add and edit

Use Add tenant to enter institute/contact/address details plus the initial school administrator credentials.
The form uses Formik/Yup, CustomDialog and DialogScrollContent.
Editing keeps school code read-only and omits initial credentials.
Submit locks controls and dialog closing until the request finishes.
A failure preserves entered values and displays a message.
Cancel or close confirms discarding dirty values.

## Status

Choose Activate or Deactivate on the selected school.
Deactivation requests a reason and explains that records remain intact.
Status is updated only after the backend succeeds and the table refetches.
Search and status filtering reset to the first page.
