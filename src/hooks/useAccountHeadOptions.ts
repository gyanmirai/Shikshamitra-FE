import type { RootState } from 'src/redux/store';
import type { AccountHeadType } from 'src/types/finance/account-head';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { useGetAccountHeadOptionsQuery } from 'src/redux/finance/accountHeadApi';

export function useAccountHeadOptions(headType?: AccountHeadType, categoryType?: 'Income' | 'Expense') {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { permissions, permissionsInitialized, loading } = useSelector(
    (state: RootState) => state.auth
  );
  const permissionsReady = permissionsInitialized && !loading;
  const canView = categoryType
    ? ['Add', 'Edit'].some((action) =>
        hasGrantedPermission(permissions, `Finance.Accounts.Settings.${categoryType}Category.${action}`)
      )
    : hasGrantedPermission(permissions, financePermissions.accounts.settings.accountHead);
  const canQuery = permissionsReady && canView && Boolean(currentYear?.id);

  const { currentData, isFetching, error, isError } = useGetAccountHeadOptionsQuery(
    {
      academicYearId: currentYear?.id,
      headType,
      ...(categoryType ? { categoryType } : {}),
    },
    {
      skip: !canQuery,
    }
  );

  const options =
    canQuery && !isError
      ? Array.isArray(currentData)
        ? currentData
        : currentData?.items || []
      : [];
  let errorMessage: string | undefined;
  if (permissionsReady && !canView) {
    errorMessage = categoryType
      ? `${categoryType} Category Add or Edit permission is required to select an account head.`
      : 'Account Heads View permission is required. Ask your administrator to grant access, then sign in again.';
  } else if (canQuery && isError) {
    const status = error && 'status' in error ? error.status : undefined;
    errorMessage =
      status === 403
        ? 'Access to Account Heads was denied. Ask your administrator to check your permissions.'
        : 'Account Heads could not be loaded. Retry or ask your administrator to check the Accounts service.';
  }

  return {
    options,
    isLoading: !permissionsReady || (canQuery && isFetching),
    errorMessage,
    disabled: !canQuery || Boolean(isError),
    needsAcademicYear: permissionsReady && canView && !currentYear?.id,
  };
}
