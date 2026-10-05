import { useRef, useState, useEffect } from 'react';

import { getWorkflowErrorMessage } from '../workflow-errors';
import { getAutomaticPreviewKey } from './use-guided-seating-preview';

import type { GuidedWorkflowState } from '../types';

export function useAutomaticSeatingPreview(workflow: GuidedWorkflowState) {
  const { seatingPlanId, generatePreview, previewKey, permissions, selectedPlan } = workflow;
  const { values } = workflow.formik;
  const key = seatingPlanId ? getAutomaticPreviewKey(seatingPlanId, values) : '';
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const [failure, setFailure] = useState({ key: '', message: '' });
  const [attempt, setAttempt] = useState(0);
  const enabled = Boolean(
    seatingPlanId &&
    values.selectedRoomIds.length &&
    permissions.canAutoAllocate &&
    !selectedPlan?.isLocked
  );

  useEffect(() => {
    if (!enabled || !seatingPlanId || previewKey === key) return undefined;
    let isCurrent = true;
    const timer = setTimeout(() => {
      generatePreview(seatingPlanId, valuesRef.current).catch((error: unknown) => {
        if (isCurrent) setFailure({ key, message: getWorkflowErrorMessage(error) });
      });
    }, 300);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [attempt, enabled, generatePreview, key, previewKey, seatingPlanId]);

  return {
    enabled,
    preview: previewKey === key ? workflow.preview : undefined,
    error: failure.key === key ? failure.message : '',
    retry: () => {
      setFailure({ key: '', message: '' });
      setAttempt((current) => current + 1);
    },
  };
}
