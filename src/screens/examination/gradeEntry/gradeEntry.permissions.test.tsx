import type { ReactNode } from 'react';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import GradeEntry from './gradeEntry';

const fixture = vi.hoisted(() => ({
  permissions: [] as { name: string; isGranted: boolean }[],
  mutation: vi.fn(() => ({ unwrap: async () => ({}) })),
  medium: { id: 'medium', educationMediumStages: [{ standards: [
    { id: 'class', name: 'Class 6', divisions: [{ id: 'division', name: 'A' }] },
  ] }] },
  year: { name: '2026-2027' },
}));

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (selector: (state: unknown) => unknown) => selector({
    auth: { permissions: fixture.permissions }, confirmPopup: { isChanges: false },
    globalState: { currentMedium: fixture.medium, currentYear: fixture.year },
  }),
}));
vi.mock('framer-motion', () => ({
  motion: { div: ({ children }: { children: ReactNode }) => <div>{children}</div> },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('src/components/custom-select', () => ({ default: () => null }));
vi.mock('src/components/customDialog', () => ({ default: () => null, DialogScrollContent: () => null }));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('./components/assignGradeForm', () => ({ default: () => null }));
vi.mock('./components/GradeEntryInsights', () => ({ GradeEntryInsights: () => null }));
vi.mock('./components/ImportMarksPreviewDialog', () => ({ ImportMarksPreviewDialog: () => null }));
vi.mock('./components/GradeEntryReviewDialog', () => ({ GradeEntryReviewDialog: () => null }));
vi.mock('./components/BulkGradeEntryToolbar', () => ({
  BulkGradeEntryToolbar: () => <button type="button">Import marks</button>,
}));
vi.mock('./components/GradeEntryTable', () => ({
  default: ({ isLocked }: { isLocked: boolean }) => <input aria-label="Marks" disabled={isLocked} />,
}));
vi.mock('src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi', () => ({ useGetExamsQuery: 'exams' }));
vi.mock('src/redux/classManagementApi/subjectProgressManageApi/subjectProgressManageApi', () => ({ useGetSubjectsQuery: 'subjects' }));
vi.mock('src/redux/academicAPI/ExaminationApi/RecordMarksApi/recordMarksApi', () => ({
  useVerifyMarksMutation: 'verify', useUnlockMarksMutation: 'unlock', useBulkSaveMarksMutation: 'bulk',
  useValidateMarksMutation: 'validate', useSaveDraftMarksMutation: 'draft', useRequestChangesMutation: 'changes',
  useGetExamMarksSummaryQuery: 'summary', useGetExamMarksAuditLogsQuery: 'audit',
  usePublishAndLockMarksMutation: 'publish', useSubmitMarksForVerificationMutation: 'submit',
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type, currentQueryAndMutation: key }: { type: string; currentQueryAndMutation: string }) => {
    if (type === 'mutation') return [fixture.mutation, { isLoading: false }];
    if (key === 'exams') return { data: { items: [{ examId: 'exam', examName: 'Term Exam' }] } };
    if (key === 'subjects') return { data: [{ id: 'subject', name: 'Math' }] };
    return { data: null };
  },
}));

async function chooseExam() {
  const exam = screen.getByRole('combobox', { name: 'Exam Title' });
  await waitFor(() => expect(exam).toBeEnabled());
  fireEvent.mouseDown(exam);
  fireEvent.click(await screen.findByRole('option', { name: 'Term Exam' }));
}

beforeEach(() => { fixture.permissions = []; fixture.mutation.mockClear(); });

describe('grade entry permissions', () => {
  it.each([
    ['Academics.Examination.RecordMarks.View', true],
    ['Academics.Examination.RecordMarks', true],
    ['Academics.Examination.RecordMarks.Add', false],
  ])('keeps marks read-only for %s with granted=%s', async (name, isGranted) => {
    fixture.permissions = [{ name, isGranted }];
    render(<GradeEntry searchParams={{ subject: 'subject' }} />);
    await chooseExam();
    expect(screen.getByRole('textbox', { name: 'Marks' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save Draft' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Import marks' })).not.toBeInTheDocument();
    expect(fixture.mutation).not.toHaveBeenCalled();
  });

  it('lets an exact Add grant save and locks the same screen on revocation', async () => {
    fixture.permissions = [{ name: 'Academics.Examination.RecordMarks.Add', isGranted: true }];
    const { rerender } = render(<GradeEntry searchParams={{ subject: 'subject' }} />);
    await chooseExam();
    expect(screen.getByRole('textbox', { name: 'Marks' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }));
    await waitFor(() => expect(fixture.mutation).toHaveBeenCalledTimes(2));
    fixture.permissions = [];
    rerender(<GradeEntry searchParams={{ subject: 'subject' }} />);
    expect(screen.getByRole('textbox', { name: 'Marks' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save Draft' })).not.toBeInTheDocument();
  });
});
