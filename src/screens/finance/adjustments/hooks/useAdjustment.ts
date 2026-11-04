import type { RootState } from 'src/redux/store';
import { useSelector } from 'react-redux';
import { financePermissions } from 'src/constants/finance-menu';
import {
  useCreateFeeAdjustmentMutation,
  useRejectFeeAdjustmentMutation,
} from 'src/redux/finance/adjustments/adjustmentApi';
import type { IAdjustmentFullFormValues } from '../types/adjustmentFormValues';
import { buildAdjustmentApiPayload } from '../types/adjustmentFormValues';
import { useFinancePermissions } from '../../hooks/useFinancePermissions';

/** Writes invalidate the owning list/detail tags; the visible worklist owns its scoped counts. */
export function useAdjustment() {
  const access = useFinancePermissions(financePermissions.fees.adjustment);
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const [createFeeAdjustment, createState] = useCreateFeeAdjustmentMutation();
  const [rejectFeeAdjustment, rejectState] = useRejectFeeAdjustmentMutation();
  const createAdjustment = async (values: IAdjustmentFullFormValues) => {
    if (!access.canAdd) throw new Error('You do not have permission to create adjustments.');
    if (!currentYear?.id) throw new Error('Academic year is required.');
    return await createFeeAdjustment({
      academicYearId: currentYear.id,
      body: buildAdjustmentApiPayload(values),
    }).unwrap();
  };
  const rejectAdjustment = async (id: string, _rejectedBy: string, rejectionReason: string) => {
    if (!access.canAdd) throw new Error('You do not have permission to reject adjustments.');
    await rejectFeeAdjustment({ id, body: { message: rejectionReason } }).unwrap();
  };
  return {
    createAdjustment,
    rejectAdjustment,
    isCreating: createState.isLoading,
    isRejecting: rejectState.isLoading,
  };
}
