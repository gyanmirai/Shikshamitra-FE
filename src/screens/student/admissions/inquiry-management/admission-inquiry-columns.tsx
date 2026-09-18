import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import NextLink from 'next/link';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { studentPaths } from 'src/constants/student-menu';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Stack, MenuItem, MenuList, Typography } from '@mui/material';

import { inquiryWorkState } from './admission-inquiry-work-state';
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

export function buildAdmissionInquiryColumns(options: Options): IColumn[] {
  return [
    { id: 'inquiryNumber', label: 'Inquiry', minWidth: 140, filterType: 'string' },
    {
      id: 'applicantName',
      label: 'Applicant',
      minWidth: 220,
      render: (value, row) => {
        const inquiry = row as AdmissionInquiry;
        return inquiry.applicantId ? (
          <NextLink href={`${studentPaths.enrollment.root}/applicants/${inquiry.applicantId}`}>
            {String(value)}
          </NextLink>
        ) : (
          String(value)
        );
      },
    },
    {
      id: 'admissionOfferingCode',
      label: 'Admission interest',
      minWidth: 190,
      isFilter: false,
      render: (value, row) => {
        const inquiry = row as AdmissionInquiry;
        return (
          <Stack spacing={0.25}>
            <Typography variant="body2">{value ? String(value) : 'Cycle inquiry'}</Typography>
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
      filterType: 'string',
      render: (value, row) => {
        const inquiry = row as AdmissionInquiry;
        return value
          ? inquiry.assignedCounsellorName || options.counsellorNames[String(value)] || 'Assigned'
          : 'Unassigned';
      },
    },
    {
      id: 'work',
      label: 'Next action',
      minWidth: 210,
      isSort: false,
      isFilter: false,
      render: (_, row) => {
        const work = inquiryWorkState(row as AdmissionInquiry);
        return (
          <Stack spacing={0.5} alignItems="flex-start">
            <Label color={work.color}>{work.label}</Label>
            {work.detail && (
              <Typography variant="caption" color="text.secondary">
                {work.detail}
              </Typography>
            )}
          </Stack>
        );
      },
    },
    {
      id: 'lastActivityAt',
      label: 'Last activity',
      minWidth: 170,
      filterType: 'dateTime',
      render: (value) => (value ? fDateTime(String(value)) : '—'),
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
      id: 'actions',
      label: 'Actions',
      minWidth: 190,
      sticky: true,
      stickyPosition: 'right',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_, row) => {
        const inquiry = row as AdmissionInquiry;
        if (!options.canManage && !options.canAssign && !options.canCommunicate) return null;
        return (
          <ThreeDotsActions
            placement="right-top"
            moreLabel={`Actions for ${inquiry.inquiryNumber}`}
            actions={({ popover }) => (
              <MenuList dense>
                {options.canManage && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      options.onManage(inquiry);
                    }}
                  >
                    <Iconify icon="mdi:clipboard-account-outline" sx={{ mr: 1 }} />
                    Manage inquiry
                  </MenuItem>
                )}
                {options.canAssign && inquiry.admissionOfferingId && (
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
                {options.canCommunicate && (
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
                {options.canManage && inquiry.status === 0 && (
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
