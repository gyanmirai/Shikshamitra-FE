'use client';

import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { DetailField } from 'src/screens/finance/components/detail-view';
import { Box, Alert, Paper, Stack, Drawer, Button, Typography } from '@mui/material';

import FinancePolicySkeleton from './FinancePolicySkeleton';
import PolicyAuditTimeline from './version/PolicyAuditTimeline';
import FinancePolicyDrawerHeader from './FinancePolicyDrawerHeader';
import PolicyHistoryPagination from './version/PolicyHistoryPagination';
import { useFinancePolicyVersion } from '../hooks/useFinancePolicyVersion';
import { usePolicyHistoryValueContext } from '../hooks/usePolicyHistoryValueContext';

import type { IFinancePolicyRow } from '../types/finance-policy.types';

type FinancePolicyAuditDrawerProps = {
  open: boolean;
  onClose: () => void;
  policy: IFinancePolicyRow | null;
};

export default function FinancePolicyAuditDrawer({
  open,
  onClose,
  policy,
}: FinancePolicyAuditDrawerProps) {
  const { versions, isLoading, isError, refetch, page, pageSize, totalCount, setPage } =
    useFinancePolicyVersion({
      open,
      policyId: policy?.id,
      policyType: policy?.policyType,
    });

  const valueContext = usePolicyHistoryValueContext(policy, open);

  if (!policy) return null;

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
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'policy-audit-title',
        sx: {
          width: { xs: '100%', sm: 'min(760px, 96vw)' },
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
          description="This read-only history shows who changed the policy and when. Expand an event to compare its recorded values."
          title="Policy Audit Trail"
          titleId="policy-audit-title"
          descriptionDisplay="tooltip"
          onClose={onClose}
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          gap={{ xs: 1, sm: 2 }}
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Typography
            component="h3"
            variant="subtitle1"
            sx={{ flex: '1 1 auto', minWidth: 0, overflowWrap: 'anywhere' }}
          >
            {policy.policyName}
          </Typography>
          <Box
            sx={{
              flexShrink: 0,
              maxWidth: { sm: '40%' },
              pl: { sm: 2 },
              borderLeft: { sm: 1 },
              borderLeftColor: { sm: 'divider' },
            }}
          >
            <DetailField
              label="Academic year"
              value={policy.academicYearName || 'Current academic year'}
            />
          </Box>
        </Stack>

        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.neutral',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2" component="h3">
              Recorded Activity
            </Typography>
            {!isLoading && !isError && <Label color="default">{totalCount}</Label>}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Newest First
          </Typography>
        </Box>

        {/* Scrollable Timeline */}
        <Scrollbar sx={{ flex: 1, minHeight: 0 }} aria-busy={isLoading}>
          <Box sx={{ p: 2 }}>
            {isLoading ? (
              <FinancePolicySkeleton label="Loading policy activity" />
            ) : isError ? (
              <Alert
                severity="error"
                sx={{ borderRadius: 1.5 }}
                action={
                  <Button size="small" onClick={() => refetch()}>
                    Try again
                  </Button>
                }
              >
                Unable to load audit events for this policy.
              </Alert>
            ) : versions.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              >
                <Iconify
                  icon="solar:history-bold-duotone"
                  width={48}
                  height={48}
                  sx={{ color: 'text.disabled', mb: 1.5 }}
                />
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  No audit events recorded for this policy yet.
                </Typography>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  display="block"
                  sx={{ mt: 0.5 }}
                >
                  Modifications, status updates, and activations will appear here in chronological
                  order, newest first.
                </Typography>
              </Paper>
            ) : (
              <PolicyAuditTimeline
                key={`${policy.id}:${page}`}
                versions={versions}
                valueContext={valueContext}
              />
            )}
          </Box>
        </Scrollbar>

        {totalCount > pageSize && (
          <Box
            sx={{
              px: 2,
              py: 1,
              bgcolor: 'background.paper',
              borderTop: 1,
              borderColor: 'divider',
              flexShrink: 0,
            }}
          >
            <PolicyHistoryPagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
