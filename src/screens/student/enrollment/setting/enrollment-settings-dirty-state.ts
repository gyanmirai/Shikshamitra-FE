'use client';

import { useRef, useEffect } from 'react';

export const enrollmentSettingsDirtyEvent = 'admissions-settings-dirty';
export const enrollmentSettingsDiscardEvent = 'admissions-settings-discard';

export type EnrollmentSettingsDirtyEventDetail = {
  source: string;
  dirty: boolean;
};

export const updateEnrollmentSettingsDirtySources = (
  sources: Set<string>,
  detail: EnrollmentSettingsDirtyEventDetail
) => {
  if (detail.dirty) sources.add(detail.source);
  else sources.delete(detail.source);
  return sources.size > 0;
};

type Options = {
  source: string;
  dirty: boolean;
  onDiscard?: () => void;
};

export const dispatchEnrollmentSettingsDirtyState = (source: string, dirty: boolean) => {
  window.dispatchEvent(
    new CustomEvent<EnrollmentSettingsDirtyEventDetail>(enrollmentSettingsDirtyEvent, {
      detail: { source, dirty },
    })
  );
};

export const useEnrollmentSettingsDirtyState = ({ source, dirty, onDiscard }: Options) => {
  const onDiscardRef = useRef(onDiscard);

  useEffect(() => {
    onDiscardRef.current = onDiscard;
  }, [onDiscard]);

  useEffect(() => {
    dispatchEnrollmentSettingsDirtyState(source, dirty);
    return () => dispatchEnrollmentSettingsDirtyState(source, false);
  }, [dirty, source]);

  useEffect(() => {
    const handleDiscard = () => onDiscardRef.current?.();
    window.addEventListener(enrollmentSettingsDiscardEvent, handleDiscard);
    return () => window.removeEventListener(enrollmentSettingsDiscardEvent, handleDiscard);
  }, []);
};
