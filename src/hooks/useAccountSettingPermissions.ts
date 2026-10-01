import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';

type AccountSetting = 'AccountHead' | 'IncomeCategory' | 'ExpenseCategory' | 'BankAccount' | 'PostingSetup';

export function useAccountSettingPermissions(setting: AccountSetting) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const base = `Finance.Accounts.Settings.${setting}`;
  return {
    canView: hasGrantedPermission(permissions, `${base}.View`),
    canAdd: hasGrantedPermission(permissions, `${base}.Add`),
    canEdit: hasGrantedPermission(permissions, `${base}.Edit`),
    canChangeStatus: hasGrantedPermission(permissions, `${base}.ChangeStatus`),
    canDelete: hasGrantedPermission(permissions, `${base}.Delete`),
  };
}
