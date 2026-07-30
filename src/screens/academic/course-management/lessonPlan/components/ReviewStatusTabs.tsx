'use client';

import React from 'react';
import { Tab, Tabs, Chip, Stack } from '@mui/material';

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

const statusChipColors: Record<ReviewStatusFilter, 'warning' | 'success' | 'info' | 'error' | 'default'> = {
  pending: 'warning',
  approved: 'success',
  changes: 'warning',
  rejected: 'error',
  all: 'default',
};

const ReviewStatusTabs = ({ value, counts, onChange }: Props) => (
  <Tabs
    value={value}
    onChange={(_, nextValue: ReviewStatusFilter) => onChange(nextValue)}
    variant="scrollable"
    scrollButtons="auto"
    sx={{
      px: 2,
      minHeight: 48,
      '& .MuiTab-root': {
        minHeight: 48,
        fontWeight: 600,
      },
    }}
  >
    {(Object.keys(labels) as ReviewStatusFilter[]).map((status) => (
      <Tab
        key={status}
        value={status}
        label={
          <Stack direction="row" spacing={0.75} alignItems="center">
            <span>{labels[status]}</span>
            <Chip
              label={counts[status]}
              size="small"
              color={statusChipColors[status]}
              variant="soft"
              sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
            />
          </Stack>
        }
      />
    ))}
  </Tabs>
);

export default ReviewStatusTabs;
