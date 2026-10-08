---
module: finance
domain: fee-structure
content_type: Reference
status: canonical
updated_on: 2026-10-05
owner: frontend-team
audience: humans-and-agents
---

# Fee Structure workspace UI

The active screen at `/finance/settings/create-fee-structure` uses one class workspace for viewing and editing draft/published structures. This implementation covers configuration only. It does not change Fee Structure Assignment, demands, collections or refunds.

The [UI and language proposal](fee-structure-ui-redesign.md) specifies the next presentation pass for the three workspace steps and policy coverage dialog.

Backend rules, exact permissions, migration and API contracts are owned by [the backend implementation reference](../../../../Shikshamitra-BE/docs/modules/finance/references/fee-structure-workspace.md).

## Screen flow

1. Select an academic year. Refresh academic workspaces if board/medium containers have not been prepared.
2. Open the full-screen workspace dialog. Its horizontal class tabs come from the scoped metadata response, not the generic class API.
3. Add a Fee Structure draft. Enter its name. Eligible current default policies initialize once in a new draft.
4. In **Fee Heads & Terms**, add active Fee Heads, set total amounts and optional flags, and select each head's exact published Payment Term version.
5. Open the shared schedule dialog to inspect inherited dates/percentages. Customize locally or restore the inherited schedule. Replacing a customized term requires confirmation.
6. In **Policies**, select exact Collection and Refund policy versions. A missing Collection Policy shows an inline error and blocks Next and navigation to Review; Refund remains optional. Proration and Concession Policy selection, scope controls, defaults, lookup requests and review columns have been removed from Fee Structure settings.
7. Save the draft. Each added row requires an entered amount and a published Payment Term. Policy configuration may remain incomplete in a draft; invalid selected relationships are rejected by the backend.
8. Open **Review & Publish** for backend readiness errors, mismatch warnings, per-head policy/accounting coverage and resolved installments.
9. Publish only after saving and obtaining a ready review. The server revalidates and protects the configuration.
10. Published cards offer **Create revision**. Their saved publication review remains readable even after master settings change.

## Common components and interaction rules

| Surface | Component/pattern |
|---|---|
| Workspace list and head/schedule/coverage tables | `CustomizableTable` |
| Policy, Fee Head and version choices | `CustomSelect` |
| Full-screen workspace | Unmodified shared `CustomDialog` with `fullScreen`, following the timetable workspace |
| Horizontal class navigation | Unmodified shared `CustomTabs` with scroll buttons; the owning form guards dirty class switches |
| Guided setup (Fee heads & terms, Policies, Review & publish) | Unmodified shared `CustomStepperWithFormik` owns navigation, scrolling and action footer; Fee Heads remain together in one table |
| Installment editor | `CustomDialog` + `DialogScrollContent` |
| Publication, revision, delete, discard and term replacement | `ConfirmDialog` |
| Row removal | `ThreeDotsActions` |
| Status | `Label`, theme palette tokens |
| Feedback | `shikshaMitraToast`, MUI Alert and small controls |
| API hooks | `useQueryAndMutation` |

Stepper navigation preserves the parent candidate without a leave prompt. The nested schedule dialog opts out of the global leave prompt through `guardUnsavedChanges={false}`. Leaving the workspace or switching class uses the shared confirmation dialog and the actual aggregate dirty state.

Metadata list pagination/search uses the server. Empty, loading and error states are distinct. Settings refresh preserves unsaved changes and invalidates the previous readiness result. Parent refetch never overwrites a dirty card. Out-of-order previews are discarded using an editor generation counter. Publication is disabled for an unsaved or unreviewed draft.

## Client contract

`src/redux/finance/feeStructureWorkspace.ts` owns typed lightweight context, preview, partial save, publish and revision endpoints. Existing `financeFeeStructure.tsx` remains the client for metadata lists/generation, class lists and draft deletion.

`feeStructureModel.ts` strips retired proration fields from legacy responses and preserves supported policy version IDs, per-head term/version IDs, complete overrides and explicit nulls. It copies nested arrays so editing cannot mutate cached records. Create sends a stable request UUID; updates and publication send the server concurrency stamp. Existing draft PATCH responses replace the canonical record in the owning class cache. Create/revision/delete update class/count projections; no Fee Structure save invalidates a setting catalog.

Canonical save responses replace the local draft; subsequent saves use its ID and stamp. Conflicts keep unsaved input available and ask the user to refresh/review. Optional policy removal sends null IDs and null versions; a previous/default attachment must never be silently restored.

Display validation messages from both ABP `error.data.Errors` and the host's Problem Details `data.Errors`/`errors`/`detail` responses. Prefer specific business-rule errors over the generic detail. Recognize the concurrency code in either envelope and preserve the draft on failure.

Policy selectors are editable only in an authorized draft edit session. Selecting a policy updates the local candidate; **Save draft** persists its policy ID and version ID. Publish sends only the saved structure ID and concurrency stamp. Keep Publish disabled until changes are saved and a fresh review is ready, show the required next step, and recheck those conditions when confirming publication.

The active path uses `FeeStructureWorkspaceCard.tsx` and `StructureScheduleDialog.tsx`. Older `IndependentFeeStructureCard`, `FeePoliciesTab`, schedule drawer and ViewDetails prototypes remain inactive source; they are not the current management flow. The old status/unlock path is no longer exposed by the active screen.

## Edge cases to verify

- Required settings absent, settings fetch fails, or an attachment becomes inactive after the screen loads.
- Legacy concession attachments survive unrelated edits; policy-only heads; no overlapping Collection/Refund heads; independent Proration rules do not affect structure validation.
- A newer policy/term version appears while editing: the existing version stays selected until explicitly changed.
- Custom override references a removed or different-version installment; total percentage differs from 100%; dates overlap or exceed the board window.
- Save then refresh preserves custom values and pinned versions; disabling a policy does not refill it.
- A stale tab cannot overwrite another user's save; dirty navigation and nested dialog close preserve input.
- Published cards offer no direct edit/delete/unlock; revision copies the saved pins with separate identities.
- View-only users have no write actions; individual policy controls obey attachment permissions.
- Legacy published rows have no invented historical snapshot and display a clear notice.

## Verification commands and browser scope

```powershell
npm run ts
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vitest/vitest.mjs run src/screens/finance/settings/FeeStructure/feeStructureModel.test.ts src/screens/finance/settings/FeeStructure/feeStructureFields.test.tsx src/screens/finance/settings/FeeStructure/hooks/useFeeStructureLookups.test.tsx src/screens/finance/settings/FeeStructure/sharedNavigation.test.tsx src/redux/finance/feeStructureWorkspace.test.ts --pool=threads
npm run docs:check
```

`e2e/fixtures/fee-structure/` is a standalone component-verification fixture with synthetic API responses. It renders the actual editor, theme, tables, selects and dialogs, and is not an App Router route or production API fallback.

```powershell
node --require ./src/test/patch-vite-windows-net-use.cjs ./node_modules/vite/bin/vite.js --config e2e/fixtures/fee-structure/vite.config.mts
```

Open the displayed local address in the Codex in-app browser. Verify an empty draft, a configured draft, invalid allocation feedback, custom schedule editing, policy version selectors, review, publication confirmation, and locked state. Also verify narrow viewport scrolling and both color schemes. Fixture checks verify UI behavior; real persistence, authorization and version invariants are covered separately by backend integration tests. A signed-in full-stack smoke test requires the migrated backend and authorized test user.

## Implementation verification record

On 2026-09-09, the nine focused frontend tests, TypeScript checking and focused ESLint checks passed. The actual common-component editor was exercised in the browser with synthetic responses, including schedule edits, invalid percentages, unsaved navigation, publication confirmation and the published state. Desktop light/dark themes and a 390-pixel layout were inspected. The fixture includes explicit theme buttons for repeatable visual checks. A signed-in full-stack test remains a rollout check.

Finance documentation validation passes. The repository-wide frontend documentation command still reports pre-existing issues outside this module, including `docs/testing`; this change does not repair unrelated documentation.


## Individual settings integration (2026-09-10)

`hooks/useFeeStructureLookups.ts` composes owning API hooks, with their own caches and permission checks. Context contains no catalogs. Active Fee Heads load by academic year; published Payment Term choices load by year/board; policy lists load when Policies is opened, or immediately for new-draft defaults. Each catalog traverses bounded 100-row pages, and the common selector searches the resulting complete list. Each family's Retry/Refresh action is independent. Term installment details load only for the schedule being opened.

Only active current policy snapshots appear as new choices. An attached older version is rendered as a retained disabled option with its saved name/version; it is never upgraded on GET. Policy choices display Default when appropriate. Payment Term selections use `publishedVersionId`, never a working draft's current version. Changing a selection changes only the local structure candidate, never policy/term master data.

Default initialization waits for a complete successful family list and requires exactly one attachable current default plus attachment permission. It runs once per family on a new unsaved draft. No default leaves an empty field; multiple defaults require explicit choice. Manual selection/clear marks the family handled, including while another request is pending. Existing drafts, revisions and published records never receive defaults. A failed lookup preserves input and exposes retry; it does not silently select another policy.

The subject creation form is the validation reference: name/amount errors appear after blur or Save, guidance stays under the owning field, and the name uses shared `ShakingTextField`. Policy requiredness is field guidance, never a fake dropdown option. Collection is validated on the Policies step before proceeding to Review and remains required at publication; Refund and Proration remain optional. Concession is no longer selected or required here. Receipt Book has no control or new request field.

`buildStructureChanges` compares the immutable saved baseline and sends only changed fields. Head operations use saved line IDs; clearing a policy sends a null family; schedule replacement is explicit and atomic. A no-op causes no request. Request IDs remain stable for an identical retry. A changed command uses a different request ID. Canonical response replaces the local candidate and class cache, preserving new IDs/stamps.

All added Fee Heads remain visible in the existing common table, with amount/term/charge controls and a local schedule dialog. Section tabs preserve unsaved edits. Policy-only heads never create rows; backend Review explains overlap and conflicting scope.

### Additional regression cases

- Default is on a later page; multiple/no defaults; list fails or permission is denied.
- User clears a default, switches tabs or refreshes the list; the clear remains.
- New policy version appears between selection and save; reject stale new selection and request explicit refresh/reselection.
- Saved term has become superseded; display its exact schedule while offering only the current published version for new use.
- Amount-only PATCH leaves policy pins and customized installment identities unchanged.
- An identical retry follows a later edit; return current canonical data without replaying the earlier amount.
- Unknown fields, missing pair values, foreign line IDs and repeated line operations are rejected atomically.
- Empty draft with a default selected-head Refund Policy remains savable, but publication requires overlap.


## Verification update - 2026-09-10

The five-file focused frontend run passed 19 tests. A subsequent focused model run passed all nine model tests, including the additional duplicate-name regression (20 distinct frontend tests covered across these runs). Coverage includes partial request payloads, explicit clears, preserved pins, defaults, pagination completion, stale data, incomplete lists, common tab navigation and real shared-select search. TypeScript and focused lint checks pass.

Browser checks used the actual editor with synthetic fixture responses: current/default policy badges, explicit clear across tabs, Fee Head tabs, amount validation on blur, searchable Fee Heads, and selected term schedule rendering. Desktop light mode and 390px dark mode were inspected. Published term labels retain the saved names/version labels. No signed-in full-stack browser test or financial transaction was performed.

The backend must be rebuilt/restarted alongside this frontend: the new context/PATCH routes and additive current/published version fields are required. The earlier revision migration remains a separate deployment prerequisite where it has not already been applied; this task did not execute it.


## Required Fee Head fields and default Payment Terms

The One-time control and classification column have been removed from the current and legacy Fee Structure forms/detail views.
Payment Terms remain the visible configuration for installment amounts and dates; Optional selection is retained.
Legacy `isOneTime` values remain in existing read/write contracts and are preserved when editing amounts or terms, so this UI retirement does not rewrite historical assignments or remove legacy proration guards.
New editor rows retain the existing false default; no database migration or backend calculation change is part of this presentation update.

- All Fee Heads appear together in the shared table; there are no per-head tabs.
- Amount and Payment Term display required labels and field-level helper/error text on blur or Save/Review. New amounts start blank. Clearing an amount must not silently save zero. An explicitly entered zero remains permitted by the existing monetary contract; negative, non-finite, over-limit and over-precision amounts are rejected.
- The owning Payment Terms list API remains filtered by academic year, board and Active status. The frontend also checks scope, Active status and published version metadata before displaying choices. Draft-only and archived terms cannot be selected, even in a mixed-status response.
- Preserve the API's `isDefault` flag. Once all pages load successfully, initialize each newly added, untouched line from the unique current published default. Label that option Default. A late response may fill a pending new row; it must not overwrite existing pins, manual choices, customized schedules, or saved empty attachments. No eligible default, or multiple defaults, requires manual selection.
- Keep available choices interactive during a failed refresh. Display the existing retry warning and retain saved pins. Do not infer defaults from a failed or incomplete catalog. Permission-denied and read-only/published controls remain disabled.
- If the catalog has no eligible terms, explain that a Payment Term must be published for the same academic year and board. Save/Review blocks until each row has both the term ID and published version ID.
- Existing unavailable or older pins remain visible for review; the backend decides their publication eligibility. Changes still use the targeted PATCH contract and never advance a historical version automatically.


## Contextual policy impact

The Policies step contains only Collection, Proration and Refund cards. Historical concession fields remain in the read contract for compatibility and are not editable or included in settings PATCH commands. Request-level policy selection is not implemented by this change; see the [backend behavior](../../../../Shikshamitra-BE/docs/modules/finance/references/fee-structure-workspace.md).
The other policy families retain their existing selection controls without new head selectors.
Cards use a centered, bounded two-column grid on desktop and a single column below the medium breakpoint.

Each card provides a labelled eye action using shared Iconify, CustomTooltip and MUI IconButton controls.
The shared `src/screens/finance/settings/FeeStructure/Components/PolicyImpactDialog.tsx` uses CustomDialog and DialogScrollContent with a compact, theme-aware layout.
It lists structure heads with coverage and exclusions, selected policy/version and descriptive impact; it does not calculate amounts or eligibility outcomes for students.
Closing with the header, footer or Escape preserves the parent draft's dirty state and returns focus to the opener.

The presentation adapter `src/screens/finance/settings/FeeStructure/policyImpactModel.ts` uses the already-loaded policy catalog only when its policy and current-version IDs match the selected attachment.
Saved publication coverage takes precedence for published structures; an unavailable historical version is never replaced with current-master details.
Unavailable, loading, error, no-access and empty-head states remain distinct.
No additional API calls, new contracts, backend changes, save behavior or monetary calculations are introduced.

Focused regression files are `src/screens/finance/settings/FeeStructure/policyImpactModel.test.ts` and `src/screens/finance/settings/FeeStructure/Components/PolicyImpactDialog.test.tsx`.
They cover family-specific head relationships, missing metadata, preserved version evidence, dialog availability states, keyboard close/focus return and parent draft protection.
Browser verification uses the existing isolated fixture under `e2e/fixtures/fee-structure/`; its synthetic responses never enter the Next.js application.
The earlier four-policy browser check predates concession removal and is not evidence for the current three-policy UI.
The policy grid had no document-level horizontal overflow at widths 390, 768, 1280, 1440, 1920 and 2560; desktop columns stayed bounded, and tablet/mobile stacked.
Light desktop and dark mobile dialog views were visually inspected; no authenticated full-stack transaction was exercised.

## Configuration role permissions

Fee Structure and all four policy rows show View, Add and Delete using the exact API names. The role editor strips a menu's trailing `.View` before resolving actions, including header toggles and Grant/Revoke All. Missing server actions show a definition warning instead of a switch that cannot change. Concession Policy uses its own policy View permission, never Fee Collections.

Add controls structure creation, editing, publication and revisions. Policy Add controls editing, activation, cloning, restoration and attachments; policy View includes history and simulation; policy Delete controls archival/deletion. Delete may enable View for navigation but does not silently grant Add. Disabling View clears dependent configuration actions. The saved role payload contains only changed canonical grants.

See [backend action and upgrade contract](../../../../Shikshamitra-BE/docs/modules/finance/api.md#fee-configuration-permissions). After deploying these changes, restart the API and reload role/application permissions. Publishing still requires a saved, ready draft with no unsaved changes.

## Concession settings removal verification

The focused editor/model/catalog suite passes 22 tests, including legacy attachment preservation on an unrelated save and absence of concession controls. TypeScript checking passes. The in-app browser verified the three remaining policy cards and the review table without a Concession column using the existing synthetic component fixture; this does not assert live backend integration. Finance documentation validation passes; the all-module frontend docs gate has unrelated existing failures outside Finance.

## Guided workspace (2026-10-05)

The timetable-style full-screen dialog displays scoped class tabs horizontally across the top at every viewport width. Tabs scroll within their row when needed. The class panel displays one selected structure, with a searchable shared selector in the editor toolbar when several exist. Other editors remain mounted so switching structures preserves unsaved names, policy pins, pricing and custom schedules. Newly saved drafts keep their editor identity and selection when the list refetches; an older list response cannot replace a newer save response.

The workspace uses a flex-height chain. The existing `CustomStepperWithFormik` owns the scrolling body, horizontal step indicators and stable action footer. Its source and API are unchanged. Fee Structure keeps its canonical candidate, validation and changed-only save flow in the owning editor; the stepper delegates actions to that workflow. The primary forward action is **Save & next** during editing and **Next** in read-only sessions. **Save draft** stays on the current step; Back preserves input. A failed save never advances. Successful saves replace the candidate with canonical server data before the next stage renders. Saved structures resume their last navigation step using a metadata/class/structure-scoped local preference; financial values and unsaved drafts are never stored there.

Policies retain Collection (required for publication), Proration and Refund (optional). Review groups blocking errors and non-blocking warnings, shows selected policy versions, labels coverage and installment tables, and provides Edit actions back to the owning step. Ready previews with warnings state that the warnings need review. Publication remains disabled until the draft is saved, unchanged, and ready according to the backend. Parent refreshes and candidate changes invalidate earlier review results.

Blocking saves, publication and revisions disable step navigation, class/structure switching and workspace dismissal. Consequential confirmations use outcome labels, remain open during the request, prevent duplicate actions and display failures for retry. Published structures retain their saved review and revision path. Read-only review links use View labels; published records show the saved publication checks and a completed final step.

Policy fields use three aligned columns on wide screens, two at medium widths and one on mobile. Structure names stay full width, the Fee Head picker has a readable width, and pricing/term fields stay together in the shared table. Closing through the dialog header or Escape uses the owning unsaved-change confirmation.

Focused regression files include the shared stepper's existing tests, `feeStructureFields.test.tsx`, `Components/ClassAccordionPanel.test.tsx` and `Components/FeeStructureWorkspaceDialog.test.tsx`. The isolated browser fixture offers **Open full-screen workspace** to exercise the real dialog, horizontal class tabs, structure selector and class/dismissal guards with synthetic data. The fixture performs no backend financial transactions; authenticated full-stack integration is outside this fixture's coverage.

Verification: 61 focused tests, TypeScript, focused ESLint and Finance documentation validation pass. The final in-app browser smoke covers full-screen desktop/tablet/mobile geometry, horizontal class scrolling, light/dark themes, class and dialog dirty guards, Save & next, review, and protected publication. No shared-component source files are changed.
