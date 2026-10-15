import type { TenantDetails } from '../host-tenants/types';

export type SetupProfile = Required<{ [K in keyof TenantDetails]: NonNullable<TenantDetails[K]> }>;
export type SetupDraft = {
  profile: SetupProfile;
  yearName: string;
  existingYearId?: string | null;
  startDate: string | null;
  endDate: string | null;
  boardType: number | null;
  customBoardName: string;
  medium: string;
  stage: string;
  className: string;
  ageLowerLimit: number | null;
  divisionName: string;
  strength: number | null;
};
export type SetupUser = { requestId: string; id: string; userName: string; email: string };
export type InitialSetup = {
  isCompleted: boolean;
  canManageSetup: boolean;
  currentStep: number;
  furthestStep: number;
  schoolCode: string;
  concurrencyStamp: string;
  academicYearId: string | null;
  divisionId: string | null;
  completedAt: string | null;
  draft: SetupDraft;
  createdUsers: SetupUser[];
  pendingSteps?: number[];
};
export type SetupAction =
  'draft' | 'profile' | 'academic-year' | 'structure' | 'advance' | 'complete' | 'users';
