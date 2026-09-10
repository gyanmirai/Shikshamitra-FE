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
import { financePermissions } from 'src/constants/finance-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetCollectionPoliciesQuery } from 'src/redux/finance/collectionPolicy';

import FinancePolicyTable from '../components/FinancePolicyTable';
import CollectionPolicyDrawer from '../components/CollectionPolicyDrawer';
import ExceptionWindowsDialog from '../components/ExceptionWindowsDialog';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

export default function CollectionPolicyWorkspace() {
  const [archiveView, setArchiveView] = useState<'current' | 'archived'>('current');
  const [selectedPolicy, setSelectedPolicy] = useState<IFinancePolicyRow | null>(null);
  const drawerOpen = useBoolean();
  const exceptionWindowsOpen = useBoolean();

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const collectionPermissions = financePermissions.policies.collectionPolicyActions;
  const canCreate = hasGrantedPermission(permissions, collectionPermissions.create);
  const canManageExceptionWindows = hasGrantedPermission(
    permissions,
    collectionPermissions.manageExceptionWindow
  );
  const academicYearId = currentYear?.id || '';
  const isArchived = archiveView === 'archived';
  const archivedSummary = useGetCollectionPoliciesQuery(
    {
      academicYearId,
      status: 'Archived',
      includeArchived: true,
      skipCount: 0,
      maxResultCount: 1,
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
        heading="Collection Policy"
        description="Configure grace periods, late fee structures, waivers, and online payment options."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Policies & Rules', href: '/finance/policies' },
          { name: 'Collection Policy' },
        ]}
      />

      <Card sx={{ p: 1.25, mb: 1.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              variant={!isArchived ? 'contained' : 'outlined'}
              onClick={() => setArchiveView('current')}
            >
              Current Policies
            </Button>
            <Button
              size="small"
              variant={isArchived ? 'contained' : 'outlined'}
              onClick={() => setArchiveView('archived')}
              endIcon={
                <Label
                  color={isArchived ? 'primary' : 'default'}
                  sx={{ height: 18, fontSize: '0.65rem' }}
                >
                  {archivedSummary.data?.totalCount ?? 0}
                </Label>
              }
            >
              Archived
            </Button>
          </Stack>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isArchived && canCreate && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                onClick={handleAdd}
                sx={{ px: 2 }}
              >
                Collection Policy
              </Button>
            )}
          </Box>
        </Stack>
      </Card>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <FinancePolicyTable
          policyType="collection"
          onAdd={handleAdd}
          onEdit={handleEdit}
          archived={isArchived}
        />
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
