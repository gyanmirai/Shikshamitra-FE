import type {
  SeatingPlanGroupDto,
  SeatingPlanWorkspaceDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import * as Yup from 'yup';

import type { GuidedSeatingValues, GuidedWorkflowPermissions } from './types';

export const GUIDED_SEATING_STEPS = ['Plan subjects', 'Configure', 'Review plan', 'Publish exam'];

export const DEFAULT_RULES = {
  strategy: 'roll-number' as const,
  fillDirection: 'front-to-back' as const,
  leaveGap: false,
  mixDivisions: true,
  specialRequirementPriority: true,
};

export function getStepFromQuery(value: string | null): number {
  const requested = Number(value ?? 0);
  if (!Number.isInteger(requested)) return 0;
  return Math.min(Math.max(requested, 0), GUIDED_SEATING_STEPS.length - 1);
}

export function buildWorkflowUrl(
  pathname: string,
  currentQuery: string,
  step: number,
  planId?: string | null
): string {
  const params = new URLSearchParams(currentQuery);
  params.set('step', String(step));
  params.delete('session');
  if (planId) params.set('planId', planId);
  else params.delete('planId');
  return `${pathname}?${params.toString()}`;
}

export function getNextLabel(
  activeStep: number,
  hasPreview: boolean,
  hasValidation: boolean,
  hasPlan: boolean,
  isPublished: boolean,
  allocationMode: GuidedSeatingValues['allocationMode'] = 'automatic',
  isExaminationReady = false
): string {
  if (activeStep === 0 && isPublished) return 'View publication receipt';
  if (activeStep === 0 && isExaminationReady) return 'Review examination & publish';
  if (activeStep === 0) return hasPlan ? 'Edit selected plan' : 'Create seating plan';
  if (activeStep === 1)
    return allocationMode === 'manual' ? 'Review manual seating' : 'Generate seating preview';
  if (activeStep === 2 && !hasPreview) return 'Generate preview';
  if (activeStep === 2 && !hasValidation) return 'Apply seating & validate';
  if (activeStep === 2) return 'Save plan & return to list';
  return isPublished ? 'Back to seating plans' : 'Publish examination seating';
}

export function shouldConfirmAutomaticReallocation(
  activeStep: number,
  allocationMode: GuidedSeatingValues['allocationMode'],
  allocatedStudents: number
): boolean {
  return activeStep === 1 && allocationMode === 'automatic' && allocatedStudents > 0;
}

export function getInitialPlan(
  workspace: SeatingPlanWorkspaceDto,
  requestedPlanId?: string
): SeatingPlanGroupDto | undefined {
  return workspace.plans.find((plan) => plan.seatingPlanId === requestedPlanId);
}

export function getInitialValues(plan?: SeatingPlanGroupDto): GuidedSeatingValues {
  return {
    selectedPlanId: plan?.seatingPlanId ?? '',
    planName: '',
    selectedExamSubjectIds: [],
    selectedRoomIds: plan?.selectedRoomIds ?? [],
    allocationMode: 'automatic',
    ...DEFAULT_RULES,
    acknowledgeWarnings: false,
    notifyStudents: false,
    notifyParents: false,
  };
}

export function getWorkflowValidationSchema(activeStep: number) {
  return Yup.object({
    selectedPlanId: Yup.string(),
    planName: Yup.string().max(128, 'Use 128 characters or fewer.'),
    selectedExamSubjectIds: Yup.array().of(Yup.string().required()),
    selectedRoomIds:
      activeStep === 1
        ? Yup.array().of(Yup.string().required()).min(1, 'Choose at least one room.')
        : Yup.array().of(Yup.string().required()),
  });
}

export function getNextDisabled(args: {
  activeStep: number;
  isBusy: boolean;
  workspace: SeatingPlanWorkspaceDto;
  plan?: SeatingPlanGroupDto;
  selectedExamSubjectIds: string[];
  seatingPlanId?: string;
  selectedRoomIds: string[];
  hasUnallocatedPreview: boolean;
  previewAssignmentCount: number;
  permissions: GuidedWorkflowPermissions;
  isLocked: boolean;
  isPublished: boolean;
  hasPreview: boolean;
  validationIsValid?: boolean;
  warningCount: number;
  warningsAcknowledged: boolean;
  allocationMode?: GuidedSeatingValues['allocationMode'];
}): boolean {
  const capacity =
    args.plan?.availableRooms
      .filter((room) => args.selectedRoomIds.includes(room.roomId))
      .reduce((total, room) => total + room.usableCapacity, 0) ?? 0;
  return (
    args.isBusy ||
    (args.activeStep === 0 &&
      !args.isPublished &&
      !args.plan &&
      !args.workspace.readiness.isReadyToPublish &&
      (args.selectedExamSubjectIds.length === 0 || !args.permissions.canAdd)) ||
    (args.activeStep === 1 &&
      (!args.permissions.canAdd ||
        !args.seatingPlanId ||
        capacity < (args.plan?.totalStudents ?? 0) ||
        (args.allocationMode === 'manual' && (!args.hasPreview || args.hasUnallocatedPreview)))) ||
    (args.activeStep === 2 &&
      args.allocationMode !== 'manual' &&
      !args.permissions.canAutoAllocate) ||
    (args.activeStep === 2 && args.hasUnallocatedPreview) ||
    (args.activeStep === 2 && args.hasPreview && args.previewAssignmentCount === 0) ||
    (args.activeStep === 2 && args.hasPreview && args.validationIsValid === false) ||
    (args.activeStep === 3 &&
      !args.isPublished &&
      (!args.workspace.readiness.isReadyToPublish ||
        !args.permissions.canPublish ||
        (args.warningCount > 0 && !args.warningsAcknowledged)))
  );
}
