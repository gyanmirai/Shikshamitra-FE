import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionPipelineItem } from 'src/redux/student/admissions/admission-pipeline-api';

import Link from 'next/link';
import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import { Stack, Button, Checkbox, Typography } from '@mui/material';

import { formatAdmissionReference } from '../admission-reference';
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
      minWidth: 220,
      isSort: true,
      render: (value) => (
        <Stack spacing={0.25}>
          <Typography variant="body2" fontWeight={600}>
            {String(value)}
          </Typography>
        </Stack>
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
      minWidth: 150,
      render: (_, row) => (
        <Stack spacing={0.25}>
          <Typography variant="body2">{row.standardName || 'Class unavailable'}</Typography>
        </Stack>
      ),
    },
    {
      id: 'currentStageName',
      label: 'Current step',
      minWidth: 170,
      isSort: true,
      render: (_, row) => row.currentStageName || 'No current step',
    },
    {
      id: 'nextRequiredAction',
      label: 'Next action',
      minWidth: 260,
      render: (_, row) => row.nextRequiredAction || 'Open application to review the next action',
    },
    {
      id: 'assignedCounsellorName',
      label: 'Counsellor',
      minWidth: 160,
      render: (_, row) =>
        row.assignedCounsellorName ||
        (row.assignedCounsellorId ? 'Assigned counsellor unavailable' : 'Unassigned'),
    },
    {
      id: 'nextFollowUpAt',
      label: 'Follow-ups',
      minWidth: 180,
      render: (_, row) => (
        <Stack spacing={0.5}>
          <Typography variant="body2">
            {row.inquiryId === null
              ? 'No inquiry follow-ups'
              : row.openFollowUpCount
                ? `${row.openFollowUpCount} open`
                : 'No open follow-ups'}
          </Typography>
          {row.nextFollowUpAt ? (
            <Typography variant="caption" color="text.secondary">
              {fDateTime(row.nextFollowUpAt)}
            </Typography>
          ) : null}
          {row.hasOverdueFollowUp ? <Label color="warning">Follow-up overdue</Label> : null}
        </Stack>
      ),
    },
    {
      id: 'enteredAt',
      label: 'Step entered',
      minWidth: 190,
      isSort: true,
      render: (_, row) => (
        <Stack spacing={0.25}>
          <Typography variant="body2">
            {row.enteredAt ? fDateTime(row.enteredAt) : 'Not recorded'}
          </Typography>
          {row.dueAt ? (
            <Typography variant="caption" color="text.secondary">
              Due {fDateTime(row.dueAt)}
            </Typography>
          ) : null}
          {row.dueAt && new Date(row.dueAt).getTime() < Date.now() ? (
            <Label color="warning">Step deadline passed</Label>
          ) : null}
        </Stack>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sticky: true,
      minWidth: 140,
      render: (value) => (
        <Label color={getAdmissionApplicationStatusColor(value)}>
          {getAdmissionApplicationStatusLabel(value)}
        </Label>
      ),
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
      id: 'actions',
      label: 'Actions',
      minWidth: 120,
      width: 120,
      sticky: true,
      stickyPosition: 'right',
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
      render: (_, row) => (
        <Button
          component={Link}
          href={applicationUrl(row.id)}
          aria-label={`Continue ${formatAdmissionReference(row.applicationNumber)}`}
          size="small"
          variant="outlined"
          onClick={(event) => {
            event.stopPropagation();
            if (
              onOpen &&
              !event.ctrlKey &&
              !event.metaKey &&
              !event.shiftKey &&
              !event.altKey &&
              event.button === 0
            ) {
              event.preventDefault();
              onOpen(row.id);
            }
          }}
        >
          Continue
        </Button>
      ),
    },
  ];
  if (selection) {
    const selectedCount = selection.eligibleIds.filter((id) =>
      selection.selectedIds.includes(id)
    ).length;
    columns.forEach((column) => {
      if (column.id === 'applicantName') {
        column.headerSx = { width: { xs: 140, sm: 220 }, minWidth: { xs: 140, sm: 220 } };
        column.cellSx = { width: { xs: 140, sm: 220 }, minWidth: { xs: 140, sm: 220 } };
      }
      if (column.id === 'status') column.stickyOnMobile = false;
      if (column.id === 'actions') {
        column.headerSx = { width: { xs: 100, sm: 120 }, minWidth: { xs: 100, sm: 120 } };
        column.cellSx = { width: { xs: 100, sm: 120 }, minWidth: { xs: 100, sm: 120 } };
      }
    });
    columns.unshift({
      id: 'pipeline-selection',
      label: '',
      width: 64,
      minWidth: 64,
      headerSx: { px: 1 },
      cellSx: { px: 1 },
      align: 'center',
      sticky: true,
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
