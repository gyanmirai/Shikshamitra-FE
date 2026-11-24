import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type { AcademicNotificationRuleRow } from 'src/redux/academic-notifications/response-adapters';

import { useMemo, useState } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Stack, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { notificationLabel } from 'src/redux/academic-notifications/response-adapters';

import { notificationRuleStatuses } from '../use-notification-workspace-state';

interface Props {
  rows: AcademicNotificationRuleRow[];
  search: string;
  status: string;
  criteriaKey: string;
  loading: boolean;
  refreshing: boolean;
  error: unknown;
  filtered: boolean;
  onSearch: (search: string) => void;
  onStatusChange: (status: string) => void;
  onClear: () => void;
  onRetry: () => void;
  onConfigure?: (row: AcademicNotificationRuleRow) => void;
}

function deliveryReadiness(row: AcademicNotificationRuleRow) {
  const { availability, availabilityDetail } = row.event;
  if (!availability.isAvailable) {
    return { summary: 'Event integration unavailable', details: availabilityDetail ? [availabilityDetail] : [] };
  }

  const labels = (channels: AcademicNotificationRuleRow['deliveryChannels']) =>
    channels.map((channel) => channel.label).join(', ');
  const missing = labels(row.deliveryChannels.filter((channel) => channel.configured === false));
  const unknown = labels(row.deliveryChannels.filter((channel) => channel.configured === undefined));
  const configuration = row.item.effectiveRule?.configuration;

  return {
    summary: labels(row.deliveryChannels),
    details: [
      missing && `Set up ${missing}`,
      unknown && `Setup status unavailable for ${unknown}`,
      !configuration && 'Awaiting configuration',
      configuration?.templateIds.length === 0 && 'Published template required',
    ].filter((detail) => typeof detail === 'string' && detail.length > 0),
  };
}

const statusOptions = notificationRuleStatuses.filter(({ value }) => value !== 'all');
const searchFields = ['name', 'trigger', 'status', 'category', 'readinessText'];
const columns: IColumn[] = [
  { id: 'name', label: 'Event', rowHeader: true, minWidth: 195, isFilter: true, filterType: 'string' },
  { id: 'trigger', label: 'Trigger', minWidth: 150, isFilter: true, filterType: 'enum',
    enumOptions: ['On change', 'Scheduled reminder', 'Daily digest', 'Weekly summary', 'Manual']
      .map((label) => ({ value: label, label })),
  },
  { id: 'readinessText', label: 'Delivery readiness', minWidth: 245, isFilter: true, filterType: 'string', isSort: false,
    render: (_, { readiness }: { readiness?: ReturnType<typeof deliveryReadiness> }) => readiness && (
      <Stack gap={0.5} sx={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
        {readiness.summary && <Typography variant="body2">{readiness.summary}</Typography>}
        {readiness.details.map((detail) => (
          <Typography key={String(detail)} variant="caption" color="text.secondary">{detail}</Typography>
        ))}
      </Stack>
    ),
  },
  { id: 'status', label: 'Rule status', minWidth: 160, sticky: true, stickyPosition: 'right', stickyOnMobile: false,
    isFilter: true, filterType: 'enum', enumOptions: statusOptions, filterValue: (_, row) => row.state,
    render: (_, row) => <Label color={row.state === 'enabled' ? 'success' : 'default'}>{row.status}</Label>,
  },
];

export function NotificationRulesTable({
  rows, search, status, criteriaKey, loading, refreshing, error, filtered,
  onSearch, onStatusChange, onClear, onRetry, onConfigure,
}: Props) {
  const [columnFilters, setColumnFilters] = useState<IParams['filters']>([]);
  const [pagination, setPagination] = useState({ criteriaKey, page: 0 });
  const statusOption = statusOptions.find((option) => option.value === status);
  // Keep the table’s controlled filters stable while unrelated reads or pagination update.
  const filters = useMemo(() => statusOption ? [...columnFilters, {
    column: 'status', type: 'equals', value: statusOption.value, valueType: 'enum',
    label: 'Rule status', displayValue: statusOption.label,
  }] : columnFilters, [columnFilters, statusOption]);

  function resetPage() {
    setPagination({ criteriaKey, page: 0 });
  }

  const actionColumns: IColumn[] = onConfigure ? [{
    id: 'actions', label: 'Actions', width: 92, sticky: true, stickyPosition: 'right',
    isFilter: false, isSort: false, excludeFromExport: true,
    render: (_, row) => (
      <AdaptiveThreeDotsActions
        directActionLimit={2}
        sx={{ justifyContent: 'flex-end' }}
        actions={[{ id: 'configure', label: `Configure ${row.name}`, icon: GlobalIcons.academicFieldSettings,
          onClick: () => onConfigure(row as AcademicNotificationRuleRow) }]}
      />
    ),
  }] : [];
  const data = rows.map((row) => {
    const readiness = deliveryReadiness(row);
    return {
      ...row,
      category: notificationLabel(row.event.definition.category),
      readiness,
      readinessText: [readiness.summary, ...readiness.details].filter(Boolean).join(' '),
    };
  });

  return (
    <CustomizableTable
      tableId="academic-notification-rules"
      tableTitle="Academic notification rules"
      columns={[...columns, ...actionColumns]}
      data={data}
      isLoading={loading}
      isRefreshing={refreshing}
      error={error}
      onRetry={onRetry}
      showColumns
      showFullScreen
      showExport={false}
      searchTerm={search}
      searchFieldProps={{ placeholder: 'Search rules…', inputProps: { 'aria-label': 'Search notification rules' } }}
      onSearchInputChange={(value) => { resetPage(); onSearch(value); }}
      searchableFields={searchFields}
      filters={filters}
      onFiltersChange={(next) => {
        resetPage();
        setColumnFilters(next.filter((filter) => filter.column !== 'status'));
        const nextStatus = next.findLast((filter) => filter.column === 'status')?.value ?? 'all';
        if (nextStatus !== status) onStatusChange(nextStatus);
      }}
      externalFiltersActive={filtered}
      onClearCriteria={() => { resetPage(); setColumnFilters([]); onClear(); }}
      noDataText="No notification rules are available for this scope."
      page={pagination.criteriaKey === criteriaKey ? pagination.page : 0}
      paginationDisabled={loading}
      onPaginationChange={(page) => setPagination({ criteriaKey, page })}
      onSortChange={() => resetPage()}
      wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
      tableContainerProps={{ sx: { height: 1, minHeight: 0 } }}
    />
  );
}
