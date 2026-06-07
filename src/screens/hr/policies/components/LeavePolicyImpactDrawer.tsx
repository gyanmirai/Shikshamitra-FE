'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  Drawer,
  Divider,
  Typography,
  LinearProgress,
} from '@mui/material';

import { DrawerHeader } from './HRPolicySharedUI';

import type { LeavePolicyImpactReview } from '../leave-policy-workspace-utils';

export function LeavePolicyImpactDrawer({
  open,
  review,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  review: LeavePolicyImpactReview | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const hasBlockingRisk = Boolean(review?.risks.some((risk) => risk.severity === 'blocking'));

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', md: 560 } } }}
    >
      <DrawerHeader
        title="Leave Policy Impact"
        helpText="Review affected leave requests, balances, payroll risks, and historical records before confirming."
        onClose={onClose}
        closeDisabled={loading}
      />
      <Divider />
      {loading ? <LinearProgress /> : null}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          {!review ? (
            <Alert severity="info">Select a leave policy action to preview impact.</Alert>
          ) : null}
          {review ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                <Chip size="small" label="Leave policy" color="primary" variant="outlined" />
                <Chip size="small" label={review.action.replaceAll('-', ' ')} variant="outlined" />
                <Chip size="small" label={`${review.affectedEmployeeCount} employees`} />
                <Chip size="small" label={`${review.affectedRequestCount} requests`} />
                <Chip size="small" label={`${review.balanceImpactCount} balances`} />
                <Chip
                  size="small"
                  label={`${review.payrollMonthRiskCount} payroll risks`}
                  color={review.payrollMonthRiskCount ? 'warning' : 'default'}
                />
              </Stack>

              <Box>
                <Typography variant="subtitle2">{review.policyName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Leave type: {review.leaveTypeName}
                </Typography>
              </Box>

              <Stack spacing={1}>
                {review.risks.map((risk) => (
                  <Alert
                    key={`${risk.label}-${risk.message}`}
                    severity={
                      risk.severity === 'blocking'
                        ? 'error'
                        : risk.severity === 'confirmation'
                          ? 'warning'
                          : 'info'
                    }
                  >
                    <Typography variant="subtitle2">{risk.label}</Typography>
                    <Typography variant="body2">{risk.message}</Typography>
                  </Alert>
                ))}
              </Stack>

              <Alert severity="info">
                Historical leave requests keep the archived policy, leave type name, and reporting
                context. New requests should only use active leave policies resolved from Leave
                Type.
              </Alert>
            </Stack>
          ) : null}
        </Box>

        {review ? (
          <>
            <Divider />
            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={1.5}
              sx={{ px: 2.5, py: 2, bgcolor: 'background.paper', flexShrink: 0 }}
            >
              <Button
                onClick={onClose}
                disabled={loading}
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:close" />}
              >
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                color="warning"
                disabled={hasBlockingRisk}
                startIcon={<Iconify icon={GlobalIcons.submit} />}
                loading={loading}
                onClick={onConfirm}
                size="small"
              >
                Confirm Archive
              </LoadingButton>
            </Stack>
          </>
        ) : null}
      </Box>
    </Drawer>
  );
}
