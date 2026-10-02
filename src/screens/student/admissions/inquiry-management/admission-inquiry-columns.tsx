import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';
import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import NextLink from 'next/link';
import { Label } from 'src/components/label';
import { Stack, Typography } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { formatAdmissionReference } from '../admission-reference';
import { UNASSIGNED_INQUIRIES_FILTER } from './admission-inquiry-filters';
import {
  inquirySourceLabel,
  inquiryStatusLabel,
  INQUIRY_SOURCE_OPTIONS,
  INQUIRY_STATUS_OPTIONS,
} from './admission-inquiry-list-options';

type Options = {
  canManage: boolean;
  canAssign: boolean;
  canCommunicate: boolean;
  isMarkingContacted: boolean;
  counsellorNames: Record<string, string>;
  counsellorOptions: { label: string; value: string }[];
  offeringOptions: { label: string; value: string }[];
  onOpenApplicant360: (inquiry: AdmissionInquiry) => void;
  onManage: (inquiry: AdmissionInquiry) => void;
  onAssign: (inquiry: AdmissionInquiry) => void;
  onCommunicate: (inquiry: AdmissionInquiry) => void;
  onMarkContacted: (inquiry: AdmissionInquiry) => void;
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
  if (inquiry.applicantId)
    actions.push({
      id: 'applicant360',
      label: `Open Applicant 360 for ${inquiry.applicantName}`,
      icon: 'mdi:account-circle-outline',
      onClick: () => options.onOpenApplicant360(inquiry),
    });
  if (options.canManage)
    actions.push({
      id: 'manage',
      label: `Edit inquiry ${reference}`,
      icon: 'solar:pen-bold',
      onClick: () => options.onManage(inquiry),
    });
  if (options.canAssign && inquiry.admissionOfferingId)
    actions.push({
      id: 'assign',
      label: `${inquiry.assignedCounsellorId ? 'Reassign' : 'Assign'} counsellor for ${inquiry.applicantName}`,
      icon: 'mdi:account-arrow-right-outline',
      onClick: () => options.onAssign(inquiry),
    });
  if (options.canCommunicate)
    actions.push({
      id: 'communicate',
      label: `Compose communication for ${inquiry.applicantName}`,
      icon: 'mdi:message-text-outline',
      onClick: () => options.onCommunicate(inquiry),
    });
  if (options.canManage && inquiry.status === 0)
    actions.push({
      id: 'markContacted',
      label: `Mark ${inquiry.applicantName} contacted`,
      icon: 'mdi:phone-check-outline',
      disabled: options.isMarkingContacted,
      tooltip: options.isMarkingContacted ? 'Updating contact status…' : undefined,
      onClick: () => options.onMarkContacted(inquiry),
    });
  return actions;
}

export function buildAdmissionInquiryColumns(options: Options): IColumn[] {
  return [
    {
      id: 'inquiryNumber',
      label: 'Inquiry',
      minWidth: 140,
      filterType: 'string',
      sticky: true,
      stickyPosition: 'left',
      stickyOnMobile: false,
      render: (value) => formatAdmissionReference(String(value)),
    },
    {
      id: 'applicantName',
      label: 'Applicant',
      minWidth: 220,
      sticky: true,
      stickyPosition: 'left',
      stickyOnMobile: false,
      render: (value, row) => {
        const inquiry = row as AdmissionInquiry;
        return inquiry.applicantId ? (
          <NextLink
            href={`${studentPaths.enrollment.root}/applicants/${inquiry.applicantId}`}
            onClick={(event) => event.stopPropagation()}
          >
            {String(value)}
          </NextLink>
        ) : (
          String(value)
        );
      },
    },
    {
      id: 'admissionOfferingId',
      label: 'Admission interest',
      minWidth: 190,
      filterType: 'enum',
      enumOptions: options.offeringOptions,
      render: (_value, row) => {
        const inquiry = row as AdmissionInquiry;
        return (
          <Stack spacing={0.25}>
            <Typography variant="body2">
              {inquiry.admissionOfferingCode || 'Cycle inquiry'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {inquiry.admissionCycleName || 'Admission cycle'}
            </Typography>
          </Stack>
        );
      },
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
      id: 'assignedCounsellorId',
      label: 'Counsellor',
      minWidth: 180,
      filterType: 'enum',
      enumOptions: [
        { label: 'Unassigned', value: UNASSIGNED_INQUIRIES_FILTER },
        ...options.counsellorOptions,
      ],
      render: (value, row) => {
        const inquiry = row as AdmissionInquiry;
        return value
          ? inquiry.assignedCounsellorName || options.counsellorNames[String(value)] || 'Assigned'
          : 'Unassigned';
      },
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
      minWidth: 140,
      filterType: 'enum',
      enumOptions: INQUIRY_STATUS_OPTIONS,
      sticky: true,
      stickyPosition: 'right',
      stickyOnMobile: false,
      render: (value) => (
        <Label color={statusColors[Number(value)]}>{inquiryStatusLabel(value)}</Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 152,
      minWidth: 152,
      maxWidth: 152,
      align: 'right',
      sticky: true,
      stickyPosition: 'right',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_, row) => {
        const inquiry = row as AdmissionInquiry;
        const reference = formatAdmissionReference(inquiry.inquiryNumber);

        return (
          <AdaptiveThreeDotsActions
            placement="right-top"
            moreLabel={`More actions for ${reference}`}
            mobileDirectActionLimit={0}
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
