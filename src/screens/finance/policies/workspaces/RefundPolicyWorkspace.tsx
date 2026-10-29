'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Button } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { financePaths, financePermissions } from 'src/constants/finance-menu';

import FinancePolicyTable from '../components/FinancePolicyTable';
import RefundPolicyDrawer from '../components/RefundPolicyDrawer';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

export default function RefundPolicyWorkspace() {
  const [selectedPolicy, setSelectedPolicy] = useState<IFinancePolicyRow | null>(null);
  const drawerOpen = useBoolean();

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreate = hasGrantedPermission(
    permissions,
    financePermissions.policies.refundPolicyActions.create
  );
  const academicYearId = currentYear?.id || '';

  const handleAdd = () => {
    setSelectedPolicy(null);
    drawerOpen.onTrue();
  };

  const handleEdit = (row: IFinancePolicyRow) => {
    setSelectedPolicy(row);
    drawerOpen.onTrue();
  };

  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        description="Configure refundable paid fees, eligibility, payment methods, and accounting for refund requests."
        heading="Refund Policy"
        action={
          canCreate ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              onClick={handleAdd}
              disabled={!academicYearId}
            >
              Policy
            </Button>
          ) : undefined
        }

        links={[
          { name: 'Finance', href: financePaths.dashboard },
          { name: 'Policies & Rules', href: financePaths.policies.root },
          { name: 'Refund Policy' },
        ]}
      />

      <Box
        sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <FinancePolicyTable policyType="refund" onAdd={handleAdd} onEdit={handleEdit} />
      </Box>

      <RefundPolicyDrawer
        open={drawerOpen.value}
        onClose={drawerOpen.onFalse}
        editData={selectedPolicy}
        academicYearId={academicYearId}
      />
    </Box>
  );
}
