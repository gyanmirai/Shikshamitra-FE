'use client';

import type { AcademicInsightMetric } from 'src/screens/academic/components/academic-insights';

import { AcademicInsights } from 'src/screens/academic/components/academic-insights';

import type { AssignmentFilterValue } from '../types';

interface AssignmentSummaryDrawerProps {
  open: boolean;
  onClose: () => void;
  total: number;
  assigned: number;
  unassigned: number;
  issues: number;
  preferenceMatchPct: number | null;
  activeFilter: AssignmentFilterValue;
  onFilter: (filter: AssignmentFilterValue) => void;
  onOpenIssues: () => void;
}

export default function AssignmentSummaryDrawer({
  open,
  onClose,
  total,
  assigned,
  unassigned,
  issues,
  preferenceMatchPct,
  activeFilter,
  onFilter,
  onOpenIssues,
}: AssignmentSummaryDrawerProps) {
  const selectFilter = (filter: AssignmentFilterValue) => {
    onFilter(activeFilter === filter ? 'all' : filter);
  };

  const openIssues = () => {
    onOpenIssues();
  };

  const metrics: AcademicInsightMetric[] = [
    {
      id: 'total',
      label: 'Total students',
      value: total,
      helper: 'Students in the current group',
      icon: 'solar:users-group-rounded-outline',
      selected: activeFilter === 'all',
      onClick: () => selectFilter('all'),
    },
    {
      id: 'assigned',
      label: 'Assigned',
      value: assigned,
      helper: 'Elective selection complete',
      icon: 'solar:check-circle-outline',
      selected: activeFilter === 'assigned',
      onClick: () => selectFilter('assigned'),
    },
    {
      id: 'unassigned',
      label: 'Unassigned',
      value: unassigned,
      helper: 'Still needs a selection',
      icon: 'solar:clock-circle-outline',
      selected: activeFilter === 'unassigned',
      onClick: () => selectFilter('unassigned'),
    },
    {
      id: 'issues',
      label: 'Validation issues',
      value: issues,
      helper: 'Open the issue review queue',
      icon: 'solar:danger-triangle-outline',
      onClick: openIssues,
    },
    {
      id: 'preference-match',
      label: 'Preference match',
      value: preferenceMatchPct === null ? 'N/A' : `${preferenceMatchPct}%`,
      helper: 'Students matched to a preferred option',
      icon: 'solar:star-outline',
      selected: activeFilter === 'preferenceMismatch',
      onClick: () => selectFilter('preferenceMismatch'),
    },
    {
      id: 'capacity',
      label: 'Capacity used',
      value: `${assigned}/${total}`,
      helper: 'Completed assignments in this group',
      icon: 'solar:pie-chart-2-outline',
    },
  ];

  return (
    <AcademicInsights
      hideTrigger
      open={open}
      onClose={onClose}
      title="Elective assignment insights"
      description="Assignment progress, preference alignment and exceptions for the selected group."
      metrics={metrics}
      chart={{
        title: 'Assignment progress',
        description: 'Compare completed assignments with remaining work and validation issues.',
        categories: ['Assigned', 'Unassigned', 'Issues'],
        values: [assigned, unassigned, issues],
        seriesName: 'Students',
      }}
      focus={{
        title:
          issues > 0
            ? `${issues} validation issues need review`
            : `${unassigned} students remain unassigned`,
        description:
          issues > 0
            ? 'Resolve validation issues before reviewing and locking the elective assignments.'
            : unassigned > 0
              ? 'Complete the remaining student selections before locking this group.'
              : 'Assignments are complete and ready for final review.',
      }}
    />
  );
}
