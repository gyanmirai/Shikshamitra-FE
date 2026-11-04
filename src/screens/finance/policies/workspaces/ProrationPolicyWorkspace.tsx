'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import { FinanceSetupManagerHeader } from 'src/screens/finance/setup/embedding/FinanceSetupManagerHeader';

import FinancePolicyTable from '../components/FinancePolicyTable';
import ProrationPolicyDrawer from '../components/ProrationPolicyDrawer';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

export default function ProrationPolicyWorkspace() {
  const [selectedPolicy, setSelectedPolicy] = useState<IFinancePolicyRow | null>(null);
  const drawerOpen = useBoolean();

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreate = hasGrantedPermission(
    permissions,
    financePermissions.policies.prorationPolicyActions.create
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
      <FinanceSetupManagerHeader
        editorOpen={drawerOpen.value}
        description="Define per-fee-head proration rules for admissions and service changes. The active default applies by academic year to new fee preparations; prepared fees keep their saved policy version."
        heading="Proration Policy"
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
          { name: 'Proration Policy' },
        ]}
      />

      <Box
        sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <FinancePolicyTable policyType="proration" onAdd={handleAdd} onEdit={handleEdit} />
      </Box>

      <ProrationPolicyDrawer
        open={drawerOpen.value}
        onClose={drawerOpen.onFalse}
        editData={selectedPolicy}
        academicYearId={academicYearId}
      />
    </Box>
  );
}
