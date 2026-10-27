---
module: institute-setup
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-10-27
owner: frontend-team
audience: humans-and-agents
---

# Institute Setup clients

## Institute form field formatting

`src/redux/InstituteSetup/institute-field-formatting-api.ts` injects per-form settings and read-only Unicode previews into the shared authenticated API. The `InstituteFieldFormatting` cache tag is keyed by form scope, so saving one form refreshes only its active previews. `src/components/institute-field-formatting/` owns the shared popover, field catalogue, permission-aware control and `useInstituteFieldPreview` helper.

The six scopes are Buildings, Room Types, Rooms, Shift Management, School Identity and School Documents. Fields retain raw input; validation errors take precedence over preview helper text. Existing-record edits skip previews, except new floors, new room features and changed School Identity signature details. The [backend API guide](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md#institute-form-field-formatting) owns field keys, authorization, persistence and normalization rules.

## Academic field formatting

`src/redux/InstituteSetup/academic-field-formatting-api.ts` uses the shared authenticated API for school formatting settings.
Successful saves invalidate the formatting-settings tag so active create-form previews refresh.
Opening the popover loads a fresh settings snapshot before mounting its Formik draft; failed writes keep that draft available for retry.
Create forms keep their raw input and show `useAcademicNamePreview` output without transforming the outgoing name twice.
Edit forms retain the saved input and skip the formatting-settings query.
Transformed non-ASCII examples use the read-only backend preview so browser casing cannot disagree with the saved value; Default and ASCII previews remain local.
The [backend API guide](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md#academic-field-formatting) owns the modes, tenant persistence, authorization, and create-time normalization.

## Academic hierarchy order

`src/redux/oraganization/oraganization.ts`, `src/redux/class/classApi.ts` and `src/redux/division/divisionApi.ts` expose typed sibling-order mutations for stages, classes and divisions through the shared authenticated API.
The class list no longer requests name sorting; hierarchy adapters preserve the order returned by the backend.
Successful reorder writes invalidate class, division, board, stage and academic-organization lookup tags so the explorer, detail cards and dependent selectors refresh.
The shared `AcademicHierarchyOptions` tag also refreshes active onboarding, student-record, scope and fee-metadata option queries.
Failed writes keep the dialog draft available for retry.
The [backend API guide](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md#academic-hierarchy-order) owns the payload, permissions and persisted ordering rules.

## Reports client

`src/redux/InstituteSetup/instituteReportsApi.ts` injects typed catalogue, preview, history, generation, AI and authenticated blob-download calls into the shared RTK Query API. The screen keeps its request form mounted across preview errors, clears dependent selections when parents change, and polls compact statuses only for pending jobs. Download object URLs are revoked after use.

Definitions carry backend-owned `requiredPermissions`; `report-source-permissions.ts` requires every exact source grant plus Reports View. The workspace filters choices and cached history and guards preview/generate/download actions. AI approval hides stale previews and disables approval when the planned dataset is no longer permitted. Document category and identity scope selectors use server `values`; identity context selectors are optional and stop at organization. The signature configuration dataset requires both School Identity View and AccessSignature. No automatic grants are added.

The screen reuses `CommonReport` and Curriculum's visual preview-table, clarification and activity components through Institute Setup contracts. The compact chooser uses `CustomSelect` below the desktop breakpoint. It does not send Institute Setup requests to Academic endpoints or run Curriculum planning logic. Class division summaries show permitted counts and omit the division selector so it cannot narrow the population before counting. The [backend API](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md#reports) owns source permissions and dataset scope.

## School Documents client

`src/redux/InstituteSetup/schoolDocumentsApi.ts` injects list/detail, multipart create/update, delete and binary-download endpoints into the shared authenticated API. Writes invalidate `SchoolDocuments`; detail entries have zero unused-cache retention. Edit submissions keep the version stamp captured when the form opened. Multipart payloads carry metadata, retained attachment IDs and new binary files, never tenant IDs or blob paths.

Saved previews use `DocumentPreviewDialog` with `directUrl` against the owning authenticated file endpoint, including its checked API origin. Local-file previews own and release their object URLs. Downloads use RTK Query and release their temporary URLs. The [backend API guide](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md#school-documents) owns endpoints, upload limits and authorization.

The shared preview loads the installed PDF.js renderer lazily, with bounded canvas dimensions, page navigation, fit/zoom and selectable extracted page text. It works without a browser PDF plugin. Protected preview requests reject foreign origins and discard responses when the authentication session changes.

## Building client

`src/screens/setting/RoomManagement/BuildingManagement/components/use-building-form.ts` refreshes building details when editing and uses floor room counts for inline capacity validation.
Building writes await RTK Query completion, omit read-only room counts from commands and retain drafts on failure.
Capacity conflicts map to the affected floor by ID; refreshing room counts updates validation without replacing entered building or floor values.

## Room client

Building options include each floor's configured `totalRoom` and server `roomCount`. `useRoomForm.ts` uses these for the full-floor warning and recognizes the server capacity conflict if another room takes the remaining space. Room create/update/delete invalidate both Rooms and Buildings tags so counts refresh. `RoomBuildingEditor.tsx` reuses the existing building editor and refreshes options after a successful save without resetting the room form. Backend contracts and errors remain owned by the [backend API guide](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md#rooms-management-endpoint-families).

`src/redux/InstituteSetup/RoomApi/RoomApi.ts` reads paged rooms under `/app/room` and submits multipart commands under `/institute-setup/rooms`.
`useRoomTable.ts` sends search, building/floor filters, column filters, sorting and page criteria to the server; the shared table uses the returned total rather than filtering a downloaded batch.
Room forms send JSON metadata in `input` and an optional binary `image`; saved photos use authenticated Blob responses at `/institute-setup/rooms/{id}/image/file` and release object URLs.
Metadata retains ordered `columnRows` and the layout totals; the editor closes only after `.unwrap()` succeeds.
Reusable features use GET/POST calls under `/institute-setup/rooms/features`.
Catalogue, list, detail and image tags are separate; building and room-type changes refresh dependent room reads, while room writes also refresh floor counts.
Optimistic deletion patches matching parameterized lists and their totals, and concurrent Undo operations retain independent timers.
Server contracts, validation limits and migration requirements are owned by the [backend API guide](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md#rooms-management-endpoint-families).

## Academic hierarchy and cache freshness

`useAcademicSetupWorkspace` requests the selected year's complete scoped hierarchy through `useGetAcademicHierarchyQuery`, rather than filtering a generic board page.
Tree nodes and summary counts retain their identities across expansion and selection changes.
School Identity and its copy dialog load their own selected-year hierarchy; board-only deep links resolve the board's year through the scoped detail endpoint.
Stable setup reads reuse cached responses on warm navigation, while mutation invalidation and session-transition cache resets remain active.

## Bounded report history

The reports client reads compact paged `/history` rows and polls only pending IDs through `/statuses`.
History search, sorting and column filters run on the server. Search drafts remain visible when sorting before the search debounce completes; changing criteria resets pagination to the first page.
The client supplies its browser timezone for displayed-date searches. History-list exports fetch matching compact rows in bounded pages only when explicitly requested, using the selected criteria/columns and cancelling on a session or school change.
Preview and regeneration fetch a job's full request on demand.
Manual and AI exports invalidate cached history pages so returning to the first page shows newly queued work.
Polling pauses while the document is unfocused.

TL;DR: `schoolIdentityApi.ts` injects typed endpoints into the existing authenticated RTK Query API. [Backend API documentation](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md) owns contracts, access rules and errors.

| Operation | Client behavior |
| --- | --- |
| Read/update identity | Board, medium and organization context; updates include the captured concurrency stamp |
| Upload | Multipart `file`, numeric `kind`, optional board/medium/organization IDs |
| Read asset | Authenticated Blob response; browser object URLs are revoked on cleanup |
| Preview | PDF Blob from current settings or an unsaved draft |
| History | Latest 100 changes for the selected profile, including the administrator's username |
| Copy | Explicit source and target contexts and target concurrency stamp |
| Branding metadata | Small typed logo/banner metadata response, keyed by tenant |
| Branding image | Authenticated `/branding/logo` or `/branding/banner` Blob; 204 becomes null; query cache is keyed by tenant and kind |

Modes are numeric: 0 inherited, 1 custom, 2 omitted. Effective responses identify each asset's source. The SchoolIdentity cache tag invalidates configuration, history and header branding after writes. Binary asset entries have no unused-cache retention; session changes use the existing base API cache reset.

The default header logo is in `src/layouts/components/school-branding-logo.tsx`.
It requests the logo directly without waiting for branding metadata, uses the application logo for missing or failed images, and revokes browser object URLs when the image changes or unmounts.
Tenant changes immediately hide the previous image and select a separate query entry.
Browser HTTP caching revalidates configured images through private ETags; the backend owns the cache and authorization contract.
Public admission inquiry image URLs come from the validated public inquiry response and are fetched through its token-bound image endpoints.
Public pages do not use the authenticated configuration client.

Certificate and ID template clients carry optional identity choices. Omitting a choice preserves existing custom template values; explicitly selecting inherited or omitted changes that asset only.

Staff ID previews use `useGetEmployeeICardSchoolLogoQuery` in `employee-icard-template-api.ts` for the selected medium stage. Its cache shares the SchoolIdentity invalidation tag. Hidden logos render nothing; custom logos retain the existing staff asset workflow. The [backend API guide](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md) owns endpoint authorization and scope rules.

## Shift client and session changes

`src/redux/shiftManagement/shift-management-api.ts` supplies both the `/setting/shift-management` grid and `ClassForm`'s optional shift dropdown. It calls the backend's `/api/app/shift-management` endpoints through the shared authenticated API. Writes invalidate the Shift tag.

`LoadSession` in `src/redux/auth/load-session.tsx` clears both RTK Query and `session-cache.ts` when user/tenant identity changes or the session ends. Clearing only query data leaves the previous bearer token cached for up to 30 seconds; the session-transition regression verifies that the next shift request uses the new tenant token immediately.
