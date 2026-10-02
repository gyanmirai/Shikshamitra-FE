import type { SeatingPlanGroupDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { shikshaMitraToast } from 'src/components/toast';

import type { useGuidedSeatingOperations } from './use-guided-seating-operations';

export function createGuidedPlanActions(
  operations: ReturnType<typeof useGuidedSeatingOperations>,
  startNewPlan: () => void
) {
  const run = async (mutation: () => Promise<unknown>, message: string) => {
    try {
      await mutation();
      startNewPlan();
      shikshaMitraToast.success({ message });
    } catch (error) {
      operations.showError(error);
      throw error;
    }
  };

  return {
    updatePlanSubjects: (plan: SeatingPlanGroupDto, name: string, examSubjectIds: string[]) =>
      run(
        () => operations.updatePlanSubjects(plan, name, examSubjectIds),
        plan.allocatedStudents > 0
          ? 'Plan subjects updated. Previous seat assignments were cleared for a clean rebuild.'
          : 'Plan subjects updated.'
      ),
    deletePlan: (plan: SeatingPlanGroupDto) =>
      run(() => operations.deletePlan(plan.seatingPlanId), 'Draft seating plan deleted.'),
    resetDraft: (reason: string) =>
      run(
        () => operations.resetDraft(reason),
        'The draft was reset. You can regroup every subject and build the seating again.'
      ),
  };
}
