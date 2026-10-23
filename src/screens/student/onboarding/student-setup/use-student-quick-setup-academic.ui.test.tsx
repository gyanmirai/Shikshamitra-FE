import type { StudentOnboardingCase } from 'src/redux/student/onboarding/student-onboarding-types';

import '@testing-library/jest-dom/vitest';
import { vi, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import {
  act,
  render,
  screen,
  within,
  waitFor,
  fireEvent,
  renderHook,
} from '@testing-library/react';

import StudentQuickSetupAcademic from './student-quick-setup-academic';
import { useStudentQuickSetupAcademic } from './use-student-quick-setup-academic';

const mocks = vi.hoisted(() => ({
  caseQuery: {
    currentData: undefined as StudentOnboardingCase | undefined,
    isLoading: false,
    isError: false,
    error: undefined as { status: number } | undefined,
    refetch: vi.fn(),
  },
  settingsQuery: {
    currentData: [
      {
        id: 'settings',
        concurrencyStamp: 's1',
        academicYearId: 'year',
        schemaVersion: 1,
        configurationJson: JSON.stringify({ grNumber: { assignmentMode: 'both' } }),
      },
    ],
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  },
  placementQuery: {
    data: [
      {
        id: 'A',
        name: 'A',
        capacity: 40,
        activeEnrollments: 20,
        liveReservations: 1,
        availableSeats: 19,
        isFull: false,
      },
    ],
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  },
  seriesQuery: {
    data: [
      {
        id: 'series',
        concurrencyStamp: 's1',
        academicYearId: 'year',
        identifierType: 0,
        code: 'GR',
        name: 'GR',
        prefix: '',
        suffix: '',
        padding: 3,
        nextSequence: 1,
        effectiveFrom: '2026-01-01T00:00:00Z',
        isActive: true,
        nextPreview: '001',
      },
    ],
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  },
  getCase: vi.fn(),
  getSeries: vi.fn(),
  place: vi.fn(),
  gr: vi.fn(),
  roll: vi.fn(),
  preview: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentOnboardingCaseQuery: () => mocks.caseQuery,
  useGetStudentOnboardingSettingsQuery: () => mocks.settingsQuery,
  useGetStudentOnboardingPlacementOptionsQuery: () => mocks.placementQuery,
  useGetAvailableStudentIdentifierSeriesQuery: () => mocks.seriesQuery,
  useLazyGetStudentOnboardingCaseQuery: () => [mocks.getCase],
  useLazyGetAvailableStudentIdentifierSeriesQuery: () => [mocks.getSeries],
  useSetStudentOnboardingPlacementMutation: () => [mocks.place],
  useAssignStudentOnboardingGrMutation: () => [mocks.gr],
  useAssignStudentOnboardingRollMutation: () => [mocks.roll],
  usePreviewStudentOnboardingRollMutation: () => [mocks.preview],
}));
const makeCase = (overrides: Partial<StudentOnboardingCase> = {}): StudentOnboardingCase => ({
  id: 'case',
  concurrencyStamp: 'v1',
  documentUploadsEnabled: true,
  applicationId: 'application',
  applicationNumber: 'APP-1',
  applicantId: 'applicant',
  studentId: 'student',
  studentName: 'Aarav',
  offeringId: 'offering',
  offeringCode: 'O-1',
  academicYearId: 'year',
  academicYearName: '2026-27',
  intendedBoardId: 'board',
  intendedMediumId: 'medium',
  intendedStageId: 'stage',
  intendedStandardId: 'class',
  intendedStandardName: 'Class 1',
  status: 1,
  dueAt: '2026-12-31T00:00:00Z',
  isHistoricalBackfill: false,
  divisionId: 'A',
  divisionName: 'A',
  grNumber: null,
  grManualEntryAllowed: true,
  rollNumber: null,
  rollAssignmentMode: 'both',
  progressPercent: 0,
  isOverdue: false,
  steps: [],
  events: [],
  ...overrides,
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.caseQuery.currentData = makeCase();
  mocks.caseQuery.isError = false;
  mocks.caseQuery.isLoading = false;
  mocks.caseQuery.error = undefined;
  mocks.settingsQuery.currentData[0].configurationJson = JSON.stringify({
    grNumber: { assignmentMode: 'both' },
  });
  mocks.getCase.mockImplementation(() => ({ unwrap: async () => mocks.caseQuery.currentData }));
  mocks.getSeries.mockImplementation(() => ({ unwrap: async () => mocks.seriesQuery.data }));
  mocks.gr.mockImplementation(() => ({
    unwrap: async () => ({
      ...mocks.caseQuery.currentData!,
      grNumber: '001',
      concurrencyStamp: 'v2',
    }),
  }));
});

function Harness({
  canManage = true,
  disabled = false,
}: {
  canManage?: boolean;
  disabled?: boolean;
}) {
  const editor = useStudentQuickSetupAcademic({ caseId: 'case', canManage, disabled });
  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentQuickSetupAcademic editor={editor} />
    </ThemeProvider>
  );
}

it('renders one compact academic card and changes modes without assigning anything on open', async () => {
  render(<Harness />);
  expect(await screen.findByRole('heading', { name: 'Class & Numbers' })).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
  expect(screen.getByRole('textbox', { name: 'Roll number' })).toHaveValue('0');
  const roll = screen.getByRole('group', { name: 'Roll number assignment method' });
  fireEvent.click(within(roll).getByRole('button', { name: 'Manual' }));
  expect(await screen.findByRole('textbox', { name: 'Roll number' })).toHaveValue('');
  expect(screen.getByRole('textbox', { name: 'Roll number' })).toHaveAttribute('placeholder', '0');
  expect(mocks.gr).not.toHaveBeenCalled();
  expect(mocks.roll).not.toHaveBeenCalled();
  expect(mocks.preview).not.toHaveBeenCalled();
  expect(mocks.place).not.toHaveBeenCalled();
});

it('shows an assigned Roll number without changing it on open', async () => {
  mocks.caseQuery.currentData = makeCase({ rollNumber: 1 });
  render(<Harness />);
  expect(await screen.findByRole('textbox', { name: 'Roll number' })).toHaveValue('1');
  expect(mocks.roll).not.toHaveBeenCalled();
});

it('retains entered fields and dirty state when background data refreshes', async () => {
  const { result, rerender } = renderHook(() =>
    useStudentQuickSetupAcademic({ caseId: 'case', canManage: true })
  );
  await act(async () => {
    await result.current.form.setFieldValue('grMode', 'manual');
    await result.current.form.setFieldValue('grValue', '123');
  });
  mocks.caseQuery.currentData = makeCase({ concurrencyStamp: 'v2', divisionName: 'Updated label' });
  rerender();
  expect(result.current.form.values.grValue).toBe('123');
  expect(result.current.dirty).toBe(true);
});

it('updates the visible state after activation while keeping the panel mounted', async () => {
  const { result, rerender } = renderHook(() =>
    useStudentQuickSetupAcademic({ caseId: 'case', canManage: true })
  );
  mocks.caseQuery.currentData = makeCase({
    studentEnrollmentId: 'enrollment',
    status: 4,
    grNumber: '001',
    rollNumber: 1,
  });
  rerender();
  await waitFor(() => expect(result.current.closed).toBe(true));
  expect(result.current.caseData?.studentEnrollmentId).toBe('enrollment');
  expect(mocks.gr).not.toHaveBeenCalled();
});

it('marks the old Roll as needing reassignment when division changes and keeps school mode', async () => {
  mocks.caseQuery.currentData = makeCase({ grNumber: '001', rollNumber: 5 });
  const { result } = renderHook(() =>
    useStudentQuickSetupAcademic({ caseId: 'case', canManage: true })
  );
  await act(async () => {
    result.current.changeDivision('B');
  });
  expect(result.current.form.values).toMatchObject({ divisionId: 'B', rollMode: 'automatic' });
  expect(mocks.place).not.toHaveBeenCalled();
  expect(mocks.preview).not.toHaveBeenCalled();
});

it('adopts a recovered school mode only when no user draft would be overwritten', async () => {
  mocks.settingsQuery.currentData[0].configurationJson = '{bad';
  const { result, rerender } = renderHook(() =>
    useStudentQuickSetupAcademic({ caseId: 'case', canManage: true })
  );
  expect(result.current.form.values.grMode).toBe('');
  mocks.settingsQuery.currentData[0].configurationJson = JSON.stringify({
    grNumber: { assignmentMode: 'both' },
  });
  rerender();
  await waitFor(() => expect(result.current.form.values.grMode).toBe('automatic'));
  expect(result.current.dirty).toBe(false);
});

it('shows a recoverable initial error instead of an endless skeleton', () => {
  mocks.caseQuery.currentData = undefined;
  mocks.caseQuery.isError = true;
  render(<Harness />);
  expect(screen.getByText('Student setup could not be loaded.', { exact: false })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mocks.caseQuery.refetch).toHaveBeenCalledOnce();
  expect(document.querySelector('.MuiSkeleton-root')).not.toBeInTheDocument();
});

it('preserves manual-only school policy and disables all edit controls during an external lock', async () => {
  mocks.caseQuery.currentData = makeCase({ rollAssignmentMode: 'manual' });
  mocks.settingsQuery.currentData[0].configurationJson = JSON.stringify({
    grNumber: { assignmentMode: 'manual' },
  });
  render(<Harness disabled />);
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'GR number' })).toBeDisabled());
  screen
    .getAllByRole('button', { name: /Auto|Manual/ })
    .forEach((button) => expect(button).toBeDisabled());
});

it('rejects invalid manual Roll before any server reads or writes', async () => {
  const { result } = renderHook(() =>
    useStudentQuickSetupAcademic({ caseId: 'case', canManage: true })
  );
  await act(async () => {
    await result.current.form.setFieldValue('rollMode', 'manual');
    await result.current.form.setFieldValue('rollValue', '0');
  });
  await act(async () => {
    await expect(result.current.save()).rejects.toThrow('highlighted');
  });
  expect(result.current.form.errors.rollValue).toBe('Enter a positive whole Roll number.');
  expect(mocks.getCase).not.toHaveBeenCalled();
});

it('blocks mutation for view-only staff', async () => {
  const { result } = renderHook(() =>
    useStudentQuickSetupAcademic({ caseId: 'case', canManage: false })
  );
  await expect(result.current.save()).rejects.toThrow('permission');
  expect(mocks.getCase).not.toHaveBeenCalled();
});

it('blocks save after a failed refresh even when a previously loaded case is cached', async () => {
  const { result, rerender } = renderHook(() =>
    useStudentQuickSetupAcademic({ caseId: 'case', canManage: true })
  );
  await act(async () => {
    await result.current.form.setFieldValue('grMode', 'manual');
    await result.current.form.setFieldValue('grValue', '123');
  });
  mocks.caseQuery.isError = true;
  mocks.caseQuery.error = { status: 503 };
  rerender();
  expect(result.current.readError).toBe(true);
  expect(result.current.permissionDenied).toBe(false);
  expect(result.current.disabled).toBe(true);
  expect(result.current.form.values.grValue).toBe('123');
  await expect(result.current.save()).rejects.toThrow('Retry before saving');
  expect(mocks.getCase).not.toHaveBeenCalled();
  expect(mocks.gr).not.toHaveBeenCalled();
});

it.each([401, 403])(
  'signals permission failure for parent-owned cached sections on status %s',
  async (status) => {
    mocks.caseQuery.isError = true;
    mocks.caseQuery.error = { status };
    const { result } = renderHook(() =>
      useStudentQuickSetupAcademic({ caseId: 'case', canManage: true })
    );
    expect(result.current.permissionDenied).toBe(true);
    expect(result.current.readError).toBe(true);
    await expect(result.current.save()).rejects.toThrow('Retry before saving');
    expect(mocks.getCase).not.toHaveBeenCalled();
    expect(mocks.gr).not.toHaveBeenCalled();
  }
);

it('keeps a failed manual draft and the server error available for retry', async () => {
  mocks.gr.mockImplementation(() => ({
    unwrap: async () => {
      throw Object.assign(new Error('Assignment failed.'), {
        data: { detail: 'GR number already exists.' },
      });
    },
  }));
  const { result } = renderHook(() =>
    useStudentQuickSetupAcademic({ caseId: 'case', canManage: true })
  );
  await act(async () => {
    await result.current.form.setFieldValue('grMode', 'manual');
    await result.current.form.setFieldValue('grValue', '123');
  });
  await act(async () => {
    await expect(result.current.save()).rejects.toBeDefined();
  });
  expect(result.current.form.values.grValue).toBe('123');
  expect(result.current.error).toBe('GR number already exists.');
  expect(result.current.busy).toBe(false);
  expect(result.current.dirty).toBe(true);
});
