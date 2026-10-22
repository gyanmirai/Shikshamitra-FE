'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
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
import { FinancePolicyArchiveTabs } from '../components/FinancePolicyArchiveTabs';

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
  const { currentData: archivedSummary } = useGetCollectionPoliciesQuery(
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
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        description="Configure grace periods, late fee structures, waivers, and online payment options."
        heading="Collection Policy"

        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Policies & Rules', href: '/finance/policies' },
          { name: 'Collection Policy' },
        ]}
      />

      <Card sx={{ p: 1, flexShrink: 0 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={1}
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
          <FinancePolicyArchiveTabs
            value={archiveView}
            onChange={setArchiveView}
            archivedCount={archivedSummary?.totalCount}
            ariaLabel="Collection policy views"
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isArchived && canCreate && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                onClick={handleAdd}
                disabled={!academicYearId}
                sx={{ px: 2 }}
              >
                Policy
              </Button>
            )}
          </Box>
        </Stack>
      </Card>

      <Box
        sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
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
