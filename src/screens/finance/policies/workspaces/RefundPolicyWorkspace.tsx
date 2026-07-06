'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinancePolicyTable from '../components/FinancePolicyTable';
import RefundPolicyDrawer from '../components/RefundPolicyDrawer';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

export default function RefundPolicyWorkspace() {
  const [selectedPolicy, setSelectedPolicy] = useState<IFinancePolicyRow | null>(null);
  const drawerOpen = useBoolean();

  const { currentYear } = useSelector((state: RootState) => state.globalState);
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Refund Policy"
        description="Establish refund timeline rules, deduction tiers, bank requirements, and government compliance."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Policies & Rules', href: '/finance/policies' },
          { name: 'Refund Policy' },
        ]}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={handleAdd}
            sx={{ px: '24px' }}
          >
            Refund Policy
          </Button>
        }
      />

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
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
