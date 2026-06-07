export const performanceWorkspaceSubmodules = [
  {
    value: 'overview',
    label: 'Overview',
    path: '/hr/professional-management/overview',
    icon: 'mdi:view-dashboard-edit-outline',
    description: 'Performance command center, readiness, queues, and next actions.',
  },
  {
    value: 'reviews',
    label: 'Reviews',
    path: '/hr/professional-management/reviews',
    icon: 'mdi:account-check-outline',
    description: 'Self reviews, reviewer queue, evidence, and classroom observations.',
  },
  {
    value: 'cycles-templates',
    label: 'Cycles & Templates',
    path: '/hr/professional-management/cycles',
    icon: 'mdi:calendar-sync-outline',
    description: 'Appraisal cycles, Indian board templates, and template builder.',
  },
  {
    value: 'outcomes',
    label: 'Outcomes',
    path: '/hr/professional-management/outcomes',
    icon: 'mdi:trophy-outline',
    description: 'Calibration, final outcomes, recommendations, and development plans.',
  },
  {
    value: 'reports',
    label: 'Reports',
    path: '/hr/professional-management/reports',
    icon: 'mdi:chart-box-outline',
    description: 'SQAAF evidence, pending actions, rating distribution, and exports.',
  },
  {
    value: 'settings',
    label: 'Settings',
    path: '/hr/professional-management/settings',
    icon: 'mdi:cog-outline',
    description: 'Admin setup, board presets, appraisal configuration, and SQAAF readiness.',
  },
  {
    value: 'setup-readiness',
    label: 'Setup & Readiness',
    path: '/hr/professional-management/settings/setup',
    icon: 'mdi:shield-check-outline',
    description: 'Board presets, appraisal cycle setup, assignments, and SQAAF readiness.',
    parentLabel: 'Settings',
  },
] as const;

export const performanceWorkspaceTabs = performanceWorkspaceSubmodules.filter(
  (item) => item.value !== 'overview' && item.value !== 'setup-readiness'
);

export type PerformanceWorkspaceTab = (typeof performanceWorkspaceSubmodules)[number]['value'];
