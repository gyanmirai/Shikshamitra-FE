import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionPipelineItem } from 'src/redux/student/admissions/admission-pipeline-api';

import { Label } from 'src/components/label';
import { Checkbox, Typography } from '@mui/material';

import { AdmissionPipelineRowActions } from './admission-pipeline-row-actions';
import { renderPipelineStep, renderPipelineFollowUps } from './admission-pipeline-row-content';
import {
  getAdmissionApplicationStatusColor,
  getAdmissionApplicationStatusLabel,
} from '../application-status';

export type PipelineRowSelection = {
  selectedIds: string[];
  eligibleIds: string[];
  disabled: boolean;
  onToggle: (row: AdmissionPipelineItem, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
};

export function buildAdmissionPipelineColumns(
  applicationUrl: (id: string) => string,
  onOpen?: (id: string) => void,
  selection?: PipelineRowSelection
): IColumn[] {
  const columns: IColumn[] = [
    {
      id: 'applicantName',
      label: 'Student Name',
      sticky: true,
      stickyOnMobile: false,
      minWidth: 170,
      maxWidth: 240,
      isSort: true,
      render: (value) => (
        <Typography variant="body2" fontWeight={600} noWrap title={String(value)}>
          {String(value)}
        </Typography>
      ),
    },
    {
      id: 'applicationNumber',
      label: 'Application',
      defaultHidden: true,
      isSort: true,
      minWidth: 140,
    },
    { id: 'inquiryNumber', label: 'Inquiry', defaultHidden: true, minWidth: 140 },
    {
      id: 'standardName',
      label: 'Class',
      minWidth: 90,
      maxWidth: 160,
      render: (_, row) => (
        <Typography variant="body2" noWrap>
          {row.standardName || 'Class unavailable'}
        </Typography>
      ),
    },
    {
      id: 'currentStageName',
      label: 'Current step',
      minWidth: 220,
      maxWidth: 280,
      isSort: true,
      render: (_, row) => renderPipelineStep(row as AdmissionPipelineItem),
    },
    {
      id: 'nextFollowUpAt',
      label: 'Follow-ups',
      minWidth: 210,
      maxWidth: 260,
      render: (_, row) => renderPipelineFollowUps(row as AdmissionPipelineItem),
    },
    {
      id: 'contactPhone',
      label: 'Phone',
      defaultHidden: true,
      minWidth: 140,
      render: (value) => value || '—',
    },
    {
      id: 'contactEmail',
      label: 'Email',
      defaultHidden: true,
      minWidth: 190,
      render: (value) => value || '—',
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 90,
      render: (value) => (
        <Label color={getAdmissionApplicationStatusColor(value)}>
          {getAdmissionApplicationStatusLabel(value)}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 200,
      width: 200,
      headerSx: { width: { xs: 112, sm: 200 }, minWidth: { xs: 112, sm: 200 } },
      cellSx: { width: { xs: 112, sm: 200 }, minWidth: { xs: 112, sm: 200 } },
      sticky: true,
      stickyPosition: 'right',
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
      render: (_, row) => (
        <AdmissionPipelineRowActions
          row={row as AdmissionPipelineItem}
          href={applicationUrl(row.id)}
          onOpen={onOpen}
        />
      ),
    },
  ];
  if (selection) {
    const selectedCount = selection.eligibleIds.filter((id) =>
      selection.selectedIds.includes(id)
    ).length;
    columns.forEach((column) => {
      if (column.id === 'applicantName') {
        column.headerSx = { width: { xs: 140, sm: 170 }, minWidth: { xs: 140, sm: 170 } };
        column.cellSx = { width: { xs: 140, sm: 170 }, minWidth: { xs: 140, sm: 170 } };
        column.stickyOnMobile = false;
      }
      if (column.id === 'status') column.stickyOnMobile = false;
    });
    columns.unshift({
      id: 'pipeline-selection',
      label: '',
      width: 56,
      minWidth: 56,
      headerSx: { px: 1 },
      cellSx: { px: 1 },
      align: 'center',
      sticky: true,
      stickyOnMobile: false,
      stickyPosition: 'left',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      renderColumn: () => (
        <Checkbox
          size="small"
          sx={{ width: 44, height: 44 }}
          checked={selectedCount > 0 && selectedCount === selection.eligibleIds.length}
          indeterminate={selectedCount > 0 && selectedCount < selection.eligibleIds.length}
          disabled={selection.disabled || !selection.eligibleIds.length}
          inputProps={{
            'aria-label': 'Select all eligible applications on this page',
            'aria-checked':
              selectedCount > 0 && selectedCount < selection.eligibleIds.length
                ? 'mixed'
                : undefined,
          }}
          onChange={(_, checked) => selection.onToggleAll(checked)}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        />
      ),
      render: (_, row) => (
        <Checkbox
          size="small"
          sx={{ width: 44, height: 44 }}
          checked={selection.selectedIds.includes(row.id)}
          disabled={selection.disabled || !selection.eligibleIds.includes(row.id)}
          inputProps={{
            'aria-label': `Select ${row.applicantName || row.applicationNumber} for counsellor assignment`,
          }}
          onChange={(_event, checked) => selection.onToggle(row as AdmissionPipelineItem, checked)}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        />
      ),
    });
  }
  return columns.map((column) => ({ isFilter: false, isSort: false, ...column }));
}
