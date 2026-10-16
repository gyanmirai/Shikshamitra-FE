import type { ReactNode } from 'react';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import ResultCreation from './ResultCreation';

const fixture = vi.hoisted(() => ({
  permissions: [] as { name: string; isGranted: boolean }[],
  header: null as null | { id: string; statusCode: number; status: string },
  mutation: vi.fn(() => Object.assign(Promise.resolve({}), { unwrap: async () => ({}) })),
  medium: { id: 'medium', educationMediumStages: [{ standards: [
    { id: 'class', name: 'Class 6', divisions: [{ id: 'division', name: 'A' }] },
  ] }] },
  year: { name: '2026-2027' },
}));

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) => selector({
    auth: { permissions: fixture.permissions },
    globalState: { currentMedium: fixture.medium, currentYear: fixture.year },
  }),
}));
vi.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));
vi.mock('framer-motion', () => ({
  motion: { div: ({ children }: { children: ReactNode }) => <div>{children}</div> },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ action }: { action: ReactNode }) => <div>{action}</div>,
}));
vi.mock('src/screens/academic/components/academic-insights', () => ({ AcademicInsights: () => null }));
vi.mock('src/components/customizabaleTable', () => ({ default: () => null }));
vi.mock('src/components/custom-select', () => ({ default: () => null }));
vi.mock('src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards', () => ({
  TimetableSettingsSummaryCards: () => null,
}));
vi.mock('src/components/customDialog', () => ({ default: () => null, DialogScrollContent: () => null }));
vi.mock('src/redux/tenant/tenantApi', () => ({ useGetTenantByIdQuery: 'tenant' }));
vi.mock('src/redux/academicAPI/AcademicReportApi', () => ({ usePreviewAcademicReportMutation: 'preview' }));
vi.mock('src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi', () => ({
  useGetExamsQuery: 'exams',
}));
vi.mock('src/redux/academicAPI/ExaminationApi/ResultApi/resultApi', () => ({
  useGetResultHeaderQuery: 'header', useGetResultReadinessQuery: 'readiness',
  useFreezeResultMutation: 'freeze', usePublishResultMutation: 'publish',
  useGenerateResultMutation: 'generate', useGetStudentResultDetailsQuery: 'student',
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type, currentQueryAndMutation: key }: { type: string; currentQueryAndMutation: string }) => {
    if (type === 'mutation') return [fixture.mutation, { isLoading: false }];
    if (key === 'header') return { data: fixture.header };
    if (key === 'readiness') return { data: { isReady: true, checks: [] } };
    if (key === 'exams') return { data: { items: [{ examId: 'exam', examName: 'Term Exam' }] } };
    return { data: null };
  },
}));

async function chooseExam() {
  const exam = screen.getByRole('combobox', { name: 'Exam' });
  await waitFor(() => expect(exam).toBeEnabled());
  fireEvent.mouseDown(exam);
  fireEvent.click(await screen.findByRole('option', { name: 'Term Exam' }));
}

beforeEach(() => {
  fixture.permissions = [];
  fixture.header = null;
  fixture.mutation.mockClear();
});

describe('result action permissions', () => {
  it.each(['View', 'Add', 'Generate'])('does not infer publish from the %s grant', async (action) => {
    fixture.permissions = [{ name: `Academics.Examination.ResultCreation.${action}`, isGranted: true }];
    render(<ResultCreation />);
    await chooseExam();
    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Freeze' })).not.toBeInTheDocument();
    if (action !== 'Generate') {
      expect(screen.queryByRole('button', { name: 'Generate Preview' })).not.toBeInTheDocument();
    }
  });

  it.each([
    ['Generate', 'Generate Preview', null],
    ['Publish', 'Publish', { id: 'result', statusCode: 0, status: 'Draft' }],
    ['Freeze', 'Freeze', { id: 'result', statusCode: 1, status: 'Published' }],
  ] as const)('requires the exact %s grant and removes the action after revocation', async (action, label, header) => {
    fixture.header = header;
    fixture.permissions = [{ name: `Academics.Examination.ResultCreation.${action}`, isGranted: true }];
    const { rerender } = render(<ResultCreation />);
    await chooseExam();
    expect(screen.getByRole('button', { name: label })).toBeEnabled();
    fixture.mutation.mockClear();
    fireEvent.click(screen.getByRole('button', { name: label }));
    await waitFor(() => expect(fixture.mutation).toHaveBeenCalled());
    fixture.permissions = [{ name: `Academics.Examination.ResultCreation.${action}`, isGranted: false }];
    rerender(<ResultCreation />);
    expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
  });
});
