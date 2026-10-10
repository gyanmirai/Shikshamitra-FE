import { useEffect } from 'react';

export type ApplicationStageReadiness = {
  stageId: string;
  canComplete: boolean;
  busy: boolean;
  dirty?: boolean;
  concurrencyStamp?: string;
};

export type ApplicationStageReadinessHandler = (state: ApplicationStageReadiness) => void;

export function useApplicationStageReadiness(
  onChange: ApplicationStageReadinessHandler | undefined,
  { stageId, canComplete, busy, concurrencyStamp, dirty }: ApplicationStageReadiness
) {
  useEffect(() => {
    onChange?.({ stageId, canComplete, busy, concurrencyStamp, ...(dirty ? { dirty: true } : {}) });
  }, [onChange, stageId, canComplete, busy, concurrencyStamp, dirty]);
}
