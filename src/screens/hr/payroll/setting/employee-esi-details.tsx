'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { hrPermissions } from 'src/constants/hr-menus';
import { hasGrantedPermission } from 'src/utils/permissions';

import { EsiEnrollmentDrawer } from './esi-enrollment-drawer';

type Props = {
  employeeId: string;
  employeeName: string;
  employeeIdentifier?: string;
  onSaved?: () => Promise<unknown>;
};

export function EmployeeEsiDetails({
  employeeId,
  employeeName,
  employeeIdentifier = '',
  onSaved,
}: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const [open, setOpen] = useState(false);
  const canView = hasGrantedPermission(permissions, hrPermissions.payroll.settings.statutorySchemes);
  const canManage = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.statutorySchemeActions.manageEnrollment
  );

  if (!employeeId || !canView) return null;

  return (
    <>
      <Button size="small" variant="outlined" onClick={() => setOpen(true)}>
        ESIC details
      </Button>
      <EsiEnrollmentDrawer
        employee={{ employeeId, employeeName, employeeIdentifier }}
        open={open}
        canManageEnrollment={canManage}
        canApproveOverride={false}
        onClose={() => setOpen(false)}
        onSaved={async () => onSaved?.()}
      />
    </>
  );
}
