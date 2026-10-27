import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';
import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Stack, Typography } from '@mui/material';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { inquiryHandoffBlocker } from './use-inquiry-handoff';
import { formatAdmissionReference } from '../admission-reference';
import {
  inquirySourceLabel,
  inquiryStatusLabel,
  INQUIRY_SOURCE_OPTIONS,
  INQUIRY_STATUS_OPTIONS,
  normalizeInquiryStatus,
} from './admission-inquiry-list-options';

type Options = {
  canManage: boolean;
  canMove: boolean;
  isMoving: boolean;
  movingInquiryId?: string | null;
  pipeline?: boolean;
  canOpenApplication?: boolean;
  counsellorNames: Record<string, string>;
  counsellorOptions: { label: string; value: string }[];
  offeringOptions: { label: string; value: string }[];
  onManage: (inquiry: AdmissionInquiry) => void;
  onFollowUp?: (inquiry: AdmissionInquiry) => void;
  onHistory?: (inquiry: AdmissionInquiry) => void;
  onMove: (inquiry: AdmissionInquiry) => void;
};

const statusColors: Record<number, LabelColor> = {
  0: 'info',
  1: 'primary',
  2: 'success',
  3: 'warning',
  4: 'info',
  5: 'success',
  6: 'default',
  7: 'error',
  8: 'warning',
};

export function getAdmissionInquiryActions(
  inquiry: AdmissionInquiry,
  options: Options
): AdaptiveThreeDotsAction[] {
  const actions: AdaptiveThreeDotsAction[] = [];
  const reference = formatAdmissionReference(inquiry.inquiryNumber);
  if (options.pipeline)
    return [
      {
        id: 'application',
        label: `Open application for ${inquiry.applicantName}`,
        icon: 'mdi:file-document-edit-outline',
        disabled: !inquiry.applicationId || options.canOpenApplication === false,
        tooltip:
          options.canOpenApplication === false
            ? 'You do not have permission to view applications.'
            : !inquiry.applicationId
              ? 'The historical application link could not be resolved.'
              : undefined,
        onClick: () => options.onManage(inquiry),
      },
    ];
  if (options.canManage)
    actions.push({
      id: 'edit',
      label: `Edit ${reference}`,
      icon: GlobalIcons.edit,
      disabled: options.isMoving,
      tooltip: options.isMoving ? 'Wait for the inquiry to move to the next stage.' : undefined,
      onClick: () => options.onManage(inquiry),
    });
  if (options.canManage && options.onFollowUp)
    actions.push({
      id: 'follow-up',
      label: `Follow-up ${reference}`,
      icon: GlobalIcons.notebook,
      disabled:
        options.isMoving ||
        Boolean(inquiry.isTransferred || inquiry.applicationId || inquiry.isDuplicate),
      tooltip:
        inquiry.isTransferred || inquiry.applicationId
          ? 'Continue this application from Pipeline.'
          : inquiry.isDuplicate
            ? 'Continue the original inquiry.'
            : undefined,
      onClick: () => options.onFollowUp?.(inquiry),
    });
  if (options.canMove)
    actions.push({
      id: 'move',
      label: `Move ${reference} to next stage`,
      icon: 'mdi:arrow-right-circle-outline',
      disabled: options.isMoving || Boolean(inquiryHandoffBlocker(inquiry)),
      loading: options.isMoving && options.movingInquiryId === inquiry.id,
      tooltip: options.isMoving
        ? options.movingInquiryId === inquiry.id
          ? 'Moving inquiry…'
          : 'Wait for the current inquiry to finish moving.'
        : inquiryHandoffBlocker(inquiry),
      onClick: () => options.onMove(inquiry),
    });
  if (options.onHistory)
    actions.push({
      id: 'history',
      label: `Handling history for ${reference}`,
      icon: 'mdi:history',
      disabled: options.isMoving,
      onClick: () => options.onHistory?.(inquiry),
    });
  return actions;
}

export function buildAdmissionInquiryColumns(options: Options): IColumn[] {
  return [
    {
      id: 'inquiryNumber',
      label: 'Inquiry',
      minWidth: 150,
      filterType: 'string',
      sticky: true,
      stickyPosition: 'left',
      stickyOnMobile: false,
      render: (value) => formatAdmissionReference(String(value)),
    },
    {
      id: 'applicantName',
      label: 'Student name',
      minWidth: 220,
      sticky: true,
      stickyPosition: 'left',
      stickyOnMobile: false,
      render: (value, row) => String(value),
    },
    {
      id: 'standardName',
      label: 'Class',
      minWidth: 190,
      filterType: 'string',
      filterOperators: ['contains', 'equals', 'startsWith', 'endsWith'],
      render: (_value, row) => (row as AdmissionInquiry).standardName || '—',
    },
    {
      id: 'normalizedPhone',
      label: 'Phone',
      minWidth: 140,
      filterType: 'string',
      render: (value) => (value ? String(value) : '—'),
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 220,
      filterType: 'string',
      render: (value) => (value ? String(value) : '—'),
    },

    {
      id: 'source',
      label: 'Source',
      minWidth: 130,
      filterType: 'enum',
      enumOptions: INQUIRY_SOURCE_OPTIONS,
      render: (value, row) => {
        const inquiry = row as AdmissionInquiry;
        return (
          <Stack spacing={0.25}>
            <Typography variant="body2">{inquirySourceLabel(value)}</Typography>
            {inquiry.sourceDetail && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {inquiry.sourceDetail}
              </Typography>
            )}
          </Stack>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      stickyOnMobile: false,
      minWidth: 140,
      filterType: 'enum',
      enumOptions: INQUIRY_STATUS_OPTIONS,
      sticky: true,
      stickyPosition: 'right',
      render: (value) => (
        <Label color={statusColors[normalizeInquiryStatus(value)]}>
          {inquiryStatusLabel(value)}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 152,
      minWidth: 152,
      maxWidth: 152,
      align: 'right',
      headerAlign: 'left',
      sticky: true,
      stickyPosition: 'right',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_, row) => {
        const inquiry = row as AdmissionInquiry;
        return (
          <AdaptiveThreeDotsActions
            mobileDirectActionLimit={0}
            moreLabel={`Actions for ${inquiry.applicantName}`}
            sx={{
              gap: 0,
              justifyContent: 'flex-end',
              '& .MuiIconButton-root': {
                width: { xs: 44, sm: 30 },
                height: { xs: 44, sm: 30 },
              },
            }}
            actions={getAdmissionInquiryActions(inquiry, options)}
          />
        );
      },
    },
  ];
}
