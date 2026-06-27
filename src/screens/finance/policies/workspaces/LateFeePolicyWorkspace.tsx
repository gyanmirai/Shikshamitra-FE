'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Button, Drawer } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinancePolicyTable from '../components/FinancePolicyTable';
import LateFeePolicyDrawer from '../components/LateFeePolicyDrawer';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

export default function LateFeePolicyWorkspace() {
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomBreadcrumbs
        heading="Late Fee Policy"
        description="Configure late fee grace periods, fine calculations (flat/percent/daily), and escalation rules."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Policies & Rules', href: '/finance/policies' },
          { name: 'Late Fee Policy' },
        ]}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={handleAdd}
            sx={{ px: '24px' }}
          >
            Late Fee Policy
          </Button>
        }
      />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <FinancePolicyTable policyType="late-fee" onAdd={handleAdd} onEdit={handleEdit} />
      </Box>

      <Drawer
        anchor="right"
        open={drawerOpen.value}
        onClose={drawerOpen.onFalse}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 'min(1180px, 92vw)' },
            maxWidth: '100%',
          },
        }}
      >
        <LateFeePolicyDrawer
          open={drawerOpen.value}
          onClose={drawerOpen.onFalse}
          editData={selectedPolicy}
          academicYearId={academicYearId}
        />
      </Drawer>
    </Box>
  );
}
