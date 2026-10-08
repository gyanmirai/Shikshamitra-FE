'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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
import { FinancePolicyArchiveTabs } from '../components/FinancePolicyArchiveTabs';

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
  const { currentData: archivedSummary } = useGetConcessionPoliciesQuery(
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
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading="Concession Policy"
        description="Manage reusable concession rules and limits. Staff select an applicable policy on each concession request."
        links={[
          { name: 'Finance', href: financePaths.dashboard },
          { name: 'Policies & Rules', href: financePaths.policies.root },
          { name: 'Concession Policy' },
        ]}
      />

      <Card sx={{ p: 1, flexShrink: 0 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          spacing={1}
        >
          <FinancePolicyArchiveTabs
            value={archiveView}
            onChange={setArchiveView}
            archivedCount={archivedSummary?.totalCount}
            ariaLabel="Concession policy views"
          />

          {!isArchived && canCreate && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              onClick={handleAdd}
              disabled={!academicYearId}
              sx={{ px: 2 }}
            >
              Create policy
            </Button>
          )}
        </Stack>
      </Card>

      <Box
        sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
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
