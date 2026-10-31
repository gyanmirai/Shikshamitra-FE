import { useRef, useState, useEffect, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { concessionBenefitBlockerMessage } from 'src/utils/concession-benefit-blocker';
import { useLazyGetConcessionApprovalContextQuery } from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import { concessionErrorMessage } from '../Concession/Components/concessionValueValidation';

/** Check current server eligibility before opening either approval surface. */
export function useConcessionApprovalPreflight() {
  const [loadContext] = useLazyGetConcessionApprovalContextQuery();
  const [checkingRequestId, setCheckingRequestId] = useState<string | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const checkApprovalEligibility = useCallback(
    async (requestId: string) => {
      if (!requestId || inFlight.current || !mounted.current) return false;
      inFlight.current = true;
      setCheckingRequestId(requestId);
      try {
        // Bypass a previously eligible cached result after another request was approved.
        const context = await loadContext(requestId, false).unwrap();
        if (!mounted.current) return false;
        const blockerMessage = concessionBenefitBlockerMessage(context.benefitBlocker);
        if (blockerMessage) {
          shikshaMitraToast.error({ message: blockerMessage });
          return false;
        }
        return true;
      } catch (error) {
        if (mounted.current) {
          shikshaMitraToast.error({
            message: concessionErrorMessage(
              error,
              'Could not check approval eligibility. Try again.'
            ),
          });
        }
        return false;
      } finally {
        inFlight.current = false;
        if (mounted.current) setCheckingRequestId(null);
      }
    },
    [loadContext]
  );

  return {
    checkApprovalEligibility,
    checkingRequestId,
    isCheckingApproval: checkingRequestId !== null,
  };
}
