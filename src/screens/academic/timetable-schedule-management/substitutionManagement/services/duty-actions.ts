import type { AppDispatch } from 'src/redux/store';
import type { ApiSubstitutionRow } from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { substitutionManagementApi } from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

export type DutyAction = 'accept' | 'reject' | 'change';
export type DutyActionPayload = { id: string; action: DutyAction };
export const DUTY_ACTION_REASON_MIN_LENGTH = 5;

export const resolveDutyActionErrorMessage = (
  error: unknown,
  fallback = 'Unable to update duty.'
) => {
  const apiError = error as { status?: unknown; message?: unknown };
  const message = typeof apiError?.message === 'string' ? apiError.message : '';
  if (
    apiError?.status === 'FETCH_ERROR' ||
    /failed to fetch|networkerror|network error/i.test(message)
  ) {
    return 'Unable to reach the server. Please check your connection and try again.';
  }
  return parseApiProblemDetail(error).detail || fallback;
};

// Apply the confirmed response before releasing the submit lock. A slow or failed
// background refresh must not expose the previous actionable duty again.
export const applyDutyResponse = (dispatch: AppDispatch, updated: ApiSubstitutionRow) => {
  dispatch((innerDispatch, getState) => {
    (['getMySubstitutionDuties', 'getSubstitutions'] as const).forEach((endpoint) => {
      const cachedArgs = substitutionManagementApi.util.selectCachedArgsForQuery(
        getState(),
        endpoint
      );
      cachedArgs.forEach((args) => {
        innerDispatch(
          substitutionManagementApi.util.updateQueryData(endpoint, args, (draft) => {
            const row = draft.items.find((item) => item.id === updated.id);
            if (row) Object.assign(row, updated);
          })
        );
      });
    });
  });
};
