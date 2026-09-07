import type {
  SeatingPlanGroupDto,
  SeatingPlanWorkspaceDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { useRef } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { useGuidedSeatingOperations } from './use-guided-seating-operations';
import { useGuidedSeatingPermissions } from './use-guided-seating-permissions';
import {
  getNextLabel,
  getInitialPlan,
  getNextDisabled,
  getStepFromQuery,
  buildWorkflowUrl,
  getInitialValues,
  getWorkflowValidationSchema,
} from './workflow-config';

import type { GuidedSeatingValues, GuidedWorkflowState } from './types';

export function useGuidedSeatingWorkflow(workspace: SeatingPlanWorkspaceDto): GuidedWorkflowState {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeStep = getStepFromQuery(searchParams.get('step'));
  const requestedPlanId = searchParams.get('planId') ?? undefined;
  const initialPlan = getInitialPlan(workspace, requestedPlanId);
  const operations = useGuidedSeatingOperations(workspace.examId);
  const permissions = useGuidedSeatingPermissions();
  const manualPreviousRoomIds = useRef(initialPlan?.selectedRoomIds ?? []);

  const formik = useFormik<GuidedSeatingValues>({
    initialValues: getInitialValues(initialPlan),
    validationSchema: getWorkflowValidationSchema(activeStep),
    onSubmit: () => undefined,
  });

  const selectedPlan = workspace.plans.find(
    (plan) => plan.seatingPlanId === formik.values.selectedPlanId
  );
  const seatingPlanId = selectedPlan?.seatingPlanId;
  const readiness =
    operations.examinationReadiness ?? operations.publication?.readiness ?? workspace.readiness;
  const effectiveWorkspace =
    readiness === workspace.readiness ? workspace : { ...workspace, readiness };
  const isPublished = operations.isPublished || readiness.isPublished;

  const navigate = (step: number, planId: string | null = seatingPlanId ?? null) => {
    router.replace(buildWorkflowUrl(pathname, searchParams.toString(), step, planId), {
      scroll: false,
    });
  };

  const openPlan = (plan: SeatingPlanGroupDto) => {
    manualPreviousRoomIds.current = plan.selectedRoomIds;
    formik.setFieldValue('selectedPlanId', plan.seatingPlanId);
    formik.setFieldValue('selectedExamSubjectIds', []);
    formik.setFieldValue('selectedRoomIds', plan.selectedRoomIds);
    formik.setFieldValue('acknowledgeWarnings', false);
    operations.resetPreview();
    navigate(1, plan.seatingPlanId);
  };

  const startNewPlan = () => {
    manualPreviousRoomIds.current = [];
    formik.setFieldValue('selectedPlanId', '');
    formik.setFieldValue('selectedExamSubjectIds', []);
    formik.setFieldValue('planName', '');
    formik.setFieldValue('selectedRoomIds', []);
    formik.setFieldValue('acknowledgeWarnings', false);
    operations.resetPreview();
    navigate(0, null);
  };

  const updatePlanSubjects = async (
    plan: SeatingPlanGroupDto,
    name: string,
    examSubjectIds: string[]
  ) => {
    try {
      await operations.updatePlanSubjects(plan, name, examSubjectIds);
      startNewPlan();
      shikshaMitraToast.success({
        message:
          plan.allocatedStudents > 0
            ? 'Plan subjects updated. Previous seat assignments were cleared for a clean rebuild.'
            : 'Plan subjects updated.',
      });
    } catch (error) {
      operations.showError(error);
      throw error;
    }
  };

  const deletePlan = async (plan: SeatingPlanGroupDto) => {
    try {
      await operations.deletePlan(plan.seatingPlanId);
      startNewPlan();
      shikshaMitraToast.success({ message: 'Draft seating plan deleted.' });
    } catch (error) {
      operations.showError(error);
      throw error;
    }
  };

  const resetDraft = async (reason: string) => {
    try {
      await operations.resetDraft(reason);
      startNewPlan();
      shikshaMitraToast.success({
        message: 'The draft was reset. You can regroup every subject and build the seating again.',
      });
    } catch (error) {
      operations.showError(error);
      throw error;
    }
  };

  const handleNext = async (setLoading: (value: boolean) => void) => {
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
        startNewPlan();
      }
      if (activeStep === 3) {
        if (isPublished) {
          router.push('/academic/seatallocation');
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
        }
      }
    } catch (error) {
      operations.showError(error);
    } finally {
      setLoading(false);
    }
  };

  const nextDisabled = getNextDisabled({
    activeStep,
    isBusy: operations.isBusy,
    workspace: effectiveWorkspace,
    plan: selectedPlan,
    selectedExamSubjectIds: formik.values.selectedExamSubjectIds,
    seatingPlanId,
    selectedRoomIds: formik.values.selectedRoomIds,
    hasUnallocatedPreview: Boolean(operations.preview?.unallocatedStudentIds.length),
    previewAssignmentCount: operations.preview?.assignments.length ?? 0,
    permissions,
    isLocked: Boolean(selectedPlan?.isLocked),
    isPublished,
    hasPreview: Boolean(operations.preview),
    validationIsValid: operations.validation?.isValid,
    warningCount: readiness.warnings.length,
    warningsAcknowledged: formik.values.acknowledgeWarnings,
    allocationMode: formik.values.allocationMode,
  });

  return {
    activeStep,
    formik,
    selectedPlan,
    seatingPlanId,
    preview: operations.preview,
    validation: operations.validation,
    readiness,
    publication: operations.publication,
    isPublished,
    isBusy: operations.isBusy,
    permissions,
    nextLabel: getNextLabel(
      activeStep,
      Boolean(operations.preview),
      Boolean(operations.validation),
      Boolean(seatingPlanId),
      isPublished,
      formik.values.allocationMode,
      readiness.isReadyToPublish
    ),
    nextDisabled,
    handleNext,
    handleBack: () => navigate(Math.max(0, activeStep - 1)),
    openStep: (step) => navigate(step),
    openPlan,
    startNewPlan,
    updatePlanSubjects,
    deletePlan,
    resetDraft,
    resetPreview: operations.resetPreview,
    setManualPreview: operations.setManualPreview,
  };
}
