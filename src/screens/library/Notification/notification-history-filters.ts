import type { IParams } from 'src/components/customizabaleTable/types';

export type HistoryCriteria = { eventType: string; channel: string; status: string };
const fields = ['eventType', 'channel', 'status'] as const;
export function historyColumnFilters(criteria: HistoryCriteria): IParams['filters'] {
  return fields
    .filter((field) => criteria[field])
    .map((column) => ({
      column,
      type: 'equals',
      value: criteria[column],
      valueType: 'enum',
      label: column === 'eventType' ? 'Event' : column === 'channel' ? 'Channel' : 'Status',
      displayValue: criteria[column],
    }));
}
export function historyFilterValues(filters: IParams['filters']): HistoryCriteria {
  const selected = (field: string) =>
    String(
      filters.filter((item) => item.column === field && item.type === 'equals').at(-1)?.value || ''
    );
  return {
    eventType: selected('eventType'),
    channel: selected('channel'),
    status: selected('status'),
  };
}
