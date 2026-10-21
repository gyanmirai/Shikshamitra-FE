import type { StudentOnboardingCase } from 'src/redux/student/onboarding/student-onboarding-types';

export type StudentQuickSetupSaveServices = {
  saveAcademic: () => Promise<StudentOnboardingCase>;
  saveFees: (options: { allowIncomplete: boolean }) => Promise<void>;
  getCase: () => Promise<StudentOnboardingCase>;
  previewActivation: () => Promise<StudentOnboardingCase>;
  activateStudent: (
    preview: StudentOnboardingCase,
    idempotencyKey: string
  ) => Promise<StudentOnboardingCase>;
};

type StudentQuickSetupSaveOptions = {
  activate: boolean;
  idempotencyKey: string;
  services: StudentQuickSetupSaveServices;
};

/** Existing commands commit independently; a later failure never rolls back an earlier save. */
export async function runStudentQuickSetupSave({
  activate,
  idempotencyKey,
  services,
}: StudentQuickSetupSaveOptions): Promise<StudentOnboardingCase> {
  await services.saveAcademic();
  await services.saveFees({ allowIncomplete: !activate });

  if (!activate) return services.getCase();

  const preview = await services.previewActivation();
  if (preview.status === 5) {
    throw new Error('This onboarding case is cancelled and cannot be activated.');
  }
  // A committed enrollment may still have pending app access. Never activate it again.
  if (preview.studentEnrollmentId) return preview;
  if (preview.status !== 2 || preview.lastError?.trim()) {
    throw new Error(
      preview.lastError?.trim() ||
        preview.primaryBlocker?.trim() ||
        'Complete the remaining setup requirements before activating the student.'
    );
  }

  // The preview, rather than the earlier academic result, owns the current case stamp.
  return services.activateStudent(preview, idempotencyKey);
}
