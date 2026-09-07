import type { FormikProps } from 'formik';
import type {
  SeatingPlanGroupDto,
  SeatingValidationDto,
  SeatingPlanWorkspaceDto,
  GuidedAllocationPreviewDto,
  ExaminationSeatingReadinessDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

export type AllocationStrategy = 'roll-number' | 'alphabetical' | 'random' | 'alternate-division';

export type FillDirection = 'front-to-back' | 'back-to-front' | 'row-wise' | 'column-wise';

export type AllocationMode = 'automatic' | 'manual';

export interface GuidedSeatingValues {
  selectedPlanId: string;
  planName: string;
  selectedExamSubjectIds: string[];
  selectedRoomIds: string[];
  allocationMode: AllocationMode;
  strategy: AllocationStrategy;
  fillDirection: FillDirection;
  leaveGap: boolean;
  mixDivisions: boolean;
  specialRequirementPriority: boolean;
  acknowledgeWarnings: boolean;
  notifyStudents: boolean;
  notifyParents: boolean;
}

export interface GuidedWorkflowPermissions {
  canAdd: boolean;
  canAutoAllocate: boolean;
  canFinalize: boolean;
  canPublish: boolean;
  canDelete: boolean;
}

export interface GuidedWorkflowState {
  activeStep: number;
  formik: FormikProps<GuidedSeatingValues>;
  selectedPlan?: SeatingPlanGroupDto;
  seatingPlanId?: string;
  preview?: GuidedAllocationPreviewDto;
  validation?: SeatingValidationDto;
  readiness: ExaminationSeatingReadinessDto;
  publication?: SeatingPlanWorkspaceDto;
  isPublished: boolean;
  isBusy: boolean;
  permissions: GuidedWorkflowPermissions;
  nextLabel: string;
  nextDisabled: boolean;
  handleNext: (setLoading: (value: boolean) => void) => Promise<void>;
  handleBack: () => void;
  openStep: (step: number) => void;
  openPlan: (plan: SeatingPlanGroupDto) => void;
  startNewPlan: () => void;
  updatePlanSubjects: (
    plan: SeatingPlanGroupDto,
    name: string,
    examSubjectIds: string[]
  ) => Promise<void>;
  deletePlan: (plan: SeatingPlanGroupDto) => Promise<void>;
  resetDraft: (reason: string) => Promise<void>;
  resetPreview: () => void;
  setManualPreview: (preview?: GuidedAllocationPreviewDto) => void;
}

export interface GuidedStepProps {
  workspace: SeatingPlanWorkspaceDto;
  workflow: GuidedWorkflowState;
}
