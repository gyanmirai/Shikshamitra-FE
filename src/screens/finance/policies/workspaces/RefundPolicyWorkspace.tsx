'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Card, Stack, Button } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetRefundPoliciesQuery } from 'src/redux/finance/refundPolicy';
import { financePaths, financePermissions } from 'src/constants/finance-menu';

import FinancePolicyTable from '../components/FinancePolicyTable';
import RefundPolicyDrawer from '../components/RefundPolicyDrawer';
import { FinancePolicyArchiveTabs } from '../components/FinancePolicyArchiveTabs';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

export default function RefundPolicyWorkspace() {
  const [selectedPolicy, setSelectedPolicy] = useState<IFinancePolicyRow | null>(null);
  const [archiveView, setArchiveView] = useState<'current' | 'archived'>('current');
  const drawerOpen = useBoolean();

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreate = hasGrantedPermission(
    permissions,
    financePermissions.policies.refundPolicyActions.create
  );
  const academicYearId = currentYear?.id || '';
  const isArchived = archiveView === 'archived';
  const { currentData: archivedSummary } = useGetRefundPoliciesQuery(
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
        description="Configure refundable paid fees, eligibility, payment methods, and accounting for refund requests."
        heading="Refund Policy"

        links={[
          { name: 'Finance', href: financePaths.dashboard },
          { name: 'Policies & Rules', href: financePaths.policies.root },
          { name: 'Refund Policy' },
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
            ariaLabel="Refund policy views"
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
              Policy
            </Button>
          )}
        </Stack>
      </Card>

      <Box
        sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <FinancePolicyTable
          policyType="refund"
          onAdd={handleAdd}
          onEdit={handleEdit}
          archived={isArchived}
        />
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
