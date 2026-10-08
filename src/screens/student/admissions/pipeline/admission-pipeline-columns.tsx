import type { IColumn } from 'src/components/customizabaleTable/types';

import Link from 'next/link';
import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import { Stack, Button, Typography } from '@mui/material';

import { formatAdmissionReference } from '../admission-reference';
import {
  getAdmissionApplicationStatusColor,
  getAdmissionApplicationStatusLabel,
} from '../application-status';

export function buildAdmissionPipelineColumns(applicationUrl: (id: string) => string): IColumn[] {
  const columns: IColumn[] = [
    {
      id: 'applicantName',
      label: 'Applicant',
      minWidth: 220,
      isSort: true,
      render: (value, row) => (
        <Stack spacing={0.25}>
          <Typography variant="body2" fontWeight={600}>
            {String(value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatAdmissionReference(row.applicationNumber)} ·{' '}
            {row.inquiryNumber
              ? formatAdmissionReference(row.inquiryNumber)
              : 'Inquiry unavailable'}
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
          <Typography variant="caption" color="text.secondary">
            {row.offeringCode || 'Offering unavailable'}
          </Typography>
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
            {row.openFollowUpCount ? `${row.openFollowUpCount} open` : 'No open follow-ups'}
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
          sx={{ minHeight: 44 }}
        >
          Continue
        </Button>
      ),
    },
  ];
  return columns.map((column) => ({ isFilter: false, isSort: false, ...column }));
}
