# Subjects Creation school examples

These are synthetic scenarios for a school coordinator or QA tester.
They explain why the underlying functional and edge cases matter.
No school name, account, or outcome is claimed to exist in a running environment.

Use the [fixture and execution guide](test-data.md).
Each journey references detailed cases rather than creating a second independent coverage denominator.
Run the linked cases with evidence; the stories themselves are **Not run**.

## QA-ACM-SUB-SCH-001: Prepare master subjects for a new academic year

**Actor:** Academic coordinator at synthetic QA Sunrise School | **Status:** Not run | **Kind:** Composite school journey

**School situation and prerequisites:** Academic year 2026-2027 and English medium exist. Prepare a clean run-owned baseline; do not assume the master subject is class/year-specific.

**Journey**

1. Open Subjects Creation from the menu and confirm the school/year/medium.
2. Create an English-language subject with required inputs, then a full Computer Studies record with display name Computing, Scholastic category, Monitor icon, and Dark blue color.
3. Reload, search, edit the descriptive value, and verify the two subjects.
4. Open View full insights and compare with the starting ledger before allocating either subject.

**Expected school outcome**

- Both records persist once under the intended education medium and display the saved values.
- Counts increase by two, Active by two, and Unused by two in a baseline where both were new and unused.
- The school has reusable master subjects; no automatic teacher, class, exam, or timetable assignment is implied by creation.

**Detailed coverage:** QA-ACM-SUB-FUN-001, QA-ACM-SUB-FUN-004, QA-ACM-SUB-FUN-005, QA-ACM-SUB-FUN-011, QA-ACM-SUB-FUN-023, QA-ACM-SUB-UI-001, QA-ACM-SUB-UI-010, QA-ACM-SUB-UI-011.

**Cleanup:** Delete only these two run-owned records if they remain unused; otherwise reset the prepared dependency fixture through its owning workflow.

## QA-ACM-SUB-SCH-002: Stop departments creating separate Maths records

**Actor:** Academic coordinator and Mathematics department lead | **Status:** Not run | **Kind:** Composite school journey

**School situation and prerequisites:** D03 Mathematics with Display Name Maths exists in the isolated medium. Record its ID; no Regular Mathematics record exists.

**Journey**

1. Department lead tries to add Maths and then Math, with a valid category/color.
2. Coordinator confirms the existing Mathematics identity is retained.
3. The school deliberately needs Regular Mathematics as a separate supported offering; submit it, first choose Review Subject, then repeat and choose Create Anyway.
4. Reload and compare the original and newly approved records.

**Expected school outcome**

- Maths/Math are blocked as exact normalized matches; no duplicate master is created.
- Review Subject preserves the draft without a save.
- Create Anyway applies only to the legitimate similar-name warning, creating Regular Mathematics once while leaving the original Mathematics unchanged.

**Detailed coverage:** QA-ACM-SUB-FUN-007, QA-ACM-SUB-FUN-008, QA-ACM-SUB-FUN-009, QA-ACM-SUB-FUN-010, QA-ACM-SUB-EDGE-010, QA-ACM-SUB-UI-018.

**Cleanup:** Remove only the newly created similar-name fixture if unused; keep or reset the baseline Mathematics fixture by its ledger.

## QA-ACM-SUB-SCH-003: Maintain English and Marathi media without mixing data

**Actor:** School administrator responsible for both media | **Status:** Not run | **Kind:** Composite school journey

**School situation and prerequisites:** D07 two distinct media; permitted scope in both; a separately recorded school decision is needed for non-ASCII master names.

**Journey**

1. Create the same valid ASCII subject name in English and Marathi in independent runs.
2. Switch media, inspect table/insights, and identify each medium's saved subject ID.
3. Attempt a Marathi-script Subject Name such as गणित in a fresh draft; then cancel safely.
4. Use Marathi-script text only in Description of a valid ASCII-named run fixture, where the current schema allows it.

**Expected school outcome**

- Each medium owns its own saved subject record; switching does not merge or leak records.
- The Marathi-script master name is rejected under current ASCII validation; record the school's localization requirement as an open product decision.
- Description text does not incorrectly inherit the name-field ASCII restriction. Do not mark localized master-name support as delivered.

**Detailed coverage:** QA-ACM-SUB-FUN-037, QA-ACM-SUB-EDGE-009, QA-ACM-SUB-EDGE-012, QA-ACM-SUB-EDGE-024, QA-ACM-SUB-EDGE-025, QA-ACM-SUB-UI-013.

**Cleanup:** Delete unused run-owned fixtures separately in both media; restore the initial context and do not remove real bilingual-school records.

## QA-ACM-SUB-SCH-004: Represent Physical Education and Art and Craft clearly

**Actor:** Primary-school coordinator | **Status:** Not run | **Kind:** Composite school journey

**School situation and prerequisites:** Unused run-owned records; actual school labels are synthetic examples, not claims about a live tenant.

**Journey**

1. Try Physical Education with Display Name PE, Activity category, Trophy icon, and a chosen color.
2. Observe the current handling of PE if entered directly as Subject Name, including its Pe casing.
3. Try Art & Craft and inspect validation; use the contract-compatible Art And Craft only if that is the agreed QA fixture label.
4. Reload and inspect table names, display labels, and long text at mobile size.

**Expected school outcome**

- Physical Education can retain the uppercase Display Name PE even though the single name field title-cases acronyms.
- Art & Craft is rejected by the current name schema; the suite does not silently redefine allowed characters.
- Approved fixture labels display/read correctly without truncating primary actions or using color as the only identity cue.

**Detailed coverage:** QA-ACM-SUB-FUN-005, QA-ACM-SUB-FUN-006, QA-ACM-SUB-EDGE-004, QA-ACM-SUB-EDGE-008, QA-ACM-SUB-UI-006, QA-ACM-SUB-UI-022.

**Cleanup:** Remove the unused run fixtures. Log punctuation/acronym business needs separately if the real school's naming convention requires them.

## QA-ACM-SUB-SCH-005: Retire an old subject while preserving academic history

**Actor:** Academic coordinator retiring a Computer Applications offering | **Status:** Not run | **Kind:** Composite school journey

**School situation and prerequisites:** Prepare a D04-style used subject through supported allocation workflows, with at least one existing academic record; record baseline IDs and usage.

**Journey**

1. Inspect its usage and confirm the expected class/history links.
2. Try Delete subject and inspect the restriction.
3. Archive it with reason Programme replaced from next term.
4. Revisit the original class/history UI; inspect the subject picker for a new allocation.
5. If retirement was accidental, restore the original master and inspect its status.

**Expected school outcome**

- Used records cannot be deleted to remove the offering.
- Archive retains the subject and historical links while preventing new allocation use according to the screen's stated consequence.
- Restore returns the original master ID to Active; do not assume historical assignments automatically publish or reactivate beyond their documented workflow.

**Detailed coverage:** QA-ACM-SUB-FUN-014, QA-ACM-SUB-FUN-015, QA-ACM-SUB-FUN-016, QA-ACM-SUB-FUN-020, QA-ACM-SUB-FUN-022, QA-ACM-SUB-EDGE-021, QA-ACM-SUB-UI-020, QA-ACM-SUB-UI-023.

**Cleanup:** Restore the fixture's original master state and reset only test-owned allocations. Never delete history to clean up a used subject.

## QA-ACM-SUB-SCH-006: Import term clubs from the coordinator's workbook

**Actor:** Activity coordinator preparing Robotics and Choir | **Status:** Not run | **Kind:** Composite school journey

**School situation and prerequisites:** D09 workbook/CSV with a run token and three unique rows: Active Robotics, Inactive Choir, Archived Heritage. The first sheet is intended data.

**Journey**

1. Download the current template and replace its Mathematics example.
2. Prepare the three rows; deliberately enter a malformed color and inspect the row-specific error.
3. Correct the original file and upload it again; verify all three row identities/statuses.
4. Import once, reload, filter each status, edit Choir's Display Name without changing status, and restore Heritage.

**Expected school outcome**

- Invalid file preview cannot be submitted and creates no subjects.
- Corrected preview reports three ready rows; three subjects import once with their specified states.
- Editing an Inactive record retains Inactive; restoring the archived record changes only that original identity to Active.

**Detailed coverage:** QA-ACM-SUB-FUN-029, QA-ACM-SUB-FUN-030, QA-ACM-SUB-FUN-031, QA-ACM-SUB-FUN-032, QA-ACM-SUB-FUN-038, QA-ACM-SUB-EDGE-035, QA-ACM-SUB-UI-025.

**Cleanup:** Clean up only run-owned, unused imported subjects; reconcile all row names/IDs if an import error makes the outcome uncertain.

## QA-ACM-SUB-SCH-007: Allow teachers to inspect subjects without changing masters

**Actor:** Teacher SC-Reader and administrator SC-Manager | **Status:** Not run | **Kind:** Composite school journey

**School situation and prerequisites:** D08 table and one used fixture; two separate browser sessions with approved QA profiles.

**Journey**

1. Teacher searches subjects, opens full insights, and reviews a used subject's details.
2. Teacher checks available page, row, and usage-footer actions.
3. Administrator edits an unused run-owned subject's display name and refreshes the teacher's screen through supported UI.
4. Teacher exports a filtered synthetic list if the shared utility is permitted by the current profile.

**Expected school outcome**

- Teacher can inspect permitted subjects and usage but cannot create, import, edit, archive, restore, or delete.
- The refreshed teacher view shows the saved change without a mutation affordance appearing.
- Export contains only the filtered loaded dataset available to that session; this browser check is not proof of server authorization.

**Detailed coverage:** QA-ACM-SUB-FUN-024, QA-ACM-SUB-FUN-028, QA-ACM-SUB-FUN-034, QA-ACM-SUB-FUN-036, QA-ACM-SUB-UI-002, QA-ACM-SUB-UI-007, QA-ACM-SUB-UI-019.

**Cleanup:** Administrator restores the original display value; reset table preferences and sign out both QA sessions.

[Suite index](README.md) | [Functional cases](cases.md) | [Edge cases](edge-cases.md) | [UI checks](ui-consistency.md)
