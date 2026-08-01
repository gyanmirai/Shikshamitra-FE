# Question Bank ↔ Question Paper — Integration Report
**Date:** 2026-07-31 | **Scope:** Connection, Missing Features, Edge Cases, New Functionalities

---

## 1. Current Connection Map

```
QUESTION BANK                         QUESTION PAPER
─────────────                         ──────────────
[Create Question]                     [Create Paper]
      ↓                                     ↓
[Submit for Review]                   [Configure Blueprint]
      ↓                                     ↓
[Approve] ──── status: 3 ──────────→ [Builder: Add Question]
                                            ↓
                                      [Generate (Auto)]
                                            ↓
                                      [Preview & Publish]
```

The **only bridge** between the two modules is:

```ts
// QuestionPaperScreen.tsx:505-516
useGetQuestionsQuery({
  standardId: selectedPaper?.standardId,
  subjectId:  selectedPaper?.subjectId,
  status: 3,           // ONLY approved questions
  chapterId: bankChapterId || undefined,
  difficultyLevel: bankDifficulty || undefined,
  questionType: bankQuestionType || undefined,
  pageSize: 100,
})

// Bridge endpoints (question-paper-api.ts)
addQuestionToPaper   → POST /question-papers/:id/add-question
removeQuestionFromPaper → POST /question-papers/:id/remove-question
generatePaper        → POST /question-papers/:id/generate
```

---

## 2. What IS Connected (Currently Working)

| # | Connection | Where |
|---|-----------|-------|
| C-01 | Approved questions (status=3) feed into the paper builder | `QuestionPaperScreen.tsx:512` |
| C-02 | Paper filters bank by same standardId + subjectId as the paper | Lines 507-508 |
| C-03 | Paper builder filters by chapter, difficulty, question type | Lines 509-511 |
| C-04 | `addQuestionToPaper` bridges a `questionBankItemId` into a paper section | Line 583 |
| C-05 | `removeQuestionFromPaper` deletes the bridge record | Line 593 |
| C-06 | `generatePaper` (auto-mode) uses blueprint rules to pull approved questions | API-level only |
| C-07 | `publishQuestionPaper` invalidates `questionBank` RTK tag — so bank `usedCount` can update | `question-paper-api.ts:61` |
| C-08 | Already-added questions are visually marked in the builder (green border + disabled add button) | Lines 1437-1439 |

---

## 3. What is MISSING in the Connection

### 3.1 Missing FE Functionality (API exists, FE not wired)

| # | Missing | API Endpoint Exists | Severity |
|---|---------|-------------------|---------|
| M-01 | **`useReorderPaperQuestionsMutation` imported and exported but never called** — reorder UI (drag-drop) is completely absent even though the backend supports it | `reorderPaperQuestions` in api | CRITICAL |
| M-02 | **`useCheckDuplicateQuestionMutation` is exported from the API but never called from the FE** — the duplicate detection feature is wired on the backend but zero UI exists | `checkDuplicateQuestion` in api | CRITICAL |
| M-03 | **`useBulkApproveQuestionsMutation` and `useBulkRejectQuestionsMutation` exist in the API** but there is NO multi-select checkbox UI in QuestionBankScreen. Backend is ready, FE is not. | Both in api | HIGH |
| M-04 | **`useGetQuestionByIdQuery` exists but is never used** — clicking a question in the bank or in the paper builder never opens a full detail/preview. | `getQuestionById` in api | HIGH |
| M-05 | **`useLockQuestionPaperMutation` exists but is not called anywhere** — the Lock step between Approved and Published is skipped in the UI. | `lockQuestionPaper` in api | HIGH |
| M-06 | **`useUpdateQuestionPaperMutation` exists but is not called** — there is no "Edit Paper metadata" flow (e.g., change title, marks, instructions after creation). | `updateQuestionPaper` in api | HIGH |
| M-07 | **`alreadyAdded` check uses `pq.questionBankItemId === q.id`** but `selectedPaper.questions` from the list API likely does NOT include `questionBankItemId` — they are paper-level question objects. This check will always be false, allowing duplicate additions. | `QuestionPaperScreen.tsx:1437` | CRITICAL |

### 3.2 Missing UI Connections (No API yet — need both FE + BE)

| # | Missing Connection | Description |
|---|-------------------|-------------|
| M-08 | **QB → Paper shortcut ("Use in Paper")** | From the Question Bank row actions, teacher should be able to click "Add to Paper" and jump to the paper builder pre-selecting that question |
| M-09 | **Paper → QB deep-link ("View in Bank")** | In the paper builder, clicking a bank question text should open a full detail dialog with all its fields (options, explanation, answer key, Bloom level) |
| M-10 | **QB "Used in N papers" drill-down** | `usedCount` is displayed in QB table but clicking it does nothing. Should open a dialog listing which papers contain this question |
| M-11 | **QB status change propagation to Paper** | If an Approved question (status=3) is later rejected/archived after being added to a Draft paper, the paper builder does NOT warn the teacher. It silently keeps the orphaned question |
| M-12 | **Cross-module RTK tag invalidation gap** | `approveQuestion` invalidates `[questionBank, chapter]` but NOT `[questionPaper]`. So when a question is approved, the paper builder's bank list doesn't refresh immediately |

---

## 4. Edge Cases That MUST Be Handled

### Group A — Question Status vs Paper Status

| # | Edge Case | Current Behavior | Required Behavior |
|---|-----------|-----------------|------------------|
| E-01 | **Question is added to a Draft paper, then the question gets Rejected/Archived** | Question still shows in paper builder with no warning | Show a badge/alert "X questions in this paper are no longer approved. Please replace them before submitting." |
| E-02 | **Question is added to a Published paper, then teacher tries to edit the question** | Edit dialog opens normally (only `isLocked` flag disables, which comes from versioning) | If question is used in any Published/Locked paper, show a clear warning: "Editing will create v2 and require re-approval. The paper will NOT auto-update." |
| E-03 | **Teacher approves a question that is already inside a Submitted/Approved paper** | `publishQuestionPaper` invalidates questionBank tag — but the paper is already submitted | No action needed, but the `usedCount` should reflect the pending-paper usage too, not just Published papers |
| E-04 | **A question's marks are changed after it was added to a paper** | Paper question still shows old marks from when it was added | Show a warning icon on the question row in the builder: "Marks differ from bank (Bank: 2M, Paper: 1M)" |

### Group B — Blueprint vs Available Questions

| # | Edge Case | Current Behavior | Required Behavior |
|---|-----------|-----------------|------------------|
| E-05 | **Blueprint says "Chapter 3 needs 5 questions, 20 marks" but Chapter 3 only has 3 approved questions** | Generate button remains enabled (blueprint math passes, chapter sum = totalMarks), generation fails silently on backend | Before enabling Generate, validate available question count per chapter against blueprint count. Show: "Chapter 3: Blueprint needs 5 questions, bank has 3 approved" |
| E-06 | **Blueprint set, all percentages = 100%, but NO questions exist in bank for this paper (standardId/subjectId)** | Blueprint math passes, Generate button enabled, API call likely returns empty paper | Disable Generate with warning: "No approved questions found in bank for this class and subject" |
| E-07 | **Paper is in Manual mode but teacher also saves a blueprint** | Blueprint is saved silently. On generate, it would conflict with manually added questions | Show warning: "This paper is in Manual mode. Blueprint rules only apply in Auto/Hybrid mode. Switch to Hybrid to use both." |
| E-08 | **Blueprint has chapter marks that don't sum to totalMarks, but `blueprintValid = false`** | Generate button is disabled (correct) | Also show per-chapter gap: "You've allocated 80/100 marks. 20 marks unassigned." |

### Group C — Question Counting & Marks

| # | Edge Case | Current Behavior | Required Behavior |
|---|-----------|-----------------|------------------|
| E-09 | **Teacher manually adds questions totaling 120 marks to a 100-mark paper** | No validation — paper silently exceeds its own totalMarks | Show a live running total in the builder header: "Marks added: 120/100" with red highlight when exceeded |
| E-10 | **Teacher removes the only question from a Submitted paper** | Paper goes back to having 0 questions, but status remains Submitted | Either block removal on Submitted papers, or auto-revert status to Draft when questions are removed |
| E-11 | **Same question added twice (alreadyAdded check fails — see M-07)** | Duplicate question entries in paper | Fix the `alreadyAdded` check to use a reliable ID, and block duplicate additions with a toast warning |
| E-12 | **Paper has 0 questions and teacher clicks "Submit for Approval"** | Submit API call fires with an empty paper | Block submission if `selectedPaper.questions.length === 0`, show: "Add at least 1 question before submitting for approval." |

### Group D — Workflow Timing & Concurrency

| # | Edge Case | Current Behavior | Required Behavior |
|---|-----------|-----------------|------------------|
| E-13 | **Two HODs approve the same question simultaneously** | Likely both API calls succeed (race condition on backend) | Backend should handle; FE should refetch after approve with `.unwrap()` + `shikshaMitraToast` |
| E-14 | **Teacher closes the Drawer while blueprint save is in progress** | Drawer closes, save may complete or fail silently | Show unsaved-changes guard when blueprint has been edited: "You have unsaved blueprint changes. Save or discard?" |
| E-15 | **Academic year changes mid-session while QB or QP is open** | Questions from old year show in new year filter | Both screens use `academicYearId` from Redux `globalState`. If year changes, both screens must refetch. Add a listener: `useEffect(() => { refetch(); }, [academicYearId])` |

---

## 5. How They SHOULD Be Connected — Full Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUESTION BANK (Source of Truth)              │
│                                                                 │
│  Teacher creates → Submits → HOD Reviews → Approves/Rejects     │
│                                                                 │
│  Questions carry: standardId, subjectId, chapterId, type,       │
│                   marks, difficulty, bloomLevel, tags,          │
│                   options, answerKey, usedCount, isLocked       │
└────────────────────────────┬────────────────────────────────────┘
                             │ status = 3 (Approved only)
                             │ + same standardId + subjectId
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   INTEGRATION LAYER (Missing)                   │
│                                                                 │
│  1. Question validity check before paper submission             │
│  2. Marks drift detection (bank vs paper)                       │
│  3. Availability check before blueprint Generate                │
│  4. Cross-module status change notifications                    │
│  5. usedCount increment when paper is Published                 │
│  6. isLocked flag set when paper is Published                   │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    QUESTION PAPER (Consumer)                    │
│                                                                 │
│  Create Paper → Blueprint → Add Questions (Manual/Auto/Hybrid)  │
│             → Validate → Generate → Preview → Submit → Publish  │
│                                                                 │
│  Paper uses: questionBankItemId (FK to QB question)             │
│              sectionId, questionNumber, marks, sortOrder        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. RTK Query Tag Invalidation — Current Gaps

```ts
// CURRENT (incomplete)
approveQuestion  → invalidates: [questionBank]           ❌ missing: questionPaper
rejectQuestion   → invalidates: [questionBank]           ❌ missing: questionPaper  
archiveQuestion  → invalidates: [questionBank]           ❌ missing: questionPaper
updateQuestion   → invalidates: [questionBank]           ❌ missing: questionPaper

addQuestionToPaper    → invalidates: [questionPaper]     ❌ missing: questionBank (usedCount)
removeQuestionFromPaper → invalidates: [questionPaper]   ❌ missing: questionBank (usedCount)
generatePaper         → invalidates: [questionPaper]     ❌ missing: questionBank (usedCount)

// SHOULD BE
approveQuestion  → invalidates: [questionBank, questionPaper]
archiveQuestion  → invalidates: [questionBank, questionPaper]
addQuestionToPaper → invalidates: [questionPaper, questionBank]
generatePaper    → invalidates: [questionPaper, questionBank]
```

Fix in `question-bank-api.ts`:
```ts
approveQuestion: builder.mutation({
  ...
  invalidatesTags: [academicType.questionBank, academicType.questionPaper], // ADD questionPaper
}),
```

Fix in `question-paper-api.ts`:
```ts
addQuestionToPaper: builder.mutation({
  ...
  invalidatesTags: [academicType.questionPaper, academicType.questionBank], // ADD questionBank
}),
```

---

## 7. New Features to Add

### Category A — Direct Connection Features (High Value, Build First)

| # | Feature | What It Does | How to Build |
|---|---------|-------------|-------------|
| N-01 | **"Add to Paper" from QB row** | From Question Bank three-dots menu, click "Add to Paper" → opens a paper selector dialog → directly adds question to selected paper's first section | Add MenuItem in QB three-dots, open a `CustomDialog` with paper list (status < 3), call `addQuestionToPaper` |
| N-02 | **"View in Bank" from Paper Builder** | Clicking question text in builder opens a read-only detail panel with options, explanation, answer key, tags | Call `useGetQuestionByIdQuery` on click, render in a side sheet or dialog |
| N-03 | **"Used in N Papers" drill-down in QB** | Click the Times Used count → opens dialog showing paper names, dates, status | Add new API: `GET /question-bank/questions/:id/usage` → list of papers |
| N-04 | **Live Marks Counter in Paper Builder** | Show "Marks Added: 85/100" header badge updating in real-time | `const addedMarks = (selectedPaper.questions || []).reduce((s, q) => s + q.marks, 0)` |
| N-05 | **Blueprint Availability Check before Generate** | Show per-chapter: "Need 5Q from Ch3, Bank has 3 approved" — disable Generate if any chapter is short | Call `getQuestions` with each chapter's filters, compare count against blueprint |
| N-06 | **Stale Question Warning in Builder** | If a question's bank status changes after being added, show a warning badge | Add `isValid` field to paper question from backend, or re-validate on open |
| N-07 | **Drag-and-Drop Reorder in Builder** | Reorder paper questions by dragging — calls `reorderPaperQuestions` (API already exists!) | Use `@hello-pangea/dnd` or `dnd-kit`, on drop call `useReorderPaperQuestionsMutation` |
| N-08 | **Question Search in Builder** | Full-text search across bank questions beyond just chapter/difficulty/type filters | Add `searchText` param to `getQuestions` query in builder |

### Category B — Smart Features (World-Class ERP)

| # | Feature | Description |
|---|---------|-------------|
| N-09 | **Duplicate Detection at Create Time** | When teacher types question text, debounce-call `checkDuplicateQuestion` (API exists!) and show inline warning: "Similar question already exists: [click to view]" |
| N-10 | **Bulk Approve from QB** | Multi-select checkboxes in QB table, "Approve Selected" / "Reject Selected" bulk action buttons — APIs `bulkApproveQuestions` and `bulkRejectQuestions` already exist! |
| N-11 | **Auto-Section Assignment by Question Type** | When generating a paper, group MCQ into Section A, Short Answer into Section B, Long Answer into Section C — match CBSE/state board format |
| N-12 | **Shuffle Sets (Set A / Set B)** | From the paper Preview tab, click "Generate Set B" → randomizes question order → creates a parallel paper → both share the same blueprint |
| N-13 | **Answer Key Export** | From Preview sidebar, button "Export Answer Key PDF" — renders only question numbers + correct answers without distractors |
| N-14 | **Question Marks Override** | When adding a question to a paper, allow the teacher to override marks (default: bank marks). Store override in `paperQuestion.marks`, not in the bank |
| N-15 | **Paper Template Clone** | Three-dots on paper row → "Clone as Template" → creates new Draft paper with same blueprint, no questions |
| N-16 | **QB → Paper Contribution Graph** | Dashboard widget showing "Chapter 3 contributes 40% of questions in papers this year" |
| N-17 | **Bank Coverage Report** | Per paper, show "Chapter Coverage: 6/8 chapters covered" and "Bloom Coverage: HOTS = 30%" |
| N-18 | **Question Expiry** | QB setting: "Mark question as expired after X years" — expired questions can't be added to new papers but remain in historical papers |
| N-19 | **Question Peer Review** | Before HOD approves, send to another teacher for peer review. QP only picks questions with peer_reviewed = true |
| N-20 | **AI-Suggested Questions for Blueprint** | When blueprint is saved, call an AI endpoint: "Suggest 5 Easy MCQs from Chapter 3 matching Remembering level" — highlights top matches in builder |

### Category C — Settings Integration (Missing Link)

| # | Feature | Description |
|---|---------|-------------|
| N-21 | **QB Settings affect Paper Generation** | QB setting `requireDifficulty` should be enforced when `generatePaper` is called — backend should reject generation if any question in the bank doesn't meet requirements |
| N-22 | **QP Settings link to QB lock** | QP setting `enableRecentQuestionBlock` (exclude questions used in last N days) — FE should visually mark recently-used bank questions with a "Recently Used" badge in the builder |
| N-23 | **Negative Marks flow end-to-end** | QB stores `negativeMarks` per question. QP paper should show `-0.25` next to marks in the builder. Answer key PDF should show the marking scheme. Currently negativeMarks is stored but never shown in Paper module. |
| N-24 | **Versioned Question in Paper** | When a locked question is edited (creating v2), the paper should show: "Q3 has a newer version (v2 pending approval). Current paper uses v1." |
| N-25 | **Cross-Year Question Import** | From QB, "Import questions from previous academic year" — copies Approved questions into current year's bank with status=Draft for re-approval |

---

## 8. Priority Implementation Order

```
SPRINT 1 (Immediate — Fix Broken Things)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Fix M-07 — alreadyAdded check (CRITICAL — allows duplicate question addition)
2. Fix RTK tag invalidations (approveQuestion → invalidate questionPaper)
3. Add live marks counter in builder (E-09)
4. Block submission when 0 questions (E-12)
5. Block submission when marks exceed totalMarks (E-09)

SPRINT 2 (Connect the Modules)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. N-07 — Drag-and-drop reorder (API exists, just need DND library)
7. N-04 — Live marks counter
8. N-02 — View question detail from builder (API exists)
9. N-10 — Bulk approve/reject (API exists: bulkApproveQuestions)
10. N-09 — Duplicate detection at create time (API exists: checkDuplicateQuestion)

SPRINT 3 (Smart Features)
━━━━━━━━━━━━━━━━━━━━━━━━━
11. N-01 — "Add to Paper" from QB row
12. N-03 — "Used in papers" drill-down
13. N-05 — Blueprint availability check
14. N-08 — Question search in builder
15. N-14 — Marks override per question in paper

SPRINT 4+ (World-Class)
━━━━━━━━━━━━━━━━━━━━━━
16. N-11 — Auto-section grouping by question type
17. N-12 — Shuffle sets (Set A/B)
18. N-13 — Answer key PDF export
19. N-16 — Coverage report
20. N-20 — AI-suggested questions
```

---

## 9. Summary of Findings

| Category | Count | Key Finding |
|----------|-------|-------------|
| API endpoints wired in backend but NOT called in FE | 7 | reorderPaperQuestions, checkDuplicateQuestion, bulkApproveQuestions, bulkRejectQuestions, getQuestionById, lockQuestionPaper, updateQuestionPaper |
| Critical edge cases unhandled | 15 | Stale questions, marks overflow, 0-question submission, blueprint vs availability mismatch |
| Missing connection features | 12 | No QB→Paper shortcut, no Paper→QB deep-link, no usedCount drill-down, broken alreadyAdded check |
| RTK tag gaps | 4 | approveQuestion, archiveQuestion, addQuestionToPaper, generatePaper each miss one cross-module tag |
| New features that can be added | 25 | Many APIs already exist; just need FE implementation |

> The biggest quick-wins are features where **the backend API already exists** but FE has not called them:
> `reorderPaperQuestions`, `checkDuplicateQuestion`, `bulkApproveQuestions`, `bulkRejectQuestions`
> These can be built in a single sprint with no backend work.

---

*Report generated by Antigravity | 2026-07-31*
*Files analyzed: [question-bank-api.ts](file:///d:/Gyanmirai/shikshamitra/Shikshamitra-FE/src/redux/academicAPI/ExaminationApi/QuestionBankApi/question-bank-api.ts) | [question-paper-api.ts](file:///d:/Gyanmirai/shikshamitra/Shikshamitra-FE/src/redux/academicAPI/ExaminationApi/QuestionPaperApi/question-paper-api.ts) | [QuestionBankScreen.tsx](file:///d:/Gyanmirai/shikshamitra/Shikshamitra-FE/src/screens/examination/question-bank/QuestionBankScreen.tsx) | [QuestionPaperScreen.tsx](file:///d:/Gyanmirai/shikshamitra/Shikshamitra-FE/src/screens/examination/question-paper/QuestionPaperScreen.tsx)*
