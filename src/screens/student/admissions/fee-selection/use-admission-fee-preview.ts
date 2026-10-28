import type { AdmissionVariableFeeHead } from 'src/redux/student/admissions/admission-fee-collection-types';

import { useState, useEffect } from 'react';
import { toDateOnly } from 'src/utils/date-only';
import { usePreviewAdmissionJoiningDateQuery } from 'src/redux/student/admissions/admission-joining-date-api';

/** The response must belong to the exact current draft; prices never survive an input change. */
export function useAdmissionFeePreview(
  input: {
    applicationId: string;
    joiningDate: string;
    variableFeeHeads: AdmissionVariableFeeHead[];
  },
  enabled: boolean
) {
  const key = JSON.stringify(input);
  const [settledKey, setSettledKey] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSettledKey(key), 350);
    return () => clearTimeout(timer);
  }, [key]);
  const skip = !enabled || settledKey !== key;
  const query = usePreviewAdmissionJoiningDateQuery(input, { skip });
  const result =
    !skip &&
    !query.isFetching &&
    !query.isError &&
    toDateOnly(query.currentData?.joiningDate) === input.joiningDate
      ? query.currentData
      : undefined;
  const failed = !skip && query.isError;
  return { query, result, failed, pending: enabled && !failed && !result, ready: Boolean(result) };
}
