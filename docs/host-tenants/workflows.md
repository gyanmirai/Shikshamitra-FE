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

Select **Platform administrator sign in** on the sign-in card for the host account.
This explicit mode omits School code and preserves host authentication; ordinary school sign-in requires School code before submitting credentials.
The login guard waits for the backend account context and opens Tenant directly.
School academic selectors, onboarding, notifications and school profile shortcuts are omitted for the host workspace.

## Add and edit

Use Add tenant to enter institute/contact/address details plus the initial school administrator credentials.
The form uses Formik/Yup, CustomDialog, DialogScrollContent and FormSectionCard for its three sections.
Password guidance and validation follow the loaded server settings.
If settings cannot be loaded, Submit remains disabled and Retry preserves the draft.
An identity password rejection appears below Initial password and focuses that field after saving finishes.
Editing keeps school code read-only and omits initial credentials.
Submit locks controls and dialog closing until the request finishes.
A failure preserves entered values and displays a message.
Cancel or close confirms discarding dirty values.

## Status

Choose Activate or Deactivate on the selected school.
Table row actions use the shared AdaptiveThreeDotsActions component.
Deactivation requests a reason and explains that records remain intact.
Status is updated only after the backend succeeds and the table refetches.
Search and status filtering reset to the first page.
