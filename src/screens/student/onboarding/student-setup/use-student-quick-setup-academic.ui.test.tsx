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
  toastError: vi.fn(),
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
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: mocks.toastError,
    warning: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    dismiss: vi.fn(),
  },
}));
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
  mocks.preview.mockImplementation((input) => ({
    unwrap: async () => ({
      divisionId: input.divisionId ?? 'A',
      schoolAssignmentMode: 'both',
      rollAssignmentMode: input.rollAssignmentMode,
      proposedRollNumber: 7,
      concurrencyStamp: 'v1',
    }),
  }));
});

function Harness({
  canManage = true,
  disabled = false,
  compact = false,
}: {
  canManage?: boolean;
  disabled?: boolean;
  compact?: boolean;
}) {
  const editor = useStudentQuickSetupAcademic({ caseId: 'case', canManage, disabled });
  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentQuickSetupAcademic editor={editor} compact={compact} />
    </ThemeProvider>
  );
}

it('offers compact number edit actions without assigning until the existing save', async () => {
  mocks.caseQuery.currentData = makeCase({ grNumber: '001', rollNumber: 3 });
  render(<Harness compact />);
  fireEvent.click(await screen.findByRole('button', { name: 'Change roll number' }));
  expect(await screen.findByRole('textbox', { name: 'Roll number' })).not.toHaveAttribute(
    'readonly'
  );
  expect(screen.getByRole('group', { name: 'Roll number assignment method' })).toBeInTheDocument();
  expect(mocks.roll).not.toHaveBeenCalled();
  expect(mocks.gr).not.toHaveBeenCalled();
});

it('does not offer compact edits for closed cases', async () => {
  mocks.caseQuery.currentData = makeCase({ grNumber: '001', rollNumber: 3, status: 4 });
  render(<Harness compact />);
  expect(await screen.findByRole('textbox', { name: 'Roll number' })).toHaveValue('3');
  expect(screen.queryByRole('button', { name: 'Change roll number' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Change GR number' })).not.toBeInTheDocument();
});

it('shows an Auto preview in the compact academic card without assigning anything on open', async () => {
  render(<Harness />);
  expect(await screen.findByRole('heading', { name: 'Class & Numbers' })).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1);
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: 'Roll number' })).toHaveValue('7')
  );
  const roll = screen.getByRole('group', { name: 'Roll number assignment method' });
  fireEvent.click(within(roll).getByRole('button', { name: 'Manual' }));
  expect(await screen.findByRole('textbox', { name: 'Roll number' })).toHaveValue('');
  expect(screen.getByRole('textbox', { name: 'Roll number' })).toHaveAttribute('placeholder', '0');
  expect(mocks.gr).not.toHaveBeenCalled();
  expect(mocks.roll).not.toHaveBeenCalled();
  expect(mocks.preview).toHaveBeenCalledOnce();
  expect(mocks.place).not.toHaveBeenCalled();
});

it('keeps zero and plain prerequisite guidance when no division is selected', async () => {
  mocks.caseQuery.currentData = makeCase({ divisionId: null });
  render(<Harness />);
  const field = await screen.findByRole('textbox', { name: 'Roll number' });
  expect(field).toHaveValue('0');
  const guidance = screen.getByText('Select a division to preview the roll number.');
  expect(guidance.querySelector('svg, [data-icon]')).toBeNull();
  expect(mocks.preview).not.toHaveBeenCalled();
  expect(mocks.roll).not.toHaveBeenCalled();
});

it('disables both identifier methods until a division is selected', async () => {
  mocks.caseQuery.currentData = makeCase({ divisionId: null });
  render(<Harness compact />);
  const gr = await screen.findByRole('group', { name: 'GR number assignment method' });
  const roll = screen.getByRole('group', { name: 'Roll number assignment method' });
  [gr, roll].forEach((group) => {
    expect(within(group).getByRole('button', { name: 'Auto' })).toBeDisabled();
    expect(within(group).getByRole('button', { name: 'Manual' })).toBeDisabled();
  });
  expect(mocks.preview).not.toHaveBeenCalled();
  expect(mocks.gr).not.toHaveBeenCalled();
  expect(mocks.roll).not.toHaveBeenCalled();
});

it('disables assigned identifier edit actions when division is missing', async () => {
  mocks.caseQuery.currentData = makeCase({ divisionId: null, grNumber: '001', rollNumber: 3 });
  render(<Harness compact />);
  expect(await screen.findByRole('button', { name: 'Change GR number' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Change roll number' })).toBeDisabled();
});

it('previews a selected unsaved division without saving placement, GR or Roll', async () => {
  mocks.caseQuery.currentData = makeCase({ divisionId: null });
  const { result } = renderHook(() =>
    useStudentQuickSetupAcademic({ caseId: 'case', canManage: true })
  );
  await act(async () => {
    await result.current.form.setFieldValue('divisionId', 'A');
  });
  await waitFor(() => expect(result.current.rollPreview.number).toBe(7));
  expect(mocks.preview).toHaveBeenCalledWith({
    id: 'case',
    divisionId: 'A',
    rollAssignmentMode: 'automatic',
  });
  expect(result.current.form.values.rollValue).toBe('');
  expect(mocks.place).not.toHaveBeenCalled();
  expect(mocks.gr).not.toHaveBeenCalled();
  expect(mocks.roll).not.toHaveBeenCalled();
});

it('recalculates on Save instead of assigning the earlier display preview', async () => {
  mocks.caseQuery.currentData = makeCase({ grNumber: '001' });
  mocks.preview.mockImplementation((input) => ({
    unwrap: async () => ({
      divisionId: input.divisionId ?? 'A',
      schoolAssignmentMode: 'both',
      rollAssignmentMode: 'automatic',
      proposedRollNumber: input.divisionId ? 7 : 9,
      concurrencyStamp: 'v1',
    }),
  }));
  mocks.roll.mockImplementation((input) => ({
    unwrap: async () => ({
      ...mocks.caseQuery.currentData,
      rollNumber: input.rollNumber,
      concurrencyStamp: 'v2',
    }),
  }));
  const { result } = renderHook(() =>
    useStudentQuickSetupAcademic({ caseId: 'case', canManage: true })
  );
  await waitFor(() => expect(result.current.rollPreview.number).toBe(7));
  expect(mocks.roll).not.toHaveBeenCalled();
  await act(async () => {
    await result.current.save();
  });
  expect(mocks.roll).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      rollNumber: 9,
      rollAssignmentMode: 'automatic',
      concurrencyStamp: 'v1',
    })
  );
  expect(result.current.caseData?.rollNumber).toBe(9);
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

it('uses the standard request-error toast without an inline Retry row or endless skeleton', async () => {
  mocks.caseQuery.currentData = undefined;
  mocks.caseQuery.isError = true;
  render(<Harness />);
  await waitFor(() =>
    expect(mocks.toastError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Student setup could not be loaded.' })
    )
  );
  expect(screen.queryByText('Student setup could not be loaded.')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
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
  expect(result.current.form.errors.rollValue).toBe('Enter a positive whole roll number.');
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
  expect(result.current.error).toBe(
    'This GR number is already in use or reserved. Enter a different number.'
  );
  expect(result.current.errorPresentation).toBe('toast');
  expect(result.current.busy).toBe(false);
  expect(result.current.dirty).toBe(true);
});

it('leaves save-result feedback to the page when it owns the operation', async () => {
  const failure = { status: 503, data: { detail: 'Service unavailable' } };
  mocks.gr.mockReturnValue({
    unwrap: () => Promise.reject(failure),
  });
  const { result } = renderHook(() =>
    useStudentQuickSetupAcademic({
      caseId: 'case',
      canManage: true,
      reportSaveErrors: false,
    })
  );
  await act(async () => {
    await result.current.form.setFieldValue('grMode', 'manual');
    await result.current.form.setFieldValue('grValue', '123');
  });
  await act(async () => {
    await expect(result.current.save()).rejects.toBe(failure);
  });
  expect(result.current.error).toBeUndefined();
  expect(result.current.form.values.grValue).toBe('123');
  expect(result.current.dirty).toBe(true);
  expect(mocks.toastError).not.toHaveBeenCalled();
});

it('keeps a missing GR numbering-rule choice local and preserves the unsaved draft', async () => {
  mocks.getSeries.mockImplementation(() => ({
    unwrap: async () => [mocks.seriesQuery.data[0], { ...mocks.seriesQuery.data[0], id: 'other' }],
  }));
  const { result } = renderHook(() =>
    useStudentQuickSetupAcademic({ caseId: 'case', canManage: true })
  );
  await act(async () => {
    await result.current.form.setFieldValue('grMode', 'manual');
    await result.current.form.setFieldValue('grValue', '123');
  });
  await act(async () => {
    await expect(result.current.save()).rejects.toThrow('Select the GR numbering rule.');
  });
  expect(result.current.errorPresentation).toBe('inline');
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentQuickSetupAcademic editor={result.current} />
    </ThemeProvider>
  );
  const validation = screen.getByText('Select the GR numbering rule.');
  expect(
    validation.closest('[data-student-feedback]')?.querySelector('svg, [data-icon]')
  ).toBeNull();
  expect(mocks.toastError).not.toHaveBeenCalled();
  expect(result.current.form.values.grValue).toBe('123');
  expect(mocks.gr).not.toHaveBeenCalled();
});
