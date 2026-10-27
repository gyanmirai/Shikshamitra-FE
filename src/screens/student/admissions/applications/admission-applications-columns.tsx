import type { MouseEvent } from 'react';
import type { IColumn } from 'src/components/customizabaleTable/types';

import NextLink from 'next/link';
import { Label } from 'src/components/label';
import { Stack, Typography } from '@mui/material';
import { fDateTime } from 'src/utils/format-time';
import ThreeDotsActions from 'src/components/three-dots-actions';

import { formatAdmissionReference } from '../admission-reference';
import {
  getAdmissionApplicationStatusColor,
  getAdmissionApplicationStatusLabel,
  ADMISSION_APPLICATION_STATUS_LABELS,
} from '../application-status';

export function buildAdmissionApplicationsColumns({
  applicationUrl,
  onOpen,
}: {
  applicationUrl: (id: string) => string;
  onOpen: (id: string) => void;
}): IColumn[] {
  const openLink = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.stopPropagation();
    if (
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.button === 0
    ) {
      event.preventDefault();
      onOpen(id);
    }
  };
  const columns: IColumn[] = [
    {
      // Name and reference stay combined; global search handles both without an ambiguous header filter.
      id: 'applicantName',
      label: 'Applicant',
      isFilter: false,
      minWidth: 220,
      sticky: true,
      isSort: true,
      render: (_, row) => (
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography
            component={NextLink}
            href={applicationUrl(row.id)}
            onClick={(event) => openLink(event, row.id)}
            variant="body2"
            fontWeight={600}
            sx={{
              color: 'text.primary',
              textDecoration: 'none',
              overflowWrap: 'anywhere',
              '&:hover': { color: 'primary.main', textDecoration: 'underline' },
            }}
          >
            {row.applicantName || 'Applicant unavailable'}
          </Typography>
          <Typography
            component={NextLink}
            href={applicationUrl(row.id)}
            onClick={(event) => openLink(event, row.id)}
            variant="caption"
            sx={{
              color: 'text.secondary',
              textDecoration: 'none',
              overflowWrap: 'anywhere',
              '&:hover': { color: 'primary.main', textDecoration: 'underline' },
            }}
          >
            {formatAdmissionReference(row.applicationNumber)}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'standardName',
      label: 'Class',
      minWidth: 110,
      isSort: true,
      render: (_, row) => row.standardName || '—',
    },
    {
      // Phone and email stay combined; global search handles both without an ambiguous header filter.
      id: 'contactPhone',
      label: 'Contact',
      isFilter: false,
      minWidth: 200,
      isSort: true,
      render: (_, row) => (
        <Stack spacing={0.25}>
          <Typography variant="body2">{row.contactPhone || '—'}</Typography>
          {row.contactEmail ? (
            <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {row.contactEmail}
            </Typography>
          ) : null}
        </Stack>
      ),
    },

    {
      id: 'decisionEnteredAt',
      label: 'Decision phase entered',
      minWidth: 180,
      isSort: true,
      render: (_, row) =>
        row.decisionEnteredAt ? fDateTime(row.decisionEnteredAt) : 'Not recorded',
    },
    {
      id: 'lastSavedAt',
      label: 'Last saved',
      defaultHidden: true,
      minWidth: 170,
      isSort: true,
      render: (_, row) => (row.lastSavedAt ? fDateTime(row.lastSavedAt) : '—'),
    },
    {
      id: 'status',
      label: 'Status',
      stickyOnMobile: false,
      isFilter: true,
      filterType: 'enum',
      enumOptions: Object.entries(ADMISSION_APPLICATION_STATUS_LABELS).map(([value, label]) => ({
        value: Number(value),
        label,
      })),
      width: 170,
      minWidth: 170,
      sticky: true,
      stickyPosition: 'right',
      isSort: true,
      render: (_, row) => (
        <Label color={getAdmissionApplicationStatusColor(row.status)}>
          {getAdmissionApplicationStatusLabel(row.status)}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'right',
      width: 80,
      minWidth: 80,
      sticky: true,
      stickyPosition: 'right',
      excludeFromExport: true,
      render: (_, row) => (
        <ThreeDotsActions
          sx={{
            justifyContent: 'flex-end',
            '& .MuiIconButton-root': {
              minWidth: { xs: 44, sm: 30 },
              minHeight: { xs: 44, sm: 30 },
            },
          }}
          showViewIcon
          showThreeDots={false}
          viewLabel={`View ${formatAdmissionReference(row.applicationNumber)} for ${row.applicantName || 'applicant'}`}
          handleViewClick={() => onOpen(row.id)}
        />
      ),
    },
  ];
  return columns.map((column): IColumn => ({
    isFilter: false,
    isSort: false,
    ...column,
    headerAlign: 'left',
    ...(column.id === 'standardName'
      ? {
          isFilter: true,
          filterType: 'string' as const,
          filterOperators: ['contains', 'equals', 'startsWith', 'endsWith'],
        }
      : {}),
    ...(['decisionEnteredAt', 'lastSavedAt'].includes(column.id)
      ? {
          isFilter: true,
          filterType: 'date' as const,
          filterOperators: ['equals', 'before', 'after'],
          align: 'right' as const,
          valueType: 'datetime' as const,
        }
      : {}),
  }));
}
