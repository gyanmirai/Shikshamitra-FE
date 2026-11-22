import type { IParams } from 'src/components/customizabaleTable/types';
import type { AdmissionWorkflowStatus } from 'src/redux/student/admissions/admission-workflows-api';

import { formatDateOnly } from 'src/utils/date-only';

import { ADMISSION_DATE_FORMAT } from '../admission-date-formats';
import { workflowColumnFilters, serializeWorkflowColumnFilters } from './workflow-column-filters';

import type { WorkflowFilters } from './use-workflow-filters';

export function activeWorkflowFilters(
  filters: WorkflowFilters,
  statusLabels: Record<AdmissionWorkflowStatus, string>
): IParams['filters'] {
  const active = workflowColumnFilters(filters.columnFilters ?? '');
  if (filters.version) {
    active.push({
      column: 'version',
      type: 'equals',
      value: Number(filters.version),
      valueType: 'number',
      label: 'Version',
    });
  }
  if (filters.status !== 'all') {
    active.push({
      column: 'status',
      type: 'equals',
      value: filters.status,
      valueType: 'enum',
      label: 'Status',
      displayValue: statusLabels[filters.status],
    });
  }
  if (filters.usage !== 'all') {
    active.push({
      column: 'usage',
      type: 'equals',
      value: filters.usage,
      valueType: 'enum',
      label: 'Usage',
      displayValue: filters.usage === 'used' ? 'In Use' : 'Not in Use',
    });
  }
  if (filters.createdFrom) {
    active.push({
      column: 'createdFrom',
      type: 'onOrAfter',
      value: filters.createdFrom,
      valueType: 'date',
      label: 'Created From',
      displayValue: formatDateOnly(filters.createdFrom, ADMISSION_DATE_FORMAT),
    });
  }
  if (filters.createdTo) {
    active.push({
      column: 'createdTo',
      type: 'onOrBefore',
      value: filters.createdTo,
      valueType: 'date',
      label: 'Created To',
      displayValue: formatDateOnly(filters.createdTo, ADMISSION_DATE_FORMAT),
    });
  }
  return active;
}

export function workflowFiltersFromTable(active: IParams['filters']): Partial<WorkflowFilters> {
  const status = active.findLast((filter) => filter.column === 'status')?.value;
  const version = active.findLast((filter) => filter.column === 'version');
  const usage = active.findLast((filter) => filter.column === 'usage')?.value;
  return {
    status: status === undefined ? 'all' : (Number(status) as AdmissionWorkflowStatus),
    version: version?.type === 'equals' ? String(version.value) : '',
    usage: usage === 'used' || usage === 'unused' ? usage : 'all',
    createdFrom: String(active.findLast((filter) => filter.column === 'createdFrom')?.value ?? ''),
    createdTo: String(active.findLast((filter) => filter.column === 'createdTo')?.value ?? ''),
    columnFilters: serializeWorkflowColumnFilters(
      version?.type === 'equals' ? active.filter((filter) => filter.column !== 'version') : active
    ),
  };
}
