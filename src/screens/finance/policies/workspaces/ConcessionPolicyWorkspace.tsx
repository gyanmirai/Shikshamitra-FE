'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinancePolicyTable from '../components/FinancePolicyTable';
import ConcessionPolicyDrawer from '../components/ConcessionPolicyDrawer';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

export default function ConcessionPolicyWorkspace() {
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
        heading="Concession Policy"
        description="Define reusable concession calculation rules, fee head scope, application behaviour, and demand recalculation logic."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Policies & Rules', href: '/finance/policies' },
          { name: 'Concession Policy' },
        ]}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={handleAdd}
            sx={{ px: '24px' }}
          >
            Concession Policy
          </Button>
        }
      />

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
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
