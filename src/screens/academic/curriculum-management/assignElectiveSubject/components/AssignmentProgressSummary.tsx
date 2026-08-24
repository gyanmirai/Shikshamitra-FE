'use client';

import { useMemo } from 'react';
import { Box } from '@mui/material';
import {
  TimetableSettingsSummaryCards,
  type ITimetableSummaryCard,
} from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';

interface AssignmentProgressSummaryProps {
  total: number;
  assigned: number;
  unassigned: number;
  issues: number;
  preferenceMatchPct: number | null;
  activeFilter: 'all' | 'assigned' | 'unassigned' | 'preferenceMismatch';
  onFilterAssigned: () => void;
  onFilterUnassigned: () => void;
  onFilterPreferenceMismatch: () => void;
  onOpenIssues: () => void;
  sx?: object;
}

export default function AssignmentProgressSummary({
  total,
  assigned,
  unassigned,
  issues,
  preferenceMatchPct,
  activeFilter,
  onFilterAssigned,
  onFilterUnassigned,
  onFilterPreferenceMismatch,
  onOpenIssues,
  sx,
}: AssignmentProgressSummaryProps) {
  const cards: ITimetableSummaryCard[] = useMemo(
    () => [
      {
        label: 'Total Students',
        value: total,
        icon: 'mdi:account-group',
        color: 'primary',
      },
      {
        label: 'Assigned',
        value: assigned,
        icon: 'mdi:check-circle-outline',
        color: 'success',
        onClick: onFilterAssigned,
        isActive: activeFilter === 'assigned',
      },
      {
        label: 'Unassigned',
        value: unassigned,
        icon: 'mdi:clock-alert-outline',
        color: unassigned > 0 ? 'warning' : 'info',
        onClick: onFilterUnassigned,
        isActive: activeFilter === 'unassigned',
      },
      {
        label: 'Issues',
        value: issues,
        icon: 'mdi:alert-circle-outline',
        color: issues > 0 ? 'warning' : 'info',
        onClick: onOpenIssues,
      },
      {
        label: 'Preference Match',
        value: preferenceMatchPct === null ? 'N/A' : `${preferenceMatchPct}%`,
        icon: 'mdi:star-outline',
        color: 'info',
        onClick: onFilterPreferenceMismatch,
        isActive: activeFilter === 'preferenceMismatch',
      },
      {
        label: 'Capacity Used',
        value: `${assigned}/${total}`,
        icon: 'mdi:chart-pie',
        color: 'info',
      },
    ],
    [
      total,
      assigned,
      unassigned,
      issues,
      preferenceMatchPct,
      activeFilter,
      onFilterAssigned,
      onFilterUnassigned,
      onFilterPreferenceMismatch,
      onOpenIssues,
    ]
  );

  return (
    <Box sx={sx}>
      <TimetableSettingsSummaryCards cards={cards} cardsPerRow={6} />
    </Box>
  );
}
