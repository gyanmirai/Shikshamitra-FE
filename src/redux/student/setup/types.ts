export interface StudentSetupVisitStatus {
  hasVisitedConfiguration: boolean;
  canAccessSetup: boolean;
  firstVisitedAt: string | null;
}

export interface StudentSetupVisitResult {
  firstVisit: boolean;
  hasVisitedConfiguration: boolean;
  firstVisitedAt: string | null;
}

export interface StudentSetupSettingStatus {
  key: string;
  canView: boolean;
  canManage: boolean;
  configurationState: 'configured' | 'empty' | 'context-required' | 'unavailable';
  configurationSource?: 'school-default' | 'school' | 'academic-year' | null;
}

export interface StudentSetupState {
  academicYearId: string;
  concurrencyStamp: string;
  currentStageKey: string;
  currentSettingKey: string | null;
  deferredSettingKeys: string[];
  reviewedAt: string | null;
  settings: StudentSetupSettingStatus[];
}

export interface StudentSetupScope {
  tenantCacheKey: string;
  academicYearId: string;
  academicMediumId?: string;
  standardId?: string;
}

export interface StudentSetupProgress {
  concurrencyStamp: string;
  currentStageKey: string;
  currentSettingKey: string | null;
  deferredSettingKeys: string[];
  finishReview: boolean;
  academicMediumId?: string;
  standardId?: string;
}
