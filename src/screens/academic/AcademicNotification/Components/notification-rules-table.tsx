import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AcademicNotificationRuleRow } from 'src/redux/academic-notifications/response-adapters';

import { Label } from 'src/components/label';
import { Stack, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { notificationLabel } from 'src/redux/academic-notifications/response-adapters';

interface Props {
  rows: AcademicNotificationRuleRow[];
  search: string;
  loading: boolean;
  refreshing: boolean;
  error: unknown;
  filtered: boolean;
  onSearch: (search: string) => void;
  onClear: () => void;
  onRetry: () => void;
  onConfigure?: (row: AcademicNotificationRuleRow) => void;
}

const columns: IColumn[] = [
  { id: 'name', label: 'Event', rowHeader: true, minWidth: 195 },
  { id: 'trigger', label: 'Trigger', minWidth: 125 },
  { id: 'status', label: 'Rule status', minWidth: 160, render: (_, row) => (
    <Label color={row.state === 'enabled' ? 'success' : 'default'}>{row.status}</Label>
  ) },
  { id: 'readiness', label: 'Delivery readiness', minWidth: 245, render: (_, record) => {
    const row = record as AcademicNotificationRuleRow;
    if (!row.event.availability.isAvailable) return 'Event integration unavailable';
    const missing = row.deliveryChannels.filter((channel) => !channel.configured);
    const configuration = row.item.effectiveRule?.configuration;
    return (
      <Stack gap={0.5}>
        {row.deliveryChannels.length > 0 && (
          <Typography variant="body2">{row.deliveryChannels.map((channel) => channel.label).join(', ')}</Typography>
        )}
        {missing.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            Set up {missing.map((channel) => channel.label).join(', ')}
          </Typography>
        )}
        {configuration && configuration.templateIds.length === 0 && <span>Published template required</span>}
        {!configuration && <span>Awaiting configuration</span>}
      </Stack>
    );
  } },
];

export function NotificationRulesTable({ rows, search, loading, refreshing, error, filtered, onSearch, onClear, onRetry, onConfigure }: Props) {
  const actionColumns: IColumn[] = onConfigure ? [{
    id: 'actions', label: 'Actions', align: 'right', sticky: true, stickyPosition: 'right',
    render: (_, row) => (
      <Button size="small" aria-label={`Configure ${row.name}`} onClick={() => onConfigure(row as AcademicNotificationRuleRow)}>Configure</Button>
    ),
  }] : [];
  const data = rows.map((row) => ({
    ...row,
    category: notificationLabel(row.event.definition.category),
  }));
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
      isFilter={false}
      showExport={false}
      searchTerm={search}
      onSearchInputChange={onSearch}
      searchableFields={['name', 'trigger', 'status', 'category']}
      noDataText={filtered ? (
        <Stack alignItems="center" gap={1}>
          <span>No notification rules match these filters.</span>
          <Button size="small" onClick={onClear}>Clear filters</Button>
        </Stack>
      ) : 'No notification rules are available for this scope.'}
      wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
      tableContainerProps={{ sx: { height: 1 } }}
    />
  );
}
