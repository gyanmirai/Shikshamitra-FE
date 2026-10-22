# Subjects Creation edge cases

Use the [shared execution guide](test-data.md), including independent run-owned fixtures and result evidence.
All cases are **Not run**.
Fault injection is limited to approved QA browser tools, not application edits or direct API security testing.

These are parameterized manual cases: record every boundary/role/input variation separately.
When an oracle is explicitly marked as an unresolved product policy, record observations and mark the affected sign-off Blocked.
Do not turn a missing policy into a fabricated expected error message.

## QA-ACM-SUB-EDGE-001: Empty, whitespace-only, and minimum-length names

**Priority:** P1 | **Status:** Not run | **Basis:** S2-S4

**Setup and data:** Fresh Add Subject; select a valid color so name validation is isolated.

**Steps**

1. Try empty, three spaces, A, AB, and PE in independent drafts.
2. Submit invalid drafts; save only valid unique variants in a disposable medium.

**Expected results**

- Empty/whitespace-only and one-character values are invalid after trim; two-character values are allowed unless duplicate rules apply.
- One-character error says Subject name must be at least 2 characters; capture empty-message ordering rather than assuming a different error wins.
- Invalid drafts do not call save; correction preserves other entered values.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-002: Maximum Subject Name input

**Priority:** P1 | **Status:** Not run | **Basis:** S2-S4

**Setup and data:** Fresh draft; construct distinct ASCII names of 99, 100, and 101 characters with a recorded fixture ledger.

**Steps**

1. Type/paste each name and inspect the actual accepted length.
2. Save permitted unique 99/100-character values and reopen them.
3. Try the 101st character by ordinary typing/paste, without altering DOM constraints.

**Expected results**

- 100 is the maximum accepted length; maxLength prevents excess input or the schema presents a clear error.
- No silently different truncated value is saved without the tester verifying the effective name first.
- Saved legal boundary values remain usable in table, dialog, search, and mobile layout.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-003: Trimming and repeated internal spaces

**Priority:** P1 | **Status:** Not run | **Basis:** S2; B1

**Setup and data:** D03 Mathematics plus a unique multiword subject.

**Steps**

1. Attempt Mathematics with outer spaces and then internal-space variants such as Math ematics.
2. Save a unique multiword name with repeated internal spaces and reopen it.

**Expected results**

- Duplicate preflight normalizes letters/digits for comparison, so spacing variants of Mathematics do not bypass the duplicate warning.
- Single save trims outer name whitespace; do not assume internal spaces collapse in the stored display string.
- No whitespace-only record is created.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-004: Digits, punctuation, control characters, and emoji

**Priority:** P1 | **Status:** Not run | **Basis:** S2-S4

**Setup and data:** Fresh draft; independent inputs Science 2, Art & Craft, EVS-1, O'Brien, HTML-like text, and emoji.

**Steps**

1. Try each input through the ordinary field and Submit with a color.
2. Paste a tab/newline-containing sample where the browser permits it; record the effective field value.

**Expected results**

- ASCII letters/digits/spaces are accepted; punctuation, emoji, and HTML-like names are rejected under current schema.
- The current regex uses whitespace semantics; do not assert universal rejection of every control character. Record transformed input and readability as a usability finding.
- No input executes markup or breaks the page.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-005: Display Name boundaries and clearing

**Priority:** P1 | **Status:** Not run | **Basis:** S2-S4

**Setup and data:** New or edited subject; unique valid name/color.

**Steps**

1. Try empty, whitespace-only, 50 and 51 ASCII characters, and Art & Craft in Display Name.
2. Save valid variations; clear an existing display name and reload.

**Expected results**

- Optional blank is allowed; table falls back to the subject name.
- 50 characters are allowed; 51 is capped or rejected; punctuation follows the current ASCII rule.
- Clearing removes the saved display name rather than keeping stale text.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-006: Description limits and literal text

**Priority:** P1 | **Status:** Not run | **Basis:** S2-S4

**Setup and data:** Fresh draft or unused run-owned subject.

**Steps**

1. Use 499, 500, and 501 characters; repeat with multiline text and outer spaces.
2. Paste harmless literal markup text into Description and save an allowed-length version.
3. Reopen and inspect.

**Expected results**

- 500 characters are allowed; excess input is capped or rejected.
- Outer whitespace is trimmed and meaningful line breaks/text persist without script execution.
- Do not require Description to accept only ASCII; that restriction belongs to Name/Display Name.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-007: Required color and stale color between records

**Priority:** P1 | **Status:** Not run | **Basis:** S2,S3

**Setup and data:** Two subjects with different colors plus a fresh Add Subject draft.

**Steps**

1. Submit a valid name without selecting a swatch.
2. Choose Dark blue and save; edit the second subject, inspect its actual swatch, close, and open a new draft.

**Expected results**

- No-color save is rejected with visible, accessible field feedback; Subject color is required is the schema message.
- Editing another subject selects that subject's color.
- A new record does not inherit the previous subject's color unless a documented default is introduced.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-008: Title casing and acronyms

**Priority:** P2 | **Status:** Not run | **Basis:** S2,S3

**Setup and data:** Fresh draft; input ICT, EVS, Computer SCIENCE, and mixed-case run tokens.

**Steps**

1. Type/paste each name; inspect the value before submitting.
2. Save one unique variation; reload and compare.

**Expected results**

- Current single-form behavior converts space-separated words to first-letter uppercase/rest lowercase: ICT becomes Ict and EVS becomes Evs.
- The saved value matches the transformed input; Display Name and bulk imports do not automatically inherit that transformation.
- Record school acronym-preservation needs as a product decision, not a silently changed test oracle.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-009: Language typing versus ASCII validation

**Priority:** P1 | **Status:** Not run | **Basis:** S2,S3

**Setup and data:** Language typing available; unused draft with selected color.

**Steps**

1. Enter गणित, मराठी, or a mixed Latin/Devanagari subject/display name.
2. Try a similar non-ASCII Description; inspect any language selector help.

**Expected results**

- Current Name/Display Name schemas reject non-ASCII script with clear associated feedback; no save occurs for invalid names.
- Description is not rejected solely for containing Devanagari.
- If UI language assistance implies broader name support, record the requirement conflict; do not mark localized name support as passed.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-010: Exact match takes priority over similar matches

**Priority:** P1 | **Status:** Not run | **Basis:** S2; B1

**Setup and data:** D03 plus a similar-name fixture; records are run-owned or isolated baseline data.

**Steps**

1. Attempt a name producing an exact normalized match and at least one similar match.
2. Inspect the dialog/toast and saved list.

**Expected results**

- The exact duplicate is blocked immediately, even when similar matches also exist.
- Create Anyway must not provide a bypass for the exact match.
- Reviewing a similar warning must never delete or modify the matching record.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-011: Archived names remain reserved in single create

**Priority:** P1 | **Status:** Not run | **Basis:** S2; B1

**Setup and data:** D06 plus a recorded archived name; includeArchived table visibility confirmed.

**Steps**

1. Attempt a fresh single create using D06's exact name or its duplicate-check alias.
2. Inspect feedback, then restore D06 through the supported UI if appropriate.

**Expected results**

- Single preflight includes archived matches and blocks the duplicate.
- Do not create a replacement subject just because the original is archived; restore retains the original ID.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-012: Uniqueness scope across medium and academic year

**Priority:** P0 | **Status:** Not run | **Basis:** S8; B1,B2

**Setup and data:** D07; record whether the supported shell reuses the same education-medium ID across years.

**Steps**

1. Create a unique subject in English, then attempt the same name in a different education medium.
2. Where supported, switch year while retaining the same medium identity and attempt the name again.

**Expected results**

- A different medium has its own name scope; matching names are allowed if all other prerequisites hold.
- Changing year alone does not establish a new name scope when the medium identity is unchanged.
- If scope identities cannot be established safely, block that variation instead of assuming class/year-specific uniqueness.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-013: Duplicate-check service failure

**Priority:** P1 | **Status:** Not run | **Basis:** S2,S8

**Setup and data:** SC-Manager; valid draft; QA-only browser request blocking approved.

**Steps**

1. Block the browser's check-duplicate request and Submit.
2. Observe the error; unblock, preserve the draft, and retry once.

**Expected results**

- No create/update occurs when preflight fails.
- A recoverable error is visible; all entered values remain and the busy state ends.
- After unblocking, a fresh duplicate check runs before any save.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-014: Save failure after successful preflight

**Priority:** P1 | **Status:** Not run | **Basis:** S2,S8

**Setup and data:** SC-Manager; valid draft; safe browser blocking of only the save request.

**Steps**

1. Allow duplicate preflight but cause create/update to fail.
2. Observe message, form values, and buttons.
3. Remove the override and retry after checking the list.

**Expected results**

- No success toast or false saved row is shown for the failed mutation.
- The form preserves values, restores controls, and gives actionable feedback.
- A successful retry produces one intended record/update, not a blank or duplicate draft.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-015: Ambiguous timeout after save

**Priority:** P0 | **Status:** Not run | **Basis:** S2,S8

**Setup and data:** QA fault setup capable of dropping the response after an actual save; otherwise Blocked.

**Steps**

1. Submit a valid unique record; induce the approved ambiguous response failure.
2. Record the name and check the list after reconnecting before retrying.
3. If retry is needed, submit once and inspect duplicate feedback/readback.

**Expected results**

- The tester can reconcile whether the subject was saved; UI does not claim success without confirmation.
- Retry does not create a second subject or overwrite another one.
- Record the observed saved set and recovery path; browser evidence does not prove transaction internals.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-016: Busy locks cover every dismissal path

**Priority:** P1 | **Status:** Not run | **Basis:** S1,S2,S6; U2,U3

**Setup and data:** Slow duplicate/create/update/archive/delete/import requests using QA browser throttling.

**Steps**

1. During each pending operation try the outcome button again, Cancel, header X, Escape, backdrop, and supported navigation.
2. For archive, also try changing Reason for archiving while the request is pending.

**Expected results**

- Only one intended operation is in flight; conflicting actions and dismissal paths are locked consistently.
- The selected record, submitted values, and pending context cannot change midway through the operation.
- After failure controls recover; after success the dialog closes once.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-017: Clean and dirty close matrix

**Priority:** P1 | **Status:** Not run | **Basis:** S1,S2,S6; U2,U3

**Setup and data:** Independent Add, Edit, and Import sessions; no mutation in flight.

**Steps**

1. Close clean drafts using Cancel, X, Escape, and the supported backdrop behavior.
2. Make a real change and repeat each supported path; choose Keep Editing, then Discard Changes on a second attempt.
3. Edit a value back to its original baseline and repeat close; test browser Back/reload using the shell's supported guard.

**Expected results**

- Clean/unchanged sessions close without an unnecessary discard prompt.
- Dirty sessions preserve values until an explicit discard decision; Keep Editing returns to the draft and confirmed discard saves nothing.
- All close paths share the same protection. Native window.confirm and unguarded Cancel are source review candidates, not automatic passes.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-018: Rapid close/reopen keeps the right edit identity

**Priority:** P1 | **Status:** Not run | **Basis:** S1,S2

**Setup and data:** Two run-owned subjects with clearly different name/icon/color/description.

**Steps**

1. Open Edit for the first, close safely, then immediately open Edit for the second.
2. Close and immediately select the new Subject action; repeat near the delayed reset interval.

**Expected results**

- The second edit never shows or saves the first subject's values.
- A new create draft is blank/defaulted, not a stale edit; late state resets do not clear an actively edited record.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-019: Initial list failure and refresh recovery

**Priority:** P1 | **Status:** Not run | **Basis:** S4,S8; U1,U3

**Setup and data:** Existing subject set; safe offline/blocking available.

**Steps**

1. Load with list request blocked; inspect body, message, and next action.
2. Remove blocking and retry/reload through supported UI.
3. Repeat a refetch failure after rows are already loaded.

**Expected results**

- Failure is identified as an error rather than a successful zero-subject result.
- Known shell/header context stays mounted and recovery is available.
- Safe existing rows remain during background refresh where the UI contract requires them; export/actions must not imply current data when the request failed.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-020: Usage loading failure must not mean unused

**Priority:** P0 | **Status:** Not run | **Basis:** S1,S5,S8; U3

**Setup and data:** D04 has real usage; block only its usage request.

**Steps**

1. Open D04 details and wait for the failure.
2. Inspect metrics, safety message, dependency links, and lifecycle controls.
3. Unblock and reopen the same subject.

**Expected results**

- Loading/error is not displayed as verified zero usage or safe deletion.
- No stale dependency data from another subject appears.
- Successful recovery shows D04's actual dependencies; any false unused/safe label is a failure.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-021: Subject becomes used after delete availability was loaded

**Priority:** P0 | **Status:** Not run | **Basis:** S1,S4; B1

**Setup and data:** Two SC-Manager sessions; D05 initially unused.

**Steps**

1. Session A loads D05 as deletable.
2. Session B allocates D05 through supported UI.
3. Session A attempts deletion using its stale action/confirmation; refresh.

**Expected results**

- A stale UI does not permit destruction of a now-used subject.
- Denied deletion gives useful feedback and the refreshed row/usage reflects the new dependency.
- Subject and allocation remain intact; record browser evidence without claiming a database-level test.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-022: Archive reason and cancellation state

**Priority:** P1 | **Status:** Not run | **Basis:** S1; B1

**Setup and data:** Fresh active run-owned subject.

**Steps**

1. Archive one independent fixture with Reason for archiving empty, and another with an ordinary reason.
2. For a third fixture, enter whitespace-only and then a long reason; cancel and open archive for a different subject.

**Expected results**

- Current workflow does not mark reason required; an empty reason must not be rejected solely by an invented frontend required rule.
- Reason text is preserved on server failure and reset between unrelated row operations.
- No arbitrary maximum is asserted; a long reason must remain usable or receive a safe explicit server validation error, never freeze or corrupt the dialog.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-023: Restore rejected or conflicting legacy data

**Priority:** P1 | **Status:** Not run | **Basis:** S1,S5,S8; B1

**Setup and data:** D06; ordinary server failure first. Name-conflict variant requires an approved legacy fixture and is Blocked if unavailable.

**Steps**

1. Cause restore to fail through an approved network fault, then retry after recovery.
2. If a legitimate conflicting legacy fixture exists, attempt restoring the archived subject whose name is already used by an active/inactive subject.

**Expected results**

- Failed restore keeps the archived subject identifiable and does not close details as if restore succeeded.
- A known name conflict is reported; no second active duplicate or changed subject identity appears.
- Do not bypass UI/domain checks to manufacture the legacy conflict.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-024: Switch medium while a draft is dirty

**Priority:** P0 | **Status:** Not run | **Basis:** S1,S2,S6,S8; U1,U3

**Setup and data:** D07; unsaved single draft, then repeat with an import preview.

**Steps**

1. Change draft data in English.
2. Attempt to change the academic medium through shell controls.
3. Choose the supported safe/continue or discard action; inspect context and data after the decision.

**Expected results**

- No English draft is silently saved into Marathi.
- Context changes are guarded or reset deliberately, with visible consequences and no stale record identity.
- If the application allows cross-context drafts without a defined policy, record a requirement blocker and do not sign off context safety.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-025: Late list, usage, and duplicate responses

**Priority:** P0 | **Status:** Not run | **Basis:** S1,S2,S4,S5,S8

**Setup and data:** D07; browser throttling; differently named subjects per medium.

**Steps**

1. Delay a list request in English, then switch medium and let replies complete in reverse order.
2. Repeat by opening two different subjects' usage details.
3. Where possible, delay duplicate preflight then attempt a context transition.

**Expected results**

- Late replies never replace the current context/selection with stale data.
- Any save decision belongs to the medium/name that was checked; a stale duplicate result must not authorize a new-context save.
- Record selected IDs/context and response order as evidence.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-026: Tenant change does not reuse school data

**Priority:** P0 | **Status:** Not run | **Basis:** S1,S4,S5,S8

**Setup and data:** Two safe QA tenants and SC-OtherSchool account; otherwise Blocked.

**Steps**

1. View distinctive records, filters, and insights in the first school.
2. Sign out and sign in to the second school in the same browser session using supported tenant selection.
3. Reopen the bookmarked route and usage details.

**Expected results**

- The second school never shows the first school's subject rows, counts, usage, or protected record values, even transiently.
- Subject detail identity cannot survive as a usable cross-school selection.
- Shared cosmetic preferences may persist; protected data must not. This is browser-visible isolation only.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-027: Session expiry and revoked permission mid-dialog

**Priority:** P0 | **Status:** Not run | **Basis:** S1,S2,S8; B2

**Setup and data:** QA permission administrator and a run-owned draft; no shared staff role modified.

**Steps**

1. Expire the test session or revoke the relevant action grant using the approved QA admin workflow.
2. Attempt the already-open create/edit/archive/delete action.
3. Reauthenticate or restore the original QA profile and reload.

**Expected results**

- No success is reported for an unauthorized mutation and no protected data leaks during recovery.
- The user receives the standard session/permission outcome; no retry loop or stuck modal persists.
- Restored access does not silently submit the old draft.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-028: Two administrators edit the same subject

**Priority:** P1 | **Status:** Not run | **Basis:** S2,S8; U1

**Setup and data:** Two isolated SC-Manager browser sessions; disposable subject; record original values.

**Steps**

1. Both sessions open the same subject.
2. A saves Display Name A; B, still stale, changes Description and saves.
3. Reload both sessions and compare every field with the two intended updates.

**Expected results**

- The UI must not mix subject IDs or report a save that did not persist.
- Record any conflict rejection, merge, or last-writer behavior explicitly.
- Conflict/lost-update policy is not established by this form. If B silently overwrites A, flag a requirement/data-integrity review and block concurrency sign-off until the product policy is resolved; do not invent an optimistic-lock message.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-029: Double click and concurrent same-name create

**Priority:** P0 | **Status:** Not run | **Basis:** S2,S8; B1

**Setup and data:** Two SC-Manager sessions; new shared candidate name.

**Steps**

1. Double-click Submit in one session while the duplicate request is slow.
2. Independently have both sessions preflight the same name, then save close together.
3. Reload the medium's list.

**Expected results**

- One rapid UI submit does not trigger duplicate saves.
- Two concurrent attempts do not leave duplicate same-name records; the losing attempt receives an understandable error.
- A failed duplicate check/save never removes the winning subject.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-030: Import file extension, MIME, and size boundaries

**Priority:** P1 | **Status:** Not run | **Basis:** S6

**Setup and data:** Prepared valid files with sizes at 5,242,880 and 5,242,881 bytes; valid boundary file content or record parser-stage distinction.

**Steps**

1. Try .csv, .CSV, .xlsx, .XLSX, .xls, .pdf, mismatched MIME, and allowed extension with empty MIME.
2. Try each file-size boundary through the supported upload path.

**Expected results**

- Only CSV/XLSX extensions pass type selection; mismatched nonempty MIME is rejected, empty MIME alone is not rejected by schema.
- Exactly 5 MiB passes the size rule; 5 MiB + 1 fails with File size must be 5 MB or less.
- Passing size/type does not imply parse validity; parser failures must still be handled safely.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-031: Archived existing names and alias differences in import

**Priority:** P1 | **Status:** Not run | **Basis:** S6,S8; B1

**Setup and data:** D03 and D06; valid template rows using an archived name and then an alias such as Math.

**Steps**

1. Upload an exact active-name duplicate, then an exact archived-name duplicate.
2. Inspect row issues and attempt only an otherwise allowed preview save.
3. Compare with FUN-008 single-form alias handling; record result without inventing a bulk warning.

**Expected results**

- Active-name duplicate rows are flagged from the fetched existing-name set.
- Archived records may be absent from that preload; server rejection must remain understandable and no false all-imported success is allowed.
- Bulk UI does not implement the single-form similar-name confirmation. Capture alias/preflight differences as policy/consistency findings, not assumed equivalent behavior.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-032: Import row-count and blank-row boundaries

**Priority:** P1 | **Status:** Not run | **Basis:** S6

**Setup and data:** Files with 0, 1, 199, 200, 201 nonblank data rows, using unique valid names.

**Steps**

1. Upload each file; include blank lines between some valid rows.
2. For acceptable files inspect preview count without saving huge batches unless that run is planned.

**Expected results**

- 1-200 nonblank subjects are accepted for preview; 201 fails with A maximum of 200 subjects can be imported at once.
- Header-only file says Add at least one subject below the header row.
- Blank lines do not count as subjects. Row-number behavior is checked separately under EDGE-034.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-033: Import headers, optional columns, and ambiguity

**Priority:** P1 | **Status:** Not run | **Basis:** S6

**Setup and data:** Independent template variants with reordered, missing, unsupported, and duplicated headers.

**Steps**

1. Reorder supported columns; vary header case, outer spaces, and trailing asterisk; omit optional columns.
2. Remove each required header, then add a nonblank unsupported header.
3. Duplicate Subject Name twice with conflicting values in one row.

**Expected results**

- Supported reordered/normalized headers map to the correct values; missing/unsupported headers produce named file errors and no save.
- The current parser maps a repeated header to its last occurrence; do not silently accept ambiguity as a compliant design.
- Duplicate-header acceptance needs an explicit product decision or rejection requirement before this variation can pass. Preserve the file and preview as evidence.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-034: Empty, corrupt, multi-sheet files and row references

**Priority:** P1 | **Status:** Not run | **Basis:** S6

**Setup and data:** Zero-byte file; blank/header-only content; corrupt XLSX; two-sheet workbook; CSV with gaps before an invalid row.

**Steps**

1. Upload each independent file and inspect errors, preview, and import enablement.
2. Put valid data on the first sheet and different data on the second.
3. Compare an invalid preview's Row value with its physical file line after blank rows.

**Expected results**

- Empty/unreadable files show safe messages and cannot import; corrupt content does not crash the screen.
- Only the first worksheet is read; data on later sheets is not silently presented as imported.
- Current parser removes blank rows before numbering, so displayed numbers can differ from physical lines. Record misleading correction instructions as a usability issue; do not claim physical line fidelity.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-035: Import value validation matrix

**Priority:** P1 | **Status:** Not run | **Basis:** S6

**Setup and data:** Independent valid files with only the stated field changed per row.

**Steps**

1. Try Category Unknown and wrong-case category; invalid status; invalid icon; #ABC and #12ABEF versus nonhex/red colors.
2. Try Sort Order blank, 1, 999999, 0, -1, 1.5, 1000000, and text.
3. Try duplicate names differing only in case or outer spaces; test Name/Display Name/Description boundaries from the field contract.

**Expected results**

- Category/status values must match the supported enum strings; icon values are normalized to lowercase and validated.
- Three/six-digit hex colors pass; malformed colors fail.
- Sort Order allows blank or an integer 1-999999 only; invalid rows block import.
- Both same-file duplicate rows have issues; row error labels identify the failing field.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-036: Replace files, parsing races, and recovery

**Priority:** P1 | **Status:** Not run | **Basis:** S6

**Setup and data:** One invalid file, two visibly different valid files, and a slow parse where reproducible.

**Steps**

1. Upload invalid, then corrected valid content; inspect replacement.
2. Select file A then B in quick succession through supported controls; cancel while parsing if permitted and reopen.
3. Retry after a parser/download dependency failure.

**Expected results**

- File name, preview, errors, count, and eventual submitted rows all belong to the current file.
- Late results cannot resurrect discarded or superseded rows.
- No stale preview is importable after failure or confirmed discard; controls recover without a page crash.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-037: Server rejects a client-valid bulk request

**Priority:** P0 | **Status:** Not run | **Basis:** S6,S8; B1

**Setup and data:** D09; prepare a duplicate race in a second QA session or safe bulk-save failure.

**Steps**

1. Preview valid rows in A; make one become conflicting in B, then import in A.
2. Record error and reload/search every candidate name before any retry.
3. Correct the file based on actual saved records and retry only unsaved intended rows.

**Expected results**

- The UI never reports all subjects imported successfully when the server rejects the request.
- The saved set can be reconciled after refresh; partial or ambiguous outcomes must not be hidden.
- Do not claim transaction atomicity from the preview; record any partial save as a data-integrity finding and preserve the original file.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-038: Untrusted file text and large descriptions

**Priority:** P1 | **Status:** Not run | **Basis:** S3,S6

**Setup and data:** Synthetic file with quoted commas/newlines and harmless literal HTML/formula-like Description values; never real data.

**Steps**

1. Upload a valid CSV whose Description contains a quoted comma/newline and literal =1+1 or <b>QA</b>.
2. Inspect preview and save only if ordinary validation permits; reopen the record.
3. Try invalid markup in Subject Name as a separate negative variation.

**Expected results**

- CSV structure does not shift values into the wrong columns.
- Description remains literal data in the web UI; no script execution or broken markup occurs.
- Name validation still rejects disallowed symbols. Do not open untrusted spreadsheet formulas in a real-user workbook.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-039: Large lists, missing optional values, and date display

**Priority:** P2 | **Status:** Not run | **Basis:** S4,S5,S7

**Setup and data:** Approved synthetic large medium plus legacy fixtures with nullable optional values where available.

**Steps**

1. Search/filter/sort, paginate, open insights/details, and resize with many rows.
2. Inspect rows without display name, icon, usage values, or Last Updated.
3. Compare a known update timestamp with the documented display date.

**Expected results**

- The UI remains usable with a contained scrolling table; do not invent an unsupported performance SLA.
- Missing optional values display the documented fallback without NaN, undefined, Invalid Date, or a crash.
- Last Updated uses the current DD-MM-YYYY display; timing/timezone policy differences require recording the fixture timestamp rather than guessing.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

## QA-ACM-SUB-EDGE-040: Nested duplicate warning and Add-only profile

**Priority:** P0 | **Status:** Not run | **Basis:** S1,S2; B2

**Setup and data:** Separate runs: valid similar-name draft, then SC-AddOnly test account.

**Steps**

1. Open Possible Duplicate Subject; press Escape/close the warning safely, then inspect the parent form.
2. With SC-AddOnly, attempt the permitted UI entry points and single create without granting extra rights.

**Expected results**

- Safe dismissal of the duplicate warning preserves the parent draft and never implicitly chooses Create Anyway.
- Current duplicate preflight requires View, so Add-only may fail. No bypass or implicit grant is allowed; capture visibility/error behavior.
- Whether Add must require View is a product/permission-profile decision. Block that profile's workflow sign-off until resolved; do not invent a separate Edit permission.

**Cleanup:** Restore fixture baseline, remove browser overrides, and reconcile all affected IDs before continuing; never blindly repeat a mutation after a timeout.

[Suite index](README.md) | [Functional cases](cases.md)
