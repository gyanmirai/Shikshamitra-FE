---
module: institute-setup
domain: routes
content_type: Reference
status: canonical
updated_on: 2026-10-14
owner: frontend-team
audience: humans-and-agents
---

# School Identity routes

TL;DR: `/setting/school-identity` appears directly after Academic Setup in Institute Setup. Its screen enforces the exact View grant independently of navigation visibility.

| Entry | Behavior |
| --- | --- |
| Institute Setup menu | School defaults tab |
| Academic hierarchy board action | Override tab with `academicYearId` and `boardId` |
| Academic hierarchy medium action | Adds `mediumId` |
| Basic Information assets area | Opens the common identity editor route |

Navigation visibility is `ShikshaMitra.Module.InstituteSetup.SchoolIdentity`. Actions are `InstituteSetup.SchoolIdentity.View`, `ManageDefaults`, `ManageOverrides`, and `AccessSignature`. The existing permission editor keeps its View/Add/Delete controls; Add groups the three existing management/signature capabilities and Delete remains unavailable.

The authenticated shell remains mounted through loading and failure. The route uses a Suspense boundary for URL context. Screen state is owned by `src/screens/setting/school-identity/hooks/use-school-identity.ts`; contextual editing and confirmations are in `components/identity-workspace.tsx`.
