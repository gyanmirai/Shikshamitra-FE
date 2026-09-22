import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import NextLink from 'next/link';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Stack, MenuItem, MenuList, Typography } from '@mui/material';

import { UNASSIGNED_INQUIRIES_FILTER } from './admission-inquiry-filters';
import { formatAdmissionReference } from '../admission-reference';
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

type InquiryActionId = 'applicant360' | 'manage' | 'assign' | 'communicate' | 'markContacted';

export function getAdmissionInquiryActionPlan(inquiry: AdmissionInquiry, options: Options) {
  const available: InquiryActionId[] = [
    ...(inquiry.applicantId ? (['applicant360'] as const) : []),
    ...(options.canManage ? (['manage'] as const) : []),
    ...(options.canAssign && inquiry.admissionOfferingId ? (['assign'] as const) : []),
    ...(options.canCommunicate ? (['communicate'] as const) : []),
    ...(options.canManage && inquiry.status === 0 ? (['markContacted'] as const) : []),
  ];

  return {
    direct: available.slice(0, 3),
    overflow: available.slice(3),
  };
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
      render: (value) => formatAdmissionReference(String(value)),
    },
    {
      id: 'applicantName',
      label: 'Applicant',
      minWidth: 220,
      sticky: true,
      stickyPosition: 'left',
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
    { id: 'normalizedPhone', label: 'Phone', minWidth: 140, filterType: 'string' },
    { id: 'email', label: 'Email', minWidth: 220, filterType: 'string' },
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
      sticky: true,
      stickyPosition: 'right',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_, row) => {
        const inquiry = row as AdmissionInquiry;
        const plan = getAdmissionInquiryActionPlan(inquiry, options);
        if (plan.direct.length === 0 && plan.overflow.length === 0) return null;
        const reference = formatAdmissionReference(inquiry.inquiryNumber);
        const directActions = plan.direct.flatMap((action) => {
          if (action === 'applicant360' || action === 'manage') return [];
          if (action === 'assign') {
            return [
              {
                id: 'assign',
                label: `${inquiry.assignedCounsellorId ? 'Reassign' : 'Assign'} counsellor for ${inquiry.applicantName}`,
                icon: 'mdi:account-arrow-right-outline',
                onClick: () => options.onAssign(inquiry),
              },
            ];
          }
          if (action === 'communicate') {
            return [
              {
                id: 'communicate',
                label: `Compose communication for ${inquiry.applicantName}`,
                icon: 'mdi:message-text-outline',
                onClick: () => options.onCommunicate(inquiry),
              },
            ];
          }
          return [
            {
              id: 'mark-contacted',
              label: `Mark ${inquiry.applicantName} contacted`,
              icon: 'mdi:phone-check-outline',
              disabled: options.isMarkingContacted,
              onClick: () => options.onMarkContacted(inquiry),
            },
          ];
        });

        return (
          <ThreeDotsActions
            placement="right-top"
            showViewIcon={plan.direct.includes('applicant360')}
            showEditIcon={plan.direct.includes('manage')}
            showThreeDots={plan.overflow.length > 0}
            viewIcon="mdi:account-circle-outline"
            viewLabel={`Open Applicant 360 for ${inquiry.applicantName}`}
            editLabel={`Manage inquiry ${reference}`}
            moreLabel={`More actions for ${reference}`}
            handleViewClick={() => options.onOpenApplicant360(inquiry)}
            handleEditClick={() => options.onManage(inquiry)}
            directActions={directActions}
            actions={({ popover }) => (
              <MenuList dense>
                {plan.overflow.includes('assign') && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      options.onAssign(inquiry);
                    }}
                  >
                    <Iconify icon="mdi:account-arrow-right-outline" sx={{ mr: 1 }} />
                    {inquiry.assignedCounsellorId ? 'Reassign counsellor' : 'Assign counsellor'}
                  </MenuItem>
                )}
                {plan.overflow.includes('communicate') && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      options.onCommunicate(inquiry);
                    }}
                  >
                    <Iconify icon="mdi:message-text-outline" sx={{ mr: 1 }} />
                    Compose communication
                  </MenuItem>
                )}
                {plan.overflow.includes('markContacted') && (
                  <MenuItem
                    disabled={options.isMarkingContacted}
                    onClick={() => {
                      popover.onClose();
                      options.onMarkContacted(inquiry);
                    }}
                  >
                    <Iconify icon="mdi:phone-check-outline" sx={{ mr: 1 }} />
                    Mark contacted
                  </MenuItem>
                )}
              </MenuList>
            )}
          />
        );
      },
    },
  ];
}
