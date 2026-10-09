---
module: initial-setup
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-10-09
owner: frontend-team
audience: humans-and-agents
---

# Initial setup clients

TL;DR: the owning RTK Query injection uses the shared authenticated API and receives a complete progress snapshot after every successful write.

| Source | Responsibility |
| --- | --- |
| `src/redux/initial-setup/initial-setup-api.ts` | Read progress and dispatch draft, profile, academic-year, structure, users, advance and complete requests |
| `src/redux/initial-setup/types.ts` | Progress, draft and user-summary shapes |
| `src/screens/initial-setup-screen/hooks/use-initial-setup-snapshot.ts` | Fresh progress on mount, retry and explicit reload |
| `src/screens/initial-setup-screen/hooks/use-setup-persistence.ts` | Serialize writes and use the latest server concurrency stamp |
| `src/screens/initial-setup-screen/hooks/use-setup-autosave.ts` | Debounce draft changes by 800 ms; warn about unsaved entries on browser exit |
| `src/screens/initial-setup-screen/services/setup-model.ts` | Per-step validation and payload serialization |
| `src/screens/initial-setup-screen/services/setup-error.ts` | Useful conflict, permission and domain error messages |

Academic-year saves invalidate year data; structure saves invalidate boards and academic organization options.
User creation uses a stable request ID for retry and the server password-policy client from `src/redux/host-tenants/password-policy.ts`.
Passwords remain in the temporary user dialog, outside setup drafts.
Queued writes update progress metadata without resetting local form entries.

The [backend API page](../../../Shikshamitra-BE/docs/modules/institute-setup/api.md) owns endpoint contracts and exact permission requirements.
