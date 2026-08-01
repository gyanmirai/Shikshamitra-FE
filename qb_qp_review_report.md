# Question Bank & Question Paper — End-to-End Review Report
**Reviewed:** 2026-07-31 | **Module:** Examination → Question Bank + Question Paper

---

## Executive Summary

Both modules are well-architected with solid foundations and follow ShikshaMitra UI patterns consistently. However, there are **critical functional gaps**, **UX friction points**, and **missing world-class ERP features** that must be addressed to make this production-grade school software.

---

## 1. QUESTION BANK — Detailed Findings

### 1.1 Critical Bugs and Functional Gaps

| # | Severity | Issue | File / Lines | Impact |
|---|----------|-------|-------------|--------|
| QB-01 | CRITICAL | **Hardcoded `pageSize: 300`** — no server-side pagination. All 300 questions load at once. Will break with large question banks. | `QuestionBankScreen.tsx:781` | Performance, scalability |
| QB-02 | CRITICAL | **Settings `requireDifficulty` and `requireBloomLevel` toggles exist in the Settings UI but are NOT enforced in `buildQuestionValidationSchema()`**. Turning them on has zero effect. | `QuestionBankScreen.tsx:122-158` | Data quality |
| QB-03 | CRITICAL | **Settings `requireAnswerKey` toggle not enforced in validation**. The CreateQuestionDialog independently requires answerKey only for types 4/5/6, ignoring the settings flag. | Both screen + dialog | Data quality |
| QB-04 | HIGH | **`handleRejectConfirm` has no toast on success or error**. Reject silently succeeds or fails with only a `console.error`. | `QuestionBankScreen.tsx:938-948` | UX, feedback |
| QB-05 | HIGH | **`approveQuestion` / `submitQuestion` / `duplicateQuestion` / `archiveQuestion` have no toast feedback** — called bare with no `.unwrap()` or error handling. | Lines 1204, 1215, 1242, 1251 | UX, reliability |
| QB-06 | HIGH | **`handleSaveSettings` has no success toast** on save, only a `console.error` on failure. | `QuestionBankScreen.tsx:1032-1041` | UX |
| QB-07 | HIGH | **Duplicate `QUESTION_TYPE_OPTIONS` constant defined in 3 different files**: `QuestionBankScreen.tsx`, `CreateQuestionDialog.tsx`, and `ChapterQuestionsDialog.tsx`. Drift risk when adding new types. | All three files | Maintainability |
| QB-08 | HIGH | **`CreateQuestionDialog.tsx` bulk upload is a stub** — it shows a toast "uploaded" but calls no real API. `file` is in formik values but never sent to backend. | `CreateQuestionDialog.tsx:806-821` | Feature completeness |
| QB-09 | MEDIUM | **`questionColumns` `useMemo` depends only on `[reviewComment]`**. Adding more handlers that change will cause stale closures. | `QuestionBankScreen.tsx:1076, 1269` | Correctness |
| QB-10 | MEDIUM | **Two separate formik instances** (create + edit) with nearly identical handler logic — 80+ lines of code duplication. | Lines 950-1024 | Maintainability |
| QB-11 | MEDIUM | **`handleOpenCreate` uses `setTimeout(() => setDialogOpen(true), 0)`** — a hack to force re-mount. Fragile pattern, could cause race conditions. | Line 891-895 | Reliability |
| QB-12 | MEDIUM | **Settings `enableQuestionVersioning` toggle exists in UI but `isLocked` flag on questions never updates based on it** — versioning not enforced from FE. | Lines 1721-1725 | Feature completeness |
| QB-13 | MEDIUM | **`Popover` used for Settings** instead of `CustomPopover` — violates project skill rule (rule 2.17). | Line 1418 | Consistency |
| QB-14 | MEDIUM | **`enableDuplicateCheck` setting UI toggle exists** but no duplicate detection UI shown to the user when creating a question. | Settings panel | Feature completeness |
| QB-15 | LOW | **Question text has no character counter or max length hint** — teachers can write very long questions. | Create/Edit form | UX |
| QB-16 | LOW | **Tags input is a plain comma-separated `TextField`** — no visual chip creation as you type. | Both forms | UX |
| QB-17 | LOW | **`formik.values.options` uses array index as `key`** — causes React reconciliation issues if options are reordered. | Lines 579, 502 | Correctness |
| QB-18 | LOW | **No "Add Question" shortcut from filter bar** — if user filters by Class+Subject+Chapter, the create dialog should pre-populate those values. | Filter bar | UX |
| QB-19 | LOW | **`handleOpenSettings` initialises `localReviewComment` from local `reviewComment` state**, not from server. | Line 1026-1030 | Correctness |
| QB-20 | LOW | **No "Delete" action available** even though `useDeleteQuestionMutation` is imported. Three-dots menu only shows Submit, Approve, Reject, Duplicate, Archive. | Lines 1196-1263 | Missing feature |

---

### 1.2 Missing World-Class Features

| Feature | Importance | Description |
|---------|-----------|-------------|
| **Question Preview Modal** | High | Clicking a question row should open a rich preview with rendered options, answer key, explanation |
| **Rich Text / LaTeX Editor** | High | Question text is a plain textarea. Science/Math schools need formula support (MathJax/KaTeX) and image embedding |
| **Image Attachment per Question** | High | `CustomUpload` is imported but never used for per-question images. Diagram-based questions require this |
| **Bulk Status Change** | Medium | No checkbox multi-select to approve/reject/archive many questions at once |
| **Question History / Audit Log** | Medium | No UI to see who created/modified/approved a question and when |
| **Usage Analytics** | Medium | `usedCount` is shown in table but clicking it doesn't navigate to which papers used it |
| **Duplicate Detection UI** | Medium | `enableDuplicateCheck` setting exists, but no similarity warning shown when a near-duplicate is entered |
| **Import from Previous Year** | Medium | No way to carry forward approved questions from last academic year |
| **Question Print / Export** | Low | Export individual questions to PDF/Word for offline review |
| **Keyboard Navigation** | Low | No keyboard shortcuts (e.g., Ctrl+Enter to save, Esc to cancel in create dialog) |

---

## 2. QUESTION PAPER — Detailed Findings

### 2.1 Critical Bugs and Functional Gaps

| # | Severity | Issue | File / Lines | Impact |
|---|----------|-------|-------------|--------|
| QP-01 | CRITICAL | **`onSubmit` in create paper has no error toast** — `catch` only does `console.error`. User sees nothing if paper creation fails. | `QuestionPaperScreen.tsx:460-463` | UX |
| QP-02 | CRITICAL | **`handleAddQuestion` and `handleRemoveQuestion` have no `try/catch`** — `.unwrap()` is called but failures are silently swallowed. | Lines 575-594 | Reliability |
| QP-03 | CRITICAL | **`submitPaper`, `approvePaper`, `publishPaper` called bare with no `.unwrap()`, no loading state, no toast**. Approval workflow actions have zero feedback. | Lines 1591, 1602, 1627 | UX, reliability |
| QP-04 | CRITICAL | **`archivePaper` and `deletePaper` in table actions have no confirmation dialog** — user can accidentally delete/archive a paper with a single click. | Lines 799, 814 | Data safety |
| QP-05 | HIGH | **`window.confirm()` used for unsaved changes on dialog close** — violates the skill rule that mandates `ConfirmDialog` or `confirmPopup` Redux slice. | `QuestionPaperScreen.tsx:630` | Standards violation |
| QP-06 | HIGH | **`selectedPaper.questions` objects in paper list don't carry `questionText`**. The builder shows `'Bank Question'` as fallback. | Line 1350 | Data display |
| QP-07 | HIGH | **Reject Paper dialog uses raw `Dialog` + `DialogTitle` + `DialogContent`** instead of `CustomDialog`. | Lines 2072-2114 | Standards violation |
| QP-08 | HIGH | **Paper settings footer uses raw `Button` instead of `SubmitButton` / `CancelButton`**. | Lines 2052-2067 | Standards violation |
| QP-09 | HIGH | **`handleSaveBlueprint` has no error handling or toast**. If blueprint save fails, user doesn't know. | Lines 547-573 | Reliability |
| QP-10 | HIGH | **`handleSaveSettings` (question paper) has no success toast** on save. | Lines 612-620 | UX |
| QP-11 | HIGH | **Exam schedule label uses `new Date().toLocaleDateString()`** — violates project rule of using `dayjs` and `DD-MM-YYYY` format. | Line 481-483 | Standards violation |
| QP-12 | MEDIUM | **`paperColumns` `useMemo` depends on `[]`** — empty dependency array means column renderers have stale closures over handlers. | Line 826 | Correctness |
| QP-13 | MEDIUM | **`papers` list pagination is hardcoded `pageSize: 30`** — no pagination controls in the table. | Line 422 | Scalability |
| QP-14 | MEDIUM | **Blueprint chapter table uses raw MUI `Table`** instead of `CustomizableTable`. | Lines 1055-1142 | Standards violation |
| QP-15 | MEDIUM | **Difficulty/Bloom tables use raw MUI `Table`** — same issue as QP-14. | Lines 1157, 1231 | Standards violation |
| QP-16 | MEDIUM | **Bank questions panel hardcoded to `pageSize: 100`** with no scroll pagination. Large subject banks will be truncated. | Line 513 | Scalability |
| QP-17 | MEDIUM | **`validateBlueprint` result not displayed to the user** — mutation is called but response never shown. | Line 1014 | UX |
| QP-18 | MEDIUM | **Blueprint `blueprintValid` only checks marks sum and percentages**. Doesn't check if enough questions exist in bank before enabling Generate. | Lines 539-543 | UX, data integrity |
| QP-19 | MEDIUM | **Status column in paper list uses `Chip` instead of `Label`** — other screens use `Label` per skill rule. | Line 739 | Inconsistency |
| QP-20 | MEDIUM | **`dangerouslySetInnerHTML` used for paper preview** — XSS risk if `preview.printHtml` contains untrusted content. Should sanitize with DOMPurify. | Lines 1550-1554 | Security |
| QP-21 | LOW | **"Create Paper" button text is just "Paper"** — not descriptive. Should be "+ Create Paper". | Line 858 | UX |
| QP-22 | LOW | **Drawer closes on backdrop click** — no unsaved-changes guard for blueprint edits in the drawer. | Line 908 | Data safety |
| QP-23 | LOW | **Question numbers in paper builder not re-ordered on remove**. If Q2 is removed, Q3 stays Q3. | Lines 1349, 1362 | Data integrity |
| QP-24 | LOW | **No drag-and-drop reordering** of questions in the paper builder. | Builder UI | UX |

---

### 2.2 Missing World-Class Features

| Feature | Importance | Description |
|---------|-----------|-------------|
| **Multi-Section Paper** | High | Paper is created with a hardcoded "Section A". No UI to add Section B, C, etc. with separate instructions |
| **Question Paper Template Library** | High | No ability to clone an existing paper as a template for next exam |
| **Version History for Paper** | Medium | No UI to compare v1 vs v2 of a paper after rejection and re-submission |
| **Question Marks Override in Paper** | Medium | When adding a question, marks default to bank marks — no way to override per paper |
| **Shuffle Sets (A/B/C)** | Medium | World-class ERP generates Set A, B, C with randomized question order to prevent cheating |
| **Watermarking** | Medium | Print preview should show "DRAFT / CONFIDENTIAL" watermark until published |
| **Question Stats in Builder** | Medium | Show running totals (marks so far, question count, difficulty distribution) live in the builder |
| **Answer Key PDF** | Medium | Separate export for answer key only (for invigilators) |
| **Paper Re-use / Copy** | Medium | Duplicate an entire paper to quickly create a variant |
| **Co-creator Collaboration** | Low | Multiple teachers can simultaneously add questions to a paper draft |

---

## 3. Cross-Module Issues

| # | Issue | Details |
|---|-------|---------|
| CX-01 | **`QUESTION_TYPE_OPTIONS` defined in 4 files** | `QuestionBankScreen.tsx`, `CreateQuestionDialog.tsx`, `ChapterQuestionsDialog.tsx`, `QuestionPaperScreen.tsx`. Should be a shared constant in `src/utils/examination-constants.ts` |
| CX-02 | **No link from Question Bank to Paper** | After approving a question, there's no shortcut "Use this question in a paper" |
| CX-03 | **No link from Paper to Question** | In the paper builder, clicking a bank question doesn't open its full Question Bank record |
| CX-04 | **Inconsistent `any` typing throughout** | Both files use `any` extensively — no TypeScript interfaces for `Question`, `QuestionPaper`, `Blueprint` |
| CX-05 | **Exam date format inconsistency** | Paper module uses `new Date().toLocaleDateString()` but QB module uses dayjs |
| CX-06 | **`medium?.educationMediumStages?.flatMap(...)` duplicated** | Same class-building logic in both main screens — should be a shared hook |
| CX-07 | **`buildSubjectOptions()` duplicated** | Defined identically in `QuestionBankScreen.tsx`, `CreateQuestionDialog.tsx`, and `QuestionPaperScreen.tsx` |

---

## 4. UX Improvement Roadmap

### Priority 1 — Fix Immediately (Breaks Production Trust)

```
1. Add shikshaMitraToast to ALL mutations:
   - reject, approve, submit, archive, duplicate (Question Bank)
   - addQuestion, removeQuestion, publishPaper, approvePaper, submitPaper (Paper)
   - saveBlueprint, savePaperSettings, saveQuestionBankSettings

2. Add ConfirmDialog before delete/archive actions (paper and question)

3. Replace window.confirm() with ConfirmDialog in close-with-unsaved-changes

4. Wire requireDifficulty + requireBloomLevel + requireAnswerKey settings into 
   buildQuestionValidationSchema()

5. Fix bulk upload stub — either implement the real API call or remove the 
   "Bulk Upload" toggle from CreateQuestionDialog
```

### Priority 2 — UX Polish (Critical for Teacher Adoption)

```
1. Add loading states on ALL workflow buttons in the preview sidebar
2. Add live question stats in paper builder (running marks total, question count)
3. Show validateBlueprint result (pass/fail per rule, not just silent call)
4. Show "Add Question" shortcut from filter bar using pre-filled Class/Subject/Chapter
5. Replace tag comma-text with chip input (MUI Autocomplete with freeSolo + chips)
6. Add character counter to question text (recommended max: 500 chars)
7. Re-number questions automatically after removal in paper builder
8. Add question count badge per chapter in the scope filter
```

### Priority 3 — World-Class Features

```
1. Rich text / LaTeX support in question text (react-quill or @uiw/react-md-editor)
2. Image attachment per question (Diagram-based questions require this)
3. Multi-section paper support (Section A/B/C with separate marks/instructions)
4. Shuffle sets (A/B/C) auto-generation for anti-cheating
5. Question usage analytics (which papers used this question)
6. Bulk status change (multi-select questions → batch approve/reject)
7. Paper template library (clone paper for next exam)
8. Answer key PDF export (separate from question paper PDF)
9. Drag-and-drop question reordering in paper builder
10. DOMPurify sanitization before dangerouslySetInnerHTML in preview
```

---

## 5. Code Quality Issues

### 5.1 Architecture Problems

```diff
- Both screens are monolithic (QuestionBankScreen.tsx: 1802 lines, QuestionPaperScreen.tsx: 2118 lines)
+ Extract: QuestionBankFilters, QuestionBankTable, QuestionFormDialog,
+          QuestionBankSettings, QuestionBankStatCards into separate component files

- Shared constants duplicated across 4 files
+ Create: src/utils/examination-constants.ts with all shared options

- No TypeScript interfaces for domain objects
+ Create: src/types/examination.ts with Question, QuestionPaper, Blueprint interfaces

- Duplicate buildSubjectOptions(), class-building logic in 3 files
+ Create: src/hooks/useClassSubjectOptions.ts shared hook
```

### 5.2 Performance Problems

```diff
- pageSize: 300 for questions (loads all records at once)
+ Implement server-side pagination — CustomizableTable already supports page/pageSize

- pageSize: 30 for papers (no pagination controls rendered)
+ Add pagination controls or infinite scroll

- pageSize: 100 for bank questions in builder (truncated with no load-more)
+ Implement lazy loading with IntersectionObserver as user scrolls

- Both formik instances (create + edit) and 6 API queries run simultaneously
+ Lazy-load edit form data only when edit dialog opens
```

### 5.3 Standards Violations Summary

| Rule Violated | Where |
|--------------|-------|
| Use `CustomDialog` not bare `Dialog` | QP reject dialog (line 2072) |
| Use `SubmitButton` / `CancelButton` | QP settings footer (lines 2052-2067) |
| Use `Label` not `Chip` for status | QP paper list status column (line 739) |
| Use `dayjs` not `new Date()` | QP exam schedule label (line 481) |
| Use `CustomizableTable` not raw `Table` | Blueprint chapter/difficulty/bloom tables |
| Use `shikshaMitraToast` for all feedback | 10+ mutation call sites missing toasts |
| Use `ConfirmDialog` not `window.confirm()` | QP close dialog handler (line 630) |
| Use `CustomPopover` not `Popover` | Settings popovers in both screens |
| Register icons in `GlobalIcons` | `mingcute:*` icons used as inline strings throughout |

---

## 6. Specific Code Fixes Required

### Fix QB-04/QB-05/QB-06 — Add Toast to All Mutations

```tsx
// BEFORE (bare call, no feedback)
submitQuestion({ id: row.id });

// AFTER (with toast and error handling)
try {
  await submitQuestion({ id: row.id }).unwrap();
  shikshaMitraToast.success({ message: 'Question submitted for review.' });
} catch (err: any) {
  shikshaMitraToast.error({
    message: err?.data?.detail || 'Failed to submit question.',
  });
}
```

### Fix QP-04 — Add Confirm Before Delete/Archive

```tsx
// BEFORE (single click destroys data)
onClick={() => deletePaper({ id: row.id })}

// AFTER (ConfirmDialog required)
const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

<ConfirmDialog
  open={!!deleteTargetId}
  title="Delete Question Paper"
  content="This action cannot be undone. The paper and all its blueprint data will be permanently deleted."
  icon="warning"
  onClose={() => setDeleteTargetId(null)}
  action={
    <Button size="small" color="error" variant="contained"
      onClick={async () => {
        await deletePaper({ id: deleteTargetId }).unwrap();
        setDeleteTargetId(null);
      }}>
      Delete
    </Button>
  }
/>
```

### Fix QP-05 — Replace window.confirm()

```tsx
// BEFORE
if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
  setDialogOpen(false);
}

// AFTER — Use ConfirmDialog state
const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);

const handleCloseCreateDialog = () => {
  if (formik.dirty) {
    setCloseConfirmOpen(true);
  } else {
    setDialogOpen(false);
  }
};

<ConfirmDialog
  open={closeConfirmOpen}
  title="Discard Changes?"
  content="You have unsaved changes. They will be lost if you close now."
  icon="warning"
  onClose={() => setCloseConfirmOpen(false)}
  action={
    <Button size="small" color="error" variant="contained"
      onClick={() => { setCloseConfirmOpen(false); setDialogOpen(false); formik.resetForm(); }}>
      Discard
    </Button>
  }
/>
```

### Fix QB-02 — Enforce Settings in Validation Schema

```tsx
// BEFORE — requireDifficulty / requireBloomLevel / requireAnswerKey ignored
function buildQuestionValidationSchema(settings?: any) {
  return Yup.object({
    difficultyLevel: Yup.number().required(),
    bloomLevel: Yup.number().nullable(),
    // no requireAnswerKey enforcement
  });
}

// AFTER — all settings flags enforced
function buildQuestionValidationSchema(settings?: any) {
  return Yup.object({
    standardId: Yup.string().required('Class is required'),
    subjectId: Yup.string().required('Subject is required'),
    questionText: Yup.string().required('Question text is required').min(5, 'Too short'),
    marks: Yup.number().required('Marks are required').min(0.5).max(100),
    questionType: Yup.number().required(),
    difficultyLevel: Yup.number().required('Difficulty is required'),
    bloomLevel: settings?.requireBloomLevel
      ? Yup.number().required("Bloom's level is required")
      : Yup.number().nullable(),
    chapterId: settings?.requireChapter
      ? Yup.string().required('Chapter is required')
      : Yup.string().nullable(),
    topicName: settings?.requireTopic
      ? Yup.string().required('Topic is required')
      : Yup.string().nullable(),
    answerKey: settings?.requireAnswerKey
      ? Yup.string().when('questionType', {
          is: (type: number) => [4, 5, 6].includes(type),
          then: (s) => s.required('Answer key is required when requireAnswerKey is enabled'),
        })
      : Yup.string().notRequired(),
    options: Yup.array().when('questionType', {
      is: (type: number) => [1, 2, 3].includes(Number(type)),
      then: (schema) =>
        schema
          .test('has-two-options', 'Enter at least two options',
            (opts: any) => Array.isArray(opts) && opts.filter((o: any) => String(o?.optionText || '').trim()).length >= 2)
          .test('has-correct-option', 'Mark at least one option as correct',
            (opts: any) => Array.isArray(opts) && opts.some((o: any) => o.isCorrect)),
    }),
  });
}
```

### Fix CX-01 — Extract Shared Constants

```ts
// NEW FILE: src/utils/examination-constants.ts
export const QUESTION_TYPE_OPTIONS = [
  { value: 1, label: 'MCQ – Single Correct' },
  { value: 2, label: 'MCQ – Multiple Correct' },
  { value: 3, label: 'True / False' },
  { value: 4, label: 'Fill in the Blank' },
  { value: 5, label: 'Short Answer' },
  { value: 6, label: 'Long Answer' },
  { value: 7, label: 'Match the Following' },
  { value: 8, label: 'Assertion & Reason' },
  { value: 9, label: 'Case Study' },
  { value: 10, label: 'Diagram Based' },
  { value: 11, label: 'Practical' },
] as const;

export const DIFFICULTY_OPTIONS = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
] as const;

export const BLOOM_OPTIONS = [
  { value: 1, label: 'Remembering' },
  { value: 2, label: 'Understanding' },
  { value: 3, label: 'Applying' },
  { value: 4, label: 'Analyzing' },
  { value: 5, label: 'Evaluating' },
  { value: 6, label: 'Creating' },
] as const;
```

---

## 7. Summary Scorecard

| Dimension | Score | Key Issues |
|-----------|-------|-----------|
| **Feature Completeness** | 60/100 | Bulk upload stub, multi-section missing, image upload unused |
| **Code Quality** | 65/100 | Good structure; bad duplication, `any` typing, monolithic files |
| **Error Handling** | 40/100 | Most mutations fire-and-forget with no toast or catch |
| **UX / Teacher Experience** | 55/100 | Good form layout; missing confirmations, live stats, preview |
| **Data Safety** | 45/100 | Delete without confirm, no XSS sanitization on paper preview |
| **Standards Compliance** | 70/100 | Most rules followed; raw Dialog/Table/window.confirm violations |
| **Performance** | 50/100 | Hardcoded page limits, monolithic 1800+ line components |
| **World-Class ERP Readiness** | 40/100 | Missing: rich text, shuffle sets, multi-section, audit log |

**Overall: 53/100 — Functional MVP, not yet production-grade**

> **Path to 85/100 (world-class):**
> - Sprint 1–2: Complete all Priority 1 fixes (error handling, confirmations, settings enforcement)
> - Sprint 3–4: UX polish — live stats, blueprint validation display, tag chips, question preview
> - Sprint 5–8: World-class features — rich text, multi-section, shuffle sets, answer key export

---

*Report generated by Antigravity code review | 2026-07-31*
*Files reviewed: [QuestionBankScreen.tsx](file:///d:/Gyanmirai/shikshamitra/Shikshamitra-FE/src/screens/examination/question-bank/QuestionBankScreen.tsx) | [CreateQuestionDialog.tsx](file:///d:/Gyanmirai/shikshamitra/Shikshamitra-FE/src/screens/examination/question-bank/components/CreateQuestionDialog.tsx) | [ChapterQuestionsDialog.tsx](file:///d:/Gyanmirai/shikshamitra/Shikshamitra-FE/src/screens/examination/question-bank/components/ChapterQuestionsDialog.tsx) | [QuestionPaperScreen.tsx](file:///d:/Gyanmirai/shikshamitra/Shikshamitra-FE/src/screens/examination/question-paper/QuestionPaperScreen.tsx)*
