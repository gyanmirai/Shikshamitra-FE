import type { IParams } from 'src/components/customizabaleTable/types';
import type { ConcessionApplication } from 'src/redux/finance/ConcessionManagement/types';

import { ConcessionStatusType, ConcessionStatusTypeColors } from 'src/enums/concession-status-type';

const statusGroups = [
  {
    value: ConcessionStatusType.Pending,
    label: 'Pending',
    tab: 'pending',
    statuses: [ConcessionStatusType.Draft, ConcessionStatusType.Pending],
  },
  {
    value: ConcessionStatusType.Approved,
    label: 'Approved',
    tab: 'approved',
    statuses: [
      ConcessionStatusType.Approved,
      ConcessionStatusType.PartiallyReversed,
      ConcessionStatusType.Reversed,
    ],
  },
  {
    value: ConcessionStatusType.Rejected,
    label: 'Rejected',
    tab: 'rejected',
    statuses: [ConcessionStatusType.Rejected, ConcessionStatusType.Cancelled],
  },
];

function statusGroup(status: number) {
  return statusGroups.find((group) => group.statuses.includes(status));
}

export function concessionStatusOptions() {
  return statusGroups.map(({ value, label }) => ({ value, label }));
}

export function concessionStatusLabel(status: number) {
  return statusGroup(status)?.label ?? '-';
}

export function concessionStatusColor(status: number) {
  const group = statusGroup(status);
  return group ? ConcessionStatusTypeColors[group.value] : 'default';
}

export function concessionStatusTab(status: number) {
  return statusGroup(status)?.tab;
}

export function expandConcessionStatusFilters(filters: IParams['filters']) {
  return filters.flatMap((filter) => {
    if (filter.column !== 'status') return [filter];
    const group = statusGroup(Number(filter.value));
    return group ? group.statuses.map((value) => ({ ...filter, value })) : [filter];
  });
}

export function toConcessionTableRow(item: ConcessionApplication) {
  return {
    ...item,
    studentIdentity: `${item.studentName || '-'}${item.grNumber ? ` (${item.grNumber})` : ''}`,
    classDivision: `${item.standardName || '-'} (${item.divisionName || '-'})`,
  };
}
