'use client';

import React from 'react';
import { Box, Stack, Button, Drawer, Divider, Typography } from '@mui/material';

import { getLeavePolicyTitle } from '../leave-policy-workspace-utils';
import { StatusChip, DrawerHeader, PolicySection } from './HRPolicySharedUI';

import type { ILeavePolicy } from '../leave-policy-types';

const value = (item: unknown): string => {
  if (item === null || item === undefined || item === '') return 'Not specified';
  if (typeof item === 'boolean') return item ? 'Yes' : 'No';
  return String(item).replaceAll('_', ' ');
};

export function LeavePolicyDetailsDrawer({
  policy,
  onClose,
}: {
  policy: ILeavePolicy | null;
  onClose: () => void;
}) {
  return (
    <Drawer
      anchor="right"
      open={Boolean(policy)}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 'min(760px, 92vw)' }, maxWidth: '100%' } }}
    >
      <DrawerHeader
        title={policy ? getLeavePolicyTitle(policy) : 'Leave Policy'}
        helpText="Saved leave policy details. Rule settings are separate from affected-record impact."
        onClose={onClose}
      />
      <Divider />
      {policy ? (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <PolicySection
              title="Policy Details"
              help="Saved identity, status and effective dates for this academic year."
            >
              <StatusChip
                status={(policy.status || 'unknown').toLowerCase()}
                isDefault={policy.isDefault}
              />
              <Typography variant="body2">Effective from: {value(policy.effectiveFrom)}</Typography>
              <Typography variant="body2">Effective to: {value(policy.effectiveTo)}</Typography>
              <Typography variant="body2">Description: {value(policy.description)}</Typography>
            </PolicySection>
            {(policy.rules || []).map((rule, index) => (
              <PolicySection
                key={rule.id || index}
                title={`${rule.paidType} Rules${rule.isActive === false ? ' (Historical)' : ''}`}
                help="Saved entitlement, payroll classification and request requirements. Historical rules retain their referenced identity."
              >
                {Object.entries({
                  'Payroll category': rule.payrollCategory,
                  'Entitlement mode': rule.entitlementMode,
                  'Leave allocation':
                    rule.isUnlimited || rule.entitlementMode === 'Unlimited'
                      ? 'Unlimited'
                      : rule.leaveCount,
                  'Accrual frequency': rule.accrualPolicyType,
                  'Carry forward': rule.carryForward,
                  'Carry-forward limit': rule.carryForwardLimit,
                  'Encashment allowed': rule.encashmentAllowed,
                  'Encashment timing': rule.encashmentTiming,
                  'Approval required': rule.requiresApproval,
                  'Minimum notice days': rule.minNoticeDays,
                  'Maximum days per request': rule.maxDaysPerRequest,
                  'Half days allowed': rule.allowHalfDay,
                  'Attachment required after days': rule.attachmentRequiredAfterDays,
                  'Negative balance allowed': rule.allowNegativeBalance,
                }).map(([label, item]) => (
                  <Typography variant="body2" key={label}>
                    {label}: {value(item)}
                  </Typography>
                ))}
              </PolicySection>
            ))}
          </Stack>
        </Box>
      ) : null}
      <Divider />
      <Stack direction="row" justifyContent="flex-end" sx={{ px: { xs: 2, sm: 3 }, py: 1.75 }}>
        <Button size="small" variant="outlined" onClick={onClose}>
          Close
        </Button>
      </Stack>
    </Drawer>
  );
}
