'use client';

import React, { useMemo } from 'react';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Alert, Paper, Stack, Drawer, Button, Typography } from '@mui/material';

import FinancePolicySkeleton from './FinancePolicySkeleton';
import PolicyAuditTimeline from './version/PolicyAuditTimeline';
import FinancePolicyDrawerHeader from './FinancePolicyDrawerHeader';
import { useFinancePolicyVersion } from '../hooks/useFinancePolicyVersion';

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
  const { versions, isLoading, isError, refetch } = useFinancePolicyVersion({
    open,
    policyId: policy?.id,
    policyType: policy?.policyType,
  });

  const valueContext = useMemo(() => {
    const labelsById: Record<string, string> = {};
    if (policy?.id) labelsById[policy.id.toLowerCase()] = policy.policyName;
    if (policy?.academicYearId && policy.academicYearName) {
      labelsById[policy.academicYearId.toLowerCase()] = policy.academicYearName;
    }
    return { labelsById, policyType: policy?.policyType };
  }, [policy]);

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
          title="Policy Audit Trail"
          titleId="policy-audit-title"
          description="This read-only history shows who changed the policy and when. Expand an event to compare its recorded values."
          descriptionDisplay="tooltip"
          badges={<Label color="default">Read Only</Label>}
          onClose={onClose}
        />

        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            Policy
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 0.25, overflowWrap: 'anywhere' }}>
            {policy.policyName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Academic Year: {policy.academicYearName || 'Current academic year'}
          </Typography>
        </Box>

        <Box
          sx={{
            px: { xs: 2, sm: 3 },
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
            {!isLoading && !isError && <Label color="default">{versions.length}</Label>}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Newest First
          </Typography>
        </Box>

        {/* Scrollable Timeline */}
        <Scrollbar sx={{ flex: 1, minHeight: 0 }} aria-busy={isLoading}>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {isLoading ? (
              <FinancePolicySkeleton label="Loading policy activity" />
            ) : isError ? (
              <Alert
                severity="warning"
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
                versions={versions}
                valueContext={valueContext}
                policyName={policy.policyName}
              />
            )}
          </Box>
        </Scrollbar>

        {/* Footer */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 1.5,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={onClose}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
