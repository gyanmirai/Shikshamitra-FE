'use client';

import type { RootState } from 'src/redux/store';

import { useEffect } from 'react';
import { Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { SplashScreen } from 'src/components/loading-screen';
import { financePaths, financePermissions } from 'src/constants/finance-menu';

export default function IncomeAndExpense() {
  const router = useRouter();
  const { permissions, loading, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  const destination = hasGrantedPermission(
    permissions,
    `${financePermissions.accounts.income}.View`
  )
    ? financePaths.incomeTracking
    : hasGrantedPermission(permissions, `${financePermissions.accounts.expense}.View`)
      ? financePaths.expenseTracking
      : null;
  useEffect(() => {
    if (!loading && permissionsInitialized && destination) router.replace(destination);
  }, [destination, loading, permissionsInitialized, router]);
  return loading || !permissionsInitialized || destination ? (
    <SplashScreen />
  ) : (
    <Alert severity="error">You do not have permission to view Income or Expenses.</Alert>
  );
}
