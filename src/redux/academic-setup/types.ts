export interface AcademicSetupVisitStatus {
  hasVisitedConfiguration: boolean;
  canAccessSetup: boolean;
  firstVisitedAt: string | null;
}

export interface AcademicSetupVisitResult {
  firstVisit: boolean;
  hasVisitedConfiguration: boolean;
  firstVisitedAt: string | null;
}

export interface AcademicSetupSettingStatus {
  key: string;
  canView: boolean;
  canManage: boolean;
  configurationState: 'configured' | 'empty' | 'context-required' | 'unavailable';
}

export interface AcademicSetupState {
  academicYearId: string;
  concurrencyStamp: string;
  currentStageKey: string;
  currentSettingKey: string | null;
  deferredSettingKeys: string[];
  reviewedAt: string | null;
  settings: AcademicSetupSettingStatus[];
}

export interface AcademicSetupScope {
  tenantCacheKey: string;
  academicYearId: string;
  academicMediumId?: string;
  standardId?: string;
}

export interface AcademicSetupProgress {
  concurrencyStamp: string;
  currentStageKey: string;
  currentSettingKey: string | null;
  deferredSettingKeys: string[];
  finishReview: boolean;
  academicMediumId?: string;
  standardId?: string;
}
