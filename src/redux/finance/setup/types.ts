export interface FinanceSetupSettingStatus {
  key: string;
  canView: boolean;
  canManage: boolean;
  configurationState: 'configured' | 'empty' | 'unavailable';
}

export interface FinanceSetupState {
  academicYearId: string;
  concurrencyStamp: string;
  currentStageKey: string;
  currentSettingKey: string | null;
  deferredSettingKeys: string[];
  reviewedAt: string | null;
  settings: FinanceSetupSettingStatus[];
}

export interface FinanceSetupScope {
  tenantCacheKey: string;
  academicYearId: string;
}

export interface FinanceSetupProgress {
  concurrencyStamp: string;
  currentStageKey: string;
  currentSettingKey: string | null;
  deferredSettingKeys: string[];
  finishReview: boolean;
}
