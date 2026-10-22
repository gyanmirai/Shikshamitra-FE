import type { StudentOnboardingCase } from 'src/redux/student/onboarding/student-onboarding-types';

import { it, vi, expect, describe } from 'vitest';

import { runStudentQuickSetupSave } from './student-quick-setup-save';

const makeCase = (overrides: Partial<StudentOnboardingCase> = {}): StudentOnboardingCase => ({
  id: 'case-1',
  documentUploadsEnabled: true,
  concurrencyStamp: 'case-stamp',
  applicationId: 'application-1',
  applicationNumber: 'APP-1',
  applicantId: 'applicant-1',
  studentId: 'student-1',
  studentName: 'Aarav UXTest',
  offeringId: 'offering-1',
  offeringCode: 'OFFER-1',
  academicYearId: 'year-1',
  academicYearName: '2026-27',
  intendedBoardId: 'board-1',
  intendedMediumId: 'medium-1',
  intendedStageId: 'stage-1',
  intendedStandardId: 'class-1',
  intendedStandardName: 'Class 1',
  status: 2,
  dueAt: '2026-10-19T00:00:00Z',
  isHistoricalBackfill: false,
  divisionId: 'division-a',
  divisionName: 'A',
  grNumber: 'GR-0001',
  rollNumber: 8,
  progressPercent: 100,
  isOverdue: false,
  steps: [],
  events: [],
  ...overrides,
});

const makeServices = () => ({
  saveAcademic: vi.fn(async () => makeCase({ concurrencyStamp: 'academic-stamp' })),
  saveFees: vi.fn(async (_options: { allowIncomplete: boolean }) => {}),
  getCase: vi.fn(async () => makeCase({ concurrencyStamp: 'reloaded-stamp' })),
  previewActivation: vi.fn(async () => makeCase({ concurrencyStamp: 'preview-stamp' })),
  activateStudent: vi.fn(async (_preview: StudentOnboardingCase, _key: string) =>
    makeCase({ studentEnrollmentId: 'enrollment-1', status: 4 })
  ),
});

describe('single-student setup save coordination', () => {
  it('saves academic work and fees in sequence, then activates with the fresh preview', async () => {
    const services = makeServices();
    const events: string[] = [];
    const preview = makeCase({ concurrencyStamp: 'latest-preview-stamp' });
    const activated = makeCase({ studentEnrollmentId: 'enrollment-1', status: 4 });
    services.saveAcademic.mockImplementation(async () => {
      events.push('academic');
      return makeCase({ concurrencyStamp: 'academic-stamp' });
    });
    services.saveFees.mockImplementation(async (options) => {
      events.push(`fees:${options.allowIncomplete}`);
    });
    services.previewActivation.mockImplementation(async () => {
      events.push('preview');
      return preview;
    });
    services.activateStudent.mockImplementation(async () => {
      events.push('activate');
      return activated;
    });

    await expect(
      runStudentQuickSetupSave({ activate: true, idempotencyKey: 'attempt-1', services })
    ).resolves.toBe(activated);

    expect(events).toEqual(['academic', 'fees:false', 'preview', 'activate']);
    expect(services.activateStudent).toHaveBeenCalledWith(preview, 'attempt-1');
    expect(services.getCase).not.toHaveBeenCalled();
  });

  it('Save for Later allows incomplete fees and returns a fresh case without activation', async () => {
    const services = makeServices();
    const saved = makeCase({ concurrencyStamp: 'saved-fee-stamp', status: 1 });
    services.getCase.mockResolvedValue(saved);

    await expect(
      runStudentQuickSetupSave({ activate: false, idempotencyKey: 'unused', services })
    ).resolves.toBe(saved);

    expect(services.saveFees).toHaveBeenCalledWith({ allowIncomplete: true });
    expect(services.getCase).toHaveBeenCalledOnce();
    expect(services.previewActivation).not.toHaveBeenCalled();
    expect(services.activateStudent).not.toHaveBeenCalled();
  });

  it('stops immediately when academic saving fails', async () => {
    const services = makeServices();
    const failure = new Error('Choose an available division.');
    services.saveAcademic.mockRejectedValue(failure);

    await expect(
      runStudentQuickSetupSave({ activate: true, idempotencyKey: 'attempt-1', services })
    ).rejects.toBe(failure);

    expect(services.saveFees).not.toHaveBeenCalled();
    expect(services.getCase).not.toHaveBeenCalled();
    expect(services.previewActivation).not.toHaveBeenCalled();
    expect(services.activateStudent).not.toHaveBeenCalled();
  });

  it('keeps earlier academic saves but never previews or activates after fee failure', async () => {
    const services = makeServices();
    const failure = new Error('Confirm a published fee structure.');
    services.saveFees.mockRejectedValue(failure);

    await expect(
      runStudentQuickSetupSave({ activate: true, idempotencyKey: 'attempt-1', services })
    ).rejects.toBe(failure);

    expect(services.saveAcademic).toHaveBeenCalledOnce();
    expect(services.saveFees).toHaveBeenCalledWith({ allowIncomplete: false });
    expect(services.getCase).not.toHaveBeenCalled();
    expect(services.previewActivation).not.toHaveBeenCalled();
    expect(services.activateStudent).not.toHaveBeenCalled();
  });

  it.each([
    [
      makeCase({ status: 1, lastError: 'Verify the transfer certificate.' }),
      'Verify the transfer certificate.',
    ],
    [
      makeCase({ status: 2, lastError: 'The seat reservation has expired.' }),
      'The seat reservation has expired.',
    ],
    [makeCase({ status: 1, primaryBlocker: 'Onboarding approval' }), 'Onboarding approval'],
    [
      makeCase({ status: 4 }),
      'Complete the remaining setup requirements before activating the student.',
    ],
    [makeCase({ status: 5 }), 'This onboarding case is cancelled and cannot be activated.'],
    [
      makeCase({ status: 5, studentEnrollmentId: 'enrollment-1' }),
      'This onboarding case is cancelled and cannot be activated.',
    ],
  ])(
    'rejects blocked or cancelled activation without issuing the command',
    async (preview, message) => {
      const services = makeServices();
      services.previewActivation.mockResolvedValue(preview);

      await expect(
        runStudentQuickSetupSave({ activate: true, idempotencyKey: 'attempt-1', services })
      ).rejects.toThrow(message);

      expect(services.activateStudent).not.toHaveBeenCalled();
    }
  );

  it('does not activate an already enrolled student even when app access remains pending', async () => {
    const services = makeServices();
    const enrolled = makeCase({
      studentEnrollmentId: 'enrollment-1',
      status: 3,
      lastError: 'Enrollment is active. Retry app access preparation.',
    });
    services.previewActivation.mockResolvedValue(enrolled);

    await expect(
      runStudentQuickSetupSave({ activate: true, idempotencyKey: 'attempt-1', services })
    ).resolves.toBe(enrolled);

    expect(services.activateStudent).not.toHaveBeenCalled();
  });

  it('returns committed activation with pending access without turning it into an activation error', async () => {
    const services = makeServices();
    const enrolled = makeCase({
      studentEnrollmentId: 'enrollment-1',
      status: 3,
      lastError: 'Enrollment is active. Retry app access preparation.',
    });
    services.activateStudent.mockResolvedValue(enrolled);

    await expect(
      runStudentQuickSetupSave({ activate: true, idempotencyKey: 'attempt-1', services })
    ).resolves.toBe(enrolled);

    expect(services.activateStudent).toHaveBeenCalledOnce();
  });

  it('preserves preview failure and never guesses readiness from academic results', async () => {
    const services = makeServices();
    const failure = new Error('The latest readiness check could not be loaded.');
    services.previewActivation.mockRejectedValue(failure);

    await expect(
      runStudentQuickSetupSave({ activate: true, idempotencyKey: 'attempt-1', services })
    ).rejects.toBe(failure);

    expect(services.activateStudent).not.toHaveBeenCalled();
  });

  it('propagates activation failure without issuing a duplicate command or compensating save', async () => {
    const services = makeServices();
    const failure = new Error('The roll proposal changed.');
    services.activateStudent.mockRejectedValue(failure);

    await expect(
      runStudentQuickSetupSave({ activate: true, idempotencyKey: 'attempt-1', services })
    ).rejects.toBe(failure);

    expect(services.saveAcademic).toHaveBeenCalledOnce();
    expect(services.saveFees).toHaveBeenCalledOnce();
    expect(services.activateStudent).toHaveBeenCalledOnce();
  });
});
