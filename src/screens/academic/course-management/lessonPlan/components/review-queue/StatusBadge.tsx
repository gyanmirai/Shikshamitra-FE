'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

export type ReviewStatusType = 'pending' | 'approved' | 'changes' | 'rejected' | 'all' | string;

export const statusLabels: Record<string, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  changes: 'Changes Requested',
  rejected: 'Rejected',
  all: 'All Reviews',
};

export const statusColors: Record<string, 'warning' | 'success' | 'error' | 'default' | 'info'> = {
  pending: 'warning',
  approved: 'success',
  changes: 'warning',
  rejected: 'error',
  all: 'default',
};

export const statusIcons: Record<string, string> = {
  pending: 'solar:clock-circle-bold-duotone',
  approved: 'solar:check-circle-bold-duotone',
  changes: 'solar:alt-arrow-right-bold-duotone',
  rejected: 'solar:close-circle-bold-duotone',
  all: 'solar:layers-bold-duotone',
};

export const statusDescriptions: Record<string, string> = {
  pending: 'Pending: Awaiting reviewer action & approval',
  approved: 'Approved: Submission reviewed and approved',
  changes: 'Changes Requested: Returned with comments for teacher revisions',
  rejected: 'Rejected: Submission rejected',
};

type Props = {
  status: ReviewStatusType;
  showIcon?: boolean;
  showTooltip?: boolean;
  variant?: 'soft' | 'filled' | 'outlined';
};

export const StatusBadge = ({
  status,
  showIcon = true,
  showTooltip = true,
  variant = 'soft',
}: Props) => {
  const labelText = statusLabels[status] || status;
  const color = statusColors[status] || 'default';
  const icon = statusIcons[status];
  const description = statusDescriptions[status] || labelText;

  const content = (
    <Label
      color={color}
      variant={variant}
      startIcon={showIcon && icon ? <Iconify icon={icon} width={14} /> : undefined}
      sx={{ fontWeight: 600, textTransform: 'none' }}
    >
      {labelText}
    </Label>
  );

  if (showTooltip && description) {
    return (
      <Tooltip title={description} arrow placement="top">
        <Box component="span" sx={{ display: 'inline-flex', cursor: 'help' }}>
          {content}
        </Box>
      </Tooltip>
    );
  }

  return content;
};

export default StatusBadge;
