import type { GuidedAllocationPreviewDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { useRef, useState, useCallback } from 'react';
import { usePreviewGuidedSeatAllocationMutation } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/guided-seat-allocationApi';

import { buildPreviewPayload } from '../guided-payloads';

import type { GuidedSeatingValues } from '../types';

export function getAutomaticPreviewKey(planId: string, values: GuidedSeatingValues) {
  return JSON.stringify(buildPreviewPayload(planId, values));
}

export function useGuidedSeatingPreview(examId: string) {
  const [preview, setPreview] = useState<GuidedAllocationPreviewDto>();
  const [previewKey, setPreviewKey] = useState('');
  const [request, requestState] = usePreviewGuidedSeatAllocationMutation();
  const generation = useRef(0);
  const cache = useRef<{ key: string; result: GuidedAllocationPreviewDto } | undefined>(undefined);
  const pending = useRef<{ key: string; promise: Promise<GuidedAllocationPreviewDto> } | undefined>(
    undefined
  );

  /** Memoization Justification: the configure preview effect depends on this function;
   * keeping it stable prevents a new request timer on every Formik render. */
  const generatePreview = useCallback(
    (planId: string, values: GuidedSeatingValues) => {
      const key = getAutomaticPreviewKey(planId, values);
      if (cache.current?.key === key) return Promise.resolve(cache.current.result);
      if (pending.current?.key === key) return pending.current.promise;
      generation.current += 1;
      const currentGeneration = generation.current;
      const promise = request({ examId, body: buildPreviewPayload(planId, values) })
        .unwrap()
        .then((result) => {
          if (generation.current === currentGeneration) {
            cache.current = { key, result };
            setPreview(result);
            setPreviewKey(key);
          }
          return result;
        })
        .finally(() => {
          if (generation.current === currentGeneration) pending.current = undefined;
        });
      pending.current = { key, promise };
      return promise;
    },
    [examId, request]
  );

  /** Memoization Justification: configure uses this reset in its request effect;
   * stable identity avoids restarting the effect on unrelated workflow renders. */
  const setManualPreview = useCallback((value?: GuidedAllocationPreviewDto) => {
    generation.current += 1;
    cache.current = undefined;
    pending.current = undefined;
    setPreviewKey('');
    setPreview(value);
  }, []);

  return {
    preview,
    previewKey,
    generatePreview,
    setManualPreview,
    isLoading: requestState.isLoading,
  };
}
