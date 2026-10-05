/**
 * Phased FE product milestones (UX-first). Shown on the payroll overview
 * to align the team; backend contracts can be introduced incrementally.
 */
export const PAYROLL_UX_ROADMAP_PHASES = [
  {
    id: 'phase-2',
    title: 'Phase 2 — Operator productivity',
    bullets: [
      'Saved filters, bulk row actions, and keyboard-first table flows.',
      'Exception queue with assignee, notes, and closure audit.',
      'Recurring run defaults and month-over-month run templates.',
    ],
  },
  {
    id: 'phase-3',
    title: 'Phase 3 — Advanced and differentiating',
    bullets: [
      'What-if simulation before final lock (attendance, components, TDS).',
      'Anomaly and variance explainer (statutory, PF/PT, net pay).',
      'In-context help for India payroll rules and school-specific policies.',
    ],
  },
  {
    id: 'phase-4',
    title: 'Phase 4 — Ecosystem',
    bullets: [
      'Manager approval gates and auditable sign-off on locked runs.',
      'Staff self-serve: payslip narrative, disputes, and acknowledgement.',
      'Cross-module view: leave and attendance changes reflected in the register.',
    ],
  },
] as const;
