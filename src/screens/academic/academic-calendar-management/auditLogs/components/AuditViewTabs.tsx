import { Tab, Paper } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';

import type { AuditView } from '../types/auditLogs.types';

export const AUDIT_VIEWS = [
  { value: 'table', label: 'Table', icon: 'mdi:table-large' },
  { value: 'timeline', label: 'Timeline', icon: 'mdi:timeline-clock-outline' },
  { value: 'analytics', label: 'Analytics', icon: 'mdi:chart-box-outline' },
] as const;

export default function AuditViewTabs({
  view,
  onChange,
}: {
  view: AuditView;
  onChange: (view: AuditView) => void;
}) {
  return (
    <Paper sx={{ flexShrink: 0, minWidth: 0 }}>
      <CustomTabs
        value={view}
        onChange={(_, next) => onChange(next)}
        aria-label="Audit log views"
        slotProps={{ flexContainer: { gap: 1 } }}
      >
        {AUDIT_VIEWS.map((item) => (
          <Tab
            key={item.value}
            value={item.value}
            label={item.label}
            id={`audit-${item.value}-tab`}
            aria-controls={`audit-${item.value}-panel`}
            icon={<Iconify icon={item.icon} width={20} />}
            iconPosition="start"
          />
        ))}
      </CustomTabs>
    </Paper>
  );
}
