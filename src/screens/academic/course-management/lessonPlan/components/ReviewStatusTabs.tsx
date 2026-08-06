'use client';

import React from 'react';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useTheme } from '@mui/material/styles';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

export type ReviewStatusFilter = 'pending' | 'approved' | 'changes' | 'rejected' | 'all';

type Props = {
  value: ReviewStatusFilter;
  counts: Record<ReviewStatusFilter, number>;
  onChange: (value: ReviewStatusFilter) => void;
  viewMode?: 'card' | 'table';
  onViewModeChange?: (mode: 'card' | 'table') => void;
};

const labels: Record<ReviewStatusFilter, string> = {
  pending: 'Pending',
  approved: 'Approved',
  changes: 'Changes Requested',
  rejected: 'Rejected',
  all: 'All Reviews',
};

const statusLabelColors: Record<ReviewStatusFilter, 'warning' | 'success' | 'warning' | 'error' | 'default'> = {
  pending: 'warning',
  approved: 'success',
  changes: 'warning',
  rejected: 'error',
  all: 'default',
};

export const ReviewStatusTabs = ({
  value,
  counts,
  onChange,
  viewMode,
  onViewModeChange,
}: Props) => {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ px: 2, minHeight: 48, width: '100%' }}
    >
      <Tabs
        value={value}
        onChange={(_, nextValue: ReviewStatusFilter) => onChange(nextValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          flexGrow: 1,
          minHeight: 48,
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
          '& .MuiTab-root': {
            minHeight: 48,
            fontWeight: 600,
            fontSize: '0.875rem',
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.2s ease',
          },
        }}
      >
        {(Object.keys(labels) as ReviewStatusFilter[]).map((status) => (
          <Tab
            key={status}
            value={status}
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{labels[status]}</span>
                <Label
                  color={statusLabelColors[status]}
                  variant="soft"
                  sx={{ height: 20, minWidth: 20, px: 0.75, fontSize: '0.75rem', fontWeight: 700 }}
                >
                  {counts[status] ?? 0}
                </Label>
              </Stack>
            }
          />
        ))}
      </Tabs>

      {viewMode && onViewModeChange && (
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, val) => val && onViewModeChange(val)}
          size="small"
          sx={{ flexShrink: 0, ml: 2, my: 'auto' }}
        >
          <ToggleButton value="card" aria-label="Grid View">
            <Iconify icon="solar:widget-5-bold-duotone" width={18} />
          </ToggleButton>
          <ToggleButton value="table" aria-label="Table View">
            <Iconify icon="solar:list-bold-duotone" width={18} />
          </ToggleButton>
        </ToggleButtonGroup>
      )}
    </Stack>
  );
};

export default ReviewStatusTabs;
