import type {
  StudentOnboardingCase,
  StudentIdentifierSeries,
} from 'src/redux/student/onboarding/student-onboarding-types';

import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { mapOnboardingCaseToItem } from './student-onboarding-model';
import { useStudentSetupAssignment } from './use-student-setup-assignment';

import type { StudentSetupAssignmentServices } from './student-setup-assignment-model';

const mocks = vi.hoisted(() => ({
  getCase: vi.fn(),
  getSeries: vi.fn(),
  assignGr: vi.fn(),
  previewRoll: vi.fn(),
  assignRoll: vi.fn(),
  setPlacement: vi.fn(),
}));

vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useLazyGetStudentOnboardingCaseQuery: () => [mocks.getCase],
  useLazyGetAvailableStudentIdentifierSeriesQuery: () => [mocks.getSeries],
  useAssignStudentOnboardingGrMutation: () => [mocks.assignGr],
  usePreviewStudentOnboardingRollMutation: () => [mocks.previewRoll],
  useAssignStudentOnboardingRollMutation: () => [mocks.assignRoll],
  useSetStudentOnboardingPlacementMutation: () => [mocks.setPlacement],
}));

type AssignGrInput = Parameters<StudentSetupAssignmentServices['assignGr']>[0];
type PreviewRollInput = Parameters<StudentSetupAssignmentServices['previewRoll']>[0];
type AssignRollInput = Parameters<StudentSetupAssignmentServices['assignRoll']>[0];
type PlacementInput = Parameters<StudentSetupAssignmentServices['setPlacement']>[0];
type Controller = ReturnType<typeof useStudentSetupAssignment>;
type Options = Parameters<typeof useStudentSetupAssignment>[0];

const makeCase = (overrides: Partial<StudentOnboardingCase> = {}): StudentOnboardingCase => ({
  id: 'case-1',
  documentUploadsEnabled: true,
  concurrencyStamp: 'fresh-stamp',
  applicationId: 'application-1',
  applicationNumber: 'APP-1',
  applicantId: 'applicant-1',
  studentId: 'student-1',
  studentName: 'Aanya Shah',
  offeringId: 'offering-1',
  offeringCode: 'OFFER-1',
  academicYearId: 'year-1',
  academicYearName: '2026-27',
  intendedBoardId: 'board-1',
  intendedMediumId: 'medium-1',
  intendedStageId: 'stage-1',
  intendedStandardId: 'class-1',
  intendedStandardName: 'Class 1',
  status: 1,
  dueAt: '2026-10-15T00:00:00Z',
  isHistoricalBackfill: false,
  divisionId: 'division-a',
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

const series: StudentIdentifierSeries = {
  id: 'series-1',
  concurrencyStamp: 'series-stamp',
  academicYearId: 'year-1',
  identifierType: 0,
  code: 'GR',
  name: 'GR rule',
  prefix: 'GR-',
  suffix: '',
  padding: 4,
  nextSequence: 1,
  effectiveFrom: '2026-01-01T00:00:00Z',
  isActive: true,
  nextPreview: 'GR-0001',
};

let cases: Map<string, StudentOnboardingCase>;

const saveGr = (input: AssignGrInput) => {
  const saved = {
    ...cases.get(input.id)!,
    grNumber: input.manualValue ?? 'GR-0001',
    concurrencyStamp: `saved-${input.id}`,
  };
  cases.set(input.id, saved);
  return saved;
};

const mount = (currentCases = [makeCase()], overrides: Partial<Options> = {}) => {
  currentCases.forEach((current) => cases.set(current.id, current));
  const rows = currentCases.map((current) => ({
    ...mapOnboardingCaseToItem(current),
    concurrencyStamp: 'loaded-stamp',
  }));
  const options: Options = {
    rows,
    type: 'gr-number',
    canManage: true,
    grAssignmentMode: 'both',
    ...overrides,
  };
  return {
    ...renderHook((props: Options) => useStudentSetupAssignment(props), { initialProps: options }),
    rows,
    options,
  };
};

const edit = async (
  result: { current: Controller },
  values: Record<string, string>,
  reason = ''
) => {
  await act(async () => {
    await result.current.form.setValues({
      values: { ...result.current.form.values.values, ...values },
      reason,
    });
  });
};

const submit = async (result: { current: Controller }) => {
  await act(async () => {
    await result.current.form.submitForm();
  });
};

beforeEach(() => {
  vi.resetAllMocks();
  cases = new Map();
  mocks.getCase.mockImplementation((id: string) => ({ unwrap: async () => cases.get(id)! }));
  mocks.getSeries.mockImplementation(() => ({ unwrap: async () => [series] }));
  mocks.assignGr.mockImplementation((input: AssignGrInput) => ({
    unwrap: async () => saveGr(input),
  }));
  mocks.previewRoll.mockImplementation((input: PreviewRollInput) => ({
    unwrap: async () => ({
      schoolAssignmentMode: cases.get(input.id)!.rollAssignmentMode ?? 'both',
      rollAssignmentMode: input.rollAssignmentMode ?? 'automatic',
      proposedRollNumber: input.rollNumber ?? 8,
      concurrencyStamp: cases.get(input.id)!.concurrencyStamp,
    }),
  }));
  mocks.assignRoll.mockImplementation((input: AssignRollInput) => ({
    unwrap: async () => {
      const saved = { ...cases.get(input.id)!, rollNumber: input.rollNumber };
      cases.set(input.id, saved);
      return saved;
    },
  }));
  mocks.setPlacement.mockImplementation((input: PlacementInput) => ({
    unwrap: async () => {
      const saved = {
        ...cases.get(input.id)!,
        divisionId: input.divisionId,
        divisionName: 'B',
        rollNumber: null,
      };
      cases.set(input.id, saved);
      return saved;
    },
  }));
});

describe('Student Setup assignment controller', () => {
  it('keeps row-array identity stable across unrelated renders for selection effects', () => {
    const { result, options, rerender } = mount();
    const initialRows = result.current.displayedRows;
    rerender(options);
    expect(result.current.displayedRows).toBe(initialRows);
    act(() => result.current.retainAutomaticPage());
    const retainedRows = result.current.displayedRows;
    rerender(options);
    expect(result.current.displayedRows).toBe(retainedRows);
  });
  it('keeps the Auto GR page and saved numbers during and after pending-list backfill', async () => {
    const first = makeCase();
    const second = makeCase({ id: 'case-2', studentId: 'student-2', studentName: 'Kabir Shah' });
    const { result, rows, options, rerender } = mount([first, second], {
      contextKey: 'pending-page-1',
      totalCount: 42,
    });
    let finishSecond!: (value: StudentOnboardingCase) => void;
    mocks.assignGr.mockImplementation((input: AssignGrInput) => ({
      unwrap: () =>
        input.id === first.id
          ? Promise.resolve(saveGr(input))
          : new Promise<StudentOnboardingCase>((resolve) => {
              finishSecond = resolve;
            }),
    }));
    let running!: ReturnType<Controller['runAutomatic']>;
    act(() => {
      running = result.current.runAutomatic(rows);
    });
    await waitFor(() => expect(mocks.assignGr).toHaveBeenCalledTimes(2));
    const backfill = mapOnboardingCaseToItem(makeCase({ id: 'new-page-member' }));
    rerender({ ...options, rows: [rows[1], backfill], totalCount: 41 });
    expect(result.current.displayedRows.map((row) => row.id)).toEqual(['case-1', 'case-2']);
    expect(result.current.displayedRows[0].grNo).toBe('GR-0001');
    expect(result.current.busy).toBe(true);
    await act(async () => {
      finishSecond({ ...second, grNumber: 'GR-0002' });
      await running;
    });
    rerender({ ...options, rows: [backfill], totalCount: 40 });
    expect(result.current.displayedRows.map((row) => row.grNo)).toEqual(['GR-0001', 'GR-0002']);
    expect(result.current.displayedTotalCount).toBe(42);
    expect(result.current.eligible('automatic')).toEqual([]);
    expect(result.current.manualEditing).toBe(false);
    act(() => result.current.startManual(result.current.displayedRows));
    expect(result.current.displayedTotalCount).toBe(42);
    act(() => result.current.cancel());
    expect(result.current.displayedRows.map((row) => row.grNo)).toEqual(['GR-0001', 'GR-0002']);
    rerender({ ...options, rows: [backfill], totalCount: 40, contextKey: 'pending-page-2' });
    expect(result.current.displayedRows).toEqual([backfill]);
    expect(result.current.displayedTotalCount).toBe(40);
  });

  it('retains Auto Roll rows and applies only confirmed returned numbers until context changes', () => {
    const { result, rows, options, rerender } = mount(
      [makeCase(), makeCase({ id: 'case-2', studentId: 'student-2', rollNumber: 7 })],
      { type: 'roll-number', contextKey: 'class-a', totalCount: 2 }
    );
    act(() => result.current.retainAutomaticPage());
    rerender({ ...options, rows: [], totalCount: 0 });
    expect(result.current.displayedRows).toEqual(rows);
    act(() =>
      result.current.applyRollBatchRows([{ studentId: 'student-1', proposedRollNumber: 8 }])
    );
    expect(result.current.displayedRows.map((row) => row.rollNo)).toEqual([8, 7]);
    expect(result.current.displayedTotalCount).toBe(2);
    act(() => result.current.cancel());
    expect(result.current.displayedRows.map((row) => row.rollNo)).toEqual([8, 7]);
    rerender({ ...options, rows: [], totalCount: 0, contextKey: 'class-b' });
    expect(result.current.displayedRows).toEqual([]);
    expect(result.current.displayedTotalCount).toBe(0);
  });

  it('keeps failed Auto students visible with their error and missing number', async () => {
    const { result, rows, options, rerender } = mount();
    mocks.assignGr.mockReturnValue({
      unwrap: async () => Promise.reject(new Error('Network error')),
    });
    await act(async () => {
      await result.current.runAutomatic(rows);
    });
    rerender({ ...options, rows: [], totalCount: 0 });
    expect(result.current.displayedRows[0].id).toBe(rows[0].id);
    expect(result.current.displayedRows[0].grNo).toBeNull();
    expect(result.current.messages[rows[0].id].status).toBe('failed');
  });

  it('replaces a prior failed Manual response when Roll Auto is confirmed', async () => {
    const { result, rows } = mount([makeCase()], { type: 'roll-number', contextKey: 'class-a' });
    act(() => result.current.startManual(rows));
    await edit(result, { 'case-1': '8' });
    mocks.assignRoll.mockReturnValue({ unwrap: async () => Promise.reject(new Error('Offline')) });
    await submit(result);
    act(() => result.current.cancel());
    act(() => result.current.retainAutomaticPage());
    act(() =>
      result.current.applyRollBatchRows([{ studentId: 'student-1', proposedRollNumber: 8 }])
    );
    expect(result.current.displayedRows[0].rollNo).toBe(8);
  });

  it('freezes the Manual page, total count and draft across a list refetch until Cancel', async () => {
    const { result, rows, options, rerender } = mount(
      [makeCase(), makeCase({ id: 'case-2', studentName: 'Kabir Shah' })],
      { totalCount: 42, contextKey: 'year-1-page-2' }
    );
    act(() => result.current.startManual(rows));
    await edit(result, { 'case-1': 'GR-0007' }, 'Operator draft');
    const latestRows = [
      mapOnboardingCaseToItem(makeCase({ id: 'case-3', studentName: 'New student' })),
      mapOnboardingCaseToItem(
        makeCase({ id: 'case-2', studentName: 'Kabir updated', grNumber: 'GR-0022' })
      ),
    ];
    rerender({ ...options, rows: latestRows, totalCount: 99 });
    expect(result.current.displayedRows.map((row) => row.id)).toEqual(['case-1', 'case-2']);
    expect(result.current.displayedRows[1].studentName).toBe('Kabir Shah');
    expect(result.current.displayedTotalCount).toBe(42);
    expect(result.current.form.values).toEqual({
      values: { 'case-1': 'GR-0007', 'case-2': '' },
      reason: 'Operator draft',
    });
    expect(result.current.changedCount).toBe(1);
    expect(result.current.form.dirty).toBe(true);
    expect(result.current.contextChanged).toBe(false);
    act(() => result.current.cancel());
    expect(result.current.manualEditing).toBe(false);
    expect(result.current.displayedRows).toEqual(latestRows);
    expect(result.current.displayedTotalCount).toBe(99);
    expect(result.current.form.dirty).toBe(false);
    expect(result.current.editableIds).toEqual([]);
    expect(mocks.getCase).not.toHaveBeenCalled();
    expect(mocks.assignGr).not.toHaveBeenCalled();
  });

  it('includes Formik submitting in busy before an assignment request begins', () => {
    const { result } = mount();
    expect(result.current.busy).toBe(false);
    act(() => result.current.form.setSubmitting(true));
    expect(result.current.form.isSubmitting).toBe(true);
    expect(result.current.busy).toBe(true);
    expect(mocks.getCase).not.toHaveBeenCalled();
    act(() => result.current.form.setSubmitting(false));
    expect(result.current.busy).toBe(false);
  });

  it('ignores unchanged blank baselines when another selected student receives a number', async () => {
    const { result, rows } = mount([makeCase(), makeCase({ id: 'case-2' })]);
    act(() => result.current.startManual(rows));
    await edit(result, { 'case-1': 'GR-0007' });
    await submit(result);
    expect(mocks.assignGr.mock.calls.map(([input]) => input.id)).toEqual(['case-1']);
    expect(mocks.getCase).toHaveBeenCalledTimes(1);
    expect(result.current.form.errors).toEqual({});
    expect(result.current.form.values.values['case-2']).toBe('');
    expect(result.current.changedCount).toBe(0);
  });

  it.each(['gr-number', 'roll-number', 'division'] as const)(
    'rejects clearing an existing %s before requesting any write',
    async (type) => {
      const { result, rows } = mount([makeCase({ grNumber: 'GR-0001', rollNumber: 3 })], { type });
      act(() => result.current.startManual(rows));
      await edit(result, { 'case-1': '' }, 'Correct captured data');
      await submit(result);
      expect(result.current.manualErrors['case-1']).toBe(
        type === 'division' ? 'Choose a division.' : 'Enter a number.'
      );
      expect(result.current.form.values.values['case-1']).toBe('');
      expect(mocks.getCase).not.toHaveBeenCalled();
      expect(mocks.assignGr).not.toHaveBeenCalled();
      expect(mocks.assignRoll).not.toHaveBeenCalled();
      expect(mocks.setPlacement).not.toHaveBeenCalled();
    }
  );

  it.each(['0', '1.5', '1e2', '2147483648'])(
    'validates Roll entry %s without making a bad write or preview',
    async (value) => {
      const { result, rows } = mount([makeCase()], { type: 'roll-number' });
      act(() => result.current.startManual(rows));
      await edit(result, { 'case-1': value });
      await submit(result);
      expect(result.current.manualErrors['case-1']).toBe('Enter a positive whole Roll number.');
      expect(result.current.form.values.values['case-1']).toBe(value);
      expect(mocks.getCase).not.toHaveBeenCalled();
      expect(mocks.previewRoll).not.toHaveBeenCalled();
      expect(mocks.assignRoll).not.toHaveBeenCalled();
    }
  );

  it('saves the first manual GR without a reason using fresh case and series reads', async () => {
    const { result, rows } = mount();
    act(() => result.current.startManual(rows));
    await edit(result, { 'case-1': 'GR-0007' });
    expect(result.current.needsReason).toBe(false);
    await submit(result);
    expect(mocks.getCase).toHaveBeenCalledWith('case-1', false);
    expect(mocks.getSeries).toHaveBeenCalledWith('case-1', false);
    expect(mocks.assignGr).toHaveBeenCalledWith({
      id: 'case-1',
      concurrencyStamp: 'fresh-stamp',
      numberSeriesId: 'series-1',
      manualValue: 'GR-0007',
    });
    expect(result.current.results[0].status).toBe('saved');
    expect(result.current.displayedRows[0].grNo).toBe('GR-0007');
    expect(result.current.changedCount).toBe(0);
    expect(result.current.form.dirty).toBe(false);
  });

  it('requires and preserves a correction reason before sending an existing GR change', async () => {
    const { result, rows } = mount([makeCase({ grNumber: 'GR-0001' })]);
    act(() => result.current.startManual(rows));
    await edit(result, { 'case-1': 'GR-0007' });
    expect(result.current.needsReason).toBe(true);
    await submit(result);
    expect(result.current.form.errors.reason).toBe(
      'Enter a reason for changing an existing number.'
    );
    expect(mocks.getCase).not.toHaveBeenCalled();
    expect(mocks.assignGr).not.toHaveBeenCalled();
    await edit(result, {}, '  Correct the reserved GR  ');
    await submit(result);
    expect(mocks.assignGr).toHaveBeenCalledWith({
      id: 'case-1',
      concurrencyStamp: 'fresh-stamp',
      numberSeriesId: 'series-1',
      manualValue: 'GR-0007',
      reason: 'Correct the reserved GR',
    });
    expect(result.current.form.values.reason).toBe('');
    expect(result.current.changedCount).toBe(0);
  });

  it('captures the fresh Auto response when Manual starts before the list refetch arrives', async () => {
    const { result, rows } = mount();
    await act(async () => {
      await result.current.runAutomatic(rows);
    });
    expect(result.current.displayedRows[0].grNo).toBe('GR-0001');
    expect(result.current.eligible('automatic')).toEqual([]);
    act(() => result.current.startManual(result.current.displayedRows));
    expect(result.current.form.values.values['case-1']).toBe('GR-0001');
    await edit(result, { 'case-1': 'GR-0009' }, 'Correct the prepared number');
    expect(result.current.needsReason).toBe(true);
    await submit(result);
    expect(mocks.assignGr).toHaveBeenNthCalledWith(2, {
      id: 'case-1',
      concurrencyStamp: 'saved-case-1',
      numberSeriesId: 'series-1',
      manualValue: 'GR-0009',
      reason: 'Correct the prepared number',
    });
    expect(result.current.results[0].status).toBe('saved');
  });

  it('preserves failed edits and the reason after a partial save, and retries only dirty failed students', async () => {
    const { result, rows } = mount([
      makeCase({ grNumber: 'GR-OLD1' }),
      makeCase({ id: 'case-2', grNumber: 'GR-OLD2' }),
    ]);
    const failures = new Set(['case-2']);
    mocks.assignGr.mockImplementation((input: AssignGrInput) => ({
      unwrap: async () => {
        if (failures.has(input.id))
          throw Object.assign(new Error('Request rejected.'), {
            data: { error: { data: { Reason: 'This GR number is already reserved.' } } },
          });
        return saveGr(input);
      },
    }));
    act(() => result.current.startManual(rows));
    await edit(result, { 'case-1': 'GR-NEW1', 'case-2': 'GR-NEW2' }, 'Correct captured numbers');
    await submit(result);
    expect(result.current.results.map((item) => item.status)).toEqual(['saved', 'failed']);
    expect(result.current.messages['case-2']).toMatchObject({
      status: 'failed',
      message: 'This GR number is already reserved.',
    });
    expect(result.current.form.values).toEqual({
      values: { 'case-1': 'GR-NEW1', 'case-2': 'GR-NEW2' },
      reason: 'Correct captured numbers',
    });
    expect(result.current.changedCount).toBe(1);
    expect(result.current.form.dirty).toBe(true);
    failures.clear();
    await submit(result);
    expect(mocks.assignGr.mock.calls.map(([input]) => input.id)).toEqual([
      'case-1',
      'case-2',
      'case-2',
    ]);
    expect(mocks.getCase.mock.calls).toEqual([
      ['case-1', false],
      ['case-2', false],
      ['case-2', false],
    ]);
    expect(result.current.changedCount).toBe(0);
    expect(result.current.form.dirty).toBe(false);
    expect(result.current.results.map((item) => item.status)).toEqual(['saved']);
  });

  it('uses the latest uncached case and retains a manual edit when its baseline has changed', async () => {
    const { result, rows } = mount();
    act(() => result.current.startManual(rows));
    await edit(result, { 'case-1': 'GR-WANTED' });
    cases.set('case-1', makeCase({ grNumber: 'GR-FRESH', concurrencyStamp: 'latest-stamp' }));
    await submit(result);
    expect(mocks.getCase).toHaveBeenCalledWith('case-1', false);
    expect(mocks.assignGr).not.toHaveBeenCalled();
    expect(mocks.getSeries).not.toHaveBeenCalled();
    expect(result.current.results[0].status).toBe('failed');
    expect(result.current.messages['case-1'].message).toContain('changed since');
    expect(result.current.displayedRows[0].grNo).toBe('GR-FRESH');
    expect(result.current.form.values.values['case-1']).toBe('GR-WANTED');
    expect(result.current.form.dirty).toBe(true);
  });

  it.each([
    { contextKey: 'year-2', type: 'gr-number' as const },
    { contextKey: 'year-1', type: 'roll-number' as const },
  ])('blocks a prior draft after context changes to $contextKey $type', async (next) => {
    const { result, rows, options, rerender } = mount([makeCase()], { contextKey: 'year-1' });
    act(() => result.current.startManual(rows));
    await edit(result, { 'case-1': '8' });
    rerender({ ...options, ...next });
    expect(result.current.contextChanged).toBe(true);
    expect(result.current.manualEditing).toBe(true);
    await submit(result);
    expect(result.current.form.values.values['case-1']).toBe('8');
    expect(result.current.form.dirty).toBe(true);
    expect(mocks.getCase).not.toHaveBeenCalled();
    expect(mocks.assignGr).not.toHaveBeenCalled();
    expect(mocks.previewRoll).not.toHaveBeenCalled();
    expect(mocks.assignRoll).not.toHaveBeenCalled();
    expect(mocks.setPlacement).not.toHaveBeenCalled();
    rerender(options);
    expect(result.current.contextChanged).toBe(false);
    expect(result.current.form.values.values['case-1']).toBe('8');
  });

  it('shows backend-cleared Roll immediately after a manual Division save', async () => {
    const { result, rows } = mount([makeCase({ rollNumber: 7 })], { type: 'division' });
    act(() => result.current.startManual(rows));
    await edit(result, { 'case-1': 'division-b' });
    await submit(result);
    expect(mocks.setPlacement).toHaveBeenCalledWith({
      id: 'case-1',
      concurrencyStamp: 'fresh-stamp',
      divisionId: 'division-b',
    });
    expect(result.current.displayedRows[0]).toMatchObject({
      divisionId: 'division-b',
      divisionName: 'B',
      rollNo: null,
    });
    expect(result.current.results[0].updatedStudent?.rollNo).toBeNull();
    expect(mocks.assignRoll).not.toHaveBeenCalled();
    expect(result.current.form.dirty).toBe(false);
  });

  it('blocks duplicate Automatic runs, cancel and switching to Manual while the batch is running', async () => {
    const current = makeCase({ divisionId: null });
    const { result, rows } = mount([current], { type: 'division' });
    let finishRead!: (value: StudentOnboardingCase) => void;
    const pendingRead = new Promise<StudentOnboardingCase>((resolve) => {
      finishRead = resolve;
    });
    mocks.getCase.mockReturnValue({ unwrap: () => pendingRead });
    let first!: ReturnType<Controller['runAutomatic']>;
    await act(async () => {
      first = result.current.runAutomatic(rows, 'division-b');
    });
    await waitFor(() => expect(mocks.getCase).toHaveBeenCalledTimes(1));
    expect(result.current.busy).toBe(true);
    await act(async () => {
      expect(await result.current.runAutomatic(rows, 'division-b')).toEqual([]);
      result.current.cancel();
      result.current.startManual(rows);
    });
    expect(result.current.manualEditing).toBe(false);
    await act(async () => {
      finishRead(current);
      await first;
    });
    expect(mocks.setPlacement).toHaveBeenCalledTimes(1);
    expect(result.current.busy).toBe(false);
    expect(result.current.results[0].status).toBe('saved');
  });

  it('prevents two Manual submissions from writing the same student twice', async () => {
    const { result, rows } = mount();
    act(() => result.current.startManual(rows));
    await edit(result, { 'case-1': 'GR-0007' });
    let finishWrite!: (value: StudentOnboardingCase) => void;
    const pendingWrite = new Promise<StudentOnboardingCase>((resolve) => {
      finishWrite = resolve;
    });
    mocks.assignGr.mockReturnValue({ unwrap: () => pendingWrite });
    let submissions!: Promise<unknown>[];
    await act(async () => {
      submissions = [result.current.form.submitForm(), result.current.form.submitForm()];
    });
    await waitFor(() => expect(mocks.assignGr).toHaveBeenCalledTimes(1));
    expect(result.current.busy).toBe(true);
    expect(mocks.getCase).toHaveBeenCalledTimes(1);
    await act(async () => {
      finishWrite(makeCase({ grNumber: 'GR-0007' }));
      await Promise.all(submissions);
    });
    expect(mocks.assignGr).toHaveBeenCalledTimes(1);
    expect(result.current.changedCount).toBe(0);
    expect(result.current.busy).toBe(false);
  });

  it('blocks assignment requests when management permission is unavailable', async () => {
    const { result, rows } = mount([makeCase()], { canManage: false });
    act(() => result.current.startManual(rows));
    expect(result.current.manualEditing).toBe(false);
    await act(async () => {
      expect(await result.current.runAutomatic(rows)).toEqual([]);
    });
    expect(mocks.getCase).not.toHaveBeenCalled();
    expect(mocks.assignGr).not.toHaveBeenCalled();
    expect(result.current.eligible('manual')).toEqual([]);
  });
});
