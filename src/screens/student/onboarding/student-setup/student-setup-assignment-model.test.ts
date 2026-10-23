import type {
  StudentOnboardingCase,
  StudentIdentifierSeries,
} from 'src/redux/student/onboarding/student-onboarding-types';

import { it, vi, expect, describe } from 'vitest';

import { mapOnboardingCaseToItem } from './student-onboarding-model';
import {
  runStudentSetupAssignment,
  getStudentSetupAssignmentValue,
  getStudentSetupRollAutoTargets,
  type StudentSetupAssignmentType,
  type StudentSetupAssignmentItem,
  studentSetupAssignmentNeedsReason,
  type StudentSetupAssignmentServices,
  getStudentSetupAssignmentEligibility,
} from './student-setup-assignment-model';

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

const makeSeries = (overrides: Partial<StudentIdentifierSeries> = {}): StudentIdentifierSeries => ({
  id: 'series-1',
  concurrencyStamp: 'series-stamp',
  academicYearId: 'year-1',
  identifierType: 0,
  code: 'GR',
  name: 'GR number',
  prefix: 'GR-',
  suffix: '',
  padding: 4,
  nextSequence: 1,
  effectiveFrom: '2026-01-01T00:00:00Z',
  isActive: true,
  nextPreview: 'GR-0001',
  ...overrides,
});

const workItem = (
  current = makeCase(),
  overrides: Partial<StudentSetupAssignmentItem> = {}
): StudentSetupAssignmentItem => ({
  student: { ...mapOnboardingCaseToItem(current), concurrencyStamp: 'loaded-stamp' },
  baselineValue: null,
  ...overrides,
});

const makeServices = (current = makeCase()) => ({
  getCase: vi.fn(async () => current),
  getSeries: vi.fn(async () => [makeSeries()]),
  assignGr: vi.fn(async () => ({ ...current, grNumber: 'GR-0001', concurrencyStamp: 'saved-gr' })),
  previewRoll: vi.fn<StudentSetupAssignmentServices['previewRoll']>(async () => ({
    schoolAssignmentMode: 'both' as const,
    rollAssignmentMode: 'automatic' as const,
    proposedRollNumber: 8,
    concurrencyStamp: 'preview-stamp',
  })),
  assignRoll: vi.fn(async () => ({ ...current, rollNumber: 8, concurrencyStamp: 'saved-roll' })),
  setPlacement: vi.fn(async () => ({ ...current, divisionId: 'division-b', rollNumber: null })),
});

describe('Student Setup assignment orchestration', () => {
  it('includes linked completed cases in page Roll Auto without bypassing server enrollment checks', () => {
    const scope = { standardId: 'class-1', divisionId: 'division-a' };
    const pending = mapOnboardingCaseToItem(makeCase());
    const active = mapOnboardingCaseToItem(
      makeCase({ id: 'active', status: 4, studentEnrollmentId: 'enrollment-1' })
    );
    const candidates = [
      pending,
      active,
      { ...pending, id: 'numbered', rollNo: 1 },
      { ...pending, id: 'other', divisionId: 'division-b' },
      mapOnboardingCaseToItem(makeCase({ id: 'cancelled', status: 5 })),
      mapOnboardingCaseToItem(makeCase({ id: 'provisioning', status: 6 })),
      mapOnboardingCaseToItem(makeCase({ id: 'unlinked-completed', status: 4 })),
    ];
    expect(getStudentSetupRollAutoTargets(candidates, scope).map((item) => item.id)).toEqual([
      pending.id,
      active.id,
    ]);
  });
  it('runs GR assignments and result callbacks sequentially using each fresh stamp and no manual fields', async () => {
    const events: string[] = [];
    const cases = [makeCase(), makeCase({ id: 'case-2', concurrencyStamp: 'fresh-2' })];
    const services: StudentSetupAssignmentServices = {
      ...makeServices(),
      getCase: vi.fn(async (id) => {
        events.push(`read:${id}`);
        return cases.find((item) => item.id === id)!;
      }),
      getSeries: vi.fn(async (id) => {
        events.push(`series:${id}`);
        return [makeSeries()];
      }),
      assignGr: vi.fn(async (request) => {
        events.push(`write:${request.id}`);
        return { ...cases.find((item) => item.id === request.id)!, grNumber: 'GR-0001' };
      }),
    };
    const results = await runStudentSetupAssignment({
      type: 'gr-number',
      mode: 'automatic',
      grAssignmentMode: 'both',
      services,
      items: cases.map((current) => workItem(current, { value: 'IGNORE', reason: 'IGNORE' })),
      onResult: (result) => events.push(`result:${result.student.id}`),
    });
    expect(events).toEqual([
      'read:case-1',
      'series:case-1',
      'write:case-1',
      'result:case-1',
      'read:case-2',
      'series:case-2',
      'write:case-2',
      'result:case-2',
    ]);
    expect(services.assignGr).toHaveBeenNthCalledWith(1, {
      id: 'case-1',
      concurrencyStamp: 'fresh-stamp',
      numberSeriesId: 'series-1',
    });
    expect(services.assignGr).toHaveBeenNthCalledWith(2, {
      id: 'case-2',
      concurrencyStamp: 'fresh-2',
      numberSeriesId: 'series-1',
    });
    expect(results.map((result) => result.status)).toEqual(['saved', 'saved']);
    expect(results[0].updatedStudent?.grNo).toBe('GR-0001');
  });

  it.each<StudentSetupAssignmentType>(['gr-number', 'roll-number', 'division'])(
    'preserves an existing fresh %s during automatic assignment',
    async (type) => {
      const current = makeCase({ grNumber: 'GR-0100', rollNumber: 12 });
      const services = makeServices(current);
      const [result] = await runStudentSetupAssignment({
        type,
        mode: 'automatic',
        services,
        grAssignmentMode: 'both',
        divisionId: 'division-b',
        items: [workItem(makeCase({ divisionId: null }))],
      });
      expect(result.status).toBe('skipped');
      expect(result.updatedStudent).toMatchObject({
        grNo: 'GR-0100',
        rollNo: 12,
        divisionId: 'division-a',
      });
      expect(services.getSeries).not.toHaveBeenCalled();
      expect(services.previewRoll).not.toHaveBeenCalled();
      expect(services.assignGr).not.toHaveBeenCalled();
      expect(services.assignRoll).not.toHaveBeenCalled();
      expect(services.setPlacement).not.toHaveBeenCalled();
    }
  );

  it('selects the sole applicable GR series and excludes admission, inactive, exhausted and other scope series', async () => {
    const services = makeServices();
    services.getSeries.mockResolvedValue([
      makeSeries({ id: 'admission', identifierType: 1 }),
      makeSeries({ id: 'inactive', isActive: false }),
      makeSeries({ id: 'other-year', academicYearId: 'year-2' }),
      makeSeries({ id: 'other-class', standardId: 'class-2' }),
      makeSeries({ id: 'exhausted', maximumSequence: 2, nextSequence: 3 }),
      makeSeries({ id: 'applicable', standardId: 'class-1' }),
    ]);
    const [result] = await runStudentSetupAssignment({
      type: 'gr-number',
      mode: 'automatic',
      grAssignmentMode: 'both',
      services,
      items: [workItem()],
    });
    expect(result.status).toBe('saved');
    expect(services.assignGr).toHaveBeenCalledWith({
      id: 'case-1',
      concurrencyStamp: 'fresh-stamp',
      numberSeriesId: 'applicable',
    });
  });

  it.each([{ series: [] }, { series: [makeSeries(), makeSeries({ id: 'ambiguous' })] }])(
    'fails without choosing an arbitrary GR series when the result is unavailable or ambiguous',
    async ({ series }) => {
      const services = makeServices();
      services.getSeries.mockResolvedValue(series);
      const [result] = await runStudentSetupAssignment({
        type: 'gr-number',
        mode: 'automatic',
        grAssignmentMode: 'both',
        services,
        items: [workItem()],
      });
      expect(result.status).toBe('failed');
      expect(result.message).toMatch(/No available|Multiple GR/);
      expect(services.assignGr).not.toHaveBeenCalled();
    }
  );

  it('never reads or writes Student Records rows', async () => {
    const services = makeServices();
    const [result] = await runStudentSetupAssignment({
      type: 'division',
      mode: 'manual',
      services,
      items: [
        workItem(makeCase(), {
          student: { ...mapOnboardingCaseToItem(makeCase()), source: 'student-records' },
          value: 'division-b',
        }),
      ],
    });
    expect(result.status).toBe('skipped');
    expect(services.getCase).not.toHaveBeenCalled();
    expect(services.setPlacement).not.toHaveBeenCalled();
  });

  it.each<Partial<StudentOnboardingCase>>([
    { studentEnrollmentId: 'enrollment-1' },
    { status: 4 },
    { status: 5 },
    { status: 6 },
  ])('stops writes when the fresh case is enrolled or closed: %j', async (overrides) => {
    const services = makeServices(makeCase(overrides));
    const [result] = await runStudentSetupAssignment({
      type: 'division',
      mode: 'manual',
      services,
      items: [workItem(makeCase(), { value: 'division-b', baselineValue: 'division-a' })],
    });
    expect(result.status).toBe('skipped');
    expect(services.setPlacement).not.toHaveBeenCalled();
  });

  it.each<StudentSetupAssignmentType>(['gr-number', 'roll-number', 'division'])(
    'fails a manual %s change after the value has drifted from its captured baseline',
    async (type) => {
      const services = makeServices(
        makeCase({ grNumber: 'GR-NEW', rollNumber: 2, divisionId: 'division-b' })
      );
      const value = type === 'gr-number' ? 'GR-WANTED' : type === 'roll-number' ? 3 : 'division-c';
      const [result] = await runStudentSetupAssignment({
        type,
        mode: 'manual',
        grAssignmentMode: 'both',
        services,
        items: [
          workItem(makeCase(), { value, baselineValue: type === 'division' ? 'division-a' : null }),
        ],
      });
      expect(result.status).toBe('failed');
      expect(result.errorCode).toBe('Students.Onboarding.ConcurrencyConflict');
      expect(result.message).toContain('changed since');
      expect(services.getSeries).not.toHaveBeenCalled();
      expect(services.previewRoll).not.toHaveBeenCalled();
      expect(services.setPlacement).not.toHaveBeenCalled();
    }
  );

  it.each<StudentSetupAssignmentType>(['gr-number', 'roll-number', 'division'])(
    'skips a manual %s value already saved, including after an unknown result',
    async (type) => {
      const services = makeServices(
        makeCase({
          grNumber: 'GR-WANTED',
          rollNumber: 3,
          divisionId: 'division-c',
          grNumberLocked: true,
          rollNumberLocked: true,
        })
      );
      const value =
        type === 'gr-number' ? 'GR-WANTED' : type === 'roll-number' ? '3' : 'division-c';
      const [result] = await runStudentSetupAssignment({
        type,
        mode: 'manual',
        grAssignmentMode: 'automatic',
        services,
        items: [
          workItem(makeCase({ divisionId: type === 'roll-number' ? 'division-c' : 'division-a' }), {
            value,
            baselineValue: null,
            reason: 'x'.repeat(1001),
          }),
        ],
      });
      expect(result.status).toBe('skipped');
      expect(services.getSeries).not.toHaveBeenCalled();
      expect(services.previewRoll).not.toHaveBeenCalled();
      expect(services.setPlacement).not.toHaveBeenCalled();
    }
  );

  it('accepts a first manual GR entry without a reason and sends its trimmed exact value', async () => {
    const services = makeServices();
    const [result] = await runStudentSetupAssignment({
      type: 'gr-number',
      mode: 'manual',
      grAssignmentMode: 'both',
      services,
      items: [workItem(makeCase(), { value: '  GR-0007  ' })],
    });
    expect(result.status).toBe('saved');
    expect(services.assignGr).toHaveBeenCalledWith({
      id: 'case-1',
      concurrencyStamp: 'fresh-stamp',
      numberSeriesId: 'series-1',
      manualValue: 'GR-0007',
    });
  });

  it('requires a reason for reserved GR correction and preserves the same existing contract', async () => {
    const current = makeCase({ grNumber: 'GR-0001' });
    const services = makeServices(current);
    const item = workItem(current, { value: 'GR-0002', baselineValue: 'GR-0001' });
    const [missingReason] = await runStudentSetupAssignment({
      type: 'gr-number',
      mode: 'manual',
      grAssignmentMode: 'both',
      services,
      items: [item],
    });
    expect(missingReason.status).toBe('failed');
    expect(services.getSeries).not.toHaveBeenCalled();
    const [saved] = await runStudentSetupAssignment({
      type: 'gr-number',
      mode: 'manual',
      grAssignmentMode: 'both',
      services,
      items: [{ ...item, reason: '  Correct the reservation  ' }],
    });
    expect(saved.status).toBe('saved');
    expect(services.assignGr).toHaveBeenCalledWith({
      id: 'case-1',
      concurrencyStamp: 'fresh-stamp',
      numberSeriesId: 'series-1',
      manualValue: 'GR-0002',
      reason: 'Correct the reservation',
    });
  });

  it('reports the backend committed-GR rejection without retrying or claiming a save', async () => {
    const current = makeCase({ grNumber: 'GR-0001' });
    const services = makeServices(current);
    services.assignGr.mockRejectedValue({
      data: {
        error: {
          code: 'Students.Onboarding.CaseNotEditable',
          data: { Reason: 'Correct committed identifiers through Student Records.' },
        },
      },
    });
    const [result] = await runStudentSetupAssignment({
      type: 'gr-number',
      mode: 'manual',
      grAssignmentMode: 'both',
      services,
      items: [
        workItem(current, { value: 'GR-0002', baselineValue: 'GR-0001', reason: 'Correction' }),
      ],
    });
    expect(result).toMatchObject({
      status: 'failed',
      message: 'Correct committed identifiers through Student Records.',
    });
    expect(services.assignGr).toHaveBeenCalledTimes(1);
  });

  it.each([
    { type: 'gr-number' as const, value: '', reason: '' },
    { type: 'gr-number' as const, value: 'x'.repeat(101), reason: '' },
    { type: 'roll-number' as const, value: '1.2', reason: '' },
    { type: 'roll-number' as const, value: 0, reason: '' },
    { type: 'roll-number' as const, value: 2147483648, reason: '' },
    { type: 'division' as const, value: '', reason: '' },
    { type: 'division' as const, value: 'division-b', reason: 'x'.repeat(1001) },
  ])(
    'validates manual values before requesting writes: $type $value',
    async ({ type, value, reason }) => {
      const services = makeServices();
      const [result] = await runStudentSetupAssignment({
        type,
        mode: 'manual',
        grAssignmentMode: 'both',
        services,
        items: [workItem(makeCase(), { value, reason })],
      });
      expect(result.status).toBe('failed');
      expect(services.getSeries).not.toHaveBeenCalled();
      expect(services.previewRoll).not.toHaveBeenCalled();
      expect(services.setPlacement).not.toHaveBeenCalled();
    }
  );

  it.each([
    {
      type: 'gr-number' as const,
      mode: 'manual' as const,
      grAssignmentMode: 'automatic' as const,
      current: makeCase(),
    },
    {
      type: 'gr-number' as const,
      mode: 'manual' as const,
      grAssignmentMode: 'both' as const,
      current: makeCase({ grManualEntryAllowed: false }),
    },
    {
      type: 'gr-number' as const,
      mode: 'manual' as const,
      grAssignmentMode: 'both' as const,
      current: makeCase({ grNumberLocked: true }),
    },
    {
      type: 'gr-number' as const,
      mode: 'automatic' as const,
      grAssignmentMode: 'manual' as const,
      current: makeCase(),
    },
    {
      type: 'roll-number' as const,
      mode: 'manual' as const,
      grAssignmentMode: 'both' as const,
      current: makeCase({ rollAssignmentMode: 'automatic' }),
    },
    {
      type: 'roll-number' as const,
      mode: 'manual' as const,
      grAssignmentMode: 'both' as const,
      current: makeCase({ rollNumberLocked: true }),
    },
    {
      type: 'roll-number' as const,
      mode: 'automatic' as const,
      grAssignmentMode: 'both' as const,
      current: makeCase({ rollAssignmentMode: 'manual' }),
    },
    {
      type: 'roll-number' as const,
      mode: 'automatic' as const,
      grAssignmentMode: 'both' as const,
      current: makeCase({ divisionId: null }),
    },
  ])(
    'blocks mode, rule and lock violations: $type $mode',
    async ({ type, mode, grAssignmentMode, current }) => {
      const services = makeServices(current);
      const [result] = await runStudentSetupAssignment({
        type,
        mode,
        grAssignmentMode,
        services,
        items: [workItem(current, { value: type === 'gr-number' ? 'GR-0002' : 4 })],
      });
      expect(result.status).toBe('failed');
      expect(services.getSeries).not.toHaveBeenCalled();
      expect(services.previewRoll).not.toHaveBeenCalled();
    }
  );

  it('allows automatic preparation for a locked unassigned group, as the backend contract requires', async () => {
    const current = makeCase({
      grNumberLocked: true,
      rollNumberLocked: true,
      rollAssignmentMode: 'manual',
    });
    const services = makeServices(current);
    const [gr] = await runStudentSetupAssignment({
      type: 'gr-number',
      mode: 'automatic',
      grAssignmentMode: 'manual',
      services,
      items: [workItem(current)],
    });
    const [roll] = await runStudentSetupAssignment({
      type: 'roll-number',
      mode: 'automatic',
      services,
      items: [workItem(current)],
    });
    expect(gr.status).toBe('saved');
    expect(roll.status).toBe('saved');
  });

  it('commits the exact automatic Roll proposal with its returned fresh stamp and no manual fields', async () => {
    const services = makeServices();
    const [result] = await runStudentSetupAssignment({
      type: 'roll-number',
      mode: 'automatic',
      services,
      items: [workItem(makeCase(), { value: 999, reason: 'ignore manual fields' })],
    });
    expect(result.status).toBe('saved');
    expect(services.previewRoll).toHaveBeenCalledWith({
      id: 'case-1',
      rollAssignmentMode: 'automatic',
    });
    expect(services.assignRoll).toHaveBeenCalledWith({
      id: 'case-1',
      concurrencyStamp: 'preview-stamp',
      rollNumber: 8,
      rollAssignmentMode: 'automatic',
    });
  });

  it('honors required Roll correction reasons and verifies the exact manual proposal', async () => {
    const current = makeCase({ rollNumber: 3, rollChangeReasonRequired: true });
    const services = makeServices(current);
    services.previewRoll.mockResolvedValue({
      schoolAssignmentMode: 'both',
      rollAssignmentMode: 'manual',
      proposedRollNumber: 8,
      concurrencyStamp: 'fresh-stamp',
    });
    const item = workItem(current, { value: 8, baselineValue: 3 });
    const [missingReason] = await runStudentSetupAssignment({
      type: 'roll-number',
      mode: 'manual',
      services,
      items: [item],
    });
    expect(missingReason.status).toBe('failed');
    expect(services.previewRoll).not.toHaveBeenCalled();
    const [saved] = await runStudentSetupAssignment({
      type: 'roll-number',
      mode: 'manual',
      services,
      items: [{ ...item, reason: 'Correct numbering' }],
    });
    expect(saved.status).toBe('saved');
    expect(services.previewRoll).toHaveBeenCalledWith({
      id: 'case-1',
      rollAssignmentMode: 'manual',
      rollNumber: 8,
      reason: 'Correct numbering',
    });
    expect(services.assignRoll).toHaveBeenCalledWith({
      id: 'case-1',
      concurrencyStamp: 'fresh-stamp',
      rollAssignmentMode: 'manual',
      rollNumber: 8,
      reason: 'Correct numbering',
    });
    services.previewRoll.mockResolvedValue({
      schoolAssignmentMode: 'both',
      rollAssignmentMode: 'manual',
      proposedRollNumber: 9,
      concurrencyStamp: 'fresh-stamp',
    });
    const [changed] = await runStudentSetupAssignment({
      type: 'roll-number',
      mode: 'manual',
      services,
      items: [{ ...item, reason: 'Correct numbering' }],
    });
    expect(changed.status).toBe('failed');
    expect(services.assignRoll).toHaveBeenCalledTimes(1);
  });

  it('requires an explicit automatic Division target and applies it only to unassigned students', async () => {
    const current = makeCase({ divisionId: null });
    const services = makeServices(current);
    const [missingTarget] = await runStudentSetupAssignment({
      type: 'division',
      mode: 'automatic',
      services,
      items: [workItem(current)],
    });
    expect(missingTarget.status).toBe('failed');
    expect(services.setPlacement).not.toHaveBeenCalled();
    const [saved] = await runStudentSetupAssignment({
      type: 'division',
      mode: 'automatic',
      divisionId: 'division-b',
      services,
      items: [workItem(current)],
    });
    expect(saved.status).toBe('saved');
    expect(services.setPlacement).toHaveBeenCalledWith({
      id: 'case-1',
      concurrencyStamp: 'fresh-stamp',
      divisionId: 'division-b',
    });
  });

  it('returns manual Division updates including backend-cleared Roll values without inventing a Division lock', async () => {
    const current = makeCase({ rollNumber: 7, grNumberLocked: true });
    const services = makeServices(current);
    const [result] = await runStudentSetupAssignment({
      type: 'division',
      mode: 'manual',
      services,
      items: [workItem(current, { value: 'division-b', baselineValue: 'division-a' })],
    });
    expect(result.status).toBe('saved');
    expect(result.updatedStudent).toMatchObject({ divisionId: 'division-b', rollNo: null });
    expect(services.assignRoll).not.toHaveBeenCalled();
  });

  it('stops Manual Roll if the case changed between baseline read and preview', async () => {
    const services = makeServices();
    services.previewRoll.mockResolvedValue({
      schoolAssignmentMode: 'both',
      rollAssignmentMode: 'manual',
      proposedRollNumber: 8,
      concurrencyStamp: 'changed-after-read',
    });
    const [result] = await runStudentSetupAssignment({
      type: 'roll-number',
      mode: 'manual',
      services,
      items: [workItem(makeCase(), { value: 8 })],
    });
    expect(result.status).toBe('failed');
    expect(result.message).toContain('Refresh and review');
    expect(services.assignRoll).not.toHaveBeenCalled();
  });

  it('stops Manual Roll after the target Division changed even when the Roll baseline is unchanged', async () => {
    const original = makeCase({ rollNumber: 3, divisionId: 'division-a' });
    const services = makeServices(makeCase({ rollNumber: 3, divisionId: 'division-b' }));
    const [result] = await runStudentSetupAssignment({
      type: 'roll-number',
      mode: 'manual',
      services,
      items: [workItem(original, { value: 8, baselineValue: 3 })],
    });
    expect(result.status).toBe('failed');
    expect(result.message).toContain('Division changed');
    expect(result.errorCode).toBe('Students.Onboarding.ConcurrencyConflict');
    expect(services.previewRoll).not.toHaveBeenCalled();
    expect(services.assignRoll).not.toHaveBeenCalled();
  });

  it.each([
    { type: 'gr-number' as const, mode: 'automatic' as const },
    { type: 'gr-number' as const, mode: 'manual' as const },
    { type: 'roll-number' as const, mode: 'automatic' as const },
    { type: 'roll-number' as const, mode: 'manual' as const },
    { type: 'division' as const, mode: 'automatic' as const },
    { type: 'division' as const, mode: 'manual' as const },
  ])('stops $mode $type after the captured academic scope changed', async ({ type, mode }) => {
    const services = makeServices(makeCase({ intendedStandardId: 'class-2' }));
    const [result] = await runStudentSetupAssignment({
      type,
      mode,
      services,
      grAssignmentMode: 'both',
      divisionId: 'division-b',
      items: [
        workItem(makeCase(), {
          value: type === 'gr-number' ? 'GR-0007' : type === 'roll-number' ? 8 : 'division-b',
          baselineValue: type === 'division' ? 'division-a' : null,
        }),
      ],
    });
    expect(result.status).toBe('failed');
    expect(result.message).toContain('academic context changed');
    expect(services.getSeries).not.toHaveBeenCalled();
    expect(services.previewRoll).not.toHaveBeenCalled();
    expect(services.setPlacement).not.toHaveBeenCalled();
  });

  it('continues after a capacity failure and returns every per-student outcome', async () => {
    const cases = [makeCase({ divisionId: null }), makeCase({ id: 'case-2', divisionId: null })];
    const services: StudentSetupAssignmentServices = {
      ...makeServices(),
      getCase: vi.fn(async (id) => cases.find((item) => item.id === id)!),
      setPlacement: vi.fn(async (request) => {
        if (request.id === 'case-1')
          throw Object.assign(new Error('Division capacity rejected.'), {
            data: {
              error: {
                code: 'Students.Onboarding.DivisionFull',
                data: { Reason: 'Division B has no seats available.' },
              },
            },
          });
        return { ...cases[1], divisionId: request.divisionId };
      }),
    };
    const onResult = vi.fn();
    const results = await runStudentSetupAssignment({
      type: 'division',
      mode: 'automatic',
      divisionId: 'division-b',
      services,
      items: cases.map((current) => workItem(current)),
      onResult,
    });
    expect(results.map((result) => result.status)).toEqual(['failed', 'saved']);
    expect(results[0].message).toBe('Division B has no seats available.');
    expect(services.setPlacement).toHaveBeenCalledTimes(2);
    expect(onResult).toHaveBeenNthCalledWith(1, results[0]);
    expect(onResult).toHaveBeenNthCalledWith(2, results[1]);
  });

  it('does not repeat a GR allocation after a lost response when the user reruns Automatic', async () => {
    let current = makeCase();
    const services: StudentSetupAssignmentServices = {
      ...makeServices(),
      getCase: vi.fn(async () => current),
      assignGr: vi.fn(async () => {
        current = { ...current, grNumber: 'GR-0001' };
        throw new Error('The response was lost.');
      }),
    };
    const options = {
      type: 'gr-number' as const,
      mode: 'automatic' as const,
      grAssignmentMode: 'both' as const,
      services,
      items: [workItem()],
    };
    expect((await runStudentSetupAssignment(options))[0].status).toBe('failed');
    expect(services.assignGr).toHaveBeenCalledTimes(1);
    expect((await runStudentSetupAssignment(options))[0].status).toBe('skipped');
    expect(services.assignGr).toHaveBeenCalledTimes(1);
    expect(services.getSeries).toHaveBeenCalledTimes(1);
  });
});

describe('Student Setup assignment UI helpers', () => {
  it('normalizes values and requires reasons only for existing GR or governed Roll corrections', () => {
    const student = mapOnboardingCaseToItem(makeCase({ grNumber: '  GR-0010  ', rollNumber: 2 }));
    expect(getStudentSetupAssignmentValue(student, 'gr-number')).toBe('GR-0010');
    expect(getStudentSetupAssignmentValue({ ...student, grNo: '' }, 'gr-number')).toBeNull();
    expect(studentSetupAssignmentNeedsReason(student, 'gr-number')).toBe(true);
    expect(studentSetupAssignmentNeedsReason(student, 'roll-number')).toBe(false);
    expect(
      studentSetupAssignmentNeedsReason(
        { ...student, rollChangeReasonRequired: true },
        'roll-number'
      )
    ).toBe(true);
    expect(studentSetupAssignmentNeedsReason(student, 'division')).toBe(false);
  });

  it('exposes assignment eligibility without adding role or Division-lock grants', () => {
    const student = mapOnboardingCaseToItem(makeCase());
    expect(
      getStudentSetupAssignmentEligibility(student, 'gr-number', 'manual', 'both').eligible
    ).toBe(true);
    expect(getStudentSetupAssignmentEligibility(student, 'gr-number', 'manual').eligible).toBe(
      false
    );
    expect(
      getStudentSetupAssignmentEligibility(
        { ...student, rollNumberLocked: true },
        'division',
        'manual'
      ).eligible
    ).toBe(true);
    expect(
      getStudentSetupAssignmentEligibility(
        { ...student, source: 'student-records' },
        'division',
        'manual'
      ).eligible
    ).toBe(false);
  });
});
