# Elective Group Creation: school journeys

[Suite index](README.md) · [Fixtures and cleanup](test-data.md)

These are synthetic school examples, not records to add to the current school. Baseline **Not run**. Provision missing subjects/dependencies only in a dedicated QA tenant. These six composite journeys reuse functional/edge/UI cases and do not add six independent checks.

## QA-ACM-EGC-SCH-001 — Class VI second language

**School:** Sunrise Public School offers Hindi or Sanskrit in Class VI. **Setup:** Two active language masters in the English medium; no existing equivalent combination. **Steps:** Create `Second Language`, type Language, select Hindi/Sanskrit and a color; describe the choice; reload and inspect usage; verify the group becomes selectable in Subject Allocation without actually assigning real pupils. **Expected:** Reusable group with two members, no automatic student selection or class allocation, initially zero usage. **Reuse:** FUN-006/009/022, UI-013. **Cleanup:** Delete unused synthetic group; remove seeded masters only through their separate safe fixture cleanup.

## QA-ACM-EGC-SCH-002 — Class IX skill choice and duplicate prevention

**School:** Green Valley School offers Information Technology or Artificial Intelligence. **Steps:** Create `CBSE IT / AI`, type Skill Subject; reopen to check acronym preservation. Attempt another name using the same subjects in reverse order, then a case/space variant of the original with a different pair. **Expected:** First identity preserved; duplicates blocked with intelligible feedback, no extra group. **Reuse:** FUN-007/008/015/016, EDGE-004/005/007. **Cleanup:** Delete only the successful unused QA group.

## QA-ACM-EGC-SCH-003 — Class XI stream elective already in use

**School:** Riverside Senior Secondary uses Computer Science/Physical Education in two test sections. **Setup:** Seed G-used with known allocations and test student choices. **Steps:** Open usage; reconcile counts; edit description/color; attempt member removal and deletion via UI plus authorized API harness. **Expected:** Metadata update allowed, original members retained, dependency-backed lock/deletion rejection and historical selections intact. **Reuse:** FUN-014/023/028, EDGE-021, UI-018/019. **Cleanup:** Roll back only fixture allocations, then group through normal supported actions. **Boundary:** Do not infer school subject-policy eligibility from the reusable group alone.

## QA-ACM-EGC-SCH-004 — Retire vocational offering for a new year

**School:** Hill View School stops Retail/Healthcare choices for new allocations while preserving prior-year marks. **Steps:** Archive the owned fixture with reason `Offering paused for next intake`; confirm archive status and retained history, try to create the same combination, then restore original and reconcile insights. **Expected:** History intact; archived group unavailable to new allocations per contract; duplicate behavior explicit; restore same identity/members. **Reuse:** FUN-024/025/026, EDGE-017/028. **Cleanup:** Delete unused fixture or undo fixture dependencies before removal; never remove old school marks.

## QA-ACM-EGC-SCH-005 — Multi-medium administrator

**School:** Lotus School has English and Gujarati media and a separate trust tenant. **Steps:** Seed distinguishable groups in each controlled scope; open a dirty English-medium form, switch context, inspect options/list and attempt a stale save plus cross-scope API ID. **Expected:** Correct context, no mixed member IDs or data leak, safe dirty-state handling and backend denial. **Reuse:** FUN-031/032, EDGE-016/029, UI-025. **Cleanup:** Each fixture in its owning scope; use actual separate credentials, no permission editing of the active admin.

## QA-ACM-EGC-SCH-006 — Coordinator on a phone with interrupted network

**School:** A curriculum coordinator prepares an Activity Subject group with four synthetic options at390×844. **Steps:** Use keyboard/search and chip overflow; submit with color omitted; correct it; simulate preflight/save failure in harness; retry; check details at phone/tablet/desktop and both themes. **Expected:** Perceivable errors, preserved members, no accidental close/duplicate record, reachable footer, contained layout and exact successful persistence. **Reuse:** FUN-029/030, EDGE-009/013/023/027, UI-011/012/016/021–024. **Cleanup:** Delete the successful unused owned group and restore UI preferences.
