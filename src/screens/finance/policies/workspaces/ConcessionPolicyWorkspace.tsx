'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Card, Stack, Button } from '@mui/material';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import { useGetConcessionPoliciesQuery } from 'src/redux/finance/concessionPolicy';

import FinancePolicyTable from '../components/FinancePolicyTable';
import ConcessionPolicyDrawer from '../components/ConcessionPolicyDrawer';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

export default function ConcessionPolicyWorkspace() {
  const [selectedPolicy, setSelectedPolicy] = useState<IFinancePolicyRow | null>(null);
  const [archiveView, setArchiveView] = useState<'current' | 'archived'>('current');
  const drawerOpen = useBoolean();

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreate = hasGrantedPermission(
    permissions,
    financePermissions.policies.concessionPolicyActions.create
  );
  const academicYearId = currentYear?.id || '';
  const isArchived = archiveView === 'archived';
  const { data: archivedSummary } = useGetConcessionPoliciesQuery(
    {
      academicYearId,
      status: 'Archived',
      page: 1,
      pageSize: 1,
    },
    { skip: !academicYearId }
  );

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
          { name: 'Finance', href: financePaths.dashboard },
          { name: 'Policies & Rules', href: financePaths.policies.root },
          { name: 'Concession Policy' },
        ]}
      />

      <Card sx={{ p: 1.25, mb: 1.5 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          spacing={1}
        >
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant={!isArchived ? 'contained' : 'outlined'}
              color={!isArchived ? 'inherit' : 'primary'}
              onClick={() => setArchiveView('current')}
              disableElevation
            >
              Current Policies
            </Button>
            <Button
              size="small"
              variant={isArchived ? 'contained' : 'outlined'}
              color={isArchived ? 'inherit' : 'primary'}
              onClick={() => setArchiveView('archived')}
              endIcon={
                <Label color="default" variant="soft">
                  {archivedSummary?.totalCount ?? 0}
                </Label>
              }
              disableElevation
            >
              Archived
            </Button>
          </Stack>

          {!isArchived && canCreate && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              onClick={handleAdd}
              sx={{ px: 2 }}
            >
              Concession Policy
            </Button>
          )}
        </Stack>
      </Card>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <FinancePolicyTable
          policyType="concession"
          onAdd={handleAdd}
          onEdit={handleEdit}
          archived={isArchived}
        />
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
