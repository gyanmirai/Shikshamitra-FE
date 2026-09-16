---
module: security
domain: permissions
content_type: Reference
status: canonical
updated_on: 2026-09-16
owner: frontend-team
audience: humans-and-agents
---

# Security routes

| Route | Screen | Permission-management entry |
| --- | --- | --- |
| `/security/role` | Role management | Current caller needs `AbpIdentity.Roles.ManagePermissions` |
| `/security/user` | User management | Current caller needs `AbpIdentity.Users.ManagePermissions` |

Module Permission opens the original module, sub-module, and permission panels.
Set Module Visibility opens the separate original visibility dialog.
The user Academic Permission dialog remains separate and requires `ShikshaMitra.UserScope.Manage`.

These controls do not authorize API calls.
Existing page and module requirements remain in the authenticated shell.
Authorized administrators can configure a module even when the target lacks its visibility grant.
The editor explains that navigation is hidden without implicitly granting it.

Legacy navigation metadata may name a parent instead of its View child.
Only the navigation helper supports that convention; mutation action checks are exact.
