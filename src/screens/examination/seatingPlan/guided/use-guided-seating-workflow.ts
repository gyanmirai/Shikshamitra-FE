import type { SeatingPlanWorkspaceDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { useRef } from 'react';
import { useFormik } from 'formik';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { createGuidedSeatingNext } from './workflow-next';
import { createWorkflowNavigation } from './workflow-navigation';
import { createGuidedPlanActions } from './workflow-plan-actions';
import { buildSeatingPlanListUrl } from '../utils/seating-plan-navigation';
import { getAutomaticPreviewKey } from './hooks/use-guided-seating-preview';
import { useGuidedSeatingOperations } from './use-guided-seating-operations';
import { useGuidedSeatingPermissions } from './use-guided-seating-permissions';
import {
  getNextLabel,
  getInitialPlan,
  getNextDisabled,
  getStepFromQuery,
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

  const { navigate, openPlan, startNewPlan } = createWorkflowNavigation({
    pathname,
    query: searchParams.toString(),
    seatingPlanId,
    formik,
    manualPreviousRoomIds,
    resetPreview: operations.resetPreview,
  });

  const planActions = createGuidedPlanActions(operations, startNewPlan);
  const handleNext = createGuidedSeatingNext({
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
    onComplete: () =>
      router.replace(
        buildSeatingPlanListUrl(
          searchParams.get('standardId') ?? workspace.standardId,
          searchParams.get('status')
        )
      ),
  });
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
    nextDisabled:
      nextDisabled ||
      (activeStep === 1 &&
        formik.values.allocationMode === 'automatic' &&
        seatingPlanId !== undefined &&
        operations.previewKey !== getAutomaticPreviewKey(seatingPlanId, formik.values)),
    handleNext,
    handleBack: () => navigate(Math.max(0, activeStep - 1)),
    openStep: (step) => navigate(step),
    openPlan,
    startNewPlan,
    ...planActions,
    resetPreview: operations.resetPreview,
    generatePreview: operations.generatePreview,
    previewKey: operations.previewKey,
    setManualPreview: operations.setManualPreview,
  };
}
