import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import NextLink from 'next/link';
import { Stack, Button } from '@mui/material';

import { inquirySourceLabel, inquiryStatusLabel } from './admission-inquiry-list-options';

type Options = {
  canManage: boolean;
  isMarkingContacted: boolean;
  onManage: (inquiry: AdmissionInquiry) => void;
  onMarkContacted: (inquiry: AdmissionInquiry) => void;
};

export function buildAdmissionInquiryColumns(options: Options): IColumn[] {
  return [
    { id: 'inquiryNumber', label: 'Inquiry', minWidth: 140 },
    {
      id: 'applicantName',
      label: 'Applicant',
      minWidth: 220,
      render: (value, row) => {
        const inquiry = row as AdmissionInquiry;
        return inquiry.applicantId ? (
          <NextLink href={`/student/admissions/applicants/${inquiry.applicantId}`}>
            {String(value)}
          </NextLink>
        ) : String(value);
      },
    },
    { id: 'normalizedPhone', label: 'Phone', minWidth: 140 },
    { id: 'email', label: 'Email', minWidth: 220 },
    { id: 'lastActivityAt', label: 'Last activity', minWidth: 160 },
    { id: 'status', label: 'Status', minWidth: 140, render: inquiryStatusLabel },
    { id: 'source', label: 'Source', minWidth: 130, render: inquirySourceLabel },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 190,
      excludeFromExport: true,
      render: (_, row) => {
        const inquiry = row as AdmissionInquiry;
        if (!options.canManage) return null;
        return (
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="contained" onClick={() => options.onManage(inquiry)}>
              Manage
            </Button>
            {inquiry.status === 0 && (
              <Button
                size="small"
                variant="outlined"
                disabled={options.isMarkingContacted}
                onClick={() => options.onMarkContacted(inquiry)}
              >
                Contacted
              </Button>
            )}
          </Stack>
        );
      },
    },
  ];
}
