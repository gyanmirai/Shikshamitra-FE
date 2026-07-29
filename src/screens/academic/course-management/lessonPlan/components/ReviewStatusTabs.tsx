'use client';

import React from 'react';
import { Chip, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';

export type ReviewStatusFilter = 'pending' | 'approved' | 'changes' | 'rejected' | 'all';

type Props = {
  value: ReviewStatusFilter;
  counts: Record<ReviewStatusFilter, number>;
  onChange: (value: ReviewStatusFilter) => void;
};

const labels: Record<ReviewStatusFilter, string> = {
  pending: 'Pending',
  approved: 'Approved',
  changes: 'Changes Requested',
  rejected: 'Rejected',
  all: 'All Reviews',
};

const ReviewStatusTabs = ({ value, counts, onChange }: Props) => (
  <ToggleButtonGroup
    value={value}
    exclusive
    onChange={(_, nextValue: ReviewStatusFilter | null) => nextValue && onChange(nextValue)}
    size="small"
    sx={{ overflowX: 'auto', maxWidth: 1 }}
  >
    {(Object.keys(labels) as ReviewStatusFilter[]).map((status) => (
      <ToggleButton key={status} value={status} sx={{ whiteSpace: 'nowrap', px: 1.25 }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          {labels[status]}
          <Chip
            label={counts[status]}
            size="small"
            color={status === 'pending' ? 'warning' : 'default'}
          />
        </Stack>
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
);

export default ReviewStatusTabs;
