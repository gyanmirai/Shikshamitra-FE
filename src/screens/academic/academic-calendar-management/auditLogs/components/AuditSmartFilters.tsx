'use client';

import { useState } from 'react';
import { Chip, Stack, Paper, Typography } from '@mui/material';
import { CALENDAR_AUDIT_ACTION_LABELS } from 'src/enums/academic-calendar';

import AuditSavedFilters from './AuditSavedFilters';
import AuditFilterToolbar from './AuditFilterToolbar';
import AuditAdvancedFilters from './AuditAdvancedFilters';
import {
  ROLE_OPTIONS,
  EMPTY_FILTERS,
  APPROVAL_OPTIONS,
  DATE_RANGE_OPTIONS,
  ENTITY_TYPE_OPTIONS,
} from '../constants/auditLogs.constants';

import type { AuditFilterState } from '../types/auditLogs.types';

interface Props {
  filters: AuditFilterState;
  onChange: (next: AuditFilterState) => void;
  onReset: () => void;
  totalCount?: number;
  displayedCount?: number;
  failed?: boolean;
  entityTypes?: string[];
  canManageSavedFilters?: boolean;
}
const LABELS: Record<keyof AuditFilterState, string> = {
  search: 'Search',
  action: 'Action',
  entityType: 'Entity type',
  entityId: 'Entity ID',
  changedByRole: 'Role',
  changedByUserId: 'User',
  impactLevel: 'Impact',
  hasDiff: 'Recorded changes',
  reasonAvailable: 'Reason recorded',
  approvalStatus: 'Approval status',
  dateRange: 'Date range',
  fromDate: 'From',
  toDate: 'To',
};
const OPTIONS = {
  changedByRole: ROLE_OPTIONS,
  dateRange: DATE_RANGE_OPTIONS,
  entityType: ENTITY_TYPE_OPTIONS,
  approvalStatus: APPROVAL_OPTIONS,
};
function criterionLabel(key: string, value: string) {
  if (key === 'action')
    return CALENDAR_AUDIT_ACTION_LABELS[Number(value) as keyof typeof CALENDAR_AUDIT_ACTION_LABELS];
  if (key === 'hasDiff' || key === 'reasonAvailable') return value === 'true' ? 'Yes' : 'No';
  return (
    OPTIONS[key as keyof typeof OPTIONS]?.find((option) => option.value === value)?.label ?? value
  );
}

export default function AuditSmartFilters({
  filters,
  onChange,
  onReset,
  totalCount,
  displayedCount,
  failed,
  entityTypes,
  canManageSavedFilters = true,
}: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const active = Object.entries(filters).filter(([, value]) => Boolean(value));
  return (
    <Paper sx={{ p: 1, flexShrink: 0 }}>
      <AuditFilterToolbar
        filters={filters}
        onChange={onChange}
        onReset={onReset}
        onAdvanced={() => setAdvancedOpen(true)}
        onSaved={() => setSavedOpen(true)}
        canManageSavedFilters={canManageSavedFilters}
      />
      <Typography
        component="p"
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, mb: 0 }}
        role="status"
      >
        {failed
          ? 'Audit history unavailable.'
          : typeof totalCount === 'number'
            ? `${totalCount} ${totalCount === 1 ? 'entry' : 'entries'} in history. ${displayedCount ?? 0} shown on this page.`
            : 'Loading audit history…'}{' '}
        Action filters apply to the full history. Search and advanced filters apply to this page.
      </Typography>
      {active.length > 0 && (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
          {active.map(([key, value]) => (
            <Chip
              key={key}
              size="small"
              label={`${LABELS[key as keyof AuditFilterState]}: ${criterionLabel(key, String(value))}`}
              onDelete={() =>
                onChange({
                  ...filters,
                  [key]: EMPTY_FILTERS[key as keyof AuditFilterState],
                  ...(key === 'dateRange' ? { fromDate: undefined, toDate: undefined } : {}),
                })
              }
            />
          ))}
        </Stack>
      )}
      {advancedOpen && (
        <AuditAdvancedFilters
          entityTypes={entityTypes}
          filters={filters}
          onApply={onChange}
          onClose={() => setAdvancedOpen(false)}
        />
      )}
      {savedOpen && (
        <AuditSavedFilters
          filters={filters}
          onApply={onChange}
          onClose={() => setSavedOpen(false)}
        />
      )}
    </Paper>
  );
}
