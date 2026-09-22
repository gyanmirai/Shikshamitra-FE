import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { financePermissions } from 'src/constants/finance-menu';
import { hasGrantedPermission } from 'src/utils/permissions';

export function useChargePermissions() {
	const { permissions, permissionsInitialized, loading } = useSelector(
		(state: RootState) => state.auth
	);
	const action = financePermissions.fees.chargeActions;
	return {
		isReady: permissionsInitialized && !loading,
		canView: hasGrantedPermission(permissions, action.view),
		canAdd: hasGrantedPermission(permissions, action.add),
		canEdit: hasGrantedPermission(permissions, action.edit),
		canDelete: hasGrantedPermission(permissions, action.delete),
		canApprove: hasGrantedPermission(permissions, action.approve),
		canReject: hasGrantedPermission(permissions, action.reject),
		canVoid: hasGrantedPermission(permissions, action.void),
		canExport: hasGrantedPermission(permissions, action.export),
		canViewAudit: hasGrantedPermission(permissions, action.viewAudit),
	};
}
