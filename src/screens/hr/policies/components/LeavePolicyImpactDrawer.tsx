'use client';

import React from 'react';
import { HrNotice, HrLoadingNotice } from 'src/screens/hr/components/hr-notice';
import {
  Box,
  Chip,
  Stack,
  Button,
  Drawer,
  Divider,
  Typography,
} from '@mui/material';

import { DrawerHeader } from './HRPolicySharedUI';

import type { LeavePolicyImpactReview } from '../leave-policy-workspace-utils';

export function LeavePolicyImpactDrawer({
  open,
  review,
  archiving,
  onClose,
}: {
  open: boolean;
  review: LeavePolicyImpactReview | null;
  archiving: boolean;
  onClose: () => void;
}) {
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
        closeDisabled={archiving}
      />
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          {archiving ? <HrLoadingNotice>Archiving leave policy...</HrLoadingNotice> : null}
          {!review && !archiving ? (
            <HrNotice severity="info">Select a leave policy action to preview impact.</HrNotice>
          ) : null}
          {review ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                <Chip size="small" label="Leave policy" color="primary" variant="outlined" />
                <Chip size="small" label={review.action.replaceAll('-', ' ')} variant="outlined" />
                <Chip size="small" label={`${review.affectedEmployeeCount} staff`} />
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
                  Buckets: {review.bucketSummary}
                </Typography>
              </Box>

              <Stack spacing={1}>
                {review.risks.map((risk) => (
                  <HrNotice
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
                  </HrNotice>
                ))}
              </Stack>

              <HrNotice severity="info">
                Historical leave requests keep the archived policy, paid bucket, and reporting
                context. New requests should only use active leave policies resolved from Leave
                Policies & Rules.
              </HrNotice>
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
              <Button onClick={onClose} disabled={archiving} size="small" variant="outlined">
                Close
              </Button>
            </Stack>
          </>
        ) : null}
      </Box>
    </Drawer>
  );
}
