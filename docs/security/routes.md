---
module: security
domain: permissions
content_type: Reference
status: canonical
updated_on: 2026-10-15
owner: frontend-team
audience: humans-and-agents
---

# Security routes

| Route | Screen | Permission-management entry |
| --- | --- | --- |
| `/security/role` | Role management | Current caller needs `AbpIdentity.Roles.ManagePermissions` |
| `/security/user` | User management | Current caller needs `AbpIdentity.Users.ManagePermissions` |

The Security sidebar's Dashboard item is commented out in `src/constants/security-menu.ts`; its route and permission constants are retained. Role Management and User Management remain under Role And Permission.

The authenticated header does not mount the global academic year, board, and medium selector on `/security` or its descendant routes. This uses the same route-aware wrapper as Institute Setup. Other modules, including the separate `/security-guard` module, retain their existing selector behavior.

Module Permission opens the original module, sub-module, and permission panels.
Set Module Visibility opens the separate original visibility dialog.
The user Academic Permission dialog remains separate and requires `ShikshaMitra.UserScope.Manage`.

These controls do not authorize API calls.
Existing page and module requirements remain in the authenticated shell.
Authorized administrators can configure a module even when the target lacks its visibility grant.
The editor explains that navigation is hidden without implicitly granting it.

Legacy navigation metadata may name a parent instead of its View child.
Only the navigation helper supports that convention; mutation action checks are exact.
