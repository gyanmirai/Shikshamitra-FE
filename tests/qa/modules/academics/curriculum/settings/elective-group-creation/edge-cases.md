# Elective Group Creation: edge cases

[Suite index](README.md) · [Fixtures and decisions](test-data.md)

Baseline status for every row: **Not run**. Use valid other fields so each test isolates its boundary. API-only cases need a controlled test harness; do not alter live requests or school records to manufacture failures.

| ID | Priority / method | Data and procedure | Expected result |
| --- | --- | --- | --- |
| QA-ACM-EGC-EDGE-001 | P1 Browser | Name only spaces, tab or pasted newline; submit. | Trimmed-empty name rejected; no record. |
| QA-ACM-EGC-EDGE-002 | P1 Browser | Name `A`, then unique two-character `Qz` with other values valid. | One rejected; two accepted if not duplicate. Cleanup created boundary record. |
| QA-ACM-EGC-EDGE-003 | P1 Browser | Unique ASCII name exactly100 characters, then101. | 100 accepted;101 blocked with maximum100 message, no silent truncation. |
| QA-ACM-EGC-EDGE-004 | P1 Browser | Surround unique valid name with spaces; save and reopen. | Stored name trimmed; no visually indistinguishable duplicate via spaces. |
| QA-ACM-EGC-EDGE-005 | P1 Browser | Existing name in mixed/upper/lower case with another valid pair. | Duplicate rejected consistently; edit self still allowed. |
| QA-ACM-EGC-EDGE-006 | P1 Browser/API | `Second Lang`, `Second Language`, punctuation-separated variants with distinct pairs. | Observe alias/normalized preflight separately from exact storage rule; no bypass silently accepted; document contract disagreement. |
| QA-ACM-EGC-EDGE-007 | P1 Browser | Enter `CBSE IT / AI`, `IB DP`, and teacher-approved local-language names. Observe on change/reopen. | Preserve intended proper names/acronyms and Unicode; no destructive forced casing or garbled text. |
| QA-ACM-EGC-EDGE-008 | P1 Browser | Enter HTML/script-like name or description as text in disposable form. | Render literal safe text; no script execution, broken markup or leakage. Do not use harmful payloads. |
| QA-ACM-EGC-EDGE-009 | P1 Browser | Valid name and two subjects, no color; submit. | Visible color-required error associated with focusable control; selected values retained. |
| QA-ACM-EGC-EDGE-010 | P1 API | Submit malformed/non-hex color and valid short/long hex values using fixture. | Invalid color rejected by backend; permitted hex values persist. UI picker tests alone cannot prove API validation. |
| QA-ACM-EGC-EDGE-011 | P0 Browser/API | Two distinct subjects then remove one; API submit repeated ID twice. | UI blocks one member; server must not persist a group with fewer than two distinct members. |
| QA-ACM-EGC-EDGE-012 | P1 Browser | Search a nonexistent subject term, close/reopen selector, clear search. | Helpful no-options state; original selections survive; no phantom option or save. |
| QA-ACM-EGC-EDGE-013 | P1 Browser | Select four or more available subjects; inspect overflow and remove a hidden item. | All selected members discoverable/removable; exact members/counts persist. |
| QA-ACM-EGC-EDGE-014 | P1 Browser | No eligible subjects or only one in dedicated medium. | Clear prerequisite/empty state; creation cannot bypass minimum; no indefinite loading. |
| QA-ACM-EGC-EDGE-015 | P0 Browser/API | Inactive/archived subject masters and existing group referencing one; inspect create and edit then submit. | New eligibility follows lifecycle contract; existing members remain intelligible and not silently dropped. API enforceability verified separately. |
| QA-ACM-EGC-EDGE-016 | P0 API | Nonexistent, soft-deleted, other-medium and other-tenant member IDs. | Controlled denial/validation; no partial group/member writes and no cross-tenant detail leak. |
| QA-ACM-EGC-EDGE-017 | P1 Browser | Same subject combination under a different name after original is archived. | Preflight consistently blocks or explicitly offers supported reuse; record current blocking behavior; no silent duplicate. |
| QA-ACM-EGC-EDGE-018 | P1 API | Same normalized name as archived/inactive group with a new pair. | Record backend lifecycle uniqueness rule, controlled feedback and absence of partial writes; do not assume active-only FE list is authority. |
| QA-ACM-EGC-EDGE-019 | P0 Harness | Two sessions submit same name/pair simultaneously. | Server maintains chosen uniqueness invariant atomically or reports a defect; UI preflight alone insufficient. |
| QA-ACM-EGC-EDGE-020 | P0 API | Call create/update directly without duplicate preflight using existing combination/new name. | Server must enforce intended duplicate policy; document a gap if restriction exists only in frontend. |
| QA-ACM-EGC-EDGE-021 | P0 Harness | Another session allocates G-unused after edit opens; submit changed membership/delete. | Fresh server dependency validation rejects stale destructive action; reload displays lock/counts. |
| QA-ACM-EGC-EDGE-022 | P1 Harness | Another session updates/deletes target before save; submit stale edit. | Controlled conflict/not-found behavior; no resurrection or wrong-group update; user input recoverable. |
| QA-ACM-EGC-EDGE-023 | P1 Harness | Duplicate-check fails/times out, then save fails after successful preflight; retry. | Useful separate failure feedback; no premature close/success, preserved values; no duplicate saved record. |
| QA-ACM-EGC-EDGE-024 | P1 Browser | Clean form Cancel/X/Escape, then dirty form same close paths including click outside if supported. | Clean close without warning; dirty changes protected consistently; no navigation trap. |
| QA-ACM-EGC-EDGE-025 | P1 Browser | Press Enter in name and description while valid, including multi-line description. | Defined native submit behavior without reload; description Enter inserts newline; one mutation at most. |
| QA-ACM-EGC-EDGE-026 | P1 Harness | Usage request fails or is slow; switch rapidly between two different groups. | Error/loading states distinct from genuine zero usage; stale metrics never shown as current group's evidence. |
| QA-ACM-EGC-EDGE-027 | P1 Browser | Very long name, long description, 4+ chips on390/768/1440 widths and200% zoom. | No document overflow or hidden primary controls; ellipsis content discoverable; dialog body owns scrolling. |
| QA-ACM-EGC-EDGE-028 | P1 API | Archive reason blank, long/Unicode; repeat Archive/Restore after stale row refresh. | Optional/length policy explicit; controlled repeat transitions; members/history preserved, no unintended delete. |
| QA-ACM-EGC-EDGE-029 | P0 Harness | Switch academic context with dirty form/usage request in flight, then save. | No old subjects or group ID submitted into new scope; warning/reset/denial follows actual context contract. |
| QA-ACM-EGC-EDGE-030 | P2 API/Review | Hidden sort order0,1,999999,1000000; description/type empty, long and unknown values. | Validate published BE range/type contract; preserve hidden values on edit; log FE/BE schema differences separately from nonexistent UI controls. |
