import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { libraryPermissions } from 'src/constants/library-menus';

export function useLibraryFinanceAccess() {
  const { permissions, permissionsInitialized, loading } = useSelector(
    (state: RootState) => state.auth
  );
  const ready = permissionsInitialized && !loading;
  const source = ready && hasGrantedPermission(permissions, libraryPermissions.charges);
  const granted = (name: string) => source && hasGrantedPermission(permissions, name);
  const charges = financePermissions.fees.chargeActions;
  const refunds = financePermissions.fees.refundActions;
  return {
    ready,
    source,
    view: granted(charges.view),
    post: granted(charges.add),
    bind: granted(charges.edit),
    approve: granted(charges.approve),
    collectionView: granted(`${financePermissions.fees.collections}.View`),
    collect: granted(`${financePermissions.fees.collections}.Add`),
    receipt: granted(`${financePermissions.fees.invoicesAndReceipts}.View`),
    waiverApply: granted(financePermissions.fees.collectionActions.applyWaiver),
    waiverApprove: granted(`${financePermissions.fees.collections}.ApproveWaiver`),
    waiverReject: granted(`${financePermissions.fees.collections}.RejectWaiver`),
    waiverReverse: granted(`${financePermissions.fees.collections}.ReverseWaiver`),
    refundView: granted(refunds.view),
    refundAdd: granted(refunds.add),
    refundApprove: granted(refunds.approve),
    refundReject: granted(refunds.reject),
    refundProcess: granted(refunds.process),
    refundReverse: granted(refunds.reverse),
  };
}
