import type { AdmissionFormSectionVerification } from 'src/redux/student/admissions/admission-form-stage-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { Stack, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

export function FormStageSectionList({
  sections,
  disabled,
  onVerify,
  onRevoke,
  compact = false,
}: {
  sections: AdmissionFormSectionVerification[];
  disabled: boolean;
  onVerify: (section: AdmissionFormSectionVerification) => void;
  onRevoke: (section: AdmissionFormSectionVerification) => void;
  compact?: boolean;
}) {
  const required = sections.filter((section) => section.required);
  if (!required.length) return null;
  return (
    <>
      {!compact && <Typography variant="subtitle2">Section verification</Typography>}
      {/* Embedded verification records: the surrounding form remains the primary task. */}
      <CustomizableTable
        tableId="admission-form-section-verification"
        tableTitle="Section verification"
        data={required}
        isSearch={false}
        isFilter={false}
        isPagination={false}
        isShowedDense={false}
        wrapperProps={{ sx: { minWidth: 0, minHeight: 0 } }}
        tableContainerProps={{ sx: { minWidth: 0 }, 'aria-label': 'Section verification' }}
        columns={[
          {
            id: 'sectionName',
            label: 'Section',
            filterType: 'string',
            minWidth: 180,
            isSort: false,
            isFilter: false,
            render: (_, row) => {
              const section = row as AdmissionFormSectionVerification;
              return (
                <Stack spacing={0.25} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {section.sectionName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {section.verifiedAt
                      ? `Verified ${fDateTime(section.verifiedAt)}`
                      : 'Waiting for staff verification'}
                  </Typography>
                </Stack>
              );
            },
          },
          {
            id: 'verified',
            label: 'Status',
            filterType: 'enum',
            enumOptions: [
              { label: 'Pending', value: false },
              { label: 'Verified', value: true },
            ],
            isSort: false,
            isFilter: false,
            width: 110,
            sticky: true,
            stickyPosition: 'right',
            stickyOnMobile: false,
            render: (_, row) => {
              const section = row as AdmissionFormSectionVerification;
              return (
                <Label
                  color={section.verified ? 'success' : 'warning'}
                  startIcon={
                    <Iconify
                      icon={section.verified ? 'mdi:check-circle-outline' : 'mdi:clock-outline'}
                    />
                  }
                >
                  {section.verified ? 'Verified' : 'Pending'}
                </Label>
              );
            },
          },
          {
            id: 'actions',
            label: 'Action',
            width: 100,
            align: 'right',
            isSort: false,
            isFilter: false,
            sticky: true,
            stickyPosition: 'right',
            excludeFromExport: true,
            render: (_, row) => {
              const section = row as AdmissionFormSectionVerification;
              return (
                <Button
                  size="small"
                  variant={section.verified ? 'outlined' : 'contained'}
                  disabled={disabled}
                  aria-label={`${section.verified ? 'Reopen' : 'Verify'} ${section.sectionName}`}
                  onClick={() => (section.verified ? onRevoke(section) : onVerify(section))}
                >
                  {section.verified ? 'Reopen' : 'Verify'}
                </Button>
              );
            },
          },
        ]}
      />
    </>
  );
}
