import type { IColumn } from 'src/components/customizabaleTable/types';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Box, Stack, Button, Typography } from '@mui/material';
import { CALENDAR_AUDIT_ACTION_LABELS } from 'src/enums/academic-calendar';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import AuditActionBadge from './badges/AuditActionBadge';
import { AuditImpactLevel } from '../types/auditLogs.types';
import { summarizeImpact, formatAuditTimestamp } from '../utils/auditFormatters';
import { IMPACT_LABELS, IMPACT_COLOR_KEYS } from '../constants/auditLogs.constants';

import type { AuditLog } from '../types/auditLogs.types';

export function auditTableColumns(onOpen?: (log: AuditLog) => void): IColumn[] {
  const defaults = { align: 'left' as const, isSort: false, isFilter: false };
  return [
    {
      ...defaults,
      id: 'timestamp',
      label: 'Occurred at',
      minWidth: 150,
      render: (_, row) => {
        const ts = formatAuditTimestamp(row.timestamp);
        return (
          <Box title={ts.full}>
            <Typography variant="body2">{ts.date}</Typography>
            <Typography variant="caption" color="text.secondary">
              {ts.short}
            </Typography>
          </Box>
        );
      },
    },
    {
      ...defaults,
      id: 'action',
      label: 'Action',
      minWidth: 170,
      isFilter: true,
      filterType: 'enum',
      enumOptions: Object.entries(CALENDAR_AUDIT_ACTION_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
      render: (_, row) => <AuditActionBadge action={row.action} />,
    },
    {
      ...defaults,
      id: 'entityName',
      label: 'Entity',
      minWidth: 220,
      rowHeader: true,
      render: (_, row) => (
        <Box sx={{ overflowWrap: 'anywhere' }}>
          <Typography variant="body2" fontWeight={600}>
            {row.entityName || 'Unnamed record'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.entityType || 'Type not recorded'}
          </Typography>
        </Box>
      ),
    },
    {
      ...defaults,
      id: 'changedByName',
      label: 'Performed by',
      minWidth: 160,
      render: (_, row) => (
        <Box sx={{ overflowWrap: 'anywhere' }}>
          <Typography variant="body2">{row.changedByName || 'User not recorded'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.changedByRole}
          </Typography>
        </Box>
      ),
    },
    {
      ...defaults,
      id: 'reason',
      label: 'Reason',
      minWidth: 180,
      render: (_, row) => (
        <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
          {row.reason?.trim() || 'No reason recorded'}
        </Typography>
      ),
    },
    {
      ...defaults,
      id: 'impact',
      label: 'Impact',
      minWidth: 180,
      render: (_, row) => {
        if (row.impactLevel == null && !row.impact) {
          return (
            <Typography variant="body2" color="text.secondary">
              Impact not recorded
            </Typography>
          );
        }
        const level = row.impactLevel as AuditImpactLevel;
        return (
          <Stack alignItems="flex-start" spacing={0.5}>
            <Label variant="soft" color={IMPACT_COLOR_KEYS[level] ?? 'default'}>
              {IMPACT_LABELS[level] || 'Impact not recorded'}
            </Label>
            <Typography variant="caption" color="text.secondary">
              {summarizeImpact(row.impact)}
            </Typography>
          </Stack>
        );
      },
    },
    {
      ...defaults,
      id: 'changes',
      label: 'Changes',
      minWidth: 165,
      render: (_, row) =>
        row.hasDiff ? (
          <Button
            size="small"
            color="inherit"
            aria-label={`View changes for ${row.entityName || row.actionLabel}`}
            onClick={() => onOpen?.(row as AuditLog)}
          >
            View changes
          </Button>
        ) : (
          <Typography variant="caption" color="text.secondary">
            No changes recorded
          </Typography>
        ),
    },
    {
      ...defaults,
      id: 'actions',
      label: 'Actions',
      minWidth: 90,
      sticky: true,
      stickyPosition: 'right',
      excludeFromExport: true,
      render: (_, row) => (
        <AdaptiveThreeDotsActions
          directActionLimit={2}
          collapseOnOverflow={false}
          sx={{ justifyContent: 'flex-end' }}
          actions={
            onOpen
              ? [
                  {
                    id: 'view',
                    label: `View details for ${row.entityName || row.actionLabel}`,
                    icon: GlobalIcons.eye,
                    onClick: () => onOpen(row as AuditLog),
                  },
                ]
              : []
          }
        />
      ),
    },
  ];
}
