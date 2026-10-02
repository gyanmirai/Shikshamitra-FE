import type { SeatingPlanWorkspaceDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { shikshaMitraToast } from 'src/components/toast';

import type { GuidedWorkflowState } from './types';
import type { useGuidedSeatingOperations } from './use-guided-seating-operations';

export type GuidedSeatingNextContext = Pick<
  GuidedWorkflowState,
  'activeStep' | 'formik' | 'selectedPlan' | 'seatingPlanId' | 'readiness' | 'isPublished'
> & {
  workspace: SeatingPlanWorkspaceDto;
  operations: ReturnType<typeof useGuidedSeatingOperations>;
  manualPreviousRoomIds: { current: string[] };
  navigate: (step: number, planId?: string | null) => void;
  onComplete: () => void;
};

export function createGuidedSeatingNext({
  activeStep,
  formik,
  selectedPlan,
  seatingPlanId,
  readiness,
  isPublished,
  workspace,
  operations,
  manualPreviousRoomIds,
  navigate,
  onComplete,
}: GuidedSeatingNextContext) {
  return async (setLoading: (value: boolean) => void) => {
    setLoading(true);
    try {
      if (activeStep === 0) {
        if (isPublished) {
          navigate(3, null);
          return;
        }
        if (readiness.isReadyToPublish) {
          const latestReadiness = await operations.runExaminationValidation();
          if (latestReadiness.isReadyToPublish) navigate(3, null);
          else
            shikshaMitraToast.error({
              message: 'Review the new blocking issues before publishing the examination.',
            });
          return;
        }
        const planId =
          seatingPlanId ??
          (await operations.preparePlan(
            formik.values.selectedExamSubjectIds,
            formik.values.planName
          ));
        navigate(1, planId);
      }
      if (activeStep === 1 && seatingPlanId) {
        if (formik.values.allocationMode === 'manual') {
          manualPreviousRoomIds.current = selectedPlan?.selectedRoomIds ?? [];
        }
        await operations.saveRooms(seatingPlanId, formik.values, workspace.version);
        if (formik.values.allocationMode === 'automatic') {
          await operations.generatePreview(seatingPlanId, formik.values);
        }
        formik.setFieldValue('acknowledgeWarnings', false);
        navigate(2);
      }
      if (activeStep === 2 && seatingPlanId && !operations.preview) {
        await operations.generatePreview(seatingPlanId, formik.values);
      } else if (
        activeStep === 2 &&
        seatingPlanId &&
        operations.preview &&
        !operations.validation
      ) {
        if (formik.values.allocationMode === 'manual') {
          await operations.applyManualPreview(
            seatingPlanId,
            formik.values,
            manualPreviousRoomIds.current,
            operations.version ?? workspace.version
          );
        } else {
          await operations.applyPreview(
            seatingPlanId,
            formik.values,
            operations.version ?? workspace.version
          );
        }
        await operations.runValidation(seatingPlanId);
        formik.setFieldValue('acknowledgeWarnings', false);
      } else if (activeStep === 2 && operations.validation?.isValid) {
        await operations.runExaminationValidation();
        shikshaMitraToast.success({ message: 'Seating plan saved.' });
        onComplete();
      }
      if (activeStep === 3) {
        if (isPublished) {
          onComplete();
          return;
        }
        const published = await operations.publish(formik.values);
        if (!published) {
          shikshaMitraToast.error({
            message:
              'Every subject and plan must be ready before the examination can be published.',
          });
        } else {
          shikshaMitraToast.success({
            message: 'All examination seating plans were published and locked together.',
          });
          onComplete();
        }
      }
    } catch (error) {
      operations.showError(error);
    } finally {
      setLoading(false);
    }
  };
}
