---
module: institute-setup
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-10-19
owner: frontend-team
audience: humans-and-agents
---

# Institute Setup clients

## Room client

`src/redux/InstituteSetup/RoomApi/RoomApi.ts` keeps room CRUD under `/app/room` and adds typed feature-catalogue GET/POST calls under `/institute-setup/rooms/features`. Catalogue writes invalidate the existing Rooms tag. `useRoomForm.ts` submits ordered `columnRows` along with the existing layout totals, and waits for `.unwrap()` before closing. Server contracts, defaults and migration requirements are owned by the [backend API guide](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md#rooms-management-endpoint-families).

TL;DR: `schoolIdentityApi.ts` injects typed endpoints into the existing authenticated RTK Query API. [Backend API documentation](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md) owns contracts, access rules and errors.

| Operation | Client behavior |
| --- | --- |
| Read/update identity | Board and medium context; updates include the captured concurrency stamp |
| Upload | Multipart `file`, numeric `kind`, optional board/medium IDs |
| Read asset | Authenticated Blob response; browser object URLs are revoked on cleanup |
| Preview | PDF Blob from current settings or an unsaved draft |
| History | Latest 100 changes for the selected profile, including the administrator's username |
| Copy | Explicit source and target contexts and target concurrency stamp |
| Branding | Authenticated school-default logo/banner; excludes signatures |

Modes are numeric: 0 inherited, 1 custom, 2 omitted. Effective responses identify each asset's source. The SchoolIdentity cache tag invalidates configuration, history and header branding after writes. Binary asset entries have no unused-cache retention; session changes use the existing base API cache reset.

The default header logo is in `src/layouts/components/school-branding-logo.tsx`. Public admission inquiry image URLs come from the validated public inquiry response and are fetched through its token-bound image endpoints. Public pages do not use the authenticated configuration client.

Certificate and ID template clients carry optional identity choices. Omitting a choice preserves existing custom template values; explicitly selecting inherited or omitted changes that asset only.

Staff ID previews use `useGetEmployeeICardSchoolLogoQuery` in `employee-icard-template-api.ts` for the selected medium stage. Its cache shares the SchoolIdentity invalidation tag. Hidden logos render nothing; custom logos retain the existing staff asset workflow. The [backend API guide](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md) owns endpoint authorization and scope rules.

## Shift client and session changes

`src/redux/shiftManagement/shift-management-api.ts` supplies both the `/setting/shift-management` grid and `ClassForm`'s optional shift dropdown. It calls the backend's `/api/app/shift-management` endpoints through the shared authenticated API. Writes invalidate the Shift tag.

`LoadSession` in `src/redux/auth/load-session.tsx` clears both RTK Query and `session-cache.ts` when user/tenant identity changes or the session ends. Clearing only query data leaves the previous bearer token cached for up to 30 seconds; the session-transition regression verifies that the next shift request uses the new tenant token immediately.
