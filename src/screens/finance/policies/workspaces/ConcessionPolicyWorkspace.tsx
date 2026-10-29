'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Button } from '@mui/material';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { financePaths, financePermissions } from 'src/constants/finance-menu';

import FinancePolicyTable from '../components/FinancePolicyTable';
import ConcessionPolicyDrawer from '../components/ConcessionPolicyDrawer';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

export default function ConcessionPolicyWorkspace() {
  const [selectedPolicy, setSelectedPolicy] = useState<IFinancePolicyRow | null>(null);
  const drawerOpen = useBoolean();

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreate = hasGrantedPermission(
    permissions,
    financePermissions.policies.concessionPolicyActions.create
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
        description="Manage reusable concession rules and limits. Staff select an applicable policy on each concession request."
        heading="Concession Policy"
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
          { name: 'Concession Policy' },
        ]}
      />

      <Box
        sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <FinancePolicyTable policyType="concession" onAdd={handleAdd} onEdit={handleEdit} />
      </Box>

      <ConcessionPolicyDrawer
        open={drawerOpen.value}
        onClose={drawerOpen.onFalse}
        editData={selectedPolicy}
        academicYearId={academicYearId}
      />
    </Box>
  );
}
