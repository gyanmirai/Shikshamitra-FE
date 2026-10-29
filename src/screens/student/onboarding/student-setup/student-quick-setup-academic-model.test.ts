import type {
  StudentOnboardingCase,
  StudentIdentifierSeries,
  StudentOnboardingSettingsRecord,
} from 'src/redux/student/onboarding/student-onboarding-types';

import { vi, it, expect, describe } from 'vitest';

import {
  readQuickGrMode,
  saveQuickAcademic,
  quickAcademicInitialValues,
} from './student-quick-setup-academic-model';

import type { StudentSetupAssignmentServices } from './student-setup-assignment-model';

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
};
function fixture(overrides: Partial<StudentOnboardingCase> = {}) {
  let current = makeCase(overrides);
  const order: string[] = [];
  const initial = current;
  const services: StudentSetupAssignmentServices = {
    getCase: vi.fn(async () => {
      order.push(`get:${current.concurrencyStamp}`);
      return { ...current };
    }),
    getSeries: vi.fn(async () => [series]),
    setPlacement: vi.fn(async (input) => {
      order.push(`division:${input.concurrencyStamp}`);
      current = { ...current, divisionId: input.divisionId, concurrencyStamp: 'v2' };
      if (!current.rollNumberLocked) current = { ...current, rollNumber: null };
      return current;
    }),
    assignGr: vi.fn(async (input) => {
      order.push(`gr:${input.concurrencyStamp}`);
      current = { ...current, grNumber: input.manualValue || '001', concurrencyStamp: 'v3' };
      return current;
    }),
    previewRoll: vi.fn<StudentSetupAssignmentServices['previewRoll']>(async (input) => {
      order.push(`preview:${current.divisionId}:${current.concurrencyStamp}`);
      return {
        schoolAssignmentMode: 'both',
        rollAssignmentMode: input.rollAssignmentMode!,
        proposedRollNumber: input.rollNumber || 7,
        concurrencyStamp: current.concurrencyStamp,
      };
    }),
    assignRoll: vi.fn(async (input) => {
      order.push(`roll:${input.concurrencyStamp}`);
      current = { ...current, rollNumber: input.rollNumber, concurrencyStamp: 'v4' };
      return current;
    }),
  };
  return {
    services,
    initial,
    order,
    update: (value: Partial<StudentOnboardingCase>) => {
      current = { ...current, ...value };
    },
  };
}

describe('quick academic save', () => {
  it('rejects identifier assignment before any writes when division is missing', async () => {
    const { services, initial } = fixture({ divisionId: null });
    await expect(
      saveQuickAcademic({
        baseline: initial,
        values: quickAcademicInitialValues(initial, 'both'),
        grPolicy: 'both',
        services,
        onSaved: vi.fn(),
      })
    ).rejects.toThrow('Select a division before assigning GR or roll numbers.');
    expect(services.assignGr).not.toHaveBeenCalled();
    expect(services.assignRoll).not.toHaveBeenCalled();
    expect(services.setPlacement).not.toHaveBeenCalled();
  });
  it('saves division, GR, then previews and saves Roll using fresh dependent stamps', async () => {
    const { services, initial, order } = fixture();
    const onSaved = vi.fn();
    const saved = await saveQuickAcademic({
      baseline: initial,
      values: { ...quickAcademicInitialValues(initial, 'both'), divisionId: 'B' },
      grPolicy: 'both',
      services,
      onSaved,
    });
    expect(order).toEqual([
      'get:v1',
      'division:v1',
      'get:v2',
      'gr:v2',
      'get:v3',
      'preview:B:v3',
      'roll:v3',
    ]);
    expect(saved).toMatchObject({ divisionId: 'B', grNumber: '001', rollNumber: 7 });
    expect(onSaved.mock.calls.map(([field]) => field)).toEqual(['division', 'gr', 'roll']);
  });

  it('does not regenerate existing GR/Roll or mutate when there are no meaningful changes', async () => {
    const { services, initial } = fixture({ grNumber: '012', rollNumber: 12 });
    await saveQuickAcademic({
      baseline: initial,
      values: quickAcademicInitialValues(initial, 'both'),
      grPolicy: 'both',
      services,
      onSaved: vi.fn(),
    });
    expect(services.assignGr).not.toHaveBeenCalled();
    expect(services.previewRoll).not.toHaveBeenCalled();
    expect(services.assignRoll).not.toHaveBeenCalled();
    expect(services.setPlacement).not.toHaveBeenCalled();
  });

  it('replaces an unlocked Roll cleared by its own placement change using the new division preview', async () => {
    const { services, initial, order } = fixture({ grNumber: '001', rollNumber: 5 });
    const saved = await saveQuickAcademic({
      baseline: initial,
      values: {
        ...quickAcademicInitialValues(initial, 'both'),
        divisionId: 'B',
        rollMode: 'automatic',
      },
      grPolicy: 'both',
      services,
      onSaved: vi.fn(),
    });
    expect(order).toEqual(['get:v1', 'division:v1', 'get:v2', 'preview:B:v2', 'roll:v2']);
    expect(saved.rollNumber).toBe(7);
    expect(services.assignGr).not.toHaveBeenCalled();
  });

  it('checks a manual Roll in the new division instead of treating its own clearing as a concurrency conflict', async () => {
    const { services, initial } = fixture({
      grNumber: '001',
      rollNumber: 5,
      rollAssignmentMode: 'manual',
    });
    await saveQuickAcademic({
      baseline: initial,
      values: { ...quickAcademicInitialValues(initial, 'both'), divisionId: 'B', rollValue: '9' },
      grPolicy: 'both',
      services,
      onSaved: vi.fn(),
    });
    expect(services.previewRoll).toHaveBeenCalledWith(
      expect.objectContaining({ rollNumber: 9, rollAssignmentMode: 'manual' })
    );
    expect(services.assignRoll).toHaveBeenCalledWith(
      expect.objectContaining({ rollNumber: 9, concurrencyStamp: 'v2' })
    );
  });

  it('can retry Roll after placement cleared an existing number and the first Roll save failed', async () => {
    const { services, initial } = fixture({ grNumber: '001', rollNumber: 5 });
    vi.mocked(services.assignRoll).mockRejectedValueOnce(new Error('Temporary failure'));
    let baseline = initial;
    const values = {
      ...quickAcademicInitialValues(initial, 'both'),
      divisionId: 'B',
      rollMode: 'automatic' as const,
    };
    const onSaved = (_field: string, saved: StudentOnboardingCase) => {
      baseline = saved;
    };
    await expect(
      saveQuickAcademic({ baseline, values, grPolicy: 'both', services, onSaved })
    ).rejects.toThrow('Temporary failure');
    expect(baseline).toMatchObject({ divisionId: 'B', rollNumber: null });
    const saved = await saveQuickAcademic({
      baseline,
      values,
      grPolicy: 'both',
      services,
      onSaved,
    });
    expect(saved.rollNumber).toBe(7);
    expect(services.setPlacement).toHaveBeenCalledOnce();
  });

  it('allows an incomplete manual draft to be saved without inventing numbers', async () => {
    const { services, initial } = fixture({ divisionId: null, rollAssignmentMode: 'manual' });
    const saved = await saveQuickAcademic({
      baseline: initial,
      values: quickAcademicInitialValues(initial, 'manual'),
      grPolicy: 'manual',
      services,
      onSaved: vi.fn(),
    });
    expect(saved.rollNumber).toBeNull();
    expect(services.assignGr).not.toHaveBeenCalled();
    expect(services.assignRoll).not.toHaveBeenCalled();
  });

  it('acknowledges successful fields before a failure and does not repeat them on retry', async () => {
    const { services, initial } = fixture();
    vi.mocked(services.assignRoll).mockRejectedValueOnce(new Error('Temporary failure'));
    let baseline = initial;
    const values = { ...quickAcademicInitialValues(initial, 'both'), divisionId: 'B' };
    const onSaved = (_field: string, saved: StudentOnboardingCase) => {
      baseline = saved;
    };
    await expect(
      saveQuickAcademic({ baseline, values, grPolicy: 'both', services, onSaved })
    ).rejects.toThrow('Temporary failure');
    expect(baseline).toMatchObject({ divisionId: 'B', grNumber: '001', rollNumber: null });
    await saveQuickAcademic({ baseline, values, grPolicy: 'both', services, onSaved });
    expect(services.setPlacement).toHaveBeenCalledTimes(1);
    expect(services.assignGr).toHaveBeenCalledTimes(1);
    expect(services.assignRoll).toHaveBeenCalledTimes(2);
  });

  it('requires loaded GR policy instead of treating unknown configuration as automatic', async () => {
    const { services, initial } = fixture();
    await expect(
      saveQuickAcademic({
        baseline: initial,
        values: { ...quickAcademicInitialValues(initial), grMode: 'automatic' },
        services,
        onSaved: vi.fn(),
      })
    ).rejects.toThrow('GR settings are unavailable. Reload before assigning a number.');
    expect(services.assignGr).not.toHaveBeenCalled();
  });

  it('rejects manual GR when the published school policy is automatic', async () => {
    const { services, initial } = fixture();
    await expect(
      saveQuickAcademic({
        baseline: initial,
        values: {
          ...quickAcademicInitialValues(initial, 'automatic'),
          grMode: 'manual',
          grValue: '900',
        },
        grPolicy: 'automatic',
        services,
        onSaved: vi.fn(),
      })
    ).rejects.toThrow('Manual GR entry');
    expect(services.assignGr).not.toHaveBeenCalled();
  });

  it('requires an explicit GR series choice when multiple published series match', async () => {
    const { services, initial } = fixture();
    vi.mocked(services.getSeries).mockResolvedValue([series, { ...series, id: 'other' }]);
    await expect(
      saveQuickAcademic({
        baseline: initial,
        values: quickAcademicInitialValues(initial, 'both'),
        grPolicy: 'both',
        services,
        onSaved: vi.fn(),
      })
    ).rejects.toThrow('Select the GR numbering rule.');
    expect(services.assignGr).not.toHaveBeenCalled();
  });

  it('rejects a manual correction if another user changed that identifier', async () => {
    const { services, initial, update } = fixture({ grNumber: '001', rollNumber: 1 });
    update({ grNumber: '002' });
    await expect(
      saveQuickAcademic({
        baseline: initial,
        values: {
          ...quickAcademicInitialValues(initial, 'both'),
          grValue: '003',
          grReason: 'Correction',
        },
        grPolicy: 'both',
        services,
        onSaved: vi.fn(),
      })
    ).rejects.toThrow('another session');
    expect(services.assignGr).not.toHaveBeenCalled();
  });

  it('uses a successful concurrent automatic assignment rather than allocating twice', async () => {
    const { services, initial, update } = fixture();
    update({ grNumber: '040', rollNumber: 40 });
    const saved = await saveQuickAcademic({
      baseline: initial,
      values: quickAcademicInitialValues(initial, 'both'),
      grPolicy: 'both',
      services,
      onSaved: vi.fn(),
    });
    expect(saved.grNumber).toBe('040');
    expect(services.assignGr).not.toHaveBeenCalled();
    expect(services.previewRoll).not.toHaveBeenCalled();
  });

  it('rejects a changed Roll preview stamp and leaves that number unassigned', async () => {
    const { services, initial } = fixture({ grNumber: '001' });
    vi.mocked(services.previewRoll).mockResolvedValue({
      schoolAssignmentMode: 'both',
      rollAssignmentMode: 'automatic',
      proposedRollNumber: 8,
      concurrencyStamp: 'another-stamp',
    });
    await expect(
      saveQuickAcademic({
        baseline: initial,
        values: quickAcademicInitialValues(initial, 'both'),
        grPolicy: 'both',
        services,
        onSaved: vi.fn(),
      })
    ).rejects.toThrow('proposal changed');
    expect(services.assignRoll).not.toHaveBeenCalled();
  });

  it('preserves locks and required reasons on identifier corrections', async () => {
    const { services, initial } = fixture({ grNumber: '001', grNumberLocked: true, rollNumber: 1 });
    await expect(
      saveQuickAcademic({
        baseline: initial,
        values: {
          ...quickAcademicInitialValues(initial, 'both'),
          grValue: '002',
          grReason: 'Correction',
        },
        grPolicy: 'both',
        services,
        onSaved: vi.fn(),
      })
    ).rejects.toThrow('locked');
    expect(services.assignGr).not.toHaveBeenCalled();
  });

  it('does not write to activated students', async () => {
    const { services, initial } = fixture({ studentEnrollmentId: 'enrollment' });
    await expect(
      saveQuickAcademic({
        baseline: initial,
        values: { ...quickAcademicInitialValues(initial, 'both'), divisionId: 'B' },
        grPolicy: 'both',
        services,
        onSaved: vi.fn(),
      })
    ).rejects.toThrow('no longer editable');
    expect(services.setPlacement).not.toHaveBeenCalled();
  });
});

describe('quick GR school-mode loading', () => {
  const record = (
    academicYearId: string | null,
    mode: string
  ): StudentOnboardingSettingsRecord => ({
    id: 'settings',
    concurrencyStamp: 'v1',
    academicYearId,
    schemaVersion: 1,
    configurationJson: JSON.stringify({ grNumber: { assignmentMode: mode } }),
  });
  it('selects the case year override ahead of the school default', () => {
    expect(readQuickGrMode([record(null, 'automatic'), record('year', 'manual')], 'year')).toBe(
      'manual'
    );
  });
  it('does not invent a policy for missing, unsupported, or malformed settings', () => {
    expect(readQuickGrMode([], 'year')).toBeUndefined();
    expect(readQuickGrMode([record('year', 'future-mode')], 'year')).toBeUndefined();
    expect(
      readQuickGrMode([{ ...record('year', 'manual'), configurationJson: '{bad' }], 'year')
    ).toBeUndefined();
  });
});
