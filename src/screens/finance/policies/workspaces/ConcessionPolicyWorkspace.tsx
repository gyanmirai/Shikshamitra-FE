'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Button, Drawer } from '@mui/material';
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomBreadcrumbs
        heading="Concession Policy"
        description="Set up fee discount eligibility (merit, sibling, staff), stacking settings, and government schemas."
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

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <FinancePolicyTable policyType="concession" onAdd={handleAdd} onEdit={handleEdit} />
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
        <ConcessionPolicyDrawer
          open={drawerOpen.value}
          onClose={drawerOpen.onFalse}
          editData={selectedPolicy}
          academicYearId={academicYearId}
        />
      </Drawer>
    </Box>
  );
}
