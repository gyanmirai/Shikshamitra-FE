'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinancePolicyTable from '../components/FinancePolicyTable';
import CollectionPolicyDrawer from '../components/CollectionPolicyDrawer';
import ExceptionWindowsDialog from '../components/ExceptionWindowsDialog';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

export default function CollectionPolicyWorkspace() {
  const [selectedPolicy, setSelectedPolicy] = useState<IFinancePolicyRow | null>(null);
  const drawerOpen = useBoolean();
  const exceptionWindowsOpen = useBoolean();

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
        heading="Collection Policy"
        description="Configure grace periods, late fee structures, waivers, and online payment options."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Policies & Rules', href: '/finance/policies' },
          { name: 'Collection Policy' },
        ]}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              color="warning"
              startIcon={<Iconify icon="solar:calendar-mark-bold" width={18} />}
              onClick={exceptionWindowsOpen.onTrue}
            >
              Exception Windows
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={handleAdd}
              sx={{ px: '24px' }}
            >
              Collection Policy
            </Button>
          </Box>
        }
      />

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <FinancePolicyTable policyType="collection" onAdd={handleAdd} onEdit={handleEdit} />
      </Box>

      <CollectionPolicyDrawer
        open={drawerOpen.value}
        onClose={drawerOpen.onFalse}
        editData={selectedPolicy}
        academicYearId={academicYearId}
      />

      <ExceptionWindowsDialog
        open={exceptionWindowsOpen.value}
        onClose={exceptionWindowsOpen.onFalse}
      />
    </Box>
  );
}
