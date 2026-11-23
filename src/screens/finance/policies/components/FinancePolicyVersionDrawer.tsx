'use client';

import { alpha } from '@mui/material/styles';
import { useRef, useMemo, useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Alert, Paper, Drawer, Button, Typography } from '@mui/material';
import { useGetFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';

import VersionSidebar from './version/VersionSidebar';
import VersionDiffTable from './version/VersionDiffTable';
import FinancePolicySkeleton from './FinancePolicySkeleton';
import FinancePolicyDrawerHeader from './FinancePolicyDrawerHeader';
import PolicyHistoryPagination from './version/PolicyHistoryPagination';
import { useFinancePolicyVersion } from '../hooks/useFinancePolicyVersion';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

type FinancePolicyVersionDrawerProps = {
  open: boolean;
  onClose: () => void;
  policy: IFinancePolicyRow | null;
};

export default function FinancePolicyVersionDrawer({
  open,
  onClose,
  policy,
}: FinancePolicyVersionDrawerProps) {
  const drawerPaperRef = useRef<HTMLDivElement>(null);
  const {
    versions,
    selectedVersion,
    selectedVersionId,
    setSelectedVersionId,
    isLoading,
    isError,
    refetch,
    page, pageSize, totalCount, setPage,
  } = useFinancePolicyVersion({
    open,
    policyId: policy?.id,
    policyType: policy?.policyType,
  });
  const { data: feeHeadData, isLoading: isFeeHeadsLoading } = useGetFeeHeadsQuery(
    { academicYearId: policy?.academicYearId || '', page: 1, pageSize: 1000 },
    { skip: !open || policy?.policyType !== 'collection' || !policy?.academicYearId }
  );

  const valueContext = useMemo(() => {
    const labelsById: Record<string, string> = {};

    if (policy?.id) labelsById[policy.id.toLowerCase()] = policy.policyName;
    if (policy?.academicYearId && policy.academicYearName) {
      labelsById[policy.academicYearId.toLowerCase()] = policy.academicYearName;
    }
    feeHeadData?.items.forEach((head) => {
      labelsById[head.id.toLowerCase()] = head.name;
    });

    return { labelsById, policyType: policy?.policyType };
  }, [policy, feeHeadData]);

  const handleSelectVersion = useCallback(
    (id: string) => {
      setSelectedVersionId(id);
    },
    [setSelectedVersionId]
  );

  if (!policy) return null;

  const handlePageChange = (nextPage: number) => {
    drawerPaperRef.current?.focus();
    setPage(nextPage);
  };
  const pagination = totalCount > pageSize && (
    <PolicyHistoryPagination
      page={page}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={handlePageChange}
    />
  );
  const backToLatest = page > 0 && (
    <Button size="small" onClick={() => handlePageChange(0)} sx={{ mt: 1 }}>
      Back to latest versions
    </Button>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: (theme) => alpha(theme.palette.common.black, 0.32),
          },
        },
      }}
      PaperProps={{
        ref: drawerPaperRef,
        role: 'dialog',
        tabIndex: -1,
        'aria-modal': true,
        'aria-labelledby': 'policy-versions-title',
        sx: {
          width: { xs: '100%', sm: 'min(960px, 96vw)' },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          bgcolor: 'background.neutral',
        }}
      >
        <FinancePolicyDrawerHeader
          description={`${policy.policyName} · ${policy.academicYearName || 'Current academic year'}`}
          helpText="Review recorded policy snapshots. Select a version to compare its values with the previous version. Viewing history does not change the current policy."
          title="Policy Version History"
          titleId="policy-versions-title"

          onClose={onClose}
        />

        {/* Content Body */}
        {isLoading || (policy.policyType === 'collection' && isFeeHeadsLoading) ? (
          <Box sx={{ p: 2, overflow: 'auto', flex: 1, minHeight: 0 }}>
            <FinancePolicySkeleton label="Loading policy version history" />
          </Box>
        ) : isError ? (
          <Box sx={{ p: 3 }}>
            <Alert
              severity="error"
              sx={{ borderRadius: 1.5 }}
              action={
                <Button size="small" onClick={() => refetch()}>
                  Try again
                </Button>
              }
            >
              Unable to load version history for this policy.
            </Alert>
            {backToLatest}
          </Box>
        ) : versions.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                maxWidth: 420,
                textAlign: 'center',
                borderRadius: 1.5,
              }}
            >
              <Iconify
                icon="solar:history-bold-duotone"
                width={48}
                height={48}
                sx={{ color: 'text.disabled', mb: 1.5 }}
              />
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                {page > 0 ? 'No versions on this page.' : 'No version history recorded yet.'}
              </Typography>
              {backToLatest}
            </Paper>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              p: 2,
              gap: 1,
            }}
          >
            {/* Version List Sidebar */}
            <Box
              sx={{
                width: { xs: '100%', md: 240 },
                height: { xs: pagination ? 248 : 208, md: '100%' },
                flexShrink: 0,
                minHeight: 0,
              }}
            >
              <VersionSidebar
                key={`${policy.id}:${page}`}
                versions={versions}
                selectedVersionId={selectedVersionId}
                onSelectVersion={handleSelectVersion}
                isLatestPage={page === 0}
                pagination={pagination}
              />
            </Box>

            {/* Version Changes Display */}
            <Scrollbar sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
              <Box sx={{ pr: { xs: 0.5, sm: 1 }, pb: 1 }}>
                {selectedVersion && (
                  <VersionDiffTable
                    selectedVersion={selectedVersion}
                    valueContext={valueContext}
                    collapsibleChanges
                    showSavedDetails
                  />
                )}
              </Box>
            </Scrollbar>
          </Box>
        )}

      </Box>
    </Drawer>
  );
}
